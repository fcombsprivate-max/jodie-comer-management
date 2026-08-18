"""Source freely-licensed imagery for the site.



Queries the real Wikimedia Commons API (and Openverse for CC0 textures),
reports the licence for every candidate, and downloads selected files.

Usage:
    python tools/fetch_images.py search      # list candidates + licences
    python tools/fetch_images.py download    # fetch selected files
"""

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


UA = "JodieComerSiteBuild/1.0 (local development; contact: site owner)"
ASSETS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets")
COMMONS = "https://commons.wikimedia.org/w/api.php"
OPENVERSE = "https://api.openverse.org/v1/images/"


def get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.loads(r.read().decode("utf-8", "replace"))


def strip_html(text):
    out, depth = [], 0
    for ch in text or "":
        if ch == "<":
            depth += 1
        elif ch == ">":
            depth -= 1
        elif depth == 0:
            out.append(ch)
    return " ".join("".join(out).split())


def commons_search(term, limit=20):
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": term,
        "gsrnamespace": "6",
        "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata",
        "iiurlwidth": "2000",
        "format": "json",
    }
    data = get_json(COMMONS + "?" + urllib.parse.urlencode(params))
    pages = (data.get("query") or {}).get("pages") or {}
    results = []
    for page in pages.values():
        info = (page.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata") or {}
        def m(key):
            return strip_html((meta.get(key) or {}).get("value", ""))
        results.append({
            "title": page.get("title", ""),
            "license": m("LicenseShortName") or "unknown",
            "license_url": m("LicenseUrl"),
            "artist": m("Artist"),
            "credit": m("Credit"),
            "width": info.get("width", 0),
            "height": info.get("height", 0),
            "url": info.get("url", ""),
            "thumb": info.get("thumburl", ""),
            "page": info.get("descriptionurl", ""),
        })
    results.sort(key=lambda r: r["width"] * r["height"], reverse=True)
    return results


def openverse_search(term, limit=12):
    params = {"q": term, "license": "cc0,pdm", "page_size": str(limit), "mature": "false"}
    try:
        data = get_json(OPENVERSE + "?" + urllib.parse.urlencode(params))
    except Exception as exc:
        print("  Openverse unavailable: %s" % exc)
        return []
    out = []
    for item in data.get("results", []):
        out.append({
            "title": item.get("title") or item.get("id"),
            "license": (item.get("license") or "").upper() + " " + (item.get("license_version") or ""),
            "artist": item.get("creator") or "Unknown",
            "width": item.get("width") or 0,
            "height": item.get("height") or 0,
            "url": item.get("url", ""),
            "page": item.get("foreign_landing_url", ""),
        })
    out.sort(key=lambda r: (r["width"] or 0) * (r["height"] or 0), reverse=True)
    return out


def show(rows, label):
    print("\n" + "=" * 78)
    print(label + "  (%d results)" % len(rows))
    print("=" * 78)
    if not rows:
        print("  none found")
    for i, r in enumerate(rows, 1):
        print("\n[%02d] %s" % (i, r["title"]))
        print("     licence : %s" % r["license"])
        print("     author  : %s" % (r.get("artist") or "unknown")[:96])
        print("     size    : %sx%s" % (r["width"], r["height"]))
        print("     file    : %s" % r["url"])
        if r.get("page"):
            print("     source  : %s" % r["page"])


def do_search():
    for term in ["Jodie Comer", "Jodie Comer 2021", "Prima Facie play"]:
        show(commons_search(term), "WIKIMEDIA COMMONS: " + term)
    for term in ["theatre stage lighting", "cinema auditorium dark", "film grain texture"]:
        show(openverse_search(term), "OPENVERSE (CC0/PDM): " + term)


def resolve(title, width):
    """Look up a Commons file by exact title, returning a scaled URL + licence data."""
    params = {
        "action": "query",
        "titles": title,
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata",
        "iiurlwidth": str(width),
        "format": "json",
    }
    data = get_json(COMMONS + "?" + urllib.parse.urlencode(params))
    pages = (data.get("query") or {}).get("pages") or {}
    for page in pages.values():
        if "missing" in page or not page.get("imageinfo"):
            continue
        info = page["imageinfo"][0]
        meta = info.get("extmetadata") or {}
        def m(key):
            return strip_html((meta.get(key) or {}).get("value", ""))
        return {
            "url": info.get("thumburl") or info.get("url"),
            "license": m("LicenseShortName") or "unknown",
            "license_url": m("LicenseUrl"),
            "artist": m("Artist") or "Unknown",
            "page": info.get("descriptionurl", ""),
        }
    return None


def download(url, filename, attempts=5):
    """Download with backoff — Wikimedia rate-limits bursts with HTTP 429."""
    os.makedirs(ASSETS, exist_ok=True)
    dest = os.path.join(ASSETS, filename)
    delay = 4
    for attempt in range(1, attempts + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=180) as r:
                data = r.read()
            with open(dest, "wb") as f:
                f.write(data)
            return os.path.getsize(dest) / 1024
        except urllib.error.HTTPError as exc:
            if exc.code in (429, 503) and attempt < attempts:
                wait = int(exc.headers.get("Retry-After") or delay)
                print("          rate limited, waiting %ds (attempt %d/%d)" % (wait, attempt, attempts))
                time.sleep(wait)
                delay = min(delay * 2, 60)
                continue
            raise
    raise RuntimeError("exhausted retries")


def do_download():
    """Resolve each pick against Commons, download it, and record its licence.

    Safe to re-run: existing files are skipped and prior attribution records kept.
    """
    here = os.path.dirname(os.path.abspath(__file__))
    picks = json.load(open(os.path.join(here, "picks.json"), encoding="utf-8"))
    att_path = os.path.join(ASSETS, "attribution.json")

    records = {}
    if os.path.exists(att_path):
        try:
            for r in json.load(open(att_path, encoding="utf-8")):
                records[r["filename"]] = r
        except Exception:
            pass

    print("Processing %d files into assets/ (existing files are skipped)\n" % len(picks))
    for p in picks:
        name = p["filename"]
        dest = os.path.join(ASSETS, name)
        if os.path.exists(dest) and os.path.getsize(dest) > 8192 and name in records:
            print("  exists  %-20s %7.1f KB" % (name, os.path.getsize(dest) / 1024))
            continue
        try:
            found = resolve(p["title"], p.get("width", 1400))
            if not found or not found["url"]:
                print("  SKIP    %-20s (not found on Commons)" % name)
                continue
            kb = download(found["url"], name)
            print("  saved   %-20s %7.1f KB   %s" % (name, kb, found["license"]))
            records[name] = {
                "filename": name,
                "slot": p.get("slot", ""),
                "title": p["title"].replace("File:", ""),
                "license": found["license"],
                "license_url": found["license_url"],
                "artist": found["artist"],
                "source": found["page"],
            }
            time.sleep(2.5)
        except Exception as exc:
            print("  FAILED  %-20s %s" % (name, exc))

    ordered = [records[p["filename"]] for p in picks if p["filename"] in records]
    with open(att_path, "w", encoding="utf-8") as f:
        json.dump(ordered, f, indent=2, ensure_ascii=False)
    print("\nHave %d/%d files. Wrote assets/attribution.json" % (len(ordered), len(picks)))
    write_attribution_md(ordered)



def write_attribution_md(records):
    """Generate the human-readable credits file required by CC BY / CC BY-SA."""
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    lines = [
        "# Photography Attribution",
        "",
        "All imagery on this site is used under free/open licences sourced from",
        "Wikimedia Commons. Creative Commons BY and BY-SA licences **legally require**",
        "credit, so this file must remain published alongside the site.",
        "",
        "| File | Original | Author | Licence | Source |",
        "| --- | --- | --- | --- | --- |",
    ]
    for r in records:
        lines.append("| `%s` | %s | %s | %s | [Commons](%s) |" % (
            r["filename"], r["title"], r["artist"], r["license"], r["source"]))
    lines += [
        "",
        "## Licence notes",
        "",
        "- **CC0 / Public domain** — no attribution legally required (credited anyway).",
        "- **CC BY** — attribution required.",
        "- **CC BY-SA** — attribution required, and share-alike terms apply to derivatives.",
        "",
        "Replace these files with officially supplied press assets when available,",
        "then update this table accordingly.",
        "",
    ]
    with open(os.path.join(root, "ATTRIBUTION.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("Wrote ATTRIBUTION.md")
    write_credits_js(records)


def write_credits_js(records):
    """Emit credits as JS so they render even when opened via file:// (no fetch)."""
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    seen, unique = set(), []
    for r in records:
        key = (r["title"], r["artist"], r["license"])
        if key in seen:
            continue
        seen.add(key)
        unique.append({
            "title": r["title"],
            "artist": r["artist"],
            "license": r["license"],
            "source": r["source"],
        })
    body = json.dumps(unique, indent=2, ensure_ascii=False)
    out = (
        "/* AUTO-GENERATED by tools/fetch_images.py — do not edit by hand.\n"
        "   Photography credits for images in assets/.\n"
        "   CC BY and CC BY-SA licences legally require this attribution. */\n"
        "window.PHOTO_CREDITS = " + body + ";\n"
    )
    with open(os.path.join(root, "js", "photo-credits.js"), "w", encoding="utf-8") as f:
        f.write(out)
    print("Wrote js/photo-credits.js (%d unique sources)" % len(unique))


def do_credits():
    """Regenerate credit files from the existing attribution.json (no downloads)."""
    path = os.path.join(ASSETS, "attribution.json")
    records = json.load(open(path, encoding="utf-8"))
    write_attribution_md(records)


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "search"
    if mode == "download":
        do_download()
    elif mode == "credits":
        do_credits()
    else:
        do_search()



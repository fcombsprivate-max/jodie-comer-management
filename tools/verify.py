"""Sanity-check the site wiring.

Verifies that:
  1. every data-img key in the HTML exists in the site-config images manifest
  2. every manifest file actually exists on disk and is a plausible size
  3. every page loads site-config.js, photo-credits.js and main.js
  4. the required attribution artefacts are present

Run:  python tools/verify.py
"""

import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ["index.html", "about.html", "work.html", "awards.html",
         "contact.html", "privacy.html", "terms.html"]

errors, warnings = [], []


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return f.read()


# ---- 1. parse the images manifest out of site-config.js --------------------
cfg = read(os.path.join("js", "site-config.js"))
block = re.search(r"images:\s*\{(.*?)\n  \}", cfg, re.S)
manifest = {}
if not block:
    errors.append("could not locate the `images` manifest in js/site-config.js")
else:
    for key, file in re.findall(r'(\w+):\s*\{\s*file:\s*"([^"]+)"', block.group(1)):
        manifest[key] = file
    print("manifest entries : %d" % len(manifest))

# ---- 2. check files exist -------------------------------------------------
for key, rel in sorted(manifest.items()):
    path = os.path.join(ROOT, rel)
    if not os.path.exists(path):
        errors.append("manifest '%s' -> missing file %s" % (key, rel))
    else:
        kb = os.path.getsize(path) / 1024
        if kb < 8:
            warnings.append("%s is suspiciously small (%.1f KB)" % (rel, kb))

# ---- 3. check every slot used in HTML resolves ----------------------------
used = set()
for name in PAGES:
    html = read(name)
    keys = re.findall(r'data-img="([^"]+)"', html)
    used.update(keys)

    for key in keys:
        if key not in manifest:
            errors.append("%s references unknown image key '%s'" % (name, key))

    for script in ["js/site-config.js", "js/photo-credits.js", "js/main.js"]:
        if script not in html:
            errors.append("%s does not load %s" % (name, script))

print("slots in markup  : %d unique keys across %d pages" % (len(used), len(PAGES)))

unused = set(manifest) - used
if unused:
    warnings.append("manifest keys never used in markup: " + ", ".join(sorted(unused)))

# ---- 4. attribution artefacts --------------------------------------------
for rel in ["ATTRIBUTION.md", "js/photo-credits.js",
            os.path.join("assets", "attribution.json")]:
    if not os.path.exists(os.path.join(ROOT, rel)):
        errors.append("missing required attribution artefact: %s" % rel)

records = json.load(open(os.path.join(ROOT, "assets", "attribution.json"), encoding="utf-8"))
needs_credit = [r for r in records if "BY" in r["license"].upper()]
print("licence records  : %d total, %d require attribution" % (len(records), len(needs_credit)))

# ---- report ---------------------------------------------------------------
print("")
for w in warnings:
    print("  WARN  %s" % w)
for e in errors:
    print("  FAIL  %s" % e)

if not errors:
    print("  PASS  all image slots resolve, all files present, all scripts loaded.")

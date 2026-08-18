/* Runtime smoke test.
   `node --check` only validates syntax. This actually EXECUTES the site
   scripts against a minimal stub DOM, so a top-level runtime error (which
   would silently kill every dynamic feature in the browser) is surfaced.

   Run:  node tools/runtime_check.js
*/

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.dirname(__dirname);

// --- minimal element stub --------------------------------------------------
function el(attrs) {
  attrs = attrs || {};
  return {
    _attrs: attrs,
    _classes: new Set((attrs.class || "").split(" ").filter(Boolean)),
    _props: {},
    style: {
      setProperty(k, v) { this._store = this._store || {}; this._store[k] = v; },
      get _all() { return this._store || {}; }
    },
    classList: {
      _o: null,
      add(c) { this._o._classes.add(c); },
      remove(c) { this._o._classes.delete(c); },
      toggle(c, on) { on ? this._o._classes.add(c) : this._o._classes.delete(c); },
      contains(c) { return this._o._classes.has(c); }
    },
    getAttribute(n) { return this._attrs[n] === undefined ? null : this._attrs[n]; },
    setAttribute(n, v) { this._attrs[n] = v; },
    removeAttribute(n) { delete this._attrs[n]; },
    addEventListener() {},
    appendChild() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    insertAdjacentHTML() {},
    closest() { return null; },
    contains() { return false; },
    focus() {},
    textContent: "",
    innerHTML: "",
    hidden: false,
    children: []
  };
}
function mk(attrs) { const e = el(attrs); e.classList._o = e; return e; }

// The image slots the real pages contain.
const slots = ["hero", "portrait", "profile", "film", "television", "theatre",
               "primaFacie", "awards", "film1", "film2", "film3"]
  .map(k => mk({ "data-img": k, class: "media" }));

const listeners = {};
const document = {
  documentElement: mk({}),
  body: mk({}),
  addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
  querySelector(sel) { return sel.includes("[data-img]") ? slots[0] : null; },
  querySelectorAll(sel) { return sel.includes("data-img") ? slots : []; },
  createElement() { return mk({}); },
  getElementById() { return null; }
};

const sandbox = {
  console,
  document,
  setTimeout,
  clearTimeout,
  location: { pathname: "/index.html", href: "http://localhost:5500/index.html" },
  navigator: { userAgent: "node" },
  IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
  matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
  scrollY: 0,
  innerWidth: 1440,
  innerHeight: 900,
  addEventListener() {},
  fetch: () => Promise.resolve({ ok: true })
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

// --- execute the three scripts in order, exactly like the page does -------
let failed = false;
for (const rel of ["js/site-config.js", "js/photo-credits.js", "js/main.js"]) {
  try {
    vm.runInContext(fs.readFileSync(path.join(ROOT, rel), "utf8"), sandbox, { filename: rel });
    console.log("loaded  " + rel);
  } catch (e) {
    failed = true;
    console.log("ERROR   " + rel + "  ->  " + e.message);
    console.log(String(e.stack).split("\n").slice(0, 4).join("\n"));
  }
}

// --- fire DOMContentLoaded ------------------------------------------------
console.log("\nfiring DOMContentLoaded (" + ((listeners.DOMContentLoaded || []).length) + " listener/s)");
for (const fn of listeners.DOMContentLoaded || []) {
  try {
    fn();
  } catch (e) {
    failed = true;
    console.log("ERROR during init  ->  " + e.message);
    console.log(String(e.stack).split("\n").slice(0, 6).join("\n"));
  }
}

// --- report what actually landed on the elements --------------------------
console.log("");
let applied = 0;
for (const s of slots) {
  const img = s.style.backgroundImage;
  const has = s.classList.contains("has-img");

  /* Regression guard. The image MUST be a document-relative "assets/..." path
     applied straight to background-image. It was previously passed through a
     `--img` custom property, and because a url() inside a custom property
     resolves against the stylesheet rather than the document, every path
     silently became "css/assets/..." and 404'd. Fail loudly if that returns. */
  const ok = img && has && /url\('assets\//.test(img);

  if (ok) applied++;
  else console.log("  NOT APPLIED  " + s.getAttribute("data-img") +
                   "  (backgroundImage=" + img + ", has-img=" + has + ")");
}
console.log("  " + applied + "/" + slots.length +
            " slots received a document-relative background-image and .has-img");

process.exit(failed || applied !== slots.length ? 1 : 0);

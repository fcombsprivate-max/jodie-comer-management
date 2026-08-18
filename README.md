 # Jodie Comer — Professional Talent Representation Website

A premium, minimalist, editorial static website functioning as a professional representation and
information platform. Its purpose is to introduce Jodie Comer, present selected professional work,
and route legitimate professional inquiries to the management team.

**Communication flow enforced throughout the site:**

> Professional visitor → Management contact → Management reviews inquiry → Management coordinates with talent where appropriate

---

## 1. Run locally

No build step, no dependencies. Either open `index.html` directly, or serve the folder:

```bat
cd /d "C:\Users\USER\Desktop\jodie-comer-management"
python -m http.server 5500
```

Then visit `http://localhost:5500`.

---

## 2. Files

```
jodie-comer-management/
├── index.html        Home — hero, introduction, selected work, Prima Facie, awards, opportunities
├── about.html        About — biography, professional profile facts, career overview
├── work.html         Selected Work — Film / Television / Theatre + Prima Facie feature
├── awards.html       Awards & Recognition
├── contact.html      Contact Management — opportunities, inquiry form, official channels
├── privacy.html      Privacy Policy (template — complete before publishing)
├── terms.html        Terms of Use (template — complete before publishing)
├── ATTRIBUTION.md    Photography credits (required by the CC licences in use)
├── css/styles.css    Full design system
├── js/site-config.js ← THE ONLY FILE YOU NORMALLY NEED TO EDIT (contacts + image manifest)
├── js/main.js        Interactions, contact binding, form handling, image application
├── js/photo-credits.js  Auto-generated footer credits — do not edit by hand
├── tools/            Image sourcing tooling (fetch_images.py, picks.json)
└── assets/           Photography + per-file licence record (attribution.json)
```


---

## 3. REQUIRED: add verified contact details

**No email address, phone number, WhatsApp number or social account has been invented.** Every
contact value ships empty. While a value is empty the site displays a visible
`AWAITING VERIFIED DETAILS` placeholder and the related button is automatically disabled — so the
site can never present a fake channel as official.

Open `js/site-config.js` and fill in **verified, official business details only**:

```js
managementEmail:    "",   // verified official management email
managementWhatsApp: "",   // digits only, no "+", spaces or dashes
managementPhone:    "",   // optional, display only
formEndpoint:       "",   // optional form service URL
```

Rules built into this project:

- Do **not** enter a personal phone number or personal email address.
- Do **not** list fan accounts as official accounts.
- Leave anything unverified empty rather than guessing.

### WhatsApp format

Digits only, international format, no symbols. The site builds the link as
`https://wa.me/<digits>?text=<prefilled professional message>`. The button and all supporting copy
identify the destination as the **management team**, never Jodie Comer personally.

### Verified social accounts

In `js/site-config.js`, add a URL only for accounts independently verified as official:

```js
social: [
  { label: "Instagram", url: "" },
  { label: "X", url: "" }
]
```

If every URL is empty, the entire "Follow Jodie" section stays hidden. Nothing fake is rendered.

---

## 4. Inquiry form delivery

The form validates inline, then delivers in one of three ways:

1. **`formEndpoint` set** → posts via `fetch` to your endpoint (e.g. a form service or your own API).
2. **`formEndpoint` empty, `managementEmail` set** → builds a formatted `mailto:` to the management address.
3. **Both empty** → shows a clear notice that the form is not yet connected. No inquiry is silently lost.

On success the visitor sees:

> Thank you. Your inquiry has been received by the management team.

The confirmation, the form footnote and the process section all state that submissions reach the
management team — never that Jodie received the message personally.

---

## 5. Photography

### Current state

The site ships with **11 freely licensed photographs** in `assets/`, sourced from Wikimedia Commons
via the Wikimedia API. They are real photographs of Jodie Comer from premieres, awards ceremonies
and press events — **not** official press assets. They exist so the layout can be judged with real
imagery instead of grey boxes.

### How images are wired

Images are declared once, centrally, in the `images` manifest in `js/site-config.js`:

```js
images: {
  hero:     { file: "assets/hero.jpg",     pos: "center 20%" },
  portrait: { file: "assets/portrait.jpg", pos: "center 22%" },
  // ...
}
```

Markup only names a slot; `js/main.js` applies the file and focal point:

```html
<div class="hero__media" data-img="hero" role="img" aria-label="..."></div>
<div class="media ratio-3-4" data-img="film"></div>
```

If a key is missing from the manifest that slot falls back to its labelled placeholder, so a partial
manifest never produces a broken image.

All photography receives a shared editorial grade (desaturated, slight contrast lift, faint warm
tint) defined in section 16 of `css/styles.css`. That is what makes photos from many different
photographers read as one coherent visual language. Adjust `--grade` to taste.

### ⚠️ Licensing obligations — do not skip

The bundled files are a mix of **CC0**, **CC BY 3.0** and **CC BY-SA 2.0**. CC BY and CC BY-SA
**legally require** attribution. The project satisfies this in three places:

| Artefact | Purpose |
| --- | --- |
| `ATTRIBUTION.md` | Human-readable table: file, author, licence, source URL |
| `assets/attribution.json` | Machine-readable per-file licence record |
| Footer "Photography" block | Visible on-page credit, rendered from `js/photo-credits.js` |

Do **not** remove the footer credit block or `ATTRIBUTION.md` while these files are in use. Note
also that CC BY-SA carries share-alike obligations for derivative works.

### Replacing with official press assets

1. Drop the supplied file into `assets/` (reuse the filename, or point the manifest at a new one).
2. Update `ATTRIBUTION.md` and `terms.html` §7 to record the real rights holder.
3. Once **no** Creative Commons imagery remains, you may set `showPhotoCredits: false` in
   `js/site-config.js` to hide the credit block.

Suggested sizes: hero ~2400px wide, portraits ~1200px wide, all optimised.

### Re-running the image tooling

```bash
python tools/fetch_images.py search     # list candidates with their licences
python tools/fetch_images.py download   # fetch picks (skips files already present)
python tools/fetch_images.py credits    # regenerate ATTRIBUTION.md + photo-credits.js
```

`tools/picks.json` is the editable list of chosen Commons files and their target slots.


---

## 6. Content integrity

Career information is limited to publicly documented professional facts: Liverpool origin,
born 11 March 1993, active 2007–present, early television work, *Killing Eve* (2018–2022) as
Villanelle / Oksana Astankova, film work including *Free Guy*, *The Last Duel*, *The Bikeriders*,
*The End We Start From* and *28 Years Later*, and *Prima Facie* as Tessa Ensler.

Deliberate safeguards:

- **Award years are not guessed.** Confirmed items show a year; anything unconfirmed shows a
  `Year to verify` marker for you to replace after checking the awarding body.
- **Prima Facie tour information is labelled as current/tour information**, not as a permanent career
  credit, and flags that 2026-dated details must be re-confirmed before publication.
- **Earlier television credits are labelled "Selected"** rather than carrying invented broadcast years.
- No private addresses, personal numbers or personal-life details appear anywhere.

Anything else you add should be verified against documented sources first.

---

## 7. Pre-launch checklist

- [ ] Verified management email added to `js/site-config.js`
- [ ] Verified management WhatsApp number added (digits only)
- [ ] Form delivery confirmed with a live test submission
- [ ] Official press photography obtained and placed in `assets/`, replacing the
      Creative Commons placeholders, with `ATTRIBUTION.md` updated
- [ ] Footer photography credits retained for as long as any CC BY / CC BY-SA image is in use
- [ ] `unofficialNotice` set to `false` only once the site is genuinely authorised
- [ ] Award years verified and `Year to verify` markers replaced
- [ ] Prima Facie tour/production status re-confirmed

- [ ] Only verified official social accounts added
- [ ] `privacy.html` and `terms.html` completed and legally reviewed
- [ ] Site owner name and legal email set in `js/site-config.js`

---

## 8. Design & technical notes

- **Aesthetic:** editorial luxury — black, warm off-white, subtle neutrals, one restrained bronze accent.
- **Typography:** Cormorant Garamond (display) with Inter (interface), generous whitespace, no gradients or flashy effects.
- **Motion:** subtle IntersectionObserver reveals and a slow hero scale, fully disabled under `prefers-reduced-motion`.
- **Responsive:** fluid `clamp()` scale throughout, mobile hamburger menu, stacked credit and award rows on small screens.
- **Accessibility:** skip link, visible focus rings, labelled fields with inline errors, ARIA live regions, semantic landmarks.
- **Performance:** static HTML/CSS/JS, no frameworks, no bundler, no tracking.

### Known pitfall: never put the image `url()` inside a CSS variable

`js/main.js` sets `element.style.backgroundImage` **directly**. Do not
"tidy" this into a custom property such as `--img` consumed by
`background-image: var(--img)` in the stylesheet.

A `url()` travelling through a custom property is resolved relative to the
**stylesheet that consumes it**, not the document. Because the stylesheet
lives in `css/`, every manifest path silently became:

```
css/assets/hero.jpg      ← 404, placeholder shown instead
```

This fails invisibly: the manifest, the `data-img` slots, the files on disk
and the generated DOM are all perfectly correct, so file-level and DOM-level
checks pass while nothing renders. It has to be caught by inspecting
**computed** styles in a real browser.

`tools/runtime_check.js` now asserts that each slot receives a
document-relative `assets/...` background, so a regression fails loudly.

### Verifying visual changes

```bat
python tools/verify.py          :: manifest, slots, files, script tags
node tools/runtime_check.js     :: executes the scripts, checks applied styles
```

Both passing still only proves the wiring is sound — confirm imagery actually
paints in a browser before considering visual work done.



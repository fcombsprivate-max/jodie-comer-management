 ASSETS — PHOTOGRAPHY
====================

This folder contains 11 freely licensed photographs downloaded from
Wikimedia Commons by tools/fetch_images.py.

IMPORTANT: These are NOT official press assets. They are red-carpet, awards
and press-event photographs published under free licences. They are used here
so the layout can be evaluated with real imagery.

LICENSING — PLEASE READ
-----------------------
The files carry a mix of licences:

  CC0          no attribution legally required
  CC BY 3.0    attribution REQUIRED
  CC BY-SA 2.0 attribution REQUIRED + share-alike applies to derivatives

Because CC BY / CC BY-SA files are in use, the site renders a visible
"Photography" credit block in the footer, and ../ATTRIBUTION.md lists every
file with its author, licence and source URL. Do not remove either while
these files remain in use — that would breach the licence terms.

Per-file licence data: assets/attribution.json (machine readable)
Human-readable table:  ../ATTRIBUTION.md
Footer credit source:  ../js/photo-credits.js (auto-generated)

REPLACING WITH OFFICIAL ASSETS
------------------------------
1. Drop the officially supplied file into this folder using the same
   filename, or point to a new filename in the `images` manifest in
   js/site-config.js.
2. Update ../ATTRIBUTION.md to reflect the new source and licence.
3. If NO Creative Commons imagery remains, you may set
   `showPhotoCredits: false` in js/site-config.js.

FILES AND THEIR SLOTS
---------------------
  hero.jpg          home page hero background
  portrait.jpg      about page editorial portrait
  profile.jpg       about page professional photography
  film.jpg          home page "Film" discipline card
  television.png    television slots (home + work)

  theatre.jpg       home page "Theatre" discipline card
  prima-facie.jpg   Prima Facie feature blocks (home + work)
  awards.jpg        awards imagery
  film-1.jpg        work page film still 1
  film-2.jpg        work page film still 2
  film-3.jpg        work page film still 3

To re-download or refresh (safe to re-run; existing files are skipped):

    python tools/fetch_images.py download

To regenerate credit files only:

    python tools/fetch_images.py credits

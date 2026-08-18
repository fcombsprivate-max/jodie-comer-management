/* ==========================================================================
   SITE CONFIGURATION — EDIT THIS FILE ONLY
   --------------------------------------------------------------------------
   No contact detail here is invented. Every contact value below is an EMPTY
   PLACEHOLDER. The site owner must insert only VERIFIED, OFFICIAL details.

   RULES
   • Do NOT enter a personal phone number or personal email address.
   • Do NOT enter fan accounts as official accounts.
   • Leave a value as an empty string ("") if it has not been verified.
     Any empty value renders a visible "AWAITING VERIFIED DETAILS"
     placeholder instead of a fake link, and the related button is disabled.

   WHATSAPP FORMAT
     International digits only — no "+", spaces, dashes or brackets.
     Example format only (not a real number): "441234567890"
   ========================================================================== */

window.SITE_CONFIG = {
  /* ---- Representation ------------------------------------------------- */
  agency: "Independent Talent Group",

  /* ---- Official management contact ----------------------------------- */
  // Verified official management email address.
  managementEmail: "personaljodie@comermanagement.team",

  // Verified official management WhatsApp number, digits only.
  managementWhatsApp: "+18052960227",

  // Optional: verified official management telephone number, for display.
  managementPhone: "",

  // Optional: verified agency website URL (e.g. the agency's own site).
  agencyWebsite: "",

  /* ---- Inquiry form delivery ----------------------------------------- */
  // Where the inquiry form posts to. Leave empty to use the built-in
  // mailto fallback (requires managementEmail above).
  // Example: "https://formspree.io/f/xxxxxxx" or your own endpoint.
  formEndpoint: "",

  /* ---- Verified official social accounts ------------------------------
     Add ONLY accounts that have been independently verified as official.
     Anything left empty is not rendered at all.
  --------------------------------------------------------------------- */
  social: [
    { label: "Instagram", url: "" },
    { label: "X", url: "" }
  ],

  /* ---- Status ---------------------------------------------------------
     TRUE  = shows a footer notice stating the site is an unaffiliated
             demonstration project. Keep this TRUE unless the site is
             genuinely operated with written authorisation from the talent
             and their representation.
     FALSE = removes the notice (only appropriate once authorised, using
             officially supplied assets).
  --------------------------------------------------------------------- */
  unofficialNotice: false,

  /* ---- Photography ----------------------------------------------------
     Every file below was sourced from Wikimedia Commons under a free
     licence and downloaded by tools/fetch_images.py. Attribution data
     lives in assets/attribution.json and ATTRIBUTION.md.

     CC BY and CC BY-SA licences LEGALLY REQUIRE credit, which is why the
     footer credit line is rendered automatically. Do not remove it while
     these files are in use.

     To swap in officially supplied press photography later, replace the
     file in assets/ (keeping the same name), or change the "file" value
     here. `pos` controls framing (CSS background-position).
  --------------------------------------------------------------------- */
  showPhotoCredits: false,

  images: {
    hero:         { file: "assets/hero.jpg",        pos: "center 22%" },
    portrait:     { file: "assets/portrait.jpg",    pos: "center 18%" },
    profile:      { file: "assets/profile.jpg",     pos: "center 20%" },
    film:         { file: "assets/film.jpg",        pos: "center 15%" },
    television:   { file: "assets/television.png",  pos: "center 25%" },
    theatre:      { file: "assets/theatre.jpg",     pos: "center 15%" },
    primaFacie:   { file: "assets/prima-facie.jpg", pos: "center 15%" },
    awards:       { file: "assets/awards.jpg",      pos: "center 15%" },
    film1:        { file: "assets/film-1.jpg",      pos: "center 30%" },
    film2:        { file: "assets/film-2.jpg",      pos: "center 30%" },
    film3:        { file: "assets/film-3.jpg",      pos: "center 15%" }
  },

  /* ---- Legal --------------------------------------------------------- */
  siteOwner: "[INSERT SITE OWNER / OPERATOR NAME]",
  legalEmail: "personaljodie@comermanagement.team" // contact address for privacy & legal requests
};

/* ==========================================================================
   JODIE COMER — site interactions
   • header state on scroll
   • mobile menu
   • scroll reveal
   • contact placeholder binding (no invented details)
   • inquiry form validation + confirmation
   • photography from the config manifest + required licence credits
   ========================================================================== */

(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var PLACEHOLDER = "AWAITING VERIFIED DETAILS";

  /* ------------------------------------------------------------ photography */
  /* Applies the `images` manifest from site-config.js to any [data-img] slot.
     If a key is missing the slot keeps its placeholder styling, so a partial
     manifest degrades gracefully rather than showing a broken image. */
  function initImages() {
    var map = CFG.images || {};
    document.querySelectorAll("[data-img]").forEach(function (el) {
      var entry = map[el.getAttribute("data-img")];
      if (!entry || !entry.file) return;

      /* Set background-image DIRECTLY rather than via a `--img` custom
         property. A url() passed through var() is resolved relative to the
         stylesheet that consumes it (css/styles.css), which silently turned
         "assets/hero.jpg" into "css/assets/hero.jpg" and 404'd. An inline
         background-image resolves against the document, which is both correct
         and portable when the site is served from a subdirectory. */
      el.style.backgroundImage = "url('" + entry.file + "')";
      if (entry.pos) el.style.backgroundPosition = entry.pos;
      el.classList.add("has-img");

    });
  }

  /* Renders the photography credit line. CC BY and CC BY-SA REQUIRE
     attribution, so this is a licence obligation, not decoration. */
  function initPhotoCredits() {
    var credits = window.PHOTO_CREDITS || [];
    if (CFG.showPhotoCredits === false || !credits.length) return;

    document.querySelectorAll(".site-footer .container").forEach(function (wrap) {
      var box = document.createElement("div");
      box.className = "photo-credits";

      var heading = document.createElement("h4");
      heading.textContent = "Photography";
      box.appendChild(heading);

      var intro = document.createElement("p");
      intro.className = "photo-credits__intro";
      intro.textContent =
        "Images on this site are used under free licences from Wikimedia Commons. " +
        "They are not official press assets.";
      box.appendChild(intro);

      var list = document.createElement("ul");
      credits.forEach(function (c) {
        var li = document.createElement("li");
        var link = document.createElement("a");
        link.href = c.source;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = c.title;
        li.appendChild(link);
        li.appendChild(document.createTextNode(" — " + c.artist + " · " + c.license));
        list.appendChild(li);
      });
      box.appendChild(list);

      var more = document.createElement("p");
      more.className = "photo-credits__intro";
      more.textContent = "Full licence details are listed in ATTRIBUTION.md.";
      box.appendChild(more);

      var bottom = wrap.querySelector(".footer-bottom");
      if (bottom) wrap.insertBefore(box, bottom);
      else wrap.appendChild(box);
    });
  }

  /* Honest-status banner. Stays visible until the site is genuinely
     operated with authorisation (see unofficialNotice in site-config.js). */
  function initUnofficialNotice() {
    if (!CFG.unofficialNotice) return;
    document.querySelectorAll(".site-footer .container").forEach(function (wrap) {
      var p = document.createElement("p");
      p.className = "unofficial-notice";
      p.innerHTML =
        "<strong>Unaffiliated demonstration site.</strong> This is a design " +
        "demonstration and is not operated by, endorsed by or affiliated with " +
        "Jodie Comer or her representatives. It publishes no contact details " +
        "and accepts no payments. Imagery is freely licensed, not official " +
        "press material.";
      wrap.insertBefore(p, wrap.firstChild);
    });
  }

  /* ---------------------------------------------------------------- header */
  function initHeader() {

    var header = document.querySelector(".site-header");
    if (!header) return;
    var overlay = header.classList.contains("site-header--overlay");

    function update() {
      var past = window.scrollY > (overlay ? window.innerHeight * 0.7 : 12);
      header.classList.toggle("is-solid", past || !overlay);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ----------------------------------------------------------- mobile menu */
  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("is-locked", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }

  /* ---------------------------------------------------------------- reveal */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------------------- contacts */
  function digits(value) {
    return String(value || "").replace(/[^0-9]/g, "");
  }

  function prettyPhone(value) {
    var d = digits(value);
    return d ? "+" + d : "";
  }

  function disable(el) {
    el.setAttribute("aria-disabled", "true");
    el.setAttribute("tabindex", "-1");
    el.removeAttribute("href");
    el.title = "Awaiting verified official contact details";
  }

  function initContacts() {
    var email = (CFG.managementEmail || "").trim();
    var waNumber = digits(CFG.managementWhatsApp);

    /* Text nodes ------------------------------------------------------- */
    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var key = el.getAttribute("data-cfg");
      var map = {
        email: email,
        whatsapp: prettyPhone(waNumber),
        phone: CFG.managementPhone || "",
        agency: CFG.agency || "",
        owner: CFG.siteOwner || "",
        legalEmail: CFG.legalEmail || "",
        year: String(new Date().getFullYear())
      };
      var value = map[key];
      if (value) {
        el.textContent = value;
        el.classList.remove("placeholder-value");
      } else {
        el.textContent = PLACEHOLDER;
        el.classList.add("placeholder-value");
      }
    });

    /* Email links ------------------------------------------------------ */
    document.querySelectorAll("[data-action='email']").forEach(function (el) {
      if (!email) return disable(el);
      var subject = el.getAttribute("data-subject") || "Professional inquiry — Jodie Comer";
      el.setAttribute("href", "mailto:" + email + "?subject=" + encodeURIComponent(subject));
    });

    /* WhatsApp links --------------------------------------------------- */
    document.querySelectorAll("[data-action='whatsapp']").forEach(function (el) {
      if (!waNumber) return disable(el);
      var text = el.getAttribute("data-message") ||
        "Hello, I would like to make a professional inquiry regarding Jodie Comer.";
      el.setAttribute("href", "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(text));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });

    /* Verified official social accounts only --------------------------- */
    var verified = (CFG.social || []).filter(function (s) { return s && s.url; });
    document.querySelectorAll("[data-social]").forEach(function (wrap) {
      var section = wrap.closest("[data-social-section]") || wrap;
      if (!verified.length) {
        section.hidden = true;
        return;
      }
      wrap.innerHTML = verified.map(function (s) {
        return '<li><a class="link-arrow" href="' + s.url +
          '" target="_blank" rel="noopener">' + s.label + ' <span aria-hidden="true">&#8599;</span></a></li>';
      }).join("");
      section.hidden = false;
    });
  }


  /* ------------------------------------------------------------------ form */
  function initForm() {
    var form = document.getElementById("inquiry-form");
    if (!form) return;
    var confirm = document.getElementById("inquiry-confirmation");

    function fieldOf(input) { return input.closest(".field"); }

    function validate(input) {
      var wrap = fieldOf(input);
      if (!wrap) return true;
      var ok = input.checkValidity();
      wrap.classList.toggle("is-invalid", !ok);
      var err = wrap.querySelector(".field__error");
      if (err) err.textContent = ok ? "" : (input.validationMessage || "This field is required.");
      return ok;
    }

    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("blur", function () { validate(input); });
      input.addEventListener("input", function () {
        if (fieldOf(input) && fieldOf(input).classList.contains("is-invalid")) validate(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var firstInvalid = null;
      form.querySelectorAll("input, select, textarea").forEach(function (input) {
        if (!validate(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      var endpoint = (CFG.formEndpoint || "").trim();
      var email = (CFG.managementEmail || "").trim();
      var data = new FormData(form);

      function done() {
        form.classList.add("is-submitted");
        if (confirm) {
          confirm.classList.add("is-visible");
          confirm.setAttribute("tabindex", "-1");
          confirm.focus();
          confirm.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        form.reset();
      }

      if (endpoint) {
        var btn = form.querySelector("[type='submit']");
        if (btn) { btn.setAttribute("aria-disabled", "true"); btn.textContent = "SENDING…"; }
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(done)
          .catch(function () {
            if (btn) { btn.removeAttribute("aria-disabled"); btn.textContent = "SEND INQUIRY TO MANAGEMENT"; }
            var note = document.getElementById("form-status");
            if (note) {
              note.textContent =
                "The inquiry could not be sent automatically. Please email the management team directly.";
            }
          });
        return;
      }

      if (email) {
        var lines = [];
        data.forEach(function (value, key) {
          if (String(value).trim()) lines.push(key + ": " + value);
        });
        var subject = "Professional inquiry — " + (data.get("inquiryType") || "General");
        window.location.href = "mailto:" + email +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(lines.join("\n"));
        done();
        return;
      }

      var status = document.getElementById("form-status");
      if (status) {
        status.textContent =
          "This form is not yet connected. The site owner must add a verified management email " +
          "address or form endpoint in js/site-config.js before inquiries can be delivered.";
      }
    });
  }

  /* --------------------------------------------------------------- current */
  function initCurrentNav() {
    var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".nav a, .mobile-menu nav a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("/").pop().toLowerCase();
      if (href && href === path) a.setAttribute("aria-current", "page");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initImages();
    initUnofficialNotice();
    initPhotoCredits();
    initHeader();

    initMenu();
    initReveal();
    initContacts();
    initForm();
    initCurrentNav();
  });
})();

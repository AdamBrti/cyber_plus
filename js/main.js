/**
 * Cyber Plus — cinematic interactions
 */
(function () {
  "use strict";

  /* Stałe interakcji — jedno miejsce, bez magii liczb w handlerach */
  var HEADER_SCROLL_THRESHOLD_PX = 24;
  var NAV_BREAKPOINT_MIN = 900;
  var PARALLAX_LERP = 0.08;
  var PARALLAX_STOP_EPS = 0.05;
  var PARALLAX_POINTER_X = 0.06;
  var PARALLAX_POINTER_Y = 0.05;
  var STICKY_CTA_SHOW_VH = 0.12;
  var STICKY_CTA_HIDE_FRACTION = 0.45;
  var STICKY_CTA_MAX_WIDTH_PX = 700;
  var CONTACT_POST_URL = "/api/contact";
  var REVEAL_IO_ROOT_MARGIN = "0px 0px 10% 0px";
  var REVEAL_IO_THRESHOLD = 0.06;
  var SHOWCASE_PARALLAX_X = -12;
  var SHOWCASE_PARALLAX_Y = -8;
  var SHOWCASE_PARALLAX_MID = 0.45;
  var SHOWCASE_PARALLAX_VIEWPORT = 0.48;
  var SHOWCASE_PARALLAX_RANGE = 0.75;
  var PILLARS_IO_THRESHOLD = 0.08;
  var PILLARS_IO_ROOT_MARGIN = "0px 0px -8% 0px";
  var NAV_OPEN_FOCUS_MS = 60;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var hero = document.querySelector(".hero-cinematic");

  /* Header scroll state */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > HEADER_SCROLL_THRESHOLD_PX) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }

  /* Hero parallax (pointer + light scroll) */
  var targetX = 0;
  var targetY = 0;
  var curX = 0;
  var curY = 0;
  var rafId = null;

  function setHeroParallax(nx, ny) {
    root.style.setProperty("--hero-parallax-x", nx.toFixed(2) + "px");
    root.style.setProperty("--hero-parallax-y", ny.toFixed(2) + "px");
  }

  function tickParallax() {
    curX += (targetX - curX) * PARALLAX_LERP;
    curY += (targetY - curY) * PARALLAX_LERP;
    if (Math.abs(targetX - curX) < PARALLAX_STOP_EPS && Math.abs(targetY - curY) < PARALLAX_STOP_EPS) {
      curX = targetX;
      curY = targetY;
      rafId = null;
    } else {
      rafId = requestAnimationFrame(tickParallax);
    }
    setHeroParallax(curX, curY);
  }

  function requestParallax() {
    if (reduceMotion || !hero) return;
    if (rafId == null) rafId = requestAnimationFrame(tickParallax);
  }

  if (!reduceMotion && hero && window.matchMedia("(min-width: " + NAV_BREAKPOINT_MIN + "px)").matches) {
    window.addEventListener(
      "mousemove",
      function (e) {
        var cx = window.innerWidth / 2;
        var cy = window.innerHeight / 2;
        targetX = (e.clientX - cx) * PARALLAX_POINTER_X;
        targetY = (e.clientY - cy) * PARALLAX_POINTER_Y;
        root.style.setProperty("--cursor-x", e.clientX + "px");
        root.style.setProperty("--cursor-y", e.clientY + "px");
        requestParallax();
      },
      { passive: true }
    );
  }

  window.addEventListener(
    "scroll",
    function () {
      onScrollHeader();
    },
    { passive: true }
  );
  onScrollHeader();

  /* Scroll reveal */
  function revealObserve(selector, className) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add(className || "is-inview");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add(className || "is-inview");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: REVEAL_IO_ROOT_MARGIN, threshold: REVEAL_IO_THRESHOLD }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  revealObserve(".reveal", "is-inview");
  revealObserve(".reveal-stagger", "is-inview");

  /* Płynny scroll tylko po kliknięciu w kotwicę #id (html ma scroll-behavior: auto — lepsze odczucie kółka/touch) */
  if (!reduceMotion) {
    document.addEventListener(
      "click",
      function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        var a = t.closest("a[href^='#']");
        if (!a) return;
        var href = a.getAttribute("href");
        if (!href || href === "#" || href.length < 2) return;
        if (a.target && a.target !== "_self") return;
        var id = href.slice(1);
        var el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (history.replaceState) {
          try {
            history.replaceState(null, "", href);
          } catch (hashErr) {}
        }
      },
      false
    );
  }

  /* Sticky mobile CTA */
  var sticky = document.getElementById("sticky-cta");
  var showAfter = STICKY_CTA_SHOW_VH * window.innerHeight;
  var shown = false;

  function onScrollSticky() {
    if (!sticky || window.innerWidth >= STICKY_CTA_MAX_WIDTH_PX) return;
    if (window.scrollY > showAfter) {
      if (!shown) {
        sticky.classList.add("is-visible");
        sticky.setAttribute("aria-hidden", "false");
        shown = true;
      }
    } else if (window.scrollY < showAfter * STICKY_CTA_HIDE_FRACTION) {
      sticky.classList.remove("is-visible");
      sticky.setAttribute("aria-hidden", "true");
      shown = false;
    }
  }

  window.addEventListener(
    "scroll",
    function () {
      if (reduceMotion) {
        if (sticky) {
          sticky.classList.add("is-visible");
          sticky.setAttribute("aria-hidden", "false");
        }
        return;
      }
      onScrollSticky();
    },
    { passive: true }
  );
  onScrollSticky();

  /* FAQ */
  var items = document.querySelectorAll(".faq-item");
  items.forEach(function (item) {
    var btn = item.querySelector("button");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = item.classList.contains("is-open");
      items.forEach(function (other) {
        other.classList.remove("is-open");
        var b = other.querySelector("button");
        if (b) {
          b.setAttribute("aria-expanded", "false");
          var ic = b.querySelector(".icon");
          if (ic) ic.textContent = "+";
        }
      });
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        var icon = btn.querySelector(".icon");
        if (icon) icon.textContent = "−";
      }
    });
  });

  var parallaxStages = document.querySelectorAll("[data-showcase-parallax]");
  if (parallaxStages.length && !reduceMotion) {
    var rafSp = null;
    function showcaseParallaxTick() {
      rafSp = null;
      var vh = window.innerHeight || 1;
      parallaxStages.forEach(function (stage) {
        var inner = stage.querySelector(".showcase-devices");
        if (!inner) return;
        var r = stage.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var mid = r.top + r.height * SHOWCASE_PARALLAX_MID;
        var t = (mid - vh * SHOWCASE_PARALLAX_VIEWPORT) / (vh * SHOWCASE_PARALLAX_RANGE);
        if (t > 1) t = 1;
        if (t < -1) t = -1;
        inner.style.setProperty("--spx", (t * SHOWCASE_PARALLAX_X).toFixed(2) + "px");
        inner.style.setProperty("--spy", (t * SHOWCASE_PARALLAX_Y).toFixed(2) + "px");
      });
    }
    function reqShowcaseParallax() {
      if (rafSp != null) return;
      rafSp = requestAnimationFrame(function () {
        showcaseParallaxTick();
      });
    }
    window.addEventListener("scroll", reqShowcaseParallax, { passive: true });
    window.addEventListener("resize", reqShowcaseParallax, { passive: true });
    showcaseParallaxTick();
  }

  var pillarsAtelier = document.querySelector("#rozwiazanie");
  if (pillarsAtelier && "IntersectionObserver" in window) {
    var railIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          document.body.classList.toggle("pillars-atelier-inview", entry.isIntersecting);
        });
      },
      { threshold: PILLARS_IO_THRESHOLD, rootMargin: PILLARS_IO_ROOT_MARGIN }
    );
    railIo.observe(pillarsAtelier);
  }

  var yearEl = document.getElementById("y");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Nawigacja mobilna (panel + backdrop) */
  var menuToggle = document.getElementById("nav-menu-toggle");
  var mobilePanel = document.getElementById("nav-mobile-panel");
  var mobileBackdrop = document.getElementById("nav-mobile-backdrop");
  var mobileClose = document.getElementById("nav-mobile-close");

  function setNavOpen(open, opts) {
    opts = opts || {};
    if (!menuToggle || !mobilePanel) return;
    document.body.classList.toggle("nav-open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    mobilePanel.setAttribute("aria-hidden", open ? "false" : "true");
    if (mobileBackdrop) {
      mobileBackdrop.setAttribute("aria-hidden", open ? "false" : "true");
    }
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      var firstLink = mobilePanel.querySelector(".nav-mobile-panel__nav a");
      if (firstLink) window.setTimeout(function () { firstLink.focus(); }, NAV_OPEN_FOCUS_MS);
    } else if (!opts.skipToggleFocus) {
      menuToggle.focus();
    }
  }

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", function () {
      setNavOpen(!document.body.classList.contains("nav-open"));
    });
    if (mobileClose) {
      mobileClose.addEventListener("click", function () {
        setNavOpen(false);
      });
    }
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener("click", function () {
        setNavOpen(false);
      });
    }
    mobilePanel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setNavOpen(false, { skipToggleFocus: true });
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        setNavOpen(false);
      }
    });
    window.addEventListener(
      "resize",
      function () {
        if (window.innerWidth >= NAV_BREAKPOINT_MIN) setNavOpen(false);
      },
      { passive: true }
    );
  }

  /* Formularz kontaktu → POST /api/contact (Cloudflare Pages Function + Resend) */
  var contactForm = document.getElementById("contact-form");
  var contactStatus = document.getElementById("contact-form-status");
  var contactSubmit = document.getElementById("contact-submit");
  if (contactForm && contactStatus) {
    var htmlLang = (document.documentElement.getAttribute("lang") || "pl").toLowerCase();
    var contactLang = htmlLang.slice(0, 2) === "de" ? "de" : htmlLang.slice(0, 2) === "en" ? "en" : "pl";
    var CONTACT_MSG = {
      pl: {
        fieldsRequired: "Uzupełnij imię, e-mail i treść wiadomości.",
        sending: "Wysyłamy…",
        ok: "Dziękujemy — wiadomość wysłana. Odezwiemy się na podany e-mail.",
        validation: "Sprawdź poprawność adresu e-mail i długość pól.",
        forbidden: "Żądanie odrzucone (konfiguracja domeny). Napisz zwykłą pocztą poniżej.",
        serverMisconfigured:
          "Formularz nie jest jeszcze skonfigurowany po stronie serwera. Napisz na adres poniżej lub spróbuj później.",
        sendFailed: "Nie udało się wysłać. Spróbuj ponownie za chwilę albo skorzystaj z przycisków poczty poniżej.",
        network:
          "Brak połączenia z serwerem. Sprawdź internet lub wyślij wiadomość z własnej poczty (przyciski poniżej).",
      },
      en: {
        fieldsRequired: "Please fill in your name, email address and message.",
        sending: "Sending…",
        ok: "Thank you — your message was sent. We will reply to the email you provided.",
        validation: "Please check the email address and field lengths.",
        forbidden: "Request blocked (site configuration). Use email below.",
        serverMisconfigured:
          "The contact form is not configured on the server yet. Use email below or try again later.",
        sendFailed: "Could not send. Retry in a moment or use the email buttons below.",
        network: "No connection to the server. Check your network or use your own email app (buttons below).",
      },
      de: {
        fieldsRequired: "Bitte Name, E-Mail und Nachricht ausfüllen.",
        sending: "Wird gesendet…",
        ok: "Danke — Ihre Nachricht wurde gesendet. Wir melden uns an die angegebene E-Mail.",
        validation: "Bitte E-Mail-Adresse und Feldlängen prüfen.",
        forbidden: "Anfrage abgelehnt (Konfiguration). Bitte nutzen Sie die E-Mail unten.",
        serverMisconfigured:
          "Das Kontaktformular ist serverseitig noch nicht eingerichtet. Nutzen Sie die E-Mail unten oder später erneut.",
        sendFailed: "Senden fehlgeschlagen. Bitte erneut versuchen oder die Buttons unten nutzen.",
        network: "Keine Verbindung zum Server. Netzwerk prüfen oder eigene E-Mail-App nutzen (Buttons unten).",
      },
    };
    var CM = CONTACT_MSG[contactLang] || CONTACT_MSG.pl;

    function setContactStatus(msg, kind) {
      contactStatus.textContent = msg || "";
      contactStatus.classList.remove("is-error", "is-ok");
      if (kind === "error") contactStatus.classList.add("is-error");
      else if (kind === "ok") contactStatus.classList.add("is-ok");
    }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameEl = document.getElementById("contact-name");
      var emailEl = document.getElementById("contact-email");
      var msgEl = document.getElementById("contact-message");
      var hpEl = document.getElementById("contact-company");
      if (!nameEl || !emailEl || !msgEl) return;

      var name = String(nameEl.value || "").trim();
      var email = String(emailEl.value || "").trim();
      var message = String(msgEl.value || "").trim();
      var hp = hpEl ? String(hpEl.value || "").trim() : "";

      if (!name || !email || !message) {
        setContactStatus(CM.fieldsRequired, "error");
        return;
      }

      if (contactSubmit) contactSubmit.disabled = true;
      setContactStatus(CM.sending, null);

      var payload = {
        name: name,
        email: email,
        message: message,
        _company: hp,
      };

      fetch(CONTACT_POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.text().then(function (text) {
            var data = {};
            if (text) {
              try {
                data = JSON.parse(text);
              } catch (parseErr) {
                data = { ok: false, error: "bad_response" };
              }
            }
            return { ok: res.ok, status: res.status, data: data };
          });
        })
        .then(function (r) {
          if (r.ok && r.data && r.data.ok) {
            setContactStatus(CM.ok, "ok");
            contactForm.reset();
          } else if (r.data && r.data.error === "validation") {
            setContactStatus(CM.validation, "error");
          } else if (r.data && r.data.error === "forbidden") {
            setContactStatus(CM.forbidden, "error");
          } else if (r.data && r.data.error === "server_misconfigured") {
            setContactStatus(CM.serverMisconfigured, "error");
          } else {
            setContactStatus(CM.sendFailed, "error");
          }
        })
        .catch(function () {
          setContactStatus(CM.network, "error");
        })
        .finally(function () {
          if (contactSubmit) contactSubmit.disabled = false;
        });
    });
  }

  /* Baner informacyjny o plikach cookies (localStorage — opis w polityce § pp-cookies) */
  var COOKIE_LS = "cyberplus_cookie_ack_v1";
  var COOKIE_LS_LEGACY = "cyberplus_cookie_info_v1";
  try {
    if (window.localStorage.getItem(COOKIE_LS_LEGACY) && !window.localStorage.getItem(COOKIE_LS)) {
      window.localStorage.setItem(COOKIE_LS, "1");
    }
  } catch (legacyErr) {}

  if ("localStorage" in window && !window.localStorage.getItem(COOKIE_LS)) {
    var htmlLangBanner = (document.documentElement.getAttribute("lang") || "pl").toLowerCase();
    var bannerLang = htmlLangBanner.slice(0, 2) === "de" ? "de" : htmlLangBanner.slice(0, 2) === "en" ? "en" : "pl";
    var COOKIE_UI = {
      pl: {
        aria: "Informacja o plikach cookies",
        before: "Używamy niezbędnych mechanizmów serwera i — po kliknięciu „Rozumiem” — zapisu w przeglądarce, aby nie pokazywać tego komunikatu wielokrotnie. Szczegóły: ",
        link: "Polityka prywatności (rozdział o cookies)",
        after: ".",
        btn: "Rozumiem",
        prefsLink: "Pokaż komunikat ponownie (czyści zapis)",
      },
      en: {
        aria: "Information about cookies",
        before:
          "We use essential server mechanisms and, after you click “Understood”, a value in your browser so we do not show this notice again. Details (Polish): ",
        link: "Privacy policy — cookies section",
        after: ".",
        btn: "Understood",
        prefsLink: "Show this notice again (clears saved choice)",
      },
      de: {
        aria: "Hinweis zu Cookies",
        before:
          "Wir nutzen notwendige Servermechanismen und — nach Klick auf „Verstanden“ — einen Speicherwert im Browser, damit dieser Hinweis nicht wiederholt erscheint. Details (Polnisch): ",
        link: "Datenschutzerklärung — Abschnitt Cookies",
        after: ".",
        btn: "Verstanden",
        prefsLink: "Hinweis erneut anzeigen (Speicher löschen)",
      },
    };
    var CU = COOKIE_UI[bannerLang] || COOKIE_UI.pl;

    var ban = document.createElement("aside");
    ban.className = "cookie-banner";
    ban.setAttribute("role", "dialog");
    ban.setAttribute("aria-label", CU.aria);
    var inner = document.createElement("div");
    inner.className = "cookie-banner__inner";
    var p = document.createElement("p");
    p.className = "cookie-banner__text";
    var a = document.createElement("a");
    a.href = "/polityka-prywatnosci.html#pp-cookies";
    a.textContent = CU.link;
    p.appendChild(document.createTextNode(CU.before));
    p.appendChild(a);
    p.appendChild(document.createTextNode(CU.after));
    var actions = document.createElement("div");
    actions.className = "cookie-banner__actions";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-primary";
    btn.textContent = CU.btn;
    btn.addEventListener("click", function () {
      try {
        window.localStorage.setItem(COOKIE_LS, "1");
      } catch (e) {}
      ban.classList.add("is-dismissed");
      window.setTimeout(function () {
        if (ban.parentNode) ban.parentNode.removeChild(ban);
      }, 400);
    });
    var prefsBtn = document.createElement("button");
    prefsBtn.type = "button";
    prefsBtn.className = "cookie-banner__prefs";
    prefsBtn.textContent = CU.prefsLink;
    prefsBtn.addEventListener("click", function () {
      try {
        window.localStorage.removeItem(COOKIE_LS);
        window.localStorage.removeItem(COOKIE_LS_LEGACY);
      } catch (e) {}
      window.location.reload();
    });
    actions.appendChild(btn);
    actions.appendChild(prefsBtn);
    inner.appendChild(p);
    inner.appendChild(actions);
    ban.appendChild(inner);
    document.body.appendChild(ban);
  }

  var resetCookieBtn = document.getElementById("pp-reset-cookie-banner");
  if (resetCookieBtn) {
    resetCookieBtn.addEventListener("click", function () {
      try {
        window.localStorage.removeItem(COOKIE_LS);
        window.localStorage.removeItem(COOKIE_LS_LEGACY);
      } catch (e) {}
      window.location.reload();
    });
  }
})();

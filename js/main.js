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
  var REVEAL_IO_ROOT_MARGIN = "0px 0px -2% 0px";
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
        setContactStatus("Uzupełnij imię, e-mail i treść wiadomości.", "error");
        return;
      }

      if (contactSubmit) contactSubmit.disabled = true;
      setContactStatus("Wysyłamy…", null);

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
          return res.json().then(function (data) {
            return { ok: res.ok, status: res.status, data: data };
          });
        })
        .then(function (r) {
          if (r.ok && r.data && r.data.ok) {
            setContactStatus("Dziękujemy — wiadomość wysłana. Odezwiemy się na podany e-mail.", "ok");
            contactForm.reset();
          } else if (r.data && r.data.error === "validation") {
            setContactStatus("Sprawdź poprawność adresu e-mail i długość pól.", "error");
          } else if (r.data && r.data.error === "forbidden") {
            setContactStatus("Żądanie odrzucone (konfiguracja domeny). Napisz zwykłą pocztą poniżej.", "error");
          } else {
            setContactStatus(
              "Nie udało się wysłać. Spróbuj ponownie za chwilę albo skorzystaj z przycisków poczty poniżej.",
              "error"
            );
          }
        })
        .catch(function () {
          setContactStatus(
            "Brak połączenia z serwerem. Sprawdź internet lub wyślij wiadomość z własnej poczty (przyciski poniżej).",
            "error"
          );
        })
        .finally(function () {
          if (contactSubmit) contactSubmit.disabled = false;
        });
    });
  }
})();

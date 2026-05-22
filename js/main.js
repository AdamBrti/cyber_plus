/**
 * Cyber Plus — cinematic interactions
 */
(function () {
  "use strict";

  /* Test lokalny — oba false wyłącza parallax hero (mysz) i showcase (scroll); glow kursora zostaje */
  var ENABLE_HERO_PARALLAX = false;
  var ENABLE_SHOWCASE_PARALLAX = false;

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
  var PROCESS_ENHANCED_MIN_WIDTH = 960;
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
  var smoothScrollAllowed = window.matchMedia("(min-width: 900px) and (pointer: fine)").matches;
  var lenis = null;

  var introLoader = document.getElementById("intro-loader");
  var introLoaderDone = false;
  var introLoaderStartedAt = Date.now();
  var INTRO_LOADER_MIN_MS = reduceMotion ? 0 : 2000;
  var INTRO_LOADER_FADE_MS = reduceMotion ? 0 : 1250;
  var INTRO_LOADER_MAX_MS = 2400;
  function hideIntroLoader() {
    if (!introLoader || introLoaderDone) return;
    introLoaderDone = true;
    var elapsed = Date.now() - introLoaderStartedAt;
    var wait = Math.max(0, INTRO_LOADER_MIN_MS - elapsed);
    window.setTimeout(function () {
      introLoader.classList.add("is-hidden");
      document.body.classList.remove("intro-loading");
      window.setTimeout(function () {
        if (introLoader.parentNode) introLoader.parentNode.removeChild(introLoader);
      }, INTRO_LOADER_FADE_MS);
    }, wait);
  }

  if (introLoader) {
    if (document.readyState === "complete") {
      hideIntroLoader();
    } else {
      window.addEventListener("load", function () {
        hideIntroLoader();
      });
      window.setTimeout(hideIntroLoader, INTRO_LOADER_MAX_MS);
    }
  }

  document.querySelectorAll(".hero-device__screen img, .device-laptop__screen img, .device-phone__screen img").forEach(function (img) {
    var screen = img.parentElement;
    if (!screen) return;
    function markLoaded() {
      screen.classList.add("is-loaded");
    }
    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else {
      img.addEventListener("load", markLoaded, { once: true });
      img.addEventListener("error", markLoaded, { once: true });
    }
  });

  if (!reduceMotion && smoothScrollAllowed && window.Lenis) {
    lenis = new window.Lenis({
      autoRaf: true,
      smoothWheel: true,
      anchors: false,
      prevent: function (node) {
        return !!(node.closest && node.closest(".nav-mobile-panel, .cookie-banner"));
      }
    });
    window.cyberPlusLenis = lenis;
  }

  var hero = document.querySelector(".hero-cinematic");

  /* Header scroll state */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > HEADER_SCROLL_THRESHOLD_PX) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }

  /* Hero parallax + cursor glow — jeden RAF, bez layoutu (transform), zmienne tylko na .hero-cinematic */
  var cursorGlow = document.querySelector(".cursor-glow");
  var targetX = 0;
  var targetY = 0;
  var curX = 0;
  var curY = 0;
  var pointerX = 0;
  var pointerY = 0;
  var pointerDirty = false;
  var rafId = null;

  function heroPointerActive() {
    if (!hero) return false;
    var r = hero.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  function setHeroParallax(nx, ny) {
    if (!hero) return;
    hero.style.setProperty("--hero-parallax-x", nx.toFixed(2) + "px");
    hero.style.setProperty("--hero-parallax-y", ny.toFixed(2) + "px");
  }

  function setCursorGlow(x, y) {
    if (!cursorGlow) return;
    cursorGlow.style.transform = "translate3d(" + x + "px," + y + "px,0) translate(-50%,-50%)";
  }

  function tickPointerEffects() {
    var needsParallax = false;
    if (ENABLE_HERO_PARALLAX) {
      var parallaxActive = hero && heroPointerActive();
      if (parallaxActive) {
        var cx = window.innerWidth / 2;
        var cy = window.innerHeight / 2;
        targetX = (pointerX - cx) * PARALLAX_POINTER_X;
        targetY = (pointerY - cy) * PARALLAX_POINTER_Y;
        curX += (targetX - curX) * PARALLAX_LERP;
        curY += (targetY - curY) * PARALLAX_LERP;
        if (Math.abs(targetX - curX) < PARALLAX_STOP_EPS && Math.abs(targetY - curY) < PARALLAX_STOP_EPS) {
          curX = targetX;
          curY = targetY;
        }
        setHeroParallax(curX, curY);
      } else if (Math.abs(curX) > PARALLAX_STOP_EPS || Math.abs(curY) > PARALLAX_STOP_EPS) {
        targetX = 0;
        targetY = 0;
        curX += (targetX - curX) * PARALLAX_LERP;
        curY += (targetY - curY) * PARALLAX_LERP;
        setHeroParallax(curX, curY);
      }
      needsParallax =
        (parallaxActive &&
          (Math.abs(targetX - curX) >= PARALLAX_STOP_EPS || Math.abs(targetY - curY) >= PARALLAX_STOP_EPS)) ||
        (!parallaxActive && (Math.abs(curX) >= PARALLAX_STOP_EPS || Math.abs(curY) >= PARALLAX_STOP_EPS));
    }

    if (pointerDirty) {
      setCursorGlow(pointerX, pointerY);
      pointerDirty = false;
    }

    if (!needsParallax && !pointerDirty) {
      rafId = null;
    } else {
      rafId = requestAnimationFrame(tickPointerEffects);
    }
  }

  function requestPointerEffects() {
    if (reduceMotion) return;
    if (rafId == null) rafId = requestAnimationFrame(tickPointerEffects);
  }

  if (!reduceMotion && window.matchMedia("(min-width: " + NAV_BREAKPOINT_MIN + "px)").matches) {
    window.addEventListener(
      "mousemove",
      function (e) {
        pointerX = e.clientX;
        pointerY = e.clientY;
        pointerDirty = true;
        requestPointerEffects();
      },
      { passive: true }
    );
  }

  var scrollRaf = null;
  function runScrollEffects() {
    scrollRaf = null;
    onScrollHeader();
    if (reduceMotion) {
      if (sticky) {
        sticky.classList.add("is-visible");
        sticky.setAttribute("aria-hidden", "false");
      }
      return;
    }
    onScrollSticky();
  }

  function requestScrollEffects() {
    if (scrollRaf != null) return;
    scrollRaf = requestAnimationFrame(runScrollEffects);
  }

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
        if (lenis) {
          lenis.scrollTo(el, { offset: 0, duration: 1.05 });
        } else {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
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

  window.addEventListener("scroll", requestScrollEffects, { passive: true });
  runScrollEffects();

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

  if (!ENABLE_HERO_PARALLAX && hero) {
    hero.style.setProperty("--hero-parallax-x", "0px");
    hero.style.setProperty("--hero-parallax-y", "0px");
  }

  var parallaxStages = document.querySelectorAll("[data-showcase-parallax]");
  if (ENABLE_SHOWCASE_PARALLAX && parallaxStages.length && !reduceMotion) {
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

  /* Usługi — scroll-driven spatial experience */
  var servicesBand = document.getElementById("uslugi");
  var servicesTrack = document.querySelector(".services-scrolly__track");
  var servicesRail = servicesBand && servicesBand.querySelector(".services-rail");
  var SERVICES_SCROLL_MIN_W = 1536;
  var SERVICES_SCROLL_MIN_H = 860;
  var SERVICES_ATMO_LERP = 0.052;
  var SERVICES_PROG_LERP = 0.11;
  var SERVICES_SETTLE_EPS = 0.0015;
  var SERVICES_FOCUS_SETTLE_EPS = 0.08;
  var servicesProgSmoothed = 0;
  var SERVICES_FOCUS_DEFAULT = { x: 24, y: 34 };
  var SERVICES_DOM_FOCUS = {
    hero: SERVICES_FOCUS_DEFAULT,
    landing: { x: 76, y: 26 },
    redesign: { x: 22, y: 58 },
    local: { x: 72, y: 72 },
    statement: { x: 42, y: 18 },
    cta: { x: 50, y: 82 },
    offer: { x: 38, y: 48 },
  };
  var servicesScrollyActive = false;
  var servicesScrollyRaf = null;
  var servicesScrollyNeedsTick = false;
  var servicesFocusCur = { x: SERVICES_FOCUS_DEFAULT.x, y: SERVICES_FOCUS_DEFAULT.y };
  var servicesFocusTarget = { x: SERVICES_FOCUS_DEFAULT.x, y: SERVICES_FOCUS_DEFAULT.y };
  var servicesPointerFocus = false;

  function svcClamp(min, max, v) {
    return Math.min(max, Math.max(min, v));
  }

  function svcSmooth(edge0, edge1, x) {
    var t = svcClamp(0, 1, (x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  }

  /* Płynniejsza krzywa (mniejsze „szarpnięcie” na wejściu/wyjściu faz) */
  function svcSmooth5(edge0, edge1, x) {
    var t = svcClamp(0, 1, (x - edge0) / (edge1 - edge0));
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function svcCrossfade(in0, in1, out0, out1, x) {
    return svcSmooth5(in0, in1, x) * (1 - svcSmooth5(out0, out1, x));
  }

  var SERVICES_FOCUS_KEYS = [
    { p: 0.12, x: 24, y: 34 },
    { p: 0.38, x: 76, y: 26 },
    { p: 0.46, x: 22, y: 58 },
    { p: 0.54, x: 72, y: 72 },
    { p: 0.62, x: 38, y: 48 },
    { p: 0.72, x: 42, y: 18 },
    { p: 0.86, x: 50, y: 82 },
  ];

  function servicesFocusAt(p) {
    var keys = SERVICES_FOCUS_KEYS;
    if (p <= keys[0].p) return { x: keys[0].x, y: keys[0].y };
    if (p >= keys[keys.length - 1].p) {
      var last = keys[keys.length - 1];
      return { x: last.x, y: last.y };
    }
    for (var i = 0; i < keys.length - 1; i++) {
      var a = keys[i];
      var b = keys[i + 1];
      if (p >= a.p && p <= b.p) {
        var t = svcSmooth5(a.p, b.p, p);
        return {
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t,
        };
      }
    }
    return { x: SERVICES_FOCUS_DEFAULT.x, y: SERVICES_FOCUS_DEFAULT.y };
  }

  function servicesParseFocus(el) {
    var raw = el.getAttribute("data-service-focus") || "";
    var parts = raw.split(",");
    var x = parseFloat(parts[0]);
    var y = parseFloat(parts[1]);
    if (!isFinite(x)) x = SERVICES_FOCUS_DEFAULT.x;
    if (!isFinite(y)) y = SERVICES_FOCUS_DEFAULT.y;
    return { x: x, y: y };
  }

  function servicesScrollProgress() {
    if (!servicesTrack) return 0;
    var rect = servicesTrack.getBoundingClientRect();
    var scrollRange = servicesTrack.offsetHeight - window.innerHeight;
    if (scrollRange <= 0) return 0;
    return svcClamp(0, 1, -rect.top / scrollRange);
  }

  function servicesDomFromProgress(p, panelsEnv, stmtVis, ctaVis, cardsLock) {
    if (stmtVis > 0.1) return "statement";
    if (ctaVis > 0.1 && stmtVis < 0.06) return "cta";
    if (cardsLock > 0.58) return "offer";
    if (p < 0.37) return "hero";
    if (p < 0.45 && panelsEnv > 0.2) return "landing";
    if (p < 0.53 && panelsEnv > 0.2) return "redesign";
    if (p < 0.61 && panelsEnv > 0.2) return "local";
    return "hero";
  }

  function servicesApplyScrollVars(p) {
    if (!servicesBand) return;
    servicesBand.style.setProperty("--svc-p", String(p));

    /* 1 · Intro */
    servicesBand.style.setProperty("--svc-intro", String(1 - svcSmooth5(0.05, 0.21, p)));

    /* 2 · Karta 01 — fade-in, jedno zejście layoutu (bez skoków max/hard-cut) */
    var heroIn = svcSmooth5(0.05, 0.3, p);
    var heroLayout = svcSmooth5(0.31, 0.54, p);
    var cardsLock = svcSmooth5(0.47, 0.65, p);
    var heroVis = 0.04 + heroIn * 0.96;
    var heroLift = svcSmooth5(0.46, 0.6, p) * (1 - heroIn) * 0.06;
    heroVis = Math.min(1, heroVis + heroLift);
    var heroFocus = 1 - svcSmooth5(0.33, 0.52, p) * 0.32 * (1 - cardsLock * 0.85);
    servicesBand.style.setProperty("--svc-hero", String(heroVis));
    servicesBand.style.setProperty("--svc-hero-layout", String(heroLayout));
    servicesBand.style.setProperty("--svc-hero-focus", String(heroFocus));
    servicesBand.style.setProperty("--svc-cards-lock", String(cardsLock));

    /* 3 · Panele — sekwencja z nakładaniem, potem plateau */
    var panelsEnv = svcSmooth5(0.24, 0.4, p);
    var s1 = svcSmooth5(0.27, 0.43, p);
    var s2 = svcSmooth5(0.33, 0.49, p);
    var s3 = svcSmooth5(0.39, 0.55, p);
    var panelsFloor = svcSmooth5(0.48, 0.62, p);
    s1 = s1 + (1 - s1) * panelsFloor * 0.35;
    s2 = s2 + (1 - s2) * panelsFloor * 0.35;
    s3 = s3 + (1 - s3) * panelsFloor * 0.35;
    panelsEnv = panelsEnv + (1 - panelsEnv) * panelsFloor * 0.25;
    servicesBand.style.setProperty("--svc-panels", String(Math.min(1, panelsEnv)));
    servicesBand.style.setProperty("--svc-s1", String(Math.min(1, s1)));
    servicesBand.style.setProperty("--svc-s2", String(Math.min(1, s2)));
    servicesBand.style.setProperty("--svc-s3", String(Math.min(1, s3)));

    /* 4 · Statement — crossfade z plateau */
    var stmtVis = svcCrossfade(0.57, 0.73, 0.77, 0.93, p);
    servicesBand.style.setProperty("--svc-statement", String(stmtVis));

    /* 5 · CTA — zachodzi na koniec statement */
    var ctaVis = svcSmooth5(0.75, 0.94, p);
    servicesBand.style.setProperty("--svc-cta", String(ctaVis));

    var cardsDim = Math.min(0.38, stmtVis * 0.22 + ctaVis * 0.16);
    servicesBand.style.setProperty("--svc-cards-dim", String(cardsDim));

    servicesBand.style.setProperty("--svc-bg-y", (p * -20).toFixed(2) + "px");
    servicesBand.style.setProperty("--svc-head-y", (p * -6.2).toFixed(2) + "vh");

    servicesBand.classList.toggle(
      "is-svc-phase-hero",
      (p >= 0.04 && p < 0.42) || (heroVis > 0.45 && panelsEnv < 0.28 && stmtVis < 0.06)
    );
    servicesBand.classList.toggle(
      "is-svc-phase-panels",
      panelsEnv > 0.08 && cardsLock < 0.92 && stmtVis < 0.1
    );
    servicesBand.classList.toggle("is-svc-cards-locked", cardsLock > 0.58);
    servicesBand.classList.toggle("is-svc-phase-statement", stmtVis > 0.06);
    servicesBand.classList.toggle("is-svc-phase-cta", ctaVis > 0.1 && stmtVis < 0.06);

    var dom = servicesDomFromProgress(p, panelsEnv, stmtVis, ctaVis, cardsLock);
    servicesBand.setAttribute("data-svc-dom", dom);

    if (!servicesPointerFocus) {
      var f = servicesFocusAt(p);
      servicesFocusTarget.x = f.x;
      servicesFocusTarget.y = f.y;
      servicesBand.classList.toggle("is-atmo-focus", p > 0.06 && p < 0.95);
    }
  }

  function servicesScrollyTick() {
    servicesScrollyRaf = null;
    if (!servicesScrollyActive || !servicesBand) return;

    var pRaw = servicesScrollProgress();
    if (Math.abs(pRaw - servicesProgSmoothed) > 0.22) {
      servicesProgSmoothed = pRaw;
    } else {
      servicesProgSmoothed += (pRaw - servicesProgSmoothed) * SERVICES_PROG_LERP;
    }
    servicesApplyScrollVars(servicesProgSmoothed);

    servicesFocusCur.x += (servicesFocusTarget.x - servicesFocusCur.x) * SERVICES_ATMO_LERP;
    servicesFocusCur.y += (servicesFocusTarget.y - servicesFocusCur.y) * SERVICES_ATMO_LERP;
    var focusDelta =
      Math.abs(servicesFocusTarget.x - servicesFocusCur.x) + Math.abs(servicesFocusTarget.y - servicesFocusCur.y);
    servicesBand.style.setProperty("--focus-x", servicesFocusCur.x.toFixed(2) + "%");
    servicesBand.style.setProperty("--focus-y", servicesFocusCur.y.toFixed(2) + "%");

    if (servicesRail) {
      var p = servicesProgSmoothed;
      var drift = (p - 0.5) * 8;
      servicesRail.style.opacity = String(0.22 + svcSmooth5(0, 0.5, p) * 0.2);
      servicesRail.style.transform = "translate3d(0, calc(-50% + " + drift.toFixed(2) + "px), 0)";
    }

    if (
      servicesScrollyNeedsTick ||
      Math.abs(pRaw - servicesProgSmoothed) > SERVICES_SETTLE_EPS ||
      focusDelta > SERVICES_FOCUS_SETTLE_EPS
    ) {
      servicesScrollyNeedsTick = false;
      servicesScrollyRaf = window.requestAnimationFrame(servicesScrollyTick);
    }
  }

  function reqServicesScrolly() {
    servicesScrollyNeedsTick = true;
    if (servicesScrollyRaf == null) servicesScrollyRaf = window.requestAnimationFrame(servicesScrollyTick);
  }

  function servicesSetPointerFocus(el, on) {
    if (!servicesBand || !el) return;
    servicesPointerFocus = on;
    if (on) {
      var f = servicesParseFocus(el);
      servicesFocusTarget.x = f.x;
      servicesFocusTarget.y = f.y;
      servicesBand.classList.add("is-atmo-focus");
    } else {
      servicesPointerFocus = false;
      var p = servicesScrollProgress();
      var dom = servicesDomFromProgress(p);
      var f2 = SERVICES_DOM_FOCUS[dom] || SERVICES_FOCUS_DEFAULT;
      servicesFocusTarget.x = f2.x;
      servicesFocusTarget.y = f2.y;
      servicesBand.classList.toggle("is-atmo-focus", p > 0.08);
    }
    reqServicesScrolly();
  }

  if (servicesBand && servicesTrack) {
    var servicesFocusEls = servicesBand.querySelectorAll("[data-service-focus]");

    servicesFocusEls.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        servicesSetPointerFocus(el, true);
      });
      el.addEventListener("focusin", function () {
        servicesSetPointerFocus(el, true);
      });
      el.addEventListener("mouseleave", function () {
        servicesSetPointerFocus(null, false);
      });
      el.addEventListener("focusout", function () {
        if (!servicesBand.contains(document.activeElement)) servicesSetPointerFocus(null, false);
      });
    });

    function servicesScrollyEnabled() {
      return (
        !reduceMotion &&
        window.matchMedia(
          "(min-width: " + SERVICES_SCROLL_MIN_W + "px) and (min-height: " + SERVICES_SCROLL_MIN_H + "px)"
        ).matches
      );
    }

    function servicesResetVars() {
      servicesProgSmoothed = 0;
      servicesBand.removeAttribute("data-svc-dom");
      servicesBand.classList.remove(
        "is-atmo-focus",
        "is-rail-active",
        "is-scrolly-wow",
        "is-svc-phase-hero",
        "is-svc-phase-panels",
        "is-svc-phase-statement",
        "is-svc-phase-cta",
        "is-svc-cards-locked"
      );
      document.body.classList.remove("services-inview");
      [
        "--svc-p",
        "--svc-intro",
        "--svc-hero",
        "--svc-s1",
        "--svc-s2",
        "--svc-s3",
        "--svc-statement",
        "--svc-cta",
        "--svc-bg-y",
        "--svc-head-y",
        "--svc-panels",
        "--svc-hero-layout",
        "--svc-hero-focus",
        "--svc-cards-lock",
        "--svc-cards-dim",
        "--focus-x",
        "--focus-y",
      ].forEach(function (key) {
        servicesBand.style.removeProperty(key);
      });
      if (servicesRail) {
        servicesRail.style.opacity = "";
        servicesRail.style.transform = "";
      }
    }

    function servicesStartScrolly() {
      if (!servicesScrollyEnabled()) {
        servicesScrollyActive = false;
        servicesBand.classList.add("is-scrolly-static");
        servicesBand.classList.remove("is-scrolly-wow");
        servicesResetVars();
        servicesBand.classList.add("is-rail-active");
        return;
      }
      servicesBand.classList.remove("is-scrolly-static");
      servicesBand.classList.add("is-scrolly-wow");
      servicesScrollyActive = true;
      reqServicesScrolly();
    }

    if ("IntersectionObserver" in window) {
      var servicesScrollyIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              document.body.classList.add("services-inview");
              servicesBand.classList.add("is-rail-active");
              servicesStartScrolly();
            } else {
              servicesScrollyActive = false;
              if (servicesScrollyRaf) {
                window.cancelAnimationFrame(servicesScrollyRaf);
                servicesScrollyRaf = null;
              }
              servicesResetVars();
            }
          });
        },
        { threshold: 0.02, rootMargin: "0px 0px 0px 0px" }
      );
      servicesScrollyIo.observe(servicesTrack);
    }

    window.addEventListener(
      "scroll",
      function () {
        if (servicesScrollyActive) reqServicesScrolly();
      },
      { passive: true }
    );
    window.addEventListener(
      "resize",
      function () {
        servicesStartScrolly();
        if (servicesScrollyActive) reqServicesScrolly();
      },
      { passive: true }
    );

    if (!servicesScrollyEnabled()) {
      servicesBand.classList.add("is-scrolly-static");
      servicesBand.classList.add("is-rail-active");
    }
  }

  /* Dolny akt — delikatne scrollytelling + reakcja kart na kursor */
  var processStory = document.querySelector("[data-process-story]");
  var processCards = Array.prototype.slice.call(document.querySelectorAll("[data-process-card]"));
  var processNumber = document.querySelector("[data-process-number]");
  var processTitle = document.querySelector("[data-process-title]");
  var processRaf = null;

  function processEnhancedMotionAllowed() {
    return !reduceMotion && window.matchMedia("(min-width: " + PROCESS_ENHANCED_MIN_WIDTH + "px)").matches;
  }

  function setActiveProcessCard(card) {
    if (!card || card.classList.contains("is-active")) return;
    processCards.forEach(function (item) {
      item.classList.toggle("is-active", item === card);
    });
    if (processNumber) processNumber.textContent = card.getAttribute("data-step") || "";
    if (processTitle) {
      var h = card.querySelector("h3");
      processTitle.textContent = h ? h.textContent : "";
    }
  }

  function updateProcessProgress() {
    processRaf = null;
    if (!processStory) return;
    var rect = processStory.getBoundingClientRect();
    var range = Math.max(1, rect.height - window.innerHeight * 0.28);
    var progress = (window.innerHeight * 0.42 - rect.top) / range;
    progress = Math.min(1, Math.max(0, progress));
    processStory.style.setProperty("--process-progress", progress.toFixed(3));
  }

  function requestProcessProgress() {
    if (!processStory || processRaf != null) return;
    processRaf = requestAnimationFrame(updateProcessProgress);
  }

  if (processStory && processCards.length) {
    if (processEnhancedMotionAllowed() && "IntersectionObserver" in window) {
      var processIo = new IntersectionObserver(
        function (entries) {
          var activeEntry = null;
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            if (!activeEntry || entry.intersectionRatio > activeEntry.intersectionRatio) {
              activeEntry = entry;
            }
          });
          if (activeEntry) setActiveProcessCard(activeEntry.target);
        },
        { rootMargin: "-38% 0px -42% 0px", threshold: [0.2, 0.45, 0.7] }
      );
      processCards.forEach(function (card) {
        processIo.observe(card);
      });
      window.addEventListener("scroll", requestProcessProgress, { passive: true });
      window.addEventListener("resize", requestProcessProgress, { passive: true });
      updateProcessProgress();
    } else {
      processStory.style.setProperty("--process-progress", "1");
    }
  }

  var depthCards = Array.prototype.slice.call(document.querySelectorAll("[data-depth-card]"));
  var depthFinePointer = window.matchMedia("(min-width: 960px) and (pointer: fine)").matches;
  if (depthCards.length && !reduceMotion && depthFinePointer) {
    depthCards.forEach(function (card) {
      card.addEventListener(
        "pointermove",
        function (e) {
          var rect = card.getBoundingClientRect();
          var x = ((e.clientX - rect.left) / rect.width) * 100;
          var y = ((e.clientY - rect.top) / rect.height) * 100;
          var dx = ((x - 50) / 50) * 4;
          var dy = ((y - 50) / 50) * 4;
          card.style.setProperty("--mx", x.toFixed(1) + "%");
          card.style.setProperty("--my", y.toFixed(1) + "%");
          card.style.setProperty("--dx", dx.toFixed(2) + "px");
          card.style.setProperty("--dy", dy.toFixed(2) + "px");
        },
        { passive: true }
      );
      card.addEventListener(
        "pointerleave",
        function () {
          card.style.removeProperty("--dx");
          card.style.removeProperty("--dy");
          card.style.setProperty("--mx", "50%");
          card.style.setProperty("--my", "0%");
        },
        { passive: true }
      );
    });
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
      var phoneEl = document.getElementById("contact-phone");
      var msgEl = document.getElementById("contact-message");
      var hpEl = document.getElementById("contact-company");
      if (!nameEl || !emailEl || !msgEl) return;

      var name = String(nameEl.value || "").trim();
      var email = String(emailEl.value || "").trim();
      var phone = phoneEl ? String(phoneEl.value || "").trim() : "";
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
        phone: phone,
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

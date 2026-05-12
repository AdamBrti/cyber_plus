/**
 * Cyber Plus — cinematic interactions
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var hero = document.querySelector(".hero-cinematic");

  /* Header scroll state */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add("is-scrolled");
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
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    if (Math.abs(targetX - curX) < 0.05 && Math.abs(targetY - curY) < 0.05) {
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

  if (!reduceMotion && hero && window.matchMedia("(min-width: 900px)").matches) {
    window.addEventListener(
      "mousemove",
      function (e) {
        var cx = window.innerWidth / 2;
        var cy = window.innerHeight / 2;
        targetX = (e.clientX - cx) * 0.06;
        targetY = (e.clientY - cy) * 0.05;
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
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  revealObserve(".reveal", "is-inview");
  revealObserve(".reveal-stagger", "is-inview");

  /* Sticky mobile CTA */
  var sticky = document.getElementById("sticky-cta");
  var showAfter = 0.12 * window.innerHeight;
  var shown = false;

  function onScrollSticky() {
    if (!sticky || window.innerWidth >= 700) return;
    if (window.scrollY > showAfter) {
      if (!shown) {
        sticky.classList.add("is-visible");
        sticky.setAttribute("aria-hidden", "false");
        shown = true;
      }
    } else if (window.scrollY < showAfter * 0.45) {
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
        var mid = r.top + r.height * 0.45;
        var t = (mid - vh * 0.48) / (vh * 0.75);
        if (t > 1) t = 1;
        if (t < -1) t = -1;
        inner.style.setProperty("--spx", (t * -12).toFixed(2) + "px");
        inner.style.setProperty("--spy", (t * -8).toFixed(2) + "px");
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
})();

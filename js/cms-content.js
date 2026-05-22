(function () {
  "use strict";

  var CONTENT_URLS = {
    site: "/content/settings/site.json",
    contact: "/content/settings/contact.json",
    seo: "/content/settings/seo.json",
    home: "/content/pages/home.json",
    services: "/content/collections/services.json",
    cases: "/content/collections/case-studies.json",
    faq: "/content/collections/faq.json",
    testimonials: "/content/collections/testimonials.json",
  };

  function fetchJson(url) {
    return fetch(url, { credentials: "same-origin", cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) throw new Error("CMS content missing: " + url);
        return response.json();
      })
      .catch(function () {
        return null;
      });
  }

  function text(selector, value) {
    var node = document.querySelector(selector);
    if (node && value) node.textContent = value;
  }

  function attr(selector, name, value) {
    var nodes = document.querySelectorAll(selector);
    if (!value) return;
    Array.prototype.forEach.call(nodes, function (node) {
      node.setAttribute(name, value);
    });
  }

  function absoluteUrl(siteUrl, path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return String(siteUrl || window.location.origin).replace(/\/$/, "") + "/" + String(path).replace(/^\//, "");
  }

  function setMeta(name, value, property) {
    if (!value) return;
    var selector = property ? 'meta[property="' + name + '"]' : 'meta[name="' + name + '"]';
    var node = document.querySelector(selector);
    if (node) node.setAttribute("content", value);
  }

  function updateSeo(content) {
    var site = content.site || {};
    var seo = content.seo || {};
    var homeSeo = content.home && content.home.seo ? content.home.seo : {};
    var title = homeSeo.title || seo.default_title;
    var description = homeSeo.description || seo.default_description;
    var ogImage = absoluteUrl(site.site_url, homeSeo.og_image || seo.og_image);

    if (title) document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:image", ogImage, true);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);
  }

  function updateHero(home) {
    var hero = home && home.hero ? home.hero : null;
    var ctas = hero && Array.isArray(hero.ctas) ? hero.ctas : [];
    if (!hero) return;

    text(".hero-kicker", hero.kicker);
    text("#hero-heading", hero.headline);
    text(".hero-lead", hero.subheadline);
    if (ctas[0]) {
      text(".hero-cta-row .btn-primary", ctas[0].label);
      attr(".hero-cta-row .btn-primary", "href", ctas[0].url);
    }
    if (ctas[1]) {
      text(".hero-cta-row .btn-ghost", ctas[1].label);
      attr(".hero-cta-row .btn-ghost", "href", ctas[1].url);
    }
  }

  function updateServices(services) {
    var items = services && Array.isArray(services.items) ? services.items : [];
    var slots = document.querySelectorAll(".services-scrolly__hero-copy, .services-scrolly__panel");
    text("#services-heading", services && services.heading);

    Array.prototype.forEach.call(slots, function (slot, index) {
      var item = items[index];
      if (!item) return;
      textIn(slot, ".services-scrolly__title", item.title);
      textIn(slot, ".services-scrolly__desc", item.description);
      textIn(slot, ".services-scrolly__meta", item.meta);
      textIn(slot, ".services-scrolly__link", item.cta_label);
      var link = slot.querySelector(".services-scrolly__link");
      if (link && item.cta_url) link.setAttribute("href", item.cta_url);
    });
  }

  function textIn(root, selector, value) {
    var node = root.querySelector(selector);
    if (node && value) node.textContent = value;
  }

  function updateCases(cases) {
    var items = cases && Array.isArray(cases.items) ? cases.items : [];
    text("#portfolio-heading", cases && cases.heading);
    text("#realizacje .section-lead", cases && cases.lead);

    Array.prototype.forEach.call(document.querySelectorAll(".showcase-case"), function (card, index) {
      var item = items[index];
      if (!item) return;
      textIn(card, ".showcase-title", item.name);
      textIn(card, ".showcase-eyebrow", item.meta);
      textIn(card, ".showcase-mobile-summary", item.summary);
      setStory(card, 0, "Problem", item.problem);
      setStory(card, 1, "Zmiana", item.change);
      textIn(card, ".showcase-effect", item.result ? "Efekt: " + item.result : "");
      textIn(card, ".showcase-domain", item.url ? item.url.replace(/^https?:\/\//, "").replace(/\/$/, "") : "");
      attrIn(card, ".showcase-actions a", "href", item.url);
      attrIn(card, ".showcase-hit", "href", item.url);
    });
  }

  function setStory(root, index, label, value) {
    var nodes = root.querySelectorAll(".showcase-story");
    if (nodes[index] && value) nodes[index].textContent = label + ": " + value;
  }

  function attrIn(root, selector, name, value) {
    var node = root.querySelector(selector);
    if (node && value) node.setAttribute(name, value);
  }

  function updateFaq(faq) {
    var items = faq && Array.isArray(faq.items) ? faq.items : [];
    text("#faq-heading", faq && faq.heading);
    text("#faq .section-lead", faq && faq.lead);

    Array.prototype.forEach.call(document.querySelectorAll("#faq .faq-item"), function (itemNode, index) {
      var item = items[index];
      if (!item) return;
      var button = itemNode.querySelector("button");
      var icon = button ? button.querySelector(".icon") : null;
      var answer = itemNode.querySelector(".faq-panel-inner p");
      if (button && item.question) {
        button.textContent = item.question + " ";
        if (icon) button.appendChild(icon);
      }
      if (answer && item.answer) answer.textContent = item.answer;
    });
  }

  function updateContact(contact) {
    if (!contact) return;
    var mailHref = contact.email ? "mailto:" + contact.email : "";
    text(".cta-mail-hint a", contact.email);
    attr(".cta-mail-hint a", "href", mailHref);
    text(".footer-legal a[href^='mailto:']", contact.email);
    attr(".footer-legal a[href^='mailto:']", "href", mailHref);
    text(".footer-legal a[href^='tel:']", contact.phone_display);
    attr(".footer-legal a[href^='tel:']", "href", contact.phone_href ? "tel:" + contact.phone_href : "");
    text(".footer-legal p:nth-child(2)", contact.address);
  }

  function init() {
    Promise.all(Object.keys(CONTENT_URLS).map(function (key) {
      return fetchJson(CONTENT_URLS[key]).then(function (data) {
        return [key, data];
      });
    })).then(function (pairs) {
      var content = {};
      pairs.forEach(function (pair) {
        content[pair[0]] = pair[1];
      });

      updateSeo(content);
      updateHero(content.home);
      updateServices(content.services);
      updateCases(content.cases);
      updateFaq(content.faq);
      updateContact(content.contact);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

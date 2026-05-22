(function () {
  "use strict";

  if (!window.CMS) return;

  function value(entry, path, fallback) {
    var current = entry && entry.getIn ? entry : null;
    if (!current) return fallback || "";
    var parts = path.split(".");
    var result = current.getIn(["data"].concat(parts));
    return result == null ? fallback || "" : result;
  }

  function list(entry, path) {
    var data = value(entry, path);
    return data && data.toJS ? data.toJS() : Array.isArray(data) ? data : [];
  }

  function el(tag, attrs, children) {
    var createElement = window.h || (window.React && window.React.createElement);
    if (!createElement) return null;
    return createElement(tag, attrs || {}, children || []);
  }

  function card(item) {
    return el("article", { className: "cms-preview__card" }, [
      el("strong", {}, item.title || item.question || item.name || "Pozycja"),
      el("p", {}, item.description || item.answer || item.summary || item.quote || ""),
    ]);
  }

  function PreviewShell(props) {
    return el("main", { className: "cms-preview" }, props.children);
  }

  CMS.registerPreviewStyle("/admin/preview.css");

  CMS.registerPreviewTemplate("home", function (props) {
    var entry = props.entry;
    var hero = value(entry, "hero");
    var ctas = list(entry, "hero.ctas");
    return el("main", { className: "cms-preview" }, [
      el("p", { className: "cms-preview__label" }, value(entry, "hero.kicker", "Hero")),
      el("h1", {}, value(entry, "hero.headline", "Nagłówek hero")),
      el("p", {}, value(entry, "hero.subheadline", "")),
      ctas.length ? el("a", { className: "cms-preview__cta", href: ctas[0].url || "#" }, ctas[0].label || "CTA") : null,
      hero ? null : el("p", {}, "Uzupełnij pola hero."),
    ]);
  });

  CMS.registerPreviewTemplate("services", function (props) {
    var items = list(props.entry, "items");
    return el("main", { className: "cms-preview" }, [
      el("p", { className: "cms-preview__label" }, "Usługi"),
      el("h2", {}, value(props.entry, "heading", "Usługi")),
      el("p", {}, value(props.entry, "lead", "")),
      el("div", { className: "cms-preview__grid" }, items.map(card)),
    ]);
  });

  CMS.registerPreviewTemplate("faq", function (props) {
    var items = list(props.entry, "items");
    return el("main", { className: "cms-preview" }, [
      el("p", { className: "cms-preview__label" }, "FAQ"),
      el("h2", {}, value(props.entry, "heading", "FAQ")),
      el("div", { className: "cms-preview__list" }, items.map(card)),
    ]);
  });

  CMS.registerPreviewTemplate("case_studies", function (props) {
    var items = list(props.entry, "items");
    return el("main", { className: "cms-preview" }, [
      el("p", { className: "cms-preview__label" }, "Realizacje"),
      el("h2", {}, value(props.entry, "heading", "Realizacje")),
      el("div", { className: "cms-preview__grid" }, items.map(card)),
    ]);
  });
})();

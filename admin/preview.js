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

  function object(entry, path) {
    var data = value(entry, path);
    return data && data.toJS ? data.toJS() : data || {};
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

  function points(items) {
    return el(
      "ul",
      { className: "cms-preview__list" },
      (items || []).map(function (item) {
        var text = typeof item === "string" ? item : item && (item.item || item.label || item.value);
        return el("li", {}, text || "");
      })
    );
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

  CMS.registerPreviewTemplate("technology", function (props) {
    var entry = props.entry;
    var heavy = object(entry, "heavy");
    var light = object(entry, "light");
    var note = object(entry, "note");
    var metrics = list(entry, "metrics");
    return el("main", { className: "cms-preview" }, [
      el("p", { className: "cms-preview__label" }, value(entry, "label", "Technologia")),
      el("h2", {}, value(entry, "heading", "Technologia")),
      el("p", {}, value(entry, "lead", "")),
      el("div", { className: "cms-preview__grid" }, [
        el("article", { className: "cms-preview__card" }, [
          el("p", { className: "cms-preview__label" }, heavy.label || "cięższy wariant"),
          el("strong", {}, heavy.title || "Panel CMS"),
          points(heavy.points || []),
        ]),
        el("article", { className: "cms-preview__card" }, [
          el("p", { className: "cms-preview__label" }, light.label || "nasz kierunek"),
          el("strong", {}, light.title || "Panel custom code"),
          points(light.points || []),
        ]),
      ]),
      el("article", { className: "cms-preview__card" }, [
        el("strong", {}, note.summary || "Notatka"),
        el("p", {}, note.body || ""),
      ]),
      el("div", { className: "cms-preview__grid" }, metrics.map(function (item) {
        return el("article", { className: "cms-preview__card" }, [
          el("strong", {}, item.value || ""),
          el("p", {}, item.label || ""),
        ]);
      })),
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

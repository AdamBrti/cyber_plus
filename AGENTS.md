# Cyber Plus — notes for AI coding agents

Short, actionable context for edits in this repo. Language of the **site content** is Polish (`lang="pl"`).

## What this is

- **Static marketing site** for Cyber Plus (web design / landing / SEO positioning).
- **No bundler, no npm**: plain HTML, CSS, vanilla JavaScript.
- **Deploy**: upload files as-is; paths are relative (`css/`, `js/`, `assets/`). Opcjonalnie **Cloudflare Pages** z folderem `functions/` (endpoint `POST /api/contact` + Resend) — instrukcja: `docs/CLOUDFLARE_PAGES_CONTACT.md`.

## File map

| Area | Path |
|------|------|
| Home | `index.html` |
| Portfolio | `portfolio.html` |
| Local SEO landing pages | `strony-internetowe-szczecin.html`, `strony-internetowe-rzeszow.html` |
| Legal | `polityka-prywatnosci.html`, `regulamin.html` |
| Global layout + home visuals | `css/main.css` (large; design tokens in `:root`) |
| Subpage-specific layout stubs | `css/pages.css` |
| All interactivity | `js/main.js` (single IIFE, `"use strict"`) |
| SEO / crawlers | `sitemap.xml`, `robots.txt` |
| Formularz kontaktu (Pages + Resend) | `functions/api/contact.js`, sekcja `#kontakt` w `index.html`, obsługa w `js/main.js` |
| Brand assets | `assets/` (e.g. logos referenced in meta and header) |

## UI / UX specification (for ports and other agents)

- **`docs/UI_UX.md`** — bullet-point spec (tokens, breakpoints, components) plus **§20–21: pełny opis hero landing i spójności sekcji pod hero** — używaj przy nowych stronach w tym design systemie.
- When reusing this project’s look elsewhere, treat that file plus `:root` in `css/main.css` as the **source of settings**.

## Conventions (do not fight the codebase)

### HTML

- Keep **semantic structure**, **ARIA** where patterns already exist (FAQ buttons, mobile nav, sticky CTA).
- **Canonical / OG / Twitter** and **`application/ld+json`** blocks: when changing domain, email, or URLs, align **all** HTML files plus `sitemap.xml` and comments that mention production (see `index.html` head comment).
- **GA4 / GTM**: commented placeholder in `<head>` — do not inject tracking keys into the repo unless the owner asks.

### CSS

- **Design system lives in `:root`** on `main.css` (colors, radii, fonts, spacing). Prefer **new values as variables** or reuse existing tokens; avoid one-off magic numbers next to established scales.
- **Subpages** share tokens; page-specific layout often uses classes documented implicitly in `pages.css` (`--page-*` variables are defined in `main.css` `:root`).

### JavaScript (`js/main.js`)

- **ES5-style** `var`, function expressions, IIFE — intentional for broad compatibility without a build step.
- **Constants** for timings and thresholds are grouped at the top of the file; adjust there instead of scattering literals.
- **`prefers-reduced-motion: reduce`**: motion-heavy features must stay disabled or simplified when `reduceMotion` is true (existing pattern).
- **Passive** `scroll` / `mousemove` listeners where applicable.
- **Do not rename** elements relied on by script without updating selectors:

  | Role | Selector / ID |
  |------|----------------|
  | Hero parallax | `.hero-cinematic` |
  | Header state | `.site-header` |
  | Scroll reveal | `.reveal`, `.reveal-stagger` → class `is-inview` |
  | Sticky CTA | `#sticky-cta` |
  | FAQ accordion | `.faq-item` + `button`, `.icon` |
  | Showcase parallax | `[data-showcase-parallax]` + inner `.showcase-devices` |
  | Pillars section body class | `#rozwiazanie` → toggles `pillars-atelier-inview` on `body` |
  | Year in footer | `#y` |
  | Formularz kontaktu | `#contact-form`, `#contact-form-status`, `#contact-submit` |
  | Mobile nav | `#nav-menu-toggle`, `#nav-mobile-panel`, `#nav-mobile-backdrop`, `#nav-mobile-close`, `body.nav-open` |

- **Nav breakpoint** is tied to `NAV_BREAKPOINT_MIN` (900) in JS and should stay consistent with CSS breakpoints for the menu.

## Safe change patterns

- **Copy / offer text**: edit HTML only; watch heading hierarchy for SEO.
- **New section on home**: mirror existing section markup + classes; add reveal classes if scroll animation is desired.
- **New static page**: copy structure from an existing subpage, link from header/footer/sitemap, add entry to `sitemap.xml` if indexable.

## Out of scope unless requested

- Introducing React/Vite/Webpack without an explicit migration task.
- Splitting `main.css` without a coordinated plan (file is large but cohesive).
- Removing accessibility attributes for styling convenience.

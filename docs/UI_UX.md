# Cyber Plus — specyfikacja UI / UX (dla agentów i portów designu)

Dokument opisuje **wygląd, zachowanie i tokeny** z `css/main.css`, `css/pages.css` i `js/main.js`. Można go traktować jako checklistę przy klonowaniu stylu na inny projekt.

Źródło prawdy w kodzie: zmienne w `:root` w `main.css`; tutaj wartości **jak wdrożone** (nie zastępują czytania selektorów przy nietypowych override’ach).

---

## 1. Charakter produktu (jednym akapitem)

- **Klimat:** ciemny „tech / cinematic” na body i w hero, potem **naprzemienne pasy** (`section.band`): jasne „editorial / premium” (`band--dawn`, `band--atelier`, `band--silver`, `band--showcase`) i ciemne (`band--navy`, `band--immersive`, `band--finale`, `band--void`).
- **Tło globalne:** subtelna siatka (`.bg-grid`), poświata od góry (`.bg-glow`), na desktopie delikatna poświata za kursorem (`.cursor-glow` + zmienne `--cursor-x` / `--cursor-y` z JS).
- **Typografia:** nagłówki i akcent display w **Syne**; tekst bieżący **Instrument Sans**; etykiety techniczne / micro **JetBrains Mono**.
- **Mobile-first:** nawigacja desktopowa od **900px**; wiele layoutów ma też **1024px**, **1280px**, **520px** itd. (patrz sekcja 7).

---

## 2. Tokeny kolorów (`:root`)

| Token | Wartość | Rola |
|--------|---------|------|
| `--bg-void` | `#05080d` | Tło bazowe `body` |
| `--bg-deep` | `#070f18` | Warstwy głębi |
| `--bg-elevated` | `#0a1018` | Powierzchnie podniesione |
| `--surface` | `#0c121c` | Karty / powierzchnie |
| `--surface-2` | `#111a28` | Drugi poziom surface |
| `--border` | `rgba(120, 140, 180, 0.14)` | Linie, obramowania subtelne |
| `--border-strong` | `rgba(160, 190, 255, 0.22)` | Mocniejszy border (np. ghost button) |
| `--text` | `#f0f3fa` | Tekst główny na ciemnym |
| `--text-muted` | `#9aa6c0` | Tekst drugorzędny |
| `--text-dim` | `#6a758e` | Meta / stopka |
| `--accent` | `#7eb4ff` | Akcent linków / focus |
| `--accent-deep` | `#3d7fd4` | Koniec gradientu CTA |
| `--accent-glow` | `rgba(126, 180, 255, 0.45)` | Świecenie |
| `--warm` | `#e8c4a8` | Akcent ciepły |
| `--ice` | `#a8d4ff` | Hover na ghost / FAQ |
| `--ink` | `#0a0f18` | Tekst na jasnych pasach |
| `--ink-muted` | `#3d4d66` | Lead na jasnym |
| `--mist-0` … `--mist-2` | od `#fcfdff` w dół | Skala jasnych płaszczyzn |
| `--neon` | `#8ec8ff` | Akcenty PCB / tech |
| `--pcb-cyan` | `#46e8ff` | Linie / punkty PCB w hero |
| `--pcb-violet` | `#a78bfa` | Drugi akcent PCB |

**Pasek przeglądarki (meta):** `theme-color` = `#030508` (z `index.html`).

---

## 3. Typografia i rytm

- **Body:** `font-size: 1.0625rem` (17px), `line-height: 1.6`, `font-family: var(--font-sans)`, `-webkit-font-smoothing: antialiased`.
- **Font stack:** `--font-sans` = Instrument Sans + system-ui; `--font-display` / `--font-serif` = Syne; `--font-mono` = JetBrains Mono.
- **Sekcje:** pionowy padding sekcji (poza hero cinematic) = `var(--section-pad)` = `clamp(4.5rem, 12vw, 9rem)`.
- **Kontener treści:** `.wrap` → `max-width: var(--max-w)` (**1180px**), poziomy padding `clamp(1.25rem, 4vw, 2rem)`; `.wrap--wide` → **1400px** (np. header inner).
- **Scroll:** `html { scroll-behavior: smooth; scroll-padding-top: clamp(4rem, 11vw, 5.5rem); }` — offset pod fixed header; przy `prefers-reduced-motion: reduce` → `scroll-behavior: auto` + skrócone animacje globalnie (`0.01ms` hack na `*`).

---

## 4. Skala promieni (nazewnictwo)

Pełna lista w `:root` — przykłady użycia w UI:

| Token | px (skala) | Typowe użycie |
|--------|------------|----------------|
| `--radius-pill` | 999px | Przyciski `.btn` |
| `--radius-ui` / `--radius-ui-sm` | 12 / 10px | Toggle menu, chipy |
| `--radius-md` | 14px | Skip link |
| `--radius-crisp` | 4px | Focus FAQ |
| `--radius-showcase` | 30px | Duże ramy / showcase |
| `--radius-device-outer` | 42px | „Urządzenia” w hero |

Nowe komponenty: **najpierw** szukaj istniejącego `--radius-*`, unikaj losowych `px`.

---

## 5. Easing i czasy (powtarzalne „feel”)

- `--ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)` — dominujący „premium snap”.
- `--ease-soft`: `cubic-bezier(0.33, 1, 0.68, 1)` — m.in. toggle menu.
- **Przyciski:** transition ~`0.35s` na tło / border / color / transform / box-shadow.
- **Reveal wejścia w viewport:** `0.55s` opacity + translateY.
- **Sticky CTA:** `0.4s` transform + opacity.
- **Panel mobilny:** `0.38s` transform + visibility.

---

## 6. Atmosfera tła (warstwy wizualne)

- **`.bg-grid`:** fixed, `z-index: 0`, `opacity: 0.28`, podwójna siatka 72px + 18px, maska radialna (cięcie u góry).
- **`.bg-glow`:** fixed, szerokość `min(160vw, 1400px)`, wysokość ~85vh, dwa radialne niebieskie gradienty, `pointer-events: none`, `z-index: 0`.
- **`.cursor-glow`:** 480px koło, gradient `rgba(126,180,255,0.07)`, pozycja z `--cursor-x` / `--cursor-y`; widoczne przy `body:hover`; **wyłączone** na `(max-width: 900px)` lub `prefers-reduced-motion: reduce`.

---

## 7. Breakpointy (najczęstsze w CSS)

Użyj tych wartości przy **nowych** media queries, żeby nie rozjeżdżać spójności z JS:

| Zakres | Zastosowanie |
|--------|----------------|
| **899px i mniej** | Widoczny przycisk „Kontakt” w pasku mobile (`.nav-mobile-cta`), hamburger |
| **900px i więcej** | Grid headera (slot logo + nawigacja), desktop nav, **zgodność z `NAV_BREAKPOINT_MIN` w `main.js`** |
| **700px i więcej** | `.sticky-cta { display: none }` (w CSS); w JS sticky logika wyłączona przy `innerWidth >= 700` (`STICKY_CTA_MAX_WIDTH_PX`) |
| **1024px** | M.in. korekty hero PCB / layoutów |
| **1180px** | `--max-w` — główna szerokość treści |
| **1280px i więcej** | Pionowy pasek `.tech-rail` (mono, uppercase, po prawej) |
| **520px** | Niektóre zwężenia typografii / gridów |

---

## 8. Header i nawigacja

### Desktop (≥900px)

- **`.site-header`:** `position: fixed`, `z-index: 60`, gradient półprzezroczysty + `backdrop-filter: blur(12px)`, dół przezroczysty.
- **Scroll:** po `scrollY > 24px` (JS) klasa **`.is-scrolled`** → border dół `var(--border)`, tło `rgba(6, 10, 16, 0.88)`.
- **`.nav-desktop`:** linki sekcji + **`.btn.btn-primary`** na „Kontakt” (wymuszone `color: #030712` przez wyższą specyficzność).

### Mobile (<900px)

- **`.header-mobile-tools`:** hamburger + CTA Kontakt.
- **`.nav-menu-toggle`:** 2.65rem kwadrat, border `rgba(126,180,255,0.28)`, animacja trzech kresek → X przy **`body.nav-open`**.
- **`.nav-mobile-backdrop`:** `z-index: 68`, blur, półprzezroczysty; pokazany tylko przy `nav-open`.
- **`.nav-mobile-panel`:** `z-index: 70`, szerokość `min(20.5rem, 90vw)`, wysuw z prawej (`translateX`), gradient tła panelu, `role="dialog"` + `aria-modal` w HTML.
- **UX (JS):** Escape zamyka; focus na pierwszy link po otwarciu; po kliknięciu linka — zamknięcie bez focusu na toggle; `overflow: hidden` na `body` gdy otwarte.

---

## 9. Przyciski

- **Baza `.btn`:** inline-flex, gap `0.5rem`, padding `0.8rem 1.5rem`, font `0.875rem`, weight `600`, `letter-spacing: 0.02em`, **`border-radius: var(--radius-pill)`**.
- **`.btn-primary`:** gradient 135deg (`#a8c8f5` → `#6ea6f0` → `var(--accent-deep)`), tekst `#030712`; hover: lekki `translateY(-1px)`, `box-shadow` niebieski.
- **`.btn-ghost`:** półprzezroczyste tło, border `var(--border-strong)`; hover: jaśniejszy border i tło z akcentem.
- **`.btn-row`:** flex wrap, gap `0.85rem`, `margin-top: 2rem`.
- **Wariant szklany w hero:** klasa **`btn--glass`** obok `btn-ghost` (dodatkowe style w sekcji hero).

---

## 10. Hero „cinematic”

- **Kontener:** `.hero-cinematic` (+ modyfikatory np. `.hero--fusion`).
- **Warstwy atmosfery:** `.hero-atmo` z dziećmi (`.hero-noise`, `.hero-volumetric`, `.hero-light-canopy`, itd.) — wszystkie dekoracyjne, `aria-hidden` gdzie trzeba.
- **Treść:** `.hero-inner` w `.wrap`; kicker `.hero-kicker`, nagłówek `.hero-headline`, lead `.hero-lead`, CTA `.hero-cta-row`, microcopy `.hero-micro` (mono, uppercase, dwie linie).
- **Scena:** `.hero-stage` / `.hero-scene` z PCB SVG (kolory zgodne z `--pcb-cyan` / `--pcb-violet`), bloom, halo, karty realizacji `.hero-work`.
- **Parallax (JS + CSS):** zmienne `--hero-parallax-x` / `--hero-parallax-y` ustawiane z RAF; na desktopie śledzenie myszy (współczynniki w stałych `PARALLAX_*`); **wyłączone** przy reduced motion lub braku `.hero-cinematic`.

---

## 11. Sekcje `section.band` (dual dark / light)

- Domyślnie każda sekcja poza `.hero-cinematic`: **padding pionowy** `var(--section-pad)`, **border-top** `1px solid var(--border)`.
- **`.band--story-problem`:** pierwszy pas pod hero — ujemny `margin-top` + większy padding góra, **jasna** „krawędź” (`inset box-shadow`).
- **Jasne tła (tekst `--ink`):** `band--dawn`, `band--atelier`, `band--silver`, `band--showcase` — gradienty od bieli / szaro-niebieskiego.
- **Ciemne tła (tekst `--text`):** `band--navy`, `band--immersive`, `band--finale`, `band--void` — granat / czern z subtelnym cyan w radialach.
- **Etykiety sekcji** (`.section-label`) na jasnym: kolor ok. `#15406e`, `font-weight: 600`.
- **`.tech-rail`:** widoczny od **1280px**, chowa się (opacity + visibility) gdy sekcja **`#rozwiazanie`** jest w viewport (klasa `body.pillars-atelier-inview` z IntersectionObserver w JS).

---

## 12. Scroll reveal i stagger

- **Klasy:** `.reveal` oraz `.reveal-stagger` (dzieci animowane osobno).
- **Stan końcowy:** `.is-inview` (dodawany przez `IntersectionObserver` w `main.js`, potem `unobserve`).
- **CSS:** start `opacity: 0`, `translateY(22px)` (stagger: 20px na dzieciach); czas **0.55s** + `var(--ease-out)`; opóźnienia stagger **0.05s … 0.3s** dla dzieci 1–6 (siódme i dalej — patrz plik CSS jeśli dodajesz więcej).
- **Reduced motion:** od razu widoczne, bez transition.

---

## 13. Sticky CTA (mobile)

- **HTML:** `#sticky-cta`, klasa `.sticky-cta`; `aria-hidden` przełączany w JS.
- **Wygląd:** fixed bottom, gradient przezroczysty → ciemne tło, `translateY(100%)` do wejścia; `padding` uwzględnia `env(safe-area-inset-bottom)`.
- **Logika JS:** pokaz po przewinięciu **~12% wysokości viewportu** (`STICKY_CTA_SHOW_VH`); schowanie gdy scroll wraca powyżej **~45%** progu (`STICKY_CTA_HIDE_FRACTION`); przy reduced motion — zawsze widoczny (uproszczenie UX).
- **CSS:** ukryty od **`min-width: 700px`** (`display: none`).

---

## 14. FAQ

- **Lista:** `.faq-list`, max-width **44rem**.
- **Pozycja:** `.faq-item` z `border-bottom`; nagłówek to **`<button>`** pełnej szerokości, flex z `.icon` (+ / − ustawiane w JS).
- **Panel:** `.faq-panel` z animacją **`grid-template-rows: 0fr` → `1fr`** przy `.faq-item.is-open`; wewnątrz `.faq-panel-inner` + `overflow: hidden`.
- **Na jasnych pasach** (silver / atelier): osobne kolory obramowań i tekstu w CSS (sekcja `.band--silver .faq-item` itd.).

---

## 15. Showcase / parallax urządzeń

- Atrybut **`data-showcase-parallax`** na stage; wewnątrz **`.showcase-devices`** — CSS zmienne `--spx` / `--spy` ustawiane przy scroll/resize (RAF), zakres i kąt z stałych `SHOWCASE_PARALLAX_*` w JS.
- Wyłączone przy **reduced motion** lub braku elementów.

---

## 16. Dostępność (minimum zaimplementowane)

- **Skip link** `.skip-link` → `#main`.
- **`.visually-hidden`** dla etykiet ekranowych.
- Dekoracje: **`aria-hidden="true"`** na siatkach, glow, rail.
- **Focus:** `outline: 2px solid var(--accent)` + offset na przyciskach / linkach logo ( `:focus-visible` ).
- Nawigacja mobilna: **aria-expanded**, **aria-controls**, **aria-modal**, **Escape**, **scroll lock** na `body`.

---

## 17. Podstrony (`pages.css` + klasy strony)

- **`body.page-sub`:** flex column, min-height 100vh — stopka na dole.
- **Stub (portfolio itd.):** `.stub` — `min-height: var(--page-stub-min-h)` (60vh), max szerokość `var(--page-stub-max)` (560px), padding `var(--page-pad-y)` / `var(--page-pad-x)`.
- **Landingi lokalne:** `.local-landing` max **42rem**; akapity w `--ink-muted`.
- **Hero podstrony:** `.page-sub-hero__inner` — `h1` z `clamp(1.85rem, 4.2vw, 2.55rem)`, Syne, kolor `--ink`.

---

## 18. Stos z-index (orientacyjnie)

| Warstwa | z-index |
|---------|---------|
| Skip link | 1000 |
| `.site-header` | 60 |
| `.nav-mobile-backdrop` | 68 |
| `.nav-mobile-panel` | 70 |
| `.sticky-cta` | 40 |
| `.bg-grid`, `.bg-glow` | 0 |
| `.cursor-glow` | 1 |
| `.tech-rail` | 2 |
| `.wrap` (treść nad tłem) | 2 |

Nowe floating elementy: **nie wpychaj** między backdrop a panel bez powodu.

---

## 19. Mapowanie JS → UX (stałe w `main.js`)

| Stała | Wartość | Skutek |
|--------|---------|--------|
| `HEADER_SCROLL_THRESHOLD_PX` | 24 | Klasa scrolled na headerze |
| `NAV_BREAKPOINT_MIN` | 900 | Zgodność z CSS; resize zamyka menu |
| `PARALLAX_LERP` | 0.08 | Gładkość parallax hero |
| `STICKY_CTA_SHOW_VH` | 0.12 | Próg pojawienia sticky CTA |
| `STICKY_CTA_HIDE_FRACTION` | 0.45 | Histereza chowania |
| `STICKY_CTA_MAX_WIDTH_PX` | 700 | Spójne z CSS `min-width: 700px` |
| `REVEAL_IO_ROOT_MARGIN` | `0px 0px -2% 0px` | Kiedy reveal się odpala |
| `REVEAL_IO_THRESHOLD` | 0.06 | Czułość reveal |
| `NAV_OPEN_FOCUS_MS` | 60 | Opóźnienie focus na pierwszy link |

---

## 20. Hero landing (pierwszy ekran) — jak ma wyglądać i działać

**Cel:** w ~1 sekundzie czytelności użytkownik ma zrozumieć *kto* (Cyber Plus), *co robi* (strony / landing / redesign / SEO), *dla kogo* (marki premium, mobile), *zasięg* (Szczecin · Rzeszów · Polska) i ma **dwa wyraźne CTA** (kontakt + realizacje).

**Struktura DOM (wzór z `index.html`):**

- Sekcja **`section.hero-cinematic.hero--fusion`** z `aria-labelledby="hero-heading"`.
- **Warstwa atmosfery** (tylko dekor): `.hero-atmo` z dziećmi (`.hero-noise`, `.hero-volumetric`, `.hero-light-canopy`, `.hero-ambient-sweep`, `.hero-drift-glow`, `.hero-veil`, `.hero-aurora`) — wszystkie z `aria-hidden="true"` gdzie nie niosą treści.
- **Treść:** `.wrap.hero-inner` → kolumna **`.hero-copy.hero-copy--cinema`**:
  - **Kicker:** `.hero-kicker` (linia + nazwa marki) — krótka etykieta, nie zastępuje H1.
  - **H1:** `#hero-heading.hero-headline` — jedna główna obietnica (nie lista usług w nagłówku).
  - **Lead:** `.hero-lead` — 2–3 zdania wartości i zakresu.
  - **CTA:** `.btn-row.hero-cta-row` — primary „Porozmawiajmy” + ghost „Realizacje” (`.btn--glass` na drugim przycisku).
  - **Micro trust:** `.hero-micro` z dwiema liniami: zasięg (`hero-micro__line`) + tagi oferty (`hero-micro__tags`), font mono, dyskretny kontrast.
- **Stage wizualny:** `.hero-stage` → `.hero-scene` z PCB SVG (`.hero-scene__pcb`), bloom/halo/dust, potem **`.hero-works`** — małe karty linków do realnych projektów (obraz + label + meta), **nie** generyczne stocki.

**Zachowanie (UX):**

- Parallax: zmienne `--hero-parallax-*` + opcjonalnie kursor; **wyłączone** przy `prefers-reduced-motion` i na wąskim ekranie zgodnie z `main.js`.
- **LCP:** pierwszy sensowny obraz tekstu + dekor; obrazy w hero-work z sensownym `loading` (pierwszy może być priorytetowy wg potrzeb).

**Czego unikać w hero:** ściany tekstu, drugi H1, animacje blokujące CTA, brak widocznego kontaktu w scrollu poniżej (sticky CTA na mobile uzupełnia).

---

## 21. Sekcje pod hero — spójność kolejnych bloków

**Siatka narracji:** problem → podejście → usługi → realizacje → lokalnie → proces → FAQ → kontakt. Każda sekcja to zwykle **`section.band` + modyfikator tła** (`band--dawn`, `band--atelier`, `band--navy`, …) — **zmiana tła = zmiana roli emocjonalnej** (jasny „editorial” vs ciemny „tech”).

**Nagłówki sekcji (wzór):**

- Krótka **etykieta** (`.section-label` / odpowiednik w HTML) + **H2** + **lead** (`.section-lead`) — max ~2–3 zdania; szczegóły w kartach lub akordeonie.
- **Jedna intencja na sekcję** — nie mieszaj „cennika” z „case study” w tym samym bloku bez wyraźnego podziału wizualnego.

**Karty i listy:**

- Używaj istniejących wzorców kart / showcase z `data-showcase-parallax` tylko tam, gdzie ma sens „produkt w akcji”; gdzie indziej statyczny layout + `reveal`.

**Motion między sekcjami:**

- Klasy **`.reveal`** / **`.reveal-stagger`** + `.is-inview` — spójny moment wejścia; nie dodawaj trzeciego systemu reveal.

**Mostek z hero:**

- Pierwsza sekcja editorial często **`band--story-problem`** z ujemnym marginesem względem hero (wizualne „wejście” pod cinematic) — przy nowej sekcji pod hero zachowaj **ciągłość linii** (brak podwójnego border-top).

**SEO / treść:** nagłówki hierarchicznie (jeden H1 w hero); w sekcjach H2–H3; FAQ jako `<button>` w `.faq-item` (patrz sekcja 14).

---

*Przy zmianie wizualnej zawsze sprawdź **obie skórki** (jasny `band--*` i ciemny) oraz **mobile + reduced motion**.*

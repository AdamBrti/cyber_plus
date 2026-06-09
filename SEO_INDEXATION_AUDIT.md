# Audyt indeksacji SEO — Cyber Plus (`cyber-plus.pl`)

**Data audytu:** 2026-05-26  
**Zakres:** repozytorium statyczne (HTML/CSS/JS) + Cloudflare Pages (produkcja zweryfikowana przez `curl` na żywych URL-ach).  
**Kontekst GSC:** 1× błąd serwera (5xx), 1× strona z przekierowaniem, 5× wykryta — obecnie niezindeksowana.

---

## 1. Executive summary

### Co najpewniej blokuje indeksację

| Priorytet | Problem | Dowód |
|-----------|---------|--------|
| **Krytyczny** | **`www.cyber-plus.pl` zwraca HTTP 522** (błąd Cloudflare — origin niedostępny) | Test produkcyjny `curl -sI https://www.cyber-plus.pl/` → `HTTP/1.1 522` |
| **Krytyczny** | **Sitemap i canonical wskazują URL-e z `.html`, a produkcja robi 308 → URL bez rozszerzenia** | `sitemap.xml` + `<link rel="canonical">` w HTML vs `curl` na `*.html` → `308` → `/portfolio` itd. |
| **Wysoki** | **Canonical na żywym URL-u nadal wskazuje wersję `.html`**, która przekierowuje | `curl` treści `/portfolio` → `canonical` = `…/portfolio.html` |
| **Wysoki** | **Kilka podstron ma cienką, podobną treść** (portfolio, landingi lokalne) — typowy powód „wykryta, niezindeksowana” | Analiza HTML; brak unikalnych case study na `/portfolio` |
| **Wysoki** | **Funkcje Cloudflare (`/api/contact`) nie są dostępne na produkcji** (GET → 404) | `curl -sI https://cyber-plus.pl/api/contact` → `404` (w repo jest `functions/api/contact.js`) |

### Średni priorytet

- Linki wewnętrzne masowo używają `*.html` i `index.html#…` — każde wejście to dodatkowy 308; **`index.html#sekcja` traci fragment** po przekierowaniu na `/` (użytkownik i bot lądują na górze strony głównej, nie w `#kontakt`).
- Tylko `index.html` ma rozbudowane JSON-LD; landingi lokalne i portfolio **bez** `WebPage` / `Service` / lokalnego schema.
- `hreflang` na podstronach PL wskazuje `en`/`de` na stronę główną, nie na odpowiedniki (świadoma decyzja copy, ale słabszy sygnał wielojęzyczności dla podstron).
- Katalog `/content/` (JSON CMS) jest **publicznie dostępny** (200) i **nie** jest zablokowany w `robots.txt`.
- `js/cms-content.js` na stronie głównej może **nadpisać** `<title>` i meta po załadowaniu JS (treść w HTML jest pełna — patrz §9).

### Kosmetyka / poza kodem

- Brak GA4/GTM w repo (placeholder) — nie blokuje indeksacji.
- `lastmod` w sitemap częściowo niespójny (home `2026-05-22`, reszta `2026-05-15`).
- Profil Google / link building — poza repozytorium (`docs/SEO_POSTLAUNCH.md`).

### Typ projektu (routing)

**Nie** Next.js / React / Astro — **statyczny HTML** deployowany na **Cloudflare Pages**. Routing = pliki na dysku + **domyślne „pretty URLs” Cloudflare** (308 z `plik.html` → `/plik`). W repozytorium **nie ma** pliku `_redirects`; przekierowania `.html` → bez rozszerzenia pochodzą z platformy hostingu, nie z kodu w git.

---

## 2. Lista znalezionych problemów

### 2.1 `www.cyber-plus.pl` — błąd 522 (prawdopodobny 5xx w GSC)

| Pole | Wartość |
|------|---------|
| **Ważność** | **critical** |
| **Pliki** | Brak konfiguracji w repo (DNS / Cloudflare dashboard — **wymaga sprawdzenia poza git**) |
| **Opis** | Host `www` nie odpowiada poprawnie. `curl -sI https://www.cyber-plus.pl/` → `HTTP/1.1 522`. Apex `https://cyber-plus.pl/` → `200`. |
| **Wpływ** | Googlebot lub użytkownicy trafiający na `www` widzą błąd serwera; w GSC często raportowane jako **5xx**. |
| **Rekomendacja** | W Cloudflare DNS: **CNAME/AAAA dla `www`** na Pages **albo** reguła **Redirect `www` → `https://cyber-plus.pl`** (301). Upewnij się, że w GSC dodana jest właściwość (apex vs www) zgodna z kanoniczną domeną. |
| **Bezpieczeństwo zmiany** | Tak — standardowa konfiguracja domeny. |

---

### 2.2 Sitemap zawiera URL-e przekierowujące (`.html` → 308)

| Pole | Wartość |
|------|---------|
| **Ważność** | **critical** |
| **Pliki** | `sitemap.xml` (wiersze 23–48) |
| **Opis** | Sitemap podaje m.in. `https://cyber-plus.pl/portfolio.html`. Produkcja: `308` → `Location: /portfolio`, potem `200`. To dokładnie pasuje do raportu GSC **„Strona zawiera przekierowanie”**. |
| **Wpływ** | Google traktuje URL z sitemap jako docelowy do indeksacji; submit przekierowującego URL-a obniża zaufanie i opóźnia indeksację wersji kanonicznej. |
| **Rekomendacja** | W `sitemap.xml` zamienić wszystkie `<loc>` na **finalne URL-e bez `.html`**, np. `https://cyber-plus.pl/portfolio`, `https://cyber-plus.pl/strony-internetowe-szczecin`. Zostawić `https://cyber-plus.pl/` (bez `index.html`). |
| **Bezpieczeństwo** | Tak — tylko zgodność z produkcją. |

**Test produkcyjny (2026-05-26):**

```
portfolio.html          → 308 → /portfolio           → 200
strony-…-szczecin.html  → 308 → /strony-…-szczecin   → 200
index.html              → 308 → /
```

---

### 2.3 Canonical, `og:url` i `hreflang` wskazują URL z `.html` (przekierowujący)

| Pole | Wartość |
|------|---------|
| **Ważność** | **high** |
| **Pliki** | `portfolio.html` (L11–28), `strony-internetowe-szczecin.html` (L11–28), `strony-internetowe-rzeszow.html` (L11–28), `polityka-prywatnosci.html` (L12, L16), `regulamin.html` (analogicznie) |
| **Opis** | Na żywym URL-u `https://cyber-plus.pl/portfolio` HTML nadal zawiera `<link rel="canonical" href="https://cyber-plus.pl/portfolio.html" />` (potwierdzone `curl` treści strony). |
| **Wpływ** | Google może indeksować sygnał canonical prowadzący przez 308; rozjeżdżenie sygnałów (sitemap + canonical + linki wewnętrzne vs faktyczny URL). |
| **Rekomendacja** | Ujednolicić **canonical**, **og:url** i **hreflang `pl`** do URL-i **bez `.html`**, zgodnych z produkcją. |
| **Bezpieczeństwo** | Tak. |

---

### 2.4 Linki wewnętrzne przez `*.html` i `index.html#…` (łańcuchy 308 + utrata kotwic)

| Pole | Wartość |
|------|---------|
| **Ważność** | **high** (kotwice), **medium** (same 308) |
| **Pliki** | `index.html` (footer L1613–1617, CTA L1328–1329), wszystkie `strony-internetowe-*.html`, `portfolio.html`, `polityka-prywatnosci.html`, `regulamin.html` — dziesiątki wystąpień `index.html#…` |
| **Opis** | Np. `href="index.html#kontakt"` z podstrony: serwer odpowiada `308` na `/` **bez** `#kontakt` w `Location` → przeglądarka/bot kończy na górze homepage. |
| **Wpływ** | Słabsze UX, gorsze crawlowanie sekcji kontaktu; dodatkowe przekierowania przy każdym linku z `.html`. |
| **Rekomendacja** | Linki do podstron: `/portfolio`, `/strony-internetowe-szczecin` itd. Linki do sekcji home: `/#kontakt`, `/#realizacje` (nie `index.html#…`). Logo na podstronach: `href="/"`. |
| **Bezpieczeństwo** | Tak — bez zmiany designu. |

---

### 2.5 Cloudflare Functions nie wdrożone / niedostępne na produkcji

| Pole | Wartość |
|------|---------|
| **Ważność** | **high** (funkcjonalność), **low–medium** (indeksacja*, jeśli GSC nie crawluje API) |
| **Pliki** | `functions/api/contact.js`, `_routes.json`, `wrangler.toml`, `js/main.js` (L22, L893+) |
| **Opis** | W repo: `POST /api/contact` → przy braku env `503` (`contact.js` L47–48). Na produkcji (2026-05-26): `GET /api/contact` → **404 HTML**, `decap-auth` / `decap-callback` → **404** (funkcje nie działają lub nie są podpięte do deployu). |
| **Wpływ** | Formularz kontaktu na stronie może nie działać. **5xx z kodu** możliwe tylko gdy bot trafi na endpoint z wdrożonymi funkcjami bez zmiennych (`503` w `decap-auth.js` L21–25, `contact.js` L47–48). Obecny stan produkcji to raczej **404**, nie 503 — **chyba że** raportowany 5xx to **`www` (522)**. |
| **Rekomendacja** | W Cloudflare Pages: włączyć **Functions**, ustawić `RESEND_API_KEY`, `MAIL_TO` (patrz `docs/CLOUDFLARE_PAGES_CONTACT.md`). Po wdrożeniu: `curl -X POST` z JSON — oczekiwany `200` lub `400`, nie `404`/`503`. |
| **Bezpieczeństwo** | Tak — wymaga sekretów w panelu CF (nie commitować). |

\* **Wymaga sprawdzenia w GSC**, który dokładnie URL ma status 5xx.

---

### 2.6 Endpointy CMS OAuth — przekierowanie 302 / błędy 503 w kodzie (niski priorytet SEO)

| Pole | Wartość |
|------|---------|
| **Ważność** | **low** (SEO), **medium** (bezpieczeństwo operacyjne) |
| **Pliki** | `functions/decap-auth.js` (302 → GitHub, 503 bez env), `functions/decap-callback.js` (503, 400), `robots.txt` (Disallow tylko ścieżki bez końcówki) |
| **Opis** | `/decap-auth` przy działających funkcjach zwraca **302** na `github.com` — typowy „redirect” w GSC, jeśli URL zostanie odkryty. `robots.txt` ma `Disallow: /decap-auth` (bez wildcard) — OK. Na produkcji dziś **404**, nie 302. |
| **Wpływ** | Niski, o ile URL nie trafia do sitemap i nie jest linkowany publicznie. |
| **Rekomendacja** | Nie linkować publicznie; opcjonalnie `Disallow: /decap-auth*`; utrzymać brak wpisów w sitemap. |
| **Bezpieczeństwo** | Tak. |

---

### 2.7 Strony „wykryta — niezindeksowana”: cienka treść i duplikacja semantyczna

| Pole | Wartość |
|------|---------|
| **Ważność** | **high** |
| **Pliki** | `portfolio.html` (treść główna ~3 linki zewnętrzne + krótki lead), `strony-internetowe-szczecin.html`, `strony-internetowe-rzeszow.html` (szablon prawie identyczny, ~4 akapity + lista) |
| **Opis** | Portfolio: H1 „Portfolio”, brak unikalnych opisów case study w HTML (odsyła do sekcji na home). Landingi lokalne: ta sama struktura sekcji, różnica głównie nazwa miasta — ryzyko **near-duplicate**. EN/DE (`en/index.html`, `de/index.html`): pełniejsze, ale konkurencja hreflang z PL home. |
| **Wpływ** | Google często odkłada indeksację przy niskiej wartości dodanej vs strona główna. **5 niezindeksowanych** ≈ realne dla podzbioru z 7 URL-i w sitemap (bez `/`). |
| **Rekomendacja** | Rozbudować **unikalną** treść: portfolio — mini case study w HTML; Szczecin/Rzeszów — sekcje „Dla kogo”, „Przykłady”, FAQ lokalne, mapa obszaru; linkowanie wzajemne + z home. |
| **Bezpieczeństwo** | Tak — tylko copy/SEO, bez zmiany layoutu systemu. |

---

### 2.8 Brak danych strukturalnych na podstronach lokalnych i portfolio

| Pole | Wartość |
|------|---------|
| **Ważność** | **medium** |
| **Pliki** | `index.html` (L65–200+ JSON-LD `@graph`), brak `application/ld+json` w `portfolio.html`, `strony-internetowe-*.html` |
| **Opis** | Tylko homepage ma `Organization`, `LocalBusiness`, `WebSite`, `FAQPage`. Landingi lokalne nie mają `WebPage` + `Service` z `areaServed` dla danego miasta. |
| **Wpływ** | Słabsze sygnały lokalne SEO w indeksie dla Szczecina/Rzeszowa. |
| **Rekomendacja** | Dodać JSON-LD `WebPage` + `Service` (lub `ProfessionalService`) z `areaServed` = Szczecin / Rzeszów na odpowiednich plikach — spójne z treścią i NAP w stopce. |
| **Bezpieczeństwo** | Tak — nie duplikować całego `@graph` Organization na każdej stronie (wystarczy `@id` + `WebPage`). |

---

### 2.9 `hreflang` na podstronach PL wskazuje EN/DE na homepage

| Pole | Wartość |
|------|---------|
| **Ważność** | **low** |
| **Pliki** | `portfolio.html` (L12–15), `strony-internetowe-szczecin.html` (L12–15) |
| **Opis** | `hreflang="en"` → `https://cyber-plus.pl/en/` zamiast braku odpowiednika — poprawne jeśli nie ma wersji EN landingów, ale Google widzi słabsze powiązanie. |
| **Wpływ** | Niski; nie blokuje indeksacji PL. |
| **Rekomendacja** | Zostawić jak jest **lub** usunąć `alternate` en/de z podstron bez tłumaczeń (zostawić tylko `pl` + `x-default`). |
| **Bezpieczeństwo** | Tak. |

---

### 2.10 Katalog `/content/` publicznie indeksowalny

| Pole | Wartość |
|------|---------|
| **Ważność** | **low** |
| **Pliki** | `content/**`, `robots.txt`, `js/cms-content.js` |
| **Opis** | `https://cyber-plus.pl/content/settings/site.json` → **200**. Brak `Disallow` w robots. |
| **Wpływ** | Możliwe indeksowanie JSON-ów zamiast stron HTML; szum w crawl budget. |
| **Rekomendacja** | `Disallow: /content/` w `robots.txt` + opcjonalnie `X-Robots-Tag: noindex` w `_headers` dla `/content/*`. |
| **Bezpieczeństwo** | Tak — CMS nadal działa dla frontu (fetch z przeglądarki). |

---

### 2.11 `admin/` — indeksacja zablokowana poprawnie

| Pole | Wartość |
|------|---------|
| **Ważność** | **info (OK)** |
| **Pliki** | `admin/index.html` (meta noindex), `_headers` (`/admin/*` → `X-Robots-Tag: noindex, nofollow`), `robots.txt` (`Disallow: /admin/`) |
| **Opis** | Panel zwraca 200, ale **noindex** — prawidłowo. |
| **Wpływ** | Brak negatywny. |

---

### 2.12 `404.html` — noindex (poprawnie)

| Pole | Wartość |
|------|---------|
| **Ważność** | **info (OK)** |
| **Pliki** | `404.html` (L7: `noindex, follow`) |
| **Opis** | Strona błędu nie powinna trafić do indeksu. |
| **Wpływ** | Pozytywny. |

---

### 2.13 `js/cms-content.js` — opcjonalna zmiana meta po JS (tylko homepage)

| Pole | Wartość |
|------|---------|
| **Ważność** | **low** |
| **Pliki** | `index.html` (skrypt cms), `js/cms-content.js` (`updateSeo`, L52–68), `content/settings/seo.json` |
| **Opis** | Po `DOMContentLoaded` skrypt może nadpisać `document.title` i meta z JSON. Treść hero/FAQ w HTML jest **statyczna** — Google zwykle indeksuje pierwotny HTML. |
| **Wpływ** | Niski dla indeksacji; ewentualna niespójność title w GSC vs HTML. |
| **Rekomendacja** | Trzymać `seo.json` zsynchronizowany z `<title>` w HTML **albo** nie nadpisywać title/description jeśli nie używasz CMS na produkcji. |
| **Bezpieczeństwo** | Tak. |

---

### 2.14 HTTP → HTTPS — działa

| Pole | Wartość |
|------|---------|
| **Ważność** | **info (OK)** |
| **Opis** | `http://cyber-plus.pl/` → `301` → `https://cyber-plus.pl/` |
| **Wpływ** | Poprawne. |

---

## 3. Tabela URL-i do sprawdzenia

| URL | Status oczekiwany (produkcja 2026-05-26) | Ryzyko | Co sprawdzić | Rekomendacja |
|-----|------------------------------------------|--------|--------------|--------------|
| `https://cyber-plus.pl/` | 200 | Niskie | Indeks, CWV | Utrzymać jako główny canonical |
| `https://www.cyber-plus.pl/` | **522** | **Krytyczne** | DNS, SSL, Pages custom domain | Naprawić `www` lub przekierować 301 na apex |
| `https://cyber-plus.pl/index.html` | 308 → `/` | Średnie | Czy w GSC jako redirect | Nie promować; linki → `/` |
| `https://cyber-plus.pl/en/` | 200 | Średnie | „Niezindeksowana”, hreflang | Treść unikalna vs PL; ewent. żądanie indeksacji w GSC |
| `https://cyber-plus.pl/en` | 308 → `/en/` | Niskie | Spójność linków | Linkować zawsze z trailing slash |
| `https://cyber-plus.pl/de/` | 200 | Średnie | j.w. | j.w. |
| `https://cyber-plus.pl/portfolio` | 200 | **Wysokie** (cienka treść) | Canonical, treść | Canonical bez `.html`; dodać case study |
| `https://cyber-plus.pl/portfolio.html` | 308 → `/portfolio` | **Krytyczne** jeśli w sitemap | Usunąć z sitemap | Tylko URL bez `.html` |
| `https://cyber-plus.pl/strony-internetowe-szczecin` | 200 | **Wysokie** | Unikalność vs Rzeszów | Rozszerzyć treść + schema lokalne |
| `https://cyber-plus.pl/strony-internetowe-szczecin.html` | 308 | **Krytyczne** w sitemap | j.w. | Zaktualizować sitemap/canonical |
| `https://cyber-plus.pl/strony-internetowe-rzeszow` | 200 | **Wysokie** | j.w. | j.w. |
| `https://cyber-plus.pl/polityka-prywatnosci` | 200 | Niskie | Czy potrzebna w indeksie | OK w sitemap; niski priorytet |
| `https://cyber-plus.pl/regulamin` | 200 | Niskie | j.w. | j.w. |
| `https://cyber-plus.pl/sitemap.xml` | 200 | **Wysokie** | Czy `<loc>` bez redirectów | Poprawić wszystkie `<loc>` |
| `https://cyber-plus.pl/robots.txt` | 200 | Niskie | Sitemap URL, Disallow | Opcjonalnie `Disallow: /content/` |
| `https://cyber-plus.pl/api/contact` | POST: 200/400; dziś GET **404** | Średnie | Deploy Functions | Wdrożyć funkcję + env |
| `https://cyber-plus.pl/decap-auth` | dziś **404**; w kodzie 302/503 | Niskie | Nie w sitemap | Nie indeksować |
| `https://cyber-plus.pl/admin/` | 200 + noindex | Niskie | X-Robots-Tag | OK |
| `/#kontakt` (sekcja) | 200 (fragment) | Średnie | Linki `index.html#kontakt` | Zamienić na `/#kontakt` |
| `https://cyber-plus.pl/content/settings/site.json` | 200 | Niskie | Indeksowanie JSON | Disallow `/content/` |

---

## 4. Checklist naprawczy

### Etap 1 — krytyczne naprawy indeksacji

- [ ] **Naprawić `www.cyber-plus.pl`** (eliminacja 522) — Cloudflare DNS / Pages / redirect na apex.
- [ ] **Zaktualizować `sitemap.xml`** — wyłącznie URL-e końcowe **bez** `.html` (zgodne z 200 po `curl`).
- [ ] **Wyrównać canonical + `og:url`** we wszystkich plikach HTML podstron do URL-i bez `.html`.
- [ ] W GSC: **Sprawdzenie adresu URL** dla starych `*.html` — po poprawkach „Żądaj indeksowania” dla wersji kanonicznych.
- [ ] **Zweryfikować w GSC**, który URL ma dokładnie status **5xx** (czy `www`, czy inny).

### Etap 2 — poprawa jakości SEO

- [ ] Zamienić linki wewnętrzne: `portfolio.html` → `/portfolio`, `index.html#kontakt` → `/#kontakt`, logo → `/`.
- [ ] Rozbudować `portfolio.html` — unikalne opisy projektów (problem / rozwiązanie / efekt) w HTML.
- [ ] Rozbudować landingi Szczecin/Rzeszów — unikalne sekcje (nie tylko zamiana miasta).
- [ ] Dodać JSON-LD `WebPage` + `Service` na landingach lokalnych.
- [ ] Opcjonalnie: `Disallow: /content/` w `robots.txt`.
- [ ] Wdrożyć **Cloudflare Functions** dla formularza (`functions/api/contact.js` + zmienne env).
- [ ] Zsynchronizować `content/settings/seo.json` z meta w `index.html` (jeśli CMS aktywny).

### Etap 3 — lokalne SEO i promocja (poza kodem)

- [ ] Profil Firmy Google — link do `https://cyber-plus.pl/`, spójny NAP z JSON-LD.
- [ ] Po Etapie 1–2: ręczne zgłoszenie mapy witryn w GSC.
- [ ] 1–2 naturalne linki lokalne do `/strony-internetowe-szczecin` i `/strony-internetowe-rzeszow`.
- [ ] PageSpeed Insights na mobile dla `/` i landingów lokalnych.

---

## 5. Proponowane zmiany w kodzie (bez wdrożenia — do akceptacji)

| # | Plik(i) | Zmiana | Dlaczego | Ryzyko |
|---|---------|--------|----------|--------|
| 1 | `sitemap.xml` | `<loc>` bez `.html` | Sitemap = URL końcowy 200 | Niskie |
| 2 | `portfolio.html`, `strony-internetowe-*.html`, `polityka-prywatnosci.html`, `regulamin.html` | canonical, og:url, hreflang `pl` | Zgodność z produkcją | Niskie |
| 3 | Wszystkie `*.html` (linki) | `href="/portfolio"`, `href="/"`, `href="/#kontakt"` | Mniej 308, działające kotwice | Niskie — przetestować menu |
| 4 | `robots.txt` | `Disallow: /content/` | Mniej szumu w indeksie | Niskie |
| 5 | `_headers` | opcjonalnie `X-Robots-Tag: noindex` dla `/content/*` | Jak wyżej | Niskie |
| 6 | `strony-internetowe-szczecin.html`, `strony-internetowe-rzeszow.html`, `portfolio.html` | + sekcje treści + JSON-LD | Indeksacja „wykryta” | Średnie — tylko treść |
| 7 | Cloudflare (panel) | DNS `www`, Functions env | 522 + formularz | Operacyjne |
| 8 | `index.html` | ewent. usunąć nadpisywanie SEO w cms jeśli nieużywane | Spójność title | Niskie |

**Nie zmieniać bez uzasadnienia:** designu, struktury sekcji home, bibliotek JS.

---

## 6. Szczegóły analizy według zakresu zlecenia

### 6.1 Struktura routingu

| Ścieżka w repo | Publiczny URL (produkcja) |
|----------------|---------------------------|
| `index.html` | `/` |
| `en/index.html` | `/en/` |
| `de/index.html` | `/de/` |
| `portfolio.html` | `/portfolio` (308 z `.html`) |
| `strony-internetowe-szczecin.html` | `/strony-internetowe-szczecin` |
| `strony-internetowe-rzeszow.html` | `/strony-internetowe-rzeszow` |
| `polityka-prywatnosci.html` | `/polityka-prywatnosci` |
| `regulamin.html` | `/regulamin` |
| `404.html` | 404 (CF Pages) |
| `admin/index.html` | `/admin/` |
| `functions/api/contact.js` | `/api/contact` (POST) — **404 na produkcji** |

Brak dynamicznego routingu aplikacyjnego. Linki `#` na home — poprawne dla SPA-like sekcji; **nie** są pustymi linkami SEO.

### 6.2 Błędy 5xx — źródła w kodzie

| Miejsce | Warunek | Status |
|---------|---------|--------|
| `functions/api/contact.js` L47–48 | Brak `RESEND_API_KEY` lub `MAIL_TO` | **503** JSON |
| `functions/api/contact.js` L127 | Błąd Resend API | **502** |
| `functions/decap-auth.js` L21–25 | Brak OAuth env | **503** tekst |
| `functions/decap-callback.js` L62–63 | Brak OAuth env | **503** |
| Produkcja `www` | — | **522** Cloudflare |

**Middleware:** brak — nie blokuje Googlebota.

### 6.3 Przekierowania

| Źródło | Typ | Gdzie skonfigurowane |
|--------|-----|----------------------|
| `*.html` → bez rozszerzenia | 308 | Cloudflare Pages (domyślne) — **nie w repo** |
| `/en` → `/en/` | 308 | CF Pages |
| `index.html` → `/` | 308 | CF Pages |
| `http` → `https` | 301 | Cloudflare |
| `/decap-auth` | 302 → GitHub | `decap-auth.js` (gdy funkcja działa) |
| `www` | **522** | **Wymaga sprawdzenia w Cloudflare** |

**Sitemap vs redirect:** tak — **wszystkie** podstrony z rozszerzeniem `.html` w sitemap przekierowują.

### 6.4 Sitemap

- Plik: `sitemap.xml` (statyczny, 8 URL-i).
- Domena: `https://cyber-plus.pl` — spójna, **bez** `www`.
- Brak duplikatów w pliku.
- **Problem:** 6 z 8 `<loc>` używa `.html` → redirect na produkcji.
- Brak URL-i bez rozszerzenia w sitemap mimo że to one zwracają 200 bez redirectu.

### 6.5 Robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /decap-auth
Disallow: /decap-callback
Sitemap: https://cyber-plus.pl/sitemap.xml
```

- Googlebot **nie** jest blokowany globalnie.
- Brak `Disallow: /`.
- Sitemap URL poprawny.

### 6.6 Meta robots i canonical

| Strona | robots | canonical |
|--------|--------|-----------|
| `index.html` | index, follow | `https://cyber-plus.pl/` ✓ |
| `en/`, `de/` | index, follow | `/en/`, `/de/` ✓ |
| Podstrony PL | index, follow | **`.html` ✗** (redirect) |
| `admin/` | noindex | — |
| `404.html` | noindex, follow | brak |

**Brak** przypadkowego `noindex` na stronach marketingowych.

### 6.7 Linkowanie wewnętrzne

| Strona | Linki z home | Linki między podstronami |
|--------|--------------|---------------------------|
| `/` | — | footer → portfolio, Szczecin, Rzeszów; sekcja `#lokalnie` |
| `/portfolio` | tak (footer) | footer krzyżowy |
| Landingi lokalne | tak | footer |
| `/en/`, `/de/` | footer do PL podstron | OK |

**Osierocone:** brak — wszystkie ważne URL-e są w sitemap i footerze home. **Słabe:** portfolio ma mało linków **do** siebie z treści home (jest przycisk „Szczegóły portfolio”).

### 6.8 Jakość stron „wykryta — niezindeksowana”

| URL | H1 | Treść | Uwagi |
|-----|-----|-------|-------|
| `/portfolio` | tak | **Cienka** | 3 linki zewnętrzne, brak case study w body |
| `/strony-internetowe-szczecin` | tak | Średnia, **podobna do Rzeszowa** | ~250 słów |
| `/strony-internetowe-rzeszow` | tak | j.w. | near-duplicate risk |
| `/en/`, `/de/` | tak | Pełniejsza | Konkurencja z PL + hreflang |
| `/polityka-prywatnosci`, `/regulamin` | tak | Prawna, długa | Google często nie priorytetyzuje |

Treść **jest** w HTML (nie za JS) — problem to głównie **wartość / unikalność**, nie CSR.

### 6.9 SSR / prerender / static

- **Model:** 100% statyczny HTML w deployu.
- Googlebot dostaje pełną treść bez builda Node.
- `js/main.js`: animacje, FAQ, formularz — **nie** ukrywa głównego copy SEO.
- `js/cms-content.js` (tylko `index.html`): uzupełnia treść z JSON; przy błędzie fetch zostaje HTML fallback.

### 6.10 Dane strukturalne

- **Home:** `Organization`, `ProfessionalService`, `LocalBusiness`, `WebSite`, `FAQPage` — adres Szczecin, `areaServed` PL + miasta + DE.
- **Brak** na: portfolio, landingi lokalne.
- Domena w JSON-LD: `cyber-plus.pl` — spójna.
- **Nie** wykryto starej domeny w plikach HTML.

---

## 7. Najbardziej prawdopodobna przyczyna problemu według analizy kodu

**Maksymalnie 3 hipotezy oparte na dowodach (kod + test produkcji):**

1. **Błąd 5xx w GSC = `https://www.cyber-plus.pl/` (HTTP 522)** — potwierdzone testem `curl`; w repozytorium brak konfiguracji `www`. **Wymaga sprawdzenia w GSC**, czy raportowany URL to dokładnie `www`.

2. **„Strona z przekierowaniem” = URL-e z `sitemap.xml` i/lub canonical z sufiksem `.html`**, podczas gdy Cloudflare serwuje kanoniczne 200 pod ścieżkami bez `.html` (308). Potwierdzone: sitemap L23–48 + `curl` 308.

3. **„Wykryta — niezindeksowana” (5 stron) = kombinacja cienkiej treści (`portfolio.html`), near-duplicate landingów lokalnych oraz alternatyw językowych `/en/` i `/de/`**, przy silnej stronie głównej — Google odkłada indeksację. Potwierdzone analizą HTML; **wymaga potwierdzenia listy URL-i w GSC** (które dokładnie 5).

---

## 8. Bonus — testy ręczne po wdrożeniu

### Nagłówki HTTP

```bash
curl -I https://cyber-plus.pl/
curl -I https://www.cyber-plus.pl/
curl -I https://cyber-plus.pl/sitemap.xml
curl -I https://cyber-plus.pl/robots.txt
```

### Redirecty vs sitemap (powinno być 200 bez łańcucha)

```bash
curl -I https://cyber-plus.pl/portfolio.html
curl -I https://cyber-plus.pl/portfolio
curl -I https://cyber-plus.pl/strony-internetowe-szczecin.html
curl -I https://cyber-plus.pl/strony-internetowe-szczecin
curl -I https://cyber-plus.pl/index.html
```

Oczekiwane po naprawie sitemap: **pierwszy** `curl` może nadal 308, ale **nie** powinien być w sitemap; drugi → `200`.

### Canonical w HTML

```bash
curl -s https://cyber-plus.pl/portfolio | findstr /i canonical
curl -s https://cyber-plus.pl/strony-internetowe-szczecin | findstr /i canonical
curl -s https://cyber-plus.pl/ | findstr /i canonical
```

Oczekiwane: canonical **bez** `.html`.

### Statusy 200 / 301 / 404 / 500

```bash
curl -o NUL -s -w "%{http_code}" https://cyber-plus.pl/
curl -o NUL -s -w "%{http_code}" https://cyber-plus.pl/en/
curl -o NUL -s -w "%{http_code}" https://cyber-plus.pl/nie-istnieje
curl -o NUL -s -w "%{http_code}" -X POST https://cyber-plus.pl/api/contact -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"a@b.pl\",\"message\":\"Test wiadomosci kontaktowej\"}"
```

### Sitemap bez redirectów

Pobierz `https://cyber-plus.pl/sitemap.xml` i dla **każdego** `<loc>`:

```bash
curl -I "ADRES_Z_LOC"
```

Oczekiwane: **pierwsza** odpowiedź `HTTP/2 200` (bez `308`/`301` przed treścią).

### Googlebot nie zablokowany

```bash
curl -s https://cyber-plus.pl/robots.txt
curl -A "Googlebot" -I https://cyber-plus.pl/
```

Oczekiwane: `Allow: /`, brak `Disallow: /`, status `200` dla homepage.

### Formularz (po wdrożeniu Functions)

W przeglądarce: sekcja `#kontakt` na `/` — wysłanie formularza; w Network tab status `200` na `POST /api/contact`.

---

## 9. Mapa plików SEO w projekcie

| Obszar | Pliki |
|--------|--------|
| Sitemap | `sitemap.xml` |
| Robots | `robots.txt` |
| Nagłówki CF | `_headers` |
| Functions / API | `functions/api/contact.js`, `_routes.json`, `wrangler.toml` |
| CMS / treść dynamiczna | `js/cms-content.js`, `content/**` |
| Strony indeksowalne | `index.html`, `en/index.html`, `de/index.html`, `portfolio.html`, `strony-internetowe-*.html`, `polityka-prywatnosci.html`, `regulamin.html` |
| Dokumentacja | `docs/SEO_POSTLAUNCH.md`, `docs/CLOUDFLARE_PAGES_CONTACT.md` |

---

*Raport przygotowany wyłącznie na podstawie plików repozytorium i testów HTTP na produkcji z dnia audytu. Nie wdrożono żadnych zmian w kodzie.*

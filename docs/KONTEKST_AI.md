# Kontekst projektu Cyber Plus (dla AI i ludzi)

Ten dokument uzupełnia `AGENTS.md` oraz szczegółową specyfikację wizualną w **`docs/UI_UX.md`**: tam są **twarde reguły techniczne i ustawienia UI**, tutaj — **intencja biznesowa i mapa treści**, żeby model nie zgadywał „o co chodzi ze stroną”.

## Cel witryny

Strona **wizytówka agencji / freelancera** oferującego strony firmowe, landing page, redesign i fundamenty SEO. Ton: spokojna estetyka premium, proces, realne realizacje. Geografia: **Szczecin, Rzeszów, cała Polska** (praca zdalna).

## Strony w repozytorium

1. **`index.html`** — strona główna, najbogatsza strukturalnie (hero „cinematic”, sekcje oferty, FAQ, JSON-LD z FAQ i organizacją).
2. **`portfolio.html`** — realizacje.
3. **`strony-internetowe-szczecin.html`** / **`strony-internetowe-rzeszow.html`** — landingi pod frazy lokalne; przy duplikacji treści pilnuj **unikalnych** opisów i `canonical` pod każdy URL.
4. **`polityka-prywatnosci.html`**, **`regulamin.html`** — dokumenty prawne; wąska typografia, treść prawnicza — nie „upraszczaj” bez prośby właściciela.

## Spójność marki i SEO

- Domena produkcyjna przyjęta w projekcie: **`https://cyberplus.pl/`** (sprawdź `canonical`, `og:url`, `ld+json`, `sitemap.xml`).
- Adres e-mail kontaktowy (produkcja): **`kontakt.cyberplus@outlook.com`**. Przy zmianie domeny lub skrzynki zaktualizuj wszystkie wystąpienia w HTML (w tym `mailto:`), pole `email` w JSON-LD na `index.html` oraz dokumenty prawne (`polityka-prywatnosci.html`, `regulamin.html`).
- **`robots.txt`** i **`sitemap.xml`** muszą odzwierciedlać faktycznie publikowane URL-e.

## Komunikacja (logika kontaktu na stronie)

- **Strona główna (`index.html`):** w sekcji **`#kontakt`** jest **formularz** wysyłający `POST` na **`/api/contact`**. Po wdrożeniu na **Cloudflare Pages** obsługuje go **Pages Function** (`functions/api/contact.js`), która wysyła wiadomość przez **Resend** na adres z zmiennej `MAIL_TO` (np. Outlook); adres klienta jest w **`Reply-To`**. Szczegóły i zmienne środowiskowe: **`docs/CLOUDFLARE_PAGES_CONTACT.md`**.
- **Fallback:** linki **`mailto:kontakt.cyberplus@outlook.com`** (wstępnie ustawiony `subject` na części linków) — gdy ktoś woli własną pocztę lub gdy endpoint formularza nie jest dostępny (np. lokalny plik `index.html` bez serwera).
- **Podstrony:** nadal kierują do **`index.html#kontakt`** lub mają własne `mailto:` — bez formularza w kodzie podstron.
- **JSON-LD:** pole **`email`** na `index.html` — spójne z adresem kontaktowym (SEO).

## Warstwa wizualna

- **`docs/UI_UX.md`** — **główny eksport ustawień UI/UX** dla innych agentów: tokeny kolorów, typografia, breakpointy, przyciski, pasy `band--*`, hero cinematic, FAQ, sticky CTA, stos z-index, mapowanie stałych z `main.js`. **Pełny opis hero (§20) i spójności sekcji pod hero (§21)** — punkt wyjścia przy nowych landingach w tym stylu.
- **`css/main.css`**: implementacja; zmiana „klimatu” = `:root` + sekcje, bez inline w HTML.
- **`css/pages.css`**: podstrony; tokeny `--page-*` w `:root` w `main.css`.

## Zachowanie (UX)

- Szczegóły liczbowe i klasy: **`docs/UI_UX.md`**.
- **`js/main.js`**: parallax hero, scroll reveal, sticky CTA, FAQ, nawigacja mobilna (focus, Escape); zawsze **`prefers-reduced-motion`** jak w istniejącym kodzie.

## Jak pracować z tym repozytorium w czacie AI

1. Wskaż ścieżkę: `cyber_plus/...`.
2. Jeśli zmiana dotyczy treści marketingowej, podaj **ton** (np. mniej superlatywów, więcej konkretów) — model domyślnie naśladuje istniejący styl.
3. Przy większej edycji HTML na stronie głównej poproś o **sprawdzenie** nagłówków `h1`–`h3` i pojedynczego `h1` na stronę.
4. Przy klonowaniu wyglądu / design systemu na inny projekt: **`@docs/UI_UX.md`** (lub pełna ścieżka `cyber_plus/docs/UI_UX.md`).

## Powiązane pliki

- **`AGENTS.md`** (katalog główny `cyber_plus`) — mapa repo, konwencje, selektory krytyczne w JS.
- **`docs/UI_UX.md`** — wypunktowana specyfikacja UI/UX i „ustawienia” do przenoszenia.

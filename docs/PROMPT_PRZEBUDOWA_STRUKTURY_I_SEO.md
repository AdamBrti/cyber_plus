# Prompt AI — przebudowa struktury i SEO strony Cyber Plus

Jesteś doświadczonym strategiem SEO, UX writerem i front-end developerem. Masz przebudować stronę **Cyber Plus** tak, aby zachowała obecny styl premium, ale była lepiej uporządkowana, krótsza na homepage i znacznie czytelniejsza dla Google.

Pracujesz bezpiecznie: **nie niszcz obecnego charakteru marki**, nie zamieniaj strony w generyczny landing i nie obniżaj jakości wizualnej. Twoim zadaniem jest uporządkowanie architektury informacji, skrócenie strony głównej i rozbudowanie zaplecza SEO na podstronach.

## Kontekst projektu

- Projekt to **statyczna strona marketingowa** bez build stepu.
- Stack: **HTML + CSS + vanilla JS**.
- Główny plik strony: `cyber_plus/index.html`
- Istniejące podstrony:
  - `cyber_plus/portfolio.html`
  - `cyber_plus/strony-internetowe-szczecin.html`
  - `cyber_plus/strony-internetowe-rzeszow.html`
  - `cyber_plus/polityka-prywatnosci.html`
  - `cyber_plus/regulamin.html`
- SEO i crawlery:
  - `cyber_plus/sitemap.xml`
  - `cyber_plus/robots.txt`
- Styl i kontekst projektu:
  - `cyber_plus/AGENTS.md`
  - `cyber_plus/docs/KONTEKST_AI.md`
  - `cyber_plus/docs/UI_UX.md`
- W projekcie istnieją już treści, dane kontaktowe, JSON-LD, meta tagi i formularz kontaktowy. Zachowaj ich spójność.

## Główny problem

Obecna strona ma dobre treści i mocny kierunek komunikacyjny, ale:

- homepage jest zbyt długi,
- próbuje sprzedać zbyt wiele rzeczy naraz,
- miesza ofertę, proces, portfolio, FAQ, technologię, argumenty sprzedażowe i SEO lokalne w jednym miejscu,
- za często mówi językiem jakościowym, a za rzadko językiem realnych zapytań użytkowników,
- ma za mało osobnych podstron pod konkretne intencje zakupowe i lokalne.

## Cel biznesowy i SEO

Po zmianach strona ma:

- szybciej tłumaczyć, czym zajmuje się Cyber Plus,
- wyglądać jak premium studio od stron internetowych dla firm usługowych,
- lepiej pozycjonować się na frazy zakupowe i lokalne,
- prowadzić użytkownika do kontaktu bez przeciążania go treścią,
- mieć logiczny system podstron zamiast jednej bardzo długiej strony głównej.

## Docelowa pozycja marki

Cyber Plus ma być komunikowany jako:

- studio projektujące **strony internetowe dla firm usługowych**,
- specjalizacja: **strony firmowe, landing page, redesign stron**,
- przewagi: **mobile-first, custom code, szybkość, lekkość, prostsze utrzymanie, czytelna oferta, dobre pierwsze wrażenie**,
- geografia: **Szczecin, Rzeszów, cała Polska zdalnie**.

## Najważniejsze frazy do uwzględnienia naturalnie

Uwzględniaj je w nagłówkach, leadach, sekcjach i meta danych bez sztucznego upychania:

- strony internetowe Szczecin
- projektowanie stron internetowych Szczecin
- tworzenie stron internetowych dla firm
- strony internetowe dla firm usługowych
- landing page dla firmy
- redesign strony internetowej
- strona internetowa dla trenera personalnego
- strona internetowa dla salonu beauty
- strona internetowa dla fotografa
- strony internetowe Rzeszów
- strony dla lokalnych usług premium

## Co masz zrobić

### 1. Skróć i uporządkuj homepage `index.html`

Zostaw na stronie głównej tylko to, co naprawdę potrzebne do decyzji:

- Hero z jasnym komunikatem:
  - strony internetowe dla firm usługowych,
  - szybkie, estetyczne, mobile-first,
  - Szczecin, Rzeszów, Polska zdalnie.
- Krótki blok problemów:
  - maksymalnie 3-4 konkretne problemy klienta.
- Oferta w skrócie:
  - strona firmowa,
  - landing page,
  - redesign strony.
- Realizacje:
  - tylko 3 najlepsze przykłady z linkiem do pełnych case studies / portfolio.
- Dla kogo:
  - trenerzy i studia,
  - beauty / wellness,
  - fotografowie,
  - lokalne usługi premium,
  - małe firmy B2B.
- Dlaczego Cyber Plus:
  - custom code,
  - mobile-first,
  - szybkie ładowanie,
  - prosty kontakt i czytelna oferta.
- Proces w skrócie:
  - rozmowa i zakres,
  - projekt i treść,
  - wdrożenie i publikacja.
- Krótki, mocny kontakt / CTA.

### 2. Usuń z homepage nadmiar i przenieś go na podstrony

Usuń lub mocno skróć na stronie głównej:

- długie porównanie CMS vs custom code,
- rozbudowane wyjaśnienia technologiczne,
- pełne FAQ,
- długie opisy realizacji,
- powtarzające się sekcje o mobile-first,
- rozbudowane argumenty o utrzymaniu,
- długi proces,
- nadmiar informacji lokalnych.

### 3. Utwórz lub przebuduj podstrony usługowe i wspierające

Przygotuj architekturę opartą o osobne strony dla osobnych intencji. Jeśli to repo działa na statycznych plikach HTML, zastosuj odpowiedniki w formie plików `.html`.

Utwórz lub przebuduj:

- `oferta.html`
- `realizacje.html` albo uporządkuj obecne `portfolio.html` i zepnij je logicznie z nową strukturą
- `proces.html`
- `technologia.html`
- `strony-internetowe-szczecin.html`
- `strony-internetowe-rzeszow.html`
- `strony-dla-trenerow-personalnych.html`
- `strony-dla-salonow-beauty.html`
- `strony-dla-fotografow.html`
- `strony-dla-lokalnych-uslug-premium.html`

### 4. Zakres treści dla nowych podstron

#### `oferta.html`

Ma porządkować usługi:

- strona firmowa,
- landing page,
- redesign strony,
- SEO lokalne / widoczność lokalna,
- opcjonalnie: utrzymanie, korekty, analityka, Google Business Profile.

#### `realizacje.html` lub `portfolio.html`

Ma pokazywać pełne portfolio / case studies. Każdy case powinien możliwie zawierać:

- problem,
- decyzje projektowe,
- efekt,
- typ projektu,
- branżę,
- lokalizację,
- link do wdrożenia,
- screeny mobile / desktop, jeśli istnieją.

#### `proces.html`

Ma rozwijać współpracę:

- rozmowa,
- zakres,
- budżet,
- treść,
- projekt,
- development,
- testy,
- publikacja,
- korekty po starcie.

#### `technologia.html`

Ma edukować i sprzedawać:

- kiedy custom code ma sens,
- porównanie custom code vs WordPress / CMS,
- szybkość,
- brak ciężkich wtyczek,
- prostsze utrzymanie,
- Cloudflare / SSL / cache,
- kiedy CMS nadal jest dobrym wyborem.

#### Podstrony lokalne

`strony-internetowe-szczecin.html` i `strony-internetowe-rzeszow.html` mają być mocnymi landingami lokalnymi, ale nie kopiami 1:1.

Każda powinna zawierać:

- lokalny hero,
- opis dla jakich firm w danym mieście pracujecie,
- najczęstsze problemy lokalnych firm,
- ofertę,
- realizacje,
- proces,
- krótkie FAQ,
- CTA do kontaktu.

#### Podstrony branżowe

Każda powinna mieć:

- jeden jasny H1,
- problemy danej branży,
- opis tego, co powinna zawierać dobra strona,
- przykładowe sekcje,
- powód, dlaczego mobile-first ma znaczenie,
- przykłady realizacji, jeśli istnieją,
- CTA,
- FAQ.

### 5. Popraw SEO on-page

W całym projekcie:

- dopracuj hierarchię `H1` / `H2` / `H3`,
- zachowaj **jeden H1 na stronę**,
- przepisz nagłówki z bardziej ogólnych i emocjonalnych na bardziej konkretne i zakupowe,
- zachowaj premium ton, ale dopowiadaj wprost kontekst usług i lokalizacji.

Przykładowy kierunek:

- zamiast samego hasła „Pierwsze wrażenie dzieje się na ekranie” dopowiedz „Strony internetowe dla firm usługowych”
- zamiast „Co robimy” użyj bardziej konkretnego nagłówka typu „Projektowanie stron internetowych, landing page i redesign”
- zamiast „Zasięg” użyj „Strony internetowe Szczecin, Rzeszów i zdalnie w całej Polsce”

### 6. Przygotuj meta title i meta description

Dla każdej ważnej podstrony przygotuj unikalne:

- `title`
- `meta description`
- `og:title`
- `og:description`
- `canonical`

Trzymaj je w języku naturalnym, konkretnym i sprzedażowym. Unikaj przesady i pustych sloganów.

### 7. Zbuduj sensowne linkowanie wewnętrzne

Strona główna ma linkować do:

- oferty,
- realizacji,
- procesu,
- technologii,
- Szczecina,
- Rzeszowa,
- podstron branżowych.

Podstrony branżowe mają linkować do:

- oferty,
- realizacji,
- kontaktu,
- lokalnych landingów, jeśli to logiczne.

Podstrony lokalne mają linkować do:

- oferty,
- realizacji,
- branż,
- kontaktu.

### 8. Dopilnuj SEO technicznego

Sprawdź i popraw:

- `sitemap.xml`
- `robots.txt`
- canonicale
- Open Graph
- Twitter meta
- spójność adresów URL
- linki wewnętrzne
- ewentualne duplikacje treści

### 9. Dodaj lub uporządkuj dane strukturalne

Zadbaj o schema.org tam, gdzie ma sens:

- `Organization`
- `LocalBusiness`
- `WebSite`
- `Service`
- `FAQPage`
- `BreadcrumbList`
- `WebPage` na ważnych podstronach

Dane firmy muszą być spójne z tym, co jest w stopce i obecnym kodzie:

- Cyber Plus Adam Bartkowski
- Szczecin
- dane kontaktowe z projektu

### 10. Zachowaj jakość wizualną

To bardzo ważne:

- nie spłaszczaj strony do przeciętnego układu,
- nie zamieniaj jej w ciężki katalog usług,
- zostaw klimat premium,
- zwiększ czytelność, skróć sekcje i dodaj więcej oddechu,
- wykorzystuj linki typu „Dowiedz się więcej”, aby odciążyć homepage,
- nie usuwaj wartościowych argumentów, tylko przenoś je we właściwe miejsca.

## Ograniczenia i zasady pracy

- Nie wprowadzaj frameworków ani przebudowy stacku.
- Pracuj w istniejącym systemie HTML/CSS/JS.
- Zachowuj istniejące dane kontaktowe, formularz i podstawową strukturę techniczną.
- Jeśli tworzysz nowe podstrony, dopilnuj ich obecności w `sitemap.xml` i linkowania z głównych miejsc.
- Nie kopiuj 1:1 treści między podstronami lokalnymi i branżowymi.
- Nie stosuj keyword stuffingu.
- Nie obniżaj jakości tekstów tylko po to, żeby „brzmiały pod SEO”.

## Oczekiwany efekt końcowy

Po wdrożeniu:

- użytkownik w kilka sekund rozumie, czym zajmuje się Cyber Plus,
- homepage jest krótszy, mocniejszy i bardziej decyzyjny,
- każda ważna intencja ma swoją podstronę,
- lokalny klient widzi ofertę dla Szczecina lub Rzeszowa,
- klient branżowy trafia na stronę dopasowaną do swojej działalności,
- Google dostaje czytelną strukturę tematyczną,
- marka nadal wygląda premium i dojrzale.

## Forma odpowiedzi / realizacji

Nie kończ na ogólnych rekomendacjach. Wykonaj realną przebudowę w plikach projektu.

W odpowiedzi końcowej podaj:

- co zostało zmienione,
- jakie nowe podstrony powstały,
- jakie meta dane zostały przygotowane,
- jak zostało rozwiązane linkowanie wewnętrzne,
- czy `sitemap.xml`, `robots.txt` i schema zostały zaktualizowane,
- jakie są ewentualne otwarte kwestie lub miejsca wymagające później dopracowania.

# Cyber Plus — po wdrożeniu (SEO i widoczność)

Techniczne meta i `sitemap.xml` są w repozytorium. Poniżej **działania poza kodem**, które zwykle dają największy zwrot w Google i socialach.

## 1. Google Search Console (GSC)

1. Wejdź na [Google Search Console](https://search.google.com/search-console).
2. Dodaj **usługę (właściwość)** typu **prefiks URL**: `https://cyber-plus.pl/`.
3. Zweryfikuj domenę (np. rekord DNS u operatora domeny albo plik HTML — zgodnie z kreatorem Google).
4. Po weryfikacji: **Indeksowanie → Mapy witryn** → dodaj `https://cyber-plus.pl/sitemap.xml`.
5. **Indeksowanie → Strony**: po kilku dniach sprawdź, które URL-e są w indeksie; ewentualnie użyj **Sprawdzenie adresu URL** dla kluczowych stron (`/`, `/de/`, landingi lokalne, `portfolio.html`).
6. **Efektywność → wyniki wyszukiwania** (lub odpowiednik w nowym UI): obserwuj zapytania i CTR.

## 2. Page Experience / Core Web Vitals

- W GSC: sekcja dotycząca **Core Web Vitals** (Desktop / Mobile).
- Dla Cloudflare Pages: szybkość zależy od ciężaru strony, cache i obrazów — przy problemach warto zmierzyć [PageSpeed Insights](https://pagespeed.web.dev/) na produkcyjnym URL.

## 3. Jedna domena i linkowanie wewnętrzne

- Publicznie komunikuj jedną domenę produkcyjną: **`https://cyber-plus.pl`** (bez mieszania z inną nazwą hosta).
- Linki wewnętrzne już prowadzą do sekcji `#…` i podstron; przy nowych artykułach / case studies **linkuj z homepage i portfolio** do nowych treści.

## 4. Wizytówka Google i profile

- [Profil Firmy Google](https://www.google.com/business/) dla adresu / obszaru usług (Szczecin itd.) — spójna nazwa, NIP w opisie jeśli ma sens, link do strony.
- LinkedIn / GoldenLine itp. — jeden link do `cyber-plus.pl` w bio wystarczy na start (bez farmy katalogów).

## 5. Treść i case studies

- Każdy ważny landing (np. Szczecin, Rzeszów): **1–2 frazy główne** w tytule/H1 i naturalnie w treści.
- Portfolio: krótkie **case study** (problem → rozwiązanie → efekt) pod każdą realizacją — łatwiej rankować na long-tail i budować zaufanie.

## 6. Obraz Open Graph (udostępnienia)

- Domyślny obraz social: **`/assets/og-social-default.png`** (1200×630), podpięty w `og:image` / `twitter:image` na stronach.
- Po **zmianie brandu lub hasła** na grafice: wygeneruj nowy plik o tej samej nazwie (lub zmień nazwę + zaktualizuj meta we wszystkich HTML).

## 7. `lastmod` w `sitemap.xml`

- Przy **każdym wdrożeniu**, w którym zmieniasz treść/strukturę URL-a, ustaw dla tego URL-a `<lastmod>YYYY-MM-DD</lastmod>` na datę publikacji zmian.
- Komentarz na górze pliku `sitemap.xml` przypomina o tym — można to później zautomatyzować w CI (np. skrypt ustawiający datę z git).

## 8. Szybki checklist po zmianie DNS / pierwszym deployu

- [ ] GSC: weryfikacja + mapa witryn  
- [ ] Ręczne wejście na `https://cyber-plus.pl/sitemap.xml` (200, poprawny XML)  
- [ ] Facebook [Sharing Debugger](https://developers.facebook.com/tools/debug/) lub LinkedIn post inspector — odśwież cache podglądu po zmianie `og:image`  
- [ ] Profil Google — link do strony  

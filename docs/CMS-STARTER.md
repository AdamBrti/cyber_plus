# Cyber Plus CMS Starter

To jest bazowy Git-based CMS dla małych stron premium: fotograf, trener, beauty, lokalna firma usługowa, portfolio albo landing page.

## Wejście do panelu

Produkcja: `https://cyber-plus.pl/admin/`

Lokalnie:

1. Uruchom lokalny backend Decap:
   ```bash
   npx decap-server
   ```
2. W drugim terminalu uruchom statyczny serwer z katalogu projektu:
   ```bash
   python -m http.server 8123
   ```
3. Otwórz:
   ```text
   http://127.0.0.1:8123/admin/
   ```

## Jak edytować treść

1. Wybierz sekcję w panelu, np. `Strony > Strona główna` albo `Kolekcje · FAQ`.
2. Zmień tylko pola opisane w panelu.
3. Kliknij `Publish`.
4. CMS zapisze zmianę jako commit w GitHubie.
5. Cloudflare Pages wdroży stronę po commicie.

## Checklist produkcyjny Cyber Plus

- Branch produkcyjny: `main`.
- `admin/config.yml`:
  - `backend.repo`: `AdamBrti/cyber_plus`
  - `backend.branch`: `main`
  - `backend.base_url`: `https://cyber-plus.pl`
  - `auth_endpoint`: `decap-auth`
- Cloudflare Pages:
  - projekt podłączony do repo `AdamBrti/cyber_plus`,
  - branch deployu ustawiony na `main`,
  - build command pusty albo zgodny z obecnym statycznym deployem,
  - output directory: root projektu.
- Cloudflare Pages Variables:
  - `GITHUB_OAUTH_ID`
  - `GITHUB_OAUTH_SECRET`
  - `GITHUB_REPO_PRIVATE=1` dla prywatnego repozytorium.
- GitHub OAuth App:
  - Homepage URL: `https://cyber-plus.pl`
  - Authorization callback URL: `https://cyber-plus.pl/decap-callback`
- GitHub:
  - klient/edytor ma dostęp tylko do repo, które ma edytować,
  - `main` może mieć branch protection, jeśli zmiany CMS mają przechodzić przez review.
- Po wdrożeniu:
  - `/admin/` pokazuje logowanie GitHub,
  - logowanie wraca przez `/decap-callback`,
  - zapis testowy w FAQ robi commit na `main`,
  - Cloudflare Pages publikuje nową wersję strony.

## Minimalny standard każdego nowego klienta

- `content/settings/site.json` - marka, domena, logo, social links.
- `content/settings/contact.json` - e-mail, telefon, adres, dane firmy.
- `content/settings/seo.json` - domyślny title, description, Open Graph i schema type.
- `content/pages/home.json` - hero, CTA, SEO strony głównej, lokalne SEO.
- `content/collections/services.json` - usługi.
- `content/collections/case-studies.json` - realizacje.
- `content/collections/faq.json` - FAQ.
- `content/collections/testimonials.json` - opinie.
- `public/uploads/` - pliki dodane przez klienta.
- `/admin/` - panel CMS.

## Opcjonalne rozszerzenia startera

- `content/collections/blog/` - wpisy blogowe.
- `content/collections/landing-pages/` - lokalne lub kampanijne landing pages.
- `content/collections/pricing.json` - cennik, pakiety, warianty usług.
- `content/collections/gallery.json` - galerie zdjęć.
- `content/collections/events.json` - wydarzenia, warsztaty, terminy.
- `content/collections/offers.json` - oferty specjalne lub promocje.

## Przenoszenie do kolejnego klienta

1. Skopiuj `admin/`, `content/`, `public/uploads/`, `js/cms-content.js`, `functions/decap-auth.js`, `functions/decap-callback.js` i `_routes.json`.
2. W `admin/config.yml` zmień `backend.repo`, `branch`, `site_url`, `display_url`, `base_url` i logo.
3. Podmień dane w `content/settings/*.json`.
4. Dopasuj mapowanie w `js/cms-content.js` do selektorów nowej strony.
5. W Cloudflare Pages ustaw `GITHUB_OAUTH_ID`, `GITHUB_OAUTH_SECRET` i dla prywatnego repo `GITHUB_REPO_PRIVATE=1`.
6. W GitHub OAuth App ustaw callback: `https://twoja-domena.pl/decap-callback`.

## Uwaga SEO

Obecny Cyber Plus jest stroną statyczną bez build stepu, więc `js/cms-content.js` aktualizuje meta dane po stronie przeglądarki. To wystarcza do edycji i podglądu treści, ale docelowy starter powinien dostać prosty build step, który wstrzykuje SEO z JSON do HTML przed deployem.

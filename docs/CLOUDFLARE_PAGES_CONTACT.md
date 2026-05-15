# Formularz kontaktu — instrukcja krok po kroku (Cloudflare Pages + Resend)

Ten dokument jest dla **osób początkujących w Cloudflare**. Zakładamy, że masz już **pliki strony** (ten projekt z `index.html`, folderem `css/`, `js/`, `assets/` i **`functions/`**).

**Co osiągniesz:** gość wypełnia formularz na stronie → Cloudflare uruchamia mały program (**Pages Function** w `functions/api/contact.js`) → program wysyła wiadomość przez **Resend** na Twój **Outlook** (`MAIL_TO`). W mailu możesz od razu odpowiadać klientowi (**Reply-To** = jego adres).

**Dwie usługi:** **Cloudflare** (hosting strony + funkcja `/api/contact`) i **Resend** (wysyłka e-maili z API). Obie mają darmowe limity na start.

---

## Słowniczek (krótko)

| Termin | Znaczenie |
|--------|-----------|
| **Cloudflare Dashboard** | Panel na [https://dash.cloudflare.com](https://dash.cloudflare.com) po zalogowaniu |
| **Strefa (zone)** | Twoja domena (np. `cyber-plus.pl`) dodana do Cloudflare — DNS zarządzasz tam |
| **Pages** | Hosting statycznych stron (HTML itd.) + opcjonalnie małe funkcje serwerowe |
| **Pages Function** | Plik w folderze `functions/` — u Ciebie obsługuje adres `/api/contact` |
| **Deploy / wdrożenie** | „Wgranie” aktualnej wersji strony na serwery Cloudflare |
| **Zmienna środowiskowa** | Hasło / adres e-mail wpisany w panelu Pages — **nie** wklejasz go do kodu w repozytorium |

---

## Zanim zaczniesz — sprawdź listę

1. **Konto Cloudflare** — jeśli nie masz: [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) (e-mail + hasło).
2. **Domena `cyber-plus.pl`** — jeśli DNS ma być w Cloudflare, u **OVH** (lub innego rejestratora) **nameserwery** muszą wskazywać na te z Cloudflare (to już mogłeś zrobić przy „przeniesieniu” DNS). **Na pierwszy test formularza domena własna nie jest obowiązkowa** — wystarczy adres `*.pages.dev` od Cloudflare.
3. **Kod strony w repozytorium Git** (np. **GitHub**) — **najwygodniejsza** droga: Pages sam pobiera pliki przy każdym pushu. Alternatywa: **ręczny upload** ZIP (opis niżej).
4. **Konto Resend** — osobna rejestracja na [https://resend.com](https://resend.com) (może być ten sam e-mail co do Cloudflare).

Zapisz w bezpiecznym miejscu: **klucz API Resend** (pokazuje się tylko raz przy tworzeniu).

---

## CZĘŚĆ A — Resend (kolejność: najpierw to, potem wkleisz klucz w Cloudflare)

### A1. Rejestracja

1. Wejdź na [https://resend.com](https://resend.com) → **Sign up** / Zarejestruj się.
2. Potwierdź e-mail, jeśli serwis wyśle link aktywacyjny.

### A2. Utworzenie klucza API

1. Zaloguj się do panelu Resend.
2. W menu znajdź **API Keys** (lub **Settings → API Keys** — nazewnictwo bywa aktualizowane).
3. Kliknij coś w stylu **Create API Key** / **Add**.
4. Nadaj nazwę (np. `cloudflare-pages-cyber-plus`) → zapisz.
5. **Skopiuj wyświetlony klucz** (zaczyna się zwykle od `re_`). **Nie udostępniaj go publicznie.** Jeśli zamkniesz okno bez kopiowania, usuń stary klucz i utwórz nowy.

### A3. Pierwsze wysyłki a adres „nadawcy”

- W kodzie domyślny nadawca to: `Cyber Plus <onboarding@resend.dev>`.
- Na **darmowym / początkowym** koncie Resend często obowiązują **limity**: np. wysyłka **tylko na wybrane / zweryfikowane adresy**. Dlatego na start ustaw w Cloudflare (krok C4) **`MAIL_TO` na ten sam adres Outlook**, na który **na pewno** możesz dostać maila z Resend (najczęściej: ten sam, którym rejestrowałeś Resend lub adres dodany w panelu jako dozwolony — sprawdź zakładki **Domains** / dokumentację „Getting started” w Resend, jeśli pierwszy test nie dojdzie).
- Gdy dodasz i **zweryfikujesz domenę** `cyber-plus.pl` w Resend (rekordy DNS w Cloudflare), wtedy w Cloudflare ustawisz też **`MAIL_FROM`** (np. `Cyber Plus <kontakt@cyber-plus.pl>`). **Na pierwszy dzień możesz tego nie robić.**

---

## CZĘŚĆ B — Nowy projekt Cloudflare Pages (pierwsze wdrożenie)

Zaloguj się: [https://dash.cloudflare.com](https://dash.cloudflare.com).

### B1. Wejście w Pages

1. W **górnym pasku** lub **lewym menu** znajdź **Workers & Pages** (czasem skrócone do ikon — szukaj nazwy **Workers** i **Pages**).
2. Otwórz **Workers & Pages**.
3. U góry wybierz zakładkę **Pages** (nie „Workers” same — chodzi o hosting stron).
4. Kliknij **Create application** / **Create a project** (przycisk do utworzenia projektu Pages).

### B2. Sposób podłączenia kodu — wybierz **jedną** ścieżkę

#### Ścieżka **1** — Git (zalecana, jeśli masz GitHub)

1. Wybierz **Connect to Git** / **Connect GitHub** (lub GitLab).
2. Jeśli pierwszy raz: Cloudflare poprosi o **autoryzację** GitHuba → zaakceptuj.
3. Wybierz **repozytorium**, w którym leży ten projekt (folder z `index.html` w **głównym katalogu** repozytorium albo podfolderze — patrz B4).
4. Kliknij **Begin setup** / **Configure build**.

#### Ścieżka **2** — Upload bez Gita (ZIP)

1. Na komputerze spakuj **całą zawartość** projektu (m.in. `index.html`, `functions`, `css`, `js`, `assets`) do pliku **ZIP**.
2. W kreatorze Pages wybierz opcję w stylu **Upload assets** / **Direct Upload** (nazwa zależy od wersji panelu).
3. Wgraj ZIP i nadaj projektowi nazwę (np. `cyber-plus`).

*Uwaga:* przy samym uploadzie aktualizacja strony = **kolejny upload** albo później przejście na Git — dla Ciebie Git jest wygodniejszy na dłużej.

### B3. Ustawienia buildu (ekran konfiguracji) — **bardzo ważne**

Po wybraniu repozytorium zobaczysz formularz **Build configuration**. Ustaw tak:

| Pole w panelu (ang.) | Co wpisać |
|----------------------|-----------|
| **Project name** | Dowolna nazwa, np. `cyber-plus` — z niej powstanie adres `https://cyber-plus-xxxxx.pages.dev` (fragment może być losowy). |
| **Production branch** | Zwykle `main` albo `master` — ta gałąź z Gita wdraża się na „produkcję”. |
| **Framework preset** | **None** / **Brak** (to nie React ani Next). |
| **Build command** | **Zostaw puste** albo wpisz `exit 0` (niektórzy tak robią, gdy panel wymaga czegoś w polu). |
| **Build output directory** | **`/`** (ukośnik) **albo** **`.`** (kropka) — zależnie od panelu: chodzi o to, żeby **katalog wyjściowy** to był **root projektu**, gdzie leży `index.html`. |

**Root directory (opcjonalne):**  
Jeśli w repozytorium strona **nie** jest w głównym folderze, tylko np. w `cyber_plus/`, wpisz w **Root directory** ten folder (`cyber_plus`). Jeśli `index.html` jest **w korzeniu** repo — **zostaw puste**.

### B4. Folder `functions` — bez dodatkowej konfiguracji

Cloudflare **automatycznie** wykrywa folder **`functions/`** obok plików strony. **Nie musisz** w panelu wpisywać nic specjalnego o `/api/contact` — po udanym deployu funkcja jest pod adresem:

`https://<twój-projekt>.pages.dev/api/contact`  
(ten sam host co strona główna, ścieżka `/api/contact`).

### B5. Zapis i pierwszy deploy

1. Kliknij **Save and Deploy** / **Deploy**.
2. Poczekaj na zakończenie buildu (1–3 min). Przy błędzie otwórz **View build log** i czytaj ostatnie linie — często problemem jest zła **ścieżka output** albo zły **root directory**.

Po sukcesie: otwórz **Visit site** — powinieneś zobaczyć stronę główną.

---

## CZĘŚĆ C — Zmienne środowiskowe (sekrety) w Pages

Bez tego formularz zwróci błąd — funkcja nie wie, gdzie wysłać maila i jaki klucz Resend użyć.

1. W **Workers & Pages** → **Pages** → kliknij **nazwę swojego projektu** (nie „Create”, tylko istniejący projekt).
2. Wejdź w zakładkę **Settings** (Ustawienia).
3. Po lewej (lub w środku strony) znajdź **Environment variables** (Zmienne środowiskowe).
4. Kliknij **Add** / **Add variable** — dodaj **każdą** zmienną osobno.

### C1. `RESEND_API_KEY`

- **Variable name:** dokładnie `RESEND_API_KEY`
- **Value:** wklej klucz z Resend (A2).
- Zaznacz **Encrypt** / **Secret**, jeśli panel na to pozwala (zalecane).
- **Environment:** wybierz **Production** (i ewentualnie **Preview**, jeśli testujesz branch preview).

### C2. `MAIL_TO`

- **Variable name:** `MAIL_TO`
- **Value:** Twój adres Outlook, np. `kontakt.cyberplus@outlook.com` (jeden adres, bez spacji).
- To jest **adres odbiorcy** — tam przyjdzie treść z formularza.

### C3. `MAIL_FROM` (opcjonalnie — później)

- Na start **pomiń** — wtedy użyty zostanie domyślny `Cyber Plus <onboarding@resend.dev>`.
- Gdy zweryfikujesz domenę w Resend: dodaj zmienną `MAIL_FROM` z wartością np. `Cyber Plus <kontakt@cyber-plus.pl>`.

### C4. `ALLOWED_ORIGINS` — **na pierwszy test NIE dodawaj**

- Jeśli **nie** utworzysz tej zmiennej, formularz działa z dowolnego miejsca, które poprawnie wywołuje Twój site (najprościej na start).
- Gdy już wszystko działa, możesz dodać **jedną** linię, np.:  
  `https://cyber-plus.pl,https://www.cyber-plus.pl`  
  **albo** adres `https://twoja-nazwa.pages.dev` — **dokładnie** tak, jak w pasku przeglądarki (z `https://`, bez ukośnika na końcu). **Dwa adresy rozdziel przecinkiem bez spacji.**  
  Jeśli wpiszesz źle, formularz zwróci błąd — wtedy usuń zmienną albo popraw.

### C5. Ponowne wdrożenie po zapisaniu zmiennych

Po dodaniu lub zmianie zmiennych Cloudflare często pokazuje informację, że trzeba **odświeżyć deployment**. Zrób tak:

1. W projekcie Pages przejdź do zakładki **Deployments**.
2. Przy ostatnim udanym deployu wybierz **⋯** (trzy kropki) → **Retry deployment** / **Redeploy** — albo zrób **pusty commit** i push na Git, żeby powstał nowy build.

Dopiero **nowy** deploy „widzi” świeże zmienne w funkcji.

---

## CZĘŚĆ D — Test formularza (bez własnej domeny)

1. Otwórz w przeglądarce adres **`https://…pages.dev`** z panelu (zakładka **Deployments** → link przy najnowszym deployu).
2. Przewiń do sekcji **Kontakt**.
3. Wypełnij formularz → **Wyślij wiadomość**.
4. Sprawdź skrzynkę **`MAIL_TO`** (i folder **Spam**).

**Co nie zadziała:** otwieranie pliku `index.html` z dysku (`file://`) — wtedy przeglądarka wyśle żądanie w złe miejsce i **nie** trafi w funkcję. Zawsze testuj przez **HTTPS** z Cloudflare.

---

## CZĘŚĆ E — Podpięcie własnej domeny `cyber-plus.pl` do Pages (gdy już działa `pages.dev`)

1. W projekcie Pages: **Custom domains** → **Set up a custom domain**.
2. Wpisz `cyber-plus.pl` lub `www.cyber-plus.pl`.
3. Cloudflare **podpowie rekordy DNS** (często **CNAME** na `pages.dev` albo rekordy w stylu Pages — postępuj zgodnie z wizardem).
4. Jeśli domena **jest już** w tej samej organizacji Cloudflare, rekordy często dodadzą się **automatycznie**. Jeśli nie — dodaj je ręcznie w **DNS** strefy `cyber-plus.pl`.
5. Poczekaj na status **Active** (propagacja DNS: od kilku minut do 24 h).

Potem możesz (opcjonalnie) ustawić `ALLOWED_ORIGINS` z dokładnym `https://cyber-plus.pl` (i ewentualnie `https://www.cyber-plus.pl`).

---

## CZĘŚĆ F — Co jest „w repozytorium”, a czego **nie** commitujesz

- **W repozytorium:** cały kod, w tym `functions/api/contact.js` — **bez** klucza Resend.
- **Nigdy w Git:** klucz API, hasła — tylko w **Environment variables** w panelu Cloudflare.
- Lokalny plik **`.dev.vars`** (opcjonalnie pod Wrangler) — jest w **`.gitignore`**.

---

## Typowe problemy

| Objaw | Co sprawdzić |
|--------|----------------|
| „Wysyłamy…” i potem błąd | **Deployments** → logi funkcji (Logs) lub w Response w DevTools (F12 → Network → żądanie `contact`) — czy 503? Brak `RESEND_API_KEY` / `MAIL_TO`. |
| 403 | Zła zmienna **`ALLOWED_ORIGINS`** — usuń ją albo dopisz dokładny Origin strony. |
| 502 / send_failed | Resend odrzuca żądanie — zły klucz, limit konta, zły `MAIL_FROM` bez weryfikacji domeny. Sprawdź panel Resend → **Logs** / **Emails**. |
| 404 na `/api/contact` | W deployu **nie ma** folderu `functions/` (zły branch, zły root w repo, ZIP bez `functions`). |
| Strona działa, formularz nie | Czy otwierasz **`https://...`**, nie plik z dysku? |

---

## Skrót — minimalna lista „kliknij po kolei”

1. Resend: konto → **API Key** → skopiuj.  
2. Cloudflare: **Workers & Pages** → **Pages** → **Create** → Git lub Upload.  
3. Build: **preset None**, output **`/`** lub **`.`**, root tylko jeśli strona w podfolderze.  
4. **Deploy** → wejdź na `*.pages.dev` → sprawdź, czy strona się wyświetla.  
5. **Settings** → **Environment variables** → `RESEND_API_KEY`, `MAIL_TO` → **Redeploy**.  
6. Formularz na stronie → mail w Outlooku.

---

## Polityka prywatności

Po uruchomieniu formularza dopnij finalną treść prawną w `polityka-prywatnosci.html` (procesor: Resend; hosting: Cloudflare). W repo jest już szkic sekcji o formularzu.

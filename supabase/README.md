# Účty, synchronizace pokroku a žebříček (Supabase)

Aplikace umí účty přes [Supabase](https://supabase.com). Dokud nejsou v `index.html`
vyplněné `SUPABASE_URL` a `SUPABASE_ANON_KEY`, účty jsou vypnuté a vše funguje
jako dřív: pokrok se ukládá jen v prohlížeči.

## Jak to zapnout

1. **Založ projekt.** Na https://supabase.com se přihlas a klikni na *New project*.
   Region zvol třeba *Central EU (Frankfurt)*. Heslo k databázi si ulož, aplikace ho nepotřebuje.
2. **Vytvoř tabulky a pravidla.** V levém menu otevři *SQL Editor* → *New query*,
   vlož celý obsah souboru [`schema.sql`](schema.sql) a klikni na *Run*.
   Skript jde bezpečně spustit i opakovaně.
3. **Nastav adresu webu.** *Authentication* → *URL Configuration*:
   - *Site URL*: `https://martinpaska.github.io/zi-you-later/`
   - *Redirect URLs*: přidej `https://martinpaska.github.io/zi-you-later/`
4. **Doporučené nastavení přihlašování.** *Authentication* → *Sign In / Providers* → *Email*:
   - *Confirm email* nech zapnuté (nikdo si nezaloží účet na cizí e-mail).
   - Minimální délku hesla nastav na 8 (aplikace ji kontroluje taky).
5. **Zkopíruj klíče.** *Project Settings* → *API* (nebo *Data API* / *API Keys*):
   - *Project URL*, např. `https://abcdefgh.supabase.co`
   - *anon public* klíč (dlouhý text začínající `eyJ…`, případně nový „publishable“ klíč `sb_publishable_…`)

   Oba vlož do `index.html` na místo prázdných uvozovek:
   ```js
   const SUPABASE_URL='https://abcdefgh.supabase.co';
   const SUPABASE_ANON_KEY='eyJ...';
   ```
   **Nikdy sem nedávej `service_role` (secret) klíč.** Ten obchází všechna pravidla.

## Bezpečnost v kostce

- **Veřejný klíč:** *anon* klíč je veřejný. Co s ním kdo smí, určují pravidla
  (Row Level Security) ve `schema.sql`.
- **Pokrok:** každý smí číst a měnit jen svůj vlastní pokrok (`progress`).
- **Žebříček:** profily (`profiles`) jsou veřejné, ale obsahují jen přezdívku, avatar
  a počty. E-mail vidí jen jeho majitel.
- **Přezdívky:** 2–20 znaků, unikátní bez ohledu na velká a malá písmena.
- **Hesla:** ukládá a šifruje Supabase. Aplikace je nikde neukládá.
- **Smazání účtu:** *Delete account* v aplikaci smaže uživatele i jeho data (funkce `delete_me`).
- **Podvádění:** žebříček počítá prohlížeč, takže nejde úplně zabránit tomu, aby
  si někdo počty upravil. Databáze aspoň hlídá rozumné rozsahy čísel.

## Limity bezplatného tarifu

- **Uspávání:** projekt se po zhruba týdnu bez aktivity uspí. Probudíš ho v dashboardu
  tlačítkem *Restore*. Aplikace mezitím dál funguje bez účtů.
- **E-maily:** vestavěné posílání (potvrzení registrace, zapomenuté heslo) je omezené
  na pár e-mailů za hodinu. Pro víc uživatelů nastav vlastní SMTP:
  *Authentication* → *Emails* → *SMTP Settings* (např. služba Resend má bezplatný tarif).

## Admin stránka

Na adrese `https://martinpaska.github.io/zi-you-later/#admin` (nebo v aplikaci *Nastavení → Admin*) je přehled:
kolik zařízení aplikaci denně otevře (s účtem i bez), nové a aktivní účty, co lidé nejčastěji otevírají,
a tabulka všech účtů (přezdívka, e-mail, registrace, poslední aktivita, pokrok) s hledáním, řazením a exportem do CSV.

1. **Vytvoř tabulky a funkce.** *SQL Editor* → *New query*, vlož celý obsah [`admin.sql`](admin.sql) a klikni na *Run*.
   Skript jde bezpečně spustit i opakovaně.
2. **Udělej ze sebe admina.** V *SQL Editoru* spusť (se svým e-mailem, kterým se do aplikace přihlašuješ):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'tvuj@email.cz'
   on conflict do nothing;
   ```
   Svůj e-mail sem do souboru nepiš, repozitář je veřejný.
3. **Přihlas se** v aplikaci tím účtem a otevři `#admin`.

Odebrání admina: `delete from public.admins where user_id = (select id from auth.users where email = '…');`

**Bezpečnost:** data všech uživatelů vrací jen funkce `admin_stats()`, která nejdřív ověří, že je přihlášený
účet v tabulce `admins`. Tu tabulku z aplikace nikdo nečte ani nemění, jde to jen v dashboardu Supabase.

**Anonymní počty:** každé zařízení pošle nejvýš jednou denně „byl jsem tu“ a za každé otevřené cvičení
„otevřel jsem X“. Ukládají se jen denní součty (tabulka `usage`), bez ID, IP adresy a cookies, takže unikátní
lidi za týden spočítat nejde: graf ukazuje zařízení za den. Počítat se začne od chvíle, kdy spustíš `admin.sql`.
Aplikace to uvádí na stránce *O aplikaci*.

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

# Zì You Later

Aplikace na procvičování čínských znaků. Běží jako statická stránka na GitHub Pages.

- `index.html` – celá aplikace
- `strokes.json` – data pro tahy znaků
- Pokrok se ukládá v prohlížeči (localStorage). Účty, synchronizace pokroku a žebříček běží přes Supabase, jakmile jsou v `index.html` vyplněné klíče. Návod: [`supabase/README.md`](supabase/README.md).

## Design: Impeccable

V `.claude/skills/impeccable` je skill [Impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0, verze 4.8.0) pro Claude Code. V nové relaci nad tímto repozitářem ho spustíš příkazem `/impeccable`, např. `/impeccable audit`, `/impeccable polish` nebo `/impeccable critique index.html`. Při prvním použití si stáhne malý spouštěcí program do `~/.impeccable/bin`. Pracovní soubory ukládá do `.impeccable/` (dočasné jsou v `.gitignore`).

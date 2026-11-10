# Zì You Later

Aplikace na procvičování čínských znaků. Běží jako statická stránka na GitHub Pages.

- `index.html` – celá aplikace
- `strokes.json` – data pro tahy znaků
- `hsk1/` – kurz **HSK 1** (nové HSK, oficiální osnova CLEC z listopadu 2025, platí od července 2026): oficiální seznam 300 slov (`words.tsv`), 246 znaků ke čtení (`chars.txt`), znaky k psaní (`write.txt`), rozdělení do 15 lekcí podle oficiálních komunikačních úkolů (`lessons.txt`), gramatika podle oficiálního seznamu gramatiky HSK 1 s příklady a cvičeními (`grammar.txt`, cvičení se zapíší do `grammar-hsk1.json`), věty k lekcím (`sentences.txt`; `build_grammar.py` hlídá, že používají jen slova HSK 1) a anglické významy z CC-CEDICT (`cedict-hsk1.u8`, CC BY-SA 4.0). `hsk1/build.py` z nich vloží data do `index.html` a doplní tahy do `strokes.json`: `pip install pypinyin==0.55.0`, `npm pack hanzi-writer-data@2.0.1 && tar xzf hanzi-writer-data-2.0.1.tgz`, `python3 hsk1/build.py package`. Písmo pak znovu sestaví `fonts/build_font.py`.
- `phonetics.json` – slabiky a slova pro Čínský diktát (příprava na test z fonetiky). Vzniká skriptem `phonetics/build.py` z tabulky slabik kurzu `phonetics/syllables.txt`: `pip install pypinyin==0.55.0 && python3 phonetics/build.py phonetics.json`
- Pokrok se ukládá v prohlížeči (localStorage). Účty, synchronizace pokroku a žebříček běží přes Supabase, jakmile jsou v `index.html` vyplněné klíče. Návod: [`supabase/README.md`](supabase/README.md).

## Design: Impeccable

V `.claude/skills/impeccable` je skill [Impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0, verze 4.8.0) pro Claude Code. V nové relaci nad tímto repozitářem ho spustíš příkazem `/impeccable`, např. `/impeccable audit`, `/impeccable polish` nebo `/impeccable critique index.html`. Při prvním použití si stáhne malý spouštěcí program do `~/.impeccable/bin`. Pracovní soubory ukládá do `.impeccable/` (dočasné jsou v `.gitignore`).

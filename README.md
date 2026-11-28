# Zì You Later

Aplikace na procvičování čínských znaků. Běží jako statická stránka na GitHub Pages.

- `index.html` – kostra stránky (HTML); styly jsou v `css/app.css`, kód v `js/*.js`
- `strokes.json` – data pro tahy znaků
- `hsk1/` – kurz **HSK 1** (nové HSK, oficiální osnova CLEC z listopadu 2025, platí od července 2026): oficiální seznam 300 slov (`words.tsv`), 246 znaků ke čtení (`chars.txt`), znaky k psaní (`write.txt`), rozdělení do 15 lekcí podle oficiálních komunikačních úkolů (`lessons.txt`), gramatika podle oficiálního seznamu gramatiky HSK 1 s příklady a cvičeními (`grammar.txt`, cvičení se zapíší do `grammar-hsk1.json`), věty k lekcím (`sentences.txt`), dva cvičné testy ve formátu oficiálního testu HSK 1 (`tests.txt`, zapíší se do `hsk1-tests.json`), anglické významy z CC-CEDICT (`cedict-hsk1.u8`, CC BY-SA 4.0) a ručně vybrané významy (`meanings.py`). Data se vloží do `js/data-hsk1.js` a tahy do `strokes.json`.
- `hsk2/`, `hsk3/` – kurzy **HSK 2** (200 slov, 125 znaků, 17 lekcí) a **HSK 3** (500 slov, 284 znaků, 22 lekcí) ze stejné osnovy, se stejnými soubory jako `hsk1/` (zatím bez cvičných testů: vzorový test nového HSK 2 a 3 jsme nenašli). Seznamy jsou kumulativní: každá úroveň má jen svá nová slova, ale věty a cvičení smějí používat i slova nižších úrovní. Slovo se dvěma čteními se ve větách píše `slovo|pinyin` (`还|huán`, `得|děi`), zdvojené slovo taky (`看看|kànkan`). Tyhle úrovně se **nenačítají při startu**: `js/pack-load.js` vloží do stránky `packs/hsk<N>.js`, jen když je kurz vybraný. K tomu `packs/hsk<N>-grammar.json` (cvičení), `packs/hsk<N>-strokes.json` (tahy znaků, které `strokes.json` nemá, takže `strokes.json` zůstává pro ostatní stejně velký) a písmo `fonts/ziyoukai-hsk<N>.woff2` se znaky, které hlavní písmo nemá (přidá ho `js/packs.js`).
- Všechny úrovně sestaví `hsk/build.py` (gramatiku, věty a testy `hsk/build_grammar.py`, který hlídá, že všechno používá jen slova dané úrovně a nižších): `pip install pypinyin==0.55.0`, `npm pack hanzi-writer-data@2.0.1 && tar xzf hanzi-writer-data-2.0.1.tgz`, `python3 hsk/build.py package 1` (a `2`, `3`). Písmo pak znovu sestaví `fonts/build_font.py`. Zdroj seznamů: 中文水平考试 HSK 考试大纲 (CLEC, 2025-11), na CDN CLEC: `https://hsk.cn-bj.ufileos.com/3.0/新版HSK考试大纲1219.pdf` (slova str. 77–101, znaky 353–357 a 374–375, gramatika 383–391, úkoly 2–17).
- `phonetics.json` – slabiky a slova pro Čínský diktát (příprava na test z fonetiky). Vzniká skriptem `phonetics/build.py` z tabulky slabik kurzu `phonetics/syllables.txt`: `pip install pypinyin==0.55.0 && python3 phonetics/build.py phonetics.json`
- `art/` – malby za Tvou cestou (`ink1.webp` … `ink22.webp`, zdroje a autoři v [`art/README.md`](art/README.md)). Vznikají skriptem `art/build.py` ze zdrojů v `art/src/`: `pip install pillow numpy && python3 art/build.py`. Skript ořízne prázdné okraje a odtržené proužky na krajích, srovná papír na `--paper` (#f7f1e8), aby kraje nebyly šedé, uloží WebP a zapíše poměry stran do `INKS` v `js/units.js`. Levý a pravý kraj ztlumí stejně CSS (`.umap::before`, `mask-image`). Obrázky jsou v cache `DATA`, která vydání přežije: po novém sestavení proto zvyš `?v=` u `url(../art/ink…webp)` v `css/app.css`.
- Pokrok se ukládá v prohlížeči (localStorage). Účty, synchronizace pokroku a žebříček běží přes Supabase, jakmile jsou v `js/account.js` vyplněné klíče. Návod: [`supabase/README.md`](supabase/README.md).

## Jak je aplikace poskládaná

Žádný build, žádné moduly: stránka načte `css/app.css` a pak postupně všechny skripty z `js/` (`<script src>` v `index.html`, ve stejném pořadí, v jakém jsou tam). Jsou to obyčejné skripty se **společným globálním prostorem**, takže funkce a konstanty z jednoho souboru jsou vidět v dalších.

- Soubor smí při načtení použít jen to, co deklarují soubory **před ním** a on sám (funkce uvnitř funkcí a v obsluze kliknutí můžou volat cokoli). To hlídá test `03-load-order`.
- `js/data-cin1.js` a `js/data-hsk1.js` jsou data kurzů (HSK 1 generuje `hsk/build.py`; HSK 2 a 3 jsou v `packs/`, viz výše), `js/data-chars.js` rozklad a příběhy znaků, `js/strings-cs.js` slovník českých překladů, `js/i18n.js` překladač.
- Nový soubor: přidej ho do `index.html` na správné místo, do `CORE` v `sw.js` a spusť testy.
- **Vydání:** při každé změně kódu nebo dat zvyš `CACHE` v `sw.js` (`zyl-vN`), jinak by se starým návštěvníkům mísily staré a nové soubory. Služba pak po aktualizaci ukáže „Nová verze · Načíst znovu“. Velké soubory, které se mění zřídka (`strokes.json`, `fonts/ziyoukai.woff2`, skript hanzi-writer; seznam `DATA_FILES`), mají vlastní cache `DATA` (`zyl-data-vN`), kterou vydání nemaže, takže se znovu nestahují. Do `DATA` jdou i tahy a písma HSK 2 a výš (`packs/hsk<N>-strokes.json`, `fonts/ziyoukai-hsk<N>.woff2`), až když je někdo poprvé potřebuje. Když se některý z nich změní (třeba po `hsk/build.py` nebo `fonts/build_font.py`), zvyš kromě `CACHE` i `DATA`.
- České texty: aplikace je psaná anglicky a překládá se při zobrazení. Nový text přidej do `CS` (přesný text) nebo do `CS_P` (text s číslem) v `js/strings-cs.js` / `js/i18n.js`. Test `15-i18n` zachytí chybějící překlad novinek, kurzů a hlavních obrazovek.

## Testy

```bash
npm install            # eslint, acorn, hanzi-writer (jen pro testy)
npm test               # všechno: statické kontroly i prohlížeč
npm run test:static    # jen kontroly bez prohlížeče (pár sekund)
node tests/run.js path # jen soubory, v jejichž názvu je „path“
```

Prohlížečové testy potřebují Playwright s Chromiem (`npx playwright install chromium`). Spouští aplikaci z `index.html` tak, jak je, na lokálním serveru, a vyhodí chybu při jakékoli výjimce na stránce. `tests/cases/`:

| Soubor | Co hlídá |
|---|---|
| `01-structure` | `index.html`, `js/`, `css/` a `sw.js` si odpovídají (každý skript je načtený, v cache a existuje) |
| `02-lint` | ESLint nad všemi skripty dohromady: nedefinované názvy, název deklarovaný dvakrát |
| `03-load-order` | soubor při načtení nepoužívá nic z pozdějšího souboru |
| `04-data` | data HSK 1–3 a Čínštiny 1, tahy znaků, cvičení, cvičné testy; HSK 2 a 3 se nenačítají při startu |
| `05-service-worker` | připomínky a nová verze (služba v simulovaném prostředí) |
| `10-smoke` … `16-reminders` | načtení všech kurzů a obou jazyků, data HSK 2 a 3 jen po výběru, všechny obrazovky, cesta s pečetěmi a Finální test, seznam slovíček bez duplicit, cvičný test HSK 1, dokončení cvičení, překlady, připomínky |

## Design: Impeccable

V `.claude/skills/impeccable` je skill [Impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0, verze 4.8.0) pro Claude Code. V nové relaci nad tímto repozitářem ho spustíš příkazem `/impeccable`, např. `/impeccable audit`, `/impeccable polish` nebo `/impeccable critique index.html`. Při prvním použití si stáhne malý spouštěcí program do `~/.impeccable/bin`. Pracovní soubory ukládá do `.impeccable/` (dočasné jsou v `.gitignore`).

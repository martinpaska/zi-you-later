# Audit obsahu z učebnice (kurz Čínština 1)

> **Nejde o právní radu.** Tohle je technický soupis toho, co v aplikaci může pocházet z učebnice
> *Integrated Chinese, Level 1 Part 1* (3. vyd.), a návrh, jak riziko zmenšit. Jestli je konkrétní
> věta chráněná autorským právem, posoudí jen právník (třeba právní poradna MUNI nebo vydavatel Cheng & Tsui).

Stránka je veřejná, takže doslovné dialogy, ukázkové věty a výklady gramatiky z učebnice jsou riziko.
Seznamy slovíček (znak, pinyin, význam) tady řešené nejsou, jsou mimo rozsah tohoto auditu.

## Shrnutí

| Soubor | Co to je | Počet | Odhad původu | Riziko |
|---|---|---:|---|---|
| `js/data-cin1.js` → `st` | věty k lekcím (režim Věty, kartičky, cesta) | 184 | psané podle situací z dialogů; **32 vět vypadá jako doslovné nebo skoro doslovné repliky** | **střední** |
| `examples.json` (zdroj `examples/l*.txt`) | krátké příkladové věty u znaků a slov | 329 | napsané pro aplikaci (commit 252b162: „vocabulary-checked, pinyin generated“) | nízké |
| `js/grammar-data.js` → `GRAMMAR_CIN1` | 72 gramatických jevů: název, strana, výklad, vzorec, tip, příklady | 72 jevů, 128 příkladů | výklady a příklady psané pro aplikaci (komentář v souboru); názvy a pořadí kopírují obsah učebnice | nízké (názvy), nízké až střední (příklady shodné se `st`) |
| `grammar-practice.json` (zdroj `grammar-practice/l*.txt`) | cvičení ke gramatice, 20 na jev | 1440 | generované/psané pro aplikaci podle šablon (doplň, vyber správnou, seřaď) | nízké |
| `grammar1.json` (zdroj `grammar1/g*.txt`) | kurz Gramatika čínštiny I, semináře G1–G10 | 10 seminářů, 245 příkladů, 200 cvičení | shrnutí „vlastními slovy (ne ze slajdů)“ podle `grammar1/build.py`; příklady smějí brát slova ze slajdů (26 slov označených „mimo učebnici“) | jiné riziko: **materiály vyučujícího**, ne učebnice |

Ostatní kurzy (HSK 1–3) vycházejí z oficiálních seznamů HSK a mají vlastní věty; nejsou předmětem tohoto auditu.

## Metoda

1. **Soupis.** Skriptem jsem posbíral všechny čínské věty kurzu Čínština 1 ze všech čtyř zdrojů
   (`st`, `examples.json`, příklady v `GRAMMAR_CIN1`, `grammar-practice.json`) a `grammar1.json` zvlášť,
   a spočítal je po lekcích.
2. **Původ podle repozitáře.** Komentáře v souborech a builderech a zprávy commitů (`git log`):
   `examples/build.py`, `grammar-practice/build.py` a `grammar1/build.py` věty kontrolují proti slovní
   zásobě do dané lekce a generují pinyin, tedy jde o věty psané pro aplikaci. U `st` žádný zdrojový soubor
   ani komentář o původu není; je v aplikaci od začátku.
3. **Příznaky převzetí.** U každé věty: jména postav učebnice (王朋, 李友, 高文中, 白英爱, 常老师, 王红, 高小音),
   dialogové obraty (喂, 请进, 别客气, 对不起, 太好了, 算了…), délka (12 a víc znaků), situace vázaná na
   konkrétní scénu z učebnice, a shody mezi soubory (stejná věta ve více zdrojích).
4. **Ruční porovnání se znalostí učebnice.** Věty, které připomínají konkrétní repliku z dialogu nebo textu
   lekce, jsem označil jako **kandidáty**. Učebnice v repozitáři není, takže **shodu nešlo ověřit mechanicky**:
   seznam níže je odhad a je potřeba ho projít s knihou v ruce.

Výsledky příznaků:

| Zdroj | Vět | Se jménem postavy | S dialogovým obratem | 12+ znaků | Průměr znaků |
|---|---:|---:|---:|---:|---:|
| `st` | 184 | 1 | 10 | 15 | 8,0 |
| `examples.json` | 329 | 10 | 10 | 6 | 6,7 |
| příklady `GRAMMAR_CIN1` | 128 | 6 | 3 | 5 | 6,5 |
| `grammar-practice.json` | 1440 | 108 | 12 | 122 | 7,8 |

Věty v `st` jsou krátké, izolované (12–25 na lekci, žádné celé dialogy) a jména postav v nich skoro nejsou.
To mluví spíš pro přepis situací než pro opis dialogů. Část replik je ale velmi blízko konkrétním větám
z dialogů. 41 vět ze `st` se opakuje i v jiném souboru (hlavně v `examples.json` a ve cvičeních), takže
při náhradě je potřeba je měnit všude.

## Kandidáti na doslovné převzetí (`js/data-cin1.js`, pole `st`)

Index je pořadí v poli `DATA_CIN1.st` (od 0). „Také v“ = stejná věta je i jinde.

| Lekce | Index | Věta | Také v |
|---|---|---|---|
| 2 | 18 | 那个男孩子是谁？ | examples #40 |
| 3 | 31 | 我请你吃晚饭，怎么样？ | |
| 3 | 36 | 你喜欢吃中国菜还是美国菜？ | cvičení 3-4 #0, 3-6 #6 |
| 4 | 51 | 算了，我去睡觉。 | |
| 5 | 62 | 请进，快进来！ | |
| 5 | 63 | 我来介绍一下。 | examples #142 |
| 5 | 64 | 认识你很高兴。 | |
| 5 | 65 | 你想喝点儿什么？ | |
| 5 | 69 | 对不起，我来晚了。 | examples #158 |
| 5 | 71 | 给我一瓶水吧。 | |
| 6 | 78 | 喂，请问，常老师在吗？ | |
| 6 | 79 | 我下午有一个会。 | |
| 6 | 81 | 我想问你几个问题。 | |
| 6 | 82 | 下个星期考试，你可以帮我准备吗？ | |
| 6 | 84 | 我到你的办公室去找你。 | |
| 6 | 85 | 喂，请问您是哪位？ | |
| 7 | 98 | 你考试考得怎么样？ | |
| 7 | 99 | 我写汉字写得太慢了。 | |
| 7 | 101 | 你平常怎么学习生词？ | |
| 7 | 104 | 我们一起预习第七课吧。 | |
| 8 | 115 | 我今天早上七点半就起床了。 | |
| 8 | 119 | 最近学习忙吗？ | |
| 8 | 121 | 祝你学习好！ | |
| 9 | 137 | 你要买什么颜色的衬衫？ | |
| 9 | 142 | 虽然不便宜，可是很合适。 | |
| 9 | 143 | 能不能换一件中号的？ | |
| 9 | 145 | 这条裤子长短、大小都合适。 | |
| 9 | 154 | 如果大小不合适的话，可以再来换。 | |
| 10 | 163 | 我先坐公共汽车，然后坐地铁。 | |
| 10 | 165 | 我送你去机场吧。 | |
| 10 | 166 | 太麻烦你了，不好意思。 | |
| 10 | 176 | 坐蓝线，然后换绿线。 | |

**Celkem 32 ze 184 (17 %).** Zbylých 152 vět ze `st` jsou obecné krátké věty nebo ustálené fráze
(你好！, 再见！, 祝你新年快乐！), které učebnici připomínají jen tématem.

Poznámky:

- Řada kandidátů jsou krátké ustálené fráze (我来介绍一下, 认识你很高兴, 别客气). Ty samy o sobě nejspíš
  ochranu nemají; vadit může spíš to, že jich je v jedné lekci několik za sebou a skládají scénu z učebnice.
- Žádný soubor neobsahuje celý dialog ani souvislý text lekce (deník v L8, dopis v L8 atd.).

## Výklady gramatiky (`js/grammar-data.js`)

- **Výklady (`ex`) a tipy (`tip`)**: 72 jevů, 7–28 slov na jev, vlastní stručné formulace. Při namátkovém
  porovnání se stylem učebnice (ta má delší výklady s číslovanými poznámkami) nevypadají jako opis. Riziko nízké.
- **Názvy jevů a čísla stran (`t`, `p`)** kopírují obsah učebnice (např. „The structure 我请你吃饭“,
  „Nouns and pronouns in longer speech“). Krátké názvy a odkazy na strany jsou fakta o tom, co se kde probírá;
  riziko nízké, ale je to nejviditelnější vazba na učebnici. Na přání lze názvy přeformulovat.
- **Příklady (`eg`)**: 128 vět, hlavně krátké věty postavené na vzorci. 11 z nich se shoduje se `st`. Pokud
  se mezi nimi objeví ověřená shoda s učebnicí, je potřeba je měnit spolu se `st`.

## Gramatika čínštiny I (`grammar1.json`)

Nejde o učebnici, ale o slajdy seminářů. Podle `grammar1/build.py` jsou shrnutí napsaná vlastními slovy,
cvičení používají jen slovní zásobu učebnice a 26 slov v příkladech je převzatých ze slajdů (označených
„mimo učebnici“). Doporučení: zeptat se vyučujícího, jestli mu veřejná verze shrnutí jeho seminářů nevadí.

## Doporučený postup náhrady

1. **Ověřit kandidáty s knihou.** Projít 32 vět výše proti dialogům a textům lekcí 2–10 a označit
   skutečné shody (doslovné nebo s drobnou změnou). Stejně namátkou projít 20–30 vět ze zbytku `st`.
2. **Přepsat shody vlastními větami se stejnou slovní zásobou.** Zachovat gramatický jev a slova lekce,
   změnit situaci, osoby a pořadí. Např. místo repliky z telefonátu s učitelem větu o jiné osobě a jiném
   čase. Pravidlo zůstává: **jen slova do dané lekce** (jména a čísla jsou v pořádku).
3. **Dostat `st` do builderu.** Teď je `st` jen ve vygenerovaném `js/data-cin1.js` bez zdrojového souboru.
   Nejjednodušší je přidat `sentences/l1.txt … l10.txt` ve formátu `examples/l*.txt`
   (`slova oddělená mezerou | English`) a builder z `examples/build.py`, který pinyin vygeneruje a slova
   zkontroluje proti zásobě do lekce. Pak je každá věta zkontrolovaná stejně jako příklady.
4. **Opravit duplikáty.** Věty změněné v `st` vyhledat i v `examples/l*.txt`, `grammar-practice/l*.txt`
   a v příkladech `js/grammar-data.js` (41 vět ze `st` je i jinde) a přegenerovat JSON.
5. **Nechat obecné fráze.** 你好, 谢谢, 再见, 不客气 a podobné patří do každé učebnice a není důvod je měnit.
6. **Upravit popis v `PRODUCT.md`.** Místo „Exactly the textbook… vocabulary, grammar and sentences of IC 1/1“
   psát „podle lekcí učebnice: stejná slovní zásoba a gramatika, vlastní věty“, aby to odpovídalo stavu.
7. **Testy.** Stávající testy kontrolují počty a strukturu dat; po náhradě spustit `npm test` a nový builder.

Odhad práce: kroky 1–2 asi 2–3 hodiny s knihou, krok 3 je menší úprava builderu.

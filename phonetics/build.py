# Builds ../phonetics.json for the pinyin dictation trainer (Fonetika / Čínský diktát) from syllables.txt.
#
# syllables.txt is the course's syllable table (汉语普通话语音音节表): every syllable and tone the test may use.
# For each syllable+tone we pick one character that a speech engine reads as exactly that syllable:
#   1. GB2312 level-1 characters (first byte 0xB0–0xD7) with a single reading,
#   2. then level-1 characters whose FIRST (main) reading matches,
#   3. then level-2 characters (0xD8–0xF7), single reading first, then first reading.
# Within a tier, characters that appear in more pypinyin phrases (a proxy for how common they are) win.
# A speech engine reads a lone character by its main reading, so a syllable that only exists as a secondary
# reading (děi 得, shéi 谁, zhèi 这) has no speakable character and is left out.
#
# Words: 2-character entries of pypinyin's phrase dictionary where both characters are GB2312 level 1,
# neither syllable is in the neutral tone, and both syllable+tone pairs are in the table. Shuffled with a
# fixed seed, the first 2500 are kept.
#
# Run: pip install pypinyin==0.55.0 && python3 phonetics/build.py phonetics.json
import json, os, random, sys, unicodedata
from pypinyin.constants import PINYIN_DICT, PHRASES_DICT

HERE = os.path.dirname(os.path.abspath(__file__))
WORDS = 2500
SEED = 20261102

def to_num(p):
    """'zhōng' -> ('zhong', 1); 'lǜ' -> ('lü', 4); no tone mark -> tone 0."""
    tone = 0
    out = ''
    for ch in unicodedata.normalize('NFD', p.strip().lower()):
        o = ord(ch)
        if o in (0x304, 0x301, 0x30C, 0x300):
            tone = {0x304: 1, 0x301: 2, 0x30C: 3, 0x300: 4}[o]
        elif o == 0x308:
            out = out[:-1] + 'ü'
        else:
            out += ch
    return unicodedata.normalize('NFC', out).replace('v', 'ü'), tone

# the table
table = set()
for line in open(os.path.join(HERE, 'syllables.txt'), encoding='utf8'):
    line = line.split('#')[0].split()
    if len(line) % 2: sys.exit('odd field count: %r' % line)
    for syl, tones in zip(line[::2], line[1::2]):
        for t in tones: table.add((syl, int(t)))

def level(c):
    try: b = c.encode('gb2312')
    except UnicodeEncodeError: return 0
    if len(b) != 2: return 0
    return 1 if 0xB0 <= b[0] <= 0xD7 else 2 if 0xD8 <= b[0] <= 0xF7 else 0

# how often each character shows up in the phrase dictionary
freq = {}
for ph in PHRASES_DICT:
    for c in ph: freq[c] = freq.get(c, 0) + 1

cands = {}  # (syl, tone) -> [(rank, -freq, char)]
for cp, readings in PINYIN_DICT.items():
    c = chr(cp)
    lv = level(c)
    if not lv: continue
    rs = [to_num(r) for r in readings.split(',')]
    main = rs[0]
    if main not in table: continue
    single = len(set(rs)) == 1
    rank = (lv - 1) * 2 + (0 if single else 1)  # 0 L1 single, 1 L1 first, 2 L2 single, 3 L2 first
    cands.setdefault(main, []).append((rank, -freq.get(c, 0), c))

syl = {}
for key in sorted(table):
    if key in cands:
        syl['%s%d' % key] = min(cands[key])[2]
missing = sorted('%s%d' % k for k in table if k not in cands)

words = []
for ph, pys in PHRASES_DICT.items():
    if len(ph) != 2 or len(pys) != 2: continue
    if any(level(c) != 1 for c in ph): continue
    ps = [to_num(p[0]) for p in pys]
    if any(t == 0 for _, t in ps): continue
    if any(p not in table for p in ps): continue
    words.append([ph, ' '.join('%s%d' % p for p in ps)])
words.sort()
random.Random(SEED).shuffle(words)
words = words[:WORDS]

out = {'syl': syl, 'words': words}
dest = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'phonetics.json')
with open(dest, 'w', encoding='utf8') as f:
    json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
print('table %d · speakable %d · without a speakable character %d: %s' % (len(table), len(syl), len(missing), ' '.join(missing)))
print('words %d' % len(words))

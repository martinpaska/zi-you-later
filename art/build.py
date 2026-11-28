#!/usr/bin/env python3
"""Builds the paintings behind Your path: art/src/inkN.webp -> art/inkN.webp, and the INKS list in js/units.js.

    python3 art/build.py            (needs Pillow and numpy: pip install pillow numpy)

The sources are the earlier exports of the Met scans (already ink on paper). For each one:
1. Flat-field: the paper is estimated with a wide max filter and divided out, so uneven paper tones (a grey ground,
   vignettes on one side) become one flat paper and only the ink is left (0 = paper, 1 = black ink).
2. Trim: blank margins are cut away. Columns are scanned for ink; a narrow run of inked columns at the left or right
   edge that is cut off from the painting by a blank gap (a separate strip of calligraphy, a mount) is dropped.
   Inscriptions inside the painting stay. Rows are only trimmed of blank paper at the top and bottom.
3. Colour: the ink is laid on the app's --paper (#f7f1e8 on .journey) in the app's warm black, so the edges of every
   painting are exactly the colour of the sheet. The top and bottom fade into the paper; the left and right edges are
   faded by CSS (.umap::before, mask-image), the same on both sides.
4. Saved as WebP, at most 900 px wide.
The shapes (width / height) are written into INKS in js/units.js, which picks a painting for each lesson.
"""
import pathlib, re
import numpy as np
from PIL import Image, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'art' / 'src', ROOT / 'art'
PAPER = np.array([247, 241, 232], float)   # --paper of .journey (css/app.css)
INK = np.array([38, 33, 31], float)        # warm black ink
N = 22
MAX_W, QUALITY = 900, 70
INK_MIN = 0.06       # ink below this is paper grain
COL_INK = 0.012      # a column (or row) with less ink than this on average is blank
GAP = 0.012          # a blank gap of at least this share of the width cuts a strip off
STRIP = 0.16         # an edge run narrower than this share of the width is a strip, dropped
EDGE = 0.06          # the faded rim of the sources, share of the shorter side
FADE = 0.05          # top and bottom fade, share of the height

def paper_of(L):
    """The paper under the ink: a wide maximum (the brightest paper nearby), smoothed. It is measured inside the
    old faded edge (EDGE) and carried out to the border, so a lighter rim does not count as the paper."""
    h, w = L.shape
    e = int(EDGE * min(w, h))
    inner = Image.fromarray(L[e:h - e, e:w - e].astype(np.uint8))
    sw = 160
    small = inner.resize((sw, max(8, round(inner.height * sw / inner.width))), Image.BILINEAR)
    bg = small.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.GaussianBlur(10))
    bg = np.asarray(bg.resize(inner.size, Image.BILINEAR), float)
    return np.maximum(np.pad(bg, e, mode='edge'), 60)

def runs(mask, gap):
    """Runs of True, joining runs separated by fewer than `gap` False."""
    idx = np.flatnonzero(mask)
    if not len(idx):
        return []
    out, a, b = [], idx[0], idx[0]
    for i in idx[1:]:
        if i - b > gap:
            out.append([a, b]); a = i
        b = i
    out.append([a, b])
    return out

def smooth(v, k):
    k = max(1, int(k)) | 1
    return np.convolve(v, np.ones(k) / k, mode='same')

def build(n):
    im = Image.open(SRC / f'ink{n}.webp').convert('RGB')
    L = np.asarray(im.convert('L'), float)
    t = np.clip(1 - L / paper_of(L), 0, 1)
    t = np.clip((t - INK_MIN) / (1 - INK_MIN), 0, 1)
    h, w = t.shape
    # columns: keep the painting, drop strips cut off at the edges
    cols = smooth(t.mean(0), w * .004) > COL_INK
    rs = runs(cols, GAP * w)
    while len(rs) > 1 and rs[0][1] - rs[0][0] < STRIP * w:
        rs.pop(0)
    while len(rs) > 1 and rs[-1][1] - rs[-1][0] < STRIP * w:
        rs.pop()
    x0, x1 = rs[0][0], rs[-1][1] + 1
    rows = smooth(t[:, x0:x1].mean(1), h * .005) > COL_INK
    ys = np.flatnonzero(rows)
    y0, y1 = ys[0], ys[-1] + 1
    t = t[y0:y1, x0:x1]
    h, w = t.shape
    f = max(1, int(FADE * h))
    ramp = np.ones(h)
    ramp[:f] = np.linspace(0, 1, f) ** 1.5
    ramp[-f:] = np.linspace(1, 0, f) ** 1.5
    t = t * ramp[:, None]
    rgb = PAPER + (INK - PAPER) * t[..., None]
    out = Image.fromarray(np.clip(rgb + .5, 0, 255).astype(np.uint8))
    if w > MAX_W:
        out = out.resize((MAX_W, round(h * MAX_W / w)), Image.LANCZOS)
    out.save(OUT / f'ink{n}.webp', 'WEBP', quality=QUALITY, method=6)
    print(f'ink{n}: {im.width}x{im.height} -> crop x {x0}-{x1}, y {y0}-{y1} -> {out.width}x{out.height}')
    return out.width / out.height

if __name__ == '__main__':
    shapes = [build(n) for n in range(1, N + 1)]
    js = ROOT / 'js' / 'units.js'
    src = js.read_text(encoding='utf8')
    line = 'const INKS=[' + ','.join(f'{s:.3f}'.rstrip('0') for s in shapes) + '];'
    js.write_text(re.sub(r'const INKS=\[[^\]]*\];', line, src, count=1), encoding='utf8')
    print(line)

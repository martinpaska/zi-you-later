# Builds fonts/ziyoukai.woff2: every Chinese character the app uses, drawn from the same stroke data as the
# stroke-order animations (strokes.json, plus hanzi-writer-data for characters not in it), strokes merged into one outline.
# Needs: pip install fonttools skia-pathops brotli ; npm pack hanzi-writer-data and unpack it.
# Run:   python3 fonts/build_font.py <unpacked hanzi-writer-data/package dir> [file with extra characters, e.g. traditional forms]
# Glyph data: Make Me a Hanzi / hanzi-writer-data, derived from Arphic PL fonts (Arphic Public License, see ARPHICPL.TXT).
import json,os,sys
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.svgLib.path import parse_path
import pathops
repo=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d=json.load(open(repo+'/strokes.json'))
s=open(repo+'/index.html').read()+open(repo+'/grammar-practice.json').read()+(open(sys.argv[2]).read() if len(sys.argv)>2 else '')
chars=sorted(set(c for c in s if '㐀'<=c<='鿿'))
def strokes(c):
    if c in d:return d[c]['strokes']
    f=os.path.join(sys.argv[1],'%s.json')%c
    if os.path.exists(f):return json.load(open(f))['strokes']
glyphs={'.notdef':None};cmap={};order=['.notdef'];miss=[]
for c in chars:
    st=strokes(c)
    if not st:miss.append(c);continue
    paths=[]
    for sd in st:
        p=pathops.Path();parse_path(sd,p.getPen());paths.append(p)
    u=pathops.Path()
    pathops.union(paths,u.getPen())
    pen=TTGlyphPen(None);u.draw(Cu2QuPen(pen,max_err=1.0,reverse_direction=True))
    n='uni%04X'%ord(c);glyphs[n]=pen.glyph();cmap[ord(c)]=n;order.append(n)
glyphs['.notdef']=TTGlyphPen(None).glyph()
fb=FontBuilder(1024,isTTF=True)
fb.setupGlyphOrder(order);fb.setupCharacterMap(cmap);fb.setupGlyf(glyphs)
fb.setupHorizontalMetrics({n:(1024,0) for n in order})
fb.setupHorizontalHeader(ascent=900,descent=-124)
fb.setupNameTable({'familyName':'ZiYou Kai','styleName':'Regular','copyright':'Glyphs from Make Me a Hanzi / hanzi-writer-data, derived from Arphic PL fonts, Arphic Public License'})
fb.setupOS2(sTypoAscender=900,sTypoDescender=-124,usWinAscent=900,usWinDescent=124)
fb.setupPost()
fb.font.flavor='woff2'
out=repo+'/fonts/ziyoukai.woff2';fb.save(out)
print(len(order)-1,'glyphs; missing',''.join(miss),os.path.getsize(out),'bytes')

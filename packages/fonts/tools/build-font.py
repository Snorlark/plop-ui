"""Builds the Sketchpop family: 4 weights x (italic, upright).  pip install fonttools shapely brotli"""
import math, random, os
HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, "skeletons.py")).read())   # capitals, digits, punctuation -> G

from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
from shapely.validation import make_valid
from shapely.geometry.polygon import orient
from shapely import affinity
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString

# ---------- lowercase skeletons (x-height .62, descender -.32) ----------
bowl = lambda cx=.26: arc(cx, .31, .26, .31, 0, 360, 56)
G['a'] = [arc(.26,.31,.26,.31,60,420,56), [(.52,.62),(.52,0)]]
G['b'] = [[(0,1),(0,0)], bowl(.26)]
G['c'] = [arc(.27,.31,.27,.31,45,315)]
G['d'] = [bowl(.26), [(.52,1),(.52,0)]]
G['e'] = [[(.02,.31),(.53,.31)] + arc(.27,.31,.27,.31,5,318)]
G['f'] = [quad((.44,.94),(.14,1.08),(.15,.72)) + [(.15,0)], [(0,.6),(.38,.6)]]
G['g'] = [bowl(.26), [(.52,.62),(.52,-.1)] + arc(.27,-.1,.25,.22,0,-165)]
G['h'] = [[(0,1),(0,0)], [(0,.4)] + arc(.25,.38,.25,.24,180,0) + [(.5,0)]]
G['i'] = [[(0,.62),(0,0)], dot(0,.86)]
G['j'] = [[(.14,.62),(.14,-.14)] + arc(-.04,-.14,.18,.18,0,-155), dot(.14,.86)]
G['k'] = [[(0,1),(0,0)], [(.42,.62),(0,.24)], [(.13,.36),(.46,0)]]
G['l'] = [[(0,1),(0,.12)] + quad((0,.12),(0,-.01),(.14,.01))]
G['m'] = [[(0,.62),(0,0)], [(0,.4)] + arc(.2,.4,.2,.22,180,0) + [(.4,0)],
          [(.4,.4)] + arc(.6,.4,.2,.22,180,0) + [(.8,0)]]
G['n'] = [[(0,.62),(0,0)], [(0,.4)] + arc(.25,.38,.25,.24,180,0) + [(.5,0)]]
G['o'] = [arc(.28,.31,.28,.31,0,360,56)]
G['p'] = [[(0,.62),(0,-.32)], bowl(.27)]
G['q'] = [bowl(.26), [(.52,.62),(.52,-.32)]]
G['r'] = [[(0,.62),(0,0)], [(0,.34)] + quad((0,.34),(.06,.62),(.38,.58))]
G['s'] = [arc(.22,.465,.2,.155,25,270) + arc(.22,.155,.23,.155,90,-155)]
G['t'] = [[(.14,.9),(.14,.12)] + quad((.14,.12),(.15,-.01),(.36,.03)), [(0,.6),(.34,.6)]]
G['u'] = [[(0,.62),(0,.24)] + arc(.25,.24,.25,.24,180,360), [(.5,.62),(.5,0)]]
G['v'] = [[(0,.62),(.27,0),(.54,.62)]]
G['w'] = [[(0,.62),(.18,0),(.37,.46),(.56,0),(.74,.62)]]
G['x'] = [[(0,.62),(.5,0)], [(.5,.62),(0,0)]]
G['y'] = [[(0,.62),(.27,.02)], [(.54,.62),(.14,-.32)]]
G['z'] = [[(0,.62),(.46,.62),(0,0),(.48,0)]]

WEIGHTS = {'Light': (300, 30), 'Regular': (400, 42), 'Bold': (700, 58), 'Black': (900, 74)}
CAP, SLANT = 700, 14

def noise1(rng, amp, period):
    terms = [(rng.uniform(.7, 1.5) * 2 * math.pi / period, rng.uniform(0, 6.3), rng.uniform(.5, 1)) for _ in range(3)]
    tot = sum(t[2] for t in terms)
    return lambda s: amp * sum(w * math.sin(s * f + p) for f, p, w in terms) / tot

def noise2(rng, amp, period):
    a, b, c, d = (noise1(rng, 1, period) for _ in range(4))
    return lambda x, y: (amp * (a(x) + b(y)) / 2, amp * (c(y) + d(x)) / 2)

def densify(pts, step=10):
    out = [pts[0]]
    for p, q in zip(pts, pts[1:]):
        n = max(1, int(math.dist(p, q) / step))
        out += [(p[0] + (q[0] - p[0]) * i / n, p[1] + (q[1] - p[1]) * i / n) for i in range(1, n + 1)]
    return out

def brush(pts, R, rng):
    """Marker stroke: pressure swells a little, starts heavy, lifts off slightly lighter."""
    width = noise1(rng, 0.24, rng.uniform(140, 300))
    total = sum(math.dist(a, b) for a, b in zip(pts, pts[1:])) or 1
    s, radii = 0, []
    for i, p in enumerate(pts):
        if i: s += math.dist(pts[i - 1], p)
        radii.append(R * (1 + width(s)) * (1.1 - .22 * s / total))
    hulls = [Point(pts[i]).buffer(radii[i], quad_segs=8).union(
             Point(pts[i + 1]).buffer(radii[i + 1], quad_segs=8)).convex_hull for i in range(len(pts) - 1)]
    return unary_union(hulls)

def build_glyph(ch, seed, R, slant):
    rng = random.Random(seed)                     # same seed per glyph -> same shape in every weight
    H = CAP - 2 * 42                              # skeleton fixed across weights; ink grows outward
    grow = (R - 42) * 1.3                         # heavier weights a bit wider so counters stay open
    S = H * .86 * rng.uniform(.95, 1.06)
    sy = rng.uniform(.95, 1.05)
    wob = noise2(rng, 13, 280)
    rough = noise2(rng, 3, 50)
    rot = rng.uniform(-4, 4)
    lift = rng.uniform(-15, 15)
    place = lambda x, y: (x * S + x * grow, 42 + y * H * sy)
    shapes = []
    for stroke in G[ch]:
        if len(stroke) == 1:
            X, Y = place(*stroke[0])
            blob = Point(X, Y).buffer(R * 1.18, quad_segs=8)
            shapes.append(affinity.scale(blob, rng.uniform(.9, 1.1), rng.uniform(.9, 1.1))); continue
        pts = [place(x, y) for x, y in stroke]
        ox, oy = rng.uniform(-6, 6), rng.uniform(-6, 6)
        pts = [(x + ox, y + oy) for x, y in pts]
        if len(stroke) <= 5:                      # straight strokes: tiny over/undershoot
            for end in (0, -1):
                a = pts[end]; b = pts[1] if end == 0 else pts[-2]
                d = math.dist(a, b) or 1; e = rng.uniform(-6, 22)
                pts[end] = (a[0] + (a[0] - b[0]) / d * e, a[1] + (a[1] - b[1]) / d * e)
        pts = densify(pts)
        pts = [(x + wob(x, y)[0], y + wob(x, y)[1]) for x, y in pts]
        shapes.append(brush(pts, R, rng))
    shape = unary_union(shapes)
    shape = affinity.rotate(shape, rot, origin=(S / 3, 350))
    shape = affinity.translate(shape, 0, lift)
    out = []
    for p in (shape.geoms if shape.geom_type == 'MultiPolygon' else [shape]):
        p = p.simplify(1.2)
        jig = lambda cs: [(x + rough(x, y)[0], y + rough(x, y)[1]) for x, y in cs]
        out.append(make_valid(Polygon(jig(p.exterior.coords), [jig(i.coords) for i in p.interiors])).buffer(0))
    shape = unary_union(out).simplify(.8)
    sb = 14 + R * .32 + rng.uniform(-5, 5)
    shape = affinity.translate(shape, sb - shape.bounds[0], 0)
    adv = shape.bounds[2] + sb
    if slant:
        shape = affinity.skew(shape, xs=slant, origin=(0, 300))
    return shape, int(round(adv))

def draw(shape):
    pen = TTGlyphPen(None)
    for p in (shape.geoms if hasattr(shape, 'geoms') else [shape]):
        if p.geom_type != 'Polygon': continue
        p = orient(p, sign=-1.0)
        for ring in [p.exterior] + list(p.interiors):
            c = [(int(round(x)), int(round(y))) for x, y in ring.coords[:-1]]
            c = [c[0]] + [b for a, b in zip(c, c[1:]) if a != b]
            if len(c) < 3: continue
            pen.moveTo(c[0]); [pen.lineTo(q) for q in c[1:]]; pen.closePath()
    return pen.glyph()

PUNCT = {'.':'period',',':'comma','!':'exclam','?':'question',"'":'quotesingle','"':'quotedbl','-':'hyphen',':':'colon',
         ';':'semicolon','(':'parenleft',')':'parenright','/':'slash','+':'plus','=':'equal','&':'ampersand',
         '*':'asterisk','#':'numbersign','0':'zero','1':'one','2':'two','3':'three','4':'four','5':'five',
         '6':'six','7':'seven','8':'eight','9':'nine'}
gname = lambda c: c if c.isalpha() else PUNCT[c]

def build(weight, italic):
    wclass, R = WEIGHTS[weight]
    style = ((weight + ' ') if not (weight == 'Regular' and italic) else '') + ('Italic' if italic else '')
    style = style.strip()
    glyphs, metrics, cmap = {}, {}, {32: 'space', 160: 'space'}
    order = ['.notdef', 'space']
    pen = TTGlyphPen(None)
    pen.moveTo((60,0)); pen.lineTo((60,700)); pen.lineTo((440,700)); pen.lineTo((440,0)); pen.closePath()
    glyphs['.notdef'] = pen.glyph(); metrics['.notdef'] = (500, 60)
    glyphs['space'] = TTGlyphPen(None).glyph(); metrics['space'] = (int(170 + R * .8), 0)
    base, a1, a2 = [], [], []
    for i, c in enumerate(G):
        n = gname(c)
        for v, suf in enumerate(['', '.alt1', '.alt2']):
            shape, adv = build_glyph(c, 5000 + i * 7 + v * 131, R, SLANT if italic else 0)
            glyphs[n + suf] = draw(shape); order.append(n + suf)
            metrics[n + suf] = (adv, int(round(shape.bounds[0])))
        base.append(n); a1.append(n + '.alt1'); a2.append(n + '.alt2')
        cmap[ord(c)] = n
    fb = FontBuilder(1000, isTTF=True)
    fb.setupGlyphOrder(order); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=900, descent=-260)
    ps = 'Sketchpop-' + style.replace(' ', '')
    fb.setupNameTable({'familyName': 'Sketchpop', 'styleName': style, 'uniqueFontIdentifier': ps + '-3.0',
                       'fullName': 'Sketchpop ' + style, 'psName': ps, 'version': 'Version 3.000',
                       'copyright': 'Copyright (c) 2026, Lark Sigmuond Babao (https://github.com/Snorlark/plop-ui).',
                       'designer': 'Lark Sigmuond Babao',
                       'licenseDescription': 'This Font Software is licensed under the SIL Open Font License, Version 1.1.',
                       'licenseInfoURL': 'https://openfontlicense.org'})
    sel = (0x01 if italic else 0) | (0x20 if weight == 'Bold' else 0) or 0x40
    fb.setupOS2(usWeightClass=wclass, sTypoAscender=900, sTypoDescender=-260, sTypoLineGap=100,
                usWinAscent=1000, usWinDescent=320, sxHeight=424, sCapHeight=700,
                achVendID='SKPP', fsSelection=sel)
    fb.setupPost(italicAngle=-SLANT if italic else 0)
    fb.setupHead(unitsPerEm=1000, macStyle=(1 if weight == 'Bold' else 0) | (2 if italic else 0))
    addOpenTypeFeaturesFromString(fb.font, f"""
@D = [{' '.join(base)}];  @A1 = [{' '.join(a1)}];  @A2 = [{' '.join(a2)}];
lookup cycle {{ sub @D @D' by @A1; sub @A1 @D' by @A2; }} cycle;
feature calt {{ lookup cycle; }} calt;
""")
    out = os.path.join(HERE, '..', 'fonts')
    os.makedirs(out, exist_ok=True)
    f = os.path.join(out, 'sketchpop-' + weight.lower() + ('-italic' if italic else ''))
    fb.save(f + '.ttf'); fb.font.flavor = 'woff2'; fb.save(f + '.woff2')
    print('built', os.path.basename(f))

if __name__ == '__main__':
    for w in WEIGHTS:
        for it in (True, False):
            build(w, it)

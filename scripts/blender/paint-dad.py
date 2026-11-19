# Repaints Dad 5 on a clean atlas (docs/3d-characters.md, "Dad 5"), headless:
#
#   Blender -b --python scripts/blender/paint-dad.py -- <tripo-rigged.glb> <out.glb> [size=2048] [atlas.png]
#
# The input is Dad 5 as Tripo textured him and Blender rigged him (the GLB before this script first ran:
# `git show 642533832:src/world/places/thailand/characters/models/candidates/dad-5.glb`). Tripo's texture is a 1k
# painting cut into hundreds of tiny islands with green skin: close up it smears, and the islands bleed into each other.
# What this does:
#   1. Unwraps him again (a few big islands, wide gutters) and works out, for every texel of the new atlas, where it is
#      on him (rest pose, Blender axes: z up, face toward -y), which loose piece it is on and what Tripo painted there.
#   2. Sorts every texel into a part (skin, hair, shirt, shorts, hooves, horn, inner ear, nose, brows, lashes, eyes) by
#      piece, place and Tripo's colour, smooths the borders, and paints each part flat from PAL (hair, horn and cloth
#      keep a little of Tripo's brushwork).
#   3. Paints his face from measurements instead of Tripo's smears: a soft light muzzle, the blush, the nose, the eyes
#      (iris, pupil, shines) and two days of stubble. Hooves end at a clean ring; hair and skin are sorted lock by lock.
#   4. Smooths the normals of his skin and clothes (the toon light showed Tripo's lumps as ragged patches).
#   5. Writes the GLB again with only the mesh's vertices, the texture and an `_INK` number per vertex changed (0 on
#      the eyes, lashes, brows and nose: their ink was a broken line). The skeleton, the skin weights and the wave are
#      copied through byte for byte.
import bpy, sys, json, struct, os, tempfile
import numpy as np

argv = sys.argv[sys.argv.index('--') + 1:]
SRC, OUT = argv[0], argv[1]
R = int(argv[2]) if len(argv) > 2 else 2048


def hexc(h):
    return np.array([int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)], dtype=np.float32)


# His colours (sRGB). `skin` is also DAD_SKIN in dad-model.ts (the blink lids).
PAL = {
    'skin': '#F4CCB2', 'muzzle': '#FBE9DC', 'blush': '#F08C8C', 'hair': '#8A4F30', 'shirt': '#EC5C92',
    'khaki': '#CDA878', 'hoof': '#A552C8', 'horn': '#F2A21E', 'ear': '#F293A5', 'nose': '#F08398',
    'brow': '#74401F', 'lash': '#3B2318', 'stubble': '#5E4234',
    'white': '#FCFCFD', 'iris': '#3F6A96', 'irisDark': '#22405F', 'irisLight': '#6F9CC2', 'pupil': '#161722',
}
PAL = {k: hexc(v) for k, v in PAL.items()}
# How much of Tripo's light and dark each part keeps (0 = flat).
KEEP = {'hair': 0.75, 'horn': 0.45, 'shirt': 0.12, 'khaki': 0.3, 'hoof': 0.15, 'brow': 0.3}
CLASSES = ['skin', 'hair', 'shirt', 'khaki', 'hoof', 'horn', 'ear', 'nose', 'brow', 'lash', 'eye']
C = {k: i for i, k in enumerate(CLASSES)}

# ---------------------------------------------------------------- the GLB as it is
raw = open(SRC, 'rb').read()
jlen = struct.unpack('<I', raw[12:16])[0]
gltf = json.loads(raw[20:20 + jlen])
BIN = raw[20 + jlen + 8:]
CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def accessor(i):
    a = gltf['accessors'][i]
    bv = gltf['bufferViews'][a['bufferView']]
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    n = NC[a['type']]
    assert not bv.get('byteStride') or bv['byteStride'] == np.dtype(CT[a['componentType']]).itemsize * n
    return np.frombuffer(BIN, dtype=CT[a['componentType']], count=a['count'] * n, offset=off).reshape(a['count'], n).copy()


prim = gltf['meshes'][0]['primitives'][0]
att = prim['attributes']
POS, NRM, UV0 = accessor(att['POSITION']), accessor(att['NORMAL']), accessor(att['TEXCOORD_0'])
JNT, WGT = accessor(att['JOINTS_0']), accessor(att['WEIGHTS_0'])
TRI = accessor(prim['indices']).reshape(-1, 3).astype(np.int64)
NV, NT = len(POS), len(TRI)
# Blender axes for everything painted by place (glTF is y up, face toward +z).
P3 = np.stack([POS[:, 0], -POS[:, 2], POS[:, 1]], 1)
N3 = np.stack([NRM[:, 0], -NRM[:, 2], NRM[:, 1]], 1)

# Welded corners (Tripo splits a vertex at every seam of its atlas) and the loose pieces they make.
_, weld = np.unique(np.round(POS / 1e-5).astype(np.int64), axis=0, return_inverse=True)
weld = weld.reshape(-1)
NW = weld.max() + 1
parent = np.arange(NW)


def find(a):
    while parent[a] != a:
        parent[a] = parent[parent[a]]
        a = parent[a]
    return a


for t in weld[TRI]:
    a, b, c = find(t[0]), find(t[1]), find(t[2])
    parent[b] = a
    parent[c] = a
roots = np.array([find(i) for i in range(NW)])
vroot = roots[weld]
pieces = {}
for r in np.unique(vroot):
    m = vroot == r
    pieces[r] = dict(n=int(m.sum()), lo=P3[m].min(0), hi=P3[m].max(0), c=(P3[m].min(0) + P3[m].max(0)) / 2)


def name_piece(p):
    lo, hi, c = p['lo'], p['hi'], p['c']
    size = hi - lo
    if hi[2] > 0.95:
        return 'head'
    if size[0] > 0.3 and c[2] < 0.3:
        return 'shorts'
    if c[1] > 0.12 and c[2] < 0.35:
        return 'tail'
    if lo[2] < 0.01:
        return 'leg'
    if abs(c[0]) > 0.15 and c[2] < 0.55 and size[2] > 0.1:
        return 'arm'
    if c[1] < -0.12 and 0.6 < c[2] < 0.8:
        if size[2] > 0.08:
            return 'eye'
        return 'brow' if c[2] > 0.76 else 'lash'
    return 'hairbit'


for p in pieces.values():
    p['name'] = name_piece(p)
print('PIECES', sorted((p['name'], p['n']) for p in pieces.values()))
vpiece = np.array([pieces[r]['name'] for r in vroot])
EYE = max((p for p in pieces.values() if p['name'] == 'eye'), key=lambda p: p['c'][0])  # his +x eye

# ---------------------------------------------------------------- new UVs (Blender unwraps the welded shape)
bpy.ops.wm.read_factory_settings(use_empty=True)
me = bpy.data.meshes.new('dad')
uniq, first = np.unique(weld, return_index=True)
me.from_pydata(P3[first].tolist(), [], weld[TRI].tolist())
ob = bpy.data.objects.new('dad', me)
bpy.context.scene.collection.objects.link(ob)
bpy.context.view_layer.objects.active = ob
ob.select_set(True)
me.uv_layers.new(name='UVMap')
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
# Smart project only chooses where the seams go; each island is then unwrapped properly, so no side of it is squashed.
bpy.ops.uv.smart_project(angle_limit=np.radians(80), island_margin=0.0, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)
bpy.ops.uv.select_all(action='SELECT')
bpy.ops.uv.seams_from_islands(mark_seams=True, mark_sharp=False)
bpy.ops.uv.unwrap(method='ANGLE_BASED', margin=0.001)
bpy.ops.object.mode_set(mode='OBJECT')
assert len(me.polygons) == NT and all(len(p.vertices) == 3 for p in me.polygons)
luv = np.zeros(NT * 6, dtype=np.float32)
me.uv_layers.active.data.foreach_get('uv', luv)
luv = luv.reshape(NT, 3, 2)
lv = np.zeros(NT * 3, dtype=np.int64)
me.loops.foreach_get('vertex_index', lv)
assert (lv.reshape(NT, 3) == weld[TRI]).all(), 'Blender reordered the corners'

# Islands of the new unwrap (triangles that share an edge in UV space), each scaled by how close the camera gets to it
# (his face is what a cutscene goes close to), then packed again.
tw = weld[TRI]
quv = np.round(luv * 1e5).astype(np.int64)
ip = np.arange(NT)


def ifind(a):
    while ip[a] != a:
        ip[a] = ip[ip[a]]
        a = ip[a]
    return a


edges = {}
for t in range(NT):
    for j in range(3):
        a, b = j, (j + 1) % 3
        ka = (int(tw[t, a]), int(quv[t, a, 0]), int(quv[t, a, 1]))
        kb = (int(tw[t, b]), int(quv[t, b, 0]), int(quv[t, b, 1]))
        key = (ka, kb) if ka < kb else (kb, ka)
        if key in edges:
            ip[ifind(t)] = ifind(edges[key])
        else:
            edges[key] = t
island = np.array([ifind(t) for t in range(NT)])
tcen = P3[TRI].mean(1)
tpiece = vpiece[TRI[:, 0]]
print('ISLANDS', len(np.unique(island)))
for i in np.unique(island):
    fs = np.where(island == i)[0]
    c = tcen[fs].mean(0)
    names = set(tpiece[fs])
    boost = 1.0
    if names & {'eye', 'lash', 'brow'}:
        boost = 2.4
    elif 'head' in names and c[2] > 0.56 and c[1] < 0.0:
        boost = 2.1
    elif 'head' in names and c[2] > 0.56:
        boost = 1.15
    if boost != 1.0:
        mid = luv[fs].reshape(-1, 2).mean(0)
        luv[fs] = mid + (luv[fs] - mid) * boost
me.uv_layers.active.data.foreach_set('uv', luv.reshape(-1))
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.select_all(action='SELECT')
bpy.ops.uv.pack_islands(rotate=True, scale=True, margin_method='FRACTION', margin=0.004, shape_method='CONCAVE')
bpy.ops.object.mode_set(mode='OBJECT')
me.uv_layers.active.data.foreach_get('uv', luv.reshape(-1))
luv = luv.reshape(NT, 3, 2)
print('UV range', luv.min(), luv.max())

# ---------------------------------------------------------------- which triangle each texel is on
tri_of = np.full((R, R), -1, dtype=np.int32)
bary = np.zeros((R, R, 3), dtype=np.float32)
pxuv = luv * R  # x right, y up (row 0 = v 0; flipped when saved)
for t in range(NT):
    (x0, y0), (x1, y1), (x2, y2) = pxuv[t]
    area = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0)
    if abs(area) < 1e-9:
        continue
    xa, xb = int(np.floor(min(x0, x1, x2) - 1)), int(np.ceil(max(x0, x1, x2) + 1))
    ya, yb = int(np.floor(min(y0, y1, y2) - 1)), int(np.ceil(max(y0, y1, y2) + 1))
    xa, ya, xb, yb = max(xa, 0), max(ya, 0), min(xb, R - 1), min(yb, R - 1)
    if xb < xa or yb < ya:
        continue
    gx, gy = np.meshgrid(np.arange(xa, xb + 1) + 0.5, np.arange(ya, yb + 1) + 0.5)
    w0 = ((x1 - gx) * (y2 - gy) - (x2 - gx) * (y1 - gy)) / area
    w1 = ((x2 - gx) * (y0 - gy) - (x0 - gx) * (y2 - gy)) / area
    w2 = 1 - w0 - w1
    # A texel's middle just outside the edge still belongs to it (half a texel of overlap, so no cracks at seams).
    e = 0.75 / max(1.0, np.sqrt(abs(area)))
    inside = (w0 >= -e) & (w1 >= -e) & (w2 >= -e)
    strict = (w0 >= 0) & (w1 >= 0) & (w2 >= 0)
    sub_t = tri_of[ya:yb + 1, xa:xb + 1]
    sub_b = bary[ya:yb + 1, xa:xb + 1]
    take = strict | (inside & (sub_t < 0))
    sub_t[take] = t
    sub_b[take] = np.stack([w0, w1, w2], -1)[take]
valid = tri_of >= 0
print('COVER', round(float(valid.mean()), 3))
T = tri_of[valid]
B = bary[valid][:, :, None]


def at(per_vertex):
    """A per-vertex value at every valid texel."""
    v = per_vertex[TRI[T]]
    return (v * B).sum(1)


XYZ = at(P3)
NOR = at(N3)
NOR /= np.maximum(1e-6, np.linalg.norm(NOR, axis=1, keepdims=True))
OUV = at(UV0)
PIECE = tpiece[T]

# What Tripo painted there (its JPEG, bilinear).
im = gltf['images'][0]
bv = gltf['bufferViews'][im['bufferView']]
tmpdir = tempfile.mkdtemp()
srcjpg = os.path.join(tmpdir, 'src.jpg')
open(srcjpg, 'wb').write(BIN[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']])
img = bpy.data.images.load(srcjpg)
SW, SH = img.size
SPX = np.zeros(SW * SH * 4, dtype=np.float32)
img.pixels.foreach_get(SPX)
SPX = SPX.reshape(SH, SW, 4)[::-1, :, :3]  # row 0 = the top, like glTF's v
fx = np.clip(OUV[:, 0] * SW - 0.5, 0, SW - 1.001)
fy = np.clip(OUV[:, 1] * SH - 0.5, 0, SH - 1.001)
ix, iy = fx.astype(int), fy.astype(int)
tx, ty = (fx - ix)[:, None], (fy - iy)[:, None]
SRCC = (SPX[iy, ix] * (1 - tx) + SPX[iy, ix + 1] * tx) * (1 - ty) + (SPX[iy + 1, ix] * (1 - tx) + SPX[iy + 1, ix + 1] * tx) * ty


def hsv(c):
    mx, mn = c.max(1), c.min(1)
    d = mx - mn
    h = np.zeros(len(c))
    r, g, b = c[:, 0], c[:, 1], c[:, 2]
    nz = d > 1e-6
    m = nz & (mx == r)
    h[m] = ((g[m] - b[m]) / d[m]) % 6
    m = nz & (mx == g) & (mx != r)
    h[m] = (b[m] - r[m]) / d[m] + 2
    m = nz & (mx == b) & (mx != r) & (mx != g)
    h[m] = (r[m] - g[m]) / d[m] + 4
    return h / 6, np.where(mx > 0, d / np.maximum(mx, 1e-6), 0), mx


Hh, Ss, Vv = hsv(SRCC)
X, Y, Z = XYZ[:, 0], XYZ[:, 1], XYZ[:, 2]
AX = np.abs(X)

def box(a, r):
    """A box blur of radius r texels (edges repeat)."""
    for ax in (0, 1):
        p = np.pad(a, [(r + 1, r) if i == ax else (0, 0) for i in range(a.ndim)], mode='edge')
        cs = np.cumsum(p, axis=ax, dtype=np.float64)
        n = a.shape[ax]
        hi = np.take(cs, np.arange(2 * r + 1, 2 * r + 1 + n), axis=ax)
        lo = np.take(cs, np.arange(0, n), axis=ax)
        a = ((hi - lo) / (2 * r + 1)).astype(np.float32)
    return a


def grid(v, fill=0.0):
    g = np.full((R, R) + v.shape[1:], fill, dtype=np.float32)
    g[valid] = v
    return g


# ---------------------------------------------------------------- sort every texel into a part
cls = np.full(len(T), C['skin'], dtype=np.int32)
brown = ((Hh < 0.1) | (Hh > 0.97)) & (Ss > 0.38) & (Vv < 0.78)
pink = ((Hh > 0.88) | (Hh < 0.035)) & (Ss > 0.22) & (Vv > 0.6) & ~brown
strongpink = ((Hh > 0.88) | (Hh < 0.03)) & (Ss > 0.42)
orange = (Hh > 0.065) & (Hh < 0.15) & (Ss > 0.6) & (Vv > 0.6)
purple = (Hh > 0.68) & (Hh < 0.88) & (Ss > 0.25)
head = PIECE == 'head'
cls[head & brown] = C['hair']
cls[head & orange & (Z > 0.84) & (AX < 0.07)] = C['horn']
cls[head & pink & (Z > 0.76) & (AX > 0.09)] = C['ear']
cls[head & pink & (Z < 0.6)] = C['shirt']
cls[head & (Z < 0.5)] = C['shirt']
cls[head & strongpink & (AX < 0.035) & (Z > 0.645) & (Z < 0.7) & (Y < -0.15)] = C['nose']
# Tripo's shine on his nose isn't pink: close the hole it leaves.
ng = np.zeros((R, R), dtype=np.float32)
ng[valid] = cls == C['nose']
grown = box(ng, 9) > 1e-4
closed = box(grown.astype(np.float32), 9) > 0.999
cls[closed[valid] & head & (AX < 0.04) & (Y < -0.15)] = C['nose']
cls[PIECE == 'shorts'] = C['khaki']
cls[PIECE == 'tail'] = C['hoof']
cls[np.isin(PIECE, ['arm', 'leg']) & purple] = C['hoof']
cls[PIECE == 'hairbit'] = C['hair']
cls[PIECE == 'brow'] = C['brow']
cls[PIECE == 'lash'] = C['lash']
cls[PIECE == 'eye'] = C['eye']


# Hair or skin, by lock: Tripo's brush ran over the edges of his locks (brown smears on his cheek, skin slivers on a
# lock). His head is cut into smooth patches at its creases (a lock's edge is one); a patch that is nearly all hair or
# nearly all skin becomes all of it.
tnorm = np.cross(P3[TRI[:, 1]] - P3[TRI[:, 0]], P3[TRI[:, 2]] - P3[TRI[:, 0]])
tnorm /= np.maximum(1e-12, np.linalg.norm(tnorm, axis=1, keepdims=True))
pp = np.arange(NT)


def pfind(a):
    while pp[a] != a:
        pp[a] = pp[pp[a]]
        a = pp[a]
    return a


seen_edge = {}
CREASE = np.cos(np.radians(32))
for t in range(NT):
    for j in range(3):
        a_, b_ = int(tw[t, j]), int(tw[t, (j + 1) % 3])
        k_ = (a_, b_) if a_ < b_ else (b_, a_)
        o = seen_edge.get(k_)
        if o is None:
            seen_edge[k_] = t
        elif tnorm[t] @ tnorm[o] > CREASE:
            pp[pfind(t)] = pfind(o)
patch = np.array([pfind(t) for t in range(NT)])[T]
hs = head & (Z > 0.6) & np.isin(cls, [C['hair'], C['skin']])
n_hair = np.bincount(patch[hs & (cls == C['hair'])], minlength=NT)
n_all = np.bincount(patch[hs], minlength=NT)
frac = n_hair / np.maximum(n_all, 1)
big = np.argsort(-n_all)[:12]
print('PATCHES', [(int(n_all[i]), round(float(frac[i]), 2)) for i in big])
pf = frac[patch]
cls[hs & (pf > 0.8)] = C['hair']
cls[hs & (pf < 0.2)] = C['skin']
# On the patch that is his face, the sideburns' painted tips were blurred strokes on his cheeks: skin there (the locks
# over them are patches of their own, and stay).
cls[hs & (pf <= 0.8) & (Z < 0.712) & (Y < 0.04)] = C['skin']

# The borders, smoothed: each texel takes the part most of its neighbours have (only among texels of the same piece
# family, so a tight gutter never mixes two islands), then the parts blend over a texel or two.
vmask = valid.astype(np.float32)
fam = np.zeros(len(T), dtype=np.int32)
for i, n in enumerate(['head', 'shorts', 'tail', 'leg', 'arm', 'eye', 'brow', 'lash', 'hairbit']):
    fam[PIECE == n] = i
famg = grid(fam.astype(np.float32), -1).astype(np.int32)


def smooth_classes(cls, r):
    best = np.zeros((R, R), dtype=np.float32)
    out = grid(cls.astype(np.float32), -1).astype(np.int32)
    res = out.copy()
    for ci in range(len(CLASSES)):
        ind = ((out == ci) & valid).astype(np.float32)
        if not ind.any():
            continue
        b = box(ind, r)
        take = (b > best) & valid
        best[take] = b[take]
        res[take] = ci
    # Only parts that can share a piece may take a texel over (the eye never becomes skin).
    g = grid(cls.astype(np.float32), -1).astype(np.int32)
    locked = np.isin(g, [C['eye'], C['lash'], C['brow'], C['khaki']]) | np.isin(res, [C['eye'], C['lash'], C['brow'], C['khaki']])
    res[locked] = g[locked]
    return res[valid]


cls = smooth_classes(cls, 4)
cls = smooth_classes(cls, 2)
# Each hoof ends at a clean ring round its arm or leg (straight across the limb, where Tripo's purple stopped on
# average), not at a wobbly brush edge.
ROOT = vroot[TRI[T, 0]]
for r_ in np.unique(ROOT[np.isin(PIECE, ['arm', 'leg'])]):
    m = ROOT == r_
    pts = XYZ[m]
    mid = pts.mean(0)
    axis = np.linalg.svd(pts[::7] - mid, full_matrices=False)[2][0]
    t_ = (pts - mid) @ axis
    hoof_ = cls[m] == C['hoof']
    if t_[hoof_].mean() < t_[~hoof_].mean():
        t_ = -t_
    # The ring that sorts the fewest texels wrongly.
    cuts = np.linspace(np.percentile(t_, 2), np.percentile(t_, 98), 200)
    wrong = [(hoof_ & (t_ < c_)).sum() + (~hoof_ & (t_ >= c_)).sum() for c_ in cuts]
    cut = cuts[int(np.argmin(wrong))]
    cls[m] = np.where(t_ >= cut, C['hoof'], C['skin'])
# His nose is painted from its outline (how wide Tripo's pink is at each height, smoothed and mirrored), not texel by
# texel: its edge was ragged.
nm = cls == C['nose']
zb = np.arange(Z[nm].min(), Z[nm].max() + 0.0012, 0.0012)
wb = np.array([np.percentile(AX[nm & (Z >= z0) & (Z < z0 + 0.0012)], 94) if (nm & (Z >= z0) & (Z < z0 + 0.0012)).sum() > 8 else 0.0 for z0 in zb])
wb = np.convolve(np.pad(wb, 3, mode='edge'), np.ones(7) / 7, mode='valid')
NOSE_Z = np.concatenate([[zb[0] - 0.0018], zb + 0.0006, [zb[-1] + 0.003]])
NOSE_W = np.concatenate([[-0.002], wb, [-0.002]])
print('NOSE', zb[0].round(4), zb[-1].round(4), wb.max().round(4))
cls[nm] = C['skin']

# ---------------------------------------------------------------- paint
lum = SRCC @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
rgb = np.zeros((len(T), 3), dtype=np.float32)
for name, ci in C.items():
    m = cls == ci
    if not m.any() or name == 'eye':
        continue
    col = PAL[name]
    keep = KEEP.get(name, 0)
    if keep:
        mid = np.median(lum[m])
        shade = np.clip(1 + keep * (lum[m] / max(mid, 1e-3) - 1), 0.62, 1.3)
        rgb[m] = np.clip(col[None] * shade[:, None], 0, 1)
    else:
        rgb[m] = col


def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def mix(base, col, a):
    return base * (1 - a[:, None]) + col[None] * a[:, None]


def hash3(i, j, k, s):
    h = (i * 73856093) ^ (j * 19349663) ^ (k * 83492791) ^ (s * 2654435761)
    h = (h ^ (h >> 13)) * 1274126177
    h = h ^ (h >> 16)
    return (h & 0xFFFFFF) / float(0x1000000)


# His face (the skin of the head piece, by place).
face = head & (cls == C['skin'])
front = sstep(0.02, -0.06, Y)  # 1 on the front of his head, 0 round the back
# The muzzle: a soft cream oval round his nose and mouth.
mx, mz = X / 0.096, (Z - 0.641) / 0.047
muzzle = sstep(1.12, 0.82, np.sqrt(mx * mx + mz * mz)) * front * 0.75
# The cheeks' blush: soft, each side of the muzzle.
bx, bz = (AX - 0.15) / 0.046, (Z - 0.648) / 0.034
blush = np.exp(-(bx * bx + bz * bz) * 1.25) * front
# Two days of stubble: over the lip, the chin and the jaw, up to the sideburns; dots close up, a shadow from far.
# The line it stops at: under his nose, dipping under each cheek, rising to his sideburns.
top = 0.661 - 0.022 * sstep(0.045, 0.12, AX) + 0.07 * sstep(0.15, 0.21, AX)
beard = sstep(top + 0.008, top - 0.008, Z) * sstep(0.07, 0.01, Y) * sstep(0.5, 0.55, Z)
beard *= 1 - 0.6 * np.clip(blush * 1.2, 0, 1)
def stubble(cell, r0, r1, density, seed):
    """Dots scattered over his skin (one per cell of a 3D grid, jittered), mirrored so both cheeks match."""
    gi = np.floor(XYZ / cell).astype(np.int64)
    out = np.zeros(len(T), dtype=np.float32)
    for di in (-1, 0, 1):
        for dj in (-1, 0, 1):
            for dk in (-1, 0, 1):
                ci_, cj_, ck_ = gi[:, 0] + di, gi[:, 1] + dj, gi[:, 2] + dk
                mi = np.where(ci_ < 0, -ci_ - 1, ci_)
                jx = hash3(mi, cj_, ck_, seed + 1)
                jx = np.where(ci_ < 0, 1 - jx, jx)
                c0 = np.stack([ci_ + jx, cj_ + hash3(mi, cj_, ck_, seed + 2), ck_ + hash3(mi, cj_, ck_, seed + 3)], 1) * cell
                rad = r0 + (r1 - r0) * hash3(mi, cj_, ck_, seed + 4)
                on = hash3(mi, cj_, ck_, seed + 5) < density
                d = np.linalg.norm(XYZ - c0, axis=1)
                out = np.maximum(out, np.where(on, sstep(rad, rad * 0.55, d), 0))
    return out


dots = np.maximum(stubble(0.0044, 0.00095, 0.0015, 0.88, 0), stubble(0.003, 0.0006, 0.00085, 0.8, 10) * 0.7)

skin = np.tile(PAL['skin'], (len(T), 1))
f = skin.copy()
f = mix(f, PAL['muzzle'], muzzle)
f = mix(f, PAL['stubble'], beard * 0.13)
f = mix(f, PAL['blush'], np.clip(blush, 0, 1) * 0.45)
f = mix(f, PAL['stubble'], np.clip(dots * beard, 0, 1) * 0.62)
nose = sstep(-0.0007, 0.0007, np.interp(Z, NOSE_Z, NOSE_W) - AX) * (Y < -0.15)
f = mix(f, PAL['nose'], nose)
# A little shine on it, up and to the light's side.
f = mix(f, hexc('#FFD3DC'), sstep(0.0062, 0.0042, np.sqrt(((X - 0.009) / 1.5) ** 2 + (Z - 0.683) ** 2)) * nose * 0.9)
rgb[face] = f[face]

# His eyes, on their domes: white, iris, pupil, two shines and a dark rim all the way round.
ec, lo, hi = EYE['c'], EYE['lo'], EYE['hi']
eye = cls == C['eye']
side = np.sign(X)
ex = (AX - ec[0]) / ((hi[0] - lo[0]) / 2)  # -1 at the nose side, 1 at the ear side
ez = (Z - ec[2]) / ((hi[2] - lo[2]) / 2)
# Where Tripo painted the iris: the middle of its blue and dark texels.
dark = eye & (((Hh > 0.5) & (Hh < 0.72) & (Ss > 0.25)) | (Vv < 0.3)) & (np.sqrt(ex * ex + ez * ez) < 0.8)
ix0, iz0 = float(np.median((AX - ec[0])[dark])), float(np.median((Z - ec[2])[dark]))
print('IRIS', round(ix0, 4), round(iz0, 4), 'eye', ec.round(4), lo.round(4), hi.round(4))
IR = 0.0275
dx, dz = (AX - ec[0] - ix0), (Z - ec[2] - iz0 - 0.006)
r = np.sqrt(dx * dx + dz * dz) / IR
e = np.tile(PAL['white'], (len(T), 1))
# A little shade under the top lid.
e = mix(e, hexc('#C9CEDC'), sstep(0.35, 1.0, ez) * 0.55)
iris = mix(np.tile(PAL['iris'], (len(T), 1)), PAL['irisLight'], sstep(0.2, -0.9, dz / IR) * sstep(1.0, 0.45, r) * 0.75)
iris = mix(iris, PAL['irisDark'], sstep(0.72, 0.98, r))
iris = mix(iris, PAL['irisDark'], sstep(0.1, 0.9, dz / IR) * 0.5)
ia = sstep(1.03, 0.97, r)[:, None]
e = e * (1 - ia) + iris * ia
e = mix(e, PAL['pupil'], sstep(0.6, 0.54, r))
# Shines: both on the same side (the light's), like a painted toy eye.
sx = X - side * (ec[0] + ix0)  # across, in the world's x (so the shine doesn't mirror)
s1 = np.sqrt((sx - 0.0125) ** 2 + (dz - 0.0135) ** 2)
s2 = np.sqrt((sx + 0.012) ** 2 + (dz + 0.013) ** 2)
e = mix(e, hexc('#FFFFFF'), sstep(0.0098, 0.0086, s1))
e = mix(e, hexc('#FFFFFF'), sstep(0.0046, 0.0036, s2) * 0.85)
# The rim: where the dome meets his face (its outer edge, by how far the surface has turned away from the front).
rim = sstep(0.83, 0.93, np.sqrt(ex * ex + ez * ez))
e = mix(e, PAL['lash'], rim)
rgb[eye] = e[eye]

# ---------------------------------------------------------------- the borders blend, the gutters fill
out = np.zeros((R, R, 3), dtype=np.float32)
out[valid] = rgb
# Anti-alias the borders between parts inside an island (a 3-texel blur where two parts meet).
cg = grid(cls.astype(np.float32), -1)
edge = np.zeros((R, R), dtype=bool)
for sh in ((0, 1), (1, 0), (0, -1), (-1, 0)):
    n = np.roll(cg, sh, (0, 1))
    edge |= (n != cg) & (n >= 0) & (cg >= 0)
edge = box(edge.astype(np.float32), 1) > 0
num = box(out * vmask[..., None], 1)
den = box(vmask, 1)[..., None]
soft = num / np.maximum(den, 1e-6)
m = edge & valid
out[m] = soft[m]
# Gutters: every empty texel takes its nearest island's colour (so mipmaps never pull in black or a neighbour).
filled = valid.copy()
for _ in range(48):
    if filled.all():
        break
    acc = np.zeros_like(out)
    cnt = np.zeros((R, R), dtype=np.float32)
    for sh in ((0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (1, -1), (-1, 1), (-1, -1)):
        acc += np.roll(out * filled[..., None], sh, (0, 1))
        cnt += np.roll(filled.astype(np.float32), sh, (0, 1))
    grow = ~filled & (cnt > 0)
    out[grow] = acc[grow] / cnt[grow][:, None]
    filled |= grow
out[~filled] = PAL['skin']

tex = bpy.data.images.new('dad5', R, R, alpha=False)
rgba = np.concatenate([np.clip(out, 0, 1), np.ones((R, R, 1), dtype=np.float32)], -1)  # row 0 = v 0 = the bottom
tex.pixels.foreach_set(rgba.reshape(-1))
jpg = os.path.join(tmpdir, 'out.jpg')
tex.filepath_raw = jpg
tex.file_format = 'JPEG'
tex.save(quality=93)
if len(argv) > 3:
    tex.filepath_raw = argv[3]
    tex.file_format = 'PNG'
    tex.save()
JPG = open(jpg, 'rb').read()
print('JPEG', len(JPG))

# ---------------------------------------------------------------- the GLB again
# One vertex per (Tripo vertex's weld, new UV): corners that share both are one vertex.
cw = weld[TRI].reshape(-1)
cuv = np.round(luv.reshape(-1, 2) * 65535).astype(np.int64)
key = np.stack([cw, cuv[:, 0], cuv[:, 1]], 1)
_, firsts, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
inv = inv.reshape(-1)
src_v = TRI.reshape(-1)[firsts]
nPOS, nJNT, nWGT = POS[src_v], JNT[src_v], WGT[src_v]
# Normals: the average over each weld (Tripo's seams sometimes disagree a little, which shows as a crease).
nacc = np.zeros((NW, 3), dtype=np.float64)
np.add.at(nacc, weld, NRM)
nacc /= np.maximum(1e-9, np.linalg.norm(nacc, axis=1, keepdims=True))
# Tripo's surface is a little lumpy, which the toon light shows as ragged patches on his skin and clothes: the normals
# are smoothed over their neighbours there (his hair and horn keep their crisp locks).
vsrc = SPX[np.clip((UV0[:, 1] * SH).astype(int), 0, SH - 1), np.clip((UV0[:, 0] * SW).astype(int), 0, SW - 1)]
vh, vs, vv = hsv(vsrc)
crisp = (vpiece == 'head') & ((((vh < 0.1) | (vh > 0.97)) & (vs > 0.38) & (vv < 0.78)) | ((vh > 0.065) & (vh < 0.15) & (vs > 0.6)))
wcrisp = np.zeros(NW, dtype=bool)
wcrisp[weld[crisp]] = True
ea = np.concatenate([tw[:, 0], tw[:, 1], tw[:, 2], tw[:, 1], tw[:, 2], tw[:, 0]])
eb = np.concatenate([tw[:, 1], tw[:, 2], tw[:, 0], tw[:, 0], tw[:, 1], tw[:, 2]])
for _ in range(30):
    s_ = np.zeros((NW, 3), dtype=np.float64)
    np.add.at(s_, ea, nacc[eb])
    s_ /= np.maximum(1e-9, np.linalg.norm(s_, axis=1, keepdims=True))
    mixn = nacc * 0.45 + s_ * 0.55
    mixn /= np.maximum(1e-9, np.linalg.norm(mixn, axis=1, keepdims=True))
    nacc = np.where(wcrisp[:, None], nacc, mixn)
nNRM = nacc[weld[src_v]].astype(np.float32)
nUV = luv.reshape(-1, 2)[firsts].copy()
nUV[:, 1] = 1 - nUV[:, 1]
sp = P3[src_v]
nose_v = (np.abs(sp[:, 0]) < 0.04) & (sp[:, 2] > 0.64) & (sp[:, 2] < 0.705) & (sp[:, 1] < -0.16) & (vpiece[src_v] == 'head')
INK = np.where(np.isin(vpiece[src_v], ['eye', 'lash', 'brow']) | nose_v, 0.0, 1.0).astype(np.float32)
nIDX = inv.astype(np.uint16 if len(firsts) < 65536 else np.uint32).reshape(-1)
print('VERTS', NV, '->', len(firsts))

mesh_acc = set(att.values()) | {prim['indices']}
chunks, views, accs = [], [], []


def push(data, target=None):
    pad = (-sum(len(c) for c in chunks)) % 4
    if pad:
        chunks.append(b'\0' * pad)
    off = sum(len(c) for c in chunks)
    chunks.append(data)
    v = {'buffer': 0, 'byteOffset': off, 'byteLength': len(data)}
    if target:
        v['target'] = target
    views.append(v)
    return len(views) - 1


def acc(arr, typ, target=34962, minmax=False):
    ct = {np.dtype(np.float32): 5126, np.dtype(np.uint8): 5121, np.dtype(np.uint16): 5123, np.dtype(np.uint32): 5125}[arr.dtype]
    a = {'bufferView': push(np.ascontiguousarray(arr).tobytes(), target), 'componentType': ct, 'count': len(arr), 'type': typ}
    if minmax:
        a['min'], a['max'] = arr.min(0).tolist(), arr.max(0).tolist()
    return a


# Everything that isn't the mesh keeps its bytes (the skeleton's matrices, the wave's keys).
new_accessors = []
for i, a in enumerate(gltf['accessors']):
    if i in mesh_acc:
        new_accessors.append(None)
        continue
    bv = gltf['bufferViews'][a['bufferView']]
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    size = np.dtype(CT[a['componentType']]).itemsize * NC[a['type']] * a['count']
    b = dict(a)
    b.pop('byteOffset', None)
    b['bufferView'] = push(BIN[off:off + size])
    new_accessors.append(b)
new_accessors[att['POSITION']] = acc(nPOS, 'VEC3', minmax=True)
new_accessors[att['NORMAL']] = acc(nNRM, 'VEC3')
new_accessors[att['TEXCOORD_0']] = acc(nUV.astype(np.float32), 'VEC2')
new_accessors[att['JOINTS_0']] = acc(nJNT, 'VEC4')
new_accessors[att['WEIGHTS_0']] = acc(nWGT, 'VEC4')
new_accessors[prim['indices']] = acc(nIDX, 'SCALAR', target=34963)
new_accessors.append(acc(INK, 'SCALAR'))
prim['attributes']['_INK'] = len(new_accessors) - 1
gltf['accessors'] = new_accessors
gltf['images'][0] = {'bufferView': push(JPG), 'mimeType': 'image/jpeg', 'name': 'dad5'}
gltf['bufferViews'] = views
pad = (-sum(len(c) for c in chunks)) % 4
if pad:
    chunks.append(b'\0' * pad)
blob = b''.join(chunks)
gltf['buffers'] = [{'byteLength': len(blob)}]
js = json.dumps(gltf, separators=(',', ':')).encode()
js += b' ' * ((-len(js)) % 4)
with open(OUT, 'wb') as fh:
    fh.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)))
    fh.write(struct.pack('<II', len(js), 0x4E4F534A) + js)
    fh.write(struct.pack('<II', len(blob), 0x004E4942) + blob)
print('WROTE', OUT, os.path.getsize(OUT))

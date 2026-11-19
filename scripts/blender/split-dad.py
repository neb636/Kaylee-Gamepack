# Splits a textured Tripo3D Dad into the family's pivot rig (docs/3d-characters.md, step 4), headless:
#
#   Blender -b --python scripts/blender/split-dad.py -- <in.glb> <out.glb> <out.json>
#
# The input is Tripo's GLB as downloaded (one mesh, 1 m tall, Z up in Blender, face toward -Y) whose arms, legs, horn,
# eyes and brows are loose pieces of their own (the regenerations that animate; a fully fused Dad can't be cut cleanly).
# What it does, in order:
#   1. Merges by distance and sorts every loose piece by where it is and what colour its texture is (mint skin, shirt
#      pink, hair brown, khaki shorts, purple hooves and tail, yellow horn, eye dark).
#   2. If the head and the shirt are one piece, cuts it level at the neck. Everything above the cut goes to the head
#      except the collar (shirt-pink faces above the cut that join the shirt): on the head it poked out when he tilted.
#   3. Splits the hair from the head by colour (majority-smoothed, small islands dropped) and closes the scalp under it,
#      so the barber can take the hair away.
#   4. Caps every opening a joint turns around (the neck both sides, the arms' shoulder ends up inside the sleeves, the
#      legs' tops inside the shorts, the tail's root), each cap coloured like the face next to it.
#   5. Shifts Tripo's green skin to Dad's mint (#A8EAD5) in the texture.
#   6. Builds the pivots the game's rig expects (dad-model.ts): body > armL/armR @ shoulders, legL/legR @ hips,
#      head @ neck (head_mesh, hair_mesh, horn, brow_L/brow_R, eyes @ eye centre > eye_L/eye_R), tail @ its root.
#      L is the model's own left: Blender -x, three.js -x.
#   7. Exports the GLB (+Y up, JPEG 92) and writes the measurements dad-model.ts reads (out.json).
import bpy, bmesh, sys, json, math, colorsys
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

argv = sys.argv[sys.argv.index('--') + 1:]
SRC, OUT, META = argv[0], argv[1], argv[2]

MINT = (0xA8 / 255, 0xEA / 255, 0xD5 / 255)
PAL = {'skin': '#a8e8b8', 'pink': '#e8608e', 'hair': '#8a5030', 'khaki': '#c9a77a', 'purple': '#a552c8',
       'horn': '#f0a828', 'cream': '#f4e6d4', 'dark': '#2a2a3a', 'blush': '#f4a0a8'}
KEYS = list(PAL)
PALA = np.array([[int(v[i:i + 2], 16) / 255 for i in (1, 3, 5)] for v in PAL.values()])
K = {k: i for i, k in enumerate(KEYS)}

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
src = [o for o in bpy.data.objects if o.type == 'MESH'][0]
src.data.transform(src.matrix_world)
src.parent = None
src.matrix_world = Matrix.Identity(4)
mat = src.material_slots[0].material
img = [n.image for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE'][0]
W, H = img.size
PX = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)

bm = bmesh.new()
bm.from_mesh(src.data)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
UV = bm.loops.layers.uv.active


def texel(u):
    return PX[min(H - 1, max(0, int(u.y * H))), min(W - 1, max(0, int(u.x * W))), :3]


def face_class(f):
    pts = [l[UV].uv for l in f.loops]
    c = sum(pts, Vector((0, 0))) / len(pts)
    cs = np.array([texel(c)] + [texel(c.lerp(p, 0.6)) for p in pts])
    d = ((cs[:, None, :] - PALA[None]) ** 2).sum(-1).argmin(1)
    return int(np.bincount(d, minlength=len(KEYS)).argmax())


def components(faces):
    fs = set(faces)
    seen, out = set(), []
    for f in faces:
        if f in seen:
            continue
        grp, st = [f], [f]
        seen.add(f)
        while st:
            g = st.pop()
            for e in g.edges:
                for h in e.link_faces:
                    if h in fs and h not in seen:
                        seen.add(h)
                        grp.append(h)
                        st.append(h)
        out.append(grp)
    return out


def centre(faces):
    return Vector(np.mean([list(f.calc_center_median()) for f in faces], 0))


def hist(faces, cls):
    return np.bincount([cls[f] for f in faces], minlength=len(KEYS))


# ---------------------------------------------------------------- 1. sort the loose pieces
bm.faces.ensure_lookup_table()
cls = {f: face_class(f) for f in bm.faces}
label = {}
parts = components(list(bm.faces))
parts.sort(key=len, reverse=True)
main = parts[0]
small = []
for p in parts:
    c, h, n = centre(p), hist(p, cls), len(p)
    top = KEYS[int(h.argmax())]
    if p is main:
        name = 'main'
    elif n < 260 and 0.64 < c.z < 0.8 and c.y < -0.1:
        name = ('eye' if c.z < 0.745 else 'brow') + ('_L' if c.x < 0 else '_R')
    elif c.z > 0.85 and h[K['horn']] > 0.5 * n:
        name = 'horn'
    elif abs(c.x) > 0.18 and 0.28 < c.z < 0.5:
        name = 'armL' if c.x < 0 else 'armR'
    elif c.z < 0.13 and abs(c.x) > 0.05:
        name = 'legL' if c.x < 0 else 'legR'
    elif h[K['khaki']] > 0.35 * n and c.z < 0.4:
        name = 'shorts'
    elif top == 'purple' and c.y > 0.06 and c.z < 0.4:
        name = 'tail'
    elif top == 'pink' and c.z < 0.62:
        name = 'shirt'
    elif c.z > 0.55 and h[K['hair']] + h[K['skin']] > 0.5 * n:
        name = 'headpiece'
    else:
        small.append(p)
        continue
    for f in p:
        label[f] = name
# Leftover bits (a stray hair tuft): with the head above the neck, the body below.
for p in small:
    for f in p:
        label[f] = 'headpiece' if centre(p).z > 0.55 else 'shirt'
names = set(label.values())
tail_separate = 'tail' in names
TAIL_ROOT = None
if not tail_separate:
    # The tail grows out of the shorts: its root is where the tail's purple meets the shorts' khaki.
    shorts = [f for f in bm.faces if label.get(f) == 'shorts']
    edge = {v for f in shorts if cls[f] == K['purple'] for e in f.edges for h in e.link_faces
            if h is not f and cls[h] == K['khaki'] for v in e.verts}
    if edge:
        TAIL_ROOT = Vector(np.mean([list(v.co) for v in edge], 0))
print('pieces:', sorted(names), 'tail separate:', tail_separate)
for need in ['armL', 'armR', 'legL', 'legR', 'horn', 'eye_L', 'eye_R', 'brow_L', 'brow_R']:
    assert need in names, f'no {need}: is this a fused Tripo model? (docs/3d-characters.md, Dad)'

# ---------------------------------------------------------------- 2. the neck
main_faces = [f for f in bm.faces if label[f] == 'main']
main_pink = sum(1 for f in main_faces if cls[f] == K['pink'])
if main_pink > 300:
    # Head and shirt in one piece: the level just under his chin (the lowest skin facing forward, a little below).
    chin = min(f.calc_center_median().z for f in main_faces if cls[f] == K['skin'] and f.calc_center_median().y < -0.08 and f.calc_center_median().z > 0.5)
    NECK = round(chin - 0.008, 3)
    geom = list({v for f in main_faces for v in f.verts}) + list({e for f in main_faces for e in f.edges}) + main_faces
    res = bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, 0, NECK), plane_no=(0, 0, 1), dist=1e-6)
    cut_edges = [e for e in res['geom_cut'] if isinstance(e, bmesh.types.BMEdge)]
    for e in cut_edges:
        e.tag = True
    bm.faces.ensure_lookup_table()
    for f in bm.faces:
        if f not in label:
            # A half of a face the plane split: it belongs to what the original did.
            nb = [label[h] for e in f.edges for h in e.link_faces if h in label]
            label[f] = nb[0] if nb else 'main'
            cls[f] = face_class(f)
    main_faces = [f for f in bm.faces if label[f] == 'main']
    above = {f for f in main_faces if f.calc_center_median().z > NECK}
    # The collar: shirt-pink faces above the cut that touch the cut or join pink faces that do.
    collar = set()
    st = [f for f in above if cls[f] == K['pink'] and any(abs(v.co.z - NECK) < 1e-4 for v in f.verts)]
    collar.update(st)
    while st:
        g = st.pop()
        for e in g.edges:
            for h in e.link_faces:
                if h in above and h not in collar and cls[h] == K['pink']:
                    collar.add(h)
                    st.append(h)
    for f in main_faces:
        label[f] = 'headpiece' if (f in above and f not in collar) else 'shirt'
    # Detach the head from the body along every edge between them (the cut plus the collar's rim).
    seam = [e for e in bm.edges if len({label[h] == 'headpiece' for h in e.link_faces}) == 2]
    bmesh.ops.split_edges(bm, edges=seam)
else:
    # Already apart (Tripo made the head its own piece): the neck is the bottom of the head's opening.
    for f in bm.faces:
        if label[f] == 'main':
            label[f] = 'headpiece'
    head_faces = [f for f in bm.faces if label[f] == 'headpiece']
    NECK = round(min(f.calc_center_median().z for f in head_faces) + 0.004, 3)
print('neck at', NECK)

# ---------------------------------------------------------------- 3. the hair
head_faces = [f for f in bm.faces if label[f] == 'headpiece']
is_hair = {f: cls[f] == K['hair'] for f in head_faces}
hs = set(head_faces)
for _ in range(2):
    nxt = {}
    for f in head_faces:
        nb = [is_hair[h] for e in f.edges for h in e.link_faces if h is not f and h in hs]
        votes = sum(nb) + is_hair[f]
        nxt[f] = votes * 2 > len(nb) + 1
    is_hair = nxt
hair = [f for f in head_faces if is_hair[f]]
for grp in components(hair):
    if len(grp) >= 40:
        for f in grp:
            label[f] = 'hair'
seam = [e for e in bm.edges if len({label[h] == 'hair' for h in e.link_faces}) == 2]
bmesh.ops.split_edges(bm, edges=seam)

# ---------------------------------------------------------------- pieces as objects
def build(name, faces):
    b2 = bmesh.new()
    vmap = {}
    uv2 = b2.loops.layers.uv.new('UVMap')
    for f in faces:
        vs = []
        for v in f.verts:
            if v not in vmap:
                vmap[v] = b2.verts.new(v.co)
            vs.append(vmap[v])
        try:
            nf = b2.faces.new(vs)
        except ValueError:
            continue
        for l2, l in zip(nf.loops, f.loops):
            l2[uv2].uv = l[UV].uv
        nf.smooth = True
    me = bpy.data.meshes.new(name)
    b2.to_mesh(me)
    b2.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat)
    return o


groups = {}
for f, n in label.items():
    if f.is_valid:
        groups.setdefault(n, []).append(f)
body_faces = groups.get('shirt', []) + groups.get('shorts', [])
if not tail_separate:
    body_faces += groups.get('tail', [])
objs = {
    'body_mesh': build('body_mesh', body_faces),
    'head_mesh': build('head_mesh', groups['headpiece']),
    'hair_mesh': build('hair_mesh', groups.get('hair', [])),
    'horn': build('horn', groups['horn']),
}
# The top of each arm is tucked up inside its sleeve. The game turns the sleeve with the arm, but the shirt only stretches
# partway at the shoulder, so a raised arm's hidden top can peek out there: it's painted shirt-pink (every arm face the
# shirt covers: a short ray out along its normal meets the shirt from inside), so what peeks reads as sleeve, like
# today's Dad's.
shirt_faces = [f for f in groups.get('shirt', []) if f.is_valid]
PINK_UV = next(f for f in sorted(shirt_faces, key=lambda f: -f.calc_area()) if cls[f] == K['pink']).loops[0][UV].uv.copy()
sv = list({v for f in shirt_faces for v in f.verts})
si = {v: i for i, v in enumerate(sv)}
shirt_tree = BVHTree.FromPolygons([v.co.copy() for v in sv], [[si[v] for v in f.verts] for f in shirt_faces])
for n in ['armL', 'armR']:
    for f in groups[n]:
        hit = shirt_tree.ray_cast(f.calc_center_median() + f.normal * 0.001, f.normal, 0.03)
        # Under the sleeve only if the ray meets the shirt from inside it (the shirt there faces the same way): an arm
        # face that looks at the shirt from outside (the arm's inner side, beside the body) stays skin.
        if hit[0] is not None and hit[1].dot(f.normal) > 0:
            for l in f.loops:
                l[UV].uv = PINK_UV
for n in ['armL', 'armR', 'legL', 'legR']:
    objs[n + '_mesh'] = build(n + '_mesh', groups[n])
for n in ['eye_L', 'eye_R', 'brow_L', 'brow_R']:
    objs[n] = build(n, groups[n])
if tail_separate:
    objs['tail_mesh'] = build('tail_mesh', groups['tail'])
bm.free()


# ---------------------------------------------------------------- 4. caps
def loops_of(b):
    bnd = {e for e in b.edges if e.is_boundary}
    out = []
    while bnd:
        e = bnd.pop()
        grp, st = {e}, [e]
        while st:
            x = st.pop()
            for v in x.verts:
                for y in v.link_edges:
                    if y in bnd:
                        bnd.remove(y)
                        grp.add(y)
                        st.append(y)
        out.append(list(grp))
    return out


def loop_centre(edges):
    vs = {v for e in edges for v in e.verts}
    return Vector(np.mean([list(v.co) for v in vs], 0)), len(vs)


def cap(o, want):
    """Fills the openings `want(centre, n)` picks, each new face coloured like the face across its first edge.
    Returns the centres of the openings it filled."""
    b = bmesh.new()
    b.from_mesh(o.data)
    uv = b.loops.layers.uv.active
    filled = []
    for edges in loops_of(b):
        c, n = loop_centre(edges)
        if not want(c, n):
            continue
        filled.append(c)
        before = set(b.faces)
        bmesh.ops.holes_fill(b, edges=edges, sides=0)
        new = [f for f in b.faces if f not in before]
        if new:
            bmesh.ops.triangulate(b, faces=new)
        new = [f for f in b.faces if f not in before]
        for f in new:
            f.smooth = True
            src_uv = None
            for e in f.edges:
                for h in e.link_faces:
                    if h not in new and src_uv is None:
                        src_uv = h.loops[0][uv].uv.copy()
            for l in f.loops:
                l[uv].uv = src_uv if src_uv is not None else Vector((0.5, 0.5))
    b.to_mesh(o.data)
    b.free()
    return filled


def plug(o):
    """Closes an arm's open shoulder end with a dome (a fan to a point pushed in toward the body by the opening's
    radius), shirt-pink: a flat cap's rim swung out through the shirt when the arm turned. Returns the opening's centre
    (the pivot) in a list, like cap()."""
    b = bmesh.new()
    b.from_mesh(o.data)
    uv = b.loops.layers.uv.active
    edges = max(loops_of(b), key=len)
    c, _ = loop_centre(edges)
    ring = list({v for e in edges for v in e.verts})
    r = float(np.mean([(v.co - c).length for v in ring]))
    mid = Vector(np.mean([list(v.co) for v in b.verts], 0))
    tip = b.verts.new(c + (c - mid).normalized() * r * 0.9)
    for e in edges:
        a, z = e.verts
        # Wind each triangle like the arm's face on the other side of its edge.
        f0 = e.link_faces[0]
        la = next(l for l in f0.loops if l.vert is a)
        if la.link_loop_next.vert is z:
            a, z = z, a
        try:
            f = b.faces.new([a, z, tip])
        except ValueError:
            continue
        f.smooth = True
        for l in f.loops:
            l[uv].uv = PINK_UV
    b.to_mesh(o.data)
    b.free()
    return [c]


eyes_c = [Vector(np.mean([list(v.co) for v in objs[n].data.vertices], 0)) for n in ('eye_L', 'eye_R')]
shoulder = {s: plug(objs[s + '_mesh']) for s in ('armL', 'armR')}
hip = {s: cap(objs[s + '_mesh'], lambda c, n: True) for s in ('legL', 'legR')}
tail_root = cap(objs['tail_mesh'], lambda c, n: True) if tail_separate else []
cap(objs['body_mesh'], lambda c, n: abs(c.z - NECK) < 0.05 and abs(c.x) < 0.05)
cap(objs['head_mesh'], lambda c, n: (abs(c.z - NECK) < 0.05 and abs(c.x) < 0.05) or (c.z > 0.6 and all((c - e).length > 0.06 for e in eyes_c)))

# ---------------------------------------------------------------- 5. mint skin
rgb = PX[:, :, :3]
hsv = np.array(np.vectorize(colorsys.rgb_to_hsv, otypes=[float, float, float])(rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2])).transpose(1, 2, 0)
green = (hsv[:, :, 0] > 0.2) & (hsv[:, :, 0] < 0.47) & (hsv[:, :, 1] > 0.12)
mh, ms, mv = colorsys.rgb_to_hsv(*MINT)
med_s = float(np.median(hsv[:, :, 1][green]))
med_v = float(np.median(hsv[:, :, 2][green]))
nh = hsv.copy()
nh[:, :, 0][green] = mh
nh[:, :, 1][green] = np.clip(hsv[:, :, 1][green] * ms / med_s, 0, 1)
nh[:, :, 2][green] = np.clip(hsv[:, :, 2][green] * mv / med_v, 0, 1)
out_rgb = np.array(np.vectorize(colorsys.hsv_to_rgb, otypes=[float, float, float])(nh[:, :, 0], nh[:, :, 1], nh[:, :, 2])).transpose(1, 2, 0)
PX[:, :, :3] = out_rgb
img.pixels[:] = PX.ravel()
img.update()
# His hair's browns (dark, middle, light) for the barber's strands.
hair_px = rgb[((rgb - PALA[K['hair']]) ** 2).sum(-1) < 0.02]
lum = hair_px @ np.array([0.3, 0.59, 0.11])
hair_cols = ['#%02X%02X%02X' % tuple(int(x * 255) for x in hair_px[np.argsort(lum)[int(len(lum) * q)]]) for q in (0.25, 0.5, 0.75)]

# ---------------------------------------------------------------- 6. pivots
def empty(name, at, parent=None):
    e = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(e)
    e.location = at
    if parent:
        e.parent = parent
        e.matrix_parent_inverse = parent.matrix_world.inverted()
    return e


def bbox(o):
    co = np.array([list(v.co) for v in o.data.vertices])
    return co.min(0), co.max(0), co


def under(child, parent):
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()


hmin, hmax, hco = bbox(objs['head_mesh'])
neck_ring = hco[np.abs(hco[:, 2] - NECK) < 0.012]
neck_y = float(neck_ring[:, 1].mean()) if len(neck_ring) else 0.0
root = empty('dad', (0, 0, 0))
body = empty('body', (0, 0, 0), root)
bpy.context.view_layer.update()
head = empty('head', (0, neck_y, NECK), body)
eye_c = (eyes_c[0] + eyes_c[1]) / 2
bpy.context.view_layer.update()
eyes = empty('eyes', (0, eye_c.y, eye_c.z), head)
piv = {}
for s in ('armL', 'armR'):
    piv[s] = shoulder[s][0] if shoulder[s] else Vector(bbox(objs[s + '_mesh'])[1])
for s in ('legL', 'legR'):
    piv[s] = hip[s][0] if hip[s] else Vector(bbox(objs[s + '_mesh'])[1])
if tail_separate:
    tail_at = tail_root[0]
else:
    # On the shorts (measured in step 1); failing that, the back of the waist.
    bmin, bmax, bco = bbox(objs['body_mesh'])
    tail_at = TAIL_ROOT if TAIL_ROOT is not None else Vector((0, float(bmax[1]) - 0.06, 0.29))
bpy.context.view_layer.update()
nodes = {s: empty(s, tuple(piv[s]), body) for s in ('armL', 'armR', 'legL', 'legR')}
tail = empty('tail', tuple(tail_at), body)
bpy.context.view_layer.update()
under(objs['body_mesh'], body)
for n in ('head_mesh', 'hair_mesh', 'horn', 'brow_L', 'brow_R'):
    under(objs[n], head)
for n in ('eye_L', 'eye_R'):
    under(objs[n], eyes)
for s in ('armL', 'armR', 'legL', 'legR'):
    under(objs[s + '_mesh'], nodes[s])
if tail_separate:
    under(objs['tail_mesh'], tail)

# ---------------------------------------------------------------- 7. measurements and export
bpy.context.view_layer.update()
def three(p):
    return [round(float(p[0]), 4), round(float(p[2]), 4), round(float(-p[1]), 4)]


emin, emax, _ = bbox(objs['eye_R'])
amin, amax, aco = bbox(objs['armR_mesh'])
hoof = aco[aco[:, 2] < amin[2] + 0.03].mean(0)
lmin, lmax, lco = bbox(objs['legL_mesh'])
mid = lco[(lco[:, 2] > 0.04) & (lco[:, 2] < 0.1)]
leg_c = mid[:, :2].mean(0)
leg_r = float(np.sqrt(((mid[:, :2] - leg_c) ** 2).sum(1)).max())
shorts_hem = float(bbox(objs['body_mesh'])[2][:, 2].min())
brow = Vector(np.mean([list(v.co) for v in objs['brow_L'].data.vertices], 0))
horn_co = bbox(objs['horn'])[2]
horn_tip = horn_co[horn_co[:, 2].argmax()]
_, _, hairco = bbox(objs['hair_mesh'])
# The tip of his muzzle: rays from in front at x = 0 between the eyes and the collar; the nose sits just under it.
bh = bmesh.new()
bh.from_mesh(objs['head_mesh'].data)
tree = BVHTree.FromBMesh(bh)
best = (1, None)
for z in np.arange(NECK + 0.02, eye_c.z, 0.002):
    hit = tree.ray_cast(Vector((0, -1, z)), Vector((0, 1, 0)))
    if hit[0] is not None and hit[0].y < best[0]:
        best = (hit[0].y, z)
bh.free()
pa = piv['armR']
# The armpit: where the right sleeve's underside meets the shirt (the lowest shirt point out past the shoulder pivot,
# not far below it). The game turns the sleeve with the arm from a seam through here (dad-model.ts sleevesFollow).
bco = bbox(objs['body_mesh'])[2]
side = bco[(bco[:, 0] > pa.x - 0.01) & (bco[:, 2] > pa.z - 0.07) & (bco[:, 2] < pa.z)]
pit = side[side[:, 2].argmin()]
meta = {
    'neck': NECK,
    'eye': {'c': [round(float(x), 4) for x in (emin + emax) / 2], 'r': [round(float(x), 4) for x in (emax - emin) / 2]},
    'muzzle': round(float(best[1]), 4),
    'hoof': [round(float(hoof[0] - pa.x), 4), round(float(hoof[2] - pa.z), 4), round(float(-(hoof[1] - pa.y)), 4)],
    'brow': [round(float(x), 4) for x in brow],
    'horn': [round(float(x), 4) for x in horn_tip],
    'hairMid': round(float((hairco[:, 2].min() + hairco[:, 2].max()) / 2), 4),
    'shoulder': three(pa),
    'armpit': [round(float(pit[0]), 4), round(float(pit[2]), 4)],
    'shin': {'x': round(float(leg_c[0] - piv['legL'].x), 4), 'z': round(float(-(leg_c[1] - piv['legL'].y)), 4), 'r': round(leg_r, 4),
             'sole': round(float(-piv['legL'].z), 4), 'hem': round(shorts_hem - float(piv['legL'].z), 4)},
    'tailSeparate': tail_separate,
    'tailRoot': three(tail_at),
    'hair': hair_cols,
}
json.dump(meta, open(META, 'w'), indent=2)
print(json.dumps(meta))

for o in objs.values():
    o.data.validate(clean_customdata=False)
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
    if o is not src:
        o.select_set(True)
bpy.data.objects.remove(src)
bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_yup=True, export_animations=False,
                          export_image_format='JPEG', export_jpeg_quality=92)
bpy.ops.wm.save_as_mainfile(filepath=OUT.replace('.glb', '.blend'))

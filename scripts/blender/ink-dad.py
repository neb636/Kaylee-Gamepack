# Marks where Dad 5's ink is drawn: an `_INK` number per vertex (0 = no line, 1 = the full line), written into his GLB
# in place. dad-candidates.ts's hull leaves out the triangles marked 0 and thins its line by the number elsewhere.
#
#   Blender -b --python scripts/blender/ink-dad.py -- src/world/places/thailand/characters/models/candidates/dad-5.glb
#
# Why: the ink is an inverted hull of his whole mesh, so it shows wherever the mesh folds inward on his face. With the
# Outline at 1 that drew a squiggle under his nose, rims round his eye domes and sockets and lines round his brows that
# didn't follow his face. So:
#   - the small pieces sunk into his face (eye domes, lashes, brows) get no ink: their edges are painted;
#   - his nose's ink fades out over a soft ring round it (no hard end to the line where it meets his muzzle);
#   - on his head, the ink fades out where the surface folds inward (his eye sockets, the hair's roots): how far the
#     middle of the surface 12 mm round a vertex sits in front of it. His outline is on the outward curves, so it stays.
# Only the GLB's JSON and one new buffer view change: the mesh, the skin weights, the texture and the wave are kept.
# Running it again overwrites the old `_INK`.
import json, struct, sys
import numpy as np
from mathutils.kdtree import KDTree

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
PATH = argv[0]

# His nose in glTF axes (x across, y up, z toward his front), measured from the pink of his texture, and the half-sizes
# of the box inside which the ink is gone. It comes back over the next 0.7 of that size.
NOSE = np.array([-0.003, 0.672, 0.232])
NOSE_R = np.array([0.034, 0.022, 0.035])
FADE = 0.7
# The folds: above the head's cut (glTF y) and how deep a fold is before its ink starts and finishes fading.
HEAD_Y = 0.6
FOLD_R = 0.012
FOLD = (0.06, 0.2)

raw = open(PATH, 'rb').read()
magic, version, _ = struct.unpack('<III', raw[:12])
assert magic == 0x46546C67, 'not a GLB'
jlen = struct.unpack('<I', raw[12:16])[0]
gj = json.loads(raw[20:20 + jlen])
bstart = 20 + jlen
blen = struct.unpack('<I', raw[bstart:bstart + 4])[0]
bin_ = bytearray(raw[bstart + 8:bstart + 8 + blen])

prim = gj['meshes'][0]['primitives'][0]


def read(acc_i, comps):
    acc = gj['accessors'][acc_i]
    bv = gj['bufferViews'][acc['bufferView']]
    dtype = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[acc['componentType']]
    off = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    n = acc['count'] * comps
    stride = bv.get('byteStride')
    if stride and stride != comps * np.dtype(dtype).itemsize:
        raise SystemExit('interleaved buffers are not handled')
    return np.frombuffer(bytes(bin_[off:off + n * np.dtype(dtype).itemsize]), dtype=dtype).reshape(-1, comps) if comps > 1 else np.frombuffer(bytes(bin_[off:off + n * np.dtype(dtype).itemsize]), dtype=dtype)


pos = read(prim['attributes']['POSITION'], 3).astype(np.float64)
idx = read(prim['indices'], 1).astype(np.int64).reshape(-1, 3)
N = len(pos)

# Loose pieces, with the texture seams' twin vertices joined (same spot = same piece).
parent = np.arange(N)


def find(a):
    while parent[a] != a:
        parent[a] = parent[parent[a]]
        a = parent[a]
    return a


def union(a, b):
    ra, rb = find(a), find(b)
    if ra != rb:
        parent[ra] = rb


for a, b, c in idx:
    union(a, b)
    union(b, c)
key = np.round(pos / 1e-4).astype(np.int64)
first = {}
for i, k in enumerate(map(tuple, key)):
    if k in first:
        union(i, first[k])
    else:
        first[k] = i
root = np.array([find(i) for i in range(N)])

# The eye domes, lashes and brows: whole pieces in front of his face at eye height and above.
facial = np.zeros(N, bool)
for r in np.unique(root):
    m = root == r
    p = pos[m]
    if p[:, 1].min() > 0.64 and p[:, 2].min() > 0.14 and np.ptp(p[:, 0]) < 0.12:
        facial |= m



def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


ink = smoothstep(1, 1 + FADE, np.sqrt((((pos - NOSE) / NOSE_R) ** 2).sum(1)))

# How folded his surface is round each vertex, measured on the welded shape with smooth normals (what the hull uses).
_, weld, back = np.unique(np.round(pos / 1e-4).astype(np.int64), axis=0, return_index=True, return_inverse=True)
back = back.ravel()
P = pos[weld]
T = back[idx]
fn = np.cross(P[T[:, 1]] - P[T[:, 0]], P[T[:, 2]] - P[T[:, 0]])
nrm = np.zeros_like(P)
for k in range(3):
    np.add.at(nrm, T[:, k], fn)
nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-12
kd = KDTree(len(P))
for i, p in enumerate(P):
    kd.insert(p, i)
kd.balance()
fold = np.zeros(len(P))
for i, p in enumerate(P):
    near = [j for (_, j, _) in kd.find_range(p, FOLD_R)]
    fold[i] = np.dot(P[near].mean(0) - p, nrm[i]) / FOLD_R
fold = fold[back]
head = pos[:, 1] > HEAD_Y
ink[head] *= 1 - smoothstep(*FOLD, fold[head])
ink[facial] = 0
ink = ink.astype(np.float32)

# Write it: a new buffer view at the end of the binary chunk (or the old `_INK`'s, overwritten).
data = ink.tobytes()
if '_INK' in prim['attributes']:
    acc = gj['accessors'][prim['attributes']['_INK']]
    bv = gj['bufferViews'][acc['bufferView']]
    assert bv['byteLength'] == len(data)
    bin_[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + len(data)] = data
else:
    while len(bin_) % 4:
        bin_.append(0)
    gj['bufferViews'].append({'buffer': 0, 'byteOffset': len(bin_), 'byteLength': len(data)})
    bin_ += data
    gj['accessors'].append({'bufferView': len(gj['bufferViews']) - 1, 'componentType': 5126, 'count': N, 'type': 'SCALAR', 'min': [float(ink.min())], 'max': [float(ink.max())]})
    prim['attributes']['_INK'] = len(gj['accessors']) - 1
while len(bin_) % 4:
    bin_.append(0)
gj['buffers'][0]['byteLength'] = len(bin_)

js = json.dumps(gj, separators=(',', ':')).encode()
js += b' ' * (-len(js) % 4)
out = struct.pack('<III', magic, version, 12 + 8 + len(js) + 8 + len(bin_))
out += struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bin_), 0x004E4942) + bytes(bin_)
open(PATH, 'wb').write(out)
print(json.dumps({'vertices': N, 'none': int((ink == 0).sum()), 'fading': int(((ink > 0) & (ink < 1)).sum()), 'facial': int(facial.sum())}))

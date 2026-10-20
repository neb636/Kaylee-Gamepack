// The plane from outside (the airport, the flight home): a chubby Nok Air plane, the Thai airline whose planes are
// birds. The nose is a yellow beak with a smile and a big eye behind it, the front is purple, pink and gold swooshes
// sweep up over the wing to a white back, feathers flick at the tail, and the tail fin has the yellow bird in a circle.
// No words. Nose toward -x, the door on its +z side (the side the camera sees); its door opens onto the boarding stairs.
//
// The body is one lathe (a round nose that droops a little like a beak, a tail cone that sweeps up), painted with a
// canvas livery: the side view is drawn once and wrapped onto both sides, so the swooshes stay crisp curves.
import { CanvasTexture, Group, LatheGeometry, Mesh, MeshToonMaterial, SRGBColorSpace, Vector2 } from 'three'
import type { Bag } from '../../engine/dispose'
import { merge, P, solid, type V3 } from '../../engine/geo'
import { makeHull } from '../../engine/outline'
import { PAL, toonGradient } from '../../engine/toon'

const PURPLE = '#6E3FC4'
const MAGENTA = '#E8409A'
const GOLD = '#FFC23D'
const BEAK = '#FFC83D'
const BEAK_LOW = '#FF9F2E'
const WHITE = '#FBF8FF'
const WING = '#ECE8F5'
const DARK = '#2E2A4A'

/** The body (meters): radius, its center height, the nose tip and the tail tip along x. */
const R = 1.35
const CY = 2.2
const NOSE_X = -6.8
const TAIL_X = 7.2
const LEN = TAIL_X - NOSE_X
const NOSE = 2.6
const TAIL = 3.8

export interface PlaneOutside {
  root: Group
  /** The door (opens outward on its hinge). */
  door: Group
  /** The boarding stairs (the flight home takes them away). */
  stairs: Group
  /** Where the door is, and the stairs' steps from the ground up to it (local to `root`). */
  doorAt: V3
  steps: V3[]
}

/** The body's radius `s` meters back from the nose tip. */
function radius(s: number) {
  s = Math.max(0, Math.min(LEN, s))
  if (s < NOSE) return R * Math.pow(1 - Math.pow(1 - s / NOSE, 2.2), 0.5)
  if (s > LEN - TAIL) return R * (1 - 0.8 * Math.pow((s - (LEN - TAIL)) / TAIL, 1.3))
  return R
}
/** How far the body's axis is raised there: the nose droops, the tail cone sweeps up (its top stays nearly level). */
function lift(s: number) {
  const r = radius(s)
  if (s < NOSE) return -(R - r) * 0.3
  if (s > LEN - TAIL) return (R - r) * 0.85
  return 0
}

export function buildPlaneOutside(bag: Bag, { wheelsUp = false } = {}): PlaneOutside {
  const root = new Group()
  root.add(buildBody(bag))
  const parts = [
    // Low wings swept back, a little dihedral, with purple winglets and gold tips.
    ...[-1, 1].flatMap((side) => {
      const wing = [[-1.3, 0], [1.8, 0], [3.5, 5.6], [2.7, 5.6]] as [number, number][]
      const tilt = -side * 0.07
      return [
        P.prism(wing.map(([x, z]) => [x, side * z]), 0.22, WING, { at: [0, 1.25, 0], rot: [Math.PI / 2 + tilt, 0, 0] }),
        P.prism([[0, 0], [0.9, 0], [1.25, 1.2], [0.85, 1.2]], 0.12, PURPLE, { at: [2.7, 1.3 + 5.6 * 0.07, side * 5.55] }),
        P.prism([[0.7, 0.9], [1.25, 1.2], [0.85, 1.2]], 0.14, GOLD, { at: [2.7, 1.3 + 5.6 * 0.07, side * 5.55] }),
      ]
    }),
    // Engines under the wings: white nacelles with an ink intake, a grey lip and spinner, and a pylon up to the wing.
    ...[-1, 1].flatMap((side) => {
      const z = side * 2.5
      return [
        P.cyl(0.62, 0.5, 2.1, WHITE, { at: [0.3, 0.75, z], rot: [0, 0, Math.PI / 2] }, 20),
        P.torus(0.56, 0.09, '#C9C3D8', { at: [-0.75, 0.75, z], rot: [0, Math.PI / 2, 0] }),
        P.cyl(0.5, 0.5, 0.05, DARK, { at: [-0.72, 0.75, z], rot: [0, 0, Math.PI / 2] }, 20),
        P.cone(0.16, 0.3, '#C9C3D8', { at: [-0.8, 0.75, z], rot: [0, 0, Math.PI / 2] }),
        P.cone(0.32, 0.5, '#C9C3D8', { at: [1.6, 0.75, z], rot: [0, 0, -Math.PI / 2] }),
        P.box(1.0, 0.5, 0.16, WING, { at: [1.0, 1.3, z] }),
      ]
    }),
    // The tail fin (white, swept back) with the airline's bird on each side: a yellow beak in a white circle.
    P.prism([[3.4, 0], [6.9, 0], [7.4, 3.0], [6.0, 3.0]], 0.26, WHITE, { at: [0, CY + R - 0.25, 0] }),
    ...[-1, 1].flatMap((side) => {
      const at = (x: number, y: number, dz: number): V3 => [x, y, side * (0.13 + dz)]
      return [
        P.cyl(0.78, 0.78, 0.04, '#FFFFFF', { at: at(6.0, 5.0, 0.02), rot: [Math.PI / 2, 0, 0] }, 28),
        P.torus(0.76, 0.05, PURPLE, { at: at(6.0, 5.0, 0.04) }, Math.PI * 2),
        P.prism([[-0.55, 0.15], [0.45, 0.42], [0.35, -0.05], [-0.05, -0.55]], 0.04, BEAK, { at: at(6.0, 5.0, 0.06) }),
        P.prism([[-0.05, -0.55], [0.35, -0.05], [0.12, -0.08]], 0.04, '#E8403F', { at: at(6.0, 5.0, 0.08) }),
        P.sphere(0.07, DARK, { at: at(6.2, 5.28, 0.08), scale: [1, 1, 0.4] }),
      ]
    }),
    // The little tail wings.
    ...[-1, 1].map((side) => P.prism([[5.2, 0], [6.6, 0], [7.4, 2.5], [6.8, 2.5]].map(([x, z]) => [x, side * z] as [number, number]), 0.16, WING, { at: [0, CY + 0.75, 0], rot: [Math.PI / 2, 0, 0] })),
    // The wheels: a nose wheel under the beak and the two main legs under the wings.
    ...(wheelsUp
      ? []
      : ([[-5.0, 0, 0.55], [1.6, 1.2, 0.95], [1.6, -1.2, 0.95]] as const).flatMap(([x, z, top]) => [
          P.cyl(0.08, 0.08, top, '#D8D2E6', { at: [x, 0.42 + top / 2, z] }),
          ...[-0.2, 0.2].flatMap((dz) => [P.torus(0.3, 0.14, PAL.ink, { at: [x, 0.42, z + dz] }), P.cyl(0.16, 0.16, 0.2, '#D8D2E6', { at: [x, 0.42, z + dz], rot: [Math.PI / 2, 0, 0] })]),
        ])),
  ]
  root.add(solid(merge(parts), bag, 2))

  const doorAt: V3 = [NOSE_X + 3.3, 2.15, R + 0.02]
  const door = new Group()
  door.position.set(doorAt[0] - 0.5, doorAt[1], doorAt[2])
  door.add(solid(merge([P.rbox(1.0, 1.7, 0.08, 0.12, PURPLE, { at: [0.5, 0, 0] }), P.cyl(0.18, 0.18, 0.04, '#A8DCFF', { at: [0.5, 0.35, 0.04], rot: [Math.PI / 2, 0, 0] }), P.box(0.12, 0.05, 0.05, PAL.cream, { at: [0.85, -0.1, 0.05] })]), bag, 2))
  door.userData.pick = 'plane-door'
  root.add(door)

  // The boarding stairs: a little truck with steps up to the door.
  const steps: V3[] = []
  const n = 7
  const stair = []
  for (let i = 0; i < n; i++) {
    const y = 0.2 + (i + 1) * ((doorAt[1] - 0.95 - 0.2) / n)
    const z = doorAt[2] + 3.2 - (i + 1) * (2.9 / n)
    steps.push([doorAt[0], y, z])
    stair.push(P.box(1.2, 0.1, 0.42, PAL.cream, { at: [doorAt[0], y - 0.05, z] }))
  }
  stair.push(
    P.box(1.4, 0.25, 3.6, '#FFC83D', { at: [doorAt[0], 0.3, doorAt[2] + 1.9] }),
    ...[-1, 1].map((s) => P.box(0.06, 0.06, 3.3, PAL.hotpink, { at: [doorAt[0] + s * 0.62, 1.6, doorAt[2] + 1.6], rot: [-0.62, 0, 0] })),
    ...[[-0.5, 0.6], [0.5, 0.6], [-0.5, 3.4], [0.5, 3.4]].map(([x, z]) => P.torus(0.16, 0.07, PAL.ink, { at: [doorAt[0] + x, 0.16, doorAt[2] + z], rot: [0, Math.PI / 2, 0] })),
  )
  const stairs = solid(merge(stair), bag, 2)
  root.add(stairs)
  return { root, door, stairs, doorAt, steps }
}

/** The painted body: a lathe along x with the livery canvas wrapped around it (both sides the same). */
function buildBody(bag: Bag) {
  const N = 90
  const profile: Vector2[] = []
  for (let i = 0; i <= N; i++) {
    // Denser at the ends, where the body curves.
    const u = i / N
    const s = LEN * (u < 0.25 ? 0.25 * Math.pow(u / 0.25, 1.6) : u > 0.75 ? 1 - 0.25 * Math.pow((1 - u) / 0.25, 1.6) : u)
    profile.push(new Vector2(i === 0 ? 0 : radius(s), s))
  }
  // Close the tail with a little flat cap (the last ring shrinks to the axis).
  profile.push(new Vector2(0, LEN))
  // phiStart -π/2: around the body, u = 0 is the top, 0.25 the +z side, 0.5 the belly, 0.75 the -z side.
  const geo = new LatheGeometry(profile, 56, -Math.PI / 2)
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const s = pos.getY(i)
    const z = pos.getZ(i)
    const around = uv.getX(i)
    // Lathe y (along) becomes plane x; lathe x becomes plane -y (a rotation, so faces keep pointing out).
    pos.setXYZ(i, NOSE_X + s, CY - x + lift(s), z)
    uv.setXY(i, s / LEN, around)
  }
  geo.computeVertexNormals()
  const tex = bag.add(livery())
  const mat = bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient() }))
  const g = new Group()
  g.add(new Mesh(bag.add(geo), mat))
  const hull = makeHull(geo, 2)
  bag.add(hull.geometry)
  g.add(hull)
  return g
}

// ---------------------------------------------------------------- the livery

const W = 2048
const H = 1024

/**
 * The paint. Drawn in side view, in meters: `s` back from the nose tip, `y` up from the body's axis. Each point is
 * wrapped onto the round body (the height becomes an angle around it), so shapes look right from the side.
 */
function livery() {
  const panel = document.createElement('canvas')
  panel.width = W
  panel.height = H / 2
  const c = panel.getContext('2d')!
  const pt = (s: number, y: number): [number, number] => {
    const yn = Math.max(-1, Math.min(1, y / Math.max(radius(s), 0.05)))
    return [(s / LEN) * W, (1 - Math.acos(-yn) / Math.PI) * (H / 2)]
  }
  /** A filled shape through side-view points (each edge cut into short steps, since the wrap bends it). */
  const fill = (pts: [number, number][], color: string) => {
    c.beginPath()
    pts.forEach(([s, y], i) => {
      const [px, py] = pt(s, y)
      if (i === 0) c.moveTo(px, py)
      else c.lineTo(px, py)
    })
    c.closePath()
    c.fillStyle = color
    c.fill()
  }
  const dense = (pts: [number, number][], steps = 16) => {
    const out: [number, number][] = []
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length]
      for (let k = 0; k < steps; k++) out.push([p[0] + ((q[0] - p[0]) * k) / steps, p[1] + ((q[1] - p[1]) * k) / steps])
    })
    return out
  }
  /** Points along a quadratic curve. */
  const curve = (a: [number, number], ctrl: [number, number], b: [number, number], steps = 24): [number, number][] =>
    Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps
      const m = 1 - t
      return [m * m * a[0] + 2 * m * t * ctrl[0] + t * t * b[0], m * m * a[1] + 2 * m * t * ctrl[1] + t * t * b[1]]
    })
  const ellipse = (s: number, y: number, rs: number, ry: number, color: string) => fill(Array.from({ length: 40 }, (_, i) => [s + Math.cos((i / 40) * Math.PI * 2) * rs, y + Math.sin((i / 40) * Math.PI * 2) * ry]), color)
  const TOP = 2
  const BOT = -2

  // The white body, then the purple front back to the swoosh.
  c.fillStyle = WHITE
  c.fillRect(0, 0, W, H / 2)
  /** The swoosh's front edge: from the belly under the wing up over the back, `d` meters further back. */
  const swoosh = (d: number) => curve([5.6 + d, BOT], [6.6 + d, 0.1], [9.0 + d, TOP])
  const band = (d0: number, d1: number, color: string) => fill([...swoosh(d0), ...swoosh(d1).reverse()], color)
  fill([[-1, TOP], [-1, BOT], ...swoosh(0)], PURPLE)
  band(0, 0.5, MAGENTA)
  band(0.5, 1.0, GOLD)
  band(1.0, 1.15, PURPLE)

  // The tail feathers: three long pointed flicks low on the back, purple, pink and gold.
  const feather = (s0: number, y0: number, len: number, w: number, color: string) => fill([...curve([s0, y0], [s0 + len * 0.45, y0 + w * 1.4], [s0 + len, y0 + w * 1.6]), ...curve([s0 + len, y0 + w * 1.6], [s0 + len * 0.5, y0 - w * 0.2], [s0 + len * 0.1, y0 - w])], color)
  feather(9.8, -1.2, 3.2, 0.32, PURPLE)
  feather(10.6, -1.0, 2.8, 0.26, MAGENTA)
  feather(11.4, -0.85, 2.3, 0.2, GOLD)

  // The beak: the upper beak gold, pointed back at the corner of its smile; the lower beak orange; a dark smile line.
  fill([[-1, TOP], ...curve([0.85, TOP], [1.05, 0.4], [1.75, -0.32]), ...curve([1.75, -0.32], [1.2, -0.9], [1.0, BOT]), [-1, BOT]], BEAK)
  fill([[-1, -0.32], ...curve([0, -0.38], [0.9, -0.28], [1.75, -0.32]), ...curve([1.75, -0.32], [1.2, -0.9], [1.0, BOT]), [-1, BOT]], BEAK_LOW)
  fill([...curve([0.05, -0.32], [0.9, -0.22], [1.78, -0.3]), ...curve([1.78, -0.36], [0.9, -0.32], [0.05, -0.4])], DARK)
  ellipse(1.72, -0.24, 0.12, 0.12, MAGENTA)

  // The cockpit windows, and a big friendly eye behind the beak.
  fill(dense([[1.2, 0.55], [2.1, 0.62], [2.05, 0.92], [1.35, 0.85]], 6), DARK)
  fill(dense([[1.62, 0.6], [1.68, 0.6], [1.62, 0.9], [1.56, 0.9]], 4), PURPLE)
  ellipse(2.15, 0.08, 0.36, 0.4, '#FFFFFF')
  ellipse(2.08, 0.04, 0.22, 0.26, DARK)
  ellipse(2.0, 0.14, 0.07, 0.08, '#FFFFFF')

  // The doorway behind the door (it shows when the door swings open), and the round windows along the side.
  const ds = 3.3
  fill(dense([[ds - 0.48, -0.85], [ds + 0.48, -0.85], [ds + 0.48, 0.82], [ds - 0.48, 0.82]], 8), '#3B3352')
  for (let i = 0; i < 16; i++) {
    const s = 4.3 + i * 0.62
    if (s > LEN - TAIL + 0.6) break
    ellipse(s, 0.42, 0.17, 0.21, DARK)
    ellipse(s, 0.42, 0.12, 0.15, '#A8DCFF')
  }

  // Both sides: the panel as is for the -z side (u 0.5..1, flipped by the texture's y), mirrored for the +z side.
  const out = document.createElement('canvas')
  out.width = W
  out.height = H
  const o = out.getContext('2d')!
  o.drawImage(panel, 0, 0)
  o.save()
  o.translate(0, H)
  o.scale(1, -1)
  o.drawImage(panel, 0, 0)
  o.restore()
  const tex = new CanvasTexture(out)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

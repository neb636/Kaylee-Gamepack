// The alpaca rig's fleece: many round puffs she can brush and snip one at a time. Luna, Paco and Abuela Killa share
// one body (viewBox 600 x 640, standing on the ground at y = 620, body facing right, face turned to the viewer), so the
// puffs, the hat spot and the hit tests are the same numbers for all three.

export type Zone = 'body' | 'belly' | 'neck' | 'leg' | 'tail' | 'top' | 'bang'

export interface Puff {
  id: number
  x: number
  y: number
  r: number
  zone: Zone
  /** Angle of the messy curl drawn on an unbrushed puff (degrees). */
  curl: number
}

export const VIEW = { w: 600, h: 640, feetY: 620 }
/** The head's own little SVG (it rotates as a separate layer, so the big body only repaints when a puff changes). */
export const HEAD_BOX = { x: 330, y: -30, w: 250, h: 290 }
/** Where the head turns on the neck. */
export const NECK_PIVOT = { x: 455, y: 215 }
/** Middle of the head (where a hat goes and where a dropped hat counts as "on"). */
export const HAT_SPOT = { x: 455, y: 95 }
/** Middle of the fleecy body, for aiming flying wool and tool hints. */
export const BODY_MID = { x: 290, y: 380 }

/** Where the legs stand (the far pair is drawn behind the body, a little darker). */
export const FAR_LEGS = [168, 372]
export const NEAR_LEGS = [204, 408]

/** A small seeded random generator, so every alpaca's fleece looks the same each time it's drawn. */
function prng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Distance from point p to segment ab. */
function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax
  const dy = by - ay
  const k = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (ax + dx * k), py - (ay + dy * k))
}

export function makeFleece(seed: number, bangs: boolean): Puff[] {
  const rnd = prng(seed)
  const puffs: Puff[] = []
  const add = (x: number, y: number, r: number, zone: Zone) => puffs.push({ id: puffs.length, x, y, r, zone, curl: rnd() * 360 })
  const jitter = () => (rnd() - 0.5) * 9

  // Tail first (drawn under the body), then legs, body, neck, and the head's topknot last (on top of the face).
  add(92, 350, 24, 'tail')
  add(74, 372, 22, 'tail')
  add(90, 394, 21, 'tail')
  // Fluffy upper legs ("leg warmers"): overlapping clumps that taper toward the knee.
  for (const x of FAR_LEGS) {
    add(x + 2, 490, 23, 'leg')
    add(x + 1, 518, 20, 'leg')
  }
  for (const x of NEAR_LEGS) {
    add(x, 494, 25, 'leg')
    add(x - 1, 522, 22, 'leg')
    add(x, 546, 19, 'leg')
  }

  // Body: a hex grid inside an ellipse, nudged a little so it looks woolly rather than tiled.
  const cx = 272
  const cy = 392
  const rx = 166
  const ry = 92
  for (let row = 0, y = cy - ry; y <= cy + ry + 1; row++, y += 31) {
    for (let x = cx - rx + (row % 2 ? 18 : 0); x <= cx + rx + 1; x += 36) {
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1.04) continue
      const py = y + jitter()
      add(x + jitter(), py, 26 + rnd() * 6, py > 450 ? 'belly' : 'body')
    }
  }

  // Neck: a thick, nearly upright capsule from the chest up to the jaw (alpacas carry their heads high).
  const a = { x: 404, y: 346 }
  const b = { x: 452, y: 214 }
  for (let row = 0, y = 190; y <= 380; row++, y += 30) {
    for (let x = 336 + (row % 2 ? 17 : 0); x <= 520; x += 34) {
      if (segDist(x, y, a.x, a.y, b.x, b.y) > 44) continue
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 0.8) continue
      add(x + jitter(), y + jitter(), 25 + rnd() * 5, 'neck')
    }
  }

  // The topknot on her head, and (Luna only) the long bangs over her eyes.
  for (const [x, y, r] of [
    [424, 100, 22],
    [455, 94, 24],
    [486, 100, 22],
    [438, 70, 23],
    [472, 70, 23],
  ]) add(x, y, r, 'top')
  if (bangs) for (const [x, y, r] of [
    [424, 132, 22],
    [455, 128, 24],
    [486, 132, 22],
  ]) add(x, y, r, 'bang')
  return puffs
}

/** The fluffy hood framing the face (part of the head drawing, never clipped): a ring over the top and down the cheeks. */
export function makeHood(seed: number): Puff[] {
  const rnd = prng(seed + 101)
  const out: Puff[] = []
  for (let k = 0; k <= 10; k++) {
    const th = ((-32 + k * 24.4) * Math.PI) / 180
    const r = 23 + rnd() * 5 + (k === 0 || k === 10 ? 4 : 0)
    out.push({ id: -1 - k, x: 455 + Math.cos(th) * 70, y: 154 - Math.sin(th) * 76, r, zone: 'top', curl: rnd() * 360 })
  }
  return out
}

/** Puffs that count for "how much is clipped" (the topknot and bangs are extras). */
export const isMain = (p: Puff) => p.zone !== 'top' && p.zone !== 'bang'

/** A closed outline with little woolly bumps along every edge (the short fleece left after a haircut). */
export function scallopPath(pts: [number, number][], bump = 7, step = 24) {
  // Signed area tells which side is "outside".
  let area = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    area += x1 * y2 - x2 * y1
  }
  const out = area > 0 ? 1 : -1
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    const len = Math.hypot(x2 - x1, y2 - y1)
    const n = Math.max(1, Math.round(len / step))
    const nx = (out * (y2 - y1)) / len
    const ny = (out * -(x2 - x1)) / len
    for (let k = 0; k < n; k++) {
      const ax = x1 + ((x2 - x1) * k) / n
      const ay = y1 + ((y2 - y1) * k) / n
      const bx = x1 + ((x2 - x1) * (k + 1)) / n
      const by = y1 + ((y2 - y1) * (k + 1)) / n
      d += `Q${((ax + bx) / 2 + nx * bump * 2).toFixed(1)} ${((ay + by) / 2 + ny * bump * 2).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`
    }
  }
  return `${d}Z`
}

const ellipsePts = (cx: number, cy: number, rx: number, ry: number, n: number) => Array.from({ length: n }, (_, i) => [cx + rx * Math.cos((i / n) * Math.PI * 2), cy + ry * Math.sin((i / n) * Math.PI * 2)] as [number, number])

/** The shorn body and neck (what shows as the fleece comes off). */
export const SHORN_BODY = scallopPath(ellipsePts(272, 398, 158, 84, 28), 5)
export const SHORN_NECK = scallopPath(
  [
    [346, 392],
    [368, 300],
    [396, 226],
    [420, 204],
    [456, 196],
    [490, 212],
    [474, 300],
    [452, 400],
  ],
  5,
)

/** Short fleece on an upper leg (what's left after the leg clumps are clipped). */
export const shornLeg = (x: number) =>
  scallopPath(
    [
      [x - 19, 446],
      [x + 19, 446],
      [x + 16, 540],
      [x - 16, 540],
    ],
    4,
    18,
  )

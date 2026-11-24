// The alpaca rig's fleece: many round puffs she can brush and snip one at a time. Luna, Paco and Abuela Killa share
// one body (viewBox 600 x 640, standing on the ground at y = 620, body facing right, face turned to the viewer), so the
// puffs, the hat spot and the hit tests are the same numbers for all three. Also the woolly outlines (`fluff`) that the
// alpacas and Tika's llamas (Tika.tsx) are both drawn with.

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
    [420, 92, 22],
    [455, 86, 25],
    [490, 92, 22],
    [437, 62, 22],
    [473, 62, 22],
  ]) add(x, y, r, 'top')
  if (bangs) for (const [x, y, r] of [
    [413, 138, 24],
    [455, 134, 27],
    [497, 138, 24],
  ]) add(x, y, r, 'bang')
  return puffs
}

/** Puffs that count for "how much is clipped" (the topknot and bangs are extras). */
export const isMain = (p: Puff) => p.zone !== 'top' && p.zone !== 'bang'

/** A woolly outline: arcs that bulge outward between points listed clockwise (on screen). */
export function fluff(pts: [number, number][], bulge = 1.05) {
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i <= pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i % pts.length]
    const r = Math.hypot(x1 - x0, y1 - y0) * bulge
    d += `A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x1} ${y1}`
  }
  return d + 'Z'
}

/** Points around an ellipse, clockwise on screen. */
export function ring(cx: number, cy: number, rx: number, ry: number, n: number, turn = 0): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = ((turn + (360 * i) / n) * Math.PI) / 180
    out.push([Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry)])
  }
  return out
}

/** The shorn body, neck and tail (the short fleece that shows as the long fleece comes off). */
export const SHORN_BODY = fluff(ring(272, 404, 160, 96, 18, 9), 0.9)
export const SHORN_NECK = fluff([[352, 396], [362, 318], [386, 240], [420, 206], [490, 206], [506, 250], [488, 320], [462, 404]], 0.8)
export const SHORN_TAIL = fluff(ring(102, 372, 26, 24, 7), 0.8)

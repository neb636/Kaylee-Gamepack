// Emperor Huddle's stages, starting huddles and where a finger picks a penguin up. Plain TypeScript (no React). The
// penguins themselves are the puppets (puppets/Emperor.tsx, Pebble.tsx): a dad stands on (0, 0) about 225 units tall,
// facing right, Pebble about 100.
//
// One camera for the whole scene: a straight-on side view of the ice at night, the penguins standing on it. They stand
// on a strip of ice in front of the horizon, and a penguin's ground spot is (x, y): x across, y down the screen for
// "nearer to her" (further back is higher up and a little smaller). The huddle packs as circles on the ice, so depth is
// squashed by DEPTH: two penguins one behind the other touch when their y differ by less than 2R x DEPTH.

/** How much the ice's depth is squashed on screen (a penguin's round footprint is DEPTH as tall as it is wide). */
export const DEPTH = 0.45
/** A grown penguin's footprint radius at scale 1, stage units. */
export const RADIUS = 58

/** The stage: one for wide screens, one for tall, in stage units. Nothing that matters leaves it. */
export interface StageDef {
  w: number
  h: number
  /** The horizon: night sky above, the ice below. */
  horizon: number
  /** Where penguins can stand (feet), stage units. */
  field: { l: number; r: number; t: number; b: number }
  /** The penguins' size at the back of the field (they grow 24% toward the front). */
  base: number
  /** The middle of the huddle. */
  home: [number, number]
  moon: [number, number]
  /** Where the sun comes up over the horizon. */
  sunX: number
}

export const WIDE: StageDef = {
  w: 1600,
  h: 1000,
  horizon: 520,
  field: { l: 150, r: 1450, t: 660, b: 900 },
  base: 1.2,
  home: [800, 770],
  moon: [300, 190],
  sunX: 1240,
}

export const TALL: StageDef = {
  w: 1000,
  h: 1500,
  horizon: 800,
  field: { l: 90, r: 910, t: 1000, b: 1300 },
  base: 1.15,
  home: [500, 1150],
  moon: [210, 380],
  sunX: 760,
}

/** A penguin's size where it stands. */
export const scaleAt = (st: StageDef, y: number) => st.base * (0.88 + (0.24 * (y - st.field.t)) / (st.field.b - st.field.t))

/** A dad's starting spot, relative to the huddle's middle for wind from the left (mirrored for wind from the right),
 *  in units of RADIUS (x) and RADIUS x DEPTH (y), and how warm he starts. */
export interface Start {
  dx: number
  dy: number
  warm: number
}

/** Five dads: four in a little huddle, one alone on the windy edge, shivering. */
export const SMALL: Start[] = [
  { dx: -5.6, dy: 0.2, warm: 0.15 },
  { dx: -0.9, dy: -1, warm: 0.5 },
  { dx: -1, dy: 1.1, warm: 0.55 },
  { dx: 1, dy: -0.2, warm: 1 },
  { dx: 1.1, dy: 1.9, warm: 1 },
]
/** The two who join when the blizzard comes (they waddle in from the dark on the side away from the wind). */
export const LATE: Start[] = [
  { dx: 3, dy: -1.4, warm: 0.9 },
  { dx: 3, dy: 1.2, warm: 0.9 },
]
/** Seven dads in a bigger huddle, the windward pair already chilly. */
export const BIG: Start[] = [
  { dx: -2, dy: -0.9, warm: 0.4 },
  { dx: -2.1, dy: 1.1, warm: 0.45 },
  { dx: 0, dy: -2, warm: 1 },
  { dx: -0.1, dy: 0.1, warm: 1 },
  { dx: 0, dy: 2.1, warm: 1 },
  { dx: 2, dy: -1, warm: 1 },
  { dx: 2, dy: 1.1, warm: 1 },
]
/** The hatch: Pebble's papa (the first) out on the windy edge, the rest huddled. */
export const HATCH: Start[] = [
  { dx: -4.6, dy: 0.3, warm: 0.2 },
  { dx: -1, dy: -1.6, warm: 0.7 },
  { dx: -1.1, dy: 1.4, warm: 0.75 },
  { dx: 0.9, dy: -0.4, warm: 1 },
  { dx: 1, dy: 2.4, warm: 1 },
  { dx: 2.6, dy: -1.6, warm: 1 },
  { dx: 2.8, dy: 1.2, warm: 1 },
]
/** Everyone huddled and warm, Pebble's papa (the first) at the front (the sunrise, and a hatched chick). */
export const SNUG: Start[] = [
  { dx: 0, dy: 2.4, warm: 1 },
  { dx: -2, dy: -0.9, warm: 0.85 },
  { dx: -2.1, dy: 1.1, warm: 0.85 },
  { dx: 0, dy: -2, warm: 1 },
  { dx: -0.1, dy: 0.2, warm: 1 },
  { dx: 2, dy: -1, warm: 1 },
  { dx: 2, dy: 1.1, warm: 1 },
]

function inEllipse(x: number, y: number, [cx, cy, rx, ry, rot = 0]: [number, number, number, number, number?]) {
  const a = (-rot * Math.PI) / 180
  const dx = x - cx
  const dy = y - cy
  const u = dx * Math.cos(a) - dy * Math.sin(a)
  const v = dx * Math.sin(a) + dy * Math.cos(a)
  return (u * u) / (rx * rx) + (v * v) / (ry * ry) <= 1
}

/** A finger at local (x, y) on a dad (with `pad` local units to spare, so a little finger still gets him). */
export const onDad = (x: number, y: number, pad: number) => inEllipse(x, y, [6, -112, 56 + pad, 120 + pad])
export const onChick = (x: number, y: number, pad: number) => inEllipse(x, y, [4, -50, 34 + pad, 56 + pad])

// The team's skate hut beside the canal at the rink (canada-round-2.md in git history, "The Team Cabin"):
// tap it and the Team Cabin opens, where she dresses the friends who have joined. A little log cabin on a snowy pad: a
// pitched roof with snow on it, a stone chimney that puffs smoke, a door that swings open on a warm light, a window
// whose light flickers, pink-and-white bunting under the eaves, a red maple leaf on the gable, the team's pink scarf on
// a peg and two pink sticks leaning by the door, so it reads as theirs. Built at map scale in the rink's own space
// (places.ts puts it there): one merged mesh for what stands still, small groups for what moves.
import { Group, Vector3 } from 'three'
import { bell, clamp } from '../../../../sdk'
import type { Bag } from '../../../engine3d/dispose'
import { blobShadow, merge, P, solid, solidMix } from '../../../engine3d/geo'
import { CANADA_COLORS } from '../characters/looks'
import { leafGeo } from '../story/props'

const SNOW = '#FFFFFF'
const SNOW_SHADE = '#EEF1FF'
const LOG = '#C08856'
const LOG_DARK = '#9A6540'
const LOG_END = '#E2B57E'
const ROOF = '#D9606A'
const STONE = '#C9C2D8'
const STONE_DARK = '#ADA5C2'
const DOOR = '#8A5A3C'
const WARM = '#FFD98A'
const PINK = CANADA_COLORS.scarf

/** The hut's size (its own space, before the rink's scale): walls `W` across, `D` deep, `H` to the eaves, the ridge
 *  `R` above that, standing on a footing `B` high. */
const W = 0.56
const D = 0.44
const H = 0.36
const R = 0.24
const B = 0.1
/** How often the hut invites her (s). */
const INVITE_S = 4

export interface Hut {
  root: Group
  /** The middle of the hut (its own space), for its tap target. */
  aim: Vector3
  /** Seconds since she tapped it (-1: idle). */
  t: number
  /** She tapped it: it hops, the door swings open, the chimney puffs. */
  tap(): void
  /** Nobody has been dressed yet (or she's been still a while): every few seconds the hut gives a little hop and its
   *  door peeks open on the warm light inside, so the first time she sees it, it asks to be tapped. */
  invite: boolean
  update(dt: number, t: number): void
}

/** Where the roof's slope is at `x` across (its height above the footing). */
const roofAt = (x: number) => H + R * (1 - Math.abs(x) / (W / 2))

export function buildHut(bag: Bag): Hut {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const parts = [
    // The snowy pad it stands on and a stone footing.
    P.cyl(0.46, 0.48, 0.06, SNOW, { at: [0, 0.03, 0.02], scale: [1.12, 1, 1] }, 24),
    P.rbox(W + 0.05, B - 0.04, D + 0.05, 0.02, STONE, { at: [0, 0.06 + (B - 0.06) / 2, 0] }),
    // The walls: one log-brown house shape (a gable at the front and back), so the roof sits exactly on it.
    P.prism([[-W / 2, 0], [W / 2, 0], [W / 2, H], [0, H + R], [-W / 2, H]], D, LOG, { at: [0, B, 0] }),
  ]
  // The logs: a groove between each on the side walls and below the eaves at the front, and their round ends poking
  // out at the front corners.
  for (let i = 1; i < 5; i++) {
    const y = B + (H * i) / 5
    for (const s of [-1, 1]) parts.push(P.box(0.006, 0.012, D - 0.01, LOG_DARK, { at: [s * (W / 2 + 0.002), y, 0] }))
    parts.push(P.box(0.06, 0.012, 0.006, LOG_DARK, { at: [-W / 2 + 0.03, y, D / 2 + 0.002] }), P.box(0.06, 0.012, 0.006, LOG_DARK, { at: [W / 2 - 0.03, y, D / 2 + 0.002] }))
    // (The back wall is logs all the way across: seen from behind it's a log cabin too, not a flat board.)
    parts.push(P.box(W - 0.01, 0.012, 0.006, LOG_DARK, { at: [0, y, -D / 2 - 0.002] }))
  }
  for (let i = 0; i < 5; i++) {
    const y = B + (H * (i + 0.5)) / 5
    for (const s of [-1, 1]) for (const f of [-1, 1]) parts.push(P.cyl(0.032, 0.032, 0.05, LOG_END, { at: [s * (W / 2 - 0.005), y, f * (D / 2 + 0.02)], rot: [Math.PI / 2, 0, 0] }, 10))
  }
  // The roof: two slabs resting on the slopes, meeting at the ridge, overhanging the eaves and the gables; snow on
  // their upper part and a snowy ridge.
  const t = 0.045
  const over = 0.07
  const L = Math.hypot(W / 2, R)
  const a = Math.atan2(R, W / 2)
  for (const s of [-1, 1]) {
    const ex = (s * W) / 2
    const dx = -ex / L
    const dy = R / L
    const nx = (s * R) / L
    const ny = W / 2 / L
    const along = (L - over + t * 0.6) / 2
    parts.push(P.rbox(L + over + t * 0.6, t, D + 0.12, 0.012, ROOF, { at: [ex + dx * along + nx * (t / 2), B + H + dy * along + ny * (t / 2), 0], rot: [0, 0, -s * a] }))
    // (The snow: the top two thirds of the slab, a little narrower, lying on it.)
    const sl = L * 0.72
    const sa = L - sl / 2 + t * 0.3
    parts.push(P.rbox(sl, 0.03, D + 0.08, 0.014, SNOW, { at: [ex + dx * sa + nx * (t + 0.012), B + H + dy * sa + ny * (t + 0.012), 0], rot: [0, 0, -s * a] }))
  }
  parts.push(P.cyl(0.03, 0.03, D + 0.1, SNOW, { at: [0, B + H + R + t * 1.1, 0], rot: [Math.PI / 2, 0, 0] }, 10))
  // The chimney, standing up through the right slope near the back, a cap of snow on it.
  const cx = 0.14
  const cz = -0.08
  const cBase = B + roofAt(cx)
  parts.push(P.rbox(0.09, 0.26, 0.09, 0.012, STONE, { at: [cx, cBase + 0.09, cz] }), P.rbox(0.11, 0.025, 0.11, 0.008, STONE_DARK, { at: [cx, cBase + 0.225, cz] }), P.rbox(0.1, 0.02, 0.1, 0.01, SNOW, { at: [cx, cBase + 0.245, cz] }))
  // The door's frame and the window's frame, its four panes' cross, its snowy sill.
  const dx0 = -0.1
  const dw = 0.14
  const dh = 0.24
  const fz = D / 2
  for (const s of [-1, 1]) parts.push(P.rbox(0.02, dh + 0.02, 0.02, 0.006, LOG_DARK, { at: [dx0 + s * (dw / 2 + 0.01), B + (dh + 0.02) / 2, fz + 0.006] }))
  parts.push(P.rbox(dw + 0.06, 0.022, 0.022, 0.006, LOG_DARK, { at: [dx0, B + dh + 0.012, fz + 0.006] }))
  const wx = 0.135
  const wy = B + 0.2
  parts.push(P.rbox(0.15, 0.14, 0.02, 0.008, SNOW, { at: [wx, wy, fz + 0.004] }), P.rbox(0.17, 0.025, 0.05, 0.01, SNOW_SHADE, { at: [wx, wy - 0.075, fz + 0.02] }))
  // The red maple leaf on a round white board high on the gable.
  parts.push(P.cyl(0.065, 0.065, 0.016, SNOW, { at: [0, B + H + 0.085, fz + 0.008], rot: [Math.PI / 2, 0, 0] }, 20))
  parts.push(leafGeo(0.1).translate(0, B + H + 0.085, fz + 0.02))
  // Pink-and-white bunting on a string under the eaves.
  parts.push(P.cyl(0.004, 0.004, W + 0.02, '#8A5A3C', { at: [0, B + H - 0.012, fz + 0.03], rot: [0, 0, Math.PI / 2] }, 4))
  for (let i = 0; i < 6; i++) {
    const x = -W / 2 + 0.06 + i * ((W - 0.12) / 5)
    parts.push(P.prism([[-0.03, 0], [0.03, 0], [0, -0.065]], 0.01, i % 2 ? SNOW : PINK, { at: [x, B + H - 0.012, fz + 0.03] }))
  }
  // A snowbank at the right front corner, two pink hockey sticks stuck in it, leaning on the wall.
  for (const [x, lean] of [[0.235, 0.14], [0.27, -0.1]] as const) {
    parts.push(P.cyl(0.009, 0.009, 0.32, '#E9D3A6', { at: [x, 0.22, fz + 0.03], rot: [-0.1, 0, lean] }, 6))
    parts.push(P.rbox(0.03, 0.06, 0.016, 0.006, PINK, { at: [x - Math.sin(lean) * 0.15, 0.37, fz + 0.015], rot: [-0.1, 0, lean] }))
  }
  parts.push(P.sphere(0.13, SNOW_SHADE, { at: [W / 2 + 0.05, 0.05, fz - 0.06], scale: [1.1, 0.55, 1] }, 12), P.sphere(0.08, SNOW, { at: [W / 2 + 0.1, 0.05, fz + 0.05], scale: [1, 0.6, 1] }, 10))
  body.add(solid(merge(parts), bag, 1.4))

  // The window's light: a warm pane and a brighter one that flickers over it, like a fire inside.
  const pane = (c: string, z: number) => solidMix([], [P.box(0.11, 0.1, 0.01, c, { at: [wx, wy, fz + 0.012 + z] }), P.box(0.012, 0.1, 0.012, SNOW, { at: [wx, wy, fz + 0.019 + z] }), P.box(0.11, 0.012, 0.012, SNOW, { at: [wx, wy, fz + 0.019 + z] })], bag, 0)
  const dim = pane('#FFC66B', 0)
  const bright = pane('#FFE9A8', 0.004)
  body.add(dim, bright)
  // The doorway's warm light, behind the door.
  body.add(solidMix([], [P.box(dw - 0.006, dh - 0.004, 0.006, WARM, { at: [dx0, B + dh / 2, fz + 0.004] })], bag, 0))
  // The door, on its hinge at its left edge: planks, a gold knob, a little pink heart.
  const door = new Group()
  door.position.set(dx0 - dw / 2, B, fz + 0.016)
  door.add(
    solid(
      merge([
        P.rbox(dw, dh, 0.022, 0.008, DOOR, { at: [dw / 2, dh / 2, 0] }),
        ...[1, 2].map((i) => P.box(0.005, dh - 0.03, 0.006, '#6E4630', { at: [(dw * i) / 3, dh / 2, 0.012] })),
        P.sphere(0.012, '#FFC83D', { at: [dw - 0.025, dh * 0.47, 0.016] }, 8),
        P.sphere(0.018, PINK, { at: [dw / 2 - 0.009, dh * 0.74, 0.014], scale: [1, 1, 0.4] }, 8),
        P.sphere(0.018, PINK, { at: [dw / 2 + 0.009, dh * 0.74, 0.014], scale: [1, 1, 0.4] }, 8),
        P.cone(0.022, 0.03, PINK, { at: [dw / 2, dh * 0.74 - 0.02, 0.014], rot: [0, 0, Math.PI], scale: [1.15, 1, 0.4] }, 8),
      ]),
      bag,
      1.2,
    ),
  )
  body.add(door)
  // The team's pink scarf on a peg under the window: it sways in the breeze.
  const scarf = new Group()
  scarf.position.set(wx, wy - 0.1, fz + 0.03)
  scarf.add(
    solid(
      merge([
        P.cyl(0.008, 0.008, 0.03, LOG_DARK, { at: [0, 0, -0.012], rot: [Math.PI / 2, 0, 0] }, 5),
        P.rbox(0.07, 0.02, 0.02, 0.008, PINK, { at: [0, -0.005, 0.005] }),
        P.rbox(0.032, 0.13, 0.014, 0.006, PINK, { at: [-0.02, -0.07, 0.01], rot: [0, 0, 0.06] }),
        P.rbox(0.032, 0.11, 0.014, 0.006, PINK, { at: [0.022, -0.06, 0.012], rot: [0, 0, -0.08] }),
        P.box(0.034, 0.012, 0.016, SNOW, { at: [-0.024, -0.1, 0.012], rot: [0, 0, 0.06] }),
        P.box(0.034, 0.012, 0.016, SNOW, { at: [0.025, -0.085, 0.014], rot: [0, 0, -0.08] }),
      ]),
      bag,
      1.1,
    ),
  )
  body.add(scarf)
  root.add(blobShadow(0.4, bag))

  // Smoke from the chimney: soft white puffs that rise, grow and melt away.
  const puffs: { g: Group; t: number }[] = []
  for (let i = 0; i < 4; i++) {
    const g = solidMix([], [P.sphere(0.04, '#FFFFFF', {}, 10), P.sphere(0.028, '#F4F1FA', { at: [0.03, 0.012, 0.01] }, 8), P.sphere(0.024, '#F4F1FA', { at: [-0.026, 0.008, -0.01] }, 8)], bag, 0)
    body.add(g)
    puffs.push({ g, t: i / 4 })
  }
  const top = new Vector3(cx, cBase + 0.27, cz)

  let flick = 0
  let next = 0
  let inviteT = 0
  const hut: Hut = {
    root,
    aim: new Vector3(0, B + 0.25, 0),
    t: -1,
    invite: false,
    tap() {
      hut.t = 0
    },
    update(dt, time) {
      // A tap: a squashy hop, the door swings out and stays open on the warm light, the chimney puffs fast.
      if (hut.t >= 0) hut.t += dt
      // Inviting: every 4 s a small hop, and the door peeks open and shut.
      if (hut.invite && hut.t < 0) inviteT = (inviteT + dt) % INVITE_S
      else inviteT = 0
      const peek = hut.t < 0 && hut.invite ? bell(clamp((inviteT - 0.2) / 1.1)) : 0
      const hop = hut.t >= 0 ? bell(clamp(hut.t / 0.45)) : hut.invite ? 0.55 * bell(clamp(inviteT / 0.4)) : 0
      body.scale.set(1 + hop * 0.1, 1 - hop * 0.08, 1 + hop * 0.1)
      body.position.y = hop * 0.05
      const open = hut.t >= 0 ? clamp((hut.t - 0.05) / 0.35) : 0
      door.rotation.y = -1.75 * (open * open * (3 - 2 * open)) - 0.75 * peek + (hut.t >= 0 ? Math.sin(hut.t * 18) * 0.06 * (1 - clamp(hut.t / 0.8)) : 0)
      // The firelight flickers.
      if (time >= next) {
        flick = Math.random()
        next = time + 0.08 + Math.random() * 0.22
      }
      bright.visible = flick > 0.3 || open > 0.5 || peek > 0.3
      scarf.rotation.z = Math.sin(time * 1.6) * 0.08 + Math.sin(time * 3.1) * 0.03
      // Smoke: each puff goes up from the chimney top in turn, drifting with the breeze.
      const speed = hut.t >= 0 && hut.t < 1.2 ? 2.6 : 1
      for (const p of puffs) {
        p.t = (p.t + (dt * speed) / 2.6) % 1
        const u = p.t
        p.g.position.set(top.x + u * 0.12 + Math.sin(u * 6 + time) * 0.015, top.y + u * 0.42, top.z - u * 0.04)
        p.g.scale.setScalar(Math.max(0.001, (0.45 + u * 1.1) * Math.min(1, u / 0.12, (1 - u) / 0.3)))
      }
    },
  }
  return hut
}

// The film set for the canoe chapter (story/films/canoe.ts): Moraine Lake in Banff, the very lake the game is played on
// (activities/canoe/: the same shore, peaks, glacier, dock and rock pile from shore.ts, the same see-through water from
// engine3d/water.ts over the mountains' reflection, the same red canoe with Maple in the stern from boat.ts). The dock is
// at the south end (+z), the glacier comes down to the water at the north end (-z): lake.ts has where everything is.
//
// The films move the canoe with `boat` (where it is, which way it faces, how fast it glides, whether Maple paddles) and
// direct Lulu and her chick from the cast (s.cast.lulu, s.cast.chick). Maple here is the canoe's own (she talks with her
// voice like the cast's Maple); `mapleHead()` is where her face is, for a shot.
import { Color, Vector3, type Group } from 'three'
import { swell, Water } from '../../../../engine3d/water'
import { Canoe, SEAT_Z } from '../../activities/canoe/boat'
import { LAKE_DULL, LAKE_GLOW } from '../../activities/canoe/lake'
import { buildShore, mirror, SKY } from '../../activities/canoe/shore'
import { snd } from '../../activities/canoe/sounds'
import type { FilmSet } from '../stage'

export interface LakeSet {
  canoe: Canoe
  /** The canoe on the water: where, which way its bow points (radians, 0 = +z, π = toward the glacier), how fast it
   *  glides forward (m/s), whether Maple paddles, and what she looks at (or null: ahead). */
  boat: { x: number; z: number; h: number; speed: number; paddling: boolean; look: Vector3 | null }
  /** The lake's color: 0 the morning blue, 1 glowing turquoise (when Lulu is found). */
  glow(k: number): void
  /** Where Maple's face is (a shot's look point). */
  mapleHead(out?: Vector3): Vector3
}

const tmp = new Vector3()
const c1 = new Color()
const c2 = new Color()

export const LAKE: FilmSet<LakeSet> = {
  id: 'canoe',
  look: { sky: ['#8CC8F7', '#C4E8FA', '#E6F5F2'], fog: [SKY, 160, 820], clouds: true },
  build(s, root) {
    const shore = buildShore(s.bag)
    root.add(shore.land, shore.shallows, shore.flour, shore.logs, mirror(shore.land, s.bag))
    const water = new Water({ size: 1600, deep: LAKE_DULL[0], shallow: LAKE_DULL[1], haze: SKY, hazeNear: 130, hazeFar: 760, opacity: 0.62 }, s.bag)
    root.add(water.mesh)
    const canoe = new Canoe(s.bag)
    root.add(canoe.root)
    const boat = { x: 2.4, z: 45.4, h: Math.PI, speed: 0, paddling: false, look: null as Vector3 | null }
    const glow = (k: number) => water.setColors(c1.set(LAKE_DULL[0]).lerp(c2.set(LAKE_GLOW[0]), k), new Color(LAKE_DULL[1]).lerp(new Color(LAKE_GLOW[1]), k), SKY)
    glow(0.3)
    return {
      canoe,
      boat,
      glow,
      mapleHead: (out = new Vector3()) => canoe.rig.head.localToWorld(out.set(0, canoe.rig.face.headY, 0)),
      water,
      stream: shore.stream,
      phase: 0,
      blade: new Vector3(),
      wasIn: false,
    } as LakeSet & LakeLive
  },
  update(set, dt, t) {
    const live = set as LakeSet & LakeLive
    live.water.update(t)
    live.stream.update(t)
    const b = set.boat
    b.x += Math.sin(b.h) * b.speed * dt
    b.z += Math.cos(b.h) * b.speed * dt
    const root = set.canoe.root
    root.position.set(b.x, swell(b.x, b.z, t) * 0.5, b.z)
    root.rotation.y = b.h
    // Maple paddles by herself, side to side (as in the game: activities/canoe/paddle.ts strokes()).
    let blade: Vector3 | null = null
    if (b.paddling) {
      live.phase += dt * 1.1
      const q = live.phase % 1
      const side = Math.floor(live.phase) % 2 ? 1 : -1
      const inWater = q < 0.55
      if (inWater && !live.wasIn) snd.stroke()
      live.wasIn = inWater
      const along = inWater ? SEAT_Z + 1.3 - (q / 0.55) * 2.4 : SEAT_Z - 1.1 + ((q - 0.55) / 0.45) * 2.4
      blade = live.blade.set(-side * 0.82, inWater ? -0.16 : 0.32, along)
    }
    set.canoe.update(dt, t, { speed: b.speed, spin: 0, blade, look: b.look })
    void tmp
  },
}

/** The set's own moving parts (not for the films). */
interface LakeLive {
  water: Water
  stream: { update(t: number): void }
  phase: number
  blade: Vector3
  wasIn: boolean
}

export type { Group }

// Misty's Bubble Bath's two films (planning/around-the-world/canada-round-2.md): `bath-in` before the bath, `bath-out`
// after it (before the stamp). Lines: lines.ts `L.bath.filmIn` and `L.bath.filmOut`, in play order. The set is the
// rainforest river (story/sets/bath.ts), the same place as the game: the falls face the camera, the pool at their foot
// is where she has her bath, Maple's bank is on the left.
//
// In (about 14 s): the rainforest in the rain; somewhere here lives a bear as white as snow. On the right bank, a
// brown, mossy lump swings a paw at a jumping salmon: an enormous splash, no fish, and she slides down the bank on her
// tummy into the pool. Two eyes blink in all that mud. "Missed again!" Maple: a white bear? You're all brown! Misty
// looks down at herself: it's only mud, she needs a bath. Maple, right up to the camera: bath time!
// Out (about 12 s): Misty in the look she was given, her team sweater and all (story/cast.ts dresses her). Tiny Maple
// holds a hockey stick up to big Misty; one swing (side-on, so the wind-up and the whack both show) sends a pinecone up
// over the tallest cedar to a twinkle in the sky. Two faces looking up. She'll come: the team's scarf goes on.
import { Vector3 } from 'three'
import { cam, close } from '../../../../engine3d/shots'
import { muddyMisty } from '../../characters/mistyLook'
import { L } from '../../lines'
import { makeStick } from '../props'
import { BATH, FALLS_Z, RIVER, riverSfx as fx, TALLEST, TOP } from '../sets/bath'
import type { StoryFilm } from '../stage'

const X = L.bath.filmIn
const O = L.bath.filmOut
const lerp = (a: number, b: number, k: number) => a + (b - a) * Math.max(0, Math.min(1, k))

/** Where Maple stands on the left bank; the muddy lump on the right bank, by the big cedar. */
const MAPLE: [number, number] = [-2.55, -0.6]
const LUMP: [number, number] = [2.15, -0.55]
/** Misty's slap shot: how far back the stick goes (radians round her shoulder), and which way she faces at the whack
 *  (degrees: 90 is side-on, facing right). */
const WIND = 2.7
const STRIKE_YAW = 58

export const BATH_IN: StoryFilm = {
  id: 'bath-in',
  set: RIVER,
  music: 'story',
  beats(s) {
    const set = s.use(RIVER)
    const { maple, misty } = s.cast
    // Before her bath she is a brown, mossy lump (not the look she'll be given).
    muddyMisty(misty, s.bag)
    misty.scarf(false)
    maple.root.add(set.leaf)
    const [lx, lz] = LUMP
    /** Her swat at the salmon: up (a slow wind-up), the fast swat down, the settle. `t` seconds in. */
    const swat = (t: number, at: number) => {
      const up = (t - (at - 0.55)) / 0.5
      const down = (t - at) / 0.13
      misty.armsUp = t < at ? lerp(0, 1, up) : t < at + 0.6 ? lerp(1, 0.15, down) : lerp(0.15, 0, (t - at - 0.6) / 0.5)
      misty.lean = t < at ? lerp(0.45, -0.1, up) : t < at + 0.6 ? lerp(-0.1, 0.5, down) : 0.5
    }
    return [
      {
        // The rainforest in the rain, from up in the trees down to the river: Maple under her leaf; somewhere here, a
        // bear as white as snow (and on the far bank, a brown lump by the cedar).
        id: 'white',
        shot: cam([-1.2, 5.2, 10.5], [0, 1.2, -2.2], { eye: [-2.6, 1.4, 5.2], look: [-0.2, 0.75, -1.2] }, { ease: 'inOut', move: 2.6 }),
        say: X.white,
        sayAt: 0.3,
        hold: 0.2,
        start: () => {
          s.snow = 0.35
          maple.place(MAPLE[0], 0, MAPLE[1], 35)
          maple.armsUp = 0.2
          // The lump: hunched over on the bank, peering into the water.
          misty.place(lx, 0, lz, -70)
          misty.lean = 0.45
          misty.headTurn = 0.2
        },
        tick: (_k, t) => (misty.headTurn = Math.sin(t * 0.9) * 0.3),
        cues: [[2.4, () => fx.raven()]],
      },
      {
        // A salmon leaps; the lump winds up and SWATS: an enormous splash, and no fish. It sails right over her head.
        id: 'swat',
        shot: cam([0.4, 1.35, 3.0], [1.5, 0.75, -0.9], { eye: [0.55, 1.3, 2.7] }),
        dur: 2.4,
        start: () => {
          misty.headTurn = 0
          misty.place(lx, 0, lz, -70)
        },
        tick: (_k, t) => {
          swat(t, 0.78)
          if (t > 0.9 && t < 1.7) misty.headTurn = Math.sin((t - 0.9) * 8) * 0.3
        },
        cues: [
          [0.35, () => (set.leap(0, [lx - 0.75, 0, lz - 0.3], [lx - 0.95, TOP, FALLS_Z - 1.2], 1.15, 0.6), fx.leap(), s.splash(lx - 0.75, 0.05, lz - 0.3, 10), misty.pull('wow'))],
          [0.62, () => fx.swing()],
          [0.84, () => (set.bigSplash(lx - 0.8, lz - 0.2), fx.bigSplash(), s.splash(lx - 0.6, 0.1, lz - 0.1, 40), s.splash(lx - 1, 0.1, lz - 0.4, 24))],
          [1.9, () => misty.pull('sad')],
        ],
      },
      {
        // ...and she slides down the bank on her tummy, into the pool, splosh.
        id: 'slide',
        shot: cam([0.3, 1.1, 2.6], [1.0, 0.4, -1.3], { eye: [0.1, 1.0, 2.3], look: [0.5, 0.45, -1.5] }),
        dur: 1.6,
        start: () => {
          misty.armsUp = 0
          misty.slideTo(BATH.x + 0.3, BATH.z + 0.1, 1.1, -20)
        },
        cues: [[0.2, () => s.sfx.whoosh()], [1.05, () => (fx.bigSplash(), s.splash(BATH.x + 0.3, 0.1, BATH.z + 0.3, 30), (misty.lean = 0))]],
      },
      {
        // Two eyes blink in all that mud: missed again!
        id: 'miss',
        // (Aimed at her face, under the middle of her big head, from far enough back that her eyes and mouth both show.)
        shot: cam([BATH.x + 0.5, 1.0, BATH.z + 3.1], () => misty.head(tmp).add(off.set(0, -0.2, 0)), { eye: [BATH.x + 0.47, 0.97, BATH.z + 2.8] }, { fov: 34 }),
        say: X.miss,
        sayAt: 0.7,
        hold: 0.3,
        start: () => {
          misty.place(BATH.x + 0.3, BATH.y, BATH.z + 0.1, -10)
          misty.lean = 0
          misty.pull('sad')
          misty.shake()
        },
        cues: [[0.25, () => s.splash(BATH.x + 0.3, 1.2, BATH.z + 0.3, 8)]],
      },
      {
        // Maple, pointing from the bank: a white bear? You're all brown!
        id: 'brown',
        shot: cam([-1.15, 1.0, 2.6], [-1.0, 0.7, -0.9], { eye: [-1.05, 0.98, 2.3] }, { tall: { eye: [-1.0, 1.25, 4.4] } }),
        say: X.brown,
        sayAt: 0.25,
        hold: 0.3,
        start: () => {
          maple.place(-1.85, 0, -0.5, 55)
          maple.armsUp = 0.6
          maple.pull('wow')
          misty.cheer()
          misty.lean = 0
          misty.turnTo(-1.85, -0.5)
        },
        cues: [[0.6, () => maple.hop()]],
      },
      {
        // Misty looks down at herself: it's only mud. Oh dear. I need a bath.
        id: 'mud',
        shot: cam([BATH.x + 0.1, 0.95, BATH.z + 2.9], () => misty.head(tmp).add(off.set(0, -0.12, 0)), { eye: [BATH.x + 0.1, 0.92, BATH.z + 2.6] }),
        say: X.mud,
        sayAt: 0.3,
        hold: 0.3,
        start: () => {
          maple.armsUp = 0
          misty.turnTo(BATH.x + 0.3, BATH.z + 5)
          misty.lean = 0.1
          misty.pull('sad')
        },
        tick: (_k, t) => (misty.headTurn = t < 1.5 ? Math.sin(t * 3) * 0.25 : 0),
        cues: [[1.6, () => ((misty.lean = 0), misty.nod())]],
      },
      {
        // Maple, right up to the camera: bath time!
        id: 'bathTime',
        shot: close(maple, 0.05, 1.45, 0.12),
        say: X.bathTime,
        sayAt: 0.3,
        hold: 0.5,
        start: () => {
          misty.cheer()
          maple.root.remove(set.leaf)
          maple.place(-1.4, 0, -0.1, 10)
          maple.armsUp = 1
        },
        cues: [[0.3, () => (maple.hop(), maple.pull('happy'))], [1.0, () => (maple.armsUp = 0)]],
      },
    ]
  },
}

export const BATH_OUT: StoryFilm = {
  id: 'bath-out',
  set: RIVER,
  beats(s) {
    const set = s.use(RIVER)
    const { maple, misty } = s.cast
    // (Misty wears the look she was given: story/cast.ts dressed her when she was built.)
    const stick = makeStick(maple.height, s.bag)
    stick.visible = false
    maple.rig.armR.add(stick)
    // Misty's stick is in her LEFT paw (mirrored), so when she stands side-on to the camera facing right (+x), the
    // stick is on our side of her and the whole swing shows.
    const big = makeStick(misty.height, s.bag)
    big.scale.x = -1
    big.visible = false
    misty.rig.armL.add(big)
    const H = misty.height
    /** Where Misty stands on the left bank by the berry bushes; Maple beside her, so the size gap shows. */
    const ME: [number, number] = [-3.55, -0.05]
    const MA: [number, number] = [ME[0] - 1.05, ME[1] + 0.75]
    const from = new Vector3()
    const coneAt = (t: number, out: Vector3) => {
      const k = Math.max(0, t) / 1.9
      const e = 1 - (1 - Math.min(1, k)) ** 2
      const top = TALLEST.h + TOP + 2.5
      return out.set(lerp(from.x, TALLEST.x + 0.6, e), from.y + (top - from.y) * e + Math.max(0, k - 1) * 3, lerp(from.z, TALLEST.z - 1.2, e))
    }
    let coneT = -1
    let twinkled = false
    const conePos = new Vector3()
    const blade = new Vector3()
    let swingA = 0
    const swingPose = () => {
      misty.rig.armL.rotation.set(swingA, 0, -0.32)
      misty.rig.armR.rotation.set(swingA * 0.85, 0, 0.32)
    }
    /** Salmon leaping up the falls behind them, one after another (they're going home). */
    let leapN = -1
    const leaps = (t: number, every = 1.3) => {
      const i = Math.floor(t / every)
      if (i !== leapN && t > 0.2) {
        leapN = i
        const x = -0.8 + ((i * 0.73) % 1.6)
        set.leap(i % set.salmon.length, [x, 0, FALLS_Z + 1.4], [x + 0.2, TOP, FALLS_Z - 1.6], 1.05, 0.9)
      }
    }
    const two = cam([ME[0] - 0.35, 1.0, ME[1] + 4.5], [ME[0] - 0.3, 0.88, ME[1] + 0.1], undefined, { sway: 0.012, tall: { eye: [ME[0] - 0.4, 1.25, ME[1] + 6.4], look: [ME[0] - 0.3, 0.95, ME[1] + 0.1] } })
    const fly = (dt: number) => {
      if (coneT < 0) return
      coneT += dt
      set.cone.position.copy(coneAt(coneT, conePos))
      set.cone.rotation.x += dt * 14
      set.cone.scale.setScalar(Math.min(2.4, 1 + coneT * 2))
      if (coneT > 0.25 && Math.floor(coneT / 0.12) !== Math.floor((coneT - dt) / 0.12)) s.sparkle(conePos.x, conePos.y, conePos.z, 2)
      if (!twinkled && coneT >= 1.95) {
        twinkled = true
        s.sfx.glint()
        s.sparkle(conePos.x, conePos.y, conePos.z, 24)
        s.put(set.twinkle, conePos.x, conePos.y, conePos.z)
        set.cone.visible = false
      }
    }
    return [
      {
        // Tiny Maple hops in holding a hockey stick right up to big Misty (in her new look), who leans down to see.
        id: 'stick',
        shot: two,
        say: O.stick,
        sayAt: 0.3,
        hold: 0.2,
        start: () => {
          s.snow = 0.2
          misty.place(ME[0], 0, ME[1], -30)
          maple.place(MA[0] - 0.5, 0, MA[1] + 0.2, 60)
          maple.hopTo(MA[0], 0, MA[1], 0.4, 35)
          stick.visible = true
          // The pinecone on the grass where her blade will sweep through: pose her as she is at the whack (side-on,
          // the stick straight down), read where the blade is, then put her back.
          big.visible = true
          misty.root.rotation.y = (STRIKE_YAW * Math.PI) / 180
          swingA = 0
          swingPose()
          misty.root.updateWorldMatrix(true, true)
          big.localToWorld(blade.set(0.09 * H, -0.455 * H, 0.32 * H))
          big.visible = false
          misty.place(ME[0], 0, ME[1], -30)
          s.put(set.cone, blade.x, 0.1, blade.z)
          set.cone.scale.setScalar(1)
        },
        tick: (_k, t) => {
          leaps(t + 9)
          maple.armsUp = t > 0.4 ? lerp(0, 0.85, (t - 0.4) / 0.3) : 0
          misty.lean = t > 0.9 ? lerp(0, 0.3, (t - 0.9) / 0.4) : 0
        },
        cues: [[1.1, () => misty.pull('wow')]],
      },
      {
        // One BIG swing, side-on so it reads: the stick goes way back over her shoulder, she twists and leans back...
        // and WHACK, round and through, the pinecone shoots up out of the picture.
        id: 'swing',
        dur: 1.75,
        start: () => {
          stick.visible = false
          big.visible = true
          maple.armsUp = 0
          misty.lean = 0
          misty.armsUp = 0
          misty.pull('happy', true)
          s.sfx.pop()
          swingA = 0
          set.pose = swingPose
        },
        tick: (_k, t, dt) => {
          const up = t < 0.25 ? 0 : t < 0.8 ? 1 - (1 - (t - 0.25) / 0.55) ** 2 : 1
          if (t < 0.95) {
            swingA = WIND * up + (t > 0.8 ? Math.sin(t * 40) * 0.04 : 0)
            misty.lean = -0.28 * up
            misty.root.rotation.y = (lerp(-30, 52, t / 0.3) * Math.PI) / 180
          } else {
            const k = Math.min(1, (t - 0.95) / 0.16) ** 2
            swingA = lerp(WIND, -1.7, k)
            misty.lean = lerp(-0.28, 0.12, k)
            misty.root.rotation.y = (lerp(52, 62, k) * Math.PI) / 180
          }
          if (coneT < 0 && t >= 1.08) {
            from.copy(set.cone.position)
            coneT = 0
          }
          fly(dt)
        },
        cues: [
          [0.25, () => fx.swing()],
          [0.98, () => (fx.swing(), s.sfx.whoosh())],
          [1.08, () => (fx.thwack(), s.sfx.slap(), s.puff(set.cone.position.x, 0.15, set.cone.position.z, 14), s.sparkle(set.cone.position.x, 0.3, set.cone.position.z, 8))],
          [1.15, () => (maple.pull('wow', true), (maple.armsUp = 1), maple.hop())],
        ],
      },
      {
        // Up, up, over the tallest cedar in the forest, and away: a twinkle in the sky.
        id: 'over',
        shot: cam([TALLEST.x - 5.5, TOP + TALLEST.h - 7.5, TALLEST.z + 9], [TALLEST.x + 0.3, TOP + TALLEST.h + 0.6, TALLEST.z - 0.8], { look: [TALLEST.x + 0.5, TOP + TALLEST.h + 1.6, TALLEST.z - 1] }, { sway: 0 }),
        dur: 1.9,
        hold: 0,
        tick: (_k, _t, dt) => fly(dt),
      },
      {
        // Down below, two faces looking up: the biggest slap shot in Canada!
        id: 'shot',
        shot: cam([ME[0] - 0.55, 0.3, ME[1] + 3.5], [ME[0] - 0.55, 1.2, ME[1] - 0.2], { eye: [ME[0] - 0.55, 0.28, ME[1] + 3.2] }, { tall: { eye: [ME[0] - 0.55, 0.5, ME[1] + 5.6] } }),
        say: O.shot,
        sayAt: 0.2,
        hold: 0.2,
        start: () => {
          set.pose = null
          set.twinkle.visible = false
          set.cone.visible = false
          big.visible = false
          misty.place(ME[0], 0, ME[1], -20)
          misty.lean = -0.25
          misty.armsUp = 0.2
          misty.pull('wow', true)
          maple.place(MA[0], 0, MA[1], 30)
          maple.lean = -0.25
          maple.armsUp = 1
        },
        cues: [[0.4, () => maple.hop()], [1.4, () => maple.hop()]],
      },
      {
        // She'll come! The team's scarf goes on.
        id: 'team',
        shot: cam([ME[0] - 0.45, 0.95, ME[1] + 3.7], [ME[0] - 0.45, 0.78, ME[1] + 0.2], { eye: [ME[0] - 0.45, 0.92, ME[1] + 3.35] }, { tall: { eye: [ME[0] - 0.45, 1.2, ME[1] + 5.6] } }),
        say: O.team,
        sayAt: 0.3,
        hold: 0.35,
        start: () => {
          misty.cheer()
          misty.place(ME[0], 0, ME[1], -25)
          misty.lean = 0
          misty.armsUp = 0
          maple.cheer()
          maple.lean = 0
          maple.armsUp = 0
          maple.place(MA[0], 0, MA[1], 35)
        },
        cues: [
          [0.15, () => (misty.scarf(true), s.sparkle(ME[0], 1.0, ME[1] + 0.2, 18), s.sfx.chime(), misty.pull('happy'))],
          [0.4, () => (maple.hop(), (maple.armsUp = 1))],
          [1.3, () => (maple.armsUp = 0)],
          [1.9, () => misty.wave()],
        ],
      },
    ]
  },
}

const tmp = new Vector3()
const off = new Vector3()

// The salmon chapter's two films (planning/around-the-world/canada.md): `salmon-in` before its game, `salmon-out` after
// it (before the stamp). Lines: lines.ts `L.salmon.filmIn` and `L.salmon.filmOut`, in play order. The set is the
// rainforest river (story/sets/salmon.ts): the falls face the camera, Misty fishes in the pool at their foot, Maple
// stands on the left bank under a big leaf.
//
// In (about 13 s): the rainforest in the rain, and in the falls a bear as white as snow. A salmon leaps; Misty winds up
// and swats: an enormous splash, no fish, the salmon sails over her head up the falls. Misty, dripping: no hockey till
// supper. Maple, behind her paw, to the camera: let's help the salmon past her.
// Out (about 14 s): the salmon home, Misty on the bank with a paw full of berries and a purple mouth. Tiny Maple holds a
// hockey stick up to big Misty; one swing (side-on, so the wind-up and the whack both show) sends a pinecone up over
// the tallest cedar to a twinkle in the sky. Two faces looking up. She puts on the team's scarf.
import { Vector3 } from 'three'
import { cam, close } from '../../../../engine3d/shots'
import { L } from '../../lines'
import { makeStick } from '../props'
import { FALLS_Z, RIVER, salmonFilmSfx as fx, TALLEST, TOP, WADE } from '../sets/salmon'
import type { StoryFilm } from '../stage'

const X = L.salmon.filmIn
const O = L.salmon.filmOut
const lerp = (a: number, b: number, k: number) => a + (b - a) * Math.max(0, Math.min(1, k))

/** Where Maple stands on the left bank, and Misty in the pool. */
const MAPLE: [number, number] = [-2.75, 0.9]
const MISTY: [number, number] = [0.15, FALLS_Z + 1.15]
/** Misty's slap shot: how far back the stick goes (radians round her shoulder), and which way she faces at the whack
 *  (degrees: 90 is side-on, facing right). */
const WIND = 2.7
const STRIKE_YAW = 58

export const SALMON_IN: StoryFilm = {
  id: 'salmon-in',
  set: RIVER,
  music: 'story',
  beats(s) {
    const set = s.use(RIVER)
    const { maple, misty } = s.cast
    maple.root.add(set.leaf)
    const [mx, mz] = MISTY
    /** Misty's swing at the salmon: up (a slow wind-up), the fast swat down, the settle. `t` seconds in. */
    const swat = (t: number, at: number) => {
      const up = (t - (at - 0.55)) / 0.5
      const down = (t - at) / 0.13
      misty.armsUp = t < at ? lerp(0, 1, up) : t < at + 0.6 ? lerp(1, 0.15, down) : lerp(0.15, 0, (t - at - 0.6) / 0.5)
      misty.lean = t < at ? lerp(0, -0.18, up) : t < at + 0.6 ? lerp(-0.18, 0.5, down) : lerp(0.5, 0.05, (t - at - 0.6) / 0.6)
    }
    return [
      {
        // The rainforest in the rain, from up in the trees down to the river: Maple under her leaf, and in the falls
        // a big white bear.
        id: 'white',
        shot: cam([-1.2, 5.2, 10.5], [0, 1.2, -2.6], { eye: [-3.2, 1.35, 5.4], look: [-0.4, 0.75, -1.6] }, { ease: 'inOut', move: 2.6 }),
        say: X.white,
        sayAt: 0.3,
        hold: 0.2,
        start: () => {
          s.snow = 0.35
          maple.place(MAPLE[0], 0, MAPLE[1], 30)
          maple.armsUp = 0.2
          misty.place(mx, WADE, mz, 0)
          misty.lean = 0.28
          misty.headTurn = 0.3
        },
        // (She peers into the water, one way then the other.)
        tick: (_k, t) => (misty.headTurn = Math.sin(t * 0.9) * 0.4),
        cues: [[2.4, () => fx.raven()]],
      },
      {
        // A salmon leaps; she winds up and SWATS: an enormous splash, and no fish. It sails right over her head.
        id: 'jump',
        shot: cam([2.3, 1.3, 3.2], [-0.2, 1.1, FALLS_Z + 0.4], { eye: [2.15, 1.32, 2.95] }),
        dur: 2.7,
        start: () => {
          misty.headTurn = 0
          misty.lean = 0.2
        },
        tick: (_k, t) => {
          swat(t, 0.78)
          // (Her eyes follow it up and over.)
          if (t > 0.9 && t < 1.7) misty.headTurn = Math.sin((t - 0.9) * 8) * 0.3
        },
        cues: [
          [0.35, () => (set.leap(0, [mx - 0.25, 0, mz + 1.3], [mx + 0.2, TOP, FALLS_Z - 1.4], 1.15, 0.6), fx.leap(), s.splash(mx - 0.25, 0.05, mz + 1.3, 10), misty.pull('wow'))],
          [0.62, () => fx.swing()],
          [0.84, () => (set.bigSplash(mx - 0.95, mz + 0.55), fx.bigSplash(), s.splash(mx - 0.6, 0.1, mz + 0.7, 40), s.splash(mx - 1, 0.1, mz + 0.4, 24), s.splash(mx + 0.4, 0.1, mz + 0.8, 24))],
          [1.2, () => s.splash(mx - 0.4, 1.6, mz + 0.5, 30)],
          [1.9, () => (misty.pull('sad'), (misty.headTurn = 0))],
          [2.15, () => misty.shake()],
          [2.2, () => (s.splash(mx, 0.9, mz, 16), s.splash(mx, 0.6, mz + 0.2, 12))],
        ],
      },
      {
        // Misty, dripping: shh, she's fishing. No hockey till supper.
        id: 'fishing',
        shot: cam([mx - 0.55, 1.05, mz + 2.7], () => misty.head(tmp).add(off.set(0, -0.15, 0)), { eye: [mx - 0.45, 1.0, mz + 2.4] }),
        say: X.fishing,
        sayAt: 0.25,
        hold: 0.25,
        start: () => {
          misty.place(mx, WADE, mz, -10)
          misty.lean = 0.05
          misty.cheer()
          misty.headTurn = -0.15
        },
        tick: (_k, t) => {
          // (Back to the water as she finishes: supper first.)
          misty.lean = t > 2.9 ? lerp(0.05, 0.3, (t - 2.9) / 0.5) : 0.05
        },
        cues: [[1.6, () => misty.nod()]],
      },
      {
        // Maple, behind her paw, right up to the camera: psst!
        id: 'help',
        shot: close(maple, 0.05, 1.45, 0.12),
        say: X.help,
        sayAt: 0.35,
        hold: 0.45,
        start: () => {
          set.pose = null
          maple.place(MAPLE[0] + 0.3, 0, MAPLE[1] + 0.6, 0)
          maple.lean = 0.22
          maple.armsUp = 0.42
          maple.headTurn = 0.15
          misty.lean = 0.3
        },
        // (A peek back at Misty, and a nod: let's go.)
        cues: [[0.15, () => (maple.headTurn = 0.6)], [0.45, () => (maple.headTurn = 0.1)], [2.5, () => ((maple.armsUp = 0), maple.nod(), maple.pull('happy'))]],
      },
    ]
  },
}

export const SALMON_OUT: StoryFilm = {
  id: 'salmon-out',
  set: RIVER,
  beats(s) {
    const set = s.use(RIVER)
    const { maple, misty } = s.cast
    maple.root.add(set.leaf)
    set.leaf.visible = false
    // Misty's paw full of berries, and purple all round her mouth.
    misty.rig.armR.add(set.berries)
    set.berries.position.set(0.01 * misty.height, -0.27 * misty.height, 0.05 * misty.height)
    const [fx0, fy0, fz0] = misty.rig.face.mouth
    set.juice.position.set(fx0, fy0, fz0 + 0.02)
    set.juice.scale.setScalar(misty.height / 1.45)
    misty.rig.head.add(set.juice)
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
    /** Where Misty stands on the bank by the berry bushes; Maple beside her on the left, so the size gap shows. */
    const ME: [number, number] = [-3.55, -0.05]
    const MA: [number, number] = [ME[0] - 1.05, ME[1] + 0.75]
    // The pinecone sits where her blade sweeps the ground; once hit, it climbs over the tallest cedar's top.
    const from = new Vector3()
    const coneAt = (t: number, out: Vector3) => {
      const k = Math.max(0, t) / 1.9
      const e = 1 - (1 - Math.min(1, k)) ** 2
      const top = TALLEST.h + TOP + 2.5
      return out.set(lerp(from.x, TALLEST.x + 0.6, e), from.y + (top - from.y) * e + Math.max(0, k - 1) * 3, lerp(from.z, TALLEST.z - 1.2, e))
    }
    /** Seconds since the stick hit the pinecone (-1: not yet). */
    let coneT = -1
    let twinkled = false
    const conePos = new Vector3()
    const blade = new Vector3()
    /** Her swing: both arms round the shoulder together (+: back and up over her shoulder, -: forward and through). */
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
    /** The two-shot by the berry bushes: Maple on the left, Misty on the right, room above for the stick. */
    const two = cam([ME[0] - 0.35, 1.0, ME[1] + 4.5], [ME[0] - 0.3, 0.88, ME[1] + 0.1], undefined, { sway: 0.012, tall: { eye: [ME[0] - 0.4, 1.25, ME[1] + 6.4], look: [ME[0] - 0.3, 0.95, ME[1] + 0.1] } })
    /** The pinecone in flight (bigger than life, so it reads against the sky), and the twinkle where it vanishes. */
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
        // Misty on the bank with a paw full of berries (and a purple mouth); behind her the salmon go home.
        id: 'berries',
        shot: cam([ME[0] + 1.55, 1.05, ME[1] + 2.4], () => misty.head(tmp).add(off.set(0.25, -0.12, 0)), { eye: [ME[0] + 1.35, 1.1, ME[1] + 2.15] }),
        say: O.berries,
        sayAt: 0.3,
        hold: 0.25,
        start: () => {
          s.snow = 0.2
          misty.place(ME[0], 0, ME[1], 25)
          misty.pull('happy', true)
          maple.hide()
        },
        tick: (_k, t) => {
          leaps(t)
          // The paw full of berries goes up to her mouth for each munch.
          const up = 0.75 + 0.25 * Math.sin(t * 3.6)
          set.pose = () => misty.rig.armR.rotation.set(-2.1 * up, 0, 0.2 + 0.2 * up)
        },
        cues: [[0.1, () => fx.munch()], [1.5, () => fx.munch()]],
      },
      {
        // Tiny Maple hops in holding a hockey stick right up to big Misty, who leans down to see.
        id: 'stick',
        shot: two,
        say: O.stick,
        sayAt: 0.3,
        hold: 0.2,
        start: () => {
          set.pose = null
          misty.cheer()
          set.berries.visible = false
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
        // One BIG swing, side-on so it reads: she takes the stick, it goes way back over her shoulder, she twists and
        // leans back... and WHACK, round and through, the pinecone shoots up out of the picture.
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
          // Turn side-on (facing right), the wind-up (back, up over her shoulder, a twist toward us, a lean back), a
          // breath at the top, then the swing (round and through in a blink: the blade sweeps the grass at the whack)
          // and the follow-through.
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
        sayAt: 0.5,
        hold: 0.5,
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

// The salmon chapter's two films (planning/around-the-world/canada.md): `salmon-in` before its game, `salmon-out` after
// it (before the stamp). Lines: lines.ts `L.salmon.filmIn` and `L.salmon.filmOut`, in play order. The set is the
// rainforest river (story/sets/salmon.ts): the falls face the camera, Misty fishes in the pool at their foot, Maple
// stands on the left bank under a big leaf.
//
// In (about 16 s): the rainforest in the rain, and in the falls a bear as white as snow. A salmon leaps; Misty winds up
// and swats: an enormous splash, no fish, the salmon sails over her head up the falls. "Wow! Look at that swing!"
// Misty, dripping: no hockey till supper. Maple, behind her paw, to the camera: let's help the salmon past her.
// Out (about 14 s): the salmon home, Misty on the bank with a paw full of berries and a purple mouth. Tiny Maple holds a
// hockey stick up to big Misty; one swing sends a pinecone up over the tallest cedar (the camera goes with it) to a
// twinkle in the sky. She puts on the team's scarf.
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
        shot: cam([-1.2, 5.2, 10.5], [0, 1.2, -2.6], { eye: [-3.2, 1.35, 5.4], look: [-0.4, 0.75, -1.6] }, { ease: 'inOut' }),
        say: X.white,
        sayAt: 1,
        dur: 4.5,
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
        cues: [[3.6, () => fx.raven()]],
      },
      {
        // A salmon leaps; she winds up and SWATS: an enormous splash, and no fish. It sails right over her head.
        id: 'jump',
        shot: cam([2.3, 1.3, 3.2], [-0.2, 1.1, FALLS_Z + 0.4], { eye: [2.15, 1.32, 2.95] }),
        dur: 3.1,
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
          [2.0, () => (misty.pull('sad'), (misty.headTurn = 0))],
          [2.4, () => misty.shake()],
          [2.45, () => (s.splash(mx, 0.9, mz, 16), s.splash(mx, 0.6, mz + 0.2, 12))],
        ],
      },
      {
        // Maple, under her leaf: what a swing!
        id: 'swing',
        shot: close(maple, 0.35, 2.1, 0.18),
        say: X.swing,
        sayAt: 0.3,
        start: () => {
          misty.lean = 0.25
          misty.armsUp = 0
          maple.pull('wow')
          maple.hop()
          maple.armsUp = 0.55
        },
        cues: [[1.2, () => (maple.armsUp = 0.2)]],
      },
      {
        // Misty, dripping: shh, she's fishing. No hockey till supper.
        id: 'fishing',
        shot: cam([mx - 0.55, 1.05, mz + 2.7], () => misty.head(tmp).add(off.set(0, -0.15, 0)), { eye: [mx - 0.45, 1.0, mz + 2.4] }),
        say: X.fishing,
        sayAt: 0.5,
        start: () => {
          misty.place(mx, WADE, mz, -10)
          misty.lean = 0.05
          misty.cheer()
          misty.headTurn = -0.15
        },
        tick: (_k, t) => {
          // (Back to the water as she finishes: supper first.)
          misty.lean = t > 3.4 ? lerp(0.05, 0.3, (t - 3.4) / 0.6) : 0.05
        },
        cues: [[2.2, () => misty.nod()]],
      },
      {
        // Maple, behind her paw, right up to the camera: psst!
        id: 'help',
        shot: close(maple, 0.05, 1.45, 0.12),
        say: X.help,
        sayAt: 0.5,
        hold: 0.7,
        start: () => {
          set.pose = null
          maple.place(MAPLE[0] + 0.3, 0, MAPLE[1] + 0.6, 0)
          maple.lean = 0.22
          maple.armsUp = 0.42
          maple.headTurn = 0.15
          misty.lean = 0.3
        },
        // (A peek back at Misty, and a nod: let's go.)
        cues: [[0.2, () => (maple.headTurn = 0.6)], [0.55, () => (maple.headTurn = 0.1)], [2.6, () => ((maple.armsUp = 0), maple.nod(), maple.pull('happy'))]],
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
    maple.rig.armR.add(stick)
    const big = makeStick(misty.height, s.bag)
    big.visible = false
    misty.rig.armR.add(big)
    /** Where Misty stands on the bank by the berry bushes (Maple stands beside her, so the size gap shows). */
    const ME: [number, number] = [-3.55, -0.05]
    const conePath = { from: new Vector3(ME[0] + 0.55, 0.12, ME[1] + 0.75), t0: 0 }
    const coneAt = (t: number, out: Vector3) => {
      // Up and away over the tallest cedar's top: a long, slowing climb.
      const k = Math.max(0, t) / 2
      const e = 1 - (1 - Math.min(1, k)) ** 2
      const top = TALLEST.h + TOP + 2.5
      return out.set(lerp(conePath.from.x, TALLEST.x + 0.6, e), conePath.from.y + (top - conePath.from.y) * e + Math.max(0, k - 1) * 3, lerp(conePath.from.z, TALLEST.z - 1.2, e))
    }
    let coneT = -9
    const conePos = new Vector3()
    /** Salmon leaping up the falls behind them, one after another (they're going home). */
    const leaps = (t: number, every = 1.3) => {
      const i = Math.floor(t / every)
      if (i !== leapN && t > 0.2) {
        leapN = i
        const x = -0.8 + ((i * 0.73) % 1.6)
        set.leap(i % set.salmon.length, [x, 0, FALLS_Z + 1.4], [x + 0.2, TOP, FALLS_Z - 1.6], 1.05, 0.9)
      }
    }
    let leapN = -1
    return [
      {
        // Misty on the bank with a paw full of berries (and a purple mouth); behind her the salmon go home.
        id: 'berries',
        shot: cam([ME[0] + 1.55, 1.05, ME[1] + 2.4], () => misty.head(tmp).add(off.set(0.25, -0.12, 0)), { eye: [ME[0] + 1.35, 1.1, ME[1] + 2.15] }),
        say: O.berries,
        sayAt: 0.7,
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
        cues: [[0.15, () => fx.munch()], [1.6, () => fx.munch()], [2.8, () => misty.nod()]],
      },
      {
        // Tiny Maple holds a hockey stick right up to big Misty, who leans down to see.
        id: 'stick',
        shot: cam([ME[0] + 0.85, 0.45, ME[1] + 3.1], [ME[0] + 0.5, 0.85, ME[1]], { eye: [ME[0] + 0.8, 0.42, ME[1] + 2.8] }),
        say: O.stick,
        sayAt: 0.55,
        start: () => {
          set.pose = null
          misty.cheer()
          misty.armsUp = 0.1
          set.berries.visible = false
          maple.place(ME[0] + 1.75, 0, ME[1] + 0.45, -45)
          maple.walkTo(ME[0] + 1.05, ME[1] + 0.35, 0.5, -38)
          misty.place(ME[0], 0, ME[1], 30)
        },
        tick: (_k, t) => {
          leaps(t + 9)
          maple.armsUp = t > 0.5 ? lerp(0, 0.85, (t - 0.5) / 0.35) : 0
          misty.lean = t > 1.2 ? lerp(0, 0.38, (t - 1.2) / 0.5) : 0
        },
        cues: [[0.55, () => maple.hop()], [1.3, () => misty.pull('wow')]],
      },
      {
        // One swing. The pinecone goes up, up, over the tallest cedar in the forest, and away: a twinkle in the sky.
        id: 'swing',
        shot: {
          eye: () => {
            if (coneT < 0) return tmp.set(ME[0] + 2.4, 0.9, ME[1] + 3.1)
            coneAt(coneT, conePos)
            const k = Math.min(1, coneT / 0.6)
            return tmp.set(lerp(ME[0] + 2.4, conePos.x - 2.2, k), lerp(0.9, conePos.y - 2.4, k), lerp(ME[1] + 3.1, conePos.z + 6.5, k))
          },
          look: () => {
            if (coneT < 0) return tmp2.set(ME[0] + 0.35, 0.65, ME[1] + 0.2)
            const k = Math.min(1, coneT / 0.35)
            return tmp2.set(lerp(ME[0] + 0.35, conePos.x, k), lerp(0.65, conePos.y, k), lerp(ME[1] + 0.2, conePos.z, k))
          },
          fov: 40,
          sway: 0,
        },
        dur: 3.5,
        start: () => {
          stick.visible = false
          big.visible = true
          maple.place(ME[0] - 1.05, 0, ME[1] + 0.5, 30)
          maple.armsUp = 0
          misty.place(ME[0], 0, ME[1], 55)
          misty.lean = 0
          misty.armsUp = 0
          misty.cheer()
          s.put(set.cone, conePath.from.x, conePath.from.y, conePath.from.z)
          coneT = -9
        },
        tick: (_k, t, dt) => {
          // The wind-up (back and up), the swing (round and through), the follow-through.
          const at = 0.95
          misty.armsUp = t < at ? lerp(0, 0.95, (t - 0.2) / 0.6) : lerp(0.95, 0.1, (t - at) / 0.14)
          misty.lean = t < at ? lerp(0, -0.22, (t - 0.2) / 0.6) : lerp(-0.22, 0.32, (t - at) / 0.16)
          misty.root.rotation.y = ((t < at ? lerp(55, 95, (t - 0.2) / 0.6) : lerp(95, 15, (t - at) / 0.18)) * Math.PI) / 180
          if (t >= at) {
            coneT = t - at
            set.cone.position.copy(coneAt(coneT, conePos))
            set.cone.rotation.x += dt * 14
          }
        },
        cues: [
          [0.25, () => misty.pull('happy')],
          [0.8, () => fx.swing()],
          [0.95, () => (fx.thwack(), s.sfx.whoosh(), s.puff(conePath.from.x, 0.15, conePath.from.z, 8))],
          [1.1, () => (maple.pull('wow', true), (maple.armsUp = 1))],
          [2.85, () => (s.sfx.glint(), s.sparkle(conePos.x, conePos.y, conePos.z, 20), s.put(set.twinkle, conePos.x, conePos.y, conePos.z), (set.cone.visible = false))],
        ],
      },
      {
        // Down below, two faces looking up: the biggest slap shot in Canada!
        id: 'shot',
        shot: cam([ME[0] + 0.95, 0.28, ME[1] + 2.7], [ME[0] + 0.55, 1.2, ME[1] - 0.2], { eye: [ME[0] + 0.9, 0.26, ME[1] + 2.45] }),
        say: O.shot,
        sayAt: 0.3,
        start: () => {
          set.twinkle.visible = false
          misty.place(ME[0], 0, ME[1], 20)
          misty.root.rotation.y = 0.35
          misty.lean = -0.25
          misty.armsUp = 0.2
          misty.pull('wow', true)
          maple.place(ME[0] + 1.05, 0, ME[1] + 0.35, -25)
          maple.lean = -0.25
          maple.armsUp = 1
        },
        cues: [[0.5, () => maple.hop()], [1.5, () => maple.hop()]],
      },
      {
        // She'll come! The team's scarf goes on.
        id: 'team',
        shot: cam([ME[0] + 1.6, 0.85, ME[1] + 3.1], [ME[0] + 0.6, 0.75, ME[1] + 0.2], { eye: [ME[0] + 1.45, 0.85, ME[1] + 2.75] }),
        say: O.team,
        sayAt: 0.9,
        hold: 0.9,
        start: () => {
          misty.cheer()
          misty.place(ME[0], 0, ME[1], 25)
          misty.lean = 0
          misty.armsUp = 0
          maple.cheer()
          maple.lean = 0
          maple.armsUp = 0
          maple.place(ME[0] + 1.05, 0, ME[1] + 0.35, -35)
          stick.visible = false
        },
        cues: [
          [0.2, () => (misty.scarf(true), s.sparkle(ME[0], 1.0, ME[1] + 0.2, 18), s.sfx.chime(), misty.pull('happy'))],
          [0.5, () => (maple.hop(), (maple.armsUp = 1))],
          [1.4, () => (maple.armsUp = 0)],
          [2.2, () => misty.wave()],
        ],
      },
    ]
  },
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const off = new Vector3()

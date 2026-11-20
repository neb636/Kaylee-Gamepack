// The whales chapter's two films (planning/around-the-world/canada.md, docs/films.md), on the coast at Tofino
// (story/sets/whales.ts, the game's own sea). Lines: lines.ts `L.whales.filmIn` and `L.whales.filmOut`, in play order.
//
//   whales-in   The dock at Tofino: Maple at the wheel of the little pink boat. "Ollie spins faster than anybody!"
//               (she gives it a twirl herself), a look at Ollie spinning out in the kelp, and off she putters: "She's
//               out in the kelp, where the whales swim." About 11 s.
//   whales-out  Out in the kelp: Ollie on her back with a clam on her tummy, Maple leaning over the side. Is hockey wet?
//               It's ice, you slide! Ollie spins like a top. A humpback comes up right behind them and its spout rains
//               down on everybody; they shake it off, and Ollie gets the team's scarf. About 14 s.
//
// The boat heads toward -z out of the harbour (the bow away from the town), so the film-in's shots of Maple's face are
// from the sea side; in the kelp the boat lies side-on with its right side to the usual camera on +z.
import { Vector3 } from 'three'
import { cam, close } from '../../../../engine3d/shots'
import { whaleSfx } from '../../activities/whales/sounds'
import { KELP } from '../../activities/whales/sea'
import { L } from '../../lines'
import { AT_DOCK, AT_KELP, COAST } from '../sets/whales'
import type { StoryFilm } from '../stage'

const I = L.whales.filmIn
const O = L.whales.filmOut
const TAU = Math.PI * 2

const tA = new Vector3()
const tB = new Vector3()
/** A shot of Maple's face from in front of her while she faces -z (the bow out to sea): `side` meters to her left. */
const frontOf = (who: { head(out?: Vector3): Vector3 }, side: number, back: number, up = 0.15) => ({
  eye: () => who.head(tA).add(tB.set(side, up, -back)),
  look: () => who.head(tA),
  fov: 34,
})

export const WHALES_IN: StoryFilm = {
  id: 'whales-in',
  set: COAST,
  beats(s) {
    const set = s.use(COAST)
    const { boat } = set
    const ollie = s.cast.ollie
    // Ollie, far out in the kelp, for the look at her spinning.
    const float = set.float(ollie, KELP.x + 3, KELP.z + 2, 0)
    const [ox, oz] = [KELP.x + 3, KELP.z + 2]
    const dock = AT_DOCK
    return [
      {
        // Tofino from the sea: the town, the dock, the little pink boat with Maple at the wheel. She waves.
        id: 'dock',
        shot: cam([-4, 5, 56], [4.6, 1.2, 76], { eye: [-0.8, 3.4, 62.5] }, { ease: 'inOut' }),
        dur: 1.6,
        start: () => {
          s.sfx.air('sea')
          set.at = { ...dock }
          set.look = null
          whaleSfx.gulls()
        },
        cues: [[0.5, () => boat.wave()]],
      },
      {
        // Close, from the bow: Maple tells us about Ollie, and gives a twirl on "spins".
        id: 'ollie',
        shot: frontOf(set.maple, 0.5, 2.1, 0.62),
        say: I.ollie,
        sayAt: 0.25,
        hold: 0.2,
        tick: (_k, t) => {
          const k = Math.min(1, Math.max(0, (t - 1.3) / 0.7))
          boat.maple.rotation.y = k * k * (3 - 2 * k) * TAU
        },
        cues: [[1.3, () => s.sfx.whoosh()], [2.1, () => boat.cheer()]],
      },
      {
        // There she is, out in the kelp: round and round on her back, spraying drops. (No line: the picture says where
        // she lives.)
        id: 'spin',
        shot: { ...close(ollie, 0.7, 2.2, 0.55), to: { fov: 30 } },
        dur: 2.2,
        start: () => {
          boat.maple.rotation.y = 0
        },
        cues: [
          [0.3, () => (float.spin(), whaleSfx.giggle())],
          ...[0.55, 0.9, 1.25].map((at): [number, () => void] => [at, () => s.splash(ox + (Math.random() - 0.5), 0.15, oz + (Math.random() - 0.5), 10)]),
          [1.6, () => whaleSfx.squeak()],
        ],
      },
      {
        // Off she goes: the boat putters away from the dock toward us, out toward the open Pacific, Maple at the wheel
        // telling us where Ollie is.
        id: 'go',
        shot: cam([dock.x - 2.2, 2.25, dock.z - 8.8], [dock.x, 1.0, dock.z - 1.5], { look: [dock.x - 0.3, 1.0, dock.z - 5.5] }, { tall: { eye: [dock.x - 2.8, 2.6, dock.z - 10.8] } }),
        say: I.out,
        sayAt: 0.3,
        hold: 0.3,
        start: () => {
          set.look = null
          boat.cheer()
          whaleSfx.horn()
        },
        tick: (_k, t) => {
          const k = Math.min(1, t / 3.9)
          set.at.z = dock.z - 6 * k * k
          whaleSfx.engine(0.25 + 0.5 * k)
          if (Math.random() < 0.25) s.splash(set.at.x + (Math.random() - 0.5) * 1.6, 0.1, set.at.z + 2.6, 2)
        },
        cues: [[1.3, () => boat.wave()]],
      },
    ]
  },
}

export const WHALES_OUT: StoryFilm = {
  id: 'whales-out',
  set: COAST,
  beats(s) {
    const set = s.use(COAST)
    const { boat, whale } = set
    const ollie = s.cast.ollie
    const at = AT_KELP
    // Ollie floats off the boat's right side (toward the camera), her toes to us, a clam on her tummy.
    const ox = at.x - 0.1
    const oz = at.z + 2.85
    const float = set.float(ollie, ox, oz, 0)
    const look = new Vector3()
    /** Maple leans over the right side of the boat, toward Ollie (the boat's frame: -x is its right). */
    const lean = (k: number) => {
      boat.maple.position.set(-0.7, 0.32, -0.3)
      boat.maple.rotation.order = 'YXZ'
      boat.maple.rotation.set(0.38 * k, -Math.PI / 2, 0)
    }
    const watchOllie = () => (set.look = ollie.head(look))
    return [
      {
        // Out in the kelp: Maple leans over the side; Ollie bobs on her back with her clam.
        id: 'ask',
        shot: cam([at.x + 1.4, 1.5, at.z + 6.2], [at.x - 0.15, 0.62, at.z + 2.1], { eye: [at.x + 1.15, 1.4, at.z + 5.6] }),
        say: O.ask,
        sayAt: 0.25,
        hold: 0.2,
        start: () => {
          s.sfx.air('sea')
          set.at = { ...at }
          lean(1)
          watchOllie()
        },
        tick: watchOllie,
        cues: [[0.3, () => boat.wave()], [1.6, () => whaleSfx.clack()]],
      },
      {
        // Ollie, close: hockey? She tips her head. Is it wet?
        id: 'wet',
        shot: close(ollie, 0.3, 1.8, 0.95),
        say: O.wet,
        sayAt: 0.15,
        hold: 0.3,
        tick: (_k, t) => {
          watchOllie()
          ollie.headTurn = Math.sin(Math.min(1, t / 0.6) * Math.PI * 0.5) * 0.35
        },
        cues: [[0.9, () => ollie.pull('wow')]],
      },
      {
        // Maple, close, leaning down to her: it's ice! You slide!
        id: 'ice',
        shot: close(set.maple, 0.55, 2.1, 0.05),
        say: O.ice,
        sayAt: 0.15,
        hold: 0.3,
        start: () => {
          ollie.headTurn = 0
        },
        tick: watchOllie,
        cues: [[1.3, () => boat.cheer()]],
      },
      {
        // Wheee! Round and round on her back like a top, drops flying.
        id: 'spin',
        shot: cam([at.x - 1.3, 1.5, at.z + 7.1], [at.x - 0.1, 0.55, at.z + 2.4]),
        say: O.spin,
        sayAt: 0.15,
        hold: 0.3,
        tick: watchOllie,
        cues: [
          [0.25, () => (float.spin(), whaleSfx.giggle())],
          ...[0.45, 0.75, 1.05, 1.35].map((t): [number, () => void] => [t, () => s.splash(ox + (Math.random() - 0.5) * 0.8, 0.15, oz + (Math.random() - 0.5) * 0.8, 12)]),
          [1.6, () => (float.spin(), whaleSfx.giggle())],
        ],
      },
      {
        // Behind them, a humpback comes up... and blows. The spout rains down on everybody.
        id: 'whale',
        shot: { ...cam([at.x + 4.5, 3.6, at.z + 13], [at.x - 1.5, 1.4, at.z - 6], { look: [at.x - 1.5, 2.4, at.z - 6] }), tall: cam([at.x + 3.4, 2.6, at.z + 15], [at.x - 1.5, 2.6, at.z - 6], { look: [at.x - 1.5, 3.6, at.z - 6] }) },
        dur: 2.6,
        start: () => {
          whale.root.position.set(at.x - 4.6, 0, at.z - 8.5)
          whale.root.rotation.y = Math.PI / 2
          whale.surface()
          set.look = new Vector3(at.x - 1.5, 2, at.z - 8)
        },
        cues: [
          [0.7, () => (boat.pointAt(new Vector3(at.x - 1.5, 1.5, at.z - 8)), ollie.pull('wow'))],
          [0.95, () => whaleSfx.blow()],
          [1.5, () => (set.rain(at.x - 0.2, at.z + 1.4, 3.4, 160), s.sfx.splash())],
          [1.75, () => (boat.soak(), ollie.pull('sad'), whaleSfx.squeak())],
        ],
      },
      {
        // Dripping, they shake it off; Ollie gets her pink scarf. You're on the team!
        id: 'team',
        shot: cam([at.x + 1.1, 1.3, at.z + 6], [at.x - 0.15, 0.62, at.z + 2.2]),
        say: O.team,
        sayAt: 0.35,
        hold: 0.45,
        start: () => {
          ollie.cheer()
          ollie.shake()
          watchOllie()
          set.rain(at.x - 0.2, at.z + 1.4, 2.6, 30)
        },
        tick: watchOllie,
        cues: [
          [0.15, () => whaleSfx.giggle()],
          [0.9, () => (ollie.scarf(true), s.sparkle(ox, 0.9, oz, 18), s.sfx.chime())],
          [1.3, () => (float.spin(), boat.cheer(), boat.slap())],
        ],
      },
    ]
  },
}

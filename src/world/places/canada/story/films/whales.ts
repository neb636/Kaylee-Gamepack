// The whales chapter's two films (canada-round-2.md in git history, section 3; docs/films.md), out in the kelp
// off Tofino (story/sets/whales.ts, the game's own sea). Lines: lines.ts `L.whales.filmIn` and `L.whales.filmOut`, in
// play order.
//
//   whales-in   Ollie floats on her back in the kelp juggling her lucky rock on her tummy (Maple watches from the
//               little pink boat): "Ollie spins faster than anybody!", "Look! My lucky rock!". Higher and higher...
//               a grey whale comes up right beside her and its spout shoots the rock into the sky and away. "My rock!
//               The whale took it!" "Hop on! We'll get it back!": she grabs the boat's rope. About 14 s.
//   whales-out  Out in the kelp, the rock back on Ollie's tummy, Maple leaning over the side. Is hockey wet? It's ice,
//               you slide! Ollie juggles while they talk and tucks the rock under her arm on "I love to slide!", then
//               spins like a top. A humpback comes up behind them and its spout rains down on everybody; they shake
//               it off, and Ollie gets the team's scarf. About 14 s.
//
// In the kelp the boat lies side-on (its bow toward +x), the usual camera on +z.
import { Vector3 } from 'three'
import { cam, close } from '../../../../engine3d/shots'
import { whaleSfx } from '../../activities/whales/sounds'
import { L } from '../../lines'
import { AT_KELP, COAST } from '../sets/whales'
import type { StoryFilm } from '../stage'

const I = L.whales.filmIn
const O = L.whales.filmOut

const tA = new Vector3()
const tB = new Vector3()
const ease = (k: number) => k * k * (3 - 2 * k)

export const WHALES_IN: StoryFilm = {
  id: 'whales-in',
  set: COAST,
  beats(s) {
    const set = s.use(COAST)
    const { boat, grey } = set
    const ollie = s.cast.ollie
    const at = AT_KELP
    // Ollie floats ahead of the boat's bow in the kelp, her toes to the camera, juggling her rock on her tummy.
    const ox = at.x + 4.6
    const oz = at.z + 3.6
    const float = set.float(ollie, ox, oz, 0, false)
    const juggle = set.juggle(ollie)
    // The grey whale comes up right beside her: its blowhole just past her tummy, its face to the camera.
    const hole = new Vector3(ox + 1.15, 0, oz - 1.1)
    const heading = -0.55
    const placeGrey = () => {
      const fwd = 0.795 * grey.len - grey.len * 0.5
      grey.root.position.set(hole.x - Math.sin(heading) * fwd, 0, hole.z - Math.cos(heading) * fwd)
      grey.root.rotation.y = heading
    }
    const watchOllie = () => (set.look = ollie.head(tA).clone())
    // The rock's flight: up off her tummy to over the blowhole, then the spout shoots it up into the sky and away.
    const from = new Vector3()
    const over = new Vector3()
    const away = new Vector3()
    const fly = (t: number) => {
      const r = set.rock
      if (t < 2.55) return
      if (!r.visible) {
        r.visible = true
        juggle.gone = true
        from.copy(juggle.rock.getWorldPosition(tB))
        over.copy(hole).setY(1.3)
        away.set(hole.x - 3, 7.5, hole.z - 18)
      }
      if (t < 3.0) {
        const k = (t - 2.55) / 0.45
        r.position.lerpVectors(from, over, k)
        r.position.y += Math.sin(Math.PI * k) * 0.6
      } else {
        const k = Math.min(1, (t - 3.0) / 1.1)
        r.position.lerpVectors(over, away, 1 - (1 - k) * (1 - k))
        r.scale.setScalar(1 - 0.6 * k)
      }
      r.rotation.x += 0.4
    }
    return [
      {
        // The kelp off Tofino: Ollie on her back juggling, the little boat beside her, Maple watching. She spins.
        id: 'kelp',
        // (Tall: its own push-in too, from further back: without one it pushed in to the wide shot's end and cut Ollie
        // off the right edge.)
        shot: cam([ox + 1.2, 2.2, oz + 7.6], [ox - 2.4, 0.7, oz - 1.6], { eye: [ox + 0.9, 2.0, oz + 7] }, { tall: { eye: [ox + 1.8, 3.4, oz + 13], to: { eye: [ox + 1.6, 3.2, oz + 12] } } }),
        say: I.ollie,
        sayAt: 0.3,
        hold: 0.2,
        start: () => {
          s.sfx.air('sea')
          set.at = { ...at }
          juggle.on = true
          juggle.height = 0.3
          watchOllie()
        },
        tick: watchOllie,
        cues: [[1.7, () => (float.spin(), whaleSfx.giggle())]],
      },
      {
        // Close: her lucky rock, up and down on her tummy.
        id: 'lucky',
        shot: { ...close(ollie, 0.35, 2.1, 0.75), to: { fov: 31 } },
        say: I.lucky,
        sayAt: 0.2,
        hold: 0.3,
        start: () => {
          juggle.show = true
          ollie.pull('happy')
        },
      },
      {
        // Higher, higher... a whale comes up right beside her, and its spout shoots the rock into the sky and away.
        id: 'higher',
        shot: cam([ox + 3.2, 2.3, oz + 7], [ox + 0.6, 1.2, oz - 1.2], { look: [ox + 0.3, 1.8, oz - 2] }, { tall: { eye: [ox + 3.6, 2.8, oz + 9.4] } }),
        dur: 4.3,
        start: () => {
          juggle.show = false
          placeGrey()
          grey.look = ollie.head(tA).clone()
        },
        tick: (_k, t) => {
          if (t < 2.55) juggle.height = 0.5 + t * 0.4
          fly(t)
        },
        cues: [
          [0.9, () => (grey.rise(), whaleSfx.peek())],
          [2.55, () => (grey.blow(), whaleSfx.toss())],
          [3.0, () => (s.sfx.whoosh(), ollie.pull('wow'))],
        ],
      },
      {
        // Ollie, close: her rock is gone.
        id: 'took',
        shot: close(ollie, -0.3, 2.0, 0.55),
        say: I.took,
        sayAt: 0.2,
        hold: 0.3,
        start: () => {
          set.rock.visible = false
          juggle.gone = true
          ollie.pull('sad', true)
        },
        cues: [[0.6, () => grey.dive()]],
      },
      {
        // Maple at the wheel: hop on! Ollie paddles to the stern and grabs the rope.
        id: 'hop',
        shot: cam([at.x + 2.4, 2.5, at.z + 9.5], [at.x, 0.9, at.z + 1.2], undefined, { tall: { eye: [at.x + 2.8, 3.2, at.z + 12] } }),
        say: I.hop,
        sayAt: 0.25,
        hold: 0.5,
        start: () => {
          set.look = new Vector3(at.x + 2, 1.5, at.z + 8)
          boat.wave()
          ollie.cheer()
        },
        tick: (_k, t) => {
          // (From her spot to just behind the stern, on the rope.)
          const k = ease(Math.min(1, Math.max(0, (t - 0.8) / 1.4)))
          ollie.pos.x = ox + (at.x - 4.4 - ox) * k
          ollie.pos.z = oz + (at.z + 0.6 - oz) * k
          float.face = -0.9 * k
          boat.rope(k > 0.95 ? ollie.at(0.42, tB) : null)
        },
        cues: [[2.1, () => (boat.cheer(), whaleSfx.squeak())]],
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
    // Ollie floats off the boat's right side (toward the camera), her toes to us, her lucky rock back on her tummy:
    // she juggles it while they talk, and tucks it under her arm on "I love to slide!".
    const ox = at.x - 0.1
    const oz = at.z + 2.85
    const float = set.float(ollie, ox, oz, 0, false)
    const juggle = set.juggle(ollie)
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
          juggle.on = true
          juggle.height = 0.35
        },
        tick: watchOllie,
        cues: [[0.3, () => boat.wave()]],
      },
      {
        // Ollie, close: hockey? She tips her head. Is it wet? (From high enough that the sea is behind her: from lower
        // the boat's tube ran right across the top of the picture.)
        id: 'wet',
        shot: close(ollie, 0.3, 1.3, 2.1),
        say: O.wet,
        sayAt: 0.15,
        hold: 0.3,
        start: () => (juggle.show = true),
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
          juggle.show = false
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
        start: () => {
          // (In the pocket of skin under her arm, safe for the spin.)
          juggle.tuck = true
          whaleSfx.clack()
        },
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
          whale.root.position.set(at.x - 2.6, 0, at.z - 8.5)
          whale.root.rotation.y = Math.PI / 2 + 0.5
          whale.look = new Vector3(at.x, 1, at.z)
          whale.rise()
          set.look = new Vector3(at.x - 1.5, 2, at.z - 8)
        },
        cues: [
          [0.5, () => whale.blow()],
          [0.7, () => (boat.pointAt(new Vector3(at.x - 1.5, 1.5, at.z - 8)), ollie.pull('wow'))],
          [0.95, () => whaleSfx.blow()],
          [1.5, () => (set.rain(at.x - 0.2, at.z + 1.4, 3.4, 160), s.sfx.splash())],
          [1.75, () => (boat.soak(), ollie.pull('sad'), whaleSfx.squeak())],
        ],
      },
      {
        // Dripping, they shake it off (the humpback dives away); Ollie gets her pink scarf. You're on the team!
        id: 'team',
        shot: cam([at.x + 1.1, 1.3, at.z + 6], [at.x - 0.15, 0.62, at.z + 2.2]),
        say: O.team,
        sayAt: 0.35,
        hold: 0.3,
        start: () => {
          ollie.cheer()
          ollie.shake()
          watchOllie()
          whale.dive()
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

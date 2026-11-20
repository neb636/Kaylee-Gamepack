// The snowman chapter's two films (planning/around-the-world/canada.md), on the carnival park under Quebec City's castle
// hotel (story/sets/snowman.ts, the game's own park). Lines: lines.ts `L.snowman.filmIn` and `L.snowman.filmOut`.
//
//   snowman-in (about 13 s): the carnival from the front of the park, the castle hotel up on its cliff; Maple trots in
//   and says hello. She looks left, she looks right: nobody here plays hockey, only snow. She pats a little snowball...
//   and her eyes go wide. "Snow! That's it! Let's make a player!"
//   snowman-out (about 13 s): Tuque, the snowman she built in the game (red tuque, sash, mittens), has dozed off after
//   the parade. Maple boops his carrot and he blinks awake. Can he play hockey? She throws a snowball at him: BOING, it
//   bounces off his round tummy and plops on her head. "Everything bounces off my tummy!" She ties the team's pink scarf on him.
//
// The camera stands on +z looking toward -z (the castle is at the far end), so an actor facing 0 degrees faces it.
import { cam, close } from '../../../../engine3d/shots'
import { snowSfx } from '../../activities/snowman/sounds'
import { L } from '../../lines'
import { CARNIVAL } from '../sets/snowman'
import type { StoryFilm } from '../stage'

const IN = L.snowman.filmIn
const OUT = L.snowman.filmOut
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
/** Maple and Tuque side by side, close enough that the snowball reads: its throw, the boing, its flight home. */
const SIDE = cam([-0.3, 0.98, 4.25], [-0.2, 0.8, 1.3], undefined, { sway: 0.012, tall: { eye: [-0.2, 1.15, 6.1] } })

export const SNOWMAN_IN: StoryFilm = {
  id: 'snowman-in',
  set: CARNIVAL,
  beats(s) {
    const set = s.use(CARNIVAL)
    const { maple } = s.cast
    const ball = set.ball
    const BALL = { x: 0.42, z: 2.75, r: 0.17 }
    return [
      {
        // The carnival: flags, lanterns, the castle hotel up on its cliff. Maple trots in from the side.
        id: 'hello',
        shot: cam([0, 3.6, 15.5], [0, 3.2, -12], { eye: [0.25, 1.25, 5.4], look: [0, 0.85, 2.1] }, { ease: 'inOut', move: 2.6, tall: { eye: [0, 4.4, 19], to: { eye: [0.25, 1.4, 6.6], look: [0, 0.9, 2.1] } } }),
        say: IN.hello,
        sayAt: 0.8,
        hold: 0.2,
        start: () => {
          s.sfx.air('winter')
          s.snow = 0.25
          maple.place(-2.3, 0, 1.1, 60)
          maple.walkTo(-0.15, 2.3, 1.7, 0)
          snowSfx.trumpet()
          set.trumpet.toot()
        },
        cues: [[0.6, () => snowSfx.bells()], [1.8, () => (maple.wave(), maple.pull('happy'))], [2.5, () => (set.drum.hit(), snowSfx.drum())]],
      },
      {
        // Left: snow. Right: snow. Nobody with a hockey stick anywhere.
        id: 'none',
        shot: close(maple, 0.25, 2.7),
        say: IN.none,
        sayAt: 0.5,
        hold: 0.2,
        start: () => {
          maple.place(-0.15, 0, 2.3, 0)
        },
        tick: (_k, t) => {
          maple.headTurn = t < 0.25 ? 0 : t < 1.1 ? 0.85 * clamp01((t - 0.25) / 0.3) : t < 2 ? 0.85 - 1.7 * clamp01((t - 1.1) / 0.35) : -0.85 * (1 - clamp01((t - 2) / 0.3))
        },
        cues: [[2.2, () => maple.pull('sad')]],
      },
      {
        // A little snowball at her feet: pat, pat, pat.
        id: 'pat',
        shot: cam([1.5, 0.75, 5], [0.1, 0.42, 2.4], { eye: [1.35, 0.7, 4.7] }, { tall: { eye: [1.7, 0.9, 6] } }),
        dur: 1.9,
        start: () => {
          maple.headTurn = 0
          maple.place(-0.15, 0, 2.3, 22)
          s.put(ball, BALL.x, BALL.r, BALL.z)
          ball.scale.setScalar(BALL.r)
          maple.lean = 0.45
        },
        tick: (_k, t) => {
          // Three pats: her paws go up and down, and the ball squishes under each.
          const pat = t > 0.15 && t < 1.5 ? Math.max(0, Math.sin((t - 0.15) * Math.PI * 2.2)) : 0
          maple.armsUp = 0.15 + pat * 0.35
          const sq = t > 0.15 && t < 1.65 ? Math.max(0, -Math.sin((t - 0.15) * Math.PI * 2.2)) * 0.18 : 0
          ball.scale.set(BALL.r * (1 + sq * 0.6), BALL.r * (1 - sq), BALL.r * (1 + sq * 0.6))
        },
        cues: [
          [0.35, () => (snowSfx.pat(), s.puff(BALL.x, 0.3, BALL.z, 4))],
          [0.8, () => s.puff(BALL.x, 0.3, BALL.z, 4)],
          [1.25, () => s.puff(BALL.x, 0.3, BALL.z, 4)],
          [1.6, () => ((maple.lean = 0), (maple.armsUp = 0), maple.pull('wow', true))],
        ],
      },
      {
        // The idea: eyes wide, a hop, both paws up, sparkles.
        id: 'idea',
        shot: close(maple, 0.35, 2.3, 0.1),
        say: IN.idea,
        sayAt: 0.35,
        hold: 0.4,
        start: () => {
          maple.lean = 0
          maple.place(-0.15, 0, 2.3, 8)
        },
        cues: [
          [0.1, () => (s.sfx.chime(), s.sparkle(maple.pos.x, 1.25, maple.pos.z, 16))],
          [1.15, () => (maple.cheer(), maple.hop(), (maple.armsUp = 1), s.sparkle(maple.pos.x, 1.2, maple.pos.z, 12))],
          [2.1, () => (maple.armsUp = 0.4)],
        ],
      },
    ]
  },
}

export const SNOWMAN_OUT: StoryFilm = {
  id: 'snowman-out',
  set: CARNIVAL,
  beats(s) {
    const set = s.use(CARNIVAL)
    const { maple, tuque } = s.cast
    const ball = set.ball
    const T = { x: 0.6, z: 1, face: -24 }
    const M = { x: -0.75, z: 1.75, face: 34 }
    /** Where the snowball sits on Maple's head. */
    const onHead = () => maple.at(1.06)
    let hat = false
    return [
      {
        // Tuque, dozing on his feet after the parade (a little whistling snore). Maple boops his carrot: awake!
        id: 'wake',
        shot: cam([-0.45, 1.2, 4.7], [-0.05, 0.85, 1.2], { eye: [-0.4, 1.15, 4.3] }, { tall: { eye: [-0.3, 1.35, 6] } }),
        say: OUT.wake,
        sayAt: 0.95,
        hold: 0.25,
        start: () => {
          s.sfx.air('winter')
          s.snow = 0.2
          tuque.place(T.x, 0, T.z, T.face)
          tuque.asleep = true
          maple.place(M.x, 0, M.z, M.face)
          snowSfx.snore()
        },
        cues: [
          [0.4, () => (maple.armsUp = 0.75)],
          [0.7, () => (s.sfx.pop(), (tuque.asleep = false), tuque.pull('wow'), snowSfx.wake(), s.sparkle(T.x, 1.25, T.z, 14))],
          [1.0, () => (maple.armsUp = 0)],
          [1.2, () => tuque.wave()],
        ],
      },
      {
        id: 'ask',
        shot: close(maple, 0.45, 2.3),
        say: OUT.ask,
        sayAt: 0.2,
        hold: 0.2,
        start: () => {
          tuque.asleep = false
          maple.place(M.x, 0, M.z, 22)
          maple.pull('happy')
        },
      },
      {
        // Maple tries a shot, both of them in the picture side by side: the snowball flies at his tummy, BOING (he
        // jiggles like a jelly), and it sails right back in a high arc and plops on her own head.
        id: 'boing',
        shot: SIDE,
        dur: 2.25,
        start: () => {
          maple.place(M.x, 0, M.z, M.face)
          maple.armsUp = 0.9
          ball.scale.setScalar(0.15)
          ball.visible = false
          hat = false
        },
        tick: (_k, t) => {
          const hand = maple.at(0.95)
          const tummy = tuque.at(0.36)
          tummy.z += 0.34
          tummy.x -= 0.1
          if (t < 0.4) {
            // Winding up, the snowball held high.
            ball.visible = true
            ball.position.copy(hand)
            maple.armsUp = 0.9 + Math.sin(t * 9) * 0.1
          } else if (t < 0.72) {
            // Thrown: straight at his tummy.
            const k = (t - 0.4) / 0.32
            maple.armsUp = 0.2
            ball.position.lerpVectors(hand, tummy, k)
            ball.position.y += Math.sin(k * Math.PI) * 0.2
          } else if (t < 0.84) {
            // Squashed flat against his round tummy for a blink.
            ball.position.copy(tummy)
            ball.scale.set(0.12, 0.18, 0.1)
          } else if (t < 1.65) {
            // BOING: back it sails in a high arc and down onto her head.
            const k = (t - 0.84) / 0.81
            ball.scale.setScalar(0.15)
            ball.position.lerpVectors(tummy, onHead(), k)
            ball.position.y += Math.sin(k * Math.PI) * 0.75
            ball.rotation.x += 0.3
          } else {
            ball.position.copy(onHead())
          }
        },
        cues: [
          [0.4, () => s.sfx.whoosh()],
          [0.72, () => (tuque.boing(), snowSfx.boing(), s.sfx.boing(), s.puff(tuque.pos.x - 0.25, 0.5, tuque.pos.z + 0.35, 10), tuque.pull('wow'))],
          [1.65, () => ((hat = true), s.sfx.thump(), s.puff(maple.pos.x, 1.05, maple.pos.z, 8), maple.pull('wow', true), (maple.headTurn = 0.2))],
          [2.0, () => maple.nod()],
        ],
      },
      {
        // Ho ho! (The same picture: he pats his round tummy; the snowball still sits on her head.)
        id: 'tummy',
        say: OUT.tummy,
        sayAt: 0.15,
        hold: 0.25,
        start: () => {
          maple.headTurn = 0
          tuque.pull('happy')
          tuque.armsUp = 0.25
        },
        tick: (_k, t) => {
          if (hat) ball.position.copy(onHead())
          tuque.armsUp = 0.15 + Math.max(0, Math.sin(t * 7)) * 0.2
        },
        cues: [[1.6, () => tuque.boing()]],
      },
      {
        // She shakes the snow off, hops over and ties the team's pink scarf on him.
        id: 'team',
        shot: cam([-0.1, 1.15, 4.6], [0, 0.85, 1.3], { eye: [-0.1, 1.1, 4.2] }, { tall: { eye: [-0.1, 1.3, 6] } }),
        say: OUT.team,
        sayAt: 0.85,
        hold: 0.45,
        start: () => {
          tuque.armsUp = 0
          tuque.cheer()
          maple.cheer()
          maple.place(M.x, 0, M.z, M.face)
          if (hat) ball.position.copy(onHead())
        },
        tick: () => {
          if (hat) ball.position.copy(onHead())
        },
        cues: [
          [0.05, () => (maple.shake(), s.puff(maple.pos.x, 1.05, maple.pos.z, 10))],
          [0.3, () => ((hat = false), (ball.visible = false))],
          [0.35, () => maple.hopTo(T.x - 0.75, 0, T.z + 0.45, 0.45, 40)],
          [0.85, () => (tuque.scarf(true), s.sfx.chime(), s.sparkle(T.x, 1.0, T.z + 0.2, 18), tuque.pull('happy'))],
          [1.3, () => ((maple.armsUp = 1), maple.hop(), tuque.wave())],
          [2.2, () => (maple.armsUp = 0)],
        ],
      },
    ]
  },
}

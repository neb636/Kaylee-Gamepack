// The way in to Maple's Team (docs/films.md, how films work): on Ottawa's
// frozen canal Maple skates alone. There is the Maple Cup; here come the geese, who win it every year. Last winter
// (the storybook look) she played all by herself: six geese, one beaver. She can't win alone. She needs a team, and
// her friends live all across Canada. About 40 seconds. Lines: lines.ts `L.story.intro`, in this order.
//
// The camera stands on +z looking toward -z (Parliament is at the far end), so an actor facing 0 degrees faces it.
// This is the film to copy for a chapter's: a set, actors on their marks, one line a beat, funny pictures over words.
import { cam, close } from '../../../../engine3d/shots'
import { L } from '../../lines'
import { makeStick } from '../props'
import { RINK, RINK_SET } from '../sets/rink'
import type { StoryFilm } from '../stage'

const X = L.story.intro
const TAU = Math.PI * 2

export const INTRO: StoryFilm = {
  id: 'intro',
  set: RINK_SET,
  beats(s) {
    const set = s.use(RINK_SET)
    const { maple, gus, geese } = s.cast
    const flock = [gus, ...geese]
    const [puck, ...pucks] = set.pucks
    maple.rig.armR.add(makeStick(maple.height, s.bag))
    const [cx, , cz] = set.cupAt
    /** The geese in a V behind Gus, `z` meters down the ice, facing the camera. */
    const vee = (z: number, x = 0) => flock.forEach((g, i) => g.place(x + (i === 0 ? 0 : (i % 2 ? -1 : 1) * Math.ceil(i / 2) * 1.15), 0, z - Math.ceil(i / 2) * 0.9, 0))
    return [
      {
        // The canal from high up: one little beaver and her puck.
        id: 'top',
        shot: cam([7, 9.5, 21], [0, 0.4, -3], { eye: [3.4, 3.4, 11.5], look: [0.6, 0.7, 0.5] }, { ease: 'inOut' }),
        say: X.top,
        sayAt: 1,
        dur: 5,
        start: () => {
          s.sfx.air('winter')
          s.snow = 0.22
          maple.place(-3.6, 0, -2.6, 70)
          maple.glideTo(2.6, 1.2, 4.5, 20)
          s.sfx.skate()
        },
        tick: () => puck.position.set(maple.pos.x + 0.5, 0, maple.pos.z + 0.45),
        cues: [[0, () => (puck.visible = true)], [2.3, () => s.sfx.skate()], [4.4, () => s.sfx.skid()], [4.5, () => s.puff(2.9, 0.1, 1.5, 8)]],
      },
      {
        id: 'hello',
        shot: close(maple, 0.35, 2.7),
        say: X.hello,
        sayAt: 0.5,
        start: () => {
          puck.position.set(0.2, 0, 2.6)
          maple.place(-0.4, 0, 2, -8)
          maple.wave()
        },
        // A twirl on "I love hockey!".
        tick: (_k, t) => (maple.root.rotation.y = t > 2.3 && t < 2.85 ? ((t - 2.3) / 0.55) * TAU - 0.14 : -0.14),
        cues: [[2.3, () => (s.sfx.skate(), maple.pull('happy'))]],
      },
      {
        // The Cup on its stand: it glints, she can hardly look away.
        id: 'cup',
        shot: cam([cx + 0.1, 1.3, cz + 4.9], [cx + 0.45, 0.95, cz + 0.2], { eye: [cx + 0.3, 1.2, cz + 3.9] }),
        say: X.cup,
        sayAt: 0.7,
        start: () => {
          // (Beside it, turned three quarters to us, looking up at it.)
          maple.place(cx + 1.05, 0, cz + 0.5, -32)
          maple.headTurn = -0.4
          maple.armsUp = 0.3
        },
        cues: [[0.3, () => (s.sfx.glint(), s.sparkle(cx, 1.6, cz, 12))], [2.2, () => s.sparkle(cx, 1.7, cz, 8)]],
      },
      {
        // Honk! Down the ice they come, in a V.
        id: 'honk',
        shot: cam([-2.6, 1.1, 7.2], [0.3, 1, -3], { eye: [-2, 1.05, 6.4] }),
        dur: 2.9,
        start: () => {
          maple.armsUp = 0
          maple.headTurn = 0
          maple.place(-0.2, 0, 3.6, 150)
          maple.pull('wow')
          vee(-17)
          flock.forEach((g, i) => g.glideTo(g.pos.x, g.pos.z + 14.6, 2.2 + (i ? 0.15 : 0), 0))
          s.sfx.honks()
        },
        cues: [[0.6, () => s.sfx.skate()], [2.15, () => (s.sfx.skid(), s.puff(0, 0.1, -1.8, 14), s.puff(-1.4, 0.1, -2.6, 8), s.puff(1.4, 0.1, -2.6, 8))], [2.3, () => maple.hop()]],
      },
      {
        id: 'geese',
        shot: cam([-1.1, 1.25, 1.9], () => gus.head(), { eye: [-0.8, 1.2, 1.2] }),
        say: X.geese,
        sayAt: 0.3,
        start: () => {
          gus.armsUp = 0.6
          s.sfx.honk()
        },
        cues: [[1.6, () => geese.forEach((g, i) => i % 2 === 0 && g.hop())], [2.6, () => (geese.forEach((g, i) => i % 2 === 1 && g.hop()), (gus.armsUp = 0))]],
      },
      {
        // The memory: last winter. Six geese skate rings round one little beaver, passing the puck over her head.
        id: 'last',
        turn: true,
        memory: true,
        shot: cam([0, 5.2, 7.4], [0, 0.5, -1.2], { eye: [0, 3.8, 6] }),
        say: X.last,
        sayAt: 0.9,
        dur: 4.2,
        hold: 0.3,
        start: () => {
          maple.cheer()
          maple.place(0, 0, -1.2, 0)
          maple.pull('wow', true)
          flock.forEach((g) => g.place(0, 0, 0))
          s.sfx.skate()
        },
        tick: (_k, t) => {
          // Round they go; she turns after them, never quite keeping up.
          flock.forEach((g, i) => {
            const a = t * 1.9 + (i / flock.length) * TAU
            g.root.position.set(Math.sin(a) * 2.7, 0, -1.2 + Math.cos(a) * 2.2)
            g.root.rotation.y = a + Math.PI / 2
            g.lean = 0.2
          })
          maple.root.rotation.y = Math.sin(t * 2.4) * 1.1
          const a = t * 1.9 * 2.6
          puck.position.set(Math.sin(a) * 2.3, 0, -1.2 + Math.cos(a) * 1.9)
        },
        cues: [[1.5, () => s.sfx.honks()], [3, () => s.sfx.skate()]],
      },
      {
        // Still the memory: her net. In they go, one, two, three, and she sits down on her tail.
        id: 'six',
        memory: true,
        shot: cam([0.9, 1.8, 0.4], [-0.25, 0.7, RINK.zG + 1.2], { eye: [0.9, 1.4, -2.2] }),
        say: X.six,
        sayAt: 2.5,
        dur: 4.8,
        hold: 0.3,
        start: () => {
          maple.cheer()
          maple.place(0, 0, RINK.zG + 1.3, 0)
          flock.forEach((g, i) => {
            const side = i % 2 ? -1 : 1
            g.lean = 0
            g.place(side * (1.9 + Math.floor(i / 2) * 0.8), 0, -6 - Math.floor(i / 2) * 0.45, side * -30)
          })
          gus.place(-1.5, 0, -6.4, 30)
          puck.visible = false
        },
        tick: (_k, t) => {
          // Three pucks, one after another, from a goose on each side past her into the net.
          pucks.slice(0, 3).forEach((p, i) => {
            const k = (t - 0.4 - i * 0.62) / 0.42
            p.visible = k > 0
            const side = i % 2 ? 1 : -1
            const kk = Math.min(1, Math.max(0, k))
            p.position.set(side * 1.9 * (1 - kk) + side * 0.55 * kk, 0, -6 + (RINK.zG + 0.25 + 6) * kk)
          })
          maple.armsUp = t < 2.2 ? 0.5 + 0.5 * Math.sin(t * 9) : 0
          maple.headTurn = t < 2.2 ? Math.sin(t * 5) * 0.7 : 0
          // The fourth puck: up in a high arc, down onto her head, where it stays.
          const hat = pucks[3]
          const h = Math.min(1, Math.max(0, (t - 2.3) / 0.6))
          hat.visible = t > 2.3
          maple.head(hat.position)
          hat.position.y += 0.26 + (1 - h) * (1 - h) * 2.4
        },
        cues: [
          ...[0, 1, 2].flatMap((i): [number, () => void][] => [
            [0.4 + i * 0.62, () => s.sfx.slap()],
            [0.82 + i * 0.62, () => (s.sfx.net(), s.puff(i % 2 ? 0.55 : -0.55, 0.3, RINK.zG + 0.3, 5))],
          ]),
          // (She droops, and one last puck comes down on her head.)
          [2.3, () => (maple.pull('sad', true), s.sfx.plop(), s.puff(0, 0.1, RINK.zG + 1.6, 6))],
          [2.9, () => s.sfx.bonk()],
          [2.6, () => (gus.armsUp = 1)],
          [3.4, () => (s.sfx.honks(), geese.forEach((g) => g.hop()))],
          [5, () => (gus.armsUp = 0)],
        ],
      },
      {
        // Now again: alone on the big ice.
        id: 'need',
        turn: true,
        shot: close(maple, 0.3, 2.5),
        say: X.need,
        sayAt: 0.9,
        start: () => {
          for (const g of flock) g.hide()
          for (const p of pucks) p.visible = false
          maple.lean = 0
          maple.armsUp = 0
          maple.headTurn = 0
          maple.place(0.4, 0, 2.2, -6)
          maple.pull('sad', true)
        },
        // (Brave again on "I need a team!")
        cues: [[2.6, () => (maple.cheer(), maple.hop(), (maple.armsUp = 1))], [3.5, () => (maple.armsUp = 0)]],
      },
      {
        // One paw east, the other west, then straight to us.
        id: 'ask',
        shot: cam([0.4, 1.25, 6.2], [0.4, 0.8, 2.2], { eye: [0.4, 1.12, 4.7], look: [0.4, 0.82, 2.2] }, { move: 3.4, ease: 'inOut' }),
        say: X.ask,
        sayAt: 0.3,
        hold: 0.3,
        tick: (_k, t) => {
          maple.headTurn = t < 0.5 ? 0 : t < 1.4 ? 0.7 : t < 2.3 ? -0.7 : 0
          maple.armsUp = t > 0.5 && t < 2.3 ? 0.75 : 0
        },
        cues: [[2.6, () => maple.nod()]],
      },
      {
        // Sparkle's balloon comes down behind her.
        id: 'go',
        shot: cam([1.9, 1.3, 7], [-0.8, 3.8, 0], { eye: [1.9, 1.55, 7], look: [-0.6, 1.45, 0.5] }, { fov: 50, move: 2.6 }),
        say: X.go,
        sayAt: 1,
        dur: 3.8,
        hold: 0.5,
        start: () => {
          s.put(set.balloon.root, -1.8, 13, -1.6)
          s.sfx.burner()
          s.sfx.chime()
        },
        tick: (k) => {
          const d = 1 - (1 - Math.min(1, k * 1.3)) ** 2
          set.balloon.root.position.y = 13 - d * 12.6
        },
        cues: [[1.4, () => (maple.turnTo(-1.8, -1.6), maple.hop(), (maple.armsUp = 1))], [2.4, () => s.sfx.burner()], [3.2, () => (maple.place(maple.pos.x, 0, maple.pos.z, -6), maple.wave())]],
      },
    ]
  },
}

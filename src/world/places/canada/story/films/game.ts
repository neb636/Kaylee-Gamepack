// The big game's two films (planning/around-the-world/canada.md), played by the finale (activities/party/): `game-in`
// before the hockey and `game-win` after the last goal, on the canal in the evening (sets/rink.ts RINK_EVENING: the
// lamps lit, a little snow). Lines: lines.ts `L.story.gameIn` and `L.story.gameWin`, in play order.
//
// game-in (about 16 s): the team in a row in their pink scarves on one side of center ice, Roxy's kits on the snowbank
// with tiny flags, Gus and his geese across from them. Gus scoffs, Maple answers for all of them, Lulu sings from the
// snowbank (everybody hushes), and the puck drops.
// game-win (about 16 s): the Cup held up in confetti; Gus skates over and bows his long neck; the Cup is full of maple
// syrup; Maple pours it on the snow and there is maple taffy on a stick for everybody, geese too; crunch.
//
// Who's on the team: the finale's `team=` link param if there is one (activities/party/sections.ts), else all six.
// The camera stands on +z looking toward -z: the team on the left faces right, the geese on the right face left, each
// cheated about 30 degrees toward the camera.
import type { Group } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { cam, close } from '../../../../engine3d/shots'
import { makeFlag, makeCupSyrup, makeRibbons, makeSnowPatch, makeStream, makeTaffy } from '../../activities/party/taffy'
import { partySfx } from '../../activities/party/sounds'
import { teamFrom } from '../../activities/party/sections'
import { Goose } from '../../characters/goose'
import { Lulu } from '../../characters/lulu'
import type { Performer } from '../../characters/toy'
import { Tuque } from '../../characters/tuque'
import { L } from '../../lines'
import { Friend } from '../cast'
import { TEAM } from '../chapters'
import { makeCup, makeStick } from '../props'
import { RINK_EVENING } from '../sets/rink'
import type { StoryStage, StoryFilm } from '../stage'

const IN = L.story.gameIn
const WIN = L.story.gameWin
type Mate = (typeof TEAM)[keyof typeof TEAM]['who']

/** Who came: the `team` param of the finale's link, else everybody. */
function teamHere(): Set<Mate> {
  const q = new URLSearchParams(location.hash.split('?')[1] ?? '')
  return new Set(teamFrom(q.get('team') || 'all', []).map((c) => TEAM[c].who))
}

/** The team (whoever came), each in the pink scarf: Maple first. */
function lineUp(s: StoryStage) {
  const c = s.cast
  const here = teamHere()
  const mates: Partial<Record<Mate, Performer>> = {}
  for (const w of here) {
    const a = c[w]
    if (a instanceof Friend || a instanceof Tuque || a instanceof Lulu) a.scarf(true)
    mates[w] = a
  }
  const kits = here.has('roxy') ? c.kits.map((k) => (k as Friend).scarf(true)) : []
  return { maple: c.maple, mates, kits, gus: c.gus, geese: c.geese }
}

/** Where everyone stands at center ice: the team in a row on the left (facing right, cheated to the camera), the geese
 *  in a V on the right. */
const ROW: [Mate | 'maple', number, number][] = [
  ['maple', -0.9, 1.5],
  ['roxy', -1.75, 0.75],
  ['tuque', -2.55, 0],
  ['ollie', -1.55, 2.45],
  ['misty', -3.35, -0.8],
  ['monty', -4.1, -1.7],
]
/** The happy bunch round Maple (at 0, 2) after the game, facing the camera: small ones in front, Monty at the back. */
const BUNCH: [Mate, number, number, number][] = [
  ['roxy', 0.95, 1.55, -15],
  ['ollie', -0.95, 1.55, 15],
  ['tuque', -1.85, 0.85, 15],
  ['misty', 1.85, 0.7, -15],
  ['monty', 0.15, -0.35, 0],
  ['lulu', 2.95, 1.5, -25],
]
const GEESE: [number, number][] = [
  [1.25, 0.6],
  [2.15, -0.2],
  [2.05, 1.5],
  [3.0, -1.0],
  [2.9, 2.3],
  [3.85, -1.8],
]

/** Taffy on a stick into someone's hand (or wing, or beak). */
function giveTaffy(a: Performer, bag: Bag) {
  const t = makeTaffy(bag, Math.max(0.32, a.height * 0.38))
  if (a instanceof Friend) {
    const H = a.height
    t.position.set(0.05 * H, -0.15 * H, 0.06 * H)
    t.rotation.x = 0.5
    a.rig.armR.add(t)
  } else if (a instanceof Goose) a.hold(t)
  else if (a instanceof Tuque) {
    // In his right mitten.
    t.position.set(0.5 * a.height, 0.55 * a.height, 0.05)
    a.body.add(t)
  } else if (a instanceof Lulu) {
    // Crosswise in her bill.
    t.position.set(-0.15, 0.42 * a.height, 0.55 * a.height)
    t.rotation.z = Math.PI / 2
    a.body.add(t)
  }
  return t
}

export const GAME_IN: StoryFilm = {
  id: 'game-in',
  set: RINK_EVENING,
  music: 'game',
  beats(s) {
    s.use(RINK_EVENING)
    const { maple, mates, kits, gus, geese } = lineUp(s)
    const flock = [gus, ...geese]
    const puck = s.use(RINK_EVENING).pucks[0]
    for (const a of [maple, mates.roxy, mates.ollie, mates.misty]) if (a instanceof Friend) a.rig.armR.add(makeStick(a.height, s.bag))
    kits.forEach((k) => (k as Friend).rig.armR.add(makeFlag(k.height, s.bag)))
    const lulu = mates.lulu
    const chick = lulu ? s.cast.chick : null
    const team = [maple, ...Object.values(mates).filter((a) => a !== lulu)]
    const placeAll = () => {
      for (const [w, x, z] of ROW) (w === 'maple' ? maple : mates[w])?.place(x, 0, z, 62)
      flock.forEach((g, i) => g.place(GEESE[i][0], 0, GEESE[i][1], -62))
      // The kits on the snowbank behind the team, Lulu on the bank at the front with her chick on her back.
      kits.forEach((k, i) => k.place(-5.75, 0.36, -1.6 + i * 0.75, 55))
      if (lulu) lulu.place(-5.6, 0.38, 2.0, 30)
      if (lulu instanceof Lulu && chick) chick.ride(lulu.body, 0, 0.27 * lulu.height, -0.12 * lulu.height)
    }
    return [
      {
        // The canal in the evening: the whole team in a row, the geese across from them, the kits waving flags.
        id: 'here',
        shot: cam([0.6, 4.4, 14.5], [-0.6, 0.6, -0.6], { eye: [0.3, 2.6, 10.2], look: [-0.5, 0.7, 0] }, { ease: 'inOut', tall: { eye: [0.4, 5, 16], to: { eye: [0.2, 3, 12.5] } } }),
        say: IN.here,
        sayAt: 0.8,
        dur: 4.2,
        start: () => {
          s.sfx.air('winter')
          s.snow = 0.25
          placeAll()
          s.sfx.skate()
        },
        tick: (_k, t) => {
          kits.forEach((k, i) => (k.armsUp = 0.5 + 0.5 * Math.sin(t * 6 + i * 2)))
        },
        cues: [
          [0.6, () => kits.forEach((k) => k.hop())],
          [2.6, () => team.forEach((a, i) => i % 2 === 0 && a.hop())],
          [3.1, () => team.forEach((a, i) => i % 2 === 1 && a.hop())],
          [3.4, () => (partySfx.kits(), kits.forEach((k) => k.hop()))],
        ],
      },
      {
        // Gus, wings out: the show-off. His geese honk behind him.
        id: 'gus',
        shot: close(gus, -0.9, 2.5),
        say: IN.gus,
        sayAt: 0.4,
        start: () => {
          kits.forEach((k) => (k.armsUp = 0))
          gus.armsUp = 0.7
          s.sfx.honk()
        },
        cues: [
          [1.2, () => (s.sfx.honks(), geese.forEach((g, i) => i % 2 === 0 && g.hop()))],
          [2.4, () => ((gus.armsUp = 0), gus.nod())],
        ],
      },
      {
        // Maple, brave, her friends behind her: "All of us!" and up they all go.
        id: 'ready',
        shot: cam([1.1, 1.3, 4.9], [-1.9, 0.8, 0.3], { eye: [0.9, 1.25, 4.3] }, { tall: { eye: [1.3, 1.6, 6.2] } }),
        say: IN.ready,
        sayAt: 0.35,
        start: () => {
          maple.pull('happy')
          maple.nod()
        },
        cues: [
          [1.7, () => team.forEach((a) => ((a.armsUp = 0.8), a.hop()))],
          [2.8, () => team.forEach((a) => (a.armsUp = 0))],
        ],
      },
      ...(lulu
        ? [
            {
              // Lulu lifts her head and calls across the ice (her real call), her chick too; Sparkle hushes everyone.
              id: 'song',
              shot: cam([-4.75, 0.95, 3.75], () => lulu.head(), { eye: [-4.95, 0.85, 3.35] }, { fov: 34, tall: { eye: [-4.6, 1.1, 4.4] } }),
              say: IN.song,
              sayAt: 1.6,
              dur: 4.4,
              start: () => {
                if (lulu instanceof Lulu) lulu.calling = 0
                for (const a of team) a.headTurn = 0.5
              },
              tick: (_k: number, t: number) => {
                if (lulu instanceof Lulu) lulu.calling = t < 0.3 ? 0 : t < 3.6 ? Math.min(1, (t - 0.3) * 3) : Math.max(0, 1 - (t - 3.6) * 2)
              },
              cues: [
                [0.35, () => s.sfx.loon()],
                [2.2, () => s.sparkle(lulu.pos.x, 1.0, lulu.pos.z, 10)],
                [3.0, () => chick?.hop()],
              ] as [number, () => void][],
            },
          ]
        : []),
      {
        // The puck drops at center ice between Maple and Gus. Go!
        id: 'drop',
        shot: cam([0.2, 0.9, 4.4], [0.2, 0.5, 1.0], { eye: [0.2, 0.8, 3.9] }, { tall: { eye: [0.2, 1.1, 5.6] } }),
        dur: 2.6,
        hold: 0,
        start: () => {
          for (const a of team) a.headTurn = 0
          maple.place(-0.55, 0, 1.3, 70)
          gus.place(0.95, 0, 0.85, -70)
          maple.lean = 0.35
          gus.lean = 0.35
          s.put(puck, 0.2, 2.4, 1.05)
        },
        tick: (_k, t) => {
          // Down it falls, with a little bounce.
          const k = Math.min(1, t / 0.55)
          puck.position.y = t < 0.55 ? 2.4 * (1 - k * k) : Math.max(0, Math.sin(Math.min(1, (t - 0.55) / 0.25) * Math.PI) * 0.12)
        },
        cues: [
          [0.55, () => (s.sfx.slap(), s.puff(0.18, 0.05, 1.05, 10))],
          [0.9, () => (maple.hop(), s.sfx.skate())],
          [1.0, () => (gus.hop(), s.sfx.honk())],
        ],
      },
    ]
  },
}

export const GAME_WIN: StoryFilm = {
  id: 'game-win',
  set: RINK_EVENING,
  music: 'game',
  beats(s) {
    s.use(RINK_EVENING)
    const { maple, mates, kits, gus, geese } = lineUp(s)
    const bag = s.bag
    const cup = makeCup(bag, 0.62)
    const syrup = makeCupSyrup(bag, 0.62)
    cup.add(syrup)
    const stream = makeStream(bag)
    const ribbons = makeRibbons(bag, 7)
    const patch = makeSnowPatch(bag, 0.7)
    const lulu = mates.lulu
    const team = [maple, ...Object.values(mates).filter((a) => a !== lulu)] as Performer[]
    const everyone = [...team, ...(lulu ? [lulu] : []), ...kits, gus, ...geese]
    const taffies: Group[] = []
    const flock = [gus, ...geese]
    /** The cup in Maple's paws: up over her head (`up` 1), or in front of her (0). */
    let up = 1
    let tip = 0
    const holdCup = () => {
      const H = maple.height
      maple.at(up ? 1.08 : 0.5, cup.position)
      cup.position.y -= up ? 0 : 0.2 * H
      // (In front of her, toward where she faces.)
      const yaw = maple.root.rotation.y
      cup.position.x += Math.sin(yaw) * (up ? 0 : 0.42 * H)
      cup.position.z += Math.cos(yaw) * (up ? 0 : 0.42 * H)
      cup.rotation.set(0, yaw, 0)
      cup.rotateX(tip)
    }
    /** Everybody in a happy bunch round Maple, facing the camera: the team in front, the geese behind. */
    const bunch = () => {
      maple.place(0, 0, 2.0, 0)
      for (const [w, x, z, f] of BUNCH) mates[w]?.place(x, 0, z, f)
      kits.forEach((k, i) => k.place([-2.7, -2.25, 2.5][i], 0, [2.0, 2.45, 2.2][i], i < 2 ? 20 : -20))
      flock.forEach((g, i) => g.place(-2.6 + i * 1.05, 0, -1.2 - (i % 2) * 0.5, i < 3 ? 15 : -15))
    }
    return [
      {
        // The Cup up over Maple's head, confetti, everybody cheering.
        id: 'cup',
        shot: cam([0, 1.5, 6.8], [0, 1.0, 1.4], { eye: [0, 1.4, 5.8] }, { tall: { eye: [0, 1.9, 8.8] } }),
        say: WIN.cup,
        sayAt: 0.8,
        dur: 4,
        start: () => {
          s.sfx.air('winter')
          s.snow = 0.2
          bunch()
          s.put(cup, 0, 0, 0)
          up = 1
          maple.armsUp = 1
          maple.pull('happy')
          for (const g of flock) g.pull('sad', true)
          s.sfx.cheer()
        },
        tick: (_k, t) => {
          holdCup()
          team.forEach((a, i) => i && (a.armsUp = 0.5 + 0.5 * Math.sin(t * 5 + i)))
          kits.forEach((k, i) => (k.armsUp = 0.5 + 0.5 * Math.sin(t * 7 + i)))
        },
        cues: [
          [0.2, () => (s.confetti(0, 2.6, 1.6, 40), s.sfx.glint())],
          [1.4, () => (s.confetti(-1.5, 2.2, 1, 24), team.forEach((a) => a.hop()))],
          [2.6, () => (s.confetti(1.5, 2.2, 1, 24), kits.forEach((k) => k.hop()), partySfx.kits())],
        ],
      },
      {
        // Gus skates over and bows his long neck to her. A good sport.
        id: 'gus',
        shot: cam([1.75, 1.15, 5.7], [0.25, 0.72, 2.6], { eye: [1.6, 1.1, 5.2] }, { tall: { eye: [2.1, 1.4, 7] } }),
        say: WIN.gus,
        sayAt: 1.4,
        start: () => {
          team.forEach((a) => (a.armsUp = 0))
          kits.forEach((k) => (k.armsUp = 0))
          maple.armsUp = 0.45
          up = 0
          maple.place(-0.25, 0, 2.5, 60)
          gus.cheer()
          gus.place(2.6, 0, 1.5, -70)
          gus.glideTo(0.75, 2.75, 1.1, -70)
          s.sfx.skate()
        },
        tick: () => holdCup(),
        cues: [
          [1.15, () => ((gus.lean = 0.75), gus.nod(), s.sfx.honk())],
          [3.0, () => ((gus.lean = 0), maple.nod())],
        ],
      },
      {
        // She looks into the Cup: it's full of maple syrup!
        id: 'syrup',
        shot: cam([0.3, 1.4, 4.2], [0, 0.6, 2.9], { eye: [0.25, 1.2, 3.95], look: [0, 0.72, 2.6] }, { fov: 34 }),
        say: WIN.syrup,
        sayAt: 0.7,
        start: () => {
          gus.hide()
          maple.place(0, 0, 2.45, 0)
          maple.armsUp = 0.45
          syrup.visible = true
          maple.pull('wow')
        },
        tick: () => holdCup(),
        cues: [[0.4, () => (s.sfx.glint(), s.sparkle(cup.position.x, cup.position.y + 0.5, cup.position.z, 10))]],
      },
      {
        // She pours it on a drift of clean snow: golden ribbons... and taffy on a stick for everybody.
        id: 'share',
        shot: cam([1.7, 1.3, 5.7], [0.45, 0.42, 2.85], { eye: [1.55, 1.2, 5.1] }, { tall: { eye: [2.1, 1.6, 7.2] } }),
        say: WIN.share,
        sayAt: 2.3,
        dur: 5,
        start: () => {
          maple.cheer()
          maple.armsUp = 0.45
          maple.place(-0.05, 0, 2.4, 40)
          s.put(patch, 0.75, 0, 3.1, 40)
          s.put(ribbons, 0.75, 0.15, 3.1, 40)
          ribbons.scale.set(0.01, 1, 1)
          tip = 0
        },
        tick: (_k, t) => {
          // Tip, pour (the stream and the ribbons grow), tip back.
          tip = t < 0.4 ? (t / 0.4) * 1.5 : t < 2.0 ? 1.5 : Math.max(0, 1.5 - (t - 2.0) * 3)
          holdCup()
          const pouring = t > 0.35 && t < 2.1
          stream.visible = pouring
          if (pouring) {
            const lip = cup.localToWorld(stream.position.set(0, 0.62 * 0.82, 0.62 * 0.3)).clone()
            s.put(stream, lip.x, lip.y, lip.z)
            stream.scale.y = Math.max(0.05, lip.y - 0.15)
          }
          ribbons.scale.x = Math.min(1, Math.max(0.01, (t - 0.4) / 1.6))
        },
        cues: [
          [0.35, () => partySfx.pour()],
          [2.2, () => (stream.visible = false)],
          [2.3, () => (maple.hop(), s.sparkle(0.75, 0.4, 3.1, 14), s.sfx.chime())],
        ],
      },
      {
        // Everybody, geese too, crunching taffy together.
        id: 'together',
        shot: cam([0, 1.7, 7.4], [0, 0.95, 1.0], { eye: [0, 1.55, 6.5] }, { tall: { eye: [0, 2.3, 10] } }),
        say: WIN.together,
        sayAt: 1.2,
        dur: 4.2,
        hold: 1.2,
        start: () => {
          cup.visible = false
          stream.visible = false
          ribbons.visible = false
          patch.visible = false
          bunch()
          for (const g of flock) g.cheer()
          for (const a of everyone) taffies.push(giveTaffy(a, bag))
          for (const a of everyone) if (a instanceof Friend || a instanceof Goose) a.armsUp = 0.5
          everyone.forEach((a) => a.pull('happy'))
        },
        tick: (_k, t) => {
          // Munch munch: the taffies wiggle.
          taffies.forEach((tf, i) => (tf.rotation.z = Math.sin(t * 9 + i) * 0.15))
        },
        cues: [
          [0.3, () => partySfx.crunch()],
          [1.0, () => (partySfx.crunch(), everyone.forEach((a, i) => i % 3 === 0 && a.hop()))],
          [2.0, () => (s.confetti(0, 2.6, 1, 40), s.sfx.cheer(), maple.hop())],
          [2.9, () => (partySfx.kits(), kits.forEach((k) => k.hop()))],
        ],
      },
    ]
  },
}

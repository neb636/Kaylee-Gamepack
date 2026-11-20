// The big game's two films (planning/around-the-world/canada.md), played by the finale (activities/party/): `game-in`
// before the hockey and `game-win` after the last goal, on the canal in the evening (sets/rink.ts RINK_EVENING: the
// lamps lit, a little snow). Lines: lines.ts `L.story.gameIn` and `L.story.gameWin`, in play order.
//
// game-in (about 15 s): the team in a row in their pink scarves on one side of center ice, Roxy's kits on the snowbank
// with tiny flags, Gus and his geese across from them. Gus scoffs, Maple answers for all of them, Lulu sings from the
// snowbank (everybody hushes), and the puck drops.
// game-win (about 16 s): the team photo, the Cup held up in confetti (two rows, the small ones in front, so every friend
// shows on an iPad either way round and on a phone); Gus, in a close-up of his own, bows his long neck; Maple, facing
// us, looks into the Cup: it's full of maple syrup; she pours it on the snow and there is maple taffy on a stick for
// everybody, geese too; crunch.
//
// Who's on the team: the finale's `team=` link param if there is one (activities/party/sections.ts), else all six.
// The camera stands on +z looking toward -z: in game-in the team on the left faces right, the geese on the right face
// left, each cheated about 30 degrees toward the camera.
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
/** The team photo after the game (Maple in the middle at 0, 2), everyone facing the camera, in two rows with the small
 *  ones in front: Roxy and Ollie beside Maple, Lulu (and her chick) in front on the left, Tuque and Misty behind on
 *  either side, Monty at the back. Kept narrow, so a tall screen fits all of it. */
const PHOTO: [Mate, number, number, number][] = [
  ['roxy', -0.85, 2.15, 15],
  ['ollie', 0.85, 2.15, -15],
  ['lulu', -1.0, 2.95, 20],
  ['tuque', -1.35, 1.15, 15],
  ['misty', 1.38, 1.1, -15],
  ['monty', 0.55, 0.25, -8],
]
/** Roxy's three kits in the very front (they're the smallest), away from the bottom-right corner (the skip button). */
const KITS: [number, number, number][] = [
  [-0.45, 2.85, 10],
  [0.35, 2.9, -10],
  [0.95, 2.75, -20],
]
/** The geese behind on the flanks (Gus on the right), so "geese too!" can see them. */
const FLANKS: [number, number, number][] = [
  [2.35, 1.65, -25],
  [-2.45, 1.35, 25],
  [2.6, 0.5, -20],
  [-2.6, 0.3, 20],
  [3.0, -0.4, -15],
  [-3.0, -0.6, 15],
]
const GEESE: [number, number][] = [
  [1.25, 0.6],
  [2.15, -0.2],
  [2.05, 1.5],
  [3.0, -1.0],
  [2.9, 2.3],
  [3.85, -1.8],
]
/** The team photo's camera: wide enough on an iPad either way round and on a phone. */
const PHOTO_SHOT = { eye: [0, 1.55, 6.9] as [number, number, number], look: [0, 0.62, 1.5] as [number, number, number], tallEye: [0, 2.1, 6.85] as [number, number, number] }

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
        sayAt: 0.5,
        hold: 0.3,
        dur: 3.4,
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
          [0.4, () => kits.forEach((k) => k.hop())],
          [2.1, () => team.forEach((a, i) => i % 2 === 0 && a.hop())],
          [2.5, () => team.forEach((a, i) => i % 2 === 1 && a.hop())],
          [2.8, () => (partySfx.kits(), kits.forEach((k) => k.hop()))],
        ],
      },
      {
        // Gus, wings out: the show-off. His geese honk behind him.
        id: 'gus',
        shot: close(gus, -0.9, 2.5),
        say: IN.gus,
        sayAt: 0.3,
        hold: 0.25,
        start: () => {
          kits.forEach((k) => (k.armsUp = 0))
          gus.armsUp = 0.7
          s.sfx.honk()
        },
        cues: [
          [1.1, () => (s.sfx.honks(), geese.forEach((g, i) => i % 2 === 0 && g.hop()))],
          [2.3, () => ((gus.armsUp = 0), gus.nod())],
        ],
      },
      {
        // Maple, brave, her friends behind her: "All of us!" and up they all go.
        id: 'ready',
        shot: cam([1.1, 1.3, 4.9], [-1.9, 0.8, 0.3], { eye: [0.9, 1.25, 4.3] }, { tall: { eye: [1.3, 1.6, 6.2] } }),
        say: IN.ready,
        sayAt: 0.25,
        hold: 0.25,
        start: () => {
          // (She turns to the camera to say it, her friends behind her.)
          maple.place(-0.9, 0, 1.5, 35)
          maple.pull('happy')
          maple.nod()
        },
        cues: [
          [1.5, () => team.forEach((a) => ((a.armsUp = 0.8), a.hop()))],
          [2.5, () => team.forEach((a) => (a.armsUp = 0))],
        ],
      },
      ...(lulu
        ? [
            {
              // Lulu lifts her head and calls across the ice (her real call), her chick too; Sparkle hushes everyone.
              id: 'song',
              shot: cam([-4.75, 0.95, 3.75], () => lulu.head(), { eye: [-4.95, 0.85, 3.35] }, { fov: 34, tall: { eye: [-4.6, 1.1, 4.4] } }),
              say: IN.song,
              sayAt: 0.6,
              hold: 0.3,
              dur: 3,
              start: () => {
                if (lulu instanceof Lulu) lulu.calling = 0
                for (const a of team) a.headTurn = 0.5
              },
              tick: (_k: number, t: number) => {
                if (lulu instanceof Lulu) lulu.calling = t < 0.15 ? 0 : t < 2.4 ? Math.min(1, (t - 0.15) * 3) : Math.max(0, 1 - (t - 2.4) * 2.5)
              },
              cues: [
                [0.15, () => s.sfx.loon()],
                [1.3, () => s.sparkle(lulu.pos.x, 1.0, lulu.pos.z, 10)],
                [1.9, () => chick?.hop()],
              ] as [number, () => void][],
            },
          ]
        : []),
      {
        // The puck drops at center ice between Maple and Gus. Go!
        id: 'drop',
        shot: cam([0.2, 0.9, 4.4], [0.2, 0.5, 1.0], { eye: [0.2, 0.8, 3.9] }, { tall: { eye: [0.2, 1.1, 5.6] } }),
        dur: 2.2,
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
    const chick = lulu instanceof Lulu ? s.cast.chick : null
    const team = [maple, ...Object.values(mates).filter((a) => a !== lulu)] as Performer[]
    const everyone = [...team, ...(lulu ? [lulu] : []), ...kits, gus, ...geese]
    const taffies: Group[] = []
    const flock = [gus, ...geese]
    /** The cup in Maple's paws: up over her head (`up` 1), at her chest to pour (0.5), or low in front of her (0, so
     *  her face shows over the rim), tipped `tip` toward where she faces. */
    let up = 1
    let tip = 0
    const holdCup = () => {
      const H = maple.height
      maple.at(up === 1 ? 1.08 : up ? 0.62 : 0.1, cup.position)
      const yaw = maple.root.rotation.y
      cup.position.x += Math.sin(yaw) * (up === 1 ? 0 : 0.42 * H)
      cup.position.z += Math.cos(yaw) * (up === 1 ? 0 : 0.42 * H)
      cup.rotation.set(0, yaw, 0)
      cup.rotateX(tip)
    }
    /** The team photo: everybody facing the camera round Maple, the geese behind on the flanks. */
    const photo = () => {
      maple.place(0, 0, 2.0, 0)
      for (const [w, x, z, f] of PHOTO) mates[w]?.place(x, 0, z, f)
      kits.forEach((k, i) => k.place(KITS[i][0], 0, KITS[i][1], KITS[i][2]))
      flock.forEach((g, i) => g.place(FLANKS[i][0], 0, FLANKS[i][1], FLANKS[i][2]))
      if (lulu instanceof Lulu && chick) chick.ride(lulu.body, 0, 0.4 * lulu.height, -0.22 * lulu.height)
    }
    const photoShot = cam(PHOTO_SHOT.eye, PHOTO_SHOT.look, { eye: [PHOTO_SHOT.eye[0], PHOTO_SHOT.eye[1] - 0.05, PHOTO_SHOT.eye[2] - 0.5] }, { tall: { eye: PHOTO_SHOT.tallEye, fov: 56, to: { eye: [PHOTO_SHOT.tallEye[0], PHOTO_SHOT.tallEye[1], PHOTO_SHOT.tallEye[2] - 0.3] } } })
    /** Where Maple steps forward to, in front of the photo, for the close shots (Gus, the syrup, the pour). */
    const FRONT = { x: -0.15, z: 3.4 }
    return [
      {
        // The team photo: the Cup up over Maple's head, confetti, everybody cheering (the geese a bit glum).
        id: 'cup',
        shot: photoShot,
        say: WIN.cup,
        sayAt: 0.4,
        hold: 0.3,
        dur: 3.2,
        start: () => {
          s.sfx.air('winter')
          s.snow = 0.2
          photo()
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
          [0.15, () => (s.confetti(0, 2.6, 1.6, 40), s.sfx.glint())],
          [1.1, () => (s.confetti(-1.5, 2.2, 1, 24), team.forEach((a) => a.hop()))],
          [2.1, () => (s.confetti(1.5, 2.2, 1, 24), kits.forEach((k) => k.hop()), partySfx.kits())],
        ],
      },
      {
        // Gus skates up in front of the others, close, turned to us: he bows his long neck to her. A good sport.
        id: 'gus',
        shot: cam([FRONT.x + 0.85, 0.95, FRONT.z + 2.45], [FRONT.x + 0.7, 0.72, FRONT.z], { eye: [FRONT.x + 0.8, 0.92, FRONT.z + 2.25] }, { fov: 36, tall: { eye: [FRONT.x + 0.8, 1.1, FRONT.z + 3.3], fov: 44 } }),
        say: WIN.gus,
        sayAt: 0.75,
        hold: 0.2,
        start: () => {
          team.forEach((a) => (a.armsUp = 0))
          kits.forEach((k) => (k.armsUp = 0))
          up = 0
          maple.armsUp = 0.45
          maple.place(FRONT.x, 0, FRONT.z, 35)
          gus.cheer()
          gus.place(FRONT.x + 1.6, 0, FRONT.z + 0.1, -60)
          gus.glideTo(FRONT.x + 1.0, FRONT.z + 0.2, 0.45, -32)
          s.sfx.skate()
        },
        tick: (_k, t) => {
          holdCup()
          // The bow: down low, and back up to say it.
          gus.lean = t > 0.4 && t < 0.95 ? 0.75 : 0
        },
        cues: [
          [0.45, () => (gus.nod(), s.sfx.honk())],
          [2.6, () => maple.nod()],
        ],
      },
      {
        // Maple, facing us, looks down into the Cup: it's full of maple syrup!
        id: 'syrup',
        shot: cam([FRONT.x + 0.1, 1.55, FRONT.z + 2.15], [FRONT.x, 0.45, FRONT.z + 0.2], { eye: [FRONT.x + 0.08, 1.5, FRONT.z + 1.95] }, { fov: 36, tall: { eye: [FRONT.x + 0.1, 1.7, FRONT.z + 2.35], fov: 44 } }),
        say: WIN.syrup,
        sayAt: 0.3,
        hold: 0.2,
        start: () => {
          gus.hide()
          maple.place(FRONT.x, 0, FRONT.z, 0)
          maple.armsUp = 0.3
          maple.headTurn = 0
          syrup.visible = true
          maple.pull('wow')
        },
        tick: () => holdCup(),
        cues: [[0.2, () => (s.sfx.glint(), s.sparkle(cup.position.x, cup.position.y + 0.55, cup.position.z, 10))]],
      },
      {
        // She pours it on a drift of clean snow: golden ribbons... and taffy on a stick for everybody.
        id: 'share',
        shot: cam([FRONT.x + 2.0, 1.45, FRONT.z + 3.6], [FRONT.x + 0.5, 0.45, FRONT.z + 0.3], { eye: [FRONT.x + 1.85, 1.35, FRONT.z + 3.1] }, { tall: { eye: [FRONT.x + 2.3, 1.8, FRONT.z + 4.8] } }),
        say: WIN.share,
        sayAt: 1.15,
        hold: 0.25,
        start: () => {
          maple.cheer()
          maple.armsUp = 0.45
          maple.place(FRONT.x, 0, FRONT.z, 40)
          s.put(patch, FRONT.x + 0.8, 0, FRONT.z + 0.7, 40)
          s.put(ribbons, FRONT.x + 0.8, 0.15, FRONT.z + 0.7, 40)
          ribbons.scale.set(0.01, 1, 1)
          tip = 0
          up = 0.5
        },
        tick: (_k, t) => {
          // Tip, pour (the stream and the ribbons grow), tip back.
          tip = t < 0.3 ? (t / 0.3) * 1.5 : t < 1.3 ? 1.5 : Math.max(0, 1.5 - (t - 1.3) * 3)
          holdCup()
          const pouring = t > 0.25 && t < 1.4
          stream.visible = pouring
          if (pouring) {
            const lip = cup.localToWorld(stream.position.set(0, 0.62 * 0.82, 0.62 * 0.3)).clone()
            s.put(stream, lip.x, lip.y, lip.z)
            stream.scale.y = Math.max(0.05, lip.y - 0.15)
          }
          ribbons.scale.x = Math.min(1, Math.max(0.01, (t - 0.3) / 1.0))
        },
        cues: [
          [0.25, () => partySfx.pour()],
          [1.45, () => (stream.visible = false)],
          [1.5, () => (maple.hop(), s.sparkle(FRONT.x + 0.8, 0.4, FRONT.z + 0.7, 14), s.sfx.chime())],
        ],
      },
      {
        // The team photo again, everybody (geese too) crunching taffy together.
        id: 'together',
        shot: photoShot,
        say: WIN.together,
        sayAt: 0.5,
        hold: 0.7,
        dur: 3,
        start: () => {
          cup.visible = false
          stream.visible = false
          ribbons.visible = false
          patch.visible = false
          photo()
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
          [0.2, () => partySfx.crunch()],
          [0.8, () => (partySfx.crunch(), everyone.forEach((a, i) => i % 3 === 0 && a.hop()))],
          [1.5, () => (s.confetti(0, 2.6, 1, 40), s.sfx.cheer(), maple.hop())],
          [2.2, () => (partySfx.kits(), kits.forEach((k) => k.hop()))],
        ],
      },
    ]
  },
}

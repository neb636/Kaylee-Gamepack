// The bike chapter's two films (planning/around-the-world/canada.md), on Mont-Sainte-Anne (story/sets/bike.ts: the
// game's own mountain). Lines: lines.ts `L.bike.filmIn` and `L.bike.filmOut`, in play order.
//
// In (about 12 s): at the top of the trail by the gondola, Maple with her bike tells us about Monty, the biggest moose
// in Canada; the camera looks all the way down the mountain from the top and zooms in on a moose in the pool at the bottom
// (splashes round him so he reads); she hops on her bike (the helmet pops on), rings the bell and rolls off down the trail.
//
// Out (about 15 s): the pool under the waterfall. Monty stands in his bath, a lily pad on one antler, chewing. "Will
// you be our goalie?" "What does a goalie do?" "You stand in front of the net. Easy!" "I am very good at standing." He does
// not move. A pinecone drops out of the spruce and bonks off his antlers: he doesn't notice. "Nothing gets past
// Monty!" On goes the team's pink scarf. The comedy is how little he moves: everyone else does the moving.
import { Vector3 } from 'three'
import type { FilmActor } from '../../../../engine3d/characters/actor'
import type { FilmShot } from '../../../../engine3d/film'
import type { Bag } from '../../../../engine3d/dispose'
import { chew, lilyPad } from '../../activities/bike/monty'
import { bikeSfx } from '../../activities/bike/sounds'
import { L } from '../../lines'
import { MOUNTAIN, type Spot } from '../sets/bike'
import type { StoryFilm } from '../stage'

/** Monty a little bigger than the cast's usual (he's the biggest moose in Canada, beside little Maple), dressed for his
 *  bath: the lily pad on his antler. */
function bath(monty: FilmActor, bag: Bag) {
  monty.root.scale.setScalar(1.25)
  lilyPad(monty.rig, bag)
}

const IN = L.bike.filmIn
const OUT = L.bike.filmOut
const tmp = new Vector3()
const tmp2 = new Vector3()

/** A shot at a spot, in its own directions: the camera at `eye`, looking at `look` (each a point above the ground,
 *  or a function for someone moving), moving to `to` over the beat. */
function at(spot: Spot, eye: [number, number, number] | (() => Vector3), look: [number, number, number] | (() => Vector3), more: Partial<FilmShot> & { toEye?: [number, number, number] } = {}): FilmShot {
  const pt = (p: [number, number, number] | (() => Vector3)) => (typeof p === 'function' ? p : spot.p(...p))
  const { toEye, ...rest } = more
  return { eye: pt(eye), look: pt(look), ...(toEye ? { to: { eye: spot.p(...toEye), ...rest.to } } : {}), ...rest }
}
/** Someone's face from in front of them as the spot sees it: `side` to the camera's right, `back` toward the camera,
 *  `up` above their face (negative: looking up at them). */
const near = (spot: Spot, who: { head(out?: Vector3): Vector3 }, side: number, back: number, up: number) => {
  const c = Math.cos(spot.yaw)
  const s = Math.sin(spot.yaw)
  return () => who.head(tmp).add(new Vector3(side * c + back * s, up, -side * s + back * c))
}

export const BIKE_IN: StoryFilm = {
  id: 'bike-in',
  set: MOUNTAIN,
  beats(s) {
    const set = s.use(MOUNTAIN)
    const { top, pool, bike } = set
    const { maple, monty } = s.cast
    const camera = s.rig.camera
    const closeUpNear = camera.near
    bath(monty, s.bag)
    set.monty = { chew: (t) => chew(monty, t) }
    // Monty far below, in his bath in the pool (only just to be made out from up here).
    const [mx, mz] = pool.xz(-0.4, 8.6)
    monty.place(mx, set.course.poolY - 0.35, mz, pool.face(-10))
    // Her bike, parked on the trail pointing down it.
    const parkS = 6.3
    const parkLat = -0.85
    const park = () => {
      const p = set.course.trail.spot(parkS, parkLat)
      bike.root.position.set(p.x, set.course.ground(parkS, parkLat), p.z)
      bike.root.rotation.y = top.face(180) * (Math.PI / 180)
      bike.root.visible = true
      bike.alone(true)
    }
    const montyHead = () => monty.head(tmp).clone()
    /** Splashes round Monty in his pool (they read even from the top of the mountain). */
    /** A point `fwd` meters ahead of where the bike was parked (down the trail) and `side` to its side, at eye height. */
    const parked = new Vector3()
    const ahead = (fwd: number, side: number) => {
      if (!parked.lengthSq()) parked.copy(bike.root.position)
      const yaw = bike.root.rotation.y
      return tmp2.set(parked.x + Math.sin(yaw) * fwd + Math.cos(yaw) * side, parked.y + 1.0, parked.z + Math.cos(yaw) * fwd - Math.sin(yaw) * side)
    }
    const ripple = () => {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        s.splash(mx + Math.cos(a) * 0.9, set.course.poolY + 0.05, mz + Math.sin(a) * 0.9, 5)
      }
    }
    return [
      {
        // At the top, the mountain falling away behind her.
        id: 'high',
        shot: at(top, [1.5, 1.05, 3.6], [-0.15, 0.62, -0.2], { toEye: [1.15, 0.95, 3.0], tall: { eye: top.p(1.2, 1.25, 4.6), look: top.p(-0.2, 0.75, -0.2) } }),
        say: IN.high,
        sayAt: 0.4,
        hold: 0.2,
        start: () => {
          s.sfx.air('forest')
          park()
          top.place(maple, 0.35, 0.1, -12)
          maple.wave()
        },
        // (Her arms go wide on "the biggest moose".)
        cues: [
          [1.7, () => ((maple.armsUp = 1), maple.hop(), maple.pull('wow'))],
          [3.1, () => (maple.armsUp = 0)],
        ],
      },
      {
        // From the top, way down the mountain to the waterfall's pool, and in, and in: a moose having his bath, a
        // ring of ripples and splashes round him so he can't be missed.
        id: 'bath',
        shot: { eye: () => set.lookout, look: montyHead, fov: 9, to: { fov: 1.25 }, move: 1.5, ease: 'inOut', sway: 0, tall: { fov: 13, to: { fov: 1.9 } } },
        say: IN.bath,
        sayAt: 0.3,
        hold: 0.3,
        start: () => {
          // The zoom stays at the summit. Use a farther near plane so distant surfaces and their ink hulls
          // have enough depth precision to draw in order.
          camera.near = 50
          camera.updateProjectionMatrix()
          maple.cheer()
          maple.armsUp = 0
          s.sfx.whoosh()
        },
        // (He dips his nose into the water, way down there, and splashes.)
        tick: (_k, t) => (monty.lean = t > 1.7 && t < 2.6 ? 0.6 : 0),
        cues: [
          [0.6, () => ripple()],
          [1.8, () => (ripple(), bikeSfx.munch())],
          [2.6, () => ripple()],
        ],
      },
      {
        // Back up top: she hops on, the helmet's on, ding ding, and off she rolls down the trail.
        id: 'go',
        // (The camera turns to keep her in as she rolls off.)
        // (From in front of the bike, down the trail, so her face shows as she says it.)
        shot: { eye: () => ahead(3.0, 1.2), look: () => bike.root.position.clone().add(tmp.set(0, 0.7, 0)), fov: 40, tall: { eye: () => ahead(4.3, 1.7) } },
        say: IN.go,
        sayAt: 0.65,
        hold: 0.3,
        start: () => {
          camera.near = closeUpNear
          camera.updateProjectionMatrix()
          monty.lean = 0
          top.place(maple, 0.35, 0.1, -40)
        },
        cues: [
          [0.1, () => maple.hopTo(bike.root.position.x, bike.root.position.y + 0.3, bike.root.position.z, 0.5, null, 0.5)],
          [
            0.62,
            () => {
              maple.hide()
              bike.alone(false)
              s.puff(bike.root.position.x, bike.root.position.y + 0.9, bike.root.position.z, 8)
              s.sfx.pop()
            },
          ],
          [0.8, () => (bikeSfx.bell(), bike.ring())],
          // (Off down the trail as she says "Hold on!")
          [3.1, () => (set.ride = { s: parkS, v: 0.5, lat: parkLat })],
        ],
        tick: (_k, _t, dt) => {
          if (set.ride) set.ride.v = Math.min(7, set.ride.v + dt * 3.2)
        },
      },
      {
        // She's off: the camera turns to watch her go, leaves swirling up behind her.
        id: 'off',
        shot: { eye: top.p(2.7, 0.9, 1.4), look: () => bike.root.position.clone().add(tmp.set(0, 0.7, 0)), fov: 40, sway: 0.03 },
        dur: 1.2,
        hold: 0,
        tick: (_k, _t, dt) => {
          if (set.ride) set.ride.v = Math.min(7, set.ride.v + dt * 3.2)
        },
        cues: [[0.3, () => s.sfx.whoosh()]],
      },
    ]
  },
}

export const BIKE_OUT: StoryFilm = {
  id: 'bike-out',
  set: MOUNTAIN,
  beats(s) {
    const set = s.use(MOUNTAIN)
    const { pool, bike } = set
    const { maple, monty } = s.cast
    bath(monty, s.bag)
    set.monty = { chew: (t) => chew(monty, t) }
    const poolY = set.course.poolY
    /** Monty, up to his tummy in the pool; Maple on the bank beside him (her bike parked behind her). */
    const M = { x: -0.1, z: 10.4 }
    const Mp = { x: 2.3, z: 12.5 }
    const standMonty = () => {
      const [x, z] = pool.xz(M.x, M.z)
      monty.place(x, poolY - 0.3, z, pool.face(30))
    }
    const twoShot = (eye: [number, number, number], look: [number, number, number], tall: [number, number, number]) => at(pool, eye, look, { tall: { eye: pool.p(...tall), look: pool.p(...look) } })
    const montyLook = () => (monty.headTurn = -0.25)
    return [
      {
        id: 'found',
        shot: twoShot([2.3, 1.45, 18.6], [1.1, 1.15, 11.4], [1.8, 1.8, 22]),
        say: OUT.found,
        sayAt: 0.25,
        hold: 0.2,
        start: () => {
          s.sfx.air('forest')
          bikeSfx.falls()
          standMonty()
          monty.headTurn = 0.35
          pool.place(maple, Mp.x, Mp.z, -30)
          const [bx, bz] = pool.xz(Mp.x + 1.5, Mp.z - 0.2)
          bike.root.position.set(bx, set.course.surface(bx, bz), bz)
          bike.root.rotation.y = pool.face(-150) * (Math.PI / 180)
          bike.root.visible = true
          bike.alone(true)
          maple.wave()
        },
        cues: [[0.3, () => maple.hop()]],
      },
      {
        // Low, looking up at him: very big, very slow, chewing.
        id: 'what',
        shot: { eye: near(pool, monty, 0.8, 3.3, -0.7), look: () => monty.head(tmp).clone().add(new Vector3(0, 0.2, 0)), fov: 36 },
        say: OUT.what,
        sayAt: 0.3,
        hold: 0.25,
        start: montyLook,
        // (A slow, slow tilt of his head as he thinks about it.)
        tick: (_k, t) => (monty.headTurn = -0.25 + Math.min(1, t / 2.4) * 0.15),
      },
      {
        id: 'stand',
        shot: { eye: near(pool, maple, -0.4, 2.5, 0.05), look: () => maple.head(tmp).clone().add(new Vector3(0, -0.12, 0)), fov: 34 },
        say: OUT.stand,
        sayAt: 0.2,
        hold: 0.2,
        start: () => {
          monty.headTurn = -0.25
          maple.cheer()
          pool.place(maple, Mp.x, Mp.z, -30)
        },
        // (Arms out wide like a goalie, then a little shrug on "That's all!")
        tick: (_k, t) => (maple.armsUp = t < 0.5 ? t * 1.4 : t < 1.9 ? 0.7 : Math.max(0.15, 0.7 - (t - 1.9) * 1.2)),
        cues: [[2.1, () => maple.nod()]],
      },
      {
        // He doesn't move at all. Not even a little.
        id: 'good',
        shot: twoShot([2.2, 0.95, 16.8], [1.0, 1.3, 11.4], [1.9, 1.3, 20]),
        say: OUT.good,
        sayAt: 0.35,
        hold: 0.2,
        start: () => {
          maple.armsUp = 0
          pool.place(maple, Mp.x, Mp.z, -55)
          monty.headTurn = 0.3
        },
      },
      {
        // A pinecone drops out of the spruce, bonks off his antler and plops into the water. He chews on. Then the
        // punchline, and on goes the team's scarf.
        id: 'team',
        say: OUT.team,
        sayAt: 0.85,
        hold: 0.35,
        start: () => {
          // (It hangs right over his bare antler.)
          const a = monty.rig.head.localToWorld(tmp.set(1.12 * monty.rig.face.R, monty.rig.face.headY + 1.29 * monty.rig.face.R, -0.35 * monty.rig.face.R))
          set.cone.position.set(a.x, set.coneAt.y, a.z)
          set.cone.userData.hit = a.y
          bikeSfx.pinecone()
          // (She turns to us for the punchline.)
          pool.place(maple, Mp.x, Mp.z, -20)
        },
        tick: (_k, t, dt) => {
          const c = set.cone
          if (!c.visible) return
          const hitY = c.userData.hit as number
          const top = set.coneAt.y
          const fall = 0.42
          if (t < fall) {
            // Down it drops...
            const k = t / fall
            c.position.y = top - (top - hitY) * k * k
            c.rotation.z = t * 6
          } else {
            // ...bonk, and off sideways in a bounce, down into the pool.
            const u = t - fall
            const [x1, z1] = pool.xz(1, 0)
            c.position.x += (x1 - pool.o.x) * 1.8 * dt
            c.position.z += (z1 - pool.o.z) * 1.8 * dt
            c.position.y = Math.max(poolY - 0.3, hitY + 1.6 * u - 4.9 * u * u)
            c.rotation.z = t * 14
          }
        },
        cues: [
          [0.42, () => (s.sfx.bonk(), s.puff(set.cone.position.x, set.cone.position.y, set.cone.position.z, 4))],
          [0.5, () => maple.pull('wow')],
          [1.0, () => (s.splash(set.cone.position.x, poolY + 0.05, set.cone.position.z, 10), s.sfx.splash(), (set.cone.visible = false))],
          [1.3, () => (maple.hop(), (maple.armsUp = 1))],
          [
            2.6,
            () => {
              monty.scarf(true)
              const p = monty.at(0.5, tmp)
              s.sparkle(p.x, p.y, p.z, 18)
              s.sfx.chime()
            },
          ],
          [3.0, () => (maple.armsUp = 0)],
          [3.3, () => monty.nod()],
        ],
      },
    ]
  },
}

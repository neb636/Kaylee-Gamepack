// The Lost Fireflies at the fire show (planning/around-the-world/thailand/samet-story.md; docs/films.md, how films
// work): the story's payoff. The gecko fire dancers Tuk and Kae lost the four fireflies that light their show; she
// found them, so the show she twirls in is the one she saved.
//
//   the way in (film `intro`, fireshow?round=story, about 25 s): Sai Kaew at night, the dancers' poi dark. Tuk droops
//     ("No show tonight."). Kae looks round: lights, coming along the beach! Your unicorn trots in with Mom and Dad, the
//     fireflies she found round her horn. They fly over the rope, and one by one each dives into a poi, which catches
//     in that firefly's own color with its chime (Tuk's two, then Kae's). Kae throws her a pair of little lights of
//     her own, and the show starts.
//   in the show: while she draws, the fireflies chase her lights like the tail of a comet (each a little further back
//     along the path her finger drew); with her finger up they wait round her horn. They swirl up in a spiral when she
//     draws a big circle, and in the finish each one flies off to lead its own surprise in (Zoom at the jet ski's
//     nose, Sandy on the castle's top tower, Bubbles with the glowing fish, Peekaboo round Dad's head), then comes
//     back to her.
//   the thank you (film `thanks`, fireshow?round=thanks, about 13 s), after the fireworks: Tuk and Kae bow, the
//     fireflies draw a heart of light in the sky (each a part of it, in its own color), Kae says thank you with a wai.
//     Then the way home, the heart still up there.
//
// Staging (docs/films.md): faces to the camera; the two geckos stand far enough apart that Mom and Dad show between
// them and her; a phone held upright gets its own shots (one gecko at a time). The thank you's close shots are taken
// from inside the ring of fire, so no flame stands between the camera and a face.
//
// The show (fireshow.ts) owns the dancers' spinning, her poi and the finish; this file owns the fireflies, the heart
// and the films' beats. Everything a film does that the show needs afterwards is also done by its finish(), so
// skipping from any beat leaves the world right. With fewer than four fireflies (a test link) only theirs light up.
import { Vector3, type PerspectiveCamera, type Scene } from 'three'
import { clamp } from '../../../../../../sdk'
import type { Bag } from '../../../../../engine3d/dispose'
import type { Film, V3 as FV3 } from '../../../../../engine3d/film'
import type { Particles } from '../../../../../engine3d/particles'
import type { Avatar } from '../../../characters/avatar'
import type { Member } from '../../../characters/member'
import { L } from '../../../lines'
import { SEAWARD } from '../island/layout'
import { FIREFLIES, FIREFLY_IDS, fireflySfx, Swarm, type Firefly, type FireflyId } from '../story/firefly'
import type { Islander } from '../story/islander'
import { Ribbon } from './ribbon'
import { shapePoints } from './shapes'
import { fireSfx as sfx } from './sounds'
import { TO_DEG } from '../../../../../../sdk/math'

const S = L.samet.story.show

/** Which firefly lights which poi (Tuk's left and right, then Kae's), and the fire it makes: a flame in three flat
 *  bands, the ribbon it leaves, its light on the sand. */
export const POI_FLY: FireflyId[] = FIREFLY_IDS
export const POI_LOOK: Record<FireflyId, { edge: string; mid: string; core: string; head: string; tail: string; pool: string }> = {
  jetski: { edge: '#FF2E93', mid: '#FF86C6', core: '#FFEAF5', head: '#FF9AD2', tail: '#FF2E93', pool: '#FF5FB0' },
  sandcastle: { edge: '#FF7A1C', mid: '#FFC23A', core: '#FFF3B8', head: '#FFD86E', tail: '#FF7A1C', pool: '#FFA23A' },
  snorkel: { edge: '#2A7BFF', mid: '#62C8FF', core: '#E6F7FF', head: '#8FD8FF', tail: '#2A7BFF', pool: '#4FA8FF' },
  hideseek: { edge: '#1FB24A', mid: '#86EE6E', core: '#F1FFDC', head: '#B4F59A', tail: '#1FB24A', pool: '#5FDC6A' },
}

/** How big the fireflies are (story/firefly.ts: 1 is about 30 cm across the halo) and how bright: close up in a film,
 *  from the show's wide camera (small and soft, so four of them together don't glare white over her), up on the heart. */
const SIZE = { film: 0.8, show: 1, heart: 1.15 }
const GLOW = { film: 0.8, show: 0.7, heart: 1 }
/** Where the two geckos stand to talk (u along the beach, v out to sea): just seaward of the rope, either side of
 *  her, far enough apart that Mom and Dad show between them and her. And for their bow, inside the ring of fire. */
const TALK: [number, number][] = [
  [-7.25, -2.9],
  [-3.75, -2.9],
]
const BOW: [number, number][] = [
  [-6.95, -3.4],
  [-4.05, -3.4],
]
/** On a tall screen they bow shoulder to shoulder, so both fit across it. */
const BOW_TALL: [number, number][] = [
  [-6.14, -3.4],
  [-4.86, -3.4],
]
/** The three of them come along the sand from the left of the picture: she starts this far from her place. */
const WALK_IN = { u: -11, v: -0.4 }
/** The fireflies chasing her lights: the first this far behind her first light (s), each next one this much further
 *  (they fly right along the path she drew, so they spread out round her circles). */
const TRAIL = { lag0: 0.24, lag: 0.17, rate: 45 }
/** A big circle of hers: they swirl up for this long, no sooner again than `gap`. */
const SWIRL = { s: 1.5, gap: 2.5 }
/** The heart of light: its middle this high above her drawing middle, half its width, points round it. */
const HEART = { y: 3.2, size: 1.3, n: 96, draw: 2.4 }

/** What the story needs from the show. */
export interface StoryHost {
  scene: Scene
  bag: Bag
  camera: PerspectiveCamera
  kaylee: Avatar
  ji: Member
  nick: Member
  tuk: Islander
  kae: Islander
  sparkle: Particles
  /** Glitter in the fireflies' own colors (`color`: the firefly's place in FIREFLY_IDS). */
  glitter: Particles
  /** Where she stands for the show, and Mom and Dad either side of her. */
  kay: { u: number; v: number }
  seats: { ji: { u: number; v: number }; nick: { u: number; v: number } }
  /** She is drawing with her lights (or just was). */
  drawing(): boolean
  /** The screen is taller than wide (a phone held upright). */
  tall(): boolean
  /** Toward the show's camera (her drawing plane faces it). */
  toCamera: Vector3
  /** A point on the sand (u along the beach, v out to sea), `y` above it. */
  at(u: number, v: number, y?: number): Vector3
  /** The sand's height. */
  ground(x: number, z: number): number
  /** A point in her drawing plane (a right, b up from its middle). */
  plane(a: number, b: number, out?: Vector3): Vector3
  /** Where her first light was `lag` seconds ago. */
  trail(lag: number, out: Vector3): Vector3
  /** Poi `i`'s wick, now. */
  wick(i: number, out: Vector3): Vector3
  /** A dancer's hand (0 Tuk, 1 Kae; side 0 left, 1 right), now. */
  hand(who: number, side: number, out?: Vector3): Vector3
  /** The dancers act in a film (the story places them; their poi hang from their hands, or are put away) or dance
   *  (false: back at their spots, spinning). */
  stage(on: boolean, poi?: boolean): void
  /** A dancer's pose in a film (each 0..1, eased): arms up holding the poi high, a bow, a wai. */
  pose(who: number, p: { up?: number; bow?: number; wai?: number }): void
  /** Poi `i` is lit or dark. `show`: it catches now, with a burst in its firefly's color and its chime. */
  light(i: number, on: boolean, show?: boolean): void
  /** Her lights: none (false), in her hooves (true), or flying to her from these two points. */
  lights(on: boolean, from?: Vector3[]): void
  /** The drum booms (the show starts). */
  drum(): void
  /** Later, on the show's clock (it stops when the show does). */
  after(s: number, f: () => void): void
}

/** What a firefly is doing: round her horn, circling over the dancers, chasing her lights, flying where it's told
 *  (a film, or leading its surprise in), or on the heart. */
type Mode = 'horn' | 'over' | 'trail' | 'to' | 'heart'
interface Fly {
  f: Firefly
  id: FireflyId
  /** Its poi (and its place in FIREFLY_IDS). */
  i: number
  /** Its place among the ones she found. */
  j: number
  mode: Mode
  to: (() => Vector3) | null
  rate: number
  /** When a firefly told where to fly goes back to her lights (the show's clock). */
  until: number
}

const tA = new Vector3()
const tB = new Vector3()
const ZERO = new Vector3()
const never = () => false
/** A twinkle: its glow jumps and eases back. (The firefly's own flash() swells its halo to a disc a meter across,
 *  which close up covers a face.) */
const twinkle = (f: Firefly) => (f.glow = 1.7)

export class FireStory {
  private swarm: Swarm
  private flies: Fly[]
  /** Where they circle over the dancers, and how wide. */
  private over = new Vector3()
  private overR = 1.1
  private swirl = 0
  private swirlS = SWIRL.s
  private lastSwirl = -99
  private flashN = 0
  private time = 0
  /** She is walking in (the way in): her hooves follow the sand. */
  private walkIn = false
  // ---- The heart: its points round (in her drawing plane, up in the sky), a ribbon for each firefly's part of it.
  private heartPts: Vector3[]
  private ribs: Ribbon[]
  private drawn: number[]
  /** How much of the heart is drawn (0..1); -1: there is none. */
  private heartK = -1
  private heartAt = 0
  private heartLit = false

  constructor(
    private h: StoryHost,
    flags: readonly string[],
  ) {
    const ids = FIREFLY_IDS.filter((id) => flags.includes(id))
    this.swarm = new Swarm(h.bag, h.scene, ids, SIZE.show)
    this.flies = this.swarm.flies.map((f, j) => ({ f, id: f.id, i: FIREFLY_IDS.indexOf(f.id), j, mode: 'trail', to: null, rate: TRAIL.rate, until: Infinity }))
    for (const fl of this.flies) {
      fl.f.pos.copy(h.plane(0, 0))
      fl.f.glow = fl.f.glowGoal = GLOW.show
    }
    this.heartPts = shapePoints('heart', HEART.n).map((q) => h.plane(q.x * HEART.size, HEART.y + q.y * HEART.size, new Vector3()))
    // (With no fireflies at all, a test link, the heart draws itself in pink.)
    const colors = ids.length ? ids.map((id) => FIREFLIES[id].color) : ['#FF7AC8']
    const per = Math.ceil(HEART.n / colors.length)
    this.ribs = colors.map((c) => {
      const r = new Ribbon(h.bag, { n: per + 3, head: c, tail: c, life: 1e9, width: 0.2 })
      r.mesh.visible = false
      h.scene.add(r.mesh)
      return r
    })
    this.drawn = this.ribs.map(() => 0)
  }

  /** Has she found this poi's firefly? */
  has(i: number) {
    return this.flies.some((fl) => fl.i === i)
  }

  // ---------------------------------------------------------------- in the show

  /** A loop of hers: one of them twinkles; a big circle and they all swirl up, chiming one after another. */
  loop(big: boolean) {
    const n = this.flies.length
    if (!n) return
    twinkle(this.flies[this.flashN++ % n].f)
    if (big && this.time - this.lastSwirl > SWIRL.gap) this.swirlUp(SWIRL.s)
  }
  /** They spiral up over her lights for `s` seconds (a big circle, the ring of fire), then come back down. */
  swirlUp(s: number) {
    this.swirl = this.swirlS = s
    this.lastSwirl = this.time
    this.flies.forEach((fl, k) => this.h.after(k * 0.09, () => fireflySfx.chime(fl.id, 0.035)))
  }
  /** A firefly leaves her lights to lead its surprise in: it flies where `to` says for `s` seconds, then comes back. */
  lead(id: string, to: () => Vector3, s: number) {
    const fl = this.flies.find((x) => x.id === id)
    if (!fl || fl.mode === 'heart') return
    fl.mode = 'to'
    fl.to = to
    fl.rate = 5
    fl.until = this.time + s
    twinkle(fl.f)
    fireflySfx.giggle(fl.id)
  }

  /** As the show needs them: chasing her lights. */
  private toShow() {
    for (const fl of this.flies) {
      if (fl.mode === 'heart') continue
      fl.mode = 'trail'
      fl.to = null
      fl.rate = TRAIL.rate
      fl.until = Infinity
      fl.f.size = SIZE.show
      fl.f.glowGoal = GLOW.show
    }
  }

  private horn(out: Vector3) {
    const k = this.h.kaylee
    return out.copy(k.root.position).setY(k.root.position.y + k.height * 1.08)
  }

  update(dt: number, t: number) {
    this.time = t
    const h = this.h
    const n = this.flies.length
    const cam = h.camera.position
    if (this.walkIn) this.walking(t)
    this.swirl = Math.max(0, this.swirl - dt)
    for (const fl of this.flies) {
      const f = fl.f
      if (fl.mode === 'to' && t >= fl.until) {
        fl.mode = 'trail'
        fl.to = null
        fl.rate = TRAIL.rate
      }
      let to: Vector3
      let rate = fl.rate
      if (fl.mode === 'horn') {
        this.swarm.radius = 0.6
        to = this.swarm.slot(fl.j, n, t, this.horn(tB), tA)
        rate = 6
      } else if (fl.mode === 'over') {
        this.swarm.radius = this.overR
        to = this.swarm.slot(fl.j, n, t, this.over, tA)
        rate = 4
      } else if (fl.mode === 'to' && fl.to) to = fl.to()
      else if (fl.mode === 'heart') {
        to = this.heartSpot(fl, t)
        rate = 9
      } else if (this.swirl > 0) {
        // Up in a spiral over her lights and down again.
        const k = 1 - this.swirl / this.swirlS
        const a = t * 9 + (fl.j / n) * Math.PI * 2
        const r = 0.5 + 0.95 * Math.sin(Math.PI * k)
        to = h.plane(Math.sin(a) * r, 0.3 + 2.6 * Math.sin(Math.PI * k) + Math.cos(a) * r * 0.4, tA)
        rate = 10
      } else if (h.drawing()) {
        // The tail of her comet: where her first light was a moment ago, each a little further back.
        // (Each circles its spot a little, so they never pile up when her finger holds still.)
        to = h.trail(TRAIL.lag0 + TRAIL.lag * fl.j, tA)
        const a = t * 3.2 + fl.j * ((Math.PI * 2) / n)
        to.x += h.toCamera.z * Math.cos(a) * 0.2
        to.z -= h.toCamera.x * Math.cos(a) * 0.2
        to.y += Math.sin(a) * 0.2
        rate = TRAIL.rate
      } else {
        // Her finger's up: they wait round her horn (clear of her face).
        this.swarm.radius = 0.8
        to = this.swarm.slot(fl.j, n, t, this.horn(tB).setY(tB.y + 0.12), tA)
        rate = 6
      }
      f.fly(to, dt, rate)
      // Hovering, their little faces are to the camera.
      if (f.speed < 3) f.face(Math.atan2(cam.x - f.pos.x, cam.z - f.pos.z), dt, 30)
    }
    // (Their own life: wings, blinks, the glow.)
    this.swarm.update(dt, t, ZERO, never)
    this.heart(t)
  }

  // ---------------------------------------------------------------- the heart of light

  /** Where a firefly is on the heart: drawing its part of it, then going slowly on round it. */
  private heartSpot(fl: Fly, t: number) {
    const N = HEART.n
    const per = N / this.flies.length
    const k = clamp(this.heartK, 0, 1)
    const at = fl.j * per + k * per + (k >= 1 ? (t - this.heartAt) * 5 : 0)
    const i = Math.floor(at)
    return tA.copy(this.heartPts[i % N]).lerp(this.heartPts[(i + 1) % N], at - i)
  }
  private heart(t: number) {
    if (this.heartK < 0) return
    const N = HEART.n
    const per = N / this.ribs.length
    const want = Math.floor(clamp(this.heartK, 0, 1) * per)
    this.ribs.forEach((rib, j) => {
      const from = Math.round(j * per)
      while (this.heartK > 0 && this.drawn[j] <= want) rib.push(this.heartPts[(from + this.drawn[j]++) % N], t, 0)
      // (A slow twinkle, each part on its own beat.)
      rib.update(t, this.h.toCamera, 1.25 + 0.25 * Math.sin(t * 3 + j * 1.7))
    })
    if (this.heartK >= 1 && !this.heartLit) {
      // Done: it sparkles all the way round, and they chime together.
      this.heartLit = true
      this.heartAt = t
      fireflySfx.all()
      sfx.lift()
      for (let i = 0; i < N; i += 4) {
        const p = this.heartPts[i]
        this.h.glitter.emit(p.x, p.y, p.z, (Math.random() - 0.5) * 1.2, 0.4 + Math.random() * 0.8, (Math.random() - 0.5) * 1.2, 1.3, 0.13, this.flies.length ? this.flies[Math.floor((i / N) * this.flies.length)].i : 0)
      }
      for (const fl of this.flies) twinkle(fl.f)
    }
  }
  private startHeart() {
    this.heartK = 0
    this.heartLit = false
    this.drawn = this.ribs.map(() => 0)
    for (const r of this.ribs) {
      r.clear()
      r.mesh.visible = true
    }
    for (const fl of this.flies) {
      fl.mode = 'heart'
      fl.to = null
      fl.until = Infinity
      fl.f.size = SIZE.heart
      fl.f.glowGoal = GLOW.heart
    }
  }
  /** The heart whole in the sky, the fireflies going round it (the film was skipped, or never played). */
  private heartNow() {
    if (this.heartK < 0) this.startHeart()
    if (this.heartK < 1) {
      this.heartLit = true
      this.heartAt = this.time
    }
    this.heartK = 1
  }

  // ---------------------------------------------------------------- the way in

  private A = (u: number, v: number, y = 0): FV3 => this.h.at(u, v, y).toArray() as FV3

  /** The beach as the way in opens (and before it, while the screen comes up): dark poi, Tuk drooping, the three of
   *  them still along the sand, her fireflies round her horn. */
  openIntro() {
    const h = this.h
    const { tuk, kae, kaylee } = h
    h.stage(true)
    for (let i = 0; i < 4; i++) h.light(i, false)
    h.lights(false)
    ;[tuk, kae].forEach((g, i) => {
      const p = h.at(TALK[i][0], TALK[i][1])
      g.place(p.x, p.y, p.z, (SEAWARD + (i ? -0.5 : 0.5)) * TO_DEG)
      h.pose(i, { up: 0, bow: 0, wai: 0 })
    })
    tuk.pull('sad', true)
    tuk.m.lookAway()
    kae.cheer()
    const th = tuk.pos
    kae.m.lookAt(th.x, th.y + 1, th.z)
    const k = h.at(h.kay.u + WALK_IN.u, h.kay.v + WALK_IN.v)
    kaylee.stop()
    kaylee.place(k.x, k.y, k.z, (SEAWARD + Math.PI / 2) * TO_DEG)
    this.walkIn = true
    this.walking(0)
    this.walkIn = false
    this.swirl = 0
    for (const fl of this.flies) {
      fl.mode = 'horn'
      fl.to = null
      fl.until = Infinity
      fl.f.size = SIZE.film
      fl.f.glowGoal = GLOW.film
      this.swarm.radius = 0.6
      fl.f.pos.copy(this.swarm.slot(fl.j, this.flies.length, 0, this.horn(tB), tA))
    }
  }
  /** While they walk in: her hooves follow the sand, and Mom and Dad waddle along with her (Dad ahead, Mom behind),
   *  each as far from their place as she is from hers. */
  private walking(t: number) {
    const h = this.h
    const p = h.kaylee.root.position
    p.y = h.ground(p.x, p.z)
    const home = h.at(h.kay.u, h.kay.v)
    for (const [m, seat] of [
      [h.ji, h.seats.ji],
      [h.nick, h.seats.nick],
    ] as const) {
      const s = h.at(seat.u, seat.v)
      const x = s.x + p.x - home.x
      const z = s.z + p.z - home.z
      m.root.position.x = x
      m.root.position.z = z
      m.setGround(h.ground(x, z))
      m.root.rotation.y = SEAWARD + Math.PI / 2
      m.rig.body.position.y = Math.abs(Math.sin(t * 11 + seat.u)) * 0.05
      m.rig.body.rotation.z = Math.sin(t * 11 + seat.u) * 0.08
    }
  }
  /** The three of them are at their places behind the rope, facing the sea. */
  private arrive() {
    const h = this.h
    const p = h.at(h.kay.u, h.kay.v)
    this.walkIn = false
    h.kaylee.stop()
    if (Math.hypot(h.kaylee.root.position.x - p.x, h.kaylee.root.position.z - p.z) > 0.05) h.kaylee.place(p.x, p.y, p.z, SEAWARD * TO_DEG)
    h.kaylee.face(SEAWARD)
    for (const [m, seat] of [
      [h.ji, h.seats.ji],
      [h.nick, h.seats.nick],
    ] as const) {
      const s = h.at(seat.u, seat.v)
      m.place(s.x, s.y, s.z, SEAWARD * TO_DEG, 'stand')
    }
  }

  intro(): Film {
    const h = this.h
    const { tuk, kae, kaylee } = h
    const A = this.A
    const mid = (TALK[0][0] + TALK[1][0]) / 2
    const home = h.at(h.kay.u, h.kay.v)
    const from = h.at(h.kay.u + WALK_IN.u, h.kay.v + WALK_IN.v)
    const n = this.flies.length
    /** The two of them in one picture, from the shallows (`d` meters off; a tall screen stands well back to fit them). */
    const both = (d: number, y: number, fov = 38) => ({ eye: A(mid, TALK[0][1] + d, y), look: A(mid, TALK[0][1], 0.8), fov, tall: { eye: A(mid, TALK[0][1] + 11.8, y + 1.6), fov: 46 } })
    /** One of them alone, for a tall screen (a phone held upright shows them one at a time). */
    const alone = (i: number) => ({ eye: A(TALK[i][0] + (i ? -2 : 2), TALK[i][1] + 4.5, 1.15), look: A(TALK[i][0], TALK[i][1], 1.1), fov: 44 })
    /** The fireflies gather over one of them (Tuk first: his poi catch first). */
    const gather = (i: number) => {
      this.over.copy(h.at(TALK[i][0] + (i ? -0.25 : 0.25), TALK[i][1], 1.8))
      this.overR = 0.85
    }
    const mine = (i: number) => this.flies.filter((fl) => fl.i >> 1 === i)
    // One by one each firefly dives into its poi, which catches in its color; then it pops back out. Tuk's two first
    // (from `at0` seconds into the beat), then Kae's in the next beat.
    const DIVE = 0.85
    const dives = (i: number, at0: number) =>
      mine(i).flatMap((fl, k): [number, () => void][] => {
        const at = at0 + k * DIVE
        return [
          [at, () => {
            fl.mode = 'to'
            fl.to = () => h.wick(fl.i, tA)
            fl.rate = 9
            fl.until = Infinity
            fireflySfx.giggle(fl.id, 0.03)
          }],
          [at + 0.45, () => {
            h.light(fl.i, true, true)
            twinkle(fl.f)
            ;(i ? kae : tuk).m.react('hop')
          }],
          [at + 0.7, () => (fl.mode = 'over')],
        ]
      })
    const walk = () => {
      if (this.walkIn) return
      this.walkIn = true
      kaylee.walk([[home.x, home.z]], () => this.arrive())
    }
    return {
      id: 'intro',
      beats: [
        {
          // The two of them by the rope, their poi dark; in on Tuk, drooping.
          id: 'dark',
          shot: { ...both(8.5, 1.9), to: { eye: A(TALK[0][0] + 0.75, 0.5, 0.72), look: A(TALK[0][0] + 0.1, TALK[0][1], 0.74) }, move: 3.0, ease: 'inOut', tall: { ...both(8.5, 1.9).tall, to: { eye: A(TALK[0][0] + 0.9, 4.6, 1.0), look: A(TALK[0][0] + 0.1, TALK[0][1], 0.8), fov: 38 } } },
          start: () => this.openIntro(),
          // (Along the beach, out of the picture, the three of them set off.)
          cues: [[3.2, walk]],
          say: S.dark,
          sayAt: 1.4,
          dur: 4.2,
        },
        {
          // Kae looks round: lights, coming along the beach!
          id: 'wait',
          shot: { eye: A(TALK[1][0] - 2.1, -0.3, 0.95), look: A(TALK[1][0] - 0.15, TALK[1][1], 0.88), fov: 32, to: { eye: A(TALK[1][0] - 1.9, -0.6, 0.95) }, sway: 0.03 },
          start: () => {
            kae.pull('wow')
            kae.m.react('hop')
            kae.m.lookAt(from.x, from.y + 1, from.z)
            walk()
          },
          cues: [[0.9, () => tuk.m.lookAt(from.x, from.y + 1, from.z)]],
          say: S.wait,
          sayAt: 0.3,
          dur: 2.3,
        },
        {
          // Your unicorn trots in to her place behind the rope, the fireflies she found round her horn.
          id: 'lights',
          shot: { eye: A(h.kay.u, h.kay.v + 2.6, 1.1), look: () => this.horn(tB).setY(home.y + 0.85), fov: 46, sway: 0.03 },
          start: () => this.flies.forEach((fl, k) => h.after(0.3 + k * 0.4, () => (twinkle(fl.f), fireflySfx.chime(fl.id)))),
          dur: 3.0,
        },
        {
          // Tuk can't believe it: they fly over the rope to him.
          id: 'back',
          shot: { ...both(5.6, 1.05), tall: alone(0) },
          start: () => {
            // (They're there by now, however the walk went.)
            this.arrive()
            tuk.cheer()
            tuk.pull('happy')
            tuk.m.react('hop')
            tuk.m.lookAway()
            kae.m.lookAway()
            gather(0)
          },
          cues: [
            [0.4, () => {
              for (const fl of this.flies) fl.mode = 'over'
              if (n) fireflySfx.all()
            }],
            [0.5, () => kae.m.react('hop')],
            [1.3, () => kaylee.react('hop')],
            [1.5, () => h.ji.react('wave')],
          ],
          say: S.back,
          sayAt: 0.3,
          dur: 3.0,
        },
        {
          // Poi up: one by one a firefly dives into each of Tuk's, and it catches in that firefly's color.
          id: 'light',
          shot: { ...both(5.6, 1.05), tall: alone(0) },
          start: () => {
            h.pose(0, { up: 1 })
            h.pose(1, { up: 1 })
            kae.m.react('hop')
          },
          cues: dives(0, 1.5),
          say: S.light,
          sayAt: 0.2,
          dur: Math.max(2.5, 1.5 + mine(0).length * DIVE + 0.25),
        },
        {
          // Then Kae's two.
          id: 'light2',
          shot: { ...both(5.6, 1.05), tall: alone(1) },
          start: () => gather(1),
          cues: dives(1, 0.45),
          dur: 0.45 + mine(1).length * DIVE + 0.55,
        },
        {
          // Kae throws her a pair of little lights of her own, over the rope.
          id: 'yours',
          shot: { eye: A(h.kay.u + 0.5, 1.0, 1.25), look: A(h.kay.u + 0.9, -4.2, 0.95), fov: 40, sway: 0.03 },
          start: () => {
            kae.pull('happy')
            kae.m.react('hop')
          },
          cues: [
            [0.55, () => {
              h.lights(true, [h.hand(1, 0), h.hand(1, 1)])
              sfx.fwip()
            }],
            [1.6, () => {
              kaylee.react('hop')
              this.toShow()
            }],
          ],
          say: S.yours,
          sayAt: 0.25,
          dur: 3.3,
        },
        {
          // Everyone to their places: the drum booms, the fire spins.
          id: 'start',
          shot: { eye: A(h.kay.u, 8.5, 3.6), look: A(h.kay.u, -3.6, 1.7), fov: 46, to: { eye: A(h.kay.u, 10.5, 4.3) } },
          start: () => {
            h.stage(false)
            h.drum()
            h.nick.react('hop')
            h.ji.react('wave')
          },
          say: S.start,
          sayAt: 0.4,
          dur: 2.8,
        },
      ],
      finish: () => {
        h.stage(false)
        for (let i = 0; i < 4; i++) h.light(i, this.has(i))
        h.lights(true)
        tuk.cheer()
        kae.cheer()
        this.arrive()
        this.toShow()
      },
    }
  }

  // ---------------------------------------------------------------- the thank you

  thanks(): Film {
    const h = this.h
    const { tuk, kae, kaylee } = h
    const A = this.A
    const mid = (BOW[0][0] + BOW[1][0]) / 2
    const heart = h.plane(0, HEART.y).toArray() as FV3
    const spots = h.tall() ? BOW_TALL : BOW
    const V = BOW[0][1]
    return {
      id: 'thanks',
      beats: [
        {
          // Side by side in front of her, inside the ring of fire, their poi put down: Tuk's proud, then the two of
          // them bow. (The camera is inside the ring too, a little above them, so no flame stands in the way.)
          id: 'best',
          shot: { eye: A(mid, V + 3.4, 0.95), look: A(mid, V, 0.8), fov: 58, to: { eye: A(mid, V + 3.2, 0.95) }, tall: { eye: A(mid, V + 3.45, 1.05), look: A(mid, V, 0.9), fov: 66, to: { eye: A(mid, V + 3.3, 1.05) } } },
          start: () => {
            h.stage(true, false)
            ;[tuk, kae].forEach((g, i) => {
              const p = h.at(spots[i][0], spots[i][1])
              g.place(p.x, p.y, p.z, (SEAWARD + (i ? -0.3 : 0.3)) * TO_DEG)
              g.cheer()
              g.m.lookAway()
              h.pose(i, { up: 0, bow: 0, wai: 0 })
            })
            tuk.pull('happy')
            tuk.m.react('hop')
          },
          cues: [
            [2.0, () => {
              h.pose(0, { bow: 1 })
              h.pose(1, { bow: 1 })
              sfx.cheer()
            }],
            [3.1, () => {
              h.pose(0, { bow: 0 })
              h.pose(1, { bow: 0 })
            }],
          ],
          say: S.best,
          sayAt: 0.4,
          dur: 3.6,
        },
        {
          // The fireflies fly up and draw a heart of light over everyone, each a part of it. (From out in the
          // shallows, looking over the ring's flames.)
          id: 'heart',
          shot: { eye: A(mid, 7.6, 3.4), look: [heart[0], heart[1] - 1.7, heart[2]], fov: 46, to: { eye: A(mid, 8.6, 3.6) }, sway: 0.02 },
          start: () => this.startHeart(),
          tick: (_k, t) => (this.heartK = Math.max(this.heartK, Math.min(1, (t - 0.7) / HEART.draw))),
          cues: [
            [0.2, () => sfx.whoosh(1.2)],
            [0.7 + HEART.draw + 0.2, () => {
              kaylee.react('hop')
              tuk.m.react('hop')
              kae.m.react('hop')
            }],
          ],
          dur: 0.7 + HEART.draw + 1.3,
        },
        {
          // Kae's thank you, with a wai.
          id: 'thanks',
          shot: { eye: A(spots[1][0] - 1.55, V + 3.0, 0.85), look: A(spots[1][0] - 0.25, V, 0.74), fov: 38, to: { eye: A(spots[1][0] - 1.45, V + 2.7, 0.85) }, tall: { eye: A(spots[1][0] - 0.3, V + 3.3, 0.95), look: A(spots[1][0] - 0.05, V, 0.8), fov: 48 } },
          start: () => {
            h.pose(1, { wai: 1 })
            kae.pull('happy')
          },
          cues: [
            [1.2, () => kaylee.react('hop')],
            [2.7, () => h.pose(1, { wai: 0 })],
          ],
          say: S.thanks,
          sayAt: 0.5,
          dur: 3.4,
        },
        {
          // Back to their places, everyone waving, the heart in the sky.
          id: 'wave',
          shot: { eye: A(h.kay.u, 9.5, 3.9), look: A(h.kay.u, -3.9, 2.6), fov: 46, to: { eye: A(h.kay.u, 11, 4.4) } },
          start: () => {
            h.stage(false)
            h.ji.react('wave')
            h.nick.react('wave')
            kaylee.react('hop')
          },
          dur: 1.8,
        },
      ],
      finish: () => {
        h.stage(false)
        this.heartNow()
        tuk.cheer()
        kae.cheer()
      },
    }
  }

  /** The QA readout. */
  qa() {
    return { flies: this.flies.map((fl) => `${fl.id}:${fl.mode}`), heart: +this.heartK.toFixed(2) }
  }
}

// The Lost Fireflies on the island (samet-story.md; docs/films.md, how films work). This file owns what the story adds
// to the island between the stops:
//
//   the way in (film `intro`, island?story=intro): the family steps off the speedboat at Na Dan pier; Tofu the beach
//     puppy runs up barking; at the foot of the pier the gecko fire dancers Tuk and Kae stand by their empty lantern.
//     Their memory, in the storybook look: last night on Sai Kaew the four fireflies lit the show, then a big wind
//     blew them all over the island, Tofu chasing after them. "No fireflies, no show tonight!" But Tofu saw where
//     they went. "Will you help us find them?"
//   between the stops: each firefly still to find waits at its beach, doing what it loves (Zoom zooms loops off the
//     jet ski beach, Sandy peeks out of the sand at Hin Khok, Bubbles is a blue glow far out at sea off Wong Duan,
//     Peekaboo peeks round the driftwood tree); the ones she has found circle her horn. Coming back from a stop its
//     firefly flies in to join them (`welcome`). Tuk and Kae wait by the lantern at Na Dan, which fills up as she goes.
//   all four (film `all`, island?story=all): the fireflies swirl up round her, Mom cheers, Dad calls the sunset.
//
// The island (island.ts) owns the world; everything a film does that the game needs afterwards is also done by its
// finish(), so skipping from any beat leaves the island right.
import { Group, Vector3, type Scene } from 'three'
import { firstTime, type Line } from '../../../../../../sdk'
import type { Bag } from '../../../../../engine3d/dispose'
import type { Film, V3 } from '../../../../../engine3d/film'
import { merge, P, solid } from '../../../../../engine3d/geo'
import type { Particles } from '../../../../../engine3d/particles'
import type { Avatar } from '../../../characters/avatar'
import type { Member } from '../../../characters/member'
import { L } from '../../../lines'
import { sametSfx } from '../sfx/common'
import { Firefly, FIREFLIES, FIREFLY_IDS, fireflySfx, Swarm, type FireflyId } from '../story/firefly'
import { makeGeckos, type Islander } from '../story/islander'
import { memoryBed, storyMusic } from '../story/sounds'
import { at, bay, FRAMES, STOPS, type SpotId, type XZ } from './layout'
import type { Puppy } from './puppy'

const S = L.samet.story
const DEG = 180 / Math.PI
const N = FRAMES.nadan
/** A point at Na Dan in its beach frame (`u` along the sand, `v` out to sea), as XZ. */
const nd = (u: number, v: number): XZ => at(N, u, v)
/** The way a point in Na Dan's frame faces another (degrees, for place()). */
const faceTo = (from: XZ, to: XZ) => Math.atan2(to.x - from.x, to.z - from.z) * DEG

/** Where the way-in film is staged, at the foot of Na Dan pier (Na Dan's frame: the pier runs out to sea at u = -4). */
export const STAGE = {
  /** On the pier as she lands (the first shot). */
  pier: { kaylee: nd(-4, 17), nick: nd(-4.9, 18.6), ji: nd(-3.1, 18.4) },
  /** On the sand at the foot of the pier: the family facing inland, the geckos facing them, the lantern between. */
  kaylee: nd(-3.6, -3.4),
  nick: nd(-5.0, -2.5),
  ji: nd(-2.3, -2.4),
  tuk: nd(-4.6, -6.9),
  kae: nd(-3.0, -7.0),
  lantern: nd(-3.9, -6.0),
  /** Tofu: where he runs in from (along the sand, from the camera's side), where he skids to a stop in front of her,
   *  and where he sits afterwards, between her and the geckos. */
  pupFrom: nd(7, -5.5),
  pupAt: nd(-3.1, -4.5),
  pupSit: nd(-2.2, -5.3),
  /** The films shoot from this side (u > -2), between the two groups, and everyone cheats toward it. */
  cam: nd(1.6, -5.0),
}

/** Where each firefly waits until its stop is played. */
const WAIT: Record<FireflyId, XZ> = {
  jetski: bay(1, 9),
  sandcastle: { x: STOPS.sandcastle.at.x + 0.9, z: STOPS.sandcastle.at.z + 0.4 },
  snorkel: at(FRAMES.wongduan, 5, 26),
  hideseek: STOPS.hideseek.at,
}
/** The beach each stop is on (for "is its firefly near her?"). */
const STOP_BEACH: Record<FireflyId, SpotId> = { jetski: 'saikaew', sandcastle: 'hinkhok', snorkel: 'wongduan', hideseek: 'prao' }

export interface StoryHost {
  scene: Scene
  bag: Bag
  kaylee: Avatar
  nick: Member
  ji: Member
  pup: Puppy
  /** Sparkle bursts. */
  stars: Particles
  /** Petals and sand on the wind (the memory). */
  petals: Particles
  /** The ground (or the deck, or the pier) under a point. */
  heightAt(x: number, z: number): number
  /** Someone says something in play (the screen's guide speaks it). */
  say(l: Line): void
  /** Stands her, Dad and Mom somewhere (their faces in degrees); the island forgets where she was walking. */
  stand(k: XZ & { face: number }, nick: XZ & { face: number }, ji: XZ & { face: number }): void
  /** The light: night for the memory, back to the day's own. */
  night(on: boolean): void
  /** The fire dancers step in close together for the memory's picture (or back to their places). */
  gather(on: boolean): void
  /** The fireflies she has found. */
  flags: Set<FireflyId>
  /** The pictures of the beaches come up. */
  board(): void
  /** Plays a film (the island's player), then `then`. */
  play(f: Film, then?: () => void): void
}

export class IslandStory {
  readonly tuk: Islander
  readonly kae: Islander
  /** The lantern the fireflies live in: a glass jar on a little stand. Empty until she finds them. */
  readonly lantern = new Group()
  /** The ones she has found, round her horn. */
  readonly swarm: Swarm
  /** The ones still to find, each at its beach. */
  private waiting = new Map<FireflyId, Firefly>()
  /** The four in the geckos' memory (only in the film). */
  private memory: Firefly[] = []
  private memoryOn = false
  /** How far the wind has taken the memory's fireflies (0: circling the dancers, 1: gone). */
  private blown = 0
  private windy = false
  private timers: { t: number; f: () => void }[] = []
  private center = new Vector3()
  /** How far above her horn they circle (a film lifts them for a moment). */
  private lift = 0
  /** A firefly flying in from its stop (welcome): until it has joined the others. */
  private joining: { f: Firefly; t: number } | null = null
  /** Tofu in a film: running to a point (the film's ticks move him; the island's own puppy code is off). */
  private pupGoal: XZ | null = null
  private pupSpeed = 6
  /** What Tofu faces when he isn't running in a film (default: her). */
  private pupFace: XZ | null = null
  /** The memory's fireflies scatter (the wind has them). */
  private scatter = false
  private told = new Set<string>()
  private stopMusic: (() => void) | null = null
  private stopBed: (() => void) | null = null
  /** Whether the geckos are out (at Na Dan, by day, until the show). */
  geckosOut = true

  constructor(private h: StoryHost) {
    const { bag, scene } = h
    const g = makeGeckos(bag)
    this.tuk = g.tuk
    this.kae = g.kae
    scene.add(this.tuk.root, this.kae.root)
    // The lantern: a wooden base, a glass jar, a pink lid with a ring to carry it by.
    this.lantern.add(
      solid(
        merge([
          P.cyl(0.26, 0.3, 0.1, '#C99A66', { at: [0, 0.05, 0] }, 12),
          P.cyl(0.2, 0.2, 0.06, '#FF8FB8', { at: [0, 0.67, 0] }, 12),
          P.torus(0.09, 0.022, '#FFD27A', { at: [0, 0.78, 0] }),
          ...[0, 1, 2, 3].map((i) => P.box(0.03, 0.54, 0.03, '#FFFFFF', { at: [Math.cos((i * Math.PI) / 2 + 0.78) * 0.2, 0.37, Math.sin((i * Math.PI) / 2 + 0.78) * 0.2] })),
        ]),
        bag,
        2,
      ),
    )
    scene.add(this.lantern)
    this.swarm = new Swarm(bag, scene, [...h.flags], 1.15)
    this.swarm.radius = 0.55
    for (const id of FIREFLY_IDS) {
      if (h.flags.has(id)) continue
      const f = new Firefly(id, bag)
      f.size = id === 'snorkel' ? 2.6 : 1.7
      scene.add(f.root)
      this.waiting.set(id, f)
    }
    for (const id of FIREFLY_IDS) {
      const f = new Firefly(id, bag)
      f.size = 1.5
      f.root.visible = false
      scene.add(f.root)
      this.memory.push(f)
    }
    this.rest()
  }

  /** Later, on the island's clock. */
  after(s: number, f: () => void) {
    this.timers.push({ t: s, f })
  }

  /** Tuk, Kae and the lantern where they wait at the foot of Na Dan pier: sad until the fireflies are all home. */
  private rest() {
    const h = this.h
    const y = (p: XZ) => h.heightAt(p.x, p.z)
    const all = h.flags.size === FIREFLY_IDS.length
    this.tuk.place(STAGE.tuk.x, y(STAGE.tuk), STAGE.tuk.z, faceTo(STAGE.tuk, nd(-0.4, -2.6)))
    this.kae.place(STAGE.kae.x, y(STAGE.kae), STAGE.kae.z, faceTo(STAGE.kae, nd(-0.4, -2.6)))
    this.lantern.position.set(STAGE.lantern.x, y(STAGE.lantern), STAGE.lantern.z)
    this.lantern.scale.setScalar(0.62)
    // (With all four found they have gone to get the show ready: the beach is theirs at night.)
    const out = !all && this.geckosOut
    this.tuk.root.visible = this.kae.root.visible = this.lantern.visible = out
    if (h.flags.size === 0) this.tuk.pull('sad', true)
    else this.tuk.cheer()
    this.kae.cheer()
  }

  /** Where a waiting firefly is this frame (each does what it loves). */
  private waitAt(id: FireflyId, t: number, out: Vector3): { glow: number } {
    const w = WAIT[id]
    const h = this.h
    if (id === 'jetski') {
      // Zoom: fast loops and figure-eights low over the water off the jet ski beach.
      const a = t * 1.9
      const f = FRAMES.saikaew
      out.set(w.x + f.t.x * Math.sin(a) * 6 + f.n.x * Math.sin(a * 2) * 2.4, 1.1 + Math.sin(a * 3) * 0.35, w.z + f.t.z * Math.sin(a) * 6 + f.n.z * Math.sin(a * 2) * 2.4)
      return { glow: 1 }
    }
    if (id === 'sandcastle') {
      // Sandy: a glow under the sand that pops up for a look, then ducks back down.
      const k = (t * 0.22) % 1
      const up = k < 0.3 ? Math.sin((k / 0.3) * Math.PI) : 0
      out.set(w.x, h.heightAt(w.x, w.z) - 0.12 + up * 0.75, w.z)
      return { glow: 0.45 + up * 0.55 }
    }
    if (id === 'snorkel') {
      // Bubbles: a blue light far out at sea, bobbing on the swell.
      out.set(w.x + Math.sin(t * 0.4) * 1.5, 0.9 + Math.sin(t * 1.1) * 0.35, w.z + Math.cos(t * 0.33) * 1.5)
      return { glow: 1 }
    }
    // Peekaboo: peeks round one side of the driftwood tree, hides behind it, peeks round the other.
    const k = (t * 0.2) % 1
    const side = k < 0.5 ? 1 : -1
    const kk = (k % 0.5) / 0.5
    const peek = kk < 0.62 ? Math.sin((kk / 0.62) * Math.PI) : 0
    const f = FRAMES.prao
    const y = h.heightAt(w.x, w.z)
    out.set(w.x + f.t.x * side * (0.5 + peek * 1.3) - f.n.x * (1 - peek) * 0.5, y + 1.5 + peek * 0.3, w.z + f.t.z * side * (0.5 + peek * 1.3) - f.n.z * (1 - peek) * 0.5)
    return { glow: 0.25 + peek * 0.75 }
  }

  /** Every frame. `her`: where she is (her head, the jet ski she rides); `spot`: the beach she's on; `film`: a film is on. */
  update(dt: number, t: number, her: Vector3, spot: SpotId, film: boolean, calm: boolean) {
    for (const tm of [...this.timers]) {
      tm.t -= dt
      if (tm.t <= 0) {
        this.timers.splice(this.timers.indexOf(tm), 1)
        tm.f()
      }
    }
    const h = this.h
    this.tuk.update(dt, t)
    this.kae.update(dt, t)
    // The found ones circle her horn.
    this.center.copy(her)
    this.center.y += 0.12 + this.lift
    const join = this.joining
    this.swarm.update(dt, t, this.center, (f) => !join || f !== join.f || join.t > 0.9)
    if (join) {
      // The new one swoops in from its stop: a big arc that tightens onto her.
      join.t = Math.min(1, join.t + dt / 1.5)
      if (join.t <= 0.9) {
        const a = join.t * 9
        const r = (1 - join.t / 0.9) * 2.6 + 0.6
        tmp.set(her.x + Math.sin(a) * r, her.y + (1 - join.t) * 1.6, her.z + Math.cos(a) * r)
        join.f.fly(tmp, dt, 7)
        if (Math.random() < dt * 30) h.stars.emit(join.f.pos.x, join.f.pos.y, join.f.pos.z, (Math.random() - 0.5) * 0.4, 0.2, (Math.random() - 0.5) * 0.4, 0.7, 0.08)
      } else this.joining = null
    }
    // The ones still to find: each at its beach.
    for (const [id, f] of this.waiting) {
      const { glow } = this.waitAt(id, t, tmp)
      f.glowGoal = glow
      f.fly(tmp, dt, id === 'jetski' ? 9 : 6)
      f.update(dt, t)
      f.root.visible = !this.memoryOn
      // Sparkle, the first time she comes near one this visit (not during a film, not while she's busy).
      if (!film && calm && spot === STOP_BEACH[id] && Math.hypot(her.x - WAIT[id].x, her.z - WAIT[id].z) < (id === 'snorkel' ? 40 : 22) && !this.told.has(id)) {
        this.told.add(id)
        if (firstTime(`samet-firefly-near-${id}`)) {
          h.say(S.island.near[id])
          fireflySfx.giggle(id)
        }
      }
    }
    // The memory's four: circling over the dancers; the wind shakes them, then scatters them up and away over the
    // sea, fanned out so all four stay in the picture as they go.
    if (this.memoryOn) {
      if (this.scatter) this.blown = Math.min(1, this.blown + dt / 4.2)
      const c = bay(-6, -2.2)
      const sea = FRAMES.saikaew
      this.memory.forEach((f, i) => {
        const a = t * 1.6 + (i * Math.PI) / 2
        const wob = this.windy ? Math.sin(t * 19 + i * 2) * 0.45 : 0
        const k = this.blown ** 1.6
        // Fanned out seaward: -42°, -14°, +14°, +42° off straight out to sea.
        const fan = ((i - 1.5) * 28 * Math.PI) / 180
        const dx = sea.n.x * Math.cos(fan) + sea.t.x * Math.sin(fan)
        const dz = sea.n.z * Math.cos(fan) + sea.t.z * Math.sin(fan)
        const r = 1.7 * (1 - k * 0.7)
        tmp.set(c.x + Math.sin(a) * r + wob + dx * k * 17, 2.4 + Math.sin(t * 2 + i) * 0.3 + wob * 0.5 + k * 7.5, c.z + Math.cos(a) * r + dz * k * 17)
        f.size = 1.5 + k * 1.2
        f.fly(tmp, dt, 8)
        f.update(dt, t)
      })
      if (this.windy && Math.random() < dt * 90) {
        // Leaves and petals streaking across on the wind.
        const p = bay(-6 + (Math.random() - 0.5) * 20, -4 + (Math.random() - 0.5) * 12)
        h.petals.emit(p.x - sea.t.x * 8, 0.5 + Math.random() * 4, p.z - sea.t.z * 8, sea.t.x * (9 + Math.random() * 6), 0.4 + Math.random(), sea.t.z * (9 + Math.random() * 6), 1.4, 0.12)
      }
    }
    // Tofu in a film.
    if (film) {
      const pup = h.pup
      if (this.pupGoal) {
        if (pup.moveToward(this.pupGoal, this.pupSpeed, dt, 0.25) < 0.1) this.pupGoal = null
      } else pup.stay(dt, this.pupFace ?? { x: her.x, z: her.z })
      pup.wag = 1
      pup.update(dt, t, Math.max(h.heightAt(pup.x, pup.z), -0.35))
    }
  }

  /** Back from a stop with its firefly: it swoops in from that stop to join the others, Sparkle counts, and the
   *  pictures come up (or, with all four, `all` plays). */
  welcome(id: FireflyId, then: () => void) {
    const h = this.h
    const w = WAIT[id]
    const f = this.swarm.get(id) ?? this.swarm.add(id)
    f.place(w.x, Math.max(0.6, h.heightAt(w.x, w.z) + 1.2), w.z)
    this.joining = { f, t: 0 }
    fireflySfx.giggle(id)
    this.after(1.35, () => {
      f.flash()
      fireflySfx.found(id)
      h.kaylee.react('hop')
      h.pup.bark(2)
      h.pup.play('spin')
      for (let i = 0; i < 22; i++) h.stars.emit(f.pos.x, f.pos.y, f.pos.z, (Math.random() - 0.5) * 2.2, 0.6 + Math.random() * 1.6, (Math.random() - 0.5) * 2.2, 1.1, 0.1)
    })
    const n = h.flags.size
    if (n < FIREFLY_IDS.length) this.after(2.3, () => h.say(S.island.count[Math.max(0, Math.min(2, n - 1))]))
    this.after(n < FIREFLY_IDS.length ? 4.6 : 2.6, then)
  }

  /** She rode here for this stop (the driver has just said where they are): Sparkle doesn't also point its firefly out. */
  arrivedFor(id: FireflyId) {
    this.told.add(id)
  }

  /** A firefly round her horn gives a bright twinkle (the top-right button's row was tapped, a poke). */
  twinkle() {
    this.swarm.flies.forEach((f, i) => this.after(i * 0.12, () => (f.flash(), fireflySfx.chime(f.id))))
  }

  /** Tuk or Kae poked while they wait at Na Dan. */
  private pokes = 0
  poke(who: 'tuk' | 'kae') {
    const c = who === 'tuk' ? this.tuk : this.kae
    c.m.react('hop')
    this.h.say(who === 'tuk' ? (this.h.flags.size ? S.intro.ask : S.intro.ohno) : this.pokes++ % 2 ? S.intro.gone : S.intro.tofu)
  }

  // ---------------------------------------------------------------- the way in

  intro(): Film {
    const h = this.h
    const y = (p: XZ) => h.heightAt(p.x, p.z)
    const v3 = (p: XZ, up: number): V3 => [p.x, y(p) + up, p.z]
    const { kaylee, nick, ji, pup } = h
    const { tuk, kae } = this
    // The two groups face each other across the lantern, each turned about a third of the way toward the camera.
    const famLook = nd(-0.6, -7.2)
    const geckoLook = nd(-0.4, -2.6)
    const onStage = () => {
      h.stand({ ...STAGE.kaylee, face: faceTo(STAGE.kaylee, famLook) }, { ...STAGE.nick, face: faceTo(STAGE.nick, famLook) }, { ...STAGE.ji, face: faceTo(STAGE.ji, famLook) })
      tuk.place(STAGE.tuk.x, y(STAGE.tuk), STAGE.tuk.z, faceTo(STAGE.tuk, geckoLook))
      kae.place(STAGE.kae.x, y(STAGE.kae), STAGE.kae.z, faceTo(STAGE.kae, geckoLook))
      tuk.root.visible = kae.root.visible = this.lantern.visible = true
    }
    const arms = (g: Islander, l: [number, number, number], r: [number, number, number]) => (g.m.rig.armL.rotation.set(...l), g.m.rig.armR.rotation.set(...r))
    const sea = bay(-6, -2.2)
    return {
      id: 'intro',
      beats: [
        {
          // The pier: they have just stepped off the boat, the island behind them.
          id: 'here',
          shot: { eye: v3(nd(4.6, 24.5), 2.3), look: v3(nd(-4, 16.6), 1.5), fov: 40, to: { eye: v3(nd(1.4, 21.4), 1.9), look: v3(nd(-4, 17.6), 1.2) }, move: 3.6, tall: { eye: v3(nd(7.5, 28.5), 3.2), to: { eye: v3(nd(4, 24.5), 2.6) } } },
          start: () => {
            this.stopMusic?.()
            this.stopMusic = storyMusic()
            const p = STAGE.pier
            const c = nd(1.4, 21.4)
            h.stand({ ...p.kaylee, face: faceTo(p.kaylee, c) }, { ...p.nick, face: faceTo(p.nick, c) }, { ...p.ji, face: faceTo(p.ji, c) })
            pup.place(STAGE.pupFrom.x, STAGE.pupFrom.z, 0)
            this.pupGoal = null
            this.pupFace = null
            tuk.pull('sad', true)
            kae.pull('sad', true)
            this.geckosOut = true
            tuk.root.visible = kae.root.visible = this.lantern.visible = true
          },
          say: S.intro.here,
          sayAt: 0.9,
          dur: 3.4,
          cues: [
            [0.8, () => ji.react('wave')],
            [1.4, () => kaylee.react('hop')],
          ],
        },
        {
          // The foot of the pier: Tofu comes tearing along the sand, barking, and skids to a stop in front of her.
          id: 'tofu',
          shot: { eye: v3(nd(1.9, -6.4), 1.3), look: v3(nd(-3.5, -3.3), 0.62), fov: 38, sway: 0.03, tall: { eye: v3(nd(2.6, -6.9), 1.5), fov: 54 } },
          start: () => {
            onStage()
            tuk.root.visible = kae.root.visible = this.lantern.visible = false
            pup.place(STAGE.pupFrom.x, STAGE.pupFrom.z, 0)
            this.pupGoal = STAGE.pupAt
            this.pupFace = STAGE.kaylee
            this.pupSpeed = 8
            pup.bark(3, 0.2)
          },
          cues: [
            [1.3, () => (pup.hop(3), pup.bark(2))],
            [1.5, () => (nick.react('hop'), kaylee.lookAt(STAGE.pupAt.x, 0.3, STAGE.pupAt.z))],
            [3.2, () => (pup.play('spin'), pup.bark(2))],
          ],
          say: S.intro.puppy,
          sayAt: 1.8,
          dur: 4.2,
        },
        {
          // The geckos, by their empty lantern: Tuk frets.
          id: 'ohno',
          shot: { eye: v3(nd(0.3, -4.0), 1.2), look: v3(nd(-3.9, -6.9), 0.72), fov: 32, to: { eye: v3(nd(-0.3, -4.4), 1.1) }, tall: { eye: v3(nd(0.9, -3.5), 1.35), fov: 52, to: { eye: v3(nd(0.6, -3.7), 1.3) } } },
          start: () => {
            tuk.root.visible = kae.root.visible = this.lantern.visible = true
            tuk.cheer()
            tuk.pull('wow')
            arms(tuk, [-2.4, 0, -0.5], [-2.4, 0, 0.5])
            this.pupGoal = STAGE.pupSit
            this.pupFace = STAGE.tuk
            this.pupSpeed = 4
            kaylee.lookAt(STAGE.tuk.x, 0.8, STAGE.tuk.z)
          },
          cues: [
            [0.5, () => tuk.m.react('hop')],
            [1.1, () => tuk.m.react('wiggle')],
            [1.7, () => tuk.m.react('hop')],
            [2.2, () => (arms(tuk, [0, 0, 0], [0, 0, 0]), tuk.pull('sad', true))],
          ],
          say: S.intro.ohno,
          sayAt: 0.35,
          dur: 2.8,
        },
        {
          // Kae points at the empty lantern.
          id: 'gone',
          shot: { eye: v3(nd(-0.6, -4.6), 1.05), look: v3(nd(-3.5, -6.6), 0.62), fov: 30, blend: 0.5, tall: { eye: v3(nd(0.3, -4.0), 1.25), fov: 52 } },
          start: () => {
            kae.cheer()
            arms(kae, [0, 0, 0], [-1.1, 0, -0.7])
          },
          cues: [
            [0.2, () => sametSfx.boing()],
            [2.0, () => (arms(kae, [0, 0, 0], [0, 0, 0]), kae.pull('sad', true))],
          ],
          say: S.intro.gone,
          sayAt: 0.5,
          dur: 2.9,
        },
        {
          // Their memory: last night on Sai Kaew, the show, the four fireflies circling.
          id: 'every',
          turn: true,
          memory: true,
          shot: { eye: v3(bay(-6, -9.6), 2.0), look: [sea.x, 1.5, sea.z], fov: 50, to: { eye: v3(bay(-6, -8.6), 1.9) }, tall: { eye: v3(bay(-6, -9.6), 2.0), fov: 70, to: { eye: v3(bay(-6, -9.0), 1.95) } } },
          start: () => {
            h.night(true)
            h.gather(true)
            this.stopBed?.()
            this.stopBed = memoryBed()
            this.memoryOn = true
            this.windy = false
            this.scatter = false
            this.blown = 0
            this.memory.forEach((f, i) => {
              f.size = 1.5
              f.root.visible = true
              f.place(sea.x + Math.sin((i * Math.PI) / 2) * 1.7, 2.4, sea.z + Math.cos((i * Math.PI) / 2) * 1.7)
              f.glow = f.glowGoal = 1
            })
            fireflySfx.all(0.04)
          },
          say: S.intro.every,
          sayAt: 1.0,
          dur: 4.6,
          cues: [[2.6, () => this.memory.forEach((f, i) => this.after(i * 0.18, () => (f.flash(), fireflySfx.chime(f.id, 0.035))))]],
        },
        {
          // The big wind: everything shakes, petals streak across.
          id: 'wind',
          memory: true,
          shot: { eye: v3(bay(-6, -8.6), 1.9), look: [sea.x, 1.6, sea.z], fov: 50, to: { look: [sea.x, 2.3, sea.z] }, sway: 0.1, tall: { eye: v3(bay(-6, -9.0), 1.95), fov: 70 } },
          start: () => {
            this.windy = true
            sametSfx.whoosh()
          },
          cues: [
            [0.8, () => sametSfx.whoosh()],
            [1.6, () => ((this.scatter = true), this.memory.forEach((f, i) => this.after(i * 0.15, () => fireflySfx.whisk(f.id))))],
          ],
          say: S.intro.wind,
          sayAt: 0.4,
          dur: 3.2,
        },
        {
          // Up and away over the sea, four little lights going four ways.
          id: 'away',
          memory: true,
          shot: { eye: v3(bay(-6, -8.6), 1.9), look: [sea.x, 2.3, sea.z], fov: 50, to: { look: [sea.x + FRAMES.saikaew.n.x * 8, 6.5, sea.z + FRAMES.saikaew.n.z * 8], fov: 54 }, move: 2.6, sway: 0.06, tall: { eye: v3(bay(-6, -9.0), 1.95), fov: 70, to: { fov: 76 } } },
          start: () => (this.scatter = true),
          say: S.intro.away,
          sayAt: 0.3,
          dur: 3.0,
        },
        {
          // Back at the pier, now: no fireflies, no show. Both groups, from the side.
          id: 'noshow',
          turn: true,
          shot: { eye: v3(nd(3.3, -5.0), 1.55), look: v3(nd(-3.8, -5.0), 0.72), fov: 48, to: { eye: v3(nd(2.9, -5.0), 1.45) }, tall: { eye: v3(nd(3.3, -4.8), 1.9), fov: 86, to: { eye: v3(nd(3.1, -4.8), 1.85) } } },
          start: () => {
            this.endMemory()
            onStage()
            this.pupGoal = null
            this.pupFace = STAGE.tuk
            pup.place(STAGE.pupSit.x, STAGE.pupSit.z, 0)
            tuk.pull('sad', true)
            kae.pull('sad', true)
            kaylee.lookAt(STAGE.tuk.x, 0.8, STAGE.tuk.z)
          },
          say: S.intro.noshow,
          sayAt: 0.9,
          dur: 3.4,
        },
        {
          // But Tofu saw: he spins, barks, wags his whole self.
          id: 'saw',
          shot: { eye: v3(nd(0.1, -5.0), 0.6), look: () => tmpHead.set(pup.x, pup.y + 0.42, pup.z), fov: 30, tall: { eye: v3(nd(1.4, -4.9), 0.8) } },
          start: () => {
            this.pupFace = nd(0.1, -5.0)
            pup.bark(3, 0.18)
            kae.cheer()
            kae.pull('wow')
          },
          cues: [
            [0.25, () => pup.play('spin')],
            [2.0, () => (pup.hop(3), pup.bark(2), kae.m.react('hop'))],
          ],
          say: S.intro.tofu,
          sayAt: 0.7,
          dur: 3.2,
        },
        {
          // The ask, out front: both geckos look straight at her (and at us).
          id: 'ask',
          shot: { eye: v3(nd(-1.5, -3.5), 1.05), look: v3(nd(-3.8, -6.95), 0.74), fov: 30, to: { eye: v3(nd(-1.9, -4.1), 1.0) }, tall: { eye: v3(nd(-1.0, -2.6), 1.3), fov: 56, to: { eye: v3(nd(-1.2, -3.0), 1.25) } } },
          start: () => {
            const front = nd(-1.7, -3.6)
            tuk.cheer()
            kae.cheer()
            tuk.place(STAGE.tuk.x, y(STAGE.tuk), STAGE.tuk.z, faceTo(STAGE.tuk, front))
            kae.place(STAGE.kae.x, y(STAGE.kae), STAGE.kae.z, faceTo(STAGE.kae, front))
            arms(tuk, [-1.0, 0, -0.4], [-1.0, 0, 0.4])
            this.pupFace = STAGE.kaylee
          },
          say: S.intro.ask,
          sayAt: 0.4,
          dur: 3.0,
          cues: [
            [2.3, () => (kaylee.react('hop'), sametSfx.giggle())],
            [2.5, () => (arms(tuk, [0, 0, 0], [0, 0, 0]), tuk.m.react('hop'), kae.m.react('hop'))],
          ],
        },
      ],
      finish: () => {
        this.stopMusic?.()
        this.stopMusic = null
        this.endMemory()
        onStage()
        this.pupGoal = null
        this.pupFace = null
        pup.place(STAGE.pupSit.x, STAGE.pupSit.z, 0)
        arms(tuk, [0, 0, 0], [0, 0, 0])
        arms(kae, [0, 0, 0], [0, 0, 0])
        tuk.cheer()
        kae.cheer()
        kaylee.lookAway()
      },
    }
  }

  /** Out of the memory: day again, the memory's fireflies gone. */
  private endMemory() {
    this.stopBed?.()
    this.stopBed = null
    if (!this.memoryOn) return
    this.memoryOn = false
    this.windy = false
    this.scatter = false
    this.blown = 0
    for (const f of this.memory) f.root.visible = false
    this.h.night(false)
    this.h.gather(false)
  }

  // ---------------------------------------------------------------- all four

  /** All four found, on the beach she has just come back to (`f`: its frame; `k`: where she stands). */
  all(f: { t: XZ; n: XZ }, k: XZ): Film {
    const h = this.h
    const { kaylee, nick, ji, pup } = h
    const p = (u: number, v: number): XZ => ({ x: k.x + f.t.x * u + f.n.x * v, z: k.z + f.t.z * u + f.n.z * v })
    const v3 = (q: XZ, up: number): V3 => [q.x, Math.max(0, h.heightAt(q.x, q.z)) + up, q.z]
    const ky = Math.max(0, h.heightAt(k.x, k.z))
    // The three of them in a row facing the sea, the camera straight out in front: everyone's face in every shot.
    const cam = p(0, 5.4)
    const stand = () => {
      h.stand({ ...k, face: faceTo(k, cam) }, { ...p(-1.45, -0.5), face: faceTo(p(-1.45, -0.5), cam) }, { ...p(1.45, -0.5), face: faceTo(p(1.45, -0.5), cam) })
      pup.place(p(0.75, 1.0).x, p(0.75, 1.0).z, 0)
      this.pupFace = cam
    }
    const face = (m: Member) => () => m.root.getWorldPosition(tmpHead).setY(tmpHead.y + m.height * 0.7)
    /** A step toward the camera from someone, a little to the side they're not sharing with her. */
    const near = (m: Member, d: number, up: number) => (): Vector3 => {
      const q = m.root.position
      return tmpEye.set(q.x + (cam.x - q.x) * d + (q.x - k.x) * 0.25, ky + up, q.z + (cam.z - q.z) * d + (q.z - k.z) * 0.25)
    }
    return {
      id: 'all',
      beats: [
        {
          // The four swirl up round her, a chord of chimes.
          id: 'swirl',
          shot: { eye: v3(cam, 1.5), look: [k.x, ky + 1.15, k.z], fov: 40, to: { eye: v3(p(0, 4.3), 1.45), look: [k.x, ky + 1.35, k.z] }, tall: { eye: v3(p(0, 8.2), 2.0), to: { eye: v3(p(0, 7), 1.9) } } },
          start: () => {
            stand()
            this.swarm.radius = 0.55
            this.swarm.pace = 1
            fireflySfx.all()
          },
          tick: (kk) => {
            this.swarm.radius = 0.55 + Math.sin(kk * Math.PI) * 0.75
            this.swarm.pace = 1 + Math.sin(kk * Math.PI) * 2.2
            this.lift = Math.sin(kk * Math.PI) * 0.5
          },
          cues: [
            [0.5, () => this.swarm.flies.forEach((fl) => fl.flash())],
            [0.9, () => (kaylee.react('hop'), pup.play('spin'), pup.bark(3, 0.2))],
            [1.6, () => this.swarm.flies.forEach((fl) => fl.flash())],
          ],
          dur: 2.8,
        },
        {
          // Mom.
          id: 'four',
          shot: { eye: near(ji, 0.52, 1.15), look: face(ji), fov: 36, blend: 0.6, tall: { eye: near(ji, 0.85, 1.4) } },
          start: () => ((this.swarm.radius = 0.55), (this.swarm.pace = 1), (this.lift = 0), ji.react('wave')),
          say: S.all.four,
          sayAt: 0.3,
          dur: 2.8,
          cues: [[1.6, () => kaylee.react('hop')]],
        },
        {
          // Dad calls the sunset.
          id: 'sun',
          shot: { eye: near(nick, 0.52, 1.15), look: face(nick), fov: 36, blend: 0.6, tall: { eye: near(nick, 0.85, 1.4) } },
          start: () => nick.react('hop'),
          say: L.samet.island.sunset,
          sayAt: 0.3,
          dur: 3.0,
          cues: [[1.8, () => (pup.bark(2), pup.hop(3))]],
        },
      ],
      finish: () => {
        stand()
        this.pupFace = null
        this.swarm.radius = 0.55
        this.swarm.pace = 1
        this.lift = 0
        this.rest()
      },
    }
  }

  /** In the memory (the island keeps its own puppy code off and its lamps on). */
  get inMemory() {
    return this.memoryOn
  }

  /** For the QA readout. */
  qa() {
    return {
      found: this.swarm.flies.map((f) => f.id),
      waiting: [...this.waiting.keys()],
      geckos: this.tuk.root.visible,
      joining: this.joining?.f.id ?? null,
      colors: Object.fromEntries(FIREFLY_IDS.map((id) => [id, FIREFLIES[id].color])),
    }
  }
}

const tmp = new Vector3()
const tmpHead = new Vector3()
const tmpEye = new Vector3()

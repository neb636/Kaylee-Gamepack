// Zoom, the pink firefly of the jet ski stop (the trip's story: planning/around-the-world/thailand/samet-story.md;
// how films work: docs/films.md). She loves to go fast: all night she has zoomed round the jet ski man's buoys, and
// she only stops for someone fast.
//
//   the way in (film `intro`, jetski?round=story): on the sand by the hut the jet ski man asks if they're looking for
//     a pink light; out by the flag buoys Zoom whips a figure-eight round them, stops nose to nose with the camera,
//     giggles and darts off to sea; "She only stops for someone fast!". Then the life jacket, as ever.
//   in play: she flies figure-eights out ahead of the jet ski. Go fast (or just keep riding a while) and she comes
//     alongside for a look, then darts ahead ("There she is! After her!"); slow down and she drifts back to her loops. In the waves she skims the
//     water, up and over every crest, and loops the loop when the jet ski jumps. In the race she hovers at the start,
//     leads the way to the big orange buoy, sits on top of it until it's rounded, then leads the way home.
//   found (film `found`, jetski?round=found): Zoom spirals down and lands on your unicorn's horn. "Ha ha! She likes
//     you!", "You found Zoom!", "Fast like a firefly!". Then back to the island with her.
// Once she's found (the trip's flags) she rides along round the horn with the other fireflies, and getting off needs
// no film.
//
// The bay (jetski.ts) owns the jet ski and the game; this file owns Zoom, her friends round the horn and the films'
// beats. Everything a film does that the game needs afterwards is also done by its finish(), so skipping from any
// beat leaves the world right.
import { Group, Vector3, type Scene } from 'three'
import { clamp, type Line } from '../../../../../../sdk'
import type { Bag } from '../../../../../engine3d/dispose'
import type { Driver } from '../../../../../engine3d/drive'
import type { Film } from '../../../../../engine3d/film'
import { Particles } from '../../../../../engine3d/particles'
import type { Avatar } from '../../../characters/avatar'
import { HORN_TIP } from '../../../characters/closet'
import type { Member } from '../../../characters/member'
import { L } from '../../../lines'
import { bay, FAR_BUOY, RACE, SEAWARD, type RoundId } from '../island/layout'
import { FIREFLY_IDS, Firefly, fireflySfx, Swarm, type FireflyId } from '../story/firefly'

const S = L.samet.story.jetski
const DEG = 180 / Math.PI
const ME: FireflyId = 'jetski'

/** The stop's rounds: its two films beside the three play rounds. */
export type JetRound = RoundId | 'story' | 'found'
export const isFilmRound = (r: JetRound): r is 'story' | 'found' => r === 'story' || r === 'found'

/** How big Zoom is drawn (a firefly's own size is about 30 cm across its glow): out on the bay from the chase camera,
 *  in the way-in film's wide and close shots, and sitting on the horn. */
const SIZE = { play: 3.6, wide: 3.0, close: 1.6, horn: 1.25, friends: 1.0 }
/** Her glow by day (a firefly's halo is made for the night: at full strength the noon sea and sky wash it out to a
 *  white ball), and close to the camera, where it would fill the frame. */
const GLOW = { day: 0.32, close: 0.2 }
/** How fast the jet ski must go (a share of its top speed) for Zoom to come alongside, and the seconds of riding
 *  after which she comes alongside anyway (so nobody has to be fast to meet her). */
const FAST = 0.45
const CURIOUS = 7
/** Where the found film is played: just off the hut, nose to the sea. */
const FOUND_AT = { u: 0, v: 6 }
/** How far forward of her head pivot the horn's tip is (head-local meters; its height is the closet's HORN_TIP). */
const HORN_FWD = 0.17

/** What the bay lends the story. */
export interface ZoomHost {
  scene: Scene
  bag: Bag
  kaylee: Avatar
  nick: Member
  man: Member
  /** Her jet ski. */
  d: Driver
  water(x: number, z: number): number
  groundY(x: number, z: number): number
  /** A point pulled back inside the buoy rope. */
  insideRope(x: number, z: number): { x: number; z: number }
  /** Kaylee and Dad back in their seats. */
  seat(): void
  /** The jet ski man on the sand by his hut, his own jet ski parked along the beach. */
  manHome(): void
  /** The jet ski man sitting on his own jet ski, there. */
  manRides(x: number, z: number, heading: number): void
  /** Sparkle says a line (in play). */
  say(l: Line): void
  /** Sparkles (a burst where something lovely happens). */
  sparkles(x: number, y: number, z: number, n: number): void
  /** Confetti on the screen: she found Zoom. */
  cheer(): void
  camera(): Vector3
  /** The screen is taller than it is wide. */
  tall(): boolean
}

/** What the jet ski is doing this frame (for Zoom in play). */
export interface PlayNow {
  round: RoundId
  /** jacket: waiting on the sand; ride: hers to steer; count: the race's countdown; race; end: the race is over;
   *  off: up on the sand or parking. */
  doing: 'jacket' | 'ride' | 'count' | 'race' | 'end' | 'off'
  /** Her speed as a share of top speed. */
  fast: number
  /** In the air, and the frame it took off. */
  air: boolean
  jumped: boolean
  /** Round the buoy yet (the race). */
  leg: number
  /** The water under the jet ski, and how high it is above it. */
  surf: number
  y: number
  /** Seconds she has ridden this visit. */
  rode: number
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()

export class ZoomStory {
  readonly zoom: Firefly
  /** wild: she plays out on the bay; film: a film flies her; horn: found, she circles the horn with the others. */
  mode: 'wild' | 'film' | 'horn'
  /** What she's up to in play (QA). */
  state: 'loops' | 'beside' | 'ahead' | 'perch' | 'start' | 'over' = 'loops'
  /** She has come alongside at least once: the jet ski went fast. */
  chased = false
  private friends: Swarm
  /** Follows the tip of the horn (the fireflies she has found circle it). */
  private horn = new Group()
  private trail: Particles
  private home = new Vector3()
  private stateT = 0
  private fastT = 0
  private slowT = 0
  private loopT = -1
  private giggleAt = -99
  private chimeAt = -99
  private toldChase = false
  /** The found film: she sits on the tip of the horn. */
  private perched = false

  constructor(
    private h: ZoomHost,
    flags: readonly string[],
    /** Zoom is hers already (the trip's flags): no films, she rides along. */
    found: boolean,
  ) {
    const { scene, bag } = h
    this.zoom = new Firefly(ME, bag)
    this.zoom.size = SIZE.play
    this.zoom.glow = this.zoom.glowGoal = GLOW.day
    scene.add(this.zoom.root, this.horn)
    // The ones she has found already ride along round her horn (Zoom too, once she's found).
    const ids = FIREFLY_IDS.filter((id) => flags.includes(id) && (id !== ME || found))
    this.friends = new Swarm(bag, this.horn, ids, SIZE.friends)
    this.friends.radius = 0.42
    for (const f of this.friends.flies) f.glow = f.glowGoal = GLOW.day
    this.mode = found ? 'horn' : 'wild'
    this.zoom.root.visible = !found
    this.trail = new Particles({ kind: 'spray', count: 90, colors: ['#FF4FA3', '#FF9CCB'], gravity: 0.4 }, bag)
    scene.add(this.trail.mesh)
    const p = bay(1.5, 14)
    this.home.set(p.x, 0, p.z)
    this.zoom.place(p.x, 2, p.z)
  }

  /** The tip of your unicorn's horn (world). */
  hornTip(out = new Vector3()) {
    const r = this.h.kaylee.rig
    // (This frame's place: the jet ski has just moved under her.)
    r.head.updateWorldMatrix(true, false)
    // (The modelled unicorn's horn is measured; the code-built one's sits on top of her head.)
    return r.head.localToWorld(r.closet ? out.set(0, HORN_TIP, HORN_FWD) : out.set(0, r.face.headY + r.face.R * 1.5, r.face.R * 0.4))
  }
  private yawTo(from: { x: number; z: number }, to: { x: number; z: number }) {
    return Math.atan2(to.x - from.x, to.z - from.z)
  }
  /** A point in the beach's frame (`u` along the sand, `v` out to sea), `up` meters above the sand or the water there. */
  private at(u: number, v: number, up: number): () => Vector3 {
    const p = bay(u, v)
    const out = new Vector3()
    return () => out.set(p.x, this.h.groundY(p.x, p.z) + up, p.z)
  }

  // ---------------------------------------------------------------- in play

  /** Every frame (films too): the fireflies round her horn, Zoom's wings and glow, her trail; in play, where she flies. */
  update(dt: number, t: number, now: PlayNow) {
    const z = this.zoom
    this.hornTip(this.horn.position)
    this.friends.update(dt, t, tmp.set(0, 0.1, 0))
    if (this.mode === 'wild') this.play(dt, t, now)
    else if (this.perched) {
      // On the tip of the horn, looking out at us.
      const tip = this.hornTip(tmp)
      z.place(tip.x, tip.y + 0.075 * z.size, tip.z)
      const cam = this.h.camera()
      z.faceToward(cam.x, cam.z, dt)
    }
    if (this.mode !== 'horn') {
      z.update(dt, t)
      if (z.speed > 3.5 && z.root.visible) this.trail.emit(z.pos.x, z.pos.y, z.pos.z, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, 0.4 + Math.random() * 0.25, 0.065 * z.size, Math.random() < 0.65 ? 0 : 1)
    }
    this.trail.update(dt)
  }

  private go(s: ZoomStory['state']) {
    if (this.state === s) return
    this.state = s
    this.stateT = 0
  }
  private giggle(t: number, cool = 8) {
    if (t - this.giggleAt < cool) return
    this.giggleAt = t
    fireflySfx.giggle(ME)
  }

  private play(dt: number, t: number, now: PlayNow) {
    const { d } = this.h
    const z = this.zoom
    const sx = Math.sin(d.heading)
    const sz = Math.cos(d.heading)
    // (To the jet ski's right: the chase camera sits on that side.)
    const rx = -sz
    const rz = sx
    this.stateT += dt
    // ("Fast" is a finger held a fair way ahead of the jet ski, not only the very top speed: any five-year-old's
    // happy pace brings her alongside.)
    this.fastT = now.fast > FAST && now.doing === 'ride' ? this.fastT + dt : Math.max(0, this.fastT - dt * 2)
    this.slowT = now.fast < FAST * 0.55 ? this.slowT + dt : 0
    // In the waves she skims the water, up and over every crest.
    const over = (x: number, zz: number, up: number) => (now.round === 'waves' ? this.h.water(x, zz) : 0) + up
    const to = tmp2
    let rate = 4

    if (now.doing === 'count') this.go('start')
    else if (now.doing === 'race') this.go(this.state === 'perch' && now.leg === 0 ? 'perch' : 'ahead')
    else if (now.doing === 'end') this.go('over')
    else if (now.doing === 'jacket' || now.doing === 'off') this.go('loops')
    else if (this.state === 'start' || this.state === 'perch' || this.state === 'over') this.go('loops')

    if (this.state === 'start') {
      // The race's countdown: she hovers out in front of the two jet skis, looking back at them.
      const a = RACE.start[0]
      const b = RACE.start[1]
      to.set((a.x + b.x) / 2 + Math.sin(SEAWARD) * 7, 1.9 + Math.sin(t * 2.2) * 0.25, (a.z + b.z) / 2 + Math.cos(SEAWARD) * 7)
      z.fly(to, dt, 4)
      z.faceToward(d.x, d.z, dt)
      return
    }
    if (now.doing === 'race') {
      // The race: she leads the way, a few jet ski lengths ahead; at the big orange buoy she sits on top of it until
      // it's rounded, then leads the way home.
      const g = now.leg === 0 ? FAR_BUOY : bay(0, RACE.finish.v - 4)
      const dx = g.x - d.x
      const dz = g.z - d.z
      const dist = Math.hypot(dx, dz) || 1
      if (now.leg === 0 && dist < 22) this.go('perch')
      if (this.state === 'perch') {
        to.set(FAR_BUOY.x, this.h.water(FAR_BUOY.x, FAR_BUOY.z) + 2.5 + Math.sin(t * 3) * 0.12, FAR_BUOY.z)
        z.fly(to, dt, 5)
        if (z.speed < 1) z.faceToward(d.x, d.z, dt)
        return
      }
      const lead = Math.min(dist, 11)
      to.set(d.x + (dx / dist) * lead + rx * Math.sin(t * 2.1) * 1.2, 1.5 + Math.sin(t * 2.7) * 0.3, d.z + (dz / dist) * lead + rz * Math.sin(t * 2.1) * 1.2)
      z.fly(to, dt, 5)
      return
    }
    if (this.state === 'over') {
      // The race is over: round and round over her head.
      to.set(d.x + Math.sin(t * 3) * 1.6, now.surf + now.y + 2.6 + Math.sin(t * 2) * 0.2, d.z + Math.cos(t * 3) * 1.6)
      z.fly(to, dt, 5)
      return
    }

    if (this.state === 'loops') {
      // Figure-eights out ahead of the jet ski (over the sand by the hut while it waits there).
      const waiting = now.doing !== 'ride'
      // (Waiting for the life jacket the camera looks up the beach: she loops between the jet ski and the hut.)
      const want = waiting ? bay(3, -3.5) : this.h.insideRope(d.x + sx * 17, d.z + sz * 17)
      const k = 1 - Math.exp(-dt * (waiting ? 2 : 0.7))
      this.home.x += (want.x - this.home.x) * k
      this.home.z += (want.z - this.home.z) * k
      const a = t * 1.5
      const den = 1 + Math.sin(a) ** 2
      const wide = waiting ? 4.5 : 7
      // (The eight lies across the way she's heading, so both its loops show.)
      const ex = (Math.cos(a) / den) * wide
      const ez = ((Math.sin(a) * Math.cos(a)) / den) * wide * 0.9
      const x = this.home.x + rx * ex + sx * ez
      const zz = this.home.z + rz * ex + sz * ez
      to.set(x, over(x, zz, (waiting ? this.h.groundY(x, zz) + 2.6 : 1.9) + Math.sin(a * 2) * 0.5), zz)
      rate = 4
      // Fast for a moment and she comes alongside; a slow rider she comes to look at anyway, after a while.
      if (now.doing === 'ride' && (this.fastT > 1 || (!this.chased && now.rode > CURIOUS && now.fast > 0.12))) {
        this.go('beside')
        this.chased = true
      }
    } else if (this.state === 'beside') {
      // Alongside for a look at who's going so fast.
      const x = d.x + rx * 2.5 + sx * 1.6
      const zz = d.z + rz * 2.5 + sz * 1.6
      to.set(x, now.surf + now.y + 1.5 + Math.sin(t * 5) * 0.12, zz)
      rate = 7
      if (this.stateT > 1.3) {
        this.go('ahead')
        this.giggle(t, 6)
        // Sparkle, the first time: after her!
        if (!this.toldChase) {
          this.toldChase = true
          this.h.say(S.chase)
        }
      }
    } else {
      // Ahead of her, weaving: catch me!
      const f = 9.5 + Math.sin(t * 1.3) * 2
      const side = Math.sin(t * 2.1) * 1.6
      const x = d.x + sx * f + rx * side
      const zz = d.z + sz * f + rz * side
      to.set(x, over(x, zz, 1.35 + Math.sin(t * 3.3) * 0.25), zz)
      rate = 5
      if (this.slowT > 1.5) {
        this.go('loops')
        this.home.set(x, 0, zz)
      } else if (this.stateT > 8 && now.fast > FAST) {
        // Still fast: back alongside for another look.
        this.go('beside')
        if (t - this.chimeAt > 14) {
          this.chimeAt = t
          fireflySfx.chime(ME)
        }
      }
    }
    // The jet ski jumps: she loops the loop.
    if (now.jumped && this.loopT < 0 && this.state !== 'loops') {
      this.loopT = 0
      this.giggle(t, 9)
    }
    if (this.loopT >= 0) {
      this.loopT += dt / 0.8
      const a = this.loopT * Math.PI * 2
      to.y += (1 - Math.cos(a)) * 1.1
      to.x -= sx * Math.sin(a) * 1.4
      to.z -= sz * Math.sin(a) * 1.4
      rate = 9
      if (this.loopT >= 1) this.loopT = -1
    }
    z.fly(to, dt, rate)
    if (this.state === 'beside') z.faceToward(d.x, d.z, dt)
  }

  // ---------------------------------------------------------------- the films

  /** The way in: the jet ski man at his hut, Zoom out round the buoys. */
  intro(): Film {
    const h = this.h
    const { kaylee, nick, man } = h
    const z = this.zoom
    // On the sand between the hut and the water, a little east of the jet ski: the jet ski man, your unicorn, Dad.
    // (On a tall screen they stand closer together, Dad behind her, so all three fit across it.)
    const tall = h.tall()
    const MAN = tall ? bay(4.25, -3.2) : bay(5.1, -2.4)
    const KAY = tall ? bay(3.4, -1.75) : bay(3.0, -1.9)
    const DAD = tall ? bay(2.3, -3.3) : bay(0.9, -3.2)
    const CAM = tall ? bay(8.5, 4.5) : bay(7.2, 4.6)
    const mix = (a: { x: number; z: number }, b: { x: number; z: number }, k: number) => ({ x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k })
    const stand = (who: Avatar | Member, at: { x: number; z: number }, toward: { x: number; z: number }, cheat: number) => {
      if (who.root.parent !== h.scene) h.scene.attach(who.root)
      who.root.rotation.set(0, 0, 0)
      who.setPose('stand')
      // Cheated to the camera: turned most of the way out front, so no face is in profile; and their eyes go to a
      // point between us and who they talk to (a head turned all the way reads as the back of a head).
      const out = this.yawTo(at, CAM)
      const face = out + Math.atan2(Math.sin(this.yawTo(at, toward) - out), Math.cos(this.yawTo(at, toward) - out)) * cheat
      const y = h.groundY(at.x, at.z)
      who.place(at.x, y, at.z, face * DEG)
      const eyes = mix(CAM, toward, 0.4)
      who.lookAt(eyes.x, y + 1.3, eyes.z)
    }
    const onSand = () => {
      stand(man, MAN, KAY, 0.28)
      stand(kaylee, KAY, MAN, 0.3)
      stand(nick, DAD, MAN, 0.25)
    }
    // Her figure-eight round the two pink flag buoys (13 m either side of the middle, 10 m out), seen from past the
    // east one: she comes at the camera, whips round the near buoy, and away round the far one.
    const eight = (a: number, out: Vector3) => {
      const den = 1 + Math.sin(a) ** 2
      const p = bay((Math.cos(a) / den) * 16.2, RACE.finish.v + ((Math.sin(a) * Math.cos(a)) / den) * 9)
      return out.set(p.x, 1.35 + Math.sin(a * 2 + 0.6) * 0.4, p.z)
    }
    /** Where she is on the eight (in half turns) at `k` of the beat: -0.5..0.5 is the near buoy's loop. */
    const lap = (k: number) => {
      const legs: [number, number][] = [[0, -0.66], [0.1, -0.5], [0.62, 0.5], [0.9, 1.5], [1, 1.74]]
      for (let i = 1; i < legs.length; i++) if (k <= legs[i][0]) return legs[i - 1][1] + ((legs[i][1] - legs[i - 1][1]) * (k - legs[i - 1][0])) / (legs[i][0] - legs[i - 1][0])
      return legs[legs.length - 1][1]
    }
    const MID = this.at(4, 10, 1.3)
    // Where she stops to look at us: just past the east buoy, the open sea behind her.
    const FACE = bay(15.3, 10.6)
    const FACE_CAM = this.at(16.5, 7.4, 1.5)
    const hover = new Vector3(FACE.x, 1.55, FACE.z)
    // (Then off she darts, straight out to sea down the middle of the shot.)
    const away = bay(-5.7, 66.6)
    return {
      id: 'intro',
      beats: [
        {
          id: 'hello',
          shot: { eye: this.at(8.8, 6.8, 2.1), look: this.at(3.3, -2.5, 1.05), fov: 33, to: { eye: this.at(7.3, 4.2, 1.5), look: this.at(3.4, -2.5, 1.05) }, move: 3.4, ease: 'out', tall: { eye: this.at(8.9, 5.1, 2.3), look: this.at(3.55, -2.45, 1.05), fov: 44, to: { eye: this.at(8.3, 4.2, 1.9), look: this.at(3.55, -2.45, 1.05) } } },
          start: () => {
            this.mode = 'film'
            this.perched = false
            onSand()
            z.size = SIZE.wide
            z.glowGoal = GLOW.day
            z.root.visible = false
          },
          say: S.looking,
          sayAt: 1.0,
          dur: 4.4,
          cues: [[0.9, () => man.react('wave')]],
        },
        {
          id: 'zoom',
          shot: { eye: this.at(20.2, 8.0, 1.7), look: () => tmp3.copy(z.pos).lerp(MID(), 0.45), fov: 42, sway: 0.02, tall: { look: () => tmp3.copy(z.pos).lerp(MID(), 0.2), fov: 50 } },
          start: () => {
            z.root.visible = true
            const p = eight(lap(0) * Math.PI, tmp)
            z.place(p.x, p.y, p.z)
            fireflySfx.chime(ME)
          },
          // Round the eight: in from the middle, slowly round the near buoy (half the beat, so she's big for most of
          // it), whipping round the far one, and back at us.
          tick: (k, _t, dt) => z.fly(eight(lap(k) * Math.PI, tmp), dt, 14),
          say: S.zoom,
          sayAt: 0.4,
          dur: 4.2,
        },
        {
          id: 'face',
          shot: { eye: FACE_CAM, look: () => tmp3.copy(hover).setY(1.52), fov: 30, sway: 0.015, tall: { fov: 36 } },
          start: () => {
            z.size = SIZE.close
            z.glow = z.glowGoal = GLOW.close
            const p = bay(11.5, 13.5)
            z.place(p.x, 1.3, p.z)
          },
          tick: (_k, t, dt) => {
            if (t < 1.75) {
              // Nose to nose with us: a little giggle of a bounce.
              const hop = t > 0.75 && t < 1.35 ? Math.abs(Math.sin((t - 0.75) * Math.PI * 5)) * 0.07 : 0
              z.fly(tmp.copy(hover).setY(hover.y + hop), dt, 8)
              if (t > 0.3) {
                const cam = FACE_CAM()
                z.faceToward(cam.x, cam.z, dt)
              }
            } else z.fly(tmp.set(away.x, 3.2, away.z), dt, 2.2)
          },
          cues: [
            [0.75, () => fireflySfx.giggle(ME)],
            [1.75, () => fireflySfx.whisk(ME)],
          ],
          dur: 2.5,
        },
        {
          id: 'fast',
          shot: { eye: this.at(7.0, 3.3, 1.5), look: this.at(3.9, -2.3, 0.98), fov: 31, to: { eye: this.at(6.7, 2.7, 1.48) }, tall: { eye: this.at(8.2, 4.1, 1.85), look: this.at(3.55, -2.45, 1.05), fov: 44, to: { eye: this.at(7.9, 3.6, 1.8) } } },
          start: () => {
            onSand()
            z.root.visible = false
          },
          say: S.fast,
          sayAt: 0.35,
          dur: 3.2,
          cues: [
            [0.3, () => man.react('hop')],
            [2.0, () => kaylee.react('hop')],
            [2.2, () => nick.react('hop')],
          ],
        },
      ],
      finish: () => {
        // As the ride needs it: both on the jet ski at the water's edge, the jet ski man by his hut, Zoom out on the bay.
        h.seat()
        h.manHome()
        kaylee.lookAway()
        nick.lookAway()
        this.wild()
      },
    }
  }

  /** Back to play: Zoom flying her loops. */
  private wild() {
    const z = this.zoom
    this.mode = 'wild'
    this.perched = false
    this.state = 'loops'
    this.stateT = 0
    z.size = SIZE.play
    z.glowGoal = GLOW.day
    z.root.visible = true
    const p = bay(3, -3.5)
    this.home.set(p.x, 0, p.z)
    z.place(p.x + 6, 4, p.z)
  }

  /** Found: she lands on the horn. The jet ski bobs just off the hut, nose to the sea; the jet ski man has pulled up
   *  beside it on his own. */
  found(): Film {
    const h = this.h
    const { kaylee, nick, man, d } = h
    const z = this.zoom
    const { u, v } = FOUND_AT
    const SKI = bay(u, v)
    const HIS = bay(u - 2.6, v + 0.3)
    // (From the sea side and well round to her right: your unicorn in front, Dad behind her and off to one side, so
    // the horn has the beach behind it and not his face.)
    const CAM = bay(u + 5.3, v + 4.8)
    const stage = () => {
      this.mode = 'film'
      d.place(SKI.x, SKI.z, SEAWARD)
      h.seat()
      // (His jet ski toed in toward us, so he talks out front.)
      h.manRides(HIS.x, HIS.z, this.yawTo(HIS, CAM) - 0.12)
      man.lookAt(SKI.x, 1.7, SKI.z)
      z.root.visible = true
      z.size = SIZE.horn
    }
    // The close shot: from further round to her side, so the horn has the sea behind it, not Dad; she turns to us.
    const side = SEAWARD + 0.95
    const near = new Vector3()
    const closeEye = (dist: number) => () => {
      const tip = this.hornTip(tmp3)
      return near.set(SKI.x + Math.sin(side) * dist, tip.y + 0.1, SKI.z + Math.cos(side) * dist)
    }
    const closeLook = () => this.hornTip(tmp3).setY(tmp3.y - 0.32)
    let turns = 0
    return {
      id: 'found',
      beats: [
        {
          id: 'land',
          shot: { eye: this.at(u + 5.7, v + 5.1, 2.9), look: this.at(u - 0.9, v + 0.2, 1.6), fov: 34, to: { eye: this.at(u + 5.1, v + 4.5, 2.7) }, tall: { eye: this.at(u + 6.4, v + 6.0, 3.0), fov: 46 } },
          start: () => {
            stage()
            this.perched = false
            z.glow = z.glowGoal = GLOW.day
            // In from over our shoulder.
            const from = bay(u + 8.5, v + 7)
            z.place(from.x, 4, from.z)
            fireflySfx.chime(ME)
          },
          // A spiral down round her head, onto the tip of the horn.
          tick: (_k, t, dt) => {
            if (this.perched) return
            const k = clamp(t / 2.0, 0, 1)
            const tip = this.hornTip(tmp)
            const r = 1.5 * (1 - k) ** 1.4
            const a = k * Math.PI * 4.5 + 0.6
            z.fly(tmp2.set(tip.x + Math.sin(a) * r, tip.y + 0.075 * z.size + 0.8 * (1 - k), tip.z + Math.cos(a) * r), dt, 9)
            kaylee.lookAt(z.pos.x, z.pos.y, z.pos.z)
            nick.lookAt(z.pos.x, z.pos.y, z.pos.z)
          },
          cues: [
            [
              2.0,
              () => {
                this.perched = true
                fireflySfx.giggle(ME)
                const tip = this.hornTip(tmp)
                h.sparkles(tip.x, tip.y + 0.1, tip.z, 14)
                kaylee.lookAt(CAM.x, 1.9, CAM.z)
                kaylee.react('wiggle')
                man.react('hop')
              },
            ],
          ],
          say: S.likes,
          sayAt: 2.1,
          dur: 4.2,
        },
        {
          id: 'found',
          shot: { eye: closeEye(3.5), look: closeLook, fov: 28, sway: 0.012, tall: { eye: closeEye(3.9), fov: 36 } },
          start: () => {
            stage()
            this.perched = true
            z.glow = z.glowGoal = GLOW.close
            const eye = closeEye(3.5)()
            kaylee.lookAt(eye.x, eye.y, eye.z)
            nick.lookAt(eye.x, eye.y, eye.z)
          },
          cues: [
            [
              0.2,
              () => {
                fireflySfx.found(ME)
                const tip = this.hornTip(tmp)
                h.sparkles(tip.x, tip.y + 0.15, tip.z, 22)
                h.cheer()
              },
            ],
          ],
          say: S.found,
          sayAt: 0.4,
          dur: 2.6,
        },
        {
          id: 'dad',
          shot: { eye: this.at(u + 5.2, v + 3.7, 2.6), look: this.at(u - 0.6, v + 0.1, 1.7), fov: 34, to: { eye: this.at(u + 5.9, v + 4.1, 2.8) }, ease: 'out', tall: { eye: this.at(u + 6.4, v + 5.2, 3.0), fov: 46 } },
          start: () => {
            stage()
            // Up off the horn, round and round it.
            this.perched = false
            z.glow = z.glowGoal = GLOW.day
            const tip = this.hornTip(tmp)
            z.place(tip.x, tip.y + 0.075 * z.size, tip.z)
            turns = 0
            kaylee.lookAt(CAM.x, 2, CAM.z)
            nick.lookAt(CAM.x, 2.2, CAM.z)
            nick.react('hop')
            man.react('wave')
          },
          tick: (_k, _t, dt) => {
            turns += dt * 5.5
            const tip = this.hornTip(tmp)
            z.fly(tmp2.set(tip.x + Math.sin(turns) * 0.28, tip.y + 0.38 + Math.sin(turns * 1.7) * 0.07, tip.z + Math.cos(turns) * 0.28), dt, 8)
          },
          say: S.dad,
          sayAt: 0.35,
          dur: 2.8,
          cues: [[1.4, () => kaylee.react('wiggle')]],
        },
      ],
      // (Off to the island from here: nothing in the bay is needed again.)
      finish: () => {
        this.perched = false
        kaylee.lookAway()
        nick.lookAway()
      },
    }
  }
}

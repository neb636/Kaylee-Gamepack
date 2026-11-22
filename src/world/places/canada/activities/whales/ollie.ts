// Ollie the sea otter (planning/around-the-world/canada.md: giggly, cuddly, silly, spins like a top), floating on her
// back the way sea otters do: the team's rig friend in her Canada look (characters/looks.ts `otter`), tipped onto her
// back with her face to the sky and toward whoever is looking from her toes, a clam on her tummy, bobbing on the
// swell. The game (watch.ts) has her drift off asleep, wake, hold the boat's rope and ride along behind it; the films
// (story/films/whales.ts, story/sets/whales.ts) float the cast's Ollie in the kelp the same way (a Floater). `spin()`
// is her trick: round and round on her back, fast. Her lucky rock (characters/rock.ts) goes on her tummy with a Juggle:
// tossed up and caught, higher and higher (the films, and once the baby orca gives it back), or tucked under her arm
// (sea otters keep their favorite stone in a pocket of skin there).
import { Group, Quaternion, Vector3, type Camera } from 'three'
import { bell } from '../../../../../sdk'
import { FilmActor } from '../../../../engine3d/characters/actor'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { CANADA_LOOKS } from '../../characters/looks'
import { makeRock, twinkle } from '../../characters/rock'

/** How far back she lies (radians): not flat, so her face looks up and out past her toes. */
export const BACK = -1.12
const SPIN_S = 1.4

/** Puts a clam on a rig friend's tummy; returns it (hide it with `.visible`). */
export function addClam(actor: FilmActor, bag: Bag) {
  const H = actor.height
  const c = CANADA_LOOKS.otter.chub ?? 1
  const clam = solid(
    merge([
      P.sphere(0.075 * H, '#E9DDF2', { at: [0, 0.012 * H, 0], scale: [1, 0.42, 0.85] }, 12),
      P.sphere(0.072 * H, '#CDB8E3', { at: [0, -0.012 * H, 0], scale: [1, 0.38, 0.82] }, 12),
      P.box(0.11 * H, 0.008 * H, 0.012 * H, '#B49ACF', { at: [0, 0.03 * H, 0.02 * H] }),
    ]),
    bag,
    1.5,
  )
  clam.position.set(0, 0.36 * H, 0.185 * H * c)
  clam.rotation.x = 1.25
  actor.rig.body.add(clam)
  return clam
}

/** Floats a rig actor on her back: call `after()` each frame after the actor's own update. Her root keeps its x and z;
 *  `y` is the water's surface there, `face` which way her toes point (radians, 0: toward +z). */
export class Floater {
  y = 0
  face = 0
  /** Fast asleep (eyes shut). */
  sleepy = false
  /** Paws on the tummy (holding a clam, or the boat's rope). */
  paws = true
  private spinT = -1
  private phase = Math.random() * 6
  constructor(readonly actor: FilmActor) {
    actor.lean = BACK
    // (No blob shadow on the water.)
    actor.rig.root.children[0].visible = false
  }
  get spinning() {
    return this.spinT >= 0
  }
  /** Round and round on her back, like a top (three turns, fast in the middle). */
  spin() {
    this.spinT = 0
    this.sleepy = false
    this.actor.pull('happy')
  }
  after(dt: number, t: number) {
    const a = this.actor
    a.lean = BACK
    if (this.spinT >= 0 && (this.spinT += dt / SPIN_S) >= 1) this.spinT = -1
    const k = Math.max(0, this.spinT)
    const turn = k * k * (3 - 2 * k) * Math.PI * 6
    a.root.rotation.set(0, this.face + turn, Math.sin(t * 0.9 + this.phase) * 0.07)
    // Lying back in the water, a slow bob on the swell, lifted a little in the middle of a spin.
    a.root.position.y = this.y - 0.2 * a.height + Math.sin(t * 1.6 + this.phase) * 0.03 + bell(k) * 0.08 * a.height
    // Tuck her chin up from the water so her eyes and whiskers face past her flippers.
    a.rig.head.rotation.x += 0.27
    if (this.sleepy) a.rig.eyes.scale.y = 0.12
    if (this.paws) {
      a.rig.armR.rotation.x = -0.9
      a.rig.armL.rotation.x = -0.9
    }
  }
}

/** The game's Ollie: her own rig actor, floating where `root` is put (the world moves it on the water). */
export class Ollie {
  readonly root = new Group()
  readonly actor: FilmActor
  readonly float: Floater
  readonly clam: Group

  constructor(
    bag: Bag,
    readonly height = 1.1,
  ) {
    this.actor = new FilmActor(CANADA_LOOKS.otter, bag, { height, voice: 'otter' })
    this.root.add(this.actor.root)
    this.actor.place(0, 0, 0, 0)
    this.float = new Floater(this.actor)
    this.clam = addClam(this.actor, bag)
  }
  get sleepy() {
    return this.float.sleepy
  }
  set sleepy(v: boolean) {
    this.float.sleepy = v
  }
  get spinning() {
    return this.float.spinning
  }
  spin() {
    this.float.spin()
  }
  wave() {
    this.actor.wave()
  }
  /** Her face, in the world. */
  head(out = new Vector3()) {
    return this.actor.head(out)
  }
  update(dt: number, t: number) {
    this.actor.update(dt, t)
    this.float.after(dt, t)
  }
}

const UP = new Vector3(0, 1, 0)
const Q = new Quaternion()

/** Her lucky rock on her tummy, juggled: tossed up from her paws and caught (`height`: how high, in her heights; 0 just
 *  held), or tucked under her arm (`tuck`). Call `update()` after the Floater's `after()` (it moves her paws). */
export class Juggle {
  readonly rock: Group
  /** Juggling (false: the rock rests in her paws, or under her arm with `tuck`). */
  on = false
  height = 0.35
  tuck = false
  /** Held up beside her face in her paw, to show it off ("Look! My lucky rock!"). */
  show = false
  /** Hidden (the whale took it). */
  gone = false
  /** A toss left her paws this frame / landed back (the world plays a soft clack). */
  tossed = false
  caught = false
  private t = 0
  private last = 0
  constructor(
    readonly actor: FilmActor,
    bag: Bag,
  ) {
    this.rock = makeRock(bag, 0.1 * (actor.height / 0.8))
    actor.rig.body.add(this.rock)
  }
  /** Where a toss is up to: 0 in her paws .. 1 at the top (the world can follow the rock). */
  get air() {
    return this.on && !this.tuck ? Math.sin(Math.PI * ((this.t % this.period) / this.period)) : 0
  }
  private get period() {
    return 0.45 + this.height * 0.9
  }
  update(dt: number, t: number, cam?: Camera) {
    const a = this.actor
    const H = a.height
    const c = CANADA_LOOKS.otter.chub ?? 1
    this.tossed = this.caught = false
    this.rock.visible = !this.gone
    if (this.gone) return
    if (this.show) {
      // Up in her left paw, beside her cheek (never in front of her face).
      this.rock.position.set(0.355 * H, 0.575 * H, 0.145 * H)
      this.rock.rotation.set(0.8, -0.1, 0.16)
      a.rig.armR.rotation.set(-0.35, -0.72, 1.62 + Math.sin(t * 5) * 0.06)
    } else if (this.tuck) {
      // Tucked in the pocket of skin under her left arm, the arm down over it.
      this.rock.position.set(0.25 * H, 0.42 * H, 0.1 * H * c)
      a.rig.armR.rotation.set(-0.2, 0, 0.35)
    } else {
      this.t += this.on ? dt : 0
      const p = this.period
      const k = (this.t % p) / p
      const n = Math.floor(this.t / p)
      if (this.on && n !== this.last) {
        this.last = n
        this.caught = true
        this.tossed = true
      }
      const up = this.on ? Math.sin(Math.PI * k) * this.height * H : 0
      // Straight up into the air from her tummy (whichever way she lies), from one paw to the other in a little arc, so
      // it goes up beside her face, not in front of it.
      a.rig.body.updateWorldMatrix(true, false)
      const toUp = UP.clone().applyQuaternion(a.rig.body.getWorldQuaternion(Q).invert())
      // (The arc bows out to her left as it rises: straight up from the middle of her tummy it hid her face from the
      // camera at her toes at the top of every toss.)
      const side = (n % 2 ? 1 : -1) * Math.cos(Math.PI * k) * 0.17 * H + Math.sin(Math.PI * k) * Math.min(1, up / (0.2 * H)) * 0.34 * H
      this.rock.position.set(side, 0.3 * H, 0.26 * H * c).addScaledVector(toUp, up)
      this.rock.rotation.set(this.t * 7, this.t * 4, 0)
      // Her paws flick up as it leaves them and reach for it as it comes down.
      const flick = this.on ? Math.max(0, 1 - Math.min(k, 1 - k) * 6) : 0
      a.rig.armR.rotation.x = -0.9 - 0.5 * flick
      a.rig.armL.rotation.x = -0.9 - 0.5 * flick
    }
    twinkle(this.rock, t, cam)
  }
}

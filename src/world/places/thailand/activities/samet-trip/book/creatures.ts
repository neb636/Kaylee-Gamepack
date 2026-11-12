// The island's animals, alive (greybox 3 of samet-trip.md): where each lives and what it does when Kaylee comes by.
// Four simple ways of living, each with its own character on top:
//   wander: the monitor lizards waddle round Ao Prao flicking their tongues, the macaques mooch along the hill road
//           (the mother reaches for Daddy as he passes), hermit crabs potter on the wet sand;
//   flee:   the squirrels run up their palm when she comes close and peek round the trunk at her, the mouse-deer bounds
//           into the forest if she gallops (walk slowly!) and tiptoes back, the reef heron flies to the next rock;
//   perch:  the hornbill hops along its branch in the tamarind and flies between its perches, the flying fox hangs
//           asleep in a samet tree by day and flaps round the sky over Ao Prao at dusk;
//   swim:   the parrotfish noses round the coral, the damselfish swirl in a crowd that parts round her, the cuttlefish
//           hovers and changes color as she comes near;
//   still:  the urchins (prickly: she boings off them) and the coral.
// Every one does something cute for Mommy's phone (`pose`), and reacts to a tap without it (`poke`). The terns and the
// crab holes' ghost crabs are the island's own (island.ts, props.ts); the phone snaps them too.
import { Group, Matrix4, Quaternion, Vector3, type InstancedMesh, type MeshToonMaterial } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import type { Surface } from '../island/ground'
import { groundAt } from '../island/ground'
import { at, FRAMES, frameNear, PLACES, POKES, STOPS, type Frame, type XZ } from '../island/layout'
import type { Ground } from '../island/scenery'
import type { AnimalId } from './animals'
import { wildSfx } from './sounds'
import { coralModel, cuttlefishModel, damselSchool, flyingFoxModel, heronModel, hermitModel, hornbillModel, macaqueModel, monitorModel, mouseDeerModel, parrotfishModel, squirrelModel, urchinModel, type Model } from './models'

const HALF = Math.PI / 2
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
const bell = (k: number) => Math.sin(Math.PI * Math.min(1, Math.max(0, k)))
const rand = (a: number, b: number) => a + Math.random() * (b - a)
const tmp = new Vector3()

// ---- Sounds (sounds.ts: recorded, with the synth ones as fallbacks).
const SOUND = wildSfx
export type WildSound = keyof typeof SOUND

/** What the animals know about the world each frame. */
export interface WildCtx {
  t: number
  ground: Ground
  /** The sea's surface height here (with the waves). */
  water(x: number, z: number): number
  /** Is something (a palm, a chair, a rock) standing here? */
  blocked(x: number, z: number, r: number): boolean
  /** Kaylee, how fast she's going, and whether she's in the sea. */
  her: Vector3
  herSpeed: number
  swimming: boolean
  daddy: Vector3
  /** The golden hour or night (the flying fox flies). */
  dusk: boolean
  /** The camera (they turn to it to pose). */
  eye: Vector3
  fx: WildFx
}
export interface WildFx {
  sparkle(x: number, y: number, z: number): void
  splash(x: number, y: number, z: number, n: number): void
  bubbles(x: number, y: number, z: number, n: number): void
  puff(x: number, y: number, z: number, n: number): void
  /** Daddy reacts (a macaque reaches for him). */
  daddy(kind: 'wiggle' | 'hop'): void
}

/** One animal on the island. */
export abstract class Creature {
  readonly root = new Group()
  /** What the photo frames, and about how big the animal is (m). */
  readonly focus = new Vector3()
  size = 0.5
  rare = false
  /** Out of sight for now (hiding in the forest, not spawned yet): no tap target, no photo. */
  hidden = false
  protected poseT = -1
  protected poseLen = 1.2
  constructor(
    readonly id: string,
    readonly kind: AnimalId,
  ) {}
  /** For the camera: turn to it and do something cute. The photo is taken `snapAt` seconds in. */
  pose() {
    this.poseT = 0
  }
  get snapAt() {
    return this.poseLen * 0.45
  }
  get posing() {
    return this.poseT >= 0
  }
  /** The pose's swell (0 at rest, 1 at its peak). */
  protected get pk() {
    return this.poseT < 0 ? 0 : bell(this.poseT)
  }
  update(dt: number, c: WildCtx) {
    if (this.poseT >= 0) {
      this.poseT += dt / this.poseLen
      if (this.poseT >= 1) this.poseT = -1
    }
    this.step(dt, c)
  }
  protected abstract step(dt: number, c: WildCtx): void
  /** A tap without the phone. */
  abstract poke(c: WildCtx): void
  /** Turn `yaw` toward the camera (for posing), easing. */
  protected toCam(yaw: number, x: number, z: number, c: WildCtx, dt: number, side = 0) {
    return yaw + wrap(Math.atan2(c.eye.x - x, c.eye.z - z) + side - yaw) * ease(dt, 6)
  }
}

// ---------------------------------------------------------------- wander and flee: animals on the ground

interface WalkOpts {
  walk: number
  run: number
  ok: Surface[]
  /** Where it may run to hide (the forest). */
  hideIn?: Surface[]
  radius: number
  fleeDist: number
}

abstract class Walker extends Creature {
  x: number
  z: number
  y = 0
  yaw = Math.random() * Math.PI * 2
  speed = 0
  protected goal: XZ | null = null
  protected wait = rand(0.5, 3)
  protected phase = Math.random() * 6
  protected state: 'roam' | 'flee' | 'hide' = 'roam'
  protected hideT = 0
  constructor(
    id: string,
    kind: AnimalId,
    public home: XZ,
    protected o: WalkOpts,
  ) {
    super(id, kind)
    this.x = home.x
    this.z = home.z
  }
  protected stand(c: WildCtx, x: number, z: number, fleeing = false) {
    const s = c.ground.surfaceAt(x, z)
    return (this.o.ok.includes(s) || (fleeing && !!this.o.hideIn?.includes(s))) && !c.blocked(x, z, 0.22)
  }
  protected roamGoal(c: WildCtx): XZ | null {
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random()) * this.o.radius
      const p = { x: this.home.x + Math.sin(a) * r, z: this.home.z + Math.cos(a) * r }
      if (this.stand(c, p.x, p.z)) return p
    }
    return null
  }
  protected fleeGoal(c: WildCtx): XZ | null {
    const a0 = Math.atan2(this.x - c.her.x, this.z - c.her.z)
    for (const da of [0, 0.5, -0.5, 1, -1, 1.5, -1.5]) {
      const p = { x: this.x + Math.sin(a0 + da) * this.o.fleeDist, z: this.z + Math.cos(a0 + da) * this.o.fleeDist }
      if (this.stand(c, p.x, p.z, true)) return p
    }
    return null
  }
  /** Is she scaring it? */
  protected scared(_c: WildCtx, _d: number) {
    return false
  }
  protected onScare(_c: WildCtx) {}
  protected abstract animate(dt: number, c: WildCtx, moving: number): void
  protected step(dt: number, c: WildCtx) {
    const d = Math.hypot(c.her.x - this.x, c.her.z - this.z)
    if (this.state === 'roam' && !this.posing && this.scared(c, d)) {
      const g = this.fleeGoal(c)
      if (g) {
        this.state = 'flee'
        this.goal = g
        this.onScare(c)
      }
    }
    let want = 0
    if (this.posing) {
      this.yaw = this.toCam(this.yaw, this.x, this.z, c, dt)
    } else if (this.goal) {
      const dx = this.goal.x - this.x
      const dz = this.goal.z - this.z
      const l = Math.hypot(dx, dz)
      const sp = this.state === 'flee' ? this.o.run : this.o.walk
      if (l < 0.15) {
        this.goal = null
        if (this.state === 'flee') {
          this.state = this.o.hideIn ? 'hide' : 'roam'
          this.hideT = rand(4, 7)
          this.wait = rand(1, 2)
        }
      } else {
        want = sp
        const ty = Math.atan2(dx, dz)
        this.yaw += wrap(ty - this.yaw) * ease(dt, this.state === 'flee' ? 12 : 5)
        const step = Math.min(l, this.speed * dt)
        const nx = this.x + Math.sin(this.yaw) * step
        const nz = this.z + Math.cos(this.yaw) * step
        // (Still in the trees on its way back out: the forest is fine until it's out of it.)
        const out = this.state !== 'roam' || !!this.o.hideIn?.includes(c.ground.surfaceAt(this.x, this.z))
        if (this.stand(c, nx, nz, out)) {
          this.x = nx
          this.z = nz
        } else if (Math.abs(wrap(ty - this.yaw)) < 0.3) this.goal = null
      }
    } else {
      this.wait -= dt
      if (this.state === 'hide') {
        this.hideT -= dt
        // Back out once she's calm (walking slowly, or not near).
        if (this.hideT <= 0 && (c.herSpeed < 2 || d > 9)) {
          this.state = 'roam'
          this.goal = { x: this.home.x, z: this.home.z }
        }
      } else if (this.wait <= 0) {
        this.goal = this.roamGoal(c)
        this.wait = rand(2, 5)
      }
    }
    this.speed += (want - this.speed) * ease(dt, 6)
    this.phase += dt * (2 + this.speed * 9)
    this.y = Math.max(0, c.ground.heightAt(this.x, this.z))
    this.root.position.set(this.x, this.y, this.z)
    this.root.rotation.y = this.yaw
    this.animate(dt, c, Math.min(1, this.speed / Math.max(0.1, this.o.walk)))
    this.focus.set(this.x, this.y + this.size * 0.45, this.z)
  }
}

/** The monitor lizard: waddles with its whole body in an S, flicks its tongue to smell. */
class Monitor extends Walker {
  private m: Model
  private flick = -1
  private flickWait = rand(1, 3)
  constructor(bag: Bag, id: string, home: XZ) {
    super(id, 'monitor', home, { walk: 0.55, run: 1.9, ok: ['sand', 'grass', 'road', 'path', 'rock', 'wet'], radius: 5, fleeDist: 4 })
    this.m = monitorModel(bag)
    this.m.root.scale.setScalar(0.85)
    this.root.add(this.m.root)
    this.size = 0.8
    this.poseLen = 1.4
  }
  protected scared(c: WildCtx, d: number) {
    return d < 2.4 && c.herSpeed > 2.8
  }
  protected onScare() {
    SOUND.hiss()
  }
  poke() {
    this.flick = 0
    SOUND.hiss()
  }
  protected animate(dt: number, _c: WildCtx, moving: number) {
    const { body, head, tongue, tail, tip } = this.m.parts
    const s = Math.sin(this.phase)
    body.rotation.y = s * 0.16 * moving
    head.rotation.y = -s * 0.2 * moving + Math.sin(this.phase * 0.21) * 0.25 * (1 - moving)
    head.rotation.x = -0.3 * this.pk
    tail.rotation.y = -Math.sin(this.phase - 0.8) * (0.3 * moving + 0.08)
    tip.rotation.y = -Math.sin(this.phase - 1.6) * (0.45 * moving + 0.12)
    body.position.y = Math.abs(s) * 0.02 * moving
    // The tongue: flick, flick (more of them for the camera).
    this.flickWait -= dt
    if (this.flickWait <= 0 && this.flick < 0) {
      this.flick = 0
      this.flickWait = rand(1.5, 3.5)
    }
    if (this.posing && this.flick < 0) this.flick = 0
    if (this.flick >= 0) {
      this.flick += dt / 0.7
      tongue.scale.z = Math.max(0.001, bell((this.flick * 2) % 1)) * 1.2
      if (this.flick >= 1) {
        this.flick = -1
        tongue.scale.z = 0.001
      }
    }
  }
}

/** The mouse-deer: shy. It nibbles at the forest's edge and bounds into the trees if she gallops; walk slowly. */
class MouseDeer extends Walker {
  private m: Model
  private nibble = 0
  constructor(bag: Bag, id: string, home: XZ) {
    super(id, 'mousedeer', home, { walk: 0.45, run: 4.6, ok: ['grass', 'road', 'path', 'sand'], hideIn: ['forest'], radius: 3.5, fleeDist: 7 })
    this.m = mouseDeerModel(bag)
    this.m.root.scale.setScalar(1.2)
    this.root.add(this.m.root)
    this.size = 0.7
    this.rare = true
  }
  protected scared(c: WildCtx, d: number) {
    return (d < 9 && c.herSpeed > 2.7) || d < 1.6
  }
  protected onScare(c: WildCtx) {
    SOUND.squeak()
    c.fx.puff(this.x, this.y + 0.1, this.z, 6)
  }
  poke(c: WildCtx) {
    const d = Math.hypot(c.her.x - this.x, c.her.z - this.z)
    // A tap from close up startles it; from further, its ears flick.
    if (d < 4) {
      const g = this.fleeGoal(c)
      if (g) {
        this.state = 'flee'
        this.goal = g
        this.onScare(c)
      }
    } else SOUND.squeak()
  }
  protected step(dt: number, c: WildCtx) {
    super.step(dt, c)
    // Deep in the trees: out of sight.
    this.hidden = this.state === 'hide' && c.ground.surfaceAt(this.x, this.z) === 'forest'
  }
  protected animate(dt: number, _c: WildCtx, moving: number) {
    const { body, head } = this.m.parts
    const run = this.state === 'flee' ? 1 : 0
    // Bounding: a hop each stride; walking: a dainty bob; standing: nibbling, then looking round.
    body.position.y = run * Math.abs(Math.sin(this.phase * 0.55)) * 0.22 + moving * (1 - run) * Math.abs(Math.sin(this.phase)) * 0.02
    body.rotation.x = run * Math.sin(this.phase * 0.55) * 0.25
    this.nibble += dt
    const n = moving < 0.1 && !this.posing ? Math.max(0, Math.sin(this.nibble * 0.9)) : 0
    head.rotation.x += (n * 0.9 - this.pk * 0.25 - head.rotation.x) * ease(dt, 5)
    head.rotation.z = this.pk * 0.3
    head.rotation.y = Math.sin(this.nibble * 0.5) * 0.4 * (1 - moving)
  }
}

/** A long-tailed macaque: mooches along the hill road, sits and scratches, and the mother reaches for Daddy. */
class Macaque extends Walker {
  private m: Model
  private scratch = -1
  private reach = 0
  private reachCool = 0
  constructor(
    bag: Bag,
    id: string,
    home: XZ,
    private isBaby = false,
  ) {
    super(id, 'macaque', home, { walk: 0.8, run: 2, ok: ['road', 'grass', 'path', 'rock', 'sand'], radius: isBaby ? 1.2 : 4, fleeDist: 3 })
    this.m = macaqueModel(bag)
    this.root.add(this.m.root)
    if (isBaby) this.m.root.scale.setScalar(0.62)
    this.size = isBaby ? 0.55 : 0.8
  }
  poke(c: WildCtx) {
    this.scratch = 0
    SOUND.monkey()
    c.fx.puff(this.x, this.y + 0.05, this.z, 4)
  }
  protected step(dt: number, c: WildCtx) {
    // The little one stays close to its mother.
    if (this.isBaby && this.mother) {
      this.home = { x: this.mother.x + Math.sin(this.mother.yaw + 2) * 0.8, z: this.mother.z + Math.cos(this.mother.yaw + 2) * 0.8 }
    }
    super.step(dt, c)
  }
  mother: Macaque | null = null
  protected animate(dt: number, c: WildCtx, moving: number) {
    const { body, head, arm, tail } = this.m.parts
    // On all fours when it moves, sitting up when it stops.
    body.rotation.x += (moving * 0.75 - body.rotation.x) * ease(dt, 6)
    body.position.y = Math.abs(Math.sin(this.phase)) * 0.04 * moving
    tail.rotation.y = Math.sin(this.phase * 0.4) * 0.3
    // Daddy walks past: the mother reaches for his sunglasses (he wiggles).
    this.reachCool -= dt
    const dd = Math.hypot(c.daddy.x - this.x, c.daddy.z - this.z)
    if (!this.isBaby && dd < 3.2 && this.reachCool <= 0 && moving < 0.3) {
      this.reach = 1.6
      this.reachCool = 9
      SOUND.monkey()
      setTimeout(() => c.fx.daddy('wiggle'), 450)
    }
    if (this.reach > 0) {
      this.reach -= dt
      this.yaw += wrap(Math.atan2(c.daddy.x - this.x, c.daddy.z - this.z) - this.yaw) * ease(dt, 6)
    }
    let armX = -0.5
    let armZ = 0
    if (this.reach > 0) armX = -2.2
    if (this.scratch >= 0) {
      this.scratch += dt / 1.6
      armX = -2.6
      armZ = -0.6 + Math.sin(this.scratch * 40) * 0.15
      head.rotation.z = Math.sin(this.scratch * 8) * 0.15
      if (this.scratch >= 1) this.scratch = -1
    }
    // For the camera: a wave and a big grin.
    if (this.posing) {
      armX = -2.4
      armZ = Math.sin(this.poseT * 30) * 0.3
    }
    arm.rotation.x += (armX - arm.rotation.x) * ease(dt, 10)
    arm.rotation.z += (armZ - arm.rotation.z) * ease(dt, 10)
    head.rotation.y = Math.sin(this.phase * 0.13) * 0.4 * (1 - moving)
    head.rotation.x = -0.2 * this.pk
  }
}

/** A hermit crab: potters about on the wet sand and pops into its shell when she comes close. */
class Hermit extends Walker {
  private m: Model
  private inShell = 0
  private shy = 0
  constructor(bag: Bag, id: string, home: XZ, out: boolean) {
    super(id, 'crab', home, { walk: 0.28, run: 0.6, ok: ['sand', 'wet'], radius: 2.5, fleeDist: 1 })
    this.m = hermitModel(bag)
    this.m.root.scale.setScalar(1.25)
    this.root.add(this.m.root)
    this.size = 0.4
    this.hidden = !out
    this.root.visible = out
  }
  /** Climbs out of a bottle (or from under a flip-flop) she picked up, at (x, z). */
  spawn(x: number, z: number) {
    this.home = { x, z }
    this.x = x
    this.z = z
    this.hidden = false
    this.root.visible = true
    this.root.position.set(x, this.y, z)
    this.goal = null
    this.wait = 0.2
    this.inShell = 1
    this.shy = 0.6
  }
  poke() {
    this.shy = 2.5
    SOUND.click()
  }
  protected animate(dt: number, c: WildCtx, moving: number) {
    const d = Math.hypot(c.her.x - this.x, c.her.z - this.z)
    if (d < 1.4 && c.herSpeed > 1) this.shy = 2.5
    this.shy -= dt
    const want = this.shy > 0 && !this.posing ? 1 : 0
    this.inShell += (want - this.inShell) * ease(dt, want ? 14 : 3)
    const { legs, shell } = this.m.parts
    legs.scale.setScalar(Math.max(0.05, 1 - this.inShell * 0.95))
    legs.position.y = -this.inShell * 0.05
    shell.position.y = Math.abs(Math.sin(this.phase * 2)) * 0.02 * moving
    legs.rotation.z = Math.sin(this.phase * 2) * 0.12 * moving + (this.posing ? Math.sin(this.poseT * 25) * 0.25 : 0)
    if (this.inShell > 0.5) this.speed = 0
  }
}

// ---------------------------------------------------------------- the squirrels: down the palm, and up it again

class Squirrel extends Creature {
  private m: Model
  private base: Vector3
  private top: Vector3
  private x: number
  private z: number
  private yaw = 0
  private f = 0
  private goal: XZ | null = null
  private wait = 1
  private phase = 0
  private up = false
  private calm = 0
  private flick = 0
  constructor(bag: Bag, id: string, palm: { at: XZ; y: number; top: Vector3 }) {
    super(id, 'squirrel')
    this.m = squirrelModel(bag)
    this.m.root.scale.setScalar(1.15)
    this.root.add(this.m.root)
    this.base = new Vector3(palm.at.x, palm.y, palm.at.z)
    this.top = palm.top.clone()
    this.x = palm.at.x + 1
    this.z = palm.at.z
    this.size = 0.55
  }
  poke() {
    this.flick = 1
    SOUND.chatter()
    this.up = true
    this.calm = 0
  }
  protected step(dt: number, c: WildCtx) {
    const p = this.root.position
    const d = Math.hypot(c.her.x - p.x, c.her.z - p.z)
    if (!this.up && (d < 3.5 || (d < 7 && c.herSpeed > 2.7))) {
      this.up = true
      SOUND.chatter()
      this.flick = 1
    }
    if (this.up) {
      this.calm = d > 7 ? this.calm + dt : 0
      if (this.calm > 5) this.up = false
    }
    const { body, tail } = this.m.parts
    // At the trunk's foot (or on it): climb up or down; otherwise scamper there.
    const atFoot = Math.hypot(this.x - this.base.x, this.z - this.base.z) < 0.35
    if (this.up && !atFoot && this.f === 0) this.goal = { x: this.base.x, z: this.base.z }
    let moving = 0
    if (this.up && (atFoot || this.f > 0)) this.f = Math.min(0.58, this.f + dt * 0.55)
    else if (!this.up && this.f > 0) this.f = Math.max(0, this.f - dt * 0.4)
    if (this.f === 0) {
      if (!this.goal) {
        this.wait -= dt
        if (this.wait <= 0 && !this.up) {
          const a = Math.random() * Math.PI * 2
          const r = 0.8 + Math.random() * 2
          const g = { x: this.base.x + Math.sin(a) * r, z: this.base.z + Math.cos(a) * r }
          const s = c.ground.surfaceAt(g.x, g.z)
          if (s === 'sand' || s === 'grass' || s === 'wet' || s === 'path') this.goal = g
          this.wait = rand(1.5, 4)
        }
      }
      if (this.goal && !this.posing) {
        const dx = this.goal.x - this.x
        const dz = this.goal.z - this.z
        const l = Math.hypot(dx, dz)
        if (l < 0.1) {
          this.goal = null
          if (!this.up) this.wait = rand(1.5, 4)
        } else {
          moving = 1
          this.yaw += wrap(Math.atan2(dx, dz) - this.yaw) * ease(dt, 10)
          const sp = this.up ? 3.2 : 1.6
          const st = Math.min(l, sp * dt)
          this.x += (dx / l) * st
          this.z += (dz / l) * st
        }
      }
      if (this.posing) this.yaw = this.toCam(this.yaw, this.x, this.z, c, dt)
      this.phase += dt * (3 + moving * 14)
      const y = Math.max(0, c.ground.heightAt(this.x, this.z))
      p.set(this.x, y + Math.abs(Math.sin(this.phase)) * 0.12 * moving, this.z)
      this.root.quaternion.setFromAxisAngle(tmp.set(0, 1, 0), this.yaw)
      // Sitting up for the camera (or to look round), nose down when it forages.
      const sit = this.posing ? 1 : moving ? 0 : Math.max(0, Math.sin(this.phase * 0.25)) * 0.6
      body.rotation.x += (-sit * 0.9 + (moving ? 0.15 : 0) - body.rotation.x) * ease(dt, 8)
    } else {
      // On the trunk: belly to the bark, head up, peeking round at her from her side of the trunk.
      const dir = tmp.copy(this.top).sub(this.base).normalize()
      const at = this.base.clone().addScaledVector(dir, this.f * this.base.distanceTo(this.top))
      const out = new Vector3(c.her.x - at.x, 0, c.her.z - at.z)
      out.addScaledVector(dir, -out.dot(dir))
      if (out.lengthSq() < 1e-4) out.set(1, 0, 0)
      out.normalize()
      p.copy(at).addScaledVector(out, 0.24)
      const right = new Vector3().crossVectors(out, dir).normalize()
      const m = new Matrix4().makeBasis(right, out, dir)
      this.root.quaternion.setFromRotationMatrix(m)
      body.rotation.x += (0 - body.rotation.x) * ease(dt, 8)
      this.x = this.base.x
      this.z = this.base.z
      this.phase += dt * 4
    }
    // The tail: flicks when it chatters, flows while it runs.
    this.flick = Math.max(0, this.flick - dt * 1.5)
    tail.rotation.x = Math.sin(this.phase * 0.9) * 0.15 + Math.sin(c.t * 22) * this.flick * 0.5 + (this.posing ? Math.sin(this.poseT * 30) * 0.35 : 0)
    this.focus.copy(p).y += 0.3
  }
}

// ---------------------------------------------------------------- perch: the hornbill, the flying fox, the heron

/** A flight from one place to another in an arc. */
interface Flight {
  from: Vector3
  to: Vector3
  t: number
  dur: number
  lift: number
}
const flyPos = (f: Flight, out: Vector3) => {
  const k = Math.min(1, f.t)
  const e = k * k * (3 - 2 * k)
  return out.lerpVectors(f.from, f.to, e).setY(f.from.y + (f.to.y - f.from.y) * e + bell(k) * f.lift)
}

class Hornbill extends Creature {
  private m: Model
  private at = 0
  private fly: Flight | null = null
  private nextT = rand(12, 18)
  private hop = 0
  private yaw = 0
  constructor(
    bag: Bag,
    id: string,
    private perches: { p: Vector3; yaw: number }[],
  ) {
    super(id, 'hornbill')
    this.m = hornbillModel(bag)
    this.m.root.scale.setScalar(1.25)
    this.root.add(this.m.root)
    this.root.position.copy(perches[0].p)
    this.yaw = perches[0].yaw
    this.size = 0.8
    this.rare = true
    this.fold()
  }
  private fold() {
    const { wl, wr } = this.m.parts
    wl.rotation.set(0, 1.35, -0.1)
    wr.rotation.set(0, -1.35, 0.1)
  }
  private takeOff() {
    if (this.fly) return
    const next = (this.at + 1 + Math.floor(Math.random() * (this.perches.length - 1))) % this.perches.length
    const to = this.perches[next].p
    const d = this.root.position.distanceTo(to)
    this.fly = { from: this.root.position.clone(), to: to.clone(), t: 0, dur: 0.6 + d / 5, lift: 1.2 + d * 0.15 }
    this.at = next
    SOUND.kok()
    SOUND.flap()
  }
  poke() {
    this.takeOff()
  }
  protected step(dt: number, c: WildCtx) {
    const { body, wl, wr } = this.m.parts
    const p = this.root.position
    const d = Math.hypot(c.her.x - p.x, c.her.z - p.z)
    if (!this.fly && !this.posing) {
      this.nextT -= dt
      if (this.nextT <= 0 || (d < 2.5 && c.herSpeed > 2)) {
        this.nextT = rand(14, 24)
        this.takeOff()
      }
    }
    if (this.fly) {
      const f = this.fly
      f.t += dt / f.dur
      const before = p.clone()
      flyPos(f, p)
      if (p.distanceTo(before) > 1e-4) this.yaw = Math.atan2(p.x - before.x, p.z - before.z)
      const flap = Math.sin(c.t * 14) * 0.9
      wl.rotation.set(0, 0, 0.2 + flap)
      wr.rotation.set(0, 0, -0.2 - flap)
      body.rotation.x = -0.1
      if (f.t >= 1) {
        this.fly = null
        this.fold()
        this.yaw = this.perches[this.at].yaw
        this.hop = 1
      }
    } else {
      // Perched: little hops and head turns; for the camera, wings half open and a bow.
      this.hop = Math.max(0, this.hop - dt * 2)
      const perch = this.perches[this.at]
      p.copy(perch.p).y += bell(this.hop) * 0.15
      if (this.posing) this.yaw = this.toCam(this.yaw, p.x, p.z, c, dt)
      else this.yaw += wrap(perch.yaw + Math.sin(c.t * 0.5) * 0.6 - this.yaw) * ease(dt, 2)
      const open = this.pk
      wl.rotation.set(0, 1.35 - open * 1.2, -0.1 + open * 0.6)
      wr.rotation.set(0, -1.35 + open * 1.2, 0.1 - open * 0.6)
      body.rotation.x = Math.sin(c.t * 1.3) * 0.04 + this.pk * 0.35 * Math.sin(this.poseT * 12)
    }
    this.root.rotation.y = this.yaw
    this.focus.copy(p).y += 0.35
  }
}

class FlyingFox extends Creature {
  private m: Model
  private ang = Math.random() * Math.PI * 2
  private stretch = -1
  private stretchWait = rand(6, 12)
  private flying = false
  constructor(
    bag: Bag,
    id: string,
    private roost: Vector3,
    private sky: { x: number; z: number; r: number; h: number },
  ) {
    super(id, 'flyingfox')
    this.m = flyingFoxModel(bag)
    this.m.root.scale.setScalar(1.2)
    this.root.add(this.m.root)
    this.size = 0.8
    this.rare = true
    for (const w of [this.m.parts.wl, this.m.parts.wr]) w.rotation.order = 'YXZ'
  }
  poke() {
    this.stretch = 0
    SOUND.batSqueak()
  }
  protected step(dt: number, c: WildCtx) {
    const { body, wl, wr } = this.m.parts
    const p = this.root.position
    this.flying = c.dusk
    if (this.flying) {
      // Slow flaps in big circles over the beach.
      this.ang += (dt * 4.5) / this.sky.r
      p.set(this.sky.x + Math.sin(this.ang) * this.sky.r, this.sky.h + Math.sin(c.t * 0.7) * 0.8, this.sky.z + Math.cos(this.ang) * this.sky.r)
      this.root.rotation.set(HALF, 0, 0)
      this.root.rotation.order = 'YXZ'
      this.root.rotation.y = this.ang + HALF
      this.root.rotation.z = -0.25
      const flap = Math.sin(c.t * 5) * 0.65
      wl.rotation.set(-HALF, flap, 0)
      wr.rotation.set(-HALF, -flap, 0)
      body.rotation.set(0, 0, 0)
    } else {
      // Asleep upside down, wrapped in its wings, swaying; now and then a big stretch (and one for the camera).
      p.copy(this.roost)
      this.root.rotation.order = 'YXZ'
      this.root.rotation.set(0, this.toCam(this.root.rotation.y, p.x, p.z, c, dt * (this.posing ? 1 : 0.1)), Math.PI)
      body.rotation.x = Math.sin(c.t * 1.1) * 0.06
      this.stretchWait -= dt
      if (this.stretchWait <= 0 && this.stretch < 0) {
        this.stretch = 0
        this.stretchWait = rand(8, 14)
      }
      let open = this.pk
      if (this.stretch >= 0) {
        this.stretch += dt / 1.8
        open = Math.max(open, bell(this.stretch))
        if (this.stretch >= 1) this.stretch = -1
      }
      wl.rotation.set(-HALF, -1.9 + open * 1.6, 0)
      wr.rotation.set(-HALF, 1.9 - open * 1.6, 0)
      wl.scale.setScalar(0.7 + open * 0.3)
      wr.scale.setScalar(0.7 + open * 0.3)
    }
    this.focus.copy(p).y += this.flying ? 0 : -0.45
  }
}

class Heron extends Creature {
  private m: Model
  private at = 0
  private fly: Flight | null = null
  private stab = -1
  private stabWait = rand(2, 5)
  private yaw: number
  constructor(
    bag: Bag,
    id: string,
    private spots: { p: Vector3; yaw: number }[],
  ) {
    super(id, 'heron')
    this.m = heronModel(bag)
    this.m.root.scale.setScalar(1.15)
    this.root.add(this.m.root)
    this.root.position.copy(spots[0].p)
    this.yaw = spots[0].yaw
    this.size = 1.1
    this.fold()
  }
  private fold() {
    const { wl, wr } = this.m.parts
    wl.rotation.set(0, 1.35, -0.15)
    wr.rotation.set(0, -1.35, 0.15)
  }
  private takeOff() {
    if (this.fly) return
    const next = (this.at + 1) % this.spots.length
    const to = this.spots[next].p
    this.fly = { from: this.root.position.clone(), to: to.clone(), t: 0, dur: 0.8 + this.root.position.distanceTo(to) / 4.5, lift: 2.2 }
    this.at = next
    SOUND.croak()
    SOUND.flap()
  }
  poke() {
    this.takeOff()
  }
  protected step(dt: number, c: WildCtx) {
    const { body, neck, wl, wr } = this.m.parts
    const p = this.root.position
    const d = Math.hypot(c.her.x - p.x, c.her.z - p.z)
    if (!this.fly && !this.posing && ((d < 5.5 && c.herSpeed > 2.7) || d < 2.4)) this.takeOff()
    if (this.fly) {
      const f = this.fly
      f.t += dt / f.dur
      const before = p.clone()
      flyPos(f, p)
      if (p.distanceTo(before) > 1e-4) this.yaw = Math.atan2(p.x - before.x, p.z - before.z)
      const flap = Math.sin(c.t * 9) * 0.8
      wl.rotation.set(0, 0, 0.15 + flap)
      wr.rotation.set(0, 0, -0.15 - flap)
      neck.rotation.x = 0.9
      body.rotation.x = 0.25
      if (f.t >= 1) {
        this.fly = null
        this.fold()
        this.yaw = this.spots[this.at].yaw
        c.fx.splash(p.x, p.y, p.z, 6)
      }
    } else {
      p.copy(this.spots[this.at].p)
      body.rotation.x += (0 - body.rotation.x) * ease(dt, 6)
      // Fishing: very still, then a stab at the water (sometimes a fish).
      this.stabWait -= dt
      if (this.stabWait <= 0 && this.stab < 0 && !this.posing) {
        this.stab = 0
        this.stabWait = rand(3, 6)
      }
      let nx = -0.1 + Math.sin(c.t * 0.4) * 0.05
      if (this.stab >= 0) {
        this.stab += dt / 0.8
        nx = 0.2 + bell(this.stab) * 1.3
        if (this.stab > 0.5 && this.stab - dt / 0.8 <= 0.5) {
          const tip = tmp.set(0, 0, 0.6).applyAxisAngle(new Vector3(0, 1, 0), this.yaw).add(p)
          c.fx.splash(tip.x, c.water(tip.x, tip.z), tip.z, 5)
        }
        if (this.stab >= 1) this.stab = -1
      }
      // For the camera: stretches up tall, chin up.
      if (this.posing) {
        nx = -0.45 * this.pk
        this.yaw = this.toCam(this.yaw, p.x, p.z, c, dt, 0.9)
      }
      neck.rotation.x += (nx - neck.rotation.x) * ease(dt, this.stab >= 0 ? 20 : 6)
      neck.scale.y = 1 + this.pk * 0.25
    }
    this.root.rotation.y = this.yaw
    this.focus.copy(p).y += 0.6
  }
}

// ---------------------------------------------------------------- swim: the fish and the cuttlefish

/** Under the water at (x, z): near the sea floor, never above the surface. */
const underY = (c: WildCtx, x: number, z: number, above = 0.3) => Math.min(c.ground.heightAt(x, z) + above, c.water(x, z) - 0.28)

class Parrotfish extends Creature {
  private m: Model
  private ang = Math.random() * 6
  private dart = new Vector3()
  private nibble = 0
  private yaw = 0
  constructor(
    bag: Bag,
    id: string,
    private home: XZ,
    private r: number,
  ) {
    super(id, 'parrotfish')
    this.m = parrotfishModel(bag)
    this.m.root.scale.setScalar(1.35)
    this.root.add(this.m.root)
    this.size = 0.6
  }
  poke(c: WildCtx) {
    this.dart.set(rand(-1, 1), 0, rand(-1, 1)).setLength(2)
    SOUND.bloop()
    c.fx.bubbles(this.root.position.x, this.root.position.y, this.root.position.z, 6)
  }
  protected step(dt: number, c: WildCtx) {
    const p = this.root.position
    const slow = this.posing ? 0.15 : 1
    this.nibble += dt
    const pause = Math.max(0, Math.sin(this.nibble * 0.35)) > 0.92 ? 0.1 : 1
    this.ang += ((dt * 0.55) / Math.max(1, this.r)) * 2.5 * slow * pause
    // Swim away from her if she paddles right up to it.
    const d = Math.hypot(c.her.x - p.x, c.her.z - p.z)
    if (d < 2.2) this.dart.add(tmp.set(p.x - c.her.x, 0, p.z - c.her.z).setLength(dt * 4))
    this.dart.multiplyScalar(Math.exp(-dt * 0.6))
    const x = this.home.x + Math.sin(this.ang) * this.r + this.dart.x
    const z = this.home.z + Math.cos(this.ang) * this.r * 0.7 + this.dart.z
    const before = p.clone()
    p.set(x, underY(c, x, z, 0.35) + (this.posing ? this.pk * 0.15 : 0), z)
    if (p.distanceTo(before) > 1e-4) this.yaw = Math.atan2(p.x - before.x, p.z - before.z)
    if (this.posing) this.yaw = this.toCam(this.yaw, p.x, p.z, c, dt, HALF)
    this.root.rotation.y = this.yaw
    this.m.parts.tail.rotation.y = Math.sin(c.t * (pause < 1 ? 4 : 9)) * 0.45
    this.m.parts.body.rotation.z = Math.sin(c.t * 1.7) * 0.08
    this.m.parts.body.rotation.x = pause < 1 ? 0.35 : 0
    if (pause < 1 && Math.random() < dt * 3) c.fx.bubbles(p.x, p.y + 0.1, p.z, 1)
    this.focus.copy(p)
  }
}

class Damsels extends Creature {
  readonly mesh: InstancedMesh
  private fish: { r: number; a: number; h: number; sp: number; off: Vector3 }[] = []
  private m = new Matrix4()
  private q = new Quaternion()
  private center = new Vector3()
  constructor(
    bag: Bag,
    id: string,
    private home: XZ,
    n = 20,
  ) {
    super(id, 'damselfish')
    this.mesh = damselSchool(bag, n)
    this.root.position.set(home.x, 0, home.z)
    this.root.add(this.mesh)
    for (let i = 0; i < n; i++) this.fish.push({ r: rand(0.5, 1.6), a: Math.random() * Math.PI * 2, h: rand(-0.15, 0.25), sp: rand(0.8, 1.3), off: new Vector3() })
    this.size = 2
  }
  poke(c: WildCtx) {
    // They burst apart and swirl back.
    for (const f of this.fish) f.off.add(tmp.set(rand(-1, 1), 0, rand(-1, 1)).setLength(1.6))
    SOUND.bloop()
    c.fx.bubbles(this.center.x, this.center.y, this.center.z, 8)
  }
  protected step(dt: number, c: WildCtx) {
    const cy = underY(c, this.home.x, this.home.z, 0.45)
    this.center.set(this.home.x + Math.sin(c.t * 0.2) * 0.8, cy, this.home.z + Math.cos(c.t * 0.27) * 0.8)
    const tight = 1 - this.pk * 0.5
    const spin = 1 + this.pk * 1.5
    this.fish.forEach((f, i) => {
      f.a += dt * f.sp * spin * (1.2 / f.r)
      const bx = this.center.x + Math.sin(f.a) * f.r * tight
      const bz = this.center.z + Math.cos(f.a) * f.r * tight
      // They part round her and close up again behind her.
      const dx = bx + f.off.x - c.her.x
      const dz = bz + f.off.z - c.her.z
      const d = Math.hypot(dx, dz)
      if (d < 2.2 && c.swimming) f.off.add(tmp.set(dx, 0, dz).setLength((2.2 - d) * dt * 5))
      f.off.multiplyScalar(Math.exp(-dt * 0.9))
      const x = bx + f.off.x
      const z = bz + f.off.z
      const y = Math.min(this.center.y + f.h + Math.sin(c.t * 2 + i) * 0.05, c.water(x, z) - 0.2)
      this.q.setFromAxisAngle(tmp.set(0, 1, 0), f.a + HALF + Math.sin(c.t * 12 + i) * 0.15)
      this.m.compose(new Vector3(x - this.root.position.x, y - this.root.position.y, z - this.root.position.z), this.q, tmp.set(1.5, 1.5, 1.5))
      this.mesh.setMatrixAt(i, this.m)
    })
    this.mesh.instanceMatrix.needsUpdate = true
    this.focus.copy(this.center)
  }
}

class Cuttlefish extends Creature {
  private m: Model & { mat: MeshToonMaterial }
  private hue = 0.07
  private yaw = 0
  private flash = 0
  constructor(
    bag: Bag,
    id: string,
    private home: XZ,
  ) {
    super(id, 'cuttlefish')
    this.m = cuttlefishModel(bag)
    this.m.root.scale.setScalar(1.6)
    this.root.add(this.m.root)
    this.size = 0.55
  }
  poke(c: WildCtx) {
    this.flash = 1.5
    SOUND.bloop()
    c.fx.bubbles(this.root.position.x, this.root.position.y, this.root.position.z, 5)
  }
  protected step(dt: number, c: WildCtx) {
    const p = this.root.position
    const x = this.home.x + Math.sin(c.t * 0.3) * 1.2
    const z = this.home.z + Math.sin(c.t * 0.6) * 0.6
    const before = p.clone()
    p.set(x, underY(c, x, z, 0.4) + Math.sin(c.t * 1.4) * 0.05, z)
    if (p.distanceTo(before) > 1e-4) this.yaw += wrap(Math.atan2(p.x - before.x, p.z - before.z) - this.yaw) * ease(dt, 2)
    if (this.posing) this.yaw = this.toCam(this.yaw, p.x, p.z, c, dt, HALF)
    this.root.rotation.y = this.yaw
    // Its colors: browns and creams at rest, a slow rainbow as she comes near, pink up close (and a fast rainbow
    // flash for the camera or a tap).
    const d = Math.hypot(c.her.x - p.x, c.her.z - p.z)
    this.flash = Math.max(0, this.flash - dt)
    const near = d < 6 ? 1 - Math.max(0, d - 3) / 3 : 0
    const fast = this.posing || this.flash > 0
    this.hue = (this.hue + dt * (fast ? 1.4 : near * 0.25)) % 1
    const mat = this.m.mat
    if (fast || near > 0.05) mat.color.setHSL(d < 3 && !fast ? 0.92 : this.hue, 0.75 * Math.max(near, fast ? 1 : 0) + 0.15, 0.68)
    else mat.color.setHSL(0.07, 0.35 + Math.sin(c.t * 0.8) * 0.08, 0.62)
    // The fin skirt ripples.
    const b = this.m.parts.body
    b.scale.set(1 + Math.sin(c.t * 6) * 0.04, 1, 1 + Math.sin(c.t * 6 + 1) * 0.02)
    this.focus.copy(p)
  }
}

// ---------------------------------------------------------------- still: the urchins and the coral

class Still extends Creature {
  private m: Model
  private wob = 0
  constructor(bag: Bag, id: string, kind: 'urchin' | 'coral', p: Vector3, seed = 1) {
    super(id, kind)
    this.m = kind === 'urchin' ? urchinModel(bag) : coralModel(bag, seed)
    this.m.root.scale.setScalar(kind === 'urchin' ? 1.3 : 1.25)
    this.root.add(this.m.root)
    this.root.position.copy(p)
    this.root.rotation.y = seed * 1.7
    this.size = kind === 'urchin' ? 0.5 : 1.1
    this.focus.copy(p).y += kind === 'urchin' ? 0.15 : 0.35
  }
  poke(c: WildCtx) {
    this.wob = 1
    SOUND.bloop()
    c.fx.bubbles(this.focus.x, this.focus.y, this.focus.z, 6)
  }
  protected step(dt: number, c: WildCtx) {
    this.wob = Math.max(0, this.wob - dt * 1.2)
    const w = Math.max(this.wob, this.pk)
    const part = this.m.parts.ball ?? this.m.parts.patch
    const k = Math.sin(c.t * (this.kind === 'urchin' ? 18 : 6)) * w
    part.scale.set(1 + k * 0.08, 1 - k * 0.06, 1 + k * 0.08)
    if (this.kind === 'coral') part.rotation.z = Math.sin(c.t * 0.9 + this.root.rotation.y) * 0.02
    if (this.posing && Math.random() < dt * 8) c.fx.bubbles(this.focus.x + rand(-0.4, 0.4), this.focus.y, this.focus.z + rand(-0.4, 0.4), 1)
  }
}

// ---------------------------------------------------------------- where they live

/** A point out in the shallows off a beach: `u` along the sand, walking out until the sea floor is `depth` deep. */
function shallow(f: Frame, u: number, depth: number): XZ {
  let p = at(f, u, 0)
  for (let v = 0; v < 30; v += 0.4) {
    p = at(f, u, v)
    if (groundAt(p.x, p.z).h <= -depth) break
  }
  return p
}
/** A point at the water's edge on the rocks near a place (for the heron). */
function edge(f: Frame, u: number, v: number) {
  const p = at(f, u, v)
  return new Vector3(p.x, Math.max(0.05, groundAt(p.x, p.z).h), p.z)
}

const palm = (n: number) => POKES.find((p) => p.id === `palm:${n}`)!
const pokeAt = (id: string) => POKES.find((p) => p.id === id)!.at

/** Every animal of greybox 3, with its id (its tap target is `ani:<id>`). Hermit crabs 2 and 3 wait to climb out of a
 *  bottle she picks up on the beach clean. */
export const WILD: { id: string; kind: AnimalId }[] = [
  { id: 'monitor:0', kind: 'monitor' },
  { id: 'monitor:1', kind: 'monitor' },
  { id: 'mousedeer:0', kind: 'mousedeer' },
  { id: 'macaque:0', kind: 'macaque' },
  { id: 'macaque:1', kind: 'macaque' },
  { id: 'squirrel:0', kind: 'squirrel' },
  { id: 'squirrel:1', kind: 'squirrel' },
  { id: 'squirrel:2', kind: 'squirrel' },
  { id: 'hornbill:0', kind: 'hornbill' },
  { id: 'flyingfox:0', kind: 'flyingfox' },
  { id: 'heron:0', kind: 'heron' },
  { id: 'hermit:0', kind: 'crab' },
  { id: 'hermit:1', kind: 'crab' },
  { id: 'hermit:2', kind: 'crab' },
  { id: 'hermit:3', kind: 'crab' },
  { id: 'parrotfish:0', kind: 'parrotfish' },
  { id: 'damsels:0', kind: 'damselfish' },
  { id: 'damsels:1', kind: 'damselfish' },
  { id: 'cuttle:0', kind: 'cuttlefish' },
  { id: 'urchin:0', kind: 'urchin' },
  { id: 'urchin:1', kind: 'urchin' },
  { id: 'urchin:2', kind: 'urchin' },
  { id: 'coral:0', kind: 'coral' },
  { id: 'coral:1', kind: 'coral' },
  { id: 'coral:2', kind: 'coral' },
]

export interface PalmInfo {
  at: XZ
  y: number
  top?: Vector3
}

/** All the island's animals: built, placed, updated together. */
export class Wildlife {
  readonly root = new Group()
  readonly list: Creature[] = []
  readonly byId = new Map<string, Creature>()
  /** Already in her book: rare ones stop sparkling. */
  found = new Set<AnimalId>()
  private sparkT = 0
  private hermitNext = 2
  private born = new Set<Creature>()

  constructor(bag: Bag, palms: Map<string, PalmInfo>) {
    const add = (c: Creature) => {
      this.list.push(c)
      this.byId.set(c.id, c)
      this.root.add(c.root)
      return c
    }
    const pv = (p: XZ, y = 0) => new Vector3(p.x, y, p.z)
    const F = FRAMES
    // ---- Ao Prao: two monitors (one more by the beach bar at Sai Kaew), the mouse-deer in the trees on the road in,
    // the flying fox in the samet tree at the far end of the sand.
    add(new Monitor(bag, 'monitor:0', at(F.prao, -9, -7)))
    add(new Monitor(bag, 'monitor:1', { x: -7, z: -21 }))
    add(new MouseDeer(bag, 'mousedeer:0', { x: -140, z: -38.5 }))
    const samet = pokeAt('samet:2')
    const sy = Math.max(0, groundAt(samet.x, samet.z).h)
    const out = { x: F.prao.n.x, z: F.prao.n.z }
    const roost = new Vector3(samet.x + out.x * 1.6 + F.prao.t.x * 0.4, sy + 3.0, samet.z + out.z * 1.6 + F.prao.t.z * 0.4)
    add(new FlyingFox(bag, 'flyingfox:0', roost, { x: F.prao.x + F.prao.n.x * 12, z: F.prao.z + F.prao.n.z * 12, r: 13, h: 11 }))
    // Its branch, sticking out of the tree.
    this.branch(bag, new Vector3(samet.x, sy + 2.1, samet.z), roost.clone().setY(roost.y + 0.05))
    // ---- The hill road: a macaque mother and her baby.
    const mother = add(new Macaque(bag, 'macaque:0', { x: -72, z: -46.5 })) as Macaque
    const baby = add(new Macaque(bag, 'macaque:1', { x: -71, z: -46 }, true)) as Macaque
    baby.mother = mother
    // ---- Squirrels on the palms of Sai Kaew, Hin Khok and Ao Prao.
    ;['squirrel:0', 'squirrel:1', 'squirrel:2'].forEach((id, i) => {
      const n = [1, 4, 10][i]
      const info = palms.get(`palm:${n}`) ?? { at: palm(n).at, y: 0 }
      add(new Squirrel(bag, id, { at: info.at, y: info.y, top: info.top ?? new Vector3(info.at.x, info.y + 7, info.at.z) }))
    })
    // ---- Ao Wong Duan: the hornbill in the tamarind (two branches of its own) and on a palm's crown.
    const tam = pokeAt('tamarind:0')
    const ty = Math.max(0, groundAt(tam.x, tam.z).h)
    const wd = F.wongduan
    const b1 = new Vector3(tam.x + wd.n.x * 3.4 + wd.t.x * 0.9, ty + 3.75, tam.z + wd.n.z * 3.4 + wd.t.z * 0.9)
    const b2 = new Vector3(tam.x - wd.t.x * 3.3 + wd.n.x * 1.4, ty + 4.0, tam.z - wd.t.z * 3.3 + wd.n.z * 1.4)
    this.branch(bag, new Vector3(tam.x, ty + 3.0, tam.z), b1)
    this.branch(bag, new Vector3(tam.x, ty + 3.3, tam.z), b2)
    const crown = palms.get('palm:8')?.top
    const seaYaw = Math.atan2(wd.n.x, wd.n.z)
    const perches = [
      { p: b1, yaw: seaYaw },
      { p: b2, yaw: seaYaw - 0.8 },
      ...(crown ? [{ p: crown.clone().setY(crown.y + 0.25), yaw: seaYaw + 0.5 }] : []),
    ]
    add(new Hornbill(bag, 'hornbill:0', perches))
    // ---- The mermaid's rocks: the reef heron fishing at the water's edge, urchins in the shallows below it.
    const mf = frameNear(PLACES.mermaid)
    const heronYaw = Math.atan2(mf.n.x, mf.n.z)
    add(new Heron(bag, 'heron:0', [{ p: edge(mf, -3.5, -0.3), yaw: heronYaw }, { p: edge(mf, 5.5, -0.4), yaw: heronYaw + 0.4 }]))
    const floor = (p: XZ) => pv(p, groundAt(p.x, p.z).h)
    add(new Still(bag, 'urchin:0', 'urchin', floor(shallow(mf, -1.5, 0.55)), 1))
    add(new Still(bag, 'urchin:1', 'urchin', floor(shallow(mf, 2.5, 0.6)), 2))
    add(new Still(bag, 'urchin:2', 'urchin', floor(shallow(F.hinkhok, -14, 0.55)), 3))
    // ---- Coral in the shallows at Hin Khok, by the mermaid and at Wong Duan.
    add(new Still(bag, 'coral:0', 'coral', floor(shallow(F.hinkhok, -8, 0.75)), 1))
    add(new Still(bag, 'coral:1', 'coral', floor(shallow(mf, 0.5, 0.8)), 2))
    add(new Still(bag, 'coral:2', 'coral', floor(shallow(wd, 1, 0.8)), 3))
    // ---- The fish at Ao Wong Duan (and a second crowd at Ao Phai), the cuttlefish by the snorkel boat's jetty.
    add(new Parrotfish(bag, 'parrotfish:0', shallow(wd, 3, 0.8), 2.6))
    add(new Damsels(bag, 'damsels:0', shallow(wd, -4, 0.85)))
    add(new Damsels(bag, 'damsels:1', shallow(F.phai, 0, 0.85)))
    const sn = STOPS.snorkel.at
    const cf = frameNear(sn)
    add(new Cuttlefish(bag, 'cuttle:0', shallow(cf, -5, 0.85)))
    // ---- Hermit crabs on the wet sand at Sai Kaew and Ao Phai (two more for the beach clean's bottles).
    add(new Hermit(bag, 'hermit:0', at(F.saikaew, 18, -1.6), true))
    add(new Hermit(bag, 'hermit:1', at(F.phai, 3, -1.4), true))
    add(new Hermit(bag, 'hermit:2', at(F.saikaew, 0, -1), false))
    add(new Hermit(bag, 'hermit:3', at(F.saikaew, 0, -1), false))
  }

  /** A branch for something to sit on, from a tree's trunk out to `to` (with a tuft of leaves). */
  private branch(bag: Bag, from: Vector3, to: Vector3) {
    const d = to.clone().sub(from)
    const len = d.length()
    const g = solid(merge([P.cyl(0.05, 0.1, len, '#8C6A4D', { at: [0, len / 2, 0] }, 6), P.sphere(0.45, '#5AA85E', { at: [0, len + 0.1, 0.25], scale: [1.2, 0.6, 1] }, 8)]), bag, 2)
    g.position.copy(from)
    g.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), d.normalize())
    this.root.add(g)
  }

  /** A hermit crab climbs out of the bottle she just picked up (or from under the flip-flop). */
  hermitAt(x: number, z: number) {
    const h = this.byId.get(`hermit:${this.hermitNext}`) as Hermit
    this.hermitNext = this.hermitNext === 2 ? 3 : 2
    h.spawn(x, z)
    return h
  }

  /** The nearest urchin to a point, and how far (she boings off them). */
  urchinNear(x: number, z: number) {
    let best: Creature | null = null
    let bd = Infinity
    for (const c of this.list) {
      if (c.kind !== 'urchin') continue
      const d = Math.hypot(c.root.position.x - x, c.root.position.z - z)
      if (d < bd) {
        bd = d
        best = c
      }
    }
    return { c: best, d: bd }
  }

  update(dt: number, c: WildCtx, cull: number) {
    this.sparkT -= dt
    const spark = this.sparkT <= 0
    if (spark) this.sparkT = 0.3
    for (const a of this.list) {
      const p = a.root.position
      // (Each one lives one frame first, so it's where it belongs before the distance check.)
      const far = this.born.has(a) && Math.hypot(p.x - c.eye.x, p.z - c.eye.z) > cull
      this.born.add(a)
      if (far && !a.posing) {
        a.root.visible = false
        continue
      }
      a.update(dt, c)
      // (The mouse-deer hiding in the trees stays drawn: the trees hide it. A hermit crab not out yet isn't.)
      a.root.visible = a.kind === 'mousedeer' || !a.hidden
      // Rare ones she hasn't snapped yet sparkle when she's near, so she can spot them.
      if (spark && a.rare && !a.hidden && !this.found.has(a.kind) && Math.hypot(c.her.x - p.x, c.her.z - p.z) < 18) c.fx.sparkle(a.focus.x + rand(-0.4, 0.4), a.focus.y + rand(-0.2, 0.5), a.focus.z + rand(-0.4, 0.4))
    }
  }
}

export const playWild = (s: WildSound) => SOUND[s]()

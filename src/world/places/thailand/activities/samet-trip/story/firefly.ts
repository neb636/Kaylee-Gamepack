// The four lost fireflies of Koh Samet (plan: planning/around-the-world/thailand/samet-story.md): the story that
// holds the trip together. Each is a little glowing bug with a round face, two fluttering wings and a soft halo in its
// own color, and each is hiding at the stop whose game it loves: Zoom (pink, fast: the jet ski), Sandy (gold, the
// sandcastle), Bubbles (blue, the snorkel) and Peekaboo (green, hide and seek). Every stage of the trip uses these:
// the island (the ones she has found circle her horn; the others wait at their beach), each stop (its firefly is in
// its films and its play) and the fire show (they light it).
//
// A firefly has no voice: it tinkles (`fireflySfx`), each on its own note, so she can tell them apart by ear.
import { AdditiveBlending, CircleGeometry, Color, DoubleSide, Group, Mesh, MeshBasicMaterial, SphereGeometry, Vector3, type Object3D } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { tone } from '../../../../../kit/sfx'

export type FireflyId = 'jetski' | 'sandcastle' | 'snorkel' | 'hideseek'
/** In the order the board shows them. */
export const FIREFLY_IDS: FireflyId[] = ['jetski', 'sandcastle', 'snorkel', 'hideseek']
export const FIREFLIES: Record<FireflyId, { name: string; color: string; note: number }> = {
  jetski: { name: 'Zoom', color: '#FF4FA3', note: 784 },
  sandcastle: { name: 'Sandy', color: '#FFC83D', note: 880 },
  snorkel: { name: 'Bubbles', color: '#3FB8FF', note: 988 },
  hideseek: { name: 'Peekaboo', color: '#6BE36B', note: 1175 },
}

/** Their sounds (synthesized, in tune with each other). */
export const fireflySfx = {
  /** A little two-note twinkle on its own note: it's here, it's happy. */
  chime: (id: FireflyId, vol = 0.05) => {
    const n = FIREFLIES[id].note
    tone(n, n, 0.16, vol, 'sine')
    tone(n * 1.5, n * 1.5, 0.22, vol * 0.8, 'sine', 0.1)
  },
  /** A giggle: three quick rising pips. */
  giggle: (id: FireflyId, vol = 0.045) => {
    const n = FIREFLIES[id].note
    ;[0, 0.07, 0.14].forEach((d, i) => tone(n * (1 + i * 0.12), n * (1.06 + i * 0.12), 0.07, vol, 'triangle', d))
  },
  /** Found: a rising run that ends on its note, an octave up. */
  found: (id: FireflyId, vol = 0.06) => {
    const n = FIREFLIES[id].note
    ;[0.5, 0.625, 0.75, 1, 1.25, 1.5, 2].forEach((k, i) => tone(n * k, n * k, i === 6 ? 0.5 : 0.12, vol, i === 6 ? 'sine' : 'triangle', i * 0.075))
  },
  /** All of them together: a chord, low to high. */
  all: (vol = 0.05) => FIREFLY_IDS.forEach((id, i) => tone(FIREFLIES[id].note, FIREFLIES[id].note, 0.9, vol, 'sine', i * 0.12)),
  /** A whoosh of wind taking one away (the memory). */
  whisk: (id: FireflyId, vol = 0.04) => {
    const n = FIREFLIES[id].note
    tone(n * 1.5, n * 0.5, 0.4, vol, 'sine')
  },
}

const tmp = new Vector3()

/** One firefly. Put `root` in a scene; call `update` every frame, and `fly` on the frames it should head somewhere. */
export class Firefly {
  readonly root = new Group()
  /** Bobs and tilts inside `root`, so whoever moves `root` needn't know about the bobbing. */
  private bobber = new Group()
  private halo: Mesh
  private halo2: Mesh
  private wings: Group[] = []
  private eyes: Mesh[] = []
  private seed = Math.random() * 20
  private flashK = 0
  private blinkT = 1 + Math.random() * 3
  /** How bright it is now, and how bright it wants to be (0: only a faint dot, 1: full glow). */
  glow = 1
  glowGoal = 1
  /** Its size (1: about 30 cm across the halo; the island shows them bigger than a real bug so she can see them). */
  size = 1
  /** Meters a second it last moved (the wings beat faster, the body leans). */
  speed = 0

  constructor(
    readonly id: FireflyId,
    bag: Bag,
  ) {
    const color = new Color(FIREFLIES[id].color)
    const pale = color.clone().lerp(new Color('#FFFFFF'), 0.38)
    const body = new Mesh(bag.add(new SphereGeometry(0.085, 14, 10)), bag.add(new MeshBasicMaterial({ color: pale, fog: false })))
    // Its lantern: the tail end glows in its own color.
    const tail = new Mesh(bag.add(new SphereGeometry(0.075, 12, 8)), bag.add(new MeshBasicMaterial({ color, fog: false })))
    tail.position.set(0, -0.03, -0.08)
    // Two halos: a see-through ball of its own color (so it reads as pink, gold, blue or green on bright sand in the
    // daytime, where an additive glow washes out to white) inside a wider additive glow (which shines at night and
    // under the sea).
    const inner = bag.add(new MeshBasicMaterial({ color, transparent: true, opacity: 0.4, depthWrite: false, fog: false }))
    const outer = bag.add(new MeshBasicMaterial({ color, transparent: true, opacity: 0.2, blending: AdditiveBlending, depthWrite: false, fog: false }))
    this.halo = new Mesh(bag.add(new SphereGeometry(0.17, 14, 10)), inner)
    this.halo2 = new Mesh(bag.add(new SphereGeometry(0.29, 14, 10)), outer)
    this.halo.position.copy(tail.position)
    this.halo2.position.copy(tail.position)
    this.halo.renderOrder = 6
    this.halo2.renderOrder = 6
    const wingGeo = bag.add(new CircleGeometry(0.1, 10))
    const wingMat = bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.8, side: DoubleSide, depthWrite: false, fog: false }))
    for (const s of [-1, 1]) {
      const pivot = new Group()
      pivot.position.set(s * 0.03, 0.06, -0.02)
      const w = new Mesh(wingGeo, wingMat)
      w.scale.set(0.7, 1.15, 1)
      w.position.set(s * 0.07, 0.07, 0)
      w.rotation.x = -Math.PI / 2 + 0.5
      pivot.add(w)
      this.bobber.add(pivot)
      this.wings.push(pivot)
    }
    const eyeGeo = bag.add(new SphereGeometry(0.02, 8, 6))
    const eyeMat = bag.add(new MeshBasicMaterial({ color: '#2B2330', fog: false }))
    for (const s of [-1, 1]) {
      const e = new Mesh(eyeGeo, eyeMat)
      e.position.set(s * 0.034, 0.018, 0.074)
      this.bobber.add(e)
      this.eyes.push(e)
    }
    // Pink cheeks.
    const cheekMat = bag.add(new MeshBasicMaterial({ color: '#FF9EC4', fog: false }))
    for (const s of [-1, 1]) {
      const c = new Mesh(eyeGeo, cheekMat)
      c.scale.set(1.1, 0.7, 0.5)
      c.position.set(s * 0.056, -0.006, 0.064)
      this.bobber.add(c)
    }
    this.bobber.add(body, tail, this.halo, this.halo2)
    this.root.add(this.bobber)
  }

  get pos() {
    return this.root.position
  }
  /** Puts it somewhere at once. */
  place(x: number, y: number, z: number) {
    this.root.position.set(x, y, z)
    this.speed = 0
  }
  /** Heads for a point this frame (quick at `rate` 6, lazy at 2), turning to face the way it goes. */
  fly(to: Vector3, dt: number, rate = 4) {
    const p = this.root.position
    tmp.copy(to).sub(p)
    const k = 1 - Math.exp(-dt * rate)
    const dx = tmp.x * k
    const dy = tmp.y * k
    const dz = tmp.z * k
    p.x += dx
    p.y += dy
    p.z += dz
    this.speed = dt > 0 ? Math.hypot(dx, dy, dz) / dt : 0
    if (Math.hypot(dx, dz) > 0.0015) this.face(Math.atan2(dx, dz), dt)
  }
  /** Turns toward a heading (radians), smoothly. */
  face(yaw: number, dt: number, rate = 8) {
    const d = Math.atan2(Math.sin(yaw - this.root.rotation.y), Math.cos(yaw - this.root.rotation.y))
    this.root.rotation.y += d * (1 - Math.exp(-dt * rate))
  }
  /** Turns to look at a point (someone's face, the camera). */
  faceToward(x: number, z: number, dt: number) {
    this.face(Math.atan2(x - this.root.position.x, z - this.root.position.z), dt)
  }
  /** A bright pulse (found, hello, lighting something up). */
  flash() {
    this.flashK = 1
  }

  update(dt: number, t: number) {
    const s = this.seed
    this.glow += (this.glowGoal - this.glow) * Math.min(1, dt * 5)
    this.flashK = Math.max(0, this.flashK - dt * 1.6)
    const fast = Math.min(1, this.speed / 5)
    // A bob and a little wander, a lean into the way it flies.
    this.bobber.position.set(Math.sin(t * 1.7 + s) * 0.03, Math.sin(t * 3.1 + s) * 0.045, 0)
    this.bobber.rotation.x = fast * 0.45
    this.bobber.rotation.z = Math.sin(t * 2.3 + s) * 0.12
    const flap = Math.sin(t * (38 + fast * 20) + s)
    this.wings[0].rotation.z = 0.5 + flap * 0.55
    this.wings[1].rotation.z = -0.5 - flap * 0.55
    // A blink now and then.
    this.blinkT -= dt
    const shut = this.blinkT < 0.12
    if (this.blinkT < 0) this.blinkT = 2 + Math.random() * 3
    for (const e of this.eyes) e.scale.y = shut ? 0.15 : 1
    const pulse = 0.82 + Math.sin(t * 4.2 + s) * 0.18
    const g = this.glow * pulse + this.flashK * 0.9
    ;(this.halo.material as MeshBasicMaterial).opacity = Math.min(0.6, 0.4 * g)
    ;(this.halo2.material as MeshBasicMaterial).opacity = Math.min(0.5, 0.22 * g)
    this.halo.scale.setScalar(1 + this.flashK * 0.5)
    this.halo2.scale.setScalar(1 + this.flashK * 0.9 + (pulse - 0.82) * 0.5)
    this.root.scale.setScalar(this.size * (1 + this.flashK * 0.2))
  }
}

/** The fireflies she has found, circling something (her horn on the island, the lantern at the show): each on its own
 *  little orbit, a different height and speed, so they never bunch up. */
export class Swarm {
  readonly flies: Firefly[] = []
  /** The orbit's radius and how fast they go round (1: a lazy circle). */
  radius = 0.55
  pace = 1
  constructor(
    private bag: Bag,
    private parent: Object3D,
    ids: readonly FireflyId[] = [],
    private size = 1,
  ) {
    for (const id of ids) this.add(id)
  }
  has(id: FireflyId) {
    return this.flies.some((f) => f.id === id)
  }
  get(id: FireflyId) {
    return this.flies.find((f) => f.id === id)
  }
  /** One more joins (from `from`, if given: it flies in from there). */
  add(id: FireflyId, from?: Vector3) {
    const had = this.get(id)
    if (had) return had
    const f = new Firefly(id, this.bag)
    f.size = this.size
    if (from) f.root.position.copy(from)
    this.parent.add(f.root)
    this.flies.push(f)
    return f
  }
  /** Where firefly `i` of `n` wants to be round `center` at time `t`. */
  slot(i: number, n: number, t: number, center: Vector3, out = new Vector3()) {
    const a = t * (1.1 + (i % 2) * 0.25) * this.pace + (i / Math.max(1, n)) * Math.PI * 2
    return out.set(center.x + Math.sin(a) * this.radius, center.y + Math.sin(t * 1.9 + i * 1.7) * 0.12 + (i % 2) * 0.1, center.z + Math.cos(a) * this.radius)
  }
  /** Every frame: they circle `center`. `settle` (default: all of them) leaves out any a film is flying by hand. */
  update(dt: number, t: number, center: Vector3, settle: (f: Firefly) => boolean = () => true) {
    const n = this.flies.length
    this.flies.forEach((f, i) => {
      if (settle(f)) f.fly(this.slot(i, n, t, center, tmp2), dt, 5)
      f.update(dt, t)
    })
  }
  set visible(v: boolean) {
    for (const f of this.flies) f.root.visible = v
  }
}
const tmp2 = new Vector3()

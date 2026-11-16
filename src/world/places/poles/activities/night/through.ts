// Act 3 of the Poles' new ending, Through the Huddle (planning/around-the-world/poles-ending.md): Pola can't go in (the
// dads are shy of bears), so Pebble goes the last bit on his own, through a huddle of a thousand dads, to Papa. It
// stands on the 3D huddle's ice (activities/huddle/world.ts, colonyIce) in the long night.
//
// The toy (core verb): lead Pebble. Her finger on the ice (or on him) and he waddles after it; flick it and he
// tummy-slides. The huddle is soft: the dads he walks into squish aside, honk and shuffle back. The side verb: tap
// Pebble and he sings Papa's song, and Papa's gold notes rise from wherever he is right now (and his song comes back).
// It gets richer three times (`part`, a link each):
//   near    Papa is near the edge, but the huddle shuffles him away just as Pebble gets close ("Papa, wait!"). A dad
//           lifts his belly as Pebble goes by: an egg.
//   churn   the huddle turns slowly, the dads on the windy edge shiver and take their turn in the middle. A gust
//           rolls Pebble back out ("Whoa! Papa, help!"); the churn slows after it.
//   middle  packed tight: the dads won't budge. "Sing, Pebble! As loud as you can!" Three songs, the friends outside
//           join in from afar, Papa calls ("Pebble? Is that you?"), the dads turn one by one and step aside, an aisle
//           opens, and her finger takes Pebble the last steps onto Papa's feet. Papa folds his belly over him.
// Silly, never "oops": walk Pebble fast into a dad's tummy and he bounces off (a grumpy honk); Pola peeks over the
// huddle and waves. Every dad honks his own song when tapped; a thin, sleepy one is a fact.
// Never fails: a drag toward the gold notes gets a gentle pull that way, the churn slows after the gust, and the gold
// notes stay up longer each time.
//
// A thousand dads stay cheap: the huddle's dads are one instanced shape (a few hundred triangles each), and the few
// nearest Pebble borrow a real chibi rig (story/actor.ts) so their faces and honks are close up; the colony beyond is
// a simpler instanced shape with no outline. Built for engine3d/View3D.tsx. The feel is feel-lab knobs (?feel=1).
import { AdditiveBlending, Fog, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Plane, PlaneGeometry, Quaternion, Raycaster, Scene, Sprite, SpriteMaterial, Vector2, Vector3, type WebGLRenderer } from 'three'
import { clamp, type Line } from '../../../../../sdk'
import { smoothstep } from '../../../../../sdk/math'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { P, solid } from '../../../../engine3d/geo'
import { hullGeometry, instancedOutlineMaterial, setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { radialAlpha, softTexture } from '../../../../engine3d/softTexture'
import { applyBands, makeLights, toon } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { knobs, watch } from '../../../../kit/knobs'
import { L } from '../../lines'
import { dress } from '../../look/look'
import { PolarSky } from '../../look/sky'
import { glowTexture, heartTexture, NOTE_COLORS, noteTexture } from '../../look/sprites'
import { Actor, openBeak } from '../../story/actor'
import { Aurora, rng, skyDisc } from '../../story/props'
import { colonyIce } from '../huddle/world'
import { dadGeo } from './dads'
import { CHICK_H, DAD_H, RADIUS } from '../huddle/huddle'
import { sing, TUNES, tuneSeconds } from '../party/sounds'
import type { TalkKind } from './chorus'
import { huddleSfx3 as sfx, voice, type Singer } from './sounds'

const FILE = 'src/world/places/poles/activities/night/through.ts'
/** Leading Pebble (live in the feel lab: ?feel=1). */
const LEAD = knobs('lead', 'Through the Huddle: leading Pebble', FILE, {
  walk: { value: 1.7, min: 0.4, max: 5, step: 0.1, label: 'Waddle speed', unit: 'm/s', note: 'how fast Pebble waddles after her finger' },
  follow: { value: 5, min: 1, max: 20, step: 0.5, label: 'Turn to follow', unit: '/s', note: 'how quickly he changes direction (low = lazy)' },
  pull: { value: 0.45, min: 0, max: 1.5, step: 0.05, label: 'Pull to Papa', unit: 'm/s', note: 'the gentle pull toward the gold notes while she leads him roughly that way' },
  squish: { value: 7, min: 1, max: 20, step: 0.5, label: 'Squish', unit: '/s', note: 'how quickly the dads he walks into make room' },
  back: { value: 0.9, min: 0.1, max: 4, step: 0.1, label: 'Shuffle back', unit: '/s', note: 'how quickly a squished dad shuffles back to his spot' },
  flick: { value: 900, min: 300, max: 3000, step: 50, label: 'Flick speed', unit: 'px/s', note: 'a finger this fast when let go sends him on a tummy slide' },
  slide: { value: 3.2, min: 1, max: 8, step: 0.1, label: 'Slide distance', unit: 'm' },
  churn: { value: 0.045, min: 0, max: 0.3, step: 0.005, label: 'Churn', unit: 'rad/s', note: 'how fast the huddle turns in the churn (halved after the gust)' },
  gold: { value: 3, min: 1, max: 10, step: 0.25, label: 'Gold notes for', unit: 's', note: "how long Papa's gold notes stay up the first time (a second longer each time after)" },
  close: { value: 1.5, min: 0.6, max: 3, step: 0.1, label: 'Close to Papa', unit: 'm', note: 'how near Pebble gets before the huddle shuffles Papa away (and before the gust)' },
  tuck: { value: 0.95, min: 0.4, max: 2, step: 0.05, label: 'Tuck reach', unit: 'm', note: "how near Papa's feet Pebble must get to tuck in" },
  songs: { value: 3, min: 1, max: 6, step: 1, label: 'Songs to open', note: 'songs in the packed middle before the dads step aside' },
})

export type ThroughPart = 'near' | 'churn' | 'middle'
export interface ThroughStart {
  part: ThroughPart
}
export interface ThroughEvents {
  part(p: ThroughPart): void
  talk(line: Line, kind: TalkKind, key?: string): void
  hint(line: Line | null): void
  dots(n: number, of: number): void
  /** Tucked in on Papa's feet: on to the sunrise. */
  done(): void
}

const H = L.night.huddle

/** The huddle: a disc of dads round its middle (m). */
const C = new Vector3(0, 0, -1.4)
const R = 5
/** The space between two dads' middles. */
const GAP = 2 * RADIUS * 1.04
/** Pebble's footprint. */
const PEB_R = 0.22
/** Where Pebble starts in each part, and where Papa is. */
const START: Record<ThroughPart, { pebble: [number, number]; papa: [number, number] }> = {
  near: { pebble: [-2.8, 6.4], papa: [1.6, 3] },
  churn: { pebble: [-0.6, 5.2], papa: [-1.8, -1.2] },
  middle: { pebble: [0.3, 2], papa: [0, -1.4] },
}
/** Where the huddle shuffles Papa to when Pebble first gets close. */
const PAPA_DEEP: [number, number] = [-1.8, -1.2]
/** How many dads borrow a real rig near Pebble (besides Papa, the egg dad and the sleepy one). */
const POOL = 4
const HINT_S = 8

export const THROUGH_ANCHORS: AnchorInfo[] = [
  { id: 'pebble', label: 'Pebble: lead him, tap him to sing', kind: 'thing' },
  { id: 'papa', label: 'Papa', kind: 'thing' },
  { id: 'pola', label: 'Pola, peeking over the huddle', kind: 'thing' },
  { id: 'egg', label: 'A dad with an egg', kind: 'thing' },
  { id: 'sleepy', label: 'A thin, sleepy dad', kind: 'thing' },
  ...Array.from({ length: POOL }, (_, i) => ({ id: `dad:${i}`, label: 'A penguin dad', kind: 'thing' as const })),
]

/** One dad's spot in the huddle. */
interface Slot {
  i: number
  /** His own spot (it turns with the churn), where he is, and how far he has stepped aside for the aisle. */
  hx: number
  hz: number
  x: number
  z: number
  ax: number
  az: number
  aside: number
  yaw: number
  /** A honk's bounce (s left), a shiver (s left), when he may honk again. */
  hop: number
  shiver: number
  honkAt: number
  /** A real rig while he's near Pebble (or always: Papa, the egg dad, the sleepy one). */
  actor: Actor | null
  special: 'papa' | 'egg' | 'sleepy' | null
  phase: number
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const mtx = new Matrix4()
const q = new Quaternion()
const UPY = new Vector3(0, 1, 0)
const one = new Vector3(1, 1, 1)
const scl = new Vector3()

export class ThroughWorld implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private sky: PolarSky
  private aurora: Aurora
  private stops: (() => void)[] = []
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private anchorEls = new Map<string, HTMLElement>()
  private unwatch: () => void
  private raycaster = new Raycaster()
  private ground = new Plane(new Vector3(0, 1, 0), 0)

  // ---- The dads.
  private slots: Slot[] = []
  private dads: InstancedMesh
  private dadHull: InstancedMesh
  private colony: InstancedMesh
  private pool: Actor[] = []
  private papa: Slot
  private eggDad: Slot
  private sleepy: Slot
  private egg: Group
  private eggUp = 0
  private turn = 0
  private churn = 0

  // ---- Pebble, Pola, and the things in the air.
  private pebble: Actor
  private pola: Actor
  private px = 0
  private pz = 0
  private vx = 0
  private vz = 0
  private slideV: Vector2 | null = null
  private slideT = 0
  private tumble: { x0: number; z0: number; x1: number; z1: number; t: number } | null = null
  private tucked: { t: number } | null = null
  private glow: Sprite
  /** A pink ring on the snow round Pebble's feet, so she can always find him among the dads. */
  private ring: Mesh
  private papaGlow: Mesh
  private papaGlowMat: MeshBasicMaterial
  private flakes: Particles
  private puffs: Particles
  private sparkles: Particles
  private noteMats: SpriteMaterial[]
  private goldMat: SpriteMaterial
  private heartMat: SpriteMaterial
  private pops: { s: Sprite; t: number; life: number; vx: number; vy: number; vz: number; size: number }[] = []

  // ---- The story.
  private part: ThroughPart
  private step: 'lead' | 'shuffle' | 'gust' | 'packed' | 'opening' | 'aisle' | 'tucked' = 'lead'
  private goldFor = 0
  private goldUntil = 0
  private goldNext = 0
  private sings = 0
  private middleSongs = 0
  private gusted = false
  private turnsSaid = false
  private swapAt = 6
  private lastTouch = 0
  private lastHonk = 0
  private later: { at: number; fn: () => void }[] = []
  private polaPokes = 0
  private poked = new Set<string>()
  private counts = { leads: 0, sings: 0, squish: 0, bumps: 0, slides: 0, pokes: 0, taps: 0, gusts: 0, swaps: 0 }

  // ---- Her finger.
  private finger: { x: number; y: number; t: number; onPebble: boolean; moved: number; vx: number; vy: number; lx: number; ly: number; lt: number } | null = null
  private goal: Vector3 | null = null

  constructor(
    private renderer: WebGLRenderer,
    start: ThroughStart,
    private events: ThroughEvents,
  ) {
    const { scene, bag } = this
    applyBands()
    scene.fog = new Fog('#3E3C7E', 30, 150)
    this.rig.fov = 36
    this.rig.lag = 0.5
    this.rig.camera.near = 0.05

    // ---- The long night over the colony's ice (the 3D huddle's set), the lights and the moon.
    this.sky = new PolarSky(bag, 'night')
    this.aurora = new Aurora(bag)
    this.aurora.amount = 0.8
    const moon = skyDisc(bag, 4.5, '#FFF6D8', '#CFD6FF')
    moon.position.set(-38, 40, -150)
    scene.add(this.sky.root, this.aurora.root, moon)
    colonyIce(scene, bag, 2.6)

    // ---- The huddle: a disc of dads, packed in rows. The near ones get a face (eyes) and an outline.
    const r = rng(23)
    const spots: [number, number][] = []
    for (let row = -8; row <= 8; row++) {
      for (let col = -8; col <= 8; col++) {
        const x = (col + (row % 2 ? 0.5 : 0)) * GAP
        const z = row * GAP * 0.87
        if (Math.hypot(x, z) > R) continue
        spots.push([C.x + x + (r() - 0.5) * 0.08, C.z + z + (r() - 0.5) * 0.08])
      }
    }
    const geo = bag.add(dadGeo(DAD_H, 7, true))
    this.dads = bag.add(new InstancedMesh(geo, bag.add(toon('#ffffff', true)), spots.length))
    this.dadHull = bag.add(new InstancedMesh(bag.add(hullGeometry(geo)), instancedOutlineMaterial(2), spots.length))
    this.dadHull.userData.hull = 2
    scene.add(this.dads, this.dadHull)
    spots.forEach(([x, z], i) => {
      this.slots.push({ i, hx: x, hz: z, x, z, ax: 0, az: 0, aside: 0, yaw: (r() - 0.5) * 0.7, hop: 0, shiver: 0, honkAt: 0, actor: null, special: null, phase: r() * 6 })
    })
    // The colony beyond: hundreds more, round the huddle and back to the bergs (no outline, no faces: far off).
    const far: [number, number][] = []
    for (let i = 0; far.length < 640 && i < 4000; i++) {
      const a = Math.PI * (1.05 + r() * 0.9)
      const d = 7.5 + Math.sqrt(r()) * 22
      const x = Math.cos(a) * d * 1.3
      const z = C.z + Math.sin(a) * d * 0.7 - 2
      if (far.some(([fx, fz]) => Math.hypot(fx - x, fz - z) < GAP * 0.95)) continue
      far.push([x, z])
    }
    this.colony = bag.add(new InstancedMesh(bag.add(dadGeo(DAD_H, 4, false)), bag.add(toon('#ffffff', true)), far.length))
    far.forEach(([x, z], i) => {
      q.setFromAxisAngle(UPY, (r() - 0.5) * 0.8)
      this.colony.setMatrixAt(i, mtx.compose(tmp.set(x, 0, z), q, scl.setScalar(0.94 + r() * 0.1)))
    })
    scene.add(this.colony)

    // ---- The dads with a part to play: Papa, the dad with an egg, the thin sleepy one. Then the pool of rigs that
    // the dads nearest Pebble borrow.
    const special = (who: Slot['special'], x: number, z: number, voice: string | null, height = DAD_H) => {
      const s = this.nearest(x, z)
      s.special = who
      s.actor = new Actor('papa', bag, { height, voice })
      scene.add(s.actor.root)
      s.actor.place(s.x, 0, s.z, 0)
      return s
    }
    this.papa = special('papa', ...START[start.part].papa, 'papa')
    this.eggDad = special('egg', -1.4, 3.2, null)
    this.sleepy = special('sleepy', 2.4, 1.6, null, DAD_H * 0.94)
    this.sleepy.actor!.root.scale.set(0.82, 1, 0.82)
    this.sleepy.actor!.pull('sad', true)
    for (let i = 0; i < POOL; i++) {
      const a = new Actor('papa', bag, { height: DAD_H + (i % 3) * 0.03, voice: null })
      a.hide()
      scene.add(a.root)
      this.pool.push(a)
    }
    // The egg on the egg dad's feet (it shows when he lifts his belly).
    this.egg = new Group()
    this.egg.add(solid(P.sphere(0.1, '#FFEFC4', { scale: [1, 1.25, 1] }, 12), bag, 1.5))
    this.egg.position.set(0, 0.12, 0.36 * DAD_H)
    this.eggDad.actor!.root.add(this.egg)

    // ---- Pebble (on his own now), and Pola outside the huddle, peeking over.
    this.pebble = new Actor('pebble', bag, { height: CHICK_H + 0.15 })
    this.pola = new Actor('pola', bag, { height: 1.45 })
    scene.add(this.pebble.root, this.pola.root)
    this.pola.place(-4.8, 0, 7.2, 20)
    const glowTex = bag.add(glowTexture())
    this.glow = new Sprite(bag.add(new SpriteMaterial({ map: glowTex, transparent: true, opacity: 0.35, blending: AdditiveBlending, depthWrite: false, fog: false, color: '#FFB6D5' })))
    scene.add(this.glow)
    const ringTex = bag.add(softTexture(64, 64, [255, 111, 168], (x, y) => radialAlpha(Math.hypot(x - 32, y - 32), 32, [[0, 0], [0.6, 0], [0.78, 0.9], [0.92, 0.4], [1, 0]])))
    this.ring = new Mesh(bag.add(new PlaneGeometry(1.35, 1.35).rotateX(-Math.PI / 2)), bag.add(new MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false, fog: false })))
    this.ring.renderOrder = 3
    scene.add(this.ring)
    const goldTex = bag.add(softTexture(64, 64, [255, 214, 110], (x, y) => radialAlpha(Math.hypot(x - 32, y - 32), 32, [[0, 0.9], [0.55, 0.6], [1, 0]])))
    this.papaGlowMat = bag.add(new MeshBasicMaterial({ map: goldTex, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, fog: false }))
    this.papaGlow = new Mesh(bag.add(new PlaneGeometry(2, 2).rotateX(-Math.PI / 2)), this.papaGlowMat)
    this.papaGlow.position.y = 0.03
    this.papaGlow.renderOrder = 2
    scene.add(this.papaGlow)

    this.flakes = new Particles({ kind: 'spray', count: 360, color: '#FFFFFF', gravity: 0.2 }, bag)
    this.puffs = new Particles({ kind: 'spray', count: 100, color: '#E6F0FF' }, bag)
    this.sparkles = new Particles({ kind: 'spray', count: 140, colors: NOTE_COLORS, gravity: -0.3 }, bag)
    scene.add(this.flakes.mesh, this.puffs.mesh, this.sparkles.mesh)
    this.noteMats = NOTE_COLORS.map((c) => bag.add(new SpriteMaterial({ map: bag.add(noteTexture(c)), transparent: true, depthWrite: false, fog: false })))
    this.goldMat = bag.add(new SpriteMaterial({ map: bag.add(noteTexture('#FFC83D')), transparent: true, depthWrite: false, fog: false }))
    this.heartMat = bag.add(new SpriteMaterial({ map: bag.add(heartTexture()), transparent: true, depthWrite: false, fog: false }))

    dress(scene)

    // ---- Where the link starts.
    this.part = start.part
    const [bx, bz] = START[start.part].pebble
    this.px = bx
    this.pz = bz
    this.pebble.place(bx, 0, bz, 0)
    this.stops.push(sfx.colony(), sfx.wind())
    if (start.part === 'churn') this.churn = 1
    if (start.part === 'middle') {
      this.step = 'packed'
      this.packTight()
      this.pocket(true)
    }
    this.goldFor = LEAD.gold
    this.place(true)
    this.events.dots(0, 0)
    this.at(0.7, () => {
      if (this.step === 'packed') {
        this.events.hint(H.loud)
        this.events.talk(H.loud, 'cue')
        this.events.dots(0, LEAD.songs)
        return
      }
      this.events.hint(H.start)
      this.events.talk(H.start, 'cue')
      this.at(3.2, () => this.events.talk(H.sing, 'cue'))
      this.at(2, () => this.goldNotes())
    })

    this.unwatch = watch('lead', () => ({
      'Pebble speed': [Math.hypot(this.vx, this.vz), LEAD.walk],
      'to Papa': [Math.hypot(this.papa.x - this.px, this.papa.z - this.pz), 8],
      churn: [this.churn, 1],
    }))
  }

  // ---------------------------------------------------------------- the huddle

  private nearest(x: number, z: number) {
    let best = this.slots[0]
    let bd = Infinity
    for (const s of this.slots) {
      if (s.special) continue
      const d = Math.hypot(s.hx - x, s.hz - z)
      if (d < bd) {
        bd = d
        best = s
      }
    }
    return best
  }

  /** The middle, packed tight: Papa in the middle, everyone close (they won't budge until the song). */
  private packTight() {
    const mid = this.nearest(C.x, C.z)
    if (mid !== this.papa) this.swapHomes(this.papa, mid, true)
  }

  /** A little space round Pebble in the packed middle, so she can see him between the tummies. */
  private pocket(snap = false) {
    for (const s of this.slots) {
      if (s === this.papa) continue
      const dx = s.hx - this.px
      const dz = s.hz - this.pz
      const d = Math.hypot(dx, dz) || 0.01
      const want = RADIUS + PEB_R + 0.45
      if (d >= want) continue
      s.ax = (dx / d) * (want - d)
      s.az = (dz / d) * (want - d)
      if (snap) {
        s.x = s.hx + s.ax
        s.z = s.hz + s.az
      }
    }
  }

  /** Two dads trade spots (the churn: the cold one on the edge comes in, a warm one goes out). */
  private swapHomes(a: Slot, b: Slot, snap = false) {
    ;[a.hx, b.hx] = [b.hx, a.hx]
    ;[a.hz, b.hz] = [b.hz, a.hz]
    if (snap) {
      a.x = a.hx
      a.z = a.hz
      b.x = b.hx
      b.z = b.hz
    }
  }

  private at(sec: number, fn: () => void) {
    this.later.push({ at: this.time + sec, fn })
  }

  /** Papa's gold notes rise from wherever he is (longer each time), with his song. */
  private goldNotes(answer = false) {
    this.goldUntil = this.time + this.goldFor
    this.goldFor = Math.min(10, this.goldFor + 1)
    this.goldNext = 0
    sfx.gold()
    if (answer) {
      const d = Math.hypot(this.papa.x - this.px, this.papa.z - this.pz)
      sing(TUNES[0], 'papa', clamp((this.papa.x - this.px) / 6, -0.8, 0.8), clamp(1.1 - d / 12, 0.35, 1))
    }
  }

  // ---------------------------------------------------------------- the frame

  update(dt: number) {
    const t = (this.time += dt)
    if (this.later.length) {
      const due = this.later.filter((l) => l.at <= t)
      this.later = this.later.filter((l) => l.at > t)
      due.forEach((l) => l.fn())
    }
    this.updatePebble(dt, t)
    this.updateStory(dt, t)
    this.updateDads(dt, t)
    this.place(false)
    this.updateScene(dt, t)
    this.lights.follow(this.px, 0, this.pz)
    this.lights.ambient.color.set('#B9BEFF')
    this.lights.sun.color.set('#B9BEFF')
    this.lights.ambient.intensity *= 0.72
    this.lights.sun.intensity *= 0.55
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.sky.update(t, this.rig.camera)
  }

  private updatePebble(dt: number, t: number) {
    // Tucked in: he rides on Papa's feet.
    if (this.tucked) return void this.pebble.update(dt, t)
    // Rolled by the gust: he tumbles out across the snow.
    if (this.tumble) {
      const g = this.tumble
      g.t += dt / 1.4
      const k = smoothstep(0, 1, Math.min(1, g.t))
      this.px = g.x0 + (g.x1 - g.x0) * k
      this.pz = g.z0 + (g.z1 - g.z0) * k
      this.pebble.pos.set(this.px, Math.abs(Math.sin(g.t * 9)) * 0.15 * (1 - k), this.pz)
      this.pebble.root.rotation.y += dt * 9 * (1 - k)
      if (g.t >= 1) {
        this.tumble = null
        this.pebble.cheer()
        this.pebble.root.rotation.y = Math.PI
      }
      return void this.pebble.update(dt, t)
    }
    // Her finger: he waddles toward it (a tummy slide after a flick).
    let wx = 0
    let wz = 0
    if (this.slideV) {
      this.slideT -= dt
      wx = this.slideV.x
      wz = this.slideV.y
      this.slideV.multiplyScalar(Math.pow(0.4, dt))
      if (this.slideT <= 0) {
        this.slideV = null
        this.pebble.lean = 0
      }
    } else if (this.goal && this.finger && !this.finger.onPebble) {
      const dx = this.goal.x - this.px
      const dz = this.goal.z - this.pz
      const d = Math.hypot(dx, dz)
      const sp = LEAD.walk * smoothstep(0.05, 0.6, d)
      if (d > 0.01) {
        wx = (dx / d) * sp
        wz = (dz / d) * sp
      }
    } else if (this.goal && this.finger && this.finger.onPebble && this.finger.moved > 12) {
      const dx = this.goal.x - this.px
      const dz = this.goal.z - this.pz
      const d = Math.hypot(dx, dz)
      const sp = LEAD.walk * smoothstep(0.05, 0.6, d)
      if (d > 0.01) {
        wx = (dx / d) * sp
        wz = (dz / d) * sp
      }
    }
    // The pull toward the gold notes: while she leads him roughly Papa's way, the way bends a little toward him.
    const tx = this.papa.x - this.px
    const tz = this.papa.z - this.pz
    const td = Math.hypot(tx, tz) || 1
    const sp = Math.hypot(wx, wz)
    if (sp > 0.2 && !this.slideV && (wx * tx + wz * tz) / (sp * td) > 0.2 && this.step !== 'packed') {
      wx += (tx / td) * LEAD.pull
      wz += (tz / td) * LEAD.pull
    }
    const k = Math.min(1, dt * (this.slideV ? 20 : LEAD.follow))
    this.vx += (wx - this.vx) * k
    this.vz += (wz - this.vz) * k
    this.px += this.vx * dt
    this.pz += this.vz * dt
    // The dads: soft (they squish aside) except in the packed middle, where he bounces off a tummy.
    let bumped: Slot | null = null
    for (const s of this.slots) {
      const dx = s.x - this.px
      const dz = s.z - this.pz
      const d = Math.hypot(dx, dz)
      const min = RADIUS + PEB_R
      if (d >= min || d < 0.0001) continue
      const nx = dx / d
      const nz = dz / d
      const over = min - d
      const hard = this.step === 'packed' || this.step === 'opening' || s.special === 'papa'
      if (hard) {
        this.px -= nx * over
        this.pz -= nz * over
        if (!bumped && Math.hypot(this.vx, this.vz) > 0.9) bumped = s
      } else {
        const sq = Math.min(1, dt * LEAD.squish)
        s.x += nx * over * sq * 1.2
        s.z += nz * over * sq * 1.2
        this.px -= nx * over * 0.35
        this.pz -= nz * over * 0.35
        if (t - s.honkAt > 2.2 && t - this.lastHonk > 0.45) {
          s.honkAt = t
          this.lastHonk = t
          s.hop = 0.35
          this.counts.squish++
          sfx.honk()
        }
      }
    }
    if (bumped && t - bumped.honkAt > 1) {
      // A tummy: boing, and a grumpy honk.
      bumped.honkAt = t
      bumped.hop = 0.4
      this.counts.bumps++
      sfx.boing()
      this.at(0.15, () => sfx.honk())
      const bx = this.px - bumped.x
      const bz = this.pz - bumped.z
      const bl = Math.hypot(bx, bz) || 1
      this.vx = (bx / bl) * 2.4
      this.vz = (bz / bl) * 2.4
      this.goal = null
      this.pebble.pull('wow')
    }
    // Stay on the ice in front of the colony.
    this.px = clamp(this.px, -7, 7)
    this.pz = clamp(this.pz, -6.4, 7.2)
    // His waddle (or his slide).
    const moving = Math.hypot(this.vx, this.vz)
    this.pebble.pos.set(this.px, 0, this.pz)
    if (moving > 0.15) this.pebble.root.rotation.y = Math.atan2(this.vx, this.vz)
    this.pebble.waddle = this.slideV ? 0 : clamp(moving / 1.2)
    this.pebble.lean = this.slideV ? 1.35 : 0
    if (moving > 0.3 && !this.slideV && Math.floor(t * 4) !== Math.floor((t - dt) * 4)) sfx.step()
    this.pebble.update(dt, t)
  }

  private updateStory(dt: number, t: number) {
    const dPapa = Math.hypot(this.papa.x - this.px, this.papa.z - this.pz)
    // Near: as Pebble gets close, the huddle shuffles Papa away.
    if (this.part === 'near' && this.step === 'lead' && dPapa < LEAD.close + RADIUS) {
      this.step = 'shuffle'
      this.events.hint(null)
      this.pebble.pull('wow')
      this.events.talk(H.wait, 'friend')
      sfx.shuffle()
      // Papa goes deep; the dads round him close in behind.
      const deep = this.nearest(...PAPA_DEEP)
      this.swapHomes(this.papa, deep)
      this.papaWalk = 0.8
      this.at(3.4, () => {
        this.part = 'churn'
        this.events.part('churn')
        this.step = 'lead'
        this.churn = 1
        this.events.hint(H.stuck)
        this.goldNotes()
      })
    }
    // The egg dad lifts his belly as Pebble goes by.
    const de = Math.hypot(this.eggDad.x - this.px, this.eggDad.z - this.pz)
    if (de < 1.5 && this.eggUp === 0) {
      this.eggUp = 0.001
      this.events.talk(H.egg, 'fact', 'egg')
    }
    // Churn: the huddle turns; now and then two cold dads on the windy edge take their turn in the middle.
    if (this.churn > 0 && this.step !== 'packed' && this.step !== 'opening' && this.step !== 'aisle' && this.step !== 'tucked') {
      const w = LEAD.churn * this.churn * dt
      this.turn += w
      for (const s of this.slots) {
        if (s.special === 'egg' || s.special === 'sleepy') continue
        const dx = s.hx - C.x
        const dz = s.hz - C.z
        const c = Math.cos(w)
        const sn = Math.sin(w)
        s.hx = C.x + dx * c - dz * sn
        s.hz = C.z + dx * sn + dz * c
      }
      this.swapAt -= dt
      if (this.swapAt <= 0) {
        this.swapAt = 9
        this.edgeSwap()
      }
      // The gust: once Pebble is well into the churning huddle, it rolls him back out.
      if (this.step === 'lead') this.churnT += dt
      const inside = Math.hypot(this.px - C.x, this.pz - C.z) < R - 1.2
      if (!this.gusted && this.step === 'lead' && ((this.churnT > 3 && dPapa < LEAD.close + RADIUS + 0.6) || (this.churnT > 9 && inside))) this.gust()
      // After the gust, close to Papa again: the packed middle.
      else if (this.gusted && this.step === 'lead' && this.churnT > 7 && dPapa < LEAD.close + RADIUS + 0.4) this.toMiddle()
    }
    // The aisle is open: take him to Papa's feet.
    if (this.step === 'aisle') {
      const f = this.papa.actor!.root.localToWorld(tmp.set(0, 0, 0.36 * DAD_H))
      if (Math.hypot(f.x - this.px, f.z - this.pz) < LEAD.tuck) this.tuck()
    }
    // Papa's gold notes while they're up, and his glow on the snow.
    if (t < this.goldUntil && t >= this.goldNext) {
      this.goldNext = t + 0.32
      const p = this.papa.actor!.at(1.05, tmp)
      this.pop(this.goldMat, p, 0.45, 1.8, (Math.random() - 0.5) * 0.4, 1.1, 0)
    }
    const g = t < this.goldUntil ? 0.75 : this.step === 'aisle' ? 0.6 : 0
    this.papaGlowMat.opacity += (g - this.papaGlowMat.opacity) * Math.min(1, dt * 3)
    this.papaGlow.position.set(this.papa.x, 0.03, this.papa.z)
    // Stuck: gold notes again, and Pebble glows.
    if (t - this.lastTouch > HINT_S && t - this.lastNudge > HINT_S && (this.step === 'lead' || this.step === 'packed' || this.step === 'aisle')) {
      this.lastNudge = t
      if (this.step === 'lead') {
        this.events.talk(H.stuck, 'cue')
        this.goldNotes(true)
      }
    }
  }
  private lastNudge = 0
  private papaWalk = 0

  private edgeSwap() {
    // The two windiest dads on the edge (the wind comes from the left), and two in the middle.
    const edge = this.slots.filter((s) => !s.special && Math.hypot(s.hx - C.x, s.hz - C.z) > R - GAP * 1.1 && s.hx < C.x - 1).sort((a, b) => a.hx - b.hx).slice(0, 2)
    const mid = this.slots.filter((s) => !s.special && Math.hypot(s.hx - C.x, s.hz - C.z) < 1.8).slice(0, 2)
    edge.forEach((e, i) => {
      e.shiver = 1.6
      if (mid[i]) this.at(1.6, () => this.swapHomes(e, mid[i]))
    })
    this.counts.swaps++
    sfx.brrr()
    if (!this.turnsSaid) {
      this.turnsSaid = true
      this.at(1.2, () => this.events.talk(H.turns, 'fact', 'turns'))
    }
  }

  private churnT = 0
  private gust() {
    this.gusted = true
    this.churnT = 0
    this.step = 'gust'
    this.counts.gusts++
    this.goal = null
    this.finger = null
    sfx.gust()
    this.gustK = 1
    // Rolled out, back past the edge of the huddle.
    const dx = this.px - C.x
    const dz = this.pz - C.z
    const d = Math.hypot(dx, dz) || 1
    const to = R + 1.6
    this.tumble = { x0: this.px, z0: this.pz, x1: C.x + (dx / d) * to + 0.8, z1: Math.min(6.8, C.z + (dz / d) * to + 0.8), t: 0 }
    this.pebble.pull('wow', true)
    this.events.talk(H.pebbleBlown, 'friend')
    this.at(1.8, () => this.events.talk(H.blown, 'cue'))
    this.at(1.6, () => {
      this.step = 'lead'
      // The churn slows after the gust; the gold notes come up to show the way.
      this.churn = 0.5
      this.goldNotes(true)
      this.events.hint(H.stuck)
    })
  }
  private gustK = 0

  private toMiddle() {
    this.step = 'packed'
    this.part = 'middle'
    this.events.part('middle')
    this.goal = null
    this.vx = this.vz = 0
    // Papa slips into the very middle; everyone packs in.
    const mid = this.nearest(C.x, C.z)
    if (mid !== this.papa) this.swapHomes(this.papa, mid)
    this.pocket()
    sfx.shuffle()
    this.events.dots(0, LEAD.songs)
    this.at(0.6, () => {
      this.events.hint(H.loud)
      this.events.talk(H.loud, 'cue')
    })
  }

  /** Pebble sings (a tap on him). In the packed middle each song counts; then the dads step aside. */
  private singPebble() {
    if (this.tucked || this.tumble) return
    this.counts.sings++
    this.sings++
    this.lastTouch = this.time
    this.pebble.hop()
    this.pebble.pull('happy')
    this.beakT = tuneSeconds(TUNES[0])
    sing(TUNES[0], 'chick', 0, 0.9)
    for (let i = 0; i < 6; i++) this.at(i * 0.3, () => this.pop(this.noteMats[i % 6], this.pebble.at(1, tmp), 0.3, 1.4, (Math.random() - 0.5) * 0.5, 1, 0))
    if (this.step === 'packed') {
      this.middleSongs++
      this.events.dots(this.middleSongs, LEAD.songs)
      // The friends outside join in from afar, louder each song.
      this.farChorus(this.middleSongs / LEAD.songs)
      if (this.middleSongs >= LEAD.songs) this.at(tuneSeconds(TUNES[0]) * 0.7, () => this.openAisle())
      else this.at(tuneSeconds(TUNES[0]) * 0.6, () => this.goldNotes(true))
      return
    }
    if (this.step === 'lead' || this.step === 'aisle') this.at(tuneSeconds(TUNES[0]) * 0.55, () => this.goldNotes(true))
  }
  private beakT = 0

  /** Terry, the seal, the whale, the Adelies and Pola sing along from outside the huddle. */
  private farChorus(k: number) {
    const who: Singer[] = ['terry', 'seal', 'whale', 'adelie', 'pola']
    let at = 0.15
    for (const [semi, beats] of TUNES[0]) {
      const d = beats * 0.26
      this.at(at, () => who.forEach((s, i) => voice(s, semi, d * 0.95, 0.25 + 0.35 * k, i % 2 ? 0.7 : -0.7)))
      at += d
    }
    sfx.far()
    this.pola.hop()
    for (let i = 0; i < 8; i++) this.at(i * 0.25, () => this.pop(this.noteMats[i % 6], tmp.set(-5 + Math.random() * 10, 2.5, 6.5), 0.4, 2, (Math.random() - 0.5) * 0.6, 1.2, -0.4))
  }

  /** The biggest song: Papa calls, and the dads between them turn and step aside, one by one. */
  private openAisle() {
    this.step = 'opening'
    this.events.hint(null)
    this.events.talk(H.you, 'friend')
    this.papa.actor!.pull('wow')
    this.papa.actor!.turnTo(this.px, this.pz)
    this.goldNotes(true)
    const ax = this.papa.x - this.px
    const az = this.papa.z - this.pz
    const al = Math.hypot(ax, az) || 1
    const ux = ax / al
    const uz = az / al
    const inWay = this.slots
      .filter((s) => s !== this.papa)
      .map((s) => {
        const along = (s.x - this.px) * ux + (s.z - this.pz) * uz
        const across = (s.x - this.px) * -uz + (s.z - this.pz) * ux
        return { s, along, across }
      })
      .filter((o) => o.along > -0.3 && o.along < al - 0.2 && Math.abs(o.across) < RADIUS * 2.1)
      .sort((a, b) => a.along - b.along)
    inWay.forEach((o, i) => {
      this.at(1.2 + i * 0.35, () => {
        const side = o.across >= 0 ? 1 : -1
        const push = RADIUS * 2.3 - Math.abs(o.across) + 0.15
        o.s.ax = -uz * side * push
        o.s.az = ux * side * push
        o.s.hop = 0.35
        o.s.yaw = Math.atan2(this.px - o.s.x, this.pz - o.s.z)
        sfx.aside()
      })
    })
    this.at(1.6 + inWay.length * 0.35, () => {
      this.step = 'aisle'
      this.events.hint(H.take)
      this.events.talk(H.take, 'cue')
    })
  }

  /** On Papa's feet: he folds his belly over Pebble. */
  private tuck() {
    this.step = 'tucked'
    this.tucked = { t: 0 }
    this.goal = null
    this.finger = null
    this.events.hint(null)
    const pa = this.papa.actor!
    this.pebble.hopTo(this.papa.x, 0, this.papa.z, 0.5, null, 0.4)
    this.at(0.5, () => {
      this.pebble.ride(pa.root, 0, 0.06, 0.34 * DAD_H, 0)
      this.pebble.pull('happy', true)
      pa.pull('happy', true)
      pa.lean = 0.35
      sfx.hug()
      const p = pa.at(0.8, tmp)
      for (let i = 0; i < 6; i++) this.at(i * 0.18, () => this.pop(this.heartMat, p, 0.45, 1.6, (Math.random() - 0.5) * 0.8, 0.9, 0))
      this.sparkles.burst(p.x, p.y, p.z, 30, 2, 2.4, 0.15)
    })
    this.at(1.6, () => sfx.cheer())
    this.at(4.2, () => this.events.done())
  }

  private updateDads(dt: number, t: number) {
    // Each dad shuffles back to his spot (plus how far he has stepped aside), the near ones pack round each other.
    const back = Math.min(1, dt * LEAD.back)
    const walk = this.papaWalk > 0 ? Math.min(1, dt * this.papaWalk) : back
    for (const s of this.slots) {
      const gx = s.hx + s.ax
      const gz = s.hz + s.az
      const k = s === this.papa ? walk : s.shiver > 0 ? 0 : back
      s.x += (gx - s.x) * k
      s.z += (gz - s.z) * k
      s.hop = Math.max(0, s.hop - dt)
      s.shiver = Math.max(0, s.shiver - dt)
    }
    // Packing: only round Pebble and Papa (where things move), so the huddle stays cheap.
    const near = this.slots.filter((s) => Math.hypot(s.x - this.px, s.z - this.pz) < 2.6 || Math.hypot(s.x - this.papa.x, s.z - this.papa.z) < 1.8)
    for (let a = 0; a < near.length; a++) {
      for (let b = a + 1; b < near.length; b++) {
        const p = near[a]
        const o = near[b]
        const dx = o.x - p.x
        const dz = o.z - p.z
        const d = Math.hypot(dx, dz)
        const min = 2 * RADIUS * 0.96
        if (d >= min || d < 0.0001) continue
        const push = (min - d) * 0.5 * Math.min(1, dt * 10)
        p.x -= (dx / d) * push
        p.z -= (dz / d) * push
        o.x += (dx / d) * push
        o.z += (dz / d) * push
      }
    }
    // The rigs: Papa, the egg dad, the sleepy one always; the pool goes to the dads nearest Pebble.
    const want = this.slots
      .filter((s) => !s.special)
      .map((s) => ({ s, d: Math.hypot(s.x - this.px, s.z - this.pz) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, POOL)
      .map((o) => o.s)
    for (const s of this.slots) if (!s.special && s.actor && !want.includes(s)) s.actor = null
    const free = this.pool.filter((a) => !this.slots.some((s) => s.actor === a))
    for (const s of want) if (!s.actor) s.actor = free.pop() ?? null
    for (const a of this.pool) if (!this.slots.some((s) => s.actor === a)) a.root.visible = false
    for (const s of this.slots) {
      const a = s.actor
      if (!a) continue
      a.root.visible = true
      a.pos.set(s.x, 0, s.z)
      if (s !== this.papa || this.step !== 'opening') a.root.rotation.y = s.yaw + (s.special === 'papa' && this.step === 'aisle' ? 0 : 0)
      if (s.hop > 0.3 && !a.busy) a.hop()
      if (s.shiver > 0) a.root.rotation.z = Math.sin(t * 40) * 0.05
      else a.root.rotation.z = 0
      if (!s.special) openBeak(a, s.hop > 0 ? 0.5 : 0)
      a.update(dt, t)
    }
    // Papa faces Pebble once he has called; the egg dad lifts his belly while Pebble passes.
    if (this.step === 'aisle' || this.step === 'tucked') this.papa.actor!.turnTo(this.px, this.pz)
    if (this.eggUp > 0) {
      this.eggUp += dt
      const k = this.eggUp < 3 ? smoothstep(0, 0.5, this.eggUp) : 1 - smoothstep(3, 3.6, this.eggUp)
      this.eggDad.actor!.lean = -0.25 * k
      this.egg.visible = k > 0.05
      if (this.eggUp > 3.6) this.eggUp = 9
    } else this.egg.visible = false
    openBeak(this.papa.actor!, t < this.goldUntil ? 0.3 + 0.35 * Math.abs(Math.sin(t * 9)) : 0)
    // Pebble's beak while he sings.
    this.beakT = Math.max(0, this.beakT - dt)
    openBeak(this.pebble, this.beakT > 0 ? 0.3 + 0.4 * Math.abs(Math.sin(t * 13)) : 0)
  }

  /** The instances: every dad without a rig (one with a rig is drawn by it). */
  private place(_snap: boolean) {
    for (const s of this.slots) {
      if (s.actor) {
        this.dads.setMatrixAt(s.i, mtx.makeScale(0, 0, 0))
        this.dadHull.setMatrixAt(s.i, mtx)
        continue
      }
      const bob = Math.sin(this.time * 2.4 + s.phase) * 0.012 + (s.hop > 0 ? Math.sin((s.hop / 0.35) * Math.PI) * 0.12 : 0)
      q.setFromAxisAngle(UPY, s.yaw + (s.shiver > 0 ? Math.sin(this.time * 40) * 0.08 : 0))
      mtx.compose(tmp.set(s.x, bob, s.z), q, scl.copy(one).set(1, 1 + Math.sin(this.time * 2.4 + s.phase) * 0.015, 1))
      this.dads.setMatrixAt(s.i, mtx)
      this.dadHull.setMatrixAt(s.i, mtx)
    }
    this.dads.instanceMatrix.needsUpdate = true
    this.dadHull.instanceMatrix.needsUpdate = true
  }

  private updateScene(dt: number, t: number) {
    // Snow blowing across from the left, harder in the gust.
    this.gustK = Math.max(0, this.gustK - dt * 0.5)
    const n = Math.floor(dt * (25 + this.gustK * 200) + Math.random())
    for (let i = 0; i < n; i++) this.flakes.emit(this.px - 9, 0.2 + Math.random() * 3.5, this.pz - 6 + Math.random() * 10, 3.5 + this.gustK * 8, -0.3, (Math.random() - 0.5) * 0.5, 3.4, 0.04 + Math.random() * 0.04)
    this.flakes.update(dt)
    this.puffs.update(dt)
    this.sparkles.update(dt)
    this.aurora.update(dt, t)
    this.pola.update(dt, t)
    // Pola peeks over the huddle and waves now and then.
    if (Math.floor(t / 6) !== Math.floor((t - dt) / 6)) this.pola.wave()
    // (Watching Pebble, cheated toward the camera so her face shows.)
    this.pola.root.rotation.y = clamp(Math.atan2(this.px - this.pola.pos.x, this.pz - this.pola.pos.z), -1.1, 1.1)
    this.ring.position.set(this.px, 0.035, this.pz)
    this.ring.visible = !this.tucked
    this.ring.scale.setScalar(1 + 0.08 * Math.sin(t * 4))
    // Pebble's glow (pulses when she's stuck).
    const stuck = t - this.lastTouch > HINT_S && this.step !== 'tucked'
    this.glow.position.copy(this.pebble.at(0.5, tmp))
    this.glow.scale.setScalar(1.3 + (stuck ? 0.4 * Math.sin(t * 5) : 0))
    this.glow.material.opacity = this.step === 'tucked' ? 0 : stuck ? 0.45 : 0.25
    for (const p of this.pops) {
      if (p.t >= p.life) continue
      p.t += dt
      p.s.visible = p.t < p.life
      p.s.position.x += p.vx * dt
      p.s.position.y += p.vy * dt
      p.s.position.z += p.vz * dt
      const u = p.t / p.life
      p.s.scale.setScalar(p.size * Math.min(1, u * 6) * (1 - smoothstep(0.7, 1, u)) + 0.001)
    }
  }

  /** A note, a gold note or a heart floats up from a point. */
  private pop(mat: SpriteMaterial, at: Vector3, size: number, life: number, vx: number, vy: number, vz: number) {
    let p = this.pops.find((o) => o.t >= o.life)
    if (!p) {
      if (this.pops.length >= 60) return
      const s = new Sprite(mat)
      this.scene.add(s)
      p = { s, t: 0, life: 0, vx: 0, vy: 0, vz: 0, size: 0 }
      this.pops.push(p)
    }
    p.s.material = mat
    p.s.position.copy(at)
    p.t = 0
    p.life = life
    p.vx = vx
    p.vy = vy
    p.vz = vz
    p.size = size
    p.s.visible = true
  }

  /** Looking down at Pebble and the dads round him, a little ahead of him (into the huddle); wider while the aisle
   *  opens, so Papa is in it too. */
  private shot(): Shot {
    const s: Shot = this.tall
      ? { center: new Vector3(this.px, 0.5, this.pz - 1.1), half: new Vector3(2.4, 0.7, 3.2), yaw: 0, pitch: this.step === 'packed' ? 58 : 50 }
      : { center: new Vector3(this.px, 0.5, this.pz - 1), half: new Vector3(3.8, 0.7, 2.6), yaw: 0, pitch: this.step === 'packed' ? 54 : 46 }
    if (this.step === 'opening' || this.step === 'aisle' || this.step === 'tucked') {
      const mx = (this.px + this.papa.x) / 2
      const mz = (this.pz + this.papa.z) / 2
      s.center.set(mx, 0.6, mz)
      s.half.x = Math.max(s.half.x, Math.abs(this.px - this.papa.x) / 2 + 1.2)
      s.half.z = Math.max(s.half.z, Math.abs(this.pz - this.papa.z) / 2 + 1.2)
      if (this.step === 'tucked') {
        s.center.set(this.papa.x, 0.7, this.papa.z + 0.3)
        s.half.set(this.tall ? 1.3 : 1.8, 0.9, 1.2)
        s.pitch = 22
      }
    }
    return s
  }

  // ---------------------------------------------------------------- World3D

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w * 1.05
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }
  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }
  get calm() {
    return false
  }
  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = tmp2.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  private hitGround(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    return this.raycaster.ray.intersectPlane(this.ground, new Vector3())
  }
  private minTarget() {
    return Math.min(this.w, this.h) < 500 ? 64 : 88
  }
  private actorSpot(a: Actor, up = 0.5, grow = 0.6) {
    if (!a.root.visible) return null
    const c = this.toScreen(a.at(up, tmp))
    const top = this.toScreen(a.at(1, tmp)).y
    const foot = this.toScreen(a.at(0, tmp)).y
    return { ...c, r: Math.max(this.minTarget() / 2, Math.abs(foot - top) * grow) }
  }
  private spotOf(id: string): { x: number; y: number; z: number; r: number } | null {
    if (id === 'pebble') return this.tucked ? null : this.actorSpot(this.pebble, 0.5, 0.9)
    if (id === 'papa') return this.actorSpot(this.papa.actor!, 0.55, 0.45)
    if (id === 'pola') return this.actorSpot(this.pola, 0.6, 0.45)
    if (id === 'egg') return this.actorSpot(this.eggDad.actor!, 0.55, 0.42)
    if (id === 'sleepy') return this.actorSpot(this.sleepy.actor!, 0.55, 0.42)
    if (id.startsWith('dad:')) {
      const a = this.pool[+id.slice(4)]
      return a && a.root.visible ? this.actorSpot(a, 0.55, 0.42) : null
    }
    return null
  }

  pointerDown(x: number, y: number, id?: string) {
    if (this.tucked || this.step === 'opening') return
    this.lastTouch = this.time
    const p = this.spotOf('pebble')
    const onPebble = id === 'pebble' || (!!p && Math.hypot(x - p.x, y - p.y) < p.r * 1.1)
    this.finger = { x, y, t: this.time, onPebble, moved: 0, vx: 0, vy: 0, lx: x, ly: y, lt: performance.now() }
    this.goal = this.hitGround(x, y)
    if (!onPebble && id && id !== 'pebble') this.goal = null
    if (this.goal) this.counts.leads++
  }
  pointerMove(x: number, y: number) {
    const f = this.finger
    if (!f) return
    this.lastTouch = this.time
    const now = performance.now()
    const dt = Math.max(1, now - f.lt) / 1000
    f.vx = f.vx * 0.5 + ((x - f.lx) / dt) * 0.5
    f.vy = f.vy * 0.5 + ((y - f.ly) / dt) * 0.5
    f.lx = x
    f.ly = y
    f.lt = now
    f.moved = Math.max(f.moved, Math.hypot(x - f.x, y - f.y))
    f.x = x
    f.y = y
    this.goal = this.hitGround(x, y)
  }
  pointerUp() {
    const f = this.finger
    this.finger = null
    this.goal = null
    if (!f || this.tucked || this.tumble) return
    // A flick: a tummy slide the way her finger went.
    const v = Math.hypot(f.vx, f.vy)
    if (v > LEAD.flick && f.moved > 40 && performance.now() - f.lt < 120) {
      const a = this.hitGround(f.x, f.y)
      const b = this.hitGround(f.x - f.vx * 0.05, f.y - f.vy * 0.05)
      if (a && b) {
        const dx = a.x - b.x
        const dz = a.z - b.z
        const l = Math.hypot(dx, dz) || 1
        const sp = (LEAD.slide / 0.9) * 1.4
        this.slideV = new Vector2((dx / l) * sp, (dz / l) * sp)
        this.slideT = 1
        this.counts.slides++
        sfx.slide()
        if (this.counts.slides === 1) this.events.talk(H.slide, 'friend')
      }
    }
  }

  tap(x: number, y: number, id?: string) {
    this.counts.taps++
    this.lastTouch = this.time
    const p = this.spotOf('pebble')
    const what = id ?? (p && Math.hypot(x - p.x, y - p.y) < p.r * 1.1 ? 'pebble' : null)
    if (what === 'pebble') return this.singPebble()
    if (what === 'pola') {
      this.counts.pokes++
      this.poked.add('pola')
      this.pola.wave()
      this.pola.hop()
      return this.events.talk(L.night.chorus.pola[this.polaPokes++ % 2], 'friend')
    }
    if (what === 'papa') {
      this.poked.add('papa')
      this.papa.hop = 0.35
      return this.goldNotes(true)
    }
    if (what === 'sleepy') {
      this.counts.pokes++
      this.poked.add('sleepy')
      this.sleepy.hop = 0.35
      sfx.honk()
      return this.events.talk(H.fast, 'fact', 'fast')
    }
    if (what === 'egg') {
      this.poked.add('egg')
      this.eggUp = 0.001
      return this.events.talk(H.egg, 'fact', 'egg')
    }
    if (what?.startsWith('dad:')) {
      // Every dad honks his own song.
      const a = this.pool[+what.slice(4)]
      const s = this.slots.find((o) => o.actor === a)
      this.counts.pokes++
      this.poked.add('dad')
      if (s) s.hop = 0.35
      sfx.honk()
      const semi = (this.counts.pokes * 5) % 12
      voice('pebble', semi - 12, 0.3, 0.6)
      if (s) this.pop(this.noteMats[this.counts.pokes % 6], a.at(1, tmp), 0.35, 1.3, 0, 1, 0)
      return
    }
    // The sky: the long night's fact.
    const g = this.hitGround(x, y)
    if (!g || g.distanceTo(this.rig.camera.position) > 40) {
      this.counts.pokes++
      this.aurora.flare()
      return this.events.talk(H.night, 'fact', 'night')
    }
    this.puffs.burst(g.x, 0.05, g.z, 8, 1, 1.2, 0.12)
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = this.minTarget()
    const stuck = this.time - this.lastTouch > HINT_S
    for (const [id, el] of this.anchorEls) {
      const spot = this.spotOf(id)
      const show = !!spot && spot.z < 1 && spot.x > -spot.r && spot.x < this.w + spot.r && spot.y > -spot.r && spot.y < this.h + spot.r
      if (show && spot) {
        const d = Math.max(min, spot.r * 2)
        el.style.transform = `translate3d(${(spot.x - d / 2).toFixed(1)}px, ${(spot.y - d / 2).toFixed(1)}px, 0)`
        el.style.width = `${d.toFixed(0)}px`
        el.style.height = `${d.toFixed(0)}px`
        el.style.borderRadius = '50%'
        el.style.zIndex = String(id === 'pebble' ? 1000 : Math.round((1 - spot.z) * 900))
        const glow = stuck && id === 'pebble' && this.step !== 'tucked' ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : ''
        if (el.style.boxShadow !== glow) el.style.boxShadow = glow
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const scr = (id: string) => {
      const s = this.spotOf(id)
      return s ? { x: Math.round(s.x), y: Math.round(s.y) } : null
    }
    const papaAt = this.toScreen(tmp.set(this.papa.x, 0.3, this.papa.z))
    return {
      ...this.counts,
      section: 'huddle',
      part: this.part,
      step: this.step,
      toPapa: +Math.hypot(this.papa.x - this.px, this.papa.z - this.pz).toFixed(2),
      songs: this.middleSongs,
      gusted: this.gusted,
      tucked: !!this.tucked,
      dads: this.slots.length + this.colony.count,
      rigs: this.slots.filter((s) => s.actor).length,
      time: +this.time.toFixed(1),
      poked: [...this.poked],
      pebble: scr('pebble'),
      papa: { x: Math.round(papaAt.x), y: Math.round(papaAt.y) },
      pola: scr('pola'),
    }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }
  dispose() {
    for (const s of this.stops) s()
    this.unwatch()
    this.scene.clear()
    this.bag.dispose()
  }
}


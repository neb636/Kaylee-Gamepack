// Pond Hockey on the frozen Rideau Canal (the finale's game, plan: planning/around-the-world/canada.html), seen from a
// low camera behind her own net, looking up the ice at the geese's.
//
// The toy (core verb): flick the puck. Maple skates with the puck on her stick wherever Kaylee's finger drags her (in her
// half), and a quick flick of the finger slaps it that way (a tap on the ice or the net slaps it there too). The puck
// slides on the ice, bounces off the snowbanks, and her team does the rest: whoever is nearest skates after a missed
// shot and passes it back to her (the owl flies it, the otter spins on her back first, the squirrel zooms). The moose is
// in her goal; when the geese's goalie clears the puck down the ice, it bonks off his antlers.
// Deepens: 1 an open net with a sleepy goose in it, 2 two geese skate back and forth in the way (bounce it off the
// snowbank round them), 3 the goalie wakes up and dives for it. Three goals win. The goalie sometimes saves (never a
// goal against her), and eases off after every miss: slower, then diving the wrong way (rule 2).
// Who skates: Maple, the moose in goal, and one friend per stamp (sections.ts teamOf). Finale.tsx carries the words.
import { Color, Fog, Group, Mesh, MeshBasicMaterial, TorusGeometry, Vector3, type WebGLRenderer } from 'three'
import { burst, clamp, say, sounds, wobble } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { noise, sfx, tone } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import type { Shot } from '../../../../engine3d/camera'
import { merge, P, solid } from '../../../../engine3d/geo'
import { Particles } from '../../../../engine3d/particles'
import { PAL } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import type { AnimalId } from '../../book/animals'
import { meet } from '../../book/met'
import { L } from '../../lines'
import { makeActor, type Actor, type ActorId } from './actors'
import { Base3D, ease, turn } from './base'
import { buildCanal, RINK, SKY, type Canal } from './canal'
import { GOALS, type Teammate } from './sections'

const FILE = 'src/world/places/canada/activities/party/rink.ts'
/** Her flick (?feel=1 on the hockey link). */
const FLICK = knobs('hockeyFlick', 'Flicking the puck', FILE, {
  min: { value: 2.5, min: 0.5, max: 10, step: 0.25, label: 'A flick from', unit: 'm/s', note: 'a finger moving at least this fast when she lets go is a shot (slower: Maple just stops there)' },
  gain: { value: 0.9, min: 0.2, max: 3, step: 0.05, label: 'Power', unit: '×', note: 'shot speed = her finger’s speed × this' },
  slow: { value: 7, min: 2, max: 14, step: 0.5, label: 'Softest shot', unit: 'm/s' },
  fast: { value: 15, min: 6, max: 30, step: 0.5, label: 'Hardest shot', unit: 'm/s' },
  tap: { value: 11, min: 4, max: 20, step: 0.5, label: 'A tap shot', unit: 'm/s', note: 'how hard a tap on the ice or the net slaps it there' },
  window: { value: 0.09, min: 0.03, max: 0.3, step: 0.01, label: 'Flick measured over', unit: 's', note: 'the last bit of her finger’s move that sets the flick’s speed and direction' },
  aim: { value: 0.35, min: 0, max: 1, step: 0.05, label: 'Aim help', note: 'how much a shot roughly at the net is turned toward it (more after misses)' },
  cone: { value: 35, min: 0, max: 90, step: 1, label: 'Aim help within', unit: '°', note: 'shots this close to the net’s direction get the help' },
})
const PUCK = knobs('hockeyPuck', 'The puck on the ice', FILE, {
  friction: { value: 0.55, min: 0.05, max: 3, step: 0.05, label: 'Ice friction', unit: '/s', note: 'how fast a sliding puck slows down (lower = slides further)' },
  bounce: { value: 0.75, min: 0.2, max: 1, step: 0.05, label: 'Snowbank bounce', note: 'how much speed a puck keeps bouncing off the snow' },
  catch: { value: 1.1, min: 0.4, max: 2.5, step: 0.05, label: 'Maple catches within', unit: 'm', note: 'a pass this close to her stick sticks to it' },
})
const GOALIE = knobs('hockeyGoalie', 'The goose in goal', FILE, {
  save: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'Tries to save', note: 'the chance the goose goes for a shot (the first goal: half this)' },
  ease: { value: 0.5, min: 0, max: 1, step: 0.05, label: 'Eases off after a miss', note: 'each miss in a row takes this much off the chance (2 misses at 0.5: never saves)' },
  speed: { value: 3.2, min: 0.5, max: 8, step: 0.1, label: 'Goalie speed', unit: 'm/s' },
  reach: { value: 0.75, min: 0.2, max: 2, step: 0.05, label: 'Goalie reach', unit: 'm' },
  geese: { value: 1.8, min: 0.3, max: 5, step: 0.1, label: 'Geese in the way', unit: 'm/s', note: 'how fast the two geese skate back and forth (from the second goal)' },
})
const SKATE = knobs('hockeySkate', 'Maple skating with the puck', FILE, {
  speed: { value: 6, min: 1, max: 14, step: 0.25, label: 'Top speed', unit: 'm/s' },
  follow: { value: 6, min: 1, max: 20, step: 0.5, label: 'Follows her finger', unit: '/s', note: 'her speed = this × how far her finger is ahead' },
  ahead: { value: 0.8, min: 0, max: 3, step: 0.1, label: 'Skates below her finger', unit: 'm', note: 'Maple stays this far behind her fingertip, so the finger doesn’t hide her' },
})

export interface RinkStart {
  /** Goals already scored. */
  score: number
  team: Teammate[]
  /** Straight to the win (the `win` link). */
  win: boolean
}
export interface RinkEvents {
  /** A round begins: no goals, one, or two. */
  round(score: number): void
  goal(score: number): void
  saved(): void
  /** Stuck: the hand shows a flick. */
  hint(): void
  /** The cheering's done: the trophy. */
  win(): void
}

export const RINK_ANCHORS: AnchorInfo[] = [
  { id: 'maple', label: 'Maple: drag her, flick the puck', kind: 'thing' },
  { id: 'moose', label: 'The moose in goal', kind: 'thing' },
  { id: 'goalie', label: 'The goose in goal', kind: 'thing' },
  { id: 'goose0', label: 'A Canada goose', kind: 'thing' },
  { id: 'goose1', label: 'A Canada goose', kind: 'thing' },
  { id: 'stand', label: 'The BeaverTails stand', kind: 'thing' },
  { id: 'tower', label: 'Parliament’s clock tower', kind: 'thing' },
  ...[0, 1, 2, 3, 4, 5, 6].map((i) => ({ id: `mate${i}`, label: 'A teammate', kind: 'thing' as const })),
  ...[0, 1, 2].map((i) => ({ id: `skater${i}`, label: 'A skater on the canal', kind: 'thing' as const })),
  ...[2, 3, 4, 5].map((i) => ({ id: `lamp${i}`, label: 'A lamp', kind: 'thing' as const })),
]

const MATE_ACTOR: Record<Teammate, ActorId> = { squirrel: 'squirrel', owl: 'owl', raccoon: 'raccoon', loon: 'loon', grizzly: 'grizzly', otter: 'otter', spirit: 'spirit' }
const MATE_H: Record<Teammate, number> = { squirrel: 0.8, owl: 0.95, raccoon: 0.95, loon: 0.85, grizzly: 1.15, otter: 0.8, spirit: 1.4 }
const MATE_BOOK: Record<Teammate, AnimalId> = { squirrel: 'red-squirrel', owl: 'snowy-owl', raccoon: 'raccoon', loon: 'loon', grizzly: 'grizzly', otter: 'sea-otter', spirit: 'spirit-bear' }
/** Where each teammate skates its lazy loops (her half, out of the way of the shooting lane). */
const SPOTS: [number, number][] = [
  [-3.4, 1.2],
  [3.4, 1.2],
  [-2.4, 4.4],
  [2.4, 4.4],
  [-3.7, -1.8],
  [3.7, -1.8],
  [4.3, 4.6],
]
const MAPLE_START = new Vector3(0, 0, 2.6)
/** Where everyone stands for the big cheer at the end: Maple in front, the moose behind her to one side. */
const WIN_MAPLE = [0, -1.4] as const
const WIN_MOOSE = [2.2, -3.6] as const
const winSpot = ([x, z]: [number, number]): [number, number] => [x * 0.7, -2.4 + z * 0.22]
const PUCK_R = 0.34
const GOOSE_R = 0.6
const HINT_S = 8

type Phase = 'intro' | 'play' | 'goal' | 'win'
type Task = 'idle' | 'fetch' | 'carry' | 'fly' | 'pass' | 'clear'

interface Skater {
  actor: Actor
  id: ActorId
  mate?: Teammate
  x: number
  z: number
  vx: number
  vz: number
  y: number
  yaw: number
  spot: [number, number]
  phase: number
  task: Task
  taskT: number
  said: boolean
}

const tmp = new Vector3()
const tmp2 = new Vector3()

const honk = () => {
  tone(330, 300, 0.16, 0.09, 'sawtooth')
  tone(310, 270, 0.2, 0.08, 'sawtooth', 0.18)
}
const clack = () => noise(0.06, 0.25, 'highpass', 2200, 3000, 0, 1.4)
const horn = () => [0, 0.12, 0.24].forEach((d, i) => tone(392 + i * 131, 392 + i * 131, 0.5 - i * 0.1, 0.07, 'sawtooth', d))
const bong = () => [0, 0.9, 1.8].forEach((d) => tone(196, 194, 1.2, 0.12, 'sine', d))
const chime = () => [0, 0.08, 0.16].forEach((d, i) => tone(1500 + i * 300, 2100 + i * 300, 0.25, 0.03, 'sine', d))

export class RinkWorld extends Base3D implements World3D {
  private canal: Canal
  private phase: Phase
  private phaseT = 0
  private score: number
  private maple: Skater
  private moose: Skater
  private goalie: Skater
  private geese: Skater[] = []
  private mates: Skater[] = []
  private puck = new Group()
  private puckRing: Mesh
  private p = { x: 0, z: 0, y: 0, vx: 0, vz: 0, state: 'held' as 'held' | 'free' | 'carried' | 'net', by: null as Skater | null, shot: false, pass: false, tries: false, stillT: 0, freeT: 0, spin: 0, cleared: false }
  private streak = 0
  private shots = 0
  private dive = 0
  private diveV = 0
  private finger: { x: number; y: number } | null = null
  private pending: { x: number; y: number; id?: string } | null = null
  private control = false
  private samples: { t: number; x: number; z: number }[] = []
  private goal = new Vector3()
  private hinted = false
  private confetti: Particles
  private snow: Particles
  private sparks: Particles
  private fireT = 0
  private standT = -1
  private towerT = -1
  private saidOnce = new Set<string>()
  private moosePraise = false
  private unwatch: () => void
  private flick = 0
  private counts = { drags: 0, shots: 0, flicks: 0, taps: 0, pokes: 0, saves: 0, goals: 0, bounces: 0, passes: 0, blocks: 0 }

  constructor(
    renderer: WebGLRenderer,
    start: RinkStart,
    private events: RinkEvents,
  ) {
    super(renderer, 0)
    const { scene, bag } = this
    scene.background = new Color(SKY)
    scene.fog = new Fog(SKY, 45, 120)
    this.rig.fov = 44
    this.rig.lag = 0.45
    this.rig.camera.far = 300
    this.canal = buildCanal(bag)
    scene.add(this.canal.root)
    this.score = Math.min(GOALS - 1, start.score)

    const skater = (id: ActorId, h: number, x: number, z: number, stick = true, mate?: Teammate): Skater => {
      const actor = makeActor(bag, id, { height: h, stick })
      scene.add(actor.root)
      return { actor, id, mate, x, z, vx: 0, vz: 0, y: 0, yaw: Math.PI, spot: [x, z], phase: Math.random() * 6, task: 'idle', taskT: 0, said: false }
    }
    this.maple = skater('maple', 1.25, MAPLE_START.x, MAPLE_START.z)
    this.moose = skater('moose', 1.7, 0, RINK.zH - 0.5, false)
    this.moose.yaw = Math.PI
    this.goalie = skater('goose', 1.2, 0, RINK.zG + 0.5)
    this.goalie.yaw = 0
    for (let i = 0; i < 2; i++) {
      const g = skater('goose', 1.1, (i ? 1 : -1) * 7, i ? -3.2 : -5.4)
      g.yaw = 0
      g.actor.root.visible = false
      this.geese.push(g)
    }
    start.team.forEach((m, i) => {
      const [x, z] = SPOTS[i % SPOTS.length]
      this.mates.push(skater(MATE_ACTOR[m], MATE_H[m], x, z, m !== 'owl' && m !== 'loon' && m !== 'otter', m))
    })

    // The puck (a bit big, like a toy, with a pink ring under it so she always sees it).
    this.puck.add(solid(merge([P.cyl(PUCK_R, PUCK_R, 0.13, '#2B2330', { at: [0, 0.065, 0] }, 20), P.cyl(PUCK_R * 0.6, PUCK_R * 0.6, 0.012, '#5A5470', { at: [0, 0.135, 0] }, 16)]), bag, 2))
    scene.add(this.puck)
    const ringMat = bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0.8, depthWrite: false }))
    this.puckRing = new Mesh(bag.add(new TorusGeometry(PUCK_R * 1.8, 0.07, 6, 28)), ringMat)
    this.puckRing.rotation.x = -Math.PI / 2
    this.puckRing.position.y = 0.02
    this.puckRing.renderOrder = 3
    scene.add(this.puckRing)

    this.confetti = new Particles({ kind: 'spray', count: 320, colors: [PAL.hotpink, PAL.butter, PAL.mint, PAL.sky, '#E8443F', PAL.lavender], gravity: 3 }, bag)
    this.snow = new Particles({ kind: 'spray', count: 260, color: '#FFFFFF', gravity: 0.3 }, bag)
    this.sparks = new Particles({ kind: 'spray', count: 160, color: '#FFFFFF', gravity: 6 }, bag)
    scene.add(this.confetti.mesh, this.snow.mesh, this.sparks.mesh)
    for (let i = 0; i < 140; i++) this.dropFlake(Math.random() * 12)

    this.holdPuck()
    // Everyone skates out from behind her net (a link that starts later skips it).
    if (start.win) {
      // (Already gathered for the cheer.)
      ;[this.maple.x, this.maple.z] = WIN_MAPLE
      ;[this.moose.x, this.moose.z] = WIN_MOOSE
      for (const s of this.mates) [s.x, s.z] = winSpot(s.spot)
      this.phase = 'win'
      this.score = GOALS
      this.startWin()
    } else {
      this.phase = 'intro'
      const all = [this.maple, ...this.mates]
      all.forEach((s, i) => {
        s.x = (i % 2 ? 1 : -1) * (1 + (i % 3))
        s.z = RINK.zH + 3 + i * 0.6
        s.taskT = -i * 0.25
      })
    }
    this.rig.setShot(this.shot(), true)

    this.unwatch = watch('hockey', () => ({
      'her finger (m/s)': [this.flick, 20],
      'puck speed (m/s)': [Math.hypot(this.p.vx, this.p.vz), 20],
      'misses in a row': [this.streak, 4],
    }))
  }

  // ---------------------------------------------------------------- the game

  private holdPuck() {
    const p = this.p
    p.state = 'held'
    p.by = this.maple
    p.vx = p.vz = 0
    p.shot = p.pass = false
    p.cleared = false
  }

  /** The faceoff for the next goal. */
  private startRound() {
    this.phase = 'play'
    this.phaseT = 0
    this.streak = 0
    this.hinted = false
    this.maple.x = MAPLE_START.x
    this.maple.z = MAPLE_START.z
    this.holdPuck()
    this.goalie.x = 0
    const geese = this.score >= 1
    this.geese.forEach((g, i) => {
      if (geese && !g.actor.root.visible) {
        g.actor.root.visible = true
        g.x = (i ? 1 : -1) * 7
        g.actor.hop()
      }
    })
    for (const s of [this.maple, ...this.mates, this.goalie]) s.task = 'idle'
    this.events.round(this.score)
    void say(this.score === 0 ? L.party.rink : this.score === 1 ? L.party.geese : L.party.last)
  }

  /** A slap shot toward (dx, dz) at `speed`. */
  private shoot(dx: number, dz: number, speed: number) {
    const p = this.p
    if (p.state !== 'held' || this.phase !== 'play') return
    let a = Math.atan2(dx, dz)
    // Aim help: a shot roughly at the net turns toward it (more after misses).
    const toNet = Math.atan2(0 - p.x, RINK.zG - 0.4 - p.z)
    const d = Math.atan2(Math.sin(toNet - a), Math.cos(toNet - a))
    const help = clamp(FLICK.aim + this.streak * 0.2, 0, 1)
    if (Math.abs(d) < (FLICK.cone * Math.PI) / 180 + this.streak * 0.15) a += d * help
    p.state = 'free'
    p.by = null
    p.vx = Math.sin(a) * speed
    p.vz = Math.cos(a) * speed
    p.shot = true
    p.pass = false
    p.freeT = 0
    p.stillT = 0
    // Does the goose go for this one? Less and less after each miss; half as often for the first goal.
    p.tries = Math.random() < GOALIE.save * (this.score === 0 ? 0.5 : 1) * Math.max(0, 1 - this.streak * GOALIE.ease)
    this.shots++
    this.counts.shots++
    this.maple.actor.slap()
    this.maple.yaw = a
    sfx.crack()
    sounds.whoosh()
    this.sparks.burst(p.x, 0.1, p.z, 8, 2, 1.5, 0.08)
  }

  private dropFlake(age: number) {
    this.snow.emit((Math.random() - 0.5) * 30, 10 + Math.random() * 5 - age, -6 + (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 0.3, -0.8, 0, 16, 0.07 + Math.random() * 0.06)
  }

  private startWin() {
    this.phase = 'win'
    this.phaseT = 0
    this.fireT = 0
    this.p.state = 'net'
    for (const s of [this.maple, this.moose, ...this.mates]) s.actor.cheer()
    void say(L.party.win).then(() => {
      if (this.phase === 'win') void say(L.party.winFact)
    })
  }

  get calm() {
    return false
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.phaseT += dt
    const p = this.p

    if (this.phase === 'intro') {
      // Skating out to their places, one after the other.
      let all = true
      for (const s of [this.maple, ...this.mates]) {
        s.taskT += dt
        const [gx, gz] = s === this.maple ? [MAPLE_START.x, MAPLE_START.z] : s.spot
        if (s.taskT > 0) this.skateTo(s, gx, gz, 6, dt)
        if (Math.hypot(s.x - gx, s.z - gz) > 0.3) all = false
      }
      if (all || this.phaseT > 4.5) this.startRound()
    }

    // ---- Maple and the puck she holds.
    const m = this.maple
    if (this.phase === 'play' && p.state === 'held' && p.by === m) {
      if (this.control && this.finger) {
        const g = this.groundAt(this.finger.x, this.finger.y, tmp)
        if (g) this.goal.set(g.x, 0, g.z + SKATE.ahead)
      }
      const gx = clamp(this.goal.x, -RINK.x + 0.6, RINK.x - 0.6)
      const gz = clamp(this.goal.z, -3.2, RINK.zH - 1.8)
      if (this.control || Math.hypot(gx - m.x, gz - m.z) > 0.05) {
        let vx = (gx - m.x) * SKATE.follow
        let vz = (gz - m.z) * SKATE.follow
        const sp = Math.hypot(vx, vz)
        if (sp > SKATE.speed) {
          vx *= SKATE.speed / sp
          vz *= SKATE.speed / sp
        }
        m.vx += (vx - m.vx) * ease(dt, 10)
        m.vz += (vz - m.vz) * ease(dt, 10)
      }
    } else if (this.phase === 'play' && p.state !== 'held' && m.task === 'idle') {
      // While the puck's away she glides back toward the middle of her half.
      this.goal.set(clamp(m.x, -2.5, 2.5), 0, MAPLE_START.z)
      this.steer(m, this.goal.x, this.goal.z, 3, dt)
    }
    if (this.phase !== 'intro' && this.phase !== 'win') {
      m.x += m.vx * dt
      m.z += m.vz * dt
      m.vx *= Math.exp(-dt * 3)
      m.vz *= Math.exp(-dt * 3)
      m.x = clamp(m.x, -RINK.x + 0.5, RINK.x - 0.5)
      m.z = clamp(m.z, RINK.zG + 1.5, RINK.zH - 1.5)
    }

    this.updatePuck(dt, t)
    this.updateGoalie(dt, t)
    this.updateGeese(dt, t)
    this.updateMates(dt, t)

    // The moose sways in his goal, chewing.
    const mo = this.moose
    if (this.phase !== 'win') mo.x += (clamp(p.x * 0.3, -0.8, 0.8) - mo.x) * ease(dt, 2)

    // Stuck with the puck: the hand shows a flick to the net, and Sparkle says how once.
    const idle = this.phase === 'play' && p.state === 'held' && p.by === m && !this.control && t - Math.max(this.lastTouch, t - this.phaseT) > HINT_S
    if (idle && !this.hinted) {
      this.hinted = true
      this.events.hint()
      void say(L.party.rinkHint)
    }
    this.drawHint(idle ? tmp.set(p.x, 0.2, p.z) : null, idle ? tmp2.set(0, 0.4, RINK.zG + 0.5) : undefined)

    if (this.phase === 'goal' && this.phaseT > 3) {
      if (this.score >= GOALS) this.startWin()
      else this.startRound()
    }
    if (this.phase === 'win') {
      // Fireworks over the canal, and everyone hopping.
      this.fireT -= dt
      if (this.fireT <= 0) {
        this.fireT = 0.45 + Math.random() * 0.4
        const x = (Math.random() - 0.5) * 18
        const y = 6.5 + Math.random() * 3.5
        const z = -16 - Math.random() * 10
        for (let i = 0; i < 26; i++) {
          const a = Math.random() * Math.PI * 2
          const b = Math.random() * Math.PI - Math.PI / 2
          const s = 4 + Math.random() * 2
          this.confetti.emit(x, y, z, Math.cos(a) * Math.cos(b) * s, Math.sin(b) * s + 1, Math.sin(a) * Math.cos(b) * s, 1.6, 0.45)
        }
        tone(180, 60, 0.4, 0.08, 'sine')
        noise(0.4, 0.08, 'lowpass', 1200, 200, 0.05)
      }
      // Everyone gathers round Maple at center ice, facing the camera.
      this.skateTo(m, WIN_MAPLE[0], WIN_MAPLE[1], 4, dt)
      this.skateTo(this.moose, WIN_MOOSE[0], WIN_MOOSE[1], 4, dt)
      for (const s of [m, this.moose, ...this.mates]) if (!s.actor.busy && Math.random() < dt * 1.4) s.actor.cheer()
      if (this.phaseT > 7 && this.phaseT - dt <= 7) this.events.win()
    }

    // ---- Things round the canal.
    for (const l of this.canal.lamps) {
      const on = this.phase === 'win' ? 1 : 0
      if (l.t >= 0 && (l.t += dt) > 1.2) l.t = -1
      const k = Math.max(on, l.t >= 0 ? 1 - l.t / 1.2 : 0)
      l.mat.color.setRGB(1, 0.95 - k * 0.1, 0.72 - k * 0.3)
      l.glow.scale.setScalar(1 + k * 0.5 + (l.t >= 0 ? wobble(l.t / 1.2, 3) * 0.2 : 0))
    }
    for (const s of this.canal.skaters) {
      // Round and round the far canal.
      const len = 30
      const u = (((t * s.speed + s.phase) % (len * 2)) + len * 2) % (len * 2)
      const fwd = u < len
      const zz = -14 - (fwd ? u : len * 2 - u) * 0.75
      const x = s.lane + Math.sin(t * 1.3 + s.phase) * 0.8 + (fwd ? -1 : 1) * 2.2
      s.root.position.set(x, 0, zz)
      s.root.rotation.y = fwd ? Math.PI : 0
      s.body.rotation.z = Math.sin(t * 3 + s.phase) * 0.15
      if (s.spinT >= 0 && (s.spinT += dt) > 0.9) s.spinT = -1
      s.body.rotation.y = s.spinT >= 0 ? (s.spinT / 0.9) * Math.PI * 4 : 0
    }
    if (this.standT >= 0) {
      this.standT += dt
      const k = this.standT
      this.canal.stand.pastry.visible = k < 3
      this.canal.stand.pastry.position.y = 1.0 + Math.min(1, k * 3) * 0.9 + Math.sin(k * 4) * 0.05
      this.canal.stand.root.scale.setScalar(1 + (k < 0.6 ? wobble(k / 0.6, 3) * 0.06 : 0))
      if (k > 3) this.standT = -1
    }
    if (this.towerT >= 0 && (this.towerT += dt) > 2.6) this.towerT = -1

    // Snow falls all the time.
    if (Math.random() < dt * 24) this.dropFlake(0)
    this.confetti.update(dt)
    this.snow.update(dt)
    this.sparks.update(dt)

    this.place(dt, t)
    this.lights.follow(0, 0, -1)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
  }

  /** Turns its speed toward a spot, at most `top` m/s, easing off as it gets there. */
  private steer(s: Skater, x: number, z: number, top: number, dt: number) {
    let vx = (x - s.x) * 3
    let vz = (z - s.z) * 3
    const sp = Math.hypot(vx, vz)
    if (sp > top) {
      vx *= top / sp
      vz *= top / sp
    }
    s.vx += (vx - s.vx) * ease(dt, 6)
    s.vz += (vz - s.vz) * ease(dt, 6)
  }
  /** Skates toward a spot. */
  private skateTo(s: Skater, x: number, z: number, top: number, dt: number) {
    this.steer(s, x, z, top, dt)
    s.x += s.vx * dt
    s.z += s.vz * dt
  }

  private updatePuck(dt: number, t: number) {
    const p = this.p
    if (p.state === 'held' && p.by) {
      // On the stick, out in front and to her right.
      const s = p.by
      const yaw = s.yaw
      p.x = s.x + Math.sin(yaw) * 0.7 + Math.cos(yaw) * 0.25
      p.z = s.z + Math.cos(yaw) * 0.7 - Math.sin(yaw) * 0.25
      p.y = 0
      // A pass that reached Maple: hers again.
      return
    }
    if (p.state === 'carried' && p.by) {
      const s = p.by
      p.x = s.x + Math.sin(s.yaw) * 0.5
      p.z = s.z + Math.cos(s.yaw) * 0.5
      p.y = s.y > 0 ? s.y - 0.1 : 0
      return
    }
    if (p.state === 'net') {
      p.vx *= Math.exp(-dt * 6)
      p.vz *= Math.exp(-dt * 6)
      p.x += p.vx * dt
      p.z += p.vz * dt
      p.z = Math.max(p.z, RINK.zG - 0.8)
      return
    }
    // Sliding.
    p.freeT += dt
    const k = Math.exp(-PUCK.friction * dt)
    p.vx *= k
    p.vz *= k
    p.x += p.vx * dt
    p.z += p.vz * dt
    p.spin += Math.hypot(p.vx, p.vz) * dt * 3
    // The snowbanks along the sides.
    if (Math.abs(p.x) > RINK.x - PUCK_R) {
      p.x = Math.sign(p.x) * (RINK.x - PUCK_R)
      p.vx = -p.vx * PUCK.bounce
      p.vz *= PUCK.bounce
      this.thud(p.x, p.z)
    }
    // The geese's end: in the net, or off the bank beside it.
    if (p.z < RINK.zG + 0.2 && p.shot && !p.pass) {
      const inMouth = Math.abs(p.x) < RINK.netHalf - PUCK_R * 0.5
      // The goalie: a save if it went for this one and got there.
      const g = this.goalie
      if (p.tries && Math.abs(p.x - g.x) < GOALIE.reach + PUCK_R && inMouth && p.vz < 0) {
        this.save()
        return
      }
      if (inMouth && p.z < RINK.zG - 0.3 && p.vz < 0) {
        this.scoreGoal()
        return
      }
    }
    if (p.z < RINK.zG - 1.3) {
      p.z = RINK.zG - 1.3
      p.vz = -p.vz * PUCK.bounce
      this.thud(p.x, p.z)
    }
    // Her end: the moose blocks anything coming at his goal.
    if (p.z > RINK.zH - 1.2 && p.vz > 0) {
      p.z = RINK.zH - 1.2
      p.vz = -Math.max(6, p.vz * 0.8)
      p.vx = (this.maple.x - p.x) * 0.6
      p.pass = true
      p.shot = false
      this.moose.actor.hop()
      this.counts.blocks++
      sfx.boing()
      this.sparks.burst(p.x, 0.6, p.z, 10, 2, 2, 0.1)
      if (!this.saidOnce.has('block')) {
        this.saidOnce.add('block')
        void say(L.party.mooseBlock)
      }
    }
    if (p.z > RINK.zH + 1.6) {
      p.z = RINK.zH + 1.6
      p.vz = -Math.abs(p.vz) * PUCK.bounce
    }
    // A pass coming to Maple: it sticks to her stick.
    const m = this.maple
    const mx = m.x + Math.sin(m.yaw) * 0.7
    const mz = m.z + Math.cos(m.yaw) * 0.7
    if ((p.pass || p.freeT > 0.6) && Math.hypot(p.x - mx, p.z - mz) < PUCK.catch && this.phase === 'play') {
      this.holdPuck()
      sounds.place()
      return
    }
    // Stopped (or taking ages): someone fetches it.
    const speed = Math.hypot(p.vx, p.vz)
    p.stillT = speed < 0.9 ? p.stillT + dt : 0
    if ((p.stillT > 0.35 || p.freeT > 4.5) && this.phase === 'play' && !this.fetching()) {
      if (p.shot) this.missed()
      this.fetch()
    }
    void t
  }

  private thud(x: number, z: number) {
    this.counts.bounces++
    noise(0.12, 0.12, 'lowpass', 700, 200)
    this.sparks.burst(x, 0.3, z, 8, 1.6, 2.4, 0.12)
  }

  private fetching() {
    return [this.maple, ...this.mates, this.goalie].some((s) => s.task !== 'idle')
  }

  /** A shot that didn't go in. */
  private missed() {
    this.p.shot = false
    this.streak++
    this.events.saved()
  }

  /** The goose saves it: the puck pops back out, or it clears it down the ice at the moose. */
  private save() {
    const p = this.p
    this.counts.saves++
    const g = this.goalie
    g.actor.cheer()
    honk()
    this.diveV = Math.sign(p.x - g.x || 1) * 5
    this.missed()
    void say(L.party.saved[this.counts.saves % 2])
    if (Math.random() < 0.45 && !p.cleared) {
      // It holds it a moment, then slaps it all the way down the ice (the moose will bonk it back).
      p.state = 'carried'
      p.by = g
      p.cleared = true
      g.task = 'clear'
      g.taskT = 0
      return
    }
    p.vz = Math.abs(p.vz) * 0.45 + 1
    p.vx = (Math.random() - 0.5) * 4
    p.z = RINK.zG + 0.25
    p.pass = false
    sfx.thump()
  }

  private scoreGoal() {
    const p = this.p
    p.state = 'net'
    p.vz = -2
    this.score++
    this.streak = 0
    this.counts.goals++
    this.phase = 'goal'
    this.phaseT = 0
    horn()
    sounds.correct()
    this.canal.netG.position.z = RINK.zG - 0.12
    this.goalie.actor.flop()
    for (const g of this.geese) if (g.actor.root.visible) g.actor.spin()
    for (const s of [this.maple, ...this.mates]) s.actor.cheer()
    this.moose.actor.cheer()
    for (let i = 0; i < 70; i++) this.confetti.emit((Math.random() - 0.5) * 3, 1 + Math.random(), RINK.zG - 0.5, (Math.random() - 0.5) * 6, 4 + Math.random() * 4, 2 + Math.random() * 3, 2.2, 0.16)
    const s = this.toScreen(tmp.set(0, 1, RINK.zG))
    burst(s.x / this.w, s.y / this.h)
    this.events.goal(this.score)
    void say(L.party.goal[(this.score - 1) % L.party.goal.length]).then(() => {
      if (this.score === 1 && !this.moosePraise && this.phase === 'goal') {
        this.moosePraise = true
        return say(L.party.mooseGoal)
      }
    })
  }

  /** The nearest teammate (or Maple herself) goes and gets the puck. */
  private fetch() {
    const p = this.p
    const pool = this.mates.length ? this.mates : [this.maple]
    const s = pool.reduce((a, b) => (Math.hypot(b.x - p.x, b.z - p.z) < Math.hypot(a.x - p.x, a.z - p.z) ? b : a))
    s.task = 'fetch'
    s.taskT = 0
  }

  private updateGoalie(dt: number, t: number) {
    const g = this.goalie
    const p = this.p
    // Sleepy for the first goal; quicker later; slower after each miss.
    const speed = GOALIE.speed * (this.score === 0 ? 0.45 : this.score === 1 ? 0.8 : 1.1) * Math.max(0.25, 1 - this.streak * 0.25)
    let want = clamp(p.x * 0.4, -RINK.netHalf + 0.4, RINK.netHalf - 0.4)
    if (p.state === 'free' && p.shot && p.vz < -0.5) {
      const tHit = (RINK.zG + 0.2 - p.z) / p.vz
      const xHit = p.x + p.vx * tHit
      // It goes for it, or (when it's not trying) dives the wrong way, flapping.
      want = p.tries ? clamp(xHit, -RINK.netHalf, RINK.netHalf) : clamp(-xHit, -RINK.netHalf, RINK.netHalf)
    }
    if (g.task === 'clear') {
      g.taskT += dt
      if (g.taskT > 0.7) {
        g.task = 'idle'
        p.state = 'free'
        p.by = null
        p.vx = (this.moose.x - p.x) * 0.25
        p.vz = 11
        p.shot = false
        p.pass = false
        p.freeT = 0
        g.actor.slap()
        sfx.crack()
        honk()
      }
    }
    const dx = want - g.x
    g.x += clamp(dx * 6, -speed, speed) * dt
    g.x += this.dive * dt
    this.diveV *= Math.exp(-dt * 4)
    this.dive = this.diveV
    g.x = clamp(g.x, -RINK.netHalf - 0.3, RINK.netHalf + 0.3)
    g.z = RINK.zG + 0.5
    g.vx = dx
    void t
  }

  private updateGeese(dt: number, t: number) {
    const p = this.p
    this.geese.forEach((g, i) => {
      if (!g.actor.root.visible) return
      // Back and forth across the ice in front of the net (slower after misses, then out to the sides).
      const amp = (RINK.x - 1.1) * Math.max(0.35, 1 - this.streak * 0.2)
      const w = (GOALIE.geese * Math.max(0.35, 1 - this.streak * 0.25)) / amp
      const wantX = Math.sin(t * w + i * 2.1) * amp
      const prev = g.x
      g.x += (wantX - g.x) * ease(dt, 3)
      g.vx = (g.x - prev) / Math.max(dt, 1e-3)
      g.yaw = turn(g.yaw, g.vx > 0.1 ? Math.PI / 2 : g.vx < -0.1 ? -Math.PI / 2 : 0, ease(dt, 6))
      // The puck bounces off them.
      if (p.state === 'free') {
        const dx = p.x - g.x
        const dz = p.z - g.z
        const d = Math.hypot(dx, dz)
        if (d < GOOSE_R + PUCK_R && d > 1e-3) {
          const nx = dx / d
          const nz = dz / d
          const dot = p.vx * nx + p.vz * nz
          if (dot < 0) {
            p.vx -= 2 * dot * nx
            p.vz -= 2 * dot * nz
            p.vx *= 0.8
            p.vz *= 0.8
          }
          p.x = g.x + nx * (GOOSE_R + PUCK_R)
          p.z = g.z + nz * (GOOSE_R + PUCK_R)
          g.actor.spin()
          honk()
          this.counts.bounces++
        }
      }
    })
  }

  private updateMates(dt: number, t: number) {
    const p = this.p
    const m = this.maple
    for (const s of [...this.mates, m]) {
      if (s === m && s.task === 'idle') continue
      if (s.task === 'idle') {
        if (this.phase === 'intro') continue
        // Lazy loops round its spot.
        const w = 0.6 + (s.phase % 1) * 0.3
        const x = s.spot[0] + Math.cos(t * w + s.phase) * 1.1
        const z = s.spot[1] + Math.sin(t * w + s.phase) * 0.7
        if (this.phase === 'win') this.skateTo(s, ...winSpot(s.spot), 4, dt)
        else this.skateTo(s, x, z, 2.5, dt)
        continue
      }
      s.taskT += dt
      if (s.task === 'fetch') {
        if (p.state !== 'free') {
          s.task = 'idle'
          continue
        }
        const fast = s.mate === 'squirrel' ? 9 : s.mate === 'owl' ? 7 : 6
        if (s.mate === 'owl') s.y += (1.4 - s.y) * ease(dt, 4)
        // (Maple moves in the main loop, kept in her half; the others go anywhere.)
        if (s === m) this.steer(s, p.x, p.z, fast, dt)
        else this.skateTo(s, p.x, p.z, fast, dt)
        if (s.taskT > 3) {
          // Out of reach (behind the net): the goose kicks it back out to her.
          s.task = 'idle'
          this.passDone(this.goalie, false)
          continue
        }
        if (Math.hypot(s.x - p.x, s.z - p.z) < 0.6) {
          p.state = 'carried'
          p.by = s
          s.task = s.mate === 'owl' ? 'fly' : s === m ? 'idle' : 'carry'
          s.taskT = 0
          if (s === m) this.holdPuck()
          if (s.mate === 'otter') s.actor.spin()
          if (s.mate === 'raccoon') s.actor.hop()
          sounds.pickup()
        }
      } else if (s.task === 'fly') {
        // The owl flies it right back to her stick and drops it.
        this.skateTo(s, m.x, m.z + 0.6, 7, dt)
        s.y += (1.6 - s.y) * ease(dt, 4)
        if (Math.hypot(s.x - m.x, s.z - m.z - 0.6) < 0.7) this.passDone(s, true)
      } else if (s.task === 'carry') {
        // A beat with it (the otter spins on her back), then a pass to Maple.
        s.vx *= Math.exp(-dt * 4)
        s.vz *= Math.exp(-dt * 4)
        s.x += s.vx * dt
        s.z += s.vz * dt
        s.yaw = turn(s.yaw, Math.atan2(m.x - s.x, m.z - s.z), ease(dt, 8))
        if (s.taskT > (s.mate === 'otter' ? 0.8 : 0.35)) this.passDone(s, false)
      }
      if (s.task !== 'fly' && s.mate === 'owl') s.y += (0 - s.y) * ease(dt, 4)
    }
  }

  /** A teammate gives the puck back to Maple. */
  private passDone(s: Skater, drop: boolean) {
    const p = this.p
    const m = this.maple
    s.task = 'idle'
    this.counts.passes++
    if (drop) {
      this.holdPuck()
      sounds.place()
    } else {
      p.state = 'free'
      p.by = null
      const mx = m.x + Math.sin(m.yaw) * 0.7
      const mz = m.z + Math.cos(m.yaw) * 0.7
      const d = Math.hypot(mx - p.x, mz - p.z) || 1
      const sp = clamp(d * 1.6, 4, 9)
      p.vx = ((mx - p.x) / d) * sp
      p.vz = ((mz - p.z) / d) * sp
      p.pass = true
      p.shot = false
      p.freeT = 0
      if ('slap' in s.actor) s.actor.slap()
      clack()
    }
    // Their line, the first time each one passes.
    if (s.mate && !s.said) {
      s.said = true
      const line = L.party.poke[s.mate as keyof typeof L.party.poke]
      if (line) void say(line)
    }
  }

  // ---------------------------------------------------------------- drawing everyone

  private place(dt: number, t: number) {
    const p = this.p
    this.puck.position.set(p.x, p.y, p.z)
    this.puck.rotation.y = p.spin
    this.puck.visible = p.state !== 'net' || this.phase !== 'win'
    this.puckRing.position.set(p.x, 0.02, p.z)
    this.puckRing.visible = this.puck.visible && p.y < 0.2
    this.puckRing.scale.setScalar(1 + 0.12 * Math.sin(t * 7))
    this.canal.netG.position.x *= Math.exp(-dt * 8)
    this.canal.netG.position.z += (RINK.zG - this.canal.netG.position.z) * ease(dt, 6)
    const all = [this.maple, this.moose, this.goalie, ...this.geese, ...this.mates]
    for (const s of all) {
      const sp = Math.hypot(s.vx, s.vz)
      // Face where it's going; Maple faces up the ice (turning a little toward her puck); idle ones toward the camera.
      if (this.phase === 'win' && (s === this.maple || s === this.moose)) s.yaw = turn(s.yaw, 0, ease(dt, 4))
      else if (s === this.maple) {
        const want = sp > 0.6 ? Math.atan2(s.vx, s.vz) : Math.PI + 0.25 * Math.sin(t * 0.8)
        s.yaw = turn(s.yaw, this.phase === 'win' ? 0 : sp > 0.6 && s.vz > 0 ? Math.PI : want, ease(dt, 6))
      } else if (s === this.goalie || this.geese.includes(s) || s === this.moose) {
        if (s === this.moose) s.yaw = this.phase === 'win' ? s.yaw : Math.PI
        else if (s === this.goalie) s.yaw = turn(s.yaw, 0, ease(dt, 6))
      } else if (s.task === 'idle' && this.phase !== 'intro') s.yaw = turn(s.yaw, sp > 0.8 ? Math.atan2(s.vx, s.vz) : this.phase === 'win' ? 0 : Math.atan2(s.vx, s.vz), ease(dt, 4))
      else if (sp > 0.3 && s.task !== 'carry') s.yaw = turn(s.yaw, Math.atan2(s.vx, s.vz), ease(dt, 8))
      s.actor.root.position.set(s.x, s.y, s.z)
      s.actor.root.rotation.y = s.yaw
      const skate = s === this.moose ? 0 : clamp(sp / 3, 0, 1)
      // The goalie leans and flaps as it dives.
      const flail = s === this.goalie ? clamp(Math.abs(this.dive) / 3, 0, 1) : s.y > 0.3 ? 1 : 0
      s.actor.update(dt, t, { skate, flail, lean: s.mate === 'loon' && sp > 1 ? 0.9 : 0 })
    }
  }

  protected shot(): Shot {
    // Low, behind her goal, up the ice to the geese's net and Parliament beyond.
    const tall = this.tall
    if (this.phase === 'win') return { center: new Vector3(0, 2.4, -3.4), half: tall ? new Vector3(4.2, 2.6, 3) : new Vector3(6, 2.6, 2.6), yaw: 0, pitch: 12 }
    return { center: new Vector3(0, 1.6, -1.8), half: tall ? new Vector3(RINK.x + 0.4, 1.2, 7.4) : new Vector3(RINK.x + 1.8, 1.2, 7.6), yaw: 0, pitch: 19 }
  }

  // ---------------------------------------------------------------- her finger

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.finger = { x, y }
    this.pending = { x, y, id }
    this.samples = []
    if (this.phase === 'intro') {
      // A touch skips the skating out.
      for (const s of [this.maple, ...this.mates]) {
        ;[s.x, s.z] = s === this.maple ? [MAPLE_START.x, MAPLE_START.z] : s.spot
      }
      this.startRound()
      this.pending = null
    }
  }
  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    if (!held) return
    this.lastTouch = this.time
    this.finger = { x, y }
    const g = this.groundAt(x, y, tmp)
    if (g) {
      this.samples.push({ t: this.time, x: g.x, z: g.z })
      while (this.samples.length > 2 && this.time - this.samples[0].t > 0.35) this.samples.shift()
    }
    if (this.pending && Math.hypot(x - this.pending.x, y - this.pending.y) > 12) {
      this.pending = null
      if (this.phase === 'play' && this.p.state === 'held' && this.p.by === this.maple) {
        this.control = true
        this.counts.drags++
      }
    }
  }
  pointerUp() {
    if (this.control) {
      // The flick: how fast her finger moved over its last few hundredths of a second.
      const now = this.time
      const recent = this.samples.filter((s) => now - s.t <= FLICK.window + 0.02)
      if (recent.length >= 2) {
        const a = recent[0]
        const b = recent[recent.length - 1]
        const dt = Math.max(0.016, b.t - a.t)
        const vx = (b.x - a.x) / dt
        const vz = (b.z - a.z) / dt
        const v = Math.hypot(vx, vz)
        this.flick = v
        if (v > FLICK.min) {
          this.counts.flicks++
          this.shoot(vx, vz, clamp(v * FLICK.gain, FLICK.slow, FLICK.fast))
        } else {
          this.maple.vx *= 0.3
          this.maple.vz *= 0.3
        }
      }
      this.goal.set(this.maple.x, 0, this.maple.z)
    }
    this.control = false
    this.finger = null
    this.pending = null
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    if (id && id !== 'maple' && this.poke(id)) return
    if (id === 'maple') {
      this.counts.pokes++
      this.maple.actor.wave()
      meet('beaver')
      if (this.p.state !== 'held') void say(L.party.poke.maple)
      return
    }
    // A tap on the ice (or the net): with the puck, Maple slaps it there.
    const g = this.groundAt(x, y, tmp)
    if (!g || this.phase !== 'play') return
    const p = this.p
    if (p.state === 'held' && p.by === this.maple) {
      if (g.z < this.maple.z - 1) this.shoot(g.x - p.x, g.z - p.z, FLICK.tap)
      else this.goal.set(g.x, 0, g.z)
    } else this.goal.set(g.x, 0, g.z)
  }

  /** Taps on everything else. True if it was one. */
  private poke(id: string) {
    this.counts.pokes++
    const once = (key: string, line: Parameters<typeof say>[0]) => {
      if (this.saidOnce.has(key)) return
      this.saidOnce.add(key)
      void say(line)
    }
    if (id === 'moose') {
      this.moose.actor.hop()
      meet('moose')
      tone(150, 110, 0.5, 0.12, 'sawtooth')
      once('moose', L.party.poke.moose)
      return true
    }
    if (id === 'goalie' || id === 'goose0' || id === 'goose1') {
      const g = id === 'goalie' ? this.goalie : this.geese[+id.slice(-1)]
      g.actor.hop()
      honk()
      meet('canada-goose')
      return true
    }
    if (id === 'stand') {
      this.standT = 0
      sfx.munch()
      this.maple.actor.hop()
      once('stand', L.party.stand)
      return true
    }
    if (id === 'tower') {
      this.towerT = 0
      bong()
      once('tower', L.party.parliament)
      return true
    }
    if (id.startsWith('mate')) {
      const s = this.mates[+id.slice(4)]
      if (!s) return true
      if (s.mate === 'otter') s.actor.spin()
      else if (s.mate === 'owl') s.actor.cheer()
      else s.actor.hop()
      meet(MATE_BOOK[s.mate!])
      if (s.mate === 'loon') for (let i = 0; i < 5; i++) tone(700 + (i % 2) * 140, 820 + (i % 2) * 140, 0.09, 0.05, 'triangle', i * 0.1)
      else sfx.boing()
      if (s.mate && s.actor.voice) once(`mate-${s.mate}`, L.party.poke[s.mate as keyof typeof L.party.poke])
      return true
    }
    if (id.startsWith('skater')) {
      const s = this.nearSkaters()[+id.slice(6)]
      if (s) s.spinT = 0
      sounds.whoosh()
      once('canal', L.party.canal)
      return true
    }
    if (id.startsWith('lamp')) {
      const l = this.canal.lamps[+id.slice(4)]
      if (l) l.t = 0
      chime()
      return true
    }
    return false
  }

  /** The three skaters nearest the rink (they get the tap targets). */
  private nearSkaters() {
    return [...this.canal.skaters].sort((a, b) => b.root.position.z - a.root.position.z).slice(0, 3)
  }

  placeAnchors() {
    const near = this.nearSkaters()
    for (const [id, el] of this.anchorEls) {
      let at: Vector3 | null = null
      let h = 1
      let k = 1.1
      if (id === 'maple') {
        at = tmp.set(this.maple.x, 0, this.maple.z)
        h = 1.25
        k = 1.4
      } else if (id === 'moose') {
        at = tmp.set(this.moose.x, 0, this.moose.z)
        h = 2
        k = 0.8
      } else if (id === 'goalie') {
        at = tmp.set(this.goalie.x, 0, this.goalie.z)
        h = 1.2
      } else if (id === 'goose0' || id === 'goose1') {
        const g = this.geese[+id.slice(-1)]
        at = g.actor.root.visible ? tmp.set(g.x, 0, g.z) : null
        h = 1.1
      } else if (id === 'stand') {
        at = tmp.set(...this.canal.stand.at)
        h = 2.4
        k = 0.8
      } else if (id === 'tower') {
        at = tmp.set(this.canal.tower[0], this.canal.tower[1] - 6, this.canal.tower[2])
        h = 12
        k = 0.4
      } else if (id.startsWith('mate')) {
        const s = this.mates[+id.slice(4)]
        at = s ? tmp.set(s.x, s.y, s.z) : null
        h = s ? MATE_H[s.mate!] : 1
      } else if (id.startsWith('skater')) {
        const s = near[+id.slice(6)]
        at = s ? tmp.copy(s.root.position) : null
        h = 2
        k = 0.8
      } else if (id.startsWith('lamp')) {
        const l = this.canal.lamps[+id.slice(4)]
        at = l ? tmp.set(l.at[0], l.at[1] + 3, l.at[2]) : null
        h = 1.2
        k = 1
      }
      this.placeAnchor(el, at ? at.clone() : null, h, k)
      // Maple's target sits on top (so a drag that starts on her always grabs her); the far things below the rest.
      el.style.zIndex = id === 'maple' ? '4' : id === 'tower' || id.startsWith('skater') || id.startsWith('lamp') ? '0' : '2'
    }
  }

  qa() {
    const scr = (x: number, y: number, z: number) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(tmp.set(x, y, z)))
    const p = this.p
    return {
      phase: this.phase,
      score: this.score,
      puck: { state: p.state, ...scr(p.x, 0.1, p.z) },
      /** QA flicks from `puck` toward `net`. */
      net: scr(0, 0.5, RINK.zG),
      maple: scr(this.maple.x, 0.6, this.maple.z),
      team: this.mates.map((s) => s.mate),
      geese: this.geese.filter((g) => g.actor.root.visible).length,
      streak: this.streak,
      ...this.counts,
    }
  }

  dispose() {
    this.unwatch()
    super.dispose()
  }
}

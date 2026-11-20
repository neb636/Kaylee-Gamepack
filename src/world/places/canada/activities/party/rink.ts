// Pond Hockey on the frozen Rideau Canal, in the evening: the big game of Maple's Team (planning/around-the-world/
// canada.md), Maple's team against Gus's geese for the Maple Cup. Seen from a low camera behind her own net, looking up
// the ice at the geese's.
//
// The toy (core verb): flick the puck. Maple skates wherever her finger drags her, the puck on her stick, and a quick
// flick slaps it that way (a tap on the ice or the net slaps it there too). It slides, bounces off the snowbanks, and
// the team does the rest, each friend doing what they're good at, as play (players.ts builds them):
//   Monty fills her net: a goose's shot bonks off his antlers.     Tuque on defence: a shot boings off his tummy.
//   Roxy steals the puck off a rushing goose in a blink, and passes. Ollie spins on her back to a loose puck, fastest.
//   Misty's slap shot knocks the goose wall flat (the last goal).   Lulu sings at the boards when a goal goes in.
//   Roxy's kits cheer on the snowbank.
// A real contest she always wins (AGENTS.md rule 3): after each of her goals the geese take the faceoff and rush her
// net (she can drag Maple into the goose to steal it; her friends stop it if she doesn't). The geese may score once in
// a while (at most two, never two in a row, never after she has missed twice), short and funny, and the puck is hers
// again at once. Deepens: 1 an open net with a sleepy goose in it, 2 two geese skate back and forth in the way,
// 3 the goose wall (until Misty's slap shot) and the goalie diving. Three goals win: a short cheer, then `win`.
import { CanvasTexture, Fog, Group, Mesh, MeshBasicMaterial, SRGBColorSpace, TorusGeometry, Vector3, type WebGLRenderer } from 'three'
import { burst, clamp, say, spendHint, wobble, type Line } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { sfx, tone } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import type { Shot } from '../../../../engine3d/camera'
import { merge, P, solid } from '../../../../engine3d/geo'
import { Particles } from '../../../../engine3d/particles'
import { PAL } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { meet } from '../../book/met'
import { Lulu } from '../../characters/lulu'
import { L } from '../../lines'
import { TEAM, type ChapterId } from '../../story/chapters'
import { storySfx as story } from '../../story/sounds'
import { Base3D, ease, turn } from './base'
import { buildCanal, RINK, type Canal } from './canal'
import { makePlayer, type Player, type Who } from './players'
import { GOALS } from './sections'
import { partySfx as party } from './sounds'
import { makeFlag } from './taffy'
import { Friend } from '../../story/cast'

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
const RUSH = knobs('hockeyRush', 'The geese rush her net', FILE, {
  speed: { value: 2.4, min: 0.8, max: 6, step: 0.1, label: 'Rush speed', unit: 'm/s', note: 'how fast Gus skates at her net with the puck (time for her to catch him)' },
  shot: { value: 8, min: 3, max: 16, step: 0.5, label: 'Their shot', unit: 'm/s' },
  steal: { value: 0.95, min: 0.4, max: 2, step: 0.05, label: 'Maple steals within', unit: 'm', note: 'how close she must skate to the goose with the puck' },
  goal: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'A goose goal', note: 'the chance the last rush goes in (never more than two, never two in a row, never after two misses)' },
})
const SKATE = knobs('hockeySkate', 'Maple skating with the puck', FILE, {
  speed: { value: 6, min: 1, max: 14, step: 0.25, label: 'Top speed', unit: 'm/s' },
  follow: { value: 6, min: 1, max: 20, step: 0.5, label: 'Follows her finger', unit: '/s', note: 'her speed = this × how far her finger is ahead' },
  ahead: { value: 0.8, min: 0, max: 3, step: 0.1, label: 'Skates below her finger', unit: 'm', note: 'Maple stays this far behind her fingertip, so the finger doesn’t hide her' },
})

export interface RinkStart {
  /** Goals already scored. */
  score: number
  /** Who's on the team (the chapters whose friends came). */
  team: ChapterId[]
}
export interface RinkEvents {
  /** A round begins: no goals, one, or two. */
  round(score: number): void
  goal(score: number): void
  /** The geese scored (their goals so far). */
  against(n: number): void
  /** Stuck: the hand shows a flick. */
  hint(): void
  /** The cheering's done: the Cup. */
  win(): void
}

/** The friends who skate (and each one's tap target). */
const MATES = ['tuque', 'roxy', 'ollie', 'misty'] as const
type Mate = (typeof MATES)[number]
type Talent = 'roxy' | 'tuque' | 'monty' | 'ollie' | 'misty' | 'lulu'
/** How long a friend's first big moment is lit up (s). */
const STAR_S = 1.6
/** The row under the top bar the prompt keeps on taller screens (Finale.tsx puts it there), px. */
export const PROMPT_ROW = 64
/** What stops a goose's shot (or doesn't). */
type Stop = 'roxy' | 'tuque' | 'monty' | 'post' | 'goal'

export const RINK_ANCHORS: AnchorInfo[] = [
  { id: 'maple', label: 'Maple: drag her, flick the puck', kind: 'thing' },
  { id: 'monty', label: 'Monty the moose in goal', kind: 'thing' },
  { id: 'tuque', label: 'Tuque the snowman', kind: 'thing' },
  { id: 'roxy', label: 'Roxy the raccoon', kind: 'thing' },
  { id: 'ollie', label: 'Ollie the sea otter', kind: 'thing' },
  { id: 'misty', label: 'Misty the spirit bear', kind: 'thing' },
  { id: 'lulu', label: 'Lulu the loon', kind: 'thing' },
  ...[0, 1, 2].map((i) => ({ id: `kit${i}`, label: 'One of Roxy’s kits', kind: 'thing' as const })),
  { id: 'gus', label: 'Gus, the captain of the geese', kind: 'thing' },
  ...[0, 1, 2, 3, 4].map((i) => ({ id: `goose${i}`, label: i ? 'A Canada goose' : 'The goose in goal', kind: 'thing' as const })),
  { id: 'stand', label: 'The BeaverTails stand', kind: 'thing' },
  { id: 'tower', label: 'Parliament’s clock tower', kind: 'thing' },
  ...[0, 1, 2].map((i) => ({ id: `skater${i}`, label: 'A skater on the canal', kind: 'thing' as const })),
  ...[2, 3, 4, 5].map((i) => ({ id: `lamp${i}`, label: 'A lamp', kind: 'thing' as const })),
]

const MAPLE_START = new Vector3(0, 0, 1.5)
/** Where each friend skates its lazy loops (her half, out of the shooting lane). */
const SPOT: Record<Mate, [number, number]> = { tuque: [-2.3, 4.3], roxy: [2.9, 0.9], ollie: [-3.1, 0.5], misty: [2.7, -1.9] }
/** The geese loitering by their net in the first round (out of her shooting lane), and where they stand in the wall. */
const GEESE_IDLE: [number, number][] = [[0, RINK.zG + 0.5], [-7, -5.4], [7, -3.2], [3.7, -6.4], [-3.9, -7.2]]
const GUS_IDLE: [number, number] = [-3.6, -5.2]
const WALL_Z = RINK.zG + 1.7
/** The faceoff dot. */
const MID = (RINK.zG + RINK.zH) / 2
/** Everyone in a bunch for the cheer at the end. */
const WIN_AT: Record<string, [number, number]> = { maple: [0, -0.4], monty: [2.2, -2.6], tuque: [-2.2, -2.2], roxy: [1.2, -1.2], ollie: [-1.2, -1.1], misty: [0.2, -2.8] }
const PUCK_R = 0.34
const GOOSE_R = 0.55
const HINT_S = 8
const SKY = ['#6F6AB8', '#E7A6C8', '#FFD9B8'] as const

type Phase = 'play' | 'goal' | 'against' | 'win'

const tmp = new Vector3()
const tmp2 = new Vector3()
const dist = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z)

export class RinkWorld extends Base3D implements World3D {
  private canal: Canal
  private phase: Phase = 'play'
  private phaseT = 0
  private score: number
  private against = 0
  private lastAgainst = false
  private maple: Player
  private monty: Player | null = null
  private mates: Partial<Record<Mate, Player>> = {}
  private lulu: Player | null = null
  private kits: Player[] = []
  private gus: Player
  /** 0 is in goal; 1 and 2 skate in the way from the second goal; all of them (with Gus) make the wall. */
  private geese: Player[] = []
  private puck = new Group()
  private puckRing: Mesh
  private p = {
    x: 0,
    z: 0,
    y: 0,
    vx: 0,
    vz: 0,
    vy: 0,
    state: 'held' as 'held' | 'free' | 'net',
    by: null as Player | null,
    /** What it's doing: her shot at the geese's net, a goose's shot at hers, a pass to Maple (or a goose), loose. */
    kind: 'loose' as 'shot' | 'goose' | 'pass' | 'loose',
    /** A pass meant for this one. */
    to: null as Player | null,
    /** What stops a goose's shot. */
    stop: 'post' as Stop,
    tries: false,
    stillT: 0,
    freeT: 0,
    spin: 0,
  }
  /** The geese's rush at her net: who has the puck, who skates beside him, what stops each shot (in order). */
  private rush: { carrier: Player; wing: Player; plan: Stop[]; t: number; side: number; shot: number } | null = null
  /** The last goal's goose wall: none yet, standing, or knocked flat by Misty. */
  private wall: 'none' | 'up' | 'down' = 'none'
  private chase = 0
  private streak = 0
  private dive = 0
  private diveV = 0
  private finger: { x: number; y: number } | null = null
  private pending: { x: number; y: number } | null = null
  private control = false
  private samples: { t: number; x: number; z: number }[] = []
  private goal = new Vector3()
  private hinted = false
  private roundLine: Line | null = null
  private confetti: Particles
  private snow: Particles
  private sparks: Particles
  private fireT = 0
  private standT = -1
  private callT = -1
  private saidOnce = new Set<string>()
  private shown = new Set<Talent>()
  /** A friend's first big moment, lit up (`t`: seconds into it). */
  private star: { who: Player; t: number } | null = null
  private starRing: Mesh
  /** On a short screen: where along the ice the camera looks (it slides with the play). */
  private camZ: number | null = null
  private talkQ: Promise<void> = Promise.resolve()
  private dead = false
  private stopBed: () => void
  private unwatch: () => void
  private flick = 0
  private counts = { drags: 0, shots: 0, flicks: 0, taps: 0, pokes: 0, saves: 0, goals: 0, bounces: 0, passes: 0, rushes: 0, steals: 0 }

  constructor(
    renderer: WebGLRenderer,
    start: RinkStart,
    private events: RinkEvents,
  ) {
    super(renderer, 0)
    const { scene, bag } = this
    // The evening: a rosy dusk behind Parliament (the films' canal, story/sets/rink.ts RINK_EVENING), lamps lit.
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 256
    const g2 = c.getContext('2d')!
    const grad = g2.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0, SKY[0])
    grad.addColorStop(0.55, SKY[1])
    grad.addColorStop(1, SKY[2])
    g2.fillStyle = grad
    g2.fillRect(0, 0, 4, 256)
    const sky = bag.add(new CanvasTexture(c))
    sky.colorSpace = SRGBColorSpace
    scene.background = sky
    scene.fog = new Fog('#F2D8E4', 45, 120)
    this.lights.ambient.color.set('#FFE9E0')
    this.lights.sun.color.set('#FFE9E0')
    this.rig.fov = 44
    this.rig.lag = 0.45
    this.rig.camera.far = 300
    this.canal = buildCanal(bag)
    scene.add(this.canal.root)
    this.score = Math.min(GOALS - 1, start.score)

    const who = new Set(start.team.map((ch) => TEAM[ch].who))
    const mk = (w: Who, i = 0) => makePlayer(bag, scene, w, i)
    this.maple = mk('maple')
    if (who.has('monty')) {
      this.monty = mk('monty')
      ;[this.monty.x, this.monty.z] = [0, RINK.zH - 0.6]
    }
    for (const m of MATES) {
      if (!who.has(m)) continue
      const s = mk(m)
      s.spot = SPOT[m]
      ;[s.x, s.z] = s.spot
      this.mates[m] = s
    }
    if (who.has('lulu')) {
      // On the snowbank at the boards, where she can see the whole ice.
      const l = mk('lulu')
      ;[l.x, l.y, l.z, l.yaw] = [-6.05, 0.4, 0.4, 1.05]
      this.lulu = l
    }
    if (who.has('roxy')) {
      // Her kits on the far snowbank, each with a tiny pink flag.
      this.kits = [0, 1, 2].map((i) => {
        const k = mk('kit', i)
        ;[k.x, k.y, k.z, k.yaw] = [6.05 + (i % 2) * 0.15, 0.38, 1.2 + i * 0.75, -1.0]
        if (k.p instanceof Friend) k.p.rig.armR.add(makeFlag(k.height, bag))
        return k
      })
    }
    this.gus = mk('gus')
    ;[this.gus.x, this.gus.z] = GUS_IDLE
    this.gus.yaw = 0
    this.gus.spot = GUS_IDLE
    for (let i = 0; i < 5; i++) {
      const g = mk('goose', i)
      ;[g.x, g.z] = GEESE_IDLE[i]
      g.spot = GEESE_IDLE[i]
      g.yaw = 0
      g.root.visible = i === 0 || i >= 3 || this.score >= 1
      this.geese.push(g)
    }

    // The puck (a bit big, like a toy, with a pink ring under it so she always sees it).
    this.puck.add(solid(merge([P.cyl(PUCK_R, PUCK_R, 0.13, '#2B2330', { at: [0, 0.065, 0] }, 20), P.cyl(PUCK_R * 0.6, PUCK_R * 0.6, 0.012, '#5A5470', { at: [0, 0.135, 0] }, 16)]), bag, 2))
    scene.add(this.puck)
    const ringMat = bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0.8, depthWrite: false }))
    this.puckRing = new Mesh(bag.add(new TorusGeometry(PUCK_R * 1.8, 0.07, 6, 28)), ringMat)
    this.puckRing.rotation.x = -Math.PI / 2
    this.puckRing.position.y = 0.02
    this.puckRing.renderOrder = 3
    scene.add(this.puckRing)
    this.starRing = new Mesh(bag.add(new TorusGeometry(1, 0.08, 6, 36)), bag.add(new MeshBasicMaterial({ color: PAL.butter, transparent: true, opacity: 0, depthWrite: false })))
    this.starRing.rotation.x = -Math.PI / 2
    this.starRing.renderOrder = 3
    this.starRing.visible = false
    scene.add(this.starRing)

    this.confetti = new Particles({ kind: 'spray', count: 320, colors: [PAL.hotpink, PAL.butter, PAL.mint, PAL.sky, '#E8443F', PAL.lavender], gravity: 3 }, bag)
    this.snow = new Particles({ kind: 'spray', count: 260, color: '#FFFFFF', gravity: 0.3 }, bag)
    this.sparks = new Particles({ kind: 'spray', count: 160, color: '#FFFFFF', gravity: 6 }, bag)
    scene.add(this.confetti.mesh, this.snow.mesh, this.sparks.mesh)
    for (let i = 0; i < 140; i++) this.dropFlake(Math.random() * 12)

    this.stopBed = party.bed()
    this.startRound()
    this.rig.setShot(this.shot(), true)

    this.unwatch = watch('hockey', () => ({
      'her finger (m/s)': [this.flick, 20],
      'puck speed (m/s)': [Math.hypot(this.p.vx, this.p.vz), 20],
      'misses in a row': [this.streak, 4],
    }))
  }

  // ---------------------------------------------------------------- talking

  /** Says a line after whatever is being said now (dropped if it's stale by then). */
  private talk(line: Line, fresh = 4) {
    const at = this.time
    this.talkQ = this.talkQ.then(() => (this.dead || this.time - at > fresh ? undefined : say(line)))
  }
  /** A friend's big moment: their line the first time, and they turn round to show off. */
  private talent(t: Talent, s: Player | null, line: Line | null) {
    if (s) s.showOff()
    if (this.shown.has(t)) return
    this.shown.add(t)
    // The first time: a ring of light round them, sparkles, and the camera pushes in for a moment.
    if (s) this.star = { who: s, t: 0 }
    if (line) this.talk(line, 2.5)
  }

  // ---------------------------------------------------------------- the game

  /** Maple has the puck on her stick. */
  private holdPuck(by: Player = this.maple) {
    const p = this.p
    p.state = 'held'
    p.by = by
    p.vx = p.vz = p.vy = 0
    p.y = 0
    p.kind = 'loose'
    p.to = null
    if (by !== this.maple) return
    this.rush = null
    this.chase = 0
    for (const s of this.matesList()) if (s.task !== 'idle') s.task = 'idle'
    if (this.roundLine) {
      this.talk(this.roundLine, 6)
      this.roundLine = null
    }
    if (this.score === GOALS - 1 && this.mates.misty && this.wall === 'none' && this.phase === 'play') this.wallUp()
  }

  private matesList() {
    return MATES.map((m) => this.mates[m]).filter((s): s is Player => !!s)
  }

  /** The faceoff for the next goal: hers in the first round, the geese's after each of her goals (they rush). */
  private startRound() {
    this.phase = 'play'
    this.phaseT = 0
    this.streak = 0
    this.hinted = false
    this.maple.x = MAPLE_START.x
    this.maple.z = MAPLE_START.z
    this.maple.vx = this.maple.vz = 0
    this.goal.copy(MAPLE_START)
    this.goalie().x = 0
    this.geese.forEach((g, i) => {
      if (i >= 1 && i <= 2 && this.score >= 1 && !g.root.visible) {
        g.root.visible = true
        g.x = (i === 2 ? 1 : -1) * 7
        g.hop()
      }
    })
    for (const s of [...this.matesList(), this.gus, ...this.geese]) {
      if (s.task !== 'down') s.task = 'idle'
      if (s !== this.goalie() && s.spot) [s.x, s.z] = s.spot
    }
    this.events.round(this.score)
    if (this.score === 0) {
      this.holdPuck()
      this.talk(L.party.rink)
      return
    }
    this.roundLine = this.score === 1 ? L.party.geese : L.party.last
    this.startRush()
  }

  /** The geese take the faceoff and rush her net. */
  private startRush() {
    const gus = this.gus
    const wing = this.geese[3]
    const side = Math.random() < 0.5 ? -1 : 1
    let plan: Stop[]
    if (this.score === 1) plan = this.mates.roxy ? ['roxy'] : [this.defend()]
    else {
      const big = [this.mates.tuque ? 'tuque' : null, this.monty ? 'monty' : null].filter((s): s is Stop => !!s)
      plan = this.mayScore() ? ['goal'] : big.length ? big : this.mates.roxy ? ['roxy'] : ['post']
    }
    this.counts.rushes++
    gus.x = 0
    gus.z = MID - 0.4
    gus.yaw = 0
    wing.x = -side * 1.4
    wing.z = MID - 1.2
    wing.yaw = 0
    this.maple.x = 0
    this.maple.z = MID + 2.6
    this.goal.set(this.maple.x, 0, this.maple.z)
    this.holdPuck(gus)
    this.rush = { carrier: gus, wing, plan, t: 0, side, shot: 0 }
    gus.cheer()
    story.honks()
  }

  /** Can the geese score on this rush? At most two, never two in a row, not after she has missed twice. */
  private mayScore() {
    return this.against < 2 && !this.lastAgainst && this.streak < 2 && Math.random() < RUSH.goal * (this.streak ? 0.5 : 1)
  }
  /** Who stops a goose's shot this time: a friend who hasn't shown it yet first. */
  private defend(): Stop {
    const can: Stop[] = []
    if (this.mates.tuque) can.push('tuque')
    if (this.monty) can.push('monty')
    const fresh = can.filter((c) => !this.shown.has(c as Talent))
    return fresh[0] ?? can[Math.floor(Math.random() * can.length)] ?? 'post'
  }

  private goalie() {
    return this.geese[0]
  }

  /** A slap shot toward (dx, dz) at `speed`. */
  private shoot(dx: number, dz: number, speed: number) {
    const p = this.p
    if (p.state !== 'held' || p.by !== this.maple || this.phase !== 'play') return
    let a = Math.atan2(dx, dz)
    // Aim help: a shot roughly at the net turns toward it (more after misses, all of it once the wall is down).
    const toNet = Math.atan2(0 - p.x, RINK.zG - 0.4 - p.z)
    const d = Math.atan2(Math.sin(toNet - a), Math.cos(toNet - a))
    const open = this.wall === 'down'
    const help = open ? 1 : clamp(FLICK.aim + this.streak * 0.2, 0, 1)
    if (Math.abs(d) < (FLICK.cone * Math.PI) / 180 + this.streak * 0.15 + (open ? 0.6 : 0)) a += d * help
    p.state = 'free'
    p.by = null
    p.vx = Math.sin(a) * speed
    p.vz = Math.cos(a) * speed
    p.kind = 'shot'
    p.freeT = 0
    p.stillT = 0
    // Does the goose go for this one? Less and less after each miss; half as often for the first goal; never once
    // it's been knocked flat.
    p.tries = !open && Math.random() < GOALIE.save * (this.score === 0 ? 0.5 : 1) * Math.max(0, 1 - this.streak * GOALIE.ease)
    this.counts.shots++
    this.maple.slap()
    this.maple.yaw = a
    story.slap()
    this.sparks.burst(p.x, 0.1, p.z, 8, 2, 1.5, 0.08)
  }

  /** A goose shoots at her net; `stop` says what stops it. */
  private gooseShoot(from: Player, stop: Stop) {
    const p = this.p
    const side = this.rush?.side ?? 1
    let tx = 0
    let tz = RINK.zH
    const tq = this.mates.tuque
    if (stop === 'tuque' && tq) [tx, tz] = [tq.x, tq.z + 0.6]
    else if (stop === 'monty' && this.monty) tx = side * 0.55
    else if (stop === 'post') tx = side * RINK.netHalf
    else if (stop === 'goal') tx = -side * 0.15
    const d = Math.hypot(tx - p.x, tz - p.z) || 1
    p.state = 'free'
    p.by = null
    p.vx = ((tx - p.x) / d) * RUSH.shot
    p.vz = ((tz - p.z) / d) * RUSH.shot
    p.kind = 'goose'
    p.stop = stop
    p.freeT = 0
    p.stillT = 0
    from.slap()
    story.slap()
    story.honk()
  }

  /** A pass along the ice to `to` (Maple, or a goose). */
  private passTo(from: Player, to: Player, speed = 0) {
    const p = this.p
    p.state = 'free'
    p.by = null
    const tx = to.x + Math.sin(to.yaw) * 0.6
    const tz = to.z + Math.cos(to.yaw) * 0.6
    const d = Math.hypot(tx - p.x, tz - p.z) || 1
    const sp = speed || clamp(d * 1.6, 4, 9)
    p.vx = ((tx - p.x) / d) * sp
    p.vz = ((tz - p.z) / d) * sp
    p.kind = 'pass'
    p.to = to
    p.freeT = 0
    from.slap()
    this.counts.passes++
    tone(1600, 1200, 0.05, 0.06, 'triangle')
  }

  /** The geese line up across their net (the last goal): only Misty's slap shot gets through. */
  private wallUp() {
    this.wall = 'up'
    for (const g of [this.gus, ...this.geese.slice(1)]) {
      g.root.visible = true
      g.task = 'block'
    }
    story.honks()
    this.talk(L.party.wall, 5)
  }

  private dropFlake(age: number) {
    this.snow.emit((Math.random() - 0.5) * 30, 10 + Math.random() * 5 - age, -6 + (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 0.3, -0.8, 0, 16, 0.07 + Math.random() * 0.06)
  }

  private startWin() {
    this.phase = 'win'
    this.phaseT = 0
    this.fireT = 0
    this.rush = null
    for (const s of this.team()) s.cheer()
    this.talk(L.party.win, 3)
  }

  /** Everybody on her team who's on the ice. */
  private team() {
    return [this.maple, ...(this.monty ? [this.monty] : []), ...this.matesList()]
  }
  private everyone() {
    return [...this.team(), ...(this.lulu ? [this.lulu] : []), ...this.kits, this.gus, ...this.geese]
  }

  get calm() {
    return false
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.phaseT += dt
    const p = this.p
    const m = this.maple

    // ---- Maple: wherever her finger drags her (with the puck, or chasing a goose); else back to her spot.
    if (this.phase === 'play') {
      const holding = p.state === 'held' && p.by === m
      const r = this.rush
      if (this.control && this.finger) {
        const g = this.groundAt(this.finger.x, this.finger.y, tmp)
        if (g) this.goal.set(g.x, 0, g.z + SKATE.ahead)
      } else if (this.chase > 0 && r && p.by === r.carrier) {
        this.chase -= dt
        this.goal.set(r.carrier.x, 0, r.carrier.z + 0.3)
      }
      const active = this.control || holding || this.chase > 0 || Math.hypot(this.goal.x - m.x, this.goal.z - m.z) > 0.3
      if (active) {
        const gx = clamp(this.goal.x, -RINK.x + 0.6, RINK.x - 0.6)
        const gz = clamp(this.goal.z, -3.2, RINK.zH - 1.8)
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
      m.x += m.vx * dt
      m.z += m.vz * dt
      m.vx *= Math.exp(-dt * 3)
      m.vz *= Math.exp(-dt * 3)
      m.x = clamp(m.x, -RINK.x + 0.5, RINK.x - 0.5)
      m.z = clamp(m.z, RINK.zG + 1.5, RINK.zH - 1.5)
    }

    this.updateRush(dt)
    this.updatePuck(dt)
    this.updateGoalie(dt)
    this.updateGeese(dt, t)
    this.updateMates(dt, t)

    // Monty sways in his goal, chewing, a step toward the puck.
    const mo = this.monty
    if (mo && this.phase !== 'win') {
      mo.x += (clamp(p.x * 0.3, -0.7, 0.7) - mo.x) * ease(dt, p.kind === 'goose' ? 6 : 2)
      mo.z = RINK.zH - 0.6
    }
    // Lulu sings when a goal goes in.
    if (this.lulu?.p instanceof Lulu) {
      if (this.callT >= 0 && (this.callT += dt) > 1.8) this.callT = -1
      this.lulu.p.calling = this.callT >= 0 ? Math.min(1, this.callT * 4, (1.8 - this.callT) * 3) : 0
    }
    // The kits bounce on the snowbank, now and then, and wave their flags at every goal.
    for (const k of this.kits) if (Math.random() < dt * (this.phase === 'goal' || this.phase === 'win' ? 3 : 0.25)) k.hop()

    // Stuck with the puck: the hand shows a flick to the net, and Sparkle says how once.
    const idle = this.phase === 'play' && p.state === 'held' && p.by === m && !this.control && t - Math.max(this.lastTouch, t - this.phaseT) > HINT_S
    if (idle && !this.hinted) {
      this.hinted = true
      this.events.hint()
      if (spendHint(L.party.rinkHint)) this.talk(L.party.rinkHint)
    }
    this.drawHint(idle ? tmp.set(p.x, 0.2, p.z) : null, idle ? tmp2.set(0, 0.4, RINK.zG + 0.5) : undefined)

    if (this.phase === 'goal' && this.phaseT > 3) this.startRound()
    if (this.phase === 'against' && this.phaseT > 2.6) {
      // The puck is hers again, at center ice.
      this.phase = 'play'
      this.phaseT = 0
      this.maple.x = 0
      this.maple.z = MID + 1.6
      this.goal.set(0, 0, this.maple.z)
      for (const g of [this.gus, ...this.geese]) if (g !== this.goalie()) [g.x, g.z] = g.spot
      this.holdPuck()
    }
    if (this.phase === 'win') {
      // Fireworks over the canal, everyone hopping round Maple.
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
      }
      for (const s of this.team()) {
        const at = WIN_AT[s.who] ?? [0, 0]
        this.skateTo(s, at[0], at[1], 4, dt)
        if (!s.busy && Math.random() < dt * 1.2) s.cheer()
      }
      if (this.phaseT > 4.6 && this.phaseT - dt <= 4.6) this.events.win()
    }

    // ---- Things round the canal: the lamps are lit (a tap makes one flare), the skaters go round.
    for (const l of this.canal.lamps) {
      if (l.t >= 0 && (l.t += dt) > 1.2) l.t = -1
      const k = l.t >= 0 ? 1 - l.t / 1.2 : 0
      l.mat.color.setRGB(1, 0.86 + k * 0.1, 0.55 + k * 0.35)
      l.glow.scale.setScalar(1.3 + k * 0.5 + (l.t >= 0 ? wobble(l.t / 1.2, 3) * 0.2 : 0))
    }
    for (const s of this.canal.skaters) {
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

    // Snow falls all the time.
    if (Math.random() < dt * 24) this.dropFlake(0)
    this.confetti.update(dt)
    this.snow.update(dt)
    this.sparks.update(dt)

    this.place(dt, t)
    this.updateStar(dt)
    this.lights.follow(0, 0, -1)
    this.lights.ambient.intensity *= 0.92
    this.lights.sun.intensity *= 0.85
    this.rig.setShot(this.shot())
    this.rig.update(dt)
  }

  /** Turns its speed toward a spot, at most `top` m/s, easing off as it gets there. */
  private steer(s: Player, x: number, z: number, top: number, dt: number) {
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
  private skateTo(s: Player, x: number, z: number, top: number, dt: number) {
    this.steer(s, x, z, top, dt)
    s.x += s.vx * dt
    s.z += s.vz * dt
  }

  // ---------------------------------------------------------------- the geese's rush

  private updateRush(dt: number) {
    const r = this.rush
    const p = this.p
    if (!r || this.phase !== 'play') return
    r.t += dt
    const c = r.carrier
    const stop = r.plan[0]
    const has = p.state === 'held' && p.by === c
    // Gus shows off a moment at the faceoff, then skates round Maple at her net, his wing goose beside him.
    if (has) {
      const side = Math.abs(this.maple.x) > 0.6 ? -Math.sign(this.maple.x) : r.side
      r.side = side
      if (r.t > 0.8) this.skateTo(c, side * 2.2, 1.9, RUSH.speed * (this.streak >= 2 ? 0.75 : 1), dt)
      // Her steal: Maple skates into him.
      if (dist(this.maple, c) < RUSH.steal) {
        c.spin()
        story.honk()
        party.steal()
        this.counts.steals++
        this.sparks.burst(c.x, 0.4, c.z, 10, 2, 2, 0.1)
        if (!this.saidOnce.has('steal')) {
          this.saidOnce.add('steal')
          this.talk(L.party.steal, 2)
        }
        this.holdPuck()
        return
      }
      // Roxy: in a blink, the puck is hers.
      const roxy = this.mates.roxy
      if (stop === 'roxy' && roxy && r.t > 1.1 && roxy.task !== 'dash') {
        roxy.task = 'dash'
        roxy.taskT = 0
      }
      // Tuque slides into the lane.
      const tq = this.mates.tuque
      if (stop === 'tuque' && tq) {
        tq.task = 'block'
        const k = (4.4 - 1.9) / (RINK.zH - 1.9)
        this.skateTo(tq, c.x * (1 - k), 4.4, 4, dt)
      }
      // In shooting range: a wind-up and the shot.
      if (stop !== 'roxy' && c.z > 1.6 && r.shot === 0) {
        r.shot = r.t
        c.slap()
      }
      if (r.shot > 0 && r.t - r.shot > 0.3) {
        r.shot = -1
        this.gooseShoot(c, stop)
      }
    }
    // The wing goose skates up beside him (and picks up a rebound off Tuque to shoot again at Monty).
    const w = r.wing
    if (p.state === 'held' && p.by === w) {
      w.taskT += dt
      w.vx *= Math.exp(-dt * 5)
      w.vz *= Math.exp(-dt * 5)
      w.yaw = turn(w.yaw, Math.atan2(-w.x, RINK.zH - w.z), ease(dt, 8))
      if (w.taskT > 0.4) this.gooseShoot(w, r.plan[0])
    } else if (p.kind !== 'pass' || p.to !== w) this.skateTo(w, -r.side * 1.7, Math.min(2.6, c.z + 0.6), RUSH.speed * 1.1, dt)
  }

  // ---------------------------------------------------------------- the puck

  private updatePuck(dt: number) {
    const p = this.p
    if (p.state === 'held' && p.by) {
      // On the stick, out in front and to the right.
      const s = p.by
      const reach = s === this.maple ? 0.7 : 0.55 * (s.height / 1.1)
      p.x = s.x + Math.sin(s.yaw) * reach + Math.cos(s.yaw) * 0.25
      p.z = s.z + Math.cos(s.yaw) * reach - Math.sin(s.yaw) * 0.25
      p.y = 0
      return
    }
    if (p.state === 'net') {
      p.vx *= Math.exp(-dt * 6)
      p.vz *= Math.exp(-dt * 6)
      p.x += p.vx * dt
      p.z += p.vz * dt
      p.z = p.z < 0 ? Math.max(p.z, RINK.zG - 0.8) : Math.min(p.z, RINK.zH + 0.8)
      p.y = Math.max(0, p.y + p.vy * dt)
      p.vy -= 12 * dt
      return
    }
    // Sliding (and once in a while flying: off Monty's antlers).
    p.freeT += dt
    const k = Math.exp(-PUCK.friction * dt)
    p.vx *= k
    p.vz *= k
    p.x += p.vx * dt
    p.z += p.vz * dt
    if (p.y > 0 || p.vy > 0) {
      p.vy -= 14 * dt
      p.y += p.vy * dt
      if (p.y <= 0) {
        p.y = 0
        p.vy = 0
        story.thump()
        this.sparks.burst(p.x, 0.1, p.z, 6, 1.4, 1.6, 0.08)
      }
    }
    p.spin += Math.hypot(p.vx, p.vz) * dt * 3
    // The snowbanks along the sides.
    if (Math.abs(p.x) > RINK.x - PUCK_R) {
      p.x = Math.sign(p.x) * (RINK.x - PUCK_R)
      p.vx = -p.vx * PUCK.bounce
      p.vz *= PUCK.bounce
      this.thud(p.x, p.z)
    }

    // ---- Her shot at the geese's end: the wall, the goalie, the net.
    if (p.kind === 'shot') {
      if (this.wall === 'up' && p.z < WALL_Z + 0.5 && p.vz < 0 && Math.abs(p.x) < 2.3) {
        // Off the goose wall: honk, and the puck pops back out (Misty will take it from here).
        p.z = WALL_Z + 0.5
        p.vz = Math.abs(p.vz) * 0.35 + 1.2
        p.vx = (Math.random() - 0.5) * 2
        p.kind = 'loose'
        for (const g of this.wallGeese()) if (Math.abs(g.x - p.x) < 1) g.hop()
        story.honks()
        this.missed()
        return
      }
      if (p.z < RINK.zG + 0.2) {
        const inMouth = Math.abs(p.x) < RINK.netHalf - PUCK_R * 0.5
        const g = this.goalie()
        if (p.tries && g.up && Math.abs(p.x - g.x) < GOALIE.reach + PUCK_R && inMouth && p.vz < 0) {
          this.save()
          return
        }
        if (inMouth && p.z < RINK.zG - 0.3 && p.vz < 0) {
          this.scoreGoal()
          return
        }
      }
    }
    if (p.z < RINK.zG - 1.3) {
      p.z = RINK.zG - 1.3
      p.vz = Math.abs(p.vz) * PUCK.bounce
      this.thud(p.x, p.z)
    }

    // ---- A goose's shot at her net: what stops it (Tuque's tummy, Monty's antlers, the post), or a goose goal.
    if (p.kind === 'goose') {
      const m = this.maple
      if (dist(p, { x: m.x + Math.sin(m.yaw) * 0.6, z: m.z + Math.cos(m.yaw) * 0.6 }) < 0.7) {
        // Maple's in the way: hers.
        this.counts.steals++
        this.holdPuck()
        story.thump()
        return
      }
      const tq = this.mates.tuque
      if (p.stop === 'tuque' && tq && dist(p, tq) < 0.75) {
        story.boing()
        tq.p.shake()
        tq.task = 'idle'
        this.sparks.burst(p.x, 0.5, p.z, 12, 2, 2.4, 0.12)
        this.talent('tuque', tq, L.party.tuque)
        this.rebound(tq)
        return
      }
      const mo = this.monty
      if (p.stop === 'monty' && mo && p.z > mo.z - 0.75) {
        // Bonk! Up off his antlers, and down in front of the net.
        story.bonk()
        mo.hop()
        p.z = mo.z - 0.8
        p.vy = 4.5
        p.vz = -3.5
        p.vx = (Math.random() - 0.5) * 3
        this.sparks.burst(mo.x, mo.height * 0.95, mo.z, 12, 2, 2, 0.1)
        this.talent('monty', mo, L.party.monty)
        this.rebound(mo, true)
        return
      }
      if (p.stop === 'goal' && mo && p.z > mo.z - 1.2 && mo.task !== 'down') {
        // Monty hops for it... and it slides right under him.
        mo.task = 'down'
        mo.hop()
      }
      if (p.z > RINK.zH - 0.1) {
        if (p.stop === 'goal' && Math.abs(p.x) < RINK.netHalf - PUCK_R * 0.5) {
          this.gooseGoal()
          return
        }
        // Clang, off the post.
        party.post()
        p.z = RINK.zH - 0.1
        p.vz = -4
        p.vx = -Math.sign(p.x || 1) * 1.5
        p.kind = 'loose'
        this.sparks.burst(p.x, 0.5, p.z, 10, 2, 2, 0.1)
        this.rush = this.rush && { ...this.rush, plan: [] }
        return
      }
    }
    if (p.z > RINK.zH + 1.6) {
      p.z = RINK.zH + 1.6
      p.vz = -Math.abs(p.vz) * PUCK.bounce
    }
    // Pucks behind her net or off a friend come back out toward the ice.
    if (p.kind !== 'goose' && p.z > RINK.zH - 1.0 && p.vz > 0) {
      p.z = RINK.zH - 1.0
      p.vz = -Math.max(2, p.vz * 0.5)
      if (this.monty) this.monty.hop()
      story.bonk()
    }

    // ---- A pass reaching its player sticks to the stick (or a loose puck Maple skates onto).
    const m = this.maple
    const mx = m.x + Math.sin(m.yaw) * 0.7
    const mz = m.z + Math.cos(m.yaw) * 0.7
    if (this.phase === 'play' && p.kind !== 'goose' && (p.to === m || p.freeT > 0.6) && p.y < 0.3 && Math.hypot(p.x - mx, p.z - mz) < PUCK.catch) {
      this.holdPuck()
      story.skid()
      return
    }
    if (p.kind === 'pass' && p.to && p.to !== m && dist(p, p.to) < 0.9) {
      p.to.taskT = 0
      this.holdPuck(p.to)
      return
    }
    // Stopped (or taking ages): someone fetches it.
    const speed = Math.hypot(p.vx, p.vz)
    p.stillT = speed < 0.9 && p.y <= 0 ? p.stillT + dt : 0
    if ((p.stillT > 0.35 || p.freeT > 4.5) && this.phase === 'play' && !this.fetching()) {
      if (p.kind === 'shot') this.missed()
      p.kind = 'loose'
      this.fetch()
    }
  }

  /** A goose's shot was stopped: off to the wing goose for another try, or loose for a friend to fetch. */
  private rebound(off: Player, up = false) {
    const p = this.p
    const r = this.rush
    if (r) r.plan.shift()
    if (r && r.plan.length && !up) {
      // Straight out to his wing goose.
      r.wing.taskT = 0
      this.passTo(off, r.wing, 6)
      return
    }
    if (!up) {
      p.vz = -Math.max(3, Math.abs(p.vz) * 0.4)
      p.vx = (Math.random() - 0.5) * 3
    }
    p.kind = 'loose'
    p.freeT = 0
    if (r) this.rush = null
  }

  private thud(x: number, z: number) {
    this.counts.bounces++
    party.boards()
    this.sparks.burst(x, 0.3, z, 8, 1.6, 2.4, 0.12)
  }

  private fetching() {
    return this.matesList().some((s) => s.task === 'fetch' || s.task === 'carry' || s.task === 'windup') || this.maple.task === 'fetch'
  }

  /** A shot that didn't go in. */
  private missed() {
    this.streak++
  }

  /** The goose saves it: the puck pops back out, or it clears it down the ice at her net. */
  private save() {
    const p = this.p
    this.counts.saves++
    const g = this.goalie()
    g.cheer()
    story.honk()
    this.diveV = Math.sign(p.x - g.x || 1) * 5
    this.missed()
    this.talk(L.party.saved[this.counts.saves % 2], 2)
    const unshown = (this.mates.tuque && !this.shown.has('tuque')) || (this.monty && !this.shown.has('monty'))
    if (unshown || Math.random() < 0.4) {
      // It holds it a moment, then slaps it all the way down the ice (Tuque or Monty will stop it).
      this.holdPuck(g)
      g.task = 'carry'
      g.taskT = 0
      return
    }
    p.vz = Math.abs(p.vz) * 0.45 + 1
    p.vx = (Math.random() - 0.5) * 4
    p.z = RINK.zG + 0.25
    p.kind = 'loose'
    story.thump()
  }

  private scoreGoal() {
    const p = this.p
    p.state = 'net'
    p.vz = -2
    p.vy = 0
    this.score++
    this.streak = 0
    this.counts.goals++
    this.lastAgainst = false
    this.phase = 'goal'
    this.phaseT = 0
    party.horn()
    story.net()
    this.callT = 0
    story.loon()
    if (this.lulu) this.talent('lulu', this.lulu, null)
    if (this.kits.length) party.kits()
    this.canal.netG.position.z = RINK.zG - 0.12
    const g = this.goalie()
    if (g.up) g.flop()
    for (const s of this.wallGeese()) if (s.up && s.root.visible) s.spin()
    for (const s of this.team()) s.cheer()
    for (let i = 0; i < 70; i++) this.confetti.emit((Math.random() - 0.5) * 3, 1 + Math.random(), RINK.zG - 0.5, (Math.random() - 0.5) * 6, 4 + Math.random() * 4, 2 + Math.random() * 3, 2.2, 0.16)
    const s = this.toScreen(tmp.set(0, 1, RINK.zG))
    burst(s.x / this.w, s.y / this.h)
    this.events.goal(this.score)
    if (this.score >= GOALS) {
      this.startWin()
      return
    }
    this.talk(L.party.goal[(this.score - 1) % L.party.goal.length], 2)
    if (this.wall === 'down') for (const w of this.wallGeese()) w.getUp()
  }

  /** The geese score: short and funny (Monty hopped and it slid right under him), then the puck is hers again. */
  private gooseGoal() {
    const p = this.p
    p.state = 'net'
    p.vz = 2
    this.against++
    this.lastAgainst = true
    this.phase = 'against'
    this.phaseT = 0
    this.rush = null
    story.net()
    story.honks()
    this.canal.netH.position.z = RINK.zH + 0.12
    for (const g of [this.gus, ...this.geese]) if (g.root.visible && g.up) g.cheer()
    if (this.monty) {
      this.monty.p.pull('wow')
      this.monty.task = 'idle'
    }
    this.talk(this.monty ? L.party.against[0] : L.party.against[1], 3)
    this.events.against(this.against)
  }

  /** The nearest friend goes and gets a loose puck: Ollie first (on her back, spinning), Misty when the wall's up. */
  private fetch() {
    const p = this.p
    const misty = this.mates.misty
    if (this.wall === 'up' && misty) {
      misty.task = 'fetch'
      misty.taskT = 0
      return
    }
    const s = this.mates.ollie ?? this.mates.roxy ?? null
    if (s) {
      s.task = 'fetch'
      s.taskT = 0
      if (s.who === 'ollie') party.spin()
      return
    }
    // (Nobody to fetch it: Maple goes herself.)
    this.goal.set(p.x, 0, p.z + 0.6)
    this.maple.task = 'fetch'
    this.maple.taskT = 0
  }

  private wallGeese() {
    return [this.gus, ...this.geese.slice(1)]
  }

  private updateGoalie(dt: number) {
    const g = this.goalie()
    const p = this.p
    if (!g.up) return
    // Sleepy for the first goal; quicker later; slower after each miss.
    const speed = GOALIE.speed * (this.score === 0 ? 0.45 : this.score === 1 ? 0.8 : 1.1) * Math.max(0.25, 1 - this.streak * 0.25)
    let want = clamp(p.x * 0.4, -RINK.netHalf + 0.4, RINK.netHalf - 0.4)
    if (p.state === 'free' && p.kind === 'shot' && p.vz < -0.5) {
      const tHit = (RINK.zG + 0.2 - p.z) / p.vz
      const xHit = p.x + p.vx * tHit
      // It goes for it, or (when it's not trying) dives the wrong way, flapping.
      want = p.tries ? clamp(xHit, -RINK.netHalf, RINK.netHalf) : clamp(-xHit, -RINK.netHalf, RINK.netHalf)
    }
    if (g.task === 'carry' && p.by === g) {
      g.taskT += dt
      if (g.taskT > 0.7) {
        // The clear: all the way down the ice at her net (never a goal).
        g.task = 'idle'
        const stop = this.defend()
        this.rush = null
        this.gooseShoot(g, stop)
        p.vx *= 1.2
        p.vz *= 1.2
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
  }

  private updateGeese(dt: number, t: number) {
    const p = this.p
    const r = this.rush
    const wall = this.wallGeese()
    for (const g of wall) {
      if (!g.root.visible || (r && (g === r.carrier || g === r.wing))) continue
      if (g.task === 'down') {
        g.vx = g.vz = 0
        continue
      }
      const i = wall.indexOf(g)
      if (this.wall === 'up') {
        // Shoulder to shoulder across the net, bobbing.
        this.skateTo(g, (i - 2) * 0.85, WALL_Z + Math.sin(t * 3 + i) * 0.05, 4, dt)
        g.yaw = turn(g.yaw, 0, ease(dt, 6))
      } else if ((g === this.geese[1] || g === this.geese[2]) && this.score >= 1 && this.wall === 'none') {
        // Back and forth across the ice in front of the net (slower after misses, then out to the sides).
        const k = g === this.geese[1] ? 0 : 1
        const amp = (RINK.x - 1.1) * Math.max(0.35, 1 - this.streak * 0.2)
        const w = (GOALIE.geese * Math.max(0.35, 1 - this.streak * 0.25)) / amp
        const wantX = Math.sin(t * w + k * 2.1) * amp
        const prev = g.x
        g.x += (wantX - g.x) * ease(dt, 3)
        g.z += ((k ? -3.2 : -5.4) - g.z) * ease(dt, 3)
        g.vx = (g.x - prev) / Math.max(dt, 1e-3)
        g.yaw = turn(g.yaw, g.vx > 0.1 ? Math.PI / 2 : g.vx < -0.1 ? -Math.PI / 2 : 0, ease(dt, 6))
      } else {
        // Loitering by their net, out of her way.
        this.skateTo(g, g.spot[0] + Math.cos(t * 0.7 + g.phase) * 0.5, g.spot[1] + Math.sin(t * 0.7 + g.phase) * 0.35, 2.5, dt)
        g.yaw = turn(g.yaw, 0, ease(dt, 3))
      }
      // Her shots (and loose pucks) bounce off them.
      if (p.state === 'free' && p.kind !== 'goose' && this.wall !== 'up' && g.up) {
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
          g.spin()
          story.honk()
          this.counts.bounces++
        }
      }
    }
  }

  private updateMates(dt: number, t: number) {
    const p = this.p
    const m = this.maple
    if (m.task === 'fetch') {
      m.taskT += dt
      this.goal.set(p.x, 0, p.z + 0.6)
      if (p.state !== 'free' || m.taskT > 4) m.task = 'idle'
    }
    for (const s of this.matesList()) {
      s.back += ((s.who === 'ollie' && s.task === 'fetch' ? 1 : 0) - s.back) * ease(dt, 8)
      if (this.phase === 'win') continue
      if (s.task === 'idle' || (s.task === 'block' && !this.rush)) {
        s.task = 'idle'
        // Lazy loops round its spot.
        const w = 0.6 + (s.phase % 1) * 0.3
        this.skateTo(s, s.spot[0] + Math.cos(t * w + s.phase) * 0.9, s.spot[1] + Math.sin(t * w + s.phase) * 0.55, 2.5, dt)
        continue
      }
      s.taskT += dt
      if (s.task === 'dash') {
        // Roxy, quick as a blink, at the goose with the puck.
        const r = this.rush
        if (!r || p.by !== r.carrier) {
          s.task = 'idle'
          continue
        }
        this.skateTo(s, r.carrier.x, r.carrier.z, 11, dt)
        if (dist(s, r.carrier) < 0.8) {
          r.carrier.spin()
          story.honk()
          party.steal()
          this.sparks.burst(r.carrier.x, 0.4, r.carrier.z, 12, 2, 2, 0.1)
          this.rush = null
          this.holdPuck(s)
          s.task = 'carry'
          s.taskT = 0
          this.talent('roxy', s, L.party.roxy)
        }
      } else if (s.task === 'fetch') {
        if (p.state !== 'free' || p.kind === 'goose') {
          s.task = 'idle'
          continue
        }
        const fast = s.who === 'ollie' ? 10 : 7
        this.skateTo(s, p.x, p.z, fast, dt)
        if (s.taskT > 3.5) {
          // Out of reach: the goose in goal kicks it back out to her.
          s.task = 'idle'
          this.passTo(this.goalie(), m)
          continue
        }
        if (dist(s, p) < 0.7) {
          this.holdPuck(s)
          s.task = s.who === 'misty' && this.wall === 'up' ? 'windup' : 'carry'
          s.taskT = 0
          if (s.who === 'ollie') this.talent('ollie', s, L.party.ollie)
          if (s.task === 'windup') this.talk(L.party.misty, 3)
        }
      } else if (s.task === 'carry') {
        // A beat with it, then a pass to Maple.
        s.vx *= Math.exp(-dt * 5)
        s.vz *= Math.exp(-dt * 5)
        s.x += s.vx * dt
        s.z += s.vz * dt
        s.yaw = turn(s.yaw, Math.atan2(m.x - s.x, m.z - s.z), ease(dt, 8))
        if (s.taskT > (s.who === 'ollie' ? 0.6 : 0.35) && p.by === s) {
          s.task = 'idle'
          this.passTo(s, m)
        } else if (p.by !== s) s.task = 'idle'
      } else if (s.task === 'windup') {
        // Misty winds up... and BOOM: the goose wall goes over like bowling pins.
        s.vx *= Math.exp(-dt * 5)
        s.vz *= Math.exp(-dt * 5)
        s.yaw = turn(s.yaw, Math.atan2(-s.x, RINK.zG - s.z), ease(dt, 8))
        if (s.taskT > 0.2 && s.taskT - dt <= 0.2) s.slap(2)
        if (s.taskT > 1.25) {
          s.task = 'idle'
          this.breakWall(s)
        }
      }
    }
  }

  /** Misty's slap shot knocks the whole wall flat (and the goalie), and the puck comes back to Maple. */
  private breakWall(misty: Player) {
    const p = this.p
    this.wall = 'down'
    party.bigSlap()
    party.topple()
    story.honks()
    for (const g of [...this.wallGeese(), this.goalie()]) {
      g.knockDown(g.x >= 0 ? 1 : -1)
      g.task = 'down'
    }
    for (let i = 0; i < 40; i++) this.sparks.emit((Math.random() - 0.5) * 4, 0.4, WALL_Z, (Math.random() - 0.5) * 8, 3 + Math.random() * 3, (Math.random() - 0.5) * 3, 0.9, 0.14)
    p.x = 0
    p.z = WALL_Z + 0.6
    this.passTo(misty, this.maple, 9)
    this.talent('misty', misty, null)
    this.talk(L.party.open, 4)
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
    for (const n of [this.canal.netG, this.canal.netH]) {
      const home = n === this.canal.netG ? RINK.zG : RINK.zH
      n.position.z += (home - n.position.z) * ease(dt, 6)
    }
    const r = this.rush
    // (The goalie flaps as it dives.)
    this.goalie().flail = clamp(Math.abs(this.dive) / 3, 0, 1)
    for (const s of this.everyone()) {
      const sp = Math.hypot(s.vx, s.vz)
      if (s === this.maple) {
        // Up the ice (turning a little toward where she's going); toward the camera at the win.
        const want = this.phase === 'win' ? 0 : sp > 0.6 && s.vz <= 0 ? Math.atan2(s.vx, s.vz) : sp > 0.6 ? Math.PI + clamp(s.vx * 0.2, -0.6, 0.6) : Math.PI + 0.25 * Math.sin(t * 0.8)
        s.yaw = turn(s.yaw, want, ease(dt, 6))
      } else if (s === this.monty) s.yaw = this.phase === 'win' ? turn(s.yaw, 0, ease(dt, 4)) : Math.PI
      else if (s.who === 'lulu' || s.who === 'kit') {
        /* (They sit where they are.) */
      } else if (s.who === 'ollie' && s.task === 'fetch') s.yaw += dt * 14
      else if (s === this.goalie()) s.yaw = turn(s.yaw, 0, ease(dt, 6))
      else if (r && (s === r.carrier || s === r.wing) && sp > 0.3) s.yaw = turn(s.yaw, Math.atan2(s.vx, s.vz), ease(dt, 8))
      else if (this.phase === 'win' && this.team().includes(s)) s.yaw = turn(s.yaw, 0, ease(dt, 4))
      else if (sp > 0.6 && s.task !== 'carry' && s.task !== 'windup') s.yaw = turn(s.yaw, Math.atan2(s.vx, s.vz), ease(dt, 6))
      s.update(dt, t)
    }
  }

  /** Short screens (a phone on its side): the prompt sits beside the rink, not over it, and the camera follows the
   *  play up and down the ice. Taller ones keep a row under the top bar for the prompt, out of the rink. */
  private get short() {
    return this.h <= 560
  }
  setSize(w: number, h: number, top: number) {
    this.h = h
    super.setSize(w, h, h <= 560 ? top : top + PROMPT_ROW)
  }

  protected shot(): Shot {
    // From behind her goal, up the ice to the geese's net and Parliament beyond: the whole rink, both nets, framed
    // like CSS object-fit 'contain' below the prompt on any screen shape.
    const tall = this.tall
    if (this.phase === 'win') return { center: new Vector3(0, 1.6, -1.6), half: tall ? new Vector3(3.6, 2.4, 2.6) : new Vector3(5.2, 2.2, 2.4), yaw: 0, pitch: 12 }
    // (The ice from just behind the geese's net to just behind hers, Monty in it.)
    const far = RINK.zG - 0.9
    const near = RINK.zH + 1.1
    let center: Vector3
    let half: Vector3
    let pitch: number
    if (this.short) {
      // A phone on its side can't show 18 m of ice big enough to play: about 11 m of it, sliding along with the play
      // (to her net whenever the geese rush it, so her net and the rush are always whole on screen).
      const hz = 6.2
      const home = near + 0.6
      // (With the puck on her stick it looks up the ice at the geese's net she's shooting at, and slides back only
      // half as far as she drags Maple back, so the ice never runs away under her finger.)
      const p = this.p
      const mine = p.state === 'held' && p.by === this.maple
      const threat = !!this.rush || (p.kind === 'goose' && p.state === 'free') || (!mine && p.z > 1.5)
      const at = threat ? home : mine ? far + hz + Math.max(0, p.z - 1) * 0.5 : p.z * 0.8
      // (Still while her finger is down: a flick is measured on the ice under it, so the ice mustn't slide.)
      if (!this.finger || this.camZ === null) this.camZ = clamp(at, far + hz, home - hz)
      center = new Vector3(0, 0.7, this.camZ)
      half = new Vector3(RINK.x + 0.4, 1, hz)
      pitch = 48
    } else {
      center = new Vector3(0, 0.6, (far + near) / 2)
      half = new Vector3(RINK.x + 0.6, 0.8, (near - far) / 2)
      pitch = tall ? 38 : 30
    }
    // A friend's big moment: a quick push-in toward them (play goes on).
    const st = this.star
    if (st && st.t < STAR_S) {
      const k = Math.sin((st.t / STAR_S) * Math.PI)
      center.lerp(new Vector3(st.who.x, 0.8, st.who.z), 0.2 * k)
      half.multiplyScalar(1 - 0.12 * k)
    }
    return { center, half, yaw: 0, pitch, objectFit: 'contain' }
  }

  /** The ring of light round a friend showing their talent the first time. */
  private updateStar(dt: number) {
    const st = this.star
    const ring = this.starRing
    if (!st) {
      ring.visible = false
      return
    }
    st.t += dt
    if (st.t > STAR_S + 0.4) {
      this.star = null
      ring.visible = false
      return
    }
    const k = st.t / STAR_S
    ring.visible = true
    ring.position.set(st.who.x, st.who.y + 0.04, st.who.z)
    ring.scale.setScalar(0.9 + 0.25 * Math.sin(st.t * 9) * (1 - Math.min(1, k)) + 0.2 * Math.min(1, k))
    ;(ring.material as MeshBasicMaterial).opacity = 0.95 * Math.min(1, st.t * 6) * (1 - clamp((st.t - STAR_S) / 0.4))
    if (st.t < STAR_S && Math.random() < dt * 30) {
      const a = Math.random() * Math.PI * 2
      this.sparks.emit(st.who.x + Math.cos(a) * 0.9, st.who.y + 0.1, st.who.z + Math.sin(a) * 0.9, 0, 2.5 + Math.random() * 2, 0, 0.7, 0.12)
    }
  }

  // ---------------------------------------------------------------- her finger

  pointerDown(x: number, y: number) {
    this.lastTouch = this.time
    this.finger = { x, y }
    this.pending = { x, y }
    this.samples = []
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
      if (this.phase === 'play') {
        this.control = true
        this.chase = 0
        this.counts.drags++
      }
    }
  }
  pointerUp() {
    if (this.control) {
      // The flick: how fast her finger moved over its last few hundredths of a second.
      const now = this.time
      const recent = this.samples.filter((s) => now - s.t <= FLICK.window + 0.02)
      const holding = this.p.state === 'held' && this.p.by === this.maple
      if (recent.length >= 2) {
        const a = recent[0]
        const b = recent[recent.length - 1]
        const dt = Math.max(0.016, b.t - a.t)
        const vx = (b.x - a.x) / dt
        const vz = (b.z - a.z) / dt
        const v = Math.hypot(vx, vz)
        this.flick = v
        if (v > FLICK.min && holding) {
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
    const r = this.rush
    // A tap on the goose with the puck (or near him): Maple goes after him.
    if (r && this.p.by === r.carrier && (id === 'gus' || id === `goose${this.geese.indexOf(r.carrier)}`)) {
      this.chase = 2
      return
    }
    // With the puck, a tap on a goose (the one in goal, the wall) is a shot at it, not a poke.
    const holding = this.p.state === 'held' && this.p.by === this.maple && this.phase === 'play'
    const atGoose = !!id && (id === 'gus' || id.startsWith('goose'))
    if (id && id !== 'maple' && !(holding && atGoose) && this.poke(id)) return
    if (id === 'maple') {
      this.counts.pokes++
      this.maple.wave()
      meet('beaver')
      if (this.p.by !== this.maple && !this.saidOnce.has('maple')) {
        this.saidOnce.add('maple')
        void say(L.party.poke.maple)
      }
      return
    }
    // A tap on the ice (or the net): with the puck, Maple slaps it there; without, she skates there.
    const g = this.groundAt(x, y, tmp)
    if (!g || this.phase !== 'play') return
    const p = this.p
    if (p.state === 'held' && p.by === this.maple && g.z < this.maple.z - 1) this.shoot(g.x - p.x, g.z - p.z, FLICK.tap)
    else if (r && p.by === r.carrier && Math.hypot(g.x - r.carrier.x, g.z - r.carrier.z) < 2.5) this.chase = 2
    else this.goal.set(g.x, 0, g.z)
  }

  /** Taps on everything else. True if it was one. */
  private poke(id: string) {
    this.counts.pokes++
    const once = (key: string, line: Line) => {
      if (this.saidOnce.has(key)) return
      this.saidOnce.add(key)
      void say(line)
    }
    const friend: Record<string, [Player | null | undefined, Line, Parameters<typeof meet>[0] | null]> = {
      monty: [this.monty, L.party.poke.monty, 'moose'],
      tuque: [this.mates.tuque, L.party.poke.tuque, null],
      roxy: [this.mates.roxy, L.party.poke.roxy, 'raccoon'],
      ollie: [this.mates.ollie, L.party.poke.ollie, 'sea-otter'],
      misty: [this.mates.misty, L.party.poke.misty, 'spirit-bear'],
      lulu: [this.lulu, L.party.poke.lulu, 'loon'],
    }
    if (id in friend) {
      const [s, line, book] = friend[id]
      if (!s) return true
      if (s.who === 'ollie') s.spin()
      else s.hop()
      if (s.who === 'lulu') {
        this.callT = 0
        story.loon()
      } else if (s.who === 'monty') story.bonk()
      else story.boing()
      if (book) meet(book)
      once(id, line)
      return true
    }
    if (id.startsWith('kit')) {
      const k = this.kits[+id.slice(3)]
      if (k) k.cheer()
      party.kits()
      meet('raccoon')
      return true
    }
    if (id === 'gus' || id.startsWith('goose')) {
      const g = id === 'gus' ? this.gus : this.geese[+id.slice(5)]
      if (g?.up) g.hop()
      story.honk()
      meet('canada-goose')
      if (id === 'gus') once('gus', L.party.poke.gus)
      return true
    }
    if (id === 'stand') {
      this.standT = 0
      sfx.munch()
      this.maple.hop()
      once('stand', L.party.stand)
      return true
    }
    if (id === 'tower') {
      ;[0, 0.9, 1.8].forEach((d) => tone(196, 194, 1.2, 0.12, 'sine', d))
      once('tower', L.party.parliament)
      return true
    }
    if (id.startsWith('skater')) {
      const s = this.nearSkaters()[+id.slice(6)]
      if (s) s.spinT = 0
      story.whoosh()
      once('canal', L.party.canal)
      return true
    }
    if (id.startsWith('lamp')) {
      const l = this.canal.lamps[+id.slice(4)]
      if (l) l.t = 0
      story.glint()
      return true
    }
    return false
  }

  /** The three skaters nearest the rink (they get the tap targets). */
  private nearSkaters() {
    return [...this.canal.skaters].sort((a, b) => b.root.position.z - a.root.position.z).slice(0, 3)
  }

  private byId(id: string): Player | null {
    if (id === 'maple') return this.maple
    if (id === 'monty') return this.monty
    if (id === 'lulu') return this.lulu
    if (id === 'gus') return this.gus
    if (id.startsWith('kit')) return this.kits[+id.slice(3)] ?? null
    if (id.startsWith('goose')) return this.geese[+id.slice(5)] ?? null
    return this.mates[id as Mate] ?? null
  }

  placeAnchors() {
    const near = this.nearSkaters()
    for (const [id, el] of this.anchorEls) {
      let at: Vector3 | null = null
      let h = 1
      let k = 1.1
      const s = this.byId(id)
      if (s) {
        at = s.root.visible ? tmp.set(s.x, s.y, s.z) : null
        h = s.height
        k = id === 'maple' ? 1.4 : id === 'monty' ? 0.8 : 1.1
      } else if (id === 'stand') {
        at = tmp.set(...this.canal.stand.at)
        h = 2.4
        k = 0.8
      } else if (id === 'tower') {
        at = tmp.set(this.canal.tower[0], this.canal.tower[1] - 6, this.canal.tower[2])
        h = 12
        k = 0.4
      } else if (id.startsWith('skater')) {
        const sk = near[+id.slice(6)]
        at = sk ? tmp.copy(sk.root.position) : null
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
      against: this.against,
      puck: { state: p.state, kind: p.kind, by: p.by?.who ?? null, ...scr(p.x, 0.1, p.z) },
      /** QA flicks from `puck` toward `net`. */
      net: scr(0, 0.5, RINK.zG),
      maple: scr(this.maple.x, 0.6, this.maple.z),
      rush: this.rush ? { plan: [...this.rush.plan], carrier: scr(this.rush.carrier.x, 0.5, this.rush.carrier.z) } : null,
      wall: this.wall,
      team: this.team().map((s) => s.who),
      shown: [...this.shown],
      geese: this.geese.filter((g) => g.root.visible).length,
      streak: this.streak,
      ...this.counts,
    }
  }

  dispose() {
    this.dead = true
    this.stopBed()
    this.unwatch()
    super.dispose()
  }
}

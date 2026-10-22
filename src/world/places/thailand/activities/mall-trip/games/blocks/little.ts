// Little Land at HarborLand (plan: planning/around-the-world/thailand/mall-trip.md, "6. Little Land"), greybox shapes
// with voices (lines.ts `L.mall.blocks`: Daddy's bet and his sneeze, Sparkle's few lines, said through talk.ts). Giant
// foam bricks on the flower mats; Kaylee in her grip socks by the brick box, Daddy watching from the other side.
//
// The toy: grab a brick (out of the box, or off the top of the stack) and put it down. It hangs just above her finger;
// every frame the spots it could go are projected to the screen and the nearest wins, with a pull and an outline where
// it will land (spotFor), so it lands where she meant on an iPad or an iPhone. It drops in with a whump, squashes, and
// the stack sways and settles (one spring: each brick leans by its height). Half over the edge, it sways a lot.
// A swipe through the stack knocks it down: the bricks fly and bounce on the mats, then hop back into the box, up a
// scale.
//   1. Free stacking. After six bricks the stack glows: a tap and Kaylee pushes it over.
//   2. The picture card: a chedi, then an elephant. Outlines show the next row; a brick near them goes to the nearest.
//      The chedi gets its gold spire and a temple bell; the elephant its face, ears and trunk, trumpets, and shakes
//      itself apart.
//   3. Taller than Daddy: he stands by the stack with a ribbon at his horn. Past it: ah... ah... CHOO, and it's down.
// A star on the easel for each round. Taps alone play it: a tap on the box hops the next brick to a good spot.
// Nothing fails: a brick let go over Daddy's head is a hat, over the box goes back in, over the ball bounces off.
import { Color, IcosahedronGeometry, OctahedronGeometry, Plane, Raycaster, Vector3, type Group, type Mesh, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, sounds, span, wobble } from '../../../../../../../sdk'
import type { Avatar } from '../../../../characters/avatar'
import type { Member } from '../../../../characters/member'
import type { AnchorInfo } from '../../../../engine/Anchors'
import type { Shot } from '../../../../engine/camera'
import { PAL } from '../../../../engine/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../../trip/legs/stage'
import { SOCK_COLORS, wearSocks } from '../../socks'
import { brick, buildLittleLand, cellX, cellY, ghostMaterials, ghostMesh, type Built, type Picture } from './build'
import { Floaters } from './fx'
import { CARDS, Grid, type Cell } from './grid'
import { BALL, BD, BH, BOX, BOX_TALL, BRICK_COLORS, BW, DADDY_BACK, DADDY_BACK_TALL, DADDY_STAND, DADDY_STAND_TALL, EASEL, FLOOR, HOLD_Z, KAYLEE_AT, LIFT_PX, MARK_Y, ROCKER, STAR_Y, WALL, type CardId, type Round } from './layout'
import { blocksSfx as sfx } from './sounds'
import { Talk } from './talk'
import { L } from '../../../../lines'

const T = L.mall.blocks

export interface BlocksEvents extends LegEvents {
  /** The round on now (the address bar follows). */
  round(n: Round): void
  /** Round 2's picture card on the easel now. */
  card(id: CardId): void
  /** A stack went over (the sock band's 🧱 comes with the first). */
  knocked(): void
  /** All three rounds done (the 🛝 back to the hall shows; she can keep building). */
  allDone(): void
}
export interface BlocksStart {
  round: Round
  card: CardId
  socks: string
}

export const BLOCKS_ANCHORS: AnchorInfo[] = [
  { id: 'box', label: 'The brick box', kind: 'thing' },
  { id: 'tower', label: 'The tower', kind: 'thing' },
  { id: 'easel', label: 'The picture card', kind: 'thing' },
  { id: 'stars', label: 'Stars', kind: 'thing' },
  { id: 'wall', label: 'Foam wall', kind: 'thing' },
  { id: 'ball', label: 'Foam ball', kind: 'thing' },
  { id: 'rocker', label: 'Rocking elephant', kind: 'thing' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
]

/** Bricks there are (in the box when not out). */
const POOL = 18
/** Round 1: the stack glows (push it over!) from this many bricks. */
const GLOW_AT = 6
/** A knock-down of at least this many bricks finishes round 1. */
const ROUND1_MIN = 4

type BState = 'box' | 'held' | 'drop' | 'grid' | 'fly' | 'home' | 'hat'
interface Brick {
  id: number
  g: Group
  state: BState
  pos: Vector3
  vel: Vector3
  rot: Vector3
  spin: Vector3
  /** Seconds since it landed on the stack (its squash and rock). */
  land: number
  /** How much it rocks when it lands: a lot half over the edge. */
  rock: number
  /** A drop (from her hand, or a hop from the box) or a hop home. */
  t: number
  dur: number
  arc: number
  delay: number
  from: Vector3
  to: Vector3
  /** Home: its note up the scale. */
  note: number
  /** Flying: how long it has lain still. */
  still: number
}
type Phase = 'build' | 'push' | 'payoff' | 'away'
/** A special place to let go: Daddy's head, the box, the ball. */
type Special = 'hat' | 'box' | 'ball'

const tmp = new Vector3()
const tmp2 = new Vector3()
const right = new Vector3()
const V = (x: number, y: number, z: number) => new Vector3(x, y, z)
const ease = (k: number) => k * k

export class LittleLand extends Stage {
  private built: Built
  private kaylee: Avatar
  private nick: Member
  private grid = new Grid()
  private bricks: Brick[] = []
  private phase: Phase = 'build'
  private round: Round
  private card: CardId
  private stars: number
  private starPop = [1, 1, 1]
  private starTwinkle = -1
  private held: { b: Brick | null; src: 'box' | 'grid'; x: number; y: number; x0: number; y0: number; moved: boolean } | null = null
  private push: { x0: number; done: boolean } | null = null
  private chosen: { c: Cell; x: number; y: number; d: number } | null = null
  private special: Special | null = null
  private sway = { a: 0, v: 0, pivot: 0 }
  private later: { t: number; f: () => void }[] = []
  private pending: (() => void) | null = null
  /** In a knock-down: when the bricks are called home. */
  private homeAt = 0
  private glowShown = false
  private knockedOnce = false
  private allDoneSent = false
  private sneeze = { t: -1 }
  private trumpet = -1
  private daddyNear = false
  private tall = false
  private hatOn: Brick | null = null
  private kayleePush = -1
  private reachK = 0
  private armsSet = false
  private ball = { x: 0, y: 0, vx: 0, vy: 0, roll: 0 }
  private rock = { a: 0, v: 0 }
  private flip = { t: 1, to: 'free' as Picture }
  private picture: Picture = 'free'
  private boxPop = 1
  private wallPop: { g: Group; at: Vector3; t: number } | null = null
  private wallPops = new Map<string, Group>()
  private wallNotes = 0
  private homeNotes = 0
  private talk = new Talk((l) => this.bev.say(l))
  private sneezes = 0
  private ghosts: Mesh[] = []
  private preview: Mesh
  private mats: ReturnType<typeof ghostMaterials>
  private spirePop = 1
  private facePop = 1
  private sparkles: Floaters
  private puffs: Floaters
  private ray = new Raycaster()
  private holdPlane = new Plane(new Vector3(0, 0, 1), -HOLD_Z)

  constructor(renderer: WebGLRenderer, private bev: BlocksEvents, start: BlocksStart) {
    super(renderer, bev)
    const { scene, bag } = this
    scene.background = new Color('#EBDDFF')
    this.rig.fov = 30
    this.built = buildLittleLand(bag)
    scene.add(this.built.root)
    // ---- Kaylee in her grip socks by the box, Daddy on his foam seat ----
    const { kaylee, members } = this.makeFamily(['nick'])
    this.kaylee = kaylee
    this.nick = members.get('nick')!
    wearSocks(kaylee, SOCK_COLORS[start.socks] ?? SOCK_COLORS.pink, bag)
    scene.add(kaylee.root, this.nick.root)
    this.put(kaylee, KAYLEE_AT.x, 0, KAYLEE_AT.z, 'stand', KAYLEE_AT.face)
    // ---- The bricks (in the box until she takes one), the outlines ----
    for (let i = 0; i < POOL; i++) {
      const g = brick(BRICK_COLORS[i % BRICK_COLORS.length], bag)
      g.userData.pick = `brick:${i}`
      g.visible = false
      scene.add(g)
      this.bricks.push({ id: i, g, state: 'box', pos: new Vector3(), vel: new Vector3(), rot: new Vector3(), spin: new Vector3(), land: 9, rock: 0, t: 0, dur: 0.2, arc: 0, delay: 0, from: new Vector3(), to: new Vector3(), note: 0, still: 0 })
    }
    this.mats = ghostMaterials(bag)
    for (let i = 0; i < 6; i++) {
      const m = ghostMesh(bag, this.mats.dim)
      m.visible = false
      this.ghosts.push(m)
      scene.add(m)
    }
    this.preview = ghostMesh(bag, this.mats.drop)
    this.preview.visible = false
    scene.add(this.preview)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 90, bag, 1.2, 1.2)
    this.puffs = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#E9E1FF', '#FFE6F0'], 70, bag, -0.4, 2.6)
    scene.add(this.sparkles.mesh, this.puffs.mesh)
    // ---- The round the link starts at (the stars before it are already on the easel) ----
    this.round = start.round
    this.card = start.card
    this.stars = start.round - 1
    this.built.stars.forEach((s, i) => (s.visible = i < this.stars))
    this.setRound(start.round, start.card, true)
    // What's said first: Daddy's bet, then "Grab a brick!" (a link to a later round: that round's line).
    this.after(0.5, () => {
      if (start.round > 1) return this.roundLine(start.round, start.card)
      this.talk.say(T.higher)
      this.after(2.2, () => this.talk.say(T.grab))
    })
  }

  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }

  /** Sparkle, when a round's new thing shows: the picture card, the elephant, Daddy beside the stack. */
  private roundLine(n: Round, card: CardId) {
    if (n === 2) this.talk.say(card === 'chedi' ? T.copy : T.elephant)
    if (n === 3) this.talk.say(T.taller)
  }

  // ---------------------------------------------------------------- rounds

  private setRound(n: Round, card: CardId, now = false) {
    this.round = n
    this.card = card
    this.glowShown = false
    this.bev.round(n)
    if (n === 2) this.bev.card(card)
    this.showPicture(n === 1 ? 'free' : n === 2 ? card : 'tall', now)
    if (!now) this.after(0.4, () => this.roundLine(n, card))
    this.built.ribbon.visible = n === 3
    // Daddy: a step back watching, then (round 3) right beside the stack, his horn at the ribbon.
    const near = n === 3
    if (near === this.daddyNear && !now) return
    this.daddyNear = near
    const d = this.daddySpot()
    if (now) this.put(this.nick, d.x, 0, d.z, 'stand', d.face)
    else this.hop(this.nick, this.scene, V(d.x, 0, d.z), { face: d.face, dur: 0.5 })
  }

  /** The card on the easel: it spins round to the next picture. */
  private showPicture(p: Picture, now = false) {
    if (now) {
      this.picture = p
      for (const [id, g] of Object.entries(this.built.pictures)) g.visible = id === p
      return
    }
    if (p === this.picture) return
    this.flip = { t: 0, to: p }
    sfx.whoosh(0.4)
  }

  private daddySpot() {
    return this.daddyNear ? (this.tall ? DADDY_STAND_TALL : DADDY_STAND) : this.tall ? DADDY_BACK_TALL : DADDY_BACK
  }
  /** The box: on the left on a wide screen, on the mat in front on a tall one (`y` up from the floor). */
  private boxAt(y: number) {
    const b = this.tall ? BOX_TALL : BOX
    return V(b.x, y, b.z)
  }
  private get mouth() {
    return this.boxAt(BOX.h + 0.05)
  }

  setSize(w: number, h: number, top: number) {
    const tall = w < h
    if (tall !== this.tall) {
      this.tall = tall
      this.built.box.position.copy(this.boxAt(0))
      const d = this.daddySpot()
      this.put(this.nick, d.x, 0, d.z, 'stand', d.face)
    }
    super.setSize(w, h, top)
  }

  private giveStar() {
    if (this.stars >= 3) return
    const i = this.stars++
    this.built.stars[i].visible = true
    this.starPop[i] = 0
    sfx.star()
    this.sparkles.burst(this.built.stars[i].getWorldPosition(new Vector3()), 16, 1.4, 1.6, 1, 0.05)
    this.after(0.3, () => {
      this.kaylee.react('hop')
      this.nick.react('wave')
    })
  }

  /** What she may put a brick on now. */
  private allowed(): Cell[] {
    return this.phase === 'build' ? this.grid.allowed(this.round, this.card) : []
  }

  private get glowing() {
    return this.round === 1 && this.phase === 'build' && this.grid.count >= GLOW_AT
  }

  // ---------------------------------------------------------------- the bricks

  private takeFromBox(): Brick | null {
    const b = this.bricks.find((x) => x.state === 'box')
    if (!b) return null
    b.pos.copy(this.mouth)
    b.rot.set(0, 0, 0)
    b.g.visible = true
    b.g.scale.set(1, 1, 1)
    this.boxPop = 0
    return b
  }

  /** Into the stack at `c`: a drop from where it is (from her hand: quick; from the box: a hop). */
  private dropTo(b: Brick, c: Cell, dur: number, arc: number) {
    this.grid.place(b.id, c)
    b.state = 'drop'
    b.from.copy(b.pos)
    b.to.set(cellX(c), cellY(c), 0)
    b.t = 0
    b.dur = dur
    b.arc = arc
  }

  private landed(b: Brick) {
    const c = this.grid.at.get(b.id)
    if (!c) return
    b.state = 'grid'
    b.land = 0
    const sup = this.grid.support(c)
    b.rock = sup.n === 1 ? 1 : 0.35
    sfx.whump(c.r)
    this.puffs.burst(V(cellX(c), c.r * BH + 0.02, BD / 2), 6, 0.9, 0.3, 0.5, 0.07)
    // The stack sways: more the higher it lands, a lot when it's half over the edge (it leans that way).
    const kick = (0.07 + 0.03 * c.r) * (sup.n === 1 ? 2.4 : 1)
    this.sway.v += -(sup.side || (Math.random() < 0.5 ? -1 : 1)) * kick
    if (sup.n === 1 && c.r > 0) {
      this.after(0.12, () => sfx.whoa())
      this.nick.react('wiggle')
      this.after(0.5, () => this.talk.react(this.time, T.whoa))
    }
    // What a brick in place does in each round.
    if (this.round === 1 && this.grid.count >= GLOW_AT && !this.glowShown) {
      this.glowShown = true
      sounds.sparkle()
      this.sparkles.burst(this.topWorld(), 14, 1.2, 1.4, 0.9, 0.05)
      this.nick.react('wave')
      this.talk.once('push', T.push)
    }
    if (this.round === 2 && this.phase === 'build' && this.grid.done(this.card)) this.cardDone()
    if (this.round === 3 && this.phase === 'build' && this.grid.top() * BH > MARK_Y && this.sneeze.t < 0) this.achoo()
  }

  /** Let go: over Daddy's head it's a hat, over the box it goes back in, over the ball it bounces off; anywhere else
   *  onto the spot it was pulled to. */
  private release(b: Brick) {
    const sp = this.special
    const c = this.chosen?.c
    this.preview.visible = false
    if (sp === 'hat' && !this.hatOn) return this.hat(b)
    if (sp === 'ball') {
      this.kickBall(-1)
      b.state = 'fly'
      b.vel.set(-1.6, 2.6, 0.6)
      b.spin.set(2, 0, 4)
      b.still = 0
      return
    }
    if (sp === 'box' || !c) {
      sfx.fwip()
      this.goHome(b, 0, -1)
      return
    }
    this.dropTo(b, c, 0.13, 0.04)
  }

  /** Daddy wears it, wobbles, and it slides off. */
  private hat(b: Brick) {
    b.state = 'hat'
    b.t = 0
    this.hatOn = b
    sfx.boing()
    this.nick.react('hop')
    this.after(0.5, () => this.talk.react(this.time, T.hat) || sfx.haha())
    this.after(0.3, () => {
      this.kaylee.react('hop')
      sfx.giggle()
    })
  }
  private hatOff() {
    const b = this.hatOn
    if (!b || b.state !== 'hat') return
    this.hatOn = null
    b.state = 'fly'
    b.vel.set(0.9, 1.4, 0.8)
    b.spin.set(0, 0, -3)
    b.still = 0
    this.nick.react('wiggle')
  }

  /** Back into the box: a hop to its mouth (a note up the scale, `note` < 0: a fwip). */
  private goHome(b: Brick, delay: number, note: number) {
    b.state = 'home'
    b.from.copy(b.pos)
    b.to.copy(this.mouth).add(V((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.2))
    b.t = 0
    b.delay = delay
    b.dur = note < 0 ? 0.3 : 0.5
    b.arc = note < 0 ? 0.3 : 1.1
    b.note = note
  }

  // ---------------------------------------------------------------- over it goes

  /** Kaylee hops over to the stack and pushes it (a tap on the glowing stack). */
  private pushOver() {
    if (this.phase !== 'build' || !this.grid.count) return
    this.phase = 'push'
    let minX = Infinity
    for (const c of this.grid.at.values()) minX = Math.min(minX, cellX(c) - BW / 2)
    const k = this.kaylee
    k.face(Math.PI / 2)
    k.hopTo(V(Math.max(minX - 0.42, KAYLEE_AT.x), 0, 0.42), 0.4, 0.3, () => {
      this.kayleePush = 0
      this.after(0.16, () => {
        this.phase = 'build'
        this.crash(1, 'push')
      })
      this.after(1.3, () => k.hopTo(V(KAYLEE_AT.x, 0, KAYLEE_AT.z), 0.42, 0.3, () => k.face((KAYLEE_AT.face * Math.PI) / 180)))
    })
  }

  /** The whole stack goes over: every brick flies off (away from `dir`'s side, -1 left, 1 right) and bounces on the
   *  mats; a little later they hop home into the box, up the scale. What comes next waits until they're all in. */
  private crash(dir: number, why: 'push' | 'swipe' | 'sneeze' | 'shake') {
    const n = this.grid.count
    if (!n || this.phase !== 'build') return
    this.phase = 'away'
    this.detachExtras()
    const power = why === 'sneeze' ? 1.5 : why === 'shake' ? 0.6 : 1
    for (const [id, c] of this.grid.at) {
      const b = this.bricks[id]
      b.pos.copy(b.g.position)
      b.rot.set(b.g.rotation.x, b.g.rotation.y, b.g.rotation.z)
      const h = c.r / 5
      b.vel.set(dir * (0.6 + 1.6 * h + Math.random() * 0.9) * power + (why === 'shake' ? (Math.random() - 0.5) * 2 : 0), (1.0 + Math.random() * 1.3 + h) * (why === 'shake' ? 1.4 : power), 0.4 + Math.random() * 1.3)
      b.spin.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 2, -dir * (2 + Math.random() * 4) * power)
      b.state = 'fly'
      b.still = 0
    }
    this.grid.clear()
    this.sway.a = this.sway.v = 0
    sfx.crash()
    if (why !== 'shake' && !this.knockedOnce) {
      this.knockedOnce = true
      this.bev.knocked()
    }
    if (why !== 'push') this.kaylee.react('hop')
    this.after(0.5, () => {
      sfx.giggle()
      if (why !== 'sneeze') this.nick.react('hop')
      // Daddy, now and then, when she knocks it over herself.
      if (why === 'push' || why === 'swipe') this.talk.react(this.time, T.crash)
    })
    // What it finishes.
    if (this.round === 1 && n >= ROUND1_MIN) {
      this.after(0.7, () => this.giveStar())
      this.pending = () => this.setRound(2, 'chedi')
    } else if (why === 'shake') this.pending = () => this.setRound(3, this.card)
    else if (why === 'sneeze') {
      this.after(1.0, () => this.giveStar())
      this.pending = () => {
        if (this.allDoneSent) return
        this.allDoneSent = true
        this.bev.allDone()
      }
    }
    // Then home, one by one up the scale (the first to land go first).
    this.homeAt = this.time + 1.9
    this.after(1.9, () => this.allHome())
  }

  private allHome() {
    let i = 0
    this.homeNotes = 0
    for (const b of this.bricks) if (b.state === 'fly') this.goHome(b, i++ * 0.11, this.homeNotes++)
  }

  /** The spire and the elephant's face come off with the bricks. */
  private detachExtras() {
    for (const g of [this.built.spire, this.built.face.root]) {
      g.visible = false
      this.built.root.add(g)
    }
    this.trumpet = -1
  }

  // ---------------------------------------------------------------- the cards and Daddy's sneeze

  private brickAt(c: Cell) {
    for (const [id, at] of this.grid.at) if (at.s === c.s && at.r === c.r) return this.bricks[id]
    return null
  }

  private cardDone() {
    this.phase = 'payoff'
    const cells = CARDS[this.card]
    const top = this.brickAt(cells[cells.length - 1])!
    if (this.card === 'chedi') {
      // The gold spire hops on top, a temple bell, then the bricks hop home and the card turns to the elephant.
      const s = this.built.spire
      top.g.add(s)
      s.position.set(0, BH / 2 - 0.02, 0)
      s.visible = true
      this.spirePop = 0
      sfx.bell()
      sounds.sparkle()
      this.after(0.6, () => this.talk.once('chedi', T.chedi))
      this.sparkles.burst(top.g.getWorldPosition(new Vector3()).add(V(0, 0.8, 0)), 20, 1.4, 1.2, 1.2, 0.05)
      this.after(0.35, () => {
        this.kaylee.react('hop')
        this.nick.react('wave')
      })
      this.after(2.4, () => this.tidy(() => this.setRound(2, 'elephant')))
      return
    }
    // The elephant: its face pops on, it trumpets and flaps its ears and dances, then shakes itself apart.
    const f = this.built.face
    top.g.add(f.root)
    f.root.position.set(0, 0, 0)
    f.root.visible = true
    this.facePop = 0
    this.trumpet = 0
    sfx.trumpet()
    this.after(0.7, () => this.talk.say(T.trunk))
    this.after(0.4, () => sfx.flap())
    this.after(1.1, () => sfx.flap())
    this.after(0.5, () => (this.sway.v += 0.35))
    this.after(1.0, () => (this.sway.v -= 0.4))
    this.after(1.5, () => (this.sway.v += 0.35))
    this.after(0.6, () => this.giveStar())
    this.after(2.8, () => {
      this.phase = 'build'
      this.crash(Math.random() < 0.5 ? -1 : 1, 'shake')
    })
  }

  /** A finished card's bricks hop home from the top down (no crash: it was too nice). */
  private tidy(next: () => void) {
    this.detachExtras()
    this.phase = 'away'
    this.homeAt = this.time
    this.pending = next
    const ids = [...this.grid.at.entries()].sort((a, b) => b[1].r - a[1].r || a[1].s - b[1].s).map(([id]) => id)
    this.grid.clear()
    this.homeNotes = 0
    ids.forEach((id, i) => {
      const b = this.bricks[id]
      b.pos.copy(b.g.position)
      b.rot.set(0, 0, b.g.rotation.z)
      this.goHome(b, i * 0.13, this.homeNotes++)
    })
  }

  /** Daddy looks up at the tower: ooh. Ah... ah... CHOO! Down it goes, away from him. */
  private achoo() {
    this.sneeze.t = 0
    sfx.ooh()
  }

  private sneezeFrame(dt: number) {
    if (this.sneeze.t < 0) return
    const st = (this.sneeze.t += dt)
    const r = this.nick.rig
    // His own "ah... ah... choo!" (the CHOO's blast of air is still a sound, on the head's forward snap).
    if (st > 0.45 && st - dt <= 0.45) this.talk.say(T.sneeze)
    if (st > 1.75 && st - dt <= 1.75) {
      sfx.choo()
      this.nick.react('hop')
      this.puffs.burst(r.head.localToWorld(V(0, r.face.headY, r.face.R)), 18, 1.6, 0.3, 0.8, 0.07)
      this.crash(-1, 'sneeze')
      // The first time: he gives in (she built higher than him). After that he just laughs.
      if (this.sneezes++ === 0) this.after(1.0, () => this.talk.say(T.beat))
      else this.after(0.6, () => sfx.haha())
    }
    // Head: up at the tower, back for the ah... ah..., then forward on the CHOO.
    const up = span(st, 0, 0.4) * (1 - span(st, 0.9, 1.2))
    const back = st < 1.75 ? span(st, 0.9, 1.6) : Math.max(0, 1 - (st - 1.75) / 0.1)
    const fwd = st >= 1.75 ? bell(clamp((st - 1.75) / 0.5)) : 0
    r.head.rotation.x = -0.35 * up - 0.4 * back + 0.4 * fwd
    if (st > 2.6) {
      this.sneeze.t = -1
      r.head.rotation.x = 0
    }
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [...this.bricks.filter((b) => b.g.visible).map((b) => b.g), ...this.built.picks, this.kaylee.root, this.nick.root]
  }

  /** A brick under the finger wins over a tap target laid over it (the tower's, the wall's). */
  private under(x: number, y: number, id?: string) {
    const hit = this.pick(x, y)
    return hit?.startsWith('brick:') ? hit : (id ?? hit)
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    if (x === undefined || y === undefined) return
    this.push = null
    const what = this.under(x, y, id)
    const hold = (b: Brick | null, src: 'box' | 'grid') => (this.held = { b, src, x, y, x0: x, y0: y, moved: false })
    if (what === 'box' && this.phase === 'build') return void hold(null, 'box')
    if (what?.startsWith('brick:')) {
      const b = this.bricks[Number(what.slice(6))]
      // A brick with nothing on top lifts off; one lower down is part of the stack (a swipe knocks it over).
      if (b.state === 'grid' && this.phase === 'build' && this.grid.free(b.id)) hold(b, 'grid')
      else if (b.state === 'grid') this.push = { x0: x, done: false }
      return
    }
    if (what === 'tower') this.push = { x0: x, done: false }
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, isHeld: boolean) {
    if (!isHeld) return
    const h = this.held
    if (h) {
      h.x = x
      h.y = y
      this.lastTouch = this.time
      if (!h.moved && Math.hypot(x - h.x0, y - h.y0) > 10) {
        if (h.src === 'box') {
          const b = this.takeFromBox()
          if (!b) {
            this.held = null
            this.boxPop = 0
            sfx.boingy()
            return
          }
          h.b = b
        } else if (h.b) this.grid.remove(h.b.id)
        h.moved = true
        this.push = null
        this.touches++
        h.b!.state = 'held'
        sfx.lift()
      }
      if (h.moved) this.aim()
      return
    }
    const p = this.push
    if (p && !p.done && Math.abs(x - p.x0) > 60 && this.phase === 'build' && this.grid.count) {
      p.done = true
      this.lastTouch = this.time
      this.touches++
      this.crash(Math.sign(x - p.x0), 'swipe')
    }
  }

  pointerUp() {
    const h = this.held
    this.push = null
    // Where it goes is worked out from where her finger is now (not the last frame's, which may be a while ago).
    if (h?.moved && h.b?.state === 'held') {
      this.aim()
      this.held = null
      this.release(h.b)
    }
    this.held = null
    this.chosen = null
    this.special = null
    this.preview.visible = false
  }

  tap(x: number, y: number, id?: string) {
    super.tap(x, y, this.under(x, y, id) ?? undefined)
  }

  protected onTap(id: string | null, x: number, y: number) {
    if (!id) return
    if (id.startsWith('brick:')) return this.pokeBrick(this.bricks[Number(id.slice(6))])
    switch (id) {
      case 'box':
        return this.tapBox()
      case 'tower': {
        const top = this.grid.topBrick()
        if (top !== null) this.pokeBrick(this.bricks[top])
        return
      }
      case 'easel':
        this.flip = { t: 0, to: this.picture }
        sfx.whoosh(0.4)
        // The first poke on each card: what it is.
        if (this.picture === 'chedi') this.talk.once('chedi', T.chedi)
        if (this.picture === 'elephant') this.talk.once('elephant', L.facts.elephant)
        if (this.round === 2) for (const g of this.ghosts) if (g.visible) this.sparkles.burst(g.position, 3, 0.6, 0.6, 0.6, 0.04)
        return
      case 'stars':
        if (!this.stars) {
          sfx.boingy()
          this.built.starSlots.rotation.z = 0.2
          return
        }
        this.starTwinkle = 0
        return
      case 'wall':
        return this.popWall(x, y)
      case 'ball':
        return this.kickBall(1)
      case 'rocker':
        this.rock.v += 2.4
        sfx.rock()
        return
      case 'family:kaylee':
        this.kaylee.react('hop')
        sfx.giggle()
        return
      case 'family:nick':
        if (this.hatOn) return this.hatOff()
        this.nick.react('hop')
        sfx.haha()
        return
    }
  }

  /** A tap on the box: the next brick hops out to a good spot (the card's next place, the top of the tower). */
  private tapBox() {
    const c = this.phase === 'build' ? this.grid.tapSpot(this.round, this.card) : null
    const b = c ? this.takeFromBox() : null
    if (!c || !b) {
      this.boxPop = 0
      sfx.boingy()
      return
    }
    sfx.lift()
    this.kaylee.react('wiggle')
    this.dropTo(b, c, 0.42, 0.9)
  }

  /** A tap on a brick in the stack: boing, it squashes and the stack wiggles. On the glowing stack: push it over. */
  private pokeBrick(b: Brick) {
    if (b.state !== 'grid') return
    if (this.glowing) return this.pushOver()
    b.land = 0
    b.rock = 0.8
    this.sway.v += (Math.random() < 0.5 ? -1 : 1) * 0.12
    sfx.boingy()
  }

  private popWall(x: number, y: number) {
    this.ray.setFromCamera(this.ndc(x, y), this.rig.camera)
    const hit = this.ray.intersectObject(this.built.wall, true)[0]?.point
    const p = hit ?? V(1.6, 0.6, WALL.z)
    let best = this.built.wallBricks[0]
    for (const w of this.built.wallBricks) if (Math.hypot(w.at[0] - p.x, w.at[1] - p.y) < Math.hypot(best.at[0] - p.x, best.at[1] - p.y)) best = w
    let g = this.wallPops.get(best.color)
    if (!g) {
      g = brick(best.color, this.bag)
      g.scale.setScalar(1.03)
      this.wallPops.set(best.color, g)
      this.scene.add(g)
    }
    if (this.wallPop && this.wallPop.g !== g) this.wallPop.g.visible = false
    g.visible = true
    this.wallPop = { g, at: V(...best.at), t: 0 }
    sfx.wallNote(this.wallNotes++ % 8)
  }

  private kickBall(dir: number) {
    this.ball.vy = 3.2
    this.ball.vx += dir * 1.2
    sfx.ballBoing()
  }

  // ---------------------------------------------------------------- where it lands

  private toScreenPx(world: Vector3, r = 0) {
    const cam = this.rig.camera
    const c = world.clone().project(cam)
    if (c.z > 1) return null
    right.set(1, 0, 0).applyQuaternion(cam.quaternion)
    const e = world.clone().addScaledVector(right, r).project(cam)
    return { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h, r: Math.abs(e.x - c.x) * this.w * 0.5 }
  }

  /** The spot a brick held with its middle at screen (x, y) goes to: the nearest (sideways counts more than up and
   *  down, so it drops straight down onto what's below). */
  spotFor(x: number, y: number) {
    let best: { c: Cell; x: number; y: number; d: number } | null = null
    for (const c of this.allowed()) {
      const s = this.toScreenPx(V(cellX(c), cellY(c), 0))
      if (!s) continue
      const d = Math.hypot(x - s.x, (y - s.y) * 0.7)
      if (!best || d < best.d) best = { c, x: s.x, y: s.y, d }
    }
    return best
  }

  private daddyHead() {
    const r = this.nick.rig
    return r.head.localToWorld(tmp2.set(0, r.face.headY + r.face.R * 0.9, 0)).clone()
  }

  /** Over Daddy's head, the box or the ball? (Screen pixels, the held brick's middle.) */
  private specialAt(x: number, y: number): Special | null {
    const near = (w: Vector3, r: number, min: number) => {
      const s = this.toScreenPx(w, r)
      return !!s && Math.hypot(x - s.x, y - s.y) < Math.max(min, s.r)
    }
    if (near(this.daddyHead(), 0.3, 44)) return 'hat'
    if (near(this.boxAt(BOX.h * 0.7), BOX.w * 0.45, 50)) return 'box'
    if (near(this.built.ball.position, BALL.r, 40)) return 'ball'
    return null
  }

  /** Where the brick in her hand would go now: a special place (Daddy's head, the box, the ball) or a spot. */
  private aim() {
    const h = this.held
    if (!h) return
    this.special = this.specialAt(h.x, h.y - LIFT_PX)
    this.chosen = this.special ? null : this.spotFor(h.x, h.y - LIFT_PX)
  }

  /** The held brick: hanging above her finger, pulled toward the spot it will land on. */
  private holdFrame(dt: number) {
    const h = this.held
    const b = h?.moved ? h.b : null
    if (!h || !b || b.state !== 'held') {
      this.preview.visible = false
      return
    }
    const sx = h.x
    const sy = h.y - LIFT_PX
    this.aim()
    this.ray.setFromCamera(this.ndc(sx, sy), this.rig.camera)
    const free = this.ray.ray.intersectPlane(this.holdPlane, tmp) ?? b.pos
    const goal = free.clone()
    const ch = this.chosen
    if (ch) {
      const brickPx = this.toScreenPx(V(cellX(ch.c), cellY(ch.c), 0), BW / 2)?.r ?? 40
      const pull = Math.max(64, brickPx * 1.5)
      const k = clamp(1 - ch.d / pull) * 0.7
      goal.lerp(V(cellX(ch.c), cellY(ch.c) + 0.04, HOLD_Z), k)
      this.preview.position.set(cellX(ch.c), cellY(ch.c), 0)
      this.preview.visible = true
    } else this.preview.visible = false
    goal.y = Math.max(goal.y, BH / 2)
    const vx = (goal.x - b.pos.x) / Math.max(dt, 1e-3)
    b.pos.lerp(goal, 1 - Math.exp(-dt * 22))
    b.rot.z += (clamp(-vx * 0.02, -0.35, 0.35) - b.rot.z) * (1 - Math.exp(-dt * 10))
  }

  // ---------------------------------------------------------------- per frame

  protected step(dt: number, t: number) {
    for (const l of [...this.later]) {
      if (this.time < l.t) continue
      this.later.splice(this.later.indexOf(l), 1)
      l.f()
    }
    this.holdFrame(dt)

    // ---- The sway: one spring for the stack, each brick leaning by its height ----
    const sw = this.sway
    sw.v += (-60 * sw.a - 4.2 * sw.v) * dt
    sw.a = clamp(sw.a + sw.v * dt, -0.16, 0.16)
    let n0 = 0
    let sumX = 0
    for (const c of this.grid.at.values())
      if (c.r === 0) {
        sumX += cellX(c)
        n0++
      }
    if (n0) sw.pivot = sumX / n0

    // ---- The bricks ----
    let away = 0
    for (const b of this.bricks) {
      const g = b.g
      switch (b.state) {
        case 'box':
          g.visible = false
          continue
        case 'held':
          g.position.copy(b.pos)
          g.rotation.set(0, 0, b.rot.z)
          g.scale.set(1, 1, 1)
          break
        case 'drop': {
          b.t += dt / b.dur
          const k = clamp(b.t)
          g.position.lerpVectors(b.from, b.to, b.arc > 0.3 ? k : ease(k))
          g.position.y += bell(k) * b.arc
          g.rotation.set(0, 0, b.rot.z * (1 - k))
          if (k >= 1) {
            b.rot.set(0, 0, 0)
            this.landed(b)
          }
          break
        }
        case 'grid': {
          const c = this.grid.at.get(b.id)
          if (!c) break
          b.land += dt
          const e = Math.exp(-b.land * 6)
          const sq = e * Math.cos(b.land * 24)
          const sy = 1 - 0.16 * sq
          const x = cellX(c)
          const y = cellY(c)
          g.position.set(x - sw.a * y, y + sw.a * (x - sw.pivot) * 0.3 - (1 - sy) * (BH / 2), 0)
          g.rotation.set(0, 0, sw.a + b.rock * 0.14 * e * Math.sin(b.land * 15))
          g.scale.set(1 + 0.1 * sq, sy, 1 + 0.1 * sq)
          break
        }
        case 'fly':
          away++
          this.flyFrame(b, dt)
          break
        case 'home': {
          away++
          if (b.delay > 0) {
            b.delay -= dt
            this.flyFrame(b, dt)
            break
          }
          if (b.t === 0) b.from.copy(b.pos)
          b.t += dt / b.dur
          const k = clamp(b.t)
          b.pos.lerpVectors(b.from, b.to, k)
          b.pos.y += bell(k) * b.arc
          g.position.copy(b.pos)
          g.rotation.set(b.rot.x * (1 - k), 0, b.rot.z * (1 - k) + k * 0.5)
          g.scale.setScalar(1 - 0.4 * span(k, 0.75, 1))
          if (k >= 1) {
            b.state = 'box'
            g.visible = false
            g.scale.set(1, 1, 1)
            this.boxPop = 0
            if (b.note >= 0) sfx.note(b.note)
            else sfx.thump()
          }
          break
        }
        case 'hat': {
          b.t += dt
          const top = this.daddyHead()
          b.pos.copy(top).add(V(0, BH / 2 - 0.05, 0))
          g.position.copy(b.pos)
          g.rotation.set(0, this.nick.root.rotation.y, Math.sin(b.t * 7) * 0.12 * Math.max(0, 1 - b.t))
          if (b.t > 1.8) this.hatOff()
          break
        }
      }
      g.visible = true
    }
    // Everything's back in the box: what was waiting goes on.
    if (this.phase === 'away' && !away) {
      this.phase = 'build'
      const next = this.pending
      this.pending = null
      next?.()
    }

    // ---- The outlines: the card's places (the ones she can fill now glow), and where the held brick will land ----
    const ghosts = this.round === 2 && this.phase === 'build' ? CARDS[this.card] : []
    const open = this.round === 2 ? this.grid.ghostSpots(this.card) : []
    this.mats.lit.opacity = 0.42 + 0.2 * Math.sin(t * 5)
    this.ghosts.forEach((m, i) => {
      const c = ghosts[i]
      const show = !!c && !this.brickAt(c)
      m.visible = show
      if (!show) return
      m.position.set(cellX(c), cellY(c), 0)
      m.material = open.some((o) => o.s === c.s && o.r === c.r) ? this.mats.lit : this.mats.dim
    })

    // ---- The spire and the elephant's face popping on, the trunk and ears ----
    this.spirePop = Math.min(1, this.spirePop + dt / 0.6)
    this.built.spire.scale.setScalar(Math.max(0.01, this.spirePop < 1 ? span(this.spirePop, 0, 0.4) * (1 + wobble(this.spirePop, 2) * 0.3) : 1))
    this.facePop = Math.min(1, this.facePop + dt / 0.5)
    const f = this.built.face
    f.root.scale.setScalar(Math.max(0.01, this.facePop < 1 ? span(this.facePop, 0, 0.5) * (1 + wobble(this.facePop, 2) * 0.25) : 1))
    if (this.trumpet >= 0) this.trumpet += dt
    const tr = this.trumpet >= 0 ? bell(clamp(this.trumpet / 1.2)) : 0
    f.trunk.rotation.z = 1.3 * tr + Math.sin(t * 2.4) * 0.08
    const flapK = this.trumpet >= 0 && this.trumpet < 2.4 ? 1 : 0.2
    f.earL.rotation.y = -0.15 - Math.abs(Math.sin(t * (flapK > 0.5 ? 9 : 1.6))) * 0.6 * flapK
    f.earR.rotation.y = 0.15 + Math.abs(Math.sin(t * (flapK > 0.5 ? 9 : 1.6))) * 0.6 * flapK

    // ---- The pokeables: the box, the easel's card, the stars, the wall's brick, the ball, the rocker ----
    this.boxPop = Math.min(1, this.boxPop + dt / 0.4)
    const bp = this.boxPop < 1 ? wobble(this.boxPop, 2) * 0.12 : 0
    this.built.box.scale.set(1 - bp * 0.5, 1 + bp, 1 - bp * 0.5)
    if (this.flip.t < 1) {
      this.flip.t = Math.min(1, this.flip.t + dt / 0.7)
      this.built.card.rotation.y = this.flip.t * Math.PI * 2
      if (this.flip.t > 0.25 && this.picture !== this.flip.to) {
        this.picture = this.flip.to
        for (const [id, g] of Object.entries(this.built.pictures)) g.visible = id === this.picture
      }
      if (this.flip.t >= 1) this.built.card.rotation.y = 0
    }
    this.built.starSlots.rotation.z *= Math.exp(-dt * 6)
    this.built.stars.forEach((s, i) => {
      this.starPop[i] = Math.min(1, this.starPop[i] + dt / 0.6)
      let k = this.starPop[i] < 1 ? span(this.starPop[i], 0, 0.3) * (1 + wobble(this.starPop[i], 2) * 0.5) : 1
      if (this.starTwinkle >= 0) k *= 1 + 0.35 * bell(clamp((this.starTwinkle - i * 0.18) / 0.35))
      s.scale.setScalar(Math.max(0.01, k))
      s.rotation.z = Math.sin(t * 1.5 + i) * 0.08
    })
    if (this.starTwinkle >= 0) {
      const before = this.starTwinkle
      this.starTwinkle += dt
      for (let i = 0; i < this.stars; i++) if (before < i * 0.18 && this.starTwinkle >= i * 0.18) sfx.note(6 + i * 2)
      if (this.starTwinkle > 1.2) this.starTwinkle = -1
    }
    const wp = this.wallPop
    if (wp) {
      wp.t += dt
      const k = clamp(wp.t / 0.6)
      wp.g.position.copy(wp.at).add(V(0, 0.03 * bell(k), 0.3 * bell(k) + 0.01))
      wp.g.rotation.z = Math.sin(k * Math.PI * 3) * 0.1 * (1 - k)
      if (k >= 1) {
        wp.g.visible = false
        this.wallPop = null
      }
    }
    const ball = this.ball
    ball.vy -= 9 * dt
    ball.y += ball.vy * dt
    if (ball.y < 0) {
      ball.y = 0
      ball.vy = Math.abs(ball.vy) > 0.8 ? -ball.vy * 0.55 : 0
      if (Math.abs(ball.vy) > 0.8) sfx.bounce(2)
    }
    ball.vx += (-ball.x * 3 - ball.vx * 1.4) * dt
    ball.x += ball.vx * dt
    ball.roll += (ball.vx * dt) / BALL.r
    this.built.ball.position.set(BALL.x + ball.x, BALL.r + ball.y, BALL.z)
    this.built.ball.rotation.z = -ball.roll
    const rk = this.rock
    rk.v += (-14 * rk.a - 1.0 * rk.v) * dt
    rk.a += rk.v * dt
    this.built.rocker.rotation.z = clamp(rk.a, -0.4, 0.4) * 0.6

    // ---- Kaylee and Daddy: they watch the brick in her hand, the top of the stack, each other ----
    const k = this.kaylee
    const nick = this.nick
    const held = this.held?.moved ? this.held.b : null
    const look = held ? held.g.position : this.grid.count ? this.topWorld() : this.daddyHead()
    k.lookAt(look.x, look.y, look.z)
    nick.lookAt(...(held ? held.g.position : this.grid.count ? this.topWorld() : k.position.clone().setY(0.8)).toArray())
    k.update(dt, t)
    nick.update(dt, t)
    this.sneezeFrame(dt)
    // The 👆 shows after a while with nothing touched: Sparkle says what to do, once each time.
    this.talk.hint(this.time, this.lastTouch, () => this.hintAt() !== null, () => (this.glowing ? T.hint.tower : this.round === 2 ? T.hint.card : T.hint.box))
    // Her arms: up toward the brick she's moving, forward for the push.
    this.reachK += ((held ? 1 : 0) - this.reachK) * (1 - Math.exp(-dt * 8))
    if (this.kayleePush >= 0) this.kayleePush = this.kayleePush + dt / 0.5 >= 1 ? -1 : this.kayleePush + dt / 0.5
    const pushK = this.kayleePush >= 0 ? bell(this.kayleePush) : 0
    if (this.reachK > 0.01 || pushK > 0) {
      const r = k.rig
      r.armL.rotation.set(-1.5 * pushK, 0, -1.3 * this.reachK * (1 - pushK) - 0.2 * pushK)
      r.armR.rotation.set(-1.5 * pushK, 0, 1.3 * this.reachK * (1 - pushK) + 0.2 * pushK)
      this.armsSet = true
    } else if (this.armsSet) {
      k.rig.armL.rotation.set(0, 0, 0)
      k.rig.armR.rotation.set(0, 0, 0)
      this.armsSet = false
    }

    this.sparkles.update(dt)
    this.puffs.update(dt)
  }

  /** A flying brick: an arc, a spin, soft bounces on the mats, then lying still (turned flat). */
  private flyFrame(b: Brick, dt: number) {
    b.vel.y -= 7.5 * dt
    b.pos.addScaledVector(b.vel, dt)
    b.rot.addScaledVector(b.spin, dt)
    // How far it reaches down, turned as it is (a brick on its end stands taller).
    const halfH = (Math.abs(Math.cos(b.rot.z)) * BH) / 2 + (Math.abs(Math.sin(b.rot.z)) * BW) / 2
    const floorY = Math.max(BH / 2, halfH * Math.abs(Math.cos(b.rot.x)) + (Math.abs(Math.sin(b.rot.x)) * BD) / 2)
    if (b.pos.y < floorY) {
      b.pos.y = floorY
      if (b.vel.y < -0.9) sfx.bounce(Math.min(3, -b.vel.y))
      b.vel.y = b.vel.y < -0.6 ? -b.vel.y * 0.42 : 0
      b.vel.x *= 0.72
      b.vel.z *= 0.72
      b.spin.multiplyScalar(0.55)
      if (b.vel.y === 0) {
        // Rolling over onto a flat side.
        const q = Math.PI / 2
        b.rot.x += (Math.round(b.rot.x / q) * q - b.rot.x) * Math.min(1, dt * 8)
        b.rot.z += (Math.round(b.rot.z / q) * q - b.rot.z) * Math.min(1, dt * 8)
        b.vel.x *= Math.exp(-dt * 6)
        b.vel.z *= Math.exp(-dt * 6)
      }
    }
    // The mats' edges.
    if (b.pos.x < FLOOR.x0 || b.pos.x > FLOOR.x1) {
      b.pos.x = clamp(b.pos.x, FLOOR.x0, FLOOR.x1)
      b.vel.x *= -0.5
    }
    if (b.pos.z < FLOOR.z0 || b.pos.z > FLOOR.z1) {
      b.pos.z = clamp(b.pos.z, FLOOR.z0, FLOOR.z1)
      b.vel.z *= -0.5
    }
    b.g.position.copy(b.pos)
    b.g.rotation.set(b.rot.x, b.rot.y, b.rot.z)
    b.g.scale.set(1, 1, 1)
    // A brick on its own (off Daddy's head, off the ball) goes home once it lies still (in a knock-down, once the rest
    // have been called home).
    if (b.state === 'fly' && (this.phase !== 'away' || this.time > this.homeAt)) {
      b.still = b.vel.lengthSq() < 0.05 ? b.still + dt : 0
      if (b.still > 0.5) this.goHome(b, 0, 3)
    }
  }

  private topWorld() {
    const id = this.grid.topBrick()
    return id === null ? V(0, BH, 0) : this.bricks[id].g.position.clone()
  }

  // ---------------------------------------------------------------- camera, anchors, the finger

  protected shot(): Shot {
    // On a tall screen: closer in on the build (Kaylee and Daddy at its edges), from a little higher, the box in front.
    if (this.w < this.h) return { center: V(0, 1.15, 0.9), half: V(2.45, 1.6, 1.3), yaw: 0, pitch: 20, minDist: 5 }
    // On a wide one, the whole mat: the box on the left, the ball on the right, up to six rows of bricks.
    return { center: V(-0.1, 1.3, 0.2), half: V(3.3, 1.4, 0.9), yaw: 0, pitch: 12, minDist: 5 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const k = this.kaylee
    switch (id) {
      case 'box':
        return { at: this.boxAt(BOX.h * 0.75), r: BOX.w / 2, glow: this.phase === 'build' && !this.grid.count, max: 160 }
      case 'tower': {
        if (!this.grid.count || this.phase !== 'build') return null
        return { at: this.topWorld(), r: BW / 2, glow: this.glowing, max: 140, prio: 1 }
      }
      case 'easel':
        return { at: V(EASEL.x, EASEL.y, EASEL.z + 0.1), r: EASEL.w * 0.42, max: 140 }
      case 'stars':
        return { at: V(EASEL.x, STAR_Y, EASEL.z + 0.1), r: 0.36, max: 110, prio: 3 }
      case 'wall':
        return { at: V(1.75, BH, WALL.z), r: 0.4, max: 110, prio: 1 }
      case 'ball':
        return { at: this.built.ball.position.clone(), r: BALL.r, max: 120 }
      case 'rocker':
        return { at: V(ROCKER.x, 0.6, ROCKER.z), r: 0.42, max: 130 }
      case 'family:kaylee':
        return { at: k.position.clone().setY(k.position.y + 0.5), r: 0.32, max: 120, prio: 0 }
      case 'family:nick':
        return { at: this.nick.root.position.clone().setY(this.nick.root.position.y + 0.55 * this.nick.height), r: 0.38, max: 130, prio: 0 }
    }
    return null
  }

  /** After a while with nothing touched: the glowing stack, or the box (where every brick starts). */
  protected hintAt() {
    if (this.phase !== 'build' || this.held) return null
    if (this.glowing) return this.topWorld()
    return this.boxAt(BOX.h).setZ(this.boxAt(0).z + 0.2)
  }

  get calm() {
    return false
  }

  qa() {
    const px = (v: Vector3) => {
      const s = this.toScreenPx(v)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    return {
      game: 'blocks',
      round: this.round,
      card: this.card,
      phase: this.phase,
      count: this.grid.count,
      rows: this.grid.top(),
      stack: [...this.grid.at].map(([id, c]) => [c.s, c.r, ...(px(this.bricks[id].g.position) ?? [])]),
      cardDone: this.round === 2 ? `${this.grid.filled(this.card).length}/${CARDS[this.card].length}` : null,
      stars: this.stars,
      glowing: this.glowing,
      sneezing: this.sneeze.t >= 0,
      inBox: this.bricks.filter((b) => b.state === 'box').length,
      held: this.held?.moved ? 'brick' : null,
      chosen: this.chosen ? [this.chosen.c.s, this.chosen.c.r] : null,
      special: this.special,
      touches: this.touches,
      liftPx: LIFT_PX,
      box: px(this.boxAt(BOX.h * 0.75)),
      spots: this.allowed().map((c) => [c.s, c.r, ...(px(V(cellX(c), cellY(c), 0)) ?? [])]),
      tower: this.grid.count ? px(this.topWorld()) : null,
      daddyHead: px(this.daddyHead()),
    }
  }

  dispose() {
    this.detachExtras()
    super.dispose()
  }
}

// The game table in Kaylee's room (planning/around-the-world/thailand/game-table.md): a house plugin, like her
// wardrobe. Tap the table and she walks over and sits on her stool; when a game is on for her (or the house was opened
// from a board-game link, for Dad) the picker opens: a game, a cousin (BB first), Play. The real cousin (never a copy)
// puts their phone away and sits on the stool across from her, the board goes out on the table, and they take turns:
// she taps the die, it tumbles and settles, her piece hops space by space; then the cousin rolls by themselves.
//
// How a turn runs: the rules (rules/*.ts, pure) return the new state at once and the steps to show; this plays the
// steps back one after another (the roll, the hops, a rest, the win, the pass). Every match has a token: Again, another
// game or cousin, Leave and unmount bump it and clear the queue, so a step from an old match can never move a new
// one's piece. Only one tap rolls: the phase leaves `awaiting` in the same call.
//
// While she sits here the table owns the input (its camera, which turns the Roblox stick off; every tap), the house's
// tap targets hide, and the Hub keeps Mommy's question, the mirror and the party button away.
import { Color, Group, Mesh, MeshBasicMaterial, RingGeometry, Vector3, type Object3D } from 'three'
import type { Shot } from '../../../../../engine3d/camera'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import { Particles } from '../../../../../engine3d/particles'
import { PAL } from '../../../../../engine3d/toon'
import { knobs } from '../../../../../kit/knobs'
import { burst, sounds } from '../../../../../../sdk'
import { sfx } from '../../../sfx'
import type { House, HousePlugin } from '../house'
import { DIM, GAME_SEAT } from '../layout'
import { CandyBoard } from './boards/candy'
import { ChutesBoard } from './boards/chutes'
import { UnicornBoard } from './boards/unicorn'
import { CardDeck } from './deck'
import { Die } from './die'
import { COUSINS, cousinUnicorn, GAMES, type CousinId, type GameId, type UnicornColor } from './list'
import { pawnParts, Piece, unicornParts } from './pieces'
import { CANDY_FINISH, candyDraw, cardToken, newDeck, type Card, type Deck } from './rules/candy'
import { chutesRoll } from './rules/chutes'
import { makeDie, other, startTurns, type Step, type Turns, type Who } from './rules/turns'
import { unicornRoll, UNICORN_END } from './rules/unicorn'

type Board = UnicornBoard | CandyBoard | ChutesBoard
/** Each game's finish (a piece there has won). */
const FINISH: Record<GameId, number> = { unicorn: UNICORN_END, candy: CANDY_FINISH, chutes: 36 }

const FILE = 'src/world/places/thailand/activities/hub/board-games/plugin.ts'
const FEEL = knobs('gameTable', 'Game table', FILE, {
  rollTime: { value: 0.9, min: 0.4, max: 2, step: 0.05, label: 'Die roll', unit: 's', note: 'from her tap until the die settles' },
  hopTime: { value: 0.22, min: 0.1, max: 0.6, step: 0.01, label: 'Hop per space', unit: 's', note: 'how long each hop to the next space takes' },
  hopArc: { value: 0.045, min: 0.01, max: 0.12, step: 0.005, label: 'Hop height', unit: 'm' },
  cousinWait: { value: 0.6, min: 0, max: 2, step: 0.05, label: "Cousin's wait", unit: 's', note: 'a little anticipation before the cousin rolls' },
  passPause: { value: 0.45, min: 0, max: 1.5, step: 0.05, label: 'Pass pause', unit: 's', note: 'between one turn and the next' },
  restTime: { value: 1.0, min: 0.4, max: 2.5, step: 0.05, label: 'Rest on a 4', unit: 's', note: 'how long the unicorn naps' },
  camPitch: { value: 64, min: 30, max: 85, step: 1, label: 'Camera pitch', unit: '°', note: 'how steeply it looks down at the board' },
  camYaw: { value: 0, min: -30, max: 45, step: 1, label: 'Camera yaw', unit: '°', note: 'from the front (0) round to the right' },
  camFit: { value: 1, min: 0.6, max: 1.6, step: 0.05, label: 'Camera fit', note: 'below 1: closer' },
  flipTime: { value: 0.7, min: 0.3, max: 1.6, step: 0.05, label: 'Card flip', unit: 's', note: 'Candy Land: from the deck to face up on the pile' },
  cardShow: { value: 0.6, min: 0.2, max: 1.6, step: 0.05, label: 'Card shown', unit: 's', note: 'Candy Land: how long the card and the glowing space show before the piece goes' },
  climbTime: { value: 1.1, min: 0.4, max: 3, step: 0.05, label: 'Ladder climb', unit: 's', note: 'Chutes and Ladders: rung by rung to the top' },
  slideTime: { value: 0.9, min: 0.3, max: 3, step: 0.05, label: 'Slide down', unit: 's', note: 'Chutes and Ladders: whee, down the slide' },
  candyHop: { value: 0.17, min: 0.08, max: 0.5, step: 0.01, label: 'Candy hop per space', unit: 's', note: 'Candy Land moves further, so a bit quicker' },
})

export type Phase = 'off' | 'picking' | 'awaiting' | 'rolling' | 'moving' | 'special' | 'passing' | 'cousin' | 'finished'

/** What the Hub draws over the house (the picker, the turn faces, Again / Games / Leave). */
export interface TableView {
  /** She's at the table with its picker or a game open. */
  open: boolean
  picking: boolean
  phase: Phase
  game: GameId
  vs: CousinId
  piece: UnicornColor
  /** The cousin at the table (null: nobody yet). */
  seated: CousinId | null
  turn: Who
  winner: Who | null
  pos: [number, number]
  /** Candy Land: the card just drawn (`green`, `blue2`), shown big while it plays out. */
  card: string | null
  /** The link's scripted rolls still to come (kept in the address bar). */
  rolls: number[]
  /** Candy Land: the link's scripted draw pile still to come (kept in the address bar). */
  deck: string[]
  /** The games the picker offers: built ones from Dad's links, ready ones in her own house. */
  offered: GameId[]
  /** Opened from Dad's link: the picker also shows the games still to build (dimmed). */
  preview: boolean
}

export interface TableEvents {
  onView(v: TableView): void
}

export interface TableStart {
  /** Open from a board-game link: the picker (`table`) or a game, with the link's state. */
  section: 'table' | GameId
  vs: CousinId
  game: GameId
  piece: UnicornColor
  me: number
  them: number
  turn: Who
  rolls: number[]
  /** Candy Land: the draw pile exactly (a link's deck=), then the discards reshuffled. */
  deck: Card[]
}

/** The table's tap targets (the Hub lays them over the house with the house's own). */
export const TABLE_ANCHORS: AnchorInfo[] = [
  { id: 'trip:table:die', label: 'Die', kind: 'thing' },
  { id: 'trip:table:deck', label: 'Cards', kind: 'thing' },
]

/** Where the die waits for each player, and where it lands: the near edge of the table, in front of the board. */
const NEAR = 0.405
const CORNER: Record<Who, Vector3> = { 0: new Vector3(-0.13, 0, NEAR), 1: new Vector3(0.13, 0, NEAR) }
/** Candy Land's deck and its discard pile, in the same strip. */
const DECK_AT = new Vector3(-0.09, 0, NEAR)
const PILE_AT = new Vector3(0.07, 0, NEAR)
const SPARKLE = ['#FF4F9A', '#FFC83D', '#8FE3C8', '#A8DCFF', '#B9A6F5', '#FFFFFF']

export class TablePlugin implements HousePlugin {
  private house!: House
  private top!: Group
  private idle: Object3D | undefined
  private open = false
  private picking = false
  private wantPicker = false
  private phase: Phase = 'off'
  private game: GameId
  private vs: CousinId
  private piece: UnicornColor
  private seated: CousinId | null = null
  private state: Turns = startTurns()
  private roll = makeDie()
  /** Whose turn the table shows: the rules' turn moves on at once, this one at the pass, once the move has played. */
  private shown: Who = 0
  private token = 0
  private die!: Die
  private cards!: CardDeck
  private deck: Deck = { draw: [], discard: [] }
  /** The deck came from a link (deck=): its draw pile stays in the address bar until it's used up. */
  private scriptedDeck = false
  private card: string | null = null
  private boards = new Map<GameId, Board>()
  private board: Board | null = null
  private pieces: [Piece, Piece] | null = null
  private sparkle!: Particles
  private rings: Mesh[] = []
  private later: { t: number; f: () => void }[] = []
  private waits: { cond: () => boolean; f: () => void }[] = []
  /** The cousin's throwing arm (0..1 of the swing). */
  private toss = -1

  constructor(
    private events: TableEvents,
    /** From a board-game link: every built game shows (Dad's preview), and the link's state is set up. */
    private opts: { preview: boolean; start?: TableStart },
  ) {
    const s = opts.start
    this.game = s?.game ?? 'unicorn'
    this.vs = s?.vs ?? 'bb'
    this.piece = s?.piece ?? 'pink'
  }

  /** The games the picker offers here. */
  private get offered(): GameId[] {
    return GAMES.filter((g) => (this.opts.preview ? g.built : g.ready)).map((g) => g.id)
  }

  attach(house: House) {
    this.house = house
    const parts = house.kit.parts
    this.top = parts.get('gameTable.top') as Group
    this.idle = parts.get('gameTable.idle')
    const bag = house.kit.bag
    this.die = new Die(bag)
    this.die.root.visible = false
    this.top.add(this.die.root)
    this.cards = new CardDeck(bag, DECK_AT, PILE_AT)
    this.cards.root.visible = false
    this.top.add(this.cards.root)
    this.sparkle = new Particles({ kind: 'spray', count: 120, colors: SPARKLE, gravity: 2.5 }, bag)
    house.scene.add(this.sparkle.mesh)
    // A glowing ring on the floor round the stool of whoever's turn it is.
    const t = DIM.gameTable
    for (const x of [t.me.x, t.them.x]) {
      const ring = new Mesh(bag.add(new RingGeometry(0.24, 0.3, 40)), bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0, depthWrite: false })))
      ring.rotation.x = -Math.PI / 2
      ring.position.set(x, DIM.g0 + 0.012, t.z)
      ring.visible = false
      house.scene.add(ring)
      this.rings.push(ring)
    }
    const s = this.opts.start
    if (s) {
      // (The Hub started her already sitting on her stool: at=game-table.)
      this.open = true
      if (s.section === 'table') {
        this.picking = true
        this.phase = 'picking'
      } else {
        this.seat(s.vs, true)
        this.begin({ me: s.me, them: s.them, turn: s.turn, rolls: s.rolls, deck: s.deck })
      }
      house.snapCamera()
      this.emit()
    }
  }

  // ---------------------------------------------------------------- what the Hub's buttons do

  chooseGame(g: GameId) {
    if (!this.picking || !this.offered.includes(g)) return
    this.game = g
    this.emit()
  }
  chooseCousin(c: CousinId) {
    if (!this.picking || !COUSINS.includes(c)) return
    this.vs = c
    this.emit()
  }
  choosePiece(c: UnicornColor) {
    if (!this.picking) return
    this.piece = c
    this.emit()
  }
  /** Play: the chosen cousin comes and sits, the board goes out, Kaylee's turn. */
  play() {
    if (!this.picking || !this.offered.includes(this.game)) return
    this.picking = false
    this.seat(this.vs, false)
    this.begin({ me: 0, them: 0, turn: 0, rolls: [], deck: [] })
    this.house.snapCamera()
    this.emit()
  }
  /** Again: a new match, same game and cousin. */
  again() {
    if (!this.open || this.picking) return
    this.begin({ me: 0, them: 0, turn: 0, rolls: [], deck: [] })
    this.emit()
  }
  /** Back to the picture cards (another game or cousin). The cousin stays seated until Play. */
  games() {
    if (!this.open) return
    this.cancel()
    this.picking = true
    this.phase = 'picking'
    this.showBoard(false)
    this.emit()
  }
  /** Fold the board and get up; the cousin goes back to exactly where they were. */
  leave() {
    if (!this.open) return
    this.cancel()
    this.open = false
    this.picking = false
    this.phase = 'off'
    this.showBoard(false)
    this.unseat()
    for (const r of this.rings) r.visible = false
    // She hops off her stool to the floor beside it.
    this.house.walkTo([1.15, DIM.gameTable.z], undefined, false)
    this.emit()
  }

  // ---------------------------------------------------------------- seating

  private seat(c: CousinId, now: boolean) {
    if (this.seated === c) return
    this.unseat()
    this.seated = c
    this.house.placeFamily(c, GAME_SEAT)
    const m = this.house.family.get(c)
    m?.putPhoneDown()
    if (!now) this.after(0.35, () => m?.react('hop'))
  }
  private unseat() {
    const c = this.seated
    if (!c) return
    this.seated = null
    this.toss = -1
    const m = this.house.family.get(c)
    if (m) m.rig.armR.rotation.x = 0
    this.house.placeFamily(c, null)
    m?.pickPhoneUp()
  }

  // ---------------------------------------------------------------- a match

  /** A new match (or the link's state): the board out, the pieces on their spaces, the die with whoever starts. */
  private begin(s: { me: number; them: number; turn: Who; rolls: number[]; deck: Card[] }) {
    this.cancel()
    this.showBoard(true)
    // (A link copied from a finished game keeps its winner: a piece on the finish has won.)
    const end = FINISH[this.game]
    this.state = startTurns(Math.min(end, s.me), Math.min(end, s.them), s.turn)
    if (this.state.pos[0] >= end) this.state = { ...this.state, turn: 0, winner: 0 }
    else if (this.state.pos[1] >= end) this.state = { ...this.state, turn: 1, winner: 1 }
    this.roll = makeDie(s.rolls)
    this.deck = newDeck(s.deck)
    this.scriptedDeck = s.deck.length > 0
    this.cards.reset()
    this.layout(true)
    this.die.place(CORNER[s.turn])
    this.startTurn()
  }

  /** The die games roll; Candy Land draws a card. */
  private get usesDeck() {
    return this.game === 'candy'
  }

  /** Whoever's turn it is takes it: the new state at once, and the steps to show. */
  private move(): Step[] {
    if (this.game === 'candy') {
      const r = candyDraw(this.state, this.deck)
      this.deck = r.deck
      this.state = r.state
      return r.steps
    }
    const r = (this.game === 'chutes' ? chutesRoll : unicornRoll)(this.state, this.roll())
    this.state = r.state
    return r.steps
  }

  /** The board and its pieces out on the table (or folded away, the idle props back). */
  private showBoard(on: boolean) {
    const bag = this.house.kit.bag
    if (on) {
      let b = this.boards.get(this.game)
      if (!b) {
        b = this.game === 'candy' ? new CandyBoard(bag) : this.game === 'chutes' ? new ChutesBoard(bag) : new UnicornBoard(bag)
        this.boards.set(this.game, b)
        this.top.add(b.root)
      }
      this.board = b
    }
    for (const b of this.boards.values()) b.root.visible = on && b === this.board
    // Her unicorn and the cousin's in the Unicorn game; pawns with their faces in the others.
    const unicorns: [UnicornColor, UnicornColor] = [this.piece, cousinUnicorn(this.vs, this.piece)]
    const keys = this.game === 'unicorn' ? unicorns.map((c) => `u:${c}`) : ['p:kaylee', `p:${this.vs}`]
    if (on && (!this.pieces || this.pieces[0].key !== keys[0] || this.pieces[1].key !== keys[1])) {
      for (const p of this.pieces ?? []) this.top.remove(p.root)
      const parts = (i: number) => (this.game === 'unicorn' ? unicornParts(unicorns[i]) : pawnParts(i === 0 ? 'kaylee' : this.vs))
      this.pieces = [new Piece(bag, keys[0], parts(0), 'trip:table:piece0'), new Piece(bag, keys[1], parts(1), 'trip:table:piece1')]
      for (const p of this.pieces) this.top.add(p.root)
    }
    for (const p of this.pieces ?? []) p.root.visible = on
    this.die.root.visible = on && !this.usesDeck
    this.cards.root.visible = on && this.usesDeck
    if (this.idle) this.idle.visible = !on
  }

  /** Both pieces where the state (or the shown spaces) says, side by side when they share one. */
  private layout(fromState: boolean) {
    if (!this.board || !this.pieces) return
    const at: [number, number] = fromState ? [this.state.pos[0], this.state.pos[1]] : [this.pieces[0].at, this.pieces[1].at]
    const sharing = at[0] === at[1]
    this.pieces.forEach((p, i) => {
      p.at = at[i]
      // The winner stands in the castle's gate.
      const to = fromState && this.state.winner === i ? this.board!.gate() : this.board!.spot(at[i], i as Who, sharing)
      if (fromState) p.place(to)
      else if (p.root.position.distanceTo(to) > 0.002) p.hop(to, 0.18, 0.015)
    })
  }

  private startTurn() {
    const s = this.state
    this.shown = s.winner ?? s.turn
    if (s.winner !== null) {
      this.phase = 'finished'
      this.emit()
      return
    }
    this.pieces?.forEach((p, i) => (p.active = i === s.turn))
    if (s.turn === 0) {
      this.phase = 'awaiting'
      this.emit()
    } else {
      this.phase = 'cousin'
      this.emit()
      void this.cousinTurn(this.token)
    }
  }

  /** Her tap on the die (or the deck): one roll, only on her turn, only once. */
  private kayleeGo() {
    if (this.phase !== 'awaiting' || this.state.turn !== 0) {
      if (this.usesDeck) this.cards.wiggle()
      else this.die.wiggle()
      sfx.plink()
      return
    }
    this.phase = 'rolling'
    this.house.kaylee.react('wiggle')
    const steps = this.move()
    this.emit()
    void this.playSteps(steps, this.token)
  }

  private async cousinTurn(token: number) {
    await this.sleep(FEEL.cousinWait)
    if (token !== this.token) return
    // A swing of the arm, and the die goes.
    this.toss = 0
    await this.sleep(0.25)
    if (token !== this.token) return
    this.phase = 'rolling'
    const steps = this.move()
    this.emit()
    await this.playSteps(steps, token)
  }

  /** Plays a move's steps back in order. Stops as soon as the match changes. */
  private async playSteps(steps: Step[], token: number) {
    for (const s of steps) {
      if (token !== this.token) return
      await this.show(s, token)
    }
  }

  private async show(s: Step, token: number) {
    const pieces = this.pieces!
    const board = this.board!
    switch (s.kind) {
      case 'roll': {
        this.phase = 'rolling'
        this.emit()
        const land = new Vector3((Math.random() - 0.5) * 0.16 + (s.who === 0 ? -0.03 : 0.03), 0, NEAR)
        let done = false
        this.die.rollTo(s.n, land, FEEL.rollTime, () => (done = true))
        await this.until(() => done)
        if (token !== this.token) return
        const at = this.die.root.getWorldPosition(new Vector3())
        this.sparkle.burst(at.x, at.y + 0.05, at.z, 10, 0.6, 0.8, 0.02)
        sfx.plink()
        await this.sleep(0.25)
        return
      }
      case 'draw': {
        this.phase = 'rolling'
        let done = false
        this.cards.draw(s.card, FEEL.flipTime, () => (done = true))
        await this.until(() => done)
        if (token !== this.token) return
        // The card shows big over the table (the Hub), the space it means glows.
        this.card = s.card
        this.emit()
        sfx.plink()
        return
      }
      case 'reshuffle': {
        this.cards.reshuffle()
        await this.sleep(0.65)
        return
      }
      case 'move': {
        this.phase = 'moving'
        const p = pieces[s.who]
        const o = pieces[other(s.who)]
        if (this.usesDeck) {
          board.markSpace(s.to)
          await this.sleep(FEEL.cardShow)
          if (token !== this.token) return
        }
        this.emit()
        const hop = this.usesDeck ? FEEL.candyHop : FEEL.hopTime
        for (let i = s.from + 1; i <= s.to; i++) {
          const step = i - s.from
          const sharing = o.at === i
          p.hop(board.spot(i, s.who, sharing), hop, FEEL.hopArc, () => {
            p.at = i
            sounds.note(Math.min(step, 10))
            // A sparkle on each space it passes (Candy Land's lit trail).
            if (this.usesDeck) {
              const at = this.top.localToWorld(board.spot(i, s.who, false))
              this.sparkle.burst(at.x, at.y + 0.02, at.z, 4, 0.3, 0.5, 0.012)
            }
          })
        }
        await this.until(() => !p.moving)
        if (token !== this.token) return
        board.markSpace(null)
        this.card = null
        // The other piece scoots over if they now share a space (or back to the middle if they don't).
        this.layout(false)
        return
      }
      case 'ladder':
      case 'chute': {
        // The highlight: up the ladder rung by rung with rising notes, or whee down the slide (never a failure).
        this.phase = 'special'
        this.emit()
        const b = board as ChutesBoard
        const p = pieces[s.who]
        const climb = s.kind === 'ladder'
        const pts = climb ? b.ladderPath(s.from, s.to) : b.slidePath(s.from)
        const m = this.seated ? this.house.family.get(this.seated) : undefined
        if (climb) {
          pts.forEach((_, i) => this.after((FEEL.climbTime * i) / pts.length, () => sounds.note(Math.min(10, i))))
          sfx.chime()
        } else {
          sfx.whoosh(FEEL.slideTime)
          this.after(0.15, () => (sfx.giggle(), m?.react('hop')))
        }
        let done = false
        p.glide(pts, climb ? FEEL.climbTime : FEEL.slideTime, climb ? 'climb' : 'slide', () => {
          p.at = s.to
          done = true
        })
        await this.until(() => done)
        if (token !== this.token) return
        const at = this.top.localToWorld(b.spot(s.to, s.who, false))
        this.sparkle.burst(at.x, at.y + 0.03, at.z, climb ? 24 : 12, 0.7, 1, 0.018)
        if (climb) {
          sfx.boing()
          if (s.who === 1) m?.react('hop')
          else this.house.kaylee.react('wave')
        } else sfx.haha()
        this.layout(false)
        await this.sleep(0.3)
        return
      }
      case 'rest': {
        this.phase = 'special'
        this.emit()
        pieces[s.who].rest(FEEL.restTime)
        sfx.flop()
        const at = pieces[s.who].root.getWorldPosition(new Vector3())
        for (let i = 0; i < 3; i++) this.after(0.2 + i * 0.25, () => this.sparkle.emit(at.x, at.y + 0.06, at.z, 0.02, 0.18, 0, 0.9, 0.018, 5))
        await this.sleep(FEEL.restTime)
        return
      }
      case 'win': {
        this.phase = 'special'
        this.emit()
        const p = pieces[s.who]
        p.hop(board.gate(), FEEL.hopTime * 1.6, FEEL.hopArc * 1.6)
        await this.until(() => !p.moving)
        if (token !== this.token) return
        board.cheer()
        p.dance()
        const at = this.top.localToWorld(board.castleTop())
        this.sparkle.burst(at.x, at.y, at.z, 60, 1.2, 1.4, 0.03)
        sounds.fanfare()
        burst(s.who === 0 ? 0.35 : 0.65, 0.5)
        const m = this.seated ? this.house.family.get(this.seated) : undefined
        if (s.who === 0) {
          this.house.kaylee.react('wave')
          m?.react('wave')
        } else {
          m?.react('hop')
          sfx.cheer()
        }
        await this.sleep(1.1)
        if (token !== this.token) return
        this.phase = 'finished'
        this.pieces?.forEach((q) => (q.active = false))
        this.emit()
        return
      }
      case 'pass': {
        this.phase = 'passing'
        this.emit()
        await this.sleep(FEEL.passPause)
        if (token !== this.token) return
        if (!this.usesDeck) this.die.slideTo(CORNER[s.to])
        this.startTurn()
        return
      }
      default:
        return
    }
  }

  /** Stops whatever the match was doing: no old step can touch what comes next. */
  private cancel() {
    this.token++
    this.later = []
    this.waits = []
    this.toss = -1
    this.die?.stop()
    this.cards?.stop()
    this.board?.markSpace(null)
    this.card = null
    this.pieces?.forEach((p) => {
      p.stop()
      p.active = false
    })
    const m = this.seated ? this.house?.family.get(this.seated) : undefined
    if (m) m.rig.armR.rotation.x = 0
    if (this.board) this.layout(true)
  }

  private after(sec: number, f: () => void) {
    this.later.push({ t: sec, f })
  }
  private sleep(sec: number) {
    return new Promise<void>((res) => this.after(sec, res))
  }
  private until(cond: () => boolean) {
    return new Promise<void>((res) => this.waits.push({ cond, f: res }))
  }

  private emit() {
    this.events.onView(this.view())
  }
  view(): TableView {
    return { open: this.open, picking: this.picking, phase: this.phase, game: this.game, vs: this.vs, piece: this.piece, seated: this.seated, turn: this.shown, winner: this.state.winner, pos: [this.state.pos[0], this.state.pos[1]], card: this.card, rolls: this.roll.left(), deck: this.scriptedDeck ? this.deck.draw.map(cardToken) : [], offered: this.offered, preview: this.opts.preview }
  }

  // ---------------------------------------------------------------- the house's hooks

  tap(_x: number, _y: number, id?: string) {
    if (!this.open) {
      // Over to her stool (the house walks her there and sits her down); with a game to play, the picker opens.
      if (id === 'game-table' && this.offered.length) this.wantPicker = true
      else this.wantPicker = false
      return false
    }
    // At the table, every tap is the table's: nothing walks her off by accident.
    if (id === 'trip:table:die' || id === 'trip:table:deck') this.kayleeGo()
    else if (id === 'trip:table:piece0' || id === 'trip:table:piece1') {
      this.pieces?.[id.endsWith('0') ? 0 : 1].poke()
      sfx.boing()
    } else if (id === 'trip:table:castle') {
      this.board?.cheer()
      const at = this.top.localToWorld(this.board!.castleTop())
      this.sparkle.burst(at.x, at.y, at.z, 16, 0.7, 1, 0.02)
      sfx.chime()
    } else if (id === `family:${this.seated}`) {
      this.house.family.get(this.seated!)?.react('hop')
      sfx.giggle()
    } else if (id === 'kaylee' || id === 'family:kaylee') {
      this.house.kaylee.react('wiggle')
      sfx.giggle()
    } else if (id === 'unicorn-bag') this.house.pokeThing('unicorn-bag')
    return true
  }

  /** While she plays, a finger that drags across the board is the table's too: it never walks her off her stool. */
  pointerDown() {
    return this.open
  }
  pointerMove() {
    return this.open
  }

  hides(id: string) {
    // While she plays, the house's own targets wait (the table's would sit over the board), except the unicorn bag.
    return this.open && id !== 'unicorn-bag'
  }

  anchor(id: string) {
    if (!this.open || this.picking) return null
    const thing = id === 'trip:table:die' ? this.die.root : id === 'trip:table:deck' ? this.cards.stack : null
    if (!thing || !thing.parent?.visible || !(thing === this.die.root ? thing.visible : this.cards.root.visible)) return null
    return { at: thing.getWorldPosition(new Vector3()), r: 0.12, glow: this.phase === 'awaiting' }
  }

  get roots(): Object3D[] {
    if (!this.open || this.picking) return []
    return [this.usesDeck ? this.cards.stack : this.die.root, ...(this.pieces?.map((p) => p.root) ?? []), ...(this.board ? [this.board.root] : [])]
  }

  shot(): Shot | null {
    if (!this.open) return null
    const t = DIM.gameTable
    const { w, h } = this.house.size
    const tall = w < h
    const fit = FEEL.camFit
    if (this.picking) {
      // The table, both stools and the bag, kept clear of the picker: on its left on a wide screen, above it on a tall one.
      return {
        center: new Vector3(t.x + (tall ? 0 : 0.55), DIM.g0 + 0.45, t.z + (tall ? 0.55 : 0.2)),
        half: tall ? new Vector3(0.8, 0.6, 1.1) : new Vector3(1.25, 0.55, 0.75),
        yaw: 8,
        pitch: 48,
        minDist: 1.2,
      }
    }
    // Playing: the board close up, both players at the sides.
    const half = tall ? new Vector3(0.42, 0.5, 0.52) : new Vector3(0.78, 0.42, 0.5)
    return {
      center: new Vector3(t.x, DIM.g0 + t.h + (tall ? 0.05 : 0.12), t.z + 0.04),
      half: half.multiplyScalar(fit),
      yaw: FEEL.camYaw,
      pitch: FEEL.camPitch,
      minDist: 1.2,
    }
  }

  get busy() {
    return this.later.length > 0 || this.waits.length > 0 || this.die.busy || this.cards.busy || this.sparkle.busy || !!this.board?.busy || !!this.pieces?.some((p) => p.busy) || this.wantPicker || this.open
  }

  update(dt: number, t: number) {
    // She's sitting down after a tap on the table: once she's on her stool, the picker opens.
    if (this.wantPicker) {
      const k = this.house.kaylee
      const p = k.position
      const t0 = DIM.gameTable
      if (k.pose === 'sit' && !k.walking && Math.hypot(p.x - t0.me.x, p.z - t0.z) < 0.1) {
        this.wantPicker = false
        this.open = true
        this.picking = true
        this.phase = 'picking'
        sounds.pop()
        this.emit()
      } else if (!k.walking && k.pose !== 'sit') this.wantPicker = false
    }
    // Timers and waits (frame-driven: they stop with the house).
    if (this.later.length) {
      for (const l of this.later) l.t -= dt
      const due = this.later.filter((l) => l.t <= 0)
      this.later = this.later.filter((l) => l.t > 0)
      for (const l of due) l.f()
    }
    if (this.waits.length) {
      const due = this.waits.filter((w) => w.cond())
      this.waits = this.waits.filter((w) => !due.includes(w))
      for (const w of due) w.f()
    }
    this.die.update(dt, t)
    this.die.setGlow(this.phase === 'awaiting')
    this.cards.update(dt, t)
    this.cards.setGlow(this.phase === 'awaiting')
    this.board?.update(dt, t)
    this.pieces?.forEach((p) => p.update(dt, t))
    this.sparkle.update(dt)
    // The cousin's arm swings forward to roll.
    const m = this.seated ? this.house.family.get(this.seated) : undefined
    if (m && this.toss >= 0) {
      this.toss = Math.min(1, this.toss + dt / 0.55)
      m.rig.armR.rotation.x = -Math.sin(this.toss * Math.PI) * 1.1
      if (this.toss >= 1) {
        this.toss = -1
        m.rig.armR.rotation.x = 0
      }
    }
    // The ring under whoever's turn it is.
    const playing = this.open && !this.picking && this.phase !== 'finished'
    this.rings.forEach((r, i) => {
      const on = playing && this.shown === i
      r.visible = on
      if (on) {
        ;(r.material as MeshBasicMaterial).opacity = 0.45 + Math.sin(t * 4) * 0.2
        ;(r.material as MeshBasicMaterial).color = i === 0 ? RING_ME : RING_THEM
      }
    })
  }

  qa() {
    return {
      table: { open: this.open, picking: this.picking, phase: this.phase, game: this.game, vs: this.vs, piece: this.piece, seated: this.seated, me: this.state.pos[0], them: this.state.pos[1], turn: this.shown === 0 ? 'kaylee' : 'cousin', winner: this.state.winner === null ? null : this.state.winner === 0 ? 'kaylee' : 'cousin', token: this.token, die: this.die.value, card: this.card, deck: this.deck.draw.length, discard: this.deck.discard.length },
    }
  }
}

const RING_ME = new Color(PAL.hotpink)
const RING_THEM = new Color(PAL.lavenderDark)

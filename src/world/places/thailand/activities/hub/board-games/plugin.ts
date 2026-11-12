// The game table in Kaylee's room (planning/around-the-world/thailand/game-table.md): a house plugin, like her
// wardrobe. Tap the table and she walks over and sits on her stool; then the screen fades and the game is out on a
// floating board (stage.ts): a little island in a pastel sky, no characters in sight. The picker opens over it (a game,
// a cousin with BB first, Play; the island shows the picked game's board and props as she picks). On Play the cousin
// sits down across the table back in the room (unseen: their face shows at the side of the screen) and they take
// turns: she taps the die, it tumbles and settles, her piece hops space by space; then the cousin rolls by themselves.
// 👋 fades back to the room, where she hops off her stool.
//
// How a turn runs: the rules (rules/*.ts, pure) return the new state at once and the steps to show; this plays the
// steps back one after another (the roll, the hops, a rest, the win, the pass). Every match has a token: Again, another
// game or cousin, Leave and unmount bump it and clear the queue, so a step from an old match can never move a new
// one's piece. Only one tap rolls: the phase leaves `awaiting` in the same call.
//
// While she sits here the table owns the input (its camera, which turns the Roblox stick off; every tap), the house's
// tap targets hide, and the Hub keeps Mommy's question, the mirror and the party button away.
import { Group, Vector3, type Object3D } from 'three'
import type { Shot } from '../../../../../engine3d/camera'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import { Particles } from '../../../../../engine3d/particles'
import { knobs } from '../../../../../kit/knobs'
import { burst, sounds, type Line } from '../../../../../../sdk'
import { L } from '../../../lines'
import { sfx } from '../../../sfx'
import type { House, HousePlugin } from '../house'
import { DIM, GAME_SEAT } from '../layout'
import { CandyBoard } from './boards/candy'
import { ChutesBoard } from './boards/chutes'
import { UnicornBoard } from './boards/unicorn'
import { CardDeck } from './deck'
import { Die } from './die'
import { cousinFace, kayleeFace, pieceFace } from './faces'
import { COUSINS, cousinUnicorn, GAMES, UNICORNS, type CousinId, type GameId, type UnicornColor } from './list'
import { pawnParts, Piece, unicornParts } from './pieces'
import { FloatingStage, onStage, STAGE_LAYER } from './stage'
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
  restTime: { value: 1.05, min: 0.4, max: 2.5, step: 0.05, label: 'Rest on a 4', unit: 's', note: 'how long the unicorn naps' },
  camPitch: { value: 40, min: 20, max: 85, step: 1, label: 'Camera pitch', unit: '°', note: 'how steeply it looks down at the floating board' },
  camYaw: { value: 16, min: -45, max: 45, step: 1, label: 'Camera yaw', unit: '°', note: 'from the front (0) round to the right' },
  camFit: { value: 1, min: 0.6, max: 1.6, step: 0.05, label: 'Camera fit', note: 'below 1: closer' },
  fadeTime: { value: 0.45, min: 0.15, max: 1.2, step: 0.05, label: 'Fade', unit: 's', note: 'the fade between her room and the floating board, each way' },
  swoopTime: { value: 1.8, min: 0, max: 4, step: 0.1, label: 'Swoop in', unit: 's', note: 'the camera gliding down onto the floating board as it fades in' },
  flipTime: { value: 0.75, min: 0.3, max: 1.6, step: 0.05, label: 'Card flip', unit: 's', note: 'Candy Land: from the deck to face up on the pile' },
  cardShow: { value: 0.6, min: 0.2, max: 1.6, step: 0.05, label: 'Card shown', unit: 's', note: 'Candy Land: how long the card and the glowing space show before the piece goes' },
  climbTime: { value: 1.1, min: 0.4, max: 3, step: 0.05, label: 'Ladder climb', unit: 's', note: 'Chutes and Ladders: rung by rung to the top' },
  slideTime: { value: 0.9, min: 0.3, max: 3, step: 0.05, label: 'Slide down', unit: 's', note: 'Chutes and Ladders: whee, down the slide' },
  pieceSize: { value: 1.3, min: 0.8, max: 1.8, step: 0.05, label: 'Piece size', note: 'the unicorns and pawns (1: the greybox size)' },
  candyHop: { value: 0.17, min: 0.08, max: 0.5, step: 0.01, label: 'Candy hop per space', unit: 's', note: 'Candy Land moves further, so a bit quicker' },
})

export type Phase = 'off' | 'picking' | 'awaiting' | 'rolling' | 'moving' | 'special' | 'passing' | 'cousin' | 'finished'

/** What the Hub draws over the house (the picker, the turn faces, Again / Games / Leave). */
export interface TableView {
  /** She's at the table with its picker or a game open. */
  open: boolean
  /** The floating board is showing (not the room). */
  stage: boolean
  /** The fade between the room and the floating board is covering the screen. */
  curtain: boolean
  /** Seconds the fade takes each way. */
  fade: number
  picking: boolean
  /** While picking: the games and cousins (`game`), or, after ▶ in the Unicorn game, her unicorn's color (`color`). */
  step: PickStep
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
  /** Pictures of their real 3D faces (JPEG data URLs), once they've been taken. */
  faces: Partial<Record<CousinId | 'kaylee', string>>
  /** Pictures of the four unicorn pieces (the color step's buttons), once they've been taken. */
  pieceFaces: Partial<Record<UnicornColor, string>>
}

export type PickStep = 'game' | 'color'

export interface TableEvents {
  onView(v: TableView): void
  /** A line to say: Sparkle's (a plain string, in her corner with its bubble) or the cousin's (in their own voice). */
  say(line: Line): void
}

/** Per visit to the app: Sparkle says each game's how-to, the picker's line and the rule of the 4 once. */
const told = new Set<string>()
/** The cousins' roll lines go in turn, and only now and then (every ROLL_EVERY-th of their turns). */
const ROLL_EVERY = 3
let rollLine = 0
/** Her wins this visit: Sparkle cheers the first one. */
let wins = 0

export interface TableStart {
  /** Open from a board-game link: the picker (`table`), the Unicorn game's color step (`colors`) or a game, with the
   *  link's state. */
  section: 'table' | 'colors' | GameId
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
  private step: PickStep = 'game'
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
  private later: { t: number; f: () => void }[] = []
  private waits: { cond: () => boolean; f: () => void }[] = []
  /** The fades' own timers (a new match or Leave never cancels a fade halfway). */
  private fx: { t: number; f: () => void }[] = []
  /** The cousin's turns this match (their roll lines are only now and then). */
  private cousinTurns = 0
  /** The cousin just sat down for this match (they say they're in). */
  private justSat = false
  private floating!: FloatingStage
  /** The floating board is showing. */
  private stage = false
  private curtain = false
  /** Seconds since the floating board faded in (the camera swoops down for the first few; -1: no swoop). */
  private arriveT = -1
  private faces: Partial<Record<CousinId | 'kaylee', string>> = {}
  private pieceFaces: Partial<Record<UnicornColor, string>> = {}

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
    // The sparkles show in the room (the unicorn bag) and on the floating board.
    this.sparkle.mesh.layers.enable(STAGE_LAYER)
    // The floating board's island (under the table top) and its sky (round it).
    const t = DIM.gameTable
    this.floating = new FloatingStage(bag, this.top, new Vector3(t.x, DIM.g0 + t.h, t.z))
    house.scene.add(this.floating.sky)
    onStage(this.die.root)
    onStage(this.cards.root)
    const s = this.opts.start
    if (s) {
      // (The Hub started her already sitting on her stool: at=game-table. A link goes straight to the floating board.)
      this.open = true
      this.toStage(true)
      if (s.section === 'table') {
        this.picking = true
        this.phase = 'picking'
        this.preview()
        this.tell('pick', L.games.pick, 0.8)
      } else if (s.section === 'colors') {
        this.picking = true
        this.phase = 'picking'
        this.game = 'unicorn'
        this.step = 'color'
        this.preview()
        this.tell('color', L.games.color, 0.8)
      } else {
        this.seat(s.vs)
        this.justSat = false
        this.begin({ me: s.me, them: s.them, turn: s.turn, rolls: s.rolls, deck: s.deck })
      }
      house.snapCamera()
      this.emit()
    }
  }

  // ---------------------------------------------------------------- the fade to the floating board and back

  /** Onto the floating board: the house camera (and its taps) switch to the stage's layer, the sky comes up. `now`:
   *  at once (a link); otherwise the camera swoops down onto it as the fade lifts. */
  private toStage(now: boolean) {
    this.stage = true
    this.floating.show(true, this.house.scene)
    this.floating.setGame(this.game)
    this.house.showLayer(STAGE_LAYER)
    this.arriveT = now || FEEL.swoopTime <= 0 ? -1 : 0
    this.house.snapCamera()
  }
  /** Back in the room. */
  private toRoom() {
    this.stage = false
    this.arriveT = -1
    this.floating.show(false, this.house.scene)
    this.house.showLayer(null)
    this.house.snapCamera()
  }
  /** The fade: the curtain comes down, `swap` happens under it, and it lifts. */
  private fade(swap: () => void) {
    this.curtain = true
    this.emit()
    sfx.whoosh(FEEL.fadeTime * 1.6)
    this.fxAfter(FEEL.fadeTime, () => {
      swap()
      // A moment fully covered (the new view's first frame drawn), then it lifts.
      this.fxAfter(0.08, () => {
        this.curtain = false
        this.emit()
      })
    })
  }
  private fxAfter(sec: number, f: () => void) {
    this.fx.push({ t: sec, f })
  }

  /** While picking: the picked game's board out on the island with the pieces at the start, so she sees what she's
   *  picking. */
  private preview() {
    this.cancel()
    this.state = startTurns(0, 0, 0)
    this.showBoard(true)
    this.layout(true)
    this.die.place(CORNER[0])
  }

  // ---------------------------------------------------------------- what the Hub's buttons do

  chooseGame(g: GameId) {
    if (!this.picking || this.step !== 'game' || !this.offered.includes(g)) return
    this.game = g
    if (this.stage) this.preview()
    this.emit()
  }
  chooseCousin(c: CousinId) {
    if (!this.picking || this.step !== 'game' || !COUSINS.includes(c)) return
    this.vs = c
    if (this.stage) this.preview()
    this.emit()
  }
  choosePiece(c: UnicornColor) {
    if (!this.picking || this.step !== 'color') return
    this.piece = c
    if (this.stage) this.preview()
    this.emit()
  }
  /** Play: in the Unicorn game, first her unicorn's color (a second step, with its own ▶); then the chosen cousin comes
   *  and sits, the board goes out, Kaylee's turn. */
  play() {
    if (!this.picking || !this.offered.includes(this.game)) return
    if (this.game === 'unicorn' && this.step === 'game') {
      this.step = 'color'
      this.emit()
      this.tell('color', L.games.color, 0.3)
      return
    }
    this.picking = false
    this.step = 'game'
    this.seat(this.vs)
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
  /** Back to the picture cards (another game or cousin), from a game or from the color step. The cousin stays seated
   *  until Play. */
  games() {
    if (!this.open) return
    this.cancel()
    this.step = 'game'
    this.picking = true
    this.phase = 'picking'
    this.preview()
    this.emit()
  }
  /** Fold the board and get up; the cousin goes back to exactly where they were. */
  leave() {
    if (!this.open || this.curtain) return
    this.cancel()
    const was = this.seated
    // The fade back to her room; there she hops off her stool to the floor beside it.
    this.fade(() => {
      this.open = false
      this.picking = false
      this.step = 'game'
      this.phase = 'off'
      this.showBoard(false)
      this.unseat()
      this.toRoom()
      if (was) this.events.say(L.games.cousins[was].bye)
      this.house.walkTo([1.15, DIM.gameTable.z], undefined, false)
    })
  }

  // ---------------------------------------------------------------- seating

  /** The cousin sits on the stool across the table in her room (so they're there when she fades back), phone away. */
  private seat(c: CousinId) {
    if (this.seated === c) return
    this.unseat()
    this.seated = c
    this.justSat = true
    this.house.placeFamily(c, GAME_SEAT)
    this.house.family.get(c)?.putPhoneDown()
  }
  private unseat() {
    const c = this.seated
    if (!c) return
    this.seated = null
    this.house.placeFamily(c, null)
    this.house.family.get(c)?.pickPhoneUp()
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
    this.cousinTurns = 0
    // The cousin who just sat down says they're in.
    const sat = this.justSat
    this.justSat = false
    if (sat && this.lines) {
      const sit = this.lines.sit
      this.after(0.55, () => this.events.say(sit))
    }
    this.startTurn()
    // How to play, the first time she opens this game in a visit (after the cousin says they're in).
    this.tell(`howto:${this.game}`, L.games.howto[this.game], sat ? 1.9 : 0.6)
  }

  /** Sparkle's line, once per visit (`key`), after `wait` seconds. If the match changes first it's dropped, and it
   *  comes the next time instead (it only counts as said once it's said). */
  private tell(key: string, line: Line, wait = 0) {
    if (told.has(key)) return
    this.after(wait, () => {
      if (told.has(key)) return
      told.add(key)
      this.events.say(line)
    })
  }
  /** The seated cousin's lines. */
  private get lines() {
    return this.seated ? L.games.cousins[this.seated] : null
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
        onStage(b.root)
      }
      // Another game: its board pops in with a sparkle, and the island dresses for it.
      if (this.board !== b && this.stage) {
        this.floating.pop(b.root)
        const at = this.top.localToWorld(new Vector3(0, 0.05, 0))
        this.sparkle.burst(at.x, at.y, at.z, 30, 0.9, 1.1, 0.022)
        sfx.chime()
      }
      this.board = b
      this.floating.setGame(this.game)
    }
    for (const b of this.boards.values()) b.root.visible = on && b === this.board
    // Her unicorn and the cousin's in the Unicorn game; pawns with their faces in the others.
    const unicorns: [UnicornColor, UnicornColor] = [this.piece, cousinUnicorn(this.vs, this.piece)]
    const keys = this.game === 'unicorn' ? unicorns.map((c) => `u:${c}`) : ['p:kaylee', `p:${this.vs}`]
    if (on && (!this.pieces || this.pieces[0].key !== keys[0] || this.pieces[1].key !== keys[1])) {
      for (const p of this.pieces ?? []) this.top.remove(p.root)
      const parts = (i: number) => (this.game === 'unicorn' ? unicornParts(unicorns[i]) : pawnParts(i === 0 ? 'kaylee' : this.vs))
      this.pieces = [new Piece(bag, keys[0], parts(0), 'trip:table:piece0'), new Piece(bag, keys[1], parts(1), 'trip:table:piece1')]
      for (const p of this.pieces) {
        p.root.scale.setScalar(FEEL.pieceSize)
        this.top.add(p.root)
        onStage(p.root)
      }
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
    // Now and then they say something before they roll (in turn, never every time).
    if (this.cousinTurns++ % ROLL_EVERY === 1 && this.lines) this.events.say(this.lines.roll[rollLine++ % this.lines.roll.length])
    await this.sleep(FEEL.cousinWait)
    if (token !== this.token) return
    // The die wiggles in their corner, and goes.
    if (!this.usesDeck) this.die.wiggle()
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
        if (s.who === 1 && this.lines) this.events.say(climb ? this.lines.ladder : this.lines.slide)
        if (climb) {
          pts.forEach((_, i) => this.after((FEEL.climbTime * i) / pts.length, () => sounds.note(Math.min(10, i))))
          sfx.chime()
        } else {
          sfx.whoosh(FEEL.slideTime)
          this.after(0.15, () => sfx.giggle())
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
        if (climb) sfx.boing()
        else sfx.haha()
        this.layout(false)
        await this.sleep(0.3)
        return
      }
      case 'rest': {
        this.phase = 'special'
        this.emit()
        pieces[s.who].rest(FEEL.restTime)
        sfx.flop()
        // The first nap of the visit: Sparkle says the rule; after that the cousin yawns along on their own naps.
        if (!told.has('nap')) this.tell('nap', L.games.nap)
        else if (s.who === 1 && this.lines) this.events.say(this.lines.nap)
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
        if (s.who === 0) {
          // Her first win of the visit: Sparkle. After that the cousin says well done (or, without a cousin, Sparkle in
          // turn).
          if (wins++ === 0) this.events.say(L.games.won)
          else if (this.lines) this.events.say(this.lines.lose)
          else this.events.say(L.games.wonAgain[(wins - 2) % L.games.wonAgain.length])
        } else {
          sfx.cheer()
          if (this.lines) this.events.say(this.lines.win)
        }
        this.party()
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
    this.die?.stop()
    this.cards?.stop()
    this.board?.markSpace(null)
    this.card = null
    this.pieces?.forEach((p) => {
      p.stop()
      p.active = false
    })
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
    return { open: this.open, stage: this.stage, curtain: this.curtain, fade: FEEL.fadeTime, picking: this.picking, phase: this.phase, game: this.game, vs: this.vs, piece: this.piece, seated: this.seated, turn: this.shown, winner: this.state.winner, pos: [this.state.pos[0], this.state.pos[1]], card: this.card, rolls: this.roll.left(), deck: this.scriptedDeck ? this.deck.draw.map(cardToken) : [], offered: this.offered, preview: this.opts.preview, faces: this.faces, pieceFaces: this.pieceFaces, step: this.step }
  }

  // ---------------------------------------------------------------- the house's hooks

  tap(_x: number, _y: number, id?: string) {
    // Under the fade, taps wait.
    if (this.curtain) return true
    if (!this.open) {
      // Over to her stool (the house walks her there and sits her down); with a game to play, the picker opens.
      if (id === 'game-table' && this.offered.length) this.wantPicker = true
      else this.wantPicker = false
      if (id === 'unicorn-bag') {
        this.pokeBag()
        return true
      }
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
    } else if (id?.startsWith('trip:table:prop:')) {
      // The island's props (and the balloons): a wobble, its sound, a twinkle.
      const p = this.floating.poke(id)
      if (p) {
        sfx[p.sound === 'pop' ? 'plink' : p.sound]()
        this.sparkle.burst(p.at.x, p.at.y, p.at.z, 10, 0.5, 0.7, 0.014)
      }
    }
    return true
  }

  /** The unicorn bag: a wobble, a jingle and a twinkle on its horn (in the room too, not only at the table). */
  pokeBag() {
    this.house.pokeThing('unicorn-bag')
    sfx.chime()
    const b = DIM.gameTable.bag
    this.after(0.12, () => this.sparkle.burst(b.x, DIM.g0 + 0.42, b.z, 14, 0.5, 0.7, 0.014))
  }

  /** The small win party at the table: sparkles rain over the board for a moment and the bag joins in. */
  private party() {
    const t = DIM.gameTable
    for (let i = 0; i < 6; i++)
      this.after(0.15 + i * 0.22, () => {
        const x = t.x + (Math.random() - 0.5) * t.w * 0.8
        const z = t.z + (Math.random() - 0.5) * t.d * 0.8
        this.sparkle.burst(x, DIM.g0 + t.h + 0.45, z, 14, 0.5, 0.6, 0.02)
      })
    this.after(0.5, () => this.house.pokeThing('unicorn-bag'))
  }

  /** While she plays, a finger that drags across the board is the table's too: it never walks her off her stool. */
  pointerDown() {
    return this.open
  }
  pointerMove() {
    return this.open
  }

  hides(_id: string) {
    // At the table (on the floating board, or fading to it), the house's own targets wait.
    return this.open || this.curtain || this.stage
  }

  anchor(id: string) {
    if (!this.open || this.picking) return null
    const thing = id === 'trip:table:die' ? this.die.root : id === 'trip:table:deck' ? this.cards.stack : null
    if (!thing || !thing.parent?.visible || !(thing === this.die.root ? thing.visible : this.cards.root.visible)) return null
    return { at: thing.getWorldPosition(new Vector3()), r: 0.12, glow: this.phase === 'awaiting' }
  }

  get roots(): Object3D[] {
    if (!this.stage) return []
    const props = this.floating.roots
    if (!this.open || this.picking) return props
    return [this.usesDeck ? this.cards.stack : this.die.root, ...(this.pieces?.map((p) => p.root) ?? []), ...(this.board ? [this.board.root] : []), ...props]
  }

  shot(): Shot | null {
    if (!this.stage) return null
    const t = DIM.gameTable
    const { w, h } = this.house.size
    const tall = w < h
    const fit = FEEL.camFit
    const c = new Vector3(t.x, DIM.g0 + t.h, t.z)
    let shot: Shot
    if (this.picking) {
      // The island, kept clear of the picker: on its left on a wide screen, above it on a tall one.
      shot = tall
        ? { center: c.clone().add(new Vector3(0, 0.05, 0.4)), half: new Vector3(0.56, 0.16, 1.0), yaw: FEEL.camYaw, pitch: FEEL.camPitch + 4, minDist: 0.4 }
        : { center: c.clone().add(new Vector3(0.42, 0.05, 0.1)), half: new Vector3(1.02, 0.16, 0.66), yaw: FEEL.camYaw, pitch: FEEL.camPitch + 4, minDist: 0.4 }
    } else {
      // Playing: the board and the dice tray in front, the faces at the sides (the fit trims the sides, never the
      // board's length, so the die or the cards always show).
      shot = {
        center: c.clone().add(new Vector3(0, 0.04, 0.08)),
        half: tall ? new Vector3(0.4 * fit, 0.1, 0.5) : new Vector3(0.6 * fit, 0.1, 0.48),
        yaw: FEEL.camYaw,
        pitch: FEEL.camPitch,
        minDist: 0.4,
      }
    }
    // Just faded in: the camera swoops down and round onto it from high up and further out.
    if (this.arriveT >= 0 && this.arriveT < FEEL.swoopTime) {
      const k = 1 - Math.pow(1 - this.arriveT / FEEL.swoopTime, 3)
      const u = 1 - k
      shot = { ...shot, yaw: shot.yaw + 55 * u, pitch: Math.min(84, shot.pitch + 30 * u), half: shot.half.clone().multiplyScalar(1 + 0.7 * u) }
    }
    return shot
  }

  get busy() {
    return this.later.length > 0 || this.waits.length > 0 || this.fx.length > 0 || this.die.busy || this.cards.busy || this.sparkle.busy || !!this.board?.busy || !!this.pieces?.some((p) => p.busy) || this.wantPicker || this.open || this.stage || this.curtain
  }

  update(dt: number, t: number) {
    // She's sitting down after a tap on the table: once she's on her stool, the fade to the floating board and its
    // picker.
    if (this.wantPicker && !this.curtain) {
      const k = this.house.kaylee
      const p = k.position
      const t0 = DIM.gameTable
      if (k.pose === 'sit' && !k.walking && Math.hypot(p.x - t0.me.x, p.z - t0.z) < 0.1) {
        this.wantPicker = false
        this.fade(() => {
          this.open = true
          this.picking = true
          this.step = 'game'
          this.phase = 'picking'
          this.toStage(false)
          this.preview()
          sounds.pop()
          this.tell('pick', L.games.pick, 0.3 + FEEL.swoopTime * 0.5)
        })
      } else if (!k.walking && k.pose !== 'sit') this.wantPicker = false
    }
    // The fades' timers.
    if (this.fx.length) {
      for (const l of this.fx) l.t -= dt
      const due = this.fx.filter((l) => l.t <= 0)
      this.fx = this.fx.filter((l) => l.t > 0)
      for (const l of due) l.f()
    }
    // The faces for the buttons: one picture a frame, once she's at the table.
    if (this.open) {
      const next = (['kaylee', ...COUSINS] as const).find((w) => !this.faces[w])
      if (next) {
        this.faces = { ...this.faces, [next]: next === 'kaylee' ? kayleeFace(this.house) : cousinFace(this.house, next) }
        this.emit()
      } else {
        // Then the unicorn pieces for the color step, also one a frame.
        const c = UNICORNS.find((u) => !this.pieceFaces[u])
        if (c) {
          this.pieceFaces = { ...this.pieceFaces, [c]: pieceFace(this.house, c) }
          this.emit()
        }
      }
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
    if (this.arriveT >= 0) {
      this.arriveT += dt
      if (this.arriveT >= FEEL.swoopTime) this.arriveT = -1
    }
    this.floating.update(dt, this.house.rig.camera.position)
    this.die.update(dt, t)
    this.die.setGlow(this.phase === 'awaiting')
    this.cards.update(dt, t)
    this.cards.setGlow(this.phase === 'awaiting')
    this.board?.update(dt, t)
    // Read live so the feel lab's Piece size slider shows at once on the pieces already out.
    this.pieces?.forEach((p) => {
      p.root.scale.setScalar(FEEL.pieceSize)
      p.update(dt, t)
    })
    this.sparkle.update(dt)
  }

  qa() {
    return {
      table: { open: this.open, stage: this.stage, curtain: this.curtain, picking: this.picking, step: this.step, phase: this.phase, game: this.game, vs: this.vs, piece: this.piece, seated: this.seated, me: this.state.pos[0], them: this.state.pos[1], turn: this.shown === 0 ? 'kaylee' : 'cousin', winner: this.state.winner === null ? null : this.state.winner === 0 ? 'kaylee' : 'cousin', token: this.token, die: this.die.value, card: this.card, deck: this.deck.draw.length, discard: this.deck.discard.length },
    }
  }
}

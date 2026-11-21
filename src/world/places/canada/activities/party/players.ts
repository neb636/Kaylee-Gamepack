// Everybody on the ice in Pond Hockey (rink.ts), built from the story's own characters so they are the same friends as
// in the films and on the map: Maple and the rig friends are story/cast.ts `Friend`s in their Canada looks (Monty,
// Roxy and her kits, Ollie, Misty), Tuque the snowman, Lulu the loon and Gus's geese are the hand-built toys
// (characters/). Everybody on the team wears Maple's pink scarf.
//
// A `Player` is one of them on skates: the game moves it (x, z, yaw, its speed) every frame, and on top of whatever the
// character does by itself (breathing, blinking, talking) it plays the hockey moves the characters don't have: a sway
// from skate to skate, a slap shot with the stick, a spin, a flop on the ice, Ollie's slide on her back, a cheer, and a
// quick turn to the camera to show off after their big moment.
//
// Each friend's play starts with their WIND-UP, the same pose as their move on the map (map/moves.ts), so she knows who
// is about to do what: `windUp()` starts it (the rink calls it a moment before the play, overlapped with the skating
// so nobody waits), `letGo()` when the play goes. A goose Roxy robs freezes like one of her statues (`freeze`).
import type { Object3D } from 'three'
import { bell } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { nextStatue, releaseStatue, strikeStatue, type StatueId, type Statuesque } from '../../characters/statues'
import { WindUp } from '../../map/moves'
import type { ChapterId } from '../../story/chapters'
import { Goose } from '../../characters/goose'
import { Lulu } from '../../characters/lulu'
import type { Performer } from '../../characters/toy'
import { Tuque } from '../../characters/tuque'
import { dressToy } from '../../characters/dress'
import { wornBy, type TeamId } from '../../looks'
import type { ToyActor } from '../../characters/toy'
import { Friend } from '../../story/cast'
import { makeStick } from '../../story/props'

export type Who = 'maple' | 'monty' | 'tuque' | 'roxy' | 'ollie' | 'misty' | 'lulu' | 'kit' | 'gus' | 'goose'

/** A hand-built toy in what she chose for it in the Team Cabin (characters/dress.ts). */
const dressed = <T extends ToyActor>(a: T, who: TeamId, bag: Bag): T => {
  dressToy(a, who, wornBy(who), bag)
  return a
}

/** Each friend's wind-up: the chapter whose move on the map it is (map/moves.ts WINDUP_S says how long it takes). */
const WIND: Partial<Record<Who, ChapterId>> = { tuque: 'snowman', monty: 'bike', roxy: 'campfire', lulu: 'canoe', misty: 'bath', ollie: 'whales' }
/** The longest a wind-up is held if nobody lets go of it (s): the rink always does, at the play. */
const WIND_HOLD = 2.5
/** The last statue a robbed goose struck (the next is a different one). */
let lastStatue: StatueId | null = null
/** A goose has no arms to pose: its wings go up for the statues that lift them (a tree's branches, a ballerina). */
const STATUE_WINGS: Record<StatueId, number> = { tree: 1, ballerina: 0.85, flamingo: 0.65, rock: 0, whistling: 0 }

const SPIN_S = 0.8
const FLOP_S = 1.3
const SLAP_S = 0.45
const CHEER_S = 1.2

export class Player {
  x = 0
  z = 0
  vx = 0
  vz = 0
  /** Feet off the ice (Lulu on the snowbank, the kits). */
  y = 0
  /** Which way it faces: 0 toward the camera (+z), PI up the ice. */
  yaw = Math.PI
  /** Where it skates its lazy loops when nothing's happening. */
  spot: [number, number] = [0, 0]
  readonly phase = Math.random() * 6
  /** What it's doing in the game (rink.ts). */
  task: 'idle' | 'fetch' | 'carry' | 'dash' | 'block' | 'windup' | 'down' = 'idle'
  taskT = 0
  private spinT = -1
  private flopT = -1
  private slapT = -1
  private slapK = 1
  private slapThrough = false
  private cheerT = -1
  private showT = -1
  private showS = 1
  /** Wings (or arms) flapping, 0..1 (the goalie diving). */
  flail = 0
  private downK = 0
  /** Lying on her back, 0..1 (Ollie's slide). */
  back = 0
  /** Knocked flat, staying down until `getUp()` (the goose wall after Misty's slap shot). */
  private flat = 0
  private flatGoal = 0
  private flatSide = 1
  private wind: WindUp | null
  /** A hand-built toy's arms in its wind-up (they follow a frame later, through `armsUp`). */
  private windArms = 0
  private frozenT = 0
  private frozenWings = 0

  constructor(
    readonly who: Who,
    readonly p: Performer,
    readonly stick: Object3D | null,
  ) {
    p.root.rotation.order = 'YXZ'
    p.place(0, 0, 0, 180)
    const w = WIND[who]
    this.wind = w ? new WindUp(w, p, WIND_HOLD) : null
  }

  get root() {
    return this.p.root
  }
  get height() {
    return this.p.height
  }
  get busy() {
    return this.spinT >= 0 || this.flopT >= 0 || this.cheerT >= 0
  }
  /** Winding up (or wound up and holding it) for their play. */
  get winding() {
    return !!this.wind?.on
  }
  /** Wound all the way up. */
  get wound() {
    return !!this.wind?.ready
  }
  /** Frozen like a statue. */
  get frozen() {
    return this.frozenT > 0
  }
  /** Not flat on the ice or mid-flop. */
  get up() {
    return this.flat < 0.2 && this.flopT < 0
  }

  hop() {
    this.p.hop()
  }
  /** Arms (or wings) up, a hop and a happy face. */
  cheer() {
    this.cheerT = 0
    this.p.hop()
    this.p.pull('happy')
  }
  wave() {
    this.p.wave()
  }
  spin() {
    if (this.spinT < 0) this.spinT = 0
  }
  /** Tips over sideways, lies there a moment and rights itself. */
  flop() {
    this.flopT = 0
  }
  /** A slap shot (`big`: Misty's, a huge wind-up). `through`: the stick is already back (their wind-up took it there),
   *  so it's just the swing through and the follow-through. */
  slap(big = 1, through = false) {
    this.slapK = big
    this.slapThrough = through
    this.slapT = through ? 0.45 * this.slapS : 0
  }
  private get slapS() {
    return SLAP_S * (this.slapK > 1 ? 1.4 : 1)
  }
  /** Starts their wind-up (the same as their move on the map), held until `letGo()`. */
  windUp() {
    if (this.wind && !this.wind.on) this.wind.start()
  }
  /** The play goes: the wind-up eases out. */
  letGo() {
    this.wind?.release()
  }
  /** Freezes in one of Roxy's statue poses (with its silly face) for `s` seconds, then is itself again. */
  freeze(s = 1) {
    lastStatue = nextStatue(lastStatue)
    strikeStatue(this.p as Statuesque, lastStatue)
    this.frozenT = s
    this.frozenWings = this.p instanceof Friend ? 0 : STATUE_WINGS[lastStatue]
  }
  /** Back to themselves at once (a new round). */
  thaw() {
    if (this.frozenT <= 0) return
    this.frozenT = 0
    releaseStatue(this.p as Statuesque)
  }
  /** Turns to the camera for a moment, pleased with itself. */
  showOff(s = 1.4) {
    this.showT = s
    this.showS = s
    this.p.pull('happy')
  }
  /** Knocked flat on the ice (stays down). */
  knockDown(side: number) {
    this.flatGoal = 1
    this.flatSide = side >= 0 ? 1 : -1
  }
  getUp() {
    this.flatGoal = 0
  }

  update(dt: number, t: number) {
    const adv = (v: number, s: number) => (v < 0 ? -1 : v + dt > s ? -1 : v + dt)
    this.spinT = adv(this.spinT, SPIN_S)
    this.flopT = adv(this.flopT, FLOP_S)
    this.slapT = adv(this.slapT, this.slapS)
    if (this.frozenT > 0 && (this.frozenT -= dt) <= 0) releaseStatue(this.p as Statuesque)
    this.cheerT = adv(this.cheerT, CHEER_S)
    if (this.showT > 0) this.showT -= dt
    this.flat += (this.flatGoal - this.flat) * (1 - Math.exp(-dt * (this.flatGoal > this.flat ? 10 : 3)))
    this.downK += ((this.task === 'down' ? 1 : 0) - this.downK) * (1 - Math.exp(-dt * 6))
    const sp = Math.hypot(this.vx, this.vz)
    const skate = Math.min(1, sp / 3) * (this.who === 'lulu' || this.who === 'kit' ? 0 : 1)
    const spin = this.spinT >= 0 ? smooth(this.spinT / SPIN_S) * Math.PI * 2 : 0
    const flop = this.flopT >= 0 ? bell(Math.min(1, (this.flopT / FLOP_S) * 1.15)) : 0
    const cheer = this.cheerT >= 0 ? bell(this.cheerT / CHEER_S) : 0
    const show = this.showT > 0 ? Math.min(1, this.showT * 3, (this.showS - this.showT) * 5) : 0
    const r = this.p.root
    const H = this.height
    // Facing: the game's yaw, turned toward the camera while showing off, plus a spin.
    const turnTo = turnAngle(this.yaw, 0, show)
    r.rotation.y = turnTo + spin
    // Lying back (Ollie), tipped over (a flop, knocked flat), swaying from skate to skate.
    r.rotation.x = -1.3 * this.back
    r.rotation.z = Math.sin(t * 5.5 + this.phase) * 0.09 * skate + flop * 1.3 * (this.phase > 3 ? 1 : -1) + this.flat * 1.45 * this.flatSide
    r.position.set(this.x, this.y + this.back * 0.18 * H + this.flat * 0.12 * H, this.z)
    this.p.lean = 0.2 * skate + 0.25 * this.downK
    this.p.armsUp = Math.max(cheer, this.flail, this.who === 'monty' ? 0.25 * this.downK : 0, this.windArms, this.frozenT > 0 ? this.frozenWings : 0)
    this.p.update(dt, t)
    // Their wind-up, over whatever they're doing (a hand-built toy's arms come through `armsUp` next frame).
    this.windArms = 0
    if (this.wind?.on) {
      this.wind.update(dt, t)
      if (!(this.p instanceof Friend)) this.windArms = this.p.armsUp
    }
    // The stick: back for a wind-up, a quick swing through the puck and a follow-through out in front (Misty's goes way
    // up). `swing` is how far back (+) or through (-): a rig friend's arm swings back with +x (map/moves.ts), a goose's
    // wing too. (Swung through from their own wind-up, the wind-up has taken it back already.)
    const s = this.slapT >= 0 ? this.slapT / this.slapS : -1
    let swing = 0
    if (s >= 0) {
      const back = this.slapThrough ? 0 : 1.1 * this.slapK
      const out = 0.9 + 0.35 * (this.slapK - 1)
      swing = s < 0.45 ? back * smooth(s / 0.45) : s < 0.65 ? back - (back + out) * smooth((s - 0.45) / 0.2) : -out * (1 - (s - 0.65) / 0.35)
    }
    if (this.p instanceof Friend) this.p.rig.armR.rotation.x += swing
    else if (this.p instanceof Goose) this.p.swing = swing
    if (this.stick) this.stick.visible = cheer < 0.4 && this.back < 0.5
  }
}

const smooth = (x: number) => x * x * (3 - 2 * x)
/** From `a` toward `b` by `k` (0..1), the short way round. */
function turnAngle(a: number, b: number, k: number) {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a))
  return a + d * k
}

/** Builds one of them for the ice (game sizes: a little bigger than the films', so they read from behind the net). */
export function makePlayer(bag: Bag, scene: Object3D, who: Who, i = 0): Player {
  let p: Performer
  let stick: Object3D | null = null
  const withStick = (f: Friend) => {
    stick = makeStick(f.height, bag)
    f.rig.armR.add(stick)
    return f
  }
  switch (who) {
    case 'maple':
      p = withStick(new Friend('maple', bag, { height: 1.2, voice: 'maple' }))
      break
    case 'monty':
      p = new Friend('moose', bag, { height: 1.85, voice: 'moose' }).scarf(true)
      break
    case 'roxy':
      p = withStick(new Friend('raccoon', bag, { height: 1.0, voice: 'raccoon' }).scarf(true))
      break
    case 'ollie':
      p = withStick(new Friend('otter', bag, { height: 1.0, voice: 'otter' }).scarf(true))
      break
    case 'misty':
      p = withStick(new Friend('spirit', bag, { height: 1.55, voice: 'bear' }).scarf(true))
      break
    case 'kit':
      p = new Friend('kit', bag, { height: 0.5 + i * 0.04, voice: null }).scarf(true)
      break
    case 'tuque':
      p = dressed(new Tuque(bag, { height: 1.45 }).scarf(true), 'tuque', bag)
      break
    case 'lulu':
      p = dressed(new Lulu(bag, { height: 0.95 }).scarf(true), 'lulu', bag)
      break
    case 'gus':
      p = dressed(new Goose(bag, { height: 1.2, voice: 'gus', captain: true, stick: true }), 'gus', bag)
      break
    default:
      p = new Goose(bag, { height: 1.05 + (i % 3) * 0.04, stick: true })
  }
  scene.add(p.root)
  return new Player(who, p, stick)
}

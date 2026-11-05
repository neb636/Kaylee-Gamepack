// The cinema camera: cutscene-style shots for any 3D world, the way a game's cinematics are filmed. Instead of one
// follow camera framing a box, a Director cuts between authored camera moves around a moving subject (a boat, a car,
// Kaylee): a crane up off the pier, a low chase skimming the water, a fixed camera the boat roars past, a two-shot with
// whatever comes the other way. Each move is a slow eased dolly from one pose to another over a few seconds, with a
// little handheld sway, and the screen gets letterbox bars (`Letterbox` below, drawn in the frame itself).
//
// Using it in a world:
//   const dir = new Director(MOVES, 'open')
//   every frame:  rig.setCine(cinemaOn() ? dir.update(dt, { pos, fwd }, focus) : null)
//   on an event:  dir.cut('pass')         (a named move, say a boat coming the other way)
//   under her finger: dir.play()          (cuts to a `playable` move if this one isn't, and holds it while she plays)
//   the bars:     bars.update(dt, rig.cinema), then bars.render(renderer, scene, rig.camera, w, h) instead of
//                 renderer.render(scene, camera)
// The rig hands back to the normal follow camera smoothly when it's given null again.
//
// Poses are in the subject's own frame: x to its right, y up, z forward (meters). `mirror` moves flip x to `side`.
// ?cine=1 (sticky, also the camera lab's "Cinema camera" switch) turns it on for the worlds that have one.
import { Color, Vector3, type Camera, type Object3D, type WebGLRenderer } from 'three'
import { flag } from './flags'

export type V3 = [x: number, y: number, z: number]

export interface CinePose {
  /** Where the camera is (subject frame). */
  eye: V3
  /** What it looks at (subject frame). */
  look: V3
  /** Degrees of view, top to bottom (default 45). Longer lenses (smaller) feel more filmic. */
  fov?: number
}

export interface CineMove {
  id: string
  /** Seconds before the director cuts to the next move. */
  dur: number
  from: CinePose
  /** Where the move ends (default: it holds `from`). */
  to?: CinePose
  /** 'subject' (default): the camera rides along with the subject. 'fixed': at the cut the camera is set down in the
   *  world where `from.eye` is, and stays there while the subject drives past (it keeps turning to look at it). */
  anchor?: 'subject' | 'fixed'
  /** Look between the subject's `look` point and the `focus` given to update() (a two-shot); 0..1, default 0. The look
   *  moves at most `PULL` meters toward it, so the subject stays in the shot however far off the other thing is. */
  twoShot?: number
  /** x follows `director.side` (her side of the boat). */
  mirror?: boolean
  /** Handheld sway in meters (default 0.05); 0 for a locked-off tripod. */
  sway?: number
  /** Degrees of dutch tilt the sway may roll (default 0.6). */
  roll?: number
  /** She can play under this shot (what she touches is in it): `play()` keeps to these. */
  playable?: boolean
  /** Only played when cut to by name, never in the rotation. */
  event?: boolean
  ease?: 'inOut' | 'out' | 'linear'
}

/** The subject the camera films: where it is and which way it faces (horizontal, unit length). */
export interface CineSubject {
  pos: Vector3
  fwd: Vector3
}

/** The camera for this frame. */
export interface CineFrame {
  eye: Vector3
  look: Vector3
  fov: number
  /** Radians of roll (dutch tilt). */
  roll: number
}

/** The cinema camera is on for this link (?cine=1). Cheap enough to ask every frame, so the lab's switch is live. */
export const cinemaOn = () => flag('cine') === '1'

const EASE = {
  inOut: (k: number) => k * k * (3 - 2 * k),
  out: (k: number) => 1 - (1 - k) * (1 - k),
  linear: (k: number) => k,
}

export class Director {
  /** Which side `mirror` moves film from: +1 right of the subject, -1 left. Read at each cut (a shot never swings across
   *  mid-move). */
  side = 1
  private shotSide = 1
  /** Screen width over height: on a tall screen every shot dollies back (the same lens shows less across), so what
   *  was in a wide shot stays in it. */
  aspect = 16 / 10
  private list: CineMove[]
  private cur: CineMove
  private t = 0
  private next = 0
  private holding = false
  private fixed: Vector3 | null = null
  private out: CineFrame = { eye: new Vector3(), look: new Vector3(), fov: 45, roll: 0 }
  private seed = Math.random() * 100
  /** Cuts so far (for QA). */
  cuts = 0

  constructor(moves: CineMove[], first?: string) {
    if (!moves.length) throw new Error('Director needs at least one move')
    this.list = moves
    this.cur = moves.find((m) => m.id === first) ?? moves[0]
  }

  /** The move on screen now. */
  get move() {
    return this.cur
  }
  /** Seconds into it. */
  get elapsed() {
    return this.t
  }

  /** Cut to a move by name, or to the next one in the rotation (`side`: film this one from that side). */
  cut(id?: string, side = this.side) {
    const m = id ? this.list.find((x) => x.id === id) : this.pickNext()
    if (!m) {
      this.t = 0
      return
    }
    this.cur = m
    this.shotSide = side
    this.t = 0
    this.fixed = null
    this.cuts++
  }

  /** She's touching the world: make sure the shot shows what she plays with, and don't cut away while she does. */
  play(on = true) {
    const start = on && !this.holding
    this.holding = on
    if (!start) return
    const m = this.cur
    if (!m.playable) this.cut(this.pickNext(true)?.id)
    else if (m.mirror && this.shotSide !== this.side) this.cut(m.id)
  }

  update(dt: number, subj: CineSubject, focus?: Vector3 | null): CineFrame {
    this.t += dt
    const m = this.cur
    // At the end of a move: cut (unless she's playing under it, then it holds its last pose).
    if (this.t >= m.dur && !(this.holding && m.playable)) {
      this.cut()
      return this.update(0, subj, focus)
    }
    const k = EASE[m.ease ?? 'inOut'](Math.min(1, this.t / m.dur))
    const a = m.from
    const b = m.to ?? m.from
    const sx = m.mirror ? this.shotSide : 1
    const right = tmpR.set(subj.fwd.z, 0, -subj.fwd.x)
    const toWorld = (v: V3, w: V3, into: Vector3) =>
      into
        .copy(subj.pos)
        .addScaledVector(right, lerp(v[0], w[0], k) * sx)
        .setY(subj.pos.y + lerp(v[1], w[1], k))
        .addScaledVector(subj.fwd, lerp(v[2], w[2], k))
    const o = this.out
    if (m.anchor === 'fixed') {
      // Set down in the world at the cut; the eye stays put (no dolly) while the subject drives by.
      if (!this.fixed) {
        this.fixed = toWorld(a.eye, a.eye, new Vector3())
      }
      o.eye.copy(this.fixed)
    } else toWorld(a.eye, b.eye, o.eye)
    toWorld(a.look, b.look, o.look)
    if (m.anchor !== 'fixed' && this.aspect < 1.2) o.eye.sub(o.look).multiplyScalar(Math.pow(1.2 / Math.max(0.3, this.aspect), 0.85)).add(o.look)
    if (m.twoShot && focus) {
      const pull = tmpP.subVectors(focus, o.look).multiplyScalar(m.twoShot)
      if (pull.length() > PULL) pull.setLength(PULL)
      o.look.add(pull)
    }
    o.fov = lerp(a.fov ?? 45, b.fov ?? a.fov ?? 45, k)
    // Handheld: a slow wander made of a few sines (never the same twice), more on the eye than the look.
    const s = m.sway ?? 0.05
    if (s > 0) {
      const t = this.seed + this.t + this.next
      o.eye.x += s * (Math.sin(t * 0.9) + 0.5 * Math.sin(t * 2.3 + 1))
      o.eye.y += s * (Math.sin(t * 1.1 + 2) + 0.4 * Math.sin(t * 2.9))
      o.eye.z += s * Math.sin(t * 0.7 + 4)
      o.look.y += s * 0.3 * Math.sin(t * 1.3 + 3)
    }
    o.roll = ((m.roll ?? 0.6) * Math.PI) / 180 * Math.sin((this.seed + this.t) * 0.6) * (s > 0 ? 1 : 0)
    return o
  }

  /** The next move in the rotation (in the order given, skipping event moves; `playable` only when asked). */
  private pickNext(playable = false): CineMove | undefined {
    const pool = this.list.filter((m) => !m.event && (!playable || m.playable))
    if (!pool.length) return undefined
    this.next = (this.next + 1) % pool.length
    const m = pool[this.next]
    return m === this.cur && pool.length > 1 ? pool[(this.next = (this.next + 1) % pool.length)] : m
  }
}

/** The letterbox: two dark bars that close in at the top and bottom while a cutscene has the camera, and open again
 *  when the game's camera is back. Drawn by WebGL in the same frame as the picture (a scissor round the scene), so
 *  the bars and the camera always move together: HTML bars over the canvas lagged the hand-back and, in Safari, could
 *  leave one bar behind for a moment. Taps aren't affected (they go to the canvas and its tap targets as ever). */
export class Letterbox {
  private k = 0
  /** Seconds the bars take to close or open. */
  time = 0.8

  update(dt: number, on: boolean) {
    this.k = Math.max(0, Math.min(1, this.k + (on ? dt : -dt) / this.time))
  }
  /** 0..1: how far closed the bars are now (eased). */
  get amount() {
    return EASE.inOut(this.k)
  }

  /** Draws the scene with the bars (`w`, `h`: the canvas in CSS pixels). */
  render(renderer: WebGLRenderer, scene: Object3D, camera: Camera, w: number, h: number) {
    const bar = Math.round(this.amount * Math.min(h * 0.09, 96))
    if (bar < 1) {
      renderer.render(scene, camera)
      return
    }
    renderer.getClearColor(prevColor)
    const prevAlpha = renderer.getClearAlpha()
    renderer.setScissorTest(false)
    renderer.setClearColor(BAR, 1)
    renderer.clear(true, true, false)
    renderer.setClearColor(prevColor, prevAlpha)
    renderer.setScissor(0, bar, w, h - 2 * bar)
    renderer.setScissorTest(true)
    renderer.render(scene, camera)
    renderer.setScissorTest(false)
  }
}

const BAR = new Color('#1B1622')
const prevColor = new Color()
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const tmpR = new Vector3()
const tmpP = new Vector3()
/** Meters a two-shot's look may move toward the other thing. */
const PULL = 4

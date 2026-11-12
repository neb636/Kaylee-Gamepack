// Films: the cutscenes that tell a story in any 3D world (docs/films.md). A film is a list of beats, like a
// storyboard: each beat has a camera shot, maybe one spoken line, and what happens in it (someone hops, a bird flies
// off with a hat). The player runs them in order, times every beat by its line's recorded clip (so the pace is the
// same with or without sound), films it with the cinema camera (the rig's setCine, the Letterbox bars) and can be
// skipped at any moment: `skip()` stops the talking and jumps to the film's `finish()`, which puts the world where the
// film leaves it. Nothing a film does may be needed by the game unless `finish()` also does it.
//
// A beat can be a memory (a story someone tells): the screen gets the storybook look (FilmOverlay.tsx draws it, warm and
// soft at the edges, with a page-turn wipe in and out), so a five-year-old can tell "then" from "now".
//
// Using it in a world:
//   const films = new FilmPlayer({ line: (l) => ..., state: (s) => ... })   (the screen shows the words and the look)
//   films.play(INTRO)                         to start one (beats are built by the world, they close over its things)
//   every frame:  this.rig.setCine(films.update(dt, aspect))   (null when no film is on: the game's camera glides back)
//   render():     bars.update(dt, films.on), bars.render(...)  (cinema.ts's Letterbox)
//   the screen's hold-to-skip button calls films.skip()
//
// Shots are in world meters. A point can be a function (a character's head this frame), so a shot can follow
// someone. On a tall screen every shot backs off along its line of sight, as the Director's do, so what was in a wide
// frame stays in it; a beat can also give a `tall` shot of its own.
import { Vector3, type PerspectiveCamera } from 'three'
import { lineMs, lineText, say, stopSpeaking, type Line } from '../../sdk'
import type { CineFrame } from './cinema'

export type V3 = [x: number, y: number, z: number]
/** A point in the world: fixed, or worked out every frame (someone's head, a bird in flight). */
export type FilmPoint = V3 | (() => Vector3)

export interface FilmPose {
  eye: FilmPoint
  look: FilmPoint
  /** Degrees of view, top to bottom (default 40). */
  fov?: number
}

export interface FilmShot extends FilmPose {
  /** Where the camera has moved to by the end of the move (default: it holds). */
  to?: Partial<FilmPose>
  /** Seconds the move takes (default: the whole beat). */
  move?: number
  ease?: 'inOut' | 'out' | 'in' | 'linear'
  /** Seconds to glide from the last shot into this one, instead of a cut (default 0: a cut). */
  blend?: number
  /** Handheld sway in meters (default 0.025); 0 for a locked-off tripod. */
  sway?: number
  /** The same shot framed for a tall screen (anything left out is the wide one's). */
  tall?: Partial<Omit<FilmShot, 'tall'>>
}

export interface Beat {
  /** A name for the review page and the QA (`intro.nap`). */
  id: string
  /** The camera for this beat (default: the last beat's, held where it ended). */
  shot?: FilmShot
  /** One spoken line. The beat lasts until it's said, plus `hold`. */
  say?: Line
  /** Seconds into the beat before the line starts (default 0.25). */
  sayAt?: number
  /** Seconds after the line before the next beat (default 0.45). */
  hold?: number
  /** The least the beat lasts, seconds (default 1.2). */
  dur?: number
  /** A remembered story: the storybook look is on. */
  memory?: boolean
  /** The page turns as this beat begins (into a memory or out of it): the screen is covered for a moment
   *  (FilmOverlay), and this beat's shot and its `start` happen under the cover, TURN_S in, so the world can change
   *  (last year's golden rice, everyone back where they are now) without anyone seeing it jump. */
  turn?: boolean
  /** As the beat begins. */
  start?(): void
  /** Every frame of it: `k` is 0..1 of its planned length, `t` its seconds. */
  tick?(k: number, t: number, dt: number): void
  /** Things that happen this many seconds into the beat. */
  cues?: [at: number, f: () => void][]
}

export interface Film {
  id: string
  beats: Beat[]
  /** Puts the world where the film leaves it: at the end, and when it's skipped (from any beat). Make it safe to call
   *  from any point in the film. */
  finish(): void
}

/** What the screen shows while a film is on (FilmOverlay.tsx). */
export interface FilmState {
  film: string
  beat: string
  memory: boolean
  /** This beat turns the page (the cover sweeps over the screen and away). */
  turn: boolean
}

export interface FilmHooks {
  /** The line being said now (its words go under the picture), or null between lines. */
  line(l: Line | null): void
  /** The film's on (which beat, memory or not), or off (null). */
  state(s: FilmState | null): void
}

/** Without a recorded clip, a line is timed by its words: about this long a character, plus a little. */
const MS_PER_CHAR = 62
const MS_EXTRA = 500
/** If a line's audio stalls, the beat goes on anyway this long after it should have ended. */
const STALL_S = 3
/** Seconds into a page-turning beat when the screen is fully covered (FilmOverlay's cover takes this long). */
export const TURN_S = 0.5

const EASE = {
  inOut: (k: number) => k * k * (3 - 2 * k),
  out: (k: number) => 1 - (1 - k) * (1 - k),
  in: (k: number) => k * k,
  linear: (k: number) => k,
}

/** Seconds a line takes to say (its clip, or a guess from its words). */
export function lineSeconds(l: Line) {
  const ms = lineMs(l)
  return (ms > 0 ? ms : lineText(l).length * MS_PER_CHAR + MS_EXTRA) / 1000
}

/** Planned seconds of a beat. */
export function beatSeconds(b: Beat) {
  const talk = b.say ? (b.sayAt ?? 0.25) + lineSeconds(b.say) + (b.hold ?? 0.45) : 0
  return Math.max(b.dur ?? 1.2, talk)
}

/** Planned seconds of a whole film. */
export const filmSeconds = (f: Film) => f.beats.reduce((n, b) => n + beatSeconds(b), 0)

export class FilmPlayer {
  private film: Film | null = null
  private i = 0
  private t = 0
  private len = 1
  private cues: [number, () => void][] = []
  private said = false
  /** The line's audio finished (or -1 while it plays); a beat with a line waits for it. */
  private saidEnd = -1
  private shot: FilmShot | null = null
  private out: CineFrame = { eye: new Vector3(), look: new Vector3(), fov: 40, roll: 0 }
  private from: CineFrame | null = null
  private seed = Math.random() * 100
  /** Films played to the end or skipped (QA). */
  done: string[] = []
  skipped: string[] = []
  private ended: (() => void) | null = null
  /** A page-turning beat's shot and start, waiting for the cover. */
  private turning: Beat | null = null
  /** When the words being said come off the screen (beat seconds; -1: none up). */
  private lineUntil = -1
  /** Seconds into the beat its shot began (a page turn's starts under the cover). */
  private t0 = 0

  constructor(private hooks: FilmHooks) {}

  /** A film is on. */
  get on() {
    return !!this.film
  }
  /** The film and beat on screen (QA). */
  get now() {
    const f = this.film
    return f ? { film: f.id, beat: f.beats[this.i]?.id ?? null, t: Math.round(this.t * 10) / 10 } : null
  }

  /** Starts a film (`then`: when it ends or is skipped, after its finish()). Give it the game's camera and a first
   *  shot with a `blend` glides in from where the game was looking, instead of cutting. */
  play(film: Film, then?: () => void, camera?: PerspectiveCamera) {
    if (this.film) this.stop()
    this.film = film
    this.ended = then ?? null
    this.shot = null
    this.from = null
    this.i = 0
    if (camera) {
      const o = this.out
      o.eye.copy(camera.position)
      o.look.copy(camera.getWorldDirection(tmpA)).multiplyScalar(8).add(camera.position)
      o.fov = camera.fov
    }
    this.begin(0, !!camera)
  }

  /** Jumps to the end: the talking stops and the world is put where the film leaves it. */
  skip() {
    if (!this.film) return
    this.skipped.push(this.film.id)
    stopSpeaking()
    this.stop()
  }

  /** The film's over (played to the end, or skipped): the world goes where it leaves it, then `then`. */
  private stop() {
    const f = this.film
    if (!f) return
    this.film = null
    this.turning = null
    this.hooks.line(null)
    this.hooks.state(null)
    f.finish()
    const then = this.ended
    this.ended = null
    then?.()
  }

  private begin(i: number, fromGame = false) {
    const f = this.film!
    if (i >= f.beats.length) {
      this.done.push(f.id)
      return this.stop()
    }
    const b = f.beats[i]
    // A cut or a glide: a glide starts from wherever the camera was. (A page turn keeps the last shot until it's
    // covered.)
    this.turning = b.turn ? b : null
    if (b.shot && !b.turn) {
      this.from = b.shot.blend && (this.i < i || fromGame) ? { ...this.out, eye: this.out.eye.clone(), look: this.out.look.clone() } : null
      this.shot = b.shot
    } else if (this.shot && this.i < i) {
      // Held: the last shot stays where its move ended.
      const s = this.shot
      this.shot = { eye: s.to?.eye ?? s.eye, look: s.to?.look ?? s.look, fov: s.to?.fov ?? s.fov, sway: s.sway, tall: s.tall && { eye: s.tall.to?.eye ?? s.tall.eye, look: s.tall.to?.look ?? s.tall.look, fov: s.tall.to?.fov ?? s.tall.fov } }
      this.from = null
    }
    this.i = i
    this.t = 0
    this.t0 = 0
    this.len = beatSeconds(b)
    this.cues = [...(b.cues ?? [])].sort((a, c) => a[0] - c[0])
    this.said = false
    this.lineUntil = -1
    this.saidEnd = b.say ? -1 : 0
    this.hooks.state({ film: f.id, beat: b.id, memory: !!b.memory, turn: !!b.turn })
    if (!b.say) this.hooks.line(null)
    if (!b.turn) b.start?.()
  }

  /** The camera for this frame (null when no film is on). `aspect`: the screen's width over height. */
  update(dt: number, aspect: number): CineFrame | null {
    const f = this.film
    if (!f) return null
    this.t += dt
    const b = f.beats[this.i]
    if (this.turning === b && this.t >= TURN_S) {
      this.turning = null
      if (b.shot) {
        this.shot = b.shot
        this.from = null
        // (The shot's move starts now, under the cover.)
        this.t0 = this.t
      }
      b.start?.()
      if (!this.film) return null
    }
    while (this.cues.length && this.cues[0][0] <= this.t) this.cues.shift()![1]()
    if (!this.film) return null // (a cue ended it)
    if (b.say && !this.said && this.t >= (b.sayAt ?? 0.25)) {
      this.said = true
      const line = b.say
      this.hooks.line(line)
      // The words stay up as long as the line takes (its clip's length), even where the audio is skipped (a test
      // browser filming a reel).
      this.lineUntil = this.t + lineSeconds(line)
      const mine = this.film
      const beat = this.i
      void say(line).then(() => {
        if (this.film !== mine || this.i !== beat) return
        this.saidEnd = this.t
      })
    }
    if (this.lineUntil >= 0 && this.saidEnd >= 0 && this.t >= this.lineUntil) {
      this.lineUntil = -1
      this.hooks.line(null)
    }
    b.tick?.(Math.min(1, this.t / this.len), this.t, dt)
    if (!this.film) return null
    // The beat ends at its planned length, once its line is said (or has stalled).
    const talked = this.saidEnd >= 0 && this.t >= this.saidEnd + (b.say ? Math.min(b.hold ?? 0.45, 0.3) : 0)
    if (this.t >= this.len && (talked || this.t >= this.len + STALL_S)) {
      this.begin(this.i + 1)
      if (!this.film) return null
    }
    return this.frame(aspect)
  }

  private frame(aspect: number): CineFrame | null {
    const s0 = this.shot
    if (!s0) return null
    const s = aspect < 1 && s0.tall ? { ...s0, ...s0.tall, to: s0.tall.to ?? s0.to } : s0
    const st = Math.max(0, this.t - this.t0)
    const k = EASE[s.ease ?? 'inOut'](Math.min(1, st / Math.max(0.01, s.move ?? this.len - this.t0)))
    const o = this.out
    const at = (p: FilmPoint, into: Vector3) => (typeof p === 'function' ? into.copy(p()) : into.set(...p))
    at(s.eye, o.eye)
    at(s.look, o.look)
    if (s.to?.eye) o.eye.lerp(at(s.to.eye, tmpA), k)
    if (s.to?.look) o.look.lerp(at(s.to.look, tmpA), k)
    o.fov = lerp(s.fov ?? 40, s.to?.fov ?? s.fov ?? 40, k)
    // A tall screen shows less across with the same lens: back off along the line of sight (unless the beat framed
    // its own tall shot).
    if (aspect < 1.2 && !(aspect < 1 && s0.tall)) o.eye.sub(o.look).multiplyScalar(Math.pow(1.2 / Math.max(0.3, aspect), 0.85)).add(o.look)
    // Handheld: a slow wander.
    const w = s.sway ?? 0.025
    if (w > 0) {
      const t = this.seed + st + this.i * 3.1
      o.eye.x += w * (Math.sin(t * 0.9) + 0.5 * Math.sin(t * 2.3 + 1))
      o.eye.y += w * (Math.sin(t * 1.1 + 2) + 0.4 * Math.sin(t * 2.9))
      o.look.y += w * 0.3 * Math.sin(t * 1.3 + 3)
    }
    o.roll = 0
    // A glide in from the last shot.
    const fr = this.from
    if (fr && s.blend) {
      const g = EASE.inOut(Math.min(1, st / s.blend))
      o.eye.lerpVectors(fr.eye, o.eye, g)
      o.look.lerpVectors(fr.look, o.look, g)
      o.fov = lerp(fr.fov, o.fov, g)
      if (g >= 1) this.from = null
    }
    return o
  }
}

const tmpA = new Vector3()
const lerp = (a: number, b: number, k: number) => a + (b - a) * k

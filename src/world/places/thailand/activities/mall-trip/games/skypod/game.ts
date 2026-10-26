// The Sky Pod's rules (plan: planning/around-the-world/thailand/mall-trip.md, "8. The Sky Pod"), with no three.js and
// no drawing: which pods are lit, the score, the pattern she copies, Daddy's race. The 3D wall (wall.ts) plays it: it
// passes every slap in (`slap`), tells it when Daddy's hand lands (`daddySlap`),
// and shows what it says (GameView).
//
//   1. Pop the lights: a pod lights up (low ones first), she slaps it, the score climbs, the next one pops on
//      somewhere else; from six, two at a time. Ten and the round is done (a star, the sticker).
//   2. Copy the tune: the wall plays a little pattern (two notes, then three, then four: the start of "Twinkle,
//      Twinkle"), and she plays it back. A wrong pod is just its own funny note: the wall shows the pattern again and
//      the next pod glows softly. After the third, the wall plays the whole line of the song.
//   3. Race Daddy: her lights are pink and his are blue, on the same wall. He walks over to his (slowly, and he
//      misses some, and stops to dance or tie his shoe whenever he's caught up), she can steal his, and she always
//      gets to ten first. Then the finale: the wall goes rainbow and the score rolls up to a hundred.
// After that it stays open: a light at a time, and the score keeps counting. Lights never go out by themselves, and
// nothing is ever wrong: an unlit pod just plays its note.
import { PODS, type Round } from './layout'

/** What a pod shows: off, one of hers (lit), Daddy's (blue), a note of the pattern the wall plays (show), or the soft
 *  "this one next" glow (help). */
export type Light = 'off' | 'lit' | 'blue' | 'show' | 'help'
export type Phase = 'play' | 'show' | 'copy' | 'cheer' | 'finale' | 'free'
/** What a slap did: a lit pod (hit), one of Daddy's (steal), not the pattern's next (wrong), or just a note. */
export type SlapResult = 'hit' | 'steal' | 'wrong' | 'note'

export interface GameView {
  /** A pod lit up (its pop). */
  lit(i: number, kind: Light): void
  /** The wall plays a note of the pattern, or of the song at the end of round 2. */
  show(i: number): void
  /** Someone got a light (the view already played the slap). */
  hit(i: number, who: 'kaylee' | 'daddy'): void
  /** A pod that wasn't the pattern's next: a funny note. */
  wrong(i: number): void
  score(kaylee: number, daddy: number): void
  phase(p: Phase): void
  round(n: Round): void
  /** Stars for the rounds done (the board's three). */
  stars(n: number): void
  /** The first round is done: the 💡 sticker on her sock band. */
  sticker(): void
  /** Daddy steps up to the wall (round 3), or back to watch. */
  daddyIn(on: boolean): void
  /** Daddy heads for his blue light (`miss`: he'll slap beside it, oops). Call daddySlap when his hand lands. */
  daddyGo(i: number, miss: boolean): void
  /** Daddy's caught up with her: he dances, ties his shoe, waves... (`kind` picks one). */
  daddyDawdle(kind: number): void
  /** She took the blue light he was going for: "hey!" (then he laughs). */
  daddyHey(): void
  /** A pattern played back right (round 2): the wall plays it again, quick. */
  copied(): void
  /** She got to ten before Daddy. */
  win(): void
  /** All three rounds done: the rainbow, the score rolling up, the fanfare. */
  finale(): void
  /** After the finale: the 🛝 back to the hall; the wall stays open. */
  allDone(): void
}

/** Lights to get in round 1, and in the race. */
export const R1_GOAL = 10
export const R3_GOAL = 10
/** Round 2's patterns (pods = notes: 0 is C), each the start of "Twinkle, Twinkle, Little Star"... */
export const PATTERNS = [
  [0, 4],
  [0, 4, 5],
  [0, 0, 4, 4],
]
/** ...and the whole first line, played by the wall at the end. */
export const TWINKLE = [0, 0, 4, 4, 5, 5, 4]
/** Where the score rolls up to in the finale. */
export const FINALE_SCORE = 100
/** In round 2: seconds before the next pod glows by itself. */
const HELP_S = 5

export class SkyGame {
  readonly lights: Light[] = Array.from({ length: PODS }, () => 'off' as Light)
  phase: Phase = 'play'
  round: Round = 1
  score = 0
  daddy = 0
  stars = 0
  /** Round 2: which pattern, and how far she's played it. */
  pattern = 0
  step = 0
  private wrongs = 0
  private idle = 0
  private time = 0
  private timers: { at: number; f: () => void }[] = []
  private last = -1
  private dad: 'out' | 'idle' | 'going' | 'rest' | 'dawdle' = 'out'
  private dadTarget = -1
  private dawdles = 0
  private first: Round

  /** `heights`: each pod's height now (the wall's shape follows the screen), so the first lights are low ones she
   *  reaches without a big jump, and Daddy's are high ones. Nothing happens until `begin`. */
  constructor(
    private v: GameView,
    round: Round,
    private heights: () => number[],
  ) {
    this.first = round
    this.stars = round - 1
  }

  /** Starts at the round it was made with. */
  begin() {
    this.start(this.first)
  }

  /** The pods from low to high. */
  private get byHeight() {
    return this.heights()
      .map((h, i) => [h, i])
      .sort((a, b) => a[0] - b[0] || a[1] - b[1])
      .map(([, i]) => i)
  }

  private after(s: number, f: () => void) {
    this.timers.push({ at: this.time + s, f })
  }
  private setPhase(p: Phase) {
    this.phase = p
    this.v.phase(p)
  }
  private set(i: number, l: Light) {
    this.lights[i] = l
    if (l !== 'off') this.v.lit(i, l)
  }
  private clear() {
    this.lights.fill('off')
  }
  /** The wall plays pod `i` (lit, with its note). */
  private showNote(i: number) {
    this.lights[i] = 'show'
    this.v.show(i)
  }

  // ---------------------------------------------------------------- rounds

  start(n: Round) {
    this.timers = []
    this.round = n
    this.score = 0
    this.daddy = 0
    this.clear()
    this.v.round(n)
    this.v.score(0, 0)
    this.v.stars(this.stars)
    if (n === 1) {
      this.setPhase('play')
      this.after(0.7, () => this.spawn())
    } else if (n === 2) {
      this.pattern = 0
      this.wrongs = 0
      this.setPhase('show')
      this.after(0.6, () => this.playPattern())
    } else {
      this.setPhase('play')
      this.dad = 'out'
      this.dawdles = 0
      this.v.daddyIn(true)
      this.after(1.2, () => {
        this.dad = 'idle'
        this.spawn()
        this.spawnBlue()
      })
    }
  }

  /** Her lights: one at a time at first, then two. */
  private spawn() {
    if (this.phase !== 'play' && this.phase !== 'free') return
    const want = this.phase === 'free' ? 1 : this.round === 1 ? (this.score < 6 ? 1 : 2) : this.score < 4 ? 1 : 2
    const have = this.lights.filter((l) => l === 'lit').length
    if (have >= want) return
    // Round 1 starts low (she just reaches up); later anywhere, and the high ones need a jump.
    const pool = this.round === 1 && this.score < 4 && this.phase === 'play' ? this.byHeight.slice(0, 5) : this.byHeight
    const i = this.pickFree(pool)
    if (i < 0) return
    this.set(i, 'lit')
    if (have + 1 < want) this.after(0.35, () => this.spawn())
  }

  /** Daddy's light (round 3): he's tall, so mostly a high one. */
  private spawnBlue() {
    if (this.round !== 3 || this.phase !== 'play' || this.lights.includes('blue')) return
    const i = this.pickFree(Math.random() < 0.7 ? this.byHeight.slice(4) : this.byHeight)
    if (i >= 0) this.set(i, 'blue')
  }

  /** A pod that's off, not the one she just slapped, and not right next to it if there's a choice. */
  private pickFree(pool: number[]) {
    const free = pool.filter((i) => this.lights[i] === 'off' && i !== this.last)
    const far = free.filter((i) => Math.abs(i - this.last) > 1)
    const from = far.length ? far : free.length ? free : this.lights.map((_, i) => i).filter((i) => this.lights[i] === 'off')
    return from.length ? from[Math.floor(Math.random() * from.length)] : -1
  }

  /** Round 2: the wall plays the pattern, then it's her turn. */
  private playPattern() {
    this.setPhase('show')
    this.clear()
    const seq = PATTERNS[this.pattern]
    seq.forEach((i, k) => {
      this.after(0.5 + k * 0.62, () => this.showNote(i))
      this.after(0.5 + k * 0.62 + 0.42, () => (this.lights[i] = 'off'))
    })
    this.after(0.5 + seq.length * 0.62 + 0.15, () => {
      this.setPhase('copy')
      this.step = 0
      this.idle = 0
      // After a wrong one, the first pod glows softly right away.
      if (this.wrongs > 0) this.help()
    })
  }

  private help() {
    const want = PATTERNS[this.pattern]?.[this.step]
    if (want === undefined) return
    for (let i = 0; i < PODS; i++) if (this.lights[i] === 'help') this.lights[i] = 'off'
    this.set(want, 'help')
  }

  private patternDone() {
    this.setPhase('cheer')
    this.clear()
    this.v.copied()
    const seq = PATTERNS[this.pattern]
    seq.forEach((i, k) => this.after(0.25 + k * 0.17, () => this.v.show(i)))
    this.pattern++
    if (this.pattern < PATTERNS.length) {
      this.after(1.6, () => {
        this.wrongs = 0
        this.playPattern()
      })
      return
    }
    // The whole line of the song, every pod it uses lighting up as it plays, then on to the race.
    this.after(1.4, () => {
      this.setPhase('show')
      TWINKLE.forEach((i, k) => {
        this.after(k * 0.36, () => this.showNote(i))
        this.after(k * 0.36 + 0.3, () => (this.lights[i] = 'off'))
      })
      this.after(TWINKLE.length * 0.36 + 0.5, () => this.roundDone())
    })
  }

  private roundDone() {
    this.setPhase('cheer')
    this.clear()
    this.stars = Math.max(this.stars, this.round)
    this.v.stars(this.stars)
    if (this.round === 1) this.v.sticker()
    const next = (this.round + 1) as Round
    this.after(this.round === 1 ? 2.0 : 1.6, () => this.start(next))
  }

  private won() {
    this.setPhase('cheer')
    this.clear()
    this.dad = 'out'
    this.stars = 3
    this.v.stars(3)
    this.v.win()
    this.after(2.2, () => this.finale())
  }

  /** The rainbow, and the score rolling up to a hundred (slow, then faster), then the wall stays open. */
  private finale() {
    this.setPhase('finale')
    this.v.finale()
    const from = this.score
    const n = FINALE_SCORE - from
    for (let j = 1; j <= n; j++) this.after(0.5 + 2.4 * Math.pow(j / n, 0.6), () => this.v.score(++this.score, this.daddy))
    this.after(3.6, () => {
      this.v.daddyIn(false)
      this.setPhase('free')
      this.v.allDone()
      this.after(0.6, () => this.spawn())
    })
  }

  // ---------------------------------------------------------------- her slaps, Daddy's

  /** Every slap on a pod (the view has already played its note and squash). */
  slap(i: number): SlapResult {
    this.idle = 0
    const l = this.lights[i]
    if (this.phase === 'play' || this.phase === 'free') {
      if (l === 'lit') {
        this.lights[i] = 'off'
        this.last = i
        this.score++
        this.v.hit(i, 'kaylee')
        this.v.score(this.score, this.daddy)
        if (this.phase === 'play' && this.round === 1 && this.score >= R1_GOAL) this.roundDone()
        else if (this.phase === 'play' && this.round === 3 && this.score >= R3_GOAL) this.won()
        else this.after(0.35, () => this.spawn())
        return 'hit'
      }
      if (l === 'blue') {
        // One of Daddy's: hers now.
        this.lights[i] = 'off'
        this.last = i
        this.score++
        this.v.hit(i, 'kaylee')
        this.v.score(this.score, this.daddy)
        if (this.dad === 'going' && this.dadTarget === i) {
          this.dad = 'rest'
          this.v.daddyHey()
          this.after(1.4, () => this.dad === 'rest' && (this.dad = 'idle'))
        }
        if (this.score >= R3_GOAL) this.won()
        else this.after(1.0, () => this.spawnBlue())
        return 'steal'
      }
      return 'note'
    }
    if (this.phase === 'copy') {
      const seq = PATTERNS[this.pattern]
      if (i === seq[this.step]) {
        if (this.lights[i] === 'help') this.lights[i] = 'off'
        this.step++
        this.score++
        this.v.hit(i, 'kaylee')
        this.v.score(this.score, this.daddy)
        if (this.step >= seq.length) this.patternDone()
        else if (this.wrongs > 0) this.help()
        return 'hit'
      }
      // The one she just played, again (a double tap): no harm, just its note.
      if (this.step > 0 && i === seq[this.step - 1]) return 'note'
      this.wrongs++
      this.step = 0
      this.clear()
      this.v.wrong(i)
      this.setPhase('show')
      this.after(1.0, () => this.playPattern())
      return 'wrong'
    }
    return 'note'
  }

  /** Daddy's hand landed on pod `i` (or, `missed`, beside it). */
  daddySlap(i: number, missed: boolean) {
    if (this.dad !== 'going' || i !== this.dadTarget) return
    this.dad = 'rest'
    this.after(missed ? 1.1 : 0.6, () => this.dad === 'rest' && (this.dad = 'idle'))
    if (missed || this.lights[i] !== 'blue' || this.phase !== 'play') return
    this.lights[i] = 'off'
    this.daddy++
    this.v.hit(i, 'daddy')
    this.v.score(this.score, this.daddy)
    this.after(0.9, () => this.spawnBlue())
  }

  /** Is Daddy on his way to a light? (The view stops him if she took it.) */
  get daddyTarget() {
    return this.dad === 'going' ? this.dadTarget : -1
  }

  /** The pod a 👆 should point at when she's been still a while: one of hers lit up, or the pattern's next. */
  get hint(): number {
    if (this.phase === 'copy') return PATTERNS[this.pattern]?.[this.step] ?? -1
    if (this.phase !== 'play' && this.phase !== 'free') return -1
    return this.lights.indexOf('lit')
  }

  update(dt: number) {
    this.time += dt
    for (const tm of [...this.timers]) {
      if (this.time < tm.at) continue
      this.timers.splice(this.timers.indexOf(tm), 1)
      tm.f()
    }
    if (this.phase === 'copy') {
      this.idle += dt
      if (this.idle > HELP_S && !this.lights.includes('help')) this.help()
    }
    // Daddy's race: he goes for his light only while he's behind her (so she always wins); caught up, he dawdles.
    if (this.round === 3 && this.phase === 'play' && this.dad === 'idle') {
      const blue = this.lights.indexOf('blue')
      if (blue < 0) return
      if (this.daddy >= this.score) {
        this.dad = 'dawdle'
        this.v.daddyDawdle(this.dawdles++)
        this.after(2.6, () => this.dad === 'dawdle' && (this.dad = 'idle'))
      } else {
        this.dad = 'going'
        this.dadTarget = blue
        this.v.daddyGo(blue, this.daddy > 0 && Math.random() < 0.25)
      }
    }
  }
}

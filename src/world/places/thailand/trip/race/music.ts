// The races' music (the boat race, the Nan Mountain Cup), synthesized like the rest of Thailand's sounds (kit/sfx tone
// and noise, no files): a bouncy four-bar loop (bass, a little drum kit, chords and a tune), quiet under the voices (it
// ducks while anyone talks), faster on the last lap (or the last stretch), with sparkly runs on top while the rainbow
// lasts. Notes are scheduled a moment ahead.
import { speakingVoice } from '../../../../../sdk'
import { noise, tone } from '../../../../kit/sfx'

const C4 = 261.63
const f = (semi: number) => C4 * 2 ** (semi / 12)
/** Four bars of 16 steps: C, A minor, F, G. The tune (semitones from middle C, null = rest). */
const TUNE: (number | null)[] = [
  0, null, 4, null, 7, null, 12, null, 9, null, 7, null, 4, null, 7, null,
  9, null, 7, null, 4, null, 2, null, 4, null, null, null, 0, null, null, null,
  5, null, 9, null, 12, null, 9, null, 7, null, 5, null, 4, null, 2, null,
  7, null, 7, null, 9, null, 11, null, 12, null, null, null, 14, null, 12, null,
]
const ROOTS = [-12, -15, -19, -17]
const CHORDS = [
  [0, 4, 7],
  [-3, 0, 4],
  [-7, -3, 0],
  [-5, -1, 2],
]

export class RaceMusic {
  private timer = 0
  private step = 0
  private next = 0
  private bpm = 150
  private star = false
  private on = false

  start() {
    if (this.on) return
    this.on = true
    this.step = 0
    this.next = performance.now() / 1000 + 0.05
    this.timer = window.setInterval(() => this.schedule(), 50)
  }
  stop() {
    this.on = false
    clearInterval(this.timer)
  }
  /** The last lap: a little faster. */
  setFinal(on: boolean) {
    this.bpm = on ? 172 : 150
  }
  setStar(on: boolean) {
    this.star = on
  }

  private schedule() {
    const now = performance.now() / 1000
    // (A tab in the background comes back with a big gap: start again from now rather than a burst of notes.)
    if (this.next < now - 0.3) this.next = now + 0.02
    const vol = speakingVoice() ? 0.35 : 1
    while (this.next < now + 0.2) {
      this.play(this.step, Math.max(0, this.next - now), vol)
      this.step = (this.step + 1) % 64
      this.next += 60 / this.bpm / 4
    }
  }

  private play(i: number, at: number, vol: number) {
    const bar = Math.floor(i / 16)
    const s = i % 16
    const dur = 60 / this.bpm / 4
    // Drums: a soft kick on the beat, a snare on two and four, hats on the eighths.
    if (s % 8 === 0) tone(130, 45, 0.16, 0.07 * vol, 'sine', at)
    if (s % 8 === 4) noise(0.1, 0.035 * vol, 'bandpass', 1800, 1200, at, 0.8)
    if (s % 2 === 0) noise(0.03, 0.012 * vol, 'highpass', 7000, 6000, at, 1)
    // Bass: the root, bouncing up an octave.
    const root = ROOTS[bar]
    if (s % 4 === 0) tone(f(root), f(root), dur * 1.8, 0.05 * vol, 'triangle', at)
    if (s % 4 === 2) tone(f(root + 12), f(root + 12), dur * 1.2, 0.035 * vol, 'triangle', at)
    // Chords: a quick off-beat stab.
    if (s % 4 === 2) for (const n of CHORDS[bar]) tone(f(n), f(n), dur * 0.9, 0.008 * vol, 'square', at)
    // The tune.
    const n = TUNE[i]
    if (n !== null) tone(f(n + 12), f(n + 12), dur * 1.7, 0.03 * vol, 'triangle', at)
    // The rainbow: a sparkly run up the chord on every step.
    if (this.star) {
      const c = CHORDS[bar]
      const k = c[s % 3] + 24 + (Math.floor(s / 3) % 2) * 12
      tone(f(k), f(k), dur * 0.8, 0.012 * vol, 'sine', at)
    }
  }
}

// The band's music for opera night: a short, cheerful tune in 6/8 (written for this game), played by synthesized
// voices on a look-ahead scheduler. Kaylee's wand sets how loud it is (forte / piano) and how fast; tapping a friend
// gives their instrument a solo. Volume and tempo glide, so nothing clicks.
import { audio } from '../synth'

export type Voice = 'mandolin' | 'tambourine' | 'horn' | 'bells' | 'accordion' | 'piano'

const N: Record<string, number> = {
  C3: 130.81, F3: 174.61, G3: 196, A3: 220, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880,
}
/** Eight bars of six eighth notes; '' is a rest, '-' holds. */
const MELODY = [
  'E5', '', 'E5', 'D5', 'C5', '-', 'D5', '-', 'E5', 'F5', '-', '', 'G5', '', 'F5', 'E5', 'D5', '-', 'C5', '-', '-', 'G4', '-', '',
  'E5', '', 'G5', 'A5', '-', 'G5', 'F5', '-', 'E5', 'D5', '-', '', 'E5', '', 'D5', 'C5', '-', 'B4', 'C5', '-', '-', '-', '-', '',
]
const CHORDS = [
  ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['G3', 'B3', 'F4'], ['C4', 'E4', 'G4'],
  ['C4', 'E4', 'G4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'],
]
const BASS = [['C3', 'G3'], ['G3', 'D4'], ['G3', 'B3'], ['C3', 'G3'], ['C3', 'E4'], ['F3', 'C4'], ['G3', 'D4'], ['C3', 'G3']]

export class Band {
  private master: GainNode | null = null
  private timer = 0
  private step = 0
  private next = 0
  bpm = 112
  private soloVoice: Voice | null = null
  private soloUntil = 0
  /** Called on every beat (twice per bar), for bouncing friends. */
  onBeat: ((strong: boolean) => void) | null = null

  start() {
    const a = audio()
    if (!a || this.timer) return
    this.master = a.createGain()
    this.master.gain.value = 0.0001
    this.master.connect(a.destination)
    this.master.gain.setTargetAtTime(0.16, a.currentTime, 0.3)
    this.next = a.currentTime + 0.1
    this.step = 0
    this.timer = window.setInterval(() => this.schedule(), 25)
  }

  stop(fade = 0.6) {
    const a = audio()
    if (this.timer) window.clearInterval(this.timer)
    this.timer = 0
    const m = this.master
    if (a && m) {
      m.gain.setTargetAtTime(0.0001, a.currentTime, fade / 3)
      window.setTimeout(() => m.disconnect(), fade * 1000 + 200)
    }
    this.master = null
  }

  /** 0 = piano (soft) .. 1 = forte (loud). */
  setLevel(level: number) {
    const a = audio()
    if (!a || !this.master) return
    const v = 0.035 + Math.max(0, Math.min(1, level)) * 0.3
    this.master.gain.setTargetAtTime(v, a.currentTime, 0.15)
  }

  setTempo(bpm: number) {
    this.bpm = Math.max(84, Math.min(170, bpm))
  }

  solo(v: Voice, seconds = 4) {
    const a = audio()
    this.soloVoice = v
    this.soloUntil = (a?.currentTime ?? 0) + seconds
  }

  private schedule() {
    const a = audio()
    if (!a || !this.master) return
    // Eighth notes: a beat (dotted quarter) is three of them.
    const eighth = 60 / this.bpm / 3
    while (this.next < a.currentTime + 0.12) {
      this.play(this.step, this.next, eighth)
      this.next += eighth
      this.step = (this.step + 1) % MELODY.length
    }
  }

  private play(step: number, t: number, eighth: number) {
    const a = audio()
    if (!a || !this.master) return
    const bar = Math.floor(step / 6)
    const inBar = step % 6
    const solo = this.soloVoice && t < this.soloUntil ? this.soloVoice : null
    const gain = (v: Voice) => (solo ? (solo === v ? 1.8 : 0.35) : 1)
    const delay = Math.max(0, t - a.currentTime)
    if (inBar === 0 || inBar === 3) {
      const strong = inBar === 0
      if (this.onBeat) window.setTimeout(() => this.onBeat?.(strong), delay * 1000)
      // Bass (piano left hand) and the accordion's chord on the beat.
      this.note(N[BASS[bar][strong ? 0 : 1]], eighth * 2.6, 0.5 * gain('piano'), t, 'triangle')
      for (const c of CHORDS[bar]) this.note(N[c], eighth * 1.6, 0.11 * gain('accordion'), t, 'sawtooth', 0.03)
      // The horn on the first beat of every other bar.
      if (strong && bar % 2 === 1) this.note(N[CHORDS[bar][0]] * 2, eighth * 2.5, 0.12 * gain('horn'), t, 'square', 0.04)
    }
    // Tambourine on every eighth, accented on the beats.
    this.shake(t, (inBar === 0 || inBar === 3 ? 0.18 : 0.07) * gain('tambourine'))
    // The tune: mandolin (plucked) doubled by bells an octave up.
    const m = MELODY[step]
    if (m && m !== '-') {
      let len = 1
      while (MELODY[(step + len) % MELODY.length] === '-') len++
      this.note(N[m], eighth * len * 0.95, 0.32 * gain('mandolin'), t, 'triangle', 0.005, true)
      this.note(N[m] * 2, eighth * 1.4, 0.07 * gain('bells'), t, 'sine', 0.002)
    }
  }

  private note(f: number, dur: number, vol: number, t: number, type: OscillatorType, attack = 0.01, pluck = false) {
    const a = audio()
    if (!a || !this.master) return
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = type
    o.frequency.setValueAtTime(f, t)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(vol, t + attack)
    g.gain.exponentialRampToValueAtTime(pluck ? vol * 0.25 : vol * 0.6, t + Math.min(dur * 0.5, 0.25))
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g).connect(this.master)
    o.start(t)
    o.stop(t + dur + 0.05)
  }

  private shake(t: number, vol: number) {
    const a = audio()
    if (!a || !this.master) return
    const len = 0.06
    const buf = a.createBuffer(1, Math.ceil(a.sampleRate * len), a.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
    const src = a.createBufferSource()
    src.buffer = buf
    const f = a.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = 6000
    const g = a.createGain()
    g.gain.value = vol
    src.connect(f).connect(g).connect(this.master)
    src.start(t)
  }
}

/** Lupa's high note: a soprano-ish voice with a slow vibrato that swells, rises a little, and rings. */
export function highNote() {
  const a = audio()
  if (!a) return
  const t = a.currentTime + 0.05
  const dur = 3.2
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.5)
  g.gain.setValueAtTime(0.22, t + dur - 0.8)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  const lfo = a.createOscillator()
  const lfoGain = a.createGain()
  lfo.frequency.value = 5.5
  lfoGain.gain.setValueAtTime(0, t)
  lfoGain.gain.linearRampToValueAtTime(14, t + 1)
  lfo.connect(lfoGain)
  for (const [mult, vol, type] of [[1, 1, 'sine'], [2, 0.18, 'sine'], [3, 0.06, 'triangle']] as const) {
    const o = a.createOscillator()
    const og = a.createGain()
    o.type = type
    o.frequency.setValueAtTime(N.E5 * mult, t)
    o.frequency.exponentialRampToValueAtTime(N.A5 * mult, t + 0.9)
    lfoGain.connect(o.frequency)
    og.gain.value = vol
    o.connect(og).connect(g)
    o.start(t)
    o.stop(t + dur + 0.1)
  }
  g.connect(a.destination)
  lfo.start(t)
  lfo.stop(t + dur + 0.1)
}

/** The crowd cheering: a swell of soft noise. */
export function cheer() {
  const a = audio()
  if (!a) return
  const t = a.currentTime
  const dur = 2.4
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = a.createBufferSource()
  src.buffer = buf
  const f = a.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = 1100
  f.Q.value = 0.6
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.4)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
}

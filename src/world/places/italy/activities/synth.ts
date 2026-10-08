// Tiny Web Audio helpers shared by Venice, Etna and the opera finale (the same tone + noise recipe as pisa/audio.ts).
let ctx: AudioContext | undefined
export function audio() {
  if (!ctx && typeof AudioContext !== 'undefined') ctx = new AudioContext()
  if (ctx?.state === 'suspended') void ctx.resume()
  return ctx
}

/** One note that glides from `freq` to `to`. `out` lets a caller route it through its own gain (the opera band). */
export function tone(freq: number, to: number, dur: number, vol: number, delay = 0, type: OscillatorType = 'sine', attack = 0.01, out?: AudioNode) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + delay
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (to !== freq) o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(out ?? a.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

/** A burst of filtered noise (splashes, whooshes, crackles). */
export function noise(dur: number, vol: number, freq: number, q: number, delay = 0, type: BiquadFilterType = 'bandpass') {
  const a = audio()
  if (!a) return
  const t = a.currentTime + delay
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = a.createBufferSource()
  src.buffer = buf
  const f = a.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  const g = a.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
  src.stop(t + dur + 0.05)
}

/** Note frequencies by name, for little tunes. */
export const NOTE: Record<string, number> = {
  G3: 196, A3: 220, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5,
}

export const fx = {
  /** An oar stroke pushing water. */
  splash: () => {
    noise(0.35, 0.18, 900, 0.8)
    noise(0.2, 0.08, 2400, 1, 0.08)
  },
  /** A rubber-duck quack. */
  quack: () => {
    tone(520, 380, 0.16, 0.12, 0, 'sawtooth', 0.01)
    tone(500, 360, 0.16, 0.1, 0.2, 'sawtooth', 0.01)
  },
  /** The boat ambulance's two-tone siren. */
  siren: () => {
    for (let i = 0; i < 4; i++) tone(i % 2 ? 660 : 880, i % 2 ? 660 : 880, 0.32, 0.05, i * 0.34, 'triangle', 0.02)
  },
  /** A firework: a rising whistle, then a soft boom and crackle. */
  firework: () => {
    tone(500, 1400, 0.45, 0.04, 0, 'sine', 0.05)
    tone(120, 50, 0.6, 0.22, 0.45, 'sine')
    noise(0.7, 0.12, 3000, 0.6, 0.45)
  },
  /** The accordion: a reedy major chord that swells. */
  accordion: (root = NOTE.C4) => {
    for (const r of [1, 1.26, 1.5, 2]) tone(root * r, root * r, 0.9, 0.05, 0, 'sawtooth', 0.12)
  },
  /** Snow scrunch. */
  scrunch: () => noise(0.18, 0.2, 1800, 0.5, 0, 'highpass'),
  /** A lemon squeeze: a little squelch. */
  squish: () => {
    tone(300, 160, 0.18, 0.12, 0, 'sine', 0.02)
    noise(0.12, 0.06, 1200, 2)
  },
  /** Sliding down the mountain. */
  slide: (dur = 1.4) => tone(900, 200, dur, 0.05, 0, 'triangle', 0.05),
  /** A soft volcano puff. */
  puff: () => noise(0.8, 0.14, 180, 0.7, 0, 'lowpass'),
  /** One piano key. */
  key: (f: number) => {
    tone(f, f, 1.1, 0.16, 0, 'triangle', 0.005)
    tone(f * 2, f * 2, 0.5, 0.04, 0, 'sine', 0.005)
  },
}

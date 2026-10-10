// The terraces' own sound effects (synthesized, like ../fluffy/sfx.ts): a heavy stone clonking into its gap, a funny
// bonk for a stone that doesn't fit, a grumbly rumble as stones roll in, the wind whistling through an Inca doorway,
// a squawk, a rustle and a llama hum.
let ctx: AudioContext | undefined
function audio() {
  if (!ctx && typeof AudioContext !== 'undefined') ctx = new AudioContext()
  if (ctx?.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, to: number, dur: number, vol: number, type: OscillatorType = 'sine', delay = 0, vibrato = 0) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + delay
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  o.frequency.exponentialRampToValueAtTime(to, t + dur)
  if (vibrato) {
    const lfo = a.createOscillator()
    const depth = a.createGain()
    lfo.frequency.value = 6
    depth.gain.value = vibrato
    lfo.connect(depth).connect(o.frequency)
    lfo.start(t)
    lfo.stop(t + dur + 0.05)
  }
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur / 3))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

let noiseBuffer: AudioBuffer | undefined
function noise(dur: number, vol: number, filter: BiquadFilterType, freq: number, toFreq = freq, delay = 0, q = 1) {
  const a = audio()
  if (!a) return
  if (!noiseBuffer) {
    noiseBuffer = a.createBuffer(1, a.sampleRate, a.sampleRate)
    const d = noiseBuffer.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const t = a.currentTime + delay
  const src = a.createBufferSource()
  src.buffer = noiseBuffer
  src.loop = true
  const f = a.createBiquadFilter()
  f.type = filter
  f.Q.value = q
  f.frequency.setValueAtTime(freq, t)
  f.frequency.exponentialRampToValueAtTime(toFreq, t + dur)
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.03, dur / 3))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
  src.stop(t + dur + 0.05)
}

export const tsfx = {
  /** A heavy stone settling into its gap: a deep thud and a stony click. */
  clonk: () => {
    tone(130, 55, 0.28, 0.32, 'sine')
    noise(0.12, 0.22, 'lowpass', 900, 200)
    noise(0.05, 0.16, 'bandpass', 2400, 1800, 0.04, 3)
  },
  /** A stone that doesn't fit: a hollow, funny "bonk". */
  bonk: () => {
    tone(420, 180, 0.18, 0.2, 'triangle')
    tone(300, 140, 0.2, 0.12, 'sine', 0.05)
  },
  /** Lifting a heavy stone: a short scrape. */
  lift: () => noise(0.16, 0.1, 'bandpass', 500, 1100, 0, 1.4),
  /** Stones rolling in: a soft grumbling rumble. */
  rumble: () => {
    noise(0.9, 0.16, 'lowpass', 300, 120)
    ;[0, 0.18, 0.4, 0.62].forEach((d) => tone(110 + Math.random() * 40, 60, 0.12, 0.12, 'sine', d))
  },
  /** The wind whistling through the stone doorway. */
  whistle: () => {
    tone(880, 1180, 0.9, 0.05, 'sine', 0, 18)
    noise(1.0, 0.07, 'bandpass', 1200, 700, 0, 2)
  },
  /** The cock-of-the-rock's squawk. */
  squawk: () => {
    tone(900, 600, 0.16, 0.12, 'sawtooth')
    tone(1100, 700, 0.18, 0.1, 'sawtooth', 0.18)
  },
  /** Leaves rustling. */
  rustle: () => [0, 0.12, 0.25].forEach((d) => noise(0.12, 0.1, 'highpass', 2500, 4000, d, 0.8)),
  /** A happy llama hum. */
  hum: () => tone(240, 270, 0.7, 0.07, 'triangle', 0, 10),
  /** A tiny "ptoo!" (llamas spit; here it's a grass ball). */
  spit: () => {
    noise(0.07, 0.25, 'bandpass', 1500, 600, 0, 2)
    tone(600, 900, 0.08, 0.08, 'sine', 0.05)
  },
  /** Plants popping up out of the soil. */
  sprout: () => [0, 0.09, 0.18, 0.27].forEach((d, i) => tone(500 + i * 160, 900 + i * 200, 0.1, 0.08, 'sine', d)),
  /** Camera shutter. */
  click: () => {
    noise(0.04, 0.3, 'highpass', 2000, 3000)
    noise(0.05, 0.25, 'highpass', 1500, 2500, 0.09)
  },
  /** A soft cloud puff. */
  puff: () => noise(0.35, 0.08, 'lowpass', 1400, 300),
}

// Baan Chang Cafe's own sound effects (synthesized, like Peru's): ice clinks, a pouring glug, a chocolate squirt, a
// spoon's tinkle, a slurp, munching and crunching, a trunk's sniff and toss, a trumpet, a stomp, the tokay gecko's
// "to-kay!", a myna's whistle and the water shower.
let ctx: AudioContext | undefined
function audio() {
  if (!ctx && typeof AudioContext !== 'undefined') ctx = new AudioContext()
  if (ctx?.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, to: number, dur: number, vol: number, type: OscillatorType = 'sine', delay = 0) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + delay
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.03, dur / 3))
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

export const csfx = {
  clink: (n = 0) => {
    tone(2200 + n * 260, 2100 + n * 260, 0.18, 0.12, 'triangle')
    tone(3300 + n * 300, 3200, 0.12, 0.05, 'sine', 0.02)
  },
  /** One gulp of a pour; call it every ~0.2 s while pouring. */
  glug: (thick = false) => {
    tone(thick ? 260 : 420, thick ? 180 : 300, 0.12, 0.09, 'sine')
    noise(0.14, 0.04, 'bandpass', thick ? 700 : 1100, thick ? 500 : 800, 0, 3)
  },
  squirt: () => noise(0.25, 0.08, 'bandpass', 600, 300, 0, 2),
  tinkle: () => tone(2600 + Math.random() * 600, 2500, 0.1, 0.05, 'triangle'),
  fountain: () => {
    noise(0.5, 0.08, 'highpass', 1500, 3000)
    tone(500, 900, 0.3, 0.06, 'sine')
  },
  slurp: () => {
    noise(0.5, 0.1, 'bandpass', 500, 1600, 0, 4)
    tone(300, 700, 0.45, 0.05, 'sine')
  },
  munch: () => {
    for (let i = 0; i < 3; i++) noise(0.08, 0.12, 'bandpass', 900 + i * 200, 600, i * 0.16, 2)
  },
  crunch: () => {
    for (let i = 0; i < 4; i++) noise(0.06, 0.16, 'highpass', 1800, 1200, i * 0.12, 1)
  },
  sniff: () => {
    noise(0.12, 0.08, 'bandpass', 1400, 2200, 0, 3)
    noise(0.12, 0.08, 'bandpass', 1400, 2200, 0.18, 3)
  },
  toss: () => {
    noise(0.3, 0.07, 'bandpass', 800, 2400, 0, 2)
    tone(300, 900, 0.3, 0.05, 'sine')
  },
  trumpet: (high = false) => {
    const f = high ? 620 : 440
    tone(f, f * 1.5, 0.5, 0.12, 'sawtooth')
    tone(f * 1.01, f * 1.48, 0.5, 0.06, 'square')
    noise(0.4, 0.04, 'bandpass', 1200, 1800, 0, 2)
  },
  stomp: () => {
    tone(90, 40, 0.35, 0.3, 'sine')
    noise(0.3, 0.15, 'lowpass', 600, 200)
  },
  splat: () => {
    noise(0.25, 0.14, 'bandpass', 900, 400, 0, 1)
    tone(300, 120, 0.2, 0.08, 'triangle')
  },
  gecko: () => {
    tone(180, 160, 0.18, 0.14, 'square')
    tone(130, 110, 0.28, 0.14, 'square', 0.24)
  },
  myna: () => {
    tone(1400, 2600, 0.12, 0.08, 'sine')
    tone(2400, 1500, 0.14, 0.07, 'sine', 0.16)
  },
  fan: () => noise(0.5, 0.05, 'bandpass', 400, 900, 0, 1),
  squish: () => {
    noise(0.25, 0.08, 'lowpass', 900, 300)
    tone(220, 140, 0.2, 0.05, 'sine')
  },
  coconut: () => {
    tone(320, 260, 0.12, 0.14, 'triangle')
    tone(300, 240, 0.1, 0.1, 'triangle', 0.2)
  },
  spray: () => noise(0.9, 0.08, 'highpass', 2000, 4000),
}

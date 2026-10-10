// The salon's own sound effects (synthesized, like ../../../../kit/sfx.ts): the clippers' buzzy snip, a brush swish,
// a happy alpaca hum, the cold mountain wind, Abuela's snore and the camera click.
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
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.08, dur / 3))
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
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.15, dur / 3))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
  src.stop(t + dur + 0.05)
}

export const fsfx = {
  /** Clippers: a short buzzy "bzzt-snip". */
  snip: () => {
    tone(140, 150, 0.09, 0.05, 'sawtooth')
    noise(0.06, 0.12, 'highpass', 3500, 5000, 0.03, 1.2)
  },
  /** Brush: a soft swish. */
  swish: () => noise(0.18, 0.06, 'bandpass', 1800, 900, 0, 0.9),
  /** A happy alpaca hum: "mmmm" with a wobble. */
  hum: () => tone(210, 240, 0.7, 0.07, 'triangle', 0, 9),
  /** A gust of cold mountain wind. */
  wind: () => {
    noise(1.8, 0.12, 'bandpass', 400, 1400, 0, 0.7)
    noise(1.4, 0.06, 'bandpass', 900, 500, 0.4, 1.5)
  },
  /** Abuela's snore; louder when she's poked. */
  snore: (loud = false) => {
    tone(90, 70, 0.9, loud ? 0.14 : 0.07, 'sawtooth')
    noise(0.9, loud ? 0.08 : 0.04, 'lowpass', 500, 250)
  },
  /** Camera shutter. */
  click: () => {
    noise(0.04, 0.3, 'highpass', 2000, 3000)
    noise(0.05, 0.25, 'highpass', 1500, 2500, 0.09)
  },
  /** A drop of color going "bloop". */
  drop: () => tone(900, 300, 0.25, 0.12, 'sine'),
  /** Baby bird peeps. */
  peep: () => [0, 0.12, 0.24].forEach((d) => tone(2200, 3000, 0.07, 0.06, 'triangle', d)),
  /** Hummingbird zip. */
  zip: () => tone(700, 2400, 0.22, 0.06, 'sine', 0, 40),
  /** Water ripple. */
  plip: () => [0, 0.14].forEach((d) => tone(700, 1300, 0.12, 0.08, 'sine', d)),
  /** Hat lands: a soft woolly "fwump". */
  fwump: () => {
    tone(300, 160, 0.14, 0.12)
    noise(0.12, 0.06, 'lowpass', 1200, 400)
  },
}

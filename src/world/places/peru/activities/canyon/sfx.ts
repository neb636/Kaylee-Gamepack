// The canyon's own sound effects (synthesized, like ../fluffy/sfx.ts): the wind under Coco's wings (a steady loop
// whose loudness follows his speed), the bright rising shimmer of warm air, heavy wing flaps, the river and the falls.
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
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.06, dur / 3))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

let noiseBuffer: AudioBuffer | undefined
function noiseSource(a: AudioContext) {
  if (!noiseBuffer) {
    noiseBuffer = a.createBuffer(1, a.sampleRate * 2, a.sampleRate)
    const d = noiseBuffer.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const src = a.createBufferSource()
  src.buffer = noiseBuffer
  src.loop = true
  return src
}
function noise(dur: number, vol: number, filter: BiquadFilterType, freq: number, toFreq = freq, delay = 0, q = 1) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + delay
  const src = noiseSource(a)
  const f = a.createBiquadFilter()
  f.type = filter
  f.Q.value = q
  f.frequency.setValueAtTime(freq, t)
  f.frequency.exponentialRampToValueAtTime(toFreq, t + dur)
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.12, dur / 3))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
  src.stop(t + dur + 0.05)
}

/** The wind under Coco's wings: one looping noise whose loudness and brightness follow how fast he flies. */
export function windLoop() {
  const a = audio()
  if (!a) return { set: () => {}, stop: () => {} }
  const src = noiseSource(a)
  const f = a.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = 0.8
  f.frequency.value = 500
  const g = a.createGain()
  g.gain.value = 0.0001
  src.connect(f).connect(g).connect(a.destination)
  src.start()
  return {
    /** 0..1 */
    set: (k: number) => {
      const t = a.currentTime
      g.gain.setTargetAtTime(0.0001 + k * 0.07, t, 0.25)
      f.frequency.setTargetAtTime(380 + k * 900, t, 0.25)
    },
    stop: () => {
      g.gain.setTargetAtTime(0.0001, a.currentTime, 0.1)
      src.stop(a.currentTime + 0.4)
    },
  }
}

export const csfx = {
  /** Into warm air: a bright little rising shimmer. */
  lift: () => [0, 0.08, 0.16, 0.24].forEach((d, i) => tone(660 * 1.26 ** i, 700 * 1.26 ** i, 0.22, 0.05, 'triangle', d)),
  /** One big, slow condor wingbeat. */
  flap: () => {
    noise(0.35, 0.1, 'lowpass', 600, 180)
    tone(120, 70, 0.25, 0.05)
  },
  /** Pluma's little flaps. */
  flutter: () => [0, 0.07, 0.14].forEach((d) => noise(0.06, 0.05, 'bandpass', 1400, 900, d, 1.5)),
  /** A dive: a rising, then falling whoosh. */
  whoosh: () => noise(0.9, 0.16, 'bandpass', 500, 2400, 0, 0.9),
  /** Skimming the river. */
  splash: () => {
    noise(0.4, 0.14, 'highpass', 1200, 3000)
    tone(500, 1100, 0.12, 0.05, 'sine', 0.05)
  },
  /** The waterfall's mist: a soft rush. */
  rush: () => noise(1.4, 0.08, 'lowpass', 2400, 900),
  /** A camera shutter. */
  click: () => {
    noise(0.04, 0.3, 'highpass', 2000, 3000)
    noise(0.05, 0.25, 'highpass', 1500, 2500, 0.09)
  },
  /** Tourists cheering, far away. */
  cheer: () => {
    noise(1.0, 0.07, 'bandpass', 1200, 900, 0, 0.6)
    ;[0, 0.12, 0.3].forEach((d, i) => tone(520 + i * 90, 760 + i * 90, 0.18, 0.04, 'triangle', d))
  },
  /** The viscacha's squeak. */
  squeak: () => [0, 0.14].forEach((d) => tone(1500, 2100, 0.08, 0.06, 'sine', d)),
  /** A little bird's tweet. */
  tweet: () => [0, 0.1, 0.2].forEach((d) => tone(2600, 3600, 0.06, 0.05, 'triangle', d)),
  /** A cloud puff. */
  puff: () => noise(0.4, 0.08, 'lowpass', 900, 300),
  /** A sparkle on the river. */
  glint: () => [0, 0.1].forEach((d, i) => tone(1800 + i * 500, 2400 + i * 500, 0.14, 0.05, 'sine', d)),
}

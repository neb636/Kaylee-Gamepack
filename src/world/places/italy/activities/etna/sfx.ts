// Snow on a Volcano's own sound effects (synthesized, like ../../../../kit/sfx.ts): a goat's bleat, a steam vent's
// hiss, the volcano's friendly rumble, a crunchy snow "pomf", a lemon squish, a crab's click and a gull's squawk.
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
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

let noiseBuffer: AudioBuffer | undefined
function noise(dur: number, vol: number, filter: BiquadFilterType, freq: number, toFreq = freq, delay = 0) {
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
  const f = a.createBiquadFilter()
  f.type = filter
  f.frequency.setValueAtTime(freq, t)
  f.frequency.exponentialRampToValueAtTime(toFreq, t + dur)
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
  src.stop(t + dur + 0.05)
}

export const esfx = {
  bleat: () => [0, 0.09, 0.18, 0.27].forEach((d, i) => tone(i % 2 ? 470 : 520, i % 2 ? 440 : 500, 0.1, 0.09, 'sawtooth', d)),
  hiss: () => noise(0.9, 0.12, 'highpass', 3000, 6000),
  rumble: () => (noise(1.4, 0.3, 'lowpass', 180, 60), tone(70, 40, 1.2, 0.2, 'sine')),
  pomf: () => (noise(0.25, 0.25, 'lowpass', 900, 300), tone(180, 90, 0.2, 0.1, 'sine')),
  crunch: () => noise(0.12, 0.12, 'bandpass', 1800, 900),
  squish: () => (noise(0.3, 0.14, 'bandpass', 600, 1400), tone(300, 520, 0.25, 0.05, 'triangle')),
  drip: () => tone(1200, 700, 0.12, 0.08, 'sine'),
  click: () => [0, 0.1].forEach((d) => tone(2400, 2000, 0.04, 0.08, 'square', d)),
  squawk: () => (tone(900, 600, 0.22, 0.1, 'sawtooth'), tone(1100, 700, 0.18, 0.05, 'square', 0.25)),
  thud: () => (tone(120, 60, 0.25, 0.2, 'sine'), noise(0.1, 0.1, 'lowpass', 600)),
  sizzle: () => noise(0.5, 0.07, 'highpass', 5000, 8000),
  scoop: () => (noise(0.18, 0.18, 'lowpass', 1200, 500), tone(400, 260, 0.15, 0.06, 'triangle')),
}

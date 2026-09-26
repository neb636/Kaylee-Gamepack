// Extra synthesized sound effects for Around the World (the SDK's `sounds` covers taps, chimes and notes).
// Each one layers a pitched tone with filtered noise so it reads as a real "thing" (a boing, a splash) rather than a beep.

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
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01)
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
  const f = a.createBiquadFilter()
  f.type = filter
  f.Q.value = q
  f.frequency.setValueAtTime(freq, t)
  f.frequency.exponentialRampToValueAtTime(toFreq, t + dur)
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
  src.stop(t + dur + 0.05)
}

export const sfx = {
  /** Springy "boing" for a hop take-off. */
  boing: () => {
    const a = audio()
    if (!a) return
    const t = a.currentTime
    const o = a.createOscillator()
    const g = a.createGain()
    const lfo = a.createOscillator()
    const depth = a.createGain()
    o.type = 'triangle'
    o.frequency.setValueAtTime(180, t)
    o.frequency.exponentialRampToValueAtTime(520, t + 0.28)
    lfo.frequency.value = 18
    depth.gain.value = 40
    lfo.connect(depth).connect(o.frequency)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34)
    o.connect(g).connect(a.destination)
    o.start(t)
    lfo.start(t)
    o.stop(t + 0.4)
    lfo.stop(t + 0.4)
  },
  /** Soft dusty landing thump. */
  thump: () => {
    tone(140, 60, 0.16, 0.22)
    noise(0.22, 0.08, 'lowpass', 900, 200)
  },
  /** Water splash. */
  splash: () => {
    noise(0.5, 0.16, 'bandpass', 2400, 700, 0, 0.8)
    noise(0.3, 0.1, 'highpass', 3000, 5000, 0.05)
    tone(900, 300, 0.12, 0.06, 'sine', 0.02)
  },
  /** Happy pop, e.g. landing in a pouch. */
  pop: () => {
    tone(300, 900, 0.1, 0.18)
    tone(900, 1400, 0.12, 0.08, 'triangle', 0.06)
  },
  /** Soft "munch munch munch" for eating. */
  munch: () => [0, 0.17, 0.34].forEach((d) => noise(0.11, 0.35, 'bandpass', 900 + Math.random() * 500, 900, d, 1.2)),
  /** A little "fwip" for putting something on. */
  fwip: () => noise(0.14, 0.08, 'bandpass', 1200, 4000, 0, 2),
}

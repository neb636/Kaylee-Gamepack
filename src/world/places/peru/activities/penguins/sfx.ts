// The penguin cliff's own sound effects (synthesized, like ../fluffy/sfx.ts): the rubbery stretch of a pull, the
// splash (small and big), a "blip" plop, chick peeps, a gulp, Lobo's bark, a tern's squawk, the tour boat's toot, an
// egg cracking, bubbles and the camera click.
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
    lfo.frequency.value = 7
    depth.gain.value = vibrato
    lfo.connect(depth).connect(o.frequency)
    lfo.start(t)
    lfo.stop(t + dur + 0.05)
  }
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.04, dur / 3))
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
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.03, dur / 4))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
  src.stop(t + dur + 0.05)
}

let lastStretch = 0
export const psfx = {
  /** The rubbery creak of a pull; higher the further she pulls. */
  stretch: (k: number) => {
    const now = performance.now()
    if (now - lastStretch < 90) return
    lastStretch = now
    tone(160 + k * 260, 180 + k * 300, 0.09, 0.035, 'triangle')
  },
  /** Let go: a springy "fwoing". */
  launch: (k: number) => {
    tone(260 + k * 200, 900 + k * 500, 0.22, 0.09, 'triangle')
    noise(0.18, 0.04, 'bandpass', 1500, 3000, 0, 1.5)
  },
  /** Into the water; `big` 0..1 (a belly-flop is a big one). */
  splash: (big: number) => {
    noise(0.35 + big * 0.4, 0.12 + big * 0.18, 'lowpass', 2400 + big * 1500, 300, 0, 0.8)
    noise(0.25, 0.08, 'highpass', 3000, 1500, 0.05, 1)
    tone(500, 140, 0.18, 0.08 + big * 0.06, 'sine')
  },
  /** A tiny pull: "blip". */
  blip: () => tone(1200, 400, 0.14, 0.1, 'sine'),
  /** Chick peeps. */
  peep: (n = 2) => {
    for (let i = 0; i < n; i++) tone(2400 + Math.random() * 500, 3200, 0.08, 0.05, 'triangle', i * 0.13)
  },
  /** Swallowing a fish. */
  gulp: () => {
    tone(320, 120, 0.16, 0.12)
    tone(260, 90, 0.14, 0.1, 'sine', 0.14)
  },
  /** Lobo's bark. */
  bark: () => {
    tone(330, 220, 0.16, 0.09, 'sawtooth')
    noise(0.14, 0.05, 'bandpass', 900, 600, 0, 2)
    tone(350, 230, 0.16, 0.09, 'sawtooth', 0.22)
    noise(0.14, 0.05, 'bandpass', 900, 600, 0.22, 2)
  },
  /** An Inca tern's squawk. */
  squawk: () => {
    tone(1400, 900, 0.18, 0.06, 'sawtooth', 0, 60)
    tone(1500, 1000, 0.14, 0.05, 'sawtooth', 0.2, 60)
  },
  /** The tour boat's horn. */
  toot: () => {
    tone(330, 330, 0.35, 0.07, 'square')
    tone(330, 330, 0.25, 0.07, 'square', 0.45)
  },
  /** The egg cracking. */
  crack: () => {
    noise(0.06, 0.2, 'highpass', 2500, 4000)
    noise(0.05, 0.15, 'highpass', 2000, 3500, 0.09)
  },
  /** Bubbles. */
  bubbles: () => [0, 0.08, 0.17, 0.25].forEach((d) => tone(500 + Math.random() * 500, 1300, 0.07, 0.05, 'sine', d)),
  /** A boing off Lobo's belly. */
  bounce: () => tone(180, 520, 0.3, 0.12, 'sine', 0, 30),
  /** A pelican dives: whistle down, then a splash. */
  dive: () => {
    tone(1600, 500, 0.5, 0.05, 'sine')
    noise(0.5, 0.16, 'lowpass', 3000, 300, 0.5, 0.8)
  },
  /** Camera shutter. */
  click: () => {
    noise(0.04, 0.3, 'highpass', 2000, 3000)
    noise(0.05, 0.25, 'highpass', 1500, 2500, 0.09)
  },
}

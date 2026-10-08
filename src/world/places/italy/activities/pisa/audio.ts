// Sounds for the Leaning Tower (synthesized, like kit/sfx): the tower's stony creak, a heavy weight's thud, a camera
// shutter, things landing on the grass, and the seven bells (a real major scale: do re mi fa sol la ti).
let ctx: AudioContext | undefined
function audio() {
  if (!ctx && typeof AudioContext !== 'undefined') ctx = new AudioContext()
  if (ctx?.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, to: number, dur: number, vol: number, delay = 0, type: OscillatorType = 'sine', attack = 0.01) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + delay
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

function noise(dur: number, vol: number, freq: number, q: number, delay = 0) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + delay
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = a.createBufferSource()
  src.buffer = buf
  const f = a.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = freq
  f.Q.value = q
  const g = a.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
  src.stop(t + dur + 0.05)
}

/** Do re mi fa sol la ti (C major, one octave). */
export const SCALE = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77]

export const tower = {
  /** The old stones groaning as it leans: a low wobbly creak. */
  creak: () => {
    tone(90, 70, 0.6, 0.1, 0, 'sawtooth', 0.08)
    tone(120, 95, 0.5, 0.06, 0.2, 'sawtooth', 0.06)
  },
  /** A heavy weight set down on the ground. */
  thud: () => {
    tone(110, 45, 0.35, 0.3, 0, 'sine')
    noise(0.15, 0.2, 300, 1)
  },
  /** Something landing on the grass (`soft` for a feather). */
  land: (soft = false) => {
    if (soft) return tone(1200, 900, 0.2, 0.04, 0, 'sine')
    tone(160, 70, 0.25, 0.25, 0, 'sine')
    noise(0.12, 0.15, 500, 1)
  },
  /** Things falling through the air. */
  fall: (dur: number) => tone(900, 300, dur, 0.04, 0, 'sine', 0.1),
  /** The camera shutter: click-clack. */
  shutter: () => {
    noise(0.04, 0.3, 3000, 1)
    noise(0.05, 0.25, 2000, 1, 0.07)
  },
  /** One bell: a strong strike with bell-like overtones that ring on. */
  bell: (i: number) => {
    const f = SCALE[Math.max(0, Math.min(6, i))]
    tone(f, f, 1.8, 0.16, 0, 'sine', 0.005)
    tone(f * 2.76, f * 2.76, 0.7, 0.05, 0, 'sine', 0.005)
    tone(f * 5.4, f * 5.4, 0.3, 0.03, 0, 'sine', 0.005)
    tone(f / 2, f / 2, 1.2, 0.05, 0, 'triangle', 0.005)
  },
}

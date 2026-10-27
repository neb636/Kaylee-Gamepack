// Campfire Night's sounds, synthesized like kit/sfx but each one placed left or right (`pan` -1..1), so "who's that
// sound?" can come from one side of the forest. Placeholders until the full-loop gate records real ones. Plain Web
// Audio, no React.
import { audio } from '../../../../kit/sfx'

function out(pan: number, delay: number) {
  const a = audio()
  if (!a) return null
  const t = a.currentTime + delay
  const p = a.createStereoPanner ? a.createStereoPanner() : null
  if (p) {
    p.pan.value = Math.max(-1, Math.min(1, pan))
    p.connect(a.destination)
  }
  return { a, t, dest: (p ?? a.destination) as AudioNode }
}

function tone(freq: number, to: number, dur: number, vol: number, type: OscillatorType, pan = 0, delay = 0, vibrato = 0) {
  const o0 = out(pan, delay)
  if (!o0) return
  const { a, t, dest } = o0
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  o.frequency.exponentialRampToValueAtTime(to, t + dur)
  if (vibrato) {
    const lfo = a.createOscillator()
    const depth = a.createGain()
    lfo.frequency.value = vibrato
    depth.gain.value = freq * 0.04
    lfo.connect(depth).connect(o.frequency)
    lfo.start(t)
    lfo.stop(t + dur + 0.05)
  }
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.06, dur / 3))
  g.gain.setValueAtTime(vol, t + dur * 0.6)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(dest)
  o.start(t)
  o.stop(t + dur + 0.05)
}

let noiseBuf: AudioBuffer | undefined
function noise(dur: number, vol: number, filter: BiquadFilterType, freq: number, toFreq = freq, pan = 0, delay = 0, q = 1) {
  const o0 = out(pan, delay)
  if (!o0) return
  const { a, t, dest } = o0
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const src = a.createBufferSource()
  src.buffer = noiseBuf
  const f = a.createBiquadFilter()
  f.type = filter
  f.Q.value = q
  f.frequency.setValueAtTime(freq, t)
  f.frequency.exponentialRampToValueAtTime(toFreq, t + dur)
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(dest)
  src.start(t)
  src.stop(t + dur + 0.05)
}

export const night = {
  /** The owl: "hoo, hoo-hoo". */
  hoot: (pan = 0, vol = 0.2) => {
    tone(390, 350, 0.42, vol, 'sine', pan, 0)
    tone(410, 360, 0.26, vol * 0.9, 'sine', pan, 0.6)
    tone(400, 340, 0.5, vol, 'sine', pan, 0.9)
  },
  /** A beaver's tail slapping the water. */
  slap: (pan = 0, vol = 0.3) => {
    noise(0.08, vol, 'lowpass', 900, 300, pan)
    noise(0.5, vol * 0.6, 'highpass', 2400, 900, pan, 0.03)
  },
  /** A frog: "rrribbit". */
  croak: (pan = 0, vol = 0.18) => {
    for (let i = 0; i < 4; i++) tone(150 - i * 6, 120, 0.07, vol, 'sawtooth', pan, i * 0.06)
    tone(210, 160, 0.16, vol * 0.8, 'sawtooth', pan, 0.32)
  },
  /** A mosquito's whine (it wobbles). */
  whine: (pan = 0, vol = 0.07, dur = 1.1) => tone(640, 700, dur, vol, 'sawtooth', pan, 0, 11),
  /** Leaves rustling in a bush. */
  rustle: (pan = 0, vol = 0.12) => {
    for (let i = 0; i < 5; i++) noise(0.09, vol * (0.6 + Math.random() * 0.5), 'bandpass', 2600 + Math.random() * 1500, 1800, pan, i * 0.07 + Math.random() * 0.03, 2)
  },
  /** A bat's squeak. */
  squeak: (pan = 0) => {
    tone(3200, 2600, 0.06, 0.06, 'sine', pan)
    tone(3400, 2800, 0.05, 0.05, 'sine', pan, 0.09)
  },
  /** Somebody snoring in the tent, and the zipper. */
  snore: (pan = 0) => {
    noise(0.9, 0.12, 'lowpass', 260, 420, pan, 0, 4)
    tone(80, 95, 0.9, 0.05, 'sawtooth', pan)
  },
  zip: (pan = 0) => noise(0.45, 0.12, 'bandpass', 1800, 4200, pan, 0, 3),
  /** The moose's low groan. */
  groan: (pan = 0) => tone(120, 85, 0.9, 0.16, 'sawtooth', pan),
  /** A crackle from the fire. */
  crackle: (vol = 0.05) => noise(0.03 + Math.random() * 0.04, vol, 'highpass', 1800 + Math.random() * 2000, 1500),
  /** Sparks whoosh up when she taps the fire, and when a marshmallow catches fire. */
  whoosh: (vol = 0.14) => noise(0.6, vol, 'bandpass', 400, 1400, 0, 0, 0.8),
  /** A marshmallow sizzling over the flames (call it often while it's hot). */
  sizzle: (vol = 0.03) => noise(0.08, vol, 'highpass', 5000, 4000),
  /** Blowing a burning marshmallow out. */
  blow: () => noise(0.35, 0.18, 'lowpass', 1600, 300),
  /** Somebody munching. */
  munch: (pan = 0) => {
    for (let i = 0; i < 3; i++) noise(0.07, 0.16, 'bandpass', 1400, 900, pan, i * 0.16, 1.5)
  },
  /** A skunk's "phew" (it lifts its tail, nothing happens). */
  phew: (pan = 0) => {
    noise(0.4, 0.1, 'bandpass', 900, 500, pan, 0, 1)
    tone(500, 260, 0.4, 0.08, 'triangle', pan, 0.05)
  },
  /** A paw print lights up: a little climbing note. */
  print: (i: number, pan = 0) => tone(520 * Math.pow(2, (i % 10) / 12), 540 * Math.pow(2, (i % 10) / 12), 0.12, 0.08, 'triangle', pan),
  /** A star comes out. */
  twinkle: (pan = 0) => tone(1400 + Math.random() * 900, 1800, 0.18, 0.03, 'sine', pan),
}

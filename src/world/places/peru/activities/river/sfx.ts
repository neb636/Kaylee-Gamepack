// Swim with Rosa's sounds: her splashes and leaps, the fruit, the forest's animals, the race. Each one is a recorded
// clip from ./sfx (ElevenLabs, made from sfx/sfx.json by scripts/generate-sfx.mjs) with the synthesized sound below as
// its fallback: that is what plays until a clip is made or has loaded, and in test browsers.
import { bed, clip } from '../../../../kit/clips'
import { audio } from '../../../../kit/sfx'
import { rioClip } from './sfx/index'

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

const synth = {
  /** Something lands in the water. */
  splash: (big = false) => {
    noise(big ? 0.7 : 0.4, big ? 0.22 : 0.14, 'bandpass', 1200, 400, 0, 0.8)
    tone(big ? 300 : 500, 140, 0.2, 0.06, 'sine')
  },
  /** Rosa bursts out of the water: a quick rush of spray. */
  leap: () => {
    noise(0.35, 0.16, 'bandpass', 900, 3200, 0, 0.9)
    tone(520, 1040, 0.22, 0.05, 'sine')
  },
  /** Rosa breathes out of her blowhole: "pfff". */
  spout: () => noise(0.45, 0.14, 'bandpass', 2600, 1200, 0, 1.4),
  /** Rosa's happy dolphin clicks and whistle. */
  whistle: () => {
    tone(1400, 2600, 0.22, 0.05, 'sine', 0, 30)
    ;[0.25, 0.3, 0.35, 0.4].forEach((d) => tone(2400, 2200, 0.025, 0.04, 'square', d))
  },
  /** Her nose boops a fruit off its vine. */
  boop: () => {
    tone(700, 1100, 0.09, 0.1, 'triangle')
    noise(0.08, 0.12, 'bandpass', 2400, 1800, 0, 3)
  },
  /** A fruit plops into the water. */
  plop: () => {
    tone(480, 150, 0.18, 0.1, 'sine')
    noise(0.25, 0.1, 'bandpass', 1400, 600, 0.03, 1)
  },
  /** The fish nibble. */
  nibble: () => [0, 0.1, 0.2].forEach((d) => tone(1200, 900, 0.05, 0.06, 'square', d)),
  /** A little bubble. */
  bubble: () => tone(500 + Math.random() * 300, 1100, 0.09, 0.03, 'sine'),
  /** A vine lets down a little. */
  creak: () => tone(210, 150, 0.3, 0.06, 'sawtooth', 0, 8),
  /** Macaw squawk. */
  squawk: () => {
    tone(900, 620, 0.22, 0.08, 'sawtooth', 0, 60)
    tone(820, 560, 0.18, 0.06, 'sawtooth', 0.22, 60)
  },
  /** Toucan's wooden clack. */
  clack: () => [0, 0.11, 0.2].forEach((d) => noise(0.05, 0.2, 'bandpass', 1800, 1500, d, 4)),
  /** Monkey chatter: quick high "ee-ee-ee". */
  chatter: () => [0, 0.09, 0.18, 0.27].forEach((d) => tone(1300, 1900, 0.07, 0.06, 'triangle', d)),
  /** Capybara: a soft content squeak. */
  squeak: () => tone(700, 520, 0.18, 0.06, 'triangle', 0, 20),
  /** A long sleepy sloth yawn. */
  yawn: () => tone(320, 180, 1.4, 0.06, 'triangle', 0, 6),
  /** Frog song: two quick "rib-bit" croaks. */
  croak: () => {
    tone(260, 180, 0.11, 0.12, 'square')
    tone(320, 210, 0.13, 0.11, 'square', 0.16)
  },
  /** An otter's chirpy squeak. */
  chirp: () => {
    tone(1500, 2100, 0.08, 0.06, 'sine')
    tone(1700, 2400, 0.1, 0.06, 'sine', 0.11)
  },
  /** A hollow knock on a floating log. */
  bonk: () => {
    tone(190, 120, 0.16, 0.16, 'sine')
    noise(0.06, 0.16, 'bandpass', 700, 500, 0, 3)
  },
  /** A butterfly or a bird takes off: a tiny flutter. */
  flutter: () => [0, 0.05, 0.1, 0.15, 0.2].forEach((d) => noise(0.04, 0.06, 'highpass', 3000, 4000, d)),
  /** The fish dart away. */
  dart: () => [0, 0.05, 0.1].forEach((d) => tone(900 + Math.random() * 500, 1500, 0.06, 0.035, 'sine', d)),
}

const one = <A extends unknown[]>(id: string, fallback: (...a: A) => void, vol = 1) => clip(rioClip(id), fallback, { vol })
export const rsfx = {
  splash: one('splash', () => synth.splash(false), 0.8),
  bigSplash: one('big-splash', () => synth.splash(true)),
  leap: one('leap', synth.leap, 0.8),
  spout: one('spout', synth.spout),
  whistle: one('whistle', synth.whistle, 0.7),
  boop: one('boop', synth.boop),
  plop: one('plop', synth.plop),
  nibble: one('nibble', synth.nibble, 0.8),
  bubble: synth.bubble,
  creak: one('creak', synth.creak, 0.7),
  squawk: one('macaw', synth.squawk, 0.7),
  clack: one('toucan', synth.clack, 0.7),
  chatter: one('monkeys', synth.chatter, 0.7),
  squeak: one('capybara', synth.squeak, 0.8),
  yawn: one('sloth-yawn', synth.yawn, 0.8),
  croak: one('frog', synth.croak, 0.8),
  chirp: one('otter', synth.chirp, 0.8),
  bonk: one('bonk', synth.bonk),
  flutter: one('flutter', synth.flutter, 0.6),
  dart: synth.dart,
  /** The forest all around: birds, insects, lapping water. Returns its stop. */
  forest: () => bed(rioClip('forest-bed'), 0.22),
}

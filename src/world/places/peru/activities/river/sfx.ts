// Rosa's Rainy River sounds (synthesized, like ../fluffy/sfx.ts): the rain itself (a soft hiss that swells while she
// squeezes the cloud), a gentle thunder rumble, frogs singing, things growing, splashes, Rosa's spout and the forest's
// birds and monkeys.
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

// The rain: one looping hiss whose loudness follows how hard she's squeezing (0..1), smoothed so it never clicks.
let rainGain: GainNode | undefined
function rainNode() {
  const a = audio()
  if (!a) return undefined
  if (!rainGain) {
    const src = noiseSource(a)
    const hp = a.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 1400
    const lp = a.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 7000
    rainGain = a.createGain()
    rainGain.gain.value = 0
    src.connect(hp).connect(lp).connect(rainGain).connect(a.destination)
    src.start()
  }
  return rainGain
}

export const rsfx = {
  /** How hard it's raining now (0 = dry). Call every frame or on change; it glides. */
  rain: (level: number) => {
    const g = rainNode()
    const a = audio()
    if (!g || !a) return
    g.gain.setTargetAtTime(Math.max(0, Math.min(1, level)) * 0.09, a.currentTime, 0.12)
  },
  /** Silence the rain right now (when she leaves the activity). */
  stopRain: () => {
    const a = audio()
    if (!rainGain || !a) return
    rainGain.gain.cancelScheduledValues(a.currentTime)
    rainGain.gain.setValueAtTime(0, a.currentTime)
  },
  /** A soft, far-away thunder rumble (never scary). */
  rumble: () => {
    noise(1.6, 0.16, 'lowpass', 220, 80, 0, 0.8)
    tone(55, 40, 1.4, 0.06, 'sine', 0.05)
  },
  /** One plink of a big drop on a leaf (pitch varies a little). */
  plink: () => tone(1500 + Math.random() * 900, 900, 0.08, 0.04, 'sine'),
  /** Frog song: two quick "rib-bit" croaks. */
  croak: () => {
    tone(260, 180, 0.11, 0.12, 'square')
    tone(320, 210, 0.13, 0.11, 'square', 0.16)
  },
  /** A plant shooting up: three rising bloops. */
  grow: () => [0, 0.09, 0.18].forEach((d, i) => tone(400 + i * 180, 700 + i * 220, 0.12, 0.07, 'sine', d)),
  /** A flower or a lily pad opening: a soft rising chime. */
  bloom: () => [0, 0.08, 0.16, 0.26].forEach((d, i) => tone([660, 830, 990, 1320][i], [660, 830, 990, 1320][i] * 1.01, 0.35, 0.06, 'triangle', d)),
  /** Water filling up a little: a bubbly gloop. */
  gloop: () => {
    tone(320, 620, 0.16, 0.08, 'sine')
    tone(420, 780, 0.12, 0.05, 'sine', 0.1)
  },
  /** Something lands in the water. */
  splash: (big = false) => {
    noise(big ? 0.7 : 0.4, big ? 0.22 : 0.14, 'bandpass', 1200, 400, 0, 0.8)
    tone(big ? 300 : 500, 140, 0.2, 0.06, 'sine')
  },
  /** Rosa breathes out of her blowhole: "pfff". */
  spout: () => noise(0.45, 0.14, 'bandpass', 2600, 1200, 0, 1.4),
  /** Rosa's happy dolphin clicks and whistle. */
  whistle: () => {
    tone(1400, 2600, 0.22, 0.05, 'sine', 0, 30)
    ;[0.25, 0.3, 0.35, 0.4].forEach((d) => tone(2400, 2200, 0.025, 0.04, 'square', d))
  },
  /** Macaw squawk. */
  squawk: () => {
    tone(900, 620, 0.22, 0.08, 'sawtooth', 0, 60)
    tone(820, 560, 0.18, 0.06, 'sawtooth', 0.22, 60)
  },
  /** Toucan's wooden clack. */
  clack: () => [0, 0.11, 0.2].forEach((d) => noise(0.05, 0.2, 'bandpass', 1800, 1500, d, 4)),
  /** Monkey chatter: quick high "ee-ee-ee". */
  chatter: () => [0, 0.09, 0.18, 0.27].forEach((d) => tone(1300, 1900, 0.07, 0.06, 'triangle', d)),
  /** Capybara: a soft content squeak-purr. */
  squeak: () => tone(700, 520, 0.18, 0.06, 'triangle', 0, 20),
  /** A long sleepy sloth yawn. */
  yawn: () => tone(320, 180, 1.4, 0.06, 'triangle', 0, 6),
  /** Fruit falling from a tree, then a fish's nibble. */
  drop: () => tone(900, 300, 0.25, 0.08, 'sine'),
  nibble: () => [0, 0.1, 0.2].forEach((d) => tone(1200, 900, 0.05, 0.06, 'square', d)),
  /** Camera shutter. */
  click: () => {
    noise(0.04, 0.3, 'highpass', 2000, 3000)
    noise(0.05, 0.25, 'highpass', 1500, 2500, 0.09)
  },
}

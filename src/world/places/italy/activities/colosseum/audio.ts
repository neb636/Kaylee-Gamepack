// Sounds for the Colosseum (synthesized, like kit/sfx): a crowd cheer, the wooden elevator's rumble, a creaky hatch,
// a rope zip, and Cesare's Roman horn.
let ctx: AudioContext | undefined
function audio() {
  if (!ctx && typeof AudioContext !== 'undefined') ctx = new AudioContext()
  if (ctx?.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, to: number, dur: number, vol: number, delay = 0, type: OscillatorType = 'sine') {
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

/** Filtered noise: crowds, rumbles, rope swishes. */
function noise(dur: number, vol: number, freq: number, q: number, delay = 0, attack = 0.08) {
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
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
  src.stop(t + dur + 0.05)
}

export const arena = {
  /** A happy crowd: a swell of voices ("yaaay") with a few whoops on top. */
  cheer: (big = false) => {
    noise(big ? 2.2 : 1.4, big ? 0.22 : 0.14, 1100, 0.7, 0, 0.25)
    noise(big ? 2 : 1.2, big ? 0.12 : 0.08, 2400, 1.2, 0.05, 0.3)
    const n = big ? 6 : 3
    for (let i = 0; i < n; i++) {
      const f = 500 + Math.random() * 400
      tone(f, f * 1.6, 0.35, 0.05, 0.15 + i * 0.18 + Math.random() * 0.1, 'triangle')
    }
  },
  /** The crowd going "ahhh" when the shade arrives. */
  sigh: () => {
    noise(1.3, 0.1, 700, 1.4, 0, 0.2)
    tone(520, 330, 1.1, 0.05, 0.05, 'triangle')
  },
  /** The rope running through a pulley as the canvas unrolls. */
  zip: () => {
    noise(0.7, 0.12, 3000, 2, 0, 0.05)
    tone(300, 900, 0.6, 0.05, 0, 'sawtooth')
  },
  /** A wooden hatch creaking open (or rattling when it's the wrong one). */
  creak: () => {
    tone(140, 260, 0.35, 0.08, 0, 'sawtooth')
    tone(180, 120, 0.3, 0.06, 0.22, 'sawtooth')
  },
  rattle: () => {
    for (let i = 0; i < 4; i++) noise(0.06, 0.18, 500, 3, i * 0.08, 0.005)
  },
  /** The wooden elevator rumbling up (or down). */
  rumble: (up = true) => {
    noise(1.1, 0.16, 160, 1.5, 0, 0.15)
    tone(up ? 70 : 110, up ? 110 : 70, 1, 0.09, 0, 'triangle')
  },
  /** The lever clunks into place. */
  clunk: () => {
    tone(200, 90, 0.18, 0.18, 0, 'triangle')
    noise(0.1, 0.15, 900, 2, 0, 0.005)
  },
  /** Cesare's Roman horn: a proud (and a bit silly) brassy fanfare. */
  horn: () => {
    const notes = [392, 392, 523, 392, 523, 659, 784]
    const lens = [0.14, 0.14, 0.3, 0.14, 0.14, 0.3, 0.7]
    let t = 0
    notes.forEach((f, i) => {
      tone(f, f * 1.003, lens[i], 0.1, t, 'sawtooth')
      tone(f / 2, f / 2, lens[i], 0.06, t, 'square')
      t += lens[i] + 0.03
    })
    // The silly wobble at the end.
    tone(784, 700, 0.5, 0.06, t - 0.4, 'sawtooth')
  },
}

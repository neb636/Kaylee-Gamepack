// Tiny synthesized sound effects (no audio files needed).

let ctx: AudioContext | undefined

function audio(): AudioContext | undefined {
  if (!ctx && typeof AudioContext !== 'undefined') ctx = new AudioContext()
  if (ctx?.state === 'suspended') void ctx.resume()
  return ctx
}

/** Must be called from a tap so iOS lets us play sound. */
export function unlockSounds() {
  const a = audio()
  if (!a) return
  const b = a.createBuffer(1, 1, 22050)
  const s = a.createBufferSource()
  s.buffer = b
  s.connect(a.destination)
  s.start()
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.18, slideTo?: number) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + start
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

// Major pentatonic scale, so any sequence of notes sounds nice.
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093]

export const sounds = {
  /** Soft bubble pop for taps. */
  pop: () => tone(500 + Math.random() * 200, 0, 0.12, 'sine', 0.2, 1100),
  /** Rising note: note(0), note(1), note(2)... climbs up the scale (great for counting). */
  note: (step: number) => tone(SCALE[Math.min(Math.max(step, 0), SCALE.length - 1)], 0, 0.35, 'triangle', 0.2),
  /** Happy "correct!" chime. */
  correct: () => {
    tone(784, 0, 0.18, 'triangle', 0.2)
    tone(1175, 0.1, 0.3, 'triangle', 0.2)
  },
  /** Gentle, not-scary "try again" boing. */
  oops: () => tone(330, 0, 0.25, 'sine', 0.15, 220),
  /** Magic sparkle. */
  sparkle: () => [0, 1, 2, 3].forEach((i) => tone(SCALE[6 + i], i * 0.05, 0.25, 'sine', 0.08)),
  /** Swoosh when something flies somewhere. */
  whoosh: () => tone(300, 0, 0.3, 'sine', 0.1, 900),
  /** Big victory fanfare. */
  fanfare: () => {
    ;[0, 2, 4, 5].forEach((s, i) => tone(SCALE[s], i * 0.14, 0.3, 'triangle', 0.2))
    tone(SCALE[5], 0.56, 0.7, 'triangle', 0.22)
    tone(SCALE[7], 0.56, 0.7, 'sine', 0.12)
  },
}

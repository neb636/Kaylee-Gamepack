// Water sounds for the Trevi activity (synthesized, like kit/sfx): an underground gurgle that gets louder, a coin plink.
let ctx: AudioContext | undefined
function audio() {
  if (!ctx && typeof AudioContext !== 'undefined') ctx = new AudioContext()
  if (ctx?.state === 'suspended') void ctx.resume()
  return ctx
}

function blip(freq: number, to: number, dur: number, vol: number, delay: number, type: OscillatorType = 'sine') {
  const a = audio()
  if (!a) return
  const t = a.currentTime + delay
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

export const water = {
  /** Bubbles rising under the ground; level 0..2 gets louder and busier. */
  gurgle: (level: number) => {
    const n = 3 + level * 2
    const vol = 0.05 + level * 0.06
    for (let i = 0; i < n; i++) {
      const f0 = 260 + Math.random() * 260 + level * 60
      blip(f0, f0 * (1.8 + Math.random()), 0.07 + Math.random() * 0.05, vol, i * (0.09 - level * 0.015) + Math.random() * 0.03)
    }
  },
  /** A coin landing in water: a bright ping and a little plop. */
  plink: () => {
    blip(1760, 1500, 0.35, 0.09, 0, 'triangle')
    blip(2640, 2400, 0.25, 0.04, 0.01, 'sine')
    blip(420, 900, 0.09, 0.12, 0.05)
  },
  /** A tiny splash under her finger. */
  drip: () => {
    const f0 = 700 + Math.random() * 500
    blip(f0, f0 * 2.2, 0.08, 0.06, 0)
  },
}

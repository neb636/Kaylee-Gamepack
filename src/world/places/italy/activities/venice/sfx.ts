// Venice's own sound effects (synthesized, like ../../../../kit/sfx.ts): a duck's quack, a water bus toot, an ambulance
// siren, a church bell, a little lion roar, and the "bloop bloop" of the tide coming in.
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

export const vsfx = {
  quack: () => [0, 0.16].forEach((d) => (tone(620, 380, 0.12, 0.12, 'sawtooth', d), tone(900, 500, 0.1, 0.05, 'square', d))),
  toot: () => [0, 0.32].forEach((d) => (tone(196, 196, 0.26, 0.14, 'triangle', d), tone(247, 247, 0.26, 0.08, 'sine', d))),
  siren: () => [0, 0.3, 0.6, 0.9].forEach((d, i) => tone(i % 2 ? 660 : 880, i % 2 ? 660 : 880, 0.28, 0.07, 'triangle', d)),
  bong: () => (tone(220, 218, 1.6, 0.18), tone(440, 436, 1.2, 0.08), tone(660, 650, 0.8, 0.04)),
  roar: () => (tone(160, 110, 0.5, 0.14, 'sawtooth'), tone(240, 150, 0.45, 0.05, 'square')),
  bloop: () => [0, 0.35].forEach((d) => tone(300, 140, 0.25, 0.16, 'sine', d)),
  pop: () => tone(500, 1200, 0.1, 0.12, 'triangle'),
  firework: () => (tone(1200, 200, 0.5, 0.06, 'sine'), tone(80, 40, 0.4, 0.15, 'sine', 0.45)),
}

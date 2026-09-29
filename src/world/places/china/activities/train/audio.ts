// The train's own sounds: a wind whoosh whose loudness follows the speed, a friendly horn, and a lever click.
let ctx: AudioContext | undefined
let wind: { gain: GainNode; filter: BiquadFilterNode; src: AudioBufferSourceNode } | undefined

function audio() {
  if (!ctx && typeof AudioContext !== 'undefined') ctx = new AudioContext()
  if (ctx?.state === 'suspended') void ctx.resume()
  return ctx
}

/** Start the wind (silent until setWind is called). Call from a touch. */
export function startWind() {
  const a = audio()
  if (!a || wind) return
  const buf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = a.createBufferSource()
  src.buffer = buf
  src.loop = true
  const filter = a.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 0.6
  filter.frequency.value = 500
  const gain = a.createGain()
  gain.gain.value = 0
  src.connect(filter).connect(gain).connect(a.destination)
  src.start()
  wind = { gain, filter, src }
}

/** speed 0..1 */
export function setWind(speed: number) {
  if (!wind || !ctx) return
  const t = ctx.currentTime
  wind.gain.gain.setTargetAtTime(speed * speed * 0.16, t, 0.08)
  wind.filter.frequency.setTargetAtTime(350 + speed * 1300, t, 0.08)
}

export function stopWind() {
  try {
    wind?.src.stop()
  } catch {
    /* already stopped */
  }
  wind = undefined
}

/** "Toot toot!": two short two-note horn blasts. */
export function toot() {
  const a = audio()
  if (!a) return
  ;[0, 0.32].forEach((delay) => {
    const t = a.currentTime + delay
    const g = a.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.03)
    g.gain.setValueAtTime(0.16, t + 0.16)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24)
    g.connect(a.destination)
    ;[392, 494].forEach((f) => {
      const o = a.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = f
      const lp = a.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 1400
      o.connect(lp).connect(g)
      o.start(t)
      o.stop(t + 0.3)
    })
  })
}

/** A little mechanical click at each notch of the lever. */
export function click(step: number) {
  const a = audio()
  if (!a) return
  const t = a.currentTime
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = 'square'
  o.frequency.setValueAtTime(700 + step * 180, t)
  o.frequency.exponentialRampToValueAtTime(300 + step * 60, t + 0.05)
  g.gain.setValueAtTime(0.09, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + 0.09)
}

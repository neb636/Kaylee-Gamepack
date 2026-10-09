// A soft, endless water swish under the boat: filtered noise whose loudness and brightness follow the boat's speed.
// Started on her first touch (iPad Safari only plays sound after a tap), stopped when the activity closes.

let ctx: AudioContext | undefined
let gain: GainNode | undefined
let filter: BiquadFilterNode | undefined
let source: AudioBufferSourceNode | undefined

export function startSwish() {
  if (typeof AudioContext === 'undefined') return
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  if (source) return
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  // Brown-ish noise (smoothed), which sounds like water rather than hiss.
  let last = 0
  for (let i = 0; i < data.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
    data[i] = last * 3.5
  }
  source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 0.7
  filter.frequency.value = 500
  gain = ctx.createGain()
  gain.gain.value = 0
  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start()
}

/** speed01: 0 (still) to 1 (top speed). Call every frame; it smooths itself. */
export function setSwish(speed01: number) {
  if (!ctx || !gain || !filter) return
  const t = ctx.currentTime
  gain.gain.setTargetAtTime(0.02 + speed01 * 0.22, t, 0.12)
  filter.frequency.setTargetAtTime(380 + speed01 * 1300, t, 0.15)
}

export function stopSwish() {
  source?.stop()
  source?.disconnect()
  source = undefined
}

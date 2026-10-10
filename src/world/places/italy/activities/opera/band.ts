// Lupa's band, synthesized with Web Audio: a little 6/8 tarantella (an Italian dance) where every stroke of Kaylee's
// wand plays ONE beat (three eighth notes) spread over the beat length her strokes predict. So the tempo is her hand:
// swing fast and it races, swing slowly and it slows, stop and the band stops with her. Every instrument has its own
// gain, so a solo can lift one friend and hush the rest, and the whole band follows piano (soft) and forte (loud).
// Notes scheduled for later are cancelled when the next stroke comes early, so speeding up never smears.
// Started on her first touch (iPad Safari only plays sound after a tap), stopped when the finale closes.

export type Part = 'mandolin' | 'tambourine' | 'horn' | 'accordion' | 'piano' | 'lupa'
export const PARTS: Part[] = ['mandolin', 'tambourine', 'horn', 'accordion', 'piano', 'lupa']

// ---- The tune: 8 bars of 6/8 in C major, two beats per bar, three eighth notes per beat. ----
// MIDI notes; HOLD sustains the note before it, null is a rest.
const HOLD = -1
type Slot = number | null
const MELODY: Slot[] = [
  76, 79, 76, 72, 76, 79, // C   E G E C E G
  81, 79, 77, 81, HOLD, HOLD, // F   A G F A - -
  79, 77, 76, 74, 76, 77, // G   G F E D E F
  76, HOLD, HOLD, 72, HOLD, HOLD, // C   E - - C - -
  76, 79, 76, 72, 76, 79, // C
  81, 84, 81, 77, 81, 84, // F   up to high C
  83, 81, 79, 74, 76, 77, // G
  76, HOLD, 74, 72, HOLD, null, // C   home
]
/** Per bar: bass root, fifth, and the accordion chord. */
const BARS = [
  { root: 48, fifth: 55, chord: [60, 64, 67] },
  { root: 41, fifth: 48, chord: [60, 65, 69] },
  { root: 43, fifth: 50, chord: [59, 62, 67] },
  { root: 48, fifth: 55, chord: [60, 64, 67] },
  { root: 48, fifth: 55, chord: [60, 64, 67] },
  { root: 41, fifth: 48, chord: [60, 65, 69] },
  { root: 43, fifth: 50, chord: [59, 62, 67] },
  { root: 48, fifth: 55, chord: [60, 64, 67] },
]
export const BEATS_PER_LOOP = MELODY.length / 3
/** C major, for Lupa's high note (it climbs the scale as the wand goes up). */
const SCALE_UP = [72, 74, 76, 77, 79, 81, 83, 84, 86, 88]

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

// ---- Engine state (one band at a time) ----
let ctx: AudioContext | undefined
let master: GainNode | undefined
let buses: Record<Part, GainNode> | undefined
let noise: AudioBuffer | undefined
let pending: { node: AudioScheduledSourceNode; at: number }[] = []
let beatIndex = 0
let solo: Part | null = null
let lupaSinging = false
let lupaShy = 1
let high: { osc: OscillatorNode; vib: OscillatorNode; gain: GainNode } | undefined

/** Call from a pointerdown: creates or resumes the audio. */
export function startBand() {
  if (typeof AudioContext === 'undefined') return
  if (!ctx) {
    ctx = new AudioContext()
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -14
    comp.ratio.value = 4
    master = ctx.createGain()
    master.gain.value = 0.6
    master.connect(comp).connect(ctx.destination)
    buses = Object.fromEntries(
      PARTS.map((p) => {
        const g = ctx!.createGain()
        g.connect(master!)
        return [p, g]
      }),
    ) as Record<Part, GainNode>
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
    const d = noise.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    mixParts()
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

export function stopBand() {
  cancelPending(0)
  endHighNote()
  if (ctx) void ctx.close()
  ctx = master = buses = noise = undefined
  beatIndex = 0
  solo = null
  lupaSinging = false
}

/** Which beat of the tune comes next (for the band's bounce timing in the scene). */
export const nextBeat = () => beatIndex

export function setSolo(part: Part | null) {
  solo = part
  mixParts()
}

/** Lupa takes the melody (shy 1 = barely a whisper, 0 = full voice; the scene lowers it as the swings grow). */
export function setLupa(singing: boolean, shy = 1) {
  lupaSinging = singing
  lupaShy = shy
  mixParts()
}

function mixParts() {
  if (!ctx || !buses) return
  const t = ctx.currentTime
  for (const p of PARTS) {
    let v = solo ? (p === solo ? 1.25 : 0.3) : 1
    if (p === 'lupa') v = lupaSinging ? 1.5 - lupaShy * 1.1 : 0
    if (p === 'mandolin' && lupaSinging) v *= 0.45
    buses[p].gain.setTargetAtTime(v, t, 0.08)
  }
}

function cancelPending(after: number) {
  pending = pending.filter(({ node, at }) => {
    if (at > after) {
      try {
        node.stop()
      } catch {
        // already stopped
      }
      return false
    }
    return true
  })
}

function track(node: AudioScheduledSourceNode, at: number, until: number) {
  node.start(at)
  node.stop(until)
  pending.push({ node, at })
  node.onended = () => {
    pending = pending.filter((p) => p.node !== node)
    node.disconnect()
  }
}

/**
 * Play the next beat of the tune now. `amp` 0 (tiny swing, piano) .. 1 (huge swing, forte); `length` is the predicted
 * time until her next stroke, in seconds. Returns the beat index that played (0..BEATS_PER_LOOP-1).
 */
export function playBeat(amp: number, length: number): number {
  const played = beatIndex
  beatIndex = (beatIndex + 1) % BEATS_PER_LOOP
  if (!ctx || !buses || !master) return played
  const now = ctx.currentTime + 0.012
  cancelPending(now)
  master.gain.setTargetAtTime(0.18 + amp * 0.62, now, 0.03)
  const slot = length / 3
  const bar = BARS[Math.floor(played / 2)]
  const first = played % 2 === 0

  for (let k = 0; k < 3; k++) {
    const i = played * 3 + k
    const note = MELODY[i]
    const at = now + k * slot
    if (note !== null && note !== HOLD) {
      // How many slots does this note last (HOLDs after it)?
      let n = 1
      while (MELODY[(i + n) % MELODY.length] === HOLD && k + n < 3) n++
      mandolin(note, at, n * slot)
      if (lupaSinging) voice(note, at, n * slot)
    }
    // Tambourine on every eighth, accented on the beat.
    tambourine(at, k === 0 ? 1 : 0.45)
  }
  // Piano: bass on the beat. Accordion: the chord on the off-eighths ("oom-pa-pa").
  piano(first ? bar.root : bar.fifth, now, length * 0.9)
  accordion(bar.chord, now + slot, slot * 0.85)
  accordion(bar.chord, now + 2 * slot, slot * 0.85)
  // Horn: a bright call on the first beat of every other bar, and the last bar's ending.
  if (first && (played / 2) % 2 === 0) horn([bar.chord[0], bar.chord[2]], now, length * 0.95)
  if (played === BEATS_PER_LOOP - 1) horn([67, 72], now, length * 0.9)
  return played
}

/** One note when she taps a friend (works even before the music starts). */
export function pluck(part: Part) {
  startBand()
  if (!ctx) return
  const at = ctx.currentTime + 0.01
  const bar = BARS[Math.floor(beatIndex / 2) % BARS.length]
  if (part === 'mandolin') mandolin(bar.chord[2] + 12, at, 0.35)
  if (part === 'tambourine') [0, 0.09, 0.18].forEach((d, i) => tambourine(at + d, i === 0 ? 1 : 0.6))
  if (part === 'horn') horn([bar.chord[0], bar.chord[2]], at, 0.45)
  if (part === 'accordion') accordion(bar.chord, at, 0.45)
  if (part === 'piano') [0, 0.1, 0.2].forEach((d, i) => piano(bar.chord[i] + 12, at + d, 0.5))
  if (part === 'lupa') voice(79, at, 0.6, true)
}

// ---- Lupa's big note: a held voice whose pitch follows the wand's height ----
export function startHighNote() {
  startBand()
  if (!ctx || !buses || high) return
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.value = hz(72)
  const vib = ctx.createOscillator()
  vib.frequency.value = 5.5
  const vibGain = ctx.createGain()
  vibGain.gain.value = 6
  vib.connect(vibGain).connect(osc.frequency)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(0.32, t + 0.3)
  osc.connect(formants(gain)).connect(buses.lupa)
  osc.start()
  vib.start()
  high = { osc, vib, gain }
  buses.lupa.gain.setTargetAtTime(1.2, t, 0.1)
}

/** height01: 0 = the wand low, 1 = the wand at the top of the sky. */
export function setHighNote(height01: number) {
  if (!ctx || !high) return
  const step = Math.round(Math.max(0, Math.min(1, height01)) * (SCALE_UP.length - 1))
  high.osc.frequency.setTargetAtTime(hz(SCALE_UP[step]), ctx.currentTime, 0.06)
}

export function endHighNote() {
  if (!ctx || !high) return
  const t = ctx.currentTime
  high.gain.gain.setTargetAtTime(0, t, 0.25)
  high.osc.stop(t + 1.2)
  high.vib.stop(t + 1.2)
  high = undefined
}

// ---- Instruments ----
function env(at: number, peak: number, attack: number, decay: number) {
  const g = ctx!.createGain()
  g.gain.setValueAtTime(0, at)
  g.gain.linearRampToValueAtTime(peak, at + attack)
  g.gain.exponentialRampToValueAtTime(0.0008, at + attack + decay)
  return g
}

/** Mandolin: a bright pluck; long notes get the mandolin's quick tremolo (the same note picked again and again). */
function mandolin(note: number, at: number, dur: number) {
  const picks = dur > 0.3 ? Math.max(2, Math.floor(dur / 0.075)) : 1
  const step = dur / picks
  for (let p = 0; p < picks; p++) {
    const t = at + p * step
    const g = env(t, p === 0 ? 0.2 : 0.12, 0.004, Math.max(0.12, step * 1.6))
    const lp = ctx!.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 3200
    g.connect(lp).connect(buses!.mandolin)
    for (const detune of [-7, 7]) {
      const o = ctx!.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = hz(note)
      o.detune.value = detune
      o.connect(g)
      track(o, t, t + Math.max(0.14, step * 1.7))
    }
  }
}

function tambourine(at: number, level: number) {
  const src = ctx!.createBufferSource()
  src.buffer = noise!
  const hp = ctx!.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 6500
  const g = env(at, 0.16 * level, 0.002, 0.06 + 0.07 * level)
  src.connect(hp).connect(g).connect(buses!.tambourine)
  track(src, at, at + 0.2)
}

function piano(note: number, at: number, dur: number) {
  const g = env(at, 0.32, 0.005, Math.max(0.35, dur))
  g.connect(buses!.piano)
  const o = ctx!.createOscillator()
  o.type = 'triangle'
  o.frequency.value = hz(note)
  o.connect(g)
  track(o, at, at + Math.max(0.4, dur) + 0.05)
  const o2 = ctx!.createOscillator()
  o2.type = 'sine'
  o2.frequency.value = hz(note + 12)
  const g2 = ctx!.createGain()
  g2.gain.value = 0.4
  o2.connect(g2).connect(g)
  track(o2, at, at + Math.max(0.4, dur) + 0.05)
}

/** Accordion: reedy detuned saws, held briefly. */
function accordion(chord: number[], at: number, dur: number) {
  const g = ctx!.createGain()
  g.gain.setValueAtTime(0, at)
  g.gain.linearRampToValueAtTime(0.05, at + 0.015)
  g.gain.setValueAtTime(0.05, at + dur * 0.8)
  g.gain.linearRampToValueAtTime(0, at + dur)
  const lp = ctx!.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1900
  g.connect(lp).connect(buses!.accordion)
  for (const note of chord)
    for (const detune of [-9, 9]) {
      const o = ctx!.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = hz(note)
      o.detune.value = detune
      o.connect(g)
      track(o, at, at + dur + 0.02)
    }
}

/** Horn: warm, a soft swell. */
function horn(notes: number[], at: number, dur: number) {
  const g = ctx!.createGain()
  g.gain.setValueAtTime(0, at)
  g.gain.linearRampToValueAtTime(0.09, at + 0.05)
  g.gain.setValueAtTime(0.09, at + dur * 0.7)
  g.gain.linearRampToValueAtTime(0, at + dur)
  const lp = ctx!.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(700, at)
  lp.frequency.linearRampToValueAtTime(1500, at + 0.08)
  g.connect(lp).connect(buses!.horn)
  for (const note of notes) {
    const o = ctx!.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = hz(note - 12)
    o.connect(g)
    track(o, at, at + dur + 0.02)
  }
}

/** Two vowel formants ("ah") so a saw sounds like a singing voice. Returns the input node; output goes to `out`. */
function formants(out: AudioNode) {
  const input = ctx!.createGain()
  for (const [f, q, lvl] of [
    [800, 6, 1],
    [1150, 8, 0.6],
    [2900, 10, 0.25],
  ]) {
    const bp = ctx!.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = f
    bp.Q.value = q
    const g = ctx!.createGain()
    g.gain.value = lvl * 2.2
    input.connect(bp).connect(g).connect(out)
  }
  return input
}

/** Lupa singing one melody note: a sung "ah" with a little vibrato that grows as the note goes on. */
function voice(note: number, at: number, dur: number, solo = false) {
  const g = ctx!.createGain()
  const len = Math.max(0.18, dur * 0.95)
  g.gain.setValueAtTime(0, at)
  g.gain.linearRampToValueAtTime(solo ? 0.3 : 0.22, at + 0.04)
  g.gain.setValueAtTime(solo ? 0.3 : 0.22, at + len * 0.75)
  g.gain.linearRampToValueAtTime(0, at + len)
  g.connect(buses!.lupa)
  const o = ctx!.createOscillator()
  o.type = 'sawtooth'
  o.frequency.value = hz(note)
  const vib = ctx!.createOscillator()
  vib.frequency.value = 5.5
  const vg = ctx!.createGain()
  vg.gain.setValueAtTime(0, at)
  vg.gain.linearRampToValueAtTime(5, at + len)
  vib.connect(vg).connect(o.frequency)
  o.connect(formants(g))
  track(o, at, at + len + 0.02)
  track(vib, at, at + len + 0.02)
}

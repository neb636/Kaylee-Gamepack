// Recorded sound effects (mp3s made by scripts/generate-sfx.mjs from a folder's sfx.json), on the same AudioContext as
// the synthesized kit sounds. Each sound has a synth fallback: it plays while the clip is still downloading, in test
// browsers (they skip audio, like speech), and if a download fails, so swapping a synth sound for a clip never goes
// silent.
//
//   const moo = clip(url, () => synthMoo(), { vol: 0.8 })     one-shot: moo(), or moo({ rate: 1.2 })
//   const engine = held(url, () => synthBeat())                a loop that runs while it's called (an engine, a hose)
//   const stop = bed(url, 0.3)                                 an ambient loop until stop() (a stage's birds and wind)
import { audio } from './sfx'

/** Every clip's level against the synth sounds (they peak around 0.1; the clips are normalized to full scale). */
const MASTER = 0.32
const skip = typeof navigator !== 'undefined' && navigator.webdriver

const buffers = new Map<string, AudioBuffer>()
const loading = new Set<string>()

function load(url: string) {
  const a = audio()
  if (skip || !url || !a || buffers.has(url) || loading.has(url)) return
  loading.add(url)
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`${r.status}`)
      return r.arrayBuffer()
    })
    .then((bytes) => a.decodeAudioData(bytes))
    .then((b) => buffers.set(url, b))
    .catch(() => {})
    .finally(() => loading.delete(url))
}

let master: GainNode | undefined
function out(a: AudioContext) {
  if (!master) {
    master = a.createGain()
    master.gain.value = MASTER
    master.connect(a.destination)
    // A hidden tab (another app on the Mac, the iPad's home screen) goes quiet, so a bed never plays on behind her.
    const m = master
    document.addEventListener('visibilitychange', () => m.gain.setTargetAtTime(document.hidden ? 0 : MASTER, a.currentTime, 0.1))
  }
  return master
}

export interface ClipPlay {
  /** Playback speed; also the pitch (1.12 is two semitones up). */
  rate?: number
  /** Times the clip's own level. */
  vol?: number
  /** Seconds from now. */
  delay?: number
}

/** Play a loaded clip once. False if it isn't loaded (yet), so the caller plays its fallback. */
export function playClip(url: string, { rate = 1, vol = 1, delay = 0 }: ClipPlay = {}): boolean {
  const a = audio()
  const b = buffers.get(url)
  if (!a || !b) {
    load(url)
    return false
  }
  const t = a.currentTime + delay
  const src = a.createBufferSource()
  src.buffer = b
  src.playbackRate.value = rate
  const g = a.createGain()
  g.gain.value = vol
  src.connect(g).connect(out(a))
  src.start(t)
  return true
}

/** A one-shot sound: the clip with a little random pitch so repeats don't sound copied, or `fallback` until it loads. */
export function clip<A extends unknown[]>(url: string, fallback: (...args: A) => void, { vol = 1, jitter = 0.04 } = {}) {
  load(url)
  return (...args: A) => {
    const rate = 1 + (Math.random() * 2 - 1) * jitter
    if (!playClip(url, { vol, rate })) fallback(...args)
  }
}

/** Seconds trimmed off each end of a loop: mp3 pads the start and end with a few ms of silence, which would click. */
const PAD = 0.06

interface Loop {
  src: AudioBufferSourceNode
  gain: GainNode
}

function startLoop(a: AudioContext, b: AudioBuffer, vol: number, fadeIn: number): Loop {
  const src = a.createBufferSource()
  src.buffer = b
  src.loop = true
  src.loopStart = Math.min(PAD, b.duration / 4)
  src.loopEnd = Math.max(src.loopStart + 0.05, b.duration - PAD)
  const gain = a.createGain()
  gain.gain.setValueAtTime(0.0001, a.currentTime)
  gain.gain.linearRampToValueAtTime(vol, a.currentTime + fadeIn)
  src.connect(gain).connect(out(a))
  src.start(a.currentTime, src.loopStart + Math.random() * (src.loopEnd - src.loopStart))
  return { src, gain }
}

function stopLoop(a: AudioContext, l: Loop, fade: number) {
  const t = a.currentTime
  l.gain.gain.cancelScheduledValues(t)
  l.gain.gain.setValueAtTime(l.gain.gain.value, t)
  l.gain.gain.linearRampToValueAtTime(0.0001, t + fade)
  l.src.stop(t + fade + 0.05)
}

/**
 * A loop that plays while it keeps being called (the game calls it every beat or frame: an engine, a hose, a pour) and
 * fades out when the calls stop. Each call can set its speed (`rate`, the engine's pitch) and level. Until the clip
 * loads, each call plays `fallback` instead (the old synth beat).
 */
export function held<A extends unknown[]>(
  url: string,
  fallback: (...args: A) => void,
  shape: (...args: A) => { rate?: number; vol?: number } = () => ({}),
  { linger = 0.3, fade = 0.25 } = {},
) {
  load(url)
  let loop: Loop | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: A) => {
    const a = audio()
    const b = buffers.get(url)
    if (!a || !b) {
      load(url)
      return fallback(...args)
    }
    const { rate = 1, vol = 1 } = shape(...args)
    if (!loop) loop = startLoop(a, b, vol, 0.08)
    const t = a.currentTime
    loop.src.playbackRate.setTargetAtTime(rate, t, 0.08)
    loop.gain.gain.cancelScheduledValues(t)
    loop.gain.gain.setTargetAtTime(vol, t, 0.06)
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (loop) stopLoop(a, loop, fade)
      loop = undefined
    }, linger * 1000)
  }
}

/**
 * An ambient bed (birds, wind, the far-off farm): loops quietly until the returned stop() (call it when the stage
 * unmounts). Starts when the clip loads, so a slow download just means it fades in a little later.
 */
export function bed(url: string, vol = 0.35, { fadeIn = 2, fadeOut = 0.8 } = {}): () => void {
  const a = audio()
  if (skip || !a) return () => {}
  let loop: Loop | undefined
  let stopped = false
  let tries = 0
  const go = () => {
    if (stopped) return
    const b = buffers.get(url)
    if (b) loop = startLoop(a, b, vol, fadeIn)
    else if (tries++ < 60) {
      load(url)
      setTimeout(go, 250)
    }
  }
  go()
  return () => {
    stopped = true
    if (loop) stopLoop(a, loop, fadeOut)
    loop = undefined
  }
}

/**
 * A piece that plays once from the start (a film's music): fades in, plays to its end, or fades out at stop(). If
 * the clip is still downloading it starts when it arrives, that far into the piece, so it stays with the pictures.
 * (Test browsers and a failed download: silence. There's no synth fallback for music.)
 */
export function cue(url: string, vol = 0.5, { fadeIn = 0.5, fadeOut = 1.4 } = {}): () => void {
  const a = audio()
  if (skip || !a || !url) return () => {}
  const asked = a.currentTime
  let src: AudioBufferSourceNode | undefined
  let gain: GainNode | undefined
  let stopped = false
  let tries = 0
  const go = () => {
    if (stopped) return
    const b = buffers.get(url)
    if (!b) {
      if (tries++ < 40) {
        load(url)
        setTimeout(go, 150)
      }
      return
    }
    const at = Math.max(0, a.currentTime - asked)
    if (at >= b.duration - 0.2) return
    src = a.createBufferSource()
    src.buffer = b
    gain = a.createGain()
    gain.gain.setValueAtTime(0.0001, a.currentTime)
    gain.gain.linearRampToValueAtTime(vol, a.currentTime + (at > 0.1 ? 0.3 : fadeIn))
    src.connect(gain).connect(out(a))
    src.start(a.currentTime, at)
  }
  go()
  return () => {
    stopped = true
    if (!src || !gain) return
    const t = a.currentTime
    gain.gain.cancelScheduledValues(t)
    gain.gain.setValueAtTime(gain.gain.value, t)
    gain.gain.linearRampToValueAtTime(0.0001, t + fadeOut)
    src.stop(t + fadeOut + 0.05)
    src = undefined
  }
}

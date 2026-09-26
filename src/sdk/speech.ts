// Pre-rendered character voices. Every line is generated ahead of time (scripts/generate-voice.mjs, OpenAI TTS).
// The iPad only downloads and plays audio; it never calls a speech service.

/**
 * Something to say: a plain string (Sparkle says it), or `{ text, voice }` for another speaker from a cast.json,
 * e.g. `{ text: "G'day!", voice: 'pip' }`. Every line must be listed in its folder's voice-lines.json.
 */
export type Line = string | { text: string; voice: string }
export const DEFAULT_VOICE = 'sparkle'
export const lineText = (line: Line) => (typeof line === 'string' ? line : line.text)
export const lineVoice = (line: Line) => (typeof line === 'string' ? DEFAULT_VOICE : line.voice)

type MapEntry = string | { text: string; voice: string; ms?: number; file?: string }
const manifests = {
  ...import.meta.glob('../shell/voice-map.json', { eager: true, import: 'default' }),
  ...import.meta.glob('../games/*/voice-map.json', { eager: true, import: 'default' }),
  ...import.meta.glob('../world/voice-map.json', { eager: true, import: 'default' }),
  ...import.meta.glob('../world/places/*/voice-map.json', { eager: true, import: 'default' }),
} as Record<string, MapEntry[]>
const files = {
  ...import.meta.glob('../shell/voice/*.mp3', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../games/*/voice/*.mp3', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../world/voice/*.mp3', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../world/places/*/voice/*.mp3', { eager: true, query: '?url', import: 'default' }),
} as Record<string, string>

const keyOf = (voice: string, text: string) => `${voice}|${text}`
const clips = new Map<string, { url: string; ms: number }>()
for (const [manifest, lines] of Object.entries(manifests)) {
  const folder = manifest.slice(0, -'/voice-map.json'.length)
  lines.forEach((entry, index) => {
    const { text, voice = DEFAULT_VOICE, ms = 0, file: name = `${String(index).padStart(3, '0')}.mp3` } = typeof entry === 'string' ? { text: entry } : entry
    const file = `${folder}/voice/${name}`
    if (files[file]) clips.set(keyOf(voice, text), { url: files[file], ms })
  })
}

let context: AudioContext | undefined
let current: { stop: () => void; voice: string; analyser?: AnalyserNode } | undefined
let generation = 0
let tail: Promise<void> = Promise.resolve()
const decoded = new Map<string, Promise<AudioBuffer>>()

function audio(): AudioContext | undefined {
  if (!context && typeof AudioContext !== 'undefined') context = new AudioContext()
  return context
}

async function bufferFor(url: string, ctx: AudioContext): Promise<AudioBuffer> {
  let pending = decoded.get(url)
  if (!pending) {
    pending = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Audio download failed: ${response.status}`)
        return response.arrayBuffer()
      })
      .then((bytes) => ctx.decodeAudioData(bytes))
    decoded.set(url, pending)
    pending.catch(() => decoded.delete(url))
  }
  return pending
}

export interface SayOptions {
  /** Stop whatever is being said first (default true). Pass false to queue after it. */
  interrupt?: boolean
  /** Kept for compatibility with games using the previous speech API. */
  rate?: number
  pitch?: number
}

/** Tests and QA read this to measure how much talking happens (automated browsers skip the audio). */
declare global {
  interface Window {
    __kayleeSpeech?: { text: string; voice: string; ms: number; at: number }[]
  }
}

/** Speak a line in its character's recorded voice. Resolves when playback ends. */
export function say(line: Line, { interrupt = true }: SayOptions = {}): Promise<void> {
  const text = lineText(line)
  const voice = lineVoice(line)
  if (!text) return Promise.resolve()
  if (navigator.webdriver) {
    const clip = clips.get(keyOf(voice, text))
    if (!clip) console.error(`Missing voice clip: [${voice}] ${JSON.stringify(text)}`)
    ;(window.__kayleeSpeech ??= []).push({ text, voice, ms: clip?.ms ?? 0, at: performance.now() })
    return new Promise((resolve) => setTimeout(resolve, 30))
  }

  if (interrupt) {
    generation++
    current?.stop()
    current = undefined
  }
  const mine = generation
  const run = async () => {
    const url = clips.get(keyOf(voice, text))?.url
    if (!url) {
      console.error(`Missing voice clip: [${voice}] ${JSON.stringify(text)}`)
      return
    }
    const ctx = audio()
    if (!ctx) return
    try {
      if (ctx.state === 'suspended') await ctx.resume()
      const buffer = await bufferFor(url, ctx)
      if (mine !== generation) return
      await new Promise<void>((resolve) => {
        const source = ctx.createBufferSource()
        source.buffer = buffer
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 512
        source.connect(analyser).connect(ctx.destination)
        let finished = false
        const finish = () => {
          if (finished) return
          finished = true
          if (current?.stop === stop) current = undefined
          resolve()
        }
        const stop = () => { source.stop(); finish() }
        current = { stop, voice, analyser }
        source.onended = finish
        source.start()
      })
    } catch (error) {
      console.error('Voice playback failed:', error)
    }
  }

  const result = interrupt ? run() : tail.then(run)
  tail = result.catch(() => {})
  return result
}

export function stopSpeaking() {
  generation++
  current?.stop()
  current = undefined
}

/** Call from the first tap to allow later audio on iPad. */
export function unlockSpeech() {
  const ctx = audio()
  if (ctx?.state === 'suspended') void ctx.resume()
}

/** Who is talking right now (a cast speaker id), if anyone. */
export function speakingVoice(): string | undefined {
  return current?.analyser ? current.voice : undefined
}

let samples: Float32Array<ArrayBuffer> | undefined
/** How loud `voice` is right now, 0 (silent or someone else is talking) to 1. Puppets use it to move their mouths. */
export function speechLevel(voice: string): number {
  const analyser = current?.voice === voice ? current.analyser : undefined
  if (!analyser) return 0
  if (!samples || samples.length !== analyser.fftSize) samples = new Float32Array(analyser.fftSize)
  analyser.getFloatTimeDomainData(samples)
  let sum = 0
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i]
  return Math.min(1, Math.sqrt(sum / samples.length) * 5)
}

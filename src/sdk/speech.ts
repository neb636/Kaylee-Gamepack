// Pre-rendered Sparkle voice. Every line is generated during the game-building workflow.
// The iPad only downloads and plays audio; it never calls a speech service.

const manifests = {
  ...import.meta.glob('../shell/voice-map.json', { eager: true, import: 'default' }),
  ...import.meta.glob('../games/*/voice-map.json', { eager: true, import: 'default' }),
} as Record<string, string[]>
const files = {
  ...import.meta.glob('../shell/voice/*.mp3', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../games/*/voice/*.mp3', { eager: true, query: '?url', import: 'default' }),
} as Record<string, string>

const clips = new Map<string, string>()
for (const [manifest, lines] of Object.entries(manifests)) {
  const folder = manifest.slice(0, -'/voice-map.json'.length)
  lines.forEach((line, index) => {
    const file = `${folder}/voice/${String(index).padStart(3, '0')}.mp3`
    if (files[file]) clips.set(line, files[file])
  })
}

let context: AudioContext | undefined
let current: { stop: () => void } | undefined
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

/** Speak a line with Sparkle's recorded neural voice. Resolves when playback ends. */
export function say(text: string, { interrupt = true }: SayOptions = {}): Promise<void> {
  if (!text) return Promise.resolve()
  if (navigator.webdriver) return new Promise((resolve) => setTimeout(resolve, 30))

  if (interrupt) {
    generation++
    current?.stop()
    current = undefined
  }
  const mine = generation
  const run = async () => {
    const url = clips.get(text)
    if (!url) {
      console.error(`Missing Sparkle voice clip: ${JSON.stringify(text)}`)
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
        source.connect(ctx.destination)
        let finished = false
        const finish = () => {
          if (finished) return
          finished = true
          if (current?.stop === stop) current = undefined
          resolve()
        }
        const stop = () => { source.stop(); finish() }
        current = { stop }
        source.onended = finish
        source.start()
      })
    } catch (error) {
      console.error('Sparkle voice playback failed:', error)
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

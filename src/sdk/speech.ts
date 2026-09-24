// Friendly text-to-speech using the browser's built-in voices.
// Kaylee is 5, so every instruction in every game is spoken out loud.

const synth: SpeechSynthesis | undefined = typeof window !== 'undefined' ? window.speechSynthesis : undefined

// Nicest-sounding voices first (iPad has Samantha / Ava / Nicky; Chrome has Google voices).
const PREFERRED = ['Ava (Premium)', 'Ava (Enhanced)', 'Samantha (Enhanced)', 'Nicky (Enhanced)', 'Samantha', 'Ava', 'Nicky', 'Google US English', 'Karen', 'Moira']

let voice: SpeechSynthesisVoice | undefined

function pickVoice() {
  const voices = synth?.getVoices() ?? []
  voice =
    PREFERRED.map((name) => voices.find((v) => v.name === name || v.name.startsWith(name))).find(Boolean) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en'))
}
if (synth) {
  pickVoice()
  synth.addEventListener?.('voiceschanged', pickVoice)
}

let generation = 0

export interface SayOptions {
  /** Stop whatever is being said first (default true). Pass false to queue after it. */
  interrupt?: boolean
  rate?: number
  pitch?: number
}

/**
 * Speak text out loud. The promise resolves when speaking finishes
 * (or right away if speech isn't available), so games can `await say(...)`.
 */
export function say(text: string, { interrupt = true, rate = 0.95, pitch = 1.15 }: SayOptions = {}): Promise<void> {
  if (!synth || !text) return Promise.resolve()
  // Automated tests (Playwright) have no real voices; don't make them wait.
  if (navigator.webdriver) return new Promise((r) => setTimeout(r, 30))
  if (interrupt) {
    generation++
    synth.cancel()
  }
  const myGeneration = generation
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? 'en-US'
    u.rate = rate
    u.pitch = pitch
    let done = false
    const finish = () => {
      if (done) return
      done = true
      clearTimeout(timer)
      resolve()
    }
    u.onend = finish
    u.onerror = finish
    // Safari sometimes never fires onend, so never wait forever.
    const timer = setTimeout(finish, 1000 + text.length * 75)
    // If something newer interrupted us, resolve so awaiting code can move on.
    const check = setInterval(() => {
      if (generation !== myGeneration) {
        clearInterval(check)
        finish()
      }
      if (done) clearInterval(check)
    }, 200)
    synth.speak(u)
  })
}

export function stopSpeaking() {
  generation++
  synth?.cancel()
}

/** Must be called from a tap: iOS only allows speech after a user gesture. */
export function unlockSpeech() {
  if (!synth) return
  const u = new SpeechSynthesisUtterance(' ')
  u.volume = 0
  synth.speak(u)
}

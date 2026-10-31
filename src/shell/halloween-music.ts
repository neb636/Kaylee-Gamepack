import { speakingVoice } from '../sdk/speech'

// Original eight-bar music-box waltz: A minor with a playful raised seventh,
// soft plucked bass and twinkly bells. Synthesized locally, so it works offline.
const MELODY: (number | null)[] = [
  81, null, 84, 83, null, 76, 81, null, 84, 88, null, 84,
  83, null, 86, 84, null, 80, 83, null, 80, 76, null, null,
  81, null, 84, 88, null, 89, 88, null, 84, 83, null, 81,
  80, null, 83, 86, null, 83, 81, null, null, null, null, null,
]
const CHORDS = [[57, 60, 64], [57, 60, 64], [55, 59, 62], [52, 56, 59], [53, 57, 60], [53, 57, 60], [52, 56, 59], [57, 60, 64]]
const STEP = 60 / 108 / 2
const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

export class HalloweenScore {
  private ctx?: AudioContext
  private master?: GainNode
  private notes = new Set<OscillatorNode>()
  private timer?: number
  private step = 0
  private next = 0

  /** Only the first call from a real tap creates/unlocks the context on iOS. */
  start(gesture = false) {
    if (!this.ctx) {
      if (!gesture || typeof AudioContext === 'undefined') return
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.master.connect(this.ctx.destination)
    }
    if (gesture && this.ctx.state === 'suspended') void this.ctx.resume().catch(() => {})
    if (this.timer !== undefined) return
    this.next = this.ctx.currentTime + 0.05
    this.timer = window.setInterval(() => this.schedule(), 50)
    this.schedule()
  }

  stop() {
    clearInterval(this.timer)
    this.timer = undefined
    for (const note of this.notes) {
      note.stop()
      note.disconnect()
    }
    this.notes.clear()
    this.step = 0
  }

  dispose() {
    this.stop()
    if (this.ctx) void this.ctx.close()
    this.ctx = undefined
  }

  private schedule() {
    const a = this.ctx!
    if (a.state !== 'running') return
    this.master!.gain.setTargetAtTime(speakingVoice() ? 0.22 : 0.7, a.currentTime, 0.06)
    if (this.next < a.currentTime) this.next = a.currentTime + 0.02
    while (this.next < a.currentTime + 0.15) {
      const i = this.step % MELODY.length
      const beat = i % 6
      const chord = CHORDS[Math.floor(i / 6)]
      if (beat === 0) this.note(chord[0] - 12, this.next, 0.45, 0.045, 'triangle')
      if (beat === 2 || beat === 4) for (const n of chord) this.note(n, this.next, 0.22, 0.009, 'triangle')
      const n = MELODY[i]
      if (n !== null) {
        this.note(n, this.next, 0.65, 0.035, 'sine')
        this.note(n + 12, this.next, 0.3, 0.006, 'sine')
      }
      this.step++
      this.next += STEP
    }
  }

  private note(midi: number, at: number, duration: number, volume: number, type: OscillatorType) {
    const a = this.ctx!
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = type
    o.frequency.value = hz(midi)
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(volume, at + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, at + duration)
    o.connect(g).connect(this.master!)
    this.notes.add(o)
    o.onended = () => { this.notes.delete(o); o.disconnect(); g.disconnect() }
    o.start(at)
    o.stop(at + duration + 0.02)
  }
}

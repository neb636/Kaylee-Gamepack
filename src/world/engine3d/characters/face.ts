// The small life every face has: a blink every few seconds, and a mouth that opens with their own voice (the SDK's
// speechLevel reads the clip that's playing). Shared by every 3D character (Kaylee and the family in Thailand).
import { bell, speechLevel } from '../../../sdk'
import type { Rig } from './animal'

export class FaceLife {
  private nextBlink = 0.8 + Math.random() * 3
  private blink = -1
  private level = 0

  private voices: string[]
  /** `voice`: their cast id, or several when one character has more than one way of talking (a cousin on their phone,
   *  and the same cousin cheering at the game table). Kaylee has none: she never talks. */
  constructor(private rig: Rig, voice?: string | string[]) {
    this.voices = voice === undefined ? [] : typeof voice === 'string' ? [voice] : voice
  }

  update(dt: number) {
    const { eyes, mouth, talk, open } = this.rig
    this.nextBlink -= dt
    if (this.nextBlink <= 0) {
      this.blink = 0
      // Now and then a double blink.
      this.nextBlink = Math.random() < 0.2 ? 0.25 : 2.2 + Math.random() * 3.5
    }
    let lid = 1
    if (this.blink >= 0) {
      this.blink += dt / 0.16
      lid = 1 - 0.9 * bell(Math.min(1, this.blink))
      if (this.blink >= 1) this.blink = -1
    }
    if (this.rig.blink) this.rig.blink(lid)
    else eyes.scale.y = lid

    let target = 0
    for (const v of this.voices) target = Math.max(target, speechLevel(v))
    // Opens fast, closes a little slower (reads as syllables, not flicker).
    this.level += (target - this.level) * (1 - Math.exp(-dt * (target > this.level ? 30 : 14)))
    const k = this.level
    // A beak opens on its hinge instead (the pelican): no mouth pops up on her face.
    if (this.rig.beak) this.rig.beak.open(k)
    else if (open) mouth.scale.set(1 + 0.15 * k, 1 + 0.9 * k, 1)
    else {
      const talking = k > 0.04
      talk.visible = talking
      mouth.visible = !talking
      if (talking) talk.scale.set(0.55 + 0.45 * k, Math.min(1, 0.25 + k), 1)
    }
  }
}

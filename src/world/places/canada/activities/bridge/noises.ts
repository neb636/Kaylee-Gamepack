// Animal Bridge's sounds, synthesized from kit/sfx's tone and noise like the other greyboxes: placeholders until the
// full-loop gate records real ones. Plain Web Audio, no React.
import { noise, sfx, tone } from '../../../../kit/sfx'
import type { Kind } from './stage'

export const noises = {
  /** Each animal's own call (a tap, a hop). */
  call(kind: Kind) {
    if (kind === 'elk') {
      // An elk's bugle: a high whistle that rises and falls.
      tone(500, 1400, 0.45, 0.07, 'sine')
      tone(1400, 700, 0.35, 0.06, 'sine', 0.42)
    } else if (kind === 'calf') tone(900, 1300, 0.18, 0.07, 'triangle')
    else if (kind === 'ram' || kind === 'ewe') noises.baa(kind === 'ram' ? 220 : 300)
    else if (kind === 'lamb') noises.baa(480)
    else if (kind === 'grizzly') {
      tone(110, 70, 0.5, 0.18, 'sawtooth')
      noise(0.45, 0.08, 'lowpass', 500, 200)
    } else tone(260, 180, 0.22, 0.12, 'sawtooth')
  },
  baa(f: number) {
    for (let i = 0; i < 5; i++) tone(f * (1 + (i % 2) * 0.06), f * 0.92, 0.09, 0.07, 'sawtooth', i * 0.08)
  },
  /** A car's beep, or a truck's big honk. */
  honk(truck: boolean) {
    const f = truck ? 196 : 392
    tone(f, f, 0.32, 0.08, 'square')
    tone(f * 1.26, f * 1.26, 0.32, 0.06, 'square')
  },
  /** A car whooshing out from under the bridge. */
  zoom() {
    noise(0.5, 0.05, 'bandpass', 500, 1400, 0, 0.9)
  },
  /** The bald eagle's screech. */
  screech() {
    tone(2600, 1700, 0.35, 0.05, 'sawtooth')
    tone(2400, 1900, 0.25, 0.04, 'triangle', 0.32)
  },
  /** The wolf's howl. */
  howl() {
    tone(380, 720, 0.5, 0.08, 'sine')
    tone(720, 520, 0.9, 0.08, 'sine', 0.48)
  },
  /** The wildlife camera's click and flash whine. */
  click() {
    noise(0.04, 0.3, 'highpass', 3000, 4000)
    tone(3200, 5200, 0.25, 0.025, 'sine', 0.02)
  },
  /** The wildlife fence rattling. */
  rattle() {
    for (let i = 0; i < 4; i++) noise(0.05, 0.12, 'bandpass', 2600 + i * 200, 2600, i * 0.06, 2)
  },
  /** "Hmph": mama shakes her head at the fence. */
  huff() {
    noise(0.22, 0.12, 'bandpass', 700, 300, 0, 1)
  },
  /** A bear sniffing the air. */
  sniff() {
    for (const d of [0, 0.15, 0.3]) noise(0.09, 0.14, 'bandpass', 1800, 1200, d, 1.5)
  },
  /** The rams' bonk: a woody knock and a boing. */
  bonk() {
    noise(0.08, 0.5, 'bandpass', 1100, 500, 0, 2.5)
    tone(170, 60, 0.18, 0.22)
    setTimeout(() => sfx.boing(), 90)
  },
  /** A plant popping up on the bridge (a rising note). */
  sprout(step: number) {
    const f = 520 * Math.pow(2, (step % 8) / 8)
    tone(f, f * 1.5, 0.14, 0.06, 'triangle')
  },
}

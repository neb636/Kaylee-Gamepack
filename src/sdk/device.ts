// Which words fit her hands: Kaylee plays on the iPad and iPhone (she taps with a finger) and on the MacBook (she
// clicks with the trackpad or a mouse). "Tap the door" or "put your finger on the water" confuses her on the Mac, so
// every instruction that names a gesture comes in two versions: `onDevice(touch, mouse)` (AGENTS.md, "Every device").
//
//   import { onDevice } from '../../../sdk/device.ts'
//   door: onDevice('Tap the door to go inside!', 'Click the door to go inside!'),
//   start: onDevice(ji('Tap your things to pack them!'), ji('Click your things to pack them!')),
//
// In the app `onDevice` returns the one for this device (decided once, when the page loads). In Node (the scripts that
// read lines.ts: world-voice-lines.mjs, table-read.mjs) it returns `{ touch, mouse }`, so both get recorded and both
// show up in the table read. That's why this file imports nothing: lines.ts files import it and Node reads them.
//
// Try the other device's words on any device with `?device=mouse` or `?device=touch` in the link (before or after the #).

export type Device = 'touch' | 'mouse'

function linkSays(): string | null {
  const search = new URLSearchParams(location.search).get('device')
  if (search) return search
  const hash = location.hash.indexOf('?')
  return hash < 0 ? null : new URLSearchParams(location.hash.slice(hash + 1)).get('device')
}

function detect(): Device {
  if (typeof window === 'undefined') return 'touch'
  const link = linkSays()
  if (link === 'touch' || link === 'mouse') return link
  // An iPad says it's a Mac in its user agent, but it has a touch screen; a MacBook has none.
  const touchScreen = navigator.maxTouchPoints > 0 || (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches)
  return touchScreen ? 'touch' : 'mouse'
}

/** This device: 'touch' (iPad, iPhone) or 'mouse' (a Mac's trackpad or mouse). */
export const DEVICE: Device = detect()
/** True on a computer: say "click", not "tap". */
export const IS_MOUSE = DEVICE === 'mouse'

/**
 * The words for this device: `touch` on the iPad and iPhone, `mouse` on the Mac. Works for spoken lines (plain or
 * `{ text, voice }`) and for text on screen. Every gesture word (tap, finger, swipe, flick, rub, press and hold, pinch)
 * goes through this.
 */
export function onDevice<T>(touch: T, mouse: T): T {
  // Node (reading lines.ts to record and table-read them): both.
  if (typeof window === 'undefined') return { touch, mouse } as T
  return DEVICE === 'mouse' ? mouse : touch
}

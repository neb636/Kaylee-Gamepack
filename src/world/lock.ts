// The family code that unlocks a locked country (Thailand: its 3D house is the family's real home).
// The build encrypts the country's code (scripts/vite-lock.ts); the right code here turns into the key that decrypts
// it, saved on this device so it's asked for only once. Builds without LOCK_CODE (dev, tests) lock nothing.

declare const __PLACE_LOCK__: { place: string; salt: string; iterations: number; check: string } | null

declare global {
  // eslint-disable-next-line no-var
  var __kayleeLocks: Record<string, string> | undefined
}

const lock = __PLACE_LOCK__
const storageKey = (place: string) => `kaylee-lock:${place}` // the locked chunks' stubs read the same key

/** The locked country, if this build has one. */
export const lockedPlace = lock?.place

/** True while `place` still needs the family code on this device. */
export function needsCode(place: string | undefined): boolean {
  if (!lock || place !== lock.place) return false
  if (globalThis.__kayleeLocks?.[place]) return false
  try {
    return !localStorage.getItem(storageKey(place))
  } catch {
    return true
  }
}

const bytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))

/** Checks a typed code; when it's right, keeps the key on this device and returns true. */
export async function tryCode(code: string): Promise<boolean> {
  if (!lock) return true
  const subtle = globalThis.crypto?.subtle
  if (!subtle) return false
  const typed = code.trim().toLowerCase() // same as normalizeCode in scripts/vite-lock.ts
  if (!typed) return false
  const base = await subtle.importKey('raw', new TextEncoder().encode(typed), 'PBKDF2', false, ['deriveBits'])
  const raw = new Uint8Array(await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(lock.salt), iterations: lock.iterations }, base, 256))
  const key = await subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt'])
  const check = bytes(lock.check)
  try {
    await subtle.decrypt({ name: 'AES-GCM', iv: check.slice(0, 12) }, key, check.slice(12))
  } catch {
    return false // wrong code: the check doesn't decrypt
  }
  const saved = btoa(String.fromCharCode(...raw))
  globalThis.__kayleeLocks = { ...globalThis.__kayleeLocks, [lock.place]: saved } // works even if storage is blocked
  try {
    localStorage.setItem(storageKey(lock.place), saved)
  } catch {
    // private browsing: unlocked until the page closes
  }
  return true
}

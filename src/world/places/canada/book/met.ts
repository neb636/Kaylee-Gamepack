// Who Kaylee has met in Canada, remembered on the iPad. Any activity calls meet('moose') when she pokes an animal (or it
// first shows up and she touches it): the first time, the book's card pops up (MetCard.tsx, mounted by Place.tsx) and
// Sparkle names it; after that it does nothing, so poking the same moose again is just play.
import { useEffect, useState } from 'react'
import { savedKey } from '../../../../sdk/hooks'
import type { AnimalId } from './animals'

const KEY = savedKey('canada:book')
const EVENT = 'canada-book-meet'

function read(): AnimalId[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AnimalId[]) : []
  } catch {
    return []
  }
}

/** Every animal she's met (in the order she met them). */
export const metSoFar = (): AnimalId[] => read()

/** She met this animal: true the first time (the card pops up and Sparkle names it), false after. */
export function meet(id: AnimalId): boolean {
  const met = read()
  if (met.includes(id)) return false
  try {
    localStorage.setItem(KEY, JSON.stringify([...met, id]))
  } catch {
    // (A private window: the card still shows, it just isn't remembered.)
  }
  window.dispatchEvent(new CustomEvent<AnimalId>(EVENT, { detail: id }))
  return true
}

/** Listens for new animals (the card). */
export function onMeet(fn: (id: AnimalId) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<AnimalId>).detail)
  window.addEventListener(EVENT, h)
  return () => window.removeEventListener(EVENT, h)
}

/** The animals she's met, kept up to date. */
export function useMet(): AnimalId[] {
  const [met, setMet] = useState(read)
  useEffect(() => onMeet(() => setMet(read())), [])
  return met
}

// The top bar's big top-left button belongs to the shell (PlaceFrame: back to the map). An activity can take it over
// while it's open, when leaving with one tap would be wrong: inside a Koh Samet stop it goes back to the beach.
// `useTopLeft(null)` (or unmounting) gives it back.
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react'

export interface TopLeft {
  icon: ReactNode
  label: string
  onBack(): void
}

let current: TopLeft | null = null
const subs = new Set<() => void>()
const subscribe = (f: () => void) => {
  subs.add(f)
  return () => subs.delete(f)
}

/** The button an activity put there (null: the shell's own). For PlaceFrame. */
export function useTopLeftOverride() {
  return useSyncExternalStore(subscribe, () => current)
}

/** Takes over the top-left button while mounted (its press calls the latest `onBack`). */
export function useTopLeft(t: TopLeft | null) {
  const latest = useRef(t)
  latest.current = t
  const on = !!t
  const label = t?.label
  useEffect(() => {
    if (!on) return
    const mine: TopLeft = {
      get icon() {
        return latest.current?.icon
      },
      label: label ?? '',
      onBack: () => latest.current?.onBack(),
    }
    current = mine
    subs.forEach((f) => f())
    return () => {
      if (current === mine) current = null
      subs.forEach((f) => f())
    }
  }, [on, label])
}

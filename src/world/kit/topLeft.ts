// The top bar's big top-left button belongs to the shell (PlaceFrame: back to the map). An activity can take it over
// while it's open, when leaving with one tap would be wrong: inside a Koh Samet stop it goes back to the beach.
// `useTopLeft(null)` (or unmounting) gives it back.
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react'

export interface TopLeft {
  icon: ReactNode
  label: string
  onBack(): void
}

// A stack: the newest one mounted shows; when it goes, the one under it (the house's, under the game table's) is back.
const stack: TopLeft[] = []
let current: TopLeft | null = null
const sync = () => {
  current = stack[stack.length - 1] ?? null
  subs.forEach((f) => f())
}
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
    stack.push(mine)
    sync()
    return () => {
      const i = stack.indexOf(mine)
      if (i >= 0) stack.splice(i, 1)
      sync()
    }
  }, [on, label])
}

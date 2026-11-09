// The trip: Sparkle's balloon crosses the real map (WorldMap draws it), the map closes in on the country and Sparkle
// names it, so every trip shows her where that country is. This part runs the clock. Tap to skip.
import { useEffect, useRef } from 'react'
import { say, sounds } from '../sdk'
import { WORLD_LINES } from './lines'
import { needsCode } from './lock'
import { FEEL } from './map/feel'
import type { PlaceEntry } from './registry'

export function Travel({ entry, onArrive, onDone }: { entry: PlaceEntry; onArrive: () => void; onDone: () => void }) {
  const done = useRef(false)
  const finish = () => {
    if (done.current) return
    done.current = true
    onDone()
  }
  useEffect(() => {
    sounds.whoosh()
    void say(WORLD_LINES.takeoff)
    if (!needsCode(entry.meta.id)) void entry.load() // start downloading the country while we fly (a locked one can't yet)
    const arrive = setTimeout(() => {
      onArrive()
      void say(entry.meta.map.name)
    }, FEEL.flight * 1000)
    const leave = setTimeout(finish, (FEEL.flight + FEEL.zoom + FEEL.hold) * 1000)
    return () => {
      clearTimeout(arrive)
      clearTimeout(leave)
    }
  }, [entry])

  return <button aria-label="Skip" onClick={finish} style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'transparent' }} />
}

// Small helpers shared by the Dumpling House scenes.
import { useCallback, useEffect, useRef, useState, type RefObject, type Ref } from 'react'
import { say, type Line, type PuppetHandle } from '../../../../../sdk'
import type { WordId } from '../../WordCard'

const tickleTurn = new Map<Line[], number>()
/** Tap a friend: they react and say one of their lines (taking turns through them). */
export function tickle(ref: Ref<PuppetHandle> | undefined, lines: Line[], action = 'wiggle') {
  const handle = (ref as RefObject<PuppetHandle | null> | undefined)?.current
  void handle?.play(action)
  const i = tickleTurn.get(lines) ?? 0
  tickleTurn.set(lines, i + 1)
  void say(lines[i % lines.length])
}

/** Shows a WordCard for a few seconds: `const [word, showWord] = useWord()`. */
export function useWord(): [WordId | null, (w: WordId) => void] {
  const [word, setWord] = useState<WordId | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const show = useCallback((w: WordId) => {
    setWord(w)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setWord(null), 3800)
  }, [])
  return [word, show]
}

export const play = (ref: RefObject<PuppetHandle | null>, action: string) => ref.current?.play(action) ?? Promise.resolve()

/** Angle-accumulating circle gesture: feed pointer positions relative to a center; returns radians travelled. */
export function circleTracker() {
  let last: number | null = null
  let total = 0
  return {
    reset() {
      last = null
    },
    add(dx: number, dy: number) {
      if (Math.hypot(dx, dy) < 12) return total // too close to the middle to tell direction
      const a = Math.atan2(dy, dx)
      if (last !== null) {
        let d = a - last
        if (d > Math.PI) d -= Math.PI * 2
        if (d < -Math.PI) d += Math.PI * 2
        total += Math.abs(d)
      }
      last = a
      return total
    },
  }
}

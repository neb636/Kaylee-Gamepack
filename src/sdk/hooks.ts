import { useCallback, useEffect, useRef } from 'react'
import { say, type Line } from './speech'

/**
 * Returns a function that tells you if the component is still on screen.
 * Use it in async game scripts: `await say('...'); if (!alive()) return`
 */
export function useAlive() {
  const ref = useRef(true)
  useEffect(() => {
    ref.current = true
    return () => {
      ref.current = false
    }
  }, [])
  return useCallback(() => ref.current, [])
}

/** Say something when a screen first appears. */
export function useSayOnMount(text: Line) {
  useEffect(() => {
    void say(text)
  }, [text])
}

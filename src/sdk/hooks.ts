import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
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

/** True when the screen is wider than it is tall. Re-renders when the iPad rotates. */
export function useLandscape() {
  const query = '(orientation: landscape)'
  const [landscape, setLandscape] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches)
  useEffect(() => {
    const m = matchMedia(query)
    const update = () => setLandscape(m.matches)
    update()
    m.addEventListener('change', update)
    return () => m.removeEventListener('change', update)
  }, [])
  return landscape
}

/** The live size of an element in px (0×0 until it's measured). */
export function useElementSize(ref: RefObject<Element | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((s) => (s.width === width && s.height === height ? s : { width, height }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

/**
 * Runs `tick(dt, time)` every animation frame (dt in seconds, capped so a hiccup can't teleport things).
 * Write positions to refs / element styles inside `tick`; don't setState every frame.
 * Pass `running = false` to pause.
 */
export function useGameLoop(tick: (dt: number, time: number) => void, running = true) {
  const tickRef = useRef(tick)
  tickRef.current = tick
  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!document.hidden) tickRef.current(dt, now / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running])
}

// Previews live on the same website as the real app, so keep their saves separate (like trophies).
const savedKey = (key: string) => `kaylee-gamepack:${import.meta.env.BASE_URL}:saved:${key}`

/**
 * Like useState, but remembered on this iPad (her avatar, her favorite pizza...).
 * Use a unique key, e.g. `${meta.id}:avatar`. Values must be JSON.
 */
export function useSaved<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(savedKey(key))
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(savedKey(key), JSON.stringify(value))
    } catch {
      // Private mode or full storage: keep playing without saving.
    }
  }, [key, value])
  return [value, setValue] as const
}

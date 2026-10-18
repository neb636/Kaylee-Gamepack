// Mounts Agong's house: takes the shared WebGL renderer, builds the house, runs the frame loop, routes taps (from the
// canvas and from the DOM tap targets) and cleans everything up when it unmounts. No WebGL2: tells the Hub to show
// the flat fallback instead (without a console error).
import { useEffect, useRef, type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react'
import { automated } from '../../engine/flags'
import { frameLoop } from '../../engine/loop'
import { acquireRenderer, dropRenderer, releaseRenderer } from '../../engine/renderer'
import { Anchors } from './Anchors'
import { House, type HouseEvents, type Start } from './house'

export type RenderMode = 'webgl' | 'flat' | 'lost'

declare global {
  interface Window {
    /** Read-only state of Agong's house for tests and QA scripts (no jump hooks: use section links). */
    __thaiHouseQA?: () => Record<string, unknown>
  }
}

interface Props {
  start: Start
  events: HouseEvents
  onMode: (mode: RenderMode) => void
  houseRef: MutableRefObject<House | null>
}

export function HouseView({ start, events, onMode, houseRef }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const topProbe = useRef<HTMLDivElement>(null)
  const anchors = useRef(new Map<string, HTMLElement>())
  // Callbacks change identity on every Hub render; the house keeps calling the latest ones.
  const ev = useRef(events)
  ev.current = events
  const modeRef = useRef(onMode)
  modeRef.current = onMode
  const tracker = useRef<{ id?: string; x: number; y: number; t: number; pointer: number } | null>(null)
  const downFromAnchor = useRef<((e: ReactPointerEvent, id: string) => void) | null>(null)

  useEffect(() => {
    const el = host.current!
    const renderer = acquireRenderer()
    if (!renderer) {
      document.documentElement.dataset.render = 'flat'
      modeRef.current('flat')
      return
    }
    let house: House
    try {
      house = new House(renderer, start, { onSpot: (s, at) => ev.current.onSpot(s, at), onArrived: () => ev.current.onArrived(), onPoke: (id) => ev.current.onPoke?.(id) })
    } catch (e) {
      console.warn('Agong\'s house could not be built, showing the flat house instead.', e)
      releaseRenderer(renderer)
      modeRef.current('flat')
      return
    }
    document.documentElement.dataset.render = 'webgl'
    houseRef.current = house
    house.setAnchorElements(anchors.current)
    const canvas = renderer.domElement
    el.prepend(canvas)

    // ---- Size: the canvas fills the screen; the camera keeps the framing below the top bar ----
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    const measure = () => {
      const r = el.getBoundingClientRect()
      renderer.setPixelRatio(dpr)
      renderer.setSize(r.width, r.height, false)
      house.setSize(r.width, r.height, topProbe.current?.offsetHeight ?? 104)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    let orientTimer = 0
    const onOrient = () => {
      clearTimeout(orientTimer)
      orientTimer = window.setTimeout(measure, 250)
    }
    window.addEventListener('orientationchange', onOrient)
    window.visualViewport?.addEventListener('resize', onOrient)

    // ---- Frame loop, frame-time stats and a gentle pixel-ratio drop on a slow device ----
    const times: number[] = []
    let slow = 0
    let stop = () => {}
    let started = false
    const begin = () => {
      if (started) return
      started = true
      stop = frameLoop(
        (_now, dt) => {
          house.update(dt)
          house.render()
          house.placeAnchors()
          times.push(dt * 1000)
          if (times.length > 120) times.shift()
          const sorted = [...times].sort((a, b) => a - b)
          house.stats.fps = Math.round(1000 / (times.reduce((a, b) => a + b, 0) / times.length))
          house.stats.p95 = Math.round(sorted[Math.floor(sorted.length * 0.95)] ?? 0)
          if (!automated && !house.calm) {
            slow = dt > 0.02 ? slow + 1 : Math.max(0, slow - 2)
            if (slow > 90 && dpr > 1) {
              dpr = Math.max(1, dpr - 0.25)
              slow = 0
              measure()
            }
          }
        },
        () => house.calm,
      )
    }
    // Compile the shaders before the first frame so the first seconds don't stutter.
    renderer.compileAsync(house.scene, house.rig.camera).then(begin, begin)

    // ---- Taps and drags (the anchors call the same tracker) ----
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onMove = (e: PointerEvent) => {
      const p = local(e)
      const t = tracker.current
      house.pointerMove(p.x, p.y, t?.x ?? p.x, t?.y ?? p.y, !!t && t.pointer === e.pointerId)
    }
    const onUp = (e: PointerEvent) => {
      const t = tracker.current
      if (!t || t.pointer !== e.pointerId) return
      tracker.current = null
      const p = local(e)
      house.pointerUp()
      if (Math.hypot(p.x - t.x, p.y - t.y) < 14 && performance.now() - t.t < 900) house.tap(p.x, p.y, t.id)
    }
    const onDown = (e: PointerEvent) => {
      if (e.button > 0) return
      const p = local(e)
      tracker.current = { x: p.x, y: p.y, t: performance.now(), pointer: e.pointerId }
      house.pointerDown(p.x, p.y)
    }
    canvas.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    downFromAnchor.current = (e, id) => {
      onDown(e.nativeEvent)
      if (tracker.current) tracker.current.id = id
    }
    // No pinch-zoom or double-tap zoom over the house (iPad Safari).
    const stopGesture = (e: Event) => e.preventDefault()
    el.addEventListener('gesturestart', stopGesture)
    el.addEventListener('gesturechange', stopGesture)
    el.addEventListener('dblclick', stopGesture)

    // ---- A lost GPU context (the iPad reclaims it in the background): offer to wake the house ----
    const onLost = (e: Event) => {
      e.preventDefault()
      stop()
      dropRenderer(renderer)
      modeRef.current('lost')
    }
    canvas.addEventListener('webglcontextlost', onLost)

    window.__thaiHouseQA = () => ({ mode: 'webgl', ...house.qa(), stats: { ...house.stats, dpr }, memory: house.memory() })

    return () => {
      stop()
      ro.disconnect()
      clearTimeout(orientTimer)
      window.removeEventListener('orientationchange', onOrient)
      window.visualViewport?.removeEventListener('resize', onOrient)
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('webglcontextlost', onLost)
      el.removeEventListener('gesturestart', stopGesture)
      el.removeEventListener('gesturechange', stopGesture)
      el.removeEventListener('dblclick', stopGesture)
      downFromAnchor.current = null
      if (window.__thaiHouseQA) delete window.__thaiHouseQA
      house.dispose()
      houseRef.current = null
      canvas.remove()
      releaseRenderer(renderer)
    }
  }, [])

  return (
    <div ref={host} style={{ position: 'absolute', inset: 0, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div ref={topProbe} style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 'var(--top-clear)', pointerEvents: 'none' }} />
      <Anchors
        els={anchors.current}
        onDown={(e, id) => downFromAnchor.current?.(e, id)}
        onKey={(id) => houseRef.current?.tap(0, 0, id)}
        onHover={(id) => houseRef.current?.hoverAnchor(id)}
      />
    </div>
  )
}

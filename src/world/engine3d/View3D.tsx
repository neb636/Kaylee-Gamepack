// Mounts one 3D world (Agong's house, the bay, any 3D country): takes the shared WebGL renderer, builds the world, runs the frame loop,
// routes taps and drags (from the canvas and from the DOM tap targets over it) and cleans everything up when it
// unmounts. If the iPad takes the GPU back (a lost context), it tells the screen, which offers to wake it.
import { useEffect, useRef, type MutableRefObject, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import type { Scene, WebGLRenderer } from 'three'
import type { CameraRig } from './camera'
import { camLab, type LabWorld } from './camLab'
import { automated } from './flags'
import { frameLoop } from './loop'
import { acquireRenderer, dropRenderer, releaseRenderer } from './renderer'

export type RenderMode = 'webgl' | 'lost'

/** What View3D needs from a world. */
export interface World3D {
  readonly scene: Scene
  readonly rig: CameraRig
  stats: { fps: number; p95: number; calls: number; tris: number }
  /** Nothing is moving: the frame loop may drop to 30 fps. */
  readonly calm: boolean
  setSize(w: number, h: number, top: number): void
  update(dt: number): void
  render(): void
  /** Positions the DOM tap targets over their things (style writes only). */
  placeAnchors(): void
  setAnchorElements(els: Map<string, HTMLElement>): void
  /** A finger went down (on an anchor: `id`). */
  pointerDown(x: number, y: number, id?: string): void
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean): void
  pointerUp(): void
  /** A short touch that didn't move: on an anchor (`id`) or at a screen point. */
  tap(x: number, y: number, id?: string): void
  hoverAnchor?(id: string | null): void
  qa(): Record<string, unknown>
  memory(): Record<string, number>
  dispose(): void
}

/** Read-only state for tests and QA scripts (no jump hooks: use section links). */
export type QAKey = '__thaiHouseQA' | '__thaiBoatQA' | '__thaiMallQA' | '__thaiNanQA' | '__thaiCastQA' | '__polesGlobeQA' | '__polesFloeQA' | '__polesSlideQA' | '__polesIcebergQA' | '__canadaMapQA' | '__canadaBikeQA'
declare global {
  interface Window {
    __thaiHouseQA?: () => Record<string, unknown>
    __thaiBoatQA?: () => Record<string, unknown>
    __thaiMallQA?: () => Record<string, unknown>
    __thaiNanQA?: () => Record<string, unknown>
    __thaiCastQA?: () => Record<string, unknown>
    __polesGlobeQA?: () => Record<string, unknown>
    __polesFloeQA?: () => Record<string, unknown>
    __polesSlideQA?: () => Record<string, unknown>
    __polesIcebergQA?: () => Record<string, unknown>
    __canadaMapQA?: () => Record<string, unknown>
    __canadaBikeQA?: () => Record<string, unknown>
  }
}

/** What the DOM tap targets call. */
export interface AnchorInput {
  onDown: (e: ReactPointerEvent, id: string) => void
  onKey: (id: string) => void
  onHover: (id: string | null) => void
}

interface Props<W extends World3D> {
  /** Builds the world. */
  make: (renderer: WebGLRenderer) => W
  /** For the error if it can't be built. */
  name: string
  qaKey: QAKey
  onMode: (mode: RenderMode) => void
  worldRef: MutableRefObject<W | null>
  /** The DOM tap targets laid over the canvas. */
  anchors: (input: AnchorInput, els: Map<string, HTMLElement>) => ReactNode
  /** Hold the world still and stop drawing it (a video over it). */
  paused?: boolean
}

export function View3D<W extends World3D>({ make, name, qaKey, onMode, worldRef, anchors, paused = false }: Props<W>) {
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  const host = useRef<HTMLDivElement>(null)
  const topProbe = useRef<HTMLDivElement>(null)
  const anchorEls = useRef(new Map<string, HTMLElement>())
  const modeRef = useRef(onMode)
  modeRef.current = onMode
  const tracker = useRef<{ id?: string; x: number; y: number; t: number; pointer: number } | null>(null)
  const downFromAnchor = useRef<((e: ReactPointerEvent, id: string) => void) | null>(null)

  useEffect(() => {
    const el = host.current!
    const renderer = acquireRenderer()
    let world: W
    try {
      world = make(renderer)
    } catch (e) {
      releaseRenderer(renderer)
      throw new Error(`${name} could not be built`, { cause: e })
    }
    worldRef.current = world
    world.setAnchorElements(anchorEls.current)
    const canvas = renderer.domElement
    el.prepend(canvas)
    // The camera lab (?cam=1) talks to whichever world is on screen.
    const lab: LabWorld = {
      rig: world.rig,
      qa: () => world.qa(),
      host: el,
      renderer,
      snapshot: () => {
        world.render()
        return canvas.toDataURL('image/png')
      },
    }
    camLab.attach(lab)

    // ---- Size: the canvas fills the screen; the camera keeps the framing below the top bar ----
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    // (Drawing has begun, after the shaders compiled; the view is going away.)
    let started = false
    let gone = false
    const measure = () => {
      // Unscaled (the camera lab shows an iPad's screen scaled down; the world still lays out at the iPad's size).
      const r = el.getBoundingClientRect()
      const k = el.offsetWidth ? r.width / el.offsetWidth : 1
      const w = r.width / k
      const h = r.height / k
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h, false)
      world.setSize(w, h, topProbe.current?.offsetHeight ?? 104)
      // Resizing the canvas clears it, and the canvas is opaque with no kept buffer on a real device (renderer.ts): draw
      // again at once, or the screen flashes black until the next frame (Dad saw it on the mountain road whenever the
      // slow-device pixel-ratio drop below kicked in, or Safari's toolbar resized the page, 2026-10-26). Test browsers
      // keep the buffer, so they never showed it.
      if (started && !gone) world.render()
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
    const begin = () => {
      if (started || gone) return
      started = true
      stop = frameLoop(
        (_now, dt) => {
          if (pausedRef.current) return
          // Frozen in the camera lab: the moment holds, only the camera moves.
          if (camLab.frozen) world.rig.update(dt)
          else world.update(dt)
          world.render()
          world.placeAnchors()
          times.push(dt * 1000)
          if (times.length > 120) times.shift()
          const sorted = [...times].sort((a, b) => a - b)
          world.stats.fps = Math.round(1000 / (times.reduce((a, b) => a + b, 0) / times.length))
          world.stats.p95 = Math.round(sorted[Math.floor(sorted.length * 0.95)] ?? 0)
          if (!automated && !world.calm) {
            slow = dt > 0.02 ? slow + 1 : Math.max(0, slow - 2)
            if (slow > 90 && dpr > 1) {
              dpr = Math.max(1, dpr - 0.25)
              slow = 0
              measure()
            }
          }
        },
        () => pausedRef.current || world.calm,
      )
    }
    // Compile the shaders before the first frame so the first seconds don't stutter. (three.js polls every material
    // until its program is ready, and throws if one was disposed meanwhile: an unmount waits for it, below.)
    let compiled = false
    const ready = renderer.compileAsync(world.scene, world.rig.camera)
    ready.then(() => (compiled = true), () => (compiled = true))
    ready.then(begin, begin)

    // ---- Taps and drags (the anchors call the same tracker) ----
    // In screen pixels of the world (the camera lab can show it scaled down, as an iPad inside a desktop window).
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const k = el.offsetWidth ? r.width / el.offsetWidth : 1
      return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }
    }
    const onMove = (e: PointerEvent) => {
      const p = local(e)
      const t = tracker.current
      world.pointerMove(p.x, p.y, t?.x ?? p.x, t?.y ?? p.y, !!t && t.pointer === e.pointerId)
    }
    const onUp = (e: PointerEvent) => {
      const t = tracker.current
      if (!t || t.pointer !== e.pointerId) return
      tracker.current = null
      const p = local(e)
      world.pointerUp()
      if (Math.hypot(p.x - t.x, p.y - t.y) < 14 && performance.now() - t.t < 900) world.tap(p.x, p.y, t.id)
    }
    const onDown = (e: PointerEvent, id?: string) => {
      if (e.button > 0) return
      const p = local(e)
      tracker.current = { x: p.x, y: p.y, t: performance.now(), pointer: e.pointerId, id }
      world.pointerDown(p.x, p.y, id)
    }
    const onCanvasDown = (e: PointerEvent) => onDown(e)
    canvas.addEventListener('pointerdown', onCanvasDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    downFromAnchor.current = (e, id) => onDown(e.nativeEvent, id)
    // No pinch-zoom or double-tap zoom over the world (iPad Safari).
    const stopGesture = (e: Event) => e.preventDefault()
    el.addEventListener('gesturestart', stopGesture)
    el.addEventListener('gesturechange', stopGesture)
    el.addEventListener('dblclick', stopGesture)

    // ---- A lost GPU context (the iPad reclaims it in the background): the screen offers to wake it ----
    const onLost = (e: Event) => {
      e.preventDefault()
      stop()
      dropRenderer(renderer)
      modeRef.current('lost')
    }
    canvas.addEventListener('webglcontextlost', onLost)

    window[qaKey] = () => ({ mode: 'webgl', ...world.qa(), stats: { ...world.stats, dpr }, memory: world.memory() })

    return () => {
      stop()
      camLab.detach(lab)
      ro.disconnect()
      clearTimeout(orientTimer)
      window.removeEventListener('orientationchange', onOrient)
      window.visualViewport?.removeEventListener('resize', onOrient)
      canvas.removeEventListener('pointerdown', onCanvasDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('webglcontextlost', onLost)
      el.removeEventListener('gesturestart', stopGesture)
      el.removeEventListener('gesturechange', stopGesture)
      el.removeEventListener('dblclick', stopGesture)
      downFromAnchor.current = null
      if (window[qaKey]) delete window[qaKey]
      gone = true
      // Left before the shaders finished compiling (a quick section link, a leg swap): free it once they have.
      const dispose = () => world.dispose()
      if (compiled) dispose()
      else ready.then(dispose, dispose)
      worldRef.current = null
      canvas.remove()
      releaseRenderer(renderer)
    }
  }, [])

  return (
    // Its own stacking layer: the tap targets' z-indexes (by depth) never climb over the screen's overlays.
    <div ref={host} style={{ position: 'absolute', inset: 0, isolation: 'isolate', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div ref={topProbe} style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 'var(--top-clear)', pointerEvents: 'none' }} />
      {anchors(
        {
          onDown: (e, id) => downFromAnchor.current?.(e, id),
          onKey: (id) => worldRef.current?.tap(0, 0, id),
          onHover: (id) => worldRef.current?.hoverAnchor?.(id),
        },
        anchorEls.current,
      )}
    </div>
  )
}

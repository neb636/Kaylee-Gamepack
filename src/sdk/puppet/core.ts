// Puppets: characters drawn as layered SVG whose parts (ears, eyes, mouth, legs...) move on their own, every frame.
// This is what makes a character feel alive instead of a picture sliding around: anticipation and squash before a hop,
// ears that lag behind and flop, blinking, eyes that follow her finger, a mouth that moves with the character's voice.
//
//   const Pip = forwardRef<PuppetHandle, Props>((props, ref) => {
//     const { svg, part } = usePuppet(ref, { voice: 'pip', actions: { hop: 0.7 }, eyes: [200, 160], frame: (f, p) => {
//       setT(p.head, `rotate(${Math.sin(f.t * 2) * 3} 200 230)`)
//     } })
//     return <svg ref={svg} viewBox="0 0 400 480"><g ref={part('head')}>...</g></svg>   (or <g ref={svg}> when nested)
//   })
//   ...
//   await pip.current?.play('hop')   // resolves when the hop lands
//
// The frame function runs in requestAnimationFrame and writes attributes directly (no React re-render per frame).
import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import { speechLevel } from '../speech'

export interface PuppetFrame {
  /** Seconds since the puppet appeared. */
  t: number
  /** Seconds since the last frame (capped, so a background tab doesn't explode springs). */
  dt: number
  /** The action playing now (from `play`), or null when idle. */
  action: string | null
  /** Progress through the action, 0 to 1. */
  p: number
  /** 1 = eyes open, 0 = closed. Blinks on its own every few seconds. */
  blink: number
  /** Where the eyes should point, each -1..1 (follows her finger, otherwise glances around). */
  look: { x: number; y: number }
  /** How open the mouth should be, 0..1, from the loudness of this puppet's voice. */
  mouth: number
  /** True while this puppet's voice is playing. */
  talking: boolean
  /** 0..1: how close her finger is to the puppet's `reach` point while she presses or drags (e.g. a leaf near a mouth). */
  near: number
}

export interface PuppetHandle {
  /** Play an action by name; resolves when it finishes (or is replaced by another action). */
  play: (action: string) => Promise<void>
}

export interface PuppetOptions<P extends string> {
  /** Cast speaker id, so the mouth moves when this character talks. */
  voice?: string
  /** Action name → duration in seconds. */
  actions?: Record<string, number>
  /** Point between the eyes in viewBox units (eyes look from here). */
  eyes?: [number, number]
  /** Point in viewBox units that `near` measures to (usually the mouth). */
  reach?: [number, number]
  frame: (f: PuppetFrame, parts: Record<P, SVGGraphicsElement | HTMLElement>) => void
}

// One shared pointer tracker for every puppet.
const pointer = { x: 0, y: 0, down: false, moved: -1e9 }
let tracking = false
function track() {
  if (tracking || typeof window === 'undefined') return
  tracking = true
  const move = (e: PointerEvent) => {
    pointer.x = e.clientX
    pointer.y = e.clientY
    pointer.moved = performance.now()
  }
  window.addEventListener('pointermove', move, { passive: true, capture: true })
  window.addEventListener('pointerdown', (e) => ((pointer.down = true), move(e)), { passive: true, capture: true })
  const up = () => (pointer.down = false)
  window.addEventListener('pointerup', up, { passive: true, capture: true })
  window.addEventListener('pointercancel', up, { passive: true, capture: true })
}

export function usePuppet<P extends string>(ref: Ref<PuppetHandle> | undefined, options: PuppetOptions<P>) {
  // The puppet's root element: usually its <svg>, or a <g> when it's drawn inside another puppet (a joey in a pouch).
  const root = useRef<SVGGraphicsElement | null>(null)
  const svg = useCallback((el: SVGGraphicsElement | null) => {
    root.current = el
  }, [])
  const parts = useRef({} as Record<P, SVGGraphicsElement | HTMLElement>)
  const opts = useRef(options)
  opts.current = options
  const state = useRef({ action: null as string | null, start: 0, t: 0, resolve: undefined as (() => void) | undefined })
  const refs = useRef(new Map<P, (el: SVGGraphicsElement | HTMLElement | null) => void>())

  useImperativeHandle(ref, () => ({
    play: (action) =>
      new Promise<void>((resolve) => {
        const s = state.current
        s.resolve?.()
        s.action = action
        s.start = s.t
        s.resolve = resolve
      }),
  }))

  useEffect(() => {
    track()
    let raf = 0
    let last = performance.now()
    const seed = Math.random() * 10
    let nextBlink = 1.5 + seed * 0.3
    let blinkAt = -1
    let doubleBlink = false
    let gaze = { x: 0, y: 0 }
    let nextGaze = 1
    const look = { x: 0, y: 0 }
    let mouth = 0

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const s = state.current
      s.t += dt
      const t = s.t
      const o = opts.current
      const el = root.current

      // Current action
      let p = 0
      if (s.action) {
        const dur = o.actions?.[s.action] ?? 1
        p = Math.min(1, (t - s.start) / dur)
        if (p >= 1) {
          s.action = null
          const r = s.resolve
          s.resolve = undefined
          r?.()
        }
      }

      // Blink every 2-5 seconds, sometimes twice.
      if (t > nextBlink) {
        blinkAt = t
        doubleBlink = Math.random() < 0.2
        nextBlink = t + 2 + Math.random() * 3
      }
      const since = t - blinkAt
      const blinkLen = doubleBlink ? 0.36 : 0.15
      const blink = since < blinkLen ? 1 - Math.abs(Math.sin(((since % 0.18) / 0.15) * Math.PI)) * 0.95 : 1

      // Eyes follow her finger for a while after it moves; otherwise glance around, mostly at her.
      let target = gaze
      let near = 0
      // Reading the on-screen position forces layout, so only do it while her finger is moving or pressing.
      const active = pointer.down || now - pointer.moved < 1500
      const ctm = active ? el?.getScreenCTM() : null
      if (el && ctm && o.eyes) {
        const ex = ctm.a * o.eyes[0] + ctm.c * o.eyes[1] + ctm.e
        const ey = ctm.b * o.eyes[0] + ctm.d * o.eyes[1] + ctm.f
        const dx = pointer.x - ex
        const dy = pointer.y - ey
        const d = Math.hypot(dx, dy) || 1
        const k = Math.min(1, d / 120)
        target = { x: (dx / d) * k, y: (dy / d) * k }
      }
      if (el && ctm && o.reach && pointer.down) {
        const rx = ctm.a * o.reach[0] + ctm.c * o.reach[1] + ctm.e
        const ry = ctm.b * o.reach[0] + ctm.d * o.reach[1] + ctm.f
        const w = el.getBoundingClientRect().width || 1
        near = Math.max(0, Math.min(1, 1 - Math.hypot(pointer.x - rx, pointer.y - ry) / (w * 0.8)))
      }
      if (t > nextGaze) {
        gaze = Math.random() < 0.55 ? { x: 0, y: 0.15 } : { x: (Math.random() * 2 - 1) * 0.8, y: (Math.random() * 2 - 1) * 0.5 }
        nextGaze = t + 1.2 + Math.random() * 2.5
      }
      look.x += (target.x - look.x) * Math.min(1, dt * 14)
      look.y += (target.y - look.y) * Math.min(1, dt * 14)

      // Mouth follows the loudness of this character's voice: opens fast, closes a little slower.
      const level = o.voice ? speechLevel(o.voice) : 0
      mouth += (level - mouth) * Math.min(1, dt * (level > mouth ? 30 : 14))

      o.frame({ t, dt, action: s.action, p, blink, look, mouth: mouth < 0.04 ? 0 : mouth, talking: level > 0 || mouth > 0.04, near }, parts.current)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      state.current.resolve?.()
    }
  }, [])

  /** `ref={part('head')}` registers a moving part. */
  const part = (name: P) => {
    let fn = refs.current.get(name)
    if (!fn) {
      fn = (el) => {
        if (el) parts.current[name] = el
      }
      refs.current.set(name, fn)
    }
    return fn
  }
  return { svg, part }
}

// --- Little helpers for frame functions ---------------------------------------------------------------------------

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p
/** Smooth ease in-out, 0..1. */
export const smooth = (p: number) => {
  p = clamp(p)
  return p * p * (3 - 2 * p)
}
/** 0 → 1 → 0 hump over p = 0..1. */
export const bell = (p: number) => Math.sin(Math.PI * clamp(p))
/** Progress of p within [a, b], 0..1. */
export const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
/** Decaying wobble: starts at 1, oscillates and settles to 0 (a jelly "boing"). */
export const wobble = (p: number, cycles = 3) => Math.cos(clamp(p) * Math.PI * 2 * cycles) * (1 - clamp(p)) ** 2

/** A damped spring: call `step(target, dt)` every frame and read `.x`. Great for ears, tails and follow-through. */
export function spring(stiffness = 170, damping = 10) {
  return {
    x: 0,
    v: 0,
    step(target: number, dt: number) {
      this.v += ((target - this.x) * stiffness - this.v * damping) * dt
      this.x += this.v * dt
      return this.x
    },
  }
}

/** Set an SVG transform attribute (skips missing parts). */
export function setT(el: SVGGraphicsElement | HTMLElement | undefined, transform: string) {
  if (!el) return
  if (el instanceof HTMLElement) el.style.transform = transform
  else el.setAttribute('transform', transform)
}
/** Set any attribute (e.g. a mouth path `d`). */
export function setA(el: SVGGraphicsElement | HTMLElement | undefined, name: string, value: string | number) {
  el?.setAttribute(name, String(value))
}
/** Show or hide a part. */
export function show(el: SVGGraphicsElement | HTMLElement | undefined, visible: boolean) {
  if (el) el.style.display = visible ? '' : 'none'
}

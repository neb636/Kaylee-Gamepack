// Low-level finger dragging with plain pointer events (no motion `drag`).
// Motion's drag can get stuck in iPad Safari when an item unmounts or toggles `drag={false}` right after a drop;
// this doesn't, so it's safe for many quick drags in a row.
import { useEffect, useRef, type RefObject } from 'react'

export interface DragInfo {
  /** Where the finger is now (client px). */
  x: number
  y: number
  /** How far it moved since it touched down (px). */
  dx: number
  dy: number
  /** Where it touched down (client px). */
  startX: number
  startY: number
}

export interface PointerDragOptions {
  /** The finger moved past `threshold`: a drag has started. */
  onStart?: (info: DragInfo) => void
  onMove?: (info: DragInfo) => void
  /** Let go after dragging. */
  onEnd?: (info: DragInfo) => void
  /** Let go without dragging (a tap). Never fires together with onEnd. */
  onTap?: (info: DragInfo) => void
  /** The system took the touch away (a swipe from the edge, a phone call). Put things back. */
  onCancel?: () => void
  /** Pixels the finger must move before it counts as a drag. Default 8. */
  threshold?: number
  disabled?: boolean
}

/**
 * Makes an element draggable with one finger. You decide what moving means in the callbacks
 * (usually `el.style.transform = translate(dx, dy)`); nothing re-renders per move.
 */
export function usePointerDrag(ref: RefObject<HTMLElement | SVGElement | null>, options: PointerDragOptions) {
  const opts = useRef(options)
  opts.current = options

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.touchAction = 'none'
    let id: number | null = null
    let dragging = false
    let info: DragInfo = { x: 0, y: 0, dx: 0, dy: 0, startX: 0, startY: 0 }

    const update = (e: PointerEvent) => {
      info = { ...info, x: e.clientX, y: e.clientY, dx: e.clientX - info.startX, dy: e.clientY - info.startY }
    }
    const finish = () => {
      if (id !== null && el.hasPointerCapture?.(id)) el.releasePointerCapture(id)
      id = null
      dragging = false
    }
    const down = (e: PointerEvent) => {
      if (id !== null || opts.current.disabled || (e.pointerType === 'mouse' && e.button !== 0)) return
      id = e.pointerId
      dragging = false
      info = { x: e.clientX, y: e.clientY, dx: 0, dy: 0, startX: e.clientX, startY: e.clientY }
      el.setPointerCapture?.(e.pointerId)
      e.preventDefault()
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      update(e)
      if (!dragging && Math.hypot(info.dx, info.dy) >= (opts.current.threshold ?? 8)) {
        dragging = true
        opts.current.onStart?.(info)
      }
      if (dragging) opts.current.onMove?.(info)
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      update(e)
      const wasDragging = dragging
      finish()
      if (wasDragging) opts.current.onEnd?.(info)
      else opts.current.onTap?.(info)
    }
    const cancel = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      const wasDragging = dragging
      finish()
      if (wasDragging) opts.current.onCancel?.()
    }

    el.addEventListener('pointerdown', down as EventListener)
    el.addEventListener('pointermove', move as EventListener)
    el.addEventListener('pointerup', up as EventListener)
    el.addEventListener('pointercancel', cancel as EventListener)
    el.addEventListener('lostpointercapture', cancel as EventListener)
    return () => {
      el.removeEventListener('pointerdown', down as EventListener)
      el.removeEventListener('pointermove', move as EventListener)
      el.removeEventListener('pointerup', up as EventListener)
      el.removeEventListener('pointercancel', cancel as EventListener)
      el.removeEventListener('lostpointercapture', cancel as EventListener)
    }
  }, [ref])
}

/** A client point as fractions of an element's box: (0,0) top-left, (1,1) bottom-right. */
export function toLocal(el: Element, clientX: number, clientY: number) {
  const r = el.getBoundingClientRect()
  return { x: (clientX - r.left) / (r.width || 1), y: (clientY - r.top) / (r.height || 1) }
}

/** Center of an element's box in client px. */
export function centerOf(el: Element) {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, type CSSProperties, type PointerEvent } from 'react'

/** A box on the layer in % of its size, e.g. where the Sphinx's face is under the sand. */
export interface RevealRegion {
  x: number
  y: number
  w: number
  h: number
}

export interface ScratchRevealHandle {
  /** Wipe a circle away (x, y in % of the layer, r in % of its width), e.g. a sneeze blowing sand off. */
  clearCircle: (x: number, y: number, r: number) => void
  /** Wipe a whole region away (when she has done most of it, the rest puffs off by itself). */
  clearRegion: (region: RevealRegion) => void
}

export interface ScratchRevealProps {
  /** Paints the covering layer (sand, frost, dust...). Called on mount and whenever the size changes. */
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  /** Brush radius in % of the layer's width. */
  brush?: number
  /** Regions whose cleared share (0..1) is reported to `onProgress` while she rubs. */
  regions?: RevealRegion[]
  onProgress?: (cleared: number[]) => void
  /** Every rub stroke, in % of the layer (for sand flying, a sneeze when she gets near a nose...). */
  onRub?: (x: number, y: number) => void
  disabled?: boolean
  style?: CSSProperties
}

/**
 * A layer she rubs away with her finger to uncover what is underneath (sand off a statue, frost off a window).
 * Put it over the picture it hides, in the same box.
 */
export const ScratchReveal = forwardRef<ScratchRevealHandle, ScratchRevealProps>(function ScratchReveal({ paint, brush = 6, regions = [], onProgress, onRub, disabled, style }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const last = useRef<{ x: number; y: number } | null>(null)
  const props = useRef({ paint, regions, onProgress, onRub, brush, disabled })
  props.current = { paint, regions, onProgress, onRub, brush, disabled }
  const checkAt = useRef(0)
  const painted = useRef(false)

  const ctx = () => canvas.current?.getContext('2d', { willReadFrequently: true }) ?? null

  // Paint once the canvas has a size. A real resize repaints the whole layer (rare on an iPad, and never mid-rub).
  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const setup = () => {
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) return
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = Math.round(r.width * dpr)
      const h = Math.round(r.height * dpr)
      if (painted.current && Math.abs(el.width - w) < 4 && Math.abs(el.height - h) < 4) return
      el.width = w
      el.height = h
      const c = ctx()
      if (!c) return
      c.globalCompositeOperation = 'source-over'
      props.current.paint(c, w, h)
      painted.current = true
    }
    setup()
    const ro = new ResizeObserver(setup)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const report = useCallback((force = false) => {
    const el = canvas.current
    const c = ctx()
    const { regions: rs, onProgress: cb } = props.current
    if (!el || !c || !cb || !rs.length) return
    const now = performance.now()
    if (!force && now - checkAt.current < 150) return
    checkAt.current = now
    cb(
      rs.map((g) => {
        const x = Math.max(0, Math.round((g.x / 100) * el.width))
        const y = Math.max(0, Math.round((g.y / 100) * el.height))
        const w = Math.max(1, Math.min(el.width - x, Math.round((g.w / 100) * el.width)))
        const h = Math.max(1, Math.min(el.height - y, Math.round((g.h / 100) * el.height)))
        const data = c.getImageData(x, y, w, h).data
        let clear = 0
        let n = 0
        // Every 4th pixel each way is plenty.
        for (let j = 0; j < h; j += 4) {
          for (let i = 0; i < w; i += 4) {
            n++
            if (data[(j * w + i) * 4 + 3] < 60) clear++
          }
        }
        return n ? clear / n : 1
      }),
    )
  }, [])

  const wipe = useCallback((draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) => {
    const el = canvas.current
    const c = ctx()
    if (!el || !c) return
    c.save()
    c.globalCompositeOperation = 'destination-out'
    draw(c, el.width, el.height)
    c.restore()
  }, [])

  useImperativeHandle(ref, () => ({
    clearCircle: (x, y, r) => {
      wipe((c, w, h) => {
        const g = c.createRadialGradient((x / 100) * w, (y / 100) * h, 0, (x / 100) * w, (y / 100) * h, (r / 100) * w)
        g.addColorStop(0, 'rgba(0,0,0,1)')
        g.addColorStop(0.7, 'rgba(0,0,0,1)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        c.fillStyle = g
        c.fillRect(0, 0, w, h)
      })
      report(true)
    },
    clearRegion: (g) => {
      wipe((c, w, h) => {
        c.fillStyle = '#000'
        c.beginPath()
        c.ellipse(((g.x + g.w / 2) / 100) * w, ((g.y + g.h / 2) / 100) * h, (g.w / 100) * w * 0.62, (g.h / 100) * h * 0.62, 0, 0, Math.PI * 2)
        c.fill()
      })
      report(true)
    },
  }))

  const point = (e: PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }
  }

  const rub = (to: { x: number; y: number }) => {
    const from = last.current ?? to
    last.current = to
    const { brush: b } = props.current
    wipe((c, w, h) => {
      c.lineCap = 'round'
      c.lineJoin = 'round'
      c.lineWidth = (b / 100) * w * 2
      c.strokeStyle = '#000'
      c.beginPath()
      c.moveTo((from.x / 100) * w, (from.y / 100) * h)
      c.lineTo((to.x / 100) * w + 0.01, (to.y / 100) * h)
      c.stroke()
    })
    props.current.onRub?.(to.x, to.y)
    report()
  }

  return (
    <canvas
      ref={canvas}
      aria-label="Rub the sand away"
      onPointerDown={(e) => {
        if (props.current.disabled) return
        ;(e.target as Element).setPointerCapture?.(e.pointerId)
        last.current = null
        rub(point(e))
      }}
      onPointerMove={(e) => {
        if (props.current.disabled || !(e.buttons & 1 || e.pointerType === 'touch') || last.current === null) return
        rub(point(e))
      }}
      onPointerUp={() => {
        last.current = null
        report(true)
      }}
      onPointerCancel={() => (last.current = null)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', cursor: 'grab', ...style }}
    />
  )
})

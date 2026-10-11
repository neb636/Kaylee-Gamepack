// Splash droplets, rings on the surface and bubbles: a small pool of divs moved by one game loop (like the salon's
// wool particles), so a big belly-flop never re-renders React.
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useGameLoop } from '../../../../../sdk'
import { INK } from '../../puppets/Alpaca'

const POOL = 48

export interface SplashHandle {
  /** A splash where something hit the water; `big` 0..1. */
  splash: (x: number, y: number, big: number) => void
  /** A trail of bubbles rising from a swimmer. */
  bubble: (x: number, y: number) => void
  /** A burst of sparkles (a fish caught). */
  sparkle: (x: number, y: number) => void
}

interface P {
  on: boolean
  kind: 'drop' | 'ring' | 'bubble' | 'spark'
  x: number
  y: number
  vx: number
  vy: number
  t: number
  life: number
  size: number
}

export const Splash = forwardRef<SplashHandle>(function Splash(_, ref) {
  const els = useRef<(HTMLDivElement | null)[]>([])
  const pool = useRef<P[]>(Array.from({ length: POOL }, () => ({ on: false, kind: 'drop', x: 0, y: 0, vx: 0, vy: 0, t: 0, life: 1, size: 10 })))
  const next = useRef(0)

  const spawn = (kind: P['kind'], x: number, y: number, vx: number, vy: number, life: number, size: number) => {
    const k = next.current++ % POOL
    Object.assign(pool.current[k], { on: true, kind, x, y, vx, vy, t: 0, life, size })
    const el = els.current[k]
    if (!el) return
    el.style.display = 'block'
    el.style.width = `${size}px`
    el.style.height = `${kind === 'ring' ? size * 0.3 : size}px`
    el.style.borderRadius = '50%'
    el.style.clipPath = ''
    if (kind === 'drop') {
      el.style.background = '#BFE6FF'
      el.style.border = `3px solid ${INK}`
    } else if (kind === 'ring') {
      el.style.background = 'transparent'
      el.style.border = '6px solid #FFF7F0'
    } else if (kind === 'bubble') {
      el.style.background = 'rgba(255,255,255,.3)'
      el.style.border = '3px solid #FFF7F0'
    } else {
      el.style.background = '#FFC83D'
      el.style.border = 'none'
      el.style.borderRadius = '0'
      el.style.clipPath = 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)'
    }
  }

  useImperativeHandle(ref, () => ({
    splash: (x, y, big) => {
      const n = 6 + Math.round(big * 8)
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6
        const s = 300 + Math.random() * 400 + big * 400
        spawn('drop', x, y, Math.cos(a) * s * 0.7, Math.sin(a) * s, 0.9, 14 + Math.random() * 14 + big * 8)
      }
      spawn('ring', x, y, 0, 0, 0.8, 90 + big * 120)
      if (big > 0.5) spawn('ring', x, y, 0, 0, 1.1, 60 + big * 80)
      for (let i = 0; i < 4; i++) spawn('bubble', x + (Math.random() - 0.5) * 60, y + 40 + Math.random() * 60, 0, -120 - Math.random() * 80, 1.2, 12 + Math.random() * 10)
    },
    bubble: (x, y) => spawn('bubble', x, y, (Math.random() - 0.5) * 30, -140, 1.1, 10 + Math.random() * 10),
    sparkle: (x, y) => {
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2
        spawn('spark', x, y, Math.cos(a) * 160, Math.sin(a) * 160, 0.6, 26 + Math.random() * 12)
      }
    },
  }))

  useGameLoop((dt) => {
    if (dt <= 0) return
    const list = pool.current
    for (let i = 0; i < POOL; i++) {
      const p = list[i]
      if (!p.on) continue
      p.t += dt / p.life
      const el = els.current[i]
      if (p.t >= 1) {
        p.on = false
        if (el) el.style.display = 'none'
        continue
      }
      let scale = 1
      let opacity = 1
      if (p.kind === 'drop') {
        p.vy += 1600 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        scale = 1 - p.t * 0.5
      } else if (p.kind === 'ring') {
        scale = 0.2 + p.t * 1.1
        opacity = 1 - p.t
      } else if (p.kind === 'bubble') {
        p.x += (p.vx + Math.sin(p.t * 12 + i) * 30) * dt
        p.y += p.vy * dt
        opacity = 1 - p.t * 0.8
      } else {
        p.x += p.vx * dt
        p.y += p.vy * dt
        scale = Math.sin(p.t * Math.PI) * 1.1
      }
      if (el) {
        el.style.transform = `translate(${(p.x - p.size / 2).toFixed(1)}px, ${(p.y - (p.kind === 'ring' ? p.size * 0.15 : p.size / 2)).toFixed(1)}px) scale(${scale.toFixed(3)})`
        el.style.opacity = opacity.toFixed(2)
      }
    }
  })

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 16 }}>
      {Array.from({ length: POOL }, (_, i) => (
        <div key={i} ref={(el) => void (els.current[i] = el)} style={{ position: 'absolute', left: 0, top: 0, display: 'none', willChange: 'transform', boxSizing: 'border-box' }} />
      ))}
    </div>
  )
})

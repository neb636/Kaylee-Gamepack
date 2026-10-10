// The wool basket (a mound of stripes that grows with every snipped puff) and the particles that fly into it: snipped
// puffs float down into the basket, brushed fleece sparkles. Particles are a small pool of divs moved by one game loop,
// so a fast haircut never re-renders React.
import { motion } from 'motion/react'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useGameLoop } from '../../../../../sdk'
import { art } from '../../art'
import { INK } from '../../puppets/Alpaca'

/** How many puffs fill the basket to the brim. */
const FULL = 150

export interface BasketHandle {
  add: (color: string) => void
  wobble: () => void
  /** The basket's mouth, where wool lands (stage units). */
  mouth: () => { x: number; y: number }
}

export const Basket = forwardRef<BasketHandle, { cx: number; bottom: number; w: number; onTap: () => void }>(function Basket({ cx, bottom, w, onTap }, ref) {
  const [bands, setBands] = useState<{ color: string; n: number }[]>([])
  const [kick, setKick] = useState(0)
  const pending = useRef<string[]>([])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const h = w * 0.72
  const geo = useRef({ cx, bottom, h })
  geo.current = { cx, bottom, h }

  useImperativeHandle(ref, () => ({
    add: (color) => {
      // Batch the arrivals so a big snip is one re-render, not twenty.
      pending.current.push(color)
      if (timer.current) return
      timer.current = setTimeout(() => {
        timer.current = null
        const add = pending.current
        pending.current = []
        setBands((old) => {
          const next = old.map((b) => ({ ...b }))
          for (const c of add) {
            const top = next[next.length - 1]
            if (top && top.color === c) top.n++
            else next.push({ color: c, n: 1 })
          }
          return next
        })
        setKick((k) => k + 1)
      }, 120)
    },
    wobble: () => setKick((k) => k + 1),
    mouth: () => ({ x: geo.current.cx, y: geo.current.bottom - geo.current.h * 0.82 }),
  }))

  const total = bands.reduce((a, b) => a + b.n, 0)
  const fill = Math.min(1, total / FULL)
  // The mound of wool above the rim: stripes of each alpaca's color, in the order they were clipped.
  const moundH = 20 + fill * w * 0.42
  let acc = 0
  return (
    <motion.button
      aria-label="wool basket"
      onClick={onTap}
      key={kick}
      initial={{ scaleX: 1, scaleY: 1 }}
      animate={kick ? { scaleX: [1, 1.06, 0.98, 1], scaleY: [1, 0.94, 1.03, 1] } : {}}
      transition={{ duration: 0.35 }}
      style={{ position: 'absolute', left: cx - w / 2, top: bottom - h - moundH * 0.9, width: w, height: h + moundH * 0.9, padding: 0, background: 'none', border: 'none', transformOrigin: '50% 100%', zIndex: 6 }}
    >
      {total > 0 && (
        <svg viewBox={`0 0 ${w} ${moundH}`} style={{ position: 'absolute', left: 0, top: 0, width: w, height: moundH, overflow: 'visible' }}>
          <defs>
            <clipPath id="peru-mound">
              <path d={`M${w * 0.1} ${moundH + 20}Q${w * 0.08} ${moundH * 0.15} ${w * 0.5} 0Q${w * 0.92} ${moundH * 0.15} ${w * 0.9} ${moundH + 20}Z`} />
            </clipPath>
          </defs>
          <path d={`M${w * 0.1} ${moundH + 20}Q${w * 0.08} ${moundH * 0.15} ${w * 0.5} 0Q${w * 0.92} ${moundH * 0.15} ${w * 0.9} ${moundH + 20}Z`} fill={INK} transform={`translate(0 -5) scale(1 1)`} stroke={INK} strokeWidth="10" />
          <g clipPath="url(#peru-mound)">
            {bands.map((b, i) => {
              const bh = ((moundH + 20) * b.n) / total
              const y = moundH + 20 - acc - bh
              acc += bh
              return <rect key={i} x="0" y={y} width={w} height={bh + 1} fill={b.color} />
            })}
            {Array.from({ length: 7 }, (_, i) => (
              <circle key={i} cx={w * (0.18 + i * 0.11)} cy={moundH * (0.35 + (i % 2) * 0.25)} r={w * 0.035} fill="#fff" opacity=".35" />
            ))}
          </g>
        </svg>
      )}
      <img src={art.basket} alt="" draggable={false} style={{ position: 'absolute', left: 0, bottom: 0, width: w, height: h, objectFit: 'contain', objectPosition: '50% 100%' }} />
    </motion.button>
  )
})

interface P {
  on: boolean
  kind: 'wool' | 'spark'
  x: number
  y: number
  x0: number
  y0: number
  tx: number
  ty: number
  t: number
  life: number
  size: number
  color: string
  spin: number
}

export interface ParticlesHandle {
  /** A snipped puff floats down into the basket; `land` runs when it arrives. */
  wool: (x: number, y: number, size: number, color: string, to: { x: number; y: number }, land: () => void) => void
  sparkle: (x: number, y: number) => void
}

const POOL = 48

export const Particles = forwardRef<ParticlesHandle>(function Particles(_, ref) {
  const els = useRef<(HTMLDivElement | null)[]>([])
  const pool = useRef<(P & { land?: () => void })[]>(Array.from({ length: POOL }, () => ({ on: false, kind: 'wool', x: 0, y: 0, x0: 0, y0: 0, tx: 0, ty: 0, t: 0, life: 1, size: 20, color: '#fff', spin: 0 })))
  const next = useRef(0)

  const take = () => {
    const list = pool.current
    for (let i = 0; i < POOL; i++) {
      const k = (next.current + i) % POOL
      if (!list[k].on) {
        next.current = k + 1
        return k
      }
    }
    // All busy: reuse the oldest (it lands early).
    const k = next.current % POOL
    list[k].land?.()
    next.current = k + 1
    return k
  }

  useImperativeHandle(ref, () => ({
    wool: (x, y, size, color, to, land) => {
      const k = take()
      const el = els.current[k]
      Object.assign(pool.current[k], { on: true, kind: 'wool', x, y, x0: x, y0: y, tx: to.x + (Math.random() - 0.5) * 60, ty: to.y, t: 0, life: 0.9 + Math.random() * 0.4, size, color, spin: (Math.random() - 0.5) * 4, land })
      if (el) {
        el.style.display = 'block'
        el.style.width = el.style.height = `${size}px`
        el.style.background = color
        el.style.border = `${Math.max(3, size * 0.12)}px solid ${INK}`
        el.style.borderRadius = '50%'
        el.style.clipPath = ''
      }
    },
    sparkle: (x, y) => {
      const k = take()
      const el = els.current[k]
      const a = Math.random() * Math.PI * 2
      Object.assign(pool.current[k], { on: true, kind: 'spark', x, y, x0: x, y0: y, tx: x + Math.cos(a) * 70, ty: y + Math.sin(a) * 70 - 30, t: 0, life: 0.55, size: 26 + Math.random() * 14, color: Math.random() < 0.5 ? '#FFC83D' : '#FFF7F0', spin: (Math.random() - 0.5) * 6, land: undefined })
      if (el) {
        el.style.display = 'block'
        el.style.width = el.style.height = `${pool.current[k].size}px`
        el.style.background = pool.current[k].color
        el.style.border = 'none'
        el.style.borderRadius = '0'
        el.style.clipPath = 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)'
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
        const land = p.land
        p.land = undefined
        land?.()
        continue
      }
      let x: number
      let y: number
      let scale: number
      let opacity = 1
      if (p.kind === 'wool') {
        // A soft arc: up and out a little, then a swaying float down into the basket.
        const q = p.t
        const e = q * q * (3 - 2 * q)
        x = p.x0 + (p.tx - p.x0) * e + Math.sin(q * 9 + i) * 14 * (1 - q)
        y = p.y0 + (p.ty - p.y0) * e - Math.sin(q * Math.PI) * 90
        scale = 1 - q * 0.45
      } else {
        const q = 1 - (1 - p.t) * (1 - p.t)
        x = p.x0 + (p.tx - p.x0) * q
        y = p.y0 + (p.ty - p.y0) * q
        scale = Math.sin(p.t * Math.PI) * 1.1
        opacity = 1 - p.t * 0.6
      }
      if (el) {
        el.style.transform = `translate(${x - p.size / 2}px, ${y - p.size / 2}px) rotate(${p.t * p.spin * 60}deg) scale(${scale})`
        el.style.opacity = String(opacity)
      }
    }
  })

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15 }}>
      {Array.from({ length: POOL }, (_, i) => (
        <div key={i} ref={(el) => void (els.current[i] = el)} style={{ position: 'absolute', left: 0, top: 0, display: 'none', willChange: 'transform', boxSizing: 'border-box' }} />
      ))}
    </div>
  )
})

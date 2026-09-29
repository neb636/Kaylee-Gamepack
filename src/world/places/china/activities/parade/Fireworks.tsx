// Fireworks on a canvas: `bloom(x, y, color)` (coordinates inside the box) sends up a little rocket, then a ring of
// sparks that fall and fade. Gentle: a handful of particles, no flashes.
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useElementSize, useGameLoop } from '../../../../../sdk'

export interface FireworksHandle {
  bloom: (x: number, y: number, color: string) => void
}
interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  color: string
  size: number
}
interface Rocket {
  x: number
  tx: number
  ty: number
  fromY: number
  t: number
  color: string
}

export const Fireworks = forwardRef<FireworksHandle, { onBoom?: () => void }>(function Fireworks({ onBoom }, ref) {
  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const { width: W, height: H } = useElementSize(box)
  const sparks = useRef<Spark[]>([])
  const rockets = useRef<Rocket[]>([])
  const boom = useRef(onBoom)
  boom.current = onBoom
  const dims = useRef({ W: 0, H: 0 })
  dims.current = { W, H }

  useImperativeHandle(ref, () => ({
    bloom: (x, y, color) => rockets.current.push({ x, tx: x, ty: y, fromY: dims.current.H, t: 0, color }),
  }))

  useGameLoop((dt) => {
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx || dims.current.W === 0) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, c.width, c.height)
    const k = c.width / dims.current.W
    ctx.setTransform(k, 0, 0, k, 0, 0)
    for (const r of rockets.current) {
      r.t += dt / 0.32
      const e = 1 - Math.pow(1 - Math.min(1, r.t), 2)
      const y = r.fromY + (r.ty - r.fromY) * e
      ctx.fillStyle = '#FFE9A8'
      ctx.beginPath()
      ctx.arc(r.x, y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 0.4
      ctx.beginPath()
      ctx.arc(r.x, y + 14, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      if (r.t >= 1) {
        const n = 28
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2
          const sp = (230 + Math.random() * 40) * (i % 2 === 0 ? 1 : 0.6)
          sparks.current.push({ x: r.tx, y: r.ty, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 1.3 + Math.random() * 0.4, color: i % 5 === 0 ? '#FFE9A8' : r.color, size: 6 + Math.random() * 4 })
        }
        boom.current?.()
      }
    }
    rockets.current = rockets.current.filter((r) => r.t < 1)
    for (const s of sparks.current) {
      s.life += dt
      s.vy += 150 * dt
      s.vx *= 1 - dt * 1.4
      s.vy *= 1 - dt * 1.4
      s.x += s.vx * dt
      s.y += s.vy * dt
      const a = Math.max(0, 1 - s.life / s.max)
      ctx.globalAlpha = a
      ctx.fillStyle = s.color
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size * (0.4 + a * 0.6), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    sparks.current = sparks.current.filter((s) => s.life < s.max)
  })

  const dpr = Math.min(2, typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1)
  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1500 }}>
      <canvas ref={canvas} width={Math.max(1, Math.round(W * dpr))} height={Math.max(1, Math.round(H * dpr))} style={{ width: '100%', height: '100%' }} />
    </div>
  )
})

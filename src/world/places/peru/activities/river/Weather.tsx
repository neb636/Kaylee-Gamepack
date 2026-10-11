// The rain cloud she squeezes (a squishy face that darkens, scrunches up and puffs out its cheeks while it rains) and
// the rain itself: a small pool of drop and splash divs moved by one game loop, so a downpour never re-renders React.
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useGameLoop } from '../../../../../sdk'
import { INK } from '../../puppets/Alpaca'

const LIGHT = [233, 228, 244]
const DARK = [140, 132, 176]
const mix = (k: number) => `rgb(${LIGHT.map((c, i) => Math.round(c + (DARK[i] - c) * k)).join(',')})`

export interface CloudHandle {
  /** Draw the cloud for this frame: where it is, how hard it's squeezed (0..1+), wobble time, whether she holds it. */
  draw: (x: number, y: number, squeeze: number, t: number, held: boolean, flash: boolean) => void
}

/** The cloud's outline, drawn around (0,0) in a 340-wide box. */
const CLOUD = 'M-150 40 C-178 40 -184 0 -158 -14 C-170 -52 -130 -78 -96 -62 C-88 -104 -32 -116 -6 -86 C16 -122 82 -112 92 -66 C128 -84 172 -54 158 -16 C186 -6 182 40 150 40Z'

export const Cloud = forwardRef<CloudHandle, { w: number; glow: boolean }>(function Cloud({ w, glow }, ref) {
  const root = useRef<HTMLDivElement>(null)
  const body = useRef<SVGPathElement>(null)
  const eyesOpen = useRef<SVGGElement>(null)
  const eyesShut = useRef<SVGGElement>(null)
  const mouth = useRef<SVGPathElement>(null)
  const cheeks = useRef<SVGGElement>(null)
  const bolt = useRef<SVGPathElement>(null)
  const last = useRef({ shut: false, color: '', mouth: '' })

  useImperativeHandle(ref, () => ({
    draw: (x, y, squeeze, t, held, flash) => {
      const s = Math.min(1.3, squeeze)
      // Squished flat while she squeezes, with a quick throb; a lazy float when left alone.
      const throb = Math.sin(t * 15) * 0.035 * s
      const sx = 1 + s * 0.1 + throb + (held ? 0.04 : 0)
      const sy = 1 - s * 0.14 - throb + (held ? -0.03 : 0)
      const bob = held ? 0 : Math.sin(t * 1.4) * 6
      if (root.current) root.current.style.transform = `translate(${(x - w / 2).toFixed(1)}px, ${(y - w * 0.36 + bob).toFixed(1)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`
      const L = last.current
      const color = mix(Math.min(1, s))
      if (color !== L.color && body.current) {
        L.color = color
        body.current.setAttribute('fill', color)
      }
      const shut = s > 0.55
      if (shut !== L.shut) {
        L.shut = shut
        if (eyesOpen.current) eyesOpen.current.style.display = shut ? 'none' : ''
        if (eyesShut.current) eyesShut.current.style.display = shut ? '' : 'none'
      }
      // The mouth: a smile at rest, a round "ooo" while it rains.
      const m = s > 0.1 ? `M-14 18 Q0 ${(8 - s * 10).toFixed(1)} 14 18 Q0 ${(28 + s * 12).toFixed(1)} -14 18Z` : 'M-16 14 Q0 28 16 14'
      if (m !== L.mouth && mouth.current) {
        L.mouth = m
        mouth.current.setAttribute('d', m)
        mouth.current.setAttribute('fill', s > 0.1 ? '#C93F72' : 'none')
      }
      // Puffed cheeks while squeezing.
      if (cheeks.current) cheeks.current.setAttribute('transform', `scale(${(1 + s * 0.35).toFixed(3)})`)
      if (bolt.current) bolt.current.style.display = flash ? '' : 'none'
    },
  }))

  return (
    <div
      ref={root}
      data-cloud
      aria-label="rain cloud"
      className={glow ? 'world-glow' : undefined}
      style={{ position: 'absolute', left: 0, top: 0, width: w, height: w * 0.62, zIndex: 12, touchAction: 'none', cursor: 'grab', borderRadius: '45%', transformOrigin: '50% 60%', willChange: 'transform' }}
    >
      <svg viewBox="-190 -130 380 236" style={{ width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
        <path ref={bolt} d="M-10 46 L-34 96 L-8 92 L-24 140 L26 76 L0 80 L16 46Z" fill="#FFC83D" stroke={INK} strokeWidth="6" strokeLinejoin="round" style={{ display: 'none' }} />
        <path ref={body} d={CLOUD} fill={mix(0)} stroke={INK} strokeWidth="8" strokeLinejoin="round" />
        <path d="M-120 -30 C-112 -50 -92 -56 -78 -50 M-10 -84 C6 -98 30 -98 44 -84" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity=".7" />
        <g ref={eyesOpen}>
          <ellipse cx="-34" cy="-10" rx="11" ry="15" fill={INK} />
          <ellipse cx="34" cy="-10" rx="11" ry="15" fill={INK} />
          <circle cx="-30" cy="-16" r="4.5" fill="#fff" />
          <circle cx="38" cy="-16" r="4.5" fill="#fff" />
        </g>
        <g ref={eyesShut} style={{ display: 'none' }}>
          <path d="M-48 -18 L-26 -8 L-48 2 M48 -18 L26 -8 L48 2" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g ref={cheeks}>
          <ellipse cx="-62" cy="12" rx="15" ry="9" fill="#FF8FB8" opacity=".85" />
          <ellipse cx="62" cy="12" rx="15" ry="9" fill="#FF8FB8" opacity=".85" />
        </g>
        <path ref={mouth} d="M-16 14 Q0 28 16 14" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
})

interface Drop {
  on: boolean
  splash: boolean
  x: number
  y: number
  vy: number
  end: number
  t: number
}

export interface RainHandle {
  /** One raindrop falling from (x, y) until it hits something at `end`. */
  drop: (x: number, y: number, end: number) => void
  /** How many drops are falling now. */
  count: () => number
}

const POOL = 72

export const Rain = forwardRef<RainHandle>(function Rain(_, ref) {
  const els = useRef<(HTMLDivElement | null)[]>([])
  const pool = useRef<Drop[]>(Array.from({ length: POOL }, () => ({ on: false, splash: false, x: 0, y: 0, vy: 0, end: 0, t: 0 })))
  const next = useRef(0)
  const live = useRef(0)

  useImperativeHandle(ref, () => ({
    drop: (x, y, end) => {
      const list = pool.current
      let k = -1
      for (let i = 0; i < POOL; i++) {
        const j = (next.current + i) % POOL
        if (!list[j].on) {
          k = j
          break
        }
      }
      if (k < 0) return
      next.current = k + 1
      Object.assign(list[k], { on: true, splash: false, x, y, vy: 900 + Math.random() * 300, end, t: 0 })
      const el = els.current[k]
      if (el) {
        el.className = 'peru-drop'
        el.style.display = 'block'
      }
      live.current++
    },
    count: () => live.current,
  }))

  useGameLoop((dt) => {
    if (dt <= 0) return
    const list = pool.current
    for (let i = 0; i < POOL; i++) {
      const d = list[i]
      if (!d.on) continue
      const el = els.current[i]
      if (!d.splash) {
        d.vy += 1600 * dt
        d.y += d.vy * dt
        if (d.y >= d.end) {
          // Hit something: a little splash crown.
          d.splash = true
          d.y = d.end
          d.t = 0
          if (el) el.className = 'peru-splash'
        }
      } else {
        d.t += dt / 0.28
        if (d.t >= 1) {
          d.on = false
          live.current--
          if (el) el.style.display = 'none'
          continue
        }
      }
      if (el) {
        el.style.transform = d.splash ? `translate(${(d.x - 18).toFixed(1)}px, ${(d.y - 16).toFixed(1)}px) scale(${(0.6 + d.t * 0.7).toFixed(2)})` : `translate(${(d.x - 7).toFixed(1)}px, ${(d.y - 24).toFixed(1)}px)`
        el.style.opacity = d.splash ? String(1 - d.t) : '1'
      }
    }
  })

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 11 }}>
      {Array.from({ length: POOL }, (_, i) => (
        <div key={i} ref={(el) => void (els.current[i] = el)} style={{ position: 'absolute', left: 0, top: 0, display: 'none', willChange: 'transform' }} />
      ))}
    </div>
  )
})

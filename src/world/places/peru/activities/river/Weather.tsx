// The rain cloud she squeezes: a squishy puppet made of puffs under one outline. Every puff jiggles on its own spring,
// so the cloud wobbles like jelly when she drags it, leans into the way it's going, bulges out between her fingers
// while she squeezes it (darkening, eyes scrunched, cheeks puffed, an "ooo" mouth) and boings back when she lets go.
// It blinks and its eyes follow where it's going. The rain itself: a small pool of drop and splash divs moved by one
// game loop, so a downpour never re-renders React.
import { forwardRef, useId, useImperativeHandle, useRef } from 'react'
import { spring, useGameLoop } from '../../../../../sdk'
import { inkPass } from '../../../../kit/ink'
import { INK } from '../../puppets/Alpaca'

const LIGHT = [238, 234, 250]
const DARK = [132, 126, 172]
const SHADE_LIGHT = [210, 204, 236]
const SHADE_DARK = [104, 98, 146]
const rgb = (a: number[], b: number[], k: number) => `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * k)).join(',')})`

export interface CloudHandle {
  /** Draw the cloud for this frame: where it is, how hard it's squeezed (0..1+), wobble time, whether she holds it. */
  draw: (x: number, y: number, squeeze: number, t: number, held: boolean, flash: boolean) => void
}

/** The puffs, around (0,0) in a 380-wide box: [x, y, r, how floppy (0..1)]. The flat-bottomed base comes first. */
const PUFFS: [number, number, number, number][] = [
  [-128, 6, 32, 0.9],
  [-80, -24, 42, 0.7],
  [-26, -50, 48, 0.5],
  [42, -56, 50, 0.45],
  [98, -28, 42, 0.65],
  [140, 6, 30, 0.9],
]
/** The flat, rounded base all the puffs sit on. */
const BASE = { x: -156, y: -26, w: 312, h: 70, r: 32 }

export const Cloud = forwardRef<CloudHandle, { w: number; glow: boolean }>(function Cloud({ w, glow }, ref) {
  const clip = `cloud-${useId().replace(/:/g, '')}`
  const root = useRef<HTMLDivElement>(null)
  const body = useRef<SVGGElement>(null)
  const inkPuffs = useRef<(SVGCircleElement | null)[]>([])
  const puffs = useRef<(SVGCircleElement | null)[]>([])
  const shades = useRef<(SVGCircleElement | null)[]>([])
  const shines = useRef<(SVGPathElement | null)[]>([])
  const base = useRef<SVGRectElement>(null)
  const baseShade = useRef<SVGRectElement>(null)
  const face = useRef<SVGGElement>(null)
  const eyesOpen = useRef<SVGGElement>(null)
  const pupils = useRef<SVGGElement>(null)
  const eyesShut = useRef<SVGGElement>(null)
  const mouth = useRef<SVGPathElement>(null)
  const cheeks = useRef<SVGGElement>(null)
  const bolt = useRef<SVGPathElement>(null)
  const st = useRef({
    last: -1,
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,
    sx: spring(260, 9),
    sy: spring(260, 9),
    lean: spring(120, 10),
    puffs: PUFFS.map(() => ({ x: spring(180, 7), y: spring(180, 7) })),
    blinkAt: 2,
    shut: false,
    color: '',
    mouth: '',
  }).current

  useImperativeHandle(ref, () => ({
    draw: (x, y, squeeze, t, held, flash) => {
      const dt = st.last < 0 ? 0 : Math.min(0.05, Math.max(0, t - st.last))
      st.last = t
      // How fast it's moving (smoothed), for the lean, the jiggle and where the eyes look.
      if (dt > 0) {
        st.vx += ((x - st.px) / dt - st.vx) * Math.min(1, dt * 10)
        st.vy += ((y - st.py) / dt - st.vy) * Math.min(1, dt * 10)
      }
      st.px = x
      st.py = y
      const s = Math.min(1.3, squeeze)

      // The whole cloud: flattened and widened while squeezed with a quick throb, a lazy float when left alone. The
      // springs overshoot when she lets go, so it boings back into shape.
      const throb = Math.sin(t * 15) * 0.035 * s
      const breath = Math.sin(t * 1.6) * 0.015
      const sx = st.sx.step(1 + s * 0.12 + throb + breath + (held ? 0.03 : 0), dt) || 1
      const sy = st.sy.step(1 - s * 0.16 - throb - breath + (held ? -0.03 : 0), dt) || 1
      const lean = st.lean.step(Math.max(-12, Math.min(12, st.vx * 0.012)), dt)
      const bob = held ? 0 : Math.sin(t * 1.4) * 6
      if (root.current) root.current.style.transform = `translate(${(x - w / 2).toFixed(1)}px, ${(y - w * 0.36 + bob).toFixed(1)}px)`
      if (body.current) body.current.setAttribute('transform', `rotate(${lean.toFixed(2)} 0 40) translate(0 40) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(0 -40)`)

      // Each puff: drags behind the motion (floppier puffs more), breathes on its own beat, and bulges out sideways
      // between her fingers while she squeezes.
      const dragX = Math.max(-40, Math.min(40, -st.vx * 0.03))
      const dragY = Math.max(-30, Math.min(30, -st.vy * 0.025))
      PUFFS.forEach(([px, py, r, flop], i) => {
        const sp = st.puffs[i]
        const ox = sp.x.step(dragX * flop + px * s * 0.1, dt)
        const oy = sp.y.step(dragY * flop + s * 10 * flop, dt)
        const rr = r * (1 + Math.sin(t * 2.1 + i * 1.7) * 0.03 + s * 0.06 * (1 - flop))
        const cx = (px + ox).toFixed(1)
        const cy = (py + oy).toFixed(1)
        for (const el of [inkPuffs.current[i], puffs.current[i], shades.current[i]]) {
          if (!el) continue
          el.setAttribute('cx', cx)
          el.setAttribute('cy', cy)
          el.setAttribute('r', rr.toFixed(1))
        }
        shines.current[i]?.setAttribute('transform', `translate(${cx} ${cy}) scale(${(rr / 50).toFixed(3)})`)
      })
      // The face rides along with the middle puffs.
      const fo = st.puffs[3]
      face.current?.setAttribute('transform', `translate(${(fo.x.x * 0.6).toFixed(1)} ${(fo.y.x * 0.4 + 6).toFixed(1)})`)

      const color = rgb(LIGHT, DARK, Math.min(1, s))
      if (color !== st.color) {
        st.color = color
        const shade = rgb(SHADE_LIGHT, SHADE_DARK, Math.min(1, s))
        for (const el of puffs.current) el?.setAttribute('fill', color)
        base.current?.setAttribute('fill', color)
        for (const el of shades.current) el?.setAttribute('fill', shade)
        baseShade.current?.setAttribute('fill', shade)
      }

      // Eyes: scrunched shut while it rains hard, otherwise blinking now and then and looking where it's going.
      const blinking = t > st.blinkAt && t < st.blinkAt + 0.13
      if (t > st.blinkAt + 0.13) st.blinkAt = t + 2 + Math.random() * 3
      const shut = s > 0.55
      if (shut !== st.shut) {
        st.shut = shut
        if (eyesOpen.current) eyesOpen.current.style.display = shut ? 'none' : ''
        if (eyesShut.current) eyesShut.current.style.display = shut ? '' : 'none'
      }
      eyesOpen.current?.setAttribute('transform', `translate(0 -10) scale(1 ${blinking ? 0.1 : 1}) translate(0 10)`)
      const lx = Math.max(-6, Math.min(6, st.vx * 0.02))
      const ly = Math.max(-4, Math.min(5, st.vy * 0.02))
      pupils.current?.setAttribute('transform', `translate(${lx.toFixed(1)} ${ly.toFixed(1)})`)

      // The mouth: a smile at rest, a round "ooo" while it rains.
      const m = s > 0.1 ? `M-14 18 Q0 ${(8 - s * 10).toFixed(1)} 14 18 Q0 ${(28 + s * 12).toFixed(1)} -14 18Z` : 'M-16 14 Q0 28 16 14'
      if (m !== st.mouth && mouth.current) {
        st.mouth = m
        mouth.current.setAttribute('d', m)
        mouth.current.setAttribute('fill', s > 0.1 ? '#C93F72' : 'none')
      }
      // Puffed cheeks while squeezing.
      cheeks.current?.setAttribute('transform', `scale(${(1 + s * 0.35).toFixed(3)})`)
      if (bolt.current) bolt.current.style.display = flash ? '' : 'none'
    },
  }))

  return (
    <div
      ref={root}
      data-cloud
      aria-label="rain cloud"
      className={glow ? 'world-glow' : undefined}
      style={{ position: 'absolute', left: 0, top: 0, width: w, height: w * 0.62, zIndex: 12, touchAction: 'none', cursor: 'grab', borderRadius: '45%', willChange: 'transform' }}
    >
      <svg viewBox="-190 -130 380 236" style={{ width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
        <defs>
          <clipPath id={clip}>
            {PUFFS.map(([x, y, r], i) => (
              <circle key={i} ref={(el) => void (shades.current[i] = el)} cx={x} cy={y} r={r} />
            ))}
            <rect x={BASE.x} y={BASE.y} width={BASE.w} height={BASE.h} rx={BASE.r} />
          </clipPath>
        </defs>
        <path ref={bolt} d="M-10 46 L-34 96 L-8 92 L-24 140 L26 76 L0 80 L16 46Z" fill="#FFC83D" stroke={INK} strokeWidth="6" strokeLinejoin="round" style={{ display: 'none' }} />
        <g ref={body}>
          {/* One outline around every puff and the base (see kit/ink.ts), so it reads as one fluffy cloud. */}
          <g {...inkPass(4.5, INK)}>
            {PUFFS.map(([x, y, r], i) => (
              <circle key={i} ref={(el) => void (inkPuffs.current[i] = el)} cx={x} cy={y} r={r} />
            ))}
            <rect x={BASE.x} y={BASE.y} width={BASE.w} height={BASE.h} rx={BASE.r} />
          </g>
          {PUFFS.map(([x, y, r], i) => (
            <circle key={i} ref={(el) => void (puffs.current[i] = el)} cx={x} cy={y} r={r} fill={`rgb(${LIGHT.join(',')})`} />
          ))}
          <rect ref={base} x={BASE.x} y={BASE.y} width={BASE.w} height={BASE.h} rx={BASE.r} fill={`rgb(${LIGHT.join(',')})`} />
          {/* A soft shadow along its belly, and a cloud-shaped shade where the puffs overlap. */}
          <g clipPath={`url(#${clip})`}>
            <rect ref={baseShade} x={BASE.x - 20} y={18} width={BASE.w + 40} height={60} fill={`rgb(${SHADE_LIGHT.join(',')})`} />
          </g>
          {/* A shine on every puff (drawn for a 50-unit puff, scaled to each one). */}
          {PUFFS.map((_, i) => (
            <path key={i} ref={(el) => void (shines.current[i] = el)} d="M-30 -22 C-24 -34 -12 -40 0 -41" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity={i === 0 || i === PUFFS.length - 1 ? 0 : 0.85} />
          ))}
          <g ref={face}>
            <g ref={eyesOpen}>
              <ellipse cx="-34" cy="-10" rx="12" ry="16" fill={INK} />
              <ellipse cx="34" cy="-10" rx="12" ry="16" fill={INK} />
              <g ref={pupils}>
                <circle cx="-29" cy="-17" r="5" fill="#fff" />
                <circle cx="39" cy="-17" r="5" fill="#fff" />
                <circle cx="-37" cy="-3" r="2.2" fill="#fff" />
                <circle cx="31" cy="-3" r="2.2" fill="#fff" />
              </g>
            </g>
            <g ref={eyesShut} style={{ display: 'none' }}>
              <path d="M-48 -18 L-26 -8 L-48 2 M48 -18 L26 -8 L48 2" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <g ref={cheeks}>
              <ellipse cx="-62" cy="12" rx="15" ry="9" fill="#FF8FB8" opacity=".85" />
              <ellipse cx="62" cy="12" rx="15" ry="9" fill="#FF8FB8" opacity=".85" />
            </g>
            <path ref={mouth} d="M-16 14 Q0 28 16 14" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
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

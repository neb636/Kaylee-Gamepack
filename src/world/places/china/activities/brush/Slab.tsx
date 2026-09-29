// The stone slab where Kaylee writes with a water brush. Glowing guides show one stroke at a time; her finger leaves a
// wet, dark-grey stroke (perfect-freehand). The hit test is forgiving: a fat corridor around the stroke, either
// direction, and mostly covering it counts. After a few misses the brush finishes the stroke for her (no failing).
import { getStroke } from 'perfect-freehand'
import { motion } from 'motion/react'
import { useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { sounds } from '../../../../../sdk'
import { coverage, sample, stayedNear, type Char, type Pt } from './chars'

const WATER = '#4d5a66'
const RADIUS = 14 // corridor half-width, in grid units (the character is 100 wide)
const VB = { x: -4, y: -4, s: 108 }

function outline(points: Pt[]): string {
  const stroke = getStroke(
    points.map((p) => [p.x, p.y]),
    { size: 7, thinning: 0.35, smoothing: 0.6, streamline: 0.5, simulatePressure: true },
  )
  if (stroke.length < 3) return ''
  let d = `M${stroke[0][0].toFixed(1)} ${stroke[0][1].toFixed(1)}`
  for (let i = 0; i < stroke.length; i++) {
    const [x0, y0] = stroke[i]
    const [x1, y1] = stroke[(i + 1) % stroke.length]
    d += ` Q${x0.toFixed(1)} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`
  }
  return d + ' Z'
}

export function Slab({
  char,
  size,
  fading,
  locked,
  brushImg,
  onStroke,
  onFail,
}: {
  char: Char
  size: number
  fading: boolean
  locked: boolean
  /** The magic brush picture: it waits at the start dot and follows her finger. */
  brushImg: string
  /** Called when stroke `index` (0-based) is accepted. */
  onStroke: (index: number) => void
  /** Called after a stroke didn't count; `n` is how many misses in a row. */
  onFail: (n: number) => void
}) {
  const svg = useRef<SVGSVGElement>(null)
  const finger = useRef<Pt[]>([])
  const active = useRef(false)
  const misses = useRef(0)
  const doneRef = useRef(0)
  const [done, setDone] = useState(0)
  const [wet, setWet] = useState('')
  const [drawing, setDrawing] = useState(false)
  const follow = useRef<HTMLImageElement>(null)
  const bw = size * 0.21
  const [ghost, setGhost] = useState<{ d: string; n: number } | null>(null)
  const samples = useMemo(() => char.strokes.map((s) => sample(s)), [char])

  const local = (e: RPointerEvent): Pt => {
    const r = svg.current!.getBoundingClientRect()
    return { x: VB.x + ((e.clientX - r.left) / r.width) * VB.s, y: VB.y + ((e.clientY - r.top) / r.height) * VB.s }
  }

  const place = (p: Pt) => {
    if (!follow.current) return
    const x = ((p.x - VB.x) / VB.s) * size - bw * 0.14
    const y = ((p.y - VB.y) / VB.s) * size - bw * 0.9
    follow.current.style.transform = `translate(${x}px, ${y}px)`
  }

  const accept = () => {
    const i = doneRef.current
    doneRef.current = i + 1
    misses.current = 0
    active.current = false
    finger.current = []
    setWet('')
    setDrawing(false)
    setDone(i + 1)
    sounds.note(Math.min(10, i * 2 + 2))
    onStroke(i)
  }

  const judge = (final: boolean) => {
    const i = doneRef.current
    if (i >= char.strokes.length) return
    const s = samples[i]
    const cov = coverage(s, finger.current, RADIUS)
    const near = stayedNear(s, finger.current, RADIUS * 1.5)
    if (!final) {
      if (cov >= 0.92 && near >= 0.6) accept()
      return
    }
    if (cov >= 0.75 && near >= 0.55) return accept()
    // Not quite: the wet line fades away and she tries again.
    const moved = finger.current.length > 3
    if (moved) setGhost({ d: wet, n: Date.now() })
    active.current = false
    finger.current = []
    setWet('')
    setDrawing(false)
    if (!moved) return
    misses.current++
    sounds.oops()
    if (misses.current >= 4) {
      // The brush finishes it for her.
      accept()
      return
    }
    onFail(misses.current)
  }

  const down = (e: RPointerEvent) => {
    if (locked || doneRef.current >= char.strokes.length) return
    e.currentTarget.setPointerCapture(e.pointerId)
    active.current = true
    finger.current = [local(e)]
    setDrawing(true)
    place(finger.current[0])
    setWet(outline([...finger.current, { ...finger.current[0], x: finger.current[0].x + 0.01 }]))
  }
  const move = (e: RPointerEvent) => {
    if (!active.current) return
    const p = local(e)
    const last = finger.current[finger.current.length - 1]
    if (Math.hypot(p.x - last.x, p.y - last.y) < 0.8) return
    finger.current.push(p)
    place(p)
    setWet(outline(finger.current))
    judge(false)
  }
  const up = () => {
    if (!active.current) return
    judge(true)
  }

  const cur = done < char.strokes.length && !locked ? char.strokes[done] : null
  const start = cur ? samples[done][0] : null

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.07,
        position: 'relative',
        background: 'radial-gradient(circle at 35% 25%, #d9d3cc 0%, #bdb6ae 55%, #a39c95 100%)',
        border: `${Math.max(5, size * 0.02)}px solid #8c857e`,
        boxSizing: 'border-box',
        boxShadow: '0 10px 0 #7a746e, 0 18px 28px rgba(60,40,30,0.35), inset 0 0 40px rgba(255,255,255,0.25)',
        overflow: 'visible',
      }}
    >
      {/* stone specks */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: size * 0.05, overflow: 'hidden', backgroundImage: 'radial-gradient(rgba(90,80,75,0.22) 1.4px, transparent 1.6px), radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1.2px)', backgroundSize: '23px 19px, 31px 27px', backgroundPosition: '0 0, 11px 7px' }} />
      <svg
        ref={svg}
        viewBox={`${VB.x} ${VB.y} ${VB.s} ${VB.s}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', display: 'block' }}
      >
        {/* strokes still to come, faint */}
        {char.strokes.map((d, i) =>
          i > done || (i === done && locked) ? <path key={i} d={d} fill="none" stroke="#7e7a8a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.2" /> : null,
        )}
        {/* the glowing guide for the next stroke */}
        {cur && start && (
          <g key={done}>
            <path d={cur} fill="none" stroke="#FF6FB5" strokeWidth={RADIUS * 0.8} strokeLinecap="round" strokeLinejoin="round" opacity="0.32" />
            <motion.path
              d={cur}
              fill="none"
              stroke="#fff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeDasharray="2 8"
              animate={{ strokeDashoffset: [0, -20] }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
            />
            <motion.circle cx={start.x} cy={start.y} r="6.5" fill="#FF4FA0" stroke="#fff" strokeWidth="2.5" animate={{ scale: [1, 1.35, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
            <circle r="4.2" fill="#fff" stroke="#FF4FA0" strokeWidth="2">
              <animateMotion dur="2.2s" repeatCount="indefinite" path={cur} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
            </circle>
          </g>
        )}
        {/* the written water strokes */}
        <motion.g animate={{ opacity: fading ? 0 : 1 }} transition={{ duration: fading ? 1.5 : 0.2 }}>
          {char.strokes.slice(0, done).map((d, i) => (
            <g key={i}>
              <motion.path d={d} fill="none" stroke="#39424c" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.32" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />
              <motion.path d={d} fill="none" stroke={WATER} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />
              <path d={d} fill="none" stroke="#b8c6d3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" transform="translate(-1.4 -1.4)" />
            </g>
          ))}
        </motion.g>
        {/* the wet line under her finger */}
        {wet && <path d={wet} fill={WATER} opacity="0.85" />}
        {ghost && <motion.path key={ghost.n} d={ghost.d} fill={WATER} initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} />}
      </svg>
      {/* the magic brush: waits at the start dot, then follows her finger */}
      {cur && start && !drawing && (
        <motion.img
          key={`rest-${done}`}
          src={brushImg}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -size * 0.02, 0], rotate: [0, -5, 0] }}
          transition={{ opacity: { duration: 0.3 }, y: { repeat: Infinity, duration: 1.4 }, rotate: { repeat: Infinity, duration: 1.4 } }}
          style={{ position: 'absolute', width: bw, left: ((start.x - VB.x) / VB.s) * size - bw * 0.14, top: ((start.y - VB.y) / VB.s) * size - bw * 0.9, pointerEvents: 'none', transformOrigin: '14% 90%' }}
        />
      )}
      <img ref={follow} src={brushImg} alt="" style={{ position: 'absolute', left: 0, top: 0, width: bw, pointerEvents: 'none', display: drawing ? 'block' : 'none' }} />
    </div>
  )
}

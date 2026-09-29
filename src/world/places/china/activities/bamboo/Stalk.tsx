// A bamboo shoot drawn in code: stacked segments with node rings and a leafy crown. Each new segment pops out of the one
// below with a spring and pushes the crown up. The segments are nested, so the whole stalk can bend (each joint turns
// a little) for the payoff. The stalk is a real <button>: swipe up on it (or just tap) and `onAct` fires.
import { animate, motion } from 'motion/react'
import { forwardRef, useImperativeHandle, useRef, type CSSProperties } from 'react'
import { usePointerDrag } from '../../../../../sdk'
import { INK } from '../../puppets/ink'

const JADE = '#9CD98C'
const JADE_DARK = '#6DBB73'
const LEAF = '#7CCBA2'
const LEAF_LIGHT = '#A9E4B4'
const DIRT = '#C99B70'
const SW = 4

export interface StalkHandle {
  /** A gentle no-worries wobble. */
  wiggle: () => void
  /** A little happy bounce. */
  bounce: () => void
}

export interface StalkProps {
  segs: number
  seg: number
  colW: number
  /** Total room above the ground, in segments (sets the button's height). */
  room: number
  /** Position of the column's center and the ground line, in px inside the field. */
  x: number
  ground: number
  /** Degrees each joint turns (bends the stalk to the right). */
  bend?: number
  glow?: boolean
  dim?: boolean
  label: string
  /** Called on a swipe up or a tap. */
  onAct: () => void
  /** Smallest tappable height in px (even for a tiny sprout). */
  minHit?: number
  /** Number markers beside the stalk up to this many segments (round 1). */
  markers?: number
  hidden?: boolean
  disabled?: boolean
  style?: CSSProperties
}

/** Where a point `dist` px along a (bent) stalk is, from its base: x to the right, y up. Used to put Bao Bao on it. */
export function stalkPoint(seg: number, bend: number, dist: number) {
  let x = 0
  let y = 0
  let left = dist
  for (let j = 0; left > 0; j++) {
    const a = (bend * j * Math.PI) / 180
    const d = Math.min(seg, left)
    x += Math.sin(a) * d
    y += Math.cos(a) * d
    left -= d
    if (j > 40) break
  }
  const jj = Math.max(0, Math.ceil(dist / seg) - 1)
  return { x, y, angle: bend * jj }
}

export const Stalk = forwardRef<StalkHandle, StalkProps>(function Stalk({ segs, seg, colW, room, x, ground, bend = 0, glow, dim, label, onAct, markers, hidden, disabled, style, minHit = 160 }, ref) {
  const btn = useRef<HTMLButtonElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const fired = useRef(false)
  const H = (room + 0.6) * seg
  // The tappable box is only as tall as the stalk right now (plus a margin), so empty sky above a short stalk isn't hit.
  const Hb = Math.min(H, Math.max(minHit, (segs + 1.5) * seg + seg * 0.2))
  const base = H - seg * 0.18
  const w = Math.min(colW * 0.62, seg * 1.0)

  useImperativeHandle(ref, () => ({
    wiggle: () => void animate(inner.current!, { rotate: [0, -5, 5, -3, 3, 0] }, { duration: 0.5 }),
    bounce: () => void animate(inner.current!, { scaleY: [1, 0.94, 1.05, 1], scaleX: [1, 1.04, 0.97, 1] }, { duration: 0.5 }),
  }))

  usePointerDrag(btn, {
    disabled,
    threshold: 10,
    onStart: () => (fired.current = false),
    onMove: ({ dy, dx }) => {
      const up = Math.max(0, -dy)
      if (inner.current) inner.current.style.transform = `scaleY(${1 + Math.min(up, 90) * 0.0007})`
      if (!fired.current && up >= 40 && up > Math.abs(dx) * 0.8) {
        fired.current = true
        onAct()
      }
    },
    onEnd: () => {
      if (inner.current) inner.current.style.transform = ''
    },
    onCancel: () => {
      if (inner.current) inner.current.style.transform = ''
    },
    onTap: () => onAct(),
  })

  // One nested group per segment: each joint turns by `bend`, and the crown sits at the top of the last one.
  const chain = (i: number): React.ReactNode =>
    i >= segs ? (
      <motion.g key={`crown${segs}`} initial={{ y: seg }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 11 }}>
        <Crown seg={seg} big={segs > 0} />
      </motion.g>
    ) : (
      <g key={i}>
        <motion.g initial={{ scaleY: 0.2 }} animate={{ scaleY: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 9 }} style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
          <Segment seg={seg} w={w} first={i === 0} />
        </motion.g>
        <g transform={`translate(0 ${-seg}) rotate(${bend})`}>{chain(i + 1)}</g>
      </g>
    )

  const marks = markers ? Array.from({ length: markers }, (_, i) => i + 1) : []
  return (
    <button
      ref={btn}
      aria-label={label}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onAct()}
      style={{
        position: 'absolute',
        left: x - colW / 2,
        top: ground + seg * 0.18 - Hb,
        width: colW,
        height: Hb,
        overflow: 'visible',
        padding: 0,
        border: 'none',
        borderRadius: 40,
        background: 'transparent',
        opacity: hidden ? 0 : dim ? 0.45 : 1,
        pointerEvents: hidden ? 'none' : undefined,
        transition: 'opacity .5s',
        touchAction: 'none',
        WebkitTapHighlightColor: 'transparent',
        zIndex: 3,
        ...style,
      }}
    >
      <div ref={inner} style={{ position: 'absolute', left: 0, bottom: 0, width: colW, height: H, transformOrigin: '50% 90%', transition: 'transform .25s', animation: glow ? 'bamboo-glow 1.3s ease-in-out infinite' : undefined }}>
        <style>{`@keyframes bamboo-glow{0%,100%{filter:drop-shadow(0 0 3px rgba(255,200,61,.9))}50%{filter:drop-shadow(0 0 16px rgba(255,200,61,1))}}`}</style>
        <svg width={colW} height={H} viewBox={`0 0 ${colW} ${H}`} style={{ display: 'block', overflow: 'visible', pointerEvents: 'none' }}>
          <ellipse cx={colW / 2} cy={base + 4} rx={Math.min(w * 1.05, colW * 0.47)} ry={seg * 0.16} fill={DIRT} stroke={INK} strokeWidth={SW} />
          <g transform={`translate(${colW / 2} ${base})`}>{chain(0)}</g>
          <ellipse cx={colW / 2 - w * 0.5} cy={base + 8} rx={w * 0.5} ry={seg * 0.1} fill="#B98A62" />
          <ellipse cx={colW / 2 + w * 0.45} cy={base + 9} rx={w * 0.4} ry={seg * 0.08} fill="#B98A62" />
        </svg>
        {marks.map((n) => (
          <div
            key={n}
            style={{
              position: 'absolute',
              left: colW / 2 + w * 0.75,
              top: base - seg * n + seg * 0.5 - 16,
              width: 32,
              height: 32,
              borderRadius: 16,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: 18,
              color: n <= segs ? '#fff' : INK,
              background: n <= segs ? 'var(--hotpink)' : 'rgba(255,255,255,0.75)',
              border: `3px ${n <= segs ? 'solid' : 'dashed'} ${INK}`,
              transition: 'background .2s, color .2s',
            }}
          >
            {n}
          </div>
        ))}
      </div>
    </button>
  )
})

function Segment({ seg, w, first }: { seg: number; w: number; first: boolean }) {
  const h = seg * 0.98
  return (
    <g>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={w * 0.22} fill={JADE} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={w * 0.1} y={-h + 6} width={w * 0.26} height={h - 12} rx={w * 0.12} fill={JADE_DARK} />
      <path d={`M${-w * 0.28} ${-h * 0.72} L${-w * 0.28} ${-h * 0.4}`} stroke="#fff" strokeOpacity={0.55} strokeWidth={4} strokeLinecap="round" />
      {/* the node ring at the joint on top */}
      <rect x={-w / 2 - 4} y={-h - 5} width={w + 8} height={11} rx={5.5} fill="#B7E39F" stroke={INK} strokeWidth={SW * 0.8} />
      {first && <path d={`M${-w * 0.5} ${-6} q${w * 0.5} 10 ${w} 0`} fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />}
    </g>
  )
}

function Crown({ seg, big }: { seg: number; big: boolean }) {
  const k = (big ? 1 : 0.7) * (seg / 90)
  const leaf = (rot: number, len: number, fill: string, delay: number) => (
    <g key={rot} transform={`rotate(${rot})`}>
      <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: `bamboo-flutter 3.2s ease-in-out ${delay}s infinite` }}>
        <path d={`M0 0 C${-14 * len} ${-26 * len} ${-6 * len} ${-64 * len} 0 ${-84 * len} C${6 * len} ${-64 * len} ${14 * len} ${-26 * len} 0 0Z`} fill={fill} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d={`M0 -6 L0 ${-66 * len}`} stroke={INK} strokeWidth={2.5} strokeLinecap="round" opacity={0.55} />
      </g>
    </g>
  )
  return (
    <g transform={`scale(${k})`}>
      <style>{`@keyframes bamboo-flutter{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}`}</style>
      {leaf(-62, 0.85, LEAF, 0)}
      {leaf(62, 0.85, LEAF, 0.6)}
      {leaf(-28, 1, LEAF_LIGHT, 0.3)}
      {leaf(28, 1, LEAF_LIGHT, 0.9)}
      {leaf(0, 0.9, LEAF, 0.5)}
    </g>
  )
}

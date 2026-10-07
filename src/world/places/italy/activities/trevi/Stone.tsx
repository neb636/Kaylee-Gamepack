// The aqueduct drawn in SVG, in the Italy sticker style (side elevation, one warm-brown outline, flat travertine fills):
// arches (every one exactly one arch wide), the stone channel on top, the terrain, and the near road.
// Reference pictures: assets/arch-tall|mid|short.webp (cornice blocks, a frieze row, voussoirs, imposts, block piers).
import type { ReactNode } from 'react'
import { INK } from '../../puppets/ink'
import { depth, lineY, TROUGH, type Geom } from './geom'

export const STONE = '#F4E3C3'
export const STONE_SHADE = '#E8CFA4'
export const GROOVE_DRY = '#D9BE92'
export const WATER = '#8FD3F5'
export const WATER_DEEP = '#6EC3E6'
const GRASS = '#A8D06A'
const GRASS_LIP = '#C3E084'
const TUFT = '#79AE4C'

const f = (n: number) => n.toFixed(1)

/** Line width for things drawn at arch width w. */
export const inkW = (w: number) => Math.max(2.2, w * 0.032)

/**
 * One Roman arch, w wide, h tall (top at y = 0), standing on y = h. `foot` extends the piers further down (the
 * terrain hides whatever is underground, so an arch on a slope looks planted in it).
 */
export function ArchShape({ w, h, foot = 0 }: { w: number; h: number; foot?: number }) {
  const sw = inkW(w)
  const thin = sw * 0.7
  const p = w * 0.24 // pier width
  const r = (w - 2 * p) / 2
  const cornice = w * 0.14
  const frieze = w * 0.085
  const ring = w * 0.1
  const crownIn = cornice + frieze + w * 0.05 + ring // top of the opening
  const ys = crownIn + r // spring line (where the round part starts)
  const bottom = h + foot
  const impost = w * 0.065
  const body = `M0 0 H${f(w)} V${f(bottom)} H${f(w - p)} V${f(ys)} A${f(r)} ${f(r)} 0 0 0 ${f(p)} ${f(ys)} V${f(bottom)} H0 Z`
  // Pier courses: horizontal joints, alternate courses shaded and split in two.
  const course = w * 0.17
  const courses: ReactNode[] = []
  let i = 0
  for (let y = ys + impost; y < bottom; y += course, i++) {
    const y1 = Math.min(bottom, y + course)
    for (const x of [0, w - p]) {
      if (i % 2 === 1) courses.push(<rect key={`s${x}-${i}`} x={x} y={y} width={p} height={y1 - y} fill={STONE_SHADE} />)
      courses.push(<path key={`j${x}-${i}`} d={`M${f(x)} ${f(y)} H${f(x + p)}${i % 2 === 0 ? ` M${f(x + p / 2)} ${f(y)} V${f(y1)}` : ''}`} stroke={INK} strokeWidth={thin} />)
    }
  }
  // Voussoirs: the wedge stones around the opening.
  const n = 7
  const wedges = Array.from({ length: n - 1 }, (_, k) => {
    const a = Math.PI * ((k + 1) / n)
    const cx = w / 2
    return `M${f(cx - Math.cos(a) * r)} ${f(ys - Math.sin(a) * r)} L${f(cx - Math.cos(a) * (r + ring))} ${f(ys - Math.sin(a) * (r + ring))}`
  }).join(' ')
  const ringPath = `M${f(p - ring)} ${f(ys)} A${f(r + ring)} ${f(r + ring)} 0 0 1 ${f(w - p + ring)} ${f(ys)} H${f(w - p)} A${f(r)} ${f(r)} 0 0 0 ${f(p)} ${f(ys)} Z`
  const friezeJoints = Array.from({ length: 5 }, (_, k) => `M${f((w * (k + 0.5 + (k % 2) * 0.15)) / 5)} ${f(cornice)} V${f(cornice + frieze)}`).join(' ')
  return (
    <g>
      <path d={body} fill={STONE} fillRule="evenodd" />
      {courses}
      {/* Spandrels: a darker block in each corner beside the ring. */}
      <path d={`M0 ${f(cornice + frieze)} H${f(p * 0.62)} V${f(ys - r * 0.2)} H0 Z M${f(w)} ${f(cornice + frieze)} H${f(w - p * 0.62)} V${f(ys - r * 0.2)} H${f(w)} Z`} fill={STONE_SHADE} stroke={INK} strokeWidth={thin} />
      <path d={ringPath} fill={STONE} stroke={INK} strokeWidth={thin} strokeLinejoin="round" />
      <path d={wedges} stroke={INK} strokeWidth={thin} strokeLinecap="round" />
      {/* Imposts: the ledges the arch springs from. */}
      <rect x={0} y={ys} width={p + w * 0.035} height={impost} rx={impost * 0.3} fill={STONE_SHADE} stroke={INK} strokeWidth={thin} />
      <rect x={w - p - w * 0.035} y={ys} width={p + w * 0.035} height={impost} rx={impost * 0.3} fill={STONE_SHADE} stroke={INK} strokeWidth={thin} />
      {/* Frieze row and cornice blocks. */}
      <rect x={0} y={cornice} width={w} height={frieze} fill={STONE_SHADE} />
      <path d={friezeJoints} stroke={INK} strokeWidth={thin} />
      <path d={`M0 ${f(cornice + frieze)} H${f(w)}`} stroke={INK} strokeWidth={thin} />
      <rect x={0} y={0} width={w} height={cornice} fill={STONE} stroke={INK} strokeWidth={thin} />
      <path d={`M${f(w * 0.36)} 0 V${f(cornice)} M${f(w * 0.71)} 0 V${f(cornice)}`} stroke={INK} strokeWidth={thin} />
      <path d={body} fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  )
}

/** A standalone arch (tray, dragging). */
export function ArchSvg({ w, h }: { w: number; h: number }) {
  const pad = inkW(w)
  return (
    <svg width={w} height={h} viewBox={`${-pad / 2} ${-pad / 2} ${w + pad} ${h + pad}`} style={{ display: 'block', overflow: 'visible' }}>
      <ArchShape w={w} h={h} />
    </svg>
  )
}

/** Dotted outline of the arch that belongs in a gap. */
export function GapOutline({ w, h, glow }: { w: number; h: number; glow?: boolean }) {
  const p = w * 0.24
  const r = (w - 2 * p) / 2
  const ys = w * 0.14 + w * 0.085 + w * 0.05 + w * 0.1 + r
  const d = `M0 0 H${f(w)} V${f(h)} H${f(w - p)} V${f(ys)} A${f(r)} ${f(r)} 0 0 0 ${f(p)} ${f(ys)} V${f(h)} H0 Z`
  const sw = inkW(w)
  return (
    <g>
      <path d={d} fill={glow ? 'rgba(255,226,122,.55)' : 'rgba(255,255,255,.35)'} stroke={glow ? '#FFC83D' : '#fff'} strokeWidth={sw * (glow ? 2.4 : 1.6)} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={INK} strokeWidth={sw * 0.9} strokeDasharray={`${f(sw * 2.4)} ${f(sw * 2)}`} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
    </g>
  )
}

/** The low stone wall under the channel where it runs on the ground (on the hill). Drawn behind the terrain. */
export function TroughWall({ g, x0, x1 }: { g: Geom; x0: number; x1: number }) {
  const { A } = g
  const sw = inkW(A)
  const steps = Math.max(2, Math.ceil((x1 - x0) * 8))
  const pts: string[] = []
  for (let i = steps; i >= 0; i--) {
    const x = x0 + ((x1 - x0) * i) / steps
    pts.push(`${f(x * A)} ${f(lineY(g, x) + (depth(x) + 0.4) * A)}`)
  }
  const b0 = lineY(g, x0)
  const b1 = lineY(g, x1)
  const d = `M${f(x0 * A)} ${f(b0)} L${f(x1 * A)} ${f(b1)} L${pts.join(' L')} Z`
  let joints = ''
  for (let x = Math.ceil(x0 * 3) / 3; x < x1; x += 1 / 3) joints += `M${f(x * A)} ${f(lineY(g, x))} V${f(lineY(g, x) + (depth(x) + 0.4) * A)} `
  for (let r = 1; r <= 4; r++) joints += `M${f(x0 * A)} ${f(b0 + r * 0.2 * A)} L${f(x1 * A)} ${f(b1 + r * 0.2 * A)} `
  return (
    <g>
      <path d={d} fill={STONE_SHADE} />
      <path d={joints} stroke={INK} strokeWidth={sw * 0.6} opacity={0.7} />
      <path d={d} fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  )
}

/** The stone channel from world x0 to x1, sitting on the arch line (side view: a stone trough whose water groove shows
 *  as a band along the top). */
export function Trough({ g, x0, x1 }: { g: Geom; x0: number; x1: number }) {
  const { A } = g
  const sw = inkW(A)
  const t = TROUGH * A
  const X0 = x0 * A
  const X1 = x1 * A
  const b0 = lineY(g, x0)
  const b1 = lineY(g, x1)
  const joints: string[] = []
  for (let x = Math.ceil(x0 * 2) / 2; x < x1; x += 0.5) joints.push(`M${f(x * A)} ${f(lineY(g, x) - t * 0.45)} V${f(lineY(g, x))}`)
  return (
    <g>
      <path d={`M${f(X0)} ${f(b0)} L${f(X1)} ${f(b1)} L${f(X1)} ${f(b1 - t)} L${f(X0)} ${f(b0 - t)} Z`} fill={STONE} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M${f(X0 + sw)} ${f(b0 - t * 0.62)} L${f(X1 - sw)} ${f(b1 - t * 0.62)}`} stroke={GROOVE_DRY} strokeWidth={t * 0.36} strokeLinecap="round" />
      <path d={joints.join(' ')} stroke={INK} strokeWidth={sw * 0.6} strokeLinecap="round" />
    </g>
  )
}

/** The terrain (hill, valleys, land toward Rome) from world x0 to x1, filled down to `bottom` px. */
export function Terrain({ g, x0, x1, bottom, floor }: { g: Geom; x0: number; x1: number; bottom: number; floor: number }) {
  const { A } = g
  const sw = inkW(A)
  const pts: string[] = []
  for (let x = x0; x <= x1 + 1e-6; x += 0.05) pts.push(`${f(x * A)} ${f(lineY(g, x) + depth(x) * A)}`)
  const edge = `M${pts.join(' L')}`
  const fill = `${edge} L${f(x1 * A)} ${f(bottom)} L${f(x0 * A)} ${f(bottom)} Z`
  const tufts = [-1.1, 0.0, 1.6, 2.15, 3.6, 4.7, 6.0, 7.9, 8.7, 9.6, 10.8, 12.3, 13.6].filter((x) => x > x0 && x < x1)
  // Meadow life below the ridge line: grass tufts and little flowers scattered down the slopes (never on the road).
  const meadow = Array.from({ length: 60 }, (_, i) => ({ x: -1.5 + ((i * 0.618034) % 1) * 15, below: 0.55 + ((i * 0.381966 * 7) % 1) * 3.2, flower: i % 3 === 0, hue: i % 2 }))
    .map((m) => ({ ...m, X: m.x * A, Y: lineY(g, m.x) + (depth(m.x) + m.below) * A }))
    .filter((m) => m.Y < floor - A * 0.3)
  return (
    <g>
      <path d={fill} fill={GRASS} />
      <path d={edge} transform={`translate(0 ${f(A * 0.07)})`} fill="none" stroke={GRASS_LIP} strokeWidth={A * 0.14} strokeLinejoin="round" />
      <path d={edge} fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
      {tufts.map((x) => {
        const X = x * A
        const Y = lineY(g, x) + depth(x) * A + A * 0.2
        const s = A * 0.09
        return <path key={x} d={`M${f(X - s)} ${f(Y)} q${f(-s * 0.2)} ${f(-s)} ${f(-s * 0.7)} ${f(-s * 1.5)} M${f(X)} ${f(Y)} q0 ${f(-s * 1.2)} 0 ${f(-s * 2)} M${f(X + s)} ${f(Y)} q${f(s * 0.2)} ${f(-s)} ${f(s * 0.7)} ${f(-s * 1.5)}`} stroke={TUFT} strokeWidth={sw * 0.8} strokeLinecap="round" fill="none" />
      })}
      {meadow.map((m, i) => {
        const s = A * 0.08
        if (!m.flower)
          return <path key={i} d={`M${f(m.X - s)} ${f(m.Y)} q${f(-s * 0.2)} ${f(-s)} ${f(-s * 0.7)} ${f(-s * 1.5)} M${f(m.X)} ${f(m.Y)} q0 ${f(-s * 1.2)} 0 ${f(-s * 2)} M${f(m.X + s)} ${f(m.Y)} q${f(s * 0.2)} ${f(-s)} ${f(s * 0.7)} ${f(-s * 1.5)}`} stroke={TUFT} strokeWidth={sw * 0.7} strokeLinecap="round" fill="none" opacity={0.85} />
        return (
          <g key={i} transform={`translate(${f(m.X)} ${f(m.Y)})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={0} cy={-s * 0.75} rx={s * 0.5} ry={s * 0.7} transform={`rotate(${a})`} fill={m.hue ? '#FFB3CF' : '#FFF7F0'} stroke={INK} strokeWidth={sw * 0.45} />
            ))}
            <circle r={s * 0.42} fill="#FFE27A" stroke={INK} strokeWidth={sw * 0.45} />
          </g>
        )
      })}
    </g>
  )
}

/** The near road along the bottom, where the arches wait and the friends stand. */
export function Road({ W, top, H, A }: { W: number; top: number; H: number; A: number }) {
  const sw = inkW(A)
  const pebbles = Array.from({ length: Math.ceil(W / (A * 0.9)) }, (_, i) => ({ x: (i + 0.3 + ((i * 37) % 10) / 20) * A * 0.9, y: top + (H - top) * (0.45 + ((i * 53) % 7) / 20), r: A * (0.05 + ((i * 29) % 5) / 120) }))
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} aria-hidden>
      <rect x={-10} y={top} width={W + 20} height={H - top + 10} fill="#EBD3A8" stroke={INK} strokeWidth={sw} />
      <rect x={-10} y={top + sw / 2} width={W + 20} height={A * 0.06} fill="#F5E2BD" />
      {pebbles.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={p.r * 1.4} ry={p.r} fill="#D8BE92" stroke={INK} strokeWidth={sw * 0.55} />
      ))}
    </svg>
  )
}

/**
 * Soft rolling hills between the painting and the valley: they overlap the painting's ground edge so only its sky, far
 * hills and Rome show, and the near terrain sits in front of them.
 */
export function BackHills({ W, H, horizon, A }: { W: number; H: number; horizon: { y: number; h: number }; A: number }) {
  const sw = inkW(A) * 0.8
  const rise = horizon.h * 0.055
  const pts: string[] = []
  for (let x = -20; x <= W + 20; x += 10) {
    const y = horizon.y - rise - Math.sin(x / (W * 0.21) + 0.6) * rise * 0.28 - Math.sin(x / (W * 0.083) + 2) * rise * 0.12
    pts.push(`${f(x)} ${f(y)}`)
  }
  const edge = `M${pts.join(' L')}`
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} aria-hidden>
      <path d={`${edge} L${W + 20} ${H + 10} L-20 ${H + 10} Z`} fill="#B7D873" />
      <path d={edge} transform={`translate(0 ${f(A * 0.05)})`} fill="none" stroke="#C9E48C" strokeWidth={A * 0.1} />
      <path d={edge} fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    </svg>
  )
}

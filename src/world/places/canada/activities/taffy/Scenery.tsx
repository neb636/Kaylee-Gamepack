// Sugar Snow's scenery, all seen from straight above (the one camera of this scene): the snowy yard with its spruces and
// paw prints, the maple tree with its tap and sap bucket, the sugar shack's snowy roof and chimney, the owl's post,
// the wood stove under the pot, the crate of sticks and the wooden tray of sparkling snow. Static SVG; the world
// (SugarSnow.tsx) finds the moving bits by their data-k (the sap in the bucket, the drips, the owl's head). The props
// are painted sprites (art/source/world/canada/taffy-*.png, drawn from above); the tray, the snow and the yard are code.
import bucketImg from '../../assets/taffy-bucket.webp'
import postImg from '../../assets/taffy-post.webp'
import roofImg from '../../assets/taffy-roof-hd.webp'
import spruceImg from '../../assets/taffy-spruce.webp'
import cratImg from '../../assets/taffy-sticks.webp'
import stoveImg from '../../assets/taffy-stove.webp'
import treeImg from '../../assets/taffy-tree.webp'
import type { StageDef } from './stage'

const INK = '#4A3B57'
export const SNOW = '#FBFDFF'
const SNOW_SHADE = '#E4ECF8'
const SNOW_DEEP = '#C9D6E8'

/** Spruces around the yard (fractions of the stage), clear of the tray and the things on the table. */
const YARD: [number, number, number][] = [
  [-0.08, 0.1, 96],
  [1.08, 0.12, 106],
  [-0.1, 0.92, 116],
  [1.1, 0.95, 96],
  [0.5, -0.13, 86],
  [0.3, 1.11, 96],
  [0.75, 1.13, 106],
  [-0.2, 0.5, 90],
  [1.2, 0.55, 96],
]

/** A snowy spruce from above, with its soft shadow on the snow. */
function Spruce({ r }: { r: number }) {
  return (
    <g>
      <circle r={r * 0.9} cx={12} cy={14} fill={SNOW_DEEP} opacity={0.7} />
      <image href={spruceImg} x={-r} y={-r} width={r * 2} height={r * 2} />
    </g>
  )
}

/** Little paw prints across the snow (a hare went by). */
function Prints({ x, y, n, dx, dy }: { x: number; y: number; n: number; dx: number; dy: number }) {
  return (
    <g fill={SNOW_DEEP} opacity={0.75}>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${x + dx * i} ${y + dy * i + (i % 2 ? 16 : -16)})`}>
          <ellipse rx={9} ry={12} />
          <ellipse cx={14} cy={-4} rx={5} ry={6} />
        </g>
      ))}
    </g>
  )
}

export function Yard({ stage, mid }: { stage: StageDef; mid: string }) {
  const big = 6000
  return (
    <g pointerEvents="none">
      <defs>
        <pattern id={`${mid}-yard`} width={620} height={470} patternUnits="userSpaceOnUse">
          <rect width={620} height={470} fill="#E8EFF8" />
          {/* Soft drifts, all different, so the yard doesn't read as a grid. */}
          <path d="M20 90 C 90 40, 230 50, 300 96 C 220 120, 90 124, 20 90 Z" fill={SNOW} opacity={0.75} />
          <path d="M360 260 C 420 214, 560 222, 610 262 C 540 292, 420 296, 360 260 Z" fill={SNOW} opacity={0.75} />
          <path d="M80 360 C 130 330, 230 334, 270 366 C 210 386, 130 388, 80 360 Z" fill={SNOW} opacity={0.6} />
          <path d="M420 60 C 470 44, 540 48, 570 70" stroke={SNOW_DEEP} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.5} />
          <path d="M120 230 C 170 214, 240 218, 270 240" stroke={SNOW_DEEP} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.45} />
          <path d="M330 420 C 380 404, 450 408, 480 430" stroke={SNOW_DEEP} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.45} />
          {[[150, 170], [480, 150], [300, 320], [560, 400], [40, 260], [230, 440]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3 + (i % 2)} fill="#fff" />
          ))}
        </pattern>
      </defs>
      <rect x={-big} y={-big} width={big * 2} height={big * 2} fill="#E8EFF8" />
      <rect x={-big} y={-big} width={big * 2} height={big * 2} fill={`url(#${mid}-yard)`} />
      <Prints x={stage.snow.x - 40} y={stage.h + 60} n={9} dx={110} dy={-6} />
      <Prints x={stage.w + 40} y={stage.snow.y - 120} n={5} dx={60} dy={90} />
      {YARD.map(([fx, fy, fr], i) => (
        <g key={i} transform={`translate(${(fx * stage.w).toFixed(0)} ${(fy * stage.h).toFixed(0)})`}>
          <Spruce r={fr} />
        </g>
      ))}
    </g>
  )
}

/** The sugar maple in late winter, from above: bare branches spreading like a star, snow along them, red buds, and
 *  its metal tap (the spile) pointing at the bucket. */
export function Tree({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <circle r={128} cx={16} cy={18} fill={SNOW_DEEP} opacity={0.55} />
      <image href={treeImg} x={-134} y={-131} width={268} height={261} />
      <rect x={24} y={56} width={44} height={14} rx={6} fill="#B9B4C8" stroke={INK} strokeWidth={4} transform="rotate(30 24 56)" />
    </g>
  )
}

/** The sap bucket from above: a metal rim, its little lid tipped open, the sap inside (its level is moved by the world). */
export function Bucket({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <circle r={44} cx={7} cy={9} fill={SNOW_DEEP} opacity={0.6} />
      <image href={bucketImg} x={-44} y={-56.6} width={88} height={102.4} />
      <circle data-k="bucket-sap" r={10} fill="#F4E4B8" />
      <ellipse cx={-6} cy={-6} rx={8} ry={4} fill="#fff" opacity={0.6} />
    </g>
  )
}

export function Drips() {
  return (
    <g data-k="drips" pointerEvents="none">
      {[0, 1, 2].map((i) => (
        <circle key={i} data-k="drip" r={8} fill="#F4E4B8" stroke={INK} strokeWidth={3} opacity={0} />
      ))}
    </g>
  )
}

/** The sugar shack's roof from above: red-brown shingles, a ridge across the middle, thick snow, the stone chimney
 *  (at ROOF_CHIMNEY: the smoke puffs out of it). */
export const ROOF_CHIMNEY = [92, -58] as const
export function Roof({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} pointerEvents="none">
      <rect x={-120} y={-86} width={256} height={196} rx={10} fill={SNOW_DEEP} opacity={0.6} />
      <image href={roofImg} x={-132} y={-98} width={264} height={196} />
    </g>
  )
}

/** The owl's fence post from above: a wood cross-section with rings and a cap of snow. The owl's head sits on it. */
export function Post({ x, y, owl }: { x: number; y: number; owl: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <circle r={52} cx={9} cy={11} fill={SNOW_DEEP} opacity={0.6} />
      <image href={postImg} x={-54} y={-54} width={108} height={108} />
      {owl && <OwlHead />}
    </g>
  )
}

/** The snowy owl on its post, looking up at her: a round white face, yellow eyes, little black flecks. */
function OwlHead() {
  return (
    <g data-k="owl-head">
      <g>
        {/* Wings folded on either side, flecked. */}
        <ellipse cx={-34} cy={14} rx={18} ry={30} fill="#F2F2FA" stroke={INK} strokeWidth={4} />
        <ellipse cx={34} cy={14} rx={18} ry={30} fill="#F2F2FA" stroke={INK} strokeWidth={4} />
        <circle r={44} fill="#FBFBFF" stroke={INK} strokeWidth={5} />
        {[[-24, 22], [22, 26], [-8, 32], [10, -32], [-18, -30]].map(([fx, fy], i) => (
          <path key={i} d={`M${fx - 4} ${fy} l4 3 l4 -3`} stroke="#4A3B57" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        ))}
        <path d="M-30 -36 l-6 -10 l12 4 M30 -36 l6 -10 l-12 4" stroke={INK} strokeWidth={4} fill="#FBFBFF" strokeLinejoin="round" />
        <circle cx={-16} cy={-6} r={12} fill="#FFD84D" stroke={INK} strokeWidth={3} />
        <circle cx={16} cy={-6} r={12} fill="#FFD84D" stroke={INK} strokeWidth={3} />
        <circle cx={-16} cy={-6} r={6} fill="#2B2236" />
        <circle cx={16} cy={-6} r={6} fill="#2B2236" />
        <circle cx={-14} cy={-9} r={2.5} fill="#fff" />
        <circle cx={18} cy={-9} r={2.5} fill="#fff" />
        <path d="M-6 6 L6 6 L0 18 Z" fill="#3A2F45" stroke="#3A2F45" strokeWidth={3} strokeLinejoin="round" />
        <ellipse cx={-28} cy={10} rx={7} ry={4} fill="#FF9EB8" opacity={0.6} />
        <ellipse cx={28} cy={10} rx={7} ry={4} fill="#FF9EB8" opacity={0.6} />
      </g>
    </g>
  )
}

/** The cast-iron wood stove from above: the burner plate under the pot (its ring glows), the stove pipe at the back,
 *  and some kindling beside it. */
export function Stove({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <rect x={-108} y={-110} width={236} height={236} rx={26} fill={SNOW_DEEP} opacity={0.6} />
      {[[-60, 156, -8, '#A06C46'], [-30, 178, 10, '#8A5C3C']].map(([kx, ky, a, c], i) => (
        <g key={i} transform={`translate(${kx} ${ky}) rotate(${a})`}>
          <rect x={-40} y={-9} width={80} height={18} rx={9} fill={c as string} stroke={INK} strokeWidth={4} />
          <circle cx={40} cy={0} r={9} fill="#E2B48A" stroke={INK} strokeWidth={3} />
        </g>
      ))}
      <image href={stoveImg} x={-118} y={-155} width={236} height={250} />
      <circle cy={-4} r={70} fill="none" stroke="#FFC83D" strokeWidth={5} opacity={0.55} className="taffy-flame" />
    </g>
  )
}

/** The crate of clean taffy sticks, from above. */
export function Crate({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <rect x={-64} y={-46} width={140} height={108} rx={10} fill={SNOW_DEEP} opacity={0.6} />
      <image href={cratImg} x={-72} y={-56} width={144} height={112} />
    </g>
  )
}

/** The wooden tray full of snow: planks around the edge with nails, the soft snow inside. */
export function Tray({ stage, mid }: { stage: StageDef; mid: string }) {
  const s = stage.snow
  const f = 30
  return (
    <g pointerEvents="none">
      <defs>
        <pattern id={`${mid}-snow`} width={380} height={300} patternUnits="userSpaceOnUse">
          <rect width={380} height={300} fill={SNOW} />
          {/* Fluffy lumps of fresh snow and a few glints. */}
          <path d="M30 70 q 30 -18 60 0 q 26 -14 50 4" stroke={SNOW_SHADE} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M220 180 q 30 -18 60 0 q 26 -14 50 4" stroke={SNOW_SHADE} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M80 250 q 24 -14 48 0" stroke={SNOW_SHADE} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M280 50 q 24 -14 48 0" stroke={SNOW_SHADE} strokeWidth={4} fill="none" strokeLinecap="round" />
          {[[160, 120], [40, 180], [330, 260], [250, 100], [120, 30], [200, 280]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y - 5} L${x + 1.5} ${y - 1.5} L${x + 5} ${y} L${x + 1.5} ${y + 1.5} L${x} ${y + 5} L${x - 1.5} ${y + 1.5} L${x - 5} ${y} L${x - 1.5} ${y - 1.5} Z`} fill="#BFD4F2" />
          ))}
        </pattern>
      </defs>
      <rect x={s.x - f + 12} y={s.y - f + 14} width={s.w + f * 2} height={s.h + f * 2} rx={30} fill={SNOW_DEEP} opacity={0.6} />
      <rect x={s.x - f} y={s.y - f} width={s.w + f * 2} height={s.h + f * 2} rx={30} fill="#C08654" stroke={INK} strokeWidth={5} />
      {/* The plank joins and their nails. */}
      {[0.25, 0.5, 0.75].map((k) => (
        <g key={k}>
          <path d={`M${s.x + s.w * k} ${s.y - f} l0 ${f}`} stroke="#8E5C38" strokeWidth={4} />
          <path d={`M${s.x + s.w * k} ${s.y + s.h} l0 ${f}`} stroke="#8E5C38" strokeWidth={4} />
          <circle cx={s.x + s.w * k - 9} cy={s.y - f / 2} r={3.5} fill="#6A6580" />
          <circle cx={s.x + s.w * k + 9} cy={s.y + s.h + f / 2} r={3.5} fill="#6A6580" />
        </g>
      ))}
      <path d={`M${s.x - f + 14} ${s.y - f / 2} L${s.x + s.w + f - 14} ${s.y - f / 2}`} stroke="#D9A272" strokeWidth={3} opacity={0.7} />
      {/* A plain snow layer under the pattern, so Safari's hairline seams between pattern tiles don't show the wood. */}
      <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={16} fill={SNOW} />
      <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={16} fill={`url(#${mid}-snow)`} stroke="#8E5C38" strokeWidth={4} />
      {/* Soft shade along the far rim, where the wood shades the snow. */}
      <rect x={s.x + 4} y={s.y + 4} width={s.w - 8} height={20} rx={10} fill={SNOW_SHADE} opacity={0.8} />
    </g>
  )
}

/** Twinkles on the snow: little four-point stars that blink on and off at their own pace. */
export function Sparkles({ stage }: { stage: StageDef }) {
  const s = stage.snow
  const n = 34
  return (
    <g pointerEvents="none">
      {Array.from({ length: n }, (_, i) => {
        // A scattered but fixed spread (no Math.random in render).
        const fx = ((i * 0.618034) % 1) * 0.92 + 0.04
        const fy = ((i * 0.381966 + 0.13) % 1) * 0.88 + 0.06
        const r = 7 + (i % 3) * 3
        return (
          <g key={i} transform={`translate(${(s.x + fx * s.w).toFixed(0)} ${(s.y + fy * s.h).toFixed(0)})`}>
            <path className="taffy-twinkle" style={{ animationDelay: `${((i * 0.73) % 3).toFixed(2)}s`, animationDuration: `${(2.2 + (i % 4) * 0.5).toFixed(1)}s` }} d={`M0 ${-r} Q ${r * 0.18} ${-r * 0.18} ${r} 0 Q ${r * 0.18} ${r * 0.18} 0 ${r} Q ${-r * 0.18} ${r * 0.18} ${-r} 0 Q ${-r * 0.18} ${-r * 0.18} 0 ${-r} Z`} fill="#fff" stroke="#A8C4EC" strokeWidth={1.5} />
          </g>
        )
      })}
    </g>
  )
}

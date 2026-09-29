// The Great Wall's bricks (red, gold, jade) and the long stone walkway with its gaps, drawn in SVG with the China ink.
import { INK } from '../../puppets/ink'

export type BrickColor = 'r' | 'g' | 'j'
export const BRICKS: Record<BrickColor, { fill: string; shade: string; name: string; dots: number }> = {
  r: { fill: '#E8504F', shade: '#C93D3D', name: 'red', dots: 1 },
  g: { fill: '#FFC83D', shade: '#E0A61C', name: 'gold', dots: 2 },
  j: { fill: '#7CCBA2', shade: '#5FB48A', name: 'jade', dots: 3 },
}
/** Brick height as a fraction of its width. */
export const BRICK_RATIO = 0.72

/** One chunky brick. The little dots (1, 2, 3) help tell the colors apart and are a tiny counting bonus. */
export function Brick({ c, w }: { c: BrickColor; w: number }) {
  const b = BRICKS[c]
  return (
    <svg width={w} height={w * BRICK_RATIO} viewBox="0 0 100 72" style={{ display: 'block', overflow: 'visible' }}>
      <rect x="4" y="4" width="92" height="64" rx="14" fill={b.fill} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M6 48 L94 48 L94 56 Q94 66 82 66 L18 66 Q6 66 6 56Z" fill={b.shade} />
      <rect x="14" y="11" width="46" height="9" rx="4.5" fill="#fff" opacity="0.35" />
      {Array.from({ length: b.dots }, (_, i) => (
        <circle key={i} cx={50 + (i - (b.dots - 1) / 2) * 15} cy="36" r="5" fill={INK} opacity="0.75" />
      ))}
    </svg>
  )
}

export interface WallGeom {
  pw: number
  hh: number
  /** y of the top of the crenellations, top of the walkway surface, bottom of the surface, bottom of the front face. */
  parapetY: number
  walkY0: number
  walkY1: number
  faceY1: number
  gaps: { left: number; width: number }[]
}

const STONE = '#E9D2A8'
const STONE_TOP = '#F7E6C4'
const STONE_SHADE = '#D4B27F'
const GAP_INSIDE = '#B98F66'

/** The wall in front of the mountains: parapet, walkway, brick face, and a notch for each gap. */
export function WallWalk({ g }: { g: WallGeom }) {
  const { pw, hh } = g
  const merlon = hh * 0.052
  const pitch = merlon * 1.75
  const joint = hh * 0.075
  const face = g.faceY1 - g.walkY1
  const rows = 2
  const sw = Math.max(3, hh * 0.006)
  const insideGap = (x: number) => g.gaps.some((q) => x > q.left - 6 && x < q.left + q.width + 6)
  let joints = ''
  for (let r = 0; r < rows; r++) {
    const y0 = g.walkY1 + (face * r) / rows
    for (let x = (r % 2) * joint * 0.5; x < pw; x += joint) if (!insideGap(x)) joints += `M${x.toFixed(1)} ${y0.toFixed(1)} L${x.toFixed(1)} ${(y0 + face / rows).toFixed(1)} `
  }
  const paving = Array.from({ length: Math.ceil(pw / (hh * 0.16)) }, (_, i) => i * hh * 0.16 + hh * 0.05)
  return (
    <svg width={pw} height={hh} viewBox={`0 0 ${pw} ${hh}`} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
      {/* Crenellations along the far edge. */}
      {Array.from({ length: Math.ceil(pw / pitch) }, (_, i) => (
        <rect key={i} x={i * pitch + pitch * 0.15} y={g.parapetY} width={merlon} height={g.walkY0 - g.parapetY + sw} rx={merlon * 0.18} fill={STONE} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      ))}
      {/* Walkway (top of the wall) and its front face. */}
      <rect x={-4} y={g.walkY0} width={pw + 8} height={g.walkY1 - g.walkY0} fill={STONE_TOP} stroke={INK} strokeWidth={sw} />
      {paving.map((x) => (
        <path key={x} d={`M${x} ${g.walkY0 + 2} L${x - hh * 0.03} ${g.walkY1 - 2}`} stroke={STONE_SHADE} strokeWidth={sw * 0.7} strokeLinecap="round" />
      ))}
      <rect x={-4} y={g.walkY1} width={pw + 8} height={face} fill={STONE} stroke={INK} strokeWidth={sw} />
      <rect x={-4} y={g.faceY1 - face * 0.16} width={pw + 8} height={face * 0.16} fill={STONE_SHADE} opacity="0.7" />
      <path d={joints} stroke={STONE_SHADE} strokeWidth={sw * 0.8} strokeLinecap="round" />
      <path d={`M0 ${g.walkY1 + face / rows} L${pw} ${g.walkY1 + face / rows}`} stroke={STONE_SHADE} strokeWidth={sw * 0.8} />
      {/* Notches where the bricks fell out. */}
      {g.gaps.map((q, i) => (
        <g key={i}>
          <rect x={q.left} y={g.walkY1 - 2} width={q.width} height={face + 2} rx={hh * 0.012} fill={GAP_INSIDE} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
          <rect x={q.left + 4} y={g.walkY1 + 2} width={q.width - 8} height={face * 0.2} rx={hh * 0.01} fill="#000" opacity="0.1" />
        </g>
      ))}
    </svg>
  )
}

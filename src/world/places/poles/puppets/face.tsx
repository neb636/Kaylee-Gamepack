// What the Poles' puppets share: the big shiny eyes (they blink, follow her finger and squeeze shut when happy), the
// fluffy outlines, and the colors and ink of the 3D looks (characters/looks.ts), so a friend is the same animal in 2D
// and 3D.
import { clamp, setA, setT, show } from '../../../../sdk'

export { POLES_COLORS as C } from '../characters/looks'
/** The 3D rig's ink and blush (engine3d/characters/animal.ts). */
export const INK = '#2E2233'
export const BLUSH = '#FF9DB8'
export const MOUTH = '#7A2745'
export const TONGUE = '#FF8FA8'

export type EyePart = `eye${'L' | 'R'}${'' | 'Open' | 'Pupil' | 'Lid' | 'LidLine' | 'Happy'}`
export type EyeKind = 'open' | 'happy'

/** A fluffy scalloped ellipse: `bumps` round tufts, only where `weight(angle)` > 0. */
export function blob(cx: number, cy: number, rx: number, ry: number, bumps: number, depth: number, weight: (a: number) => number = () => 1, n = 220) {
  const pts: string[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const w = weight(a)
    const k = 1 - depth * w + depth * w * Math.abs(Math.sin((a * bumps) / 2))
    pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)}`)
  }
  return `M${pts.join('L')}Z`
}

/** 1 inside the angle window (from..to), easing to 0 at its ends. */
export const win = (a: number, from: number, to: number) => (a > from && a < to ? Math.sin(((a - from) / (to - from)) * Math.PI) : 0)

/** An open mouth `m` (0..1) wide around (x, top): a soft D shape that drops as it opens. */
export function mouthPath(x: number, top: number, m: number, w0 = 20) {
  const w = w0 + 14 * m
  const bottom = top + 10 + 46 * m
  const mid = top + (bottom - top) * 0.72
  return `M${x - w} ${top} Q${x} ${top - 5} ${x + w} ${top} C${x + w} ${mid} ${x + w * 0.5} ${bottom} ${x} ${bottom} C${x - w * 0.5} ${bottom} ${x - w} ${mid} ${x - w} ${top}Z`
}

/** One eye at (x, y), `skin` the color the lid closes in. */
export function Eye({ id, side, x, y, skin, part, rx = 17, ry = 21 }: { id: string; side: 'L' | 'R'; x: number; y: number; skin: string; part: (name: EyePart) => (el: SVGGraphicsElement | null) => void; rx?: number; ry?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <clipPath id={`${id}-eye${side}`}>
        <ellipse rx={rx} ry={ry} />
      </clipPath>
      <g ref={part(`eye${side}Open`)}>
        <ellipse rx={rx} ry={ry} fill={INK} />
        <g ref={part(`eye${side}Pupil`)}>
          <circle cx={-rx * 0.25} cy={-ry * 0.3} r={rx * 0.36} fill="#fff" />
          <circle cx={rx * 0.32} cy={ry * 0.26} r={rx * 0.15} fill="#fff" />
        </g>
        <rect ref={part(`eye${side}Lid`)} x={-rx - 4} y={-ry * 2} width={rx * 2 + 8} height="0" fill={skin} clipPath={`url(#${id}-eye${side})`} />
        <path ref={part(`eye${side}LidLine`)} fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
      </g>
      <path ref={part(`eye${side}Happy`)} d={`M${-rx} 5 Q0 ${-ry * 0.75} ${rx} 5`} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" style={{ display: 'none' }} />
    </g>
  )
}

/** Each frame: open or happy, how shut (0..1, a blink), the pupils following her finger. */
export function updateEyes(p: Partial<Record<EyePart, SVGGraphicsElement | HTMLElement>>, kind: EyeKind, closure: number, look: { x: number; y: number }, rx = 17, ry = 21) {
  for (const side of ['L', 'R'] as const) {
    show(p[`eye${side}Open`], kind === 'open')
    show(p[`eye${side}Happy`], kind === 'happy')
    setT(p[`eye${side}Pupil`], `translate(${look.x * 3} ${look.y * 3})`)
    const c = clamp(closure)
    const y = -ry + 2 * ry * c
    setA(p[`eye${side}Lid`], 'height', y + ry * 2)
    const w = rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2)) + 1.5
    setA(p[`eye${side}LidLine`], 'd', c > 0.04 ? `M${-w} ${y} Q0 ${y + 4 * c} ${w} ${y}` : '')
  }
}

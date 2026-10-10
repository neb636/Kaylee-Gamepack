// Tika's Mountain Terraces: the drawn pieces of the scene, in the same flat style as the art (5-unit dark outline, flat
// fills). The mountainside, the grass terraces and the Inca walls are drawn in code so the walls she builds *are* the
// art; the painting behind (Machu Picchu and Huayna Picchu) and the critters are generated pictures.
import { motion } from 'motion/react'
import { memo, useMemo } from 'react'
import { INK } from '../../puppets/Alpaca'
import type { StageLayout, World } from './layout'
import { inset, lighten, roundedPath, type StoneShape } from './stones'

export const HOLE = '#5E4E66'
const GRASS = '#8FD86F'
const GRASS_DARK = '#62B15A'
const MUD = '#B48C69'
const MUD_DARK = '#8E6A4E'
export const MOUNTAIN = '#71BF73'
const MOUNTAIN_DARK = '#4F9E62'

/** One stone's two paths (outline and pillowy face), relative to its own box when `local`. */
export function stonePaths(st: StoneShape, local: boolean) {
  const dx = local ? st.w / 2 - st.c.x : 0
  const dy = local ? st.h / 2 - st.c.y : 0
  return {
    outline: roundedPath(st.pts, 16, dx, dy),
    face: roundedPath(inset(st.pts, st.c, 0.74, -2, -6), 14, dx, dy),
  }
}

/** A stone, drawn at its place in the wall (or in its own box when `local`). */
export function Stone({ st, local = false }: { st: StoneShape; local?: boolean }) {
  const p = useMemo(() => stonePaths(st, local), [st, local])
  return (
    <g>
      <path d={p.outline} fill={st.color} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <path d={p.face} fill={lighten(st.color, 0.28)} />
      {st.corners && <path d={p.face} fill="none" stroke="#FFE59A" strokeWidth="5" strokeDasharray="4 14" strokeLinecap="round" />}
    </g>
  )
}

/** An empty gap in the wall: a dark socket. Gaps in the wall she's building get a dashed rim, so neighbouring gaps
 *  read as separate shapes. */
export function Hole({ st, glow, hover, active }: { st: StoneShape; glow: boolean; hover: boolean; active: boolean }) {
  // data-gap: QA scripts find a stone's own gap by it.
  const p = useMemo(() => ({ o: roundedPath(st.pts, 16), i: roundedPath(inset(st.pts, st.c, 0.82, 0, 7), 12) }), [st])
  return (
    <g data-gap={active ? st.id : undefined}>
      <path d={p.o} fill={HOLE} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <path d={p.i} fill="#4A3D52" />
      {active && <path d={roundedPath(inset(st.pts, st.c, 0.93, 0, 0), 14)} fill="none" stroke="#B5A3BE" strokeWidth="5" strokeDasharray="14 10" strokeLinecap="round" />}
      {(glow || hover) && <path className={glow ? 'terr-glow' : undefined} d={p.o} fill={hover ? 'rgba(255,200,61,.3)' : 'none'} stroke="#FFC83D" strokeWidth="12" strokeLinejoin="round" />}
    </g>
  )
}

/** The mountainside behind the terraces, the valley floor and the grass terraces (or storm mud, before they're fixed). */
export const Mountain = memo(function Mountain({ S, W, green }: { S: StageLayout; W: World; green: boolean[] }) {
  const n = S.wallW.length
  const pad = S.tall ? 90 : 230
  const hw = (k: number) => S.wallW[k] / 2 + pad
  // Left slope from the valley up to the summit, then mirrored.
  const left: [number, number][] = [[-60, W.height]]
  for (let k = 0; k < n; k++) left.push([W.cx - hw(k), W.wallBottom(k) + (k === 0 ? 0 : S.ledgeH * 0.4)])
  left.push([W.cx - S.wallW[n - 1] / 2 - pad * 0.45, W.summit - 40])
  const right = left.map(([x, y]) => [S.w - x, y] as [number, number]).reverse()
  const pts = [...left, [W.cx, W.summit - 70] as [number, number], ...right]
  const path = `M${pts.map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join('L')}Z`
  return (
    <g>
      <path d={path} fill={MOUNTAIN} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      {/* Cloud-forest bushes along both slopes. */}
      {left.slice(1, -1).map(([x, y], i) => (
        <g key={i} fill={MOUNTAIN_DARK} stroke={INK} strokeWidth="5">
          <circle cx={x + 40} cy={y - 60} r="46" />
          <circle cx={x + 95} cy={y - 40} r="34" />
          <circle cx={S.w - x - 40} cy={y - 70} r="44" />
          <circle cx={S.w - x - 92} cy={y - 42} r="32" />
        </g>
      ))}
      {/* The valley floor. */}
      <rect x={-60} y={W.G} width={S.w + 120} height={S.ground + 60} fill={GRASS} stroke={INK} strokeWidth="6" />
      {Array.from({ length: n }, (_, k) => {
        const x = W.wallLeft(k) - 26
        const y = W.wallTop(k) - S.ledgeH
        const w = S.wallW[k] + 52
        const g = green[k]
        return (
          <g key={k}>
            <rect x={x} y={y} width={w} height={S.ledgeH} rx="14" fill={g ? GRASS : MUD} stroke={INK} strokeWidth="6" style={{ transition: 'fill 0.8s' }} />
            <rect x={x + 3} y={y + S.ledgeH - 24} width={w - 6} height={20} fill={g ? GRASS_DARK : MUD_DARK} style={{ transition: 'fill 0.8s' }} />
            {g ? (
              <g fill="none" stroke={GRASS_DARK} strokeWidth="5" strokeLinecap="round">
                {Array.from({ length: Math.floor(w / 90) }, (_, i) => (
                  <path key={i} d={`M${x + 40 + i * 90} ${y + 40}l-8 -18M${x + 40 + i * 90} ${y + 40}l2 -22M${x + 40 + i * 90} ${y + 40}l11 -16`} />
                ))}
              </g>
            ) : (
              <g fill="#C9B9A9" stroke={INK} strokeWidth="4">
                {Array.from({ length: Math.floor(w / 160) }, (_, i) => (
                  <ellipse key={i} cx={x + 70 + i * 160 + (i % 2) * 40} cy={y + 52} rx={18 + (i % 3) * 5} ry="11" />
                ))}
              </g>
            )}
          </g>
        )
      })}
    </g>
  )
})

/** A puffy flat cloud. */
export function CloudShape({ w, fill = '#FFF7F0' }: { w: number; fill?: string }) {
  return (
    <svg viewBox="0 0 200 100" style={{ width: w, height: w / 2, overflow: 'visible', display: 'block' }}>
      <path d="M30 88C6 88 4 58 28 54C26 26 62 18 78 36C88 8 138 10 142 42C170 34 194 56 180 78C178 88 170 88 160 88Z" fill={fill} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
    </svg>
  )
}

/** The seed bags she picks from: each shows what grows. */
export function SeedBag({ img, color }: { img: string; color: string }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 120 130" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path d="M30 30Q20 70 22 104Q24 124 60 124Q96 124 98 104Q100 70 90 30Z" fill={color} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d="M30 30Q60 40 90 30L96 16Q60 26 24 16Z" fill={lighten(color, 0.35)} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d="M24 16Q20 4 34 8M96 16Q100 4 86 8" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      </svg>
      <img src={img} alt="" draggable={false} style={{ position: 'absolute', left: '18%', top: '30%', width: '64%', height: '60%', objectFit: 'contain', pointerEvents: 'none' }} />
    </div>
  )
}

/** Puffs of dust where a stone lands. */
export function Dust({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <>
      {[-1, -0.4, 0.4, 1].map((d, i) => (
        <motion.div
          key={i}
          initial={{ x: x + d * w * 0.3 - 22, y: y - 22, scale: 0.4, opacity: 0.95 }}
          animate={{ x: x + d * w * 0.55 - 22, y: y - 22 - 30 - (i % 2) * 20, scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ position: 'absolute', left: 0, top: 0, width: 44, height: 44, borderRadius: '50%', background: '#EDE2D6', border: `4px solid ${INK}`, pointerEvents: 'none', zIndex: 30 }}
        />
      ))}
    </>
  )
}

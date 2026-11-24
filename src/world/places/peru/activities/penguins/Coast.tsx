// The desert coast at Paracas, drawn by hand in code in the flat look of src/world/shelf/STYLE.md: no dark outlines,
// each material a base, a shade and a light, the light from the top left. Nothing in this level is a generated
// picture. Here: the sky and the far shore (dunes, the hill with the Candelabra, flamingos), Pepa's cliff with its
// burrow and launch rock, and Lobo's rock in the bay. Everything is in stage units (layout.ts), so the cliff's ledge,
// burrow and lip are drawn exactly where the penguins stand.
import { motion } from 'motion/react'
import { useId, useMemo } from 'react'
import { roundedPath } from '../terraces/stones'
import type { PenguinStage } from './layout'

export const SAND = ['#f6c896', '#e0a474', '#fde3b8'] as const
export const STONE = ['#bcb6d6', '#9790ba', '#dedaf0'] as const
const CAVE = ['#8c6a8e', '#6f5479', '#b392ab'] as const
const f = (n: number) => Math.round(n * 2) / 2

/** The screen behind the stage: the sky down to the sea line (`seaPx` from the top), the sea below it. */
export const backdrop = (seaPx: number) =>
  `linear-gradient(#8fcdf8 0, #c9e8ff ${(seaPx * 0.6).toFixed(0)}px, #ffeede ${seaPx.toFixed(0)}px, #86dcec ${seaPx.toFixed(0)}px, #55b6e6 ${(seaPx * 1.5).toFixed(0)}px, #3f95d8 100%)`

/** A line of hills from x0 to x1: `h(x)` is how high the land stands over the sea there. */
function ridge(x0: number, x1: number, sea: number, h: (x: number) => number, dx = 0, dy = 0) {
  let d = `M${f(x0 + dx)} ${sea + 2}`
  for (let x = x0; x <= x1; x += 16) d += `L${f(x + dx)} ${f(sea - h(x) + dy)}`
  return `${d}L${f(x1 + dx)} ${sea + 2}Z`
}
const haze = (x: number) => 104 + 44 * Math.sin(x / 260 + 0.6) + 24 * Math.sin(x / 113 + 2.1) + 10 * Math.sin(x / 47 + 4)
const dune = (x: number) => 58 + 38 * Math.sin(x / 330 + 2.6) + 20 * Math.sin(x / 151 + 0.3)

/** The Candelabra's hill: one big round dune whose crest is left of the middle, so its long face catches the light. */
const hillPath = (x: number, y: number, k: number, sea: number) =>
  `M${f(x - 470 * k)} ${sea + 2}C${f(x - 330 * k)} ${f(sea - 30 * k)} ${f(x - 240 * k)} ${f(y - 150 * k)} ${f(x - 50 * k)} ${f(y - 164 * k)}C${f(x + 150 * k)} ${f(y - 176 * k)} ${f(x + 290 * k)} ${f(sea - 96 * k)} ${f(x + 480 * k)} ${sea + 2}Z`

/** The hill (its lit face, a rim of light, wind ripples) and the Candelabra: lines scratched in the hillside long ago. */
function CandelabraHill({ x, y, k, sea, clip }: { x: number; y: number; k: number; sea: number; clip: string }) {
  const d = hillPath(x, y, k, sea)
  return (
    <>
      <clipPath id={clip}>
        <path d={d} />
      </clipPath>
      <path d={d} fill={SAND[1]} />
      <g clipPath={`url(#${clip})`}>
        <path d={d} fill={SAND[0]} transform={`translate(${-46 * k} ${10 * k})`} />
        <path d={`M${f(x - 250 * k)} ${f(y - 96 * k)}Q${f(x - 150 * k)} ${f(y - 156 * k)} ${f(x - 60 * k)} ${f(y - 150 * k)}`} fill="none" stroke={SAND[2]} strokeWidth={14 * k} strokeLinecap="round" opacity="0.85" />
        <path d={`M${f(x - 300 * k)} ${f(sea - 34 * k)}q${50 * k} ${-12 * k} ${100 * k} 0M${f(x + 120 * k)} ${f(sea - 50 * k)}q${46 * k} ${-12 * k} ${92 * k} 0M${f(x + 200 * k)} ${f(sea - 18 * k)}q${40 * k} ${-10 * k} ${80 * k} 0`} fill="none" stroke={SAND[1]} strokeWidth={5 * k} strokeLinecap="round" opacity="0.7" />
      </g>
      <g transform={`translate(${x} ${y}) rotate(-5) scale(${k})`} fill="none" stroke="#fff4d8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.92">
        <path d="M0 70V-74" />
        <path d="M-48 -52V-6Q-48 14 -28 14H28Q48 14 48 -6V-52" />
        <path d="M-14 70H14" />
        <path d="M-12 -76L0 -92L12 -76M-58 -56L-48 -70L-38 -56M38 -56L48 -70L58 -56" strokeWidth="6" />
      </g>
    </>
  )
}

const CLOUDS = [
  { x: 0.18, y: 0.22, s: 1.15, t: 150 },
  { x: 0.57, y: 0.36, s: 0.8, t: 190 },
  { x: 0.36, y: 0.06, s: 0.9, t: 170 },
]

/** One flamingo standing in the shallows, far away (Paracas is where they live). */
function Flamingo({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M-2 0V-22M5 0V-20" stroke="#f09d80" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="2" cy="-28" rx="13" ry="9" fill="#ff9fc0" />
      <path d="M-9 -30Q-2 -38 9 -33Q2 -26 -9 -30Z" fill="#ffc4da" />
      <path d="M11 -30C20 -34 22 -46 15 -52C12 -55 14 -60 19 -60" fill="none" stroke="#ff9fc0" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M19 -62L27 -58L20 -56Z" fill="#fff7f0" />
      <path d="M24 -59.5L27 -58L22.5 -56.6Z" fill="#4a4466" />
    </g>
  )
}

/**
 * The far side of the bay: sun glow, drifting clouds, hazy mountains, peach dunes, the big sand hill with the
 * Candelabra scratched into it, and a pale beach on the waterline. `padX`/`padY`: how far the screen goes on past the
 * stage (stage units), so wide and tall screens are filled too.
 */
export function FarShore({ S, padX, padY }: { S: PenguinStage; padX: number; padY: number }) {
  const id = useId().replace(/:/g, '')
  const x0 = -padX - 40
  const x1 = S.w + padX + 40
  const sea = S.sea
  const c = S.candelabra
  const k = c.r / 85
  const paths = useMemo(() => ({ haze: ridge(x0, x1, sea, haze), dune: ridge(x0, x1, sea, dune), duneLit: ridge(x0, x1, sea, dune, -34, 16) }), [x0, x1, sea])
  return (
    <div aria-hidden style={{ position: 'absolute', left: x0, top: -padY, width: x1 - x0, height: sea + padY + 2, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* The sun: a pale disc in a wide warm glow. */}
      <div style={{ position: 'absolute', left: S.sun.x - x0 - S.sun.r * 3.4, top: S.sun.y + padY - S.sun.r * 3.4, width: S.sun.r * 6.8, height: S.sun.r * 6.8, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,246,204,.95), rgba(255,236,190,.42) 42%, rgba(255,236,190,0))' }} />
      <div style={{ position: 'absolute', left: S.sun.x - x0 - S.sun.r * 0.78, top: S.sun.y + padY - S.sun.r * 0.78, width: S.sun.r * 1.56, height: S.sun.r * 1.56, borderRadius: '50%', background: '#fffbe6' }} />

      {/* Clouds: round puffs with flat bottoms, drifting. */}
      {CLOUDS.map((cl, i) => (
        <motion.svg key={i} viewBox="0 0 260 96" animate={{ x: [0, 90, 0] }} transition={{ repeat: Infinity, duration: cl.t, ease: 'easeInOut' }} style={{ position: 'absolute', left: (x1 - x0) * cl.x - 130 * cl.s, top: padY + sea * cl.y, width: 260 * cl.s, height: 96 * cl.s, opacity: 0.92 }}>
          <path d="M34 92C14 92 4 80 6 66C8 52 22 44 36 48C40 26 62 12 86 16C102 2 134 0 150 18C170 10 196 20 200 42C222 38 250 50 252 70C254 84 242 92 226 92Z" fill="#fff" />
          <path d="M34 92C14 92 4 80 6 66C22 76 60 80 96 78C150 76 210 80 252 70C254 84 242 92 226 92Z" fill="#e8e2fa" opacity="0.7" />
        </motion.svg>
      ))}

      <svg viewBox={`${x0} ${-padY} ${x1 - x0} ${sea + padY + 2}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <clipPath id={`${id}d`}>
            <path d={paths.dune} />
          </clipPath>
          <linearGradient id={`${id}hz`} gradientUnits="userSpaceOnUse" x1="0" y1={sea - 180} x2="0" y2={sea}>
            <stop offset="0" stopColor="#e9cfe6" />
            <stop offset="1" stopColor="#fbe2dc" />
          </linearGradient>
        </defs>
        {/* Far: hazy mountains, pale and lavender. */}
        <path d={paths.haze} fill={`url(#${id}hz)`} />

        {/* Middle: peach dunes; each one's left face is lit. */}
        <path d={paths.dune} fill="#f7b999" />
        <g clipPath={`url(#${id}d)`}>
          <path d={paths.duneLit} fill="#ffd2b3" />
        </g>

        {/* The Candelabra's hill, nearer and richer. */}
        <CandelabraHill x={c.x} y={c.y} k={k} sea={sea} clip={`${id}h`} />

        {/* The far beach, and flamingos wading. */}
        <path d={`M${x0} ${sea - 9}Q${(x0 + x1) / 2} ${sea - 15} ${x1} ${sea - 9}V${sea + 2}H${x0}Z`} fill="#fff1d6" />
        <Flamingo x={c.x - 300 * k} y={sea - 3} s={0.72 * k} />
        <Flamingo x={c.x - 268 * k} y={sea - 5} s={0.6 * k} flip />
        <Flamingo x={c.x + 330 * k} y={sea - 4} s={0.62 * k} />
      </svg>
    </div>
  )
}

/**
 * A tuft of sea grass, swaying: rooted at x, y and growing up, or (`hang`) hanging down from there. Each tuft is its
 * own small picture, so its sway never repaints the cliff or the rock it grows on.
 */
function SeaGrass({ x, y, k = 1, hang = false, z, i = 0 }: { x: number; y: number; k?: number; hang?: boolean; z: number; i?: number }) {
  return (
    <div aria-hidden style={{ position: 'absolute', left: x - 34 * k, top: hang ? y - 4 * k : y - 58 * k, width: 68 * k, height: 62 * k, transform: hang ? 'scaleY(-1)' : undefined, pointerEvents: 'none', zIndex: z }}>
      <motion.svg viewBox="-34 -58 68 62" animate={{ skewX: [-7, 7, -7] }} transition={{ repeat: Infinity, duration: 3 + (i % 3) * 0.5, ease: 'easeInOut' }} style={{ display: 'block', width: '100%', height: '100%', transformOrigin: '50% 94%', overflow: 'visible' }}>
        <path d="M0 0C-10 -18 4 -30 -4 -50" fill="none" stroke="#3e9e78" strokeWidth="9" strokeLinecap="round" />
        <path d="M12 0C8 -14 20 -24 14 -40" fill="none" stroke="#69c19a" strokeWidth="8" strokeLinecap="round" />
        <path d="M-12 0C-22 -8 -16 -22 -24 -30" fill="none" stroke="#5cc6a6" strokeWidth="7" strokeLinecap="round" />
      </motion.svg>
    </div>
  )
}

/**
 * Pepa's cliff: warm sandstone with the flat launch rock on top (the penguins queue on `S.ledge`), her burrow in its
 * face (floor at `S.burrow.floor`, with a step out to the lip where divers hop out of the sea), and its foot going on
 * under the water down to the sea floor (`floor`), with sea stars on its steps.
 */
export function Cliff({ S, floor, padX }: { S: PenguinStage; floor: number; padX: number }) {
  const id = useId().replace(/:/g, '')
  const top = S.ledge - 2
  const left = S.cliff.x - padX - 80
  const nose = S.anchor.x + 44
  const lip = S.burrow.lip.x + 34
  const face = lip - 12
  const sea = S.sea
  const b = S.burrow
  const cl = b.left - 12
  const cr = b.right + 10
  const ct = b.top - 8
  const cf = b.floor + 4
  const deep = floor - sea
  const bottom = floor + 80
  const art = useMemo(() => {
    const body = roundedPath(
      [
        { x: left, y: top },
        { x: nose - 8, y: top },
        { x: nose + 4, y: top + 22 },
        { x: nose - 14, y: top + 52 },
        { x: face + 8, y: top + 92 },
        { x: face, y: cf - 60 },
        { x: lip - 2, y: cf - 18 },
        { x: lip + 6, y: cf + 12 },
        { x: lip - 20, y: sea - 6 },
        { x: lip - 10, y: sea + deep * 0.14 },
        { x: lip + 30, y: sea + deep * 0.2 },
        { x: lip + 24, y: sea + deep * 0.42 },
        { x: lip + 78, y: sea + deep * 0.5 },
        { x: lip + 70, y: sea + deep * 0.76 },
        { x: lip + 132, y: sea + deep * 0.84 },
        { x: lip + 150, y: bottom },
        { x: left, y: bottom },
      ],
      18,
    )
    const cave = `M${cl} ${cf}V${ct + 92}C${cl} ${ct + 24} ${cl + 46} ${ct} ${cl + 104} ${ct}H${cr - 96}C${cr - 38} ${ct} ${cr} ${ct + 30} ${cr} ${ct + 96}V${cf}Z`
    // Strata: soft bands that run through the rock, dipping a little to the right.
    const band = (y: number, h: number) => `M${left} ${f(y)}Q${f((left + nose) / 2)} ${f(y - 10)} ${nose + 60} ${f(y + 8)}V${f(y + h + 8)}Q${f((left + nose) / 2)} ${f(y + h - 10)} ${left} ${f(y + h)}Z`
    return { body, cave, band }
  }, [left, top, nose, face, lip, cf, cl, cr, ct, sea, deep, bottom])
  const star = (x: number, y: number, r: number, turn: number, fill: string, light: string) => {
    let d = ''
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + turn
      const rr = i % 2 ? r * 0.46 : r
      d += `${i ? 'L' : 'M'}${f(x + Math.sin(a) * rr)} ${f(y - Math.cos(a) * rr)}`
    }
    return (
      <g>
        <path d={`${d}Z`} fill={fill} stroke={fill} strokeWidth={r * 0.34} strokeLinejoin="round" />
        <circle cx={x - r * 0.12} cy={y - r * 0.14} r={r * 0.2} fill={light} />
      </g>
    )
  }
  // Where the foot steps out under the water: the top of each step (lit, and where things grow).
  const steps = [
    { x0: lip - 12, x1: lip + 28, y: sea + deep * 0.17 },
    { x0: lip + 24, x1: lip + 76, y: sea + deep * 0.46 },
    { x0: lip + 70, x1: lip + 130, y: sea + deep * 0.8 },
  ]
  const W = lip + 220 - left
  const box = { position: 'absolute', left, top: top - 40, width: W, height: bottom - top + 40, pointerEvents: 'none', overflow: 'visible' } as const
  const view = `${left} ${top - 40} ${W} ${bottom - top + 40}`
  return (
    <>
      <svg aria-hidden viewBox={view} style={{ ...box, zIndex: 4 }}>
        <defs>
          <clipPath id={`${id}b`}>
            <path d={art.body} />
          </clipPath>
          <clipPath id={`${id}c`}>
            <path d={art.cave} />
          </clipPath>
          <clipPath id={`${id}u`}>
            <rect x={left} y={sea} width={W} height={bottom - sea} />
          </clipPath>
          <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1="0" y1={sea} x2="0" y2={floor}>
            <stop offset="0" stopColor="#ecd3a2" />
            <stop offset="1" stopColor="#96a4d4" />
          </linearGradient>
        </defs>
        <path d={art.body} fill={SAND[1]} />
        <g clipPath={`url(#${id}b)`}>
          {/* The lit face: everything but a strip down the right side and the hollow under the launch rock. */}
          <path d={art.body} fill={SAND[0]} transform="translate(-30 0)" />
          <path d={`M${nose + 10} ${top + 20}L${face - 60} ${top + 26}Q${face - 20} ${top + 60} ${face - 24} ${top + 130}L${nose + 10} ${top + 130}Z`} fill={SAND[1]} />
          {/* Strata, pinker and paler by turns. */}
          <path d={art.band(top + 30, 20)} fill="#f3ae93" opacity="0.5" />
          <path d={art.band(top + 60, 12)} fill={SAND[2]} opacity="0.55" />
          <path d={art.band(cf + 18, 14)} fill="#f3ae93" opacity="0.45" />
          {/* Stones in the sandstone, each lit from the top left. */}
          {[
            [cl - 60, ct + 30, 30, 18],
            [cl - 34, cf - 30, 22, 13],
            [cl + 70, ct - 34, 26, 11],
            [cr + 22, ct + 60, 15, 22],
            [cr + 26, cf - 58, 12, 15],
            [cl + 150, cf + 26, 28, 9],
            [cl - 90, cf + 20, 34, 11],
          ].map(([x, y, rx, ry], i) => (
            <g key={i}>
              <ellipse cx={x + 3} cy={y + 3} rx={rx} ry={ry} fill={SAND[1]} />
              <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fbd9a9" />
              <ellipse cx={x - rx * 0.3} cy={y - ry * 0.34} rx={rx * 0.42} ry={ry * 0.3} fill="#fff0cf" />
            </g>
          ))}
          {/* The launch rock's top: a pale cap that wraps round its nose. */}
          <path d={`M${left} ${top - 6}H${nose + 30}V${top + 15}Q${nose - 30} ${top + 11} ${nose - 80} ${top + 14}T${nose - 240} ${top + 13}T${left} ${top + 14}Z`} fill="#fff0cf" />
          {/* Wet rock at the waterline. */}
          <rect x={left} y={sea - 12} width={W} height="14" fill="#cf8f66" opacity="0.5" />

          {/* Under the water the same rock goes cool and blue, deeper as it goes down; each step is lit on top. */}
          <g clipPath={`url(#${id}u)`}>
            <path d={art.body} fill="#6f86b8" />
            <path d={art.body} fill={`url(#${id}g)`} transform="translate(-30 0)" />
            <path d={art.band(sea + deep * 0.3, 30)} fill="#c98f7c" opacity="0.3" />
            <path d={art.band(sea + deep * 0.9, 36)} fill="#6f86b8" opacity="0.3" />
            {steps.map((st) => (
              <path key={st.y} d={`M${st.x0 - 190} ${f(st.y + 9)}Q${st.x0 - 100} ${f(st.y + 2)} ${st.x1 - 14} ${f(st.y + 4)}Q${st.x1 + 2} ${f(st.y + 4)} ${st.x1 + 2} ${f(st.y + 18)}Q${st.x1 - 30} ${f(st.y + 12)} ${st.x0 - 20} ${f(st.y + 16)}T${st.x0 - 190} ${f(st.y + 9)}Z`} fill="#fff6dc" opacity="0.55" />
            ))}
            {[0.26, 0.38, 0.58, 0.7, 0.92].map((k, i) => (
              <g key={k} transform={`translate(${lip - 90 - (i % 3) * 70 + i * 30} ${f(sea + deep * k)})`}>
                <ellipse rx={26 + (i % 2) * 10} ry={12 + (i % 2) * 4} fill="#fff6dc" opacity="0.26" />
                <ellipse cx="-8" cy="-4" rx={10 + (i % 2) * 4} ry="4" fill="#fff" opacity="0.3" />
              </g>
            ))}
          </g>
          {/* A fringe of sea moss right under the waterline. */}
          <path d={`M${left} ${sea + 1}H${lip + 60}V${sea + 9}${Array.from({ length: Math.ceil((lip + 60 - left) / 20) }, () => 'q-10 13 -20 0').join('')}Z`} fill="#5cc6a6" />
        </g>

        {/* Little cracks, a pebble and a dry tuft. */}
        <path d={`M${face - 40} ${top + 150}q10 22 2 44M${cl - 110} ${ct + 96}q-12 20 -4 44M${cl + 196} ${ct - 96}q20 8 44 2`} fill="none" stroke={SAND[1]} strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        <g transform={`translate(${nose - 250} ${top})`}>
          <path d="M0 0q-8 -18 -16 -22M2 0q0 -22 -2 -30M4 0q8 -16 16 -18" fill="none" stroke="#a9c98a" strokeWidth="4.5" strokeLinecap="round" />
        </g>
        <ellipse cx={nose - 208} cy={top - 3} rx="13" ry="7" fill={STONE[0]} />
        <ellipse cx={nose - 211} cy={top - 5} rx="6" ry="3" fill={STONE[2]} />

        {/* The burrow: dusky inside (darker up under its roof), a sandy floor, a nest of dry kelp. */}
        <path d={art.cave} fill={CAVE[1]} />
        <g clipPath={`url(#${id}c)`}>
          <path d={art.cave} fill={CAVE[0]} transform="translate(0 34)" />
          <path d={`M${cl - 10} ${cf - 20}Q${(cl + cr) / 2} ${cf - 46} ${cr + 10} ${cf - 20}V${cf + 10}H${cl - 10}Z`} fill="#f7d6a6" />
        </g>
        {/* The burrow's floor runs out to the step as one pale ledge. */}
        <path d={`M${cl - 6} ${cf - 3}H${lip + 2}Q${lip + 10} ${cf - 3} ${lip + 10} ${cf + 4}Q${lip + 10} ${cf + 9} ${lip} ${cf + 9}Q${(cl + lip) / 2} ${cf + 5} ${cl - 6} ${cf + 9}Z`} fill="#fff0cf" />
        <g fill="none" strokeLinecap="round" strokeWidth="5">
          <path d={`M${b.left + (b.right - b.left) * 0.34} ${cf - 8}q${(b.right - b.left) * 0.3} 16 ${(b.right - b.left) * 0.62} -2`} stroke="#d9a868" />
          <path d={`M${b.left + (b.right - b.left) * 0.4} ${cf - 14}q${(b.right - b.left) * 0.24} 16 ${(b.right - b.left) * 0.5} 0`} stroke="#fdeecc" />
          <path d={`M${b.left + (b.right - b.left) * 0.38} ${cf - 2}l-14 -10M${b.right - 4} ${cf - 6}l12 -10`} stroke="#d9a868" />
        </g>
        <g fill="#fff7f0">
          <circle cx={lip - 46} cy={sea - 20} r="5" />
          <circle cx={lip - 34} cy={sea - 27} r="3.6" />
          <circle cx={lip - 58} cy={sea - 28} r="3" />
          <circle cx={lip - 104} cy={sea - 18} r="4" />
        </g>
      </svg>

      {/* What grows on the steps under the water (in front of the sea's blue, so it stays bright). */}
      <svg aria-hidden viewBox={view} style={{ ...box, zIndex: 7 }}>
        {star(steps[0].x1 - 22, steps[0].y - 6, 19, 0.3, '#ff8fb8', '#ffc4da')}
        {star(steps[2].x0 - 52, steps[2].y - 2, 17, 1, '#ffb35c', '#ffe189')}
        {/* An anemone, a clutch of mussels, a sea urchin. */}
        <g transform={`translate(${steps[1].x1 - 30} ${f(steps[1].y + 6)})`}>
          <path d="M-16 0Q-24 -26 -12 -32M-6 0Q-8 -32 0 -38M6 0Q8 -32 14 -34M16 0Q26 -22 22 -30" fill="none" stroke="#ff9fc0" strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="0" cy="1" rx="22" ry="10" fill="#e7699c" />
          <ellipse cx="-6" cy="-2" rx="9" ry="3" fill="#ff9fc0" />
        </g>
        <g transform={`translate(${lip - 44} ${sea + 36})`}>
          {[[0, 0, -20], [15, 6, 12], [-13, 9, -40], [4, 16, 30]].map(([x, y, r]) => (
            <g key={x} transform={`translate(${x} ${y}) rotate(${r})`}>
              <ellipse rx="6.5" ry="11" fill="#8b78e6" />
              <ellipse cx="-2" cy="-3" rx="2" ry="5" fill="#b3a5f2" />
            </g>
          ))}
        </g>
        <g transform={`translate(${steps[2].x1 - 26} ${f(steps[2].y - 6)})`}>
          <path d="M0 -22V22M-22 0H22M-16 -16L16 16M-16 16L16 -16M-8 -21L8 21M-21 -8L21 8M-21 8L21 -8M-8 21L8 -21" stroke="#6a57c7" strokeWidth="3.5" strokeLinecap="round" />
          <circle r="13" fill="#8b78e6" />
          <circle cx="-4" cy="-4" r="4" fill="#b3a5f2" />
        </g>
      </svg>
      {/* Sea grass on each step, swaying. */}
      {steps.map((st, i) => (
        <SeaGrass key={i} x={st.x0 - 34 - i * 22} y={st.y + 8} z={7} i={i} />
      ))}
    </>
  )
}

/** Lobo's rock in the bay: a low grey slab with a flat top (`S.rock.top`), wet and mossy where the sea laps it. */
export function SeaRock({ S }: { S: PenguinStage }) {
  const id = useId().replace(/:/g, '')
  const { x, w, top } = S.rock
  const sea = S.sea
  const r = x + w
  const d = `M${x + 60} ${sea + 70}C${x + 10} ${sea + 54} ${x - 8} ${sea + 8} ${x + 12} ${sea - 20}C${x + 20} ${top + 8} ${x + 40} ${top} ${x + 66} ${top}H${r - 70}C${r - 40} ${top} ${r - 22} ${top + 10} ${r - 10} ${sea - 16}C${r + 10} ${sea + 12} ${r - 6} ${sea + 50} ${r - 54} ${sea + 66}C${r - 120} ${sea + 88} ${x + 130} ${sea + 92} ${x + 60} ${sea + 70}Z`
  return (
    <>
      {/* Sea grass hanging under it. */}
      <SeaGrass x={x + w * 0.24} y={sea + 58} hang z={5} i={0} />
      <SeaGrass x={x + w * 0.52} y={sea + 72} k={1.15} hang z={5} i={1} />
      <SeaGrass x={x + w * 0.78} y={sea + 58} k={0.9} hang z={5} i={2} />
      <svg aria-hidden viewBox={`${x - 40} ${top - 20} ${w + 80} ${sea + 170 - top}`} style={{ position: 'absolute', left: x - 40, top: top - 20, width: w + 80, height: sea + 170 - top, pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}>
      <defs>
        <clipPath id={`${id}r`}>
          <path d={d} />
        </clipPath>
        <clipPath id={`${id}u`}>
          <rect x={x - 40} y={sea} width={w + 80} height="170" />
        </clipPath>
      </defs>
      <path d={d} fill={STONE[1]} />
      <g clipPath={`url(#${id}r)`}>
        <path d={d} fill={STONE[0]} transform="translate(-26 -6)" />
        <path d={`M${x} ${top - 4}H${r}V${top + 15}Q${x + w * 0.6} ${top + 9} ${x + w * 0.4} ${top + 14}T${x} ${top + 13}Z`} fill={STONE[2]} />
        <path d={`M${x + w * 0.2} ${top + 30}l14 8l-4 10M${x + w * 0.7} ${top + 28}l-10 12`} fill="none" stroke={STONE[1]} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x={x - 20} y={sea - 10} width={w + 40} height="12" fill="#7d76a6" opacity="0.5" />
        {/* Under the water: cooler, with paler stones in it. */}
        <g clipPath={`url(#${id}u)`}>
          <path d={d} fill="#7a84b8" />
          <path d={d} fill="#9aa6cf" transform="translate(-26 -10)" />
          <ellipse cx={x + w * 0.3} cy={sea + 34} rx="34" ry="13" fill="#fff" opacity="0.2" />
          <ellipse cx={x + w * 0.62} cy={sea + 46} rx="42" ry="12" fill="#fff" opacity="0.16" />
        </g>
        <path d={`M${x - 10} ${sea + 1}H${r + 10}V${sea + 9}${Array.from({ length: Math.ceil((w + 20) / 20) }, () => 'q-10 13 -20 0').join('')}Z`} fill="#5cc6a6" />
      </g>
      <g fill="#fff7f0">
        <circle cx={x + w * 0.3} cy={sea - 19} r="4.6" />
        <circle cx={x + w * 0.33} cy={sea - 27} r="3" />
        <circle cx={x + w * 0.7} cy={sea - 20} r="4" />
      </g>
      </svg>
    </>
  )
}

/** The opening picture behind the story line: the bay from the top of the cliff, where Sparkle and Pepa stand. */
export function CoastOpening() {
  const id = useId().replace(/:/g, '')
  const ridgeD = useMemo(() => ({ haze: ridge(-200, 1640, 560, haze), dune: ridge(-200, 1640, 560, dune), lit: ridge(-200, 1640, 560, dune, -34, 16) }), [])
  return (
    <svg viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#8fcdf8' }}>
      <defs>
        <linearGradient id={`${id}s`} gradientUnits="userSpaceOnUse" x1="0" y1="-400" x2="0" y2="560">
          <stop offset="0" stopColor="#8fcdf8" />
          <stop offset="0.7" stopColor="#c9e8ff" />
          <stop offset="1" stopColor="#ffeede" />
        </linearGradient>
        <linearGradient id={`${id}w`} gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="860">
          <stop offset="0" stopColor="#9be4ee" />
          <stop offset="1" stopColor="#4fb2e2" />
        </linearGradient>
        <radialGradient id={`${id}g`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6cc" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffecbe" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}d`}>
          <path d={ridgeD.dune} />
        </clipPath>
      </defs>
      <rect x="-1000" y="-1000" width="3440" height="1562" fill={`url(#${id}s)`} />
      <circle cx="1060" cy="190" r="230" fill={`url(#${id}g)`} />
      <circle cx="1060" cy="190" r="50" fill="#fffbe6" />
      <g fill="#fff" opacity="0.92">
        <path d="M270 232C250 232 240 220 242 206C244 192 258 184 272 188C276 166 298 152 322 156C338 142 370 140 386 158C406 150 432 160 436 182C458 178 486 190 488 210C490 224 478 232 462 232Z" />
        <path d="M770 142C756 142 749 134 750 124C752 114 762 109 771 111C774 96 789 86 806 89C817 79 839 78 850 90C864 85 882 92 885 107C900 104 919 113 921 127C922 136 914 142 903 142Z" />
      </g>
      <path d={ridgeD.haze} fill="#eed6e6" />
      <path d={ridgeD.dune} fill="#f7b999" />
      <g clipPath={`url(#${id}d)`}>
        <path d={ridgeD.lit} fill="#ffd2b3" />
      </g>
      <CandelabraHill x={900} y={440} k={0.74} sea={560} clip={`${id}h`} />
      <path d="M-1000 551Q720 543 2440 551V562H-1000Z" fill="#fff1d6" />
      <Flamingo x={500} y={557} s={0.7} />
      <Flamingo x={536} y={555} s={0.58} flip />

      {/* The bay, with light on it. */}
      <rect x="-1000" y="560" width="3440" height="320" fill={`url(#${id}w)`} />
      <g fill="#fff" opacity="0.55">
        <rect x="300" y="600" width="150" height="7" rx="3.5" />
        <rect x="860" y="632" width="210" height="8" rx="4" />
        <rect x="560" y="676" width="120" height="8" rx="4" />
        <rect x="1130" y="700" width="170" height="9" rx="4.5" />
        <rect x="120" y="716" width="130" height="9" rx="4.5" />
      </g>
      {/* The top of the cliff they stand on: pale sandstone, a shaded edge, pebbles and a dry tuft. */}
      <path d="M-1000 792Q200 742 720 760T2440 790V1100H-1000Z" fill={SAND[1]} />
      <path d="M-1000 808Q200 758 720 776T2440 806V1100H-1000Z" fill={SAND[0]} />
      <path d="M-1000 808Q200 758 720 776T2440 806V826Q1500 792 720 796T-1000 828Z" fill="#fff0cf" />
      <path d="M180 900q60 -14 120 0M940 930q70 -16 140 0M560 960q50 -12 100 0" fill="none" stroke={SAND[1]} strokeWidth="7" strokeLinecap="round" opacity="0.8" />
      <ellipse cx="330" cy="842" rx="26" ry="13" fill={STONE[0]} />
      <ellipse cx="323" cy="838" rx="12" ry="5" fill={STONE[2]} />
      <ellipse cx="1150" cy="866" rx="20" ry="10" fill={STONE[0]} />
      <path d="M1230 826q-12 -28 -24 -34M1233 826q0 -34 -3 -46M1236 826q12 -24 24 -28" fill="none" stroke="#a9c98a" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

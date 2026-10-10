// Coco's Canyon Glide's scenery, in world units (see canyon.ts). One camera: a straight-on side view of the canyon's
// cross-section. The rock walls, the river, the waterfall and the warm-air swirls are drawn in code in the art's flat
// style (5-unit dark outline, flat fills), so what she flies around is exactly where the walls are. Critters and
// people are generated sprites. Nearly everything answers a tap (play-design: "everything reacts").
import { motion } from 'motion/react'
import { forwardRef, useState, type ReactNode } from 'react'
import { Buddy, type PuppetHandle } from '../../../../../sdk'
import { art } from '../../art'
import { INK } from '../../puppets/Alpaca'
import { FALLS_TOP, LEFT_FACE, LEFT_RIM, LOOKOUT, NEST, PLACES, RIGHT_FACE, RIGHT_RIM, RIVER_Y, WORLD, type PlaceId, type Swirl } from './canyon'
import { csfx } from './sfx'

const ROCK = '#E59A72'
const ROCK_DARK = '#C9776A'
const SAND = '#F2C69B'
const GRASS = '#8FE3C8'
const GRASS_DARK = '#5FC6A4'
const WATER = '#7CC7F0'
const CHUNK = 600
const DEEP = WORLD.h + 300

/** Sunlight on each wall: 0 = in the shade, 1 = sunny. */
export type Sun = { left: number; right: number }

/** A wall's outline: the plateau, down the face to below the river. */
function wallPath(side: 'left' | 'right') {
  const face = side === 'left' ? LEFT_FACE : RIGHT_FACE
  const rim = side === 'left' ? LEFT_RIM : RIGHT_RIM
  const out = side === 'left' ? -300 : WORLD.w + 300
  const pts = [[out, rim], ...face, [face[face.length - 1][0], DEEP], [out, DEEP]]
  return `M${pts.map(([x, y]) => `${x} ${y}`).join('L')}Z`
}

/** Rock layers across a wall (the canyon's stripes), as wavy lines. */
function strata(side: 'left' | 'right') {
  const x0 = side === 'left' ? -300 : 1700
  const x1 = side === 'left' ? 1300 : WORLD.w + 300
  const lines: string[] = []
  for (let y = 700, i = 0; y < WORLD.h; y += 190, i++) {
    let d = ''
    for (let x = x0; x <= x1; x += 80) d += `${d ? 'L' : 'M'}${x} ${(y + Math.sin(x / 140 + i * 1.7) * 14 + (side === 'left' ? (x - x0) * 0.06 : -(x - x0) * 0.06)).toFixed(0)} `
    lines.push(d)
  }
  return lines
}

/** One wall, cut into horizontal chunks (each a small SVG, so WebKit never holds one giant layer). */
export function Wall({ side, sun }: { side: 'left' | 'right'; sun: number }) {
  const path = wallPath(side)
  const lines = strata(side)
  const x0 = side === 'left' ? -300 : 1700
  const w = 1600
  const rim = side === 'left' ? LEFT_RIM : RIGHT_RIM
  const chunks: ReactNode[] = []
  for (let y0 = rim - 140; y0 < WORLD.h; y0 += CHUNK) {
    const id = `canyon-${side}-${y0}`
    chunks.push(
      <svg key={y0} viewBox={`${x0} ${y0} ${w} ${CHUNK + 2}`} style={{ position: 'absolute', left: x0, top: y0, width: w, height: CHUNK + 2, display: 'block', pointerEvents: 'none' }}>
        <defs>
          <clipPath id={id}>
            <path d={path} />
          </clipPath>
        </defs>
        <path d={path} fill={ROCK} />
        <g clipPath={`url(#${id})`}>
          {lines.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={i % 2 ? SAND : ROCK_DARK} strokeWidth={i % 2 ? 26 : 10} strokeLinecap="round" opacity={i % 2 ? 0.7 : 0.55} />
          ))}
          {/* Grass along the top of the plateau. */}
          <rect x={x0} y={rim - 5} width={w} height={34} fill={GRASS} />
          <path d={`M${x0} ${rim + 29}H${x0 + w}`} stroke={GRASS_DARK} strokeWidth="6" />
          {/* The shade: lavender while the sun is on the other wall. */}
          <rect x={x0} y={y0} width={w} height={CHUNK + 2} fill="#6B5B8A" style={{ opacity: (1 - sun) * 0.3, transition: 'opacity 3s ease' }} />
        </g>
        <path d={path} fill="none" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      </svg>,
    )
  }
  return <>{chunks}</>
}

/** Little bushes and rocks on the ledges and slopes (code-drawn, same style). */
export function Ledges() {
  const bush = (x: number, y: number, s = 1) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth="5">
      <circle cx="-22" cy="-16" r="20" fill={GRASS} />
      <circle cx="16" cy="-18" r="22" fill={GRASS} />
      <circle cx="-2" cy="-32" r="22" fill={GRASS} />
      <path d="M-34 0H32" strokeWidth="6" />
    </g>
  )
  return (
    <svg viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} style={{ position: 'absolute', left: 0, top: 0, width: WORLD.w, height: WORLD.h, pointerEvents: 'none', overflow: 'visible' }}>
      {bush(790, 1600, 0.9)}
      {bush(1000, 1608, 0.7)}
      {bush(2420, 1050, 0.8)}
      {bush(1120, 2600, 1.1)}
      {bush(1950, 2620, 1)}
      {bush(600, 1050, 0.8)}
      {bush(2440, 700, 0.8)}
      {bush(80, LEFT_RIM + 2, 1)}
      {bush(2900, RIGHT_RIM + 2, 1.1)}
      {/* The nest: a ring of twigs on the ledge. */}
      <g transform={`translate(${NEST.x} ${NEST.y})`} stroke={INK} strokeWidth="5" strokeLinecap="round">
        <ellipse cx="0" cy="-8" rx="92" ry="22" fill="#C08A5A" />
        <path d="M-84 -14L-30 -2M-60 -24L10 -8M-10 -26L70 -10M30 -22L88 -4M-80 0L60 -20" fill="none" stroke="#8C5E3C" strokeWidth="6" />
      </g>
      {/* The ridge: a flat top with one flag-stone cairn (no flag needed; just a little stack). */}
      <g transform={`translate(${PLACES.ridge.x + 60} ${RIGHT_RIM})`} stroke={INK} strokeWidth="5">
        <ellipse cx="0" cy="-14" rx="44" ry="16" fill="#C9B8D9" />
        <ellipse cx="2" cy="-40" rx="32" ry="14" fill="#D9CCFF" />
        <ellipse cx="-2" cy="-62" rx="20" ry="11" fill="#C9B8D9" />
      </g>
    </svg>
  )
}

/** The Colca river at the bottom, with moving glints. Tap it: it sparkles. */
export function River({ onTap }: { onTap: () => void }) {
  return (
    <div data-river onPointerDown={onTap} style={{ position: 'absolute', left: 1000, top: RIVER_Y - 20, width: 1100, height: WORLD.h - RIVER_Y + 40 }}>
      <svg viewBox={`1000 ${RIVER_Y - 20} 1100 ${WORLD.h - RIVER_Y + 40}`} style={{ width: '100%', height: '100%', display: 'block' }}>
        <path d={`M1000 ${RIVER_Y}Q1100 ${RIVER_Y - 12} 1200 ${RIVER_Y}T1400 ${RIVER_Y}T1600 ${RIVER_Y}T1800 ${RIVER_Y}T2000 ${RIVER_Y}T2100 ${RIVER_Y}V${WORLD.h + 20}H1000Z`} fill={WATER} stroke={INK} strokeWidth="6" />
        <g className="canyon-glints" stroke="#E6F6FF" strokeWidth="8" strokeLinecap="round">
          <path d={`M1300 ${RIVER_Y + 40}h70M1560 ${RIVER_Y + 70}h90M1760 ${RIVER_Y + 36}h60M1440 ${RIVER_Y + 110}h50`} />
        </g>
      </svg>
    </div>
  )
}

/** The waterfall, tumbling down the right wall into the river, with mist at the bottom (and a rainbow once visited). */
export function Waterfall({ rainbow }: { rainbow: boolean }) {
  const pts = [[FALLS_TOP.x - 10, FALLS_TOP.y], ...RIGHT_FACE.filter(([, y]) => y > FALLS_TOP.y).map(([x, y]) => [x - 18, y])]
  pts[pts.length - 1] = [pts[pts.length - 1][0], RIVER_Y + 10]
  const d = `M${pts.map(([x, y]) => `${x} ${y}`).join('L')}`
  const base = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} style={{ position: 'absolute', left: 0, top: 0, width: WORLD.w, height: WORLD.h, pointerEvents: 'none', overflow: 'visible' }}>
      <path d={d} fill="none" stroke={INK} strokeWidth="78" strokeLinejoin="round" strokeLinecap="butt" />
      <path d={d} fill="none" stroke={WATER} strokeWidth="66" strokeLinejoin="round" strokeLinecap="butt" />
      <path className="canyon-falls" d={d} fill="none" stroke="#E6F6FF" strokeWidth="12" strokeDasharray="40 70" strokeLinecap="round" />
      <path className="canyon-falls" d={d} fill="none" stroke="#C4E8FF" strokeWidth="8" strokeDasharray="20 90" strokeDashoffset="50" strokeLinecap="round" transform="translate(-16 0)" />
      {/* Where it comes out: a dark crack in the rock with a little overhang, and foam where it tips over. */}
      <path d={`M${FALLS_TOP.x - 60} ${FALLS_TOP.y + 6}Q${FALLS_TOP.x - 40} ${FALLS_TOP.y - 70} ${FALLS_TOP.x + 30} ${FALLS_TOP.y - 40}L${FALLS_TOP.x + 30} ${FALLS_TOP.y + 10}Z`} fill="#8C5E6A" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d={`M${FALLS_TOP.x - 74} ${FALLS_TOP.y - 52}Q${FALLS_TOP.x - 20} ${FALLS_TOP.y - 96} ${FALLS_TOP.x + 40} ${FALLS_TOP.y - 70}`} fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      {[-44, -14, 14].map((dx, i) => (
        <circle key={dx} className="canyon-mist" cx={FALLS_TOP.x + dx} cy={FALLS_TOP.y + 2 + (i % 2) * 8} r={16 - (i % 2) * 4} fill="#F4FBFF" stroke={INK} strokeWidth="3.5" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
      <g transform={`translate(${base[0]} ${base[1] - 10})`}>
        {[-70, -20, 30, 80].map((x, i) => (
          <circle key={x} className="canyon-mist" cx={x} cy={-10 - (i % 2) * 20} r={36 - (i % 2) * 8} fill="#F4FBFF" stroke={INK} strokeWidth="4" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </g>
      {rainbow && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} transform={`translate(${base[0] + 10} ${base[1] - 30})`} fill="none" strokeLinecap="round">
          {['#FF8FB8', '#FFC83D', '#8FE3C8', '#A8DCFF', '#B9A6F5'].map((c, i) => (
            <path key={c} d={`M${-260 + i * 22} 0A${260 - i * 22} ${200 - i * 18} 0 0 1 ${260 - i * 22} 0`} stroke={c} strokeWidth="20" />
          ))}
        </motion.g>
      )}
    </svg>
  )
}

/** A column of warm air: shimmering wavy lines rising off a sunny rock. Its leaves and dust are particles (see Rising). */
export function SwirlArt({ s, on, glow }: { s: Swirl; on: boolean; glow: boolean }) {
  const h = s.bottom - s.top
  const wave = (dx: number, k: number) => {
    let d = ''
    for (let y = h; y >= 0; y -= 40) d += `${d ? 'L' : 'M'}${(s.w / 2 + dx + Math.sin(y / 70 + k) * 22).toFixed(0)} ${y}`
    return d
  }
  return (
    <div style={{ position: 'absolute', left: s.x - s.w / 2, top: s.top, width: s.w, height: h, opacity: on ? 1 : 0, transition: 'opacity 2.5s ease', pointerEvents: 'none' }}>
      <svg viewBox={`0 0 ${s.w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`fade-${s.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.25" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id={`mask-${s.id}`}>
            <rect x="-60" y="0" width={s.w + 120} height={h} fill={`url(#fade-${s.id})`} />
          </mask>
        </defs>
        <g mask={`url(#mask-${s.id})`} fill="none" strokeLinecap="round">
          {/* A soft warm band, then the shimmer lines climbing up. */}
          <rect x={s.w * 0.12} y="0" width={s.w * 0.76} height={h} rx={s.w * 0.38} fill={glow ? '#FFE9A8' : '#FFF1C9'} opacity={glow ? 0.55 : 0.35} />
          {[-0.24, 0, 0.24].map((k, i) => (
            <path key={i} className="canyon-shimmer" d={wave(k * s.w, i * 1.9)} stroke={i % 2 ? '#FFC83D' : '#FFB4A0'} strokeWidth="12" strokeDasharray="200 120" opacity="0.75" style={{ animationDelay: `${-i * 0.6}s` }} />
          ))}
        </g>
      </svg>
      {/* The sunny rock it rises from: a warm glow. */}
      <div className="canyon-sunspot" style={{ position: 'absolute', left: '10%', right: '10%', bottom: -40, height: 80, borderRadius: '50%', background: 'radial-gradient(#FFE27A, rgba(255,226,122,0) 70%)' }} />
    </div>
  )
}

/** A shiny circle on a place to lead Pluma to. */
export function PlaceRing({ id, done }: { id: PlaceId; done: boolean }) {
  const p = PLACES[id]
  return (
    <motion.div
      aria-hidden
      initial={{ scale: 0 }}
      animate={{ scale: done ? 1.6 : 1, opacity: done ? 0 : 1 }}
      transition={{ duration: done ? 0.7 : 0.5 }}
      style={{ position: 'absolute', left: p.x - 140, top: p.y - 140, width: 280, height: 280, pointerEvents: 'none' }}
    >
      <div className="canyon-ring" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '14px dashed #FFC83D', boxShadow: '0 0 0 6px rgba(255,255,255,.75), inset 0 0 0 6px rgba(255,255,255,.75)' }} />
      <svg viewBox="-20 -20 40 40" style={{ position: 'absolute', left: '50%', top: '50%', width: 90, height: 90, translate: '-50% -50%' }} className="canyon-ring-star">
        <path d="M0 -16L5 -5L16 -4L8 4L10 16L0 10L-10 16L-8 4L-16 -4L-5 -5Z" fill="#FFC83D" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    </motion.div>
  )
}

/** A tappable critter: a sprite that does a little something. */
export const Critter = forwardRef<PuppetHandle, { label: string; img: string; x: number; bottom: number; h: number; aspect: number; flip?: boolean; onTap: () => void; z?: number }>(function Critter(
  { label, img, x, bottom, h, aspect, flip, onTap, z = 4 },
  ref,
) {
  return (
    <button
      aria-label={label}
      onClick={onTap}
      style={{ position: 'absolute', left: x - (h * aspect) / 2 - 20, top: bottom - h - 20, width: h * aspect + 40, height: h + 20, padding: 0, background: 'none', border: 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: z }}
    >
      <Buddy ref={ref} img={img} height={`${h}px`} flip={flip} calm />
    </button>
  )
})

/** The lookout on the left rim: a stone wall, and tourists who wave, cheer and take pictures. */
export function Lookout({ flash, onTap, buddy }: { flash: number; onTap: () => void; buddy: React.RefObject<PuppetHandle | null> }) {
  const h = 230
  return (
    <>
      <button aria-label="Tourists" onClick={onTap} style={{ position: 'absolute', left: LOOKOUT.x - 150, top: LOOKOUT.y - h - 10, width: 300, height: h + 10, padding: 0, background: 'none', border: 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 3 }}>
        <Buddy ref={buddy} img={art.canyonTourists} height={`${h}px`} calm />
        {flash > 0 && (
          <motion.div key={flash} initial={{ opacity: 1, scale: 0.4 }} animate={{ opacity: 0, scale: 1.8 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', left: '22%', top: '18%', width: 70, height: 70, borderRadius: '50%', background: 'radial-gradient(#fff, rgba(255,255,255,0) 70%)', pointerEvents: 'none' }} />
        )}
      </button>
      {/* The stone wall in front of them (the lookout's edge). */}
      <svg viewBox="0 0 320 90" style={{ position: 'absolute', left: LOOKOUT.x - 160, top: LOOKOUT.y - 82, width: 320, height: 90, pointerEvents: 'none', zIndex: 4 }}>
        <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <rect x="6" y="20" width="308" height="66" rx="10" fill="#C9B8D9" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={10 + i * 76} y="8" width="66" height="34" rx="9" fill="#D9CCFF" />
          ))}
          <path d="M44 50V82M120 54V86M196 50V82M272 54V86" fill="none" stroke="#B9A6F5" strokeWidth="4" />
        </g>
      </svg>
    </>
  )
}

/** A cloud drifting across the sky. Coco can fly through it (and sneezes). */
export const Cloud = forwardRef<HTMLDivElement, { w: number }>(function Cloud({ w }, ref) {
  const [puff, setPuff] = useState(0)
  return (
    <div ref={ref} data-cloud style={{ position: 'absolute', left: 0, top: 0, width: w, height: w / ASPECT.cloud, willChange: 'transform' }} onPointerDown={() => (setPuff((p) => p + 1), csfx.puff())}>
      <motion.img key={puff} src={art.canyonCloud} alt="" draggable={false} animate={puff ? { scale: [1, 1.15, 0.95, 1] } : undefined} transition={{ duration: 0.5 }} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
    </div>
  )
})

/** width / height of the canyon's sprites (they're trimmed to their content). */
export const ASPECT = {
  coco: 1.161,
  pluma: 0.801,
  perched: 0.91,
  viscacha: 0.918,
  cactus: 0.658,
  tourists: 0.98,
  cloud: 1.631,
  swallowNest: 0.973,
}

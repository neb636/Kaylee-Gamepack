// The desert at Giza where the Sphinx sleeps, drawn by hand in the Nile's look (no generated pictures): the same sky,
// sun, clouds and palms as the river level, the three pyramids on the horizon and soft dunes down to the sand she digs
// in. Scenery has flat tones and no outlines. The sun, the clouds and the palms react to a tap, like on the Nile.
import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import { Cloud, Palm, Sun } from './nile/Scenery'
import { nsfx } from './nile/sfx'

/** The sand right around the Sphinx: the bottom of the sand heap is painted this color, so its feet melt into the ground. */
export const GROUND = '#F6D7A0'
/** How high the horizon is, from the bottom of the screen. */
const HORIZON = '47cqh'

const layer: CSSProperties = { position: 'absolute', left: 0, width: '100%', display: 'block', overflow: 'visible', pointerEvents: 'none' }
const CLOUDS = [
  { left: '8cqw', top: '17cqh', size: 22, drift: 5, secs: 38 },
  { left: '42cqw', top: '30cqh', size: 15, drift: -4, secs: 46 },
  { left: '70cqw', top: '38cqh', size: 12, drift: 3, secs: 32 },
]

/** Fills its parent. `still` leaves out what can be tapped (the story picture, where a tap anywhere skips). */
export function SphinxDesert({ still = false }: { still?: boolean }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', containerType: 'size', background: GROUND, ['--u' as string]: '1cqmin', pointerEvents: still ? 'none' : undefined }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: HORIZON, background: 'linear-gradient(#8FCDF7 0%, #BDE3FB 55%, #FFEFD9 100%)' }} />
      <div style={{ position: 'absolute', right: 'calc(4cqw + var(--u) * 20)', top: 'calc(var(--top-clear, 96px) + 9cqh)' }}>
        <Sun onTap={() => nsfx.twinkle()} />
      </div>
      {CLOUDS.map((c, i) => (
        <motion.div key={i} animate={{ x: [`${-c.drift}cqw`, `${c.drift}cqw`] }} transition={{ duration: c.secs, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }} style={{ position: 'absolute', left: c.left, top: c.top }}>
          <Cloud size={c.size} onTap={() => nsfx.puff()} />
        </motion.div>
      ))}

      {/* Far away: pale dunes and the three pyramids of Giza, a lit face and a shaded face each. The drawing keeps its
          shape on every screen and stands on the horizon; its dunes run on past both edges. */}
      <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax meet" style={{ ...layer, bottom: `calc(${HORIZON} - 1px)`, height: '30cqh' }}>
        <path d="M-1400 300 L-1400 262 C-1000 236 -700 250 -420 258 C-180 264 60 232 300 240 C470 246 560 262 700 258 C900 252 1200 238 1500 250 C1900 264 2300 244 2600 256 L2600 300Z" fill="#FBEBC8" />
        <g>
          <path d="M700 196 L800 290 L600 290Z" fill="#F9DEAB" />
          <path d="M700 196 L800 290 L732 290Z" fill="#EAC084" />
          <path d="M880 70 L1068 290 L692 290Z" fill="#F7D79C" />
          <path d="M880 70 L1068 290 L938 290Z" fill="#E6B877" />
          <path d="M1062 150 L1180 290 L944 290Z" fill="#F7D79C" />
          <path d="M1062 150 L1180 290 L1100 290Z" fill="#E6B877" />
        </g>
        <path d="M-1400 300 L-1400 284 C-900 270 -500 286 -100 280 C200 276 420 286 640 284 C860 282 1000 272 1240 278 C1600 286 2100 272 2600 282 L2600 300Z" fill="#F8E2B4" />
      </svg>

      {/* The middle distance: two rolls of sand. */}
      <svg viewBox="0 0 240 40" preserveAspectRatio="none" style={{ ...layer, bottom: `calc(${HORIZON} - 13cqh)`, height: '14cqh' }}>
        <path d="M0 8 C24 2 52 1 80 6 C104 10 126 11 150 7 C176 3 206 2 240 8 L240 40 L0 40Z" fill="#F5DBA8" />
        <path d="M80 6 C104 10 126 11 150 7 C132 14 108 15 80 6Z" fill="#EAC98C" />
        <path d="M0 22 C36 15 70 19 108 22 C150 25 196 16 240 21 L240 40 L0 40Z" fill="#F3D49C" />
      </svg>
      {!still && (
        <>
          <div style={{ position: 'absolute', left: '7cqw', bottom: `calc(${HORIZON} - 5cqh)` }}>
            <Palm height={24} onTap={() => nsfx.rustle()} />
          </div>
          <div style={{ position: 'absolute', left: '15cqw', bottom: `calc(${HORIZON} - 3.5cqh)` }}>
            <Palm height={17} onTap={() => nsfx.rustle()} />
          </div>
        </>
      )}

      {/* Near: the sand she digs in. Its top is a soft dune; below that it is one flat tone, the heap's own. */}
      <svg viewBox="0 0 240 40" preserveAspectRatio="none" style={{ ...layer, bottom: `calc(${HORIZON} - 24cqh)`, height: '14cqh' }}>
        <path d="M0 14 C40 4 84 3 124 9 C164 15 204 8 240 4 L240 40 L0 40Z" fill={GROUND} />
        <path d="M124 9 C164 15 204 8 240 4 L240 12 C204 15 164 20 124 9Z" fill="#EFCB8E" opacity="0.7" />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `calc(${HORIZON} - 23cqh)`, background: GROUND }} />
    </div>
  )
}

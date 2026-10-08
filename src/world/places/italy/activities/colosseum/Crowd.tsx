// The crowd in the stands: rows of little round animal fans (cats, bears, bunnies, pups) sitting on the seat rows of
// the background picture, seen from the front like everything else. They fan themselves and sweat in the hot sun, sigh
// happily when the shade covers their part of the stands, hop and cheer at every surprise, and do a stadium wave when
// she swipes across them.
import { motion } from 'motion/react'
import { memo } from 'react'
import { BLUSH, EYE, INK } from '../../puppets/ink'

type Kind = 'cat' | 'bear' | 'bunny' | 'pup'
const KINDS: Kind[] = ['cat', 'bear', 'bunny', 'pup']
const FUR = ['#F6B37E', '#C9A27E', '#F7D9E3', '#D9CCFF', '#FFE27A', '#B8E0C8', '#FFC2A8', '#E8C4A0', '#BFD9F2']

export interface Fan {
  /** Center x and seat line (the bottom of the head) in px. */
  x: number
  y: number
  kind: Kind
  fur: string
  /** Fraction across the stands, 0..1 (for the wave and the shade thirds). */
  fx: number
  /** Some fans hold a little hand fan in the heat. */
  fan: boolean
}

/** Places fans along each seat row (y in px), spaced about one head apart, skipping the `gaps` (x ranges in px). */
export function seatFans(rows: number[], left: number, right: number, size: number, gaps: [number, number][] = []): Fan[] {
  const out: Fan[] = []
  let k = 0
  rows.forEach((y, r) => {
    const step = size * 1.18
    const off = r % 2 ? step / 2 : 0
    for (let x = left + size * 0.6 + off; x < right - size * 0.5; x += step) {
      if (gaps.some(([a, b]) => x > a && x < b)) continue
      out.push({ x, y, kind: KINDS[(k * 7 + r * 3) % 4], fur: FUR[(k * 5 + r) % FUR.length], fx: (x - left) / (right - left), fan: (k + r) % 3 === 0 })
      k++
    }
  })
  return out
}

/** One fan's head (viewBox 100 x 100, chin at y 96). `hot` = squinty, pink and sweaty; `happy` = arc eyes and a big smile. */
const Head = memo(function Head({ kind, fur, hot, happy }: { kind: Kind; fur: string; hot: boolean; happy: boolean }) {
  const ears =
    kind === 'cat' ? (
      <>
        <path d="M22 40 L26 8 L48 28Z" />
        <path d="M78 40 L74 8 L52 28Z" />
      </>
    ) : kind === 'bunny' ? (
      <>
        <ellipse cx="34" cy="16" rx="10" ry="24" transform="rotate(-10 34 16)" />
        <ellipse cx="66" cy="16" rx="10" ry="24" transform="rotate(10 66 16)" />
      </>
    ) : kind === 'bear' ? (
      <>
        <circle cx="24" cy="30" r="14" />
        <circle cx="76" cy="30" r="14" />
      </>
    ) : (
      <>
        <ellipse cx="18" cy="48" rx="12" ry="22" transform="rotate(20 18 48)" />
        <ellipse cx="82" cy="48" rx="12" ry="22" transform="rotate(-20 82 48)" />
      </>
    )
  return (
    <svg viewBox="0 -12 100 112" style={{ display: 'block', width: '100%', overflow: 'visible' }}>
      <g fill={fur} stroke={INK} strokeWidth="5" strokeLinejoin="round">
        {ears}
        <ellipse cx="50" cy="60" rx="38" ry="35" />
      </g>
      {/* little shoulders peeking over the seat */}
      <path d="M14 96 Q50 84 86 96" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {hot && <ellipse cx="50" cy="66" rx="30" ry="22" fill="#FF6F6F" opacity="0.22" />}
      {happy || hot ? (
        <>
          <path d={hot ? 'M30 58 L40 54 M70 58 L60 54' : 'M30 58 Q36 50 42 58 M58 58 Q64 50 70 58'} fill="none" stroke={EYE} strokeWidth="4.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="36" cy="56" r="5" fill={EYE} />
          <circle cx="64" cy="56" r="5" fill={EYE} />
        </>
      )}
      <ellipse cx="26" cy="70" rx="7" ry="4.5" fill={BLUSH} />
      <ellipse cx="74" cy="70" rx="7" ry="4.5" fill={BLUSH} />
      {hot ? (
        <path d="M42 74 Q50 70 58 74 M46 74 Q50 86 54 74" fill="#F28C8C" stroke={EYE} strokeWidth="3.5" strokeLinecap="round" />
      ) : happy ? (
        <path d="M38 70 Q50 86 62 70Z" fill="#F28C8C" stroke={EYE} strokeWidth="3.5" strokeLinejoin="round" />
      ) : (
        <path d="M42 72 Q50 79 58 72" fill="none" stroke={EYE} strokeWidth="3.5" strokeLinecap="round" />
      )}
      {kind === 'bear' || kind === 'pup' ? <ellipse cx="50" cy="66" rx="6" ry="4" fill={EYE} /> : <path d="M46 64 L54 64 L50 68Z" fill="#F28C8C" />}
    </svg>
  )
})

/** A little folding hand fan, waved in the heat. */
function HandFan({ size }: { size: number }) {
  return (
    <svg viewBox="-50 -50 100 60" style={{ width: size, display: 'block', overflow: 'visible' }}>
      <path d="M0 6 L-40 -30 A50 50 0 0 1 40 -30Z" fill="#FF8FB8" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <path d="M0 6 L-14 -42 M0 6 L14 -42" stroke={INK} strokeWidth="4" />
      <rect x="-4" y="2" width="8" height="18" rx="3" fill="#C98B5B" stroke={INK} strokeWidth="4" />
    </svg>
  )
}

export function Crowd({
  fans,
  size,
  shaded,
  waveN,
  waveDir,
  cheerN,
  hotAll,
}: {
  fans: Fan[]
  size: number
  /** Which thirds of the stands are in the shade. */
  shaded: boolean[]
  /** Bumps every wave; waveDir 1 = left to right. */
  waveN: number
  waveDir: 1 | -1
  /** Bumps every cheer (everyone hops at a random moment). */
  cheerN: number
  /** Still the hot part of the show (before any shade at all, everyone is hot). */
  hotAll: boolean
}) {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, isolation: 'isolate' }}>
      {fans.map((f, i) => {
        const third = Math.min(2, Math.floor(f.fx * 3))
        const hot = hotAll && !shaded[third]
        const happy = !hot && (waveN > 0 || cheerN > 0 || shaded[third])
        const delay = (waveDir === 1 ? f.fx : 1 - f.fx) * 1.1
        return (
          <div key={i} style={{ position: 'absolute', left: f.x - size / 2, top: f.y - size * 0.98, width: size, zIndex: Math.round(f.y) }}>
            <motion.div
              key={`w${waveN}`}
              initial={false}
              animate={waveN ? { y: [0, 0, -size * 0.75, 0], scaleY: [1, 0.9, 1.12, 1] } : {}}
              transition={{ duration: 0.75, delay, times: [0, 0.15, 0.5, 1] }}
            >
              <motion.div
                key={`c${cheerN}`}
                initial={false}
                animate={cheerN ? { y: [0, -size * 0.35, 0, -size * 0.2, 0] } : { y: [0, -size * 0.03, 0] }}
                transition={cheerN ? { duration: 0.7, delay: ((i * 37) % 10) * 0.04 } : { repeat: Infinity, duration: 2 + (i % 5) * 0.3, delay: (i % 7) * 0.2 }}
              >
                <Head kind={f.kind} fur={f.fur} hot={hot} happy={happy} />
                {/* Arms up in the wave. */}
                {waveN > 0 && (
                  <motion.div key={`a${waveN}`} initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 1, 0] }} transition={{ duration: 0.75, delay, times: [0, 0.2, 0.5, 1] }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <svg viewBox="0 -12 100 112" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
                      <path d="M10 70 L-6 20 M90 70 L106 20" stroke={INK} strokeWidth="14" strokeLinecap="round" />
                      <path d="M10 70 L-6 20 M90 70 L106 20" stroke={f.fur} strokeWidth="7" strokeLinecap="round" />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
            {hot && f.fan && (
              <motion.div animate={{ rotate: [-30, 25, -30] }} transition={{ repeat: Infinity, duration: 0.45 + (i % 3) * 0.08 }} style={{ position: 'absolute', left: size * 0.62, top: size * 0.3, transformOrigin: '50% 100%' }}>
                <HandFan size={size * 0.62} />
              </motion.div>
            )}
            {hot && !f.fan && i % 4 === 1 && (
              <motion.span animate={{ y: [0, size * 0.35], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.3, delay: (i % 5) * 0.25 }} style={{ position: 'absolute', left: size * 0.78, top: size * 0.05, fontSize: size * 0.32 }}>
                💦
              </motion.span>
            )}
          </div>
        )
      })}
    </div>
  )
}

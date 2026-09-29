// Small pieces of the Hotpot table: food pictures, chopsticks, bubbles, sparkles.
import { motion } from 'motion/react'
import { art } from '../../art'
import { Dumpling } from '../../puppets/Dumpling'
import { INK } from '../../puppets/ink'

export type FoodKind = 'noodles' | 'tofu' | 'mushroom' | 'bokChoy' | 'meatball' | 'dumpling'

const IMG: Record<Exclude<FoodKind, 'dumpling'>, string> = { noodles: art.noodles, tofu: art.tofu, mushroom: art.mushroom, bokChoy: art.bokChoy, meatball: art.meatball }

/** A food picture (dumplings are the little puppet from the Dumpling House). `size` is px. */
export function FoodIcon({ kind, size, cooked = true }: { kind: FoodKind; size: number; cooked?: boolean }) {
  if (kind === 'dumpling') return <Dumpling state={cooked ? 'cooked' : 'steaming'} size={`${size}px`} face={cooked ? 'happy' : 'surprised'} />
  return <img src={IMG[kind]} alt="" draggable={false} style={{ width: size, height: size, objectFit: 'contain', display: 'block', pointerEvents: 'none' }} />
}

/** A pair of big chopsticks, slanted, with red bands. */
export function Chopsticks({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block', pointerEvents: 'none' }}>
      {[
        { x: 40, a: -14 },
        { x: 58, a: -22 },
      ].map(({ x, a }, i) => (
        <g key={i} transform={`translate(${x} 50) rotate(${a})`}>
          <rect x="-4.5" y="-48" width="9" height="96" rx="4.5" fill={INK} />
          <rect x="-3" y="-46.5" width="6" height="93" rx="3" fill="#F2C48A" />
          <rect x="-3" y="-46.5" width="6" height="26" rx="3" fill="#E8504F" />
          <rect x="-3" y="-30" width="6" height="4" fill="#F5C65B" />
        </g>
      ))}
    </svg>
  )
}

/** Bubbles rising in the soup; `big` = a rolling boil with steam. Fills its (relative) parent. */
export function Bubbles({ big }: { big: boolean }) {
  const n = big ? 14 : 6
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      {Array.from({ length: n }).map((_, i) => {
        const left = 20 + ((i * 37) % 62)
        const s = (big ? 7 : 5) + ((i * 5) % 6)
        return (
          <motion.div
            key={i}
            animate={{ y: [0, big ? -34 : -20], opacity: [0, 0.9, 0], scale: [0.6, 1.1] }}
            transition={{ repeat: Infinity, duration: big ? 0.9 + (i % 3) * 0.2 : 1.6 + (i % 4) * 0.4, delay: (i % 5) * 0.23, ease: 'easeOut' }}
            style={{ position: 'absolute', left: `${left}%`, top: `${34 + ((i * 23) % 34)}%`, width: `${s}%`, aspectRatio: '1', maxWidth: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.75)', border: '2px solid rgba(255,255,255,0.95)' }}
          />
        )
      })}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`s${i}`}
          animate={{ y: [0, big ? -90 : -60], opacity: [0, big ? 0.85 : 0.5, 0], scale: [0.7, 1.5] }}
          transition={{ repeat: Infinity, duration: big ? 1.4 : 2.6, delay: i * (big ? 0.35 : 0.8) }}
          style={{ position: 'absolute', left: `${28 + i * 22}%`, top: '12%', width: '16%', aspectRatio: '1', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', filter: 'blur(5px)' }}
        />
      ))}
    </div>
  )
}

/** Twinkling stars around cooked food. */
export function Twinkles() {
  return (
    <>
      {[
        { x: -8, y: 4, d: 0 },
        { x: 92, y: 16, d: 0.4 },
        { x: 78, y: -6, d: 0.8 },
        { x: 6, y: 70, d: 1.1 },
      ].map((s, i) => (
        <motion.span
          key={i}
          animate={{ scale: [0, 1.2, 0], rotate: [0, 90] }}
          transition={{ repeat: Infinity, duration: 1.3, delay: s.d }}
          style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, fontSize: 'clamp(14px, 2.6vmin, 24px)', pointerEvents: 'none', lineHeight: 1 }}
        >
          ✨
        </motion.span>
      ))}
    </>
  )
}

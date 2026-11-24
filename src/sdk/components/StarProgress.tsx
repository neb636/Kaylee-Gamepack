import { motion } from 'motion/react'

const STAR = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z'

/** One drawn star, gold when earned. */
export function Star({ on, size = 36 }: { on: boolean; size?: number | string }) {
  return (
    <motion.svg viewBox="0 0 24 24" animate={on ? { scale: [1, 1.5, 1], rotate: [0, 20, 0] } : { scale: 1 }} transition={{ duration: 0.5 }} style={{ width: size, height: size, flex: 'none', display: 'block' }} aria-hidden>
      <path d={STAR} fill={on ? '#FFD447' : '#E4DFF0'} stroke={on ? '#C98A1A' : '#BDB5D6'} strokeWidth={1.4} strokeLinejoin="round" />
    </motion.svg>
  )
}

/**
 * A row of stars that fill up as Kaylee makes progress. With `parts`, the stars are what she is doing right now and a
 * row of small dashes under them shows the parts of the whole game, so there is only ever one progress pill.
 */
export function StarProgress({ done, total, size = 36, parts }: { done: number; total: number; size?: number | string; parts?: { done: number; total: number } }) {
  const stars = (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} aria-label={`${done} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <Star key={i} on={i < done} size={size} />
      ))}
    </div>
  )
  if (!parts || parts.total <= 0) return stars
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {stars}
      <div style={{ display: 'flex', gap: 4 }} aria-label={`part ${Math.min(parts.done + 1, parts.total)} of ${parts.total}`}>
        {Array.from({ length: parts.total }, (_, i) => (
          <span key={i} style={{ width: 18, height: 6, borderRadius: 3, background: i < parts.done ? 'var(--hotpink)' : '#E4DFF0' }} />
        ))}
      </div>
    </div>
  )
}

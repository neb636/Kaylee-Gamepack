import { motion } from 'motion/react'

/** A row of stars that fill up as Kaylee makes progress. */
export function StarProgress({ done, total, size = 36 }: { done: number; total: number; size?: number | string }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} aria-label={`${done} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          animate={i < done ? { scale: [1, 1.5, 1], rotate: [0, 20, 0] } : { scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: size, lineHeight: 1, filter: i < done ? 'none' : 'grayscale(1) opacity(0.35)' }}
        >
          ⭐
        </motion.span>
      ))}
    </div>
  )
}

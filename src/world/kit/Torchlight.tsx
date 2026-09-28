import { motion } from 'motion/react'
import type { CSSProperties } from 'react'

/**
 * Darkness with a warm circle of torchlight: everything under it is hidden except around `at`.
 * Put it over a scene and move the light with her finger (or with a character she drags). Never takes taps.
 * `at` is a CSS position inside the overlay (e.g. "30% 40%" or "120px 300px"), `radius` in px. It flickers like a flame.
 */
export function Torchlight({ at, radius, darkness = 0.94, style }: { at: string; radius: number; darkness?: number; style?: CSSProperties }) {
  return (
    <motion.div
      aria-hidden
      animate={{ opacity: [1, 0.95, 1, 0.97, 1] }}
      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 20,
        background: `radial-gradient(circle ${Math.round(radius)}px at ${at}, rgba(255, 190, 90, 0.12) 0%, rgba(255, 170, 70, 0.06) 50%, rgba(40, 20, 50, ${darkness * 0.6}) 80%, rgba(20, 10, 34, ${darkness}) 100%)`,
        ...style,
      }}
    />
  )
}

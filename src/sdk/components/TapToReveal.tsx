import { motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { sounds } from '../sounds'

/** A hidden picture under fluffy clouds. Tap every cloud away to see what's there! */
export function TapToReveal({ children, rows = 2, cols = 3, cover = '☁️', onDone, size = 420 }: { children: ReactNode; rows?: number; cols?: number; cover?: ReactNode; onDone: () => void; size?: number }) {
  const total = rows * cols
  const [popped, setPopped] = useState<number[]>([])

  useEffect(() => {
    if (popped.length === total) {
      const t = setTimeout(onDone, 700)
      return () => clearTimeout(t)
    }
  }, [popped.length, total, onDone])

  return (
    <div style={{ position: 'relative', width: size, height: (size * rows) / cols, borderRadius: 'var(--radius)', overflow: 'hidden', background: '#fff', boxShadow: 'var(--shadow)' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: total }, (_, i) => (
          <motion.button
            key={i}
            aria-label="cloud"
            animate={popped.includes(i) ? { scale: 0, opacity: 0 } : { scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (popped.includes(i)) return
              sounds.pop()
              setPopped((p) => [...p, i])
            }}
            style={{ background: 'var(--lavender)', border: '3px solid #fff', fontSize: size / cols / 2, pointerEvents: popped.includes(i) ? 'none' : 'auto' }}
          >
            {cover}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

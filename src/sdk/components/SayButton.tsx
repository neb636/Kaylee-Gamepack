import { motion } from 'motion/react'
import { say, type Line } from '../speech'

/** Round speaker button that repeats an instruction, so Kaylee can hear it again anytime. */
export function SayButton({ text, size = 72 }: { text: Line; size?: number }) {
  return (
    <motion.button
      aria-label="Hear it again"
      whileTap={{ scale: 0.85 }}
      onClick={() => void say(text)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: 'var(--shadow)',
        fontSize: size * 0.5,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      🔊
    </motion.button>
  )
}

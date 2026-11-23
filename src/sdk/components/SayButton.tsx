import { motion } from 'motion/react'
import { say, type Line } from '../speech'
import { HudGlyph } from './HudIcons'

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
        boxShadow: '0 5px 0 rgba(43, 35, 48, 0.16)',
        color: 'var(--lavender-dark)',
        padding: 0,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <HudGlyph icon="sound" size="58%" />
    </motion.button>
  )
}

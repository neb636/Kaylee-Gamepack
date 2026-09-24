import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { sounds } from '../sounds'
import { say } from '../speech'

export interface Choice {
  key: string | number
  content: ReactNode
  correct: boolean
  ariaLabel?: string
}

export interface ChoiceCardsProps {
  choices: Choice[]
  /** Called (after a happy bounce) when she taps a correct card. */
  onCorrect: (choice: Choice) => void
  /** Called when she taps a wrong card. If not given, `hint` is spoken. There is never a "fail". */
  onWrong?: (choice: Choice) => void
  /** Spoken after a wrong tap when there's no onWrong. */
  hint?: string
  /** Card size in px (square). */
  size?: number
  /** Card background color. */
  color?: string
}

/**
 * A row of big tappable answer cards (numbers, pictures, words, colors...).
 * Wrong answers wiggle gently and can be tried again; the right one bounces.
 */
export function ChoiceCards({ choices, onCorrect, onWrong, hint = "Hmm, let's try again!", size = 150, color = '#fff' }: ChoiceCardsProps) {
  const [shaking, setShaking] = useState<Choice['key'] | null>(null)
  const [picked, setPicked] = useState<Choice['key'] | null>(null)

  const tap = (c: Choice) => {
    if (picked !== null) return
    if (c.correct) {
      setPicked(c.key)
      sounds.correct()
      setTimeout(() => onCorrect(c), 700)
    } else {
      sounds.oops()
      setShaking(c.key)
      setTimeout(() => setShaking(null), 500)
      if (onWrong) onWrong(c)
      else void say(hint)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
      {choices.map((c, i) => (
        <motion.button
          key={c.key}
          aria-label={c.ariaLabel ?? String(c.key)}
          initial={{ scale: 0, rotate: -10 }}
          animate={
            shaking === c.key
              ? { x: [0, -14, 14, -10, 10, 0], scale: 1, rotate: 0 }
              : picked === c.key
                ? { scale: [1, 1.25, 1.1], rotate: [0, -6, 6, 0] }
                : { scale: picked !== null ? 0.9 : 1, rotate: 0, opacity: picked !== null ? 0.4 : 1 }
          }
          transition={{ type: 'spring', bounce: 0.5, delay: picked === null && shaking === null ? i * 0.07 : 0 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => tap(c)}
          style={{
            width: size,
            height: size,
            borderRadius: 28,
            background: picked === c.key ? 'var(--mint)' : color,
            boxShadow: 'var(--shadow)',
            fontSize: size * 0.5,
            fontWeight: 700,
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
          }}
        >
          {c.content}
        </motion.button>
      ))}
    </div>
  )
}

import { AnimatePresence, motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { numberWord } from '../helpers'
import { sounds } from '../sounds'
import { say } from '../speech'

/**
 * Tap something a certain number of times ("Make the unicorn hop 3 times!").
 * Each tap hops, plays a rising note and says the number.
 */
export function TapCounter({ children, count, onDone }: { children: ReactNode; count: number; onDone: () => void }) {
  const [taps, setTaps] = useState(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ height: 90, fontSize: 80, fontWeight: 700, color: 'var(--hotpink)' }}>
        <AnimatePresence mode="popLayout">
          {taps > 0 && (
            <motion.div key={taps} initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }}>
              {taps}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.button
        aria-label="tap me"
        key={taps}
        animate={taps > 0 ? { y: [0, -90, 0], rotate: [0, -8, 0] } : {}}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        onClick={() => {
          if (taps >= count) return
          const n = taps + 1
          setTaps(n)
          sounds.note(n - 1)
          void say(numberWord(n))
          if (n === count) setTimeout(onDone, 900)
        }}
      >
        {children}
      </motion.button>
    </div>
  )
}

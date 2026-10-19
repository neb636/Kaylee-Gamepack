// Mommy asks if she's ready to go on a trip, with two big buttons that need no reading: 👍 yes (with the suitcase) and
// ✋ not yet. It shows in the house (when Kaylee comes up to her room, or taps Mommy) and as the trip's first section.
// "Not yet" gets a happy "OK! Tell me when!" and the card goes, nothing lost.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sounds } from '../../../../../sdk'
import { TALK } from '../talk'

/** She said yes in the house: the trip opens straight on packing instead of asking again. */
export const saidYes = { at: 0 }
export const justSaidYes = () => saidYes.at > 0 && performance.now() - saidYes.at < 8000

interface Props {
  open: boolean
  onYes(): void
  /** After Mommy's "OK! Tell me when!". */
  onNotYet(): void
}

export function Ask({ open, onYes, onNotYet }: Props) {
  const [later, setLater] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    if (open) setLater(false)
  }, [open])
  useEffect(() => () => clearTimeout(timer.current), [])
  const line = later ? TALK.ask.later : TALK.ask.question
  const buttons = [
    { id: 'yes', label: 'Yes', icon: '👍', extra: '🧳', color: 'var(--mint)', on: () => {
      sounds.correct()
      onYes()
    } },
    { id: 'not-yet', label: 'Not yet', icon: '✋', extra: '⏳', color: 'var(--lavender)', on: () => {
      sounds.pop()
      setLater(true)
      timer.current = setTimeout(onNotYet, 1300)
    } },
  ]
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="ask"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '0 16px', zIndex: 50, pointerEvents: 'none' }}
        >
          <motion.div
            key={line.text}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 'min(620px, 100%)', background: 'rgba(255,255,255,0.97)', borderRadius: 'var(--radius)', padding: '10px 20px 10px 10px', boxShadow: 'var(--shadow)' }}
          >
            <motion.span
              animate={{ rotate: [0, -12, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, repeatDelay: 1 }}
              style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 64, height: 64, borderRadius: 32, background: '#FF8FB8', fontSize: 34, border: '3px solid #fff' }}
              title="Mommy"
            >
              🦄
            </motion.span>
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <small style={{ fontWeight: 700, opacity: 0.6, fontSize: 14 }}>Mommy</small>
              <span style={{ fontWeight: 700, fontSize: 'clamp(20px, min(3.4vw, 3.6vh), 30px)' }}>{line.text}</span>
            </span>
          </motion.div>
          {!later && (
            <div style={{ display: 'flex', gap: 'clamp(16px, 4vw, 40px)', pointerEvents: 'auto' }}>
              {buttons.map((b, i) => (
                <motion.button
                  key={b.id}
                  aria-label={b.label}
                  initial={{ scale: 0 }}
                  animate={{ scale: i === 0 ? [1, 1.07, 1] : 1 }}
                  transition={i === 0 ? { repeat: Infinity, duration: 1.4, ease: 'easeInOut' } : { type: 'spring' }}
                  whileTap={{ scale: 0.88 }}
                  onClick={b.on}
                  style={{ minWidth: 'min(200px, 40vw)', minHeight: 'min(150px, 22vh)', padding: '10px 18px', borderRadius: 36, border: '5px solid #fff', background: b.color, boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, color: 'var(--ink)' }}
                >
                  <span style={{ fontSize: 'clamp(48px, min(9vw, 9vh), 72px)', lineHeight: 1 }} aria-hidden>
                    {b.icon}
                    {b.extra}
                  </span>
                  <span style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700 }}>{b.label}</span>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

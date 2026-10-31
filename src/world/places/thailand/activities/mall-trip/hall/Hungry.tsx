// Daddy's tummy rumbled: Mommy asks "Hungry? Pizza time?" with two big picture buttons that need no reading, 🍕 to go
// and eat or 🛝 to play some more (nothing lost: she asks again after another mini game). Styled like Mommy's trip
// card (trip/legs/Ask.tsx). Mommy says it as the card comes up (lines.ts `L.mall.hall.pizza`), and "OK! A little more!"
// to More play; the card shows the words for Dad.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { ChoiceCard, Dialogue, lineText, sounds } from '../../../../../../sdk'
import { WHO } from '../../../who'
import { L } from '../../../lines'
import { mallVoice } from '../voice'

interface Props {
  open: boolean
  onPizza(): void
  onPlay(): void
}

export function Hungry({ open, onPizza, onPlay }: Props) {
  useEffect(() => {
    if (open) mallVoice.say(L.mall.hall.pizza)
  }, [open])
  const buttons = [
    { id: 'pizza', label: "Let's eat", icon: '🍕', color: 'var(--butter)', on: () => {
      sounds.correct()
      onPizza()
    } },
    { id: 'play', label: 'More play', icon: '🛝', color: 'var(--lavender)', on: () => {
      sounds.pop()
      mallVoice.say(L.mall.hall.more)
      onPlay()
    } },
  ]
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="hungry"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom, 0px) + 22px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(18px, 3vh, 28px)', padding: '0 16px', zIndex: 50, pointerEvents: 'none' }}
        >
          <Dialogue who={WHO.ji} size="lg" avatar={72}>
            {lineText(L.mall.hall.pizza)}
          </Dialogue>
          <div style={{ display: 'flex', gap: 'clamp(16px, 4vw, 36px)', pointerEvents: 'auto' }}>
            {buttons.map((b, i) => (
              <ChoiceCard
                key={b.id}
                aria-label={b.label}
                icon={b.icon}
                label={b.label}
                color={b.color}
                initial={{ scale: 0, rotate: i % 2 ? 4 : -4 }}
                animate={{ scale: i === 0 ? [1, 1.05, 1] : 1, rotate: 0 }}
                transition={i === 0 ? { scale: { repeat: Infinity, duration: 1.4, ease: 'easeInOut', delay: 0.4 }, rotate: { type: 'spring' } } : { type: 'spring', delay: 0.1 }}
                onClick={b.on}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

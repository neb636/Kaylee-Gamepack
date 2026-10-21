// Daddy's tummy rumbled: Mommy asks "Hungry? Pizza time?" with two big picture buttons that need no reading, 🍕 to go
// and eat or 🛝 to play some more (nothing lost: she asks again after another mini game). Styled like Mommy's trip
// card (trip/legs/Ask.tsx). No voice yet (the full loop records Mommy saying it); the card shows the words for Dad.
import { AnimatePresence, motion } from 'motion/react'
import { sounds } from '../../../../../../sdk'

interface Props {
  open: boolean
  onPizza(): void
  onPlay(): void
}

export function Hungry({ open, onPizza, onPlay }: Props) {
  const buttons = [
    { id: 'pizza', label: "Let's eat", icon: '🍕', color: 'var(--butter)', on: () => {
      sounds.correct()
      onPizza()
    } },
    { id: 'play', label: 'More play', icon: '🛝', color: 'var(--lavender)', on: () => {
      sounds.pop()
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
          style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom, 0px) + 16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '0 16px', zIndex: 50, pointerEvents: 'none' }}
        >
          <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 'min(620px, 100%)', background: 'rgba(255,255,255,0.97)', borderRadius: 'var(--radius)', padding: '10px 20px 10px 10px', boxShadow: 'var(--shadow)' }}>
            <motion.span animate={{ rotate: [0, -12, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8, repeatDelay: 1 }} style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 64, height: 64, borderRadius: 32, background: '#FF8FB8', fontSize: 34, border: '3px solid #fff' }} title="Mommy">
              🦄
            </motion.span>
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <small style={{ fontWeight: 700, opacity: 0.6, fontSize: 14 }}>Mommy</small>
              <span style={{ fontWeight: 700, fontSize: 'clamp(20px, min(3.4vw, 3.6vh), 30px)' }}>Hungry, Kaylee? Pizza time?</span>
            </span>
          </motion.div>
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
                </span>
                <span style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700 }}>{b.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

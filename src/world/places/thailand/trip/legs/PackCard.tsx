// While she packs, the screen shows what to do without words: a suitcase card (top right) with a round slot for each
// thing in it, three empty slots waiting at first, each filling with a pop as something goes in; and once three are in,
// a big mint tick (bottom right) that closes it, the same as tapping the suitcase.
import { HudButton } from '../../../../kit/Hud'
import { AnimatePresence, motion } from 'motion/react'
import { ITEMS } from '../packing'

interface Props {
  open: boolean
  packed: string[]
  /** She's sitting on it (it needs more hops): the button keeps going. */
  sitting: boolean
  onClose(): void
}

const ICON = Object.fromEntries(ITEMS.map((i) => [i.id, i.icon]))
const NEED = 3

export function PackCard({ open, packed, sitting, onClose }: Props) {
  const slots = Math.max(NEED, packed.length)
  const ready = sitting || packed.length >= NEED
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="pack-card"
          aria-label={`Suitcase: ${packed.length} packed`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{ position: 'absolute', top: 'calc(var(--safe-top) + 12px)', right: 'calc(var(--safe-right, 0px) + 12px)', maxWidth: 'calc(100vw - 200px)', display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 999, background: 'rgba(255,255,255,0.95)', boxShadow: 'var(--shadow)', zIndex: 44, pointerEvents: 'none' }}
        >
          <span aria-hidden style={{ fontSize: 'clamp(30px, 5vmin, 42px)', lineHeight: 1, padding: '0 2px 0 6px' }}>
            🧳
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Array.from({ length: slots }, (_, i) => {
              const id = packed[i]
              return (
                <motion.span
                  key={id ?? `empty-${i}`}
                  initial={id ? { scale: 0.3 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  style={{ display: 'grid', placeItems: 'center', width: 'clamp(38px, 6vmin, 52px)', height: 'clamp(38px, 6vmin, 52px)', borderRadius: '50%', fontSize: 'clamp(22px, 3.8vmin, 32px)', background: id ? 'var(--butter)' : 'transparent', border: id ? '3px solid #fff' : '3px dashed var(--lavender-dark)', boxSizing: 'border-box' }}
                >
                  {id ? ICON[id] : ''}
                </motion.span>
              )
            })}
          </div>
        </motion.div>
      )}
      {open && ready && (
        <HudButton key="pack-close" role="done" icon="check" size="lg" slot="bottom-right" pulse label="Close the suitcase" pop={false} exit={{ scale: 0, transition: { duration: 0.2 } }} onClick={onClose} style={{ zIndex: 46 }} />
      )}
    </AnimatePresence>
  )
}

// While she packs, the screen shows what to do without words: a suitcase card (top right) with a round slot for each
// thing in it, three empty slots waiting at first, each filling with a pop as something goes in; and once three are in,
// a big ✅ suitcase button (bottom right) that closes it, the same as tapping the suitcase.
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
        <motion.button
          key="pack-close"
          aria-label="Close the suitcase"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.1, 1] }}
          exit={{ scale: 0 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          whileTap={{ scale: 0.85 }}
          onClick={onClose}
          style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 16px)', bottom: 'calc(var(--safe-bottom) + 16px)', width: 110, height: 110, borderRadius: '50%', border: '5px solid #fff', background: 'var(--hotpink)', boxShadow: 'var(--shadow)', zIndex: 46, display: 'grid', placeItems: 'center', padding: 0 }}
        >
          <span aria-hidden style={{ position: 'relative', fontSize: 54, lineHeight: 1 }}>
            🧳
            <span style={{ position: 'absolute', right: -16, bottom: -10, fontSize: 34 }}>✅</span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

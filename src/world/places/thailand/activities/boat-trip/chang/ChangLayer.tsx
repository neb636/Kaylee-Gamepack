// Baan Chang's way on (plan: thailand/baan-chang.md): one big pulsing button top right once the place she's at is done,
// never forced (she can keep playing): 🥤 after a photo at the sign wall (up to the cafe), 🐘 once her chocolate milk is
// ready (out onto the boardwalk), and after the splash 🚤 to the pier if she hasn't been on the boat yet, else ✈️🏠.
import { AnimatePresence, motion } from 'motion/react'
import { sounds } from '../../../../../../sdk'
import type { BoatSection } from '../sections'

interface Props {
  section: BoatSection
  /** The way on is open (the world says when). */
  ready: boolean
  /** She has been on the boat already (the splash goes home). */
  bay: boolean
  onOnward: () => void
  onPier: () => void
  onHome: () => void
}

const ICON: Partial<Record<BoatSection, { icon: string; label: string }>> = {
  sign: { icon: '🥤', label: 'To the cafe' },
  drinks: { icon: '🐘', label: 'To the elephants' },
}

export function ChangLayer({ section, ready, bay, onOnward, onPier, onHome }: Props) {
  const splash = section === 'splash'
  const b = splash ? (bay ? { icon: '✈️🏠', label: 'Fly home' } : { icon: '🚤', label: 'To the boat' }) : ICON[section]
  return (
    <AnimatePresence>
      {ready && b && (
        <motion.button
          key={`${section}-${b.icon}`}
          aria-label={b.label}
          initial={{ scale: 0, y: 40 }}
          animate={{ scale: [1, 1.08, 1], y: 0 }}
          exit={{ scale: 0, transition: { duration: 0.2 } }}
          transition={{ scale: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' }, y: { type: 'spring' } }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            sounds.pop()
            if (!splash) onOnward()
            else if (bay) onHome()
            else onPier()
          }}
          style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 18px)', top: 'calc(var(--top-clear) + 12px)', minWidth: 'clamp(110px, 18vw, 150px)', height: 'clamp(88px, 13vmin, 110px)', borderRadius: 999, border: '5px solid #fff', background: 'var(--butter)', fontSize: 'clamp(40px, 7vmin, 56px)', boxShadow: '0 0 0 6px rgba(255,79,154,.45), var(--shadow)', zIndex: 33, padding: '0 20px' }}
        >
          {b.icon}
        </motion.button>
      )}
    </AnimatePresence>
  )
}

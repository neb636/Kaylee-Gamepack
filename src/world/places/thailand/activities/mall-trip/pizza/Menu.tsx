// The Pizza Company's menu: three big pictures along the bottom, no reading (Hawaiian, Seafood, Double Cheese). The
// names underneath are for Dad.
import { AnimatePresence, motion } from 'motion/react'
import { PIZZA_ICONS, PIZZA_NAMES, PIZZAS, type PizzaId } from './layout'

const PIE: Record<PizzaId, string> = {
  hawaiian: 'radial-gradient(circle at 35% 35%, #FFE27A 0 45%, #FFD84D 46% 60%, #F2C27B 61%)',
  seafood: 'radial-gradient(circle at 35% 35%, #FFE27A 0 45%, #FF9A6B 46% 60%, #F2C27B 61%)',
  cheese: 'radial-gradient(circle at 35% 35%, #FFF1A8 0 45%, #FFD24A 46% 60%, #F2C27B 61%)',
}

export function Menu({ open, onPick }: { open: boolean; onPick: (id: PizzaId) => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 220, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          aria-label="Menu"
          style={{ position: 'absolute', left: '50%', bottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(10px, 2.5vmin, 26px))', translate: '-50% 0', display: 'flex', gap: 'clamp(12px, 3vmin, 30px)', padding: 'clamp(10px, 2vmin, 18px) clamp(14px, 3vmin, 28px)', borderRadius: 40, background: 'rgba(255,255,255,.88)', border: '5px solid #4DB57A', boxShadow: 'var(--shadow)', zIndex: 50 }}
        >
          {PIZZAS.map((id, i) => (
            <motion.button
              key={id}
              aria-label={PIZZA_NAMES[id]}
              onClick={() => onPick(id)}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.25 }}
              whileTap={{ scale: 0.85, rotate: -8 }}
              style={{ position: 'relative', width: 'clamp(88px, 17vmin, 150px)', height: 'clamp(88px, 17vmin, 150px)', borderRadius: '50%', border: '6px solid #fff', background: PIE[id], boxShadow: '0 6px 0 rgba(43,35,48,.12)', padding: 0, display: 'grid', placeItems: 'center' }}
            >
              <span style={{ fontSize: 'clamp(40px, 8vmin, 70px)', filter: 'drop-shadow(0 2px 2px rgba(43,35,48,.25))' }}>{PIZZA_ICONS[id]}</span>
              <span style={{ position: 'absolute', bottom: -6, left: '50%', translate: '-50% 50%', whiteSpace: 'nowrap', fontSize: 'clamp(11px, 1.7vmin, 15px)', fontWeight: 600, color: 'var(--ink)', background: '#fff', borderRadius: 999, padding: '1px 8px', boxShadow: '0 2px 4px rgba(43,35,48,.15)' }}>{PIZZA_NAMES[id]}</span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

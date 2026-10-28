// The little card that pops up in a corner when Kaylee meets a new animal (met.ts meet()): its picture flies into Maple's
// book with a sparkle, and Sparkle names it with one short fact. It never blocks play (no taps needed, it goes by
// itself); tapping it plays the fact again. Mounted once by Place.tsx, over every activity and the hub.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { say, sounds } from '../../../../sdk'
import { L } from '../lines'
import { ANIMAL, picOf, type AnimalId } from './animals'
import { onMeet } from './met'

const SHOW_MS = 3600

export function MetCard() {
  const [queue, setQueue] = useState<AnimalId[]>([])
  const id = queue[0]
  useEffect(() => onMeet((a) => setQueue((q) => (q.includes(a) ? q : [...q, a]))), [])
  useEffect(() => {
    if (!id) return
    sounds.sparkle()
    void say(L.book[id], { interrupt: false })
    const t = window.setTimeout(() => setQueue((q) => q.slice(1)), SHOW_MS)
    return () => window.clearTimeout(t)
  }, [id])
  const a = id ? ANIMAL[id] : undefined
  const pic = id ? picOf(id) : undefined
  return (
    <div style={{ position: 'absolute', left: 12, bottom: 'calc(var(--safe-bottom) + 12px)', zIndex: 60, pointerEvents: 'none' }}>
      <AnimatePresence>
        {a && (
          <motion.button
            key={a.id}
            aria-label={`${a.name}: in Maple's book`}
            initial={{ scale: 0, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.3, x: 40, y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            onClick={() => void say(L.book[a.id])}
            style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px 8px 8px', minHeight: 88, border: '5px solid var(--gold)', borderRadius: 26, background: '#FFF8EC', boxShadow: 'var(--shadow)', fontFamily: 'inherit', color: 'var(--ink)' }}
          >
            <span style={{ width: 72, height: 72, display: 'grid', placeItems: 'center', borderRadius: 18, background: '#fff', fontSize: 46 }}>
              {pic ? <img src={pic} alt="" style={{ width: 68, height: 68, objectFit: 'contain' }} /> : a.icon}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--lavender-dark)' }}>📒 New friend!</span>
              <span style={{ fontSize: 'clamp(18px, 2.6vmin, 24px)', fontWeight: 700 }}>{a.name}</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

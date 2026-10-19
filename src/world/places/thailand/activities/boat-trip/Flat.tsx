// The boat trip without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the greybox's stops as big
// buttons, so nothing breaks. (The full trip gets a real picture-book version in its last gate.)
import { motion } from 'motion/react'
import { useState } from 'react'
import { sfx } from '../../sfx'
import type { BoatSection } from './sections'

const STOPS: { id: BoatSection; icon: string; label: string }[] = [
  { id: 'bay', icon: '🚤', label: 'The bay' },
  { id: 'cave', icon: '🛶', label: 'The cave' },
  { id: 'nail', icon: '🏝️', label: 'The Nail Island' },
]

export function Flat({ section, onSection }: { section: BoatSection; onSection: (s: BoatSection) => void }) {
  const [at, setAt] = useState<BoatSection>(section)
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#A8DCFF 50%, #6FCDB9 50%)', padding: 'var(--top-clear) 16px calc(var(--safe-bottom) + 16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <motion.div key={at} initial={{ x: -40, rotate: -6 }} animate={{ x: 0, rotate: [-6, 4, 0] }} style={{ fontSize: 'clamp(80px, 18vmin, 160px)' }} aria-hidden>
        {STOPS.find((s) => s.id === at)?.icon ?? '🚤'}
      </motion.div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {STOPS.map((s) => (
          <button
            key={s.id}
            aria-label={s.label}
            onClick={() => {
              sfx.boing()
              setAt(s.id)
              onSection(s.id)
            }}
            style={{ minWidth: 120, minHeight: 88, borderRadius: 999, border: '4px solid #fff', background: at === s.id ? 'var(--hotpink)' : 'var(--lavender)', color: at === s.id ? '#fff' : 'var(--ink)', fontSize: 22, fontWeight: 700, boxShadow: 'var(--shadow)', padding: '0 20px' }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

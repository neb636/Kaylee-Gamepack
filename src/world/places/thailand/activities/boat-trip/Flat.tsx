// The boat trip without WebGL (an old browser, a test browser without a GPU, or ?gl=off): every leg and stop as a big
// button, so nothing breaks and the section links still land. (The full trip gets a real picture-book version in its
// last gate.)
import { motion } from 'motion/react'
import { useState } from 'react'
import { sfx } from '../../sfx'
import type { BoatSection } from './sections'

const STOPS: { id: BoatSection; icon: string; label: string }[] = [
  { id: 'invite', icon: '🙋', label: 'Ready?' },
  { id: 'pack', icon: '🧳', label: 'Pack' },
  { id: 'goodbye', icon: '🚐', label: 'Goodbye' },
  { id: 'airport', icon: '🛄', label: 'Airport' },
  { id: 'takeoff', icon: '🛫', label: 'Takeoff' },
  { id: 'fly', icon: '✈️', label: 'Flying' },
  { id: 'land', icon: '🛬', label: 'Landing' },
  { id: 'pier', icon: '🎀', label: 'The pier' },
  { id: 'bay', icon: '🚤', label: 'The bay' },
  { id: 'village', icon: '⚽', label: 'The village' },
  { id: 'cave', icon: '🛶', label: 'The cave' },
  { id: 'hong', icon: '🦀', label: 'The hong' },
  { id: 'nail', icon: '🏝️', label: 'The Nail Island' },
  { id: 'sunset', icon: '🌅', label: 'Sunset' },
]

export function Flat({ section, onSection }: { section: BoatSection; onSection: (s: BoatSection) => void }) {
  const [at, setAt] = useState<BoatSection>(section)
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#A8DCFF 50%, #6FCDB9 50%)', padding: 'var(--top-clear) 16px calc(var(--safe-bottom) + 16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'safe center', gap: 'clamp(8px, 2vh, 20px)', overflow: 'auto' }}>
      <motion.div key={at} initial={{ x: -40, rotate: -6 }} animate={{ x: 0, rotate: [-6, 4, 0] }} style={{ fontSize: 'clamp(56px, 14vmin, 160px)' }} aria-hidden>
        {STOPS.find((s) => s.id === at)?.icon ?? '🚤'}
      </motion.div>
      <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 12px)', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 }}>
        {STOPS.map((s) => (
          <button
            key={s.id}
            aria-label={s.label}
            onClick={() => {
              sfx.boing()
              setAt(s.id)
              onSection(s.id)
            }}
            style={{ minWidth: 'clamp(100px, 22vw, 120px)', minHeight: 'clamp(64px, 11vh, 88px)', borderRadius: 999, border: '4px solid #fff', background: at === s.id ? 'var(--hotpink)' : 'var(--lavender)', color: at === s.id ? '#fff' : 'var(--ink)', fontSize: 'clamp(15px, 2.6vmin, 22px)', fontWeight: 700, boxShadow: 'var(--shadow)', padding: '0 clamp(10px, 2vw, 20px)' }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

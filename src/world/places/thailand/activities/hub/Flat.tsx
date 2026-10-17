// Agong's house without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the same spots, things and
// family as big buttons on a flat drawing of the shophouse, so nothing breaks and she can still poke around.
import { motion } from 'motion/react'
import { useState } from 'react'
import { FAMILY } from '../../characters/family'
import { sfx } from '../../sfx'
import { PICKABLES } from './layout'
import type { Spot } from './house'

const SPOTS: { id: Spot; icon: string; label: string }[] = [
  { id: 'street', icon: '🛺', label: 'Street' },
  { id: 'downstairs', icon: '🏠', label: 'Downstairs' },
  { id: 'upstairs', icon: '🛏️', label: 'Upstairs' },
]

export function Flat({ spot, onSpot }: { spot: Spot; onSpot: (s: Spot) => void }) {
  const [poked, setPoked] = useState<string | null>(null)
  const floor = spot === 'upstairs' ? 1 : 0
  const area = spot === 'street' ? 'street' : 'inside'
  const things = PICKABLES.filter((p) => p.floor === floor && p.area === area && p.react !== 'stairs')
  const people = FAMILY.filter((m) => m.spot && m.spot.floor === floor && (m.spot.z > 0) === (spot === 'street'))
  const poke = (id: string, sound: () => void) => {
    setPoked(id)
    sound()
    setTimeout(() => setPoked((p) => (p === id ? null : p)), 500)
  }
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#A8DCFF 55%, #EEE7F8 55%)', padding: 'var(--top-clear) 16px calc(var(--safe-bottom) + 16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, overflow: 'auto' }}>
      {/* The shophouse front: shutter, sign, balcony. */}
      <div aria-hidden style={{ width: 'min(300px, 60vw)', aspectRatio: '1 / 1.15', background: '#FFD9C4', border: '4px solid var(--ink)', borderRadius: 14, position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', left: '12%', right: '12%', top: '8%', height: '30%', background: '#BFE0F5', border: '3px solid var(--ink)', borderRadius: 8 }} />
        <div style={{ position: 'absolute', left: '6%', right: '6%', top: '40%', height: '6%', background: 'var(--cream)', border: '3px solid var(--ink)' }} />
        <div style={{ position: 'absolute', left: '14%', right: '14%', top: '50%', height: '8%', background: '#F0646E', border: '3px solid var(--gold)', borderRadius: 6 }} />
        <div style={{ position: 'absolute', left: '8%', right: '8%', bottom: 0, height: '36%', background: spot === 'street' ? 'repeating-linear-gradient(#BFE6DA 0 10px, #9FD3C4 10px 13px)' : '#FFF1E2', borderTop: '3px solid var(--ink)' }} />
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {SPOTS.map((s) => (
          <button key={s.id} aria-label={s.label} onClick={() => spot !== s.id && onSpot(s.id)} style={{ minWidth: 96, minHeight: 72, borderRadius: 999, border: '4px solid #fff', background: spot === s.id ? 'var(--hotpink)' : 'var(--lavender)', color: spot === s.id ? '#fff' : 'var(--ink)', fontSize: 20, fontWeight: 700, boxShadow: 'var(--shadow)', padding: '0 18px' }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 }}>
        {people.map((m) => (
          <motion.button key={m.id} aria-label={m.name} animate={poked === m.id ? { y: [0, -16, 0] } : { y: 0 }} onClick={() => poke(m.id, () => sfx.babble(m.pitch))} style={{ minWidth: 88, minHeight: 88, borderRadius: 999, border: '4px solid #fff', background: m.color, fontSize: 18, fontWeight: 700, boxShadow: 'var(--shadow)', padding: '0 16px' }}>
            {m.name}
          </motion.button>
        ))}
        {things.map((p) => (
          <motion.button key={p.id} aria-label={p.label} animate={poked === p.id ? { scale: [1, 1.15, 0.95, 1] } : { scale: 1 }} onClick={() => poke(p.id, p.gentle ? sfx.ding : sfx.pop)} style={{ minWidth: 88, minHeight: 72, borderRadius: 20, border: '4px solid #fff', background: '#fff', fontSize: 17, fontWeight: 600, boxShadow: 'var(--shadow)', padding: '0 14px' }}>
            {p.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

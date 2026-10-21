// The Big Frame without WebGL (an old browser, a test browser without a GPU, or ?gl=off): one picture page under the
// lit sign. Each big ride is a big button: tap it and it whooshes, and the frame's sticker goes on her sock band; the
// cannon booms and the climbing wall boings.
import { motion } from 'motion/react'
import { sounds } from '../../../../../../sdk'
import { sfx } from '../../../sfx'
import type { RideId } from './layout'

const RIDES: { id: RideId | 'cannon' | 'wall'; label: string; icon: string }[] = [
  { id: 'nose', label: 'The mask nose slide', icon: '👺' },
  { id: 'dragon', label: 'Twin-dragon spiral', icon: '🐉' },
  { id: 'roller', label: 'Ta-Khon roller slide', icon: '🛝' },
  { id: 'donut', label: 'Boomerang Donut', icon: '🍩' },
  { id: 'zip', label: 'Zip line', icon: '🪢' },
  { id: 'wall', label: 'Red climbing wall', icon: '🧗' },
  { id: 'cannon', label: 'Ball cannon at Daddy', icon: '💥' },
]

const big = { width: 'clamp(96px, 18vmin, 150px)', height: 'clamp(96px, 18vmin, 150px)', borderRadius: '50%', border: '6px solid #fff', background: 'rgba(255,255,255,.18)', boxShadow: '0 0 24px rgba(111,203,255,.55)', fontSize: 'clamp(48px, 9vmin, 76px)', padding: 0 } as const

export function Flat({ rode, onRide }: { rode: boolean; onRide: (id: RideId) => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#2E2748, #4A4170 55%, #DCD0FA)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(14px, 3vmin, 28px)', paddingTop: 'var(--top-clear)' }}>
      <div aria-hidden style={{ fontWeight: 700, lineHeight: 1, textAlign: 'center', color: '#fff', textShadow: '0 0 4px #fff, 0 0 12px #8EE0FF, 0 0 26px #2F9BFF' }}>
        <div style={{ fontSize: 'clamp(16px, 3vmin, 26px)', letterSpacing: '0.14em' }}>MEGA</div>
        <div style={{ fontSize: 'clamp(34px, 8vmin, 72px)' }}>HARBORLAND</div>
        <div style={{ fontSize: 'clamp(15px, 3vmin, 24px)', letterSpacing: '0.06em', color: '#FFF9E6', textShadow: '0 0 4px #fff, 0 0 12px #FFE08A, 0 0 24px #FFAE33' }}>LITTLE THAILAND</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(12px, 2.6vmin, 26px)', maxWidth: 'min(92vw, 760px)' }}>
        {RIDES.map((r) => (
          <motion.button
            key={r.id}
            aria-label={r.label}
            whileTap={{ scale: 0.85, rotate: -8 }}
            onClick={() => {
              sounds.whoosh()
              if (r.id === 'cannon') sfx.thoomp()
              else if (r.id === 'wall') sfx.boing()
              else {
                sfx.chime()
                onRide(r.id)
              }
            }}
            style={{ ...big, outline: r.id !== 'cannon' && r.id !== 'wall' && !rode ? '6px solid rgba(255,200,61,.8)' : 'none' }}
          >
            {r.icon}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

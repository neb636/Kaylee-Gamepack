// The hall without WebGL (an old browser, a test browser without a GPU, or ?gl=off): a picture row of the ways in,
// left to right as in the hall. The open ones are big buttons that go in; the ones that come later (the barber, the
// mountain, the blocks, the bags) wiggle and make their sound.
import { motion } from 'motion/react'
import { sounds } from '../../../../../../sdk'
import type { GameDoor } from './layout'
import { hallSfx as sfx } from './sounds'

const SPOTS: { id: string; icon: string; label: string; game?: GameDoor; bg: string; sound?: () => void }[] = [
  { id: 'vet', icon: '🩺', label: 'The Vet Clinic', game: 'vet', bg: '#A7EBD0' },
  { id: 'cafe', icon: '🥤', label: 'Cafe & Cake', game: 'cafe', bg: '#FFF1E2' },
  { id: 'barber', icon: '💈', label: 'The Barber Salon', bg: '#CFE3FF', sound: () => sfx.poof() },
  { id: 'frame', icon: '🛝', label: 'The Big Frame', game: 'frame', bg: '#FFD6E7' },
  { id: 'race', icon: '🏁', label: 'The Racing Slide', game: 'race', bg: '#FFE0C2' },
  { id: 'mountain', icon: '⛰️', label: 'The Golden Mountain', bg: '#FFF1C9', sound: () => sfx.giggle() },
  { id: 'blocks', icon: '🧱', label: 'Little Land', bg: '#E3F7EE', sound: () => sfx.whump() },
  { id: 'boxing', icon: '🥊', label: 'Muay Thai bags', bg: '#DCEBFF', sound: () => sfx.punch() },
]

const big = { width: 'clamp(104px, 19vmin, 160px)', height: 'clamp(104px, 19vmin, 160px)', borderRadius: 32, border: '6px solid #fff', boxShadow: 'var(--shadow)', fontSize: 'clamp(50px, 10vmin, 78px)', padding: 0 } as const

export function HallFlat({ done, onEnter }: { done: GameDoor[]; onEnter: (d: GameDoor) => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#3F365F 0, #3F365F 18%, #EBDDFF 18%, #FFE3EF)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'calc(var(--top-clear) + 8px) 16px 16px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(12px, 3vmin, 26px)', maxWidth: 900 }}>
        {SPOTS.map((s) => (
          <motion.button
            key={s.id}
            aria-label={s.label}
            whileTap={{ scale: 0.85, rotate: s.game ? 0 : -10 }}
            onClick={() => {
              if (s.game) {
                sfx.shopBell()
                onEnter(s.game)
              } else {
                sounds.pop()
                s.sound?.()
              }
            }}
            style={{ ...big, background: s.bg, outline: s.game && !done.includes(s.game) ? '6px solid rgba(255,200,61,.85)' : 'none', opacity: s.game ? 1 : 0.85 }}
          >
            {s.icon}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

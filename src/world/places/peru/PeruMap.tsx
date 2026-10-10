// Luna's map of Peru: a painted map (scene-peru-map, Sol 6.1), repainted from a diagram traced from the real country
// outline (Natural Earth 1:110m, public domain) so the shape is accurate. Peru's three worlds sit side by side: the
// desert coast by the ocean, the Andes down the middle and the rainforest with its river. A cartographic view, used only
// on the hub. Tapping a world says what it is like there, and something small happens: a wave rolls in, a snowcap
// glints, a pink river dolphin fin pops up.
import { motion } from 'motion/react'
import { useState } from 'react'
import { say, sounds } from '../../../sdk'
import { art } from './art'
import { L } from './lines'
import { INK } from './puppets/Alpaca'

/** The painting, cropped square around Peru (x 256-1280 of the 1536 x 1024 original). */
export const MAP_RATIO = 1

/** Tap zones for the three worlds, in % of the map (centre and size). */
const WORLDS = [
  ['coast', 'the coast', 24.5, 40, 13, 34],
  ['mountains', 'the mountains', 42.5, 44, 11, 30],
  ['forest', 'the rainforest', 63.5, 22, 18, 26],
] as const

export function PeruMap() {
  const [wave, setWave] = useState(0)
  const [glint, setGlint] = useState(0)
  const [fin, setFin] = useState(0)
  const tap = (which: 'coast' | 'mountains' | 'forest') => {
    sounds.pop()
    void say(L.worlds[which])
    if (which === 'coast') setWave((w) => w + 1)
    if (which === 'mountains') {
      setGlint((g) => g + 1)
      sounds.sparkle()
    }
    if (which === 'forest') setFin((f) => f + 1)
  }
  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--shadow)', border: '5px solid #fff', background: `url(${art.map}) center / cover` }}>
      {/* A little surprise for each world (in the original painting's 1536 x 1024 space). */}
      <svg viewBox="256 0 1024 1024" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {wave > 0 && (
          <motion.path key={`w${wave}`} d="M330 470q24 -26 48 0t48 0t48 0" fill="none" stroke="#FFF7F0" strokeWidth="12" strokeLinecap="round" initial={{ x: -120, opacity: 0 }} animate={{ x: [-120, 20], opacity: [0, 1, 0] }} transition={{ duration: 1.4 }} />
        )}
        {glint > 0 && (
          <g transform="translate(700 420)">
            <motion.path key={`g${glint}`} d="M0 -30L8 -8L30 0L8 8L0 30L-8 8L-30 0L-8 -8Z" fill="#FFC83D" stroke={INK} strokeWidth="3" initial={{ scale: 0 }} animate={{ scale: [0, 1.6, 0], rotate: 90 }} transition={{ duration: 0.9 }} />
          </g>
        )}
        {fin > 0 && (
          <g transform="translate(960 262)">
            <motion.path key={`f${fin}`} d="M-20 10Q0 -36 24 10Z" fill="#FF8FB8" stroke={INK} strokeWidth="4" initial={{ y: 16, opacity: 0 }} animate={{ y: [16, -8, -8, 16], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.6, times: [0, 0.2, 0.8, 1] }} />
          </g>
        )}
      </svg>
      {/* Tap a world to hear about it. */}
      {WORLDS.map(([which, label, x, y, w, h]) => (
        <button key={which} aria-label={label} onClick={() => tap(which)} style={{ position: 'absolute', left: `${x - w / 2}%`, top: `${y - h / 2}%`, width: `${w}%`, height: `${h}%`, borderRadius: '50%', background: 'none', border: 'none', padding: 0, zIndex: 1 }} />
      ))}
    </div>
  )
}

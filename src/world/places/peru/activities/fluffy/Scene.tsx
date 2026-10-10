// Things around the salon that answer a tap (none of them is "the answer"): clouds, a snowy peak, a hummingbird, the
// stone wall's lizard, Luna's satchel on the post, the pond, the prickly pear cactus and its tiny dye bug.
import { motion } from 'motion/react'
import { useState } from 'react'
import { say, sounds } from '../../../../../sdk'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/Alpaca'
import { fsfx } from './sfx'

const bare = { padding: 0, background: 'none', border: 'none' } as const

/** A flat cream cloud with the scene's dark outline. Drifts slowly; a tap makes it puff up. */
export function Cloud({ x, y, w, gust, delay }: { x: number; y: number; w: number; gust: boolean; delay: number }) {
  const [puff, setPuff] = useState(0)
  return (
    <motion.button
      aria-label="cloud"
      onClick={() => {
        setPuff((p) => p + 1)
        sounds.whoosh()
      }}
      animate={gust ? { x: [0, 260, 0] } : { x: [0, 40, 0] }}
      transition={gust ? { duration: 2.2, ease: 'easeInOut' } : { repeat: Infinity, duration: 14, ease: 'easeInOut', delay }}
      style={{ ...bare, position: 'absolute', left: x - w / 2, top: y - w * 0.3, width: w, height: w * 0.6, zIndex: 2 }}
    >
      <motion.svg key={puff} viewBox="0 0 200 110" initial={{ scale: 1 }} animate={puff ? { scale: [1, 1.25, 0.95, 1] } : {}} transition={{ duration: 0.5 }} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <path d="M30 92Q4 92 8 70Q12 50 38 54Q40 22 74 22Q98 4 124 22Q160 14 166 46Q196 50 192 74Q190 94 164 92Z" fill="#FFF7F0" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      </motion.svg>
    </motion.button>
  )
}

/** A four-point sparkle star (the same shape the brush makes). */
function Star({ size, color = '#FFC83D' }: { size: number; color?: string }) {
  return (
    <svg viewBox="-10 -10 20 20" style={{ width: size, height: size }}>
      <path d="M0 -10L2.4 -2.4L10 0L2.4 2.4L0 10L-2.4 2.4L-10 0L-2.4 -2.4Z" fill={color} stroke={INK} strokeWidth="1" />
    </svg>
  )
}

/** The snowcap far away: a tap makes it glint. */
export function Peak({ x, y }: { x: number; y: number }) {
  const [glint, setGlint] = useState(0)
  return (
    <button
      aria-label="snowy mountain"
      onClick={() => {
        setGlint((g) => g + 1)
        sounds.sparkle()
      }}
      style={{ ...bare, position: 'absolute', left: x - 70, top: y - 40, width: 140, height: 110, zIndex: 1 }}
    >
      {glint > 0 && (
        <motion.div key={glint} initial={{ scale: 0, rotate: 0, opacity: 1 }} animate={{ scale: [0, 1.4, 0], rotate: 90 }} transition={{ duration: 0.9 }} style={{ position: 'absolute', left: 40, top: 0 }}>
          <Star size={60} color="#FFF7F0" />
        </motion.div>
      )}
    </button>
  )
}

// Hops between spots that stay clear of the alpacas, so a stroke never starts on the bird.
const HUM_SPOTS = [
  [0, 0],
  [110, -40],
  [60, -90],
] as const

export function Hummingbird({ x, y }: { x: number; y: number }) {
  const [spot, setSpot] = useState(0)
  const [dx, dy] = HUM_SPOTS[spot]
  return (
    <motion.button
      aria-label="hummingbird"
      onClick={() => {
        fsfx.zip()
        setSpot((s) => (s + 1) % HUM_SPOTS.length)
      }}
      animate={{ x: dx, y: dy }}
      transition={{ type: 'spring', stiffness: 120, damping: 12 }}
      style={{ ...bare, position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, zIndex: 4 }}
    >
      <motion.img src={art.hummingbird} alt="" draggable={false} animate={{ y: [0, -8, 0], rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 0.6 }} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </motion.button>
  )
}

/** The low stone wall: a lizard pops out of a gap and back. */
export function Wall({ cx, bottom, w }: { cx: number; bottom: number; w: number }) {
  const [peek, setPeek] = useState(0)
  const h = w * 0.42
  return (
    <button
      aria-label="stone wall"
      onClick={() => {
        setPeek((p) => p + 1)
        sounds.pop()
      }}
      style={{ ...bare, position: 'absolute', left: cx - w / 2, top: bottom - h, width: w, height: h, zIndex: 2 }}
    >
      {peek > 0 && (
        <motion.img
          key={peek}
          src={art.lizard}
          alt=""
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: [30, -h * 0.75, -h * 0.75, 30], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, times: [0, 0.2, 0.8, 1] }}
          style={{ position: 'absolute', left: w * 0.55, top: 0, width: w * 0.36 }}
        />
      )}
      <img src={art.stoneWall} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: '50% 100%' }} />
    </button>
  )
}

/** The fence post with Luna's pink explorer satchel: a tap opens the flap and the journal peeks out. */
export function Post({ cx, bottom, h, bird, onBird }: { cx: number; bottom: number; h: number; bird: boolean; onBird: () => void }) {
  const [open, setOpen] = useState(0)
  const w = h * 0.5
  return (
    <div style={{ position: 'absolute', left: cx - w / 2, top: bottom - h, width: w, height: h, zIndex: 2 }}>
      <img src={art.post} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: '50% 100%' }} />
      <motion.button
        aria-label="Luna's satchel"
        onClick={() => {
          setOpen((o) => o + 1)
          sounds.pop()
          void say(L.journal)
        }}
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        style={{ ...bare, position: 'absolute', left: -w * 0.35, top: h * 0.3, width: w * 1.7, height: h * 0.55, transformOrigin: '50% 0' }}
      >
        <svg viewBox="0 0 120 110" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <path d="M28 10Q60 -14 92 10" fill="none" stroke="#FF4F9A" strokeWidth="7" />
          <path d="M28 10Q60 -14 92 10" fill="none" stroke={INK} strokeWidth="2" />
          {open > 0 && (
            <motion.g key={open} initial={{ y: 30 }} animate={{ y: [30, 0, 0, 30] }} transition={{ duration: 2.2, times: [0, 0.2, 0.8, 1] }}>
              <rect x="38" y="22" width="44" height="40" rx="5" fill="#B9A6F5" stroke={INK} strokeWidth="4" />
              <path d="M60 24V60" stroke={INK} strokeWidth="3" />
              <circle cx="50" cy="38" r="5" fill="#FF8FB8" />
            </motion.g>
          )}
          <rect x="20" y="40" width="80" height="62" rx="16" fill="#FF8FB8" stroke={INK} strokeWidth="5" />
          <motion.path key={`flap${open}`} d="M20 46Q20 34 34 34H86Q100 34 100 46V64Q60 76 20 64Z" fill="#FF4F9A" stroke={INK} strokeWidth="5" strokeLinejoin="round" initial={{ rotate: 0 }} animate={open ? { rotate: [0, -60, -60, 0] } : {}} transition={{ duration: 2.2, times: [0, 0.2, 0.8, 1] }} style={{ transformOrigin: '60px 34px' }} />
          <circle cx="60" cy="66" r="6" fill="#FFC83D" stroke={INK} strokeWidth="3" />
        </svg>
      </motion.button>
      {bird && (
        <motion.button
          aria-label="baby bird"
          onClick={onBird}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ ...bare, position: 'absolute', left: w * 0.5 - 45, top: -70, width: 90, height: 90 }}
        >
          <img src={art.bird} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </motion.button>
      )}
    </div>
  )
}

/** The pond in front of the alpacas: ripples on a tap. */
export function Pond({ cx, y, w, shimmer, glow, onTap }: { cx: number; y: number; w: number; shimmer: boolean; glow: boolean; onTap: () => void }) {
  const [rip, setRip] = useState(0)
  const h = w * 0.16
  return (
    <button
      aria-label="pond"
      className={glow ? 'world-glow' : undefined}
      onClick={() => {
        setRip((r) => r + 1)
        fsfx.plip()
        onTap()
      }}
      style={{ ...bare, position: 'absolute', left: cx - w / 2, top: y - h / 2 - (glow ? 20 : 0), width: w, height: h + (glow ? 40 : 0), borderRadius: '50%', zIndex: 5 }}
    >
      <img src={art.pond} alt="" draggable={false} style={{ position: 'absolute', left: 0, top: glow ? 20 : 0, width: '100%', height: h, objectFit: 'fill' }} />
      {[rip, shimmer ? -1 : null].filter((v) => v !== null && v !== 0).map((k) => (
        <motion.div
          key={k}
          initial={{ scale: 0.2, opacity: 1 }}
          animate={{ scale: [0.2, 1.4], opacity: [1, 0] }}
          transition={{ duration: 1.2, repeat: k === -1 ? 2 : 0 }}
          style={{ position: 'absolute', left: '35%', top: '25%', width: '30%', height: '50%', borderRadius: '50%', border: '5px solid #FFF7F0' }}
        />
      ))}
    </button>
  )
}

export type BugState = 'hide' | 'peek' | 'wave' | 'squish'

/** The tiny cochineal bug that lives on the prickly pear (real: it makes red and pink dye). */
function Bug({ state }: { state: BugState }) {
  if (state === 'hide') return null
  return (
    <motion.svg
      viewBox="-30 -30 60 50"
      initial={{ scale: 0 }}
      animate={state === 'squish' ? { scale: [1, 1.3, 0], rotate: [0, 0, 40] } : { scale: 1, rotate: state === 'wave' ? [0, -10, 10, -10, 0] : 0 }}
      transition={{ duration: state === 'squish' ? 0.6 : 0.9, repeat: state === 'wave' ? Infinity : 0 }}
      style={{ position: 'absolute', left: '40%', top: '22%', width: '28%', overflow: 'visible' }}
    >
      <ellipse cx="0" cy="0" rx="22" ry="16" fill="#FFF7F0" stroke={INK} strokeWidth="4" />
      <circle cx="-8" cy="-3" r="3.5" fill={INK} />
      <circle cx="8" cy="-3" r="3.5" fill={INK} />
      <circle cx="-12" cy="5" r="3" fill="#FF8FB8" />
      <circle cx="12" cy="5" r="3" fill="#FF8FB8" />
      <path d="M-5 6Q0 10 5 6" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      {state === 'wave' && <path d="M20 -6L30 -18" stroke={INK} strokeWidth="4" strokeLinecap="round" />}
    </motion.svg>
  )
}

export function Cactus({ cx, bottom, h, glow, bug, onTap }: { cx: number; bottom: number; h: number; glow: boolean; bug: BugState; onTap: () => void }) {
  const [kick, setKick] = useState(0)
  const w = h * 0.8
  return (
    <motion.button
      aria-label="cactus"
      className={glow ? 'world-glow' : undefined}
      onClick={() => {
        setKick((k) => k + 1)
        onTap()
      }}
      key={kick}
      animate={kick ? { rotate: [0, -5, 4, -2, 0] } : {}}
      transition={{ duration: 0.5 }}
      style={{ ...bare, position: 'absolute', left: cx - w / 2, top: bottom - h, width: w, height: h, transformOrigin: '50% 100%', borderRadius: 40, zIndex: 7 }}
    >
      <img src={art.cactus} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: '50% 100%' }} />
      <Bug state={bug} />
    </motion.button>
  )
}

/** Gusty wind lines across the meadow. */
export function Wind({ w, h }: { w: number; h: number }) {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 14, overflow: 'hidden' }}>
      {[0.3, 0.45, 0.62].map((y, i) => (
        <motion.svg key={i} viewBox="0 0 300 40" initial={{ x: -400 }} animate={{ x: w + 100 }} transition={{ duration: 1.3, delay: i * 0.25, ease: 'easeIn' }} style={{ position: 'absolute', top: h * y, width: 300, height: 40 }}>
          <path d="M5 20Q80 0 150 20T295 20" fill="none" stroke="#FFF7F0" strokeWidth="8" strokeLinecap="round" />
        </motion.svg>
      ))}
    </div>
  )
}

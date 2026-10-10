// The bay at Paracas, cut away so she sees above and below the surface (like the side of a fish tank), and the things
// around it that answer a tap (none of them is "the answer"): the sun, the Candelabra on the far hill, a tour boat,
// an Inca tern with a curly white mustache, kelp, a jellyfish and a red Sally Lightfoot crab.
import { motion } from 'motion/react'
import { useState } from 'react'
import { say, sounds } from '../../../../../sdk'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/Alpaca'
import type { Box, PenguinStage } from './layout'
import { psfx } from './sfx'

const P = L.penguins
const bare = { padding: 0, background: 'none', border: 'none' } as const
export const WATER = '#5DB8EC'

/** The underwater tint (over the cliff's foot and the rock), light rays, and the sandy sea floor. */
export function Underwater({ S }: { S: PenguinStage }) {
  const deep = S.h - S.sea
  return (
    <div aria-hidden style={{ position: 'absolute', left: -400, top: S.sea, width: S.w + 800, height: deep + 400, pointerEvents: 'none', zIndex: 6, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(52,150,215,.42)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: deep * 0.55, bottom: 0, background: 'rgba(40,110,190,.18)' }} />
      {[0.42, 0.6, 0.8].map((x, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.18, 0.32, 0.18] }}
          transition={{ repeat: Infinity, duration: 4 + i, ease: 'easeInOut' }}
          style={{ position: 'absolute', left: 400 + S.w * x, top: 0, width: 70 + i * 20, height: deep * 0.8, background: '#FFF7F0', transform: 'skewX(-14deg)', transformOrigin: '0 0' }}
        />
      ))}
      {/* Sea floor: sand with a few pebbles (and more sand past the stage's edge on very wide or tall screens). */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: deep, bottom: 0, background: '#F2C98F' }} />
      <svg viewBox={`0 0 ${S.w} 80`} preserveAspectRatio="none" style={{ position: 'absolute', left: 400, top: deep - 70, width: S.w, height: 70 }}>
        <path d={`M0 30Q${S.w * 0.25} 10 ${S.w * 0.5} 26T${S.w} 22V80H0Z`} fill="#F2C98F" stroke={INK} strokeWidth="5" />
        {[0.55, 0.7, 0.86].map((x) => (
          <ellipse key={x} cx={S.w * x} cy="44" rx="16" ry="9" fill="#D9CCFF" stroke={INK} strokeWidth="4" />
        ))}
      </svg>
    </div>
  )
}

/** The wavy surface line across the water (wider swells in the twist). */
export function Surface({ S, rough }: { S: PenguinStage; rough: boolean }) {
  const x0 = S.cliff.x + S.cliff.w * 0.8
  const w = S.w - x0 + 200
  const wave = (amp: number) => {
    let d = `M0 ${20}`
    for (let x = 0; x <= w + 120; x += 60) d += ` Q${x + 30} ${20 - amp} ${x + 60} 20`
    return d
  }
  return (
    <motion.svg
      aria-hidden
      viewBox={`0 0 ${w + 120} 60`}
      animate={{ x: [0, -60], y: rough ? [0, -14, 0, 10, 0] : [0, -3, 0] }}
      transition={{ x: { repeat: Infinity, duration: 2.4, ease: 'linear' }, y: { repeat: Infinity, duration: rough ? 4 : 3, ease: 'easeInOut' } }}
      style={{ position: 'absolute', left: x0, top: S.sea - 20, width: w + 120, height: 60, pointerEvents: 'none', zIndex: 7, overflow: 'visible' }}
    >
      <path d={wave(12)} fill="none" stroke="#FFF7F0" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}

/** Tap the sun: it glows. */
export function Sun({ x, y, r }: { x: number; y: number; r: number }) {
  const [n, setN] = useState(0)
  return (
    <button aria-label="sun" onClick={() => (setN((v) => v + 1), sounds.sparkle())} style={{ ...bare, position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', zIndex: 1 }}>
      {n > 0 && <motion.div key={n} initial={{ scale: 0.8, opacity: 0.9 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 0.9 }} style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#FFC83D' }} />}
    </button>
  )
}

/** The Paracas Candelabra on the far hill: a tap makes it glint. */
export function Candelabra({ x, y, r }: { x: number; y: number; r: number }) {
  const [n, setN] = useState(0)
  return (
    <button aria-label="candelabra on the hill" onClick={() => (setN((v) => v + 1), sounds.sparkle())} style={{ ...bare, position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, zIndex: 1 }}>
      {n > 0 &&
        [0, 1, 2].map((i) => (
          <motion.svg key={`${n}${i}`} viewBox="-10 -10 20 20" initial={{ scale: 0, opacity: 1 }} animate={{ scale: [0, 1.3, 0], rotate: 90 }} transition={{ duration: 0.8, delay: i * 0.15 }} style={{ position: 'absolute', left: r * (0.4 + i * 0.4) - 20, top: r * (0.3 + (i % 2) * 0.5) - 20, width: 40, height: 40 }}>
            <path d="M0 -10L2.4 -2.4L10 0L2.4 2.4L0 10L-2.4 2.4L-10 0L-2.4 -2.4Z" fill="#FFF7F0" stroke={INK} strokeWidth="1" />
          </motion.svg>
        ))}
    </button>
  )
}

/** A tour boat chugging along far out on the bay; a tap toots its horn and the people wave. */
export function Boat({ S }: { S: PenguinStage }) {
  const [toot, setToot] = useState(0)
  const h = S.boat.w * (288 / 512)
  return (
    <motion.button
      aria-label="tour boat"
      onClick={() => (setToot((t) => t + 1), psfx.toot())}
      animate={{ x: [S.boat.x[1], S.boat.x[0], S.boat.x[1]] }}
      transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
      style={{ ...bare, position: 'absolute', left: -S.boat.w / 2, top: S.sea - h * 0.82, width: S.boat.w, height: h, zIndex: 3 }}
    >
      <motion.img key={toot} src={art.boat} alt="" draggable={false} animate={toot ? { y: [0, -10, 0, -6, 0], rotate: [0, -4, 3, 0] } : { y: [0, -3, 0] }} transition={toot ? { duration: 0.8 } : { repeat: Infinity, duration: 2.2 }} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      {toot > 0 && (
        <motion.span key={`n${toot}`} initial={{ y: 0, opacity: 1 }} animate={{ y: -50, opacity: 0 }} transition={{ duration: 1 }} style={{ position: 'absolute', right: 0, top: -10, fontSize: 34 }}>
          ♪
        </motion.span>
      )}
    </motion.button>
  )
}

/** An Inca tern on the cliff top: a tap twirls its mustache and it squawks (the second tap tells the fact). */
export function Tern({ x, y, h }: { x: number; y: number; h: number }) {
  const [n, setN] = useState(0)
  const w = h * (512 / 423)
  return (
    <motion.button
      aria-label="Inca tern"
      onClick={() => {
        setN((v) => v + 1)
        psfx.squawk()
        if (n % 3 === 1) void say(P.tern)
      }}
      style={{ ...bare, position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, zIndex: 9, transformOrigin: '50% 100%' }}
    >
      <motion.img key={n} src={art.tern} alt="" draggable={false} animate={n ? { rotate: [0, -12, 12, -8, 0], scaleY: [1, 1.15, 0.9, 1], y: [0, -18, 0] } : { rotate: [0, 2, 0] }} transition={n ? { duration: 0.7 } : { repeat: Infinity, duration: 3 }} style={{ width: '100%', height: '100%', objectFit: 'contain', transformOrigin: '50% 100%' }} />
    </motion.button>
  )
}

/** Kelp swaying on the sea floor; a tap shakes it and lets out bubbles. */
export function Kelp({ x, y, w, delay }: Box & { delay: number }) {
  const [n, setN] = useState(0)
  const h = w * (512 / 214)
  return (
    <motion.button
      aria-label="kelp"
      onClick={() => (setN((v) => v + 1), psfx.bubbles())}
      animate={{ rotate: [-4, 4, -4] }}
      transition={{ repeat: Infinity, duration: 4, delay, ease: 'easeInOut' }}
      style={{ ...bare, position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, zIndex: 5, transformOrigin: '50% 100%' }}
    >
      <motion.img key={n} src={art.kelp} alt="" draggable={false} animate={n ? { skewX: [0, 10, -8, 5, 0] } : {}} transition={{ duration: 0.8 }} style={{ width: '100%', height: '100%', objectFit: 'contain', transformOrigin: '50% 100%' }} />
      {n > 0 && <Bubbles key={`b${n}`} />}
    </motion.button>
  )
}

function Bubbles() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <motion.div key={i} initial={{ y: 0, opacity: 1 }} animate={{ y: -220 - i * 30, x: (i % 2 ? 1 : -1) * 20, opacity: 0 }} transition={{ duration: 1.4, delay: i * 0.12 }} style={{ position: 'absolute', left: '40%', top: '30%', width: 22 - i * 3, height: 22 - i * 3, borderRadius: '50%', border: `3px solid #FFF7F0`, background: 'rgba(255,255,255,.25)' }} />
      ))}
    </>
  )
}

/** A jellyfish drifting up and down; a tap squishes it and it pulses up. */
export function Jelly({ x, y, w }: { x: number; y: number; w: number }) {
  const [n, setN] = useState(0)
  const h = w * (512 / 430)
  return (
    <motion.button
      aria-label="jellyfish"
      onClick={() => (setN((v) => v + 1), sounds.pop())}
      animate={{ y: [0, -40, 0] }}
      transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
      style={{ ...bare, position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, zIndex: 8 }}
    >
      <motion.img key={n} src={art.jellyfish} alt="" draggable={false} animate={n ? { scaleY: [1, 0.7, 1.2, 1], scaleX: [1, 1.2, 0.9, 1], y: [0, 0, -50, -30] } : { scaleY: [1, 0.94, 1] }} transition={n ? { duration: 1 } : { repeat: Infinity, duration: 1.4 }} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </motion.button>
  )
}

/** A red Sally Lightfoot crab on the sea floor; a tap and it scuttles sideways (then back). */
export function Crab({ x, y, w }: { x: number; y: number; w: number }) {
  const [n, setN] = useState(0)
  const h = w * (409 / 512)
  return (
    <motion.button
      aria-label="crab"
      onClick={() => (setN((v) => v + 1), sounds.pop())}
      animate={n ? { x: [0, n % 2 ? 110 : -110, n % 2 ? 110 : -110, 0] } : {}}
      transition={{ duration: 2.2, times: [0, 0.3, 0.7, 1] }}
      key={n}
      style={{ ...bare, position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, zIndex: 8 }}
    >
      <motion.img src={art.crab} alt="" draggable={false} animate={{ rotate: n ? [0, -6, 6, -6, 6, 0] : [0, 3, 0] }} transition={n ? { duration: 1 } : { repeat: Infinity, duration: 2 }} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </motion.button>
  )
}

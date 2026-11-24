// The bay at Paracas, cut away so she sees above and below the surface (like the side of a fish tank), and the things
// around it that answer a tap (none of them is "the answer"): the sun, the Candelabra on the far hill, a tour boat,
// an Inca tern with a curly white mustache, kelp, a jellyfish and a red Sally Lightfoot crab. The drawings themselves
// are in Coast.tsx (the land) and Critters.tsx (who lives here): all by hand, in the flat look.
import { motion } from 'motion/react'
import { useState } from 'react'
import { say, sounds } from '../../../../../sdk'
import { L } from '../../lines'
import { BoatArt, CrabArt, JellyArt, KelpArt, Note, TernArt } from './Critters'
import type { Box, PenguinStage } from './layout'
import { psfx } from './sfx'

const P = L.penguins
const bare = { padding: 0, background: 'none', border: 'none' } as const

/** The underwater tint (over the cliff's foot and the rock), light rays, and the sandy sea floor. */
/** `floor`: the sea floor (stage units), at the bottom of the screen even when the screen is taller than the stage. */
export function Underwater({ S, floor }: { S: PenguinStage; floor: number }) {
  const deep = floor - S.sea
  const W = S.w + 800
  // The floor's wavy top edge, and the same wave a little lower for its lit rim.
  const wave = (y: number) => {
    let d = ''
    for (let x = 0; x <= W; x += 40) d += `${x ? 'L' : 'M'}${x} ${(y + Math.sin((x / W) * Math.PI * 7) * 8 + Math.sin((x / W) * Math.PI * 17) * 3).toFixed(1)}`
    return d
  }
  return (
    <div aria-hidden style={{ position: 'absolute', left: -400, top: S.sea, width: W, height: deep + 400, pointerEvents: 'none', zIndex: 6, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(rgba(134,220,236,.26) 0, rgba(74,160,222,.42) ${deep}px)` }} />
      {[0.4, 0.58, 0.8].map((x, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 4 + i, ease: 'easeInOut' }}
          style={{ position: 'absolute', left: 400 + S.w * x, top: 0, width: 64 + i * 22, height: deep * 0.86, background: 'linear-gradient(rgba(255,255,255,.3), rgba(255,255,255,0))', transform: 'skewX(-14deg)', transformOrigin: '0 0' }}
        />
      ))}
      {/* Sea floor: pale sand with a lit rim, ripples, pebbles and shells (and more sand past the stage's edge on very wide or tall screens). */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: deep, bottom: 0, background: '#f1d9ac' }} />
      <svg viewBox={`0 0 ${W} 90`} style={{ position: 'absolute', left: 0, top: deep - 70, width: W, height: 90 }}>
        <path d={`${wave(24)}V90H0Z`} fill="#f1d9ac" />
        <path d={wave(29)} fill="none" stroke="#fdf0d2" strokeWidth="7" strokeLinecap="round" />
        {[0.5, 0.63, 0.78, 0.93].map((x, i) => (
          <path key={x} d={`M${400 + S.w * x} ${58 + (i % 2) * 14}q26 -9 52 0`} fill="none" stroke="#dcbd88" strokeWidth="5" strokeLinecap="round" />
        ))}
        {[0.46, 0.7, 0.86].map((x, i) => (
          <g key={x} transform={`translate(${400 + S.w * x} ${50 + (i % 2) * 12})`}>
            <ellipse rx="17" ry="9.5" fill="#bcb6d6" />
            <ellipse cx="-5" cy="-3" rx="7" ry="3" fill="#dedaf0" />
          </g>
        ))}
        <g transform={`translate(${400 + S.w * 0.58} 56)`}>
          <path d="M-12 5Q-14 -11 0 -12Q14 -11 12 5Q0 10 -12 5Z" fill="#ffc4da" />
          <path d="M0 -11V6M-6 -8L-4 6M6 -8L4 6" stroke="#ff8fb8" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}

/** The wavy surface line across the water (wider swells in the twist). */
export function Surface({ S, rough }: { S: PenguinStage; rough: boolean }) {
  // It starts at the cliff's face (the box cuts it off there) and runs on past the stage's right edge.
  const x0 = S.burrow.lip.x + 14
  const w = S.w - x0 + 460
  const wave = (amp: number) => {
    let d = `M0 ${20}`
    for (let x = 0; x <= w + 120; x += 60) d += ` Q${x + 30} ${20 - amp} ${x + 60} 20`
    return d
  }
  return (
    <div aria-hidden style={{ position: 'absolute', left: x0, top: S.sea - 40, width: w, height: 100, overflow: 'hidden', pointerEvents: 'none', zIndex: 7 }}>
      <motion.svg
        viewBox={`0 0 ${w + 120} 60`}
        animate={{ x: [0, -60], y: rough ? [0, -14, 0, 10, 0] : [0, -3, 0] }}
        transition={{ x: { repeat: Infinity, duration: 2.4, ease: 'linear' }, y: { repeat: Infinity, duration: rough ? 4 : 3, ease: 'easeInOut' } }}
        style={{ position: 'absolute', left: 0, top: 20, width: w + 120, height: 60, overflow: 'visible' }}
      >
        <path d={`${wave(11)}V44H0Z`} fill="#fff" opacity="0.2" />
        <path d={wave(11)} fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
      </motion.svg>
    </div>
  )
}

/** Tap the sun: it glows. */
export function Sun({ x, y, r }: { x: number; y: number; r: number }) {
  const [n, setN] = useState(0)
  return (
    <button aria-label="sun" onClick={() => (setN((v) => v + 1), sounds.sparkle())} style={{ ...bare, position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', zIndex: 1 }}>
      {n > 0 && <motion.div key={n} initial={{ scale: 0.8, opacity: 0.9 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.9 }} style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#fff6cc' }} />}
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
            <path d="M0 -10L2.4 -2.4L10 0L2.4 2.4L0 10L-2.4 2.4L-10 0L-2.4 -2.4Z" fill="#fff" />
          </motion.svg>
        ))}
    </button>
  )
}

/** A tour boat chugging along far out on the bay; a tap toots its horn and the friends on board bounce. */
export function Boat({ S }: { S: PenguinStage }) {
  const [toot, setToot] = useState(0)
  const h = S.boat.w * (112 / 200)
  return (
    <motion.button
      aria-label="tour boat"
      onClick={() => (setToot((t) => t + 1), psfx.toot())}
      animate={{ x: [S.boat.x[1], S.boat.x[0], S.boat.x[1]] }}
      transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
      style={{ ...bare, position: 'absolute', left: -S.boat.w / 2, top: S.sea - h * 0.82, width: S.boat.w, height: h, zIndex: 3 }}
    >
      <motion.div key={toot} animate={toot ? { y: [0, -10, 0, -6, 0], rotate: [0, -4, 3, 0] } : { y: [0, -3, 0] }} transition={toot ? { duration: 0.8 } : { repeat: Infinity, duration: 2.2 }} style={{ width: '100%', height: '100%' }}>
        <BoatArt wave={toot} />
      </motion.div>
      {toot > 0 && (
        <motion.div key={`n${toot}`} initial={{ y: 0, opacity: 1 }} animate={{ y: -50, opacity: 0 }} transition={{ duration: 1 }} style={{ position: 'absolute', right: 0, top: -24, width: 30, height: 40 }}>
          <Note />
        </motion.div>
      )}
    </motion.button>
  )
}

/** An Inca tern on the cliff top: a tap twirls its mustache and it squawks (the second tap tells the fact). */
export function Tern({ x, y, h }: { x: number; y: number; h: number }) {
  const [n, setN] = useState(0)
  const w = h * (145 / 120)
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
      <motion.div key={n} animate={n ? { rotate: [0, -12, 12, -8, 0], scaleY: [1, 1.15, 0.9, 1], y: [0, -18, 0] } : { rotate: [0, 2, 0] }} transition={n ? { duration: 0.7 } : { repeat: Infinity, duration: 3 }} style={{ width: '100%', height: '100%', transformOrigin: '50% 100%' }}>
        <TernArt twirl={n} />
      </motion.div>
    </motion.button>
  )
}

/** Kelp swaying on the sea floor; a tap shakes it and lets out bubbles. */
export function Kelp({ x, y, w }: Box) {
  const [n, setN] = useState(0)
  const h = w * (287 / 120)
  return (
    <motion.button aria-label="kelp" onClick={() => (setN((v) => v + 1), psfx.bubbles())} style={{ ...bare, position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, zIndex: 5 }}>
      <motion.div key={n} animate={n ? { skewX: [0, 10, -8, 5, 0] } : {}} transition={{ duration: 0.8 }} style={{ width: '100%', height: '100%', transformOrigin: '50% 100%' }}>
        <KelpArt />
      </motion.div>
      {n > 0 && <Bubbles key={`b${n}`} />}
    </motion.button>
  )
}

function Bubbles() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <motion.div key={i} initial={{ y: 0, opacity: 1 }} animate={{ y: -220 - i * 30, x: (i % 2 ? 1 : -1) * 20, opacity: 0 }} transition={{ duration: 1.4, delay: i * 0.12 }} style={{ position: 'absolute', left: '40%', top: '30%', width: 22 - i * 3, height: 22 - i * 3, borderRadius: '50%', border: `3px solid #fff`, background: 'rgba(255,255,255,.25)' }} />
      ))}
    </>
  )
}

/** A jellyfish drifting up and down; a tap squishes it and it pulses up. */
export function Jelly({ x, y, w }: { x: number; y: number; w: number }) {
  const [n, setN] = useState(0)
  const h = w * (119 / 100)
  return (
    <motion.button
      aria-label="jellyfish"
      onClick={() => (setN((v) => v + 1), sounds.pop())}
      animate={{ y: [0, -40, 0] }}
      transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
      style={{ ...bare, position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, zIndex: 8 }}
    >
      <motion.div key={n} animate={n ? { scaleY: [1, 0.7, 1.2, 1], scaleX: [1, 1.2, 0.9, 1], y: [0, 0, -50, -30] } : { scaleY: [1, 0.94, 1] }} transition={n ? { duration: 1 } : { repeat: Infinity, duration: 1.4 }} style={{ width: '100%', height: '100%' }}>
        <JellyArt />
      </motion.div>
    </motion.button>
  )
}

/** A red Sally Lightfoot crab on the sea floor; a tap and it scuttles sideways (then back). */
export function Crab({ x, y, w }: { x: number; y: number; w: number }) {
  const [n, setN] = useState(0)
  const h = w * (100 / 125)
  return (
    <motion.button
      aria-label="crab"
      onClick={() => (setN((v) => v + 1), sounds.pop())}
      animate={n ? { x: [0, n % 2 ? 110 : -110, n % 2 ? 110 : -110, 0] } : {}}
      transition={{ duration: 2.2, times: [0, 0.3, 0.7, 1] }}
      key={n}
      style={{ ...bare, position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, zIndex: 8 }}
    >
      <motion.div animate={{ rotate: n ? [0, -6, 6, -6, 6, 0] : [0, 3, 0] }} transition={n ? { duration: 1 } : { repeat: Infinity, duration: 2 }} style={{ width: '100%', height: '100%' }}>
        <CrabArt />
      </motion.div>
    </motion.button>
  )
}

// Everything in the rainforest that answers the rain or a tap (none of it is "the answer"): heliconia plants that grow,
// a poison dart frog behind its leaf, leafcutter ants with leaf umbrellas, a dry puddle, the sleepy sloth, perched birds
// and monkeys, fruit that falls for the fish, butterflies, the lily buds that become giant lily pads, the sun and the
// rainbow. Positions are stage units (bottom-centre anchored unless noted).
import { motion } from 'motion/react'
import { forwardRef, useEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from 'react'
import { Buddy, sounds, type PuppetHandle } from '../../../../../sdk'
import { art } from './art'
import { INK } from '../../puppets/Alpaca'
import { rsfx } from './sfx'

const bare = { padding: 0, background: 'none', border: 'none' } as const

/** A critter or prop as a button: a Buddy sprite (it breathes, squashes, jumps), standing on (x, bottom). */
export function Critter({
  img,
  x,
  bottom,
  h,
  label,
  flip,
  voice,
  onTap,
  puppet,
  wrap,
  z = 4,
  glow,
  children,
  style,
  calm,
  data,
  hit = 0,
}: {
  img: string
  x: number
  bottom: number
  h: number
  label: string
  flip?: boolean
  voice?: string
  onTap?: () => void
  puppet?: Ref<PuppetHandle>
  wrap?: Ref<HTMLDivElement>
  z?: number
  glow?: boolean
  children?: ReactNode
  style?: CSSProperties
  calm?: boolean
  data?: string
  /** Extra invisible padding around the sprite so a small critter is still a big target. */
  hit?: number
}) {
  return (
    <div ref={wrap} style={{ position: 'absolute', left: x, top: bottom - h, height: h, zIndex: z, willChange: 'transform', ...style }}>
      <button
        aria-label={label}
        data-friend={data}
        className={glow ? 'world-glow' : undefined}
        onClick={onTap}
        style={{ ...bare, position: 'relative', height: `${h}px`, margin: -hit, padding: hit, boxSizing: 'content-box', translate: '-50% 0', display: 'block', borderRadius: 30, touchAction: data ? 'none' : undefined }}
      >
        <Buddy ref={puppet} img={img} voice={voice} height={`${h}px`} flip={flip} calm={calm} />
        {children}
      </button>
    </div>
  )
}

/** A big tree standing on the riverbed (not a button: taps fall through to the river and the sky). */
export function Tree({ img, x, base, h, flip }: { img: string; x: number; base: number; h: number; flip?: boolean }) {
  return <img src={img} alt="" draggable={false} style={{ position: 'absolute', left: x, top: base - h, height: h, translate: '-50% 0', scale: flip ? '-1 1' : undefined, pointerEvents: 'none', zIndex: 2 }} />
}

/** A heliconia plant: a sprout that shoots up in the rain, unrolls its big leaves and opens its red "lobster claw"
 *  flowers. `stage` 0..3. */
export function Plant({ x, base, h, stage, glow }: { x: number; base: number; h: number; stage: number; glow?: boolean }) {
  const [kick, setKick] = useState(0)
  const grow = [0.35, 0.6, 0.85, 1][Math.min(3, stage)]
  return (
    <motion.button
      aria-label="plant"
      onClick={() => {
        setKick((k) => k + 1)
        rsfx.plink()
      }}
      className={glow ? 'world-glow' : undefined}
      style={{ ...bare, position: 'absolute', left: x - h * 0.4, top: base - h, width: h * 0.8, height: h, zIndex: 7, borderRadius: 30 }}
    >
      <motion.svg
        key={kick}
        viewBox="-60 -150 120 150"
        initial={false}
        animate={{ scaleY: grow, scaleX: 0.6 + grow * 0.4, rotate: kick ? [0, -8, 6, -3, 0] : 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 9 }}
        style={{ width: '100%', height: '100%', overflow: 'visible', transformOrigin: '50% 100%' }}
      >
        <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
          <path d="M-2 0 C-4 -50 -2 -100 2 -128" fill="none" stroke="#3E8F5A" strokeWidth="7" />
          <path d="M0 -30 C-30 -40 -56 -70 -54 -96 C-30 -90 -8 -66 0 -30Z" fill="#5CBF6B" />
          <path d="M0 -40 C30 -54 52 -86 48 -110 C24 -100 6 -76 0 -40Z" fill="#4CAF62" />
          {stage >= 1 && <path d="M0 -70 C-24 -84 -40 -112 -34 -136 C-14 -124 -2 -100 0 -70Z" fill="#6CCB78" />}
          {stage >= 3 && (
            <g transform="translate(4 -126)">
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M0 ${i * 16} L${i % 2 ? -26 : 26} ${i * 16 + 4} L0 ${i * 16 + 14}Z`} fill={i % 2 ? '#FF6B4A' : '#FF4F6A'} />
              ))}
              {[0, 1, 2].map((i) => (
                <circle key={`t${i}`} cx={i % 2 ? -24 : 24} cy={i * 16 + 4} r="4" fill="#FFC83D" strokeWidth="2.5" />
              ))}
            </g>
          )}
        </g>
      </motion.svg>
    </motion.button>
  )
}

/** A big leaf on the bank with a tiny poison dart frog hiding behind it. Rain makes the frog pop up and sing. */
export function FrogLeaf({ x, base, h, up, sing, puppet, onTap }: { x: number; base: number; h: number; up: boolean; sing: number; puppet: Ref<PuppetHandle>; onTap: () => void }) {
  const leafH = h * 1.4
  return (
    <button aria-label="frog" onClick={onTap} style={{ ...bare, position: 'absolute', left: x - h, top: base - leafH - h * 0.6, width: h * 2, height: leafH + h * 0.6, zIndex: 7 }}>
      <motion.div initial={false} animate={{ y: up ? 0 : h * 0.9 }} transition={{ type: 'spring', stiffness: 220, damping: 12 }} style={{ position: 'absolute', left: h * 0.45, top: 0, height: h, zIndex: 0 }}>
        <Buddy ref={puppet} img={art.frog} height={`${h}px`} />
        {/* The throat sac puffs out when it sings. */}
        {sing > 0 && (
          <motion.div
            key={sing}
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: [0.2, 1, 0.5, 1, 0.2], opacity: [1, 1, 1, 1, 0] }}
            transition={{ duration: 0.9 }}
            style={{ position: 'absolute', left: h * 0.62, top: h * 0.55, width: h * 0.42, height: h * 0.36, borderRadius: '50%', background: '#BFE0FF', border: `3px solid ${INK}` }}
          />
        )}
      </motion.div>
      <svg viewBox="-70 -140 140 140" style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: leafH, overflow: 'visible', zIndex: 1 }}>
        <g stroke={INK} strokeWidth="4.5" strokeLinejoin="round">
          <path d="M0 0 C-4 -30 -6 -60 -10 -76" fill="none" stroke="#2F6E4A" strokeWidth="7" />
          <path d="M-10 -70 C-66 -64 -82 -112 -54 -138 C-20 -150 30 -136 40 -100 C46 -78 22 -64 -10 -70Z" fill="#3E8F5A" />
          <path d="M-10 -70 C-20 -96 -30 -118 -52 -134" fill="none" strokeWidth="3" />
          <path d="M6 0 C10 -26 20 -46 34 -58" fill="none" stroke="#2F6E4A" strokeWidth="6" />
          <path d="M34 -58 C30 -96 64 -112 70 -84 C74 -62 54 -50 34 -58Z" fill="#5CBF6B" />
        </g>
      </svg>
    </button>
  )
}

/** Leafcutter ants marching along the bank with their leaf pieces. In the rain (or a tap) they stop and hold their
 *  leaves up over their heads like umbrellas. */
export function Ants({ x0, x1, base, umbrella, onTap }: { x0: number; x1: number; base: number; umbrella: boolean; onTap: () => void }) {
  const n = 6
  const span = x1 - x0
  return (
    <button aria-label="leafcutter ants" onClick={onTap} style={{ ...bare, position: 'absolute', left: x0, top: base - 56, width: span, height: 60, zIndex: 6, overflow: 'hidden' }}>
      <div className={umbrella ? undefined : 'peru-march'} style={{ position: 'absolute', left: -span, top: 0, width: span * 2, height: '100%', ['--march' as string]: `${span}px` }}>
        {Array.from({ length: n * 2 }, (_, i) => (
          <svg key={i} viewBox="-20 -44 44 50" style={{ position: 'absolute', left: (i * span * 2) / (n * 2), bottom: 0, width: 38, height: 44, overflow: 'visible' }}>
            <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <g className={umbrella ? undefined : 'peru-legs'}>
                <path d="M-8 -4 L-12 4 M0 -4 L-2 5 M8 -4 L10 4" fill="none" />
              </g>
              <ellipse cx="-10" cy="-8" rx="7" ry="5" fill="#A8502E" />
              <ellipse cx="0" cy="-8" rx="4" ry="3.5" fill="#A8502E" />
              <circle cx="9" cy="-10" r="5" fill="#A8502E" />
              <circle cx="11" cy="-11" r="1.6" fill={INK} stroke="none" />
              {/* The leaf: carried on its back, or held up as an umbrella. */}
              <g style={{ transition: 'transform .35s', transform: umbrella ? 'translate(4px, -26px) rotate(0deg)' : 'translate(0px, -14px) rotate(-35deg)' }}>
                <path d="M2 -6 L2 6" fill="none" />
                <path d={umbrella ? 'M-14 -4 Q2 -24 18 -4Z' : 'M-6 -4 Q0 -22 12 -10 Q6 0 -6 -4Z'} fill="#6CCB78" />
              </g>
            </g>
          </svg>
        ))}
      </div>
    </button>
  )
}

/** A dry, cracked dip in the bank that fills with rain (0..1), then sparkles. */
export function Puddle({ x, base, w, fill }: { x: number; base: number; w: number; fill: number }) {
  const [rip, setRip] = useState(0)
  const h = w * 0.22
  return (
    <button
      aria-label="puddle"
      onClick={() => {
        setRip((r) => r + 1)
        if (fill > 0.3) rsfx.splash()
        else sounds.pop()
      }}
      style={{ ...bare, position: 'absolute', left: x - w / 2, top: base - h * 0.5, width: w, height: h * 1.4, zIndex: 7 }}
    >
      <svg viewBox="-100 -12 200 34" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <ellipse cx="0" cy="6" rx="96" ry="16" fill="#8A6244" stroke={INK} strokeWidth="4" />
        {fill < 0.5 && <path d="M-60 6 L-40 0 L-30 10 L-10 2 M20 4 L36 12 L50 2 L70 8" fill="none" stroke="#5E3F2B" strokeWidth="3" strokeLinecap="round" />}
        <ellipse cx="0" cy="6" rx={96 * fill} ry={16 * fill} fill="#89CFF5" stroke={fill > 0.05 ? INK : 'none'} strokeWidth="3" style={{ transition: 'rx .4s, ry .4s' }} />
        {fill >= 1 && <ellipse cx="-30" cy="2" rx="22" ry="4" fill="#fff" opacity=".7" />}
      </svg>
      {rip > 0 && fill > 0.3 && (
        <motion.div key={rip} initial={{ scale: 0.2, opacity: 1 }} animate={{ scale: 1.3, opacity: 0 }} transition={{ duration: 0.8 }} style={{ position: 'absolute', left: '30%', top: '15%', width: '40%', height: '50%', borderRadius: '50%', border: '4px solid #fff' }} />
      )}
    </button>
  )
}

/** The sloth's picture: its size (width / height), where its claws grip (share of the width), and its sleepy eyes in
 *  the picture's own pixels (near eye first). */
const SLOTH = { w: 512, h: 412, claws: 0.68 }
const SLOTH_EYES: [number, number][] = [
  [182, 180],
  [82, 214],
]

/** The sloth hanging from the liana: asleep, until the rain slowly opens one eye (then both). Sways from its claws.
 *  (x = the middle of its claws, y = its top.) */
export const Sloth = forwardRef<PuppetHandle, { x: number; y: number; h: number; awake: number; onTap: () => void }>(function Sloth({ x, y, h, awake, onTap }, ref) {
  const w = (h * SLOTH.w) / SLOTH.h
  return (
    <motion.button
      aria-label="sloth"
      onClick={onTap}
      animate={{ rotate: [-4, 4, -4] }}
      transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
      style={{ ...bare, position: 'absolute', left: x - w * SLOTH.claws, top: y - h * 0.04, width: w, height: h, zIndex: 3, transformOrigin: `${SLOTH.claws * 100}% 0%`, borderRadius: 30 }}
    >
      <Buddy ref={ref} img={art.sloth} voice="sloth" height={`${h}px`} calm />
      {awake > 0 && (
        <svg viewBox={`0 0 ${SLOTH.w} ${SLOTH.h}`} style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, pointerEvents: 'none', overflow: 'visible' }}>
          {SLOTH_EYES.slice(0, awake).map(([ex, ey], i) => (
            <motion.g key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1.8, ease: 'easeInOut' }} style={{ transformOrigin: `${ex}px ${ey}px`, transformBox: 'view-box' }}>
              <ellipse cx={ex} cy={ey} rx="24" ry="20" fill="#5B3B2A" />
              <circle cx={ex} cy={ey + 1} r="15" fill={INK} />
              <circle cx={ex + 5} cy={ey - 5} r="5" fill="#fff" />
            </motion.g>
          ))}
        </svg>
      )}
    </motion.button>
  )
})

/** A liana looping down from the branch (a to b at height y) to `bottom`: the sloth's swing. Code-drawn vine with
 *  leaves, in the flat outlined style. */
export function Liana({ a, b, y, bottom }: { a: number; b: number; y: number; bottom: number }) {
  const mid = (a + b) / 2
  const d = `M${a} ${y} C${a - 10} ${bottom - 40} ${mid - 60} ${bottom + 10} ${mid} ${bottom + 6} C${mid + 60} ${bottom + 10} ${b + 10} ${bottom - 40} ${b} ${y}`
  const leaves = [0.2, 0.38, 0.62, 0.82].map((k, i) => {
    const x = k < 0.5 ? a + (mid - a) * k * 1.6 - 6 : b - (b - mid) * (1 - k) * 1.6 + 6
    const ly = y + (bottom - y) * (k < 0.5 ? k * 1.7 : (1 - k) * 1.7)
    return <path key={i} d={`M${x} ${ly} q${i % 2 ? 22 : -22} -6 ${i % 2 ? 30 : -30} 10 q${i % 2 ? -18 : 18} 8 ${i % 2 ? -30 : 30} -10Z`} fill="#5CBF6B" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
  })
  return (
    <svg aria-hidden style={{ position: 'absolute', left: 0, top: 0, width: 1, height: 1, overflow: 'visible', zIndex: 3, pointerEvents: 'none' }}>
      <path d={d} fill="none" stroke={INK} strokeWidth="15" strokeLinecap="round" />
      <path d={d} fill="none" stroke="#7FA65A" strokeWidth="8" strokeLinecap="round" />
      {leaves}
    </svg>
  )
}

/** A round jungle fruit hanging in the crown: a tap drops it (into the water, where a fish comes to nibble). */
export function Fruit({ x, y, color, gone, onTap }: { x: number; y: number; color: string; gone: boolean; onTap: () => void }) {
  return (
    <motion.button
      aria-label="fruit"
      onClick={onTap}
      initial={false}
      animate={{ scale: gone ? 0 : 1, rotate: [-6, 6, -6] }}
      transition={{ scale: { type: 'spring', stiffness: 200, damping: 12 }, rotate: { repeat: Infinity, duration: 2.4 } }}
      style={{ ...bare, position: 'absolute', left: x - 44, top: y - 20, width: 88, height: 96, zIndex: 4, transformOrigin: '50% 0' }}
    >
      <svg viewBox="-30 -10 60 66" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <path d="M0 -8 L0 10" stroke={INK} strokeWidth="4" />
        <circle cx="0" cy="28" r="22" fill={color} stroke={INK} strokeWidth="4.5" />
        <circle cx="-8" cy="20" r="6" fill="#fff" opacity=".55" />
        <path d="M0 6 Q12 -4 20 4 Q10 12 0 6Z" fill="#5CBF6B" stroke={INK} strokeWidth="3" />
      </svg>
    </motion.button>
  )
}

/** A blue morpho butterfly drifting about. A tap sends it looping. */
export function Butterfly({ x, y, delay }: { x: number; y: number; delay: number }) {
  const [loop, setLoop] = useState(0)
  return (
    <motion.button
      aria-label="butterfly"
      onClick={() => {
        setLoop((l) => l + 1)
        sounds.sparkle()
      }}
      animate={{ x: [0, 60, 20, -40, 0], y: [0, -30, -60, -20, 0] }}
      transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut', delay }}
      style={{ ...bare, position: 'absolute', left: x - 45, top: y - 45, width: 90, height: 90, zIndex: 9 }}
    >
      <motion.img
        key={loop}
        src={art.butterfly}
        alt=""
        draggable={false}
        animate={loop ? { rotate: [0, 360], scale: [1, 1.3, 1] } : { scaleX: [1, 0.35, 1] }}
        transition={loop ? { duration: 0.9 } : { repeat: Infinity, duration: 0.45 }}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </motion.button>
  )
}

/** A giant Amazon water lily: a rolled-up bud on the lagoon floor that unrolls in the rain (`open` 0..2) into a huge
 *  round pad with an upturned rim, and a flower. Floats on the water (the parent moves `wrap`). */
export function Lily({ w, open, glow, onTap, wrap }: { w: number; open: number; glow?: boolean; onTap: () => void; wrap: Ref<HTMLDivElement> }) {
  const [kick, setKick] = useState(0)
  return (
    <div ref={wrap} style={{ position: 'absolute', left: 0, top: 0, width: w, height: w * 0.5, zIndex: 8, willChange: 'transform' }}>
      <motion.button
        aria-label={open >= 2 ? 'lily pad' : 'lily bud'}
        className={glow ? 'world-glow' : undefined}
        onClick={() => {
          setKick((k) => k + 1)
          onTap()
        }}
        style={{ ...bare, position: 'absolute', left: 0, bottom: 0, width: '100%', height: '100%', borderRadius: 40 }}
      >
        <svg viewBox="-110 -110 220 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {open < 1 && (
            // The bud: a spiky rolled-up leaf and a closed flower.
            <motion.g key={`b${kick}`} animate={{ rotate: kick ? [0, -10, 8, 0] : 0 }} style={{ transformOrigin: '0px 0px' }}>
              <path d="M-8 0 C-26 -40 -22 -80 -6 -100 C10 -80 14 -40 8 0Z" fill="#B54A5E" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
              <path d="M-4 -14 L-12 -18 M2 -40 L10 -44 M-4 -64 L-12 -68" stroke={INK} strokeWidth="3" />
              <path d="M18 0 C14 -20 22 -40 34 -46 C42 -30 38 -12 28 0Z" fill="#FFF0F5" stroke={INK} strokeWidth="4.5" />
            </motion.g>
          )}
          {open >= 1 && (
            <motion.g initial={{ scaleX: 0.15, scaleY: 0.6 }} animate={{ scaleX: open >= 2 ? 1 : 0.6, scaleY: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 10 }}>
              {/* Seen from the side, the giant pad is a wide flat tray with a tall red rim. */}
              <path d="M-104 -22 C-104 -2 -60 6 0 6 C60 6 104 -2 104 -22 L98 -24 C70 -14 -70 -14 -98 -24Z" fill="#C2405C" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
              <path d="M-98 -24 C-70 -38 70 -38 98 -24 C70 -14 -70 -14 -98 -24Z" fill="#5CBF6B" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
              <path d="M-60 -24 L-30 -26 M10 -28 L40 -26 M-20 -22 L0 -20" stroke="#3E8F5A" strokeWidth="3" strokeLinecap="round" />
            </motion.g>
          )}
          {open >= 2 && (
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 9, delay: 0.3 }} style={{ transformOrigin: '86px -26px' }}>
              {[-40, -18, 0, 18, 40].map((r) => (
                <ellipse key={r} cx="86" cy="-44" rx="8" ry="20" fill={r === 0 ? '#FFB3CF' : '#FFF0F5'} stroke={INK} strokeWidth="3.5" transform={`rotate(${r} 86 -26)`} />
              ))}
              <circle cx="86" cy="-30" r="6" fill="#FFC83D" stroke={INK} strokeWidth="3" />
            </motion.g>
          )}
        </svg>
      </motion.button>
    </div>
  )
}

/** The sun that comes out at the end. */
export function Sun({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <motion.div initial={{ y: r * 3, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.6, ease: 'easeOut' }} style={{ position: 'absolute', left: x - r * 1.6, top: y - r * 1.6, width: r * 3.2, height: r * 3.2, zIndex: 1, pointerEvents: 'none' }}>
      <motion.svg viewBox="-80 -80 160 160" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 30, ease: 'linear' }} style={{ width: '100%', height: '100%' }}>
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d="M-8 -52 L0 -74 L8 -52Z" fill="#FFC83D" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" transform={`rotate(${i * 36})`} />
        ))}
        <circle r="46" fill="#FFD95A" stroke={INK} strokeWidth="5" />
        <circle cx="-15" cy="-6" r="5" fill={INK} />
        <circle cx="15" cy="-6" r="5" fill={INK} />
        <path d="M-14 12 Q0 24 14 12" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
        <ellipse cx="-28" cy="8" rx="8" ry="5" fill="#FF8FB8" />
        <ellipse cx="28" cy="8" rx="8" ry="5" fill="#FF8FB8" />
      </motion.svg>
    </motion.div>
  )
}

/** A flat rainbow arching over the lagoon (drawn on as it appears). */
export function Rainbow({ cx, base, r }: { cx: number; base: number; r: number }) {
  const bands = ['#FF6B6B', '#FFB347', '#FFE27A', '#8FE3C8', '#7FB2FF', '#B9A6F5']
  const bw = r * 0.09
  return (
    <svg viewBox={`${-r - 10} ${-r - 10} ${2 * r + 20} ${r + 20}`} style={{ position: 'absolute', left: cx - r - 10, top: base - r - 10, width: 2 * r + 20, height: r + 20, zIndex: 1, pointerEvents: 'none', overflow: 'visible' }}>
      {bands.map((c, i) => {
        const rr = r - i * bw - bw / 2
        return (
          <motion.path
            key={c}
            d={`M${-rr} 0 A${rr} ${rr} 0 0 1 ${rr} 0`}
            fill="none"
            stroke={c}
            strokeWidth={bw + 1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, delay: i * 0.08, ease: 'easeInOut' }}
          />
        )
      })}
      <motion.path d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0 M${-(r - bands.length * bw)} 0 A${r - bands.length * bw} ${r - bands.length * bw} 0 0 1 ${r - bands.length * bw} 0`} fill="none" stroke={INK} strokeWidth="5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, ease: 'easeInOut' }} />
    </svg>
  )
}

/** A hint ring pulsing over what still needs her (the quiet guide). */
export function HintRing({ x, y, r = 70 }: { x: number; y: number; r?: number }) {
  return (
    <div aria-hidden style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, zIndex: 13, pointerEvents: 'none' }}>
      <div className="peru-hint-ring" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '8px solid #FFC83D', boxShadow: '0 0 0 4px rgba(255,255,255,.7)' }} />
    </div>
  )
}

/** A fish that pops up to nibble a fruit that fell in the water, then dives. */
export function NibbleFish({ x, y }: { x: number; y: number }) {
  const [on, setOn] = useState(true)
  useEffect(() => {
    rsfx.nibble()
    const t = setTimeout(() => setOn(false), 1800)
    return () => clearTimeout(t)
  }, [])
  const r = useRef(Math.random() < 0.5)
  if (!on) return null
  return (
    <motion.img
      src={art.fish}
      alt=""
      initial={{ y: 70, opacity: 0, rotate: -20 }}
      animate={{ y: [70, 0, 0, 80], opacity: [0, 1, 1, 0], rotate: [-20, -30, -25, 20] }}
      transition={{ duration: 1.8, times: [0, 0.25, 0.75, 1] }}
      style={{ position: 'absolute', left: x - 50, top: y - 40, width: 100, zIndex: 4, scale: r.current ? '-1 1' : undefined, pointerEvents: 'none' }}
    />
  )
}

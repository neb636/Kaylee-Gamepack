// Snow on a Volcano's scenery, in mountain units (x along the trail, y = 0 at the beach, negative is up).
// One camera for everything: straight-on side view, everything stands on the trail's ground line. The ground is drawn
// in code in the art's flat style (brown outline, flat fills) with the trail painted into it, zone by zone: sand,
// red earth under lemon trees, the chestnut forest, black lava, snow. Nearly everything answers a tap
// (play-design: "everything reacts"): none of it is an answer to anything.
import { AnimatePresence, motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { sfx } from '../../../../kit/sfx'
import { INK } from '../../puppets/ink'
import { ASPECT, etnaArt, STAND_BANDS } from './art'
import type { Fruit } from './Cart'
import { CACTI, CRAB_X, CRATER_X, DRIFTS, ground, GULL_X, ROCKS, SCARF_X, SEA_X, SEA_Y, SIZE, STREAM, TREES, UMBRELLA_X, VENTS, WORLD, ZONES } from './mountain'
import { esfx } from './sfx'

const CHUNK = 800
const DEEP = 1500
const TRAIL = { beach: '#FBEBC4', grove: '#E9C08F', forest: '#D9AE7E', lava: '#958E9E', snow: '#D3DEF2' } as const

/** A surface path from x0 to x1, pushed down by `dy`. */
function surface(x0: number, x1: number, dy = 0, step = 16) {
  let d = ''
  for (let x = x0; x <= x1 + 0.1; x += step) d += `${d ? 'L' : 'M'}${x.toFixed(0)} ${(ground(Math.min(x, x1)) + dy).toFixed(1)} `
  return d
}

/** The ground, cut into chunks (each its own small SVG, so WebKit never has to hold one giant layer). */
export function Ground() {
  const chunks: ReactNode[] = []
  for (let x0 = WORLD.left; x0 < WORLD.right; x0 += CHUNK) {
    const x1 = x0 + CHUNK
    let top = Infinity
    for (let x = x0; x <= x1; x += 20) top = Math.min(top, ground(x))
    top -= 60
    const bottom = ground(x0) + DEEP
    const h = bottom - top
    chunks.push(
      <svg key={x0} viewBox={`${x0} ${top} ${CHUNK + 2} ${h}`} style={{ position: 'absolute', left: x0, top, width: CHUNK + 2, height: h, display: 'block', pointerEvents: 'none' }}>
        {ZONES.map((z, i) => {
          const end = ZONES[i + 1]?.from ?? WORLD.right + 100
          const a = Math.max(z.from, x0 - 60)
          // Each zone's deep ground runs on under the next one's slanted edge (drawn on top of it).
          const b = Math.min(end + 400, x1 + 60)
          if (a >= b) return null
          // The deep ground: its left edge slants into the zone before it.
          const slant = i === 0 ? 0 : 160
          const left = i === 0 ? a : Math.max(a, z.from)
          const deep = `${surface(left, b)} L${b + slant} ${bottom + 400} L${left + slant} ${bottom + 400} Z`
          return (
            <g key={z.id}>
              <path d={deep} fill={z.deep} stroke={i === 0 || z.deep === ZONES[i - 1].deep ? 'none' : INK} strokeWidth="4" />
            </g>
          )
        })}
        {/* Top bands (soil, grass, ash, snow) with round ends that overlap at each zone change, then the painted trail. */}
        {ZONES.map((z, i) => {
          const end = ZONES[i + 1]?.from ?? WORLD.right + 100
          const a = Math.max(z.from - 20, x0 - 60)
          const b = Math.min(end + 20, x1 + 60)
          if (a >= b) return null
          return (
            <g key={z.id} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d={surface(a, b, 34)} stroke={z.shade} strokeWidth="60" />
              <path d={surface(a, b, 22)} stroke={z.top} strokeWidth="44" />
              <path d={surface(a, b, 14)} stroke={TRAIL[z.id]} strokeWidth="14" />
            </g>
          )
        })}
        <path d={surface(x0 - 60, x1 + 60)} fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <Details x0={x0} x1={x1} />
      </svg>,
    )
  }
  return <>{chunks}</>
}

/** Little marks on the ground: grass tufts, pebbles, sparkles in the snow. */
function Details({ x0, x1 }: { x0: number; x1: number }) {
  const out: ReactNode[] = []
  for (let x = Math.ceil(x0 / 140) * 140; x < x1; x += 140) {
    const y = ground(x)
    const r = Math.abs(Math.sin(x * 12.9898)) // a steady "random" per spot
    if (x > 820 && x < 3700) out.push(<path key={x} d={`M${x - 10} ${y + 2} q4 -16 6 -20 q2 10 4 18 q6 -12 10 -16 q-2 12 -2 18`} fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />)
    else if (x >= 3700 && x < 4850) out.push(<circle key={x} cx={x + r * 40} cy={y + 34 + r * 10} r={6 + r * 5} fill="#4A4552" />)
    else if (x >= 4850) out.push(<path key={x} d={`M${x} ${y + 30} l4 -9 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4z`} fill="#fff" stroke="#B9C8E8" strokeWidth="2" />)
    else if (x > -380 && r > 0.5) out.push(<circle key={x} cx={x} cy={y + 30} r="6" fill="#FFC2A8" stroke={INK} strokeWidth="2.5" />)
  }
  // The stream: a little blue band crossing the trail.
  if (STREAM.to > x0 && STREAM.from < x1) {
    out.push(<path key="stream-o" d={surface(STREAM.from + 20, STREAM.to - 20, 22, 8)} fill="none" stroke={INK} strokeWidth="46" strokeLinecap="round" />)
    out.push(<path key="stream" d={surface(STREAM.from + 20, STREAM.to - 20, 22, 8)} fill="none" stroke="#6EC3E6" strokeWidth="36" strokeLinecap="round" />)
    out.push(<path key="stream-w" d={surface(STREAM.from + 10, STREAM.to - 10, 16)} fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="18 22" strokeLinecap="round" />)
  }
  return <>{out}</>
}

/** The sea at the bottom of the beach: water from its surface down to the sloping sea floor, with little waves.
 *  Tap it: a splash. */
export function Sea({ onTap }: { onTap: (x: number) => void }) {
  const left = WORLD.left
  let edge = SEA_X
  while (ground(edge) > SEA_Y && edge < 0) edge += 4
  const pts: string[] = []
  for (let x = edge; x >= left; x -= 16) pts.push(`${x} ${ground(x)}`)
  const d = `M${left} ${SEA_Y} L${edge} ${SEA_Y} L${pts.join(' L')} Z`
  const w = edge - left
  return (
    <div
      onPointerDown={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        onTap(left + ((e.clientX - r.left) / r.width) * w)
      }}
      style={{ position: 'absolute', left, top: SEA_Y - 10, width: w, height: 200, zIndex: 2 }}
    >
      <svg viewBox={`${left} ${SEA_Y - 10} ${w} 200`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <path d={d} fill="#6EC3E6" />
        <path d={`M${left} ${SEA_Y} L${edge} ${SEA_Y}`} stroke={INK} strokeWidth="5" strokeLinecap="round" />
      </svg>
      <motion.div
        animate={{ x: [0, -60, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        style={{ position: 'absolute', left: 0, right: 60, top: 18, height: 70, opacity: 0.7, backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M20 22 q20 -14 40 0 M120 44 q20 -14 40 0" fill="none" stroke="white" stroke-width="5" stroke-linecap="round"/></svg>')}")`, backgroundSize: '200px 60px' }}
      />
    </div>
  )
}

/** A sprite standing on the ground at x (its bottom center), with a tap reaction. */
function Prop({ x, img, h, aspect, label, sink = 8, onTap, children, z = 1 }: { x: number; img: string; h: number; aspect: number; label: string; sink?: number; onTap?: () => void; children?: ReactNode; z?: number }) {
  const [taps, setTaps] = useState(0)
  const w = h * aspect
  return (
    <motion.button
      aria-label={label}
      data-poke
      animate={taps ? { rotate: [0, -3, 2.5, -1, 0], scaleY: [1, 0.94, 1.04, 1] } : {}}
      transition={{ duration: 0.5 }}
      onClick={() => {
        setTaps((n) => n + 1)
        onTap?.()
      }}
      style={{ position: 'absolute', left: x - w / 2, top: ground(x) - h + sink, width: w, height: h, padding: 0, border: 'none', background: 'none', transformOrigin: '50% 100%', zIndex: z }}
    >
      <img src={img} alt="" draggable={false} style={{ display: 'block', width: '100%', height: '100%' }} />
      {children}
    </motion.button>
  )
}

/** A tree picture filling its box; a tap shakes it. */
function TreeImg({ img, label, onTap }: { img: string; label: string; onTap: () => void }) {
  const [taps, setTaps] = useState(0)
  return (
    <motion.button
      aria-label={label}
      data-poke
      animate={taps ? { rotate: [0, -2.5, 2, -1, 0] } : {}}
      transition={{ duration: 0.6 }}
      onClick={() => (setTaps((n) => n + 1), onTap())}
      style={{ position: 'absolute', inset: 0, padding: 0, border: 'none', background: 'none', transformOrigin: '50% 100%' }}
    >
      <img src={img} alt="" draggable={false} style={{ display: 'block', width: '100%', height: '100%' }} />
    </motion.button>
  )
}

/** Where fruit hangs on a lemon tree (shares of its width and height). */
const FRUIT_SPOTS = [
  [0.3, 0.3],
  [0.62, 0.22],
  [0.75, 0.48],
  [0.42, 0.52],
] as const

export interface TreeTaps {
  /** A fruit was picked: where it was (mountain units), which kind, and which tree/spot. */
  onFruit: (at: [number, number], kind: Fruit) => void
  onChestnut: (x: number) => void
  onPine: (x: number) => void
}

/** The trees along the trail. Lemon trees hold fruit to pick; chestnut trees drop a spiky chestnut; snowy pines drop
 *  their snow. */
export function Trees({ onFruit, onChestnut, onPine }: TreeTaps) {
  const [picked, setPicked] = useState<string[]>([])
  return (
    <>
      {TREES.map((t, i) => {
        const h = t.kind === 'lemon' ? SIZE.lemonTree : t.kind === 'chestnut' ? SIZE.chestnut : SIZE.pine
        const aspect = t.kind === 'lemon' ? ASPECT.lemonTree : t.kind === 'chestnut' ? ASPECT.chestnut : ASPECT.pine
        const img = t.kind === 'lemon' ? etnaArt.lemonTree : t.kind === 'chestnut' ? etnaArt.chestnut : etnaArt.pine
        const w = h * aspect
        const top = ground(t.x) - h + 10
        return (
          <div key={i} style={{ position: 'absolute', left: t.x - w / 2, top, width: w, height: h, zIndex: 1 }}>
            <TreeImg img={img} label={`${t.kind} tree`} onTap={() => (t.kind === 'chestnut' ? onChestnut(t.x) : t.kind === 'pine' ? onPine(t.x) : sfx.pop())} />
            {'fruit' in t &&
              FRUIT_SPOTS.map(([fx, fy], j) => {
                const id = `${i}-${j}`
                const fs = 104
                return (
                  <AnimatePresence key={id}>
                    {!picked.includes(id) && (
                      <motion.button
                        aria-label={t.fruit}
                        data-poke
                        className="world-glow"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [-6, 6, -6] }}
                        exit={{ scale: 0 }}
                        transition={{ rotate: { repeat: Infinity, duration: 2 + j * 0.3 } }}
                        onClick={() => {
                          setPicked((p) => [...p, id])
                          onFruit([t.x - w / 2 + w * fx, top + h * fy], t.fruit)
                        }}
                        style={{ position: 'absolute', left: w * fx - fs / 2, top: h * fy - fs / 2, width: fs, height: fs, padding: 21, border: 'none', background: 'none', borderRadius: '50%', transformOrigin: '50% 0' }}
                      >
                        <img src={t.fruit === 'lemon' ? etnaArt.lemon : etnaArt.orange} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                )
              })}
          </div>
        )
      })}
    </>
  )
}

export interface PropTaps {
  onCactus: () => void
  onVent: (x: number) => void
  onCrater: () => void
  onDrift: (i: number) => void
  onUmbrella: () => void
}

/** Everything else along the trail: cacti, lava rocks, steam vents, the crater, and on the beach the umbrella, the
 *  crab and the gull. */
export function Props({ onCactus, onVent, onCrater, onUmbrella }: PropTaps) {
  const [crab, setCrab] = useState(0)
  const [gull, setGull] = useState(0)
  return (
    <>
      <Prop x={UMBRELLA_X} img={etnaArt.umbrella} h={SIZE.umbrella} aspect={ASPECT.umbrella} label="umbrella" sink={20} onTap={onUmbrella} />
      {CACTI.map((x) => (
        <Prop key={x} x={x} img={etnaArt.cactus} h={SIZE.cactus} aspect={ASPECT.cactus} label="prickly pear" onTap={onCactus} />
      ))}
      {ROCKS.map((x, i) => (
        <Prop key={x} x={x} img={etnaArt.lavaRock} h={SIZE.rock * (1 + (i % 2) * 0.3)} aspect={ASPECT.lavaRock} label="lava rocks" onTap={esfx.thud} />
      ))}
      {/* Steam vents in the lava: they puff on their own, and when tapped. */}
      {VENTS.map((x) => (
        <Vent key={x} x={x} onTap={() => onVent(x)} />
      ))}
      {/* The crater at the very top, with its smoke. */}
      <Crater onTap={onCrater} />
      {/* On the beach: the crab scuttles, the gull flies off and comes back. */}
      <motion.button
        aria-label="crab"
        data-poke
        onClick={() => (setCrab((n) => n + 1), esfx.click())}
        style={{ position: 'absolute', left: CRAB_X - (SIZE.crab * ASPECT.crab) / 2, top: ground(CRAB_X) - SIZE.crab + 10, width: SIZE.crab * ASPECT.crab, height: SIZE.crab, padding: 0, border: 'none', background: 'none', zIndex: 3 }}
      >
        <motion.img key={crab} src={etnaArt.crab} alt="" draggable={false} initial={false} animate={crab ? { x: [0, 50, -40, 30, 0], rotate: [0, 8, -8, 6, 0] } : { rotate: [-3, 3, -3] }} transition={crab ? { duration: 1 } : { repeat: Infinity, duration: 1.6 }} style={{ width: '100%', height: '100%' }} />
      </motion.button>
      <motion.button
        aria-label="seagull"
        data-poke
        onClick={() => (setGull((n) => n + 1), esfx.squawk())}
        style={{ position: 'absolute', left: GULL_X - (SIZE.gull * ASPECT.gull) / 2, top: ground(GULL_X) - SIZE.gull + 8, width: SIZE.gull * ASPECT.gull, height: SIZE.gull, padding: 0, border: 'none', background: 'none', zIndex: 1 }}
      >
        <motion.img key={gull} src={etnaArt.gull} alt="" draggable={false} initial={false} animate={gull ? { x: [0, 120, 260, 120, 0], y: [0, -220, -160, -220, 0], rotate: [0, -10, 0, 10, 0] } : {}} transition={{ duration: 3 }} style={{ width: '100%', height: '100%' }} />
      </motion.button>
    </>
  )
}

/** A steam vent in the lava: a crack that puffs a little cloud now and then (and when tapped). */
function Vent({ x, onTap }: { x: number; onTap: () => void }) {
  const [puffs, setPuffs] = useState(0)
  const y = ground(x)
  return (
    <button
      aria-label="steam vent"
      data-poke
      onClick={() => (setPuffs((n) => n + 1), onTap())}
      style={{ position: 'absolute', left: x - 60, top: y - 160, width: 120, height: 170, padding: 0, border: 'none', background: 'none', zIndex: 1 }}
    >
      <svg viewBox="-60 -160 120 170" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d="M-26 6 L-8 -4 L2 6 L14 -6 L28 6" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`${puffs}-${i}`}
          initial={{ y: 0, scale: 0.3, opacity: 0 }}
          animate={{ y: -150, scale: 1.3, opacity: [0, 0.9, 0] }}
          transition={{ duration: 2.2, delay: i * 0.5, repeat: puffs ? 0 : Infinity, repeatDelay: 2.5 }}
          style={{ position: 'absolute', left: 30, top: 120, width: 60, height: 44, borderRadius: '50%', background: '#F4F2FA', border: `4px solid ${INK}`, pointerEvents: 'none' }}
        />
      ))}
    </button>
  )
}

/** The crater rim at the top and its smoke: big puffs when tapped (a friendly rumble). */
function Crater({ onTap }: { onTap: () => void }) {
  const [puffs, setPuffs] = useState(0)
  const x = CRATER_X + 160
  const y = ground(x)
  return (
    <button
      aria-label="crater"
      data-poke
      onClick={() => (setPuffs((n) => n + 1), onTap())}
      style={{ position: 'absolute', left: x - 200, top: y - 420, width: 400, height: 440, padding: 0, border: 'none', background: 'none', zIndex: 1 }}
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`${puffs}-${i}`}
          initial={{ y: 0, scale: 0.4, opacity: 0 }}
          animate={{ y: -320 - i * 30, x: (i % 2 ? 1 : -1) * 30, scale: puffs ? 2.2 : 1.6, opacity: [0, 0.95, 0] }}
          transition={{ duration: puffs ? 2.6 : 4.5, delay: i * (puffs ? 0.18 : 1.1), repeat: puffs ? 0 : Infinity }}
          style={{ position: 'absolute', left: 140, top: 340, width: 120, height: 84, borderRadius: '50%', background: '#E9E4F2', border: `5px solid ${INK}`, pointerEvents: 'none' }}
        />
      ))}
    </button>
  )
}

/** The scarf draped over a wooden trail post where the cold starts: tap it and it flies onto Nino. */
export function Scarf({ taken, glow, onTap }: { taken: boolean; glow: boolean; onTap: () => void }) {
  const x = SCARF_X
  const y = ground(SCARF_X) - SIZE.post - 19
  return (
    <>
      <svg viewBox="-40 -10 80 200" style={{ position: 'absolute', left: x - 40, top: ground(SCARF_X) - SIZE.post - 10, width: 80, height: SIZE.post + 20, overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}>
        <path d="M-14 4 Q-14 -4 -6 -4 L6 -4 Q14 -4 14 4 L14 190 L-14 190Z" fill="#B9814F" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d="M-6 20 L-6 170" stroke="#9A6A3E" strokeWidth="4" strokeLinecap="round" />
      </svg>
      {!taken && (
        <motion.button
          aria-label="scarf"
          data-poke
          className={glow ? 'world-glow' : undefined}
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          onClick={onTap}
          style={{ position: 'absolute', left: x - 60, top: y, width: 120, height: 140, padding: 10, border: 'none', background: 'none', borderRadius: 20, transformOrigin: '50% 0', zIndex: glow ? 8 : 2 }}
        >
          <svg viewBox="0 0 100 130" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <path d="M30 12 C40 4 60 4 70 12 L76 110 L56 112 L50 30 L44 112 L24 110Z" fill="#FF8FB8" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
            <path d="M27 70 L46 72 M27 90 L46 92 M54 72 L74 70 M54 92 L75 90" stroke="#FFF7F0" strokeWidth="7" />
            <path d="M26 112 l-2 12 M36 112 l-1 12 M58 113 l0 12 M68 112 l2 12" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          </svg>
        </motion.button>
      )}
    </>
  )
}

/** A snow drift on the trail (in front of Nino, so he plows into it). Scooped drifts shrink to a little leftover. */
export function Drift({ i, scooped, bumps, need, refFn, onTap }: { i: number; scooped: boolean; bumps: number; need: number; refFn: (el: HTMLButtonElement | null) => void; onTap: () => void }) {
  const x = DRIFTS[i]
  const h = SIZE.drift * (1 + (need - 1) * 0.25)
  const w = h * ASPECT.drift
  return (
    <motion.button
      ref={refFn}
      aria-label="snow"
      data-poke
      animate={{ scale: scooped ? 0.38 : 1 - (bumps / need) * 0.22, rotate: bumps && !scooped ? [0, -4, 3, 0] : 0, opacity: scooped ? 0.85 : 1 }}
      transition={{ type: 'spring', duration: 0.5 }}
      onClick={onTap}
      style={{ position: 'absolute', left: x - w / 2, top: ground(x) - h + 16, width: w, height: h, padding: 0, border: 'none', background: 'none', transformOrigin: '50% 100%', zIndex: 6 }}
    >
      <img src={etnaArt.drift} alt="" draggable={false} style={{ display: 'block', width: '100%', height: '100%' }} />
    </motion.button>
  )
}

/** The far view of Etna (a slow parallax layer behind everything). */
export function FarVolcano({ refFn }: { refFn: (el: HTMLDivElement | null) => void }) {
  return (
    <div ref={refFn} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', willChange: 'transform' }}>
      <img src={etnaArt.farVolcano} alt="" draggable={false} style={{ position: 'absolute', left: -650, top: 40 - 1300 / ASPECT.farVolcano, width: 1300, height: 1300 / ASPECT.farVolcano }} />
    </div>
  )
}

/** Drifting clouds (screen-wide, slow parallax). */
export function Clouds({ refFn }: { refFn: (el: HTMLDivElement | null) => void }) {
  const list = [
    { x: 100, y: -760, w: 300, k: 1 },
    { x: 900, y: -900, w: 220, k: 2 },
    { x: 1700, y: -700, w: 340, k: 1 },
    { x: 2500, y: -980, w: 260, k: 2 },
  ] as const
  return (
    <div ref={refFn} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', willChange: 'transform' }}>
      {[0, 1].map((tile) =>
        list.map((c, i) => <img key={`${tile}-${i}`} src={c.k === 1 ? etnaArt.cloud1 : etnaArt.cloud2} alt="" draggable={false} style={{ position: 'absolute', left: c.x + tile * 3200, top: c.y, width: c.w, opacity: 0.95 }} />),
      )}
    </div>
  )
}

/** The granita stand on the beach (the friends wait inside it). `part` draws only its counter or its awning, in front
 *  of the friends. */
export function Stand({ x, h, part }: { x: number; h: number; part?: 'counter' | 'awning' }) {
  const w = h * ASPECT.stand
  const clip = part === 'counter' ? `inset(${STAND_BANDS.counter * 100}% 0 0 0)` : part === 'awning' ? `inset(0 0 ${(1 - STAND_BANDS.awning) * 100}% 0)` : undefined
  return <img src={etnaArt.stand} alt="" draggable={false} style={{ position: 'absolute', left: x - w / 2, top: ground(x) - h + 8, width: w, height: h, clipPath: clip, pointerEvents: 'none', zIndex: part ? 3 : 1 }} />
}

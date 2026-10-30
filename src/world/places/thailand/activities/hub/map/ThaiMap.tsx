// The Thailand map (plan: planning/around-the-world/thailand/thailand-map.html, greybox): where Kaylee lands in
// Thailand. A map of the whole country (drawn in code for now: geo.ts) with a pin for each place: tap one and it opens,
// like Australia's map. Bangkok is Agong's house (the mall day starts in there). Krabi is the boat trip and the
// elephants, Nan the road trip: the first of them each session packs and rides the window seat (trip/session.ts); after
// that she goes straight there (Krabi airport, or the Nan map). A trip ends back here (`stamp=<trip>`): the stamp lands
// on its pin. Each pin wears its trip's stamp.
//
// Things to poke (tap them): the elephant, the rain cloud over Nan, the gibbon, the buffalo, the hornbill, the tuk-tuk,
// the dolphins, the longtail boat, the coconut palm. Sparkle says something true the first time she meets each
// (lines.ts L.map), welcomes her once a session and glows the pins after ~8 s with nothing touched.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { sounds, useElementSize } from '../../../../../../sdk'
import { worldLink } from '../../../../../../router'
import { noise, sfx, tone } from '../../../../../kit/sfx'
import { useSections } from '../../../../../kit/sections'
import type { PlaceProps } from '../../../../../types'
import { L } from '../../../lines'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import { tripSession } from '../../../trip/session'
import HUB_SECTIONS from '../sections'
import { ANDAMAN, CHAO_PHRAYA, GULF, HILLS, ISLANDS, MEKONG, PINS, POKES, STAGE, THAILAND, type Pin, type PinId, type PokeId, type XY } from './geo'

const SEA = '#A8DCFF'
const LAND = '#E6DDF7'
const THAI = '#C9EFB4'
const INK = '#4A3B57'
const SW = 5

// Once a session: Sparkle's welcome, and each thing's fact.
let welcomed = false
const told = new Set<PokeId>()

/** A smooth closed (or open) curve through the points, as an SVG path. */
function smooth(pts: XY[], closed = true): string {
  const n = pts.length
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))])
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return closed ? d + 'Z' : d
}

const POKE_SOUND: Record<PokeId, () => void> = {
  elephant: () => (tone(220, 520, 0.35, 0.08, 'sawtooth'), tone(260, 600, 0.3, 0.05, 'square', 0.05)),
  clouds: () => [0, 0.1, 0.2, 0.32, 0.45, 0.6].forEach((d) => noise(0.05, 0.03, 'highpass', 3500 + Math.random() * 2000, 3000, d, 1)),
  gibbon: () => [0, 0.22, 0.44].forEach((d, i) => tone(500 + i * 120, 900 + i * 150, 0.18, 0.06, 'sine', d)),
  buffalo: () => tone(140, 110, 0.6, 0.08, 'sawtooth'),
  hornbill: () => [0, 0.15].forEach((d) => tone(900, 600, 0.1, 0.06, 'square', d)),
  tuktuk: () => [0, 0.09, 0.18, 0.27].forEach((d) => tone(180, 160, 0.06, 0.06, 'square', d)),
  dolphins: () => (tone(1400, 2200, 0.12, 0.05, 'sine'), sfx.splash()),
  boat: () => (tone(300, 300, 0.25, 0.05, 'square'), noise(0.4, 0.04, 'bandpass', 600, 300)),
  palm: () => sfx.boing(),
}

export function ThaiMap({ meta, stamps, openActivity }: PlaceProps) {
  const { param, enter } = useSections(HUB_SECTIONS)
  // Read once: the stamp that lands (the end of a trip).
  const [arriving] = useState(() => param('stamp') || null)
  const boxRef = useRef<HTMLDivElement>(null)
  const size = useElementSize(boxRef)
  // The stage fits the box (the country stays whole on any screen); more sea round it on wide screens.
  const view = useMemo(() => {
    const s = size.width && size.height ? Math.min(size.width / STAGE.w, size.height / STAGE.h) * 1.04 : 0.4
    return { s, ox: (size.width - STAGE.w * s) / 2, oy: (size.height - STAGE.h * s) / 2 }
  }, [size.width, size.height])
  const toScreen = ([x, y]: XY): XY => [view.ox + x * view.s, view.oy + y * view.s]

  const guide = useRef<TripGuideHandle>(null)
  const [pokes, setPokes] = useState<Record<string, number>>({})
  const [hint, setHint] = useState(false)
  const [picked, setPicked] = useState<PinId | null>(null)
  const lastTouch = useRef(performance.now() + 3000)
  // The stamp that lands: hidden on its pin until it drops in.
  const [landed, setLanded] = useState(!arriving)

  const live = (pin: Pin) => pin.id === 'bangkok' || meta.activities.some((a) => a.id === pin.activity)
  const stamped = (pin: Pin) => stamps.includes(pin.activity) && (landed || pin.activity !== arriving)
  const allStamps = meta.activities.length > 0 && meta.activities.every((a) => stamps.includes(a.id))

  useEffect(() => {
    enter('map', {})
    if (!welcomed && !arriving) {
      welcomed = true
      setTimeout(() => guide.current?.speak(L.map.hello), 600)
    }
    const land = arriving
      ? setTimeout(() => {
          setLanded(true)
          sfx.thump()
          setTimeout(() => sounds.sparkle(), 250)
        }, 900)
      : undefined
    // After ~8 s with nothing touched the pins glow. No voice: it's a toy map, and she just heard the welcome.
    const idle = setInterval(() => {
      if (performance.now() - lastTouch.current < 8000) return
      setHint(true)
    }, 1000)
    return () => {
      clearTimeout(land)
      clearInterval(idle)
    }
  }, [])

  const touched = () => {
    lastTouch.current = performance.now()
    setHint(false)
  }

  /** That place opens: Bangkok the house; Krabi or Nan the trip (packing first, the first time this session). */
  const tapPin = (id: PinId) => {
    touched()
    if (picked) return
    setPicked(id)
    sounds.pop()
    setTimeout(() => sounds.sparkle(), 120)
    setTimeout(() => {
      if (id === 'bangkok') return void (location.hash = worldLink(meta.id, 'hub', tripSession.house))
      const trip = PINS.find((p) => p.id === id)!.activity
      if (!tripSession.kitDone) {
        tripSession.kitDone = true
        location.hash = worldLink(meta.id, trip, 'pack')
      } else location.hash = id === 'krabi' ? worldLink(meta.id, trip, 'land', { quick: '1' }) : worldLink(meta.id, trip, 'map')
    }, 450)
  }

  const poke = (id: PokeId) => {
    touched()
    POKE_SOUND[id]()
    setPokes((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }))
    if (!told.has(id)) {
      told.add(id)
      guide.current?.speak(L.map.pokes[id])
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: SEA, overflow: 'clip' }}>
      <div ref={boxRef} style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', bottom: 'calc(var(--safe-bottom) + 8px)' }}>
        <svg width={size.width} height={size.height} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden>
          <g transform={`translate(${view.ox} ${view.oy}) scale(${view.s})`}>
            <rect x={-6000} y={-6000} width={14000} height={14000} fill={LAND} />
            <path d={smooth(ANDAMAN)} fill={SEA} />
            <path d={smooth(GULF)} fill={SEA} />
            <path d={smooth(MEKONG, false)} fill="none" stroke="#8FCBF0" strokeWidth={10} strokeLinecap="round" />
            <path d={smooth(THAILAND)} fill={THAI} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
            <path d={smooth(CHAO_PHRAYA, false)} fill="none" stroke="#8FCBF0" strokeWidth={9} strokeLinecap="round" />
            {HILLS.map(([[x, y], r], i) => (
              <path key={i} d={`M${x - r},${y + r * 0.35} Q${x - r * 0.5},${y - r * 0.9} ${x},${y - r * 0.85} Q${x + r * 0.5},${y - r * 0.9} ${x + r},${y + r * 0.35}Z`} fill="#A6DD93" stroke={INK} strokeWidth={SW * 0.8} strokeLinejoin="round" />
            ))}
            {ISLANDS.map(([[x, y], rx, ry], i) => (
              <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={THAI} stroke={INK} strokeWidth={SW * 0.7} />
            ))}
            {POKES.map((k) => (
              <motion.g key={`${k.id}-${pokes[k.id] ?? 0}`} initial={{ y: 0 }} animate={pokes[k.id] ? { y: [0, -28, 0, -10, 0], rotate: [0, -8, 8, 0] } : { y: 0 }} transition={{ duration: 0.8 }} style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
                <g transform={`translate(${k.at[0]} ${k.at[1]})`}>{POKE_ART[k.id](pokes[k.id] ?? 0)}</g>
              </motion.g>
            ))}
          </g>
        </svg>

        {/* The things to poke (round tap targets over their drawings; the pins sit above them). */}
        {POKES.map((k) => {
          const [x, y] = toScreen(k.at)
          const d = Math.max(64, 90 * view.s)
          return <button key={k.id} aria-label={k.label} onClick={() => poke(k.id)} style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', border: 'none', background: 'transparent', padding: 0, zIndex: 2 }} />
        })}

        {/* The pins: tap one and that place opens. The ones without a stamp yet bob (and glow when Sparkle hints). */}
        {PINS.filter(live).map((pin, i) => {
          const [x, y] = toScreen(pin.at)
          const done = stamped(pin)
          const act = meta.activities.find((a) => a.id === pin.activity)
          const fresh = pin.activity === arriving && landed
          return (
            <motion.button
              key={pin.id}
              aria-label={pin.label}
              onClick={() => tapPin(pin.id)}
              initial={{ scale: 0 }}
              animate={{ scale: picked === pin.id ? 1.25 : 1, y: done || picked ? 0 : [0, -8, 0] }}
              transition={{ scale: { delay: i * 0.06, type: 'spring', stiffness: 400, damping: 18 }, y: { repeat: Infinity, duration: 1.4, delay: i * 0.2 } }}
              whileTap={{ scale: 0.88 }}
              className={hint || picked === pin.id ? 'world-glow' : undefined}
              style={{ position: 'absolute', left: x, top: y, translate: '-50% -50%', width: 'clamp(64px, 11vmin, 104px)', height: 'clamp(64px, 11vmin, 104px)', borderRadius: '50%', border: `5px solid ${done ? 'var(--hotpink)' : '#fff'}`, background: pin.color, boxShadow: 'var(--shadow)', fontSize: 'clamp(30px, 5.5vmin, 52px)', padding: 0, display: 'grid', placeItems: 'center', zIndex: 3 }}
            >
              <span aria-hidden>{pin.icon}</span>
              <AnimatePresence>
                {done && act && (
                  <motion.img
                    key="stamp"
                    src={act.sticker.img}
                    alt=""
                    initial={fresh ? { scale: 3.2, rotate: -40, opacity: 0 } : false}
                    animate={{ scale: 1, rotate: -12, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                    style={{ position: 'absolute', right: '-22%', top: '-22%', width: '58%', height: '58%', objectFit: 'contain', background: '#fff', borderRadius: '50%', border: '3px solid var(--hotpink)', padding: 2 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      {allStamps && (
        <motion.button
          aria-label="Party"
          whileTap={{ scale: 0.88 }}
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          onClick={() => {
            sounds.pop()
            openActivity('party')
          }}
          style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 14px)', bottom: 'calc(var(--safe-bottom) + 14px)', width: 88, height: 88, borderRadius: '50%', border: '4px solid #fff', background: 'var(--butter)', fontSize: 44, boxShadow: 'var(--shadow)', zIndex: 20 }}
        >
          🎉
        </motion.button>
      )}
      <TripGuide ref={guide} />
    </div>
  )
}

const O = { stroke: INK, strokeWidth: SW, strokeLinejoin: 'round' as const }
/** The greybox's things to poke: simple flat shapes in the map's outlined look (the look step paints them). */
const POKE_ART: Record<PokeId, (n: number) => ReactNode> = {
  elephant: () => (
    <g>
      <ellipse cx={0} cy={0} rx={30} ry={20} fill="#B9B3D6" {...O} />
      <circle cx={26} cy={-10} r={15} fill="#B9B3D6" {...O} />
      <path d="M38,-6 Q48,8 40,20" fill="none" {...O} strokeLinecap="round" />
      <ellipse cx={20} cy={-10} rx={8} ry={11} fill="#FFC2DA" {...O} strokeWidth={SW * 0.7} />
    </g>
  ),
  clouds: (n) => (
    <g>
      {n > 0 && [-18, 0, 18].map((x) => <path key={x} d={`M${x},12 l-4,22`} stroke="#6FB7EA" strokeWidth={5} strokeLinecap="round" />)}
      <path d="M-36,8 Q-40,-12 -18,-12 Q-12,-30 8,-22 Q28,-30 34,-8 Q46,8 30,10Z" fill="#fff" {...O} />
    </g>
  ),
  gibbon: () => (
    <g>
      <path d="M-30,-20 Q0,-36 30,-20" fill="none" stroke="#8C6A4F" strokeWidth={8} strokeLinecap="round" />
      <circle cx={0} cy={-4} r={14} fill="#C9A27E" {...O} />
      <circle cx={0} cy={-2} r={7} fill="#F3E2CF" />
    </g>
  ),
  buffalo: () => (
    <g>
      <ellipse cx={0} cy={0} rx={28} ry={16} fill="#7D7891" {...O} />
      <circle cx={24} cy={-8} r={11} fill="#7D7891" {...O} />
      <path d="M18,-18 Q22,-30 32,-26 M30,-18 Q38,-28 44,-20" fill="none" {...O} strokeLinecap="round" />
    </g>
  ),
  hornbill: () => (
    <g>
      <ellipse cx={0} cy={0} rx={18} ry={12} fill="#3F3550" {...O} />
      <path d="M14,-6 L40,0 L14,6Z" fill="#FFC94D" {...O} />
      <path d="M-14,-2 L-34,-16 L-30,4Z" fill="#fff" {...O} />
    </g>
  ),
  tuktuk: () => (
    <g>
      <rect x={-24} y={-20} width={44} height={28} rx={8} fill="#7CC4F2" {...O} />
      <rect x={-28} y={-26} width={52} height={10} rx={5} fill="#FF8FB8" {...O} />
      {[-16, 12].map((x) => <circle key={x} cx={x} cy={12} r={7} fill={INK} />)}
    </g>
  ),
  dolphins: (n) => (
    <g>
      {[-18, 18].map((x, i) => (
        <path key={x} d={`M${x - 16},${8 - (n && i ? 10 : 0)} Q${x},${-22 - (n ? 12 : 0)} ${x + 16},${8}`} fill="none" stroke="#8C8FB8" strokeWidth={10} strokeLinecap="round" />
      ))}
    </g>
  ),
  boat: () => (
    <g>
      <path d="M-50,6 Q-60,10 -76,8" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      <path d="M-40,-8 L36,-8 Q46,-8 40,8 L-34,8Z" fill="#C98F5E" {...O} />
      <path d="M30,-8 Q34,-26 22,-30" fill="none" stroke="#FF8FB8" strokeWidth={6} strokeLinecap="round" />
    </g>
  ),
  palm: () => (
    <g>
      <path d="M0,20 Q-4,0 4,-22" fill="none" stroke="#B07B4F" strokeWidth={8} strokeLinecap="round" />
      {[-60, -20, 20, 60, 100, 140].map((a) => (
        <ellipse key={a} cx={4 + Math.cos((a * Math.PI) / 180) * 14} cy={-22 + Math.sin((a * Math.PI) / 180) * 8} rx={16} ry={6} transform={`rotate(${a} ${4 + Math.cos((a * Math.PI) / 180) * 14} ${-22 + Math.sin((a * Math.PI) / 180) * 8})`} fill="#7FD18A" {...O} strokeWidth={SW * 0.6} />
      ))}
    </g>
  ),
}

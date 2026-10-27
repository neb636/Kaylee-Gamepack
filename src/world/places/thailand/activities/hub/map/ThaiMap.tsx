// The Thailand map (plan: planning/around-the-world/thailand/thailand-map.html, greybox): where Kaylee lands in
// Thailand. A map of the whole country (drawn in code for now: geo.ts), with the family's little pink toy plane parked at
// Bangkok. Her finger grabs the plane and it flies after it, leaning into turns, its propeller buzzing, a puff trail
// behind; let go and it glides on in a lazy circle. Tap the map and it flies there by itself.
//
// The pins: land the plane on one (let go over it, or tap it) and that place opens. Bangkok is Agong's house (the mall
// day starts in there). Krabi is the boat trip and the elephants, Nan the road trip: the first of them each session packs
// and rides the window seat (trip/session.ts); after that the plane's flight here is the trip there, and she lands at
// Krabi airport or on the Nan map. A trip ends back here (`fly=bangkok&stamp=<trip>`): the plane flies home and the
// stamp lands on the pin. Each pin wears its trip's stamp.
//
// Things to poke (tap them, or fly the plane low over them): the elephant, the rain cloud over Nan, the gibbon, the
// buffalo, the hornbill, the tuk-tuk, the dolphins, the longtail boat, the coconut palm. Sparkle says something true the
// first time she meets each (lines.ts L.map), welcomes her once a session and hints after ~8 s with nothing touched.
//
// How the plane feels is on knobs (?feel=1). No three.js: it's 2D (SVG and DOM, written to every frame).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { sounds, useElementSize, useGameLoop } from '../../../../../../sdk'
import { worldLink } from '../../../../../../router'
import { knobs, watch } from '../../../../../kit/knobs'
import { noise, sfx, tone } from '../../../../../kit/sfx'
import { useSections } from '../../../../../kit/sections'
import { flag } from '../../../../../engine3d/flags'
import type { PlaceProps } from '../../../../../types'
import { L } from '../../../lines'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import { tripSession } from '../../../trip/session'
import HUB_SECTIONS from '../sections'
import { ANDAMAN, CHAO_PHRAYA, GULF, HILLS, ISLANDS, MEKONG, pinOf, PINS, POKES, STAGE, THAILAND, type PinId, type PokeId, type XY } from './geo'

const FILE = 'src/world/places/thailand/activities/hub/map/ThaiMap.tsx'
/** How the toy plane feels under her finger (live in the feel lab: ?feel=1). Speeds are in stage units (100 = a degree
 *  of the map, about 110 km; the country is about 1500 tall). */
const FLY = knobs('plane', 'Fly the toy plane', FILE, {
  follow: { value: 6, min: 1, max: 20, step: 0.5, label: 'Follow', unit: '/s', note: 'how eagerly the plane catches up with her finger' },
  top: { value: 900, min: 200, max: 2500, step: 50, label: 'Top speed', unit: 'u/s', note: 'the fastest it can fly' },
  pick: { value: 8, min: 1, max: 30, step: 0.5, label: 'Pick-up', unit: '/s', note: 'how quickly it speeds up and slows down' },
  bank: { value: 35, min: 0, max: 70, step: 1, label: 'Bank', unit: '°', note: 'how far it leans into a turn' },
  glide: { value: 0.6, min: 0.1, max: 4, step: 0.05, label: 'Glide', unit: '/s', note: 'how quickly it slows into its lazy circle after she lets go' },
  circle: { value: 80, min: 30, max: 250, step: 5, label: 'Circle radius', unit: 'u', note: 'the lazy circle it flies when nobody holds it' },
  cruise: { value: 420, min: 100, max: 1500, step: 20, label: 'Fly-there speed', unit: 'u/s', note: 'how fast it flies by itself to where she tapped' },
  grab: { value: 90, min: 30, max: 200, step: 5, label: 'Grab reach', unit: 'px', note: 'how far from the plane her finger can land and still grab it' },
  land: { value: 70, min: 20, max: 200, step: 5, label: 'Land radius', unit: 'u', note: 'how close to a pin counts as over it' },
  short: { value: 3, min: 1, max: 8, step: 0.25, label: 'Short flight', unit: 's', note: "a trip's flight across the map (and home again)" },
})

const SEA = '#A8DCFF'
const LAND = '#E6DDF7'
const THAI = '#C9EFB4'
const INK = '#4A3B57'
const SW = 5

type Mode = 'parked' | 'held' | 'free' | 'auto' | 'landing'
interface Plane {
  x: number
  y: number
  vx: number
  vy: number
  heading: number
  bank: number
  /** 0.75 parked on a pin, 1 up in the air. */
  alt: number
  spin: number
  mode: Mode
  turn: number
  target: XY | null
  pin: PinId | null
  /** Seconds into the landing. */
  t: number
  /** A flight that ends parked (home from a trip), not opening the place. */
  park: boolean
}

// Once a session: Sparkle's welcome, and each thing's fact.
let welcomed = false
const told = new Set<PokeId>()

const hasParam = (k: string) => flag(k) !== null

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
  // Read once: where the plane is parked, where it's flying to by itself, and the stamp that lands.
  const [start] = useState(() => {
    const plane = (hasParam('plane') ? param('plane') : tripSession.plane) as PinId
    const fly = (param('fly') || null) as PinId | null
    const stamp = param('stamp') || null
    return { plane: pinOf(plane) ? plane : 'bangkok', fly: fly && fly !== plane ? fly : null, stamp }
  })
  const boxRef = useRef<HTMLDivElement>(null)
  const size = useElementSize(boxRef)
  // The stage fits the box (the country stays whole on any screen); more sea round it on wide screens.
  const view = useMemo(() => {
    const s = size.width && size.height ? Math.min(size.width / STAGE.w, size.height / STAGE.h) * 1.04 : 0.4
    return { s, ox: (size.width - STAGE.w * s) / 2, oy: (size.height - STAGE.h * s) / 2 }
  }, [size.width, size.height])
  const viewRef = useRef(view)
  viewRef.current = view
  const toScreen = ([x, y]: XY): XY => [view.ox + x * view.s, view.oy + y * view.s]

  const home = pinOf(start.plane)!.at
  const plane = useRef<Plane>({ x: home[0], y: home[1], vx: 0, vy: 0, heading: -Math.PI / 2, bank: 0, alt: 0.75, spin: 0, mode: 'parked', turn: 1, target: null, pin: start.plane as PinId, t: 0, park: false })
  const finger = useRef<{ id: number; x: number; y: number } | null>(null)
  const planeEl = useRef<HTMLDivElement>(null)
  const wingsEl = useRef<SVGGElement>(null)
  const propEl = useRef<SVGRectElement>(null)
  const shadowEl = useRef<SVGEllipseElement>(null)
  const puffEls = useRef<(HTMLDivElement | null)[]>([])
  const puffs = useRef<{ x: number; y: number; age: number }[]>([])
  const puffT = useRef(0)
  const hum = useRef(0)
  const guide = useRef<TripGuideHandle>(null)
  const [over, setOver] = useState<PinId | null>(null)
  const overRef = useRef<PinId | null>(null)
  const [pokes, setPokes] = useState<Record<string, number>>({})
  const pokedAt = useRef<Record<string, number>>({})
  const [hint, setHint] = useState(false)
  const lastTouch = useRef(performance.now() + 3000)
  const hints = useRef(0)
  // The stamp that lands (the end of a trip): hidden on its pin until the plane is home.
  const [landed, setLanded] = useState(!start.stamp)
  const leaving = useRef(false)

  const live = (pin: (typeof PINS)[number]) => pin.id === 'bangkok' || meta.activities.some((a) => a.id === pin.activity)
  const stamped = (pin: (typeof PINS)[number]) => stamps.includes(pin.activity) && (landed || pin.activity !== start.stamp)
  const allStamps = meta.activities.length > 0 && meta.activities.every((a) => stamps.includes(a.id))

  useEffect(() => {
    enter('map', start.plane !== 'bangkok' ? { plane: start.plane } : {})
    if (!welcomed && !start.stamp && !start.fly) {
      welcomed = true
      setTimeout(() => guide.current?.speak(L.map.hello), 600)
    }
    // A trip's short flight (or home from one): off it goes by itself.
    const t = start.fly ? setTimeout(() => flyTo(pinOf(start.fly!)!.at, start.fly!, true, !!start.stamp), 700) : start.stamp ? setTimeout(stampLands, 900) : undefined
    const unwatch = watch('plane', () => {
      const p = plane.current
      const f = finger.current
      return { finger: [f ? f.x : 0, STAGE.w], plane: [p.x, STAGE.w], speed: [Math.hypot(p.vx, p.vy), FLY.top], bank: [(p.bank * 180) / Math.PI, 70] }
    })
    return () => {
      clearTimeout(t)
      unwatch()
    }
  }, [])

  const stampLands = () => {
    setLanded(true)
    sfx.thump()
    setTimeout(() => sounds.sparkle(), 250)
  }

  /** Off it goes by itself: to a spot (then circling) or a pin (then landing). `short`: the trip's flight, timed. */
  const flyTo = (to: XY, pin: PinId | null, short = false, park = false) => {
    const p = plane.current
    if (p.mode === 'parked') sounds.whoosh()
    p.mode = 'auto'
    p.target = to
    p.pin = pin
    p.park = park
    // (Timed: as fast as it needs to be to get there in the short flight's seconds.)
    p.t = short ? Math.max(FLY.cruise, Math.hypot(to[0] - p.x, to[1] - p.y) / FLY.short) : FLY.cruise
  }

  /** It has touched down on a pin: that place opens (or, home from a trip, it parks and the stamp lands). */
  const arrived = (id: PinId, park: boolean) => {
    tripSession.plane = id
    enter('map', id !== 'bangkok' ? { plane: id } : {})
    if (park) return stampLands()
    if (leaving.current) return
    leaving.current = true
    sounds.sparkle()
    setTimeout(() => open(id), 500)
  }
  const open = (id: PinId) => {
    if (id === 'bangkok') return void (location.hash = worldLink(meta.id, 'hub', tripSession.house))
    const trip = pinOf(id)!.activity
    // The first Krabi or Nan trip this session packs and rides the window seat; after that, straight there.
    if (!tripSession.kitDone) {
      tripSession.kitDone = true
      location.hash = worldLink(meta.id, trip, 'pack')
    } else location.hash = id === 'krabi' ? worldLink(meta.id, trip, 'land', { quick: '1' }) : worldLink(meta.id, trip, 'map')
  }

  const tapPin = (id: PinId) => {
    lastTouch.current = performance.now()
    setHint(false)
    const p = plane.current
    sounds.pop()
    if (p.mode === 'parked' && p.pin === id) return arrived(id, false)
    if (p.mode === 'landing') return
    flyTo(pinOf(id)!.at, id)
  }

  const poke = (id: PokeId, byPlane = false) => {
    const now = performance.now()
    if (byPlane && now - (pokedAt.current[id] ?? 0) < 3000) return
    pokedAt.current[id] = now
    POKE_SOUND[id]()
    setPokes((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }))
    if (!told.has(id)) {
      told.add(id)
      guide.current?.speak(L.map.pokes[id])
    }
  }

  // ---- her finger ----
  const toStage = (e: { clientX: number; clientY: number }): XY => {
    const r = boxRef.current!.getBoundingClientRect()
    const v = viewRef.current
    return [(e.clientX - r.left - v.ox) / v.s, (e.clientY - r.top - v.oy) / v.s]
  }
  const onDown = (e: React.PointerEvent) => {
    lastTouch.current = performance.now()
    setHint(false)
    if (finger.current || leaving.current) return
    const [x, y] = toStage(e)
    const p = plane.current
    const reach = FLY.grab / viewRef.current.s + 40
    if (Math.hypot(x - p.x, y - p.y) < reach && p.mode !== 'landing') {
      finger.current = { id: e.pointerId, x, y }
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      if (p.mode === 'parked') sounds.whoosh()
      p.mode = 'held'
      p.pin = null
      sounds.pickup()
      return
    }
    // A pin or a poke handles its own tap; the open map: the plane flies there.
    if ((e.target as HTMLElement).closest('button')) return
    if (p.mode !== 'landing') flyTo([x, y], null)
  }
  const onMove = (e: React.PointerEvent) => {
    const f = finger.current
    if (!f || f.id !== e.pointerId) return
    const [x, y] = toStage(e)
    f.x = x
    f.y = y
    lastTouch.current = performance.now()
  }
  const onUp = (e: React.PointerEvent) => {
    const f = finger.current
    if (!f || f.id !== e.pointerId) return
    finger.current = null
    const p = plane.current
    const o = overRef.current
    if (o && live(pinOf(o)!)) {
      p.mode = 'landing'
      p.pin = o
      p.t = 0
      p.park = false
      p.target = [p.x, p.y]
    } else p.mode = 'free'
  }

  // ---- every frame ----
  useGameLoop((dt) => {
    const p = plane.current
    const f = finger.current
    const speed0 = Math.hypot(p.vx, p.vy)
    const heading0 = p.heading
    if (p.mode === 'held' && f) {
      const k = Math.min(1, dt * FLY.pick)
      let dx = (f.x - p.x) * FLY.follow
      let dy = (f.y - p.y) * FLY.follow
      const m = Math.hypot(dx, dy)
      if (m > FLY.top) ((dx *= FLY.top / m), (dy *= FLY.top / m))
      p.vx += (dx - p.vx) * k
      p.vy += (dy - p.vy) * k
    } else if (p.mode === 'free') {
      // Slow into a lazy circle (turning the way it last turned), and back toward the middle if it drifts off the map.
      const cruise = FLY.cruise * 0.45
      const sp = speed0 + (cruise - speed0) * Math.min(1, dt * FLY.glide)
      let h = Math.atan2(p.vy, p.vx)
      const off = p.x < 80 || p.x > STAGE.w - 80 || p.y < 80 || p.y > STAGE.h - 80
      if (off) h += angleTo(h, Math.atan2(STAGE.h / 2 - p.y, STAGE.w / 2 - p.x)) * Math.min(1, dt * 2)
      else h += (p.turn * sp * dt) / FLY.circle
      p.vx = Math.cos(h) * sp
      p.vy = Math.sin(h) * sp
    } else if (p.mode === 'auto' && p.target) {
      const [tx, ty] = p.target
      const d = Math.hypot(tx - p.x, ty - p.y)
      const want = Math.atan2(ty - p.y, tx - p.x)
      let h = speed0 > 5 ? Math.atan2(p.vy, p.vx) : want
      // Turn toward it (tighter when close, so it never orbits the spot).
      h += angleTo(h, want) * Math.min(1, dt * (d < 200 ? 9 : 4))
      const sp = Math.min(p.t, Math.max(120, d * 3))
      const k = Math.min(1, dt * 4)
      p.vx += (Math.cos(h) * sp - p.vx) * k
      p.vy += (Math.sin(h) * sp - p.vy) * k
      if (d < 18) {
        if (p.pin) {
          p.mode = 'landing'
          p.t = 0
        } else p.mode = 'free'
      }
    } else if (p.mode === 'landing' && p.pin) {
      const [tx, ty] = pinOf(p.pin)!.at
      p.t += dt
      const k = Math.min(1, dt * 6)
      p.x += (tx - p.x) * k
      p.y += (ty - p.y) * k
      p.vx *= 1 - k
      p.vy *= 1 - k
      if (p.t >= 0.55 && p.t - dt < 0.55) {
        sfx.thump()
        sounds.place()
      }
      if (p.t > 0.9) {
        p.mode = 'parked'
        p.x = tx
        p.y = ty
        p.vx = p.vy = 0
        arrived(p.pin, p.park)
      }
    }
    if (p.mode !== 'landing' && p.mode !== 'parked') {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.x = Math.max(-40, Math.min(STAGE.w + 40, p.x))
      p.y = Math.max(-40, Math.min(STAGE.h + 40, p.y))
    }
    const speed = Math.hypot(p.vx, p.vy)
    if (speed > 25 && p.mode !== 'landing') p.heading = Math.atan2(p.vy, p.vx)
    // Lean into the turn (how fast the heading swings), eased.
    const turnRate = dt > 0 ? angleTo(heading0, p.heading) / dt : 0
    if (Math.abs(turnRate) > 0.3 && p.mode === 'held') p.turn = Math.sign(turnRate)
    const bankTo = Math.max(-1, Math.min(1, turnRate / 3)) * ((FLY.bank * Math.PI) / 180)
    p.bank += (bankTo - p.bank) * Math.min(1, dt * 6)
    const up = p.mode === 'parked' ? 0.75 : p.mode === 'landing' ? 0.75 + 0.25 * Math.max(0, 1 - p.t / 0.55) + (p.t > 0.55 ? Math.sin(((p.t - 0.55) / 0.35) * Math.PI) * 0.05 : 0) : 1
    p.alt += (up - p.alt) * Math.min(1, dt * 5)
    p.spin += dt * (p.mode === 'parked' ? 4 : 30 + speed / 20)

    // Over a pin with her finger on the plane: the pin glows, the wheels drop.
    let o: PinId | null = null
    if (p.mode === 'held') for (const pin of PINS) if (live(pin) && Math.hypot(pin.at[0] - p.x, pin.at[1] - p.y) < FLY.land) o = pin.id
    if (o !== overRef.current) {
      overRef.current = o
      setOver(o)
      if (o) sounds.snap()
    }
    // Flying low over something wakes it up.
    if (p.mode !== 'parked' && p.mode !== 'landing') for (const k of POKES) if (Math.hypot(k.at[0] - p.x, k.at[1] - p.y) < 60) poke(k.id, true)

    // The engine's buzz while she flies it.
    hum.current -= dt
    if (p.mode === 'held' && hum.current <= 0) {
      hum.current = 0.14
      tone(140 + speed / 6, 120 + speed / 7, 0.07, 0.025, 'square')
    }
    // The puff trail.
    puffT.current -= dt
    if (speed > 80 && puffT.current <= 0) {
      puffT.current = 0.06
      puffs.current.push({ x: p.x - Math.cos(p.heading) * 40, y: p.y - Math.sin(p.heading) * 40, age: 0 })
      if (puffs.current.length > 24) puffs.current.shift()
    }
    const v = viewRef.current
    puffs.current.forEach((q) => (q.age += dt))
    puffEls.current.forEach((el, i) => {
      if (!el) return
      const q = puffs.current[i]
      if (!q || q.age > 1.1) return void (el.style.opacity = '0')
      const r = (10 + q.age * 14) * Math.max(v.s, 0.35)
      el.style.opacity = String(0.8 * (1 - q.age / 1.1))
      el.style.transform = `translate(${v.ox + q.x * v.s - r}px, ${v.oy + q.y * v.s - r}px)`
      el.style.width = el.style.height = `${r * 2}px`
    })

    // Draw the plane (it never gets smaller than a finger's worth on screen).
    const scale = Math.max(v.s, 0.42) * p.alt
    if (planeEl.current) planeEl.current.style.transform = `translate(${v.ox + p.x * v.s}px, ${v.oy + p.y * v.s}px) rotate(${p.heading}rad) scale(${scale})`
    wingsEl.current?.setAttribute('transform', `scale(1 ${Math.cos(p.bank).toFixed(3)})`)
    propEl.current?.setAttribute('transform', `scale(1 ${Math.abs(Math.sin(p.spin)).toFixed(3)})`)
    shadowEl.current?.setAttribute('transform', `translate(${(-18 * (p.alt - 0.7)).toFixed(1)} ${(30 * (p.alt - 0.7)).toFixed(1)})`)

    // A hint after ~8 s with nothing touched (at most three).
    if (!leaving.current && hints.current < 3 && p.mode === 'parked' && performance.now() - lastTouch.current > 8000) {
      hints.current++
      lastTouch.current = performance.now() + 4000
      guide.current?.speak(L.map.hint)
      setHint(true)
    }
  })

  const [px, py] = toScreen([plane.current.x, plane.current.y])
  const small = view.s < 0.32
  return (
    <div style={{ position: 'absolute', inset: 0, background: SEA, overflow: 'clip' }}>
      <div
        ref={boxRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', bottom: 'calc(var(--safe-bottom) + 8px)', touchAction: 'none' }}
      >
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

        {/* The things to poke (round tap targets over their drawings; on a tiny screen the plane pokes them). */}
        {!small &&
          POKES.map((k) => {
            const [x, y] = toScreen(k.at)
            const d = Math.max(64, 90 * view.s)
            return <button key={k.id} aria-label={k.label} onClick={() => poke(k.id)} style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', border: 'none', background: 'transparent', padding: 0, zIndex: 2 }} />
          })}

        {/* The pins. */}
        {PINS.filter(live).map((pin) => {
          const [x, y] = toScreen(pin.at)
          const done = stamped(pin)
          const act = meta.activities.find((a) => a.id === pin.activity)
          const glow = over === pin.id
          const fresh = pin.activity === start.stamp && landed
          return (
            <motion.button
              key={pin.id}
              aria-label={pin.label}
              onClick={() => tapPin(pin.id)}
              initial={{ scale: 0 }}
              animate={{ scale: glow ? 1.2 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              whileTap={{ scale: 0.9 }}
              className={glow ? 'world-glow' : undefined}
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

        {/* The puff trail and the plane (drawn every frame; no taps: the box finds the plane by distance). */}
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} ref={(el) => void (puffEls.current[i] = el)} style={{ position: 'absolute', left: 0, top: 0, borderRadius: '50%', background: '#fff', opacity: 0, pointerEvents: 'none', zIndex: 4 }} />
        ))}
        <div ref={planeEl} aria-hidden style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none', zIndex: 5, transform: `translate(${px}px, ${py}px)` }}>
          <svg width={160} height={160} viewBox="-80 -80 160 160" style={{ position: 'absolute', left: -80, top: -80, overflow: 'visible' }}>
            <ToyPlane wingsRef={wingsEl} propRef={propEl} shadowRef={shadowEl} wheels={!!over} />
          </svg>
          {hint && (
            <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.0 }} style={{ position: 'absolute', left: 10, top: 10, fontSize: 56, filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
              👆
            </motion.div>
          )}
        </div>
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

/** The signed turn from angle a to b, in -π..π. */
function angleTo(a: number, b: number) {
  let d = b - a
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

/** The family's toy plane from above, nose to the right: pink, with lavender wings, a gold unicorn horn on the nose and
 *  a propeller that blurs. Its wings foreshorten as it banks (wingsRef), its shadow falls further below it as it climbs. */
function ToyPlane({ wingsRef, propRef, shadowRef, wheels }: { wingsRef: React.Ref<SVGGElement>; propRef: React.Ref<SVGRectElement>; shadowRef: React.Ref<SVGEllipseElement>; wheels: boolean }) {
  return (
    <g strokeLinejoin="round">
      <ellipse ref={shadowRef} cx={0} cy={0} rx={46} ry={40} fill="rgba(74,59,87,.18)" />
      <g ref={wingsRef}>
        <rect x={-14} y={-50} width={26} height={100} rx={13} fill="#C9B6F5" stroke={INK} strokeWidth={SW} />
        {wheels && (
          <>
            <circle cx={0} cy={-18} r={6} fill={INK} />
            <circle cx={0} cy={18} r={6} fill={INK} />
          </>
        )}
      </g>
      <rect x={-46} y={-20} width={14} height={40} rx={7} fill="#C9B6F5" stroke={INK} strokeWidth={SW} />
      <ellipse cx={0} cy={0} rx={46} ry={15} fill="#FF8FB8" stroke={INK} strokeWidth={SW} />
      <ellipse cx={14} cy={0} rx={10} ry={8} fill="#A8DCFF" stroke={INK} strokeWidth={SW * 0.7} />
      <path d="M44,-5 L60,0 L44,5Z" fill="#FFD36E" stroke={INK} strokeWidth={SW * 0.7} />
      <rect ref={propRef} x={44} y={-24} width={5} height={48} rx={2.5} fill={INK} opacity={0.8} />
    </g>
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

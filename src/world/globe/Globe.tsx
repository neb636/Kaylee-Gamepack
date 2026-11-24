// The home screen's globe: a toy Earth she spins with a finger (or the mouse). It keeps turning after a flick, drifts
// slowly when left alone, and every country stands on it as a pin that rides round with the land and peeks over the
// edge as it comes. A tap on the land names its continent; the sea plops; a poke at one of the toys that stand on it
// (a tree, a whale, the rainbow, the baby moon: toys.ts) makes that toy boing. The picture is sphere.ts; this file is
// the hands: dragging, flicking, turning to a country, and keeping the pins on their spots.
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, type MouseEvent, type PointerEvent, type ReactNode } from 'react'
import { clamp, damp, DEG, lerp, smooth, smoothstep, sounds, TO_DEG, useElementSize, useGameLoop, useTimers, wrapAngle } from '../../sdk'
import { feelLab, knobs } from '../kit/knobs'
import { continentAt, LIFT, paintGlobe, project, TILT, turnOf, unproject, type Continent, type Stalk, type View } from './sphere'
import { pokeAt, toysBusy, toySpots, type ToyKind } from './toys'

declare global {
  interface Window {
    /** For the robots (globe/qa.mjs): where each toy on the globe is on the page right now. */
    __homeGlobeQA?: () => { kind: ToyKind; x: number; y: number }[]
  }
}

export interface GlobePin {
  id: string
  /** Read out for a screen reader, and how the robots find it. */
  label: string
  lon: number
  lat: number
  /** What the pin looks like: it fills a square `--pin` wide. */
  node: ReactNode
}

/** Where the globe sits in its box, in px from the box's top-left. */
export interface GlobeLayout {
  cx: number
  cy: number
  /** The globe's radius. */
  R: number
  /** A pin's width: a full finger target (88px on an iPad, 64px on an iPhone) or more. */
  pin: number
}

export interface GlobeHandle {
  layout: () => GlobeLayout
  /** Where a pin is right now (px from the box's top-left), its size (1 in front, 0.6 at the edge, nothing round the
   *  back) and how far it faces her (z: 1 in the middle, 0 at the edge, negative round the back). */
  spot: (id: string) => { x: number; y: number; scale: number; z: number } | undefined
  /** Turn the short way round until this pin is in front, a little above the middle. */
  turnTo: (id: string, seconds: number) => void
  view: () => View
}

interface Props {
  pins: GlobePin[]
  /** The longitude facing her when it appears. */
  startLon: number
  /** No dragging and no drifting (the balloon is flying). */
  held?: boolean
  onPin: (id: string) => void
  /** She tapped land; x, y are px from the box's top-left. */
  onLand: (continent: Continent, x: number, y: number) => void
  onSea: (x: number, y: number) => void
}

/** Named spots for the continents: robots and screen readers reach them here; her finger can tap anywhere on the land. */
const CONTINENTS: [Continent, number, number][] = [
  ['northAmerica', -100, 45],
  ['southAmerica', -58, -14],
  ['europe', 16, 50],
  ['africa', 20, 6],
  ['asia', 95, 48],
  ['australia', 134, -25],
  ['antarctica', 0, -82],
]

function layoutOf(w: number, h: number): GlobeLayout {
  const phone = Math.min(w, h) < 480
  // Room for the pins that stand out past the edge, and for the one on top of the world.
  const R = Math.max(40, Math.min(w / (phone ? 2.3 : 2.45), h / 2.4))
  return { cx: w / 2, cy: h / 2 + R * 0.1, R, pin: clamp(R * 0.33, phone ? 64 : 88, 116) }
}

const still = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
/** It arrives turning: this many degrees round to where it stops. */
const ARRIVE = 110
const polar = (p: { lat: number }) => Math.abs(p.lat) > 85

// How the spin feels (the feel lab: #/world?view=map&feel=1). Shared, because the home screen belongs to no country:
// the lab shows it while the globe is on screen.
const FEEL_ID = 'homeGlobe'
const FEEL = knobs(
  FEEL_ID,
  'The home globe',
  'src/world/globe/Globe.tsx',
  {
    glide: { value: 1.7, min: 0.3, max: 6, step: 0.1, label: 'Slowing after a flick', unit: '/s', note: 'higher stops sooner; lower spins on and on', main: true },
    top: { value: 520, min: 120, max: 1200, step: 10, label: 'Fastest flick', unit: '°/s', note: 'the fastest a flick can send it', main: true },
    grip: { value: 1, min: 0.5, max: 2, step: 0.05, label: 'Turn per finger', note: '1: the ground stays under her finger', main: true },
    drift: { value: 2.4, min: 0, max: 12, step: 0.1, label: 'Drift when left alone', unit: '°/s', note: 'the way the real Earth turns; 0 keeps it still', main: true },
    rest: { value: 4, min: 0.5, max: 15, step: 0.5, label: 'Wait before drifting', unit: 's' },
    slop: { value: 9, min: 2, max: 30, step: 1, label: 'Tap or turn', unit: 'px', note: 'how far a finger moves before a tap becomes a turn' },
    sway: { value: 1, min: 0, max: 2.5, step: 0.05, label: 'Toys lean in a spin', note: 'how far the trees and boats lean when she spins it; 0 keeps them stiff', main: true },
    jelly: { value: 7, min: 2, max: 20, step: 0.5, label: 'Wobble settling', unit: '/s', note: 'lower wobbles longer after the spin stops' },
  },
  { shared: true },
)

export const Globe = forwardRef<GlobeHandle, Props>(function Globe({ pins, startLon, held, onPin, onLand, onSea }, ref) {
  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const pinEls = useRef(new Map<string, HTMLButtonElement>())
  const landEls = useRef(new Map<Continent, HTMLButtonElement>())
  const size = useElementSize(box)
  const lay = useMemo(() => layoutOf(size.width, size.height), [size.width, size.height])

  // Everything that moves lives in refs: the loop reads and writes them, React never re-renders for a frame.
  const s = useRef({
    view: { lon: startLon + (still ? 0 : ARRIVE), lat: TILT.home } as View,
    /** Degrees a second she flicked it at, dying away. */
    spin: 0,
    tip: 0,
    drift: 0,
    /** Seconds since she last touched it. */
    idle: 0,
    drag: null as null | { id: number; x: number; y: number; moved: boolean; at: number },
    /** A turn that runs by itself (arriving, flying to a country). */
    turn: (still ? null : { from: { lon: startLon + ARRIVE, lat: TILT.home }, to: { lon: startLon, lat: TILT.home }, t: 0, seconds: 1.3 }) as null | { from: View; to: View; t: number; seconds: number },
    /** When a drag ended (ms), so the click that follows it is not a tap. */
    dragged: 0,
    spots: new Map<string, { x: number; y: number; scale: number; z: number }>(),
    side: new Map<string, number>(),
    note: 0,
    frame: 0,
    /** The toys on the globe lean back from a spin and wobble upright again: a little spring (-1..1) and its speed. */
    sway: 0,
    swing: 0,
    /** Where it faced a frame ago, for how fast it is turning (her finger turns it between frames). */
    lonWas: startLon + (still ? 0 : ARRIVE),
    /** The loop's clock (seconds), for a poke. */
    time: 0,
  })
  const timers = useTimers()
  const heldRef = useRef(held)
  heldRef.current = held
  const pinsRef = useRef(pins)
  pinsRef.current = pins
  const layRef = useRef(lay)
  layRef.current = lay

  useImperativeHandle(
    ref,
    () => ({
      layout: () => layRef.current,
      spot: (id) => s.current.spots.get(id),
      view: () => s.current.view,
      turnTo: (id, seconds) => {
        const pin = pinsRef.current.find((p) => p.id === id)
        if (!pin) return
        const from = { ...s.current.view }
        // The short way round, and the pin ends up a little above the middle (the view looks just south of it).
        // (A pin on a pole is in view from every side: only tip the globe toward it.)
        const to = { lon: polar(pin) ? from.lon : from.lon + wrapAngle((pin.lon - from.lon) * DEG) * TO_DEG, lat: clamp(pin.lat - 12, TILT.min, TILT.max) }
        s.current.spin = s.current.tip = 0
        s.current.turn = { from, to, t: 0, seconds }
      },
    }),
    [],
  )

  // The feel lab lists the spin's knobs while the globe is on screen.
  useEffect(() => feelLab.claim(FEEL_ID), [])

  // The robots ask where the toys are, so their finger can poke one.
  useEffect(() => {
    window.__homeGlobeQA = () => {
      const rect = box.current?.getBoundingClientRect()
      const { cx, cy, R } = layRef.current
      return toySpots(R).map((spot) => ({ kind: spot.kind, x: spot.x + cx + (rect?.left ?? 0), y: spot.y + cy + (rect?.top ?? 0) }))
    }
    return () => {
      delete window.__homeGlobeQA
    }
  }, [])

  // The canvas covers the globe, its glow and the pins' stalks, at the screen's own sharpness (2x at most).
  const side = Math.ceil(lay.R * 2.7)
  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = Math.round(side * dpr)
    c.height = Math.round(side * dpr)
  }, [side])

  useGameLoop((dt, time) => {
    const st = s.current
    const { cx, cy, R, pin } = layRef.current
    if (!size.width) return
    st.frame++
    st.idle += dt
    st.time = time

    // Turn it: by itself to somewhere, with her finger, on with the flick she gave it, or the slow drift.
    let moving = false
    if (st.turn) {
      st.turn.t = Math.min(1, st.turn.t + dt / st.turn.seconds)
      const k = smooth(st.turn.t)
      st.view.lon = lerp(st.turn.from.lon, st.turn.to.lon, k)
      st.view.lat = lerp(st.turn.from.lat, st.turn.to.lat, k)
      if (st.turn.t >= 1) st.turn = null
      st.idle = 0
      st.drift = 0
      moving = true
    } else if (st.drag?.moved) {
      st.idle = 0
      st.drift = 0
      moving = true
    } else {
      if (st.spin || st.tip) {
        st.view.lon += st.spin * dt
        st.view.lat = clamp(st.view.lat + st.tip * dt, TILT.min, TILT.max)
        st.spin *= Math.exp(-dt * FEEL.glide)
        st.tip *= Math.exp(-dt * 5)
        if (Math.abs(st.spin) < 1.5) st.spin = 0
        if (Math.abs(st.tip) < 1.5) st.tip = 0
        st.idle = 0
        moving = true
      }
      const drift = !still && !heldRef.current && !st.drag && st.idle > FEEL.rest ? -FEEL.drift : 0
      st.drift += (drift - st.drift) * damp(dt, 1.2)
      if (Math.abs(st.drift) > 0.01) {
        st.view.lon += st.drift * dt
        moving = true
      }
    }

    // The toys lean back from the spin and spring upright when it stops.
    const lean = still || !dt ? 0 : clamp(((st.view.lon - st.lonWas) / dt / 300) * FEEL.sway, -1, 1)
    st.lonWas = st.view.lon
    st.swing += ((lean - st.sway) * 90 - st.swing * FEEL.jelly) * dt
    st.sway = clamp(st.sway + st.swing * dt, -1.2, 1.2)
    if (Math.abs(st.sway) > 0.004 || Math.abs(st.swing) > 0.02 || toysBusy(time)) moving = true

    // Left alone, only the clouds, the moon and the whales move: every third frame is plenty.
    if (!moving && st.frame % 3) return
    const t = turnOf(st.view)

    // The pins: each on its spot, lifted off the ground, smaller toward the edge, hidden round the back.
    const stalks: Stalk[] = []
    const fast = Math.abs(st.spin) > 45 && !st.turn
    for (const p of pinsRef.current) {
      const el = pinEls.current.get(p.id)
      if (!el) continue
      const [x, y, z] = project(p.lon, p.lat, t)
      // It comes up over the edge of the world like a bubble (from nothing to small) and grows as it comes round to
      // the front; round the back it is gone.
      const clear = smoothstep(-0.07, 0.03, z)
      const scale = clear * lerp(0.6, 1, smoothstep(0, 0.5, z))
      const mx = cx + x * R * LIFT
      const my = cy - y * R * LIFT
      st.spots.set(p.id, { x: mx, y: my, scale, z })
      el.style.transform = `translate3d(${(mx - pin / 2).toFixed(1)}px, ${(my - pin / 2).toFixed(1)}px, 0)`
      el.style.setProperty('--depth', scale.toFixed(3))
      el.style.opacity = clear > 0.3 ? '1' : '0'
      el.style.zIndex = String(200 + Math.round(z * 100))
      el.style.pointerEvents = clear > 0.6 ? 'auto' : 'none'
      if (clear > 0.3) stalks.push({ sx: x * R, sy: -y * R, mx: x * R * LIFT, my: -y * R * LIFT, z, r: (pin / 2) * scale, show: clear })
      // A flick sends the countries past the middle one by one: each chimes and hops as it goes by.
      const now = Math.sign(wrapAngle((p.lon - st.view.lon) * DEG))
      const was = st.side.get(p.id)
      st.side.set(p.id, now)
      if (fast && was !== undefined && was !== now && z > 0.3 && !polar(p)) {
        sounds.note(st.note++ % 8)
        el.classList.remove('globe-pin-pass')
        void el.offsetWidth
        el.classList.add('globe-pin-pass')
      }
    }
    for (const [key, lon, lat] of CONTINENTS) {
      const el = landEls.current.get(key)
      if (!el) continue
      const [x, y, z] = project(lon, lat, t)
      el.style.transform = `translate3d(${(cx + x * R - 28).toFixed(1)}px, ${(cy - y * R - 28).toFixed(1)}px, 0)`
      el.style.visibility = z > 0.25 ? 'visible' : 'hidden'
    }

    const c = canvas.current
    const g = c?.getContext('2d')
    if (!c || !g) return
    const dpr = c.width / side
    g.setTransform(dpr, 0, 0, dpr, c.width / 2, c.height / 2)
    g.clearRect(-side / 2, -side / 2, side, side)
    paintGlobe(g, R, st.view, time, stalks, st.sway)
  })

  // Her finger. A turn starts once it has moved a little; until then it may still be a tap on a pin or the land.
  const down = (e: PointerEvent) => {
    if (heldRef.current || s.current.drag) return
    s.current.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, at: performance.now() }
    s.current.spin = s.current.tip = 0
    s.current.idle = 0
  }
  const up = (e: PointerEvent) => {
    const st = s.current
    const d = st.drag
    if (!d || d.id !== e.pointerId) return
    st.drag = null
    if (!d.moved) return
    st.dragged = performance.now()
    // A finger that stopped before lifting put the globe down; a moving one flicked it.
    if (performance.now() - d.at > 90) st.spin = st.tip = 0
    st.spin = clamp(st.spin, -FEEL.top, FEEL.top)
    st.tip = clamp(st.tip, -120, 120)
    if (Math.abs(st.spin) > 120) sounds.whoosh()
  }
  const move = (e: PointerEvent) => {
    const st = s.current
    const d = st.drag
    if (!d || d.id !== e.pointerId) return
    // A mouse whose button came up somewhere we couldn't hear it (outside the box, before the turn began).
    if (e.pointerType === 'mouse' && e.buttons === 0) return up(e)
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.moved) {
      if (Math.hypot(dx, dy) < FEEL.slop) return
      d.moved = true
      st.turn = null
      box.current?.setPointerCapture(e.pointerId)
      sounds.pickup()
    }
    // The ground under her finger goes where her finger goes.
    const R = layRef.current.R
    const turned = (-dx / R) * TO_DEG * FEEL.grip
    const tipped = (dy / R) * TO_DEG * FEEL.grip
    st.view.lon += turned
    st.view.lat = clamp(st.view.lat + tipped, TILT.min, TILT.max)
    const now = performance.now()
    const dt = Math.max(0.004, (now - d.at) / 1000)
    st.spin = lerp(st.spin, turned / dt, 0.45)
    st.tip = lerp(st.tip, tipped / dt, 0.45)
    d.x = e.clientX
    d.y = e.clientY
    d.at = now
  }
  const wasDrag = () => performance.now() - s.current.dragged < 400

  /** Each toy answers a poke with its own sound (the toy itself boings: toys.ts). */
  const toySound = (kind: ToyKind) => {
    if (kind === 'whale') sounds.whoosh()
    else if (kind === 'moon') sounds.sparkle()
    else if (kind === 'cloud') sounds.pop()
    else if (kind === 'peak' || kind === 'berg') sounds.place()
    // The rainbow plays its colors, top to bottom.
    else if (kind === 'rainbow') for (let i = 0; i < 6; i++) timers.later(() => sounds.note(7 - i), i * 70)
    else sounds.note(s.current.note++ % 8)
  }

  const tap = (e: MouseEvent) => {
    if (heldRef.current || (e.target as Element).closest('button')) return
    const rect = box.current!.getBoundingClientRect()
    const { cx, cy, R } = layRef.current
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    // A toy first: the ones on the edge of the world stand out past it, and the moon flies beside it.
    const toy = pokeAt(x - cx, y - cy, R, s.current.time)
    if (toy) {
      s.current.idle = 0
      return toySound(toy)
    }
    const at = unproject((x - cx) / R, -(y - cy) / R, turnOf(s.current.view))
    if (!at) return
    s.current.idle = 0
    const land = continentAt(at[0], at[1])
    if (land) onLand(land, x, y)
    else onSea(x, y)
  }

  return (
    <div
      ref={box}
      className="globe"
      style={{ ['--pin' as string]: `${lay.pin}px` }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerLeave={(e) => {
        // A press that slid out of the box before it became a turn: its release won't reach us, so let it go now.
        // (Once it is a turn the box has captured the pointer and hears the release wherever it happens.)
        if (s.current.drag?.id === e.pointerId && !s.current.drag.moved) s.current.drag = null
      }}
      onClickCapture={(e) => {
        // The click at the end of a turn isn't a tap.
        if (wasDrag()) e.stopPropagation()
      }}
      onClick={tap}
    >
      <canvas ref={canvas} className="globe-ball" style={{ left: lay.cx - side / 2, top: lay.cy - side / 2, width: side, height: side }} />
      {CONTINENTS.map(([key]) => (
        <button
          key={key}
          ref={(el) => {
            if (el) landEls.current.set(key, el)
            else landEls.current.delete(key)
          }}
          className="globe-land"
          aria-label={key}
          onClick={() => {
            if (heldRef.current) return
            const el = landEls.current.get(key)
            const rect = el?.getBoundingClientRect()
            const from = box.current?.getBoundingClientRect()
            if (rect && from) onLand(key, rect.left + rect.width / 2 - from.left, rect.top + rect.height / 2 - from.top)
          }}
        />
      ))}
      {pins.map((p) => (
        <button
          key={p.id}
          ref={(el) => {
            if (el) pinEls.current.set(p.id, el)
            else pinEls.current.delete(p.id)
          }}
          className="globe-pin"
          aria-label={p.label}
          style={{ opacity: 0 }}
          onClick={() => {
            if (!heldRef.current) onPin(p.id)
          }}
        >
          <span className="globe-pin-body">{p.node}</span>
        </button>
      ))}
    </div>
  )
})

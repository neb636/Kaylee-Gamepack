// 🛶 Venice: Gino's Water Taxi (plan: planning/around-the-world/italy.md § 6). GATE 1: THE GREYBOX TOY.
// Only the core verb, with placeholder shapes, no art, no puppets, no voices: put a finger on the boat and drive it
// along a canal that loops both ways. It chases the finger with a little water lag, coasts and slows when let go, bobs
// and tilts, spins round happily when it turns, rides in two lanes, boings off posts and leaves a wake. One doorstep
// friend (a circle) hops in when the boat comes close and hops off at the pink house, to prove the ride loop.
// All feel numbers are in canal.ts (FEEL). Everything per-frame is written straight to the DOM from one game loop.
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode, type RefObject } from 'react'
import { burst, sounds, useGameLoop } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import type { ActivityProps } from '../../Place'
import { INK } from '../../puppets/ink'
import { BOAT, CANAL, CLOUDS, doorX, FAR, FEEL, FORE, HOUSES, LANE, LANE_SPLIT, mod, PARALLAX, PINK, POSTS, STAGE, WATER_H, wrap } from './canal'
import { Clouds, Foreground, House, Post, Rooftops } from './Scenery'
import { setSwish, startSwish, stopSwish } from './swish'

/** Stars: one per friend taken home (the greybox keeps going after three). */
const TOTAL = 3
const WAKE_POOL = 48
const SPRAY_POOL = 24
const FRIEND_COLORS = ['#B9A4F0', '#8FD3B0', '#FFD36E', '#8CC8F0']
const FRIEND_R = 30

interface Layout {
  W: number
  H: number
  /** Canal units → CSS px. */
  s: number
  /** Screen width in canal units. */
  viewW: number
  /** Screen y (px) of the waterline. */
  waterTop: number
}

type FriendPhase = 'none' | 'waiting' | 'hopIn' | 'riding' | 'hopOut' | 'inside'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
  size: number
}

function layoutFor(W: number, H: number): Layout {
  const wide = W > H
  const s = Math.min(W / (wide ? STAGE.wideW : STAGE.tallW), H / STAGE.minH)
  return { W, H, s, viewW: W / s, waterTop: H - WATER_H * s }
}

export function Venice({ setProgress }: ActivityProps) {
  const root = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<Layout | null>(null)
  const [delivered, setDelivered] = useState(0)
  const [pinkDoorOpen, setPinkDoorOpen] = useState(false)
  const [friendColor, setFriendColor] = useState(FRIEND_COLORS[0])
  useEffect(() => setProgress(Math.min(delivered, TOTAL), TOTAL), [delivered])

  // Fit the logical stage to the screen (the extra height becomes sky, the extra width more canal).
  useEffect(() => {
    const el = root.current
    if (!el) return
    const measure = () => setLayout(layoutFor(el.clientWidth, el.clientHeight))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => stopSwish, [])

  // ---- Mutable game state (the loop reads and writes it every frame; React never sees it). ----
  const g = useRef({
    t: 0,
    bx: 360,
    by: LANE.front as number,
    vx: 0,
    vy: 0,
    accel: 0,
    facing: 1,
    spin: -1, // seconds into the turnaround spin, or -1
    spinFrom: 1,
    squash: 0,
    squashV: 0,
    stun: 0,
    bumpCooldown: 0,
    bumps: 0,
    dodge: 0,
    lastBump: -9,
    lastPost: -1,
    cam: 360,
    drag: null as null | { id: number; fx: number; fy: number; gx: number; gy: number },
    idle: 3, // seconds without a touch (the boat pulses after a few)
    travelled: 0,
    sinceWake: 0,
    wakeFlip: 1,
    wake: [] as Particle[],
    spray: [] as Particle[],
    posts: POSTS.map(() => ({ a: 0, w: 0 })),
    friend: { phase: 'none' as FriendPhase, house: -1, last: -1, t: 0, x: 0, y: 0, fromX: 0, fromY: 0, tap: -1, spawnIn: 5 },
  })
  const layoutRef = useRef<Layout | null>(null)
  layoutRef.current = layout

  // ---- DOM handles written by the loop ----
  const layers = useRef<Record<string, HTMLDivElement | null>>({})
  const layerRef = (name: string) => (el: HTMLDivElement | null) => void (layers.current[name] = el)
  const boatEl = useRef<HTMLDivElement>(null)
  const hullEl = useRef<HTMLDivElement>(null)
  const ringEl = useRef<HTMLDivElement>(null)
  const friendEl = useRef<HTMLDivElement>(null)
  const arrowL = useRef<HTMLDivElement>(null)
  const arrowR = useRef<HTMLDivElement>(null)
  const wakeEls = useRef<(HTMLDivElement | null)[]>([])
  const sprayEls = useRef<(HTMLDivElement | null)[]>([])
  const postEls = useRef<(HTMLDivElement | null)[][]>([[], []])

  const spawn = (list: Particle[], max: number, p: Particle) => {
    if (list.length >= max) list.shift()
    list.push(p)
  }

  /** Screen point (px, relative to the stage) → canal coordinates. */
  const toCanal = (L: Layout, px: number, py: number) => ({ x: g.current.cam + px / L.s - L.viewW / 2, y: (py - L.waterTop) / L.s })

  const onPointerDown = (e: PointerEvent) => {
    const L = layoutRef.current
    const s = g.current
    if (!L || s.drag || (e.target as HTMLElement).closest('button')) return
    const r = root.current!.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    const p = toCanal(L, px, py)
    const dx = p.x - s.bx
    const dy = p.y - (s.by - 24)
    // Generous grab area around the boat (at least ~70px on small screens), so a five-year-old's finger finds it.
    const rx = Math.max(BOAT.halfLength + 50, 70 / L.s)
    const ry = Math.max(95, 70 / L.s)
    if ((dx / rx) ** 2 + (dy / ry) ** 2 < 1) {
      root.current!.setPointerCapture(e.pointerId)
      s.drag = { id: e.pointerId, fx: px, fy: py, gx: dx, gy: p.y - s.by }
      s.idle = 0
      startSwish()
      sfx.fwip()
    } else if (p.y > 8) {
      // Tap the water: a splash.
      sfx.splash()
      for (let i = 0; i < 3; i++) spawn(s.wake, WAKE_POOL, { x: p.x, y: p.y, vx: 0, vy: 0, age: -i * 0.12, life: 0.9, size: 30 })
      for (let i = 0; i < 7; i++) spawn(s.spray, SPRAY_POOL, { x: p.x, y: p.y, vx: (Math.random() - 0.5) * 260, vy: -260 - Math.random() * 260, age: 0, life: 0.7, size: 12 + Math.random() * 8 })
    }
  }
  const onPointerMove = (e: PointerEvent) => {
    const d = g.current.drag
    if (!d || d.id !== e.pointerId) return
    const r = root.current!.getBoundingClientRect()
    d.fx = e.clientX - r.left
    d.fy = e.clientY - r.top
  }
  const onPointerUp = (e: PointerEvent) => {
    if (g.current.drag?.id === e.pointerId) g.current.drag = null
  }

  const tapFriend = () => {
    const f = g.current.friend
    if (f.phase === 'waiting' || f.phase === 'riding') {
      f.tap = 0
      sfx.chirp()
    }
  }

  useGameLoop((dt) => {
    const L = layoutRef.current
    if (!L) return
    const s = g.current
    s.t += dt
    const prevVx = s.vx

    // ---- The boat: chase the finger, or coast ----
    if (s.drag) {
      const p = toCanal(L, s.drag.fx, s.drag.fy)
      const tx = p.x - s.drag.gx
      const ty = Math.min(LANE.front, Math.max(LANE.near, p.y - s.drag.gy))
      const k = FEEL.followK * (s.stun > 0 ? 0.15 : 1)
      s.vx += (k * (tx - s.bx) - FEEL.followDamp * s.vx) * dt
      // While dodging round a post, the finger's up/down is ignored and the water barely slows the sideways slide.
      if (s.dodge > 0) s.vy *= Math.exp(-1.5 * dt)
      else s.vy += (FEEL.laneFollowK * (ty - s.by) - 2 * Math.sqrt(FEEL.laneFollowK) * 0.9 * s.vy) * dt
    } else {
      s.vx *= Math.exp(-FEEL.coastDrag * dt)
      const lane = s.by < LANE_SPLIT ? LANE.near : LANE.front
      s.vy += (FEEL.laneSettleK * (lane - s.by) - 2 * Math.sqrt(FEEL.laneSettleK) * 0.8 * s.vy) * dt
      s.idle += dt
    }
    s.vx = Math.max(-FEEL.maxSpeed, Math.min(FEEL.maxSpeed, s.vx))
    s.bx += s.vx * dt
    s.by += s.vy * dt
    s.by = Math.max(LANE.near - 14, Math.min(LANE.front + 14, s.by))
    s.stun -= dt
    s.dodge -= dt
    s.bumpCooldown -= dt
    const speed = Math.abs(s.vx)
    s.travelled += speed * dt
    s.accel += ((s.vx - prevVx) / dt - s.accel) * Math.min(1, dt * 10)

    // ---- Mooring posts: boing off them with a wobble ----
    POSTS.forEach((post, i) => {
      const dx = wrap(s.bx - post.x, CANAL)
      const dy = s.by - LANE[post.lane]
      const reachX = BOAT.halfLength + 14
      const reachY = 62
      if (Math.abs(dx) >= reachX || Math.abs(dy) >= reachY) return
      const sx = Math.sign(dx) || 1
      const sy = Math.sign(dy) || 1
      const penX = reachX - Math.abs(dx)
      const penY = reachY - Math.abs(dy)
      let impact = 0
      if (penX < penY * 1.2) {
        s.bx += sx * penX
        if (s.vx * sx < 0) {
          impact = Math.abs(s.vx)
          s.vx = -s.vx * FEEL.bounce + sx * 40
        }
      } else {
        s.by += sy * penY
        if (s.vy * sy < 0) {
          impact = Math.abs(s.vy)
          s.vy = -s.vy * FEEL.bounce + sy * 30
        }
      }
      if (impact > 50 && s.bumpCooldown <= 0) {
        sfx.boing()
        s.bumpCooldown = 0.4
        s.stun = FEEL.stunTime
        s.bumps = s.lastPost === i && s.t - s.lastBump < 1.5 ? s.bumps + 1 : 1
        s.lastPost = i
        s.lastBump = s.t
        if (s.bumps >= FEEL.dodgeAfter) {
          // Keeps pushing into it: bounce over into the other lane and slide round.
          s.vy = (post.lane === 'near' ? 1 : -1) * FEEL.dodgeKick
          s.dodge = 0.5
          s.bumps = 0
        }
        s.squashV += Math.min(4, impact / 120)
        s.posts[i].w += -sx * Math.min(6, impact * FEEL.postWobble * 0.05)
        for (let k = 0; k < 4; k++) spawn(s.spray, SPRAY_POOL, { x: s.bx - dx, y: LANE[post.lane] + 10, vx: (Math.random() - 0.5) * 200, vy: -200 - Math.random() * 180, age: 0, life: 0.6, size: 10 + Math.random() * 8 })
      }
    })
    for (const p of s.posts) {
      p.w += (-140 * p.a - 5 * p.w) * dt
      p.a += p.w * dt
    }

    // ---- Turning round: a happy spin with a hop ----
    if (s.vx * s.facing < -FEEL.turnSpeed && s.spin < 0) {
      s.spinFrom = s.facing
      s.facing = -s.facing
      s.spin = 0
      sounds.whoosh()
      for (let i = 0; i < 4; i++) spawn(s.wake, WAKE_POOL, { x: s.bx + (i - 1.5) * 50, y: s.by + 18, vx: 0, vy: 0, age: -i * 0.05, life: 1, size: 36 })
    }
    let flip = s.facing
    let hop = 0
    if (s.spin >= 0) {
      s.spin += dt
      const p = Math.min(1, s.spin / FEEL.spinTime)
      flip = s.spinFrom * Math.cos(FEEL.spinHalfTurns * Math.PI * p)
      hop = Math.sin(Math.PI * p) * FEEL.spinHop
      if (p >= 1) s.spin = -1
    }

    // ---- Squash (bumps, a friend landing) ----
    s.squashV += (-320 * s.squash - 16 * s.squashV) * dt
    s.squash += s.squashV * dt

    // ---- Wake and spray ----
    s.sinceWake += speed * dt
    if (s.sinceWake > FEEL.wakeEvery && speed > 30) {
      s.sinceWake = 0
      s.wakeFlip = -s.wakeFlip
      const stern = s.bx - Math.sign(s.vx) * BOAT.halfLength * 0.8
      spawn(s.wake, WAKE_POOL, { x: stern, y: s.by + 6 + s.wakeFlip * 7, vx: 0, vy: 0, age: 0, life: FEEL.wakeLife, size: 18 + speed * 0.025 })
    }
    if (speed > FEEL.sprayAbove && Math.random() < ((speed - FEEL.sprayAbove) / 300) * dt * 30) {
      const dir = Math.sign(s.vx)
      spawn(s.spray, SPRAY_POOL, { x: s.bx + dir * BOAT.halfLength * 0.9, y: s.by, vx: dir * (speed * 0.25 + Math.random() * 80), vy: -220 - Math.random() * 220, age: 0, life: 0.65, size: 9 + Math.random() * 9 })
    }
    for (const p of s.wake) p.age += dt
    for (const p of s.spray) {
      p.age += dt
      p.vy += 1100 * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
    }
    s.wake = s.wake.filter((p) => p.age < p.life)
    s.spray = s.spray.filter((p) => p.age < p.life)

    // ---- Camera: follows the boat, leading by its speed ----
    const lead = Math.max(-FEEL.maxLead * L.viewW, Math.min(FEEL.maxLead * L.viewW, s.vx * FEEL.leadTime))
    s.cam += (s.bx + lead - s.cam) * (1 - Math.exp(-FEEL.cameraRate * dt))
    const screenX = (x: number) => x - s.cam + L.viewW / 2

    // ---- The doorstep friend ----
    const f = s.friend
    const bob = Math.sin(s.t * FEEL.bobSpeed) * FEEL.bob + Math.sin(s.t * 1.3) * FEEL.bob * 0.4
    const seat = { x: s.bx, y: s.by - 26 - FRIEND_R + bob - hop }
    const nearHouses = s.by < LANE_SPLIT
    f.t += dt
    if (f.tap >= 0) f.tap += dt
    if (f.tap > 0.5) f.tap = -1
    const tapHop = f.tap >= 0 ? Math.sin(Math.PI * (f.tap / 0.5)) * 40 : 0
    if (f.phase === 'none') {
      f.spawnIn -= dt
      if (f.spawnIn <= 0) {
        // Pop out of a door ahead of the boat (in the direction it's going), not the pink house and not the last one.
        const dir = s.facing
        const options = HOUSES.map((_, i) => i).filter((i) => i !== PINK && i !== f.last)
        const ahead = options.filter((i) => {
          const d = wrap(doorX(i) - s.bx, CANAL) * dir
          return d > 500 && d < 1400
        })
        f.house = (ahead.length ? ahead : options)[Math.floor(Math.random() * (ahead.length ? ahead.length : options.length))]
        f.phase = 'waiting'
        f.t = 0
        setFriendColor(FRIEND_COLORS[Math.floor(Math.random() * FRIEND_COLORS.length)])
      }
    }
    let fx = 0
    let fy = 0
    let fScale = 1
    if (f.phase === 'waiting') {
      const door = s.bx + wrap(doorX(f.house) - s.bx, CANAL)
      const close = Math.abs(door - s.bx) < 700
      fx = door
      fy = -FRIEND_R - 6 - Math.abs(Math.sin(f.t * (close ? 7 : 3))) * (close ? 22 : 8) - tapHop
      fScale = Math.min(1, f.t / 0.3) // pops out of the door
      if (Math.abs(door - s.bx) < FEEL.doorReach && nearHouses) {
        f.phase = 'hopIn'
        f.t = 0
        f.fromX = fx
        f.fromY = fy
        sfx.boing()
      }
    } else if (f.phase === 'hopIn' || f.phase === 'hopOut') {
      const p = Math.min(1, f.t / 0.5)
      const pinkDoor = s.bx + wrap(doorX(PINK) - s.bx, CANAL)
      const to = f.phase === 'hopIn' ? seat : { x: pinkDoor, y: -FRIEND_R - 6 }
      fx = f.fromX + (to.x - f.fromX) * p
      fy = f.fromY + (to.y - f.fromY) * p - Math.sin(Math.PI * p) * 120
      if (p >= 1) {
        if (f.phase === 'hopIn') {
          f.phase = 'riding'
          sfx.pop()
          s.squashV += 2.5
        } else {
          f.phase = 'inside'
          sounds.correct()
          burst(screenX(fx) * L.s / L.W, (L.waterTop + fy * L.s) / L.H)
          setPinkDoorOpen(true)
          setDelivered((n) => n + 1)
        }
        f.t = 0
      }
    } else if (f.phase === 'riding') {
      fx = seat.x
      fy = seat.y - tapHop * 0.6
      const pinkDoor = s.bx + wrap(doorX(PINK) - s.bx, CANAL)
      if (Math.abs(pinkDoor - s.bx) < FEEL.doorReach && nearHouses) {
        f.phase = 'hopOut'
        f.t = 0
        f.fromX = fx
        f.fromY = fy
        sfx.boing()
      }
    } else if (f.phase === 'inside') {
      fx = s.bx + wrap(doorX(PINK) - s.bx, CANAL)
      fy = -FRIEND_R - 6
      fScale = Math.max(0, 1 - f.t / 0.4)
      if (f.t > 0.9) {
        setPinkDoorOpen(false)
        f.last = f.house
        f.phase = 'none'
        f.spawnIn = 2.5
      }
    }
    f.x = fx
    f.y = fy

    // ---- Write it all to the DOM ----
    const shift = (name: string, factor: number, period: number) => {
      const el = layers.current[name]
      if (el) el.style.transform = `translate3d(${-mod(s.cam * factor - L.viewW / 2, period)}px,0,0)`
    }
    shift('clouds', PARALLAX.clouds, CLOUDS)
    // Clouds also drift on their own.
    const cl = layers.current.clouds
    if (cl) cl.style.transform = `translate3d(${-mod(s.cam * PARALLAX.clouds + s.t * 6 - L.viewW / 2, CLOUDS)}px,0,0)`
    shift('far', PARALLAX.far, FAR)
    shift('canal', 1, CANAL)
    shift('nearPosts', 1, CANAL)
    shift('frontPosts', 1, CANAL)
    shift('fore', PARALLAX.foreground, FORE)
    for (const [name, factor] of [['waveBack', PARALLAX.waterBack], ['waveFront', PARALLAX.waterFront]] as const) {
      const el = layers.current[name]
      if (el) el.style.backgroundPosition = `${-mod(s.cam * factor + s.t * (name === 'waveBack' ? 8 : -5), 240)}px 0`
    }
    POSTS.forEach((_, i) => {
      for (const tile of postEls.current) {
        const el = tile[i]
        if (el) el.style.transform = `rotate(${s.posts[i].a}rad)`
      }
    })

    const depth = 0.93 + 0.12 * ((s.by - LANE.near) / (LANE.front - LANE.near))
    const tiltAccel = Math.max(-FEEL.maxTilt, Math.min(FEEL.maxTilt, s.accel * FEEL.tiltPerAccel * Math.sign(flip || 1)))
    const rock = Math.sin(s.t * 1.8) * FEEL.rock + Math.max(-4, Math.min(4, s.vy * 0.03))
    if (boatEl.current) {
      boatEl.current.style.transform = `translate3d(${screenX(s.bx)}px,${s.by + bob - hop}px,0) scale(${depth}) rotate(${-tiltAccel + rock}deg)`
      boatEl.current.style.zIndex = s.by < LANE_SPLIT ? '3' : '5'
    }
    if (hullEl.current) hullEl.current.style.transform = `scale(${flip * (1 + s.squash * 0.1)}, ${1 - s.squash * 0.1})`
    if (ringEl.current) ringEl.current.style.opacity = s.idle > 4 ? String(0.55 + 0.45 * Math.sin(s.t * 6)) : '0'
    if (friendEl.current) {
      const el = friendEl.current
      el.style.display = f.phase === 'none' ? 'none' : 'block'
      el.style.transform = `translate3d(${screenX(fx)}px,${fy}px,0) scale(${fScale})`
      // At the doorstep the friend is behind the near posts; in the boat, with the boat.
      el.style.zIndex = f.phase === 'waiting' || f.phase === 'inside' ? '1' : s.by < LANE_SPLIT ? '3' : '5'
    }
    // Where's the pink house? (A placeholder for gate 3's glowing hand.) Only while a friend rides and it's off screen.
    const pinkScreen = screenX(s.bx + wrap(doorX(PINK) - s.bx, CANAL))
    const showArrow = f.phase === 'riding' && (pinkScreen < 0 || pinkScreen > L.viewW)
    const pulse = 1 + 0.12 * Math.sin(s.t * 7)
    if (arrowL.current) arrowL.current.style.transform = `scale(${showArrow && pinkScreen < 0 ? pulse : 0})`
    if (arrowR.current) arrowR.current.style.transform = `scale(${showArrow && pinkScreen > L.viewW ? pulse : 0})`

    wakeEls.current.forEach((el, i) => {
      if (!el) return
      const p = s.wake[i]
      if (!p || p.age < 0) return void (el.style.opacity = '0')
      const k = p.age / p.life
      const size = p.size * (1 + 2.2 * k)
      el.style.opacity = String(0.8 * (1 - k))
      el.style.transform = `translate3d(${screenX(p.x) - 20}px,${p.y - 20}px,0) scale(${size / 40}, ${(size / 40) * 0.42})`
    })
    sprayEls.current.forEach((el, i) => {
      if (!el) return
      const p = s.spray[i]
      if (!p) return void (el.style.opacity = '0')
      el.style.opacity = String(1 - p.age / p.life)
      el.style.transform = `translate3d(${screenX(p.x) - 10}px,${p.y - 10}px,0) scale(${p.size / 20})`
    })

    setSwish(s.drag || speed > 40 ? speed / FEEL.maxSpeed : 0)

    // QA hook: where the boat is (canal x, lane y, speed) and the friend's phase.
    if (navigator.webdriver) (window as unknown as { __venice?: object }).__venice = { bx: s.bx, by: s.by, vx: s.vx, friend: f.phase, delivered: delivered }
  }, layout !== null)

  const L = layout
  return (
    <div
      ref={root}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onLostPointerCapture={onPointerUp}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', background: 'linear-gradient(#9FD8F2, #CDEBF7 55%, #FFE9F1)' }}
    >
      {L && (
        <div style={{ position: 'absolute', left: 0, top: L.waterTop, width: L.viewW, height: 0, transform: `scale(${L.s})`, transformOrigin: '0 0' }}>
          <Layer refFn={layerRef('clouds')} period={CLOUDS}>
            <Clouds top={-L.waterTop / L.s} />
          </Layer>
          <Layer refFn={layerRef('far')} period={FAR}>
            <div style={{ position: 'absolute', left: 0, top: -150, width: FAR, height: 160, background: '#DDBFD3' }} />
            <div style={{ position: 'absolute', left: 0, top: 0 }}>
              <Rooftops />
            </div>
          </Layer>
          {/* The water, with two bands of little waves that move at different speeds. */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: L.viewW, height: WATER_H + 400, background: 'linear-gradient(#5FB4D9, #4C9CCB 60%, #3F8BBE)', borderTop: `4px solid ${INK}` }} />
          <div ref={layerRef('waveBack')} style={{ ...waves, top: 34, height: 60, opacity: 0.45 }} />
          <div ref={layerRef('waveFront')} style={{ ...waves, top: 150, height: 120, backgroundSize: '240px 60px', opacity: 0.6 }} />
          <Layer refFn={layerRef('canal')} period={CANAL} z={1}>
            {HOUSES.map((h, i) => (
              <House key={i} house={h} lit={h.pink ? delivered : 0} doorOpen={h.pink ? pinkDoorOpen : false} />
            ))}
          </Layer>
          <Layer refFn={layerRef('nearPosts')} period={CANAL} z={2} tiles={(tile) => POSTS.map((p, i) => (p.lane === 'near' ? <Post key={i} x={p.x} lane={p.lane} postRef={(el) => void (postEls.current[tile][i] = el)} /> : null))} />
          {/* Wake rings sit on the water, under the boat. */}
          <div style={{ position: 'absolute', left: 0, top: 0, zIndex: 2, pointerEvents: 'none' }}>
            {Array.from({ length: WAKE_POOL }, (_, i) => (
              <div key={i} ref={(el) => void (wakeEls.current[i] = el)} style={{ position: 'absolute', left: 0, top: 0, width: 40, height: 40, borderRadius: '50%', border: '5px solid rgba(255,255,255,.95)', opacity: 0 }} />
            ))}
          </div>
          {/* The doorstep friend (a placeholder circle with eyes). */}
          <div ref={friendEl} style={{ position: 'absolute', left: 0, top: 0, display: 'none', zIndex: 1 }}>
            <button
              aria-label="friend"
              onClick={tapFriend}
              style={{ position: 'absolute', left: -FRIEND_R - 14, top: -FRIEND_R - 14, width: FRIEND_R * 2 + 28, height: FRIEND_R * 2 + 28, padding: 14, background: 'none', border: 'none' }}
            >
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: friendColor, border: `4px solid ${INK}`, position: 'relative' }}>
                <div style={{ position: 'absolute', left: '28%', top: '34%', width: 8, height: 12, borderRadius: 4, background: INK }} />
                <div style={{ position: 'absolute', right: '28%', top: '34%', width: 8, height: 12, borderRadius: 4, background: INK }} />
              </div>
            </button>
          </div>
          <Boat boatRef={boatEl} hullRef={hullEl} ringRef={ringEl} />
          <Layer refFn={layerRef('frontPosts')} period={CANAL} z={4} tiles={(tile) => POSTS.map((p, i) => (p.lane === 'front' ? <Post key={i} x={p.x} lane={p.lane} postRef={(el) => void (postEls.current[tile][i] = el)} /> : null))} />
          <div style={{ position: 'absolute', left: 0, top: 0, zIndex: 6, pointerEvents: 'none' }}>
            {Array.from({ length: SPRAY_POOL }, (_, i) => (
              <div key={i} ref={(el) => void (sprayEls.current[i] = el)} style={{ position: 'absolute', left: 0, top: 0, width: 20, height: 20, borderRadius: '50%', background: '#fff', opacity: 0 }} />
            ))}
          </div>
          <Layer refFn={layerRef('fore')} period={FORE} z={7}>
            <Foreground width={FORE} />
          </Layer>
          {/* Pink-house pointers at the screen edges (placeholders for gate 3's glowing left/right hands). */}
          {(['left', 'right'] as const).map((side) => (
            <div
              key={side}
              ref={side === 'left' ? arrowL : arrowR}
              style={{ position: 'absolute', zIndex: 8, top: LANE.near - 50, left: side === 'left' ? 8 : L.viewW - 108, width: 100, height: 100, transform: 'scale(0)', pointerEvents: 'none', display: 'grid', placeItems: 'center' }}
            >
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#FF8CC6', border: `5px solid ${INK}`, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 54, fontWeight: 700, lineHeight: 1 }}>{side === 'left' ? '‹' : '›'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const waves: CSSProperties = {
  position: 'absolute',
  left: 0,
  width: '100%',
  pointerEvents: 'none',
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60"><path d="M20 22 q20 -14 40 0 M140 44 q20 -14 40 0" fill="none" stroke="white" stroke-width="5" stroke-linecap="round"/></svg>')}")`,
  backgroundSize: '240px 60px',
  backgroundRepeat: 'repeat',
}

/** A parallax layer drawn twice (two tiles side by side), so shifting it by (camera × factor) mod period never shows a gap. */
function Layer({ refFn, period, z = 0, children, tiles }: { refFn: (el: HTMLDivElement | null) => void; period: number; z?: number; children?: ReactNode; tiles?: (tile: number) => ReactNode }) {
  return (
    <div ref={refFn} style={{ position: 'absolute', left: 0, top: 0, zIndex: z, pointerEvents: 'none', willChange: 'transform' }}>
      {[0, 1].map((tile) => (
        <div key={tile} style={{ position: 'absolute', left: tile * period, top: 0, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>{tiles ? tiles(tile) : children}</div>
        </div>
      ))}
    </div>
  )
}

/** The placeholder boat: a brown gondola shape with a tall prow at the front (the right side, before flipping). */
function Boat({ boatRef, hullRef, ringRef }: { boatRef: RefObject<HTMLDivElement | null>; hullRef: RefObject<HTMLDivElement | null>; ringRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={boatRef} aria-label="gondola" style={{ position: 'absolute', left: 0, top: 0, zIndex: 5, touchAction: 'none', width: 1, height: 1, transformOrigin: '0 0' }}>
      {/* "Grab me" ring: pulses when she hasn't touched the boat for a few seconds. */}
      <div ref={ringRef} style={{ position: 'absolute', left: -BOAT.halfLength - 34, top: -96, width: BOAT.halfLength * 2 + 68, height: 150, borderRadius: '50%', border: '7px solid #FFC83D', boxShadow: '0 0 24px #FFC83D', opacity: 0, pointerEvents: 'none' }} />
      <div ref={hullRef} style={{ position: 'absolute', left: -BOAT.length / 2, top: -80 * BOAT.scale, width: BOAT.length, height: 100 * BOAT.scale, transformOrigin: '50% 80%' }}>
        <svg viewBox="0 0 230 100" width={BOAT.length} height={100 * BOAT.scale} style={{ overflow: 'visible', display: 'block' }}>
          {/* stern curl (left) and tall prow (right) */}
          <path d="M14 58 Q4 40 16 30" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <path d="M210 58 Q228 30 214 6" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <path d="M210 58 Q228 30 214 6" fill="none" stroke="#B27446" strokeWidth={4} strokeLinecap="round" />
          <path d="M8 52 Q30 84 115 86 Q198 84 222 50 Q160 64 115 64 Q60 64 8 52 Z" fill="#A0673F" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M28 66 Q115 80 204 64" fill="none" stroke="#7A4A2A" strokeWidth={4} strokeLinecap="round" />
          {/* seat */}
          <rect x={92} y={54} width={46} height={14} rx={5} fill="#C98B5B" stroke={INK} strokeWidth={4} />
        </svg>
      </div>
    </div>
  )
}

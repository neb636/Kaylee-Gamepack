// 🛶 Venice: Gino's Water Taxi (plan: planning/around-the-world/italy.md § 6).
// The toy (one core verb): put a finger on the boat and drive it along a canal that loops both ways. It chases the
// finger with a little water lag, coasts and slows when let go, bobs and tilts, spins round happily when it turns, rides
// in two lanes, boings off posts and leaves a wake. The same verb deepens three times:
//   1. Cruise: just the toy (and lots to poke: houses, pigeons, the lion, bell towers, ducks, passing boats).
//   2. Water taxi: friends wave from doorsteps; drive close and they hop in, say where they're going ("the yellow house")
//      and Sparkle says LEFT or RIGHT (a hand glows on that side). She drives there herself. 3 rides, each farther away;
//      the second time two friends wave at once and she picks who goes first.
//   3. Acqua alta: the water rises, so the bridges get low. Tap the boat to duck; if not, Gino's hat bonks off and
//      floats behind (drive back to scoop it up). Last ride: Gino to the mask shop.
// Side verb: paint a mirror mask (MaskShop). Payoff: one lantern per friend delivered while the sky turns to evening,
// then night, fireworks, the friends wave from the walkway and Gino plays his accordion for Lupa's band.
// All feel numbers are in canal.ts (FEEL). Everything per-frame is written straight to the DOM from one game loop.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode, type RefObject } from 'react'
import { burst, say, sounds, SparklePuppet, useGameLoop, useSaved, type Line, type PuppetHandle } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { PromptBubble } from '../../../../kit/Stage'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art as italyArt } from '../../art'
import { L as LINES } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Cesare } from '../../puppets/Cesare'
import { Civetta } from '../../puppets/Civetta'
import { Gino, GinoHat } from '../../puppets/Gino'
import { INK } from '../../puppets/ink'
import { Lupa } from '../../puppets/Lupa'
import { Spina } from '../../puppets/Spina'
import { BOAT_FEEL, BOAT_ORDER, BOATS, critters, TRAFFIC, ui, type BoatKind, type TrafficKind } from './art'
import { BOAT, CANAL, CLOUDS, doorX, DUCK_HOME, FAR, FEEL, FORE, HOUSES, LANE, LANE_SPLIT, MAIN_BRIDGES, MASKSHOP, mod, PARALLAX, PINK, POSTS, STAGE, TIDE, WATER_H, wrap } from './canal'
import { MaskShop, MaskView, type MaskData } from './MaskShop'
import { Clouds, Foreground, House, MainBridges, Post, SideCanals, Skyline } from './Scenery'
import { vsfx } from './sfx'
import { setSwish, startSwish, stopSwish } from './swish'

const V = LINES.venice
/** Stars: three rides, reaching the mask shop, the mask. */
const TOTAL = 5
const RIDES = 3
const WAKE_POOL = 48
const SPRAY_POOL = 24
/** The friends who wait on doorsteps (their puppets from the other activities). */
const FRIENDS = [
  { id: 'lupa', Puppet: Lupa, face: italyArt.lupa },
  { id: 'spina', Puppet: Spina, face: italyArt.spina },
  { id: 'cesare', Puppet: Cesare, face: italyArt.cesare },
  { id: 'civetta', Puppet: Civetta, face: italyArt.civetta },
] as const
type FriendId = (typeof FRIENDS)[number]['id']
/** Heights (canal units) of the riders and of a doorstep friend. */
const RIDER = { gino: 150, sparkle: 92, friend: 104 }
/** Sky colors, from noon to night (one step per lantern). */
const SKIES = ['linear-gradient(#9FD8F2, #CDEBF7 55%, #FFE9F1)', 'linear-gradient(#A8D4F0, #F3E2E8 60%, #FFE2C8)', 'linear-gradient(#B9C4EE, #F8CFD9 55%, #FFD2A8)', 'linear-gradient(#8F8FD8, #E7A9C8 55%, #FFC29A)', 'linear-gradient(#2E3266, #5A4A8E 60%, #A3679B)']

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

type Stage = 'story' | 'pick' | 'play' | 'mask' | 'finale'
type ActorPhase = 'none' | 'waiting' | 'hopIn' | 'riding' | 'hopOut' | 'inside'
interface Actor {
  kind: number
  phase: ActorPhase
  house: number
  /** The door it hops out at (any house of the target's color). */
  outDoor: number
  t: number
  fromX: number
  fromY: number
  tap: number
}
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
  const stageW = W > H ? STAGE.wideW : H / W > 1.7 ? STAGE.phoneW : STAGE.tallW
  const s = Math.min(W / stageW, H / STAGE.minH)
  return { W, H, s, viewW: W / s, waterTop: H - WATER_H * s }
}

const shuffled = <T,>(a: readonly T[]) => [...a].sort(() => Math.random() - 0.5)

export function Venice({ onDone, setProgress }: ActivityProps) {
  const root = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<Layout | null>(null)
  const [stage, setStage] = useState<Stage>('story')
  const [boat, setBoat] = useState<BoatKind>('gondola')
  const boatRef = useRef<BoatKind>('gondola')
  boatRef.current = boat
  const [kinds, setKinds] = useState<[number, number]>([0, 1])
  const [stars, setStars] = useState(0)
  const [lanterns, setLanterns] = useState(0)
  const [high, setHigh] = useState(false)
  const [gino, setGino] = useState({ hatOff: false, ducking: false, dizzy: false, singing: false })
  const [delivered, setDelivered] = useState<number[]>([])
  const [mask, setMask] = useSaved<MaskData | null>('italy:venice-mask', null)
  const [trafficKind, setTrafficKind] = useState<TrafficKind>('vaporetto')
  const [spraying, setSpraying] = useState(false)
  const [extraBridges, setExtraBridges] = useState<{ x: number; w: number }[]>([])
  useEffect(() => setProgress(Math.min(stars, TOTAL), TOTAL), [stars])
  const rowRef = useRef(0)
  const ginoRef = useRef<PuppetHandle>(null)
  const sparkleRef = useRef<PuppetHandle>(null)
  const actorRefs = useRef<(PuppetHandle | null)[]>([])

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
  const order = useRef(shuffled([0, 1, 2, 3]))
  const g = useRef({
    t: 0,
    bx: 360,
    by: LANE.near as number,
    vx: 0,
    vy: 0,
    accel: 0,
    facing: 1,
    spin: -1, // seconds into the turnaround spin, or -1
    spinFrom: 1,
    spins: [] as number[],
    squash: 0,
    squashV: 0,
    stun: 0,
    bumpCooldown: 0,
    bumps: 0,
    dodge: 0,
    lastBump: -9,
    lastPost: -1,
    cam: 360,
    drag: null as null | { id: number; fx: number; fy: number; gx: number; gy: number; x0: number; y0: number; at: number },
    idle: 3, // seconds without a touch (the boat pulses after a few)
    travelled: 0,
    sinceWake: 0,
    wakeFlip: 1,
    wake: [] as Particle[],
    spray: [] as Particle[],
    posts: POSTS.map(() => ({ a: 0, w: 0 })),
    // The director
    stage: 'story' as Stage,
    playT: 0,
    rides: 0,
    actors: [0, 1].map((): Actor => ({ kind: 0, phase: 'none', house: -1, outDoor: -1, t: 0, fromX: 0, fromY: 0, tap: -1 })),
    rider: -1, // actor slot riding, or -1
    target: -1, // house index she's driving to, or -1
    lastSide: 0,
    minDist: 0,
    otherWays: 0,
    closeHinted: false,
    nearT: 0,
    pickNearT: 0,
    handAt: 0,
    spawnAt: -1, // playT when the next friend(s) appear
    tide: -1, // seconds since the tide started rising, or -1
    tideY: 0,
    maskTrip: false,
    duckT: 0,
    duckHinted: false,
    duckHintAt: 0,
    bridges: MAIN_BRIDGES.map((b) => ({ ...b, passed: false })),
    slowBridge: true, // the first low bridge slows the boat down so she has time to duck
    hat: { off: false, x: 0, y: 0, at: 0, armed: false },
    fastT: 0,
    lastTalk: -99,
    pending: 0,
    cool: {} as Record<string, number>,
    traffic: { active: false, x: 0, dir: 1, next: 14 },
    ducks: [0, 1, 2].map((i) => ({ x: DUCK_HOME - i * 70, dive: -1 })),
  })
  const layoutRef = useRef<Layout | null>(null)
  layoutRef.current = layout
  const stateRef = useRef({ kinds, gino })
  stateRef.current = { kinds, gino }

  // ---- DOM handles written by the loop ----
  const layers = useRef<Record<string, HTMLDivElement | null>>({})
  const layerRef = (name: string) => (el: HTMLDivElement | null) => void (layers.current[name] = el)
  const boatEl = useRef<HTMLDivElement>(null)
  const hullEl = useRef<HTMLDivElement>(null)
  const ringEl = useRef<HTMLDivElement>(null)
  const actorEls = useRef<(HTMLDivElement | null)[]>([])
  const handL = useRef<HTMLDivElement>(null)
  const handR = useRef<HTMLDivElement>(null)
  const chipEls = useRef<(HTMLDivElement | null)[]>([])
  const markerEl = useRef<HTMLDivElement>(null)
  const hatEl = useRef<HTMLDivElement>(null)
  const trafficEl = useRef<HTMLDivElement>(null)
  const duckEls = useRef<(HTMLDivElement | null)[]>([])
  const wakeEls = useRef<(HTMLDivElement | null)[]>([])
  const sprayEls = useRef<(HTMLDivElement | null)[]>([])
  const postEls = useRef<(HTMLDivElement | null)[][]>([[], []])

  const spawn = (list: Particle[], max: number, p: Particle) => {
    if (list.length >= max) list.shift()
    list.push(p)
  }
  /** An instruction or story line: always queued after whatever is being said, so nothing important gets cut off. */
  const talk = (line: Line, _queue = true) => {
    const s = g.current
    s.lastTalk = s.t
    s.pending++
    void say(line, { interrupt: false }).finally(() => (s.pending = Math.max(0, s.pending - 1)))
  }
  /** A reaction ("Wheee!", "Boing!"): only when nobody is talking, so it never pushes out an instruction. */
  const react = (line: Line) => {
    if (g.current.pending > 0) return false
    talk(line)
    return true
  }
  /** True at most once per `secs` for this key. */
  const cooled = (key: string, secs: number) => {
    const s = g.current
    if ((s.cool[key] ?? -99) > s.t - secs) return false
    s.cool[key] = s.t
    return true
  }

  /** Screen point (px, relative to the stage) → canal coordinates. */
  const toCanal = (L: Layout, px: number, py: number) => ({ x: g.current.cam + px / L.s - L.viewW / 2, y: (py - L.waterTop) / L.s - g.current.tideY })

  const onPointerDown = (e: PointerEvent) => {
    const L = layoutRef.current
    const s = g.current
    // The boat wins over a house behind it; buttons on top (friends, pokeables, passing boats) keep their own taps.
    if (!L || s.stage !== 'play') return
    // A second finger anywhere while she drives: duck (at high water).
    if (s.drag) {
      if (s.tide >= 0 && e.pointerId !== s.drag.id) duck()
      return
    }
    const target = e.target as HTMLElement
    if (target.closest('[data-own-tap]')) return
    const onButton = !!target.closest('button, [role="button"]')
    const r = root.current!.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    const p = toCanal(L, px, py)
    const dx = p.x - s.bx
    const dy = p.y - (s.by - 40)
    // Generous grab area around the boat and its riders (at least ~70px on small screens).
    const rx = Math.max(BOAT.halfLength + 50, 70 / L.s)
    const ry = Math.max(115, 70 / L.s)
    if ((dx / rx) ** 2 + (dy / ry) ** 2 < 1) {
      // Captured by the stage, so the house underneath never gets the click.
      e.stopPropagation()
      root.current!.setPointerCapture(e.pointerId)
      s.drag = { id: e.pointerId, fx: px, fy: py, gx: dx, gy: p.y - s.by, x0: px, y0: py, at: performance.now() }
      s.idle = 0
      startSwish()
      sfx.fwip()
    } else if (!onButton && p.y > 8) {
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
    const s = g.current
    const d = s.drag
    if (d?.id !== e.pointerId) return
    s.drag = null
    // A quick tap on the boat (no drag): at high water Gino ducks; otherwise he giggles.
    if (e.type === 'pointerup' && performance.now() - d.at < 450 && Math.hypot(d.fx - d.x0, d.fy - d.y0) < 30) {
      if (s.tide >= 0) duck()
      else {
        void ginoRef.current?.play('giggle')
        if (cooled('tickle', 6)) react(V.tickle)
      }
    }
  }

  const duck = () => {
    const s = g.current
    if (s.duckT > 0.3) return
    s.duckT = 1.8
    sounds.whoosh()
  }
  const tapActor = (slot: number) => {
    const a = g.current.actors[slot]
    if (a.phase === 'waiting' || a.phase === 'riding') {
      a.tap = 0
      sfx.chirp()
      if (cooled(`hello${slot}`, 6) && a.phase === 'waiting') react(V.hello[FRIENDS[a.kind].id as FriendId])
    }
  }
  const tapTraffic = () => {
    if (trafficKind === 'vaporetto') vsfx.toot()
    else if (trafficKind === 'ambulance') {
      vsfx.siren()
      if (cooled('ambulance', 60)) react(V.ambulance)
    } else {
      setSpraying(true)
      sfx.splash()
      setTimeout(() => setSpraying(false), 1600)
    }
  }
  const tapDuck = (i: number) => {
    g.current.ducks[i].dive = 0
    vsfx.quack()
  }

  // ---- The director's moments (called from the loop) ----
  /** Puts a friend on a doorstep `min`-`max` units away (side: -1 left, 1 right, 0 either). */
  const placeFriend = (slot: number, kind: number, min: number, max: number, side: number) => {
    const s = g.current
    const taken = s.actors.filter((a) => a.phase !== 'none').map((a) => a.house)
    const ok = (i: number, lo: number, hi: number) => {
      const d = wrap(doorX(i) - s.bx, CANAL)
      return i !== PINK && i !== MASKSHOP && !taken.includes(i) && Math.abs(d) > lo && Math.abs(d) < hi && (side === 0 || Math.sign(d) === side)
    }
    let options = HOUSES.map((_, i) => i).filter((i) => ok(i, min, max))
    if (!options.length) options = HOUSES.map((_, i) => i).filter((i) => ok(i, 200, 2000))
    if (!options.length) options = HOUSES.map((_, i) => i).filter((i) => i !== PINK && i !== MASKSHOP && !taken.includes(i))
    const a = s.actors[slot]
    a.house = options[Math.floor(Math.random() * options.length)]
    a.kind = kind
    a.phase = 'waiting'
    a.t = 0
    setKinds((k) => (slot === 0 ? [kind, k[1]] : [k[0], kind]))
  }
  /** Picks where the friend in the boat wants to go: on screen, then just off screen, then the far pink house. */
  const chooseTarget = (fromHouse: number) => {
    const s = g.current
    // The last ride is far away (she only hears LEFT or RIGHT): the pink house if it's far enough, or another far house.
    const far = s.rides >= RIDES - 1
    if (far && Math.abs(wrap(doorX(PINK) - s.bx, CANAL)) > 1300) return PINK
    const [lo, hi] = s.rides === 0 ? [320, 640] : s.rides === 1 ? [760, 1400] : [1400, CANAL / 2]
    const from = HOUSES[fromHouse].facade
    const good = (i: number, side: number) => {
      const d = wrap(doorX(i) - s.bx, CANAL)
      // Any house of that color counts as arriving, so no house of that color may be closer than the planned distance.
      const twinsFar = HOUSES.every((h, j) => h.facade !== HOUSES[i].facade || Math.abs(wrap(doorX(j) - s.bx, CANAL)) >= Math.abs(d))
      return i !== MASKSHOP && (far || i !== PINK) && HOUSES[i].facade !== from && twinsFar && Math.abs(d) > lo && Math.abs(d) < hi && (side === 0 || Math.sign(d) === side)
    }
    // Ride 2 goes the other way from ride 1 if it can (so she uses both LEFT and RIGHT).
    for (const side of [-s.lastSide, 0]) {
      const options = HOUSES.map((_, i) => i).filter((i) => good(i, side))
      if (options.length) return options[Math.floor(Math.random() * options.length)]
    }
    return HOUSES.map((_, i) => i).find((i) => i !== PINK && i !== MASKSHOP && HOUSES[i].facade !== from) ?? PINK
  }
  const sayDirection = (target: number, queue: boolean) => {
    const s = g.current
    const side = Math.sign(wrap(doorX(target) - s.bx, CANAL)) || 1
    s.lastSide = side
    talk(side < 0 ? V.left : V.right, queue)
    if (s.rider >= 0) setTimeout(() => void actorRefs.current[s.rider]?.play('wave'), 1200)
    // From the far ride on, the glowing hand waits a few seconds: she goes by the word LEFT or RIGHT first.
    s.handAt = s.t + (s.rides >= RIDES - 1 || s.maskTrip ? 4.5 : 0)
  }
  const startRide = (slot: number) => {
    const s = g.current
    const a = s.actors[slot]
    s.rider = slot
    s.target = chooseTarget(a.house)
    s.minDist = Math.abs(wrap(doorX(s.target) - s.bx, CANAL))
    s.otherWays = 0
    s.closeHinted = false
    const id = FRIENDS[a.kind].id as FriendId
    talk(V.dest[id][HOUSES[s.target].facade as keyof (typeof V.dest)['lupa']])
    sayDirection(s.target, true)
  }
  const finishRide = (slot: number) => {
    const s = g.current
    const a = s.actors[slot]
    s.rides++
    s.rider = -1
    s.target = -1
    void ginoRef.current?.play('cheer')
    void sparkleRef.current?.play('cheer')
    setStars((n) => n + 1)
    setLanterns((n) => n + 1)
    setDelivered((d) => [...d, a.kind])
    if (s.rides === 1) talk(V.lantern, true)
    s.spawnAt = s.playT + 2.2
  }
  const startTide = () => {
    const s = g.current
    s.tide = 0
    setHigh(true)
    vsfx.bloop()
    talk(V.tide)
  }
  const startMaskTrip = () => {
    const s = g.current
    s.maskTrip = true
    s.target = MASKSHOP
    s.minDist = Math.abs(wrap(doorX(MASKSHOP) - s.bx, CANAL))
    s.otherWays = 0
    // At least two low bridges on the way (ducking needs practice): add temporary ones off screen if the path is short of them.
    const L = layoutRef.current
    const dir = Math.sign(wrap(doorX(MASKSHOP) - s.bx, CANAL)) || 1
    const len = Math.abs(wrap(doorX(MASKSHOP) - s.bx, CANAL))
    const along = (x: number) => wrap(x - s.bx, CANAL) * dir
    const extra: { x: number; w: number }[] = []
    let count = s.bridges.filter((b) => along(b.x) > 0 && along(b.x) < len - 250).length
    for (let p = (L ? L.viewW / 2 : 600) + 450; count < 2 && p < len - 450; p += 120) {
      const x = mod(s.bx + dir * p, CANAL)
      if ([...s.bridges, ...extra].some((b) => Math.abs(wrap(b.x - x, CANAL)) < 1000)) continue
      extra.push({ x, w: 950 })
      count++
    }
    s.bridges.push(...extra.map((b) => ({ ...b, passed: false })))
    setExtraBridges(extra)
    talk(V.maskTrip)
    sayDirection(MASKSHOP, true)
  }
  const reachMaskShop = () => {
    const s = g.current
    s.target = -1
    s.maskTrip = false
    s.drag = null
    s.stage = 'mask'
    setStage('mask')
    setStars((n) => n + 1)
    setLanterns((n) => n + 1)
    talk(V.maskArrive)
  }

  // QA hook: jump straight to a moment (screens), and read where the boat is.
  useEffect(() => {
    if (!navigator.webdriver) return
    const w = window as unknown as { __veniceQA?: { jump: (to: string) => void } }
    w.__veniceQA = {
      jump: (to: string) => {
        const s = g.current
        if (to === 'pick') return void ((s.stage = 'pick'), setStage('pick'))
        s.stage = 'play'
        setStage('play')
        if (to === 'ride') {
          placeFriend(0, order.current[0], 100, 200, 1)
          s.actors[0].phase = 'riding'
          startRide(0)
        } else if (to === 'tide') {
          s.rides = RIDES
          setLanterns(RIDES)
          startTide()
        } else if (to === 'mask') reachMaskShop()
        else if (to === 'finale') {
          setDelivered(order.current.slice(0, 3))
          setLanterns(4)
          s.stage = 'finale'
          setStage('finale')
        }
      },
    }
    return () => void delete w.__veniceQA
  }, [])

  useGameLoop((dt) => {
    const L = layoutRef.current
    // Two frames can share a timestamp (dt = 0): skip it, or the tilt filter divides by zero and the NaN sticks forever.
    if (!L || dt <= 0) return
    const s = g.current
    s.t += dt
    const prevVx = s.vx
    let pull = 0 // which way her finger is pulling (-1, 0, 1)
    const playing = s.stage === 'play'
    if (playing) s.playT += dt

    // ---- The boat: chase the finger, or coast ----
    if (s.drag) {
      const p = toCanal(L, s.drag.fx, s.drag.fy)
      const tx = p.x - s.drag.gx
      pull = Math.abs(tx - s.bx) > 40 ? Math.sign(tx - s.bx) : 0
      const ty = Math.min(LANE.front, Math.max(LANE.near, p.y - s.drag.gy))
      const k = FEEL.followK * (s.stun > 0 ? 0.15 : 1)
      s.vx += (k * (tx - s.bx) - FEEL.followDamp * s.vx) * dt
      // While dodging round a post, the finger's up/down is ignored and the water barely slows the sideways slide.
      if (s.dodge > 0) s.vy *= Math.exp(-1.5 * dt)
      else s.vy += (FEEL.laneFollowK * (ty - s.by) - 2 * Math.sqrt(FEEL.laneFollowK) * 0.9 * s.vy) * dt
    } else {
      s.vx *= Math.exp(-FEEL.coastDrag * BOAT_FEEL[boatRef.current].drag * dt)
      const lane = s.by < LANE_SPLIT ? LANE.near : LANE.front
      s.vy += (FEEL.laneSettleK * (lane - s.by) - 2 * Math.sqrt(FEEL.laneSettleK) * 0.8 * s.vy) * dt
      if (playing) s.idle += dt
    }
    const handling = BOAT_FEEL[boatRef.current]
    s.vx = Math.max(-FEEL.maxSpeed * handling.speed, Math.min(FEEL.maxSpeed * handling.speed, s.vx))
    s.bx += s.vx * dt
    s.by += s.vy * dt
    s.by = Math.max(LANE.near - 14, Math.min(LANE.front + 14, s.by))
    s.stun -= dt
    s.dodge -= dt
    s.bumpCooldown -= dt
    const speed = Math.abs(s.vx)
    s.travelled += speed * dt
    s.accel += ((s.vx - prevVx) / dt - s.accel) * Math.min(1, dt * 10)
    rowRef.current = Math.min(1, speed / FEEL.maxSpeed + (s.drag ? 0.15 : 0))

    // ---- Mooring posts: boing off them with a wobble ----
    POSTS.forEach((post, i) => {
      const dx = wrap(s.bx - post.x, CANAL)
      const dy = s.by - LANE[post.lane]
      const reachX = BOAT.halfLength * FEEL.postHitLength + 12
      const reachY = FEEL.postHitDepth
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
      if (impact > 50 && s.bumpCooldown <= 0 && s.dodge <= 0) {
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
        if (impact > 300 && Math.random() < 0.4 && cooled('boing', 10)) react(V.boing)
      }
    })
    for (const p of s.posts) {
      p.w += (-140 * p.a - 5 * p.w) * dt
      p.a += p.w * dt
    }

    // ---- Turning round: a happy spin with a hop (three in a row and Gino gets dizzy) ----
    const turning = s.vx * s.facing < -FEEL.turnSpeed && (!s.drag || pull * s.facing < 0) && s.t - s.lastBump > FEEL.turnAfterBump
    if (turning && s.spin < 0) {
      s.spinFrom = s.facing
      s.facing = -s.facing
      s.spin = 0
      sounds.whoosh()
      for (let i = 0; i < 4; i++) spawn(s.wake, WAKE_POOL, { x: s.bx + (i - 1.5) * 50, y: s.by + 18, vx: 0, vy: 0, age: -i * 0.05, life: 1, size: 36 })
      s.spins = [...s.spins.filter((t) => t > s.t - 6), s.t]
      if (s.spins.length >= 3 && cooled('dizzy', 15)) {
        setGino((v) => ({ ...v, dizzy: true }))
        setTimeout(() => setGino((v) => ({ ...v, dizzy: false })), 2600)
        react(V.dizzy)
      }
    }
    let flip = s.facing
    let hop = 0
    if (s.spin >= 0) {
      s.spin += dt
      const p = Math.min(1, s.spin / FEEL.spinTime)
      const c = Math.cos(FEEL.spinHalfTurns * Math.PI * p)
      flip = s.spinFrom * Math.sign(c || -1) * Math.max(FEEL.spinMinWidth, Math.abs(c))
      hop = Math.sin(Math.PI * p) * FEEL.spinHop
      if (p >= 1) {
        s.spin = -1
        s.squashV += 3 // lands with a squash
        sfx.splash()
      }
    }

    // ---- Squash (bumps, a friend landing) ----
    s.squashV += (-320 * s.squash - 12 * s.squashV) * dt
    s.squash += s.squashV * dt

    // ---- Going fast: spray, and Gino sings "Wheee!" ----
    s.fastT = speed > 760 ? s.fastT + dt : 0
    if (s.fastT > 0.8 && cooled('wheee', 14)) {
      react(V.wheee)
      setGino((v) => ({ ...v, singing: true }))
      setTimeout(() => setGino((v) => ({ ...v, singing: false })), 2500)
    }

    // ---- Wake and spray ----
    s.sinceWake += speed * dt
    if (s.sinceWake > FEEL.wakeEvery && speed > 30) {
      s.sinceWake = 0
      s.wakeFlip = -s.wakeFlip
      const stern = s.bx - Math.sign(s.vx) * BOAT.halfLength * 0.8
      spawn(s.wake, WAKE_POOL, { x: stern, y: s.by + 6 + s.wakeFlip * 7, vx: 0, vy: s.wakeFlip * 30, age: 0, life: FEEL.wakeLife, size: 18 + speed * 0.025 })
    }
    if (speed > FEEL.sprayAbove && Math.random() < ((speed - FEEL.sprayAbove) / 300) * dt * 30) {
      const dir = Math.sign(s.vx)
      spawn(s.spray, SPRAY_POOL, { x: s.bx + dir * BOAT.halfLength * 0.9, y: s.by, vx: dir * (speed * 0.25 + Math.random() * 80), vy: -220 - Math.random() * 220, age: 0, life: 0.65, size: 9 + Math.random() * 9 })
    }
    for (const p of s.wake) {
      p.age += dt
      p.y += p.vy * dt
    }
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
    const onScreen = (x: number) => Math.abs(wrap(x - s.cam, CANAL)) < L.viewW / 2 - 60

    // ---- The tide (acqua alta): the water rises, the bridges get low ----
    if (s.tide >= 0) {
      s.tide += dt
      const k = Math.min(1, s.tide / 3)
      s.tideY = -TIDE * (k * k * (3 - 2 * k))
      if (s.tide > 4.6 && !s.maskTrip && s.target < 0 && s.stage === 'play') startMaskTrip()
    }
    const highWater = s.tide >= 0
    s.duckT -= dt
    const ducking = s.duckT > 0
    if (ducking !== stateRef.current.gino.ducking) setGino((v) => ({ ...v, ducking }))
    let approaching = false
    if (highWater && playing) {
      s.bridges.forEach((b) => {
        const dx = wrap(s.bx - b.x, CANAL)
        if (Math.abs(dx) > b.w * 0.6) b.passed = false
        // A low bridge is coming (on screen, ahead): the ring pulses and, the first time, Sparkle says to duck.
        const ahead = Math.abs(dx) < L.viewW / 2 + 150 && Math.abs(dx) > b.w * 0.1 && Math.sign(dx) === -Math.sign(s.vx || s.facing)
        if (ahead && !b.passed) {
          approaching = true
          if (!s.duckHinted) {
            s.duckHinted = true
            s.duckHintAt = s.t
            talk(V.duck)
            void ginoRef.current?.play('nod')
          }
          // The first time, the water slows the boat right down so there's time to tap.
          if (s.slowBridge && !ducking) s.vx = Math.max(-260, Math.min(260, s.vx))
        }
        if (Math.abs(dx) < b.w * 0.1 && !b.passed) {
          b.passed = true
          // No bonk before she's been told how to duck (and had a moment to try).
          if (!s.duckHinted || s.t - s.duckHintAt < 2.5) {
            if (!s.duckHinted) ((s.duckHinted = true), (s.duckHintAt = s.t), talk(V.duck))
            return
          }
          s.slowBridge = false
          if (ducking) {
            sounds.correct()
            return
          }
          // Under the crown of the arch without ducking: bonk! The hat flies off and floats behind (in front of the bridge).
          sfx.thump()
          void ginoRef.current?.play('bonk')
          if (!s.hat.off) {
            s.hat = { off: true, x: s.bx - s.facing * 260, y: s.by + 40, at: s.t, armed: false }
            setGino((v) => ({ ...v, hatOff: true }))
            talk(V.bonk)
          }
        }
      })
    }
    // Scoop the floating hat back up by driving to it (once the boat has moved away from it); after a while a pigeon
    // brings it back anyway, so Gino is never hatless at the party.
    if (s.hat.off) {
      const hd = Math.abs(wrap(s.hat.x - s.bx, CANAL))
      if (hd > 200) s.hat.armed = true
      if ((s.hat.armed && hd < 140) || s.t - s.hat.at > 14) {
        s.hat.off = false
        setGino((v) => ({ ...v, hatOff: false }))
        sounds.sparkle()
        talk(V.hatBack)
      }
    }

    // ---- Friends on doorsteps and in the boat ----
    const bob = Math.sin(s.t * FEEL.bobSpeed) * FEEL.bob + Math.sin(s.t * 1.3) * FEEL.bob * 0.4
    const seat = { x: s.bx - 8 * s.facing, y: s.by - 12 + bob - hop }
    const canBoard = s.by < LANE_SPLIT || speed < FEEL.frontBoardSpeed
    // When to put friends out: the first after a little cruising, then after each ride.
    if (playing && s.rides < RIDES && s.rider < 0 && s.actors.every((a) => a.phase === 'none' || a.phase === 'inside')) {
      if (s.spawnAt < 0 && s.rides === 0 && (s.playT > 10 || s.travelled > 1300)) s.spawnAt = s.playT
      if (s.spawnAt >= 0 && s.playT >= s.spawnAt) {
        s.spawnAt = -1
        if (s.rides === 0) {
          placeFriend(0, order.current[0], 320, 700, s.facing)
          talk(V.firstFriend)
        } else if (s.rides === 1) {
          // Two friends wave at once, one each way: she picks who goes first.
          placeFriend(0, order.current[1], 380, 900, -1)
          placeFriend(1, order.current[2], 380, 900, 1)
          talk(V.twoFriends)
        }
      }
    }
    if (playing && s.rides >= RIDES && s.tide < 0 && s.rider < 0 && s.spawnAt >= 0 && s.playT >= s.spawnAt) {
      s.spawnAt = -1
      startTide()
    }
    s.actors.forEach((a, slot) => {
      a.t += dt
      if (a.tap >= 0) a.tap += dt
      if (a.tap > 0.5) a.tap = -1
      const tapHop = a.tap >= 0 ? Math.sin(Math.PI * (a.tap / 0.5)) * 40 : 0
      let fx = 0
      let fy = 0
      let fScale = 1
      if (a.phase === 'waiting') {
        const door = s.bx + wrap(doorX(a.house) - s.bx, CANAL)
        const close = Math.abs(door - s.bx) < 700
        fx = door
        fy = -4 - Math.abs(Math.sin(a.t * (close ? 7 : 3))) * (close ? 22 : 8) - tapHop
        fScale = Math.min(1, a.t / 0.3) // pops out of the door
        // Zooming past a waiting friend in the front lane for a while: the same hint as at drop-offs.
        if (Math.abs(door - s.bx) < FEEL.doorReach && !canBoard) {
          s.pickNearT += dt
          if (s.pickNearT > 1.5 && cooled('pickHint', 20)) talk(V.driveClose)
        } else if (Math.abs(door - s.bx) > FEEL.doorReach * 2) s.pickNearT = 0
        if (playing && s.rider < 0 && s.target < 0 && Math.abs(door - s.bx) < FEEL.doorReach && canBoard) {
          a.phase = 'hopIn'
          a.t = 0
          a.fromX = fx
          a.fromY = fy
          s.rider = slot
          sfx.boing()
        }
      } else if (a.phase === 'hopIn' || a.phase === 'hopOut') {
        const p = Math.min(1, a.t / 0.5)
        const to = a.phase === 'hopIn' ? seat : { x: s.bx + wrap(doorX(a.outDoor) - s.bx, CANAL), y: -4 }
        fx = a.fromX + (to.x - a.fromX) * p
        fy = a.fromY + (to.y - a.fromY) * p - Math.sin(Math.PI * p) * 120
        if (p >= 1) {
          if (a.phase === 'hopIn') {
            a.phase = 'riding'
            sfx.pop()
            s.squashV += 2.5
            startRide(slot)
          } else {
            a.phase = 'inside'
            void actorRefs.current[slot]?.play('cheer')
            sounds.correct()
            burst((screenX(fx) * L.s) / L.W, (L.waterTop + fy * L.s) / L.H)
            finishRide(slot)
          }
          a.t = 0
        }
      } else if (a.phase === 'riding') {
        fx = seat.x
        fy = seat.y - tapHop * 0.6
        // Arrived? Any house of the right color counts (there's no wrong one).
        const facade = HOUSES[s.target]?.facade
        const near = HOUSES.findIndex((h, i) => h.facade === facade && Math.abs(wrap(doorX(i) - s.bx, CANAL)) < FEEL.doorReach)
        if (near >= 0 && canBoard) {
          a.phase = 'hopOut'
          a.outDoor = near
          a.t = 0
          a.fromX = fx
          a.fromY = fy
          sfx.boing()
          talk(V.thanks[FRIENDS[a.kind].id as FriendId])
        } else if (near >= 0) {
          // Next to the door but zooming past in the front lane for a while: a hint.
          s.nearT += dt
          if (s.nearT > 1.5 && !s.closeHinted) {
            s.closeHinted = true
            talk(V.driveClose)
          }
        } else s.nearT = 0
      } else if (a.phase === 'inside') {
        fx = s.bx + wrap(doorX(a.outDoor) - s.bx, CANAL)
        fy = -4
        fScale = Math.max(0, 1 - Math.max(0, a.t - 1.3) / 0.4)
        if (a.t > 1.8) a.phase = 'none'
      }
      const el = actorEls.current[slot]
      if (el) {
        el.style.display = a.phase === 'none' ? 'none' : 'block'
        el.style.transform = `translate3d(${screenX(fx)}px,${fy + (a.phase === 'riding' || a.phase === 'hopIn' ? s.tideY : 0)}px,0) scale(${fScale})`
        // At the doorstep a friend is behind the near posts; in the boat, with the boat.
        el.style.zIndex = a.phase === 'waiting' || a.phase === 'inside' ? '1' : s.by < LANE_SPLIT ? '3' : '5'
      }
    })

    // ---- Wrong way? The friend giggles "Other way!" (nothing is wrong; there's more canal to enjoy) ----
    if (s.target >= 0 && playing) {
      const dist = Math.abs(wrap(doorX(s.target) - s.bx, CANAL))
      s.minDist = Math.min(s.minDist, dist)
      if (dist > s.minDist + 520 && s.otherWays < 3) {
        s.otherWays++
        s.minDist = dist
        const rider = s.rider >= 0 ? s.actors[s.rider] : null
        // A friend giggles "Other way!"; on Gino's trip to the mask shop, Sparkle just says the side again.
        if (rider) {
          talk(V.otherWay[FRIENDS[rider.kind].id as FriendId])
          void actorRefs.current[s.rider]?.play('hop')
        }
        else sayDirection(s.target, false)
      }
      // Reached the mask shop with Gino.
      if (s.maskTrip && Math.abs(wrap(doorX(MASKSHOP) - s.bx, CANAL)) < FEEL.doorReach && canBoard) reachMaskShop()
    }

    // ---- "Pull the boat!" when she hasn't moved it for a while ----
    if (playing && !s.drag && s.idle > 8 && s.t - s.lastTalk > 8 && cooled('stuck', 16)) talk(V.stuck)

    // ---- Passing boats in the back lane (a water bus, an ambulance, a fire boat) ----
    const tr = s.traffic
    if (playing) {
      if (!tr.active) {
        tr.next -= dt
        if (tr.next <= 0) {
          tr.active = true
          tr.dir = -s.facing || -1
          tr.x = s.cam - tr.dir * (L.viewW / 2 + 500)
          setTrafficKind(['vaporetto', 'ambulance', 'fireboat'][Math.floor(s.t / 7) % 3] as TrafficKind)
        }
      } else {
        tr.x += tr.dir * 230 * dt
        if (Math.abs(tr.x - s.cam) > L.viewW / 2 + 700) {
          tr.active = false
          tr.next = 16 + Math.random() * 12
        }
      }
    }

    // ---- The duck family: paddles after the boat when it goes slowly nearby ----
    const mama = s.ducks[0]
    const dBoat = wrap(s.bx - mama.x, CANAL)
    const follow = Math.abs(dBoat) < 650 && speed < 260
    const goal = follow ? mama.x + dBoat - s.facing * (BOAT.halfLength + 60) : mama.x + wrap(DUCK_HOME - mama.x, CANAL)
    mama.x += Math.max(-110, Math.min(110, (goal - mama.x) * 1.2)) * dt
    for (let i = 1; i < s.ducks.length; i++) {
      const d = s.ducks[i]
      const want = s.ducks[i - 1].x + wrap(-s.facing * 70, CANAL)
      d.x += Math.max(-130, Math.min(130, wrap(want - d.x, CANAL) * 2)) * dt
    }
    s.ducks.forEach((d, i) => {
      if (d.dive >= 0) d.dive += dt
      if (d.dive > 1.2) d.dive = -1
      const el = duckEls.current[i]
      if (!el) return
      const sink = d.dive >= 0 ? Math.sin(Math.PI * Math.min(1, d.dive / 1.2)) * 46 : 0
      el.style.transform = `translate3d(${screenX(s.bx + wrap(d.x - s.bx, CANAL))}px,${WATER_H - 66 + s.tideY * 0.2 + sink + Math.sin(s.t * 3 + i) * 2}px,0) scaleX(${follow ? -s.facing : 1})`
      el.style.opacity = String(1 - sink / 60)
    })

    // ---- Write it all to the DOM ----
    const shift = (name: string, factor: number, period: number) => {
      const el = layers.current[name]
      if (el) el.style.transform = `translate3d(${-mod(s.cam * factor - L.viewW / 2, period)}px,0,0)`
    }
    // Clouds also drift on their own.
    const cl = layers.current.clouds
    if (cl) cl.style.transform = `translate3d(${-mod(s.cam * PARALLAX.clouds + s.t * 6 - L.viewW / 2, CLOUDS)}px,0,0)`
    shift('far', PARALLAX.far, FAR)
    shift('canal', 1, CANAL)
    shift('nearPosts', 1, CANAL)
    shift('frontPosts', 1, CANAL)
    shift('bridge', 1, CANAL)
    shift('fore', PARALLAX.foreground, FORE)
    for (const [name, factor] of [['waveBack', PARALLAX.waterBack], ['waveFront', PARALLAX.waterFront]] as const) {
      const el = layers.current[name]
      if (el) el.style.backgroundPosition = `${-mod(s.cam * factor + s.t * (name === 'waveBack' ? 8 : -5), 240)}px 0`
    }
    const water = layers.current.water
    if (water) water.style.transform = `translate3d(0,${s.tideY}px,0)`
    POSTS.forEach((_, i) => {
      for (const tile of postEls.current) {
        const el = tile[i]
        if (el) el.style.transform = `rotate(${s.posts[i].a}rad)`
      }
    })

    const depth = 0.93 + 0.12 * ((s.by - LANE.near) / (LANE.front - LANE.near))
    const tiltAccel = Math.max(-FEEL.maxTilt, Math.min(FEEL.maxTilt, s.accel * FEEL.tiltPerAccel * Math.sign(flip || 1)))
    const rock = Math.sin(s.t * 1.8) * FEEL.rock * handling.rock + Math.max(-4, Math.min(4, s.vy * 0.03))
    if (boatEl.current) {
      boatEl.current.style.transform = `translate3d(${screenX(s.bx)}px,${s.by + bob - hop + s.tideY}px,0) scale(${depth}) rotate(${-tiltAccel + rock}deg)`
      boatEl.current.style.zIndex = s.by < LANE_SPLIT ? '3' : '5'
    }
    if (hullEl.current) hullEl.current.style.transform = `scale(${flip * (1 + s.squash * FEEL.squash)}, ${1 - s.squash * FEEL.squash})`
    // The ring pulses when she hasn't touched the boat for a while, or when a low bridge is coming (tap to duck).
    if (ringEl.current) ringEl.current.style.opacity = (s.idle > 4 && playing) || (approaching && !ducking) ? String(0.55 + 0.45 * Math.sin(s.t * 6)) : '0'
    if (hatEl.current) {
      hatEl.current.style.display = s.hat.off ? 'block' : 'none'
      hatEl.current.style.transform = `translate3d(${screenX(s.bx + wrap(s.hat.x - s.bx, CANAL))}px,${s.hat.y + s.tideY - 10 + Math.sin(s.t * 2.4) * 5}px,0) rotate(${Math.sin(s.t * 1.7) * 8}deg)`
    }
    if (trafficEl.current) {
      trafficEl.current.style.display = tr.active ? 'block' : 'none'
      trafficEl.current.style.transform = `translate3d(${screenX(tr.x)}px,${34 + s.tideY}px,0) scaleX(${tr.dir})`
    }

    // Where to go: the glowing hand at the screen edge on the target's side (LEFT or RIGHT) while it's off screen, and a
    // gold ring at the door once it's on screen.
    const pulse = 1 + 0.1 * Math.sin(s.t * 7)
    const tx = s.target >= 0 ? doorX(s.target) : null
    const tSide = tx === null ? 0 : Math.sign(wrap(tx - s.bx, CANAL))
    const tOn = tx !== null && onScreen(tx)
    const handOk = s.t >= s.handAt || (tx !== null && Math.abs(wrap(tx - s.bx, CANAL)) > s.minDist + 200)
    if (handL.current) handL.current.style.transform = `scale(${tx !== null && handOk && !tOn && tSide < 0 && playing ? pulse : 0})`
    if (handR.current) handR.current.style.transform = `scale(${tx !== null && handOk && !tOn && tSide > 0 && playing ? pulse : 0})`
    if (markerEl.current) {
      markerEl.current.style.display = tx !== null && tOn && playing ? 'block' : 'none'
      if (tx !== null) markerEl.current.style.transform = `translate3d(${screenX(s.bx + wrap(tx - s.bx, CANAL))}px,0,0) scale(${pulse})`
    }
    // Friends waiting off screen: their face in a bubble at that edge.
    s.actors.forEach((a, slot) => {
      const el = chipEls.current[slot]
      if (!el) return
      const door = a.house >= 0 ? doorX(a.house) : 0
      const show = a.phase === 'waiting' && playing && !onScreen(door) && s.rider < 0
      const side = Math.sign(wrap(door - s.bx, CANAL))
      el.style.display = show ? 'block' : 'none'
      el.style.left = side < 0 ? '12px' : `${L.W - 12 - el.offsetWidth}px`
      el.style.transform = `scale(${pulse})`
    })

    wakeEls.current.forEach((el, i) => {
      if (!el) return
      const p = s.wake[i]
      if (!p || p.age < 0) return void (el.style.opacity = '0')
      const k = p.age / p.life
      const size = p.size * (1 + 2.2 * k)
      el.style.opacity = String(0.8 * (1 - k))
      el.style.transform = `translate3d(${screenX(p.x) - 20}px,${p.y - 20 + s.tideY}px,0) scale(${size / 40}, ${(size / 40) * 0.42})`
    })
    sprayEls.current.forEach((el, i) => {
      if (!el) return
      const p = s.spray[i]
      if (!p) return void (el.style.opacity = '0')
      el.style.opacity = String(1 - p.age / p.life)
      el.style.transform = `translate3d(${screenX(p.x) - 10}px,${p.y - 10 + s.tideY}px,0) scale(${p.size / 20})`
    })

    setSwish(s.drag || speed > 40 ? speed / FEEL.maxSpeed : 0)

    if (navigator.webdriver) (window as unknown as { __venice?: object }).__venice = { bx: s.bx, by: s.by, vx: s.vx, stage: s.stage, rides: s.rides, rider: s.rider, target: s.target, tide: s.tide, actors: s.actors.map((a) => a.phase), targetDx: s.target >= 0 ? wrap(doorX(s.target) - s.bx, CANAL) : null, waitDx: s.actors.map((a) => (a.phase === 'waiting' ? wrap(doorX(a.house) - s.bx, CANAL) : null)), hatDx: s.hat.off ? wrap(s.hat.x - s.bx, CANAL) : null, ducking, bridgeDx: MAIN_BRIDGES.map((b) => wrap(b.x - s.bx, CANAL)).sort((a, b) => Math.abs(a) - Math.abs(b))[0] }
  }, layout !== null)

  const pickBoat = (k: BoatKind) => {
    setBoat(k)
    g.current.stage = 'play'
    setStage('play')
    talk(V.boat[k])
    talk(V.grab, true)
  }
  const maskDone = (m: MaskData) => {
    setMask(m)
    setStars((n) => n + 1)
    g.current.stage = 'finale'
    // The night starts once "What a beautiful mask!" has been said in full.
    void say(V.maskDone, { interrupt: false }).then(() => setStage('finale'))
  }

  const L = layout
  const night = stage === 'finale'
  const sky = SKIES[night ? 4 : Math.min(3, lanterns)]
  return (
    <div
      ref={root}
      onPointerDownCapture={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onLostPointerCapture={onPointerUp}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', background: sky, transition: 'background 2s' }}
    >
      {L && (
        <div style={{ position: 'absolute', left: 0, top: L.waterTop, width: L.viewW, height: 0, transform: `scale(${L.s})`, transformOrigin: '0 0' }}>
          <Layer refFn={layerRef('clouds')} period={CLOUDS}>
            <Clouds top={-L.waterTop / L.s} />
          </Layer>
          <Layer refFn={layerRef('far')} period={FAR}>
            <Skyline />
          </Layer>
          {/* The water (it rises at acqua alta), with two bands of little waves that move at different speeds. */}
          <div ref={layerRef('water')} style={{ position: 'absolute', left: 0, top: 0, width: L.viewW, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: L.viewW, height: WATER_H + 400, background: '#6EC3E6', borderTop: `4px solid ${INK}` }} />
            {/* One flat darker band toward the front of the water (no gradients in this style). */}
            <div style={{ position: 'absolute', left: 0, top: LANE_SPLIT + 30, width: L.viewW, height: WATER_H + 300, background: '#5DB4DC' }} />
            <div ref={layerRef('waveBack')} style={{ ...waves, top: 34, height: 120, opacity: 0.45 }} />
            <div ref={layerRef('waveFront')} style={{ ...waves, top: LANE_SPLIT + 30, height: 260, backgroundSize: '240px 60px', opacity: 0.6 }} />
          </div>
          <Layer refFn={layerRef('canal')} period={CANAL} z={1}>
            <SideCanals />
            {HOUSES.map((h, i) => (
              <House key={i} house={h} index={i} />
            ))}
          </Layer>
          {/* A passing boat in the back lane: tap it (toot, siren, a rainbow spray). */}
          <div ref={trafficEl} style={{ position: 'absolute', left: 0, top: 0, zIndex: 2, display: 'none' }}>
            {(() => {
              const k = TRAFFIC[trafficKind]
              const h = k.length / k.aspect
              return (
                <button aria-label={trafficKind} data-own-tap onClick={tapTraffic} style={{ position: 'absolute', left: -k.length / 2, top: -h * 0.8, width: k.length, height: h, padding: 0, border: 'none', background: 'none' }}>
                  <img src={k.img} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
                  {spraying && <div style={{ position: 'absolute', left: '58%', top: -150, width: 260, height: 160, borderRadius: '50% 50% 0 0', border: '14px solid transparent', borderTopColor: '#FF8FB8', borderRightColor: '#FFE27A', borderLeftColor: '#8FE3C8', opacity: 0.85 }} />}
                </button>
              )
            })()}
          </div>
          <Layer refFn={layerRef('nearPosts')} period={CANAL} z={2} tiles={(tile) => POSTS.map((p, i) => (p.lane === 'near' ? <Post key={i} x={p.x} lane={p.lane} postRef={(el) => void (postEls.current[tile][i] = el)} /> : null))} />
          {/* Wake rings sit on the water, under the boat. */}
          <div style={{ position: 'absolute', left: 0, top: 0, zIndex: 2, pointerEvents: 'none' }}>
            {Array.from({ length: WAKE_POOL }, (_, i) => (
              <div key={i} ref={(el) => void (wakeEls.current[i] = el)} style={{ position: 'absolute', left: 0, top: 0, width: 40, height: 40, borderRadius: '50%', border: '5px solid rgba(255,255,255,.95)', opacity: 0 }} />
            ))}
          </div>
          {/* The gold ring at the destination door, once it's on screen. */}
          <div ref={markerEl} style={{ position: 'absolute', left: 0, top: 0, zIndex: 1, display: 'none', pointerEvents: 'none' }}>
            <div className="world-glow" style={{ position: 'absolute', left: -60, top: -150, width: 120, height: 150, borderRadius: '60px 60px 8px 8px', border: '8px solid #FFC83D' }} />
          </div>
          {/* Doorstep friends: their puppets, positioned by their feet. */}
          {[0, 1].map((slot) => {
            const P = FRIENDS[kinds[slot]].Puppet
            return (
              <div key={slot} ref={(el) => void (actorEls.current[slot] = el)} style={{ position: 'absolute', left: 0, top: 0, display: 'none', zIndex: 1 }}>
                <button aria-label="friend" data-own-tap onClick={() => tapActor(slot)} style={{ position: 'absolute', left: (-RIDER.friend * 400) / 480 / 2, top: -RIDER.friend, height: RIDER.friend, aspectRatio: '400 / 480', padding: 0, background: 'none', border: 'none' }}>
                  <P key={kinds[slot]} ref={(r: PuppetHandle | null) => void (actorRefs.current[slot] = r)} height="100%" />
                </button>
              </div>
            )
          })}
          {/* Gino's hat, floating on the water after a bonk: drive to it to scoop it up. */}
          <div ref={hatEl} style={{ position: 'absolute', left: 0, top: 0, zIndex: 7, display: 'none', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: -50, top: -40 }}>
              <GinoHat height="64px" />
            </div>
          </div>
          <Boat kind={boat} boatRef={boatEl} hullRef={hullEl} ringRef={ringEl} ginoRef={ginoRef} sparkleRef={sparkleRef} rowRef={rowRef} gino={gino} mask={night ? mask : null} night={night} />
          <Layer refFn={layerRef('frontPosts')} period={CANAL} z={4} tiles={(tile) => POSTS.map((p, i) => (p.lane === 'front' ? <Post key={i} x={p.x} lane={p.lane} postRef={(el) => void (postEls.current[tile][i] = el)} /> : null))} />
          {/* The duck family, in front of the front lane. */}
          {[0, 1, 2].map((i) => {
            const k = i === 0 ? critters.duck : critters.duckling
            const h = i === 0 ? 70 : 42
            return (
              <div key={i} ref={(el) => void (duckEls.current[i] = el)} style={{ position: 'absolute', left: 0, top: 0, zIndex: 6 }}>
                <button aria-label={i === 0 ? 'duck' : 'duckling'} data-own-tap onClick={() => tapDuck(i)} style={{ position: 'absolute', left: (-h * k.aspect) / 2, top: -h, width: h * k.aspect, height: h, padding: 0, border: 'none', background: 'none' }}>
                  <img src={k.img} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
                </button>
              </div>
            )
          })}
          <Layer refFn={layerRef('bridge')} period={CANAL} z={6}>
            <MainBridges list={[...MAIN_BRIDGES, ...extraBridges]} />
          </Layer>
          <div style={{ position: 'absolute', left: 0, top: 0, zIndex: 7, pointerEvents: 'none' }}>
            {Array.from({ length: SPRAY_POOL }, (_, i) => (
              <div key={i} ref={(el) => void (sprayEls.current[i] = el)} style={{ position: 'absolute', left: 0, top: 0, width: 20, height: 20, borderRadius: '50%', background: '#fff', opacity: 0 }} />
            ))}
          </div>
          <Layer refFn={layerRef('fore')} period={FORE} z={8}>
            <Foreground width={FORE} high={high} party={night} />
          </Layer>
        </div>
      )}

      {/* Evening and night: a tint over the canal (not a CSS filter: WebKit drops layers this wide when filtered). */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', background: night ? 'rgba(34,28,90,.38)' : lanterns >= 3 ? 'rgba(120,60,120,.1)' : 'transparent', transition: 'background 2s' }} />
      {/* The LEFT and RIGHT hands (screen edges, at the water), and friends waiting off screen. */}
      {L && (
        <>
          {(['left', 'right'] as const).map((side) => (
            <div key={side} ref={side === 'left' ? handL : handR} aria-hidden style={{ position: 'absolute', zIndex: 12, top: L.waterTop + (LANE.near - 150) * L.s, [side]: 10, height: 'min(150px, 22vh)', aspectRatio: String(ui.hand.aspect), transform: 'scale(0)', pointerEvents: 'none', filter: 'drop-shadow(0 0 14px #FFC83D) drop-shadow(0 0 6px #FFC83D)' }}>
              <img src={ui.hand.img} alt="" draggable={false} style={{ width: '100%', height: '100%', transform: side === 'right' ? 'scaleX(-1)' : undefined }} />
            </div>
          ))}
          {[0, 1].map((slot) => (
            <div key={slot} ref={(el) => void (chipEls.current[slot] = el)} aria-hidden style={{ position: 'absolute', zIndex: 12, top: L.waterTop + (LANE.near - 40) * L.s - 40, width: 'min(84px, 14vh)', height: 'min(84px, 14vh)', borderRadius: '50%', background: '#FFF7F0', border: `5px solid ${INK}`, boxShadow: '0 0 0 6px #FFC83D', display: 'none', overflow: 'hidden', pointerEvents: 'none' }}>
              <img src={FRIENDS[kinds[slot]].face} alt="" style={{ width: '120%', marginLeft: '-10%', marginTop: '6%' }} />
            </div>
          ))}
        </>
      )}

      <Lanterns count={night ? 4 : lanterns} night={night} />

      {stage === 'story' && <StoryBeat lines={V.arrive} friend={<Gino height="100%" />} onDone={() => ((g.current.stage = 'pick'), setStage('pick'))} />}
      {stage === 'pick' && <BoatPicker onPick={pickBoat} />}
      {stage === 'mask' && <MaskShop onDone={maskDone} />}
      {stage === 'finale' && <Finale friends={delivered} onDone={onDone} />}
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

/** The boat (side view, prow on the right before flipping) with Gino rowing at the stern and Sparkle up front. The
 *  riders flip with the boat when it turns round. At the finale Gino plays the accordion and Sparkle wears her mask. */
function Boat({ kind, boatRef, hullRef, ringRef, ginoRef, sparkleRef, rowRef, gino, mask, night }: { kind: BoatKind; boatRef: RefObject<HTMLDivElement | null>; hullRef: RefObject<HTMLDivElement | null>; ringRef: RefObject<HTMLDivElement | null>; ginoRef: RefObject<PuppetHandle | null>; sparkleRef: RefObject<PuppetHandle | null>; rowRef: { current: number }; gino: { hatOff: boolean; ducking: boolean; dizzy: boolean; singing: boolean }; mask: MaskData | null; night: boolean }) {
  const b = BOATS[kind]
  const w = BOAT.length * 1.15
  const h = w / b.aspect
  return (
    <div ref={boatRef} aria-label="gondola" style={{ position: 'absolute', left: 0, top: 0, zIndex: 5, touchAction: 'none', width: 1, height: 1, transformOrigin: '0 0' }}>
      {/* "Grab me" ring: pulses when she hasn't touched the boat for a while, or when it's time to duck. */}
      <div ref={ringRef} style={{ position: 'absolute', left: -BOAT.halfLength - 34, top: -150, width: BOAT.halfLength * 2 + 68, height: 210, borderRadius: '50%', border: '7px solid #FFC83D', boxShadow: '0 0 24px #FFC83D', opacity: 0, pointerEvents: 'none' }} />
      <div ref={hullRef} style={{ position: 'absolute', left: -w / 2, top: -h * b.waterline, width: w, height: h, transformOrigin: `50% ${b.waterline * 100}%` }}>
        <div style={{ position: 'absolute', left: w * b.gino[0], bottom: h * b.gino[1], height: RIDER.gino, aspectRatio: '400 / 480' }}>
          <Gino ref={ginoRef} oar={!night} accordion={night} singing={gino.singing || night} hatOff={gino.hatOff} ducking={gino.ducking} dizzy={gino.dizzy} rowRef={rowRef} height="100%" />
        </div>
        <motion.div animate={{ scaleY: gino.ducking ? 0.55 : 1, scaleX: gino.ducking ? 1.15 : 1 }} transition={{ type: 'spring', duration: 0.3 }} style={{ position: 'absolute', left: w * b.sparkle[0], bottom: h * b.sparkle[1], height: RIDER.sparkle, transformOrigin: '50% 100%' }}>
          <SparklePuppet ref={sparkleRef} height={`${RIDER.sparkle}px`} lookToward={0.5} />
          {mask && (
            <div style={{ position: 'absolute', left: RIDER.sparkle * 0.36, top: RIDER.sparkle * 0.2, width: RIDER.sparkle * 0.56 }}>
              <MaskView data={mask} />
            </div>
          )}
        </motion.div>
        <img src={b.img} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}

/** The payoff: a string of lanterns over the canal, one per friend taken home (and one for Gino). Lit up at night. */
function Lanterns({ count, night }: { count: number; night: boolean }) {
  return (
    <div aria-hidden className="venice-lanterns" style={{ position: 'absolute', left: '4%', right: '4%', top: 'calc(var(--bar-clear) - 14px)', height: 120, zIndex: 11, pointerEvents: 'none' }}>
      <svg viewBox="0 0 100 20" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: 40, overflow: 'visible' }}>
        <path d="M0 2 Q50 22 100 2" fill="none" stroke={INK} strokeWidth="0.5" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
      </svg>
      {[0, 1, 2, 3].map((i) => {
        const x = 14 + i * 24
        const sag = 2 + 18 * Math.sin((Math.PI * x) / 100)
        return (
          <AnimatePresence key={i}>
            {i < count && (
              <motion.img
                src={ui.lantern.img}
                alt=""
                initial={{ y: -80, opacity: 0, rotate: -20 }}
                animate={{ y: 0, opacity: 1, rotate: [8, -6, 3, 0] }}
                transition={{ type: 'spring', duration: 0.9 }}
                style={{ position: 'absolute', left: `${x}%`, top: sag * 1.8, height: 'min(70px, 10vh)', translate: '-50% 0', filter: night ? 'drop-shadow(0 0 18px #FFE27A) brightness(1.15)' : undefined, transformOrigin: '50% 0' }}
              />
            )}
          </AnimatePresence>
        )
      })}
    </div>
  )
}

/** Choose a boat (a silly one is fine). */
function BoatPicker({ onPick }: { onPick: (k: BoatKind) => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(255,247,240,.82)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--top-clear) 16px calc(var(--safe-bottom) + 16px)', gap: 'min(16px, 2vh)' }} className="wide-bar">
      <PromptBubble text={V.pickBoat} />
      <div style={{ flex: 1, minHeight: 0, width: '100%', maxWidth: 1000, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridAutoRows: 'minmax(0, 1fr)', gap: 'min(20px, 3vw)', alignContent: 'center' }}>
        {BOAT_ORDER.map((k, i) => (
          <motion.button
            key={k}
            aria-label={`${k} boat`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
            transition={{ scale: { delay: i * 0.08, type: 'spring' }, opacity: { delay: i * 0.08 }, y: { repeat: Infinity, duration: 1.8, delay: i * 0.3 } }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sounds.pop()
              onPick(k)
            }}
            style={{ background: '#BFE6F7', border: `5px solid ${INK}`, borderRadius: 28, padding: 'min(16px, 2vh)', minHeight: 96, maxHeight: '32vh', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow)' }}
          >
            <img src={BOATS[k].img} alt="" draggable={false} style={{ width: '100%', maxHeight: 'calc(32vh - 40px)', objectFit: 'contain' }} />
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/** Night on the canal: fireworks over the lagoon (tap the sky for more), the friends she drove wave from the walkway,
 *  Gino plays his accordion. Then the stamp. */
function Finale({ friends, onDone }: { friends: number[]; onDone: () => void }) {
  const [shots, setShots] = useState<{ id: number; x: number; y: number; c: string }[]>([])
  const next = useRef(0)
  const refs = useRef<(PuppetHandle | null)[]>([])
  const fire = (x: number, y: number) => {
    const id = next.current++
    vsfx.firework()
    setShots((s) => [...s.slice(-6), { id, x, y, c: ['#FF8FB8', '#FFE27A', '#8FE3C8', '#B9A6F5', '#6EC3E6'][id % 5] }])
  }
  useEffect(() => {
    void say(V.night)
    void say(V.fireworks, { interrupt: false })
    void say(V.accordion, { interrupt: false })
    const auto = setInterval(() => fire(15 + Math.random() * 70, 12 + Math.random() * 22), 900)
    const wave = setInterval(() => refs.current.forEach((r, i) => setTimeout(() => void r?.play('cheer'), i * 250)), 2600)
    const done = setTimeout(onDone, 11000)
    return () => (clearInterval(auto), clearInterval(wave), clearTimeout(done))
  }, [])
  return (
    <div
      onPointerDown={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        fire(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100)
      }}
      style={{ position: 'absolute', inset: 0, zIndex: 15 }}
    >
      {shots.map((s) => (
        <div key={s.id} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, pointerEvents: 'none' }}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(a) * 90, y: Math.sin(a) * 90 + 30, opacity: 0, scale: 0.4 }}
                transition={{ duration: 1.3, ease: 'easeOut' }}
                style={{ position: 'absolute', width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: '50%', background: s.c, boxShadow: `0 0 12px ${s.c}` }}
              />
            )
          })}
        </div>
      ))}
      {/* The friends she drove, on the walkway in front, waving. */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 18px)', display: 'flex', justifyContent: 'center', gap: 'min(28px, 4vw)', pointerEvents: 'none' }}>
        {friends.map((k, i) => {
          const P = FRIENDS[k].Puppet
          return (
            <motion.div key={i} initial={{ y: 200 }} animate={{ y: 0 }} transition={{ delay: 0.4 + i * 0.25, type: 'spring' }} style={{ height: 'min(150px, 20vh)' }}>
              <P ref={(r: PuppetHandle | null) => void (refs.current[i] = r)} height="100%" />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

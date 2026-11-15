// 🎈 Luna's Thank-You Balloon, Peru's finale (plan: planning/around-the-world/peru.md (retired; in git history),
// "Finale"). The journal is full, so Luna and Sparkle fly the balloon across Peru at sunset and drop a thank-you
// present to every friend, in their own home.
// The toy (one core verb): pull a present off the balloon and let go. A little parachute pops open and it drifts down,
// swinging, and a friend below waddles, flies or swims to catch it, then wears it (a party hat, a flower crown of
// kantutas, a chullo, a bow, heart sunglasses: she picks which from the gift bags hanging under the basket, and can
// see what's in each). Nothing can miss: a present that lands hops along to its friend, snags on the vine and slides
// to them, or floats until Rosa swims over. The verb deepens with the land under the balloon (Peru's three worlds):
//   1. The coast: Pepa, her chick and Lobo, big easy targets on the beach and the rock.
//   2. The mountains: it's windy (presents drift right), Coco and Pluma catch in mid-air, Tika on the terraces.
//   3. The rainforest at sunset: the sloth (very slow) and the monkey on the vine, and Rosa under the canopy, so her
//      presents must drop through a gap in the leaves (a leaf bounces them toward the nearest gap); she leaps to catch.
// Payoff: night falls, a tap on the forest sends up a sky lantern, the balloon's ribbons turn red and white like the
// flag, every friend lines up wearing their present, Luna says gracias and Sparkle says what it means. Then onDone
// (the shell's trophy ceremony). Per-frame work (the presents, the friends, the lanterns) runs in refs and one loop.
// Where it stands (2026-11-15, PR #453): check-in 2 (hear it). Scratch voices recorded; the worn presents' spots on
// each friend are hand placed (WEAR below, checked on the night lineup). Open for the user: the length (a fourth stop
// with Paco and Abuela?) and lanterns or fireflies. Next: check-in 3, Kaylee's playtest (does she find the pull-down
// on her own, and does she give presents to the friend she aims at). Robot play: the whole trip to the trophy takes
// about 45 s of fast drops on iPad landscape, iPad portrait and iPhone, with no errors.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from 'react'
import { Buddy, burst, firstTime, say, sounds, spendHint, SparklePuppet, useAlive, useGameLoop, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { Flag } from '../../../../kit/Flag'
import { useSections } from '../../../../kit/sections'
import { PromptBubble } from '../../../../kit/Stage'
import { sfx } from '../../../../kit/sfx'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Alpaca } from '../../puppets/Alpaca'
import { Chick as PenguinChick } from '../../puppets/Chick'
import { Chick as CondorChick, Condor } from '../../puppets/Condor'
import { Lobo } from '../../puppets/Lobo'
import { Penguin } from '../../puppets/Penguin'
import { Rosa } from '../../puppets/Rosa'
import { Tika } from '../../puppets/Tika'
import { GiftBag, GIFTS, Lantern, ON_EYES, WornItem, type GiftKind } from './Gifts'
import { ALL_FRIENDS, ASPECT, FRIENDS, MOVE, leafAt, pickLayout, STOPS, type BalloonLayout, type FriendId, type Stop } from './layout'
import { BasketFront, Cloud, CoastGround, Envelope, ForestGround, Leaf, MountainGround, vineY } from './Scenery'
import SECTIONS from './sections'
import { bsfx } from './sfx'

const B = L.balloon
type Phase = 'story' | Stop | 'night' | 'lineup'
/** Stars in the top bar: one per friend's present, and one for the lanterns. */
const TOTAL = ALL_FRIENDS.length + 1
/** Lanterns before the flag and the lineup. */
const LANTERNS = 6
/** How close a friend must be to catch (stage units), by how they move. */
const REACH = { ground: 120, vine: 120, swim: 150, fly: 115 }
/** Presents in the air at once, at most. */
const MAX_FLYING = 4
/** Seconds with nothing touched before Sparkle's hint. */
const STUCK_S = 10
/** The wind in the mountains (stage units a second, to the right). */
const WIND = 55
/** The light as the day goes by: afternoon on the coast, golden in the mountains, sunset in the rainforest, night. */
const TINTS = {
  day: 'rgba(255,214,150,0.10)',
  gold: 'rgba(255,170,100,0.22)',
  sunset: 'linear-gradient(rgba(255,120,140,0.40), rgba(255,170,90,0.22) 60%, rgba(255,140,90,0.10))',
  night: 'linear-gradient(rgba(24,20,72,0.80), rgba(40,30,90,0.64) 70%, rgba(50,30,80,0.52))',
}
const TINT_OF: Record<Phase, keyof typeof TINTS> = { story: 'day', coast: 'day', mountains: 'gold', forest: 'sunset', night: 'night', lineup: 'night' }
const BG: Record<Stop, { wide: string; tall: string }> = {
  coast: { wide: art.bgCoast, tall: art.bgCoastTall },
  mountains: { wide: art.bgMp, tall: art.bgMpTall },
  forest: { wide: art.bgAmazon, tall: art.bgAmazon },
}
/** What each friend wears when a link starts after their stop. */
const DEFAULT_GIFTS: Record<FriendId, GiftKind> = { pepa: 'party', chick: 'bow', lobo: 'shades', coco: 'chullo', pluma: 'crown', tika: 'shades', sloth: 'crown', monkey: 'party', rosa: 'bow' }
const NEXT: Record<Stop, Phase> = { coast: 'mountains', mountains: 'forest', forest: 'night' }
const ON_THE_WAY: Partial<Record<Stop, Line>> = { coast: B.toMountains, mountains: B.toForest }
const ARRIVE: Record<Stop, Line> = { coast: B.go, mountains: B.mountains, forest: B.forest }

/** Where a present sits on each friend, as shares of their picture box: the top of the head (a hat's base, and the
 *  hat's width) and the eyes (sunglasses). The pictures face right unless `left`. */
const WEAR: Record<FriendId, { head: [number, number, number]; eyes: [number, number, number]; left?: boolean }> = {
  pepa: { head: [0.58, 0.16, 0.5], eyes: [0.64, 0.24, 0.46] },
  chick: { head: [0.5, 0.16, 0.6], eyes: [0.5, 0.38, 0.55] },
  lobo: { head: [0.29, 0.12, 0.3], eyes: [0.27, 0.23, 0.28], left: true },
  coco: { head: [0.8, 0.43, 0.24], eyes: [0.83, 0.56, 0.22] },
  pluma: { head: [0.66, 0.37, 0.4], eyes: [0.72, 0.52, 0.4] },
  tika: { head: [0.77, 0.12, 0.3], eyes: [0.77, 0.245, 0.3] },
  sloth: { head: [0.19, 0.25, 0.3], eyes: [0.2, 0.42, 0.3], left: true },
  monkey: { head: [0.66, 0.09, 0.42], eyes: [0.71, 0.19, 0.4] },
  rosa: { head: [0.74, 0.21, 0.24], eyes: [0.8, 0.37, 0.22] },
}
/** What a friend does when poked, and when they catch. */
const POKE: Partial<Record<FriendId, Line[]>> = {
  pepa: L.penguins.pepaTap,
  lobo: L.penguins.loboTap,
  coco: [L.canyon.condors],
  pluma: [L.canyon.wheee],
  tika: L.terraces.tickle,
  sloth: [L.river.slothWake],
  rosa: L.river.spout,
}
const CHEER: Record<FriendId, string> = { pepa: 'cheer', chick: 'cheer', lobo: 'clap', coco: 'cheer', pluma: 'cheer', tika: 'cheer', sloth: 'cheer', monkey: 'jump', rosa: 'jump' }
/** Heights in the night lineup. */
const LINEUP_H: Record<FriendId, number> = { pepa: 170, chick: 100, lobo: 115, coco: 122, pluma: 110, tika: 196, sloth: 110, monkey: 130, rosa: 90 }

interface Flight {
  id: number
  kind: GiftKind
  x: number
  y: number
  vx: number
  vy: number
  t: number
  mode: 'held' | 'fall' | 'rest' | 'gone'
  who: FriendId | null
  chute: number
  /** Resting: seconds until the next hop (on the ground). */
  hop: number
  /** Last few finger positions while held, for the throw. */
  trail: { x: number; y: number; t: number }[]
}
interface Pal {
  id: FriendId
  x: number
  y: number
  face: 1 | -1
  ang: number
  /** 0..1: Rosa's leap, a hop of joy. */
  leap: number
  wander: number
  tx: number
}

function parseGifts(s: string): Partial<Record<FriendId, GiftKind>> {
  const out: Partial<Record<FriendId, GiftKind>> = {}
  for (const pair of s.split(',')) {
    const [f, g] = pair.split(':')
    if ((ALL_FRIENDS as string[]).includes(f) && (GIFTS as string[]).includes(g)) out[f as FriendId] = g as GiftKind
  }
  return out
}
const giftsParam = (w: Partial<Record<FriendId, GiftKind>>) =>
  ALL_FRIENDS.filter((f) => w[f])
    .map((f) => `${f}:${w[f]}`)
    .join(',')

export function BalloonTrip({ onDone, setProgress }: ActivityProps) {
  const { start, param, enter } = useSections(SECTIONS)
  const alive = useAlive()
  const root = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ W: 0, H: 0 })
  const startAt: Phase = start === 'night' ? 'night' : start === 'coast' || start === 'mountains' || start === 'forest' ? start : 'story'
  const [phase, setPhaseState] = useState<Phase>(startAt)
  /** The stop whose scene is showing (the night keeps the rainforest). */
  const stopOf = (p: Phase): Stop => (p === 'story' ? 'coast' : p === 'night' || p === 'lineup' ? 'forest' : p)
  const [worn, setWornState] = useState<Partial<Record<FriendId, GiftKind>>>(() => {
    if (!start) return {}
    const given = parseGifts(param('gifts'))
    const upTo = startAt === 'night' ? 3 : STOPS.indexOf(stopOf(startAt))
    for (const s of STOPS.slice(0, upTo)) for (const f of FRIENDS[s]) given[f] ??= DEFAULT_GIFTS[f]
    return given
  })
  const [flights, setFlights] = useState<{ id: number; kind: GiftKind }[]>([])
  const [slots, setSlots] = useState<(GiftKind | null)[]>(() => [...GIFTS])
  const [prompt, setPrompt] = useState<Line | null>(null)
  const [glow, setGlow] = useState(false)
  const [flag, setFlag] = useState(false)
  const [lanterns, setLanterns] = useState<{ id: number; x: number }[]>([])
  const [leafKick, setLeafKick] = useState([0, 0, 0])
  const [flame, setFlame] = useState(0)

  const sparkle = useRef<PuppetHandle>(null)
  const luna = useRef<PuppetHandle>(null)
  const puppets = useRef<Partial<Record<FriendId, PuppetHandle | null>>>({})
  const palEls = useRef<Partial<Record<FriendId, HTMLDivElement | null>>>({})
  const flipEls = useRef<Partial<Record<FriendId, HTMLDivElement | null>>>({})
  const flightEls = useRef(new Map<number, HTMLDivElement>())
  const lanternEls = useRef(new Map<number, HTMLDivElement>())
  const balloonEl = useRef<HTMLDivElement>(null)
  const pelicanEl = useRef<HTMLDivElement>(null)
  const cloudEls = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]

  const g = useRef({
    phase: startAt as Phase,
    flights: [] as Flight[],
    pals: {} as Partial<Record<FriendId, Pal>>,
    worn: worn,
    nextId: 1,
    held: null as null | { pointer: number; flight: Flight },
    lanterns: [] as { id: number; x: number; y: number; t: number; sway: number }[],
    lanternCount: 0,
    lastTouch: performance.now(),
    hints: 0,
    lastHint: 0,
    bob: 0,
    lift: 0,
    drift: 0,
    pelican: { x: -300, dive: 0 },
    clouds: [0.1, 0.45, 0.8],
    busy: false,
    lunaTaps: 0,
    pokes: {} as Record<string, number>,
  })
  const setPhase = (p: Phase) => {
    g.current.phase = p
    setPhaseState(p)
  }
  const setWorn = (f: (w: Partial<Record<FriendId, GiftKind>>) => Partial<Record<FriendId, GiftKind>>) => {
    g.current.worn = f(g.current.worn)
    setWornState(g.current.worn)
  }
  const gifted = ALL_FRIENDS.filter((f) => worn[f]).length
  useEffect(() => setProgress(Math.min(TOTAL, gifted + (flag ? 1 : 0)), TOTAL), [gifted, flag])

  // ---- Layout: measure, pick the wide or tall stage, scale it to fit. ----
  useEffect(() => {
    const el = root.current
    if (!el) return
    const measure = () => setSize({ W: el.clientWidth, H: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const S: BalloonLayout | null = size.W ? pickLayout(size.W, size.H) : null
  const scale = S ? Math.min(size.W / S.w, size.H / S.h) : 1
  const ox = S ? (size.W - S.w * scale) / 2 : 0
  const oy = S ? (size.H - S.h * scale) / 2 : 0
  const lay = useRef({ S, scale, ox, oy })
  lay.current = { S, scale, ox, oy }

  const stop = stopOf(phase)
  const playing = phase === 'coast' || phase === 'mountains' || phase === 'forest'

  // The friends of the stop on screen, placed where the layout says (again when the stage changes shape).
  useEffect(() => {
    if (!S) return
    const pals: Partial<Record<FriendId, Pal>> = {}
    for (const id of FRIENDS[stop]) {
      const f = S.friends[id]
      const old = g.current.pals[id]
      pals[id] = { id, x: f.x, y: f.y, face: old?.face ?? (id === 'tika' ? -1 : 1), ang: f.orbit?.phase ?? 0, leap: 0, wander: 2 + Math.random() * 3, tx: f.x }
    }
    g.current.pals = pals
  }, [S, stop])

  // ---- Speech and hints. ----
  const showPrompt = (l: Line) => setPrompt(l)
  useEffect(() => {
    if (!prompt) return
    const t = setTimeout(() => setPrompt((p) => (p === prompt ? null : p)), 5500)
    return () => clearTimeout(t)
  }, [prompt])
  /** Say a fact or a line the first time something comes up in this visit. */
  const once = (key: string, l: Line) => {
    if (firstTime(`peru:balloon:${key}`)) void say(l)
  }
  const sayFriend = (l: Line) => void say(l)

  // Stuck: nothing touched for a while in a stop or at night, the presents (or the forest) glow, and Sparkle helps.
  useEffect(() => {
    const touch = () => {
      g.current.lastTouch = performance.now()
      setGlow(false)
    }
    window.addEventListener('pointerdown', touch, true)
    const timer = setInterval(() => {
      const G = g.current
      const now = performance.now()
      const p = G.phase
      if (p !== 'coast' && p !== 'mountains' && p !== 'forest' && p !== 'night') return
      if (G.busy || now - G.lastTouch < STUCK_S * 1000 || now - G.lastHint < 20000) return
      G.lastHint = now
      setGlow(true)
      const h = p === 'night' ? B.idle.lantern : B.idle.grab
      if (spendHint(h)) showPrompt(h)
      else setPrompt(h)
    }, 500)
    return () => {
      window.removeEventListener('pointerdown', touch, true)
      clearInterval(timer)
    }
  }, [])

  // ---- The flow: a stop starts, its friends all get presents, the balloon flies on. ----
  const arrive = (p: Phase) => {
    if (p === 'coast' || p === 'mountains' || p === 'forest') {
      enter(p, { gifts: giftsParam(g.current.worn) || undefined })
      setSlots([...GIFTS])
      showPrompt(ARRIVE[p])
    }
    if (p === 'night') startNight()
  }
  useEffect(() => {
    if (startAt === 'story') {
      enter('story')
      return
    }
    arrive(startAt)
  }, [])

  const flyOn = async (from: Stop) => {
    const G = g.current
    G.busy = true
    await wait(1400)
    if (!alive()) return
    if (from === 'forest') {
      // The last friend has a present: the sun goes down where we are.
      G.busy = false
      setPhase('night')
      void startNight()
      return
    }
    // Clear presents still in the air (nobody left to catch them here).
    G.flights = []
    setFlights([])
    const way = ON_THE_WAY[from]
    if (way) sayFriend(way)
    void luna.current?.play('cheer')
    bsfx.burner()
    setFlame(1)
    setTimeout(() => setFlame(0), 900)
    G.drift = 1
    setPhase(NEXT[from])
    await wait(2600)
    if (!alive()) return
    G.drift = 0
    G.busy = false
    arrive(NEXT[from])
  }

  const startNight = async () => {
    const G = g.current
    enter('night', { gifts: giftsParam(G.worn) || undefined })
    G.busy = true
    await wait(1600)
    if (!alive()) return
    G.busy = false
    G.lastTouch = performance.now()
    showPrompt(B.night)
  }

  const sendLantern = (x: number) => {
    const G = g.current
    const S0 = lay.current.S
    if (!S0 || (G.phase !== 'night' && G.phase !== 'lineup')) return
    const id = G.nextId++
    G.lanterns.push({ id, x, y: S0.canopy.y - 20, t: 0, sway: Math.random() * 6 })
    setLanterns((l) => [...l, { id, x }])
    bsfx.lantern(G.lanternCount)
    G.lanternCount++
    if (G.lanternCount === 2) sayFriend(B.pretty)
    if (G.lanternCount === LANTERNS && G.phase === 'night') void finale()
  }

  const finale = async () => {
    const G = g.current
    G.busy = true
    setFlag(true)
    sounds.sparkle()
    void sparkle.current?.play('cheer')
    showPrompt(B.flag)
    await wait(3200)
    if (!alive()) return
    setPhase('lineup')
    sounds.fanfare()
    await wait(1400)
    if (!alive()) return
    void luna.current?.play('cheer')
    await say(B.gracias)
    if (!alive()) return
    void sparkle.current?.play('dance')
    showPrompt(B.meaning)
    burst(0.5, 0.4)
    await wait(3600)
    if (!alive()) return
    onDone()
  }

  // ---- Catching. ----
  const catchGift = (f: Flight, pal: Pal) => {
    const G = g.current
    f.mode = 'gone'
    G.flights = G.flights.filter((x) => x !== f)
    setFlights((l) => l.filter((x) => x.id !== f.id))
    if (G.worn[pal.id]) return
    setWorn((w) => ({ ...w, [pal.id]: f.kind }))
    bsfx.catch()
    sounds.correct()
    void puppets.current[pal.id]?.play(CHEER[pal.id])
    pal.leap = Math.max(pal.leap, MOVE[pal.id] === 'swim' ? 1 : 0.5)
    sayFriend(B.caught[pal.id])
    const { scale: s, ox: x0, oy: y0 } = lay.current
    const r = root.current?.getBoundingClientRect()
    if (r) burst((x0 + pal.x * s) / r.width, Math.min(0.9, (y0 + f.y * s) / r.height))
    const st = stopOf(G.phase)
    if (FRIENDS[st].every((id) => G.worn[id])) void flyOn(st)
  }

  /** The nearest friend at this stop who still has no present (and isn't waiting for one already, if possible). */
  const pickCatcher = (f: Flight): FriendId | null => {
    const G = g.current
    const st = stopOf(G.phase)
    const open = FRIENDS[st].filter((id) => !G.worn[id] && G.pals[id])
    if (!open.length) return null
    const waiting = new Set(G.flights.filter((x) => x !== f && x.mode !== 'held').map((x) => x.who))
    const free = open.filter((id) => !waiting.has(id))
    const pool = free.length ? free : open
    const d = (id: FriendId) => {
      const p = G.pals[id]!
      return MOVE[id] === 'fly' ? Math.hypot(p.x - f.x, (p.y - f.y) * 0.5) : Math.abs(p.x - f.x)
    }
    return pool.reduce((a, b) => (d(b) < d(a) ? b : a))
  }

  // ---- The loop. ----
  useGameLoop((dt, time) => {
    const S0 = lay.current.S
    if (!S0) return
    const G = g.current
    const st = stopOf(G.phase)
    const wind = st === 'mountains' && G.phase === 'mountains' ? WIND : 0

    // The balloon bobs, tilts while flying on, and lifts a little when the burner roars.
    G.bob = Math.sin(time * 1.3) * 8
    G.lift = Math.max(0, G.lift - dt * 30)
    if (balloonEl.current) balloonEl.current.style.transform = `translate(0px, ${G.bob - G.lift}px) rotate(${G.drift ? Math.sin(time * 2) * 1.5 : Math.sin(time * 0.9) * 0.6}deg)`

    // Clouds drift by (fast while flying on).
    G.clouds = G.clouds.map((c, i) => {
      let n = c - dt * (G.drift ? 0.35 : 0.012) * (1 + i * 0.3)
      if (n < -0.25) n += 1.5
      return n
    })
    cloudEls.forEach((el, i) => {
      if (el.current) el.current.style.transform = `translate(${G.clouds[i] * S0.w}px, ${[0.12, 0.22, 0.06][i] * S0.h}px)`
    })

    // The pelican crosses the coast's sky now and then.
    if (st === 'coast') {
      const p = G.pelican
      p.x += dt * (p.dive > 0 ? 420 : 140)
      p.dive = Math.max(0, p.dive - dt)
      if (p.x > S0.w + 300) p.x = -300
      if (pelicanEl.current) pelicanEl.current.style.transform = `translate(${p.x}px, ${S0.pokes.pelican.y + Math.sin(time * 1.6) * 20 + Math.sin(Math.PI * Math.min(1, 1 - p.dive)) * (p.dive > 0 ? 160 : 0)}px)`
    }

    // Presents.
    for (const f of G.flights) {
      if (f.mode === 'held' || f.mode === 'gone') continue
      f.t += dt
      if (f.who && G.worn[f.who]) f.who = null
      if (!f.who) f.who = pickCatcher(f)
      const pal = f.who ? G.pals[f.who] : undefined
      const move = f.who ? MOVE[f.who] : 'ground'
      if (f.mode === 'fall') {
        if (f.chute < 1) {
          if (f.chute === 0 && f.t > 0.12) bsfx.chute()
          if (f.t > 0.12) f.chute = Math.min(1, f.chute + dt * 4)
        }
        const terminal = 150 + (1 - f.chute) * 700
        f.vy = Math.min(f.vy + 900 * dt, terminal)
        f.vx += (wind - f.vx) * Math.min(1, dt * 1.5)
        const prevY = f.y
        f.x += (f.vx + Math.sin(f.t * 2.4) * 36 * f.chute) * dt
        f.y += f.vy * dt
        f.x = Math.max(30, Math.min(S0.w - 30, f.x))
        // The canopy: a leaf bounces a present toward the nearest gap (only presents going below it).
        if (st === 'forest' && move === 'swim' && prevY < S0.canopy.y && f.y >= S0.canopy.y) {
          const leaf = leafAt(S0, f.x)
          if (leaf) {
            f.y = S0.canopy.y - 2
            f.vy = -200
            f.vx = (f.x >= leaf.x ? 1 : -1) * 240
            sfx.boing()
            const i = S0.canopy.leaves.indexOf(leaf)
            setLeafKick((k) => k.map((v, j) => (j === i ? v + 1 : v)))
          }
        }
        if (!pal) {
          if (f.y >= S0.ground[st]) {
            f.y = S0.ground[st]
            f.mode = 'rest'
            bsfx.land()
          }
        } else {
          const fr = S0.friends[pal.id]
          const reach = REACH[move]
          if (move === 'fly') {
            if (Math.hypot(pal.x - f.x, pal.y - f.y) < reach) catchGift(f, pal)
            else if (f.y >= S0.ground[st] - 20) {
              f.y = S0.ground[st] - 20
              f.mode = 'rest'
              bsfx.land()
            }
          } else if (move === 'ground') {
            if (f.y >= pal.y - fr.h * 0.85 && Math.abs(pal.x - f.x) < reach) catchGift(f, pal)
            else if (f.y >= pal.y - 30) {
              f.y = pal.y - 30
              f.mode = 'rest'
              f.hop = 0.25
              bsfx.land()
            }
          } else if (move === 'vine') {
            const vy = vineY(S0, f.x)
            if (f.y >= vy - 40) {
              if (Math.abs(pal.x - f.x) < reach) catchGift(f, pal)
              else {
                f.y = vy - 40
                f.mode = 'rest'
                bsfx.land()
              }
            }
          } else {
            // Rosa leaps when it's low enough and she's under it; otherwise it lands in the river and floats.
            if (f.y >= S0.river - 190 && Math.abs(pal.x - f.x) < reach) catchGift(f, pal)
            else if (f.y >= S0.river - 20) {
              f.y = S0.river - 20
              f.mode = 'rest'
              bsfx.plop()
            }
          }
        }
      } else if (f.mode === 'rest' && pal) {
        // Resting presents make their way to their friend: hops on the ground, a slide along the vine, a float.
        const dir = Math.sign(pal.x - f.x)
        const move2 = MOVE[pal.id]
        if (move2 === 'ground' || move2 === 'fly') {
          f.hop -= dt
          if (f.hop <= 0 && move2 === 'ground') {
            f.hop = 0.55
            f.vx = dir * 120
            f.vy = -260
            bsfx.hop()
          }
          f.vy += 900 * dt
          f.x += f.vx * dt
          const floor = move2 === 'ground' ? pal.y - 30 : S0.ground[st] - 20
          f.y = Math.min(floor, f.y + f.vy * dt)
          if (f.y >= floor) f.vx *= 0.8
        } else if (move2 === 'vine') {
          f.x += dir * 60 * dt
          f.y = vineY(S0, f.x) - 40
        } else {
          f.x += dir * 40 * dt
          f.y = S0.river - 20 + Math.sin(f.t * 3) * 5
        }
        const reach = REACH[move2] * 0.8
        if (move2 === 'fly' ? Math.hypot(pal.x - f.x, pal.y - f.y) < reach : Math.abs(pal.x - f.x) < reach) catchGift(f, pal)
      }
      const el = flightEls.current.get(f.id)
      if (el) el.style.transform = `translate(${f.x}px, ${f.y}px) rotate(${f.mode === 'fall' ? Math.sin(f.t * 2.4) * 9 * f.chute : 0}deg)`
      if (el) el.dataset.chute = f.chute > 0.5 ? 'open' : 'shut'
    }

    // Friends.
    for (const id of FRIENDS[st]) {
      const p = G.pals[id]
      if (!p) continue
      const fr = S0.friends[id]
      const move = MOVE[id]
      const target = G.flights.find((f) => f.who === id && f.mode !== 'held')
      p.leap = Math.max(0, p.leap - dt * 1.1)
      if (move === 'fly') {
        let tx: number
        let ty: number
        if (target && !G.worn[id]) {
          tx = target.x
          ty = target.mode === 'rest' ? target.y - 10 : target.y + 30
        } else {
          const o = fr.orbit!
          p.ang += (dt * Math.PI * 2) / o.period
          tx = o.cx + Math.cos(p.ang) * o.rx
          ty = o.cy + Math.sin(p.ang) * o.ry
        }
        const dx = tx - p.x
        const dy = ty - p.y
        const d = Math.hypot(dx, dy)
        const step = Math.min(d, fr.speed * dt * (target ? 1 : 0.6))
        if (d > 0.1) {
          p.x += (dx / d) * step
          p.y += (dy / d) * step
        }
        if (Math.abs(dx) > 8) p.face = dx > 0 ? 1 : -1
      } else {
        if (target && !G.worn[id]) p.tx = Math.max(fr.range[0], Math.min(fr.range[1], target.x))
        else {
          p.wander -= dt
          if (p.wander <= 0) {
            p.wander = 3 + Math.random() * 4
            p.tx = Math.max(fr.range[0], Math.min(fr.range[1], p.x + (Math.random() - 0.5) * 260))
          }
        }
        // Friends on the same line don't stand inside each other while they wander.
        if (!target)
          for (const other of FRIENDS[st]) {
            const q = G.pals[other]
            if (!q || other === id || MOVE[other] !== move) continue
            const gap = ((fr.h * ASPECT[id] + S0.friends[other].h * ASPECT[other]) / 2) * 0.8
            if (Math.abs(q.x - p.tx) < gap) p.tx = Math.max(fr.range[0], Math.min(fr.range[1], q.x + (p.x >= q.x ? gap : -gap)))
          }
        const dx = p.tx - p.x
        const sp = fr.speed * (target ? 1 : 0.4)
        if (Math.abs(dx) > 4) {
          p.x += Math.sign(dx) * Math.min(Math.abs(dx), sp * dt)
          p.face = dx > 0 ? 1 : -1
        }
      }
      const el = palEls.current[id]
      const flipEl = flipEls.current[id]
      if (!el) continue
      const w = fr.h * ASPECT[id]
      const walking = move !== 'fly' && Math.abs(p.tx - p.x) > 4
      let top: number
      if (move === 'ground') top = p.y - fr.h - (walking ? Math.abs(Math.sin(time * 9)) * 10 : 0) - Math.sin(Math.PI * p.leap) * 50
      else if (move === 'vine') top = id === 'sloth' ? vineY(S0, p.x) - 22 : vineY(S0, p.x) - fr.h + 18 - Math.sin(Math.PI * p.leap) * 40
      else if (move === 'swim') top = p.y - fr.h / 2 + Math.sin(time * 2.2) * 6 - Math.sin(Math.PI * p.leap) * 200
      else top = p.y - fr.h / 2
      el.style.transform = `translate(${p.x - w / 2}px, ${top}px)`
      const natural = WEAR[id].left ? -1 : 1
      if (flipEl) flipEl.style.transform = `scaleX(${p.face * natural}) rotate(${move === 'swim' ? Math.sin(Math.PI * p.leap) * -20 : move === 'fly' ? Math.sin(time * 2) * 4 : 0}deg)`
    }

    // Lanterns float up and away, swaying.
    G.lanterns = G.lanterns.filter((l) => {
      l.t += dt
      l.y -= dt * (60 + Math.min(1, l.t) * 40)
      const el = lanternEls.current.get(l.id)
      if (el) el.style.transform = `translate(${l.x + Math.sin(l.t * 1.3 + l.sway) * 26}px, ${l.y}px)`
      return l.y > -200
    })
  })

  // ---- Fingers: pull a present off the balloon, carry it, let go. ----
  const toStage = (cx: number, cy: number) => {
    const r = root.current?.getBoundingClientRect()
    const { scale: s, ox: x0, oy: y0 } = lay.current
    return r ? { x: (cx - r.left - x0) / s, y: (cy - r.top - y0) / s } : { x: 0, y: 0 }
  }
  const grab = (e: ReactPointerEvent, tapped: number) => {
    const G = g.current
    // On a small screen the bags' touch areas overlap: take the bag nearest the finger.
    const at = toStage(e.clientX, e.clientY)
    let slot = tapped
    if (S) for (let i = 0; i < S.presents.length; i++) if (slots[i] && Math.hypot(S.presents[i].x - at.x, S.presents[i].y - at.y) < Math.hypot(S.presents[slot].x - at.x, S.presents[slot].y - at.y)) slot = i
    const kind = slots[slot]
    if (!kind || !playing || G.busy || G.held || G.flights.length >= MAX_FLYING || !S) return
    e.stopPropagation()
    root.current?.setPointerCapture?.(e.pointerId)
    const p = toStage(e.clientX, e.clientY)
    const f: Flight = { id: G.nextId++, kind, x: p.x, y: p.y, vx: 0, vy: 0, t: 0, mode: 'held', who: null, chute: 0, hop: 0, trail: [{ ...p, t: performance.now() }] }
    G.flights.push(f)
    G.held = { pointer: e.pointerId, flight: f }
    setFlights((l) => [...l, { id: f.id, kind }])
    setSlots((s) => s.map((k, i) => (i === slot ? null : k)))
    sounds.pickup()
    // A new bag of the same kind is tied on a moment later.
    setTimeout(() => {
      if (alive()) setSlots((s) => s.map((k, i) => (i === slot ? kind : k)))
    }, 1100)
    requestAnimationFrame(() => {
      const el = flightEls.current.get(f.id)
      if (el) el.style.transform = `translate(${f.x}px, ${f.y}px)`
    })
  }
  const onMove = (e: ReactPointerEvent) => {
    const h = g.current.held
    if (!h || h.pointer !== e.pointerId || !S) return
    const p = toStage(e.clientX, e.clientY)
    const f = h.flight
    f.x = Math.max(30, Math.min(S.w - 30, p.x))
    f.y = Math.max(40, Math.min(S.ground[stop] - 120, p.y))
    f.trail.push({ x: f.x, y: f.y, t: performance.now() })
    if (f.trail.length > 6) f.trail.shift()
    const el = flightEls.current.get(f.id)
    if (el) el.style.transform = `translate(${f.x}px, ${f.y}px)`
  }
  const onUp = (e: ReactPointerEvent) => {
    const G = g.current
    const h = G.held
    if (!h || h.pointer !== e.pointerId) return
    G.held = null
    const f = h.flight
    const a = f.trail[0]
    const b = f.trail[f.trail.length - 1]
    const dtS = Math.max(0.016, (b.t - a.t) / 1000)
    f.vx = Math.max(-320, Math.min(320, ((b.x - a.x) / dtS) * 0.3))
    f.vy = Math.max(-200, Math.min(150, ((b.y - a.y) / dtS) * 0.15))
    f.mode = 'fall'
    f.t = 0
    sounds.whoosh()
  }

  const poke = (key: string, fn: () => void) => {
    g.current.pokes[key] = (g.current.pokes[key] ?? 0) + 1
    fn()
  }
  const pokePal = (id: FriendId) =>
    poke(id, () => {
      sounds.pop()
      const pal = g.current.pals[id]
      if (pal) pal.leap = Math.max(pal.leap, 0.4)
      void puppets.current[id]?.play(id === 'chick' ? 'peep' : id === 'lobo' ? 'bark' : id === 'rosa' ? 'spout' : id === 'tika' ? 'giggle' : id === 'coco' ? 'swoop' : id === 'pluma' ? 'giggle' : 'wiggle')
      const lines = POKE[id]
      if (lines) sayFriend(lines[(g.current.pokes[id] - 1) % lines.length])
      if (id === 'chick') sfx.chirp()
    })

  // ---- Rendering. ----
  const sceneFor = (st: Stop) => {
    if (!S) return null
    return (
      <>
        {st === 'coast' && <CoastGround S={S} />}
        {st === 'mountains' && <MountainGround S={S} />}
        {st === 'forest' && <ForestGround S={S} />}
        {pokeables(st, S)}
        {phase !== 'lineup' &&
          FRIENDS[st].map((id) => (
            <PalView
              key={id}
              id={id}
              h={S.friends[id].h}
              gift={worn[id] ?? null}
              elRef={(el) => (palEls.current[id] = el)}
              flipRef={(el) => (flipEls.current[id] = el)}
              puppetRef={(p) => (puppets.current[id] = p)}
              onPoke={() => pokePal(id)}
              x={S.friends[id].x}
              y={S.friends[id].y}
            />
          ))}
        {st === 'forest' &&
          S.canopy.leaves.map((l, i) => (
            <div key={i} style={{ position: 'absolute', left: l.x, top: S.canopy.y, zIndex: 6 }}>
              <motion.div key={leafKick[i]} animate={leafKick[i] ? { rotate: [0, -8, 6, -3, 0], y: [0, 10, -4, 0] } : {}} transition={{ duration: 0.6 }}>
                <Leaf r={l.r} glow={phase === 'night' && glow} />
              </motion.div>
            </div>
          ))}
      </>
    )
  }

  const pokeables = (st: Stop, S: BalloonLayout) => {
    const P = S.pokes
    const item = (key: string, img: string, at: { x: number; y: number; h: number }, onTap: () => void, flip?: boolean, voice?: string) => (
      <Poke key={key} img={img} at={at} onTap={() => poke(key, onTap)} flip={flip} voice={voice} label={key} />
    )
    if (st === 'coast')
      return (
        <>
          {item('crab', art.crab, P.crab, () => bsfx.click())}
          {item('tern', art.tern, P.tern, () => {
            bsfx.tweet()
            once('tern', L.penguins.tern)
          }, true)}
          {item('boat', art.boat, P.boat, () => bsfx.toot())}
          <div ref={pelicanEl} style={{ position: 'absolute', left: 0, top: 0, zIndex: 3 }}>
            <button
              aria-label="pelican"
              onPointerDown={(e) => {
                e.stopPropagation()
                poke('pelican', () => {
                  g.current.pelican.dive = 1
                  bsfx.squawk()
                  once('pelican', B.pelican)
                })
              }}
              style={{ position: 'absolute', left: -P.pelican.h * 0.8, top: -P.pelican.h / 2, width: P.pelican.h * 1.6, height: P.pelican.h, padding: 0, border: 'none', background: 'none' }}
            >
              <img src={art.pelicanFly} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </button>
          </div>
        </>
      )
    if (st === 'mountains')
      return (
        <>
          {item('llama', art.llamaGrey, P.llamaGrey, () => {
            sfx.munch()
            once('llama', L.terraces.carry)
          })}
          {item('viscacha', art.viscacha, P.viscacha, () => sfx.boing())}
          {item('bird', art.cockRock, P.bird, () => {
            bsfx.tweet()
            once('bird', L.facts.bird)
          }, true)}
        </>
      )
    return (
      <>
        {item('frog', art.frog, P.frog, () => sfx.boing())}
        {item('macaw', art.macaw, P.macaw, () => bsfx.squawk())}
        {item('toucan', art.toucan, P.toucan, () => bsfx.squawk(), true)}
      </>
    )
  }

  const night = phase === 'night' || phase === 'lineup'
  return (
    <div
      ref={root}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#A8DCFF', touchAction: 'none', userSelect: 'none' }}
    >
      {/* The far layer: the painting of the land under the balloon. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={stop}
          initial={{ x: '40%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-40%', opacity: 0 }}
          transition={{ duration: 2.4, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0, background: `url(${S?.tall ? BG[stop].tall : BG[stop].wide}) center / cover` }}
        />
      </AnimatePresence>
      {/* The sky's colour: afternoon, golden, sunset, night (each a layer that fades in). */}
      {(Object.keys(TINTS) as (keyof typeof TINTS)[]).map((k) => (
        <div key={k} style={{ position: 'absolute', inset: 0, background: TINTS[k], opacity: TINT_OF[phase] === k ? 1 : 0, transition: 'opacity 2.4s ease-in-out', pointerEvents: 'none' }} />
      ))}
      {night && <Stars />}

      {S && (
        <div style={{ position: 'absolute', left: ox, top: oy, width: S.w, height: S.h, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
          {/* Clouds. */}
          {cloudEls.map((r, i) => (
            <div key={i} ref={r} style={{ position: 'absolute', left: 0, top: 0, zIndex: 1, opacity: night ? 0.35 : 0.9 }}>
              <button
                aria-label="cloud"
                onPointerDown={() =>
                  poke('cloud', () => {
                    bsfx.puff()
                    g.current.clouds[i] += 0.08
                  })
                }
                style={{ padding: 0, border: 'none', background: 'none', display: 'block' }}
              >
                <Cloud w={[220, 160, 260][i]} />
              </button>
            </div>
          ))}

          {/* The near layer: this stop's ground and friends, sliding by as the balloon flies on. */}
          <AnimatePresence initial={false}>
            <motion.div
              key={stop}
              initial={{ x: S.w }}
              animate={{ x: 0 }}
              exit={{ x: -S.w * 1.2 }}
              transition={{ duration: 2.4, ease: 'easeInOut' }}
              style={{ position: 'absolute', inset: 0, zIndex: 2 }}
              onPointerDown={(e) => {
                // At night a tap on the forest sends up a lantern from there.
                if (!night) return
                const p = toStage(e.clientX, e.clientY)
                if (p.y > S.vine.y - 120) sendLantern(p.x)
              }}
            >
              {sceneFor(stop)}
            </motion.div>
          </AnimatePresence>

          {/* Lantern buds glowing in the canopy at night. */}
          {phase === 'night' &&
            S.lanterns.map((x, i) => (
              <motion.button
                key={x}
                aria-label="lantern"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: [1, 1.12, 1] }}
                transition={{ scale: { repeat: Infinity, duration: 1.4, delay: i * 0.2 }, opacity: { delay: 1 + i * 0.15 } }}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  sendLantern(x)
                }}
                style={{ position: 'absolute', left: x - 50, top: S.canopy.y - 90, width: 100, height: 110, padding: 0, border: 'none', background: 'none', zIndex: 7 }}
              >
                <div style={{ position: 'absolute', left: 50, top: 60 }}>
                  <Lantern size={58} lit={1} />
                </div>
              </motion.button>
            ))}
          {lanterns.map((l) => (
            <div key={l.id} ref={(el) => void (el ? lanternEls.current.set(l.id, el) : lanternEls.current.delete(l.id))} style={{ position: 'absolute', left: 0, top: 0, zIndex: 8, pointerEvents: 'none' }}>
              <Lantern size={64} />
            </div>
          ))}

          {/* Everyone lines up in their presents to wave goodbye. */}
          {phase === 'lineup' && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 9 }}>
              {S.lineup
                .flatMap((row) => row.xs.map((x) => ({ x, y: row.y })))
                .map((at, i) => {
                  const id = ALL_FRIENDS[i]
                  const h = LINEUP_H[id] * (S.tall ? 0.95 : 1)
                  return (
                    <motion.div
                      key={id}
                      initial={{ y: 300, opacity: 0 }}
                      animate={{ y: [0, -24, 0], opacity: 1 }}
                      transition={{ y: { delay: 0.8 + i * 0.15, duration: 0.6, repeat: Infinity, repeatDelay: 2.4 }, opacity: { delay: i * 0.12 } }}
                      style={{ position: 'absolute', left: at.x - (h * ASPECT[id]) / 2, top: at.y - h }}
                    >
                      <PalView id={id} h={h} gift={worn[id] ?? DEFAULT_GIFTS[id]} still onPoke={() => sayFriend(B.caught[id])} />
                    </motion.div>
                  )
                })}
            </div>
          )}

          {/* The balloon (with Luna and Sparkle) and the presents hanging under it. */}
          <div ref={balloonEl} style={{ position: 'absolute', left: 0, top: 0, width: S.w, height: S.h, zIndex: 10, pointerEvents: 'none' }}>
            <BalloonView
              S={S}
              flag={flag}
              flame={flame}
              sparkle={sparkle}
              luna={luna}
              onBurner={() =>
                poke('burner', () => {
                  bsfx.burner()
                  setFlame(1)
                  setTimeout(() => setFlame(0), 700)
                  g.current.lift = 30
                  once('burner', B.burner)
                })
              }
              onLuna={() =>
                poke('luna', () => {
                  void luna.current?.play('giggle')
                  sayFriend(B.lunaTap[g.current.lunaTaps++ % B.lunaTap.length])
                })
              }
              onSparkle={() => {
                void sparkle.current?.play('wiggle')
                const l = prompt ?? (playing ? B.idle.grab : night ? B.idle.lantern : null)
                if (l) void say(l)
              }}
            />
            {!night && S.presents.map((p, i) => {
              const kind = slots[i]
              const ribbonTop = S.balloon.basketTop + 120
              // Touch area: the bag, and never under 64px on a phone (AGENTS.md design rule 4).
              const hit = Math.max(S.present * 1.3, 66 / scale)
              return (
                <div key={i}>
                  <svg style={{ position: 'absolute', left: 0, top: 0, width: S.w, height: S.h, overflow: 'visible', pointerEvents: 'none' }}>
                    <path d={`M${S.balloon.x + (p.x - S.balloon.x) * 0.55} ${ribbonTop}L${p.x} ${p.y - S.present * 0.56}`} stroke="#FF5FA2" strokeWidth="4" />
                  </svg>
                  <AnimatePresence>
                    {kind && (
                      <motion.div
                        key={kind + i}
                        initial={{ y: -80, opacity: 0, scale: 0.6 }}
                        animate={{ y: 0, opacity: 1, scale: 1, rotate: [-5, 5, -5] }}
                        exit={{ opacity: 0 }}
                        transition={{ rotate: { repeat: Infinity, duration: 2.4 + i * 0.3, ease: 'easeInOut' }, default: { type: 'spring', stiffness: 160, damping: 12 } }}
                        style={{ position: 'absolute', left: p.x, top: p.y, transformOrigin: '0 -50px' }}
                      >
                        <button
                          aria-label={`present ${kind}`}
                          className={glow && playing ? 'world-glow' : undefined}
                          onPointerDown={(e) => grab(e, i)}
                          style={{ position: 'absolute', left: -hit / 2, top: -S.present * 0.72 - (hit - S.present * 1.3) / 2, width: hit, height: hit + S.present * 0.1, padding: 0, border: 'none', background: 'none', borderRadius: 24, pointerEvents: playing ? 'auto' : 'none', touchAction: 'none' }}
                        >
                          <div style={{ position: 'absolute', left: hit / 2, top: S.present * 0.72 + (hit - S.present * 1.3) / 2 }}>
                            <GiftBag kind={kind} size={S.present} />
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* Presents in the air. */}
          {flights.map((f) => (
            <div
              key={f.id}
              ref={(el) => void (el ? flightEls.current.set(f.id, el) : flightEls.current.delete(f.id))}
              style={{ position: 'absolute', left: 0, top: 0, zIndex: 12, pointerEvents: 'none' }}
            >
              <FlyingGift kind={f.kind} size={S.present} flight={g.current.flights.find((x) => x.id === f.id)} />
            </div>
          ))}
        </div>
      )}

      {/* Under the top bar: what to do now (spoken when it appears). */}
      {prompt && phase !== 'story' && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, paddingTop: 'var(--top-clear)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 25 }}>
          <div style={{ pointerEvents: 'auto', maxWidth: 'calc(100% - 24px)' }}>
            <PromptBubble text={prompt} />
          </div>
        </div>
      )}

      {phase === 'story' && (
        <StoryBeat
          lines={B.story}
          bg={art.bgAndes}
          friend={<Alpaca kind="luna" height="60%" label="Luna" />}
          onDone={() => {
            setPhase('coast')
            arrive('coast')
          }}
        />
      )}
    </div>
  )
}

/** A present in the air: its parachute opens when she lets go. Reads the chute from the flight each frame via a
 *  little loop of its own (cheap: a handful at most). */
function FlyingGift({ kind, size, flight }: { kind: GiftKind; size: number; flight?: Flight }) {
  const [chute, setChute] = useState(0)
  useGameLoop(() => {
    const c = flight ? Math.round(flight.chute * 10) / 10 : 0
    if (c !== chute) setChute(c)
  })
  return <GiftBag kind={kind} size={size} chute={chute} />
}

/** The balloon: envelope, burner, basket, Luna and Sparkle riding in it. */
function BalloonView({ S, flag, flame, sparkle, luna, onBurner, onLuna, onSparkle }: { S: BalloonLayout; flag: boolean; flame: number; sparkle: RefObject<PuppetHandle | null>; luna: RefObject<PuppetHandle | null>; onBurner: () => void; onLuna: () => void; onSparkle: () => void }) {
  const b = S.balloon
  const envH = (b.w * 420) / 340
  const basketH = (b.basketW * 130) / 320
  const left = b.x - b.basketW / 2
  return (
    <>
      <div style={{ position: 'absolute', left: b.x - b.w / 2, top: b.top, width: b.w, height: envH }}>
        <Envelope flag={flag} flame={flame} />
        <button
          aria-label="burner"
          onPointerDown={(e) => {
            e.stopPropagation()
            onBurner()
          }}
          style={{ position: 'absolute', left: '34%', top: '62%', width: '32%', height: '22%', padding: 0, border: 'none', background: 'none', borderRadius: '50%', pointerEvents: 'auto' }}
        />
      </div>
      {/* Sparkle and Luna stand in the basket: only their heads and shoulders show above the rim. */}
      <div style={{ position: 'absolute', left, top: b.basketTop - b.basketW * 0.5, width: b.basketW, height: b.basketW * 0.5 + basketH, clipPath: 'inset(-400px -400px 0 -400px)' }}>
        <button aria-label="Luna" onPointerDown={(e) => (e.stopPropagation(), onLuna())} style={{ position: 'absolute', right: '-14%', top: b.basketW * 0.5 + 18 - b.basketW * 0.42, padding: 0, border: 'none', background: 'none', pointerEvents: 'auto' }}>
          <Alpaca ref={luna} kind="luna" height={`${b.basketW * 0.8}px`} hat="pink" label="Luna" />
        </button>
        <button aria-label="Sparkle" onPointerDown={(e) => (e.stopPropagation(), onSparkle())} style={{ position: 'absolute', left: '-8%', top: b.basketW * 0.5 + 18 - b.basketW * 0.46, padding: 0, border: 'none', background: 'none', pointerEvents: 'auto' }}>
          <SparklePuppet ref={sparkle} height={`${b.basketW * 0.8}px`} lookToward={0.6} />
        </button>
      </div>
      <div style={{ position: 'absolute', left, top: b.basketTop, width: b.basketW, height: basketH, pointerEvents: 'none' }}>
        <BasketFront />
      </div>
      {/* At night Peru's flag unrolls under the basket. */}
      <AnimatePresence>
        {flag && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1, rotate: [-3, 3, -3] }}
            transition={{ scaleY: { type: 'spring', stiffness: 120, damping: 10 }, rotate: { repeat: Infinity, duration: 2.6 } }}
            style={{ position: 'absolute', left: b.x - b.basketW * 0.32, top: b.basketTop + basketH - 6, transformOrigin: '50% 0' }}
          >
            <Flag id="peru" width={b.basketW * 0.64} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/** A friend at a stop (or in the lineup), wearing their present once they've caught it. */
function PalView({ id, h, gift, elRef, flipRef, puppetRef, onPoke, x, y, still }: { id: FriendId; h: number; gift: GiftKind | null; elRef?: (el: HTMLDivElement | null) => void; flipRef?: (el: HTMLDivElement | null) => void; puppetRef?: (p: PuppetHandle | null) => void; onPoke: () => void; x?: number; y?: number; still?: boolean }) {
  const w = h * ASPECT[id]
  const hh = `${h}px`
  let body: ReactNode
  if (id === 'pepa') body = <Penguin ref={puppetRef} kind="pepa" height={hh} label="Pepa" />
  else if (id === 'chick') body = <PenguinChick ref={puppetRef} height={hh} full={1} tuft={1} label="Pepa's chick" />
  else if (id === 'lobo') body = <Lobo ref={puppetRef} height={hh} label="Lobo" />
  else if (id === 'coco')
    body = (
      <div style={{ width: w, height: h }}>
        <Condor ref={puppetRef} height={hh} lift={0.6} label="Coco" />
      </div>
    )
  else if (id === 'pluma')
    body = (
      <div style={{ width: w, height: h }}>
        <CondorChick ref={puppetRef} height={hh} flying confidence={1} label="Pluma" />
      </div>
    )
  else if (id === 'tika') body = <Tika ref={puppetRef} height={hh} label="Tika" />
  else if (id === 'rosa') body = <Rosa ref={puppetRef} height={hh} label="Rosa" />
  else body = <Buddy ref={puppetRef} img={id === 'sloth' ? art.sloth : art.monkey} voice={id} height={hh} alt={id} />
  const spot = gift ? (ON_EYES[gift] ? WEAR[id].eyes : WEAR[id].head) : null
  const ww = spot ? spot[2] * w : 0
  const startX = x !== undefined ? x - w / 2 : 0
  const startTop = y !== undefined ? (MOVE[id] === 'ground' ? y - h : y - h / 2) : 0
  return (
    <div ref={elRef} style={{ position: still ? 'relative' : 'absolute', left: 0, top: 0, width: w, height: h, zIndex: MOVE[id] === 'fly' ? 5 : 4, transform: still ? undefined : `translate(${startX}px, ${startTop}px)` }}>
      <div ref={flipRef} style={{ position: 'relative', width: w, height: h }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h }}>{body}</div>
        <AnimatePresence>
          {gift && spot && (
            <motion.svg
              key={gift}
              initial={{ scale: 0, y: -60, rotate: -30 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 12 }}
              viewBox={ON_EYES[gift] ? '-55 -30 110 60' : '-55 -95 110 110'}
              style={{ position: 'absolute', left: spot[0] * w - ww / 2, top: spot[1] * h - (ON_EYES[gift] ? (ww * 30) / 110 : (ww * 95) / 110), width: ww, height: ON_EYES[gift] ? (ww * 60) / 110 : ww, overflow: 'visible', pointerEvents: 'none' }}
            >
              <WornItem kind={gift} />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
      <button
        aria-label={id}
        onPointerDown={(e) => {
          e.stopPropagation()
          onPoke()
        }}
        style={{ position: 'absolute', inset: '-10%', padding: 0, border: 'none', background: 'none', borderRadius: '30%' }}
      />
    </div>
  )
}

/** Something in the scene that answers a tap (a sprite that bounces and makes a sound). */
function Poke({ img, at, onTap, flip, voice, label }: { img: string; at: { x: number; y: number; h: number }; onTap: () => void; flip?: boolean; voice?: string; label: string }) {
  const ref = useRef<PuppetHandle>(null)
  return (
    <button
      aria-label={label}
      onPointerDown={(e) => {
        e.stopPropagation()
        void ref.current?.play('jump')
        onTap()
      }}
      style={{ position: 'absolute', left: at.x, top: at.y - at.h, transform: 'translateX(-50%)', padding: 0, border: 'none', background: 'none', zIndex: 3 }}
    >
      <Buddy ref={ref} img={img} height={`${at.h}px`} flip={flip} voice={voice} alt="" calm />
    </button>
  )
}

/** Twinkling stars at night. */
function Stars() {
  const [stars] = useState(() => Array.from({ length: 40 }, () => ({ x: Math.random() * 100, y: Math.random() * 55, d: Math.random() * 2, s: 2 + Math.random() * 3 })))
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {stars.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 + s.d, delay: s.d }}
          style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, borderRadius: '50%', background: '#FFF7D6', boxShadow: '0 0 6px #FFF7D6' }}
        />
      ))}
    </div>
  )
}


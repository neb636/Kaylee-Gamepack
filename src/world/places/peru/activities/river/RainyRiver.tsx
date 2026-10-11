// 🐬 Rosa's Rainy River (Amazon rainforest: rain, the flooding forest, pink river dolphins). Plan:
// planning/around-the-world/peru.md § 4.
// The toy (one core verb): grab the rain cloud and squeeze it. Holding it makes it rain right there (harder when she
// wiggles it, with a soft rumble); dragging it rains a trail. Everything under the rain answers. The verb deepens:
//   1. Rain on the forest: heliconias shoot up and flower, the frog pops out and sings, the leafcutter ants hold their
//      leaves up like umbrellas, the sleepy sloth slowly opens one eye ("Hiiiii..."), the macaws fluff up, the puddle
//      fills, Sparkle shakes like a dog.
//   2. Fill the river: rain over the river raises it step by step, climbing the tree trunks. Each step lets Rosa reach
//      a friend: the capybaras float off their sandbar, the sloth dips her toes, the monkeys lean down to splash.
//   3. The lily lagoon: the camera pans to a dry lagoon; Rosa leaps over. Rain fills it, rain on each bud unrolls a
//      giant lily pad, and she drags friends onto the pads. Then the sun comes out, a rainbow, Rosa's biggest jump.
// Taps work too: a tap on the cloud is a quick shower, a tap on the river or the lagoon sends the cloud there to rain.
// Per-frame work (cloud, rain, water levels, Rosa, floating things) runs in refs and one game loop.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { burst, say, shuffle, sounds, SparklePuppet, useAlive, useGameLoop, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from './art'
import { L } from './lines'
import type { ActivityProps } from '../../Place'
import { Rosa, ROSA_VIEW } from '../../puppets/Rosa'
import { groundAt, groundLine, groundShape, hollowPath, levelY, pickLayout, waterSpan, type RiverLayout } from './layout'
import { Ants, Butterfly, Critter, FrogLeaf, Fruit, HintRing, Liana, Lily, NibbleFish, Plant, Puddle, Rainbow, Sloth, Sun, Tree } from './Scene'
import { rsfx } from './sfx'
import { Cloud, Rain, type CloudHandle, type RainHandle } from './Weather'

const R = L.river
/** Stars: the forest wakes, the capybaras, the sloth, the monkeys, the lagoon, the lily friends. */
const TOTAL = 6
const SKY = '#94D3FB'
const SOIL = '#8A5C3C'
/** The far riverbank's mud behind the water. */
const BANK = '#C49A70'
/** Seconds of steady rain right over the river (or the lagoon) to fill it. */
const RIVER_SECONDS = 22
const LAGOON_SECONDS = 7
/** River fill shares where Rosa can reach each friend. */
const STEPS = [0.3, 0.58, 1] as const
const FRIENDS = ['capy', 'sloth', 'monkey'] as const
type Friend = (typeof FRIENDS)[number]
/** Who can sit on the lily pads (three of them come, shuffled every time). */
const PAD_CRITTERS = ['frog', 'monkey', 'capy', 'macaw'] as const
type PadCritter = (typeof PAD_CRITTERS)[number]
const PAD_IMG: Record<PadCritter, string> = { frog: art.frog, monkey: art.monkey, capy: art.capybaraBaby, macaw: art.macaw }
const PAD_H: Record<PadCritter, number> = { frog: 90, monkey: 120, capy: 100, macaw: 125 }
const FRUIT_COLORS = ['#B9A6F5', '#FFB347', '#FF8FB8']
/** The canoe picture's width / height. */
const CANOE = 4.785

type Phase = 'story' | 'forest' | 'river' | 'swim' | 'lagoon' | 'pads' | 'rainbow' | 'done'
/** Things in the forest that answer the rain (each soaks up rain separately). */
type Wet = 'lbirds' | 'plant0' | 'plant1' | 'plant2' | 'frog' | 'ants' | 'sloth' | 'macaws' | 'toucan' | 'sparkle' | 'puddle' | 'capys' | 'monkeys' | 'bud0' | 'bud1' | 'bud2'

declare global {
  interface Window {
    __peruRiverQA?: { jump: (to: 'river' | 'lagoon' | 'pads' | 'rainbow') => void; rain: (x: number, seconds: number) => void; state: () => object }
  }
}

export function RainyRiver({ onDone, setProgress }: ActivityProps) {
  const alive = useAlive()
  const root = useRef<HTMLDivElement>(null)
  const stageEl = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ W: 0, H: 0 })
  const [phase, setPhaseState] = useState<Phase>('story')
  const [prompt, setPrompt] = useState<Line | null>(null)
  const [stars, setStars] = useState(0)
  const [cam, setCam] = useState(0)
  const [plants, setPlants] = useState([0, 0, 0])
  const [frogUp, setFrogUp] = useState(false)
  const [sing, setSing] = useState(0)
  const [umbrella, setUmbrella] = useState(false)
  const [puddle, setPuddle] = useState(0)
  const [slothEyes, setSlothEyes] = useState(0)
  const [fluff, setFluff] = useState(0)
  const [fruits, setFruits] = useState<{ gone: boolean; at?: { x: number; y: number }; fish: number }[]>([0, 1, 2].map(() => ({ gone: false, fish: 0 })))
  const [babyOnBack, setBabyOnBack] = useState(false)
  const [buds, setBuds] = useState([0, 0, 0])
  const [padCritters] = useState<PadCritter[]>(() => shuffle([...PAD_CRITTERS]).slice(0, 3))
  /** For each lily friend: the pad it sits on (or null while it waits on the bank). */
  const [seats, setSeats] = useState<(number | null)[]>([null, null, null])
  const [glow, setGlow] = useState<null | 'cloud' | 'friends' | 'river' | 'lagoon'>(null)
  const [hints, setHints] = useState<{ x: number; y: number }[]>([])
  const [sun, setSun] = useState(false)
  /** Fish that leap out of the lagoon when it rains on them. */
  const [leaps, setLeaps] = useState<{ id: number; x: number; y: number }[]>([])
  const [flash, setFlash] = useState(0)

  const rosa = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const cloud = useRef<CloudHandle>(null)
  const rain = useRef<RainHandle>(null)
  const frog = useRef<PuppetHandle>(null)
  const slothP = useRef<PuppetHandle>(null)
  const macaws = [useRef<PuppetHandle>(null), useRef<PuppetHandle>(null)]
  const toucan = useRef<PuppetHandle>(null)
  const monkeys = [useRef<PuppetHandle>(null), useRef<PuppetHandle>(null)]
  const capys = [useRef<PuppetHandle>(null), useRef<PuppetHandle>(null)]
  const friendP = [useRef<PuppetHandle>(null), useRef<PuppetHandle>(null), useRef<PuppetHandle>(null)]
  // Things that float: the capybaras, the canoe, the lily pads and the friends on them (moved by the loop).
  const capyEls = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  const canoeEl = useRef<HTMLDivElement>(null)
  const lilyEls = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  const friendEls = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  const rosaEl = useRef<HTMLDivElement>(null)
  const rosaFace = useRef<HTMLDivElement>(null)
  const riverWater = useRef<SVGRectElement>(null)
  const riverSurf = useRef<SVGPathElement>(null)
  const lagoonWater = useRef<SVGRectElement>(null)
  const lagoonSurf = useRef<SVGPathElement>(null)
  const monkeyEls = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  const lbirds = [useRef<PuppetHandle>(null), useRef<PuppetHandle>(null)]
  const flood = useRef<SVGPathElement>(null)
  const floodSurf = useRef<SVGPathElement>(null)
  const antsEl = useRef<HTMLDivElement>(null)

  useEffect(() => setProgress(Math.min(stars, TOTAL), TOTAL), [stars])
  // The rain hiss is one looping sound: cut it the moment she leaves.
  useEffect(() => () => rsfx.stopRain(), [])
  const star = (n: number) => setStars((s) => Math.max(s, n))

  // ---- Mutable state for pointer handling and the loop (React never sees it per frame). ----
  const g = useRef({
    phase: 'story' as Phase,
    cloud: { x: 0, y: 0, tx: 0, ty: 0, squeeze: 0, held: null as null | { id: number; dx: number; dy: number; sx: number; sy: number; t: number; moved: boolean }, shower: 0, showerOnArrive: false, speed: 0, lastX: 0, lastY: 0, flashUntil: 0, nextRumble: 0, placed: false },
    /** How hard it's raining right now (0..1.3). */
    rain: 0,
    spawn: 0,
    wet: {} as Partial<Record<Wet, number>>,
    /** Things soaked since their last reaction (cleared for things that react again later). */
    woke: new Set<Wet>(),
    /** Every different thing that has reacted to her rain (the forest is awake after four). */
    seen: new Set<Wet>(),
    river: 0,
    lagoon: 0,
    shownRiver: 0,
    shownLagoon: 0,
    reached: 0,
    rosa: { x: 0, y: 0, vx: 0, face: 1, target: null as null | number, wander: 0, nextWander: 0, basin: 'river' as 'river' | 'lagoon', leap: null as null | { t: number; from: { x: number; y: number }; to: { x: number; y: number } }, talking: 0 },
    cam: 0,
    seats: [null, null, null] as (number | null)[],
    drag: null as null | { id: number; who: number; x: number; y: number; sx: number; sy: number; moved: boolean },
    buds: [0, 0, 0],
    lastTouch: performance.now(),
    lastProgress: performance.now(),
    lastHint: 0,
    busy: false,
    plants: [0, 0, 0],
    puddle: 0,
    slothEyes: 0,
    sparkleWet: 0,
    facts: 0,
    spouts: 0,
    fruitFact: false,
    nextPlink: 0,
    nextLeap: 0,
    leapId: 1,
  })
  const setPhase = (p: Phase) => {
    g.current.phase = p
    setPhaseState(p)
  }

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
  const S: RiverLayout | null = size.W ? pickLayout(size.W, size.H) : null
  const scale = S ? Math.min(size.W / S.w, size.H / S.h) : 1
  const ox = S ? (size.W - S.w * scale) / 2 : 0
  const oy = S ? (size.H - S.h * scale) / 2 : 0
  // The cloud stays below the prompt bubble (about 190px from the top of the screen) even on short screens.
  const cloudMin = S ? Math.max(S.cloud.yMin, (190 - oy) / scale + S.cloud.w * 0.36) : 0
  const cloudMax = S ? Math.max(S.cloud.yMax, cloudMin + 60) : 0
  const lay = useRef({ S, scale, ox, oy, cloudMin, cloudMax })
  lay.current = { S, scale, ox, oy, cloudMin, cloudMax }
  const camX = S ? cam * S.camLagoon : 0
  g.current.cam = camX

  // Place the cloud and Rosa once the stage is known (and again if the stage changes shape).
  useEffect(() => {
    if (!S) return
    const G = g.current
    const c = G.cloud
    if (!c.placed || c.x > S.worldW) {
      c.x = c.tx = G.cam + S.cloud.w * 0.55
      c.y = c.ty = S.cloud.y0
      c.placed = true
    }
    c.y = c.ty = Math.min(cloudMax, Math.max(cloudMin, c.ty))
    const pts = G.rosa.basin === 'river' ? S.river : S.lagoon
    const [l, r] = waterSpan(pts, G.rosa.basin === 'river' ? levelY(S.riverLow, S.riverHigh, G.river) : levelY(S.lagoonLow, S.lagoonHigh, G.lagoon))
    G.rosa.x = (l + r) / 2
  }, [S, cloudMin])

  /** Finger position in world units. */
  const toWorld = (cx: number, cy: number) => {
    const r = stageEl.current?.getBoundingClientRect()
    const s = lay.current.scale
    return r ? { x: (cx - r.left) / s + g.current.cam, y: (cy - r.top) / s } : { x: 0, y: 0 }
  }

  const say1 = (line: Line) => void say(line)
  /** A tap on the water: the cloud floats over and rains right there. */
  const rainAt = (cx: number) => {
    const G = g.current
    const S0 = lay.current.S
    if (!S0 || G.busy || G.phase === 'story' || G.phase === 'rainbow' || G.phase === 'done') return
    G.lastTouch = performance.now()
    const x = toWorld(cx, 0).x
    G.cloud.tx = Math.min(G.cam + S0.w - S0.cloud.w * 0.4, Math.max(G.cam + S0.cloud.w * 0.4, x))
    G.cloud.showerOnArrive = true
    if (glow === 'river' || glow === 'lagoon') setGlow(null)
  }
  const progress = () => {
    g.current.lastProgress = performance.now()
    if (hintsOn.current) {
      hintsOn.current = false
      setHints([])
      setGlow(null)
    }
  }
  const hintsOn = useRef(false)

  // ---- The story, then play. ----
  const startPlay = () => {
    setPhase('forest')
    setPrompt(R.squeeze)
    g.current.lastTouch = g.current.lastProgress = performance.now()
  }

  // ---- Rain on the forest: each thing reacts once it's soaked a little (and some again later). ----
  const soaked = (k: Wet) => {
    const G = g.current
    G.woke.add(k)
    G.seen.add(k)
    progress()
    switch (k) {
      case 'plant0':
      case 'plant1':
      case 'plant2': {
        const i = Number(k.slice(-1))
        if (G.plants[i] >= 3) {
          G.woke.delete(k)
          G.wet[k] = -5
          return
        }
        G.plants[i]++
        setPlants([...G.plants])
        if (G.plants[i] === 3) rsfx.bloom()
        else rsfx.grow()
        G.woke.delete(k)
        G.wet[k] = 0
        break
      }
      case 'frog':
        setFrogUp(true)
        setSing((s) => s + 1)
        rsfx.croak()
        void frog.current?.play('jump')
        G.woke.delete(k)
        G.wet[k] = -0.6
        break
      case 'ants':
        setUmbrella(true)
        setTimeout(() => alive() && !floodedRef.current && setUmbrella(false), 3500)
        sounds.pop()
        G.woke.delete(k)
        G.wet[k] = -2
        break
      case 'sloth':
        if (G.slothEyes === 0) {
          G.slothEyes = 1
          setSlothEyes(1)
          rsfx.yawn()
          setTimeout(() => alive() && say1(R.slothWake), 900)
          G.woke.delete(k)
          G.wet[k] = -3
        } else if (G.slothEyes === 1) {
          G.slothEyes = 2
          setSlothEyes(2)
          rsfx.yawn()
          say1(R.slothYawn)
        }
        // Wiggles once per soaking (then has to soak again), so she isn't stuck restarting it every frame.
        G.woke.delete(k)
        G.wet[k] = -3
        void slothP.current?.play('wiggle')
        break
      case 'macaws':
        setFluff((f) => f + 1)
        rsfx.squawk()
        macaws.forEach((m) => void m.current?.play('wiggle'))
        G.woke.delete(k)
        G.wet[k] = -2
        break
      case 'lbirds':
        rsfx.squawk()
        lbirds.forEach((b) => void b.current?.play('wiggle'))
        G.woke.delete(k)
        G.wet[k] = -2
        break
      case 'toucan':
        rsfx.clack()
        void toucan.current?.play('wiggle')
        G.woke.delete(k)
        G.wet[k] = -2
        break
      case 'sparkle':
        void sparkle.current?.play('wiggle')
        if (G.sparkleWet++ === 0) say1(R.wet)
        sounds.whoosh()
        G.woke.delete(k)
        G.wet[k] = -2.5
        break
      case 'monkeys':
        rsfx.chatter()
        monkeys.forEach((m) => void m.current?.play('jump'))
        G.woke.delete(k)
        G.wet[k] = -2
        break
      case 'capys':
        rsfx.squeak()
        capys.forEach((c) => void c.current?.play('nod'))
        G.woke.delete(k)
        G.wet[k] = -2.5
        break
    }
    // Woke enough of the forest: now the river.
    if (G.phase === 'forest' && G.seen.size >= 4) toRiver()
  }

  const toRiver = () => {
    const G = g.current
    if (G.phase !== 'forest') return
    star(1)
    setPhase('river')
    setPrompt(R.river)
  }

  // ---- Fill the river: each step lets Rosa visit a friend. ----
  const reach = async (i: number) => {
    const G = g.current
    const S0 = lay.current.S
    if (!S0) return
    G.reached = i + 1
    star(i + 2)
    if (G.phase === 'forest') toRiver()
    const who: Friend = FRIENDS[i]
    const goal = who === 'capy' ? S0.capys[0].x + 80 : who === 'sloth' ? S0.sloth.x : S0.canoe.x - 120
    G.rosa.target = goal
    sounds.correct()
    if (i === 0) await say(R.more)
    if (!alive()) return
    await wait(1200)
    if (!alive()) return
    void rosa.current?.play('cheer')
    if (who === 'capy') capys.forEach((c) => void c.current?.play('jump'))
    if (who === 'sloth') void slothP.current?.play('nod')
    if (who === 'monkey') {
      monkeys.forEach((m) => void m.current?.play('dance'))
      rsfx.splash(true)
      rsfx.chatter()
    }
    const [a, b] = R.hello[who]
    await say(a, { interrupt: false })
    if (!alive()) return
    await say(b, { interrupt: false })
    if (!alive()) return
    // Only let her go if a later visit hasn't already called her somewhere else.
    if (G.rosa.target === goal) G.rosa.target = null
    if (G.reached === 3 && i === 2) void toLagoon()
  }

  const toLagoon = async () => {
    const G = g.current
    if (G.phase === 'swim' || G.phase === 'lagoon') return
    G.busy = true
    setPhase('swim')
    setPrompt(null)
    void rosa.current?.play('cheer')
    await say(R.lagoonGo)
    if (!alive()) return
    const S0 = lay.current.S
    if (!S0) return
    // Rosa leaps over the bank into the little pool in the lagoon while the camera follows her.
    const from = { x: G.rosa.x, y: G.rosa.y }
    const pool = waterSpan(S0.lagoon, levelY(S0.lagoonLow, S0.lagoonHigh, 0))
    const to = { x: (pool[0] + pool[1]) / 2, y: levelY(S0.lagoonLow, S0.lagoonHigh, 0) }
    setCam(1)
    G.cloud.tx = S0.camLagoon + S0.w * 0.5
    G.cloud.ty = Math.max(lay.current.cloudMin, S0.cloud.y0)
    await wait(500)
    if (!alive()) return
    G.rosa.leap = { t: 0, from, to }
    G.rosa.face = 1
    void rosa.current?.play('jump')
    sounds.whoosh()
    void say(R.flooded, { interrupt: false })
    await wait(1700)
    if (!alive()) return
    setPhase('lagoon')
    setPrompt(R.lagoon)
    G.busy = false
    G.lastTouch = G.lastProgress = performance.now()
  }

  /** The lagoon is full and every lily pad is open: the friends come to sit on them. */
  const toPads = () => {
    const G = g.current
    if (G.phase !== 'lagoon') return
    star(5)
    setPhase('pads')
    setPrompt(R.pads)
    sounds.sparkle()
    G.lastTouch = G.lastProgress = performance.now()
  }

  const seat = (who: number, pad: number | null) => {
    const G = g.current
    if (G.seats[who] !== null) return
    // Dropped on a taken pad (or tapped): the nearest free one.
    const free = [0, 1, 2].filter((p) => !G.seats.includes(p))
    if (!free.length) return
    const p = pad !== null && free.includes(pad) ? pad : free[0]
    G.seats = G.seats.map((s, i) => (i === who ? p : s))
    setSeats(G.seats)
    progress()
    rsfx.splash()
    void friendP[who].current?.play('cheer')
    const c = padCritters[who]
    say1(R.hop[c])
    if (G.seats.every((s) => s !== null)) void finale()
  }

  const finale = async () => {
    const G = g.current
    if (G.phase !== 'pads') return
    G.busy = true
    setPhase('rainbow')
    setPrompt(null)
    star(6)
    await wait(1400)
    if (!alive()) return
    void sparkle.current?.play('wave')
    await say(R.sun)
    if (!alive()) return
    // The cloud floats away, the sun comes out, a rainbow.
    const S0 = lay.current.S
    if (S0) {
      G.cloud.tx = S0.worldW + 500
      G.cloud.ty = S0.cloud.yMin - 80
    }
    setSun(true)
    sounds.sparkle()
    await wait(1600)
    if (!alive()) return
    rsfx.bloom()
    void rosa.current?.play('jump')
    rsfx.splash(true)
    friendP.forEach((f) => void f.current?.play('cheer'))
    void sparkle.current?.play('cheer')
    burst(0.5, 0.4)
    await say(R.rainbow)
    if (!alive()) return
    rsfx.click()
    setFlash((f) => f + 1)
    await say(R.photo)
    await wait(900)
    if (!alive()) return
    setPhase('done')
    onDone()
  }

  // ---- Pokeables ----
  /** Tap Rosa: she spouts and giggles, and the cloud comes over to rain on her (she loves the rain). */
  const tapRosa = (e: { clientX: number }) => {
    const G = g.current
    rainAt(e.clientX)
    rsfx.spout()
    void rosa.current?.play(G.spouts % 3 === 2 ? 'giggle' : 'spout')
    say1(G.spouts % 4 === 3 ? R.rosaTap : R.spout[G.spouts % R.spout.length])
    G.spouts++
  }
  const tapSparkle = () => {
    void sparkle.current?.play('nod')
    sounds.pop()
    say1(R.facts[g.current.facts++ % R.facts.length])
  }
  const dropFruit = (i: number) => {
    const S0 = lay.current.S
    if (!S0 || fruits[i].gone) return
    const f = S0.fruits[i]
    const G = g.current
    const water = levelY(S0.riverLow, S0.riverHigh, G.shownRiver)
    const [l, r] = waterSpan(S0.river, water)
    const wet = f.x > l && f.x < r
    const land = wet ? water : groundAt(S0, f.x)
    rsfx.drop()
    setFruits((list) => list.map((x, k) => (k === i ? { ...x, gone: true, at: { x: f.x, y: land } } : x)))
    setTimeout(() => {
      if (!alive()) return
      if (wet) {
        rsfx.splash()
        setFruits((list) => list.map((x, k) => (k === i ? { ...x, fish: x.fish + 1 } : x)))
        if (!G.fruitFact) {
          G.fruitFact = true
          say1(R.fruit)
        }
      } else sounds.pop()
    }, 650)
    // It grows back.
    setTimeout(() => alive() && setFruits((list) => list.map((x, k) => (k === i ? { ...x, gone: false, at: undefined } : x))), 6000)
  }

  // ---- Pointer handling on the stage ----
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    const S0 = lay.current.S
    G.lastTouch = performance.now()
    if (!S0 || G.phase === 'story' || G.phase === 'done') return
    const target = e.target as Element
    const p = toWorld(e.clientX, e.clientY)
    const friendEl = target.closest('[data-friend]') as HTMLElement | null
    if (friendEl && G.phase === 'pads' && !G.drag) {
      const who = Number(friendEl.dataset.friend)
      if (G.seats[who] === null) {
        G.drag = { id: e.pointerId, who, x: p.x, y: p.y, sx: p.x, sy: p.y, moved: false }
        e.currentTarget.setPointerCapture(e.pointerId)
        sounds.pop()
        setGlow(null)
      }
      return
    }
    if (target.closest('button')) return
    if (G.busy || G.phase === 'rainbow') return
    const c = G.cloud
    if (target.closest('[data-cloud]') && !c.held) {
      c.held = { id: e.pointerId, dx: c.x - p.x, dy: c.y - p.y, sx: p.x, sy: p.y, t: performance.now(), moved: false }
      c.lastX = p.x
      c.lastY = p.y
      c.showerOnArrive = false
      e.currentTarget.setPointerCapture(e.pointerId)
      if (glow === 'cloud') setGlow(null)
      return
    }
    // A tap anywhere else: the cloud drifts over; a tap low down (the river, the lagoon, the forest) rains there.
    c.tx = Math.min(G.cam + S0.w - S0.cloud.w * 0.4, Math.max(G.cam + S0.cloud.w * 0.4, p.x))
    if (p.y < lay.current.cloudMax + 60) c.ty = Math.min(lay.current.cloudMax, Math.max(lay.current.cloudMin, p.y))
    else c.showerOnArrive = true
  }

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    const S0 = lay.current.S
    if (!S0) return
    const c = G.cloud
    const p = toWorld(e.clientX, e.clientY)
    if (c.held && e.pointerId === c.held.id) {
      c.tx = Math.min(G.cam + S0.w - S0.cloud.w * 0.3, Math.max(G.cam + S0.cloud.w * 0.3, p.x + c.held.dx))
      c.ty = Math.min(lay.current.cloudMax, Math.max(lay.current.cloudMin, p.y + c.held.dy))
      // How much she wiggles it: fast moves wring out extra rain.
      const d = Math.hypot(p.x - c.lastX, p.y - c.lastY)
      c.speed = Math.min(1, c.speed + d / 220)
      c.lastX = p.x
      c.lastY = p.y
      if (Math.hypot(p.x - c.held.sx, p.y - c.held.sy) > 14) c.held.moved = true
    } else if (G.drag && e.pointerId === G.drag.id) {
      G.drag.x = p.x
      G.drag.y = p.y
      if (Math.hypot(p.x - G.drag.sx, p.y - G.drag.sy) > 10) G.drag.moved = true
      const el = friendEls[G.drag.who].current
      if (el) el.style.translate = `${p.x - G.drag.sx}px ${p.y - G.drag.sy}px`
    }
  }

  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    const c = G.cloud
    const S0 = lay.current.S
    if (c.held && e.pointerId === c.held.id) {
      // A quick tap: a short shower right here.
      if (!c.held.moved && performance.now() - c.held.t < 350) c.shower = performance.now() + 2200
      c.held = null
    } else if (G.drag && e.pointerId === G.drag.id && S0) {
      const d = G.drag
      G.drag = null
      const el = friendEls[d.who].current
      if (el) el.style.translate = ''
      if (!d.moved) seat(d.who, null)
      else {
        let best: number | null = null
        let bestD = S0.pad * 0.9
        S0.buds.forEach((bx, i) => {
          const py = levelY(S0.lagoonLow, S0.lagoonHigh, G.shownLagoon)
          const dd = Math.hypot(bx - d.x, py - S0.pad * 0.2 - d.y)
          if (dd < bestD) {
            bestD = dd
            best = i
          }
        })
        if (best !== null) seat(d.who, best)
        else sounds.pop()
      }
    }
  }

  // ---- The loop: cloud, rain, water, Rosa, floating things, the quiet guide ----
  useGameLoop((dt) => {
    if (dt <= 0) return
    const S0 = lay.current.S
    if (!S0) return
    const G = g.current
    const now = performance.now()
    const t = now / 1000
    const c = G.cloud

    // The cloud: follows her finger with a squishy lag, or drifts to where she tapped.
    const k = Math.min(1, dt * (c.held ? 10 : 2.6))
    c.x += (c.tx - c.x) * k
    c.y += (c.ty - c.y) * k
    if (c.showerOnArrive && Math.abs(c.tx - c.x) < 30) {
      c.showerOnArrive = false
      c.shower = now + 2500
    }
    c.speed = Math.max(0, c.speed - dt * 1.6)
    const squeezing = c.held ? 0.85 + c.speed * 0.45 : now < c.shower ? 0.9 : 0
    const playing = G.phase !== 'story' && G.phase !== 'rainbow' && G.phase !== 'done' && G.phase !== 'swim'
    c.squeeze += ((playing ? squeezing : 0) - c.squeeze) * Math.min(1, dt * (squeezing > c.squeeze ? 6 : 3))
    G.rain = c.squeeze < 0.12 ? 0 : c.squeeze
    // A gentle rumble (and a little cartoon lightning bolt) when she wrings it hard.
    if (c.held && c.speed > 0.75 && now > c.nextRumble) {
      c.nextRumble = now + 3500
      c.flashUntil = now + 220
      rsfx.rumble()
    }
    cloud.current?.draw(c.x, c.y, c.squeeze, t, !!c.held, now < c.flashUntil)
    rsfx.rain(G.rain)

    const riverY = levelY(S0.riverLow, S0.riverHigh, G.shownRiver)
    const lagoonY = levelY(S0.lagoonLow, S0.lagoonHigh, G.shownLagoon)
    const [rl, rr] = waterSpan(S0.river, riverY)
    const [ll, lr] = waterSpan(S0.lagoon, lagoonY)
    /** Where a drop lands at x: the first thing it meets, else the water, else the ground. */
    const surface = (x: number) => {
      let y = groundAt(S0, x)
      if (x > rl && x < rr) y = Math.min(y, riverY)
      if (x > ll && x < lr) y = Math.min(y, lagoonY)
      for (const tg of targets) if (x > tg.x0 && x < tg.x1 && tg.top > c.y + 60) y = Math.min(y, tg.top)
      return y
    }

    // The rain: drops from the cloud's belly, and everything under the rain column soaks some up.
    const half = S0.cloud.w * 0.34
    const col0 = c.x - half
    const col1 = c.x + half
    if (G.rain > 0) {
      G.spawn += dt * 75 * Math.min(1.2, G.rain)
      while (G.spawn >= 1) {
        G.spawn--
        const x = col0 + Math.random() * (col1 - col0)
        rain.current?.drop(x, c.y + S0.cloud.w * 0.08, surface(x))
      }
      if (now > G.nextPlink) {
        G.nextPlink = now + 180 + Math.random() * 260
        rsfx.plink()
      }
      for (const tg of targets) {
        const over = Math.min(col1, tg.x1) - Math.max(col0, tg.x0)
        if (over <= 0) continue
        const share = Math.min(1, over / Math.min(tg.x1 - tg.x0, col1 - col0))
        const w = (G.wet[tg.id] = (G.wet[tg.id] ?? 0) + dt * G.rain * share)
        if (w >= tg.need && tg.ok()) tg.fire()
      }
      // The river and the lagoon fill with whatever falls on them.
      const overRiver = Math.max(0, Math.min(col1, S0.river[S0.river.length - 1].x) - Math.max(col0, S0.river[0].x)) / (col1 - col0)
      if (overRiver > 0 && G.river < 1 && G.phase !== 'swim') {
        G.river = Math.min(1, G.river + (dt * G.rain * overRiver * (G.phase === 'forest' ? 0.5 : 1)) / RIVER_SECONDS)
        progress()
      }
      const overLagoon = Math.max(0, Math.min(col1, S0.lagoon[S0.lagoon.length - 1].x) - Math.max(col0, S0.lagoon[0].x)) / (col1 - col0)
      if (overLagoon > 0 && G.lagoon < 1 && (G.phase === 'lagoon' || G.phase === 'pads')) {
        G.lagoon = Math.min(1, G.lagoon + (dt * G.rain * overLagoon) / LAGOON_SECONDS)
        progress()
      }
      // The puddle on the bank.
      const pw = S0.puddle.w / 2
      const overPuddle = Math.min(col1, S0.puddle.x + pw) - Math.max(col0, S0.puddle.x - pw)
      if (overPuddle > 0 && G.puddle < 1) {
        G.puddle = Math.min(1, G.puddle + (dt * G.rain * overPuddle) / pw / 3)
        if (Math.abs(G.puddle - puddleShown.current) > 0.08 || G.puddle >= 1) {
          puddleShown.current = G.puddle
          setPuddle(G.puddle)
          if (G.puddle >= 1) {
            rsfx.bloom()
            soakedOnce('puddle')
          }
        }
      }
    }
    // Rain stops on a thing → it stays wet but slowly dries (so reactions can come again later).
    for (const id of Object.keys(G.wet) as Wet[]) if ((G.wet[id] ?? 0) > 0 && !(G.rain > 0)) G.wet[id] = Math.max(0, (G.wet[id] ?? 0) - dt * 0.15)

    // Water levels glide toward what's fallen (so a big squeeze rises smoothly), and climb the trunks.
    G.shownRiver += (G.river - G.shownRiver) * Math.min(1, dt * 1.5)
    G.shownLagoon += (G.lagoon - G.shownLagoon) * Math.min(1, dt * 1.5)
    const wave = (y: number, x0: number, x1: number, ph: number) => {
      let d = `M${x0} ${y}`
      for (let x = x0; x <= x1 + 40; x += 40) d += ` L${x} ${(y + Math.sin(x / 55 + t * 2.4 + ph) * 4).toFixed(1)}`
      return d
    }
    riverWater.current?.setAttribute('y', riverY.toFixed(1))
    riverSurf.current?.setAttribute('d', wave(riverY, rl - 10, rr + 10, 0))
    lagoonWater.current?.setAttribute('y', lagoonY.toFixed(1))
    lagoonSurf.current?.setAttribute('d', wave(lagoonY, ll - 10, lr + 10, 1.5))
    // Over the brim: the river spills into the forest between the trees (the leafcutter ants ride their leaves).
    const over = Math.max(0, S0.bank - riverY)
    // It ends in a gentle slope just past the river's right bank.
    const floodEnd = S0.river[S0.river.length - 1].x + 140
    flood.current?.setAttribute('d', over > 1 ? `M-1600 ${S0.bank + 4} L-1600 ${riverY.toFixed(1)} L${floodEnd} ${riverY.toFixed(1)} Q${floodEnd + over * 2} ${riverY.toFixed(1)} ${floodEnd + over * 3} ${S0.bank + 4}Z` : '')
    if (floodSurf.current) floodSurf.current.setAttribute('d', over > 1 ? wave(riverY, -1600, floodEnd, 0) : '')
    if (antsEl.current) antsEl.current.style.transform = `translateY(${(-over + (over > 1 ? Math.sin(t * 2) * 3 : 0)).toFixed(1)}px)`
    if (over > 8 && !floodedRef.current) {
      floodedRef.current = true
      setUmbrella(true)
      setFrogUp(true)
      rsfx.splash(true)
    }
    // Rain on the lagoon's water makes the fish leap.
    if (G.rain > 0 && G.phase !== 'swim' && G.shownLagoon > 0.3 && c.x > ll && c.x < lr && now > G.nextLeap) {
      G.nextLeap = now + 1600 + Math.random() * 1400
      const id = G.leapId++
      const x = c.x + (Math.random() - 0.5) * S0.cloud.w * 0.5
      setLeaps((list) => [...list.slice(-3), { id, x, y: lagoonY }])
      rsfx.splash()
    }
    // Steps: Rosa can reach the next friend.
    if (G.reached < 3 && G.shownRiver >= STEPS[G.reached] - 0.01 && !G.rosa.leap) void reach(G.reached)
    // The lagoon full and every pad open → friends.
    if (G.phase === 'lagoon' && G.lagoon >= 1 && G.buds.every((b) => b >= 2)) toPads()

    // Floating things ride the water (or rest on the ground when it's low).
    const float = (el: HTMLDivElement | null, x: number, h: number, sink: number, ph: number) => {
      if (!el) return
      const ground = groundAt(S0, x)
      const water = x > rl && x < rr ? riverY : x > ll && x < lr ? lagoonY : Infinity
      const afloat = water < ground - h * sink
      const y = afloat ? water + h * sink + Math.sin(t * 2 + ph) * 4 : ground
      el.style.transform = `translateY(${(y - ground).toFixed(1)}px) rotate(${afloat ? (Math.sin(t * 1.6 + ph) * 3).toFixed(2) : 0}deg)`
    }
    S0.capys.forEach((cp, i) => float(capyEls[i].current, cp.x, cp.h, 0.25, i))
    float(canoeEl.current, S0.canoe.x, S0.canoe.w / CANOE, 0.35, 3)
    S0.buds.forEach((bx, i) => {
      const el = lilyEls[i].current
      if (!el) return
      const ground = groundAt(S0, bx)
      const y = G.buds[i] >= 1 ? Math.min(ground, lagoonY + 6 + Math.sin(t * 1.4 + i) * 3) : ground
      el.style.transform = `translate(${(bx - S0.pad / 2).toFixed(1)}px, ${(y - S0.pad * 0.5).toFixed(1)}px)`
      // Friends sitting on this pad ride along.
      G.seats.forEach((s, who) => {
        const fe = friendEls[who].current
        if (s === i && fe) fe.style.transform = `translate(${(bx - S0.waiting[who] + (who - 1) * 4).toFixed(1)}px, ${(y - S0.pad * 0.15 - S0.bank).toFixed(1)}px)`
      })
    })
    // Once the river is full, the monkeys hop down from their branch into the floating canoe and ride it, splashing.
    monkeyEls.forEach((m, i) => {
      if (!m.current) return
      if (G.reached < 3) {
        m.current.style.transform = ''
        return
      }
      const mk = S0.monkeys[i]
      const ch = S0.canoe.w / CANOE
      const seatY = riverY + ch * 0.35 - ch * 0.45 + Math.sin(t * 2 + 3) * 4
      const seatX = S0.canoe.x + (i ? 40 : -45)
      m.current.style.transform = `translate(${(seatX - mk.x).toFixed(1)}px, ${(seatY - mk.y).toFixed(1)}px) rotate(${(Math.sin(t * 4 + i * 2) * 6).toFixed(1)}deg)`
    })

    // Rosa: swims under the rain (she loves it), visits friends, or wanders her pool. Leaps to the lagoon.
    const ro = G.rosa
    const len = S0.rosa
    const rh = (len * ROSA_VIEW.h) / ROSA_VIEW.w
    if (ro.leap) {
      ro.leap.t += dt / 1.5
      const q = Math.min(1, ro.leap.t)
      ro.x = ro.leap.from.x + (ro.leap.to.x - ro.leap.from.x) * q
      ro.y = ro.leap.from.y + (ro.leap.to.y - ro.leap.from.y) * q - Math.sin(q * Math.PI) * 420
      if (q >= 1) {
        ro.leap = null
        ro.basin = 'lagoon'
        rsfx.splash(true)
      }
    } else {
      const lagoon = ro.basin === 'lagoon'
      const wy = lagoon ? lagoonY : riverY
      const [a, b] = lagoon ? [ll, lr] : [rl, rr]
      const lo = a + len * 0.42
      const hi = Math.max(lo, b - len * 0.42)
      let goal: number
      if (ro.target !== null) goal = ro.target
      else if (G.rain > 0 && c.x > a && c.x < b) goal = c.x
      else {
        if (now > ro.nextWander) {
          ro.nextWander = now + 2500 + Math.random() * 3000
          ro.wander = lo + Math.random() * (hi - lo)
        }
        goal = ro.wander
      }
      goal = Math.min(hi, Math.max(lo, goal))
      const want = Math.max(-260, Math.min(260, (goal - ro.x) * 2.2))
      ro.vx += (want - ro.vx) * Math.min(1, dt * 2.5)
      ro.x += ro.vx * dt
      ro.x = Math.min(hi + 1, Math.max(lo - 1, ro.x))
      // Near the surface (her back just out of the water), but never below the riverbed.
      const ground = groundAt(S0, ro.x)
      ro.y = Math.min(wy + rh * 0.06, ground - rh * 0.4)
      if (ro.vx > 30) ro.face = 1
      else if (ro.vx < -30) ro.face = -1
    }
    if (rosaEl.current) rosaEl.current.style.transform = `translate(${(ro.x - len / 2).toFixed(1)}px, ${(ro.y - rh / 2).toFixed(1)}px)`
    if (rosaFace.current) {
      const f = ro.face === 1 ? '1' : '-1'
      if (rosaFace.current.dataset.face !== f) {
        rosaFace.current.dataset.face = f
        rosaFace.current.style.transform = `scaleX(${f})`
      }
    }

    // Sparkle speaks only when nothing has happened for a while, and shows where to go.
    const idle = G.phase === 'forest' ? 'squeeze' : G.phase === 'river' ? 'river' : G.phase === 'lagoon' ? 'lagoon' : G.phase === 'pads' ? 'pads' : null
    if (idle && !G.busy && !c.held && !G.drag && G.rain === 0 && now - G.lastProgress > 8000 && now - G.lastTouch > 4000 && now - G.lastHint > 12000) {
      G.lastHint = now
      void say(idle === 'lagoon' && G.lagoon >= 1 ? R.buds : R.idle[idle])
      hintsOn.current = true
      if (idle === 'pads') setGlow('friends')
      else {
        setGlow(idle === 'river' ? 'river' : idle === 'lagoon' ? 'lagoon' : 'cloud')
        const spots: { x: number; y: number }[] = []
        if (idle === 'river') spots.push({ x: (S0.river[0].x + S0.river[S0.river.length - 1].x) / 2, y: riverY - 30 })
        if (idle === 'lagoon') {
          const i = G.buds.findIndex((b) => b < 2)
          spots.push({ x: i >= 0 ? S0.buds[i] : (ll + lr) / 2, y: lagoonY - 40 })
        }
        setHints(spots)
      }
    }
  })
  const puddleShown = useRef(0)
  const floodedRef = useRef(false)
  const soakedOnce = (k: Wet) => {
    const G = g.current
    if (G.seen.has(k)) return
    G.seen.add(k)
    if (G.phase === 'forest' && G.seen.size >= 4) toRiver()
  }

  // The things under the rain, in world units (rebuilt each render; cheap).
  const targets: { id: Wet; x0: number; x1: number; top: number; need: number; ok: () => boolean; fire: () => void }[] = []
  if (S) {
    const always = () => true
    const add = (id: Wet, x0: number, x1: number, top: number, need: number, ok = always) => targets.push({ id, x0, x1, top, need, ok, fire: () => soaked(id) })
    S.plants.forEach((p, i) => add(`plant${i}` as Wet, p.x - p.h * 0.3, p.x + p.h * 0.3, S.bank - p.h * [0.35, 0.6, 0.85, 1][plants[i]], 0.7))
    add('frog', S.frog.x - S.frog.h, S.frog.x + S.frog.h, S.bank - S.frog.h * 1.5, 0.5)
    add('ants', S.ants.x0, S.ants.x1, S.bank - 30, 0.5)
    add('sloth', S.sloth.x - S.sloth.h * 0.75, S.sloth.x + S.sloth.h * 0.35, S.sloth.y + 20, 0.8)
    add('macaws', S.macaws[0].x - 50, S.macaws[1].x + 50, Math.min(...S.macaws.map((m) => m.y - m.h)), 0.5)
    add('toucan', S.toucan.x - 60, S.toucan.x + 60, S.toucan.y - S.toucan.h, 0.5)
    add('sparkle', S.sparkle.x[cam] - S.sparkle.h * 0.35, S.sparkle.x[cam] + S.sparkle.h * 0.35, S.bank - S.sparkle.h * 0.8, 0.6, () => g.current.phase !== 'pads')
    add('lbirds', S.lagoonBirds[0].x - 60, S.lagoonBirds[1].x + 60, Math.min(...S.lagoonBirds.map((b) => b.y - b.h)), 0.5)
    add('monkeys', S.monkeys[0].x - 60, S.monkeys[1].x + 60, S.monkeys[0].y - S.monkeys[0].h, 0.6)
    add('capys', S.capys[0].x - S.capys[0].h * 0.7, S.capys[1].x + S.capys[1].h * 0.6, groundAt(S, S.capys[0].x) - S.capys[0].h, 0.7)
    // Each soaking opens a lily bud one more step (a half-open pad, then the whole pad and its flower), once there's
    // some water in the lagoon.
    S.buds.forEach((bx, i) =>
      targets.push({
        id: `bud${i}` as Wet,
        x0: bx - S.pad * 0.3,
        x1: bx + S.pad * 0.3,
        top: S.bank + 400,
        need: 1,
        ok: () => g.current.phase === 'lagoon' && g.current.lagoon >= 0.25 && g.current.buds[i] < 2,
        fire: () => {
          const G = g.current
          G.buds[i]++
          G.wet[`bud${i}` as Wet] = 0
          setBuds([...G.buds])
          rsfx.bloom()
          progress()
          if (G.buds[i] === 2) {
            // A whole giant pad: sparkles, and Rosa leaps for joy.
            sounds.sparkle()
            void rosa.current?.play('cheer')
            const L0 = lay.current
            if (L0.S) burst((L0.ox + (S.buds[i] - G.cam) * L0.scale) / size.W, (L0.oy + levelY(S.lagoonLow, S.lagoonHigh, G.shownLagoon) * L0.scale) / size.H)
          }
        },
      }),
    )
  }

  // ---- QA hook: jump to a later moment, or rain at a spot (motion and screen QA) ----
  useEffect(() => {
    window.__peruRiverQA = {
      jump: (to) => {
        const G = g.current
        const S0 = lay.current.S
        if (!S0) return
        G.plants = [3, 2, 3]
        setPlants(G.plants)
        setFrogUp(true)
        G.slothEyes = 1
        setSlothEyes(1)
        if (to === 'river') {
          G.phase = 'forest'
          toRiver()
          return
        }
        G.river = G.shownRiver = 1
        G.reached = 3
        star(4)
        G.rosa.target = null
        G.rosa.basin = 'lagoon'
        const pool = waterSpan(S0.lagoon, levelY(S0.lagoonLow, S0.lagoonHigh, 0))
        G.rosa.x = (pool[0] + pool[1]) / 2
        setCam(1)
        G.cloud.x = G.cloud.tx = S0.camLagoon + S0.w * 0.5
        G.busy = false
        setPhase('lagoon')
        setPrompt(R.lagoon)
        if (to === 'lagoon') return
        G.lagoon = G.shownLagoon = 1
        G.buds = [2, 2, 2]
        setBuds(G.buds)
        toPads()
        if (to === 'rainbow') [0, 1, 2].forEach((i) => seat(i, i))
      },
      state: () => {
        const G = g.current
        return { phase: G.phase, river: +G.river.toFixed(3), shown: +G.shownRiver.toFixed(3), lagoon: +G.lagoon.toFixed(3), reached: G.reached, rain: +G.rain.toFixed(2), cloud: Math.round(G.cloud.x), seen: [...G.seen], buds: G.buds }
      },
      rain: (x, seconds) => {
        const G = g.current
        const S0 = lay.current.S
        if (!S0) return
        G.cloud.tx = G.cam + x * S0.w
        G.cloud.showerOnArrive = false
        G.cloud.shower = performance.now() + seconds * 1000
      },
    }
    return () => {
      delete window.__peruRiverQA
    }
  })

  // Pebbles and roots in the soil where there's no river (a fixed pattern, so it doesn't jump between renders).
  const soil: { x: number; y: number; r: number; s: number; root: boolean }[] = []
  if (S) {
    for (let i = 0, x = 30; x < S.worldW; i++, x += 95 + ((i * 53) % 70)) {
      const deep = groundAt(S, x) > S.bank + 1 || groundAt(S, x + 40) > S.bank + 1 || groundAt(S, x - 40) > S.bank + 1
      if (deep) continue
      const root = i % 3 === 0
      soil.push({ x, y: S.bank + 90 + ((i * 37) % (S.h - S.bank - 140)), r: root ? 60 + ((i * 13) % 50) : 14 + ((i * 7) % 16), s: i % 2 ? 1 : -1, root })
    }
  }
  const groundPx = S ? oy + S.bank * scale : 0
  const parallax = 0.35
  const bgH = S ? S.bank + 60 : 0

  return (
    <div
      ref={root}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: S ? `linear-gradient(${SKY} 0, ${SKY} ${groundPx}px, ${SOIL} ${groundPx}px)` : SKY, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {S && (
        <div
          ref={stageEl}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{ position: 'absolute', left: ox, top: oy, width: S.w, height: S.h, transform: `scale(${scale})`, transformOrigin: '0 0' }}
        >
          {/* Far away: the rainforest canopy, sliding slower than the river when the camera pans. Repeats sideways to
              cover the letterbox bands on very wide screens. */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: -ox / scale - 40,
              top: 0,
              width: S.w + (2 * ox) / scale + S.camLagoon * parallax + 80,
              height: bgH,
              background: `url(${art.bgAmazon}) 0 100% / auto ${bgH}px repeat-x`,
              transform: `translateX(${-camX * parallax}px)`,
              transition: 'transform 2.6s ease-in-out',
              pointerEvents: 'none',
            }}
          />
          {/* The world: river on the left, the lily lagoon to its right. */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: S.worldW, height: S.h, transform: `translateX(${-camX}px)`, transition: 'transform 2.6s ease-in-out' }}>
            {sun && <Sun x={S.camLagoon + S.w * (S.tall ? 0.3 : 0.2)} y={cloudMin + 10} r={70} />}
            {phase === 'rainbow' && sun && <Rainbow cx={(S.lagoon[0].x + S.lagoon[S.lagoon.length - 1].x) / 2} base={S.bank - 40} r={(S.lagoon[S.lagoon.length - 1].x - S.lagoon[0].x) * 0.46} />}

            {/* The far riverbank seen through the cut-away: dry-season mud, with dark lines where the water reached
                in past floods. */}
            <svg width={S.worldW} height={S.h} viewBox={`0 0 ${S.worldW} ${S.h}`} style={{ position: 'absolute', left: 0, top: 0, zIndex: 1, pointerEvents: 'none' }}>
              {[S.river, S.lagoon].map((pts, i) => (
                <g key={i} clipPath={`url(#peru-${i ? 'lagoon' : 'river'}-hollow)`}>
                  <rect x={pts[0].x} y={S.bank - 2} width={pts[pts.length - 1].x - pts[0].x} height={S.h} fill={BANK} />
                  {[0.3, 0.55].map((k) => (
                    <path key={k} d={`M${pts[0].x} ${S.bank + (Math.max(...pts.map((q) => q.y)) - S.bank) * k} l${pts[pts.length - 1].x - pts[0].x} 0`} stroke="#A9825E" strokeWidth="10" strokeDasharray="60 26" />
                  ))}
                </g>
              ))}
            </svg>
            {/* The water itself is a big target: a tap sends the cloud over to rain there. */}
            {(['river', 'lagoon'] as const).map((k) => {
              const pts = k === 'river' ? S.river : S.lagoon
              const bed = Math.max(...pts.map((q) => q.y))
              return (
                <button
                  key={k}
                  aria-label={k}
                  className={glow === k ? 'world-glow' : undefined}
                  onClick={(e) => rainAt(e.clientX)}
                  style={{ position: 'absolute', left: pts[0].x + 20, top: S.bank - 10, width: pts[pts.length - 1].x - pts[0].x - 40, height: bed - S.bank + 10, padding: 0, background: 'none', border: 'none', borderRadius: '0 0 50% 50%', zIndex: 2 }}
                />
              )
            })}
            {/* Trees on the river's slopes, with the sloth, the monkeys and the birds. */}
            <Tree img={art.treeSloth} x={S.slothTree.x} base={S.slothTree.base} h={S.slothTree.h} />
            <Tree img={art.treeMonkey} x={S.monkeyTree.x} base={S.monkeyTree.base} h={S.monkeyTree.h} />
            <Tree img={art.treeSloth} x={S.lagoonTree.x} base={S.bank + 30} h={S.lagoonTree.h} flip />
            {S.lagoonBirds.map((b, i) => (
              <Critter
                key={`lb${i}`}
                img={i ? art.macaw : art.toucan}
                x={b.x}
                bottom={b.y}
                h={b.h}
                label={i ? 'macaw' : 'toucan'}
                flip={i === 0}
                z={3}
                puppet={lbirds[i]}
                onTap={() => {
                  if (i) rsfx.squawk()
                  else rsfx.clack()
                  void lbirds[i].current?.play('dance')
                }}
              />
            ))}
            <Liana a={S.liana.a} b={S.liana.b} y={S.liana.y} bottom={S.sloth.y} />
            <Sloth
              ref={slothP}
              x={S.sloth.x}
              y={S.sloth.y}
              h={S.sloth.h}
              awake={slothEyes}
              onTap={() => {
                rsfx.yawn()
                void slothP.current?.play('nod')
                if (g.current.slothEyes > 0) say1(R.hello.sloth[1])
              }}
            />
            {S.macaws.map((m, i) => (
              <Critter
                key={`m${i}-${fluff}`}
                img={art.macaw}
                x={m.x}
                bottom={m.y}
                h={m.h}
                label="macaw"
                flip={i === 1}
                z={3}
                puppet={macaws[i]}
                onTap={() => {
                  rsfx.squawk()
                  void macaws[i].current?.play('dance')
                }}
                style={fluff > 0 ? { animation: 'peru-fluff 2.6s ease-in-out', transformOrigin: '0 100%' } : undefined}
              />
            ))}
            <Critter
              img={art.toucan}
              x={S.toucan.x}
              bottom={S.toucan.y}
              h={S.toucan.h}
              label="toucan"
              z={3}
              puppet={toucan}
              onTap={() => {
                rsfx.clack()
                void toucan.current?.play('nod')
              }}
            />
            {S.fruits.map((f, i) => (
              <Fruit key={i} x={f.x} y={f.y} color={FRUIT_COLORS[i]} gone={fruits[i].gone} onTap={() => dropFruit(i)} />
            ))}
            {fruits.map((f, i) =>
              f.gone && f.at ? (
                <motion.div key={`fall${i}`} initial={{ y: S.fruits[i].y + 8 }} animate={{ y: f.at.y - 22 }} transition={{ duration: 0.65, ease: 'easeIn' }} style={{ position: 'absolute', left: f.at.x - 22, top: 0, width: 44, height: 44, borderRadius: '50%', background: FRUIT_COLORS[i], border: '4px solid #2B2330', zIndex: 5, pointerEvents: 'none' }} />
              ) : null,
            )}
            {fruits.map((f, i) => (f.fish > 0 && f.at ? <NibbleFish key={`fish${i}-${f.fish}`} x={f.at.x} y={f.at.y} /> : null))}
            {leaps.map((l) => (
              <NibbleFish key={`leap${l.id}`} x={l.x} y={l.y} />
            ))}
            {S.monkeys.map((m, i) => (
              <div key={`mk${i}`} ref={monkeyEls[i]} style={{ position: 'absolute', left: 0, top: 0, zIndex: 4, transition: 'transform .7s cubic-bezier(.3,1.5,.5,1)', transformOrigin: `${m.x}px ${m.y}px` }}>
                <Critter
                  img={art.monkey}
                  x={m.x}
                  bottom={m.y}
                  h={m.h}
                  label="monkey"
                  flip={i === 1}
                  puppet={monkeys[i]}
                  voice="monkey"
                  onTap={() => {
                    rsfx.chatter()
                    void monkeys[i].current?.play('jump')
                  }}
                />
              </div>
            ))}

            {/* Rosa and the capybaras swim in the water (the water is drawn over them). */}
            {S.capys.map((cp, i) => (
              <Critter
                key={`c${i}`}
                img={cp.baby ? art.capybaraBaby : art.capybara}
                x={cp.x}
                bottom={groundAt(S, cp.x) - (i === 1 && babyOnBack ? cp.h * 0.55 : 0)}
                h={cp.h}
                label={cp.baby ? 'baby capybara' : 'capybara'}
                voice={cp.baby ? undefined : 'capy'}
                puppet={capys[i]}
                wrap={capyEls[i]}
                style={i === 1 ? { left: babyOnBack ? S.capys[0].x - S.capys[0].h * 0.1 : cp.x, transition: 'left .5s, top .5s' } : undefined}
                onTap={() => {
                  rsfx.squeak()
                  if (i === 1) {
                    setBabyOnBack((b) => !b)
                    void capys[1].current?.play('jump')
                  } else void capys[0].current?.play('nod')
                }}
              />
            ))}
            <Critter img={art.canoe} x={S.canoe.x} bottom={groundAt(S, S.canoe.x)} h={S.canoe.w / CANOE} label="canoe" wrap={canoeEl} onTap={() => rsfx.clack()} />
            <div ref={rosaEl} style={{ position: 'absolute', left: 0, top: 0, width: S.rosa, height: (S.rosa * ROSA_VIEW.h) / ROSA_VIEW.w, zIndex: 4, willChange: 'transform' }}>
              <div ref={rosaFace} style={{ width: '100%', height: '100%', transition: 'transform .35s' }}>
                <button aria-label="Rosa" onClick={tapRosa} style={{ padding: 0, background: 'none', border: 'none', width: '100%', height: '100%', display: 'block' }}>
                  <Rosa ref={rosa} height="100%" speed={() => Math.min(1, Math.abs(g.current.rosa.vx) / 220)} />
                </button>
              </div>
            </div>

            {/* The water (river and lagoon), clipped to their hollows, then the ground in front. */}
            <svg width={S.worldW} height={S.h} viewBox={`0 0 ${S.worldW} ${S.h}`} style={{ position: 'absolute', left: 0, top: 0, zIndex: 5, pointerEvents: 'none', overflow: 'visible' }}>
              <defs>
                <clipPath id="peru-river-hollow">
                  <path d={hollowPath(S.river)} />
                </clipPath>
                <clipPath id="peru-lagoon-hollow">
                  <path d={hollowPath(S.lagoon)} />
                </clipPath>
              </defs>
              <g clipPath="url(#peru-river-hollow)">
                <rect ref={riverWater} x={S.river[0].x - 10} y={S.riverLow} width={S.river[S.river.length - 1].x - S.river[0].x + 20} height={S.h} fill="#6EC3EE" opacity="0.72" />
              </g>
              <path ref={riverSurf} fill="none" stroke="#DFF4FF" strokeWidth="7" strokeLinecap="round" clipPath="url(#peru-river-hollow)" />
              <g clipPath="url(#peru-lagoon-hollow)">
                <rect ref={lagoonWater} x={S.lagoon[0].x - 10} y={S.lagoonLow} width={S.lagoon[S.lagoon.length - 1].x - S.lagoon[0].x + 20} height={S.h} fill="#6EC3EE" opacity="0.72" />
              </g>
              <path ref={lagoonSurf} fill="none" stroke="#DFF4FF" strokeWidth="7" strokeLinecap="round" clipPath="url(#peru-lagoon-hollow)" />
            </svg>
            <svg width={S.worldW} height={S.h} viewBox={`0 0 ${S.worldW} ${S.h}`} style={{ position: 'absolute', left: 0, top: 0, zIndex: 6, pointerEvents: 'none', overflow: 'visible' }}>
              <path d={groundShape(S, 1600)} fill={SOIL} />
              {/* A band of sand along the riverbed (the dry-season beaches) and grass along the banks. */}
              <path d={groundLine(S, 1600)} fill="none" stroke="#E8C99A" strokeWidth="44" strokeLinejoin="round" transform="translate(0 22)" />
              <path d={`M-1600 ${S.bank + 9} L${S.river[0].x - 8} ${S.bank + 9} M${S.river[S.river.length - 1].x + 8} ${S.bank + 9} L${S.lagoon[0].x - 8} ${S.bank + 9} M${S.lagoon[S.lagoon.length - 1].x + 8} ${S.bank + 9} L${S.worldW + 1600} ${S.bank + 9}`} stroke="#5CBF6B" strokeWidth="22" />
              <path d={groundLine(S, 1600)} fill="none" stroke="#2B2330" strokeWidth="6" strokeLinejoin="round" />
              {/* Under the forest floor: roots and pebbles in the soil. */}
              {soil.map((d, i) =>
                d.root ? (
                  <path key={i} d={`M${d.x} ${S.bank + 26} c${d.s * 10} 30 ${-d.s * 14} 60 ${d.s * 4} ${d.r}`} fill="none" stroke="#6B4429" strokeWidth="9" strokeLinecap="round" />
                ) : (
                  <ellipse key={i} cx={d.x} cy={d.y} rx={d.r} ry={d.r * 0.62} fill="#A98266" stroke="#2B2330" strokeWidth="4" />
                ),
              )}
            </svg>

            {/* The flood over the banks, in front of the forest floor (the plants and the frog's leaf stand in it). */}
            <svg width={S.worldW} height={S.h} viewBox={`0 0 ${S.worldW} ${S.h}`} style={{ position: 'absolute', left: 0, top: 0, zIndex: 8, pointerEvents: 'none', overflow: 'visible' }}>
              <path ref={flood} fill="#6EC3EE" opacity="0.72" />
              <path ref={floodSurf} fill="none" stroke="#DFF4FF" strokeWidth="7" strokeLinecap="round" />
            </svg>
            {/* On the banks: plants, the frog's leaf, the ants, the puddle, Sparkle. */}
            {S.plants.map((p, i) => (
              <Plant key={`p${i}`} x={p.x} base={S.bank} h={p.h} stage={plants[i]} />
            ))}
            <FrogLeaf
              x={S.frog.x}
              base={S.bank}
              h={S.frog.h}
              up={frogUp}
              sing={sing}
              puppet={frog}
              onTap={() => {
                setFrogUp(true)
                setSing((s) => s + 1)
                rsfx.croak()
                void frog.current?.play('jump')
              }}
            />
            <div ref={antsEl} style={{ position: 'absolute', left: 0, top: 0, zIndex: 9, transition: 'transform .6s' }}>
            <Ants
              x0={S.ants.x0}
              x1={S.ants.x1}
              base={S.bank}
              umbrella={umbrella}
              onTap={() => {
                setUmbrella(true)
                sounds.pop()
                if (!floodedRef.current) setTimeout(() => alive() && !floodedRef.current && setUmbrella(false), 2500)
              }}
            />
            </div>
            <Puddle x={S.puddle.x} base={S.bank} w={S.puddle.w} fill={puddle} />
            {S.butterflies.map((b, i) => (
              <Butterfly key={i} x={b.x} y={b.y} delay={i * 2} />
            ))}
            <motion.button
              aria-label="Sparkle"
              whileTap={{ scale: 0.92 }}
              onClick={tapSparkle}
              style={{ position: 'absolute', left: S.sparkle.x[cam] - S.sparkle.h * 0.45, top: S.bank - S.sparkle.h + 6, width: S.sparkle.h * 0.9, height: S.sparkle.h, padding: 0, background: 'none', border: 'none', zIndex: 9, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', transition: 'left 2.6s ease-in-out' }}
            >
              <SparklePuppet ref={sparkle} height={`${S.sparkle.h}px`} lookToward={0.3} />
            </motion.button>

            {/* The lagoon: lily buds that become giant pads, and the friends waiting on the bank. */}
            {S.buds.map((_, i) => (
              <Lily
                key={i}
                w={S.pad}
                open={buds[i]}
                wrap={lilyEls[i]}
                onTap={() => {
                  const G = g.current
                  if (G.phase !== 'lagoon') return
                  G.cloud.tx = S.buds[i]
                  G.cloud.showerOnArrive = true
                }}
              />
            ))}
            {(phase === 'pads' || phase === 'rainbow' || phase === 'done') &&
              padCritters.map((c, i) => (
                <div key={c} ref={friendEls[i]} style={{ position: 'absolute', left: 0, top: 0, zIndex: 9, transition: 'transform .45s ease-out' }}>
                  <motion.div initial={{ y: -300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 12, delay: i * 0.25 }}>
                    <Critter
                      img={PAD_IMG[c]}
                      x={S.waiting[i]}
                      bottom={S.bank}
                      h={PAD_H[c] * S.critter}
                      label={c === 'capy' ? 'baby capybara' : c}
                      flip={S.waiting[i] > S.buds[1]}
                      puppet={friendP[i]}
                      data={String(i)}
                      glow={glow === 'friends' && seats[i] === null}
                      hit={40}
                      z={9}
                    />
                  </motion.div>
                </div>
              ))}

            <Rain ref={rain} />
            <Cloud ref={cloud} w={S.cloud.w} glow={glow === 'cloud'} />
            {hints.map((h, i) => (
              <HintRing key={i} x={h.x} y={h.y} />
            ))}
          </div>
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

      <AnimatePresence>{flash > 0 && <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.9 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 26 }} />}</AnimatePresence>

      {phase === 'story' && <StoryBeat lines={R.story} bg={art.bgAmazon} friend={<Rosa height="60%" />} onDone={startPlay} />}
    </div>
  )
}

// 🐬 Swim with Rosa (Peru's Amazon: the flooded forest, pink river dolphins). Notes: planning/around-the-world/peru.md.
// The toy (one core verb): hold Rosa, or the water anywhere, and she swims after the finger. In the air nothing steers
// her: she flies on the speed she left the water with and falls back with a splash, so a run-up from the deep is a big
// leap. The verb deepens three times:
//   1. Swim the treetops: say hello to the capybaras (the baby rides on her back), splash the sleepy sloth awake.
//   2. Leap for the fruit: three fruits hang over the water, each higher; a boop drops one in and the fish nibble it.
//   3. Race the otters to the rainbow, with logs to leap over or duck under.
// Everything is drawn in code (Forest.tsx, Friends.tsx): there is no generated picture in this level.
// Per-frame work (Rosa, the camera, the layers, fruit, fish, otters) runs in refs and one game loop.
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { burst, clamp, damp, pick, say, sounds, TO_DEG, useAlive, useGameLoop, useTimers, wrapAngle, type Line, type PuppetHandle } from '../../../../../sdk'
import { afterTalk, Guide, type GuideHandle } from '../../../../kit/Guide'
import { EndCard, HudButton } from '../../../../kit/Hud'
import { useSections } from '../../../../kit/sections'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Rosa } from '../../puppets/Rosa'
import { Art, BigLeaf, Boulder, DEEP, FAR_CANOPY, FAR_TRUNKS, FinishRainbow, Fruit, LEAF, Log, NEAR_CANOPY, OVERHEAD, Rays, RIVERBED, SKY, slide, Strip, SURFACE, TINT, Trunk, Vine, Weed } from './Forest'
import { BOX, Butterfly, Capy, Fish, Frog, Macaw, Monkey, Otter, Sloth, Spot, Toucan, Turtle } from './Friends'
import SECTIONS from './sections'
import { rsfx } from './sfx'
import { BED, BRANCH_Y, BUTTERFLIES, CAPY, FINISH, FROGS, FRUIT_COLORS, FRUIT_HELP, FRUITS, LILIES, LOG_W, LOGS, MACAWS, MONKEYS, RACE, RACE_START, ROSA_LEN, SCHOOLS, SLOTH, START_X, SWIM, TOUCAN, TREES, viewFor, WEEDS, WORLD_W, type View } from './world'

const R = L.river
/** Stars: the capybaras, the sloth, three fruits, the race. */
const TOTAL = 6
const ROSA_H = (ROSA_LEN * 640) / 1260
/** Her middle, as a share of her picture (she turns round this point). */
const ROSA_MID = { x: 0.508, y: 0.47 }
/** How high her middle must be to count as out of the water. */
const SURF = -16
const FISH_PER_SCHOOL = 4
/** Sizes (world units tall). */
const H = { sloth: 176, monkey: 122, capy: 104, baby: 66, otter: 100, toucan: 104, macaw: 132, frog: 58, turtle: 46 }

type Phase = 'story' | 'treetops' | 'fruit' | 'race' | 'rainbow' | 'done'
type FruitState = 'hang' | 'fall' | 'float' | 'gone'
type RaceState = 'off' | 'dared' | 'on' | 'won' | 'lost'

declare global {
  interface Window {
    /** For the QA robots: where things are on screen right now (px) and how the game stands. */
    __peruRiverQA?: { state: () => object }
  }
}

// ---- Splashes, ripples and bubbles: their own little component, so adding one never re-renders the forest. ----
interface FxHandle {
  splash: (x: number, size: number) => void
  bubble: (x: number, y: number) => void
  spark: (x: number, y: number) => void
}
const Fx = forwardRef<FxHandle>(function Fx(_, ref) {
  const timers = useTimers()
  const [items, setItems] = useState<{ id: number; kind: 'splash' | 'bubble' | 'spark'; x: number; y: number; s: number }[]>([])
  const next = useRef(1)
  const add = (kind: 'splash' | 'bubble' | 'spark', x: number, y: number, s: number, ms: number) => {
    const id = next.current++
    setItems((list) => [...list.slice(-14), { id, kind, x, y, s }])
    timers.later(() => setItems((list) => list.filter((i) => i.id !== id)), ms)
  }
  useImperativeHandle(ref, () => ({
    splash: (x, size) => add('splash', x, 0, size, 760),
    bubble: (x, y) => add('bubble', x, y, 0.6 + Math.random() * 0.6, 1500),
    spark: (x, y) => add('spark', x, y, 1, 760),
  }))
  return (
    <>
      {items.map((i) =>
        i.kind === 'splash' ? (
          <svg key={i.id} aria-hidden viewBox="-60 -80 120 84" className="rio-pop" style={{ position: 'absolute', left: i.x - 60 * i.s, top: -80 * i.s, width: 120 * i.s, height: 84 * i.s, transformOrigin: '50% 100%', pointerEvents: 'none', zIndex: 9 }}>
            <path d="M-45 0C-38 -26 -27 -34 -18 -14C-13 -40 2 -46 7 -18C13 -34 27 -30 45 0Z" fill="#fff" opacity="0.94" />
            <circle cx="-46" cy="-30" r="5" fill="#fff" />
            <circle cx="-26" cy="-54" r="4" fill="#fff" />
            <circle cx="24" cy="-52" r="5" fill="#fff" />
            <circle cx="48" cy="-34" r="3.5" fill="#fff" />
            <circle cx="0" cy="-68" r="3.5" fill="#fff" />
          </svg>
        ) : i.kind === 'bubble' ? (
          <div key={i.id} aria-hidden className="rio-rise" style={{ position: 'absolute', left: i.x - 9 * i.s, top: i.y - 9 * i.s, width: 18 * i.s, height: 18 * i.s, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.8)', pointerEvents: 'none', zIndex: 8 }} />
        ) : (
          <svg key={i.id} aria-hidden viewBox="-40 -40 80 80" className="rio-pop" style={{ position: 'absolute', left: i.x - 60, top: i.y - 60, width: 120, height: 120, pointerEvents: 'none', zIndex: 9 }}>
            <path d="M0 -34L7 -7L34 0L7 7L0 34L-7 7L-34 0L-7 -7Z" fill="#fff6cc" />
            <circle cx="-24" cy="-24" r="4" fill="#fff" />
            <circle cx="26" cy="-20" r="3" fill="#fff" />
            <circle cx="20" cy="26" r="4" fill="#fff" />
          </svg>
        ),
      )}
    </>
  )
})

/** A lily pad floating on the surface, some with a pink flower (scenery). */
function Lily({ x, flower }: { x: number; flower: boolean }) {
  return (
    <Art x={x - 60} y={-46} w={120} h={60} z={3}>
      <ellipse cx={x} cy={5} rx={52} ry={9} fill={LEAF[1]} />
      <ellipse cx={x} cy={2} rx={52} ry={8} fill={LEAF[0]} />
      <path d={`M${x - 32} 2L${x + 30} 2`} stroke={LEAF[2]} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      {flower && (
        <g transform={`translate(${x + 14} 0)`}>
          <path d="M-22 0C-26 -12 -19 -22 -10 -19C-10 -9 -7 -3 0 0Z" fill="#e7699c" />
          <path d="M22 0C26 -12 19 -22 10 -19C10 -9 7 -3 0 0Z" fill="#e7699c" />
          <path d="M-13 0C-17 -15 -8 -29 0 -32C8 -29 17 -15 13 0Z" fill="#ff8fb8" />
          <path d="M-5 0C-7 -10 -3 -19 0 -22C3 -19 7 -10 5 0Z" fill="#ffc4da" />
        </g>
      )}
    </Art>
  )
}

export function SwimRiver({ onDone, setProgress }: ActivityProps) {
  const timers = useTimers()
  const { start, param, enter } = useSections(SECTIONS)
  const alive = useAlive()
  const root = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ W: 0, H: 0 })
  const view = useMemo<View | null>(() => (size.W ? viewFor(size.W, size.H) : null), [size.W, size.H])
  const viewRef = useRef(view)
  viewRef.current = view

  // ---- Where a link starts her (a bare section link sets up the state as if she had played to there). ----
  const seed = useMemo(() => {
    const at: Phase = start && start !== 'story' ? start : 'story'
    const after = at === 'fruit' || at === 'race' || at === 'rainbow'
    const metParam = param('met')
    const met = metParam === 'auto' ? { capy: after, sloth: after } : { capy: metParam.split(',').includes('capy'), sloth: metParam.split(',').includes('sloth') }
    const fruitParam = param('fruit')
    const fruit = fruitParam === 'auto' ? (at === 'race' || at === 'rainbow' ? 3 : 0) : clamp(Math.round(Number(fruitParam)) || 0, 0, 3)
    const x = at === 'fruit' ? 2560 : at === 'race' ? RACE_START - 420 : at === 'rainbow' ? FINISH - 60 : START_X
    return { at, met, fruit, x, rival: param('rival'), result: param('result') }
  }, [])

  const [phase, setPhaseState] = useState<Phase>(seed.at)
  const [met, setMet] = useState(seed.met)
  const [fruitState, setFruitState] = useState<FruitState[]>(FRUITS.map((_, i) => (i < seed.fruit ? 'gone' : 'hang')))
  const [help, setHelp] = useState([0, 0, 0])
  const [race, setRaceState] = useState<RaceState>('off')
  const [raced, setRaced] = useState(false)
  const [cell, setCell] = useState(() => Math.floor(seed.x / 400))
  const [wipe, setWipe] = useState(0)
  const stars = (met.capy ? 1 : 0) + (met.sloth ? 1 : 0) + fruitState.filter((f) => f !== 'hang').length + (raced ? 1 : 0)
  useEffect(() => setProgress(Math.min(stars, TOTAL), TOTAL), [stars])

  // ---- Puppets and moving things. ----
  const guide = useRef<GuideHandle>(null)
  const fx = useRef<FxHandle>(null)
  const rosaP = useRef<PuppetHandle>(null)
  const rosaEl = useRef<HTMLDivElement>(null)
  const rosaFlip = useRef<HTMLDivElement>(null)
  const slothP = useRef<PuppetHandle>(null)
  const monkeyP = [useRef<PuppetHandle>(null), useRef<PuppetHandle>(null)]
  const capyP = useRef<PuppetHandle>(null)
  const babyP = useRef<PuppetHandle>(null)
  const babyEl = useRef<HTMLDivElement>(null)
  const otterP = [useRef<PuppetHandle>(null), useRef<PuppetHandle>(null)]
  const otterEl = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  const toucanP = useRef<PuppetHandle>(null)
  const macawP = [useRef<PuppetHandle>(null), useRef<PuppetHandle>(null), useRef<PuppetHandle>(null)]
  const frogP = useRef<(PuppetHandle | null)[]>([])
  const turtleP = useRef<(PuppetHandle | null)[]>([])
  const flyP = useRef<(PuppetHandle | null)[]>([])
  const fruitEl = useRef<(HTMLDivElement | null)[]>([])
  const fishEl = useRef<(HTMLDivElement | null)[]>([])
  const back = useRef<HTMLDivElement>(null)
  const front = useRef<HTMLDivElement>(null)
  const strips = { far: useRef<HTMLDivElement>(null), near: useRef<HTMLDivElement>(null), trunks: useRef<HTMLDivElement>(null), bed: useRef<HTMLDivElement>(null), over: useRef<HTMLDivElement>(null), surf: useRef<HTMLDivElement>(null) }

  // ---- Everything the loop moves (React never sees it per frame). ----
  const g = useRef({
    phase: seed.at as Phase,
    t: 0,
    cam: 0,
    camSet: false,
    rosa: { x: seed.x, y: 130, vx: 0, vy: 0, ang: 0, face: 1, air: false, speed: 0, apex: 0, leapX: 0 },
    finger: null as null | { id: number; cx: number; cy: number; sx: number; sy: number; t: number; moved: boolean },
    met: { ...seed.met, monkeys: seed.at !== 'story' && seed.at !== 'treetops' },
    told: { leap: false, bonk: false },
    slothNear: false,
    fruit: FRUITS.map((f, i) => ({ state: (i < seed.fruit ? 'gone' : 'hang') as FruitState, x: f.x as number, y: f.y as number, vx: 0, vy: 0, miss: 0, help: 0, swing: 0, eaten: 0, sink: 0 })),
    baby: { mode: 'float' as 'float' | 'ride' | 'fly', x: CAPY.baby, y: 0, vx: 0, vy: 0, cool: 0, face: -1 },
    otters: [
      { x: RACE_START + 240, y: 4, v: 0 },
      { x: RACE_START, y: 4, v: 0 },
    ],
    race: { state: 'off' as RaceState, losses: 0, nag: 0, busy: false },
    fish: SCHOOLS.flatMap((s, si) => Array.from({ length: FISH_PER_SCHOOL }, (_, i) => ({ school: si, ox: (i - 1.5) * 62 + ((si * 37 + i * 53) % 30), oy: ((i * 47 + si * 29) % 90) - 45, x: s.x + (i - 1.5) * 62, y: s.y, vx: 0, vy: 0, face: 1, scare: 0 }))),
    logBonk: 0,
    bubble: 0,
    pokes: 0,
    rect: { left: 0, top: 0 },
  })

  const setPhase = (p: Phase) => {
    g.current.phase = p
    setPhaseState(p)
  }
  const setRace = (s: RaceState) => {
    g.current.race.state = s
    setRaceState(s)
  }
  const talk = async (lines: Line[]) => {
    for (const l of lines) {
      if (!alive()) return
      await say(l, { interrupt: false })
    }
  }

  // ---- Layout: measure the screen. ----
  useEffect(() => {
    const el = root.current
    if (!el) return
    const measure = () => setSize({ W: el.clientWidth, H: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // The forest's own hum, for as long as she's here.
  useEffect(() => rsfx.forest(), [])

  // ---- The story, then play. ----
  const startPlay = () => {
    if (g.current.phase !== 'story') return
    setPhase('treetops')
    guide.current?.speak(R.swim)
  }
  // A section link: say what to do there.
  useEffect(() => {
    if (seed.at === 'treetops') guide.current?.speak(R.swim)
    else if (seed.at === 'fruit') void say(R.monkeys)
    else if (seed.at === 'race') dare()
    else if (seed.at === 'rainbow') {
      g.current.otters[0].x = FINISH + (seed.result === 'lose' ? 90 : -220)
      g.current.otters[1].x = g.current.otters[0].x - 240
      finishRace(seed.result !== 'lose')
    }
  }, [])

  // ---- Friends along the way. ----
  const meetCapy = () => {
    g.current.met.capy = true
    setMet((m) => ({ ...m, capy: true }))
    sounds.sparkle()
    rsfx.squeak()
    void capyP.current?.play('nod')
    void babyP.current?.play('hop')
    void rosaP.current?.play('nod')
    void talk(R.capy)
  }
  const wakeSloth = () => {
    g.current.met.sloth = true
    setMet((m) => ({ ...m, sloth: true }))
    sounds.sparkle()
    rsfx.yawn()
    void slothP.current?.play('wake')
    void talk(R.sloth)
  }
  const meetMonkeys = () => {
    g.current.met.monkeys = true
    if (g.current.phase === 'treetops') setPhase('fruit')
    rsfx.chatter()
    void monkeyP[0].current?.play('point')
    void monkeyP[1].current?.play('chatter')
    void say(R.monkeys, { interrupt: false })
  }
  const knock = (i: number) => {
    const G = g.current
    const f = G.fruit[i]
    f.state = 'fall'
    f.vy = -260
    f.vx = G.rosa.vx * 0.25
    setFruitState((s) => s.map((v, k) => (k === i ? 'fall' : v)))
    rsfx.boop()
    sounds.sparkle()
    fx.current?.spark(f.x, f.y)
    monkeyP.forEach((m) => void m.current?.play('cheer'))
    void say(pick(R.fruitDown), { interrupt: false })
  }
  /** Two leaps that missed a fruit: a monkey lets its vine down a little. */
  const lowerFruit = (i: number) => {
    const f = g.current.fruit[i]
    f.miss = 0
    if (f.help >= 2) return
    f.help++
    setHelp((h) => h.map((v, k) => (k === i ? f.help : v)))
    rsfx.creak()
    void monkeyP[i === 2 ? 1 : 0].current?.play('pull')
    if (f.help === 1) void say(R.lower, { interrupt: false })
  }

  // ---- The race. ----
  function dare() {
    const G = g.current
    if (G.race.state !== 'off') return
    setRace('dared')
    if (G.phase !== 'race') setPhase('race')
    rsfx.chirp()
    otterP.forEach((o) => void o.current?.play('wave'))
    void say(R.dare, { interrupt: false })
  }
  const go = async () => {
    const G = g.current
    if (G.race.busy || G.race.state !== 'dared') return
    G.race.busy = true
    await say(R.go, { interrupt: false })
    if (!alive()) return
    G.race.busy = false
    sounds.whoosh()
    setRace('on')
  }
  function finishRace(won: boolean) {
    const G = g.current
    if (G.race.state === 'won' || G.race.state === 'lost') return
    setRace(won ? 'won' : 'lost')
    setPhase('rainbow')
    setRaced(true)
    otterP.forEach((o) => void o.current?.play('cheer'))
    if (won) {
      sounds.fanfare()
      burst(0.5, 0.45)
      rsfx.whistle()
      void rosaP.current?.play('cheer')
      void talk(R.win)
      timers.later(
        () =>
          afterTalk(() => {
            if (!alive() || g.current.phase === 'done') return
            setPhase('done')
            onDone()
          }, 7000),
        1600,
      )
    } else {
      G.race.losses++
      rsfx.chirp()
      void say(R.lose, { interrupt: false })
    }
  }
  /** One more go: back to the start line with slower otters. */
  const again = () => {
    const G = g.current
    setWipe((n) => n + 1)
    timers.later(() => {
      G.rosa.x = RACE_START - 320
      G.rosa.y = 120
      G.rosa.vx = G.rosa.vy = 0
      G.rosa.air = false
      G.otters[0].x = RACE_START + 240
      G.otters[1].x = RACE_START
      G.otters.forEach((o) => (o.v = 0))
      G.camSet = false
      G.race.busy = false
      setPhase('race')
      setRace('dared')
      void go()
    }, 260)
  }
  const wayOn = () => {
    if (g.current.phase === 'done') return
    setPhase('done')
    onDone()
  }

  // ---- Her finger. Down anywhere: Rosa swims after it. A quick tap also pokes whatever is there. ----
  const local = (e: ReactPointerEvent) => ({ cx: e.clientX - g.current.rect.left, cy: e.clientY - g.current.rect.top })
  const toWorld = (cx: number, cy: number) => {
    const v = viewRef.current
    return v ? { x: g.current.cam + cx / v.scale, y: v.top + cy / v.scale } : { x: 0, y: 0 }
  }
  const onDown = (e: ReactPointerEvent) => {
    const G = g.current
    if (G.finger || G.phase === 'story' || G.phase === 'done') return
    // The buttons (Sparkle, again, the way on) keep their own taps.
    if ((e.target as Element).closest?.('button')) return
    const r = root.current?.getBoundingClientRect()
    if (r) G.rect = { left: r.left, top: r.top }
    const p = local(e)
    G.finger = { id: e.pointerId, ...p, sx: p.cx, sy: p.cy, t: performance.now(), moved: false }
    root.current?.setPointerCapture(e.pointerId)
  }
  const onMove = (e: ReactPointerEvent) => {
    const fgr = g.current.finger
    if (!fgr || fgr.id !== e.pointerId) return
    const p = local(e)
    fgr.cx = p.cx
    fgr.cy = p.cy
    if (Math.hypot(p.cx - fgr.sx, p.cy - fgr.sy) > 16) fgr.moved = true
  }
  const onUp = (e: ReactPointerEvent) => {
    const G = g.current
    const fgr = G.finger
    if (!fgr || fgr.id !== e.pointerId) return
    G.finger = null
    if (!fgr.moved && performance.now() - fgr.t < 320) poke(toWorld(fgr.cx, fgr.cy))
  }

  /** A tap: whatever is there answers. Nothing here is "the answer". */
  const poke = (at: { x: number; y: number }) => {
    const G = g.current
    const v = viewRef.current
    if (!v) return
    // A finger is about 64 px wide whatever the screen: small things get at least that.
    const min = 44 / v.scale
    const hit = (x: number, y: number, r: number) => Math.hypot(at.x - x, at.y - y) < Math.max(r, min)
    const ro = G.rosa
    if (hit(ro.x, ro.y, 110)) {
      const n = G.pokes++
      rsfx.spout()
      void rosaP.current?.play(n % 2 ? 'giggle' : 'spout')
      if (n === 0) guide.current?.once('rio-rosa', R.facts.rosa)
      else void say(n % 4 === 3 ? R.rosaTap : R.spout[n % R.spout.length], { interrupt: false })
      return
    }
    if (hit(G.baby.x, G.baby.y - 24, 60)) {
      rsfx.squeak()
      return void babyP.current?.play('hop')
    }
    if (hit(CAPY.x, -24, 80)) {
      rsfx.squeak()
      return void capyP.current?.play('nod')
    }
    if (hit(SLOTH.x, SLOTH.top + 80, 90)) {
      if (G.met.sloth) {
        void slothP.current?.play('wave')
        void say(R.slothTap, { interrupt: false })
      } else {
        rsfx.yawn()
        void slothP.current?.play('shake')
      }
      return
    }
    for (let i = 0; i < MONKEYS.length; i++)
      if (hit(MONKEYS[i].x, BRANCH_Y - 50, 64)) {
        rsfx.chatter()
        return void monkeyP[i].current?.play('chatter')
      }
    for (let i = 0; i < G.otters.length; i++)
      if (hit(G.otters[i].x, G.otters[i].y - 10, 90)) {
        rsfx.chirp()
        return void otterP[i].current?.play(i ? 'float' : 'wave')
      }
    for (let i = 0; i < G.fruit.length; i++) {
      const f = G.fruit[i]
      if (f.state === 'hang' && hit(f.x, f.y, 50)) {
        f.swing = 1
        return rsfx.creak()
      }
    }
    if (hit(TOUCAN.x, TOUCAN.y - 50, 60)) {
      rsfx.clack()
      guide.current?.once('rio-forest', R.facts.forest, true)
      return void toucanP.current?.play('squawk')
    }
    for (let i = 0; i < MACAWS.length; i++)
      if (hit(MACAWS[i].x, MACAWS[i].y - 50, 64)) {
        rsfx.squawk()
        rsfx.flutter()
        guide.current?.once('rio-forest', R.facts.forest, true)
        return void macawP[i].current?.play('flap')
      }
    for (let i = 0; i < FROGS.length; i++)
      if (hit(FROGS[i].x, -20, 50)) {
        rsfx.croak()
        return void frogP.current[i]?.play('hop')
      }
    for (let i = 0; i < LOGS.length; i++) {
      if (hit(LOGS[i] - 50, -40, 50)) {
        rsfx.splash()
        fx.current?.splash(LOGS[i] - 50, 0.6)
        return void turtleP.current[i]?.play('plop')
      }
      if (Math.abs(at.x - LOGS[i]) < LOG_W / 2 && Math.abs(at.y) < 40) return rsfx.bonk()
    }
    for (let i = 0; i < BUTTERFLIES.length; i++)
      if (hit(BUTTERFLIES[i].x, BUTTERFLIES[i].y, 80)) {
        rsfx.flutter()
        return void flyP.current[i]?.play('flee')
      }
    for (const fi of G.fish)
      if (hit(fi.x, fi.y, 60)) {
        rsfx.dart()
        for (const o of G.fish) if (o.school === fi.school) o.scare = 1
        return
      }
    for (const t of TREES)
      if (Math.abs(at.x - t.x) < t.w * 0.6) {
        rsfx.bonk()
        guide.current?.once('rio-flood', R.facts.flood, true)
        return
      }
    // Open water or air: a bubble or two.
    if (at.y > 0) {
      rsfx.bubble()
      fx.current?.bubble(at.x, at.y)
    }
  }

  // ---- The loop. ----
  useGameLoop((dt) => {
    const G = g.current
    const v = viewRef.current
    if (!v) return
    G.t += dt
    const ro = G.rosa
    const playing = G.phase !== 'story' && G.phase !== 'done'

    // Rosa: in the water she chases the finger; in the air she only falls.
    const fgr = playing ? G.finger : null
    if (!ro.air) {
      let wx = 0
      let wy = clamp((130 - ro.y) * 0.5, -70, 70)
      if (fgr) {
        const tgt = toWorld(fgr.cx, fgr.cy)
        const dx = tgt.x - ro.x
        const dy = tgt.y - ro.y
        const d = Math.hypot(dx, dy)
        // A finger in the air means "leap": no easing off on the way up.
        const sp = SWIM.speed * (tgt.y < -30 ? 1 : Math.min(1, d / SWIM.arrive))
        if (d > 14) {
          wx = (dx / d) * sp
          wy = (dy / d) * sp
        } else wy = 0
      }
      const k = damp(dt, SWIM.turn)
      ro.vx += (wx - ro.vx) * k
      ro.vy += (wy - ro.vy) * k
    } else {
      ro.vy += SWIM.gravity * dt
      ro.vx *= 1 - 0.25 * dt
    }
    ro.x += ro.vx * dt
    ro.y += ro.vy * dt
    if (ro.x < 110 || ro.x > WORLD_W - 110) {
      ro.x = clamp(ro.x, 110, WORLD_W - 110)
      ro.vx = 0
    }
    if (ro.y > BED - 76) {
      ro.y = BED - 76
      ro.vy = Math.min(0, ro.vy)
    }
    ro.speed = Math.hypot(ro.vx, ro.vy)

    // Floating logs: she can't swim through one. She slides under it with a bonk, or leaps over.
    if (!ro.air) {
      for (let i = 0; i < LOGS.length; i++) {
        if (Math.abs(ro.x - LOGS[i]) < LOG_W / 2 + 40 && ro.y < 58 && ro.y > -40) {
          ro.y = 58
          ro.vy = Math.max(ro.vy, 40)
          if (G.t - G.logBonk > 1.2) {
            G.logBonk = G.t
            ro.vx *= 0.55
            rsfx.bonk()
            void turtleP.current[i]?.play('plop')
            fx.current?.splash(LOGS[i] - 50, 0.6)
            if (!G.told.bonk) {
              G.told.bonk = true
              void say(R.bonk, { interrupt: false })
            }
          }
        }
      }
    }

    // Out of the water and back in.
    if (!ro.air && ro.y < SURF && ro.vy < 0) {
      ro.air = true
      ro.vx *= SWIM.boost
      ro.vy *= SWIM.boost
      ro.apex = ro.y
      ro.leapX = ro.x
      if (ro.speed > 220) {
        rsfx.leap()
        fx.current?.splash(ro.x, clamp(ro.speed / 560, 0.5, 1.2))
      }
    } else if (ro.air && ro.y >= SURF && ro.vy > 0) {
      ro.air = false
      const hard = ro.vy
      ro.vy *= SWIM.brake
      const big = hard > 380
      if (hard > 160) {
        if (big) rsfx.bigSplash()
        else rsfx.splash()
        fx.current?.splash(ro.x, clamp(hard / 480, 0.6, 1.5))
        for (let i = 0; i < 3; i++) fx.current?.bubble(ro.x + (i - 1) * 40, 40 + i * 14)
      }
      // A good splash near the sleeping sloth wakes her.
      if (big && !G.met.sloth && Math.abs(ro.x - SLOTH.x) < 330) wakeSloth()
      // A leap that went by a hanging fruit without touching it: after two, the monkey helps.
      if (ro.apex < -40) {
        const mid = (ro.x + ro.leapX) / 2
        const i = G.fruit.findIndex((f) => f.state === 'hang' && Math.abs(f.x - mid) < 190)
        if (i >= 0 && ++G.fruit[i].miss >= 2) lowerFruit(i)
      }
    }
    if (ro.air) ro.apex = Math.min(ro.apex, ro.y)

    // Which way she points: along her path, never upside down.
    if (ro.vx > 70) ro.face = 1
    else if (ro.vx < -70) ro.face = -1
    let want = 0
    if (ro.speed > 50) {
      const a = Math.atan2(ro.vy, ro.vx)
      want = clamp(ro.face === 1 ? a : wrapAngle(a - Math.PI), -1.45, 1.45)
    }
    ro.ang += wrapAngle(want - ro.ang) * damp(dt, ro.air ? 14 : 9)

    // Bubbles trail behind her when she's fast and deep.
    if (!ro.air && ro.speed > 330 && ro.y > 60 && G.t - G.bubble > 0.22) {
      G.bubble = G.t
      fx.current?.bubble(ro.x - Math.cos(ro.ang) * ro.face * 110, ro.y + 10)
    }

    // The camera follows her, a little ahead of where she's heading.
    const lead = v.w * (0.5 - 0.14 * ro.face * clamp(Math.abs(ro.vx) / 400))
    const camTo = clamp(ro.x - lead, 0, WORLD_W - v.w)
    if (!G.camSet) {
      G.cam = camTo
      G.camSet = true
    } else G.cam += (camTo - G.cam) * damp(dt, 3.2)
    const c = Math.floor(G.cam / 400)
    if (c !== cellRef.current) {
      cellRef.current = c
      setCell(c)
    }

    // Draw: the layers slide, the world moves, Rosa turns.
    const tx = `translate3d(${(-G.cam * v.scale).toFixed(1)}px,${(-v.top * v.scale).toFixed(1)}px,0) scale(${v.scale.toFixed(4)})`
    if (back.current) back.current.style.transform = tx
    if (front.current) front.current.style.transform = tx
    slide(strips.far.current, FAR_CANOPY, v, G.cam, 0.25)
    slide(strips.near.current, NEAR_CANOPY, v, G.cam, 0.45)
    slide(strips.trunks.current, FAR_TRUNKS, v, G.cam, 0.65)
    slide(strips.bed.current, RIVERBED, v, G.cam, 1)
    slide(strips.over.current, OVERHEAD, v, G.cam, 1)
    slide(strips.surf.current, SURFACE, v, G.cam, 1, G.t * 16)
    if (rosaEl.current) rosaEl.current.style.transform = `translate3d(${(ro.x - ROSA_LEN * ROSA_MID.x).toFixed(1)}px,${(ro.y - ROSA_H * ROSA_MID.y).toFixed(1)}px,0) rotate(${(ro.ang * TO_DEG).toFixed(1)}deg)`
    if (rosaFlip.current) {
      const fl = ro.face === 1 ? '1' : '-1'
      if (rosaFlip.current.dataset.f !== fl) {
        rosaFlip.current.dataset.f = fl
        rosaFlip.current.style.transform = `scaleX(${fl})`
      }
    }
    if (!playing) return

    // ---- Friends she swims up to. ----
    if (!G.met.capy && !ro.air && Math.hypot(ro.x - CAPY.x, ro.y - 40) < 250) meetCapy()
    if (!G.met.sloth && Math.abs(ro.x - SLOTH.x) < 420) {
      if (!G.slothNear) {
        G.slothNear = true
        setSlothNear(true)
      }
      if (!G.told.leap) {
        G.told.leap = true
        guide.current?.speak(R.leap, true)
      }
    } else if (G.slothNear) {
      G.slothNear = false
      setSlothNear(false)
    }
    if (!G.met.monkeys && ro.x > FRUITS[0].x - 340) meetMonkeys()

    // The baby capybara: hops on her back near the surface, flies off when she leaps, floats up when she dives.
    const b = G.baby
    b.cool = Math.max(0, b.cool - dt)
    if (b.mode === 'float') {
      b.y += (0 - b.y) * damp(dt, 4)
      const home = Math.abs(b.x - CAPY.baby) > 6 ? Math.sign(CAPY.baby - b.x) * 70 : 0
      b.x += home * dt
      if (home) b.face = home > 0 ? 1 : -1
      if (G.met.capy && b.cool <= 0 && !ro.air && Math.abs(ro.x - b.x) < 80 && ro.y > 20 && ro.y < 130) {
        b.mode = 'ride'
        rsfx.squeak()
        void babyP.current?.play('hop')
      }
    } else if (b.mode === 'ride') {
      const up = -66
      b.x = ro.x - Math.sin(ro.ang) * up * ro.face - 14 * ro.face
      b.y = ro.y + Math.cos(ro.ang) * up + 26
      b.face = ro.face
      if (ro.air) {
        b.mode = 'fly'
        b.vx = ro.vx * 0.5
        b.vy = ro.vy * 0.8 - 160
        rsfx.squeak()
      } else if (ro.y > 250) {
        b.mode = 'float'
        b.cool = 2
        fx.current?.bubble(b.x, b.y)
      }
    } else {
      b.vy += SWIM.gravity * dt
      b.x += b.vx * dt
      b.y += b.vy * dt
      if (b.y >= 0 && b.vy > 0) {
        b.mode = 'float'
        b.cool = 2.5
        b.y = 20
        rsfx.plop()
        fx.current?.splash(b.x, 0.7)
      }
    }
    if (babyEl.current) {
      const k = H.baby / BOX.capy[3]
      babyEl.current.style.transform = `translate3d(${(b.x + BOX.capy[0] * k).toFixed(1)}px,${(b.y + BOX.capy[1] * k).toFixed(1)}px,0) scaleX(${b.face}) rotate(${b.mode === 'ride' ? (ro.ang * TO_DEG * 0.5).toFixed(1) : b.mode === 'fly' ? (G.t * 500).toFixed(0) : 0}deg)`
    }

    // ---- The fruit. ----
    // Her nose, a bit ahead of her middle along her path.
    const dir = ro.speed > 1 ? { x: ro.vx / ro.speed, y: ro.vy / ro.speed } : { x: ro.face, y: 0 }
    const nose = { x: ro.x + dir.x * 96, y: ro.y + dir.y * 96 }
    let floating = -1
    for (let i = 0; i < G.fruit.length; i++) {
      const f = G.fruit[i]
      const el = fruitEl.current[i]
      if (f.state === 'hang') {
        const ty = FRUITS[i].y + f.help * FRUIT_HELP
        f.y += (ty - f.y) * damp(dt, 5)
        f.swing = Math.max(0, f.swing - dt * 0.9)
        if (ro.air && (Math.hypot(nose.x - f.x, nose.y - f.y) < 66 || Math.hypot(ro.x - f.x, ro.y - f.y) < 74)) knock(i)
        if (el) el.style.transform = `translate3d(${(f.x - 34 + Math.sin(G.t * 9) * 16 * f.swing).toFixed(1)}px,${(f.y - 40).toFixed(1)}px,0) rotate(${(Math.sin(G.t * 1.3 + i) * 4 + Math.sin(G.t * 9) * 16 * f.swing).toFixed(1)}deg)`
      } else if (f.state === 'fall') {
        f.vy += SWIM.gravity * dt
        f.x += f.vx * dt
        f.y += f.vy * dt
        if (f.y >= 6 && f.vy > 0) {
          f.state = 'float'
          f.y = 10
          rsfx.plop()
          fx.current?.splash(f.x, 0.7)
          setFruitState((s) => s.map((st, k) => (k === i ? 'float' : st)))
        }
        if (el) el.style.transform = `translate3d(${(f.x - 34).toFixed(1)}px,${(f.y - 40).toFixed(1)}px,0) rotate(${(G.t * 400).toFixed(0)}deg)`
      } else if (f.state === 'float') {
        floating = i
        f.sink = Math.min(1, f.sink + dt * 0.5)
        f.y = 10 + f.sink * 150 + Math.sin(G.t * 2 + i) * 5
        if (el) el.style.transform = `translate3d(${(f.x - 34).toFixed(1)}px,${(f.y - 40).toFixed(1)}px,0) rotate(${(Math.sin(G.t * 1.6) * 10).toFixed(1)}deg) scale(${(1 - f.eaten * 0.75).toFixed(2)})`
        if (f.eaten >= 1) {
          f.state = 'gone'
          setFruitState((s) => s.map((st, k) => (k === i ? 'gone' : st)))
          if (G.fruit.every((o) => o.state === 'gone' || o.state === 'float')) dareSoon()
        }
      }
    }
    if (G.race.state === 'off' && ro.x > RACE_START - 450) dare()

    // ---- The fish: each school drifts round its spot, darts away from Rosa, and comes to nibble a floating fruit. ----
    const lo = G.cam - 300
    const hi = G.cam + v.w + 300
    let lure = -1
    if (floating >= 0) {
      let best = 1e9
      SCHOOLS.forEach((s, si) => {
        const d = Math.abs(s.x - G.fruit[floating].x)
        if (d < best) {
          best = d
          lure = si
        }
      })
    }
    for (let i = 0; i < G.fish.length; i++) {
      const fi = G.fish[i]
      const s = SCHOOLS[fi.school]
      const lured = fi.school === lure
      if (!lured && (s.x < lo - 400 || s.x > hi + 400) && (fi.x < lo || fi.x > hi)) continue
      let hx = s.x + fi.ox + Math.sin(G.t * 0.5 + i) * 60
      let hy = s.y + fi.oy + Math.cos(G.t * 0.7 + i * 2) * 22
      if (lured) {
        const f = G.fruit[floating]
        hx = f.x + ((i % FISH_PER_SCHOOL) - 1.5) * 34
        hy = f.y + 26 + (i % 2) * 16
        if (Math.hypot(fi.x - hx, fi.y - hy) < 40) {
          if (f.eaten === 0) {
            rsfx.nibble()
            guide.current?.once('rio-fruit', R.fruit, true)
          }
          f.eaten += dt * 0.11
        }
      }
      const dr = Math.hypot(fi.x - ro.x, fi.y - ro.y)
      if (dr < 150 && ro.speed > 120 && !lured) {
        if (fi.scare < 0.2) rsfx.dart()
        fi.scare = 1
      }
      fi.scare = Math.max(0, fi.scare - dt * 0.8)
      if (fi.scare > 0.3 && !lured) {
        hx += (fi.x - ro.x >= 0 ? 1 : -1) * 240 * fi.scare
        hy += (fi.y - ro.y >= 0 ? 1 : -1) * 60 * fi.scare
      }
      hy = clamp(hy, 50, BED - 50)
      const k = damp(dt, 2 + fi.scare * 5 + (lured ? 1.5 : 0))
      const nx = fi.x + (hx - fi.x) * k
      const ny = fi.y + (hy - fi.y) * k
      fi.vx = (nx - fi.x) / Math.max(dt, 0.001)
      fi.x = nx
      fi.y = ny
      if (fi.vx > 14) fi.face = 1
      else if (fi.vx < -14) fi.face = -1
      const el = fishEl.current[i]
      if (el) el.style.transform = `translate3d(${(fi.x - 29).toFixed(1)}px,${(fi.y - 16).toFixed(1)}px,0) scaleX(${fi.face})`
    }

    // ---- The otters and their race. ----
    const rs = G.race.state
    if (rs === 'dared' && !G.race.busy && ro.x > RACE_START - 300) void go()
    for (let i = 0; i < G.otters.length; i++) {
      const o = G.otters[i]
      let vTo = 0
      if (rs === 'on') {
        const pace = RACE.pace - G.race.losses * RACE.ease + (seed.rival === 'fast' ? 420 : seed.rival === 'slow' ? -140 : 0)
        const gap = G.otters[0].x - ro.x
        vTo = pace * (gap > 900 ? 0 : gap > 380 ? RACE.ahead : gap < -450 ? RACE.behind : 1)
        if (i === 1) vTo *= G.otters[0].x - o.x > 260 ? 1.15 : 0.92
        if (gap > 900 && G.t - G.race.nag > 9) {
          G.race.nag = G.t
          void otterP[0].current?.play('float')
          void say(R.comeOn, { interrupt: false })
        }
      }
      o.v += (vTo - o.v) * damp(dt, 2.5)
      o.x += o.v * dt
      // They duck under the logs.
      const li = LOGS.findIndex((lx) => Math.abs(o.x + 60 - lx) < LOG_W / 2 + 30)
      o.y += ((li >= 0 ? 64 : 4) - o.y) * damp(dt, 7)
      const el = otterEl[i].current
      if (el) {
        const k = H.otter / BOX.otter[3]
        el.style.transform = `translate3d(${(o.x + BOX.otter[0] * k).toFixed(1)}px,${(o.y + BOX.otter[1] * k).toFixed(1)}px,0)`
      }
    }
    if (rs === 'on') {
      if (ro.x >= FINISH) finishRace(true)
      else if (G.otters[0].x + 80 >= FINISH) finishRace(false)
    }
  })
  const cellRef = useRef(cell)
  const [slothNear, setSlothNear] = useState(false)
  const dareTimer = useRef(0)
  /** The last fruit is eaten: the otters turn up a moment later. */
  function dareSoon() {
    if (dareTimer.current) return
    dareTimer.current = timers.later(dare, 900)
  }

  // ---- The address bar follows the moment on screen. ----
  useEffect(() => {
    if (phase === 'done' || (phase === 'story' && start && start !== 'story')) return
    const down = fruitState.filter((f) => f !== 'hang').length
    enter(phase, { met: [met.capy && 'capy', met.sloth && 'sloth'].filter(Boolean).join(',') || 'none', fruit: String(down), rival: seed.rival, result: race === 'lost' ? 'lose' : 'win' })
  }, [phase, met, fruitState, race])

  // ---- For the QA robots: where things are on screen. ----
  useEffect(() => {
    window.__peruRiverQA = {
      state: () => {
        const G = g.current
        const v = viewRef.current
        const px = (x: number, y: number) => (v ? { x: Math.round((x - G.cam) * v.scale + G.rect.left), y: Math.round((y - v.top) * v.scale + G.rect.top) } : { x: 0, y: 0 })
        return {
          phase: G.phase,
          race: G.race.state,
          losses: G.race.losses,
          rosa: { ...px(G.rosa.x, G.rosa.y), wx: Math.round(G.rosa.x), wy: Math.round(G.rosa.y), air: G.rosa.air, speed: Math.round(G.rosa.speed) },
          water: px(G.rosa.x, 0).y,
          bed: px(G.rosa.x, BED).y,
          met: G.met,
          baby: G.baby.mode,
          fruit: G.fruit.map((f) => ({ state: f.state, ...px(f.x, f.y), wx: Math.round(f.x), wy: Math.round(f.y), help: f.help })),
          otters: G.otters.map((o) => Math.round(o.x)),
          sloth: px(SLOTH.x, SLOTH.top + 80),
          scale: v?.scale ?? 1,
        }
      },
    }
    return () => {
      delete window.__peruRiverQA
    }
  }, [])

  // ---- What Sparkle says when she's stuck. ----
  const hint: Line | null = phase === 'treetops' ? (slothNear && !met.sloth ? R.idle.sloth : R.swim) : phase === 'fruit' ? R.idle.fruit : phase === 'race' ? R.idle.race : null

  // Only what's near the camera is on the page.
  const near = (x: number, pad = 500) => !!view && x > cell * 400 - pad && x < cell * 400 + 400 + view.w + pad
  const overY = view ? view.top + (view.tall ? 260 : 64) - 530 : 0
  const waterPx = view ? Math.round(-view.top * view.scale) : 0

  return (
    <div ref={root} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: SKY, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}>
      {view && (
        <>
          <div aria-hidden style={{ position: 'absolute', right: '-10%', top: '-20%', width: '70%', aspectRatio: '1', background: 'radial-gradient(closest-side, rgba(255,246,204,0.95), rgba(255,246,204,0))', pointerEvents: 'none' }} />
          <Strip ref={strips.far} tile={FAR_CANOPY} view={view} y={-FAR_CANOPY.h} />
          <Strip ref={strips.near} tile={NEAR_CANOPY} view={view} y={-NEAR_CANOPY.h} />
          <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: waterPx, bottom: 0, background: DEEP }} />
          <Strip ref={strips.trunks} tile={FAR_TRUNKS} view={view} y={-1000} />
          <Strip ref={strips.bed} tile={RIVERBED} view={view} y={BED - 18} />

          {/* What stands in the water: the rainbow, the trees, the water plants. The water tints them. */}
          <div ref={back} style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformOrigin: '0 0', willChange: 'transform' }}>
            {near(FINISH + 120, 900) && <FinishRainbow x={FINISH + 120} bright={race === 'won' || race === 'lost'} />}
            {TREES.filter((t) => near(t.x, 1300)).map((t) => (
              <Trunk key={t.x} t={t} top={view.top - 40} />
            ))}
            {WEEDS.map((x, i) => near(x) && <Weed key={x} x={x} n={i} />)}
            {WEEDS.map((x, i) => i % 2 === 1 && near(x) && <Boulder key={x} x={x + 150} n={i} />)}
            {near(SLOTH.x) && (
              <Art x={SLOTH.x - 60} y={SLOTH.branch} w={120} h={SLOTH.top - SLOTH.branch + 20}>
                <path d={`M${SLOTH.x - 44} ${SLOTH.branch}C${SLOTH.x - 44} ${SLOTH.top + 14} ${SLOTH.x + 44} ${SLOTH.top + 14} ${SLOTH.x + 44} ${SLOTH.branch}`} fill="none" stroke={LEAF[1]} strokeWidth="7" strokeLinecap="round" />
              </Art>
            )}
            {FRUITS.map((f, i) => near(f.x) && fruitState[i] === 'hang' && <Vine key={f.x} x={f.x} from={BRANCH_Y} to={f.y + help[i] * FRUIT_HELP - 22} />)}
          </div>

          <Strip ref={strips.over} tile={OVERHEAD} view={view} y={overY} />
          <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: waterPx, bottom: 0, background: TINT, pointerEvents: 'none' }}>
            <Rays />
          </div>
          <Strip ref={strips.surf} tile={SURFACE} view={view} y={-9} />

          {/* Who lives here, and Rosa. */}
          <div ref={front} style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformOrigin: '0 0', willChange: 'transform' }}>
            {g.current.fish.map((fi, i) => (
              <div key={i} ref={(el) => void (fishEl.current[i] = el)} style={{ position: 'absolute', left: 0, top: 0, zIndex: 2, display: near(SCHOOLS[fi.school].x, 1400) ? undefined : 'none', willChange: 'transform' }}>
                <Fish n={i} />
              </div>
            ))}
            {LILIES.map((x, i) => near(x) && <Lily key={x} x={x} flower={i % 2 === 0 || x > FINISH - 200} />)}
            {LOGS.map(
              (x, i) =>
                near(x) && (
                  <div key={x}>
                    <Log x={x} w={LOG_W} />
                    <Spot x={x - 50} y={-22} h={H.turtle} box={BOX.turtle} z={4}>
                      <Turtle ref={(h) => void (turtleP.current[i] = h)} height={H.turtle} />
                    </Spot>
                  </div>
                ),
            )}
            {near(TOUCAN.x) && (
              <Spot x={TOUCAN.x} y={TOUCAN.y - 8} h={H.toucan} box={BOX.toucan}>
                <Toucan ref={toucanP} height={H.toucan} />
              </Spot>
            )}
            {MACAWS.map(
              (m, i) =>
                near(m.x) && (
                  <Spot key={m.x} x={m.x} y={m.y - 8} h={H.macaw} box={BOX.macaw} flip={i === 1}>
                    <Macaw ref={macawP[i]} height={H.macaw} />
                  </Spot>
                ),
            )}
            {FROGS.map(
              (fr, i) =>
                near(fr.x) && (
                  <Spot key={fr.x} x={fr.x} y={0} h={H.frog} box={BOX.frog} z={4}>
                    <Frog ref={(h) => void (frogP.current[i] = h)} height={H.frog} />
                  </Spot>
                ),
            )}
            {BUTTERFLIES.map(
              (bf, i) =>
                near(bf.x) && (
                  <div key={bf.x} style={{ position: 'absolute', left: bf.x - 24, top: bf.y - 18, zIndex: 6, pointerEvents: 'none' }}>
                    <Butterfly ref={(h) => void (flyP.current[i] = h)} size={48} n={i} />
                  </div>
                ),
            )}
            {near(CAPY.x) && (
              <Spot x={CAPY.x} y={0} h={H.capy} box={BOX.capy} flip>
                <Capy ref={capyP} height={H.capy} />
              </Spot>
            )}
            <div ref={babyEl} style={{ position: 'absolute', left: 0, top: 0, width: (BOX.capy[2] * H.baby) / BOX.capy[3], height: H.baby, zIndex: 8, transformOrigin: `${(-BOX.capy[0] * H.baby) / BOX.capy[3]}px ${(-BOX.capy[1] * H.baby) / BOX.capy[3]}px`, pointerEvents: 'none', display: near(g.current.baby.x, 1600) ? undefined : 'none', willChange: 'transform' }}>
              <Capy ref={babyP} height={H.baby} baby dry={() => g.current.baby.mode !== 'float'} />
            </div>
            {near(SLOTH.x) && (
              <Spot x={SLOTH.x} y={SLOTH.top} h={H.sloth} box={BOX.sloth}>
                <Sloth ref={slothP} height={H.sloth} awake={met.sloth} />
              </Spot>
            )}
            {MONKEYS.map(
              (m, i) =>
                near(m.x) && (
                  <Spot key={m.x} x={m.x} y={BRANCH_Y - 8} h={H.monkey} box={BOX.monkey} flip={i === 1}>
                    <Monkey ref={monkeyP[i]} height={H.monkey} />
                  </Spot>
                ),
            )}
            {FRUITS.map(
              (f, i) =>
                fruitState[i] !== 'gone' && (
                  <div key={f.x} ref={(el) => void (fruitEl.current[i] = el)} style={{ position: 'absolute', left: 0, top: 0, zIndex: 6, transformOrigin: '34px 6px', pointerEvents: 'none', willChange: 'transform' }}>
                    <Fruit tone={FRUIT_COLORS[f.color]} />
                  </div>
                ),
            )}
            {[0, 1].map((i) => (
              <div key={i} ref={otterEl[i]} style={{ position: 'absolute', left: 0, top: 0, zIndex: 6, pointerEvents: 'none', willChange: 'transform' }}>
                <Otter ref={otterP[i]} height={H.otter} tone={i ? 'dark' : 'brown'} voice={i === 0} speed={() => g.current.otters[i].v / 480} />
              </div>
            ))}
            <div ref={rosaEl} style={{ position: 'absolute', left: 0, top: 0, width: ROSA_LEN, height: ROSA_H, zIndex: 7, transformOrigin: `${ROSA_MID.x * 100}% ${ROSA_MID.y * 100}%`, pointerEvents: 'none', willChange: 'transform' }}>
              <div ref={rosaFlip} style={{ width: '100%', height: '100%', transformOrigin: `${ROSA_MID.x * 100}% 50%` }}>
                <Rosa ref={rosaP} flat height="100%" speed={() => g.current.rosa.speed / SWIM.speed} />
              </div>
            </div>
            <Fx ref={fx} />
            {/* Big leaves in front, at the edges of the forest. */}
            {near(0, 600) && (
              <Art x={-40} y={-460} w={360} h={300} z={10}>
                <BigLeaf x={-30} y={-420} len={300} rot={28} />
                <BigLeaf x={-30} y={-330} len={240} rot={8} tone={['#2b7a5f', '#1f6650', '#3e9e78']} />
              </Art>
            )}
            {near(WORLD_W, 600) && (
              <Art x={WORLD_W - 320} y={-460} w={360} h={300} z={10}>
                <BigLeaf x={WORLD_W + 30} y={-420} len={300} rot={152} />
                <BigLeaf x={WORLD_W + 30} y={-330} len={240} rot={172} tone={['#2b7a5f', '#1f6650', '#3e9e78']} />
              </Art>
            )}
          </div>
        </>
      )}

      {phase !== 'story' && phase !== 'done' && <Guide ref={guide} hint={hint} stuckS={9} />}

      <AnimatePresence>
        {race === 'lost' && phase === 'rainbow' && (
          <EndCard key="end">
            <HudButton role="again" icon="again" label="Race again" onClick={again} />
            <HudButton role="go" icon="play" size="lg" label="Done" pulse onClick={wayOn} delay={0.3} />
          </EndCard>
        )}
      </AnimatePresence>
      <AnimatePresence>{wipe > 0 && <motion.div key={wipe} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.9, delay: 0.25 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 26 }} />}</AnimatePresence>

      {phase === 'story' && <StoryBeat lines={R.story} friend={<Rosa flat height="100%" />} onDone={startPlay} />}
    </div>
  )
}

// ✂️ Luna's Fluffy Day (Andes highlands near Cusco: alpacas, fleece, cold mountain air). Plan:
// planning/around-the-world/peru.md § 1.
// The toy (one core verb): rub the fleece with a tool. Her finger holds a big brush (then round clippers) and every puff
// it passes reacts. The same verb deepens three times:
//   1. Brush Luna: the tangles turn shiny and sparkle, and things stuck in her fleece pop out (burr, twig, dandelion, a
//      sleepy baby bird, a beetle). Brushing her bangs aside: "I can see you, Kaylee!"
//   2. Clip Luna: puffs snip off and float into the wool basket. Any haircut she likes (a topknot puff becomes a
//      mustache). Luna looks in the pond and laughs, then the cold wind blows and she shivers.
//   3. The family: Paco (ticklish: snip his tummy and he giggles and scoots) and Abuela Killa (falls asleep and snores).
// Side verb: the basket's wool becomes yarn, the cactus bug dyes it pink, and she drags pompom hats onto the shivering
// alpacas. Payoff: three snuggly alpacas in hats posing for Luna's journal.
// Per-frame work (the tool, particles, Paco's scoot, Abuela's snores, the idle hint) runs in refs and one game loop.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { burst, say, shuffle, sounds, SparklePuppet, useAlive, useGameLoop, useSaved, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { PromptBubble } from '../../../../kit/Stage'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Alpaca, HAT_COLORS, HatShape, INK, LOOKS, type AlpacaRig, type StuckItem } from '../../puppets/Alpaca'
import { HAT_SPOT, isMain, VIEW } from '../../puppets/fleece'
import { boxHeight, boxTop, FAMILY, onStage, pickLayout, type Spot, type StageLayout, type Who } from './layout'
import { Cactus, Cloud, Hummingbird, Peak, Pond, Post, Wall, Wind, type BugState } from './Scene'
import { fsfx } from './sfx'
import { Basket, Particles, type BasketHandle, type ParticlesHandle } from './Wool'

const F = L.fluffy
/** Stars: brushed, Luna's haircut, Paco, Abuela, pink yarn, hats. */
const TOTAL = 6
/** Share of the main fleece that counts as "a haircut". */
const CLIPPED = 0.7
const SKY = { wide: '#8ED2FD', tall: '#7ECAFD' }
const MEADOW = '#8FE4C4'
const HATS = ['pink', 'hotpink', 'cream', 'brown']
export const HATS_KEY = 'peru:alpaca-hats'
const ITEMS = ['burr', 'twig', 'dandelion', 'bird', 'beetle'] as const
type ItemKind = (typeof ITEMS)[number]
/** Each tool's picture (width / height) and its working edge (shares of its box): the brush's bristles, the clippers'
 *  teeth. That spot sits right under her finger. */
const TOOLS = { brush: { aspect: 512 / 342, at: [0.5, 0.92] }, clippers: { aspect: 512 / 271, at: [0.07, 0.5] } } as const
const ITEM_IMG: Record<ItemKind, string> = { burr: art.burr, twig: art.twig, dandelion: art.dandelion, bird: art.bird, beetle: art.beetle }

type Phase = 'story' | 'brush' | 'clip' | 'mirror' | 'arrive' | 'family' | 'yarn' | 'hats' | 'photo' | 'done'
type Tool = 'brush' | 'clippers'
interface Flyer {
  id: number
  img: string
  from: { x: number; y: number }
  to: { x: number; y: number }
  size: number
  kind: 'fly' | 'walk' | 'toss' | 'drop'
}

declare global {
  interface Window {
    __peruQA?: { jump: (to: 'clip' | 'family' | 'yarn' | 'hats' | 'photo') => void }
  }
}

/** Five things stuck in Luna's fleece, at puffs far enough apart (shuffled every time she plays). */
function stuckItems(rig: AlpacaRig): (StuckItem & { kind: ItemKind })[] {
  const spots = shuffle(rig.puffs.filter((p) => (p.zone === 'body' || p.zone === 'neck') && p.y < 450 && p.y > 250 && p.x > 130 && p.x < 470))
  const picked: { x: number; y: number }[] = []
  for (const p of spots) {
    if (picked.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > 115)) picked.push(p)
    if (picked.length === ITEMS.length) break
  }
  return shuffle([...ITEMS]).slice(0, picked.length).map((kind, i) => ({ kind, img: ITEM_IMG[kind], x: picked[i].x, y: picked[i].y, size: kind === 'twig' ? 92 : 78 }))
}

const mainFraction = (rig: AlpacaRig | null) => {
  if (!rig) return 0
  const main = rig.puffs.filter(isMain)
  return main.filter((p) => rig.gone.has(p.id)).length / main.length
}

export function FluffyDay({ onDone, setProgress }: ActivityProps) {
  const alive = useAlive()
  const root = useRef<HTMLDivElement>(null)
  const stageEl = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ W: 0, H: 0 })
  const [phase, setPhaseState] = useState<Phase>('story')
  const [prompt, setPrompt] = useState<Line | null>(null)
  const [stars, setStars] = useState(0)
  const [tool, setTool] = useState<Tool>('brush')
  const toolRef = useRef<Tool>('brush')
  toolRef.current = tool
  const [arrived, setArrived] = useState(false)
  const [cold, setCold] = useState<Record<Who, boolean>>({ luna: false, paco: false, abuela: false })
  const [asleep, setAsleep] = useState(false)
  const [happy, setHappy] = useState(false)
  const [mustache, setMustache] = useState(false)
  const [hats, setHats] = useState<Record<Who, string | null>>({ luna: null, paco: null, abuela: null })
  const [tray, setTray] = useState<string[]>([])
  const [yarn, setYarn] = useState<null | 'cream' | 'pink'>(null)
  const [bug, setBug] = useState<BugState>('hide')
  const [glow, setGlow] = useState<null | 'tool' | 'cactus' | 'hats'>(null)
  const [gust, setGust] = useState(false)
  const [flash, setFlash] = useState(0)
  const [birdOnPost, setBirdOnPost] = useState(false)
  const [flyers, setFlyers] = useState<Flyer[]>([])
  const [drop, setDrop] = useState<null | { from: { x: number; y: number }; to: { x: number; y: number } }>(null)
  const [shimmer, setShimmer] = useState(false)
  const [items, setItems] = useState<(StuckItem & { kind: ItemKind })[] | null>(null)
  const [hints, setHints] = useState<{ x: number; y: number }[]>([])
  const [pondGlow, setPondGlow] = useState(false)
  const [walking, setWalking] = useState(false)
  const [pinkDrop, setPinkDrop] = useState(false)

  // Her hat choices are remembered for Luna's journal window on the map.
  const [, saveHats] = useSaved<Record<Who, string | null> | null>(HATS_KEY, null)
  const rigs = useRef<Record<Who, { current: AlpacaRig | null }>>({ luna: { current: null }, paco: { current: null }, abuela: { current: null } }).current
  const puppets = useRef<Record<Who, { current: PuppetHandle | null }>>({ luna: { current: null }, paco: { current: null }, abuela: { current: null } }).current
  const sparkle = useRef<PuppetHandle>(null)
  const basket = useRef<BasketHandle>(null)
  const particles = useRef<ParticlesHandle>(null)
  const toolEl = useRef<HTMLDivElement>(null)
  const pacoEl = useRef<HTMLDivElement>(null)
  const hatEls = useRef(new Map<string, HTMLDivElement | null>())
  const dropEl = useRef<HTMLDivElement>(null)

  useEffect(() => setProgress(Math.min(stars, TOTAL), TOTAL), [stars])
  const star = (n: number) => setStars((s) => Math.max(s, n))

  // ---- Mutable state for pointer handling and the loop (React never sees it per move). ----
  const g = useRef({
    phase: 'story' as Phase,
    held: null as null | { id: number; x: number; y: number; moved: boolean; sx: number; sy: number },
    hat: null as null | { id: number; color: string; x: number; y: number; sx: number; sy: number; moved: boolean },
    spots: {} as Record<Who, Spot>,
    lastTouch: performance.now(),
    /** Last time she made progress (brushed, snipped, pulled something out): the quiet guide waits on this. */
    lastProgress: performance.now(),
    pondReady: false,
    yarnAt: 0,
    facts: 0,
    drop: null as null | { id: number; x: number; y: number; sx: number; sy: number; moved: boolean },
    lastHint: 0,
    lastSnip: 0,
    lastSnipSound: 0,
    lastSwish: 0,
    lastSpark: 0,
    lastLean: -9999,
    hummed: false,
    itemsOut: new Set<number>(),
    bangs: false,
    mustache: false,
    done: { luna: false, paco: false, abuela: false } as Record<Who, boolean>,
    slept: false,
    asleep: false,
    nextSnore: 0,
    lastPoke: 0,
    tickles: [] as number[],
    lastTickle: 0,
    pacoDx: 0,
    pacoTarget: 0,
    pacoBack: 0,
    hats: { luna: null, paco: null, abuela: null } as Record<Who, string | null>,
    flyerId: 1,
    busy: false,
  })
  const hintsRef = useRef(false)
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
  const S: StageLayout | null = size.W ? pickLayout(size.W, size.H) : null
  const scale = S ? Math.min(size.W / S.w, size.H / S.h) : 1
  const ox = S ? (size.W - S.w * scale) / 2 : 0
  const oy = S ? (size.H - S.h * scale) / 2 : 0
  const layoutRef = useRef({ S, scale, ox, oy })
  layoutRef.current = { S, scale, ox, oy }
  const spotOf = (who: Who): Spot | null => (S ? (who === 'luna' ? (arrived ? S.family.luna : S.solo) : arrived ? S.family[who] : S.offstage[who]) : null)
  if (S) for (const who of FAMILY) g.current.spots[who] = spotOf(who)!

  // Things stuck in Luna's fleece (needs her rig's puffs, so it's picked after the first render).
  useEffect(() => {
    if (rigs.luna.current && !items) setItems(stuckItems(rigs.luna.current))
  })

  /** Finger position in stage units. */
  const toStage = (cx: number, cy: number) => {
    const r = stageEl.current?.getBoundingClientRect()
    const s = layoutRef.current.scale
    return r ? { x: (cx - r.left) / s, y: (cy - r.top) / s } : { x: 0, y: 0 }
  }
  /** Where the tool rests in its tray. */
  const toolRest = () => {
    const T = layoutRef.current.S
    if (!T) return { x: 0, y: 0 }
    // Centred in the tray: undo the anchor so the whole picture sits in the middle.
    const t = TOOLS[toolRef.current]
    const w = T.tray.w * (T.tall ? 0.55 : 0.85)
    return { x: T.tray.x + T.tray.w / 2 + (t.at[0] - 0.5) * w, y: T.tray.y + T.tray.h / 2 + (t.at[1] - 0.5) * (w / t.aspect) }
  }
  const placeTool = (x: number, y: number, animate: boolean) => {
    const el = toolEl.current
    const T = layoutRef.current.S
    if (!el || !T) return
    const t = TOOLS[toolRef.current]
    const w = animate || !g.current.held ? T.tray.w * (T.tall ? 0.55 : 0.85) : T.tool
    el.style.transition = animate ? 'transform 0.35s cubic-bezier(.3,1.4,.5,1), width .35s' : 'none'
    el.style.width = `${w}px`
    el.style.height = `${w / t.aspect}px`
    // The working edge (bristles, clipper teeth) sits right under her finger.
    el.style.transform = `translate(${x - w * t.at[0]}px, ${y - (w / t.aspect) * t.at[1]}px) rotate(${g.current.held ? -6 : 0}deg)`
  }
  useEffect(() => {
    const r = toolRest()
    placeTool(r.x, r.y, false)
  }, [S, tool])

  const say1 = (line: Line) => void say(line)
  const nudge = (who: Who, action: string) => void puppets[who].current?.play(action)

  // ---- The story, then play. ----
  const startPlay = () => {
    setPhase('brush')
    setPrompt(F.brush)
    g.current.lastTouch = performance.now()
  }

  const fly = (f: Omit<Flyer, 'id'>) => {
    const id = g.current.flyerId++
    setFlyers((list) => [...list, { ...f, id }])
    setTimeout(() => alive() && setFlyers((list) => list.filter((x) => x.id !== id)), 2200)
  }

  // ---- 1. Brushing ----
  const pullItem = (i: number, it: StuckItem & { kind: ItemKind }) => {
    const G = g.current
    if (G.itemsOut.has(i) || !S) return
    G.itemsOut.add(i)
    G.lastProgress = performance.now()
    rigs.luna.current?.dropItem(i)
    const at = onStage(g.current.spots.luna, it.x, it.y)
    const kind = it.kind
    say1(F.found[kind])
    if (kind === 'bird') {
      fsfx.peep()
      fly({ img: it.img, from: at, to: { x: S.post.cx, y: S.post.bottom - S.post.h - 25 }, size: 90, kind: 'fly' })
      setTimeout(() => alive() && setBirdOnPost(true), 1300)
      nudge('luna', 'nod')
    } else if (kind === 'beetle') {
      sounds.pop()
      fly({ img: it.img, from: at, to: { x: at.x + 260, y: g.current.spots.luna.feet + 30 }, size: 70, kind: 'walk' })
      nudge('luna', 'nod')
    } else if (kind === 'dandelion') {
      sounds.whoosh()
      for (let k = 0; k < 8; k++) particles.current?.sparkle(at.x, at.y)
      nudge('luna', 'sneeze')
    } else {
      sfx.pop()
      fly({ img: it.img, from: at, to: { x: at.x - 180 + Math.random() * 80, y: g.current.spots.luna.feet + 20 }, size: it.size, kind: 'toss' })
      nudge('luna', 'shake')
    }
    checkBrushed()
  }

  const checkBrushed = () => {
    const G = g.current
    const rig = rigs.luna.current
    if (G.phase !== 'brush' || !rig || !items) return
    const brushed = rig.brushed.size / rig.puffs.length
    if (G.itemsOut.size >= items.length && G.bangs && brushed >= 0.55 && !G.busy) {
      G.busy = true
      void (async () => {
        star(1)
        await wait(900)
        if (!alive()) return
        nudge('luna', 'cheer')
        sounds.sparkle()
        setTool('clippers')
        setPhase('clip')
        setPrompt(F.clippers)
        G.busy = false
        G.lastTouch = performance.now()
      })()
    }
  }

  // ---- 2. Clipping, the mirror and the wind ----
  const mirror = async () => {
    const G = g.current
    if (G.busy || G.phase !== 'clip') return
    G.busy = true
    G.pondReady = false
    setPondGlow(false)
    setPrompt(null)
    setPhase('mirror')
    G.done.luna = true
    star(2)
    nudge('luna', 'look')
    setShimmer(true)
    await wait(1200)
    if (!alive()) return
    setShimmer(false)
    const left = 1 - mainFraction(rigs.luna.current)
    const line = left < 0.04 ? F.mirror.skinny : left > 0.2 ? F.mirror.silly : F.mirror.pretty
    nudge('luna', left > 0.2 ? 'giggle' : 'cheer')
    await say(line)
    if (!alive()) return
    // The cold wind: she *feels* why alpacas need their fleece up here. Paco and Abuela trot in meanwhile.
    setGust(true)
    fsfx.wind()
    setCold((c) => ({ ...c, luna: true }))
    nudge('luna', 'shiver')
    setArrived(true)
    setWalking(true)
    for (let i = 0; i < 3; i++) setTimeout(() => nudge('paco', 'hop'), 300 + i * 600)
    await Promise.all([say(F.chilly), wait(1900)])
    if (!alive()) return
    setGust(false)
    setWalking(false)
    // Her hands are busy again right away; the family says hello while she clips.
    setPhase('family')
    G.busy = false
    G.lastTouch = G.lastProgress = performance.now()
    nudge('paco', 'hop')
    await say(F.family[0])
    nudge('abuela', 'nod')
    await say(F.family[1], { interrupt: false })
    if (alive()) setPrompt(F.familyGo)
  }

  const familyDone = (who: 'paco' | 'abuela') => {
    const G = g.current
    G.done[who] = true
    if (who === 'abuela') {
      G.asleep = false
      setAsleep(false)
    }
    setCold((c) => ({ ...c, [who]: true }))
    nudge(who, 'shiver')
    say1(F.doneCold[who])
    star(who === 'paco' ? 3 : 4)
    // The yarn waits until she has stopped snipping for a moment, so she can finish the haircuts her way.
    if (G.done.paco && G.done.abuela) G.yarnAt = performance.now()
  }

  // ---- Side verb: yarn, the cactus bug's pink, the hats ----
  const toYarn = () => {
    const G = g.current
    if (G.phase === 'yarn' || G.phase === 'hats') return
    setPhase('yarn')
    basket.current?.wobble()
    sounds.sparkle()
    setYarn('cream')
    setPrompt(F.yarn)
    setGlow('cactus')
    G.lastTouch = performance.now()
  }

  /** Tap the cactus: the tiny cochineal bug waves, then turns into a drop of pink for her to carry to the yarn. */
  const dye = async () => {
    const G = g.current
    if (G.busy || !S || pinkRef.current) return
    G.busy = true
    setGlow(null)
    setBug('wave')
    await say(F.bug)
    if (!alive()) return
    setBug('squish')
    fsfx.drop()
    await wait(500)
    if (!alive()) return
    setBug('peek')
    setPinkDrop(true)
    setPrompt(F.dropGo)
    G.busy = false
    G.lastTouch = performance.now()
  }

  /** The pink drop reaches the yarn: pink yarn, then the hats. */
  const dyeYarn = async (from: { x: number; y: number }) => {
    const G = g.current
    if (G.busy || !S) return
    G.busy = true
    setPinkDrop(false)
    const mouth = basket.current?.mouth() ?? { x: S.basket.cx, y: S.basket.bottom - 200 }
    setDrop({ from, to: { x: mouth.x, y: mouth.y - 60 } })
    fsfx.drop()
    await wait(900)
    if (!alive()) return
    setDrop(null)
    setYarn('pink')
    sounds.sparkle()
    const s = layoutRef.current
    burst(s.S ? (s.ox + mouth.x * s.scale) / size.W : 0.3, s.S ? (s.oy + (mouth.y - 60) * s.scale) / size.H : 0.7)
    star(5)
    await say(F.pink)
    if (!alive()) return
    setTray(HATS)
    setPhase('hats')
    setPrompt(F.hats)
    G.busy = false
    G.lastTouch = performance.now()
  }

  /** Where the pink drop waits on the cactus (stage units). */
  const dropHome = () => (S ? { x: S.cactus.cx - S.cactus.h * 0.1, y: S.cactus.bottom - S.cactus.h * 0.62 } : { x: 0, y: 0 })

  const putHat = (who: Who, color: string) => {
    const G = g.current
    const old = G.hats[who]
    const first = !old
    G.hats = { ...G.hats, [who]: color }
    setHats(G.hats)
    setTray((t) => [...t.filter((c) => c !== color), ...(old ? [old] : [])])
    fsfx.fwump()
    nudge(who, 'cheer')
    if (first) {
      setCold((c) => ({ ...c, [who]: false }))
      say1(F.cozy[who])
    }
    if (FAMILY.every((w) => G.hats[w])) void photo()
  }

  const photo = async () => {
    const G = g.current
    if (G.phase === 'photo' || G.phase === 'done') return
    setPhase('photo')
    setPrompt(null)
    saveHats(G.hats)
    star(6)
    await wait(1100)
    if (!alive()) return
    for (const who of FAMILY) nudge(who, 'cheer')
    void sparkle.current?.play('cheer')
    fsfx.click()
    setFlash((f) => f + 1)
    burst(0.5, 0.45)
    await say(F.photo)
    await wait(900)
    if (!alive()) return
    setPhase('done')
    onDone()
  }

  const pinkRef = useRef(false)
  pinkRef.current = pinkDrop
  /** Stage spots that still need her: stuck things and the bangs while brushing, the fluffiest puffs while clipping. */
  const hintSpots = () => {
    const G = g.current
    const out: { x: number; y: number }[] = []
    if (G.phase === 'brush') {
      items?.forEach((it, i) => !G.itemsOut.has(i) && out.push(onStage(G.spots.luna, it.x, it.y)))
      const rig = rigs.luna.current
      if (!G.bangs) out.push(onStage(G.spots.luna, 457, 128))
      if (!out.length && rig) {
        const p = rig.puffs.find((q) => !rig.brushed.has(q.id))
        if (p) out.push(onStage(G.spots.luna, p.x, p.y))
      }
    } else {
      for (const who of targetsFor(G.phase)) {
        const rig = rigs[who].current
        if (!rig || G.done[who]) continue
        const left = rig.puffs.filter((q) => isMain(q) && !rig.gone.has(q.id))
        const p = left[Math.floor(left.length / 2)]
        if (p) out.push(onStage(G.spots[who], p.x, p.y))
      }
    }
    return out.slice(0, 3)
  }

  // ---- The core verb: the tool rubbing over the fleece ----
  const targetsFor = (p: Phase): Who[] => (p === 'brush' || p === 'clip' ? ['luna'] : p === 'family' ? ['paco', 'abuela'] : [])

  /** Everything the tool does at one point of a stroke (stage units). */
  const rubAt = (x: number, y: number) => {
    const G = g.current
    const now = performance.now()
    const phase = G.phase
    const R = phase === 'brush' ? 78 : 46
    for (const who of targetsFor(phase)) {
      const rig = rigs[who].current
      const spot = G.spots[who]
      if (!rig || !spot) continue
      const dx = who === 'paco' ? G.pacoDx : 0
      // Into the alpaca's own picture units.
      const ax = (x - spot.left - dx) / spot.k
      const ay = VIEW.feetY - (spot.feet - y) / spot.k
      const r = R / spot.k
      if (ax < -r || ax > VIEW.w + r || ay < -r || ay > VIEW.h + r) continue
      let hits = 0
      let belly = false
      let topSnip = false
      for (const p of rig.puffs) {
        if (rig.gone.has(p.id)) continue
        if (Math.hypot(p.x - ax, p.y - ay) > r + p.r * (phase === 'brush' ? 0.5 : 0.25)) continue
        if (phase === 'brush') {
          if (p.zone === 'bang' && !G.bangs) {
            G.bangs = true
            rig.bangsAside()
            setTimeout(() => {
              if (!alive()) return
              nudge('luna', 'nod')
              say1(F.see)
              checkBrushed()
            }, 450)
          }
          if (!rig.brushed.has(p.id)) {
            rig.brush(p.id)
            hits++
            if (now - G.lastSpark > 70) {
              G.lastSpark = now
              const at = onStage(spot, p.x, p.y)
              particles.current?.sparkle(at.x + dx, at.y)
            }
          }
        } else {
          if (p.zone === 'bang') continue
          rig.snip(p.id)
          hits++
          if (p.zone === 'belly') belly = true
          if (p.zone === 'top') topSnip = true
          const at = onStage(spot, p.x, p.y)
          const to = basket.current?.mouth() ?? { x: 0, y: 0 }
          const color = LOOKS[who].fleece
          particles.current?.wool(at.x + dx, at.y, p.r * spot.k * 1.4, color, to, () => basket.current?.add(color))
        }
      }
      if (phase === 'brush' && items) {
        items.forEach((it, i) => {
          if (!G.itemsOut.has(i) && Math.hypot(it.x - ax, it.y - ay) < r + it.size * 0.4) pullItem(i, it)
        })
      }
      if (!hits) continue
      G.lastProgress = now
      if (hintsRef.current) {
        hintsRef.current = false
        setHints([])
      }
      if (phase === 'brush') {
        if (now - G.lastSwish > 220) {
          G.lastSwish = now
          fsfx.swish()
        }
        // Luna leans into the brush and hums (real alpacas hum when they're content).
        if (now - G.lastLean > 2200) {
          G.lastLean = now
          nudge('luna', 'lean')
          fsfx.hum()
          setHappy(true)
          setTimeout(() => alive() && setHappy(false), 1100)
        }
        checkBrushed()
      } else {
        G.lastSnip = now
        if (now - G.lastSnipSound > 70) {
          G.lastSnipSound = now
          fsfx.snip()
        }
        if (topSnip && who === 'luna' && !G.mustache) {
          G.mustache = true
          setMustache(true)
          nudge('luna', 'giggle')
          say1(F.mustache)
        }
        if (who === 'paco' && belly) tickle()
        if (phase === 'clip' && !G.pondReady && mainFraction(rig) >= CLIPPED) {
          G.pondReady = true
          setPondGlow(true)
          setPrompt(F.pond)
        }
        if (who === 'abuela' && !G.slept && mainFraction(rig) > 0.35) {
          // A big yawn first, then she nods off.
          G.slept = true
          nudge('abuela', 'yawn')
          say1(F.sleepy)
          setTimeout(() => {
            if (!alive() || G.done.abuela) return
            G.asleep = true
            G.nextSnore = performance.now() + 1500
            setAsleep(true)
          }, 1700)
        }
        if (phase === 'family' && !G.done[who] && mainFraction(rig) >= CLIPPED) familyDone(who as 'paco' | 'abuela')
      }
    }
  }

  /** Paco is ticklish: snipping his tummy makes him giggle and scoot (he always comes back). */
  const tickle = () => {
    const G = g.current
    const now = performance.now()
    if (now - G.lastTickle < 2200 || Math.random() > 0.5) return
    G.lastTickle = now
    G.tickles = [...G.tickles.filter((t) => now - t < 9000), now]
    const T = layoutRef.current.S
    const room = T ? (T.tall ? 60 : 90) : 60
    G.pacoTarget = (Math.random() < 0.5 ? -1 : 1) * room
    G.pacoBack = now + 1300
    if (G.tickles.length >= 3) {
      G.tickles = []
      nudge('paco', 'roll')
      say1(F.roll)
    } else {
      nudge('paco', 'giggle')
      say1(F.tickle[Math.floor(Math.random() * F.tickle.length)])
    }
    sfx.boing()
  }

  /** Which alpaca is under this point (for taps that aren't strokes). */
  const alpacaAt = (x: number, y: number): Who | null => {
    for (const who of [...FAMILY].reverse()) {
      const spot = g.current.spots[who]
      if (!spot) continue
      const top = boxTop(spot)
      const left = spot.left + (who === 'paco' ? g.current.pacoDx : 0)
      if (x > left + 60 * spot.k && x < left + 570 * spot.k && y > top && y < spot.feet) return who
    }
    return null
  }

  // ---- Pointer handling on the stage ----
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    G.lastTouch = performance.now()
    const target = e.target as Element
    if (target.closest('button')) return
    const p = toStage(e.clientX, e.clientY)
    if (target.closest('[data-drop]') && G.phase === 'yarn' && pinkRef.current && !G.drop) {
      G.drop = { id: e.pointerId, x: p.x, y: p.y, sx: p.x, sy: p.y, moved: false }
      e.currentTarget.setPointerCapture(e.pointerId)
      sounds.pop()
      return
    }
    const hatEl = target.closest('[data-hat]') as HTMLElement | null
    if (hatEl && G.phase === 'hats' && !G.hat) {
      G.hat = { id: e.pointerId, color: hatEl.dataset.hat!, x: p.x, y: p.y, sx: p.x, sy: p.y, moved: false }
      e.currentTarget.setPointerCapture(e.pointerId)
      setGlow(null)
      sounds.pop()
      return
    }
    if ((G.phase === 'brush' || G.phase === 'clip' || G.phase === 'family') && !G.held) {
      G.held = { id: e.pointerId, x: p.x, y: p.y, moved: false, sx: p.x, sy: p.y }
      e.currentTarget.setPointerCapture(e.pointerId)
      placeTool(p.x, p.y, false)
      setGlow(null)
      rubAt(p.x, p.y)
      return
    }
    // Other moments: a tap on an alpaca gets a giggle.
    const who = alpacaAt(p.x, p.y)
    if (who && G.phase !== 'story') {
      nudge(who, who === 'abuela' && G.asleep ? 'nod' : 'giggle')
      sounds.pop()
    }
  }

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    const p = toStage(e.clientX, e.clientY)
    if (G.held && e.pointerId === G.held.id) {
      // Walk the stroke in small steps so a fast swipe doesn't skip puffs.
      const steps = Math.max(1, Math.ceil(Math.hypot(p.x - G.held.x, p.y - G.held.y) / 18))
      for (let i = 1; i <= steps; i++) rubAt(G.held.x + ((p.x - G.held.x) * i) / steps, G.held.y + ((p.y - G.held.y) * i) / steps)
      if (Math.hypot(p.x - G.held.sx, p.y - G.held.sy) > 12) G.held.moved = true
      G.held.x = p.x
      G.held.y = p.y
      placeTool(p.x, p.y, false)
    } else if (G.drop && e.pointerId === G.drop.id) {
      G.drop.x = p.x
      G.drop.y = p.y
      if (Math.hypot(p.x - G.drop.sx, p.y - G.drop.sy) > 10) G.drop.moved = true
      if (dropEl.current) dropEl.current.style.transform = `translate(${p.x - G.drop.sx}px, ${p.y - G.drop.sy}px) scale(1.15)`
    } else if (G.hat && e.pointerId === G.hat.id) {
      G.hat.x = p.x
      G.hat.y = p.y
      if (Math.hypot(p.x - G.hat.sx, p.y - G.hat.sy) > 10) G.hat.moved = true
      const el = hatEls.current.get(G.hat.color)
      if (el) el.style.transform = `translate(${p.x - G.hat.sx}px, ${p.y - G.hat.sy}px) scale(1.15)`
    }
  }

  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    if (G.held && e.pointerId === G.held.id) {
      const tap = !G.held.moved
      const p = { x: G.held.x, y: G.held.y }
      G.held = null
      const r = toolRest()
      placeTool(r.x, r.y, true)
      // Poking sleeping Abuela makes her snore louder.
      if (tap && G.asleep && alpacaAt(p.x, p.y) === 'abuela' && performance.now() - G.lastPoke > 2500) {
        G.lastPoke = performance.now()
        fsfx.snore(true)
        say1(F.snore)
      }
      if (G.phase === 'clip' && mainFraction(rigs.luna.current) >= 0.97) void mirror()
    } else if (G.drop && e.pointerId === G.drop.id) {
      const d = G.drop
      G.drop = null
      const T = layoutRef.current.S
      const yarnAt = T ? { x: T.basket.cx, y: T.basket.bottom - T.basket.w * 0.72 - 70 } : { x: 0, y: 0 }
      // Carried to the yarn, or just tapped (then it flies there by itself).
      if (!d.moved || Math.hypot(d.x - yarnAt.x, d.y - yarnAt.y) < 190) {
        if (dropEl.current) dropEl.current.style.transform = ''
        void dyeYarn(d.moved ? { x: d.x, y: d.y } : dropHome())
      } else {
        if (dropEl.current) dropEl.current.style.transform = ''
        sfx.boing()
      }
    } else if (G.hat && e.pointerId === G.hat.id) {
      const h = G.hat
      G.hat = null
      const el = hatEls.current.get(h.color)
      if (el) el.style.transform = ''
      // Dropped near a head: on it goes. A tap puts it on the next alpaca without a hat.
      let best: Who | null = null
      let bestD = 190
      if (h.moved) {
        for (const who of FAMILY) {
          const spot = G.spots[who]
          const at = onStage(spot, HAT_SPOT.x, HAT_SPOT.y)
          const d = Math.hypot(at.x - h.x, at.y - h.y)
          if (d < bestD) {
            bestD = d
            best = who
          }
        }
      } else best = FAMILY.find((w) => !G.hats[w]) ?? null
      if (best) putHat(best, h.color)
      else sfx.boing()
    }
  }

  // ---- The loop: Paco's scoot, Abuela's snores, the haircut's end, the quiet guide ----
  useGameLoop((dt) => {
    if (dt <= 0) return
    const G = g.current
    const now = performance.now()
    // Paco scoots away when tickled, then trots back.
    if (now > G.pacoBack) G.pacoTarget = 0
    G.pacoDx += (G.pacoTarget - G.pacoDx) * Math.min(1, dt * 5)
    // Moving = little sideways hops, not a slide.
    const hopping = Math.abs(G.pacoTarget - G.pacoDx) > 4
    const hopY = hopping ? -Math.abs(Math.sin(now / 90)) * 22 : 0
    if (pacoEl.current) pacoEl.current.style.transform = `translate(${G.pacoDx.toFixed(1)}px, ${hopY.toFixed(1)}px)`
    if (G.asleep && now > G.nextSnore) {
      G.nextSnore = now + 2800
      fsfx.snore()
    }
    // Both family haircuts done: once the clippers have rested a moment, the wool becomes yarn.
    if (G.phase === 'family' && G.yarnAt && !G.held && now - G.lastSnip > 2200 && now - G.yarnAt > 1500) {
      G.yarnAt = 0
      toYarn()
    }
    // Sparkle speaks only when she's been still for a while.
    const idleKey = G.phase === 'brush' ? 'brush' : G.phase === 'clip' || G.phase === 'family' ? 'clip' : G.phase === 'yarn' ? 'cactus' : G.phase === 'hats' ? 'hats' : null
    const quiet = Math.max(G.lastProgress, idleKey === 'brush' || idleKey === 'clip' ? 0 : G.lastTouch)
    if (idleKey && !G.busy && !G.hat && now - quiet > 8000 && now - G.lastHint > 12000 && !G.pondReady) {
      G.lastHint = now
      void say(G.phase === 'yarn' && pinkRef.current ? F.dropGo : F.idle[idleKey])
      if (idleKey === 'brush' || idleKey === 'clip') {
        // Show exactly what's left: things still stuck, the bangs, or a fluffy spot.
        setHints(hintSpots())
        hintsRef.current = true
        if (!G.held) setGlow('tool')
      } else setGlow(idleKey === 'cactus' ? 'cactus' : idleKey === 'hats' ? 'hats' : 'tool')
    }
  })

  // ---- QA hook: jump to a later moment (motion and screen QA) ----
  useEffect(() => {
    const snipAll = (who: Who, share: number) => {
      const rig = rigs[who].current
      if (!rig) return
      for (const p of rig.puffs) if (isMain(p) && Math.random() < share) rig.snip(p.id)
    }
    window.__peruQA = {
      jump: (to) => {
        const G = g.current
        const order = ['clip', 'family', 'yarn', 'hats', 'photo']
        const at = order.indexOf(to)
        const rig = rigs.luna.current
        if (rig) {
          rig.puffs.forEach((p) => rig.brush(p.id))
          rig.bangsAside()
          items?.forEach((_, i) => {
            rig.dropItem(i)
            G.itemsOut.add(i)
          })
        }
        G.bangs = true
        G.pondReady = false
        setPondGlow(false)
        setWalking(false)
        setTool('clippers')
        if (at >= 1) {
          snipAll('luna', 0.85)
          G.done.luna = true
          setCold((c) => ({ ...c, luna: true }))
          setArrived(true)
        }
        if (at >= 2) {
          snipAll('paco', 0.85)
          snipAll('abuela', 0.85)
          G.done.paco = G.done.abuela = true
          setCold({ luna: true, paco: true, abuela: true })
        }
        G.busy = false
        if (to === 'clip') {
          setPhase('clip')
          setPrompt(F.clippers)
        } else if (to === 'family') {
          setPhase('family')
          setPrompt(F.familyGo)
        } else if (to === 'yarn') toYarn()
        else {
          setYarn('pink')
          setTray(HATS)
          setPhase('hats')
          setPrompt(F.hats)
          if (to === 'photo') {
            G.hats = { luna: 'pink', paco: 'brown', abuela: 'hotpink' }
            setHats(G.hats)
            setTray(['cream'])
            setCold({ luna: false, paco: false, abuela: false })
            void photo()
          }
        }
        G.lastTouch = performance.now()
      },
    }
    return () => {
      delete window.__peruQA
    }
  })

  const toolOn = phase === 'brush' || phase === 'clip' || phase === 'family'
  const sky = S?.tall ? SKY.tall : SKY.wide
  const groundPx = S ? oy + S.ground * scale : 0
  // Thin side bands: stretch the painting a little to cover them. Wide ones (phones held sideways): fade its edges
  // into the painting's own flat sky and meadow colors.
  const band = S ? ox / scale : 0
  const bgFit =
    band < (S?.w ?? 0) * 0.06
      ? { left: -band, width: (S?.w ?? 0) + band * 2 }
      : { left: 0, width: '100%', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)' }

  return (
    <div
      ref={root}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: S ? `linear-gradient(${sky} 0, ${sky} ${groundPx}px, ${MEADOW} ${groundPx}px)` : sky, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
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
          <img
            src={S.tall ? art.bgAndesTall : art.bgAndes}
            alt=""
            draggable={false}
            style={{ position: 'absolute', top: 0, height: '100%', pointerEvents: 'none', ...bgFit }}
          />
          {/* Far away: clouds, a snowy peak, the stone wall, the post with Luna's satchel. */}
          <Peak x={S.peak.x} y={S.peak.y} />
          {S.clouds.map((c, i) => (
            <Cloud key={i} {...c} gust={gust} delay={i * 3} />
          ))}
          <Wall {...S.wall} />
          <Post
            {...S.post}
            bird={birdOnPost}
            onBird={() => {
              fsfx.peep()
              sounds.pop()
            }}
          />
          <Hummingbird {...S.humming} />
          <Pond {...S.pond} shimmer={shimmer} glow={pondGlow} onTap={() => g.current.pondReady && void mirror()} />

          {/* The alpacas. Luna steps back when her family arrives. */}
          {FAMILY.map((who) => {
            const spot = spotOf(who)!
            const h = boxHeight(spot)
            return (
              <div
                key={who}
                style={{ position: 'absolute', left: spot.left, top: boxTop(spot), height: h, width: (h * VIEW.w) / VIEW.h, transition: 'left 1.8s ease-in-out, top 1.8s ease-in-out, height 1.8s ease-in-out, width 1.8s ease-in-out', zIndex: who === 'luna' ? (arrived ? 3 : 8) : 8, pointerEvents: 'none' }}
              >
                <div ref={who === 'paco' ? pacoEl : undefined} style={{ width: '100%', height: '100%' }}>
                  <Alpaca
                    ref={puppets[who]}
                    rig={rigs[who]}
                    kind={who}
                    label={who === 'luna' ? 'Luna' : who === 'paco' ? 'Paco' : 'Abuela Killa'}
                    height="100%"
                    bangs={who === 'luna'}
                    smooth={who !== 'luna'}
                    items={who === 'luna' ? (items ?? []) : []}
                    cold={cold[who]}
                    asleep={who === 'abuela' && asleep}
                    happy={who === 'luna' && happy}
                    walking={walking}
                    mustache={who === 'luna' && mustache}
                    hat={hats[who]}
                  />
                </div>
              </div>
            )
          })}

          {/* Sparkle, the guide, at the side of the meadow. */}
          <motion.button
            aria-label="Sparkle"
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              void sparkle.current?.play('nod')
              sounds.pop()
              // Tap-to-hear facts (never required listening).
              say1([F.hum, F.colors][g.current.facts++ % 2])
            }}
            style={{ position: 'absolute', left: S.sparkle.cx - S.sparkle.h * 0.45, top: S.sparkle.bottom - S.sparkle.h, width: S.sparkle.h * 0.9, height: S.sparkle.h, padding: 0, background: 'none', border: 'none', zIndex: 9, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          >
            <SparklePuppet ref={sparkle} height={`${S.sparkle.h}px`} lookToward={0.7} />
          </motion.button>

          <Basket
            ref={basket}
            {...S.basket}
            onTap={() => {
              basket.current?.wobble()
              say1(F.colors)
            }}
          />
          {yarn && <Yarn cx={S.basket.cx} y={S.basket.bottom - S.basket.w * 0.72 - 70} pink={yarn === 'pink'} />}
          <Cactus {...S.cactus} glow={glow === 'cactus'} bug={bug} onTap={() => (phase === 'yarn' ? void dye() : (setBug('peek'), sounds.pop(), setTimeout(() => alive() && setBug('hide'), 1600)))} />

          {/* The tray: the tool rests here; later, the hats. */}
          <div style={{ position: 'absolute', left: S.tray.x, top: S.tray.y, width: S.tray.w, height: S.tray.h, borderRadius: 36, background: 'rgba(255,247,240,.82)', border: `5px solid ${INK}`, boxShadow: '0 8px 0 rgba(43,35,48,.15)', zIndex: 10, display: 'flex', flexDirection: S.tall ? 'row' : 'column', alignItems: 'center', justifyContent: 'space-evenly', opacity: toolOn || phase === 'hats' ? 1 : 0.4, transition: 'opacity .4s' }}>
            {phase === 'hats' &&
              tray.map((c) => (
                <div
                  key={c}
                  data-hat={c}
                  ref={(el) => void hatEls.current.set(c, el)}
                  aria-label={`${c} hat`}
                  className={glow === 'hats' ? 'world-glow' : undefined}
                  style={{ width: S.tall ? S.tray.w / 4 - 6 : S.tray.w - 16, height: S.tall ? S.tray.h - 16 : S.tray.h / 4 - 6, borderRadius: 28, display: 'grid', placeItems: 'center', cursor: 'grab', touchAction: 'none', zIndex: 21, position: 'relative' }}
                >
                  <svg viewBox="-60 -78 120 168" style={{ width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
                    <HatShape color={c} />
                  </svg>
                </div>
              ))}
          </div>

          {/* The tool in her hand (or resting in the tray). */}
          <div
            ref={toolEl}
            aria-hidden
            className={glow === 'tool' ? 'peru-tool-glow' : undefined}
            style={{ position: 'absolute', left: 0, top: 0, zIndex: 20, pointerEvents: 'none', display: toolOn ? 'block' : 'none', willChange: 'transform' }}
          >
            <img src={tool === 'brush' ? art.brush : art.clippers} alt={tool} draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>

          <Particles ref={particles} />

          {/* The quiet guide's hint: rings on what still needs her. */}
          {hints.map((h, i) => (
            <div key={i} aria-hidden style={{ position: 'absolute', left: h.x - 60, top: h.y - 60, width: 120, height: 120, zIndex: 18, pointerEvents: 'none' }}>
              <div className="peru-hint-ring" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '8px solid #FFC83D', boxShadow: '0 0 0 4px rgba(255,255,255,.7)' }} />
            </div>
          ))}

          {/* The cochineal bug's pink drop, waiting on the cactus for her to carry it to the yarn. */}
          {pinkDrop && (
            <div ref={dropEl} data-drop aria-label="pink drop" className="world-glow" style={{ position: 'absolute', left: dropHome().x - 50, top: dropHome().y - 55, width: 100, height: 110, borderRadius: '50%', zIndex: 19, touchAction: 'none', cursor: 'grab', display: 'grid', placeItems: 'center' }}>
              <svg viewBox="-22 -32 44 56" style={{ width: 66, height: 84, pointerEvents: 'none' }}>
                <path d="M0 -28Q18 -2 18 8A18 18 0 0 1 -18 8Q-18 -2 0 -28Z" fill="#FF4F9A" stroke={INK} strokeWidth="4" />
                <circle cx="-6" cy="6" r="4" fill="#FFF7F0" />
              </svg>
            </div>
          )}

          {/* Things that come out of the fleece, the drop of pink dye. */}
          <AnimatePresence>
            {flyers.map((f) => (
              <motion.img
                key={f.id}
                src={f.img}
                alt=""
                initial={{ x: f.from.x - f.size / 2, y: f.from.y - f.size / 2, rotate: 0, opacity: 1 }}
                animate={
                  f.kind === 'fly'
                    ? { x: [f.from.x - f.size / 2, (f.from.x + f.to.x) / 2, f.to.x - f.size / 2], y: [f.from.y - f.size / 2, Math.min(f.from.y, f.to.y) - 220, f.to.y - f.size / 2], opacity: [1, 1, 0] }
                    : f.kind === 'walk'
                      ? { x: f.to.x, y: [f.from.y - f.size / 2, f.to.y - f.size], rotate: [0, 8, -8, 8, 0], opacity: [1, 1, 0] }
                      : { x: f.to.x - f.size / 2, y: [f.from.y - f.size / 2, f.from.y - 160, f.to.y - f.size / 2], rotate: 540, opacity: [1, 1, 0] }
                }
                transition={{ duration: f.kind === 'walk' ? 2 : 1.3, times: f.kind === 'fly' ? [0, 0.5, 1] : undefined, ease: 'easeInOut' }}
                style={{ position: 'absolute', left: 0, top: 0, width: f.size, height: f.size, objectFit: 'contain', pointerEvents: 'none', zIndex: 16 }}
              />
            ))}
          </AnimatePresence>
          {drop && (
            <motion.div
              initial={{ x: drop.from.x - 22, y: drop.from.y - 22, scale: 0.4 }}
              animate={{ x: [drop.from.x - 22, (drop.from.x + drop.to.x) / 2 - 22, drop.to.x - 22], y: [drop.from.y - 22, Math.min(drop.from.y, drop.to.y) - 200, drop.to.y - 22], scale: [0.4, 1.2, 1] }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              style={{ position: 'absolute', left: 0, top: 0, width: 44, height: 56, zIndex: 17, pointerEvents: 'none' }}
            >
              <svg viewBox="-22 -32 44 56" style={{ width: '100%', height: '100%' }}>
                <path d="M0 -28Q18 -2 18 8A18 18 0 0 1 -18 8Q-18 -2 0 -28Z" fill="#FF4F9A" stroke={INK} strokeWidth="4" />
                <circle cx="-6" cy="6" r="4" fill="#FFF7F0" />
              </svg>
            </motion.div>
          )}
          {gust && <Wind w={S.w} h={S.h} />}
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

      {phase === 'story' && <StoryBeat lines={F.story} bg={art.bgAndes} friend={<Alpaca kind="luna" height="100%" bangs />} onDone={startPlay} />}
    </div>
  )
}

/** The basket's wool spun into a ball of yarn (cream, then cochineal pink). */
function Yarn({ cx, y, pink }: { cx: number; y: number; pink: boolean }) {
  const c = pink ? HAT_COLORS.pink.main : '#FFF7F0'
  const d = pink ? HAT_COLORS.hotpink.main : '#E8D9C8'
  return (
    <motion.div key={String(pink)} initial={{ scale: 0, y: 40 }} animate={{ scale: [0, 1.25, 1], y: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', left: cx - 70, top: y - 70, width: 140, height: 140, zIndex: 12, pointerEvents: 'none' }}>
      <svg viewBox="-60 -60 120 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <circle r="52" fill={c} stroke={INK} strokeWidth="6" />
        <path d="M-40 -30Q0 -10 30 -42M-50 0Q0 16 48 -16M-44 26Q0 36 40 24M-20 -48Q-8 0 -24 46M12 -50Q26 0 14 50" fill="none" stroke={d} strokeWidth="6" strokeLinecap="round" />
        <path d="M44 28Q66 40 58 58" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <path d="M44 28Q66 40 58 58" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </motion.div>
  )
}

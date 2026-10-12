// Downstairs at Baan Chang: the elephant yard, and the core toy. She pulls food off the tray and holds it out; every
// trunk close enough snakes after her finger (a jointed chain with lag), and the first tip to touch it curls round it,
// swings it up to the mouth and munches. Tapping a food instead hands it to the hungriest trunk. The verb deepens:
//   1. Bananas: any elephant, any banana.
//   2. Favorite foods: each elephant shows what it wants in a bubble (sometimes three!). The wrong snack gets sniffed and
//      tossed over its back, or passed to the elephant who wanted it. Nothing is ever wrong.
//   3. Watermelon: a whole one is too big for the baby, so a grown-up stomps it open and the baby eats the slices. The
//      baby wanders, and when her hands are still it sneaks a sip of her chocolate milk.
// Payoff: full bellies, trumpets and a water shower with a rainbow.
// Trunks, bodies and carried food are written to the DOM from one game loop; React only re-renders on discrete changes.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { burst, say, sounds, SparklePuppet, useGameLoop, type PuppetHandle } from '../../../../../sdk'
import { L } from '../../lines'
import { PokeButton } from './Cafe'
import { FEEL } from './feel'
import { BODY, bodyPt, type ElephantId, type ElephantSpot, type FoodKind, type Pt, type Stage } from './layout'
import { csfx } from './sfx'
import { COLORS, Food, INK, type StrawColor } from './shapes'
import { makeTrunk, stepTrunk, tipOf, type Trunk } from './trunk'

export type YardStage = 'bananas' | 'favorites' | 'watermelon' | 'shower'

interface Want {
  kind: FoodKind
  left: number
}
const WANTS: Record<'favorites' | 'watermelon', Record<ElephantId, Want>> = {
  favorites: { baby: { kind: 'cucumber', left: 1 }, mama: { kind: 'sugarcane', left: 3 }, auntie: { kind: 'pineapple', left: 1 } },
  watermelon: { mama: { kind: 'watermelon', left: 1 }, auntie: { kind: 'corn', left: 2 }, baby: { kind: 'slice', left: 3 } },
}
const TRAY: Record<YardStage, (FoodKind | null)[]> = {
  bananas: ['banana', 'banana', 'banana', 'banana', 'banana', 'banana'],
  favorites: ['banana', 'cucumber', 'sugarcane', 'pineapple', 'corn', null],
  watermelon: ['banana', 'cucumber', 'sugarcane', 'pineapple', 'corn', 'watermelon'],
  shower: [null, null, null, null, null, null],
}
const LABEL: Record<ElephantId, string> = { mama: 'Mama', baby: 'Baby', auntie: 'Auntie' }

type Mode = 'idle' | 'carry' | 'munch' | 'sniff' | 'toss' | 'pass' | 'tooBig' | 'stomp' | 'sneak' | 'slurp' | 'spray'
type Outcome = 'eat' | 'toss' | 'pass' | 'tooBig' | 'stomp'

interface Ele {
  spot: ElephantSpot
  bx: number
  trunk: Trunk
  len: number
  mode: Mode
  t: number
  outcome: Outcome
  passTo: ElephantId | null
  full: number
  flap: number
  phase: number
}

interface HeldFood {
  kind: FoodKind
  slot: number
  x: number
  y: number
  sx: number
  sy: number
  moved: boolean
  /** A tapped food glides to this elephant's trunk by itself. */
  auto: ElephantId | null
}

interface Flyer {
  id: number
  kind: FoodKind | 'drop' | 'hay'
  from: Pt
  to: Pt
  arc: number
  dur: number
  spin?: number
}

export interface YardProps {
  S: Stage
  active: boolean
  first: YardStage
  straw: StrawColor
  cream: boolean
  onStage: (s: YardStage) => void
  onDone: () => void
}

export function Yard({ S, active, first, straw, cream, onStage, onDone }: YardProps) {
  const Y = S.yard
  const [stage, setStageState] = useState<YardStage>(first)
  const [wants, setWants] = useState<Partial<Record<ElephantId, Want | null>>>(first === 'favorites' || first === 'watermelon' ? structuredClone(WANTS[first]) : {})
  const [tray, setTray] = useState<(FoodKind | null)[]>(TRAY[first])
  const [heldKind, setHeldKind] = useState<FoodKind | null>(null)
  const [carry, setCarry] = useState<Partial<Record<ElephantId, FoodKind | null>>>({})
  const [flyers, setFlyers] = useState<Flyer[]>([])
  const [ground, setGround] = useState<{ x: number; y: number } | null>(null)
  const [poke, setPoke] = useState<Record<string, number>>({})
  const root = useRef<HTMLDivElement>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const bodyEls = useRef<Partial<Record<ElephantId, SVGGElement | null>>>({})
  const bellyEls = useRef<Partial<Record<ElephantId, SVGEllipseElement | null>>>({})
  const earEls = useRef<Partial<Record<ElephantId, SVGGElement | null>>>({})
  const trunkEls = useRef<Partial<Record<ElephantId, { ink: (SVGLineElement | null)[]; fill: (SVGLineElement | null)[]; tip: SVGCircleElement | null }>>>({})
  const carryEls = useRef<Partial<Record<ElephantId, SVGGElement | null>>>({})
  const bubbleEls = useRef<Partial<Record<ElephantId, HTMLDivElement | null>>>({})
  const tapEls = useRef<Partial<Record<ElephantId, HTMLButtonElement | null>>>({})
  const heldEl = useRef<SVGGElement>(null)
  const milkEl = useRef<SVGRectElement>(null)
  const nextId = useRef(1)

  const g = useRef({
    stage: first,
    wants: (first === 'favorites' || first === 'watermelon' ? structuredClone(WANTS[first]) : {}) as Partial<Record<ElephantId, Want | null>>,
    eles: Y.elephants.map((spot): Ele => {
      const len = BODY.trunkLen * spot.s
      const base = bodyPt(spot, Y.ground, BODY.trunk)
      return { spot, bx: spot.x, trunk: makeTrunk(base, len, FEEL.segments, spot.dir), len, mode: first === 'shower' ? 'spray' : 'idle', t: 0, outcome: 'eat', passTo: null, full: first === 'shower' ? 4 : first === 'bananas' ? 0 : 2, flap: 0, phase: Math.random() * 6 }
    }),
    held: null as HeldFood | null,
    fed: 0,
    flying: 0,
    idle: 0,
    sneakCool: 0,
    sneakSaid: false,
    milk: 0.85,
    time: 0,
    showerT: 0,
    done: false,
    tossSaid: 0,
    /** What each trunk is holding (mirrors `carry`, readable inside the frame loop). */
    carry: {} as Partial<Record<ElephantId, FoodKind | null>>,
  })
  const ele = (id: ElephantId) => g.current.eles.find((e) => e.spot.id === id)!

  const setStage = (s: YardStage) => {
    const G = g.current
    G.stage = s
    setStageState(s)
    setTray(TRAY[s])
    const w = s === 'favorites' || s === 'watermelon' ? structuredClone(WANTS[s]) : {}
    G.wants = w
    setWants(structuredClone(w))
    if (s === 'shower') {
      G.showerT = 0
      G.eles.forEach((e) => (e.mode = 'spray'))
      csfx.trumpet()
      csfx.trumpet(true)
      bigSpray()
    }
    onStage(s)
  }
  useEffect(() => onStage(first), [])
  useEffect(() => {
    if (first === 'shower' && active) bigSpray()
  }, [active])

  const toStage = (e: { clientX: number; clientY: number }): Pt => {
    const r = root.current!.getBoundingClientRect()
    const k = r.width / S.w
    return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }
  }
  const baseOf = (e: Ele) => bodyPt(e.spot, Y.ground, BODY.trunk, e.bx)
  const mouthOf = (e: Ele) => bodyPt(e.spot, Y.ground, BODY.mouth, e.bx)

  const fly = (f: Omit<Flyer, 'id'>, onLand?: () => void) => {
    const id = nextId.current++
    g.current.flying++
    setFlyers((l) => [...l, { ...f, id }])
    setTimeout(() => {
      g.current.flying--
      setFlyers((l) => l.filter((x) => x.id !== id))
      onLand?.()
    }, f.dur * 1000)
  }

  // ---- Picking food off the tray ----
  const pickUp = (slot: number) => (e: ReactPointerEvent) => {
    const kind = tray[slot]
    if (!active || !kind || g.current.held) return
    e.stopPropagation()
    root.current?.setPointerCapture(e.pointerId)
    const p = toStage(e)
    const G = g.current
    G.held = { kind, slot, x: p.x, y: p.y, sx: p.x, sy: p.y, moved: false, auto: null }
    G.idle = 0
    // Holding food distracts a sneaking baby.
    const baby = ele('baby')
    if (baby.mode === 'sneak') baby.mode = 'idle'
    setHeldKind(kind)
    sounds.pickup()
  }
  const onMove = (e: ReactPointerEvent) => {
    const h = g.current.held
    if (!h || h.auto) return
    const p = toStage(e)
    h.x = p.x
    h.y = p.y
    if (Math.hypot(p.x - h.sx, p.y - h.sy) > 16) h.moved = true
  }
  const onUp = () => {
    const G = g.current
    const h = G.held
    if (!h || h.auto) return
    if (!h.moved) {
      // A tap: the food hops to the elephant who wants it most.
      h.auto = chooseFor(h.kind)
      return
    }
    // Let go away from every trunk: it flies back to the tray.
    G.held = null
    setHeldKind(null)
    fly({ kind: h.kind, from: { x: h.x, y: h.y }, to: Y.tray[h.slot], arc: 60, dur: 0.35 })
    sounds.place()
  }

  const busy = (e: Ele) => !(e.mode === 'idle' || e.mode === 'sneak')
  /** Who should get a tapped food: whoever wants it, else the hungriest free elephant. */
  const chooseFor = (kind: FoodKind): ElephantId => {
    const G = g.current
    const free = G.eles.filter((e) => !busy(e))
    const pool = free.length ? free : G.eles
    const wanting = pool.find((e) => G.wants[e.spot.id]?.kind === kind && !(kind === 'watermelon' && e.spot.id === 'baby'))
    if (wanting) return wanting.spot.id
    if (kind === 'watermelon') return (pool.find((e) => e.spot.id !== 'baby') ?? G.eles[0]).spot.id
    return [...pool].sort((a, b) => a.full - b.full)[0].spot.id
  }

  /** What an elephant does with a food it just took. */
  const decide = (e: Ele, kind: FoodKind): { outcome: Outcome; passTo: ElephantId | null } => {
    const G = g.current
    const id = e.spot.id
    if (G.stage === 'bananas') return { outcome: 'eat', passTo: null }
    if (kind === 'watermelon') return { outcome: id === 'baby' ? 'tooBig' : 'stomp', passTo: null }
    const want = G.wants[id]
    if (want?.kind === kind) return { outcome: 'eat', passTo: null }
    const other = G.eles.find((o) => o !== e && G.wants[o.spot.id]?.kind === kind && !busy(o))
    if (other) return { outcome: 'pass', passTo: other.spot.id }
    if (!want) return { outcome: 'eat', passTo: null }
    return { outcome: 'toss', passTo: null }
  }

  const take = (e: Ele, kind: FoodKind, outcome?: Outcome) => {
    const d = outcome ? { outcome, passTo: null } : decide(e, kind)
    e.mode = 'carry'
    e.t = 0
    e.outcome = d.outcome
    e.passTo = d.passTo
    g.current.carry[e.spot.id] = kind
    setCarry((c) => ({ ...c, [e.spot.id]: kind }))
    csfx.sniff()
  }
  const dropCarry = (e: Ele) => {
    g.current.carry[e.spot.id] = null
    setCarry((c) => ({ ...c, [e.spot.id]: null }))
  }

  const eaten = (e: Ele, kind: FoodKind) => {
    const G = g.current
    const id = e.spot.id
    e.full++
    e.flap = 1
    G.idle = 0
    if (kind === 'sugarcane' || kind === 'corn' || kind === 'cucumber') csfx.crunch()
    else csfx.munch()
    if (G.stage === 'bananas') {
      G.fed++
      sounds.note(Math.min(10, G.fed + 1))
      if (G.fed % 3 === 0) void say(L.yard.yum[(G.fed / 3 - 1) % L.yard.yum.length])
      if (G.fed >= FEEL.bananas) {
        sounds.correct()
        burst()
        void sparkle.current?.play('cheer')
        setTimeout(() => setStage('favorites'), 900)
      }
      return
    }
    const want = G.wants[id]
    if (want && want.kind === kind) {
      const total = WANTS[G.stage as 'favorites' | 'watermelon'][id].left
      want.left--
      if (total > 1) void say(L.yard.count[total - want.left - 1])
      sounds.note(Math.min(10, total - want.left + 2))
      if (want.left <= 0) {
        G.wants[id] = null
        csfx.trumpet(id === 'baby')
        burst()
      }
      setWants(structuredClone(G.wants))
      checkStage()
    }
  }

  const checkStage = () => {
    const G = g.current
    if (G.stage !== 'favorites' && G.stage !== 'watermelon') return
    if (Object.values(G.wants).some((w) => w)) return
    sounds.correct()
    void sparkle.current?.play('cheer')
    setTimeout(() => setStage(G.stage === 'favorites' ? 'watermelon' : 'shower'), 1100)
  }

  const stomped = (e: Ele, at: Pt) => {
    const G = g.current
    csfx.stomp()
    csfx.splat()
    setGround(null)
    burst()
    // The watermelon cracks into slices that land on the tray for the baby.
    for (let i = 0; i < 3; i++) fly({ kind: 'slice', from: at, to: Y.tray[5], arc: 180 + i * 50, dur: 0.6 + i * 0.12, spin: 360 })
    setTimeout(() => setTray((t) => t.map((k, i) => (i === 5 ? 'slice' : k))), 650)
    for (const id of Object.keys(G.wants) as ElephantId[]) if (G.wants[id]?.kind === 'watermelon') G.wants[id] = null
    setWants(structuredClone(G.wants))
    e.full++
    void say(L.yard.slices)
    checkStage()
  }

  // Water sprays out of every trunk tip, with a rainbow.
  const spray = (e: Ele) => {
    const tip = tipOf(e.trunk)
    csfx.spray()
    for (let i = 0; i < 7; i++) {
      const to = { x: tip.x + e.spot.dir * (60 + i * 50) + (Math.random() - 0.5) * 80, y: Y.platform + 40 + Math.random() * 120 }
      fly({ kind: 'drop', from: tip, to, arc: 220 + Math.random() * 120, dur: 0.7 + Math.random() * 0.4 })
    }
  }
  const bigSpray = () => setTimeout(() => g.current.eles.forEach(spray), 500)

  const tapElephant = (id: ElephantId) => {
    const e = ele(id)
    e.flap = 1
    setPoke((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }))
    if (g.current.stage === 'shower') return spray(e)
    csfx.trumpet(id === 'baby')
  }

  useGameLoop((dt) => {
    if (dt <= 0) return
    const G = g.current
    G.time += dt
    const h = G.held

    // A tapped food glides toward its elephant's trunk tip.
    if (h?.auto) {
      const tip = tipOf(ele(h.auto).trunk)
      const k = 1 - Math.exp(-7 * dt)
      h.x += (tip.x - h.x) * k
      h.y += (tip.y - h.y) * k
    }
    if (!h && G.flying === 0) G.idle += dt
    G.sneakCool -= dt

    for (const e of G.eles) {
      const id = e.spot.id
      e.t += dt
      // The baby wanders along the fence once the watermelon comes out.
      if (id === 'baby' && (G.stage === 'watermelon' || G.stage === 'shower') && e.mode !== 'slurp' && e.mode !== 'sneak') {
        e.bx = e.spot.x + Math.sin(G.time * FEEL.babySpeed * Math.PI * 2) * FEEL.babyWander
      }
      const base = baseOf(e)
      const mouth = mouthOf(e)
      const len = e.len
      let target: Pt = {
        x: base.x + e.spot.dir * len * 0.22 + Math.sin(G.time * 1.3 + e.phase) * len * 0.1,
        y: base.y + len * 0.86,
      }
      let chase = FEEL.tipChase
      const tip = tipOf(e.trunk)

      if (e.mode === 'idle' || e.mode === 'sneak') {
        if (h && Math.hypot(h.x - base.x, h.y - base.y) < len * FEEL.notice && (!h.auto || h.auto === id)) {
          target = { x: h.x, y: h.y }
          // Grab it when the tip touches it.
          if (Math.hypot(h.x - tip.x, h.y - tip.y) < FEEL.grab * Math.max(0.75, e.spot.s)) {
            G.held = null
            setHeldKind(null)
            take(e, h.kind)
          }
        } else if (e.mode === 'sneak') {
          const top = { x: Y.milk.x, y: Y.milk.y - 120 }
          target = top
          if (Math.hypot(tip.x - top.x, tip.y - top.y) < 30) {
            e.mode = 'slurp'
            e.t = 0
            csfx.slurp()
            if (!G.sneakSaid) {
              G.sneakSaid = true
              void say(L.yard.sneaky)
            }
          }
        } else if (id === 'baby' && G.stage === 'watermelon' && !h && G.idle > FEEL.sneakAfter && G.sneakCool <= 0 && G.milk > 0.3) {
          e.mode = 'sneak'
          e.t = 0
        }
      } else if (e.mode === 'carry') {
        if (e.outcome === 'stomp') {
          // Put it down on the ground in front, then stomp.
          target = { x: base.x + e.spot.dir * len * 0.45, y: Y.ground - 30 }
          if (e.t > 0.8) {
            setGround({ ...target })
            dropCarry(e)
            e.mode = 'stomp'
            e.t = 0
          }
        } else if (e.outcome === 'pass') {
          const o = ele(e.passTo!)
          target = { x: (base.x + baseOf(o).x) / 2, y: base.y + len * 0.4 }
          if (e.t > 0.5) {
            const kind = G.carry[id] ?? 'banana'
            dropCarry(e)
            e.mode = 'idle'
            o.mode = 'pass'
            o.t = 0
            fly({ kind, from: { ...tip }, to: tipOf(o.trunk), arc: 120, dur: 0.5, spin: 200 }, () => take(o, kind, 'eat'))
          }
        } else {
          target = mouth
          chase = FEEL.tipChase * 1.6
          if (e.outcome === 'tooBig') {
            target = { x: mouth.x + Math.sin(e.t * 30) * 12, y: mouth.y + 40 }
            if (e.t > 0.9) {
              const kind = G.carry[id] ?? 'watermelon'
              dropCarry(e)
              e.mode = 'idle'
              fly({ kind, from: { ...tip }, to: Y.tray[5], arc: 80, dur: 0.5 })
              csfx.splat()
              void say(L.yard.tooBig)
            }
          } else if (e.t > FEEL.curl) {
            e.mode = e.outcome === 'eat' ? 'munch' : 'sniff'
            e.t = 0
            if (e.outcome === 'eat') {
              const kind = G.carry[id] ?? 'banana'
              dropCarry(e)
              eaten(e, kind)
            } else csfx.sniff()
          }
        }
      } else if (e.mode === 'munch') {
        target = mouth
        if (e.t > FEEL.munch) e.mode = 'idle'
      } else if (e.mode === 'sniff') {
        target = { x: mouth.x + e.spot.dir * 20, y: mouth.y - 10 }
        if (e.t > 0.5) {
          e.mode = 'toss'
          e.t = 0
        }
      } else if (e.mode === 'toss') {
        // Swing it up and over its back.
        target = { x: base.x - e.spot.dir * len * 0.3, y: base.y - len * 0.85 }
        chase = FEEL.tipChase * 2
        if (e.t > 0.45) {
          const kind = G.carry[id] ?? 'banana'
          dropCarry(e)
          e.mode = 'idle'
          csfx.toss()
          fly({ kind, from: { ...tip }, to: { x: e.bx - e.spot.dir * 260 * e.spot.s, y: Y.ground - 10 }, arc: 160, dur: 0.7, spin: 540 })
          if (G.time - G.tossSaid > 10) {
            G.tossSaid = G.time
            void say(L.yard.toss)
          }
        }
      } else if (e.mode === 'pass') {
        // Waiting to catch a food passed by a friend.
        target = { x: base.x + e.spot.dir * len * 0.4, y: base.y + len * 0.5 }
        if (e.t > 2) e.mode = 'idle'
      } else if (e.mode === 'stomp') {
        target = { x: base.x + e.spot.dir * len * 0.3, y: base.y - len * 0.5 }
        if (e.t > 0.55 && e.t - dt <= 0.55) stomped(e, { x: base.x + e.spot.dir * len * 0.45, y: Y.ground - 30 })
        if (e.t > 1.1) e.mode = 'idle'
      } else if (e.mode === 'slurp') {
        target = { x: Y.milk.x, y: Y.milk.y - 120 }
        G.milk = Math.max(0.3, G.milk - dt * 0.1)
        if (e.t > 1.2) {
          e.mode = 'idle'
          G.sneakCool = FEEL.sneakRest
          G.idle = 0
        }
      } else if (e.mode === 'spray') {
        target = { x: base.x + e.spot.dir * len * 0.35, y: base.y - len * 0.9 }
      }

      stepTrunk(e.trunk, base, target, chase, dt)

      // ---- Draw ----
      e.flap = Math.max(0, e.flap - dt * 1.5)
      const munching = e.mode === 'munch' ? Math.sin(e.t * 22) * 0.03 : 0
      const stompTilt = e.mode === 'stomp' ? (e.t < 0.55 ? -10 * (e.t / 0.55) : -10 * Math.max(0, 1 - (e.t - 0.55) * 4)) : 0
      const bob = Math.sin(G.time * 2 + e.phase) * 0.012
      bodyEls.current[id]?.setAttribute(
        'transform',
        `translate(${e.bx.toFixed(1)} ${Y.ground}) rotate(${(stompTilt * e.spot.dir).toFixed(1)} ${(-e.spot.dir * 120 * e.spot.s).toFixed(1)} 0) scale(${(e.spot.dir * e.spot.s * (1 - munching)).toFixed(3)} ${(e.spot.s * (1 + bob + munching)).toFixed(3)})`,
      )
      bellyEls.current[id]?.setAttribute('transform', `scale(${Math.min(1.35, 1 + e.full * 0.05).toFixed(3)})`)
      earEls.current[id]?.setAttribute('transform', `scale(${(1 + Math.sin(e.flap * 18) * 0.25 * e.flap).toFixed(3)} 1)`)
      const els = trunkEls.current[id]
      if (els) {
        const n = e.trunk.pts.length - 1
        for (let i = 0; i < n; i++) {
          const a = e.trunk.pts[i]
          const b = e.trunk.pts[i + 1]
          const w = (46 - (28 * i) / n) * e.spot.s
          for (const [l, extra] of [
            [els.ink[i], 10],
            [els.fill[i], 0],
          ] as const) {
            if (!l) continue
            l.setAttribute('x1', a.x.toFixed(1))
            l.setAttribute('y1', a.y.toFixed(1))
            l.setAttribute('x2', b.x.toFixed(1))
            l.setAttribute('y2', b.y.toFixed(1))
            l.setAttribute('stroke-width', (w + extra).toFixed(1))
          }
        }
        const t = tipOf(e.trunk)
        els.tip?.setAttribute('cx', t.x.toFixed(1))
        els.tip?.setAttribute('cy', t.y.toFixed(1))
        carryEls.current[id]?.setAttribute('transform', `translate(${t.x.toFixed(1)} ${(t.y + 10).toFixed(1)}) scale(0.8)`)
      }
      // The bubble floats just above the head (a fixed gap, so the baby's doesn't sit on its own head).
      const head = bodyPt(e.spot, Y.ground, BODY.head, e.bx)
      const bel = bubbleEls.current[id]
      if (bel) bel.style.transform = `translate(${(head.x - e.spot.dir * 30 - 85).toFixed(1)}px, ${(head.y - BODY.head.r * e.spot.s - 180).toFixed(1)}px)`
      const body = bodyPt(e.spot, Y.ground, BODY.body, e.bx)
      const tap = tapEls.current[id]
      if (tap) tap.style.transform = `translate(${(body.x - 150 * e.spot.s).toFixed(1)}px, ${(body.y - 100 * e.spot.s).toFixed(1)}px)`
    }

    // The food in her hand.
    if (heldEl.current) {
      const hh = G.held
      if (hh) heldEl.current.setAttribute('transform', `translate(${hh.x.toFixed(1)} ${hh.y.toFixed(1)}) scale(1.1)`)
      heldEl.current.setAttribute('opacity', hh ? '1' : '0')
    }
    milkEl.current?.setAttribute('height', (G.milk * 100).toFixed(1))
    milkEl.current?.setAttribute('y', (-12 - G.milk * 100).toFixed(1))

    // The shower plays, then the stamp.
    if (G.stage === 'shower' && !G.done) {
      const before = G.showerT
      G.showerT += dt
      // A fresh spray every 1.6 s, one elephant after another.
      if (Math.floor(G.showerT / 1.6) > Math.floor(before / 1.6)) spray(G.eles[Math.floor(G.showerT / 1.6) % G.eles.length])
      if (G.showerT > FEEL.shower) {
        G.done = true
        onDone()
      }
    }
  }, active)

  const bump = (k: string) => setPoke((p) => ({ ...p, [k]: (p[k] ?? 0) + 1 }))
  const n = FEEL.segments

  return (
    <div ref={root} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} style={{ position: 'absolute', left: 0, top: 0, width: S.w, height: S.h, touchAction: 'none' }}>
      <svg viewBox={`0 0 ${S.w} ${S.h}`} width={S.w} height={S.h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {/* Greybox scene: palms, red dirt, the shed, the rail fence, the stone platform. */}
        <rect x={-2000} y={-600} width={S.w + 4000} height={600 + Y.ground} fill="#9ED7A0" />
        {[0.08, 0.3, 0.5, 0.72, 0.92].map((f, i) => (
          <g key={i} transform={`translate(${S.w * f} ${Y.ground - 180})`}>
            <rect x="-10" y="-200" width="20" height="380" fill="#A07A55" />
            <circle cy="-210" r="90" fill="#6DBB6B" />
          </g>
        ))}
        <g transform={`translate(${Y.shed.x} ${Y.shed.y})`}>
          <rect x={-Y.shed.w / 2} y={-170} width={Y.shed.w} height={170} fill="#C9A27A" stroke={INK} strokeWidth="5" />
          <path d={`M${-Y.shed.w / 2 - 30} -160L0 -250L${Y.shed.w / 2 + 30} -160Z`} fill="#8A6A4A" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        </g>
        <rect x={-2000} y={Y.ground - 40} width={S.w + 4000} height={Y.platform - Y.ground + 40} fill="#D9845A" />
        {/* The palm with the gecko and a coconut. */}
        <g transform={`translate(${Y.palm.x} ${Y.palm.y})`}>
          <rect x="-16" y={Y.coconut.y - Y.palm.y} width="32" height={Y.palm.y - Y.coconut.y} fill="#A07A55" stroke={INK} strokeWidth="5" />
          <path d={`M0 ${Y.coconut.y - Y.palm.y - 20}l-130 40M0 ${Y.coconut.y - Y.palm.y - 20}l130 40M0 ${Y.coconut.y - Y.palm.y - 20}l-90 -60M0 ${Y.coconut.y - Y.palm.y - 20}l90 -60`} stroke="#4E9E4C" strokeWidth="30" strokeLinecap="round" />
        </g>
        <motion.g key={`gecko-${poke.gecko ?? 0}`} initial={false} animate={{ y: poke.gecko ? [0, -40, 0] : 0 }} transition={{ duration: 0.5 }}>
          <g transform={`translate(${Y.gecko.x} ${Y.gecko.y}) rotate(-90)`}>
            <ellipse rx="34" ry="12" fill="#7FB2FF" stroke={INK} strokeWidth="4" />
            <circle cx="34" r="12" fill="#7FB2FF" stroke={INK} strokeWidth="4" />
            <path d="M-34 0q-24 10 -30 -6" fill="none" stroke={INK} strokeWidth="5" />
          </g>
        </motion.g>
        <motion.g key={`coco-${poke.coconut ?? 0}`} initial={false} animate={poke.coconut ? { y: [0, Y.ground - Y.coconut.y - 30, Y.ground - Y.coconut.y - 90, Y.ground - Y.coconut.y - 30, 0], opacity: [1, 1, 1, 1, 0, 1] } : {}} transition={{ duration: 2.2, times: [0, 0.3, 0.45, 0.6, 0.9, 1] }}>
          <circle cx={Y.coconut.x - 20} cy={Y.coconut.y + 10} r="24" fill="#7A5A3A" stroke={INK} strokeWidth="4" />
        </motion.g>
        <g transform={`translate(${Y.hay.x} ${Y.hay.y})`}>
          <path d="M-80 0Q-70 -70 0 -80Q70 -70 80 0Z" fill="#E8C766" stroke={INK} strokeWidth="5" />
        </g>

        {/* Rainbow over the shower. */}
        {stage === 'shower' && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 1, duration: 1.2 }}>
            {['#FF6B6B', '#FFB347', '#FFE27A', '#8FE3C8', '#7FB2FF', '#B48CF2'].map((c, i) => (
              <path key={c} d={`M${S.w * 0.08 + i * 22} ${Y.ground}A${S.w * 0.42 - i * 22} ${Y.ground - 60 - i * 22} 0 0 1 ${S.w * 0.92 - i * 22} ${Y.ground}`} fill="none" stroke={c} strokeWidth="22" />
            ))}
          </motion.g>
        )}

        {/* Elephants (behind the fence). */}
        {g.current.eles.map((e) => {
          const id = e.spot.id
          return (
            <g key={id} ref={(el) => void (bodyEls.current[id] = el)} transform={`translate(${e.spot.x} ${Y.ground}) scale(${e.spot.dir * e.spot.s} ${e.spot.s})`}>
              <path d={`M${BODY.tail.x} ${BODY.tail.y}q-30 40 -20 80`} fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
              {[-110, -50, 50, 110].map((x) => (
                <rect key={x} x={x - 26} y={-BODY.legH - 20} width="52" height={BODY.legH + 20} rx="14" fill={COLORS.elephantDark} stroke={INK} strokeWidth="5" />
              ))}
              <ellipse cx={BODY.body.x} cy={BODY.body.y} rx={BODY.body.rx} ry={BODY.body.ry} fill={COLORS.elephant} stroke={INK} strokeWidth="5" />
              <g transform={`translate(${BODY.body.x} ${BODY.body.y + 40})`}>
                <ellipse ref={(el) => void (bellyEls.current[id] = el)} rx="90" ry="45" fill={COLORS.belly} />
              </g>
              <circle cx={BODY.head.x} cy={BODY.head.y} r={BODY.head.r} fill={COLORS.elephant} stroke={INK} strokeWidth="5" />
              <g transform={`translate(${BODY.ear.x} ${BODY.ear.y})`}>
                <g ref={(el) => void (earEls.current[id] = el)}>
                  <ellipse rx={BODY.ear.rx} ry={BODY.ear.ry} fill="#C9B6D6" stroke={INK} strokeWidth="5" />
                </g>
              </g>
              <circle cx={BODY.eye.x} cy={BODY.eye.y} r="9" fill={INK} />
              <circle cx={BODY.eye.x + 3} cy={BODY.eye.y - 3} r="3" fill="#fff" />
              <text x={BODY.body.x} y={BODY.body.y - 20} textAnchor="middle" fontSize="40" fontWeight="700" fill={INK} opacity="0.55" fontFamily="Fredoka, sans-serif" transform={e.spot.dir < 0 ? `scale(-1 1)` : undefined}>
                {LABEL[id]}
              </text>
            </g>
          )
        })}

        {/* The rail fence. */}
        {Y.posts.map((x) => (
          <rect key={x} x={x - 12} y={Y.rail - 20} width="24" height={Y.ground - Y.rail + 70} fill="#55505E" stroke={INK} strokeWidth="4" />
        ))}
        <rect x={-2000} y={Y.rail - 12} width={S.w + 4000} height="16" fill="#6C6676" stroke={INK} strokeWidth="4" />
        <rect x={-2000} y={Y.rail + 40} width={S.w + 4000} height="14" fill="#6C6676" stroke={INK} strokeWidth="4" />

        {/* Her chocolate milk on a post. */}
        <g transform={`translate(${Y.milk.x} ${Y.milk.y - 8})`}>
          <rect x="-40" y="-120" width="80" height="120" rx="10" fill="rgba(220,240,255,0.35)" stroke={INK} strokeWidth="5" />
          <rect ref={milkEl} x="-34" width="68" y="-97" height="85" fill={COLORS.cocoa} />
          {cream && <path d="M-40 -118q6 -26 22 -22q10 -26 30 -12q20 -12 22 12q16 2 6 22Z" fill="#FFFDF8" stroke={INK} strokeWidth="4" />}
          <rect x="6" y="-170" width="12" height="150" rx="6" fill={COLORS.straw[straw]} stroke={INK} strokeWidth="3" transform="rotate(10)" />
        </g>

        {/* Trunks (over the fence) and whatever they hold. */}
        {g.current.eles.map((e) => {
          const id = e.spot.id
          const slot = (trunkEls.current[id] ??= { ink: [], fill: [], tip: null })
          return (
            <g key={id}>
              {Array.from({ length: n }, (_, i) => (
                <line key={`i${i}`} ref={(el) => void (slot.ink[i] = el)} stroke={INK} strokeLinecap="round" />
              ))}
              {Array.from({ length: n }, (_, i) => (
                <line key={`f${i}`} ref={(el) => void (slot.fill[i] = el)} stroke={COLORS.elephant} strokeLinecap="round" />
              ))}
              <circle ref={(el) => void (slot.tip = el)} r={10 * e.spot.s} fill={COLORS.elephantDark} />
              <g ref={(el) => void (carryEls.current[id] = el)}>{carry[id] && <Food kind={carry[id]!} />}</g>
            </g>
          )
        })}
        {ground && (
          <g transform={`translate(${ground.x} ${ground.y})`}>
            <Food kind="watermelon" />
          </g>
        )}

        {/* The stone platform and the food tray. */}
        <rect x={-2000} y={Y.platform} width={S.w + 4000} height={2000} fill="#BDB6A8" stroke={INK} strokeWidth="5" />
        {stage !== 'shower' && (
          <g>
            {(S.tall ? [Y.tray.slice(0, 3), Y.tray.slice(3)] : [Y.tray]).map((row, r) => (
              <rect key={r} x={row[0].x - 100} y={row[0].y - 85} width={row[row.length - 1].x - row[0].x + 200} height={170} rx="30" fill="#C98A52" stroke={INK} strokeWidth="5" />
            ))}
            {Y.tray.map((p, i) => {
              const kind = tray[i]
              const wanted = kind && Object.values(wants).some((w) => w?.kind === kind)
              return (
                <g key={i} aria-label={kind ?? undefined} transform={`translate(${p.x} ${p.y})`} onPointerDown={pickUp(i)} style={{ cursor: kind ? 'grab' : undefined }}>
                  <rect x="-80" y="-80" width="160" height="160" rx="24" fill={wanted ? '#FFE9A8' : '#E2B07E'} stroke={INK} strokeWidth="3" />
                  {kind && (
                    <motion.g key={kind} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Food kind={kind} />
                    </motion.g>
                  )}
                </g>
              )
            })}
          </g>
        )}

        {/* Food flying (tossed, passed, slices) and water drops. */}
        {flyers.map((f) => (
          <motion.g
            key={f.id}
            initial={{ x: f.from.x, y: f.from.y, rotate: 0 }}
            animate={{ x: [f.from.x, (f.from.x + f.to.x) / 2, f.to.x], y: [f.from.y, Math.min(f.from.y, f.to.y) - f.arc, f.to.y], rotate: f.spin ?? 0, opacity: f.kind === 'drop' ? [1, 1, 0] : 1 }}
            transition={{ duration: f.dur, ease: 'linear' }}
          >
            {f.kind === 'drop' ? <circle r="12" fill="#7FCBFF" stroke={INK} strokeWidth="3" /> : f.kind === 'hay' ? <rect x="-14" y="-4" width="28" height="8" fill="#E8C766" /> : <Food kind={f.kind} />}
          </motion.g>
        ))}

        <g ref={heldEl} opacity="0" pointerEvents="none">
          {heldKind && <Food kind={heldKind} />}
        </g>
      </svg>

      {/* What each elephant wants. */}
      {g.current.eles.map((e) => {
        const id = e.spot.id
        const w = wants[id]
        return (
          <div key={id} ref={(el) => void (bubbleEls.current[id] = el)} style={{ position: 'absolute', left: 0, top: 0, width: 170, height: 170, pointerEvents: 'none' }}>
            <AnimatePresence>
              {w && (
                <motion.div key={`${w.kind}`} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', border: `5px solid ${INK}`, display: 'grid', placeItems: 'center', boxShadow: '0 6px 0 rgba(43,35,48,.2)' }}>
                  <svg viewBox="-80 -80 160 160" width="130" height="130">
                    <g transform="translate(0 -10) scale(0.85)">
                      <Food kind={w.kind} />
                    </g>
                    {Array.from({ length: w.left }, (_, i) => (
                      <circle key={i} cx={(i - (w.left - 1) / 2) * 30} cy="58" r="11" fill="var(--hotpink)" stroke={INK} strokeWidth="3" />
                    ))}
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Pokeables: the elephants themselves, the gecko, the coconut, the hay, the myna bird. */}
      {g.current.eles.map((e) => (
        <button key={e.spot.id} ref={(el) => void (tapEls.current[e.spot.id] = el)} aria-label={`${LABEL[e.spot.id]} elephant`} onPointerDown={(ev) => ev.stopPropagation()} onClick={() => tapElephant(e.spot.id)} style={{ position: 'absolute', left: 0, top: 0, width: 300 * e.spot.s, height: 200 * e.spot.s, borderRadius: '50%', background: 'none', border: 'none', padding: 0 }} />
      ))}
      <PokeButton
        label="gecko"
        x={Y.gecko.x}
        y={Y.gecko.y}
        r={60}
        onTap={() => {
          bump('gecko')
          csfx.gecko()
        }}
      />
      <PokeButton
        label="coconut"
        x={Y.coconut.x - 20}
        y={Y.coconut.y + 10}
        r={55}
        onTap={() => {
          bump('coconut')
          setTimeout(() => csfx.coconut(), 600)
        }}
      />
      <PokeButton
        label="hay"
        x={Y.hay.x}
        y={Y.hay.y - 40}
        r={60}
        onTap={() => {
          csfx.toss()
          for (let i = 0; i < 6; i++) fly({ kind: 'hay', from: { x: Y.hay.x, y: Y.hay.y - 50 }, to: { x: Y.hay.x + (Math.random() - 0.5) * 260, y: Y.hay.y - 20 }, arc: 120 + Math.random() * 80, dur: 0.6, spin: 300 })
        }}
      />
      <motion.div key={`bird-${poke.bird ?? 0}`} initial={false} animate={poke.bird ? { x: [0, -120, -60, 0], y: [0, -160, -220, 0] } : {}} transition={{ duration: 1.4 }} style={{ position: 'absolute', left: Y.bird.x - 40, top: Y.bird.y - 70, width: 80, height: 60, pointerEvents: 'none' }}>
        <svg viewBox="-40 -30 80 60" width="80" height="60">
          <ellipse rx="28" ry="20" fill="#3B3346" stroke={INK} strokeWidth="4" />
          <circle cx="22" cy="-12" r="14" fill="#3B3346" stroke={INK} strokeWidth="4" />
          <path d="M34 -12l14 4l-14 4Z" fill="#FFC83D" />
          <circle cx="25" cy="-16" r="4" fill="#FFC83D" />
        </svg>
      </motion.div>
      <PokeButton
        label="myna bird"
        x={Y.bird.x}
        y={Y.bird.y - 40}
        r={50}
        onTap={() => {
          bump('bird')
          csfx.myna()
        }}
      />
      <button aria-label="Sparkle" onPointerDown={(ev) => ev.stopPropagation()} onClick={() => void sparkle.current?.play('dance')} style={{ position: 'absolute', left: Y.sparkle.x - Y.sparkle.h * 0.5, top: Y.sparkle.y - Y.sparkle.h, width: Y.sparkle.h, height: Y.sparkle.h, padding: 0, background: 'none', border: 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <SparklePuppet ref={sparkle} height={`${Y.sparkle.h}px`} flip lookToward={-0.5} />
      </button>
    </div>
  )
}

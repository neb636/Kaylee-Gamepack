// Upstairs at Baan Chang: the cafe counter (the side verb, about a minute). Grab and tilt to pour: the same verb for the
// coffee pot, the milk jug and the chocolate bottle. A pot tips by itself as it comes over the glass, and tips further
// the closer it gets, so she pours by holding it there. Overfill and it fountains over the rim (silly, never "oops").
// First Daddy's iced coffee (ice, coffee, milk, a straw, then carry it to him), then her own chocolate milk (milk,
// chocolate, stir, then pick a straw and whipped cream). Then the stairs glow and lead down to the elephants.
// Moving things are written to the DOM from one game loop; React only re-renders when a step changes.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { burst, say, sounds, SparklePuppet, useGameLoop, type PuppetHandle } from '../../../../../sdk'
import { L } from '../../lines'
import { FEEL } from './feel'
import type { Pt, Stage, ToolId } from './layout'
import { csfx } from './sfx'
import { Beanbag, COLORS, Cube, Daddy, IceBucket, INK, Jug, Pot, Spoon, StrawCup, Syrup, Table, type StrawColor } from './shapes'

export type CafeStep = 'ice' | 'coffee' | 'milk' | 'straw' | 'deliver' | 'milk2' | 'syrup' | 'stir' | 'pick' | 'cream' | 'stairs'
const ORDER: CafeStep[] = ['ice', 'coffee', 'milk', 'straw', 'deliver', 'milk2', 'syrup', 'stir', 'pick', 'cream', 'stairs']
/** The glass on the counter: Daddy's (1) until it's delivered, then hers (2). */
const glassOf = (s: CafeStep) => (ORDER.indexOf(s) <= ORDER.indexOf('deliver') ? 1 : 2)

type Pour = 'pot' | 'jug' | 'syrup'
/** How high each tool's pivot (where she holds it and it turns) sits above its feet. */
const PIVOT: Record<ToolId, number> = { pot: 75, jug: 75, syrup: 80, ice: 50, spoon: 30, straws: 40 }
/** Each pour tool's spout, from its pivot, before mirroring and turning. */
const SPOUT: Record<Pour, Pt> = { pot: { x: 80, y: -67 }, jug: { x: 60, y: -75 }, syrup: { x: 0, y: -100 } }
const STREAM: Record<Pour, { color: string; width: number }> = { pot: { color: COLORS.coffee, width: 14 }, jug: { color: COLORS.milk, width: 14 }, syrup: { color: COLORS.choc, width: 8 } }

interface Contents {
  cubes: number
  coffee: number
  milk: number
  choc: number
  stir: number
  /** Milk clouds swirling in the coffee (fade as they mix). */
  swirl: number
  straw: boolean
}
const empty = (): Contents => ({ cubes: 0, coffee: 0, milk: 0, choc: 0, stir: 0, swirl: 0, straw: false })
/** What's already in the glass when play starts at a later step (a section link, or turning the iPad). */
const seed = (s: CafeStep): Contents => {
  const c = empty()
  const i = ORDER.indexOf(s)
  if (glassOf(s) === 1) {
    if (i > 0) c.cubes = FEEL.ice
    if (i > 1) c.coffee = 0.4
    if (i > 2) c.milk = 0.35
    if (i > 3) c.straw = true
  } else {
    const j = i - ORDER.indexOf('milk2')
    if (j > 0) c.milk = 0.65
    if (j > 1) c.choc = 0.15
    if (j > 2) c.stir = FEEL.stir
  }
  return c
}
const mix = (a: string, b: string, t: number) => {
  const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
  const [x, y] = [p(a), p(b)]
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * Math.min(1, Math.max(0, t)))).join(',')})`
}

interface Held {
  id: ToolId | 'glass'
  ox: number
  oy: number
  sx: number
  sy: number
  x: number
  y: number
  moved: boolean
}

export interface CafeProps {
  S: Stage
  active: boolean
  first: CafeStep
  straw: StrawColor
  cream: boolean
  onStep: (s: CafeStep) => void
  onChoose: (c: { straw?: StrawColor; cream?: boolean }) => void
  onStairs: () => void
}

export function Cafe({ S, active, first, straw, cream, onStep, onChoose, onStairs }: CafeProps) {
  const C = S.cafe
  const rim = C.counter - C.glass.h
  const [step, setStepState] = useState<CafeStep>(first)
  const [cubes, setCubes] = useState(seed(first).cubes)
  const [strawIn, setStrawIn] = useState(seed(first).straw)
  const [spill, setSpill] = useState(0)
  const [daddyHas, setDaddyHas] = useState(glassOf(first) === 2)
  const [poke, setPoke] = useState<Record<string, number>>({})
  const root = useRef<HTMLDivElement>(null)
  const els = useRef<Partial<Record<ToolId | 'glass' | 'cube', SVGGElement | null>>>({})
  const liquid = useRef<SVGRectElement>(null)
  const chocLayer = useRef<SVGRectElement>(null)
  const swirl = useRef<SVGPathElement>(null)
  const floaters = useRef<SVGGElement>(null)
  const stream = useRef<SVGLineElement>(null)
  const fans = useRef<(SVGGElement | null)[]>([])
  const sparkle = useRef<PuppetHandle>(null)

  const home = (id: ToolId): Pt => ({ x: C.tools[id].x, y: C.tools[id].y - PIVOT[id] })
  const glassHome = (): Pt => ({ x: C.glass.x, y: C.counter })
  const g = useRef({
    step: first,
    held: null as Held | null,
    pos: Object.fromEntries((Object.keys(C.tools) as ToolId[]).map((id) => [id, home(id)])) as Record<ToolId, Pt>,
    tilt: { pot: 0, jug: 0, syrup: 0 } as Record<Pour, number>,
    c: seed(first),
    glass: glassHome(),
    /** The delivered glass gliding to Daddy's table. */
    toDaddy: false,
    glug: 0,
    stirTick: 0,
    lastSpoon: null as Pt | null,
    spillAt: 0,
    overflowSaid: false,
    fanSpin: [0, 0],
    fanBoost: [0, 0],
  })

  const setStep = (s: CafeStep) => {
    g.current.step = s
    setStepState(s)
    onStep(s)
  }
  useEffect(() => onStep(first), [])

  /** Moves on through every step whose goal is already met (she may pour things in any order). */
  const advance = () => {
    const G = g.current
    const c = G.c
    const ready = (s: CafeStep) =>
      s === 'ice' ? c.cubes >= FEEL.ice
      : s === 'coffee' ? c.coffee >= FEEL.coffee
      : s === 'milk' ? c.milk >= FEEL.milk && c.coffee + c.milk >= FEEL.coffeeFull
      : s === 'straw' ? c.straw
      : s === 'milk2' ? c.milk >= FEEL.cocoaMilk
      : s === 'syrup' ? c.choc >= FEEL.syrup
      : s === 'stir' ? c.stir >= FEEL.stir
      : false
    let s = G.step
    while (ready(s)) s = ORDER[ORDER.indexOf(s) + 1]
    if (s !== G.step) {
      sounds.correct()
      if (s === 'deliver' || s === 'pick') burst()
      setStep(s)
    }
  }

  const toStage = (e: { clientX: number; clientY: number }): Pt => {
    const r = root.current!.getBoundingClientRect()
    const k = r.width / S.w
    return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }
  }

  const grab = (id: Held['id']) => (e: ReactPointerEvent) => {
    if (!active) return
    e.stopPropagation()
    root.current?.setPointerCapture(e.pointerId)
    const p = toStage(e)
    const G = g.current
    const at = id === 'glass' ? G.glass : id === 'ice' ? p : G.pos[id]
    if (id === 'glass' && G.step !== 'deliver') {
      // Before it's ready, the glass just clinks.
      csfx.clink(1)
      return
    }
    G.held = { id, ox: at.x - p.x, oy: at.y - p.y, sx: p.x, sy: p.y, x: p.x, y: p.y, moved: false }
    sounds.pickup()
  }

  const onMove = (e: ReactPointerEvent) => {
    const h = g.current.held
    if (!h) return
    const p = toStage(e)
    h.x = p.x
    h.y = p.y
    if (Math.hypot(p.x - h.sx, p.y - h.sy) > 14) h.moved = true
    if (h.id === 'spoon') stirTo({ x: p.x + h.ox, y: p.y + h.oy })
  }

  // Stirring: spoon travel inside her glass mixes the chocolate in. Measured on every pointer move (a frame loop sees
  // only a few points of a quick circle on a slow iPad).
  const stirTo = (sp: Pt) => {
    const G = g.current
    const c = G.c
    const level = Math.min(1, c.coffee + c.milk + c.choc)
    const surface = C.counter - 8 - level * (C.glass.h - 16)
    const inside = Math.abs(sp.x - C.glass.x) < C.glass.w / 2 - 10 && sp.y > surface - 10 && sp.y < C.counter
    if (!inside || level < 0.05) {
      G.lastSpoon = null
      return
    }
    if (G.lastSpoon) {
      const d = Math.hypot(sp.x - G.lastSpoon.x, sp.y - G.lastSpoon.y)
      c.stir += d
      G.stirTick += d
      if (G.stirTick > 160) {
        G.stirTick = 0
        csfx.tinkle()
      }
    }
    G.lastSpoon = sp
    if (G.step === 'stir' && c.stir >= FEEL.stir) advance()
  }

  const overGlass = (p: Pt) => Math.abs(p.x - C.glass.x) < C.glass.w / 2 + 70 && p.y < C.counter - 20 && p.y > rim - 260

  const addCube = () => {
    const c = g.current.c
    if (c.cubes >= 5) {
      csfx.clink(4)
      return
    }
    c.cubes++
    csfx.clink(c.cubes)
    sounds.note(c.cubes + 1)
    setCubes(c.cubes)
    advance()
  }

  const daddyAt = (): Pt => ({ x: C.daddy.x, y: C.daddy.y - 120 })
  const deliver = () => {
    const G = g.current
    if (G.toDaddy) return
    G.toDaddy = true
    sounds.place()
    setTimeout(() => {
      setDaddyHas(true)
      csfx.slurp()
      setPoke((p) => ({ ...p, daddy: (p.daddy ?? 0) + 1 }))
      burst()
      void (async () => {
        await say(L.cafe.daddy)
        // Her own glass slides in.
        G.c = empty()
        G.glass = glassHome()
        G.toDaddy = false
        setCubes(0)
        setStrawIn(false)
        setStep('milk2')
      })()
    }, 700)
  }

  const onUp = () => {
    const G = g.current
    const h = G.held
    if (!h) return
    G.held = null
    const tap = !h.moved
    if (h.id === 'ice') {
      if (tap || overGlass({ x: h.x, y: h.y })) addCube()
      else sounds.place()
    } else if (h.id === 'straws') {
      if (G.step === 'straw') {
        G.c.straw = true
        setStrawIn(true)
        csfx.clink(2)
        advance()
      } else {
        setPoke((p) => ({ ...p, straws: (p.straws ?? 0) + 1 }))
        sounds.pop()
      }
    } else if (h.id === 'glass') {
      const at = { x: h.x + h.ox, y: h.y + h.oy }
      const d = daddyAt()
      if (tap || Math.hypot(at.x - d.x, at.y - d.y) < 260) deliver()
      else sounds.place()
    } else {
      sounds.place()
      advance()
    }
  }

  // Tapping Daddy while his coffee is ready delivers it too.
  const tapDaddy = () => {
    if (g.current.step === 'deliver') return deliver()
    sounds.pop()
    if (daddyHas) csfx.slurp()
    setPoke((p) => ({ ...p, daddy: (p.daddy ?? 0) + 1 }))
  }

  useGameLoop((dt) => {
    if (dt <= 0) return
    const G = g.current
    const h = G.held
    const c = G.c
    const level = Math.min(1, c.coffee + c.milk + c.choc)
    const inner = C.glass.h - 16
    const surface = C.counter - 8 - level * inner
    let pouring: Pour | null = null
    let spout: Pt = { x: 0, y: 0 }
    const ease = 1 - Math.exp(-14 * dt)

    for (const id of Object.keys(C.tools) as ToolId[]) {
      const p = G.pos[id]
      if (h && h.id === id && id !== 'ice' && id !== 'straws') {
        p.x = h.x + h.ox
        p.y = h.y + h.oy
      } else {
        const hm = home(id)
        p.x += (hm.x - p.x) * ease
        p.y += (hm.y - p.y) * ease
      }
      let rot = 0
      let flip = 1
      if (id === 'pot' || id === 'jug' || id === 'syrup') {
        const side = Math.sign(C.tools[id].x - C.glass.x) || -1
        flip = side > 0 ? -1 : 1
        // Tip over the glass: more the closer she brings it to the rim on its own side.
        const above = p.y < rim - 30 && p.y > rim - 520
        const d = Math.abs(p.x - (C.glass.x + side * 95))
        const want = h?.id === id && above ? Math.max(0, Math.min(1, 1.35 - d / FEEL.tiltZone)) : 0
        G.tilt[id] += (want - G.tilt[id]) * (1 - Math.exp(-FEEL.tiltEase * dt))
        rot = G.tilt[id] * FEEL.tiltMax * -side
        if (G.tilt[id] > FEEL.pourFrom) {
          const a = (rot * Math.PI) / 180
          const sp = { x: SPOUT[id].x * flip, y: SPOUT[id].y }
          spout = { x: p.x + sp.x * Math.cos(a) - sp.y * Math.sin(a), y: p.y + sp.x * Math.sin(a) + sp.y * Math.cos(a) }
          pouring = id
          const k = ((G.tilt[id] - FEEL.pourFrom) / (1 - FEEL.pourFrom)) * (id === 'syrup' ? FEEL.syrupRate : FEEL.pourRate) * dt
          const inGlass = Math.abs(spout.x - C.glass.x) < C.glass.w / 2 - 6 && !G.toDaddy
          if (inGlass) {
            if (level >= 1) {
              // Too full: it fountains over the rim.
              if (performance.now() > G.spillAt) {
                G.spillAt = performance.now() + 700
                csfx.fountain()
                setSpill((n) => n + 1)
                if (!G.overflowSaid) {
                  G.overflowSaid = true
                  void say(L.cafe.overflow)
                }
              }
            } else if (id === 'pot') c.coffee += k
            else if (id === 'jug') {
              c.milk += k
              c.swirl = Math.min(1, c.swirl + k * 3)
            } else c.choc += k
          }
          G.glug -= dt
          if (G.glug <= 0) {
            G.glug = 0.22
            if (id === 'syrup') csfx.squirt()
            else csfx.glug(id === 'pot')
          }
        }
      }
      const el = els.current[id]
      if (el) el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${flip} 1) translate(0 ${PIVOT[id]})`)
    }

    // The glass: carried to Daddy, then gliding onto his table.
    if (h?.id === 'glass') {
      G.glass = { x: h.x + h.ox, y: h.y + h.oy }
    } else if (G.toDaddy) {
      const t = { x: C.table.x, y: C.table.y - 86 }
      G.glass.x += (t.x - G.glass.x) * ease * 0.6
      G.glass.y += (t.y - G.glass.y) * ease * 0.6
    } else {
      const hm = glassHome()
      G.glass.x += (hm.x - G.glass.x) * ease
      G.glass.y += (hm.y - G.glass.y) * ease
    }
    const ge = els.current.glass
    if (ge) ge.setAttribute('transform', `translate(${G.glass.x.toFixed(1)} ${G.glass.y.toFixed(1)}) scale(${G.toDaddy ? 0.7 : 1})`)

    // What's in the glass.
    const two = glassOf(G.step) === 2
    const m = two ? Math.min(1, c.stir / FEEL.stir) : 0
    const color = two ? mix(COLORS.milk, COLORS.cocoa, c.choc > 0 ? 0.2 + 0.8 * m : 0) : mix(COLORS.coffee, COLORS.latte, c.milk / Math.max(0.01, c.coffee + c.milk))
    if (liquid.current) {
      liquid.current.setAttribute('y', String(-8 - level * inner))
      liquid.current.setAttribute('height', String(level * inner))
      liquid.current.setAttribute('fill', c.coffee + c.milk + c.choc > 0 ? color : 'none')
    }
    if (chocLayer.current) {
      const ch = Math.min(c.choc, 0.3) * inner * (1 - m)
      chocLayer.current.setAttribute('y', String(-8 - ch))
      chocLayer.current.setAttribute('height', String(ch))
    }
    c.swirl = Math.max(0, c.swirl - dt * 0.25)
    if (swirl.current) {
      swirl.current.setAttribute('opacity', String(two ? (c.choc > 0 ? 1 - m : 0) : c.swirl))
      swirl.current.setAttribute('stroke', two ? COLORS.choc : '#FFF6EC')
      swirl.current.setAttribute('transform', `translate(0 ${(-8 - level * inner + 24).toFixed(1)}) rotate(${(c.stir * 0.3) % 360})`)
    }
    if (floaters.current) floaters.current.setAttribute('transform', `translate(0 ${Math.min(-30, -8 - level * inner + 18).toFixed(1)})`)

    // The pour stream.
    const st = stream.current
    if (st) {
      if (pouring) {
        const inGlass = Math.abs(spout.x - C.glass.x) < C.glass.w / 2 - 6
        st.setAttribute('x1', spout.x.toFixed(1))
        st.setAttribute('y1', spout.y.toFixed(1))
        st.setAttribute('x2', spout.x.toFixed(1))
        st.setAttribute('y2', String(inGlass ? Math.max(spout.y, surface) : C.counter))
        st.setAttribute('stroke', STREAM[pouring].color)
        st.setAttribute('stroke-width', String(STREAM[pouring].width))
        st.setAttribute('opacity', '1')
      } else st.setAttribute('opacity', '0')
    }

    // The held ice cube.
    const cube = els.current.cube
    if (cube) {
      if (h?.id === 'ice') cube.setAttribute('transform', `translate(${h.x.toFixed(1)} ${h.y.toFixed(1)})`)
      cube.setAttribute('opacity', h?.id === 'ice' ? '1' : '0')
    }

    // Ceiling fans (tap one and it whooshes faster for a bit).
    C.fans.forEach((_, i) => {
      G.fanBoost[i] = Math.max(0, G.fanBoost[i] - dt * 0.6)
      G.fanSpin[i] = (G.fanSpin[i] + dt * (120 + 900 * G.fanBoost[i])) % 360
      fans.current[i]?.setAttribute('transform', `rotate(${G.fanSpin[i].toFixed(1)})`)
    })
  }, active)

  const glow = (s: CafeStep[]) => (s.includes(step) ? 'url(#cafe-glow)' : undefined)
  const two = glassOf(step) === 2
  const bump = (k: string) => setPoke((p) => ({ ...p, [k]: (p[k] ?? 0) + 1 }))

  return (
    <div ref={root} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} style={{ position: 'absolute', left: 0, top: 0, width: S.w, height: S.h, touchAction: 'none' }}>
      <svg viewBox={`0 0 ${S.w} ${S.h}`} width={S.w} height={S.h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <filter id="cafe-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#FFC83D" floodOpacity="1">
              <animate attributeName="stdDeviation" values="4;14;4" dur="1.2s" repeatCount="indefinite" />
            </feDropShadow>
          </filter>
        </defs>
        {/* Greybox scene: jungle, the thatched roof, the terrace, the counter. */}
        <rect x={-2000} y={-2000} width={S.w + 4000} height={2000 + C.floor} fill="#7CC27A" />
        {[0.1, 0.3, 0.55, 0.8].map((f, i) => (
          <circle key={i} cx={S.w * f} cy={C.floor - 150} r={140 + (i % 2) * 40} fill="#5FAE5E" />
        ))}
        <path d={`M-2000 0H${S.w + 2000}V${S.tall ? 200 : 40}L${S.w / 2} ${S.tall ? 120 : -10}L-2000 ${S.tall ? 200 : 40}Z`} fill="#D8B26E" stroke={INK} strokeWidth="5" />
        <rect x={-2000} y={C.floor} width={S.w + 4000} height={C.counter - C.floor} fill="#F3E2B8" />
        <rect x={-2000} y={C.counter} width={S.w + 4000} height={2000} fill="#C98A52" stroke={INK} strokeWidth="5" />
        <rect x={-2000} y={C.counter} width={S.w + 4000} height={20} fill="#B9A58A" />
        {S.tall && <rect x={-2000} y={C.tools.spoon.y} width={S.w + 4000} height={16} fill="#B9A58A" stroke={INK} strokeWidth="4" />}

        {/* Fans and a rattan lamp hanging from the roof. */}
        {C.fans.map((f, i) => (
          <g key={i} transform={`translate(${f.x} ${f.y})`}>
            <line x1="0" y1={-f.y} x2="0" y2="0" stroke={INK} strokeWidth="5" />
            <g ref={(el) => void (fans.current[i] = el)}>
              {[0, 120, 240].map((a) => (
                <ellipse key={a} cx="45" cy="0" rx="45" ry="12" fill="#F7F1E6" stroke={INK} strokeWidth="4" transform={`rotate(${a})`} />
              ))}
            </g>
            <circle r="14" fill="#E8A35A" stroke={INK} strokeWidth="4" />
          </g>
        ))}
        {C.lamps.map((l, i) => (
          <motion.g key={`${i}-${poke.lamp ?? 0}`} style={{ originX: 0.5, originY: 0 }} animate={{ rotate: poke.lamp ? [0, 18, -14, 8, -4, 0] : 0 }} transition={{ duration: 1.6 }}>
            <line x1={l.x} y1={-400} x2={l.x} y2={l.y} stroke={INK} strokeWidth="4" />
            <path d={`M${l.x - 46} ${l.y + 50}Q${l.x} ${l.y - 30} ${l.x + 46} ${l.y + 50}Z`} fill="#D99A4E" stroke={INK} strokeWidth="5" />
          </motion.g>
        ))}

        {/* The terrace: beanbags, a round table and Daddy. */}
        {C.beanbags.map((x, i) => (
          <motion.g key={`${i}-${poke[`bb${i}`] ?? 0}`} style={{ originX: 0.5, originY: 1 }} animate={{ scaleY: poke[`bb${i}`] ? [1, 0.7, 1.08, 1] : 1, scaleX: poke[`bb${i}`] ? [1, 1.2, 0.95, 1] : 1 }} transition={{ duration: 0.5 }}>
            <g transform={`translate(${x} ${C.floor})`}>
              <Beanbag />
            </g>
          </motion.g>
        ))}
        <g transform={`translate(${C.table.x} ${C.table.y})`}>
          <Table />
          {daddyHas && (
            <g transform="translate(40 -86) scale(0.45)">
              <MiniCoffee />
            </g>
          )}
        </g>
        <motion.g key={`daddy-${poke.daddy ?? 0}`} style={{ originX: 0.5, originY: 1 }} animate={{ y: poke.daddy ? [0, -24, 0] : 0 }} transition={{ duration: 0.45 }} filter={glow(['deliver'])}>
          <g transform={`translate(${C.daddy.x} ${C.daddy.y})`}>
            <Daddy />
          </g>
        </motion.g>

        {/* Stairs down to the elephants. */}
        <g transform={`translate(${C.stairs.x - C.stairs.w / 2} ${C.stairs.y - C.stairs.h / 2})`} filter={glow(['stairs'])}>
          <rect width={C.stairs.w} height={C.stairs.h} rx="16" fill="#8A6A4A" stroke={INK} strokeWidth="5" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={10 + i * 12} y={20 + i * 38} width={C.stairs.w - 20 - i * 24} height="26" rx="6" fill="#F3E2B8" stroke={INK} strokeWidth="4" />
          ))}
          <path d={`M${C.stairs.w / 2 - 22} ${C.stairs.h - 26}l22 18l22 -18`} fill="none" stroke="#FFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* The glass. */}
        <g aria-label="glass" ref={(el) => void (els.current.glass = el)} transform={`translate(${C.glass.x} ${C.counter})`} onPointerDown={grab('glass')} filter={glow(['deliver'])} style={{ cursor: 'grab' }}>
          <motion.g key={two ? 'g2' : 'g1'} initial={two ? { x: -900 } : false} animate={{ x: 0 }} transition={{ type: 'spring', bounce: 0.25, duration: 0.9 }}>
            <rect x={-C.glass.w / 2 - 20} y={-C.glass.h - 40} width={C.glass.w + 40} height={C.glass.h + 40} fill="transparent" />
            <clipPath id="cafe-glass-clip">
              <rect x={-C.glass.w / 2 + 6} y={-C.glass.h} width={C.glass.w - 12} height={C.glass.h - 6} rx="10" />
            </clipPath>
            <g clipPath="url(#cafe-glass-clip)">
              <rect ref={liquid} x={-C.glass.w / 2} width={C.glass.w} y={-8} height={0} />
              <rect ref={chocLayer} x={-C.glass.w / 2} width={C.glass.w} y={-8} height={0} fill={COLORS.choc} />
              <path ref={swirl} d="M-50 0q20 -18 40 0t40 0t40 0M-40 26q20 -14 40 0t40 0" fill="none" strokeWidth="8" strokeLinecap="round" opacity="0" />
              <g ref={floaters}>
                {Array.from({ length: cubes }, (_, i) => (
                  <g key={i} transform={`translate(${-48 + (i % 3) * 46} ${Math.floor(i / 3) * 34}) rotate(${(i * 23) % 40 - 20})`}>
                    <Cube />
                  </g>
                ))}
              </g>
            </g>
            {(strawIn || (two && (step === 'cream' || step === 'stairs'))) && (
              <rect x={14} y={-C.glass.h - 70} width="18" height={C.glass.h + 40} rx="9" fill={two ? COLORS.straw[straw] : COLORS.straw.pink} stroke={INK} strokeWidth="4" transform="rotate(8)" />
            )}
            {two && cream && step === 'stairs' && <path d={`M${-C.glass.w / 2 + 4} ${-C.glass.h + 6}q10 -46 40 -40q14 -40 50 -20q30 -20 40 20q30 0 26 40Z`} fill="#FFFDF8" stroke={INK} strokeWidth="5" />}
            <rect x={-C.glass.w / 2} y={-C.glass.h} width={C.glass.w} height={C.glass.h} rx="14" fill="rgba(220,240,255,0.25)" stroke={INK} strokeWidth="6" />
          </motion.g>
        </g>
        {/* Overflow fountain: drops over the rim. */}
        <AnimatePresence>
          {spill > 0 && (
            <motion.g key={spill} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.9 }}>
              {[-1, -0.5, 0, 0.5, 1].map((k, i) => (
                <motion.circle key={i} r="10" fill={two ? COLORS.cocoa : COLORS.latte} stroke={INK} strokeWidth="3" initial={{ cx: C.glass.x + k * 40, cy: rim }} animate={{ cx: C.glass.x + k * 150, cy: [rim, rim - 110 + Math.abs(k) * 50, C.counter] }} transition={{ duration: 0.8, ease: 'easeOut' }} />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        <line ref={stream} strokeLinecap="round" opacity="0" />

        {/* Tools on the counter. */}
        <g aria-label="ice bucket" ref={(el) => void (els.current.ice = el)} onPointerDown={grab('ice')} filter={glow(['ice'])}>
          <IceBucket />
          <rect x="-90" y="-140" width="180" height="150" fill="transparent" />
        </g>
        <g aria-label="coffee pot" ref={(el) => void (els.current.pot = el)} onPointerDown={grab('pot')} filter={glow(['coffee'])}>
          <Pot />
          <rect x="-70" y="-170" width="160" height="180" fill="transparent" />
        </g>
        <g aria-label="milk jug" ref={(el) => void (els.current.jug = el)} onPointerDown={grab('jug')} filter={glow(['milk', 'milk2'])}>
          <Jug />
          <rect x="-70" y="-170" width="150" height="180" fill="transparent" />
        </g>
        <g aria-label="chocolate bottle" ref={(el) => void (els.current.syrup = el)} onPointerDown={grab('syrup')} filter={glow(['syrup'])}>
          <Syrup />
          <rect x="-55" y="-195" width="110" height="205" fill="transparent" />
        </g>
        <g aria-label="spoon" ref={(el) => void (els.current.spoon = el)} onPointerDown={grab('spoon')} filter={glow(['stir'])}>
          <Spoon />
          <rect x="-45" y="-220" width="90" height="250" fill="transparent" />
        </g>
        <motion.g key={`straws-${poke.straws ?? 0}`} animate={{ rotate: poke.straws ? [0, -10, 8, 0] : 0 }} style={{ originX: 0.5, originY: 1 }}>
          <g aria-label="straws" ref={(el) => void (els.current.straws = el)} onPointerDown={grab('straws')} filter={glow(['straw'])}>
            <StrawCup />
            <rect x="-60" y="-170" width="120" height="180" fill="transparent" />
          </g>
        </motion.g>
        <g ref={(el) => void (els.current.cube = el)} opacity="0" pointerEvents="none">
          <Cube />
        </g>
      </svg>

      {/* Pokeables and Sparkle (real buttons, off the tools she drags). */}
      <button aria-label="Sparkle" onClick={() => void sparkle.current?.play('wiggle')} style={{ position: 'absolute', left: C.sparkle.x - C.sparkle.h * 0.5, top: C.sparkle.y - C.sparkle.h, width: C.sparkle.h, height: C.sparkle.h, padding: 0, background: 'none', border: 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <SparklePuppet ref={sparkle} height={`${C.sparkle.h}px`} lookToward={0.5} />
      </button>
      {C.fans.map((f, i) => (
        <PokeButton
          key={i}
          label="ceiling fan"
          x={f.x}
          y={f.y}
          r={70}
          onTap={() => {
            g.current.fanBoost[i] = 1
            csfx.fan()
          }}
        />
      ))}
      {C.lamps.map((l, i) => (
        <PokeButton
          key={i}
          label="lamp"
          x={l.x}
          y={l.y + 20}
          r={60}
          onTap={() => {
            bump('lamp')
            sounds.pop()
          }}
        />
      ))}
      {C.beanbags.map((x, i) => (
        <PokeButton
          key={i}
          label="beanbag"
          x={x}
          y={C.floor - 50}
          r={45}
          onTap={() => {
            bump(`bb${i}`)
            csfx.squish()
          }}
        />
      ))}
      <PokeButton label="Daddy" x={C.daddy.x} y={C.daddy.y - 140} r={80} onTap={tapDaddy} />
      <PokeButton
        label="Stairs"
        x={C.stairs.x}
        y={C.stairs.y}
        r={C.stairs.w / 2}
        onTap={() => {
          if (g.current.step === 'stairs') {
            sounds.whoosh()
            onStairs()
          } else sounds.pop()
        }}
      />

      {/* Her choices: a straw color, then whipped cream or not. */}
      <AnimatePresence>
        {(step === 'pick' || step === 'cream') && (
          <motion.div
            key={step}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            style={{ position: 'absolute', left: C.picker.x - 260, top: C.picker.y - 100, width: 520, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', background: '#FFF7F0', border: `5px solid ${INK}`, borderRadius: 40, boxShadow: '0 8px 0 rgba(43,35,48,.2)' }}
          >
            {step === 'pick'
              ? (['pink', 'purple', 'yellow'] as StrawColor[]).map((c) => (
                  <motion.button
                    key={c}
                    aria-label={`${c} straw`}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => {
                      sounds.pop()
                      onChoose({ straw: c })
                      setStep('cream')
                    }}
                    style={{ width: 140, height: 140, borderRadius: '50%', border: `5px solid ${INK}`, background: '#fff', display: 'grid', placeItems: 'center', padding: 0 }}
                  >
                    <svg viewBox="-40 -60 80 120" width="80" height="120">
                      <rect x="-10" y="-56" width="20" height="112" rx="10" fill={COLORS.straw[c]} stroke={INK} strokeWidth="5" transform="rotate(12)" />
                    </svg>
                  </motion.button>
                ))
              : ([true, false] as const).map((yes) => (
                  <motion.button
                    key={String(yes)}
                    aria-label={yes ? 'whipped cream' : 'no cream'}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => {
                      sounds.pop()
                      if (yes) csfx.squirt()
                      onChoose({ cream: yes })
                      burst()
                      setStep('stairs')
                    }}
                    style={{ width: 160, height: 160, borderRadius: 40, border: `5px solid ${INK}`, background: '#fff', display: 'grid', placeItems: 'center', padding: 0 }}
                  >
                    <svg viewBox="-60 -70 120 130" width="110" height="120">
                      <rect x="-40" y="-20" width="80" height="76" rx="10" fill={COLORS.cocoa} stroke={INK} strokeWidth="5" />
                      {yes ? <path d="M-40 -18q6 -30 26 -26q10 -30 34 -14q22 -14 24 14q20 2 -4 26Z" fill="#FFFDF8" stroke={INK} strokeWidth="5" /> : <rect x="-40" y="-20" width="80" height="12" fill="#9C6B4A" stroke={INK} strokeWidth="4" />}
                    </svg>
                  </motion.button>
                ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Daddy's coffee on his table. */
function MiniCoffee() {
  return (
    <g>
      <rect x="-60" y="-160" width="120" height="160" rx="12" fill={COLORS.latte} stroke={INK} strokeWidth="6" />
      <rect x="10" y="-210" width="16" height="170" rx="8" fill={COLORS.straw.pink} stroke={INK} strokeWidth="4" transform="rotate(8)" />
    </g>
  )
}

/** An invisible round button over something in the scene that reacts to a tap. */
export function PokeButton({ label, x, y, r, onTap }: { label: string; x: number; y: number; r: number; onTap: () => void }) {
  return (
    <button
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onTap}
      style={{ position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: 'none', border: 'none', padding: 0 }}
    />
  )
}

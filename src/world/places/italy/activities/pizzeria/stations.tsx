// The kitchen stations. Each one is a different finger move:
//   Dough     flick up (or tap) to toss and spin the dough; three tosses make a big round base.
//   Sauce     press and swirl the ladle; red paints wherever it goes until the base is covered.
//   Toppings  a StickerBoard: drag toppings onto the pizza (counts, halves, or anything she likes).
//   Cutter    drag the pizza wheel across: one cut = two halves, two cuts = four slices.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BigButton, say, sounds, StickerBoard, useAlive, useElementSize, wait, type Placed } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'
import { counts, PizzaBase, PizzaCuts, PizzaToppings, RAW, stickersFor, type Order, type PizzaState, type Sauce, type Topping } from './pizza'
import { IngredientBoard } from './IngredientBoard'

const P = L.pizza
/** The pizza's size inside the work area (the area is a size container). */
export const PIZZA = 'min(92cqh, 86cqw)'

// --- Dough -------------------------------------------------------------------------------------------------------

const TOSSES = 3
const DOUGH_SIZE = [0.44, 0.64, 0.84, 1]

/** Flick the dough up (or tap it): it spins in the air and lands bigger. Calls onToss for the chef to copy. */
export function Dough({ onToss, onDone }: { onToss?: (n: number) => void; onDone: () => void }) {
  const [tosses, setTosses] = useState(0)
  const [flying, setFlying] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const { height } = useElementSize(box)
  const start = useRef<{ y: number; t: number } | null>(null)
  const alive = useAlive()

  const toss = async () => {
    if (flying || tosses >= TOSSES) return
    setFlying(true)
    sounds.whoosh()
    onToss?.(tosses + 1)
    await wait(900)
    if (!alive()) return
    sfx.thump()
    const n = tosses + 1
    setTosses(n)
    setFlying(false)
    if (n === TOSSES) onDone()
  }

  const s = DOUGH_SIZE[tosses]
  return (
    <div
      ref={box}
      onPointerDown={(e) => {
        start.current = { y: e.clientY, t: performance.now() }
      }}
      onPointerUp={(e) => {
        const st = start.current
        start.current = null
        if (!st) return
        // An upward flick, or just a tap (the easier way): both toss.
        if (st.y - e.clientY > 24 || Math.abs(st.y - e.clientY) < 12) void toss()
      }}
      role="button"
      aria-label="dough"
      style={{ position: 'relative', width: PIZZA, height: PIZZA, display: 'grid', placeItems: 'center', touchAction: 'none', cursor: 'pointer' }}
    >
      {/* Flour dusted on the counter */}
      <div style={{ position: 'absolute', width: '96%', height: '96%', bottom: '2%', borderRadius: '50%', background: 'rgba(255,255,255,.55)' }} />
      <motion.div
        animate={flying ? { y: [0, -height * 0.28, 0], rotate: [0, 540, 720], scaleY: [1, 0.7, 1] } : { y: 0, rotate: 0, scaleY: 1 }}
        transition={flying ? { duration: 0.9, times: [0, 0.5, 1], ease: ['easeOut', 'easeIn'] } : { type: 'spring', bounce: 0.6 }}
        style={{ width: `${s * 100}%`, height: `${s * 100}%`, position: 'relative' }}
      >
        {tosses === 0 ? (
          <svg viewBox="-110 -110 220 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <ellipse cy="10" rx="96" ry="84" fill="#F7E7DA" stroke={INK} strokeWidth="7" />
            <path d="M-70 44 C-40 78 40 78 70 44 C40 66 -40 66 -70 44Z" fill="#F2D2BE" />
            <ellipse cx="-38" cy="-30" rx="18" ry="10" fill="#fff" opacity="0.6" />
          </svg>
        ) : (
          <PizzaBase pizza={RAW} />
        )}
      </motion.div>
      {!flying && tosses < TOSSES && (
        <motion.div aria-hidden animate={{ y: [0, -22, 0], opacity: [0.9, 0.5, 0.9] }} transition={{ repeat: Infinity, duration: 1 }} style={{ position: 'absolute', top: '4%', fontSize: 'min(10cqh, 64px)', pointerEvents: 'none' }}>
          👆
        </motion.div>
      )}
    </div>
  )
}

// --- Sauce -------------------------------------------------------------------------------------------------------

const SAUCE_COLOR: Record<Sauce, string> = { red: '#E8574F', pink: '#F27AA6' }
const GRID = 14
const SAUCE_R = 80 / 220 // sauce radius as a fraction of the pizza box
const BRUSH = 0.13 // brush radius as a fraction of the pizza box

/** Press and swirl the ladle over the pizza; the sauce paints where it goes. Done at about 82% covered. */
export function SauceSwirl({ pizza, color, onDone }: { pizza: PizzaState; color: Sauce; onDone: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const ladle = useRef<HTMLImageElement>(null)
  const { width: size } = useElementSize(box)
  const covered = useRef(new Set<number>())
  const down = useRef(false)
  const strokes = useRef<{ x: number; y: number }[]>([])
  const [done, setDone] = useState(false)
  const [meter, setMeter] = useState(0)
  const lastSplat = useRef(0)

  // The cells inside the sauce circle, to measure coverage.
  const cells = useRef<{ i: number; x: number; y: number }[]>([])
  if (!cells.current.length) {
    for (let gy = 0; gy < GRID; gy++)
      for (let gx = 0; gx < GRID; gx++) {
        const x = (gx + 0.5) / GRID
        const y = (gy + 0.5) / GRID
        if (Math.hypot(x - 0.5, y - 0.5) < SAUCE_R * 0.92) cells.current.push({ i: gy * GRID + gx, x, y })
      }
  }

  useEffect(() => {
    const c = canvas.current
    if (!c || !size) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = size * dpr
    c.height = size * dpr
    const ctx = c.getContext('2d')!
    ctx.scale(dpr, dpr)
    // Repaint the same fractional strokes after rotation; resizing a canvas clears its pixels.
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, SAUCE_R * size, 0, Math.PI * 2)
    ctx.clip()
    ctx.fillStyle = SAUCE_COLOR[color]
    for (const p of strokes.current) {
      ctx.beginPath()
      ctx.arc(p.x * size, p.y * size, BRUSH * size, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [size, color])

  const paint = (clientX: number, clientY: number) => {
    const el = box.current
    const c = canvas.current
    if (!el || !c || done) return
    const r = el.getBoundingClientRect()
    const fx = (clientX - r.left) / r.width
    const fy = (clientY - r.top) / r.height
    if (ladle.current) ladle.current.style.transform = `translate(${fx * r.width - r.width * 0.2}px, ${fy * r.height - r.width * 0.22}px) rotate(-20deg)`
    strokes.current.push({ x: fx, y: fy })
    const ctx = c.getContext('2d')!
    ctx.save()
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, SAUCE_R * size, 0, Math.PI * 2)
    ctx.clip()
    ctx.fillStyle = SAUCE_COLOR[color]
    ctx.beginPath()
    ctx.arc(fx * size, fy * size, BRUSH * size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    for (const cell of cells.current) if (Math.hypot(cell.x - fx, cell.y - fy) < BRUSH) covered.current.add(cell.i)
    const now = performance.now()
    if (now - lastSplat.current > 180) {
      lastSplat.current = now
      sounds.note(Math.min(10, Math.floor((covered.current.size / cells.current.length) * 10)))
    }
    const frac = covered.current.size / cells.current.length
    setMeter(frac)
    if (frac >= 0.82) {
      setDone(true)
      sounds.sparkle()
      setTimeout(onDone, 700)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'min(3cqw, 24px)', height: '100%' }}>
      <div
        ref={box}
        onPointerDown={(e) => {
          down.current = true
          ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
          paint(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => down.current && paint(e.clientX, e.clientY)}
        onPointerUp={() => (down.current = false)}
        onPointerCancel={() => (down.current = false)}
        role="button"
        aria-label="pizza to spread sauce on"
        style={{ position: 'relative', width: PIZZA, height: PIZZA, touchAction: 'none', flex: 'none' }}
      >
        <PizzaBase pizza={{ ...pizza, sauce: color }} hideSauce={!done} />
        <canvas ref={canvas} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: done ? 0 : 1, transition: 'opacity .5s' }} />
        <img
          ref={ladle}
          src={art.ladle}
          alt=""
          draggable={false}
          style={{ position: 'absolute', left: 0, top: 0, width: '40%', pointerEvents: 'none', transform: 'translate(30%, 28%) rotate(-20deg)', filter: 'drop-shadow(0 6px 0 rgba(110,59,36,.25))' }}
        />
      </div>
      {/* Tomato meter: fills up as the sauce covers the pizza. */}
      <div aria-hidden style={{ width: 'min(5cqw, 34px)', height: '70%', borderRadius: 999, border: `4px solid ${INK}`, background: '#fff', position: 'relative', overflow: 'hidden', flex: 'none' }}>
        <motion.div animate={{ height: `${Math.min(1, meter / 0.82) * 100}%` }} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: SAUCE_COLOR[color] }} />
        <div style={{ position: 'absolute', top: -2, left: '50%', translate: '-50% -100%', fontSize: 22 }}>🍅</div>
      </div>
    </div>
  )
}

/** Two sauce bowls to pick from (her own pizza): red tomato or pink beet. */
export function PickSauce({ onPick }: { onPick: (s: Sauce) => void }) {
  return (
    <div style={{ display: 'flex', gap: 'min(6cqw, 48px)', alignItems: 'center' }}>
      {(['red', 'pink'] as const).map((s) => (
        <motion.button
          key={s}
          aria-label={`${s} sauce`}
          whileTap={{ scale: 0.9 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, delay: s === 'pink' ? 0.3 : 0 }}
          onClick={() => {
            sounds.pop()
            void say(s === 'red' ? P.redSauce : P.pinkSauce)
            onPick(s)
          }}
          style={{ width: 'min(40cqw, 60cqh, 280px)', aspectRatio: '1', background: 'none', border: 'none', padding: 0, position: 'relative' }}
        >
          <img src={art.sauceBowl} alt="" style={{ width: '100%', filter: s === 'pink' ? 'hue-rotate(-28deg) saturate(1.1) brightness(1.15)' : undefined }} />
        </motion.button>
      ))}
    </div>
  )
}

// --- Toppings ----------------------------------------------------------------------------------------------------

/** Did she make what the ticket shows? Counts must match; halves need enough of each on its own side. */
export function orderMet(order: Order, items: Placed[]) {
  if (order.free) return false
  const c = counts(items)
  if (order.want) for (const [k, n] of Object.entries(order.want)) if ((c[k] ?? 0) !== n) return false
  if (order.halves) {
    const { left, right, each } = order.halves
    if (items.filter((i) => i.kind === left && i.x < 0.5).length < each) return false
    if (items.filter((i) => i.kind === right && i.x >= 0.5).length < each) return false
  }
  return true
}

/** What to ask for next, from the order and what's on the pizza. */
export function toppingPrompt(order: Order, items: Placed[]) {
  if (order.free) return P.decorate
  const c = counts(items)
  if (order.want?.mozzarella && order.want.basil) return (c.mozzarella ?? 0) < order.want.mozzarella ? P.cheese3 : P.basil3
  if (order.want?.olive) return P.olives5
  if (order.halves) return P.halfBoth
  return P.decorate
}

export function Toppings({ pizza, order, kinds, onChange, onDone }: { pizza: PizzaState; order: Order; kinds: Topping[]; onChange: (items: Placed[]) => void; onDone: () => void }) {
  const Board = order.free ? IngredientBoard : StickerBoard
  const finished = useRef(false)
  const alive = useAlive()
  const extras = pizza.items.filter((i) => i.kind !== 'mozzarella' || order.want?.mozzarella).length

  const change = (next: Placed[]) => {
    const before = new Map(pizza.items.map((i) => [i.id, i]))
    let items = next
    let hint: typeof P.halfMush | null = null
    // Halves: a topping on the wrong side slides across to its own half.
    if (order.halves) {
      const { left, right } = order.halves
      items = next.map((it) => {
        const moved = !before.has(it.id) || before.get(it.id)!.x !== it.x
        if (!moved) return it
        if (it.kind === left && it.x >= 0.5) return (hint = P.halfMush), { ...it, x: Math.max(0.16, 1 - it.x - 0.04) }
        if (it.kind === right && it.x < 0.5) return (hint = P.halfOlive), { ...it, x: Math.min(0.84, 1 - it.x + 0.04) }
        return it
      })
    }
    onChange(items)
    if (finished.current) return
    const added = items.find((it) => !before.has(it.id))
    const c = counts(items)
    if (hint) {
      sounds.whoosh()
      void say(hint)
    } else if (added && order.want?.[added.kind as Topping] !== undefined) {
      const n = c[added.kind] ?? 0
      const want = order.want[added.kind as Topping]!
      if (n > want) void say(P.tooMany)
      else void say(P.count[n - 1])
    }
    if (orderMet(order, items)) {
      finished.current = true
      sounds.correct()
      void (async () => {
        await wait(700)
        if (!alive()) return
        await say(P.orderDone)
        if (alive()) onDone()
      })()
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Board
        stickers={stickersFor(kinds)}
        items={pizza.items}
        onChange={change}
        {...(!order.free ? { shape: 'circle' as const } : {})}
        surface={
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <PizzaBase pizza={pizza} />
            {/* Auto-sprinkled cheese is not a selectable sticker in the olive/mushroom orders. */}
            <PizzaToppings items={pizza.items.filter((it) => !kinds.includes(it.kind as Topping))} />
            {order.halves && (
              <svg viewBox="-110 -110 220 220" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <line x1="0" y1="-78" x2="0" y2="78" stroke="#FFF7F0" strokeWidth="4" strokeDasharray="9 8" strokeLinecap="round" />
              </svg>
            )}
            {order.halves && (
              <>
                <img src={art.mushroom} alt="" style={{ position: 'absolute', left: '-6%', top: '-4%', width: '14%', opacity: 0.9 }} />
                <img src={art.olive} alt="" style={{ position: 'absolute', right: '-4%', top: '-4%', width: '11%', opacity: 0.9 }} />
              </>
            )}
          </div>
        }
      />
      {order.free && extras >= 3 && (
        <div style={{ position: 'absolute', right: 0, bottom: 0, zIndex: 8 }}>
          <BigButton ariaLabel="My pizza is done" color="mint" onClick={onDone}>
            ✅
          </BigButton>
        </div>
      )}
    </div>
  )
}

// --- Cutter ------------------------------------------------------------------------------------------------------

/** Drag the pizza wheel across the pizza. `need` cuts (1 = halves, 2 = quarters), or 'free' (up to 4, then ✅). */
export function Cutter({ pizza, need, onCut, onDone }: { pizza: PizzaState; need: 1 | 2 | 'free'; onCut: (cuts: number[]) => void; onDone: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const wheel = useRef<HTMLImageElement>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const [trail, setTrail] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
  const finished = useRef(false)
  const alive = useAlive()
  const cuts = pizza.cuts

  const local = (e: { clientX: number; clientY: number }) => {
    const r = box.current!.getBoundingClientRect()
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
  }
  const moveWheel = (p: { x: number; y: number }) => {
    const r = box.current!.getBoundingClientRect()
    if (wheel.current) wheel.current.style.transform = `translate(${p.x * r.width - r.width * 0.09}px, ${p.y * r.height - r.width * 0.05}px)`
  }

  const addCut = (angle: number) => {
    let a = ((Math.round(angle / 45) * 45) % 180 + 180) % 180
    if (need === 2 && cuts.length === 1) {
      const diff = Math.abs(((a - cuts[0] + 90) % 180 + 180) % 180 - 90)
      if (diff < 60) {
        sounds.oops()
        void say(P.otherWay)
        return
      }
      a = (cuts[0] + 90) % 180 // fair quarters, even if her line was a bit off
    }
    if (cuts.includes(a)) {
      sounds.oops()
      void say(P.otherWay)
      return
    }
    sounds.snap()
    sfx.fwip()
    const next = [...cuts, a]
    onCut(next)
    if (need !== 'free' && next.length === need && !finished.current) {
      finished.current = true
      void (async () => {
        await wait(300)
        sounds.correct()
        await say(need === 1 ? P.halves : P.quarters)
        if (alive()) onDone()
      })()
    }
  }

  const nextEasyAngle = () => (cuts.length === 0 ? 90 : (cuts[0] + 90) % 180)

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div
        ref={box}
        role="button"
        aria-label="pizza to cut"
        onPointerDown={(e) => {
          if (finished.current) return
          ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
          const p = local(e)
          start.current = p
          moveWheel(p)
          setTrail({ x1: p.x, y1: p.y, x2: p.x, y2: p.y })
        }}
        onPointerMove={(e) => {
          if (!start.current) return
          const p = local(e)
          moveWheel(p)
          setTrail({ x1: start.current.x, y1: start.current.y, x2: p.x, y2: p.y })
        }}
        onPointerUp={(e) => {
          const s = start.current
          start.current = null
          setTrail(null)
          if (!s || finished.current) return
          const p = local(e)
          const len = Math.hypot(p.x - s.x, p.y - s.y)
          if (len < 0.08) {
            // A tap: the easier way. The wheel rolls along the next cut for her.
            if (need === 'free' && cuts.length >= 4) return
            addCut(need === 'free' ? [90, 0, 45, 135].find((a) => !cuts.includes(a)) ?? 90 : nextEasyAngle())
          } else if (len < 0.45) {
            sounds.oops()
            void say(P.cutAgain)
          } else addCut((Math.atan2(p.y - s.y, p.x - s.x) * 180) / Math.PI)
        }}
        onPointerCancel={() => {
          start.current = null
          setTrail(null)
        }}
        style={{ position: 'relative', width: PIZZA, height: PIZZA, touchAction: 'none', flex: 'none' }}
      >
        <PizzaBase pizza={pizza} />
        <PizzaToppings items={pizza.items} baked={1} />
        <PizzaCuts cuts={cuts} />
        {trail && (
          <svg viewBox="0 0 1 1" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <line x1={trail.x1} y1={trail.y1} x2={trail.x2} y2={trail.y2} stroke="#fff" strokeWidth="0.018" strokeDasharray="0.03 0.025" strokeLinecap="round" />
          </svg>
        )}
        {/* A dotted guide where the next cut should go */}
        {need !== 'free' && cuts.length < need && !trail && (
          <motion.svg viewBox="-110 -110 220 220" animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', rotate: `${nextEasyAngle()}deg` }}>
            <line x1="-104" y1="0" x2="104" y2="0" stroke="#fff" strokeWidth="5" strokeDasharray="10 9" strokeLinecap="round" />
          </motion.svg>
        )}
        <img ref={wheel} src={art.pizzaWheel} alt="" draggable={false} style={{ position: 'absolute', left: 0, top: 0, width: '18%', pointerEvents: 'none', transform: 'translate(-60%, 40%)', filter: 'drop-shadow(0 5px 0 rgba(110,59,36,.25))' }} />
      </div>
      <AnimatePresence>
        {need === 'free' && cuts.length > 0 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', right: '-2%', bottom: 0 }}>
            <BigButton ariaLabel="Done cutting" color="mint" onClick={onDone}>
              ✅
            </BigButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

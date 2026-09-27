// Pick things up and put them somewhere: into a slot (snap), anywhere (stay), or back (home).
// Built on usePointerDrag, so it's safe for lots of quick drags on iPad Safari.
//
//   <PlayArea>
//     <Target id="roof" hint={misses > 1}>...</Target>
//     <Piece snapTo="roof" onPlace={({ target }) => (target ? (setDone(true), 'snap') : 'home')}>🔺</Piece>
//   </PlayArea>
//
// A Piece that should move somewhere else after a drop (into its slot, to where she let go) just gets new
// position props / a new parent from you; it glides from where her finger let go to its new spot.
import { motion } from 'motion/react'
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { sounds } from '../sounds'
import { centerOf, distance, toLocal, usePointerDrag, type DragInfo } from './pointer'

/** What happens after she lets go. */
export type PlaceResult =
  /** It clicks into place (springy glide + snap sound). Move it into the slot in your state. */
  | 'snap'
  /** It stays where you put it next (soft plop). For "place anywhere". */
  | 'stay'
  /** It floats back to where it came from. */
  | 'home'
  /** It jumps back instantly, unseen (a tray "stamp" whose copy you just added where she let go). */
  | 'reset'

export interface Drop {
  /** The Target she dropped it on (or pulled it close enough to snap), or null. */
  target: string | null
  /** The piece's center where she let go, as fractions of the PlayArea (0..1). */
  x: number
  y: number
  /** The piece's center where she let go, in client px (use toLocal(el, clientX, clientY) for other boxes). */
  clientX: number
  clientY: number
}

type Rect = { x: number; y: number; w: number; h: number }

class Area {
  el: HTMLDivElement | null = null
  targets = new Map<string, HTMLElement>()
  /** Where a piece was when she let go, so its next position can glide from there (even after a remount). */
  flights = new Map<string, { from: Rect; kind: PlaceResult }>()
  hovered: string | null = null
  private listeners = new Set<() => void>()
  subscribe = (l: () => void) => {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }
  getHovered = () => this.hovered
  setHovered(id: string | null) {
    if (id === this.hovered) return
    this.hovered = id
    this.listeners.forEach((l) => l())
  }
}

const AreaContext = createContext<Area | null>(null)

/** The box that pieces and targets live in. Drop positions are reported as fractions of it. */
export function PlayArea({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const area = useRef<Area>(null)
  area.current ??= new Area()
  return (
    <AreaContext.Provider value={area.current}>
      <div
        ref={(el) => {
          area.current!.el = el
        }}
        style={{ position: 'relative', ...style }}
      >
        {children}
      </div>
    </AreaContext.Provider>
  )
}

export interface TargetProps {
  id: string
  children?: ReactNode
  style?: CSSProperties
  /** Pulse to show her where it goes (turn on after a wrong try). */
  hint?: boolean
  /** Glow while a piece hovers over it. Default true. */
  glow?: boolean
}

/** A spot a Piece can go: a puzzle slot, a basket, a unicorn's mouth, a pizza. */
export function Target({ id, children, style, hint, glow = true }: TargetProps) {
  const area = useContext(AreaContext)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!area || !ref.current) return
    area.targets.set(id, ref.current)
    return () => {
      if (area.targets.get(id) === ref.current) area.targets.delete(id)
    }
  }, [area, id])
  const hovered = useSyncExternalStore(area?.subscribe ?? noopSubscribe, area?.getHovered ?? nothing) === id
  return (
    <motion.div
      ref={ref}
      data-target={id}
      animate={hint ? { scale: [1, 1.06, 1], boxShadow: ['0 0 0 0px rgba(255,200,61,0)', '0 0 0 10px rgba(255,200,61,.85)', '0 0 0 0px rgba(255,200,61,0)'] } : { scale: glow && hovered ? 1.04 : 1, boxShadow: glow && hovered ? '0 0 0 6px rgba(255,255,255,.9)' : '0 0 0 0px rgba(255,255,255,0)' }}
      transition={hint ? { duration: 1.1, repeat: Infinity } : { duration: 0.15 }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

const noopSubscribe = () => () => {}
const nothing = () => null

export interface PieceProps {
  children: ReactNode
  /**
   * Stable id. Needed when the piece moves to a different parent after a drop (tray → board), so the new copy
   * glides from where she let go. Defaults to an internal id.
   */
  id?: string
  /** Target id(s) this piece belongs to. It is pulled toward them when close and counts as dropped within `snapRadius`. */
  snapTo?: string | string[]
  /** How close (px, piece center to target center) counts as "in". Default 70. */
  snapRadius?: number
  /** She let go. Return what happens next. Default: 'snap' on a target, otherwise 'home'. */
  onPlace?: (drop: Drop) => PlaceResult | void
  /** A tap without dragging (an easier alternative: show a hint, or place it for her). */
  onTap?: () => void
  onPickUp?: () => void
  disabled?: boolean
  /** How much it grows while held. Default 1.12. */
  lift?: number
  /** Accessible name (also makes it easy to find in tests). */
  label?: string
  style?: CSSProperties
}

let nextPieceId = 0

/** Something Kaylee can pick up. Put your picture/emoji/SVG inside. */
export function Piece({ children, id, snapTo, snapRadius = 70, onPlace, onTap, onPickUp, disabled, lift = 1.12, label, style }: PieceProps) {
  const area = useContext(AreaContext)
  const ref = useRef<HTMLDivElement>(null)
  const autoId = useRef<string>(null)
  autoId.current ??= `piece-${nextPieceId++}`
  const key = id ?? autoId.current
  const offset = useRef({ x: 0, y: 0 })

  const candidates = () => {
    if (!area) return []
    const ids = snapTo === undefined ? [...area.targets.keys()] : Array.isArray(snapTo) ? snapTo : [snapTo]
    return ids.flatMap((t) => {
      const el = area.targets.get(t)
      return el ? [[t, el] as const] : []
    })
  }

  /** The best target for this finger position (+ how far the piece's center is from it). */
  const findTarget = (info: DragInfo, center: { x: number; y: number }) => {
    let best: { id: string; el: HTMLElement; d: number } | null = null
    for (const [t, el] of candidates()) {
      const r = el.getBoundingClientRect()
      const inside = info.x >= r.left && info.x <= r.right && info.y >= r.top && info.y <= r.bottom
      const d = distance(center, centerOf(el))
      const ok = inside || (snapTo !== undefined && d <= snapRadius)
      if (ok && (!best || d < best.d)) best = { id: t, el, d }
    }
    return best
  }

  const pieceCenter = (info: DragInfo) => {
    const el = ref.current!
    const r = el.getBoundingClientRect()
    // Center of the piece at its home spot, plus how far her finger moved.
    return { x: r.left + r.width / 2 - offset.current.x + info.dx, y: r.top + r.height / 2 - offset.current.y + info.dy }
  }

  const place = (dx: number, dy: number, scale: number) => {
    offset.current = { x: dx, y: dy }
    ref.current!.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`
  }

  usePointerDrag(ref, {
    disabled,
    onTap: () => onTap?.(),
    onStart: () => {
      const el = ref.current!
      el.style.transition = 'none'
      el.style.zIndex = '1000'
      el.style.filter = 'drop-shadow(0 12px 10px rgba(43,35,48,.25))'
      sounds.pickup()
      onPickUp?.()
    },
    onMove: (info) => {
      const center = pieceCenter(info)
      const hit = findTarget(info, center)
      area?.setHovered(hit?.id ?? null)
      let { dx, dy } = info
      // A little magnetic pull toward the slot it belongs in, so it feels like it wants to go there.
      if (hit && snapTo !== undefined && hit.d <= snapRadius) {
        const c = centerOf(hit.el)
        const pull = 0.35 * (1 - hit.d / snapRadius)
        dx += (c.x - center.x) * pull
        dy += (c.y - center.y) * pull
      }
      place(dx, dy, lift)
    },
    onEnd: (info) => {
      const el = ref.current!
      area?.setHovered(null)
      const center = pieceCenter(info)
      const hit = findTarget(info, center)
      const local = area?.el ? toLocal(area.el, center.x, center.y) : { x: 0, y: 0 }
      const drop: Drop = { target: hit?.id ?? null, x: local.x, y: local.y, clientX: center.x, clientY: center.y }
      const result = onPlace?.(drop) || (hit ? 'snap' : 'home')
      if (result === 'snap') sounds.snap()
      else if (result === 'stay') sounds.place()
      const r = el.getBoundingClientRect()
      const from = { x: r.left, y: r.top, w: r.width, h: r.height }
      if (area) area.flights.set(key, { from, kind: result })
      // If nothing re-renders this piece (it didn't move), glide it home from here.
      requestAnimationFrame(() => land())
    },
    onCancel: () => {
      area?.setHovered(null)
      if (area) area.flights.delete(key)
      settle('home')
    },
  })

  /** Animate from where she let go (a stored rect) to wherever the piece is laid out now. */
  const land = () => {
    const el = ref.current
    const flight = area?.flights.get(key)
    if (!flight) return
    area!.flights.delete(key)
    if (!el) return
    el.style.transition = 'none'
    el.style.transform = 'none'
    offset.current = { x: 0, y: 0 }
    if (flight.kind === 'reset') return settle('reset')
    const r = el.getBoundingClientRect()
    const dx = flight.from.x + flight.from.w / 2 - (r.left + r.width / 2)
    const dy = flight.from.y + flight.from.h / 2 - (r.top + r.height / 2)
    const s = r.width ? flight.from.w / r.width : 1
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`
    void el.offsetWidth // commit the start position before animating
    settle(flight.kind)
  }

  const settle = (kind: PlaceResult) => {
    const el = ref.current
    if (!el) return
    offset.current = { x: 0, y: 0 }
    el.style.filter = ''
    el.style.transition =
      kind === 'reset' ? 'none' : kind === 'snap' ? 'transform .35s cubic-bezier(.3,1.6,.5,1)' : kind === 'stay' ? 'transform .18s ease-out' : 'transform .4s cubic-bezier(.3,1.3,.5,1)'
    el.style.transform = 'translate(0px, 0px) scale(1)'
    const done = () => {
      if (ref.current) ref.current.style.zIndex = ''
    }
    if (kind === 'reset') done()
    else setTimeout(done, 400)
  }

  // After every render (and on mount), glide from where she let go, if this piece was just dropped.
  useLayoutEffect(() => {
    if (area?.flights.has(key)) land()
  })

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      data-piece={key}
      style={{ position: 'relative', cursor: disabled ? 'default' : 'grab', touchAction: 'none', willChange: 'transform', ...style }}
    >
      {children}
    </div>
  )
}

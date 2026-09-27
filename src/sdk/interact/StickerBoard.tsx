// Place-anywhere play: a tray of toppings/stickers/decorations she can drag onto a surface as many times as she
// likes (pizza, cake, sundae, Christmas tree, sticker scene...). Placed things can be moved again, and dragging one
// off the surface takes it away. The tray sits beside the surface in landscape and below it in portrait.
//
//   const [items, setItems] = useState<Placed[]>([])
//   <StickerBoard
//     surface={<img src={pizza} />} shape="circle"
//     stickers={[{ kind: 'pepperoni', content: <img src={pepperoni} />, say: 'Pepperoni!' }]}
//     items={items} onChange={setItems}
//   />
//   countByKind(items).pepperoni   // "Put 3 pepperoni on the pizza!"
//
// Positions are fractions of the surface (0..1), so a finished pizza looks the same after the iPad rotates.
import { motion } from 'motion/react'
import { useRef, type CSSProperties, type ReactNode } from 'react'
import { useElementSize } from '../hooks'
import { say, type Line } from '../speech'
import { sounds } from '../sounds'
import { toLocal } from './pointer'
import { Piece, PlayArea, Target } from './PlayArea'

export interface Sticker {
  kind: string
  /** What she sees in the tray and on the surface (an <img>, emoji or SVG). */
  content: ReactNode
  /** Size on the surface, as a fraction of the surface width. Default 0.16. */
  size?: number
  /** Said when she picks it up (e.g. its name). Add it to voice-lines.json. */
  say?: Line
}

export interface Placed {
  id: string
  kind: string
  /** Center, as fractions of the surface. */
  x: number
  y: number
  /** Degrees, so repeated toppings don't look stamped. */
  rot: number
}

export interface StickerBoardProps {
  stickers: Sticker[]
  items: Placed[]
  onChange: (items: Placed[]) => void
  /** The thing being decorated (a pizza picture, a cake). It fills a square. */
  surface: ReactNode
  /** Where things are allowed to land. 'circle' fits pizzas and plates. Default 'rect'. */
  shape?: 'circle' | 'rect'
  /** Most things allowed on the surface. Extra drops float back. */
  max?: number
  /** Called when a drop lands (after onChange), e.g. to react with a puppet. */
  onPlace?: (item: Placed) => void
  /** A drop missed the surface or it's full (she gets a gentle oops). */
  onMiss?: () => void
  style?: CSSProperties
}

/** How many of each kind are on the surface: `countByKind(items).mushroom`. */
export function countByKind(items: Placed[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const it of items) counts[it.kind] = (counts[it.kind] ?? 0) + 1
  return counts
}

let nextId = 0

export function StickerBoard({ stickers, items, onChange, surface, shape = 'rect', max, onPlace, onMiss, style }: StickerBoardProps) {
  const box = useRef<HTMLDivElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const { width: w, height: h } = useElementSize(box)
  const landscape = w > h * 1.05
  const byKind = new Map(stickers.map((s) => [s.kind, s]))

  // The surface is a square as big as fits next to (or above) the tray.
  const tray = Math.max(112, Math.min(150, (landscape ? w : h) * 0.18))
  const side = Math.max(0, Math.min(landscape ? w - tray - 24 : w, landscape ? h : h - tray - 24))
  // One row/column of tray buttons, shrinking (never under 88px) to fit them all.
  const cell = Math.max(88, Math.min(120, tray - 24, ((landscape ? h : w) - 24 - 12 * (stickers.length - 1)) / stickers.length))

  /** Where the piece's center landed on the surface, if it's allowed there. */
  const landing = (clientX: number, clientY: number, size: number) => {
    if (!surfaceRef.current) return null
    const p = toLocal(surfaceRef.current, clientX, clientY)
    const r = 0.5 - size / 3 // keep most of the sticker on the surface
    const inside = shape === 'circle' ? Math.hypot(p.x - 0.5, p.y - 0.5) <= r : p.x >= 0.02 && p.x <= 0.98 && p.y >= 0.02 && p.y <= 0.98
    return inside ? p : null
  }

  const miss = () => {
    sounds.oops()
    onMiss?.()
  }

  return (
    <div
      ref={box}
      style={{ width: '100%', height: '100%', minHeight: 0, display: 'flex', flexDirection: landscape ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', gap: 24, ...style }}
    >
      <PlayArea style={{ display: 'contents' }}>
        <Target id="surface" glow={false} style={{ width: side, height: side, flex: 'none', position: 'relative' }}>
          <div ref={surfaceRef} style={{ position: 'absolute', inset: 0 }}>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{surface}</div>
            {items.map((it) => {
              const st = byKind.get(it.kind)
              if (!st) return null
              const size = (st.size ?? 0.16) * side
              return (
                <Piece
                  key={it.id}
                  id={it.id}
                  label={`${it.kind} on the surface`}
                  onPlace={(d) => {
                    const p = landing(d.clientX, d.clientY, st.size ?? 0.16)
                    if (p) {
                      onChange(items.map((o) => (o.id === it.id ? { ...o, x: p.x, y: p.y } : o)))
                      return 'stay'
                    }
                    // Dragged off the surface: take it away.
                    sounds.whoosh()
                    onChange(items.filter((o) => o.id !== it.id))
                    return 'reset'
                  }}
                  style={{ position: 'absolute', left: it.x * side - size / 2, top: it.y * side - size / 2, width: size, height: size }}
                >
                  <motion.div
                    initial={{ scale: 1.35 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                    style={{ width: '100%', height: '100%', rotate: it.rot, display: 'grid', placeItems: 'center', fontSize: size * 0.8, lineHeight: 1 }}
                  >
                    {st.content}
                  </motion.div>
                </Piece>
              )
            })}
          </div>
        </Target>

        <div
          style={{
            flex: 'none',
            display: 'flex',
            flexDirection: landscape ? 'column' : 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            [landscape ? 'width' : 'height']: tray,
            [landscape ? 'maxHeight' : 'maxWidth']: '100%',
            [landscape ? 'overflowY' : 'overflowX']: 'auto',
            background: 'rgba(255,255,255,.7)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
          }}
        >
          {stickers.map((st) => {
            return (
              <Piece
                key={st.kind}
                label={`${st.kind} in the tray`}
                lift={Math.max(1.1, ((st.size ?? 0.16) * side) / cell)}
                onPickUp={() => st.say && void say(st.say)}
                onTap={() => {
                  sounds.pop()
                  if (st.say) void say(st.say)
                }}
                onPlace={(d) => {
                  const p = landing(d.clientX, d.clientY, st.size ?? 0.16)
                  if (!p) {
                    if (d.target === 'surface') miss()
                    return 'home'
                  }
                  if (max !== undefined && items.length >= max) {
                    miss()
                    return 'home'
                  }
                  const item: Placed = { id: `placed-${nextId++}`, kind: st.kind, x: p.x, y: p.y, rot: Math.round(Math.random() * 50 - 25) }
                  onChange([...items, item])
                  onPlace?.(item)
                  return 'reset'
                }}
                style={{ flex: 'none', width: cell, height: cell, borderRadius: 24, background: '#fff', boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center', fontSize: cell * 0.6, lineHeight: 1 }}
              >
                {st.content}
              </Piece>
            )
          })}
        </div>
      </PlayArea>
    </div>
  )
}

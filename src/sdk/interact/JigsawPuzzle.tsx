// A real jigsaw from any picture: classic tab-and-blank pieces cut with SVG, a faint picture on the board to
// match against, pieces waiting in a tray (beside the board in landscape, below it in portrait), and a click when
// a piece snaps into place. No failing: a wrong spot floats the piece back and lights up where it goes.
//
//   <JigsawPuzzle img={scene} rows={2} cols={3} onSnap={(done, total) => setProgress(done, total)} onDone={next} />
//
// Start easy (2×2) and end a little harder (3×3). It doesn't speak; say things from onSnap / onMiss / onDone.
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import { burst } from '../confetti'
import { useElementSize } from '../hooks'
import { sounds } from '../sounds'
import { Piece, PlayArea, Target } from './PlayArea'

export interface JigsawPuzzleProps {
  /** The picture (an imported .webp). Scenes without tiny details work best. */
  img: string
  rows: number
  cols: number
  /** Picture width / height. Measured from the image when left out. */
  aspect?: number
  /** Same seed = same piece shapes and tray order. */
  seed?: number
  /** A piece clicked into place. */
  onSnap?: (done: number, total: number) => void
  /** She dropped a piece on the wrong spot (it floats back and its spot lights up). */
  onMiss?: () => void
  /** Every piece is in. */
  onDone: () => void
  style?: CSSProperties
}

export function JigsawPuzzle({ img, rows, cols, aspect: aspectProp, seed = 7, onSnap, onMiss, onDone, style }: JigsawPuzzleProps) {
  const box = useRef<HTMLDivElement>(null)
  const { width: w, height: h } = useElementSize(box)
  const aspect = useImageAspect(img, aspectProp)
  const total = rows * cols
  const [placed, setPlaced] = useState<Set<number>>(() => new Set())
  const [hintFor, setHintFor] = useState<number | null>(null)
  const uid = useId().replace(/:/g, '')

  const { edges, order } = useMemo(() => cut(rows, cols, seed), [rows, cols, seed])
  const layout = w && h && aspect ? plan(w, h, aspect, rows, cols) : null
  const complete = placed.size === total

  const drop = (i: number, onBoard: boolean, onSlot: boolean) => {
    if (onSlot) {
      const next = new Set(placed).add(i)
      setPlaced(next)
      setHintFor((hint) => (hint === i ? null : hint))
      onSnap?.(next.size, total)
      if (next.size === total) {
        setTimeout(() => {
          sounds.sparkle()
          const r = box.current?.getBoundingClientRect()
          if (r) burst(r.left + r.width / 2, r.top + r.height / 2)
        }, 350)
        setTimeout(onDone, 1300)
      }
      return 'snap' as const
    }
    if (onBoard) {
      sounds.oops()
      setHintFor(i)
      onMiss?.()
    }
    return 'home' as const
  }

  return (
    <div ref={box} style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0, ...style }}>
      {layout && aspect && (
        <PlayArea style={{ position: 'absolute', inset: 0 }}>
          {/* The board: a faint picture and dashed outlines of every piece. */}
          <div
            style={{
              position: 'absolute',
              left: layout.board.x,
              top: layout.board.y,
              width: layout.board.w,
              height: layout.board.h,
              borderRadius: 12,
              background: 'rgba(255,255,255,.55)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <img src={img} alt="" style={{ width: '100%', height: '100%', opacity: complete ? 0 : 0.22, borderRadius: 12, transition: 'opacity .6s', display: 'block' }} />
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: complete ? 0 : 1, transition: 'opacity .6s' }}>
              {order.map((i) => (
                <path
                  key={i}
                  d={piecePath(layout.cw, layout.ch, edges[i], (i % cols) * layout.cw, Math.floor(i / cols) * layout.ch)}
                  fill="none"
                  stroke="rgba(107,93,115,.45)"
                  strokeWidth={2}
                  strokeDasharray="7 6"
                />
              ))}
            </svg>
            {order.map((i) => (
              <Target
                key={i}
                id={`slot-${i}`}
                hint={hintFor === i}
                glow={false}
                style={{ position: 'absolute', left: (i % cols) * layout.cw, top: Math.floor(i / cols) * layout.ch, width: layout.cw, height: layout.ch, borderRadius: 10 }}
              />
            ))}
          </div>

          {order.map((i, slot) => {
            const col = i % cols
            const row = Math.floor(i / cols)
            const done = placed.has(i)
            const p = layout.pad
            const s = done ? 1 : layout.trayScale
            const cx = done ? layout.board.x + (col + 0.5) * layout.cw : layout.tray[slot].x
            const cy = done ? layout.board.y + (row + 0.5) * layout.ch : layout.tray[slot].y
            const pw = (layout.cw + 2 * p) * s
            const ph = (layout.ch + 2 * p) * s
            return (
              <Piece
                key={i}
                id={`${uid}-${i}`}
                label={`Puzzle piece ${i + 1}${done ? ' (in place)' : ''}`}
                snapTo={`slot-${i}`}
                snapRadius={Math.max(50, Math.min(layout.cw, layout.ch) * 0.45)}
                disabled={done}
                lift={1.04 / s}
                onTap={() => {
                  sounds.pop()
                  setHintFor(i)
                }}
                onPlace={(d) => {
                  const x = d.x * w
                  const y = d.y * h
                  const b = layout.board
                  const onBoard = x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h
                  return drop(i, onBoard, d.target === `slot-${i}`)
                }}
                style={{ position: 'absolute', left: cx - pw / 2, top: cy - ph / 2, width: pw, height: ph, zIndex: done ? 1 : 2 }}
              >
                <svg viewBox={`${-p} ${-p} ${layout.cw + 2 * p} ${layout.ch + 2 * p}`} width="100%" height="100%" style={{ display: 'block', overflow: 'visible', filter: done ? 'none' : 'drop-shadow(0 3px 3px rgba(43,35,48,.3))' }}>
                  <defs>
                    <clipPath id={`${uid}-clip-${i}`}>
                      <path d={piecePath(layout.cw, layout.ch, edges[i])} />
                    </clipPath>
                  </defs>
                  <image
                    href={img}
                    x={-col * layout.cw}
                    y={-row * layout.ch}
                    width={layout.board.w}
                    height={layout.board.h}
                    preserveAspectRatio="none"
                    clipPath={`url(#${uid}-clip-${i})`}
                  />
                  <path d={piecePath(layout.cw, layout.ch, edges[i])} fill="none" stroke="rgba(255,255,255,.95)" strokeWidth={done ? 1 : 3} />
                </svg>
              </Piece>
            )
          })}
        </PlayArea>
      )}
    </div>
  )
}

/** Picture width / height, measured from the image unless given. */
function useImageAspect(src: string, given?: number) {
  const [measured, setMeasured] = useState<number>()
  useEffect(() => {
    if (given) return
    const im = new Image()
    im.onload = () => setMeasured(im.naturalWidth / im.naturalHeight)
    im.src = src
  }, [src, given])
  return given ?? measured
}

/** Edge directions for every piece: [top, right, bottom, left], 1 = tab out, -1 = blank in, 0 = flat border. */
function cut(rows: number, cols: number, seed: number) {
  const rand = mulberry32(seed * 7919 + rows * 31 + cols)
  const flip = () => (rand() < 0.5 ? 1 : -1)
  const across = Array.from({ length: rows - 1 }, () => Array.from({ length: cols }, flip)) // below row r
  const down = Array.from({ length: rows }, () => Array.from({ length: cols - 1 }, flip)) // right of col c
  const edges = Array.from({ length: rows * cols }, (_, i) => {
    const r = Math.floor(i / cols)
    const c = i % cols
    return [r > 0 ? -across[r - 1][c] : 0, c < cols - 1 ? down[r][c] : 0, r < rows - 1 ? across[r][c] : 0, c > 0 ? -down[r][c - 1] : 0] as const
  })
  const order = Array.from({ length: rows * cols }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return { edges, order }
}

// One edge from (0,0) to (1,0) with a round tab bulging toward -y (outward). u runs along the edge, v across it.
const TAB: [number, number][][] = [
  [[0.43, 0], [0.43, -0.05], [0.4, -0.08]],
  [[0.33, -0.13], [0.36, -0.25], [0.5, -0.25]],
  [[0.64, -0.25], [0.67, -0.13], [0.6, -0.08]],
  [[0.57, -0.05], [0.57, 0], [0.6, 0]],
]

/** SVG path of one piece (clockwise), with its cell at (ox, oy). */
function piecePath(w: number, h: number, edges: readonly number[], ox = 0, oy = 0) {
  const k = Math.min(w, h)
  const corners = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ]
  const f = (n: number) => n.toFixed(1)
  let d = `M${f(ox)},${f(oy)}`
  for (let side = 0; side < 4; side++) {
    const [ax, ay] = corners[side]
    const [bx, by] = corners[(side + 1) % 4]
    const ex = bx - ax
    const ey = by - ay
    const len = Math.hypot(ex, ey)
    const nx = ey / len // outward normal for a clockwise walk (y down)
    const ny = -ex / len
    const sign = edges[side]
    const pt = ([u, v]: [number, number]) => `${f(ox + ax + u * ex - v * k * sign * nx)},${f(oy + ay + u * ey - v * k * sign * ny)}`
    if (sign) {
      d += ` L${pt([0.4, 0])}`
      for (const c of TAB) d += ` C${pt(c[0])} ${pt(c[1])} ${pt(c[2])}`
    }
    d += ` L${f(ox + bx)},${f(oy + by)}`
  }
  return d + 'Z'
}

/** Where the board and the tray go for this container size. */
function plan(w: number, h: number, aspect: number, rows: number, cols: number) {
  const margin = 12
  const gap = 20
  const landscape = w > h * 1.05
  let bw: number
  let bh: number
  if (landscape) {
    bh = Math.min(h - 2 * margin, ((w - 2 * margin) * 0.6) / aspect)
    bw = bh * aspect
  } else {
    bw = Math.min(w - 2 * margin, (h - 2 * margin) * 0.58 * aspect)
    bh = bw / aspect
  }
  const cw = bw / cols
  const ch = bh / rows
  const pad = Math.min(cw, ch) * 0.28
  const board = landscape ? { x: margin + 6, y: (h - bh) / 2, w: bw, h: bh } : { x: (w - bw) / 2, y: margin, w: bw, h: bh }
  const area = landscape
    ? { x: board.x + bw + gap, y: margin, w: w - (board.x + bw + gap) - margin, h: h - 2 * margin }
    : { x: margin, y: board.y + bh + gap, w: w - 2 * margin, h: h - (board.y + bh + gap) - margin }

  // Pick the grid that shows the tray pieces biggest (never bigger than on the board).
  const n = rows * cols
  const pw = cw + 2 * pad
  const ph = ch + 2 * pad
  let best = { c: 1, r: n, s: 0 }
  for (let c = 1; c <= n; c++) {
    const r = Math.ceil(n / c)
    const s = Math.min(1, area.w / (c * pw * 1.05), area.h / (r * ph * 1.05))
    if (s > best.s) best = { c, r, s }
  }
  const tray = Array.from({ length: n }, (_, i) => {
    const col = i % best.c
    const row = Math.floor(i / best.c)
    return { x: area.x + ((col + 0.5) * area.w) / best.c, y: area.y + ((row + 0.5) * area.h) / best.r }
  })
  return { board, cw, ch, pad, tray, trayScale: best.s }
}

function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

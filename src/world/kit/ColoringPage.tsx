import { motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { sounds } from '../../sdk'

export const CRAYONS = ['#FF4F9A', '#FF8FB8', '#B9A6F5', '#7FB2FF', '#8FE3C8', '#5CBF6B', '#FBEA9A', '#FFB347', '#E0603E', '#A8764F', '#FFF7F0', '#6B5D73']

const DARK = 90 // pixels darker than this (0-255 brightness) are outlines
const TOLERANCE = 120 // how different a pixel can be from the tapped color and still be filled

const brightness = (d: Uint8ClampedArray, i: number) => (d[i] * 3 + d[i + 1] * 6 + d[i + 2]) / 10

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Paint-bucket fill from (x, y). Anti-aliased outline pixels next to the fill are tinted too. Returns false if nothing changed. */
function floodFill(img: ImageData, x: number, y: number, color: string): boolean {
  const { data: d, width: w, height: h } = img
  const start = (y * w + x) * 4
  if (brightness(d, start) < DARK) return false
  const [r, g, b] = hexToRgb(color)
  const [sr, sg, sb] = [d[start], d[start + 1], d[start + 2]]
  if (Math.abs(sr - r) + Math.abs(sg - g) + Math.abs(sb - b) < 6) return false
  const filled = new Uint8Array(w * h)
  const matches = (p: number) => {
    const i = p * 4
    return !filled[p] && brightness(d, i) >= DARK && Math.abs(d[i] - sr) + Math.abs(d[i + 1] - sg) + Math.abs(d[i + 2] - sb) <= TOLERANCE
  }
  const stack = [y * w + x]
  while (stack.length) {
    const p = stack.pop()!
    if (!matches(p)) continue
    filled[p] = 1
    const i = p * 4
    d[i] = r
    d[i + 1] = g
    d[i + 2] = b
    const px = p % w
    if (px > 0) stack.push(p - 1)
    if (px < w - 1) stack.push(p + 1)
    if (p >= w) stack.push(p - w)
    if (p < w * (h - 1)) stack.push(p + w)
  }
  // Soften the edge: tint the grey anti-aliased pixels that touch the fill.
  for (let p = 0; p < w * h; p++) {
    if (filled[p]) continue
    const touches = (p % w > 0 && filled[p - 1]) || (p % w < w - 1 && filled[p + 1]) || (p >= w && filled[p - w]) || (p < w * (h - 1) && filled[p + w])
    if (!touches) continue
    const i = p * 4
    const k = brightness(d, i) / 255
    d[i] = r * k
    d[i + 1] = g * k
    d[i + 2] = b * k
  }
  return true
}

// Palette geometry, in px. A crayon is `t` wide and `t * CRAYON_H` tall.
const GAP = 10 // between crayons
const PAD = 8 // inside the palette tray
const SPLIT = 14 // between the picture and the palette
const FRAME = 6 // white border around the picture
const CRAYON_H = 0.7
const ACTION_H = 0.8 // the action row (e.g. Send), relative to `t`

type Layout = { side: boolean; cols: number; t: number; w: number; h: number }

/** Empty cells at the end of the last crayon row; 2 or more fit the action there instead of on a new row. */
const leftover = (cols: number, items: number) => (cols - (items % cols)) % cols
const sharesRow = (cols: number, items: number) => leftover(cols, items) >= 2

/**
 * Works out where the palette goes (under or beside the picture, how many columns) and how big the crayons and the
 * picture are, from the space actually available. Picks whatever makes the picture biggest while keeping the crayons
 * big enough for small fingers, so any page fits any screen: iPhone, iPad, desktop, a Stage with a prompt, etc.
 */
function planLayout(W: number, H: number, ratio: number, items: number, hasAction: boolean, tMax: number): Layout {
  const tMin = tMax * 0.7
  const trayW = (cols: number, t: number) => cols * t + (cols - 1) * GAP + 2 * PAD
  const trayH = (cols: number, t: number) => {
    const rows = Math.ceil(items / cols)
    const action = !hasAction ? 0 : sharesRow(cols, items) ? t * (ACTION_H - CRAYON_H) : t * ACTION_H + GAP
    return rows * t * CRAYON_H + (rows - 1) * GAP + 2 * PAD + action
  }
  const options: Layout[] = []
  const add = (side: boolean, cols: number, t: number) => {
    t = Math.min(tMax, Math.floor(t))
    const boxW = side ? W - trayW(cols, t) - SPLIT : W
    const boxH = side ? H : H - trayH(cols, t) - SPLIT
    const w = Math.floor(Math.min(boxW - 2 * FRAME, (boxH - 2 * FRAME) * ratio))
    if (t > 0 && w > 0) options.push({ side, cols, t, w, h: Math.floor(w / ratio) })
  }
  // Under the picture: 1-4 rows, crayons as wide as the screen allows.
  for (let rows = 1; rows <= 4; rows++) {
    const cols = Math.ceil(items / rows)
    add(false, cols, (W - 2 * PAD - (cols - 1) * GAP) / cols)
  }
  // Beside the picture: 2-4 columns, crayons as tall as the screen allows.
  for (let cols = 2; cols <= 4; cols++) {
    const rows = Math.ceil(items / cols)
    add(true, cols, (H - (rows - 1) * GAP - 2 * PAD - (hasAction ? GAP : 0)) / (rows * CRAYON_H + (hasAction ? ACTION_H : 0)))
  }
  const score = (o: Layout) => o.w * o.h * Math.sqrt(o.t / tMax)
  const ok = options.filter((o) => o.t >= tMin)
  if (ok.length) return ok.reduce((a, b) => (score(b) > score(a) ? b : a))
  return options.reduce((a, b) => (b.t > a.t ? b : a), { side: false, cols: items, t: 0, w: 0, h: 0 })
}

/**
 * A coloring-book page: pick a crayon, tap an area to fill it. There are no wrong colors.
 * `onFill(count)` reports how many areas she has painted.
 * It fills whatever box it is given (give it a size, e.g. `flex: 1`) and arranges itself to fit.
 * `action` (e.g. a Send button) sits at the end of the palette, so it never covers the picture or the colors.
 */
export function ColoringPage({ src, onFill, action }: { src: string; onFill?: (count: number) => void; action?: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0, target: 96 })
  const canvas = useRef<HTMLCanvasElement>(null)
  const history = useRef<ImageData[]>([])
  const fills = useRef(0)
  const [color, setColor] = useState(CRAYONS[0])
  const [canUndo, setCanUndo] = useState(false)
  const [ratio, setRatio] = useState(1.5)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const c = canvas.current
      if (!c) return
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      setRatio(img.naturalWidth / img.naturalHeight)
      const ctx = c.getContext('2d', { willReadFrequently: true })!
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.drawImage(img, 0, 0)
      history.current = []
      fills.current = 0
      setCanUndo(false)
    }
    img.src = src
  }, [src])

  const paint = (clientX: number, clientY: number) => {
    const c = canvas.current
    if (!c) return
    const rect = c.getBoundingClientRect()
    const x = Math.floor(((clientX - rect.left) / rect.width) * c.width)
    const y = Math.floor(((clientY - rect.top) / rect.height) * c.height)
    if (x < 0 || y < 0 || x >= c.width || y >= c.height) return
    const ctx = c.getContext('2d', { willReadFrequently: true })!
    const img = ctx.getImageData(0, 0, c.width, c.height)
    const before = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height)
    if (!floodFill(img, x, y, color)) return
    history.current = [...history.current.slice(-9), before]
    ctx.putImageData(img, 0, 0)
    setCanUndo(true)
    fills.current += 1
    sounds.note(fills.current % 8)
    onFill?.(fills.current)
  }

  const undo = () => {
    const prev = history.current.pop()
    const c = canvas.current
    if (!prev || !c) return
    c.getContext('2d')!.putImageData(prev, 0, 0)
    setCanUndo(history.current.length > 0)
    sounds.whoosh()
  }

  // Measure the space we were given; re-plan whenever it changes (rotation, resize, a prompt appearing).
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      const target = parseFloat(getComputedStyle(el).getPropertyValue('--target')) || 96
      setSize({ w: el.clientWidth, h: el.clientHeight, target })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // The action's space is reserved even while `action` is still `false`, so the picture doesn't jump when it appears.
  const items = CRAYONS.length + 1 // + undo
  const layout = size.w ? planLayout(size.w, size.h, ratio, items, action !== undefined, size.target) : null
  const actionColumn = layout && sharesRow(layout.cols, items) ? `${-1 - leftover(layout.cols, items)} / -1` : '1 / -1'

  return (
    <div ref={box} style={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: layout?.side ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', gap: SPLIT, visibility: layout ? 'visible' : 'hidden' }}>
      <canvas
        ref={canvas}
        aria-label="coloring page"
        onPointerDown={(e) => paint(e.clientX, e.clientY)}
        style={{ flexShrink: 0, width: (layout?.w ?? 0) + 2 * FRAME, height: (layout?.h ?? 0) + 2 * FRAME, background: '#fff', borderRadius: 24, boxShadow: 'var(--shadow)', border: `${FRAME}px solid #fff`, touchAction: 'none' }}
      />
      <div
        style={{ ['--target' as string]: `${layout?.t ?? 0}px`, display: 'grid', gridTemplateColumns: `repeat(${layout?.cols ?? 1}, var(--target))`, gap: GAP, flexShrink: 0, padding: PAD, background: 'rgba(255,255,255,0.8)', borderRadius: 28 }}
      >
        {CRAYONS.map((c) => (
          <motion.button
            key={c}
            aria-label={`color ${c}`}
            whileTap={{ scale: 0.85 }}
            animate={{ scale: c === color ? 1.12 : 1, y: c === color ? -4 : 0 }}
            onClick={() => {
              setColor(c)
              sounds.pop()
            }}
            style={{ width: 'var(--target)', height: `calc(var(--target) * ${CRAYON_H})`, borderRadius: 999, background: c, border: c === color ? '6px solid var(--ink)' : '4px solid #fff', boxShadow: 'var(--shadow)' }}
          />
        ))}
        <motion.button
          aria-label="Undo"
          whileTap={{ scale: 0.85 }}
          onClick={undo}
          disabled={!canUndo}
          style={{ width: 'var(--target)', height: `calc(var(--target) * ${CRAYON_H})`, borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow)', fontSize: 'calc(var(--target) * 0.36)', opacity: canUndo ? 1 : 0.4 }}
        >
          ↩️
        </motion.button>
        {action !== undefined && (
          <div style={{ gridColumn: actionColumn, minHeight: `calc(var(--target) * ${ACTION_H})`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{action}</div>
        )}
      </div>
    </div>
  )
}

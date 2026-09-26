import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
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

/**
 * A coloring-book page: pick a crayon, tap an area to fill it. There are no wrong colors.
 * `onFill(count)` reports how many areas she has painted.
 */
export function ColoringPage({ src, onFill }: { src: string; onFill?: (count: number) => void }) {
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

  return (
    <div className="world-split" style={{ width: '100%', height: '100%', minHeight: 0, alignItems: 'center', justifyContent: 'center', gap: 'min(16px, 2vh)' }}>
      <div style={{ flex: 1, minWidth: 0, minHeight: 0, width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
        <canvas
          ref={canvas}
          aria-label="coloring page"
          onPointerDown={(e) => paint(e.clientX, e.clientY)}
          style={{ maxWidth: '100%', maxHeight: '100%', aspectRatio: String(ratio), width: '100%', height: 'auto', objectFit: 'contain', background: '#fff', borderRadius: 24, boxShadow: 'var(--shadow)', border: '6px solid #fff', touchAction: 'none' }}
        />
      </div>
      <div
        className="crayons"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, var(--target))', gridAutoFlow: 'row', gap: 10, justifyContent: 'center', maxWidth: '100%', flexShrink: 0, padding: 8, background: 'rgba(255,255,255,0.8)', borderRadius: 28 }}
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
            style={{ width: 'var(--target)', height: 'calc(var(--target) * 0.7)', borderRadius: 999, background: c, border: c === color ? '6px solid var(--ink)' : '4px solid #fff', boxShadow: 'var(--shadow)' }}
          />
        ))}
        <motion.button
          aria-label="Undo"
          whileTap={{ scale: 0.85 }}
          onClick={undo}
          disabled={!canUndo}
          style={{ width: 'var(--target)', height: 'calc(var(--target) * 0.7)', borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow)', fontSize: 'calc(var(--target) * 0.36)', opacity: canUndo ? 1 : 0.4 }}
        >
          ↩️
        </motion.button>
      </div>
    </div>
  )
}

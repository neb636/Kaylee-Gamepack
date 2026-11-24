// The flooded forest's scenery, all drawn here in the flat look of src/world/shelf/STYLE.md (no outlines; each material
// has a base, a shade and a light; the light comes from the top left). Nothing in this level is a generated picture.
// Long layers (the hazy canopies, the far trunks, the riverbed, the leaves overhead) are tiles that repeat sideways
// and slide at their own speed as the camera follows Rosa; the big trunks and their branches stand in the world.
import { forwardRef, memo, type CSSProperties, type ReactNode } from 'react'
import { BED, type TreeSpec, type View } from './world'

export const PINE = ['#3e9e78', '#2b7a5f', '#69c19a'] as const
export const LEAF = ['#73cf86', '#48a96c', '#aee8b7'] as const
export const WOOD = ['#c99266', '#a46e4b', '#e5b78f'] as const
export const INK = '#2b2330'
export const SKY = 'linear-gradient(#9fd4fa, #dff1ff 46%, #fff3df)'
/** The water behind everything, and the tint in front of what stands in it. */
export const DEEP = 'linear-gradient(#86ded9, #2a9bb0)'
export const TINT = 'linear-gradient(rgba(111,214,217,0.3), rgba(31,140,170,0.42))'

/** A repeatable random series (the same forest every time). */
function series(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const f = (n: number) => Math.round(n * 2) / 2

export interface Tile {
  url: string
  w: number
  h: number
}
const tile = (w: number, h: number, body: string): Tile => ({ w, h, url: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`)}")` })
const TW = 1600
/** Draws something at x and again one tile to each side, so it wraps across the seam. */
const wrap = (x: number, draw: (x: number) => string) => draw(x) + (x < 200 ? draw(x + TW) : x > TW - 200 ? draw(x - TW) : '')

/** A treeline: round crowns along the top of a band of colour. */
function treeline(h: number, top: number, fill: string, light: string | null, seed: number, step: number) {
  const r = series(seed)
  let a = `<rect y="${top + 24}" width="${TW}" height="${h - top - 24}" fill="${fill}"/>`
  let hi = ''
  for (let x = 0; x < TW; x += step * (0.55 + r() * 0.5)) {
    const rad = 34 + r() * 28
    const cy = top + (r() - 0.5) * 22
    a += wrap(x, (px) => `<circle cx="${f(px)}" cy="${f(cy)}" r="${f(rad)}" fill="${fill}"/>`)
    if (light && r() > 0.3) hi += wrap(x, (px) => `<circle cx="${f(px - rad * 0.28)}" cy="${f(cy - rad * 0.3)}" r="${f(rad * 0.42)}" fill="${light}" opacity="0.6"/>`)
  }
  return a + hi
}
/** Far away: two hazy treelines. Their bottoms sit on the waterline. */
export const FAR_CANOPY = tile(TW, 300, treeline(300, 60, '#cdebd9', null, 3, 52))
export const NEAR_CANOPY = tile(TW, 220, treeline(220, 52, '#9fd9b6', '#c7f3e4', 8, 58))

/** Thin far trunks, pale in the air and teal under the water (the tile starts 1000 above the waterline). */
export const FAR_TRUNKS = (() => {
  const r = series(5)
  let s = ''
  for (const x of [110, 420, 700, 1010, 1290, 1480]) {
    const w = 24 + r() * 22
    s += `<rect x="${x}" y="0" width="${f(w)}" height="1000" fill="#b9cfae"/><rect x="${f(x + w * 0.6)}" y="0" width="${f(w * 0.4)}" height="1000" fill="#a3bd9c"/>`
    s += `<path d="M${x} 1000L${f(x + w)} 1000L${f(x + w + 16)} ${1000 + BED}L${x - 16} ${1000 + BED}Z" fill="#59bcc4"/>`
  }
  return tile(TW, 1000 + BED, s)
})()

/** The sandy riverbed: a wavy top, lighter along the rim, with pebbles. */
export const RIVERBED = (() => {
  const r = series(11)
  let top = 'M0 300L0 18'
  for (let x = 0; x <= TW; x += 40) top += `L${x} ${f(18 + Math.sin((x / TW) * Math.PI * 6) * 9 + Math.sin((x / TW) * Math.PI * 14) * 4)}`
  let s = `<path d="${top}L${TW} 300Z" fill="#f5dba8"/>`
  let rim = ''
  for (let x = 0; x <= TW; x += 40) rim += `${x ? 'L' : 'M'}${x} ${f(24 + Math.sin((x / TW) * Math.PI * 6) * 9 + Math.sin((x / TW) * Math.PI * 14) * 4)}`
  s += `<path d="${rim}" fill="none" stroke="#fdeecc" stroke-width="7" stroke-linecap="round"/>`
  for (let i = 0; i < 26; i++) {
    const x = r() * TW
    const y = 60 + r() * 220
    const w = 10 + r() * 22
    s += r() > 0.45 ? `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(w * 0.5)}" fill="#e3bb7a" opacity="0.7"/>` : `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w * 0.8)}" ry="${f(w * 0.55)}" fill="#bcb6d6"/><ellipse cx="${f(x - w * 0.2)}" cy="${f(y - w * 0.16)}" rx="${f(w * 0.3)}" ry="${f(w * 0.16)}" fill="#dedaf0"/>`
  }
  return tile(TW, 300, s)
})()

/** The leaves overhead: a ceiling of round crowns with a scalloped lower edge and a few hanging vines. */
export const OVERHEAD = (() => {
  const H = 640
  const edge = H - 110
  const r = series(21)
  let shade = ''
  let base = `<rect width="${TW}" height="${edge - 8}" fill="${PINE[0]}"/>`
  let hi = ''
  let vines = ''
  for (let x = 0; x < TW; x += 46 * (0.6 + r() * 0.7)) {
    const rad = 36 + r() * 30
    const cy = edge - rad + 60 - r() * 70
    shade += wrap(x, (px) => `<circle cx="${f(px + 8)}" cy="${f(cy + 10)}" r="${f(rad)}" fill="${PINE[1]}"/>`)
    base += wrap(x, (px) => `<circle cx="${f(px)}" cy="${f(cy)}" r="${f(rad)}" fill="${PINE[0]}"/>`)
    if (r() > 0.4) hi += wrap(x, (px) => `<circle cx="${f(px - rad * 0.3)}" cy="${f(cy - rad * 0.25)}" r="${f(rad * 0.4)}" fill="${PINE[2]}" opacity="0.6"/>`)
  }
  for (let y = 60; y < edge - 120; y += 90) for (let x = (y % 180) / 2; x < TW; x += 150 + r() * 120) hi += `<circle cx="${f(x)}" cy="${f(y + r() * 40)}" r="${f(22 + r() * 22)}" fill="${PINE[2]}" opacity="0.28"/>`
  for (const [x, w, d] of [[240, 150, 96], [690, 110, 70], [1130, 180, 104], [1420, 90, 60]]) vines += `<path d="M${x} ${edge - 40}C${x} ${edge + d} ${x + w} ${edge + d} ${x + w} ${edge - 40}" fill="none" stroke="${LEAF[1]}" stroke-width="6" stroke-linecap="round"/><ellipse cx="${x + w * 0.3}" cy="${edge + d * 0.62}" rx="13" ry="6" fill="${LEAF[0]}" transform="rotate(30 ${x + w * 0.3} ${edge + d * 0.62})"/><ellipse cx="${x + w * 0.72}" cy="${edge + d * 0.6}" rx="13" ry="6" fill="${LEAF[0]}" transform="rotate(-30 ${x + w * 0.72} ${edge + d * 0.6})"/>`
  return tile(TW, H, vines + shade + base + hi)
})()

/** The water's surface: a soft bright line with a ripple in it. */
export const SURFACE = (() => {
  let d = ''
  for (let x = 0; x <= 400; x += 10) d += `${x ? 'L' : 'M'}${x} ${f(9 + Math.sin((x / 400) * Math.PI * 4) * 3.2)}`
  return tile(400, 30, `<path d="${d}L400 30L0 30Z" fill="#fff" opacity="0.16"/><path d="${d}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.92"/>`)
})()

/** A tile repeated across the screen at world height `y`; the game slides it with `slide()` every frame. */
export const Strip = forwardRef<HTMLDivElement, { tile: Tile; view: View; y: number; z?: number; style?: CSSProperties }>(function Strip({ tile: t, view, y, z, style }, ref) {
  const w = Math.round(t.w * view.scale)
  return (
    <div
      ref={ref}
      aria-hidden
      style={{ position: 'absolute', left: -w, top: Math.round((y - view.top) * view.scale), width: `calc(100% + ${w * 2}px)`, height: Math.ceil(t.h * view.scale) + 1, backgroundImage: t.url, backgroundSize: `${w}px 100%`, backgroundRepeat: 'repeat-x', pointerEvents: 'none', willChange: 'transform', zIndex: z, ...style }}
    />
  )
})
/** Slide a strip for the camera: `speed` 1 moves with the world, less is farther away. */
export function slide(el: HTMLDivElement | null, t: Tile, view: View, camX: number, speed: number, drift = 0) {
  if (!el) return
  const w = Math.round(t.w * view.scale)
  const x = (((camX * speed + drift) * view.scale) % w + w) % w
  el.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0)`
}

/** A drawing placed in the world: its viewBox is the world box it covers, so everything inside is in world units. */
export function Art({ x, y, w, h, z, children, style }: { x: number; y: number; w: number; h: number; z?: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox={`${x} ${y} ${w} ${h}`} style={{ position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'visible', pointerEvents: 'none', zIndex: z, ...style }}>
      {children}
    </svg>
  )
}

const leafPath = (L: number, W: number) => `M0 0C${f(L * 0.25)} ${-W} ${f(L * 0.8)} ${f(-W * 0.8)} ${L} 0C${f(L * 0.8)} ${f(W * 0.8)} ${f(L * 0.25)} ${W} 0 0Z`
/** A big jungle leaf from (x, y), `rot` degrees round from pointing right. */
export function BigLeaf({ x, y, len, rot, tone = PINE }: { x: number; y: number; len: number; rot: number; tone?: readonly string[] }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={leafPath(len, len * 0.22)} fill={tone[0]} />
      <path d={`M0 0C${len * 0.25} ${len * 0.22} ${len * 0.8} ${len * 0.176} ${len} 0L0 0Z`} fill={tone[1]} opacity="0.55" />
      <path d={`M3 0L${len * 0.9} 0`} stroke={tone[2]} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    </g>
  )
}

/** One big tree standing in the water: a trunk that flares into roots on the riverbed, and maybe a branch. */
export const Trunk = memo(function Trunk({ t, top }: { t: TreeSpec; top: number }) {
  const { x, w } = t
  const a = w * 0.4
  const b = w * 0.5
  const fl = w * 0.75
  const y1 = BED + 14
  const body = `M${x - a} ${top}L${x + a} ${top}L${x + b} ${y1 - 130}C${x + b} ${y1 - 40} ${x + b + fl * 0.5} ${y1 - 6} ${x + b + fl} ${y1}L${x - b - fl} ${y1}C${x - b - fl * 0.5} ${y1 - 6} ${x - b} ${y1 - 40} ${x - b} ${y1 - 130}Z`
  const shade = `M${x + a * 0.2} ${top}L${x + a} ${top}L${x + b} ${y1 - 130}C${x + b} ${y1 - 40} ${x + b + fl * 0.5} ${y1 - 6} ${x + b + fl} ${y1}L${x + b * 0.4} ${y1}C${x + b * 0.3} ${y1 - 70} ${x + a * 0.2} ${y1 - 120} ${x + a * 0.2} ${y1 - 200}Z`
  const br = t.branch
  const dir = br && br.len < 0 ? -1 : 1
  const len = br ? Math.abs(br.len) : 0
  const x0 = Math.min(x - b - fl, br && dir < 0 ? x - len - 90 : x) - 10
  const x1 = Math.max(x + b + fl, br && dir > 0 ? x + len + 90 : x) + 10
  return (
    <Art x={x0} y={top} w={x1 - x0} h={y1 - top + 6}>
      {br && (
        <g>
          <path d={`M${x} ${br.y + 6}C${x + dir * len * 0.4} ${br.y - 6} ${x + dir * len * 0.75} ${br.y + 4} ${x + dir * len} ${br.y}`} fill="none" stroke={WOOD[1]} strokeWidth={30} strokeLinecap="round" />
          <path d={`M${x} ${br.y}C${x + dir * len * 0.4} ${br.y - 12} ${x + dir * len * 0.75} ${br.y - 2} ${x + dir * (len - 6)} ${br.y - 6}`} fill="none" stroke={WOOD[0]} strokeWidth={17} strokeLinecap="round" />
          <path d={`M${x + dir * 60} ${br.y - 11}C${x + dir * len * 0.4} ${br.y - 18} ${x + dir * len * 0.7} ${br.y - 10} ${x + dir * (len - 40)} ${br.y - 12}`} fill="none" stroke={WOOD[2]} strokeWidth={4} strokeLinecap="round" opacity="0.8" />
          {/* A tuft of leaves at the tip. */}
          <g transform={`translate(${x + dir * len} ${br.y})`}>
            <circle cx={dir * 26} cy={8} r={40} fill={PINE[1]} />
            <circle cx={dir * 18} cy={-2} r={40} fill={PINE[0]} />
            <circle cx={dir * 54} cy={-18} r={30} fill={PINE[0]} />
            <circle cx={dir * 8} cy={-16} r={15} fill={PINE[2]} opacity="0.7" />
          </g>
        </g>
      )}
      <path d={body} fill={WOOD[0]} />
      <path d={shade} fill={WOOD[1]} />
      <path d={`M${x - a * 0.55} ${top + 20}L${x - b * 0.6} ${y1 - 150}`} stroke={WOOD[2]} strokeWidth={w * 0.09} strokeLinecap="round" opacity="0.7" />
      {/* Moss, and the ring the water leaves on the bark. */}
      <ellipse cx={x - a * 0.3} cy={-120} rx={w * 0.2} ry={12} fill={LEAF[0]} opacity="0.85" />
      <ellipse cx={x + a * 0.1} cy={-340} rx={w * 0.16} ry={9} fill={LEAF[0]} opacity="0.7" />
      <path d={`M${x - b + 2} 14L${x + b - 2} 14`} stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity="0.28" />
    </Art>
  )
})

/** A water plant on the riverbed, swaying. */
export const Weed = memo(function Weed({ x, n }: { x: number; n: number }) {
  const h = 110 + (n % 3) * 34
  return (
    <svg aria-hidden viewBox="-40 -180 80 190" className="rio-sway" style={{ position: 'absolute', left: x - 40, top: BED - 174, width: 80, height: 190, overflow: 'visible', pointerEvents: 'none', animationDelay: `${-(n % 5) * 0.9}s` }}>
      <path d={`M-8 6C-22 ${-h * 0.4} 4 ${-h * 0.6} -12 ${-h}`} fill="none" stroke="#2f9c86" strokeWidth="9" strokeLinecap="round" />
      <path d={`M8 6C22 ${-h * 0.3} -4 ${-h * 0.5} 12 ${-h * 0.82}`} fill="none" stroke="#3fb596" strokeWidth="8" strokeLinecap="round" />
      <path d={`M0 6C-6 ${-h * 0.2} 8 ${-h * 0.34} 2 ${-h * 0.56}`} fill="none" stroke="#69c9a6" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
})

/** A smooth river stone on the bed, with a little moss. */
export const Boulder = memo(function Boulder({ x, n }: { x: number; n: number }) {
  const w = 120 + (n % 3) * 44
  const h = w * 0.46
  return (
    <Art x={x - w / 2 - 4} y={BED - h - 4} w={w + 8} h={h + 24}>
      <path d={`M${x - w / 2} ${BED + 14}C${x - w / 2} ${BED - h * 0.9} ${x - w * 0.2} ${BED - h} ${x} ${BED - h}C${x + w * 0.3} ${BED - h} ${x + w / 2} ${BED - h * 0.7} ${x + w / 2} ${BED + 14}Z`} fill="#bcb6d6" />
      <path d={`M${x + w * 0.1} ${BED - h}C${x + w * 0.34} ${BED - h * 0.96} ${x + w / 2} ${BED - h * 0.7} ${x + w / 2} ${BED + 14}L${x + w * 0.24} ${BED + 14}C${x + w * 0.3} ${BED - h * 0.4} ${x + w * 0.24} ${BED - h * 0.8} ${x + w * 0.1} ${BED - h}Z`} fill="#9790ba" />
      <path d={`M${x - w * 0.3} ${BED - h * 0.5}C${x - w * 0.24} ${BED - h * 0.76} ${x - w * 0.12} ${BED - h * 0.86} ${x} ${BED - h * 0.88}`} fill="none" stroke="#dedaf0" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx={x - w * 0.08} cy={BED - h + 5} rx={w * 0.22} ry={8} fill="#69c9a6" />
    </Art>
  )
})

/** A floating log. Its top is a little above the waterline. */
export const Log = memo(function Log({ x, w }: { x: number; w: number }) {
  return (
    <Art x={x - w / 2 - 10} y={-40} w={w + 20} h={90}>
      <rect x={x - w / 2} y={-22} width={w} height={50} rx={25} fill={WOOD[1]} />
      <rect x={x - w / 2} y={-22} width={w} height={34} rx={17} fill={WOOD[0]} />
      <path d={`M${x - w / 2 + 34} -11L${x + w / 2 - 60} -11`} stroke={WOOD[2]} strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      <ellipse cx={x + w / 2 - 22} cy={3} rx={15} ry={21} fill="#e5b78f" />
      <ellipse cx={x + w / 2 - 22} cy={3} rx={7} ry={11} fill={WOOD[0]} />
      <ellipse cx={x - w * 0.16} cy={-20} rx={34} ry={7} fill={LEAF[0]} />
    </Art>
  )
})

/** The rainbow at the finish, standing in the water behind the trees. */
export const FinishRainbow = memo(function FinishRainbow({ x, bright }: { x: number; bright: boolean }) {
  const bows = ['#ff8fb8', '#ffc595', '#fbea9a', '#aee8b7', '#8ccfff', '#b9a6f5']
  const R = 330
  return (
    <Art x={x - R - 20} y={-R - 20} w={R * 2 + 40} h={R + 30} style={{ opacity: bright ? 1 : 0.72, transition: 'opacity 1s' }}>
      {bows.map((c, i) => (
        <path key={c} d={`M${x - R + i * 17} 6A${R - i * 17} ${R - i * 17} 0 0 1 ${x + R - i * 17} 6`} fill="none" stroke={c} strokeWidth={17.5} />
      ))}
    </Art>
  )
})

/** A fruit on its vine. `drop` is how far the vine has been let down. The fruit itself is moved by the game. */
export function Vine({ x, from, to }: { x: number; from: number; to: number }) {
  return (
    <Art x={x - 20} y={from} w={40} h={to - from}>
      <path d={`M${x} ${from}C${x - 7} ${from + (to - from) * 0.4} ${x + 7} ${from + (to - from) * 0.7} ${x} ${to}`} fill="none" stroke={LEAF[1]} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx={x + 9} cy={from + (to - from) * 0.45} rx="11" ry="5" fill={LEAF[0]} transform={`rotate(28 ${x + 9} ${from + (to - from) * 0.45})`} />
    </Art>
  )
}
export function Fruit({ tone, size = 68 }: { tone: readonly string[]; size?: number }) {
  return (
    <svg aria-hidden viewBox="-20 -24 40 44" style={{ width: size, height: size * 1.1, display: 'block', overflow: 'visible' }}>
      <path d="M0 -14C1 -20 6 -23 11 -22" fill="none" stroke={LEAF[1]} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="9" cy="-19" rx="7" ry="3.4" fill={LEAF[0]} transform="rotate(-24 9 -19)" />
      <circle r="16" fill={tone[0]} />
      <path d="M-13 9C-4 18 9 17 15 5C12 14 2 18 -6 15C-9 14 -12 12 -13 9Z" fill={tone[1]} />
      <circle cx="-6" cy="-6" r="5" fill={tone[2]} />
    </svg>
  )
}

/** Rays of sun through the water (screen space, over the tint). */
export const Rays = memo(function Rays() {
  return (
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.13 }}>
      <path d="M10 0L20 0L14 100L-2 100Z M38 0L44 0L46 100L33 100Z M62 0L72 0L86 100L68 100Z M90 0L94 0L104 100L96 100Z" fill="#fff" />
    </svg>
  )
})

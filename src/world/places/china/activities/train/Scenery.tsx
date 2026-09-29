// The streaming landscape outside the train window: simple SVG tiles (far hills, near hills, trees/poles, rail ties, speed
// streaks) that repeat sideways. The parent calls `scroll(px)` every frame; that writes `backgroundPositionX` straight to
// the layer elements (no React state), each layer at its own speed, which is what makes it feel deep.
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'

export type StopId = 'harbin' | 'hainan' | 'gobi' | 'himalaya'

interface Palette {
  skyTop: string
  skyBottom: string
  far: string
  farTop: string
  mid: string
  midTop: string
  ground: string
  ties: string
  trees: 'pine' | 'palm' | 'poles' | 'crags'
  peaks?: boolean
}

export const PALETTES: Record<StopId, Palette> = {
  harbin: { skyTop: '#BFE0F7', skyBottom: '#F1F9FF', far: '#C5D9EC', farTop: '#F4F9FF', mid: '#DCEBF7', midTop: '#FFFFFF', ground: '#F6FBFF', ties: '#8AA6C2', trees: 'pine' },
  hainan: { skyTop: '#6FD0F2', skyBottom: '#DFF8FF', far: '#5FBF9A', farTop: '#8EDDB0', mid: '#46B37A', midTop: '#7BD08F', ground: '#F5DFA6', ties: '#B8905A', trees: 'palm' },
  gobi: { skyTop: '#FFD98A', skyBottom: '#FFF3D0', far: '#EBBE72', farTop: '#F8D890', mid: '#E4A85A', midTop: '#F4C878', ground: '#F1CB82', ties: '#A87A46', trees: 'poles' },
  himalaya: { skyTop: '#A9D6FA', skyBottom: '#E9F5FF', far: '#8FA6C8', farTop: '#F2F7FF', mid: '#B3C4DE', midTop: '#FFFFFF', ground: '#F1F7FF', ties: '#7D93B5', trees: 'crags', peaks: true },
}

const TW = 900
const TH = 300
const INK = '#6E3B24'
const uri = (body: string) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TW} ${TH}" preserveAspectRatio="none">${body}</svg>`)}")`

/** A seamless ridge line: sums of sines with whole numbers of waves across the tile. */
function ridge(base: number, amp: number, waves: number[], phase: number, peaks = false) {
  const pts: string[] = []
  for (let x = 0; x <= TW; x += peaks ? 10 : 20) {
    let y = 0
    if (peaks) {
      // sharp summits, from a triangle wave
      const k = waves[0]
      const u = ((x / TW) * k + phase) % 1
      const tri = 1 - Math.abs(u * 2 - 1)
      const k2 = waves[1]
      const u2 = ((x / TW) * k2 + phase * 3) % 1
      const tri2 = 1 - Math.abs(u2 * 2 - 1)
      y = base - amp * (0.7 * tri + 0.3 * tri2)
    } else {
      waves.forEach((w, i) => (y += Math.sin((x / TW) * Math.PI * 2 * w + phase + i * 1.7) * (amp / (i + 1))))
      y += base
    }
    pts.push(`${x},${y.toFixed(1)}`)
  }
  return `M0,${TH} L${pts.join(' L')} L${TW},${TH}Z`
}

const hills = (fill: string, top: string, id: string, base: number, amp: number, waves: number[], phase: number, peaks = false) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="${peaks ? 0.45 : 0.3}" stop-color="${fill}"/><stop offset="1" stop-color="${fill}"/></linearGradient></defs><path d="${ridge(base, amp, waves, phase, peaks)}" fill="url(#${id})" stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-opacity="0.35"/>`

const pine = (x: number, s: number, snow: boolean) =>
  `<g transform="translate(${x} ${TH}) scale(${s})"><rect x="-6" y="-26" width="12" height="26" fill="#8A5A3B" stroke="${INK}" stroke-width="3"/>` +
  [[-30, 62, 46], [-62, 48, 40], [-92, 34, 34]].map(([y, w, h]) => `<path d="M0 ${y - h} L${w} ${y} L${-w} ${y}Z" fill="#4E9A7B" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>${snow ? `<path d="M0 ${y - h} L${w * 0.45} ${y - h * 0.55} Q0 ${y - h * 0.4} ${-w * 0.45} ${y - h * 0.55}Z" fill="#fff"/>` : ''}`).join('') +
  `</g>`

const palm = (x: number, s: number, lean: number) =>
  `<g transform="translate(${x} ${TH}) scale(${s})"><path d="M0 0 C${6 * lean} -60 ${14 * lean} -110 ${26 * lean} -150" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M0 0 C${6 * lean} -60 ${14 * lean} -110 ${26 * lean} -150" fill="none" stroke="#C99A6A" stroke-width="11" stroke-linecap="round"/>` +
  [-70, -35, 0, 35, 70].map((r) => `<g transform="translate(${26 * lean} -150) rotate(${r})"><path d="M0 0 C22 -44 70 -50 96 -20 C60 -30 30 -16 0 0Z" fill="#4DBB70" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></g>`).join('') +
  `<circle cx="${22 * lean}" cy="-146" r="8" fill="#8A5A3B" stroke="${INK}" stroke-width="3"/></g>`

const pole = (x: number) => `<g transform="translate(${x} ${TH})"><rect x="-6" y="-190" width="12" height="190" fill="#9B6B47" stroke="${INK}" stroke-width="3"/><rect x="-34" y="-176" width="68" height="10" rx="4" fill="#9B6B47" stroke="${INK}" stroke-width="3"/></g>`
const cactus = (x: number, s: number) => `<g transform="translate(${x} ${TH}) scale(${s})"><rect x="-13" y="-90" width="26" height="90" rx="13" fill="#6DBB73" stroke="${INK}" stroke-width="3.5"/><path d="M13 -50 C36 -50 36 -74 36 -74" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M13 -50 C36 -50 36 -74 36 -74" fill="none" stroke="#6DBB73" stroke-width="13" stroke-linecap="round"/></g>`
const crag = (x: number, s: number) => `<g transform="translate(${x} ${TH}) scale(${s})"><path d="M-46 0 L-24 -58 L-8 -40 L10 -92 L46 0Z" fill="#9AA9C6" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M10 -92 L24 -60 L10 -66 L2 -54 L-8 -62Z" fill="#fff"/></g>`
const flag = (x: number) => `<g transform="translate(${x} ${TH})"><rect x="-3" y="-90" width="6" height="90" fill="${INK}"/>${[0, 1, 2, 3].map((i) => `<path d="M0 ${-88 + i * 8} l${26 + i * 4} 6 l${-26 - i * 4} 6z" fill="${['#FF7B8B', '#FFD166', '#6DD08C', '#7CC7F2'][i]}"/>`).join('')}</g>`

function near(kind: Palette['trees']) {
  const xs = [60, 190, 330, 470, 610, 760, 850]
  if (kind === 'pine') return xs.map((x, i) => pine(x, 0.8 + (i % 3) * 0.16, true)).join('')
  if (kind === 'palm') return [80, 300, 530, 760].map((x, i) => palm(x, 0.95 + (i % 2) * 0.2, i % 2 ? -1 : 1)).join('')
  if (kind === 'crags') return [70, 260, 520, 700].map((x, i) => crag(x, 1.2 + (i % 2) * 0.6)).join('') + [400, 840].map((x) => flag(x)).join('')
  const poles = [100, 400, 700]
  const wire = (a: number, b: number) => `<path d="M${a} ${TH - 174} Q${(a + b) / 2} ${TH - 120} ${b} ${TH - 174}" fill="none" stroke="${INK}" stroke-width="3" opacity="0.7"/>`
  return poles.map((x, i) => wire(x, i === 2 ? 100 + TW : poles[i + 1]) + (i === 2 ? wire(100 - TW + 700, 100) : '')).join('') + poles.map(pole).join('') + [230, 560, 850].map((x, i) => cactus(x, 0.9 + i * 0.15)).join('')
}

const ties = (c: string) => `<rect y="0" width="${TW}" height="${TH}" fill="none"/>` + Array.from({ length: 15 }, (_, i) => `<rect x="${i * 60 + 10}" y="120" width="26" height="150" rx="5" fill="${c}" stroke="${INK}" stroke-width="3" stroke-opacity="0.5"/>`).join('')
const streaks = () => [[40, 40, 220], [300, 90, 300], [620, 60, 200], [120, 150, 260], [520, 190, 320], [800, 130, 180], [260, 240, 240], [700, 260, 220]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="5" rx="2.5" fill="#fff"/>`).join('')

const layers = (p: Palette) => ({
  far: uri(hills(p.far, p.farTop, 'a', 150, p.peaks ? 130 : 46, p.peaks ? [3, 5] : [2, 3], 0.4, !!p.peaks)),
  mid: uri(hills(p.mid, p.midTop, 'b', 190, p.peaks ? 110 : 40, p.peaks ? [4, 7] : [3, 5], 2.1, !!p.peaks)),
  near: uri(near(p.trees)),
  ties: uri(ties(p.ties)),
  streaks: uri(streaks()),
})

export interface SceneryHandle {
  /** Move the world `px` pixels past the window. */
  scroll: (px: number) => void
  /** 0..1: how strong the speed streaks are. */
  setStreaks: (v: number) => void
}

// Where each layer sits (percent of the screen, from the bottom) and how fast it moves relative to the train.
const FAR = { bottom: 44, height: 30, k: 0.05 }
const MID = { bottom: 40, height: 26, k: 0.16 }
const NEAR = { bottom: 37, height: 30, k: 0.55 }
const TIES = { bottom: 35, height: 8, k: 1 }
const STREAK = { bottom: 26, height: 40, k: 2.4 }

export const Scenery = forwardRef<SceneryHandle, { stop: StopId }>(function Scenery({ stop }, ref) {
  const p = PALETTES[stop]
  const tiles = useMemo(() => layers(p), [stop])
  const el = useRef<Record<string, HTMLDivElement | null>>({})
  const pos = useRef(0)
  useImperativeHandle(ref, () => ({
    scroll: (px) => {
      pos.current += px
      for (const [k, def] of [['far', FAR], ['mid', MID], ['near', NEAR], ['ties', TIES], ['streaks', STREAK]] as const) {
        const e = el.current[k]
        if (e) e.style.backgroundPositionX = `${-(pos.current * def.k) % 1e6}px`
      }
    },
    setStreaks: (v) => {
      const e = el.current.streaks
      if (e) e.style.opacity = String(Math.max(0, v))
    },
  }))
  const layer = (k: 'far' | 'mid' | 'near' | 'ties' | 'streaks', def: { bottom: number; height: number }, extra?: React.CSSProperties) => (
    <div
      key={k}
      ref={(e) => {
        el.current[k] = e
      }}
      style={{ position: 'absolute', left: 0, right: 0, bottom: `${def.bottom}%`, height: `${def.height}%`, backgroundImage: tiles[k], backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%', backgroundPositionX: `${-(pos.current * (k === 'far' ? FAR.k : k === 'mid' ? MID.k : k === 'near' ? NEAR.k : k === 'ties' ? TIES.k : STREAK.k))}px`, pointerEvents: 'none', ...extra }}
    />
  )
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: `linear-gradient(${p.skyTop}, ${p.skyBottom} 55%)` }}>
      {layer('far', FAR)}
      {layer('mid', MID)}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${MID.bottom + 1}%`, background: `linear-gradient(${p.mid}, ${p.ground} 18%)` }} />
      {layer('near', NEAR)}
      {layer('ties', TIES)}
      {/* the two rails */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: '38.4%', height: 6, background: '#8D7A8A', borderTop: `3px solid ${INK}`, borderBottom: `3px solid ${INK}`, opacity: 0.9 }} />
      {layer('streaks', STREAK, { opacity: 0, zIndex: 3 })}
    </div>
  )
})

// Luna's map of Peru: the real country outline (Natural Earth 1:110m, public domain, projected into a 600 x 700 box)
// drawn in the flat sticker style, with Peru's three worlds side by side: the desert coast by the ocean, the Andes down
// the middle and the rainforest with its river. A cartographic view, used only on the hub. Tapping a world says what it
// is like there (and something small happens: a wave rolls, a snowcap glints, a pink river dolphin fin pops up).
import { motion } from 'motion/react'
import { useState } from 'react'
import { say, sounds } from '../../../sdk'
import { L } from './lines'
import { INK } from './puppets/Alpaca'

export const MAP_RATIO = 600 / 700

const OUTLINE =
  'M474.4,183.8L443.8,182.2L439.3,187.3L411.5,193.8L372.7,216.9L370.3,232.7L361.6,244.5L365.0,262.8L344.5,272.6L344.6,286.9L335.6,293.1L349.7,323.6L368.6,344.2L361.4,358.8L383.9,360.8L396.7,378.8L426.6,379.7L454.4,359.7L452.2,411.2L467.6,415.1L486.7,409.3L516.0,463.8L508.7,475.3L507.1,499.1L506.4,528.0L493.2,544.9L499.2,557.5L491.5,568.9L506.0,597.4L484.7,634.0L475.6,651.3L458.1,660.0L424.2,640.5L421.2,626.6L354.0,592.6L293.2,555.5L267.1,534.6L253.0,506.6L258.6,496.9L229.9,452.4L196.5,389.8L164.4,322.3L150.6,306.9L139.9,281.9L113.6,259.8L89.4,246.1L100.4,231.0L84.0,198.6L94.5,174.9L121.5,153.5L125.6,167.6L115.9,175.7L116.8,188.1L130.8,185.4L144.5,189.0L158.7,206.2L177.9,192.2L184.3,169.3L205.1,139.9L245.9,126.5L282.8,91.0L293.4,69.0L288.6,43.2L297.7,40.0L320.2,56.1L331.0,72.1L346.7,80.8L366.7,116.3L391.9,120.6L410.6,111.6L422.9,117.5L443.2,114.6L469.2,130.4L447.3,164.9L457.4,165.7L474.4,183.8Z'
/** The Pacific coast, south to north (part of the outline). */
const COAST = 'M458.1,660.0L424.2,640.5L421.2,626.6L354.0,592.6L293.2,555.5L267.1,534.6L253.0,506.6L258.6,496.9L229.9,452.4L196.5,389.8L164.4,322.3L150.6,306.9L139.9,281.9L113.6,259.8L89.4,246.1L100.4,231.0L84.0,198.6L94.5,174.9L121.5,153.5'
const OCEAN = `${COAST}L60,110L0,100L0,700L440,700Z`
/** The spine of the Andes, parallel to the coast. */
const ANDES: [number, number][] = [
  [150, 180],
  [195, 255],
  [235, 335],
  [280, 420],
  [330, 490],
  [395, 545],
  [450, 590],
  [480, 640],
]
const ANDES_PATH = `M${ANDES.map((p) => p.join(',')).join('L')}`

const outlinePts = OUTLINE.slice(1, -1)
  .split('L')
  .map((s) => s.split(',').map(Number) as [number, number])
function inside(x: number, y: number) {
  let hit = false
  for (let i = 0, j = outlinePts.length - 1; i < outlinePts.length; j = i++) {
    const [xi, yi] = outlinePts[i]
    const [xj, yj] = outlinePts[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}
function nearAndes(x: number, y: number) {
  let best = 1e9
  for (let i = 1; i < ANDES.length; i++) {
    const [ax, ay] = ANDES[i - 1]
    const [bx, by] = ANDES[i]
    const dx = bx - ax
    const dy = by - ay
    const k = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
    best = Math.min(best, Math.hypot(x - ax - dx * k, y - ay - dy * k))
  }
  return best
}

// Peaks along the spine, and round rainforest trees east of the mountains (computed once).
const PEAKS: { x: number; y: number; s: number }[] = []
for (let i = 1; i < ANDES.length; i++) {
  const [ax, ay] = ANDES[i - 1]
  const [bx, by] = ANDES[i]
  for (let t = 0; t < 1; t += 0.5) {
    const k = PEAKS.length
    const off = k % 2 ? 16 : -14
    PEAKS.push({ x: ax + (bx - ax) * t + off, y: ay + (by - ay) * t + (k % 2 ? 8 : 0), s: k % 3 === 0 ? 1.15 : 0.9 })
  }
}
const TREES: { x: number; y: number; r: number }[] = []
for (let y = 80; y < 640; y += 46) {
  for (let x = 150 + ((y / 46) % 2) * 26; x < 520; x += 52) {
    const tx = x + ((x * 13 + y * 7) % 17) - 8
    const ty = y + ((x * 7 + y * 3) % 13) - 6
    if (inside(tx, ty) && nearAndes(tx, ty) > 78 && inside(tx + 18, ty) && inside(tx - 18, ty) && inside(tx, ty + 18)) TREES.push({ x: tx, y: ty, r: 15 + ((x + y) % 5) })
  }
}
const RIVER = 'M232,206Q280,192 326,176Q352,160 368,170Q410,184 474,184M368,170Q352,232 344,282Q334,334 342,384Q350,420 344,452'

export function PeruMap() {
  const [wave, setWave] = useState(0)
  const [glint, setGlint] = useState(0)
  const [fin, setFin] = useState(0)
  const tap = (which: 'coast' | 'mountains' | 'forest') => {
    sounds.pop()
    void say(L.worlds[which])
    if (which === 'coast') setWave((w) => w + 1)
    if (which === 'mountains') {
      setGlint((g) => g + 1)
      sounds.sparkle()
    }
    if (which === 'forest') setFin((f) => f + 1)
  }
  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--shadow)', border: `5px solid ${INK}`, background: '#F6E9D6' }}>
      <svg viewBox="0 0 600 700" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <clipPath id="peru-land">
            <path d={OUTLINE} />
          </clipPath>
        </defs>
        {/* Ocean with waves */}
        <path d={OCEAN} fill="#A8DCFF" />
        {[
          [40, 260],
          [70, 420],
          [150, 560],
          [30, 600],
          [230, 640],
        ].map(([x, y], i) => (
          <motion.path key={i} d={`M${x} ${y}q10 -10 20 0t20 0`} fill="none" stroke="#FFF7F0" strokeWidth="5" strokeLinecap="round" animate={{ x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 3 + i * 0.4 }} />
        ))}
        {/* The country: rainforest green underneath, the coast's desert and the Andes on top. */}
        <g clipPath="url(#peru-land)">
          <path d={OUTLINE} fill="#7FCF8A" />
          {/* Round tree tops on little trunks. */}
          {TREES.map((t, i) => (
            <g key={i} transform={`translate(${t.x} ${t.y})`} stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
              <path d={`M-3 ${t.r * 0.5}V${t.r + 5}H3V${t.r * 0.5}Z`} fill="#8B5A3C" />
              <circle r={t.r} fill={i % 3 ? '#4FAE6A' : '#3F9C5C'} />
              <path d={`M${-t.r * 0.5} ${-t.r * 0.2}a${t.r * 0.5} ${t.r * 0.5} 0 0 1 ${t.r * 0.5} ${-t.r * 0.45}`} fill="none" stroke="#8FE3A8" strokeWidth="3" strokeLinecap="round" />
            </g>
          ))}
          <path d={ANDES_PATH} fill="none" stroke="#D9CCFF" strokeWidth="120" strokeLinecap="round" strokeLinejoin="round" />
          <path d={COAST} fill="none" stroke="#FBE3A6" strokeWidth="78" strokeLinejoin="round" />
          {[
            [140, 230],
            [180, 330],
            [235, 440],
            [300, 540],
          ].map(([x, y], i) => (
            <path key={i} d={`M${x - 16} ${y}q16 -14 32 0`} fill="none" stroke="#E9C77F" strokeWidth="4" strokeLinecap="round" />
          ))}
          {PEAKS.map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y}) scale(${p.s})`} stroke={INK} strokeWidth="3" strokeLinejoin="round">
              <path d="M-26 18L0 -24L26 18Z" fill="#B9A6F5" />
              <path d="M-9 -9L0 -24L9 -9L4 -5L0 -9L-4 -5Z" fill="#FFF7F0" />
            </g>
          ))}
          <path d={RIVER} fill="none" stroke={INK} strokeWidth="13" strokeLinecap="round" />
          <path d={RIVER} fill="none" stroke="#A8DCFF" strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="492" cy="574" rx="18" ry="11" fill="#A8DCFF" stroke={INK} strokeWidth="3" />
        </g>
        <path d={OUTLINE} fill="none" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        {/* A little surprise for each world. */}
        {wave > 0 && (
          <motion.path key={`w${wave}`} d="M90 330q14 -16 28 0t28 0t28 0" fill="none" stroke="#FFF7F0" strokeWidth="8" strokeLinecap="round" initial={{ x: -60, opacity: 0 }} animate={{ x: [-60, 10], opacity: [0, 1, 0] }} transition={{ duration: 1.4 }} />
        )}
        {glint > 0 && (
          <g transform="translate(240 318)">
            <motion.path key={`g${glint}`} d="M0 -16L4 -4L16 0L4 4L0 16L-4 4L-16 0L-4 -4Z" fill="#FFC83D" stroke={INK} strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: [0, 1.6, 0], rotate: 90 }} transition={{ duration: 0.9 }} />
          </g>
        )}
        {fin > 0 && (
          <g transform="translate(410 178)">
            <motion.path key={`f${fin}`} d="M-12 6Q0 -22 14 6Z" fill="#FF8FB8" stroke={INK} strokeWidth="3" initial={{ y: 10, opacity: 0 }} animate={{ y: [10, -6, -6, 10], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.6, times: [0, 0.2, 0.8, 1] }} />
          </g>
        )}
      </svg>
      {/* Tap a world to hear about it. */}
      {(
        [
          ['coast', 'the coast', 16, 52, 22, 26],
          ['mountains', 'the mountains', 33, 37, 22, 18],
          ['forest', 'the rainforest', 62, 46, 26, 20],
        ] as const
      ).map(([which, label, x, y, w, h]) => (
        <button key={which} aria-label={label} onClick={() => tap(which)} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, borderRadius: '50%', background: 'none', border: 'none', padding: 0, zIndex: 1 }} />
      ))}
    </div>
  )
}

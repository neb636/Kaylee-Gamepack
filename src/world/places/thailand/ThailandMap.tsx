// The map of Thailand on the hub, drawn in SVG from the real outline (mapData.ts), in the flat 5-unit-outline style. A
// cartographic view used only on the hub. Tapping the sea, the northern mountains or Bangkok says what it's like there,
// and something small happens: waves roll, a mountain glints, the city's lights twinkle.
import { motion } from 'motion/react'
import { useState } from 'react'
import { say, sounds } from '../../../sdk'
import { L } from './lines'
import { MAP_H, MAP_W, NEIGHBOURS, PLACES, THAILAND } from './mapData'

export const MAP_RATIO = MAP_W / MAP_H
export const INK = '#3B2A3F'

/** Tap zones (map units): centre and radius. */
const ZONES = [
  { id: 'sea', label: 'the Andaman Sea', x: 150, y: 1000, r: 130 },
  { id: 'north', label: 'the mountains', x: PLACES.chiangMai[0], y: PLACES.chiangMai[1], r: 120 },
  { id: 'city', label: 'Bangkok', x: PLACES.bangkok[0], y: PLACES.bangkok[1], r: 80 },
] as const

export function ThailandMap() {
  const [poke, setPoke] = useState<Record<string, number>>({})
  const tap = (id: (typeof ZONES)[number]['id']) => {
    sounds.pop()
    setPoke((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }))
    void say(L.map[id])
  }
  const [cx, cy] = PLACES.chiangMai
  const [bx, by] = PLACES.bangkok
  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', border: `5px solid ${INK}`, boxShadow: 'var(--shadow)' }}>
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <rect width={MAP_W} height={MAP_H} fill="#8FD3F4" />
        {/* Waves on the Andaman Sea and the Gulf of Thailand. */}
        {[
          [90, 760],
          [170, 1180],
          [610, 1010],
          [700, 1180],
          [120, 1320],
        ].map(([x, y], i) => (
          <motion.path
            key={i}
            d={`M${x} ${y}q15 -14 30 0t30 0t30 0`}
            fill="none"
            stroke="#fff"
            strokeWidth="7"
            strokeLinecap="round"
            animate={{ x: [0, 12, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.4 }}
          />
        ))}
        {NEIGHBOURS.map((d, i) => (
          <path key={i} d={d} fill="#CDE8B5" stroke={INK} strokeWidth="3" strokeLinejoin="round" opacity="0.9" />
        ))}
        <path d={THAILAND} fill="#FFB8D6" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        {/* Green mountains up north. */}
        <motion.g animate={poke.north ? { y: [0, -14, 0] } : {}} key={`n${poke.north ?? 0}`} transition={{ duration: 0.5 }}>
          {[
            [-70, 40],
            [0, 0],
            [70, 50],
          ].map(([dx, dy], i) => (
            <path key={i} d={`M${cx + dx - 50} ${cy + dy + 40}L${cx + dx} ${cy + dy - 45}L${cx + dx + 50} ${cy + dy + 40}Z`} fill="#7CCB7A" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          ))}
        </motion.g>
        {/* Bangkok: a little temple roof. */}
        <motion.g animate={poke.city ? { scale: [1, 1.25, 1] } : {}} key={`c${poke.city ?? 0}`} style={{ transformOrigin: `${bx}px ${by}px` }}>
          <path d={`M${bx - 34} ${by + 26}L${bx - 34} ${by}L${bx} ${by - 44}L${bx + 34} ${by}L${bx + 34} ${by + 26}Z`} fill="#FFE27A" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <circle cx={bx} cy={by + 8} r="8" fill="#E8A35A" stroke={INK} strokeWidth="3" />
        </motion.g>
        {/* A ripple where she tapped the sea. */}
        {!!poke.sea && (
          <motion.circle key={`s${poke.sea}`} cx={ZONES[0].x} cy={ZONES[0].y} fill="none" stroke="#fff" strokeWidth="8" initial={{ r: 10, opacity: 1 }} animate={{ r: 120, opacity: 0 }} transition={{ duration: 0.9 }} />
        )}
      </svg>
      {ZONES.map((z) => (
        <button
          key={z.id}
          aria-label={z.label}
          onClick={() => tap(z.id)}
          style={{
            position: 'absolute',
            left: `${((z.x - z.r) / MAP_W) * 100}%`,
            top: `${((z.y - z.r) / MAP_H) * 100}%`,
            width: `${((2 * z.r) / MAP_W) * 100}%`,
            height: `${((2 * z.r) / MAP_H) * 100}%`,
            borderRadius: '50%',
            background: 'none',
            border: 'none',
            padding: 0,
          }}
        />
      ))}
    </div>
  )
}

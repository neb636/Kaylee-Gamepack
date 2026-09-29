// A small map of China (north at the top) with the four stops. The train's dot slides along the dashed route, so "China is
// huge" is something she can see: Harbin is way up top, Hainan way down at the bottom.
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { INK } from '../../puppets/ink'
import type { StopId } from './Scenery'

export const MAP_PTS: Record<'start' | StopId, { x: number; y: number }> = {
  start: { x: 74, y: 44 },
  harbin: { x: 90, y: 12 },
  hainan: { x: 58, y: 118 },
  gobi: { x: 46, y: 32 },
  himalaya: { x: 16, y: 72 },
}
export const ROUTE: ('start' | StopId)[] = ['start', 'harbin', 'hainan', 'gobi', 'himalaya']
const EMOJI: Record<StopId, string> = { harbin: '❄️', hainan: '🌴', gobi: '🏜️', himalaya: '🏔️' }
const CHINA = 'M18 44 L36 34 L46 24 L60 16 L76 10 L96 4 L100 20 L92 32 L98 44 L86 56 L90 70 L80 84 L72 98 L64 112 L52 124 L42 112 L30 100 L14 88 L6 66 L10 54Z'

export interface RouteMapHandle {
  /** The dot goes from ROUTE[leg] to ROUTE[leg + 1], `t` of the way (0..1). */
  set: (leg: number, t: number) => void
}

export const RouteMap = forwardRef<RouteMapHandle, { visited: number; width: number }>(function RouteMap({ visited, width }, ref) {
  const dot = useRef<SVGGElement>(null)
  useImperativeHandle(ref, () => ({
    set: (leg, t) => {
      const a = MAP_PTS[ROUTE[Math.max(0, Math.min(ROUTE.length - 2, leg))]]
      const b = MAP_PTS[ROUTE[Math.max(1, Math.min(ROUTE.length - 1, leg + 1))]]
      const k = Math.max(0, Math.min(1, t))
      dot.current?.setAttribute('transform', `translate(${a.x + (b.x - a.x) * k} ${a.y + (b.y - a.y) * k})`)
    },
  }))
  const d = ROUTE.map((id, i) => `${i ? 'L' : 'M'}${MAP_PTS[id].x} ${MAP_PTS[id].y}`).join(' ')
  return (
    <div style={{ width, background: 'rgba(255,255,255,0.88)', border: `4px solid ${INK}`, borderRadius: 22, padding: '6px 4px 4px', boxShadow: 'var(--shadow)', pointerEvents: 'none' }}>
      <svg viewBox="-4 -14 116 150" style={{ width: '100%', display: 'block', overflow: 'visible' }} aria-label="Map of China">
        <text x="54" y="-5" textAnchor="middle" fontSize="11" fontWeight="900" fill={INK}>N ↑</text>
        <path d={CHINA} fill="#FFE9C9" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={INK} strokeWidth="1.8" strokeDasharray="3 3" strokeLinecap="round" opacity="0.6" />
        {(Object.keys(EMOJI) as StopId[]).map((id) => {
          const p = MAP_PTS[id]
          const idx = ROUTE.indexOf(id)
          const got = visited >= idx
          return (
            <g key={id} transform={`translate(${p.x} ${p.y})`} opacity={got ? 1 : 0.6}>
              <circle r="11" fill={got ? '#FFF3B0' : '#fff'} stroke={INK} strokeWidth="2" />
              <text y="5.5" textAnchor="middle" fontSize="14">{EMOJI[id]}</text>
            </g>
          )
        })}
        <g ref={dot} transform={`translate(${MAP_PTS.start.x} ${MAP_PTS.start.y})`}>
          <circle r="9" fill="#FF6F9F" stroke={INK} strokeWidth="2.5" />
          <text y="4.5" textAnchor="middle" fontSize="12">🚄</text>
        </g>
      </svg>
    </div>
  )
})

// The mountain road without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the road seen from above
// as a picture (the real road from roads.ts, so the 3 road really is a 3), the Pajero rolling along it. Mommy drives
// by herself; a finger held anywhere makes her go faster. The horn wheel beeps, the animals on the way answer a tap,
// and at the end the same end card as the 3D road.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EndCard, Wheel } from './Drive'
import { nanRoad, type RoadId } from './roads'
import { roadSfx as sfx } from './sounds'

interface Props {
  road: RoadId
  onRoad: (r: RoadId) => void
  onStop?: (road: RoadId, stop?: string) => void
  onMap?: () => void
  /** On the trip, from the 3: ✈️🏠 home. */
  onHome?: () => void
}

const LANDMARK = { market: '🧺', mushrooms: '🍄', cafe: '☕', viewpoint: '⛰️' } as const

export function DriveFlat({ road, onRoad, onStop, onMap, onHome }: Props) {
  const r = nanRoad(road)
  const R = r.road
  const view = useMemo(() => {
    const b = R.bounds(14)
    const path = R.samples.filter((_, i) => i % 3 === 0).map((p, i) => `${i ? 'L' : 'M'}${(p.x - b.x0).toFixed(1)} ${(p.z - b.z0).toFixed(1)}`).join(' ')
    return { b, path, w: b.x1 - b.x0, h: b.z1 - b.z0 }
  }, [road])
  const at = (s: number, lat = 0) => {
    const p = R.spotAt(s, lat)
    return { x: p.x - view.b.x0, y: p.z - view.b.z0, a: (Math.atan2(p.z - R.spotAt(Math.max(0, s - 1), lat).z, p.x - R.spotAt(Math.max(0, s - 1), lat).x) * 180) / Math.PI }
  }
  const [s, setS] = useState(4)
  const [done, setDone] = useState(false)
  const held = useRef(false)
  const sRef = useRef(4)
  useEffect(() => {
    let last = performance.now()
    let id = 0
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      sRef.current = Math.min(R.length - 14, sRef.current + dt * (held.current ? 10 : 5))
      setS(sRef.current)
      if (sRef.current >= R.length - 14) {
        setDone(true)
        sfx.chime()
        return
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [road])
  const car = at(s, 2)
  const critters = [
    ...r.traffic.buffalo.map((x) => ({ s: x, icon: '🐃', sound: sfx.moo })),
    ...r.traffic.chickens.map((x) => ({ s: x, icon: '🐔', sound: sfx.cluck })),
    ...r.traffic.monkeys.map((m) => ({ s: m.s, icon: '🐒', sound: sfx.chatter })),
    ...r.blind.map((x) => ({ s: x, icon: '🪞', sound: sfx.chime })),
  ]
  return (
    <div
      onPointerDown={() => (held.current = true)}
      onPointerUp={() => (held.current = false)}
      onPointerCancel={() => (held.current = false)}
      style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, #B5E8A4, #77C48C)', paddingTop: 'var(--top-clear)', touchAction: 'none' }}
    >
      <svg viewBox={`0 0 ${view.w} ${view.h}`} preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', left: 16, right: 16, top: 'var(--top-clear)', bottom: 16, width: 'calc(100% - 32px)', height: 'calc(100% - var(--top-clear) - 16px)' }}>
        <path d={view.path} fill="none" stroke="#8E88A3" strokeWidth={R.half * 2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={view.path} fill="none" stroke="#FFD45C" strokeWidth={0.5} strokeDasharray="3 3" />
        <text x={at(R.length - 16, R.half + 9).x} y={at(R.length - 16, R.half + 9).y} fontSize={16} textAnchor="middle" dominantBaseline="central">
          {LANDMARK[r.landmark]}
        </text>
        {critters.map((c, i) => {
          const p = at(c.s, -(R.half + 4))
          return (
            <text key={i} x={p.x} y={p.y} fontSize={9} textAnchor="middle" dominantBaseline="central" style={{ cursor: 'pointer' }} onPointerDown={(e) => (e.stopPropagation(), c.sound())}>
              {c.icon}
            </text>
          )
        })}
        <g transform={`translate(${car.x} ${car.y}) rotate(${car.a})`}>
          <rect x={-3} y={-1.6} width={6} height={3.2} rx={1} fill="#C9CDD8" stroke="#2B2330" strokeWidth={0.5} />
          <rect x={1.6} y={-1.3} width={1} height={2.6} fill="#BFE2FA" />
        </g>
      </svg>
      {!done && <Wheel onHorn={() => sfx.horn()} />}
      <AnimatePresence>{done && <EndCard road={road} onRoad={onRoad} onStop={onStop} onMap={onMap} onHome={onHome} />}</AnimatePresence>
      {!done && (
        <motion.div aria-hidden animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ position: 'absolute', left: 20, bottom: 24, fontSize: 'clamp(40px, 7vmin, 56px)', pointerEvents: 'none' }}>
          👆🚙
        </motion.div>
      )}
    </div>
  )
}

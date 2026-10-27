// Mountain Bike (greybox 2): up Mont-Sainte-Anne in the gondola, then Kaylee steers Maple's bike down the forest trail
// to the waterfall (ride.ts is the world). The address bar follows her from stretch to stretch (sections.ts), and to
// whichever way round the island she takes. The steering wheel appears under her finger (engine3d/SteerWheel.tsx, the
// Nan drive's). No voices yet (the full-loop gate): a short line at the bottom says what's on screen, for Dad. At the
// waterfall a photo flash, then "again" rolls her out of the top station once more.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { SteerHint, SteerWheel } from '../../../../engine3d/SteerWheel'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { BIKE_ANCHORS, MountainBike as World, type BikeEvents, type BikeStart } from './ride'
import BIKE_SECTIONS, { type BikeSection } from './sections'

const SAY: Record<BikeSection, string> = {
  gondola: '🚡 Up the mountain in the gondola!',
  green: '🚵 Steer the bike down the trail!',
  berms: '🟢 🟦 Pick a way: green or blue!',
  creek: '💦 The creek, then the jump!',
  falls: '🌈 The waterfall!',
}

export function MountainBike() {
  const { start, param, enter } = useSections(BIKE_SECTIONS)
  const [run, setRun] = useState<BikeStart & { n: number }>(() => ({ section: (start ?? 'gondola') as BikeSection, trail: param('trail') as BikeStart['trail'], n: 0 }))
  const [section, setSection] = useState<BikeSection>(run.section)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [done, setDone] = useState(false)
  const worldRef = useRef<World | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const trail = useRef(run.trail)

  useEffect(() => enter(run.section, run.section === 'berms' ? { trail: run.trail } : {}), [run])

  const events = useRef<BikeEvents>({
    section: (s) => {
      setSection(s)
      enter(s, s === 'berms' ? { trail: trail.current } : {})
    },
    way: (w) => {
      trail.current = w
      enter('berms', { trail: w })
    },
    done: () => {
      setDone(true)
      burst()
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, run, events.current)
    w.setWheelElement(wheelRef.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const again = () => {
    setDone(false)
    setSection('green')
    trail.current = 'green'
    setRun((r) => ({ section: 'green', trail: 'green', n: r.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E6EEFB', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="Mont-Sainte-Anne"
        qaKey="__canadaBikeQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={BIKE_ANCHORS} els={els} {...input} />
            <SteerWheel ref={wheelRef} />
            <SteerHint ref={hintRef} />
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setRun((r) => ({ ...r, section: section === 'gondola' ? 'gondola' : section, n: r.n + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(230,238,251,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🚵 Tap to wake the mountain
        </button>
      )}
      {/* The photo at the waterfall: a flash. */}
      <AnimatePresence>
        {done && <motion.div key="flash" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0] }} transition={{ delay: 2, duration: 0.7 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 25 }} />}
      </AnimatePresence>
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={again} ariaLabel="Ride down again">
              🔁 🚵
            </BigButton>
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          <motion.div key={section} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
            {SAY[section]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

const PILL = {
  background: 'rgba(255,255,255,.92)',
  color: 'var(--ink)',
  borderRadius: 999,
  padding: '8px 20px',
  fontSize: 'clamp(16px, 2.4vmin, 22px)',
  fontWeight: 600,
  boxShadow: 'var(--shadow)',
  textAlign: 'center' as const,
  maxWidth: '100%',
}

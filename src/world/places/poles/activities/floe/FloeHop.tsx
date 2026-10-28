// Ice Floe Hop (greybox 2): fling Pola floe to floe back to Mama Bear (floe.ts is the world). The address bar follows
// him from stage to stage (sections.ts). No voices yet (the full-loop gate): a short line at the bottom says what's
// on screen, for Dad. Back with Mama, "again" lays the floes out a new way.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BigButton, burst } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { FLOE_ANCHORS, FloeHop as World, type FloeEvents } from './floe'
import FLOE_SECTIONS, { type FloeSection } from './sections'
import type { ActivityProps } from '../../Place'

const SAY: Record<FloeSection, string> = {
  story: '🐻‍❄️ Pola is far from Mama Bear',
  steady: '🐻‍❄️ Pull Pola back and let go!',
  drift: '🧊 The floes drift: wait, then fling',
  melt: '☀️ Summer: little floes. Push them together!',
  mama: '🐻‍❄️ Home with Mama!',
}

// `onDone` (Place.tsx): call it at the payoff for the stamp. Not called yet: the full loop wires it in.
export function FloeHop(_props: ActivityProps) {
  const { start, param, enter } = useSections(FLOE_SECTIONS)
  const [run, setRun] = useState(() => ({ section: (start ?? 'story') as FloeSection, layout: Math.max(1, Math.floor(+param('layout')) || 1), n: 0 }))
  const [section, setSection] = useState<FloeSection>(run.section)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [drops, setDrops] = useState(0)
  const [home, setHome] = useState(false)
  const worldRef = useRef<World | null>(null)
  const layoutRef = useRef(run.layout)
  layoutRef.current = run.layout

  useEffect(() => enter(run.section, { layout: String(run.layout) }), [run])

  const events = useRef<FloeEvents>({
    section: (s) => {
      setSection(s)
      enter(s, { layout: String(layoutRef.current) })
    },
    shake: () => setDrops((n) => n + 1),
    home: () => {
      setHome(true)
      burst()
    },
  })

  const again = () => {
    setHome(false)
    setSection('steady')
    setRun((r) => ({ section: 'steady', layout: r.layout + 1, n: r.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E6F3FD', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="The sea ice"
        qaKey="__polesFloeQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new World(renderer, { section: run.section, layout: run.layout }, events.current)}
        anchors={(input, els) => <Anchors list={FLOE_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setRun((r) => ({ ...r, section, n: r.n + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(230,243,253,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🧊 Tap to wake the sea
        </button>
      )}
      {/* He shook the water off: drops on the screen. */}
      <AnimatePresence>
        {drops > 0 && (
          <motion.div key={drops} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1.4, ease: 'easeIn' }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15 }}>
            {DROPS.map(([x, y, s], i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, y: 0 }}
                animate={{ scale: 1, y: 40 }}
                transition={{ duration: 1.2, delay: i * 0.03 }}
                style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: s, height: s * 1.2, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: 'rgba(168,220,255,.55)', border: '3px solid rgba(255,255,255,.8)' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {home && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={again} ariaLabel="Again, with new floes">
              🔁 🧊
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

/** Where the drops land on the screen (%), and how big (px). */
const DROPS: [number, number, number][] = [
  [12, 30, 34],
  [24, 62, 22],
  [38, 22, 28],
  [55, 70, 36],
  [68, 34, 24],
  [82, 56, 32],
  [90, 24, 20],
  [46, 46, 18],
  [8, 76, 26],
]

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

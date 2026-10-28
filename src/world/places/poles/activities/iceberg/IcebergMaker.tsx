// Iceberg Maker (greybox 4): pick a pole, crack icebergs off its cliff, see the hidden part, send them sailing
// (iceberg.ts is the world). The address bar follows her from stretch to stretch (sections.ts). No voices yet (the
// full-loop gate): a short line at the bottom says what's on screen, for Dad. When the giant drops, a wave rolls across
// the screen. When her fleet has sailed, "the other pole" starts again at the other end of the world.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BigButton, burst } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { ICEBERG_ANCHORS, IcebergMaker as World, type IcebergEvents, type IcebergStart } from './iceberg'
import ICEBERG_SECTIONS, { type IcebergSection, type Pole } from './sections'
import type { ActivityProps } from '../../Place'

const SAY: Record<IcebergSection, string> = {
  pick: '🐻‍❄️ North or 🐧 south? Pick one!',
  bits: '🧊 Tap the cracks!',
  giant: '🧊 A giant crack! Tap, tap, tap!',
  sail: '⛵ Push the icebergs out to sea!',
}
const UNDER = '🌊 Most of the iceberg is under the water! Push it down'

// `onDone` (Place.tsx): call it at the payoff for the stamp. Not called yet: the full loop wires it in.
export function IcebergMaker(_props: ActivityProps) {
  const { start, param, enter } = useSections(ICEBERG_SECTIONS)
  const [run, setRun] = useState<IcebergStart & { n: number }>(() => ({ section: (start ?? 'pick') as IcebergSection, pole: param('pole') as Pole, n: 0 }))
  const [section, setSection] = useState<IcebergSection>(run.section)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [wave, setWave] = useState(0)
  const [under, setUnder] = useState(false)
  const [done, setDone] = useState(false)
  const worldRef = useRef<World | null>(null)
  const poleRef = useRef(run.pole)
  poleRef.current = run.pole

  useEffect(() => enter(run.section, run.section === 'pick' ? {} : { pole: run.pole }), [run])

  const events = useRef<IcebergEvents>({
    section: (s) => {
      setSection(s)
      enter(s, { pole: poleRef.current })
    },
    pick: (pole) => {
      setSection('bits')
      setRun((r) => ({ section: 'bits', pole, n: r.n + 1 }))
    },
    bigSplash: () => setWave((n) => n + 1),
    under: setUnder,
    done: () => {
      setDone(true)
      burst()
    },
  })

  const other = () => {
    setDone(false)
    setUnder(false)
    setSection('bits')
    setRun((r) => ({ section: 'bits', pole: r.pole === 'north' ? 'south' : 'north', n: r.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E6F3FD', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="The ice cliff"
        qaKey="__polesIcebergQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new World(renderer, run, events.current)}
        anchors={(input, els) => <Anchors list={ICEBERG_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setRun((r) => ({ ...r, section, n: r.n + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(230,243,253,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🧊 Tap to wake the ice
        </button>
      )}
      {/* The giant's wave rolls across the screen. */}
      <AnimatePresence>
        {wave > 0 && (
          <motion.svg
            key={wave}
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
            initial={{ x: '-110%', opacity: 1 }}
            animate={{ x: '110%', opacity: [1, 1, 0] }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '28%', pointerEvents: 'none', zIndex: 15 }}
          >
            <path d="M0 60 Q 50 10 100 50 T 200 50 T 300 50 T 400 50 V100 H0 Z" fill="rgba(120,188,234,.55)" stroke="rgba(255,255,255,.9)" strokeWidth={5} />
          </motion.svg>
        )}
      </AnimatePresence>
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={other} ariaLabel={run.pole === 'north' ? 'Now the South Pole' : 'Now the North Pole'}>
              🔁 {run.pole === 'north' ? '🐧' : '🐻‍❄️'}
            </BigButton>
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          <motion.div key={under ? 'under' : section} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
            {under ? UNDER : SAY[section]}
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

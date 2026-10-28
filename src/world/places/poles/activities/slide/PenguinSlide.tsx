// Penguin Slide (greybox 3): steer Pebble's papa down the ice and through the sea, home to feed Pebble (slide.ts is the
// world). The address bar follows him from stretch to stretch (sections.ts). The steering wheel appears under her
// finger (engine3d/SteerWheel.tsx, the Nan drive's). No voices yet (the full-loop gate): a short line at the bottom
// says what's on screen, for Dad, and his round tummy in the corner fills with the krill he catches. Home with Pebble,
// "again" slides from the top.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { SteerHint, SteerWheel } from '../../../../engine3d/SteerWheel'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import SLIDE_SECTIONS, { type SlideSection } from './sections'
import { PenguinSlide as World, SLIDE_ANCHORS, type SlideEvents, type SlideStart } from './slide'
import type { ActivityProps } from '../../Place'

const SAY: Record<SlideSection, string> = {
  top: '🐧 Steer Papa down the ice!',
  bumps: '❄️ Bumps! Pick a way down',
  dive: '🦐 Swim through the pink krill!',
  home: '🐣 Krill for Pebble!',
}

// `onDone` (Place.tsx): call it at the payoff for the stamp. Not called yet: the full loop wires it in.
export function PenguinSlide(_props: ActivityProps) {
  const { start, param, enter } = useSections(SLIDE_SECTIONS)
  const [run, setRun] = useState<SlideStart & { n: number }>(() => ({
    section: (start ?? 'top') as SlideSection,
    run: param('run') as SlideStart['run'],
    krill: Math.max(0, Math.floor(+param('krill')) || 0),
    n: 0,
  }))
  const [section, setSection] = useState<SlideSection>(run.section)
  const [krill, setKrill] = useState(run.krill)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [home, setHome] = useState(false)
  const worldRef = useRef<World | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  useEffect(() => enter(run.section, run.section === 'bumps' ? { run: run.run } : run.section === 'top' ? {} : { krill: String(run.krill) }), [run])

  const events = useRef<SlideEvents>({
    section: (s, n) => {
      setSection(s)
      enter(s, s === 'dive' || s === 'home' ? { krill: String(n) } : {})
    },
    krill: setKrill,
    home: () => {
      setHome(true)
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
    setHome(false)
    setSection('top')
    setKrill(0)
    setRun((r) => ({ section: 'top', run: 'middle', krill: 0, n: r.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E6F3FD', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="The ice slope"
        qaKey="__polesSlideQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={SLIDE_ANCHORS} els={els} {...input} />
            <SteerWheel ref={wheelRef} />
            <SteerHint ref={hintRef} />
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setRun((r) => ({ ...r, section, krill, n: r.n + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(230,243,253,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🐧 Tap to wake the ice
        </button>
      )}
      {(section === 'dive' || section === 'home' || krill > 0) && <Tummy n={krill} />}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {home && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.2, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={again} ariaLabel="Slide again">
              🔁 🐧
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

/** Papa's round tummy (top right, under the top bar): it fills up pink, a little more with every swarm he gulps. */
function Tummy({ n }: { n: number }) {
  const full = Math.min(1, n / 12)
  const size = 'clamp(64px, 11vmin, 96px)'
  return (
    <motion.div
      key={n}
      aria-label={`${n} krill`}
      initial={{ scale: n ? 1.25 : 1 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
      style={{ position: 'absolute', right: 16, top: 'calc(var(--top-clear) + 8px)', width: size, height: size, borderRadius: '50%', background: '#fff', border: '5px solid var(--ink)', overflow: 'hidden', zIndex: 20, pointerEvents: 'none', boxShadow: 'var(--shadow)' }}
    >
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${full * 100}%`, background: 'var(--pink)', transition: 'height .3s' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 'clamp(28px, 5vmin, 44px)' }}>🦐</div>
    </motion.div>
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

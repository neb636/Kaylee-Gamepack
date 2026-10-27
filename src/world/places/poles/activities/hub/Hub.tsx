// The Poles' home base: the globe (greybox 1, globe/globe.ts). She spins it to the Arctic and to Antarctica, then the
// sun comes out and she drags it up and down so day and night swap between the poles. The address bar follows her
// (sections.ts): which side faces her, and where the summer is. No voices yet (the full-loop gate): a short line at the
// bottom says what's on screen, for Dad.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useSections } from '../../../../kit/sections'
import type { PlaceProps } from '../../../../types'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { GLOBE_ANCHORS, PolesGlobe, type GlobeEvents, type Side } from '../../globe/globe'
import HUB_SECTIONS, { type HubSection } from './sections'

const WHERE: Record<Side, string> = {
  north: '🐻‍❄️ The Arctic: ice floating on the sea',
  south: '🐧 Antarctica: ice on a big land',
  middle: '🌍 Spin the globe!',
}
const SUMMER: Record<Side, string> = {
  north: '☀️ Summer up north · 🌙 night down south',
  south: '🌙 Night up north · ☀️ summer down south',
  middle: '☀️ Drag the sun up or down',
}

export function Hub(_props: PlaceProps) {
  const { start, param, enter } = useSections(HUB_SECTIONS)
  const [initial] = useState(() => ({ section: (start ?? 'globe') as HubSection, side: param('side') as Side, summer: param('summer') as Side }))
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [side, setSide] = useState<Side>(initial.side)
  const [sunOut, setSunOut] = useState(initial.section === 'sun')
  const [summer, setSummer] = useState<Side>(initial.section === 'sun' ? initial.summer : 'middle')
  const worldRef = useRef<PolesGlobe | null>(null)
  // What the address bar shows (so a copied link reproduces the moment).
  const now = useRef({ section: initial.section, side: initial.side, summer: initial.section === 'sun' ? initial.summer : 'middle' })
  const show = () => {
    const n = now.current
    enter(n.section, n.section === 'sun' ? { side: n.side, summer: n.summer } : { side: n.side })
  }
  useEffect(show, [])

  const events = useRef<GlobeEvents>({
    side: (s) => {
      now.current.side = s
      setSide(s)
      show()
    },
    sunOut: () => {
      now.current.section = 'sun'
      setSunOut(true)
      show()
    },
    summer: (s) => {
      now.current.summer = s
      setSummer(s)
      if (now.current.section === 'sun') show()
    },
  })

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F6EEFF', overflow: 'clip' }}>
      <View3D
        key={engine}
        name="The globe"
        qaKey="__polesGlobeQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new PolesGlobe(renderer, { side: now.current.side, sun: now.current.section === 'sun', summer: now.current.summer }, events.current)}
        anchors={(input, els) => <Anchors list={GLOBE_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(246,238,255,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🌍 Tap to wake the globe
        </button>
      )}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none', zIndex: 20 }}>
        <AnimatePresence mode="popLayout">
          {sunOut && side === 'middle' && (
            <motion.div key={`summer-${summer}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
              {SUMMER[summer]}
            </motion.div>
          )}
          <motion.div key={`side-${side}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
            {side === 'middle' && sunOut ? '🌍 Spin the globe, drag the sun' : WHERE[side]}
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

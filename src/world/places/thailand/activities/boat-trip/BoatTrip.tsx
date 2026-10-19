// Captain Kaylee's boat trip, greybox 1 (plan: planning/around-the-world/thailand/boat-trip.md): the boat toy in Phang
// Nga Bay, in placeholder shapes and with no voices yet, so Dad can feel the driving on the iPad first. The 3D bay is
// bay/bay.ts in the shared 3D view; without WebGL it's a flat card with the same stops.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sounds } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../engine/Anchors'
import { flag } from '../../engine/flags'
import { View3D, type RenderMode } from '../../engine/View3D'
import { Bay, BAY_ANCHORS } from './bay/bay'
import { Debug } from './Debug'
import { Flat } from './Flat'
import BOAT_SECTIONS, { type BoatSection } from './sections'

export function BoatTrip() {
  const { start, enter } = useSections(BOAT_SECTIONS)
  const [section] = useState<BoatSection>(() => start ?? 'pier')
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [landed, setLanded] = useState(false)
  const [flash, setFlash] = useState(0)
  const bayRef = useRef<Bay | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  // Read once: the address bar follows her around the bay and drops ?debug=1.
  const [debug] = useState(() => flag('debug') !== null)

  useEffect(() => enter(section), [])

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#A8DCFF', overflow: 'clip' }}>
      {mode === 'flat' ? (
        <Flat section={section} onSection={(s) => enter(s)} />
      ) : (
        <View3D
          key={engine}
          name="The bay"
          qaKey="__thaiBoatQA"
          worldRef={bayRef}
          onMode={setMode}
          make={(renderer) => {
            const bay = new Bay(renderer, section, { onSection: (s) => enter(s), onLanded: setLanded, onFlash: () => setFlash((n) => n + 1) })
            bay.setHintElement(hintRef.current)
            return bay
          }}
          anchors={(input, els) => (
            <>
              <Anchors list={BAY_ANCHORS} els={els} {...input} />
              {/* After a while with nothing touched: a finger pressing where to touch (the water ahead, or the boat). */}
              <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
                <motion.div
                  animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                  style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}
                >
                  👆
                </motion.div>
              </div>
            </>
          )}
        />
      )}
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(168,220,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🚤 Tap to wake the bay
        </button>
      )}
      <AnimatePresence>
        {landed && mode === 'webgl' && (
          <motion.button
            key="camera"
            aria-label="Take a photo"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              sounds.pop()
              bayRef.current?.snap()
            }}
            style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 18px)', bottom: 'calc(var(--safe-bottom) + 18px)', width: 104, height: 104, borderRadius: '50%', border: '5px solid #fff', background: 'var(--hotpink)', fontSize: 52, boxShadow: 'var(--shadow)', zIndex: 30 }}
          >
            📸
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {flash > 0 && (
          <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 40 }} />
        )}
      </AnimatePresence>
      {debug && <Debug bayRef={bayRef} />}
    </div>
  )
}

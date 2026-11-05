// Packing for Koh Samet: the trip kit's packing in Agong's own house (activities/hub/house.ts with the trip kit's
// plugin, trip/legs/house-plugin.ts, told by SAMET_TRIP what the trip is). Kaylee's room, the suitcase open: tap
// anything and it hops in (the swimsuit, the sun hat, the floaties, the bucket and spade, or the silly things), Mommy's
// hint makes the sun things glint, then she sits on the suitcase, click, her sun hat and floaties go on, and she walks
// down the stairs with it, bonk, bonk, straight onto the speedboat at Ban Phe (Mommy drives them there). The first trip
// of a session from the Thailand map packs (trip/session.ts); later ones go straight to the island.
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import type { Line } from '../../../../../sdk'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode, type World3D } from '../../../../engine3d/View3D'
import { ANCHORS as HOUSE_ANCHORS, House } from '../hub/house'
import { TripGuide, type TripGuideHandle } from '../../trip/legs/Guide'
import { TRIP_HOUSE_ANCHORS, TripHouse, type Phase } from '../../trip/legs/house-plugin'
import { PackCard } from '../../trip/legs/PackCard'
import { SAMET_TRIP } from './trip'

// (No name pills: it's the trip.)
const ANCHORS = [...HOUSE_ANCHORS.map((a) => ({ ...a, name: undefined, thai: undefined })), ...TRIP_HOUSE_ANCHORS]

interface Props {
  packed: string[]
  onPacked(ids: string[]): void
  /** Down the stairs with the suitcase: on to the speedboat. */
  onLeg(next: string): void
}

export function PackScreen({ packed, onPacked, onLeg }: Props) {
  const [n, setN] = useState(0)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [phase, setPhase] = useState<Phase | null>(null)
  const [flash, setFlash] = useState(0)
  const worldRef = useRef<World3D | null>(null)
  const tripRef = useRef<TripHouse | null>(null)
  const guideRef = useRef<TripGuideHandle>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const cb = useRef({ onPacked, onLeg })
  cb.current = { onPacked, onLeg }
  const start = useRef(packed)

  const make = (renderer: WebGLRenderer): World3D => {
    const say = (l: Line) => guideRef.current?.speak(l)
    const trip = new TripHouse(
      'pack',
      start.current,
      { say, section: () => {}, done: (next) => cb.current.onLeg(next), flash: () => setFlash((f) => f + 1), phase: setPhase, packed: (ids) => cb.current.onPacked(ids) },
      SAMET_TRIP,
    )
    tripRef.current = trip
    trip.setHintElement(() => hintRef.current)
    return new House(renderer, { section: 'upstairs' }, { onSpot: () => {}, onArrived: () => {} }, trip)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#A8DCFF', overflow: 'clip' }}>
      <View3D
        key={n}
        name="Packing for Koh Samet"
        qaKey="__thaiSametQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={ANCHORS} els={els} {...input} />
            {/* After a while with nothing touched: a finger pressing where to touch. */}
            <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
              <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
                👆
              </motion.div>
            </div>
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setN((v) => v + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(168,220,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🧳 Tap to wake the house
        </button>
      )}
      {mode === 'webgl' && <TripGuide ref={guideRef} />}
      {mode === 'webgl' && <PackCard open={phase === 'pack' || phase === 'sitting'} packed={packed} sitting={phase === 'sitting'} onClose={() => tripRef.current?.closeTap()} />}
      <AnimatePresence>
        {flash > 0 && <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 40 }} />}
      </AnimatePresence>
    </div>
  )
}

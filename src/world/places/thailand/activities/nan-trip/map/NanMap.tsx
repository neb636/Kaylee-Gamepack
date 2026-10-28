// The Nan map's screen: the 3D diorama (map3d.ts) with its tap targets, the 👆 after a while with nothing touched,
// Sparkle in the corner (trip/legs/Guide.tsx; Mommy talks there too), and Mommy's "Home, or one more?" after two stops:
// 🏠 drives the little Pajero to the airport (home, down the 3 road), 🚙 lets her pick another stop.
// A place picked (the little Pajero got there): `onGo` opens its drive.
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { sounds } from '../../../../../../sdk'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import type { PlaceId, Stop } from './layout'
import { MAP_ANCHORS, NanMap as MapWorld } from './map3d'

interface Props {
  /** The stops done so far, in the order she did them (the newest one's stamp lands). */
  stops: Stop[]
  /** Where she last drove to from the map (the little Pajero waits there; none: at the last stop, or the airport). */
  from?: PlaceId | null
  /** The Nan Mountain Cup is on the trip (cup/rules.ts): a stop in Nan town. */
  cup?: boolean
  onGo: (place: PlaceId) => void
}

export function NanMap({ stops, from, cup = false, onGo }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [ask, setAsk] = useState(false)
  const worldRef = useRef<MapWorld | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<TripGuideHandle>(null)
  const go = useRef(onGo)
  go.current = onGo

  const make = (renderer: WebGLRenderer) => {
    const w = new MapWorld(renderer, { say: (l) => guideRef.current?.speak(l), section: () => {}, done: () => {}, go: (p) => go.current(p), ask: setAsk }, { stops, from, cup })
    w.setHintElement(hintRef.current)
    return w
  }

  const choice = (icon: string, label: string, color: string, on: () => void, delay: number) => (
    <motion.button
      aria-label={label}
      initial={{ scale: 0, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18, delay }}
      whileTap={{ scale: 0.88 }}
      onClick={() => {
        sounds.pop()
        on()
      }}
      style={{ width: 'clamp(96px, 14vmin, 128px)', height: 'clamp(96px, 14vmin, 128px)', borderRadius: '50%', border: '5px solid #fff', background: color, fontSize: 'clamp(44px, 7vmin, 60px)', boxShadow: 'var(--shadow)', padding: 0, display: 'grid', placeItems: 'center' }}
    >
      {icon}
    </motion.button>
  )

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E4DDF4', overflow: 'clip' }}>
      <View3D
        key={key}
        name="The Nan map"
        qaKey="__thaiNanQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={MAP_ANCHORS} els={els} {...input} />
            {/* After a while with nothing touched: a finger on where to go next. */}
            <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
              <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.0, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
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
            setKey((k) => k + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(228,221,244,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🗺️ Tap to wake the map
        </button>
      )}
      {mode === 'webgl' && <TripGuide ref={guideRef} />}
      {/* Mommy's "Home, or one more?": 🏠 home (the airport), 🚙 one more stop. */}
      <AnimatePresence>
        {ask && mode === 'webgl' && (
          <motion.div key="ask" style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 18px)', bottom: 'calc(var(--safe-bottom) + 18px)', display: 'flex', gap: 'clamp(14px, 3vmin, 24px)', zIndex: 34 }}>
            {choice('🏠', 'Home: fly home from the airport', 'var(--pink)', () => worldRef.current?.home(), 0.1)}
            {choice('🚙', 'One more stop', 'var(--lavender)', () => worldRef.current?.more(), 0.25)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

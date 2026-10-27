// The Nan Mountain Cup's race ground screen (sections `cup`, `podium`, `cup-win`; greybox 3): the 3D race ground
// (ground.ts) with its tap targets and the 👆 after a while, and over it the few buttons there are, in big pictures:
// 🗺️ back to the Nan map from the board, ➡️ on the podium (back to the board, or 🏆 to the Cup after the last race), and
// after the Cup Mommy's photo and 🗺️ (the stamp lands on Nan town). The world stays up between the board, the podium
// and the Cup (the camera glides); the race is its own screen (Cup.tsx).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { sounds } from '../../../../../../sdk'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { TripGuide } from '../../../trip/legs/Guide'
import { drawPhoto } from '../photo'
import { Snapshot } from '../Snapshot'
import { CupGround, GROUND_ANCHORS, type GroundStart, type GroundUi } from './ground'
import type { TrackId } from './track'

interface Props {
  start: GroundStart
  /** A track picked on the board. */
  onRace: (track: TrackId) => void
  /** ➡️ on the podium. `last`: it was the last race (🏆 to the Cup). */
  onNext: () => void
  last?: boolean
  /** 🗺️: back to the Nan map (from the board, or after the Cup). */
  onMap: () => void
}

const NONE: GroundUi = { map: false, next: false, photo: false, end: false }

export function Ground({ start, onRace, onNext, last = false, onMap }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [ui, setUi] = useState<GroundUi>(NONE)
  const worldRef = useRef<CupGround | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const startRef = useRef(start)
  const race = useRef(onRace)
  race.current = onRace
  // A new place on the race ground (the trip moved on): the same world, set up there.
  const sig = JSON.stringify(start)
  useEffect(() => {
    if (startRef.current === start || JSON.stringify(startRef.current) === sig) return
    startRef.current = start
    worldRef.current?.go(start)
  }, [sig])
  const photo = useMemo(() => (ui.photo ? drawPhoto('cup') : ''), [ui.photo])

  const make = (renderer: WebGLRenderer) => {
    const w = new CupGround(renderer, { race: (t) => race.current(t), ui: setUi }, startRef.current)
    w.setHintElement(hintRef.current)
    return w
  }

  const size = 'clamp(92px, 15vmin, 128px)'
  const button = (icon: string, label: string, on: () => void, color = 'var(--pink)') => (
    <motion.button
      key={label}
      aria-label={label}
      initial={{ scale: 0, y: 40 }}
      animate={{ scale: [1, 1.1, 1], y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ scale: { repeat: Infinity, duration: 1.2 }, y: { type: 'spring', stiffness: 300, damping: 18 } }}
      whileTap={{ scale: 0.88 }}
      onClick={() => {
        sounds.pop()
        on()
      }}
      style={{ width: size, height: size, borderRadius: '50%', border: '6px solid #fff', background: color, fontSize: 'clamp(42px, 7vmin, 60px)', boxShadow: 'var(--shadow)', padding: 0, display: 'grid', placeItems: 'center' }}
    >
      {icon}
    </motion.button>
  )

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#C9E6F4', overflow: 'clip' }}>
      <View3D
        key={key}
        name="The Nan Mountain Cup's race ground"
        qaKey="__thaiNanQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={GROUND_ANCHORS} els={els} {...input} />
            {/* After a while with nothing touched: a finger on what to tap. */}
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(201,230,244,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🏁 Tap to wake the race ground
        </button>
      )}
      {mode === 'webgl' && <TripGuide hidden={ui.end} />}
      <AnimatePresence>{ui.photo && mode === 'webgl' && <Snapshot key="cup" src={photo} />}</AnimatePresence>
      <div style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 18px)', bottom: 'calc(var(--safe-bottom, 0px) + 18px)', display: 'flex', gap: 'clamp(12px, 2.6vw, 24px)', zIndex: 50 }}>
        <AnimatePresence>
          {mode === 'webgl' && start.mode === 'board' && ui.map && button('🗺️', 'The Nan map', onMap, 'var(--lavender)')}
          {mode === 'webgl' && start.mode === 'podium' && ui.next && button(last ? '🏆' : '➡️', last ? 'The Cup!' : 'Back to the board', onNext, last ? 'var(--butter)' : 'var(--pink)')}
          {mode === 'webgl' && start.mode === 'cup' && ui.end && button('🗺️', 'The Nan map: the stamp', onMap, 'var(--butter)')}
        </AnimatePresence>
      </div>
    </div>
  )
}

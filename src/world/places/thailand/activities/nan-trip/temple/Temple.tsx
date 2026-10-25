// Wat Phumin's screen: the 3D temple (temple3d.ts) with its tap targets, the 👆 after a while with nothing touched, the
// flash of Mommy's photo under the whispering lovers, and the end card: 🔁 the temple again, or 🚙 back on the road (the
// valley road, to the mushroom farm). No voices yet (the greybox). (No flat version: 3D activities don't need one.)
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../engine/View3D'
import { FarmEnd } from '../mushrooms/Mushrooms'
import type { Round } from './layout'
import { TEMPLE_ANCHORS, WatPhumin } from './temple3d'

interface Props {
  round: Round
  onRound: (r: Round) => void
  /** The end card's 🚙: back on the road. */
  onDrive: () => void
}

export function Temple({ round, onRound, onDrive }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [done, setDone] = useState(false)
  const [flash, setFlash] = useState(0)
  const worldRef = useRef<WatPhumin | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  // A rebuilt world (a lost GPU context, 🔁) starts where she is now, not where the link was.
  const now = useRef(round)
  const cb = useRef(onRound)
  cb.current = onRound

  const make = (renderer: WebGLRenderer) => {
    const w = new WatPhumin(
      renderer,
      {
        say: () => {},
        section: () => {},
        done: () => {},
        round: (r) => {
          now.current = r
          cb.current(r)
        },
        photo: () => setFlash((n) => n + 1),
        allDone: () => setDone(true),
      },
      { round: now.current },
    )
    w.setHintElement(hintRef.current)
    return w
  }

  const again = () => {
    setDone(false)
    now.current = '1'
    onRound('1')
    setKey((k) => k + 1)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#3A2F4E', overflow: 'clip' }}>
      {mode !== 'flat' && (
        <View3D
          key={key}
          name="Wat Phumin"
          qaKey="__thaiNanQA"
          worldRef={worldRef}
          onMode={setMode}
          make={make}
          anchors={(input, els) => (
            <>
              <Anchors list={TEMPLE_ANCHORS} els={els} {...input} />
              {/* After a while with nothing touched: a finger on what to do next. */}
              <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
                <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.0, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
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
            setKey((k) => k + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(58,47,78,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: '#fff', zIndex: 70 }}
        >
          🛕 Tap to wake the temple
        </button>
      )}
      <AnimatePresence>{flash > 0 && <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 40 }} />}</AnimatePresence>
      <AnimatePresence>{done && <FarmEnd label="Wat Phumin again" onAgain={again} onDrive={onDrive} />}</AnimatePresence>
    </div>
  )
}

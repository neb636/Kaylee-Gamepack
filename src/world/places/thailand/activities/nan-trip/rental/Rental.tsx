// The rental desk's screen: the 3D hall and car park (rental3d.ts) with their tap targets and the 👆 after a while with
// nothing touched. Buckled up and driven off: `onDone` (the Nan map).
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../engine/View3D'
import type { Round } from './layout'
import { RENTAL_ANCHORS, RentalDesk } from './rental3d'

interface Props {
  round: Round
  onRound: (r: Round) => void
  onDone: () => void
}

export function Rental({ round, onRound, onDone }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const worldRef = useRef<RentalDesk | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  // A rebuilt world (a lost GPU context) starts where she is now, not where the link was.
  const now = useRef(round)
  const cb = useRef({ onRound, onDone })
  cb.current = { onRound, onDone }

  const make = (renderer: WebGLRenderer) => {
    const w = new RentalDesk(
      renderer,
      {
        say: () => {},
        section: () => {},
        done: () => {},
        round: (r) => {
          now.current = r
          cb.current.onRound(r)
        },
        allDone: () => cb.current.onDone(),
      },
      { round: now.current },
    )
    w.setHintElement(hintRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#DCEBF8', overflow: 'clip' }}>
      <View3D
        key={key}
        name="The rental desk"
        qaKey="__thaiNanQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={RENTAL_ANCHORS} els={els} {...input} />
            {/* After a while with nothing touched: a finger on what to do next. */}
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(220,235,248,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🔑 Tap to wake the rental desk
        </button>
      )}
    </div>
  )
}

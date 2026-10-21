// The Vet Clinic's screen: the 3D exam room (clinic.ts), its tap targets, the patient's thought bubble (the tool it
// needs next), the 👆 after a while with nothing touched, and the flat picture version without WebGL (Flat.tsx). When
// all three patients are better, a big 🛝 takes her back to the playground.
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../../engine/View3D'
import type { PatientId } from '../../sections'
import { VET_ANCHORS, VetClinic } from './clinic'
import { VetFlat } from './Flat'

interface Props {
  patient: PatientId
  onPatient: (id: PatientId) => void
  onHealed: (id: PatientId) => void
  onPlay: () => void
}

export function Vet({ patient, onPatient, onHealed, onPlay }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [need, setNeed] = useState<string | null>(null)
  const [allDone, setAllDone] = useState(false)
  const worldRef = useRef<VetClinic | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  // A rebuilt world (a lost GPU context) starts with the patient on the table now, not the link's.
  const now = useRef(patient)
  const cb = useRef({ onPatient, onHealed })
  cb.current = { onPatient, onHealed }

  const make = (renderer: WebGLRenderer) => {
    const w = new VetClinic(
      renderer,
      {
        say: () => {},
        section: () => {},
        done: () => {},
        patient: (id) => {
          now.current = id
          cb.current.onPatient(id)
        },
        healed: (id) => cb.current.onHealed(id),
        need: setNeed,
        allDone: () => setAllDone(true),
      },
      { patient: now.current },
    )
    w.setHintElement(hintRef.current)
    w.setBubbleElement(bubbleRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E9FBF4', overflow: 'clip' }}>
      {mode === 'flat' ? (
        <VetFlat patient={patient} onPatient={onPatient} onHealed={onHealed} onAllDone={() => setAllDone(true)} />
      ) : (
        <View3D
          key={key}
          name="The Vet Clinic"
          qaKey="__thaiMallQA"
          worldRef={worldRef}
          onMode={setMode}
          make={make}
          anchors={(input, els) => (
            <>
              <Anchors list={VET_ANCHORS} els={els} {...input} />
              {/* The patient's thought bubble: the tool it needs next. */}
              <div ref={bubbleRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 15000 }}>
                <AnimatePresence mode="popLayout">
                  {need && (
                    <motion.div
                      key={need}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, y: [0, -6, 0] }}
                      exit={{ scale: 0 }}
                      transition={{ y: { repeat: Infinity, duration: 1.6 }, scale: { type: 'spring', stiffness: 400, damping: 14 } }}
                      style={{ translate: '-10% -100%', width: 'clamp(56px, 9vmin, 84px)', height: 'clamp(56px, 9vmin, 84px)', borderRadius: '50%', background: '#fff', border: '4px solid var(--lavender-dark)', display: 'grid', placeItems: 'center', fontSize: 'clamp(30px, 5vmin, 46px)', boxShadow: '0 4px 10px rgba(43,35,48,.18)' }}
                    >
                      {need}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* After a while with nothing touched: a finger on the tool it needs (or where to use it). */}
              <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
                <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
                  👆
                </motion.div>
                <motion.div animate={{ y: [0, -14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} style={{ display: 'none', fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -90%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
                  👇
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(233,251,244,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🩺 Tap to wake the clinic
        </button>
      )}
      <AnimatePresence>
        {allDone && (
          <motion.button
            aria-label="Back to the playground"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 0.6, rotate: { repeat: Infinity, repeatDelay: 1.6, duration: 0.6 } }}
            whileTap={{ scale: 0.88 }}
            onClick={onPlay}
            style={{ position: 'absolute', left: '50%', top: 'calc(var(--top-clear, 104px) + 12px)', translate: '-50% 0', width: 'clamp(96px, 16vmin, 132px)', height: 'clamp(96px, 16vmin, 132px)', borderRadius: '50%', border: '6px solid #fff', background: 'var(--hotpink)', fontSize: 'clamp(48px, 8vmin, 66px)', boxShadow: 'var(--shadow)', zIndex: 60, padding: 0 }}
          >
            🛝
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

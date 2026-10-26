// Bo Kluea's salt hut's screen: the 3D hut (salt3d.ts) with its tap targets, the 👆 after a while with nothing touched,
// and at the end (the bags on the shelf) the end card: 🔁 the salt hut again, or 🗺️ back to the Nan map (its stamp
// lands there).
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../engine/View3D'
import { FarmEnd } from '../mushrooms/Mushrooms'
import type { Round } from './layout'
import { SALT_ANCHORS, SaltHut } from './salt3d'

interface Props {
  round: Round
  onRound: (r: Round) => void
  /** The end card's 🗺️: back to the Nan map (this stop's stamp lands on it). */
  onMap: () => void
}

export function Salt({ round, onRound, onMap }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [done, setDone] = useState(false)
  const worldRef = useRef<SaltHut | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  // A rebuilt world (a lost GPU context, 🔁) starts where she is now, not where the link was.
  const now = useRef(round)
  const cb = useRef(onRound)
  cb.current = onRound

  const make = (renderer: WebGLRenderer) => {
    const w = new SaltHut(
      renderer,
      {
        say: () => {},
        section: () => {},
        done: () => {},
        round: (r) => {
          now.current = r
          cb.current(r)
        },
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
    <div style={{ position: 'absolute', inset: 0, background: '#D6E3EE', overflow: 'clip' }}>
      <View3D
        key={key}
        name="The salt wells"
        qaKey="__thaiNanQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={SALT_ANCHORS} els={els} {...input} />
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(214,227,238,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🧂 Tap to wake the salt hut
        </button>
      )}
      <AnimatePresence>{done && <FarmEnd onAgain={again} onMap={onMap} label="The salt hut again" />}</AnimatePresence>
    </div>
  )
}

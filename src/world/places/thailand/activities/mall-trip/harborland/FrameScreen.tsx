// HarborLand's Big Frame on screen: the 3D frame in its hall (frame.ts) with its tap targets, the lit sign's letters laid
// over it and the 👆 after a while with nothing touched. The `at` in
// the address follows the level she's on.
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { BigFrame, FRAME_ANCHORS } from './frame'
import type { At, RideId } from './layout'
import { HarborSign } from './sign'
import { mallVoice } from '../voice'

interface Props {
  at: At
  socks: string
  /** Daddy's hairdo from the barber. */
  hair: string
  onAt(at: At): void
  onRide(id: RideId): void
}

export function FrameScreen({ at, socks, hair, onAt, onRide }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const worldRef = useRef<BigFrame | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const signRef = useRef<HTMLDivElement>(null)
  // A rebuilt world (a lost GPU context) starts where she is now.
  const state = useRef({ at })
  state.current = { at }
  const cb = useRef({ onAt, onRide })
  cb.current = { onAt, onRide }

  const make = (renderer: WebGLRenderer) => {
    const w = new BigFrame(renderer, { say: (l) => mallVoice.say(l), done: () => {}, section: (a) => cb.current.onAt(a as At), ride: (id) => cb.current.onRide(id) }, { at: state.current.at, socks, hair })
    w.setHintElement(hintRef.current)
    w.setSign(signRef.current)
    return w
  }

  return (
    <>
      <View3D
        key={key}
        name="the Big Frame"
        qaKey="__thaiMallQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <HarborSign ref={signRef} />
            <Anchors list={FRAME_ANCHORS} els={els} {...input} />
            {/* After a while with nothing touched: a finger pressing a big ride she hasn't had yet. */}
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
            setKey((k) => k + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(241,232,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🛝 Tap to wake the Big Frame
        </button>
      )}
    </>
  )
}

// HarborLand's first climbing toy on screen (greybox 1, PR #120: the Big Frame's stand-in until it's rebuilt at real
// scale): the 3D playground (harborland.ts) with its tap targets and the 👆 after a while with nothing touched, and the
// flat picture pages without WebGL (../Flat.tsx). Its sections (play, mountain, dragon) follow the floor she's on.
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../engine/View3D'
import { Flat } from '../Flat'
import { HARBOR_ANCHORS, HarborLand, type HarborSection } from './harborland'
import type { RideId } from './layout'

interface Props {
  section: HarborSection
  socks: string
  rides: RideId[]
  onSection(s: HarborSection): void
  onRide(id: RideId): void
}

export function Playground({ section, socks, rides, onSection, onRide }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const worldRef = useRef<HarborLand | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  // A rebuilt world (a lost GPU context) starts where she is now.
  const state = useRef({ section, rides })
  state.current = { section, rides }
  const cb = useRef({ onSection, onRide })
  cb.current = { onSection, onRide }

  const make = (renderer: WebGLRenderer) => {
    const w = new HarborLand(renderer, {
      say: () => {},
      done: () => {},
      section: (s) => cb.current.onSection(s as HarborSection),
      ride: (id) => cb.current.onRide(id),
    }, { section: state.current.section, socks, rides: state.current.rides })
    w.setHintElement(hintRef.current)
    return w
  }

  return (
    <>
      {mode === 'flat' ? (
        <Flat section={section} rides={rides} onSection={onSection} onRide={onRide} />
      ) : (
        <View3D
          key={key}
          name="HarborLand"
          qaKey="__thaiMallQA"
          worldRef={worldRef}
          onMode={setMode}
          make={make}
          anchors={(input, els) => (
            <>
              <Anchors list={HARBOR_ANCHORS} els={els} {...input} />
              {/* After a while with nothing touched: a finger pressing the next ride. */}
              <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
                <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(241,232,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🛝 Tap to wake the playground
        </button>
      )}
    </>
  )
}

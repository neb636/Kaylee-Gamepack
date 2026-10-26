// The Nan map's screen: the 3D diorama (map3d.ts) with its tap targets and the 👆 after a while with nothing touched.
// A place picked (the little Pajero got there): `onGo` opens its drive.
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../engine/View3D'
import type { PlaceId, Stop } from './layout'
import { MAP_ANCHORS, NanMap as MapWorld } from './map3d'

interface Props {
  /** The stops done so far, in the order she did them (the newest one's stamp lands). */
  stops: Stop[]
  onGo: (place: PlaceId) => void
}

export function NanMap({ stops, onGo }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const worldRef = useRef<MapWorld | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const go = useRef(onGo)
  go.current = onGo

  const make = (renderer: WebGLRenderer) => {
    const w = new MapWorld(renderer, { say: () => {}, section: () => {}, done: () => {}, go: (p) => go.current(p) }, { stops })
    w.setHintElement(hintRef.current)
    return w
  }

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
    </div>
  )
}

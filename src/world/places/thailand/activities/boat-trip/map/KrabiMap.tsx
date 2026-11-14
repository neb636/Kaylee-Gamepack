// The Krabi map's screen: the 3D diorama (map3d.ts) with its tap targets, the 👆 after a while with nothing touched, and
// the loading cover it fades in from (trip/MapCover.tsx). The words go to the boat trip's own guide (Sparkle in the
// corner, BoatTrip.tsx). A place picked (the songthaew got there): `onGo` opens that part of the trip.
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import type { Line } from '../../../../../../sdk'
import { IS_MOUSE } from '../../../../../../sdk/device'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { MapCover } from '../../../trip/MapCover'
import { SKY_TOP } from '../../../trip/sky'
import type { PlaceId, Stop } from './layout'
import { KrabiMap as MapWorld, KRABI_CAM, MAP_ANCHORS } from './map3d'

interface Props {
  /** Krabi's places done so far, in the order she did them (the newest one's stamp lands). */
  been: Stop[]
  /** Where the songthaew waits (the place she came back from; none: at the last place done, or the airport). */
  from?: PlaceId | null
  say: (l: Line) => void
  onGo: (place: 'chang' | 'pier' | 'airport') => void
  onMode?: (mode: RenderMode) => void
}

export function KrabiMap({ been, from, say, onGo, onMode }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  // The loading screen stays over the board while the camera already starts moving, then fades into it (trip/sky.ts).
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    // (If the board never draws, say the camera lab froze it, the cover still goes.)
    const safety = setTimeout(() => setRevealed(true), 6000)
    return () => clearTimeout(safety)
  }, [])
  const worldRef = useRef<MapWorld | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const ev = useRef({ say, onGo })
  ev.current = { say, onGo }

  const make = (renderer: WebGLRenderer) => {
    const w = new MapWorld(renderer, { say: (l) => ev.current.say(l), section: () => {}, done: () => {}, go: (p) => ev.current.onGo(p), revealed: () => setRevealed(true) }, { been, from })
    w.setHintElement(hintRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: SKY_TOP, overflow: 'clip' }}>
      <View3D
        key={key}
        name="The Krabi map"
        qaKey="__thaiBoatQA"
        worldRef={worldRef}
        onMode={(m) => {
          setMode(m)
          onMode?.(m)
        }}
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
      <MapCover show={!revealed && mode !== 'lost'} fade={KRABI_CAM.fade} />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setKey((k) => k + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(228,221,244,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          {IS_MOUSE ? '🗺️ Click to wake the map' : '🗺️ Tap to wake the map'}
        </button>
      )}
    </div>
  )
}

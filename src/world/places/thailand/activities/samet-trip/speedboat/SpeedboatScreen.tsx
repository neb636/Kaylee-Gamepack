// The speedboat to Koh Samet, on screen (speedboat.ts is the world): the ride as a cutscene, the boat and everyone on
// it still tap targets, and ⏩ to skip on to Na Dan pier. Sparkle sits in the corner (trip/legs/Guide.tsx) and everyone talks through her bubble.
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { WebGLRenderer } from 'three'
import { sounds } from '../../../../../../sdk'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import type { TimeOfDay } from '../island/scenery'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import { BOAT_ANCHORS, SametSpeedboat as World } from './speedboat'

interface Props {
  time?: TimeOfDay
  packed?: string[]
  /** They're on Na Dan pier: the island. */
  onIsland(): void
}

export function SpeedboatScreen({ time, packed, onIsland }: Props) {
  const [n, setN] = useState(0)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [skip, setSkip] = useState(false)
  const worldRef = useRef<World | null>(null)
  const guideRef = useRef<TripGuideHandle>(null)
  const cb = useRef(onIsland)
  cb.current = onIsland
  const make = (renderer: WebGLRenderer) => new World(renderer, { time, packed }, { done: () => cb.current(), say: (l, mute) => guideRef.current?.speak(l, mute) })
  // ⏩ once the motors have started (and not once it's slowing in to the pier).
  useEffect(() => {
    const id = setInterval(() => setSkip(!!worldRef.current?.canSkip), 500)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#BFE9FA', overflow: 'clip' }}>
      <style>{CSS}</style>
      <View3D
        key={n}
        name="The speedboat to Koh Samet"
        qaKey="__thaiSametQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => <Anchors list={BOAT_ANCHORS} els={els} {...input} />}
      />
      {skip && mode === 'webgl' && (
        <motion.button
          aria-label="Skip ahead"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            sounds.whoosh()
            worldRef.current?.skip()
            setSkip(false)
          }}
          className="sb-skip"
        >
          ⏩
        </motion.button>
      )}
      {mode === 'webgl' && <TripGuide ref={guideRef} />}
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setN((v) => v + 1)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(191,233,250,.92)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🛥️ Tap to wake the boat
        </button>
      )}
    </div>
  )
}

const CSS = `
.sb-skip { position: absolute; right: calc(var(--safe-right, 0px) + 18px); bottom: calc(var(--safe-bottom, 0px) + 18px); width: clamp(88px, 12vmin, 104px); height: clamp(88px, 12vmin, 104px); border-radius: 50%; border: 5px solid #fff; background: var(--lavender); font-size: clamp(36px, 6vmin, 48px); box-shadow: var(--shadow); z-index: 12; padding: 0; }
`

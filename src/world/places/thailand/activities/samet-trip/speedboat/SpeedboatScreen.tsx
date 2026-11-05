// The speedboat to Koh Samet, on screen (speedboat.ts is the world): the boat with its tap targets, a finger pressing
// on the water beside Kaylee when she's had no hoof in it for a while, and ⏩ to skip ahead to the pier once the ride
// has gone on a bit, and the letterbox bars while the cinema camera (?cine=1) films it. Greybox: no voices yet.
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { WebGLRenderer } from 'three'
import { sounds } from '../../../../../../sdk'
import { Anchors } from '../../../../../engine3d/Anchors'
import { Letterbox } from '../../../../../engine3d/Letterbox'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import type { TimeOfDay } from '../island/scenery'
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
  const [cine, setCine] = useState(false)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const cb = useRef(onIsland)
  cb.current = onIsland
  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, { time, packed }, { done: () => cb.current() })
    w.setHintElement(hintRef.current)
    return w
  }
  // ⏩ once the ride has gone on a while (and not once it's slowing in to the pier).
  useEffect(() => {
    const id = setInterval(() => {
      setSkip(!!worldRef.current?.canSkip)
      setCine(!!worldRef.current?.cinematic)
    }, 250)
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
        anchors={(input, els) => (
          <>
            <Anchors list={BOAT_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="sb-hint" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      <Letterbox on={cine && mode === 'webgl'} />
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
.sb-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; }
.sb-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); animation: sb-press 1.4s ease-in-out infinite; }
@keyframes sb-press { 0%, 100% { transform: scale(1); } 45% { transform: scale(0.82) translateY(6px); } }
.sb-skip { position: absolute; right: calc(var(--safe-right, 0px) + 18px); bottom: calc(var(--safe-bottom, 0px) + 18px); width: clamp(88px, 12vmin, 104px); height: clamp(88px, 12vmin, 104px); border-radius: 50%; border: 5px solid #fff; background: var(--lavender); font-size: clamp(36px, 6vmin, 48px); box-shadow: var(--shadow); z-index: 12; padding: 0; }
`

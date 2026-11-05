// The sunset at the driftwood tree, on screen (sunset.ts is the world): Ao Prao with its tap targets, the pressing
// finger on the sun, a speech bubble over whoever is talking (the words for Dad: the voices come with the full loop),
// Mommy's photo flashing and landing in the corner, and once night has fallen the 🔥 button to the fire show.
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { WebGLRenderer } from 'three'
import { BigButton } from '../../../../../../sdk'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import type { StopId } from '../island/layout'
import { FINALE_CSS } from './FireShowScreen'
import { Sunset as World, SUNSET_ANCHORS } from './sunset'

interface Props {
  flags: StopId[]
  /** Mommy's photo of the three of them (for Agong's wall). */
  onPhoto(src: string): void
  /** On to the fire show. */
  onFireShow(): void
}

export function SunsetScreen({ flags, onPhoto, onFireShow }: Props) {
  const [n, setN] = useState(0)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [photo, setPhoto] = useState<{ n: number; src: string } | null>(null)
  const [night, setNight] = useState(false)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const cb = useRef({ onPhoto })
  cb.current = { onPhoto }

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, { flags }, {
      photo: (src) => {
        setPhoto((p) => ({ n: (p?.n ?? 0) + 1, src }))
        cb.current.onPhoto(src)
      },
      night: () => setNight(true),
    })
    w.setHintElement(hintRef.current)
    w.setBubbleElement(bubbleRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F5CFB2', overflow: 'clip' }}>
      <style>{FINALE_CSS}</style>
      <View3D
        key={n}
        name="Ao Prao at sunset"
        qaKey="__thaiSametQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={SUNSET_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="fin-hint" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
            <div className="fin-bubble" style={{ display: 'none' }} ref={bubbleRef} />
          </>
        )}
      />
      <AnimatePresence>
        {photo && <motion.div key={`f${photo.n}`} className="fin-flash" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} transition={{ duration: 0.45 }} />}
      </AnimatePresence>
      <AnimatePresence>
        {photo && (
          <motion.img
            key={`p${photo.n}`}
            src={photo.src}
            alt="Mommy's photo of the sunset"
            className="fin-photo"
            initial={{ scale: 1.6, rotate: 0, x: '-30vw', y: '20vh', opacity: 0 }}
            animate={{ scale: 1, rotate: -6, x: 0, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {night && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fin-over">
            <BigButton color="pink" onClick={onFireShow} ariaLabel="To the fire show">
              🔥
            </BigButton>
          </motion.div>
        )}
      </AnimatePresence>
      {mode === 'lost' && (
        <button onClick={() => { setMode('webgl'); setN((v) => v + 1) }} className="fin-wake">
          🌅 Tap to wake the beach
        </button>
      )}
    </div>
  )
}

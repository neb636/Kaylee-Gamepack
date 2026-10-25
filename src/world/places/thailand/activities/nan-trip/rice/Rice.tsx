// The rice farm's screen: the 3D farm and Stop Time Cafe's deck (rice3d.ts) with its tap targets, the 👆 after a while
// with nothing touched, the photo Mommy takes on the deck (a flash, then it pops up like a print), the video of real rice
// growing (skippable: ⏭ ☕ back to the deck; the 3D world holds still under it), and the end card: 🔁 the farm again, or
// 🚙 back on the road (the 3 road, the way home). Sparkle sits in the corner (trip/legs/Guide.tsx) and everyone talks
// out loud in their own voice. (No flat version: 3D activities don't need one.)
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { VideoBreak } from '../../../../../kit/Theater'
import { Anchors } from '../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../engine/View3D'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import { FarmEnd } from '../mushrooms/Mushrooms'
import type { Round } from './layout'
import { RICE_ANCHORS, RiceFarm } from './rice3d'
import { RICE_VIDEO } from './video'

interface Props {
  round: Round
  onRound: (r: Round) => void
  /** The end card's 🚙: back on the road. */
  onDrive: () => void
}

export function Rice({ round, onRound, onDrive }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [done, setDone] = useState(false)
  const [video, setVideo] = useState(false)
  const [photo, setPhoto] = useState<{ src: string; n: number } | null>(null)
  const worldRef = useRef<RiceFarm | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<TripGuideHandle>(null)
  // A rebuilt world (a lost GPU context, 🔁) starts where she is now, not where the link was.
  const now = useRef(round)
  const cb = useRef(onRound)
  cb.current = onRound

  const make = (renderer: WebGLRenderer) => {
    const w = new RiceFarm(
      renderer,
      {
        say: (l) => guideRef.current?.speak(l),
        section: () => {},
        done: () => {},
        round: (r) => {
          now.current = r
          cb.current(r)
        },
        photo: (src) => setPhoto((p) => ({ src, n: (p?.n ?? 0) + 1 })),
        // The photo's had its moment: the video, then the end card.
        allDone: () => setVideo(true),
      },
      { round: now.current },
    )
    w.setHintElement(hintRef.current)
    return w
  }

  const again = () => {
    setDone(false)
    setVideo(false)
    setPhoto(null)
    now.current = 'plant'
    onRound('plant')
    setKey((k) => k + 1)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#D6E3EE', overflow: 'clip' }}>
      {mode !== 'flat' && (
        <View3D
          key={key}
          name="Rice farm"
          qaKey="__thaiNanQA"
          worldRef={worldRef}
          paused={video}
          onMode={setMode}
          make={make}
          anchors={(input, els) => (
            <>
              <Anchors list={RICE_ANCHORS} els={els} {...input} />
              {/* After a while with nothing touched: a finger on what to do next. */}
              <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
                <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.0, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(214,227,238,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🌾 Tap to wake the rice farm
        </button>
      )}
      {mode === 'webgl' && <TripGuide ref={guideRef} hidden={video || done} />}
      <AnimatePresence>{photo && !video && <Snapshot key={photo.n} src={photo.src} />}</AnimatePresence>
      {video && (
        <VideoBreak
          video={RICE_VIDEO}
          next="☕"
          onDone={() => {
            setVideo(false)
            setDone(true)
          }}
        />
      )}
      <AnimatePresence>{done && <FarmEnd label="The rice farm again" onAgain={again} onDrive={onDrive} />}</AnimatePresence>
    </div>
  )
}

/** Mommy's photo: a white flash, then the print drops in, tilted, in the top corner (clear of the 🏠 and the deck). */
function Snapshot({ src }: { src: string }) {
  return (
    <>
      <motion.div key="flash" initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 40 }} />
      <motion.div
        initial={{ y: -260, rotate: -14, opacity: 0 }}
        animate={{ y: 0, rotate: 5, opacity: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 170, damping: 14, delay: 0.2 }}
        aria-label="Mommy's photo"
        style={{ position: 'absolute', right: 'clamp(12px, 3vw, 36px)', top: 'calc(var(--top-clear, 72px) + 8px)', width: 'clamp(150px, 26vmin, 260px)', padding: '8px 8px 26px', background: '#fff', borderRadius: 6, boxShadow: '0 10px 24px rgba(43,35,48,.28)', zIndex: 41, pointerEvents: 'none' }}
      >
        <img src={src} alt="" style={{ display: 'block', width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 2 }} />
      </motion.div>
    </>
  )
}

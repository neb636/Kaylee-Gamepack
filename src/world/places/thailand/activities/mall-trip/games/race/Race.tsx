// The Racing Slide's screen: the 3D slide (track.ts), its tap targets, the countdown's big numbers, the ring that closes
// on her before each bump (rounds 2 and 3), the 👆 when she's stuck (or the first time something's new), and the flat
// picture version without WebGL (Flat.tsx). After three races a big 🛝 takes her back to the playground.
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../../engine/View3D'
import { RaceFlat } from './Flat'
import { RACE_ANCHORS, RaceSlide } from './track'

interface Props {
  /** The race to start with (1, 2 or 3). */
  round: number
  onRound: (n: number) => void
  onWon: (n: number) => void
  onPlay: () => void
}

export function Race({ round, onRound, onWon, onPlay }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [count, setCount] = useState<number | null>(null)
  const [allDone, setAllDone] = useState(round > 3)
  const worldRef = useRef<RaceSlide | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  // A rebuilt world (a lost GPU context) starts at the race she's on now, not the link's.
  const now = useRef(round)
  const cb = useRef({ onRound, onWon })
  cb.current = { onRound, onWon }

  const make = (renderer: WebGLRenderer) => {
    const w = new RaceSlide(
      renderer,
      {
        say: () => {},
        section: () => {},
        done: () => {},
        round: (n) => {
          now.current = n
          cb.current.onRound(n)
        },
        won: (n) => cb.current.onWon(n),
        count: setCount,
        allDone: () => setAllDone(true),
      },
      { round: now.current },
    )
    w.setHintElement(hintRef.current)
    w.setRingElement(ringRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#4A4166', overflow: 'clip' }}>
      {mode === 'flat' ? (
        <RaceFlat round={round} onRound={onRound} onWon={onWon} onAllDone={() => setAllDone(true)} />
      ) : (
        <View3D
          key={key}
          name="The Racing Slide"
          qaKey="__thaiMallQA"
          worldRef={worldRef}
          onMode={setMode}
          make={make}
          anchors={(input, els) => (
            <>
              <Anchors list={RACE_ANCHORS} els={els} {...input} />
              {/* Before each bump (rounds 2 and 3): a ring closing on her, gold when a tap makes her fly. */}
              <div ref={ringRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 15000, borderRadius: '50%', border: '6px solid rgba(255,255,255,.9)', boxSizing: 'border-box' }} />
              {/* Stuck for a while, or the first time something's new: a finger on what to tap. */}
              <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
                <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(74,65,102,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: '#fff', zIndex: 70 }}
        >
          🏁 Tap to wake the slide
        </button>
      )}
      <Countdown n={count} />
      <AnimatePresence>
        {allDone && (
          <motion.button
            aria-label="Back to the playground"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 0.6, rotate: { repeat: Infinity, repeatDelay: 1.6, duration: 0.6 } }}
            whileTap={{ scale: 0.88 }}
            onClick={onPlay}
            style={{ position: 'absolute', left: 'calc(var(--safe-left, 0px) + 16px)', bottom: 'calc(var(--safe-bottom, 0px) + 16px)', width: 'clamp(96px, 16vmin, 132px)', height: 'clamp(96px, 16vmin, 132px)', borderRadius: '50%', border: '6px solid #fff', background: 'var(--hotpink)', fontSize: 'clamp(48px, 8vmin, 66px)', boxShadow: 'var(--shadow)', zIndex: 60, padding: 0 }}
          >
            🛝
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

/** The countdown's big numbers in the middle of the screen: 3, 2, 1, then the checkered flag. */
export function Countdown({ n }: { n: number | null }) {
  return (
    <div aria-live="polite" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 40, paddingTop: 'var(--top-clear)' }}>
      <AnimatePresence mode="popLayout">
        {n !== null && (
          <motion.div
            key={n}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [0.2, 1.25, 1], opacity: 1 }}
            exit={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ fontSize: 'clamp(110px, 26vmin, 220px)', fontWeight: 700, lineHeight: 1, color: n === 0 ? '#5BD88A' : '#FFC83D', WebkitTextStroke: '6px #2B2330', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(43,35,48,.35)' }}
          >
            {n === 0 ? '🏁' : n}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

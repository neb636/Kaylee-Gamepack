// Muay Thai's screen: the 3D ring (ring.ts), its tap targets, the POWs popping off each punch, the ring that closes on
// the bag (round 2) or Daddy's pad (round 3) before each beat and the 👆 after a while with nothing touched. After the third round (the belt) a big 🛝 takes her back to the hall.
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../../engine3d/View3D'
import type { Round } from './layout'
import { BOXING_ANCHORS, MuayThai } from './ring'
import { mallVoice } from '../../voice'

interface Props {
  round: Round
  socks: string
  onRound: (n: Round) => void
  /** The wai kru warm-up done (the sock band's 🥊). */
  onWarmedUp: () => void
  onPlay: () => void
}

const POWS = 4

export function Boxing({ round, socks, onRound, onWarmedUp, onPlay }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [allDone, setAllDone] = useState(false)
  const worldRef = useRef<MuayThai | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const powRefs = useRef<HTMLDivElement[]>([])
  // A rebuilt world (a lost GPU context) starts at the round she's on now, not the link's.
  const now = useRef(round)
  const cb = useRef({ onRound, onWarmedUp })
  cb.current = { onRound, onWarmedUp }

  const make = (renderer: WebGLRenderer) => {
    const w = new MuayThai(
      renderer,
      {
        say: (l) => mallVoice.say(l),
        section: () => {},
        done: () => {},
        round: (n) => {
          now.current = n
          cb.current.onRound(n)
        },
        warmedUp: () => cb.current.onWarmedUp(),
        allDone: () => setAllDone(true),
      },
      { round: now.current, socks },
    )
    w.setHintElement(hintRef.current)
    w.setRingElement(ringRef.current)
    w.setPowElements(powRefs.current.filter(Boolean))
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#EBDDFF', overflow: 'clip' }}>
      <View3D
        key={key}
        name="Muay Thai"
        qaKey="__thaiMallQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={BOXING_ANCHORS} els={els} {...input} />
            {/* Before each beat (rounds 2 and 3): a ring closing on the bag or the pad, gold when a punch is on the beat. */}
            <div ref={ringRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 15000, borderRadius: '50%', border: '7px solid rgba(255,255,255,.9)', boxSizing: 'border-box' }} />
            {/* The POWs off each punch (comic words over the hit; the big gold ones on the beat). */}
            {Array.from({ length: POWS }, (_, i) => (
              <div
                key={i}
                ref={(el) => {
                  if (el) powRefs.current[i] = el
                }}
                aria-hidden
                className="boxing-pow"
                style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 16000, whiteSpace: 'nowrap', fontWeight: 800, fontSize: 'clamp(26px, 4.4vmin, 44px)', letterSpacing: 1, color: '#FFFFFF', WebkitTextStroke: '2px #2B2330', textShadow: '3px 3px 0 #FF4F9A' }}
              />
            ))}
            <style>{`.boxing-pow[data-big="1"] { color: #FFC83D; text-shadow: 4px 4px 0 #FF4F9A; }`}</style>
            {/* After a while with nothing touched: a finger on her gloves, the bag or the pad. */}
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(235,221,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🥊 Tap to wake the ring
        </button>
      )}
      <AnimatePresence>
        {allDone && (
          <motion.button
            aria-label="Back to the hall"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 0.6, rotate: { repeat: Infinity, repeatDelay: 1.6, duration: 0.6 } }}
            whileTap={{ scale: 0.88 }}
            onClick={onPlay}
            style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 16px)', bottom: 'calc(var(--safe-bottom, 0px) + 16px)', width: 'clamp(96px, 16vmin, 132px)', height: 'clamp(96px, 16vmin, 132px)', borderRadius: '50%', border: '6px solid #fff', background: 'var(--hotpink)', fontSize: 'clamp(48px, 8vmin, 66px)', boxShadow: 'var(--shadow)', zIndex: 60, padding: 0 }}
          >
            🛝
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

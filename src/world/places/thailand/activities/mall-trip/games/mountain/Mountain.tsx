// The Golden Mountain's screen: the 3D mountain (golden.ts), its tap targets, the big number that pops over each hold
// she grabs and the 👆 after a while with nothing touched. After the third round a big 🛝 takes her back to the hall.
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../../engine/View3D'
import { Golden, MOUNTAIN_ANCHORS } from './golden'
import type { Round } from './layout'
import { mallVoice } from '../../voice'

interface Props {
  round: Round
  socks: string
  hair: string
  onRound: (n: Round) => void
  onTop: () => void
  onPlay: () => void
}

export function Mountain({ round, socks, hair, onRound, onTop, onPlay }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [allDone, setAllDone] = useState(false)
  const worldRef = useRef<Golden | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLDivElement>(null)
  // A rebuilt world (a lost GPU context) starts at the round she's on now, not the link's.
  const now = useRef(round)
  const cb = useRef({ onRound, onTop })
  cb.current = { onRound, onTop }

  const make = (renderer: WebGLRenderer) => {
    const w = new Golden(
      renderer,
      {
        say: (l) => mallVoice.say(l),
        section: () => {},
        done: () => {},
        round: (n) => {
          now.current = n
          cb.current.onRound(n)
        },
        top: () => cb.current.onTop(),
        allDone: () => setAllDone(true),
      },
      { round: now.current, socks, hair },
    )
    w.setHintElement(hintRef.current)
    w.setCountElement(countRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#EBDDFF', overflow: 'clip' }}>
      <View3D
        key={key}
        name="The Golden Mountain"
        qaKey="__thaiMallQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={MOUNTAIN_ANCHORS} els={els} {...input} />
            {/* The count: the hold's number, big, over the hold she just grabbed. */}
            <div ref={countRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 19000 }}>
              <div style={{ translate: '-50% -50%', fontSize: 'clamp(54px, 9vmin, 92px)', fontWeight: 700, lineHeight: 1, color: 'var(--hotpink)', WebkitTextStroke: '3px #fff', paintOrder: 'stroke fill', textShadow: '0 4px 10px rgba(43,35,48,.3)' }} />
            </div>
            {/* After a while with nothing touched: a finger on the next hold (or the bell, or the slide). */}
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
          ⛰️ Tap to wake the Golden Mountain
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
            style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 16px)', top: 'calc(var(--top-clear, 104px) + 10px)', width: 'clamp(96px, 16vmin, 132px)', height: 'clamp(96px, 16vmin, 132px)', borderRadius: '50%', border: '6px solid #fff', background: 'var(--hotpink)', fontSize: 'clamp(48px, 8vmin, 66px)', boxShadow: 'var(--shadow)', zIndex: 60, padding: 0 }}
          >
            🛝
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

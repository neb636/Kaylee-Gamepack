// Little Land's screen: the 3D foam blocks (little.ts), its tap targets, the 👆 after a while with nothing touched, and
// the flat picture version without WebGL (Flat.tsx). After the third round a big 🛝 takes her back to the hall.
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../../engine/View3D'
import { BlocksFlat } from './Flat'
import type { CardId, Round } from './layout'
import { BLOCKS_ANCHORS, LittleLand } from './little'

interface Props {
  round: Round
  card: CardId
  socks: string
  onRound: (n: Round) => void
  onCard: (id: CardId) => void
  onKnocked: () => void
  onPlay: () => void
}

export function Blocks({ round, card, socks, onRound, onCard, onKnocked, onPlay }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [allDone, setAllDone] = useState(false)
  const worldRef = useRef<LittleLand | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  // A rebuilt world (a lost GPU context) starts at the round and card she's on now, not the link's.
  const now = useRef({ round, card })
  const cb = useRef({ onRound, onCard, onKnocked })
  cb.current = { onRound, onCard, onKnocked }

  const make = (renderer: WebGLRenderer) => {
    const w = new LittleLand(
      renderer,
      {
        say: () => {},
        section: () => {},
        done: () => {},
        round: (n) => {
          now.current.round = n
          cb.current.onRound(n)
        },
        card: (id) => {
          now.current.card = id
          cb.current.onCard(id)
        },
        knocked: () => cb.current.onKnocked(),
        allDone: () => setAllDone(true),
      },
      { ...now.current, socks },
    )
    w.setHintElement(hintRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#EBDDFF', overflow: 'clip' }}>
      {mode === 'flat' ? (
        <BlocksFlat round={round} card={card} onRound={onRound} onCard={onCard} onKnocked={onKnocked} onAllDone={() => setAllDone(true)} />
      ) : (
        <View3D
          key={key}
          name="Little Land"
          qaKey="__thaiMallQA"
          worldRef={worldRef}
          onMode={setMode}
          make={make}
          anchors={(input, els) => (
            <>
              <Anchors list={BLOCKS_ANCHORS} els={els} {...input} />
              {/* After a while with nothing touched: a finger on the box (or the glowing stack). */}
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(235,221,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🧱 Tap to wake Little Land
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

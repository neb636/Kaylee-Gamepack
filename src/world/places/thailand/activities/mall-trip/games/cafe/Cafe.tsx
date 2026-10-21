// Cafe & Cake's screen: the 3D kitchen (shop.ts), its tap targets, Daddy's and Mommy's thought bubbles (what they
// ordered: the fruit and the color it makes), the 👆 after a while with nothing touched, and the flat picture version
// without WebGL (Flat.tsx). When all three rounds are done, a big 🛝 takes her back to the playground.
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../../engine/View3D'
import { CAFE_ANCHORS, CafeStage, type Bubble } from './shop'
import { CafeFlat } from './Flat'
import type { Customer, Round } from './layout'
import { mallVoice } from '../../voice'

interface Props {
  round: Round
  onRound: (n: Round) => void
  onDrink: () => void
  onPlay: () => void
}

export function Cafe({ round, onRound, onDrink, onPlay }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [bubbles, setBubbles] = useState<Partial<Record<Customer, Bubble>>>({})
  const [allDone, setAllDone] = useState(false)
  const worldRef = useRef<CafeStage | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const bubbleEls = useRef(new Map<Customer, HTMLElement>())
  // A rebuilt world (a lost GPU context) starts at the round she's on now, not the link's.
  const now = useRef(round)
  const cb = useRef({ onRound, onDrink })
  cb.current = { onRound, onDrink }

  const make = (renderer: WebGLRenderer) => {
    const w = new CafeStage(
      renderer,
      {
        say: (l) => mallVoice.say(l),
        section: () => {},
        done: () => {},
        round: (n) => {
          now.current = n
          cb.current.onRound(n)
        },
        drink: () => cb.current.onDrink(),
        bubbles: setBubbles,
        allDone: () => setAllDone(true),
      },
      { round: now.current },
    )
    w.setHintElement(hintRef.current)
    w.setBubbleElements(bubbleEls.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FFF1F6', overflow: 'clip' }}>
      {mode === 'flat' ? (
        <CafeFlat round={round} onRound={onRound} onDrink={onDrink} onAllDone={() => setAllDone(true)} />
      ) : (
        <View3D
          key={key}
          name="Cafe & Cake"
          qaKey="__thaiMallQA"
          worldRef={worldRef}
          onMode={setMode}
          make={make}
          anchors={(input, els) => (
            <>
              <Anchors list={CAFE_ANCHORS} els={els} {...input} />
              {/* What Daddy and Mommy ordered, in a thought bubble over each one's head. */}
              {(['nick', 'ji'] as const).map((who) => (
                <div
                  key={who}
                  ref={(el) => {
                    if (el) bubbleEls.current.set(who, el)
                    else bubbleEls.current.delete(who)
                  }}
                  aria-hidden
                  style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 15000 }}
                >
                  <AnimatePresence mode="popLayout">
                    {bubbles[who] && <OrderBubble key={JSON.stringify(bubbles[who])} b={bubbles[who]!} />}
                  </AnimatePresence>
                </div>
              ))}
              {/* After a while with nothing touched: a finger on the next thing to do. */}
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(255,241,246,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🥤 Tap to wake the cafe
        </button>
      )}
      <AnimatePresence>
        {allDone && (
          <motion.button
            aria-label="Back to the playground"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 0.6, rotate: { repeat: Infinity, repeatDelay: 1.6, duration: 0.6 } }}
            whileTap={{ scale: 0.88 }}
            onClick={onPlay}
            style={{ position: 'absolute', left: '50%', top: 'calc(var(--top-clear, 104px) + 12px)', translate: '-50% 0', width: 'clamp(96px, 16vmin, 132px)', height: 'clamp(96px, 16vmin, 132px)', borderRadius: '50%', border: '6px solid #fff', background: 'var(--hotpink)', fontSize: 'clamp(48px, 8vmin, 66px)', boxShadow: 'var(--shadow)', zIndex: 60, padding: 0 }}
          >
            🛝
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

/** A thought bubble: the order's pictures (a cup in round 1), and a splash of the color it makes. */
export function OrderBubble({ b }: { b: Bubble }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1, y: [0, -6, 0] }}
      exit={{ scale: 0 }}
      transition={{ y: { repeat: Infinity, duration: 1.6 }, scale: { type: 'spring', stiffness: 400, damping: 14 } }}
      style={{ translate: '-50% -100%', display: 'flex', alignItems: 'center', gap: 'clamp(2px, 0.6vmin, 6px)', padding: 'clamp(5px, 1vmin, 9px) clamp(8px, 1.5vmin, 14px)', borderRadius: 999, background: '#fff', border: '4px solid var(--lavender-dark)', fontSize: 'clamp(24px, 4.2vmin, 40px)', lineHeight: 1, boxShadow: '0 4px 10px rgba(43,35,48,.18)', whiteSpace: 'nowrap' }}
    >
      {b.icons.map((icon, i) => (
        <span key={i}>{icon}</span>
      ))}
      {b.color && <span style={{ width: '0.9em', height: '0.9em', borderRadius: '50%', background: b.color, border: '3px solid var(--ink)', marginLeft: '0.1em' }} />}
    </motion.div>
  )
}

// The Barber Salon's screen: the 3D salon (salon.ts) and its tap targets, the kid's picture card in round 3, Mommy's
// camera flash and the 👆 after a while with nothing touched. When all three kids are done, a big 🛝 takes her back to the hall (the playground).
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../../engine3d/View3D'
import { CardPicture } from './Card'
import type { Card, Round } from './layout'
import { BARBER_ANCHORS, Salon } from './salon'
import { mallVoice } from '../../voice'

interface Props {
  round: Round
  hair: string
  onRound: (n: Round) => void
  onHair: (code: string) => void
  onRevealed: (n: Round) => void
  onPlay: () => void
}

export function Barber({ round, hair, onRound, onHair, onRevealed, onPlay }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [card, setCard] = useState<Card | null>(null)
  const [flash, setFlash] = useState(0)
  const [allDone, setAllDone] = useState(false)
  const worldRef = useRef<Salon | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  // A rebuilt world (a lost GPU context) starts where she is now, not where the link was.
  const now = useRef({ round, hair })
  now.current = { round, hair }
  const cb = useRef({ onRound, onHair, onRevealed })
  cb.current = { onRound, onHair, onRevealed }

  const make = (renderer: WebGLRenderer) => {
    const w = new Salon(
      renderer,
      {
        say: (l) => mallVoice.say(l),
        section: () => {},
        done: () => {},
        round: (n) => cb.current.onRound(n),
        hair: (code) => cb.current.onHair(code),
        revealed: (n) => cb.current.onRevealed(n),
        card: setCard,
        flash: () => setFlash((f) => f + 1),
        allDone: () => setAllDone(true),
      },
      now.current,
    )
    w.setHintElement(hintRef.current)
    w.setCardElement(cardRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#DCEBFF', overflow: 'clip' }}>
      <View3D
        key={key}
        name="The Barber Salon"
        qaKey="__thaiMallQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={BARBER_ANCHORS} els={els} {...input} />
            {/* The kid's picture card: the hair they'd like. */}
            <div ref={cardRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 15000 }}>
              <AnimatePresence mode="popLayout">
                {card && (
                  <motion.div
                    key={card}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: [-4, 4, -4] }}
                    exit={{ scale: 0 }}
                    transition={{ rotate: { repeat: Infinity, duration: 2.2 }, scale: { type: 'spring', stiffness: 400, damping: 14 } }}
                    style={{ translate: '0 -100%', padding: 6, borderRadius: 18, background: '#fff', border: '4px solid var(--lavender-dark)', boxShadow: '0 4px 10px rgba(43,35,48,.18)', width: 'clamp(70px, 12vmin, 104px)', height: 'clamp(70px, 12vmin, 104px)', display: 'grid', placeItems: 'center' }}
                  >
                    <CardPicture card={card} size="100%" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* After a while with nothing touched: a finger on a tool she hasn't tried, or on the mirror. */}
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(220,235,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          💈 Tap to wake the salon
        </button>
      )}
      {/* Mommy's camera flash. */}
      <AnimatePresence>{flash > 0 && <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 55 }} />}</AnimatePresence>
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

// Baan Huanam Mushroom Farm's screen: the 3D farm (farm3d.ts) with its tap targets, the 👆 after a while with nothing
// touched, and at the end (every slice shared) the end card: 🔁 the farm again, or 🚙 back on the road (up the sky road
// to the café). (No flat version: 3D activities don't need one any more.)
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../engine/View3D'
import { FARM_ANCHORS, MushroomFarm } from './farm3d'
import type { Round } from './layout'

interface Props {
  round: Round
  basket: string
  onRound: (r: Round, basket: string) => void
  onBasket: (basket: string) => void
  /** The end card's 🚙: back on the road. */
  onDrive: () => void
}

export function Mushrooms({ round, basket, onRound, onBasket, onDrive }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [done, setDone] = useState(false)
  const worldRef = useRef<MushroomFarm | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  // A rebuilt world (a lost GPU context, 🔁) starts where she is now, not where the link was.
  const now = useRef({ round, basket })
  const cb = useRef({ onRound, onBasket })
  cb.current = { onRound, onBasket }

  const make = (renderer: WebGLRenderer) => {
    const w = new MushroomFarm(
      renderer,
      {
        say: () => {},
        section: () => {},
        done: () => {},
        round: (r, b) => {
          now.current = { round: r, basket: b }
          cb.current.onRound(r, b)
        },
        basket: (b) => {
          now.current = { ...now.current, basket: b }
          cb.current.onBasket(b)
        },
        allDone: () => setDone(true),
      },
      now.current,
    )
    w.setHintElement(hintRef.current)
    return w
  }

  const again = () => {
    setDone(false)
    now.current = { round: '1', basket: '' }
    onRound('1', '')
    setKey((k) => k + 1)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#DCD6E8', overflow: 'clip' }}>
      {mode !== 'flat' && (
        <View3D
          key={key}
          name="The mushroom farm"
          qaKey="__thaiNanQA"
          worldRef={worldRef}
          onMode={setMode}
          make={make}
          anchors={(input, els) => (
            <>
              <Anchors list={FARM_ANCHORS} els={els} {...input} />
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(220,214,232,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🍄 Tap to wake the farm
        </button>
      )}
      <AnimatePresence>{done && <FarmEnd onAgain={again} onDrive={onDrive} />}</AnimatePresence>
    </div>
  )
}

/** Lunch is over: the farm again, or back on the road (big pictures, no reading). */
export function FarmEnd({ onAgain, onDrive }: { onAgain: () => void; onDrive: () => void }) {
  const size = 'clamp(92px, 15vmin, 128px)'
  const btn = { width: size, height: size, borderRadius: '50%', border: '6px solid #fff', fontSize: 'clamp(42px, 7vmin, 60px)', boxShadow: 'var(--shadow)', padding: 0 } as const
  return (
    <motion.div
      key="end"
      initial={{ y: 160 }}
      animate={{ y: 0 }}
      exit={{ y: 160 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom, 0px) + 18px)', display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 3vw, 30px)', padding: '0 16px', zIndex: 50 }}
    >
      <motion.button aria-label="The mushroom farm again" whileTap={{ scale: 0.88 }} onClick={onAgain} style={{ ...btn, background: 'var(--lavender)' }}>
        🔁
      </motion.button>
      <motion.button aria-label="Back on the road" whileTap={{ scale: 0.88 }} animate={{ scale: [1, 1.07, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} onClick={onDrive} style={{ ...btn, background: 'var(--pink)' }}>
        🚙
      </motion.button>
    </motion.div>
  )
}

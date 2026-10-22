// HarborLand's hall on screen: the 3D hall (hall.ts) with its tap targets, the 👆 after a while with nothing touched,
// Mommy's "Pizza time?" card once Daddy's tummy rumbles (she says it), and the flat picture row without WebGL (Flat.tsx).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../engine/View3D'
import { HarborSign } from '../harborland/sign'
import { HallFlat } from './Flat'
import { Hall, HALL_ANCHORS, LABELS } from './hall'
import { Hungry } from './Hungry'
import type { DoorId, GameDoor } from './layout'
import { mallVoice } from '../voice'

/** Each sign's letters. */
const LABEL_COLORS: Record<string, string> = { little: '#3FAF8E', muay: '#E04848' }

interface Props {
  socks: string
  /** Daddy's hairdo from the barber. */
  hair: string
  done: GameDoor[]
  from: DoorId | 'in'
  /** Daddy's tummy rumbles soon after she comes out. */
  hungry: boolean
  /** Mommy's card is up. */
  asking: boolean
  onEnter(door: GameDoor): void
  onHungry(): void
  onPizza(): void
  onMorePlay(): void
}

export function HallScreen({ socks, hair, done, from, hungry, asking, onEnter, onHungry, onPizza, onMorePlay }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [going, setGoing] = useState(false)
  const worldRef = useRef<Hall | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const signRef = useRef<HTMLDivElement>(null)
  const cb = useRef({ onEnter, onHungry })
  cb.current = { onEnter, onHungry }
  // No hint from Sparkle over Mommy's question.
  useEffect(() => worldRef.current?.setAsking(asking), [asking])

  const make = (renderer: WebGLRenderer) => {
    const w = new Hall(
      renderer,
      {
        say: (l) => mallVoice.say(l),
        section: () => {},
        done: () => {},
        going: () => setGoing(true),
        enter: (d) => cb.current.onEnter(d),
        hungry: () => cb.current.onHungry(),
      },
      { socks, done, from: from === 'in' ? '' : from, hungry, hair, asking },
    )
    w.setHintElement(hintRef.current)
    w.setLabelBox(labelRef.current)
    w.setSign(signRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#2E2748', overflow: 'clip' }}>
      {mode === 'flat' ? (
        <HallFlat done={done} onEnter={onEnter} />
      ) : (
        <View3D
          key={key}
          name="HarborLand"
          qaKey="__thaiMallQA"
          worldRef={worldRef}
          onMode={setMode}
          make={make}
          anchors={(input, els) => (
            <>
              {/* The signs' words, laid over the 3D signs (hall.ts moves and sizes them every frame). */}
              <div ref={labelRef} aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
                {LABELS.map((l) => (
                  <div key={l.id} style={{ position: 'absolute', left: 0, top: 0, display: 'none', whiteSpace: 'nowrap', fontWeight: 700, lineHeight: 1, letterSpacing: '0.02em', color: LABEL_COLORS[l.id] ?? 'var(--lavender-dark)', textShadow: '0 2px 0 #fff, 0 0 6px rgba(255,255,255,.8)' }}>
                    {l.text}
                  </div>
                ))}
              </div>
              <HarborSign ref={signRef} />
              <Anchors list={HALL_ANCHORS} els={els} {...input} />
              {/* After a while with nothing touched: a finger on a way in she hasn't been through. */}
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(241,232,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🛝 Tap to wake HarborLand
        </button>
      )}
      {/* Stepping through a way in: the hall fades out into the mini game. */}
      <AnimatePresence>{going && <motion.div key="fade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95, duration: 0.5 }} style={{ position: 'absolute', inset: 0, background: '#FFF7F0', pointerEvents: 'none', zIndex: 60 }} />}</AnimatePresence>
      <Hungry open={asking} onPizza={onPizza} onPlay={onMorePlay} />
    </div>
  )
}

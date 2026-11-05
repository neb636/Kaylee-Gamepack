// Lunch on the deck at Ao Prao, on screen (lunch.ts is the world): the table with its tap targets, the pressing finger
// when she's been still a while, Mommy's photo flash, and once she has had a roll, the coconut and the rice a 🍽️ badge
// with the ways on: back to the island, or down the steps to hide and seek at the driftwood tree.
// Greybox: no voices yet.
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst } from '../../../../../../sdk'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import type { TimeOfDay } from '../island/scenery'
import { Lunch as World, LUNCH_ANCHORS, type LunchEvents } from './lunch'

interface Props {
  time?: TimeOfDay
  /** Back to the island (on the deck). */
  onIsland?(): void
  /** Down to the driftwood tree for hide and seek. */
  onHideSeek?(): void
}

export function LunchScreen({ time, onIsland, onHideSeek }: Props) {
  const [n, setN] = useState(0)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [done, setDone] = useState(false)
  const [flash, setFlash] = useState(0)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  const events = useRef<LunchEvents>({
    photo: () => setFlash((f) => f + 1),
    done: () => {
      setDone(true)
      burst()
    },
  })
  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, { time }, events.current)
    w.setHintElement(hintRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#BFE9FA', overflow: 'clip' }}>
      <style>{CSS}</style>
      <View3D
        key={n}
        name="The deck at Ao Prao"
        qaKey="__thaiSametQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={LUNCH_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="ln-hint" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      <AnimatePresence>
        {flash > 0 && <motion.div key={flash} className="ln-flash" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} transition={{ duration: 0.45 }} />}
      </AnimatePresence>
      <AnimatePresence>
        {done && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="ln-over">
            <div className="ln-badge">🍽️ 🥥 💗</div>
            {onHideSeek && (
              <BigButton color="pink" onClick={onHideSeek} ariaLabel="Hide and seek">
                🙈
              </BigButton>
            )}
            {onIsland && (
              <BigButton color="mint" onClick={onIsland} ariaLabel="Back to the island">
                🏝️
              </BigButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {mode === 'lost' && (
        <button onClick={() => { setMode('webgl'); setN((v) => v + 1) }} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(191,233,250,.92)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}>
          🍽️ Tap to wake the deck
        </button>
      )}
    </div>
  )
}

const CSS = `
.ln-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; }
.ln-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); animation: ln-press 1.4s ease-in-out infinite; }
@keyframes ln-press { 0%, 100% { transform: scale(1); } 45% { transform: scale(0.82) translateY(6px); } }
.ln-flash { position: absolute; inset: 0; background: #fff; pointer-events: none; z-index: 15; }
.ln-over { position: absolute; right: 16px; bottom: calc(var(--safe-bottom, 0px) + 18px); z-index: 12; display: flex; gap: 14px; align-items: center; pointer-events: none; }
.ln-over > * { pointer-events: auto; }
.ln-badge { padding: 12px 22px; border-radius: 999px; background: rgba(255,255,255,.92); box-shadow: var(--shadow); font-size: clamp(24px, 4.5vmin, 40px); font-weight: 700; color: var(--ink); }
`

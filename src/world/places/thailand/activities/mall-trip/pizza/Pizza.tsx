// The Pizza Company's screen: the 3D table (table.ts) and its tap targets, the menu's three big picture buttons, the 👆
// after a while with nothing touched.
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import type { PizzaId } from './layout'
import { Menu } from './Menu'
import { PIZZA_ANCHORS, PizzaTable } from './table'
import { mallVoice } from '../voice'

interface Props {
  section: 'menu' | 'share'
  pizza: PizzaId
  shared: number
  /** Daddy's hairdo from the barber. */
  hair: string
  onPizza: (id: PizzaId) => void
  onServed: () => void
  onShared: (n: number) => void
  /** The pan is empty and Agong's box is shut (the trip goes home). */
  onAllDone?: () => void
}

export function Pizza({ section, pizza, shared, hair, onPizza, onServed, onShared, onAllDone }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [picked, setPicked] = useState(section === 'share')
  const worldRef = useRef<PizzaTable | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  // A rebuilt world (a lost GPU context) starts where she is now, not where the link was.
  const now = useRef({ section, pizza, shared, hair })
  now.current = { section, pizza, shared, hair }
  const cb = useRef({ onServed, onShared, onAllDone })
  cb.current = { onServed, onShared, onAllDone }

  const make = (renderer: WebGLRenderer) => {
    const w = new PizzaTable(
      renderer,
      {
        say: (l) => mallVoice.say(l),
        section: () => {},
        done: () => {},
        served: () => cb.current.onServed(),
        shared: (n) => cb.current.onShared(n),
        allDone: () => cb.current.onAllDone?.(),
      },
      now.current,
    )
    w.setHintElement(hintRef.current)
    return w
  }

  const choose = (id: PizzaId) => {
    if (picked) return
    setPicked(true)
    onPizza(id)
    worldRef.current?.choose(id)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FFF1E4', overflow: 'clip' }}>
      <View3D
        key={key}
        name="The Pizza Company"
        qaKey="__thaiMallQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={PIZZA_ANCHORS} els={els} {...input} />
            {/* After a while with nothing touched: a finger on the next slice. */}
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(255,241,228,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🍕 Tap to wake the table
        </button>
      )}
      <Menu open={!picked} onPick={choose} />
    </div>
  )
}

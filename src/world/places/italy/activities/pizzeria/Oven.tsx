// The wood-fired oven. Slide the pizza in on the long peel (drag it up into the oven's mouth, or tap it). The side
// facing the fire turns golden first, so she taps to turn the pizza a quarter at a time (real pizzaioli do this). When
// every side is golden she pulls it out. A Naples pizza really bakes in about ninety seconds; ours takes about ten.
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import { BigButton, burst, Piece, PlayArea, sounds, Target, useAlive, useGameLoop, useLandscape, wait, type Line } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'
import { CoverBox, OLD, StationBar, StoryFrame } from './layout'
import { PizzaView, type PizzaState } from './pizza'

const P = L.pizza
/** Where the oven's floor is in each picture (% of the picture), how wide the pizza looks in there, and the fire. */
const MOUTH = {
  wide: { x: 53, y: 57, w: 27, fireX: 33, fireY: 52 },
  tall: { x: 52, y: 51, w: 40, fireX: 29, fireY: 49 },
}
const QUARTER_SECONDS = 2.2

type Phase = 'peel' | 'bake' | 'ready' | 'out'

export function Oven({ pizza, old, onBake, onDone }: { pizza: PizzaState; old?: boolean; onBake: (bake: PizzaState['bake']) => void; onDone: () => void }) {
  const landscape = useLandscape()
  const m = landscape ? MOUTH.wide : MOUTH.tall
  const [phase, setPhase] = useState<Phase>('peel')
  const [turns, setTurns] = useState(0)
  const [prompt, setPrompt] = useState<Line>(P.oven)
  const bake = useRef<PizzaState['bake']>([...pizza.bake])
  const [, redraw] = useState(0)
  const lastDraw = useRef(0)
  const golden = useRef(-1)
  const alive = useAlive()

  // The quarter facing the fire bakes; the others warm up a little.
  useGameLoop(
    (dt) => {
      const b = bake.current
      const k = turns
      for (let i = 0; i < 4; i++) b[i] = Math.min(i === k ? 1 : Math.max(b[i], 0.35), b[i] + (i === k ? dt / QUARTER_SECONDS : dt * 0.08))
      const now = performance.now()
      if (now - lastDraw.current > 60) {
        lastDraw.current = now
        redraw((n) => n + 1)
      }
      if (b[k] >= 1 && golden.current !== k) {
        golden.current = k
        sounds.sparkle()
        onBake([...b] as PizzaState['bake'])
        if (k === 3) {
          setPhase('out')
          setPrompt(P.takeOut)
        } else {
          setPhase('ready')
          setPrompt(k === 0 ? P.turn : P.turnMore)
        }
      }
    },
    phase === 'bake',
  )

  const slideIn = () => {
    if (phase !== 'peel') return
    sounds.whoosh()
    setPhase('bake')
    setPrompt(P.ovenFact)
  }
  const turn = () => {
    if (phase !== 'ready') return
    sounds.whoosh()
    setTurns((t) => t + 1)
    setPhase('bake')
  }
  const takeOut = async () => {
    if (phase !== 'out') return
    sounds.correct()
    burst(0.5, 0.55)
    onBake([1, 1, 1, 1])
    setPhase('peel')
    await wait(500)
    if (alive()) onDone()
  }

  const shown: PizzaState = { ...pizza, bake: [...bake.current] as PizzaState['bake'] }
  const inOven = phase === 'bake' || phase === 'ready' || phase === 'out'
  const tap = phase === 'ready' ? turn : phase === 'out' ? takeOut : undefined

  return (
    <PlayArea style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#F6D9B8' }}>
      <CoverBox img={landscape ? art.bgPizzaOven : art.bgPizzaOvenTall} ratio={landscape ? 1.5 : 1024 / 1536} style={{ filter: old ? OLD : undefined }}>
        {/* The fire flickers and glows. */}
        <motion.div aria-hidden animate={{ opacity: [0.35, 0.7, 0.45, 0.65, 0.35], scale: [1, 1.08, 0.97, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.3 }} style={{ position: 'absolute', left: `${m.fireX}%`, top: `${m.fireY}%`, width: '22%', aspectRatio: '1', translate: '-50% -50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,170,60,.85), rgba(255,120,40,0) 70%)', pointerEvents: 'none', mixBlendMode: 'screen' }} />
        <Target id="mouth" hint={phase === 'peel'} glow={phase === 'peel'} style={{ position: 'absolute', left: `${m.x}%`, top: `${m.y}%`, width: `${m.w * 1.2}%`, aspectRatio: '2.6', translate: '-50% -50%', borderRadius: '50%' }}>
          <div />
        </Target>
        {/* The pizza on the oven floor, seen from the front (squashed), turning a quarter at a time. */}
        {inOven && (
          <motion.div
            role="button"
            aria-label={phase === 'out' ? 'take the pizza out' : 'turn the pizza'}
            onClick={tap}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ position: 'absolute', left: `${m.x}%`, top: `${m.y}%`, width: `${m.w}%`, aspectRatio: '1', translate: '-50% -50%', cursor: tap ? 'pointer' : undefined }}
          >
            <div style={{ width: '100%', height: '100%', transform: 'scaleY(0.4)' }}>
              <motion.div animate={{ rotate: turns * 90 }} transition={{ type: 'spring', bounce: 0.3, duration: 0.7 }} style={{ width: '100%', height: '100%', borderRadius: '50%' }} className={tap ? 'world-glow' : undefined}>
                <PizzaView pizza={shown} size="100%" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </CoverBox>

      {/* The peel with the raw pizza, waiting in front of the oven: drag it up into the mouth (or tap it). */}
      <AnimatePresence>
        {phase === 'peel' && (
          <motion.div key="peel" initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', left: '50%', bottom: 'calc(var(--safe-bottom) + 70px)', translate: '-50% 0', zIndex: 6 }}>
            <Piece id="peel" snapTo="mouth" snapRadius={140} label="pizza on the peel" onPlace={({ target }) => (target === 'mouth' ? (slideIn(), 'snap') : 'home')} onTap={slideIn}>
              <div style={{ position: 'relative', width: landscape ? 'min(40vh, 30vw)' : 'min(52vw, 34vh)' }}>
                <img src={art.peel} alt="" draggable={false} style={{ width: '100%', display: 'block', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', left: '11%', top: '4%', width: '78%' }}>
                  <PizzaView pizza={shown} size="100%" />
                </div>
              </div>
            </Piece>
          </motion.div>
        )}
      </AnimatePresence>

      {/* A big turn / take-out button under the oven, for an easy tap. */}
      <AnimatePresence>
        {(phase === 'ready' || phase === 'out') && (
          <motion.div key={phase} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ position: 'absolute', left: '50%', bottom: 'calc(var(--safe-bottom) + 90px)', translate: '-50% 0', zIndex: 8 }}>
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 0.9 }}>
              <BigButton ariaLabel={phase === 'out' ? 'Take the pizza out' : 'Turn the pizza'} color="butter" size="xl" onClick={phase === 'out' ? takeOut : turn}>
                {phase === 'out' ? '🍕⬇️' : '🔄'}
              </BigButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How golden it is: four little crust dots, one per side. */}
      {inOven && (
        <div aria-hidden style={{ position: 'absolute', right: 'max(14px, 3vw)', bottom: 'calc(var(--safe-bottom) + 90px)', display: 'flex', gap: 8, zIndex: 7, background: 'rgba(255,247,240,.9)', padding: '8px 12px', borderRadius: 999, border: `4px solid ${INK}` }}>
          {bake.current.map((b, i) => (
            <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', border: `3px solid ${INK}`, background: b >= 1 ? '#F2B872' : `rgba(242,184,114,${b})` }} />
          ))}
        </div>
      )}

      <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 12px', zIndex: 20, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <PromptBubble text={prompt} />
        </div>
      </div>
      <StationBar at="oven" />
      {old && <StoryFrame />}
    </PlayArea>
  )
}

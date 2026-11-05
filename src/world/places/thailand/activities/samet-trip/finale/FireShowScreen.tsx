// The fire show, on screen (fireshow.ts is the world): Sai Kaew at night with its tap targets, the pressing finger
// (drawing a circle before she starts, round the dots she still needs when she's stuck), Sparkle in the corner speaking
// everyone's lines (trip/legs/Guide.tsx, the words for Dad too), and once the fireworks go up a 🔥 🏆 badge with
// the way home (Mommy's photo goes on Agong's wall, the stamp). With ?feel=1 Dad also gets round chips.
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { WebGLRenderer } from 'three'
import { BigButton, bigCelebration, burst } from '../../../../../../sdk'
import { isFeelParam } from '../../../../../kit/knobs'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import type { StopId } from '../island/layout'
import { FIRE_ANCHORS, FIRE_ROUND_IDS, FireShow as World, type FireEvents, type FireRound } from './fireshow'

const feelOn = () => [...new URLSearchParams(location.hash.split('?')[1] ?? '').keys()].some(isFeelParam)
const CHIP: Record<FireRound, string> = { twirl: '🌀 twirl', shapes: '⭐ shapes', finish: '🎆 finish' }

interface Props {
  round: FireRound
  flags: StopId[]
  /** The round on screen changed (the address bar follows). */
  onRound(r: FireRound): void
  /** The show is over and she tapped 🏠: `photo` is the fireworks (the trip uses Mommy's sunset photo if it has one). */
  onHome?(photo: string): void
}

export function FireShowScreen({ round: first, flags, onRound, onHome }: Props) {
  const [run, setRun] = useState({ round: first, n: 0 })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [round, setRound] = useState<FireRound>(first)
  const [done, setDone] = useState<string | null>(null)
  const [feel] = useState(feelOn)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<TripGuideHandle>(null)
  const onRoundRef = useRef(onRound)
  onRoundRef.current = onRound

  useEffect(() => onRoundRef.current(run.round), [run])

  const events = useRef<FireEvents>({
    round: (r) => {
      setRound(r)
      onRoundRef.current(r)
    },
    shape: () => burst(),
    gift: () => burst(),
    say: (l) => guideRef.current?.speak(l),
    done: (photo) => {
      bigCelebration()
      setDone(photo)
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, { round: run.round, flags }, events.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const jump = (r: FireRound) => {
    setRound(r)
    setDone(null)
    setRun((v) => ({ round: r, n: v.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1F1D4A', overflow: 'clip' }}>
      <style>{FINALE_CSS}</style>
      <View3D
        key={run.n}
        name="The fire show"
        qaKey="__thaiSametQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={FIRE_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="fin-hint" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      {mode === 'webgl' && <TripGuide ref={guideRef} />}
      <AnimatePresence>
        {done !== null && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fin-over">
            <div className="fin-badge">🔥 🏆</div>
            {onHome && (
              <BigButton color="mint" onClick={() => onHome(done)} ariaLabel="Home to Agong's house">
                🏠
              </BigButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {feel && (
        <div className="fin-chips">
          {FIRE_ROUND_IDS.map((r) => (
            <button key={r} onClick={() => jump(r)} className={r === round ? 'on' : ''} aria-label={`Fire show round: ${r}`}>
              {CHIP[r]}
            </button>
          ))}
        </div>
      )}
      {mode === 'lost' && (
        <button onClick={() => { setMode('webgl'); jump(round) }} className="fin-wake">
          🔥 Tap to wake the beach
        </button>
      )}
    </div>
  )
}

export const FINALE_CSS = `
.fin-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; }
.fin-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); animation: fin-press 1.4s ease-in-out infinite; }
@keyframes fin-press { 0%, 100% { transform: scale(1); } 45% { transform: scale(0.85) translateY(4px); } }
.fin-flash { position: absolute; inset: 0; background: #fff; pointer-events: none; z-index: 15; }
/* (Top left: Sparkle sits bottom left.) */
.fin-photo { position: absolute; left: calc(var(--safe-left, 0px) + 16px); top: calc(var(--top-clear) + 10px); z-index: 12; width: clamp(120px, 22vmin, 220px); border: 8px solid #fff; border-bottom-width: 22px; border-radius: 6px; box-shadow: var(--shadow); pointer-events: none; }
.fin-over { position: absolute; right: 16px; bottom: calc(var(--safe-bottom, 0px) + 18px); z-index: 12; display: flex; gap: 14px; align-items: center; pointer-events: none; }
.fin-over > * { pointer-events: auto; }
.fin-badge { padding: 12px 22px; border-radius: 999px; background: rgba(255,255,255,.92); box-shadow: var(--shadow); font-size: clamp(24px, 4.5vmin, 40px); font-weight: 700; color: var(--ink); }
.fin-chips { position: absolute; right: 12px; top: calc(var(--top-clear) + 6px); z-index: 20; display: flex; gap: 6px; }
.fin-chips button { min-height: 48px; padding: 6px 14px; border-radius: 999px; border: none; background: rgba(255,255,255,.85); box-shadow: var(--shadow); font: inherit; font-size: 16px; font-weight: 600; color: var(--ink); }
.fin-chips button.on { background: var(--hotpink); color: #fff; }
.fin-wake { position: absolute; inset: 0; z-index: 30; background: rgba(31,29,74,.9); border: none; font-size: clamp(24px, 5vw, 40px); font-weight: 700; color: #fff; }
`

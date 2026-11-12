// The sandcastle at Ao Hin Khok, on screen (sandcastle.ts is the world): the 3D beach with its tap targets, the
// pressing finger after a while with nothing touched, and once the moat has filled from the sea a little 🏰 badge with
// the way back to the island (the stop's pink flag up). With ?feel=1 Dad also gets round chips (dig, towers, tide).
// Sparkle sits in the corner (trip/legs/Guide.tsx) and everyone talks in their own voice (lines.ts L.samet.sandcastle).
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst } from '../../../../../../sdk'
import { isFeelParam } from '../../../../../kit/knobs'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import type { TimeOfDay } from '../island/scenery'
import { SAND_ANCHORS, SAND_ROUND_IDS, Sandcastle as World, type SandEvents, type SandRound } from './sandcastle'

const feelOn = () => [...new URLSearchParams(location.hash.split('?')[1] ?? '').keys()].some(isFeelParam)
const CHIP: Record<SandRound, string> = { dig: '🖐️ dig', towers: '🪣 towers', tide: '🌊 tide' }

interface Props {
  round: SandRound
  /** The fireflies she has found so far (the trip's flags: jetski, sandcastle, snorkel, hideseek). */
  flags?: string[]
  time?: TimeOfDay
  /** The round on screen changed (the address bar follows). */
  onRound(r: SandRound): void
  /** Back to the island, the sandcastle's flag up. */
  onIsland?(): void
}

export function SandcastleScreen({ round: first, time, onRound, onIsland }: Props) {
  const [run, setRun] = useState({ round: first, n: 0 })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [round, setRound] = useState<SandRound>(first)
  const [filled, setFilled] = useState(false)
  const [feel] = useState(feelOn)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<TripGuideHandle>(null)
  const onRoundRef = useRef(onRound)
  onRoundRef.current = onRound

  useEffect(() => onRoundRef.current(run.round), [run])

  const events = useRef<SandEvents>({
    say: (l, mute) => guideRef.current?.speak(l, mute),
    round: (r) => {
      setRound(r)
      onRoundRef.current(r)
    },
    filled: () => {
      setFilled(true)
      burst()
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, { round: run.round, time }, events.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const jump = (r: SandRound) => {
    setRound(r)
    setFilled(false)
    setRun((v) => ({ round: r, n: v.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#D5EEFA', overflow: 'clip' }}>
      <style>{CSS}</style>
      <View3D
        key={run.n}
        name="Ao Hin Khok"
        qaKey="__thaiSametQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={SAND_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="sand-hint" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      <AnimatePresence>
        {filled && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="sand-over">
            <div className="sand-badge">🏰 💧 🦀</div>
            {onIsland && (
              <BigButton color="mint" onClick={onIsland} ariaLabel="Back to the island">
                🏝️
              </BigButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {mode === 'webgl' && <TripGuide ref={guideRef} />}
      {feel && (
        <div className="sand-chips">
          {SAND_ROUND_IDS.map((r) => (
            <button key={r} onClick={() => jump(r)} className={r === round ? 'on' : ''} aria-label={`Sandcastle round: ${r}`}>
              {CHIP[r]}
            </button>
          ))}
        </div>
      )}
      {mode === 'lost' && (
        <button onClick={() => { setMode('webgl'); jump(round) }} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(213,238,250,.9)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}>
          🏰 Tap to wake the beach
        </button>
      )}
    </div>
  )
}

const CSS = `
.sand-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; }
.sand-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); animation: sand-press 1.4s ease-in-out infinite; }
@keyframes sand-press { 0%, 100% { transform: scale(1); } 45% { transform: scale(0.82) translateY(6px); } }
.sand-over { position: absolute; right: 16px; bottom: calc(var(--safe-bottom, 0px) + 18px); z-index: 12; display: flex; gap: 14px; align-items: center; pointer-events: none; }
.sand-over > * { pointer-events: auto; }
.sand-badge { padding: 12px 22px; border-radius: 999px; background: rgba(255,255,255,.92); box-shadow: var(--shadow); font-size: clamp(24px, 4.5vmin, 40px); font-weight: 700; color: var(--ink); }
.sand-chips { position: absolute; right: 12px; top: calc(var(--top-clear) + 6px); z-index: 20; display: flex; gap: 6px; }
.sand-chips button { min-height: 48px; padding: 6px 14px; border-radius: 999px; border: none; background: rgba(255,255,255,.85); box-shadow: var(--shadow); font: inherit; font-size: 16px; font-weight: 600; color: var(--ink); }
.sand-chips button.on { background: var(--hotpink); color: #fff; }
`

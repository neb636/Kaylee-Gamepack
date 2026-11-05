// The jet ski at Hat Sai Kaew, on screen (jetski.ts is the world): the 3D bay with its tap targets, the pressing finger
// after a while with nothing touched, the race's countdown (big 3, 2, 1, go), the race's end (🏆 and 🔁 when she wins;
// "So close!" and straight into the next race when he wins by a nose), and spray on the camera after a big landing.
// With ?feel=1 Dad also gets round chips (ride, waves, race) to jump between rounds while he tunes the knobs.
// Greybox: no voices yet (the full loop adds Sparkle's few lines and the jet ski man's).
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst } from '../../../../../../sdk'
import { isFeelParam } from '../../../../../kit/knobs'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import type { RoundId } from '../island/layout'
import { JET_ANCHORS, JetSki as World, type JetEvents } from './jetski'

const feelOn = () => [...new URLSearchParams(location.hash.split('?')[1] ?? '').keys()].some(isFeelParam)

interface Props {
  round: RoundId
  /** The round on screen changed (the address bar follows). */
  onRound(r: RoundId): void
}

export function JetSkiScreen({ round: first, onRound }: Props) {
  const [run, setRun] = useState({ round: first, n: 0 })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [count, setCount] = useState(-1)
  const [over, setOver] = useState<'won' | 'lost' | null>(null)
  const [round, setRound] = useState<RoundId>(first)
  const [feel] = useState(feelOn)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const sprayRef = useRef<HTMLDivElement>(null)
  const onRoundRef = useRef(onRound)
  onRoundRef.current = onRound

  useEffect(() => onRoundRef.current(run.round), [run])

  const events = useRef<JetEvents>({
    round: (r) => {
      setRound(r)
      setOver(null)
      onRoundRef.current(r)
    },
    raceOver: (won) => {
      setOver(won ? 'won' : 'lost')
      if (won) burst()
      else window.setTimeout(() => setOver(null), 2600)
    },
    count: (n) => setCount(n),
    spray: (k) => {
      const el = sprayRef.current
      if (!el) return
      el.style.transition = 'none'
      el.style.opacity = String(Math.min(1, 0.35 + k * 0.6))
      void el.offsetWidth
      el.style.transition = 'opacity 1.1s ease-out'
      el.style.opacity = '0'
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, { round: run.round }, events.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const jump = (r: RoundId) => {
    setOver(null)
    setCount(-1)
    setRound(r)
    setRun((v) => ({ round: r, n: v.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#D5EEFA', overflow: 'clip' }}>
      <style>{CSS}</style>
      <View3D
        key={run.n}
        name="Hat Sai Kaew"
        qaKey="__thaiSametQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={JET_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="jet-hint" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      {/* Spray on the lens after a big splash-down. */}
      <div ref={sprayRef} className="jet-spray" style={{ opacity: 0 }} />
      <AnimatePresence>
        {count >= 0 && (
          <motion.div key={count} initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.6, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 18 }} className="jet-count">
            {count === 0 ? '🏁' : count}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {over && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="jet-over">
            {over === 'won' ? (
              <>
                <div className="jet-badge">🏆 🔔</div>
                <BigButton onClick={() => { setOver(null); worldRef.current?.raceAgain() }} ariaLabel="Race again">
                  🔁 🏁
                </BigButton>
              </>
            ) : (
              <div className="jet-badge">So close! 🔁</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {feel && (
        <div className="jet-chips">
          {(['ride', 'waves', 'race'] as const).map((r) => (
            <button key={r} onClick={() => jump(r)} className={r === round ? 'on' : ''} aria-label={`Jet ski round: ${r}`}>
              {r === 'ride' ? '🛥️ ride' : r === 'waves' ? '🌊 waves' : '🏁 race'}
            </button>
          ))}
        </div>
      )}
      {mode === 'lost' && (
        <button onClick={() => { setMode('webgl'); jump(round) }} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(213,238,250,.9)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}>
          🛥️ Tap to wake the sea
        </button>
      )}
    </div>
  )
}

const CSS = `
.jet-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; }
.jet-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); animation: jet-press 1.4s ease-in-out infinite; }
@keyframes jet-press { 0%, 100% { transform: scale(1); } 45% { transform: scale(0.82) translateY(6px); } }
.jet-spray { position: absolute; inset: 0; pointer-events: none; z-index: 6;
  background:
    radial-gradient(circle at 18% 30%, rgba(255,255,255,.85) 0 1.2%, rgba(255,255,255,.25) 1.6%, transparent 1.9%),
    radial-gradient(circle at 34% 68%, rgba(255,255,255,.8) 0 0.9%, rgba(255,255,255,.2) 1.3%, transparent 1.5%),
    radial-gradient(circle at 62% 22%, rgba(255,255,255,.85) 0 1.5%, rgba(255,255,255,.25) 1.9%, transparent 2.2%),
    radial-gradient(circle at 80% 58%, rgba(255,255,255,.8) 0 1%, rgba(255,255,255,.2) 1.4%, transparent 1.6%),
    radial-gradient(circle at 46% 84%, rgba(255,255,255,.8) 0 1.6%, rgba(255,255,255,.2) 2%, transparent 2.3%),
    radial-gradient(circle at 90% 14%, rgba(255,255,255,.8) 0 0.8%, transparent 1.1%),
    radial-gradient(circle at 8% 82%, rgba(255,255,255,.8) 0 1.1%, transparent 1.4%),
    radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(230,248,255,.5) 100%); }
.jet-count { position: absolute; left: 50%; top: 38%; translate: -50% -50%; z-index: 12; pointer-events: none;
  font-size: clamp(90px, 22vmin, 200px); font-weight: 700; color: var(--hotpink); text-shadow: 0 4px 16px rgba(43,35,48,.22); }
.jet-over { position: absolute; left: 16px; right: 16px; bottom: calc(var(--safe-bottom, 0px) + 18px); z-index: 12; display: flex; gap: 14px; justify-content: center; align-items: center; }
.jet-badge { padding: 12px 24px; border-radius: 999px; background: rgba(255,255,255,.92); box-shadow: var(--shadow); font-size: clamp(26px, 5vmin, 44px); font-weight: 700; color: var(--ink); }
.jet-chips { position: absolute; right: 12px; top: calc(var(--top-clear) + 6px); z-index: 20; display: flex; gap: 6px; }
.jet-chips button { min-height: 48px; padding: 6px 14px; border-radius: 999px; border: none; background: rgba(255,255,255,.85); box-shadow: var(--shadow); font: inherit; font-size: 16px; font-weight: 600; color: var(--ink); }
.jet-chips button.on { background: var(--hotpink); color: #fff; }
`

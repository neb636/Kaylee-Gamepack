// Snorkeling at Ko Kudi, on screen (snorkel.ts is the world): the reef with its tap targets, the waterline drawn where
// the two views meet, the pressing finger after a while with nothing touched, Mommy's waterproof camera (📷) once the
// cuttlefish round begins, and once the cuttlefish has turned pink a 🐠 badge with the way back to the island (the stop's
// pink flag up). With ?feel=1 Dad also gets round chips (float, follow, cuttle).
// Sparkle sits in the corner (trip/legs/Guide.tsx) and plays everyone's lines (lines.ts L.samet.snorkel); Mommy's
// camera sits above her.
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst } from '../../../../../../sdk'
import { isFeelParam } from '../../../../../kit/knobs'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import { ANIMALS, type AnimalId } from '../book/animals'
import { Snorkel as World, SNORKEL_ANCHORS, SNORKEL_ROUND_IDS, type SnorkelEvents, type SnorkelRound } from './snorkel'

const feelOn = () => [...new URLSearchParams(location.hash.split('?')[1] ?? '').keys()].some(isFeelParam)
const CHIP: Record<SnorkelRound, string> = { float: '🤿 float', follow: '🐟 follow', cuttle: '🦑 cuttle' }
const ICON: Partial<Record<AnimalId, string>> = { parrotfish: '🐟', damselfish: '🐠', cuttlefish: '🦑', urchin: '🟣', coral: '🪸' }

interface Props {
  round: SnorkelRound
  /** The round on screen changed (the address bar follows). */
  onRound(r: SnorkelRound): void
  /** She snapped animals new to this visit (her book takes them at once; the address bar follows). */
  onSnap?(animals: AnimalId[]): void
  /** Back to the island, the snorkel's flag up, with the animals she snapped for her book. */
  onIsland?(snapped: AnimalId[]): void
}

export function SnorkelScreen({ round: first, onRound, onSnap, onIsland }: Props) {
  const [run, setRun] = useState({ round: first, n: 0 })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [round, setRound] = useState<SnorkelRound>(first)
  const [done, setDone] = useState(false)
  const [snapped, setSnapped] = useState<AnimalId[]>([])
  const [flash, setFlash] = useState(0)
  const [feel] = useState(feelOn)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<TripGuideHandle>(null)
  const onRoundRef = useRef(onRound)
  onRoundRef.current = onRound

  useEffect(() => onRoundRef.current(run.round), [run])

  const events = useRef<SnorkelEvents>({
    round: (r) => {
      setRound(r)
      onRoundRef.current(r)
    },
    done: () => {
      setDone(true)
      burst()
    },
    say: (l, mute) => guideRef.current?.speak(l, mute),
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, { round: run.round }, events.current)
    w.setHintElement(hintRef.current)
    w.setWaterlineElement(lineRef.current)
    return w
  }
  const jump = (r: SnorkelRound) => {
    setRound(r)
    setDone(false)
    setRun((v) => ({ round: r, n: v.n + 1 }))
  }
  const snap = () => {
    const got = worldRef.current?.snap() ?? []
    setFlash((f) => f + 1)
    const fresh = got.filter((a) => !snapped.includes(a))
    if (!fresh.length) return
    setSnapped((s) => [...s, ...fresh.filter((a) => !s.includes(a))])
    // Sparkle says its name, the first time it's snapped on this dive (like Mommy's phone on the island).
    guideRef.current?.speak(ANIMALS[fresh[0]].name)
    onSnap?.(fresh)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1F8EA5', overflow: 'clip' }}>
      <style>{CSS}</style>
      <View3D
        key={run.n}
        name="Ko Kudi"
        qaKey="__thaiSametQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <div ref={lineRef} className="reef-line" />
            <Anchors list={SNORKEL_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="reef-hint" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      {mode === 'webgl' && <TripGuide ref={guideRef} />}
      <AnimatePresence>
        {flash > 0 && <motion.div key={flash} className="reef-flash" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} transition={{ duration: 0.45 }} />}
      </AnimatePresence>
      {(round === 'cuttle' || done) && (
        <div className="reef-cam">
          <BigButton color="pink" onClick={snap} ariaLabel="Take a photo">
            📷
          </BigButton>
          <div className="reef-snaps">
            {snapped.map((a) => (
              <motion.span key={a} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                {ICON[a] ?? '⭐'}
              </motion.span>
            ))}
          </div>
        </div>
      )}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="reef-over">
            <div className="reef-badge">🐠 🦑 💗</div>
            {onIsland && (
              <BigButton color="mint" onClick={() => onIsland(snapped)} ariaLabel="Back to the island">
                🏝️
              </BigButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {feel && (
        <div className="reef-chips">
          {SNORKEL_ROUND_IDS.map((r) => (
            <button key={r} onClick={() => jump(r)} className={r === round ? 'on' : ''} aria-label={`Snorkel round: ${r}`}>
              {CHIP[r]}
            </button>
          ))}
        </div>
      )}
      {mode === 'lost' && (
        <button onClick={() => { setMode('webgl'); jump(round) }} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(31,142,165,.9)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: '#fff' }}>
          🐠 Tap to wake the reef
        </button>
      )}
    </div>
  )
}

const WAVE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='14' viewBox='0 0 80 14'%3E%3Cpath d='M0 7 Q10 1 20 7 T40 7 T60 7 T80 7' fill='none' stroke='white' stroke-width='3' stroke-opacity='.85'/%3E%3C/svg%3E")`
const CSS = `
.reef-line { position: absolute; left: 0; top: -7px; width: 100%; height: 26px; pointer-events: none; z-index: 1;
  background: ${WAVE} repeat-x 0 0 / 80px 14px, linear-gradient(rgba(255,255,255,0) 0, rgba(255,255,255,0) 7px, rgba(220,250,255,.45) 8px, rgba(220,250,255,0) 26px); }
/* The water's own blue over everything under the line (deeper further down). */
.reef-line::after { content: ''; position: absolute; left: 0; right: 0; top: 7px; height: 200vh; background: linear-gradient(rgba(40,170,190,.10), rgba(20,120,160,.28) 60vh); }
.reef-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; }
.reef-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); animation: reef-press 1.4s ease-in-out infinite; }
@keyframes reef-press { 0%, 100% { transform: scale(1); } 45% { transform: scale(0.82) translateY(6px); } }
.reef-flash { position: absolute; inset: 0; background: #fff; pointer-events: none; z-index: 15; }
.reef-cam { position: absolute; left: 16px; bottom: calc(var(--safe-bottom, 0px) + min(140px, 19vh, 28vw) + 18px); z-index: 12; display: flex; gap: 10px; align-items: center; }
.reef-snaps { display: flex; gap: 6px; font-size: clamp(26px, 4.5vmin, 38px); }
.reef-snaps span { display: inline-block; background: rgba(255,255,255,.88); border-radius: 14px; padding: 4px 8px; box-shadow: var(--shadow); }
.reef-over { position: absolute; right: 16px; bottom: calc(var(--safe-bottom, 0px) + 18px); z-index: 12; display: flex; gap: 14px; align-items: center; pointer-events: none; }
.reef-over > * { pointer-events: auto; }
.reef-badge { padding: 12px 22px; border-radius: 999px; background: rgba(255,255,255,.92); box-shadow: var(--shadow); font-size: clamp(24px, 4.5vmin, 40px); font-weight: 700; color: var(--ink); }
.reef-chips { position: absolute; right: 12px; top: calc(var(--top-clear) + 6px); z-index: 20; display: flex; gap: 6px; }
.reef-chips button { min-height: 48px; padding: 6px 14px; border-radius: 999px; border: none; background: rgba(255,255,255,.85); box-shadow: var(--shadow); font: inherit; font-size: 16px; font-weight: 600; color: var(--ink); }
.reef-chips button.on { background: var(--hotpink); color: #fff; }
`

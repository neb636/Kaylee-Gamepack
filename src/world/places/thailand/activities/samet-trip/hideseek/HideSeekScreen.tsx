// Hide and seek at Ao Prao, on screen (hideseek.ts is the world): the beach with its tap targets, a lavender blind
// with the numbers while your unicorn counts with her eyes shut (a tap peeks through it), Sparkle in the corner and
// everyone's voices (trip/legs/Guide.tsx: the words show by her, for the grown-ups), the pressing finger when she
// needs it and Mom's photo flash. Peekaboo's two films (the way in, and found) play over it: FilmOverlay draws their
// words and the hold-to-skip ⏭, and Sparkle's corner hides. The found film ends the stop: back to the island with
// Peekaboo. On a later visit (Peekaboo found already) a win shows a 🙈 badge with the way back instead.
// With ?feel=1 there are round chips too (1, 2, hide).
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { WebGLRenderer } from 'three'
import { BigButton, bigCelebration, burst, type Line } from '../../../../../../sdk'
import { isFeelParam } from '../../../../../kit/knobs'
import { Anchors } from '../../../../../engine3d/Anchors'
import type { FilmState } from '../../../../../engine3d/film'
import { FilmOverlay } from '../../../../../engine3d/FilmOverlay'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { TripGuide, WHO, type TripGuideHandle } from '../../../trip/legs/Guide'
import type { TimeOfDay } from '../island/scenery'
import { HIDE_ANCHORS, HIDE_ROUND_IDS, HideSeek as World, type HideEvents, type HidePlayRound, type HideRound } from './hideseek'

const feelOn = () => [...new URLSearchParams(location.hash.split('?')[1] ?? '').keys()].some(isFeelParam)
const CHIP: Record<HidePlayRound, string> = { '1': '🌳 easy', '2': '🏖️ tricky', hide: '🙈 her turn' }

interface Props {
  round: HideRound
  /** The fireflies she has found so far (the trip's flags: jetski, sandcastle, snorkel, hideseek). */
  flags?: string[]
  time?: TimeOfDay
  /** The round on screen changed (the address bar follows). */
  onRound(r: HideRound): void
  /** Back to the island with Peekaboo (the found film has played, or she was found on an earlier visit). */
  onIsland?(): void
}

export function HideSeekScreen({ round: first, flags, time, onRound, onIsland }: Props) {
  // Peekaboo found already (a later visit): no found film, a win shows the way back.
  const had = !!flags?.includes('hideseek')
  const [run, setRun] = useState({ round: first, n: 0 })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [round, setRound] = useState<HideRound>(first)
  const [count, setCount] = useState(0)
  const [peek, setPeek] = useState(0)
  const [flash, setFlash] = useState(0)
  const [won, setWon] = useState(false)
  // Peekaboo's films: the one on screen (its beat) and the words being said.
  const [film, setFilm] = useState<FilmState | null>(null)
  const [filmLine, setFilmLine] = useState<Line | null>(null)
  const [feel] = useState(feelOn)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<TripGuideHandle>(null)
  const onRoundRef = useRef(onRound)
  onRoundRef.current = onRound
  const onIslandRef = useRef(onIsland)
  onIslandRef.current = onIsland

  useEffect(() => onRoundRef.current(run.round), [run])

  const events = useRef<HideEvents>({
    round: (r) => {
      setRound(r)
      onRoundRef.current(r)
    },
    count: (n) => setCount(n),
    peek: () => setPeek((p) => p + 1),
    photo: () => setFlash((f) => f + 1),
    say: (l, mute) => guideRef.current?.speak(l, mute),
    won: (firstWin, badge) => {
      burst()
      if (firstWin) bigCelebration()
      if (firstWin && badge) setWon(true)
    },
    film: setFilm,
    filmLine: setFilmLine,
    // The found film is over: the island, with Peekaboo. (Nowhere to go: the way back shows, her turn goes on.)
    island: () => (onIslandRef.current ? onIslandRef.current() : setWon(true)),
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, { round: run.round, time, found: had }, events.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const jump = (r: HideRound) => {
    setRound(r)
    setCount(0)
    setWon(false)
    setFilm(null)
    setFilmLine(null)
    setRun((v) => ({ round: r, n: v.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#BFE9FA', overflow: 'clip' }}>
      <style>{CSS}</style>
      <View3D
        key={run.n}
        name="Ao Prao"
        qaKey="__thaiSametQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={HIDE_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="hs-hint" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      {/* Her eyes shut: the blind, the number, a peek through it on a tap (taps go through to the world). */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div key="blind" className="hs-blind" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <motion.div key={peek} className="hs-blind-fill" initial={{ opacity: peek ? 0.15 : 0.92 }} animate={{ opacity: 0.92 }} transition={{ duration: 0.75, ease: 'easeIn' }} />
            <div className="hs-eyes">🙈</div>
            <motion.div key={count} className="hs-num" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 16 }}>
              {count}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {mode === 'webgl' && <TripGuide ref={guideRef} hidden={!!film} />}
      {mode === 'webgl' && <FilmOverlay state={film} line={filmLine} speaker={(v) => WHO[v]} onSkip={() => worldRef.current?.skipFilm()} />}
      <AnimatePresence>
        {flash > 0 && <motion.div key={flash} className="hs-flash" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} transition={{ duration: 0.45 }} />}
      </AnimatePresence>
      <AnimatePresence>
        {won && !film && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="hs-over">
            <div className="hs-badge">🙈 🏆</div>
            {onIsland && (
              <BigButton color="mint" onClick={onIsland} ariaLabel="Back to the island">
                🏝️
              </BigButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {feel && (
        <div className="hs-chips">
          {HIDE_ROUND_IDS.map((r) => (
            <button key={r} onClick={() => jump(r)} className={r === round || (r === '1' && round === 'story') || (r === 'hide' && round === 'found') ? 'on' : ''} aria-label={`Hide and seek round: ${r}`}>
              {CHIP[r]}
            </button>
          ))}
        </div>
      )}
      {mode === 'lost' && (
        <button onClick={() => { setMode('webgl'); jump(round) }} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(191,233,250,.92)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}>
          🙈 Tap to wake the beach
        </button>
      )}
    </div>
  )
}

const CSS = `
.hs-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; }
.hs-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); animation: hs-press 1.4s ease-in-out infinite; }
@keyframes hs-press { 0%, 100% { transform: scale(1); } 45% { transform: scale(0.82) translateY(6px); } }
.hs-blind { position: absolute; inset: 0; z-index: 8; pointer-events: none; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
.hs-blind-fill { position: absolute; inset: 0; background: radial-gradient(circle at 50% 45%, #E9DEFF 0, var(--lavender) 45%, var(--lavender-dark) 100%); }
.hs-eyes { position: relative; font-size: clamp(64px, 14vmin, 120px); line-height: 1; }
.hs-num { position: relative; font-size: clamp(90px, 22vmin, 190px); line-height: 1; font-weight: 700; color: #fff; text-shadow: 0 4px 0 var(--hotpink); }
.hs-flash { position: absolute; inset: 0; background: #fff; pointer-events: none; z-index: 15; }
.hs-over { position: absolute; right: 16px; bottom: calc(var(--safe-bottom, 0px) + 18px); z-index: 12; display: flex; gap: 14px; align-items: center; pointer-events: none; }
.hs-over > * { pointer-events: auto; }
.hs-badge { padding: 12px 22px; border-radius: 999px; background: rgba(255,255,255,.92); box-shadow: var(--shadow); font-size: clamp(24px, 4.5vmin, 40px); font-weight: 700; color: var(--ink); }
.hs-chips { position: absolute; right: 12px; top: calc(var(--top-clear) + 6px); z-index: 20; display: flex; gap: 6px; }
.hs-chips button { min-height: 48px; padding: 6px 14px; border-radius: 999px; border: none; background: rgba(255,255,255,.85); box-shadow: var(--shadow); font: inherit; font-size: 16px; font-weight: 600; color: var(--ink); }
.hs-chips button.on { background: var(--hotpink); color: #fff; }
`

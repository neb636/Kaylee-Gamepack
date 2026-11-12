// The sandcastle at Ao Hin Khok, on screen (sandcastle.ts is the world): the 3D beach with its tap targets and the
// pressing finger after a while with nothing touched. Sandy's story (story.ts) plays its films over it: FilmOverlay
// draws their words and the hold-to-skip ⏭. When the found film is over the stop is done: back to the island with
// Sandy (onIsland). On a visit after she is found there are no films: once the moat has filled a little 🏰 badge
// shows, with the way back to the island. With ?feel=1 there are round chips too (dig, towers, tide).
// Sparkle sits in the corner (trip/legs/Guide.tsx, hidden during a film) and everyone talks in their own voice
// (lines.ts L.samet.sandcastle and L.samet.story.sandcastle).
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst, type Line } from '../../../../../../sdk'
import { isFeelParam } from '../../../../../kit/knobs'
import { Anchors } from '../../../../../engine3d/Anchors'
import type { FilmState } from '../../../../../engine3d/film'
import { FilmOverlay } from '../../../../../engine3d/FilmOverlay'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { TripGuide, WHO, type TripGuideHandle } from '../../../trip/legs/Guide'
import type { TimeOfDay } from '../island/scenery'
import { SAND_ANCHORS, SAND_ROUND_IDS, Sandcastle as World, type SandEvents, type SandPlayRound, type SandRound } from './sandcastle'

const feelOn = () => [...new URLSearchParams(location.hash.split('?')[1] ?? '').keys()].some(isFeelParam)
const CHIP: Record<SandPlayRound, string> = { dig: '🖐️ dig', towers: '🪣 towers', tide: '🌊 tide' }

interface Props {
  /** Where it opens: `story` (the way-in film, then the digging), a play round, or `found` (the found film on a
   *  castle built for it, then the island). */
  round: SandRound
  /** The fireflies she has found so far (the trip's flags: jetski, sandcastle, snorkel, hideseek). With `sandcastle`
   *  in it Sandy is found already: no films, she rides along. */
  flags?: string[]
  time?: TimeOfDay
  /** The round on screen changed (the address bar follows). */
  onRound(r: SandRound): void
  /** Back to the island with Sandy found (the trip raises her flag and she flies in there). */
  onIsland?(): void
}

export function SandcastleScreen({ round: first, flags, time, onRound, onIsland }: Props) {
  const [run, setRun] = useState({ round: first, n: 0 })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [round, setRound] = useState<SandRound>(first)
  const [filled, setFilled] = useState(false)
  // Sandy's story: a film on screen (its beat) and the words being said.
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
  // Found on an earlier visit (as this one opened: finding her now doesn't change the visit she is found in).
  const [found] = useState(() => !!flags?.includes('sandcastle'))
  // A rebuilt world (a lost GPU context) starts where she is now, not where the link was.
  const now = useRef(first)

  useEffect(() => onRoundRef.current(run.round), [run])

  const events = useRef<SandEvents>({
    say: (l, mute) => guideRef.current?.speak(l, mute),
    round: (r) => {
      now.current = r
      setRound(r)
      onRoundRef.current(r)
    },
    filled: () => {
      setFilled(true)
      burst()
    },
    found: () => {
      burst()
      // (Standing alone, with no island to go back to: the badge.)
      if (onIslandRef.current) onIslandRef.current()
      else setFilled(true)
    },
    film: setFilm,
    filmLine: setFilmLine,
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, { round: run.round, time, found: found && run.round !== 'story' && run.round !== 'found' }, events.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const jump = (r: SandRound) => {
    now.current = r
    setRound(r)
    setFilled(false)
    setFilm(null)
    setFilmLine(null)
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
        {filled && !film && (
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
      {mode === 'webgl' && <TripGuide ref={guideRef} hidden={!!film} />}
      {mode === 'webgl' && <FilmOverlay state={film} line={filmLine} speaker={(v) => WHO[v]} onSkip={() => worldRef.current?.skipFilm()} />}
      {feel && !film && (
        <div className="sand-chips">
          {SAND_ROUND_IDS.map((r) => (
            <button key={r} onClick={() => jump(r)} className={r === round ? 'on' : ''} aria-label={`Sandcastle round: ${r}`}>
              {CHIP[r]}
            </button>
          ))}
        </div>
      )}
      {mode === 'lost' && (
        <button onClick={() => { setMode('webgl'); jump(now.current) }} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(213,238,250,.9)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}>
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

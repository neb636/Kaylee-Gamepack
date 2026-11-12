// Snorkeling at Ko Kudi, on screen (snorkel.ts is the world): the reef with its tap targets, the waterline drawn where
// the two views meet, the pressing finger after a while with nothing touched, and Mom's waterproof camera (📷) once
// the cuttlefish round begins: a snap flashes, and Sparkle says what each animal is the first time it's in a picture.
// Bubbles' story (story.ts) plays its films over it: FilmOverlay draws their words and the hold-to-skip ⏭. The stop
// ends with the found film (the bubble pops, Bubbles is out), then the island by itself: no button to find.
// With ?feel=1 you also get round chips (float, follow, cuttle).
// Sparkle sits in the corner (trip/legs/Guide.tsx) and plays everyone's lines (lines.ts L.samet.snorkel); Mom's
// camera sits above her (on a phone on its side, on the right: Dad swims on her left).
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
import { ANIMALS, type AnimalId } from '../book/animals'
import { Snorkel as World, SNORKEL_ANCHORS, SNORKEL_ROUND_IDS, type SnorkelEvents, type SnorkelPlayRound, type SnorkelRound } from './snorkel'

const feelOn = () => [...new URLSearchParams(location.hash.split('?')[1] ?? '').keys()].some(isFeelParam)
const CHIP: Record<SnorkelPlayRound, string> = { float: '🤿 float', follow: '🐟 follow', cuttle: '🦑 cuttle' }
const ICON: Partial<Record<AnimalId, string>> = { parrotfish: '🐟', damselfish: '🐠', cuttlefish: '🦑', urchin: '🟣', coral: '🪸' }

interface Props {
  /** `story`: the way-in film, then the swim. `found`: the found film, then the island. */
  round: SnorkelRound
  /** The fireflies she has found so far (the trip's flags: jetski, sandcastle, snorkel, hideseek). */
  flags?: string[]
  /** The round on screen changed (the address bar follows). */
  onRound(r: SnorkelRound): void
  /** Bubbles is found (the found film has played): back to the island with her. */
  onIsland(): void
}

export function SnorkelScreen({ round: first, onRound, onIsland }: Props) {
  const [run, setRun] = useState({ round: first, n: 0 })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [round, setRound] = useState<SnorkelRound>(first)
  const [snapped, setSnapped] = useState<AnimalId[]>([])
  const [flash, setFlash] = useState(0)
  const [feel] = useState(feelOn)
  // Bubbles' story: a film on screen (its beat) and the words being said.
  const [film, setFilm] = useState<FilmState | null>(null)
  const [filmLine, setFilmLine] = useState<Line | null>(null)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<TripGuideHandle>(null)
  const onRoundRef = useRef(onRound)
  onRoundRef.current = onRound
  const onIslandRef = useRef(onIsland)
  onIslandRef.current = onIsland
  // A rebuilt world (a lost GPU context) starts where she is now, not where the link was.
  const now = useRef(first)

  useEffect(() => onRoundRef.current(run.round), [run])

  const events = useRef<SnorkelEvents>({
    round: (r) => {
      now.current = r
      setRound(r)
      onRoundRef.current(r)
    },
    island: () => onIslandRef.current(),
    say: (l, mute) => guideRef.current?.speak(l, mute),
    film: setFilm,
    filmLine: setFilmLine,
    cheer: () => burst(),
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, { round: run.round }, events.current)
    w.setHintElement(hintRef.current)
    w.setWaterlineElement(lineRef.current)
    return w
  }
  const jump = (r: SnorkelRound) => {
    now.current = r
    setRound(r)
    setFilm(null)
    setFilmLine(null)
    setRun((v) => ({ round: r, n: v.n + 1 }))
  }
  const snap = () => {
    const got = worldRef.current?.snap() ?? []
    setFlash((f) => f + 1)
    const fresh = got.filter((a) => !snapped.includes(a))
    if (!fresh.length) return
    setSnapped((s) => [...s, ...fresh.filter((a) => !s.includes(a))])
    // Sparkle says its name, the first time it's in a picture on this dive.
    guideRef.current?.speak(ANIMALS[fresh[0]].name)
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
      {mode === 'webgl' && <TripGuide ref={guideRef} hidden={!!film} />}
      {mode === 'webgl' && <FilmOverlay state={film} line={filmLine} speaker={(v) => WHO[v]} onSkip={() => worldRef.current?.skipFilm()} />}
      <AnimatePresence>
        {flash > 0 && <motion.div key={flash} className="reef-flash" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} transition={{ duration: 0.45 }} />}
      </AnimatePresence>
      {round === 'cuttle' && !film && (
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
        <button onClick={() => { setMode('webgl'); jump(now.current) }} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(31,142,165,.9)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: '#fff' }}>
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
/* A phone on its side: Dad swims on her left, where the camera would cover him; it goes to the right. */
@media (orientation: landscape) and (max-height: 500px) { .reef-cam { left: auto; right: 16px; flex-direction: row-reverse; } }
.reef-snaps { display: flex; gap: 6px; font-size: clamp(26px, 4.5vmin, 38px); }
.reef-snaps span { display: inline-block; background: rgba(255,255,255,.88); border-radius: 14px; padding: 4px 8px; box-shadow: var(--shadow); }
.reef-chips { position: absolute; right: 12px; top: calc(var(--top-clear) + 6px); z-index: 20; display: flex; gap: 6px; }
.reef-chips button { min-height: 48px; padding: 6px 14px; border-radius: 999px; border: none; background: rgba(255,255,255,.85); box-shadow: var(--shadow); font: inherit; font-size: 16px; font-weight: 600; color: var(--ink); }
.reef-chips button.on { background: var(--hotpink); color: #fff; }
`

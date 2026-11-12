// The island between the stops, on screen (island.ts is the world; samet-story.md is the story): the 3D island with
// its tap targets; the story's films over it (FilmOverlay: their words, the memory's storybook look, the hold-to-skip
// ⏭); the pictures of the beaches (Board.tsx) that come up after the way-in film, after each firefly found, from the
// top-right button and from a tap on the green taxi; the taxi's ride card (it drives across the screen while the
// island moves her to the beach she picked); Tofu's thought bubble (a picture of the stop he's running to); and the
// home picture at the end of Na Dan pier. Sparkle sits in the corner (trip/legs/Guide.tsx): she says what's new
// (lines.ts L.samet.story, L.samet.island), the family and the islanders talk in their own voices. A hub: no idle
// hints spoken (the top-right button glows instead).
import { AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../../engine3d/Anchors'
import type { FilmState } from '../../../../../engine3d/film'
import { FilmOverlay } from '../../../../../engine3d/FilmOverlay'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import type { Line } from '../../../../../../sdk'
import { L } from '../../../lines'
import { sametSfx as sfx } from '../sfx/common'
import { TripGuide, WHO, type TripGuideHandle } from '../../../trip/legs/Guide'
import { FIREFLY_IDS } from '../story/firefly'
import { Board, BOARD_CSS, FireflyIcon, STOP_SPOT, TaxiPicture, type BoardPick } from './Board'
import { ISLAND_ANCHORS, SametIsland as World, type IslandStart } from './island'
import type { SpotId, StopId } from './layout'
import { islandSfx } from './sounds'

interface Props {
  start: IslandStart
  /** She reached another beach (the address bar follows). */
  onAt(at: SpotId): void
  /** She opened a stop. */
  onOpen(stop: StopId | 'lunch' | 'sunset'): void
  /** All four fireflies and the speedboat home tapped: Mom's photo of the island (for Agong's wall). */
  onHome?(photo: string): void
  /** The home picture tapped at the end of Na Dan pier: off home on the speedboat (the trip is kept for next time). */
  onLeave?(): void
}

const S = L.samet.story
/** Seconds the taxi takes to cross the screen; the island moves her under it this long in. */
const RIDE_S = 1.75
const RIDE_MOVE_S = 0.55

export function IslandScreen({ start, onAt, onOpen, onHome, onLeave }: Props) {
  const [n, setN] = useState(0)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const worldRef = useRef<World | null>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const [leave, setLeave] = useState(false)
  const guideRef = useRef<TripGuideHandle>(null)
  const speak = (l: Line) => guideRef.current?.speak(l)
  // The story's films: which beat is on (the memory's look) and the words being said.
  const [film, setFilm] = useState<FilmState | null>(null)
  const [filmLine, setFilmLine] = useState<Line | null>(null)
  // The pictures of the beaches: up or down, and the pictures themselves (the island draws them once it's warm).
  const [board, setBoard] = useState(false)
  const [pics, setPics] = useState<Partial<Record<SpotId, string>>>({})
  const [nudge, setNudge] = useState(false)
  // The taxi driving across the screen (the island moves her to `to` under it).
  const [ride, setRide] = useState<{ to: SpotId; n: number } | null>(null)
  const rides = useRef(0)
  const here = useRef<SpotId>(start.at)
  const timers = useRef<number[]>([])
  const later = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, ms))
  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), [])
  const cb = useRef({ onAt, onOpen, onHome })
  cb.current = { onAt, onOpen, onHome }
  const all = start.flags.length === FIREFLY_IDS.length

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, start, {
      at: (a) => {
        here.current = a
        cb.current.onAt(a)
      },
      open: (s) => cb.current.onOpen(s),
      cleaned: (c) => {
        if (c === 1) speak(L.samet.island.clean)
      },
      say: speak,
      home: onHome ? (src) => cb.current.onHome?.(src) : undefined,
      leaveAsk: onLeave ? setLeave : undefined,
      film: setFilm,
      filmLine: setFilmLine,
      pictures: setPics,
      board: (on) => {
        setBoard(on)
        if (on) setNudge(false)
      },
      nudge: setNudge,
    })
    w.setBubbleElement(bubbleRef.current)
    return w
  }

  /** A picture tapped: the beach she's on closes the pictures (Tofu runs to its stop); another, and the taxi takes
   *  her there. */
  const pick = (id: BoardPick) => {
    const w = worldRef.current
    if (!w || ride) return
    const to: SpotId = id === 'sunset' ? 'prao' : STOP_SPOT[id]
    sfx.pop()
    setBoard(false)
    setNudge(false)
    if (here.current === to || (to === 'prao' && here.current === 'deck')) return w.showStop(id === 'sunset' ? 'hideseek' : id)
    const lines = S.island.ride
    islandSfx.taxiToot()
    speak(lines[rides.current++ % lines.length])
    setRide({ to, n: rides.current })
    later(RIDE_MOVE_S * 1000, () => worldRef.current?.travel(to, id === 'sunset' ? 'hideseek' : id))
    later(RIDE_S * 1000, () => {
      setRide(null)
      // The driver names the beach as they pull in (never before they set off).
      const name = to === 'hinkhok' ? S.island.hinkhok : L.samet.island.taxi.stop[to as keyof typeof L.samet.island.taxi.stop]
      if (name) speak(name)
      worldRef.current?.arrived()
    })
  }
  const busy = !!film || !!ride

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#D5EEFA', overflow: 'clip' }}>
      <style>{CSS + BOARD_CSS}</style>
      <View3D
        key={n}
        name="Koh Samet"
        qaKey="__thaiSametQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={ISLAND_ANCHORS} els={els} {...input} />
            <div ref={bubbleRef} className="pup-bubble" style={{ display: 'none' }}>
              <span className="pup-dot pup-dot-1" />
              <span className="pup-dot pup-dot-2" />
              <div className="pup-pic">
                <img alt="" />
              </div>
            </div>
          </>
        )}
      />
      <AnimatePresence>{board && !busy && <Board key="board" pics={pics} found={start.flags} here={here.current} onPick={pick} onClose={() => setBoard(false)} />}</AnimatePresence>
      {!busy && (
        <button
          className={`isle-go${nudge && !board ? ' isle-go-nudge' : ''}`}
          aria-label={board ? 'Close the pictures' : 'Where to? The pictures of the beaches'}
          onClick={() => {
            sfx.pop()
            setNudge(false)
            worldRef.current?.touched()
            setBoard((b) => !b)
          }}
        >
          <span className="isle-go-taxi">
            <TaxiPicture size="100%" />
          </span>
          <span className="isle-go-flies">
            {FIREFLY_IDS.map((id) => (
              <FireflyIcon key={id} id={id} lit={start.flags.includes(id)} size={22} />
            ))}
          </span>
        </button>
      )}
      {mode === 'webgl' && <TripGuide ref={guideRef} hidden={!!film} />}
      {mode === 'webgl' && <FilmOverlay state={film} line={filmLine} speaker={(v) => WHO[v]} onSkip={() => worldRef.current?.skipFilm()} />}
      {ride && (
        <div className="isle-ride" key={ride.n} data-ride={ride.to} aria-hidden>
          <span className="isle-ride-palm" style={{ animationDelay: '-.2s' }}>
            🌴
          </span>
          <span className="isle-ride-palm" style={{ animationDelay: '-.95s', fontSize: 'clamp(44px, 11vmin, 110px)' }}>
            🌴
          </span>
          <div className="isle-ride-road" />
          <div className="isle-ride-taxi">
            <div>
              <TaxiPicture size="100%" />
            </div>
          </div>
        </div>
      )}
      {leave && !busy && !board && !all && (
        <button
          className="isle-home"
          aria-label="Go home"
          onClick={() => {
            sfx.pop()
            setLeave(false)
            onLeave?.()
          }}
        >
          <HomePicture />
        </button>
      )}
      {mode === 'lost' && (
        <button onClick={() => { setMode('webgl'); setN((v) => v + 1) }} style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'rgba(213,238,250,.9)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}>
          🏝️ Tap to wake the island
        </button>
      )}
    </div>
  )
}

/** The home picture at the end of the pier: the speedboat, and home (a house with a heart). */
function HomePicture() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '82%', height: '82%' }} aria-hidden>
      <path d="M20 48 L50 22 L80 48 Z" fill="#FF5FA8" stroke="#2B2330" strokeWidth="3" strokeLinejoin="round" />
      <rect x="27" y="46" width="46" height="34" rx="3" fill="#FFF6EC" stroke="#2B2330" strokeWidth="3" />
      <rect x="44" y="60" width="13" height="20" rx="2" fill="#C99A66" stroke="#2B2330" strokeWidth="2.5" />
      <path d="M36 52 c0 -4 6 -4 6 0 c0 -4 6 -4 6 0 c0 4 -6 7 -6 9 c0 -2 -6 -5 -6 -9 Z" fill="#FF5FA8" transform="translate(-4 0)" />
      <path d="M10 88 Q30 82 50 88 T90 88" stroke="#7FC8F0" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

const CSS = `
.pup-bubble { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 6; --size: 104px; }
.pup-pic { position: absolute; left: calc(var(--size) / -2); top: calc(var(--size) / -2); width: var(--size); height: var(--size); border-radius: 50%; overflow: hidden; background: #fff; border: 5px solid #fff; box-shadow: 0 0 0 3px var(--hotpink), 0 6px 14px rgba(43,35,48,.25); }
.pup-pic img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pup-dot { position: absolute; border-radius: 50%; background: #fff; box-shadow: 0 0 0 2px var(--hotpink); }
.pup-dot-1 { width: 16px; height: 16px; left: calc(var(--tx) * 0.62 - 8px); top: calc(var(--ty) * 0.62 - 8px); }
.pup-dot-2 { width: 10px; height: 10px; left: calc(var(--tx) * 0.82 - 5px); top: calc(var(--ty) * 0.82 - 5px); }
.isle-home { position: absolute; left: 50%; bottom: calc(var(--safe-bottom, 0px) + 22%); width: 132px; height: 132px; margin-left: -66px; border-radius: 50%; border: 6px solid #fff; background: #FFE3F0; box-shadow: 0 0 0 4px var(--hotpink), 0 8px 18px rgba(43,35,48,.3); display: grid; place-items: center; z-index: 40; animation: isle-home-in .5s cubic-bezier(.3,1.6,.5,1) both, isle-home-bob 1.4s ease-in-out .5s infinite; }
@keyframes isle-home-in { from { transform: scale(0); } to { transform: scale(1); } }
@keyframes isle-home-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
`

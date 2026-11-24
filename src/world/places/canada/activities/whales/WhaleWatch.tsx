// Whale Peek-a-Boo (canada-round-2.md in git history, section 3): bubbles come up by Maple's boat, she
// touches them and a whale comes up right there, and plays with it: the grey whale, the humpback, then the orca family
// whose baby has Ollie's lucky rock (watch.ts is the world). After the chapter's film in (`filmed`) Sparkle's one
// instruction comes at once; from a link or a replay Ollie first says what happened (tap anywhere skips). Sparkle
// speaks again only when something new appears or she's stuck; Maple and Ollie react in their own voices (Guide.tsx).
// Maple's soaked faces are close-ups (FilmOverlay: hold ⏭ to skip). The address bar follows her (sections.ts). All the
// whales jumping together is the payoff: then the film out, the stamp and the sea otter sticker (onDone); 🔁 again.
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst, stopSpeaking, useAlive, type Line, useTimers } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import type { FilmState } from '../../../../engine3d/film'
import { FilmOverlay } from '../../../../engine3d/FilmOverlay'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import type { CanadaActivityProps } from '../props'
import { WhaleGuide, WHO, type WhaleGuideHandle } from './Guide'
import WHALE_SECTIONS, { type WhaleSection } from './sections'
import { WHALE_ANCHORS, WhaleWatch as World, type WhaleEvents, type WhaleStart } from './watch'

/** Parts finished when a link starts at this section (of three: the grey whale, the humpback, the orcas). */
const DONE_AT: Record<WhaleSection, number> = { story: 0, grey: 0, humpback: 1, orcas: 2 }
/** Seconds from the whales' big jump to the stamp (the celebration plays first). */
const STAMP_AFTER_S = 5

/** A look at one whale on its own, for checking the models (?lab=grey&view=side&move=roll; not a section). */
function labParam(): WhaleStart['lab'] {
  const q = new URLSearchParams(location.hash.split('?')[1] ?? '')
  const kind = q.get('lab')
  return kind ? { kind, view: q.get('view') ?? 'side', move: q.get('move') ?? '' } : undefined
}

export function WhaleWatch({ onDone, setProgress, filmed }: CanadaActivityProps) {
  const timers = useTimers()
  const { start, enter } = useSections(WHALE_SECTIONS)
  const [run, setRun] = useState<WhaleStart & { n: number }>(() => ({ section: (start ?? (filmed ? 'grey' : 'story')) as WhaleSection, filmed, lab: labParam(), n: 0 }))
  const [section, setSection] = useState<WhaleSection>(run.section)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [done, setDone] = useState(false)
  const [film, setFilm] = useState<FilmState | null>(null)
  const [filmLine, setFilmLine] = useState<Line | null>(null)
  const alive = useAlive()
  const worldRef = useRef<World | null>(null)
  const guide = useRef<WhaleGuideHandle>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const stamped = useRef(false)

  useEffect(() => enter(run.section), [run])
  useEffect(() => setProgress(DONE_AT[run.section], 3), [run])
  // From a link or a replay: Ollie's line is the story; when it's said (or tapped away) the bubbles come.
  useEffect(() => {
    if (run.section !== 'story' || run.lab) return
    const t = timers.later(() => worldRef.current?.play(), 3600)
    return () => clearTimeout(t)
  }, [run])

  const events = useRef<WhaleEvents>({
    section: (s) => {
      setSection(s)
      enter(s)
    },
    done: () => {
      setDone(true)
      burst()
      timers.later(() => {
        if (!alive() || stamped.current) return
        stamped.current = true
        onDone()
      }, STAMP_AFTER_S * 1000)
    },
    say: (l, voice = true) => (voice ? void guide.current?.speak(l) : guide.current?.show(l)),
    progress: (n) => setProgress(n, 3),
    film: setFilm,
    filmLine: setFilmLine,
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, run, events.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const restart = (s: WhaleSection) => {
    setDone(false)
    setSection(s)
    setFilm(null)
    setFilmLine(null)
    setRun((r) => ({ section: s, n: r.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#CFEAF7', overflow: 'clip' }}>
      <style>{HINT_CSS}</style>
      <View3D
        key={run.n}
        name="the sea off Tofino"
        qaKey="__canadaWhalesQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={WHALE_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="whale-hint" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      {/* Ollie's line from a link: tap anywhere and the bubbles come. */}
      {section === 'story' && !run.lab && (
        <button
          aria-label="Skip"
          onClick={() => {
            stopSpeaking()
            worldRef.current?.play()
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 25, background: 'transparent', border: 'none' }}
        />
      )}
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            restart(section === 'story' ? 'grey' : section)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(207,234,247,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🐋
        </button>
      )}
      {done && (
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: STAMP_AFTER_S + 0.5, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={() => restart('grey')} ariaLabel="Play with the whales again">
              🔁 🐋
            </BigButton>
          </motion.div>
        </div>
      )}
      <WhaleGuide ref={guide} hidden={!!film} />
      {mode === 'webgl' && <FilmOverlay state={film} line={filmLine} speaker={(v) => WHO[v]} onSkip={() => worldRef.current?.skipFilm()} />}
    </div>
  )
}

/** The hint's hand: a finger pressing on the thing to touch. */
const HINT_CSS = `
.whale-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; }
.whale-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); animation: whale-press 1.4s ease-in-out infinite; }
@keyframes whale-press {
  0%, 100% { transform: scale(1); }
  45% { transform: scale(0.82) translateY(6px); }
}
`

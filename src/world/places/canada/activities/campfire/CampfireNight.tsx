// Campfire Night, in 3D: Flashlight Statues (plan: planning/around-the-world/canada-round-2.md, part 2). The clearing
// at night where her finger is the flashlight (world.ts is the world; it also does the talking: Maple's hello, Sparkle's
// one line per part and her help when Kaylee is stuck, everybody's reactions). After the chapter's way-in film
// (`filmed`) it starts at Sparkle's instruction; from a link or a replay Maple says her hello first. The address bar
// follows her from part to part (sections.ts). Sparkle sits in the corner (a tap hears her last line again) and the
// line at the bottom shows what she said. Roxy's first statue is a close-up (a little film: FilmOverlay shows its
// words). When the northern lights have danced, onDone (the film out and the stamp); "again" lights the flashlight
// and starts over.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst, lineText, say, SparklePuppet, type Line, type PuppetHandle, useTimers } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import type { FilmState } from '../../../../engine3d/film'
import { FilmOverlay } from '../../../../engine3d/FilmOverlay'
import { View3D, type QAKey, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import { CHAPTER_FILMS, filmSeen } from '../../story/chapters'
import { WHO } from '../../story/StoryFilm'
import type { CanadaActivityProps } from '../props'
import CAMPFIRE_SECTIONS, { type CampSection } from './sections'
import { CAMP_ANCHORS, CAMP_PARTS, FlashlightStatues as World, type CampEvents, type CampStart } from './world'

const T = L.campfire
/** What the line at the bottom says as each part begins, and its little picture. */
const SAY: Record<CampSection, Line> = { story: T.eyes, eyes: T.eyes, peek: T.giggle, statues: T.sneak, roast: T.marshmallow, sky: T.off }
const ICON: Record<CampSection, string> = { story: '🔦', eyes: '🔦', peek: '🙈', statues: '🦝', roast: '🍡', sky: '🌌' }

declare global {
  interface Window {
    /** QA only: Flashlight Statues' readout (world.ts `qa()`). */
    __canadaCampfireQA?: () => Record<string, unknown>
  }
}
// (View3D's list of readouts is shared; this one is Campfire Night's own.)
const QA_KEY = '__canadaCampfireQA' as QAKey

export function CampfireNight({ onDone, setProgress, filmed, stamps }: CanadaActivityProps) {
  const timers = useTimers()
  const { start, param, enter } = useSections(CAMPFIRE_SECTIONS)
  const [run, setRun] = useState<CampStart & { n: number }>(() => ({
    section: start ?? (filmed ? 'eyes' : 'story'),
    kits: Number(param('kits')) || 0,
    laughs: Number(param('laughs')) || 0,
    order: Number(param('order')) || 0,
    // (Maple's goodnight only when no film follows: a replay, or the film out already seen.)
    goodnight: stamps.includes('campfire') || filmSeen(CHAPTER_FILMS.campfire.out),
    n: 0,
  }))
  const [section, setSection] = useState<CampSection>(run.section)
  const [line, setLine] = useState<Line>(SAY[run.section])
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [film, setFilm] = useState<FilmState | null>(null)
  const [filmLine, setFilmLine] = useState<Line | null>(null)
  const [done, setDone] = useState(false)
  const [stars, setStars] = useState<{ done: number; of: number } | null>(null)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const finished = useRef(false)
  const cb = useRef({ onDone, setProgress })
  cb.current = { onDone, setProgress }

  useEffect(() => {
    const s = run.section
    enter(s, s === 'peek' ? { kits: String(run.kits) } : s === 'statues' ? { laughs: String(run.laughs) } : s === 'roast' ? { order: String(run.order) } : {})
  }, [run])

  const events = useRef<CampEvents>({
    section: (s, state) => {
      setSection(s)
      enter(s, state)
    },
    line: (l) => {
      setLine(l)
      sparkle.current?.play('wave')
    },
    progress: (n) => cb.current.setProgress(n, CAMP_PARTS),
    filmLine: setFilmLine,
    film: setFilm,
    stars: setStars,
    done: () => {
      setDone(true)
      burst()
      // The stamp, once (a replay after it doesn't earn another).
      if (!finished.current) {
        finished.current = true
        timers.later(() => cb.current.onDone(), 600)
      }
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, run, events.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const restart = (s: CampSection) => {
    setDone(false)
    setSection(s)
    setLine(SAY[s])
    setStars(null)
    setRun((r) => ({ ...r, section: s, kits: 0, laughs: 0, order: 0, goodnight: true, n: r.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#14102A', overflow: 'clip' }}>
      <style>{HINT_CSS}</style>
      <View3D
        key={run.n}
        name="the campsite at night"
        qaKey={QA_KEY}
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={CAMP_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="camp-hint" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      {mode === 'webgl' && <FilmOverlay state={film} line={filmLine} speaker={(v) => WHO[v]} onSkip={() => worldRef.current?.skipFilm()} />}
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            restart(section)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(20,16,42,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: '#FFF7F0' }}
        >
          🔦 Tap to wake the campsite
        </button>
      )}
      {/* The roast: a gold star for every order given right (the row fills up). */}
      {stars && !film && (
        <div className="camp-stars" aria-label={`${stars.done} of ${stars.of} stars`} style={{ position: 'absolute', display: 'flex', gap: 4, padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,.88)', boxShadow: 'var(--shadow)', zIndex: 20, pointerEvents: 'none' }}>
          {Array.from({ length: stars.of }, (_, i) => (
            <motion.svg key={i} viewBox="0 0 24 24" width="clamp(26px, 4.4vmin, 40px)" height="clamp(26px, 4.4vmin, 40px)" animate={i < stars.done ? { scale: [1, 1.5, 1] } : { scale: 1 }} transition={{ duration: 0.45 }}>
              <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill={i < stars.done ? '#FFD447' : '#E4DFF0'} stroke={i < stars.done ? '#C98A1A' : '#BDB5D6'} strokeWidth="1.4" strokeLinejoin="round" />
            </motion.svg>
          ))}
        </div>
      )}
      {/* Sparkle in the corner: she gives the instructions; a tap hears the last one again. */}
      {!film && (
        <button
          aria-label="Hear it again"
          onClick={() => {
            sparkle.current?.play('nod')
            void say(line)
          }}
          style={{ position: 'absolute', left: 'max(8px, env(safe-area-inset-left))', bottom: 'calc(var(--safe-bottom) + 4px)', width: 'var(--target, 88px)', height: 'calc(var(--target, 88px) * 1.25)', zIndex: 21, background: 'none', border: 'none', padding: 0 }}
        >
          <SparklePuppet ref={sparkle} height="100%" lookToward={0.6} />
        </button>
      )}
      {!film && (
        <div style={{ position: 'absolute', left: 'calc(var(--target, 88px) + 16px)', right: 'calc(var(--target, 88px) + 16px)', bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
          {done && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
              <BigButton onClick={() => restart('eyes')} ariaLabel="Play again">
                🔁 🔦
              </BigButton>
            </motion.div>
          )}
          <AnimatePresence mode="popLayout">
            <motion.button key={lineText(line)} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL} onClick={() => void say(line)} aria-label={`Hear it again: ${lineText(line)}`}>
              {ICON[section]} {lineText(line)} <span style={{ opacity: 0.6 }}>🔊</span>
            </motion.button>
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

const PILL = {
  background: 'rgba(255,255,255,.92)',
  color: 'var(--ink)',
  borderRadius: 999,
  border: 'none',
  padding: '8px 20px',
  minHeight: 48,
  fontSize: 'clamp(16px, 2.4vmin, 22px)',
  fontWeight: 600,
  fontFamily: 'inherit',
  boxShadow: 'var(--shadow)',
  textAlign: 'center' as const,
  maxWidth: '100%',
  pointerEvents: 'auto' as const,
}

/** The hint's hand: a press on what to touch (the wiggly tail, the marshmallow, the flashlight). */
const HINT_CSS = `
.camp-stars { top: calc(var(--safe-top, 0px) + 14px); right: max(12px, env(safe-area-inset-right)); }
@media (max-aspect-ratio: 1/1) { .camp-stars { top: calc(var(--safe-top, 0px) + 92px); right: auto; left: 50%; transform: translateX(-50%); } }
.camp-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 6; }
.camp-hint span { position: absolute; left: -26px; top: -6px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(0,0,0,.45)); animation: camp-press 1.2s ease-in-out infinite; }
@keyframes camp-press {
  0%, 100% { transform: scale(1); }
  45% { transform: scale(0.82) translateY(6px); }
}
`

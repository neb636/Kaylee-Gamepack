// Decorate a Snowman: Kaylee decorates snowmen for the Winter Carnival in the snowy park below Quebec City's castle
// hotel, with whatever she grabs off Maple's red toboggan (decorate.ts is the world). The bare link opens with Maple's
// hello (a touch skips it). Sparkle, in the corner, says the one instruction for each part (tap her or the bubble to
// hear it again), the friend's picture card floats over their head, Maple's camera flashes when a snowman wakes up.
// The address bar follows her from part to part (sections.ts). After the parade the stamp (onDone); "again" starts
// fresh.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst, lineText, say, SparklePuppet, spendHint, type Line, type PuppetHandle } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { CanadaActivityProps } from '../props'
import { CardPicture } from './Card'
import { DecorateSnowman as World, STUDIO_ANCHORS, type HintKind, type StudioEvents } from './decorate'
import SNOWMAN_SECTIONS, { type SnowmanSection } from './sections'
import type { Card } from './studio'

/** What Sparkle says (and the bubble shows) as each part begins. The story and the parade are Maple's. */
const SAY: Record<SnowmanSection, Line> = {
  story: L.snowman.story[0],
  face: L.snowman.face,
  dress: L.snowman.dress,
  friends: L.snowman.friends,
  parade: L.snowman.parade,
}
const HINTS: Record<HintKind, Line> = { tool: L.snowman.face, drum: L.snowman.drum }
const ICON: Record<SnowmanSection, string> = { story: '🎪', face: '⛄', dress: '🎩', friends: '🖼️', parade: '🎺' }
const PARTS: SnowmanSection[] = ['face', 'dress', 'friends', 'parade']
/** How many snowmen wait in the line when a link doesn't say (the world sets up the same). */
const DEFAULT_MADE: Partial<Record<SnowmanSection, number>> = { friends: 1, parade: 4 }

export function DecorateSnowman({ onDone, setProgress }: Partial<CanadaActivityProps> = {}) {
  const { start, param, enter } = useSections(SNOWMAN_SECTIONS)
  const [run, setRun] = useState(() => {
    const section = (start ?? 'story') as SnowmanSection
    return { section, made: Number(param('made')) || DEFAULT_MADE[section] || 0, n: 0 }
  })
  const [section, setSection] = useState<SnowmanSection>(run.section)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [done, setDone] = useState(false)
  const [line, setLine] = useState<Line>(SAY[run.section])
  const [card, setCard] = useState<Card | null>(null)
  const [flash, setFlash] = useState(0)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const finished = useRef(false)
  const said = useRef<SnowmanSection>(run.section)
  const drums = useRef(0)
  const cb = useRef({ onDone, setProgress })
  cb.current = { onDone, setProgress }

  const state = (s: SnowmanSection, made: number) => (s === 'friends' || s === 'parade' ? { made: String(Math.max(1, made)) } : {})
  const progress = (s: SnowmanSection) => cb.current.setProgress?.(Math.max(0, PARTS.indexOf(s)), PARTS.length)
  useEffect(() => {
    enter(run.section, state(run.section, run.made))
    progress(run.section)
  }, [run])

  /** Sparkle says it (after whoever is talking), and the bubble shows it. */
  const guide = (l: Line, voice = true) => {
    setLine(l)
    sparkle.current?.play('wave')
    if (voice) void say(l, { interrupt: false })
  }
  // A section link that starts past the story: Sparkle says what to do there.
  useEffect(() => {
    if (run.section !== 'story' && run.section !== 'parade') guide(SAY[run.section])
  }, [run])

  const events = useRef<StudioEvents>({
    section: (s, made) => {
      // Each friend's picture keeps the address bar up to date, but Sparkle only says what to do once per part.
      const fresh = s !== said.current
      said.current = s
      setSection(s)
      enter(s, state(s, made))
      progress(s)
      // (The parade's line is Maple's, and she says it herself.)
      if (s === 'parade') setLine(SAY.parade)
      else if (fresh) guide(SAY[s])
    },
    card: setCard,
    // The drum: Sparkle says it the first time; after that it only shows (and bounces).
    ready: () => guide(L.snowman.drum, drums.current++ === 0),
    flash: () => setFlash((f) => f + 1),
    hint: (kind) => guide(HINTS[kind], spendHint(HINTS[kind])),
    done: () => {
      setDone(true)
      burst()
      cb.current.setProgress?.(PARTS.length, PARTS.length)
      // The stamp, once (a replay after it doesn't earn another).
      if (!finished.current) {
        finished.current = true
        setTimeout(() => cb.current.onDone?.(), 1200)
      }
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, { section: run.section, made: run.made }, events.current)
    w.setHintElement(hintRef.current)
    w.setCardElement(cardRef.current)
    return w
  }
  const restart = (s: SnowmanSection) => {
    setDone(false)
    setCard(null)
    setSection(s)
    setLine(SAY[s])
    said.current = s
    drums.current = 0
    setRun((r) => ({ section: s, made: 0, n: r.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#DCE6F6', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="the carnival park"
        qaKey="__canadaSnowmanQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={STUDIO_ANCHORS} els={els} {...input} />
            {/* The friend's picture card, over Maple's head. */}
            <div ref={cardRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 15000 }}>
              <AnimatePresence mode="popLayout">
                {card && (
                  <motion.div
                    key={card}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: [-4, 4, -4] }}
                    exit={{ scale: 0 }}
                    transition={{ rotate: { repeat: Infinity, duration: 2.2 }, scale: { type: 'spring', stiffness: 400, damping: 14 } }}
                    style={{ translate: '-50% -100%', padding: 6, borderRadius: 18, background: '#fff', border: '4px solid #E8443F', boxShadow: '0 4px 10px rgba(43,35,48,.18)', width: 'clamp(76px, 13vmin, 116px)', height: 'clamp(76px, 13vmin, 116px)', display: 'grid', placeItems: 'center' }}
                  >
                    <CardPicture card={card} size="100%" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* After a while with nothing touched: a finger on a tool she hasn't tried, or on the drum. */}
            <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
              <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
                👆
              </motion.div>
            </div>
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            restart(section)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(220,230,246,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          ⛄ Tap to wake the park
        </button>
      )}
      {/* Maple's camera flash. */}
      <AnimatePresence>{flash > 0 && <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 55 }} />}</AnimatePresence>
      {/* Sparkle in the corner: she gives the instructions. */}
      {section !== 'story' && (
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
      <div style={{ position: 'absolute', left: 'calc(var(--target, 88px) + 16px)', right: 'calc(var(--target, 88px) + 16px)', top: 'calc(var(--top-clear, 104px) + 6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        <AnimatePresence mode="popLayout">
          <motion.button key={lineText(line)} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL} onClick={() => void say(line)} aria-label="Hear it again">
            {ICON[section]} {lineText(line)}
          </motion.button>
        </AnimatePresence>
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={() => restart('face')} ariaLabel="Decorate more snowmen">
              🔁 ⛄
            </BigButton>
          </motion.div>
        )}
      </div>
    </div>
  )
}

const PILL = {
  background: 'rgba(255,255,255,.92)',
  color: 'var(--ink)',
  borderRadius: 999,
  padding: '8px 20px',
  fontSize: 'clamp(16px, 2.4vmin, 22px)',
  fontWeight: 600,
  boxShadow: 'var(--shadow)',
  textAlign: 'center' as const,
  maxWidth: '100%',
  border: 'none',
  fontFamily: 'inherit',
  pointerEvents: 'auto' as const,
}

// Canada's finale, the big game (planning/around-the-world/canada.md): the `game-in` film on the film stage (the
// whole team skates out, Gus scoffs, Lulu sings), Pond Hockey on the frozen Rideau Canal (rink.ts), the `game-win`
// film (the Maple Cup, taffy for everybody), then the shell's trophy (Place.tsx turns onDone into it: gold, Canada
// Champion). The address bar follows her (sections.ts): the film, each goal of the game, the win. Sparkle gives the
// instructions; Maple and the team react in their own voices (lines.ts, L.party). A short line at the bottom says
// what's on screen (for a grown-up) with a button to hear it again.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { SayButton, type Line } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type QAKey, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import { StoryFilm } from '../../story/StoryFilm'
import type { CanadaActivityProps } from '../props'
import { RINK_ANCHORS, RinkWorld, type RinkEvents } from './rink'
import PARTY, { GOALS, teamOf, type PartySection } from './sections'

/** Read-only state for QA. */
const QA_KEY: QAKey = '__canadaPartyQA'

const ROUND: Line[] = [L.party.rink, L.party.geese, L.party.last]
const ROUND_ICON = ['🏒', '🪿', '🏆']

/** The film before the game, the game, the film after it. */
type Part = 'in' | 'hockey' | 'out'

export function Finale({ onDone, setProgress, stamps }: CanadaActivityProps) {
  const { start, param, enter } = useSections(PARTY)
  const [initial] = useState(() => {
    const section = (start ?? 'story') as PartySection
    return { section, score: Math.max(0, Math.min(GOALS - 1, Math.floor(+param('score')) || 0)), teamParam: param('team') }
  })
  const team = useState(() => teamOf(initial.teamParam, stamps))[0]
  const [part, setPart] = useState<Part>(initial.section === 'story' ? 'in' : initial.section === 'win' ? 'out' : 'hockey')
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [line, setLine] = useState<{ text: string; say: Line }>({ text: '', say: '' })
  const [goals, setGoals] = useState(initial.section === 'hockey' ? initial.score : 0)
  const rinkRef = useRef<RinkWorld | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const finished = useRef(false)
  const teamState = initial.teamParam ? { team: initial.teamParam } : {}

  const finish = () => {
    if (finished.current) return
    finished.current = true
    onDone()
  }

  useEffect(() => {
    if (part === 'in') enter('story', teamState)
    else if (part === 'out') enter('win', teamState)
  }, [part])
  useEffect(() => setProgress(goals, GOALS), [goals])

  const rinkEvents = useRef<RinkEvents>({
    round: (score) => {
      setGoals(score)
      setLine({ text: `${ROUND_ICON[score]} ${ROUND[score]}`, say: ROUND[score] })
      enter('hockey', { score: String(score), ...teamState })
    },
    goal: (score) => {
      setGoals(score)
      setLine({ text: '🎉 Goal!', say: L.party.goal[(score - 1) % L.party.goal.length] })
    },
    saved: () => {},
    hint: () => setLine({ text: `👆 ${L.party.rinkHint}`, say: L.party.rinkHint }),
    // The cheering on the ice is done: the Cup.
    win: () => setPart('out'),
  })

  if (part === 'in') return <StoryFilm id="game-in" onDone={() => setPart('hockey')} />
  // (The film takes the game's place: two 3D worlds would share the one renderer and both keep drawing.)
  if (part === 'out') return <StoryFilm id="game-win" onDone={finish} />
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#D6E8F8', overflow: 'clip' }}>
      <style>{HINT_CSS}</style>
      <View3D
        key={`rink-${engine}`}
        name="the frozen canal"
        qaKey={QA_KEY}
        worldRef={rinkRef}
        onMode={setMode}
        make={(renderer) => {
          const w = new RinkWorld(renderer, { score: goals >= GOALS ? GOALS - 1 : goals, team, win: false }, rinkEvents.current)
          w.setHintElement(hintRef.current)
          return w
        }}
        anchors={(input, els) => (
          <>
            <Anchors list={RINK_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="party-hint" data-kind="drag" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(221,235,250,.9)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🏒 Tap to wake the ice
        </button>
      )}
      {/* The score: a puck for each goal (no numbers). */}
      <div style={{ position: 'absolute', right: 16, top: 'calc(var(--top-clear) + 6px)', zIndex: 20, pointerEvents: 'none', display: 'flex', gap: 8, background: 'rgba(255,255,255,.94)', borderRadius: 999, padding: '8px 16px', boxShadow: 'var(--shadow)' }}>
        {Array.from({ length: GOALS }, (_, i) => (
          <motion.span key={`${i}-${i < goals}`} initial={{ scale: i < goals ? 1.8 : 1 }} animate={{ scale: 1, opacity: i < goals ? 1 : 0.25 }} style={{ fontSize: 'clamp(24px, 4vmin, 36px)', filter: i < goals ? 'none' : 'grayscale(1)' }}>
            🏒
          </motion.span>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        <AnimatePresence mode="popLayout">
          {line.text && (
            <motion.div key={line.text} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: '100%' }}>
              <div style={PILL}>{line.text}</div>
              {line.say && (
                <div style={{ pointerEvents: 'auto' }}>
                  <SayButton text={line.say} size={56} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
}

/** The hint's hand: a drag from the puck toward where it should go (--dx, --dy). */
const HINT_CSS = `
.party-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 5; --dx: 120px; --dy: 0px; }
.party-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); }
.party-hint[data-kind="drag"] span { animation: party-drag 1.8s ease-in-out infinite; }
.party-hint[data-kind="press"] span { animation: party-press 1.2s ease-in-out infinite; }
@keyframes party-drag {
  0% { transform: translate(0, 0) scale(1.15); opacity: 0; }
  15% { transform: translate(0, 0) scale(1); opacity: 1; }
  75% { transform: translate(var(--dx), var(--dy)); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
}
@keyframes party-press {
  0%, 100% { transform: scale(1); }
  45% { transform: scale(0.82) translateY(6px); }
}
`

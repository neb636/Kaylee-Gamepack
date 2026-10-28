// Canada's finale in Ottawa: Animal Homes on the toy map (homes.ts), then Pond Hockey on the frozen Rideau Canal
// (rink.ts), then the big win and the shell's trophy (Place.tsx turns onDone into it: gold, KAYLEE, Canada Champion).
// The address bar follows her (sections.ts): the story, each animal she's taking home, each goal of the game. Sparkle
// asks and gives the instructions; Maple, the moose and the team react in their own voices (lines.ts, L.party). A short
// line at the bottom says what's on screen (for Dad) with a button to hear it again.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BigButton, SayButton, type Line } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type QAKey, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { CanadaActivityProps } from '../props'
import { HOMES_ANCHORS, HomesWorld, type HomesEvents } from './homes'
import { RINK_ANCHORS, RinkWorld, type RinkEvents } from './rink'
import PARTY, { GOALS, HOME_ANIMALS, HOMES_N, teamOf, type HomeAnimal, type PartySection } from './sections'

/** Read-only state for QA (one world at a time: the map, then the rink). */
const QA_KEY = '__canadaPartyQA' as QAKey

const EMOJI: Record<HomeAnimal, string> = { 'polar-bear': '🐻‍❄️', orca: '🐋', bison: '🦬', moose: '🫎', beaver: '🦫', loon: '🦆', grizzly: '🐻', 'spirit-bear': '🤍', puffin: '🐧' }
const ROUND: Line[] = [L.party.rink, L.party.geese, L.party.last]
const ROUND_ICON = ['🏒', '🪿', '🏆']

type Part = 'homes' | 'hockey'

export function Finale({ onDone, setProgress, stamps }: CanadaActivityProps) {
  const { start, param, enter } = useSections(PARTY)
  const [initial] = useState(() => {
    const section = (start ?? 'story') as PartySection
    const q = (HOME_ANIMALS as readonly string[]).includes(param('q')) ? (param('q') as HomeAnimal) : 'polar-bear'
    return { section, q, home: Math.max(0, Math.min(HOMES_N - 1, Math.floor(+param('home')) || 0)), score: Math.max(0, Math.min(GOALS - 1, Math.floor(+param('score')) || 0)), teamParam: param('team') }
  })
  const team = useState(() => teamOf(initial.teamParam, stamps))[0]
  const [part, setPart] = useState<Part>(initial.section === 'story' || initial.section === 'homes' ? 'homes' : 'hockey')
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [line, setLine] = useState<{ text: string; say: Line }>(() => (initial.section === 'story' ? { text: '🦫 Bonjour, Ottawa!', say: L.party.story } : { text: '', say: '' }))
  const [home, setHome] = useState(initial.section === 'hockey' || initial.section === 'win' ? HOMES_N : initial.home)
  const [goals, setGoals] = useState(initial.section === 'win' ? GOALS : initial.score)
  const [won, setWon] = useState(initial.section === 'win')
  const [fade, setFade] = useState(false)
  const homesRef = useRef<HomesWorld | null>(null)
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
    if (initial.section === 'story') enter('story')
    else if (initial.section === 'hockey') enter('hockey', { score: String(initial.score), ...teamState })
    else if (initial.section === 'win') enter('win', teamState)
  }, [])
  useEffect(() => setProgress(home + goals, HOMES_N + GOALS), [home, goals])

  const homesEvents = useRef<HomesEvents>({
    ask: (q, n) => {
      setHome(n)
      setLine({ text: `${EMOJI[q]} ${L.party.ask[q]}`, say: L.party.ask[q] })
      enter('homes', { q, home: String(n) })
    },
    right: (q, n) => {
      setHome(n)
      setLine({ text: `${EMOJI[q]} ${L.party.home[q]}`, say: L.party.home[q] })
    },
    wrong: (q) => setLine({ text: `${EMOJI[q]} ${L.party.ask[q]} ✨ ${L.party.glow}`, say: L.party.ask[q] }),
    done: () => {
      // Off to the canal: a snowy white fade, then the rink.
      setFade(true)
      setTimeout(() => {
        setPart('hockey')
        enter('hockey', { score: '0', ...teamState })
        setTimeout(() => setFade(false), 250)
      }, 650)
    },
  })
  const rinkEvents = useRef<RinkEvents>({
    round: (score) => {
      setGoals(score)
      setLine({ text: `${ROUND_ICON[score]} ${ROUND[score]}`, say: ROUND[score] })
      enter('hockey', { score: String(score), ...teamState })
    },
    goal: (score) => {
      setGoals(score)
      setLine({ text: '🎉 Goal!', say: L.party.goal[(score - 1) % L.party.goal.length] })
      if (score >= GOALS) {
        setWon(true)
        enter('win', teamState)
      }
    },
    saved: () => {},
    hint: () => setLine({ text: `👆 ${L.party.rinkHint}`, say: L.party.rinkHint }),
    win: finish,
  })
  useEffect(() => {
    if (won) setLine({ text: '🏆 Canada Champions!', say: L.party.win })
  }, [won])

  return (
    <div style={{ position: 'absolute', inset: 0, background: part === 'homes' ? '#DDEBFA' : '#D6E8F8', overflow: 'clip' }}>
      <style>{HINT_CSS}</style>
      {part === 'homes' ? (
        <View3D
          key={`homes-${engine}`}
          name="the map of Canada"
          qaKey={QA_KEY}
          worldRef={homesRef}
          onMode={setMode}
          make={(renderer) => {
            const w = new HomesWorld(renderer, { story: initial.section === 'story' && engine === 0, q: initial.q, home: initial.section === 'homes' ? initial.home : 0 }, homesEvents.current)
            w.setHintElement(hintRef.current)
            return w
          }}
          anchors={(input, els) => (
            <>
              <Anchors list={HOMES_ANCHORS} els={els} {...input} />
              <div ref={hintRef} className="party-hint" data-kind="drag" style={{ display: 'none' }}>
                <span>👆</span>
              </div>
            </>
          )}
        />
      ) : (
        <View3D
          key={`rink-${engine}`}
          name="the frozen canal"
          qaKey={QA_KEY}
          worldRef={rinkRef}
          onMode={setMode}
          make={(renderer) => {
            const w = new RinkWorld(renderer, { score: initial.section === 'hockey' ? initial.score : goals >= GOALS ? GOALS - 1 : goals, team, win: initial.section === 'win' && engine === 0 }, rinkEvents.current)
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
      )}
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
      {part === 'hockey' && (
        <div style={{ position: 'absolute', right: 16, top: 'calc(var(--top-clear) + 6px)', zIndex: 20, pointerEvents: 'none', display: 'flex', gap: 8, background: 'rgba(255,255,255,.94)', borderRadius: 999, padding: '8px 16px', boxShadow: 'var(--shadow)' }}>
          {Array.from({ length: GOALS }, (_, i) => (
            <motion.span key={`${i}-${i < goals}`} initial={{ scale: i < goals ? 1.8 : 1 }} animate={{ scale: 1, opacity: i < goals ? 1 : 0.25 }} style={{ fontSize: 'clamp(24px, 4vmin, 36px)', filter: i < goals ? 'none' : 'grayscale(1)' }}>
              🏒
            </motion.span>
          ))}
        </div>
      )}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {won && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={finish} ariaLabel="The trophy">
              🏆 ▶
            </BigButton>
          </motion.div>
        )}
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
      {/* Snowy white between the map and the canal. */}
      <AnimatePresence>{fade && <motion.div key="fade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ position: 'absolute', inset: 0, zIndex: 25, background: '#F4F8FE', pointerEvents: 'none' }} />}</AnimatePresence>
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

/** The hint's hand: a drag from the animal (or the puck) toward where it should go (--dx, --dy). */
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

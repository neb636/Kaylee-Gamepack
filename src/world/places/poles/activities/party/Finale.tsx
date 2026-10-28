// The Poles' finale: Pole to Pole, the postcard for Pebble, the Polar Quiz and the badge (party.ts is the world). The
// address bar follows her (sections.ts): the flight's leg, then each question with her stars. Six stars: the Polar
// Explorer badge, then the shell's trophy (onWin). Terry and Pebble say their own lines; Sparkle in the corner
// (kit/Guide) says how to steer, asks each question (🔊 by the stars to hear it again) and cheers or helps.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BigButton, bigCelebration, burst, pick, say, SayButton, type Line } from '../../../../../sdk'
import { Guide, type GuideHandle } from '../../../../kit/Guide'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { places } from '../../../../registry'
import { usePassport } from '../../../../stamps'
import { L } from '../../lines'
import { PARTY_ANCHORS, PartyWorld, type Leg, type PartyEvents } from './party'
import PARTY_SECTIONS, { QUESTIONS, type PartySection, type Question } from './sections'

/** The questions whose miss is said by the friend she put in the wrong place (the others, Sparkle). */
const FRIEND_MISS = new Set<Question>(['bear', 'penguin'])
/** Terry cheers every few fish (not every one: talk short, play long). */
const FISH_CHEER = 6
const STARS = 6

export function Finale({ onWin }: { onWin: () => void }) {
  const { start, param, enter } = useSections(PARTY_SECTIONS)
  const passport = usePassport()
  const [initial] = useState(() => ({
    section: (start ?? 'fly') as PartySection,
    leg: param('leg') as Leg,
    q: (QUESTIONS as readonly string[]).includes(param('q')) ? (param('q') as Question) : 'bear',
    stars: Math.max(0, Math.min(STARS - 1, Math.floor(+param('stars')) || 0)),
    visited: passport.visited.filter((id) => id !== 'poles'),
  }))
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [section, setSection] = useState<PartySection>(initial.section)
  const [fish, setFish] = useState(0)
  const [pin, setPin] = useState<{ id: string; n: number } | null>(null)
  const [q, setQ] = useState<Question | null>(null)
  const [stars, setStars] = useState(initial.section === 'badge' ? STARS : initial.stars)
  const [missed, setMissed] = useState(0)
  const worldRef = useRef<PartyWorld | null>(null)
  const legRef = useRef(initial.leg)
  const won = useRef(false)
  const pins = useRef(0)
  const guide = useRef<GuideHandle>(null)
  const asked = useRef(false)
  // A friend says it (their mouth moves on the rig), not Sparkle: no bubble in her corner.
  const friend = (l: Line, after = false) => say(l, { interrupt: !after })

  useEffect(() => {
    if (initial.section === 'fly') enter('fly', { leg: initial.leg })
    // Off he goes: how to steer first (her hands get busy at once), then Terry's line.
    const t = setTimeout(() => {
      if (initial.section !== 'fly') return
      guide.current?.speak(L.party.steer)
      if (initial.leg === 'north') void friend(L.party.setOff, true)
    }, 500)
    return () => clearTimeout(t)
  }, [])

  const win = () => {
    if (won.current) return
    won.current = true
    onWin()
  }

  const events = useRef<PartyEvents>({
    section: (s, state) => {
      setSection(s)
      enter(s, s === 'fly' ? { leg: legRef.current } : state)
      // The postcard: Terry hands it over, Pebble sees Pola's polar bear (the colony jumps back).
      if (s === 'deliver') void friend(L.party.delivery).then(() => friend(L.party.card, true))
    },
    leg: (l) => {
      legRef.current = l
      enter('fly', { leg: l })
      if (l !== 'north') void friend(L.party[l])
    },
    fish: (n) => {
      setFish(n)
      if (n % FISH_CHEER === 0) void friend(L.party.fish[(n / FISH_CHEER - 1) % L.party.fish.length])
    },
    pin: (id) => {
      const n = ++pins.current
      setPin({ id, n })
      setTimeout(() => setPin((p) => (p?.n === n ? null : p)), 2800)
      const hello = L.party.hello[id]
      if (hello) void friend(hello)
    },
    question: (qq) => {
      setQ(qq)
      setMissed(0)
      // The first question starts the quiz.
      if (!asked.current) guide.current?.speak(L.party.quiz)
      guide.current?.speak(L.party.ask[qq], !asked.current)
      asked.current = true
    },
    answer: (right) => {
      if (right) return guide.current?.speak(pick(L.party.right))
      setMissed((n) => n + 1)
      const qq = qRef.current
      if (!qq) return
      // Something silly, then where to look.
      if (FRIEND_MISS.has(qq)) {
        void friend(L.party.miss[qq])
        guide.current?.speak(L.party.glow, true)
      } else guide.current?.speak(L.party.miss[qq])
    },
    star: (n) => {
      setStars(n)
      burst()
    },
    badge: () => {
      setStars(STARS)
      setSection('badge')
      bigCelebration()
      guide.current?.speak(L.party.badge)
      setTimeout(win, 4500)
    },
  })

  const qRef = useRef(q)
  qRef.current = q
  const place = pin ? places.find((p) => p.meta.id === pin.id)?.meta : null
  // What she's stuck on, for Sparkle's hint.
  const hint: Line | null = section === 'fly' ? L.party.steerHint : section === 'quiz' && q ? (missed ? L.party.glow : L.party.ask[q]) : null

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#D3EEFF', overflow: 'clip' }}>
      <View3D
        key={engine}
        name="Pole to Pole"
        qaKey="__polesPartyQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new PartyWorld(renderer, initial, events.current)}
        anchors={(input, els) => <Anchors list={PARTY_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(211,238,255,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🐦 Tap to wake the sky
        </button>
      )}
      {/* The fish Terry caught, while he flies. */}
      {section === 'fly' && fish > 0 && (
        <motion.div key={fish} initial={{ scale: 1.4 }} animate={{ scale: 1 }} style={{ ...PILL, position: 'absolute', right: 16, top: 'calc(var(--top-clear) + 8px)', zIndex: 20 }}>
          🐟 {fish}
        </motion.div>
      )}
      {/* The Polar Explorer badge: one star per answer. */}
      {(section === 'quiz' || section === 'badge') && (
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1, scale: section === 'badge' ? 1.5 : 1 }}
          style={{ position: 'absolute', left: '50%', x: '-50%', top: section === 'badge' ? '38%' : 'calc(var(--top-clear) + 6px)', zIndex: 20, pointerEvents: 'none', display: 'flex', gap: 6, background: 'rgba(255,255,255,.94)', borderRadius: 999, padding: '8px 16px', boxShadow: 'var(--shadow)', transformOrigin: 'center' }}
        >
          {Array.from({ length: STARS }, (_, i) => (
            <motion.span key={i} animate={{ scale: i < stars ? [1.6, 1] : 1, opacity: i < stars ? 1 : 0.25 }} style={{ fontSize: 'clamp(24px, 4vmin, 36px)', filter: i < stars ? 'none' : 'grayscale(1)' }}>
              ⭐
            </motion.span>
          ))}
        </motion.div>
      )}
      {/* Hear the question again. */}
      {section === 'quiz' && q && (
        <div style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 16px)', top: 'calc(var(--top-clear) + 4px)', zIndex: 21 }}>
          <SayButton text={L.party.ask[q]} size={64} />
        </div>
      )}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {section === 'badge' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={win} ariaLabel="The trophy">
              🏆 ▶
            </BigButton>
          </motion.div>
        )}
        {/* The country Terry is flying over (for Dad; Terry says hello to it). */}
        <AnimatePresence>
          {section === 'fly' && place && pin && (
            <motion.div key={`pin-${pin.n}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
              {place.emoji} {place.name}!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Guide ref={guide} hint={hint} quiet={section === 'deliver' || section === 'badge'} />
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

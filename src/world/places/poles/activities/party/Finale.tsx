// The Poles' finale (greybox): Pole to Pole, the postcard for Pebble, the Polar Quiz and the badge (party.ts is the
// world). The address bar follows her (sections.ts): the flight's leg, then each question with her stars. Six stars:
// the Polar Explorer badge, then the shell's trophy (onWin). No voices yet (the full-loop gate): a short line at the
// bottom says what's on screen, for Dad.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BigButton, bigCelebration, burst } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { places } from '../../../../registry'
import { usePassport } from '../../../../stamps'
import { PARTY_ANCHORS, PartyWorld, type Leg, type PartyEvents } from './party'
import PARTY_SECTIONS, { QUESTIONS, type PartySection, type Question } from './sections'

const LEG: Record<Leg, string> = {
  north: '🐦 Fly Terry over the Arctic! Catch the fish',
  warm: '☀️ The warm middle of the world',
  south: '🌬️ The windy southern sea',
}
const ASK: Record<Question, string> = {
  bear: '🐻‍❄️ Where do polar bears live? Put Pola on the globe',
  penguin: '🐧 Where do penguins live? Put Pebble on the globe',
  south: '🧭 Spin the South Pole to the front!',
  north: '🧭 Spin the North Pole to the front!',
  ocean: '🌊 Which pole is ocean under the ice? Tap it',
  coldest: '🥶 Which pole is the coldest? Tap it',
  tern: '🐦 Who visits both poles? Tap them',
  summer: "☀️ It's summer up north. What is it down south?",
}
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
  const [leg, setLeg] = useState<Leg>(initial.leg)
  const [fish, setFish] = useState(0)
  const [pin, setPin] = useState<{ id: string; n: number } | null>(null)
  const [q, setQ] = useState<Question | null>(null)
  const [stars, setStars] = useState(initial.section === 'badge' ? STARS : initial.stars)
  const [missed, setMissed] = useState(0)
  const worldRef = useRef<PartyWorld | null>(null)
  const legRef = useRef(initial.leg)
  const won = useRef(false)
  const pins = useRef(0)

  useEffect(() => {
    if (initial.section === 'fly') enter('fly', { leg: initial.leg })
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
    },
    leg: (l) => {
      legRef.current = l
      setLeg(l)
      enter('fly', { leg: l })
    },
    fish: (n) => setFish(n),
    pin: (id) => {
      const n = ++pins.current
      setPin({ id, n })
      setTimeout(() => setPin((p) => (p?.n === n ? null : p)), 2800)
    },
    question: (qq) => {
      setQ(qq)
      setMissed(0)
    },
    answer: (right) => !right && setMissed((n) => n + 1),
    star: (n) => {
      setStars(n)
      burst()
    },
    badge: () => {
      setStars(STARS)
      setSection('badge')
      bigCelebration()
      setTimeout(win, 4500)
    },
  })

  const place = pin ? places.find((p) => p.meta.id === pin.id)?.meta : null

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
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {section === 'badge' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={win} ariaLabel="The trophy">
              🏆 ▶
            </BigButton>
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          {section === 'fly' && place && pin ? (
            <motion.div key={`pin-${pin.n}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
              {place.emoji} {place.name}!
            </motion.div>
          ) : (
            <motion.div key={`${section}-${leg}-${q}-${missed > 0}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
              {section === 'fly'
                ? LEG[leg]
                : section === 'deliver'
                  ? '💌 Terry brings Pebble the postcard'
                  : section === 'badge'
                    ? '🏅 Polar Explorer!'
                    : q
                      ? `${ASK[q]}${missed ? ' (look for the glow!)' : ''}`
                      : ''}
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

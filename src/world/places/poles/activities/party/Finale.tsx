// The Poles' finale, the end of "Pebble's Long Way Home": one component that runs its phases in order.
//   film home-in      the balloon lifts off (only when the finale opens with no section in its link)
//   fly               the flight home on the globe: Terry leads, the balloon follows (party.ts)
//   film home-land    Antarctica; the penguins meet a polar bear; every papa has his own song
//   song              Papa's song: find each chick's papa by his tune (song.ts)
//   film home-reunion Papa and Pebble, the southern lights, and Terry's quiz is announced
//   quiz, badge       Terry's Polar Explorer quiz on the globe (party.ts), then the shell's trophy (onWin)
// The address bar follows her (sections.ts): the flight's leg, the song's round, each question with her stars. A
// section link opens straight at that section, with no film before it. The friends say their own lines (Terry asks
// the quiz); Sparkle in the corner (kit/Guide) says how to do each thing, and helps when she's stuck.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { onDevice } from '../../../../../sdk/device'
import { BigButton, bigCelebration, burst, pick, say, SayButton, useAlive, type Line, useTimers } from '../../../../../sdk'
import { afterTalk, Guide, type GuideHandle } from '../../../../kit/Guide'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { places } from '../../../../registry'
import { usePassport } from '../../../../stamps'
import { L } from '../../lines'
import { filmSeen, seeFilm } from '../../story/chapters'
import { StoryFilm } from '../../story/StoryFilm'
import type { FilmId } from '../story/sections'
import { KIND, PARTY_ANCHORS, PartyWorld, type GlobeSection, type Leg, type PartyEvents, type PartyStart } from './party'
import PARTY_SECTIONS, { QUESTIONS, type PartySection, type Question } from './sections'
import { SONG_ANCHORS, SongWorld, type SongEvents, type SongStart } from './song'

/** The questions whose miss is said by the friend she put in the wrong place (the others, Terry). */
const FRIEND_MISS = new Set<Question>(['bear', 'penguin'])
/** Terry cheers every few fish (not every one: talk short, play long). */
const FISH_CHEER = 6
const STARS = 4

type Enter = (id: PartySection, state?: Partial<Record<'leg' | 'round' | 'q' | 'stars', string>>) => void
type Step = { kind: 'film'; id: FilmId } | { kind: 'globe'; start: PartyStart } | { kind: 'song'; round: number }

// A friend says it (their mouth moves on their own face), not Sparkle: no bubble in her corner.
const friend = (l: Line, after = false) => say(l, { interrupt: !after })

export function Finale({ onWin }: { onWin: () => void }) {
  const { start, param, enter } = useSections(PARTY_SECTIONS)
  const passport = usePassport()
  const [visited] = useState(() => passport.visited.filter((id) => id !== 'poles'))
  const globe = (section: GlobeSection, leg: Leg = 'north', q: Question = 'bear', stars = 0): Step => ({ kind: 'globe', start: { section, leg, q, stars, visited } })
  const [step, setStep] = useState<Step>(() => {
    if (start === 'song') return { kind: 'song', round: +param('round') }
    if (start) return globe(start, param('leg') as Leg, (QUESTIONS as readonly string[]).includes(param('q')) ? (param('q') as Question) : 'bear', Math.max(0, Math.min(STARS - 1, Math.floor(+param('stars')) || 0)))
    // (She may have just watched it from its own link, or from the globe.)
    return filmSeen('home-in') ? globe('fly') : { kind: 'film', id: 'home-in' }
  })

  if (step.kind === 'film')
    return (
      <StoryFilm
        key={step.id}
        id={step.id}
        onDone={() => {
          seeFilm(step.id)
          setStep(step.id === 'home-in' ? globe('fly') : step.id === 'home-land' ? { kind: 'song', round: 1 } : globe('quiz'))
        }}
      />
    )
  if (step.kind === 'song') return <Song round={step.round} enter={enter} onDone={() => setStep({ kind: 'film', id: 'home-reunion' })} />
  return <Globe key={step.start.section === 'fly' ? 'fly' : 'quiz'} start={step.start} enter={enter} onLanded={() => setStep({ kind: 'film', id: 'home-land' })} onWin={onWin} />
}

// ---------------------------------------------------------------- the globe: the flight home, and Terry's quiz

function Globe({ start, enter, onLanded, onWin }: { start: PartyStart; enter: Enter; onLanded: () => void; onWin: () => void }) {
  const timers = useTimers()
  const restart = useRef<PartyStart>(start)
  const alive = useAlive()
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [section, setSection] = useState<GlobeSection>(start.section)
  const [fish, setFish] = useState(0)
  const [pin, setPin] = useState<{ id: string; n: number } | null>(null)
  const [q, setQ] = useState<Question | null>(null)
  const [stars, setStars] = useState(start.section === 'badge' ? STARS : start.stars)
  const [missed, setMissed] = useState(0)
  const worldRef = useRef<PartyWorld | null>(null)
  const legRef = useRef(start.leg)
  const won = useRef(false)
  const pins = useRef(0)
  const pokes = useRef(0)
  const guide = useRef<GuideHandle>(null)
  const asked = useRef(false)

  useEffect(() => {
    if (start.section !== 'fly') return
    enter('fly', { leg: start.leg })
    // Off they go: how to steer first (her hands get busy at once), then Terry calls back to the balloon.
    const t = timers.later(() => {
      guide.current?.speak(L.party.steer)
      if (start.leg === 'north') void friend(L.party.setOff, true)
    }, 500)
    return () => clearTimeout(t)
  }, [])

  const win = () => {
    if (!alive() || won.current) return
    won.current = true
    onWin()
  }

  // The badge owns its timer: leaving it or losing the GPU cancels the transition.
  useEffect(() => {
    if (section !== 'badge' || mode !== 'webgl') return
    const timer = timers.later(win, 4500)
    return () => clearTimeout(timer)
  }, [section, mode])

  const events = useRef<PartyEvents>({
    section: (s, state) => {
      setSection(s)
      enter(s, s === 'fly' ? { leg: legRef.current } : state)
    },
    leg: (l) => {
      legRef.current = l
      enter('fly', { leg: l })
      // The journey's lesson, as it happens to the friends: Pola melts in the warm middle; Pebble smells home.
      if (l === 'warm') {
        void friend(L.party.warm)
        guide.current?.once('warm', L.party.warmFact, true)
      } else if (l === 'south') void friend(L.party.south)
    },
    sight: (what) => {
      if (what === 'balloon') void friend(L.party.balloon[pokes.current++ % L.party.balloon.length])
      else void friend(L.party[what], true)
    },
    landed: () => {
      // (Whoever is talking finishes; then the film of the landing.)
      afterTalk(() => alive() && onLanded(), 4000)
    },
    fish: (n) => {
      setFish(n)
      if (n % FISH_CHEER === 0) void friend(L.party.fish[(n / FISH_CHEER - 1) % L.party.fish.length])
    },
    pin: (id) => {
      const n = ++pins.current
      setPin({ id, n })
      timers.later(() => setPin((p) => (p?.n === n ? null : p)), 2800)
      const hello = L.party.hello[id]
      if (hello) void friend(hello)
    },
    question: (qq, n) => {
      setStars(n)
      setQ(qq)
      setMissed(0)
      // Terry asks (the first question starts his quiz); Sparkle says how, the first time each way comes up.
      if (!asked.current) void friend(L.party.quiz, true)
      asked.current = true
      void friend(L.party.ask[qq], true)
      guide.current?.once(`how-${KIND[qq]}`, L.party.how[KIND[qq]], true)
    },
    answer: (right) => {
      const qq = qRef.current
      if (!qq) return
      // Right: Pola waves from her sea ice (the story's last step), or Terry cheers.
      if (right) return void friend(qq === 'bear' ? L.party.home : pick(L.party.right))
      setMissed((n) => n + 1)
      // Something silly, then where to look.
      void friend(L.party.miss[qq])
      if (FRIEND_MISS.has(qq)) guide.current?.speak(L.party.glow, true)
    },
    star: (n) => {
      setStars(n)
      burst()
    },
    badge: () => {
      setStars(STARS)
      setSection('badge')
      bigCelebration()
      void friend(L.party.badge, true)
    },
  })

  const qRef = useRef(q)
  qRef.current = q
  const place = pin ? places.find((p) => p.meta.id === pin.id)?.meta : null
  // What she's stuck on, for Sparkle's hint.
  const hint: Line | null = section === 'fly' ? L.party.steerHint : section === 'quiz' && q ? (missed ? L.party.glow : L.party.how[KIND[q]]) : null

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#D3EEFF', overflow: 'clip' }}>
      <View3D
        key={engine}
        name="The way home"
        qaKey="__polesPartyQA"
        worldRef={worldRef}
        onMode={(next) => {
          if (next === 'lost' && worldRef.current) restart.current = worldRef.current.checkpoint()
          setMode(next)
        }}
        make={(renderer) => new PartyWorld(renderer, restart.current, events.current)}
        anchors={(input, els) => <Anchors list={PARTY_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <Wake
          onClick={() => {
            setSection(restart.current.section)
            setFish(restart.current.fish ?? 0)
            setStars(restart.current.stars)
            setPin(null)
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
        />
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
          style={{ position: 'absolute', left: '50%', x: '-50%', top: section === 'badge' ? '34%' : 'calc(var(--bar-clear) - 8px)', zIndex: 20, pointerEvents: 'none', display: 'flex', gap: 6, background: 'rgba(255,255,255,.94)', borderRadius: 999, padding: '8px 16px', boxShadow: 'var(--shadow)', transformOrigin: 'center' }}
        >
          {Array.from({ length: STARS }, (_, i) => (
            <motion.span key={i} animate={{ scale: i < stars ? [1.6, 1] : 1, opacity: i < stars ? 1 : 0.25 }} style={{ fontSize: 'clamp(24px, 4vmin, 36px)', filter: i < stars ? 'none' : 'grayscale(1)' }}>
              ⭐
            </motion.span>
          ))}
        </motion.div>
      )}
      {/* On to the trophy: under the badge, clear of Sparkle's line at the bottom. */}
      {section === 'badge' && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: 'spring' }} style={{ position: 'absolute', left: '50%', x: '-50%', top: '52%', zIndex: 21 }}>
          <BigButton onClick={win} ariaLabel="The trophy">
            🏆 ▶
          </BigButton>
        </motion.div>
      )}
      {/* Hear Terry's question again. */}
      {section === 'quiz' && q && (
        <div style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 16px)', top: 'calc(var(--bar-clear) - 10px)', zIndex: 21 }}>
          <SayButton text={L.party.ask[q]} size={64} />
        </div>
      )}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {/* The country Terry is flying over (for the grown-up beside her; Terry says hello to it). */}
        <AnimatePresence>
          {section === 'fly' && place && pin && (
            <motion.div key={`pin-${pin.n}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
              {place.emoji} {place.name}!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Guide ref={guide} hint={hint} quiet={section === 'badge'} />
    </div>
  )
}

// ---------------------------------------------------------------- Papa's song

function Song({ round, enter, onDone }: { round: number; enter: Enter; onDone: () => void }) {
  const timers = useTimers()
  const restart = useRef<SongStart>({ round })
  const alive = useAlive()
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [over, setOver] = useState(false)
  const worldRef = useRef<SongWorld | null>(null)
  const guide = useRef<GuideHandle>(null)
  const polaSays = useRef(0)

  const events = useRef<SongEvents>({
    round: (n) => {
      enter('song', { round: String(n) })
      // The chick asks, then hums. In the snowstorm Sparkle says the one new thing first.
      if (n === 1) void friend(L.party.song.ask)
      else if (n === 2) void friend(L.party.song.more)
      else {
        guide.current?.speak(L.party.song.storm)
        void friend(L.party.song.last, true)
      }
    },
    listen: (n) => {
      if (n === 1) guide.current?.speak(L.party.song.how, true)
      else if (n === 2) guide.current?.speak(L.party.song.moreHow, true)
    },
    miss: (kind, misses) => {
      if (kind === 'neighbor') void friend(L.party.song.neighbor)
      if (misses === 2) guide.current?.speak(L.party.song.glow, true)
    },
    found: (n) => {
      burst()
      if (n === 1) void friend(L.party.song.found).then(() => friend(L.party.song.papa, true))
      else void friend(L.party.song.thanks[(n - 2) % L.party.song.thanks.length])
    },
    poke: (what) => {
      if (what === 'pola') void friend(L.party.song.pola[polaSays.current++ % L.party.song.pola.length], true)
      else if (what === 'colony') guide.current?.once('colony', L.party.song.colonyFact, true)
      else if (what === 'pair') guide.current?.once('song', L.party.song.songFact, true)
    },
    done: () => {
      setOver(true)
      bigCelebration()
      guide.current?.speak(L.party.song.done, true)
      // The cheer and Sparkle's line, then the film of the reunion.
      timers.later(() => afterTalk(() => alive() && onDone(), 5000), 1800)
    },
  })

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#DCEBFF', overflow: 'clip' }}>
      <View3D
        key={engine}
        name="Papa's song"
        qaKey="__polesPartyQA"
        worldRef={worldRef}
        onMode={(next) => {
          if (next === 'lost' && worldRef.current) restart.current = worldRef.current.checkpoint()
          setMode(next)
        }}
        make={(renderer) => new SongWorld(renderer, restart.current, events.current)}
        anchors={(input, els) => <Anchors list={SONG_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <Wake
          onClick={() => {
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
        />
      )}
      <Guide ref={guide} hint={over ? null : L.party.song.hint} quiet={over} />
    </div>
  )
}

/** The picture was lost (the iPad took the GPU back): a tap brings it back where she was. */
function Wake({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(211,238,255,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}>
      🐦 {onDevice('Tap to wake the sky', 'Click to wake the sky')}
    </button>
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

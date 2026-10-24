// The boat trip without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the same trip as a picture
// book, so she can always finish it and get the stamp. One big page at a time:
//   invite   Mommy asks (👍)
//   pack     her things as big buttons, the suitcase fills up; ✅ closes it
//   goodbye, airport, takeoff, fly, land, sunset   one picture each, one tap on ▶ to go on
//   pier ... hong   the stops as cards (the village, the hong, the boat race, the Nail Island): tap one to visit it and
//            hear its fact; the race opens its page, the Nail Island the photo
//   race     three boats race across the water when she taps ▶ (hers wins by a nose), then the podium: her trophy
//   nail     the photo as a drawn card: tap 📸 (flash!), then ▶
//   feed     Baan Chang's elephants: tap 🍌 or 🎋 and an elephant munches it (greybox)
//   home     Agong: tap the photo and it's his ("Beautiful! Thank you, Kaylee!"), the cousins look up, then the stamp
// Sparkle stands above each page (not the packing page, which needs the room) and waves as it turns; tap her to hop.
// Every section link lands on its page. Voices are the trip's own clips (lines.ts).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { bigCelebration, say, sounds, SparklePuppet, Trophy, type Line, type PuppetHandle } from '../../../../../sdk'
import { art } from '../../art'
import { L } from '../../lines'
import { sfx } from '../../sfx'
import { ITEMS } from '../../trip/packing'
import { RACE_TROPHY } from './race/RaceLayer'
import type { BoatSection } from './sections'

interface Props {
  section: BoatSection
  packed: string[]
  onPacked: (ids: string[]) => void
  onSection: (s: BoatSection) => void
  onDone: () => void
}

/** The legs on the way there and back: a picture and what comes next. */
const LEGS: Partial<Record<BoatSection, { scene: string; bg: string; next: BoatSection; line?: Line }>> = {
  goodbye: { scene: '🏠 👋 🚐', bg: 'linear-gradient(#FFD9C4, #FFF1E2)', next: 'airport', line: L.trip.goodbye.van },
  airport: { scene: '🧳 ➡️ 🛄', bg: 'linear-gradient(#E3DAFF, #FFF7F0)', next: 'takeoff', line: L.trip.airport.laugh },
  takeoff: { scene: '💺 🛫', bg: 'linear-gradient(#A8DCFF, #E4F3FC)', next: 'fly', line: L.trip.plane.wheee },
  fly: { scene: '☁️ ✈️ 🐘', bg: 'linear-gradient(#8FCBFF, #BDE3FF)', next: 'land', line: L.trip.elephant },
  land: { scene: '🛬 🌴 🛻', bg: 'linear-gradient(#BDE3FF, #8FE3C8)', next: 'pier', line: L.trip.plane.krabi },
  sunset: { scene: '🌅 🚤 🐬', bg: 'linear-gradient(#A98FE8, #FF9DC0 55%, #FFC98F)', next: 'home', line: L.bay.sunset },
}
const STOPS: { id: 'village' | 'hong' | 'nail'; icon: string; bg: string; fact: Line }[] = [
  { id: 'village', icon: '🏘️⚽', bg: '#FFD27A', fact: L.bay.facts.football },
  { id: 'hong', icon: '🛶', bg: '#8FE3C8', fact: L.bay.facts.hong },
  { id: 'nail', icon: '🏝️📸', bg: '#A8DCFF', fact: L.bay.facts.nail },
]

export function Flat({ section, packed, onPacked, onSection, onDone }: Props) {
  // (A quick second tap lands on the page that's leaving: it doesn't skip a leg.)
  const turned = useRef(0)
  const sparkle = useRef<PuppetHandle>(null)
  // The stops she has visited keep their ✅ from page to page (a link to one counts it).
  const [seen, setSeen] = useState<string[]>(() => (section === 'village' ? ['village'] : section === 'hong' || section === 'cave' ? ['hong'] : []))
  useEffect(() => void sparkle.current?.play('wave'), [section])
  const go = (s: BoatSection) => {
    if (performance.now() - turned.current < 700) return
    turned.current = performance.now()
    sfx.boing()
    onSection(s)
  }
  const page = (() => {
    if (section === 'invite') return <Invite onYes={() => go('pack')} />
    if (section === 'pack') return <Pack packed={packed} onPacked={onPacked} onClose={() => go('goodbye')} />
    if (section === 'nail') return <Photo onNext={() => go('sunset')} />
    if (section === 'home') return <Home onDone={onDone} />
    if (section === 'feed') return <Feed />
    if (section === 'race') return <RaceDay onWin={() => onSection('podium')} />
    if (section === 'podium') return <PodiumPage onNext={() => go('bay')} />
    const leg = LEGS[section]
    if (leg) return <Leg key={section} {...leg} onNext={() => go(leg.next)} />
    return (
      <Stops
        key={section}
        seen={seen}
        onNail={() => go('nail')}
        onRace={() => go('race')}
        onVisit={(id) => {
          setSeen((v) => (v.includes(id) ? v : [...v, id]))
          onSection(id === 'hong' ? 'hong' : 'village')
        }}
      />
    )
  })()
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#A8DCFF 50%, #6FCDB9 50%)', padding: 'var(--top-clear) 16px calc(var(--safe-bottom) + 16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'safe center', gap: 'clamp(10px, 2.4vh, 24px)', overflow: 'auto' }}>
      {section !== 'pack' && (
        <button aria-label="Sparkle" onClick={() => void sparkle.current?.play('hop')} style={{ flexShrink: 0, background: 'none', border: 'none', padding: 0, height: 'clamp(0px, calc(100vh - 640px), 240px)' }}>
          <SparklePuppet ref={sparkle} height="100%" lookToward={0.3} />
        </button>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={section} initial={{ x: 60, opacity: 0, rotate: 2 }} animate={{ x: 0, opacity: 1, rotate: 0 }} exit={{ x: -60, opacity: 0, rotate: -2 }} style={{ width: 'min(900px, 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(10px, 2.4vh, 24px)' }}>
          {page}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const card = { background: '#FFF7F0', borderRadius: 28, border: '6px solid #fff', boxShadow: 'var(--shadow)' }

function Big({ label, onClick, children, color = 'var(--hotpink)', disabled }: { label: string; onClick: () => void; children: ReactNode; color?: string; disabled?: boolean }) {
  return (
    <motion.button
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      animate={disabled ? { scale: 1 } : { scale: [1, 1.06, 1] }}
      transition={{ repeat: disabled ? 0 : Infinity, duration: 1.4 }}
      onClick={onClick}
      disabled={disabled}
      style={{ minWidth: 120, minHeight: 96, padding: '0 28px', borderRadius: 999, border: '5px solid #fff', background: color, color: '#fff', fontSize: 'clamp(40px, 7vmin, 56px)', boxShadow: 'var(--shadow)', opacity: disabled ? 0.45 : 1 }}
    >
      {children}
    </motion.button>
  )
}

function Invite({ onYes }: { onYes: () => void }) {
  useEffect(() => void say(L.trip.ask.question), [])
  return (
    <>
      <div style={{ ...card, padding: 'clamp(16px, 3vmin, 28px)', fontSize: 'clamp(70px, 16vmin, 150px)', lineHeight: 1 }} aria-hidden>
        🦄🧳
      </div>
      <Big label="Yes" onClick={onYes} color="var(--mint)">
        👍🧳
      </Big>
    </>
  )
}

function Pack({ packed, onPacked, onClose }: { packed: string[]; onPacked: (ids: string[]) => void; onClose: () => void }) {
  useEffect(() => void say(L.trip.pack.start), [])
  const toggle = (id: string) => {
    sfx.boing()
    onPacked(packed.includes(id) ? packed.filter((x) => x !== id) : [...packed, id])
  }
  return (
    <>
      {/* The suitcase, filling up. */}
      <div aria-label="Suitcase" style={{ ...card, background: '#FF8FB8', minWidth: 'min(520px, 100%)', minHeight: 'clamp(64px, 13vh, 110px)', padding: 'clamp(6px, 1.4vh, 14px)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(34px, 6vmin, 50px)' }}>
        <span aria-hidden>🧳</span>
        {packed.map((id) => (
          <motion.span key={id} initial={{ scale: 0, y: -40 }} animate={{ scale: 1, y: 0 }} aria-hidden>
            {ITEMS.find((i) => i.id === id)?.icon}
          </motion.span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10, width: '100%' }}>
        {ITEMS.map((it) => {
          const inside = packed.includes(it.id)
          return (
            <motion.button key={it.id} aria-label={it.label} aria-pressed={inside} whileTap={{ scale: 0.9 }} onClick={() => toggle(it.id)} style={{ minHeight: 'clamp(64px, 9vh, 96px)', borderRadius: 24, border: `5px solid ${inside ? 'var(--hotpink)' : '#fff'}`, background: inside ? '#FFE3EE' : '#fff', fontSize: 'clamp(32px, 7vh, 44px)', boxShadow: 'var(--shadow)', opacity: inside ? 0.6 : 1 }}>
              {it.icon}
            </motion.button>
          )
        })}
      </div>
      <Big label="Close the suitcase" onClick={onClose} disabled={packed.length < 3}>
        ✅🧳
      </Big>
    </>
  )
}

/** Baan Chang's yard: tap a food and it flies to an elephant, who munches it and gets a little rounder. */
function Feed() {
  const [full, setFull] = useState([0, 0])
  const [bite, setBite] = useState<{ who: number; food: string; key: number } | null>(null)
  const give = (food: string) => {
    if (bite) return
    // The one who has eaten less gets it (the little one, if it's a tie).
    const who = full[1] <= full[0] ? 1 : 0
    sounds.pop()
    setBite({ who, food, key: performance.now() })
    setTimeout(() => {
      if (food === '🎋') sfx.crunch()
      else sfx.munch()
      if (who === 1) sfx.squeal()
      else sfx.rumble()
      setFull((f) => f.map((n, i) => (i === who ? n + 1 : n)))
      setBite(null)
    }, 600)
  }
  return (
    <>
      <div style={{ ...card, background: 'linear-gradient(#BFE6FF 55%, #CFCAD8 55%)', width: 'min(640px, 100%)', padding: 'clamp(16px, 4vmin, 40px) 16px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 'clamp(16px, 5vw, 48px)', position: 'relative' }}>
        {[0, 1].map((i) => (
          <motion.button
            key={i}
            aria-label={i ? 'Khanom the baby elephant' : 'Mali the elephant'}
            animate={{ scale: (i ? 0.62 : 1) * (1 + Math.min(full[i], 10) * 0.03), y: bite?.who === i ? [0, -10, 0] : 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => (i ? sfx.squeal() : sfx.trumpet())}
            style={{ background: 'none', border: 'none', padding: 0, fontSize: 'clamp(90px, 20vmin, 170px)', lineHeight: 1, transform: 'scaleX(-1)' }}
          >
            🐘
          </motion.button>
        ))}
        <AnimatePresence>
          {bite && (
            <motion.div key={bite.key} aria-hidden initial={{ y: 120, x: 0, opacity: 1, scale: 1.2 }} animate={{ y: -40, x: bite.who ? 70 : -70, opacity: 0.2, scale: 0.6 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', bottom: 0, fontSize: 56 }}>
              {bite.food}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 28px)' }}>
        {[
          ['🍌', 'Banana'],
          ['🎋', 'Sugarcane'],
        ].map(([food, label]) => (
          <Big key={food} label={label} onClick={() => give(food)} color="var(--butter)">
            {food}
          </Big>
        ))}
      </div>
    </>
  )
}

function Leg({ scene, bg, line, onNext }: { scene: string; bg: string; line?: Line; onNext: () => void }) {
  useEffect(() => {
    if (line) void say(line)
  }, [])
  return (
    <>
      <motion.div aria-hidden animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.4 }} style={{ ...card, background: bg, width: 'min(640px, 100%)', padding: 'clamp(24px, 6vmin, 60px) 16px', textAlign: 'center', fontSize: 'clamp(60px, 13vmin, 130px)', lineHeight: 1 }}>
        {scene}
      </motion.div>
      <Big label="Next" onClick={onNext}>
        ▶
      </Big>
    </>
  )
}

function Stops({ seen, onVisit, onNail, onRace }: { seen: string[]; onVisit: (id: 'village' | 'hong') => void; onNail: () => void; onRace: () => void }) {
  useEffect(() => void say(L.bay.whereTo), [])
  return (
    <>
      <div aria-hidden style={{ fontSize: 'clamp(50px, 10vmin, 90px)' }}>
        🚤
      </div>
      <div style={{ display: 'flex', gap: 'clamp(10px, 2.5vw, 24px)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <motion.button
          aria-label="The boat race"
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            sounds.pop()
            onRace()
          }}
          style={{ ...card, background: '#FFB3CF', width: 'max(110px, min(28vw, 30vh, 260px))', aspectRatio: '3 / 4', fontSize: 'clamp(44px, 8vmin, 72px)' }}
        >
          🏁🏆
        </motion.button>
        {STOPS.map((s) => {
          const done = seen.includes(s.id)
          return (
            <motion.button
              key={s.id}
              aria-label={s.id === 'nail' ? 'The Nail Island' : s.id === 'hong' ? 'The hong' : 'The village'}
              whileTap={{ scale: 0.92 }}
              animate={done ? { rotateY: [0, 180, 360] } : { rotateY: 0 }}
              transition={{ duration: 0.6 }}
              onClick={() => {
                sounds.pop()
                void say(s.fact)
                if (s.id === 'nail') return setTimeout(onNail, 600)
                onVisit(s.id)
              }}
              style={{ ...card, background: s.bg, width: 'max(110px, min(28vw, 30vh, 260px))', aspectRatio: '3 / 4', fontSize: 'clamp(44px, 8vmin, 72px)', position: 'relative' }}
            >
              {s.icon}
              {s.id === 'hong' && <img src={art.crab} alt="" style={{ width: '0.9em', verticalAlign: 'middle' }} />}
              {done && <span style={{ position: 'absolute', right: 10, top: 8, fontSize: 32 }}>✅</span>}
            </motion.button>
          )
        })}
      </div>
    </>
  )
}

/** The photo, drawn: the Nail Island standing in the sea behind the three of them. */
function DrawnPhoto({ small }: { small?: boolean }) {
  return (
    <div aria-hidden style={{ width: small ? 'min(220px, 40vw)' : 'min(460px, 80vw)', padding: '10px 10px 30px', background: '#fff', borderRadius: 6, boxShadow: '0 8px 22px rgba(43,35,48,.3)' }}>
      <svg viewBox="0 0 160 120" style={{ display: 'block', width: '100%', borderRadius: 3 }}>
        <rect width="160" height="78" fill="#A8DCFF" />
        <rect y="72" width="160" height="48" fill="#5FC7B4" />
        <path d="M0 96 Q 80 86 160 96 L160 120 L0 120 Z" fill="#FFE7C2" />
        {/* Khao Phing Kan's cliffs and Ko Tapu, the nail. */}
        <path d="M14 76 Q 18 30 34 26 Q 44 40 46 76 Z" fill="#C9C1D9" stroke="#2B2330" strokeWidth="1.5" />
        <path d="M98 76 L100 44 Q 104 30 112 32 Q 118 36 116 44 L112 76 Z" fill="#C9C1D9" stroke="#2B2330" strokeWidth="1.5" />
        <ellipse cx="108" cy="32" rx="9" ry="4" fill="#6FBF7F" stroke="#2B2330" strokeWidth="1.2" />
        <text x="48" y="112" fontSize="26">🦄🦄🦄</text>
      </svg>
    </div>
  )
}

function Photo({ onNext }: { onNext: () => void }) {
  const [taken, setTaken] = useState(false)
  useEffect(() => void say(L.bay.pose), [])
  return (
    <>
      <div style={{ position: 'relative' }}>
        <DrawnPhoto />
        <AnimatePresence>{taken && <motion.div key="flash" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: 6 }} />}</AnimatePresence>
      </div>
      {taken ? (
        <Big label="Next" onClick={onNext}>
          ▶
        </Big>
      ) : (
        <Big
          label="Take the photo"
          color="var(--butter)"
          onClick={() => {
            sfx.shutter()
            void say(L.bay.cheese)
            setTaken(true)
          }}
        >
          📸
        </Big>
      )}
    </>
  )
}

function Home({ onDone }: { onDone: () => void }) {
  const [given, setGiven] = useState(false)
  useEffect(() => void say(L.home.agong), [])
  return (
    <>
      <motion.div aria-hidden animate={given ? { y: [0, -24, 0] } : { y: 0 }} transition={{ repeat: given ? 2 : 0, duration: 0.5 }} style={{ ...card, padding: '12px 24px', fontSize: 'clamp(60px, 12vmin, 110px)', lineHeight: 1.1, textAlign: 'center' }}>
        🐼
        <div style={{ fontSize: '0.55em' }}>{given ? '🦊📱⬇️ 🦊📱⬇️ 🐃📱⬇️' : '🦊📱 🦊📱 🐃📱'}</div>
      </motion.div>
      <motion.button
        aria-label="Give Agong the photo"
        disabled={given}
        animate={given ? { y: -60, scale: 0.6, opacity: 0 } : { scale: [1, 1.05, 1] }}
        transition={given ? { duration: 0.7 } : { repeat: Infinity, duration: 1.4 }}
        onClick={() => {
          sounds.correct()
          setGiven(true)
          void say(L.home.thanks).then(() => say(L.home.gan)).then(() => setTimeout(onDone, 600))
        }}
        style={{ background: 'none', border: 'none', padding: 0, minHeight: 88 }}
      >
        <DrawnPhoto small />
      </motion.button>
    </>
  )
}

/** The boat race as a picture: three boats on the water; ▶ and off they go, hers just ahead at the line. */
function RaceDay({ onWin }: { onWin: () => void }) {
  const [racing, setRacing] = useState(false)
  useEffect(() => void say(L.race.start), [])
  const lane = (icon: string, color: string, to: string, delay: number) => (
    <div style={{ position: 'relative', height: 'clamp(56px, 9vh, 80px)', borderBottom: '3px dashed rgba(255,255,255,.7)' }}>
      <motion.div aria-hidden initial={{ left: '0%' }} animate={racing ? { left: to } : { left: '0%' }} transition={{ duration: 3, delay, ease: 'easeInOut' }} style={{ position: 'absolute', top: '8%', fontSize: 'clamp(40px, 7vh, 60px)', display: 'flex', alignItems: 'center' }}>
        <span style={{ background: color, borderRadius: '50%', padding: 4, fontSize: '0.6em' }}>{icon}</span>🚤
      </motion.div>
    </div>
  )
  return (
    <>
      <div style={{ ...card, background: 'linear-gradient(#78D4C1, #5FC7B4)', width: 'min(720px, 100%)', padding: '12px 16px', position: 'relative' }}>
        <div aria-hidden style={{ position: 'absolute', right: 18, top: 0, bottom: 0, width: 20, background: 'repeating-conic-gradient(#2B2330 0% 25%, #FFFFFF 0% 50%) 0 0 / 20px 20px' }} />
        {lane('🐃', '#7FB2E8', '74%', 0)}
        {lane('🦄', '#FF8FB8', '80%', 0)}
        {lane('🐒', '#F2C24C', '66%', 0.1)}
      </div>
      <Big
        label="Race!"
        disabled={racing}
        onClick={() => {
          setRacing(true)
          sfx.vroom()
          void say(L.race.count[3])
          setTimeout(() => {
            sounds.fanfare()
            bigCelebration()
            void say(L.race.win)
            setTimeout(onWin, 1600)
          }, 3200)
        }}
      >
        🏁 ▶
      </Big>
    </>
  )
}

/** The podium page: her trophy with KAYLEE on it, then on to the other stops. */
function PodiumPage({ onNext }: { onNext: () => void }) {
  useEffect(() => void say(L.race.trophy), [])
  return (
    <>
      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.5 }}>
        <Trophy title={RACE_TROPHY} size={Math.min(240, window.innerHeight * 0.32)} />
      </motion.div>
      <div aria-hidden style={{ fontSize: 'clamp(40px, 8vmin, 64px)' }}>🐃🥈 🦄🥇 🐒🥉</div>
      <Big label="Next" onClick={onNext}>
        ▶
      </Big>
    </>
  )
}

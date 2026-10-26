// The mall day's trip loop without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the same legs as a
// picture book, so she can always get to HarborLand and home to the stamp. One big page at a time:
//   invite   Mommy's card: 🚤, 🛝🍕 or ✋⏳
//   goodbye  the family at the shutter as big buttons (tap one for a hug), then 🚗 and away
//   arrive   the lift's big button (it counts up to 6), then the counter: three pairs of socks, the shoe rack, the
//            height chart, and the gate once her socks are on
//   home     the pizza box for Agong, the cousins' phones (tap each), the photo of the day, then the stamp
// The words show on each page for Dad (not recorded yet).
import { motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { lineText, sounds, type Line } from '../../../../../sdk'
import { sfx } from '../../sfx'
import { Ask, tripChoices } from '../../trip/legs/Ask'
import type { LoopSection } from './Loop'
import { SOCK_COLORS } from './socks'
import { W } from './words'

interface Props {
  section: LoopSection
  socks: string
  covered: boolean
  onMall(): void
  /** Another trip on the card (its activity id). */
  onTrip(id: string): void
  onNotYet(): void
  onLeg(next: string): void
  onSocks(id: string): void
  onDone(): void
}

const big = { width: 'clamp(96px, 18vmin, 150px)', height: 'clamp(96px, 18vmin, 150px)', borderRadius: 32, border: '6px solid #fff', boxShadow: 'var(--shadow)', fontSize: 'clamp(46px, 9vmin, 74px)', padding: 0, color: 'var(--ink)' } as const
const FAMILY = [
  { id: 'agong', icon: '🐼', bg: '#D9CCFF' },
  { id: 'jum', icon: '🐘', bg: '#FFD6E7' },
  { id: 'joy', icon: '🐰', bg: '#FFF1C9' },
  { id: 'gan', icon: '🦊', bg: '#CFE3FF' },
  { id: 'ken', icon: '🦊', bg: '#E3F7EE' },
  { id: 'bb', icon: '🐃', bg: '#FFE3EF' },
]

function Words({ l }: { l: Line | null }) {
  if (!l) return null
  return (
    <motion.div key={lineText(l)} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'rgba(255,255,255,.95)', borderRadius: 'var(--radius)', padding: '8px 18px', boxShadow: 'var(--shadow)', fontWeight: 700, fontSize: 'clamp(18px, 3vmin, 26px)', maxWidth: 'min(560px, 90vw)', textAlign: 'center' }}>
      {lineText(l)}
    </motion.div>
  )
}

const Page = ({ bg, children }: { bg: string; children: ReactNode }) => (
  <div style={{ position: 'absolute', inset: 0, background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(12px, 3vmin, 26px)', padding: 'calc(var(--top-clear) + 8px) 16px calc(var(--safe-bottom) + 16px)' }}>{children}</div>
)

export function LoopFlat({ section, covered, onMall, onTrip, onNotYet, onLeg, onSocks, onDone }: Props) {
  const [line, setLine] = useState<Line | null>(null)
  const [hugged, setHugged] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [floor, setFloor] = useState(1)
  const [picked, setPicked] = useState<string | null>(null)
  const [toys, setToys] = useState<string[]>([])
  const [phones, setPhones] = useState<string[]>([])
  const went = useRef(false)
  useEffect(() => {
    setStep(0)
    setLine(section === 'goodbye' ? W.trip.wish : section === 'arrive' ? W.arrive.lift : section === 'home' ? W.trip.agong : null)
    went.current = false
  }, [section])
  const leg = (next: string, ms = 700) => {
    if (went.current) return
    went.current = true
    setTimeout(() => onLeg(next), ms)
  }

  if (section === 'invite') return (
    <Page bg="linear-gradient(#FFE3EF, #FFF7F0)">
      <div style={{ fontSize: 'clamp(70px, 16vmin, 130px)' }} aria-hidden>🦄🏠</div>
      <Ask open={!covered} trips={tripChoices()} onYes={(t) => (t && t !== 'mall-trip' ? onTrip(t) : onMall())} onNotYet={onNotYet} />
    </Page>
  )

  if (section === 'goodbye') return (
    <Page bg="linear-gradient(#FFD9C4, #FFF1E2)">
      <Words l={line} />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(8px, 2vmin, 18px)', maxWidth: 820 }}>
        {FAMILY.map((f) => (
          <motion.button
            key={f.id}
            aria-label={`Hug ${f.id}`}
            animate={hugged === f.id ? { scale: [1, 1.2, 1], rotate: [0, -8, 8, 0] } : {}}
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              sounds.sparkle()
              setHugged(f.id)
              setTimeout(() => setHugged(null), 700)
            }}
            style={{ ...big, width: 'clamp(84px, 15vmin, 120px)', height: 'clamp(84px, 15vmin, 120px)', background: f.bg, fontSize: 'clamp(40px, 8vmin, 60px)' }}
          >
            {hugged === f.id ? '🤗' : f.icon}
          </motion.button>
        ))}
      </div>
      <motion.button
        aria-label="Into Mommy's car"
        animate={step ? { x: '60vw' } : { scale: [1, 1.06, 1] }}
        transition={step ? { duration: 0.7, ease: 'easeIn' } : { repeat: Infinity, duration: 1.4 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (step) return
          sfx.vroom()
          setStep(1)
          leg('arrive', 800)
        }}
        style={{ ...big, width: 'clamp(150px, 30vmin, 230px)', background: '#E4E7F0' }}
      >
        🚗
      </motion.button>
    </Page>
  )

  if (section === 'arrive') {
    // The lift, then the counter.
    if (step < 2) return (
      <Page bg="linear-gradient(#E8E4F6, #CFC8E2)">
        <Words l={line} />
        <div aria-label={`Floor ${floor}`} style={{ ...big, display: 'grid', placeItems: 'center', background: '#2B2330', color: floor === 6 ? '#FFC83D' : '#fff', fontWeight: 700 }}>{floor}</div>
        <motion.button
          aria-label="The lift button"
          animate={step ? {} : { scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => {
            if (step) return sfx.boop()
            setStep(1)
            setLine(null)
            sfx.callDing()
            for (let n = 2; n <= 6; n++)
              setTimeout(() => {
                setFloor(n)
                sounds.note(n + 1)
                if (n === 6) {
                  setLine(W.arrive.six)
                  setTimeout(() => {
                    setStep(2)
                    setLine(W.arrive.counter)
                  }, 1200)
                }
              }, (n - 1) * 650)
          }}
          style={{ ...big, borderRadius: '50%', background: 'var(--hotpink)' }}
        >
          🛗
        </motion.button>
      </Page>
    )
    const toy = (id: string, l: Line) => {
      sounds.pop()
      setToys((t) => (t.includes(id) ? t : [...t, id]))
      setLine(l)
    }
    const on = picked ?? null
    return (
      <Page bg="linear-gradient(#A8DCFF 0, #A8DCFF 45%, #FFD6E7 45%)">
        <Words l={line} />
        <div style={{ display: 'flex', gap: 'clamp(10px, 2.5vmin, 22px)' }}>
          {(['pink', 'lavender', 'mint'] as const).map((id) => (
            <motion.button
              key={id}
              aria-label={`${id} socks`}
              whileTap={{ scale: 0.85 }}
              animate={on === id ? { y: [0, -14, 0] } : {}}
              onClick={() => {
                sfx.fwip()
                setPicked(id)
                onSocks(id)
                setLine(W.arrive.stretch)
              }}
              style={{ ...big, background: SOCK_COLORS[id], outline: on === id ? '6px solid var(--gold)' : 'none' }}
            >
              🧦
            </motion.button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'clamp(10px, 2.5vmin, 22px)' }}>
          <motion.button aria-label="The shoe rack" whileTap={{ scale: 0.85 }} onClick={() => toy('shoes', W.arrive.shoes)} style={{ ...big, background: '#E8D2B8' }}>
            {toys.includes('shoes') ? '✅' : '👟'}
          </motion.button>
          <motion.button aria-label="The height chart" whileTap={{ scale: 0.85 }} onClick={() => toy('chart', W.arrive.tall)} style={{ ...big, background: '#FBEA9A' }}>
            {toys.includes('chart') ? '🦄' : '📏'}
          </motion.button>
          <motion.button
            aria-label="Into HarborLand"
            animate={on ? { scale: [1, 1.08, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.2 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              if (!on) {
                sfx.boop()
                setLine(W.arrive.socks)
                return
              }
              sounds.sparkle()
              leg('hall')
            }}
            style={{ ...big, background: 'var(--mint)', opacity: on ? 1 : 0.7, outline: on ? '6px solid rgba(255,200,61,.85)' : 'none' }}
          >
            🛝
          </motion.button>
        </div>
      </Page>
    )
  }

  // Home: the box for Agong, the cousins' phones, the photo.
  const allPhones = phones.length >= 3
  return (
    <Page bg="linear-gradient(#FFE9C9, #FFF7F0)">
      <Words l={line} />
      {step === 0 ? (
        <motion.button
          aria-label="Give Agong the pizza box"
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ repeat: Infinity, duration: 1.3 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            sounds.sparkle()
            setStep(1)
            setLine(W.trip.thanks)
          }}
          style={{ ...big, width: 'clamp(160px, 32vmin, 240px)', background: '#D9CCFF' }}
        >
          🐼🍕
        </motion.button>
      ) : step === 1 ? (
        <div style={{ display: 'flex', gap: 'clamp(10px, 2.5vmin, 22px)' }}>
          {(['gan', 'ken', 'bb'] as const).map((c) => (
            <motion.button
              key={c}
              aria-label={`${c} looks up`}
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                sfx.phone()
                const next = phones.includes(c) ? phones : [...phones, c]
                setPhones(next)
                setLine(W.trip.pizza[c])
                if (next.length >= 3) setTimeout(() => setStep(2), 900)
              }}
              style={{ ...big, background: phones.includes(c) ? '#FFE27A' : '#CFE3FF' }}
            >
              {phones.includes(c) ? '😮' : '📱'}
            </motion.button>
          ))}
        </div>
      ) : (
        <motion.button
          aria-label="Our photo on Agong's wall"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (went.current) return
            went.current = true
            sounds.sparkle()
            setLine(W.trip.wall)
            setTimeout(onDone, 1200)
          }}
          style={{ ...big, width: 'clamp(170px, 34vmin, 260px)', background: 'var(--hotpink)', fontSize: 'clamp(50px, 10vmin, 80px)' }}
        >
          🐉🛝
        </motion.button>
      )}
      {allPhones && step === 1 && <div aria-hidden style={{ fontSize: 40 }}>🎉</div>}
    </Page>
  )
}

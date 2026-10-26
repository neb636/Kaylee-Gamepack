// The Nan road trip's legs without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the same legs as
// a picture book, so she can always get to Nan and home to the stamp. One big page at a time:
//   invite                Mommy's card: 🚤, 🛝🍕, 🏔️🚙 or ✋⏳
//   pack                  her things as big buttons (the mountain things glint), ✅ to close the suitcase
//   goodbye               Aunty Sri's van: 🚐 and away
//   airport               the suitcase onto the x-ray belt: 🧳
//   takeoff, fly, land    the window: ✈️ to fly north to Nan
//   home                  her photos: tap one for Agong's wall, then the stamp
import { motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { sounds } from '../../../../../sdk'
import { sfx } from '../../sfx'
import { Ask, tripChoices } from '../../trip/legs/Ask'
import { itemsFor, mommyTucksIn } from '../../trip/packing'
import { NAN_TRIP, type LoopSection } from './trip'

interface Props {
  section: LoopSection
  packed: string[]
  photos: { n: number; kind: string; src: string }[]
  covered: boolean
  onYes(): void
  onTrip(id: string): void
  onNotYet(): void
  onLeg(next: string): void
  onPacked(ids: string[]): void
  /** The photo she picked for Agong's wall: the stamp. */
  onDone(src: string): void
}

const big = { width: 'clamp(96px, 18vmin, 150px)', height: 'clamp(96px, 18vmin, 150px)', borderRadius: 32, border: '6px solid #fff', boxShadow: 'var(--shadow)', fontSize: 'clamp(46px, 9vmin, 74px)', padding: 0, color: 'var(--ink)' } as const

const Page = ({ bg, children }: { bg: string; children: ReactNode }) => (
  <div style={{ position: 'absolute', inset: 0, background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(12px, 3vmin, 26px)', padding: 'calc(var(--top-clear) + 8px) 16px calc(var(--safe-bottom) + 16px)' }}>{children}</div>
)

/** One big pulsing button that moves the trip on. */
function Go({ label, icon, bg, onGo }: { label: string; icon: string; bg: string; onGo: () => void }) {
  const [went, setWent] = useState(false)
  return (
    <motion.button
      aria-label={label}
      animate={went ? { x: '60vw' } : { scale: [1, 1.06, 1] }}
      transition={went ? { duration: 0.7, ease: 'easeIn' } : { repeat: Infinity, duration: 1.4 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        if (went) return
        sfx.vroom()
        setWent(true)
        setTimeout(onGo, 800)
      }}
      style={{ ...big, width: 'clamp(150px, 30vmin, 230px)', background: bg }}
    >
      {icon}
    </motion.button>
  )
}

export function LoopFlat({ section, packed, photos, covered, onYes, onTrip, onNotYet, onLeg, onPacked, onDone }: Props) {
  const [picked, setPicked] = useState<number | null>(null)
  const shut = useRef(false)
  useEffect(() => {
    setPicked(null)
    shut.current = false
  }, [section])

  if (section === 'invite')
    return (
      <Page bg="linear-gradient(#FFE3EF, #FFF7F0)">
        <div style={{ fontSize: 'clamp(70px, 16vmin, 130px)' }} aria-hidden>🦄🏔️</div>
        <Ask open={!covered} trips={tripChoices(NAN_TRIP.id)} onYes={(t) => (t && t !== NAN_TRIP.id ? onTrip(t) : onYes())} onNotYet={onNotYet} />
      </Page>
    )

  if (section === 'pack')
    return (
      <Page bg="linear-gradient(#FFE3EF, #FFF7F0)">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(8px, 2vmin, 16px)', maxWidth: 820 }}>
          {itemsFor('cool')
            .filter((it) => it.id !== 'gan')
            .map((it) => {
              const on = packed.includes(it.id)
              return (
                <motion.button
                  key={it.id}
                  aria-label={it.label}
                  animate={it.cool && !on ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.3 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                    sounds.pop()
                    onPacked(on ? packed.filter((x) => x !== it.id) : [...packed, it.id])
                  }}
                  style={{ ...big, width: 'clamp(76px, 13vmin, 110px)', height: 'clamp(76px, 13vmin, 110px)', fontSize: 'clamp(36px, 7vmin, 54px)', background: on ? 'var(--pink)' : '#fff', outline: it.cool ? '4px dashed var(--mint)' : 'none' }}
                >
                  {it.icon}
                </motion.button>
              )
            })}
        </div>
        <motion.button
          aria-label="Close the suitcase"
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            if (shut.current) return
            shut.current = true
            sfx.latch()
            onPacked(mommyTucksIn(packed, 'cool'))
            setTimeout(() => onLeg('goodbye'), 600)
          }}
          style={{ ...big, borderRadius: '50%', background: 'var(--mint)' }}
        >
          ✅
        </motion.button>
      </Page>
    )

  if (section === 'goodbye')
    return (
      <Page bg="linear-gradient(#FFD9C4, #FFF1E2)">
        <div style={{ fontSize: 'clamp(60px, 13vmin, 110px)' }} aria-hidden>🦄🦄🦄</div>
        <Go label="Into Aunty Sri's van" icon="🚐" bg="#F4F1FF" onGo={() => onLeg('airport')} />
      </Page>
    )

  if (section === 'airport')
    return (
      <Page bg="linear-gradient(#E8E4F6, #CFC8E2)">
        <Go label="The suitcase onto the belt" icon="🧳" bg="var(--pink)" onGo={() => onLeg('takeoff')} />
      </Page>
    )

  if (section === 'home')
    return (
      <Page bg="linear-gradient(#FFE3EF, #FFF7F0)">
        <div style={{ fontSize: 'clamp(60px, 13vmin, 110px)' }} aria-hidden>🐼🖼️</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(10px, 2.5vmin, 22px)', maxWidth: 900 }}>
          {photos.map((p) => (
            <motion.button
              key={p.n}
              aria-label={`Photo: ${p.kind}`}
              animate={picked === p.n ? { scale: [1, 1.2, 1] } : {}}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (picked !== null) return
                sounds.sparkle()
                setPicked(p.n)
                setTimeout(() => onDone(p.src), 900)
              }}
              style={{ width: 'clamp(130px, 26vmin, 220px)', padding: '7px 7px 20px', background: '#fff', border: 'none', borderRadius: 6, boxShadow: '0 8px 22px rgba(43,35,48,.35)', opacity: picked !== null && picked !== p.n ? 0.4 : 1 }}
            >
              <img src={p.src} alt="" style={{ display: 'block', width: '100%', borderRadius: 3 }} />
            </motion.button>
          ))}
        </div>
      </Page>
    )

  // The window seat.
  return (
    <Page bg="linear-gradient(#BFE6FF, #E8F6FF 60%, #9ED9A6)">
      <div style={{ fontSize: 'clamp(60px, 13vmin, 110px)' }} aria-hidden>☁️🏔️☁️</div>
      <Go label="Fly to Nan" icon="✈️" bg="var(--sky)" onGo={() => onLeg('rental')} />
    </Page>
  )
}

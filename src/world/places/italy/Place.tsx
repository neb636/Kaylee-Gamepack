// Italy: "Lupa Sings at the Opera" (plan: planning/around-the-world/italy.md). Built in stages: the boot map and the
// Pizzeria in Naples came first; the other six arches say "coming soon" until their activities exist.
import { motion } from 'motion/react'
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { BigButton, say, SparklePuppet, sounds, type PuppetHandle } from '../../../sdk'
import { FitBox } from '../../kit/Chrome'
import { sfx } from '../../kit/sfx'
import { StampEarned } from '../../kit/StampEarned'
import { StoryBeat } from '../../kit/StoryBeat'
import type { PlaceProps } from '../../types'
import { Pizzeria } from './activities/pizzeria/Pizzeria'
import { art } from './art'
import { L } from './lines'
import { INK } from './puppets/ink'
import { Lupa } from './puppets/Lupa'

export interface ActivityProps {
  onDone: () => void
  setProgress: (done: number, total: number) => void
}

const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = { pizzeria: Pizzeria }

/** The seven arches on the boot map, on their landmarks in scene-italy-map (in % of the picture), and the instrument each
 *  friend brings to Lupa's band. Only activities listed in meta.activities are playable; the rest say "coming soon". */
const SPOTS = [
  { id: 'venice', name: 'Venice', icon: '🛶', x: 59, y: 19, band: '🪗' },
  { id: 'pisa', name: 'Leaning Tower', icon: '🗼', x: 39.5, y: 27, band: '🔔' },
  { id: 'colosseum', name: 'The Colosseum', icon: '🏛️', x: 48, y: 41, band: '📯' },
  { id: 'trevi', name: 'Trevi Fountain', icon: '⛲', x: 58.5, y: 45, band: '⭐' },
  { id: 'pizzeria', name: 'Pizzeria in Naples', icon: '🍕', x: 65.4, y: 61.5, face: art.bruno, band: art.mandolin },
  { id: 'olives', name: 'Olive Grove', icon: '🫒', x: 83, y: 57, band: '🪘' },
  { id: 'etna', name: 'Snow on a Volcano', icon: '🌋', x: 51.5, y: 84, band: '🎹' },
]

export default function Place(props: PlaceProps) {
  const { meta, activity, earnStamp, setProgress, backToMap } = props
  const [justEarned, setJustEarned] = useState<string | null>(null)

  if (activity === 'party') return <OperaSoon backToMap={backToMap} />

  const Activity = activity ? ACTIVITIES[activity] : undefined
  const info = meta.activities.find((a) => a.id === activity)
  if (Activity && info) {
    const finish = () => {
      earnStamp(info.id)
      setJustEarned(info.id)
    }
    if (window.__kayleeWorld) window.__kayleeWorld.finish = finish
    return (
      <>
        <Activity key={activity} setProgress={setProgress} onDone={finish} />
        {justEarned === info.id && (
          <StampEarned
            activity={info}
            onClose={() => {
              setJustEarned(null)
              backToMap()
            }}
          />
        )}
      </>
    )
  }
  return <Hub {...props} />
}

// Lupa says hello once per visit to the app.
let introSeen = false

function Hub({ meta, stamps, openActivity }: PlaceProps) {
  const [intro, setIntro] = useState(stamps.length === 0 && !introSeen)
  const [wiggle, setWiggle] = useState<string | null>(null)
  const [kick, setKick] = useState(0)
  const playable = new Set(meta.activities.map((a) => a.id))

  useEffect(() => {
    if (intro) return
    void say(stamps.length === 0 ? L.hubFirst : L.hubNext)
  }, [intro, stamps.length])

  const kickBoot = () => {
    setKick((k) => k + 1)
    sfx.boing()
    void say(L.boot)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#9ED9F0', padding: 'var(--top-clear) 12px calc(var(--safe-bottom) + 12px)', display: 'flex', overflow: 'hidden' }}>
      <div className="world-split" style={{ flex: 1, minHeight: 0, gap: 'min(14px, 2vh)', alignItems: 'center', position: 'relative' }}>
        <FitBox ratio={1.5}>
          <motion.div
            key={kick}
            initial={false}
            animate={kick ? { rotate: [0, -2.5, 1.5, -0.6, 0] } : {}}
            transition={{ duration: 0.6 }}
            style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--shadow)', background: `url(${art.map}) center / cover` }}
          />
          <Ambient />
          {/* The boot's toe: tap it and the boot kicks Sicily like a ball. */}
          <motion.button
            aria-label="Kick the boot"
            onClick={kickBoot}
            whileTap={{ scale: 0.9 }}
            style={{ position: 'absolute', left: '63%', top: '82%', translate: '-50% -50%', width: 'clamp(64px, 9cqw, 96px)', aspectRatio: '1', borderRadius: '50%', background: 'rgba(255,255,255,.01)', border: 'none', padding: 0 }}
          >
            <motion.span key={kick} initial={kick ? { x: 0, y: 0, opacity: 1 } : { opacity: 0 }} animate={kick ? { x: [-10, -90], y: [0, -40, 10], opacity: [1, 1, 0] } : {}} transition={{ duration: 0.8 }} style={{ display: 'block', fontSize: 'clamp(22px, 3.4cqw, 36px)' }}>
              💫
            </motion.span>
          </motion.button>
          {SPOTS.map((spot, i) => {
            const open = playable.has(spot.id)
            const done = stamps.includes(spot.id)
            const big = spot.id === 'pizzeria'
            return (
              <motion.button
                key={spot.id}
                aria-label={open ? spot.name : `${spot.name} coming soon`}
                className={open && !done ? 'world-glow' : undefined}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1, rotate: wiggle === spot.id ? [0, -14, 12, -8, 6, 0] : 0, y: open && !done ? [0, -6, 0] : 0 }}
                transition={{ scale: { delay: 0.2 + i * 0.05, type: 'spring', duration: 0.5 }, rotate: { duration: 0.6 }, y: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' } }}
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  sounds.pop()
                  if (open) openActivity(spot.id)
                  else {
                    setWiggle(spot.id)
                    setTimeout(() => setWiggle(null), 650)
                    void say(L.soon)
                  }
                }}
                style={{
                  position: 'absolute',
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  translate: '-50% -50%',
                  width: big ? 'clamp(80px, 12cqw, 126px)' : 'clamp(60px, 8.5cqw, 90px)',
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  borderRadius: '50% 50% 18% 18%',
                  opacity: open ? 1 : 0.82,
                }}
              >
                <Arch done={done} dim={!open}>
                  {done && spot.face ? (
                    <img src={spot.face} alt="" style={{ width: '112%', marginTop: '14%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: big ? 'clamp(30px, 5cqw, 54px)' : 'clamp(22px, 3.4cqw, 38px)', opacity: open ? 1 : 0.7 }}>{spot.icon}</span>
                  )}
                </Arch>
                {!open && <span style={{ position: 'absolute', right: '-12%', bottom: '-4%', fontSize: 'clamp(16px, 2.6cqw, 26px)' }}>☁️</span>}
                {done && <span style={{ position: 'absolute', right: '-12%', top: '-4%', fontSize: 'clamp(16px, 2.6cqw, 26px)' }}>✅</span>}
              </motion.button>
            )
          })}
        </FitBox>
        <BandPanel done={SPOTS.filter((s) => stamps.includes(s.id))} total={SPOTS.length} onOpen={() => openActivity('party')} />
      </div>
      {intro && (
        <StoryBeat
          lines={L.intro}
          friend={<Lupa height="100%" />}
          bg={art.bgNaplesBay}
          onDone={() => {
            introSeen = true
            setIntro(false)
          }}
        />
      )}
    </div>
  )
}

/** A little Roman arch: cream stone, terracotta edge. Finished ones turn gold. */
function Arch({ children, done, dim }: { children: ReactNode; done?: boolean; dim?: boolean }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '0.86',
        borderRadius: '50% 50% 14% 14% / 42% 42% 10% 10%',
        background: done ? '#FFE27A' : dim ? '#F4E6D6' : '#FFF4E4',
        border: `5px solid ${INK}`,
        boxShadow: `inset 0 -8px 0 ${done ? '#F2C24E' : '#EFD9C0'}, 0 6px 0 rgba(110,59,36,.22)`,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Terracotta keystone at the top of the arch */}
      <div style={{ position: 'absolute', top: -2, left: '50%', translate: '-50% 0', width: '22%', height: '16%', background: '#E48A62', border: `3px solid ${INK}`, borderTop: 'none', borderRadius: '0 0 6px 6px' }} />
      {children}
    </div>
  )
}

/** Things that move on the map: a seagull glides over the sea, a fish jumps by the heel. */
function Ambient() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 28 }}>
      <motion.div animate={{ x: ['-10cqw', '110cqw'] }} transition={{ repeat: Infinity, duration: 24, ease: 'linear' }} style={{ position: 'absolute', top: '30%', left: 0, fontSize: 'clamp(22px, 3.6cqw, 40px)' }}>
        <motion.span animate={{ y: [0, -12, 0, 8, 0], rotate: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 3.4 }} style={{ display: 'inline-block' }}>
          🕊️
        </motion.span>
      </motion.div>
      <motion.div animate={{ x: [0, 0, 26, 52, 52], y: [0, 0, -46, 0, 0], rotate: [0, 0, -30, 40, 40], opacity: [0, 0, 1, 1, 0] }} transition={{ repeat: Infinity, duration: 6.5, times: [0, 0.7, 0.8, 0.9, 1] }} style={{ position: 'absolute', left: '72%', top: '78%', fontSize: 'clamp(20px, 3cqw, 34px)' }}>
        🐟
      </motion.div>
      <motion.div animate={{ x: ['105cqw', '-12cqw'] }} transition={{ repeat: Infinity, duration: 30, ease: 'linear', delay: 6 }} style={{ position: 'absolute', top: '92%', left: 0, fontSize: 'clamp(22px, 3.6cqw, 40px)' }}>
        <motion.span animate={{ rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 1.8 }} style={{ display: 'inline-block' }}>
          ⛵
        </motion.span>
      </motion.div>
    </div>
  )
}

/** Lupa's band: a little stage where one friend's instrument appears for every stamp. The opera finale comes later. */
function BandPanel({ done, total, onOpen }: { done: typeof SPOTS; total: number; onOpen: () => void }) {
  const seats = Array.from({ length: total - 1 }, (_, i) => done[i])
  return (
    <motion.button
      aria-label="Party"
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        sounds.pop()
        onOpen()
      }}
      className="party-panel"
      style={{ position: 'relative', flexShrink: 0, borderRadius: 28, border: `5px solid ${INK}`, boxShadow: 'var(--shadow)', background: '#6B4F8F', overflow: 'hidden', containerType: 'size', padding: 0 }}
    >
      {/* Stage curtains and boards */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '12%', background: '#E8574F', borderRight: `4px solid ${INK}` }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '12%', background: '#E8574F', borderLeft: `4px solid ${INK}` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '22%', background: '#C98B5B', borderTop: `4px solid ${INK}` }} />
      <div style={{ position: 'absolute', left: '15%', right: '15%', top: '8%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4%' }}>
        {seats.map((s, i) => (
          <motion.div
            key={i}
            animate={s ? { y: [0, -5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15 }}
            style={{ width: 'min(20cqw, 17cqh)', aspectRatio: '1', borderRadius: '50%', background: s ? '#FFF4E4' : 'rgba(255,255,255,.18)', border: `3px ${s ? 'solid' : 'dashed'} ${s ? INK : 'rgba(255,255,255,.6)'}`, display: 'grid', placeItems: 'center', fontSize: 'min(11cqw, 10cqh)' }}
          >
            {s && (s.band.includes('/') || s.band.startsWith('data:') ? <img src={s.band} alt="" style={{ width: '80%' }} /> : s.band)}
          </motion.div>
        ))}
      </div>
      <motion.img src={art.lupa} alt="" animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', left: '50%', bottom: '12%', translate: '-50% 0', height: 'min(46cqh, 40cqw)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: '3%', display: 'flex', justifyContent: 'center' }}>
        <span style={{ background: '#FFC83D', color: INK, borderRadius: 999, padding: '2px 14px', fontWeight: 700, fontSize: 'clamp(16px, 2.6vmin, 24px)', border: `4px solid ${INK}` }}>
          🎵 {done.length}/{total}
        </span>
      </div>
    </motion.button>
  )
}

/** Finale stub (route `party`): Lupa's opera night arrives when the band is full. */
function OperaSoon({ backToMap }: { backToMap: () => void }) {
  const sparkle = useRef<PuppetHandle>(null)
  const lupa = useRef<PuppetHandle>(null)
  useEffect(() => {
    void say(L.bandSoon)
    const t = setTimeout(() => {
      void sparkle.current?.play('wave')
      void lupa.current?.play('howl')
    }, 400)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{ position: 'absolute', inset: 0, background: `url(${art.bgNaplesBay}) center / cover`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 'min(20px, 3vh)', padding: 'var(--top-clear) 20px calc(var(--safe-bottom) + 28px)' }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '12px 26px', boxShadow: 'var(--shadow)', fontSize: 'clamp(22px, min(4vw, 5vh), 38px)', fontWeight: 600, textAlign: 'center' }}>🎭 {L.bandSoon}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'min(20px, 3vw)' }}>
        <SparklePuppet ref={sparkle} height="min(300px, 34vh, 40vw)" lookToward={0.5} />
        <Lupa ref={lupa} height="min(260px, 30vh, 36vw)" onTap={() => void lupa.current?.play('howl')} />
      </div>
      <BigButton onClick={backToMap} ariaLabel="Back to the map of Italy">
        🍕 ▶
      </BigButton>
    </div>
  )
}

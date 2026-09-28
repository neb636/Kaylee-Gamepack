// China: "Bao Bao's Dragon Parade" (plan: planning/around-the-world/china.md). Built in stages: the scroll map and the
// Shanghai Dumpling House come first; the other six lanterns glow "coming soon" until their activities exist.
import { motion } from 'motion/react'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { BigButton, say, SparklePuppet, sounds, type PuppetHandle } from '../../../sdk'
import { FitBox } from '../../kit/Chrome'
import { StampEarned } from '../../kit/StampEarned'
import { StoryBeat } from '../../kit/StoryBeat'
import type { PlaceProps } from '../../types'
import { DumplingHouse } from './activities/dumplings/DumplingHouse'
import { art } from './art'
import { L } from './lines'
import { Lantern } from './props'
import { DouDou } from './puppets/DouDou'
import { INK } from './puppets/ink'

export interface ActivityProps {
  onDone: () => void
  setProgress: (done: number, total: number) => void
}

const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = { dumplings: DumplingHouse }

/** The seven lantern spots on the scroll map (the painted cream circles in scene-china-map), in % of the picture.
 *  Only activities listed in meta.activities are playable; the rest say "coming soon". */
const LANTERNS = [
  { id: 'wall', name: 'The Great Wall', icon: '🧱', x: 51.4, y: 25.6 },
  { id: 'bamboo', name: 'Bamboo Forest', icon: '🎋', x: 44, y: 42.7 },
  { id: 'hotpot', name: 'Hotpot Night', icon: '🍲', x: 52.7, y: 47.1 },
  { id: 'brush', name: 'The Magic Brush', icon: '🖌️', x: 58, y: 58.8 },
  { id: 'race', name: 'The Great Race', icon: '🐭', x: 73.6, y: 61.7 },
  { id: 'train', name: 'Bullet Train', icon: '🚄', x: 79.4, y: 14.8 },
  { id: 'dumplings', name: 'Dumpling House', icon: '🥟', x: 84.4, y: 47.6 },
]

export default function Place(props: PlaceProps) {
  const { meta, activity, earnStamp, setProgress, backToMap } = props
  const [justEarned, setJustEarned] = useState<string | null>(null)

  if (activity === 'party') return <ParadeSoon backToMap={backToMap} />

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

// Sparkle says hello once per visit to the app, and the scroll unrolls once.
let introSeen = false
let unrolled = false

function Hub({ meta, stamps, openActivity }: PlaceProps) {
  const [intro, setIntro] = useState(stamps.length === 0 && !introSeen)
  const [unroll] = useState(() => !unrolled)
  const [wiggle, setWiggle] = useState<string | null>(null)
  const playable = new Set(meta.activities.map((a) => a.id))

  useEffect(() => {
    unrolled = true
  }, [])
  useEffect(() => {
    if (intro) return
    void say(stamps.length === 0 ? L.hubFirst : L.hubNext)
  }, [intro, stamps.length])

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#BFE8D6', padding: 'var(--top-clear) 12px calc(var(--safe-bottom) + 12px)', display: 'flex', overflow: 'hidden' }}>
      <Petals />
      <div className="world-split" style={{ flex: 1, minHeight: 0, gap: 'min(14px, 2vh)', alignItems: 'center', position: 'relative' }}>
        <FitBox ratio={1.5}>
          <motion.div
            initial={unroll ? { clipPath: 'inset(0% 48% 0% 48% round 28px)' } : false}
            animate={{ clipPath: 'inset(0% 0% 0% 0% round 28px)' }}
            transition={{ duration: 0.9, ease: [0.3, 0.8, 0.4, 1] }}
            style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--shadow)', background: `url(${art.map}) center / cover` }}
          />
          <motion.div aria-hidden animate={{ x: ['-10%', '110%'] }} transition={{ repeat: Infinity, duration: 26, ease: 'linear' }} style={{ position: 'absolute', top: '4%', left: 0, fontSize: 'clamp(26px, 5cqw, 48px)', pointerEvents: 'none' }}>
            <motion.span animate={{ y: [0, -10, 0], rotate: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 3 }} style={{ display: 'inline-block' }}>
              🪁
            </motion.span>
          </motion.div>
          {LANTERNS.map((spot, i) => {
            const open = playable.has(spot.id)
            const done = stamps.includes(spot.id)
            const big = spot.id === 'dumplings'
            return (
              <motion.button
                key={spot.id}
                aria-label={open ? spot.name : `${spot.name} coming soon`}
                className={open && !done ? 'world-glow' : undefined}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1, rotate: wiggle === spot.id ? [0, -14, 12, -8, 6, 0] : [-4, 4, -4] }}
                transition={{ scale: { delay: (unroll ? 0.3 : 0) + i * 0.04, type: 'spring', duration: 0.5 }, rotate: wiggle === spot.id ? { duration: 0.6 } : { repeat: Infinity, duration: 2.6 + (i % 3) * 0.4, ease: 'easeInOut' } }}
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
                  translate: '-50% -52%',
                  width: big ? 'clamp(76px, 12cqw, 124px)' : 'clamp(62px, 9cqw, 96px)',
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  borderRadius: '40%',
                  transformOrigin: '50% 0%',
                  filter: open ? 'drop-shadow(0 6px 0 rgba(110,59,36,.25))' : 'saturate(0.55)',
                }}
              >
                <Lantern lit={done} dim={!open}>
                  {done ? (
                    <img src={art.doudou} alt="" style={{ width: '120%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: big ? 'clamp(28px, 4.6cqw, 50px)' : 'clamp(22px, 3.4cqw, 38px)', opacity: open ? 1 : 0.6 }}>{spot.icon}</span>
                  )}
                </Lantern>
                {!open && <span style={{ position: 'absolute', right: '-10%', bottom: '4%', fontSize: 'clamp(16px, 2.6cqw, 26px)' }}>☁️</span>}
                {done && <span style={{ position: 'absolute', right: '-12%', top: '10%', fontSize: 'clamp(16px, 2.6cqw, 26px)' }}>✅</span>}
              </motion.button>
            )
          })}
        </FitBox>
        <ParadePanel lit={stamps.length} total={LANTERNS.length} onOpen={() => openActivity('party')} />
      </div>
      {intro && (
        <StoryBeat
          lines={L.intro}
          bg={art.bgBund}
          onDone={() => {
            introSeen = true
            setIntro(false)
          }}
        />
      )}
    </div>
  )
}

/** Plum blossom petals drifting down over the hub. */
function Petals() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 2 }}>
      {Array.from({ length: 9 }, (_, i) => (
        <motion.div
          key={i}
          initial={{ y: '-10vh', x: 0, rotate: 0 }}
          animate={{ y: '110vh', x: [0, 30, -20, 25, 0], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 11 + (i % 4) * 2.5, delay: i * 1.7, ease: 'linear' }}
          style={{ position: 'absolute', left: `${(i * 37 + 7) % 100}%`, width: 16, height: 12, borderRadius: '60% 0 60% 0', background: i % 2 ? '#FFB3C8' : '#FFD1DC', border: `2px solid ${INK}`, opacity: 0.85 }}
        />
      ))}
    </div>
  )
}

/** The dragon parade: one lantern lights up for every stamp. The finale itself comes with the last activity. */
function ParadePanel({ lit, total, onOpen }: { lit: number; total: number; onOpen: () => void }) {
  return (
    <motion.button
      aria-label="Party"
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        sounds.pop()
        onOpen()
      }}
      className="party-panel"
      style={{ position: 'relative', flexShrink: 0, borderRadius: 28, border: `5px solid ${INK}`, boxShadow: 'var(--shadow)', background: '#4B3B7A', overflow: 'hidden', containerType: 'size', padding: 0 }}
    >
      <div style={{ position: 'absolute', left: '4%', right: '4%', top: '6%', display: 'flex', justifyContent: 'space-between' }}>
        {Array.from({ length: total }, (_, i) => (
          <motion.div key={i} animate={{ rotate: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 2 + i * 0.2 }} style={{ width: `${88 / total}%`, transformOrigin: '50% 0%' }}>
            <Lantern lit={i < lit} dim={i >= lit} />
          </motion.div>
        ))}
      </div>
      <motion.div animate={{ x: [-6, 6, -6], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 2.2 }} style={{ position: 'absolute', left: 0, right: 0, bottom: '16%', textAlign: 'center', fontSize: 'min(46cqh, 56cqw, 180px)' }}>
        🐉
      </motion.div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: '5%', display: 'flex', justifyContent: 'center' }}>
        <span style={{ background: '#FFC83D', color: INK, borderRadius: 999, padding: '4px 16px', fontWeight: 700, fontSize: 'clamp(18px, 3vmin, 28px)', border: `4px solid ${INK}` }}>
          🏮 {lit}/{total}
        </span>
      </div>
    </motion.button>
  )
}

/** Finale stub (route `party`): the dragon parade arrives when every lantern is lit. */
function ParadeSoon({ backToMap }: { backToMap: () => void }) {
  const sparkle = useRef<PuppetHandle>(null)
  const dou = useRef<PuppetHandle>(null)
  useEffect(() => {
    void say(L.paradeSoon)
    const t = setTimeout(() => {
      void sparkle.current?.play('wave')
      void dou.current?.play('wave')
    }, 400)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{ position: 'absolute', inset: 0, background: `url(${art.bgBund}) center / cover`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 'min(20px, 3vh)', padding: 'var(--top-clear) 20px calc(var(--safe-bottom) + 28px)' }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '12px 26px', boxShadow: 'var(--shadow)', fontSize: 'clamp(22px, min(4vw, 5vh), 38px)', fontWeight: 600, textAlign: 'center' }}>🐉 {L.paradeSoon}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'min(20px, 3vw)' }}>
        <SparklePuppet ref={sparkle} height="min(300px, 34vh, 40vw)" lookToward={0.5} />
        <DouDou ref={dou} height="min(260px, 30vh, 36vw)" onTap={() => void dou.current?.play('hop')} />
      </div>
      <BigButton onClick={backToMap} ariaLabel="Back to the lanterns">
        🏮 ▶
      </BigButton>
    </div>
  )
}

// Australia: "Pip's G'day Party". Five spots on the map in any order; each gives a stamp and a party guest.
// Once every stamp is collected, the sunset party at the Sydney Opera House is the finale.
import { motion } from 'motion/react'
import { useEffect, useState, type ComponentType } from 'react'
import { say, sounds } from '../../../sdk'
import { FitBox } from '../../kit/Chrome'
import { StampEarned } from '../../kit/StampEarned'
import { StoryBeat } from '../../kit/StoryBeat'
import type { PlaceProps } from '../../types'
import { Forest } from './activities/Forest'
import { Outback } from './activities/Outback'
import { Party } from './activities/Party'
import { Postcard } from './activities/Postcard'
import { Reef } from './activities/Reef'
import { StarryFlag } from './activities/StarryFlag'
import { art } from './art'
import { L } from './lines'

export interface ActivityProps {
  onDone: () => void
  setProgress: (done: number, total: number) => void
}

const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = { outback: Outback, forest: Forest, reef: Reef, stars: StarryFlag, postcard: Postcard }

/** Which guest each stamp brings to the party. */
export const GUESTS: Record<string, { img: string; line: string; name: string }> = {
  outback: { img: art.mama, line: L.party.mama, name: 'Mama Kangaroo' },
  forest: { img: art.koalaAwake, line: L.party.koko, name: 'Koko' },
  reef: { img: art.turtle, line: L.party.shelly, name: 'Shelly' },
  stars: { img: art.kookaburra, line: L.party.kooky, name: 'Kooky' },
  postcard: { img: art.platypus, line: L.party.pat, name: 'Pat' },
}

export default function Place(props: PlaceProps) {
  const { meta, activity, stamps, backToMap, earnStamp, setProgress, onWin } = props
  const [justEarned, setJustEarned] = useState<string | null>(null)

  if (activity === 'party') {
    const ready = meta.activities.every((a) => stamps.includes(a.id))
    if (!ready) return <Hub {...props} />
    return <Party guests={meta.activities.map((a) => GUESTS[a.id])} setProgress={setProgress} onDone={onWin} />
  }

  const Activity = activity ? ACTIVITIES[activity] : undefined
  const info = meta.activities.find((a) => a.id === activity)
  if (Activity && info) {
    return (
      <>
        <Activity
          key={activity}
          setProgress={setProgress}
          onDone={() => {
            earnStamp(info.id)
            setJustEarned(info.id)
          }}
        />
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

// Pip introduces herself once per visit to the app, not every time she comes back to the map.
let introSeen = false

function Hub({ meta, stamps, openActivity }: PlaceProps) {
  const [intro, setIntro] = useState(stamps.length === 0 && !introSeen)
  const allDone = meta.activities.every((a) => stamps.includes(a.id))

  useEffect(() => {
    if (intro) return
    void say(allDone ? L.hubParty : stamps.length === 0 ? L.hubFirst : L.hubNext)
  }, [intro, allDone, stamps.length])

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#86CDF9', padding: 'var(--top-clear) 12px calc(var(--safe-bottom) + 12px)', display: 'flex' }}>
      <div className="world-split" style={{ flex: 1, minHeight: 0, gap: 'min(14px, 2vh)', alignItems: 'center' }}>
        <FitBox ratio={1.5}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', border: '5px solid #fff', boxShadow: 'var(--shadow)', background: `url(${art.map}) center / cover` }} />
          {meta.activities.map((a, i) => {
            const done = stamps.includes(a.id)
            return (
              <motion.button
                key={a.id}
                aria-label={a.name}
                initial={{ scale: 0 }}
                animate={{ scale: 1, y: done ? 0 : [0, -8, 0] }}
                transition={{ scale: { delay: i * 0.08, type: 'spring' }, y: { repeat: Infinity, duration: 1.4, delay: i * 0.2 } }}
                whileTap={{ scale: 0.85 }}
                className={done ? undefined : 'world-glow'}
                onClick={() => {
                  sounds.pop()
                  openActivity(a.id)
                }}
                style={{
                  position: 'absolute',
                  left: `${a.pos.x}%`,
                  top: `${a.pos.y}%`,
                  translate: '-50% -50%',
                  width: 'clamp(60px, 13cqw, 118px)',
                  aspectRatio: '1',
                  borderRadius: '50%',
                  background: done ? 'var(--cream)' : '#fff',
                  border: done ? '5px dashed var(--hotpink)' : '5px solid var(--gold)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 'clamp(28px, 6cqw, 56px)',
                  rotate: done ? '-10deg' : '0deg',
                }}
              >
                {done ? <img src={a.sticker.img} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} /> : a.icon}
                {done && <span style={{ position: 'absolute', right: '-12%', top: '-12%', fontSize: '50%' }}>✅</span>}
              </motion.button>
            )
          })}
        </FitBox>
        <PartyPanel stamps={stamps} total={meta.activities.length} onOpen={() => (allDone ? openActivity('party') : void say(L.partyLocked))} ready={allDone} order={meta.activities.map((a) => a.id)} />
      </div>
      {intro && (
        <StoryBeat
          lines={L.intro}
          img={art.pip}
          bg={art.bgOpera}
          onDone={() => {
            introSeen = true
            setIntro(false)
          }}
        />
      )}
    </div>
  )
}

/** The Opera House party fills up with a new friend for every stamp she earns. */
function PartyPanel({ stamps, total, ready, onOpen, order }: { stamps: string[]; total: number; ready: boolean; onOpen: () => void; order: string[] }) {
  return (
    <motion.button
      aria-label="Party"
      whileTap={{ scale: 0.95 }}
      animate={ready ? { scale: [1, 1.04, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.2 }}
      onClick={() => {
        sounds.pop()
        onOpen()
      }}
      className={`party-panel${ready ? ' world-glow' : ''}`}
      style={{
        position: 'relative',
        flexShrink: 0,
        borderRadius: 28,
        border: `5px solid ${ready ? 'var(--gold)' : '#fff'}`,
        boxShadow: 'var(--shadow)',
        background: `url(${art.bgOpera}) center / cover`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 8,
      }}
    >
      <div style={{ position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', justifyContent: 'center', gap: 4 }}>
        {order.map((id) => (
          <span key={id} style={{ fontSize: 'clamp(18px, 3vmin, 28px)', filter: stamps.includes(id) ? 'none' : 'grayscale(1) opacity(0.4)' }}>
            ⭐
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', gap: 2 }}>
        <img src={art.pip} alt="" style={{ height: 'clamp(54px, 11vmin, 110px)' }} />
        {order
          .filter((id) => stamps.includes(id))
          .map((id) => (
            <motion.img key={id} src={GUESTS[id].img} alt="" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ height: 'clamp(44px, 9vmin, 90px)' }} />
          ))}
      </div>
      <div style={{ background: ready ? 'var(--hotpink)' : 'rgba(255,255,255,0.9)', color: ready ? '#fff' : 'var(--ink)', borderRadius: 999, padding: '4px 16px', marginTop: 6, fontWeight: 700, fontSize: 'clamp(18px, 3vmin, 28px)' }}>
        {ready ? '🎉 Party!' : `🎉 ${stamps.length}/${total}`}
      </div>
    </motion.button>
  )
}

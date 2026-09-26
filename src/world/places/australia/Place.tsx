// Australia: "Pip's G'day Party". Six spots on the map in any order; each gives a stamp and a party guest.
// Once every stamp is collected, the sunset party at the Sydney Opera House is the finale.
import { motion } from 'motion/react'
import { createElement, useEffect, useState, type ComponentType, type ReactNode, type Ref } from 'react'
import { Buddy, say, sounds, type Line, type PuppetHandle } from '../../../sdk'
import { FitBox } from '../../kit/Chrome'
import { StampEarned } from '../../kit/StampEarned'
import { StoryBeat } from '../../kit/StoryBeat'
import { VideoBreak } from '../../kit/Theater'
import type { PlaceProps, PlaceVideo } from '../../types'
import { Croc } from './activities/Croc'
import { Forest } from './activities/Forest'
import { Outback } from './activities/Outback'
import { Party } from './activities/Party'
import { Postcard } from './activities/Postcard'
import { Reef } from './activities/Reef'
import { StarryFlag } from './activities/StarryFlag'
import { art } from './art'
import { L } from './lines'
import { Chompy } from './puppets/Chompy'
import { Koko } from './puppets/Koko'
import { Mama } from './puppets/Mama'
import { Pip } from './puppets/Pip'

export interface ActivityProps {
  onDone: () => void
  setProgress: (done: number, total: number) => void
}

const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = { outback: Outback, forest: Forest, reef: Reef, stars: StarryFlag, croc: Croc, postcard: Postcard }

export interface Guest {
  img: string
  line: Line
  name: string
  /** The live character at the party (a puppet, or a Buddy for the flat sprites). */
  render: (ref: Ref<PuppetHandle>, height: string) => ReactNode
  /** Size of what `render` draws, relative to the height it is given: width and height (so the party can stand
   *  everyone on the promenade without overlapping). */
  box: [w: number, h: number]
  /** Low, wide friends stand in the front row at the party, upright ones behind them. */
  row: 'front' | 'back'
}
const buddy = (img: string, voice: string) => (ref: Ref<PuppetHandle>, height: string) => createElement(Buddy, { ref, img, voice, height })

/** Which guest each stamp brings to the party. */
export const GUESTS: Record<string, Guest> = {
  outback: { img: art.mama, line: L.party.mama, name: 'Mama Kangaroo', row: 'back', box: [0.87, 1.3], render: (ref, height) => createElement(Mama, { ref, height: `calc(${height} * 1.3)` }) },
  forest: { img: art.koalaAwake, line: L.party.koko, name: 'Koko', row: 'back', box: [1.02, 1], render: (ref, height) => createElement(Koko, { ref, height }) },
  reef: { img: art.turtle, line: L.party.shelly, name: 'Shelly', row: 'front', box: [1.38, 1], render: buddy(art.turtle, 'shelly') },
  stars: { img: art.kookaburra, line: L.party.kooky, name: 'Kooky', row: 'back', box: [0.96, 1], render: buddy(art.kookaburra, 'kooky') },
  croc: { img: art.croc, line: L.party.chompy, name: 'Chompy', row: 'front', box: [1.44, 0.8], render: (ref, height) => createElement(Chompy, { ref, height: `calc(${height} * 0.8)`, babies: 2 }) },
  postcard: { img: art.platypus, line: L.party.pat, name: 'Pat', row: 'front', box: [1.15, 1], render: buddy(art.platypus, 'pat') },
}

export default function Place(props: PlaceProps) {
  const { meta, activity, stamps, backToMap, earnStamp, setProgress, onWin } = props
  const [justEarned, setJustEarned] = useState<string | null>(null)
  const [videoAfter, setVideoAfter] = useState<PlaceVideo | null>(null)

  if (activity === 'party') {
    const ready = meta.activities.every((a) => stamps.includes(a.id))
    if (!ready) return <Hub {...props} />
    return <Party guests={meta.activities.map((a) => GUESTS[a.id])} setProgress={setProgress} onDone={onWin} />
  }

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
              // A real-world video about what she just played comes next (skippable), then the map.
              const video = meta.videos?.find((v) => v.after === info.id)
              if (video) {
                setProgress(0, 0) // hides the activity's stars so they don't sit on the video
                setVideoAfter(video)
              }
              else backToMap()
            }}
          />
        )}
        {videoAfter && (
          <VideoBreak
            video={videoAfter}
            onDone={() => {
              setVideoAfter(null)
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
                transition={{ scale: { delay: i * 0.06, type: 'spring' }, y: { repeat: Infinity, duration: 1.4, delay: i * 0.2 } }}
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
          friend={<Pip height="100%" />}
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
        background: `url(${art.bgOpera}) center bottom / cover`,
        overflow: 'hidden',
        containerType: 'size',
        padding: 0,
      }}
    >
      <div style={{ position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          {order.map((id) => (
            <span key={id} style={{ fontSize: 'clamp(18px, 3vmin, 28px)', filter: stamps.includes(id) ? 'none' : 'grayscale(1) opacity(0.4)' }}>
              ⭐
            </span>
          ))}
        </div>
        <div style={{ background: ready ? 'var(--hotpink)' : 'rgba(255,255,255,0.9)', color: ready ? '#fff' : 'var(--ink)', borderRadius: 999, padding: '4px 16px', fontWeight: 700, fontSize: 'clamp(18px, 3vmin, 28px)', boxShadow: 'var(--shadow)' }}>
          {ready ? '🎉 Party!' : `🎉 ${stamps.length}/${total}`}
        </div>
      </div>
      {/* Feet on the promenade: the picture is anchored to the bottom, and the tiles are its bottom ~15%. If the friends
          need a second row, it stands just behind the first (overlapping, not floating up by the railing). */}
      <div style={{ ['--h' as string]: 'min(90px, 26cqh, 21cqw)', position: 'absolute', left: 4, right: 4, bottom: 'max(6cqh, 4cqw)', display: 'flex', flexWrap: 'wrap-reverse', justifyContent: 'center', alignItems: 'flex-end', columnGap: 2 }}>
        {[{ id: 'pip', img: art.pip, scale: 1.2 }, ...order.filter((id) => stamps.includes(id)).map((id) => ({ id, img: GUESTS[id].img, scale: 1 }))].map((f, i) => (
          <motion.img
            key={f.id}
            src={f.img}
            alt=""
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ height: `calc(var(--h) * ${f.scale})`, marginTop: 'calc(var(--h) * -0.6)', position: 'relative', zIndex: 10 - i, transformOrigin: '50% 100%' }}
          />
        ))}
      </div>
    </motion.button>
  )
}

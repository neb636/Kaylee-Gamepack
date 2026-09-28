// Egypt: "Miu's Pyramid Light Show". Six spots on the map in any order; each gives a stamp and a friend for the show.
// Once every stamp is collected, the night-time light show at the pyramids of Giza is the finale.
import { motion } from 'motion/react'
import { createElement, useEffect, useState, type ComponentType, type ReactNode, type Ref } from 'react'
import { Buddy, say, sounds, type Line, type PuppetHandle } from '../../../sdk'
import { FitBox } from '../../kit/Chrome'
import { StampEarned } from '../../kit/StampEarned'
import { StoryBeat } from '../../kit/StoryBeat'
import { VideoBreak } from '../../kit/Theater'
import type { PlaceProps, PlaceVideo } from '../../types'
import { LightShow } from './activities/LightShow'
import { Market } from './activities/Market'
import { Nile } from './activities/Nile'
import { Passage } from './activities/Passage'
import { Pyramid } from './activities/Pyramid'
import { Scribe } from './activities/Scribe'
import { Sphinx } from './activities/Sphinx'
import { art } from './art'
import { L } from './lines'
import { Jamal } from './puppets/Jamal'
import { Miu } from './puppets/Miu'
import { Sphinx as SphinxPuppet } from './puppets/Sphinx'
import { Tutu } from './puppets/Tutu'

export interface ActivityProps {
  onDone: () => void
  setProgress: (done: number, total: number) => void
}

const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = { pyramid: Pyramid, passage: Passage, sphinx: Sphinx, nile: Nile, scribe: Scribe, market: Market }

export interface Guest {
  img: string
  line: Line
  name: string
  /** The live character at the show (a puppet, or a Buddy for the flat sprites). */
  render: (ref: Ref<PuppetHandle>, height: string) => ReactNode
  /** Width and height of what `render` draws, relative to the height it is given. */
  box: [w: number, h: number]
}
const buddy = (img: string, voice: string) => (ref: Ref<PuppetHandle>, height: string) => createElement(Buddy, { ref, img, voice, height })

/** Which friend each stamp brings to the light show. */
export const GUESTS: Record<string, Guest> = {
  pyramid: { img: art.jamal, line: L.show.jamal, name: 'Jamal', box: [1.1, 1.1], render: (ref, height) => createElement(Jamal, { ref, height }) },
  passage: { img: art.tutu, line: L.show.tutu, name: 'Tutu', box: [0.75, 1], render: (ref, height) => createElement(Tutu, { ref, height }) },
  sphinx: { img: art.sphinx, line: L.show.sphinx, name: 'The Sphinx', box: [1.5, 1], render: (ref, height) => createElement(SphinxPuppet, { ref, height }) },
  nile: { img: art.hippo, line: L.show.hippo, name: 'Hippo', box: [1, 0.85], render: buddy(art.hippo, 'hippo') },
  scribe: { img: art.ibis, line: L.show.ibis, name: 'Ibis', box: [0.9, 1], render: buddy(art.ibis, 'ibis') },
  market: { img: art.fennec, line: L.show.fennec, name: 'Fennec', box: [0.85, 0.8], render: buddy(art.fennec, 'fennec') },
}

export default function Place(props: PlaceProps) {
  const { meta, activity, stamps, backToMap, earnStamp, setProgress, onWin } = props
  const [justEarned, setJustEarned] = useState<string | null>(null)
  const [videoAfter, setVideoAfter] = useState<PlaceVideo | null>(null)

  if (activity === 'party') {
    const ready = meta.activities.every((a) => stamps.includes(a.id))
    if (!ready) return <Hub {...props} />
    return <LightShow guests={meta.activities.map((a) => GUESTS[a.id])} setProgress={setProgress} onDone={onWin} />
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
                setProgress(0, 0)
                setVideoAfter(video)
              } else backToMap()
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

// Miu introduces herself once per visit to the app, not every time she comes back to the map.
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
        <ShowPanel stamps={stamps} total={meta.activities.length} onOpen={() => (allDone ? openActivity('party') : void say(L.partyLocked))} ready={allDone} order={meta.activities.map((a) => a.id)} />
      </div>
      {intro && (
        <StoryBeat
          lines={L.intro}
          friend={<Miu height="100%" />}
          bg={art.bgGizaDay}
          onDone={() => {
            introSeen = true
            setIntro(false)
          }}
        />
      )}
    </div>
  )
}

/** The pyramids at night: a new friend joins the light show for every stamp she earns. */
function ShowPanel({ stamps, total, ready, onOpen, order }: { stamps: string[]; total: number; ready: boolean; onOpen: () => void; order: string[] }) {
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
        background: `url(${art.bgGizaNight}) 30% 60% / cover`,
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
          {ready ? '✨ Light show!' : `✨ ${stamps.length}/${total}`}
        </div>
      </div>
      {/* Friends on the sand in front of the pyramids. */}
      <div style={{ ['--h' as string]: 'min(90px, 26cqh, 21cqw)', position: 'absolute', left: 4, right: 4, bottom: 'max(5cqh, 3cqw)', display: 'flex', flexWrap: 'wrap-reverse', justifyContent: 'center', alignItems: 'flex-end', columnGap: 2 }}>
        {[{ id: 'miu', img: art.miu, scale: 1 }, ...order.filter((id) => stamps.includes(id)).map((id) => ({ id, img: GUESTS[id].img, scale: 1 }))].map((f, i) => (
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

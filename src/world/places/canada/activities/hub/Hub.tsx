// Canada's home base: the toy-table map and the Maple Leaf Train (map/map.ts). She pushes the train across the country;
// at a stop, that stop's two activities pop up over the station as big round bubbles (in the works: they wiggle; Ottawa's
// 🏒 opens the finale once the whole team is there). The address bar follows the train (sections.ts: where it stopped).
//
// The first visit: Maple waits on Quebec City's platform and tells the story in two lines (tap anywhere skips), hops
// into the train, and Sparkle says to push it. Then Maple says hello at each stop and reacts to what they ride through,
// Sparkle gives a hint (and a hand points) after a while with nothing touched, and every animal she pokes goes into
// Maple's book (meet()). Her hockey team skates on Ottawa's canal: one friend per stamp. This file does the talking;
// the world (map.ts) only says what happened.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { lineText, lineVoice, say, stopSpeaking, useAlive, wait, type Line } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import type { PlaceProps } from '../../../../types'
import { Anchors } from '../../../../engine3d/Anchors'
import type { AnchorInput } from '../../../../engine3d/View3D'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import type { AnimalId } from '../../book/animals'
import { Book } from '../../book/Book'
import { meet } from '../../book/met'
import { L } from '../../lines'
import type { Region } from '../../map/canada'
import { STOPS } from '../../map/canada'
import { CanadaMap, MAP_ANCHORS, type MapEvents } from '../../map/map'
import { Guide, type GuideHandle } from './Guide'
import HUB_SECTIONS from './sections'

const WHERE: Record<Region, string> = {
  msa: '⛰️ Mont-Sainte-Anne',
  quebec: '🏰 Quebec City',
  ottawa: '🏒 Ottawa',
  forest: '🌲 The forests and lakes',
  prairies: '🌾 The prairies',
  rockies: '🏔️ The Rocky Mountains',
  banff: '🛶 Banff',
  bc: '🐋 Vancouver, by the Pacific Ocean',
}

/** Who goes into Maple's book when she pokes them on the map. */
const MEETS: Record<string, AnimalId> = {
  'animal:moose': 'moose',
  'animal:bison': 'bison',
  'animal:geese': 'canada-goose',
  'poke:flock': 'canada-goose',
  'poke:polar': 'polar-bear',
  'poke:orca': 'orca',
  'poke:beluga': 'beluga',
  'poke:mountie': 'mountie-horse',
}

// Per visit to the app (not every time she comes back to the train from an activity).
const session = {
  told: false,
  /** Where the train was when she left for an activity: she comes back to the same stop. */
  lastAt: null as Region | null,
  stamps: null as number | null,
  said: new Set<string>(),
}
const once = (key: string) => (session.said.has(key) ? false : (session.said.add(key), true))

export function Hub({ meta, openActivity, stamps }: PlaceProps) {
  const { start, param, enter } = useSections(HUB_SECTIONS)
  const alive = useAlive()
  const [initial] = useState(() => {
    const back = !start && session.lastAt
    return { at: (back ? session.lastAt : param('at')) as Region, intro: !start && !back, story: !start && !back && !session.told }
  })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [where, setWhere] = useState<Region>(initial.at)
  const worldRef = useRef<CanadaMap | null>(null)
  const at = useRef(initial.at)
  const [book, setBook] = useState(start === 'book')
  useEffect(() => enter(book ? 'book' : 'map', { at: at.current, team: teamParam }), [book])

  const allDone = meta.activities.every((a) => stamps.includes(a.id))
  const ready = useRef(new Set([...meta.activities.map((a) => a.id), ...(allDone ? ['party'] : [])]))
  // Her hockey team: one friend per stamp (or the link's `team`, to see it without playing everything).
  const teamParam = param('team')
  const team = useRef(teamParam ? teamParam.split(',').filter(Boolean) : stamps.slice())
  const icons = Object.fromEntries([...meta.activities, ...(meta.inTheWorks ?? [])].map((a) => [a.id, { icon: a.icon, name: a.name }]))
  icons.party = { icon: '🏒', name: 'Animal Homes + Pond Hockey' }

  // ---- Talking: one line at a time, Sparkle's words beside her, a friend's at the bottom.
  const guide = useRef<GuideHandle>(null)
  const [sparkleLine, setSparkleLine] = useState<Line | null>(null)
  const [friendLine, setFriendLine] = useState<Line | null>(null)
  const lastSparkle = useRef<Line>(L.hub.push)
  const gen = useRef(0)
  const queue = useRef<Promise<void>>(Promise.resolve())
  const lastTalk = useRef(0)
  const talk = (l: Line, now = false) => {
    if (now) {
      gen.current++
      stopSpeaking()
      queue.current = Promise.resolve()
    }
    const g = gen.current
    const run = async () => {
      if (g !== gen.current || !alive()) return
      const sparkle = lineVoice(l) === 'sparkle'
      const show = sparkle ? setSparkleLine : setFriendLine
      show(l)
      if (sparkle) {
        lastSparkle.current = l
        guide.current?.wave()
      }
      // (Long enough to read if a clip is missing.)
      await Promise.all([say(l, { interrupt: false }), wait(700 + lineText(l).length * 40)])
      lastTalk.current = performance.now()
      setTimeout(() => show((cur) => (cur === l ? null : cur)), 1400)
    }
    queue.current = queue.current.then(run)
    return queue.current
  }

  // ---- The story (the first visit).
  const story = useRef({ on: initial.story, talking: false })
  const endStory = (skipped: boolean) => {
    if (!story.current.on) return
    story.current.on = false
    if (skipped) {
      gen.current++
      stopSpeaking()
      setFriendLine(null)
    }
    worldRef.current?.board()
    window.setTimeout(() => {
      if (!alive() || worldRef.current?.pushing) return
      worldRef.current?.hint('train')
      void talk(L.hub.push)
    }, skipped ? 200 : 0)
  }
  useEffect(() => {
    if (!initial.story) return
    session.told = true
    const play = async () => {
      // The whole country first, then the camera glides down to the train and Maple.
      await wait(2700)
      if (!story.current.on || !alive()) return
      story.current.talking = true
      worldRef.current?.mapleDoes('wave')
      await talk(L.hub.story[0])
      if (!story.current.on) return
      worldRef.current?.mapleDoes('hop')
      await talk(L.hub.story[1])
      endStory(false)
    }
    void play()
    // Tap anywhere skips (once Maple is talking).
    const skip = () => story.current.talking && endStory(true)
    window.addEventListener('pointerdown', skip, true)
    return () => window.removeEventListener('pointerdown', skip, true)
  }, [])

  // ---- Back from an activity with a new stamp: a new friend on the team.
  useEffect(() => {
    if (session.stamps !== null && stamps.length > session.stamps) window.setTimeout(() => alive() && void talk(L.hub.newFriend), 900)
    session.stamps = stamps.length
  }, [])

  const hints = useRef(0)
  const mapleTaps = useRef(0)
  const lastSoon = useRef(0)
  const events = useRef<MapEvents>({
    where: (r) => {
      setWhere(r)
      const ride = L.hub.ride[r as keyof typeof L.hub.ride]
      if (ride && !story.current.on && once(`ride:${r}`)) void talk(ride)
    },
    stopped: (r) => {
      at.current = r
      enter('map', { at: r, team: teamParam })
    },
    open: (id) => {
      session.lastAt = worldRef.current?.litStopId ?? at.current
      gen.current++
      stopSpeaking()
      openActivity(id)
    },
    soon: (act) => {
      if (performance.now() - lastSoon.current < 2500) return
      lastSoon.current = performance.now()
      void talk(act === 'party' ? L.hub.locked : L.hub.soon, true)
    },
    arrived: (stop) => {
      if (story.current.on) return
      const line = L.hub.arrive[stop as keyof typeof L.hub.arrive]
      if (line && once(`arrive:${stop}`)) void talk(line)
      if (stop === 'ottawa' && team.current.length && once('team')) void talk(allDone ? L.hub.teamAll : L.hub.teamHere)
      if (once('bubbles')) {
        worldRef.current?.hint('bubble')
        void talk(L.hub.bubbles)
      }
    },
    tunnel: () => {
      if (once('ride:tunnel')) void talk(L.hub.ride.tunnel)
    },
    blocked: (kind) => {
      if (once(`blocked:${kind}`)) void talk(L.hub.blocked[kind])
      if (once('tapIt')) void talk(L.hub.tapIt)
    },
    poked: (id) => {
      if (id === 'animal:moose') void talk(L.hub.sorry, true)
      const animal = MEETS[id.replace(/:off$/, '')]
      if (animal) meet(animal)
      const fact = L.hub.pokes[id.slice(5) as keyof typeof L.hub.pokes]
      if (id.startsWith('poke:') && fact && once(id)) void talk(fact, true)
      if (id.startsWith('team:')) {
        const cheer = L.hub.team[id.slice(5) as keyof typeof L.hub.team]
        if (cheer) void talk(cheer, true)
      }
      if (id === 'maple') void talk(L.hub.maple[mapleTaps.current++ % L.hub.maple.length], true)
    },
    idle: (what) => {
      if (story.current.on || performance.now() - lastTalk.current < 6000 || hints.current >= 5) return
      hints.current++
      worldRef.current?.hint(what)
      void talk(what === 'train' ? L.hub.push : L.hub.bubbles)
    },
    pushed: () => {
      if (story.current.talking) endStory(true)
    },
  })

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E3F3FF', overflow: 'clip' }}>
      <View3D
        key={engine}
        name="The train map"
        qaKey="__canadaMapQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new CanadaMap(renderer, { at: at.current, intro: initial.intro, story: story.current.on, team: team.current }, events.current, ready.current)}
        anchors={(input, els) => (
          <>
            <Anchors list={MAP_ANCHORS} els={els} {...input} />
            <Bubbles input={input} els={els} icons={icons} />
            <Hand els={els} />
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(227,243,255,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🚂 Tap to wake the train
        </button>
      )}
      <Guide ref={guide} line={sparkleLine} onTap={() => void talk(lastSparkle.current, true)} />
      <button
        aria-label="Maple's animal book"
        onClick={() => setBook(true)}
        style={{ position: 'absolute', right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', zIndex: 25, width: 'var(--target)', height: 'var(--target)', borderRadius: 24, border: '5px solid #C98A55', background: '#FFF6E6', boxShadow: 'var(--shadow)', fontSize: 'clamp(34px, 5vmin, 48px)', display: 'grid', placeItems: 'center' }}
      >
        📒
      </button>
      {book && <Book onClose={() => setBook(false)} />}
      <div style={{ position: 'absolute', left: 'calc(min(120px, 16vh, 24vw) + 24px)', right: 'calc(var(--target) + 28px)', bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
        <AnimatePresence mode="popLayout">
          {friendLine ? (
            <motion.div key={`say-${lineText(friendLine)}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={{ ...PILL, background: '#FFF6E6', border: '4px solid #C98A55' }}>
              {lineVoice(friendLine) === 'maple' ? '🦫 ' : ''}
              {lineText(friendLine)}
            </motion.div>
          ) : (
            <motion.div key={where} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
              {WHERE[where]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** Each stop's activities, as big round bubbles over the station (the world places them while that stop is lit). */
function Bubbles({ input, els, icons }: { input: AnchorInput; els: Map<string, HTMLElement>; icons: Record<string, { icon: string; name: string }> }) {
  return (
    <>
      {STOPS.flatMap((s) => s.acts).map((id) => (
        <button
          key={id}
          ref={(el) => {
            if (el) els.set(`go:${id}`, el)
            else els.delete(`go:${id}`)
          }}
          aria-label={icons[id]?.name ?? id}
          data-anchor={`go:${id}`}
          onPointerDown={(e) => {
            e.preventDefault()
            input.onDown(e, `go:${id}`)
          }}
          onClick={(e) => e.detail === 0 && input.onKey(`go:${id}`)}
          style={{ position: 'absolute', left: 0, top: 0, display: 'none', padding: 0, border: '5px solid var(--hotpink)', borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow)', fontSize: 'clamp(34px, 5vmin, 48px)', lineHeight: 1, touchAction: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
        >
          {icons[id]?.icon ?? '❓'}
        </button>
      ))}
    </>
  )
}

/** The hint: a hand that points down at the train (or the bubbles), bobbing. The world moves it; it never takes a tap. */
function Hand({ els }: { els: Map<string, HTMLElement> }) {
  return (
    <div
      ref={(el) => {
        if (el) els.set('hint', el)
        else els.delete('hint')
      }}
      aria-hidden
      style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 9800 }}
    >
      <div style={{ transform: 'translate(-50%, -115%)', fontSize: 'clamp(44px, 7vmin, 64px)', filter: 'drop-shadow(0 3px 4px rgba(43,35,48,.3))', animation: 'canada-hand 0.9s ease-in-out infinite' }}>👇</div>
      <style>{'@keyframes canada-hand { 0%,100% { translate: 0 0 } 50% { translate: 0 14px } }'}</style>
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

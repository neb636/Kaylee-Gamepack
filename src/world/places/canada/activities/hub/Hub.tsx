// Direct activity selection on Canada’s 3D map.
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

// Keep the invitation to once per visit to the app.
const session = {
  told: false,
  /** The destination she most recently selected. */
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
    return { at: (back ? session.lastAt : param('at')) as Region }
  })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const worldRef = useRef<CanadaMap | null>(null)
  const at = useRef(initial.at)
  const [book, setBook] = useState(start === 'book')
  useEffect(() => enter(book ? 'book' : 'map', { at: at.current, team: teamParam }), [book])

  const allDone = meta.activities.every((a) => stamps.includes(a.id))
  const ready = useRef(new Set<string>())
  ready.current.clear()
  for (const activity of meta.activities) ready.current.add(activity.id)
  if (allDone) ready.current.add('party')
  // Her hockey team: one friend per stamp (or the link's `team`, to see it without playing everything).
  const teamParam = param('team')
  const team = useRef(teamParam ? teamParam.split(',').filter(Boolean) : stamps.slice())
  const icons = Object.fromEntries([...meta.activities, ...(meta.inTheWorks ?? [])].map((a) => [a.id, { icon: a.icon, name: a.name }]))
  icons.party = { icon: '🏒', name: 'Pond Hockey' }

  // ---- Talking: one line at a time, Sparkle's words beside her, a friend's at the bottom.
  const guide = useRef<GuideHandle>(null)
  const [sparkleLine, setSparkleLine] = useState<Line | null>(null)
  const [friendLine, setFriendLine] = useState<Line | null>(null)
  const lastSparkle = useRef<Line>(L.hub.bubbles)
  const gen = useRef(0)
  const queue = useRef<Promise<void>>(Promise.resolve())
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
      setTimeout(() => show((cur) => (cur === l ? null : cur)), 1400)
    }
    queue.current = queue.current.then(run)
    return queue.current
  }

  // One short invitation per visit; all pins are already available while she hears it.
  useEffect(() => {
    if (session.told) return
    const timer = window.setTimeout(() => {
      session.told = true
      void talk(L.hub.bubbles)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])
  useEffect(() => () => {
    gen.current++
    stopSpeaking()
  }, [])

  // ---- Back from an activity with a new stamp: a new friend on the team.
  useEffect(() => {
    if (session.stamps !== null && stamps.length > session.stamps) window.setTimeout(() => alive() && void talk(L.hub.newFriend), 900)
    session.stamps = stamps.length
  }, [])

  const mapleTaps = useRef(0)
  const lastSoon = useRef(0)
  const events = useRef<MapEvents>({
    open: (id) => {
      const stop = STOPS.find((s) => s.acts.includes(id))
      session.lastAt = stop?.id ?? at.current
      gen.current++
      stopSpeaking()
      openActivity(id)
    },
    soon: (act) => {
      if (performance.now() - lastSoon.current < 2500) return
      lastSoon.current = performance.now()
      void talk(act === 'party' ? L.hub.locked : L.hub.soon, true)
    },
    poked: (id) => {
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
  })

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E3F3FF', overflow: 'clip' }}>
      <View3D
        key={engine}
        name="Canada’s map"
        qaKey="__canadaMapQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new CanadaMap(renderer, { at: at.current, team: team.current }, events.current, ready.current)}
        anchors={(input, els) => (
          <>
            <Anchors list={MAP_ANCHORS} els={els} {...input} />
            <Pins input={input} els={els} icons={icons} stamps={stamps} allDone={allDone} />
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
          🍁 Tap to wake the map
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
            <motion.div key="canada" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
              🍁 Canada
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Every activity has a visible pin, with a check for a stamp already earned.
function Pins({ input, els, icons, stamps, allDone }: { input: AnchorInput; els: Map<string, HTMLElement>; icons: Record<string, { icon: string; name: string }>; stamps: string[]; allDone: boolean }) {
  return (
    <>
      {STOPS.flatMap((s) => s.acts).map((id) => (
        <div key={id}>
          <div ref={(el) => { if (el) els.set(`line:${id}`, el); else els.delete(`line:${id}`) }} aria-hidden style={{ position: 'absolute', left: 0, top: 0, height: 3, background: '#A783B8', transformOrigin: '0 50%', pointerEvents: 'none', opacity: 0.7 }} />
          <button
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
            <span style={{ position: 'absolute', top: -8, right: -5, fontSize: 24 }}>{stamps.includes(id) ? '✅' : id === 'party' && !allDone ? '🔒' : ''}</span>
            <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6, width: 'max-content', maxWidth: 'min(110px, 18vw)', padding: '3px 5px', borderRadius: 10, background: 'rgba(255,255,255,.95)', fontSize: 'clamp(11px, 1.8vmin, 16px)', lineHeight: 1.05, fontWeight: 600, color: 'var(--ink)', pointerEvents: 'none' }}>{icons[id]?.name}</span>
          </button>
        </div>
      ))}
    </>
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

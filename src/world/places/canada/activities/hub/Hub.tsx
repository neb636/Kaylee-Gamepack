// Canada's home base: the map of Canada (map/world.ts), a toy tray floating in the sky with her friends standing where
// they live. Tap a place (or its friend): the camera closes in and the chapter opens. Ottawa's rink is the story's
// home: Maple and the Cup, the geese skating rings, and every friend she has brought home standing in a row in the
// team's pink scarf. With the whole team there, the rink glows: the big game.
//
// A quiet hub (docs/voices.md): Sparkle says her one line once a visit on the first look, counts the team when a new
// friend pops in at the rink (once each), and names a few things the first time she pokes them. It never talks when
// she's idle: after ~8 s with no touch the places still to do pulse softly instead.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { lineText, lineVoice, say, sounds, stopSpeaking, useAlive, useTimers, wait, type Line } from '../../../../../sdk'
import { onDevice } from '../../../../../sdk/device'
import { Anchors } from '../../../../engine3d/Anchors'
import { MapCover } from '../../../../engine3d/MapCover'
import { View3D, type AnchorInput, type RenderMode } from '../../../../engine3d/View3D'
import { useSections } from '../../../../kit/sections'
import type { PlaceProps } from '../../../../types'
import type { AnimalId } from '../../book/animals'
import { Book } from '../../book/Book'
import { meet } from '../../book/met'
import { L } from '../../lines'
import { hubSfx } from '../../map/sounds'
import { CanadaMapWorld, MAP_ANCHORS, MAP_CAM, type MapEvents, type PlaceId, type PokeId, type Spot } from '../../map/world'
import { CHAPTERS, teamOf, TEAM, type ChapterId } from '../../story/chapters'
import { Guide, type GuideHandle } from './Guide'
import HUB_SECTIONS from './sections'

/** Who goes into Maple's book when she pokes them on the map. */
const MEETS: Partial<Record<PokeId, AnimalId>> = { geese: 'canada-goose', owl: 'snowy-owl', orca: 'orca', bison: 'bison', beluga: 'beluga' }

/** The places, east to west, as the page lists their targets. */
const PLACE_IDS: PlaceId[] = ['bike', 'snowman', 'party', 'campfire', 'canoe', 'bath', 'whales']

// Once a visit to the app: Sparkle's first line, each count, the team's cheer, each fact; and the stamps she had when
// she last looked at the map (a new one means a new friend arriving).
const session = {
  told: false,
  stamps: null as string[] | null,
  counted: new Set<number>(),
  facts: new Set<string>(),
}

export function Hub({ meta, openActivity, stamps }: PlaceProps) {
  const timers = useTimers()
  const alive = useAlive()
  const { start, param, enter } = useSections(HUB_SECTIONS)
  const [book, setBook] = useState(start === 'book')
  // Who stands at the rink (the link's team, or one friend per stamp), and who is arriving.
  const [setup] = useState(() => {
    const asked = param('team')
    const list = asked === 'all' ? [...CHAPTERS] : asked === 'none' ? [] : asked ? asked.split(',') : teamOf(stamps)
    let arriving = (param('new') || null) as ChapterId | null
    if (!arriving && !asked && session.stamps) {
      const fresh = teamOf(stamps).filter((c) => !session.stamps!.includes(c))
      arriving = fresh[fresh.length - 1] ?? null
    }
    session.stamps = stamps.slice()
    const team = CHAPTERS.filter((c) => list.includes(c) || c === arriving)
    return { team, arriving, asked }
  })
  const whole = setup.team.length === CHAPTERS.length
  useEffect(() => enter(book ? 'book' : 'map', setup.asked ? { team: setup.asked } : {}), [book])

  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const worldRef = useRef<CanadaMapWorld | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [picked, setPicked] = useState<PlaceId | null>(null)
  const lastTouch = useRef(performance.now() + 3000)

  // ---- Talking: one line at a time, Sparkle's words beside her, a friend's at the bottom.
  const guide = useRef<GuideHandle>(null)
  const [sparkleLine, setSparkleLine] = useState<Line | null>(null)
  const [friendLine, setFriendLine] = useState<Line | null>(null)
  const lastSparkle = useRef<Line>(L.hub.first)
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
      timers.later(() => show((cur) => (cur === l ? null : cur)), 1400)
    }
    queue.current = queue.current.then(run)
    return queue.current
  }
  const once = (key: string, l: Line) => {
    if (session.facts.has(key)) return
    session.facts.add(key)
    void talk(l, true)
  }
  useEffect(
    () => () => {
      gen.current++
      stopSpeaking()
    },
    [],
  )
  // The breeze under the map.
  useEffect(() => hubSfx.wind(), [])

  useEffect(() => {
    // (If the board never draws, the cover still goes.)
    const safety = timers.later(() => setRevealed(true), 6000)
    return () => clearTimeout(safety)
  }, [])

  // Once she can see the board: the new friend's count (or the whole team, and the rink), else the first line.
  useEffect(() => {
    if (!revealed) return
    lastTouch.current = Math.max(lastTouch.current, performance.now() + 3000)
    const n = setup.team.length
    if (setup.arriving) {
      timers.later(() => {
        if (n < CHAPTERS.length) {
          if (!session.counted.has(n)) {
            session.counted.add(n)
            void talk(L.hub.count[n - 1])
          }
        } else if (!session.counted.has(n)) {
          session.counted.add(n)
          void talk(L.hub.all)
          void talk(L.hub.rink)
        }
      }, 1500)
    } else if (!session.told) {
      session.told = true
      timers.later(() => void talk(whole ? L.hub.rink : L.hub.first), 500)
    }
    // After ~8 s with nothing touched the places still to do pulse. No voice: it's a quiet hub.
    const idle = timers.every(() => {
      if (performance.now() - lastTouch.current > 8000) worldRef.current?.setHint(true)
    }, 1000)
    return () => clearInterval(idle)
  }, [revealed])

  useEffect(() => worldRef.current?.setGlow(whole), [engine])

  const lockedTaps = useRef(0)
  const gusTaps = useRef(0)
  const events = useRef<MapEvents>(null!)
  events.current = {
    revealed: () => setRevealed(true),
    touched: () => {
      lastTouch.current = performance.now()
      worldRef.current?.setHint(false)
    },
    pick: (id) => {
      setPicked(id)
      gen.current++
      stopSpeaking()
      timers.later(() => sounds.sparkle(), 120)
      // The camera closes in, then it opens.
      timers.later(() => openActivity(id), 650)
    },
    locked: () => {
      // Maple: the team isn't whole yet (and now and then a word of her own); the places still to do bounce.
      const n = lockedTaps.current++
      void talk(n % 2 === 0 ? L.hub.locked : L.hub.maple[(n >> 1) % L.hub.maple.length], true)
    },
    team: (id) => void talk(L.hub.team[id], true),
    poked: (id) => {
      const animal = MEETS[id]
      if (animal) meet(animal)
      if (id === 'geese') void talk(L.hub.gus[gusTaps.current++ % L.hub.gus.length], true)
      if (id === 'balloon') once('balloon', L.hub.pokes.balloon)
    },
    spot: (id: Spot) => once(id, L.hub.pokes[id]),
  }

  const acts = Object.fromEntries([...meta.activities, ...(meta.inTheWorks ?? [])].map((a) => [a.id, a.name]))
  const label = (id: PlaceId) => (id === 'party' ? 'Pond Hockey' : `${acts[id] ?? id}: ${TEAM[id as ChapterId].name}`)

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#CFE9FF', overflow: 'clip' }}>
      <View3D
        key={engine}
        name="The map of Canada"
        qaKey="__canadaMapQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => {
          const world = new CanadaMapWorld(
            renderer,
            {
              pick: (id) => events.current.pick(id),
              locked: () => events.current.locked(),
              team: (id) => events.current.team(id),
              poked: (id) => events.current.poked(id),
              spot: (id) => events.current.spot(id),
              touched: () => events.current.touched(),
              revealed: () => events.current.revealed(),
            },
            setup.team,
            setup.arriving,
          )
          world.setGlow(whole)
          return world
        }}
        anchors={(input, els) => (
          <>
            <Anchors list={MAP_ANCHORS} els={els} {...input} />
            <PlaceTargets input={input} els={els} label={label} picked={picked} />
          </>
        )}
      />
      {/* The same screen as the place's loading screen (PlaceFrame), so the cut from it is invisible. */}
      <MapCover show={!revealed && mode !== 'lost'} fade={MAP_CAM.fade} />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(227,243,255,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🍁 {onDevice('Tap to wake the map', 'Click to wake the map')}
        </button>
      )}
      <Guide ref={guide} line={sparkleLine} onTap={() => void talk(lastSparkle.current, true)} />
      <button
        aria-label="Maple's animal book"
        onClick={() => setBook(true)}
        style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 14px)', bottom: 'calc(var(--safe-bottom) + 14px)', zIndex: 25, width: 64, height: 64, borderRadius: 20, border: '4px solid #C98A55', background: '#FFF6E6', boxShadow: 'var(--shadow)', fontSize: 32, display: 'grid', placeItems: 'center', padding: 0 }}
      >
        📒
      </button>
      {book && <Book onClose={() => setBook(false)} />}
      <div style={{ position: 'absolute', left: 'calc(min(120px, 16vh, 24vw) + 24px)', right: 92, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
        <AnimatePresence>
          {friendLine && (
            <motion.div key={`say-${lineText(friendLine)}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
              {lineText(friendLine)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** The places' tap targets: see-through buttons the world keeps over each diorama and its friend. The rink's is the
 *  big game's (`data-finale`). */
function PlaceTargets({ input, els, label, picked }: { input: AnchorInput; els: Map<string, HTMLElement>; label: (id: PlaceId) => string; picked: PlaceId | null }) {
  return (
    <>
      {PLACE_IDS.map((id) => (
        <button
          key={id}
          ref={(el) => {
            if (el) els.set(`go:${id}`, el)
            else els.delete(`go:${id}`)
          }}
          aria-label={label(id)}
          data-anchor={`go:${id}`}
          data-activity={id}
          data-finale={id === 'party' || undefined}
          data-picked={picked === id || undefined}
          onPointerDown={(e) => {
            e.preventDefault()
            input.onDown(e, `go:${id}`)
          }}
          onClick={(e) => e.detail === 0 && input.onKey(`go:${id}`)}
          style={{ position: 'absolute', left: 0, top: 0, display: 'none', padding: 0, border: 'none', borderRadius: 28, background: 'transparent', touchAction: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
        />
      ))}
    </>
  )
}

const PILL = {
  background: '#FFF6E6',
  border: '4px solid #C98A55',
  color: 'var(--ink)',
  borderRadius: 999,
  padding: '8px 20px',
  fontSize: 'clamp(16px, 2.4vmin, 22px)',
  fontWeight: 600,
  boxShadow: 'var(--shadow)',
  textAlign: 'center' as const,
  maxWidth: '100%',
}

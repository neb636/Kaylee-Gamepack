// Emperor Huddle: carry the cold emperor dads into the middle of the huddle, keep Papa's egg warm until Pebble hatches,
// then Papa sings Pebble his song (world.ts is the 3D world; the story and the toy are described there). The films
// either side of it (Place.tsx plays them) tell why: Papa remembers the night Pebble hatched, and this is that night.
// The address bar follows the story (sections.ts). Sparkle in the corner (kit/Guide.tsx) says what to do when each
// part starts and when she's stuck, and something true the first time it comes up; Papa and Pebble say their own
// lines (lines.ts, L.huddle). Under the huddle, a dot for each one warmed up (or each crack in the egg, each time
// Pebble is tucked back in). After Papa's song: the stamp (onDone).
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BigButton, say, type Line } from '../../../../../sdk'
import { onDevice } from '../../../../../sdk/device'
import { afterTalk, Guide, type GuideHandle } from '../../../../kit/Guide'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import HUDDLE_SECTIONS, { type HuddleSection } from './sections'
import { HUDDLE_ANCHORS, HuddleWorld, type Cue, type Fact, type HuddleEvents, type HuddleStart, type Phase } from './world'

/** Sparkle's fact for each thing that comes up (the first time). */
const FACTS: Record<Fact, Line> = {
  ...L.huddle.facts,
  seal: L.hub.pokes.seal,
  lights: L.hub.pokes.lightsSouth,
  song: L.party.song.songFact,
}

export function EmperorHuddle({ onDone }: ActivityProps) {
  const { start, param, enter } = useSections(HUDDLE_SECTIONS)
  const [run, setRun] = useState<HuddleStart & { n: number }>(() => ({
    section: (start ?? 'small') as HuddleSection,
    wind: param('wind') === 'right' ? 'right' : 'left',
    chick: param('chick') === 'hatched' ? 'hatched' : 'egg',
    n: 0,
  }))
  const [phase, setPhase] = useState<Phase>('play')
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [hint, setHint] = useState<Line | null>(null)
  const [dots, setDots] = useState<[number, number]>([0, 0])
  const [section, setSection] = useState<HuddleSection>(run.section)
  const worldRef = useRef<HuddleWorld | null>(null)
  const guide = useRef<GuideHandle>(null)
  const done = useRef(false)
  /** Cancels the payoff's stamp while it waits for the talking to finish (🔁 or leaving drops it). */
  const cancelStamp = useRef<(() => void) | null>(null)
  const thanks = useRef(0)
  // The same line twice in a row within a moment is one line (React mounts the world twice in development).
  const said = useRef({ key: '', at: 0 })
  const fresh = (key: string) => {
    const now = performance.now()
    if (said.current.key === key && now - said.current.at < 400) return false
    said.current = { key, at: now }
    return true
  }

  useEffect(() => {
    setSection(run.section)
    enter(run.section, run.section === 'song' ? {} : run.section === 'hatch' ? { wind: run.wind, chick: run.chick } : { wind: run.wind })
  }, [run])
  useEffect(
    () => () => {
      cancelStamp.current?.()
      cancelStamp.current = null
    },
    [],
  )

  const events: HuddleEvents = {
    section: (s, p) => {
      setSection(s)
      enter(s, p)
    },
    cue: (c: Cue | null, speak) => {
      if (!c) return setHint(null)
      const line = L.huddle[c]
      // (A remark, not something to do: no hint for these.)
      if (c !== 'turned' && c !== 'done' && c !== 'song') setHint(line)
      if (c === 'song') setHint(null)
      if (speak && fresh(`cue:${c}`)) guide.current?.speak(line, true)
    },
    papa: (what) => {
      if (!fresh(`papa:${what}`)) return
      const line = what === 'thanks' ? L.huddle.papa.thanks[thanks.current++ % L.huddle.papa.thanks.length] : L.huddle.papa[what]
      void say(line, { interrupt: false })
    },
    pebble: (what) => {
      if (fresh(`pebble:${what}`)) void say(L.huddle.pebble[what], { interrupt: false })
    },
    fact: (f) => guide.current?.once(`huddle:${f}`, FACTS[f], true),
    dots: (n, of) => setDots([n, of]),
    phase: (ph) => {
      setPhase(ph)
      // The payoff: the stamp and the sticker (Place.tsx), once, after the cheering has been said.
      if (ph === 'end' && !done.current) {
        done.current = true
        cancelStamp.current = afterTalk(() => {
          cancelStamp.current = null
          onDone()
        })
      }
    },
  }
  const eventsRef = useRef(events)
  eventsRef.current = events
  // (The world keeps the same handlers for its life; each one calls the latest.)
  const relay = useRef<HuddleEvents>({
    section: (...a) => eventsRef.current.section(...a),
    cue: (...a) => eventsRef.current.cue(...a),
    papa: (...a) => eventsRef.current.papa(...a),
    pebble: (...a) => eventsRef.current.pebble(...a),
    fact: (...a) => eventsRef.current.fact(...a),
    dots: (...a) => eventsRef.current.dots(...a),
    phase: (...a) => eventsRef.current.phase(...a),
  })

  const again = () => {
    cancelStamp.current?.()
    cancelStamp.current = null
    done.current = false
    setPhase('play')
    setDots([0, 0])
    setRun((r) => ({ section: 'small', wind: r.wind === 'left' ? 'right' : 'left', chick: 'egg', n: r.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1B2150', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="The emperor huddle"
        qaKey="__polesHuddleQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new HuddleWorld(renderer, run, relay.current)}
        anchors={(input, els) => <Anchors list={HUDDLE_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setRun((r) => ({ ...r, section, n: r.n + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(27,33,80,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: '#fff' }}
        >
          {onDevice('🐧 Tap to wake the penguins', '🐧 Click to wake the penguins')}
        </button>
      )}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none', zIndex: 20 }}>
        {dots[1] > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }} aria-hidden>
            {Array.from({ length: dots[1] }, (_, i) => (
              <motion.div key={`${dots[1]}-${i}`} animate={{ scale: i < dots[0] ? [1, 1.4, 1] : 1 }} style={{ width: 18, height: 18, borderRadius: 99, background: i < dots[0] ? 'var(--hotpink)' : 'rgba(255,255,255,.55)', border: '3px solid var(--ink)' }} />
            ))}
          </div>
        )}
      </div>
      {phase === 'end' && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={CORNER}>
          <BigButton onClick={again} ariaLabel="Again">
            🔁 🐧
          </BigButton>
        </motion.div>
      )}
      <Guide ref={guide} hint={phase === 'end' ? null : hint} />
    </div>
  )
}

/** The 🔁 button waits in the corner, clear of the huddle. */
const CORNER = { position: 'absolute' as const, right: 'calc(var(--safe-right, 0px) + 20px)', top: 'calc(var(--top-clear) + 12px)', zIndex: 25, pointerEvents: 'auto' as const }

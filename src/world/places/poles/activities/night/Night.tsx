// The Longest Night, the Poles' new ending (planning/around-the-world/poles-ending.md): the last chapter of Pebble's
// story, one chapter in three acts and a goodbye, with a film between each (story/nightFilms.ts, on the film stage):
//   🎬 night-in       time to fly: Mama's goodbye, Nari can't come, Papa waits in the long night
//   🎈 fly            Act 1, Hold to Fly (fly.ts): she flies the balloon down the world
//   🎬 night-lost     the storm: the balloon comes down, the memory of Papa's song, "Then we'll ALL sing it!"
//   🎶 whiteout..     Act 2, Sing in the Dark (chorus.ts): hold Pebble to sing, every friend joins in
//   🎬 night-colony   so many papas: Pola lets Pebble go the last bit on his own
//   🐧 huddle         Act 3, Through the Huddle (through.ts): lead Pebble through the huddle to Papa
//   🎬 night-sunrise  the reunion as the first sun in months comes up
//   🎬 night-goodbye  a pebble for Pola
//   🪨 goodbye        fly Pola home up the toy globe (goodbye.ts), hold to rise like Act 1
//   🎬 the-end        top and bottom of the world at once. Then the stamp, the trophy and the movie ticket (Place.tsx).
// From the globe it starts at the beginning, or where she left off between acts (`resume`). A section link opens
// straight into that act and the chapter goes on from there. Sparkle in the corner (kit/Guide) says what to do when
// each act starts and when she's stuck, and a fact the first time something comes up; the friends say their own lines.
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { say, type Line } from '../../../../../sdk'
import { onDevice } from '../../../../../sdk/device'
import { Guide, type GuideHandle } from '../../../../kit/Guide'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { usePassport } from '../../../../stamps'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { seeFilm } from '../../story/chapters'
import { StoryFilm } from '../../story/StoryFilm'
import { CHORUS_ANCHORS, ChorusWorld, type ChorusEvents, type ChorusTalk, type Phase, type TalkKind } from './chorus'
import { FLY_ANCHORS, FlyWorld, type FlyEvents, type FlyLeg } from './fly'
import { GOODBYE_ANCHORS, GoodbyeWorld, type GoodbyeEvents } from './goodbye'
import NIGHT_SECTIONS, { type ChorusSection, type NightSection } from './sections'
import { resumeAt as resume, saveResume, STEPS, type Act } from './steps'
import { THROUGH_ANCHORS, ThroughWorld, type ThroughEvents, type ThroughPart } from './through'

const ACT_OF: Record<NightSection, Act> = { fly: 'fly', whiteout: 'chorus', edge: 'chorus', together: 'chorus', huddle: 'huddle', goodbye: 'goodbye' }

type Enter = ReturnType<typeof useSections<'leg' | 'part', NightSection>>['enter']

export function Night({ onDone }: ActivityProps) {
  const { start, param, enter } = useSections(NIGHT_SECTIONS)
  const [first] = useState(() => {
    if (!start) return { at: resume(), leg: 'north' as FlyLeg, part: 'near' as ThroughPart, chorus: 'whiteout' as ChorusSection }
    const act = ACT_OF[start as NightSection] ?? 'fly'
    return { at: STEPS.findIndex((s) => 'act' in s && s.act === act), leg: param('leg') as FlyLeg, part: param('part') as ThroughPart, chorus: (act === 'chorus' ? start : 'whiteout') as ChorusSection }
  })
  const [at, setAt] = useState(first.at)
  const step = STEPS[at]
  const next = () => {
    const n = at + 1
    // (Between acts, the next step is where she picks up if she leaves now.)
    if ('act' in step) saveResume(n)
    if (n >= STEPS.length) {
      saveResume(0)
      onDone()
      return
    }
    setAt(n)
  }
  // Only the first act played gets the link's stretch; any later one starts at its beginning.
  const fromLink = at === first.at

  if ('film' in step)
    return (
      <StoryFilm
        key={step.film}
        id={step.film}
        onDone={() => {
          seeFilm(step.film)
          next()
        }}
      />
    )
  if (step.act === 'fly') return <FlyAct key="fly" leg={fromLink ? first.leg : 'north'} enter={enter} onDone={next} />
  if (step.act === 'chorus') return <ChorusAct key="chorus" section={fromLink ? first.chorus : 'whiteout'} enter={enter} onDone={next} />
  if (step.act === 'huddle') return <HuddleAct key="huddle" part={fromLink ? first.part : 'near'} enter={enter} onDone={next} />
  return <GoodbyeAct key="goodbye" enter={enter} onDone={next} />
}

// ---------------------------------------------------------------- shared bits

/** The same line twice within a moment is one line (React mounts a world twice in development). */
function useFresh() {
  const said = useRef({ key: '', at: 0 })
  return (key: string) => {
    const now = performance.now()
    if (said.current.key === key && now - said.current.at < 400) return false
    said.current = { key, at: now }
    return true
  }
}

/** How a world's line is said: Sparkle's instruction (her corner), her fact (once), or a friend in their own voice. */
function useTalk(guide: React.RefObject<GuideHandle | null>) {
  const fresh = useFresh()
  return (line: Line, kind: TalkKind, key?: string) => {
    if (!fresh(`${kind}:${key ?? (typeof line === 'string' ? line : line.text)}`)) return
    if (kind === 'cue') guide.current?.speak(line, true)
    else if (kind === 'fact') guide.current?.once(`night:${key ?? (typeof line === 'string' ? line : line.text)}`, line, true)
    else void say(line, { interrupt: false })
  }
}

/** A world that loses the GPU: one big button to wake it (it starts that act again). */
function Wake({ bg, label, onWake }: { bg: string; label: [string, string]; onWake: () => void }) {
  return (
    <button onClick={onWake} style={{ position: 'absolute', inset: 0, zIndex: 30, background: bg, border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: '#fff' }}>
      {onDevice(...label)}
    </button>
  )
}

/** The pink dots at the bottom: how many friends found here (Act 2), how far through (Acts 1 and 3). */
function Dots({ n, of }: { n: number; of: number }) {
  return (
    <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
      {of > 0 && (
        <div style={{ display: 'flex', gap: 6 }} aria-hidden>
          {Array.from({ length: of }, (_, i) => (
            <motion.div key={`${of}-${i}`} animate={{ scale: i < n ? [1, 1.4, 1] : 1 }} style={{ width: 18, height: 18, borderRadius: 99, background: i < n ? 'var(--hotpink)' : 'rgba(255,255,255,.55)', border: '3px solid var(--ink)' }} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- Act 1: Hold to Fly

function FlyAct({ leg, enter, onDone }: { leg: FlyLeg; enter: Enter; onDone: () => void }) {
  const passport = usePassport()
  const [visited] = useState(() => passport.visited.filter((id) => id !== 'poles'))
  const [run, setRun] = useState({ leg, n: 0 })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [hint, setHint] = useState<Line | null>(null)
  const [now, setNow] = useState<FlyLeg>(leg)
  const worldRef = useRef<FlyWorld | null>(null)
  const guide = useRef<GuideHandle>(null)
  const talk = useTalk(guide)
  const done = useRef(false)
  useEffect(() => enter('fly', { leg: run.leg }), [run])
  const events: FlyEvents = {
    leg: (l) => {
      setNow(l)
      enter('fly', { leg: l })
    },
    talk,
    hint: setHint,
    done: () => {
      if (done.current) return
      done.current = true
      onDone()
    },
  }
  const relay = useRelay(events)
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#BFE0FA', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="Hold to fly"
        qaKey="__polesNightQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new FlyWorld(renderer, { leg: run.leg, visited }, relay)}
        anchors={(input, els) => <Anchors list={FLY_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <Wake
          bg="rgba(120,150,210,.88)"
          label={['🎈 Tap to fly again', '🎈 Click to fly again']}
          onWake={() => {
            setMode('webgl')
            setRun((r) => ({ leg: now, n: r.n + 1 }))
          }}
        />
      )}
      <Guide ref={guide} hint={hint} />
    </div>
  )
}

/** The world keeps the same handlers for its life; each one calls the latest. */
function useRelay<T extends object>(events: T): T {
  const ref = useRef(events)
  ref.current = events
  const relay = useRef<T | null>(null)
  if (!relay.current) relay.current = new Proxy({} as T, { get: (_t, k) => (...a: unknown[]) => (ref.current[k as keyof T] as (...x: unknown[]) => unknown)(...a) })
  return relay.current
}

// ---------------------------------------------------------------- Act 2: Sing in the Dark

const C = L.night.chorus

function ChorusAct({ section: startAt, enter, onDone }: { section: ChorusSection; enter: Enter; onDone: () => void }) {
  const [run, setRun] = useState<{ section: ChorusSection; n: number }>(() => ({ section: startAt, n: 0 }))
  const [phase, setPhase] = useState<Phase>('play')
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [hint, setHint] = useState<Line | null>(null)
  const [dots, setDots] = useState<[number, number]>([0, 0])
  const [section, setSection] = useState<ChorusSection>(run.section)
  const worldRef = useRef<ChorusWorld | null>(null)
  const guide = useRef<GuideHandle>(null)
  const polaTurn = useRef(0)
  const fresh = useFresh()
  const ended = useRef(false)

  useEffect(() => {
    setSection(run.section)
    enter(run.section)
  }, [run])
  // The answer has come back (Papa!): a moment to hear it, then on to the colony.
  useEffect(() => {
    if (phase !== 'end' || ended.current) return
    ended.current = true
    onDone()
  }, [phase])

  const lineOf = (what: ChorusTalk): Line => {
    if (what === 'skyFact') return L.hub.pokes.lightsSouth
    if (what === 'pola') return C.pola[polaTurn.current++ % C.pola.length]
    return C[what]
  }
  const events: ChorusEvents = {
    section: (s) => {
      setSection(s)
      enter(s)
    },
    talk: (what, kind) => {
      if (!fresh(`${kind}:${what}`)) return
      const line = lineOf(what)
      if (kind === 'cue') guide.current?.speak(line, true)
      else if (kind === 'fact') guide.current?.once(`night:${what}`, line, true)
      else void say(line, { interrupt: false })
    },
    hint: (what) => setHint(what ? C[what] : null),
    dots: (n, of) => setDots([n, of]),
    phase: setPhase,
  }
  const relay = useRelay(events)

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#2A2766', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="Sing in the dark"
        qaKey="__polesNightQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new ChorusWorld(renderer, { section: run.section }, relay)}
        anchors={(input, els) => <Anchors list={CHORUS_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <Wake
          bg="rgba(42,39,102,.88)"
          label={['🎶 Tap to sing again', '🎶 Click to sing again']}
          onWake={() => {
            setMode('webgl')
            setRun((r) => ({ section, n: r.n + 1 }))
          }}
        />
      )}
      <Dots n={dots[0]} of={dots[1]} />
      <Guide ref={guide} hint={phase === 'end' ? null : hint} />
    </div>
  )
}

// ---------------------------------------------------------------- Act 3: Through the Huddle

function HuddleAct({ part, enter, onDone }: { part: ThroughPart; enter: Enter; onDone: () => void }) {
  const [run, setRun] = useState({ part, n: 0 })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [hint, setHint] = useState<Line | null>(null)
  const [now, setNow] = useState<ThroughPart>(part)
  const [dots, setDots] = useState<[number, number]>([0, 3])
  const worldRef = useRef<ThroughWorld | null>(null)
  const guide = useRef<GuideHandle>(null)
  const talk = useTalk(guide)
  const done = useRef(false)
  useEffect(() => enter('huddle', { part: run.part }), [run])
  const events: ThroughEvents = {
    part: (p) => {
      setNow(p)
      enter('huddle', { part: p })
    },
    talk,
    hint: setHint,
    dots: (n, of) => setDots([n, of]),
    done: () => {
      if (done.current) return
      done.current = true
      onDone()
    },
  }
  const relay = useRelay(events)
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1B2150', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="Through the huddle"
        qaKey="__polesNightQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new ThroughWorld(renderer, { part: run.part }, relay)}
        anchors={(input, els) => <Anchors list={THROUGH_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <Wake
          bg="rgba(27,33,80,.88)"
          label={['🐧 Tap to go again', '🐧 Click to go again']}
          onWake={() => {
            setMode('webgl')
            setRun((r) => ({ part: now, n: r.n + 1 }))
          }}
        />
      )}
      <Dots n={dots[0]} of={dots[1]} />
      <Guide ref={guide} hint={hint} />
    </div>
  )
}

// ---------------------------------------------------------------- Goodbye: fly Pola home

function GoodbyeAct({ enter, onDone }: { enter: Enter; onDone: () => void }) {
  const passport = usePassport()
  const [visited] = useState(() => passport.visited.filter((id) => id !== 'poles'))
  const [n, setN] = useState(0)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [hint, setHint] = useState<Line | null>(null)
  const worldRef = useRef<GoodbyeWorld | null>(null)
  const guide = useRef<GuideHandle>(null)
  const talk = useTalk(guide)
  const done = useRef(false)
  useEffect(() => enter('goodbye'), [])
  const events: GoodbyeEvents = {
    talk,
    hint: setHint,
    done: () => {
      if (done.current) return
      done.current = true
      onDone()
    },
  }
  const relay = useRelay(events)
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F6EEFF', overflow: 'clip' }}>
      <View3D
        key={n}
        name="Fly Pola home"
        qaKey="__polesNightQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new GoodbyeWorld(renderer, { visited }, relay)}
        anchors={(input, els) => <Anchors list={GOODBYE_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <Wake
          bg="rgba(200,180,240,.88)"
          label={['🎈 Tap to fly again', '🎈 Click to fly again']}
          onWake={() => {
            setMode('webgl')
            setN((x) => x + 1)
          }}
        />
      )}
      <Guide ref={guide} hint={hint} />
    </div>
  )
}

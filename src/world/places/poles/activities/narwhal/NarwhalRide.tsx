// Narwhal Ride: steer Nari the narwhal, Pola and Pebble on her back, out past the icebergs to Sparkle's balloon
// (ride.ts is the world). The films before and after it are Place.tsx's (story/films.ts: narwhal-in ends with both on
// her back, narwhal-out starts as she arrives), so the game opens on a look at the three of them and she is steering
// within a few seconds. The address bar follows her from stretch to stretch (sections.ts). The steering circle appears
// where her finger goes down, a dot following it (engine3d/SteerWheel.tsx). Sparkle in the corner (kit/Guide.tsx) says
// what to do when each stretch starts and when she's stuck, and something true the first time she pokes something;
// Nari, Pola, Pebble and Terry say their own lines when something happens to them (lines.ts, L.narwhal). The fish in
// the corner counts the schools Nari has scooped up. At the balloon: the film and the stamp (onDone).
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { burst, say, speakingVoice, type Line, useTimers } from '../../../../../sdk'
import { afterTalk, Guide, type GuideHandle } from '../../../../kit/Guide'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { SteerHint, SteerWheel } from '../../../../engine3d/SteerWheel'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { NarwhalRide as World, RIDE_ANCHORS, type RideEvents, type RideMoment, type RidePoke, type RideStart } from './ride'
import NARWHAL_SECTIONS, { type NarwhalSection } from './sections'

const N = L.narwhal
/** The gap between two of the friends' lines about what just happened (the rest of the time: the sea and the sounds). */
const GAP_S = 5
/** At the balloon: this long for the cheer, then the film and the stamp. */
const DONE_S = 2.6

export function NarwhalRide({ onDone }: ActivityProps) {
  const gameTimers = useTimers()
  const { start, param, enter } = useSections(NARWHAL_SECTIONS)
  const [run, setRun] = useState<RideStart & { n: number }>(() => ({
    section: (start ?? 'open') as NarwhalSection,
    channel: param('channel') as RideStart['channel'],
    fish: Math.max(0, Math.floor(+param('fish')) || 0),
    n: 0,
  }))
  const [section, setSection] = useState<NarwhalSection>(run.section)
  const [fish, setFish] = useState(run.fish)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const worldRef = useRef<World | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const guide = useRef<GuideHandle>(null)
  /** How many times each kind of line has been said, and when a friend last spoke. */
  const said = useRef<Record<string, number>>({})
  const lastLine = useRef(-Infinity)
  const timers = useRef<number[]>([])
  const cancel = useRef<() => void>(undefined)
  const later = (fn: () => void, ms: number) => timers.current.push(gameTimers.later(fn, ms))

  const params = (s: NarwhalSection, n: number, channel = 'middle') => ({ ...(s === 'bergs' && channel !== 'middle' ? { channel } : {}), ...(s !== 'open' && n ? { fish: String(n) } : {}) })
  useEffect(() => {
    enter(run.section, params(run.section, run.fish, run.channel))
  }, [run])
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
      cancel.current?.()
    },
    [],
  )

  /** A friend says the next of their lines about what just happened: `max` times at most, with a gap, never over
   *  someone else talking. `now`: a story line that must be heard (it waits for a gap in the talk instead). */
  const friend = (kind: string, lines: Line | Line[], max = 2, now = false) => {
    const t = performance.now() / 1000
    const n = said.current[kind] ?? 0
    if (n >= max) return
    if (!now && (t - lastLine.current < GAP_S || speakingVoice())) return
    said.current[kind] = n + 1
    lastLine.current = t
    void say(Array.isArray(lines) ? lines[n % lines.length] : lines, { interrupt: false })
  }
  /** A poke on a friend: their lines in turn, every time (it's her asking). */
  const answer = (who: 'nari' | 'pola' | 'pebble' | 'terry') => {
    const n = said.current[`poke:${who}`] ?? 0
    said.current[`poke:${who}`] = n + 1
    if (speakingVoice()) return
    lastLine.current = performance.now() / 1000
    void say(N[who][n % N[who].length])
  }

  /** Sparkle says what to do on this stretch. */
  const arrive = (s: NarwhalSection, after = false) => {
    if (s !== 'balloon') guide.current?.speak(N.hints[s], after)
  }
  // A section link: the instruction straight away (a fresh start says it once Nari has set off).
  useEffect(() => {
    if (run.section !== 'open') arrive(run.section)
  }, [])

  const moments: Record<RideMoment, () => void> = {
    go: () => {
      friend('go', N.go, 1, true)
      arrive('open', true)
      later(() => friend('follow', N.follow, 1), 9000)
    },
    jump: () => friend('jump', N.jump, 3),
    land: () => friend('land', N.land, 3),
    bump: () => friend('bump', N.bump, 3),
    dive: () => friend('dive', N.dive, 1, true),
    bubble: () => {
      guide.current?.once('narwhal:hidden', N.hidden, true)
      later(() => friend('bubble', N.bubble, 1, true), 2600)
      later(() => friend('sea', N.sea, 1, true), 6200)
    },
    up: () => {
      friend('up', N.up, 1, true)
      later(() => friend('there', N.there, 1), 2200)
    },
    crack: () => friend('crack', N.crack, 1, true),
    calved: () => {
      guide.current?.speak(N.calved, true)
      later(() => friend('wave', N.wave, 1, true), 2400)
    },
    wave: () => friend('wave', N.wave, 2),
    balloon: () => friend('balloon', N.balloon, 1, true),
  }
  const pokes: Record<RidePoke, () => void> = {
    // The first poke: what her horn really is; after that she answers for herself.
    nari: () => {
      const first = !said.current.tusk
      said.current.tusk = 1
      if (first) guide.current?.once('narwhal:tusk', N.facts.tusk)
      else answer('nari')
    },
    pola: () => answer('pola'),
    pebble: () => answer('pebble'),
    terry: () => answer('terry'),
    walrus: () => guide.current?.once('narwhal:walrus', N.facts.walrus),
    puffins: () => guide.current?.once('narwhal:puffins', N.facts.puffins),
    seal: () => guide.current?.once('narwhal:seal', N.facts.seal),
    // The first beluga: who they are; the next poke: where they live.
    beluga: () => (said.current.beluga ? guide.current?.once('narwhal:arctic', N.facts.arctic) : ((said.current.beluga = 1), guide.current?.once('narwhal:beluga', N.facts.beluga))),
    orca: () => guide.current?.once('narwhal:orca', N.facts.orca),
    fizz: () => guide.current?.once('narwhal:fizz', N.facts.fizz),
    blue: () => guide.current?.once('narwhal:blue', N.facts.blue),
    chunk: () => guide.current?.once('narwhal:calving', N.facts.calving),
    water: () => guide.current?.once('narwhal:water', N.facts.water),
    ice: () => guide.current?.once('narwhal:ice', N.facts.ice),
  }

  const events = useRef<RideEvents>({
    section: (s, n) => {
      setSection(s)
      enter(s, params(s, n))
      if (s === 'bergs') later(() => friend('bergs', N.bergs, 1), 3500)
      // (Under the ice and by the glacier the friends' story lines come first: Sparkle's instruction there is only
      // the hint for when she's stuck.)
      if (s === 'bergs') arrive(s)
    },
    fish: (n) => {
      setFish(n)
      // The first few, then now and then.
      if (n <= 2 || n % 5 === 0) friend('fish', N.fish, 4)
    },
    moment: (m) => moments[m](),
    poke: (id) => pokes[id](),
    done: () => {
      burst()
      void say(N.here, { interrupt: false })
      later(() => (cancel.current = afterTalk(onDone, 5000)), DONE_S * 1000)
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, run, events.current)
    w.setWheelElement(wheelRef.current)
    w.setHintElement(hintRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#CFE9FF', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="The Arctic sea"
        qaKey="__polesNarwhalQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={RIDE_ANCHORS} els={els} {...input} />
            <SteerWheel ref={wheelRef} />
            <SteerHint ref={hintRef} />
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setRun((r) => ({ ...r, section, fish, n: r.n + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(207,233,255,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🦄 Wake the sea
        </button>
      )}
      {fish > 0 && <Fish n={fish} />}
      <Guide ref={guide} stuckS={8} hint={section === 'balloon' ? null : N.hints[section]} />
    </div>
  )
}

/** The fish Nari has scooped up (top right, under the top bar): it pops with every school. */
function Fish({ n }: { n: number }) {
  const size = 'clamp(64px, 11vmin, 96px)'
  return (
    <motion.div
      key={n}
      aria-label={`${n} fish`}
      initial={{ scale: 1.3 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
      style={{ position: 'absolute', right: 16, top: 'calc(var(--top-clear) + 8px)', width: size, height: size, borderRadius: '50%', background: '#fff', border: '5px solid var(--ink)', zIndex: 20, pointerEvents: 'none', boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center' }}
    >
      <div style={{ fontSize: 'clamp(26px, 4.6vmin, 40px)', lineHeight: 1 }}>🐟</div>
      <div style={{ position: 'absolute', right: -6, bottom: -6, minWidth: '1.7em', padding: '0 .3em', borderRadius: 999, background: 'var(--pink)', color: '#fff', fontWeight: 800, fontSize: 'clamp(16px, 2.8vmin, 24px)', textAlign: 'center', border: '3px solid var(--ink)' }}>{n}</div>
    </motion.div>
  )
}

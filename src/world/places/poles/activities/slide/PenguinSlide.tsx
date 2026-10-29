// Penguin Slide: steer Pebble's papa down the ice and through the sea, home to feed Pebble (slide.ts is the world). A
// fresh start opens on the story (Pebble is hungry, Papa goes fishing; a tap skips it) while Papa waits at the top. The
// address bar follows him from stretch to stretch (sections.ts). The steering wheel appears under her finger
// (engine3d/SteerWheel.tsx, the Nan drive's). Sparkle in the corner (kit/Guide.tsx) says what to do when each stretch
// starts and when she's stuck, and something true the first time she pokes someone; Papa and Pebble say their own
// lines when something happens to them (lines.ts, L.slide). His round tummy in the corner fills with the krill he
// catches. Pebble fed: the stamp (onDone).
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { burst, pick, say, speakingVoice, type Line } from '../../../../../sdk'
import { Guide, type GuideHandle } from '../../../../kit/Guide'
import { useSections } from '../../../../kit/sections'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { Anchors } from '../../../../engine3d/Anchors'
import { SteerHint, SteerWheel } from '../../../../engine3d/SteerWheel'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Pebble } from '../../puppets/Pebble'
import SLIDE_SECTIONS, { type SlideSection } from './sections'
import { PenguinSlide as World, SLIDE_ANCHORS, type SlideEvents, type SlideMoment, type SlideStart } from './slide'

/** How many times Papa says something about each kind of moment in one slide, and the gap between two of his lines. */
const MAX_SAID = 2
const PAPA_GAP_S = 6
/** Pebble fed: this long for the cheer and Pebble's thank-you, then the stamp. */
const DONE_S = 3.4

export function PenguinSlide({ onDone }: ActivityProps) {
  const { start, param, enter } = useSections(SLIDE_SECTIONS)
  // The story on a fresh start or its own link (any other section link goes straight to the play), while Papa waits at
  // the top of the slope.
  const [story, setStory] = useState(!start || start === 'story')
  const [run, setRun] = useState<SlideStart & { n: number }>(() => ({
    section: (!start || start === 'story' ? 'top' : start) as SlideSection,
    run: param('run') as SlideStart['run'],
    krill: Math.max(0, Math.floor(+param('krill')) || 0),
    n: 0,
  }))
  const [section, setSection] = useState<SlideSection>(run.section)
  const [krill, setKrill] = useState(run.krill)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const worldRef = useRef<World | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const guide = useRef<GuideHandle>(null)
  const storyRef = useRef(story)
  storyRef.current = story
  const said = useRef<Partial<Record<SlideMoment | 'gulp', number>>>({})
  const lastPapa = useRef(-Infinity)
  const done = useRef<ReturnType<typeof setTimeout>>(undefined)
  const pebbleTaps = useRef(0)
  const adeliePokes = useRef(0)

  useEffect(() => {
    if (storyRef.current) enter('story')
    else enter(run.section, run.section === 'bumps' ? { run: run.run } : run.section === 'top' ? {} : { krill: String(run.krill) })
  }, [run])
  useEffect(() => () => clearTimeout(done.current), [])

  /** Sparkle says what to do on this stretch (with what's new about it first). */
  const arrive = (s: SlideSection) => {
    const g = guide.current
    if (!g) return
    if (s === 'top') g.speak(L.slide.hints.top)
    else if (s === 'bumps') {
      g.speak(L.slide.hints.bumps)
      g.speak(L.slide.bumps, true)
    } else if (s === 'dive') {
      g.speak(L.slide.hints.dive)
      g.speak(L.slide.dive, true)
    }
  }
  // A section link: the instruction straight away (a fresh start says it when the story ends).
  useEffect(() => {
    if (!story) arrive(run.section)
  }, [])

  /** Papa says something about what just happened: a few times each, never over someone else talking. */
  const papaSays = (kind: SlideMoment | 'gulp', lines: Line | Line[], max = MAX_SAID) => {
    const now = performance.now() / 1000
    const n = said.current[kind] ?? 0
    if (n >= max || now - lastPapa.current < PAPA_GAP_S || speakingVoice()) return
    said.current[kind] = n + 1
    lastPapa.current = now
    void say(Array.isArray(lines) ? lines[n % lines.length] : lines)
  }

  const events = useRef<SlideEvents>({
    section: (s, n) => {
      setSection(s)
      enter(s, s === 'dive' || s === 'home' ? { krill: String(n) } : {})
      arrive(s)
    },
    krill: (n) => {
      setKrill(n)
      // The first swarm, then now and then.
      if (n === 1 || n % 4 === 0) papaSays('gulp', L.slide.gulp, 3)
    },
    home: () => {
      burst()
      void say(L.slide.fed)
      clearTimeout(done.current)
      done.current = setTimeout(onDone, DONE_S * 1000)
    },
    moment: (m) => {
      if (m === 'go') return
      if (m === 'leap') return void say(L.slide.leap)
      papaSays(m, m === 'seal' ? L.slide.seal : L.slide[m], m === 'seal' ? 1 : MAX_SAID)
    },
    poke: (id) => {
      const g = guide.current
      if (id === 'pebble' && pebbleTaps.current++ % 2 === 1 && !speakingVoice()) return void say(pick(L.slide.pebbleTap))
      if (id === 'adelie' && adeliePokes.current++ > 0) return void g?.once('slide:noBears', L.slide.facts.noBears)
      g?.once(`slide:${id}`, L.slide.facts[id])
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, run, events.current)
    w.held = storyRef.current
    w.setWheelElement(wheelRef.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const endStory = () => {
    setStory(false)
    if (worldRef.current) worldRef.current.held = false
    arrive('top')
    // The address bar moves on once the slope is showing (qa-pacing times her first touch on the story's link).
    setTimeout(() => enter('top'), 300)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E6F3FD', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="The ice slope"
        qaKey="__polesSlideQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={SLIDE_ANCHORS} els={els} {...input} />
            <SteerWheel ref={wheelRef} />
            <SteerHint ref={hintRef} />
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setRun((r) => ({ ...r, section, krill, n: r.n + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(230,243,253,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🐧 Tap to wake the ice
        </button>
      )}
      {(section === 'dive' || section === 'home' || krill > 0) && <Tummy n={krill} />}
      <Guide ref={guide} quiet={story} hint={section === 'home' || section === 'story' ? null : L.slide.hints[section]} />
      {story && <StoryBeat lines={L.slide.story} friend={<Pebble height="100%" />} onDone={endStory} />}
    </div>
  )
}

/** Papa's round tummy (top right, under the top bar): it fills up pink, a little more with every swarm he gulps. */
function Tummy({ n }: { n: number }) {
  const full = Math.min(1, n / 12)
  const size = 'clamp(64px, 11vmin, 96px)'
  return (
    <motion.div
      key={n}
      aria-label={`${n} krill`}
      initial={{ scale: n ? 1.25 : 1 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
      style={{ position: 'absolute', right: 16, top: 'calc(var(--top-clear) + 8px)', width: size, height: size, borderRadius: '50%', background: '#fff', border: '5px solid var(--ink)', overflow: 'hidden', zIndex: 20, pointerEvents: 'none', boxShadow: 'var(--shadow)' }}
    >
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${full * 100}%`, background: 'var(--pink)', transition: 'height .3s' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 'clamp(28px, 5vmin, 44px)' }}>🦐</div>
    </motion.div>
  )
}

// Penguin Slide: Papa looks for Pebble (slide.ts is the world). Steer him down the ice and through the sea, up to
// everything that might be Pebble. Her hands are busy at once: the films either side of the game tell the story
// (Place.tsx plays them), so there is no opening here. The address bar follows him from stretch to stretch
// (sections.ts). The steering circle appears where her finger goes down, a dot following it (engine3d/SteerWheel.tsx,
// the Nan drive's). Sparkle in the corner (kit/Guide.tsx) says what to do when each stretch starts and when she's
// stuck, and something true the first time she pokes someone; Papa calls for Pebble and says his own lines when
// something happens to him (lines.ts, L.slide). In the corner: the places he has looked (a dot each) and his round
// tummy, filling with the krill he catches. Out on the ice edge, the Adélies cheering: the stamp (onDone).
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { burst, say, speakingVoice, type Line } from '../../../../../sdk'
import { Guide, type GuideHandle } from '../../../../kit/Guide'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { SteerHint, SteerWheel } from '../../../../engine3d/SteerWheel'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { LOOKS } from './course'
import SLIDE_SECTIONS, { type SlideSection } from './sections'
import { PenguinSlide as World, SLIDE_ANCHORS, type PokeId, type SlideEvents, type SlideMoment, type SlideStart } from './slide'

/** How many times Papa says something about each kind of moment in one slide, and the gap between two of his lines. */
const MAX_SAID = 2
const PAPA_GAP_S = 6
/** The cheer, his line and his look up at the sky take this long; then the stamp. */
const DONE_S = 4.2

/** Sparkle's fact for each thing she can poke (the first time). */
const FACTS: Partial<Record<PokeId, Line>> = { ...L.slide.facts, snowy: L.slide.facts.adelie, whale: L.slide.facts.spout }

export function PenguinSlide({ onDone }: ActivityProps) {
  const { start, param, enter } = useSections(SLIDE_SECTIONS)
  const [run, setRun] = useState<SlideStart & { n: number }>(() => ({
    section: (start ?? 'top') as SlideSection,
    run: param('run') as SlideStart['run'],
    krill: Math.max(0, Math.floor(+param('krill')) || 0),
    looked: param('looked'),
    n: 0,
  }))
  const [section, setSection] = useState<SlideSection>(run.section)
  const [krill, setKrill] = useState(run.krill)
  const [looked, setLooked] = useState(run.looked)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const worldRef = useRef<World | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const guide = useRef<GuideHandle>(null)
  const said = useRef<Partial<Record<SlideMoment | 'gulp', number>>>({})
  const lastPapa = useRef(-Infinity)
  const done = useRef<ReturnType<typeof setTimeout>>(undefined)
  const adeliePokes = useRef(0)
  /** Where he is and what he has (the address bar is rewritten from these). */
  const now = useRef({ section: run.section, krill: run.krill, looked: run.looked, run: run.run })

  /** The address bar follows him: the stretch, his krill, what he has looked at. */
  const address = () => {
    const { section: s, krill: k, looked: l, run: r } = now.current
    enter(s, s === 'top' ? {} : s === 'bumps' ? { run: r, looked: l } : { krill: String(k), looked: l })
  }
  useEffect(() => {
    now.current = { section: run.section, krill: run.krill, looked: run.looked, run: run.run }
    address()
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
  // The instruction straight away: he is already flopping onto his tummy.
  useEffect(() => arrive(run.section), [])

  /** Papa says something about what just happened: a few times each (in turn), never over someone else talking. */
  const papaSays = (kind: SlideMoment | 'gulp', lines: Line | Line[], max = MAX_SAID) => {
    const t = performance.now() / 1000
    const n = said.current[kind] ?? 0
    if (n >= max || t - lastPapa.current < PAPA_GAP_S || speakingVoice()) return
    said.current[kind] = n + 1
    lastPapa.current = t
    void say(Array.isArray(lines) ? lines[n % lines.length] : lines)
  }

  const events = useRef<SlideEvents>({
    section: (s, n) => {
      setSection(s)
      now.current.section = s
      now.current.krill = n
      address()
      arrive(s)
    },
    krill: (n) => {
      setKrill(n)
      now.current.krill = n
      // The first swarm, then now and then; what krill are, once, after the second.
      if (n === 1 || n % 4 === 0) papaSays('gulp', L.slide.gulp, 3)
      else if (n === 2) guide.current?.once('slide:krill', L.slide.krill, true)
    },
    look: (kind, all) => {
      setLooked(all)
      now.current.looked = all
      address()
      // What it turned out to be: this one he always says (it is the joke).
      lastPapa.current = performance.now() / 1000
      void say(L.slide.found[kind])
    },
    home: () => {
      burst()
      void say(L.slide.home)
      clearTimeout(done.current)
      done.current = setTimeout(onDone, DONE_S * 1000)
    },
    moment: (m) => {
      if (m === 'go') return
      // Something small and grey ahead: is that Pebble?
      if (m === 'spot') return void guide.current?.once('slide:look', L.slide.look, true)
      if (m === 'leap') return void say(L.slide.leap)
      // He calls for Pebble in turn, as often as the world asks (every so often); the rest a couple of times each.
      if (m === 'call' || m === 'callSea') return papaSays(m, L.slide[m], 99)
      papaSays(m, L.slide[m], m === 'seal' ? 1 : MAX_SAID)
    },
    poke: (id) => {
      const g = guide.current
      // Something he hasn't looked at yet: how to find out what it is.
      if (id === 'maybe') return void g?.once('slide:look', L.slide.look)
      if (id === 'adelie' && adeliePokes.current++ > 0) return void g?.once('slide:noBears', L.slide.facts.noBears)
      const fact = FACTS[id]
      if (fact) g?.once(`slide:${id}`, fact)
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, run, events.current)
    w.setWheelElement(wheelRef.current)
    w.setHintElement(hintRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#DCEBFF', overflow: 'clip' }}>
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
            setRun((r) => ({ ...r, section, krill, looked, n: r.n + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(230,243,253,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🐧 Wake the ice
        </button>
      )}
      <div style={{ position: 'absolute', right: 16, top: 'calc(var(--top-clear) + 8px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, zIndex: 20, pointerEvents: 'none' }}>
        {(section === 'dive' || section === 'home' || krill > 0) && <Tummy n={krill} />}
        <Looked found={looked} />
      </div>
      <Guide ref={guide} hint={section === 'home' ? null : L.slide.hints[section]} />
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
      style={{ position: 'relative', width: size, height: size, borderRadius: '50%', background: '#fff', border: '5px solid var(--ink)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}
    >
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${full * 100}%`, background: 'var(--pink)', transition: 'height .3s' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 'clamp(28px, 5vmin, 44px)' }}>🦐</div>
    </motion.div>
  )
}

/** The places he has looked: a dot for each maybe-Pebble, filled gold once he has slid up to it. Nothing waits on it. */
function Looked({ found }: { found: string }) {
  const n = LOOKS.filter((l) => found.includes(l.key)).length
  return (
    <div aria-label={`Looked in ${n} of ${LOOKS.length} places`} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.9)', border: '3px solid var(--ink)', boxShadow: 'var(--shadow)' }}>
      <span style={{ fontSize: 'clamp(16px, 3vmin, 22px)', lineHeight: 1 }}>🔍</span>
      {LOOKS.map((l) => {
        const on = found.includes(l.key)
        return (
          <motion.span
            key={l.key}
            animate={{ scale: on ? [1.7, 1] : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            style={{ width: 'clamp(10px, 2vmin, 14px)', height: 'clamp(10px, 2vmin, 14px)', borderRadius: '50%', background: on ? '#FFC83D' : 'transparent', border: '2.5px solid var(--ink)', display: 'block' }}
          />
        )
      })}
    </div>
  )
}

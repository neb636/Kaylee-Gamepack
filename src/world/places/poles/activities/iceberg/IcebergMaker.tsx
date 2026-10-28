// Iceberg Maker: pick a pole, crack icebergs off its cliff, see the hidden part, send them sailing (iceberg.ts is the
// world). The address bar follows her from stretch to stretch (sections.ts). Sparkle, in the corner (kit/Guide), says
// what to do at each stretch (again when she's stuck) and a fact the first time something comes up: calving, the
// pole's shape of berg, the hidden part, fresh water, bergy seltzer, blue ice, the seal, the orca. The friend at that
// pole (Pola up north, Papa down south) says hello and reacts in their own voice to the big moments. When the giant
// drops, a wave rolls across the screen. When her fleet has sailed, the stamp.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { burst, say, useAlive, type Line } from '../../../../../sdk'
import { Guide, type GuideHandle } from '../../../../kit/Guide'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { ICEBERG_ANCHORS, IcebergMaker as World, type IcebergEvents, type IcebergMoment, type IcebergStart } from './iceberg'
import ICEBERG_SECTIONS, { type IcebergSection, type Pole } from './sections'

const T = L.iceberg
/** A friend's reaction waits this long after the one before (so they don't chatter over every splash). */
const REACT_GAP_MS = 4000
/** From the fleet sailing off to the stamp: the goodbyes, and a look at the icebergs going. */
const STAMP_AFTER_MS = 5500

export function IcebergMaker({ onDone }: ActivityProps) {
  const { start, param, enter } = useSections(ICEBERG_SECTIONS)
  const [run, setRun] = useState<IcebergStart & { n: number }>(() => ({ section: (start ?? 'pick') as IcebergSection, pole: param('pole') as Pole, n: 0 }))
  const [section, setSection] = useState<IcebergSection>(run.section)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [wave, setWave] = useState(0)
  const [under, setUnder] = useState(false)
  const [pushed, setPushed] = useState(false)
  const [done, setDone] = useState(false)
  const worldRef = useRef<World | null>(null)
  const guide = useRef<GuideHandle>(null)
  const alive = useAlive()
  const poleRef = useRef(run.pole)
  poleRef.current = run.pole
  const talk = useRef({ lastFriend: 0, bits: 0, pokes: 0 })

  const friend = () => T[poleRef.current]
  /** The friend reacts (after whatever is being said), unless they just did. */
  const react = (l: Line, force = false) => {
    const now = performance.now()
    if (!force && now - talk.current.lastFriend < REACT_GAP_MS) return
    talk.current.lastFriend = now
    void say(l, { interrupt: false })
  }

  useEffect(() => enter(run.section, run.section === 'pick' ? {} : { pole: run.pole }), [run])

  // A new start (the first one, or after the pick): say where we are. After the pick, the friend there says hello first.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!alive()) return
      if (run.section === 'pick') return guide.current?.speak(T.pick)
      if (run.section === 'bits') {
        talk.current.lastFriend = performance.now()
        void say(friend().hi)
        guide.current?.speak(T.bits, true)
        return
      }
      guide.current?.speak(T[run.section])
    }, 400)
    return () => clearTimeout(t)
  }, [run])

  const moment = (m: IcebergMoment) => {
    const g = guide.current
    const f = friend()
    switch (m) {
      case 'bit': {
        const n = ++talk.current.bits
        if (n === 1) g?.once('calving', T.facts.calving)
        else if (n === 2) g?.once(`shape-${poleRef.current}`, T.facts[poleRef.current])
        else react(f.bit[(n - 3) % f.bit.length])
        return
      }
      case 'groan':
        talk.current.lastFriend = performance.now()
        void say(f.groan)
        return
      case 'soak':
        return react(f.soak, true)
      case 'push':
        setPushed(true)
        return g?.once('hidden', T.facts.hidden)
      case 'ride':
        return react(f.ride, true)
      case 'fizz':
        return g?.once('fizz', T.facts.fizz)
      case 'blue':
        return g?.once('blue', T.facts.blue)
      case 'seal':
        return g?.once('seal', T.facts.seal)
      case 'orca':
        return g?.once('orca', T.facts.orca)
      case 'friends':
        return react(f.poke[talk.current.pokes++ % f.poke.length])
    }
  }

  const events = useRef<IcebergEvents>({
    section: (s) => {
      setSection(s)
      enter(s, { pole: poleRef.current })
      if (s === 'giant') guide.current?.speak(T.giant)
      if (s === 'sail') {
        guide.current?.speak(T.sail, true)
        guide.current?.once('fresh', T.facts.fresh, true)
      }
    },
    pick: (pole) => {
      setSection('bits')
      setRun((r) => ({ section: 'bits', pole, n: r.n + 1 }))
    },
    bigSplash: () => setWave((n) => n + 1),
    under: (on) => {
      setUnder(on)
      if (!on) return
      guide.current?.speak(T.under)
      react(friend().under, true)
    },
    done: () => {
      setDone(true)
      burst()
      talk.current.lastFriend = performance.now()
      void say(friend().bye)
      guide.current?.speak(T.done, true)
      setTimeout(() => alive() && onDone(), STAMP_AFTER_MS)
    },
    moment: (m) => moment(m),
  })

  // What Sparkle says when she's stuck: the stretch's instruction (under the water, push it down until she has).
  const hint = done ? null : under ? (pushed ? null : T.push) : T[section]

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E6F3FD', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="The ice cliff"
        qaKey="__polesIcebergQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new World(renderer, run, events.current)}
        anchors={(input, els) => <Anchors list={ICEBERG_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setRun((r) => ({ ...r, section, n: r.n + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(230,243,253,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🧊 Tap to wake the ice
        </button>
      )}
      {/* The giant's wave rolls across the screen. */}
      <AnimatePresence>
        {wave > 0 && (
          <motion.svg
            key={wave}
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
            initial={{ x: '-110%', opacity: 1 }}
            animate={{ x: '110%', opacity: [1, 1, 0] }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '28%', pointerEvents: 'none', zIndex: 15 }}
          >
            <path d="M0 60 Q 50 10 100 50 T 200 50 T 300 50 T 400 50 V100 H0 Z" fill="rgba(120,188,234,.55)" stroke="rgba(255,255,255,.9)" strokeWidth={5} />
          </motion.svg>
        )}
      </AnimatePresence>
      <Guide ref={guide} hint={hint} quiet={done || mode === 'lost'} />
    </div>
  )
}

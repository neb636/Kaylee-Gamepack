// Ice Floe Hop: fling Pola, with Pebble on her back, floe to floe to Mama Bear (floe.ts is the world). The film before
// it (story/films.ts, `floe-in`) tells why, so the game opens with her hands busy and one line from Sparkle. The
// address bar follows Pola from stage to stage (sections.ts). The friends react in their own voices, in turn and not
// too often: Pebble as they fly, Pola and Pebble on a belly-flop ("Don't drop me!") and when they climb out ("I'm
// still dry!"), Mama when she's poked. Sparkle, in the corner (kit/Guide), says what to do at each stretch, again when
// she's stuck, and a fact the first time she pokes the ice, the sea or one of the animals. Home on Mama's ice: a
// cheer, then the stamp (onDone; the film after it is Mama meeting Pebble). "Again" lays the floes out a new way.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BigButton, burst, say, speakingVoice, useAlive, wait, type Line, useTimers } from '../../../../../sdk'
import { onDevice } from '../../../../../sdk/device'
import { afterTalk, Guide, type GuideHandle } from '../../../../kit/Guide'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { FLOE_ANCHORS, FloeHop as World, type FloeEvents } from './floe'
import FLOE_SECTIONS, { type FloeSection } from './sections'

const HINT: Partial<Record<FloeSection, Line>> = L.floe.hint
/** A friend's reaction waits this long after the last one, so they don't chatter after every fling. */
const REACT_GAP_MS = 5000
/** Pebble calls out on the second fling, then every this many. */
const FLY_EVERY = 4
/** Home on Mama's ice: the stamp comes after the cheer, or after this long at most (a clip that never ends). */
const HOME_MAX_MS = 6000

export function FloeHop({ onDone }: ActivityProps) {
  const timers = useTimers()
  const { start, param, enter } = useSections(FLOE_SECTIONS)
  const alive = useAlive()
  const [run, setRun] = useState(() => ({ section: (start ?? 'steady') as FloeSection, layout: Math.max(1, Math.floor(+param('layout')) || 1), n: 0 }))
  const [section, setSection] = useState<FloeSection>(run.section)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [drops, setDrops] = useState(0)
  const [home, setHome] = useState(false)
  const worldRef = useRef<World | null>(null)
  const guide = useRef<GuideHandle>(null)
  const layoutRef = useRef(run.layout)
  layoutRef.current = run.layout
  // The stamp comes once, after the first time home (a replay with 🔁 before it just moves it to the next time home).
  const stamped = useRef(false)
  const homeRun = useRef(0)

  useEffect(() => enter(run.section, { layout: String(run.layout) }), [run])

  // Sparkle says what to do on the ice the game (or a link) starts on: one line, while her hands are already busy.
  useEffect(() => {
    const hint = HINT[run.section]
    if (!hint) return
    const t = timers.later(() => guide.current?.speak(hint), 500)
    return () => clearTimeout(t)
  }, [])

  // The friends' reactions: in turn from each list, and not too often.
  const lastReact = useRef(0)
  const turn = useRef<Record<string, number>>({})
  const react = (key: string, lines: Line[], gap = REACT_GAP_MS) => {
    const now = performance.now()
    if (now - lastReact.current < gap) return
    lastReact.current = now
    const i = turn.current[key] ?? 0
    turn.current[key] = i + 1
    void say(lines[i % lines.length])
  }

  const events = useRef<FloeEvents>({
    section: (s) => {
      setSection(s)
      enter(s, { layout: String(layoutRef.current) })
      if (s === 'drift' || s === 'melt') {
        // Pola says what's new, then Sparkle what to do with it.
        lastReact.current = performance.now()
        void say(L.floe.arrive[s]).then(() => alive() && guide.current?.speak(HINT[s]!, true))
      }
    },
    shake: () => setDrops((n) => n + 1),
    fling: (n) => {
      if (n % FLY_EVERY === 2) react('fly', L.floe.fly)
    },
    flop: () => react('flop', L.floe.flop),
    // (Out of the water: only if nobody is still talking about the splash.)
    dry: () => {
      if (!speakingVoice()) react('dry', L.floe.dry, 2500)
    },
    slide: () => react('slide', L.floe.slide),
    poke: (what) => {
      if (what === 'pola') react('pola', L.floe.pola)
      else if (what === 'mama') react('mama', L.floe.mama)
      else if (what === 'floe') guide.current?.once('poles-floe-ice', L.floe.floeFact)
      else if (what === 'water') guide.current?.once('poles-floe-water', L.floe.waterFact)
      else guide.current?.once(`poles-floe-${what}`, L.floe.facts[what])
    },
    home: () => {
      setHome(true)
      burst()
      lastReact.current = performance.now() + 4000
      const mine = ++homeRun.current
      const still = () => alive() && homeRun.current === mine && !stamped.current
      const stamp = () => {
        if (!still()) return
        stamped.current = true
        onDone()
      }
      // At most this long, unless someone is still cheering (then right after).
      timers.later(() => afterTalk(stamp, 4000), HOME_MAX_MS)
      void (async () => {
        await wait(400)
        if (!alive() || homeRun.current !== mine) return
        await say(L.floe.home, { interrupt: false })
        if (!still()) return
        guide.current?.speak(L.floe.homeCheer, true)
        await wait(1800)
        afterTalk(stamp, 3000)
      })()
    },
  })

  const again = () => {
    homeRun.current++
    setHome(false)
    setSection('steady')
    setRun((r) => ({ section: 'steady', layout: r.layout + 1, n: r.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#CFE9FF', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="The sea ice"
        qaKey="__polesFloeQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new World(renderer, { section: run.section, layout: run.layout }, events.current)}
        anchors={(input, els) => <Anchors list={FLOE_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setRun((r) => ({ ...r, section, n: r.n + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(207,233,255,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          {onDevice('🧊 Tap to wake the sea', '🧊 Click to wake the sea')}
        </button>
      )}
      {/* She shook the water off: drops on the screen. */}
      <AnimatePresence>
        {drops > 0 && (
          <motion.div key={drops} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1.4, ease: 'easeIn' }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15 }}>
            {DROPS.map(([x, y, s], i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, y: 0 }}
                animate={{ scale: 1, y: 40 }}
                transition={{ duration: 1.2, delay: i * 0.03 }}
                style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: s, height: s * 1.2, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: 'rgba(168,220,255,.55)', border: '3px solid rgba(255,255,255,.8)' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <Guide ref={guide} hint={home || section === 'mama' ? null : HINT[section]} quiet={home} />
      {home && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5, type: 'spring' }} style={{ position: 'absolute', right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', zIndex: 20 }}>
          <BigButton onClick={again} ariaLabel="Again, with new floes">
            🔁 🧊
          </BigButton>
        </motion.div>
      )}
    </div>
  )
}

/** Where the drops land on the screen (%), and how big (px). */
const DROPS: [number, number, number][] = [
  [12, 30, 34],
  [24, 62, 22],
  [38, 22, 28],
  [55, 70, 36],
  [68, 34, 24],
  [82, 56, 32],
  [90, 24, 20],
  [46, 46, 18],
  [8, 76, 26],
]

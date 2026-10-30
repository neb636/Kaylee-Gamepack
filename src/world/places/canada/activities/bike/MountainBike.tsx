// Mountain Bike: Maple wants to ride all the way down Mont-Sainte-Anne to the waterfall. The story plays in her gondola
// cabin at the bottom of the line (Maple waves and tells Kaylee, tap anywhere skips), the gondola carries her and the
// bike up, then Kaylee steers the bike down the forest trail (ride.ts is the world). The address bar follows her from
// stretch to stretch (sections.ts), and to whichever way round the island she takes. The steering wheel appears under
// her finger (engine3d/SteerWheel.tsx, the Nan drive's). Sparkle gives the one instruction from the corner (and a hint
// when she's stuck, and says what's new: the two trails, the creek); Maple whoops and giggles in her own voice. At the
// waterfall: Maple cheers, a rainbow, a photo flash, her thank-you, then the stamp (onDone). 🔁 rides down again.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst, lineText, say, SayButton, SparklePuppet, speakingVoice, stopSpeaking, useAlive, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { SteerHint, SteerWheel } from '../../../../engine3d/SteerWheel'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { CanadaActivityProps } from '../props'
import { BIKE_ANCHORS, MountainBike as World, type BikeEvents, type BikeStart } from './ride'
import BIKE_SECTIONS, { type BikeSection } from './sections'

const SAY: Record<BikeSection, string> = {
  story: '🦫 Maple wants to ride down to the waterfall!',
  gondola: '🚡 Up the mountain in the gondola!',
  green: '🚵 Steer the bike down the trail!',
  berms: '🟢 🟦 Pick a way: green or blue!',
  creek: '💦 The creek, then the jump!',
  falls: '🌈 The waterfall!',
}
/** The stretches (one star each in the top bar). */
const PARTS: BikeSection[] = ['green', 'berms', 'creek', 'falls']

export function MountainBike({ onDone, setProgress }: Partial<CanadaActivityProps> = {}) {
  const { start, param, enter } = useSections(BIKE_SECTIONS)
  const [run, setRun] = useState<BikeStart & { n: number }>(() => ({ section: (start ?? 'story') as BikeSection, trail: param('trail') as BikeStart['trail'], n: 0 }))
  const [section, setSection] = useState<BikeSection>(run.section)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [done, setDone] = useState(false)
  /** What Sparkle just said (shown for Dad, with 🔊 to hear it again), or a story line. */
  const [said, setSaid] = useState<{ line: Line; sparkle: boolean; n: number } | null>(null)
  const worldRef = useRef<World | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const trail = useRef(run.trail)
  const finished = useRef(false)
  const alive = useAlive()
  const progress = useRef(setProgress)
  progress.current = setProgress

  useEffect(() => enter(run.section, run.section === 'berms' ? { trail: run.trail } : {}), [run])
  useEffect(() => progress.current?.(Math.max(0, PARTS.indexOf(run.section)), PARTS.length), [])

  // The story: Maple's two lines in her cabin, then up the gondola (a tap anywhere skips).
  const [story, setStory] = useState(run.section === 'story')
  const endStory = () => {
    if (!story) return
    setStory(false)
    setSaid(null)
    worldRef.current?.go()
  }
  useEffect(() => {
    if (!story) return
    let stop = false
    void (async () => {
      await wait(700)
      for (const [i, line] of L.bike.story.entries()) {
        if (stop || !alive()) return
        setSaid({ line, sparkle: false, n: i })
        // (Each line stays up at least a moment, so the story reads even before the voices are recorded.)
        await Promise.all([say(line, { interrupt: i > 0 }), wait(1800)])
        await wait(300)
      }
      if (!stop && alive()) endStory()
    })()
    return () => {
      stop = true
    }
  }, [story])

  const events = useRef<BikeEvents>({
    section: (s) => {
      setSection(s)
      enter(s, s === 'berms' ? { trail: trail.current } : {})
    },
    way: (w) => {
      trail.current = w
      enter('berms', { trail: w })
    },
    progress: (n) => progress.current?.(n, PARTS.length),
    say: (line, chat, voice = true) => {
      // Maple's whoops and the animals' words never cut anyone off; Sparkle's lines do.
      if (chat && speakingVoice()) return
      if (voice) void say(line)
      if (typeof line === 'string') {
        setSaid((s) => ({ line, sparkle: true, n: (s?.n ?? 0) + 1 }))
        void sparkle.current?.play('nod')
      }
    },
    done: () => {
      setDone(true)
      burst()
      if (finished.current) return
      finished.current = true
      // The photo flash, her thank-you, then the stamp.
      void (async () => {
        await wait(2800)
        if (!alive()) return
        await say(L.bike.thanks)
        await wait(900)
        if (alive()) onDone?.()
      })()
    },
  })

  // Sparkle's line stays up for a while, then the section's label comes back.
  useEffect(() => {
    if (!said?.sparkle) return
    const t = setTimeout(() => setSaid((s) => (s === said ? null : s)), 6500)
    return () => clearTimeout(t)
  }, [said])

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, run, events.current)
    w.setWheelElement(wheelRef.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const again = () => {
    setDone(false)
    setSection('green')
    trail.current = 'green'
    setRun((r) => ({ section: 'green', trail: 'green', n: r.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E6EEFB', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="Mont-Sainte-Anne"
        qaKey="__canadaBikeQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={BIKE_ANCHORS} els={els} {...input} />
            <SteerWheel ref={wheelRef} />
            <SteerHint ref={hintRef} />
          </>
        )}
      />
      {story && (
        <button
          aria-label="Skip"
          onClick={() => {
            stopSpeaking()
            endStory()
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 28, background: 'transparent', border: 'none' }}
        />
      )}
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setRun((r) => ({ ...r, section: section === 'story' ? 'gondola' : section, n: r.n + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(230,238,251,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🚵 Tap to wake the mountain
        </button>
      )}
      {/* The photo at the waterfall: a flash. */}
      <AnimatePresence>
        {done && <motion.div key="flash" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0] }} transition={{ delay: 2, duration: 0.7 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 25 }} />}
      </AnimatePresence>
      {/* Sparkle in the corner when she speaks. */}
      <AnimatePresence>
        {said?.sparkle && (
          <motion.div key="sparkle" initial={{ y: 140, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 140, opacity: 0 }} style={{ position: 'absolute', left: 8, bottom: 'calc(var(--safe-bottom) + 4px)', zIndex: 21, pointerEvents: 'none' }}>
            <SparklePuppet ref={sparkle} height="clamp(84px, 16vmin, 140px)" />
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ position: 'absolute', left: 'clamp(84px, 16vmin, 150px)', right: 'clamp(84px, 16vmin, 150px)', bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 29 }}>
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={again} ariaLabel="Ride down again">
              🔁 🚵
            </BigButton>
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          <motion.div key={said ? `said-${said.n}-${lineText(said.line)}` : section} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={{ ...PILL, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{said ? lineText(said.line) : SAY[section]}</span>
            {said?.sparkle && (
              <span style={{ pointerEvents: 'auto' }}>
                <SayButton text={said.line} size={44} />
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
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

// 🥟 The Dumpling House in 3D (plan: planning/around-the-world/china/dumpling-house.html): Chef Fu's dumpling counter in
// Shanghai (counter.ts is the world). The bare link carries on from the round she reached last time (saved between
// rounds, like the 2D one was): the opening (Dou Dou and Chef Fu, while the dough is already squishable), Grandpa
// Turtle's half-moons, the Bunny Twins' and Mrs Goose's soup dumplings, Bao Bao's giant one, then the payoff (her
// dumplings go in the shop window) and the stamp. Sparkle, in the corner, says the one instruction when something new
// appears and helps when she's stuck; tap her or the line to hear it again. The address bar follows her from round to
// round (sections.ts).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { lineText, say, SparklePuppet, useSaved, type Line, type PuppetHandle } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { COUNTER_ANCHORS, DumplingCounter as World, type CounterEvents, type CounterStart, type RoundId } from './counter'
import DUMPLING_SECTIONS, { type DumplingSection, type Step } from './sections'

const D = L.dumplings
/** Where she carries on from, by how many rounds she has finished. */
const RESUME: DumplingSection[] = ['open', 'colors', 'giant', 'payoff']
const ROUND_N: Record<RoundId, number> = { play: 0, grandpa: 1, colors: 2, giant: 3 }
const ICON: Record<DumplingSection, string> = { open: '🥟', play: '🥟', grandpa: '🐢', colors: '🐰', giant: '🐼', payoff: '🏆' }

export function DumplingHouse({ onDone, setProgress }: Partial<ActivityProps> = {}) {
  const { start, param, enter } = useSections(DUMPLING_SECTIONS)
  const [saved, setSaved] = useSaved('china-dumplings', { service: 0 })
  const [window_, setWindow] = useSaved<string[]>('china-dumplings-window', [])
  const [run, setRun] = useState<CounterStart & { n: number }>(() => {
    const section = (start ?? RESUME[Math.min(3, saved.service)] ?? 'open') as DumplingSection
    const linked = param('made')
    const made = linked ? linked.split(',').filter(Boolean) : []
    return { section, at: (param('at') as Step) || 'dough', window: section === 'payoff' && made.length ? made : window_, n: 0 }
  })
  const [section, setSection] = useState<DumplingSection>(run.section)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [line, setLine] = useState<Line>(run.section === 'open' ? D.open[0] : D.squish)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const finished = useRef(false)
  const cb = useRef({ onDone, setProgress, setSaved, setWindow, window_ })
  cb.current = { onDone, setProgress, setSaved, setWindow, window_ }

  const progress = (rounds: number) => cb.current.setProgress?.(rounds, 3)
  useEffect(() => {
    enter(run.section, run.section === 'payoff' ? { made: run.window.join(',') } : run.section === 'open' || run.section === 'play' ? {} : { at: run.at })
    progress(Math.max(0, RESUME.indexOf(run.section)))
  }, [run])

  const events = useRef<CounterEvents>({
    section: (s, made) => {
      setSection(s)
      enter(s, s === 'payoff' ? { made: made.join(',') } : {})
    },
    guide: (l, voice = true) => {
      setLine(l)
      sparkle.current?.play('wave')
      if (voice) void say(l, { interrupt: false })
    },
    round: (r) => {
      const n = ROUND_N[r]
      cb.current.setSaved({ service: Math.max(n, 0) })
      progress(n)
    },
    done: (made) => {
      progress(3)
      cb.current.setWindow([...cb.current.window_, ...made].slice(-10))
      // Playing again starts from the opening; the stamp once per visit.
      cb.current.setSaved({ service: 0 })
      if (!finished.current) {
        finished.current = true
        setTimeout(() => cb.current.onDone?.(), 800)
      }
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, run, events.current)
    w.setHintElement(hintRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#BFE4FF', overflow: 'clip' }}>
      <style>{HINT_CSS}</style>
      <View3D
        key={run.n}
        name="the dumpling house"
        qaKey="__chinaDumplingsQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={COUNTER_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="dumpling-hint" data-kind="press" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setRun((r) => ({ ...r, section, n: r.n + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(255,247,240,.9)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🥟 Tap to wake the kitchen
        </button>
      )}
      {/* Sparkle in the corner: she gives the instructions; a tap hears the last one again. */}
      <button
        aria-label="Hear it again"
        onClick={() => {
          sparkle.current?.play('nod')
          void say(line)
        }}
        style={{ position: 'absolute', left: 'max(8px, env(safe-area-inset-left))', bottom: 'calc(var(--safe-bottom, 0px) + 4px)', width: 'var(--target, 88px)', height: 'calc(var(--target, 88px) * 1.25)', zIndex: 21, background: 'none', border: 'none', padding: 0 }}
      >
        <SparklePuppet ref={sparkle} height="100%" lookToward={0.6} />
      </button>
      <div style={{ position: 'absolute', left: 'calc(var(--target, 88px) + 16px)', right: 'calc(var(--target, 88px) + 16px)', bottom: 'calc(var(--safe-bottom, 0px) + 14px)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
        <AnimatePresence mode="popLayout">
          <motion.button key={lineText(line)} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL} onClick={() => void say(line)} aria-label="Hear it again">
            {ICON[section]} {lineText(line)}
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  )
}

const PILL = {
  background: 'rgba(255,255,255,.92)',
  color: 'var(--ink)',
  borderRadius: 999,
  border: 'none',
  padding: '8px 20px',
  fontSize: 'clamp(16px, 2.4vmin, 22px)',
  fontWeight: 600,
  fontFamily: 'inherit',
  boxShadow: 'var(--shadow)',
  textAlign: 'center' as const,
  maxWidth: '100%',
  pointerEvents: 'auto' as const,
}

/** The hint's hand: a drag from one thing toward another (--dx, --dy), or a press. */
const HINT_CSS = `
.dumpling-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; --dx: 120px; --dy: 0px; }
.dumpling-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); }
.dumpling-hint[data-kind="drag"] span { animation: dumpling-drag 1.8s ease-in-out infinite; }
.dumpling-hint[data-kind="press"] span { animation: dumpling-press 1.2s ease-in-out infinite; }
@keyframes dumpling-drag {
  0% { transform: translate(0, 0) scale(1.15); opacity: 0; }
  15% { transform: translate(0, 0) scale(1); opacity: 1; }
  75% { transform: translate(var(--dx), var(--dy)); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
}
@keyframes dumpling-press {
  0%, 100% { transform: scale(1); }
  45% { transform: scale(0.82) translateY(6px); }
}
`

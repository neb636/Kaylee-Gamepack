// Carnival Snowballs: Kaylee rolls snowballs in the snowy park below Quebec City's castle hotel, stacks them into
// snowmen, dresses them for the Winter Carnival and starts the parade (carnival.ts is the world). The bare link opens
// with the story (Maple waves and asks for snowmen, in the scene; a touch skips it). Sparkle, in the corner, says the one
// instruction for each part when it begins and helps when Kaylee is stuck; tap her or the line to hear it again. The
// address bar follows her from part to part (sections.ts) and keeps how many snowmen she has made. After the parade the
// stamp (onDone); "again" starts a fresh park.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst, lineText, say, SparklePuppet, spendHint, type Line, type PuppetHandle } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { CanadaActivityProps } from '../props'
import { CarnivalSnowballs as World, SNOW_ANCHORS, type HintKind, type SnowEvents, type SnowStart } from './carnival'
import SNOWMAN_SECTIONS, { type BallSize, type SnowmanSection } from './sections'

const S = L.snowman
/** What Sparkle says (and the line shows) as each part begins. The story is Maple's. */
const SAY: Record<SnowmanSection, Line> = {
  story: S.story[0],
  roll: S.roll,
  stack: S.stack,
  dress: S.dress,
  parade: S.parade,
}
const ICON: Record<SnowmanSection, string> = { story: '🎪', roll: '⛄', stack: '⛄', dress: '🎩', parade: '🎺' }
const PARTS: SnowmanSection[] = ['roll', 'stack', 'dress', 'parade']
const DEFAULT_SNOWMEN: Partial<Record<SnowmanSection, number>> = { dress: 1, parade: 4 }
/** Sparkle doesn't repeat a hint sooner than this (s). */
const HINT_GAP = 16

export function CarnivalSnowballs({ onDone, setProgress }: Partial<CanadaActivityProps> = {}) {
  const { start, param, enter } = useSections(SNOWMAN_SECTIONS)
  const [run, setRun] = useState<SnowStart & { n: number }>(() => {
    const section = (start ?? 'story') as SnowmanSection
    const n = Number(param('snowmen')) || DEFAULT_SNOWMEN[section] || 0
    return { section, size: param('size') as BallSize, snowmen: n, n: 0 }
  })
  const [section, setSection] = useState<SnowmanSection>(run.section)
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [done, setDone] = useState(false)
  const [line, setLine] = useState<Line>(SAY[run.section])
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const finished = useRef(false)
  const lastHint = useRef(-Infinity)
  const cb = useRef({ onDone, setProgress })
  cb.current = { onDone, setProgress }

  const state = (s: SnowmanSection, snowmen: number) => (s === 'stack' ? { size: run.size } : s === 'dress' || s === 'parade' ? { snowmen: String(Math.max(1, snowmen)) } : {})
  const progress = (s: SnowmanSection) => cb.current.setProgress?.(Math.max(0, PARTS.indexOf(s)), PARTS.length)
  useEffect(() => {
    enter(run.section, state(run.section, run.snowmen))
    progress(run.section)
  }, [run])

  /** Sparkle says it (after whoever is talking), and the line shows it. */
  const guide = (l: Line, voice = true) => {
    setLine(l)
    sparkle.current?.play('wave')
    if (voice) void say(l, { interrupt: false })
  }
  // A section link that starts past the story: Sparkle says what to do there.
  useEffect(() => {
    if (run.section !== 'story' && run.section !== 'parade') guide(SAY[run.section])
  }, [run])

  const events = useRef<SnowEvents>({
    section: (s, snowmen) => {
      setSection(s)
      enter(s, state(s, snowmen))
      progress(s)
      if (s === 'parade') setLine(SAY.parade)
      else guide(SAY[s])
    },
    ready: () => {
      setReady(true)
      guide(S.ready)
    },
    hint: (kind: HintKind) => {
      const now = performance.now() / 1000
      if (now - lastHint.current < HINT_GAP) return
      lastHint.current = now
      guide(S.hint[kind], spendHint(S.hint[kind]))
    },
    done: () => {
      setDone(true)
      burst()
      cb.current.setProgress?.(PARTS.length, PARTS.length)
      // The stamp, once (a replay after it doesn't earn another).
      if (!finished.current) {
        finished.current = true
        setTimeout(() => cb.current.onDone?.(), 1200)
      }
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, run, events.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const restart = (s: SnowmanSection) => {
    setDone(false)
    setReady(false)
    setSection(s)
    setLine(SAY[s])
    setRun((r) => ({ ...r, section: s, snowmen: DEFAULT_SNOWMEN[s] ?? 0, n: r.n + 1 }))
  }

  const shown = section === 'dress' && ready && line === S.dress ? S.ready : line
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#DCE6F6', overflow: 'clip' }}>
      <style>{HINT_CSS}</style>
      <View3D
        key={run.n}
        name="the carnival park"
        qaKey="__canadaSnowmanQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={SNOW_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="snow-hint" data-kind="drag" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            restart(section)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(220,230,246,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          ⛄ Tap to wake the park
        </button>
      )}
      {/* Sparkle in the corner: she gives the instructions; a tap hears the last one again. */}
      {section !== 'story' && (
        <button
          aria-label="Hear it again"
          onClick={() => {
            sparkle.current?.play('nod')
            void say(shown)
          }}
          style={{ position: 'absolute', left: 'max(8px, env(safe-area-inset-left))', bottom: 'calc(var(--safe-bottom) + 4px)', width: 'var(--target, 88px)', height: 'calc(var(--target, 88px) * 1.25)', zIndex: 21, background: 'none', border: 'none', padding: 0 }}
        >
          <SparklePuppet ref={sparkle} height="100%" lookToward={0.6} />
        </button>
      )}
      <div style={{ position: 'absolute', left: 'calc(var(--target, 88px) + 16px)', right: 'calc(var(--target, 88px) + 16px)', bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={() => restart('roll')} ariaLabel="Make more snowmen">
              🔁 ⛄
            </BigButton>
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          <motion.button key={lineText(shown)} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL} onClick={() => void say(shown)} aria-label="Hear it again">
            {ICON[section]} {lineText(shown)}
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

/** The hint's hand: a push from the ball toward where it should go (--dx, --dy), or a press on the drum. */
const HINT_CSS = `
.snow-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; --dx: 120px; --dy: 0px; }
.snow-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); }
.snow-hint[data-kind="drag"] span { animation: snow-drag 1.8s ease-in-out infinite; }
.snow-hint[data-kind="press"] span { animation: snow-press 1.2s ease-in-out infinite; }
@keyframes snow-drag {
  0% { transform: translate(0, 0) scale(1.15); opacity: 0; }
  15% { transform: translate(0, 0) scale(1); opacity: 1; }
  75% { transform: translate(var(--dx), var(--dy)); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
}
@keyframes snow-press {
  0%, 100% { transform: scale(1); }
  45% { transform: scale(0.82) translateY(6px); }
}
`

// Carnival Snowballs (greybox 9): Kaylee rolls snowballs in the snowy park below Quebec City's castle hotel, stacks
// them into snowmen, dresses them for the Winter Carnival and starts the parade (carnival.ts is the world). The address
// bar follows her from part to part (sections.ts) and keeps how many snowmen she has made. No voices yet (the full-loop
// gate): a short line at the bottom says what's on screen, for Dad. After the parade, "again" starts a fresh park.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { CarnivalSnowballs as World, SNOW_ANCHORS, type SnowEvents, type SnowStart } from './carnival'
import SNOWMAN_SECTIONS, { type BallSize, type SnowmanSection } from './sections'

const SAY: Record<SnowmanSection, string> = {
  roll: '⛄ Push the snowball! Watch it grow!',
  stack: '⛄ Roll the little ball into the big one!',
  dress: '🎩 Roll a snowball into the hat box and the sash box!',
  parade: '🎺 The carnival parade!',
}
const READY = '🥁 Tap the drum to start the parade!'
const DEFAULT_SNOWMEN: Partial<Record<SnowmanSection, number>> = { dress: 1, parade: 4 }

export function CarnivalSnowballs() {
  const { start, param, enter } = useSections(SNOWMAN_SECTIONS)
  const [run, setRun] = useState<SnowStart & { n: number }>(() => {
    const section = (start ?? 'roll') as SnowmanSection
    const n = Number(param('snowmen')) || DEFAULT_SNOWMEN[section] || 0
    return { section, size: param('size') as BallSize, snowmen: n, n: 0 }
  })
  const [section, setSection] = useState<SnowmanSection>(run.section)
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [done, setDone] = useState(false)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  const state = (s: SnowmanSection, snowmen: number) => (s === 'stack' ? { size: run.size } : s === 'dress' || s === 'parade' ? { snowmen: String(Math.max(1, snowmen)) } : {})
  useEffect(() => enter(run.section, state(run.section, run.snowmen)), [run])

  const events = useRef<SnowEvents>({
    section: (s, snowmen) => {
      setSection(s)
      enter(s, state(s, snowmen))
    },
    ready: () => setReady(true),
    done: () => {
      setDone(true)
      burst()
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
    setRun((r) => ({ ...r, section: s, snowmen: DEFAULT_SNOWMEN[s] ?? 0, n: r.n + 1 }))
  }

  const line = section === 'dress' && ready ? READY : SAY[section]
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
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={() => restart('roll')} ariaLabel="Make more snowmen">
              🔁 ⛄
            </BigButton>
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          <motion.div key={line} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
            {line}
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

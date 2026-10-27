// Red Canoe (greybox 5): Kaylee paddles the red canoe across Banff's turquoise lake (paddle.ts is the world). The
// address bar follows her from part to part (sections.ts) and keeps how she paddles (`?paddle=stroke` or `pull`); the
// little switch at the top right swaps between the two so Dad can try them side by side. No voices yet (the full-loop
// gate): a short line at the bottom says what's on screen, for Dad. With the loon family at the glacier, "again" sets
// off from the dock once more.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { CANOE_ANCHORS, RedCanoe as World, type CanoeEvents, type CanoeStart } from './paddle'
import CANOE_SECTIONS, { type CanoeSection, type PaddleMode } from './sections'

const SAY: Record<CanoeSection, Record<PaddleMode, string>> = {
  glide: { stroke: '🛶 Pull the paddle back through the water!', pull: '🛶 Hold the water where the canoe should go!' },
  stream: { stroke: '✨ Paddle to the milky water by the glacier stream!', pull: '✨ Go to the milky water by the glacier stream!' },
  loon: { stroke: '🫧 Follow the bubbles to find the loon!', pull: '🫧 Follow the bubbles to find the loon!' },
  glacier: { stroke: '💙 The loon family! The whole lake glows!', pull: '💙 The loon family! The whole lake glows!' },
}
const FOUND = '🏔️ Rock flour from the glacier makes the lake so blue!'

export function RedCanoe() {
  const { start, param, enter } = useSections(CANOE_SECTIONS)
  const [run, setRun] = useState<CanoeStart & { n: number }>(() => ({ section: (start ?? 'glide') as CanoeSection, paddle: param('paddle') as PaddleMode, n: 0 }))
  const [section, setSection] = useState<CanoeSection>(run.section)
  const [found, setFound] = useState(false)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [done, setDone] = useState(false)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const paddle = useRef(run.paddle)
  paddle.current = run.paddle

  useEffect(() => enter(run.section, { paddle: run.paddle }), [run])

  const events = useRef<CanoeEvents>({
    section: (s) => {
      setSection(s)
      setFound(false)
      enter(s, { paddle: paddle.current })
    },
    found: () => setFound(true),
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
  const restart = (s: CanoeSection, p: PaddleMode) => {
    setDone(false)
    setFound(false)
    setSection(s)
    setRun((r) => ({ section: s, paddle: p, n: r.n + 1 }))
  }

  const other: PaddleMode = run.paddle === 'stroke' ? 'pull' : 'stroke'
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#C4E8FA', overflow: 'clip' }}>
      <style>{HINT_CSS}</style>
      <View3D
        key={run.n}
        name="the turquoise lake"
        qaKey="__canadaCanoeQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={CANOE_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="canoe-hint" data-mode={run.paddle} style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            restart(section, run.paddle)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(196,232,250,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🛶 Tap to wake the lake
        </button>
      )}
      {/* For Dad: try the other way to paddle, from the same part of the lake. */}
      <button
        onClick={() => restart(section === 'glacier' ? 'loon' : section, other)}
        aria-label={`Paddle by ${other} instead`}
        style={{ position: 'absolute', right: 12, top: 'calc(var(--top-clear) + 6px)', zIndex: 20, minHeight: 56, padding: '6px 16px', borderRadius: 999, border: 'none', background: 'rgba(255,255,255,.88)', boxShadow: 'var(--shadow)', fontSize: 'clamp(14px, 2vmin, 18px)', fontWeight: 600, color: 'var(--ink)' }}
      >
        {run.paddle === 'stroke' ? '🛶 Stroke' : '👆 Pull'} <span style={{ opacity: 0.55 }}>→ {other === 'stroke' ? '🛶' : '👆'}</span>
      </button>
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 4, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={() => restart('glide', run.paddle)} ariaLabel="Paddle again">
              🔁 🛶
            </BigButton>
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          <motion.div key={found ? 'found' : section} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
            {found ? FOUND : SAY[section][run.paddle]}
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

/** The hint's hand: a stroke drawn back beside the canoe, or a press on the water ahead of it. */
const HINT_CSS = `
.canoe-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; }
.canoe-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); }
.canoe-hint[data-mode="stroke"] span { animation: canoe-stroke 1.6s ease-in-out infinite; }
.canoe-hint[data-mode="pull"] span { animation: canoe-press 1.4s ease-in-out infinite; }
@keyframes canoe-stroke {
  0% { transform: translate(0, -70px); opacity: 0; }
  15% { transform: translate(0, -70px); opacity: 1; }
  70% { transform: translate(0, 50px); opacity: 1; }
  100% { transform: translate(0, 50px); opacity: 0; }
}
@keyframes canoe-press {
  0%, 100% { transform: scale(1); }
  45% { transform: scale(0.82) translateY(6px); }
}
`

// Whale Watch (greybox 7): Kaylee steers Maple's little boat out of Tofino's harbour to the otters, the whales and the
// orca family (watch.ts is the world). The address bar follows her from part to part (sections.ts) and keeps how she
// steers (`?steer=finger` or `wheel`); the little switch at the top right swaps between the two so Dad can try them
// side by side. No voices yet (the full-loop gate): a short line at the bottom says what's on screen, for Dad. After
// the orca family's big jump, "again" sets off from the harbour once more.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { SteerHint, SteerWheel } from '../../../../engine3d/SteerWheel'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import WHALE_SECTIONS, { type SteerMode, type WhaleSection } from './sections'
import { WHALE_ANCHORS, WhaleWatch as World, type WhaleEvents, type WhaleStart } from './watch'

const SAY: Record<WhaleSection, Record<SteerMode, string>> = {
  harbour: { finger: '🚤 Hold the water where the boat should go!', wheel: '🚤 Hold and steer the boat out of the harbour!' },
  otters: { finger: '🦦 Go gently to the sleepy otter and take her home!', wheel: '🦦 Go gently to the sleepy otter and take her home!' },
  spouts: { finger: '🐋 A spout! Steer there to find the whale!', wheel: '🐋 A spout! Steer there to find the whale!' },
  orcas: { finger: '🐬 The orca family! Go fast and turn!', wheel: '🐬 The orca family! Go fast and turn!' },
  listen: { finger: '🎧 Listen! The whales are singing under the water!', wheel: '🎧 Listen! The whales are singing under the water!' },
}
const DONE = '🎉 The whole orca family jumps!'

export function WhaleWatch() {
  const { start, param, enter } = useSections(WHALE_SECTIONS)
  const [run, setRun] = useState<WhaleStart & { n: number }>(() => ({ section: (start ?? 'harbour') as WhaleSection, steer: param('steer') as SteerMode, found: +param('found') || 0, n: 0 }))
  const [section, setSection] = useState<WhaleSection>(run.section)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [done, setDone] = useState(false)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const steerHintRef = useRef<HTMLDivElement>(null)
  const steer = useRef(run.steer)
  steer.current = run.steer

  useEffect(() => enter(run.section, run.section === 'spouts' ? { steer: run.steer, found: String(run.found) } : { steer: run.steer }), [run])

  const events = useRef<WhaleEvents>({
    section: (s) => {
      setSection(s)
      enter(s, { steer: steer.current })
    },
    done: () => {
      setDone(true)
      burst()
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, run, events.current)
    w.setHintElement(hintRef.current)
    w.setWheelElements(wheelRef.current, steerHintRef.current)
    return w
  }
  const restart = (s: WhaleSection, p: SteerMode) => {
    setDone(false)
    setSection(s)
    setRun((r) => ({ section: s, steer: p, found: s === 'spouts' ? (worldRef.current?.qa().found as number) ?? 0 : 0, n: r.n + 1 }))
  }

  const other: SteerMode = run.steer === 'finger' ? 'wheel' : 'finger'
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#CFEAF7', overflow: 'clip' }}>
      <style>{HINT_CSS}</style>
      <View3D
        key={run.n}
        name="the sea off Tofino"
        qaKey="__canadaWhalesQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={WHALE_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="whale-hint" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
            <SteerWheel ref={wheelRef} />
            <SteerHint ref={steerHintRef} />
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            restart(section === 'listen' ? 'orcas' : section, run.steer)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(207,234,247,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🐋 Tap to wake the sea
        </button>
      )}
      {/* For Dad: try the other way to steer, from the same part of the sea. */}
      <button
        onClick={() => restart(section === 'listen' ? 'orcas' : section, other)}
        aria-label={`Steer with the ${other} instead`}
        style={{ position: 'absolute', right: 12, top: 'calc(var(--top-clear) + 6px)', zIndex: 20, minHeight: 56, padding: '6px 16px', borderRadius: 999, border: 'none', background: 'rgba(255,255,255,.88)', boxShadow: 'var(--shadow)', fontSize: 'clamp(14px, 2vmin, 18px)', fontWeight: 600, color: 'var(--ink)' }}
      >
        {run.steer === 'finger' ? '👆 Finger' : '🎡 Wheel'} <span style={{ opacity: 0.55 }}>→ {other === 'finger' ? '👆' : '🎡'}</span>
      </button>
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 4, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={() => restart('harbour', run.steer)} ariaLabel="Go whale watching again">
              🔁 🚤
            </BigButton>
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          <motion.div key={done && section !== 'listen' ? 'done' : section} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
            {done && section !== 'listen' ? DONE : SAY[section][run.steer]}
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

/** The hint's hand: pressing on the water the way to go. */
const HINT_CSS = `
.whale-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; }
.whale-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); animation: whale-press 1.4s ease-in-out infinite; }
@keyframes whale-press {
  0%, 100% { transform: scale(1); }
  45% { transform: scale(0.82) translateY(6px); }
}
`

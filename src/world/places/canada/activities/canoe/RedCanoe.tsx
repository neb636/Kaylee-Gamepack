// Red Canoe: Kaylee paddles Maple's red canoe across the turquoise lake to find Lulu the loon's lost chick and take it
// home to her by the glacier, and then Lulu sings for her (paddle.ts
// is the world; it also does the talking: Maple's hello, Sparkle's one line per part and her help when she's stuck,
// Maple's and the animals' reactions). After the chapter's way-in film (`filmed`) it starts on the water with Sparkle's
// line; from a link or a replay Maple says hello at the dock first. The address bar follows her from part to part
// (sections.ts). The bubble at the bottom shows what Sparkle said (tap it to hear it again). The stars fill part by part;
// when Lulu has sung by the glacier the celebration plays, then onDone (the film out and the stamp), and "again"
// sets off from the dock once more.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst, lineText, say, type Line, useTimers } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { CanadaActivityProps } from '../props'
import { CANOE_ANCHORS, CANOE_PARTS, DONE_S, RedCanoe as World, type CanoeEvents, type CanoeStart } from './paddle'
import CANOE_SECTIONS, { type CanoeSection } from './sections'

/** What the bubble says in each part (Sparkle's line), and its little picture. */
const SAY: Record<CanoeSection, { icon: string; line: Line }> = {
  story: { icon: '🦫', line: L.canoe.story },
  glide: { icon: '🛶', line: L.canoe.go },
  stream: { icon: '🐣', line: L.canoe.stream },
  loon: { icon: '🫧', line: L.canoe.loon },
  glacier: { icon: '🎵', line: L.canoe.sing },
}
const FOUND = { icon: '🐣', line: L.canoe.chickFound }

export function RedCanoe({ onDone, setProgress, filmed }: CanadaActivityProps) {
  const timers = useTimers()
  const { start, enter } = useSections(CANOE_SECTIONS)
  // (Just after the way-in film, no hello at the dock: straight onto the water.)
  const [run, setRun] = useState<CanoeStart & { n: number }>(() => ({ section: start ?? (filmed ? 'glide' : 'story'), n: 0 }))
  const [section, setSection] = useState<CanoeSection>(run.section)
  const [found, setFound] = useState(false)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [done, setDone] = useState(false)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const finished = useRef(false)
  const stampTimer = useRef<number | null>(null)
  const props = useRef({ onDone, setProgress })
  props.current = { onDone, setProgress }

  useEffect(() => enter(run.section), [run])
  useEffect(() => () => void (stampTimer.current && clearTimeout(stampTimer.current)), [])

  const events = useRef<CanoeEvents>({
    section: (s) => {
      setSection(s)
      setFound(false)
      enter(s)
    },
    found: () => setFound(true),
    progress: (n) => props.current.setProgress(n, CANOE_PARTS),
    done: () => {
      setDone(true)
      burst()
      // Lulu has sung: the celebration plays (the loon family round the canoe, Maple cheering), then the stamp, the
      // first time.
      if (!finished.current) {
        finished.current = true
        stampTimer.current = timers.later(() => props.current.onDone(), DONE_S * 1000)
      }
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, run, events.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const restart = (s: CanoeSection) => {
    setDone(false)
    setFound(false)
    setSection(s)
    setRun((r) => ({ section: s, n: r.n + 1 }))
  }

  const bubble = found ? FOUND : SAY[section]
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#C4E8FA', overflow: 'clip' }}>
      <style>{HINT_CSS}</style>
      <View3D
        key={run.n}
        name="Moraine Lake"
        qaKey="__canadaCanoeQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={CANOE_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="canoe-hint" style={{ display: 'none' }}>
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
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(196,232,250,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🛶 Tap to wake the lake
        </button>
      )}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 4, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={() => restart('glide')} ariaLabel="Paddle again">
              🔁 🛶
            </BigButton>
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          <motion.button
            key={found ? 'found' : section}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            onClick={() => void say(bubble.line)}
            aria-label={`Hear it again: ${lineText(bubble.line)}`}
            style={PILL}
          >
            {bubble.icon} {lineText(bubble.line)} <span style={{ opacity: 0.6 }}>🔊</span>
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  )
}

const PILL = {
  pointerEvents: 'auto' as const,
  border: 'none',
  background: 'rgba(255,255,255,.92)',
  color: 'var(--ink)',
  borderRadius: 999,
  padding: '8px 20px',
  minHeight: 48,
  fontSize: 'clamp(16px, 2.4vmin, 22px)',
  fontWeight: 600,
  fontFamily: 'inherit',
  boxShadow: 'var(--shadow)',
  textAlign: 'center' as const,
  maxWidth: '100%',
}

/** The hint's hand: a press on the water ahead of the canoe, toward where she's going. */
const HINT_CSS = `
.canoe-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 4; }
.canoe-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); animation: canoe-press 1.4s ease-in-out infinite; }
@keyframes canoe-press {
  0%, 100% { transform: scale(1); }
  45% { transform: scale(0.82) translateY(6px); }
}
`

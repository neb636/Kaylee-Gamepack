// Misty's Bubble Bath (planning/around-the-world/canada-round-2.md): she rubs a muddy spirit bear clean, fluffs her up
// and paints her with berries, and Misty goes to the big game looking like that. bath.ts is the world; it also does the
// talking (Maple's hello, Sparkle's one line as each tool comes, her help when she's stuck, Misty's and Maple's
// reactions). After the chapter's way-in film (`filmed`) it starts with the sponge in hand and Sparkle's one line; from a
// link or a replay Maple says "Bath time!" first. The address bar follows her from part to part (sections.ts), and a
// link's `?look=` starts the colors and the mirror in that look. Sparkle sits in the corner (tap her to hear the last
// line again); the bubble above the log shows what was said. When Misty has her sweater on: onDone (the film out, the
// stamp), and "again" gives her a fresh muddy bath.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { BigButton, burst, lineText, say, SparklePuppet, type Line, type PuppetHandle, useTimers } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type QAKey, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import { parseMisty } from '../../looks'
import type { CanadaActivityProps } from '../props'
import { BATH_ANCHORS, BubbleBathWorld as World, type BathEvents, type BathStart } from './bath'
import BATH_SECTIONS, { type BathSection } from './sections'

const B = L.bath
/** The bubble's picture for each part. */
const ICON: Record<BathSection, string> = { story: '🛁', wash: '🧽', fluff: '🌬️', colors: '🎨', mirror: '🪞' }
const PARTS: BathSection[] = ['wash', 'fluff', 'colors', 'mirror']
/** (The game's readout for QA: window.__canadaBathQA().) */
const QA_KEY = '__canadaBathQA' as QAKey

/** The link's `look`, if it has one. */
const linkLook = () => {
  const q = new URLSearchParams(location.hash.split('?')[1] ?? '')
  return q.has('look') ? parseMisty(q.get('look')) : null
}

export function BubbleBath({ onDone, setProgress, filmed }: CanadaActivityProps) {
  const timers = useTimers()
  const { start, enter } = useSections(BATH_SECTIONS)
  const [run, setRun] = useState<BathStart & { n: number }>(() => ({ section: (start ?? (filmed ? 'wash' : 'story')) as BathSection, look: linkLook(), filmed: !!filmed, n: 0 }))
  const [section, setSection] = useState<BathSection>(run.section)
  const [line, setLine] = useState<Line>(run.section === 'story' ? B.story[0] : B.rub)
  const [filmLine, setFilmLine] = useState<Line | null>(null)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [done, setDone] = useState(false)
  const worldRef = useRef<World | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const finished = useRef(false)
  const props = useRef({ onDone, setProgress })
  props.current = { onDone, setProgress }

  useEffect(() => {
    enter(run.section)
    props.current.setProgress(Math.max(0, PARTS.indexOf(run.section)), PARTS.length)
  }, [run])

  const events = useRef<BathEvents>({
    section: (s) => {
      setSection(s)
      enter(s)
      props.current.setProgress(Math.max(0, PARTS.indexOf(s)), PARTS.length)
    },
    guide: (l) => {
      setLine(l)
      sparkle.current?.play('wave')
    },
    film: setFilmLine,
    done: () => {
      setDone(true)
      burst()
      props.current.setProgress(PARTS.length, PARTS.length)
      // The film out and the stamp, once (a replay after it doesn't earn another).
      if (!finished.current) {
        finished.current = true
        timers.later(() => props.current.onDone(), 900)
      }
    },
  })

  const make = (renderer: WebGLRenderer) => {
    const w = new World(renderer, run, events.current)
    w.setHintElement(hintRef.current)
    return w
  }
  const restart = () => {
    setDone(false)
    setSection('wash')
    setLine(B.rub)
    setRun((r) => ({ section: 'wash', look: null, filmed: true, n: r.n + 1 }))
  }

  const shown = filmLine ?? line
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#CFEDE6', overflow: 'clip' }}>
      <style>{HINT_CSS}</style>
      <View3D
        key={run.n}
        name="the rainforest river"
        qaKey={QA_KEY}
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={BATH_ANCHORS} els={els} {...input} />
            <div ref={hintRef} className="bath-hint" data-kind="rub" style={{ display: 'none' }}>
              <span>👆</span>
            </div>
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            restart()
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(207,237,230,.9)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🛁 Tap to wake the river
        </button>
      )}
      {/* Sparkle in the corner: she gives the instructions; a tap hears the last one again. */}
      <button
        aria-label="Hear it again"
        onClick={() => {
          sparkle.current?.play('nod')
          void say(line)
        }}
        style={{ position: 'absolute', left: 'max(8px, env(safe-area-inset-left))', bottom: 'calc(var(--safe-bottom) + 4px)', width: 'min(96px, 16vh)', height: 'min(120px, 20vh)', zIndex: 21, background: 'none', border: 'none', padding: 0 }}
      >
        <SparklePuppet ref={sparkle} height="100%" lookToward={0.6} />
      </button>
      <div style={{ position: 'absolute', left: 'min(300px, 36vw)', right: 12, top: 'calc(var(--safe-top) + 12px)', display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 4, type: 'spring' }} style={{ pointerEvents: 'auto' }}>
            <BigButton onClick={restart} ariaLabel="Another bath">
              🔁 🛁
            </BigButton>
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          <motion.button key={lineText(shown)} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL} onClick={() => void say(shown)} aria-label={`Hear it again: ${lineText(shown)}`}>
            {ICON[section]} {lineText(shown)} <span style={{ opacity: 0.6 }}>🔊</span>
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

/** The hint's hand: rubbing back and forth on her tummy, or a press on the pool and the sweater. */
const HINT_CSS = `
.bath-hint { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 6; }
.bath-hint span { position: absolute; left: -26px; top: -10px; font-size: 52px; line-height: 1; filter: drop-shadow(0 3px 4px rgba(43,35,48,.3)); }
.bath-hint[data-kind="rub"] span { animation: bath-rub 1.1s ease-in-out infinite; }
.bath-hint[data-kind="press"] span { animation: bath-press 1.2s ease-in-out infinite; }
@keyframes bath-rub {
  0%, 100% { transform: translate(-34px, 0) rotate(-8deg); }
  50% { transform: translate(34px, 6px) rotate(8deg); }
}
@keyframes bath-press {
  0%, 100% { transform: scale(1); }
  45% { transform: scale(0.82) translateY(6px); }
}
`

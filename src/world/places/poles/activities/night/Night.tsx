// The Longest Night, the Poles' new ending (planning/around-the-world/poles-ending.md): one chapter in three acts.
// Built so far: Act 2, Sing in the Dark (chorus.ts is the 3D world; the toy and the story are described there). Acts 1
// and 3, the films and the goodbye come next; until then the chapter opens from its links only (info.ts: not ready),
// and the end of Act 2 offers 🔁 instead of going on.
// Sparkle in the corner (kit/Guide.tsx) says what to do when each part starts and when she's stuck, and a fact the
// first time something comes up; the friends say their own lines (lines.ts, L.night.chorus).
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BigButton, say, type Line } from '../../../../../sdk'
import { onDevice } from '../../../../../sdk/device'
import { Guide, type GuideHandle } from '../../../../kit/Guide'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { CHORUS_ANCHORS, ChorusWorld, type ChorusEvents, type ChorusTalk, type Phase } from './chorus'
import NIGHT_SECTIONS, { type NightSection } from './sections'

const C = L.night.chorus

export function Night(_: ActivityProps) {
  const { start, enter } = useSections(NIGHT_SECTIONS)
  const [run, setRun] = useState<{ section: NightSection; n: number }>(() => ({ section: (start ?? 'whiteout') as NightSection, n: 0 }))
  const [phase, setPhase] = useState<Phase>('play')
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [hint, setHint] = useState<Line | null>(null)
  const [dots, setDots] = useState<[number, number]>([0, 0])
  const [section, setSection] = useState<NightSection>(run.section)
  const worldRef = useRef<ChorusWorld | null>(null)
  const guide = useRef<GuideHandle>(null)
  const polaTurn = useRef(0)
  // The same line twice within a moment is one line (React mounts the world twice in development).
  const said = useRef({ key: '', at: 0 })
  const fresh = (key: string) => {
    const now = performance.now()
    if (said.current.key === key && now - said.current.at < 400) return false
    said.current = { key, at: now }
    return true
  }

  useEffect(() => {
    setSection(run.section)
    enter(run.section)
  }, [run])

  const lineOf = (what: ChorusTalk): Line => {
    if (what === 'skyFact') return L.hub.pokes.lightsSouth
    if (what === 'pola') return C.pola[polaTurn.current++ % C.pola.length]
    return C[what]
  }

  const events: ChorusEvents = {
    section: (s) => {
      setSection(s)
      enter(s)
    },
    talk: (what, kind) => {
      if (!fresh(`${kind}:${what}`)) return
      const line = lineOf(what)
      if (kind === 'cue') guide.current?.speak(line, true)
      else if (kind === 'fact') guide.current?.once(`night:${what}`, line, true)
      else void say(line, { interrupt: false })
    },
    hint: (what) => setHint(what ? C[what] : null),
    dots: (n, of) => setDots([n, of]),
    phase: setPhase,
  }
  const eventsRef = useRef(events)
  eventsRef.current = events
  // (The world keeps the same handlers for its life; each one calls the latest.)
  const relay = useRef<ChorusEvents>({
    section: (...a) => eventsRef.current.section(...a),
    talk: (...a) => eventsRef.current.talk(...a),
    hint: (...a) => eventsRef.current.hint(...a),
    dots: (...a) => eventsRef.current.dots(...a),
    phase: (...a) => eventsRef.current.phase(...a),
  })

  const again = () => {
    setPhase('play')
    setDots([0, 0])
    setRun((r) => ({ section: 'whiteout', n: r.n + 1 }))
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#2A2766', overflow: 'clip' }}>
      <View3D
        key={run.n}
        name="Sing in the dark"
        qaKey="__polesNightQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => new ChorusWorld(renderer, { section: run.section }, relay.current)}
        anchors={(input, els) => <Anchors list={CHORUS_ANCHORS} els={els} {...input} />}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setRun((r) => ({ section, n: r.n + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(42,39,102,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: '#fff' }}
        >
          {onDevice('🎶 Tap to sing again', '🎶 Click to sing again')}
        </button>
      )}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
        {dots[1] > 0 && (
          <div style={{ display: 'flex', gap: 6 }} aria-hidden>
            {Array.from({ length: dots[1] }, (_, i) => (
              <motion.div key={`${dots[1]}-${i}`} animate={{ scale: i < dots[0] ? [1, 1.4, 1] : 1 }} style={{ width: 18, height: 18, borderRadius: 99, background: i < dots[0] ? 'var(--hotpink)' : 'rgba(255,255,255,.55)', border: '3px solid var(--ink)' }} />
            ))}
          </div>
        )}
      </div>
      {phase === 'end' && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={CORNER}>
          <BigButton onClick={again} ariaLabel="Again">
            🔁 🎶
          </BigButton>
        </motion.div>
      )}
      <Guide ref={guide} hint={phase === 'end' ? null : hint} />
    </div>
  )
}

/** The 🔁 button waits in the corner. */
const CORNER = { position: 'absolute' as const, right: 'calc(var(--safe-right, 0px) + 20px)', top: 'calc(var(--top-clear) + 12px)', zIndex: 25, pointerEvents: 'auto' as const }

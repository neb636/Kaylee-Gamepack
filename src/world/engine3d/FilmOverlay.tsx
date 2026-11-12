// What the screen shows over a 3D film (engine3d/film.ts, docs/films.md): the words being said under the picture
// (with who says them, for the grown-ups: every line is spoken), the storybook look while a memory is told (warm,
// soft at the edges, a page-coloured frame, opened and closed by a round wipe like a page turning), and the ⏭ to skip
// it. The ⏭ skips when it's held for a moment (a ring fills round it), so a stray tap from a five-year-old doesn't
// throw the story away; a grown-up holds it, or presses Escape. A tap anywhere else gets a little sparkle where the
// finger was (nothing in the world reacts during a film, but the screen never ignores her).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { lineText, lineVoice, sounds, type Line } from '../../sdk'
import { TURN_S, type FilmState } from './film'

export interface Speaker {
  name: string
  icon: string
  color: string
}

interface Props {
  state: FilmState | null
  line: Line | null
  /** Who a voice is (the subtitle's chip). */
  speaker?: (voice: string) => Speaker | undefined
  onSkip: () => void
}

/** Seconds the ⏭ has to be held. */
const HOLD_S = 0.7

export function FilmOverlay({ state, line, speaker, onSkip }: Props) {
  const memory = !!state?.memory
  const [sparks, setSparks] = useState<{ x: number; y: number; n: number }[]>([])
  const n = useRef(0)
  useEffect(() => {
    if (!state) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onSkip()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [!!state, onSkip])
  if (!state) return null
  const who = line && speaker ? speaker(lineVoice(line)) : undefined
  return (
    <div
      data-film={state.film}
      data-beat={state.beat}
      onPointerDown={(e) => {
        // A tap on the picture: a sparkle where it was (the world doesn't take taps during a film).
        const r = e.currentTarget.getBoundingClientRect()
        const s = { x: e.clientX - r.left, y: e.clientY - r.top, n: ++n.current }
        setSparks((list) => [...list.slice(-4), s])
        sounds.sparkle()
        setTimeout(() => setSparks((list) => list.filter((x) => x.n !== s.n)), 700)
      }}
      style={{ position: 'absolute', inset: 0, zIndex: 40, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* The storybook look: a warm wash and soft edges, opened by a round wipe from the middle. */}
      <div aria-hidden style={{ ...FILL, pointerEvents: 'none', clipPath: memory ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)', transition: 'clip-path 1.1s cubic-bezier(.6,0,.3,1)' }}>
        {/* (A plain warm wash: a blend mode under the wipe's clip-path doesn't reach the canvas in Safari.) */}
        <div style={{ ...FILL, background: 'rgba(255, 196, 120, 0.13)' }} />
        <div style={{ ...FILL, background: 'radial-gradient(ellipse at 50% 50%, rgba(255,246,230,0) 62%, rgba(255,238,214,.38) 86%, rgba(250,226,196,.75) 100%)' }} />
        <div style={{ ...FILL, inset: 'max(8px, 1.4vmin)', borderRadius: 'clamp(16px, 3.4vmin, 36px)', boxShadow: '0 0 0 100vmax rgba(255,242,222,.96), inset 0 0 0 3px rgba(214,170,120,.6), inset 0 0 26px 6px rgba(255,236,206,.55)' }} />
      </div>
      {/* A page turning (into a memory or out of it): a round wipe of paper covers the screen while the world changes
          under it, then fades away. */}
      <AnimatePresence>
        {state.turn && (
          <motion.div
            key={state.beat}
            aria-hidden
            initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 1 }}
            animate={{ clipPath: ['circle(0% at 50% 50%)', 'circle(75% at 50% 50%)', 'circle(75% at 50% 50%)'], opacity: [1, 1, 0] }}
            transition={{ duration: 1.25, times: [0, TURN_S / 1.25, 1], ease: 'easeInOut' }}
            style={{ ...FILL, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 50%, #FFFDF7 0%, #FFF1DC 60%, #F6DDBA 100%)' }}
          >
            <div style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%', fontSize: 'clamp(40px, 9vmin, 84px)' }}>{state.memory ? '📖' : '✨'}</div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* The words, low in the frame. */}
      <AnimatePresence>
        {line && (
          <motion.div
            key={lineText(line)}
            aria-live="polite"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ position: 'absolute', left: '50%', translate: '-50% 0', bottom: 'calc(var(--safe-bottom) + clamp(10px, 2.2vh, 26px))', maxWidth: 'min(86%, 880px)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(27,22,34,.72)', color: '#FFF', borderRadius: 999, padding: who ? '6px 18px 6px 6px' : '8px 18px', pointerEvents: 'none' }}
          >
            {who && <span title={who.name} style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 20, background: who.color, fontSize: 21, border: '2px solid #fff' }}>{who.icon}</span>}
            <span style={{ fontSize: 'clamp(15px, min(2.6vw, 3.2vh), 25px)', fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>{lineText(line)}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {sparks.map((s) => (
        <motion.div key={s.n} aria-hidden initial={{ scale: 0.3, opacity: 1, rotate: 0 }} animate={{ scale: 1.5, opacity: 0, rotate: 90 }} transition={{ duration: 0.65 }} style={{ position: 'absolute', left: s.x - 22, top: s.y - 22, width: 44, height: 44, fontSize: 36, lineHeight: '44px', textAlign: 'center', pointerEvents: 'none' }}>
          ✨
        </motion.div>
      ))}
      <SkipButton onSkip={onSkip} />
    </div>
  )
}

/** ⏭, held for a moment: a ring fills round it, then the film is skipped. */
function SkipButton({ onSkip }: { onSkip: () => void }) {
  const [held, setHeld] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const up = () => {
    clearTimeout(timer.current)
    setHeld(false)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  const R = 40
  const C = 2 * Math.PI * R
  return (
    <button
      aria-label="Hold to skip the story"
      title="Hold to skip"
      onPointerDown={(e) => {
        e.stopPropagation()
        e.currentTarget.setPointerCapture?.(e.pointerId)
        setHeld(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => {
          setHeld(false)
          sounds.pop()
          onSkip()
        }, HOLD_S * 1000)
      }}
      onPointerUp={up}
      onPointerCancel={up}
      onLostPointerCapture={up}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
      style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 12px)', bottom: 'calc(var(--safe-bottom) + 12px)', width: 'clamp(64px, 11vmin, 92px)', height: 'clamp(64px, 11vmin, 92px)', borderRadius: '50%', border: 'none', padding: 0, background: 'rgba(255,255,255,.88)', boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center', touchAction: 'none', WebkitTouchCallout: 'none', opacity: held ? 1 : 0.8, transform: held ? 'scale(1.08)' : 'scale(1)', transition: 'transform .15s, opacity .15s' }}
    >
      <svg viewBox="0 0 100 100" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={R} fill="none" stroke="#FF4F9A" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={held ? 0 : C} style={{ transition: held ? `stroke-dashoffset ${HOLD_S}s linear` : 'stroke-dashoffset .2s' }} />
      </svg>
      <span aria-hidden style={{ fontSize: 'clamp(26px, 4.6vmin, 38px)', lineHeight: 1 }}>⏭</span>
    </button>
  )
}

const FILL: CSSProperties = { position: 'absolute', inset: 0 }

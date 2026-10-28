// Sparkle in a corner, for scenes where she can't stand in the middle (a 3D world, a full-screen 2D stage): a small
// live Sparkle who gives the instructions, with the line in a bubble beside her (for Dad), and a hint when nothing has
// been touched for a while. Tap her to hear the last line again. The friends speak for themselves (their own voices);
// Sparkle only says what to do. Thailand's house has its own (thailand/activities/hub/Guide.tsx).
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { lineText, say, SparklePuppet, type Line, type PuppetHandle } from '../../sdk'

export interface GuideHandle {
  /** Say a line now. `after`: wait for the line before to finish instead of cutting it off. */
  speak(line: Line, after?: boolean): void
  /** Say a line the first time `key` comes up in this visit to the app (a fact the first time she pokes something). */
  once(key: string, line: Line, after?: boolean): void
}

// Per visit to the app, like Thailand's house.
const told = new Set<string>()

export interface GuideProps {
  /** What to say when she's stuck (the current step's instruction). Changing it restarts the reminders. */
  hint?: Line | null
  /** Seconds with nothing touched (and nobody talking) before the hint. */
  stuckS?: number
  /** Seconds between the reminders after the first, and how many there are for one hint. */
  againS?: number
  maxHints?: number
  /** No hints (a cutscene, the stamp screen). */
  quiet?: boolean
  /** Which bottom corner she stands in. */
  corner?: 'left' | 'right'
}

export const Guide = forwardRef<GuideHandle, GuideProps>(function Guide({ hint = null, stuckS = 8, againS = 20, maxHints = 4, quiet = false, corner = 'left' }, ref) {
  const sparkle = useRef<PuppetHandle>(null)
  const [line, setLine] = useState<Line | null>(null)
  const last = useRef<Line | null>(hint)
  const lastTouch = useRef(performance.now())
  const lastTalk = useRef(0)
  const hints = useRef({ count: 0, last: 0 })
  const hide = useRef<ReturnType<typeof setTimeout>>(undefined)
  const hintRef = useRef(hint)
  hintRef.current = hint

  const speak = (l: Line, after = false) => {
    last.current = l
    lastTalk.current = performance.now()
    setLine(l)
    void sparkle.current?.play('wave')
    clearTimeout(hide.current)
    void say(l, { interrupt: !after }).then(() => {
      lastTalk.current = performance.now()
      hide.current = setTimeout(() => setLine((cur) => (cur === l ? null : cur)), 2200)
    })
  }
  useImperativeHandle(ref, () => ({
    speak,
    once(key, l, after) {
      if (told.has(key)) return
      told.add(key)
      speak(l, after)
    },
  }))

  // A new hint: the reminders start again.
  useEffect(() => {
    hints.current = { count: 0, last: 0 }
    if (hint && !last.current) last.current = hint
  }, [hint])

  // Any touch anywhere resets the "stuck" clock; after a while with nothing touched, the hint.
  useEffect(() => {
    const touch = () => (lastTouch.current = performance.now())
    window.addEventListener('pointerdown', touch, true)
    const timer = setInterval(() => {
      const now = performance.now()
      const h = hintRef.current
      if (quiet || !h || now - lastTouch.current < stuckS * 1000 || now - lastTalk.current < stuckS * 1000) return
      const r = hints.current
      if (r.count >= maxHints || (r.count > 0 && now - r.last < againS * 1000)) return
      r.count++
      r.last = now
      speak(h)
    }, 500)
    return () => {
      window.removeEventListener('pointerdown', touch, true)
      clearInterval(timer)
      clearTimeout(hide.current)
    }
  }, [quiet, stuckS, againS, maxHints])

  const right = corner === 'right'
  return (
    <div
      style={{
        position: 'absolute',
        [right ? 'right' : 'left']: `calc(var(--safe-${right ? 'right' : 'left'}, 0px) + 8px)`,
        bottom: 'calc(var(--safe-bottom) + 6px)',
        display: 'flex',
        flexDirection: right ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 6,
        zIndex: 25,
        pointerEvents: 'none',
        maxWidth: 'calc(100% - 120px)',
      }}
    >
      <button
        aria-label="Sparkle"
        onClick={() => {
          void sparkle.current?.play('hop')
          if (last.current) speak(last.current)
        }}
        style={{ pointerEvents: 'auto', background: 'none', border: 'none', padding: 0, width: 'min(120px, 16vh, 24vw)', height: 'min(140px, 19vh, 28vw)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      >
        <SparklePuppet ref={sparkle} height="100%" lookToward={right ? -0.4 : 0.4} flip={right} />
      </button>
      <AnimatePresence>
        {line && (
          <motion.div
            key={lineText(line)}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ marginBottom: 'min(64px, 8vh)', background: 'rgba(255,255,255,0.95)', color: 'var(--ink)', borderRadius: 'var(--radius)', padding: '10px 16px', boxShadow: 'var(--shadow)', fontSize: 'clamp(16px, min(2.8vw, 3.2vh), 26px)', fontWeight: 600, lineHeight: 1.15, transformOrigin: right ? 'bottom right' : 'bottom left' }}
          >
            {lineText(line)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

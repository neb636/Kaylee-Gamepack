// Sparkle at Agong's house: a small Sparkle in the corner who says the few things there are to say. She welcomes
// Kaylee when the tuk-tuk stops, says what to do the first time she's somewhere new, tells her something true about
// Thailand the first time she pokes certain things, and after a while with nothing touched waves with a hint in her bubble
// (no voice: the house is a toy, there's nothing to be stuck on). Tap Sparkle to hear the last line again. The house's family speak for themselves (house.ts).
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { lineText, say, SparklePuppet, type Line, type PuppetHandle } from '../../../../../sdk'
import { L } from '../../lines'
import type { Spot } from './house'

export interface GuideHandle {
  /** Say a line now (queued after the line before when `after` is set). */
  speak(line: Line, after?: boolean): void
  /** The first time she's somewhere: what to do there. */
  arrivedAt(spot: Spot): void
  /** She poked a thing: a fact, once per visit. */
  poked(id: string): void
}

// Per visit to the app, like the arrival.
const told = new Set<string>()
const STUCK_S = 12
const REMINDER_S = 60
const MAX_REMINDERS = 3

export const Guide = forwardRef<GuideHandle, { spot: Spot; quiet: boolean }>(function Guide({ spot, quiet }, ref) {
  const sparkle = useRef<PuppetHandle>(null)
  const [line, setLine] = useState<Line | null>(null)
  const last = useRef<Line>(L.house.door)
  const lastTouch = useRef(performance.now())
  const lastTalk = useRef(0)
  const lastPoke = useRef(0)
  const reminders = useRef({ count: 0, last: 0 })
  const hide = useRef<ReturnType<typeof setTimeout>>(undefined)
  const spotRef = useRef(spot)
  spotRef.current = spot

  const speak = (l: Line, after = false) => {
    last.current = l
    lastTalk.current = performance.now()
    setLine(l)
    void sparkle.current?.play('wave')
    clearTimeout(hide.current)
    void say(l, { interrupt: !after }).then(() => {
      hide.current = setTimeout(() => setLine((cur) => (cur === l ? null : cur)), 2200)
    })
  }
  /** A hint without the voice: she waves and the bubble shows it for a moment (tap her to hear it). */
  const show = (l: Line) => {
    last.current = l
    setLine(l)
    void sparkle.current?.play('wave')
    clearTimeout(hide.current)
    hide.current = setTimeout(() => setLine((cur) => (cur === l ? null : cur)), 4000)
  }
  const once = (key: string, l: Line, after = false) => {
    if (told.has(key)) return
    told.add(key)
    speak(l, after)
  }

  useImperativeHandle(ref, () => ({
    speak,
    arrivedAt(s) {
      // Sparkle just answered a tap (a deep link straight to the bathroom door): don't talk over that.
      if (performance.now() - lastPoke.current < 5000) return
      if (s === 'downstairs') once('inside', L.house.inside)
      else if (s === 'upstairs') once('upstairs', L.house.upstairs)
    },
    poked(id) {
      const fact = L.house.pokes[id]
      if (id === 'bathroom-door') speak(L.house.bathroom)
      else if (fact && !told.has(`poke:${id}`)) once(`poke:${id}`, fact)
      else return
      lastPoke.current = performance.now()
    },
  }))

  // A new floor visit gets two early hints, then at most one per minute (three total).
  // Moving between objects on the same floor does not reset the allowance.
  useEffect(() => {
    const now = performance.now()
    reminders.current = { count: 0, last: now }
    lastTouch.current = now
  }, [spot])

  // Any touch anywhere resets the "stuck" clock; after a while with nothing touched, a hint for where she is.
  useEffect(() => {
    const touch = () => (lastTouch.current = performance.now())
    window.addEventListener('pointerdown', touch, true)
    const timer = setInterval(() => {
      const now = performance.now()
      if (quiet || now - lastTouch.current < STUCK_S * 1000 || now - lastTalk.current < STUCK_S * 1000) return
      const reminder = reminders.current
      if (reminder.count >= MAX_REMINDERS || now - reminder.last < (reminder.count < 2 ? STUCK_S : REMINDER_S) * 1000) return
      reminder.count++
      reminder.last = now
      lastTouch.current = now
      show(L.house.stuck[spotRef.current])
    }, 1000)
    return () => {
      window.removeEventListener('pointerdown', touch, true)
      clearInterval(timer)
      clearTimeout(hide.current)
    }
  }, [quiet])

  return (
    <div style={{ position: 'absolute', left: 'calc(var(--safe-left, 0px) + 8px + var(--roam-left, 0px))', bottom: 'calc(var(--safe-bottom) + 6px)', display: 'flex', alignItems: 'flex-end', gap: 6, zIndex: 15, pointerEvents: 'none', maxWidth: 'calc(100% - 120px - var(--roam-left, 0px) - var(--roam-right, 0px))' }}>
      <button
        aria-label="Sparkle"
        onClick={() => {
          void sparkle.current?.play('hop')
          speak(last.current)
        }}
        style={{ pointerEvents: 'auto', background: 'none', border: 'none', padding: 0, width: 'min(130px, 17vh, 26vw)', height: 'min(150px, 20vh, 30vw)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      >
        <SparklePuppet ref={sparkle} height="100%" lookToward={0.4} />
      </button>
      <AnimatePresence>
        {line && (
          <motion.div
            key={lineText(line)}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ marginBottom: 'min(70px, 9vh)', background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--radius)', padding: '10px 16px', boxShadow: 'var(--shadow)', fontSize: 'clamp(18px, min(3.2vw, 3.6vh), 28px)', fontWeight: 600, lineHeight: 1.15, transformOrigin: 'bottom left' }}
          >
            {lineText(line)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

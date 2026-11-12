// Sparkle at Agong's house: a small Sparkle in the corner who says the few things there are to say. She welcomes
// Kaylee when the tuk-tuk stops, says what to do the first time she's somewhere new, tells her something true about
// Thailand the first time she pokes certain things, and highlights something after a pause. Tap Sparkle for a hint.
// The house's family speak for themselves (house.ts).
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { lineText, say, spendHint, stopSpeaking, SparklePuppet, type Line, type PuppetHandle } from '../../../../../sdk'
import { L } from '../../lines'
import type { Spot } from './house'

export interface GuideHandle {
  /** Say a line now (queued after the line before when `after` is set). */
  speak(line: Line, after?: boolean): void
  /** Discard guidance owned by the room or toy she just left. */
  clear(): void
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

/** `talk`: say the stuck hint out loud too (the game table, where she can sit waiting on her turn). The house itself only
 *  glows its hint, as hubs do (docs/voices.md). */
export const Guide = forwardRef<GuideHandle, { spot: Spot; quiet: boolean; dressing: boolean; talk?: boolean; hint(glow: boolean): Line | null }>(function Guide({ spot, quiet, dressing, talk = false, hint }, ref) {
  const sparkle = useRef<PuppetHandle>(null)
  const [line, setLine] = useState<Line | null>(null)
  const last = useRef<Line | null>(null)
  const speech = useRef(0)
  const speaking = useRef(false)
  const lastTouch = useRef(performance.now())
  const lastTalk = useRef(0)
  const lastPoke = useRef(0)
  const reminders = useRef({ count: 0, last: 0 })
  const hide = useRef<ReturnType<typeof setTimeout>>(undefined)
  const hintRef = useRef(hint)
  hintRef.current = hint
  const talkRef = useRef(talk)
  talkRef.current = talk

  const speak = (l: Line, after = false) => {
    const spoken = ++speech.current
    last.current = l
    speaking.current = true
    lastTalk.current = performance.now()
    setLine(l)
    void sparkle.current?.play('wave')
    clearTimeout(hide.current)
    void say(l, { interrupt: !after }).then(() => {
      if (spoken !== speech.current) return
      speaking.current = false
      hide.current = setTimeout(() => setLine((cur) => (cur === l ? null : cur)), 2200)
    })
  }
  const speakRef = useRef(speak)
  speakRef.current = speak
  const clear = () => {
    // Invalidate queued audio and its completion callback before showing guidance for the next room.
    speech.current++
    if (speaking.current) stopSpeaking()
    speaking.current = false
    last.current = null
    clearTimeout(hide.current)
    setLine(null)
  }
  const once = (key: string, l: Line, after = false) => {
    if (told.has(key)) return
    told.add(key)
    speak(l, after)
  }

  useImperativeHandle(ref, () => ({
    speak,
    clear,
    arrivedAt(s) {
      // Sparkle just answered a tap (a deep link straight to the bathroom door): don't talk over that.
      if (lastPoke.current && performance.now() - lastPoke.current < 5000) return
      if (s === 'downstairs') once('inside', L.house.inside)
    },
    poked(id) {
      const fact = L.house.pokes[id]
      if (id === 'bathroom-door' && !told.has('bathroom')) once('bathroom', L.house.bathroom)
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
      const line = hintRef.current(true)
      // (spendHint keeps it from nagging: at most twice a visit, spaced out.)
      if (line && talkRef.current && spendHint(line)) speakRef.current(line)
    }, 1000)
    return () => {
      window.removeEventListener('pointerdown', touch, true)
      clearInterval(timer)
    }
  }, [quiet])

  useEffect(() => () => {
    speech.current++
    clearTimeout(hide.current)
  }, [])

  return (
    <div style={{ position: 'absolute', left: 'calc(var(--safe-left, 0px) + 8px + var(--roam-left, 0px))', bottom: 'calc(var(--safe-bottom) + 6px)', display: 'flex', alignItems: 'flex-end', gap: 6, zIndex: 15, pointerEvents: 'none', maxWidth: 'calc(100% - 120px - var(--roam-left, 0px) - var(--roam-right, 0px))' }}>
      <button
        aria-label="Sparkle"
        disabled={quiet && !dressing}
        onClick={() => {
          void sparkle.current?.play('hop')
          // A room instruction is chosen at tap time. Only the open wardrobe can replay its own line.
          const next = dressing ? last.current ?? hintRef.current(false) : hintRef.current(true)
          if (next) speak(next)
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

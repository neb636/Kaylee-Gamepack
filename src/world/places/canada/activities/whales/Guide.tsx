// Who's talking at Whale Peek-a-Boo, out loud in their own recorded voices (lines.ts L.whales, cast.json): Sparkle in
// the corner (the few instructions and hints; tap her to hear her last one again), Maple (her 3D mouth moves with her
// voice) and Ollie the sea otter. A short bubble shows the words for Dad, with who said them. Bottom right, so it never sits under
// Maple's book card (bottom left).
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { lineText, lineVoice, say, sounds, speakingVoice, SparklePuppet, type Line, type PuppetHandle, useTimers } from '../../../../../sdk'

export interface WhaleGuideHandle {
  /** Says it; resolves when it's done. */
  speak(line: Line): Promise<void>
  /** Shows it in the bubble without the voice (a hint the budget in sdk/hints.ts keeps quiet; tap her to hear it). */
  show(line: Line): void
}

export const WHO: Record<string, { name: string; icon: string; color: string }> = {
  maple: { name: 'Maple', icon: '🦫', color: '#FFC93C' },
  otter: { name: 'Ollie', icon: '🦦', color: '#C9B5F7' },
}

export const WhaleGuide = forwardRef<WhaleGuideHandle, { hidden?: boolean }>(function WhaleGuide({ hidden }, ref) {
  const timers = useTimers()
  const sparkle = useRef<PuppetHandle>(null)
  const [line, setLine] = useState<{ l: Line; n: number } | null>(null)
  const last = useRef<Line | null>(null)
  const hide = useRef<number>(undefined)
  const asked = useRef<{ voice: string } | null>(null)

  const show = (l: Line) => {
    setLine((cur) => ({ l, n: (cur?.n ?? 0) + 1 }))
    clearTimeout(hide.current)
  }
  const later = (l: Line) => {
    hide.current = timers.later(() => setLine((cur) => (cur?.l === l ? null : cur)), 1600)
  }

  useImperativeHandle(ref, () => ({
    speak(l) {
      const voice = lineVoice(l)
      if (voice === 'sparkle') {
        last.current = l
        void sparkle.current?.play('wave')
      }
      show(l)
      // Friends' reactions cut in on each other, but Sparkle's lines (and anything said while she talks) wait their turn.
      const now = speakingVoice() ?? asked.current?.voice
      const interrupt = !now || (voice !== 'sparkle' && now !== 'sparkle')
      const mine = { voice }
      asked.current = mine
      return say(l, { interrupt }).then(() => {
        if (asked.current === mine) asked.current = null
        later(l)
      })
    },
    show(l) {
      if (lineVoice(l) === 'sparkle') {
        last.current = l
        void sparkle.current?.play('wave')
      }
      show(l)
      hide.current = timers.later(() => setLine((cur) => (cur?.l === l ? null : cur)), 4000)
    },
  }))
  useEffect(() => () => clearTimeout(hide.current), [])

  const who = line ? WHO[lineVoice(line.l)] : undefined
  return (
    <div style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 8px)', bottom: 'calc(var(--safe-bottom) + 6px)', display: hidden ? 'none' : 'flex', flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 6, zIndex: 33, pointerEvents: 'none', maxWidth: 'calc(100% - 24px)' }}>
      <button
        aria-label="Sparkle"
        onClick={() => {
          void sparkle.current?.play('hop')
          const l = last.current
          if (!l) return sounds.sparkle()
          show(l)
          void say(l).then(() => later(l))
        }}
        style={{ pointerEvents: 'auto', background: 'none', border: 'none', padding: 0, width: 'min(110px, 15vh, 22vw)', height: 'min(130px, 18vh, 26vw)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      >
        <SparklePuppet ref={sparkle} height="100%" lookToward={-0.4} />
      </button>
      {/* popLayout: a line that cuts in takes the old bubble's place at once. In the default mode the old one stayed in
          the row while it faded, so the new one opened squeezed off to its right, then jumped back beside Sparkle. */}
      <AnimatePresence mode="popLayout" anchorX="right" anchorY="bottom">
        {line && (
          <motion.div
            key={line.n}
            aria-live="polite"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            // The gap under the bubble is padding on a wrapper, not margin: popLayout pins a fading bubble by its bottom, and a
            // margin would lift it by that much as it goes.
            style={{ paddingBottom: 'min(56px, 8vh)', transformOrigin: 'bottom right' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--radius)', padding: who ? '6px 14px 6px 6px' : '10px 16px', boxShadow: 'var(--shadow)' }}>
              {who && (
                <span title={who.name} style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 22, background: who.color, fontSize: 24, border: '3px solid #fff' }}>
                  {who.icon}
                </span>
              )}
              <span style={{ fontSize: 'clamp(16px, min(3vw, 3.4vh), 24px)', fontWeight: 600, lineHeight: 1.15 }}>{lineText(line.l)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

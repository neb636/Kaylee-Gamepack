// Who's talking in the bay, out loud in their own recorded voices: Sparkle in the corner (the few instructions and the
// facts; tap her to hear her last line again), and Mommy, Daddy and the village kids (their 3D mouths move with their
// voice). A short bubble shows the words for Dad, with who said them.
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { lineText, lineVoice, say, speakingVoice, SparklePuppet, type Line, type PuppetHandle } from '../../../../../../sdk'
import { L } from '../../../lines'

export interface BayGuideHandle {
  speak(line: Line): void
}

const WHO: Record<string, { name: string; icon: string; color: string }> = {
  ji: { name: 'Mommy', icon: '🦄', color: '#FF8FB8' },
  nick: { name: 'Daddy', icon: '🦄', color: '#7FD1B9' },
  kids: { name: 'The village kids', icon: '⚽', color: '#FFD27A' },
}

export const BayGuide = forwardRef<BayGuideHandle, { hidden?: boolean; raised?: boolean }>(function BayGuide({ hidden, raised }, ref) {
  const sparkle = useRef<PuppetHandle>(null)
  const [line, setLine] = useState<{ l: Line; n: number } | null>(null)
  const last = useRef<Line>(L.bay.hint.drive)
  const hide = useRef<ReturnType<typeof setTimeout>>(undefined)

  useImperativeHandle(ref, () => ({
    speak(l) {
      const voice = lineVoice(l)
      if (voice === 'sparkle') {
        last.current = l
        void sparkle.current?.play('wave')
      }
      setLine((cur) => ({ l, n: (cur?.n ?? 0) + 1 }))
      clearTimeout(hide.current)
      // The family's reactions cut in on each other ("My horn!" right away), but Sparkle's lines and anything said
      // while Sparkle talks wait their turn, so a fact is never cut off.
      const now = speakingVoice()
      const interrupt = !now || (voice !== 'sparkle' && now !== 'sparkle')
      void say(l, { interrupt }).then(() => {
        hide.current = setTimeout(() => setLine((cur) => (cur?.l === l ? null : cur)), 1600)
      })
    },
  }))
  useEffect(() => () => clearTimeout(hide.current), [])

  const who = line ? WHO[lineVoice(line.l)] : undefined
  return (
    <div style={{ position: 'absolute', left: 'calc(var(--safe-left, 0px) + 8px)', bottom: 'calc(var(--safe-bottom) + 6px)', display: hidden ? 'none' : 'flex', alignItems: 'flex-end', gap: 6, zIndex: 33, pointerEvents: 'none', maxWidth: 'calc(100% - 140px)' }}>
      <button
        aria-label="Sparkle"
        onClick={() => {
          void sparkle.current?.play('hop')
          const l = last.current
          setLine((cur) => ({ l, n: (cur?.n ?? 0) + 1 }))
          clearTimeout(hide.current)
          void say(l).then(() => {
            hide.current = setTimeout(() => setLine((cur) => (cur?.l === l ? null : cur)), 1600)
          })
        }}
        style={{ pointerEvents: 'auto', background: 'none', border: 'none', padding: 0, width: 'min(120px, 16vh, 24vw)', height: 'min(140px, 19vh, 28vw)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      >
        <SparklePuppet ref={sparkle} height="100%" lookToward={0.4} />
      </button>
      <AnimatePresence>
        {line && (
          <motion.div
            key={line.n}
            aria-live="polite"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, // Over the pose buttons (on a narrow phone they sit higher, above Sparkle).
            marginBottom: raised ? (window.innerWidth < 600 ? 'calc(min(150px, 20vh, 30vw) + 96px)' : 'clamp(80px, 14vmin, 128px)') : 'min(60px, 8vh)', background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--radius)', padding: who ? '6px 14px 6px 6px' : '10px 16px', boxShadow: 'var(--shadow)', transformOrigin: 'bottom left' }}
          >
            {who && (
              <span title={who.name} style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 46, height: 46, borderRadius: 23, background: who.color, fontSize: 24, border: '3px solid #fff' }}>
                {who.icon}
              </span>
            )}
            <span style={{ fontSize: 'clamp(16px, min(3vw, 3.4vh), 26px)', fontWeight: 600, lineHeight: 1.15 }}>{lineText(line.l)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

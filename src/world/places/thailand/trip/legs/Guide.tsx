// Who's talking on the boat trip, out loud in their own recorded voices (lines.ts, cast.json): Sparkle in the corner
// (the few instructions and the facts; tap her to hear her last line again), and the family, Aunty Sri, the officer,
// the flight attendant and the village kids (their 3D mouths move with their voice). A short bubble shows the words
// for Dad, with who said them.
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { lineText, lineVoice, say, sounds, speakingVoice, SparklePuppet, type Line, type PuppetHandle } from '../../../../../sdk'

export interface TripGuideHandle {
  /** Says it (`mute`: a greybox's line that isn't recorded yet, so only its bubble shows, for a while). */
  speak(line: Line, mute?: boolean): void
}

const WHO: Record<string, { name: string; icon: string; color: string }> = {
  ji: { name: 'Mommy', icon: '🦄', color: '#FF8FB8' },
  nick: { name: 'Daddy', icon: '🦄', color: '#7FD1B9' },
  agong: { name: 'Agong', icon: '🐼', color: '#B9A6F5' },
  jum: { name: 'Jum', icon: '🐘', color: '#FFB3CF' },
  gan: { name: 'Gan', icon: '🦊', color: '#7CC4F2' },
  ken: { name: 'Ken', icon: '🦊', color: '#8FE3C8' },
  bb: { name: 'BB', icon: '🐃', color: '#FFB3D6' },
  sri: { name: 'Aunty Sri', icon: '🐦', color: '#FFC83D' },
  officer: { name: 'Officer', icon: '🐘', color: '#A8B4E8' },
  attendant: { name: 'Flight attendant', icon: '🐧', color: '#FFD3E6' },
  kids: { name: 'The kids', icon: '⚽', color: '#FFD27A' },
  coach: { name: 'Coach', icon: '🐒', color: '#FF8A8A' },
  staff: { name: 'HarborLand', icon: '🐃', color: '#FFD27A' },
  server: { name: 'The Pizza Company', icon: '🦊', color: '#8FD9A8' },
  kid: { name: 'A friend', icon: '🧒', color: '#A8DCFF' },
  clerk: { name: 'The car desk', icon: '🐶', color: '#A8C4F0' },
  farmer: { name: 'Mushroom aunty', icon: '🐃', color: '#8FE3C8' },
  saltaunty: { name: 'Salt aunty', icon: '🐴', color: '#9FD3F7' },
  lung: { name: 'Lung Kham', icon: '🐒', color: '#7FA8E0' },
}

interface Props {
  hidden?: boolean
  /** Sit higher (over the bay's pose buttons). */
  raised?: boolean
  /** What tapping Sparkle says before she has said anything (the bay: how to drive); none: she just hops. */
  idle?: Line
}

export const TripGuide = forwardRef<TripGuideHandle, Props>(function TripGuide({ hidden, raised, idle }, ref) {
  const sparkle = useRef<PuppetHandle>(null)
  const [line, setLine] = useState<{ l: Line; n: number } | null>(null)
  const last = useRef<Line | null>(null)
  const hide = useRef<ReturnType<typeof setTimeout>>(undefined)

  useImperativeHandle(ref, () => ({
    speak(l, mute) {
      const voice = lineVoice(l)
      if (voice === 'sparkle') {
        // (Tapping her says her last line again: only one she can say out loud.)
        if (!mute) last.current = l
        void sparkle.current?.play('wave')
      }
      setLine((cur) => ({ l, n: (cur?.n ?? 0) + 1 }))
      clearTimeout(hide.current)
      if (mute) {
        hide.current = setTimeout(() => setLine((cur) => (cur?.l === l ? null : cur)), 1400 + lineText(l).length * 55)
        return
      }
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
          const l = last.current ?? idle
          if (!l) return sounds.sparkle()
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

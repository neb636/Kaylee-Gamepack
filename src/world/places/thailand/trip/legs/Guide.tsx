// Who's talking on the boat trip, out loud in their own recorded voices (lines.ts, cast.json): Sparkle in the corner
// (the few instructions and the facts; tap her to hear her last line again), and the family, Aunty Sri, the officer,
// the flight attendant and the village kids (their 3D mouths move with their voice). A short bubble shows the words
// for Dad, with who said them.
import { AnimatePresence } from 'motion/react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties } from 'react'
import { lineText, lineVoice, say, sounds, speakingVoice, SparklePuppet, TalkBubble, type Line, type PuppetHandle } from '../../../../../sdk'
import { WHO } from '../../who'

export interface TripGuideHandle {
  /** Says it (`mute`: a greybox's line that isn't recorded yet, so only its bubble shows, for a while). */
  speak(line: Line, mute?: boolean): void
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
  /** Whose line was asked for last and hasn't finished: it counts as talking while its clip is still loading. */
  const asked = useRef<{ voice: string } | null>(null)

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
      // (A line still loading counts too, so a friend's line then Sparkle's, back to back, play in that order.)
      const now = speakingVoice() ?? asked.current?.voice
      const interrupt = !now || (voice !== 'sparkle' && now !== 'sparkle')
      const mine = { voice }
      asked.current = mine
      void say(l, { interrupt }).then(() => {
        if (asked.current === mine) asked.current = null
        hide.current = setTimeout(() => setLine((cur) => (cur?.l === l ? null : cur)), 1600)
      })
    },
  }))
  useEffect(() => () => clearTimeout(hide.current), [])

  const voice = line ? lineVoice(line.l) : undefined
  // Sparkle's own lines need no name tab: she's the one the bubble points at.
  const who = voice && voice !== 'sparkle' ? WHO[voice] : undefined
  return (
    <div className="talk-guide" style={{ position: 'absolute', left: 'calc(var(--safe-left, 0px) + 8px + var(--roam-left, 0px))', bottom: 'calc(var(--safe-bottom) + 6px)', display: hidden ? 'none' : undefined, zIndex: 33, pointerEvents: 'none', maxWidth: 'calc(100% - 140px - var(--roam-left, 0px) - var(--roam-right, 0px))' }}>
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
          <TalkBubble
            key={line.n}
            aria-live="polite"
            who={who}
            tail={who ? 'none' : 'left'}
            size="sm"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            // Over the pose buttons (on a narrow phone they sit higher, above Sparkle).
            style={{ marginBottom: raised ? (window.innerWidth < 600 ? 'calc(min(150px, 20vh, 30vw) + 96px)' : 'clamp(80px, 14vmin, 128px)') : 'min(60px, 8vh)', transformOrigin: 'bottom left', ...(raised ? { '--guide-lift': '96px' } : {}) } as CSSProperties}
          >
            {lineText(line.l)}
          </TalkBubble>
        )}
      </AnimatePresence>
    </div>
  )
})

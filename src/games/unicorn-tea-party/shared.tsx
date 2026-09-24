import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Draggable as SdkDraggable, numberWord, SayButton, say, shuffle, sounds, wait, type DraggableProps } from '../../sdk'
import bear from './assets/bear.webp'
import bunny from './assets/bunny.webp'
import cupcake from './assets/cupcake.webp'
import flower from './assets/flower.webp'
import kitty from './assets/kitty.webp'
import puppy from './assets/puppy.webp'
import scene from './assets/scene.webp'
import star from './assets/star.webp'
import teacup from './assets/teacup.webp'
import teapot from './assets/teapot.webp'

export const art = { bear, bunny, cupcake, flower, kitty, puppy, scene, star, teacup, teapot }

export interface StationProps {
  onDone: () => void
}

/**
 * The SDK Draggable also fires onTap when the finger lifts after a drag, so one drag
 * could count twice (drop + tap). Ignore that trailing tap.
 */
export function Draggable({ onDrop, onTap, ...rest }: DraggableProps) {
  const lastDrop = useRef(0)
  return (
    <SdkDraggable
      {...rest}
      onDrop={(zone) => {
        lastDrop.current = Date.now()
        return onDrop(zone)
      }}
      onTap={() => {
        if (Date.now() - lastDrop.current > 400) onTap?.()
      }}
    />
  )
}

/**
 * Station layout: background, a prompt bubble under the top bar, then the play area.
 * `queuePrompt` waits for the current line (like the last counted number) instead of cutting it off.
 */
export function Stage({ prompt, queuePrompt = false, children }: { prompt: string; queuePrompt?: boolean; children: ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${art.scene})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'calc(var(--safe-top) + 104px) 20px calc(var(--safe-bottom) + 20px)',
        gap: 16,
        overflow: 'hidden',
      }}
    >
      <PromptBubble text={prompt} queue={queuePrompt} />
      <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>{children}</div>
    </div>
  )
}

/** Big readable instruction that is also spoken (and can be heard again). */
export function PromptBubble({ text, queue = false }: { text: string; queue?: boolean }) {
  useEffect(() => {
    void say(text, { interrupt: !queue })
    // Only a new prompt should speak; switching queue mode alone should not repeat it.
  }, [text])
  return (
    <motion.div
      key={text}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        background: 'rgba(255,255,255,0.94)',
        borderRadius: 'var(--radius)',
        padding: '14px 18px 14px 28px',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        maxWidth: 900,
      }}
    >
      <p style={{ fontSize: 'clamp(24px, 3.4vw, 36px)', fontWeight: 600, lineHeight: 1.2 }}>{text}</p>
      <SayButton text={text} size={64} />
    </motion.div>
  )
}

/** 3 answer choices: the right number plus two close ones, shuffled. */
export function numberChoices(answer: number) {
  const options = new Set([answer])
  const nearby = shuffle([answer - 1, answer + 1, answer - 2, answer + 2].filter((n) => n >= 1))
  for (const n of nearby) {
    if (options.size < 3) options.add(n)
  }
  return shuffle([...options])
}

/** "How many?" with number cards. Wrong taps call onHint so the station can count together with her. */
export function HowMany({ answer, onCorrect, onHint }: { answer: number; onCorrect: () => void; onHint: () => void }) {
  const choices = useMemo(() => numberChoices(answer), [answer])
  const [shaking, setShaking] = useState<number | null>(null)
  const [picked, setPicked] = useState<number | null>(null)

  const tap = (number: number) => {
    if (picked !== null || shaking === number) return
    if (number === answer) {
      stopCountTogether()
      setPicked(number)
      sounds.correct()
      setTimeout(onCorrect, 700)
      return
    }

    sounds.oops()
    setShaking(number)
    setTimeout(() => setShaking(null), 500)
    onHint()
  }

  return (
    <div style={{ width: 'min(100%, 430px)', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'clamp(8px, 2vw, 16px)' }}>
      {choices.map((number, i) => (
        <motion.button
          key={number}
          aria-label={`number ${number}`}
          initial={{ scale: 0, rotate: -10 }}
          animate={
            shaking === number
              ? { x: [0, -14, 14, -10, 10, 0], scale: 1, rotate: 0 }
              : picked === number
                ? { scale: [1, 1.2, 1.08], rotate: [0, -6, 6, 0] }
                : { scale: picked !== null ? 0.9 : 1, rotate: 0, opacity: picked !== null ? 0.4 : 1 }
          }
          transition={{ type: 'spring', bounce: 0.5, delay: picked === null && shaking === null ? i * 0.07 : 0 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => tap(number)}
          style={{
            justifySelf: 'center',
            width: 'min(100%, 130px)',
            aspectRatio: '1 / 1',
            minWidth: 0,
            padding: 0,
            borderRadius: 28,
            background: picked === number ? 'var(--mint)' : '#fff',
            boxShadow: 'var(--shadow)',
            fontSize: 'clamp(48px, 12vw, 64px)',
            lineHeight: 1,
            fontWeight: 700,
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
          }}
        >
          {number}
        </motion.button>
      ))}
    </div>
  )
}

let countRun = 0

/** Stop a "count together" hint that is still running (she answered, or another hint started). */
export function stopCountTogether() {
  countRun++
}

/**
 * Point at each item and say the numbers out loud together.
 * Resolves true if it finished, false if it was stopped part way.
 */
export async function countTogether(n: number, setHighlight: (i: number | null) => void, alive: () => boolean) {
  const run = ++countRun
  const stopped = () => {
    if (!alive()) return true
    if (run === countRun) return false
    setHighlight(null)
    return true
  }
  await say("Let's count them together!")
  for (let i = 0; i < n; i++) {
    if (stopped()) return false
    setHighlight(i)
    sounds.note(i)
    await say(numberWord(i + 1))
    await wait(150)
  }
  if (stopped()) return false
  setHighlight(null)
  await say('How many were there?')
  return run === countRun
}

// Dot positions (in %) that are easy to "just see" (like dice), for 1-10 dots.
const PATTERNS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[30, 22], [70, 22], [30, 50], [70, 50], [30, 78], [70, 78]],
  7: [[30, 20], [70, 20], [30, 50], [50, 50], [70, 50], [30, 80], [70, 80]],
  8: [[30, 18], [70, 18], [30, 39], [70, 39], [30, 61], [70, 61], [30, 82], [70, 82]],
  9: [[25, 25], [50, 25], [75, 25], [25, 50], [50, 50], [75, 50], [25, 75], [50, 75], [75, 75]],
  10: [[14, 30], [32, 30], [50, 30], [68, 30], [86, 30], [14, 70], [32, 70], [50, 70], [68, 70], [86, 70]],
}

/** A white card with pink dots, like the dot cards from school. */
export function DotCard({ n, size = 260, highlight = null }: { n: number; size?: number; highlight?: number | null }) {
  const dot = n > 5 ? size * 0.13 : size * 0.17
  return (
    <div data-dots={n} style={{ position: 'relative', width: size, height: size, background: '#fff', borderRadius: 28, boxShadow: 'var(--shadow)', border: '6px solid var(--pink)' }}>
      {PATTERNS[n]?.map(([x, y], i) => (
        <motion.div
          key={i}
          animate={{ scale: highlight === i ? 1.5 : 1 }}
          style={{
            position: 'absolute',
            left: `calc(${x}% - ${dot / 2}px)`,
            top: `calc(${y}% - ${dot / 2}px)`,
            width: dot,
            height: dot,
            borderRadius: '50%',
            background: highlight === i ? 'var(--gold)' : 'var(--hotpink)',
          }}
        />
      ))}
    </div>
  )
}

/** A little number badge that pops up over a counted item. */
export function CountBadge({ n }: { n: number }) {
  return (
    <motion.div
      initial={{ scale: 0, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.6 }}
      style={{
        position: 'absolute',
        top: -18,
        left: '50%',
        marginLeft: -24,
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'var(--hotpink)',
        color: '#fff',
        fontWeight: 700,
        fontSize: 28,
        display: 'grid',
        placeItems: 'center',
        boxShadow: 'var(--shadow)',
        zIndex: 2,
      }}
    >
      {n}
    </motion.div>
  )
}

// Station 3 - Mark and count: flowers in a bouquet can't move, so tap each to put a mark on it.
import { motion } from 'motion/react'
import { useState } from 'react'
import { numberWord, randomInt, say, shuffle, sounds, useAlive } from '../../../sdk'
import { art, countTogether, HowMany, Stage, type StationProps } from '../shared'

// Messy bouquet spots (percent of the bouquet box). Deliberately NOT in a line.
const SLOTS: [number, number][] = [
  [50, 12], [28, 22], [72, 20], [40, 36], [62, 40], [16, 42], [84, 42], [50, 56],
]

export function MarkCount({ onDone }: StationProps) {
  const [rounds] = useState(() => [randomInt(3, 5), randomInt(2, 5), randomInt(6, 8)])
  const [round, setRound] = useState(0)
  const [slots, setSlots] = useState(() => shuffle(SLOTS).slice(0, rounds[0]))
  const [marked, setMarked] = useState<number[]>([])
  const [wiggle, setWiggle] = useState<number | null>(null)
  const [highlight, setHighlight] = useState<number | null>(null)
  const alive = useAlive()
  const n = rounds[round]
  const asking = marked.length === n

  const tap = (i: number) => {
    if (asking) return
    if (marked.includes(i)) {
      sounds.oops()
      setWiggle(i)
      setTimeout(() => setWiggle(null), 400)
      void say('You marked that flower already. Pick another one!')
      return
    }
    const next = [...marked, i]
    setMarked(next)
    sounds.note(next.length - 1)
    void say(numberWord(next.length))
  }

  const correct = async () => {
    const response = round === 0
      ? `There are ${numberWord(n)} flowers! A strategy is a plan that helps you. Marking each flower helped you keep track!`
      : round === 1
        ? `You counted ${numberWord(n)} flowers! Every mark helped you keep track!`
        : `You marked all ${numberWord(n)} flowers! What a beautiful bouquet!`
    await say(response)
    if (!alive()) return
    if (round + 1 < rounds.length) {
      setRound(round + 1)
      setSlots(shuffle(SLOTS).slice(0, rounds[round + 1]))
      setMarked([])
    } else onDone()
  }

  const prompt = asking
    ? 'How many flowers did you mark?'
    : round === 0
      ? "These flowers won't move, so mark each one as you count."
      : round === rounds.length - 1
        ? 'A big bouquet! Mark each flower and count as you go.'
        : 'Here is another bouquet. Mark each flower and count.'

  const box = 'min(460px, 60vw, 42vh)'
  return (
    <Stage prompt={prompt}>
      <div style={{ position: 'relative', width: box, height: box }}>
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          {slots.map(([x, y], i) => (
            <line key={i} x1={x} y1={y} x2={50} y2={90} stroke="#5fbf8f" strokeWidth={2.2} strokeLinecap="round" />
          ))}
          <polygon points="28,72 72,72 57,100 43,100" fill="var(--lavender-dark)" stroke="var(--ink)" strokeWidth={0.6} />
          <polygon points="37,76 63,76 58,86 42,86" fill="#fff" opacity={0.35} />
        </svg>
        {slots.map(([x, y], i) => {
          const order = marked.indexOf(i)
          return (
            <motion.button
              key={`${round}-${i}`}
              aria-label={`flower ${i + 1}`}
              initial={{ scale: 0 }}
              animate={wiggle === i ? { x: [0, -8, 8, -5, 5, 0], scale: 1 } : { scale: highlight === i ? 1.25 : 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              onClick={() => tap(i)}
              style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: '26%', height: '26%', translate: '-50% -50%' }}
            >
              <img src={art.flower} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              {order >= 0 && (
                <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: '-10%', width: '120%', height: '120%' }}>
                  <motion.path d="M 22 55 L 42 75 L 80 25" fill="none" stroke="var(--ink)" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />
                </svg>
              )}
            </motion.button>
          )
        })}
      </div>
      <div style={{ width: '100%', minHeight: 140 }}>
        {asking && <HowMany key={round} answer={n} onCorrect={() => void correct()} onHint={() => void countTogether(n, setHighlight, alive)} />}
      </div>
    </Stage>
  )
}

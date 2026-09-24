// Station 1 - Touch and count: cupcakes in a line, tap each one once while counting.
import { motion } from 'motion/react'
import { useState } from 'react'
import { numberWord, praise, randomInt, say, sounds, useAlive } from '../../../sdk'
import { art, CountBadge, countTogether, HowMany, Stage, type StationProps } from '../shared'

export function TouchCount({ onDone }: StationProps) {
  const [rounds] = useState(() => [randomInt(2, 4), randomInt(3, 5), randomInt(6, 8)])
  const [round, setRound] = useState(0)
  const [counted, setCounted] = useState<number[]>([])
  const [wiggle, setWiggle] = useState<number | null>(null)
  const [highlight, setHighlight] = useState<number | null>(null)
  const alive = useAlive()
  const n = rounds[round]
  const asking = counted.length === n

  const tap = (i: number) => {
    if (asking) return
    if (counted.includes(i)) {
      sounds.oops()
      setWiggle(i)
      setTimeout(() => setWiggle(null), 400)
      void say('You already counted that one!')
      return
    }
    const next = [...counted, i]
    setCounted(next)
    sounds.note(next.length - 1)
    void say(numberWord(next.length))
  }

  const correct = async () => {
    await say(`Yes! ${numberWord(n)} cupcakes! ${praise()} Great counting strategy!`)
    if (!alive()) return
    if (round + 1 < rounds.length) {
      setRound(round + 1)
      setCounted([])
    } else onDone()
  }

  const prompt = asking
    ? 'How many cupcakes are there?'
    : round === 0
      ? 'Touch and count! The cupcakes are in a line. Tap each cupcake and count.'
      : round === rounds.length - 1
        ? 'Bonus round! Lots of cupcakes! Tap each one and count.'
        : 'More cupcakes! Tap each one and count.'

  const size = `min(170px, calc((100vw - 60px) / ${n} - 10px))`
  return (
    <Stage prompt={prompt}>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'flex-end', marginBottom: '6vh' }}>
        {Array.from({ length: n }, (_, i) => {
          const order = counted.indexOf(i)
          return (
            <motion.button
              key={`${round}-${i}`}
              aria-label={`cupcake ${i + 1}`}
              initial={{ y: -300, opacity: 0 }}
              animate={
                wiggle === i
                  ? { x: [0, -10, 10, -6, 6, 0], y: 0, opacity: 1 }
                  : { y: order >= 0 || highlight === i ? [0, -24, 0] : 0, opacity: 1, scale: highlight === i ? 1.2 : 1 }
              }
              transition={{ type: 'spring', bounce: 0.5, delay: counted.length === 0 ? i * 0.06 : 0 }}
              onClick={() => tap(i)}
              style={{ position: 'relative', width: size, height: size }}
            >
              {order >= 0 && <CountBadge n={order + 1} />}
              <img src={art.cupcake} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: order >= 0 ? 'drop-shadow(0 0 12px #fff)' : 'none' }} />
            </motion.button>
          )
        })}
      </div>
      <div style={{ minHeight: 140 }}>
        {asking && <HowMany key={round} answer={n} onCorrect={() => void correct()} onHint={() => void countTogether(n, setHighlight, alive)} />}
      </div>
    </Stage>
  )
}

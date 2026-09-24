// Station 4 - Number match: find the number that matches the dot card, then tap Sparkle that many times to make her hop.
import { useState } from 'react'
import { Mascot, numberWord, randomInt, say, TapCounter, useAlive } from '../../../sdk'
import { countTogether, DotCard, HowMany, Stage, type StationProps } from '../shared'

export function NumberMatch({ onDone }: StationProps) {
  const [rounds] = useState(() => {
    const a = randomInt(2, 5)
    let b = randomInt(1, 5)
    while (b === a) b = randomInt(1, 5)
    return [a, b, randomInt(6, 9)]
  })
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<'match' | 'hop'>('match')
  const [highlight, setHighlight] = useState<number | null>(null)
  const alive = useAlive()
  const n = rounds[round]

  const matched = async () => {
    const response = round === 0
      ? `That's ${numberWord(n)}! You matched the dots!`
      : round === 1
        ? `${numberWord(n)} ${n === 1 ? 'dot' : 'dots'}! You found the number, Kaylee!`
        : `You matched ${numberWord(n)} dots!`
    await say(response)
    if (alive()) setPhase('hop')
  }

  const hopped = async () => {
    await say('Sparkle loved those hops!')
    if (!alive()) return
    if (round + 1 < rounds.length) {
      setRound(round + 1)
      setPhase('match')
    } else onDone()
  }

  const prompt =
    phase === 'hop'
      ? `Tap Sparkle ${numberWord(n)} ${n === 1 ? 'time' : 'times'} to make her hop!`
      : round === rounds.length - 1
        ? 'Bonus card! Count the dots and find their number.'
        : 'How many dots do you see? Tap the matching number.'

  return (
    <Stage prompt={prompt}>
      {phase === 'match' ? (
        <>
          <DotCard key={round} n={n} size={Math.min(280, window.innerHeight * 0.3)} highlight={highlight} />
          <HowMany key={`q${round}`} answer={n} onCorrect={() => void matched()} onHint={() => void countTogether(n, setHighlight, alive)} />
        </>
      ) : (
        <TapCounter key={round} count={n} onDone={() => void hopped()}>
          <Mascot pose="cheer" size={Math.min(300, window.innerHeight * 0.32)} bounce={false} />
        </TapCounter>
      )}
    </Stage>
  )
}

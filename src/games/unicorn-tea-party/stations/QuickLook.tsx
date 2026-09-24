// Station 5 - Challenge: see the dots for only 2 seconds. Can she tell how many without counting?
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { BigButton, numberWord, randomInt, say, sounds, useAlive, wait } from '../../../sdk'
import { countTogether, DotCard, HowMany, Stage, type StationProps } from '../shared'

type Phase = 'ready' | 'peek' | 'ask'

export function QuickLook({ onDone }: StationProps) {
  const [rounds] = useState(() => [randomInt(2, 3), randomInt(4, 5), randomInt(1, 5)])
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<Phase>('ready')
  const [showDots, setShowDots] = useState(false)
  const [highlight, setHighlight] = useState<number | null>(null)
  const alive = useAlive()
  const n = rounds[round]
  const size = Math.min(280, window.innerHeight * 0.3)

  const peek = async () => {
    setPhase('peek')
    setShowDots(true)
    sounds.whoosh()
    await wait(2000)
    if (!alive()) return
    setShowDots(false)
    setPhase('ask')
  }

  const hint = async () => {
    setShowDots(true)
    await countTogether(n, setHighlight, alive)
    if (alive()) setShowDots(false)
  }

  const correct = async () => {
    setShowDots(true)
    await say(`Yes! ${numberWord(n)}! You have super eyes, Kaylee!`)
    if (!alive()) return
    setShowDots(false)
    if (round + 1 < rounds.length) {
      setRound(round + 1)
      setPhase('ready')
    } else onDone()
  }

  const prompt =
    phase === 'ready'
      ? round === 0
        ? "Challenge! I'll show you some dots for just two seconds. Can you tell how many without counting?"
        : 'Ready for another quick look?'
      : phase === 'peek'
        ? 'Look quick!'
        : 'How many dots did you see?'

  return (
    <Stage prompt={prompt}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <AnimatePresence mode="wait">
          {showDots ? (
            <motion.div key="dots" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} exit={{ rotateY: 90 }} transition={{ duration: 0.2 }}>
              <DotCard n={n} size={size} highlight={highlight} />
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: 90 }}
              transition={{ duration: 0.2 }}
              style={{ width: size, height: size, borderRadius: 28, background: 'var(--pink)', boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center', fontSize: size * 0.4, border: '6px solid #fff' }}
            >
              👀
            </motion.div>
          )}
        </AnimatePresence>
        {phase === 'peek' && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 2, ease: 'linear' }}
            style={{ position: 'absolute', bottom: -28, left: 0, right: 0, height: 14, borderRadius: 7, background: 'var(--hotpink)', transformOrigin: 'left' }}
          />
        )}
      </div>
      <div style={{ minHeight: 140, marginTop: 20 }}>
        {phase === 'ready' && (
          <BigButton size="xl" onClick={() => void peek()}>
            I'm ready! 👀
          </BigButton>
        )}
        {phase === 'ask' && <HowMany key={round} answer={n} onCorrect={() => void correct()} onHint={() => void hint()} />}
      </div>
    </Stage>
  )
}

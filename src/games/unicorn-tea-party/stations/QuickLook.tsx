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
    if (!alive()) return
    setShowDots(true)
    const response = round === 0
      ? `You spotted ${numberWord(n)} dots! Nice work!`
      : round === 1
        ? `There were ${numberWord(n)} dots. You spotted them all!`
        : `You saw ${numberWord(n)} ${n === 1 ? 'dot' : 'dots'} right away!`
    await say(response)
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
        ? "Let's play a quick look game. I'll show the dots for two seconds, then you tell me how many you saw."
        : 'Ready for another quick look?'
      : phase === 'peek'
        ? 'Look now!'
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
      <div style={{ width: '100%', minHeight: 140, marginTop: 20, display: 'grid', placeItems: 'center' }}>
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

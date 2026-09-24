// Station 2 - Move and count: drag (or tap) scattered sugar stars into the teapot.
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { DragArea, Draggable, DropZone, numberWord, praise, randomInt, say, shuffle, sounds, useAlive } from '../../../sdk'
import { art, countTogether, HowMany, Stage, type StationProps } from '../shared'

/** Random, non-overlapping spots in a 4x3 grid (with a little wobble). */
function scatter(n: number) {
  return shuffle(Array.from({ length: 12 }, (_, i) => i))
    .slice(0, n)
    .map((cell) => ({ left: (cell % 4) * 25 + 3 + Math.random() * 8, top: Math.floor(cell / 4) * 33 + Math.random() * 8, rot: randomInt(-25, 25) }))
}

export function MoveCount({ onDone }: StationProps) {
  const [rounds] = useState(() => [randomInt(2, 4), randomInt(3, 5), randomInt(6, 7)])
  const [round, setRound] = useState(0)
  const [spots, setSpots] = useState(() => scatter(rounds[0]))
  const [moved, setMoved] = useState<number[]>([])
  const [pot, setPot] = useState(0) // bump to wiggle the teapot
  const [highlight, setHighlight] = useState<number | null>(null)
  const alive = useAlive()
  const n = rounds[round]
  const asking = moved.length === n

  const move = (i: number) => {
    if (moved.includes(i)) return true
    const next = [...moved, i]
    setMoved(next)
    setPot((p) => p + 1)
    sounds.note(next.length - 1)
    void say(numberWord(next.length))
    return true
  }

  const correct = async () => {
    await say(`Yes! ${numberWord(n)} stars in the teapot! ${praise()}`)
    if (!alive()) return
    if (round + 1 < rounds.length) {
      setRound(round + 1)
      setSpots(scatter(rounds[round + 1]))
      setMoved([])
    } else onDone()
  }

  const prompt = asking
    ? 'How many stars did you put in the teapot?'
    : round === 0
      ? 'Move and count! Drag each sugar star into the teapot and count.'
      : round === rounds.length - 1
        ? 'Bonus round! Move every star and count!'
        : 'More stars! Move each one into the teapot.'

  return (
    <Stage prompt={prompt}>
      <DragArea style={{ width: '100%', maxWidth: 900, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 'min(260px, 28vh)' }}>
          <AnimatePresence>
            {spots.map((s, i) =>
              moved.includes(i) ? null : (
                <motion.div
                  key={`${round}-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: s.rot }}
                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.25 } }}
                  style={{ position: 'absolute', left: `${s.left}%`, top: `${s.top}%`, width: 'min(120px, 18vw)' }}
                >
                  <Draggable onDrop={(zone) => (zone === 'teapot' ? move(i) : false)} onTap={() => move(i)}>
                    <img src={art.star} alt="sugar star" style={{ width: '100%' }} />
                  </Draggable>
                </motion.div>
              ),
            )}
          </AnimatePresence>
        </div>
        <DropZone id="teapot" style={{ position: 'relative' }}>
          <motion.div key={pot} animate={pot ? { rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] } : {}} style={{ position: 'relative' }}>
            <img src={art.teapot} alt="teapot" style={{ width: 'min(260px, 34vw, 24vh)' }} />
            {moved.length > 0 && (
              <div style={{ position: 'absolute', top: '42%', left: 0, right: 0, textAlign: 'center' }}>
                <motion.span
                  key={moved.length}
                  initial={{ scale: 0 }}
                  animate={{ scale: highlight !== null ? 1.4 : 1 }}
                  style={{ display: 'inline-block', background: 'var(--hotpink)', color: '#fff', borderRadius: 999, padding: '2px 20px', fontSize: 40, fontWeight: 700 }}
                >
                  {highlight !== null ? highlight + 1 : moved.length}
                </motion.span>
              </div>
            )}
          </motion.div>
        </DropZone>
      </DragArea>
      <div style={{ minHeight: 140 }}>
        {asking && <HowMany key={round} answer={n} onCorrect={() => void correct()} onHint={() => void countTogether(n, setHighlight, alive)} />}
      </div>
    </Stage>
  )
}

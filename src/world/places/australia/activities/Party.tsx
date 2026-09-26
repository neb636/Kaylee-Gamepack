// The finale: a sunset party at the Sydney Opera House with every friend she helped. Tap them to dance, then fireworks!
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { bigCelebration, burst, Mascot, say, sounds, useAlive, wait } from '../../../../sdk'
import { Stage } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { art } from '../art'
import { L } from '../lines'

type Guest = { img: string; line: string; name: string }

export function Party({ guests, onDone, setProgress }: { guests: Guest[]; onDone: () => void; setProgress: (done: number, total: number) => void }) {
  const [story, setStory] = useState(true)
  const [danced, setDanced] = useState<number[]>([])
  const [dancing, setDancing] = useState<number | null>(null)
  const [fireworks, setFireworks] = useState(false)
  const alive = useAlive()

  useEffect(() => setProgress(danced.length, guests.length), [danced.length, guests.length, setProgress])

  const dance = async (i: number) => {
    if (fireworks) return
    setDancing(i)
    sounds.note(i * 2)
    void say(guests[i].line)
    setTimeout(() => alive() && setDancing(null), 900)
    if (danced.includes(i)) return
    const next = [...danced, i]
    setDanced(next)
    if (next.length < guests.length) return
    await wait(2200)
    if (!alive()) return
    setFireworks(true)
    sounds.fanfare()
    for (let k = 0; k < 5; k++) setTimeout(() => burst(0.15 + Math.random() * 0.7, 0.2 + Math.random() * 0.25), k * 350)
    await say(L.party.fireworks)
    if (!alive()) return
    bigCelebration(1500)
    await say(L.party.thanks)
    await wait(500)
    if (alive()) onDone()
  }

  if (story) return <StoryBeat lines={[L.party.story]} img={art.pip} bg={art.bgOpera} onDone={() => setStory(false)} />

  const size = 'min(20vh, 13vw, 190px)'
  return (
    <Stage bg={art.bgOpera} prompt={fireworks ? undefined : L.party.tap}>
      {fireworks &&
        [12, 38, 64, 86].map((x, i) => (
          <motion.div key={x} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.35 }} style={{ position: 'absolute', left: `${x}%`, top: `${6 + (i % 2) * 14}%`, fontSize: 'min(110px, 14vh)' }}>
            🎆
          </motion.div>
        ))}
      <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', gap: 'min(10px, 1.5vw)', width: '100%' }}>
        <Mascot pose="cheer" size={Math.min(190, window.innerHeight * 0.2, window.innerWidth * 0.13)} />
        <motion.img src={art.pip} alt="Pip" animate={{ y: [0, -24, 0] }} transition={{ repeat: Infinity, duration: 0.9 }} style={{ height: size }} />
        {guests.map((g, i) => (
          <motion.button
            key={g.name}
            aria-label={g.name}
            onClick={() => void dance(i)}
            animate={dancing === i || fireworks ? { y: [0, -40, 0], rotate: [0, -12, 12, 0] } : danced.includes(i) ? { y: [0, -6, 0] } : { scale: [1, 1.05, 1] }}
            transition={{ repeat: dancing === i ? 0 : Infinity, duration: dancing === i ? 0.8 : 1.3, delay: fireworks ? i * 0.1 : 0 }}
            className={danced.includes(i) ? undefined : 'world-glow'}
            style={{ height: size, borderRadius: 24, padding: 4, background: danced.includes(i) ? 'transparent' : 'rgba(255,255,255,0.35)' }}
          >
            <img src={g.img} alt="" style={{ height: '100%', objectFit: 'contain' }} />
          </motion.button>
        ))}
      </div>
    </Stage>
  )
}

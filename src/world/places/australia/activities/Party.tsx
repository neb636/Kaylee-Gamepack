// The finale: a sunset party at the Sydney Opera House with every friend she helped. Each friend is a live character:
// tap one and they dance and say hello in their own voice. When everyone has danced: fireworks and a big group dance.
import { AnimatePresence, motion } from 'motion/react'
import { createRef, useEffect, useMemo, useState, type RefObject } from 'react'
import { bigCelebration, burst, say, sounds, SparklePuppet, useAlive, wait, type PuppetHandle } from '../../../../sdk'
import { sfx } from '../../../kit/sfx'
import { Stage } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { art } from '../art'
import { L } from '../lines'
import type { Guest } from '../Place'
import { Pip } from '../puppets/Pip'

const COLORS = ['#FF4F9A', '#FFC83D', '#B9A6F5', '#8FE3C8', '#A8DCFF']

/** One firework: sparks fly out from the middle and fade. */
function Firework({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  return (
    <motion.svg
      viewBox="-100 -100 200 200"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1, 1.15], opacity: [0, 1, 0] }}
      transition={{ duration: 1.5, delay, repeat: Infinity, repeatDelay: 0.8, times: [0, 0.35, 1] }}
      style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 'min(34vmin, 260px)', translate: '-50% -50%', pointerEvents: 'none', overflow: 'visible' }}
    >
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2
        return <line key={i} x1={Math.cos(a) * 30} y1={Math.sin(a) * 30} x2={Math.cos(a) * 88} y2={Math.sin(a) * 88} stroke={i % 2 ? color : '#fff'} strokeWidth={9} strokeLinecap="round" />
      })}
      <circle r="14" fill="#fff" />
    </motion.svg>
  )
}

export function Party({ guests, onDone, setProgress }: { guests: Guest[]; onDone: () => void; setProgress: (done: number, total: number) => void }) {
  const [story, setStory] = useState(true)
  const [danced, setDanced] = useState<number[]>([])
  const [fireworks, setFireworks] = useState(false)
  const refs = useMemo(() => guests.map(() => createRef<PuppetHandle>()) as RefObject<PuppetHandle | null>[], [guests])
  const pip = useMemo(() => createRef<PuppetHandle>(), [])
  const sparkle = useMemo(() => createRef<PuppetHandle>(), [])
  const alive = useAlive()

  useEffect(() => setProgress(danced.length, guests.length), [danced.length, guests.length, setProgress])

  // Everyone dances together while the fireworks go.
  useEffect(() => {
    if (!fireworks) return
    const all = [sparkle, pip, ...refs]
    const go = () => all.forEach((r, i) => setTimeout(() => void r.current?.play(i % 2 ? 'dance' : 'cheer'), i * 120))
    go()
    const id = setInterval(go, 2300)
    return () => clearInterval(id)
  }, [fireworks, refs, pip, sparkle])

  const dance = async (i: number) => {
    if (fireworks) return
    sounds.note(i * 2)
    void refs[i].current?.play('dance')
    void say(guests[i].line)
    if (danced.includes(i)) return
    const next = [...danced, i]
    setDanced(next)
    if (next.length < guests.length) return
    await wait(2400)
    if (!alive()) return
    setFireworks(true)
    sounds.fanfare()
    for (let k = 0; k < 6; k++) setTimeout(() => (burst(0.15 + Math.random() * 0.7, 0.15 + Math.random() * 0.25), sfx.pop()), k * 380)
    await say(L.party.fireworks)
    if (!alive()) return
    bigCelebration(1500)
    await say(L.party.thanks)
    await wait(600)
    if (alive()) onDone()
  }

  if (story) return <StoryBeat lines={[L.party.story]} friend={<Pip height="100%" />} bg={art.bgOpera} onDone={() => setStory(false)} />

  const h = 'min(30cqh, 26cqw)'
  return (
    <Stage bg={art.bgOpera} prompt={fireworks ? undefined : L.party.tap}>
      <AnimatePresence>
        {fireworks && (
          <motion.div key="sky" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {[
              [16, 18],
              [42, 10],
              [66, 20],
              [86, 12],
              [30, 30],
              [74, 34],
            ].map(([x, y], i) => (
              <Firework key={i} x={x} y={y} color={COLORS[i % COLORS.length]} delay={i * 0.35} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ position: 'absolute', inset: 0, containerType: 'size', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'flex-end', alignItems: 'flex-end', gap: '1cqh 1.5cqw', paddingBottom: '2cqh' }}>
        <div style={{ height: h, display: 'flex', alignItems: 'flex-end' }}>
          <SparklePuppet ref={sparkle} height="100%" />
        </div>
        <div style={{ height: h, display: 'flex', alignItems: 'flex-end' }}>
          <Pip ref={pip} height="100%" onTap={() => void pip.current?.play('cheer')} />
        </div>
        {guests.map((g, i) => (
          <motion.button
            key={g.name}
            aria-label={g.name}
            onClick={() => void dance(i)}
            whileTap={{ scale: 0.94 }}
            className={danced.includes(i) || fireworks ? undefined : 'world-glow'}
            style={{ height: h, minWidth: 'var(--target)', borderRadius: 28, padding: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: danced.includes(i) || fireworks ? 'transparent' : 'rgba(255,255,255,0.35)' }}
          >
            {g.render(refs[i], '100%')}
          </motion.button>
        ))}
      </div>
    </Stage>
  )
}

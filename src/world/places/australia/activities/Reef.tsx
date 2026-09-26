// Great Barrier Reef: snorkel hide-and-seek. Find the sea turtle, clownfish, starfish, then the shy octopus.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { burst, Mascot, say, sounds, useAlive, wait } from '../../../../sdk'
import { Stage, WIGGLE } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'

type Critter = { id: keyof typeof L.reef.thats; img?: string; emoji?: string; x: number; y: number; size: number }
// x/y in % of the play area; size in % of its smaller side. The octopus is small and tucked away: the hardest find is last.
const CRITTERS: Critter[] = [
  { id: 'turtle', img: art.turtle, x: 26, y: 30, size: 30 },
  { id: 'crab', emoji: '🦀', x: 12, y: 80, size: 16 },
  { id: 'clownfish', img: art.clownfish, x: 74, y: 22, size: 22 },
  { id: 'puffer', emoji: '🐡', x: 52, y: 48, size: 16 },
  { id: 'starfish', img: art.starfish, x: 40, y: 84, size: 18 },
  { id: 'shell', emoji: '🐚', x: 64, y: 86, size: 13 },
  { id: 'octopus', img: art.octopus, x: 90, y: 66, size: 15 },
]
const ORDER = ['turtle', 'clownfish', 'starfish', 'octopus'] as const

export function Reef({ onDone, setProgress }: ActivityProps) {
  const [story, setStory] = useState(true)
  const [round, setRound] = useState(0)
  const [found, setFound] = useState<string[]>([])
  const [hint, setHint] = useState(false)
  const [wiggle, setWiggle] = useState<string | null>(null)
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([])
  const busy = useRef(false)
  const area = useRef<HTMLDivElement>(null)
  const alive = useAlive()
  const target = ORDER[round]

  useEffect(() => setProgress(found.length, ORDER.length), [found.length, setProgress])

  const bubble = (clientX: number, clientY: number) => {
    const r = area.current?.getBoundingClientRect()
    if (!r) return
    const id = Date.now() + Math.random()
    setBubbles((b) => [...b, { id, x: clientX - r.left, y: clientY - r.top }])
    setTimeout(() => setBubbles((b) => b.filter((x) => x.id !== id)), 1000)
  }

  const tap = async (c: Critter) => {
    if (busy.current || found.includes(c.id)) return
    if (c.id !== target) {
      sounds.oops()
      setWiggle(c.id)
      setTimeout(() => setWiggle(null), 500)
      setHint(true)
      await say(L.reef.thats[c.id])
      if (alive() && !busy.current) void say(L.reef.find[target])
      return
    }
    busy.current = true
    sounds.correct()
    burst(c.x / 100, c.y / 100)
    setFound((f) => [...f, c.id])
    setHint(false)
    await say(L.reef.found[target])
    await wait(300)
    if (!alive()) return
    if (round + 1 >= ORDER.length) {
      onDone()
      return
    }
    setRound(round + 1)
    busy.current = false
  }

  if (story) return <StoryBeat lines={L.reef.story} bg={art.bgReef} onDone={() => setStory(false)} />

  return (
    <Stage bg={art.bgReef} prompt={L.reef.find[target]}>
      <div ref={area} onPointerDown={(e) => bubble(e.clientX, e.clientY)} style={{ position: 'absolute', inset: 0, containerType: 'size' }}>
        {CRITTERS.map((c, i) => {
          const isFound = found.includes(c.id)
          const glow = hint && c.id === target
          return (
            <motion.button
              key={c.id}
              aria-label={c.id}
              onClick={() => void tap(c)}
              animate={wiggle === c.id ? WIGGLE : isFound ? { scale: 0.8, opacity: 0.45 } : { y: [0, -10, 0], x: [0, 6, 0] }}
              transition={wiggle === c.id || isFound ? undefined : { repeat: Infinity, duration: 2.4 + (i % 3) * 0.5 }}
              className={glow ? 'world-glow' : undefined}
              style={{
                position: 'absolute',
                left: `${c.x}%`,
                top: `${c.y}%`,
                translate: '-50% -50%',
                width: `max(var(--target), ${c.size}cqmin)`,
                aspectRatio: '1',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontSize: `max(calc(var(--target) * 0.7), ${c.size * 0.7}cqmin)`,
                background: glow ? 'rgba(255,255,255,0.5)' : 'transparent',
              }}
            >
              {c.img ? <img src={c.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : c.emoji}
              {isFound && <span style={{ position: 'absolute', top: 0, right: 0, fontSize: 32 }}>✅</span>}
            </motion.button>
          )
        })}
        {/* Sparkle snorkeling along */}
        <div style={{ position: 'absolute', left: 4, bottom: 0, pointerEvents: 'none' }}>
          <Mascot pose="cheer" size={Math.min(150, window.innerHeight * 0.17)} />
          <span style={{ position: 'absolute', top: '18%', left: '38%', fontSize: Math.min(56, window.innerHeight * 0.06) }}>🤿</span>
        </div>
        <AnimatePresence>
          {bubbles.map((b) => (
            <motion.div key={b.id} initial={{ opacity: 1, y: 0, scale: 0.6 }} animate={{ opacity: 0, y: -90, scale: 1.2 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} style={{ position: 'absolute', left: b.x - 18, top: b.y - 18, fontSize: 36, pointerEvents: 'none' }}>
              🫧
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Stage>
  )
}

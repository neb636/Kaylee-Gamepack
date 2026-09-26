// Great Barrier Reef: snorkel hide-and-seek. Find the sea turtle, clownfish, starfish, then the shy octopus.
// The reef is alive: seaweed sways, little fish swim by, bubbles rise, and Sparkle (in her snorkel) looks where to go.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Buddy, burst, say, sounds, SparklePuppet, useAlive, wait, type PuppetHandle } from '../../../../sdk'
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
  const buddies = useRef<Record<string, PuppetHandle | null>>({})
  const sparkle = useRef<PuppetHandle>(null)
  const alive = useAlive()
  const target = ORDER[round]
  const targetX = CRITTERS.find((c) => c.id === target)!.x

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
      if (c.img) void buddies.current[c.id]?.play('wiggle')
      else {
        setWiggle(c.id)
        setTimeout(() => setWiggle(null), 500)
      }
      setHint(true)
      void sparkle.current?.play('think')
      await say(L.reef.thats[c.id])
      if (alive() && !busy.current) void say(L.reef.find[target])
      return
    }
    busy.current = true
    sounds.correct()
    burst(c.x / 100, c.y / 100)
    void buddies.current[c.id]?.play('cheer')
    void sparkle.current?.play('cheer')
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
      <ReefLife />
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
              transition={wiggle === c.id ? undefined : isFound ? { delay: 1, duration: 0.5 } : { repeat: Infinity, duration: 2.4 + (i % 3) * 0.5 }}
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
              {c.img ? <Buddy ref={(h) => void (buddies.current[c.id] = h)} img={c.img} height="100%" calm style={{ position: 'absolute', inset: 0, width: '100%' }} /> : c.emoji}
              {isFound && <span style={{ position: 'absolute', top: 0, right: 0, fontSize: 32 }}>✅</span>}
            </motion.button>
          )
        })}
        {/* Sparkle snorkeling along; she turns toward the right critter when a hint is showing. */}
        <motion.div animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', left: 4, bottom: 'min(36px, 5vh)', pointerEvents: 'none' }}>
          <SparklePuppet ref={sparkle} pose="snorkel" height="min(160px, 18vh)" lookToward={hint ? Math.max(-1, Math.min(1, (targetX - 15) / 40)) : 0.3} />
        </motion.div>
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

const REEF_CSS = `
@keyframes reef-sway { 0%, 100% { transform: rotate(-7deg) } 50% { transform: rotate(7deg) } }
@keyframes reef-swim { from { transform: translateX(-12vw) } to { transform: translateX(112vw) } }
@keyframes reef-swim-back { from { transform: translateX(112vw) scaleX(-1) } to { transform: translateX(-12vw) scaleX(-1) } }
@keyframes reef-bob { 0%, 100% { translate: 0 0 } 50% { translate: 0 -14px } }
@keyframes reef-wag { 0%, 100% { transform: rotate(-14deg) } 50% { transform: rotate(14deg) } }
@keyframes reef-rise { 0% { transform: translateY(0) scale(0.6); opacity: 0 } 10% { opacity: 0.8 } 100% { transform: translateY(-105vh) scale(1.1); opacity: 0 } }
`
const WEEDS = [
  { x: 3, h: 17, c: '#5CC9A7', d: 0 },
  { x: 30, h: 12, c: '#8FE3C8', d: 0.8 },
  { x: 57, h: 15, c: '#5CC9A7', d: 1.6 },
  { x: 82, h: 19, c: '#8FE3C8', d: 0.4 },
]
const FISH = [
  { top: 16, size: 5.5, color: '#FFC2A8', fin: '#FF8FB8', dur: 17, delay: -4, back: false },
  { top: 58, size: 4.2, color: '#D9CCFF', fin: '#B9A6F5', dur: 23, delay: -12, back: true },
  { top: 38, size: 3.4, color: '#FBEA9A', fin: '#FFC83D', dur: 14, delay: -9, back: false },
]
const RISING = Array.from({ length: 9 }, (_, i) => ({ x: 6 + ((i * 37) % 90), size: 10 + ((i * 7) % 18), dur: 7 + (i % 4) * 2.2, delay: -i * 1.7 }))

/** Ambient reef life behind the critters. Pure decoration: never takes taps. */
function ReefLife() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>{REEF_CSS}</style>
      {WEEDS.map((w, i) => (
        <svg key={i} viewBox="0 0 60 120" style={{ position: 'absolute', left: `${w.x}%`, bottom: -6, height: `${w.h}vmin`, opacity: 0.85, translate: '-50% 0', transformOrigin: '50% 100%', animation: `reef-sway ${3.4 + (i % 3) * 0.7}s ease-in-out ${-w.d}s infinite` }}>
          <path d="M30 120 C18 96 42 78 28 56 C16 38 38 20 30 0" fill="none" stroke={w.c} strokeWidth="10" strokeLinecap="round" />
          <path d="M18 120 C10 104 24 92 14 76 C8 64 18 54 14 44" fill="none" stroke={w.c} strokeWidth="8" strokeLinecap="round" opacity="0.8" />
          <path d="M42 120 C50 102 38 88 48 72 C54 62 46 50 50 38" fill="none" stroke={w.c} strokeWidth="8" strokeLinecap="round" opacity="0.8" />
        </svg>
      ))}
      {FISH.map((f, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, top: `${f.top}%`, animation: `${f.back ? 'reef-swim-back' : 'reef-swim'} ${f.dur}s linear ${f.delay}s infinite` }}>
          <svg viewBox="0 0 60 36" style={{ width: `${f.size}vmin`, display: 'block', animation: `reef-bob 2.6s ease-in-out ${i * -0.7}s infinite`, opacity: 0.9 }}>
            <g style={{ transformOrigin: '14px 18px', animation: 'reef-wag 0.5s ease-in-out infinite' }}>
              <path d="M16 18 L2 6 Q0 18 2 30 Z" fill={f.fin} />
            </g>
            <ellipse cx="34" cy="18" rx="22" ry="14" fill={f.color} />
            <path d="M30 6 Q36 0 42 6" fill={f.fin} />
            <circle cx="46" cy="15" r="3.2" fill="#2B2330" />
            <circle cx="47" cy="14" r="1" fill="#fff" />
            <path d="M52 22 Q49 25 46 23" fill="none" stroke="#2B2330" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      ))}
      {RISING.map((b, i) => (
        <div
          key={i}
          style={{ position: 'absolute', left: `${b.x}%`, bottom: -30, width: b.size, height: b.size, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.18)', animation: `reef-rise ${b.dur}s ease-in ${b.delay}s infinite` }}
        />
      ))}
    </div>
  )
}

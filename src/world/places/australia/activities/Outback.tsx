// Red Outback: pack Pip for the hot sun (climate), then hop-count her to Uluru and Mama's pouch.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { burst, DragArea, Draggable, DropZone, numberWord, say, sounds, useAlive, wait } from '../../../../sdk'
import { Stage, WIGGLE } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'

type Item = { id: string; good: boolean; img?: string; emoji?: string; line?: string }
const ITEMS: Item[] = [
  { id: 'hat', good: true, img: art.sunHat, line: L.outback.hat },
  { id: 'mittens', good: false, emoji: '🧤' },
  { id: 'glasses', good: true, emoji: '🕶️', line: L.outback.glasses },
  { id: 'scarf', good: false, emoji: '🧣' },
  { id: 'water', good: true, img: art.water, line: L.outback.water },
]

export function Outback({ onDone, setProgress }: ActivityProps) {
  const [phase, setPhase] = useState<'story' | 'pack' | 'hop'>('story')
  useEffect(() => setProgress(phase === 'hop' ? 1 : 0, 3), [phase, setProgress])
  if (phase === 'story') return <StoryBeat lines={[L.outback.story]} img={art.pip} bg={art.bgOutback} onDone={() => setPhase('pack')} />
  if (phase === 'pack') return <Pack onDone={() => setPhase('hop')} />
  return <Hop onDone={onDone} setProgress={setProgress} />
}

function Pack({ onDone }: { onDone: () => void }) {
  const [worn, setWorn] = useState<string[]>([])
  const [wiggle, setWiggle] = useState<string | null>(null)
  const [helped, setHelped] = useState(false)
  const alive = useAlive()

  const give = async (item: Item) => {
    if (worn.includes(item.id)) return true
    if (!item.good) {
      sounds.oops()
      setWiggle(item.id)
      setHelped(true)
      setTimeout(() => setWiggle(null), 500)
      void say(L.outback.brrr)
      return false
    }
    const next = [...worn, item.id]
    setWorn(next)
    sounds.correct()
    burst(0.5, 0.45)
    if (next.length === 3) {
      await say(item.line!)
      if (!alive()) return true
      await say(L.outback.ready)
      if (alive()) onDone()
    } else {
      void say(item.line!)
    }
    return true
  }

  const pipH = 'min(44vh, 60vw, 420px)'
  return (
    <Stage bg={art.bgOutback} prompt={L.outback.pack}>
      <DragArea style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly', gap: 8 }}>
        <DropZone id="pip" style={{ position: 'relative', height: pipH, aspectRatio: '0.78', flexShrink: 1, minHeight: 0 }}>
          <motion.img src={art.pip} alt="Pip" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
          <AnimatePresence>
            {worn.includes('hat') && <motion.img key="hat" src={art.sunHat} alt="" initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ position: 'absolute', top: '-10%', left: '22%', width: '62%' }} />}
            {worn.includes('glasses') && (
              <motion.div key="glasses" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: '17%', left: '33%', width: '38%', textAlign: 'center', fontSize: `calc(${pipH} * 0.15)`, lineHeight: 1 }}>
                🕶️
              </motion.div>
            )}
            {worn.includes('water') && <motion.img key="water" src={art.water} alt="" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', bottom: '18%', right: '-6%', width: '30%' }} />}
          </AnimatePresence>
        </DropZone>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'min(14px, 2vw)', background: 'rgba(255,255,255,0.55)', borderRadius: 32, padding: 10 }}>
          {ITEMS.filter((i) => !worn.includes(i.id)).map((item) => (
            <motion.div key={item.id} animate={wiggle === item.id ? WIGGLE : {}}>
              <Draggable onDrop={(zone) => (zone === 'pip' ? void give(item) : false)} onTap={() => void give(item)}>
                <div
                  role="button"
                  aria-label={item.id}
                  className={helped && item.good ? 'world-glow' : undefined}
                  style={{ position: 'relative', width: 'calc(var(--target) * 1.15)', height: 'calc(var(--target) * 1.15)', borderRadius: 28, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow)', fontSize: 'calc(var(--target) * 0.7)' }}
                >
                  {item.img ? <img src={item.img} alt="" style={{ position: 'absolute', inset: '9%', width: '82%', height: '82%', objectFit: 'contain' }} /> : item.emoji}
                </div>
              </Draggable>
            </motion.div>
          ))}
        </div>
      </DragArea>
    </Stage>
  )
}

const LEGS = [
  { hops: 3, from: 8, to: 38, prompt: L.outback.hop3, arrive: L.outback.splash },
  { hops: 5, from: 38, to: 70, prompt: L.outback.hop5, arrive: L.outback.pouch },
]

function Hop({ onDone, setProgress }: ActivityProps) {
  const [leg, setLeg] = useState(0)
  const [hops, setHops] = useState(0)
  const [busy, setBusy] = useState(false)
  const [inPouch, setInPouch] = useState(false)
  const alive = useAlive()
  const { from, to, hops: need, prompt, arrive } = LEGS[leg]
  const x = from + ((to - from) * hops) / need
  const last = leg === LEGS.length - 1

  const hop = async () => {
    if (busy || hops >= need) return
    const n = hops + 1
    setHops(n)
    sounds.note(n - 1)
    void say(numberWord(n))
    if (n < need) return
    setBusy(true)
    await wait(900)
    if (!alive()) return
    sounds.correct()
    burst(x / 100, 0.6)
    if (last) {
      setInPouch(true)
      await say(arrive)
      await wait(600)
      if (alive()) onDone()
      return
    }
    await say(arrive)
    if (!alive()) return
    setProgress(2, 3)
    setLeg(leg + 1)
    setHops(0)
    setBusy(false)
  }

  const size = 'min(30vh, 34vw, 280px)'
  return (
    <Stage bg={art.bgOutback} prompt={prompt}>
      <button aria-label="Hop" onClick={() => void hop()} style={{ position: 'absolute', inset: 0, width: '100%' }}>
        <div style={{ position: 'absolute', top: '4%', left: 0, right: 0, textAlign: 'center', fontSize: 'min(110px, 16vh)', fontWeight: 700, color: 'var(--hotpink)', textShadow: '0 5px 0 #fff' }}>
          <AnimatePresence mode="popLayout">
            {hops > 0 && (
              <motion.span key={`${leg}-${hops}`} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }} style={{ display: 'inline-block' }}>
                {hops}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {/* Water hole */}
        <div style={{ position: 'absolute', left: '38%', bottom: '6%', width: 'min(24vw, 220px)', height: 'min(5vw, 46px)', translate: '-10% 0', borderRadius: '50%', background: '#7FC8F8', border: '4px solid #fff' }} />
        {last && (
          <motion.img src={art.mama} alt="Mama kangaroo" initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ position: 'absolute', left: '74%', bottom: '4%', height: `calc(${size} * 1.25)` }} />
        )}
        <motion.div
          initial={false}
          animate={inPouch ? { left: '79%', bottom: '22%', scale: 0.4 } : { left: `${x}%`, bottom: '4%', scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={{ position: 'absolute', height: size, translate: '-20% 0', zIndex: 2 }}
        >
          <motion.img
            key={`${leg}-${hops}-${inPouch}`}
            src={hops > 0 && !inPouch ? art.pipHop : art.pip}
            alt="Pip"
            initial={{ y: 0 }}
            animate={{ y: hops > 0 || inPouch ? [0, -110, 0] : [0, -10, 0] }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            style={{ height: '100%' }}
          />
        </motion.div>
      </button>
    </Stage>
  )
}

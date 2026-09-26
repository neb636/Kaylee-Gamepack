// Gum Tree Forest: feed Koko the koala gum leaves (2, then 4), then sing her to sleep.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { burst, DragArea, Draggable, DropZone, numberWord, say, shuffle, sounds, useAlive, wait } from '../../../../sdk'
import { Stage, WIGGLE } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'

const ROUNDS = [
  { need: 2, prompt: L.forest.feed2 },
  { need: 4, prompt: L.forest.feed4 },
]
type Food = { id: string; leaf: boolean; emoji?: string }

export function Forest({ onDone, setProgress }: ActivityProps) {
  const [phase, setPhase] = useState<'story' | 'feed' | 'sleep'>('story')
  const [round, setRound] = useState(0)
  useEffect(() => setProgress(phase === 'sleep' ? 2 : phase === 'feed' ? round : 0, 3), [phase, round, setProgress])
  if (phase === 'story') return <StoryBeat lines={[L.forest.story]} img={art.koalaAwake} bg={art.bgForest} onDone={() => setPhase('feed')} />
  if (phase === 'feed')
    return (
      <Feed
        key={round}
        round={round}
        onDone={() => {
          if (round + 1 < ROUNDS.length) setRound(round + 1)
          else setPhase('sleep')
        }}
      />
    )
  return <Lullaby onDone={onDone} />
}

function Feed({ round, onDone }: { round: number; onDone: () => void }) {
  const { need, prompt } = ROUNDS[round]
  const foods = useMemo<Food[]>(
    () =>
      shuffle([
        ...Array.from({ length: need + 1 }, (_, i) => ({ id: `leaf${i}`, leaf: true })),
        { id: 'pizza', leaf: false, emoji: '🍕' },
        { id: 'icecream', leaf: false, emoji: '🍦' },
        ...(round > 0 ? [{ id: 'donut', leaf: false, emoji: '🍩' }] : []),
      ]),
    [need, round],
  )
  const [eaten, setEaten] = useState<string[]>([])
  const [wiggle, setWiggle] = useState<string | null>(null)
  const [helped, setHelped] = useState(false)
  const [chomp, setChomp] = useState(0)
  const alive = useAlive()

  const feed = async (food: Food) => {
    if (eaten.length >= need) return
    if (!food.leaf) {
      sounds.oops()
      setWiggle(food.id)
      setHelped(true)
      setTimeout(() => setWiggle(null), 500)
      void say(L.forest.only)
      return
    }
    const n = eaten.length + 1
    setEaten([...eaten, food.id])
    setChomp((c) => c + 1)
    sounds.note(n + 1)
    void say(numberWord(n))
    if (n === need) {
      burst(0.5, 0.35)
      sounds.correct()
      await wait(1100)
      if (alive()) onDone()
    }
  }

  return (
    <Stage bg={art.bgForest} prompt={prompt}>
      <DragArea style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly', gap: 8 }}>
        <DropZone id="koko" style={{ height: 'min(38vh, 56vw, 380px)', minHeight: 0, flexShrink: 1, aspectRatio: '1' }}>
          <motion.img key={chomp} src={art.koalaAwake} alt="Koko the koala" initial={{ scale: 1 }} animate={chomp ? { scale: [1, 1.12, 0.95, 1], rotate: [0, -4, 4, 0] } : {}} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </DropZone>
        {/* Tummy meter: one slot per leaf she asked for */}
        <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.85)', borderRadius: 999, padding: '6px 16px', boxShadow: 'var(--shadow)' }}>
          {Array.from({ length: need }, (_, i) => (
            <motion.img key={i} src={art.gumLeaf} alt="" animate={{ opacity: i < eaten.length ? 1 : 0.35, scale: i < eaten.length ? [1.4, 1] : 1 }} style={{ height: 'min(52px, 8vh)', filter: i < eaten.length ? 'none' : 'grayscale(1) brightness(0.7)' }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'min(12px, 2vw)', maxWidth: 760 }}>
          <AnimatePresence>
            {foods
              .filter((f) => !eaten.includes(f.id))
              .map((food) => (
                <motion.div key={food.id} exit={{ scale: 0, opacity: 0 }} animate={wiggle === food.id ? WIGGLE : {}}>
                  <Draggable onDrop={(zone) => (zone === 'koko' ? void feed(food) : false)} onTap={() => void feed(food)}>
                    <div
                      role="button"
                      aria-label={food.leaf ? 'gum leaf' : food.id}
                      className={helped && food.leaf ? 'world-glow' : undefined}
                      style={{ position: 'relative', width: 'var(--target)', height: 'var(--target)', borderRadius: 26, background: 'rgba(255,255,255,0.92)', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow)', fontSize: 'calc(var(--target) * 0.6)' }}
                    >
                      {food.leaf ? <img src={art.gumLeaf} alt="" style={{ position: 'absolute', inset: '10%', width: '80%', height: '80%', objectFit: 'contain' }} /> : food.emoji}
                    </div>
                  </Draggable>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </DragArea>
    </Stage>
  )
}

const NOTES = [
  { x: 18, y: 30 },
  { x: 80, y: 22 },
  { x: 72, y: 70 },
]

function Lullaby({ onDone }: { onDone: () => void }) {
  const [ready, setReady] = useState(false)
  const [sung, setSung] = useState<number[]>([])
  const alive = useAlive()

  useEffect(() => {
    void (async () => {
      await say(L.forest.yawn)
      if (alive()) setReady(true)
    })()
  }, [alive])

  const sing = async (i: number) => {
    if (sung.includes(i)) return
    const next = [...sung, i]
    setSung(next)
    sounds.note(8 - next.length * 2)
    setTimeout(() => sounds.note(6 - next.length * 2), 180)
    if (next.length === NOTES.length) {
      await wait(1200)
      if (alive()) onDone()
    }
  }

  return (
    <Stage bg={art.bgForest} prompt={ready ? L.forest.lullaby : undefined} style={{ backgroundColor: '#2d2a4a' }}>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(59, 52, 112, ${0.15 + sung.length * 0.12})`, transition: 'background 0.6s', borderRadius: 24 }} />
      <motion.img src={art.koalaSleep} alt="Koko sleeping" initial={{ scale: 0.8 }} animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 2.4 }} style={{ height: 'min(46vh, 60vw, 440px)', position: 'relative' }} />
      {sung.map((i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 1, 0], y: -80 }} transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.4 }} style={{ position: 'absolute', left: `${44 + i * 6}%`, top: '18%', fontSize: 48 }}>
          💤
        </motion.div>
      ))}
      {ready &&
        NOTES.map((n, i) =>
          sung.includes(i) ? null : (
            <motion.button
              key={i}
              aria-label="music note"
              initial={{ scale: 0 }}
              animate={{ scale: 1, y: [0, -12, 0] }}
              transition={{ y: { repeat: Infinity, duration: 1.3, delay: i * 0.3 } }}
              whileTap={{ scale: 0.8 }}
              onClick={() => void sing(i)}
              className="world-glow"
              style={{ position: 'absolute', left: `${n.x}%`, top: `${n.y}%`, translate: '-50% -50%', width: 'var(--target)', height: 'var(--target)', borderRadius: '50%', background: 'var(--lavender)', fontSize: 'calc(var(--target) * 0.55)', display: 'grid', placeItems: 'center', border: '4px solid #fff' }}
            >
              🎵
            </motion.button>
          ),
        )}
    </Stage>
  )
}

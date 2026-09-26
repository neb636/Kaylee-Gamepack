// Gum Tree Forest: feed Koko the koala gum leaves (2, then 4), then sing her to sleep.
// Koko is a puppet: her eyes follow the leaf, her mouth opens as it comes close, she chews and counts in her own voice,
// her tummy gets rounder, and each lullaby note makes her sleepier until she snores.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { burst, DragArea, Draggable, DropZone, pick, say, shuffle, sounds, useAlive, wait, type PuppetHandle } from '../../../../sdk'
import { sfx } from '../../../kit/sfx'
import { Stage, WIGGLE } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'
import { Koko } from '../puppets/Koko'

const ROUNDS = [
  { need: 2, prompt: L.forest.feed2 },
  { need: 4, prompt: L.forest.feed4 },
]
const TOTAL = ROUNDS.reduce((n, r) => n + r.need, 0)

const landscapeQuery = typeof matchMedia === 'undefined' ? undefined : matchMedia('(orientation: landscape)')
/** True in landscape: Koko takes the height and the food tray moves to the side. */
function useLandscape() {
  return useSyncExternalStore(
    (cb) => {
      landscapeQuery?.addEventListener('change', cb)
      return () => landscapeQuery?.removeEventListener('change', cb)
    },
    () => !!landscapeQuery?.matches,
  )
}
type Food = { id: string; leaf: boolean; emoji?: string }

export function Forest({ onDone, setProgress }: ActivityProps) {
  const [phase, setPhase] = useState<'story' | 'feed' | 'sleep'>('story')
  const [round, setRound] = useState(0)
  useEffect(() => setProgress(phase === 'sleep' ? 2 : phase === 'feed' ? round : 0, 3), [phase, round, setProgress])
  if (phase === 'story') return <StoryBeat lines={[L.forest.story]} friend={<Koko height="100%" />} bg={art.bgForest} onDone={() => setPhase('feed')} />
  if (phase === 'feed') return <Feed round={round} setRound={setRound} onDone={() => setPhase('sleep')} />
  return <Lullaby onDone={onDone} />
}

/** Gum leaves drifting down from the canopy, and a butterfly. */
function ForestLife({ night = 0 }: { night?: number }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        x: 8 + i * 21 + Math.random() * 8,
        delay: i * 2.3 + Math.random(),
        dur: 9 + Math.random() * 4,
        size: 28 + Math.random() * 16,
      })),
    [],
  )
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: 1 - night * 0.6,
      }}
    >
      {leaves.map((l, i) => (
        <motion.img
          key={i}
          src={art.gumLeaf}
          alt=""
          initial={{ y: '-10vh', x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: '110vh',
            x: [0, 40, -30, 30, 0],
            rotate: [0, 90, 200, 300, 400],
            opacity: [0, 1, 1, 1, 0],
          }}
          transition={{
            duration: l.dur,
            delay: l.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            left: `${l.x}%`,
            top: 0,
            width: l.size,
          }}
        />
      ))}
      {night < 0.5 && (
        <motion.div
          animate={{
            left: ['-8%', '30%', '60%', '108%'],
            top: ['30%', '18%', '34%', '22%'],
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          style={{ position: 'absolute', fontSize: 34 }}
        >
          <motion.span animate={{ scaleX: [1, 0.3, 1] }} transition={{ duration: 0.3, repeat: Infinity }} style={{ display: 'inline-block' }}>
            🦋
          </motion.span>
        </motion.div>
      )}
    </div>
  )
}

/** A chunky eucalyptus branch for Koko to sit on. */
function Branch() {
  return (
    <svg
      viewBox="0 0 600 70"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        left: '-35%',
        width: '170%',
        bottom: '1%',
        height: '13%',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <path
        d="M-20 22 C120 8 250 14 330 16 C430 18 520 10 620 4 L620 50 C520 58 430 64 330 62 C240 60 120 58 -20 66Z"
        fill="#D8C2A6"
        stroke="#3A2A33"
        strokeWidth="5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path d="M60 40 C100 36 140 38 170 42 M390 42 C430 40 470 38 520 34" fill="none" stroke="#B89B7C" strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function Feed({ round, setRound, onDone }: { round: number; setRound: (r: number) => void; onDone: () => void }) {
  const { need, prompt } = ROUNDS[round]
  const foods = useMemo<Food[]>(
    () =>
      shuffle([
        ...Array.from({ length: need + 1 }, (_, i) => ({
          id: `r${round}-leaf${i}`,
          leaf: true,
        })),
        { id: `r${round}-pizza`, leaf: false, emoji: '🍕' },
        { id: `r${round}-icecream`, leaf: false, emoji: '🍦' },
        ...(round > 0 ? [{ id: `r${round}-donut`, leaf: false, emoji: '🍩' }] : []),
      ]),
    [need, round],
  )
  const [eaten, setEaten] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [wiggle, setWiggle] = useState<string | null>(null)
  const [helped, setHelped] = useState(false)
  const [hearts, setHearts] = useState<number[]>([])
  const busy = useRef(false)
  const heartId = useRef(0)
  const koko = useRef<PuppetHandle>(null)
  const alive = useAlive()

  const feed = async (food: Food) => {
    if (busy.current || eaten.includes(food.id) || eaten.length >= need) return
    if (!food.leaf) {
      sounds.oops()
      setWiggle(food.id)
      setHelped(true)
      setTimeout(() => setWiggle(null), 500)
      void koko.current?.play('yuck')
      void say(L.forest.only)
      return
    }
    const n = eaten.length + 1
    setEaten([...eaten, food.id])
    setTotal((t) => t + 1)
    setHearts((h) => [...h, ++heartId.current])
    void koko.current?.play('chew')
    sfx.munch()
    sounds.note(n + 1)
    void say(L.forest.count[n - 1])
    if (n < need) return
    busy.current = true
    await wait(1300)
    if (!alive()) return
    burst(0.5, 0.35)
    sounds.correct()
    void koko.current?.play('cheer')
    if (round + 1 < ROUNDS.length) {
      await say(L.forest.more)
      if (!alive()) return
      setEaten([])
      setHelped(false)
      setRound(round + 1)
      busy.current = false
    } else {
      await wait(1100)
      if (alive()) onDone()
    }
  }

  const tickle = () => {
    if (busy.current) return
    void koko.current?.play('wiggle')
    void say(pick(L.tickle.koko))
  }

  const landscape = useLandscape()
  const kokoH = landscape ? 'min(66vh, 50vw, 580px)' : 'min(46vh, 70vw, 520px)'
  return (
    <Stage bg={art.bgForest} prompt={prompt}>
      <ForestLife />
      <DragArea
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: landscape ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          gap: 8,
        }}
      >
        <div
          style={{
            position: 'relative',
            height: kokoH,
            minHeight: 0,
            flexShrink: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Branch />
          <DropZone id="koko" style={{ position: 'relative', height: '100%' }}>
            <div onClick={tickle} style={{ height: '100%' }}>
              <Koko ref={koko} height="100%" full={total / TOTAL} />
            </div>
          </DropZone>
          <AnimatePresence>
            {hearts.map((h) => (
              <motion.div
                key={h}
                initial={{ y: 0, opacity: 1, scale: 0.4 }}
                animate={{
                  y: -140,
                  opacity: 0,
                  scale: 1.3,
                  x: (h % 7) * 8 - 24,
                }}
                transition={{ duration: 1.3 }}
                onAnimationComplete={() => setHearts((all) => all.filter((x) => x !== h))}
                style={{
                  position: 'absolute',
                  top: '10%',
                  left: '50%',
                  fontSize: 'min(54px, 7vh)',
                  pointerEvents: 'none',
                }}
              >
                💗
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'min(14px, 2.5vh)',
            flexShrink: 0,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Tummy meter: one slot per leaf she asked for */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              background: 'rgba(255,255,255,0.85)',
              borderRadius: 999,
              padding: '6px 16px',
              boxShadow: 'var(--shadow)',
              flexShrink: 0,
            }}
          >
            {Array.from({ length: need }, (_, i) => (
              <motion.img
                key={`${round}-${i}`}
                src={art.gumLeaf}
                alt=""
                animate={{
                  opacity: i < eaten.length ? 1 : 0.35,
                  scale: i < eaten.length ? [1.4, 1] : 1,
                }}
                style={{
                  height: 'min(52px, 8vh)',
                  filter: i < eaten.length ? 'none' : 'grayscale(1) brightness(0.7)',
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 'min(12px, 2vw)',
              maxWidth: landscape ? 'calc(var(--target) * 4 + 40px)' : 760,
              flexShrink: 0,
            }}
          >
            <AnimatePresence key={round}>
              {foods
                .filter((f) => !eaten.includes(f.id))
                .map((food) => (
                  <motion.div key={food.id} initial={{ scale: 0 }} exit={{ scale: 0, opacity: 0 }} animate={wiggle === food.id ? WIGGLE : { scale: 1 }}>
                    <Draggable onDrop={(zone) => (zone === 'koko' ? void feed(food) : false)} onTap={() => void feed(food)}>
                      <div
                        role="button"
                        aria-label={food.leaf ? 'gum leaf' : food.id.split('-')[1]}
                        className={helped && food.leaf ? 'world-glow' : undefined}
                        style={{
                          position: 'relative',
                          width: 'var(--target)',
                          height: 'var(--target)',
                          borderRadius: 26,
                          background: 'rgba(255,255,255,0.92)',
                          display: 'grid',
                          placeItems: 'center',
                          boxShadow: 'var(--shadow)',
                          fontSize: 'calc(var(--target) * 0.6)',
                        }}
                      >
                        {food.leaf ? (
                          <img
                            src={art.gumLeaf}
                            alt=""
                            draggable={false}
                            style={{
                              position: 'absolute',
                              inset: '10%',
                              width: '80%',
                              height: '80%',
                              objectFit: 'contain',
                            }}
                          />
                        ) : (
                          food.emoji
                        )}
                      </div>
                    </Draggable>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </DragArea>
    </Stage>
  )
}

const NOTES = [
  { x: 14, y: 26 },
  { x: 86, y: 20 },
  { x: 82, y: 70 },
]

function Lullaby({ onDone }: { onDone: () => void }) {
  const [ready, setReady] = useState(false)
  const [sung, setSung] = useState<number[]>([])
  const koko = useRef<PuppetHandle>(null)
  const alive = useAlive()
  const flies = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        x: 5 + Math.random() * 90,
        y: 8 + Math.random() * 80,
        d: 3 + Math.random() * 3,
      })),
    [],
  )
  const night = sung.length / NOTES.length
  const landscape = useLandscape()

  useEffect(() => {
    void (async () => {
      await wait(400)
      void koko.current?.play('yawn')
      await say(L.forest.yawn)
      if (alive()) setReady(true)
    })()
  }, [alive])

  const sing = async (i: number) => {
    if (sung.includes(i)) return
    const next = [...sung, i]
    setSung(next)
    sounds.note(8 - next.length * 2)
    setTimeout(() => sounds.note(6 - next.length * 2), 200)
    setTimeout(() => sounds.note(4 - next.length), 400)
    if (next.length < NOTES.length) {
      if (next.length === 2) void koko.current?.play('yawn')
      return
    }
    await wait(1400)
    if (!alive()) return
    await say(L.forest.asleep)
    await wait(800)
    if (alive()) onDone()
  }

  return (
    <Stage bg={art.bgForest} prompt={ready && sung.length < NOTES.length ? L.forest.lullaby : undefined} style={{ backgroundColor: '#2d2a4a' }}>
      {/* Night falls over the whole scene (the Stage clips this oversized layer to the screen). */}
      <div
        style={{
          position: 'absolute',
          inset: '-100vmax',
          background: `rgba(40, 34, 92, ${0.12 + night * 0.5})`,
          transition: 'background 1.2s',
          pointerEvents: 'none',
        }}
      />
      <ForestLife night={night} />
      {flies.slice(0, 3 + sung.length * 4).map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0.3, 1, 0],
            x: [0, 20, -10, 14, 0],
            y: [0, -16, 8, -10, 0],
          }}
          transition={{ duration: f.d, repeat: Infinity, delay: i * 0.25 }}
          style={{
            position: 'absolute',
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#FFF3A0',
            boxShadow: '0 0 14px 6px rgba(255, 236, 120, 0.7)',
            pointerEvents: 'none',
          }}
        />
      ))}
      <div
        style={{
          position: 'relative',
          height: landscape ? 'min(66vh, 50vw, 560px)' : 'min(50vh, 62vw, 470px)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Branch />
        <Koko ref={koko} height="100%" sleepy={night} full={1} />
      </div>
      {ready &&
        NOTES.map((n, i) =>
          sung.includes(i) ? (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -120, x: 50 - n.x }}
              transition={{ duration: 1.6 }}
              style={{
                position: 'absolute',
                left: `${n.x}%`,
                top: `${n.y}%`,
                translate: '-50% -50%',
                fontSize: 'calc(var(--target) * 0.55)',
                pointerEvents: 'none',
              }}
            >
              🎵
            </motion.div>
          ) : (
            <motion.button
              key={i}
              aria-label="music note"
              initial={{ scale: 0 }}
              animate={{ scale: 1, y: [0, -12, 0] }}
              transition={{
                y: { repeat: Infinity, duration: 1.3, delay: i * 0.3 },
              }}
              whileTap={{ scale: 0.8 }}
              onClick={() => void sing(i)}
              className="world-glow"
              style={{
                position: 'absolute',
                left: `${n.x}%`,
                top: `${n.y}%`,
                translate: '-50% -50%',
                width: 'var(--target)',
                height: 'var(--target)',
                borderRadius: '50%',
                background: 'var(--lavender)',
                fontSize: 'calc(var(--target) * 0.55)',
                display: 'grid',
                placeItems: 'center',
                border: '4px solid #fff',
                zIndex: 3,
              }}
            >
              🎵
            </motion.button>
          ),
        )}
    </Stage>
  )
}

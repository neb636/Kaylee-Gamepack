// Red Outback: dress Pip for the hot sun (climate), then hop-count her to the water hole, Uluru and Mama's pouch.
// Pip and Mama are live puppets: Pip fans herself in the heat, shakes her head at mittens, crouches before every hop,
// lands with a puff of dust and leaves footprints to count; Mama hops in and Pip jumps into her pouch.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { burst, DragArea, Draggable, DropZone, pick, say, sounds, useAlive, wait, type Line, type PuppetHandle } from '../../../../sdk'
import { sfx } from '../../../kit/sfx'
import { Stage, WIGGLE } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'
import { Mama, MAMA_POUCH } from '../puppets/Mama'
import { Pip } from '../puppets/Pip'

type Item = { id: 'hat' | 'glasses' | 'water' | 'mittens' | 'scarf'; good: boolean; img?: string; emoji?: string; line?: Line }
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
  if (phase === 'story') return <StoryBeat lines={[L.outback.story]} friend={<Pip height="100%" />} bg={art.bgOutback} onDone={() => setPhase('pack')} />
  if (phase === 'pack') return <Pack onDone={() => setPhase('hop')} />
  return <Hop onDone={onDone} setProgress={setProgress} />
}

/** Drifting clouds and a lizard scurrying by: the outback never stands still. */
function OutbackLife() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {[
        { top: '6%', dur: 70, delay: -20, scale: 1 },
        { top: '15%', dur: 95, delay: -60, scale: 0.7 },
      ].map((c, i) => (
        <motion.div key={i} initial={{ x: '-30vw' }} animate={{ x: '110vw' }} transition={{ repeat: Infinity, duration: c.dur, delay: c.delay, ease: 'linear' }} style={{ position: 'absolute', top: c.top, left: 0, width: `${22 * c.scale}vmin`, height: `${9 * c.scale}vmin`, borderRadius: 999, background: 'rgba(255,255,255,0.75)', boxShadow: `${6 * c.scale}vmin ${-2 * c.scale}vmin 0 ${1 * c.scale}vmin rgba(255,255,255,0.75)` }} />
      ))}
      <motion.div initial={{ x: '-12vw' }} animate={{ x: ['-12vw', '-12vw', '112vw'] }} transition={{ repeat: Infinity, duration: 16, times: [0, 0.7, 1], ease: 'easeIn' }} style={{ position: 'absolute', bottom: '3%', fontSize: 'min(44px, 6vmin)', scale: '-1 1' }}>
        🦎
      </motion.div>
    </div>
  )
}

function Pack({ onDone }: { onDone: () => void }) {
  const [worn, setWorn] = useState<Item['id'][]>([])
  const [wiggle, setWiggle] = useState<string | null>(null)
  const [helped, setHelped] = useState(false)
  const pip = useRef<PuppetHandle>(null)
  const alive = useAlive()
  const busy = useRef(false)

  // Until she's dressed, Pip is hot: every few seconds she fans herself.
  useEffect(() => {
    if (worn.length >= 3) return
    const id = setInterval(() => {
      if (!busy.current) void pip.current?.play('fan')
    }, 5200)
    return () => clearInterval(id)
  }, [worn.length])

  const give = async (item: Item) => {
    if (worn.includes(item.id) || worn.length >= 3) return true
    if (!item.good) {
      sounds.oops()
      setWiggle(item.id)
      setHelped(true)
      setTimeout(() => setWiggle(null), 500)
      void pip.current?.play('shake')
      void say(L.outback.brrr)
      return false
    }
    const next = [...worn, item.id]
    setWorn(next)
    sfx.fwip()
    sounds.correct()
    burst(0.5, 0.4)
    busy.current = true
    void pip.current?.play('cheer')
    await say(item.line!)
    busy.current = false
    if (!alive() || next.length < 3) return true
    await pip.current?.play('dance')
    if (!alive()) return true
    await say(L.outback.ready)
    if (alive()) onDone()
    return true
  }

  return (
    <Stage bg={art.bgOutback} prompt={L.outback.pack}>
      <OutbackLife />
      <DragArea style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly', gap: 8 }}>
        <DropZone id="pip" style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingTop: '6%' }}>
          <Pip
            ref={pip}
            height="min(100%, 62vw)"
            wearing={{ hat: worn.includes('hat'), glasses: worn.includes('glasses'), water: worn.includes('water') }}
            onTap={() => {
              if (busy.current) return
              void pip.current?.play('wiggle')
              void say(pick(L.tickle.pip))
            }}
          />
        </DropZone>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'min(14px, 2vw)', background: 'rgba(255,255,255,0.55)', borderRadius: 32, padding: 10, flexShrink: 0 }}>
          {ITEMS.filter((i) => !worn.includes(i.id)).map((item) => (
            <motion.div key={item.id} animate={wiggle === item.id ? WIGGLE : {}}>
              <Draggable onDrop={(zone) => (zone === 'pip' ? void give(item) : false)} onTap={() => void give(item)}>
                <div
                  role="button"
                  aria-label={item.id}
                  className={helped && item.good ? 'world-glow' : undefined}
                  style={{ position: 'relative', width: 'calc(var(--target) * 1.15)', height: 'calc(var(--target) * 1.15)', borderRadius: 28, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow)', fontSize: 'calc(var(--target) * 0.7)' }}
                >
                  {item.img ? <img src={item.img} alt="" draggable={false} style={{ position: 'absolute', inset: '9%', width: '82%', height: '82%', objectFit: 'contain' }} /> : item.emoji}
                </div>
              </Draggable>
            </motion.div>
          ))}
        </div>
      </DragArea>
    </Stage>
  )
}

// Positions are % of the play area. Leg 1: 3 hops to the water hole. Leg 2: 5 hops to Mama by Uluru.
const LEGS = [
  { hops: 3, from: 10, to: 40, prompt: L.outback.hop3 },
  { hops: 5, from: 40, to: 66, prompt: L.outback.hop5 },
]
const HOP_MS = 700 // matches ROO_ACTIONS.hop
const WATER_X = 40
const MAMA_X = 82

function Hop({ onDone, setProgress }: ActivityProps) {
  const [leg, setLeg] = useState(0)
  const [hops, setHops] = useState(0)
  const [busy, setBusy] = useState(false)
  const [x, setX] = useState(LEGS[0].from)
  const [prints, setPrints] = useState<number[]>([])
  const [puffs, setPuffs] = useState<{ id: number; x: number }[]>([])
  const [splash, setSplash] = useState(0)
  const [mamaIn, setMamaIn] = useState(false)
  const [inPouch, setInPouch] = useState(false)
  const pip = useRef<PuppetHandle>(null)
  const mama = useRef<PuppetHandle>(null)
  const alive = useAlive()
  const { from, to, hops: need, prompt } = LEGS[leg]
  const last = leg === LEGS.length - 1

  // Mama hops in from the right as the last leg starts.
  useEffect(() => {
    if (!last) return
    setMamaIn(true)
    void (async () => {
      await wait(250)
      for (let i = 0; i < 3 && alive(); i++) await mama.current?.play('hop')
    })()
  }, [last, alive])

  const land = (at: number) => {
    sfx.thump()
    const id = Date.now()
    setPuffs((p) => [...p, { id, x: at }])
    setPrints((p) => [...p, at])
    setTimeout(() => setPuffs((p) => p.filter((q) => q.id !== id)), 700)
  }

  const hop = async () => {
    if (busy || hops >= need || inPouch) return
    setBusy(true)
    const n = hops + 1
    const nx = from + ((to - from) * n) / need
    sfx.boing()
    const done = pip.current?.play('hop')
    setX(nx)
    setTimeout(() => alive() && land(nx), HOP_MS * 0.78)
    await done
    if (!alive()) return
    setHops(n)
    sounds.note(n - 1)
    await say(L.outback.count[n - 1])
    if (!alive()) return
    if (n < need) {
      setBusy(false)
      return
    }
    sounds.correct()
    burst(nx / 100, 0.65)
    if (!last) {
      setSplash((s) => s + 1)
      sfx.splash()
      void pip.current?.play('cheer')
      await say(L.outback.splash)
      if (!alive()) return
      setProgress(2, 3)
      setLeg(leg + 1)
      setHops(0)
      setBusy(false)
      return
    }
    // Into Mama's pouch!
    void mama.current?.play('wave')
    await say(L.outback.mama)
    if (!alive()) return
    sfx.boing()
    setX(MAMA_X - 2)
    void pip.current?.play('hop')
    await wait(HOP_MS * 0.45)
    if (!alive()) return
    setInPouch(true)
    sfx.pop()
    burst(MAMA_X / 100, 0.5)
    await mama.current?.play('hug')
    if (!alive()) return
    await say(L.outback.pouch)
    await wait(400)
    if (alive()) onDone()
  }

  const pipH = 'min(50cqh, 42cqw)'
  const mamaH = 'min(72cqh, 54cqw)'
  return (
    <Stage bg={art.bgOutback} prompt={prompt}>
      <OutbackLife />
      <button aria-label="Hop" onClick={() => void hop()} style={{ position: 'absolute', inset: 0, width: '100%', containerType: 'size' }}>
        {/* The count, big and pink */}
        <div style={{ position: 'absolute', top: '2%', left: 0, right: 0, textAlign: 'center', fontSize: 'min(110px, 18cqh)', fontWeight: 700, color: 'var(--hotpink)', textShadow: '0 5px 0 #fff', pointerEvents: 'none' }}>
          <AnimatePresence mode="popLayout">
            {hops > 0 && (
              <motion.span key={`${leg}-${hops}`} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0.6 }} style={{ display: 'inline-block' }}>
                {hops}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {/* Water hole */}
        <div style={{ position: 'absolute', left: `${WATER_X}%`, bottom: '5%', width: 'min(22cqw, 40cqh)', aspectRatio: '4.5', translate: '-50% 0', borderRadius: '50%', background: 'radial-gradient(#A8DCFF, #6EC1F5)', border: '4px solid #fff', overflow: 'hidden' }}>
          <motion.div animate={{ scale: [0.3, 1.1], opacity: [0.8, 0] }} transition={{ repeat: Infinity, duration: 2.2 }} style={{ position: 'absolute', inset: '25% 30%', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.9)' }} />
        </div>
        <AnimatePresence>
          {splash > 0 &&
            Array.from({ length: 9 }, (_, i) => (
              <motion.div
                key={`${splash}-${i}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: (i - 4) * 18, y: [0, -60 - (i % 3) * 25, 10], opacity: [1, 1, 0], scale: 0.6 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{ position: 'absolute', left: `${WATER_X}%`, bottom: '8%', width: 16, height: 20, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#7FC8F8', border: '2px solid #fff', pointerEvents: 'none' }}
              />
            ))}
        </AnimatePresence>
        {/* Footprints: one pair per hop, so she can count them */}
        {prints.map((px, i) => (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', left: `${px}%`, bottom: '2.5%', translate: '-50% 0', fontSize: 'min(22px, 4cqh)', opacity: 0.55, letterSpacing: 4, pointerEvents: 'none' }}>
            🐾
          </motion.div>
        ))}
        {/* Dust puffs on landing */}
        <AnimatePresence>
          {puffs.map((p) =>
            [-1, 1].map((dir) => (
              <motion.div
                key={`${p.id}${dir}`}
                initial={{ x: 0, scale: 0.4, opacity: 0.9 }}
                animate={{ x: dir * 50, y: -18, scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                style={{ position: 'absolute', left: `${p.x}%`, bottom: '3%', width: 'min(60px, 9cqh)', aspectRatio: '1.6', translate: '-50% 0', borderRadius: '50%', background: '#F4C7A1', pointerEvents: 'none' }}
              />
            )),
          )}
        </AnimatePresence>
        {mamaIn && (
          <motion.div initial={{ left: '112%' }} animate={{ left: `${MAMA_X}%` }} transition={{ duration: 2.1, ease: 'easeOut', delay: 0.2 }} style={{ position: 'absolute', bottom: '3%', translate: '-50% 0', zIndex: 1 }}>
            <Mama ref={mama} height={mamaH} flip pouch={inPouch ? <Pip embed={MAMA_POUCH} wearing={{ hat: true, glasses: true }} /> : undefined} />
          </motion.div>
        )}
        {!inPouch && (
          <motion.div initial={false} animate={{ left: `${x}%` }} transition={{ duration: 0.4, delay: 0.15, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: '3%', translate: '-50% 0', zIndex: 2 }}>
            <Pip ref={pip} height={pipH} wearing={{ hat: true, glasses: true, water: true }} />
          </motion.div>
        )}
      </button>
    </Stage>
  )
}

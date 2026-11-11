// Red Outback: dress Pip for the hot sun (climate), then hop-count her to the water hole and on to Mama's pouch.
// Pip and Mama are live puppets: Pip fans herself in the heat, shakes her head at mittens, crouches before every hop,
// lands with a puff of dust and leaves footprints to count; Mama hops in and Pip jumps into her pouch.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { burst, DragArea, Draggable, DropZone, pick, say, sounds, useAlive, wait, type Line, type PuppetHandle } from '../../../../sdk'
import { sfx } from '../../../kit/sfx'
import { Stage, WIGGLE } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { useSections } from '../../../kit/sections'
import SECTIONS from './Outback.sections'
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
  const { start, enter } = useSections(SECTIONS)
  const [phase, setPhase] = useState<'story' | 'pack' | 'hop'>(start === 'water' || start === 'mama' ? 'hop' : start ?? 'story')
  useEffect(() => { if (phase !== 'hop') enter(phase) }, [phase, enter])
  useEffect(() => { if (phase !== 'hop') setProgress(0, 3) }, [phase, setProgress])
  if (phase === 'story') return <StoryBeat lines={[L.outback.story]} friend={<Pip height="100%" />} bg={art.bgOutback} onDone={() => setPhase('pack')} />
  if (phase === 'pack') return <Pack onDone={() => setPhase('hop')} />
  return <Hop start={start === 'mama' ? 1 : 0} onSection={enter} onDone={onDone} setProgress={setProgress} />
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

// Positions are % of the play area. Leg 1: 3 hops to the water hole. Leg 2: 5 hops to Mama.
const LEGS = [
  { hops: 3, from: 10, to: 40, prompt: L.outback.hop3 },
  { hops: 5, from: 40, to: 66, prompt: L.outback.hop5 },
]
const HOP_MS = 700 // matches ROO_ACTIONS.hop
const WATER_X = 40
const MAMA_X = 82

function Hop({ onDone, setProgress, start, onSection }: ActivityProps & { start: number; onSection: (id: 'water' | 'mama') => void }) {
  const [leg, setLeg] = useState(start)
  const [hops, setHops] = useState(0)
  const [busy, setBusy] = useState(false)
  const [x, setX] = useState(LEGS[start].from)
  const [prints, setPrints] = useState<number[]>(() => start ? Array.from({ length: LEGS[0].hops }, (_, i) => LEGS[0].from + (LEGS[0].to - LEGS[0].from) * (i + 1) / LEGS[0].hops) : [])
  const [puffs, setPuffs] = useState<{ id: number; x: number }[]>([])
  const [splash, setSplash] = useState(0)
  const [mamaIn, setMamaIn] = useState(false)
  const [inPouch, setInPouch] = useState(false)
  const pip = useRef<PuppetHandle>(null)
  const mama = useRef<PuppetHandle>(null)
  const alive = useAlive()
  const { from, to, hops: need, prompt } = LEGS[leg]
  const last = leg === LEGS.length - 1

  useEffect(() => {
    onSection(leg === 0 ? 'water' : 'mama')
    setProgress(leg + 1, 3)
  }, [leg, onSection, setProgress])

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
        <WaterHole splash={splash} />
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

const RIPPLE = { transformBox: 'fill-box', transformOrigin: 'center' } as const
const ROCKS = [
  { x: 52, y: 92, r: 15, c: '#B5532F' },
  { x: 74, y: 112, r: 10, c: '#9E4528' },
  { x: 336, y: 76, r: 13, c: '#B5532F' },
  { x: 356, y: 98, r: 17, c: '#A14A2B' },
  { x: 318, y: 122, r: 9, c: '#C2643C' },
  { x: 150, y: 132, r: 8, c: '#B5532F' },
]

/** A real billabong: a muddy bank and red stones round the edge, reeds and a pink water lily, a sky reflection,
 *  sparkles and slow ripples. Pip's splash sends a big ring across it. */
function WaterHole({ splash }: { splash: number }) {
  return (
    <svg
      viewBox="0 0 400 150"
      aria-hidden
      style={{ position: 'absolute', left: `${WATER_X}%`, bottom: '1%', width: 'min(40cqw, 72cqh)', translate: '-50% 0', overflow: 'visible', pointerEvents: 'none' }}
    >
      <defs>
        <radialGradient id="wh-water" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#3FB4E0" />
          <stop offset="65%" stopColor="#5CCBEA" />
          <stop offset="100%" stopColor="#9BE3F2" />
        </radialGradient>
        <radialGradient id="wh-bank" cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor="#7A3B22" />
          <stop offset="100%" stopColor="#C96A3D" />
        </radialGradient>
        <clipPath id="wh-clip">
          <ellipse cx="200" cy="92" rx="150" ry="40" />
        </clipPath>
      </defs>
      {/* Soft shadow on the dirt, then the sandy rim and the wet mud bank */}
      <ellipse cx="200" cy="100" rx="190" ry="54" fill="#D9774A" opacity="0.55" />
      <ellipse cx="200" cy="96" rx="172" ry="50" fill="#EBA06C" />
      <ellipse cx="200" cy="94" rx="160" ry="45" fill="url(#wh-bank)" />
      {/* The water */}
      <ellipse cx="200" cy="92" rx="150" ry="40" fill="url(#wh-water)" />
      <g clipPath="url(#wh-clip)">
        {/* A darker band under the far bank, and the sky's reflection */}
        <ellipse cx="200" cy="56" rx="160" ry="14" fill="#2A8FC0" opacity="0.5" />
        <ellipse cx="150" cy="80" rx="60" ry="9" fill="#fff" opacity="0.28" />
        <path d="M110 100 q14 -6 28 0 t28 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M232 112 q11 -5 22 0 t22 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M250 74 q9 -4 18 0" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55" />
        {/* Slow ripples */}
        {[0, 1.3].map((delay) => (
          <motion.ellipse
            key={delay}
            cx="230"
            cy="96"
            rx="34"
            ry="9"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            style={RIPPLE}
            animate={{ scale: [0.3, 1.6], opacity: [0.85, 0] }}
            transition={{ repeat: Infinity, duration: 2.6, delay, ease: 'easeOut' }}
          />
        ))}
        {/* Pip's splash: a big ring across the whole water hole */}
        {splash > 0 && (
          <motion.ellipse
            key={splash}
            cx="200"
            cy="94"
            rx="40"
            ry="11"
            fill="none"
            stroke="#fff"
            strokeWidth="4"
            style={RIPPLE}
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: 3.6, opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        )}
      </g>
      {/* A lily pad with a pink flower, bobbing */}
      <motion.g animate={{ y: [0, -2, 0], rotate: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }} style={RIPPLE}>
        <path d="M292 98 L314 96 A22 8 0 1 0 313 101 Z" fill="#5FAE4E" />
        <ellipse cx="292" cy="98" rx="22" ry="7.5" fill="none" stroke="#3F8A3A" strokeWidth="1.5" opacity="0.5" />
        {[-30, 0, 30, 60, -60].map((a) => (
          <ellipse key={a} cx="296" cy="88" rx="4.5" ry="10" fill="#FF8FC4" stroke="#fff" strokeWidth="1.2" transform={`rotate(${a} 296 94)`} />
        ))}
        <circle cx="296" cy="93" r="3.5" fill="#FFD84D" />
      </motion.g>
      <ellipse cx="124" cy="104" rx="16" ry="5.5" fill="#5FAE4E" />
      {/* Reeds and spinifex on the far bank */}
      {[
        { x: 78, h: 54, lean: -8 },
        { x: 90, h: 68, lean: -3 },
        { x: 102, h: 50, lean: 6 },
        { x: 300, h: 46, lean: -6 },
        { x: 312, h: 62, lean: 2 },
        { x: 322, h: 44, lean: 9 },
      ].map((r, i) => (
        <motion.g key={i} animate={{ rotate: [0, r.lean > 0 ? 3 : -3, 0] }} transition={{ repeat: Infinity, duration: 3 + i * 0.4, ease: 'easeInOut' }} style={{ transformBox: 'fill-box', transformOrigin: 'bottom center' }}>
          <path d={`M${r.x} 66 q${r.lean} ${-r.h / 2} ${r.lean * 1.6} ${-r.h}`} stroke="#6C9A3B" strokeWidth="4" strokeLinecap="round" fill="none" />
          {i % 3 === 1 && <rect x={r.x + r.lean * 1.6 - 4} y={66 - r.h - 4} width="8" height="18" rx="4" fill="#8A5230" />}
        </motion.g>
      ))}
      {/* Red stones round the edge, each with a sunny top */}
      {ROCKS.map((k, i) => (
        <g key={i}>
          <ellipse cx={k.x} cy={k.y} rx={k.r * 1.3} ry={k.r} fill={k.c} />
          <ellipse cx={k.x - k.r * 0.25} cy={k.y - k.r * 0.4} rx={k.r * 0.7} ry={k.r * 0.35} fill="#fff" opacity="0.22" />
        </g>
      ))}
      {/* Sparkles on the water */}
      {[
        { x: 170, y: 86, d: 0 },
        { x: 262, y: 104, d: 0.9 },
        { x: 214, y: 70, d: 1.7 },
      ].map((s) => (
        <motion.path
          key={s.x}
          d={`M${s.x} ${s.y - 7} L${s.x + 2} ${s.y - 2} L${s.x + 7} ${s.y} L${s.x + 2} ${s.y + 2} L${s.x} ${s.y + 7} L${s.x - 2} ${s.y + 2} L${s.x - 7} ${s.y} L${s.x - 2} ${s.y - 2} Z`}
          fill="#fff"
          style={RIPPLE}
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, delay: s.d, repeatDelay: 0.6 }}
        />
      ))}
    </svg>
  )
}

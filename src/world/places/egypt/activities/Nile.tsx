// Sail the Nile: Miu's felucca glides down the river. She drags the boat up and down to scoop lotus flowers (a baby hippo
// pops up and bumps it, giggling), then stops at two dry farms and pulls the shaduf's bucket down to lift river water onto
// the fields (3 pulls, then 5): the brown fields turn green and sprout. Egypt is a desert; the Nile makes it green.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Buddy, burst, say, sounds, useAlive, wait, type PuppetHandle } from '../../../../sdk'
import { Flag } from '../../../kit/Flag'
import { sfx } from '../../../kit/sfx'
import { Stage } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'
import { Miu } from '../puppets/Miu'

// The river is the bottom part of bg-nile: lanes are y positions in % of the screen's play area.
const TOP = 56
const BOTTOM = 90
const LOTUS_PER_LEG = 3
const LEGS = [
  { pulls: 3, prompt: L.nile.farm },
  { pulls: 5, prompt: L.nile.farm5 },
]
const BOAT_X = 22 // % across
const SPEED = 16 // % of the width per second

type Floater = { id: number; x: number; y: number; kind: 'lotus' | 'hippo'; done?: boolean }

export function Nile({ onDone, setProgress }: ActivityProps) {
  const [phase, setPhase] = useState<'story' | 'sail' | 'farm' | 'end'>('story')
  const [leg, setLeg] = useState(0)
  const [caught, setCaught] = useState(0)
  const [boatY, setBoatY] = useState(72)
  const [floaters, setFloaters] = useState<Floater[]>([])
  const [pulls, setPulls] = useState(0)
  const [greens, setGreens] = useState<number[]>([]) // farms already watered
  const [splash, setSplash] = useState(0)
  const [bump, setBump] = useState(0)
  const miu = useRef<PuppetHandle>(null)
  const hippo = useRef<PuppetHandle>(null)
  const area = useRef<HTMLDivElement>(null)
  const boatRef = useRef(72)
  const dragging = useRef(false)
  const floatRef = useRef<Floater[]>([])
  const nextId = useRef(1)
  const hippoDone = useRef(false)
  const caughtRef = useRef(0)
  const busy = useRef(false)
  const alive = useAlive()

  useEffect(() => setProgress(leg * 2 + (phase === 'farm' || phase === 'end' ? 1 : 0) + (phase === 'end' ? 1 : 0), 4), [leg, phase, setProgress])

  // Sailing: flowers (and once, the hippo) float in from the right; the boat scoops whatever it touches.
  useEffect(() => {
    if (phase !== 'sail') return
    let raf = 0
    let last = performance.now()
    let spawnIn = 0.4
    let spawned = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      spawnIn -= dt
      const list = floatRef.current
      if (spawnIn <= 0 && list.filter((f) => f.kind === 'lotus' && !f.done).length < 2) {
        spawnIn = 1.5
        spawned++
        // The hippo pops up once, on the second trip, right in the boat's lane (a friendly bump, never a failure).
        const hippoTime = leg === 1 && !hippoDone.current && spawned === 2
        const y = hippoTime ? boatRef.current : [62, 73, 84][Math.floor(Math.random() * 3)]
        list.push({ id: nextId.current++, x: 108, y, kind: hippoTime ? 'hippo' : 'lotus' })
      }
      for (const f of list) {
        f.x -= SPEED * dt
        if (f.done || Math.abs(f.x - BOAT_X - 6) > 7 || Math.abs(f.y - boatRef.current) > 8) continue
        f.done = true
        if (f.kind === 'hippo') {
          hippoDone.current = true
          setBump((b) => b + 1)
          sfx.splash()
          void hippo.current?.play('jump')
          void miu.current?.play('wiggle')
          void say(L.nile.hippo)
        } else {
          caughtRef.current++
          sfx.pop()
          sounds.note(caughtRef.current * 2)
          setCaught(caughtRef.current)
        }
      }
      floatRef.current = list.filter((f) => f.x > -12 && !(f.done && f.kind === 'lotus'))
      setFloaters([...floatRef.current])
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, leg])

  // Enough flowers: sail to the next thirsty farm.
  useEffect(() => {
    if (phase !== 'sail' || caught < LOTUS_PER_LEG) return
    void (async () => {
      sounds.correct()
      burst(BOAT_X / 100, 0.6)
      void miu.current?.play('cheer')
      await wait(900)
      if (!alive()) return
      floatRef.current = []
      setFloaters([])
      setPulls(0)
      setPhase('farm')
    })()
  }, [caught, phase])

  const moveBoat = (clientY: number) => {
    const r = area.current?.getBoundingClientRect()
    if (!r) return
    const y = Math.max(TOP + 4, Math.min(BOTTOM - 2, ((clientY - r.top) / r.height) * 100))
    boatRef.current = y
    setBoatY(y)
  }

  const pull = async () => {
    if (phase !== 'farm' || busy.current) return
    const need = LEGS[leg].pulls
    if (pulls >= need) return
    busy.current = true
    const n = pulls + 1
    setPulls(n)
    setSplash((s) => s + 1)
    sfx.splash()
    sounds.note(n * 2)
    await say(L.nile.count[n - 1])
    busy.current = false
    if (!alive() || n < need) return
    busy.current = true
    setGreens((g) => [...g, leg])
    sounds.correct()
    burst(0.72, 0.4)
    void miu.current?.play('cheer')
    await say(L.nile.green)
    if (!alive()) return
    if (leg + 1 < LEGS.length) {
      busy.current = false
      setLeg(leg + 1)
      caughtRef.current = 0
      setCaught(0)
      setPhase('sail')
      return
    }
    setPhase('end')
    void miu.current?.play('dance')
    await say(L.nile.desert)
    if (!alive()) return
    await say(L.nile.longest)
    await wait(400)
    if (alive()) onDone()
  }

  if (phase === 'story') return <StoryBeat lines={[L.nile.story]} friend={<Miu height="100%" />} bg={art.bgNile} onDone={() => setPhase('sail')} />

  const sailing = phase === 'sail'
  const need = LEGS[leg].pulls
  const prompt = sailing ? L.nile.steer : phase === 'farm' ? LEGS[leg].prompt : undefined
  return (
    <Stage bg={art.bgNile} prompt={prompt} style={{ backgroundPosition: 'center bottom' }}>
      <div
        ref={area}
        onPointerDown={(e) => {
          if (!sailing) return
          dragging.current = true
          ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
          moveBoat(e.clientY)
        }}
        onPointerMove={(e) => dragging.current && sailing && moveBoat(e.clientY)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        style={{ position: 'fixed', inset: 0, touchAction: 'none', containerType: 'size', overflow: 'hidden' }}
      >
        <RiverLife moving={sailing} />
        {/* Farms on the far bank: brown and dry until she waters them. */}
        <AnimatePresence>
          {phase !== 'sail' && (
            <motion.div key={`farm${leg}`} initial={{ x: '60vw' }} animate={{ x: 0 }} exit={{ x: '-110vw' }} transition={{ duration: 1.2, ease: 'easeOut' }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <Farm green={greens.includes(leg)} pulls={pulls} need={need} />
            </motion.div>
          )}
        </AnimatePresence>
        {floaters.map((f) => (
          <div key={f.id} style={{ position: 'absolute', left: `${f.x}%`, top: `${f.y}%`, translate: '-50% -70%', height: f.kind === 'hippo' ? 'min(22cqh, 20cqw)' : 'min(12cqh, 12cqw)', pointerEvents: 'none', zIndex: f.y > boatY ? 4 : 2 }}>
            {f.kind === 'hippo' ? (
              <motion.div initial={{ y: '40%' }} animate={{ y: 0 }} style={{ height: '100%' }}>
                <Buddy ref={hippo} img={art.hippo} voice="hippo" height="100%" />
              </motion.div>
            ) : (
              <motion.img src={art.lotus} alt="" animate={{ rotate: [-4, 4, -4], y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ height: '100%' }} />
            )}
          </div>
        ))}
        {/* The shaduf: a bucket on a long pole. Pull the rope down to dip the bucket in the river and swing water up. */}
        {phase === 'farm' && <Shaduf pulls={pulls} splash={splash} onPull={() => void pull()} />}
        {/* The felucca with Miu aboard. */}
        <motion.div
          animate={{ top: `${boatY}%`, rotate: bump === 0 ? 0 : bump % 2 ? [0, -8, 6, 0] : [0, 8, -6, 0] }}
          transition={{ top: { type: 'spring', stiffness: 220, damping: 26 }, rotate: { duration: 0.6 } }}
          style={{ position: 'absolute', left: `${BOAT_X}%`, translate: '-50% -82%', height: 'min(34cqh, 30cqw)', aspectRatio: '1', zIndex: 3, pointerEvents: 'none' }}
        >
          <motion.div animate={{ y: [0, -5, 0], rotate: [-1.5, 1.5, -1.5] }} transition={{ repeat: Infinity, duration: 2.4 }} style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div style={{ position: 'absolute', left: '36%', bottom: '24%', height: '36%', zIndex: 1 }}>
              <Miu ref={miu} height="100%" />
            </div>
            <img src={art.felucca} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 2 }} />
            <div style={{ position: 'absolute', left: '50%', top: '2%', zIndex: 3 }}>
              <motion.div animate={{ skewY: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ transformOrigin: 'left center' }}>
                <Flag id="egypt" width="min(8cqh, 7cqw)" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        {/* Flowers she has scooped this trip. */}
        {sailing && (
          <div style={{ position: 'absolute', right: 12, bottom: 'calc(var(--safe-bottom) + 12px)', display: 'flex', gap: 6, background: 'rgba(255,255,255,0.85)', borderRadius: 999, padding: '6px 12px', boxShadow: 'var(--shadow)', zIndex: 6 }}>
            {Array.from({ length: LOTUS_PER_LEG }, (_, i) => (
              <img key={i} src={art.lotus} alt="" style={{ height: 'min(48px, 7vmin)', filter: i < caught ? 'none' : 'grayscale(1) opacity(0.35)' }} />
            ))}
          </div>
        )}
      </div>
    </Stage>
  )
}

/** Passing scenery so the boat feels like it's moving: palms on the far bank, ripples on the water. */
function RiverLife({ moving }: { moving: boolean }) {
  const state = moving ? 'running' : 'paused'
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <style>{`
        @keyframes nile-pass { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes nile-ripple { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>
      <div style={{ position: 'absolute', left: 0, top: '44%', width: '200%', height: '12cqh', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', animation: `nile-pass 26s linear infinite`, animationPlayState: state }}>
        {Array.from({ length: 10 }, (_, i) => (
          <img key={i} src={art.palm} alt="" style={{ height: `${70 + (i % 3) * 15}%` }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, top: '60%', bottom: 0, width: '200%', animation: `nile-ripple 9s linear infinite`, animationPlayState: state }}>
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${(i * 6.25 + (i % 2) * 3) % 100}%`, top: `${10 + ((i * 37) % 80)}%`, width: '5%', height: 5, borderRadius: 5, background: 'rgba(255,255,255,0.75)' }} />
        ))}
      </div>
    </div>
  )
}

/** A dry farm field on the far bank that turns green when watered: sprouts, wheat and date palms. */
function Farm({ green, pulls, need }: { green: boolean; pulls: number; need: number }) {
  const wet = green ? 1 : pulls / need
  return (
    <div style={{ position: 'absolute', left: '48%', right: '2%', top: '40%', height: '16cqh' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '40% 40% 20% 20% / 60% 60% 20% 20%', border: '4px solid #3A2A33', background: `color-mix(in srgb, #7FD39A ${Math.round(wet * 100)}%, #C99A64)`, transition: 'background 0.6s' }} />
      {/* Channels of water fill the rows one by one. */}
      {[0.25, 0.5, 0.75].map((row, i) => (
        <div key={i} style={{ position: 'absolute', left: '8%', right: '8%', top: `${row * 100}%`, height: 6, borderRadius: 6, background: wet > i / 3 ? '#7FC8F8' : '#A87A4E', transition: 'background 0.4s' }} />
      ))}
      <div style={{ position: 'absolute', left: '6%', right: '6%', bottom: '55%', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
        {Array.from({ length: 7 }, (_, i) => (
          <motion.span key={i} initial={false} animate={{ scale: wet >= (i + 1) / 8 ? 1 : 0 }} transition={{ type: 'spring', bounce: 0.6 }} style={{ fontSize: 'min(7cqh, 6cqw)', transformOrigin: '50% 100%', display: 'inline-block' }}>
            {green ? (i % 3 === 1 ? '🌴' : '🌾') : '🌱'}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

/** The shaduf on the near bank: a post, a long pole with a bucket, and a rope to pull. Drag the rope down (or tap it). */
function Shaduf({ pulls, splash, onPull }: { pulls: number; splash: number; onPull: () => void }) {
  const [dip, setDip] = useState(false)
  const start = useRef<number | null>(null)
  // Each pull: the bucket dips into the river, then swings up and pours onto the field.
  useEffect(() => {
    if (!splash) return
    setDip(true)
    const t = setTimeout(() => setDip(false), 450)
    return () => clearTimeout(t)
  }, [splash])
  return (
    <div style={{ position: 'absolute', left: '44%', top: '30%', width: 'min(36cqw, 50cqh)', aspectRatio: '1.1', zIndex: 5 }}>
      <svg viewBox="0 0 220 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
        {/* Post */}
        <path d="M100 196 L108 60 L120 60 L128 196 Z" fill="#B07A54" stroke="#3A2A33" strokeWidth="5" strokeLinejoin="round" />
        <motion.g animate={{ rotate: dip ? -22 : 14 }} transition={{ type: 'spring', stiffness: 160, damping: 12 }} style={{ originX: '114px', originY: '62px' }}>
          {/* Pole with a mud counterweight on the right, the bucket hanging on the left */}
          <rect x="10" y="56" width="200" height="12" rx="6" fill="#D9A574" stroke="#3A2A33" strokeWidth="5" />
          <circle cx="204" cy="62" r="18" fill="#8C5A3A" stroke="#3A2A33" strokeWidth="5" />
          <line x1="20" y1="62" x2="20" y2="120" stroke="#3A2A33" strokeWidth="4" />
          <path d="M4 118 H36 L32 146 Q20 152 8 146 Z" fill="#FF8FB8" stroke="#3A2A33" strokeWidth="5" strokeLinejoin="round" />
          {dip && <ellipse cx="20" cy="122" rx="14" ry="4" fill="#7FC8F8" />}
        </motion.g>
      </svg>
      {/* The rope handle she pulls. */}
      <motion.button
        aria-label="Pull the bucket"
        className={pulls === 0 ? 'world-glow' : undefined}
        drag="y"
        dragConstraints={{ top: 0, bottom: 90 }}
        dragElastic={0.2}
        dragSnapToOrigin
        onDragStart={() => (start.current = 0)}
        onDrag={(_, info) => {
          if (start.current !== null && info.offset.y > 55) {
            start.current = null
            onPull()
          }
        }}
        onTap={onPull}
        whileTap={{ scale: 1.1 }}
        style={{ position: 'absolute', left: '-2%', top: '64%', width: 'var(--target)', height: 'var(--target)', borderRadius: '50%', background: '#fff', border: '5px solid var(--gold)', display: 'grid', placeItems: 'center', fontSize: 'calc(var(--target) * 0.5)', touchAction: 'none', boxShadow: 'var(--shadow)' }}
      >
        🪣
      </motion.button>
      <AnimatePresence>
        {splash > 0 &&
          Array.from({ length: 7 }, (_, i) => (
            <motion.div
              key={`${splash}-${i}`}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x: 60 + i * 22, y: [0, -50 - (i % 3) * 20, 20], opacity: [1, 1, 0] }}
              transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
              style={{ position: 'absolute', left: '8%', top: '30%', width: 14, height: 18, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#7FC8F8', border: '2px solid #fff', pointerEvents: 'none' }}
            />
          ))}
      </AnimatePresence>
    </div>
  )
}

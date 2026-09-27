// The finale: the Sound and Light show at the pyramids of Giza (a real show, every night). The friends she helped wait in
// the dark. She drags colored lights onto the pyramids and the Sphinx: each light paints a monument and wakes one friend,
// who dances and says hello. Then she pulls the rope to raise Egypt's flag, and there are fireworks.
import { AnimatePresence, motion } from 'motion/react'
import { createRef, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { bigCelebration, burst, say, sounds, SparklePuppet, useAlive, wait, type PuppetHandle } from '../../../../sdk'
import { Flag } from '../../../kit/Flag'
import { sfx } from '../../../kit/sfx'
import { Stage } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { useLandscape } from '../../../kit/useLandscape'
import { art } from '../art'
import { L } from '../lines'
import type { Guest } from '../Place'
import { Miu } from '../puppets/Miu'

// Monuments in bg-giza-night (1536 x 1024), drawn in an SVG that covers the screen exactly like the picture does.
type Monument = { id: string; shape: 'poly' | 'sphinx'; points?: string; center: [number, number] }
const MONUMENTS: Monument[] = [
  { id: 'left', shape: 'poly', points: '528,395 683,627 368,627', center: [528, 540] },
  { id: 'big', shape: 'poly', points: '875,215 1215,627 510,627', center: [875, 470] },
  { id: 'right', shape: 'poly', points: '1253,368 1500,627 1133,627', center: [1300, 540] },
  { id: 'sphinx', shape: 'sphinx', center: [260, 520] },
]
const COLORS = ['#FF4F9A', '#FFC83D', '#8FE3C8', '#A8DCFF', '#B9A6F5', '#FF8FB8']
const ROPE_PULLS = 3
const BG_W = 1536
const BG_H = 1024

export function LightShow({ guests, onDone, setProgress }: { guests: Guest[]; onDone: () => void; setProgress: (done: number, total: number) => void }) {
  const [story, setStory] = useState(true)
  const [lit, setLit] = useState<Record<string, string>>({}) // monument → color
  const [beams, setBeams] = useState<{ id: number; to: [number, number]; color: string }[]>([])
  const [awake, setAwake] = useState(0) // how many guests are lit
  const [flag, setFlag] = useState(0)
  const [fireworks, setFireworks] = useState(false)
  const refs = useMemo(() => guests.map(() => createRef<PuppetHandle>()) as RefObject<PuppetHandle | null>[], [guests])
  const miu = useMemo(() => createRef<PuppetHandle>(), [])
  const sparkle = useMemo(() => createRef<PuppetHandle>(), [])
  const alive = useAlive()
  const landscape = useLandscape()
  const [busy, setBusy] = useState(false)
  const [used, setUsed] = useState<string[]>([])
  const lightsLeft = guests.length - awake
  const roping = lightsLeft === 0 && !fireworks

  // Four stars (two friends each, then the flag): seven would crowd the prompt on a phone.
  useEffect(() => setProgress(Math.floor(awake / 2) + (flag >= ROPE_PULLS ? 1 : 0), Math.ceil(guests.length / 2) + 1), [awake, flag, guests.length, setProgress])

  // Everyone dances while the fireworks go.
  useEffect(() => {
    if (!fireworks) return
    const all = [sparkle, miu, ...refs]
    const go = () => all.forEach((r, i) => setTimeout(() => void r.current?.play(i % 2 ? 'dance' : 'cheer'), i * 120))
    go()
    const id = setInterval(go, 2300)
    return () => clearInterval(id)
  }, [fireworks, refs, miu, sparkle])

  /** Where on the picture a point on the screen is (the picture covers the screen, centered). */
  const toPicture = (x: number, y: number): [number, number] => {
    const s = Math.max(window.innerWidth / BG_W, window.innerHeight / BG_H)
    return [(x - (window.innerWidth - BG_W * s) / 2) / s, (y - (window.innerHeight - BG_H * s) / 2) / s]
  }

  const shine = async (color: string, at: { x: number; y: number }) => {
    if (busy || lightsLeft <= 0) return
    setBusy(true)
    const [px, py] = toPicture(at.x, at.y)
    // The nearest monument (of the ones on screen) takes the color.
    const visible = MONUMENTS.filter((m) => {
      const s = Math.max(window.innerWidth / BG_W, window.innerHeight / BG_H)
      const sx = m.center[0] * s + (window.innerWidth - BG_W * s) / 2
      return sx > 0 && sx < window.innerWidth
    })
    const m = [...visible].sort((a, b) => Math.hypot(a.center[0] - px, a.center[1] - py) - Math.hypot(b.center[0] - px, b.center[1] - py))[0] ?? MONUMENTS[1]
    const id = Date.now()
    setBeams((b) => [...b, { id, to: m.center, color }])
    setTimeout(() => setBeams((b) => b.filter((x) => x.id !== id)), 1600)
    sfx.fwip()
    sounds.sparkle()
    setLit((l) => ({ ...l, [m.id]: color }))
    setUsed((u) => [...u, color])
    const g = awake
    setAwake(g + 1)
    await wait(300)
    if (!alive()) return
    sounds.note(g * 2)
    void refs[g].current?.play('dance')
    await say(guests[g].line)
    if (!alive()) return
    setBusy(false)
    if (g + 1 === guests.length) void say(L.show.rope)
  }

  const pull = async () => {
    if (!roping || busy) return
    const n = flag + 1
    setFlag(n)
    sfx.fwip()
    sounds.note(n * 3)
    if (n < ROPE_PULLS) return
    setBusy(true)
    sounds.correct()
    await wait(600)
    if (!alive()) return
    await say(L.show.flag)
    if (!alive()) return
    setFireworks(true)
    sounds.fanfare()
    for (let k = 0; k < 6; k++) setTimeout(() => (burst(0.15 + Math.random() * 0.7, 0.15 + Math.random() * 0.25), sfx.pop()), k * 380)
    await wait(1600)
    if (!alive()) return
    bigCelebration(1500)
    await say(L.show.thanks)
    await wait(600)
    if (alive()) onDone()
  }

  if (story) return <StoryBeat lines={[L.show.story]} friend={<Miu height="100%" />} bg={art.bgGizaNight} onDone={() => setStory(false)} />

  // Everyone stands on the sand in one row, as big as fits.
  const cast = [{ box: [0.87, 1] as [number, number] }, { box: [0.75, 1] as [number, number] }, ...guests]
  const widths = cast.reduce((s, c) => s + c.box[0], 0)
  // Portrait: two rows, so the friends she collected are big enough to see. Landscape: one row, clear of the lights.
  const h = landscape ? `min(26vh, ${84 / widths}vw)` : `min(19vh, ${(94 * 2) / (widths + 1.4)}vw)`

  return (
    <Stage bg={art.bgGizaNight} prompt={fireworks ? undefined : roping ? L.show.rope : L.show.beam} style={{ backgroundImage: 'none', backgroundColor: '#3B2E6E' }}>
      <div style={{ position: 'fixed', inset: 0 }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <svg viewBox={`0 0 ${BG_W} ${BG_H}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <image href={art.bgGizaNight} width={BG_W} height={BG_H} />
            {MONUMENTS.map((m) => {
              const color = lit[m.id]
              const shape = (props: object) =>
                m.shape === 'poly' ? (
                  <polygon points={m.points} {...props} />
                ) : (
                  <g {...props}>
                    <ellipse cx="278" cy="455" rx="120" ry="130" />
                    <path d="M0 560 C120 540 300 560 468 600 L470 690 L0 690 Z" />
                  </g>
                )
              return (
                <g key={m.id} style={{ opacity: color ? 1 : 0, transition: 'opacity 0.6s' }}>
                  {shape({ fill: color ?? '#fff', style: { mixBlendMode: 'color' } })}
                  {shape({ fill: color ?? '#fff', opacity: 0.35, style: { mixBlendMode: 'screen' } })}
                </g>
              )
            })}
            <AnimatePresence>
              {beams.map((b) => {
                const from: [number, number] = [b.to[0] * 0.3 + BG_W * 0.35, BG_H]
                return (
                  <motion.polygon
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.55, 0] }}
                    transition={{ duration: 1.5 }}
                    points={`${from[0] - 20},${from[1]} ${from[0] + 20},${from[1]} ${b.to[0] + 140},${b.to[1] - 120} ${b.to[0] - 140},${b.to[1] - 120}`}
                    fill={b.color}
                    style={{ mixBlendMode: 'screen' }}
                  />
                )
              })}
            </AnimatePresence>
          </svg>
          {fireworks && <Fireworks />}
        </div>

        {/* The lights to drag, down the right side. */}
        {!roping && !fireworks && (
          <div style={{ ['--light' as string]: 'min(var(--target), calc((100vh - var(--top-clear) - 40px) / 7.5))', position: 'absolute', right: 'max(12px, env(safe-area-inset-right))', top: 'max(var(--top-clear), 12vh)', display: 'flex', flexDirection: 'column', gap: 'min(12px, 1.4vh)', zIndex: 5 }}>
            {/* Used lights shrink away but stay mounted (unmounting a light mid-drag leaves the drag stuck). */}
            {COLORS.map((c, i) => (
              <motion.div key={c} initial={{ scale: 0 }} animate={{ scale: used.includes(c) ? 0 : 1 }} transition={{ delay: used.includes(c) ? 0.2 : i * 0.05 }} style={{ pointerEvents: used.includes(c) ? 'none' : 'auto', height: used.includes(c) ? 0 : undefined }}>
                <DragLight color={c} glow={awake === 0 && i === 0} onDrop={(x, y) => !used.includes(c) && void shine(c, { x, y })} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Until the first light is used: a hand shows the way from the lights to the big pyramid. */}
        {awake === 0 && !busy && (
          <motion.div
            animate={{ x: [0, -window.innerWidth * 0.35], y: [0, window.innerHeight * 0.08], opacity: [0, 1, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, repeatDelay: 0.6 }}
            style={{ position: 'absolute', right: 'calc(var(--target) * 0.6)', top: 'calc(max(var(--top-clear), 12vh) + 30px)', fontSize: 'min(64px, 9vmin)', zIndex: 6, pointerEvents: 'none' }}
          >
            👆
          </motion.div>
        )}

        {/* The flag and its rope. */}
        {(roping || fireworks) && <FlagPole raised={flag / ROPE_PULLS} onPull={() => void pull()} glow={flag === 0} bottom={landscape ? '32vh' : '50vh'} />}

        {/* Everyone on the sand: Sparkle, Miu, then each friend (in the dark until a light wakes them). */}
        <div style={{ position: 'absolute', left: 0, right: landscape ? 'calc(var(--target) + 24px)' : 0, bottom: 'calc(var(--safe-bottom) + 2vh)', display: 'flex', flexWrap: landscape ? 'nowrap' : 'wrap', justifyContent: 'center', alignItems: 'flex-end', gap: '0.5vw', rowGap: '1vh', padding: landscape ? 0 : '0 3vw', pointerEvents: 'none' }}>
          <SparklePuppet ref={sparkle} height={h} />
          <Miu ref={miu} height={`calc(${h} * 0.8)`} />
          {guests.map((g, i) => (
            <motion.div key={g.name} animate={{ filter: i < awake ? 'brightness(1) saturate(1)' : 'brightness(0.35) saturate(0.4)' }} transition={{ duration: 0.6 }} style={{ display: 'flex', alignItems: 'flex-end' }}>
              {g.render(refs[i], `calc(${h} * ${g.box[1]})`)}
            </motion.div>
          ))}
        </div>
      </div>
    </Stage>
  )
}

/** A glowing ball of light to drag onto the monuments (or tap: it flies to the big pyramid). Plain pointer events, so
 *  it follows her finger exactly and a new light can be grabbed the moment the last one lands. */
function DragLight({ color, glow, onDrop }: { color: string; glow: boolean; onDrop: (x: number, y: number) => void }) {
  const [off, setOff] = useState<{ x: number; y: number } | null>(null)
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  return (
    <div
      role="button"
      aria-label="light"
      onPointerDown={(e) => {
        ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
        start.current = { x: e.clientX, y: e.clientY, moved: false }
        setOff({ x: 0, y: 0 })
      }}
      onPointerMove={(e) => {
        const s = start.current
        if (!s) return
        if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > 8) s.moved = true
        setOff({ x: e.clientX - s.x, y: e.clientY - s.y })
      }}
      onPointerUp={(e) => {
        const s = start.current
        start.current = null
        setOff(null)
        if (!s) return
        if (s.moved) onDrop(e.clientX, e.clientY)
        else onDrop(window.innerWidth * 0.5, window.innerHeight * 0.4)
      }}
      onPointerCancel={() => {
        start.current = null
        setOff(null)
      }}
      className={glow && !off ? 'world-glow' : undefined}
      style={{
        width: 'var(--light)',
        height: 'var(--light)',
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, #fff 0 18%, ${color} 45%, ${color}AA 70%)`,
        border: '4px solid #fff',
        boxShadow: `0 0 26px 6px ${color}`,
        cursor: 'grab',
        touchAction: 'none',
        transform: off ? `translate(${off.x}px, ${off.y}px) scale(1.25)` : undefined,
        transition: off ? 'none' : 'transform 0.25s',
        position: 'relative',
        zIndex: off ? 50 : 1,
      }}
    />
  )
}

/** A flagpole on the right: pull the rope down (or tap it) and the flag climbs a third of the way each time. */
function FlagPole({ raised, onPull, glow, bottom }: { raised: number; onPull: () => void; glow: boolean; bottom: string }) {
  return (
    <div style={{ position: 'absolute', right: '6vw', top: 'max(var(--top-clear), 12vh)', bottom, width: 'min(26vw, 200px)', zIndex: 5 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, borderRadius: 5, background: '#E9D6B0', border: '3px solid #3A2A33' }} />
      <div style={{ position: 'absolute', left: -6, top: -14, width: 22, height: 22, borderRadius: '50%', background: 'var(--gold)', border: '3px solid #3A2A33' }} />
      <motion.div animate={{ bottom: `${raised * 78}%` }} transition={{ type: 'spring', bounce: 0.3 }} style={{ position: 'absolute', left: 10 }}>
        <motion.div animate={{ skewY: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ transformOrigin: 'left center' }}>
          <Flag id="egypt" width="min(22vw, 170px)" />
        </motion.div>
      </motion.div>
      {raised < 1 && (
        <motion.button
          aria-label="Pull the rope"
          className={glow ? 'world-glow' : undefined}
          drag="y"
          dragConstraints={{ top: 0, bottom: 80 }}
          dragElastic={0.2}
          dragSnapToOrigin
          onDragEnd={(_, info) => info.offset.y > 40 && onPull()}
          onTap={onPull}
          style={{ position: 'absolute', left: -44, bottom: '-8%', width: 'var(--target)', height: 'var(--target)', borderRadius: '50%', background: '#fff', border: '5px solid var(--gold)', display: 'grid', placeItems: 'center', fontSize: 'calc(var(--target) * 0.45)', touchAction: 'none', boxShadow: 'var(--shadow)' }}
        >
          🪢
        </motion.button>
      )}
    </div>
  )
}

function Fireworks() {
  const colors = ['#FF4F9A', '#FFC83D', '#B9A6F5', '#8FE3C8', '#A8DCFF']
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {[
        [16, 16],
        [40, 9],
        [64, 18],
        [86, 11],
        [28, 28],
        [74, 30],
      ].map(([x, y], i) => (
        <motion.svg
          key={i}
          viewBox="-100 -100 200 200"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1, 1.15], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, delay: i * 0.35, repeat: Infinity, repeatDelay: 0.8, times: [0, 0.35, 1] }}
          style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 'min(34vmin, 260px)', translate: '-50% -50%', overflow: 'visible' }}
        >
          {Array.from({ length: 14 }, (_, k) => {
            const a = (k / 14) * Math.PI * 2
            return <line key={k} x1={Math.cos(a) * 30} y1={Math.sin(a) * 30} x2={Math.cos(a) * 88} y2={Math.sin(a) * 88} stroke={k % 2 ? colors[i % colors.length] : '#fff'} strokeWidth={9} strokeLinecap="round" />
          })}
          <circle r="14" fill="#fff" />
        </motion.svg>
      ))}
    </div>
  )
}

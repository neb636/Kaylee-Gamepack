// Secret Pyramid Passage: a torch-lit maze. She drags Miu through dark tunnels; the torchlight shows the walls around her,
// paintings light up as she passes, and dead ends hide surprises (a sleepy bat), never failures. Three short mazes
// (collect 1 scarab, then 2 scarabs, then find the way with a smaller light) lead to the treasure room, where Tutu the
// mummy wakes up from a very long nap.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { Buddy, burst, pick, say, sounds, useAlive, wait, type PuppetHandle } from '../../../../sdk'
import { sfx } from '../../../kit/sfx'
import { Stage } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { Torchlight } from '../../../kit/Torchlight'
import { useLandscape } from '../../../kit/useLandscape'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'
import { Miu } from '../puppets/Miu'
import { Tutu } from '../puppets/Tutu'
import { follow, H, MAZES, near, pointAt, startPos, W, type Maze, type Pos, type Pt } from './maze'

const PROMPTS = [L.passage.drag, L.passage.two, L.passage.deeper]

export function Passage({ onDone, setProgress }: ActivityProps) {
  const [phase, setPhase] = useState<'story' | 'maze' | 'treasure'>('story')
  const [level, setLevel] = useState(0)
  useEffect(() => setProgress(phase === 'treasure' ? 3 : level, 4), [phase, level, setProgress])
  if (phase === 'story') return <StoryBeat lines={[L.passage.story]} friend={<Miu height="100%" />} bg={art.bgTomb} onDone={() => setPhase('maze')} />
  if (phase === 'treasure') return <Treasure onDone={onDone} setProgress={setProgress} />
  return (
    <Tunnels
      key={level}
      maze={MAZES[level]}
      first={level === 0}
      prompt={PROMPTS[level]}
      onExit={() => (level + 1 < MAZES.length ? setLevel(level + 1) : setPhase('treasure'))}
    />
  )
}

/** Measures an element's box on screen. */
function useRect() {
  const ref = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState({ left: 0, top: 0, width: 0, height: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      const p = el.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0 }
      setRect({ left: r.left - p.left, top: r.top - p.top, width: r.width, height: r.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])
  return [ref, rect] as const
}

function Tunnels({ maze, first, prompt, onExit }: { maze: Maze; first: boolean; prompt: string; onExit: () => void }) {
  const [pos, setPos] = useState<Pos>(() => startPos(maze))
  const [got, setGot] = useState<number[]>([])
  const [seen, setSeen] = useState<string[]>([])
  const [moved, setMoved] = useState(false)
  const [facing, setFacing] = useState(1)
  const [leaving, setLeaving] = useState(false)
  const miu = useRef<PuppetHandle>(null)
  const bats = useRef<Record<string, PuppetHandle | null>>({})
  const finger = useRef<Pt | null>(null)
  const posRef = useRef(pos)
  const alive = useAlive()
  const landscape = useLandscape()
  const [box, rect] = useRect()
  const open = got.length === maze.scarabs.length
  const here = pointAt(maze, pos)

  // Maze units → % of the maze box (transposed in portrait, so the long side of the maze runs down the screen).
  const toBox = (p: Pt) => (landscape ? { x: (p.x / W) * 100, y: (p.y / H) * 100 } : { x: (p.y / H) * 100, y: (p.x / W) * 100 })
  const unit = (landscape ? rect.width : rect.height) / W // px per maze unit

  // Miu walks toward her finger at a steady pace (so a fast swipe doesn't teleport her).
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const f = finger.current
      if (!f || leaving) return
      const cur = pointAt(maze, posRef.current)
      const d = Math.hypot(f.x - cur.x, f.y - cur.y)
      if (d < 0.5) return
      const k = Math.min(1, (70 * dt) / d)
      const next = follow(maze, posRef.current, { x: cur.x + (f.x - cur.x) * k, y: cur.y + (f.y - cur.y) * k })
      const np = pointAt(maze, next)
      if (Math.abs(np.x - cur.x) + Math.abs(np.y - cur.y) < 0.01) return
      if (Math.abs(np.x - cur.x) > 0.05) setFacing(np.x > cur.x ? 1 : -1)
      posRef.current = next
      setPos(next)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [maze, leaving])

  // What Miu bumps into: scarabs, dead-end surprises, the door.
  useEffect(() => {
    maze.scarabs.forEach((s, i) => {
      if (got.includes(i) || !near(here, s, 7)) return
      const n = got.length + 1
      setGot((g) => [...g, i])
      sounds.correct()
      sounds.note(n * 3)
      burst(0.5, 0.4)
      void miu.current?.play('cheer')
      void say(first && n === 1 ? L.passage.scarab : L.passage.count[n - 1])
    })
    for (const end of maze.ends) {
      if (seen.includes(end.at) || !near(here, maze.nodes[end.at], 9)) continue
      setSeen((s) => [...s, end.at])
      void miu.current?.play('shake')
      if (end.kind === 'bat') {
        void bats.current[end.at]?.play('wiggle')
        void say(L.passage.bat)
      } else void say(L.passage.wall)
    }
    if (open && !leaving && near(here, maze.nodes[maze.exit], 8)) {
      setLeaving(true)
      sounds.whoosh()
      void miu.current?.play('pounce')
      void (async () => {
        await wait(700)
        if (alive()) onExit()
      })()
    }
  }, [here.x, here.y])

  // Her finger, in maze units (it doesn't have to be on a tunnel: Miu gets as close as the tunnels allow).
  const toMaze = (e: PointerEvent) => {
    const r = box.current!.getBoundingClientRect()
    const u = (e.clientX - r.left) / r.width
    const v = (e.clientY - r.top) / r.height
    return landscape ? { x: u * W, y: v * H } : { x: v * W, y: u * H }
  }

  const b = toBox(here)
  const exit = toBox(maze.nodes[maze.exit])
  const view = landscape ? `0 0 ${W} ${H}` : `0 0 ${H} ${W}`
  const sv = (p: Pt) => (landscape ? p : { x: p.y, y: p.x })

  return (
    <Stage bg={art.bgTomb} prompt={prompt} style={{ backgroundColor: '#2A1A2E', backgroundImage: 'none' }}>
      <div
        style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', containerType: 'size', touchAction: 'none' }}
        onPointerDown={(e) => {
          if (!box.current) return
          ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
          finger.current = toMaze(e)
          setMoved(true)
        }}
        onPointerMove={(e) => {
          if (finger.current && box.current) finger.current = toMaze(e)
        }}
        onPointerUp={() => (finger.current = null)}
        onPointerCancel={() => (finger.current = null)}
      >
        <div ref={box} style={{ position: 'relative', width: landscape ? `min(96cqw, calc(88cqh * ${W / H}))` : `min(94cqw, calc(86cqh * ${H / W}))`, aspectRatio: landscape ? `${W} / ${H}` : `${H} / ${W}` }}>
          <svg viewBox={view} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Tunnels: a dark edge, then the sandstone floor. */}
            <g strokeLinecap="round" strokeLinejoin="round" fill="none">
              {maze.edges.map(([a, c], i) => {
                const pa = sv(maze.nodes[a])
                const pc = sv(maze.nodes[c])
                return <line key={`o${i}`} x1={pa.x} y1={pa.y} x2={pc.x} y2={pc.y} stroke="#3A2230" strokeWidth={21} />
              })}
              {maze.edges.map(([a, c], i) => {
                const pa = sv(maze.nodes[a])
                const pc = sv(maze.nodes[c])
                return <line key={`f${i}`} x1={pa.x} y1={pa.y} x2={pc.x} y2={pc.y} stroke="#EBC28E" strokeWidth={16} />
              })}
              {maze.edges.map(([a, c], i) => {
                const pa = sv(maze.nodes[a])
                const pc = sv(maze.nodes[c])
                return <line key={`s${i}`} x1={pa.x} y1={pa.y} x2={pc.x} y2={pc.y} stroke="#F6D9AE" strokeWidth={5} strokeDasharray="1 9" />
              })}
            </g>
            {/* Wall paintings beside the tunnels. */}
            {maze.paintings.map((p, i) => {
              const q = sv(p.at)
              return (
                <g key={i} transform={`translate(${q.x} ${q.y})`}>
                  <rect x={-8} y={-8} width={16} height={16} rx={3} fill="#F4D6A8" stroke="#3A2230" strokeWidth={1.2} />
                  <text textAnchor="middle" dominantBaseline="central" fontSize={10}>
                    {p.icon}
                  </text>
                </g>
              )
            })}
            {/* The way in, and the door out (gold when it's open). */}
            {(() => {
              const s = sv(maze.nodes[maze.start])
              const x = sv(maze.nodes[maze.exit])
              return (
                <>
                  <circle cx={s.x} cy={s.y} r={6} fill="#C99A64" stroke="#3A2230" strokeWidth={1.2} />
                  <g transform={`translate(${x.x} ${x.y})`}>
                    <path d="M-9 10 V-2 A9 9 0 0 1 9 -2 V10 Z" fill={open ? '#FFC83D' : '#6B4A3A'} stroke="#3A2230" strokeWidth={1.6} />
                    <path d="M-5 10 V0 A5 5 0 0 1 5 0 V10 Z" fill={open ? '#FFF2B8' : '#3A2230'} />
                  </g>
                </>
              )
            })()}
          </svg>
          {/* Dead-end surprises. */}
          {maze.ends.map((end) => {
            const p = toBox(maze.nodes[end.at])
            return (
              <div key={end.at} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, translate: '-50% -50%', height: unit * 16, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                {end.kind === 'bat' ? <Buddy ref={(h) => void (bats.current[end.at] = h)} img={art.bat} height="100%" calm /> : <span style={{ fontSize: unit * 10 }}>✨</span>}
              </div>
            )
          })}
          {/* Scarabs to collect. */}
          {maze.scarabs.map((s, i) => {
            const p = toBox(s)
            return (
              <AnimatePresence key={i}>
                {!got.includes(i) && (
                  <motion.div exit={{ scale: 1.6, opacity: 0, y: -40 }} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, translate: '-50% -50%', height: unit * 13, pointerEvents: 'none' }}>
                    <Buddy img={art.scarab} height="100%" />
                  </motion.div>
                )}
              </AnimatePresence>
            )
          })}
          {/* Miu with her torch. */}
          <div style={{ position: 'absolute', left: `${b.x}%`, top: `${b.y}%`, translate: '-50% -78%', height: unit * 20, zIndex: 5, pointerEvents: 'none', display: 'flex', alignItems: 'flex-end' }}>
            <Miu ref={miu} height="100%" flip={facing < 0} torch />
          </div>
        </div>
      </div>
      {/* The dark, with light around Miu. Sparkles show through where the scarabs and the open door are. */}
      {rect.width > 0 && (
        <>
          <Torchlight at={`${rect.left + (b.x / 100) * rect.width}px ${rect.top + (b.y / 100) * rect.height}px`} radius={maze.light * unit} />
          {maze.scarabs.map((s, i) => {
            if (got.includes(i)) return null
            const p = toBox(s)
            return <Twinkle key={i} left={rect.left + (p.x / 100) * rect.width} top={rect.top + (p.y / 100) * rect.height} size={unit * 9} />
          })}
          {open && <Twinkle left={rect.left + (exit.x / 100) * rect.width} top={rect.top + (exit.y / 100) * rect.height} size={unit * 13} gold />}
          {first && !moved && (
            <motion.div animate={{ x: [0, 40, 0], y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ position: 'absolute', left: rect.left + (b.x / 100) * rect.width, top: rect.top + (b.y / 100) * rect.height + unit * 4, fontSize: Math.max(40, unit * 12), zIndex: 22, pointerEvents: 'none' }}>
              👆
            </motion.div>
          )}
        </>
      )}
      {maze.scarabs.length > 0 && (
        <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 26, display: 'flex', gap: 6, background: 'rgba(255,255,255,0.85)', borderRadius: 999, padding: '6px 12px', boxShadow: 'var(--shadow)' }}>
          {maze.scarabs.map((_, i) => (
            <img key={i} src={art.scarab} alt="" style={{ height: 'min(52px, 8vmin)', filter: i < got.length ? 'none' : 'grayscale(1) opacity(0.35)' }} />
          ))}
        </div>
      )}
    </Stage>
  )
}

/** A soft twinkle drawn over the dark, so she knows where to head. */
function Twinkle({ left, top, size, gold }: { left: number; top: number; size: number; gold?: boolean }) {
  return (
    <motion.div
      animate={{ scale: [0.7, 1.15, 0.7], opacity: [0.5, 1, 0.5], rotate: [0, 20, 0] }}
      transition={{ repeat: Infinity, duration: 1.6 }}
      style={{ position: 'absolute', left, top, translate: '-50% -50%', zIndex: 21, pointerEvents: 'none', fontSize: Math.max(22, size), filter: `drop-shadow(0 0 ${size / 2}px ${gold ? '#FFC83D' : '#9CF5D8'})` }}
    >
      {gold ? '🌟' : '✨'}
    </motion.div>
  )
}

/** The treasure room: tap the golden box and Tutu the mummy sits up, yawns and says hello. */
function Treasure({ onDone, setProgress }: ActivityProps) {
  const [awake, setAwake] = useState(false)
  const [maskGlow, setMaskGlow] = useState(false)
  const tutu = useRef<PuppetHandle>(null)
  const miu = useRef<PuppetHandle>(null)
  const busy = useRef(false)
  const alive = useAlive()
  const landscape = useLandscape()

  const wake = async () => {
    if (busy.current) return
    if (awake) {
      void tutu.current?.play('giggle')
      void say(pick(L.tickle.tutu))
      return
    }
    busy.current = true
    setAwake(true)
    sfx.pop()
    sounds.sparkle()
    await wait(700)
    if (!alive()) return
    void tutu.current?.play('yawn')
    await say(L.passage.tutu)
    if (!alive()) return
    void tutu.current?.play('wave')
    void miu.current?.play('cheer')
    await say(L.passage.nap)
    if (!alive()) return
    setProgress(4, 4)
    setMaskGlow(true)
    burst(0.5, 0.4)
    await say(L.passage.mask)
    if (!alive()) return
    void tutu.current?.play('dance')
    await wait(900)
    if (alive()) onDone()
  }

  const h = landscape ? 'min(50cqh, 34cqw)' : 'min(36cqh, 56cqw)'
  return (
    <Stage bg={art.bgTomb} prompt={awake ? undefined : L.passage.treasure}>
      <div style={{ position: 'absolute', inset: 0, containerType: 'size', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3cqw', paddingBottom: '4cqh' }}>
        <div style={{ height: `calc(${h} * 0.62)`, pointerEvents: 'none' }}>
          <Miu ref={miu} height="100%" torch />
        </div>
        {/* Tutu rises out of the box: she's drawn behind its front wall. */}
        <button aria-label="Golden box" onClick={() => void wake()} className={awake ? undefined : 'world-glow'} style={{ position: 'relative', height: h, aspectRatio: '1.25', borderRadius: 28 }}>
          <motion.div initial={false} animate={{ y: awake ? '-34%' : '8%' }} transition={{ type: 'spring', bounce: 0.35, duration: 0.9 }} style={{ position: 'absolute', left: '22%', right: '22%', bottom: '18%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
            <Tutu ref={tutu} height="100%" asleep={!awake} />
          </motion.div>
          <img src={art.sarcophagus} alt="" draggable={false} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '62%', objectFit: 'contain', objectPosition: 'bottom' }} />
        </button>
        <motion.img
          src={art.goldMask}
          alt=""
          animate={maskGlow ? { scale: [1, 1.12, 1], filter: ['drop-shadow(0 0 0px #FFE27A)', 'drop-shadow(0 0 22px #FFE27A)', 'drop-shadow(0 0 8px #FFE27A)'] } : {}}
          transition={{ duration: 1.2 }}
          onClick={() => !busy.current && (sounds.sparkle(), void say(L.passage.mask))}
          style={{ height: `calc(${h} * 0.55)`, cursor: 'pointer' }}
        />
      </div>
    </Stage>
  )
}

// The finale: a sunset party at the Sydney Opera House with every friend she helped. Each friend is a live character:
// tap one and they dance and say hello in their own voice. When everyone has danced: fireworks and a big group dance.
import { AnimatePresence, motion } from 'motion/react'
import { createRef, useEffect, useLayoutEffect, useMemo, useState, type ReactNode, type RefObject } from 'react'
import { bigCelebration, burst, say, sounds, SparklePuppet, useAlive, wait, type PuppetHandle } from '../../../../sdk'
import { sfx } from '../../../kit/sfx'
import { Stage } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { art } from '../art'
import { L } from '../lines'
import type { Guest } from '../Place'
import { Pip } from '../puppets/Pip'

const COLORS = ['#FF4F9A', '#FFC83D', '#B9A6F5', '#8FE3C8', '#A8DCFF']

/** One firework: sparks fly out from the middle and fade. */
function Firework({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  return (
    <motion.svg
      viewBox="-100 -100 200 200"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1, 1.15], opacity: [0, 1, 0] }}
      transition={{ duration: 1.5, delay, repeat: Infinity, repeatDelay: 0.8, times: [0, 0.35, 1] }}
      style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 'min(34vmin, 260px)', translate: '-50% -50%', pointerEvents: 'none', overflow: 'visible' }}
    >
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2
        return <line key={i} x1={Math.cos(a) * 30} y1={Math.sin(a) * 30} x2={Math.cos(a) * 88} y2={Math.sin(a) * 88} stroke={i % 2 ? color : '#fff'} strokeWidth={9} strokeLinecap="round" />
      })}
      <circle r="14" fill="#fff" />
    </motion.svg>
  )
}

// Where the promenade is in bg-opera-sunset (1536 x 1024, drawn `cover` and anchored to the bottom): everyone stands
// with their feet on the tiles between the railing and the bottom edge, whatever the screen shape.
const BG_W = 1536
const BG_H = 1024
const FLOOR_BACK = 872
const FLOOR_FRONT = 1008

interface Actor {
  key: string
  /** Width and height of the drawing relative to the height it is given. */
  box: [number, number]
  row: 'front' | 'back'
  node: (height: string) => ReactNode
  onTap: () => void
  glow: boolean
  label: string
}
interface Spot {
  x: number
  bottom: number
  h: number
  z: number
}

const BACK_SCALE = 0.88

/** Stands the party on the promenade in two rows (low friends in front, upright ones behind), as big as fits: each row
 *  fits across the screen, the back row stays under the prompt, and at least half of every back-row friend shows over
 *  the front row. */
function layOut(actors: Actor[], W: number, H: number, topClear: number): Spot[] {
  const s = Math.max(W / BG_W, H / BG_H)
  const frontY = (BG_H - FLOOR_FRONT) * s // feet, in px from the bottom of the screen
  const backY = (BG_H - FLOOR_BACK) * s
  const rows = (['back', 'front'] as const).map((r) => actors.map((a, i) => ({ a, i })).filter((p) => p.a.row === r))
  const [back, front] = rows
  const widest = (row: typeof back, k: number) => row.reduce((sum, p) => sum + p.a.box[0], 0) * k
  const tallest = (row: typeof back) => Math.max(0, ...row.map((p) => p.a.box[1]))
  let h = Math.min(320, H * 0.4, (W * 0.94) / Math.max(widest(back, BACK_SCALE), widest(front, 1)))
  if (back.length) h = Math.min(h, (H - topClear - backY) / (tallest(back) * BACK_SCALE))
  if (back.length && front.length) h = Math.min(h, (backY - frontY) / Math.max(0.01, tallest(front) - 0.5 * BACK_SCALE))

  // Spread a row across the screen with equal gaps, keeping the party order; returns each friend's center.
  const spread = (row: typeof back, k: number) => {
    const widths = row.map((p) => p.a.box[0] * h * k)
    const total = widths.reduce((a, b) => a + b, 0)
    const gap = Math.max(0, Math.min(h * 0.35, (W * 0.98 - total) / (row.length + 1)))
    let x = (W - total - gap * (row.length - 1)) / 2
    return widths.map((w) => ((x += w + gap), x - gap - w / 2))
  }
  const spots: Spot[] = []
  const backX = spread(back, BACK_SCALE)
  back.forEach((p, j) => (spots[p.i] = { x: backX[j], bottom: backY, h: h * BACK_SCALE, z: 1 }))
  // The front row stands in the back row's gaps (the middle one in front of the back row's middle friend), nudged
  // apart just enough that front friends don't cover each other, and kept on screen.
  let frontX = spread(front, 1)
  if (back.length > front.length && front.length > 1) {
    const at = (f: number) => backX[Math.floor(f)] + (backX[Math.ceil(f)] - backX[Math.floor(f)]) * (f - Math.floor(f))
    frontX = front.map((_, j) => at(0.5 + (j * (back.length - 2)) / (front.length - 1)))
    const half = (j: number) => (front[j].a.box[0] * h) / 2
    for (let j = 1; j < front.length; j++) frontX[j] = Math.max(frontX[j], frontX[j - 1] + (half(j - 1) + half(j)) * 0.92)
    const last = front.length - 1
    const shift = Math.min(0, W - half(last) - frontX[last]) + Math.max(0, half(0) - frontX[0])
    frontX = frontX.map((x) => x + shift)
  }
  front.forEach((p, j) => (spots[p.i] = { x: frontX[j], bottom: frontY, h, z: 2 }))
  return spots
}

/** A soft golden spotlight on the floor under a friend who hasn't danced yet: "tap me!" without a box around them. */
function Spotlight({ width }: { width: number }) {
  return (
    <motion.div
      animate={{ opacity: [0.55, 1, 0.55], scale: [0.92, 1.06, 0.92] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'absolute', left: '50%', bottom: 0, width: width * 1.05, height: width * 0.3, translate: '-50% 45%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,250,220,0.95), rgba(255,210,90,0.75) 45%, rgba(255,200,61,0) 100%)', pointerEvents: 'none' }}
    />
  )
}

/** Measures an element (a callback ref, so it works for an element that appears later). */
function useSize() {
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  return [setEl, size] as const
}

export function Party({ guests, onDone, setProgress }: { guests: Guest[]; onDone: () => void; setProgress: (done: number, total: number) => void }) {
  const [story, setStory] = useState(true)
  const [danced, setDanced] = useState<number[]>([])
  const [fireworks, setFireworks] = useState(false)
  const refs = useMemo(() => guests.map(() => createRef<PuppetHandle>()) as RefObject<PuppetHandle | null>[], [guests])
  const pip = useMemo(() => createRef<PuppetHandle>(), [])
  const sparkle = useMemo(() => createRef<PuppetHandle>(), [])
  const alive = useAlive()
  const [box, size] = useSize()

  useEffect(() => setProgress(danced.length, guests.length), [danced.length, guests.length, setProgress])

  // Everyone dances together while the fireworks go.
  useEffect(() => {
    if (!fireworks) return
    const all = [sparkle, pip, ...refs]
    const go = () => all.forEach((r, i) => setTimeout(() => void r.current?.play(i % 2 ? 'dance' : 'cheer'), i * 120))
    go()
    const id = setInterval(go, 2300)
    return () => clearInterval(id)
  }, [fireworks, refs, pip, sparkle])

  const dance = async (i: number) => {
    if (fireworks) return
    sounds.note(i * 2)
    void refs[i].current?.play('dance')
    void say(guests[i].line)
    if (danced.includes(i)) return
    const next = [...danced, i]
    setDanced(next)
    if (next.length < guests.length) return
    await wait(2400)
    if (!alive()) return
    setFireworks(true)
    sounds.fanfare()
    for (let k = 0; k < 6; k++) setTimeout(() => (burst(0.15 + Math.random() * 0.7, 0.15 + Math.random() * 0.25), sfx.pop()), k * 380)
    await say(L.party.fireworks)
    if (!alive()) return
    bigCelebration(1500)
    await say(L.party.thanks)
    await wait(600)
    if (alive()) onDone()
  }

  const actors: Actor[] = [
    { key: 'sparkle', box: [0.87, 1], row: 'back', label: 'Sparkle', glow: false, node: (h) => <SparklePuppet ref={sparkle} height={h} />, onTap: () => (sounds.pop(), void sparkle.current?.play('dance')) },
    { key: 'pip', box: [0.83, 1], row: 'back', label: 'Pip', glow: false, node: (h) => <Pip ref={pip} height={h} />, onTap: () => (sounds.pop(), void pip.current?.play('cheer')) },
    ...guests.map((g, i) => ({ key: g.name, box: g.box, row: g.row, label: g.name, glow: !danced.includes(i) && !fireworks, node: (h: string) => g.render(refs[i], h), onTap: () => void dance(i) })),
  ]
  // Keep the prompt bubble clear: it sits under the top bar.
  const topClear = Math.min(size.h * 0.3, (size.w > size.h ? 96 : 150) + size.h * 0.06)
  const spots = size.w ? layOut(actors, size.w, size.h, topClear) : []

  if (story) return <StoryBeat lines={[L.party.story]} friend={<Pip height="100%" />} bg={art.bgOpera} onDone={() => setStory(false)} />

  return (
    <Stage bg={art.bgOpera} prompt={fireworks ? undefined : L.party.tap} style={{ backgroundPosition: 'center bottom' }}>
      <AnimatePresence>
        {fireworks && (
          <motion.div key="sky" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
            {[
              [16, 18],
              [42, 10],
              [66, 20],
              [86, 12],
              [30, 30],
              [74, 34],
            ].map(([x, y], i) => (
              <Firework key={i} x={x} y={y} color={COLORS[i % COLORS.length]} delay={i * 0.35} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {/* The whole screen (not just the play area under the prompt), so positions line up with the background. */}
      <div ref={box} style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        {spots.length > 0 &&
          actors.map((a, i) => {
            const spot = spots[i]
            const w = a.box[0] * spot.h
            return (
              <motion.button
                key={a.key}
                aria-label={a.label}
                onClick={a.onTap}
                whileTap={{ scale: 0.94 }}
                style={{ position: 'absolute', left: spot.x - w / 2, bottom: spot.bottom, width: w, height: a.box[1] * spot.h, zIndex: spot.z, pointerEvents: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0, background: 'none', transformOrigin: '50% 100%' }}
              >
                <AnimatePresence>{a.glow && <motion.div key="glow" exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0 }}><Spotlight width={w} /></motion.div>}</AnimatePresence>
                <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' }}>{a.node(`${spot.h}px`)}</div>
              </motion.button>
            )
          })}
      </div>
    </Stage>
  )
}

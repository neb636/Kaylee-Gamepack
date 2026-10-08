// The payoff: night on the lagoon, same side-view camera as the canal. She taps the sky and fireworks bloom, mirrored
// in the water below. Then Gino plays his accordion (tap it to squeeze) and gives it to Lupa's band.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { bigCelebration, Buddy, say, SparklePuppet, sounds, useAlive, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { art } from '../../art'
import { L } from '../../lines'
import { FinishButton, PromptRow, useCover } from '../scene'
import { fx, NOTE } from '../synth'

const V = L.venice
const FIRE = ['#FF7FB0', '#FFD04A', '#7DE0B0', '#C9A8FF', '#FF6B6B', '#8FD8FF']
const NEEDED = 4

export function Lagoon({ onStep, onDone }: { onStep: () => void; onDone: () => void }) {
  const { box, W, H, bw, bh, ox, oy, landscape } = useCover(1)
  const alive = useAlive()
  const gino = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const [prompt, setPrompt] = useState<{ text: Line; speak: boolean } | null>(null)
  const [blooms, setBlooms] = useState<{ id: number; x: number; y: number; color: string }[]>([])
  const [phase, setPhase] = useState<'sky' | 'accordion' | 'end'>('sky')
  const [squeeze, setSqueeze] = useState(0)
  const count = useRef(0)
  const waterY = oy + bh * 0.62

  useEffect(() => {
    void (async () => {
      await say(V.night)
      if (!alive()) return
      setPrompt({ text: V.tapSky, speak: true })
    })()
  }, [])

  const tapSky = async (e: React.PointerEvent) => {
    if (phase !== 'sky') return
    const y = Math.min(e.clientY, waterY - 60)
    const id = Date.now() + Math.random()
    setBlooms((b) => [...b.slice(-6), { id, x: e.clientX, y, color: FIRE[count.current % FIRE.length] }])
    fx.firework()
    setPrompt(null)
    const n = ++count.current
    if (n === 2) void say(V.reflect)
    if (n !== NEEDED) return
    onStep()
    await wait(1600)
    if (!alive()) return
    // A big finale of fireworks by themselves.
    for (let i = 0; i < 5; i++) {
      setBlooms((b) => [...b.slice(-6), { id: Date.now() + i, x: W * (0.2 + Math.random() * 0.6), y: Math.max(140, waterY * (0.25 + Math.random() * 0.4)), color: FIRE[i % FIRE.length] }])
      fx.firework()
      await wait(380)
    }
    if (!alive()) return
    setPhase('accordion')
    void gino.current?.play('cheer')
    await say(V.accordion)
    if (!alive()) return
    setPrompt({ text: V.tapAccordion, speak: true })
  }

  const play = async () => {
    if (phase !== 'accordion') return
    const n = squeeze + 1
    setSqueeze(n)
    setPrompt(null)
    fx.accordion([NOTE.C4, NOTE.F4, NOTE.G4, NOTE.C5][(n - 1) % 4])
    void gino.current?.play('dance')
    void sparkle.current?.play('dance')
    if (n < 3) return
    setPhase('end')
    onStep()
    await wait(600)
    if (!alive()) return
    await say(V.band)
    if (!alive()) return
    bigCelebration()
    sounds.fanfare()
  }

  const gh = Math.min(H * 0.28, W * 0.26, 240)
  return (
    <div ref={box} onPointerDown={(e) => void tapSky(e)} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#2A2458' }}>
      {W > 0 && <div style={{ position: 'absolute', left: ox, top: oy, width: bw, height: bh, background: `url(${landscape ? art.bgVeniceNight : art.bgVeniceNightTall}) center / 100% 100%` }} />}
      {/* Fireworks and their reflections in the water. */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        {blooms.map((b) => (
          <div key={b.id}>
            <Bloom x={b.x} y={b.y} color={b.color} />
            <div style={{ position: 'absolute', inset: 0, transform: `translateY(${2 * waterY}px) scaleY(-1)`, transformOrigin: '0 0', opacity: 0.35 }}>
              <Bloom x={b.x} y={b.y} color={b.color} />
            </div>
          </div>
        ))}
      </div>
      {/* Gino and Sparkle on the water's edge. */}
      <div style={{ position: 'absolute', left: landscape ? '6%' : '4%', bottom: 'calc(var(--safe-bottom) + 12px)', zIndex: 4, display: 'flex', alignItems: 'flex-end', gap: 8, pointerEvents: 'none' }}>
        <SparklePuppet ref={sparkle} height={`${gh}px`} lookToward={0.5} />
        <Buddy ref={gino} img={art.gino} voice="gino" height={`${gh}px`} />
      </div>
      <AnimatePresence>
        {phase !== 'sky' && (
          <motion.button
            aria-label="Accordion"
            className={phase === 'accordion' ? 'world-glow' : undefined}
            initial={{ scale: 0, y: 60 }}
            animate={{ scale: 1, y: 0 }}
            onClick={() => void play()}
            style={{ position: 'absolute', right: landscape ? '10%' : '8%', bottom: 'calc(var(--safe-bottom) + 30px)', width: Math.max(120, gh * 0.85), height: Math.max(120, gh * 0.85), borderRadius: 30, background: 'rgba(255,247,240,.2)', border: 'none', padding: 0, zIndex: 6 }}
          >
            <motion.img key={squeeze} src={art.accordion} alt="" draggable={false} animate={squeeze ? { scaleX: [1, 0.72, 1.12, 1] } : {}} transition={{ duration: 0.8 }} style={{ width: '100%', height: '100%', display: 'block' }} />
          </motion.button>
        )}
      </AnimatePresence>
      <FinishButton show={phase === 'end'} onDone={onDone}>
        🛶 ⭐
      </FinishButton>
      <PromptRow prompt={prompt} H={H} landscape={landscape} />
    </div>
  )
}

/** One firework: a ring of sparks that flies out and fades. */
function Bloom({ x, y, color }: { x: number; y: number; color: string }) {
  const n = 14
  const r = 90
  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(a) * r, y: Math.sin(a) * r + 30, opacity: 0, scale: 0.4 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            style={{ position: 'absolute', width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}` }}
          />
        )
      })}
      <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', width: 40, height: 40, marginLeft: -20, marginTop: -20, borderRadius: '50%', background: '#fff' }} />
    </div>
  )
}

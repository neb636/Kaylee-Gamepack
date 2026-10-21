// Mango sticky rice with Aunt Jum in the kitchen (khao niao mamuang, the family's favorite). Four steps on the counter,
// each with her finger on the real thing: tap the bamboo steamer basket and sticky rice hops onto the plate; swipe down
// through the mango to slice it (or tap it); hold the jug to pour coconut milk over the rice; tap the little bowl to
// sprinkle crunchy mung beans. The plate fills up as she goes, and at the end Jum is proud of it and they can make
// another. Straight-on side view, like the rest of the house's flat drawings: everything stands on the counter line.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { burst, sounds, type PuppetHandle } from '../../../../../../sdk'
import { sfx } from '../../../sfx'
import { TEXT, VOICED } from './lines'
import { JumPuppet } from './puppets'
import { Room, RoundButton, useBubble } from './Room'

export const STEPS = ['rice', 'mango', 'sauce', 'sprinkle', 'done'] as const
export type Step = (typeof STEPS)[number]
const SCOOPS = 4
const CUTS = 4
const SHAKES = 4

const INK = '#2B2330'
const S = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
/** The counter top (ground line), the plate's middle, the mango on its board. */
const TOP = 360
const PX = 300
const MANGO = { x0: 420, x1: 560, y0: 290, y1: 345 }

export function StickyRice({ onClose, start, onStep }: { onClose(): void; start?: Step; onStep(s: Step): void }) {
  const jum = useRef<PuppetHandle>(null)
  const { text, talk } = useBubble()
  const begin = start ?? 'rice'
  const before = (s: Step) => STEPS.indexOf(begin) > STEPS.indexOf(s)
  const [step, setStep] = useState<Step>(begin)
  const [scoops, setScoops] = useState(before('rice') ? SCOOPS : 0)
  const [cuts, setCuts] = useState<number[]>(before('mango') ? [450, 480, 510, 540] : [])
  const [sauce, setSauce] = useState(before('sauce') ? 1 : 0)
  const [beans, setBeans] = useState(before('sprinkle') ? SHAKES : 0)
  const [pouring, setPouring] = useState(false)
  const [flying, setFlying] = useState(0)
  const [trail, setTrail] = useState<[number, number][]>([])
  const [idle, setIdle] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const count = useRef({ scoops: before('rice') ? SCOOPS : 0, sauce: before('sauce') ? 1 : 0, beans: before('sprinkle') ? SHAKES : 0 })
  const swipe = useRef<{ minY: number; maxY: number; xs: number[] } | null>(null)

  useEffect(() => {
    talk(VOICED.jumHungry)
    void jum.current?.play('hop')
  }, [])
  // Each new step: say what to do (shown), and tell the address bar.
  useEffect(() => {
    onStep(step)
    if (step === 'done') {
      sounds.fanfare()
      burst()
      void jum.current?.play('cheer')
      setTimeout(() => talk(VOICED.jumPretty), 500)
      return
    }
    const t = setTimeout(() => talk({ show: TEXT.rice[step] }), step === begin ? 2600 : 600)
    return () => clearTimeout(t)
  }, [step])
  // Nothing touched for a while: the thing to use pulses.
  useEffect(() => {
    setIdle(false)
    const t = setTimeout(() => setIdle(true), 7000)
    return () => clearTimeout(t)
  }, [step, scoops, cuts.length, beans, pouring])

  const next = (s: Step) => {
    sounds.correct()
    void jum.current?.play('nod')
    setTimeout(() => setStep(s), 700)
  }

  // ---- Rice: tap the basket
  const scoop = () => {
    if (step !== 'rice' || count.current.scoops >= SCOOPS) return
    const n = ++count.current.scoops
    sfx.scoop()
    setFlying((f) => f + 1)
    setTimeout(() => {
      sfx.puff()
      setScoops(n)
      if (n === SCOOPS) next('mango')
    }, 420)
    if (n === 1) setTimeout(() => talk({ show: TEXT.rice.fact }), 900)
  }

  // ---- Mango: swipe down through it (a tap cuts too)
  const local = (e: RPointerEvent) => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return [0, 0] as [number, number]
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return [p.x, p.y] as [number, number]
  }
  const cutAt = (x: number) => {
    if (step !== 'mango' || cuts.length >= CUTS) return
    // Not on top of an old cut: go to the nearest free place.
    const free = [450, 480, 510, 540].filter((c) => !cuts.includes(c))
    const at = free.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a))
    sfx.crunch()
    void jum.current?.play('giggle')
    const n = [...cuts, at]
    setCuts(n)
    if (n.length === CUTS) next('sauce')
  }
  const down = (e: RPointerEvent) => {
    if (step !== 'mango') return
    const [x, y] = local(e)
    swipe.current = { minY: y, maxY: y, xs: [x] }
    setTrail([[x, y]])
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }
  const move = (e: RPointerEvent) => {
    const s = swipe.current
    if (!s) return
    const [x, y] = local(e)
    s.minY = Math.min(s.minY, y)
    s.maxY = Math.max(s.maxY, y)
    if (x > MANGO.x0 && x < MANGO.x1) s.xs.push(x)
    setTrail((t) => [...t.slice(-14), [x, y]])
    // Down through the whole mango: that's a cut (then a new swipe can start without lifting).
    if (s.minY < MANGO.y0 + 12 && s.maxY > MANGO.y1 - 8 && s.xs.length) {
      cutAt(s.xs.reduce((a, b) => a + b, 0) / s.xs.length)
      swipe.current = { minY: y, maxY: y, xs: [] }
    }
  }
  const up = (e: RPointerEvent) => {
    const s = swipe.current
    swipe.current = null
    setTimeout(() => setTrail([]), 150)
    if (!s) return
    const [x, y] = local(e)
    // A tap on the mango cuts it too.
    if (s.maxY - s.minY < 12 && x > MANGO.x0 && x < MANGO.x1 && y > MANGO.y0 - 20 && y < MANGO.y1 + 10) cutAt(x)
  }

  // ---- Sauce: hold the jug
  useEffect(() => {
    if (!pouring || step !== 'sauce') return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      // Real time (a slow frame still pours its share), never backwards.
      const dt = Math.max(0, Math.min(0.25, (now - last) / 1000))
      last = now
      const v = Math.min(1, count.current.sauce + dt / 2.4)
      count.current.sauce = v
      setSauce(v)
      if (v >= 1) {
        setPouring(false)
        next('sprinkle')
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const glug = setInterval(() => sfx.paddle(), 380)
    // The jug tips away from under her finger, so letting go anywhere stops the pour.
    const stop = () => setPouring(false)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
      cancelAnimationFrame(raf)
      clearInterval(glug)
    }
  }, [pouring, step])

  // ---- Sprinkle: tap the bowl
  const shake = () => {
    if (step !== 'sprinkle' || count.current.beans >= SHAKES) return
    const n = ++count.current.beans
    sfx.rattle()
    setBeans(n)
    if (n === SHAKES) next('done')
  }

  const again = () => {
    sounds.whoosh()
    count.current = { scoops: 0, sauce: 0, beans: 0 }
    setScoops(0)
    setCuts([])
    setSauce(0)
    setBeans(0)
    setStep('rice')
  }

  const dome = 30 + 16 * scoops
  const slices = step === 'mango' ? 0 : cuts.length
  const pulse = (on: boolean) => (on && idle ? { scale: [1, 1.08, 1] } : { scale: 1 })

  return (
    <Room name="Aunt Jum" wall="#E3F6EE" floor="#CFE6DB" bubble={text} onClose={onClose} host={
      <button aria-label="Aunt Jum" onClick={() => { sounds.pop(); void jum.current?.play('giggle') }} style={{ width: '100%', height: '100%', background: 'none', border: 'none', padding: 0 }}>
        <JumPuppet ref={jum} height="100%" />
      </button>
    }>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <svg ref={svgRef} viewBox="20 150 560 290" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', flex: 1, minHeight: 0, touchAction: 'none' }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          {/* The kitchen counter */}
          <rect x={-200} y={TOP} width={1000} height={200} fill="#C99A6E" />
          <rect x={-200} y={TOP - 8} width={1000} height={16} fill="#E8C49A" stroke={INK} strokeWidth={5} />

          {/* The plate, then what's on it, from the bottom up */}
          <path d={`M${PX - 120} ${TOP - 16} L${PX + 120} ${TOP - 16} Q${PX + 106} ${TOP - 2} ${PX + 80} ${TOP - 2} L${PX - 80} ${TOP - 2} Q${PX - 106} ${TOP - 2} ${PX - 120} ${TOP - 16}Z`} fill="#FFFDF8" {...S} />
          {scoops > 0 && (
            <motion.path initial={false} animate={{ d: `M${PX - dome * 1.5} ${TOP - 16} Q${PX - dome * 1.5} ${TOP - 16 - dome * 1.05} ${PX} ${TOP - 16 - dome * 1.1} Q${PX + dome * 1.5} ${TOP - 16 - dome * 1.05} ${PX + dome * 1.5} ${TOP - 16}Z` }} transition={{ type: 'spring', stiffness: 300, damping: 12 }} fill="#FFFFFF" {...S} />
          )}
          {scoops > 0 && [...Array(scoops * 3)].map((_, i) => <circle key={i} cx={PX - dome * 1.1 + ((i * 37) % (dome * 2.2))} cy={TOP - 26 - ((i * 23) % Math.max(10, dome * 0.7))} r={3} fill="#E8E2D6" />)}
          {/* Coconut milk over the top of the rice */}
          {sauce > 0 && scoops > 0 && (
            <path d={`M${PX - dome * 1.3 * sauce} ${TOP - 16 - dome * (1.1 - 0.5 * sauce)} Q${PX} ${TOP - 16 - dome * 1.22} ${PX + dome * 1.3 * sauce} ${TOP - 16 - dome * (1.1 - 0.5 * sauce)} Q${PX + dome * 0.6} ${TOP - 6 - dome * (1 - 0.6 * sauce)} ${PX + dome * 0.4 * sauce} ${TOP - 16 - dome * 0.7} Q${PX} ${TOP - 8 - dome * (1 - 0.7 * sauce)} ${PX - dome * 0.5 * sauce} ${TOP - 16 - dome * 0.72} Q${PX - dome * 0.7} ${TOP - 6 - dome * (1 - 0.6 * sauce)} ${PX - dome * 1.3 * sauce} ${TOP - 16 - dome * (1.1 - 0.5 * sauce)}Z`} fill="#FFF7E3" stroke="#E8D9B0" strokeWidth={3} />
          )}
          {/* Mango slices leaning on the rice */}
          {[...Array(slices)].map((_, i) => (
            <motion.g key={i} initial={{ x: 220, y: -60, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }} transition={{ delay: i * 0.12, type: 'spring', stiffness: 220, damping: 16 }}>
              <path d={`M${PX + 28 + i * 22} ${TOP - 16} Q${PX + 40 + i * 22} ${TOP - 90} ${PX + 78 + i * 22} ${TOP - 70} Q${PX + 64 + i * 22} ${TOP - 40} ${PX + 56 + i * 22} ${TOP - 16}Z`} fill="#FFC23A" {...S} strokeWidth={4} />
            </motion.g>
          ))}
          {/* Crunchy mung beans on top */}
          {[...Array(beans * 6)].map((_, i) => (
            <motion.circle key={i} cy={TOP - 22 - dome * (0.75 + 0.3 * Math.sin(i * 1.7)) * (Math.abs(((i * 29) % 80) - 40) < 30 ? 1 : 0.6)} initial={{ y: -160, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} cx={PX - 40 + ((i * 29) % 80)} r={4.5} fill="#F2C94C" stroke={INK} strokeWidth={2} />
          ))}

          {/* Rice: the bamboo steamer basket (huad), steaming */}
          <AnimatePresence>
            {step === 'rice' && (
              <motion.g key="basket" exit={{ x: -260 }} style={{ cursor: 'pointer' }} onClick={scoop} animate={pulse(true)}>
                <rect x={50} y={TOP - 150} width={150} height={150} fill="transparent" />
                <path d={`M70 ${TOP - 140} L180 ${TOP - 140} L140 ${TOP - 8} L110 ${TOP - 8}Z`} fill="#E3B66B" {...S} />
                {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${76 + i * 4} ${TOP - 120 + i * 24} L${174 - i * 4} ${TOP - 120 + i * 24}`} stroke="#B9873E" strokeWidth={4} />)}
                <ellipse cx={125} cy={TOP - 142} rx={58} ry={12} fill="#FFFFFF" {...S} />
                {[0, 1, 2].map((i) => (
                  <motion.circle key={i} cx={105 + i * 20} cy={TOP - 150} r={9} fill="rgba(255,255,255,.8)" animate={{ y: [0, -60], opacity: [0.8, 0] }} transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.5 }} />
                ))}
              </motion.g>
            )}
          </AnimatePresence>
          {/* A ball of rice on its way to the plate */}
          {flying > 0 && step === 'rice' && (
            <motion.circle key={flying} cx={125} cy={TOP - 150} r={16} fill="#fff" stroke={INK} strokeWidth={4} initial={{ x: 0, y: 0 }} animate={{ x: [0, 85, PX - 125], y: [0, -80, 110] }} transition={{ duration: 0.42 }} />
          )}

          {/* Mango on its cutting board */}
          <AnimatePresence>
            {(step === 'rice' || step === 'mango') && (
              <motion.g key="mango" exit={{ x: 260 }}>
                <rect x={MANGO.x0 - 20} y={TOP - 18} width={MANGO.x1 - MANGO.x0 + 40} height={14} rx={6} fill="#D9A766" {...S} />
                <motion.path animate={pulse(step === 'mango' && cuts.length === 0)} d={`M${MANGO.x0} ${(MANGO.y0 + MANGO.y1) / 2 + 10} C${MANGO.x0} ${MANGO.y0 - 14} ${MANGO.x1 - 20} ${MANGO.y0 - 20} ${MANGO.x1} ${MANGO.y0 + 22} C${MANGO.x1 + 8} ${MANGO.y1 + 6} ${MANGO.x0 + 10} ${MANGO.y1 + 10} ${MANGO.x0} ${(MANGO.y0 + MANGO.y1) / 2 + 10}Z`} fill="#FFB52E" {...S} />
                <path d={`M${MANGO.x1 - 6} ${MANGO.y0 + 16} q10 -14 4 -26`} stroke="#5E8C3A" strokeWidth={6} fill="none" strokeLinecap="round" />
                {cuts.map((c) => <path key={c} d={`M${c} ${MANGO.y0 - 4} L${c} ${MANGO.y1 + 2}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
                {/* Where to cut next (dashed), once she's here */}
                {step === 'mango' && cuts.length < CUTS && (
                  <motion.path d={`M${[450, 480, 510, 540].find((c) => !cuts.includes(c))} ${MANGO.y0 - 30} l0 ${MANGO.y1 - MANGO.y0 + 50}`} stroke="#FF5FA2" strokeWidth={5} strokeDasharray="8 10" animate={{ opacity: [0.2, 0.9, 0.2] }} transition={{ repeat: Infinity, duration: 1.2 }} />
                )}
              </motion.g>
            )}
          </AnimatePresence>
          {trail.length > 1 && <path d={`M${trail.map((p) => p.join(' ')).join(' L')}`} stroke="rgba(255,255,255,.95)" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Coconut milk jug: press and hold to pour */}
          <AnimatePresence>
            {step === 'sauce' && (
              <motion.g key="jug" initial={{ x: 260 }} animate={{ x: 0 }} exit={{ x: 260 }}>
                <motion.g
                  animate={{ rotate: pouring ? -62 : 0, x: pouring ? -70 : 0, y: pouring ? -90 : 0 }}
                  transition={{ type: 'spring', stiffness: 160, damping: 14 }}
                  style={{ originX: '470px', originY: `${TOP - 60}px`, cursor: 'pointer' }}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    setPouring(true)
                    sounds.pickup()
                  }}
                >
                  <rect x={400} y={TOP - 170} width={150} height={170} fill="transparent" />
                  <path d={`M430 ${TOP - 120} L420 ${TOP - 140} L470 ${TOP - 130} L510 ${TOP - 130} L512 ${TOP - 8} L436 ${TOP - 8}Z`} fill="#E8F4FF" {...S} />
                  <path d={`M440 ${TOP - 90} L508 ${TOP - 90} L510 ${TOP - 8} L438 ${TOP - 8}Z`} fill="#FFF7E3" />
                  <path d={`M512 ${TOP - 110} q36 10 2 60`} {...S} fill="none" strokeWidth={8} />
                </motion.g>
                {pouring && (
                  <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d={`M${PX + 60} ${TOP - 200} Q${PX + 30} ${TOP - 150} ${PX + 10} ${TOP - 30 - dome}`} stroke="#FFF7E3" strokeWidth={12} strokeLinecap="round" fill="none" />
                )}
                {/* How full: a little cup gauge Dad can see */}
                <rect x={560} y={TOP - 150} width={18} height={130} rx={9} fill="#fff" {...S} strokeWidth={3} />
                <rect x={563} y={TOP - 23 - 124 * sauce} width={12} height={124 * sauce} rx={6} fill="#FFE7A8" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Toasted mung beans in a little bowl */}
          <AnimatePresence>
            {step === 'sprinkle' && (
              <motion.g key="bowl" initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}>
                <motion.g key={beans} animate={beans ? { rotate: [0, -30, 0], ...pulse(true) } : pulse(true)} transition={{ duration: 0.45 }} style={{ originX: '120px', originY: `${TOP - 30}px`, cursor: 'pointer' }} onClick={shake}>
                  <rect x={50} y={TOP - 110} width={140} height={110} fill="transparent" />
                  <path d={`M70 ${TOP - 60} Q70 ${TOP - 4} 120 ${TOP - 4} Q170 ${TOP - 4} 170 ${TOP - 60}Z`} fill="#8FD0F0" {...S} />
                  {[...Array(7)].map((_, i) => <circle key={i} cx={84 + i * 12} cy={TOP - 64 - (i % 2) * 6} r={6} fill="#F2C94C" stroke={INK} strokeWidth={2} />)}
                </motion.g>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
        <div style={{ minHeight: 'var(--target)', display: 'flex', gap: 16 }}>
          {step === 'done' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6, type: 'spring' }}>
              <RoundButton label="Make another" icon="🔁" color="var(--mint)" onClick={again} pulse />
            </motion.div>
          )}
        </div>
      </div>
    </Room>
  )
}

// The hot beach in Sicily, one straight-on side-view camera: friends standing on the sand, a little granita stand in
// front. For each friend: tap the snow to scoop it into a cup, press and hold the lemon to squeeze it, then tap the
// granita to give it away. Lupa and Nonna Tina get one scoop; Mona the monk seal wants two (a little harder at the end).
// Payoff: brain freeze giggles, and Nino brings the piano (tap its keys) to Lupa's band.
import { AnimatePresence, motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { bigCelebration, Buddy, burst, say, sounds, useAlive, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'
import { Lupa } from '../../puppets/Lupa'
import { FinishButton, PromptRow, useCover } from '../scene'
import { fx, NOTE } from '../synth'

const E = L.etna
type Who = 'lupa' | 'tortoise' | 'mona'
const ORDER: { who: Who; scoops: number }[] = [
  { who: 'lupa', scoops: 1 },
  { who: 'tortoise', scoops: 1 },
  { who: 'mona', scoops: 2 },
]
const KEYS = [NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5]
const KEY_COLORS = ['#FF8FB8', '#FFC83D', '#8FE3C8', '#A8DCFF', '#D9CCFF']
const HOLD_MS = 1300

export function Beach({ onStep, onDone }: { onStep: () => void; onDone: () => void }) {
  const { box, W, H, bw, bh, ox, oy, landscape } = useCover(1)
  const alive = useAlive()
  const refs = { lupa: useRef<PuppetHandle>(null), tortoise: useRef<PuppetHandle>(null), mona: useRef<PuppetHandle>(null), nino: useRef<PuppetHandle>(null) }
  const [prompt, setPrompt] = useState<{ text: Line; speak: boolean } | null>(null)
  const [turn, setTurn] = useState(0)
  const [step, setStep] = useState<'intro' | 'scoop' | 'squeeze' | 'serve' | 'flying' | 'piano' | 'end'>('intro')
  const [scoops, setScoops] = useState(0)
  const [served, setServed] = useState<Who[]>([])
  const [flyTo, setFlyTo] = useState<Who | null>(null)
  const juice = useMotionValue(0)
  const lemonScale = useTransform(juice, [0, 1], [1, 0.72])
  const lemonColor = useTransform(juice, [0, 1], ['#E6F2FF', '#FFE27A'])
  const [keysHit, setKeysHit] = useState<number[]>([])
  const [pressed, setPressed] = useState<number | null>(null)

  useEffect(() => {
    void (async () => {
      await wait(300)
      if (!alive()) return
      void refs.lupa.current?.play('shake')
      await say(E.melting)
      if (!alive()) return
      setStep('scoop')
      setPrompt({ text: E.scoop, speak: true })
    })()
  }, [])

  const order = ORDER[turn]

  const scoop = async () => {
    if (step !== 'scoop') return
    const n = scoops + 1
    setScoops(n)
    fx.scrunch()
    sounds.place()
    setPrompt(null)
    if (n < order.scoops) return void say(E.scoopMore)
    await wait(400)
    if (!alive()) return
    setStep('squeeze')
    setPrompt({ text: E.squeeze, speak: true })
  }

  // Press and hold the lemon.
  const holding = useRef<{ start: number; raf: number } | null>(null)
  const squeezeDown = (e: RPointerEvent) => {
    if (step !== 'squeeze' || holding.current) return
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    fx.squish()
    setPrompt(null)
    const start = performance.now() - juice.get() * HOLD_MS
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / HOLD_MS)
      juice.set(t)
      if (t >= 1) {
        holding.current = null
        void squeezed()
        return
      }
      if (holding.current) holding.current.raf = requestAnimationFrame(tick)
    }
    holding.current = { start, raf: requestAnimationFrame(tick) }
  }
  const squeezeUp = () => {
    const h = holding.current
    if (!h) return
    cancelAnimationFrame(h.raf)
    holding.current = null
    if (juice.get() < 1) void say(E.squeezeMore)
  }
  const squeezed = async () => {
    fx.squish()
    sounds.sparkle()
    setStep('serve')
    if (turn === 0) {
      await say(E.sicily)
      if (!alive()) return
    }
    setPrompt({ text: E.serve, speak: true })
  }

  const serve = async () => {
    if (step !== 'serve') return
    const who = order.who
    setStep('flying')
    setPrompt(null)
    setFlyTo(who)
    sounds.whoosh()
    await wait(700)
    if (!alive()) return
    setServed((s) => [...s, who])
    setFlyTo(null)
    onStep()
    sounds.correct()
    burst()
    void refs[who].current?.play(who === 'lupa' ? 'cheer' : 'jump')
    await say(E.yum[turn])
    if (!alive()) return
    if (turn === 0) {
      void refs.lupa.current?.play('shake')
      await say(E.freeze)
      if (!alive()) return
      await say(E.long1)
      if (!alive()) return
      await say(E.long2)
      if (!alive()) return
    }
    if (turn === 1) {
      void refs.mona.current?.play('wiggle')
      await say(E.monaHello)
      if (!alive()) return
    }
    juice.set(0)
    setScoops(0)
    if (turn < ORDER.length - 1) {
      const next = turn + 1
      setTurn(next)
      setStep('scoop')
      setPrompt({ text: ORDER[next].scoops === 2 ? E.scoopTwo : E.scoop, speak: true })
      return
    }
    await say(E.weather)
    if (!alive()) return
    setStep('piano')
    void refs.nino.current?.play('cheer')
    await say(E.piano)
    if (!alive()) return
    await say(E.pianoFact)
    if (!alive()) return
    setPrompt({ text: E.tapPiano, speak: true })
  }

  const key = async (i: number) => {
    if (step !== 'piano' && step !== 'end') return
    fx.key(KEYS[i])
    setPressed(i)
    setTimeout(() => setPressed((p) => (p === i ? null : p)), 180)
    void refs.nino.current?.play('nod')
    if (step !== 'piano' || keysHit.includes(i)) return
    const hit = [...keysHit, i]
    setKeysHit(hit)
    setPrompt(null)
    if (hit.length < KEYS.length) return
    setStep('end')
    onStep()
    await wait(400)
    for (const [k, f] of KEYS.entries()) {
      if (!alive()) return
      fx.key(f)
      setPressed(k)
      await wait(180)
    }
    setPressed(null)
    for (const r of Object.values(refs)) void r.current?.play('cheer')
    await say(E.band)
    if (!alive()) return
    bigCelebration()
    sounds.fanfare()
  }

  // Layout (picture px): friends stand on the sand; the stand (snow, cup, lemon) sits in front, low and centered.
  // Friends stand on the sand behind the stand (the stand's cards sit in front of their feet).
  const sandY = bh * (landscape ? 0.75 : 0.77)
  const fh = Math.min(bh * (landscape ? 0.28 : 0.15), W * 0.26, 250)
  const vx = (f: number) => -ox + W * f
  const spots: Record<Who, number> = landscape ? { lupa: vx(0.3), tortoise: vx(0.52), mona: vx(0.74) } : { lupa: vx(0.33), tortoise: vx(0.57), mona: vx(0.81) }
  const ninoX = landscape ? vx(0.1) : vx(0.1)
  const item = Math.max(96, Math.min(150, Math.min(W, H) * 0.16))
  const standY = H - item * 1.25 - 16
  const cupX = W * 0.5
  const snowX = W * 0.5 - item * 1.6
  const lemonX = W * 0.5 + item * 1.6
  const fill = scoops / order.scoops

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#FFE27A' }}>
      {W > 0 && (
        <div style={{ position: 'absolute', left: ox, top: oy, width: bw, height: bh, background: `url(${landscape ? art.bgSicilyBeach : art.bgSicilyBeachTall}) center / 100% 100%` }}>
          {/* Nino (with the piano at the end). */}
          <div style={{ position: 'absolute', left: ninoX - fh * 0.6, top: sandY - fh * 0.9, width: fh * 1.2, height: fh * 0.9, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 2 }}>
            <Buddy ref={refs.nino} img={art.nino} voice="nino" height={`${fh * 0.9}px`} />
          </div>
          {/* The three friends. */}
          {(['lupa', 'tortoise', 'mona'] as Who[]).map((who) => {
            const h = who === 'tortoise' ? fh * 0.6 : who === 'mona' ? fh * 0.85 : fh
            const cur = order?.who === who && step !== 'piano' && step !== 'end'
            return (
              <div key={who} style={{ position: 'absolute', left: spots[who] - h * 0.6, top: sandY - h, width: h * 1.2, height: h, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 3 }}>
                {cur && <motion.div aria-hidden animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ position: 'absolute', left: '5%', right: '5%', bottom: -h * 0.06, height: h * 0.16, borderRadius: '50%', background: '#FFF7F0' }} />}
                {who === 'lupa' ? <Lupa ref={refs.lupa} height={`${h}px`} /> : <Buddy ref={refs[who]} img={who === 'mona' ? art.monkSeal : art.tortoise} voice={who === 'mona' ? 'mona' : 'tortoise'} height={`${h}px`} />}
                {/* Sweat drops until they get their granita; a cup after. */}
                {!served.includes(who) ? (
                  <motion.span aria-hidden animate={{ y: [0, 14], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1.1 }} style={{ position: 'absolute', right: '12%', top: '8%', fontSize: h * 0.14 }}>
                    💧
                  </motion.span>
                ) : (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', right: '-4%', bottom: '18%', width: h * 0.3 }}>
                    <Cup fill={1} color="#FFE27A" />
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* The granita stand. */}
      {(step === 'scoop' || step === 'squeeze' || step === 'serve' || step === 'flying') && (
        <>
          <motion.button aria-label="Snow" className={step === 'scoop' ? 'world-glow' : undefined} whileTap={{ scale: 0.9 }} onClick={() => void scoop()} style={{ position: 'absolute', left: snowX - item / 2, top: standY, width: item, height: item, borderRadius: 26, background: 'rgba(255,247,240,.85)', border: `5px solid ${INK}`, padding: 8, zIndex: 10 }}>
            <img src={art.snowPile} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
          </motion.button>
          <motion.button
            aria-label="Lemon"
            className={step === 'squeeze' ? 'world-glow' : undefined}
            onPointerDown={squeezeDown}
            onPointerUp={squeezeUp}
            onPointerCancel={squeezeUp}
            style={{ position: 'absolute', left: lemonX - item / 2, top: standY, width: item, height: item, borderRadius: 26, background: 'rgba(255,247,240,.85)', border: `5px solid ${INK}`, padding: 8, zIndex: 10, touchAction: 'none' }}
          >
            <motion.img src={art.lemon} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block', scaleY: lemonScale }} />
            {step === 'squeeze' && <Drips juice={juice} />}
          </motion.button>
          <AnimatePresence>
            {step !== 'flying' && (
              <motion.button
                key={turn}
                aria-label="Granita"
                className={step === 'serve' ? 'world-glow' : undefined}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={flyTo ? { x: (spots[flyTo] + ox) - cupX, y: oy + sandY - standY - fh * 0.6, scale: 0.4, opacity: 0 } : { opacity: 0 }}
                transition={{ duration: 0.6 }}
                onClick={() => void serve()}
                style={{ position: 'absolute', left: cupX - item * 0.55, top: standY - item * 0.35, width: item * 1.1, height: item * 1.3, borderRadius: 26, background: 'none', border: 'none', padding: 0, zIndex: 11 }}
              >
                <Cup fill={fill} color={lemonColor} />
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}

      {/* The piano Nino carries to the band. */}
      <AnimatePresence>
        {(step === 'piano' || step === 'end') && (
          <motion.div initial={{ y: 300 }} animate={{ y: 0 }} transition={{ type: 'spring', bounce: 0.3 }} style={{ position: 'absolute', left: '50%', translate: '-50% 0', bottom: 'calc(var(--safe-bottom) + 10px)', zIndex: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: '#FFF7F0', border: `5px solid ${INK}`, borderRadius: 24, boxShadow: 'var(--shadow)' }}>
              <img src={art.piano} alt="" draggable={false} style={{ height: 'max(90px, min(14vh, 130px))', display: landscape || W > 700 ? 'block' : 'none' }} />
              {KEYS.map((_, i) => (
                <motion.button key={i} aria-label={`Key ${i + 1}`} className={step === 'piano' && !keysHit.includes(i) && keysHit.length === i ? 'world-glow' : undefined} animate={{ y: pressed === i ? 8 : 0 }} onPointerDown={() => void key(i)} style={{ width: 'max(88px, min(12vw, 120px))', height: 'max(120px, min(18vh, 170px))', borderRadius: '0 0 18px 18px', background: keysHit.includes(i) ? KEY_COLORS[i] : '#fff', border: `5px solid ${INK}`, padding: 0 }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <FinishButton show={step === 'end'} onDone={onDone}>
        🌋 ⭐
      </FinishButton>
      <PromptRow prompt={prompt} H={H} landscape={landscape} />
    </div>
  )
}

/** A striped paper cup with a dome of snow (`fill` 0..1) that turns lemon yellow as she squeezes. */
function Cup({ fill, color }: { fill: number; color: string | MotionValue<string> }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '0.85' }}>
      <svg viewBox="0 0 100 118" width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {fill > 0 && <motion.path d={fill >= 1 ? 'M8 32 Q10 -8 50 -8 Q90 -8 92 32 Z' : 'M8 32 Q14 10 50 10 Q86 10 92 32 Z'} style={{ fill: color }} stroke={INK} strokeWidth="5" strokeLinejoin="round" initial={{ scale: 0.6 }} animate={{ scale: 1 }} />}
      </svg>
      <img src={art.granitaCup} alt="" draggable={false} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', display: 'block' }} />
    </div>
  )
}

/** Lemon juice drips while she holds. */
function Drips({ juice }: { juice: MotionValue<number> }) {
  const op = useTransform(juice, [0, 0.05, 1], [0, 1, 1])
  return (
    <motion.div aria-hidden style={{ position: 'absolute', left: '-30%', top: '70%', opacity: op, pointerEvents: 'none' }}>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} animate={{ y: [0, 40], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }} style={{ position: 'absolute', left: i * 12, width: 12, height: 16, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#FFE27A', border: `3px solid ${INK}` }} />
      ))}
    </motion.div>
  )
}


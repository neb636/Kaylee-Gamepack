// Muay Thai without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the same rounds as big picture
// buttons, with the same beat (beat.ts). The wai kru: tap 🙏 to bow (three times) and dance (three steps). Then tap the
// bag to punch it (eight punches), then on the drum's beat (a ring closes on the bag: six gold POWs, or 16 punches),
// then Daddy's pad as it moves (six hits) and the big kick. A star for each round, and the belt.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Beat, PERIOD } from './beat'
import { BOWS, DRUM_JOINS, NEED, PAD_STEPS, ROUND2_MAX, STEPS, type Round } from './layout'
import { boxingSfx as sfx } from './sounds'

interface Props {
  round: Round
  onRound: (n: Round) => void
  onWarmedUp: () => void
  onAllDone: () => void
}

type Phase = 'wai' | 'play' | 'between' | 'kick' | 'done'
const big = { width: 'clamp(110px, 20vmin, 170px)', height: 'clamp(110px, 20vmin, 170px)', borderRadius: 32, border: '6px solid #fff', boxShadow: 'var(--shadow)', fontSize: 'clamp(54px, 10vmin, 84px)', padding: 0 } as const
const now = () => performance.now() / 1000

export function BoxingFlat({ round: startRound, onRound, onWarmedUp, onAllDone }: Props) {
  const [round, setRound] = useState<Round>(startRound)
  const [phase, setPhase] = useState<Phase>(startRound === 1 ? 'wai' : 'play')
  const [stars, setStars] = useState(startRound - 1)
  const [count, setCount] = useState(0)
  const [wai, setWai] = useState(0)
  const [pow, setPow] = useState<{ id: number; text: string; big: boolean } | null>(null)
  const [hit, setHit] = useState(0)
  const [, frame] = useState(0)
  const beat = useRef(new Beat())
  const punches = useRef(0)
  const padStep = useRef(0)
  const b = beat.current

  // The beat: the drum and the cymbal, and a redraw for the ring.
  useEffect(() => {
    if (startRound >= 2) b.start(now(), PERIOD[startRound], 1.0)
    let raf = 0
    const loop = () => {
      const tk = b.tick(now())
      if (tk === 'beat') sfx.drum(b.n % 4 === 1)
      else if (tk === 'off') sfx.ching()
      frame((f) => (f + 1) % 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const next = (n: Round) => {
    setPhase('between')
    sfx.bell(2)
    setTimeout(() => {
      setStars((s) => Math.min(3, s + 1))
      sfx.star()
    }, 400)
    setTimeout(() => {
      setRound(n)
      onRound(n)
      setCount(0)
      punches.current = 0
      padStep.current = 0
      if (n === 2) b.start(now(), PERIOD[2], 1.0)
      if (n === 3) b.setPeriod(PERIOD[3])
      setPhase('play')
    }, 1800)
  }

  const tapWai = () => {
    if (phase !== 'wai') return
    const w = wai + 1
    setWai(w)
    if (w <= BOWS) sfx.bow((w - 1) * 2)
    else {
      sfx.step((w - BOWS) * 2)
      sfx.drum(w === BOWS + 1)
    }
    if (w >= BOWS + STEPS) {
      setPhase('between')
      setTimeout(() => {
        sfx.cheer()
        sfx.bell(2)
        onWarmedUp()
        setPhase('play')
      }, 900)
    }
  }

  const punch = (what: 'bag' | 'pad') => {
    if (phase === 'kick' && what === 'pad') {
      sfx.bigKick()
      setPow({ id: Date.now(), text: 'KA-POW!', big: true })
      setPhase('done')
      setTimeout(() => {
        sfx.bell(3)
        sfx.fanfare()
        setStars(3)
        onAllDone()
      }, 1200)
      return
    }
    const onBeat = round >= 2 && b.on && b.judge(now())
    setHit((h) => h + 1)
    if (what === 'pad') sfx.pap()
    else sfx.thud(1)
    if (onBeat) sfx.pow()
    setPow({ id: Date.now(), text: onBeat ? 'POW!' : what === 'pad' ? 'PAP!' : 'BAM!', big: onBeat })
    if (phase !== 'play') return
    if (round === 1) {
      const c = count + 1
      setCount(c)
      if (c === DRUM_JOINS && !b.on) b.start(now(), PERIOD[1], 0.4)
      if (c >= NEED[1]) next(2)
    } else if (round === 2) {
      punches.current++
      const c = count + (onBeat ? 1 : 0)
      setCount(c)
      if (c >= NEED[2] || punches.current >= ROUND2_MAX) next(3)
    } else if (what === 'pad') {
      const c = count + 1
      setCount(c)
      padStep.current++
      if (c >= NEED[3]) setPhase('kick')
    }
  }

  const ringK = b.ring(now())
  const gold = b.inWindow(now())
  const showRing = round === 2 && phase === 'play' && b.on
  const step = PAD_STEPS[Math.min(padStep.current, PAD_STEPS.length - 1)]
  const padLeft = phase === 'kick' ? '78%' : step.side === 'left' ? '14%' : '78%'
  const padTop = phase === 'kick' ? '55%' : step.y === 'high' ? '30%' : step.y === 'low' ? '68%' : '50%'
  const need = NEED[round]
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#EBDDFF 0, #EBDDFF 62%, #6F9BE8 62%)', paddingTop: 'var(--top-clear)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div aria-label={`Stars: ${stars}`} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'clamp(30px, 5vmin, 46px)' }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ opacity: i < stars ? 1 : 0.25 }}>
            ⭐
          </span>
        ))}
        {phase !== 'wai' && (
          <span style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
            {Array.from({ length: need }, (_, i) => (
              <span key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i < count ? '#FFC83D' : '#8E80BF', border: '2px solid #fff' }} />
            ))}
          </span>
        )}
      </div>
      <div style={{ position: 'relative', flex: 1, width: 'min(96vw, 900px)' }}>
        {phase === 'wai' || (phase === 'between' && round === 1 && count === 0) ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(16px, 5vw, 48px)' }}>
            <motion.div key={`c${wai}`} animate={{ rotate: wai > BOWS ? [0, -14, 14, 0] : [0, 0], y: wai > 0 && wai <= BOWS ? [0, 18, 0] : [0, -16, 0] }} transition={{ duration: 0.6, delay: 0.25 }} style={{ fontSize: 'clamp(70px, 14vmin, 120px)' }} aria-label="The coach">
              🐒
            </motion.div>
            <motion.button aria-label="Kaylee's gloves: bow" whileTap={{ scale: 0.85 }} onClick={tapWai} animate={{ y: wai > 0 && wai <= BOWS ? [0, 18, 0] : [0, -16, 0], rotate: wai > BOWS ? [0, 14, -14, 0] : 0 }} key={`k${wai}`} style={{ ...big, background: '#FF8FB8' }}>
              🙏
            </motion.button>
          </div>
        ) : (
          <>
            <div aria-hidden style={{ position: 'absolute', left: '4%', bottom: '6%', fontSize: 'clamp(54px, 10vmin, 90px)' }}>
              🐒🥁
            </div>
            <div style={{ position: 'absolute', left: '50%', top: '18%', transform: 'translateX(-50%)' }}>
              <motion.button aria-label="The punching bag" key={`b${hit}`} animate={{ rotate: [0, 16, -8, 3, 0] }} transition={{ duration: 0.7 }} onPointerDown={() => punch('bag')} style={{ width: 'clamp(110px, 18vmin, 160px)', height: 'clamp(200px, 34vmin, 300px)', borderRadius: 60, border: '6px solid #2B2330', background: 'linear-gradient(#E8403F 0, #E8403F 30%, #fff 30%, #fff 40%, #E8403F 40%)', transformOrigin: '50% -40%', padding: 0 }} />
              {showRing && (
                <div aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', width: 'clamp(150px, 26vmin, 220px)', height: 'clamp(150px, 26vmin, 220px)', borderRadius: '50%', border: `8px solid ${gold ? '#FFC83D' : '#fff'}`, boxShadow: gold ? '0 0 26px 10px rgba(255,200,61,.7)' : 'none', transform: `translate(-50%, -50%) scale(${1 + 1.4 * ringK})`, pointerEvents: 'none' }} />
              )}
            </div>
            {round === 3 && phase !== 'between' && (
              <motion.button aria-label="Daddy's pad" animate={{ left: padLeft, top: padTop, scale: phase === 'kick' ? [1, 1.15, 1] : 1 }} transition={phase === 'kick' ? { scale: { repeat: Infinity, duration: 0.6 } } : { type: 'spring', stiffness: 300, damping: 18 }} onPointerDown={() => punch('pad')} style={{ ...big, position: 'absolute', translate: '-50% -50%', background: '#FF8FB8', fontSize: 'clamp(40px, 7vmin, 60px)' }}>
                {phase === 'kick' ? '🦶' : '🎯'}
              </motion.button>
            )}
            <div aria-hidden style={{ position: 'absolute', right: '4%', bottom: '6%', fontSize: 'clamp(64px, 12vmin, 110px)' }}>
              🦄
            </div>
            {phase === 'done' && (
              <motion.div aria-hidden initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} style={{ position: 'absolute', left: '50%', bottom: '8%', translate: '-50% 0', fontSize: 'clamp(70px, 14vmin, 120px)' }}>
                🏆
              </motion.div>
            )}
          </>
        )}
        <AnimatePresence>
          {pow && (
            <motion.div key={pow.id} aria-hidden initial={{ scale: 0.3, opacity: 1, y: 0 }} animate={{ scale: pow.big ? 1.6 : 1.1, opacity: 0, y: -60 }} transition={{ duration: 0.8 }} style={{ position: 'absolute', left: '50%', top: '30%', translate: '-50% 0', fontWeight: 800, fontSize: 'clamp(30px, 6vmin, 52px)', color: pow.big ? '#FFC83D' : '#fff', WebkitTextStroke: '2px #2B2330', textShadow: '3px 3px 0 #FF4F9A', pointerEvents: 'none' }}>
              {pow.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

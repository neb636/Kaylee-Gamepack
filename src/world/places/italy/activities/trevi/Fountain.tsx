// The Trevi Fountain, seen from the front at eye level: the water arrives (dry picture → full picture with a big splash),
// then the coin toss. She flicks a coin up; it arcs INTO the picture (getting smaller as it goes away) and plops into the
// basin. Two coins for Kaylee, then Lupa tosses one and wishes out loud, and a wishing star rises for the opera night.
import { animate, AnimatePresence, motion, useMotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { bigCelebration, burst, pick, say, SparklePuppet, sounds, useAlive, useElementSize, useLandscape, usePointerDrag, wait, type PuppetHandle } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { PromptBubble } from '../../../../kit/Stage'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'
import { Lupa } from '../../puppets/Lupa'
import type { WordId } from '../../WordCard'
import { water } from './audio'
import { WATER } from './Stone'

const T = L.trevi
type Pt = { x: number; y: number }

/** Spots in the pictures (fractions): where coins land, the shell the water bursts from, where the friends stand. */
const SPOTS = {
  wide: { land: [{ x: 0.42, y: 0.735 }, { x: 0.58, y: 0.745 }, { x: 0.33, y: 0.74 }], shell: { x: 0.5, y: 0.6 }, pool: { x: 0.5, y: 0.73, w: 0.62 }, feet: 0.985, lupa: 0.13, sparkle: 0.87, h: 0.3 },
  tall: { land: [{ x: 0.42, y: 0.795 }, { x: 0.6, y: 0.805 }, { x: 0.3, y: 0.79 }], shell: { x: 0.5, y: 0.7 }, pool: { x: 0.5, y: 0.8, w: 0.74 }, feet: 0.975, lupa: 0.17, sparkle: 0.83, h: 0.16 },
}

export function Fountain({ onStep, onDone, showWord }: { onStep: () => void; onDone: () => void; showWord: (w: WordId) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const { width: W, height: H } = useElementSize(box)
  const landscape = useLandscape()
  const alive = useAlive()
  const lupa = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const [full, setFull] = useState(false)
  const [coinReady, setCoinReady] = useState(false)
  const [coins, setCoins] = useState(0) // coins she has tossed
  const [prompt, setPrompt] = useState<string | null>(null)
  const [plops, setPlops] = useState<{ id: number; x: number; y: number }[]>([])
  const [lupaCoin, setLupaCoin] = useState(false)
  const [star, setStar] = useState(false)
  const [flying, setFlying] = useState(false)
  const coinsRef = useRef(0)

  const s = landscape ? SPOTS.wide : SPOTS.tall
  const ratio = landscape ? 1.5 : 1024 / 1536
  const bw = Math.max(W, H * ratio)
  const bh = bw / ratio
  const P = (fx: number, fy: number): Pt => ({ x: (W - bw) / 2 + fx * bw, y: (H - bh) / 2 + fy * bh })
  const feet = Math.min(P(0, s.feet).y, H - 10)
  const friendH = Math.min(s.h * bh, H * 0.3, W * 0.24)
  const coinS = Math.min(landscape ? W * 0.095 : W * 0.17, H * 0.13, 140)
  const coinHome = { x: W / 2, y: Math.min(P(0.5, 0.925).y, H - coinS * 0.62 - 10) }

  // The water arrives: a moment of dry fountain, then a rush and a big splash.
  useEffect(() => {
    void (async () => {
      await wait(700)
      if (!alive()) return
      sounds.whoosh()
      await wait(350)
      if (!alive()) return
      setFull(true)
      sfx.splash()
      sounds.sparkle()
      bigCelebration(1600)
      void lupa.current?.play('cheer')
      void sparkle.current?.play('cheer')
      onStep()
      showWord('bellissima')
      await say(T.full)
      if (!alive()) return
      setCoinReady(true)
      void sparkle.current?.play('wave')
      await say(T.romans)
      if (!alive() || coinsRef.current > 0) return
      await say(T.still)
      if (!alive() || coinsRef.current > 0) return
      setPrompt(T.flick)
    })()
  }, [])

  const plop = (at: Pt) => {
    water.plink()
    sfx.splash()
    const id = Date.now() + Math.random()
    setPlops((p) => [...p.slice(-3), { id, ...at }])
    setTimeout(() => setPlops((p) => p.filter((q) => q.id !== id)), 1600)
  }

  /** Her coin landed. */
  const landed = async (at: Pt) => {
    plop(at)
    const n = coinsRef.current
    onStep()
    void lupa.current?.play('cheer')
    if (n === 1) {
      burst(at.x / W, at.y / H)
      setPrompt(null)
      setFlying(false)
      await say(T.one)
      if (!alive()) return
      await say(T.comeBack)
      if (!alive()) return
      if (coinsRef.current === 1) setPrompt(T.oneMore)
      return
    }
    burst(at.x / W, at.y / H)
    setPrompt(null)
    setCoinReady(false)
    await say(T.two)
    if (!alive()) return
    // Lupa's turn: she hops, tosses her coin and wishes out loud.
    void lupa.current?.play('wave')
    await say(T.lupaTurn)
    if (!alive()) return
    void lupa.current?.play('hop')
    await wait(250)
    setLupaCoin(true)
    await wait(1100)
    if (!alive()) return
    plop(P(s.land[2].x, s.land[2].y))
    await wait(300)
    void lupa.current?.play('howl')
    await say(T.wish)
    if (!alive()) return
    setStar(true)
    sounds.sparkle()
    void sparkle.current?.play('cheer')
    await wait(900)
    await say(T.star)
    if (!alive()) return
    await say(T.help)
    if (!alive()) return
    await wait(500)
    if (alive()) onDone()
  }

  const toss = () => {
    if (!coinReady || flying || coinsRef.current >= 2) return
    setFlying(true)
    coinsRef.current += 1
    setCoins(coinsRef.current)
    setPrompt(null)
    sounds.whoosh()
    void sparkle.current?.play('hop')
  }

  const at = s.land[Math.min(coins, 2) - 1] ?? s.land[0]
  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#7FD0F6' }}>
      {W > 0 && (
        <>
          <div style={{ position: 'absolute', left: (W - bw) / 2, top: (H - bh) / 2, width: bw, height: bh, background: `url(${landscape ? art.bgTreviDry : art.bgTreviDryTall}) center / 100% 100%` }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: full ? 1 : 0 }} transition={{ duration: 1.1 }} style={{ position: 'absolute', inset: 0, background: `url(${landscape ? art.bgTreviFull : art.bgTreviFullTall}) center / 100% 100%` }} />
          </div>
          {full && <BigSplash at={P(s.shell.x, s.shell.y)} size={bw * 0.32} />}
          {full && <Shimmer pool={{ ...P(s.pool.x, s.pool.y), w: s.pool.w * bw }} size={bw * 0.02} />}
          {plops.map((p) => (
            <Plop key={p.id} x={p.x} y={p.y} size={bw * 0.05} />
          ))}

          {/* Lupa and Sparkle stand on the cobbles in front of the basin. */}
          <div style={{ position: 'absolute', left: Math.max(4, P(s.lupa, 0).x - friendH * 0.42), top: feet - friendH * 0.985, zIndex: 6 }}>
            <motion.button
              aria-label="Lupa"
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                sounds.pop()
                void lupa.current?.play('wag')
                void say(pick(L.tickle.lupa))
              }}
              style={{ background: 'none', border: 'none', padding: 0, display: 'block' }}
            >
              <Lupa ref={lupa} height={`${friendH}px`} />
            </motion.button>
          </div>
          <div style={{ position: 'absolute', left: Math.min(W - friendH * 0.95, P(s.sparkle, 0).x - friendH * 0.47), top: feet - friendH * 1.08, zIndex: 6, pointerEvents: 'none' }}>
            <SparklePuppet ref={sparkle} height={`${friendH * 1.1}px`} lookToward={-0.5} flip />
          </div>

          {/* Lupa's coin flies from her paw into the water. */}
          {lupaCoin && (
            <FlyingCoin
              from={{ x: Math.max(4, P(s.lupa, 0).x - friendH * 0.42) + friendH * 0.75, y: feet - friendH * 0.55 }}
              to={P(s.land[2].x, s.land[2].y)}
              size={coinS * 0.6}
              peak={P(0.5, s.shell.y - 0.12).y}
            />
          )}

          {/* Her coins: the one waiting at the bottom, and the one in the air. */}
          <AnimatePresence>
            {coinReady && coins < 2 && !flying && <Coin key={`c${coins}`} at={coinHome} size={coinS} onToss={toss} onTapHint={() => void say(T.flickHint)} />}
          </AnimatePresence>
          {coins > 0 && (
            <FlyingCoin
              key={`f${coins}`}
              from={coinHome}
              to={P(at.x, at.y)}
              size={coinS}
              peak={P(0.5, s.shell.y - 0.18).y}
              onLand={() => void landed(P(at.x, at.y))}
            />
          )}

          <AnimatePresence>{star && <WishStar from={P(s.land[2].x, s.land[2].y)} to={{ x: W * 0.5, y: Math.max(130, H * 0.2) }} size={Math.min(W, H) * 0.16} />}</AnimatePresence>
        </>
      )}
      {prompt && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 24px', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <PromptBubble text={prompt} />
          </div>
        </div>
      )}
    </div>
  )
}

/** The coin face-on: a flat sticker seen from the front, like everything else in the scene. */
function CoinFace({ size }: { size: number }) {
  return <img src={art.coin} alt="" draggable={false} style={{ width: size, height: size, display: 'block', pointerEvents: 'none' }} />
}

/** The coin waiting on the cobbles: swipe up on it (or tap) to toss it. */
function Coin({ at, size, onToss, onTapHint }: { at: Pt; size: number; onToss: () => void; onTapHint: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const taps = useRef(0)
  usePointerDrag(ref, {
    threshold: 6,
    onStart: () => sounds.pickup(),
    onMove: (i) => {
      const el = ref.current!
      el.style.transition = 'none'
      el.style.transform = `translate(${i.dx * 0.3}px, ${Math.max(-60, Math.min(20, i.dy * 0.5))}px)`
    },
    onEnd: (i) => {
      const el = ref.current!
      el.style.transition = 'transform .3s'
      el.style.transform = 'none'
      if (i.dy < -30) onToss()
      else onTapHint()
    },
    onTap: () => {
      // A tap tosses it too (after showing her the swipe once), so she can never get stuck.
      taps.current += 1
      if (taps.current === 1) onTapHint()
      else onToss()
    },
  })
  return (
    <motion.div
      initial={{ scale: 0, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', bounce: 0.5 }}
      style={{ position: 'absolute', left: at.x - size / 2 - 20, top: at.y - size / 2 - 20, padding: 20, zIndex: 12 }}
    >
      <div ref={ref} role="button" aria-label="Coin" style={{ touchAction: 'none', cursor: 'grab' }}>
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 1.1 }} style={{ position: 'relative' }}>
          <div className="world-glow" style={{ borderRadius: '50%' }}>
            <CoinFace size={size} />
          </div>
          <motion.div animate={{ y: [8, -26], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.1 }} style={{ position: 'absolute', left: '50%', top: -size * 0.32, translate: '-50% 0', fontSize: size * 0.34, color: INK, fontWeight: 700, pointerEvents: 'none' }}>
            ⬆
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

/** A coin in the air: it arcs up and into the picture, spinning and getting smaller with distance. */
function FlyingCoin({ from, to, size, peak, onLand }: { from: Pt; to: Pt; size: number; peak: number; onLand?: () => void }) {
  const x = useMotionValue(from.x)
  const y = useMotionValue(from.y)
  const sc = useMotionValue(1)
  const [inWater, setInWater] = useState(false)
  useEffect(() => {
    const d = 1.0
    void animate(x, to.x, { duration: d, ease: 'linear' })
    void animate(sc, 0.22, { duration: d, ease: [0.3, 0.6, 0.6, 1] })
    void animate(y, [from.y, Math.min(peak, from.y - 80), to.y], { duration: d, times: [0, 0.45, 1], ease: ['easeOut', 'easeIn'] }).then(() => {
      setInWater(true)
      onLand?.()
    })
  }, [])
  return (
    <motion.div style={{ position: 'absolute', left: 0, top: 0, x, y, scale: sc, zIndex: inWater ? 3 : 14, pointerEvents: 'none' }}>
      <motion.div
        initial={{ opacity: 1 }}
        animate={inWater ? { opacity: 0, y: 6 } : { scaleX: [1, -1, 1, -1, 1, -1, 1] }}
        transition={inWater ? { duration: 0.35 } : { duration: 1, ease: 'linear' }}
        style={{ translate: '-50% -50%' }}
      >
        <CoinFace size={size} />
      </motion.div>
    </motion.div>
  )
}

/** Where a coin went in: rings on the water and a few drops. */
function Plop({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <svg style={{ position: 'absolute', left: x - size * 2, top: y - size * 1.5, width: size * 4, height: size * 3, overflow: 'visible', pointerEvents: 'none', zIndex: 4 }} viewBox={`${-size * 2} ${-size * 1.5} ${size * 4} ${size * 3}`}>
      {[0, 0.25, 0.5].map((d) => (
        <motion.ellipse key={d} cx={0} cy={0} fill="none" stroke="#fff" strokeWidth={Math.max(2, size * 0.07)} initial={{ rx: size * 0.1, ry: size * 0.03, opacity: 1 }} animate={{ rx: size * 1.4, ry: size * 0.38, opacity: 0 }} transition={{ delay: d, duration: 1.1, ease: 'easeOut' }} />
      ))}
      {[-1, -0.35, 0.35, 1].map((d) => (
        <motion.circle cx={0} cy={0} key={d} r={size * 0.09} fill={WATER} stroke={INK} strokeWidth={Math.max(1.5, size * 0.04)} initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: d * size * 0.6, y: [0, -size * (1 - Math.abs(d) * 0.4), -size * 0.1], opacity: [1, 1, 0] }} transition={{ duration: 0.7, ease: 'easeOut' }} />
      ))}
    </svg>
  )
}

/** The water bursting out of the shell when the fountain fills: a fan of drops that rise and fall. */
function BigSplash({ at, size }: { at: Pt; size: number }) {
  const drops = Array.from({ length: 14 }, (_, i) => {
    const a = -Math.PI / 2 + ((i / 13) - 0.5) * Math.PI * 0.9
    return { dx: Math.cos(a) * size * (0.6 + (i % 3) * 0.2), dy: Math.sin(a) * size * (0.7 + (i % 2) * 0.25), r: size * (0.025 + (i % 3) * 0.01) }
  })
  return (
    <svg style={{ position: 'absolute', left: at.x - size * 1.5, top: at.y - size * 1.5, width: size * 3, height: size * 3, overflow: 'visible', pointerEvents: 'none', zIndex: 2 }} viewBox={`${-size * 1.5} ${-size * 1.5} ${size * 3} ${size * 3}`}>
      {drops.map((d, i) => (
        <motion.circle cx={0} cy={0} key={i} r={d.r} fill={WATER} stroke={INK} strokeWidth={Math.max(2, size * 0.008)} initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: d.dx, y: [0, d.dy, d.dy * 0.2 + size * 0.5], opacity: [1, 1, 0] }} transition={{ duration: 1.5, ease: 'easeOut', delay: (i % 4) * 0.05 }} />
      ))}
    </svg>
  )
}

/** Little glints and ripples on the full basin. */
function Shimmer({ pool, size }: { pool: Pt & { w: number }; size: number }) {
  const spots = [-0.38, -0.22, -0.05, 0.12, 0.28, 0.4]
  return (
    <div aria-hidden style={{ position: 'absolute', left: pool.x, top: pool.y, pointerEvents: 'none', zIndex: 2 }}>
      {spots.map((fx, i) => (
        <motion.div
          key={i}
          animate={{ scale: [0.2, 1.2, 0.2], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.37 }}
          style={{ position: 'absolute', left: fx * pool.w, top: ((i % 3) - 1) * size * 1.4, translate: '-50% -50%', width: size * 2.4, height: size * 0.7, borderRadius: '50%', border: `${Math.max(2, size * 0.18)}px solid #fff` }}
        />
      ))}
      {spots.slice(0, 4).map((fx, i) => (
        <motion.span key={`s${i}`} animate={{ scale: [0, 1, 0], rotate: [0, 90] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.3 + i * 0.5 }} style={{ position: 'absolute', left: (fx + 0.1) * pool.w, top: (i % 2 ? -1 : 0.6) * size * 1.6, translate: '-50% -50%', fontSize: size * 1.6 }}>
          ✨
        </motion.span>
      ))}
    </div>
  )
}

/** Lupa's wishing star rises from the water and waits up high for her opera night. */
function WishStar({ from, to, size }: { from: Pt; to: Pt; size: number }) {
  return (
    <motion.div
      initial={{ x: from.x, y: from.y, scale: 0.2, rotate: 0 }}
      animate={{ x: [from.x, from.x - size * 0.6, to.x], y: [from.y, from.y - size * 1.4, to.y], scale: [0.2, 0.8, 1], rotate: [0, -20, 0] }}
      transition={{ duration: 1.8, ease: 'easeInOut' }}
      style={{ position: 'absolute', left: 0, top: 0, zIndex: 15, pointerEvents: 'none' }}
    >
      <motion.div animate={{ scale: [1, 1.1, 1], rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ translate: '-50% -50%' }}>
        <svg width={size} height={size} viewBox="-60 -60 120 120" style={{ display: 'block', overflow: 'visible' }}>
          <path
            d={Array.from({ length: 10 }, (_, i) => {
              const a = -Math.PI / 2 + (i * Math.PI) / 5
              const r = i % 2 ? 24 : 52
              return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`
            }).join(' ') + 'Z'}
            fill="#FFE27A"
            stroke={INK}
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <circle cx="-11" cy="2" r="4" fill="#4A2616" />
          <circle cx="11" cy="2" r="4" fill="#4A2616" />
          <ellipse cx="-19" cy="12" rx="6" ry="3.5" fill="#F9C4C0" />
          <ellipse cx="19" cy="12" rx="6" ry="3.5" fill="#F9C4C0" />
          <path d="M-6 12 Q0 18 6 12" fill="none" stroke="#4A2616" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </motion.div>
    </motion.div>
  )
}

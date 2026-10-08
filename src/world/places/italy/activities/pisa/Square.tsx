// The Square of Miracles in Pisa, one straight-on eye-level camera: the lawn, the cathedral behind, and the tower
// standing on the grass. The tower is its own picture, drawn upright, and leans by rotating around the middle of its base.
//   1. Balance: the tower creaks and leans further. Weights dragged to the high (left) side pull it back; a weight on
//      the low side makes it lean more, then Sparkle points to the other side, which glows.
//   2. Photo: drag Sparkle toward the tower until her hoof touches it, like she's holding it up. Snap!
//   3. Galileo's drop: Civetta flies up beside the top with two things. Guess which lands first, then tap drop.
//   4. Bells: seven bells, do re mi fa sol la ti. Ring them up the scale; Civetta brings them to Lupa's band.
import { animate, AnimatePresence, motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { bigCelebration, BigButton, burst, Piece, pick, PlayArea, say, SparklePuppet, sounds, Target, useAlive, useElementSize, useLandscape, usePointerDrag, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { art } from '../../art'
import { L } from '../../lines'
import { Civetta } from '../../puppets/Civetta'
import { INK } from '../../puppets/ink'
import { SCALE, tower } from './audio'

const P = L.pisa
type Phase = 'balance' | 'photo' | 'drop' | 'bells' | 'end'
type Thing = 'melon' | 'lemon' | 'feather' | 'weight'
const IMG: Record<Thing, string> = { melon: art.melon, lemon: art.lemon, feather: art.feather, weight: art.weight }
/** How big each thing is (fraction of the picture height). */
const SIZE: Record<Thing, number> = { melon: 0.1, lemon: 0.065, feather: 0.09, weight: 0.085 }
/** The three drops: two things each (round 3 she picks them herself). */
const DROPS: [Thing, Thing][] = [
  ['melon', 'lemon'],
  ['lemon', 'feather'],
]

/** Spots in the pictures (fractions of the picture). The tower's base sits on the lawn, in front of the far edge. */
const LAYOUT = {
  wide: { base: { x: 0.62, y: 0.87 }, towerH: 0.66, weight: 0.15, tray: 0.88, sparkle: { x: 0.09, h: 0.24 }, photoStart: 0.86, civetta: { x: 0.25, h: 0.17 }, choices: { x: 0.25, y: 0.42 }, bells: 0.5 },
  tall: { base: { x: 0.6, y: 0.885 }, towerH: 0.43, weight: 0.085, tray: 0.915, sparkle: { x: 0.09, h: 0.12 }, photoStart: 0.88, civetta: { x: 0.22, h: 0.09 }, choices: { x: 0.5, y: 0.25 }, bells: 0.45 },
}
/** The tower picture: 1024 x 1536, the tower's flat bottom at 97.7% and its body half as wide as ~24% of the picture. */
const T_RATIO = 1024 / 1536
const T_BOTTOM = 0.977
const T_HALF = 0.245
/** Lean angles (degrees, + = toward the right): where it starts, how far it creeps, and how much each weight pulls back. */
const LEAN0 = 3
const LEAN_MAX = 9.5
const PER_WEIGHT = 1.9

export function Square({ onStep, onDone }: { onStep: () => void; onDone: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const { width: W, height: H } = useElementSize(box)
  const landscape = useLandscape()
  const alive = useAlive()
  const lay = landscape ? LAYOUT.wide : LAYOUT.tall
  const ratio = landscape ? 1.5 : 1024 / 1536
  const bw = Math.max(W, H * ratio)
  const bh = bw / ratio
  const ox = (W - bw) / 2
  const oy = Math.min(0, H - bh) * (W / Math.max(H, 1) > 1.7 ? 1 : 0.5)

  const civetta = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const lean = useMotionValue(LEAN0)
  const rot = useTransform(lean, (a) => `${a}deg`)

  const [phase, setPhase] = useState<Phase>('balance')
  const [prompt, setPrompt] = useState<{ text: Line; speak: boolean } | null>(null)
  const [placed, setPlaced] = useState(0)
  const [hintLeft, setHintLeft] = useState(false)
  const placedRef = useRef(0)
  const busy = useRef(false)

  // Geometry in picture px.
  const baseX = lay.base.x * bw
  const baseY = lay.base.y * bh
  const IH = (lay.towerH * bh) / 0.955
  const IW = IH * T_RATIO
  const half = IW * T_HALF
  const S = lay.weight * bh
  const leanNow = () => lean.get()
  /** A point on the tower's axis, `h` px above the base. */
  const onTower = (h: number, a = leanNow()) => ({ x: baseX + Math.sin((a * Math.PI) / 180) * h, y: baseY - Math.cos((a * Math.PI) / 180) * h })

  // ---------- 1. Balance ----------
  useEffect(() => {
    void (async () => {
      await wait(300)
      if (!alive()) return
      void civetta.current?.play('flap')
      // It creaks and leans further, slowly.
      const creak = setInterval(() => tower.creak(), 900)
      await animate(lean, LEAN_MAX, { duration: 2.6, ease: 'easeInOut' })
      clearInterval(creak)
      if (!alive()) return
      void civetta.current?.play('think')
      await say(P.soft)
      if (!alive() || placedRef.current > 0) return
      setPrompt({ text: P.weights, speak: true })
    })()
  }, [])

  const placeLeft = async () => {
    if (phase !== 'balance' || placedRef.current >= 3) return
    const n = ++placedRef.current
    setPlaced(n)
    setHintLeft(false)
    setPrompt(null)
    tower.thud()
    onStep()
    await wait(150)
    tower.creak()
    await animate(lean, LEAN_MAX - PER_WEIGHT * n - (n === 3 ? 0.4 : 0), { type: 'spring', bounce: 0.35, duration: 1.1 })
    if (!alive()) return
    sounds.correct()
    void civetta.current?.play(n === 3 ? 'cheer' : 'nod')
    void sparkle.current?.play(n === 3 ? 'cheer' : 'nod')
    await say(P.better[n - 1])
    if (!alive()) return
    if (n < 3) {
      if (placedRef.current === n) setPrompt({ text: n === 1 ? P.weightNext : P.weightLast, speak: true })
      return
    }
    burst(baseX / bw, 0.4)
    await say(P.engineers)
    if (!alive()) return
    setPhase('photo')
    await say(P.photo)
    if (!alive()) return
    setPrompt({ text: P.pushSparkle, speak: true })
  }

  const wrongSide = async () => {
    if (busy.current) return
    busy.current = true
    sounds.oops()
    tower.thud()
    tower.creak()
    void civetta.current?.play('flap')
    void sparkle.current?.play('think')
    const before = lean.get()
    await animate(lean, before + 1.6, { duration: 0.6, ease: 'easeOut' })
    if (!alive()) return
    void say(P.creak)
    await wait(900)
    if (!alive()) return
    void animate(lean, before, { type: 'spring', bounce: 0.3, duration: 1 })
    setHintLeft(true)
    await say(P.wrongSide)
    busy.current = false
  }

  // ---------- 2. The famous photo ----------
  const [snapped, setSnapped] = useState(false)
  const [flash, setFlash] = useState(0)
  const [polaroid, setPolaroid] = useState(false)
  const sh = lay.sparkle.h * bh
  const sGround = baseY + 0.035 * bh
  // Where Sparkle stands so her front hoof just touches the tower's right side (she faces left).
  const touchX = (a = leanNow()) => baseX + half + Math.sin((a * Math.PI) / 180) * sh * 0.6 + sh * 0.34
  const sx = useMotionValue(lay.sparkle.x * bw)
  /** Sparkle's spot on the left, kept on screen when a wide iPad crops the picture's sides. */
  const sparkleHome = () => Math.max(lay.sparkle.x * bw, -ox + sh * 0.5)

  const takePhoto = async () => {
    if (snapped) return
    setSnapped(true)
    setPrompt(null)
    await animate(sx, touchX(), { type: 'spring', bounce: 0.3, duration: 0.5 })
    if (!alive()) return
    void sparkle.current?.play('wave')
    await say(P.snap)
    if (!alive()) return
    tower.shutter()
    setFlash((f) => f + 1)
    onStep()
    await wait(350)
    setPolaroid(true)
    sounds.sparkle()
    void civetta.current?.play('cheer')
    await say(P.stillLeans)
    if (!alive()) return
    await wait(600)
    if (!alive()) return
    setPolaroid(false)
    void startDrops()
  }

  // ---------- 3. Galileo's drop ----------
  const [round, setRound] = useState(0)
  const [things, setThings] = useState<Thing[]>([])
  const [guess, setGuess] = useState<Thing | null>(null)
  const [choosing, setChoosing] = useState(false)
  const [picking, setPicking] = useState(false)
  const [falling, setFalling] = useState(0)
  const [ready, setReady] = useState(false)
  const civH = lay.civetta.h * bh
  const civX = useMotionValue(lay.civetta.x * bw)
  const civY = useMotionValue(sGround)
  const [flying, setFlying] = useState(false)
  // Until they move, Sparkle and Civetta stand at their spots (which depend on the screen size).
  useEffect(() => {
    if (!bw || phase !== 'balance') return
    sx.set(sparkleHome())
    civX.set(Math.max(lay.civetta.x * bw, -ox + civH * 0.5 + sh * 0.9))
    civY.set(sGround)
  }, [bw, bh, landscape])
  // Things to drop are a bit smaller on a tall screen, so they hang clear of the tower and stay on screen.
  const itemScale = landscape ? 1 : 0.72
  const itemMax = 0.1 * bh * itemScale
  /** Where Civetta hovers: beside the top, with both things hanging clear of the tower. */
  const hover = () => {
    const top = onTower(IH * 0.9)
    const reach = civH * 0.42 + itemMax * 0.5 + 10
    return { x: Math.min(top.x + half + reach, bw - reach), y: top.y + civH * 0.9 }
  }

  const fly = async (to: { x: number; y: number }) => {
    setFlying(true)
    void animate(civX, to.x, { duration: 1.4, ease: 'easeInOut' })
    await animate(civY, [civY.get(), Math.min(civY.get(), to.y) - civH * 0.6, to.y], { duration: 1.4, ease: 'easeInOut' })
  }

  const startDrops = async () => {
    setPhase('drop')
    void animate(sx, sparkleHome(), { duration: 1.2, ease: 'easeInOut' })
    await say(P.galileo)
    if (!alive()) return
    void civetta.current?.play('hoot')
    await say(P.climb)
    if (!alive()) return
    await fly(hover())
    if (!alive()) return
    void nextDrop(0)
  }

  const nextDrop = async (r: number) => {
    setRound(r)
    setGuess(null)
    setFalling(0)
    setReady(false)
    if (r < 2) {
      setThings(DROPS[r])
      setChoosing(true)
      setPrompt({ text: P.whichFirst, speak: true })
    } else {
      setThings([])
      setPicking(true)
      setPrompt({ text: P.youPick, speak: true })
    }
  }

  const choose = async (t: Thing) => {
    if (!choosing) return
    sounds.pop()
    setGuess(t)
    setChoosing(false)
    setPrompt(null)
    void civetta.current?.play('nod')
    await say(P.findOut)
    if (!alive()) return
    setReady(true)
    setPrompt({ text: P.drop, speak: true })
  }

  const pickThing = (t: Thing) => {
    if (!picking || things.includes(t)) return
    sounds.pop()
    const next = [...things, t]
    setThings(next)
    if (next.length === 1) return void say(P.pickOne)
    setPicking(false)
    setReady(true)
    setPrompt({ text: P.drop, speak: true })
  }

  const drop = async () => {
    if (!ready) return
    setReady(false)
    setPrompt(null)
    sounds.whoosh()
    void civetta.current?.play('flap')
    setFalling((f) => f + 1)
    const feather = things.includes('feather')
    tower.fall(1.1)
    await wait(1150)
    if (!alive()) return
    tower.land()
    if (!feather || things.every((t) => t === 'feather')) {
      // Both land together.
      onStep()
      sounds.correct()
      burst((hover().x) / bw, baseY / bh)
      void civetta.current?.play('cheer')
      void sparkle.current?.play('cheer')
      if (round < 2 && guess) await say(pick(P.youWere))
      if (!alive()) return
      await say(P.same)
      if (!alive()) return
      await say(P.sameWhy)
    } else {
      await wait(2400)
      if (!alive()) return
      tower.land(true)
      onStep()
      sounds.correct()
      void civetta.current?.play('hoot')
      if (round < 2 && guess) await say(guess === 'feather' ? P.youWere[1] : P.youWere[0])
      if (!alive()) return
      await say(P.feather)
      if (!alive()) return
      await say(P.air)
    }
    if (!alive()) return
    await wait(400)
    if (round < 2) return void nextDrop(round + 1)
    void startBells()
  }

  // ---------- 4. The seven bells ----------
  const [bells, setBells] = useState(false)
  const [rung, setRung] = useState(0)
  const [swing, setSwing] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [finish, setFinish] = useState(false)
  const startBells = async () => {
    setPhase('bells')
    setThings([])
    await fly({ x: Math.max(lay.civetta.x * bw, -ox + civH * 0.5 + sh * 0.9), y: sGround })
    setFlying(false)
    if (!alive()) return
    void civetta.current?.play('hoot')
    setBells(true)
    sounds.sparkle()
    await say(P.bells)
    if (!alive()) return
    if (rungRef.current === 0) setPrompt({ text: P.ringBells, speak: true })
  }
  const rungRef = useRef(0)
  const ring = async (i: number) => {
    tower.bell(i)
    setSwing((s) => s.map((v, j) => (j === i ? v + 1 : v)))
    if (i !== rungRef.current || rungRef.current >= 7) return
    const n = ++rungRef.current
    setRung(n)
    setPrompt(null)
    if (n < 7) return
    // All seven: they ring up the scale by themselves, everyone dances.
    onStep()
    await wait(700)
    for (let k = 0; k < 7; k++) {
      if (!alive()) return
      tower.bell(k)
      setSwing((s) => s.map((v, j) => (j === k ? v + 1 : v)))
      await wait(230)
    }
    void civetta.current?.play('cheer')
    void sparkle.current?.play('dance')
    burst(0.5, 0.4)
    await say(P.scale)
    if (!alive()) return
    void civetta.current?.play('wave')
    await say(P.giveBells)
    if (!alive()) return
    await say(P.band)
    if (!alive()) return
    bigCelebration()
    sounds.fanfare()
    setPhase('end')
    setFinish(true)
  }

  const tickles = useRef(0)
  const tapCivetta = () => {
    sounds.pop()
    void civetta.current?.play('swivel')
    void say(L.tickle.civetta[tickles.current++ % L.tickle.civetta.length])
  }

  const trayX = Math.min(lay.tray * bw, W - ox - S * 0.6)
  const tray = [0, 1, 2].map((i) => ({ x: trayX, y: baseY - S * 0.36 - i * S * 0.58 }))
  const leftPad = { x: baseX - half - S * 0.85, y: baseY - S * 0.36 }
  const rightPad = { x: baseX + half + S * 0.5, y: baseY - S * 0.36 }
  const hv = W > 0 ? hover() : { x: 0, y: 0 }
  const choiceItems: Thing[] = picking ? ['melon', 'lemon', 'feather', 'weight'] : choosing ? things : []
  const card = Math.max(96, Math.min(150, bh * 0.15))

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#7FD0F6', isolation: 'isolate' }}>
      {W > 0 && (
        <PlayArea style={{ position: 'absolute', left: ox, top: oy, width: bw, height: bh, zIndex: 0, background: `url(${landscape ? art.bgPisa : art.bgPisaTall}) center / 100% 100%` }}>
          {/* The tower. */}
          <motion.div style={{ position: 'absolute', left: baseX - IW / 2, top: baseY - IH * T_BOTTOM, width: IW, height: IH, rotate: rot, transformOrigin: `50% ${T_BOTTOM * 100}%`, zIndex: 2 }}>
            <img src={art.towerPisa} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
          </motion.div>
          {/* A little patch of soft ground under it. */}
          <div aria-hidden style={{ position: 'absolute', left: baseX - half * 1.5, top: baseY - 6, width: half * 3, height: 16, borderRadius: '50%', background: '#A9773F', border: `4px solid ${INK}`, zIndex: 1 }} />

          {/* 1. Weights: the tray on the right, the two sides of the tower. */}
          {phase === 'balance' && (
            <>
              <Target id="left" hint={hintLeft} style={{ position: 'absolute', left: leftPad.x - S * 0.7, top: leftPad.y - S * 1.1, width: S * 1.4, height: S * 1.6, borderRadius: 24, zIndex: 3 }} />
              <Target id="right" glow={false} style={{ position: 'absolute', left: rightPad.x - S * 0.7, top: rightPad.y - S * 1.1, width: S * 1.4, height: S * 1.6, borderRadius: 24, zIndex: 3 }} />
              {tray.slice(0, 3 - placed).map((p, i) => (
                <Piece
                  key={`w${placed + i}`}
                  id={`w${placed + i}`}
                  label="Weight"
                  snapTo={['left', 'right']}
                  snapRadius={S * 0.75}
                  onPickUp={() => sounds.pickup()}
                  onPlace={({ target }) => {
                    if (target === 'left') {
                      void placeLeft()
                      return 'reset'
                    }
                    if (target === 'right') void wrongSide()
                    return 'home'
                  }}
                  onTap={() => {
                    if (hintLeft) return void placeLeft()
                    setHintLeft(true)
                    void say(P.weights)
                  }}
                  style={{ position: 'absolute', left: p.x - S / 2, top: p.y - S / 2, width: S, height: S, zIndex: 10 + (2 - i) }}
                >
                  <img src={art.weight} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
                </Piece>
              ))}
            </>
          )}
          {/* The weights she has put on the high side, stacked. */}
          {Array.from({ length: placed }, (_, i) => (
            <motion.img
              key={i}
              src={art.weight}
              alt=""
              draggable={false}
              initial={{ y: -S * 1.2, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.45, duration: 0.5 }}
              style={{ position: 'absolute', left: leftPad.x - S / 2, top: leftPad.y - S / 2 - i * S * 0.58, width: S, height: S, zIndex: 4 + i, pointerEvents: 'none' }}
            />
          ))}

          {/* Civetta: on the lawn, or flying up beside the top of the tower with the things to drop. */}
          <motion.div style={{ position: 'absolute', left: 0, top: 0, x: civX, y: civY, zIndex: 20 }}>
            <div style={{ position: 'absolute', left: -civH * 0.45, top: -civH, width: civH * 0.9, height: civH, display: 'flex', justifyContent: 'center' }}>
              <button aria-label="Civetta" onClick={tapCivetta} style={{ background: 'none', border: 'none', padding: 0, display: 'block' }}>
                <Civetta ref={civetta} height={`${civH}px`} flying={flying} />
              </button>
            </div>
          </motion.div>
          {/* What she's holding, hanging under her (they fall straight down to the grass). */}
          {phase === 'drop' &&
            things.map((t, i) => (
              <Falling key={`${round}-${t}-${i}`} img={IMG[t]} size={SIZE[t] * bh * itemScale} x={hv.x + (i === 0 ? -1 : 1) * civH * 0.42} y={hv.y + SIZE[t] * bh * itemScale * 0.5} ground={baseY + 0.05 * bh - SIZE[t] * bh * itemScale * 0.5} go={falling > 0} slow={t === 'feather'} />
            ))}

          {/* Sparkle: on the left, or dragged toward the tower for the photo. */}
          <motion.div style={{ position: 'absolute', left: 0, top: sGround, x: sx, zIndex: 25 }}>
            <SparkleDrag
              h={sh}
              active={phase === 'photo' && !snapped}
              flip={phase !== 'photo'}
              sx={sx}
              sparkle={sparkle}
              start={Math.min(lay.photoStart * bw, W - ox - sh * 0.5)}
              target={() => touchX()}
              near={0.07 * bh}
              onSnap={() => void takePhoto()}
              onCloser={() => void say(P.closer)}
            />
          </motion.div>

          {/* The camera: viewfinder corners and a flash. */}
          <AnimatePresence>
            {phase === 'photo' && !snapped && <Viewfinder left={baseX - IW * 0.55} top={baseY - IH * 1.02} w={IW * 1.5} h={IH * 1.1} />}
          </AnimatePresence>
        </PlayArea>
      )}

      {flash > 0 && <motion.div key={flash} aria-hidden initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 45, pointerEvents: 'none' }} />}
      <AnimatePresence>{polaroid && <Polaroid lean={lean.get()} />}</AnimatePresence>

      {/* Guess cards / pick cards, then the drop button. */}
      <AnimatePresence>
        {choiceItems.length > 0 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0.45 }} style={{ position: 'absolute', left: `${Math.min(80, Math.max(20, ((ox + lay.choices.x * bw) / Math.max(W, 1)) * 100))}%`, top: `max(calc(var(--top-clear) + 96px), ${lay.choices.y * 100}%)`, translate: '-50% 0', zIndex: 40, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '92vw' }}>
            {choiceItems.map((t) => {
              const on = picking && things.includes(t)
              return (
                <motion.button key={t} aria-label={t} whileTap={{ scale: 0.9 }} onClick={() => (picking ? pickThing(t) : void choose(t))} style={{ width: card, height: card, borderRadius: 26, background: on ? '#FFE27A' : '#FFF7F0', border: `5px solid ${INK}`, boxShadow: 'var(--shadow)', padding: card * 0.12 }}>
                  <img src={IMG[t]} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {ready && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', left: `${Math.min(80, Math.max(20, ((ox + lay.choices.x * bw) / Math.max(W, 1)) * 100))}%`, top: `max(calc(var(--top-clear) + 96px), ${lay.choices.y * 100}%)`, translate: '-50% 0', zIndex: 40 }}>
            <BigButton ariaLabel="Drop" size="xl" color="pink" onClick={() => void drop()}>
              ⬇️ 🫳
            </BigButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The seven bells of the tower. */}
      <AnimatePresence>{bells && <BellRow rung={rung} swing={swing} onRing={(i) => void ring(i)} top={lay.bells} />}</AnimatePresence>

      <AnimatePresence>
        {finish && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', left: '50%', top: 'calc(var(--top-clear) + 8px)', translate: '-50% 0', zIndex: 60 }}>
            <BigButton ariaLabel="Get my stamp" size="xl" onClick={onDone}>
              🗼 ⭐
            </BigButton>
          </motion.div>
        )}
      </AnimatePresence>
      {prompt && !finish && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: landscape ? 'flex-start' : 'center', padding: landscape ? '0 24px 0 max(24px, 3vw)' : '0 24px', zIndex: 50, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <PromptBubble text={prompt.text} speak={prompt.speak} />
          </div>
        </div>
      )}
    </div>
  )
}

/** Something Civetta drops: it hangs under her, then falls. Heavy things fall fast (and together); a feather floats. */
function Falling({ img, size, x, y, ground, go, slow }: { img: string; size: number; x: number; y: number; ground: number; go: boolean; slow: boolean }) {
  const [landed, setLanded] = useState(false)
  return (
    <motion.div
      initial={{ x, y, scale: 0 }}
      animate={go ? (slow ? { x: [x, x - size * 0.6, x + size * 0.5, x - size * 0.3, x + size * 0.2, x], y: [y, ground], rotate: [0, -25, 20, -15, 10, 0], scale: 1 } : { x, y: ground, scale: 1 }) : { x, y: [y, y - 4, y], scale: 1 }}
      transition={go ? (slow ? { duration: 3.5, ease: 'linear' } : { duration: 1.1, ease: [0.55, 0, 1, 0.6] }) : { y: { repeat: Infinity, duration: 0.8 }, scale: { type: 'spring', bounce: 0.5 } }}
      onAnimationComplete={() => go && setLanded(true)}
      style={{ position: 'absolute', left: 0, top: 0, zIndex: 19, pointerEvents: 'none' }}
    >
      <motion.img key={landed ? 'l' : 'a'} src={img} alt="" draggable={false} animate={landed && !slow ? { scaleY: [1, 0.8, 1], scaleX: [1, 1.15, 1] } : {}} transition={{ duration: 0.3 }} style={{ width: size, height: size, translate: '-50% -50%', display: 'block', transformOrigin: '50% 100%' }} />
      {landed && !slow && (
        <motion.div initial={{ scale: 0.3, opacity: 1 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', left: -size * 0.6, top: size * 0.3, width: size * 1.2, height: size * 0.3, borderRadius: '50%', background: '#E7D7B2' }} />
      )}
    </motion.div>
  )
}

/** Sparkle for the photo: she can be dragged sideways toward the tower (or tapped twice to walk there). */
function SparkleDrag(props: { h: number; active: boolean; flip: boolean; sx: MotionValue<number>; sparkle: React.RefObject<PuppetHandle | null>; start: number; target: () => number; near: number; onSnap: () => void; onCloser: () => void }) {
  const { h, active, flip, sx, sparkle, start, target, near, onSnap, onCloser } = props
  const ref = useRef<HTMLDivElement>(null)
  const from = useRef(0)
  const taps = useRef(0)
  const [wasActive, setWasActive] = useState(false)
  // When the photo starts she trots over to the right side of the square.
  useEffect(() => {
    if (active && !wasActive) {
      setWasActive(true)
      void sparkle.current?.play('hop')
      void animate(sx, start, { duration: 0.9, ease: 'easeInOut' })
    }
  }, [active])
  usePointerDrag(ref, {
    disabled: !active,
    threshold: 6,
    onStart: () => {
      from.current = sx.get()
      sounds.pickup()
    },
    onMove: (i) => sx.set(Math.max(target() - near * 0.6, Math.min(start + 20, from.current + i.dx))),
    onEnd: () => {
      if (sx.get() - target() < near) onSnap()
      else onCloser()
    },
    onTap: () => {
      taps.current += 1
      if (taps.current === 1) onCloser()
      else onSnap()
    },
  })
  return (
    <div ref={ref} role={active ? 'button' : undefined} aria-label={active ? 'Sparkle' : undefined} className={active ? 'world-glow' : undefined} style={{ position: 'absolute', left: -h * 0.5, top: -h, width: h, height: h, borderRadius: '40%', touchAction: 'none', cursor: active ? 'grab' : undefined, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
      <SparklePuppet ref={sparkle} height={`${h}px`} flip={flip} lookToward={flip ? 0.6 : -0.6} />
      {active && (
        <motion.div aria-hidden animate={{ x: [0, -24, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} style={{ position: 'absolute', left: -h * 0.1, top: h * 0.3, fontSize: Math.max(32, h * 0.18), color: INK, fontWeight: 700, pointerEvents: 'none' }}>
          ⬅
        </motion.div>
      )}
    </div>
  )
}

/** Camera viewfinder corners around the tower. */
function Viewfinder({ left, top, w, h }: { left: number; top: number; w: number; h: number }) {
  const c = Math.min(w, h) * 0.12
  const s = { position: 'absolute' as const, width: c, height: c, borderColor: '#fff', borderStyle: 'solid', filter: `drop-shadow(0 0 2px ${INK})` }
  return (
    <motion.div aria-hidden initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', left, top, width: w, height: h, zIndex: 30, pointerEvents: 'none' }}>
      <div style={{ ...s, left: 0, top: 0, borderWidth: '8px 0 0 8px' }} />
      <div style={{ ...s, right: 0, top: 0, borderWidth: '8px 8px 0 0' }} />
      <div style={{ ...s, left: 0, bottom: 0, borderWidth: '0 0 8px 8px' }} />
      <div style={{ ...s, right: 0, bottom: 0, borderWidth: '0 8px 8px 0' }} />
      <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ position: 'absolute', right: c * 0.4, top: c * 0.4, width: 22, height: 22, borderRadius: '50%', background: '#E8574F', border: '3px solid #fff' }} />
    </motion.div>
  )
}

/** The photo pops up like an instant picture: the tower, and Sparkle holding it up. */
function Polaroid({ lean }: { lean: number }) {
  const w = 'min(46vw, 40vh, 340px)'
  return (
    <motion.div
      initial={{ scale: 0.2, rotate: -20, opacity: 0 }}
      animate={{ scale: 1, rotate: -4, opacity: 1 }}
      exit={{ scale: 0.15, x: '30vw', y: '-40vh', opacity: 0 }}
      transition={{ type: 'spring', bounce: 0.4 }}
      style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%', width: w, background: '#FFF7F0', border: `5px solid ${INK}`, borderRadius: 14, padding: '4% 4% 16%', boxShadow: 'var(--shadow)', zIndex: 46 }}
    >
      <div style={{ position: 'relative', aspectRatio: '1', background: '#7FD0F6', borderRadius: 6, overflow: 'hidden', border: `3px solid ${INK}` }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '22%', background: '#7CC043', borderTop: `3px solid ${INK}` }} />
        <img src={art.towerPisa} alt="" style={{ position: 'absolute', left: '22%', bottom: '14%', height: '82%', rotate: `${lean}deg`, transformOrigin: '50% 97.7%' }} />
        <div style={{ position: 'absolute', right: '4%', bottom: '8%' }}>
          <SparklePuppet height="min(20vw, 17vh, 150px)" lookToward={-0.6} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: '3%', textAlign: 'center', fontSize: 'clamp(20px, 3.4vmin, 30px)' }}>📸 💖</div>
    </motion.div>
  )
}

/** Seven bells hanging from a wooden beam, big to small (low do to high ti). The next one to ring glows. */
function BellRow({ rung, swing, onRing, top }: { rung: number; swing: number[]; onRing: (i: number) => void; top: number }) {
  const colors = ['#FFC83D', '#FFD45E', '#FFC83D', '#FFD45E', '#FFC83D', '#FFD45E', '#FFC83D']
  return (
    <motion.div
      initial={{ y: '-60vh' }}
      animate={{ y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.9 }}
      style={{ position: 'absolute', left: '50%', top: `${top * 100}%`, translate: '-50% -50%', zIndex: 35, width: 'min(96vw, 960px)', display: 'flex', flexDirection: 'column', alignItems: 'stretch', background: 'rgba(255,247,240,.88)', border: `5px solid ${INK}`, borderRadius: 28, padding: '14px 8px 10px', boxShadow: 'var(--shadow)' }}
    >
      <div style={{ height: 22, background: '#C98B5B', border: `5px solid ${INK}`, borderRadius: 12, margin: '0 2%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start' }}>
        {SCALE.map((_, i) => {
          const s = `calc(min(13vw, 17vh, 128px) * ${1.1 - i * 0.06})`
          return (
            <button key={i} aria-label={`Bell ${i + 1}`} onClick={() => onRing(i)} style={{ background: 'none', border: 'none', padding: 0, width: 'max(88px, min(13vw, 17vh, 128px))', minHeight: 110, display: 'flex', justifyContent: 'center' }}>
              <motion.div key={swing[i]} initial={false} animate={swing[i] ? { rotate: [0, 22, -18, 12, -6, 0] } : {}} transition={{ duration: 1.1 }} style={{ transformOrigin: '50% 0%', width: s, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 6, height: 14, background: INK }} />
                <div className={i === rung && rung < 7 ? 'world-glow' : undefined} style={{ borderRadius: '50% 50% 18% 18%', width: '100%' }}>
                  <svg viewBox="-50 -50 100 100" style={{ width: '100%', display: 'block', overflow: 'visible' }}>
                    <path d="M-30 -10 Q-30 -46 0 -46 Q30 -46 30 -10 L36 26 Q42 34 44 36 L-44 36 Q-42 34 -36 26Z" fill={i < rung ? colors[i] : '#E9CFA8'} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
                    <path d="M-38 24 L38 24" stroke={INK} strokeWidth="4" opacity="0.4" />
                    <circle cx="0" cy="44" r="9" fill="#A86F45" stroke={INK} strokeWidth="5" />
                    <ellipse cx="-14" cy="-24" rx="6" ry="10" fill="#fff" opacity="0.6" />
                  </svg>
                </div>
                <div style={{ fontSize: 'clamp(16px, 2.4vmin, 22px)', fontWeight: 700, color: INK, marginTop: 4, textShadow: '0 0 6px #fff' }}>{['do', 're', 'mi', 'fa', 'sol', 'la', 'ti'][i]}</div>
              </motion.div>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

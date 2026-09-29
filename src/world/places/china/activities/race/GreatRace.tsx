// 🐭 The Great Race (the Chinese zodiac). The Jade Emperor's race across a river: animals start on the near bank and
// cross to the far bank, and Kaylee helps each one in the way that fits it: Mouse rides on Ox's back (drag Mouse on,
// then tap Ox to paddle), Tiger swims by himself, Rabbit hops over stepping stones she drops into the glowing spots, and
// Dragon (late, because it stopped to make rain) flies once she taps the clouds and the thirsty flowers drink. Then the
// winners' steps (first ... fifth, and "who came right after Ox?"), a zodiac wheel that fills in with all twelve animals,
// her own zodiac year, this year's horse galloping past, and the sleepy cat who missed the race.
import { motion } from 'motion/react'
import { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react'
import { burst, Buddy, Piece, PlayArea, say, shuffle, sounds, Target, useAlive, useElementSize, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { sfx } from '../../../../kit/sfx'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'
import { Mouse } from '../../puppets/Mouse'
import type { ActivityProps } from '../../Place'
import { Flower, pic, Rain, Splash, Wheel } from './bits'

const R = L.race
const TOTAL = 6

/**
 * Kaylee's zodiac animal. She was born in 2021: on or after Chinese New Year (12 Feb 2021) that is the Year of the Ox
 * ('ox'); before it, the Year of the Rat ('mouse'). The lead confirms the date with Dad, so this is the ONE place to change.
 */
export const KAYLEE_ZODIAC: 'ox' | 'mouse' = 'ox'

type Id = 'mouse' | 'ox' | 'tiger' | 'rabbit' | 'dragon'
const ORDER: Id[] = ['mouse', 'ox', 'tiger', 'rabbit', 'dragon']
const NAME: Record<Id, string> = { mouse: 'Mouse', ox: 'Ox', tiger: 'Tiger', rabbit: 'Rabbit', dragon: 'Dragon' }
const VOICE: Record<Id, string> = { mouse: 'mouse', ox: 'ox', tiger: 'tiger', rabbit: 'rabbit', dragon: 'dragon' }
const EMOJI: Record<Id, string> = { mouse: '🐭', ox: '🐂', tiger: '🐯', rabbit: '🐰', dragon: '🐲' }
/** How tall each animal is (in units of the play size) when it stands on the near bank. Far away they shrink. */
const BASE: Record<Id, number> = { mouse: 0.19, ox: 0.31, tiger: 0.26, rabbit: 0.27, dragon: 0.32 }
const ORD = ['1st', '2nd', '3rd', '4th', '5th']
const STEP_COLORS = ['#FFC83D', '#FF8FB8', '#7CCBA2', '#B9A6F5', '#FFC2A8']
const STEP_H = [0.26, 0.2, 0.15, 0.115, 0.09]

// Where things stand, as fractions of the screen (the river runs across the middle of the picture).
const NEAR = 0.86
const FAR_X: Record<Id, number> = { mouse: 0.18, ox: 0.34, tiger: 0.5, rabbit: 0.66, dragon: 0.83 }
/** Paths across the river. The picture is different in landscape and portrait, so the far bank and the stones move with it. */
const geo = (far: number, oxYs: number[], tigerYs: number[], spotYs: number[]) => ({
  FAR: far,
  OX: [0.64, 0.57, 0.5, 0.42, FAR_X.ox].map((x, i) => ({ x, y: i === 0 ? NEAR : i === 4 ? far : oxYs[i - 1] })),
  TIGER: [0.3, 0.36, 0.43, FAR_X.tiger].map((x, i) => ({ x, y: i === 0 ? NEAR : i === 3 ? far : tigerYs[i - 1] })),
  SPOTS: [0.6, 0.72, 0.58].map((x, i) => ({ x, y: spotYs[i] })),
})
const GEO = {
  land: geo(0.45, [0.76, 0.66, 0.56], [0.72, 0.58], [0.73, 0.62, 0.52]),
  tall: geo(0.36, [0.74, 0.62, 0.5], [0.7, 0.53], [0.6, 0.51, 0.43]),
}
const RABBIT_START = { x: 0.76, y: NEAR }
const CLOUD_X = [0.22, 0.5, 0.78]

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const scaleAt = (y: number, far: number) => 0.52 + 0.48 * clamp((y - far) / (NEAR - far), 0, 1)

interface Pos {
  x: number
  y: number
  ms: number
  show: boolean
  /** Fraction of its height hidden under the water (swimming). */
  clip: number
}
const at = (x: number, y: number, show = false): Pos => ({ x, y, ms: 0, show, clip: 0 })

/** One animal, drawn as its puppet (Mouse) or a sprite Buddy. */
const Critter = forwardRef<PuppetHandle, { id: Id; height: string; riding?: boolean; calm?: boolean }>(function Critter({ id, height, riding, calm }, ref) {
  if (id === 'mouse') return <Mouse ref={ref} height={height} riding={riding} />
  return <Buddy ref={ref} img={pic(id, EMOJI[id])} voice={VOICE[id]} height={height} calm={calm} />
})

type Phase = 'story' | 'board' | 'paddle' | 'tiger' | 'stones' | 'rain' | 'steps' | 'wheel' | 'cat'

export function GreatRace({ onDone, setProgress }: ActivityProps) {
  const box = useRef<HTMLDivElement>(null)
  const { width: W, height: H } = useElementSize(box)
  const alive = useAlive()
  const land = W > H
  const G = land ? GEO.land : GEO.tall
  const sc = (y: number) => scaleAt(y, G.FAR)
  const U = Math.max(200, Math.min(H, W * 0.8))
  const size = useRef({ W: 0, H: 0, U: 0 })
  size.current = { W, H, U }

  const hs = useRef<Partial<Record<Id | 'horse' | 'cat' | 'center', PuppetHandle | null>>>({})
  const setH = (k: Id | 'horse' | 'cat' | 'center') => (h: PuppetHandle | null) => {
    hs.current[k] = h
  }
  const phaseRef = useRef<Phase>('story')
  const [phase, setPhaseState] = useState<Phase>('story')
  const setPhase = (p: Phase) => {
    phaseRef.current = p
    setPhaseState(p)
  }
  const [prompt, setPrompt] = useState<Line>(R.mouseHelp)
  const speak = async (l: Line) => {
    setPrompt(l)
    await say(l)
  }
  const nudge = useRef<ReturnType<typeof setTimeout>>(undefined)
  const armNudge = (fn: () => void, ms = 9000) => {
    clearTimeout(nudge.current)
    nudge.current = setTimeout(() => alive() && fn(), ms)
  }
  useEffect(() => () => clearTimeout(nudge.current), [])

  const [pos, setPos] = useState<Record<Id, Pos>>({
    mouse: at(0.2, NEAR),
    ox: at(0.66, 0.84),
    tiger: at(G.TIGER[0].x, NEAR),
    rabbit: at(RABBIT_START.x, RABBIT_START.y),
    dragon: at(-0.2, 0.7),
  })
  const posRef = useRef(pos)
  posRef.current = pos
  const mv = (id: Id, p: Partial<Pos>) =>
    setPos((s) => {
      const n = { ...s, [id]: { ...s[id], ...p } }
      posRef.current = n
      return n
    })
  const [fx, setFx] = useState<{ n: number; kind: 'splash' | 'puff'; x: number; y: number }[]>([])
  const fxN = useRef(0)
  const addFx = (kind: 'splash' | 'puff', x: number, y: number) => {
    const n = fxN.current++
    setFx((f) => [...f, { n, kind, x, y }])
    setTimeout(() => setFx((f) => f.filter((e) => e.n !== n)), 1100)
  }

  // ---- Mouse and Ox ----
  const [boarded, setBoarded] = useState(false)
  const [strokes, setStrokes] = useState(0)
  const [misses, setMisses] = useState(0)
  const strokesRef = useRef(0)
  const [swimGroup, setSwimGroup] = useState<'ox' | 'tiger' | null>(null)
  /** Mouse's feet sit on Ox's back. */
  const ridePos = (ox: { x: number; y: number }) => {
    const { H: hh, U: uu } = size.current
    const oxH = Math.max(150, BASE.ox * uu) * sc(ox.y)
    return { x: ox.x - 0.03, y: ox.y - (oxH * 0.6) / hh }
  }

  const boardOx = (drop?: { x: number; y: number }) => {
    if (phaseRef.current !== 'board') return
    setPhase('paddle')
    clearTimeout(nudge.current)
    const { H: hh } = size.current
    if (drop) mv('mouse', { x: drop.x, y: drop.y + (mouseH() * sc(NEAR)) / 2 / hh, ms: 0 })
    setBoarded(true)
    sounds.place()
    void (async () => {
      await wait(30)
      const oxp = posRef.current.ox
      const rp = ridePos(oxp)
      mv('mouse', { x: rp.x, y: rp.y, ms: 480 })
      void hs.current.mouse?.play('hop')
      await wait(500)
      if (!alive()) return
      sfx.thump()
      addFx('puff', oxp.x, oxp.y - 0.1)
      void hs.current.ox?.play('nod')
      await say(R.oxHi)
      if (!alive()) return
      await speak(R.paddle)
      armNudge(() => void speak(R.paddle))
    })()
  }
  const mouseH = () => Math.max(96, BASE.mouse * size.current.U)

  const paddle = () => {
    if (phaseRef.current === 'board') {
      sounds.pop()
      void hs.current.ox?.play('nod')
      void say(R.oxTap)
      return
    }
    if (phaseRef.current !== 'paddle' || strokesRef.current >= 4) return
    const k = ++strokesRef.current
    setStrokes(k)
    clearTimeout(nudge.current)
    const p = G.OX[k]
    sfx.splash()
    sounds.note(k * 2)
    mv('ox', { x: p.x, y: p.y, ms: 700, clip: k < 4 ? 0.24 : 0 })
    const rp = ridePos(p)
    if (k < 4) mv('mouse', { x: rp.x, y: rp.y, ms: 700 })
    void hs.current.ox?.play('nod')
    void hs.current.mouse?.play('ride')
    addFx('splash', p.x, p.y - 0.02)
    if (k === 2) void say(R.oxHalf, { interrupt: false })
    if (k === 4) void arriveOx()
    else armNudge(() => void speak(R.paddle))
  }

  const arriveOx = async () => {
    setPhase('tiger')
    await wait(800)
    if (!alive()) return
    void speak(R.jumpOff)
    setBoarded(false)
    mv('mouse', { x: FAR_X.mouse, y: G.FAR, ms: 800 })
    void hs.current.mouse?.play('hop')
    sfx.boing()
    await wait(700)
    sfx.thump()
    addFx('puff', FAR_X.mouse, G.FAR)
    await wait(300)
    void hs.current.mouse?.play('cheer')
    sounds.fanfare()
    burst()
    await speak(R.mouseWin)
    if (!alive()) return
    await speak(R.oxWell)
    setProgress(1, TOTAL)
    if (alive()) await startTiger()
  }

  // ---- Tiger swims by himself ----
  const startTiger = async () => {
    mv('tiger', { show: true, ms: 0 })
    setSwimGroup('tiger')
    void speak(R.tigerSwim)
    await wait(700)
    for (let i = 1; i < G.TIGER.length; i++) {
      if (!alive()) return
      const p = G.TIGER[i]
      sfx.splash()
      sounds.note(i * 2)
      mv('tiger', { x: p.x, y: p.y, ms: 850, clip: i < G.TIGER.length - 1 ? 0.22 : 0 })
      addFx('splash', p.x, p.y - 0.02)
      await wait(900)
    }
    setSwimGroup(null)
    void hs.current.tiger?.play('cheer')
    await speak(R.tigerLine)
    if (alive()) await startStones()
  }

  // ---- Rabbit and the stepping stones ----
  const [tray, setTray] = useState<number[]>([])
  const [filled, setFilled] = useState<boolean[]>([false, false, false])
  const filledRef = useRef<boolean[]>([false, false, false])
  const [spotHint, setSpotHint] = useState(false)
  
  const ssz = () => clamp(size.current.U * 0.125, 92, 130)
  const startStones = async () => {
    setPhase('stones')
    setTray([0, 1, 2])
    mv('rabbit', { show: true, ms: 0 })

    void hs.current.rabbit?.play('jump')
    await speak(R.stonesHelp)
    armNudge(() => {
      setSpotHint(true)
      void speak(R.stonesHint)
    })
  }
  const placeStone = (stone: number, spot: number) => {
    if (filledRef.current[spot]) return false
    filledRef.current = filledRef.current.map((f, i) => f || i === spot)
    setFilled(filledRef.current)
    setTray((t) => t.filter((s) => s !== stone))
    setSpotHint(false)
    clearTimeout(nudge.current)
    sfx.splash()
    sounds.correct()
    addFx('splash', G.SPOTS[spot].x, G.SPOTS[spot].y)
    void hs.current.rabbit?.play('nod')
    if (filledRef.current.every(Boolean)) void hopAcross()
    else
      armNudge(() => {
        setSpotHint(true)
        void speak(R.stonesHint)
      })
    return true
  }
  const nextSpot = () => filledRef.current.findIndex((f) => !f)
  const hopAcross = async () => {
    setPhase('rain')
    await wait(500)
    void say(R.rabbitHop)
    for (const s of [...G.SPOTS, { x: FAR_X.rabbit, y: G.FAR }]) {
      if (!alive()) return
      mv('rabbit', { x: s.x, y: s.y + 0.012, ms: 620 })
      void hs.current.rabbit?.play('jump')
      sfx.boing()
      await wait(640)
      sfx.thump()
      addFx(s.y === G.FAR ? 'puff' : 'splash', s.x, s.y)
    }
    sounds.sparkle()
    void hs.current.rabbit?.play('cheer')
    burst()
    setProgress(2, TOTAL)
    await wait(900)
    if (alive()) await startRain()
  }

  // ---- Dragon and the rain ----
  const [rained, setRained] = useState<boolean[]>([false, false, false])
  const rainedRef = useRef<boolean[]>([false, false, false])
  const [cloudsIn, setCloudsIn] = useState(false)
  const [cloudHint, setCloudHint] = useState(false)
  const [rainFx, setRainFx] = useState<number[]>([])
  const [rainSet, setRainSet] = useState(false)
  const startRain = async () => {
    setRainSet(true)
    mv('dragon', { x: -0.2, y: 0.7, show: true, ms: 0 })
    await wait(60)
    mv('dragon', { x: 0.5, y: 0.7, ms: 1400 })
    sounds.whoosh()
    setCloudsIn(true)
    await wait(1300)
    if (!alive()) return
    await speak(R.dragonLate)
    if (!alive()) return
    await speak(R.rainHelp)
    armNudge(() => {
      setCloudHint(true)
      void speak(R.rainHint)
    })
  }
  const tapCloud = (i: number) => {
    if (phaseRef.current !== 'rain' || !cloudsIn || rainedRef.current[i]) return
    rainedRef.current = rainedRef.current.map((r, j) => r || j === i)
    setRained(rainedRef.current)
    setRainFx((r) => [...r, i])
    setCloudHint(false)
    clearTimeout(nudge.current)
    sounds.pop()
    sounds.note(i * 3)
    void hs.current.dragon?.play('nod')
    if (rainedRef.current.every(Boolean)) void flyDragon()
    else
      armNudge(() => {
        setCloudHint(true)
        void speak(R.rainHint)
      })
  }
  const flyDragon = async () => {
    setPhase('steps')
    await wait(1200)
    if (!alive()) return
    sounds.sparkle()
    void speak(R.rainDone)
    await wait(1800)
    if (!alive()) return
    void say(R.dragonFly, { interrupt: false })
    sounds.whoosh()
    mv('dragon', { x: FAR_X.dragon, y: G.FAR, ms: 2200 })
    void hs.current.dragon?.play('cheer')
    await wait(2300)
    sounds.fanfare()
    burst()
    setProgress(3, TOTAL)
    await wait(600)
    if (alive()) void startSteps()
  }

  // ---- The winners' steps ----
  const [stepsOn, setStepsOn] = useState(false)
  const [placed, setPlaced] = useState<(Id | null)[]>([null, null, null, null, null])
  const [q, setQ] = useState(0)
  const qRef = useRef(0)
  const [trayIds, setTrayIds] = useState<Id[]>([])
  const [glowId, setGlowId] = useState<Id | null>(null)
  const [glowStep, setGlowStep] = useState<number | null>(null)
  const [hidden, setHidden] = useState<Id[]>([])
  const [shake, setShake] = useState<{ id: Id; n: number } | null>(null)
  const wrongs = useRef(0)
  const stepsRef = useRef(false)
  const startSteps = async () => {
    setStepsOn(true)
    setTrayIds(shuffle(['mouse', 'ox', 'tiger'] as Id[]))
    for (const id of ORDER) mv(id, { show: false, ms: 300 })
    await wait(500)
    await speak(R.ask[0])
    stepsRef.current = true
    armNudge(hintStep)
  }
  const askNext = async (next: number) => {
    qRef.current = next
    setQ(next)
    wrongs.current = 0
    setHidden([])
    setGlowId(null)
    setGlowStep(null)
    if (next === 3) {
      setTrayIds(shuffle(['rabbit', 'dragon'] as Id[]))
      await wait(500)
      await speak(R.ask[3])
    } else if (next <= 4) {
      await speak(R.ask[next])
    } else {
      await speak(R.askAfter)
    }
    armNudge(hintStep)
  }
  const hintStep = () => {
    const k = qRef.current
    if (k <= 4) {
      setGlowId(ORDER[k])
      setGlowStep(k)
      void speak(R.hintOrder[k])
    } else {
      setGlowId('tiger')
      void speak(R.afterHint)
    }
  }
  const wrong = (id: Id) => {
    wrongs.current++
    sounds.oops()
    setShake({ id, n: Math.random() })
    void hs.current[id]?.play('wiggle')
    const k = qRef.current
    if (k <= 4) {
      setGlowId(ORDER[k])
      setGlowStep(k)
      if (wrongs.current >= 2) setHidden(trayIds.filter((t) => t !== ORDER[k]))
      void speak(R.hintOrder[k])
    } else {
      setGlowId('tiger')
      void speak(R.afterHint)
    }
    armNudge(() => void say(R.tryGlow), 11000)
  }
  const tryPlace = (id: Id, step: number | null) => {
    const k = qRef.current
    if (k > 4 || !stepsRef.current) return false
    if (step === null) {
      // Let go on nothing: it floats back. A gentle pulse shows where the steps are.
      setGlowStep(k)
      setTimeout(() => setGlowStep(null), 1600)
      return false
    }
    if (id !== ORDER[k] || step !== k) {
      wrong(id)
      return false
    }
    clearTimeout(nudge.current)
    sounds.correct()
    burst()
    setPlaced((p) => p.map((v, i) => (i === k ? id : v)))
    setTrayIds((t) => t.filter((x) => x !== id))
    setGlowId(null)
    setGlowStep(null)
    setHidden([])
    void (async () => {
      await wait(50)
      void hs.current[id]?.play('cheer')
      await speak(R.placed[k])
      if (!alive()) return
      if (k === 2) {
        setProgress(4, TOTAL)
        await wait(300)
        await askNext(3)
      } else if (k === 4) {
        await wait(200)
        await askNext(5)
      } else await askNext(k + 1)
    })()
    return true
  }
  const tryAfter = (id: Id) => {
    if (qRef.current !== 5 || !stepsRef.current) return
    if (id !== 'tiger') return wrong(id)
    stepsRef.current = false
    clearTimeout(nudge.current)
    sounds.correct()
    setGlowId(null)
    void hs.current.tiger?.play('cheer')
    void (async () => {
      await speak(R.afterYes)
      if (!alive()) return
      setProgress(5, TOTAL)
      sounds.fanfare()
      burst()
      for (const id2 of ORDER) void hs.current[id2]?.play('cheer')
      await speak(R.winners)
      await wait(400)
      if (alive()) void startWheel()
    })()
  }

  // ---- The zodiac wheel, her year, this year's horse, and the sleepy cat ----
  const [wheelOn, setWheelOn] = useState(false)
  const [count, setCount] = useState(0)
  const [glow, setGlow] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [horse, setHorse] = useState(false)
  const [catOn, setCatOn] = useState(false)
  const [catAwake, setCatAwake] = useState(false)
  const done = useRef(false)
  const startWheel = async () => {
    setPhase('wheel')
    setStepsOn(false)
    setWheelOn(true)
    void speak(R.wheel)
    await wait(500)
    for (let i = 1; i <= 12; i++) {
      if (!alive()) return
      setCount(i)
      sounds.note((i - 1) % 11)
      await wait(300)
    }
    await wait(500)
    if (!alive()) return
    sounds.fanfare()
    burst()
    setRevealed(true)
    setGlow([KAYLEE_ZODIAC])
    await wait(200)
    void hs.current.center?.play('cheer')
    await speak(R.reveal[KAYLEE_ZODIAC])
    if (!alive()) return
    await speak(KAYLEE_ZODIAC === 'ox' ? R.revealOx : R.revealMouse)
    setProgress(6, TOTAL)
    await wait(300)
    if (!alive()) return
    setGlow(['horse'])
    void speak(R.year)
    await wait(1400)
    setHorse(true)
    sounds.whoosh()
    for (let i = 0; i < 8; i++) {
      sfx.thump()
      if (i % 2 === 0) void hs.current.horse?.play('jump')
      await wait(360)
    }
    setHorse(false)
    burst()
    await wait(600)
    if (!alive()) return
    setGlow([])
    setPhase('cat')
    setCatOn(true)
    await speak(R.catAsk)
    armNudge(() => void say(R.catAsk), 10000)
  }
  const tapCat = async () => {
    if (catAwake || phaseRef.current !== 'cat') return
    setCatAwake(true)
    clearTimeout(nudge.current)
    sounds.pop()
    void hs.current.cat?.play('cheer')
    await speak(R.catFact)
    await wait(600)
    if (alive() && !done.current) {
      done.current = true
      onDone()
    }
  }

  // ---- Start ----
  const [story, setStory] = useState(true)
  useEffect(() => {
    if (story || W === 0) return
    setPhase('board')
    setProgress(0, TOTAL)
    mv('mouse', { show: true, ms: 0 })
    mv('ox', { show: true, ms: 0 })
    void hs.current.mouse?.play('hop')
    void speak(R.mouseHelp)
    armNudge(() => {
      setMisses(2)
      void speak(R.mouseHint)
    })
  }, [story, W === 0])

  const bg = land ? pic('bgRace', '🌊') : pic('bgRaceTall', '🌊')
  const oxH = Math.max(150, BASE.ox * U)
  const hOf = (id: Id) => (id === 'mouse' ? mouseH() : Math.max(id === 'ox' || id === 'dragon' ? 150 : 120, BASE[id] * U))
  const th = clamp(U * 0.17, 96, 150)
  const ss = ssz()

  /** A positioned animal on the banks or in the river. */
  const actor = (id: Id, children: ReactNode, extra?: { z?: number }) => {
    const p = pos[id]
    const h = hOf(id) * sc(p.y)
    return (
      <div
        key={id}
        style={{
          position: 'absolute',
          left: `${p.x * 100}%`,
          top: `${p.y * 100}%`,
          height: h,
          transform: 'translate(-50%,-100%)',
          opacity: p.show ? 1 : 0,
          zIndex: extra?.z ?? Math.round(p.y * 100),
          transition: `left ${p.ms}ms cubic-bezier(.4,0,.3,1), top ${p.ms}ms cubic-bezier(.4,0,.3,1), height ${p.ms}ms ease, opacity .35s, clip-path ${p.ms}ms`,
          clipPath: `inset(-150% -60% ${p.clip * 100}% -60%)`,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        {children}
      </div>
    )
  }
  const ripple = (id: Id) =>
    pos[id].clip > 0 && (
    <motion.div animate={{ scaleX: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 1.1 }} style={{ position: 'absolute', left: '-12%', right: '-12%', bottom: `${(pos[id].clip * 100 - 8).toFixed(0)}%`, height: '16%', borderRadius: '50%', background: 'rgba(255,255,255,.55)', border: '3px solid rgba(255,255,255,.9)', pointerEvents: 'none' }} />
    )
  const oxBtn = phase === 'paddle' || phase === 'board'
  const stepIds = [0, 1, 2, 3, 4].filter((k) => k < 3 || q >= 3).map((k) => `step-${k}`)

  // Winners' steps layout.
  const sw = clamp(Math.min((W - 30) / 5.15, U * 0.4), 56, 230)
  const ah = clamp(sw * 1.15, 80, U * 0.24)
  const trayH = th + 30
  const wsize = H < 560 ? clamp(H - 70, 200, 320) : clamp(Math.min(W * 0.86, H - (land ? 330 : 470)), 200, 760)

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'clip', background: '#BFE3F5', touchAction: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: `url(${bg}) center / cover` }} />
      {W > 0 && (
        <PlayArea style={{ position: 'absolute', inset: 0 }}>
          <Ambient U={U} />

          {/* Far bank fans and the river's stepping stones */}
          {G.SPOTS.map((s, i) => (
            <div key={i} style={{ position: 'absolute', left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: ss * 1.1, height: ss * 0.75, transform: 'translate(-50%,-50%)', zIndex: 20, pointerEvents: 'none' }}>
              {filled[i] ? (
                <motion.img initial={{ scale: 0.3, y: -20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 12 }} src={pic('stone', '🪨')} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                phase === 'stones' && (
                  <Target id={`spot-${i}`} hint={spotHint} style={{ width: '100%', height: '100%', borderRadius: '50%', border: '5px dashed #fff', background: 'rgba(255,255,255,.35)', display: 'grid', placeItems: 'center' }}>
                    <motion.div animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 1.3, delay: i * 0.2 }} style={{ width: '46%', height: '46%', borderRadius: '50%', background: '#FFE9A0', boxShadow: '0 0 18px 6px #FFE9A0' }} />
                  </Target>
                )
              )}
            </div>
          ))}

          {/* Thirsty flowers on the near bank */}
          {rainSet && (
            <div style={{ position: 'absolute', left: 0, right: 0, top: `${0.86 * 100}%`, zIndex: 70, pointerEvents: 'none' }}>
              {CLOUD_X.map((x, i) => (
                <div key={i} style={{ position: 'absolute', left: `${x * 100}%`, top: 0, transform: 'translate(-50%,-30%)', opacity: phase === 'rain' || phase === 'steps' ? 1 : 0, transition: 'opacity .5s' }}>
                  <Flower wilted={!rained[i]} size={clamp(U * 0.1, 60, 100)} />
                </div>
              ))}
            </div>
          )}

          {/* Mouse and Ox share the ripples and bob together while swimming */}
          <motion.div animate={swimGroup === 'ox' || strokes > 0 ? { y: [0, -6, 0] } : { y: 0 }} transition={{ repeat: Infinity, duration: 0.95 }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {actor(
              'ox',
              <div style={{ position: 'relative', height: '100%', pointerEvents: 'none', display: 'flex', alignItems: 'flex-end' }}>
                <Buddy ref={setH('ox')} img={pic('ox', '🐂')} voice="ox" height="100%" />
                {ripple('ox')}
                {phase === 'board' && (
                  <Target id="ox" hint={misses >= 2} style={{ position: 'absolute', left: '-12%', right: '-12%', top: '-18%', bottom: 0, borderRadius: 40, pointerEvents: 'none' }} />
                )}
                {oxBtn && (
                  <button
                    type="button"
                    aria-label="Ox"
                    className={phase === 'paddle' ? 'world-glow' : undefined}
                    onClick={paddle}
                    style={{ position: 'absolute', inset: '-4% -8% 0 -8%', background: 'rgba(255,255,255,0.01)', border: 'none', borderRadius: 40, pointerEvents: 'auto', touchAction: 'manipulation' }}
                  />
                )}
              </div>,
            )}
          </motion.div>

          {/* Tiger swims by himself */}
          <motion.div animate={swimGroup === 'tiger' ? { y: [0, -6, 0] } : { y: 0 }} transition={{ repeat: Infinity, duration: 0.85 }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {actor(
              'tiger',
              <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                <Buddy ref={setH('tiger')} img={pic('tiger', '🐯')} voice="tiger" height="100%" />
                {ripple('tiger')}
              </div>,
            )}
          </motion.div>

          {/* Rabbit */}
          {actor(
            'rabbit',
            <Buddy ref={setH('rabbit')} img={pic('rabbit', '🐰')} voice="rabbit" height="100%" />,
          )}

          {/* Dragon floats */}
          {actor(
            'dragon',
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }} style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}>
              <Buddy ref={setH('dragon')} img={pic('dragon', '🐲')} voice="dragon" height="100%" />
            </motion.div>,
          )}

          {/* Mouse: a piece to drag at first, then riding, then standing on the far bank */}
          {actor(
            'mouse',
            !boarded && phase === 'board' ? (
              <Piece
                id="mouse-piece"
                snapTo="ox"
                snapRadius={oxH * 0.7}
                label="Mouse"
                style={{ height: '100%', pointerEvents: 'auto' }}
                onTap={() => boardOx()}
                onPlace={(d) => {
                  if (d.target === 'ox') {
                    boardOx(d)
                    return 'reset'
                  }
                  setMisses((m) => m + 1)
                  sounds.oops()
                  void hs.current.mouse?.play('shake')
                  if (misses >= 1) void speak(R.mouseHint)
                  return 'home'
                }}
              >
                <button type="button" aria-label="Mouse" style={{ height: '100%', background: 'none', border: 'none', padding: 0, display: 'block', touchAction: 'none' }}>
                  <Mouse ref={setH('mouse')} height="100%" />
                </button>
              </Piece>
            ) : (
              <button
                type="button"
                aria-label="Mouse"
                onClick={() => {
                  sounds.pop()
                  void hs.current.mouse?.play('wiggle')
                  void say(R.tap[Math.floor(Math.random() * 2)])
                }}
                style={{ height: '100%', background: 'none', border: 'none', padding: 0, display: 'block', pointerEvents: stepsOn || wheelOn || boarded ? 'none' : 'auto' }}
              >
                <Mouse ref={setH('mouse')} height="100%" riding={boarded} />
              </button>
            ),
            { z: boarded ? 95 : undefined },
          )}

          {/* Stones to carry */}
          {phase === 'stones' && (
            <div style={{ position: 'absolute', left: '4%', bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', gap: 'min(20px, 3vw)', zIndex: 80 }}>
              {tray.map((s) => (
                <motion.div key={s} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
                  <Piece
                    id={`stone-${s}`}
                    snapTo={[0, 1, 2].filter((i) => !filled[i]).map((i) => `spot-${i}`)}
                    snapRadius={ss * 0.9}
                    label="stone"
                    onTap={() => {
                      const n = nextSpot()
                      if (n >= 0) placeStone(s, n)
                    }}
                    onPlace={({ target }) => {
                      if (target?.startsWith('spot-') && placeStone(s, Number(target.slice(5)))) return 'reset'
                      setSpotHint(true)
                      void hs.current.rabbit?.play('wiggle')
                      return 'home'
                    }}
                  >
                    <button type="button" aria-label="stone" style={{ background: 'none', border: 'none', padding: 0, display: 'block', touchAction: 'none' }}>
                      <img src={pic('stone', '🪨')} alt="" draggable={false} style={{ width: ss, height: ss * 0.8, objectFit: 'contain', display: 'block' }} />
                    </button>
                  </Piece>
                </motion.div>
              ))}
            </div>
          )}

          {/* Rain clouds */}
          {rainSet &&
            CLOUD_X.map((x, i) => {
              const cs = clamp(U * 0.23, 96, 190)
              const top = H < 560 ? 62 : 108
              const cy = (top + cs * 0.45) / H
              return (
                <div key={i}>
                  {rainFx.includes(i) && <Rain x={x} y0={cy + 0.04} y1={NEAR - 0.03} u={U} />}
                  <motion.button
                    type="button"
                    aria-label="rain cloud"
                    initial={{ y: -80, opacity: 0 }}
                    animate={cloudsIn ? { y: 0, opacity: phase === 'steps' ? 0 : 1, scale: cloudHint && !rained[i] ? [1, 1.12, 1] : 1 } : {}}
                    transition={cloudHint && !rained[i] ? { repeat: Infinity, duration: 0.9 } : { type: 'spring', bounce: 0.4, delay: i * 0.15 }}
                    onClick={() => tapCloud(i)}
                    className={!rained[i] && cloudsIn ? 'world-glow' : undefined}
                    style={{ position: 'absolute', left: `${x * 100}%`, top: cy * H, width: cs, height: cs * 0.7, transform: 'translate(-50%,-50%)', background: 'none', border: 'none', padding: 0, zIndex: 75, touchAction: 'manipulation', borderRadius: 40 }}
                  >
                    <img src={pic('rainCloud', '☁️')} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: rained[i] ? 'grayscale(.5) brightness(.85)' : undefined }} />
                  </motion.button>
                </div>
              )
            })}

          {fx.map((e) => (
            <Splash key={e.n} x={e.x} y={e.y} u={U} kind={e.kind} />
          ))}

          {/* Winners' steps */}
          {(stepsOn || wheelOn) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, background: wheelOn ? 'rgba(255,247,240,.82)' : 'rgba(255,247,240,.62)', zIndex: 85, pointerEvents: 'none' }} />
          )}
          {stepsOn && (
            <>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: `calc(var(--safe-bottom) + ${trayH}px)`, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 6, zIndex: 90 }}>
                {[0, 1, 2, 3, 4].map((k) => {
                  const shown = k < 3 || q >= 3
                  const stepH = Math.max(34, U * STEP_H[k] * (land ? 1 : 1.55))
                  const who = placed[k]
                  return (
                    <motion.div key={k} initial={false} animate={{ width: shown ? sw : 0, opacity: shown ? 1 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} style={{ height: stepH + ah + 10, position: 'relative', overflow: 'visible' }}>
                      {shown && (
                        <Target id={`step-${k}`} hint={glowStep === k} style={{ position: 'absolute', inset: 0, borderRadius: 18 }}>
                          {who && (
                            <motion.div initial={{ y: -40, scale: 0.6 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', left: 0, right: 0, bottom: stepH - 4, height: ah, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                              <button
                                type="button"
                                aria-label={NAME[who]}
                                onClick={() => (q === 5 ? tryAfter(who) : (sounds.pop(), void hs.current[who]?.play('wiggle')))}
                                className={q === 5 && glowId === who ? 'world-glow' : undefined}
                                style={{ height: '100%', background: 'none', border: 'none', padding: 0, touchAction: 'manipulation', filter: q === 5 && glowId === who ? 'drop-shadow(0 0 12px #FFC83D) drop-shadow(0 0 6px #fff)' : undefined }}
                              >
                                <Critter ref={setH(who)} id={who} height="100%" calm />
                              </button>
                            </motion.div>
                          )}
                          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: stepH, background: STEP_COLORS[k], border: `5px solid ${INK}`, borderRadius: '16px 16px 6px 6px', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: clamp(stepH * 0.42, 18, 44), color: INK, boxShadow: 'inset 0 -10px 0 rgba(0,0,0,.08)' }}>{ORD[k]}</div>
                        </Target>
                      )}
                    </motion.div>
                  )
                })}
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 10px)', display: 'flex', justifyContent: 'center', gap: 'min(22px, 3vw)', zIndex: 100 }}>
                {trayIds
                  .filter((id) => !hidden.includes(id))
                  .map((id) => (
                    <motion.div key={id} initial={{ y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
                      <Piece id={`tray-${id}`} snapTo={stepIds} snapRadius={ah} label={NAME[id]} onTap={() => tryPlace(id, qRef.current)} onPlace={({ target }) => (tryPlace(id, target?.startsWith('step-') ? Number(target.slice(5)) : null) ? 'reset' : 'home')}>
                        <motion.div animate={shake?.id === id ? { rotate: [0, -12, 12, -8, 8, 0] } : glowId === id ? { scale: [1, 1.12, 1] } : { rotate: 0, scale: 1 }} key={shake?.id === id ? shake.n : 'x'} transition={glowId === id && shake?.id !== id ? { repeat: Infinity, duration: 0.9 } : { duration: 0.45 }} style={{ filter: glowId === id ? 'drop-shadow(0 0 12px #FFC83D) drop-shadow(0 0 6px #fff)' : undefined }}>
                          <button type="button" aria-label={NAME[id]} style={{ background: 'none', border: 'none', padding: 0, display: 'block', touchAction: 'none', height: th }}>
                            <Critter ref={setH(id)} id={id} height={`${th}px`} calm />
                          </button>
                        </motion.div>
                      </Piece>
                    </motion.div>
                  ))}
              </div>
            </>
          )}

          {/* The zodiac wheel */}
          {wheelOn && (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', bottom: land ? 12 : 170, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90, pointerEvents: 'none', paddingTop: H < 560 ? 0 : land ? 76 : 84 }}>
              <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.35 }}>
                <Wheel
                  size={wsize}
                  count={count}
                  glow={glow}
                  center={
                    revealed ? (
                      <motion.div initial={{ scale: 0.2 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Critter ref={setH('center')} id={KAYLEE_ZODIAC} height={`${wsize * 0.27}px`} />
                      </motion.div>
                    ) : (
                      <span style={{ fontSize: clamp(U * 0.11, 30, 84), fontWeight: 700, color: INK }}>12</span>
                    )
                  }
                />
              </motion.div>
            </div>
          )}
          {horse && (
            <motion.div initial={{ left: '-30%' }} animate={{ left: '125%' }} transition={{ duration: 2.9, ease: 'linear' }} style={{ position: 'absolute', bottom: land ? '16%' : '24%', zIndex: 130, pointerEvents: 'none' }}>
              <Buddy ref={setH('horse')} img={pic('horse', '🐴')} voice="horse" height={`${clamp(U * 0.34, 150, 300)}px`} />
            </motion.div>
          )}
          {catOn && (
            <div style={{ position: 'absolute', right: '3%', bottom: 'calc(var(--safe-bottom) + 12px)', zIndex: 120 }}>
              <motion.button
                type="button"
                aria-label="cat"
                onClick={() => void tapCat()}
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={!catAwake ? 'world-glow' : undefined}
                style={{ background: 'none', border: 'none', padding: 8, display: 'block', touchAction: 'manipulation', borderRadius: 30 }}
              >
                <Buddy ref={setH('cat')} img={pic('cat', '🐱')} height={`${clamp(U * 0.2, 100, 190)}px`} calm />
                {!catAwake && (
                  <motion.div animate={{ y: [0, -14, 0], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', right: 0, top: -6, fontSize: clamp(U * 0.07, 28, 56), pointerEvents: 'none' }}>
                    💤
                  </motion.div>
                )}
              </motion.button>
            </div>
          )}
        </PlayArea>
      )}

      {!story && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 'calc(var(--safe-top) + 96px)', background: 'linear-gradient(rgba(255,247,240,0.9), rgba(255,247,240,0.55) 55%, rgba(255,247,240,0))', zIndex: 110, pointerEvents: 'none' }} />}
      {!story && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 12px', zIndex: 140, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <PromptBubble text={prompt} speak={false} />
          </div>
        </div>
      )}

      {story && <StoryBeat lines={R.story} friend={<Mouse height="100%" />} bg={typeof bg === 'string' ? bg : undefined} onDone={() => setStory(false)} />}
    </div>
  )
}

/** Drifting butterflies and a leaping fish, so the river never sits still. */
function Ambient({ U }: { U: number }) {
  return (
    <>
      <motion.div animate={{ x: [0, 160, 320, 160, 0], y: [0, -40, 10, -30, 0], rotate: [0, 12, -8, 10, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', left: '8%', top: '78%', fontSize: U * 0.045, pointerEvents: 'none', zIndex: 5 }}>
        🦋
      </motion.div>
      <motion.div animate={{ x: [0, -140, -280, -140, 0], y: [0, 30, -20, 20, 0] }} transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', left: '78%', top: '38%', fontSize: U * 0.04, pointerEvents: 'none', zIndex: 5 }}>
        🦋
      </motion.div>
      <motion.div animate={{ x: [0, 40, 80], y: [0, -U * 0.09, 0], rotate: [-40, 0, 40], opacity: [0, 1, 0] }} transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 7 }} style={{ position: 'absolute', left: '30%', top: '62%', fontSize: U * 0.045, pointerEvents: 'none', zIndex: 5 }}>
        🐟
      </motion.div>
    </>
  )
}

// 🚄 The Bullet Train. China is so big that it can be snowy in one place and beach weather in another on the same day.
// Kaylee pushes the throttle lever up (it clicks into each notch; a tap nudges it) and the train zooms through a streaming
// landscape, then brakes by itself at each stop: Harbin (snow), Hainan (beach), the Gobi (hot day, cold night) and the
// Himalayas. At each stop she gives Bao Bao what she needs from a tray (drag it onto her, or tap it); the clothes appear ON
// Bao Bao. Wrong pick: the train toots, Bao Bao giggles and the right one glows. A small map shows how far the train went.
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { Buddy, burst, Piece, PlayArea, say, sounds, Target, useAlive, useElementSize, useGameLoop, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { sfx } from '../../../../kit/sfx'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import { BaoBao } from '../../puppets/BaoBao'
import { INK } from '../../puppets/ink'
import type { ActivityProps } from '../../Place'
import { setWind, startWind, stopWind, toot } from './audio'
import { ItemIcon, Scarf, wearFor, type ItemId } from './items'
import { Lever, NOTCHES } from './Lever'
import { RouteMap, type RouteMapHandle } from './RouteMap'
import { Scenery, type SceneryHandle, type StopId } from './Scenery'

const T = L.train
type Wrongs = Record<string, Line>
const WRONG = T.wrong as Wrongs
const A = art as unknown as Record<string, string | undefined>

interface Step {
  ask: keyof typeof T.ask
  tray: ItemId[]
  right: ItemId[]
  night?: boolean
}
interface Stop {
  id: StopId
  bg?: string
  critter?: 'tiger' | 'camel' | 'yak'
  steps: Step[]
}
const STOPS: Stop[] = [
  { id: 'harbin', bg: A.bgTrainHarbin, critter: 'tiger', steps: [{ ask: 'harbin', tray: ['mittens', 'swimring', 'hat'], right: ['mittens', 'hat'] }, { ask: 'scarf', tray: ['sunhat', 'scarf', 'swimring'], right: ['scarf'] }] },
  { id: 'hainan', bg: A.bgTrainHainan, steps: [{ ask: 'hainan', tray: ['swimring', 'mittens', 'sunhat'], right: ['sunhat', 'swimring'] }] },
  { id: 'gobi', bg: A.bgTrainGobi, critter: 'camel', steps: [{ ask: 'gobiDay', tray: ['blanket', 'water', 'mittens'], right: ['water'] }, { ask: 'gobiNight', tray: ['sunhat', 'water', 'blanket'], right: ['blanket'], night: true }] },
  { id: 'himalaya', bg: A.bgTrainHimalaya, critter: 'yak', steps: [{ ask: 'himalaya', tray: ['sunhat', 'swimring', 'coat', 'water'], right: ['coat'] }] },
]
const TOTAL = STOPS.reduce((n, s) => n + s.steps.reduce((m, st) => m + st.right.length, 0), 0) // every item she gives
const RIDE_SECS = [3.4, 2.8, 2.8, 2.8] // seconds at full speed to reach each stop
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

type Phase = 'ride' | 'stop' | 'leave' | 'end'

export function BulletTrain({ onDone, setProgress }: ActivityProps) {
  const alive = useAlive()
  const root = useRef<HTMLDivElement>(null)
  const { width: W, height: H } = useElementSize(root)
  const bao = useRef<PuppetHandle>(null)
  const critter = useRef<PuppetHandle>(null)
  const scenery = useRef<SceneryHandle>(null)
  const routeMap = useRef<RouteMapHandle>(null)
  const trainEl = useRef<HTMLDivElement>(null)

  const [story, setStory] = useState(true)
  const [phase, setPhase] = useState<Phase>('ride')
  const [si, setSi] = useState(0)
  const [atStop, setAtStop] = useState(false)
  const [notch, setNotch] = useState(0)
  const [hint, setHint] = useState(false)
  const [tray, setTray] = useState<ItemId[]>([])
  const [glow, setGlow] = useState<ItemId[]>([])
  const [worn, setWorn] = useState<ItemId[]>([])
  const [drinking, setDrinking] = useState(false)
  const [tigerScarf, setTigerScarf] = useState(false)
  const [night, setNight] = useState(false)
  const [prompt, setPrompt] = useState<Line | null>(null)
  const [reached, setReached] = useState(0)
  const [targetHint, setTargetHint] = useState<'bao' | 'animal' | null>(null)
  const [shivering, setShivering] = useState(false)

  // Everything the animation loop and the async script read lives in refs.
  const s = useRef({ phase: 'ride' as Phase, si: 0, notch: 0, speed: 0, progress: 0, braking: false, step: 0, given: 0, wrongs: 0, busy: true, touched: false, spokeFast: false, given_total: 0, taps: 0, idle: 0, t: 0 })
  const stop = STOPS[si]

  useEffect(() => {
    setProgress(0, TOTAL)
    return () => stopWind()
  }, [])

  // ---------------------------------------------------------------- the ride --------------------------------------
  useGameLoop((dt) => {
    const r = s.current
    if (story) return
    r.t += dt
    if (r.phase === 'ride') {
      const target = r.braking ? 0 : r.notch / (NOTCHES - 1)
      const rate = r.braking ? 1.5 : target > r.speed ? 0.6 : 0.9
      r.speed += clamp(target - r.speed, -dt * rate, dt * rate)
      r.progress += (Math.max(r.speed, r.braking ? 0.12 : 0) * dt) / RIDE_SECS[r.si]
      if (!r.braking && r.progress >= 0.72) {
        r.braking = true
        r.notch = 0
        setNotch(0)
        setHint(false)
        toot()
      }
      if (r.speed > 0.97 && !r.spokeFast && r.si === 0) {
        r.spokeFast = true
        void say(T.fast, { interrupt: false })
      }
      if (r.progress >= 1) {
        r.progress = 1
        r.phase = 'stop'
        void arrive()
      }
      routeMap.current?.set(r.si, r.progress)
    } else {
      r.speed = Math.max(0, r.speed - dt * 1.6)
    }
    const v = r.speed
    scenery.current?.scroll(v * dt * (W || 1000) * 1.7)
    scenery.current?.setStreaks((v - 0.35) * 1.4)
    setWind(v)
    if (trainEl.current) {
      const shake = Math.sin(r.t * 47) * v * 1.6
      trainEl.current.style.transform = `translate(${Math.sin(r.t * 31) * v * 1.2}px, ${shake}px) rotate(${Math.sin(r.t * 23) * v * 0.15}deg)`
    }
  })

  // Nudge if she hasn't touched the lever for a while.
  useEffect(() => {
    if (story || phase !== 'ride' || notch > 0) return
    const t = setTimeout(() => setHint(true), 4000)
    return () => clearTimeout(t)
  }, [story, phase, notch, si])

  const beginRide = (next: number) => {
    const r = s.current
    r.si = next
    r.phase = 'ride'
    r.progress = 0
    r.braking = false
    r.notch = 0
    r.busy = false
    setSi(next)
    setNotch(0)
    setHint(false)
    setAtStop(false)
    setPhase('ride')
    setPrompt(next === 0 ? T.push : T.pushAgain)
    routeMap.current?.set(next, 0)
  }

  const pull = (n: number) => {
    const r = s.current
    if (r.phase !== 'ride' || r.braking) return
    startWind()
    r.touched = true
    if (n > r.notch) void bao.current?.play('wiggle')
    r.notch = n
    setNotch(n)
    setHint(false)
    if (n > 0) sounds.note(n * 2)
  }

  // ---------------------------------------------------------------- at a stop --------------------------------------
  async function arrive() {
    const r = s.current
    const st = STOPS[r.si]
    r.busy = true
    setPrompt(null)
    sounds.whoosh()
    await wait(700)
    if (!alive()) return
    setPhase('stop')
    setAtStop(true)
    setReached(r.si + 1)
    sfx.thump()
    await say(T.arrive[st.id])
    if (!alive()) return
    if (st.critter === 'camel') await say(T.hello.camel)
    if (st.critter === 'yak') await say(T.hello.yak)
    if (!alive()) return
    beginStep(0)
  }

  async function beginStep(k: number) {
    const r = s.current
    const step = STOPS[r.si].steps[k]
    r.step = k
    r.given = 0
    r.wrongs = 0
    setTray(step.tray)
    setGlow([])
    setTargetHint(null)
    if (step.night) {
      setNight(true)
      sounds.sparkle()
      void bao.current?.play('shake')
    }
    if (STOPS[r.si].critter === 'tiger') setShivering(true)
    if (step.ask === 'scarf') {
      await say(T.shiver)
      if (!alive()) return
    }
    r.busy = false
    setPrompt(T.ask[step.ask])
  }

  const wrong = (item: ItemId, onAnimal = false) => {
    const r = s.current
    const step = STOPS[r.si].steps[r.step]
    r.wrongs++
    toot()
    sounds.oops()
    void bao.current?.play('shake')
    if (step.ask === 'scarf') void critter.current?.play('wiggle')
    const line = step.ask === 'scarf' ? WRONG.scarf : WRONG[`${step.ask}:${item}`]
    setGlow(step.right.filter((i) => tray.includes(i)))
    if (step.ask === 'scarf') setTargetHint('animal')
    void (async () => {
      if (line) await say(line)
      if (r.wrongs >= 2 && alive()) await say(T.hint)
    })()
    if (r.wrongs >= 2) setTray((t) => t.filter((i) => step.right.includes(i)))
    void onAnimal
  }

  const give = async (item: ItemId) => {
    const r = s.current
    if (r.phase !== 'stop' || r.busy) return
    const step = STOPS[r.si].steps[r.step]
    if (!step.right.includes(item)) return wrong(item)
    r.busy = true
    setTray((t) => t.filter((i) => i !== item))
    setGlow((g) => g.filter((i) => i !== item))
    setTargetHint(null)
    sfx.fwip()
    sounds.correct()
    r.given++
    r.given_total++
    setProgress(r.given_total, TOTAL)
    const line = T.yes[item]
    if (item === 'scarf') {
      setTigerScarf(true)
      setShivering(false)
      void critter.current?.play('cheer')
      void say(line)
    } else if (item === 'water') {
      setDrinking(true)
      void bao.current?.play('munch')
      ;[300, 750, 1200].forEach((ms) => setTimeout(() => sfx.munch(), ms))
      void say(line)
      await wait(1500)
      setDrinking(false)
    } else {
      setWorn((w) => [...w, item])
      void bao.current?.play('hop')
      void say(line)
    }
    if (!alive()) return
    await wait(item === 'water' ? 300 : 900)
    if (!alive()) return
    if (r.given < step.right.length) {
      r.busy = false
      return
    }
    // The step is done.
    burst()
    void bao.current?.play('cheer')
    const next = r.step + 1
    if (next < STOPS[r.si].steps.length) {
      await wait(600)
      if (alive()) void beginStep(next)
    } else void finishStop()
  }

  async function finishStop() {
    const r = s.current
    r.busy = true
    setPrompt(null)
    await wait(700)
    if (!alive()) return
    if (r.si === STOPS.length - 1) return void finish()
    r.phase = 'leave'
    setPhase('leave')
    // She changes back: everything comes off, and the friends wave goodbye.
    sfx.fwip()
    setWorn([])
    setTray([])
    setShivering(false)
    void bao.current?.play('wiggle')
    await wait(800)
    if (!alive()) return
    if (STOPS[r.si].id === 'hainan') await say(T.big)
    if (!alive()) return
    setTigerScarf(false)
    setNight(false)
    beginRide(r.si + 1)
  }

  async function finish() {
    setPhase('end')
    s.current.phase = 'end'
    setProgress(TOTAL, TOTAL)
    toot()
    burst()
    void bao.current?.play('cheer')
    await say(T.end)
    await wait(500)
    if (alive()) onDone()
  }

  const giggle = () => {
    const r = s.current
    if (r.busy && r.phase === 'stop') return
    sounds.pop()
    void bao.current?.play('wiggle')
    void say(T.tap[r.taps++ % T.tap.length])
  }
  const tapCritter = () => {
    if (!stop.critter) return
    sounds.pop()
    void critter.current?.play('jump')
    void say(T.animalTap[stop.critter])
  }

  // ---------------------------------------------------------------- layout --------------------------------------
  const ready = W > 0 && H > 0
  const landscape = W > H
  const phone = Math.min(W, H) < 480
  const item = clamp(H * 0.15, 88, 132)
  const ctl = item + 44
  const topReserve = phone ? 64 : 104 + 96
  const baoH = Math.max(150, Math.min(H * (landscape ? 0.44 : 0.33), W * (landscape ? 0.4 : 0.5), H - ctl - topReserve + 30))
  const baoW = baoH * (400 / 480)
  const baoX = landscape ? W * 0.05 : W * 0.03
  const baoBottom = ctl - 6
  const critH = Math.min(H * 0.32, W * (landscape ? 0.26 : 0.34))
  const trainH = Math.min(H * 0.22, W * (landscape ? 0.2 : 0.24))
  const trainW = Math.min(W * 0.96, trainH * 4.2)
  const leverH = clamp(H * 0.4, 190, 320)
  const mapW = clamp(W * 0.13, 92, 150)
  const bgImg = stop.bg
  const wear = wearFor(worn, drinking)
  const canGive = phase === 'stop' && tray.length > 0

  return (
    <div ref={root} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#DFF3FF' }}>
      <Scenery ref={scenery} stop={stop.id} />
      <Sky stop={stop.id} />
      {bgImg && <motion.div initial={false} animate={{ opacity: atStop ? 1 : 0 }} transition={{ duration: 0.8 }} style={{ position: 'absolute', inset: 0, background: `url(${bgImg}) center / cover`, pointerEvents: 'none' }} />}
      <motion.div initial={false} animate={{ opacity: night ? 0.62 : 0 }} transition={{ duration: 1.6 }} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#0B1050, #2A2472)', pointerEvents: 'none' }} />
      {night && <Stars />}

      {ready && (
        <>
          {/* the train, on its rails */}
          <div ref={trainEl} style={{ position: 'absolute', left: (W - trainW) / 2, bottom: H * 0.372, width: trainW, height: trainH, pointerEvents: 'none' }}>
            <TrainPicture />
          </div>

          <PlayArea style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {/* friends at the stop */}
            <AnimatePresence>
              {atStop && stop.critter && (
                <motion.div key={stop.critter} initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 200, opacity: 0 }} transition={{ type: 'spring', bounce: 0.35 }} style={{ position: 'absolute', right: Math.max(6, W * 0.03), bottom: baoBottom, height: critH, zIndex: 6 }}>
                  <Target id="animal" hint={targetHint === 'animal'} style={{ height: '100%', minWidth: critH * 0.9, position: 'relative', pointerEvents: 'auto', borderRadius: 30 }}>
                    <div onClick={tapCritter} style={{ height: '100%', pointerEvents: 'auto', cursor: 'pointer' }}>
                      <Critter ref={critter} kind={stop.critter} height={critH} shiver={shivering && stop.critter === 'tiger'} />
                    </div>
                    {tigerScarf && stop.critter === 'tiger' && (
                      <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', left: '22%', top: '36%', width: '56%', height: '40%', pointerEvents: 'none' }}>
                        <Scarf />
                      </motion.div>
                    )}
                  </Target>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bao Bao, wearing what she was given */}
            <div style={{ position: 'absolute', left: baoX, bottom: baoBottom, width: baoW, height: baoH, zIndex: 7, pointerEvents: 'none' }}>
              <Target id="bao" hint={targetHint === 'bao'} style={{ width: '100%', height: '100%', pointerEvents: 'auto', borderRadius: 40 }}>
                <BaoBao ref={bao} height="100%" onTap={giggle} wear={wear} />
              </Target>
            </div>

            {/* the tray */}
            <AnimatePresence>
              {canGive && (
                <motion.div key="tray" initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }} transition={{ type: 'spring', bounce: 0.3 }} style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 10px)', display: 'flex', justifyContent: 'center', zIndex: 12, pointerEvents: 'none' }}>
                  <div style={{ display: 'flex', gap: item * 0.16, padding: 10, borderRadius: 36, background: 'rgba(255,255,255,0.86)', border: `4px solid ${INK}`, boxShadow: 'var(--shadow)', pointerEvents: 'none' }}>
                    <AnimatePresence>
                      {tray.map((id) => (
                        <motion.div key={id} layout exit={{ scale: 0, opacity: 0 }} animate={glow.includes(id) ? { scale: [1, 1.1, 1] } : { scale: 1 }} transition={glow.includes(id) ? { duration: 0.9, repeat: Infinity } : undefined} style={{ width: item, height: item, pointerEvents: 'auto', borderRadius: 26, background: glow.includes(id) ? 'rgba(255,214,102,0.95)' : '#FFF6EE', boxShadow: glow.includes(id) ? '0 0 0 8px rgba(255,200,61,.85)' : 'inset 0 -4px 0 rgba(0,0,0,.08)' }}>
                          <Piece
                            id={`train-${id}`}
                            snapTo={['bao', 'animal']}
                            snapRadius={90}
                            label={id}
                            onTap={() => {
                              if (id === 'scarf' && STOPS[s.current.si].critter === 'tiger') void give(id)
                              else void give(id)
                            }}
                            onPlace={({ target }) => {
                              if (!target) return 'home'
                              const step = STOPS[s.current.si].steps[s.current.step]
                              const wantsAnimal = step.ask === 'scarf'
                              if (wantsAnimal && target === 'bao') {
                                wrong(id)
                                return 'home'
                              }
                              if (!wantsAnimal && target === 'animal') return 'home'
                              if (step.right.includes(id)) {
                                void give(id)
                                return 'reset'
                              }
                              wrong(id)
                              return 'home'
                            }}
                            style={{ width: item, height: item }}
                          >
                            <button type="button" aria-label={id} style={{ width: item, height: item, padding: item * 0.06, background: 'none', border: 0, display: 'block' }}>
                              <ItemIcon id={id} />
                            </button>
                          </Piece>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </PlayArea>

          {/* the throttle */}
          <AnimatePresence>
            {phase === 'ride' && !story && (
              <motion.div key="lever" initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 200, opacity: 0 }} style={{ position: 'absolute', right: 'max(10px, 2vw)', bottom: 'calc(var(--safe-bottom) + 14px)', zIndex: 14 }}>
                <Lever notch={notch} onNotch={pull} hint={hint} height={leverH} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* the route map (north at the top) */}
          <div style={{ position: 'absolute', right: 'max(10px, 2vw)', top: phone ? 8 : 'calc(var(--top-clear) + 4px)', zIndex: 15 }}>
            <RouteMap ref={routeMap} visited={reached} width={mapW} />
          </div>
        </>
      )}

      {prompt && !story && phase !== 'end' && (
        <div className="train-prompt" style={{ position: 'absolute', left: 0, right: mapW + 30, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 12px', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <PromptBubble text={prompt} />
          </div>
        </div>
      )}
      <style>{`@media (max-height: 560px) { .train-prompt { padding-left: 250px !important; } }`}</style>

      {story && <StoryBeat lines={[T.story]} friend={<BaoBao height="100%" />} bg={A.bgTrainHarbin} onDone={() => { setStory(false); s.current.busy = false; beginRide(0) }} />}
    </div>
  )
}

/** Drifting clouds, a sun, and snowflakes where it is snowy: a little life in the sky. */
function Sky({ stop }: { stop: StopId }) {
  const snowy = stop === 'harbin' || stop === 'himalaya'
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <style>{`@keyframes train-cloud { from { transform: translateX(-30vw) } to { transform: translateX(130vw) } } @keyframes train-snow { from { transform: translateY(-10vh) rotate(0) } to { transform: translateY(75vh) rotate(180deg) } }`}</style>
      {[[22, 60, 0.9], [38, 90, 0.7], [12, 120, 1.1]].map(([top, dur, sc], i) => (
        <div key={i} style={{ position: 'absolute', left: 0, top: `${top + 12}%`, fontSize: 60 * sc, opacity: 0.85, animation: `train-cloud ${dur}s linear ${-i * 25}s infinite` }}>☁️</div>
      ))}
      {(stop === 'hainan' || stop === 'gobi') && <div style={{ position: 'absolute', left: '12%', top: '22%', fontSize: 'min(90px, 12vw)' }}>☀️</div>}
      {snowy && Array.from({ length: 14 }, (_, i) => <div key={i} style={{ position: 'absolute', left: `${(i * 37) % 100}%`, top: 0, fontSize: 18 + (i % 3) * 8, opacity: 0.85, animation: `train-snow ${5 + (i % 5)}s linear ${-i * 0.9}s infinite` }}>❄</div>)}
    </div>
  )
}

function Stars() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: 18 }, (_, i) => (
        <motion.div key={i} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.6 + (i % 4) * 0.4, repeat: Infinity, delay: i * 0.13 }} style={{ position: 'absolute', left: `${(i * 53) % 96}%`, top: `${6 + ((i * 29) % 34)}%`, fontSize: 14 + (i % 3) * 8, color: '#FFF6C8' }}>
          ✦
        </motion.div>
      ))}
      <div style={{ position: 'absolute', left: '14%', top: '20%', fontSize: 'min(80px, 11vw)' }}>🌙</div>
    </div>
  )
}

/** The bullet train: the generated picture when there is one, otherwise a drawn one. */
function TrainPicture() {
  if (A.bulletTrain) return <img src={A.bulletTrain} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: '50% 100%' }} />
  return (
    <svg viewBox="0 0 640 150" preserveAspectRatio="xMidYMax meet" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
      <path d="M14 118 L14 56 C14 36 30 28 50 28 L440 28 C520 28 590 62 626 112 L626 118Z" fill="#fff" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <path d="M14 96 L560 96 L626 112 L626 118 L14 118Z" fill="#FF8FB1" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={40 + i * 46} y="44" width="32" height="30" rx="9" fill="#BEE6FF" stroke={INK} strokeWidth="4" />
      ))}
      <path d="M470 44 C520 44 560 62 584 84 L470 84Z" fill="#BEE6FF" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <rect x="10" y="118" width="620" height="12" rx="6" fill="#8D7A8A" stroke={INK} strokeWidth="4" />
      {[70, 190, 330, 470, 560].map((x) => (
        <circle key={x} cx={x} cy="134" r="13" fill="#6C5470" stroke={INK} strokeWidth="4" />
      ))}
    </svg>
  )
}

const EMOJI = { tiger: '🐯', camel: '🐫', yak: '🐂' } as const

/** The animal at the stop: a Buddy from the generated picture, or an emoji until that picture exists. */
const Critter = forwardRef<PuppetHandle, { kind: 'tiger' | 'camel' | 'yak'; height: number; shiver?: boolean }>(function Critter({ kind, height, shiver }, ref) {
  const img = A[kind]
  const buddy = useRef<PuppetHandle>(null)
  // Shivering: quick little wiggles every second or so until he gets his scarf.
  useEffect(() => {
    if (!shiver) return
    const t = setInterval(() => void buddy.current?.play('wiggle'), 1100)
    void buddy.current?.play('wiggle')
    return () => clearInterval(t)
  }, [shiver])
  useEffect(() => {
    if (typeof ref === 'function') ref(buddy.current)
    else if (ref) ref.current = buddy.current
  })
  if (img) return <Buddy ref={buddy} img={img} voice={kind} height={`${height}px`} />
  return (
    <motion.div animate={shiver ? { x: [-3, 3, -3] } : { y: [0, -4, 0] }} transition={{ duration: shiver ? 0.18 : 2, repeat: Infinity }} style={{ height: '100%', display: 'grid', placeItems: 'end center', fontSize: height * 0.7, lineHeight: 1 }}>
      {EMOJI[kind]}
    </motion.div>
  )
})

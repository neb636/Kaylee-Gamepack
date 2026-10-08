// Inside the Colosseum, one straight-on eye-level camera (a theater stage): the stands across the back, the arena floor
// in front, and a cutaway of the tunnels under the floor (the hypogeum) with a wooden elevator under every trapdoor.
//   1. It's hot! Pull three ropes down and the striped sun-shade unrolls over the crowd ("Ahh, shade!").
//   2. Roman numeral trapdoors: Cesare calls "Door II!", she taps the door with the right numeral, pulls its lever,
//      and a friend rides the elevator up and does a trick. Round 1: I, II, III. Round 2: IV and V ("V is five, like you!").
//      A wrong door rattles; Sparkle counts the lines and the right door glows.
//   3. Grand finale: every door opens at once, then she swipes across the stands to start a stadium wave.
//   Payoff: Cesare bows and brings his Roman horn to Lupa's band (tap it for a silly fanfare).
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { bigCelebration, BigButton, Buddy, burst, KID_NAME, pick, say, SparklePuppet, sounds, useAlive, useElementSize, useLandscape, usePointerDrag, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { art } from '../../art'
import { L } from '../../lines'
import { Bruno } from '../../puppets/Bruno'
import { Cesare } from '../../puppets/Cesare'
import { INK } from '../../puppets/ink'
import { Lupa } from '../../puppets/Lupa'
import { Spina } from '../../puppets/Spina'
import { OliveSvg } from '../olives/bits'
import { arena } from './audio'
import { Crowd, seatFans } from './Crowd'

const C = L.colosseum
const ROMAN = ['I', 'II', 'III', 'IV', 'V']
type Friend = 'gino' | 'spina' | 'tortoise' | 'bruno' | 'lupa'
/** Who rides up from under each numeral. */
const WHO: Record<number, Friend> = { 1: 'gino', 2: 'spina', 3: 'tortoise', 4: 'bruno', 5: 'lupa' }
/** The doors in each round and the order Cesare calls them. */
const ROUNDS = [
  { doors: 3, calls: [2, 1, 3] },
  { doors: 5, calls: [4, 5] },
]

/** Spots in the pictures (fractions of the picture). The seat rows match the benches painted in the backgrounds. */
const LAYOUT = {
  wide: { floor: 0.71, face: 0.04, rows: [0.345, 0.48, 0.612], head: 0.062, span: [0.215, 0.785], sparkle: { x: 0.105, h: 0.25 }, cesare: { x: 0.9, h: 0.25 }, friend: 0.2, ropes: [0.17, 0.5, 0.83], ropeTop: 0.17, handle: 0.37, pull: 0.15, canvas: 0.2, plaque: 0.085, horn: { x: 0.5, y: 0.44, s: 0.2 } },
  tall: { floor: 0.685, face: 0.03, rows: [0.3, 0.402, 0.505, 0.605], head: 0.045, span: [0.19, 0.81], sparkle: { x: 0.1, h: 0.125 }, cesare: { x: 0.9, h: 0.13 }, friend: 0.125, ropes: [0.17, 0.5, 0.83], ropeTop: 0.17, handle: 0.36, pull: 0.1, canvas: 0.2, plaque: 0.06, horn: { x: 0.5, y: 0.45, s: 0.13 } },
}

type Phase = 'shade' | 'doors' | 'finale' | 'payoff'
type Sub = 'wait' | 'pick' | 'lever' | 'show'

export function Arena({ onStep, onDone }: { onStep: () => void; onDone: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const { width: W, height: H } = useElementSize(box)
  const landscape = useLandscape()
  const alive = useAlive()
  const lay = landscape ? LAYOUT.wide : LAYOUT.tall
  const ratio = landscape ? 1.5 : 1024 / 1536
  const bw = Math.max(W, H * ratio)
  const bh = bw / ratio
  const ox = (W - bw) / 2
  // On very wide screens (phones sideways) keep the floor and the tunnels, and crop the sky.
  const oy = (H - bh) * (W / Math.max(H, 1) > 1.7 ? 1 : 0.5)

  const cesare = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const friends = useRef<Partial<Record<Friend, PuppetHandle | null>>>({})

  const [phase, setPhase] = useState<Phase>('shade')
  const [prompt, setPrompt] = useState<{ text: Line; speak: boolean } | null>(null)
  const [pulled, setPulled] = useState([false, false, false])
  const [round, setRound] = useState(0)
  const [call, setCall] = useState<number | null>(null)
  const [sub, setSub] = useState<Sub>('wait')
  const [hint, setHint] = useState<number | null>(null)
  const [rattle, setRattle] = useState<{ n: number; k: number } | null>(null)
  const [up, setUp] = useState<number[]>([])
  const [trick, setTrick] = useState<Friend | null>(null)
  const [banner, setBanner] = useState(false)
  const [waveN, setWaveN] = useState(0)
  const [waveDir, setWaveDir] = useState<1 | -1>(1)
  const [cheerN, setCheerN] = useState(0)
  const [horn, setHorn] = useState(false)
  const [blows, setBlows] = useState(0)
  const [finish, setFinish] = useState(false)
  const busy = useRef(false)
  const pulledN = useRef(0)
  const firstPick = useRef(true)
  const firstLever = useRef(true)
  const firstUp = useRef(true)
  const waves = useRef(0)

  const hot = pulled.some((p) => !p)
  const doors = ROUNDS[round].doors
  const slotW = ((lay.span[1] - lay.span[0]) * bw) / doors
  const slotX = (n: number) => lay.span[0] * bw + (n - 0.5) * slotW // numeral n = 1..doors
  const floorY = lay.floor * bh
  const faceB = floorY + lay.face * bh
  const ugH = bh - faceB
  const fh = lay.friend * bh

  // 1. It's hot! Cesare fans himself and the crowd sweats; the ropes are ready.
  useEffect(() => {
    void (async () => {
      await wait(400)
      if (!alive()) return
      void cesare.current?.play('wiggle')
      await say(C.hot)
      if (!alive() || pulledN.current > 0) return
      setPrompt({ text: C.pull, speak: true })
    })()
  }, [])

  const cheer = (big = false) => {
    setCheerN((n) => n + 1)
    arena.cheer(big)
  }

  // ---------- 1. The sun-shade ----------
  const pullRope = async (i: number) => {
    if (phase !== 'shade' || pulled[i]) return
    const n = ++pulledN.current
    setPulled((p) => p.map((v, j) => v || j === i))
    arena.zip()
    onStep()
    setPrompt(null)
    await wait(650)
    if (!alive()) return
    arena.sigh()
    void cesare.current?.play(n === 3 ? 'cheer' : 'nod')
    if (n < 3) {
      setPrompt({ text: n === 1 ? C.pullNext : C.pullLast, speak: false })
      await say(C.shade[n - 1])
      if (alive() && n === 1 && pulledN.current === 1) await say(C.hotFact)
      return
    }
    busy.current = true
    burst(0.5, 0.25)
    sounds.correct()
    await say(C.shade[2])
    if (!alive()) return
    void sparkle.current?.play('wave')
    await say(C.sailors)
    if (!alive()) return
    setPhase('doors')
    await say(C.lines)
    if (!alive()) return
    busy.current = false
    void nextCall(0, 0)
  }

  // ---------- 2. Roman numeral trapdoors ----------
  const nextCall = async (r: number, i: number) => {
    const n = ROUNDS[r].calls[i]
    setCall(n)
    setHint(null)
    setSub('pick')
    void cesare.current?.play('call')
    await say(C.call[n - 1])
    if (!alive()) return
    if (firstPick.current) {
      firstPick.current = false
      setPrompt({ text: C.tapDoor, speak: true })
    } else setPrompt({ text: C.call[n - 1], speak: false })
  }
  const callIdx = useRef(0)

  const tapDoor = async (n: number) => {
    if (phase !== 'doors' || sub !== 'pick' || call === null || busy.current) return
    if (n === call) {
      sounds.correct()
      void cesare.current?.play('nod')
      void sparkle.current?.play('cheer')
      setHint(null)
      setSub('lever')
      if (firstLever.current) {
        firstLever.current = false
        setPrompt({ text: C.lever, speak: true })
      } else setPrompt({ text: C.lever, speak: false })
      return
    }
    // Wrong door: it rattles, Cesare's tail flicks, and Sparkle counts the lines on the right one.
    busy.current = true
    setRattle({ n, k: Date.now() })
    arena.rattle()
    sounds.oops()
    void cesare.current?.play('flick')
    void sparkle.current?.play('think')
    setHint(call)
    setPrompt(null)
    await say(call <= 3 ? C.countLines[call - 1] : call === 4 ? C.four : C.five)
    busy.current = false
    if (alive()) setPrompt({ text: C.call[call - 1], speak: false })
  }

  const lever = async () => {
    if (sub !== 'lever' || call === null) return
    const n = call
    setSub('show')
    setPrompt(null)
    arena.clunk()
    await wait(200)
    arena.creak()
    arena.rumble(true)
    setUp([n])
    // The first time, Sparkle explains the secret elevators while it rises.
    if (firstUp.current) {
      firstUp.current = false
      await say(C.under)
    } else await wait(1150)
    if (!alive()) return
    cheer()
    onStep()
    await doTrick(WHO[n])
    if (!alive()) return
    if (n === 5) {
      setBanner(true)
      sounds.fanfare()
      burst(0.5, 0.4)
      await say(C.youAreFive)
      if (!alive()) return
    }
    await wait(300)
    // Down it goes, and the next call.
    arena.rumble(false)
    setUp([])
    await wait(900)
    if (!alive()) return
    setBanner(false)
    callIdx.current += 1
    if (callIdx.current < ROUNDS[round].calls.length) return void nextCall(round, callIdx.current)
    if (round === 0) {
      callIdx.current = 0
      setRound(1)
      sounds.whoosh()
      void cesare.current?.play('cheer')
      await say(C.round2)
      if (!alive()) return
      return void nextCall(1, 0)
    }
    void grandFinale()
  }

  const doTrick = async (f: Friend) => {
    setTrick(f)
    const h = friends.current[f]
    if (f === 'spina') void h?.play('dance')
    if (f === 'gino') void h?.play('dance')
    if (f === 'bruno') void h?.play('spin')
    if (f === 'lupa') void h?.play('howl')
    if (f === 'tortoise') void h?.play('nod')
    await say(C.pop[f])
    if (!alive()) return
    if (f === 'tortoise') {
      await say(C.slowBow)
      if (!alive()) return
    }
    await wait(600)
    cheer()
    setTrick(null)
  }

  // ---------- 3. Grand finale: every door, then the wave ----------
  const grandFinale = async () => {
    setPhase('finale')
    setCall(null)
    setSub('wait')
    void cesare.current?.play('call')
    await say(C.allDoors)
    if (!alive()) return
    arena.creak()
    arena.rumble(true)
    setUp([1, 2, 3, 4, 5])
    await wait(1200)
    if (!alive()) return
    cheer(true)
    bigCelebration(1200)
    for (const f of ['spina', 'gino', 'bruno', 'lupa', 'tortoise'] as Friend[]) void friends.current[f]?.play(f === 'tortoise' ? 'nod' : f === 'bruno' ? 'cheer' : f === 'spina' ? 'cheer' : f === 'lupa' ? 'cheer' : 'jump')
    await wait(500)
    if (!alive()) return
    setPrompt({ text: C.wave, speak: true })
  }

  const doWave = async (dir: 1 | -1) => {
    if (phase !== 'finale') return
    // Still finishing the last wave: a happy cheer so the swipe isn't ignored, then she can go again.
    if (busy.current) return void setCheerN((n) => n + 1)
    busy.current = true
    setWaveDir(dir)
    setWaveN((n) => n + 1)
    setPrompt(null)
    arena.cheer(true)
    void sparkle.current?.play('cheer')
    void cesare.current?.play('cheer')
    waves.current += 1
    await wait(1400)
    if (!alive()) return
    busy.current = false
    if (waves.current === 1) {
      onStep()
      setPrompt({ text: C.waveAgain, speak: true })
      return
    }
    if (waves.current === 2) void payoff()
  }

  // ---------- Payoff: the bow and the Roman horn ----------
  const payoff = async () => {
    setPhase('payoff')
    busy.current = true
    sounds.fanfare()
    await say(C.bravo)
    if (!alive()) return
    await say(C.old)
    if (!alive()) return
    void cesare.current?.play('bow')
    await say(C.bow)
    if (!alive()) return
    setHorn(true)
    sounds.sparkle()
    void cesare.current?.play('wave')
    await say(C.horn)
    if (!alive()) return
    busy.current = false
    setPrompt({ text: C.tapHorn, speak: true })
  }

  const blowHorn = async () => {
    if (!horn) return
    setPrompt(null)
    const first = blows === 0
    setBlows((b) => b + 1)
    arena.horn()
    cheer()
    void cesare.current?.play('cheer')
    void friends.current.lupa?.play('howl')
    if (first) {
      await wait(1700)
      if (!alive()) return
      burst()
      await say(C.band)
      if (!alive()) return
      bigCelebration()
      setFinish(true)
    }
  }

  // ---------- The stadium wave gesture ----------
  const swipe = useRef<{ x: number; done: boolean } | null>(null)
  const crowdDown = (e: React.PointerEvent) => {
    if (phase !== 'finale') return
    swipe.current = { x: e.clientX, done: false }
  }
  const crowdMove = (e: React.PointerEvent) => {
    const s = swipe.current
    if (!s || s.done) return
    const dx = e.clientX - s.x
    if (Math.abs(dx) > Math.min(160, W * 0.16)) {
      s.done = true
      void doWave(dx > 0 ? 1 : -1)
    }
  }
  const crowdUp = () => {
    const s = swipe.current
    swipe.current = null
    // A tap (no swipe) still starts a wave, so she can never get stuck.
    if (s && !s.done) void doWave(1)
  }

  const size = lay.head * bh
  const fans = W > 0 ? seatFans(lay.rows.map((r) => r * bh), 0, bw, size) : []
  const allSet = pulled.every(Boolean)

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#7FD0F6', isolation: 'isolate' }}>
      {W > 0 && (
        <div style={{ position: 'absolute', left: ox, top: oy, width: bw, height: bh, zIndex: 0, background: `url(${landscape ? art.bgColosseum : art.bgColosseumTall}) center / 100% 100%` }}>
          <Crowd fans={fans} size={size} shaded={pulled} hotAll={!allSet} waveN={waveN} waveDir={waveDir} cheerN={cheerN} />
          {/* The shade over each third of the stands. */}
          {pulled.map((p, i) => (
            <motion.div key={i} aria-hidden initial={false} animate={{ opacity: p ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ position: 'absolute', left: (i / 3) * bw, width: bw / 3, top: lay.canvas * bh, height: floorY - lay.canvas * bh, background: 'rgba(110,59,36,.13)', pointerEvents: 'none', zIndex: 300 }} />
          ))}
          <Awning bw={bw} bh={bh} pulled={pulled} bottom={lay.canvas} />

          {/* The wave: swipe across the stands (anywhere on the screen counts, so friends in front never block it). */}
          {phase === 'finale' && (
            <div
              aria-label="The crowd"
              role="button"
              onPointerDown={crowdDown}
              onPointerMove={crowdMove}
              onPointerUp={crowdUp}
              onPointerCancel={() => (swipe.current = null)}
              style={{ position: 'absolute', left: -ox, top: -oy, width: W, height: H, zIndex: 460, touchAction: 'none' }}
            >
              {waves.current === 0 && (
                <motion.div aria-hidden animate={{ x: [-bw * 0.15, bw * 0.15], opacity: [0, 1, 1, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ position: 'absolute', left: '50%', top: '36%', translate: '-50% -50%', fontSize: Math.max(48, size * 1.1), pointerEvents: 'none' }}>
                  👉
                </motion.div>
              )}
            </div>
          )}

          {/* Friends ride up through the floor: they're hidden below the floor line until their elevator rises. */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: bw, height: floorY + 2, overflow: 'hidden', zIndex: 400, pointerEvents: 'none' }}>
            {Array.from({ length: doors }, (_, i) => {
              const n = i + 1
              const f = WHO[n]
              const isUp = up.includes(n)
              const h = fh * (f === 'bruno' ? 1.12 : f === 'tortoise' ? 0.62 : f === 'gino' ? 0.92 : 1)
              return (
                <motion.div key={`${round}-${n}`} initial={false} animate={{ y: isUp ? 0 : h * 1.08 }} transition={{ duration: 1.05, ease: [0.3, 0.1, 0.25, 1.15] }} style={{ position: 'absolute', left: slotX(n), bottom: 0, translate: '-50% 0', height: h, display: 'flex', alignItems: 'flex-end', pointerEvents: isUp ? 'auto' : 'none' }}>
                  <FriendFigure who={f} h={h} trick={trick === f} setRef={(r) => (friends.current[f] = r)} />
                </motion.div>
              )
            })}
          </div>

          {/* The floor's front edge and the tunnels underneath. */}
          <Underground bw={bw} top={faceB} h={ugH} />
          <div aria-hidden style={{ position: 'absolute', left: -6, right: -6, top: floorY, height: faceB - floorY, background: '#E9C79C', borderTop: `5px solid ${INK}`, borderBottom: `5px solid ${INK}`, zIndex: 410 }} />

          {Array.from({ length: doors }, (_, i) => {
            const n = i + 1
            const cx = slotX(n)
            return (
              <Door
                key={`${round}-${n}`}
                n={n}
                cx={cx}
                w={slotW}
                floorY={floorY}
                faceB={faceB}
                ugH={ugH}
                bh={bh}
                plaqueH={lay.plaque * bh}
                open={up.includes(n)}
                glow={(phase === 'doors' && sub === 'pick' && hint === n) || (sub === 'lever' && call === n)}
                selected={sub === 'lever' && call === n}
                rattle={rattle?.n === n ? rattle.k : 0}
                active={phase === 'doors' && sub === 'pick'}
                onTap={() => void tapDoor(n)}
                onLever={() => void lever()}
                onLeverHint={() => void say(C.leverHint)}
              />
            )
          })}

          {/* Ropes to the sun-shade. */}
          {phase === 'shade' &&
            lay.ropes.map((x, i) => (
              <Rope key={i} x={x * bw} top={lay.ropeTop * bh} rest={Math.max(lay.handle * bh, -oy + 130)} pull={lay.pull * bh} done={pulled[i]} glow={!pulled[i] && pulled.filter(Boolean).length === i} onPull={() => void pullRope(i)} onHint={() => void say(C.pullHint)} />
            ))}

          {/* Sparkle and Cesare stand at the two ends of the arena floor. */}
          <div style={{ position: 'absolute', left: Math.max(lay.sparkle.x * bw, -ox + lay.sparkle.h * bh * 0.46), top: floorY, translate: '-50% -100%', zIndex: 420, pointerEvents: 'none' }}>
            <SparklePuppet ref={sparkle} height={`${lay.sparkle.h * bh}px`} flip lookToward={0.6} />
          </div>
          <div style={{ position: 'absolute', left: Math.min(lay.cesare.x * bw, W - ox - lay.cesare.h * bh * 0.48), top: floorY, translate: '-50% -100%', zIndex: 420 }}>
            <button
              aria-label="Cesare"
              onClick={() => {
                sounds.pop()
                void cesare.current?.play('blink')
                void say(pick(L.tickle.cesare))
              }}
              style={{ background: 'none', border: 'none', padding: 0, display: 'block' }}
            >
              <Cesare ref={cesare} height={`${lay.cesare.h * bh}px`} flip hot={hot} />
            </button>
          </div>

          {/* V is five, like Kaylee. */}
          <AnimatePresence>
            {banner && (
              <motion.div initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: -3 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', left: bw / 2, top: lay.rows[0] * bh, translate: '-50% -50%', zIndex: 500, background: '#FFE27A', border: `6px solid ${INK}`, borderRadius: 24, padding: '6px 28px', boxShadow: 'var(--shadow)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: Math.max(30, bh * 0.07), fontWeight: 700, color: INK, lineHeight: 1.1 }}>
                  {KID_NAME} = <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#E8574F' }}>V</span>
                </div>
                <div style={{ fontSize: Math.max(18, bh * 0.028), color: '#8A6A5A' }}>V = 5 🎂</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cesare's Roman horn. */}
          <AnimatePresence>
            {horn && (
              <motion.button
                aria-label="Roman horn"
                className={blows === 0 ? 'world-glow' : undefined}
                initial={{ scale: 0, rotate: -120 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => void blowHorn()}
                style={{ position: 'absolute', left: lay.horn.x * bw, top: Math.max(lay.horn.y * bh, -oy + 110 + Math.max(120, lay.horn.s * bh) / 2), width: Math.max(120, lay.horn.s * bh), height: Math.max(120, lay.horn.s * bh), translate: '-50% -50%', zIndex: 520, background: 'none', border: 'none', borderRadius: '50%', padding: 0 }}
              >
                <motion.img key={blows} src={art.romanHorn} alt="" draggable={false} animate={blows ? { rotate: [0, -10, 8, -6, 0], scale: [1, 1.15, 1] } : { y: [0, -6, 0] }} transition={blows ? { duration: 1.4 } : { repeat: Infinity, duration: 1.3 }} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                {blows > 0 && <Notes key={`n${blows}`} />}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {finish && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', left: '50%', top: 'calc(var(--top-clear) + 12px)', translate: '-50% 0', zIndex: 60 }}>
            <BigButton ariaLabel="Get my stamp" size="xl" onClick={onDone}>
              🏛️ ⭐
            </BigButton>
          </motion.div>
        )}
      </AnimatePresence>
      {prompt && !finish && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: H < 560 ? 'flex-end' : 'center', padding: '0 24px', zIndex: 50, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <PromptBubble text={prompt.text} speak={prompt.speak} />
          </div>
        </div>
      )}
    </div>
  )
}

/** A friend on an elevator, doing their trick when it's their turn. */
function FriendFigure({ who, h, trick, setRef }: { who: Friend; h: number; trick: boolean; setRef: (r: PuppetHandle | null) => void }) {
  const height = `${h}px`
  let body: ReactNode
  if (who === 'spina') body = <Spina ref={setRef} height={height} />
  else if (who === 'bruno') body = <Bruno ref={setRef} height={height} />
  else if (who === 'lupa') body = <Lupa ref={setRef} height={height} />
  else if (who === 'gino') body = <Buddy ref={setRef} img={art.gino} voice="gino" height={height} />
  else body = <Buddy ref={setRef} img={art.tortoise} voice="tortoise" height={height} calm />
  return (
    <div style={{ position: 'relative' }}>
      <motion.div
        animate={trick && who === 'gino' ? { rotateY: [0, 360, 720] } : trick && who === 'tortoise' ? { rotate: [0, 14, 14, 0] } : { rotateY: 0, rotate: 0 }}
        transition={trick ? { duration: who === 'tortoise' ? 3.2 : 1.4, ease: 'easeInOut' } : { duration: 0.3 }}
        style={{ transformOrigin: '50% 100%' }}
      >
        {body}
      </motion.div>
      {/* Spina juggles olives over her head. */}
      {trick && who === 'spina' &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ x: [-h * 0.22, 0, h * 0.22, 0, -h * 0.22], y: [-h * 0.05, -h * 0.4, -h * 0.05, -h * 0.25, -h * 0.05] }}
            transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.37, ease: 'linear' }}
            style={{ position: 'absolute', left: '50%', top: 0, width: h * 0.12, translate: '-50% 0' }}
          >
            <OliveSvg color={i === 1 ? 'black' : 'green'} />
          </motion.div>
        ))}
    </div>
  )
}

/** The striped sun-shade (the Romans called it the velarium): one panel per rope, unrolling from the left mast. */
function Awning({ bw, bh, pulled, bottom }: { bw: number; bh: number; pulled: boolean[]; bottom: number }) {
  const h = bottom * bh
  const stripe = bw / 30
  return (
    <div aria-hidden style={{ position: 'absolute', left: 0, top: 0, width: bw, height: h + 30, zIndex: 330, pointerEvents: 'none' }}>
      {pulled.map((p, i) => (
        <motion.div key={i} initial={false} animate={{ scaleX: p ? 1 : 0 }} transition={{ type: 'spring', bounce: 0.25, duration: 0.9 }} style={{ position: 'absolute', left: (i / 3) * bw - 2, width: bw / 3 + 4, top: 0, height: h + 24, transformOrigin: '0% 50%' }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${bw / 3 + 4} ${h + 24}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
            {(() => {
              const w = bw / 3 + 4
              const sc = 5
              const path = `M0 -10 L${w} -10 L${w} ${h} ` + Array.from({ length: sc }, (_, k) => `Q${w - ((k + 0.5) * w) / sc} ${h + 26} ${w - ((k + 1) * w) / sc} ${h}`).join(' ') + ' Z'
              return (
                <>
                  <defs>
                    <clipPath id={`awn${i}`}>
                      <path d={path} />
                    </clipPath>
                  </defs>
                  <rect x="0" y="-10" width={w} height={h + 40} fill="#FFF4E4" clipPath={`url(#awn${i})`} />
                  {Array.from({ length: Math.ceil(w / (stripe * 2)) + 1 }, (_, k) => (
                    <rect key={k} x={k * stripe * 2} y="-10" width={stripe} height={h + 40} fill={i === 1 ? '#FF8FB8' : '#E8574F'} clipPath={`url(#awn${i})`} />
                  ))}
                  <path d={path} fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
                </>
              )
            })()}
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

/** A rope hanging from the top rim with a wooden handle: drag it down (or tap twice) to unroll the shade. */
function Rope({ x, top, rest, pull, done, glow, onPull, onHint }: { x: number; top: number; rest: number; pull: number; done: boolean; glow: boolean; onPull: () => void; onHint: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const dy = useMotionValue(0)
  const taps = useRef(0)
  const len = useTransform(dy, (d) => rest - top + d)
  usePointerDrag(ref, {
    threshold: 4,
    disabled: done,
    onStart: () => sounds.pickup(),
    onMove: (i) => dy.set(Math.max(0, Math.min(pull, i.dy * 0.85))),
    onEnd: () => {
      if (dy.get() > pull * 0.6) {
        void animate(dy, pull, { duration: 0.15 })
        onPull()
      } else {
        void animate(dy, 0, { type: 'spring', bounce: 0.6 })
        onHint()
      }
    },
    onCancel: () => void animate(dy, 0, { type: 'spring', bounce: 0.5 }),
    onTap: () => {
      taps.current += 1
      if (taps.current === 1) return onHint()
      void animate(dy, pull, { duration: 0.35 })
      onPull()
    },
  })
  useEffect(() => {
    if (done) void animate(dy, -(rest - top) - 80, { duration: 0.8, delay: 0.6, ease: 'easeIn' })
  }, [done])
  const knob = Math.max(92, pull * 0.8)
  return (
    <>
      <motion.div aria-hidden style={{ position: 'absolute', left: x - 4, top, width: 8, height: len, background: '#C98B5B', border: `3px solid ${INK}`, borderRadius: 4, zIndex: 450 }} />
      <motion.div style={{ position: 'absolute', left: x - knob / 2, top: rest - 8, y: dy, width: knob, height: knob, zIndex: 451 }}>
        <button ref={ref} type="button" aria-label="Rope" className={glow ? 'world-glow' : undefined} style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'grid', placeItems: 'center', touchAction: 'none', cursor: 'grab', background: 'rgba(255,255,255,.01)', border: 'none', padding: 0 }}>
          {/* The wooden toggle and a rope loop */}
          <svg viewBox="-50 -50 100 100" style={{ width: '78%', overflow: 'visible' }}>
            <path d="M0 -50 L0 -12" stroke={INK} strokeWidth="10" />
            <path d="M0 -50 L0 -12" stroke="#C98B5B" strokeWidth="4" />
            <rect x="-34" y="-14" width="68" height="26" rx="13" fill="#C98B5B" stroke={INK} strokeWidth="6" />
            <rect x="-26" y="2" width="52" height="6" rx="3" fill="#A86F45" />
            {!done && (
              <motion.path d="M0 22 L0 46 M-12 34 L0 46 L12 34" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} />
            )}
          </svg>
        </button>
      </motion.div>
    </>
  )
}

/** The cutaway under the arena floor: stone, tunnel arches and little lanterns. */
function Underground({ bw, top, h }: { bw: number; top: number; h: number }) {
  const arches = Math.max(5, Math.round(bw / 150))
  return (
    <div aria-hidden style={{ position: 'absolute', left: 0, top, width: bw, height: h + 4, background: '#C49A74', zIndex: 405, overflow: 'hidden' }}>
      {Array.from({ length: arches }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: ((i + 0.5) / arches) * bw, bottom: -4, width: Math.min(110, bw / arches * 0.6), height: h * 0.62, translate: '-50% 0', background: '#8C6248', border: `5px solid ${INK}`, borderRadius: '999px 999px 0 0' }} />
      ))}
      {Array.from({ length: arches - 1 }, (_, i) => (
        <motion.span key={i} animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }} transition={{ repeat: Infinity, duration: 0.9 + (i % 3) * 0.2 }} style={{ position: 'absolute', left: ((i + 1) / arches) * bw, top: h * 0.12, translate: '-50% 0', fontSize: Math.max(18, h * 0.12) }}>
          🏮
        </motion.span>
      ))}
    </div>
  )
}

/** One trapdoor: the hatch on the floor, a stone plaque with its Roman numeral on the floor's edge, the shaft below with
 *  a wooden elevator cage, and the lever beside it. */
function Door(props: {
  n: number
  cx: number
  w: number
  floorY: number
  faceB: number
  ugH: number
  bh: number
  plaqueH: number
  open: boolean
  glow: boolean
  selected: boolean
  rattle: number
  active: boolean
  onTap: () => void
  onLever: () => void
  onLeverHint: () => void
}) {
  const { n, cx, w, floorY, faceB, ugH, bh, plaqueH, open, glow, selected, rattle, active, onTap } = props
  const dw = w * 0.8
  const shaftW = dw * 0.78
  const cageH = Math.min(ugH * 0.55, shaftW * 0.9)
  const thick = Math.max(10, bh * 0.016)
  const plW = Math.max(plaqueH * 1.25, Math.min(dw * 0.9, plaqueH * (0.9 + ROMAN[n - 1].length * 0.45)))
  return (
    <>
      {/* Shaft and cage (in the underground). */}
      <div aria-hidden style={{ position: 'absolute', left: cx - shaftW / 2, top: faceB - 2, width: shaftW, height: ugH + 6, background: '#5E4033', borderLeft: `5px solid ${INK}`, borderRight: `5px solid ${INK}`, zIndex: 406, overflow: 'hidden' }}>
        <motion.div initial={false} animate={{ y: open ? 0 : ugH - cageH - 4 }} transition={{ duration: 1.05, ease: [0.3, 0.1, 0.25, 1.15] }} style={{ position: 'absolute', left: 4, right: 4, top: 0, height: cageH }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
            <rect x="2" y="2" width="96" height="96" rx="6" fill="#D9A36C" stroke={INK} strokeWidth="5" vectorEffect="non-scaling-stroke" />
            {[22, 42, 62, 82].map((x) => (
              <rect key={x} x={x - 4} y="6" width="8" height="88" fill="#B07A48" />
            ))}
            <rect x="2" y="40" width="96" height="10" fill="#B07A48" />
          </svg>
        </motion.div>
        {/* the ropes that pull the cage */}
        <div style={{ position: 'absolute', left: '30%', top: 0, width: 3, height: ugH, background: '#E9C79C', opacity: 0.6 }} />
        <div style={{ position: 'absolute', right: '30%', top: 0, width: 3, height: ugH, background: '#E9C79C', opacity: 0.6 }} />
      </div>
      {selected && <Lever x={cx + shaftW / 2 + 4} y={faceB + ugH * 0.6} len={Math.min(ugH * 0.3, w * 0.4)} onPull={props.onLever} onHint={props.onLeverHint} />}

      {/* The hatch: a plank lying on the floor, hinged at its left end. */}
      <motion.div
        key={rattle}
        aria-hidden
        initial={false}
        animate={open ? { rotate: -96 } : rattle ? { rotate: [0, -8, 0, -6, 0, -3, 0], y: [0, -4, 0, -3, 0] } : { rotate: 0 }}
        transition={open ? { type: 'spring', bounce: 0.35, duration: 0.6 } : { duration: 0.5 }}
        style={{ position: 'absolute', left: cx - dw / 2, top: floorY - thick + 3, width: dw, height: thick, background: '#C98B5B', border: `4px solid ${INK}`, borderRadius: 5, transformOrigin: `${thick / 2}px 50%`, zIndex: 412 }}
      />

      {/* The plaque with the Roman numeral. */}
      <motion.div
        key={`p${rattle}`}
        aria-hidden
        className={glow ? 'world-glow' : undefined}
        initial={false}
        animate={rattle ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.45 }}
        style={{ position: 'absolute', left: cx - plW / 2, top: floorY + 4, width: plW, height: plaqueH, background: selected ? '#FFE27A' : '#F7E8D2', border: `5px solid ${INK}`, borderRadius: 12, display: 'grid', placeItems: 'center', zIndex: 415, boxShadow: `inset 0 -6px 0 ${selected ? '#F2C24E' : '#E6CBA4'}` }}
      >
        <span lang="la" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: plaqueH * 0.72, lineHeight: 1, color: INK, letterSpacing: plaqueH * 0.02 }}>
          {ROMAN[n - 1].split('').map((ch, i) => (
            <motion.span key={`${i}-${glow}`} initial={false} animate={glow ? { scale: [1, 1.35, 1], color: [INK, '#E8574F', INK] } : {}} transition={{ delay: 0.5 + i * 0.55, duration: 0.5 }} style={{ display: 'inline-block' }}>
              {ch}
            </motion.span>
          ))}
        </span>
      </motion.div>

      {/* After a wrong door, a finger points at the right one. */}
      {glow && !selected && (
        <motion.div aria-hidden animate={{ y: [0, -14, 0] }} transition={{ repeat: Infinity, duration: 0.9 }} style={{ position: 'absolute', left: cx, top: floorY - Math.max(56, bh * 0.09), translate: '-50% 0', fontSize: Math.max(44, bh * 0.07), zIndex: 435, pointerEvents: 'none', filter: 'drop-shadow(0 3px 3px rgba(110,59,36,.35))' }}>
          👇
        </motion.div>
      )}

      {/* The tap target: the door, its plaque and the space just above. */}
      {active && (
        <button
          aria-label={`Door ${ROMAN[n - 1]}`}
          onClick={() => {
            sounds.pop()
            onTap()
          }}
          style={{ position: 'absolute', left: cx - w * 0.46, top: floorY - Math.max(60, bh * 0.1), width: w * 0.92, height: Math.max(60, bh * 0.1) + plaqueH + 10, background: 'none', border: 'none', padding: 0, zIndex: 430 }}
        />
      )}
    </>
  )
}

/** The elevator lever, beside the shaft: a wooden pole on a pivot. Drag the knob down (or tap twice). */
function Lever({ x, y, len, onPull, onHint }: { x: number; y: number; len: number; onPull: () => void; onHint: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const ang = useMotionValue(-45)
  const taps = useRef(0)
  const pulledRef = useRef(false)
  const knobX = useTransform(ang, (a) => Math.cos((a * Math.PI) / 180) * len)
  const knobY = useTransform(ang, (a) => Math.sin((a * Math.PI) / 180) * len)
  const pull = () => {
    if (pulledRef.current) return
    pulledRef.current = true
    void animate(ang, 50, { duration: 0.25 })
    onPull()
  }
  usePointerDrag(ref, {
    threshold: 4,
    onStart: () => sounds.pickup(),
    onMove: (i) => ang.set(Math.max(-45, Math.min(50, -45 + (i.dy / (len * 1.3)) * 95))),
    onEnd: () => (ang.get() > 15 ? pull() : (void animate(ang, -45, { type: 'spring', bounce: 0.5 }), onHint())),
    onCancel: () => void animate(ang, -45, { type: 'spring', bounce: 0.5 }),
    onTap: () => {
      taps.current += 1
      if (taps.current === 1) onHint()
      else pull()
    },
  })
  const knob = 92
  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, zIndex: 440 }}>
      <motion.div aria-hidden style={{ position: 'absolute', left: 0, top: -6, width: len, height: 12, background: '#C98B5B', border: `4px solid ${INK}`, borderRadius: 6, transformOrigin: '0 50%', rotate: ang }} />
      <div aria-hidden style={{ position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: '#8E8AA8', border: `4px solid ${INK}` }} />
      <motion.div style={{ position: 'absolute', left: -knob / 2, top: -knob / 2, x: knobX, y: knobY, width: knob, height: knob }}>
        <div ref={ref} role="button" aria-label="Lever" className="world-glow" style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'grid', placeItems: 'center', touchAction: 'none', cursor: 'grab', background: 'rgba(255,255,255,.01)' }}>
          <div style={{ width: '46%', height: '46%', borderRadius: '50%', background: '#E8574F', border: `5px solid ${INK}` }} />
        </div>
      </motion.div>
      <motion.div aria-hidden animate={{ y: [0, 14, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} style={{ position: 'absolute', left: len * 0.9, top: len * 0.1, fontSize: 30, color: INK, fontWeight: 700 }}>
        ⬇
      </motion.div>
    </motion.div>
  )
}

/** Music notes floating out of the horn. */
function Notes() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {['🎵', '🎶', '🎵', '🎶'].map((n, i) => (
        <motion.span key={i} initial={{ x: 0, y: 0, opacity: 0 }} animate={{ x: (i - 1.5) * 40, y: -110 - i * 20, opacity: [0, 1, 0], rotate: (i - 1.5) * 20 }} transition={{ duration: 1.4, delay: i * 0.15 }} style={{ position: 'absolute', left: '50%', top: '30%', fontSize: 34 }}>
          {n}
        </motion.span>
      ))}
    </div>
  )
}

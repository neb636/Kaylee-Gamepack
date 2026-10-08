// The valley between the spring and Rome, as one side-view (elevation) drawing: the hill with the spring rock on the
// left, two valleys, the land toward Rome on the right, and the aqueduct she builds across them.
//   1. Find the spring: tap the hill and listen (the gurgle gets louder), then water bubbles out of the rocks.
//   2. Build: drag the arch that fits each gap (round 1: three clearly different heights; round 2: four, two of them
//      almost the same). A wrong one stands there with its channel tilted uphill and a drop rolling backward.
//   3. Water on: tap the spring, the water runs along the whole channel toward Rome (she can follow it for splashes).
import { animate, AnimatePresence, motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { burst, pick, say, SparklePuppet, sounds, stopSpeaking, useAlive, useElementSize, useLandscape, usePointerDrag, wait, type PuppetHandle } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { PromptBubble } from '../../../../kit/Stage'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'
import { Lupa } from '../../puppets/Lupa'
import type { WordId } from '../../WordCard'
import { water } from './audio'
import { BAYS, bayCenter, bayX, BUILT_FROM, CHANNEL_START, groundY, KINDS, lineY, makeGeom, ROCK, ROUNDS, TROUGH, WORLD_END, XB, type Geom, type Kind } from './geom'
import { ArchShape, ArchSvg, BackHills, GapOutline, GROOVE_DRY, inkW, Road, STONE, Terrain, Trough, TroughWall, WATER, WATER_DEEP } from './Stone'

const T = L.trevi
type Phase = 'spring' | 'build' | 'waterOn' | 'flowing' | 'rome'
type Pt = { x: number; y: number }
/** Where Rome is in the background pictures (fraction of the picture). */
const ROME = { wide: { x: 0.925, y: 0.37 }, tall: { x: 0.85, y: 0.37 } }

export function Aqueduct({ onStep, onDone, showWord }: { onStep: () => void; onDone: () => void; showWord: (w: WordId) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const { width: W, height: H } = useElementSize(box)
  const landscape = useLandscape()
  const alive = useAlive()
  const g = W > 0 && H > 0 ? makeGeom(W, H) : null
  const G = useRef(g)
  G.current = g

  const lupa = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const [phase, setPhase] = useState<Phase>('spring')
  const [prompt, setPrompt] = useState<{ text: string; speak: boolean } | null>({ text: T.listen, speak: true })
  const [taps, setTaps] = useState(0)
  const [rockHint, setRockHint] = useState(false)
  const [rings, setRings] = useState<{ id: number; x: number; y: number }[]>([])
  const [round, setRound] = useState(0)
  const [placed, setPlaced] = useState<number[]>([])
  const [trial, setTrial] = useState<{ bay: number; kind: Kind } | null>(null)
  const [hidden, setHidden] = useState<Kind[]>([]) // tray arches that are out of the tray (dragged away)
  const [back, setBack] = useState<{ kind: Kind; dx: number; dy: number; n: number } | null>(null)
  const [hint, setHint] = useState<{ bay: number; kind: Kind } | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [selBay, setSelBay] = useState<number | null>(null)
  const [selKind, setSelKind] = useState<Kind | null>(null)
  const [splashes, setSplashes] = useState<{ id: number; x: number; y: number }[]>([])
  const [rome, setRome] = useState(false)
  const busy = useRef(false)
  const entry = useRef(new Map<number, Pt>())
  const nextId = useRef(0)
  const lastSplash = useRef(0)

  // Camera: world x (in arch widths) at the screen's left edge. The water's head, in world x.
  const cam = useMotionValue(0)
  const head = useMotionValue(XB)
  const camSet = useRef(false)
  useEffect(() => {
    if (!g) return
    if (!camSet.current || phase === 'spring' || phase === 'build' || phase === 'waterOn') cam.set(phase === 'build' && round === 1 ? g.cam2 : g.cam1)
    camSet.current = true
  }, [g?.A, g?.cam1, g?.cam2])
  const camPx = useTransform(cam, (c) => -c * (G.current?.A ?? 0))

  useEffect(() => {
    const t = setTimeout(() => void sparkle.current?.play('wave'), 700)
    return () => clearTimeout(t)
  }, [])

  const say2 = async (...lines: Parameters<typeof say>[0][]) => {
    for (const l of lines) {
      if (!alive()) return false
      await say(l)
    }
    return alive()
  }

  // ---------- 1. Find the spring ----------
  const tapHill = (e: RPointerEvent | React.MouseEvent) => {
    if (phase !== 'spring' || !g || busy.current) return
    const r = box.current!.getBoundingClientRect()
    const wx = e.clientX - r.left + cam.get() * g.A
    const wy = e.clientY - r.top
    const id = nextId.current++
    setRings((rs) => [...rs.slice(-4), { id, x: wx, y: wy }])
    setTimeout(() => setRings((rs) => rs.filter((q) => q.id !== id)), 1300)
    const n = taps + 1
    setTaps(n)
    water.gurgle(Math.min(2, n - 1))
    void lupa.current?.play(n === 1 ? 'sniff' : n === 2 ? 'nod' : 'cheer')
    if (n === 1) void say(T.hear)
    else if (n === 2) void say(T.louder)
    else void found()
  }
  const tapElsewhere = () => {
    if (phase !== 'spring' || busy.current) return
    sounds.pop()
    setRockHint(true)
    void lupa.current?.play('sniff')
    void say(taps >= 2 ? T.tapRocks : T.listen)
  }
  const found = async () => {
    busy.current = true
    setRockHint(false)
    setPrompt(null)
    sfx.splash()
    sounds.correct()
    onStep()
    if (g && box.current) {
      const x = (ROCK.mouth - cam.get()) * g.A
      burst(x / W, lineY(g, ROCK.mouth) / H)
    }
    showWord('acqua')
    void sparkle.current?.play('cheer')
    if (!(await say2(T.found))) return
    void sparkle.current?.play('wave')
    // The tray arrives while Sparkle tells the story, so she can start building whenever she likes.
    setPhase('build')
    busy.current = false
    if (!(await say2(T.girl1, T.girl2))) return
    if (placedRef.current === 0 && !trialRef.current) setPrompt({ text: T.drag, speak: true })
  }
  const trialRef = useRef(false)
  trialRef.current = !!trial
  const placedRef = useRef(0)
  placedRef.current = placed.length

  // ---------- 2. Build ----------
  const gaps = ROUNDS[round].gaps
  const open = gaps.filter((b) => !placed.includes(b))

  /** Which open gap is the arch over? (center x within ~3/4 of a bay, lifted off the road) */
  const hitGap = (cx: number, bottom: number) => {
    const gg = G.current
    if (!gg || phase !== 'build' || trial) return null
    if (bottom > gg.feet - gg.A * 0.45) return null
    const wx = cx / gg.A + cam.get()
    let best: number | null = null
    let bd = 0.8
    for (const b of open) {
      const d = Math.abs(bayCenter(b) - wx)
      if (d < bd) ((bd = d), (best = b))
    }
    return best
  }

  const drop = (kind: Kind, bay: number, from: Pt) => {
    if (!g || trial) return
    setSelBay(null)
    setSelKind(null)
    setHover(null)
    // Where the arch will stand, in screen px (top-left), so it can glide in from where she let go.
    const to = { x: (bayX(bay) - cam.get()) * g.A, y: groundY(g, bayCenter(bay)) - KINDS[kind] * g.A }
    const off = { x: from.x - to.x, y: from.y - to.y }
    setHidden((h) => [...h, kind])
    if (BAYS[bay] === kind) {
      entry.current.set(bay, off)
      const nowPlaced = [...placed, bay]
      setPlaced(nowPlaced)
      setHint(null)
      setPrompt((p) => (p?.text === T.glowing ? { text: round === 0 ? T.drag : T.round2, speak: false } : p))
      onStep()
      setTimeout(() => {
        sfx.thump()
        sounds.correct()
      }, 260)
      void lupa.current?.play('cheer')
      const line = pick(T.fits)
      if (line === T.fits[1]) showWord('perfetto')
      else if (line === T.fits[2]) showWord('brava')
      const done = gaps.every((b) => nowPlaced.includes(b))
      if (!done) {
        void say(line)
        return
      }
      void roundDone(line)
    } else {
      // Wrong height: it stands there with the channel tilted uphill, a drop rolls back, then it goes home.
      setTrial({ bay, kind })
      setPrompt(null) // keep the view clear: the channel tilting up is the lesson
      setTimeout(() => sounds.oops(), 300)
      void lupa.current?.play('shake')
      void sparkle.current?.play('think')
      void say(T.downhill)
      setTimeout(() => {
        if (!alive()) return
        const gg = G.current!
        const slots = gg.tray(ROUNDS[round].tray.length)
        const i = ROUNDS[round].tray.indexOf(kind)
        const at = { x: (bayX(bay) - cam.get()) * gg.A, y: groundY(gg, bayCenter(bay)) - KINDS[kind] * gg.A }
        setTrial(null)
        setHidden((h) => h.filter((k) => k !== kind))
        setBack({ kind, dx: at.x - slots[i], dy: at.y - (gg.feet - KINDS[kind] * gg.A), n: nextId.current++ })
        setHint({ bay, kind: BAYS[bay] })
        setPrompt({ text: T.glowing, speak: true })
      }, 2100)
    }
  }

  const roundDone = async (line: Parameters<typeof say>[0]) => {
    busy.current = true
    setPrompt(null)
    await wait(500)
    if (!alive()) return
    burst(0.5, 0.45)
    sounds.fanfare()
    void sparkle.current?.play('cheer')
    await say(line)
    if (!alive() || !G.current) return
    const gg = G.current
    if (round === 0) {
      if (!(await say2(T.aqueduct))) return
      setHidden([])
      setRound(1)
      if (gg.cam2 !== gg.cam1) await animate(cam, gg.cam2, { duration: 1.4, ease: 'easeInOut' })
      if (!alive()) return
      busy.current = false
      setPrompt({ text: T.round2, speak: true })
    } else {
      setPhase('waterOn')
      if (gg.cam2 !== gg.cam1) await animate(cam, gg.cam1, { duration: 1.4, ease: 'easeInOut' })
      if (!alive()) return
      busy.current = false
      setPrompt({ text: T.waterOn, speak: true })
    }
  }

  const tapGap = (bay: number) => {
    if (phase !== 'build' || trial || busy.current) return
    sounds.pop()
    if (selKind && g) {
      const i = ROUNDS[round].tray.indexOf(selKind)
      const x = g.tray(ROUNDS[round].tray.length)[i]
      drop(selKind, bay, { x, y: g.feet - KINDS[selKind] * g.A })
      return
    }
    setSelBay(bay)
    void say(T.pickArch)
  }
  const tapArch = (kind: Kind) => {
    if (phase !== 'build' || trial || busy.current) return
    if (selBay !== null && g) {
      const i = ROUNDS[round].tray.indexOf(kind)
      const x = g.tray(ROUNDS[round].tray.length)[i]
      drop(kind, selBay, { x, y: g.feet - KINDS[kind] * g.A })
      return
    }
    sounds.pickup()
    setSelKind((k) => (k === kind ? null : kind))
  }

  // ---------- 3. Water on ----------
  const endX = g ? g.cam2 + g.W / g.A + 0.5 : WORLD_END
  const waterOn = async () => {
    if (phase !== 'waterOn' || !g) return
    stopSpeaking()
    setPhase('flowing')
    onStep()
    sounds.whoosh()
    sfx.splash()
    void lupa.current?.play('cheer')
    setPrompt({ text: T.follow, speak: true })
    const gg = g
    const view = gg.W / gg.A
    const unsub = head.on('change', (h) => {
      if (gg.cam2 !== gg.cam1) cam.set(Math.min(gg.cam2, Math.max(gg.cam1, h - view * 0.62)))
    })
    await animate(head, endX, { duration: 3 + (endX - XB) * 0.42, ease: 'linear' })
    unsub()
    if (!alive()) return
    setPhase('rome')
    setPrompt(null)
    setRome(true)
    sounds.sparkle()
    const rp = landscape ? ROME.wide : ROME.tall
    const ratio = landscape ? 1.5 : 1024 / 1536
    const bw = Math.max(gg.W, gg.H * ratio)
    const bh = bw / ratio
    burst(((gg.W - bw) / 2 + rp.x * bw) / gg.W, ((gg.H - bh) / 2 + rp.y * bh) / gg.H)
    void lupa.current?.play('howl')
    void sparkle.current?.play('cheer')
    await say(T.toRome)
    await wait(600)
    if (alive()) onDone()
  }

  // She follows the water with her finger: little splashes where it has already arrived.
  const follow = (e: RPointerEvent) => {
    if ((phase !== 'flowing' && phase !== 'rome') || !g) return
    const now = performance.now()
    if (now - lastSplash.current < 90) return
    const r = box.current!.getBoundingClientRect()
    const wx = (e.clientX - r.left) / g.A + cam.get()
    if (wx > head.get() || wx < CHANNEL_START) return
    const gy = lineY(g, wx) - TROUGH * g.A * 0.62
    if (Math.abs(e.clientY - r.top - gy) > g.A * 0.7) return
    lastSplash.current = now
    water.drip()
    const id = nextId.current++
    setSplashes((s) => [...s.slice(-8), { id, x: wx * g.A, y: gy }])
    setTimeout(() => setSplashes((s) => s.filter((q) => q.id !== id)), 700)
  }

  const bg = landscape ? art.bgAqueduct : art.bgAqueductTall
  const bigH = g ? Math.max(g.friendH, landscape ? Math.min(1.7 * g.A, W * 0.3, H * 0.3) : Math.min(W * 0.4, H * 0.28)) : 0
  // Where the painting's meadow starts (its hard ground edge), in screen px: the back hills cover it.
  const bgRatio = landscape ? 1.5 : 1024 / 1536
  const bgW = Math.max(W, H * bgRatio)
  const bgH = bgW / bgRatio
  const horizon = { y: (H - bgH) / 2 + (landscape ? 0.5674 : 0.531) * bgH, h: bgH }
  const friendScale = g && phase === 'build' ? g.friendH / bigH : 1
  const trayKinds = ROUNDS[round].tray
  return (
    <div ref={box} onPointerMove={follow} onPointerDown={follow} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: `#B3D268 url(${bg}) center / cover`, touchAction: 'none' }}>
      {g && (
        <>
          <BackHills W={W} H={H} horizon={horizon} A={g.A} />
          {phase === 'spring' && <div aria-hidden onClick={tapElsewhere} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />}
          <motion.div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: H, x: camPx, zIndex: 2 }}>
            <World g={g} phase={phase} taps={taps} placed={placed} round={round} trial={trial} hint={hint} hover={hover} selBay={selBay} entry={entry.current} rings={rings} splashes={splashes} head={head} rockHint={rockHint} />
            {phase === 'spring' && (
              <button
                aria-label="The hill"
                onClick={tapHill}
                style={{ position: 'absolute', left: -1.6 * g.A, top: lineY(g, 0) - 0.9 * g.A, width: (XB + 1.3) * g.A, height: 2.1 * g.A, background: 'none', border: 'none', padding: 0, borderRadius: '40% 40% 0 0', zIndex: 3 }}
              />
            )}
            {phase === 'spring' && taps === 0 && (
              <motion.div
                aria-hidden
                animate={{ y: [0, -g.A * 0.22, 0], scale: [1, 0.92, 1] }}
                transition={{ repeat: Infinity, duration: 1.1 }}
                style={{ position: 'absolute', left: ROCK.mouth * g.A, top: lineY(g, 0) + g.A * 0.12, translate: '-50% 0', fontSize: Math.max(40, g.A * 0.55), pointerEvents: 'none', zIndex: 4, filter: 'drop-shadow(0 4px 4px rgba(110,59,36,.3))' }}
              >
                👆
              </motion.div>
            )}
            {phase === 'build' &&
              open.map((b) => (
                <button
                  key={b}
                  aria-label="Gap"
                  onClick={() => tapGap(b)}
                  style={{ position: 'absolute', left: bayX(b) * g.A, top: lineY(g, bayCenter(b)) - TROUGH * g.A, width: g.A, height: (KINDS[BAYS[b]] + TROUGH) * g.A, background: 'none', border: 'none', padding: 0, zIndex: 3 }}
                />
              ))}
            {phase === 'waterOn' && (
              <motion.button
                aria-label="Turn on the water"
                className="world-glow"
                onClick={waterOn}
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ scale: { repeat: Infinity, duration: 1.1 } }}
                whileTap={{ scale: 0.9 }}
                style={{ position: 'absolute', left: ((ROCK.x0 + ROCK.x1) / 2) * g.A, top: lineY(g, 0) - ROCK.h * g.A * 0.55, translate: '-50% -50%', width: 'var(--target)', height: 'var(--target)', borderRadius: '50%', background: '#6EC3E6', border: `5px solid ${INK}`, color: '#fff', fontSize: 'calc(var(--target) * 0.42)', display: 'grid', placeItems: 'center', zIndex: 4, padding: 0 }}
              >
                💧
              </motion.button>
            )}
          </motion.div>

          {/* Rome lights up when the water arrives. */}
          <AnimatePresence>{rome && <RomeSparkles g={g} landscape={landscape} />}</AnimatePresence>

          {/* The near road: the arches wait here, Lupa and Sparkle stand here. */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
            <Road W={W} H={H} top={g.feet - g.A * 0.16} A={g.A} />
          </div>
          {/* The friends are a bit smaller while the tray of arches is out (it needs the road). */}
          <motion.div initial={false} animate={{ scale: friendScale }} transition={{ type: 'spring', bounce: 0.3 }} style={{ position: 'absolute', left: 8, top: g.feet - bigH * 0.985, zIndex: 8, transformOrigin: '0% 100%' }}>
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
              <Lupa ref={lupa} height={`${bigH}px`} />
            </motion.button>
          </motion.div>
          <motion.div initial={false} animate={{ scale: friendScale }} transition={{ type: 'spring', bounce: 0.3 }} style={{ position: 'absolute', right: 8, top: g.feet - bigH * 1.04, zIndex: 8, pointerEvents: 'none', transformOrigin: '100% 100%' }}>
            <SparklePuppet ref={sparkle} height={`${bigH * 1.06}px`} lookToward={-0.6} flip />
          </motion.div>

          {/* The tray: the arches stand on the road, ready to be carried up. */}
          <AnimatePresence>
            {phase === 'build' && (
              <motion.div key={round} initial={{ y: g.A * 2.6 }} animate={{ y: 0 }} exit={{ y: g.A * 2.6 }} transition={{ type: 'spring', bounce: 0.3, duration: 0.7 }} style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
                {trayKinds.map((k, i) => (
                  <TrayArch
                    key={k}
                    g={g}
                    kind={k}
                    x={g.tray(trayKinds.length)[i]}
                    gone={hidden.includes(k) || placed.some((b) => gaps.includes(b) && BAYS[b] === k)}
                    glow={hint?.kind === k}
                    selected={selKind === k}
                    back={back?.kind === k ? back : null}
                    hit={hitGap}
                    onHover={setHover}
                    onTap={tapArch}
                    onDrop={drop}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      {prompt && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 24px', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <PromptBubble text={prompt.text} speak={prompt.speak} />
          </div>
        </div>
      )}
    </div>
  )
}

/** Everything that moves with the camera, drawn in one SVG in world px (x = world units * A). */
function World(props: {
  g: Geom
  phase: Phase
  taps: number
  placed: number[]
  round: number
  trial: { bay: number; kind: Kind } | null
  hint: { bay: number } | null
  hover: number | null
  selBay: number | null
  entry: Map<number, Pt>
  rings: { id: number; x: number; y: number }[]
  splashes: { id: number; x: number; y: number }[]
  head: MotionValue<number>
  rockHint: boolean
}) {
  const { g, phase, taps, placed, round, trial, hint, hover, selBay, entry, rings, splashes, head, rockHint } = props
  const { A, H } = g
  const x0 = -6
  const x1 = WORLD_END
  const sw = inkW(A)
  const flowing = phase === 'flowing' || phase === 'rome'
  const springOut = phase !== 'spring'
  const shown = ROUNDS.slice(0, round + 1).flatMap((r) => r.gaps)
  const openGaps = phase === 'build' ? ROUNDS[round].gaps.filter((b) => !placed.includes(b)) : []
  // The dotted channel line: from the hill to the end of the gaps shown so far.
  const lineEnd = phase === 'spring' ? XB : bayX(Math.max(...shown) + 1)
  const groove = (x: number) => lineY(g, x) - TROUGH * A * 0.62
  const rockW = (ROCK.x1 - ROCK.x0) * A
  const rockH = ROCK.h * A
  const rockY = lineY(g, (ROCK.x0 + ROCK.x1) / 2) - rockH + A * 0.04
  const mouth = { x: ROCK.mouth * A, y: lineY(g, ROCK.mouth) - A * 0.06 }
  const headPx = useTransform(head, (h) => h * A)
  const headY = useTransform(head, (h) => groove(h))
  const waterW = useTransform(head, (h) => Math.max(0, (h - XB) * A))
  return (
    <svg width={(x1 - x0) * A} height={H} viewBox={`${x0 * A} 0 ${(x1 - x0) * A} ${H}`} style={{ position: 'absolute', left: x0 * A, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <defs>
        <clipPath id="trevi-water-clip">
          <motion.rect x={XB * A} y={0} height={H} style={{ width: waterW }} />
        </clipPath>
      </defs>
      {/* Gap outlines and arches stand behind the terrain, so their feet are planted in the ground. */}
      {openGaps.map((b) => {
        const h = groundY(g, bayCenter(b)) - lineY(g, bayCenter(b))
        return (
          <g key={`gap${b}`} transform={`translate(${bayX(b) * A} ${lineY(g, bayCenter(b))})`}>
            <GapOutline w={A} h={h} glow={hint?.bay === b || hover === b || selBay === b} />
          </g>
        )
      })}
      {placed.map((b) => {
        const off = entry.get(b) ?? { x: 0, y: 0 }
        const top = lineY(g, bayCenter(b))
        return (
          <motion.g key={`arch${b}`} initial={{ x: bayX(b) * A + off.x, y: top + off.y }} animate={{ x: bayX(b) * A, y: top }} transition={{ type: 'spring', bounce: 0.25, duration: 0.45 }}>
            <ArchShape w={A} h={KINDS[BAYS[b]] * A} foot={A * 1.1} />
          </motion.g>
        )
      })}
      {trial && <TrialArch g={g} bay={trial.bay} kind={trial.kind} />}
      {/* Toward Rome, the Romans already built the arches. */}
      {Array.from({ length: WORLD_END - XB - BUILT_FROM }, (_, i) => {
        const b = BUILT_FROM + i
        const top = lineY(g, bayCenter(b))
        return (
          <g key={`built${b}`} transform={`translate(${bayX(b) * A} ${top})`}>
            <ArchShape w={A} h={groundY(g, bayCenter(b)) - top} foot={A * 0.8} />
          </g>
        )
      })}
      <TroughWall g={g} x0={CHANNEL_START} x1={XB} />
      <Terrain g={g} x0={x0} x1={x1} bottom={H + 10} floor={g.feet - A * 0.16} />

      {/* Dust puffs where an arch just landed. */}
      {placed.map((b) => (
        <Dust key={`dust${b}`} x={bayCenter(b) * A} y={groundY(g, bayCenter(b))} A={A} />
      ))}

      {/* The channel: on the hill and on the land toward Rome it rests on a low wall; on the arches it rides on top. */}
      <Trough g={g} x0={CHANNEL_START} x1={XB} />
      <Trough g={g} x0={bayX(BUILT_FROM)} x1={x1} />
      {placed.map((b) => (
        <motion.g key={`tr${b}`} initial={{ opacity: 0, y: -A * 0.3 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}>
          <Trough g={g} x0={bayX(b)} x1={bayX(b) + 1} />
        </motion.g>
      ))}
      {phase === 'build' && (
        <path d={`M${XB * A} ${groove(XB)} L${lineEnd * A} ${groove(lineEnd)}`} stroke="#fff" strokeWidth={sw * 1.1} strokeDasharray={`${sw * 0.2} ${sw * 2.6}`} strokeLinecap="round" opacity={0.95} />
      )}

      {/* The spring rock (a generated sticker) sits on the hilltop. */}
      <motion.g
        animate={phase === 'spring' ? { scale: rockHint ? [1, 1.07, 1] : [1, 1.035, 1] } : { scale: 1 }}
        transition={phase === 'spring' ? { repeat: Infinity, duration: rockHint ? 1 : 1.4 } : undefined}
        style={{ originX: `${ROCK.mouth * A}px`, originY: `${lineY(g, ROCK.mouth)}px` }}
      >
        {phase === 'spring' && <motion.ellipse cx={(ROCK.x0 + ROCK.x1) * A * 0.5} cy={rockY + rockH * 0.55} rx={rockW * 0.62} ry={rockH * 0.7} fill="#FFE27A" animate={{ opacity: rockHint ? [0.4, 0.75, 0.4] : [0.15, 0.45, 0.15] }} transition={{ repeat: Infinity, duration: 1.4 }} />}
        {false && <ellipse cx={(ROCK.x0 + ROCK.x1) * A * 0.5} cy={rockY + rockH * 0.55} rx={rockW * 0.62} ry={rockH * 0.7} fill="#FFE27A" opacity={0.55} />}
        <image href={art.springRock} x={ROCK.x0 * A} y={rockY} width={rockW} height={rockH} />
      </motion.g>

      {/* "Listen!": sound waves pulse out of the rocks until she has found the spring. */}
      {phase === 'spring' && <ListenWaves x={(ROCK.x1 + 0.05) * A} y={rockY + rockH * 0.45} A={A} />}
      {/* Before she finds it: a little wet glint at the rock's mouth that grows with each tap. */}
      {!springOut && taps > 0 && (
        <motion.ellipse key={taps} cx={mouth.x} cy={mouth.y} initial={{ rx: 0, ry: 0 }} animate={{ rx: A * 0.06 * taps, ry: A * 0.025 * taps }} fill={WATER} stroke={INK} strokeWidth={sw * 0.6} />
      )}
      {rings.map((r) => (
        <SoundRings key={r.id} x={r.x} y={r.y} A={A} />
      ))}

      {/* After: the spring bubbles, a little pool forms at its foot, and water runs into the hill channel. */}
      {springOut && (
        <g>
          <motion.path
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8 }}
            style={{ originX: `${mouth.x}px` }}
            d={`M${mouth.x - A * 0.28} ${lineY(g, 0) + sw * 0.3} Q${mouth.x} ${lineY(g, 0) - A * 0.1} ${mouth.x + A * 0.4} ${lineY(g, 0) + sw * 0.3} Z`}
            fill={WATER}
            stroke={INK}
            strokeWidth={sw * 0.8}
            strokeLinejoin="round"
          />
          <Bubbles x={mouth.x} y={mouth.y} A={A} />
          <path d={`M${CHANNEL_START * A + sw} ${groove(CHANNEL_START)} L${XB * A} ${groove(XB)}`} stroke={WATER_DEEP} strokeWidth={TROUGH * A * 0.4} strokeLinecap="round" />
          <motion.path d={`M${CHANNEL_START * A + sw} ${groove(CHANNEL_START)} L${XB * A} ${groove(XB)}`} stroke="#fff" strokeWidth={TROUGH * A * 0.12} strokeDasharray={`${A * 0.12} ${A * 0.2}`} strokeLinecap="round" opacity={0.85} animate={{ strokeDashoffset: [0, -A * 0.32] }} transition={{ repeat: Infinity, ease: 'linear', duration: 0.35 }} />
          {!flowing && <Dribble x={XB * A} y={groove(XB)} to={groundY(g, XB + 0.1)} A={A} />}
        </g>
      )}

      {/* Water on: it runs along the whole channel toward Rome. */}
      {flowing && (
        <g clipPath="url(#trevi-water-clip)">
          <path d={`M${XB * A} ${groove(XB)} L${x1 * A} ${groove(x1)}`} stroke={WATER_DEEP} strokeWidth={TROUGH * A * 0.4} strokeLinecap="round" />
          <motion.path d={`M${XB * A} ${groove(XB)} L${x1 * A} ${groove(x1)}`} stroke="#fff" strokeWidth={TROUGH * A * 0.12} strokeDasharray={`${A * 0.12} ${A * 0.2}`} strokeLinecap="round" opacity={0.85} animate={{ strokeDashoffset: [0, -A * 0.32] }} transition={{ repeat: Infinity, ease: 'linear', duration: 0.35 }} />
        </g>
      )}
      {phase === 'flowing' && <motion.circle cx={headPx} cy={headY} r={TROUGH * A * 0.32} fill={WATER} stroke={INK} strokeWidth={sw * 0.6} />}
      {splashes.map((s) => (
        <Splash key={s.id} x={s.x} y={s.y} A={A} />
      ))}
    </svg>
  )
}

/**
 * A wrong arch: it stands in the gap, and the channel on it has to go UPHILL (a ramp up onto an arch that is too tall,
 * or up from one that is too short to the next one), so a drop rolls backward down it.
 */
function TrialArch({ g, bay, kind }: { g: Geom; bay: number; kind: Kind }) {
  const { A } = g
  const h = KINDS[kind] * A
  const top = groundY(g, bayCenter(bay)) - h
  const x = bayX(bay) * A
  const t = TROUGH * A
  const tooTall = KINDS[kind] > KINDS[BAYS[bay]]
  const L = tooTall ? { x, y: lineY(g, bayX(bay)) } : { x, y: top }
  const R = tooTall ? { x: x + A, y: top } : { x: x + A, y: lineY(g, bayX(bay) + 1) }
  const len = Math.hypot(R.x - L.x, R.y - L.y)
  const angle = (Math.atan2(R.y - L.y, R.x - L.x) * 180) / Math.PI
  const sw = inkW(A)
  return (
    <g>
      <motion.g initial={{ y: -A * 0.4 }} animate={{ y: 0 }} transition={{ type: 'spring', bounce: 0.4, duration: 0.4 }}>
        <g transform={`translate(${x} ${top})`}>
          <ArchShape w={A} h={h} foot={A * 1.1} />
        </g>
        <g transform={`translate(${L.x} ${L.y})`}>
          <motion.g initial={{ rotate: 0, opacity: 0 }} animate={{ rotate: [0, angle * 1.15, angle * 0.94, angle], opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} style={{ originX: '0px', originY: '0px' }}>
            <rect x={0} y={-t} width={len} height={t} fill={STONE} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
            <path d={`M${sw} ${-t * 0.62} H${len - sw}`} stroke={GROOVE_DRY} strokeWidth={t * 0.36} strokeLinecap="round" />
            <motion.circle cx={0} cy={0}
              r={t * 0.32}
              fill={WATER}
              stroke={INK}
              strokeWidth={sw * 0.6}
              initial={{ x: len - t, y: -t * 0.95, opacity: 0 }}
              animate={{ x: [len - t, len - t, t * 0.2, -t * 0.6], y: [-t * 0.95, -t * 0.95, -t * 0.95, t * 1.6], opacity: [0, 1, 1, 0] }}
              transition={{ delay: 0.9, duration: 1.1, times: [0, 0.1, 0.75, 1], ease: 'easeIn' }}
            />
          </motion.g>
        </g>
      </motion.g>
    </g>
  )
}

function Dust({ x, y, A }: { x: number; y: number; A: number }) {
  return (
    <g>
      {[-0.55, -0.3, 0.3, 0.55].map((d, i) => (
        <motion.circle
          key={i}
          cx={0}
          cy={0}
          fill="#F2E3CC"
          stroke={INK}
          strokeWidth={inkW(A) * 0.5}
          r={0}
          initial={{ r: 0, opacity: 0, x: x + d * A, y }}
          animate={{ r: [0, A * 0.1, A * 0.13], opacity: [0, 1, 0], x: x + d * A * 1.5, y: y - A * 0.12 }}
          transition={{ delay: 0.28, duration: 0.7 }}
        />
      ))}
    </g>
  )
}

/** "Listen": sound rings spread from where she tapped. */
function SoundRings({ x, y, A }: { x: number; y: number; A: number }) {
  return (
    <g>
      {[0, 0.18, 0.36].map((d) => (
        <motion.circle key={d} cx={x} cy={y} fill="none" stroke="#fff" strokeWidth={inkW(A)} initial={{ r: A * 0.05, opacity: 0.95 }} animate={{ r: A * 0.6, opacity: 0 }} transition={{ delay: d, duration: 0.8, ease: 'easeOut' }} />
      ))}
      {[-1, 0, 1].map((d) => (
        <motion.path
          key={d}
          d={`M0 ${-A * 0.11} C${A * 0.07} ${-A * 0.02} ${A * 0.06} ${A * 0.04} 0 ${A * 0.04} C${-A * 0.06} ${A * 0.04} ${-A * 0.07} ${-A * 0.02} 0 ${-A * 0.11} Z`}
          fill={WATER}
          stroke={INK}
          strokeWidth={inkW(A) * 0.5}
          initial={{ x, y, opacity: 1 }}
          animate={{ x: x + d * A * 0.3, y: [y, y - A * 0.45, y - A * 0.1], opacity: [1, 1, 0] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </g>
  )
}

/** Little sound-wave arcs ")))" beside the rocks, looping: something is making a noise in there. */
function ListenWaves({ x, y, A }: { x: number; y: number; A: number }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${x + A * (0.08 + i * 0.12)} ${y - A * (0.14 + i * 0.06)} q${A * (0.09 + i * 0.03)} ${A * (0.14 + i * 0.06)} 0 ${A * (0.28 + i * 0.12)}`}
          fill="none"
          stroke="#fff"
          strokeWidth={inkW(A) * 1.4}
          strokeLinecap="round"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.22 }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={`l${i}`}
          d={`M${x - A * (1.38 + i * 0.12)} ${y - A * (0.14 + i * 0.06)} q${-A * (0.09 + i * 0.03)} ${A * (0.14 + i * 0.06)} 0 ${A * (0.28 + i * 0.12)}`}
          fill="none"
          stroke="#fff"
          strokeWidth={inkW(A) * 1.4}
          strokeLinecap="round"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.22 }}
        />
      ))}
    </g>
  )
}

/** Bubbles rising out of the spring. */
function Bubbles({ x, y, A }: { x: number; y: number; A: number }) {
  return (
    <g>
      {[0, 0.5, 1, 1.5].map((d, i) => (
        <motion.circle cy={0}
          key={i}
          cx={x + (i - 1.5) * A * 0.06}
          r={A * (0.03 + (i % 2) * 0.015)}
          fill="#E4F6FF"
          stroke={INK}
          strokeWidth={inkW(A) * 0.45}
          initial={{ y: y, opacity: 0 }}
          animate={{ y: [y, y - A * 0.35], opacity: [0, 1, 0] }}
          transition={{ delay: d * 0.6, duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </g>
  )
}

/** Water dribbling off the end of the unfinished channel. */
function Dribble({ x, y, to, A }: { x: number; y: number; to: number; A: number }) {
  return (
    <g>
      <path d={`M${x} ${y} Q${x + A * 0.12} ${y} ${x + A * 0.12} ${y + A * 0.2} L${x + A * 0.12} ${to}`} fill="none" stroke={WATER} strokeWidth={A * 0.05} strokeLinecap="round" />
      {[0, 0.4, 0.8].map((d) => (
        <motion.circle cy={0} key={d} cx={x + A * 0.12} r={A * 0.035} fill={WATER} stroke={INK} strokeWidth={inkW(A) * 0.4} initial={{ y: y + A * 0.2 }} animate={{ y: [y + A * 0.2, to], opacity: [1, 0.6] }} transition={{ delay: d, duration: 1.2, repeat: Infinity, ease: 'easeIn' }} />
      ))}
    </g>
  )
}

function Splash({ x, y, A }: { x: number; y: number; A: number }) {
  return (
    <g>
      {[-1, -0.4, 0.4, 1].map((d) => (
        <motion.circle cx={0} cy={0} key={d} r={A * 0.035} fill={WATER} stroke={INK} strokeWidth={inkW(A) * 0.4} initial={{ x: x, y: y, opacity: 1 }} animate={{ x: x + d * A * 0.22, y: [y, y - A * (0.3 - Math.abs(d) * 0.08), y - A * 0.05], opacity: [1, 1, 0] }} transition={{ duration: 0.6, ease: 'easeOut' }} />
      ))}
    </g>
  )
}

/** Twinkles over the little Rome in the background picture. */
function RomeSparkles({ g, landscape }: { g: Geom; landscape: boolean }) {
  const rp = landscape ? ROME.wide : ROME.tall
  const ratio = landscape ? 1.5 : 1024 / 1536
  const bw = Math.max(g.W, g.H * ratio)
  const bh = bw / ratio
  const x = (g.W - bw) / 2 + rp.x * bw
  const y = (g.H - bh) / 2 + rp.y * bh
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', left: x, top: y, zIndex: 4, pointerEvents: 'none' }}>
      {[
        [-0.5, -0.3],
        [0.4, -0.5],
        [0.1, 0.2],
        [-0.2, 0.5],
        [0.6, 0.3],
      ].map(([dx, dy], i) => (
        <motion.span
          key={i}
          animate={{ scale: [0, 1.3, 0.8, 1.2], rotate: [0, 40, 80] }}
          transition={{ delay: i * 0.12, duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
          style={{ position: 'absolute', left: dx * g.A, top: dy * g.A, translate: '-50% -50%', fontSize: g.A * 0.4 }}
        >
          ✨
        </motion.span>
      ))}
    </motion.div>
  )
}

/** An arch standing on the road. Drag it up to a gap (or tap it, then tap a gap). */
function TrayArch({ g, kind, x, gone, glow, selected, back, hit, onHover, onTap, onDrop }: {
  g: Geom
  kind: Kind
  x: number
  gone: boolean
  glow: boolean
  selected: boolean
  back: { dx: number; dy: number; n: number } | null
  hit: (cx: number, bottom: number) => number | null
  onHover: (b: number | null) => void
  onTap: (k: Kind) => void
  onDrop: (k: Kind, bay: number, from: Pt) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { A } = g
  const h = KINDS[kind] * A
  const top = g.feet - h
  const lastHover = useRef<number | null>(null)
  const hover = (b: number | null) => {
    if (b === lastHover.current) return
    lastHover.current = b
    onHover(b)
  }
  usePointerDrag(ref, {
    disabled: gone,
    onStart: () => {
      const el = ref.current!
      el.style.transition = 'none'
      el.style.zIndex = '30'
      el.style.filter = 'drop-shadow(0 12px 10px rgba(43,35,48,.25))'
      sounds.pickup()
    },
    onMove: (i) => {
      ref.current!.style.transform = `translate(${i.dx}px, ${i.dy}px) scale(1.05)`
      hover(hit(x + A / 2 + i.dx, g.feet + i.dy))
    },
    onEnd: (i) => {
      const el = ref.current!
      hover(null)
      el.style.filter = ''
      const bay = hit(x + A / 2 + i.dx, g.feet + i.dy)
      if (bay !== null) {
        el.style.transition = 'none'
        el.style.transform = 'none'
        el.style.zIndex = ''
        onDrop(kind, bay, { x: x + i.dx, y: top + i.dy })
        return
      }
      el.style.transition = 'transform .4s cubic-bezier(.3,1.3,.5,1)'
      el.style.transform = 'none'
      setTimeout(() => {
        if (ref.current) ref.current.style.zIndex = ''
      }, 400)
    },
    onTap: () => onTap(kind),
    onCancel: () => {
      const el = ref.current!
      el.style.transform = 'none'
      el.style.filter = ''
      hover(null)
    },
  })
  // Coming back from a gap where it didn't fit: fly home with a little wiggle.
  useEffect(() => {
    const el = ref.current
    if (!back || !el) return
    el.animate(
      [
        { transform: `translate(${back.dx}px, ${back.dy}px)` },
        { transform: 'translate(0px, -20px) rotate(-6deg)', offset: 0.6 },
        { transform: 'translate(0px, 0px) rotate(5deg)', offset: 0.8 },
        { transform: 'translate(0px, 0px) rotate(0deg)' },
      ],
      { duration: 800, easing: 'ease-out' },
    )
  }, [back?.n])
  return (
    <div
      ref={ref}
      role="img"
      aria-label={`Arch ${kind}`}
      data-arch={kind}
      style={{ position: 'absolute', left: x, top, width: A, height: h, pointerEvents: gone ? 'none' : 'auto', visibility: gone ? 'hidden' : 'visible', touchAction: 'none', cursor: 'grab', willChange: 'transform' }}
    >
      <motion.div
        animate={glow ? { filter: ['drop-shadow(0 0 2px #FFC83D) drop-shadow(0 0 2px #FFC83D)', 'drop-shadow(0 0 10px #FFC83D) drop-shadow(0 0 6px #FFB000)', 'drop-shadow(0 0 2px #FFC83D) drop-shadow(0 0 2px #FFC83D)'], y: [0, -14, 0], scale: [1, 1.06, 1] } : { filter: selected ? 'drop-shadow(0 0 8px #FFC83D) drop-shadow(0 0 4px #FFB000)' : 'drop-shadow(0 0 0px #FFC83D) drop-shadow(0 0 0px #FFC83D)', y: selected ? -A * 0.15 : 0, scale: 1 }}
        transition={glow ? { repeat: Infinity, duration: 1.1 } : { type: 'spring', bounce: 0.5 }}
      >
        <ArchSvg w={A} h={h} />
      </motion.div>
    </div>
  )
}

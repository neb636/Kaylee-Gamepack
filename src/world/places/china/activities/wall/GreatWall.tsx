// 🧱 The Great Wall (near Beijing). Hou Hou knocked bricks off the wall! The wall is a long panorama wider than the
// screen: Kaylee slides the landscape sideways (or taps the big arrow) to follow Hou Hou to each gap, then drags the
// missing brick of a pattern into the hole (AB, ABB, ABC). Payoff: a signal fire on the beacon tower jumps from tower to
// tower along the wall. No failing: a wrong brick wiggles, Hou Hou shakes his head, and the right brick glows.
import { motion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { burst, Piece, PlayArea, say, shuffle, sounds, Target, useAlive, useElementSize, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import { HouHou } from '../../puppets/HouHou'
import { INK } from '../../puppets/ink'
import type { ActivityProps } from '../../Place'
import { Brick, BRICK_RATIO, BRICKS, WallWalk, type BrickColor, type WallGeom } from './Bricks'

const W_ = L.wall
const TOTAL = 4
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** The three patterns: the whole sequence, which places are missing, and the bricks she can choose from. */
const GAPS: { seq: string; missing: number[]; choices: BrickColor[] }[] = [
  { seq: 'rgrgr', missing: [4], choices: ['r', 'g'] },
  { seq: 'rggrgg', missing: [5], choices: ['r', 'g'] },
  { seq: 'rgjrgj', missing: [4, 5], choices: ['r', 'g', 'j'] },
]
/** The painted watchtowers in the panorama (x%, y%), from the far end back toward the big one. Flames sit on their roofs. */
const PAINTED = [
  { x: 86, y: 28, s: 0.035 },
  { x: 80, y: 43, s: 0.04 },
  { x: 67, y: 39, s: 0.05 },
  { x: 51.5, y: 31, s: 0.06 },
  { x: 31.5, y: 21, s: 0.075 },
  { x: 10, y: 18, s: 0.11 },
]

interface Geom extends WallGeom {
  top: number
  B: number
  Bh: number
  pitch: number
  pad: number
  rowY: number
  houH: number
  footY: number
  towerW: number
  towerH: number
  towerCx: number
  towerTop: number
}

function makeGeom(W: number, H: number): Geom {
  const pw = Math.max(H * 3, W)
  const hh = pw / 3
  const B = clamp(Math.min(hh * 0.108, (W - 70) / 7), 64, 112)
  const Bh = B * BRICK_RATIO
  const pitch = B * 1.08
  const pad = B * 0.12
  const towerH = hh * 0.36
  const towerW = (towerH * 479) / 512
  const towerCx = pw - towerW / 2 - hh * 0.06
  const towerLeft = towerCx - towerW / 2
  const widths = GAPS.map((g) => g.seq.length * pitch + pad * 2)
  const start = hh * 0.2
  const space = Math.max(hh * 0.04, (towerLeft - hh * 0.05 - start - widths.reduce((a, b) => a + b, 0)) / 2)
  let x = start
  const gaps = widths.map((width) => {
    const gap = { left: x, width }
    x += width + space
    return gap
  })
  const walkY0 = hh * 0.635
  const walkY1 = hh * 0.705
  const faceH = Math.max(hh * 0.12, Bh + 24)
  const faceY1 = walkY1 + faceH
  return {
    pw, hh, top: H - hh, B, Bh, pitch, pad, gaps,
    parapetY: hh * 0.6, walkY0, walkY1, faceY1,
    rowY: walkY1 + (faceH - Bh) / 2,
    houH: hh * 0.3,
    footY: walkY0 + hh * 0.055,
    towerW, towerH, towerCx, towerTop: faceY1 - towerH + hh * 0.02,
  }
}

type Phase = 'story' | 'follow' | 'brick' | 'beacon' | 'fire'

export function GreatWall({ onDone, setProgress }: ActivityProps) {
  const box = useRef<HTMLDivElement>(null)
  const { width: W, height: H } = useElementSize(box)
  const alive = useAlive()
  const g = W > 0 && H > 0 ? makeGeom(W, H) : null
  const G = useRef<Geom | null>(null)
  G.current = g
  const WH = useRef({ W: 0, H: 0 })
  WH.current = { W, H }

  const hou = useRef<PuppetHandle>(null)
  const layer = useRef<HTMLDivElement>(null)
  const panRef = useRef(0)
  const glideId = useRef(0)
  const phase = useRef<Phase>('story')
  const round = useRef(0)
  const hole = useRef(0)
  const arrived = useRef(false)
  const wrongs = useRef(0)
  const beaconSaid = useRef(false)
  const patternSaid = useRef(false)
  const nudge = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [story, setStory] = useState(true)
  const [, setPhaseState] = useState<Phase>('story')
  const [rnd, setRnd] = useState(0)
  const [holeIdx, setHoleIdx] = useState(0)
  const [filled, setFilled] = useState<Record<string, boolean>>({})
  const [hint, setHint] = useState(false)
  const [glow, setGlow] = useState<BrickColor | null>(null)
  const [hidden, setHidden] = useState<BrickColor[]>([])
  const [wiggle, setWiggle] = useState<{ c: BrickColor; n: number } | null>(null)
  const [houX, setHouX] = useState(-1)
  const [houMs, setHouMs] = useState(0)
  const [dir, setDir] = useState<-1 | 0 | 1>(0)
  const [prompt, setPrompt] = useState<Line>(W_.oops)
  const [fires, setFires] = useState(0)
  const [bubble, setBubble] = useState(true)
  const [order] = useState(() => GAPS.map((gp) => shuffle(gp.choices)))
  const tapTurn = useRef(0)

  const setPhase = (p: Phase) => {
    phase.current = p
    setPhaseState(p)
  }
  const speak = async (l: Line) => {
    setPrompt(l)
    await say(l)
  }

  // ---- The camera: drag to slide, or glide. Positions live in a ref and go straight to the DOM (no re-render per move). ----
  const maxPan = () => Math.max(0, (G.current?.pw ?? 0) - WH.current.W)
  const applyPan = (x: number) => {
    panRef.current = clamp(x, 0, maxPan())
    if (layer.current) layer.current.style.transform = `translate3d(${-panRef.current}px,0,0)`
  }
  const glideTo = (target: number, ms = 900) =>
    new Promise<void>((res) => {
      const id = ++glideId.current
      const from = panRef.current
      const to = clamp(target, 0, maxPan())
      const t0 = performance.now()
      const step = (now: number) => {
        if (id !== glideId.current || !alive()) return res()
        const p = Math.min(1, (now - t0) / ms)
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
        applyPan(from + (to - from) * e)
        if (p < 1) requestAnimationFrame(step)
        else res()
      }
      requestAnimationFrame(step)
    })
  /** Where the camera should look for the current job: the gap she is fixing, or the beacon tower. */
  const targetX = () => {
    const gg = G.current
    if (!gg) return 0
    if (phase.current === 'beacon' || phase.current === 'fire') return gg.towerCx
    const gap = gg.gaps[Math.min(round.current, 2)]
    return gap.left + gap.width / 2
  }
  /** -1 / 0 / 1: the current job (gap or tower) is off to the left, on screen, or off to the right. */
  const where = (): -1 | 0 | 1 => {
    const gg = G.current
    if (!gg) return 0
    const w = WH.current.W
    const beacon = phase.current === 'beacon' || phase.current === 'fire'
    const gap = gg.gaps[Math.min(round.current, 2)]
    const l = (beacon ? gg.towerCx - gg.towerW / 2 : gap.left) - panRef.current
    const r = (beacon ? gg.towerCx + gg.towerW / 2 : gap.left + gap.width) - panRef.current
    if (r - l > w * 0.9) return l < 0 && r < w * 0.5 ? -1 : l > w * 0.5 ? 1 : 0 // wider than the screen: its middle counts
    return l < w * 0.02 ? -1 : r > w * 0.98 ? 1 : 0
  }
  const refresh = () => {
    setDir(where())
    if (where() === 0 && arrived.current) {
      if (phase.current === 'follow') void beginBricks()
      if (phase.current === 'beacon' && !beaconSaid.current) {
        beaconSaid.current = true
        void speak(W_.beacon)
      }
    }
  }
  const goToTarget = async () => {
    await glideTo(targetX() - WH.current.W * 0.55)
    refresh()
  }
  const armNudge = () => {
    clearTimeout(nudge.current)
    nudge.current = setTimeout(() => {
      if (alive() && (phase.current === 'follow' || phase.current === 'beacon') && where() !== 0) void goToTarget()
    }, 9000)
  }
  useEffect(() => () => clearTimeout(nudge.current), [])

  const drag = useRef<{ id: number; x: number; pan: number; moved: boolean } | null>(null)
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    drag.current = { id: e.pointerId, x: e.clientX, pan: panRef.current, moved: false }
    glideId.current++
  }
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 8) {
      d.moved = true
      try {
        e.currentTarget.setPointerCapture(d.id)
      } catch {
        /* pointer already gone */
      }
    }
    if (d.moved) applyPan(d.pan - dx)
  }
  const up = () => {
    const d = drag.current
    drag.current = null
    if (d?.moved) refresh()
  }

  // ---- Hou Hou runs ahead ----
  const runTo = async (x: number) => {
    const gg = G.current!
    const dist = Math.abs(x - (houX < 0 ? x : houX))
    const ms = clamp(500 + (dist / gg.hh) * 700, 600, 2600)
    setHouMs(ms)
    setHouX(x)
    if (dist < 4) return
    sounds.whoosh()
    const t0 = performance.now()
    while (performance.now() - t0 < ms - 300 && alive()) await hou.current?.play('run')
    await wait(200)
  }

  // ---- The rounds ----
  const startRound = async (r: number) => {
    round.current = r
    hole.current = 0
    wrongs.current = 0
    arrived.current = false
    patternSaid.current = false
    setRnd(r)
    setHoleIdx(0)
    setHint(false)
    setGlow(null)
    setHidden([])
    setPhase('follow')
    const gap = G.current!.gaps[r]
    await runTo(gap.left - G.current!.hh * 0.08)
    if (!alive()) return
    arrived.current = true
    void hou.current?.play('point')
    if (where() === 0) return void beginBricks()
    refresh()
    await speak(r === 0 ? W_.follow : W_.follow2)
    armNudge()
  }
  const beginBricks = async () => {
    if (phase.current !== 'follow') return
    setPhase('brick')
    clearTimeout(nudge.current)
    void hou.current?.play('point')
    if (round.current === 0 && !patternSaid.current) void sounds.pop()
    patternSaid.current = true
    await sayPattern()
  }
  const sayPattern = () => speak(round.current === 2 && hole.current === 1 ? W_.pattern3b : W_.pattern[round.current])

  const tryBrick = (c: BrickColor): boolean => {
    if (phase.current === 'follow' || (phase.current === 'brick' && !isReady())) {
      sounds.pop()
      void goToTarget()
      return false
    }
    if (phase.current !== 'brick') return false
    const gp = GAPS[round.current]
    const want = gp.seq[gp.missing[hole.current]] as BrickColor
    if (c !== want) {
      wrongs.current++
      sounds.oops()
      setWiggle({ c, n: Math.random() })
      void hou.current?.play('shake')
      setHint(true)
      setGlow(want)
      // Help: after a wrong brick the wrong choices fade away one by one, so the right one is easy to find.
      const wrongOnes = order[round.current].filter((x) => x !== want && !hidden.includes(x))
      if (wrongOnes.length > 0 && wrongs.current >= (gp.choices.length === 2 ? 2 : 1)) setHidden((h) => [...h, wrongOnes[0]])
      void speak(round.current === 2 && hole.current === 1 ? W_.hint3b : W_.hint[round.current])
      return false
    }
    // Right brick!
    const k = gp.missing[hole.current]
    sounds.correct()
    burst()
    setFilled((f) => ({ ...f, [`${round.current}-${k}`]: true }))
    setHint(false)
    setGlow(null)
    setHidden([])
    wrongs.current = 0
    if (hole.current + 1 < gp.missing.length) {
      hole.current++
      setHoleIdx(hole.current)
      void hou.current?.play('nod')
      setTimeout(() => alive() && void sayPattern(), 500)
    } else void finishGap(round.current)
    return true
  }
  const isReady = () => where() === 0
  const finishGap = async (r: number) => {
    setPhase('follow')
    arrived.current = false
    setProgress(r + 1, TOTAL)
    sounds.sparkle()
    void hou.current?.play('cheer')
    await wait(400)
    await say(W_.fixed[r])
    if (!alive()) return
    if (r < 2) {
      round.current = r + 1
      refresh()
      await startRound(r + 1)
    } else {
      round.current = 2
      await startBeacon()
    }
  }
  const startBeacon = async () => {
    setPhase('beacon')
    arrived.current = false
    beaconSaid.current = false
    setDir(1)
    await runTo(G.current!.towerCx - G.current!.hh * 0.24)
    if (!alive()) return
    arrived.current = true
    void hou.current?.play('point')
    refresh()
    armNudge()
  }
  const lightBeacon = async () => {
    if (phase.current !== 'beacon') return
    setPhase('fire')
    clearTimeout(nudge.current)
    const gg = G.current!
    void goToTarget()
    sounds.whoosh()
    setFires(1)
    void hou.current?.play('cheer')
    sounds.fanfare()
    await speak(W_.signal)
    // Fire jumps from tower to tower, and the camera follows it toward the big tower.
    setBubble(false)
    for (let i = 0; i < PAINTED.length; i++) {
      if (!alive()) return
      const t = PAINTED[i]
      await glideTo((t.x / 100) * gg.pw - WH.current.W * 0.5, 850)
      sounds.note(i * 2)
      setFires(i + 2)
      await wait(650)
    }
    burst()
    sounds.sparkle()
    void say(W_.signalEnd)
    await wait(3200)
    await wait(500)
    if (alive()) onDone()
  }

  // Set up once we know the size: Hou Hou starts at the left end.
  useEffect(() => {
    if (g && houX < 0) {
      setHouX(g.hh * 0.1)
      setProgress(0, TOTAL)
    }
  }, [!!g])
  useEffect(() => {
    if (story || !g) return
    void startRound(0)
  }, [story, !!g])
  useEffect(() => {
    applyPan(panRef.current) // keep it in range when the screen turns
    refresh()
  }, [W, H])

  const tickle = () => {
    sounds.pop()
    void hou.current?.play('giggle')
    void say(W_.tap[tapTurn.current++ % 2])
  }

  const tray = order[Math.min(rnd, 2)].filter((c) => !hidden.includes(c))
  const trayW = g ? g.B * 1.25 : 100
  const brickAt = (gi: number, k: number) => (g ? g.gaps[gi].left + g.pad + k * g.pitch : 0)
  const houStyle = g
    ? { left: houX < 0 ? 0 : houX, top: g.footY - g.houH, height: g.houH, transition: `left ${houMs}ms cubic-bezier(.45,.05,.4,1)` }
    : {}

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#BFE3F5', touchAction: 'none', overscrollBehavior: 'none' }}>
      {g && (
        <PlayArea style={{ position: 'absolute', inset: 0 }}>
          {/* The panorama: everything in it slides together. */}
          <div
            ref={layer}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            style={{ position: 'absolute', left: 0, top: g.top, width: g.pw, height: g.hh, touchAction: 'none', willChange: 'transform', cursor: 'grab', userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <div style={{ position: 'absolute', inset: 0, background: `url(${art.bgWall}) center / 100% 100%` }} />
            <Ambient g={g} />
            <WallWalk g={g} />
            <Rubble g={g} />
            {/* The gaps: known bricks, then the missing ones. */}
            {GAPS.map((gap, gi) =>
              Array.from({ length: gap.seq.length }, (_, k) => {
                const left = brickAt(gi, k)
                const missingNo = gap.missing.indexOf(k)
                const isMissing = missingNo >= 0
                const done = filled[`${gi}-${k}`]
                const active = gi === rnd && isMissing && missingNo === holeIdx && (phase.current === 'brick' || phase.current === 'follow') && !done
                return (
                  <div key={`${gi}-${k}`} style={{ position: 'absolute', left, top: g.rowY, width: g.B, height: g.Bh }}>
                    {(!isMissing || done) && (
                      <motion.div initial={done ? { scale: 1.45, rotate: -6 } : false} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 24 }}>
                        <Brick c={gap.seq[k] as BrickColor} w={g.B} />
                      </motion.div>
                    )}
                    {isMissing && !done && (
                      <Hole active={active} hint={hint && active} w={g.B} h={g.Bh} />
                    )}
                  </div>
                )
              }),
            )}
            {/* The beacon tower at the end of the walkway. */}
            <img src={art.beaconTower} alt="" draggable={false} style={{ position: 'absolute', left: g.towerCx - g.towerW / 2, top: g.towerTop, width: g.towerW, height: g.towerH, pointerEvents: 'none' }} />
            <button
              aria-label="beacon tower"
              className={phase.current === 'beacon' ? 'world-glow' : undefined}
              onClick={() => (phase.current === 'beacon' ? void lightBeacon() : (sounds.pop(), void hou.current?.play('wiggle')))}
              style={{ position: 'absolute', left: g.towerCx - g.towerW / 2, top: g.towerTop, width: g.towerW, height: g.towerH, background: 'rgba(255,255,255,0.01)', border: 'none', borderRadius: 30 }}
            />
            {/* Painted towers and the signal fires. */}
            <Fires g={g} count={fires} />
            {/* Hou Hou on the walkway. */}
            <div style={{ position: 'absolute', translate: '-50% 0', zIndex: 4, ...houStyle }}>
              <HouHou ref={hou} height="100%" onTap={tickle} />
            </div>
          </div>

          {/* Bricks to choose from. Fixed to the screen so they stay put while the wall slides. */}
          {!story && phase.current !== 'beacon' && phase.current !== 'fire' && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 10px)', display: 'flex', justifyContent: 'center', gap: 'min(24px, 3vw)', zIndex: 15, pointerEvents: 'none' }}>
              {tray.map((c) => (
                <motion.div key={`${rnd}-${c}`} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }} style={{ pointerEvents: 'auto' }}>
                  <Piece
                    id={`tray-${c}`}
                    snapTo="hole"
                    snapRadius={90}
                    label={`${BRICKS[c].name} brick`}
                    onTap={() => void tryBrick(c)}
                    onPlace={({ target }) => (target === 'hole' ? (tryBrick(c) ? 'reset' : 'home') : 'home')}
                  >
                    <motion.div animate={wiggle?.c === c ? { rotate: [0, -12, 12, -8, 8, 0] } : glow === c ? { scale: [1, 1.12, 1] } : { rotate: 0, scale: 1 }} transition={glow === c && wiggle?.c !== c ? { repeat: Infinity, duration: 0.9 } : { duration: 0.45 }} key={wiggle?.c === c ? wiggle.n : 'x'} style={{ filter: glow === c ? 'drop-shadow(0 0 12px #FFC83D) drop-shadow(0 0 6px #fff)' : undefined, borderRadius: 14 }}>
                      <button type="button" aria-label={`${BRICKS[c].name} brick`} style={{ background: 'none', border: 'none', padding: 0, touchAction: 'none', display: 'block' }}>
                        <Brick c={c} w={trayW} />
                      </button>
                    </motion.div>
                  </Piece>
                </motion.div>
              ))}
            </div>
          )}
        </PlayArea>
      )}

      {/* Big arrow: glides to Hou Hou's next spot (or points back at it). */}
      {!story && phase.current !== 'fire' && (
        <motion.button
          aria-label="follow Hou Hou"
          onClick={() => {
            sounds.pop()
            void goToTarget()
          }}
          animate={dir !== 0 ? { scale: [1, 1.15, 1] } : { scale: 1, opacity: 0.85 }}
          transition={dir !== 0 ? { repeat: Infinity, duration: 1 } : {}}
          className={dir !== 0 ? 'world-glow' : undefined}
          style={{ position: 'absolute', top: '36%', [dir < 0 ? 'left' : 'right']: 12, width: 'calc(var(--target) + 12px)', height: 'calc(var(--target) + 12px)', borderRadius: '50%', border: `5px solid ${INK}`, background: 'var(--hotpink)', color: '#fff', fontSize: 44, fontWeight: 700, zIndex: 16, display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow)', transform: dir < 0 ? 'scaleX(-1)' : undefined }}
        >
          ▶
        </motion.button>
      )}

      {!story && bubble && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 12px', zIndex: 14, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <PromptBubble text={prompt} speak={false} />
          </div>
        </div>
      )}

      {story && <StoryBeat lines={[W_.oops, W_.long]} friend={<HouHou height="100%" />} bg={art.bgWall} onDone={() => setStory(false)} />}
    </div>
  )
}

/** The dashed hole where the next brick goes. It is the drop target, with a wide invisible margin. */
function Hole({ active, hint, w, h }: { active: boolean; hint: boolean; w: number; h: number }) {
  const inner = (
    <div style={{ width: w, height: h, borderRadius: 14, border: `4px dashed ${active ? '#fff' : 'rgba(255,255,255,.5)'}`, background: 'rgba(255,255,255,0.22)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: h * 0.6 }}>?</div>
  )
  if (!active) return inner
  return (
    <Target id="hole" hint={hint} style={{ position: 'absolute', left: -w * 0.25, top: -h * 0.25, width: w * 1.5, height: h * 1.5, display: 'grid', placeItems: 'center', borderRadius: 20 }}>
      {inner}
    </Target>
  )
}

/** Loose bricks that fell on the grass in front of each gap. */
function Rubble({ g }: { g: Geom }) {
  const cols: BrickColor[] = ['r', 'g', 'j']
  return (
    <>
      {g.gaps.map((gap, i) =>
        [0, 1, 2].map((k) => (
          <div key={`${i}-${k}`} style={{ position: 'absolute', left: gap.left + gap.width * (0.3 + k * 0.2), top: g.faceY1 - g.Bh * 0.3 + (k % 2) * g.Bh * 0.12, transform: `rotate(${(k - 1) * 22 + i * 9}deg)`, pointerEvents: 'none', opacity: 0.95 }}>
            <Brick c={cols[(i + k) % 3]} w={g.B * 0.5} />
          </div>
        )),
      )}
    </>
  )
}

/** Drifting clouds and a butterfly, so the wall never sits still. */
function Ambient({ g }: { g: Geom }) {
  const clouds = [0.08, 0.3, 0.55, 0.8]
  return (
    <>
      {clouds.map((x, i) => (
        <motion.svg key={i} viewBox="0 0 200 80" animate={{ x: [0, g.hh * 0.25, 0] }} transition={{ duration: 46 + i * 9, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', left: x * g.pw, top: g.hh * (0.05 + (i % 2) * 0.09), width: g.hh * 0.32, opacity: 0.85, pointerEvents: 'none' }}>
          <path d="M20 66 C0 66 0 40 22 40 C22 18 52 14 64 30 C74 10 110 10 118 32 C140 24 160 38 154 54 C176 50 192 66 174 68 Z" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        </motion.svg>
      ))}
      <motion.div animate={{ x: [0, 160, 320, 160, 0], y: [0, -50, 20, -40, 0], rotate: [0, 12, -8, 10, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', left: g.pw * 0.12, top: g.hh * 0.5, fontSize: g.hh * 0.045, pointerEvents: 'none' }}>
        🦋
      </motion.div>
      <motion.div animate={{ x: [0, 200, 400, 200, 0], y: [0, 30, -20, 30, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', left: g.pw * 0.52, top: g.hh * 0.48, fontSize: g.hh * 0.04, pointerEvents: 'none' }}>
        🦋
      </motion.div>
    </>
  )
}

function Flame({ size }: { size: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size * 1.4 }}>
      <motion.svg viewBox="0 0 60 84" width={size} height={size * 1.4} initial={{ scale: 0.1 }} animate={{ scale: [1, 1.12, 0.95, 1.08, 1], rotate: [0, 3, -3, 2, 0] }} transition={{ duration: 0.7, repeat: Infinity }} style={{ transformOrigin: '50% 100%', overflow: 'visible' }}>
        <path d="M30 4 C36 22 56 34 54 56 C52 74 40 80 30 80 C20 80 8 74 6 56 C4 40 18 34 22 18 C26 24 26 12 30 4Z" fill="#FF7A3D" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M30 34 C34 46 44 52 42 64 C41 72 35 76 30 76 C25 76 19 72 18 64 C17 54 26 48 30 34Z" fill="#FFD24A" />
      </motion.svg>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} initial={{ y: 0, opacity: 0 }} animate={{ y: -size * 2.6, x: (i - 1) * size * 0.5, opacity: [0, 0.75, 0], scale: [0.5, 1.3, 1.8] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8 }} style={{ position: 'absolute', left: size * 0.25, top: 0, width: size * 0.7, height: size * 0.7, borderRadius: '50%', background: '#fff', border: '2px solid #E3E3EE' }} />
      ))}
    </div>
  )
}

function Fires({ g, count }: { g: Geom; count: number }) {
  // Fire 0 sits in the beacon tower's fire bowl; the rest jump to the painted towers.
  const spots = [
    { x: g.towerCx, y: g.towerTop + g.towerH * 0.075, size: g.hh * 0.1 },
    ...PAINTED.map((t) => ({ x: (t.x / 100) * g.pw, y: (t.y / 100 - 0.03) * g.hh, size: t.s * g.hh * 1.1 })),
  ]
  return (
    <>
      {spots.slice(0, count).map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: s.x, top: s.y, translate: '-50% -100%', pointerEvents: 'none', zIndex: 3 }}>
          <Flame size={s.size} />
        </div>
      ))}
    </>
  )
}

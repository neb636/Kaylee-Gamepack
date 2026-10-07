// Pour to the line. The jug (lip on the left) stands on a table next to two clear bottles. She presses and holds the
// jug: it lifts, tips its lip over the bottle and oil pours while she holds. Bottle 1: "all the way" (it stops by itself
// at the top, so it never spills). Bottle 2: "halfway", to a dotted line; if she pours past it, Spina giggles and sips a
// little off the top ("Just a taste!") and it still counts.
import { animate, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { burst, say, SparklePuppet, sounds, useAlive, useLandscape, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'
import { Spina } from '../../puppets/Spina'
import { OIL, OIL_SHADE, Scene, Stand, Table } from './bits'

const O = L.olives
const RATE = 0.34 // bottle per second
const HALF = { lo: 0.4, hi: 0.62, stop: 0.86 }
// Bottle drawing: viewBox 0 0 100 280; the oil fills from y 270 (empty) up to y 84 (full, at the shoulder).
const B_EMPTY = 270
const B_FULL = 84
const levelY = (l: number) => B_EMPTY - l * (B_EMPTY - B_FULL)
const BOTTLE = 'M38 24 L38 76 C38 96 10 100 10 126 L10 256 Q10 272 26 272 L74 272 Q90 272 90 256 L90 126 C90 100 62 96 62 76 L62 24 Z'

const LAYOUT = {
  land: { vb: [1500, 1000], table: { l: 22, r: 78, top: 70, ground: 93 }, bottles: [53, 38], bottle: 25, jug: { x: 69, h: 16 }, spina: { x: 14, y: 93, h: 26 }, sparkle: { x: 86, y: 94, h: 28 } },
  tall: { vb: [1000, 1500], table: { l: 24, r: 94, top: 72, ground: 94 }, bottles: [56, 34], bottle: 21, jug: { x: 80, h: 13 }, spina: { x: 12, y: 94, h: 17 }, sparkle: null },
}

export function Pour({ onStar, onDone }: { onStar: (n: number) => void; onDone: () => void }) {
  const landscape = useLandscape()
  const lay = landscape ? LAYOUT.land : LAYOUT.tall
  const ratio = landscape ? 1.5 : 1 / 1.5
  const alive = useAlive()
  const spina = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)

  const [bottle, setBottle] = useState(0) // which bottle she's filling (0 full, 1 half), 2 = both done
  const [pouring, setPouring] = useState(false)
  const [levels, setLevels] = useState([0, 0])
  const [corks, setCorks] = useState([false, false])
  const [prompt, setPrompt] = useState<Line | null>(O.pourFull)
  const [busy, setBusy] = useState(false)
  const [spinaAt, setSpinaAt] = useState<number | null>(null)
  const level = useRef([0, 0])
  const oilRefs = [useRef<SVGRectElement>(null), useRef<SVGRectElement>(null)]
  const streamRef = useRef<SVGPathElement>(null)
  const holding = useRef(false)
  const tickles = useRef(0)
  const lastTouch = useRef(Date.now())

  // Geometry (% of scene).
  const bw = (lay.bottle * (100 / 280)) / ratio // bottle width in % of scene width
  const bTop = lay.table.top - lay.bottle
  const jugW = lay.jug.h / ratio // cqw, the jug picture is square
  const restL = lay.jug.x - jugW / 2
  const restT = lay.table.top - lay.jug.h
  const target = Math.min(bottle, 1)
  const lip: [number, number] = [lay.bottles[target] + bw * 0.22, bTop - lay.jug.h * 0.42]
  const pourL = lip[0] - 0.09 * jugW
  const pourT = lip[1] - 0.06 * lay.jug.h
  const [VW, VH] = lay.vb
  const px = (x: number) => (x * VW) / 100
  const py = (y: number) => (y * VH) / 100

  const draw = (i: number) => {
    const y = levelY(level.current[i])
    oilRefs[i].current?.setAttribute('y', String(y))
    oilRefs[i].current?.setAttribute('height', String(B_EMPTY + 4 - y))
    // The stream lands on the oil's surface.
    const s = streamRef.current
    if (s && i === target) {
      const bx = lay.bottles[i]
      const surf = bTop + (y / 280) * lay.bottle
      s.setAttribute('d', `M${px(lip[0] - 0.3)} ${py(lip[1] + 0.6)} Q${px(bx - 0.2)} ${py(lip[1] + 3)} ${px(bx)} ${py(surf)}`)
    }
  }
  useEffect(() => {
    draw(0)
    draw(1)
  })

  // While she holds, oil flows (after the jug has tipped).
  useEffect(() => {
    if (!pouring) return
    let raf = 0
    let last = performance.now()
    const start = last
    let noteAt = 0
    const i = target
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (now - start > 350) {
        const cap = i === 0 ? 1 : HALF.stop
        level.current[i] = Math.min(cap, level.current[i] + RATE * dt)
        draw(i)
        if (now - noteAt > 260) {
          noteAt = now
          sounds.note(Math.round(level.current[i] * 10))
        }
        if (level.current[i] >= cap) {
          // Full (or way past the line): stop by itself.
          holding.current = false
          void stop()
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pouring, target])

  const start = () => {
    if (busy || bottle > 1) return
    lastTouch.current = Date.now()
    holding.current = true
    sounds.pickup()
    setPouring(true)
  }

  const stop = async () => {
    setPouring(false)
    const i = target
    const l = level.current[i]
    setLevels([...level.current])
    if (busy) return
    if (i === 0) {
      if (l < 1) {
        if (l > 0.05) void say(O.pourFull)
        return
      }
      setBusy(true)
      await finishBottle(0, O.full)
      if (!alive()) return
      setBottle(1)
      setPrompt(O.pourHalf)
      setBusy(false)
      return
    }
    if (l < HALF.lo) {
      if (l > 0.05) void say(O.more)
      return
    }
    setBusy(true)
    if (l > HALF.hi) {
      // Too much: Spina hops up on the table and sips it down to the line.
      setPrompt(null)
      setSpinaAt(lay.bottles[1] - bw * 0.5 - (landscape ? 5.5 : 8.5))
      sfx.boing()
      void spina.current?.play('hop')
      await wait(700)
      if (!alive()) return
      void say(O.tooMuch)
      void spina.current?.play('crunch')
      await new Promise<void>((res) =>
        animate(level.current[1], 0.5, {
          duration: 1.3,
          onUpdate: (v) => {
            level.current[1] = v
            draw(1)
          },
          onComplete: res,
        }),
      )
      if (!alive()) return
      setLevels([...level.current])
      setSpinaAt(null)
      await wait(500)
      if (!alive()) return
    }
    await finishBottle(1, O.half)
    if (!alive()) return
    setBottle(2)
    void sparkle.current?.play('nod')
    await say(O.everything)
    if (!alive()) return
    await wait(300)
    if (alive()) onDone()
  }

  const finishBottle = async (i: number, line: Line) => {
    setPrompt(null)
    await wait(400)
    if (!alive()) return
    setCorks((c) => c.map((v, j) => (j === i ? true : v)))
    sfx.pop()
    burst()
    sounds.correct()
    void spina.current?.play('cheer')
    void sparkle.current?.play('cheer')
    onStar(i + 1)
    await say(line)
  }

  const tapSpina = () => {
    sounds.pop()
    void spina.current?.play('hop')
    void say(L.tickle.spina[tickles.current++ % L.tickle.spina.length])
  }

  // Idle: remind her to hold the jug.
  useEffect(() => {
    if (bottle > 1) return
    const id = setInterval(() => {
      if (!busy && !holding.current && Date.now() - lastTouch.current > 9000) {
        lastTouch.current = Date.now()
        void say(bottle === 0 ? O.pourFull : O.pourHalf)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [bottle, busy])

  const tipped = pouring
  return (
    <Scene bg={art.bgOliveMill} bgTall={art.bgOliveMillTall} prompt={prompt}>
      <div style={{ position: 'absolute', left: `${lay.table.l}%`, width: `${lay.table.r - lay.table.l}%`, top: `${lay.table.top}%`, height: `${lay.table.ground - lay.table.top}%`, zIndex: 3 }}>
        <Table style={{ inset: 0, width: '100%', height: '100%' }} />
      </div>

      {/* The two bottles on the table. */}
      {lay.bottles.map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${bTop}%`, height: `${lay.bottle}%`, width: `${bw}%`, translate: '-50% 0', zIndex: 4 }}>
          <svg viewBox="0 0 100 280" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
            <defs>
              <clipPath id={`olive-bottle-${i}`}>
                <path d={BOTTLE} />
              </clipPath>
            </defs>
            <path d={BOTTLE} fill="#DDF2FA" />
            <g clipPath={`url(#olive-bottle-${i})`}>
              <rect ref={oilRefs[i]} x="0" y={levelY(levels[i])} width="100" height={B_EMPTY + 4 - levelY(levels[i])} fill={OIL} />
              <rect x="0" y="262" width="100" height="14" fill={OIL_SHADE} opacity={levels[i] > 0.02 ? 0.6 : 0} />
            </g>
            <rect x="18" y="128" width="9" height="112" rx="4.5" fill="#fff" opacity="0.75" />
            {i === 1 && <path d={`M4 ${levelY(0.5)} L96 ${levelY(0.5)}`} stroke={INK} strokeWidth="4" strokeDasharray="8 7" strokeLinecap="round" />}
            {i === 1 && <path d={`M98 ${levelY(0.5)} l10 -8 l0 16 z`} fill="#FF4F9A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />}
            <path d={BOTTLE} fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
            <rect x="33" y="16" width="34" height="11" rx="5" fill="#DDF2FA" stroke={INK} strokeWidth="5" />
            {corks[i] && (
              <motion.g initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                <rect x="39" y="-4" width="22" height="26" rx="5" fill="#D9A066" stroke={INK} strokeWidth="5" />
              </motion.g>
            )}
          </svg>
        </div>
      ))}

      {/* The oil stream from the jug's lip into the bottle. */}
      <svg viewBox={`0 0 ${VW} ${VH}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none', overflow: 'visible', opacity: tipped ? 1 : 0, transition: 'opacity .2s .25s' }}>
        <path ref={streamRef} d="" fill="none" stroke={OIL} strokeWidth={VW * 0.009} strokeLinecap="round" />
      </svg>

      {/* The jug: press and hold to pour. */}
      <motion.div
        role="button"
        aria-label="Jug"
        onPointerDown={(e) => {
          ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
          start()
        }}
        onPointerUp={() => {
          holding.current = false
          if (pouring) void stop()
        }}
        onPointerCancel={() => {
          holding.current = false
          if (pouring) void stop()
        }}
        animate={tipped ? { left: `${pourL}%`, top: `${pourT}%`, rotate: -58 } : { left: `${restL}%`, top: `${restT}%`, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.25, duration: 0.45 }}
        style={{ position: 'absolute', width: `${jugW}cqw`, aspectRatio: '1', zIndex: 6, transformOrigin: '9% 6%', touchAction: 'none', cursor: 'pointer' }}
      >
        <motion.div
          animate={!busy && !tipped && bottle < 2 ? { filter: ['drop-shadow(0 0 0px #FFE27A)', 'drop-shadow(0 0 14px #FFC83D)', 'drop-shadow(0 0 0px #FFE27A)'] } : { filter: 'drop-shadow(0 0 0px #FFE27A)' }}
          transition={{ repeat: Infinity, duration: 1.1 }}
          style={{ width: '100%', height: '100%' }}
        >
          <img src={art.oilJug} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} />
        </motion.div>
        {!busy && !tipped && bottle < 2 && (
          <motion.div aria-hidden animate={{ scale: [1, 0.85, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ position: 'absolute', right: '-6%', top: '30%', fontSize: landscape ? '6cqh' : '7cqw', pointerEvents: 'none' }}>
            👆
          </motion.div>
        )}
      </motion.div>

      <motion.div animate={{ left: `${spinaAt ?? lay.spina.x}%` }} transition={{ type: 'spring', bounce: 0.3, duration: 0.7 }} style={{ position: 'absolute', bottom: `${100 - (spinaAt === null ? lay.spina.y : lay.table.top)}%`, height: `${lay.spina.h * (spinaAt === null ? 1 : 0.85)}cqh`, translate: '-50% 0', zIndex: 8, transition: 'bottom .45s cubic-bezier(.3,1.6,.6,1), height .45s' }}>
        <Spina ref={spina} height="100%" onTap={tapSpina} />
      </motion.div>
      {lay.sparkle && (
        <Stand x={lay.sparkle.x} y={lay.sparkle.y} h={`${lay.sparkle.h}cqh`} z={8}>
          <SparklePuppet ref={sparkle} height="100%" flip lookToward={-0.6} />
        </Stand>
      )}
    </Scene>
  )
}

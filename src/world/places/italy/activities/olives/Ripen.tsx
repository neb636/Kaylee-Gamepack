// Green to black. A close-up of one olive on a twig: she taps the sun twice and it ripens green → purple → black.
// Then three olives hang on the twig, jumbled; she drags them into three bowls on a table, youngest to ripest
// (one sun, two suns, three suns). Then Spina tries a fresh one: "Bleh! Bitter!"
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { burst, Piece, say, SparklePuppet, sounds, Target, useAlive, useLandscape, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { WIGGLE } from '../../../../kit/Stage'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'
import { Spina } from '../../puppets/Spina'
import { OliveSvg, Scene, Stand, SunButton, Table, Twinkles, type OliveColor } from './bits'

const O = L.olives
const ORDER: OliveColor[] = ['green', 'purple', 'black']
const HINT: Record<OliveColor, Line> = { green: O.hintGreen, purple: O.hintPurple, black: O.hintBlack }
/** Where each olive hangs on the twig in the sort round (jumbled). */
const HANG: OliveColor[] = ['purple', 'black', 'green']

const LAYOUT = {
  land: {
    vb: [1500, 1000],
    twig: { y: 33, end: 74 },
    hang: [30, 45, 60],
    single: 45,
    hangY: 41,
    olive: 6.4, // cqw
    table: { l: 30, r: 82, top: 75, ground: 91 },
    bowls: [40, 56, 72],
    bowl: 13, // cqw
    spina: { x: 16, y: 92, h: 30 },
    sparkle: { x: 85, y: 93, h: 29 },
    sun: { x: 89.4, y: 16.3, d: '12cqw' },
  },
  tall: {
    vb: [1000, 1500],
    twig: { y: 30, end: 88 },
    hang: [26, 50, 74],
    single: 50,
    hangY: 37,
    olive: 12.5,
    table: { l: 6, r: 94, top: 70, ground: 84.5 },
    bowls: [24, 50, 76],
    bowl: 25,
    spina: { x: 17, y: 92.5, h: 16 },
    sparkle: { x: 83, y: 93, h: 18 },
    sun: { x: 88.4, y: 10.2, d: '20cqw' },
  },
}

export function Ripen({ onStar, onDone }: { onStar: (n: number) => void; onDone: () => void }) {
  const landscape = useLandscape()
  const lay = landscape ? LAYOUT.land : LAYOUT.tall
  const ratio = landscape ? 1.5 : 1 / 1.5
  const alive = useAlive()
  const spina = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)

  const [phase, setPhase] = useState<'ripen' | 'sort' | 'taste' | 'done'>('ripen')
  const [ripe, setRipe] = useState(0) // 0 green, 1 purple, 2 black
  const [prompt, setPrompt] = useState<Line | null>(O.ripenIntro)
  const [rays, setRays] = useState(0)
  const [placed, setPlaced] = useState<OliveColor[]>([])
  const [hint, setHint] = useState<number | null>(null)
  const [wiggle, setWiggle] = useState<number | null>(null)
  const [eating, setEating] = useState(false)
  const [busy, setBusy] = useState(false)
  const tickles = useRef(0)

  useEffect(() => {
    const t = setTimeout(() => void sparkle.current?.play('wave'), 300)
    return () => clearTimeout(t)
  }, [])

  // --- ripen: tap the sun twice ---------------------------------------------------------------------------------
  const tapSun = async () => {
    if (phase !== 'ripen' || busy) {
      sounds.sparkle()
      void say(O.sun)
      return
    }
    setBusy(true)
    setRays((r) => r + 1)
    sounds.whoosh()
    await wait(600)
    if (!alive()) return
    const next = ripe + 1
    setRipe(next)
    sounds.sparkle()
    sounds.note(next * 3)
    void spina.current?.play('hop')
    if (next === 1) {
      setPrompt(O.purple)
      setBusy(false)
      return
    }
    setPrompt(null)
    void sparkle.current?.play('cheer')
    burst()
    await say(O.black)
    if (!alive()) return
    onStar(1)
    await wait(300)
    setPhase('sort')
    setPrompt(O.sortIntro)
    setBusy(false)
  }

  // --- sort: drag the olives into the bowls ---------------------------------------------------------------------
  const drop = (c: OliveColor, target: string | null) => {
    const right = ORDER.indexOf(c)
    if (target === `bowl-${right}`) {
      sounds.snap()
      sounds.note(2 + right * 3)
      setHint(null)
      const now = [...placed, c]
      setPlaced(now)
      void spina.current?.play(now.length === 3 ? 'cheer' : 'nod')
      if (now.length === 3) void finishSort()
      return 'snap' as const
    }
    if (target) {
      const wrong = Number(target.split('-')[1])
      sounds.oops()
      setWiggle(wrong)
      setTimeout(() => setWiggle(null), 550)
      void sparkle.current?.play('think')
    }
    setHint(right)
    void say(HINT[c])
    return 'home' as const
  }

  const finishSort = async () => {
    setPrompt(null)
    await wait(500)
    if (!alive()) return
    burst()
    sounds.correct()
    void sparkle.current?.play('cheer')
    await say(O.sortDone)
    if (!alive()) return
    onStar(2)
    // Spina tries a fresh green olive.
    setPhase('taste')
    await say(O.tryOne)
    if (!alive()) return
    setEating(true)
    sounds.whoosh()
    await wait(700)
    if (!alive()) return
    sfx.munch()
    await spina.current?.play('crunch')
    if (!alive()) return
    void spina.current?.play('bleh')
    sounds.oops()
    await say(O.bitter)
    if (!alive()) return
    void sparkle.current?.play('nod')
    await say(O.bitterWhy)
    if (!alive()) return
    setPhase('done')
    await wait(500)
    if (alive()) onDone()
  }

  const tapSpina = () => {
    sounds.pop()
    void spina.current?.play('hop')
    void say(L.tickle.spina[tickles.current++ % L.tickle.spina.length])
  }

  // Geometry (scene %, cqw).
  const [VW, VH] = lay.vb
  const sx = (x: number) => (x * VW) / 100
  const sy = (y: number) => (y * VH) / 100
  const oliveH = lay.olive * 1.27 * ratio // % of scene height
  const hangs = phase === 'ripen' ? [lay.single] : lay.hang
  const bowlH = lay.bowl * (546 / 944) * ratio // % of scene height
  const spinaMouth: [number, number] = [lay.spina.x, lay.spina.y - lay.spina.h * 0.48]
  const ripeColor = ORDER[ripe]

  return (
    <Scene bg={art.bgOliveGrove} bgTall={art.bgOliveGroveTall} prompt={prompt}>
      <SunButton x={lay.sun.x} y={lay.sun.y} size={lay.sun.d} glow={phase === 'ripen' && !busy} onTap={() => void tapSun()} />

      {/* Sun rays reach down to the olive when she taps the sun. */}
      <AnimatePresence>
        {rays > 0 && phase === 'ripen' && (
          <motion.svg
            key={rays}
            viewBox={`0 0 ${VW} ${VH}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ duration: 1.1 }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
          >
            <path d={`M${sx(lay.sun.x - 2)} ${sy(lay.sun.y)} L${sx(lay.single - 7)} ${sy(lay.hangY + oliveH / 2)} L${sx(lay.single + 7)} ${sy(lay.hangY + oliveH / 2)} L${sx(lay.sun.x + 2)} ${sy(lay.sun.y)} Z`} fill="#FFE27A" opacity="0.7" />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* The twig with leaves (side view), coming in from the left. */}
      <svg viewBox={`0 0 ${VW} ${VH}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none', overflow: 'visible' }}>
        <Twig vw={VW} y={sy(lay.twig.y)} end={sx(lay.twig.end)} />
        {hangs.map((x, i) => {
          const c = phase === 'ripen' ? ripeColor : HANG[i]
          if (phase !== 'ripen' && placed.includes(c)) return null
          return <path key={i} d={`M${sx(x)} ${sy(lay.twig.y) + 6 + Math.sin(x) * 4} L${sx(x)} ${sy(lay.hangY) + 4}`} stroke={INK} strokeWidth="7" strokeLinecap="round" />
        })}
      </svg>

      {phase === 'ripen' && (
        <motion.button
          aria-label="Olive"
          onClick={() => void tapSun()}
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          style={{ position: 'absolute', left: `${lay.single}%`, top: `${lay.hangY}%`, width: `${lay.olive * 1.35}cqw`, translate: '-50% 0', transformOrigin: '50% 0', zIndex: 3, background: 'none', border: 'none', padding: 0 }}
        >
          <motion.div key={ripe} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }} style={{ filter: busy ? 'drop-shadow(0 0 12px #FFE27A)' : undefined }}>
            <OliveSvg color={ripeColor} />
          </motion.div>
          {ripe > 0 && <Twinkles key={`t${ripe}`} style={{ left: '50%', top: '50%' }} />}
        </motion.button>
      )}

      {phase !== 'ripen' && (
        <>
          {/* The table, standing on the ground, with three bowls on top and sun badges over them. */}
          <motion.div initial={{ y: '30%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ position: 'absolute', left: `${lay.table.l}%`, width: `${lay.table.r - lay.table.l}%`, top: `${lay.table.top}%`, height: `${lay.table.ground - lay.table.top}%`, zIndex: 3 }}>
            <Table style={{ inset: 0, width: '100%', height: '100%' }} />
          </motion.div>
          {lay.bowls.map((x, i) => (
            <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${lay.table.top + 1.2}%`, translate: '-50% 0', zIndex: 4, pointerEvents: 'none' }}>
              <div style={{ background: '#FFF7F0', border: `4px solid ${INK}`, borderRadius: 999, padding: '2px 10px', fontSize: landscape ? 'min(3.4cqh, 30px)' : 'min(3.6cqw, 30px)', whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(110,59,36,.2)' }}>{'☀️'.repeat(i + 1)}</div>
            </div>
          ))}
          {lay.bowls.map((x, i) => {
            const c = ORDER[i]
            const has = placed.includes(c) && !(eating && c === 'green')
            return (
              <motion.div key={i} animate={wiggle === i ? WIGGLE : {}} style={{ position: 'absolute', left: `${x}%`, top: `${lay.table.top - bowlH}%`, width: `${lay.bowl}cqw`, translate: '-50% 0', zIndex: 5 }}>
                <Target id={`bowl-${i}`} hint={hint === i} style={{ position: 'relative', width: '100%', aspectRatio: '944 / 546', borderRadius: '30% 30% 45% 45%' }}>
                  {has && (
                    <div style={{ position: 'absolute', left: '50%', bottom: '26%', width: `${(lay.olive / lay.bowl) * 100}%`, translate: '-50% 0' }}>
                      <Piece id={`olive-${c}`} disabled label={`${c} olive in bowl`}>
                        <OliveSvg color={c} />
                      </Piece>
                    </div>
                  )}
                  <img src={art.oliveBowl} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
                </Target>
              </motion.div>
            )
          })}
          {/* The olives hanging on the twig: pick one up and put it in its bowl. */}
          {phase === 'sort' &&
            lay.hang.map((x, i) => {
              const c = HANG[i]
              if (placed.includes(c)) return null
              return (
                <div key={c} style={{ position: 'absolute', left: `${x}%`, top: `${lay.hangY}%`, width: `${lay.olive}cqw`, translate: '-50% 0', zIndex: 8 }}>
                  <Piece
                    id={`olive-${c}`}
                    label={`${c} olive`}
                    snapTo={['bowl-0', 'bowl-1', 'bowl-2']}
                    snapRadius={90}
                    onPickUp={() => sounds.pickup()}
                    onPlace={({ target }) => drop(c, target)}
                    onTap={() => {
                      sounds.pop()
                      setHint(ORDER.indexOf(c))
                      void say(HINT[c])
                    }}
                    style={{ padding: '14%', margin: '-14%' }}
                  >
                    <motion.div animate={{ rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 2 + i * 0.3 }} style={{ transformOrigin: '50% 0' }}>
                      <OliveSvg color={c} />
                    </motion.div>
                  </Piece>
                </div>
              )
            })}
          {/* Spina tries the green one. */}
          <AnimatePresence>
            {eating && phase === 'taste' && (
              <motion.div
                initial={{ left: `${lay.bowls[0]}%`, top: `${lay.table.top - bowlH - oliveH * 0.6}%`, scale: 1 }}
                animate={{ left: `${spinaMouth[0]}%`, top: [`${lay.table.top - bowlH - oliveH * 0.6}%`, `${spinaMouth[1] - 12}%`, `${spinaMouth[1] - oliveH / 2}%`], scale: 0.7 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.7 }}
                style={{ position: 'absolute', width: `${lay.olive}cqw`, translate: '-50% 0', zIndex: 12, pointerEvents: 'none' }}
              >
                <OliveSvg color="green" />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <Stand x={lay.spina.x} y={lay.spina.y} h={`${lay.spina.h}cqh`} z={10}>
        <Spina ref={spina} height="100%" onTap={tapSpina} />
      </Stand>
      <Stand x={lay.sparkle.x} y={lay.sparkle.y} h={`${lay.sparkle.h}cqh`} z={10}>
        <SparklePuppet ref={sparkle} height="100%" flip lookToward={-0.5} />
      </Stand>
    </Scene>
  )
}

/** An olive twig seen from the side: a bark-brown branch with long narrow olive leaves, coming in from the left edge. */
function Twig({ vw, y, end }: { vw: number; y: number; end: number }) {
  const d = `M-40 ${y - 30} C${end * 0.3} ${y + 10} ${end * 0.65} ${y - 10} ${end} ${y + 14}`
  // Leaves along the twig (x as a fraction of its length, angle, upper or lower side).
  const leaves = [0.08, 0.16, 0.27, 0.36, 0.5, 0.6, 0.72, 0.83, 0.93, 1]
  const at = (k: number) => {
    // Cubic bezier point.
    const p0 = [-40, y - 30]
    const p1 = [end * 0.3, y + 10]
    const p2 = [end * 0.65, y - 10]
    const p3 = [end, y + 14]
    const u = 1 - k
    return [0, 1].map((j) => u * u * u * p0[j] + 3 * u * u * k * p1[j] + 3 * u * k * k * p2[j] + k * k * k * p3[j])
  }
  const s = vw / 1500
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={30 * s} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#A47652" strokeWidth={19 * s} strokeLinecap="round" />
      {leaves.map((k, i) => {
        const [x, ly] = at(k)
        const up = i % 2 === 0
        const ang = up ? -32 - (i % 3) * 8 : 28 + (i % 3) * 8
        const fill = i % 3 === 1 ? '#B5C36A' : '#9DAA4E'
        return (
          <g key={i} transform={`translate(${x} ${ly}) rotate(${ang}) scale(${s * 1.35})`}>
            <path d="M0 0 Q48 -20 104 0 Q48 20 0 0Z" fill={fill} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
            <path d="M10 0 L92 0" stroke={INK} strokeWidth="3" opacity="0.5" />
          </g>
        )
      })}
    </g>
  )
}

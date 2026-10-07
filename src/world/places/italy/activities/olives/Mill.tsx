// The olive mill (frantoio). The stone tub stands on a stone block with its wooden funnel (hopper) up on the left and a
// brass spout on the right; the jug stands on the floor under the spout. She drags ten olives from the basket up into the
// funnel (or taps the basket), counting out loud. Then the big stone wheel rolls round and crushes them into paste, and
// golden-green oil trickles out of the spout into the jug.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { burst, Piece, say, SparklePuppet, sounds, Target, useAlive, useLandscape, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'
import { Spina } from '../../puppets/Spina'
import { useWord } from '../../WordCard'
import { Basket, OIL, OIL_SHADE, OliveSvg, Scene, Stand, type OliveColor } from './bits'

const O = L.olives
const NEED = 10
const MIX: OliveColor[] = ['green', 'black', 'green', 'purple', 'green', 'black', 'green', 'purple', 'black', 'green']

// Scene layout (% of the picture; widths in cqw, heights in cqh). The tub picture is 992 x 661.
const LAYOUT = {
  land: { vb: [1500, 1000], plinth: { x: 39, w: 22, h: 16, y: 90 }, basin: { x: 39, w: 31 }, jug: { x: 56.2, h: 15, y: 90 }, basket: { x: 12, y: 93, w: 12 }, spina: { x: 69, y: 93, h: 28 }, sparkle: { x: 84, y: 93.5, h: 29 }, num: { x: 47, y: 34 }, olive: 3.2 },
  tall: { vb: [1000, 1500], plinth: { x: 29, w: 34, h: 14, y: 88 }, basin: { x: 31, w: 52 }, jug: { x: 58.5, h: 13, y: 88 }, basket: { x: 17, y: 93, w: 21 }, spina: { x: 82, y: 93, h: 18 }, sparkle: null, num: { x: 52, y: 36 }, olive: 6 },
}

export function Mill({ onDone }: { onDone: () => void }) {
  const landscape = useLandscape()
  const lay = landscape ? LAYOUT.land : LAYOUT.tall
  const ratio = landscape ? 1.5 : 1 / 1.5
  const alive = useAlive()
  const spina = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const [word, showWord] = useWord()

  const [count, setCount] = useState(0) // olives dropped in
  const [inFunnel, setInFunnel] = useState(0)
  const [phase, setPhase] = useState<'intro' | 'drop' | 'mill' | 'oil' | 'done'>('intro')
  const [prompt, setPrompt] = useState<Line | null>(null)
  const [flying, setFlying] = useState<{ id: number; from: [number, number]; color: OliveColor }[]>([])
  const [paste, setPaste] = useState(0)
  const [fill, setFill] = useState(0)
  const [hint, setHint] = useState(false)
  const busy = useRef(false)
  const counted = useRef(0)
  const flyId = useRef(0)
  const lastTouch = useRef(Date.now())
  const tickles = useRef(0)

  // Geometry in % of the scene.
  const plTop = lay.plinth.y - lay.plinth.h
  const bH = lay.basin.w * (661 / 992) * ratio
  const bL = lay.basin.x - lay.basin.w * 0.515
  const bT = plTop - bH
  const at = (fx: number, fy: number): [number, number] => [bL + fx * lay.basin.w, bT + fy * bH]
  const hopper = at(0.2, 0.06)
  const spout = at(0.985, 0.82)
  const rimY = bT + 0.6 * bH
  const jugW = lay.jug.h / ratio // cqw (the jug picture is square)
  const jugL = lay.jug.x - 0.42 * jugW
  const jugT = lay.jug.y - lay.jug.h
  const mouth: [number, number] = [lay.jug.x, jugT + lay.jug.h * 0.055]
  const wheelD = landscape ? 22 : 18 // cqh
  const wheel = at(0.53, 0.6)
  const basketTop = lay.basket.y - lay.basket.w * (168 / 200) * ratio
  const [VW, VH] = lay.vb
  const px = (x: number) => (x * VW) / 100
  const py = (y: number) => (y * VH) / 100

  useEffect(() => {
    void (async () => {
      await wait(300)
      if (!alive()) return
      showWord('frantoio')
      void spina.current?.play('wave')
      await say(O.mill)
      if (!alive()) return
      setPhase('drop')
      setPrompt(O.millDrop)
      lastTouch.current = Date.now()
    })()
  }, [])

  // Idle: show where the olives go.
  useEffect(() => {
    if (phase !== 'drop') return
    const id = setInterval(() => {
      if (Date.now() - lastTouch.current > 9000) {
        lastTouch.current = Date.now()
        setHint(true)
        void say(O.millHint)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  // One olive goes into the funnel (from where she let go, or from the basket).
  const drop = (from: [number, number]) => {
    if (phase !== 'drop' || counted.current >= NEED) return
    lastTouch.current = Date.now()
    const n = ++counted.current
    const id = flyId.current++
    setFlying((f) => [...f, { id, from, color: MIX[(n - 1) % MIX.length] }])
    setTimeout(() => {
      if (!alive()) return
      setFlying((f) => f.filter((x) => x.id !== id))
      setCount(n)
      setInFunnel(n)
      sfx.pop()
      sounds.note(n)
      void say(O.count[n - 1])
      if (n === 5) void spina.current?.play('hop')
      if (n === NEED) void millIt()
    }, 450)
  }

  const millIt = async () => {
    if (busy.current) return
    busy.current = true
    setHint(false)
    setPrompt(null)
    await wait(700)
    if (!alive()) return
    burst()
    void spina.current?.play('cheer')
    await say(O.lots)
    if (!alive()) return
    setPhase('mill')
    void sparkle.current?.play('nod')
    await say(O.roll)
    if (!alive()) return
    // Crunch crunch: the wheel rolls, the olives in the funnel go down, paste rises in the tub.
    void spina.current?.play('crunch')
    void say(O.squish)
    for (let i = 0; i < 10; i++) {
      if (i % 2) sfx.chomp()
      else sfx.crack()
      setPaste((i + 1) / 10)
      setInFunnel((c) => Math.max(0, c - 1))
      await wait(320)
      if (!alive()) return
    }
    setPhase('oil')
    for (let i = 0; i <= 10; i++) {
      setFill(i / 10)
      sounds.note(i)
      await wait(260)
      if (!alive()) return
    }
    sounds.sparkle()
    burst()
    void spina.current?.play('dance')
    void sparkle.current?.play('cheer')
    await say(O.oil)
    if (!alive()) return
    setPhase('done')
    await wait(600)
    if (alive()) onDone()
  }

  const tapSpina = () => {
    sounds.pop()
    void spina.current?.play('hop')
    void say(L.tickle.spina[tickles.current++ % L.tickle.spina.length])
  }

  const inHopper = Math.min(inFunnel, 6)
  const oliveW = lay.olive // cqw

  return (
    <Scene bg={art.bgOliveMill} bgTall={art.bgOliveMillTall} prompt={prompt} word={word}>
      {/* The millstone stands in the tub (behind its front wall) and rolls round when the olives are in. */}
      <motion.div
        animate={phase === 'mill' ? { rotate: 720, y: ['0%', '-3%', '0%', '-3%', '0%', '-3%', '0%'] } : { rotate: phase === 'oil' || phase === 'done' ? 720 : 0 }}
        transition={phase === 'mill' ? { rotate: { duration: 3.2, ease: 'easeInOut' }, y: { duration: 3.2 } } : { duration: 0 }}
        style={{ position: 'absolute', left: `${wheel[0]}%`, top: `${wheel[1]}%`, height: `${wheelD}cqh`, aspectRatio: '1', translate: '-50% -50%', zIndex: 2 }}
      >
        <img src={art.millstone} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
      </motion.div>
      {/* Olive paste rising in the tub, between the wheel and the tub's front. */}
      <svg viewBox={`0 0 ${VW} ${VH}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 3, pointerEvents: 'none', overflow: 'visible' }}>
        {paste > 0 && (
          <path
            d={`M${px(bL + lay.basin.w * 0.14)} ${py(rimY + 2)} Q${px(bL + lay.basin.w * 0.3)} ${py(rimY - paste * 3)} ${px(bL + lay.basin.w * 0.5)} ${py(rimY - paste * 2.2)} Q${px(bL + lay.basin.w * 0.7)} ${py(rimY - paste * 3.4)} ${px(bL + lay.basin.w * 0.88)} ${py(rimY + 2)} Z`}
            fill="#8C8F3A"
            stroke={INK}
            strokeWidth="5"
          />
        )}
        {/* The oil stream, from the spout down into the jug's mouth. */}
        {phase === 'oil' && (
          <g>
            <path d={`M${px(spout[0])} ${py(spout[1])} Q${px(spout[0] + 1.4)} ${py(spout[1] + 0.5)} ${px(mouth[0] - 0.4)} ${py(mouth[1] + 1)}`} fill="none" stroke={INK} strokeWidth={VW * 0.016} strokeLinecap="round" />
            <path d={`M${px(spout[0])} ${py(spout[1])} Q${px(spout[0] + 1.4)} ${py(spout[1] + 0.5)} ${px(mouth[0] - 0.4)} ${py(mouth[1] + 1)}`} fill="none" stroke={OIL} strokeWidth={VW * 0.01} strokeLinecap="round" />
            <motion.path d={`M${px(spout[0])} ${py(spout[1])} Q${px(spout[0] + 1.4)} ${py(spout[1] + 0.5)} ${px(mouth[0] - 0.4)} ${py(mouth[1] + 1)}`} fill="none" stroke="#FFF3B0" strokeWidth={VW * 0.0025} strokeLinecap="round" strokeDasharray="6 18" animate={{ strokeDashoffset: [48, 0] }} transition={{ repeat: Infinity, duration: 0.4, ease: 'linear' }} />
          </g>
        )}
      </svg>
      {/* The stone block and the tub with its funnel and spout. */}
      <div style={{ position: 'absolute', left: `${lay.plinth.x - lay.plinth.w / 2}%`, width: `${lay.plinth.w}%`, top: `${plTop}%`, height: `${lay.plinth.h}%`, zIndex: 4 }}>
        <Plinth />
      </div>
      <Target id="hopper" hint={hint} glow style={{ position: 'absolute', left: `${bL + 0.01 * lay.basin.w}%`, top: `${bT - 3}%`, width: `${lay.basin.w * 0.4}%`, height: `${bH * 0.36 + 3}%`, zIndex: 6, borderRadius: 24 }} />
      <img src={art.millBasin} alt="" draggable={false} style={{ position: 'absolute', left: `${bL}%`, top: `${bT}%`, width: `${lay.basin.w}%`, zIndex: 5, pointerEvents: 'none' }} />
      {/* Olives heaped in the funnel. */}
      {Array.from({ length: inHopper }, (_, i) => {
        const row = i < 3 ? 0 : i < 5 ? 1 : 2
        const k = i < 3 ? i - 1 : i < 5 ? i - 3.5 : 0
        return (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', left: `${hopper[0] + k * oliveW * 0.9}%`, top: `${hopper[1] - row * oliveW * 0.8 * ratio}%`, width: `${oliveW}cqw`, translate: '-50% -50%', rotate: `${(i * 37) % 60 - 30}deg`, zIndex: 4 }}>
            <OliveSvg color={MIX[i]} />
          </motion.div>
        )
      })}

      {/* The jug on the floor under the spout; a gold pool rises in its mouth. */}
      <div style={{ position: 'absolute', left: `${jugL}%`, top: `${jugT}%`, width: `${jugW}cqw`, aspectRatio: '1', zIndex: 4, filter: fill >= 1 ? 'drop-shadow(0 0 12px #FFE27A)' : undefined }}>
        <img src={art.oilJug} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
        {fill > 0 && (
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            <ellipse cx="42" cy="5.6" rx={8 + 18 * fill} ry={1 + 1.8 * fill} fill={OIL} stroke={OIL_SHADE} strokeWidth="1" />
          </svg>
        )}
      </div>

      {/* The basket: drag an olive up to the funnel, or tap the basket and one hops in. */}
      <Stand x={lay.basket.x} y={lay.basket.y} w={`${lay.basket.w}cqw`} z={8}>
        <motion.button
          aria-label="Basket of olives"
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            if (phase !== 'drop') return
            sounds.pop()
            drop([lay.basket.x, basketTop + 2])
          }}
          style={{ width: '100%', background: 'none', border: 'none', padding: 0 }}
        >
          <Basket fill={1 - count / 14} glow={phase === 'drop'} />
        </motion.button>
      </Stand>
      {phase === 'drop' && (
        <div style={{ position: 'absolute', left: `${lay.basket.x}%`, top: `${basketTop + 1}%`, width: `${oliveW * 1.5}cqw`, translate: '-50% -50%', zIndex: 9 }}>
          <Piece
            label="olive"
            snapTo="hopper"
            snapRadius={110}
            onPickUp={() => sounds.pickup()}
            onTap={() => drop([lay.basket.x, basketTop])}
            onPlace={({ target, x, y }) => {
              if (target === 'hopper') {
                drop([x * 100, y * 100])
                return 'reset'
              }
              setHint(true)
              return 'home'
            }}
            style={{ padding: '18%' }}
          >
            <OliveSvg color={MIX[count % MIX.length]} />
          </Piece>
        </div>
      )}
      <AnimatePresence>
        {flying.map((f) => (
          <motion.div
            key={f.id}
            initial={{ left: `${f.from[0]}%`, top: `${f.from[1]}%` }}
            animate={{ left: `${hopper[0]}%`, top: [`${f.from[1]}%`, `${Math.min(f.from[1], hopper[1]) - 8}%`, `${hopper[1]}%`], rotate: 360 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ position: 'absolute', width: `${oliveW}cqw`, translate: '-50% -50%', zIndex: 10, pointerEvents: 'none' }}
          >
            <OliveSvg color={f.color} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* The count, big. */}
      <AnimatePresence>
        {phase === 'drop' && count > 0 && (
          <motion.div
            key={count}
            initial={{ scale: 0.3, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            style={{ position: 'absolute', left: `${lay.num.x}%`, top: `${lay.num.y}%`, translate: '-50% -50%', zIndex: 12, fontSize: landscape ? '13cqh' : '16cqw', fontWeight: 700, color: '#FF4F9A', WebkitTextStroke: `4px ${INK}`, paintOrder: 'stroke', textShadow: '0 6px 0 rgba(110,59,36,.25)', pointerEvents: 'none', lineHeight: 1 }}
          >
            {count}
          </motion.div>
        )}
      </AnimatePresence>

      <Stand x={lay.spina.x} y={lay.spina.y} h={`${lay.spina.h}cqh`} z={7}>
        <Spina ref={spina} height="100%" flip onTap={tapSpina} />
      </Stand>
      {lay.sparkle && (
        <Stand x={lay.sparkle.x} y={lay.sparkle.y} h={`${lay.sparkle.h}cqh`} z={7}>
          <SparklePuppet ref={sparkle} height="100%" flip lookToward={-0.6} />
        </Stand>
      )}
    </Scene>
  )
}

/** A block of pale stones the tub stands on (side view). */
function Plinth() {
  return (
    <svg viewBox="0 0 300 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
      <rect x="2" y="2" width="296" height="96" rx="10" fill="#E9DCC6" stroke={INK} strokeWidth="5" vectorEffect="non-scaling-stroke" />
      <path d="M2 50 L298 50 M100 2 L100 50 M200 2 L200 50 M50 50 L50 98 M150 50 L150 98 M250 50 L250 98" stroke={INK} strokeWidth="3" vectorEffect="non-scaling-stroke" opacity="0.6" />
      <rect x="6" y="80" width="288" height="15" rx="6" fill="#D8C7AA" />
    </svg>
  )
}

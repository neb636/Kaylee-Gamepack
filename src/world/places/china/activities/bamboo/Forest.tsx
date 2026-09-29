// The forest scene: the meadow, Bao Bao, the bamboo shoots and every round, kept in one place so Bao Bao and the layout
// carry from round to round.
import { animate, AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { burst, say, sounds, useAlive, useElementSize, useLandscape, wait, type PuppetHandle } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { sfx } from '../../../../kit/sfx'
import { art } from '../../art'
import { L } from '../../lines'
import { BaoBao } from '../../puppets/BaoBao'
import { INK } from '../../puppets/ink'
import type { ActivityProps } from '../../Place'
import { Ambient } from './Ambient'
import { Stalk, stalkPoint, type StalkHandle } from './Stalk'

const B = L.bamboo
const TOTAL = 6
type Phase = 'r1' | 'break1' | 'r2' | 'break2' | 'r3a' | 'r3b' | 'payoff'
const R3 = [3, 5, 2] // bamboo heights in round 3: the tallest is in the middle, the shortest on the right
const tween = (from: number, to: number, duration: number, onUpdate: (v: number) => void, ease: 'linear' | 'easeIn' | 'easeInOut' | 'easeOut' = 'easeInOut') =>
  new Promise<void>((res) => void animate(from, to, { duration, ease, onUpdate, onComplete: res }))

export function Forest({ onDone, setProgress }: ActivityProps) {
  const landscape = useLandscape()
  const alive = useAlive()
  const field = useRef<HTMLDivElement>(null)
  const { width: fw, height: fh } = useElementSize(field)
  const bao = useRef<PuppetHandle>(null)
  const baoBox = useRef<HTMLDivElement>(null)
  const stalks = useRef<(StalkHandle | null)[]>([])
  const busy = useRef(false)
  const idleAt = useRef(Date.now())

  const [phase, setPhase] = useState<Phase>('r1')
  const [heights, setHeights] = useState<number[]>([0])
  const [bamboo, setBamboo] = useState(false)
  const [bundle, setBundle] = useState(false)
  const [bend, setBend] = useState(0)
  const [pile, setPile] = useState(false)
  const [guide, setGuide] = useState<number | null>(null) // round 3 hint: a line across at this many segments
  const [dimmed, setDimmed] = useState<number[]>([])
  const [answer, setAnswer] = useState<number | null>(null)
  const [wrongs, setWrongs] = useState(0)
  const [puffs, setPuffs] = useState<{ id: number; x: number; y: number }[]>([])
  const [hiddenCols, setHiddenCols] = useState<number[]>([])
  const [prompt, setPrompt] = useState<typeof B.grow3 | (typeof B)['munch'][0] | null>(B.grow3)

  useEffect(() => setProgress(0, TOTAL), [])

  // --- layout, from the field's size ---------------------------------------------------------------------------
  const ready = fw > 0 && fh > 0
  const seg = (fh * 0.9) / 6.3
  const ground = fh * 0.93
  const baoH = Math.min(fh * 0.52, fw * 0.46)
  const baoW = baoH * (400 / 480)
  const baoX = Math.max(6, fw * (landscape ? 0.05 : 0.02))
  const a = fw * (landscape ? 0.4 : 0.41)
  const b = fw * (landscape ? 0.94 : 0.97)
  const colX = (i: number, n: number) => a + ((i + 0.5) * (b - a)) / n
  const phone = Math.min(fw, fh) < 420
  const colW = Math.max(phone ? 72 : 110, Math.min(150, ((b - a) / Math.max(n(heights), 3)) * 0.96))
  const cols = heights.length
  const landX2 = Math.min(colX(2, 3), fw - baoW * 0.55 - 6) // keep the leaf pile (and Bao Bao landing) on screen
  const pileW = Math.min(seg * 3.6, fw * 0.3)
  const pileH = pileW * (382 / 512)
  const baoCenter = 0.35 * baoH // her body center above the bottom of her box

  function n(h: number[]) {
    return h.length
  }
  const setBaoPos = useCallback((X: number, Y: number, rot = 0) => {
    if (baoBox.current) baoBox.current.style.transform = `translate(${X}px, ${Y}px) rotate(${rot}deg)`
  }, [])

  const touch = () => (idleAt.current = Date.now())
  const bump = (i: number) => stalks.current[i]?.bounce()

  // Bao Bao reacts to every tap: rolls and giggles.
  const giggles = useRef(0)
  const tapBao = () => {
    if (busy.current) return
    touch()
    sounds.pop()
    void bao.current?.play('roll')
    void say(B.giggle[giggles.current++ % B.giggle.length])
  }

  const munch = async (line: (typeof B.munch)[number]) => {
    setBundle(true)
    sounds.pop()
    await wait(500)
    setBundle(false)
    setBamboo(true)
    void say(line)
    ;[300, 750, 1200].forEach((ms) => setTimeout(() => sfx.munch(), ms))
    await bao.current?.play('munch')
    await wait(150)
    setBamboo(false)
  }

  // --- round 1: grow one shoot three tall -------------------------------------------------------------------------
  const grow1 = () => {
    if (busy.current || phase !== 'r1') return
    touch()
    const cur = heights[0]
    if (cur >= 3) {
      stalks.current[0]?.wiggle()
      sounds.pop()
      void say(B.enough)
      return
    }
    const next = cur + 1
    setHeights([next])
    growFx(next - 1)
    void say(B.count[next - 1])
    if (next === 2) setProgress(1, TOTAL)
    if (next === 3) {
      setProgress(2, TOTAL)
      busy.current = true
      void (async () => {
        await wait(1100)
        if (!alive()) return
        void bao.current?.play('cheer')
        burst()
        sounds.correct()
        await say(B.threeTall)
        await wait(400)
        setHeights([3])
        busy.current = false
        setPrompt(null)
        setPhase('break1')
      })()
    }
  }
  const growFx = (i: number) => {
    sounds.whoosh()
    setTimeout(() => sfx.pop(), 130)
    setTimeout(() => sounds.note(i), 60)
    void bao.current?.play('hop')
  }

  // --- round 2: make the glowing one taller than its neighbour -----------------------------------------------------
  const act2 = (col: number) => {
    if (busy.current || phase !== 'r2') return
    touch()
    if (col === 0) {
      stalks.current[0]?.wiggle()
      sounds.oops()
      void bao.current?.play('shake')
      void say(B.glowHint)
      return
    }
    const cur = heights[1]
    if (cur >= 3) return
    const next = cur + 1
    setHeights([2, next])
    growFx(next)
    if (next === 2) {
      setProgress(3, TOTAL)
      void say(B.same)
    }
    if (next === 3) {
      setProgress(4, TOTAL)
      busy.current = true
      void (async () => {
        await wait(500)
        if (!alive()) return
        sounds.correct()
        burst()
        void bao.current?.play('cheer')
        await say(B.taller)
        await wait(600)
        busy.current = false
        setPrompt(null)
        setPhase('break2')
      })()
    }
  }

  // --- round 3: tap the tallest, then the shortest ------------------------------------------------------------------
  const act3 = (col: number) => {
    if (busy.current || (phase !== 'r3a' && phase !== 'r3b')) return
    touch()
    const tallest = phase === 'r3a'
    const right = tallest ? 1 : 2
    if (col === right) {
      busy.current = true
      setGuide(null)
      setDimmed([])
      setAnswer(null)
      setWrongs(0)
      sounds.correct()
      bump(col)
      burst()
      void bao.current?.play('cheer')
      if (tallest) setProgress(5, TOTAL)
      void (async () => {
        await say(tallest ? B.tallestYes : B.shortestYes)
        await wait(500)
        busy.current = false
        if (tallest) {
          setPrompt(B.shortestQ)
          setPhase('r3b')
        } else {
          setPrompt(null)
          setPhase('payoff')
        }
      })()
      return
    }
    stalks.current[col]?.wiggle()
    sounds.oops()
    void bao.current?.play('shake')
    const w = wrongs + 1
    setWrongs(w)
    setDimmed((d) => (d.includes(col) ? d : [...d, col]))
    setGuide(R3[right])
    void say(tallest ? B.tallestWrong : B.shortestWrong).then(() => (w >= 2 ? say(tallest ? B.tallestHint : B.shortestHint) : undefined))
    if (w >= 2) setAnswer(right)
  }

  // --- phase changes -------------------------------------------------------------------------------------------------
  useEffect(() => {
    touch()
    if (phase === 'break1' || phase === 'break2') {
      void (async () => {
        await wait(300)
        await munch(phase === 'break1' ? B.munch[0] : B.munch[1])
        if (!alive()) return
        if (phase === 'break1') {
          setHeights([2, 0])
          setPrompt(B.grow2)
          setPhase('r2')
        } else {
          setHeights(R3)
          setPrompt(B.tallestQ)
          setPhase('r3a')
        }
      })()
    }
    if (phase === 'payoff') void payoff()
  }, [phase])

  // A gentle nudge if she pauses in a growing round.
  useEffect(() => {
    const t = setInterval(() => {
      if (busy.current || Date.now() - idleAt.current < 9000) return
      if (phase === 'r1') bump(0)
      if (phase === 'r2') bump(1)
      idleAt.current = Date.now()
    }, 3000)
    return () => clearInterval(t)
  }, [phase])

  // --- the payoff: climb, bend, tumble, munch --------------------------------------------------------------------------
  async function payoff() {
    busy.current = true
    const stalkCol = 1
    const x1 = colX(stalkCol, 3)
    const x2 = landX2
    setHiddenCols([0, 2])
    setPile(true)
    sounds.pop()
    void say(B.climb)
    const toX = x1 - baoW / 2 - baoX
    // walk to the bamboo
    void bao.current?.play('hop')
    await tween(0, 1, 0.9, (v) => setBaoPos(toX * v, -Math.abs(Math.sin(v * Math.PI * 2)) * 18))
    if (!alive()) return
    await wait(700)
    // climb
    const L5 = 5 * seg
    const c0 = baoCenter
    const c1 = L5 - 6
    void say(B.up, { interrupt: false })
    let climbing = true
    void (async () => {
      while (climbing && alive()) await bao.current?.play('climb')
    })()
    await tween(c0, c1, 3.4, (c) => setBaoPos(toX, baoCenter - c), 'easeInOut')
    climbing = false
    if (!alive()) return
    // the bamboo bends under her
    void bao.current?.play('nod')
    sfx.boing()
    const BEND = 9
    void say(B.whoa)
    await tween(0, BEND, 1.0, (v) => {
      setBend(v)
      const p = stalkPoint(seg, v, c1)
      setBaoPos(x1 + p.x - baoW / 2 - baoX, baoCenter - p.y, p.angle)
    }, 'easeIn')
    if (!alive()) return
    // whoosh: the bamboo springs back and she tumbles down into the leaf pile
    const tip = stalkPoint(seg, BEND, c1)
    const startX = x1 + tip.x - baoW / 2 - baoX
    const startY = baoCenter - tip.y
    const landX = x2 - baoW / 2 - baoX
    const landY = -pileH * 0.45
    sounds.whoosh()
    void bao.current?.play('roll')
    void tween(BEND, 0, 0.7, setBend, 'easeOut')
    await wait(200)
    await tween(0, 1, 0.9, (v) => {
      setBaoPos(startX + (landX - startX) * v, startY + (landY - startY) * v - Math.sin(v * Math.PI) * seg * 1.3, tip.angle * (1 - v))
    }, 'linear')
    if (!alive()) return
    sfx.thump()
    sounds.pop()
    setPuffs((p) => [...p, { id: Date.now(), x: x2, y: ground - pileH * 0.6 }])
    void say(B.leaves)
    await wait(800)
    // munch!
    setBamboo(true)
    ;[200, 650, 1100, 1700, 2150, 2600].forEach((ms) => setTimeout(() => sfx.munch(), ms))
    void bao.current?.play('munch')
    await wait(1650)
    void bao.current?.play('munch')
    void say(B.yum)
    setProgress(TOTAL, TOTAL)
    await wait(1600)
    if (alive()) onDone()
  }

  // --- render ----------------------------------------------------------------------------------------------------------
  const round = phase === 'r1' || phase === 'break1' ? 1 : phase === 'r2' || phase === 'break2' ? 2 : 3
  const hideStalks = phase === 'break1' || phase === 'break2'
  const activeCols = cols
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: `#CFEFD8 url(${landscape ? art.bgBamboo : art.bgBambooTall}) center / cover` }}>
      <style>{`@media (max-height: 560px) { .bamboo-prompt { padding-left: 250px !important; } .bamboo-field { top: 62px !important; } }`}</style>
      <Ambient />
      {prompt && phase !== 'payoff' && (
        <div className="bamboo-prompt" style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 12px', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <PromptBubble text={prompt} />
          </div>
        </div>
      )}
      <div ref={field} className="bamboo-field" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 'calc(var(--top-clear) + 84px)' }}>
        {ready && (
          <>
            {/* the leaf pile: one copy behind Bao Bao, one in front of her feet so she sinks in */}
            <AnimatePresence>
              {pile && (
                <>
                  <motion.img key="pb" src={art.leafPile} alt="" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', left: landX2 - pileW / 2, top: ground - pileH + 10, width: pileW, zIndex: 4, transformOrigin: '50% 100%', pointerEvents: 'none' }} />
                  <motion.img key="pf" src={art.leafPile} alt="" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', left: landX2 - pileW / 2, top: ground - pileH + 10, width: pileW, zIndex: 8, clipPath: 'inset(58% 0 0 0)', transformOrigin: '50% 100%', pointerEvents: 'none' }} />
                </>
              )}
            </AnimatePresence>
            {guide !== null && phase.startsWith('r3') && (
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ position: 'absolute', left: a - 40, width: b - a + 80, top: ground - guide * seg - seg * 0.18, borderTop: `5px dashed ${INK}`, opacity: 0.7, zIndex: 2, transformOrigin: '0 50%', pointerEvents: 'none' }} />
            )}
            <AnimatePresence>
              {phase === 'r1' && heights[0] === 0 && (
                <motion.div key="cue" initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, -seg * 0.6, 0] }} exit={{ opacity: 0, scale: 0.5 }} transition={{ y: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.4 } }} style={{ position: 'absolute', left: colX(0, 1) - 30, top: ground - seg * 1.9, width: 60, textAlign: 'center', fontSize: Math.max(40, seg * 0.7), lineHeight: 1, zIndex: 5, pointerEvents: 'none', filter: 'drop-shadow(0 0 8px rgba(255,200,61,1))' }}>
                  <div style={{ color: 'var(--hotpink)', fontWeight: 900 }}>⬆</div>
                  <div>👆</div>
                </motion.div>
              )}
            </AnimatePresence>
            {heights.map((h, i) => (
              <Stalk
                key={`${round}-${i}`}
                ref={(s) => {
                  stalks.current[i] = s
                }}
                segs={h}
                seg={seg}
                colW={colW}
                room={5}
                x={colX(i, activeCols)}
                ground={ground}
                bend={i === 1 && phase === 'payoff' ? bend : 0}
                glow={(phase === 'r2' && i === 1) || (phase === 'r1') || answer === i}
                dim={dimmed.includes(i)}
                markers={phase === 'r1' ? 3 : undefined}
                minHit={phone ? 100 : 160}
                hidden={hideStalks || hiddenCols.includes(i)}
                disabled={busy.current && phase !== 'r3a' && phase !== 'r3b'}
                label={phase === 'r3a' || phase === 'r3b' ? `bamboo ${i + 1}` : 'bamboo shoot'}
                onAct={() => (phase === 'r1' ? grow1() : phase === 'r2' ? act2(i) : act3(i))}
                style={phase === 'payoff' ? { pointerEvents: 'none' } : undefined}
              />
            ))}
            <AnimatePresence>
              {bundle && (
                <motion.img key="bundle" src={art.bambooBundle} alt="" initial={{ y: -200, opacity: 0, rotate: -20 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ scale: 0.2, opacity: 0, x: -60 }} transition={{ type: 'spring', bounce: 0.4 }} style={{ position: 'absolute', left: baoX + baoW * 0.95, top: ground - baoH * 0.55, height: baoH * 0.55, zIndex: 7, pointerEvents: 'none' }} />
              )}
            </AnimatePresence>
            <div ref={baoBox} style={{ position: 'absolute', left: baoX, top: ground - baoH + 4, width: baoW, height: baoH, zIndex: 6, transformOrigin: '50% 65%' }}>
              <BaoBao ref={bao} height="100%" bamboo={bamboo} onTap={tapBao} />
            </div>
            {puffs.map((p) => (
              <LeafPuff key={p.id} x={p.x} y={p.y} size={seg} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

/** A burst of leaves when Bao Bao lands in the pile. */
function LeafPuff({ x, y, size }: { x: number; y: number; size: number }) {
  const leaves = Array.from({ length: 14 }, (_, i) => ({ dx: (Math.random() - 0.5) * size * 3.2, dy: -size * (0.8 + Math.random() * 1.6), rot: (Math.random() - 0.5) * 540, c: ['#B7E39F', '#9CD98C', '#E8C46A', '#7CCBA2'][i % 4] }))
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 9, pointerEvents: 'none' }}>
      {leaves.map((l, i) => (
        <motion.svg key={i} width="26" height="34" viewBox="-13 -34 26 34" initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }} animate={{ x: l.dx, y: [0, l.dy, l.dy + size * 2.2], opacity: [1, 1, 0], rotate: l.rot }} transition={{ duration: 1.6, ease: 'easeOut', times: [0, 0.4, 1] }} style={{ position: 'absolute' }}>
          <path d="M0 0 C-10 -10 -8 -26 0 -32 C8 -26 10 -10 0 0Z" fill={l.c} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </motion.svg>
      ))}
    </div>
  )
}

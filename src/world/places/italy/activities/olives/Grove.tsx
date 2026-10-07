// Comb the branches: the old olive tree stands on the red soil with a green net on the ground under it. One branch at a
// time glows with a dotted arrow; she drags the pink rake along it from the trunk outward (it follows the branch's curve)
// and the olives pop off and rain into the net (pitter-patter notes). Tapping the branch combs it by itself.
// A few olives bonk Spina and stick to her quills: tap her and she shakes them into the basket.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { burst, say, SparklePuppet, sounds, useAlive, useLandscape, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { art } from '../../art'
import { L } from '../../lines'
import { Spina } from '../../puppets/Spina'
import { Basket, OliveSvg, Scene, Stand, SunButton, type OliveColor } from './bits'

const O = L.olives
type Pt = [number, number]

// The tree sprite is 1000 x 843. Each branch runs from the trunk outward (measured on the art, in sprite px).
const TREE_W = 1000
const TREE_H = 843
const BRANCHES: Pt[][] = [
  [[430, 510], [340, 466], [262, 440], [190, 413], [132, 372], [84, 322]],
  [[592, 350], [566, 262], [516, 200], [452, 156], [382, 122]],
  [[598, 476], [680, 449], [760, 431], [830, 398], [880, 356], [918, 300]],
]
const COLORS: OliveColor[] = ['green', 'green', 'purple', 'green', 'black', 'green', 'green', 'purple']
const PER_BRANCH = [7, 6, 7]
/** Olives on branch 0 and 2 that bonk Spina instead of landing in the net (by index along the branch). */
const BONKERS: Record<number, number[]> = { 0: [3, 6], 2: [5] }

// Layout in % of the scene picture (x, ground y) and heights in cqh / widths in cqw.
const LAYOUT = {
  land: { tree: { x: 52, base: 86, h: 60 }, net: { x: 52, y: 89, w: 52 }, spina: { x: 21.5, y: 91, h: 27 }, basket: { x: 11.5, y: 92, w: 10 }, sparkle: { x: 84, y: 92, h: 29 }, sun: { x: 89.4, y: 16.3, d: '12cqw' } },
  tall: { tree: { x: 50, base: 82, h: 49 }, net: { x: 50, y: 84.5, w: 96 }, spina: { x: 31, y: 92.5, h: 18.5 }, basket: { x: 13, y: 92.5, w: 18 }, sparkle: { x: 79, y: 93, h: 21 }, sun: { x: 88.4, y: 10.2, d: '20cqw' } },
}

function polyline(pts: Pt[]) {
  const lens = [0]
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const total = lens[lens.length - 1]
  const at = (t: number): Pt => {
    const d = Math.max(0, Math.min(1, t)) * total
    let i = 1
    while (i < pts.length - 1 && lens[i] < d) i++
    const k = (d - lens[i - 1]) / (lens[i] - lens[i - 1] || 1)
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]
  }
  const project = ([x, y]: Pt) => {
    let best = 0
    let bestD = Infinity
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1]
      const [bx, by] = pts[i]
      const vx = bx - ax
      const vy = by - ay
      const k = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)))
      const d = Math.hypot(ax + vx * k - x, ay + vy * k - y)
      if (d < bestD) ((bestD = d), (best = (lens[i - 1] + k * (lens[i] - lens[i - 1])) / total))
    }
    return best
  }
  return { at, project }
}

interface TreeOlive {
  id: string
  branch: number
  t: number
  x: number
  y: number
  color: OliveColor
  bonk: boolean
}
interface Faller {
  id: string
  color: OliveColor
  from: Pt
  to: Pt
  arc: number
  dur: number
  delay?: number
}

export function Grove({ onBranch, onDone }: { onBranch: (n: number) => void; onDone: () => void }) {
  const landscape = useLandscape()
  const lay = landscape ? LAYOUT.land : LAYOUT.tall
  const ratio = landscape ? 1.5 : 1 / 1.5
  const alive = useAlive()
  const spina = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)

  // Tree box in % of the scene.
  const tw = (lay.tree.h * (TREE_W / TREE_H)) / ratio
  const tl = lay.tree.x - tw / 2
  const tt = lay.tree.base - lay.tree.h
  const toScene = ([x, y]: Pt): Pt => [tl + (x / TREE_W) * tw, tt + (y / TREE_H) * lay.tree.h]
  const oliveW = tw * 0.036 // cqw

  const paths = useMemo(() => BRANCHES.map(polyline), [])
  const olives = useMemo<TreeOlive[]>(() => {
    const all: TreeOlive[] = []
    BRANCHES.forEach((_, b) => {
      const n = PER_BRANCH[b]
      for (let i = 0; i < n; i++) {
        const t = 0.26 + (0.72 * i) / (n - 1)
        const [x, y] = paths[b].at(t)
        all.push({ id: `o${b}-${i}`, branch: b, t, x: x + (i % 2 ? 12 : -10), y: y + 30 + (i % 3) * 6, color: COLORS[(i + b * 3) % COLORS.length], bonk: (BONKERS[b] ?? []).includes(i) })
      }
    })
    return all
  }, [paths])

  const [branch, setBranch] = useState(0)
  const [phase, setPhase] = useState<'comb' | 'busy' | 'shake' | 'done'>('comb')
  const [popped, setPopped] = useState<Set<string>>(() => new Set())
  const [fallers, setFallers] = useState<Faller[]>([])
  const [inNet, setInNet] = useState<{ id: string; x: number; y: number; color: OliveColor; rot: number }[]>([])
  const [stuck, setStuck] = useState(0)
  const [basket, setBasket] = useState(0)
  const [prompt, setPrompt] = useState<Line | null>(O.comb)
  const [sunGlow, setSunGlow] = useState(false)
  const [netBounce, setNetBounce] = useState(0)

  const tRef = useRef(0)
  const tMax = useRef(0)
  const poppedRef = useRef(new Set<string>())
  const popCount = useRef(0)
  const bonked = useRef(0)
  const pile = useRef<number[]>(Array(14).fill(0))
  const rakeEl = useRef<HTMLDivElement>(null)
  const treeEl = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const autoRun = useRef(false)
  const lastTouch = useRef(Date.now())
  const tickles = useRef(0)

  // Where olives land in the net: the pile grows in little columns across it.
  const netLeft = lay.net.x - lay.net.w / 2
  const netH = lay.net.w * (95 / 1024) * ratio // % of scene height
  const netTop = lay.net.y - netH * 0.66
  const oliveH = oliveW * 1.25 * ratio // % of scene height
  const landing = (x: number): Pt => {
    const cols = pile.current.length
    let c = Math.round(((x - netLeft) / lay.net.w) * (cols - 1))
    c = Math.max(1, Math.min(cols - 2, c))
    // Spill to the lower neighbor so the heap stays a heap.
    if (pile.current[c - 1] < pile.current[c] - 1) c -= 1
    else if (pile.current[c + 1] < pile.current[c] - 1) c += 1
    const n = pile.current[c]++
    const cx = netLeft + ((c + 0.5) / cols) * lay.net.w + (Math.random() - 0.5) * 0.8
    return [cx, netTop - oliveH * 0.05 - n * oliveH * 0.6]
  }

  const spinaHead = (): Pt => [lay.spina.x + 1, lay.spina.y - lay.spina.h * 0.78]
  const basketMouth = (): Pt => [lay.basket.x, lay.basket.y - lay.basket.w * (168 / 200) * ratio * 0.62]

  const placeRake = (t: number) => {
    const el = rakeEl.current
    if (!el) return
    const [x, y] = paths[branch]?.at(t) ?? [0, 0]
    el.style.left = `${(x / TREE_W) * 100}%`
    el.style.top = `${(y / TREE_H) * 100}%`
  }
  const shownBranch = useRef(branch)
  if (shownBranch.current !== branch) {
    shownBranch.current = branch
    tRef.current = 0
    tMax.current = 0
  }

  // The rake moved to `t` along the branch: pop every olive it passed.
  const comb = (t: number) => {
    if (phase !== 'comb') return
    tRef.current = t
    tMax.current = Math.max(tMax.current, t)
    placeRake(t)
    const fresh = olives.filter((o) => o.branch === branch && !poppedRef.current.has(o.id) && o.t <= t + 0.03)
    if (!fresh.length) return
    fresh.forEach((o) => poppedRef.current.add(o.id))
    setPopped(new Set(poppedRef.current))
    const add: Faller[] = fresh.map((o) => {
      const from = toScene([o.x, o.y])
      sounds.note(Math.min(10, popCount.current++ % 11))
      if (o.bonk) {
        const to = spinaHead()
        setTimeout(() => bonk(), 650)
        return { id: o.id, color: o.color, from, to, arc: 10, dur: 0.65 }
      }
      return { id: o.id, color: o.color, from, to: landing(from[0]), arc: 1.5, dur: 0.55 + Math.random() * 0.2 }
    })
    setFallers((f) => [...f, ...add])
    add.forEach((f) => {
      if (f.arc > 5) return
      setTimeout(() => {
        if (!alive()) return
        setFallers((all) => all.filter((x) => x.id !== f.id))
        setInNet((n) => [...n, { id: f.id, x: f.to[0], y: f.to[1], color: f.color, rot: Math.random() * 40 - 20 }])
        setNetBounce((b) => b + 1)
      }, f.dur * 1000)
    })
    if (olives.filter((o) => o.branch === branch).every((o) => poppedRef.current.has(o.id))) void finishBranch()
  }

  const bonk = () => {
    if (!alive()) return
    setFallers((f) => f.filter((x) => !(BONKERS[branch] ?? []).some((i) => x.id === `o${branch}-${i}`)))
    setStuck((s) => s + 1)
    sfx.boing()
    void spina.current?.play('puff')
    if (bonked.current++ === 0) void say(O.bonk)
    else if (bonked.current === 3) void say(O.bonkAgain)
  }

  const finishBranch = async () => {
    setPhase('busy')
    await wait(1100)
    if (!alive()) return
    const b = branch
    onBranch(b + 1)
    sounds.correct()
    burst()
    void spina.current?.play('cheer')
    void sparkle.current?.play('cheer')
    setPrompt(null)
    await say(O.branchDone[b])
    if (!alive()) return
    // Olives on her quills? She needs a shake.
    if ((BONKERS[b] ?? []).length) {
      setPhase('shake')
      setPrompt(O.tapSpina)
      return // continues in shakeOff
    }
    await nextBranch(b)
  }

  const nextBranch = async (b: number) => {
    if (b === 0) {
      setSunGlow(true)
      void sparkle.current?.play('nod')
      await say(O.sun)
      if (!alive()) return
      setSunGlow(false)
    }
    if (b < 2) {
      setBranch(b + 1)
      setPhase('comb')
      setPrompt(b === 0 ? O.combNext : O.combLast)
      lastTouch.current = Date.now()
      return
    }
    // All three combed: the net's olives go into the basket.
    setPhase('done')
    await say(O.toBasket)
    if (!alive()) return
    const [bx, by] = basketMouth()
    const moving = [...inNetRef.current]
    setInNet([])
    setFallers(moving.map((o, i) => ({ id: `b-${o.id}`, color: o.color, from: [o.x, o.y], to: [bx + (Math.random() - 0.5) * 3, by], arc: 9, dur: 0.6, delay: i * 0.05 })))
    moving.forEach((_, i) =>
      setTimeout(() => {
        if (!alive()) return
        sounds.note(i % 11)
        setBasket((n) => n + 1)
      }, 600 + i * 50),
    )
    await wait(700 + moving.length * 50)
    if (!alive()) return
    setFallers([])
    sounds.fanfare()
    void spina.current?.play('dance')
    await wait(1400)
    if (alive()) onDone()
  }
  const inNetRef = useRef(inNet)
  inNetRef.current = inNet

  const shakeOff = async () => {
    setPhase('busy')
    setPrompt(null)
    sounds.whoosh()
    const n = stuck
    void spina.current?.play('shake')
    await wait(500)
    if (!alive()) return
    const from = spinaHead()
    const [bx, by] = basketMouth()
    setFallers(Array.from({ length: n }, (_, i) => ({ id: `s${branch}-${i}`, color: i % 2 ? 'black' : 'green', from: [from[0] + (i - 0.5) * 3, from[1]], to: [bx + (i - 0.5) * 2, by], arc: 12, dur: 0.6, delay: i * 0.1 })))
    await wait(700 + n * 100)
    if (!alive()) return
    setFallers([])
    setStuck(0)
    setBasket((c) => c + n)
    sfx.pop()
    await say(O.shook)
    if (!alive()) return
    await nextBranch(branch)
  }

  const tapSpina = () => {
    lastTouch.current = Date.now()
    if (phase === 'shake') return void shakeOff()
    sounds.pop()
    void spina.current?.play('hop')
    void say(L.tickle.spina[tickles.current++ % L.tickle.spina.length])
  }

  // Auto-comb (a tap on the branch): the rake glides out along it by itself.
  const autoComb = () => {
    if (autoRun.current || phase !== 'comb') return
    autoRun.current = true
    const start = performance.now()
    const t0 = tRef.current
    const dur = Math.max(0.6, (1 - t0) * 2) * 1000
    const step = () => {
      if (!alive()) return
      const k = Math.min(1, (performance.now() - start) / dur)
      comb(t0 + (1 - t0) * k)
      if (k < 1 && autoRun.current) requestAnimationFrame(step)
      else autoRun.current = false
    }
    requestAnimationFrame(step)
  }
  // `comb` closes over the current phase/branch: keep the latest in a ref for the animation loop.
  const combRef = useRef(comb)
  combRef.current = comb

  // Idle for a while: say the hint once more.
  useEffect(() => {
    if (phase !== 'comb') return
    const id = setInterval(() => {
      if (Date.now() - lastTouch.current > 10000 && !dragging.current) {
        lastTouch.current = Date.now()
        void say(O.combHint)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  const toSprite = (cx: number, cy: number): Pt => {
    const r = treeEl.current!.getBoundingClientRect()
    return [((cx - r.left) / r.width) * TREE_W, ((cy - r.top) / r.height) * TREE_H]
  }
  const down = useRef<{ x: number; y: number } | null>(null)

  const path = paths[branch]
  const arrowPts = Array.from({ length: 24 }, (_, i) => path?.at(i / 23) ?? [0, 0])
  const arrowD = arrowPts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(0)} ${(p[1] - 6).toFixed(0)}`).join(' ')
  const [ex, ey] = arrowPts[23]
  const [px, py] = arrowPts[21]
  const ang = (Math.atan2(ey - py, ex - px) * 180) / Math.PI

  return (
    <Scene bg={art.bgOliveGrove} bgTall={art.bgOliveGroveTall} prompt={prompt}>
      <SunButton x={lay.sun.x} y={lay.sun.y} size={lay.sun.d} glow={sunGlow} onTap={() => {
        sounds.sparkle()
        void say(O.sun)
      }} />

      {/* The old olive tree, with its olives, the dotted arrow and the rake. */}
      <div ref={treeEl} style={{ position: 'absolute', left: `${tl}%`, top: `${tt}%`, width: `${tw}%`, height: `${lay.tree.h}%`, zIndex: 2 }}>
        <motion.img src={art.oliveTree} alt="" draggable={false} animate={{ rotate: [0, 0.6, 0, -0.4, 0] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transformOrigin: '50% 100%', pointerEvents: 'none' }} />
        <svg viewBox={`0 0 ${TREE_W} ${TREE_H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
          {phase === 'comb' && (
            <g>
              <motion.path d={arrowD} fill="none" stroke="#fff" strokeWidth="34" strokeLinecap="round" opacity={0.35} animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 1.2 }} />
              <motion.path d={arrowD} fill="none" stroke="#FFE27A" strokeWidth="10" strokeLinecap="round" strokeDasharray="4 26" animate={{ strokeDashoffset: [60, 0] }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
              <path d="M-26 -22 L10 0 L-26 22" transform={`translate(${ex} ${ey - 6}) rotate(${ang})`} fill="none" stroke="#FFE27A" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {olives.map((o) =>
            popped.has(o.id) ? null : (
              <g key={o.id} transform={`translate(${o.x} ${o.y})`}>
                <motion.g animate={{ rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 2 + (o.t % 0.5), ease: 'easeInOut' }}>
                  <path d="M0 -22 L0 -34" stroke="#6E3B24" strokeWidth="5" strokeLinecap="round" />
                  <ellipse rx="18" ry="23" fill={o.color === 'green' ? '#9DAA4E' : o.color === 'purple' ? '#9A5A8C' : '#4A2B3F'} stroke="#6E3B24" strokeWidth="5" />
                  <ellipse cx="-6" cy="-9" rx="4" ry="7" fill="#fff" opacity="0.5" />
                </motion.g>
              </g>
            ),
          )}
        </svg>
        {/* Combing surface: drag anywhere along the glowing branch; a tap combs it by itself. */}
        <div
          aria-label="branch"
          onPointerDown={(e) => {
            if (phase !== 'comb') return
            lastTouch.current = Date.now()
            down.current = { x: e.clientX, y: e.clientY }
            ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (!down.current || phase !== 'comb') return
            if (!dragging.current && Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) < 10) return
            if (!dragging.current) sounds.pickup()
            dragging.current = true
            autoRun.current = false
            const t = path.project(toSprite(e.clientX, e.clientY))
            combRef.current(Math.min(t, tMax.current + 0.2))
          }}
          onPointerUp={(e) => {
            const was = dragging.current
            const d = down.current
            dragging.current = false
            down.current = null
            if (!d || phase !== 'comb' || was) return
            // A tap near the branch combs it; a tap far away just reminds her.
            const p = toSprite(e.clientX, e.clientY)
            const near = Math.hypot(...(path.at(path.project(p)).map((v, i) => v - p[i]) as Pt)) < 170
            if (near) autoComb()
            else void say(O.comb)
          }}
          onPointerCancel={() => {
            dragging.current = false
            down.current = null
          }}
          style={{ position: 'absolute', inset: '-4% -4% 30% -4%', touchAction: 'none', zIndex: 3 }}
        />
        {/* The trunk: tap it to hear how old olive trees get. */}
        <button
          aria-label="Old olive tree"
          onClick={() => {
            sounds.pop()
            void say(L.facts.olives)
          }}
          style={{ position: 'absolute', left: '36%', width: '30%', top: '70%', height: '30%', background: 'none', border: 'none', padding: 0, zIndex: 4, borderRadius: '40% 40% 10% 10%' }}
        />
        <div ref={rakeEl} style={{ position: 'absolute', left: `${((path?.at(tRef.current)[0] ?? 0) / TREE_W) * 100}%`, top: `${((path?.at(tRef.current)[1] ?? 0) / TREE_H) * 100}%`, width: 0, height: 0, zIndex: 5, pointerEvents: 'none', opacity: phase === 'comb' ? 1 : 0, transition: 'opacity .3s' }}>
          <motion.img
            src={art.rake}
            alt=""
            draggable={false}
            animate={phase === 'comb' ? { scale: [1, 1.08, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{ position: 'absolute', right: 0, top: 0, width: `${tw * 0.24}cqw`, translate: '3% -50%', rotate: '-74deg', transformOrigin: '97% 50%', filter: 'drop-shadow(0 0 6px #fff) drop-shadow(0 0 10px #FFE27A)' }}
          />
        </div>
      </div>

      {/* Olives in the net, behind the net's front so they peek over its edge. */}
      {inNet.map((o) => (
        <div key={o.id} style={{ position: 'absolute', left: `${o.x}%`, top: `${o.y}%`, width: `${oliveW}cqw`, translate: '-50% -50%', rotate: `${o.rot}deg`, zIndex: 3, pointerEvents: 'none' }}>
          <OliveSvg color={o.color} />
        </div>
      ))}
      <motion.img
        key={netBounce}
        src={art.oliveNet}
        alt=""
        initial={{ scaleY: 0.9 }}
        animate={{ scaleY: 1 }}
        transition={{ type: 'spring', bounce: 0.6, duration: 0.35 }}
        style={{ position: 'absolute', left: `${netLeft}%`, bottom: `${100 - lay.net.y}%`, width: `${lay.net.w}%`, transformOrigin: '50% 100%', zIndex: 4, pointerEvents: 'none' }}
      />

      <Stand x={lay.basket.x} y={lay.basket.y} w={`${lay.basket.w}cqw`} z={6}>
        <Basket fill={basket / 22} />
      </Stand>
      <Stand x={lay.spina.x} y={lay.spina.y} h={`${lay.spina.h}cqh`} z={7}>
        <motion.div animate={phase === 'shake' ? { filter: ['drop-shadow(0 0 0px #FFE27A)', 'drop-shadow(0 0 14px #FFC83D)', 'drop-shadow(0 0 0px #FFE27A)'] } : { filter: 'drop-shadow(0 0 0px #FFE27A)' }} transition={{ repeat: phase === 'shake' ? Infinity : 0, duration: 1 }} style={{ height: '100%' }}>
          <Spina ref={spina} height="100%" stuck={stuck} onTap={tapSpina} />
        </motion.div>
      </Stand>
      <Stand x={lay.sparkle.x} y={lay.sparkle.y} h={`${lay.sparkle.h}cqh`} z={7}>
        <SparklePuppet ref={sparkle} height="100%" flip lookToward={-0.6} />
      </Stand>

      <AnimatePresence>
        {fallers.map((f) => (
          <motion.div
            key={f.id}
            initial={{ left: `${f.from[0]}%`, top: `${f.from[1]}%`, rotate: 0 }}
            animate={{ left: `${f.to[0]}%`, top: f.arc > 5 ? [`${f.from[1]}%`, `${Math.min(f.from[1], f.to[1]) - f.arc}%`, `${f.to[1]}%`] : `${f.to[1]}%`, rotate: f.arc > 5 ? 540 : 120 }}
            exit={{ opacity: 0 }}
            transition={{ left: { duration: f.dur, ease: 'linear', delay: f.delay }, top: { duration: f.dur, ease: f.arc > 5 ? ['easeOut', 'easeIn'] : 'easeIn', delay: f.delay }, rotate: { duration: f.dur, delay: f.delay } }}
            style={{ position: 'absolute', width: `${oliveW}cqw`, translate: '-50% -50%', zIndex: 9, pointerEvents: 'none' }}
          >
            <OliveSvg color={f.color} />
          </motion.div>
        ))}
      </AnimatePresence>
    </Scene>
  )
}

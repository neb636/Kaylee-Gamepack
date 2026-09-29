// 🍲 Hotpot Night (Sichuan/Chongqing). Nai Nai hosts a family hotpot. Kaylee drops food into the split pot (red spicy side,
// white mild side), waits for the sparkle, scoops it with big chopsticks, then SPINS the lazy Susan with her finger to bring
// the bowl to the friend who asked (Bao Bao wants noodles, Hong wants something green from the mild side, Nai Nai wants two
// dumplings). Each friend says "Shyeh shyeh!" (谢谢). No failing: wrong food or side wiggles, a friend shakes their head,
// and the right thing glows. Payoff: everyone eats together, Hong stands up and cheers.
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { Buddy, burst, say, sounds, useAlive, useElementSize, useLandscape, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { Stage } from '../../../../kit/Stage'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import { BaoBao } from '../../puppets/BaoBao'
import { Hong } from '../../puppets/Hong'
import { INK } from '../../puppets/ink'
import type { ActivityProps } from '../../Place'
import { WordCard, type WordId } from '../../WordCard'
import { Bubbles, Chopsticks, FoodIcon, Twinkles, type FoodKind } from './Parts'

const H = L.hotpot
const COOK_MS = 3000
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

interface Round {
  /** Who asked: 0 Bao Bao (left), 1 Hong (right), 2 Nai Nai (top). */
  friend: 0 | 1 | 2
  kind: FoodKind
  count: number
  side?: 'mild'
  tray: FoodKind[]
  hint: Line
}
const ROUNDS: Round[] = [
  { friend: 0, kind: 'noodles', count: 1, tray: ['noodles', 'tofu', 'mushroom'], hint: H.dropTipNoodles },
  { friend: 1, kind: 'bokChoy', count: 1, side: 'mild', tray: ['tofu', 'bokChoy', 'mushroom'], hint: H.green },
  { friend: 2, kind: 'dumpling', count: 2, tray: ['meatball', 'dumpling', 'tofu'], hint: H.dumplings },
]
/** Ring rotation (in quarter turns) that brings the bowl to each friend: bowl starts at the bottom seat. */
const QUARTERS = [1, 3, 2]
/** Where food floats in the pot (fractions of the pot picture). */
const SLOTS = {
  spicy: [[0.31, 0.42], [0.38, 0.58], [0.25, 0.55], [0.42, 0.36]],
  mild: [[0.68, 0.4], [0.73, 0.57], [0.62, 0.58], [0.78, 0.47]],
}

interface Item {
  id: number
  kind: FoodKind
  side: 'spicy' | 'mild'
  slot: number
  ready: boolean
}
type Phase = 'story' | 'drop' | 'scoop' | 'spin' | 'serve' | 'finale'
type DragState = { kind: 'food' | 'chop'; food?: FoodKind; x: number; y: number }

export function Hotpot({ onDone, setProgress }: ActivityProps) {
  const landscape = useLandscape()
  const box = useRef<HTMLDivElement>(null)
  const { width: W, height: Ht } = useElementSize(box)
  const alive = useAlive()

  const bao = useRef<PuppetHandle>(null)
  const hong = useRef<PuppetHandle>(null)
  const nai = useRef<PuppetHandle>(null)
  const ringBox = useRef<HTMLDivElement>(null)
  const potBox = useRef<HTMLDivElement>(null)

  const [story, setStory] = useState(true)
  const [round, setRound] = useState(0)
  const [phase, setPhaseState] = useState<Phase>('story')
  const phaseRef = useRef<Phase>('story')
  const [items, setItems] = useState<Item[]>([])
  const itemsRef = useRef<Item[]>([])
  const [bowl, setBowl] = useState<FoodKind[]>([])
  const bowlRef = useRef<FoodKind[]>([])
  const [armed, setArmed] = useState<FoodKind | null>(null)
  const [chop, setChop] = useState(false)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [glow, setGlow] = useState<'food' | 'mild' | 'chop' | 'spin' | null>(null)
  const [wiggle, setWiggle] = useState<{ what: string; n: number } | null>(null)
  const [big, setBig] = useState(false)
  const [word, setWord] = useState<WordId | null>(null)
  const [prompt, setPrompt] = useState<Line>(H.ask[0])
  const [eaten, setEaten] = useState<number[]>([])
  const [clink, setClink] = useState(false)
  const placedRef = useRef(0)
  const nextId = useRef(1)
  const wrongs = useRef(0)
  const taught = useRef(false)
  const chopSaid = useRef(false)
  const nudge = useRef<ReturnType<typeof setTimeout>>(undefined)
  const roundRef = useRef(0)
  roundRef.current = round

  const rot = useMotionValue(0)
  const counter = useTransform(rot, (r) => -r)
  const lastQuarter = useRef(0)

  const setPhase = (p: Phase) => {
    phaseRef.current = p
    setPhaseState(p)
  }

  // ---- layout -------------------------------------------------------------------------------------------------
  const col = landscape && W > 0 // tray as a column at the right in landscape
  const trayW = col ? clamp(Ht * 0.2, 96, 128) : 0
  const trayH = col ? 0 : clamp(Ht * 0.17, 96, 132)
  const availW = W - trayW
  const D = Math.max(80, Math.min((Ht - trayH - 6) / 1.2, availW * (col ? 0.78 : 0.66), 660))
  const cx = availW / 2
  const tableTop = D * 0.2 + Math.max(0, (Ht - trayH - D * 1.2) / 2)
  const cy = tableTop + D / 2
  const fW = Math.min(D * 0.44, (availW - D) / 2 + D * 0.07)
  const fH = fW * 1.2
  const foodPx = clamp(D * 0.13, 40, 70)
  const potW = D * 0.68
  const trayItem = col ? clamp(Math.min(Ht / 5.2, trayW - 8), 72, 108) : clamp(Math.min(trayH - 8, availW / 4.6), 72, 116)

  // ---- helpers ------------------------------------------------------------------------------------------------
  const clearNudge = () => clearTimeout(nudge.current)
  const armNudge = (line: Line, glowWhat: typeof glow) => {
    clearNudge()
    nudge.current = setTimeout(() => {
      if (!alive()) return
      setGlow(glowWhat)
      void say(line)
      armNudge(line, glowWhat)
    }, 9000)
  }
  const shake = (who: 'bao' | 'hong' | 'nai') => {
    const p = who === 'bao' ? bao : who === 'hong' ? hong : nai
    void p.current?.play(who === 'nai' ? 'wiggle' : 'shake')
  }
  const friendRef = (i: number) => [bao, hong, nai][i]
  const bump = (what: string) => setWiggle((w) => ({ what, n: (w?.n ?? 0) + 1 }))

  const startRound = (r: number) => {
    setRound(r)
    roundRef.current = r
    placedRef.current = 0
    wrongs.current = 0
    chopSaid.current = false
    itemsRef.current = []
    setItems([])
    bowlRef.current = []
    setBowl([])
    setArmed(null)
    setChop(false)
    setGlow(null)
    setPrompt(H.ask[r])
    setPhase('drop')
    armNudge(r === 0 ? H.dropTipNoodles : ROUNDS[r].hint, null)
  }

  useEffect(() => () => clearNudge(), [])

  // ---- 1. food into the pot -------------------------------------------------------------------------------------
  const wrongFood = (kind: FoodKind) => {
    void kind
    wrongs.current++
    sounds.oops()
    bump('tray')
    shake(['bao', 'hong', 'nai'][ROUNDS[roundRef.current].friend] as 'bao' | 'hong' | 'nai')
    setGlow('food')
    void say(H.ask[roundRef.current])
  }

  const dropFood = (kind: FoodKind, side: 'spicy' | 'mild') => {
    if (phaseRef.current !== 'drop' && phaseRef.current !== 'scoop') return
    const R = ROUNDS[roundRef.current]
    if (kind !== R.kind) return wrongFood(kind)
    if (placedRef.current >= R.count) {
      bump('tray')
      return
    }
    if (R.side && side !== R.side) {
      sounds.oops()
      setGlow('mild')
      bump('pot')
      shake('hong')
      void say(H.mild)
      return
    }
    clearNudge()
    placedRef.current++
    const slot = itemsRef.current.filter((i) => i.side === side).length % SLOTS[side].length
    const item: Item = { id: nextId.current++, kind, side, slot, ready: false }
    itemsRef.current = [...itemsRef.current, item]
    setItems(itemsRef.current)
    setArmed(null)
    setGlow(null)
    sounds.pop()
    setBig(true)
    if (roundRef.current === 1) {
      void hong.current?.play('standUp')
      void say(H.bigBubbles)
    }
    setTimeout(() => alive() && setBig(false), roundRef.current === 1 ? 2600 : 900)
    if (placedRef.current >= R.count) setPhase('scoop')
    setTimeout(() => {
      if (!alive()) return
      itemsRef.current = itemsRef.current.map((i) => (i.id === item.id ? { ...i, ready: true } : i))
      setItems(itemsRef.current)
      sounds.sparkle()
      if (phaseRef.current === 'scoop' && itemsRef.current.every((i) => i.ready)) {
        setPrompt(H.chopTip)
        armNudge(H.chopTip, 'chop')
        setGlow('chop')
      }
    }, COOK_MS)
    if (placedRef.current >= R.count) {
      // Everything is in; talk about it after a moment while it cooks.
      setPrompt(H.wait)
    }
  }

  // ---- 2. scoop with chopsticks ---------------------------------------------------------------------------------
  const scoop = (id: number) => {
    const it = itemsRef.current.find((i) => i.id === id)
    if (!it) return
    if (!it.ready) {
      sounds.oops()
      bump(`item${id}`)
      void say(H.wait)
      return
    }
    if (!chop) {
      // Nudge her toward the chopsticks instead of scooping with paws.
      setGlow('chop')
      bump('chop')
      sounds.oops()
      if (!chopSaid.current) {
        chopSaid.current = true
        void say(H.chopTip)
      }
      return
    }
    doScoop(it)
  }
  const doScoop = (it: Item) => {
    itemsRef.current = itemsRef.current.filter((i) => i.id !== it.id)
    setItems(itemsRef.current)
    bowlRef.current = [...bowlRef.current, it.kind]
    setBowl(bowlRef.current)
    sounds.note(bowlRef.current.length * 2)
    void say(H.count[bowlRef.current.length - 1] ?? '', { interrupt: true })
    const R = ROUNDS[roundRef.current]
    if (bowlRef.current.length >= R.count) {
      setChop(false)
      setGlow('spin')
      setPhase('spin')
      setPrompt(H.spin[R.friend])
      armNudge(H.spin[R.friend], 'spin')
      if (roundRef.current === 0) void wait(1800).then(() => alive() && phaseRef.current === 'spin' && void say(H.chopFact, { interrupt: false }))
    } else {
      setGlow('chop')
    }
  }

  // ---- 3. spin the lazy Susan -----------------------------------------------------------------------------------
  const settle = (r: number) => {
    const q = Math.round(r / 90)
    void animate(rot, q * 90, { type: 'spring', stiffness: 240, damping: 20 })
    sounds.snap()
    const k = ((q % 4) + 4) % 4
    if (phaseRef.current !== 'spin' || bowlRef.current.length === 0 || k === 0) return
    const R = ROUNDS[roundRef.current]
    const target = QUARTERS[R.friend]
    if (k === target) {
      void serve()
    } else {
      // Someone else's seat: they politely say it isn't theirs.
      const who = k === 1 ? 'bao' : k === 3 ? 'hong' : 'nai'
      shake(who)
      sounds.oops()
      void say(H.spin[R.friend])
    }
  }

  const serve = async () => {
    const r = roundRef.current
    const R = ROUNDS[r]
    clearNudge()
    setPhase('serve')
    setGlow(null)
    await wait(350)
    if (!alive()) return
    const who = R.friend
    void friendRef(who).current?.play(who === 0 ? 'munch' : who === 1 ? 'nod' : 'cheer')
    sounds.correct()
    burst()
    await say(H.thanks[who])
    if (!alive()) return
    setWord('xiexie')
    setEaten((e) => [...e, who])
    setProgress(r + 1, 3)
    setBowl([])
    bowlRef.current = []
    if (!taught.current) {
      taught.current = true
      await say(H.teach)
      if (!alive()) return
    }
    if (r === 0) await say(H.factPot)
    if (r === 1) await say(H.factRound)
    if (!alive()) return
    setWord(null)
    void animate(rot, Math.round(rot.get() / 360) * 360, { type: 'spring', stiffness: 120, damping: 18 })
    lastQuarter.current = 0
    await wait(500)
    if (!alive()) return
    if (r < 2) startRound(r + 1)
    else void finale()
  }

  const finale = async () => {
    setPhase('finale')
    setPrompt(H.finale)
    await wait(2200)
    if (!alive()) return
    setClink(true)
    sounds.fanfare()
    burst()
    void hong.current?.play('standUp')
    void bao.current?.play('cheer')
    void nai.current?.play('cheer')
    setBig(true)
    await say(H.yum[0])
    await say(H.yum[1])
    await say(H.yum[2], { interrupt: false })
    if (!alive()) return
    await say(H.factPepper)
    await wait(600)
    if (alive()) onDone()
  }

  // ---- rotational drag ------------------------------------------------------------------------------------------
  const spin = useRef<{ last: number; moved: number; on: boolean }>({ last: 0, moved: 0, on: false })
  const angleAt = (e: RPointerEvent) => {
    const r = ringBox.current!.getBoundingClientRect()
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI
  }
  const onRingDown = (e: RPointerEvent) => {
    if (phaseRef.current === 'story') return
    e.currentTarget.setPointerCapture(e.pointerId)
    rot.stop()
    spin.current = { last: angleAt(e), moved: 0, on: true }
    lastQuarter.current = Math.round(rot.get() / 90)
    clearNudge()
    setGlow(null)
  }
  const onRingMove = (e: RPointerEvent) => {
    if (!spin.current.on) return
    const a = angleAt(e)
    let d = a - spin.current.last
    if (d > 180) d -= 360
    if (d < -180) d += 360
    spin.current.last = a
    spin.current.moved += Math.abs(d)
    rot.set(rot.get() + d)
    const q = Math.round(rot.get() / 90)
    if (q !== lastQuarter.current) {
      lastQuarter.current = q
      sounds.pickup()
    }
  }
  const onRingUp = () => {
    if (!spin.current.on) return
    spin.current.on = false
    // A tap (barely moved) gives it a quarter turn, an easy way to spin for small fingers.
    const r = spin.current.moved < 6 ? Math.round(rot.get() / 90) * 90 + 90 : rot.get()
    settle(r)
    if (phaseRef.current === 'spin') armNudge(H.spin[ROUNDS[roundRef.current].friend], 'spin')
  }

  // ---- tray dragging (food and chopsticks: tap it, or drag it) --------------------------------------------------
  const startDrag = (e: RPointerEvent, kind: 'food' | 'chop', food?: FoodKind) => {
    if (phaseRef.current === 'story' || phaseRef.current === 'serve' || phaseRef.current === 'finale' || phaseRef.current === 'spin') return
    e.preventDefault()
    const sx = e.clientX
    const sy = e.clientY
    let dragged = false
    const local = (x: number, y: number) => {
      const r = box.current!.getBoundingClientRect()
      return { x: x - r.left, y: y - r.top }
    }
    const move = (ev: PointerEvent) => {
      if (!dragged && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 12) {
        dragged = true
        sounds.pickup()
      }
      if (dragged) setDrag({ kind, food, ...local(ev.clientX, ev.clientY) })
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      setDrag(null)
      if (!dragged) {
        if (kind === 'food' && food) tapFood(food)
        else tapChop()
        return
      }
      const p = local(ev.clientX, ev.clientY)
      const pr = potBox.current!.getBoundingClientRect()
      const pl = { x: (ev.clientX - pr.left) / pr.width, y: (ev.clientY - pr.top) / pr.height }
      if (kind === 'food' && food) {
        if (pl.x > 0.05 && pl.x < 0.95 && pl.y > 0.1 && pl.y < 0.8) dropFood(food, pl.x < 0.5 ? 'spicy' : 'mild')
        else setArmed(food)
      } else if (kind === 'chop') {
        // Released over a cooked food: scoop it.
        const hit = itemsRef.current.find((it) => {
          const [fx, fy] = SLOTS[it.side][it.slot]
          const px = potBoxLeft() + fx * potW
          const py = potBoxTop() + fy * potW
          return Math.hypot(p.x - px, p.y - py) < foodPx * 0.9
        })
        setChop(true)
        if (hit) {
          if (hit.ready) doScoop(hit)
          else scoopWait(hit.id)
        }
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }
  const potBoxLeft = () => cx - potW / 2
  const potBoxTop = () => cy - potW / 2
  const scoopWait = (id: number) => {
    sounds.oops()
    bump(`item${id}`)
    void say(H.wait)
  }
  const tapFood = (food: FoodKind) => {
    sounds.pickup()
    const R = ROUNDS[roundRef.current]
    if (food !== R.kind) return wrongFood(food)
    setArmed(food)
    setGlow(R.side ? 'mild' : 'food')
  }
  const tapChop = () => {
    sounds.pickup()
    setChop((c) => !c)
    setGlow(null)
  }
  const tapPot = (e: RPointerEvent) => {
    const pr = potBox.current!.getBoundingClientRect()
    const x = (e.clientX - pr.left) / pr.width
    if (armed) dropFood(armed, x < 0.5 ? 'spicy' : 'mild')
  }

  const bg = landscape ? art.bgHotpot : art.bgHotpotTall
  const ready = W > 0 && Ht > 0
  const kindOf = (id: string) => (wiggle?.what === id ? { x: [0, -8, 8, -6, 6, 0], rotate: [0, -6, 6, -4, 4, 0] } : undefined)

  // Friends sit behind the table, poking out at the sides and top.
  const seat = {
    bao: { left: cx - D / 2 + D * 0.07 - fW, top: cy - fH * 0.6, w: fW, h: fH },
    hong: { left: cx + D / 2 - D * 0.07, top: cy - fH * 0.6, w: fW, h: fH },
    nai: { left: cx - D * 0.21, top: tableTop - D * 0.28, w: D * 0.42, h: D * 0.42 },
  }
  const glowStyle = (on: boolean) => (on ? { boxShadow: '0 0 0 6px #FFE066, 0 0 26px 10px rgba(255,214,90,0.9)' } : {})

  return (
    <Stage bg={bg} prompt={story ? undefined : prompt}>
      <div ref={box} style={{ position: 'absolute', inset: 0, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}>
        {ready && (
          <>
            {/* Friends behind the table */}
            <div style={{ position: 'absolute', left: seat.bao.left, top: seat.bao.top, width: seat.bao.w, height: seat.bao.h, zIndex: 1 }}>
              <BaoBao ref={bao} height={`${seat.bao.h}px`} onTap={() => void say(H.tap[0])} />
            </div>
            <div style={{ position: 'absolute', left: seat.hong.left, top: seat.hong.top - fH * 0.05, width: seat.hong.w, height: seat.hong.h, zIndex: 1 }}>
              <Hong ref={hong} height={`${seat.hong.h}px`} onTap={() => void say(H.tap[1])} />
            </div>
            <div style={{ position: 'absolute', left: seat.nai.left, top: seat.nai.top, width: seat.nai.w, height: seat.nai.h, zIndex: 1 }} onClick={() => void say(H.tap[2])}>
              <Buddy ref={nai} img={art.nainai} voice="nainai" height={`${seat.nai.h}px`} />
            </div>

            {/* The round table, top view */}
            <svg viewBox="0 0 1000 1000" style={{ position: 'absolute', left: cx - D / 2, top: tableTop, width: D, height: D, zIndex: 2, pointerEvents: 'none', filter: 'drop-shadow(0 10px 8px rgba(80,40,20,0.35))' }}>
              <circle cx="500" cy="500" r="496" fill="#B9733F" stroke={INK} strokeWidth="10" />
              <circle cx="500" cy="500" r="470" fill="#D89A5B" stroke="#A55F2F" strokeWidth="6" />
              <circle cx="500" cy="500" r="330" fill="#C98649" />
              {/* seats: plates and chopsticks at each place */}
              {[
                [500, 900, 0],
                [100, 500, 90],
                [500, 100, 180],
                [900, 500, 270],
              ].map(([x, y, a], i) => (
                <g key={i} transform={`translate(${x} ${y}) rotate(${a})`} opacity="0.9">
                  <circle r="46" fill="#FFF7F0" stroke={INK} strokeWidth="6" />
                  <circle r="30" fill="none" stroke="#E8504F" strokeWidth="5" />
                </g>
              ))}
            </svg>

            {/* Bowls in front of the friends who have eaten */}
            {eaten.map((who) => {
              const x = who === 0 ? cx - D * 0.455 : who === 1 ? cx + D * 0.455 : cx
              const y = who === 2 ? cy - D * 0.455 : cy
              return (
                <motion.div key={who} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', left: x, top: y, translateX: '-50%', translateY: '-50%', zIndex: 5, fontSize: D * 0.085, pointerEvents: 'none', lineHeight: 1 }}>
                  🥣
                </motion.div>
              )
            })}

            {/* The lazy Susan: drag around the middle to spin it */}
            <div ref={ringBox} style={{ position: 'absolute', left: cx - D / 2, top: tableTop, width: D, height: D, zIndex: 3, pointerEvents: 'none' }}>
              <motion.div
                role="button"
                aria-label="Lazy Susan"
                onPointerDown={onRingDown}
                onPointerMove={onRingMove}
                onPointerUp={onRingUp}
                onPointerCancel={onRingUp}
                style={{ position: 'absolute', inset: '9%', borderRadius: '50%', rotate: rot, touchAction: 'none', cursor: 'grab', pointerEvents: 'auto', ...glowStyle(glow === 'spin') }}
                animate={glow === 'spin' ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                transition={glow === 'spin' ? { repeat: Infinity, duration: 1.1 } : undefined}
              >
                <svg viewBox="0 0 820 820" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <circle cx="410" cy="410" r="404" fill="#F6DDB0" stroke={INK} strokeWidth="9" />
                  <circle cx="410" cy="410" r="250" fill="#EBC98F" stroke="#C9964F" strokeWidth="6" />
                  <circle cx="410" cy="410" r="374" fill="none" stroke="#F5C65B" strokeWidth="7" strokeDasharray="6 22" strokeLinecap="round" />
                  {[45, 135, 225, 315].map((a) => (
                    <line key={a} x1="410" y1="410" x2={410 + 404 * Math.cos((a * Math.PI) / 180)} y2={410 + 404 * Math.sin((a * Math.PI) / 180)} stroke="#D9A85E" strokeWidth="6" />
                  ))}
                  <circle cx="410" cy="410" r="255" fill="#C98649" stroke={INK} strokeWidth="6" />
                  {/* dip saucers at three seats, the serving bowl at the bottom */}
                  {[
                    [110, 410, '#B92F2A'],
                    [410, 110, '#7A3B22'],
                    [710, 410, '#F0E0B8'],
                  ].map(([x, y, c], i) => (
                    <g key={i} transform={`translate(${x} ${y})`}>
                      <circle r="46" fill="#FFF7F0" stroke={INK} strokeWidth="6" />
                      <circle r="30" fill={c as string} />
                    </g>
                  ))}
                  <g transform="translate(410 710)">
                    <circle r="84" fill="#FFF7F0" stroke={INK} strokeWidth="7" />
                    <circle r="72" fill="none" stroke="#E8504F" strokeWidth="9" />
                    <circle r="58" fill="#FDEBD0" stroke="#E7C9A0" strokeWidth="4" />
                  </g>
                </svg>
                {bowl.map((k, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    style={{ position: 'absolute', left: `${50 + (bowl.length > 1 ? (i - 0.5) * 9 : 0)}%`, top: '86.5%', translateX: '-50%', translateY: '-50%', rotate: counter, pointerEvents: 'none' }}
                  >
                    <FoodIcon kind={k} size={foodPx * (bowl.length > 1 ? 0.82 : 1.05)} />
                  </motion.div>
                ))}
              </motion.div>
              {glow === 'spin' && (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3.2, ease: 'linear' }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <div style={{ position: 'absolute', left: '50%', top: '0.5%', transform: 'translateX(-50%)', fontSize: D * 0.08, color: '#FF5FA2', textShadow: '0 2px 0 #fff' }}>➤</div>
                </motion.div>
              )}
            </div>

            {/* The split pot in the middle (does not spin) */}
            <motion.div
              ref={potBox}
              animate={wiggle?.what === 'pot' ? { x: [0, -8, 8, -6, 6, 0] } : big ? { scale: [1, 1.04, 1] } : {}}
              transition={{ duration: big ? 0.5 : 0.45, repeat: big ? 3 : 0 }}
              style={{ position: 'absolute', left: potBoxLeft(), top: potBoxTop(), width: potW, height: potW, zIndex: 4, pointerEvents: 'none' }}
            >
              <img src={art.hotpotPot} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
              <div onPointerDown={tapPot} style={{ position: 'absolute', left: '8%', top: '16%', width: '84%', height: '54%', borderRadius: '50%', pointerEvents: 'auto', touchAction: 'none' }} />
              {armed && (
                <>
                  <SideGlow side="spicy" dim={ROUNDS[round].side === 'mild'} />
                  <SideGlow side="mild" />
                </>
              )}
              {!armed && glow === 'mild' && <SideGlow side="mild" />}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <Bubbles big={big} />
              </div>
              {items.map((it) => {
                const [fx, fy] = SLOTS[it.side][it.slot]
                const hit = Math.max(88, foodPx)
                return (
                  <motion.button
                    key={it.id}
                    aria-label={`${it.kind} in the soup`}
                    initial={{ y: -80, scale: 0.6, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1, ...(kindOf(`item${it.id}`) ?? {}) }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      scoop(it.id)
                    }}
                    style={{ position: 'absolute', left: `${fx * 100}%`, top: `${fy * 100}%`, width: hit, height: hit, marginLeft: -hit / 2, marginTop: -hit / 2, padding: 0, border: 0, background: 'transparent', touchAction: 'none', display: 'grid', placeItems: 'center', pointerEvents: 'auto' }}
                  >
                    <motion.div animate={{ y: [0, -5, 0], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: it.ready ? 1.2 : 0.7, ease: 'easeInOut' }} style={{ position: 'relative', width: foodPx, height: foodPx }}>
                      <div style={{ position: 'absolute', inset: 0, filter: it.ready ? 'drop-shadow(0 0 10px #FFE066)' : undefined }}>
                        <FoodIcon kind={it.kind} size={foodPx} cooked={it.ready} />
                      </div>
                      {!it.ready && (
                        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: -8, width: foodPx + 16, height: foodPx + 16, transform: 'rotate(-90deg)', pointerEvents: 'none' }}>
                          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="7" />
                          <motion.circle cx="50" cy="50" r="46" fill="none" stroke="#FFC93C" strokeWidth="7" strokeLinecap="round" pathLength={1} strokeDasharray="1" initial={{ strokeDashoffset: 1 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: COOK_MS / 1000, ease: 'linear' }} />
                        </svg>
                      )}
                      {it.ready && <Twinkles />}
                    </motion.div>
                  </motion.button>
                )
              })}
            </motion.div>

            {/* Tray: three foods and the chopsticks */}
            <div
              style={{
                position: 'absolute',
                zIndex: 6,
                display: 'flex',
                flexDirection: col ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                ...(col ? { right: 6, top: 0, bottom: 0, width: trayW } : { left: 0, right: 0, bottom: 0, height: trayH }),
              }}
            >
              {ROUNDS[round].tray.map((k) => {
                const right = k === ROUNDS[round].kind
                const done = right && placedRef.current >= ROUNDS[round].count && phase !== 'drop'
                return (
                  <motion.button
                    key={k + round}
                    aria-label={k}
                    onPointerDown={(e) => startDrag(e, 'food', k)}
                    animate={{
                      ...(wiggle?.what === 'tray' ? { x: [0, -8, 8, -6, 6, 0] } : {}),
                      scale: armed === k ? 1.12 : glow === 'food' && right ? [1, 1.1, 1] : 1,
                      opacity: done ? 0.45 : 1,
                    }}
                    transition={glow === 'food' && right ? { repeat: Infinity, duration: 0.9 } : { duration: 0.4 }}
                    style={{ width: trayItem, height: trayItem, borderRadius: 24, border: `4px solid ${INK}`, background: '#FFF7F0', padding: 4, display: 'grid', placeItems: 'center', touchAction: 'none', boxShadow: armed === k ? '0 0 0 5px #FFE066, 0 0 18px 6px rgba(255,214,90,0.9)' : 'var(--shadow)', flexShrink: 0 }}
                  >
                    <FoodIcon kind={k} size={trayItem - 16} />
                  </motion.button>
                )
              })}
              <motion.button
                aria-label="chopsticks"
                onPointerDown={(e) => startDrag(e, 'chop')}
                animate={{
                  ...(wiggle?.what === 'chop' ? { x: [0, -8, 8, -6, 6, 0] } : {}),
                  scale: chop ? 1.12 : glow === 'chop' ? [1, 1.12, 1] : 1,
                }}
                transition={glow === 'chop' && !chop ? { repeat: Infinity, duration: 0.9 } : { duration: 0.4 }}
                style={{ width: trayItem, height: trayItem, borderRadius: 24, border: `4px solid ${INK}`, background: '#FFE7EC', padding: 4, display: 'grid', placeItems: 'center', touchAction: 'none', boxShadow: chop ? '0 0 0 5px #FFE066, 0 0 18px 6px rgba(255,214,90,0.9)' : 'var(--shadow)', flexShrink: 0 }}
              >
                <Chopsticks size={trayItem - 12} />
              </motion.button>
            </div>

            {/* What she is dragging */}
            {drag && (
              <div style={{ position: 'absolute', left: drag.x - trayItem / 2, top: drag.y - trayItem / 2, width: trayItem, height: trayItem, zIndex: 20, pointerEvents: 'none', transform: 'scale(1.15) rotate(-6deg)', filter: 'drop-shadow(0 8px 6px rgba(0,0,0,0.3))' }}>
                {drag.kind === 'food' && drag.food ? <FoodIcon kind={drag.food} size={trayItem} /> : <Chopsticks size={trayItem} />}
              </div>
            )}

            {/* Payoff: everybody clinks their bowls */}
            {clink && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.3, 1], opacity: 1 }} style={{ position: 'absolute', left: cx, top: cy, translateX: '-50%', translateY: '-50%', zIndex: 15, fontSize: D * 0.22, pointerEvents: 'none', textShadow: '0 4px 0 rgba(255,255,255,0.8)' }}>
                🥣✨🥣
              </motion.div>
            )}
          </>
        )}
      </div>
      <WordCard word={word} />
      {story && (
        <StoryBeat
          lines={H.story}
          img={art.nainai}
          bg={bg}
          onDone={() => {
            setStory(false)
            startRound(0)
          }}
        />
      )}
    </Stage>
  )
}

/** A soft glow over one soup side. */
function SideGlow({ side, dim }: { side: 'spicy' | 'mild'; dim?: boolean }) {
  return (
    <motion.div
      animate={{ opacity: dim ? 0.05 : [0.25, 0.7, 0.25] }}
      transition={{ repeat: Infinity, duration: 1 }}
      style={{ position: 'absolute', left: side === 'spicy' ? '15%' : '52%', top: '20%', width: '33%', height: '46%', borderRadius: '45%', background: 'rgba(255,240,140,0.85)', pointerEvents: 'none', filter: 'blur(4px)' }}
    />
  )
}

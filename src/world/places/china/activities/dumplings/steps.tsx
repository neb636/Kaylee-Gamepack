// The dumpling-making steps. Each is one finger move she can't get wrong, with a tap alternative for every drag:
// knead (push), snake (swipe), chop (tap), roll (back and forth), fill (tap, too many taps blorp out), pleat (circle).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { burst, say, sounds, usePointerDrag, useAlive, wait, type PuppetHandle } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { L } from '../../lines'
import { Cleaver, DoughSnake, FillingBowl, RollingPin } from '../../props'
import { Dumpling, type DoughColor } from '../../puppets/Dumpling'
import { circleTracker, play } from './shared'

const D = L.dumplings
export interface StepProps {
  chef: RefObject<PuppetHandle | null>
  onDone: () => void
  color?: DoughColor
}

/** Big working size for the one dumpling she's making. */
export const BIG = 'min(62cqh, 56cqw, 440px)'
/** A row of dumplings on the counter. */
export const SMALL = 'min(30cqh, 22cqw, 180px)'

/** Push the dough three times; Chef Fu counts "Ee! Arr! San!" and it turns smooth and shiny. */
export function Knead({ chef, onDone, onWord }: StepProps & { onWord: () => void }) {
  const dough = useRef<PuppetHandle>(null)
  const [n, setN] = useState(0)
  const alive = useAlive()
  const push = () => {
    if (n >= 3) return
    const next = n + 1
    setN(next)
    void dough.current?.play('squish')
    sfx.thump()
    void play(chef, 'knead')
    if (next === 1) onWord()
    if (next < 3) void say(D.kneadCount[next - 1])
    else
      void (async () => {
        await say(D.kneadCount[2])
        sounds.sparkle()
        burst(0.5, 0.6)
        await say(D.kneadDone)
        if (alive()) onDone()
      })()
  }
  return (
    <motion.div whileTap={{ scale: 0.97 }} onPointerDown={push} role="button" aria-label="dough" style={{ cursor: 'pointer', touchAction: 'none' }}>
      <Dumpling ref={dough} state="dough" smooth={n >= 3 ? 1 : 0} face={n >= 3 ? 'happy' : 'content'} size={BIG} />
      <Taps n={n} of={3} />
    </motion.div>
  )
}

/** Little dots that fill as she goes (she can't count words, she can see dots). */
function Taps({ n, of }: { n: number; of: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 6 }}>
      {Array.from({ length: of }, (_, i) => (
        <motion.div key={i} animate={{ scale: i < n ? [1.4, 1] : 1 }} style={{ width: 22, height: 22, borderRadius: '50%', border: '4px solid #6E3B24', background: i < n ? '#FFC83D' : '#FFF7F0' }} />
      ))}
    </div>
  )
}

/** Swipe the dough ball sideways to stretch it into a long snake (or tap three times). */
export function Snake({ onDone, color = 'cream' }: StepProps) {
  const el = useRef<HTMLDivElement>(null)
  const [stretch, setStretch] = useState(0)
  const [snake, setSnake] = useState(false)
  const apply = (s: number) => {
    if (el.current) el.current.style.transform = `scale(${1 + s * 1.6}, ${1 - s * 0.45})`
  }
  const finish = () => {
    setSnake(true)
    sfx.fwip()
    sounds.correct()
    setTimeout(onDone, 700)
  }
  usePointerDrag(el, {
    onMove: ({ dx }) => apply(Math.min(1, stretch + Math.abs(dx) / (window.innerWidth * 0.35))),
    onEnd: ({ dx }) => {
      const s = Math.min(1, stretch + Math.abs(dx) / (window.innerWidth * 0.35))
      if (s > 0.55) return finish()
      setStretch(s)
      apply(s)
      sfx.fwip()
    },
    onTap: () => {
      const s = stretch + 0.34
      if (s >= 1) return finish()
      setStretch(s)
      apply(s)
      sfx.fwip()
    },
    disabled: snake,
  })
  return (
    <div style={{ width: 'min(96cqw, 720px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: BIG }}>
      {snake ? (
        <motion.div initial={{ scaleX: 0.5 }} animate={{ scaleX: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ width: '100%' }}>
          <DoughSnake color={color} />
        </motion.div>
      ) : (
        <div ref={el} role="button" aria-label="dough" style={{ transformOrigin: '50% 100%', transition: 'transform .12s' }}>
          <Dumpling state="dough" face="content" color={color} size={`calc(${BIG} * 0.8)`} />
          <motion.div animate={{ x: [-50, 50, -50] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ textAlign: 'center', fontSize: 44, marginTop: -20 }}>
            👆
          </motion.div>
        </div>
      )}
    </div>
  )
}

/** Tap the snake to chop it into four pieces (three cuts), counting the pieces. */
export function Chop({ onDone, color = 'cream' }: StepProps) {
  const [cuts, setCuts] = useState(0)
  const [pieces, setPieces] = useState(false)
  const [swing, setSwing] = useState(0)
  const alive = useAlive()
  const chop = () => {
    if (cuts >= 3) return
    const next = cuts + 1
    setSwing((s) => s + 1)
    setCuts(next)
    sfx.thump()
    sfx.crack()
    if (next === 3)
      void (async () => {
        await wait(450)
        if (!alive()) return
        setPieces(true)
        for (let i = 0; i < 4; i++) {
          sounds.note(i * 2)
          await say(D.count[i])
          await wait(120)
        }
        if (alive()) onDone()
      })()
  }
  const x = (i: number) => `${((i + 1) / 4) * 100}%`
  return (
    <div style={{ width: 'min(96cqw, 720px)', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: BIG }}>
      {pieces ? (
        <div style={{ display: 'flex', gap: '4%', justifyContent: 'center', width: '100%' }}>
          {[0, 1, 2, 3].map((i) => (
            <motion.div key={i} initial={{ scale: 0.6, x: (1.5 - i) * 40 }} animate={{ scale: 1, x: 0 }} transition={{ type: 'spring', bounce: 0.6, delay: i * 0.08 }}>
              <Dumpling state="dough" face="smile" color={color} size={SMALL} />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.button aria-label="dough snake" onClick={chop} whileTap={{ scale: 0.98 }} style={{ width: '100%', background: 'none', border: 'none', padding: '60px 0 0', position: 'relative' }}>
          <DoughSnake color={color} cuts={cuts} />
          <AnimatePresence>
            {cuts < 3 && (
              <motion.div key={swing} initial={{ y: -60, rotate: -20 }} animate={{ y: [-60, 10, -40], rotate: [-20, 0, -12] }} transition={{ duration: 0.35 }} style={{ position: 'absolute', left: x(cuts), top: 0, width: 'min(18cqw, 110px)', translate: '-30% -40%', pointerEvents: 'none' }}>
                <Cleaver />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}
    </div>
  )
}

/** Drag the horizontal rolling pin up and down over the ball: every pass flattens it, four passes make a round wrapper. */
export function Roll({ chef, onDone, color = 'cream' }: StepProps) {
  const pin = useRef<HTMLDivElement>(null)
  const [passes, setPasses] = useState(0)
  const count = useRef(0)
  const track = useRef({ dir: 0, from: 0 })
  const alive = useAlive()
  const pass = () => {
    if (count.current >= 4) return
    const next = ++count.current
    setPasses(next)
    sfx.fwip()
    sounds.note(next * 2)
    void play(chef, 'nod')
    if (next === 4)
      void (async () => {
        sounds.correct()
        await say(D.rolled)
        if (alive()) onDone()
      })()
  }
  usePointerDrag(pin, {
    onStart: () => (track.current = { dir: 0, from: 0 }),
    onMove: ({ dy }) => {
      const h = pin.current?.parentElement?.clientHeight ?? 400
      const y = Math.max(-h * 0.25, Math.min(h * 0.25, dy))
      if (pin.current) pin.current.style.transform = `translateY(${y}px)`
      const t = track.current
      const dir = Math.sign(y - t.from)
      if (Math.abs(y - t.from) > h * 0.12) {
        if (dir !== t.dir && t.dir !== 0) pass()
        t.dir = dir
        t.from = y
      }
    },
    onEnd: () => {
      if (pin.current) pin.current.style.transform = ''
      if (track.current.dir !== 0) pass()
    },
    onTap: () => {
      const travel = (pin.current?.parentElement?.clientHeight ?? 400) * 0.2
      pin.current?.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-travel}px)` }, { transform: `translateY(${travel}px)` }, { transform: 'translateY(0)' }], { duration: 600 })
      pass()
    },
    disabled: passes >= 4,
  })
  const flat = passes / 4
  return (
    <div style={{ width: 'min(96cqw, 720px)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: BIG }}>
      <div style={{ transform: passes >= 4 ? undefined : `scale(${1 + flat * 0.5}, ${1 - flat * 0.5})`, transformOrigin: '50% 100%', transition: 'transform .25s' }}>
        <Dumpling state={passes >= 4 ? 'wrapper' : 'dough'} face={passes >= 4 ? 'smile' : 'content'} color={color} size={passes >= 4 ? `calc(${BIG} * 1.1)` : `calc(${BIG} * 0.7)`} />
      </div>
      {passes < 4 && (
        <div ref={pin} role="button" aria-label="rolling pin" style={{ position: 'absolute', bottom: '20%', width: 'min(80cqw, 520px)', cursor: 'grab', padding: '20px 0' }}>
          <RollingPin />
          <motion.div animate={{ y: [-40, 40, -40] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ position: 'absolute', left: '50%', top: '70%', fontSize: 40, pointerEvents: 'none' }}>
            👆
          </motion.div>
        </div>
      )}
    </div>
  )
}

/** Tap the bowl for one spoonful. Extra taps blorp out the side (Chef Fu laughs and scoops it back); nothing fails. */
export function Fill({ chef, onDone, color = 'cream' }: StepProps) {
  const [filled, setFilled] = useState(false)
  const [blorp, setBlorp] = useState(false)
  const done = useRef(false)
  const alive = useAlive()
  const blorped = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const next = (ms: number) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (!done.current && alive()) {
        done.current = true
        onDone()
      }
    }, ms)
  }
  const tap = () => {
    if (!filled) {
      setFilled(true)
      sounds.place()
      next(1500)
      return
    }
    if (blorped.current) return
    blorped.current = true
    setBlorp(true)
    sfx.splash()
    void play(chef, 'laugh')
    void say(D.blorp)
    clearTimeout(timer.current)
    setTimeout(() => alive() && setBlorp(false), 1700)
    next(2600)
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'min(6vw, 50px)' }}>
      <div style={{ position: 'relative' }}>
        <Dumpling state={filled ? 'filled' : 'wrapper'} face={blorp ? 'surprised' : 'smile'} color={color} size={`calc(${BIG} * 1.1)`} />
        <AnimatePresence>
          {blorp && (
            <motion.div initial={{ x: 0, y: 0, scale: 0.3 }} animate={{ x: 90, y: 20, scale: 1 }} exit={{ x: 0, y: 0, scale: 0.2, opacity: 0 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', left: '50%', top: '55%', width: '30%' }}>
              <svg viewBox="0 0 100 60" style={{ width: '100%', overflow: 'visible' }}>
                <path d="M8 40 C0 20 30 4 50 12 C70 0 100 16 92 36 C96 56 20 60 8 40Z" fill="#E29A78" stroke="#6E3B24" strokeWidth={5} />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.button aria-label="filling bowl" onClick={tap} whileTap={{ scale: 0.9 }} className={filled ? undefined : 'world-glow'} animate={filled ? {} : { y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 'min(28cqw, 34cqh, 190px)', background: 'none', border: 'none', padding: 0, borderRadius: 30 }}>
        <FillingBowl />
      </motion.button>
    </div>
  )
}

/** Draw circles around the dumpling to fold its pleats (each tap folds one too). `laps` = circles needed. */
export function Pleat({ onDone, color = 'cream', laps = 1, size = BIG, auto }: StepProps & { laps?: number; size?: string; auto?: boolean }) {
  const area = useRef<HTMLDivElement>(null)
  const dumpling = useRef<PuppetHandle>(null)
  const [folds, setFolds] = useState(0)
  const count = useRef(0)
  const base = useRef(0)
  const tracker = useRef(circleTracker())
  const need = 5
  const per = (Math.PI * 2 * laps) / need
  const finished = folds >= need
  const fold = (to: number) => {
    const next = Math.min(need, to)
    if (next <= count.current) return
    count.current = next
    setFolds(next)
    sounds.note(next + 2)
    void dumpling.current?.play('pop')
    if (next === need) {
      sounds.sparkle()
      setTimeout(onDone, 500)
    }
  }
  const center = () => {
    const r = area.current!.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }
  usePointerDrag(area, {
    threshold: 4,
    onStart: ({ x, y }) => {
      tracker.current = circleTracker()
      base.current = count.current
      const c = center()
      tracker.current.add(x - c.x, y - c.y)
    },
    onMove: ({ x, y }) => {
      const c = center()
      const total = tracker.current.add(x - c.x, y - c.y)
      fold(base.current + Math.floor(total / per))
    },
    onEnd: ({ x, y }) => {
      const c = center()
      const total = tracker.current.add(x - c.x, y - c.y)
      fold(base.current + Math.floor(total / per))
    },
    onTap: () => fold(count.current + 1),
    disabled: finished || auto,
  })
  useEffect(() => {
    if (!auto) return
    let i = 0
    const t = setInterval(() => fold(++i), 160)
    return () => clearInterval(t)
  }, [auto])
  return (
    <div ref={area} role="button" aria-label="fold the dumpling" style={{ position: 'relative', padding: `calc(${size} * 0.22)`, borderRadius: '50%', touchAction: 'none' }}>
      {!finished && !auto && (
        <motion.svg viewBox="0 0 100 100" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
          <circle cx={50} cy={50} r={47} fill="none" stroke="#FFC83D" strokeWidth={2.4} strokeDasharray="4 6" strokeLinecap="round" />
          <text x={50} y={6} fontSize={12} textAnchor="middle">
            👆
          </text>
        </motion.svg>
      )}
      <Dumpling ref={dumpling} state={folds === 0 ? 'filled' : 'pleated'} pleats={folds / need} face={finished ? 'content' : 'smile'} color={color} size={size} />
    </div>
  )
}

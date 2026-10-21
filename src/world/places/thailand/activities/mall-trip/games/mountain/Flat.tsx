// The Golden Mountain without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the cone as a picture
// with the same holds (layout.ts). Tap a hold in reach (round 2: a pink one) and she climbs to it, counting; at the top
// tap the bell and the slide. Round 3: Daddy climbs the other side, one hold behind. A flag for each round.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sounds } from '../../../../../../../sdk'
import { CONE, DADDY_FOOT_A, daddyHolds, FOOT_A, FOOT_Y, HOLD_COLORS, holdsFor, inReach, rAt, rowsIn, type Hold, type Round } from './layout'
import { mountainSfx as sfx } from './sounds'

interface Props {
  round: Round
  onRound: (n: Round) => void
  onTop: () => void
  onAllDone: () => void
}

/** Where a point on the cone shows on the picture (% across, % up): the cone's face unrolled, so the holds spread out. */
const at = (a: number, y: number) => ({ left: `${46 + a * (rAt(y) / CONE.r0) * 52}%`, bottom: `${(y / CONE.top) * 70 + 4}%` })
const btn = { position: 'absolute', width: 'clamp(64px, 10vmin, 96px)', height: 'clamp(64px, 10vmin, 96px)', translate: '-50% 50%', borderRadius: '50%', padding: 0 } as const

export function MountainFlat({ round: startRound, onRound, onTop, onAllDone }: Props) {
  const [round, setRound] = useState(startRound)
  const [pos, setPos] = useState<{ a: number; y: number; row: number }>({ a: FOOT_A[startRound], y: FOOT_Y, row: -1 })
  const [stage, setStage] = useState<'climb' | 'top' | 'slide'>('climb')
  const [count, setCount] = useState(0)
  const [rung, setRung] = useState(false)
  const [flags, setFlags] = useState(startRound - 1)
  const [wiggle, setWiggle] = useState(-1)
  const [daddy, setDaddy] = useState(-1)
  const done = useRef(false)
  const holds = holdsFor(round)
  const dh = daddyHolds()
  const last = rowsIn(round) - 1
  useEffect(() => onRound(round), [round])

  const tap = (h: Hold) => {
    if (stage !== 'climb') return
    const ok = round !== 2 || h.color === 'pink'
    if (!inReach(h, pos.a, pos.row) || !ok) {
      setWiggle(h.i)
      if (h.color === 'yellow') sfx.honk()
      else if (h.color === 'blue') sfx.holdGiggle()
      else sfx.raspberry()
      setTimeout(() => setWiggle(-1), 500)
      return
    }
    sfx.grab()
    sounds.note(count)
    setCount(count + 1)
    setPos({ a: h.a, y: h.y, row: h.row })
    if (round === 3) setTimeout(() => setDaddy(Math.min(h.row - 1, last)), 450)
    if (h.row === last) {
      setTimeout(() => {
        setStage('top')
        sfx.cheer()
        onTop()
        if (round === 3) {
          sfx.win()
          setTimeout(() => setDaddy(last), 700)
        }
      }, 450)
    }
  }
  const ring = () => {
    sfx.bell(1)
    setRung(true)
  }
  const slide = () => {
    if (stage !== 'top') return
    setStage('slide')
    sfx.zoom()
    setTimeout(() => {
      setFlags((f) => Math.max(f, round))
      sfx.flag()
      if (round === 3 && !done.current) {
        done.current = true
        onAllDone()
      }
      const next = (round < 3 ? round + 1 : 3) as Round
      setRound(next)
      setPos({ a: FOOT_A[next], y: FOOT_Y, row: -1 })
      setCount(0)
      setRung(false)
      setDaddy(-1)
      setStage('climb')
    }, 1500)
  }

  const kAt = stage === 'top' ? { left: '42%', bottom: '76%' } : stage === 'slide' ? { left: '84%', bottom: '2%' } : at(pos.a, Math.max(0, pos.y - 0.4))
  const dAt = daddy < 0 ? at(DADDY_FOOT_A, 0) : daddy >= last && stage !== 'climb' ? { left: '58%', bottom: '76%' } : at(dh[daddy].a, Math.max(0, dh[daddy].y - 0.5))
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#EBDDFF 0, #EBDDFF 80%, #DCD0FA 80%)', paddingTop: 'var(--top-clear)', display: 'flex', alignItems: 'stretch', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 'min(96vw, 760px)', margin: '8px 0 12px' }}>
        {/* The cone, the rail and the slide. */}
        <div aria-hidden style={{ position: 'absolute', left: '4%', right: '4%', bottom: '4%', height: '70%', background: '#FFD23F', clipPath: 'polygon(0 100%, 100% 100%, 71% 0, 29% 0)', borderBottom: '6px solid #E8A92A' }} />
        <div aria-hidden style={{ position: 'absolute', left: '29%', right: '29%', bottom: '74%', height: '4%', borderTop: '6px solid #FF5A5A' }} />
        <div aria-hidden style={{ position: 'absolute', left: '64%', bottom: '4%', width: '7%', height: '71%', background: 'linear-gradient(90deg, #8E95A6, #EEF1F6, #8E95A6)', transform: 'skewX(-14deg)', transformOrigin: 'bottom', borderRadius: 10 }} />
        <div aria-label={`Flags: ${flags}`} style={{ position: 'absolute', left: '30%', bottom: '79%', display: 'flex', gap: 8, fontSize: 'clamp(26px, 4vmin, 40px)' }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ opacity: i < flags ? 1 : 0.2 }}>
              {i === 2 ? '🏆' : '🚩'}
            </span>
          ))}
        </div>
        {holds.map((h) => {
          const ok = (round !== 2 || h.color === 'pink') && inReach(h, pos.a, pos.row) && stage === 'climb'
          return (
            <motion.button key={`${round}-${h.i}`} aria-label="A climbing hold" onClick={() => tap(h)} animate={wiggle === h.i ? { rotate: [0, -20, 20, 0], scale: [1, 1.3, 1] } : { scale: ok ? [1, 1.12, 1] : 1 }} transition={ok ? { repeat: Infinity, duration: 1 } : { duration: 0.4 }} style={{ ...btn, ...at(h.a, h.y), background: HOLD_COLORS[h.color], border: ok ? '6px solid #FFE27A' : '4px solid #2B2330', boxShadow: ok ? '0 0 18px 6px rgba(255,200,61,.75)' : 'none', zIndex: inReach(h, pos.a, pos.row) ? 2 : 1 }} />
          )
        })}
        {round === 3 && dh.map((h) => <div key={`d${h.i}`} aria-hidden style={{ ...btn, ...at(h.a, h.y), width: 34, height: 34, background: HOLD_COLORS[h.color], border: '3px solid #2B2330' }} />)}
        <motion.button aria-label="The bell" whileTap={{ rotate: [0, -25, 25, 0] }} onClick={ring} style={{ ...btn, left: '50%', bottom: '84%', background: '#FFF7F0', border: stage === 'top' && !rung ? '6px solid #FFE27A' : '4px solid #fff', fontSize: 'clamp(32px, 5vmin, 48px)' }}>
          🔔
        </motion.button>
        {stage === 'top' && (
          <motion.button aria-label="The steel slide" initial={{ scale: 0 }} animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 1 }} onClick={slide} style={{ ...btn, left: '70%', bottom: '74%', background: '#D5DAE3', border: '6px solid #FFE27A', fontSize: 'clamp(32px, 5vmin, 48px)' }}>
            🛝
          </motion.button>
        )}
        {round === 3 && <motion.div aria-label="Daddy" animate={dAt} transition={{ type: 'spring', stiffness: 160, damping: 16 }} style={{ position: 'absolute', translate: '-50% 0', fontSize: 'clamp(54px, 10vmin, 90px)', lineHeight: 1, pointerEvents: 'none' }}>🦄</motion.div>}
        <motion.div aria-label="Kaylee" animate={kAt} transition={stage === 'slide' ? { duration: 0.9, ease: 'easeIn' } : { type: 'spring', stiffness: 220, damping: 16 }} style={{ position: 'absolute', translate: '-50% 0', fontSize: 'clamp(44px, 8vmin, 72px)', lineHeight: 1, pointerEvents: 'none', filter: 'hue-rotate(250deg)' }}>
          🦄
        </motion.div>
        <AnimatePresence>
          {count > 0 && stage === 'climb' && (
            <motion.div key={`${round}-${count}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.4, 1], opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', ...at(pos.a + 0.3, pos.y + 0.3), fontSize: 'clamp(48px, 9vmin, 84px)', fontWeight: 700, color: 'var(--hotpink)', WebkitTextStroke: '3px #fff', pointerEvents: 'none' }}>
              {count}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Little Land without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the stack as a picture, with
// the same stacking (grid.ts). Tap the box and the next brick hops to a good spot (the card's next place in round 2);
// tap the stack to knock it over. Round 3: past Daddy's ribbon he sneezes it down. A star for each round.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sounds } from '../../../../../../../sdk'
import { L } from '../../../../lines'
import { mallVoice } from '../../voice'
import { CARDS, Grid } from './grid'
import { BH, BRICK_COLORS, COLS, MARK_Y, ROWS, type CardId, type Round } from './layout'
import { blocksSfx as sfx } from './sounds'

interface Props {
  round: Round
  card: CardId
  onRound: (n: Round) => void
  onCard: (id: CardId) => void
  onKnocked: () => void
  onAllDone: () => void
}

const PICTURE: Record<string, string> = { 1: '🧱', chedi: '🛕', elephant: '🐘', 3: '🦄' }
const big = { width: 'clamp(96px, 16vmin, 130px)', height: 'clamp(96px, 16vmin, 130px)', borderRadius: 28, border: '6px solid #fff', boxShadow: 'var(--shadow)', fontSize: 'clamp(44px, 8vmin, 64px)', padding: 0 } as const

export function BlocksFlat({ round: startRound, card: startCard, onRound, onCard, onKnocked, onAllDone }: Props) {
  const grid = useRef(new Grid())
  const [, redraw] = useState(0)
  const [round, setRound] = useState(startRound)
  const [card, setCard] = useState(startCard)
  const [stars, setStars] = useState(startRound - 1)
  const [falling, setFalling] = useState<{ id: number; s: number; r: number }[]>([])
  const [busy, setBusy] = useState(false)
  const [sneeze, setSneeze] = useState(false)
  const next = useRef(0)
  const knocked = useRef(false)
  const g = grid.current
  // The 3D version's opening line: Daddy's bet.
  useEffect(() => {
    if (startRound === 1) mallVoice.say(L.mall.blocks.higher)
  }, [])
  const nextRound =(n: Round, c: CardId = card) => {
    setRound(n)
    setCard(c)
    onRound(n)
    if (n === 2) onCard(c)
  }
  const star = () => {
    setStars((s) => Math.min(3, s + 1))
    sfx.star()
  }

  /** Over it goes: the bricks tumble off, then what comes next. */
  const crash = (then?: () => void) => {
    setFalling([...g.at].map(([id, c]) => ({ id, ...c })))
    g.clear()
    redraw((v) => v + 1)
    sfx.crash()
    if (!knocked.current) {
      knocked.current = true
      onKnocked()
    }
    setBusy(true)
    setTimeout(() => {
      setFalling([])
      setBusy(false)
      then?.()
    }, 1400)
  }

  const tapBox = () => {
    const c = busy ? null : g.tapSpot(round, card)
    if (!c) return sfx.boingy()
    g.place(next.current++, c)
    redraw((v) => v + 1)
    sfx.whump(c.r)
    if (round === 2 && g.done(card)) {
      setBusy(true)
      if (card === 'chedi') {
        sfx.bell()
        sounds.sparkle()
        setTimeout(() => {
          g.clear()
          setBusy(false)
          nextRound(2, 'elephant')
        }, 1600)
      } else {
        sfx.trumpet()
        star()
        setTimeout(() => crash(() => nextRound(3)), 1600)
      }
    }
    if (round === 3 && g.top() * BH > MARK_Y) {
      setSneeze(true)
      sfx.ahh()
      setBusy(true)
      setTimeout(() => {
        sfx.choo()
        setSneeze(false)
        crash(() => {
          star()
          onAllDone()
        })
      }, 1200)
    }
  }
  const tapStack = () => {
    if (busy || !g.count) return
    const n = g.count
    crash(() => {
      if (round === 1 && n >= 4) {
        star()
        nextRound(2, 'chedi')
      }
    })
  }

  const ghosts = round === 2 && !busy ? CARDS[card].filter((c) => !g.filled(card).some((f) => f.s === c.s && f.r === c.r)) : []
  const cell = (s: number, r: number) => ({ left: `${(s / COLS) * 100}%`, bottom: `${(r / ROWS) * 100}%`, width: `${(2 / COLS) * 100}%`, height: `${100 / ROWS}%` })
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#EBDDFF 0, #EBDDFF 70%, #DCD0FA 70%)', paddingTop: 'var(--top-clear)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div aria-label={`Stars: ${stars}`} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'clamp(30px, 5vmin, 46px)' }}>
        <span style={{ background: '#fff', borderRadius: 14, padding: '2px 12px', border: '4px solid #E8B98A' }}>{PICTURE[round === 2 ? card : round]}</span>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ opacity: i < stars ? 1 : 0.25 }}>
            ⭐
          </span>
        ))}
      </div>
      <div style={{ position: 'relative', flex: 1, width: 'min(96vw, 900px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 18 }}>
        <motion.button aria-label="The brick box" whileTap={{ scale: 0.85 }} onClick={tapBox} style={{ ...big, background: '#B9A6F5' }}>
          🧱
        </motion.button>
        <div role="button" aria-label="The tower" onClick={tapStack} style={{ position: 'relative', flex: 1, height: 'min(58vh, 480px)', margin: '0 12px' }}>
          {round === 3 && <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: `${(MARK_Y / (ROWS * BH)) * 100}%`, borderTop: '5px dashed var(--hotpink)' }} />}
          {ghosts.map((c) => (
            <div key={`g${c.s}-${c.r}`} aria-hidden style={{ position: 'absolute', ...cell(c.s, c.r), boxSizing: 'border-box', border: '4px dashed rgba(255,200,61,.9)', borderRadius: 10 }} />
          ))}
          {[...g.at].map(([id, c]) => (
            <motion.div key={id} initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }} style={{ position: 'absolute', ...cell(c.s, c.r), boxSizing: 'border-box', background: BRICK_COLORS[id % 5], border: '4px solid #2B2330', borderRadius: 10 }} />
          ))}
          <AnimatePresence>
            {falling.map((b) => (
              <motion.div key={`f${b.id}`} initial={{ x: 0, y: 0, rotate: 0 }} animate={{ x: (b.s - COLS / 2) * 40 + (Math.random() - 0.5) * 80, y: b.r * 60 + 40, rotate: (Math.random() - 0.5) * 300, opacity: 0 }} transition={{ duration: 1.3 }} style={{ position: 'absolute', ...cell(b.s, b.r), boxSizing: 'border-box', background: BRICK_COLORS[b.id % 5], border: '4px solid #2B2330', borderRadius: 10 }} />
            ))}
          </AnimatePresence>
        </div>
        <motion.div aria-label="Daddy" animate={sneeze ? { rotate: [0, -12, 14, 0], scale: [1, 1.1, 1] } : {}} style={{ fontSize: 'clamp(64px, 12vmin, 110px)', lineHeight: 1 }}>
          {sneeze ? '🤧' : '🦄'}
        </motion.div>
      </div>
    </div>
  )
}

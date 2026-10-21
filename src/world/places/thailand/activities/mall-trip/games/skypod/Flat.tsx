// The Sky Pod without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the same nine pods as big
// round buttons (three by three, the notes climbing up the rows), the same rules (game.ts), the scoreboard on top and
// Daddy beside it. Every tap plays the pod's note; Daddy's blue lights go out by themselves when he gets there.
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sounds } from '../../../../../../../sdk'
import { ScoreBoard } from './board'
import { SkyGame, type Phase } from './game'
import { BLUE, PINK, POD_COLORS, PODS, SHOW, type Round } from './layout'
import { podSfx as sfx } from './sounds'

interface Props {
  round: Round
  onRound: (n: Round) => void
  onSticker: () => void
  onAllDone: () => void
}

const HEIGHTS = Array.from({ length: PODS }, (_, i) => Math.floor(i / 3))

export function SkyPodFlat({ round, onRound, onSticker, onAllDone }: Props) {
  const [, redraw] = useState(0)
  const [board, setBoard] = useState({ score: 0, daddy: 0, stars: round - 1, round, phase: 'play' as Phase })
  const [pressed, setPressed] = useState<number[]>(() => new Array(PODS).fill(0))
  const [daddy, setDaddy] = useState('🦄')
  const cb = useRef({ onRound, onSticker, onAllDone })
  cb.current = { onRound, onSticker, onAllDone }
  const game = useRef<SkyGame | null>(null)
  const bump = (i: number) => setPressed((p) => p.map((v, j) => (j === i ? v + 1 : v)))

  useEffect(() => {
    const g = new SkyGame(
      {
        lit: (i, kind) => (kind === 'blue' ? sfx.popBlue() : kind === 'lit' ? sfx.pop(i) : undefined),
        show: (i) => {
          sfx.note(i, true)
          bump(i)
        },
        hit: () => {},
        wrong: () => sfx.haha(),
        score: (score, daddy) => setBoard((b) => ({ ...b, score, daddy })),
        phase: (phase) => setBoard((b) => ({ ...b, phase })),
        round: (n) => {
          setBoard((b) => ({ ...b, round: n }))
          cb.current.onRound(n)
        },
        stars: (stars) => setBoard((b) => ({ ...b, stars })),
        sticker: () => cb.current.onSticker(),
        daddyIn: () => {},
        // Daddy gets there in a moment (and sometimes misses: "oops").
        daddyGo: (i, miss) =>
          setTimeout(() => {
            if (miss) sfx.oops()
            else {
              sfx.note(i)
              bump(i)
            }
            g.daddySlap(i, miss)
          }, 1300),
        daddyDawdle: () => {
          setDaddy('💃')
          setTimeout(() => setDaddy('🦄'), 1800)
        },
        daddyHey: () => sfx.hey(),
        copied: () => sfx.copied(),
        win: () => sfx.cheer(),
        finale: () => sounds.fanfare(),
        allDone: () => cb.current.onAllDone(),
      },
      round,
      () => HEIGHTS,
    )
    game.current = g
    g.begin()
    let last = performance.now()
    let raf = 0
    let seen = ''
    const tick = () => {
      const now = performance.now()
      g.update(Math.min(0.1, (now - last) / 1000))
      last = now
      const key = g.lights.join(',')
      if (key !== seen) {
        seen = key
        redraw((v) => v + 1)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const g = game.current
  const race = board.round === 3 && (board.phase === 'play' || board.phase === 'cheer')
  const slap = (i: number) => {
    if (!g) return
    const r = g.slap(i)
    sfx.slap()
    if (r === 'wrong') sfx.funny(i)
    else sfx.note(i, r !== 'note')
    bump(i)
  }
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#2E2748 0, #3B3466 75%, #8EC9F5 75%)', paddingTop: 'calc(var(--top-clear) + 6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(8px, 2vmin, 18px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div aria-label={`Score: ${board.score}`} style={{ width: 'clamp(150px, 30vmin, 260px)', height: 'clamp(64px, 12vmin, 110px)', fontSize: 'clamp(46px, 8.6vmin, 80px)', background: '#120E26', border: '6px solid #2B2330', borderRadius: 18, fontWeight: 700, lineHeight: 1 }}>
          <ScoreBoard {...board} race={race} />
        </div>
        <div aria-label="Daddy" style={{ fontSize: 'clamp(50px, 10vmin, 90px)', lineHeight: 1 }}>
          {daddy}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, clamp(88px, 17vmin, 150px))', gap: 'clamp(12px, 3vmin, 28px)'}}>
        {[6, 7, 8, 3, 4, 5, 0, 1, 2].map((i) => {
          const l = g?.lights[i] ?? 'off'
          const on = l !== 'off'
          const color = l === 'blue' ? BLUE : l === 'lit' && race ? PINK : l === 'show' ? SHOW : POD_COLORS[i]
          return (
            <motion.button
              key={`${i}-${pressed[i]}`}
              aria-label={`Light ${i + 1}`}
              initial={{ scale: pressed[i] ? 0.82 : 1 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 600, damping: 12 }}
              onPointerDown={() => slap(i)}
              onClick={(e) => e.detail === 0 && slap(i)}
              style={{ aspectRatio: '1', borderRadius: '50%', border: `8px solid ${on ? '#FFC83D' : '#F4EEFF'}`, background: on ? color : `color-mix(in srgb, ${POD_COLORS[i]} 35%, #2A2450)`, boxShadow: on ? `0 0 24px 8px ${color}` : 'var(--shadow)', padding: 0, opacity: l === 'help' ? 0.75 : 1 }}
            />
          )
        })}
      </div>
    </div>
  )
}

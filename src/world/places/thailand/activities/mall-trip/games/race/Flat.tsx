// The Racing Slide without WebGL (an old browser, a test browser without a GPU, or ?gl=off): four orange lanes as a
// picture, the racers as big faces. Tap the steps to climb (four taps), 3-2-1, then every tap is a scoot down her lane.
// She always wins (the others keep pace, then finish just behind), a ribbon joins the row, and round again.
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { L } from '../../../../lines'
import { mallVoice } from '../../voice'
import { CLIMB_HOPS, RIVALS, kidFor } from './layout'
import { Countdown } from './Race'
import { raceSfx as sfx } from './sounds'

interface Props {
  round: number
  onRound: (n: number) => void
  onWon: (n: number) => void
  onAllDone: () => void
}

const FACES = { kaylee: '🦄', nick: '🦄', ji: '🦄', kidA: '🐶', kidB: '🐴' } as const
const LANE_COLORS = ['#FF9A3C', '#FFAD55', '#FF9A3C', '#FFAD55']
type Phase = 'climb' | 'count' | 'race' | 'won'

export function RaceFlat({ round, onRound, onWon, onAllDone }: Props) {
  const [race, setRace] = useState(round)
  const [phase, setPhase] = useState<Phase>('climb')
  const [climbed, setClimbed] = useState(0)
  const [count, setCount] = useState<number | null>(null)
  const [pos, setPos] = useState([0, 0, 0, 0])
  const [ribbons, setRibbons] = useState(round - 1)
  // Sparkle's opening line (once, as it opens).
  useEffect(() => {
    mallVoice.say(L.mall.race.open)
  }, [])
  const boost = useRef(0)
  const her = useRef(0)
  const kid = kidFor(race)
  const rivals = [RIVALS.nick, RIVALS.ji, RIVALS[kid]]

  // The race: her pace (plus what her taps add), the others just ahead mid-race and just behind at the end.
  useEffect(() => {
    if (phase !== 'race') return
    her.current = 0
    const id = setInterval(() => {
      boost.current *= 0.92
      her.current = Math.min(1, her.current + 0.012 + boost.current * 0.012)
      const p = her.current
      setPos([p, ...rivals.map((r) => Math.min(0.99, Math.max(0, p + r.lead * Math.sin(Math.PI * p) - r.nose * p ** 3)))])
      if (p >= 1) {
        clearInterval(id)
        sfx.balls(1.4)
        sfx.cheer()
        setPhase('won')
        setRibbons((n) => n + 1)
        onWon(race)
        if (race === 3) onAllDone()
        setTimeout(() => {
          setRace((n) => n + 1)
          onRound(race + 1)
          setClimbed(0)
          setPos([0, 0, 0, 0])
          setPhase('climb')
        }, 2200)
      }
    }, 50)
    return () => clearInterval(id)
  }, [phase])

  const climb = () => {
    if (phase !== 'climb') return
    sfx.step(climbed * 2)
    const c = climbed + 1
    setClimbed(c)
    if (c < CLIMB_HOPS.length) return
    setPhase('count')
    ;([3, 2, 1, 0] as const).forEach((n, i) =>
      setTimeout(() => {
        setCount(n)
        sfx.light(n === 0)
        if (n === 0) {
          sfx.whistle()
          setPhase('race')
          setTimeout(() => setCount(null), 800)
        }
      }, 500 + i * 850),
    )
  }
  const tap = () => {
    if (phase === 'race') {
      boost.current = Math.min(2, boost.current + 0.45)
      sfx.scoot(boost.current / 2)
    } else if (phase === 'climb') climb()
    else sfx.giggle()
  }

  const who = ['kaylee', 'nick', 'ji', kid] as const
  return (
    <div onPointerDown={tap} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#4A4166, #6E5F96)', paddingTop: 'var(--top-clear)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, touchAction: 'none' }}>
      <div aria-label="Ribbons" style={{ display: 'flex', gap: 8, minHeight: 56, fontSize: 'clamp(36px, 6vmin, 52px)' }}>
        {Array.from({ length: ribbons }, (_, i) => (
          <motion.span key={i} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }}>
            🎀
          </motion.span>
        ))}
      </div>
      <div style={{ position: 'relative', flex: 1, width: 'min(92vw, 640px)', display: 'flex', gap: 6, marginBottom: 16 }}>
        {who.map((id, i) => (
          <div key={id} style={{ position: 'relative', flex: 1, borderRadius: 20, background: `repeating-linear-gradient(${LANE_COLORS[i]} 0 40px, #FFC07F 40px 56px)`, border: '4px solid #FFF1E0' }}>
            <motion.div
              aria-label={id === 'kaylee' ? 'Kaylee' : id}
              animate={{ top: `${4 + pos[i] * 78}%` }}
              transition={{ duration: 0.05 }}
              style={{ position: 'absolute', left: '50%', translate: '-50% 0', fontSize: 'clamp(44px, 9vmin, 76px)', filter: id === 'kaylee' ? 'drop-shadow(0 0 10px #FF4F9A)' : undefined }}
            >
              {FACES[id]}
            </motion.div>
          </div>
        ))}
        <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: -10, height: 44, borderRadius: 16, background: 'radial-gradient(circle, #FF8FB8 30%, #fff 32%) 0 0 / 22px 22px' }} />
      </div>
      {phase === 'climb' && (
        <motion.button
          aria-label="Climb the steps"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ position: 'absolute', left: 16, bottom: 24, width: 'clamp(96px, 16vmin, 130px)', height: 'clamp(96px, 16vmin, 130px)', borderRadius: 28, border: '6px solid #fff', background: 'var(--pink)', fontSize: 'clamp(44px, 8vmin, 64px)', padding: 0 }}
        >
          🪜{'·'.repeat(CLIMB_HOPS.length - climbed)}
        </motion.button>
      )}
      <Countdown n={count} />
    </div>
  )
}

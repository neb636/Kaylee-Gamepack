// The Pizza Company without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the same menu, then the
// pizza as a ring of eight slice buttons, the three plates and Agong's box. Tap a slice and it hops to the plate that's
// behind (the box once everyone has two); tap a plate and they munch. Two in the box and its lid closes.
import { motion } from 'motion/react'
import { useState } from 'react'
import { pizzaSfx as sfx } from './sounds'
import { BOX_HOLDS, EATER_NAMES, EATERS, SLICES, type EaterId, type PizzaId } from './layout'
import { Menu } from './Menu'
import { ROUND } from './share'

interface Props {
  section: 'menu' | 'share'
  pizza: PizzaId
  shared: number
  onPizza: (id: PizzaId) => void
  onServed: () => void
  onShared: (n: number) => void
}

const FACES: Record<EaterId, string> = { ji: '🦄', kaylee: '🦄', nick: '🦄' }
const TINT: Record<EaterId, string> = { ji: '#FFE3EF', kaylee: '#EDE4FF', nick: '#DDF7EC' }
const SLICE: Record<PizzaId, string> = { hawaiian: '🍍', seafood: '🦐', cheese: '🧀' }
const big = { borderRadius: '50%', border: '5px solid #fff', boxShadow: 'var(--shadow)', padding: 0, display: 'grid', placeItems: 'center' } as const

/** Where the first `n` slices went (round the table, then the box). */
const dealt = (n: number): (EaterId | 'box')[] => Array.from({ length: n }, (_, k) => (k < 6 ? ROUND[k % 3] : 'box'))

export function PizzaFlat({ section, pizza, shared, onPizza, onServed, onShared }: Props) {
  const [served, setServed] = useState(section === 'share')
  const [kind, setKind] = useState(pizza)
  const [given, setGiven] = useState(() => dealt(Math.min(SLICES, Math.max(0, shared))))
  const [eaten, setEaten] = useState<Record<EaterId, number>>({ ji: 0, kaylee: 0, nick: 0 })
  const count = (t: EaterId | 'box') => given.filter((g) => g === t).length
  const boxShut = count('box') >= BOX_HOLDS

  const pick = (id: PizzaId) => {
    setKind(id)
    onPizza(id)
    sfx.chime()
    setTimeout(() => {
      setServed(true)
      sfx.thump()
      onServed()
    }, 700)
  }
  const serve = () => {
    if (given.length >= SLICES) return
    const c = Object.fromEntries(EATERS.map((e) => [e, count(e)])) as Record<EaterId, number>
    const min = Math.min(...EATERS.map((e) => c[e]))
    const to: EaterId | 'box' = !boxShut && min >= 2 ? 'box' : (ROUND.find((e) => c[e] === min) ?? 'ji')
    const next = [...given, to]
    setGiven(next)
    onShared(next.length)
    sfx.snap()
    setTimeout(() => (to === 'box' && next.filter((g) => g === 'box').length >= BOX_HOLDS ? sfx.flup() : sfx.plop()), 200)
  }
  const munch = (e: EaterId) => {
    if (eaten[e] >= count(e) * 3) return sfx.plink()
    setEaten({ ...eaten, [e]: eaten[e] + 1 })
    sfx.chomp()
  }

  if (!served) return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#FFF1E4, #E8F7EE)' }}>
      <Menu open onPick={pick} />
    </div>
  )

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#FFF1E4, #E8F7EE)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly', paddingTop: 'var(--top-clear)', paddingBottom: 12 }}>
      <div style={{ display: 'flex', gap: 'clamp(10px, 3vmin, 28px)', alignItems: 'flex-end' }}>
        {EATERS.map((e) => (
          <motion.button key={e} aria-label={`${EATER_NAMES[e]}'s plate`} whileTap={{ scale: 0.88 }} onClick={() => munch(e)} style={{ ...big, width: 'clamp(96px, 18vmin, 150px)', height: 'clamp(96px, 18vmin, 150px)', background: TINT[e], position: 'relative', fontSize: 'clamp(26px, 5vmin, 40px)' }}>
            <span style={{ fontSize: 'clamp(36px, 7vmin, 56px)', lineHeight: 1 }}>{FACES[e]}</span>
            <span style={{ position: 'absolute', top: -10, fontSize: 'clamp(12px, 2vmin, 15px)', fontWeight: 600, background: '#fff', borderRadius: 999, padding: '0 8px' }}>{EATER_NAMES[e]}</span>
            <span style={{ position: 'absolute', bottom: 6, display: 'flex', gap: 2, fontSize: 'clamp(16px, 3vmin, 24px)' }}>
              {Array.from({ length: count(e) }, (_, k) => <span key={k} style={{ opacity: k < Math.floor(eaten[e] / 3) ? 0.25 : 1 }}>🍕</span>)}
            </span>
          </motion.button>
        ))}
        <motion.div aria-label="Agong's box" animate={{ rotate: boxShut ? [0, -6, 6, 0] : 0 }} style={{ ...big, borderRadius: 18, width: 'clamp(84px, 15vmin, 120px)', height: 'clamp(70px, 12vmin, 100px)', background: boxShut ? '#4DB57A' : '#fff', fontSize: 'clamp(28px, 5vmin, 40px)' }}>
          {boxShut ? '🎁' : '🐼'}
          <span style={{ fontSize: 'clamp(14px, 2.6vmin, 20px)' }}>{'🍕'.repeat(count('box'))}</span>
        </motion.div>
      </div>
      <div aria-label="Pizza" style={{ position: 'relative', width: 'clamp(200px, 40vmin, 320px)', height: 'clamp(200px, 40vmin, 320px)', borderRadius: '50%', background: '#DCD6EA', border: '8px solid #C9C3DA' }}>
        {Array.from({ length: SLICES }, (_, i) => {
          const a = ((i + 0.5) / SLICES) * Math.PI * 2
          const gone = i < given.length
          return (
            <motion.button
              key={i}
              aria-label={`Slice ${i + 1}`}
              disabled={gone}
              onClick={serve}
              whileTap={{ scale: 0.8 }}
              animate={{ opacity: gone ? 0 : 1, scale: gone ? 0.3 : 1 }}
              style={{ ...big, position: 'absolute', left: `calc(50% + ${Math.sin(a) * 34}% - clamp(32px, 6.5vmin, 48px))`, top: `calc(50% - ${Math.cos(a) * 34}% - clamp(32px, 6.5vmin, 48px))`, width: 'clamp(64px, 13vmin, 96px)', height: 'clamp(64px, 13vmin, 96px)', background: '#FFE27A', fontSize: 'clamp(28px, 5.5vmin, 42px)' }}
            >
              {SLICE[kind]}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

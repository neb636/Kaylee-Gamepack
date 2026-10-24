// The mushroom farm without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the same rounds as a
// picture. The rack's twelve bags; a finger held on them (or dragged across) mists them and the mushrooms pop and
// swell; in rounds 2 and 3 a tap on a grown one drops it in the basket (pink and gold collars in round 3). Then the
// pizza: tap the basket (or the pizza) and a mushroom hops on, the oven bakes it, and each tap on the pizza hands a
// slice round the table.
import { motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { BAGS, COLORS, EATER_NAMES, formatBasket, parseBasket, PICKS, PIN_AT, ROUND3_KINDS, SLICES, type BagKind, type Basket, type EaterId, type Round, type ShroomColor } from './layout'
import { COLLAR, SHROOM } from './shroom'
import { shroomSfx as sfx } from './sounds'

interface Props {
  round: Round
  basket: string
  onRound: (r: Round, basket: string) => void
  onBasket: (basket: string) => void
  onDone: () => void
}

const shroomOf = (k: BagKind): ShroomColor => (k === 'plain' ? 'grey' : k)
const ORDER: EaterId[] = ['kaylee', 'ji', 'nick', 'kaylee', 'ji', 'nick']

/** A mushroom drawn in CSS: a round fan cap on a stem. */
function Shroom({ color, size, style }: { color: ShroomColor; size: number; style?: CSSProperties }) {
  const c = SHROOM[color]
  return (
    <span aria-hidden style={{ position: 'relative', display: 'inline-block', width: size, height: size * 0.75, ...style }}>
      <span style={{ position: 'absolute', left: '40%', top: '45%', width: '20%', height: '50%', background: c.stem, border: '2px solid var(--ink)', borderRadius: 6 }} />
      <span style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '60%', background: c.cap, border: '3px solid var(--ink)', borderRadius: '50% 50% 40% 40%' }} />
    </span>
  )
}

export function MushroomsFlat({ round: start, basket: startBasket, onRound, onBasket, onDone }: Props) {
  const [round, setRound] = useState<Round>(start)
  const [kinds, setKinds] = useState<BagKind[]>(() => (start === '3' ? ROUND3_KINDS : BAGS.map(() => 'plain')))
  const [water, setWater] = useState<number[]>(() => BAGS.map(() => (start === '2' ? 1 : 0)))
  const [basket, setBasket] = useState<Basket>(() => parseBasket(startBasket))
  const [picks, setPicks] = useState(0)
  // The pizza: mushrooms on it (color, x, y in %), baked, slices handed out.
  const [onPizza, setOnPizza] = useState<{ c: ShroomColor; x: number; y: number }[]>([])
  const [baked, setBaked] = useState<'no' | 'baking' | 'yes'>('no')
  const [served, setServed] = useState(0)
  const misting = useRef<number | null>(null)

  // Hold to mist: the bag under her finger drinks.
  useEffect(() => {
    if (round === 'pizza') return
    let last = performance.now()
    let id = 0
    let hiss = 0
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const i = misting.current
      if (i !== null) {
        hiss -= dt
        if (hiss <= 0) {
          hiss = 0.2
          sfx.hiss()
        }
        setWater((w) => {
          const next = [...w]
          const cap = round === '1' ? 1.15 : 1.6
          const before = next[i]
          next[i] = Math.min(cap, before + dt * 1.3)
          if (before < PIN_AT && next[i] >= PIN_AT) sfx.bloop(i)
          if (before < 1 && next[i] >= 1) sfx.swell()
          return next
        })
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [round])

  // Round 1 is over when every bag has grown.
  useEffect(() => {
    if (round === '1' && water.every((w) => w >= 1)) {
      sfx.allGrown()
      setRound('2')
      onRound('2', formatBasket(basket))
    }
  }, [water, round])

  const bagAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest('[data-bag]') as HTMLElement | null
    return el ? Number(el.dataset.bag) : null
  }

  const pick = (i: number) => {
    const c = shroomOf(kinds[i])
    const b = { ...basket, [c]: basket[c] + 1 }
    setBasket(b)
    setWater((w) => w.map((v, k) => (k === i ? 0 : v)))
    sfx.twist()
    setTimeout(() => sfx.basket(b.grey + b.pink + b.gold), 200)
    onBasket(formatBasket(b))
    const n = picks + 1
    setPicks(n)
    if (round === '2' && n >= PICKS['2']) {
      setTimeout(() => {
        setRound('3')
        setKinds(ROUND3_KINDS)
        setWater(BAGS.map(() => 0))
        setPicks(0)
        onRound('3', formatBasket(b))
      }, 600)
    } else if (round === '3' && n >= PICKS['3']) {
      setTimeout(() => {
        setRound('pizza')
        onRound('pizza', formatBasket(b))
      }, 700)
    }
  }

  // ---------------------------------------------------------------- the pizza

  const left = COLORS.flatMap((c) => Array.from({ length: basket[c] }, () => c))
  const placeNext = (x?: number, y?: number) => {
    if (baked !== 'no' || !left.length) return false
    const c = left[left.length - 1]
    const a = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * 30
    setOnPizza((p) => [...p, { c, x: x ?? 50 + Math.cos(a) * r, y: y ?? 50 + Math.sin(a) * r }])
    setBasket((b) => ({ ...b, [c]: b[c] - 1 }))
    sfx.plopPizza()
    return true
  }
  const bake = () => {
    if (baked !== 'no' || left.length || !onPizza.length) return sfx.crackle(0.4)
    setBaked('baking')
    sfx.crackle(2)
    setTimeout(() => {
      setBaked('yes')
      sfx.ready()
    }, 2200)
  }
  const serve = () => {
    if (served >= SLICES) return
    const n = served + 1
    setServed(n)
    sfx.fwip()
    if (n >= SLICES) setTimeout(() => (sfx.cheer(), onDone()), 900)
  }

  const big = { borderRadius: '50%', border: '5px solid #fff', boxShadow: 'var(--shadow)', padding: 0, display: 'grid', placeItems: 'center' } as const

  if (round === 'pizza')
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#CFE6F5, #A6E6B0)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly', paddingTop: 'var(--top-clear)', paddingBottom: 12 }}>
        <div style={{ display: 'flex', gap: 'clamp(10px, 3vmin, 28px)' }}>
          {(['ji', 'kaylee', 'nick'] as const).map((e) => (
            <div key={e} aria-label={`${EATER_NAMES[e]}'s plate`} style={{ ...big, width: 'clamp(84px, 15vmin, 120px)', height: 'clamp(84px, 15vmin, 120px)', background: '#FFF7F0', position: 'relative', fontSize: 'clamp(30px, 6vmin, 46px)' }}>
              🦄
              <span style={{ position: 'absolute', bottom: 4, fontSize: 'clamp(14px, 2.6vmin, 20px)' }}>{'🍕'.repeat(ORDER.slice(0, served).filter((o) => o === e).length)}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 4vmin, 40px)' }}>
          <motion.button aria-label="Oven" whileTap={{ scale: 0.9 }} animate={baked === 'no' && !left.length && onPizza.length ? { scale: [1, 1.1, 1] } : { scale: 1 }} transition={{ repeat: Infinity, duration: 1 }} onClick={bake} style={{ ...big, width: 'clamp(84px, 15vmin, 120px)', height: 'clamp(84px, 15vmin, 120px)', background: baked === 'baking' ? '#FF8A3D' : '#E59A6E', fontSize: 'clamp(36px, 7vmin, 54px)' }}>
            🔥
          </motion.button>
          <button
            aria-label="Mushroom pizza"
            onClick={(e) => {
              if (baked === 'yes') return serve()
              const r = e.currentTarget.getBoundingClientRect()
              placeNext(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100)
            }}
            style={{ position: 'relative', width: 'clamp(200px, 40vmin, 320px)', height: 'clamp(200px, 40vmin, 320px)', borderRadius: '50%', border: `10px solid ${baked === 'yes' ? '#E3A15A' : '#F2C27B'}`, background: baked === 'yes' ? '#FFD45C' : '#FFF3C4', padding: 0, opacity: baked === 'baking' ? 0.3 : 1, clipPath: `polygon(50% 50%, ${Array.from({ length: 25 }, (_, k) => {
              const a = (-Math.PI / 2) + (k / 24) * Math.PI * 2 * (1 - served / SLICES)
              return `${50 + Math.cos(a) * 75}% ${50 + Math.sin(a) * 75}%`
            }).join(', ')})` }}
          >
            {onPizza.map((m, k) => (
              <Shroom key={k} color={m.c} size={34} style={{ position: 'absolute', left: `calc(${m.x}% - 17px)`, top: `calc(${m.y}% - 13px)` }} />
            ))}
          </button>
          <motion.button aria-label="Basket of mushrooms" whileTap={{ scale: 0.9 }} onClick={() => placeNext()} style={{ ...big, borderRadius: 24, width: 'clamp(96px, 17vmin, 140px)', minHeight: 'clamp(84px, 15vmin, 120px)', background: '#C9965E', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: 2 }}>
            {left.map((c, k) => (
              <Shroom key={k} color={c} size={24} />
            ))}
          </motion.button>
        </div>
      </div>
    )

  return (
    <div
      onPointerDown={(e) => {
        const i = bagAt(e.clientX, e.clientY)
        if (i === null) return
        if (round !== '1' && water[i] >= 1) return pick(i)
        misting.current = i
      }}
      onPointerMove={(e) => {
        if (misting.current !== null) misting.current = bagAt(e.clientX, e.clientY) ?? misting.current
      }}
      onPointerUp={() => (misting.current = null)}
      onPointerCancel={() => (misting.current = null)}
      style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#6E5049, #9C877B)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly', paddingTop: 'var(--top-clear)', paddingBottom: 12, touchAction: 'none' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 'clamp(8px, 2.4vmin, 22px)', padding: 'clamp(10px, 2vmin, 18px)', background: '#8E6A5C', borderRadius: 18, border: '4px solid #6E5049' }}>
        {BAGS.map((_, i) => {
          const w = water[i]
          const size = w < PIN_AT ? 0 : w < 1 ? 0.3 + 0.7 * ((w - PIN_AT) / (1 - PIN_AT)) : Math.min(1.3, 1 + (w - 1) * 0.5)
          return (
            <div key={i} data-bag={i} aria-label={`Mushroom bag ${i + 1}`} role="button" style={{ ...big, borderRadius: '50%', width: 'clamp(70px, 13vmin, 110px)', height: 'clamp(70px, 13vmin, 110px)', background: '#E9D4AE', border: `6px solid ${COLLAR[kinds[i]]}`, position: 'relative' }}>
              {size > 0 && (
                <motion.div animate={round !== '1' && w >= 1 ? { rotate: [0, -8, 8, 0] } : { rotate: 0 }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ transform: `scale(${size})` }}>
                  <Shroom color={shroomOf(kinds[i])} size={60} />
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
      <div aria-label="Basket" style={{ ...big, borderRadius: 24, minWidth: 'clamp(110px, 20vmin, 160px)', minHeight: 70, padding: '6px 10px', background: '#C9965E', display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        {COLORS.flatMap((c) => Array.from({ length: basket[c] }, (_, k) => <Shroom key={`${c}${k}`} color={c} size={26} />))}
        {!(basket.grey + basket.pink + basket.gold) && <span style={{ fontSize: 34 }}>🧺</span>}
      </div>
    </div>
  )
}

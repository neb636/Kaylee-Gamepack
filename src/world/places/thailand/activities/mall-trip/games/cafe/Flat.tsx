// Cafe & Cake without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the blender as a big picture.
// Tap fruit to drop it in the jar, the pink button to blend (the colors mix into one), the jar to pour, then the
// straw to serve. The same rounds and orders as the 3D cafe; any drink is drunk happily.
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { OrderBubble } from './Cafe'
import { ICONS, isFruit, JUICE, ROUNDS, type Customer, type Fruit, type ItemId, type Order, type Round } from './layout'
import { mix } from './liquid'
import { cafeSfx as sfx } from './sounds'

interface Props {
  round: Round
  onRound: (n: Round) => void
  onDrink: () => void
  onAllDone: () => void
}

interface FlatCup {
  order: Order
  fill: number
  color: string
  parts: Fruit[]
  cream: boolean
}

const big = { width: 'clamp(76px, 12vmin, 112px)', height: 'clamp(76px, 12vmin, 112px)', borderRadius: 24, border: '5px solid #fff', background: 'rgba(255,255,255,.85)', boxShadow: 'var(--shadow)', fontSize: 'clamp(38px, 6.5vmin, 58px)', padding: 0 } as const
const hex = (parts: { color: string; w: number }[]) => '#' + mix(parts).getHexString()
const cupsFor = (r: Round, i: number): FlatCup[] => (ROUNDS[r].together ? ROUNDS[r].orders : [ROUNDS[r].orders[i]]).map((order) => ({ order, fill: 0, color: '#ffffff', parts: [], cream: false }))

export function CafeFlat({ round: start, onRound, onDrink, onAllDone }: Props) {
  const [round, setRound] = useState(start)
  const [ix, setIx] = useState(0)
  const [cups, setCups] = useState<FlatCup[]>(() => cupsFor(start, 0))
  const [chunks, setChunks] = useState<Fruit[]>([])
  const [jar, setJar] = useState<{ level: number; color: string; parts: Fruit[] }>({ level: 0, color: '#ffffff', parts: [] })
  const [whirr, setWhirr] = useState(0)
  const [shelf, setShelf] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const open = cups

  const tap = (id: ItemId) => {
    if (done) return
    if (isFruit(id)) {
      if (chunks.length >= 5) return sfx.boing()
      sfx.plunk()
      return setChunks([...chunks, id])
    }
    const c = open.find((x) => (id === 'cream' ? !x.cream : x.fill > 0)) ?? open[0]
    if (!c) return
    if (id === 'milk') {
      sfx.trickle()
      return update(c, { fill: Math.min(1, c.fill + 0.3), color: hex([{ color: c.color, w: c.fill || 0.01 }, { color: '#ffffff', w: 0.3 }]) })
    }
    if (id === 'cream') {
      sfx.squirt()
      return update(c, { cream: true })
    }
    // The straw: served (whatever it is, they drink it happily).
    if (c.fill < 0.3) return sfx.squeak()
    sfx.slurp()
    onDrink()
    setTimeout(() => (c.order.want.every((f) => c.parts.includes(f)) ? sfx.yum() : sfx.aah()), 500)
    setShelf((s) => [...s, c.color])
    const rest = cups.filter((x) => x !== c)
    const def = ROUNDS[round]
    if (rest.length) return setCups(rest)
    if (!def.together && ix + 1 < def.orders.length) {
      setIx(ix + 1)
      return setCups(cupsFor(round, ix + 1))
    }
    sfx.cheer()
    if (round === 3) {
      setCups([])
      setDone(true)
      return onAllDone()
    }
    const next = (round + 1) as Round
    setRound(next)
    setIx(0)
    setCups(cupsFor(next, 0))
    onRound(next)
  }
  const update = (c: FlatCup, d: Partial<FlatCup>) => setCups((cs) => cs.map((x) => (x === c ? { ...x, ...d } : x)))

  const blend = () => {
    sfx.whirr(chunks.length ? 1.4 : 0.6)
    if (!chunks.length) return
    setWhirr((w) => w + 1)
    const color = hex([...(jar.level ? [{ color: jar.color, w: jar.level }] : []), ...chunks.map((f) => ({ color: JUICE[f].color, w: JUICE[f].vol }))])
    setJar({ level: Math.min(1, jar.level + chunks.reduce((a, f) => a + JUICE[f].vol, 0)), color, parts: [...new Set([...jar.parts, ...chunks])] })
    setChunks([])
  }
  const pour = () => {
    const c = open.find((x) => x.fill < 0.95)
    if (!c || jar.level <= 0) return sfx.boop()
    sfx.trickle()
    const amt = Math.min(1 - c.fill, jar.level / 0.4)
    update(c, { fill: c.fill + amt, color: hex([{ color: c.color, w: c.fill }, { color: jar.color, w: amt }]), parts: [...new Set([...c.parts, ...jar.parts, ...(c.order.ice ? (['ice'] as Fruit[]) : [])])] })
    setJar({ ...jar, level: Math.max(0, jar.level - amt * 0.4) })
  }
  const waiting: Partial<Record<Customer, FlatCup>> = Object.fromEntries(open.map((c) => [c.order.who, c]))

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#FFE3EF, #FFF7F0)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--top-clear)', paddingBottom: 16 }}>
      <div aria-label="Shelf" style={{ display: 'flex', gap: 8, minHeight: 40 }}>
        {shelf.map((c, i) => (
          <motion.span key={i} initial={{ y: 40, scale: 0 }} animate={{ y: 0, scale: 1 }} style={{ width: 26, height: 38, borderRadius: '6px 6px 10px 10px', background: c, border: '3px solid var(--lavender-dark)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(12px, 4vmin, 40px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <motion.button key={whirr} aria-label="Blender jar" onClick={pour} animate={{ rotate: whirr ? [0, -4, 4, -4, 4, 0] : 0 }} style={{ width: 'clamp(110px, 20vmin, 170px)', height: 'clamp(150px, 27vmin, 230px)', borderRadius: '14px 14px 30px 30px', border: '6px solid var(--lavender-dark)', background: 'rgba(228,246,255,.6)', position: 'relative', overflow: 'hidden', padding: 0 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${jar.level * 100}%`, background: jar.color, transition: 'height .6s' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexWrap: 'wrap-reverse', alignContent: 'flex-start', justifyContent: 'center', fontSize: 'clamp(26px, 4.5vmin, 40px)' }}>
              {chunks.map((f, i) => (
                <span key={i}>{ICONS[f]}</span>
              ))}
            </div>
          </motion.button>
          <motion.button aria-label="Blender button" whileTap={{ scale: 0.85 }} onClick={blend} style={{ width: 'clamp(76px, 12vmin, 100px)', height: 'clamp(76px, 12vmin, 100px)', borderRadius: '50%', border: '6px solid #fff', background: 'var(--hotpink)', boxShadow: 'var(--shadow)', padding: 0 }} />
        </div>
        {cups.map((c) => (
          <div key={c.order.who + ROUNDS[round].orders.indexOf(c.order)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 'clamp(110px, 19vmin, 160px)' }}>
            <div style={{ position: 'relative', height: 'clamp(56px, 9vmin, 80px)' }}>{waiting[c.order.who] === c && <div style={{ position: 'absolute', left: '50%', bottom: 0 }}><OrderBubble b={bubbleOf(c.order)} /></div>}</div>
            <div style={{ fontSize: 'clamp(40px, 7vmin, 60px)' }}>🦄</div>
            <div aria-label="Cup" style={{ width: 'clamp(60px, 10vmin, 90px)', height: 'clamp(84px, 14vmin, 126px)', borderRadius: '8px 8px 20px 20px', border: '5px solid var(--lavender-dark)', background: 'rgba(255,255,255,.7)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${c.fill * 100}%`, background: c.color, transition: 'height .5s' }} />
              {c.order.ice && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 26 }}>🧊</div>}
              {c.cream && <div style={{ position: 'absolute', top: -2, left: 0, right: 0, textAlign: 'center', fontSize: 30 }}>🍦</div>}
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {!done && (
          <motion.div aria-label="Tray" exit={{ y: 200 }} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(8px, 1.6vmin, 16px)', padding: '0 16px', maxWidth: 900 }}>
            {ROUNDS[round].tray.map((id) => (
              <motion.button key={id} aria-label={id} whileTap={{ scale: 0.85, rotate: -8 }} onClick={() => tap(id)} style={big}>
                {ICONS[id]}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function bubbleOf(o: Order) {
  if (!o.want.length) return { icons: ['🥤'], color: null }
  if (o.name === 'cha-yen') return { icons: ['🧋', ICONS.ice], color: hex([{ color: JUICE.tea.color, w: 2 }, { color: '#ffffff', w: 1 }]) }
  return { icons: o.want.map((f) => ICONS[f]), color: hex(o.want.map((f) => ({ color: JUICE[f].color, w: 1 }))) }
}

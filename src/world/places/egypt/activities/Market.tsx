// Miu's Market Stall: a Cairo market at dusk. Customers come to the counter and say "Ahlan!"; she makes what they ask for
// and they say "Shukran!" (thank you). 1: Jamal's koshari, built layer by layer in the order of the picture recipe
// (rice, lentils, pasta, sauce, crispy onions). 2: the fennec wants three extra pinches of onions (counting). 3: the hippo
// wants mint tea: press and hold to pour, let go at the gold line (too much just drips over, with a giggle).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Buddy, burst, DragArea, Draggable, DropZone, pick, say, shuffle, sounds, useAlive, wait, type Line, type PuppetHandle } from '../../../../sdk'
import { sfx } from '../../../kit/sfx'
import { Stage, WIGGLE } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { useLandscape } from '../../../kit/useLandscape'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'
import { Jamal } from '../puppets/Jamal'
import { Miu } from '../puppets/Miu'

type Food = 'rice' | 'lentils' | 'pasta' | 'sauce' | 'onions'
const RECIPE: Food[] = ['rice', 'lentils', 'pasta', 'sauce', 'onions']
const IMG: Record<Food, string> = { rice: art.rice, lentils: art.lentils, pasta: art.pasta, sauce: art.sauce, onions: art.onions }
const STEP_LINE: Record<Food, Line> = { rice: L.market.recipe, lentils: L.market.lentils, pasta: L.market.pasta, sauce: L.market.sauce, onions: L.market.onions }
// How each layer looks in the bowl: color and a little texture.
const LAYER: Record<Food, { color: string; dots?: string }> = {
  rice: { color: '#FFF3DC', dots: '#EAD9B8' },
  lentils: { color: '#B9794A', dots: '#8C5230' },
  pasta: { color: '#FFD86B', dots: '#E9B93A' },
  sauce: { color: '#F0584A', dots: '#C73A30' },
  onions: { color: '#C98A3E', dots: '#9A5E22' },
}
const PINCHES = 3
const GOLD = 0.8 // the gold line on the glass
const POUR_PER_S = 0.45

type Order = 'koshari' | 'onions' | 'tea'
const ORDERS: Order[] = ['koshari', 'onions', 'tea']

export function Market({ onDone, setProgress }: ActivityProps) {
  const [story, setStory] = useState(true)
  const [order, setOrder] = useState(0)
  const [arrived, setArrived] = useState(false)
  const customer = useRef<PuppetHandle>(null)
  const miu = useRef<PuppetHandle>(null)
  const alive = useAlive()
  const landscape = useLandscape()
  const kind = ORDERS[order]

  useEffect(() => setProgress(order, ORDERS.length), [order, setProgress])

  // Each customer walks up to the counter and orders.
  useEffect(() => {
    if (story) return
    setArrived(false)
    let cancelled = false
    void (async () => {
      await wait(700)
      if (cancelled || !alive()) return
      void customer.current?.play(kind === 'koshari' ? 'nod' : 'jump')
      await say(kind === 'koshari' ? L.market.order : kind === 'onions' ? L.market.extra : L.market.tea)
      if (!cancelled && alive()) setArrived(true)
    })()
    return () => {
      cancelled = true
    }
  }, [order, story])

  const served = async () => {
    sounds.correct()
    burst(landscape ? 0.3 : 0.5, 0.45)
    void customer.current?.play('cheer')
    void miu.current?.play('cheer')
    await say(kind === 'koshari' ? L.market.shukranJamal : kind === 'onions' ? L.market.shukranFennec : L.market.shukranHippo)
    if (!alive()) return
    if (kind === 'koshari') {
      await say(L.market.shukran)
      if (!alive()) return
    }
    await wait(500)
    if (!alive()) return
    if (order + 1 < ORDERS.length) setOrder(order + 1)
    else {
      void miu.current?.play('dance')
      await say(L.market.yum)
      await wait(300)
      if (alive()) onDone()
    }
  }

  if (story) return <StoryBeat lines={[L.market.story]} friend={<Miu height="100%" />} bg={art.bgMarket} onDone={() => setStory(false)} />

  const who = kind === 'koshari' ? <Jamal ref={customer} height="100%" /> : <Buddy ref={customer} img={kind === 'onions' ? art.fennec : art.hippo} voice={kind === 'onions' ? 'fennec' : 'hippo'} height="100%" />
  return (
    <Stage bg={art.bgMarket} style={{ backgroundPosition: 'center bottom' }}>
      <MarketLife />
      <div style={{ position: 'absolute', inset: 0, containerType: 'size' }}>
        {/* The customer behind the counter on the left, Miu the stall keeper on the right. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={order}
            initial={{ x: '-60cqw' }}
            animate={{ x: 0 }}
            exit={{ x: '-60cqw' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ position: 'absolute', left: landscape ? '3%' : '2%', bottom: landscape ? '20cqh' : '24cqh', height: landscape ? '46cqh' : '26cqh', zIndex: 1 }}
          >
            <button aria-label="Customer" onClick={() => void customer.current?.play('wiggle')} style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}>
              {who}
            </button>
          </motion.div>
        </AnimatePresence>
        <button aria-label="Miu" onClick={() => (void miu.current?.play('purr'), void say(pick(L.tickle.miu)))} style={{ position: 'absolute', right: '3%', bottom: landscape ? '20cqh' : '24cqh', height: landscape ? '32cqh' : '18cqh', zIndex: 1 }}>
          <Miu ref={miu} height="100%" />
        </button>
        {arrived && kind === 'koshari' && <Koshari key="k" onServed={() => void served()} />}
        {arrived && kind === 'onions' && <ExtraOnions key="o" onServed={() => void served()} />}
        {arrived && kind === 'tea' && <Tea key="t" onServed={() => void served()} />}
      </div>
    </Stage>
  )
}

/** Hanging lanterns sway and glow. */
function MarketLife() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {[22, 50, 78].map((x, i) => (
        <motion.img
          key={x}
          src={art.lantern}
          alt=""
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2.6 + i * 0.4, ease: 'easeInOut' }}
          style={{ position: 'absolute', left: `${x}%`, top: -4, height: 'min(15vh, 12vw)', translate: '-50% 0', transformOrigin: '50% 0', filter: 'drop-shadow(0 0 14px rgba(255, 210, 110, 0.9))' }}
        />
      ))}
    </div>
  )
}

/** The counter area: the thing being made in the middle, with a tray or picture card above it. */
function Counter({ top, children }: { top?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '2cqh', paddingBottom: '2cqh', zIndex: 2 }}>
      {top}
      {children}
    </div>
  )
}

/** The bowl with its layers: each food is a mound that sits on the one below. */
function Bowl({ layers, size }: { layers: Food[]; size: string }) {
  return (
    <div style={{ position: 'relative', width: size, aspectRatio: '1.25' }}>
      <div style={{ position: 'absolute', left: '10%', right: '10%', bottom: '50%', height: '60%', display: 'flex', flexDirection: 'column-reverse', alignItems: 'center' }}>
        <AnimatePresence>
          {layers.map((f, i) => (
            <motion.div
              key={`${f}${i}`}
              initial={{ y: -60, scale: 0.6, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.45 }}
              style={{
                width: `${100 - i * 11}%`,
                height: f === 'sauce' ? '14%' : '20%',
                marginTop: '-5%',
                borderRadius: '50% 50% 20% 20% / 90% 90% 20% 20%',
                background: LAYER[f].dots ? `radial-gradient(circle at 30% 40%, ${LAYER[f].dots} 0 6%, transparent 7%), radial-gradient(circle at 70% 60%, ${LAYER[f].dots} 0 5%, transparent 6%), radial-gradient(circle at 50% 30%, ${LAYER[f].dots} 0 5%, transparent 6%), ${LAYER[f].color}` : LAYER[f].color,
                border: '3px solid #3A2A33',
                position: 'relative',
                zIndex: i,
              }}
            />
          ))}
        </AnimatePresence>
      </div>
      <img src={art.koshariBowl} alt="" draggable={false} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom', clipPath: 'inset(46% 0 0 0)', zIndex: 10 }} />
    </div>
  )
}

function Koshari({ onServed }: { onServed: () => void }) {
  const [layers, setLayers] = useState<Food[]>([])
  const [wiggle, setWiggle] = useState<Food | null>(null)
  const [help, setHelp] = useState(false)
  const [shelf] = useState(() => shuffle(RECIPE))
  const busy = useRef(false)
  const alive = useAlive()
  const landscape = useLandscape()
  const next = RECIPE[layers.length]

  useEffect(() => {
    if (next) void say(STEP_LINE[next])
  }, [next])

  const add = async (f: Food) => {
    if (busy.current || !next) return false
    if (f !== next) {
      sounds.oops()
      setWiggle(f)
      setHelp(true)
      setTimeout(() => setWiggle(null), 500)
      void say(L.market.wrong)
      return false
    }
    const n = [...layers, f]
    setLayers(n)
    setHelp(false)
    sfx.fwip()
    sounds.note(n.length * 2)
    if (n.length === RECIPE.length) {
      busy.current = true
      await wait(500)
      if (alive()) onServed()
    }
    return true
  }

  const size = landscape ? 'min(34cqh, 26cqw)' : 'min(22cqh, 42cqw)'
  const item = landscape ? 'min(15cqh, 11cqw)' : 'min(10cqh, 17cqw)'
  return (
    <Counter
      top={
        // The picture recipe: done steps get a tick, the next one glows.
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFF7F0', borderRadius: 22, padding: '6px 12px', border: '4px solid #C99B6A', boxShadow: 'var(--shadow)', marginBottom: 'auto', marginTop: '1cqh' }}>
          {RECIPE.map((f, i) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <motion.div animate={help && f === next ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 0.9 }} style={{ position: 'relative', width: `calc(${item} * 0.62)`, height: `calc(${item} * 0.62)`, borderRadius: 12, background: f === next ? 'rgba(255, 200, 61, 0.45)' : 'transparent' }}>
                <img src={IMG[f]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: i < layers.length ? 0.45 : 1 }} />
                {i < layers.length && <span style={{ position: 'absolute', right: -6, bottom: -6, fontSize: `calc(${item} * 0.3)` }}>✅</span>}
              </motion.div>
              {i < RECIPE.length - 1 && <span style={{ fontSize: `calc(${item} * 0.22)`, color: '#C99B6A', fontWeight: 700 }}>▶</span>}
            </div>
          ))}
        </div>
      }
    >
      <DragArea style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2cqh' }}>
        <DropZone id="bowl">
          <Bowl layers={layers} size={size} />
        </DropZone>
        <div style={{ display: 'flex', gap: 'min(12px, 2cqw)', background: 'rgba(255,247,240,0.7)', borderRadius: 28, padding: 8 }}>
          {shelf
            .filter((f) => !layers.includes(f))
            .map((f) => (
              <motion.div key={f} animate={wiggle === f ? WIGGLE : {}}>
                <Draggable onDrop={(zone) => (zone === 'bowl' ? void add(f) : false)} onTap={() => void add(f)}>
                  <div role="button" aria-label={f} className={help && f === next ? 'world-glow' : undefined} style={{ width: item, height: item, minWidth: 'var(--target)', minHeight: 'var(--target)', borderRadius: 24, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow)' }}>
                    <img src={IMG[f]} alt="" draggable={false} style={{ width: '84%', height: '84%', objectFit: 'contain' }} />
                  </div>
                </Draggable>
              </motion.div>
            ))}
        </div>
      </DragArea>
    </Counter>
  )
}

function ExtraOnions({ onServed }: { onServed: () => void }) {
  const [pinches, setPinches] = useState(0)
  const busy = useRef(false)
  const alive = useAlive()
  const landscape = useLandscape()

  useEffect(() => void say(L.market.pinch), [])

  const add = async () => {
    if (busy.current || pinches >= PINCHES) return
    busy.current = true
    const n = pinches + 1
    setPinches(n)
    sfx.fwip()
    sounds.note(n * 2)
    await say(L.market.count[n - 1])
    busy.current = false
    if (n === PINCHES && alive()) onServed()
  }

  const size = landscape ? 'min(34cqh, 26cqw)' : 'min(22cqh, 42cqw)'
  const item = landscape ? 'min(20cqh, 15cqw)' : 'min(13cqh, 24cqw)'
  return (
    <Counter>
      <DragArea style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2cqh' }}>
        <div style={{ position: 'relative' }}>
          <DropZone id="bowl">
            <Bowl layers={[...RECIPE, ...Array.from({ length: pinches }, () => 'onions' as Food)]} size={size} />
          </DropZone>
          <div style={{ position: 'absolute', right: '-18%', top: 0, fontSize: `calc(${size} * 0.3)`, fontWeight: 700, color: 'var(--hotpink)', textShadow: '0 4px 0 #fff' }}>
            <AnimatePresence mode="popLayout">
              {pinches > 0 && (
                <motion.span key={pinches} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: 'inline-block' }}>
                  {pinches}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        <Draggable onDrop={(zone) => (zone === 'bowl' ? void add() : false)} onTap={() => void add()}>
          <div role="button" aria-label="onions" className="world-glow" style={{ width: item, height: item, borderRadius: 28, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow)' }}>
            <img src={art.onions} alt="" draggable={false} style={{ width: '86%', height: '86%', objectFit: 'contain' }} />
          </div>
        </Draggable>
      </DragArea>
    </Counter>
  )
}

function Tea({ onServed }: { onServed: () => void }) {
  const [fill, setFill] = useState(0)
  const [pouring, setPouring] = useState(false)
  const [spill, setSpill] = useState(false)
  const fillRef = useRef(0)
  const done = useRef(false)
  const alive = useAlive()
  const landscape = useLandscape()

  useEffect(() => void say(L.market.pour), [])

  // While she holds, the tea rises.
  useEffect(() => {
    if (!pouring) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      fillRef.current = Math.min(1.08, fillRef.current + POUR_PER_S * dt)
      setFill(fillRef.current)
      if (fillRef.current >= 1.08) stop()
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pouring])

  const stop = async () => {
    setPouring(false)
    if (done.current || fillRef.current < GOLD - 0.12) return
    done.current = true
    if (fillRef.current > GOLD + 0.1) {
      // A little too much: it drips over the side, then settles at the line.
      setSpill(true)
      sfx.splash()
      await say(L.market.whoops)
      if (!alive()) return
      fillRef.current = GOLD
      setFill(GOLD)
      setSpill(false)
    } else sounds.sparkle()
    await wait(300)
    if (alive()) onServed()
  }

  const glassH = landscape ? 'min(30cqh, 22cqw)' : 'min(20cqh, 34cqw)'
  const level = Math.min(1, fill)
  return (
    <Counter>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2cqw' }}>
        {/* The teapot: press and hold it to pour. */}
        <motion.button
          aria-label="Pour the tea"
          className={fill === 0 ? 'world-glow' : undefined}
          onPointerDown={(e) => {
            if (done.current) return
            ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
            setPouring(true)
          }}
          onPointerUp={() => pouring && void stop()}
          onPointerCancel={() => pouring && void stop()}
          onContextMenu={(e) => e.preventDefault()}
          animate={{ rotate: pouring ? 32 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          style={{ position: 'relative', height: `calc(${glassH} * 1.2)`, aspectRatio: '1', borderRadius: 32, marginBottom: `calc(${glassH} * 0.5)`, touchAction: 'none', transformOrigin: '30% 70%', WebkitUserSelect: 'none', userSelect: 'none' }}
        >
          <img src={art.teapot} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
        </motion.button>
        {/* The glass, with its gold line. */}
        <div style={{ position: 'relative', height: glassH, aspectRatio: '0.62' }}>
          {pouring && <div style={{ position: 'absolute', left: '22%', width: 8, bottom: `${level * 86}%`, top: '-40%', background: '#D98E3A', borderRadius: 4, opacity: 0.9 }} />}
          <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 0, 100% 0, 88% 100%, 12% 100%)', background: 'rgba(220, 240, 255, 0.55)', border: '4px solid #3A2A33', borderTop: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${level * 100}%`, background: 'linear-gradient(#E7A04A, #C9782E)' }}>
              <div style={{ position: 'absolute', left: '30%', top: '10%', fontSize: `calc(${glassH} * 0.16)` }}>🌿</div>
            </div>
          </div>
          <svg viewBox="0 0 62 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
            <path d="M0 0 L7 100 H55 L62 0" fill="none" stroke="#3A2A33" strokeWidth="4" vectorEffect="non-scaling-stroke" />
            <line x1={-6} x2={68} y1={100 - GOLD * 100} y2={100 - GOLD * 100} stroke="var(--gold)" strokeWidth="5" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
          </svg>
          {spill &&
            [0, 1, 2].map((i) => (
              <motion.div key={i} initial={{ y: 0, opacity: 1 }} animate={{ y: 60, opacity: 0 }} transition={{ duration: 0.8, delay: i * 0.15 }} style={{ position: 'absolute', left: i % 2 ? '-8%' : '96%', top: '2%', width: 12, height: 16, borderRadius: '50%', background: '#D98E3A' }} />
            ))}
        </div>
      </div>
    </Counter>
  )
}

// The granita stand on the beach (Snow on a Volcano's side verb, then the payoff).
// Three friends are melting behind the counter: Lupa, Marina the monk seal and Nonna Tina the tortoise. Kaylee picks a
// cup (any order), taps the snow in Nino's cart to scoop it in (each friend wants a different number of scoops: one,
// two, three; extra scoops make a silly snow mountain, never a mistake), then presses and holds a lemon or an orange
// to squeeze it over the snow (her choice). The friend eats it: brain freeze, giggles, cool at last.
// Then the history line (donkeys really carried Etna's snow down for granita), and Nino's piano for Lupa's band: tap
// the keys to play.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Buddy, burst, say, sounds, SparklePuppet, type Line, type PuppetHandle } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { art as italyArt } from '../../art'
import { L as LINES } from '../../lines'
import { INK } from '../../puppets/ink'
import { Lupa } from '../../puppets/Lupa'
import { Nino } from '../../puppets/Nino'
import { ASPECT, etnaArt } from './art'
import { CART, CartArt, type Fruit } from './Cart'
import { esfx } from './sfx'

const E = LINES.etna
const FRIENDS = ['lupa', 'marina', 'tortoise'] as const
type FriendId = (typeof FRIENDS)[number]
const ORDER: Record<FriendId, number> = { lupa: 1, marina: 2, tortoise: 3 }
const MAX_SCOOPS = 5
const FLAVOR: Record<Fruit, string> = { lemon: '#FFE27A', orange: '#FFB25B' }

/** Logical stages (units); everything is laid out in them and scaled to fit under the top bar. */
const WIDE = {
  w: 1400,
  h: 760,
  stand: { x: 720, bottom: 640, h: 560 },
  friendX: [-200, 0, 200],
  cart: { x: 320, y: 740 },
  nino: { x: 95, y: 740 },
  fruit: { lemon: [1170, 660], orange: [1310, 660] },
  piano: { x: 720, y: 650 },
} as const
const TALL = {
  w: 900,
  h: 1120,
  stand: { x: 450, bottom: 620, h: 560 },
  friendX: [-205, 0, 205],
  cart: { x: 330, y: 1000 },
  nino: { x: 100, y: 1000 },
  fruit: { lemon: [610, 930], orange: [770, 930] },
  piano: { x: 450, y: 840 },
} as const
type Layout = typeof WIDE | typeof TALL

type CupState = { scoops: number; fruit: Fruit | null; k: number; served: boolean }

const mixHex = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`
}

export function Granita({ fruit: picked, onStar, onDone }: { fruit: Fruit[]; onStar: (n: number) => void; onDone: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ W: 1180, H: 820 })
  useEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setSize({ W: el.clientWidth, H: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const P: Layout = size.W >= size.H ? WIDE : TALL
  const topClear = size.H < 560 ? 64 : 110
  const s = Math.min(size.W / P.w, (size.H - topClear - 8) / P.h)

  const [cups, setCups] = useState<CupState[]>(() => FRIENDS.map(() => ({ scoops: 0, fruit: null, k: 0, served: false })))
  const cupsRef = useRef(cups)
  cupsRef.current = cups
  const [sel, setSel] = useState<number | null>(null)
  const [squeezing, setSqueezing] = useState<Fruit | null>(null)
  const [eating, setEating] = useState<number | null>(null)
  const [scoopFly, setScoopFly] = useState<{ id: number; to: number }[]>([])
  const [payoff, setPayoff] = useState(() => !!(window as unknown as { __etnaPayoff?: boolean }).__etnaPayoff)
  const [keysPlayed, setKeysPlayed] = useState(0)
  const friendRefs = useRef<(PuppetHandle | null)[]>([])
  const ninoRef = useRef<PuppetHandle>(null)
  const sparkleRef = useRef<PuppetHandle>(null)
  const wheel = useRef<SVGGElement>(null)
  const said = useRef(new Set<string>())
  const nextId = useRef(1)
  const hold = useRef<{ fruit: Fruit; cup: number; raf: number; last: number; drip: number } | null>(null)

  const talk = (line: Line) => void say(line, { interrupt: false })
  const once = (key: string, line: Line) => {
    if (said.current.has(key)) return
    said.current.add(key)
    talk(line)
  }

  useEffect(() => {
    if (payoff) return startPayoff()
    talk(E.granita)
    talk(E.tapCup)
  }, [])

  const choose = (i: number) => {
    const c = cupsRef.current[i]
    if (c.served || eating !== null || squeezing) return
    sounds.pop()
    setSel(i)
    void friendRefs.current[i]?.play(i === 0 ? 'hop' : 'jump')
    void say(E.order[FRIENDS[i]])
  }
  const tapSnow = () => {
    if (eating !== null || squeezing) return
    let i = sel
    if (i === null || cupsRef.current[i].served) {
      // No cup picked yet: the first friend still waiting (she never gets "wrong").
      i = cupsRef.current.findIndex((c) => !c.served)
      if (i < 0) return
      setSel(i)
      void say(E.order[FRIENDS[i]])
    }
    const c = cupsRef.current[i]
    if (c.scoops >= MAX_SCOOPS) {
      esfx.crunch()
      return
    }
    esfx.scoop()
    void ninoRef.current?.play('nod')
    const id = nextId.current++
    const n = c.scoops + 1
    setScoopFly((f) => [...f, { id, to: i! }])
    setTimeout(() => {
      setCups((cs) => cs.map((x, j) => (j === i ? { ...x, scoops: n } : x)))
      esfx.pomf()
    }, 520)
    const want = ORDER[FRIENDS[i]]
    if (n <= want) talk(E.count[n - 1])
    if (n === want) {
      setTimeout(() => once('squeeze', E.squeeze), 300)
    } else if (n > want && n === want + 1) once(`more${i}`, E.more[FRIENDS[i]])
  }

  const startSqueeze = (f: Fruit) => {
    if (eating !== null || hold.current) return
    const i = sel !== null && !cupsRef.current[sel].served ? sel : cupsRef.current.findIndex((c) => !c.served && c.scoops > 0)
    if (i < 0 || cupsRef.current[i].scoops === 0) {
      sfx.boing()
      once('tapSnowHint', E.tapSnow)
      return
    }
    setSel(i)
    setSqueezing(f)
    esfx.squish()
    const h = { fruit: f, cup: i, raf: 0, last: performance.now(), drip: 0 }
    hold.current = h
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - h.last) / 1000)
      h.last = now
      h.drip -= dt
      if (h.drip < 0) {
        h.drip = 0.22
        esfx.drip()
      }
      let k = 0
      setCups((cs) =>
        cs.map((x, j) => {
          if (j !== i) return x
          k = Math.min(1, (x.fruit === f ? x.k : x.fruit ? x.k * 0.5 : 0) + dt / 1.3)
          return { ...x, fruit: f, k }
        }),
      )
      if (cupsRef.current[i].k >= 1) return void endSqueeze()
      h.raf = requestAnimationFrame(step)
    }
    h.raf = requestAnimationFrame(step)
  }
  const endSqueeze = () => {
    const h = hold.current
    if (!h) return
    cancelAnimationFrame(h.raf)
    hold.current = null
    setSqueezing(null)
    const i = h.cup
    if (cupsRef.current[i].k >= 0.3) serve(i)
    else once('hold', E.hold)
  }
  const serve = (i: number) => {
    setEating(i)
    sounds.correct()
    const id = FRIENDS[i]
    setTimeout(() => {
      esfx.crunch()
      void friendRefs.current[i]?.play(i === 0 ? 'shake' : 'wiggle')
      talk(E.eat[id])
    }, 700)
    setTimeout(() => {
      void friendRefs.current[i]?.play(i === 0 ? 'cheer' : 'cheer')
      const r = box.current?.getBoundingClientRect()
      if (r) burst(0.5 + (P.friendX[i] * s) / r.width, 0.42)
      setCups((cs) => cs.map((x, j) => (j === i ? { ...x, served: true } : x)))
      setEating(null)
      setSel(null)
      const n = cupsRef.current.filter((c) => c.served).length + 1
      onStar(n)
      if (n >= FRIENDS.length) {
        talk(E.history)
        setTimeout(startPayoff, 2600)
      }
    }, 2200)
  }

  function startPayoff() {
    setPayoff(true)
    setTimeout(() => {
      void ninoRef.current?.play('bray')
      sounds.fanfare()
      talk(E.piano)
      talk(E.tapPiano)
    }, 600)
  }
  const playKey = (k: number) => {
    sounds.note(k)
    void sparkleRef.current?.play(k % 2 ? 'dance' : 'hop')
    friendRefs.current.forEach((f, i) => (k + i) % 3 === 0 && void f?.play(i === 0 ? 'howl' : 'dance'))
    const n = keysPlayed + 1
    setKeysPlayed(n)
    if (n === 1) talk(E.pianoFact)
    if (n === 8) {
      talk(E.band)
      setTimeout(onDone, 3500)
    }
  }
  // If she stops playing, the stamp still comes.
  useEffect(() => {
    if (!payoff) return
    const t = setTimeout(() => {
      if (keysPlayed < 8) {
        talk(E.band)
        setTimeout(onDone, 3500)
      }
    }, 20000)
    return () => clearTimeout(t)
  }, [payoff])

  const st = P.stand
  const standW = st.h * ASPECT.stand
  const standTop = st.bottom - st.h
  const shelfY = standTop + st.h * 0.565
  const friendFeet = standTop + st.h * 0.56
  const glowCups = sel === null && eating === null && !payoff
  const ready = sel !== null && cups[sel].scoops >= ORDER[FRIENDS[sel]] && !cups[sel].served
  const abs = (x: number, y: number, w: number, h: number): CSSProperties => ({ position: 'absolute', left: x, top: y, width: w, height: h })

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, zIndex: 20, overflow: 'hidden', background: 'linear-gradient(#9FD8F2 0 50%, #6EC3E6 50% 63%, #F6DFA8 63%)', touchAction: 'none' }} onPointerUp={endSqueeze} onPointerCancel={endSqueeze}>
      <div style={{ position: 'absolute', left: (size.W - P.w * s) / 2, top: topClear + (size.H - topClear - P.h * s) / 2, width: P.w, height: P.h, transform: `scale(${s})`, transformOrigin: '0 0' }}>
        {/* The stand, the friends behind its counter, then the counter again in front of them. */}
        <img src={etnaArt.stand} alt="" draggable={false} style={{ ...abs(st.x - standW / 2, standTop, standW, st.h), pointerEvents: 'none' }} />
        {FRIENDS.map((id, i) => {
          const h = id === 'lupa' ? 250 : id === 'marina' ? 200 : 120
          return (
            <button key={id} aria-label={id} onClick={() => choose(i)} style={{ ...abs(st.x + P.friendX[i] - h * 0.62, friendFeet - h, h * 1.24, h), padding: 0, border: 'none', background: 'none', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
              {id === 'lupa' ? <Lupa ref={(r) => void (friendRefs.current[i] = r)} height="100%" /> : <Buddy ref={(r) => void (friendRefs.current[i] = r)} img={id === 'marina' ? etnaArt.seal : italyArt.tortoise} voice={id} height="100%" flip={id === 'tortoise'} />}
            </button>
          )
        })}
        <img src={etnaArt.stand} alt="" draggable={false} style={{ ...abs(st.x - standW / 2, standTop, standW, st.h), clipPath: 'inset(54% 0 0 0)', pointerEvents: 'none' }} />
        {/* The cups on the counter, one per friend. */}
        {FRIENDS.map((id, i) => {
          const c = cups[i]
          const cx = st.x + P.friendX[i]
          return (
            <motion.button
              key={id}
              aria-label={`${id} cup`}
              className={glowCups && !c.served ? 'world-glow' : undefined}
              onClick={() => choose(i)}
              animate={eating === i ? { y: -170, scale: 0.6, opacity: 0 } : c.served ? { opacity: 0.0, y: 0, scale: 1 } : { y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: eating === i ? 0.6 : 0.3, delay: eating === i ? 0.2 : 0 }}
              style={{ ...abs(cx - 70, shelfY - 160, 140, 176), padding: '0 20px 10px', border: 'none', background: 'none', borderRadius: 24, boxShadow: sel === i ? '0 0 0 7px #FFC83D' : undefined }}
            >
              <Cup scoops={c.scoops} color={c.fruit ? mixHex('#F4F8FF', FLAVOR[c.fruit], c.k) : '#F4F8FF'} />
            </motion.button>
          )
        })}
        {/* How many scoops the chosen friend wants: that many snowballs in a bubble above the cup. */}
        <AnimatePresence>
          {sel !== null && !cups[sel].served && eating === null && (
            <motion.div key={sel} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ position: 'absolute', left: st.x + P.friendX[sel] - 80, top: shelfY + 46, width: 160, zIndex: 4, display: 'flex', justifyContent: 'center', gap: 8, padding: '10px 12px', background: '#FFF7F0', border: `5px solid ${INK}`, borderRadius: 30, pointerEvents: 'none' }}>
              {Array.from({ length: ORDER[FRIENDS[sel]] }, (_, k) => (
                <div key={k} style={{ width: 30, height: 30, borderRadius: '50%', background: k < cups[sel].scoops ? '#EEF5FF' : 'transparent', border: `4px ${k < cups[sel].scoops ? 'solid' : 'dashed'} ${INK}` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Nino and his cart full of Etna snow (tap the snow to scoop). */}
        <div style={{ position: 'absolute', left: P.nino.x, top: P.nino.y, zIndex: 2 }}>
          <div style={{ position: 'absolute', left: -88, top: -186, width: 192, height: 190 }}>
            <Nino ref={ninoRef} height="100%" onTap={() => (void ninoRef.current?.play('giggle'), sfx.chirp())} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: P.cart.x, top: P.cart.y, zIndex: 1 }}>
          <div style={{ transform: 'scaleX(-1)' }}>
            <CartArt wheelRef={wheel} hitch={[P.cart.x - P.nino.x - 34, -60]} fruit={picked} snow={payoff ? 0 : Math.max(1, Math.ceil(5 - cups.reduce((n, c) => n + c.scoops, 0) / 2))} piano={payoff} rider={
              <div style={{ position: 'absolute', left: -42, top: -CART.floor - 55 - 96, height: 96 }}>
                <SparklePuppet ref={sparkleRef} height="96px" lookToward={0.5} />
              </div>
            } />
          </div>
          {!payoff && (
            <motion.button
              aria-label="snow in the cart"
              className={ready || eating !== null ? undefined : 'world-glow'}
              whileTap={{ scale: 0.92 }}
              onClick={tapSnow}
              style={{ position: 'absolute', left: -CART.w / 2 + 10, top: -CART.floor - 210, width: CART.w - 20, height: 150, padding: 0, border: 'none', background: 'none', borderRadius: '50% 50% 20px 20px' }}
            />
          )}
        </div>
        {/* Scoops of snow flying from the cart to the cup. */}
        {scoopFly.map((f) => {
          const to = [st.x + P.friendX[f.to], shelfY - 90] as const
          const from = [P.cart.x, P.cart.y - CART.floor - 120] as const
          return (
            <motion.div
              key={f.id}
              initial={{ x: from[0], y: from[1] }}
              animate={{ x: [from[0], (from[0] + to[0]) / 2, to[0]], y: [from[1], Math.min(from[1], to[1]) - 140, to[1]] }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              onAnimationComplete={() => setScoopFly((l) => l.filter((x) => x.id !== f.id))}
              style={{ position: 'absolute', left: -26, top: -26, width: 52, height: 52, borderRadius: '50%', background: '#EEF5FF', border: `5px solid ${INK}`, pointerEvents: 'none', zIndex: 5 }}
            />
          )
        })}
        {/* The fruit: press and hold to squeeze it over the cup. */}
        {!payoff && (['lemon', 'orange'] as const).map((f) => {
          const [fx, fy] = P.fruit[f]
          const over = squeezing === f && sel !== null
          const tx = over ? st.x + P.friendX[sel!] : fx
          const ty = over ? shelfY - 250 : fy
          return (
            <motion.button
              key={f}
              aria-label={f}
              className={ready && !squeezing ? 'world-glow' : undefined}
              onPointerDown={(e) => {
                ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
                startSqueeze(f)
              }}
              animate={{ x: tx - fx, y: ty - fy, scaleX: over ? [1, 1.18, 1] : 1, scaleY: over ? [1, 0.78, 1] : 1, rotate: over ? 90 : 0 }}
              transition={over ? { x: { duration: 0.25 }, y: { duration: 0.25 }, rotate: { duration: 0.25 }, scaleX: { repeat: Infinity, duration: 0.35 }, scaleY: { repeat: Infinity, duration: 0.35 } } : { duration: 0.3 }}
              style={{ ...abs(fx - 85, fy - 85, 170, 170), padding: 0, border: 'none', background: 'none', borderRadius: '50%', zIndex: 6, touchAction: 'none' }}
            >
              <img src={f === 'lemon' ? etnaArt.lemon : etnaArt.orange} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
              {over && (
                <motion.div animate={{ y: [0, 120], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} style={{ position: 'absolute', left: 64, top: 120, width: 18, height: 26, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: FLAVOR[f], border: `3px solid ${INK}` }} />
              )}
            </motion.button>
          )
        })}
        {/* Payoff: Nino's toy piano. Tap the keys. */}
        <AnimatePresence>
          {payoff && (
            <motion.div initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }} style={{ position: 'absolute', left: P.piano.x - 330, top: P.piano.y - 230, width: 660, height: 230, zIndex: 8 }}>
              <div style={{ position: 'absolute', inset: 0, background: '#E8574F', border: `6px solid ${INK}`, borderRadius: 26 }} />
              <div style={{ position: 'absolute', left: 24, right: 24, top: 70, bottom: 24, display: 'flex', gap: 6 }}>
                {Array.from({ length: 8 }, (_, k) => (
                  <motion.button key={k} aria-label={`piano key ${k + 1}`} whileTap={{ y: 8, backgroundColor: '#FFE27A' }} onClick={() => playKey(k)} style={{ flex: 1, background: '#FFF7F0', border: `5px solid ${INK}`, borderRadius: '0 0 16px 16px', padding: 0 }} />
                ))}
              </div>
              {[0, 1, 3, 4, 5].map((k) => (
                <div key={k} style={{ position: 'absolute', left: 24 + ((k + 1) * 612) / 8 - 22, top: 70, width: 40, height: 80, background: INK, borderRadius: '0 0 10px 10px', pointerEvents: 'none' }} />
              ))}
              <div style={{ position: 'absolute', left: 40, top: 16, right: 40, height: 34, background: '#FFC83D', border: `5px solid ${INK}`, borderRadius: 14 }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** A glass of granita, side view: snow piles up in scoops, and takes the fruit's color as she squeezes. */
function Cup({ scoops, color }: { scoops: number; color: string }) {
  const n = Math.min(MAX_SCOOPS, scoops)
  return (
    <svg viewBox="0 0 120 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      {Array.from({ length: n }, (_, k) => {
        const row = k < 2 ? 0 : k < 4 ? 1 : 2
        const col = k < 2 ? k : k < 4 ? k - 2 : 0.5
        const cx = row === 2 ? 60 : 40 + col * 40 - (row === 1 ? 0 : 0)
        const cy = 78 - row * 30
        return <circle key={k} cx={n === 1 ? 60 : cx} cy={cy} r={26} fill={color} stroke={INK} strokeWidth="5" />
      })}
      <path d="M14 70 L106 70 L94 150 C92 156 88 158 82 158 L38 158 C32 158 28 156 26 150Z" fill="#DDEFFF" stroke={INK} strokeWidth="5" strokeLinejoin="round" opacity="0.92" />
      {n > 0 && <path d="M20 84 L100 84 L92 146 L28 146Z" fill={color} opacity="0.9" />}
      <path d="M30 80 L36 140" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

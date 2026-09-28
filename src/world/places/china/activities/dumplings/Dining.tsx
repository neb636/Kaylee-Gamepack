// The dining room, in layers: the generated back wall (big window, Pearl Tower), then each customer sitting BEHIND their
// table, then the tables and stools drawn in code in front of them. Landscape: three tables in a row. Portrait: one in
// front, two behind. She carries baskets from the tray (top) to the right table.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Buddy, burst, Piece, PlayArea, say, sounds, Target, useAlive, useLandscape, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { sfx } from '../../../../kit/sfx'
import { art } from '../../art'
import { L } from '../../lines'
import { Cup, Steamer, Stool, Table } from '../../props'
import { DouDou } from '../../puppets/DouDou'
import { Dumpling } from '../../puppets/Dumpling'
import { WordCard } from '../../WordCard'
import { BasketDumplings, type Basket } from './cook'
import { tickle, useWord } from './shared'

const D = L.dumplings
export type Seat = 'left' | 'center' | 'right'
export type Guest = 'grandpa' | 'bunnies' | 'goose' | 'baobao'

export const GUESTS: Record<Guest, { img: string; voice: string; aspect: number; tickle: Line[]; notMine: Line; yum?: Line }> = {
  grandpa: { img: art.grandpa, voice: 'grandpa', aspect: 373 / 512, tickle: D.tickle.grandpa, notMine: D.notMine[0] },
  goose: { img: art.goose, voice: 'goose', aspect: 324 / 512, tickle: D.tickle.goose, notMine: D.notMine[1], yum: D.gooseYum },
  bunnies: { img: art.bunnies, voice: 'bunnies', aspect: 496 / 512, tickle: D.tickle.bunnies, notMine: D.notMine[2], yum: D.bunniesYum },
  baobao: { img: art.baobao, voice: 'baobao', aspect: 1, tickle: D.tickle.baobao, notMine: D.notMine[2], yum: D.baoYum },
}

/** Where each table stands, from the screen shape: x (0..1), bottom and table width (CSS). */
function seats(landscape: boolean): Record<Seat, { x: number; bottom: string; w: string; z: number }> {
  if (landscape) {
    const w = 'min(29vw, 48vh)'
    return { left: { x: 0.18, bottom: '3vh', w, z: 2 }, center: { x: 0.5, bottom: '3vh', w, z: 2 }, right: { x: 0.82, bottom: '3vh', w, z: 2 } }
  }
  const back = 'min(42vw, 27vh)'
  return { left: { x: 0.26, bottom: '31vh', w: back, z: 1 }, right: { x: 0.74, bottom: '31vh', w: back, z: 1 }, center: { x: 0.5, bottom: '1vh', w: 'min(68vw, 42vh)', z: 3 } }
}

export interface DiningProps {
  guests: Partial<Record<Seat, Guest>>
  /** Baskets already on tables (steaming). */
  served?: Partial<Record<Seat, Basket>>
  prompt?: Line
  /** Extra things drawn on each table's lazy Susan. */
  onTable?: Partial<Record<Seat, ReactNode>>
  /** Tap a table (the tea tap). */
  onTableTap?: (seat: Seat) => void
  /** Baskets on the carry tray: each goes to one seat. */
  tray?: { basket: Basket; seat: Seat }[]
  onServe?: (basket: Basket, seat: Seat) => void
  refs?: Partial<Record<Seat, RefObject<PuppetHandle | null>>>
  children?: ReactNode
  word?: ReturnType<typeof useWord>[0]
}

export function DiningRoom({ guests, served = {}, prompt, onTable = {}, onTableTap, tray = [], onServe, refs = {}, children, word }: DiningProps) {
  const landscape = useLandscape()
  const layout = seats(landscape)
  const [hint, setHint] = useState<Seat | null>(null)
  const [shake, setShake] = useState<Seat | null>(null)
  const own = { left: useRef<PuppetHandle>(null), center: useRef<PuppetHandle>(null), right: useRef<PuppetHandle>(null) }
  const ref = (s: Seat) => refs[s] ?? own[s]

  const drop = (b: { basket: Basket; seat: Seat }, target: string | null) => {
    if (!target) return 'home' as const
    const seat = target.replace('table-', '') as Seat
    if (seat === b.seat) {
      setHint(null)
      onServe?.(b.basket, seat)
      return 'snap' as const
    }
    // Wrong table: a polite head shake, and the right table glows.
    const g = guests[seat]
    sounds.oops()
    setShake(seat)
    setTimeout(() => setShake(null), 600)
    setHint(b.seat)
    if (g) void say(GUESTS[g].notMine)
    void ref(seat).current?.play('wiggle')
    return 'home' as const
  }

  return (
    <PlayArea style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `url(${landscape ? art.bgDining : art.bgDiningTall}) center / cover` }} />
      {(['left', 'right', 'center'] as Seat[]).map((s) => {
        const at = layout[s]
        const g = guests[s]
        const left = `calc(${at.x * 100}% - ${at.w} / 2)`
        return (
          <div key={s} style={{ position: 'absolute', left, bottom: at.bottom, width: at.w, zIndex: at.z }}>
            {/* The customer sits behind the table (their lower half hidden by it). */}
            {g && (
              <motion.button
                aria-label={g}
                onClick={() => tickle(ref(s), GUESTS[g].tickle, 'jump')}
                animate={shake === s ? { x: [0, -10, 10, -6, 6, 0] } : {}}
                style={{ position: 'absolute', left: '50%', bottom: '48%', translate: '-50% 0', background: 'none', border: 'none', padding: 0, height: `calc(${at.w} * 0.9)`, display: 'flex', alignItems: 'flex-end' }}
              >
                <Buddy ref={ref(s)} img={GUESTS[g].img} voice={GUESTS[g].voice} height={`calc(${at.w} * 0.9)`} />
              </motion.button>
            )}
            {[-1, 1].map((side) => (
              <div key={side} style={{ position: 'absolute', width: '26%', left: `calc(50% + ${side * 46}% - 13%)`, bottom: '10%' }}>
                <Stool />
              </div>
            ))}
            <Target id={`table-${s}`} hint={hint === s} glow={!!tray.length} style={{ position: 'relative', borderRadius: '45%' }}>
              <div onClick={onTableTap ? () => onTableTap(s) : undefined} role={onTableTap ? 'button' : undefined} aria-label={onTableTap ? `${s} table` : undefined}>
                <Table>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4%', width: '100%' }}>
                    {served[s] && (
                      <motion.div initial={{ scale: 0.5, y: -40 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ width: '70%' }}>
                        <Steamer ribbon={served[s]!.ribbon}>
                          <BasketDumplings colors={served[s]!.colors} state="cooked" />
                        </Steamer>
                      </motion.div>
                    )}
                    {onTable[s]}
                  </div>
                </Table>
              </div>
            </Target>
          </div>
        )
      })}
      {/* The carry tray: baskets waiting to be served. */}
      {tray.length > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(var(--top-clear) + 78px)', display: 'flex', justifyContent: 'center', gap: 'min(5vw, 40px)', zIndex: 10 }}>
          {tray.map((b) => (
            <Piece key={b.basket.id} id={`serve-${b.basket.id}`} snapTo={`table-${b.seat}`} snapRadius={50} onPlace={({ target }) => drop(b, target)} onTap={() => drop(b, `table-${b.seat}`)} label="steamer basket">
              <div style={{ width: landscape ? 'min(20vw, 26vh, 220px)' : 'min(32vw, 17vh, 220px)' }}>
                <Steamer ribbon={b.basket.ribbon}>
                  <BasketDumplings colors={b.basket.colors} state="cooked" />
                </Steamer>
              </div>
            </Piece>
          ))}
        </div>
      )}
      {children}
      {prompt && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 12px', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <PromptBubble text={prompt} />
          </div>
        </div>
      )}
      <WordCard word={word ?? null} />
    </PlayArea>
  )
}

// --- The dining half of each service -------------------------------------------------------------------------------

/** Service 1: carry Grandpa Turtle's basket to his table, then he shows how to eat one: nibble, sip, eat. */
export function Dining1({ basket, onDone }: { basket: Basket; onDone: () => void }) {
  const [served, setServed] = useState(false)
  const [eat, setEat] = useState<0 | 1 | 2 | 3 | 4>(0) // 0 not yet, 1 nibble, 2 sip, 3 eat, 4 done
  const grandpa = useRef<PuppetHandle>(null)
  const [word, showWord] = useWord()
  const alive = useAlive()
  const serve = async () => {
    setServed(true)
    sounds.correct()
    sfx.chirp()
    burst(0.5, 0.55)
    void grandpa.current?.play('cheer')
    await wait(500)
    await say(D.eatHow)
    if (alive()) setEat(1)
  }
  const bite = async () => {
    if (eat === 1) {
      sfx.munch()
      setEat(2)
    } else if (eat === 2) {
      sfx.fwip()
      setEat(3)
    } else if (eat === 3) {
      sfx.chomp()
      setEat(4)
      burst(0.5, 0.5)
      void grandpa.current?.play('cheer')
      showWord('haochi')
      await say(D.haochi)
      await wait(400)
      if (alive()) onDone()
    }
  }
  const prompt = !served ? D.serve : eat === 1 ? D.nibble : eat === 2 ? D.sip : eat === 3 ? D.eat : undefined
  return (
    <DiningRoom guests={{ center: 'grandpa' }} refs={{ center: grandpa }} served={served ? { center: basket } : {}} tray={served ? [] : [{ basket, seat: 'center' }]} onServe={serve} prompt={prompt} word={word}>
      <AnimatePresence>
        {eat >= 1 && eat < 4 && (
          <motion.button
            key="spoon"
            aria-label="dumpling on a spoon"
            initial={{ scale: 0, y: 80 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={bite}
            className="world-glow"
            style={{ position: 'absolute', left: '64%', top: '46%', translate: '-50% -50%', zIndex: 15, background: 'none', border: 'none', padding: 0, borderRadius: '50%' }}
          >
            <Spoon>
              <Dumpling state={eat === 1 ? 'cooked' : 'nibbled'} face={eat === 3 ? 'giggle' : 'happy'} size="min(26vh, 30vw, 260px)" steam />
              {eat === 3 && <div style={{ position: 'absolute', left: '64%', top: '12%', fontSize: 34 }}>😋</div>}
            </Spoon>
          </motion.button>
        )}
      </AnimatePresence>
    </DiningRoom>
  )
}

function Spoon({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="-10 -10 420 200" style={{ position: 'absolute', left: '-40%', bottom: '-18%', width: '180%', overflow: 'visible' }}>
        <path d="M300 96 L400 70" stroke="#6E3B24" strokeWidth={30} strokeLinecap="round" />
        <path d="M300 96 L400 70" stroke="#FFF7F0" strokeWidth={18} strokeLinecap="round" />
        <path d="M60 90 Q60 170 180 170 Q300 170 310 96 Z" fill="#FFF7F0" stroke="#6E3B24" strokeWidth={6} strokeLinejoin="round" />
        <path d="M110 140 Q180 158 250 138" stroke="#7CCBA2" strokeWidth={8} fill="none" strokeLinecap="round" />
      </svg>
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  )
}

/** Service 2: two baskets to two tables, then the tea tap. */
export function Dining2({ baskets, onDone }: { baskets: Basket[]; onDone: () => void }) {
  const seatOf = (b: Basket): Seat => (b.id === 'bunnies' ? 'left' : 'right')
  const [served, setServed] = useState<Partial<Record<Seat, Basket>>>({ center: { id: 'grandpa', colors: ['cream', 'cream'] } })
  const [tea, setTea] = useState<'no' | 'pour' | 'tap' | 'done'>('no')
  const [taps, setTaps] = useState(0)
  const refs = { left: useRef<PuppetHandle>(null), center: useRef<PuppetHandle>(null), right: useRef<PuppetHandle>(null) }
  const dou = useRef<PuppetHandle>(null)
  const alive = useAlive()
  const remaining = baskets.filter((b) => !served[seatOf(b)])

  const serve = async (b: Basket, seat: Seat) => {
    const next = { ...served, [seat]: b }
    setServed(next)
    sounds.correct()
    sfx.chirp()
    burst(seat === 'left' ? 0.2 : 0.8, 0.6)
    void refs[seat].current?.play('cheer')
    const g = seat === 'left' ? 'bunnies' : 'goose'
    await say(GUESTS[g].yum!)
    if (alive() && baskets.every((x) => next[seatOf(x)])) {
      setTea('pour')
      void dou.current?.play('pour')
      await say(D.teaPour)
      if (alive()) setTea('tap')
    }
  }

  // The tea tap is optional: it moves on by itself after a while.
  useEffect(() => {
    if (tea !== 'tap') return
    const t = setTimeout(() => alive() && finishTea(), 9000)
    return () => clearTimeout(t)
  }, [tea])
  const teaDone = useRef(false)
  const finishTea = async () => {
    if (teaDone.current) return
    teaDone.current = true
    setTea('done')
    await say(D.teaFact)
    await wait(300)
    if (alive()) onDone()
  }
  const tapTable = (seat: Seat) => {
    if (tea !== 'tap') return
    sfx.thump()
    void refs[seat].current?.play('nod')
    const n = taps + 1
    setTaps(n)
    if (n === 2) {
      sounds.sparkle()
      burst(0.5, 0.6)
      void finishTea()
    }
  }

  const prompt = remaining.length ? (remaining[0].id === 'bunnies' ? D.serveBunnies : D.serveGoose) : tea === 'tap' ? D.tea : undefined
  const cup = <div style={{ width: '24%', flexShrink: 0 }}><Cup tea /></div>
  const cups = tea !== 'no' ? { left: cup, right: cup, center: cup } : {}
  return (
    <DiningRoom guests={{ left: 'bunnies', center: 'grandpa', right: 'goose' }} refs={refs} served={served} tray={remaining.map((b) => ({ basket: b, seat: seatOf(b) }))} onServe={serve} prompt={prompt} onTable={cups} onTableTap={tea === 'tap' ? tapTable : undefined}>
      <AnimatePresence>
        {tea !== 'no' && tea !== 'done' && (
          <motion.div key="dou" initial={{ x: '-120%' }} animate={{ x: 0 }} exit={{ x: '-140%' }} transition={{ type: 'spring', bounce: 0.3 }} style={{ position: 'absolute', left: '30%', bottom: '1%', zIndex: 12, height: 'min(30vh, 26vw)', pointerEvents: 'none' }}>
            <DouDou ref={dou} height="100%" />
          </motion.div>
        )}
      </AnimatePresence>
      {tea === 'tap' && (
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ position: 'absolute', left: '50%', bottom: '30%', translate: '-50% 0', fontSize: 56, zIndex: 16, pointerEvents: 'none' }}>
          ✌️
        </motion.div>
      )}
    </DiningRoom>
  )
}

/** Service 3: Bao Bao's basket (she gobbles all six). */
export function Dining3({ basket, onDone }: { basket: Basket; onDone: () => void }) {
  const [served, setServed] = useState(false)
  const bao = useRef<PuppetHandle>(null)
  const [word, showWord] = useWord()
  const alive = useAlive()
  const serve = async () => {
    setServed(true)
    sounds.correct()
    burst(0.5, 0.5)
    sfx.chomp()
    void bao.current?.play('dance')
    showWord('haochi')
    await say(D.baoYum)
    await wait(500)
    if (alive()) onDone()
  }
  return (
    <DiningRoom
      guests={{ left: 'bunnies', center: 'baobao', right: 'goose' }}
      refs={{ center: bao }}
      served={served ? { center: basket, left: { id: 'b', colors: ['pink', 'green'] }, right: { id: 'g', colors: ['yellow', 'yellow'] } } : { left: { id: 'b', colors: ['pink', 'green'] }, right: { id: 'g', colors: ['yellow', 'yellow'] } }}
      tray={served ? [] : [{ basket, seat: 'center' }]}
      onServe={serve}
      prompt={served ? undefined : D.serveBao}
      word={word}
    />
  )
}

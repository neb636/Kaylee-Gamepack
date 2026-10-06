// One pizza, from order to happy customer: the customer orders at the counter (tap the ticket or the start button),
// then the kitchen steps (dough, sauce, cheese, toppings), the oven, the cutter, and back to the counter to serve it.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { BigButton, burst, Buddy, say, sounds, useAlive, wait, type Line, type Placed, type PuppetHandle } from '../../../../../sdk'
import { Flag } from '../../../../kit/Flag'
import { art } from '../../art'
import { L } from '../../lines'
import { Bruno } from '../../puppets/Bruno'
import { Lupa } from '../../puppets/Lupa'
import { useWord, type WordId } from '../../WordCard'
import { FrontRoom } from './FrontRoom'
import { Kitchen, Raffaele, type StationId } from './layout'
import { Oven } from './Oven'
import { cheeseRain, PizzaBase, PizzaToppings, RAW, Ticket, type Order, type PizzaState, type Sauce, type Topping } from './pizza'
import { Cutter, Dough, PickSauce, SauceSwirl, Toppings, toppingPrompt } from './stations'

const P = L.pizza

export type Step = 'dough' | 'pickSauce' | 'sauce' | 'cheese' | 'quick' | 'toppings'
export interface JobSpec {
  id: string
  order: Order
  /** Who's at the counter: a flat picture (Buddy), or Lupa's puppet. */
  customer: { img?: string; voice: string; lupa?: boolean }
  /** Lines at the counter before she starts (the customer says their order). */
  greet: { line: Line; word?: WordId }[]
  steps: Step[]
  kinds: Topping[]
  cut: 0 | 1 | 2 | 'free'
  /** Said after serving. */
  yum: { line: Line; word?: WordId }[]
  /** Said once the cuts are done, before serving. */
  afterCut?: Line
  /** The 1889 story: sepia storybook, Raffaele in the kitchen, and the pizza turns into Italy's flag. */
  old?: boolean
  /** Cesare sneaks a piece of mozzarella during the toppings (her own pizza). */
  cesare?: boolean
}

type Phase = 'order' | 'kitchen' | 'oven' | 'cut' | 'serve'

const STATION: Record<Step, StationId> = { dough: 'dough', pickSauce: 'sauce', sauce: 'sauce', cheese: 'toppings', quick: 'dough', toppings: 'toppings' }

export function Job({ spec, onDone }: { spec: JobSpec; onDone: (pizza: PizzaState) => void }) {
  const [phase, setPhase] = useState<Phase>('order')
  const [step, setStep] = useState(0)
  const [pizza, setPizza] = useState<PizzaState>(RAW)
  const [sauce, setSauce] = useState<Sauce>('red')
  const chef = useRef<PuppetHandle>(null)
  const [word, showWord] = useWord()
  const alive = useAlive()

  const nextStep = () => {
    if (!alive()) return
    if (step + 1 < spec.steps.length) setStep(step + 1)
    else setPhase('oven')
  }

  if (phase === 'order') return <Order spec={spec} onStart={() => setPhase('kitchen')} showWord={showWord} word={word} />

  if (phase === 'oven')
    return (
      <Oven
        pizza={pizza}
        old={spec.old}
        onBake={(bake) => setPizza((p) => ({ ...p, bake }))}
        onDone={() => setPhase(spec.cut ? 'cut' : 'serve')}
      />
    )

  if (phase === 'serve') return <Serve spec={spec} pizza={pizza} onDone={() => onDone(pizza)} />

  const chefNode = spec.old ? <Raffaele /> : <Bruno ref={chef} height="100%" onTap={() => tickle(chef, L.tickle.bruno)} />
  const play = (a: string) => void chef.current?.play(a)

  if (phase === 'cut') {
    const need = spec.cut === 'free' ? 'free' : (spec.cut as 1 | 2)
    return (
      <Kitchen chef={chefNode} at="cut" prompt={need === 'free' ? P.cutOwn : need === 1 ? P.cutHalf : P.cutQuarter} ticket={<Ticket order={spec.order} />} word={word} old={spec.old}>
        <Cutter
          pizza={pizza}
          need={need}
          onCut={(cuts) => setPizza((p) => ({ ...p, cuts }))}
          onDone={async () => {
            play('cheer')
            if (spec.afterCut) await say(spec.afterCut)
            if (alive()) setPhase('serve')
          }}
        />
      </Kitchen>
    )
  }

  // Kitchen steps
  const s = spec.steps[step]
  const ticket = <Ticket order={spec.order} />
  let prompt: Line | undefined
  let work: ReactNode = null
  if (s === 'dough') {
    prompt = P.toss
    work = (
      <Dough
        onToss={(n) => {
          play('toss')
          if (n === 1) void say(P.tossMore)
        }}
        onDone={async () => {
          showWord('bellissimo')
          play('cheer')
          await say(spec.old ? P.tossedOld : P.tossed)
          nextStep()
        }}
      />
    )
  } else if (s === 'pickSauce') {
    prompt = P.pickSauce
    work = (
      <PickSauce
        onPick={(c) => {
          setSauce(c)
          setTimeout(nextStep, 900)
        }}
      />
    )
  } else if (s === 'sauce') {
    prompt = P.sauce
    work = (
      <SauceSwirl
        pizza={pizza}
        color={sauce}
        onDone={async () => {
          setPizza((p) => ({ ...p, sauce }))
          showWord('perfetto')
          play('nod')
          await say(spec.old ? P.saucedOld : P.sauced)
          if (spec.id === 'bufala') await say(P.tomatoFact)
          nextStep()
        }}
      />
    )
  } else if (s === 'cheese' || s === 'quick') {
    work = <AutoStep key={s} kind={s} chef={chef} pizza={pizza} setPizza={setPizza} onDone={nextStep} />
  } else if (s === 'toppings') {
    prompt = toppingPrompt(spec.order, pizza.items)
    work = (
      <ToppingsStep
        spec={spec}
        pizza={pizza}
        onChange={(items) => setPizza((p) => ({ ...p, items }))}
        onDone={async () => {
          play('cheer')
          if (spec.old) await say(P.flagColors)
          nextStep()
        }}
      />
    )
  }
  return (
    <Kitchen chef={chefNode} at={STATION[s]} prompt={prompt} ticket={ticket} word={word} old={spec.old}>
      {work}
    </Kitchen>
  )
}

const tickleTurn = new Map<Line[], number>()
function tickle(ref: RefObject<PuppetHandle | null>, lines: Line[], action = 'laugh') {
  void ref.current?.play(action)
  const i = tickleTurn.get(lines) ?? 0
  tickleTurn.set(lines, i + 1)
  void say(lines[i % lines.length])
}

/** Bruno does it for her: sprinkles the mozzarella, or (quick hands) makes the base and sauce while she watches. */
function AutoStep({ kind, chef, pizza, setPizza, onDone }: { kind: 'cheese' | 'quick'; chef: RefObject<PuppetHandle | null>; pizza: PizzaState; setPizza: (p: PizzaState) => void; onDone: () => void }) {
  const alive = useAlive()
  useEffect(() => {
    void (async () => {
      if (kind === 'quick') {
        void chef.current?.play('spin')
        await say(P.quickHands)
        if (!alive()) return
        setPizza({ ...RAW, sauce: 'red' })
        sounds.pop()
        await wait(500)
      }
      void chef.current?.play('toss')
      await wait(400)
      if (!alive()) return
      sounds.sparkle()
      setPizza({ ...(kind === 'quick' ? { ...RAW, sauce: 'red' as const } : pizza), items: cheeseRain() })
      await say(P.cheeseRain)
      await wait(400)
      if (alive()) onDone()
    })()
  }, [])
  return (
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ width: 'min(92cqh, 86cqw)', height: 'min(92cqh, 86cqw)' }}>
      <PizzaViewLive pizza={pizza} />
    </motion.div>
  )
}

function PizzaViewLive({ pizza }: { pizza: PizzaState }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {pizza.sauce === null && pizza.items.length === 0 ? (
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ width: '100%', height: '100%' }}>
          <PizzaLayers pizza={pizza} />
        </motion.div>
      ) : (
        <PizzaLayers pizza={pizza} />
      )}
    </div>
  )
}

function PizzaLayers({ pizza }: { pizza: PizzaState }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <PizzaBase pizza={pizza} />
      <PizzaToppings items={pizza.items} />
    </div>
  )
}

/** The toppings station, plus Cesare the cat sneaking a piece of mozzarella (her own pizza only). */
function ToppingsStep({ spec, pizza, onChange, onDone }: { spec: JobSpec; pizza: PizzaState; onChange: (items: Placed[]) => void; onDone: () => void }) {
  const [cat, setCat] = useState<'away' | 'sneak' | 'sorry' | 'gone'>('away')
  const stolen = useRef<Placed | null>(null)
  const placed = pizza.items.filter((i) => !i.id.startsWith('cheese-')).length
  const alive = useAlive()

  useEffect(() => {
    if (!spec.cesare || cat !== 'away' || placed < 2) return
    const cheese = pizza.items.find((i) => i.kind === 'mozzarella')
    if (!cheese) return
    const t = setTimeout(async () => {
      if (!alive()) return
      stolen.current = cheese
      onChange(pizza.items.filter((i) => i.id !== cheese.id))
      setCat('sneak')
      sounds.whoosh()
      await say(P.cesareSneak)
      if (alive()) void say(P.cesareTap)
    }, 600)
    return () => clearTimeout(t)
  }, [placed, cat])

  return (
    <>
      <Toppings pizza={pizza} order={spec.order} kinds={spec.kinds} onChange={onChange} onDone={onDone} />
      <AnimatePresence>
        {(cat === 'sneak' || cat === 'sorry') && (
          <motion.button
            key="cat"
            aria-label="Cesare the cat"
            initial={{ x: '120%' }}
            animate={{ x: cat === 'sorry' ? ['0%', '0%'] : '0%', rotate: cat === 'sorry' ? [0, -8, 8, 0] : 0 }}
            exit={{ x: '130%' }}
            transition={{ type: 'spring', bounce: 0.3 }}
            onClick={async () => {
              if (cat !== 'sneak') return
              sounds.pop()
              setCat('sorry')
              await say(P.cesareSorry)
              if (!alive()) return
              if (stolen.current) onChange([...pizzaItems(pizza), stolen.current])
              sounds.place()
              setCat('gone')
            }}
            style={{ position: 'absolute', left: 0, bottom: 0, zIndex: 9, background: 'none', border: 'none', padding: 0, height: 'min(40cqh, 240px)' }}
          >
            <Buddy img={art.cesare} voice="cesare" height="100%" />
            {cat === 'sneak' && <img src={art.mozzarellaPiece} alt="" style={{ position: 'absolute', left: '2%', top: '46%', width: '34%' }} />}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
const pizzaItems = (p: PizzaState) => p.items

/** At the counter: the customer says their order, the ticket pops up, then she taps to start cooking. */
function Order({ spec, onStart, showWord, word }: { spec: JobSpec; onStart: () => void; showWord: (w: WordId) => void; word: WordId | null }) {
  const [ready, setReady] = useState(false)
  const cust = useRef<PuppetHandle>(null)
  const alive = useAlive()
  useEffect(() => {
    void (async () => {
      await wait(300)
      for (const g of spec.greet) {
        if (!alive()) return
        void cust.current?.play(spec.customer.lupa ? 'wave' : 'jump')
        if (g.word) showWord(g.word)
        await say(g.line)
      }
      if (alive()) setReady(true)
    })()
  }, [])
  const start = () => {
    sounds.pop()
    onStart()
  }
  return (
    <FrontRoom
      customer={spec.customer.lupa ? <Lupa ref={cust} height="100%" /> : <Buddy ref={cust} img={spec.customer.img!} voice={spec.customer.voice} height="100%" />}
      old={spec.old}
      ticket={
        <button aria-label="Start the order" onClick={start} style={{ background: 'none', border: 'none', padding: 0, width: '100%' }} className={ready ? 'world-glow' : undefined}>
          <Ticket order={spec.order} />
        </button>
      }
      prompt={ready ? P.start : undefined}
      at="order"
      word={word}
    >
      <AnimatePresence>
        {ready && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', right: '6%', bottom: '6%', zIndex: 10 }}>
            <BigButton ariaLabel="Let's cook" size="xl" onClick={start}>
              🍕 ▶
            </BigButton>
          </motion.div>
        )}
      </AnimatePresence>
    </FrontRoom>
  )
}

/** Serve it: tap the pizza on the counter, the customer eats and cheers. For the Queen, the pizza becomes the flag. */
function Serve({ spec, pizza, onDone }: { spec: JobSpec; pizza: PizzaState; onDone: () => void }) {
  const [eaten, setEaten] = useState(false)
  const [flag, setFlag] = useState(false)
  const [color, setColor] = useState(false)
  const [done, setDone] = useState(false)
  const cust = useRef<PuppetHandle>(null)
  const [word, showWord] = useWord()
  const alive = useAlive()

  const serve = async () => {
    if (spec.old) {
      // The pizza lifts up and turns into Italy's flag: green, white, red. Then the storybook fills with color.
      setFlag(true)
      sounds.sparkle()
      await wait(1300)
      if (!alive()) return
      setColor(true)
      burst(0.5, 0.4)
    }
    await wait(500)
    if (!alive()) return
    setEaten(true)
    sounds.correct()
    void cust.current?.play('cheer')
    for (const y of spec.yum) {
      if (!alive()) return
      if (y.word) showWord(y.word)
      await say(y.line)
    }
    if (alive()) setDone(true)
  }

  useEffect(() => {
    if (done) onDone()
  }, [done])

  return (
    <FrontRoom
      customer={spec.customer.lupa ? <Lupa ref={cust} height="100%" /> : <Buddy ref={cust} img={spec.customer.img!} voice={spec.customer.voice} height="100%" />}
      old={spec.old}
      colorIn={color}
      prompt={eaten ? undefined : spec.old ? P.serve : P.serveIt}
      pizza={pizza}
      onServe={serve}
      eaten={eaten}
      word={word}
    >
      <AnimatePresence>
        {flag && (
          <motion.div key="flag" initial={{ scale: 0.2, y: 120, rotate: -20, opacity: 0 }} animate={{ scale: 1, y: 0, rotate: [-6, 4, -2, 0], opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', bounce: 0.4, duration: 1 }} style={{ position: 'absolute', left: '50%', top: '34%', translate: '-50% -50%', zIndex: 12, pointerEvents: 'none' }}>
            <Flag id="italy" width="min(52vw, 46vh, 460px)" />
          </motion.div>
        )}
      </AnimatePresence>
    </FrontRoom>
  )
}

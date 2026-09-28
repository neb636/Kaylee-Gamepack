// The kitchen half of each service. Service 1 teaches every step on one dumpling (Chef Fu's quick hands make the rest);
// Service 2 is colors and a two-basket stack; Service 3 is Bao Bao's big order, free colors, and a sneaky monkey.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { burst, Buddy, Piece, say, sounds, Target, useAlive, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { WIGGLE } from '../../../../kit/Stage'
import { art } from '../../art'
import { L } from '../../lines'
import { DoughBowl, FillingBowl, Lid, Steamer, Ticket } from '../../props'
import { Dumpling, type DoughColor } from '../../puppets/Dumpling'
import { CookStove, FillBasket, BasketDumplings, type Basket, type CookStage } from './cook'
import { Kitchen } from './Kitchen'
import { play, useWord } from './shared'
import { Chop, Fill, Knead, Pleat, Roll, SMALL, Snake } from './steps'

const D = L.dumplings
export const RIBBON = { bunnies: '#FF8FB8', goose: '#FFC83D', grandpa: '#7CCBA2', baobao: '#B9A6F5' }
const face = (img: string) => <img src={img} alt="" style={{ height: 'calc(var(--ticket-d) * 1.5)', objectFit: 'contain' }} />

export interface ServiceProps {
  chef: RefObject<PuppetHandle | null>
  /** Cooked baskets, ready to carry to the dining room. */
  onDone: (baskets: Basket[]) => void
}

/** Prompts for the steaming stages. */
function cookPrompt(stage: CookStage, fact: boolean): Line | undefined {
  if (stage === 'fire') return D.fire
  if (stage === 'steam') return fact ? D.steamFact : D.popSteam
  if (stage === 'lift') return D.lift
  return undefined
}

/** Runs a CookStove and says the steam fact once, then "pop the steam puffs". */
function useCook(onCooked: () => void) {
  const [stage, setStage] = useState<CookStage>('idle')
  const [fact, setFact] = useState(true)
  const alive = useAlive()
  useEffect(() => {
    if (stage === 'steam') {
      const t = setTimeout(() => alive() && setFact(false), 4200)
      return () => clearTimeout(t)
    }
    if (stage === 'cooked') {
      const t = setTimeout(() => alive() && onCooked(), 2600)
      return () => clearTimeout(t)
    }
  }, [stage])
  return { stage, setStage, prompt: cookPrompt(stage, fact) }
}

// --- Service 1: Grandpa Turtle's four dumplings -------------------------------------------------------------------

type S1 = 'knead' | 'snake' | 'chop' | 'roll' | 'fill' | 'pleat' | 'quick' | 'pleat3' | 'basket' | 'lid' | 'cook'
const PROMPT1: Partial<Record<S1, Line>> = { knead: D.knead, snake: D.snake, chop: D.chop, roll: D.roll, fill: D.fill, pleat: D.pleat, pleat3: D.pleatMore, basket: D.steamer, lid: D.lid }

export function Service1({ chef, onDone }: ServiceProps) {
  const [step, setStep] = useState<S1>('knead')
  const [folded, setFolded] = useState(1) // dumplings folded so far (in pleat3)
  const [placed, setPlaced] = useState<DoughColor[]>([])
  const [word, showWord] = useWord()
  const alive = useAlive()
  const basket: Basket = { id: 's1', colors: ['cream', 'cream', 'cream', 'cream'], ribbon: RIBBON.grandpa }
  const cook = useCook(() => onDone([basket]))

  useEffect(() => {
    if (step !== 'quick') return
    void (async () => {
      void play(chef, 'quick')
      await say(D.quickHands)
      await wait(500)
      if (alive()) setStep('pleat3')
    })()
  }, [step])

  const next = (s: S1) => () => alive() && setStep(s)
  const prompt = step === 'cook' ? cook.prompt : PROMPT1[step]
  const tickets = <Ticket colors={basket.colors} done={step === 'cook' && cook.stage === 'cooked' ? 4 : 0} ribbon={RIBBON.grandpa} face={face(art.grandpa)} />

  let work = null
  if (step === 'knead') work = <Knead chef={chef} onDone={next('snake')} onWord={() => showWord('yiersan')} />
  else if (step === 'snake') work = <Snake chef={chef} onDone={next('chop')} />
  else if (step === 'chop') work = <Chop chef={chef} onDone={next('roll')} />
  else if (step === 'roll') work = <Roll chef={chef} onDone={next('fill')} />
  else if (step === 'fill') work = <Fill chef={chef} onDone={next('pleat')} />
  else if (step === 'pleat')
    work = (
      <Pleat
        chef={chef}
        onDone={async () => {
          void play(chef, 'cheer')
          await say(D.pleated)
          if (alive()) setStep('quick')
        }}
      />
    )
  else if (step === 'quick' || step === 'pleat3')
    work = (
      <div style={{ display: 'flex', gap: 'min(3vw, 24px)', alignItems: 'flex-end' }}>
        {[0, 1, 2, 3].map((i) =>
          i < folded ? (
            <Dumpling key={i} state="pleated" size={SMALL} />
          ) : i === folded && step === 'pleat3' ? (
            <Pleat
              key={i}
              chef={chef}
              laps={0.6}
              size={`calc(${SMALL} * 1.35)`}
              onDone={async () => {
                const n = folded + 1
                setFolded(n)
                if (n === 4) {
                  await say(D.counted4)
                  if (alive()) setStep('basket')
                }
              }}
            />
          ) : (
            <motion.div key={i} initial={{ scale: 0, y: -80 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.5, delay: step === 'quick' ? 0.4 + i * 0.35 : 0 }} onAnimationStart={() => sounds.pop()}>
              <Dumpling state="filled" size={SMALL} />
            </motion.div>
          ),
        )}
      </div>
    )
  else if (step === 'basket')
    work = (
      <FillBasket
        ready={basket.colors.slice(placed.length)}
        placed={placed}
        max={4}
        ribbon={RIBBON.grandpa}
        onPlace={(c) => {
          const n = [...placed, c]
          setPlaced(n)
          sounds.place()
          if (n.length === 1) void say(D.leaf)
          if (n.length === 4) setTimeout(() => alive() && setStep('lid'), 500)
        }}
      />
    )
  else if (step === 'lid') work = <CloseLid colors={placed} ribbon={RIBBON.grandpa} onDone={() => (setStep('cook'), cook.setStage('fire'))} />

  return (
    <Kitchen chef={chef} prompt={prompt} tickets={tickets} word={word} stove={<CookStove baskets={step === 'cook' ? [basket] : []} stage={cook.stage} onStage={cook.setStage} />}>
      {work}
    </Kitchen>
  )
}

/** The lid hovers over the full basket, glowing: tap to close it. */
function CloseLid({ colors, ribbon, onDone }: { colors: DoughColor[]; ribbon?: string; onDone: () => void }) {
  const [on, setOn] = useState(false)
  return (
    <div style={{ width: 'min(76cqw, 80cqh, 460px)', position: 'relative' }}>
      <Steamer lid={on} ribbon={ribbon}>
        {!on && <BasketDumplings colors={colors} state="pleated" />}
      </Steamer>
      {!on && (
        <motion.button
          aria-label="steamer lid"
          className="world-glow"
          animate={{ y: [-70, -84, -70] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
          onClick={() => {
            setOn(true)
            sounds.place()
            setTimeout(onDone, 600)
          }}
          style={{ position: 'absolute', left: 0, right: 0, top: '-30%', background: 'none', border: 'none', padding: 0, borderRadius: '50%' }}
        >
          <Lid />
        </motion.button>
      )}
    </div>
  )
}

// --- Service 2: the lunch rush -------------------------------------------------------------------------------------

type S2 = 'order' | 'color' | 'fill' | 'pleat' | 'goose' | 'basket' | 'stack' | 'cook'
const BUNNY: DoughColor[] = ['pink', 'pink', 'green', 'green']
const GOOSE: DoughColor[] = ['yellow', 'yellow']
const BOWLS: DoughColor[] = ['cream', 'pink', 'green', 'yellow']

export function Service2({ chef, onDone }: ServiceProps) {
  const [step, setStep] = useState<S2>('order')
  const [wrappers, setWrappers] = useState<DoughColor[]>([])
  const [filled, setFilled] = useState(false)
  const [folded, setFolded] = useState(0)
  const [placed, setPlaced] = useState<DoughColor[]>([])
  const [stacked, setStacked] = useState<string[]>([])
  const [wrong, setWrong] = useState<DoughColor | null>(null)
  const [hint, setHint] = useState(false)
  const alive = useAlive()
  const bunnies: Basket = { id: 'bunnies', colors: BUNNY, ribbon: RIBBON.bunnies }
  const goose: Basket = { id: 'goose', colors: GOOSE, ribbon: RIBBON.goose }
  const cook = useCook(() => onDone([bunnies, goose]))
  const want = BUNNY[wrappers.length]

  useEffect(() => {
    void (async () => {
      await say(D.orderBunnies)
      await say(D.orderGoose)
      if (alive()) setStep('color')
    })()
  }, [])
  useEffect(() => {
    if (step !== 'goose') return
    void (async () => {
      void play(chef, 'quick')
      await say(D.gooseMine)
      if (alive()) setStep('basket')
    })()
  }, [step])

  const pickBowl = (c: DoughColor) => {
    if (step !== 'color') return
    if (c !== want) {
      sounds.oops()
      setWrong(c)
      setHint(true)
      setTimeout(() => setWrong(null), 520)
      void play(chef, 'shake')
      void say(D.notThat[want as 'pink' | 'green'])
      return
    }
    setHint(false)
    sounds.pop()
    const n = [...wrappers, c]
    setWrappers(n)
    void say(D.colorName[c])
    if (n.length === 4) setTimeout(() => alive() && setStep('fill'), 700)
  }

  const bowls = (onPick: (c: DoughColor) => void, glow?: DoughColor) => (
    <div style={{ display: 'flex', gap: 'min(2.5vw, 20px)', justifyContent: 'center' }}>
      {BOWLS.map((c) => (
        <motion.button key={c} aria-label={`${c} dough`} onClick={() => onPick(c)} whileTap={{ scale: 0.9 }} animate={wrong === c ? WIGGLE : glow === c ? { y: [0, -10, 0] } : {}} transition={glow === c ? { repeat: Infinity, duration: 0.9 } : undefined} className={glow === c ? 'world-glow' : undefined} style={{ width: 'min(22cqw, 30cqh, 150px)', minWidth: 90, background: 'none', border: 'none', padding: 0, borderRadius: 24 }}>
          <DoughBowl color={c} />
        </motion.button>
      ))}
    </div>
  )

  const prompt: Line | undefined =
    step === 'color' ? D.pickColor[want as 'pink' | 'green'] : step === 'fill' || step === 'pleat' ? D.fillFold : step === 'basket' ? D.steamer : step === 'stack' ? D.stack : step === 'cook' ? cook.prompt : undefined

  const tickets = (
    <>
      <Ticket colors={BUNNY} done={step === 'cook' && cook.stage === 'cooked' ? 4 : 0} ribbon={RIBBON.bunnies} face={face(art.bunnies)} />
      <Ticket colors={GOOSE} done={step === 'cook' && cook.stage === 'cooked' ? 2 : 0} ribbon={RIBBON.goose} face={face(art.goose)} />
    </>
  )

  let work = null
  if (step === 'order' || step === 'color')
    work = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(3vh, 24px)' }}>
        <Row>
          {[0, 1, 2, 3].map((i) => (wrappers[i] ? <Dumpling key={i} state="wrapper" color={wrappers[i]} size={SMALL} /> : <EmptySpot key={i} />))}
        </Row>
        {bowls(pickBowl, hint ? want : undefined)}
      </div>
    )
  else if (step === 'fill' || step === 'pleat')
    work = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(2vh, 16px)' }}>
        <Row>
          {BUNNY.map((c, i) =>
            step === 'pleat' && i === folded ? (
              <Pleat
                key={i}
                chef={chef}
                color={c}
                laps={0.5}
                size={`calc(${SMALL} * 1.3)`}
                onDone={() => {
                  const n = folded + 1
                  setFolded(n)
                  if (n === 4) setTimeout(() => alive() && setStep('goose'), 400)
                }}
              />
            ) : (
              <Dumpling key={i} state={step === 'pleat' && i < folded ? 'pleated' : filled ? 'filled' : 'wrapper'} color={c} size={SMALL} />
            ),
          )}
        </Row>
        {step === 'fill' && (
          <motion.button
            aria-label="filling bowl"
            className="world-glow"
            whileTap={{ scale: 0.9 }}
            onClick={async () => {
              if (filled) return
              setFilled(true)
              for (let i = 0; i < 4; i++) {
                sounds.place()
                await wait(140)
              }
              await wait(300)
              if (alive()) setStep('pleat')
            }}
            style={{ width: 'min(26cqw, 30cqh, 170px)', background: 'none', border: 'none', padding: 0, borderRadius: 30 }}
          >
            <FillingBowl />
          </motion.button>
        )}
      </div>
    )
  else if (step === 'goose')
    work = (
      <Row>
        {BUNNY.map((c, i) => <Dumpling key={i} state="pleated" color={c} size={SMALL} />)}
        {GOOSE.map((c, i) => (
          <motion.div key={`g${i}`} initial={{ scale: 0, y: -60 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', delay: 0.5 + i * 0.4 }} onAnimationStart={() => sounds.pop()}>
            <Dumpling state="pleated" color={c} size={SMALL} />
          </motion.div>
        ))}
      </Row>
    )
  else if (step === 'basket')
    work = (
      <FillBasket
        ready={BUNNY.slice(placed.length)}
        placed={placed}
        max={4}
        ribbon={RIBBON.bunnies}
        onPlace={(c) => {
          const n = [...placed, c]
          setPlaced(n)
          sounds.place()
          if (n.length === 4) setTimeout(() => alive() && setStep('stack'), 500)
        }}
      />
    )
  else if (step === 'stack')
    work = (
      <Row>
        {[goose, bunnies]
          .filter((b) => !stacked.includes(b.id))
          .map((b) => (
            <Piece key={b.id} id={`stack-${b.id}`} snapTo="wok" onPlace={({ target }) => (target === 'wok' ? (stack(b.id), 'snap') : 'home')} onTap={() => stack(b.id)} label="steamer basket">
              <div style={{ width: 'min(40cqw, 50cqh, 260px)' }}>
                <Steamer lid ribbon={b.ribbon} />
              </div>
            </Piece>
          ))}
      </Row>
    )

  function stack(id: string) {
    if (stacked.includes(id)) return
    const n = [...stacked, id]
    setStacked(n)
    sounds.snap()
    if (n.length === 2)
      void (async () => {
        await say(D.stackFact)
        if (!alive()) return
        setStep('cook')
        cook.setStage('fire')
      })()
  }

  const onStove = stacked.map((id) => (id === 'goose' ? goose : bunnies))
  return (
    <Kitchen
      chef={chef}
      prompt={prompt}
      tickets={tickets}
      stove={
        <Target id="wok" hint={step === 'stack'} style={{ borderRadius: 30 }}>
          <CookStove baskets={onStove} stage={cook.stage} onStage={cook.setStage} steamPops={4} />
        </Target>
      }
    >
      {work}
    </Kitchen>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 'min(2cqw, 18px)', alignItems: 'flex-end', justifyContent: 'center' }}>{children}</div>
}
function EmptySpot() {
  return <div style={{ width: SMALL, height: `calc(${SMALL} * 0.4)`, borderRadius: '50%', border: '5px dashed rgba(110,59,36,.45)', marginBottom: `calc(${SMALL} * 0.1)` }} />
}

// --- Service 3: Bao Bao's big order ---------------------------------------------------------------------------------

type S3 = 'order' | 'make' | 'lid' | 'cook'

export function Service3({ chef, onDone }: ServiceProps) {
  const [step, setStep] = useState<S3>('order')
  const [made, setMade] = useState<DoughColor[]>([])
  const [monkey, setMonkey] = useState<'no' | 'sneak' | 'sorry' | 'gone'>('no')
  const bao = useRef<PuppetHandle>(null)
  const hou = useRef<PuppetHandle>(null)
  const alive = useAlive()
  const basket: Basket = { id: 'baobao', colors: made, ribbon: RIBBON.baobao }
  const cook = useCook(() => onDone([basket]))

  useEffect(() => {
    void (async () => {
      sounds.sparkle()
      await say(D.jingle)
      void bao.current?.play('jump')
      await say(D.baobao[0])
      void bao.current?.play('cheer')
      await say(D.baobao[1])
      if (alive()) setStep('make')
    })()
  }, [])

  const make = async (c: DoughColor) => {
    if (step !== 'make' || monkey === 'sneak' || made.length >= 6) return
    const n = [...made, c]
    setMade(n)
    sounds.pop()
    void play(chef, 'quick')
    void say(D.count[n.length - 1])
    if (n.length === 3 && monkey === 'no') setTimeout(() => alive() && setMonkey('sneak'), 900)
    if (n.length === 6) {
      await wait(900)
      if (!alive()) return
      await say(D.six)
      if (alive()) setStep('lid')
    }
  }
  const catchMonkey = async () => {
    if (monkey !== 'sneak') return
    setMonkey('sorry')
    sounds.correct()
    void hou.current?.play('nod')
    await say(D.sorry)
    await wait(300)
    if (alive()) setMonkey('gone')
  }

  // While the monkey holds one, the basket shows one fewer.
  const inBasket = monkey === 'sneak' ? made.slice(0, -1) : made
  const prompt: Line | undefined = step === 'make' ? (monkey === 'sneak' ? D.sneak : D.make6) : step === 'lid' ? D.lid : step === 'cook' ? cook.prompt : undefined
  const tickets = <Ticket colors={['cream', 'cream', 'cream', 'cream', 'cream', 'cream']} done={step === 'make' ? made.length : 6} ribbon={RIBBON.baobao} face={face(art.baobao)} />

  let work = null
  if (step === 'order' || step === 'make')
    work = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(2vh, 16px)', position: 'relative' }}>
        <div style={{ width: 'min(70cqw, 56cqh, 440px)', position: 'relative' }}>
          <Steamer ribbon={RIBBON.baobao}>
            <BasketDumplings colors={[...inBasket, ...Array<null>(6 - inBasket.length).fill(null)]} state="pleated" max={6} />
          </Steamer>
          <AnimatePresence>
            {(monkey === 'sneak' || monkey === 'sorry') && (
              <motion.button
                key="hou"
                aria-label="Hou Hou the monkey"
                initial={{ x: '-120%', y: 40, opacity: 0 }}
                animate={{ x: '-78%', y: 0, opacity: 1 }}
                exit={{ x: '-160%', opacity: 0 }}
                transition={{ type: 'spring', bounce: 0.3 }}
                onClick={catchMonkey}
                className={monkey === 'sneak' ? 'world-glow' : undefined}
                style={{ position: 'absolute', left: 0, bottom: '10%', background: 'none', border: 'none', padding: 0, borderRadius: 30 }}
              >
                <Buddy ref={hou} img={art.houhou} voice="houhou" height="min(50cqh, 30cqw, 230px)" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <div style={{ display: 'flex', gap: 'min(2.5vw, 20px)' }}>
          {BOWLS.map((c) => (
            <motion.button key={c} aria-label={`${c} dough`} disabled={step !== 'make'} onClick={() => make(c)} whileTap={{ scale: 0.88 }} style={{ width: 'min(22cqw, 30cqh, 150px)', minWidth: 90, background: 'none', border: 'none', padding: 0, opacity: monkey === 'sneak' ? 0.5 : 1 }}>
              <DoughBowl color={c} />
            </motion.button>
          ))}
        </div>
      </div>
    )
  else if (step === 'lid')
    work = (
      <CloseLid
        colors={made}
        ribbon={RIBBON.baobao}
        onDone={() => {
          setStep('cook')
          cook.setStage('fire')
          burst(0.5, 0.5)
        }}
      />
    )

  return (
    <>
      <Kitchen chef={chef} prompt={prompt} tickets={tickets} stove={<CookStove baskets={step === 'cook' ? [basket] : []} stage={cook.stage} onStage={cook.setStage} steamPops={4} />}>
        {work}
      </Kitchen>
      {/* Bao Bao peeks in from the dining room door while she orders, then waits. */}
      <motion.div initial={{ x: '120%' }} animate={{ x: step === 'order' ? '-8%' : '62%' }} transition={{ type: 'spring', bounce: 0.3 }} style={{ position: 'absolute', right: 0, top: 'calc(var(--top-clear) + 60px)', zIndex: 7, pointerEvents: 'none' }}>
        <Buddy ref={bao} img={art.baobao} voice="baobao" height="min(30vh, 26vw, 260px)" />
      </motion.div>
    </>
  )
}

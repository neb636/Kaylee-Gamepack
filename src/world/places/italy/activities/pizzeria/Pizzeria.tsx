// 🍕 Pizzeria in Naples: the big one. A cute take on the famous pizza-shop games: customers order with picture tickets,
// and each pizza goes through the stations (dough, sauce, toppings, oven, cutter) and back to the counter.
//   Service 1: the 1889 storybook. Kaylee helps Raffaele Esposito make the first pizza Margherita for Queen Margherita;
//              it turns into Italy's flag (red, white and green).
//   Service 2: the lunch rush. Signora Bufala wants five olives, cut in half; Gino wants half mushrooms, half olives,
//              in four slices (first fractions).
//   Service 3: her own pizza (red or pink sauce, anything on top), with Cesare the cat sneaking some mozzarella.
// Progress is saved between services, so she can stop after any of them and carry on later.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { bigCelebration, BigButton, say, SparklePuppet, sounds, useAlive, useLandscape, useSaved, wait, type PuppetHandle } from '../../../../../sdk'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Bruno } from '../../puppets/Bruno'
import { INK } from '../../puppets/ink'
import { Lupa } from '../../puppets/Lupa'
import { useWord } from '../../WordCard'
import { FrontRoom } from './FrontRoom'
import { Job, type JobSpec } from './Job'

const P = L.pizza
const TOTAL = 4 // pizzas served

const QUEEN: JobSpec = {
  id: 'queen',
  old: true,
  order: { who: 'queen', want: { mozzarella: 3, basil: 3 }, cuts: 0 },
  customer: { img: art.queenMargherita, voice: 'queen' },
  greet: [{ line: P.queenHello }],
  steps: ['dough', 'sauce', 'toppings'],
  kinds: ['mozzarella', 'basil'],
  cut: 0,
  yum: [{ line: P.queenYum, word: 'buonissima' }],
}
const BUFALA: JobSpec = {
  id: 'bufala',
  order: { who: 'bufala', want: { olive: 5 }, cuts: 1 },
  customer: { img: art.bufala, voice: 'bufala' },
  greet: [{ line: P.bufalaHello }, { line: P.bufalaFact }, { line: P.bufalaOrder }],
  steps: ['dough', 'sauce', 'cheese', 'toppings'],
  kinds: ['olive'],
  cut: 1,
  afterCut: P.bufalaCut,
  yum: [{ line: P.bufalaYum, word: 'grazie' }, { line: P.prego, word: 'prego' }],
}
const GINO: JobSpec = {
  id: 'gino',
  order: { who: 'gino', halves: { left: 'mushroom', right: 'olive', each: 3 }, cuts: 2 },
  customer: { img: art.gino, voice: 'gino' },
  greet: [{ line: P.ginoHello, word: 'ciao' }],
  steps: ['quick', 'toppings'],
  kinds: ['mushroom', 'olive'],
  cut: 2,
  afterCut: P.ginoCut,
  yum: [{ line: P.ginoYum, word: 'grazieMille' }],
}
const OWN: JobSpec = {
  id: 'own',
  order: { who: 'kaylee', cuts: 0, free: true },
  customer: { voice: 'lupa', lupa: true },
  greet: [{ line: P.own }],
  steps: ['dough', 'pickSauce', 'sauce', 'cheese', 'toppings'],
  kinds: ['mozzarella', 'basil', 'olive', 'mushroom', 'pepper', 'tomato'],
  cut: 'free',
  cesare: true,
  yum: [{ line: P.lupaYum, word: 'buonissima' }],
}

// Each service is a list of beats; `served` is how many pizzas are done before it starts (for the stars).
type Beat = { k: 'arrive' } | { k: 'hello' } | { k: 'story' } | { k: 'named' } | { k: 'job'; spec: JobSpec } | { k: 'break' } | { k: 'payoff' }
const SERVICES: { beats: Beat[]; served: number }[] = [
  { beats: [{ k: 'arrive' }, { k: 'hello' }, { k: 'story' }, { k: 'job', spec: QUEEN }, { k: 'named' }, { k: 'break' }], served: 0 },
  { beats: [{ k: 'job', spec: BUFALA }, { k: 'job', spec: GINO }, { k: 'break' }], served: 1 },
  { beats: [{ k: 'job', spec: OWN }, { k: 'payoff' }], served: 3 },
]

export function Pizzeria({ onDone, setProgress }: ActivityProps) {
  const [saved, setSaved] = useSaved('italy-pizzeria', { service: 0 })
  const service = Math.min(saved.service, SERVICES.length - 1)
  const [beat, setBeat] = useState(0)
  const [served, setServed] = useState(SERVICES[service].served)

  useEffect(() => setProgress(served, TOTAL), [served])

  const b = SERVICES[service].beats[beat]
  const next = () => setBeat((i) => i + 1)

  switch (b.k) {
    case 'arrive':
      return <StoryBeat lines={P.arrive} friend={<Lupa height="100%" />} bg={art.bgNaplesBay} onDone={next} />
    case 'hello':
      return <StoryBeat lines={[P.hello, P.storyIntro]} friend={<Bruno height="100%" />} bg={art.bgPizzeriaFront} onDone={next} />
    case 'story':
      return <StoryBeat lines={[P.story1, P.story2]} img={art.raffaele} bg={art.bgNaples1889} onDone={next} />
    case 'named':
      return <StoryBeat lines={[P.named]} friend={<Bruno height="100%" />} bg={art.bgPizzeriaFront} onDone={next} />
    case 'job':
      return (
        <Job
          key={b.spec.id}
          spec={b.spec}
          onDone={() => {
            setServed((n) => n + 1)
            next()
          }}
        />
      )
    case 'break':
      return (
        <Break
          onNext={() => {
            setSaved({ service: service + 1 })
            setBeat(0)
          }}
        />
      )
    case 'payoff':
      return (
        <Payoff
          onDone={() => {
            setSaved({ service: 0 }) // playing again starts from the Naples bay
            onDone()
          }}
        />
      )
  }
}

/** Between services: a little cheer, then on to the next customers (or back to the map; progress is saved). */
function Break({ onNext }: { onNext: () => void }) {
  const sparkle = useRef<PuppetHandle>(null)
  const lupa = useRef<PuppetHandle>(null)
  useEffect(() => {
    void say(P.serviceDone)
    sounds.fanfare()
    const t = setTimeout(() => {
      void sparkle.current?.play('cheer')
      void lupa.current?.play('cheer')
    }, 300)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(rgba(255,247,240,.4), rgba(255,247,240,.4)), url(${art.bgPizzeriaFront}) center / cover`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'min(24px, 3vh)', padding: 'var(--top-clear) 20px 20px' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '12px 26px', boxShadow: 'var(--shadow)', fontSize: 'clamp(22px, min(4vw, 5vh), 38px)', fontWeight: 600, textAlign: 'center' }}>
        ⭐ {P.serviceDone}
      </motion.div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'min(20px, 3vw)' }}>
        <SparklePuppet ref={sparkle} height="min(280px, 32vh, 40vw)" lookToward={0.5} />
        <Lupa ref={lupa} height="min(250px, 29vh, 36vw)" onTap={() => void lupa.current?.play('howl')} />
      </div>
      <BigButton onClick={onNext} ariaLabel="Next customers">
        🍕 ▶
      </BigButton>
    </div>
  )
}

/** The payoff: everyone cheers, Bruno spins a giant dough, gives Sparkle a chef hat and brings his mandolin to Lupa's band. */
function Payoff({ onDone }: { onDone: () => void }) {
  const landscape = useLandscape()
  const [beat, setBeat] = useState<'clap' | 'hat' | 'mandolin' | 'done'>('clap')
  const bruno = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const lupa = useRef<PuppetHandle>(null)
  const [word, showWord] = useWord()
  const alive = useAlive()

  useEffect(() => {
    void (async () => {
      bigCelebration()
      sounds.fanfare()
      void lupa.current?.play('cheer')
      await say(P.clap)
      if (!alive()) return
      void bruno.current?.play('spin')
      await say(P.spin)
      await wait(900)
      if (!alive()) return
      setBeat('hat')
      sounds.sparkle()
      void sparkle.current?.play('cheer')
      showWord('grazie')
      await say(P.hat)
      if (!alive()) return
      setBeat('mandolin')
      void bruno.current?.play('wave')
      await say(P.mandolin)
      if (!alive()) return
      void lupa.current?.play('howl')
      await say(P.band)
      if (alive()) setBeat('done')
    })()
  }, [])

  const cast = landscape ? 'min(34vh, 22vw)' : 'min(26vh, 30vw)'
  return (
    <FrontRoom customer={<div />} word={word}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: landscape ? '4%' : '3%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 'min(3vw, 24px)', zIndex: 12 }}>
        <div style={{ height: `calc(${cast} * 1.35)` }}>
          <Bruno ref={bruno} height="100%" onTap={() => void bruno.current?.play('laugh')} />
        </div>
        <div style={{ position: 'relative' }}>
          <SparklePuppet ref={sparkle} height={cast} />
          <AnimatePresence>
            {beat !== 'clap' && (
              <motion.div key="hat" initial={{ x: '-180%', y: '-140%', rotate: -40, scale: 0.6 }} animate={{ x: '0%', y: '0%', rotate: -12, scale: 1 }} transition={{ type: 'spring', bounce: 0.45, duration: 0.9 }} style={{ position: 'absolute', left: '36%', top: '-16%', width: '32%', pointerEvents: 'none' }}>
                <ChefHat />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div style={{ position: 'relative', height: `calc(${cast} * 0.9)` }}>
          <Lupa ref={lupa} height="100%" onTap={() => void lupa.current?.play('howl')} />
          <AnimatePresence>
            {(beat === 'mandolin' || beat === 'done') && (
              <motion.img key="mandolin" src={art.mandolin} alt="" initial={{ x: '-260%', y: '-80%', rotate: -60, scale: 0.5 }} animate={{ x: '0%', y: '0%', rotate: 20, scale: 1 }} transition={{ type: 'spring', bounce: 0.4, duration: 1 }} style={{ position: 'absolute', right: '-30%', bottom: '10%', width: '55%', pointerEvents: 'none' }} />
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {beat === 'done' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', right: '5%', top: 'calc(var(--top-clear) + 20px)', zIndex: 14 }}>
            <BigButton ariaLabel="Get my stamp" size="xl" onClick={onDone}>
              🍕 ⭐
            </BigButton>
          </motion.div>
        )}
      </AnimatePresence>
    </FrontRoom>
  )
}

/** A little chef hat for Sparkle. */
function ChefHat() {
  return (
    <svg viewBox="0 0 120 100" style={{ width: '100%', display: 'block', overflow: 'visible' }}>
      <path fill="#FFF4E4" stroke={INK} strokeWidth="5" strokeLinejoin="round" d="M30 60 C12 58 4 44 10 32 C16 20 30 18 38 24 C42 8 58 2 70 6 C82 10 88 18 88 26 C100 20 116 28 114 42 C112 54 102 60 90 60 Z" />
      <path fill="#FFF4E4" stroke={INK} strokeWidth="5" strokeLinejoin="round" d="M28 54 C50 60 72 60 94 54 L96 88 C72 94 50 94 26 88 Z" />
      <path fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" d="M44 30 C42 40 42 48 44 54 M64 16 C62 30 62 44 64 56 M84 30 C86 40 86 48 84 54" />
    </svg>
  )
}

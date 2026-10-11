// 🥟 Dumpling House in Shanghai: the big one. Arrive on the Bund, walk through the old town, then three short services
// in Chef Fu's kitchen and dining room, and a payoff. Progress is saved between services, so she can stop after any
// service and come back later to the next one.
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BigButton, say, SparklePuppet, useSaved, type PuppetHandle } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import { DouDou } from '../../puppets/DouDou'
import type { ActivityProps } from '../../Place'
import type { DoughColor } from '../../puppets/Dumpling'
import type { Basket } from './cook'
import { Dining1, Dining2, Dining3 } from './Dining'
import { OldTown } from './OldTown'
import { Payoff } from './Payoff'
import SECTIONS from './sections'
import { RIBBON, SAMPLE_SIX, Service1, Service2, Service3 } from './services'
import { useWord } from './shared'
import { WordCard } from '../../WordCard'

const D = L.dumplings
type Phase = (typeof SECTIONS.sections)[number]['id']
/** Stars in the top bar for each service. */
const SERVED = [2, 3, 3] // stars: one per two dumplings served
const TOTAL = 8
/** How many services are finished when each section begins. */
const DONE_AT: Record<Phase, number> = { arrive: 0, walk: 0, k1: 0, d1: 0, break1: 1, k2: 1, d2: 1, break2: 2, k3: 2, d3: 2, payoff: 3 }

// Baskets in a link: who:color-color-...,who:... (who names the ribbon; Grandpa Turtle's basket is s1).
type Who = keyof typeof RIBBON
const COLORS: DoughColor[] = ['cream', 'pink', 'green', 'yellow']
const basketOf = (who: Who, colors: DoughColor[]): Basket => ({ id: who === 'grandpa' ? 's1' : who, colors, ribbon: RIBBON[who] })
const whoOf = (b: Basket) => (b.id === 's1' ? 'grandpa' : b.id) as Who
const encode = (bs: Basket[]) => bs.map((b) => `${whoOf(b)}:${b.colors.join('-')}`).join(',')
function decode(s: string): Basket[] {
  return s
    .split(',')
    .map((part) => part.split(':'))
    .filter(([who]) => who in RIBBON)
    .map(([who, colors = '']) => basketOf(who as Who, colors.split('-').filter((c): c is DoughColor => COLORS.includes(c as DoughColor))))
    .filter((b) => b.colors.length)
}
/** What each kitchen cooks (when a link doesn't say). */
const COOKED: Partial<Record<Phase, Basket[]>> = {
  d1: [basketOf('grandpa', ['cream', 'cream', 'cream', 'cream'])],
  d2: [basketOf('bunnies', ['pink', 'pink', 'green', 'green']), basketOf('goose', ['yellow', 'yellow'])],
  d3: [basketOf('baobao', SAMPLE_SIX)],
}

export function DumplingHouse({ onDone, setProgress }: ActivityProps) {
  const { start, param, enter } = useSections(SECTIONS)
  // service = how many services are finished (0..3).
  const [saved, setSaved] = useSaved('china-dumplings', { service: 0 })
  // A deep link starts at its section; otherwise she carries on from the service she reached last time.
  const [phase, setPhase] = useState<Phase>(() => start ?? (['arrive', 'k2', 'k3', 'payoff'] as Phase[])[saved.service] ?? 'arrive')
  const [done, setDone] = useState(() => (start ? DONE_AT[start] : saved.service))
  const [baskets, setBaskets] = useState<Basket[]>(() => {
    if (!start || !COOKED[start]) return []
    const linked = decode(param('baskets'))
    return linked.length ? linked : COOKED[start]!
  })
  const chef = useRef<PuppetHandle>(null)
  const [word, showWord] = useWord()
  // Only the kitchen the link pointed at starts mid-way.
  const linked = (p: Phase) => (start === p ? param('at') : undefined)
  const linkedMade = start === 'k3' ? decode(param('baskets'))[0]?.colors : undefined

  useEffect(() => {
    setProgress(SERVED.slice(0, done).reduce((a, b) => a + b, 0), TOTAL)
  }, [done])

  // Kitchens report their own steps; dining rooms carry the baskets; everything else is the start of its section.
  useEffect(() => {
    if (phase === 'k1' || phase === 'k2' || phase === 'k3') return
    enter(phase, COOKED[phase] ? { baskets: encode(baskets) } : {})
  }, [phase])
  const kitchenAt = (p: Phase) => (at: string, made?: DoughColor[]) => enter(p, { at, baskets: made?.length ? encode([basketOf('baobao', made)]) : undefined })

  const finishService = (n: number, next: Phase) => {
    setSaved({ service: n })
    setDone(n)
    setPhase(next)
  }
  const cooked = (next: Phase) => (b: Basket[]) => {
    setBaskets(b)
    setPhase(next)
  }

  switch (phase) {
    case 'arrive':
      return (
        <>
          <StoryBeat
            lines={D.arrive}
            friend={<DouDou height="100%" />}
            bg={art.bgBund}
            onDone={() => setPhase('walk')}
          />
          <ArriveWord show={showWord} />
          <WordCard word={word} />
        </>
      )
    case 'walk':
      return <OldTown onDone={() => setPhase('k1')} />
    case 'k1':
      return <Service1 chef={chef} start={linked('k1')} onAt={kitchenAt('k1')} onDone={cooked('d1')} />
    case 'd1':
      return <Dining1 basket={baskets[0]} onDone={() => finishService(1, 'break1')} />
    case 'break1':
      return <Break onNext={() => setPhase('k2')} />
    case 'k2':
      return <Service2 chef={chef} start={linked('k2')} onAt={kitchenAt('k2')} onDone={cooked('d2')} />
    case 'd2':
      return <Dining2 baskets={baskets} onDone={() => finishService(2, 'break2')} />
    case 'break2':
      return <Break onNext={() => setPhase('k3')} />
    case 'k3':
      return <Service3 chef={chef} start={linked('k3')} made={linkedMade} onAt={kitchenAt('k3')} onDone={cooked('d3')} />
    case 'd3':
      return <Dining3 basket={baskets[0]} onDone={() => finishService(3, 'payoff')} />
    case 'payoff':
      return (
        <Payoff
          onDone={() => {
            setSaved({ service: 0 }) // playing again starts from the Bund
            setDone(0)
            onDone()
          }}
        />
      )
  }
}

/** Shows 侬好 when Dou Dou says hello. */
function ArriveWord({ show }: { show: (w: 'nonghao') => void }) {
  useEffect(() => {
    const t = setTimeout(() => show('nonghao'), 300)
    return () => clearTimeout(t)
  }, [])
  return null
}

/** Between services: a little cheer, then on to the next customers (or back to the map; progress is saved). */
function Break({ onNext }: { onNext: () => void }) {
  const sparkle = useRef<PuppetHandle>(null)
  const dou = useRef<PuppetHandle>(null)
  useEffect(() => {
    void say(D.serviceDone)
    const t = setTimeout(() => {
      void sparkle.current?.play('cheer')
      void dou.current?.play('cheer')
    }, 300)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(rgba(255,247,240,.4), rgba(255,247,240,.4)), url(${art.bgDining}) center / cover`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'min(24px, 3vh)', padding: 'var(--top-clear) 20px 20px' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '12px 26px', boxShadow: 'var(--shadow)', fontSize: 'clamp(22px, min(4vw, 5vh), 38px)', fontWeight: 600, textAlign: 'center' }}>
        ⭐ {D.serviceDone}
      </motion.div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'min(20px, 3vw)' }}>
        <SparklePuppet ref={sparkle} height="min(280px, 32vh, 40vw)" lookToward={0.5} />
        <DouDou ref={dou} height="min(240px, 28vh, 34vw)" />
      </div>
      <BigButton onClick={onNext} ariaLabel="Next customers">
        🥟 ▶
      </BigButton>
    </div>
  )
}

// 🥟 Dumpling House in Shanghai: the big one. Arrive on the Bund, walk through the old town, then three short services
// in Chef Fu's kitchen and dining room, and a payoff. Progress is saved between services, so she can stop after any
// service and come back later to the next one.
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BigButton, say, SparklePuppet, useSaved, type PuppetHandle } from '../../../../../sdk'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import { DouDou } from '../../puppets/DouDou'
import type { ActivityProps } from '../../Place'
import type { Basket } from './cook'
import { Dining1, Dining2, Dining3 } from './Dining'
import { OldTown } from './OldTown'
import { Payoff } from './Payoff'
import { Service1, Service2, Service3 } from './services'
import { useWord } from './shared'
import { WordCard } from '../../WordCard'

const D = L.dumplings
type Phase = 'arrive' | 'walk' | 'k1' | 'd1' | 'break1' | 'k2' | 'd2' | 'break2' | 'k3' | 'd3' | 'payoff'
/** Stars in the top bar for each service. */
const SERVED = [2, 3, 3] // stars: one per two dumplings served
const TOTAL = 8

export function DumplingHouse({ onDone, setProgress }: ActivityProps) {
  // service = how many services are finished (0..3).
  const [saved, setSaved] = useSaved('china-dumplings', { service: 0 })
  const [phase, setPhase] = useState<Phase>(() => (['arrive', 'k2', 'k3', 'payoff'] as Phase[])[saved.service] ?? 'arrive')
  const [baskets, setBaskets] = useState<Basket[]>([])
  const chef = useRef<PuppetHandle>(null)
  const [word, showWord] = useWord()

  useEffect(() => {
    setProgress(SERVED.slice(0, saved.service).reduce((a, b) => a + b, 0), TOTAL)
  }, [saved.service])

  const finishService = (n: number, next: Phase) => {
    setSaved({ service: n })
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
      return <Service1 chef={chef} onDone={cooked('d1')} />
    case 'd1':
      return <Dining1 basket={baskets[0]} onDone={() => finishService(1, 'break1')} />
    case 'break1':
      return <Break onNext={() => setPhase('k2')} />
    case 'k2':
      return <Service2 chef={chef} onDone={cooked('d2')} />
    case 'd2':
      return <Dining2 baskets={baskets} onDone={() => finishService(2, 'break2')} />
    case 'break2':
      return <Break onNext={() => setPhase('k3')} />
    case 'k3':
      return <Service3 chef={chef} onDone={cooked('d3')} />
    case 'd3':
      return <Dining3 basket={baskets[0]} onDone={() => finishService(3, 'payoff')} />
    case 'payoff':
      return (
        <Payoff
          onDone={() => {
            setSaved({ service: 0 }) // playing again starts from the Bund
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

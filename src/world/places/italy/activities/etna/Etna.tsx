// 🌋 Snow on a Volcano (Sicily: higher is colder, granita). Long ago, before freezers, Sicilians carried snow down from
// Mount Etna on donkeys and made icy treats with it. Nino the donkey is melting on the beach:
//   1. Climb Etna with Nino, watching the thermometer drop; 2. pack snow into his baskets; 3. zoom down (Mountain.tsx).
//   4. Make granita for three melting friends: scoop, squeeze a lemon, serve (Beach.tsx).
//   Payoff: Nino brings the piano (invented in Italy) to Lupa's band.
import { useEffect, useState } from 'react'
import { Buddy, useLandscape } from '../../../../../sdk'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Beach } from './Beach'
import { Mountain } from './Mountain'

/** Stars: two zones, the snow, the zoom, three granitas, the piano. */
const TOTAL = 8

export function Etna({ onDone, setProgress }: ActivityProps) {
  const landscape = useLandscape()
  const [step, setStep] = useState<'story' | 'mountain' | 'beach'>('story')
  const [done, setDone] = useState(0)
  useEffect(() => setProgress(done, TOTAL), [done])
  const onStep = () => setDone((n) => Math.min(TOTAL, n + 1))
  if (step === 'story') return <StoryBeat lines={L.etna.arrive} friend={<Buddy img={art.nino} voice="nino" height="100%" />} bg={landscape ? art.bgSicilyBeach : art.bgSicilyBeachTall} onDone={() => setStep('mountain')} />
  if (step === 'mountain') return <Mountain onStep={onStep} onDone={() => setStep('beach')} />
  return <Beach onStep={onStep} onDone={onDone} />
}

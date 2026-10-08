// 🛶 Venice (a city on the water, left and right, symmetry). Gino the pigeon gondolier rows Kaylee through the canals:
//   1. Row: swipe across the water and the gondola glides (Canal.tsx).
//   2. Left or right? At each fork she taps the sign (or her own hand) for the way Sparkle says (Fork.tsx).
//   3. Duck! A low bridge: the gondola waits until she taps Sparkle to duck.
//   4. Mirror mask: paint one half of a Carnevale mask and the other half paints itself (MaskShop.tsx).
//   Payoff: fireworks over the lagoon (Lagoon.tsx); Gino brings his accordion to Lupa's band.
import { useEffect, useState } from 'react'
import { Buddy, useLandscape } from '../../../../../sdk'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Canal } from './Canal'
import { Fork } from './Fork'
import { Lagoon } from './Lagoon'
import { MaskShop } from './MaskShop'

type Step = 'story' | 'leg0' | 'fork0' | 'leg1' | 'fork1' | 'leg2' | 'mask' | 'lagoon'
/** Stars: three legs, two forks, the duck, the mask paint and gems, the fireworks, the accordion. */
const TOTAL = 10

export function Venice({ onDone, setProgress }: ActivityProps) {
  const landscape = useLandscape()
  const [step, setStep] = useState<Step>('story')
  const [done, setDone] = useState(0)
  useEffect(() => setProgress(done, TOTAL), [done])
  const onStep = () => setDone((n) => Math.min(TOTAL, n + 1))
  const forkDone = () => {
    onStep()
    setStep(step === 'fork0' ? 'leg1' : 'leg2')
  }

  if (step === 'story') return <StoryBeat lines={L.venice.arrive} friend={<Buddy img={art.gino} voice="gino" height="100%" />} bg={landscape ? art.bgVeniceCanal : art.bgVeniceCanalTall} onDone={() => setStep('leg0')} />
  if (step === 'leg0') return <Canal key="l0" leg={0} onStep={onStep} onArrive={() => setStep('fork0')} />
  if (step === 'fork0') return <Fork key="f0" want="left" onDone={forkDone} />
  if (step === 'leg1') return <Canal key="l1" leg={1} onStep={onStep} onArrive={() => setStep('fork1')} />
  if (step === 'fork1') return <Fork key="f1" want="right" onDone={forkDone} />
  if (step === 'leg2') return <Canal key="l2" leg={2} onStep={onStep} onArrive={() => setStep('mask')} />
  if (step === 'mask') return <MaskShop onStep={onStep} onDone={() => setStep('lagoon')} />
  return <Lagoon onStep={onStep} onDone={onDone} />
}

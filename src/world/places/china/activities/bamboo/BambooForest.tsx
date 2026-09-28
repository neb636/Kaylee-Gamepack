// 🎋 Bamboo Forest (Sichuan): Bao Bao the baby panda is hungry. Swipe up on a bamboo shoot to grow it one segment at a
// time (round 1: three tall; round 2: make one taller than the other; round 3: tap the tallest, then the shortest).
// Between rounds she munches. The payoff: she climbs the tallest bamboo, it bends, and she tumbles into a leaf pile.
import { useState } from 'react'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import { BaoBao } from '../../puppets/BaoBao'
import type { ActivityProps } from '../../Place'
import { useLandscape } from '../../../../../sdk'
import { Forest } from './Forest'

export function BambooForest({ onDone, setProgress }: ActivityProps) {
  const [story, setStory] = useState(true)
  const landscape = useLandscape()
  if (story) return <StoryBeat lines={L.bamboo.arrive} friend={<BaoBao height="100%" />} bg={landscape ? art.bgBamboo : art.bgBambooTall} onDone={() => setStory(false)} />
  return <Forest onDone={onDone} setProgress={setProgress} />
}

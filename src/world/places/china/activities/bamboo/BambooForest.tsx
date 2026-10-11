// 🎋 Bamboo Forest (Sichuan): Bao Bao the baby panda is hungry. Swipe up on a bamboo shoot to grow it one segment at a
// time (round 1: three tall; round 2: make one taller than the other; round 3: tap the tallest, then the shortest).
// Between rounds she munches. The payoff: she climbs the tallest bamboo, it bends, and she tumbles into a leaf pile.
import { useEffect, useState } from 'react'
import { useSections } from '../../../../kit/sections'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import { BaoBao } from '../../puppets/BaoBao'
import type { ActivityProps } from '../../Place'
import { useLandscape } from '../../../../../sdk'
import { Forest } from './Forest'
import SECTIONS from './sections'

export function BambooForest({ onDone, setProgress }: ActivityProps) {
  const { start, enter } = useSections(SECTIONS)
  const [story, setStory] = useState(!start || start === 'story')
  const landscape = useLandscape()
  useEffect(() => {
    if (story) enter('story')
  }, [])
  if (story) return <StoryBeat lines={L.bamboo.arrive} friend={<BaoBao height="100%" />} bg={landscape ? art.bgBamboo : art.bgBambooTall} onDone={() => setStory(false)} />
  return <Forest start={start === 'story' ? null : start} onSection={enter} onDone={onDone} setProgress={setProgress} />
}

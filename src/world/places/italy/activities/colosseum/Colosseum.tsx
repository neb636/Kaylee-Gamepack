// 🏛️ The Colosseum (Rome). Cesare the cat thinks he's the emperor, and tonight there's a surprise show:
//   1. It's hot! Pull the ropes to unroll the sun-shade over the crowd.
//   2. Roman numeral trapdoors (I, II, III, then IV and V): friends ride the secret elevators up and do tricks.
//   3. Grand finale: every door opens, and she swipes a stadium wave across the crowd.
//   Payoff: Cesare bows and brings his Roman horn to Lupa's band.
// One camera: straight on, eye level, with a cutaway of the tunnels under the floor (Arena.tsx).
import { useEffect, useState } from 'react'
import { useLandscape } from '../../../../../sdk'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Cesare } from '../../puppets/Cesare'
import { Arena } from './Arena'

/** Stars: three ropes, five doors, the wave. */
const TOTAL = 9

export function Colosseum({ onDone, setProgress }: ActivityProps) {
  const landscape = useLandscape()
  const [story, setStory] = useState(true)
  const [done, setDone] = useState(0)
  useEffect(() => setProgress(done, TOTAL), [done])
  if (story) return <StoryBeat lines={L.colosseum.arrive} friend={<Cesare height="100%" />} bg={landscape ? art.bgColosseum : art.bgColosseumTall} onDone={() => setStory(false)} />
  return <Arena onStep={() => setDone((n) => Math.min(TOTAL, n + 1))} onDone={onDone} />
}

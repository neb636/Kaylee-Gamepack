// 🏛️ The Colosseum (Rome). Cesare the cat thinks he's the emperor, and tonight there's a surprise show:
//   1. It's hot! Pull the ropes to unroll the sun-shade over the crowd.
//   2. Roman numeral trapdoors (I, II, III, then IV and V): friends ride the secret elevators up and do tricks.
//   3. Grand finale: every door opens, and she swipes a stadium wave across the crowd.
//   Payoff: Cesare bows and brings his Roman horn to Lupa's band.
// One camera: straight on, eye level, with a cutaway of the tunnels under the floor (Arena.tsx).
import { useEffect, useState } from 'react'
import { useLandscape } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Cesare } from '../../puppets/Cesare'
import { Arena } from './Arena'
import SECTIONS from './sections'

/** Stars: three ropes, five doors, the wave. */
const TOTAL = 9
type SectionId = (typeof SECTIONS.sections)[number]['id']
/** Stars already earned when each section begins (a deep link starts with these). */
const STARS_AT: Record<SectionId, number> = { story: 0, shade: 0, 'doors-1': 3, 'doors-2': 6, finale: 8, payoff: 9 }

export function Colosseum({ onDone, setProgress }: ActivityProps) {
  const landscape = useLandscape()
  const { start, enter } = useSections(SECTIONS)
  const [story, setStory] = useState(!start || start === 'story')
  const [done, setDone] = useState(() => STARS_AT[start ?? 'story'])
  useEffect(() => setProgress(done, TOTAL), [done])
  // The arena reports its own parts (shade, doors, finale, payoff).
  useEffect(() => {
    if (story) enter('story')
  }, [story])
  if (story) return <StoryBeat lines={L.colosseum.arrive} friend={<Cesare height="100%" />} bg={landscape ? art.bgColosseum : art.bgColosseumTall} onDone={() => setStory(false)} />
  return <Arena start={start === 'story' ? null : start} onSection={enter} onStep={() => setDone((n) => Math.min(TOTAL, n + 1))} onDone={onDone} />
}

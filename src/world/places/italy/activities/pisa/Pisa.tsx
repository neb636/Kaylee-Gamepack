// 🗼 The Leaning Tower of Pisa (science: balance and gravity). Professoressa Civetta's tower leans more and more:
//   1. Balance it: drag heavy weights to the high side until it stops leaning (what engineers really did).
//   2. The famous photo: drag Sparkle until her hoof "holds up" the tower. Snap!
//   3. Galileo's drop: guess which lands first, then drop them from the top (melon and lemon land together; a feather
//      floats; then she picks two things herself).
//   Payoff: the tower is a bell tower with seven bells, one per note (do re mi...). Civetta brings the bells to the band.
// One camera: straight on, eye level, the tower standing on the lawn (Square.tsx).
import { useEffect, useState } from 'react'
import { useLandscape } from '../../../../../sdk'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Civetta } from '../../puppets/Civetta'
import { Square } from './Square'

/** Stars: three weights, the photo, three drops, the bells. */
const TOTAL = 8

export function Pisa({ onDone, setProgress }: ActivityProps) {
  const landscape = useLandscape()
  const [story, setStory] = useState(true)
  const [done, setDone] = useState(0)
  useEffect(() => setProgress(done, TOTAL), [done])
  if (story) return <StoryBeat lines={L.pisa.arrive} friend={<Civetta height="100%" />} bg={landscape ? art.bgPisa : art.bgPisaTall} onDone={() => setStory(false)} />
  return <Square onStep={() => setDone((n) => Math.min(TOTAL, n + 1))} onDone={onDone} />
}

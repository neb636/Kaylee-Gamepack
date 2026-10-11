// ⛲ The Trevi Fountain (Rome). The fountain is dry! A real legend is the heart of it: long ago a girl showed the Romans
// where to find a spring, and they built an aqueduct (a water bridge) to carry it to Rome. It still fills the Trevi
// Fountain, about 2,000 years later. Today Kaylee is that girl.
//   1. Find the spring: tap the hill and listen (Aqueduct.tsx).
//   2. Build the aqueduct: arches that fit the valley so the channel goes downhill all the way (two rounds).
//   3. Water on: the water runs to Rome.
//   4. The fountain fills with a splash, then she tosses two coins; Lupa tosses one and wishes she could sing (Fountain.tsx).
// Every scene is one side-on, eye-level camera (a theater stage): things stand on the ground line.
import { useEffect, useState } from 'react'
import { useSections } from '../../../../kit/sections'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Lupa } from '../../puppets/Lupa'
import { useWord, WordCard } from '../../WordCard'
import { Aqueduct } from './Aqueduct'
import { Fountain } from './Fountain'
import SECTIONS from './sections'

const T = L.trevi
/** Stars: the spring, seven arches, water on, the fountain, two coins. */
const TOTAL = 12
type SectionId = (typeof SECTIONS.sections)[number]['id']
/** Stars already earned when each section begins (a deep link starts with these). */
const STARS_AT: Record<SectionId, number> = { story: 0, spring: 0, 'arches-1': 1, 'arches-2': 4, 'water-on': 8, fountain: 9 }

export function Trevi({ onDone, setProgress }: ActivityProps) {
  const { start, enter } = useSections(SECTIONS)
  const [scene, setScene] = useState<'story' | 'valley' | 'fountain'>(start === 'story' || !start ? 'story' : start === 'fountain' ? 'fountain' : 'valley')
  const [done, setDone] = useState(() => STARS_AT[start ?? 'story'])
  const [word, showWord] = useWord()
  useEffect(() => setProgress(done, TOTAL), [done])
  // The valley reports its own parts (spring, arch rounds, water on).
  useEffect(() => {
    if (scene !== 'valley') enter(scene)
  }, [scene])
  const step = () => setDone((n) => Math.min(TOTAL, n + 1))

  return (
    <>
      {scene === 'story' && <StoryBeat lines={[T.dry, T.where]} friend={<Lupa height="100%" />} bg={art.bgTreviDry} onDone={() => setScene('valley')} />}
      {scene === 'valley' && <Aqueduct start={start === 'arches-1' || start === 'arches-2' || start === 'water-on' ? start : undefined} onSection={enter} onStep={step} showWord={showWord} onDone={() => setScene('fountain')} />}
      {scene === 'fountain' && <Fountain onStep={step} showWord={showWord} onDone={onDone} />}
      <WordCard word={word} />
    </>
  )
}

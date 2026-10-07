// ⛲ The Trevi Fountain (Rome). The fountain is dry! A real legend is the heart of it: long ago a girl showed the Romans
// where to find a spring, and they built an aqueduct (a water bridge) to carry it to Rome. It still fills the Trevi
// Fountain, about 2,000 years later. Today Kaylee is that girl.
//   1. Find the spring: tap the hill and listen (Aqueduct.tsx).
//   2. Build the aqueduct: arches that fit the valley so the channel goes downhill all the way (two rounds).
//   3. Water on: the water runs to Rome.
//   4. The fountain fills with a splash, then she tosses two coins; Lupa tosses one and wishes she could sing (Fountain.tsx).
// Every scene is one side-on, eye-level camera (a theater stage): things stand on the ground line.
import { useEffect, useState } from 'react'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Lupa } from '../../puppets/Lupa'
import { useWord, WordCard } from '../../WordCard'
import { Aqueduct } from './Aqueduct'
import { Fountain } from './Fountain'

const T = L.trevi
/** Stars: the spring, seven arches, water on, the fountain, two coins. */
const TOTAL = 12

export function Trevi({ onDone, setProgress }: ActivityProps) {
  const [scene, setScene] = useState<'story' | 'valley' | 'fountain'>('story')
  const [done, setDone] = useState(0)
  const [word, showWord] = useWord()
  useEffect(() => setProgress(done, TOTAL), [done])
  const step = () => setDone((n) => Math.min(TOTAL, n + 1))

  return (
    <>
      {scene === 'story' && <StoryBeat lines={[T.dry, T.where]} friend={<Lupa height="100%" />} bg={art.bgTreviDry} onDone={() => setScene('valley')} />}
      {scene === 'valley' && <Aqueduct onStep={step} showWord={showWord} onDone={() => setScene('fountain')} />}
      {scene === 'fountain' && <Fountain onStep={step} showWord={showWord} onDone={onDone} />}
      <WordCard word={word} />
    </>
  )
}

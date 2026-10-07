// 🫒 The Olive Grove (Puglia, the heel of the boot). Spina the crested porcupine needs help with the olive harvest:
//   1. Comb the branches: drag the rake along each branch, olives rain into the net (some stick on Spina's quills).
//   2. Green to black: tap the sun to ripen an olive, then put three olives in order, youngest to ripest.
//      Spina tries a fresh one: bitter!
//   3. The olive mill (frantoio): ten olives into the funnel, the stone wheel crushes them, oil runs into the jug.
//   4. Pour to the line: fill one bottle all the way, and one halfway.
//   Payoff: bruschetta for everyone, and Spina brings her tambourine to Lupa's band.
// Every scene uses one camera: straight on, from the side, things standing on the ground.
import { useEffect, useState } from 'react'
import { useLandscape } from '../../../../../sdk'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { Spina } from '../../puppets/Spina'
import { Grove } from './Grove'
import { Mill } from './Mill'
import { Payoff } from './Payoff'
import { Pour } from './Pour'
import { Ripen } from './Ripen'

const O = L.olives
/** Stars: two for the branches, sort, mill, bottle full, bottle half. */
const TOTAL = 6
type Step = 'story' | 'grove' | 'ripen' | 'mill' | 'pour' | 'payoff'

export function OliveGrove({ onDone, setProgress }: ActivityProps) {
  const landscape = useLandscape()
  const [step, setStep] = useState<Step>('story')
  const [done, setDone] = useState(0)
  useEffect(() => setProgress(done, TOTAL), [done])
  const star = (n: number) => setDone((d) => Math.max(d, n))

  switch (step) {
    case 'story':
      return <StoryBeat lines={O.arrive} friend={<Spina height="100%" />} bg={landscape ? art.bgOliveGrove : art.bgOliveGroveTall} onDone={() => setStep('grove')} />
    case 'grove':
      return <Grove onBranch={(n) => n > 1 && star(n - 1)} onDone={() => setStep('ripen')} />
    case 'ripen':
      return <Ripen onStar={(n) => n === 2 && star(3)} onDone={() => setStep('mill')} />
    case 'mill':
      return <Mill onDone={() => (star(4), setStep('pour'))} />
    case 'pour':
      return <Pour onStar={(n) => star(4 + n)} onDone={() => setStep('payoff')} />
    case 'payoff':
      return <Payoff onDone={onDone} />
  }
}

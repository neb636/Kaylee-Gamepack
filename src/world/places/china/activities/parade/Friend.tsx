// One friend under the dragon: a live puppet when we have one, otherwise a Buddy (flat picture that breathes and hops).
import { forwardRef } from 'react'
import { Buddy, type PuppetHandle } from '../../../../../sdk'
import { art } from '../../art'
import { BaoBao } from '../../puppets/BaoBao'
import { ChefFu } from '../../puppets/ChefFu'
import { DouDou } from '../../puppets/DouDou'
import { Hong } from '../../puppets/Hong'
import { HouHou } from '../../puppets/HouHou'
import { Mouse } from '../../puppets/Mouse'
import type { Who } from './guests'

const sprites = art as unknown as Record<string, string | undefined>
const EMOJI: Partial<Record<Who, string>> = { crane: '🦢', ox: '🐂', tiger: '🐯' }

export const Friend = forwardRef<PuppetHandle, { who: Who; height: string }>(function Friend({ who, height }, ref) {
  switch (who) {
    case 'baobao':
      return <BaoBao ref={ref} height={height} />
    case 'houhou':
      return <HouHou ref={ref} height={height} />
    case 'hong':
      return <Hong ref={ref} height={height} />
    case 'mouse':
      return <Mouse ref={ref} height={height} />
    case 'doudou':
      return <DouDou ref={ref} height={height} />
    case 'cheffu':
      return <ChefFu ref={ref} height={height} />
    default: {
      const img = sprites[who]
      if (img) return <Buddy ref={ref} img={img} voice={who} height={height} />
      return (
        <div style={{ height, aspectRatio: '1', display: 'grid', placeItems: 'center', fontSize: `calc(${height} * 0.7)` }} aria-hidden>
          {EMOJI[who] ?? '🐾'}
        </div>
      )
    }
  }
})

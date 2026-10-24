// The Nan road trip (plan: planning/around-the-world/thailand/nan-trip.md). Still in the works (meta.ts `inTheWorks`):
// only its links open it. So far, two greyboxes: the mountain road (drive/, section drive), where Kaylee steers Mommy's
// silver Pajero along one of the four roads and the end card takes her down another; and Baan Huanam Mushroom Farm
// (mushrooms/, section mushrooms), where she mists the sawdust bags, picks the mushrooms and tops the pizza. The valley
// road ends at the farm (its end card's 🍄), and the farm's end card puts her back on the road (the sky road, up to
// the café). The trip around them (the plane, the rental desk, the Nan map, the other stops and home) comes in the next
// steps of the plan.
import { useEffect, useState } from 'react'
import { useSections } from '../../../../kit/sections'
import { Drive } from './drive/Drive'
import type { RoadId } from './drive/roads'
import { BASKET_SEED, type Round } from './mushrooms/layout'
import { Mushrooms } from './mushrooms/Mushrooms'
import NAN_SECTIONS from './sections'

type At = { section: 'drive'; road: RoadId } | { section: 'mushrooms'; round: Round; basket: string }

export function NanTrip() {
  const { start, param, enter } = useSections(NAN_SECTIONS)
  // (Read once: the address changes as she plays.)
  const [at, setAt] = useState<At>(() => {
    if (start === 'mushrooms') {
      const round = param('round') as Round
      return { section: 'mushrooms', round, basket: param('basket') || BASKET_SEED[round] }
    }
    return { section: 'drive', road: param('road') as RoadId }
  })
  useEffect(() => {
    if (at.section === 'drive') enter('drive', { road: at.road })
    else enter('mushrooms', { round: at.round, basket: at.basket })
  }, [at])

  if (at.section === 'mushrooms')
    return (
      <Mushrooms
        key="mushrooms"
        round={at.round}
        basket={at.basket}
        onRound={(round, basket) => setAt({ section: 'mushrooms', round, basket })}
        onBasket={(basket) => setAt((a) => (a.section === 'mushrooms' ? { ...a, basket } : a))}
        onDrive={() => setAt({ section: 'drive', road: 'sky' })}
      />
    )
  return <Drive key="drive" road={at.road} onRoad={(road) => setAt({ section: 'drive', road })} onStop={() => setAt({ section: 'mushrooms', round: '1', basket: '' })} />
}

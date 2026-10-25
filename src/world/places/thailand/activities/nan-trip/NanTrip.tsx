// The Nan road trip (plan: planning/around-the-world/thailand/nan-trip.html). Still in the works (meta.ts `inTheWorks`):
// only its links open it. So far, two greyboxes: the mountain road (drive/, section drive), where Kaylee steers Mommy's
// silver Pajero along one of the four roads and the end card takes her down another; and Baan Huanam Mushroom Farm
// (mushrooms/, section mushrooms), where she mists the sawdust bags, picks the mushrooms and tops the pizza. The valley
// road ends at the farm (its end card's 🍄), and the farm's end card puts her back on the road (the sky road, up to
// the café). And Kaylee's rice farm under Stop Time Cafe (rice/, section rice), where she leads Kaylee through the
// paddies to plant them, shoos the birds while the rice grows and cuts it, then has her pink milk on the deck: the sky
// road ends there (its end card's 🌾), and the farm's end card takes the 3 road. The trip around them (the plane, the rental desk, the Nan map, the other stops and
// home) comes in the next steps of the plan.
import { useEffect, useState } from 'react'
import { useSections } from '../../../../kit/sections'
import { Drive } from './drive/Drive'
import type { RoadId } from './drive/roads'
import { BASKET_SEED, ROUNDS as FARM_ROUNDS, type Round } from './mushrooms/layout'
import { Mushrooms } from './mushrooms/Mushrooms'
import { ROUNDS as RICE_ROUNDS, type Round as RiceRound } from './rice/layout'
import { Rice } from './rice/Rice'
import type { Round as SaltRound } from './salt/layout'
import { Salt } from './salt/Salt'
import NAN_SECTIONS from './sections'

type At = { section: 'drive'; road: RoadId } | { section: 'mushrooms'; round: Round; basket: string } | { section: 'rice'; round: RiceRound } | { section: 'salt'; round: SaltRound }


export function NanTrip() {
  const { start, param, enter } = useSections(NAN_SECTIONS)
  // (Read once: the address changes as she plays.)
  const [at, setAt] = useState<At>(() => {
    if (start === 'mushrooms') {
      // (The round param is shared with the café: one of its rounds starts the farm from the top.)
      const round = ((FARM_ROUNDS as readonly string[]).includes(param('round')) ? param('round') : '1') as Round
      return { section: 'mushrooms', round, basket: param('basket') || BASKET_SEED[round] }
    }
    if (start === 'salt') return { section: 'salt', round: (['1', '2', '3'].includes(param('round')) ? param('round') : '1') as SaltRound }
    if (start === 'rice') return { section: 'rice', round: ((RICE_ROUNDS as readonly string[]).includes(param('round')) ? param('round') : 'plant') as RiceRound }
    return { section: 'drive', road: param('road') as RoadId }
  })
  useEffect(() => {
    if (at.section === 'drive') enter('drive', { road: at.road })
    else if (at.section === 'rice') enter('rice', { round: at.round })
    else if (at.section === 'salt') enter('salt', { round: at.round })
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
  if (at.section === 'salt') return <Salt key="salt" round={at.round} onRound={(round) => setAt({ section: 'salt', round })} onDrive={() => setAt({ section: 'drive', road: 'three' })} />
  if (at.section === 'rice') return <Rice key="rice" round={at.round} onRound={(round) => setAt({ section: 'rice', round })} onDrive={() => setAt({ section: 'drive', road: 'three' })} />
  return (
    <Drive
      key="drive"
      road={at.road}
      onRoad={(road) => setAt({ section: 'drive', road })}
      onStop={(road, stop) => setAt(stop === 'salt' ? { section: 'salt', round: '1' } : road === 'sky' ? { section: 'rice', round: 'plant' } : { section: 'mushrooms', round: '1', basket: '' })}
    />
  )
}

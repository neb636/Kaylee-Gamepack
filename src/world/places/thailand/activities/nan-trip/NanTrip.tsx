// The Nan road trip (plan: planning/around-the-world/thailand/nan-trip.html). Still in the works (meta.ts `inTheWorks`):
// only its links open it. Built so far, as greyboxes, and joined up from the rental desk on:
//   the rental desk (rental/, section rental): the key fob, the bags into the boot, the seatbelt, and off they drive to
//   the Nan map (map/, section map), the trip's hub: tap a place (or drag the little Pajero there) and it drives there
//   on the diorama, then the mountain road (drive/, section drive) to it: the valley road to Baan Huanam Mushroom Farm
//   (mushrooms/), the sky road to Kaylee's rice farm under Stop Time Cafe (rice/) or to Bo Kluea's salt wells (salt/),
//   the city road through Nan town and back. Each stop's end card goes back to the map, where its stamp lands. After
//   two stops the airport opens: the 3 road, and at its viewpoint she draws the 3 (section three).
// The way there (the plane from Bangkok) and home (Agong's wall) come in the next steps of the plan.
import { useEffect, useState } from 'react'
import { useSections } from '../../../../kit/sections'
import { Drive } from './drive/Drive'
import type { RoadId } from './drive/roads'
import { PLACES, STOPS, type PlaceId, type Stop } from './map/layout'
import { NanMap } from './map/NanMap'
import { BASKET_SEED, ROUNDS as FARM_ROUNDS, type Round } from './mushrooms/layout'
import { Mushrooms } from './mushrooms/Mushrooms'
import { ROUNDS as RENTAL_ROUNDS, type Round as RentalRound } from './rental/layout'
import { Rental } from './rental/Rental'
import { ROUNDS as RICE_ROUNDS, type Round as RiceRound } from './rice/layout'
import { Rice } from './rice/Rice'
import type { Round as SaltRound } from './salt/layout'
import { Salt } from './salt/Salt'
import NAN_SECTIONS from './sections'

type At =
  | { section: 'rental'; round: RentalRound }
  | { section: 'map' }
  | { section: 'drive'; road: RoadId; to: string }
  | { section: 'three' }
  | { section: 'mushrooms'; round: Round; basket: string }
  | { section: 'rice'; round: RiceRound }
  | { section: 'salt'; round: SaltRound }

/** The `stops` param: the stops done so far, in order (anything else dropped). */
const parseStops = (s: string) => [...new Set(s.split(',').filter((x): x is Stop => (STOPS as readonly string[]).includes(x)))]

/** Where a place on the map leads: the road there, and where that road's end goes. */
function driveTo(place: PlaceId): At {
  // (The airport is home, down the 3 road: it ends at the viewpoint. Nan town is a drive through and back.)
  return { section: 'drive', road: PLACES[place].road, to: place === 'airport' ? '' : place === 'town' ? 'map' : place }
}

export function NanTrip() {
  const { start, param, enter } = useSections(NAN_SECTIONS)
  // (Read once: the address changes as she plays.)
  const [stops, setStops] = useState<Stop[]>(() => parseStops(param('stops')))
  const [at, setAt] = useState<At>(() => {
    const round = param('round')
    if (start === 'mushrooms') {
      // (The round param is shared with the other stops: one of their rounds starts the farm from the top.)
      const r = ((FARM_ROUNDS as readonly string[]).includes(round) ? round : '1') as Round
      return { section: 'mushrooms', round: r, basket: param('basket') || BASKET_SEED[r] }
    }
    if (start === 'salt') return { section: 'salt', round: (['1', '2', '3'].includes(round) ? round : '1') as SaltRound }
    if (start === 'rice') return { section: 'rice', round: ((RICE_ROUNDS as readonly string[]).includes(round) ? round : 'plant') as RiceRound }
    if (start === 'drive') return { section: 'drive', road: param('road') as RoadId, to: param('to') }
    if (start === 'map') return { section: 'map' }
    if (start === 'three') return { section: 'three' }
    return { section: 'rental', round: ((RENTAL_ROUNDS as readonly string[]).includes(round) ? round : 'key') as RentalRound }
  })
  useEffect(() => {
    const s = { stops: stops.join(',') }
    if (at.section === 'drive') enter('drive', { road: at.road, ...(at.to ? { to: at.to } : {}), ...s })
    else if (at.section === 'map' || at.section === 'three') enter(at.section, s)
    else if (at.section === 'mushrooms') enter('mushrooms', { round: at.round, basket: at.basket, ...s })
    else enter(at.section, { round: at.round, ...s })
  }, [at, stops])

  /** Back to the map from a stop: its stamp lands there. */
  const done = (stop: Stop) => () => {
    setStops((s) => (s.includes(stop) ? s : [...s, stop]))
    setAt({ section: 'map' })
  }

  if (at.section === 'rental') return <Rental key="rental" round={at.round} onRound={(round) => setAt({ section: 'rental', round })} onDone={() => setAt({ section: 'map' })} />
  if (at.section === 'map') return <NanMap key={`map:${stops.join(',')}`} stops={stops} onGo={(place) => setAt(driveTo(place))} />
  if (at.section === 'mushrooms')
    return (
      <Mushrooms
        key="mushrooms"
        round={at.round}
        basket={at.basket}
        onRound={(round, basket) => setAt({ section: 'mushrooms', round, basket })}
        onBasket={(basket) => setAt((a) => (a.section === 'mushrooms' ? { ...a, basket } : a))}
        onMap={done('mushrooms')}
      />
    )
  if (at.section === 'salt') return <Salt key="salt" round={at.round} onRound={(round) => setAt({ section: 'salt', round })} onMap={done('salt')} />
  if (at.section === 'rice') return <Rice key="rice" round={at.round} onRound={(round) => setAt({ section: 'rice', round })} onMap={done('rice')} />
  // The 3 from above is the 3 road's world, parked at the viewpoint (the same Drive, so it doesn't rebuild when the
  // road gets there).
  const three = at.section === 'three'
  return (
    <Drive
      key="drive"
      road={three ? 'three' : at.road}
      view={three}
      to={three ? '' : at.to}
      onRoad={(road) => setAt({ section: 'drive', road, to: '' })}
      onStop={(road, stop) => {
        const s = (stop ?? (road === 'sky' ? 'rice' : 'mushrooms')) as Stop
        setAt(s === 'salt' ? { section: 'salt', round: '1' } : s === 'rice' ? { section: 'rice', round: 'plant' } : { section: 'mushrooms', round: '1', basket: '' })
      }}
      onMap={() => setAt({ section: 'map' })}
      onView={() => setAt({ section: 'three' })}
    />
  )
}

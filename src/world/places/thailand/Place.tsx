// Thailand: Kaylee's family's country, in 3D (plan: planning/around-the-world/thailand.md). She lands on the Thailand
// map (activities/hub/map/, plan: thailand/thailand-map.md) and taps Bangkok, Krabi, Nan or Koh Samet. Bangkok
// is the Thailand house (activities/hub/), where she walks around, meets her family and pokes everything. The places the family
// loves become activities, four of them, all built and on for Kaylee: the boat trip in Krabi (activities/boat-trip/: the
// bay, the stamp and the fiddler crab sticker); the mall day (activities/mall-trip/: Mom's question, the Veloz,
// ICONSIAM, HarborLand's hall of mini games, the pizza table, home with the pizza box for Aunty Jum, the pizza slice
// sticker); the Nan road trip (activities/nan-trip/: the Nan map, the mushroom farm, the rice farm, the salt wells, the
// Nan Mountain Cup, the pink mushroom sticker); and the Koh Samet trip (activities/samet-trip/: the Lost Fireflies
// story, four stops and the fire show, the pink mermaid sticker). The finale (route `party`), the family party, isn't
// built yet: it shows `PartySoon`.
import { use } from 'react'
import { useStampFlow } from '../../kit/stampFlow'
import { worldLink } from '../../../router'
import { useSections } from '../../kit/sections'
import type { PlaceProps } from '../../types'
import { BoatTrip } from './activities/boat-trip/BoatTrip'
import { kayleeReady } from './characters/model'
import { dadReady } from './characters/dad-model'
import { momReady } from './characters/mom-model'
import { Hub } from './activities/hub/Hub'
import { ThaiMap } from './activities/hub/map/ThaiMap'
import HUB_SECTIONS from './activities/hub/sections'
import { MallTrip } from './activities/mall-trip/MallTrip'
import { NanTrip } from './activities/nan-trip/NanTrip'
import { PartySoon } from './PartySoon'
import { SametTrip } from './activities/samet-trip/SametTrip'
import { saidYes } from './trip/legs/Ask'
import { MALL_FACTS, NAN_FACTS, SAMET_FACTS, TRIP_FACTS } from './trip/facts'

export default function Place(props: PlaceProps) {
  const { meta, activity, backToMap, openActivity } = props
  // Kaylee, Mom and Dad are modelled vinyl toys: their GLBs load before any scene builds (PlaceFrame's Suspense shows
  // Sparkle thinking meanwhile), so every Avatar is her, every Mom the cream unicorn and every Dad the mint one from
  // the first frame.
  use(kayleeReady())
  use(momReady())
  use(dadReady())
  // The boat and Nan trips end on the Thailand map: the stamp, then the plane flies home and the stamp lands on the
  // pin. The mall day ends on the photo wall: the stamp, then back in the house downstairs, by her photo.
  const stamps = useStampFlow(props, {
    closeIcon: '🏠 ▶',
    layer: true,
    facts: (info) => (info.id === 'boat-trip' ? TRIP_FACTS : info.id === 'nan-trip' ? NAN_FACTS : info.id === 'samet-trip' ? SAMET_FACTS : MALL_FACTS),
    after: (info) => {
      location.hash = info.id === 'mall-trip' ? worldLink(meta.id, 'hub', 'downstairs', { at: 'photos' }) : worldLink(meta.id, 'hub', 'map', { stamp: info.id })
    },
  })
  if (activity === 'party') return <PartySoon backToMap={backToMap} />
  const info = meta.activities.find((a) => a.id === activity) ?? meta.inTheWorks?.find((a) => a.id === activity)
  // (An activity still in the works has no recorded sticker line.)
  const finish = info ? stamps.finishFor(info, { live: meta.activities.includes(info) }) : () => {}
  const stamp = stamps.overlay
  // Another trip picked on Mom's card inside a trip: it opens straight on its first leg.
  const otherTrip = (id: string) => {
    saidYes.at = performance.now()
    saidYes.trip = id
    openActivity(id)
  }
  if (activity === 'mall-trip' && info) {
    return (
      <>
        <MallTrip onExit={backToMap} onTrip={otherTrip} onDone={finish} />
        {stamp}
      </>
    )
  }
  // The Nan road trip, from the map's Nan pin.
  if (activity === 'nan-trip' && info) {
    return (
      <>
        <NanTrip onExit={backToMap} onTrip={otherTrip} onDone={finish} />
        {stamp}
      </>
    )
  }
  // The Koh Samet trip, from the map's 🏝️ pin. Home from
  // the island (Mom's photo on the photo wall), the stamp, then the map: the stamp lands on the 🏝️ pin. The speedboat
  // home before the island is done (its home picture at Na Dan pier) goes back to the map, the trip kept.
  if (activity === 'samet-trip' && info) {
    return (
      <>
        <SametTrip onDone={finish} onExit={backToMap} />
        {stamp}
      </>
    )
  }
  if (activity === 'boat-trip' && info) {
    return (
      <>
        <BoatTrip onExit={backToMap} onDone={finish} />
        {stamp}
      </>
    )
  }
  return <Home {...props} />
}

/** No activity: the Thailand map, or (a house link: arrive, street, downstairs, ...) the Thailand house. */
function Home(props: PlaceProps) {
  const { start } = useSections(HUB_SECTIONS)
  return start && start !== 'map' ? <Hub {...props} /> : <ThaiMap {...props} />
}

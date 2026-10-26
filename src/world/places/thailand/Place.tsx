// Thailand: Kaylee's family's country, in 3D (plan: planning/around-the-world/thailand.md). The home base is Agong's
// shophouse (activities/hub/), where she walks around, meets her family and pokes everything. The places the family
// loves become activities, one per PR: the first is the boat trip (activities/boat-trip/), which ends with her photo on
// Agong's wall and the stamp (the fiddler crab sticker, and the trip's facts to tap); the second is the mall day
// (activities/mall-trip/, greyboxes so far, still in the works: Mommy's question, the Veloz, ICONSIAM, HarborLand's
// hall of mini games, the pizza table, and home with the pizza box for Agong, then its stamp and the pizza slice
// sticker); the third is the Nan road trip (activities/nan-trip/, in the works: greyboxes from Mommy's question to the
// photo on Agong's wall, then its stamp). The finale (route `party`) is the family party, coming soon.
import { use, useState } from 'react'
import { StampEarned } from '../../kit/StampEarned'
import { worldLink } from '../../../router'
import type { PlaceProps } from '../../types'
import { BoatTrip } from './activities/boat-trip/BoatTrip'
import { kayleeReady } from './characters/model'
import { Hub } from './activities/hub/Hub'
import { MallTrip } from './activities/mall-trip/MallTrip'
import { NanTrip } from './activities/nan-trip/NanTrip'
import { PartySoon } from './PartySoon'
import { saidYes } from './trip/legs/Ask'
import { MALL_FACTS, NAN_FACTS, TRIP_FACTS } from './trip/facts'

export default function Place(props: PlaceProps) {
  const { meta, activity, earnStamp, backToMap, openActivity } = props
  // Kaylee is the modelled vinyl toy: her GLB loads before any scene builds (PlaceFrame's Suspense shows Sparkle
  // thinking meanwhile), so every Avatar is her from the first frame.
  use(kayleeReady())
  const [justEarned, setJustEarned] = useState<string | null>(null)
  if (activity === 'party') return <PartySoon backToMap={backToMap} />
  // A trip ends on Agong's wall: the stamp, then back in the house downstairs, by her photo.
  const info = meta.activities.find((a) => a.id === activity) ?? meta.inTheWorks?.find((a) => a.id === activity)
  const live = !!info && meta.activities.includes(info)
  const finish = () => {
    if (!info) return
    earnStamp(info.id)
    setJustEarned(info.id)
  }
  const stamp =
    info && justEarned === info.id ? (
      <div style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
        <StampEarned
          activity={info}
          facts={info.id === 'boat-trip' ? TRIP_FACTS : info.id === 'nan-trip' ? NAN_FACTS : MALL_FACTS}
          // (An activity still in the works has no recorded sticker line.)
          quiet={!live}
          closeIcon="🏠 ▶"
          onClose={() => {
            setJustEarned(null)
            location.hash = worldLink(meta.id, 'hub', 'downstairs', { at: 'photos' })
          }}
        />
      </div>
    ) : null
  // Another trip picked on Mommy's card inside a trip: it opens straight on its first leg.
  const otherTrip = (id: string) => {
    saidYes.at = performance.now()
    saidYes.trip = id
    openActivity(id)
  }
  if (activity === 'mall-trip' && info) {
    if (window.__kayleeWorld) window.__kayleeWorld.finish = finish
    return (
      <>
        <MallTrip onExit={backToMap} onTrip={otherTrip} onDone={finish} />
        {stamp}
      </>
    )
  }
  // The Nan road trip: greyboxes joined up into the whole trip, still in the works (only its links open it).
  if (activity === 'nan-trip' && info) {
    if (window.__kayleeWorld) window.__kayleeWorld.finish = finish
    return (
      <>
        <NanTrip onExit={backToMap} onTrip={otherTrip} onDone={finish} />
        {stamp}
      </>
    )
  }
  if (activity === 'boat-trip' && info) {
    if (window.__kayleeWorld) window.__kayleeWorld.finish = finish
    return (
      <>
        <BoatTrip onExit={backToMap} onDone={finish} />
        {stamp}
      </>
    )
  }
  return <Hub {...props} />
}

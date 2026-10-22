// Thailand: Kaylee's family's country, in 3D (plan: planning/around-the-world/thailand.md). The home base is Agong's
// shophouse (activities/hub/), where she walks around, meets her family and pokes everything. The places the family
// loves become activities, one per PR: the first is the boat trip (activities/boat-trip/), which ends with her photo on
// Agong's wall and the stamp (the fiddler crab sticker, and the trip's facts to tap); the second is the mall day
// (activities/mall-trip/, greyboxes so far, still in the works: Mommy's question, the Veloz, ICONSIAM, HarborLand's
// hall of mini games, the pizza table, and home with the pizza box for Agong, then its stamp and the pizza slice
// sticker). The finale (route `party`) is the family party, coming soon.
import { useState } from 'react'
import { StampEarned } from '../../kit/StampEarned'
import { worldLink } from '../../../router'
import type { PlaceProps } from '../../types'
import { BoatTrip } from './activities/boat-trip/BoatTrip'
import { Hub } from './activities/hub/Hub'
import { MallTrip } from './activities/mall-trip/MallTrip'
import { PartySoon } from './PartySoon'
import { saidYes } from './trip/legs/Ask'
import { MALL_FACTS, TRIP_FACTS } from './trip/facts'

export default function Place(props: PlaceProps) {
  const { meta, activity, earnStamp, backToMap, openActivity } = props
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
          // (The mall day's sticker line and facts aren't recorded yet: they speak once it's in the game.)
          facts={info.id === 'boat-trip' ? TRIP_FACTS : live ? MALL_FACTS : undefined}
          quiet={!live}
          closeIcon="🏠 ▶"
          onClose={() => {
            setJustEarned(null)
            location.hash = worldLink(meta.id, 'hub', 'downstairs', { at: 'photos' })
          }}
        />
      </div>
    ) : null
  if (activity === 'mall-trip' && info) {
    if (window.__kayleeWorld) window.__kayleeWorld.finish = finish
    return (
      <>
        <MallTrip
          onExit={backToMap}
          onBoat={() => {
            saidYes.at = performance.now()
            saidYes.trip = 'boat-trip'
            openActivity('boat-trip')
          }}
          onDone={finish}
        />
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

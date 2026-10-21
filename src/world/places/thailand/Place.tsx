// Thailand: Kaylee's family's country, in 3D (plan: planning/around-the-world/thailand.md). The home base is Agong's
// shophouse (activities/hub/), where she walks around, meets her family and pokes everything. The places the family
// loves become activities, one per PR: the first is the boat trip (activities/boat-trip/), which ends with her photo on
// Agong's wall and the stamp (the fiddler crab sticker, and the trip's facts to tap); the second is the mall day
// (activities/mall-trip/, greybox 1 so far: HarborLand's playground). The finale (route `party`) is the
// family party, coming soon.
import { useState } from 'react'
import { StampEarned } from '../../kit/StampEarned'
import { worldLink } from '../../../router'
import type { PlaceProps } from '../../types'
import { BoatTrip } from './activities/boat-trip/BoatTrip'
import { Hub } from './activities/hub/Hub'
import { MallTrip } from './activities/mall-trip/MallTrip'
import { PartySoon } from './PartySoon'
import { TRIP_FACTS } from './trip/facts'

export default function Place(props: PlaceProps) {
  const { meta, activity, earnStamp, backToMap } = props
  const [justEarned, setJustEarned] = useState<string | null>(null)
  if (activity === 'party') return <PartySoon backToMap={backToMap} />
  // The mall day (greybox 1: only HarborLand's playground, no stamp yet).
  if (activity === 'mall-trip') return <MallTrip />
  const info = meta.activities.find((a) => a.id === activity)
  if (activity === 'boat-trip' && info) {
    const finish = () => {
      earnStamp(info.id)
      setJustEarned(info.id)
    }
    if (window.__kayleeWorld) window.__kayleeWorld.finish = finish
    return (
      <>
        <BoatTrip onExit={backToMap} onDone={finish} />
        {justEarned === info.id && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
            <StampEarned
              activity={info}
              facts={TRIP_FACTS}
              closeIcon="🏠 ▶"
              onClose={() => {
                setJustEarned(null)
                // Back in the house downstairs, by her photo on Agong's wall.
                location.hash = worldLink(meta.id, 'hub', 'downstairs', { at: 'photos' })
              }}
            />
          </div>
        )}
      </>
    )
  }
  return <Hub {...props} />
}

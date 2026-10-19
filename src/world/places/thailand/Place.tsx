// Thailand: Kaylee's family's country, in 3D (plan: planning/around-the-world/thailand.md). The home base is Agong's
// shophouse (activities/hub/), where she walks around, meets her family and pokes everything. The places the family
// loves become activities, one per PR: the first is the boat trip (activities/boat-trip/). The finale (route `party`)
// is the family party, coming soon.
import type { PlaceProps } from '../../types'
import { BoatTrip } from './activities/boat-trip/BoatTrip'
import { Hub } from './activities/hub/Hub'
import { PartySoon } from './PartySoon'

export default function Place(props: PlaceProps) {
  if (props.activity === 'party') return <PartySoon backToMap={props.backToMap} />
  if (props.activity === 'boat-trip') return <BoatTrip />
  return <Hub {...props} />
}

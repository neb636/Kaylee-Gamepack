// Canada (plan: planning/around-the-world/canada.html): ocean to ocean on the Maple Leaf Train. The home base is the 3D
// toy-table map (activities/hub/, map/): push the train from Quebec to the Pacific, stop at a station and its two
// activities pop up. The eight activities and the finale come one greybox at a time (Mountain Bike, activities/bike/);
// until then their links open a "coming soon" card.
import type { ActivitySections } from '../../kit/sections'
import { Soon } from '../../kit/Soon'
import type { PlaceProps } from '../../types'
import { MountainBike } from './activities/bike/MountainBike'
import BRIDGE from './activities/bridge/sections'
import CAMPFIRE from './activities/campfire/sections'
import CANOE from './activities/canoe/sections'
import { Hub } from './activities/hub/Hub'
import PARTY from './activities/Party.sections'
import SALMON from './activities/salmon/sections'
import SNOWMAN from './activities/snowman/sections'
import TAFFY from './activities/taffy/sections'
import WHALES from './activities/whales/sections'

const BACK = { icon: '🚂', label: 'Back to the train' }
const SOON: Record<string, ActivitySections> = { taffy: TAFFY, snowman: SNOWMAN, campfire: CAMPFIRE, canoe: CANOE, bridge: BRIDGE, whales: WHALES, salmon: SALMON }

export default function Place(props: PlaceProps) {
  const { meta, activity, backToMap } = props
  if (activity === 'bike') return <MountainBike />
  if (activity === 'party') return <Soon def={PARTY} icon="🏒" name="Animal Homes + Pond Hockey" onBack={backToMap} back={BACK} />
  const info = meta.inTheWorks?.find((a) => a.id === activity)
  if (info && SOON[info.id]) return <Soon def={SOON[info.id]} icon={info.icon} name={info.name} onBack={backToMap} back={BACK} />
  return <Hub {...props} />
}

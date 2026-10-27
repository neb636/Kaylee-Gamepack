// The Poles (plan: planning/around-the-world/poles.html): the top and the bottom of the world in one place. The home
// base is the 3D globe (activities/hub/, globe/): spin it to the Arctic or Antarctica, drag the sun so day and night
// swap. The five activities and the finale come one greybox at a time; until then their links open a "coming soon" card.
import type { ActivitySections } from '../../kit/sections'
import type { PlaceProps } from '../../types'
import COATS from './activities/coats/sections'
import FLOE from './activities/floe/sections'
import { Hub } from './activities/hub/Hub'
import HUDDLE from './activities/huddle/sections'
import ICEBERG from './activities/iceberg/sections'
import PARTY from './activities/Party.sections'
import SLIDE from './activities/slide/sections'
import { Soon } from './Soon'

const SOON: Record<string, ActivitySections> = { floe: FLOE, coats: COATS, slide: SLIDE, huddle: HUDDLE, iceberg: ICEBERG }

export default function Place(props: PlaceProps) {
  const { meta, activity, backToMap } = props
  if (activity === 'party') return <Soon def={PARTY} icon="🐦" name="Pole to Pole" onBack={backToMap} />
  const info = meta.inTheWorks?.find((a) => a.id === activity)
  if (info && SOON[info.id]) return <Soon def={SOON[info.id]} icon={info.icon} name={info.name} onBack={backToMap} />
  return <Hub {...props} />
}

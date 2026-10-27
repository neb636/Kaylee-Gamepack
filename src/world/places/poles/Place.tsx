// The Poles (plan: planning/around-the-world/poles.html): the top and the bottom of the world in one place. The home
// base is the 3D globe (activities/hub/, globe/): spin it to the Arctic or Antarctica, drag the sun so day and night
// swap. The activities and the finale come one greybox at a time (Ice Floe Hop, activities/floe/; Penguin Slide,
// activities/slide/; Iceberg Maker, activities/iceberg/; Snow Coats, activities/coats/, 2D and loaded on its own so it
// brings no three.js); until then their links open a "coming soon" card.
import { lazy, Suspense } from 'react'
import type { ActivitySections } from '../../kit/sections'
import type { PlaceProps } from '../../types'
import { FloeHop } from './activities/floe/FloeHop'
import { Hub } from './activities/hub/Hub'
import HUDDLE from './activities/huddle/sections'
import { IcebergMaker } from './activities/iceberg/IcebergMaker'
import PARTY from './activities/Party.sections'
import { PenguinSlide } from './activities/slide/PenguinSlide'
import { Soon } from './Soon'

const SnowCoats = lazy(() => import('./activities/coats/SnowCoats').then((m) => ({ default: m.SnowCoats })))
const SOON: Record<string, ActivitySections> = { huddle: HUDDLE }

export default function Place(props: PlaceProps) {
  const { meta, activity, backToMap } = props
  if (activity === 'floe') return <FloeHop />
  if (activity === 'slide') return <PenguinSlide />
  if (activity === 'iceberg') return <IcebergMaker />
  if (activity === 'coats')
    return (
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#ECE5EE' }} />}>
        <SnowCoats />
      </Suspense>
    )
  if (activity === 'party') return <Soon def={PARTY} icon="🐦" name="Pole to Pole" onBack={backToMap} />
  const info = meta.inTheWorks?.find((a) => a.id === activity)
  if (info && SOON[info.id]) return <Soon def={SOON[info.id]} icon={info.icon} name={info.name} onBack={backToMap} />
  return <Hub {...props} />
}

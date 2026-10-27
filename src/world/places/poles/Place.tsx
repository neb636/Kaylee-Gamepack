// The Poles (plan: planning/around-the-world/poles.html): the top and the bottom of the world in one place. The home
// base is the 3D globe (activities/hub/, globe/): spin it to the Arctic or Antarctica, drag the sun so day and night
// swap. The activities and the finale come one greybox at a time (Ice Floe Hop, activities/floe/; Penguin Slide,
// activities/slide/; Iceberg Maker, activities/iceberg/; Snow Coats, activities/coats/, and Emperor Huddle,
// activities/huddle/, both 2D and loaded on their own so they bring no three.js). The finale's link still opens a
// "coming soon" card.
import { lazy, Suspense } from 'react'
import type { PlaceProps } from '../../types'
import { FloeHop } from './activities/floe/FloeHop'
import { Hub } from './activities/hub/Hub'
import { IcebergMaker } from './activities/iceberg/IcebergMaker'
import PARTY from './activities/Party.sections'
import { PenguinSlide } from './activities/slide/PenguinSlide'
import { Soon } from './Soon'

const SnowCoats = lazy(() => import('./activities/coats/SnowCoats').then((m) => ({ default: m.SnowCoats })))
const EmperorHuddle = lazy(() => import('./activities/huddle/EmperorHuddle').then((m) => ({ default: m.EmperorHuddle })))

export default function Place(props: PlaceProps) {
  const { activity, backToMap } = props
  if (activity === 'floe') return <FloeHop />
  if (activity === 'slide') return <PenguinSlide />
  if (activity === 'iceberg') return <IcebergMaker />
  if (activity === 'coats')
    return (
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#ECE5EE' }} />}>
        <SnowCoats />
      </Suspense>
    )
  if (activity === 'huddle')
    return (
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#1B2150' }} />}>
        <EmperorHuddle />
      </Suspense>
    )
  if (activity === 'party') return <Soon def={PARTY} icon="🐦" name="Pole to Pole" onBack={backToMap} />
  return <Hub {...props} />
}

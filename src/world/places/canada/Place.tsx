// Canada (plan: planning/around-the-world/canada.html): ocean to ocean on the Maple Leaf Train. The home base is the 3D
// toy-table map (activities/hub/, map/): push the train from Quebec to the Pacific, stop at a station and its two
// activities pop up. The eight activities and the finale come one greybox at a time (Mountain Bike, activities/bike/;
// Sugar Snow, activities/taffy/, 2D and loaded on its own so it brings no three.js; Campfire Night; Red Canoe,
// activities/canoe/, 3D and loaded on its own; Animal Bridge, activities/bridge/, 2D; Whale Watch, activities/whales/, 3D
// and loaded on its own; Salmon Leap, activities/salmon/, 2D; Carnival Snowballs, activities/snowman/, 3D and loaded on
// its own); the finale's link opens a "coming soon" card until it's built.
import { lazy, Suspense } from 'react'
import { Soon } from '../../kit/Soon'
import type { PlaceProps } from '../../types'
import { MountainBike } from './activities/bike/MountainBike'
import { Hub } from './activities/hub/Hub'
import PARTY from './activities/Party.sections'

const SugarSnow = lazy(() => import('./activities/taffy/SugarSnow').then((m) => ({ default: m.SugarSnow })))
const CampfireNight = lazy(() => import('./activities/campfire/CampfireNight').then((m) => ({ default: m.CampfireNight })))
const RedCanoe = lazy(() => import('./activities/canoe/RedCanoe').then((m) => ({ default: m.RedCanoe })))
const WhaleWatch = lazy(() => import('./activities/whales/WhaleWatch').then((m) => ({ default: m.WhaleWatch })))
const AnimalBridge = lazy(() => import('./activities/bridge/AnimalBridge').then((m) => ({ default: m.AnimalBridge })))
const CarnivalSnowballs = lazy(() => import('./activities/snowman/CarnivalSnowballs').then((m) => ({ default: m.CarnivalSnowballs })))
const SalmonLeap = lazy(() => import('./activities/salmon/SalmonLeap').then((m) => ({ default: m.SalmonLeap })))
const BACK = { icon: '🚂', label: 'Back to the train' }

export default function Place(props: PlaceProps) {
  const { activity, backToMap } = props
  if (activity === 'bike') return <MountainBike />
  if (activity === 'taffy')
    return (
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#E3EAF4' }} />}>
        <SugarSnow />
      </Suspense>
    )
  if (activity === 'campfire')
    return (
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#14102A' }} />}>
        <CampfireNight />
      </Suspense>
    )
  if (activity === 'canoe')
    return (
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#C4E8FA' }} />}>
        <RedCanoe />
      </Suspense>
    )
  if (activity === 'bridge')
    return (
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#BFE3F7' }} />}>
        <AnimalBridge />
      </Suspense>
    )
  if (activity === 'whales')
    return (
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#CFEAF7' }} />}>
        <WhaleWatch />
      </Suspense>
    )
  if (activity === 'salmon')
    return (
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#CFEDE6' }} />}>
        <SalmonLeap />
      </Suspense>
    )
  if (activity === 'snowman')
    return (
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#DCE6F6' }} />}>
        <CarnivalSnowballs />
      </Suspense>
    )
  if (activity === 'party') return <Soon def={PARTY} icon="🏒" name="Animal Homes + Pond Hockey" onBack={backToMap} back={BACK} />
  return <Hub {...props} />
}

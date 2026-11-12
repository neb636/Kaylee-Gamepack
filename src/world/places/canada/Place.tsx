// Canada (plan: planning/around-the-world/canada.md): ocean to ocean on a 3D map. The home base is the 3D
// toy-table map (activities/hub/, map/): tap any activity pin from Quebec to the Pacific and play immediately. Each activity is its own folder in activities/ (the 3D ones and the 2D ones that bring a big piece
// load on their own, so the hub brings no more than it needs): Sugar Snow (taffy/, 2D), Carnival Snowballs (snowman/,
// 3D), Mountain Bike (bike/, 3D), Campfire Night (campfire/, 2D), Red Canoe (canoe/, 3D), Animal Bridge (bridge/, 2D),
// Whale Watch (whales/, 3D), Salmon Leap (salmon/, 2D), and the finale in Ottawa (party/). Every activity gets
// CanadaActivityProps (activities/props.ts): `onDone` at its payoff shows the stamp and the sticker, then the video,
// then the map. Maple's animal book (book/) is over everything: meet(id) pops its card up from any activity.
import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import { useStampFlow } from '../../kit/stampFlow'
import type { PlaceProps } from '../../types'
import { MountainBike } from './activities/bike/MountainBike'
import { Hub } from './activities/hub/Hub'
import type { CanadaActivityProps } from './activities/props'
import { MetCard } from './book/MetCard'

type Lazy = LazyExoticComponent<ComponentType<CanadaActivityProps>>
const lazyOf = (load: () => Promise<ComponentType<CanadaActivityProps>>): Lazy => lazy(() => load().then((C) => ({ default: C })))

/** Each activity, and the color under it while its code loads. */
const ACTIVITIES: Record<string, { C: Lazy | ComponentType<CanadaActivityProps>; bg: string }> = {
  bike: { C: MountainBike, bg: '#CFE8D6' },
  taffy: { C: lazyOf(() => import('./activities/taffy/SugarSnow').then((m) => m.SugarSnow)), bg: '#E3EAF4' },
  campfire: { C: lazyOf(() => import('./activities/campfire/CampfireNight').then((m) => m.CampfireNight)), bg: '#14102A' },
  canoe: { C: lazyOf(() => import('./activities/canoe/RedCanoe').then((m) => m.RedCanoe)), bg: '#C4E8FA' },
  bridge: { C: lazyOf(() => import('./activities/bridge/AnimalBridge').then((m) => m.AnimalBridge)), bg: '#BFE3F7' },
  whales: { C: lazyOf(() => import('./activities/whales/WhaleWatch').then((m) => m.WhaleWatch)), bg: '#CFEAF7' },
  salmon: { C: lazyOf(() => import('./activities/salmon/SalmonLeap').then((m) => m.SalmonLeap)), bg: '#CFEDE6' },
  snowman: { C: lazyOf(() => import('./activities/snowman/CarnivalSnowballs').then((m) => m.CarnivalSnowballs)), bg: '#DCE6F6' },
  party: { C: lazyOf(() => import('./activities/party/Finale').then((m) => m.Finale)), bg: '#DDEBFA' },
}

export default function Place(props: PlaceProps) {
  const { meta, activity, stamps, backToMap, setProgress, onWin } = props
  const stamp = useStampFlow(props, { closeIcon: '🚂 ▶' })
  const entry = activity ? ACTIVITIES[activity] : undefined
  if (!entry) {
    return (
      <>
        <Hub {...props} />
        <MetCard />
      </>
    )
  }
  const all = [...meta.activities, ...(meta.inTheWorks ?? [])]
  const info = all.find((a) => a.id === activity)
  // The finale's payoff is the trophy.
  const onDone = activity === 'party' ? onWin : info ? stamp.finishFor(info) : backToMap
  if (window.__kayleeWorld) window.__kayleeWorld.finish = onDone
  const { C, bg } = entry
  return (
    <>
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: bg }} />}>
        <C key={activity} onDone={onDone} setProgress={setProgress} onBack={backToMap} stamps={stamps} activities={all} />
      </Suspense>
      <MetCard />
      {stamp.overlay}
    </>
  )
}

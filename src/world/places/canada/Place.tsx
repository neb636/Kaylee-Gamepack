// Canada (plan: planning/around-the-world/canada.html): ocean to ocean on the Maple Leaf Train. The home base is the 3D
// toy-table map (activities/hub/, map/): push the train from Quebec to the Pacific, stop at a station and its two
// activities pop up. Each activity is its own folder in activities/ (the 3D ones and the 2D ones that bring a big piece
// load on their own, so the hub brings no more than it needs): Sugar Snow (taffy/, 2D), Carnival Snowballs (snowman/,
// 3D), Mountain Bike (bike/, 3D), Campfire Night (campfire/, 2D), Red Canoe (canoe/, 3D), Animal Bridge (bridge/, 2D),
// Whale Watch (whales/, 3D), Salmon Leap (salmon/, 2D), and the finale in Ottawa (party/). Every activity gets
// CanadaActivityProps (activities/props.ts): `onDone` at its payoff shows the stamp and the sticker, then the video,
// then the train. Maple's animal book (book/) is over everything: meet(id) pops its card up from any activity.
import { lazy, Suspense, useState, type ComponentType, type LazyExoticComponent } from 'react'
import { StampEarned } from '../../kit/StampEarned'
import { VideoBreak } from '../../kit/Theater'
import type { PlaceProps, PlaceVideo } from '../../types'
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
  const { meta, activity, stamps, backToMap, earnStamp, setProgress, onWin } = props
  const [justEarned, setJustEarned] = useState<string | null>(null)
  const [videoAfter, setVideoAfter] = useState<PlaceVideo | null>(null)
  const entry = activity ? ACTIVITIES[activity] : undefined
  if (!entry) {
    return (
      <>
        <Hub {...props} />
        <MetCard />
      </>
    )
  }
  const info = [...meta.activities, ...(meta.inTheWorks ?? [])].find((a) => a.id === activity)
  const onDone = () => {
    // The finale's payoff is the trophy.
    if (activity === 'party') return onWin()
    if (!info) return backToMap()
    earnStamp(info.id)
    setJustEarned(info.id)
  }
  if (window.__kayleeWorld) window.__kayleeWorld.finish = onDone
  const { C, bg } = entry
  return (
    <>
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: bg }} />}>
        <C key={activity} onDone={onDone} setProgress={setProgress} onBack={backToMap} stamps={stamps} activities={[...meta.activities, ...(meta.inTheWorks ?? [])]} />
      </Suspense>
      <MetCard />
      {info && justEarned === info.id && (
        <StampEarned
          activity={info}
          closeIcon="🚂 ▶"
          onClose={() => {
            setJustEarned(null)
            // A real-world video about what she just played comes next (skippable), then the train.
            const video = meta.videos?.find((v) => v.after === info.id)
            if (video) {
              setProgress(0, 0)
              setVideoAfter(video)
            } else backToMap()
          }}
        />
      )}
      {videoAfter && (
        <VideoBreak
          video={videoAfter}
          onDone={() => {
            setVideoAfter(null)
            backToMap()
          }}
        />
      )}
    </>
  )
}

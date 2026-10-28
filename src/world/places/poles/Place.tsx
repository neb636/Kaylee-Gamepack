// The Poles (plan: planning/around-the-world/poles.html): the top and the bottom of the world in one place. The home
// base is the 3D globe (activities/hub/, globe/): spin it to the Arctic or Antarctica, drag the sun so day and night
// swap, and tap an activity's spot on that side. Ice Floe Hop (activities/floe/), Penguin Slide (activities/slide/),
// Iceberg Maker (activities/iceberg/), and Snow Coats (activities/coats/) and Emperor Huddle (activities/huddle/), both
// 2D and loaded on their own so they bring no three.js. Each finished one earns its stamp and sticker, offers its video,
// then back to the globe. All five stamps open the finale (Pole to Pole, then the Polar Quiz, activities/party/).
import { lazy, Suspense, useState, type ComponentType } from 'react'
import { StampEarned } from '../../kit/StampEarned'
import { VideoBreak } from '../../kit/Theater'
import type { PlaceProps, PlaceVideo } from '../../types'
import { FloeHop } from './activities/floe/FloeHop'
import { Hub } from './activities/hub/Hub'
import { IcebergMaker } from './activities/iceberg/IcebergMaker'
import { Finale } from './activities/party/Finale'
import { PenguinSlide } from './activities/slide/PenguinSlide'

/** What every Poles activity gets: call `onDone` at its payoff (the stamp, the sticker, the video, then the globe). */
export interface ActivityProps {
  onDone: () => void
}

const SnowCoats = lazy(() => import('./activities/coats/SnowCoats').then((m) => ({ default: m.SnowCoats })))
const EmperorHuddle = lazy(() => import('./activities/huddle/EmperorHuddle').then((m) => ({ default: m.EmperorHuddle })))

const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = {
  floe: FloeHop,
  slide: PenguinSlide,
  iceberg: IcebergMaker,
  coats: (p) => (
    <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#ECE5EE' }} />}>
      <SnowCoats {...p} />
    </Suspense>
  ),
  huddle: (p) => (
    <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#1B2150' }} />}>
      <EmperorHuddle {...p} />
    </Suspense>
  ),
}

export default function Place(props: PlaceProps) {
  const { meta, activity, stamps, earnStamp, backToMap, onWin } = props
  const [justEarned, setJustEarned] = useState<string | null>(null)
  const [videoAfter, setVideoAfter] = useState<PlaceVideo | null>(null)

  if (activity === 'party') {
    // The finale waits for every stamp (a link with ?stamps=all opens it straight away).
    if (!meta.activities.every((a) => stamps.includes(a.id))) return <Hub {...props} />
    return <Finale onWin={onWin} />
  }
  const Activity = activity ? ACTIVITIES[activity] : undefined
  const info = meta.activities.find((a) => a.id === activity) ?? meta.inTheWorks?.find((a) => a.id === activity)
  if (!Activity || !info) return <Hub {...props} />
  // An activity still in the works opens from its links and earns its stamp, but its sticker line isn't recorded yet.
  const live = meta.activities.includes(info)
  const finish = () => {
    earnStamp(info.id)
    setJustEarned(info.id)
  }
  if (window.__kayleeWorld) window.__kayleeWorld.finish = finish
  return (
    <>
      <Activity key={activity} onDone={finish} />
      {justEarned === info.id && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
          <StampEarned
            activity={info}
            quiet={!live}
            closeIcon="🌍 ▶"
            onClose={() => {
              setJustEarned(null)
              // A real-world video about what she just played comes next (skippable), then the globe.
              const video = live ? meta.videos?.find((v) => v.after === info.id) : undefined
              if (video) setVideoAfter(video)
              else backToMap()
            }}
          />
        </div>
      )}
      {videoAfter && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
          <VideoBreak
            video={videoAfter}
            next="🌍"
            onDone={() => {
              setVideoAfter(null)
              backToMap()
            }}
          />
        </div>
      )}
    </>
  )
}

// What happens when she finishes an activity, the same in every country: the stamp is saved, the stamp screen shows
// (sticker, facts), then a real-world video about what she just played if the country lists one for it
// (`meta.videos[].after`, skippable), then back to the country's map. A country's Place.tsx uses it like this:
//
//   const stamp = useStampFlow(props)                       // options: closeIcon, layer, videoNext, facts, after
//   const info = meta.activities.find((a) => a.id === activity)
//   if (Activity && info)
//     return <>
//       <Activity key={activity} setProgress={setProgress} onDone={stamp.finishFor(info)} />
//       {stamp.overlay}
//     </>
//
// `finishFor` also hands the finish to the test hook (`window.__kayleeWorld.finish`), so robots can skip to the stamp.
import { useState, type ReactNode } from 'react'
import type { ActivityInfo, PlaceFact, PlaceProps, PlaceVideo } from '../types'
import { StampEarned } from './StampEarned'
import { VideoBreak } from './Theater'

/** What every activity component gets from its country. */
export interface ActivityProps {
  /** Call once when she's done: the stamp, then the video (if any), then the country's map. */
  onDone: () => void
  /** Fills the stars in the top bar, e.g. setProgress(2, 6). */
  setProgress: (done: number, total: number) => void
}

export interface StampFlowOptions {
  /** The stamp screen's way-on button (default 🗺️ ▶). */
  closeIcon?: string
  /** The video's way-on button (default 🗺️). */
  videoNext?: string
  /** Put the stamp and the video on their own full-screen layer above a 3D scene (z-index 100). */
  layer?: boolean
  /** Facts for the stamp screen (default: the country's own). */
  facts?: (info: ActivityInfo) => PlaceFact[] | undefined
  /** Instead of the video and the map, after the stamp screen closes (Thailand: back to its own map or the house). */
  after?: (info: ActivityInfo) => void
}

export function useStampFlow({ meta, activity, earnStamp, setProgress, backToMap }: PlaceProps, opts: StampFlowOptions = {}) {
  const [earned, setEarned] = useState<{ info: ActivityInfo; live: boolean } | null>(null)
  const [video, setVideo] = useState<PlaceVideo | null>(null)

  /** The `onDone` for an activity. `live: false` (still in the works): its sticker line isn't recorded yet (quiet stamp)
   *  and it offers no video. */
  const finishFor = (info: ActivityInfo, { live = true }: { live?: boolean } = {}) => {
    const finish = () => {
      earnStamp(info.id)
      setEarned({ info, live })
    }
    if (window.__kayleeWorld) window.__kayleeWorld.finish = finish
    return finish
  }

  const layer = (node: ReactNode) => (opts.layer ? <div style={{ position: 'absolute', inset: 0, zIndex: 100 }}>{node}</div> : node)

  const close = () => {
    if (!earned) return
    const { info, live } = earned
    setEarned(null)
    if (opts.after) return opts.after(info)
    const next = live ? meta.videos?.find((v) => v.after === info.id) : undefined
    if (next) {
      setProgress(0, 0) // hides the activity's stars so they don't sit on the video
      setVideo(next)
    } else backToMap()
  }

  const overlay = (
    <>
      {earned && earned.info.id === activity && layer(<StampEarned activity={earned.info} quiet={!earned.live} closeIcon={opts.closeIcon} facts={opts.facts?.(earned.info)} onClose={close} />)}
      {video &&
        layer(
          <VideoBreak
            video={video}
            next={opts.videoNext}
            onDone={() => {
              setVideo(null)
              backToMap()
            }}
          />,
        )}
    </>
  )

  return { finishFor, overlay }
}

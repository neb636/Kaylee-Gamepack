// What Place.tsx hands every Canada game (no three.js, so 2D activities can import it): what every country's
// activity gets (onDone: its closing film the first time, the stamp, then the map; setProgress), plus Canada's own.
import type { ActivityProps } from '../../../kit/stampFlow'

export interface CanadaActivityProps extends ActivityProps {
  /** Back to the map without a stamp. */
  onBack: () => void
  /** The stamps she has here (activity ids): the team so far (story/chapters.ts teamOf). */
  stamps: string[]
  /** The activities that are in the game (meta.activities, then inTheWorks), in map order. */
  activities: { id: string; name: string; icon: string }[]
  /** The chapter's way-in film has just played (her first time, from the map): the game skips its own hello line and
   *  starts with Sparkle's one instruction and her hands busy. From a section link or a replay it is false. */
  filmed?: boolean
}

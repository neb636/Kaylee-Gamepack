// What Place.tsx hands every Canada activity (no three.js, so 2D activities can import it): what every country's
// activity gets (onDone: the stamp, a video if there is one, then the train; setProgress), plus Canada's own.
import type { ActivityProps } from '../../../kit/stampFlow'

export interface CanadaActivityProps extends ActivityProps {
  /** Back to the train map without a stamp. */
  onBack: () => void
  /** The stamps she has here (activity ids): the finale's hockey team is whoever they brought. */
  stamps: string[]
  /** The activities that are in the game (meta.activities, then inTheWorks), in play order. */
  activities: { id: string; name: string; icon: string }[]
}

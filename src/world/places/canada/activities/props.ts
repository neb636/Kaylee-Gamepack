// What Place.tsx hands every Canada activity (no three.js, so 2D activities can import it).
export interface CanadaActivityProps {
  /** Call once at the payoff: the passport stamp and sticker (StampEarned), then a video if there is one, then the train. */
  onDone: () => void
  /** Fills the stars in the top bar (done of total), e.g. one per part of the activity. */
  setProgress: (done: number, total: number) => void
  /** Back to the train map without a stamp. */
  onBack: () => void
  /** The stamps she has here (activity ids): the finale's hockey team is whoever they brought. */
  stamps: string[]
  /** The activities that are in the game (meta.activities, then inTheWorks), in play order. */
  activities: { id: string; name: string; icon: string }[]
}

// The Koh Samet trip (plan: planning/around-the-world/thailand/samet-trip.html). In the works: greybox 1 is the jet ski
// at Hat Sai Kaew (jetski/), the only section so far; a bare link opens it at its first round. The island to roam, the
// animal book, the other stops and the trip frame (packing, the speedboat, home) come one greybox at a time.
import { useSections } from '../../../../kit/sections'
import { JetSkiScreen } from './jetski/JetSkiScreen'
import type { RoundId } from './island/layout'
import SAMET_SECTIONS from './sections'

export function SametTrip() {
  const { param, enter } = useSections(SAMET_SECTIONS)
  return <JetSkiScreen round={param('round') as RoundId} onRound={(round) => enter('jetski', { round })} />
}

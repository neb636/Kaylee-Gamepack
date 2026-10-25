// Krabi's fork on Daddy's "Where to?" card (trip/legs/WhereTo.tsx): a postcard for each place, a generated picture with
// no words (art/source/world/thailand/cover-fork-*.png): Baan Chang's elephant under the palms with a banana in her
// trunk, and the longtail with its ribbons among Phang Nga Bay's rock towers. Another place at the fork is one more
// entry here.
import type { Postcard } from '../../trip/legs/WhereTo'
import boat from '../../assets/cover-fork-boat.webp'
import elephants from '../../assets/cover-fork-elephants.webp'

const picture = (src: string) => <img src={src} alt="" draggable={false} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />

/** The fork's two places, the elephants first (up the side road). */
export const FORK_CARDS: Postcard[] = [
  { id: 'chang', label: 'Elephants', color: '#FFD3E4', picture: picture(elephants) },
  { id: 'pier', label: 'Boat trip', color: '#CDEBFF', picture: picture(boat) },
]

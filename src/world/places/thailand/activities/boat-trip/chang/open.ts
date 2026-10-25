// Is Baan Chang on the trip (plan: thailand/baan-chang.html, "Hidden until it's ready")? On since the full loop: Krabi has
// the signpost (🐘 or 🚤, either first), the pier and the replay offer 🐘 and the boarding pass has 🐘. Set it to false
// to hide it again (every Baan Chang section link still works, and `?chang=1` turns it back on to try). Loaded at
// startup: no three.js here.
import { flag } from '../../../engine/flags'

export const CHANG_OPEN = true

/** Read once when the trip mounts (the address bar drops `chang=1` as she plays). */
export const changOpen = () => CHANG_OPEN || flag('chang') === '1'

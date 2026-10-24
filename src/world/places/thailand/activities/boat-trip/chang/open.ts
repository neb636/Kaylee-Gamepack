// Is Baan Chang on the trip yet (plan: thailand/baan-chang.md, "Hidden until it's ready")? While it's off, Krabi has no
// signpost (the songthaew goes straight to the pier), the pier and the replay offer no 🐘 and the boarding pass has no
// 🐘, but every Baan Chang section link still works. `?chang=1` in a link turns it on to try the whole way round. The
// full-loop PR sets it to true. Loaded at startup: no three.js here.
import { flag } from '../../../engine/flags'

export const CHANG_OPEN = false

/** Read once when the trip mounts (the address bar drops `chang=1` as she plays). */
export const changOpen = () => CHANG_OPEN || flag('chang') === '1'

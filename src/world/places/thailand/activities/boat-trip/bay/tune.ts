// The bay's numbers worth tuning by eye on the iPad (the ?debug panel edits them live, and the longtail's feel in
// trip/vehicles/longtail.ts). `?drive=grab` starts in the other control.
import { flag } from '../../../engine/flags'

export type Control = 'water' | 'grab'

export const BAY_TUNE = {
  /** "water": put a finger anywhere on the water and the boat goes after it. "grab": put a finger on the boat and pull it. */
  control: (flag('drive') === 'grab' ? 'grab' : 'water') as Control,
  /** The chase camera: degrees above the water, degrees round to the right of straight behind, seconds it lags the
   *  boat's turns, meters it looks ahead, and the box (meters across, meters deep) that fits on screen. */
  fov: 50,
  camPitch: 18,
  camSide: 12,
  camLag: 0.8,
  camAhead: 6,
  camWide: 6,
  camDeep: 6.5,
}

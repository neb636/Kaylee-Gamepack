// The seven friends who carry the dragon, keyed by the activity that earned them (same order as the body, head to tail).
import type { Line } from '../../../../../sdk'
import { L } from '../../lines'

export type Who = 'baobao' | 'houhou' | 'hong' | 'crane' | 'mouse' | 'ox' | 'tiger' | 'doudou' | 'cheffu'
/** One friend under a segment: sideways offset (fraction of the segment width) and size (fraction of the main friend). */
export interface Rider {
  who: Who
  dx: number
  scale: number
}
export interface Guest {
  /** The activity id that earned this friend. */
  id: string
  name: string
  /** Their thank-you line, in their own voice. */
  line: Line
  riders: Rider[]
}

export const GUESTS: Guest[] = [
  { id: 'bamboo', name: 'Bao Bao', line: L.parade.thanks.bamboo, riders: [{ who: 'baobao', dx: 0, scale: 1 }] },
  { id: 'wall', name: 'Hou Hou', line: L.parade.thanks.wall, riders: [{ who: 'houhou', dx: 0, scale: 1 }] },
  { id: 'hotpot', name: 'Hong', line: L.parade.thanks.hotpot, riders: [{ who: 'hong', dx: 0, scale: 1 }] },
  { id: 'brush', name: 'Lady Crane', line: L.parade.thanks.brush, riders: [{ who: 'crane', dx: 0, scale: 1 }] },
  { id: 'race', name: 'Mouse and Ox', line: L.parade.thanks.race, riders: [{ who: 'ox', dx: -0.12, scale: 0.95 }, { who: 'mouse', dx: 0.22, scale: 0.7 }] },
  { id: 'train', name: 'Amur Tiger', line: L.parade.thanks.train, riders: [{ who: 'tiger', dx: 0, scale: 1 }] },
  { id: 'dumplings', name: 'Dou Dou and Chef Fu', line: L.parade.thanks.dumplings, riders: [{ who: 'cheffu', dx: -0.17, scale: 0.9 }, { who: 'doudou', dx: 0.2, scale: 0.8 }] },
]

// The real Koh Samet animals that live on the island and the reef (creatures.ts, models.ts): what each is called and
// how it behaves. (They were the pages of a photo book once; the book is gone, the animals stayed as the island's
// life.) Plain data, no three.js.
//
// The names are lines.ts L.samet.book.name (Sparkle's voice): the snorkel says a reef animal's name the first time
// Mom's camera snaps it, and they label the island's tap targets.
import { L } from '../../../lines'

export type AnimalId = 'monitor' | 'squirrel' | 'macaque' | 'mousedeer' | 'hornbill' | 'flyingfox' | 'heron' | 'tern' | 'crab' | 'parrotfish' | 'damselfish' | 'cuttlefish' | 'urchin' | 'coral'

/** How it lives on the island (what it does when she comes close). */
export type Behavior = 'wander' | 'flee' | 'perch' | 'swim' | 'still'

export interface Animal {
  id: AnimalId
  /** "A hornbill!" (what Sparkle says when the snorkel's camera snaps it). */
  name: string
  behavior: Behavior
  /** Shy on purpose: seen less often. */
  rare?: boolean
}

const B = L.samet.book
export const ANIMALS: Record<AnimalId, Animal> = {
  tern: { id: 'tern', name: B.name.tern, behavior: 'perch' },
  crab: { id: 'crab', name: B.name.crab, behavior: 'flee' },
  heron: { id: 'heron', name: B.name.heron, behavior: 'flee' },
  urchin: { id: 'urchin', name: B.name.urchin, behavior: 'still' },
  coral: { id: 'coral', name: B.name.coral, behavior: 'still' },
  hornbill: { id: 'hornbill', name: B.name.hornbill, behavior: 'perch', rare: true },
  parrotfish: { id: 'parrotfish', name: B.name.parrotfish, behavior: 'swim' },
  damselfish: { id: 'damselfish', name: B.name.damselfish, behavior: 'swim' },
  cuttlefish: { id: 'cuttlefish', name: B.name.cuttlefish, behavior: 'swim' },
  monitor: { id: 'monitor', name: B.name.monitor, behavior: 'wander' },
  mousedeer: { id: 'mousedeer', name: B.name.mousedeer, behavior: 'flee', rare: true },
  flyingfox: { id: 'flyingfox', name: B.name.flyingfox, behavior: 'perch', rare: true },
  squirrel: { id: 'squirrel', name: B.name.squirrel, behavior: 'flee' },
  macaque: { id: 'macaque', name: B.name.macaque, behavior: 'wander' },
}
export const ANIMAL_IDS = Object.keys(ANIMALS) as AnimalId[]

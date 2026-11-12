// Kaylee's animal book (plan: samet-trip.md, "Mom's phone and the animal book"): the fourteen real Koh Samet
// animals she can snap with Mom's phone, and the book's pages. Plain data, no three.js: the sections file, the book
// screen and the QA scripts read it.
//
// The words are lines.ts L.samet.book (recorded in Sparkle's voice): she says the name once when it's first snapped, a
// tap on its photo plays the fact, a tap on its silhouette where to look.
import { L } from '../../../lines'

export type AnimalId = 'monitor' | 'squirrel' | 'macaque' | 'mousedeer' | 'hornbill' | 'flyingfox' | 'heron' | 'tern' | 'crab' | 'parrotfish' | 'damselfish' | 'cuttlefish' | 'urchin' | 'coral'

/** How it lives on the island (what it does when she comes close). */
export type Behavior = 'wander' | 'flee' | 'perch' | 'swim' | 'still'

export interface Animal {
  id: AnimalId
  /** "A hornbill!" (what Sparkle says when it's snapped). */
  name: string
  /** One tap-to-hear fact. */
  fact: string
  /** Where to look (the hint under its silhouette). */
  where: string
  behavior: Behavior
  /** Rare on purpose: a sparkle shows near it, and its page slot is sparkly gold. */
  rare?: boolean
}

const B = L.samet.book
export const ANIMALS: Record<AnimalId, Animal> = {
  tern: { id: 'tern', name: B.name.tern, fact: B.fact.tern, where: B.where.tern, behavior: 'perch' },
  crab: { id: 'crab', name: B.name.crab, fact: B.fact.crab, where: B.where.crab, behavior: 'flee' },
  heron: { id: 'heron', name: B.name.heron, fact: B.fact.heron, where: B.where.heron, behavior: 'flee' },
  urchin: { id: 'urchin', name: B.name.urchin, fact: B.fact.urchin, where: B.where.urchin, behavior: 'still' },
  coral: { id: 'coral', name: B.name.coral, fact: B.fact.coral, where: B.where.coral, behavior: 'still' },
  hornbill: { id: 'hornbill', name: B.name.hornbill, fact: B.fact.hornbill, where: B.where.hornbill, behavior: 'perch', rare: true },
  parrotfish: { id: 'parrotfish', name: B.name.parrotfish, fact: B.fact.parrotfish, where: B.where.parrotfish, behavior: 'swim' },
  damselfish: { id: 'damselfish', name: B.name.damselfish, fact: B.fact.damselfish, where: B.where.damselfish, behavior: 'swim' },
  cuttlefish: { id: 'cuttlefish', name: B.name.cuttlefish, fact: B.fact.cuttlefish, where: B.where.cuttlefish, behavior: 'swim' },
  monitor: { id: 'monitor', name: B.name.monitor, fact: B.fact.monitor, where: B.where.monitor, behavior: 'wander' },
  mousedeer: { id: 'mousedeer', name: B.name.mousedeer, fact: B.fact.mousedeer, where: B.where.mousedeer, behavior: 'flee', rare: true },
  flyingfox: { id: 'flyingfox', name: B.name.flyingfox, fact: B.fact.flyingfox, where: B.where.flyingfox, behavior: 'perch', rare: true },
  squirrel: { id: 'squirrel', name: B.name.squirrel, fact: B.fact.squirrel, where: B.where.squirrel, behavior: 'flee' },
  macaque: { id: 'macaque', name: B.name.macaque, fact: B.fact.macaque, where: B.where.macaque, behavior: 'wander' },
}
export const ANIMAL_IDS = Object.keys(ANIMALS) as AnimalId[]

/** The book: a page per beach (with that stop's sticker in its corner once its flag is up). */
export interface Page {
  id: string
  /** For Dad (she reads the pictures). */
  title: string
  /** The tab's picture. */
  icon: string
  /** The page's paper color. */
  paper: string
  stop: 'jetski' | 'sandcastle' | 'snorkel' | 'hideseek' | null
  animals: AnimalId[]
}
export const PAGES: Page[] = [
  { id: 'saikaew', title: 'Hat Sai Kaew', icon: '✨', paper: '#E6F7FF', stop: 'jetski', animals: ['tern', 'crab'] },
  { id: 'hinkhok', title: 'Ao Hin Khok and the mermaid’s rocks', icon: '🏰', paper: '#FFF1E0', stop: 'sandcastle', animals: ['heron', 'urchin', 'coral'] },
  { id: 'wongduan', title: 'Ao Wong Duan', icon: '🌙', paper: '#E4F8EF', stop: 'snorkel', animals: ['hornbill', 'parrotfish', 'damselfish', 'cuttlefish'] },
  { id: 'prao', title: 'Ao Prao', icon: '🥥', paper: '#FFE9EF', stop: 'hideseek', animals: ['monitor', 'mousedeer', 'flyingfox'] },
  { id: 'forest', title: 'The forest road', icon: '🌳', paper: '#EEF6DF', stop: null, animals: ['squirrel', 'macaque'] },
]

/** A `book` param (a comma list of animal ids, or `all`) as ids. */
export const readBook = (s: string): AnimalId[] => (s === 'all' ? [...ANIMAL_IDS] : (s.split(',').filter((a) => a in ANIMALS) as AnimalId[]))
/** And back (for the address bar). */
export const bookParam = (ids: readonly AnimalId[]) => (ids.length === ANIMAL_IDS.length ? 'all' : ids.join(',') || undefined)

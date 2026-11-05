// Kaylee's animal book (plan: samet-trip.html, "Mommy's phone and the animal book"): the fourteen real Koh Samet
// animals she can snap with Mommy's phone, and the book's pages. Plain data, no three.js: the sections file, the book
// screen and the QA scripts read it.
//
// Greybox 3: the names and facts are shown as text for Dad (the full loop records them in lines.ts: Sparkle says the
// name once, a tap on the photo plays the fact).

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

export const ANIMALS: Record<AnimalId, Animal> = {
  tern: { id: 'tern', name: 'A tern!', fact: 'Terns fold their wings and dive into the sea to catch little fish.', where: 'Flying over the sea at Hat Sai Kaew', behavior: 'perch' },
  crab: { id: 'crab', name: 'A crab!', fact: 'Ghost crabs dig holes in the sand to hide from the hot sun. Hermit crabs carry a shell for a house.', where: 'In the little holes on every beach', behavior: 'flee' },
  heron: { id: 'heron', name: 'A reef heron!', fact: 'The reef heron stands very still on the rocks, then grabs a fish with its long beak.', where: 'On the rocks by the mermaid', behavior: 'flee' },
  urchin: { id: 'urchin', name: 'A sea urchin!', fact: 'Sea urchins are very prickly. Look, but don’t touch!', where: 'In the shallow water by the rocks', behavior: 'still' },
  coral: { id: 'coral', name: 'Coral!', fact: 'Coral looks like rocks and plants, but it is alive! Fish live in it like people in a town.', where: 'Under the water at Ao Hin Khok', behavior: 'still' },
  hornbill: { id: 'hornbill', name: 'A hornbill!', fact: 'The hornbill has a giant yellow beak with a bump on top, called a casque.', where: 'In the tamarind tree at Ao Wong Duan', behavior: 'perch', rare: true },
  parrotfish: { id: 'parrotfish', name: 'A parrotfish!', fact: 'Parrotfish crunch on coral with their beaks, and the bits become white sand!', where: 'Swimming in the water at Ao Wong Duan', behavior: 'swim' },
  damselfish: { id: 'damselfish', name: 'Blue damselfish!', fact: 'Little blue damselfish swim together in a big crowd to stay safe.', where: 'In a crowd in the water at Ao Wong Duan', behavior: 'swim' },
  cuttlefish: { id: 'cuttlefish', name: 'A cuttlefish!', fact: 'A cuttlefish can change its color in a blink, to talk and to hide.', where: 'Hiding in the water by the snorkel boat', behavior: 'swim' },
  monitor: { id: 'monitor', name: 'A monitor lizard!', fact: 'Monitor lizards smell with their tongue! Flick, flick.', where: 'Waddling round Ao Prao', behavior: 'wander' },
  mousedeer: { id: 'mousedeer', name: 'A mouse-deer!', fact: 'The mouse-deer is the smallest deer in the world, as small as a cat. Walk slowly, it’s shy!', where: 'At the edge of the forest by Ao Prao. Walk slowly!', behavior: 'flee', rare: true },
  flyingfox: { id: 'flyingfox', name: 'A flying fox!', fact: 'A flying fox is a big bat that eats fruit. It sleeps upside down all day!', where: 'Sleeping upside down in a tree at Ao Prao', behavior: 'perch', rare: true },
  squirrel: { id: 'squirrel', name: 'A squirrel!', fact: 'Squirrels run up the palm trees and chatter: chk chk chk!', where: 'On the palm trees by the beaches', behavior: 'flee' },
  macaque: { id: 'macaque', name: 'A monkey!', fact: 'Long-tailed macaques live in the trees. Hold on to your sunglasses!', where: 'By the road over the hill', behavior: 'wander' },
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

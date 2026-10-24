import { WORDS, type Letter } from './lines'
import apple from './assets/apple.webp'
import butterfly from './assets/butterfly.webp'
import cupcake from './assets/cupcake.webp'
import dolphin from './assets/dolphin.webp'
import elephant from './assets/elephant.webp'
import flamingo from './assets/flamingo.webp'
import gift from './assets/gift.webp'
import heart from './assets/heart.webp'
import iceCream from './assets/ice-cream.webp'
import jellyfish from './assets/jellyfish.webp'
import kitten from './assets/kitten.webp'
import lollipop from './assets/lollipop.webp'
import mermaid from './assets/mermaid.webp'
import necklace from './assets/necklace-hd.webp'
import owl from './assets/owl.webp'
import puppy from './assets/puppy.webp'
import queen from './assets/queen.webp'
import rainbow from './assets/rainbow.webp'
import strawberry from './assets/strawberry.webp'
import teddy from './assets/teddy.webp'
import unicorn from './assets/unicorn.webp'
import violin from './assets/violin.webp'
import wand from './assets/wand.webp'
import xylophone from './assets/xylophone.webp'
import yoyo from './assets/yoyo.webp'
import zebra from './assets/zebra.webp'

export type { Letter }
export const LETTERS = Object.keys(WORDS) as Letter[]

const IMAGES: Record<Letter, string> = {
  A: apple, B: butterfly, C: cupcake, D: dolphin, E: elephant, F: flamingo, G: gift, H: heart, I: iceCream, J: jellyfish,
  K: kitten, L: lollipop, M: mermaid, N: necklace, O: owl, P: puppy, Q: queen, R: rainbow, S: strawberry, T: teddy,
  U: unicorn, V: violin, W: wand, X: xylophone, Y: yoyo, Z: zebra,
}

export interface Item {
  letter: Letter
  word: string
  img: string
}
export const ITEMS: Record<Letter, Item> = Object.fromEntries(LETTERS.map((l) => [l, { letter: l, word: WORDS[l], img: IMAGES[l] }])) as Record<Letter, Item>

/** Never on the same page as each other's answer: they start with the same sound (cupcake, kitten, queen; xylophone,
 *  zebra) or look alike at a glance (a lollipop, a yo-yo and a wand are all a round thing on a stick). */
const CLASHES: Letter[][] = [['C', 'K', 'Q'], ['X', 'Z'], ['L', 'Y', 'W']]
export const clashes = (a: Letter, b: Letter) => a === b || CLASHES.some((g) => g.includes(a) && g.includes(b))

/** Pages in one sitting, and how many pictures each page has: it gets busier as she goes. */
export const PAGE_SIZES = [3, 4, 4, 5, 6, 6, 7, 8] as const
export const PAGES = PAGE_SIZES.length

import type { GameMeta } from '../../sdk'
import cover from './assets/cover.webp'

const meta: GameMeta = {
  id: 'sparkly-abc',
  title: 'Sparkly I Spy',
  emoji: '🔍',
  cover,
  subject: 'phonics: letters and first sounds',
  skills: ['hear a letter name and find the thing that begins with it', 'letter shapes A to Z (upper and lower case)', 'look carefully in a busy picture'],
  vocabulary: [],
  mechanic: 'alphabet I Spy: Sparkle spies a letter, she searches a page of pictures and taps the one that begins with it, then turns the page to see "B is for butterfly"',
  setting: "a pink picture book of girly things, A to Z (after Webber Books' I Spy for Girls)",
  source: { pages: ['https://www.walmart.com/ip/I-Spy-For-Girls-A-Fun-Guessing-Game-for-3-5-Year-Olds-Large-Print-Paperback-9781914047039/948068856'] },
  createdAt: '2026-10-23',
  trophyTitle: 'I Spy Star',
}

export default meta

import type { GameMeta } from '../../sdk'
import cover from './assets/cover.webp'

const meta: GameMeta = {
  id: 'sparkle-bear-tic-tac-toe',
  title: 'Sparkle & Bear Tic-Tac-Toe',
  emoji: '💗',
  cover,
  subject: 'logic: patterns and taking turns',
  skills: ['take turns', 'make three in a row', 'notice a winning line', 'block a line'],
  vocabulary: ['turn', 'row', 'line', 'block'],
  mechanic: 'tap a giant garden board to place hearts while Bear plays stars; spot and block lines across three rounds',
  setting: 'Sparkle and Bear play together in a pink garden game nook',
  source: { pages: ['user request for a new tic-tac-toe game'] },
  createdAt: '2026-09-25',
  trophyTitle: 'Tic-Tac-Toe Star',
}

export default meta

import type { GameMeta } from '../../sdk'
import cover from './assets/cover.webp'

const meta: GameMeta = {
  id: 'unicorn-tea-party',
  title: 'Unicorn Tea Party',
  emoji: '🫖',
  cover,
  subject: 'math: counting to 5',
  skills: ['count groups up to 5 (bonus to 10)', 'touch and count', 'move and count', 'mark and count', 'match dots to numbers', 'see small groups without counting', 'are there enough?'],
  vocabulary: ['strategy', 'enough', 'line'],
  mechanic: 'six short stations on a rainbow path: tap to count, drag into teapot, mark flowers, dot-card match with hops, 2-second flash, one-cup-per-guest',
  setting: "Sparkle the unicorn's outdoor tea party with plushie guests",
  source: { pages: ['example-lesson-plan/page-1.png', 'example-lesson-plan/page-2.png'] },
  createdAt: '2026-09-23',
  trophyTitle: 'Counting Champion',
}

export default meta

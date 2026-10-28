// Salmon Leap (greybox 8, plan: planning/around-the-world/canada.html): flick the salmon up the falls in BC's Great Bear
// Rainforest. #/world/canada/salmon/<section>?home=7&spirit=low
// A section is one stretch of the river; a link starts there as if she had played to there (`home` salmon are already up
// in the stream where they were born). Loaded at startup by the section index.
import { defineSections } from '../../../../kit/sections'

const SALMON_SECTIONS = defineSections('canada', 'salmon', {
  params: {
    home: { default: '', doc: 'how many salmon are already home in the stream (empty = what that section starts with: 0, 3, 7, 11)' },
    spirit: { default: 'high', doc: 'where the white spirit bear fishes in the bears’ falls: high (the top ledge) or low (the black bear swaps up)' },
  },
  sections: [
    { id: 'story', name: 'Maple at the river (story)' },
    { id: 'steps', name: 'Little steps', params: ['home'] },
    { id: 'falls', name: 'The big falls', params: ['home'], links: [{ label: 'The big falls', params: { home: '3' } }] },
    { id: 'bears', name: 'The bears are fishing', params: ['home', 'spirit'], links: [{ label: 'The bears are fishing', params: { home: '7' }, also: [{ label: 'the spirit bear on the low ledge', params: { home: '7', spirit: 'low' } }] }] },
    { id: 'eggs', name: 'Home: the eggs hatch', params: ['home'], links: [{ label: 'Home: the eggs hatch', params: { home: '11' } }] },
  ],
})
export default SALMON_SECTIONS
export type SalmonSection = (typeof SALMON_SECTIONS)['sections'][number]['id']

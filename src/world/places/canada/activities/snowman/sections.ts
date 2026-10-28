// Carnival Snowballs (greybox 9, plan: planning/around-the-world/canada.html): roll snowballs in the snowy park below
// Quebec City's castle hotel, stack them into snowmen, dress them for the Winter Carnival and march them in its parade.
// #/world/canada/snowman/<section>?size=huge&snowmen=3. A section link sets the park up as if she had played to there.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const SNOWMAN_SECTIONS = defineSections('canada', 'snowman', {
  params: {
    size: { default: 'big', values: ['big', 'huge'], doc: 'the ball a stack link starts with: big (a good snowman bottom) or huge (rolled forever: bigger than Maple, and she has climbed on top)' },
    snowmen: { default: '', values: ['', '1', '2', '3', '4', '5'], doc: 'how many snowmen she has made (empty = what that section starts with: dress 1, the newest still to dress and the others in the parade line; parade 4, all in the parade)' },
  },
  sections: [
    { id: 'roll', name: 'Roll one' },
    { id: 'stack', name: 'Stack a snowman', params: ['size'], links: [{ label: 'Stack a snowman', also: [{ label: 'the huge ball, Maple on top', params: { size: 'huge' } }] }] },
    { id: 'dress', name: 'Dress it for the carnival', params: ['snowmen'], links: [{ label: 'Dress it for the carnival', also: [{ label: 'two already in the parade line', params: { snowmen: '3' } }] }] },
    { id: 'parade', name: 'The parade', params: ['snowmen'], links: [{ label: 'The parade', also: [{ label: 'a long one', params: { snowmen: '5' } }] }] },
  ],
})
export default SNOWMAN_SECTIONS
export type SnowmanSection = (typeof SNOWMAN_SECTIONS)['sections'][number]['id']
export type BallSize = 'big' | 'huge'

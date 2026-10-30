// Decorate a Snowman (plan: planning/around-the-world/canada.html): in the snowy park below Quebec City's castle hotel,
// Kaylee decorates snowmen for the Winter Carnival's parade with whatever she grabs from Maple's toboggan (coal, a
// carrot, sticks, snow, rainbow snow paint, the red tuque, the woven sash, a scarf), the way she styles hair at the
// mall's Barber Salon in Thailand. #/world/canada/snowman/<section>?made=2. A section link sets the park up as if she
// had played to there. Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const SNOWMAN_SECTIONS = defineSections('canada', 'snowman', {
  params: {
    made: { default: '', values: ['', '1', '2', '3', '4', '5'], doc: 'how many decorated snowmen already wait in the parade line (empty = what that section starts with: friends 1, the first friend’s picture; parade 4)' },
  },
  sections: [
    { id: 'story', name: 'Maple asks for carnival snowmen' },
    { id: 'face', name: 'Give him a face (coal, a carrot, sticks, more snow)' },
    { id: 'dress', name: 'Dress him for the carnival (snow paint, the tuque, the sash, a scarf)' },
    { id: 'friends', name: 'Friends bring a picture of the snowman they want', params: ['made'], links: [{ label: 'Friends bring a picture', also: [{ label: 'the second picture', params: { made: '2' } }, { label: 'the last picture', params: { made: '3' } }] }] },
    { id: 'parade', name: 'The parade', params: ['made'], links: [{ label: 'The parade', also: [{ label: 'a long one', params: { made: '5' } }] }] },
  ],
})
export default SNOWMAN_SECTIONS
export type SnowmanSection = (typeof SNOWMAN_SECTIONS)['sections'][number]['id']

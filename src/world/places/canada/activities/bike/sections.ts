// Mountain Bike (greybox 2, plan: planning/around-the-world/canada.html): up Mont-Sainte-Anne in the gondola, then
// steer Maple's bike down the forest trail to the waterfall. #/world/canada/bike/<section>?trail=blue. A section link
// starts her at the beginning of that stretch.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const BIKE_SECTIONS = defineSections('canada', 'bike', {
  params: {
    trail: { default: 'green', values: ['green', 'blue'], doc: 'which way round the island of trees a berms link starts her toward: the green way (gentle rollers) or the blue way (steep berms, roots, rock hops)' },
  },
  sections: [
    { id: 'gondola', name: 'Up the gondola' },
    { id: 'green', name: 'The green trail' },
    { id: 'berms', name: 'Berms and bumps', params: ['trail'], links: [{ label: 'Berms and bumps', also: [{ label: 'the blue way', params: { trail: 'blue' } }] }] },
    { id: 'creek', name: 'The creek and the jump' },
    { id: 'falls', name: 'The waterfall' },
  ],
})
export default BIKE_SECTIONS
export type BikeSection = (typeof BIKE_SECTIONS)['sections'][number]['id']

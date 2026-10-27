// Campfire Night (greybox 4, plan: planning/around-the-world/canada.html): a dark campsite at the foot of Mont-Sainte-
// Anne, lit only by the flashlight that follows her finger. #/world/canada/campfire/<section>?found=4
// A section link sets the scene up as if she had played to there. Loaded at startup by the section index.
import { defineSections } from '../../../../kit/sections'

const CAMPFIRE_SECTIONS = defineSections('canada', 'campfire', {
  params: {
    found: { default: '', doc: 'how many night animals she has met so far, in the order of Maple’s book: owl, raccoon, deer, frog, beaver, mosquito, skunk, raccoon babies (empty = what that section starts with: 0, 4, 6 or 8)' },
  },
  sections: [
    { id: 'eyes', name: 'Find the eyes' },
    { id: 'sounds', name: 'Who’s that sound?', params: ['found'] },
    { id: 'bandit', name: 'The marshmallow bandit', params: ['found'] },
    { id: 'marshmallow', name: 'Roast a marshmallow' },
    { id: 'stars', name: 'Around the fire', params: ['found'] },
  ],
})
export default CAMPFIRE_SECTIONS
export type CampSection = (typeof CAMPFIRE_SECTIONS)['sections'][number]['id']

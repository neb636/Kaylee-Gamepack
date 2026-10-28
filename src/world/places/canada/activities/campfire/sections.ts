// Campfire Night (plan: planning/around-the-world/canada.html): a dark campsite at the foot of Mont-Sainte-Anne, lit
// only by the flashlight that follows her finger. #/world/canada/campfire/<section>?found=4
// A section link sets the scene up as if she had played to there. Loaded at startup by the section index.
import { defineSections } from '../../../../kit/sections'

const CAMPFIRE_SECTIONS = defineSections('canada', 'campfire', {
  params: {
    found: { default: '', doc: 'the night animals she has met so far: a number for the first N of Maple’s book (owl, raccoon, deer, frog, beaver, hare, porcupine, kits), or a comma list of those ids when she met them out of order (empty = what that section starts with: 0, 4, 6 or 8)' },
  },
  sections: [
    { id: 'story', name: 'Something is out there (Maple)', params: [] },
    { id: 'eyes', name: 'Find the eyes', params: ['found'] },
    { id: 'sounds', name: 'Who’s that sound?', params: ['found'], links: [{ label: 'Who’s that sound?', params: { found: '4' } }] },
    { id: 'bandit', name: 'The marshmallow bandit', params: ['found'], links: [{ label: 'The marshmallow bandit', params: { found: '6' } }] },
    { id: 'marshmallow', name: 'Roast a marshmallow', params: ['found'] },
    { id: 'stars', name: 'Around the fire', params: ['found'], links: [{ label: 'Around the fire', params: { found: '8' } }] },
  ],
})
export default CAMPFIRE_SECTIONS
export type CampSection = (typeof CAMPFIRE_SECTIONS)['sections'][number]['id']

import { defineSections } from '../../../../kit/sections'

export default defineSections('peru', 'river', {
  params: {
    plants: { default: 'auto', doc: 'Three plant growth levels 0 to 3; auto uses the section' },
    frog: { default: 'auto', doc: 'Frog awake: 0 or 1; auto uses the section' },
    sloth: { default: 'auto', doc: 'Sloth eyes 0 to 1; auto uses the section' },
    river: { default: 'auto', doc: 'River level 0 to 1; auto uses the section' },
    lagoon: { default: 'auto', doc: 'Lagoon level 0 to 1; auto uses the section' },
    buds: { default: 'auto', doc: 'Three lily growth levels 0 to 2; auto uses the section' },
    seats: { default: 'none', doc: 'Critter seats as three pad numbers, or none' },
    critters: { default: 'frog,monkey,capy', doc: 'Three lily pad friends in order' },
  },
  sections: [
    { id: 'story', name: 'Meet Rosa' },
    { id: 'forest', name: 'Wake the forest', params: ['plants', 'frog', 'sloth', 'river', 'lagoon', 'buds', 'seats', 'critters'] },
    { id: 'river', name: 'Fill the river', params: ['plants', 'frog', 'sloth', 'river', 'lagoon', 'buds', 'seats', 'critters'] },
    { id: 'swim', name: 'Rosa swims', params: ['plants', 'frog', 'sloth', 'river', 'lagoon', 'buds', 'seats', 'critters'] },
    { id: 'lagoon', name: 'Fill the lagoon', params: ['plants', 'frog', 'sloth', 'river', 'lagoon', 'buds', 'seats', 'critters'] },
    { id: 'pads', name: 'Seat the friends', params: ['plants', 'frog', 'sloth', 'river', 'lagoon', 'buds', 'seats', 'critters'] },
    { id: 'rainbow', name: 'Rainbow photo', params: ['plants', 'frog', 'sloth', 'river', 'lagoon', 'buds', 'seats', 'critters'] },
  ],
})

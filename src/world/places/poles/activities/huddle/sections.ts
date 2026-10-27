// Emperor Huddle (greybox 6, plan: planning/around-the-world/poles.html): drag the shivering emperor dads from the windy
// edge into the middle of the huddle, keep them moving in when the wind turns, then Pebble's egg hatches and the first
// sunrise. #/world/poles/huddle/<section>?wind=left&chick=hatched
// A section link sets the scene up as if she had played to there. Loaded at startup by the section index.
import { defineSections } from '../../../../kit/sections'

const HUDDLE_SECTIONS = defineSections('poles', 'huddle', {
  params: {
    wind: { default: 'left', values: ['left', 'right'], doc: 'the side the wind blows from (the huddle turns its back to it); it swings round in the blizzard' },
    chick: { default: 'egg', values: ['egg', 'hatched'], doc: "Pebble's egg: still an egg on Papa's feet, or hatched (start at the gusts that blow Pebble out)" },
  },
  sections: [
    { id: 'small', name: 'A small huddle', params: ['wind'] },
    { id: 'blizzard', name: 'The wind turns', params: ['wind'] },
    { id: 'hatch', name: "Crack! Pebble's egg", params: ['wind', 'chick'] },
    { id: 'sunrise', name: 'The first sunrise' },
  ],
})
export default HUDDLE_SECTIONS
export type HuddleSection = (typeof HUDDLE_SECTIONS)['sections'][number]['id']

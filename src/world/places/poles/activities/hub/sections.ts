// The Poles' hub, the globe, as deep-linkable spots: #/world/poles/hub/<section>?side=north.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections, HUB } from '../../../../kit/sections'

const HUB_SECTIONS = defineSections('poles', HUB, {
  params: {
    side: { default: 'middle', values: ['middle', 'north', 'south'], doc: 'which way the globe faces her: middle (the whole globe), north (the Arctic) or south (Antarctica)' },
    summer: { default: 'middle', values: ['middle', 'north', 'south'], doc: 'where the sun shines: north (summer up north, night down south), south, or middle (both in between)' },
    who: { default: 'penguin', values: ['penguin', 'bear'], doc: 'who is lost on the little iceberg: a penguin (home is the bottom) or a polar bear cub (the top)' },
  },
  sections: [
    { id: 'globe', name: 'Spin the globe', params: ['side'], links: [{ label: 'Spin the globe', also: [{ label: 'north side', params: { side: 'north' } }, { label: 'south side', params: { side: 'south' } }] }] },
    { id: 'sun', name: 'Drag the sun', params: ['side', 'summer'], links: [{ label: 'Drag the sun', also: [{ label: 'summer up north', params: { summer: 'north' } }, { label: "the north's winter night", params: { side: 'north', summer: 'south' } }] }] },
    { id: 'lost', name: 'The lost one', params: ['summer', 'who'], links: [{ label: 'The lost penguin: carry him home', params: { who: 'penguin' }, also: [{ label: 'a lost polar bear cub', params: { who: 'bear' } }] }] },
  ],
})
export default HUB_SECTIONS
export type HubSection = (typeof HUB_SECTIONS)['sections'][number]['id']

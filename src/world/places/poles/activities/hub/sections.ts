// The Poles' hub, the globe, as deep-linkable spots: #/world/poles/hub/<section>?side=north.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections, HUB } from '../../../../kit/sections'

const HUB_SECTIONS = defineSections('poles', HUB, {
  params: {
    side: { default: 'middle', values: ['middle', 'north', 'south'], doc: 'which way the globe faces her: middle (the whole globe), north (the Arctic) or south (Antarctica)' },
    summer: { default: 'middle', values: ['middle', 'north', 'south'], doc: 'where the sun shines: north (summer up north, night down south), south, or middle (both in between)' },
  },
  sections: [
    { id: 'globe', name: 'Spin the globe', params: ['side'] },
    { id: 'sun', name: 'Drag the sun', params: ['side', 'summer'] },
  ],
})
export default HUB_SECTIONS
export type HubSection = (typeof HUB_SECTIONS)['sections'][number]['id']

// Iceberg Maker (greybox 4, plan: planning/around-the-world/poles.html): pick a pole, tap the cracks in the ice cliff to
// break off bits, crack the giant one off and push it under the water, then push the bergs out to sea.
// #/world/poles/iceberg/<section>?pole=south. A section link sets the cliff up as if she had played to there.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const ICEBERG_SECTIONS = defineSections('poles', 'iceberg', {
  params: {
    pole: { default: 'north', values: ['north', 'south'], doc: "which pole's ice: Greenland's tall glacier (pointy bergs, Pola on top) or Antarctica's flat ice shelf (table bergs, penguins on top)" },
  },
  sections: [
    { id: 'pick', name: 'North or south?' },
    { id: 'bits', name: 'Little bits', params: ['pole'], links: [{ label: 'Little bits', params: { pole: 'north' }, also: [{ label: 'at the South Pole', params: { pole: 'south' } }] }] },
    { id: 'giant', name: 'The giant one', params: ['pole'], links: [{ label: 'The giant one (under the water)', params: { pole: 'north' }, also: [{ label: 'at the South Pole', params: { pole: 'south' } }] }] },
    { id: 'sail', name: 'Send them sailing', params: ['pole'], links: [{ label: 'Send them sailing', params: { pole: 'north' }, also: [{ label: 'at the South Pole', params: { pole: 'south' } }] }] },
  ],
})
export default ICEBERG_SECTIONS
export type IcebergSection = (typeof ICEBERG_SECTIONS)['sections'][number]['id']
export type Pole = 'north' | 'south'

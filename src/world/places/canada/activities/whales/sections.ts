// Whale Watch (greybox 7, plan: planning/around-the-world/canada.html): steer the little boat out of Tofino's harbour
// to the sea otters in the kelp, follow the spouts to the whales, swim with the orca family, and listen under the water.
// #/world/canada/whales/<section>?steer=wheel&found=2. A section link sets the sea up as if she had played to there.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const WHALE_SECTIONS = defineSections('canada', 'whales', {
  params: {
    steer: {
      default: 'finger',
      values: ['finger', 'wheel'],
      doc: 'how her finger steers the boat: finger (she holds the water where the boat should go and it follows, like the Thai bay) or wheel (the Mountain Bike\'s finger wheel: a finger down goes, pushing it left or right turns)',
    },
    found: { default: '0', values: ['0', '1', '2', '3'], doc: 'how many whales she has already found when a spouts link starts (0: the first grey whale; 2: the humpback; 3: the humpback that jumps)' },
  },
  sections: [
    { id: 'harbour', name: 'The harbour', params: ['steer'], links: [{ label: 'The harbour', also: [{ label: 'steering with the wheel instead', params: { steer: 'wheel' } }] }] },
    { id: 'otters', name: 'The otters in the kelp', params: ['steer'] },
    { id: 'spouts', name: 'Follow the spouts', params: ['steer', 'found'], links: [{ label: 'Follow the spouts', also: [{ label: 'the humpback', params: { found: '2' } }, { label: 'the humpback that jumps', params: { found: '3' } }] }] },
    { id: 'orcas', name: 'The orca family', params: ['steer'] },
    { id: 'listen', name: 'Listen under the water', params: ['steer'] },
  ],
})
export default WHALE_SECTIONS
export type WhaleSection = (typeof WHALE_SECTIONS)['sections'][number]['id']
export type SteerMode = 'finger' | 'wheel'

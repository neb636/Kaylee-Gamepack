// Whale Watch (plan: planning/around-the-world/canada.md): Maple has never seen a whale; steer the little boat out of Tofino's harbour
// to the sea otters in the kelp, follow the spouts to the whales, swim with the orca family, and listen under the water.
// #/world/canada/whales/<section>?found=2. A section link sets the sea up as if she had played to there.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const WHALE_SECTIONS = defineSections('canada', 'whales', {
  params: {
    found: { default: '0', values: ['0', '1', '2', '3'], doc: 'how many whales she has already found when a spouts link starts (0: the first grey whale; 2: the humpback; 3: the humpback that jumps)' },
  },
  sections: [
    { id: 'story', name: 'At the dock: off to find Ollie' },
    { id: 'harbour', name: 'The harbour' },
    { id: 'otters', name: 'Ollie and the otters in the kelp' },
    { id: 'spouts', name: 'Follow the spouts', params: ['found'], links: [{ label: 'Follow the spouts', also: [{ label: 'the humpback', params: { found: '2' } }, { label: 'the humpback that jumps', params: { found: '3' } }] }] },
    { id: 'orcas', name: 'The orca family' },
    { id: 'listen', name: 'Listen under the water' },
  ],
})
export default WHALE_SECTIONS
export type WhaleSection = (typeof WHALE_SECTIONS)['sections'][number]['id']

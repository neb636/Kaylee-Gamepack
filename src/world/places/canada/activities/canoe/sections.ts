// Red Canoe (planning/around-the-world/canada.md, the Banff chapter): Kaylee paddles Maple's red canoe across the
// turquoise lake to find Lulu the loon by the glacier, and on the way finds where the blue comes from (the glacier
// stream's rock flour). #/world/canada/canoe/<section>. A section link sets the lake up as if she had played to there
// (and skips Maple's hello). ?feel=1 opens the feel lab on the paddling's knobs. Loaded at startup by the section index
// (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const CANOE_SECTIONS = defineSections('canada', 'canoe', {
  params: {},
  sections: [
    { id: 'story', name: "Maple's hello at the dock" },
    { id: 'glide', name: 'Glide', links: [{ label: 'Glide', also: [{ label: 'feel lab', flags: { feel: '1' } }] }] },
    { id: 'stream', name: 'Where the blue comes from' },
    { id: 'loon', name: 'Follow the bubbles to Lulu' },
    { id: 'glacier', name: 'Lulu and her chick' },
  ],
})
export default CANOE_SECTIONS
export type CanoeSection = (typeof CANOE_SECTIONS)['sections'][number]['id']

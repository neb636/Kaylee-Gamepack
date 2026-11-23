// Red Canoe: Kaylee paddles Maple's red canoe across the
// turquoise lake to find Lulu the loon's lost chick in the glacier stream's milky water, takes it home to Lulu by the
// glacier, and then taps Lulu and she sings (the glacier sings it back). #/world/canada/canoe/<section>. A section link sets the lake up as if she had played to there
// (and skips Maple's hello). ?feel=1 opens the feel lab on the paddling's knobs. Loaded at startup by the section index
// (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const CANOE_SECTIONS = defineSections('canada', 'canoe', {
  params: {},
  sections: [
    { id: 'story', name: "Maple's hello at the dock" },
    { id: 'glide', name: 'Glide', links: [{ label: 'Glide', also: [{ label: 'feel lab', flags: { feel: '1' } }] }] },
    { id: 'stream', name: "Find Lulu's chick" },
    { id: 'loon', name: 'Take the chick home to Lulu' },
    { id: 'glacier', name: 'Lulu sings' },
  ],
})
export default CANOE_SECTIONS
export type CanoeSection = (typeof CANOE_SECTIONS)['sections'][number]['id']

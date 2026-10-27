// Red Canoe (greybox 5, plan: planning/around-the-world/canada.html): paddle the red canoe across Banff's turquoise
// lake, find where the blue comes from (the glacier stream's rock flour) and follow the loon to the glacier.
// #/world/canada/canoe/<section>?paddle=pull. A section link sets the lake up as if she had played to there.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const CANOE_SECTIONS = defineSections('canada', 'canoe', {
  params: {
    paddle: {
      default: 'stroke',
      values: ['stroke', 'pull'],
      doc: 'how her finger moves the canoe: stroke (she drags the paddle back through the water beside the canoe: a stroke on the left pushes it forward and turns it right) or pull (the fallback: her finger on the water ahead and the canoe is pulled toward it)',
    },
  },
  sections: [
    { id: 'glide', name: 'Glide', params: ['paddle'] },
    { id: 'stream', name: 'Where the blue comes from', params: ['paddle'] },
    { id: 'loon', name: 'Follow the loon', params: ['paddle'] },
    { id: 'glacier', name: 'The loon family', params: ['paddle'] },
  ],
})
export default CANOE_SECTIONS
export type CanoeSection = (typeof CANOE_SECTIONS)['sections'][number]['id']
export type PaddleMode = 'stroke' | 'pull'

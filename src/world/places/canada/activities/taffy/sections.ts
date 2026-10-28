// Sugar Snow (plan: planning/around-the-world/canada.html): tip the pot to pour hot maple syrup on a tray of
// snow, watch it steam and set, then roll it up on a stick. #/world/canada/taffy/<section>?made=3&fed=chipmunk&tip=hold
// A section link sets the scene up as if she had played to there. Loaded at startup by the section index (keep
// perfect-freehand out of this file).
import { defineSections } from '../../../../kit/sections'

const TAFFY_SECTIONS = defineSections('canada', 'taffy', {
  params: {
    made: { default: '', doc: 'how many lollipops she has made so far (the little sticks along the tray; empty = what that section starts with: 0, 3, 6 or 10)' },
    fed: { default: '', doc: 'the animals already fed in orders (a comma list of chipmunk, cousin, owl, moose)' },
    tip: { default: 'hold', values: ['hold', 'lead'], doc: 'how her finger tips the pot: hold (the longer she holds it, the more it tips) or lead (it tips the further her finger pulls ahead of it)' },
  },
  sections: [
    { id: 'story', name: "Maple's cousins" },
    { id: 'pour', name: 'Lines', params: ['tip'], links: [{ label: 'Lines: pour, let it set, roll it up', also: [{ label: 'tip by pulling ahead', params: { tip: 'lead' } }] }] },
    { id: 'shapes', name: 'Shapes', params: ['made', 'tip'] },
    { id: 'orders', name: 'Orders', params: ['made', 'fed', 'tip'], links: [{ label: 'Orders', also: [{ label: 'the chipmunk fed', params: { made: '7', fed: 'chipmunk' } }] }] },
    { id: 'share', name: 'Everyone crunches', params: ['made'] },
  ],
})
export default TAFFY_SECTIONS
export type TaffySection = (typeof TAFFY_SECTIONS)['sections'][number]['id']

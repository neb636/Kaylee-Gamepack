// Misty's Bubble Bath (planning/around-the-world/canada-round-2.md): Misty the spirit bear is covered in mud; she rubs
// her clean, fluffs her up and paints her with berries, and Misty goes to the big game looking like that.
// #/world/canada/bath/<section>?look=... A section link sets the bath up as if she had played to there.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const BATH_SECTIONS = defineSections('canada', 'bath', {
  sections: [
    { id: 'story', name: 'At the river: bath time' },
    { id: 'wash', name: 'Wash: the sponge, then the rain' },
    { id: 'fluff', name: 'Fluff: the towel, then the comb' },
    { id: 'colors', name: 'Colors: the berries, then ferns, flowers and bows' },
    { id: 'mirror', name: 'The mirror pool, then the team sweater' },
  ],
})
export default BATH_SECTIONS
export type BathSection = (typeof BATH_SECTIONS)['sections'][number]['id']

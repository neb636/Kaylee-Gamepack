// Misty's Bubble Bath (canada-round-2.md in git history): Misty the spirit bear is covered in mud; she rubs
// her clean, fluffs her up and paints her with berries, and Misty goes to the big game looking like that.
// #/world/canada/bath/<section>?look=... A section link sets the bath up as if she had played to there: the wash and
// the story start muddy, the fluff clean and wet, the colors fluffy, the mirror in a finished look with the pool
// glowing. Misty's look rides in the sticky `look` param (looks.ts encodeMisty: fur~puff~hair~worn~print~sweater); a
// colors or mirror link without one uses its own (a bare `look=` is looks.ts DEFAULT_MISTY), and the bath keeps the
// param in step with what she makes.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const BATH_SECTIONS = defineSections('canada', 'bath', {
  sections: [
    { id: 'story', name: 'At the river: bath time' },
    { id: 'wash', name: 'Wash: the sponge, then the rain', links: [{ label: 'Wash: the sponge, then the rain', also: [{ label: 'the feel lab', flags: { feel: '1' } }] }] },
    { id: 'fluff', name: 'Fluff: the towel, then the comb' },
    { id: 'colors', name: 'Colors: the berries, then ferns, flowers and bows', links: [{ label: 'Colors: the berries, then ferns, flowers and bows', also: [{ label: 'a pink spiky look', flags: { look: 'earL.pink.9,earR.pink.9~6~spikes.pink~~~0' } }] }] },
    { id: 'mirror', name: 'The mirror pool, then the team sweater', links: [{ label: 'The mirror pool, then the team sweater', also: [{ label: 'in the default look', flags: { look: '' } }, { label: 'all three berries, a crown', flags: { look: 'head.purple.6,earL.pink.9,earR.pink.9,tummy.blue.7,armL.pink.9,armR.purple.8~8~swoop.purple~crown.crown,flower.earL~~0' } }] }] },
  ],
})
export default BATH_SECTIONS
export type BathSection = (typeof BATH_SECTIONS)['sections'][number]['id']

// Campfire Night, in 3D: Flashlight Statues (plan: planning/around-the-world/canada-round-2.md, part 2). One clearing
// at night; her finger is the flashlight, and whoever it lands on freezes with a silly face.
// #/world/canada/campfire/<section>?kits=2. A section link sets the clearing up as if she had played to there (and
// skips Maple's hello). ?feel=1 opens the feel lab on the light's knobs. Loaded at startup by the section index (keep
// three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const CAMPFIRE_SECTIONS = defineSections('canada', 'campfire', {
  params: {
    kits: { default: '0', values: ['0', '1', '2'], doc: 'peek-a-boo: how many of the three kits are already at the fire' },
    laughs: { default: '0', values: ['0', '1', '2'], doc: 'statues: how many times Roxy has already fallen over laughing (three and she gives up)' },
    roasted: { default: '0', values: ['0', '1', '2', '3'], doc: 'the roast: how many marshmallows she has already handed out (four and the flashlight goes off)' },
  },
  sections: [
    { id: 'story', name: 'Somebody is watching (Maple)', params: [] },
    { id: 'eyes', name: 'Who’s out there?', params: [], links: [{ label: 'Who’s out there?', also: [{ label: 'feel lab', flags: { feel: '1' } }] }] },
    { id: 'peek', name: 'Peek-a-boo with the kits', params: ['kits'], links: [{ label: 'Peek-a-boo with the kits', also: [{ label: 'the last kit', params: { kits: '2' } }] }] },
    { id: 'statues', name: 'Statues with Roxy', params: ['laughs'], links: [{ label: 'Statues with Roxy', also: [{ label: 'the last laugh', params: { laughs: '2' } }, { label: 'feel lab', flags: { feel: '1' } }] }] },
    { id: 'roast', name: 'Roast a marshmallow', params: ['roasted'] },
    { id: 'sky', name: 'Lights off: the stars and the northern lights', params: [] },
  ],
})
export default CAMPFIRE_SECTIONS
export type CampSection = (typeof CAMPFIRE_SECTIONS)['sections'][number]['id']

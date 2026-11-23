// Whale Peek-a-Boo (plan: canada-round-2.md in git history, section 3): a whale's spout blew Ollie's lucky
// rock out to sea. Bubbles come up by Maple's boat; touch them and a whale comes up right there, and then the whale is
// the toy: the grey whale, the humpback, and the orca family whose baby has the rock.
// #/world/canada/whales/<section>. A section link sets the sea up as if she had played to there.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const WHALE_SECTIONS = defineSections('canada', 'whales', {
  params: {},
  sections: [
    { id: 'story', name: 'Ollie on the rope: "My rock! The whale took it!"' },
    { id: 'grey', name: 'Bubbles, and the grey whale: its blowhole, back, barnacles and tail' },
    { id: 'humpback', name: 'The humpback: hold it down and let go, it jumps (the biggest: a ride on its back)', links: [{ label: 'The humpback', also: [{ label: 'feel lab', flags: { feel: '1' } }] }] },
    { id: 'orcas', name: 'The orca family: peek-a-boo with the baby, who has the rock' },
  ],
})
export default WHALE_SECTIONS
export type WhaleSection = (typeof WHALE_SECTIONS)['sections'][number]['id']

// Captain Kaylee's boat trip (plan: planning/around-the-world/thailand/boat-trip.md), as deep-linkable sections:
// #/world/thailand/boat-trip/<section>. Greybox 1 is only the boat toy in the bay; the packing, the taxi, the plane and
// the way home come in later gates (their sections are added then). Loaded at startup: keep three.js out of this file.
import { defineSections } from '../../../../kit/sections'

const BOAT_SECTIONS = defineSections('thailand', 'boat-trip', {
  sections: [
    { id: 'pier', name: 'Get in the longtail at the pier' },
    { id: 'bay', name: 'Drive the longtail in the bay' },
    { id: 'cave', name: 'The canoe, the low cave and the hong' },
    { id: 'nail', name: 'The Nail Island and its beach' },
  ],
})
export default BOAT_SECTIONS
export type BoatSection = (typeof BOAT_SECTIONS)['sections'][number]['id']

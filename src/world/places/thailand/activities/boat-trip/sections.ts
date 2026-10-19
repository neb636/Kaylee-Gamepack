// Captain Kaylee's boat trip (plan: planning/around-the-world/thailand/boat-trip.md), as deep-linkable sections:
// #/world/thailand/boat-trip/<section>?packed=<what's in the suitcase>. The trip kit (greybox 2): Mommy asks if she's
// ready, packing, the goodbye and Aunty Sri's van, the airport and the window seat; then the boat toy in the bay
// (greybox 1). The way home comes in a later gate. Loaded at startup: keep three.js out of this file.
import { defineSections } from '../../../../kit/sections'
import { DEFAULT_PACKED, ITEMS } from '../../trip/packing'

const BOAT_SECTIONS = defineSections('thailand', 'boat-trip', {
  params: {
    packed: { default: DEFAULT_PACKED, doc: `what's in her suitcase, a comma list of ${ITEMS.map((i) => i.id).join(', ')} (e.g. gan,fan,mango for the silly x-ray)` },
  },
  sections: [
    { id: 'invite', name: 'Mommy asks: ready for a trip?' },
    { id: 'pack', name: 'Pack the suitcase', params: ['packed'] },
    { id: 'goodbye', name: "Goodbye at Agong's house, into Aunty Sri's van", params: ['packed'] },
    { id: 'airport', name: 'The x-ray belt', params: ['packed'] },
    { id: 'takeoff', name: 'Window seat: seatbelt and takeoff', params: ['packed'] },
    { id: 'fly', name: 'Window seat: tray, snacks, the elephant below', params: ['packed'] },
    { id: 'land', name: 'Landing in Krabi', params: ['packed'] },
    { id: 'pier', name: 'Get in the longtail at the pier', params: ['packed'] },
    { id: 'bay', name: 'Drive the longtail in the bay', params: ['packed'] },
    { id: 'cave', name: 'The canoe, the low cave and the hong', params: ['packed'] },
    { id: 'nail', name: 'The Nail Island and its beach', params: ['packed'] },
  ],
})
export default BOAT_SECTIONS
export type BoatSection = (typeof BOAT_SECTIONS)['sections'][number]['id']

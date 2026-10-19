// Captain Kaylee's boat trip (plan: planning/around-the-world/thailand/boat-trip.md), as deep-linkable sections:
// #/world/thailand/boat-trip/<section>?packed=<what's in the suitcase>&ribbons=...&stops=...&photos=...&found=...
// The trip kit (greybox 2): Mommy asks if she's ready, packing, the goodbye and Aunty Sri's van, the airport and the
// window seat; then Phang Nga Bay (step 3): the pier and its ribbons, open water, the village, the cave and the hong, the
// Nail Island's photo and the sunset ride back. The way home comes in a later gate. Loaded at startup: keep three.js
// out of this file.
import { defineSections } from '../../../../kit/sections'
import { DEFAULT_PACKED, ITEMS } from '../../trip/packing'

const BOAT_SECTIONS = defineSections('thailand', 'boat-trip', {
  params: {
    packed: { default: DEFAULT_PACKED, doc: `what's in her suitcase, a comma list of ${ITEMS.map((i) => i.id).join(', ')} (e.g. gan,fan,mango for the silly x-ray)` },
    ribbons: { default: 'pink,butter,mint', doc: 'the three ribbons on the longtail\'s bow: pink, butter, mint, sky, lavender, hotpink (a pier link with it has them tied already)' },
    stops: { default: '', doc: 'stops already visited: village, cave (their glows are out; village = the football rides in the boat)' },
    photos: { default: '', doc: 'photos already in the trip album: village, hong, nail' },
    found: { default: '', doc: 'animal stickers found: needlefish, eagle, macaque, cat, crab, mudskipper, lizard, kingfisher, porpoise' },
  },
  sections: [
    { id: 'invite', name: 'Mommy asks: ready for a trip?' },
    { id: 'pack', name: 'Pack the suitcase', params: ['packed'] },
    { id: 'goodbye', name: "Goodbye at Agong's house, into Aunty Sri's van", params: ['packed'] },
    { id: 'airport', name: 'The x-ray belt', params: ['packed'] },
    { id: 'takeoff', name: 'Window seat: seatbelt and takeoff', params: ['packed'] },
    { id: 'fly', name: 'Window seat: tray, snacks, the elephant below', params: ['packed'] },
    { id: 'land', name: 'Landing in Krabi', params: ['packed'] },
    { id: 'pier', name: 'Tie ribbons on the longtail at the pier', params: ['packed', 'ribbons'] },
    { id: 'bay', name: 'Open water: where to, captain?', params: ['packed', 'ribbons', 'stops', 'found'] },
    { id: 'village', name: 'Koh Panyee: the floating football field', params: ['packed', 'ribbons', 'found'] },
    { id: 'cave', name: 'Into the canoe, under the low roof', params: ['packed', 'found'] },
    { id: 'hong', name: 'The hong, a secret lagoon inside the island', params: ['packed', 'found'] },
    { id: 'nail', name: 'The Nail Island and the photo', params: ['packed', 'ribbons', 'stops', 'photos', 'found'] },
    { id: 'sunset', name: 'The ride back at sunset, and the porpoise', params: ['packed', 'ribbons', 'found'] },
  ],
})
export default BOAT_SECTIONS
export type BoatSection = (typeof BOAT_SECTIONS)['sections'][number]['id']

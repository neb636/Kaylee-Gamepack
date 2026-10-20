// Captain Kaylee's boat trip (plan: planning/around-the-world/thailand/boat-trip.md), as deep-linkable sections:
// #/world/thailand/boat-trip/<section>?packed=<what's in the suitcase>&ribbons=...&stops=...&photos=...&found=...
// The trip there (step 4): Mommy asks if she's ready, packing, the goodbye and Aunty Sri's van, the airport and the
// window seat; then Phang Nga Bay (step 3): the pier and its ribbons, open water, the village, the cave and the hong, the
// Nail Island's photo and the sunset ride back; then home (step 5): the flight home, Aunty Sri's van at Agong's door,
// the photo she picks for Agong's wall, and the stamp. `replay=1` plays it as a trip she has done before (Mommy's yes
// offers 🧳 or 🚤, and the flight is shorter). Loaded at startup: keep three.js out of this file.
import { defineSections } from '../../../../kit/sections'
import { DEFAULT_PACKED, ITEMS } from '../../trip/packing'

const BOAT_SECTIONS = defineSections('thailand', 'boat-trip', {
  params: {
    packed: { default: DEFAULT_PACKED, doc: `what's in her suitcase, a comma list of ${ITEMS.map((i) => i.id).join(', ')} (e.g. gan,fan,mango for the silly x-ray)` },
    ribbons: { default: 'pink,butter,mint', doc: 'the three ribbons on the longtail\'s bow: pink, butter, mint, sky, lavender, hotpink (a pier link with it has them tied already)' },
    stops: { default: '', doc: 'stops already visited: village, cave (their glows are out; village = the football rides in the boat)' },
    photos: { default: '', doc: 'photos already in the trip album: village, hong, nail' },
    found: { default: '', doc: 'animal stickers found: needlefish, eagle, macaque, cat, crab, mudskipper, lizard, kingfisher, porpoise' },
    replay: { default: '', doc: "1 = she has done the whole trip before (as after her first trip): yes to Mommy offers 🧳 the whole trip or 🚤 straight to the pier, and the flight is shorter" },
  },
  sections: [
    { id: 'invite', name: 'Mommy asks: ready for a trip?', params: ['replay'] },
    { id: 'pack', name: 'Pack the suitcase', params: ['packed', 'replay'] },
    { id: 'goodbye', name: "Goodbye at Agong's house, into Aunty Sri's van", params: ['packed', 'replay'] },
    { id: 'airport', name: 'The x-ray belt', params: ['packed', 'replay'] },
    { id: 'takeoff', name: 'Window seat: seatbelt and takeoff', params: ['packed', 'replay'] },
    { id: 'fly', name: 'Window seat: tray, snacks, the elephant below', params: ['packed', 'replay'] },
    { id: 'land', name: 'Landing in Krabi', params: ['packed', 'replay'] },
    { id: 'pier', name: 'Tie ribbons on the longtail at the pier', params: ['packed', 'ribbons'] },
    { id: 'bay', name: 'Open water: where to, captain?', params: ['packed', 'ribbons', 'stops', 'found'] },
    { id: 'village', name: 'Koh Panyee: the floating football field', params: ['packed', 'ribbons', 'found'] },
    { id: 'cave', name: 'Into the canoe, under the low roof', params: ['packed', 'found'] },
    { id: 'hong', name: 'The hong, a secret lagoon inside the island', params: ['packed', 'found'] },
    { id: 'nail', name: 'The Nail Island and the photo', params: ['packed', 'ribbons', 'stops', 'photos', 'found'] },
    { id: 'sunset', name: 'The ride back at sunset, and the porpoise', params: ['packed', 'ribbons', 'photos', 'found'] },
    { id: 'home', name: "Home: the photo for Agong's wall, and the stamp", params: ['packed', 'photos', 'found'] },
  ],
})
export default BOAT_SECTIONS
export type BoatSection = (typeof BOAT_SECTIONS)['sections'][number]['id']

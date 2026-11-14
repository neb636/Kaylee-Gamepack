// Captain Kaylee's boat trip (plan: planning/around-the-world/thailand/boat-trip.md (retired; in git history)), as deep-linkable sections:
// #/world/thailand/boat-trip/<section>?packed=<what's in the suitcase>&ribbons=...&stops=...&photos=...&found=...
// The trip there (step 4): Mom asks if she's ready, packing, the goodbye and Aunty Sri's van, the airport and the
// window seat; then the Krabi map (map?been=..., notes: thailand/krabi-map.md), the trip's hub: a toy diorama of Krabi
// and Phang Nga Bay where she sends the little songthaew to Baan Chang or the pier, in any order, and back to it after
// each (its stamp lands there); then Phang Nga Bay (step 3): the pier and its ribbons, open water, the village, the
// cave and the hong, the boat race through the rainbow gate (its own lagoon: three laps, then the podium and the
// trophy), the Nail Island's photo and the sunset ride back; Baan Chang Cafe in Krabi (thailand/baan-chang.md (retired;
// in git history)): the songthaew to the entrance, the photo at the bamboo sign, her chocolate milk at the cafe, down
// the boardwalk, then the elephants' yard: feeding, favorites, Lamyai and the splash. Home is the airport on the map
// (the plane takes off, then the stamp); home (step 5) is the old way home through Agong's house, by its link only.
// `replay=1` plays it as a trip she has done before (Mom's yes offers 🧳 or 🚤, and the flight is shorter). Loaded at
// startup: keep three.js out of this file.
import { defineSections } from '../../../../kit/sections'
import { DEFAULT_PACKED, ITEMS } from '../../trip/packing'

const BOAT_SECTIONS = defineSections('thailand', 'boat-trip', {
  params: {
    packed: { default: DEFAULT_PACKED, doc: `what's in her suitcase, a comma list of ${ITEMS.map((i) => i.id).join(', ')} (e.g. gan,fan,mango for the silly x-ray)` },
    ribbons: { default: 'pink,butter,mint', doc: 'the three ribbons on the longtail\'s bow: pink, butter, mint, sky, lavender, hotpink (a pier link with it has them tied already)' },
    stops: { default: '', doc: 'stops already visited: village, cave, race (their glows are out; village = the football rides in the boat, race = she won the boat race and the trophy rides in the bow)' },
    photos: { default: '', doc: 'photos already in the trip album: village, hong, nail' },
    been: { default: '', doc: "Krabi's two places already done, in the order she did them: chang (Baan Chang, the elephants), bay (the boat; back at the pier at sunset). On the Krabi map they wear a stamp (the newest one lands when she's back), the songthaew waits at the last one, and after one the airport opens (home); and the boarding pass's punches" },
    found: { default: '', doc: 'animal stickers found: needlefish, eagle, macaque, cat, crab, mudskipper, lizard, kingfisher, porpoise, elephant (Baan Chang, Khanom)' },
    fed: { default: '0', doc: 'Baan Chang: how many foods the elephants have had already (their bellies are that round)' },
    straw: { default: 'pink', values: ['pink', 'purple', 'yellow'], doc: 'Baan Chang: the straw she put in her chocolate milk at the cafe (it rides along to the yard, on the rail post)' },
    lap: { default: '1', values: ['1', '2', '3'], doc: 'the boat race: the lap it starts on (3 = straight to the last lap and the finish)' },
    replay: { default: '', doc: "1 = she has done the whole trip before (as after her first trip): yes to Mom offers 🧳 the whole trip or 🚤 straight to the pier, and the flight is shorter" },
  },
  sections: [
    { id: 'invite', name: 'Mom asks: ready for a trip?', params: ['replay'], group: 'Getting there' },
    { id: 'pack', name: 'Pack the suitcase', params: ['packed', 'replay'], group: 'Getting there' },
    { id: 'goodbye', name: "Goodbye at Agong's house, into Aunty Sri's van", params: ['packed', 'replay'], group: 'Getting there' },
    { id: 'airport', name: 'The x-ray belt', params: ['packed', 'replay'], group: 'Getting there' },
    { id: 'takeoff', name: 'Window seat: seatbelt and takeoff', params: ['packed', 'replay'], group: 'Getting there' },
    { id: 'fly', name: 'Window seat: tray, snacks, the elephant below', params: ['packed', 'replay'], group: 'Getting there' },
    { id: 'land', name: 'Landing in Krabi, then the Krabi map', params: ['packed', 'replay', 'been'], group: 'Getting there' },
    { id: 'map', name: 'The Krabi map: send the songthaew to the elephants or the boat', params: ['packed', 'been'], group: 'The Krabi map', links: [{ label: 'The Krabi map: tap a place, or drag the little songthaew there (from the Thailand map)' }, { label: 'Back from Baan Chang: its stamp lands, the airport opens', params: { been: 'chang' } }, { label: 'Both done: the stamps, and the plane home', params: { been: 'chang,bay' } }] },
    { id: 'chang', name: 'Baan Chang: the songthaew to the elephant cafe', params: ['packed', 'been'], group: 'Baan Chang' },
    { id: 'sign', name: 'Baan Chang: the bamboo sign wall and a photo', params: ['packed', 'been', 'photos', 'found'], group: 'Baan Chang' },
    { id: 'drinks', name: 'Baan Chang: the cafe, her chocolate milk (and an iced coffee for Dad)', params: ['packed', 'straw', 'been'], group: 'Baan Chang' },
    { id: 'boardwalk', name: 'Baan Chang: down the boardwalk through the palms', params: ['packed', 'straw', 'been'], group: 'Baan Chang' },
    { id: 'feed', name: 'Baan Chang: bananas and sugarcane for Mali and Khanom', params: ['packed', 'straw', 'fed', 'been'], group: 'Baan Chang' },
    { id: 'favorites', name: "Baan Chang: everyone's favorite food", params: ['packed', 'straw', 'fed', 'been'], group: 'Baan Chang' },
    { id: 'lamyai', name: 'Baan Chang: Lamyai wanders over; Khanom sneaks a sip', params: ['packed', 'straw', 'fed', 'been'], group: 'Baan Chang' },
    { id: 'splash', name: 'Baan Chang: the rainbow splash, then 🗺️ back to the Krabi map', params: ['packed', 'straw', 'fed', 'been', 'photos', 'found'], group: 'Baan Chang', links: [{ label: 'The rainbow splash, the real elephants video, then 🗺️ back to the Krabi map' }] },
    { id: 'pier', name: 'Tie ribbons on the longtail at the pier', params: ['packed', 'ribbons', 'been'], group: 'Phang Nga Bay' },
    { id: 'bay', name: 'Open water: where to, captain?', params: ['packed', 'ribbons', 'stops', 'found', 'been'], group: 'Phang Nga Bay', links: [{ label: 'Open water: where to, captain?', also: [{ label: 'iPhone tilt to steer', flags: { steer: 'tilt' } }] }] },
    { id: 'village', name: 'Koh Panyee: the floating football field', params: ['packed', 'ribbons', 'found', 'been'], group: 'Phang Nga Bay' },
    { id: 'cave', name: 'Into the canoe, under the low roof', params: ['packed', 'found', 'been'], group: 'Phang Nga Bay' },
    { id: 'hong', name: 'The hong, a secret lagoon inside the island', params: ['packed', 'found', 'been'], group: 'Phang Nga Bay' },
    { id: 'race', name: 'The boat race: three laps against the village kids and the macaque', params: ['packed', 'ribbons', 'lap', 'been'], group: 'Phang Nga Bay', links: [{ label: 'The boat race: three laps against the village kids and the macaque', also: [{ label: 'iPhone tilt to steer', flags: { steer: 'tilt' } }, { label: 'finger on any device', flags: { steer: 'finger' } }] }] },
    { id: 'podium', name: 'The race podium and the trophy', params: ['packed', 'ribbons', 'been'], group: 'Phang Nga Bay' },
    { id: 'nail', name: 'The Nail Island and the photo', params: ['packed', 'ribbons', 'stops', 'photos', 'found', 'been'], group: 'Phang Nga Bay' },
    { id: 'sunset', name: 'The ride back at sunset, and the porpoise (then 🗺️ back to the Krabi map)', params: ['packed', 'ribbons', 'photos', 'found', 'been'], group: 'Phang Nga Bay' },
    { id: 'home', name: "Home: the photo for Agong's wall, and the stamp", params: ['packed', 'photos', 'found'], group: 'Home' },
  ],
})
export default BOAT_SECTIONS
export type BoatSection = (typeof BOAT_SECTIONS)['sections'][number]['id']

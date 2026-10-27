// Thailand's home base as deep-linkable spots: the Thailand map (map/, where she lands: fly the toy plane to Bangkok,
// Krabi or Nan) and Agong's house in Bangkok: #/world/thailand/hub/<section>?at=<thing>.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections, HUB } from '../../../../kit/sections'
import { PIN_IDS } from './map/geo'

const HUB_SECTIONS = defineSections('thailand', HUB, {
  params: {
    plane: { default: 'bangkok', values: PIN_IDS, doc: 'the map: the pin the toy plane is parked at (bangkok, krabi, nan)' },
    fly: { default: '', values: ['', ...PIN_IDS], doc: 'the map: the plane takes off and flies there by itself (the short flight), and that place opens (bangkok: the house; krabi: the boat trip at Krabi airport; nan: the Nan map)' },
    stamp: { default: '', values: ['', 'boat-trip', 'nan-trip', 'mall-trip'], doc: "the map: this trip's stamp lands on its pin (the end of a trip: Krabi's for boat-trip, Nan's for nan-trip, Bangkok's for mall-trip)" },
    at: {
      default: '',
      doc: 'start already using a thing on that floor: table, ground-couch, altar, desk, fridge, photos (downstairs); mattress, pillows, couch, suitcase, balcony (upstairs); motorbike, spirit-house, cat (street)',
    },
    drawer: {
      default: '',
      values: ['', 'head', 'face', 'back', 'outfit', 'feet', 'paint'],
      doc: "the wardrobe with this drawer open: head (hats), face (glasses), back (wings), outfit, feet (shoes), paint",
    },
    door: {
      default: '',
      doc: "the wardrobe with these pictures of looks on its left door (up to 4, ';' between them): crown,hearts;bow,fairy,dress-mint",
    },
    who: {
      default: '',
      doc: 'the family photo with one person alone, turning slowly: kaylee, agong, ji, nick, jum, joy, bird, ja, sri, gan, ken, bb, putto, putter',
    },
  },
  sections: [
    { id: 'map', name: 'The Thailand map: fly the toy plane, land on a pin', params: ['plane', 'fly', 'stamp'] },
    { id: 'arrive', name: 'Arrive by tuk-tuk' },
    { id: 'street', name: "In front of Agong's house", params: ['at'] },
    { id: 'downstairs', name: 'Downstairs', params: ['at'] },
    { id: 'upstairs', name: "Kaylee's room upstairs", params: ['at'] },
    { id: 'wardrobe', name: "Kaylee's wardrobe", params: ['drawer', 'door'] },
    { id: 'family', name: 'Family photo', params: ['who'] },
  ],
})
export default HUB_SECTIONS
/** The house's own spots (every hub section but the map). */
export type HubSection = Exclude<(typeof HUB_SECTIONS)['sections'][number]['id'], 'map'>

// Thailand's home base as deep-linkable spots: the Thailand map (map/, where she lands: tap Bangkok, Krabi or Nan) and Agong's house in Bangkok: #/world/thailand/hub/<section>?at=<thing>.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections, HUB } from '../../../../kit/sections'

const HUB_SECTIONS = defineSections('thailand', HUB, {
  params: {
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
    { id: 'map', name: 'The Thailand map: tap a pin to go there', params: ['stamp'], group: 'The Thailand map', links: [{ label: 'The map', bare: true }, { label: 'Home from a trip: the stamp lands on Krabi', params: { stamp: 'boat-trip' } }] },
    { id: 'arrive', name: 'Arrive by tuk-tuk', group: "Agong's house" },
    { id: 'street', name: "In front of Agong's house", params: ['at'], group: "Agong's house" },
    { id: 'downstairs', name: 'Downstairs', params: ['at'], group: "Agong's house" },
    { id: 'upstairs', name: "Kaylee's room upstairs", params: ['at'], group: "Agong's house", links: [{ label: "Kaylee's room upstairs", also: [{ label: 'in a look from her wardrobe', flags: { look: 'crown,hearts,fairy,dress-mint' } }] }] },
    { id: 'wardrobe', name: "Kaylee's wardrobe", params: ['drawer', 'door'], group: "Agong's house", links: [{ label: 'Her wardrobe: doors open (any link takes ?look=crown,hearts,fairy,tutu,sneakers,dress-mint,hair-pink,fur-sky)' }, { label: 'Her wardrobe: the hats drawer out', params: { drawer: 'head' }, also: [{ label: 'face', params: { drawer: 'face' } }, { label: 'back', params: { drawer: 'back' } }, { label: 'outfit', params: { drawer: 'outfit' } }, { label: 'feet', params: { drawer: 'feet' } }] }, { label: 'Her wardrobe: the paint drawer out', params: { drawer: 'paint' } }, { label: 'Her wardrobe: four pictures of looks on the door', params: { drawer: 'head', door: 'crown,hearts,tutu;bow,fairy,dress-mint;cap,stars,cape;overalls,boots,hair-pink,fur-sky' } }] },
    { id: 'family', name: 'Family photo', params: ['who'], group: "Agong's house" },
  ],
})
export default HUB_SECTIONS
/** The house's own spots (every hub section but the map). */
export type HubSection = Exclude<(typeof HUB_SECTIONS)['sections'][number]['id'], 'map'>

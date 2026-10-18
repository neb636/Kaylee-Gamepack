// Agong's house (Thailand's home base) as deep-linkable spots: #/world/thailand/hub/<section>?at=<thing>.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections, HUB } from '../../../../kit/sections'

const HUB_SECTIONS = defineSections('thailand', HUB, {
  params: {
    at: {
      default: '',
      doc: 'start already using a thing on that floor: table, altar, desk, fridge, photos (downstairs); mattress, pillows, couch, suitcase, balcony (upstairs); motorbike, spirit-house, cat (street)',
    },
    who: {
      default: '',
      doc: 'the family photo with one person alone, turning slowly: kaylee, agong, ji, nick, jum, joy, bird, ja, sri, gan, ken, bb, putto, putter',
    },
  },
  sections: [
    { id: 'arrive', name: 'Arrive by tuk-tuk' },
    { id: 'street', name: "In front of Agong's house", params: ['at'] },
    { id: 'downstairs', name: 'Downstairs', params: ['at'] },
    { id: 'upstairs', name: "Kaylee's room upstairs", params: ['at'] },
    { id: 'family', name: 'Family photo', params: ['who'] },
  ],
})
export default HUB_SECTIONS
export type HubSection = (typeof HUB_SECTIONS)['sections'][number]['id']

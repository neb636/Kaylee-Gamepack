// Agong's house (Thailand's home base) as deep-linkable spots: #/world/thailand/hub/<section>?at=<thing>.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections, HUB } from '../../../../kit/sections'

const HUB_SECTIONS = defineSections('thailand', HUB, {
  params: {
    at: {
      default: '',
      doc: 'start already using a thing on that floor: table, ground-couch, altar, desk, fridge, photos (downstairs); mattress, pillows, couch, suitcase, balcony (upstairs); motorbike, spirit-house, cat (street)',
    },
    who: {
      default: '',
      doc: 'the family photo with one person alone, turning slowly: kaylee, agong, ji, nick, jum, joy, bird, ja, sri, gan, ken, bb, putto, putter',
    },
    look: {
      default: '',
      doc: "what Aunt Joy wears in the salon, a comma list of slot-option: lips-(pink|red|coral|purple), cheeks-(rose|peach|lilac), eyes-(sky|lavender|mint|gold), earrings-(pearl|hoop|heart|star|flower), hair-(plumeria|orchid|bow|tiara), necklace-(pearls|gold|garland); e.g. lips-red,earrings-pearl",
    },
    step: {
      default: 'rice',
      values: ['rice', 'mango', 'sauce', 'sprinkle', 'done'],
      doc: 'mango sticky rice: start at this step, with the ones before already done',
    },
  },
  sections: [
    { id: 'arrive', name: 'Arrive by tuk-tuk' },
    { id: 'street', name: "In front of Agong's house", params: ['at'] },
    { id: 'downstairs', name: 'Downstairs', params: ['at'] },
    { id: 'upstairs', name: "Kaylee's room upstairs", params: ['at'] },
    { id: 'family', name: 'Family photo', params: ['who'] },
    // Mini games downstairs (games/): tap Putto, Aunt Joy or Aunt Jum.
    { id: 'tic-tac-toe', name: 'Tic-tac-toe with Putto' },
    { id: 'salon', name: "Aunt Joy's beauty salon", params: ['look'] },
    { id: 'sticky-rice', name: 'Mango sticky rice with Aunt Jum', params: ['step'] },
  ],
})
export default HUB_SECTIONS
export type HubSection = (typeof HUB_SECTIONS)['sections'][number]['id']
/** The sections that are places in the house (the mini games open over the house, downstairs). */
export type HouseSection = Exclude<HubSection, 'tic-tac-toe' | 'salon' | 'sticky-rice'>

// The Nan road trip (plan: planning/around-the-world/thailand/nan-trip.md), as deep-linkable sections:
// #/world/thailand/nan-trip/<section>?road=<which road>. Built so far (step 1, the greybox): the mountain road, the
// Pajero steered along any of the four roads (drive?road=city|valley|sky|three). The rental desk, the Nan map, the four
// stops, the 3 from above and home come with their own greyboxes, each adding its section here. Loaded at startup:
// keep three.js out of this file.
import { defineSections } from '../../../../kit/sections'
import { ROAD_IDS } from './drive/roads'

const NAN_SECTIONS = defineSections('thailand', 'nan-trip', {
  params: {
    road: { default: 'valley', values: ROAD_IDS, doc: 'which road the drive plays: city (Nan town to Wat Phumin, over the river), valley (the rice fields to the mushroom farm: chickens, a songthaew, a buffalo crossing), sky (up Doi Phu Kha: blind bends with round mirrors, into the cloud and out above it) or three (down the hairpins, counting the bends, then the 3 from the viewpoint)' },
  },
  sections: [{ id: 'drive', name: 'The mountain road: steer the silver Pajero', params: ['road'] }],
})
export default NAN_SECTIONS
export type NanSection = (typeof NAN_SECTIONS)['sections'][number]['id']

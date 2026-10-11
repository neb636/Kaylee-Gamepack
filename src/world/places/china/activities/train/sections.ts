import { defineSections } from '../../../../kit/sections'

/** Bullet Train deep links: #/world/china/train/<section> (kit/sections.ts). Each stop starts with the ride there. */
export default defineSections('china', 'train', {
  sections: [
    { id: 'story', name: 'All aboard (story)' },
    { id: 'harbin', name: 'Harbin: snow, mittens, a scarf for the tiger' },
    { id: 'hainan', name: 'Hainan: beach day' },
    { id: 'gobi', name: 'Gobi: hot day, cold night' },
    { id: 'himalayas', name: 'Himalayas: a coat with the yak' },
  ],
})

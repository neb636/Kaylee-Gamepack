import { defineSections } from '../../../../kit/sections'

/** Magic Brush deep links: #/world/china/brush/<section> (kit/sections.ts). One section per character (chars.ts). */
export default defineSections('china', 'brush', {
  sections: [
    { id: 'story', name: 'Ma Liang’s magic brush (story)' },
    { id: 'ren', name: '人 person' },
    { id: 'shan', name: '山 mountain' },
    { id: 'ri', name: '日 sun' },
    { id: 'mu', name: '木 tree (and a bird)' },
    { id: 'da', name: '大 big (Bao Bao copies)' },
    { id: 'yue', name: '月 moon (evening)' },
    { id: 'name', name: 'Her name in Chinese' },
    { id: 'stamp', name: 'Stamp the red chop' },
  ],
})

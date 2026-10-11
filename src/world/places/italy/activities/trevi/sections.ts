import { defineSections } from '../../../../kit/sections'

/** Trevi Fountain deep links: #/world/italy/trevi/<section> (kit/sections.ts). */
export default defineSections('italy', 'trevi', {
  sections: [
    { id: 'story', name: 'The fountain is dry (story)' },
    { id: 'spring', name: 'Find the spring' },
    { id: 'arches-1', name: 'Arches, round 1 (three gaps)' },
    { id: 'arches-2', name: 'Arches, round 2 (four gaps, two alike)' },
    { id: 'water-on', name: 'Water on: follow it to Rome' },
    { id: 'fountain', name: 'The fountain fills, toss coins' },
  ],
})

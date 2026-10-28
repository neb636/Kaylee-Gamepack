// Penguin Slide (greybox 3, plan: planning/around-the-world/poles.html): steer Pebble's papa on his belly down the ice,
// over bumps and a crack, off the edge into the sea, through the krill and home to Pebble.
// #/world/poles/slide/<section>?run=left&krill=12. A section link starts him at the beginning of that stretch.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const SLIDE_SECTIONS = defineSections('poles', 'slide', {
  params: {
    run: { default: 'middle', values: ['left', 'middle', 'right'], doc: 'where across the slope he starts the bumps: the left run has moguls, the right one a big kicker' },
    krill: { default: '0', doc: 'how many krill swarms he has gulped (his round tummy, and what Pebble gets; he always brings her a few)' },
  },
  sections: [
    { id: 'story', name: 'Pebble is hungry' },
    { id: 'top', name: 'The gentle slope' },
    { id: 'bumps', name: 'Bumps and cracks', params: ['run'], links: [{ label: 'Bumps and cracks', also: [{ label: 'the moguls run', params: { run: 'left' } }, { label: 'the kicker run', params: { run: 'right' } }] }] },
    { id: 'dive', name: 'Under the sea', params: ['krill'] },
    { id: 'home', name: 'Feeding Pebble', params: ['krill'], links: [{ label: 'Feeding Pebble', params: { krill: '12' } }] },
  ],
})
export default SLIDE_SECTIONS
export type SlideSection = (typeof SLIDE_SECTIONS)['sections'][number]['id']

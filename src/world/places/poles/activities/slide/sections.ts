// Penguin Slide: Papa looks for Pebble. Steer him on his belly down the ice hill, over bumps and a crack, off the edge
// into the sea, through the krill and out onto the ice edge, sliding up to everything that might be Pebble on the way.
// #/world/poles/slide/<section>?run=left&krill=12&looked=ask. A section link starts him at the beginning of that
// stretch. (The films before and after it are Place.tsx's: story/films.ts `slide-in`, `slide-out`.)
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const SLIDE_SECTIONS = defineSections('poles', 'slide', {
  params: {
    run: { default: 'middle', values: ['left', 'middle', 'right'], doc: 'where across the slope he starts the bumps: the left run has moguls, the right one a big kicker' },
    krill: { default: '0', doc: 'how many krill swarms he has gulped (his round tummy)' },
    looked: { default: '', doc: 'the maybe-Pebbles he has already looked at, a letter each: a the snowy Adélie, s the sleeping seal, k the skua chick, h the woolly hat (he wears it until he dives), b the buoy, f the ball of fish' },
  },
  sections: [
    { id: 'top', name: 'The gentle slope' },
    { id: 'bumps', name: 'Bumps and cracks', params: ['run', 'looked'], links: [{ label: 'Bumps and cracks', also: [{ label: 'the moguls run', params: { run: 'left' } }, { label: 'the kicker run, in the woolly hat', params: { run: 'right', looked: 'askh' } }] }] },
    { id: 'dive', name: 'Under the sea', params: ['krill', 'looked'] },
    { id: 'home', name: 'Out on the ice edge', params: ['krill', 'looked'], links: [{ label: 'Out on the ice edge', params: { krill: '12', looked: 'askhbf' } }] },
  ],
})
export default SLIDE_SECTIONS
export type SlideSection = (typeof SLIDE_SECTIONS)['sections'][number]['id']

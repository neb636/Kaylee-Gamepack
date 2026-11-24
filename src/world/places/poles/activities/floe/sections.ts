// Ice Floe Hop: fling Pola, with Pebble on her back, floe to floe to Mama
// Bear. (No opening section: the film before it, story/films.ts `floe-in`, tells why; the game starts on the big floes.)
// #/world/poles/floe/<section>?layout=2. A section link starts Pola on that stage's first floe.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const FLOE_SECTIONS = defineSections('poles', 'floe', {
  params: {
    layout: { default: '1', doc: 'which way the floes are laid out (any number; "again" after Mama picks the next one)' },
  },
  sections: [
    { id: 'steady', name: 'Big steady floes', params: ['layout'], links: [{ label: 'Big steady floes', also: [{ label: 'another layout', params: { layout: '2' } }] }] },
    { id: 'drift', name: 'Floes that drift', params: ['layout'] },
    { id: 'melt', name: 'Summer melt (push the floes)', params: ['layout'] },
    { id: 'mama', name: "Home on Mama's ice", params: ['layout'] },
  ],
})
export default FLOE_SECTIONS
export type FloeSection = (typeof FLOE_SECTIONS)['sections'][number]['id']

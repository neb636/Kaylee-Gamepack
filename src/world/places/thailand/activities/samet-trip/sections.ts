// The Koh Samet trip (plan: planning/around-the-world/thailand/samet-trip.html), as deep-linkable sections:
// #/world/thailand/samet-trip/<section>?... One section so far, greybox 1: the jet ski at Hat Sai Kaew
// (jetski?round=ride|waves|race). Kaylee steers with her finger on the water, Daddy sits behind her: the calm bay inside
// the buoy rope (life jacket first, the wake loop), the waves rolling in to jump, then the race against the jet ski man
// round the big orange buoy. The other stops (the island, the animal book, the sandcastle, the snorkel, hide and seek,
// the fire show) get their sections with their greyboxes. In the works: only these links reach it. Loaded at
// startup: keep three.js (and the island's coastline data) out of this file.
import { defineSections } from '../../../../kit/sections'

/** The jet ski's rounds (the same ids as island/layout.ts ROPE). */
export const JET_ROUNDS = ['ride', 'waves', 'race'] as const

const SAMET_SECTIONS = defineSections('thailand', 'samet-trip', {
  note: 'In the works (greybox 1 of the plan). Add ?feel=1 to any jet ski link to tune how it steers, jumps and races.',
  params: {
    round: { default: 'ride', values: JET_ROUNDS, doc: 'the jet ski round: ride (the calm bay inside the buoy rope: the life jacket first, then carve, spray, splash the swimmers, close a loop of wake for the jumping fish), waves (bigger waves roll in from the open sea: steer into them to jump, a spin on the biggest) or race (out round the big orange buoy and back to the flags against the jet ski man; the winner rings the bell)' },
  },
  sections: [
    {
      id: 'jetski',
      name: 'The jet ski at Hat Sai Kaew (greybox): Kaylee steers, Daddy behind her',
      params: ['round'],
      group: 'The jet ski at Sai Kaew (greybox)',
      links: [
        { label: 'Ride the calm bay: the life jacket, then carve, spray and close a loop of wake', params: { round: 'ride' }, also: [{ label: 'tune the feel', params: { round: 'ride' }, flags: { feel: '1' } }] },
        { label: 'Big waves roll in: steer into them to jump', params: { round: 'waves' } },
        { label: 'Race the jet ski man round the big orange buoy', params: { round: 'race' } },
      ],
    },
  ],
})
export default SAMET_SECTIONS
export type SametSection = (typeof SAMET_SECTIONS)['sections'][number]['id']

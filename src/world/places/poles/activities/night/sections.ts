// The Longest Night, the Poles' new ending (poles-ending.md in git history): one chapter in three acts and a
// goodbye, with films between them (their own links: #/world/poles/story/night-in, night-lost, night-colony,
// night-sunrise, night-goodbye, the-end). #/world/poles/night/<section>?leg=warm&part=churn
// A section link opens straight into that act (no film before it), as if she had played to there, and the chapter goes
// on from it as it does for her. Loaded at startup by the section index: keep three.js out of this file.
import { defineSections } from '../../../../kit/sections'

const NIGHT_SECTIONS = defineSections('poles', 'night', {
  params: {
    leg: { default: 'north', values: ['north', 'warm', 'south'], doc: 'Hold to Fly: where the flight starts (the Arctic, the warm middle, or the southern sea and the storm)' },
    part: { default: 'near', values: ['near', 'churn', 'middle'], doc: 'Through the Huddle: Papa near the edge, the huddle churning (and the gust), or the packed middle (the big song)' },
  },
  sections: [
    {
      id: 'fly',
      name: 'Hold to Fly: down the world in the balloon',
      group: 'Act 1: Hold to Fly',
      params: ['leg'],
      links: [{ label: 'Hold to Fly: the Arctic', also: [{ label: 'the warm middle', params: { leg: 'warm' } }, { label: 'the southern night and the storm', params: { leg: 'south' } }, { label: 'feel lab', flags: { feel: '1' } }] }],
    },
    { id: 'whiteout', name: 'The whiteout: the hat and Terry', group: 'Act 2: Sing in the Dark', links: [{ label: 'The whiteout: the hat and Terry', also: [{ label: 'feel lab', flags: { feel: '1' } }] }] },
    { id: 'edge', name: 'The ice edge: the seal, the Adelies, the whale', group: 'Act 2: Sing in the Dark' },
    { id: 'together', name: 'All together: the song to the colony', group: 'Act 2: Sing in the Dark' },
    {
      id: 'huddle',
      name: 'Through the Huddle: lead Pebble to Papa',
      group: 'Act 3: Through the Huddle',
      params: ['part'],
      links: [{ label: 'Through the Huddle: Papa near the edge', also: [{ label: 'the churn and the gust', params: { part: 'churn' } }, { label: 'the packed middle: the big song', params: { part: 'middle' } }, { label: 'feel lab', flags: { feel: '1' } }] }],
    },
    { id: 'goodbye', name: 'Goodbye: fly Pola home up the globe', group: 'Goodbye' },
  ],
})
export default NIGHT_SECTIONS
export type NightSection = (typeof NIGHT_SECTIONS)['sections'][number]['id']
/** Act 2's three stretches. */
export type ChorusSection = 'whiteout' | 'edge' | 'together'

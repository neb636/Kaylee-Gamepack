// The Longest Night, the Poles' new ending (planning/around-the-world/poles-ending.md): one chapter in three acts.
// Built so far: Act 2, Sing in the Dark (chorus.ts), in three stretches. #/world/poles/night/<section>
// A section link sets the scene up as if she had played to there (the friends found before it already singing).
// Loaded at startup by the section index: keep three.js out of this file.
import { defineSections } from '../../../../kit/sections'

const NIGHT_SECTIONS = defineSections('poles', 'night', {
  sections: [
    { id: 'whiteout', name: 'The whiteout: the hat and Terry', group: 'Act 2: Sing in the Dark', links: [{ label: 'The whiteout: the hat and Terry', also: [{ label: 'feel lab', flags: { feel: '1' } }] }] },
    { id: 'edge', name: 'The ice edge: the seal, the Adelies, the whale', group: 'Act 2: Sing in the Dark' },
    { id: 'together', name: 'All together: the song to the colony', group: 'Act 2: Sing in the Dark' },
  ],
})
export default NIGHT_SECTIONS
export type NightSection = (typeof NIGHT_SECTIONS)['sections'][number]['id']

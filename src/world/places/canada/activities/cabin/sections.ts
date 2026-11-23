// The Team Cabin (canada-round-2.md in git history, part 4): the skate hut beside the canal, where she
// dresses the team. A toy on the map with no stamp and no end. #/world/canada/cabin/<section>?team=...
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

const CABIN_SECTIONS = defineSections('canada', 'cabin', {
  params: {
    team: { default: '', doc: 'who sits on the bench: a comma list of chapter ids (snowman, bike, campfire, canoe, bath, whales), `all` or `none` (Maple alone); without it, one friend per stamp she has' },
  },
  sections: [{ id: 'dress', name: 'Dress the team', params: ['team'], links: [{ label: 'Maple alone', params: { team: 'none' } }, { label: 'The whole team on the bench', params: { team: 'all' } }] }],
})
export default CABIN_SECTIONS

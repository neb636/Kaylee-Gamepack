// Canada's home base, the 3D map of Canada (map/), as deep-linkable spots: #/world/canada/hub/map?team=bike,canoe.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections, HUB } from '../../../../kit/sections'

const HUB_SECTIONS = defineSections('canada', HUB, {
  params: {
    team: {
      default: '',
      doc: "who stands at Ottawa's rink in the team's scarf: a comma list of chapter ids (snowman, bike, campfire, canoe, salmon, whales), `all` or `none`; without it, one friend per stamp she has. With all six the rink glows for the big game",
    },
    new: {
      default: '',
      values: ['', 'snowman', 'bike', 'campfire', 'canoe', 'salmon', 'whales'],
      doc: "that friend's arrival plays: the camera starts on the rink, they pop in with sparkles and Sparkle counts (they join the team too)",
    },
  },
  sections: [
    {
      id: 'map',
      name: 'The map of Canada: tap a friend to go and get them',
      params: ['team', 'new'],
      links: [
        { label: 'The map, where she lands', bare: true },
        { label: 'Nobody on the team yet', params: { team: 'none' } },
        { label: 'Three friends at the rink', params: { team: 'snowman,bike,canoe' } },
        { label: 'The whole team: the rink glows for the big game', params: { team: 'all' } },
        { label: 'Back with a new friend: Lulu pops in at the rink', params: { team: 'snowman,bike', new: 'canoe' } },
        { label: 'The sixth friend comes home', params: { team: 'snowman,bike,campfire,canoe,salmon', new: 'whales' } },
      ],
    },
    { id: 'book', name: "Maple's animal book", links: [{ label: "Maple's animal book (every animal she's met, grey shapes for the rest)" }] },
  ],
})
export default HUB_SECTIONS

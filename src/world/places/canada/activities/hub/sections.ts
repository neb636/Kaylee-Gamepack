// Canada's home base, the 3D map of Canada (map/), as deep-linkable spots: #/world/canada/hub/map?team=bike,canoe.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections, HUB } from '../../../../kit/sections'

const HUB_SECTIONS = defineSections('canada', HUB, {
  params: {
    team: {
      default: '',
      doc: "who stands at Ottawa's rink in the team's scarf: a comma list of chapter ids (snowman, bike, campfire, canoe, bath, whales), `all` or `none`; without it, one friend per stamp she has. With all six the rink glows for the big game",
    },
    new: {
      default: '',
      values: ['', 'snowman', 'bike', 'campfire', 'canoe', 'bath', 'whales'],
      doc: "that friend's arrival plays: the camera starts on the rink, they pop in with sparkles, Sparkle counts, they show their move (map/moves.ts) and Gus has his say about how many they are now (they join the team too, and the address bar keeps them)",
    },
  },
  sections: [
    {
      id: 'map',
      name: "The map of Canada: tap a friend to go and get them; tap a friend at the rink for their move, the skate hut for the Team Cabin",
      params: ['team', 'new'],
      links: [
        { label: 'The map, where she lands', bare: true },
        { label: 'Nobody on the team yet', params: { team: 'none' } },
        { label: 'Three friends at the rink', params: { team: 'snowman,bike,canoe' } },
        { label: 'The whole team: the rink glows for the big game', params: { team: 'all' } },
        { label: 'Back with a new friend: Tuque bounces a puck off his tummy; Gus: "One friend? Easy!"', params: { team: 'none', new: 'snowman' } },
        { label: 'Back with Monty: he stands so still two geese perch on his antlers (Gus: two)', params: { team: 'snowman', new: 'bike' } },
        { label: 'Back with Roxy: she whisks a puck from a goose onto her head (Gus: three, wide-eyed)', params: { team: 'snowman,bike', new: 'campfire' } },
        { label: 'Back with Lulu: her song floats up over the rink (Gus: four, dizzy)', params: { team: 'snowman,bike,campfire', new: 'canoe' } },
        { label: 'Back with Misty: her slap shot sends a pinecone over the boards (Gus: five)', params: { team: 'snowman,bike,campfire,canoe', new: 'bath' } },
        { label: 'The sixth friend comes home: Ollie juggles her rock and passes to Maple (Gus: gulp)', params: { team: 'snowman,bike,campfire,canoe,bath', new: 'whales' } },
      ],
    },
    { id: 'book', name: "Maple's animal book", links: [{ label: "Maple's animal book (every animal she's met, grey shapes for the rest)" }] },
  ],
})
export default HUB_SECTIONS

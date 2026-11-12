// The Koh Samet trip (notes: planning/around-the-world/thailand/samet-story.md; the first plan: samet-trip.md), as
// deep-linkable sections: #/world/thailand/samet-trip/<section>?...
//
// One story runs through it, "The Lost Fireflies": last night's wind blew the fire show's four fireflies all over the
// island, and each stop finds one. Every stop has two film rounds beside its play rounds: `story` (its way in, then its
// first round) and `found` (its firefly found, then back to the island with it).
//   pack    packing for the island in Kaylee's room (pack?packed=...): the trip kit's packing, Mom's hint for the sun;
//           then straight onto the speedboat (the first trip of a session from the Thailand map's 🏝️ pin packs; later
//           ones go straight to the island, or the speedboat for a new trip).
//   speedboat  the speedboat from Ban Phe pier to Na Dan pier, a cutscene of about 17 s (engine3d/cinema.ts).
//   island  the island between the stops (island?at=...&flags=...): a new trip opens with the way-in film at Na Dan
//           pier (story=intro), then the pictures of the four beaches come up (board=1): tap one and the green taxi
//           takes her straight there. She can still lead your unicorn round each beach, swim, and poke everything.
//           `flags` are the fireflies she has found (they circle her horn, and the day moves on with them); `found`
//           plays one joining her; with all four, story=all sends her to the driftwood tree for the sunset.
//   jetski  the jet ski at Hat Sai Kaew (jetski?round=story|ride|waves|race|found): Zoom, the pink firefly.
//   sandcastle  the sandcastle at Ao Hin Khok (sandcastle?round=story|dig|towers|tide|found): Sandy, the gold one.
//   snorkel snorkeling at Ko Kudi (snorkel?round=story|float|follow|cuttle|found): Bubbles, the blue one.
//   deck    lunch on the resort deck above Ao Prao (a place, not a stop): bread rolls, a coconut, mango sticky rice.
//   hideseek  hide and seek by the driftwood tree at Ao Prao (hideseek?round=story|1|2|hide|found): Peekaboo, the
//           green one.
//   sunset  the finale's first beat: the sunset at the driftwood tree on Ao Prao (pull the sun down into the sea, Mom's
//           photo of the three of them), then night falls.
//   fireshow  the fire show on Sai Kaew at night (fireshow?round=story|twirl|shapes|finish|thanks): the fireflies
//           light the dancers' poi and hers.
// With all four fireflies the driftwood tree opens the finale; at the end of the fire show they go home: Mom's photo
// goes on Agong's wall, the stamp lands on the 🏝️ pin. The trip is saved on the iPad as she plays (trip.ts). The
// Thailand map's 🏝️ pin opens it. Loaded at startup: keep three.js (and the island's coastline data) out of this file.
import { defineSections } from '../../../../kit/sections'
import { ITEMS } from '../../trip/packing'
import { SAMET_PACKED } from './trip'

/** The film rounds every stop has beside its play rounds: its way in, and its firefly found. */
export const FILM_ROUNDS = ['story', 'found'] as const
/** The jet ski's rounds (the play rounds are island/layout.ts ROPE's ids). */
export const JET_ROUNDS = ['story', 'ride', 'waves', 'race', 'found'] as const
/** The sandcastle's rounds (its play rounds: sandcastle/sandcastle.ts SAND_ROUND_IDS). */
export const SAND_ROUNDS = ['story', 'dig', 'towers', 'tide', 'found'] as const
/** The snorkel's rounds (its play rounds: snorkel/snorkel.ts SNORKEL_ROUND_IDS). */
export const SNORKEL_ROUNDS = ['story', 'float', 'follow', 'cuttle', 'found'] as const
/** Hide and seek's rounds (its play rounds: hideseek/hideseek.ts HIDE_ROUND_IDS). */
export const HIDE_ROUNDS = ['story', '1', '2', 'hide', 'found'] as const
/** The fire show's rounds (its play rounds: finale/fireshow.ts FIRE_ROUND_IDS): its way in, and the thank you at the end. */
export const FIRE_ROUNDS = ['story', 'twirl', 'shapes', 'finish', 'thanks'] as const
/** Where she can land on the island (island/layout.ts SPOT_IDS). */
export const SPOTS = ['nadan', 'saikaew', 'hinkhok', 'phai', 'wongduan', 'prao', 'deck', 'aonoina'] as const
/** The stops, each with its pink flag (island/layout.ts STOPS). */
export const FLAGS = ['jetski', 'sandcastle', 'snorkel', 'hideseek'] as const
export const TIMES = ['morning', 'noon', 'afternoon', 'golden', 'night'] as const

const ALL_ROUNDS = [...new Set<string>([...JET_ROUNDS, ...SAND_ROUNDS, ...SNORKEL_ROUNDS, ...HIDE_ROUNDS, ...FIRE_ROUNDS])]

const SAMET_SECTIONS = defineSections('thailand', 'samet-trip', {
  note: "The Thailand map's 🏝️ pin opens it. Add ?feel=1 to tune how your unicorn walks and swims, the camera, the jet ski, the sand, the snorkel, lunch and hide and seek; ?fps=1 or ?debug=1 shows the frame rate.",
  params: {
    packed: { default: SAMET_PACKED, doc: `what's in her suitcase, a comma list of ${ITEMS.map((i) => i.id).join(', ')} (Mom always tucks in the sunscreen; her sun hat and sunglasses go on). A link without it opens what the iPad saved` },
    at: { default: 'nadan', values: SPOTS, doc: 'where she stands on the island: nadan (the pier, where the speedboat lands), saikaew (the jet ski beach), hinkhok (the sandcastle beach), phai, wongduan (the snorkel boat), prao (the sunset beach and the driftwood tree), deck (the resort deck above Ao Prao), aonoina (the quiet north beach)' },
    flags: { default: '', doc: `the fireflies she has found, a comma list of ${FLAGS.join(', ')} (or all): Zoom, Sandy, Bubbles and Peekaboo. Each circles her horn, its pink flag stands on its beach, and the day moves on with them (morning, noon, afternoon, golden). With jetski, a jet ski waits on every beach for her to ride` },
    time: { default: '', values: ['', ...TIMES], doc: 'the light, overriding the flags: morning, noon, afternoon, golden or night (the beach bars and lanterns glow, the stars come out)' },
    story: { default: '', values: ['', 'intro', 'all'], doc: 'a film on the island: intro (the way in at Na Dan pier: the gecko fire dancers, their empty lantern, last night\'s wind, "Will you help us find them?") or all (all four found: off to the sunset)' },
    found: { default: '', values: ['', ...FLAGS], doc: 'the firefly she has just found (one of the flags): it flies in to join the others, Sparkle counts, and the pictures come up' },
    board: { default: '', values: ['', '1'], doc: '1: the pictures of the beaches are up from the start (tap one and the green taxi takes her there)' },
    round: { default: 'story', values: ALL_ROUNDS, doc: 'the round of a stop (or of the fire show). Every stop: story (its way-in film, then its first round) and found (its firefly found, then back to the island). The jet ski: ride (the calm bay inside the buoy rope: the life jacket first, then carve, spray, splash the swimmers, close a loop of wake for the jumping fish), waves (bigger waves roll in from the open sea: steer into them to jump, a spin on the biggest) or race (out round the big orange buoy and back to the flags against the jet ski man; the winner rings the bell). The sandcastle: dig (dig holes and moats with her finger, the sand piling up beside them; a ghost crab pops out of a deep hole), towers (the moulds arrive: drag one, tap it and it flips to leave a tower; shells to push into the walls) or tide (the tide creeps in: dig a channel and the sea fills the moat, a hermit crab moves in, the big wave). The snorkel: float (splash in off the boat\'s ladder and lead your unicorn over the coral, the damselfish crowd parting round her; bump a coral head and a little fish pops out, the urchins boing her off), follow (the parrotfish swims ahead and waits: through the gap between the rocks, over the sand with the giant clam, into the garden) or cuttle (the cuttlefish in the garden changes color as she comes close, rainbow, stripes, pink). Hide and seek: 1 (easy hides: your unicorn covers her eyes by the driftwood tree and counts, then finds Dad behind the tree, behind the tipped-over pink umbrella with his feet showing, behind the stack of red chairs; tap his hiding place, or walk right up), 2 (trickier: in the roots, under the towel that breathes, in the sea with only his cap floating, up the pandanus tree; stuck a while and he gives himself away) or hide (her turn: Dad counts at the tree, she leads your unicorn to a glowing hiding place, he searches the wrong places and gives up, your unicorn wins). The fire show: story (the dancers in the dark, the fireflies light their poi and hers), twirl (her finger draws in the air and her glowing poi follow it, ribbons of pink and gold light; the fire dancers copy her speed and size, a big circle and they swing a ring of fire), shapes (the dancers draw a circle, a star, a heart in fire over the sea; she draws over the dots and it lifts into the sky like a lantern of light), finish (each firefly adds something, one per loop she draws: the jet ski man rides by with lights, her sandcastle glows with candles, the parrotfish and cuttlefish light up in the waves, Dad dances; then one huge circle lights a ring of fire round the beach, and fireworks) or thanks (the dancers\' bow, the fireflies\' heart, then home)' },
  },
  sections: [
    { id: 'pack', name: 'Pack for the island: the swimsuit, the sun hat, the floaties, the bucket', params: ['packed'], group: 'Getting there' },
    {
      id: 'speedboat',
      name: 'The speedboat from Ban Phe to Na Dan pier: the ride as a cutscene',
      params: ['packed', 'time'],
      group: 'Getting there',
      links: [{ label: 'The speedboat from Ban Phe: leaving the pier, the ferry going by, flying fish, then Na Dan pier', also: [{ label: 'tune the timing', flags: { feel: '1' } }] }],
    },
    {
      id: 'island',
      name: 'The island between the stops: the story, the pictures of the beaches, the fireflies she has found',
      params: ['at', 'flags', 'time', 'story', 'found', 'board', 'packed'],
      group: 'The island and the story',
      links: [
        { label: 'The way in at Na Dan pier: the gecko fire dancers have lost their fireflies (a film)', params: { at: 'nadan', story: 'intro' } },
        { label: 'The pictures of the four beaches: tap one and the green taxi takes her there', params: { at: 'nadan', board: '1' } },
        { label: 'Back at Sai Kaew with Zoom, the first firefly (she flies in, the pictures come up)', params: { at: 'saikaew', flags: 'jetski', found: 'jetski' } },
        { label: 'Ao Hin Khok: Sandy glowing in the sand, the beach ball', params: { at: 'hinkhok' }, also: [{ label: 'tune the feel', params: { at: 'hinkhok' }, flags: { feel: '1' } }] },
        { label: 'Ao Wong Duan: Bubbles out by the snorkel boat', params: { at: 'wongduan', flags: 'jetski,sandcastle' } },
        { label: 'Ao Prao in the afternoon, three fireflies', params: { at: 'prao', flags: 'jetski,sandcastle,snorkel' } },
        { label: 'All four found: off to the driftwood tree for the sunset (a film)', params: { at: 'prao', flags: 'all', story: 'all' } },
        { label: 'Sai Kaew at night (the lanterns and the stars)', params: { at: 'saikaew', flags: 'all', time: 'night' } },
      ],
    },
    {
      id: 'jetski',
      name: 'The jet ski at Hat Sai Kaew: Zoom, the pink firefly who loves to go fast',
      params: ['round', 'flags'],
      group: 'The jet ski at Sai Kaew (Zoom)',
      links: [
        { label: 'The way in: the jet ski man and the pink light zooming round his buoys (a film)', params: { round: 'story' } },
        { label: 'Ride the calm bay: the life jacket, then carve, spray and close a loop of wake', params: { round: 'ride' }, also: [{ label: 'tune the feel', params: { round: 'ride' }, flags: { feel: '1' } }] },
        { label: 'Big waves roll in: steer into them to jump', params: { round: 'waves' } },
        { label: 'Race the jet ski man round the big orange buoy', params: { round: 'race' } },
        { label: 'Zoom found: she lands on your unicorn\'s horn (a film)', params: { round: 'found' } },
      ],
    },
    {
      id: 'sandcastle',
      name: 'The sandcastle at Ao Hin Khok: Sandy, the shy gold firefly',
      params: ['round', 'flags', 'time'],
      group: 'The sandcastle at Ao Hin Khok (Sandy)',
      links: [
        { label: 'The way in: a glow in the sand, a castle to tempt her out (a film)', params: { round: 'story' } },
        { label: 'Dig: drag through the sand, pile walls, a crab in a deep hole; bury Dad', params: { round: 'dig' }, also: [{ label: 'tune the feel', params: { round: 'dig' }, flags: { feel: '1' } }] },
        { label: 'Bucket towers: drag a mould, tap it to flip; shells into the walls', params: { round: 'towers' } },
        { label: 'The tide comes in: dig a channel to fill the moat', params: { round: 'tide' } },
        { label: 'Sandy found: she moves into the castle (a film)', params: { round: 'found' } },
      ],
    },
    {
      id: 'snorkel',
      name: 'Snorkeling at Ko Kudi: Bubbles, the blue firefly in a bubble on the reef',
      params: ['round', 'flags'],
      group: 'Snorkeling at Ko Kudi (Bubbles)',
      links: [
        { label: 'The way in: the captain saw a blue light fall in the sea (a film)', params: { round: 'story' } },
        { label: 'Float: splash in, lead her over the coral, the damselfish part round her', params: { round: 'float' }, also: [{ label: 'tune the feel', params: { round: 'float' }, flags: { feel: '1' } }] },
        { label: 'Follow the parrotfish through the gap to the garden', params: { round: 'follow' } },
        { label: 'The cuttlefish changes color, hugging the bubble', params: { round: 'cuttle' } },
        { label: 'Bubbles found: the bubble floats up and pops (a film)', params: { round: 'found' } },
      ],
    },
    {
      id: 'deck',
      name: 'Lunch on the deck at Ao Prao: rolls, a coconut, mango sticky rice',
      params: ['flags', 'time'],
      group: 'Lunch and hide and seek at Ao Prao (Peekaboo)',
      links: [{ label: 'Lunch on the deck: Dad passes the rolls, sip the coconut, the mango sticky rice', params: {}, also: [{ label: 'tune the feel', params: {}, flags: { feel: '1' } }] }],
    },
    {
      id: 'hideseek',
      name: 'Hide and seek at Ao Prao: Peekaboo, the green firefly who loves to hide',
      params: ['round', 'flags', 'time'],
      group: 'Lunch and hide and seek at Ao Prao (Peekaboo)',
      links: [
        { label: 'The way in: a green light peeks round the driftwood tree (a film)', params: { round: 'story' } },
        { label: 'Easy hides: count by the driftwood tree, find Dad', params: { round: '1' }, also: [{ label: 'tune the feel', params: { round: '1' }, flags: { feel: '1' } }] },
        { label: 'Trickier hides: the roots, the towel, the sea, the pandanus', params: { round: '2' } },
        { label: 'Her turn to hide: Dad counts and searches the wrong places', params: { round: 'hide' } },
        { label: 'Peekaboo found: she lands on Dad\'s nose (a film)', params: { round: 'found' } },
      ],
    },
    {
      id: 'sunset',
      name: 'Finale: the sunset at the driftwood tree: pull the sun down into the sea, Mom’s photo',
      params: ['flags'],
      group: 'The finale: sunset and the fire show',
      links: [{ label: 'The sunset at the driftwood tree: pull the sun down into the sea, Mom’s photo of the three of them, night falls', params: { flags: 'all' }, also: [{ label: 'tune the feel', params: { flags: 'all' }, flags: { feel: '1' } }] }],
    },
    {
      id: 'fireshow',
      name: 'Finale: the fire show on Sai Kaew: the fireflies light the show',
      params: ['round', 'flags'],
      group: 'The finale: sunset and the fire show',
      links: [
        { label: 'The way in: the dancers in the dark, then the fireflies light their poi and hers (a film)', params: { round: 'story', flags: 'all' } },
        { label: 'Twirl the glowing poi: ribbons of light, the fire dancers copy her', params: { round: 'twirl', flags: 'all' }, also: [{ label: 'tune the feel', params: { round: 'twirl', flags: 'all' }, flags: { feel: '1' } }] },
        { label: 'Shapes in the sky: a circle, a star, a heart', params: { round: 'shapes', flags: 'all' } },
        { label: 'The big finish: what each firefly adds, the ring of fire, fireworks', params: { round: 'finish', flags: 'all' }, also: [{ label: 'with only Zoom found', params: { round: 'finish', flags: 'jetski' } }] },
        { label: 'The thank you: the dancers bow, the fireflies make a heart (a film)', params: { round: 'thanks', flags: 'all' } },
      ],
    },
  ],
})
export default SAMET_SECTIONS
export type SametSection = (typeof SAMET_SECTIONS)['sections'][number]['id']

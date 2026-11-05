// The Koh Samet trip (plan: planning/around-the-world/thailand/samet-trip.html), as deep-linkable sections:
// #/world/thailand/samet-trip/<section>?... Three so far:
//   island  greybox 2, the island to roam (island?at=nadan|saikaew|hinkhok|phai|wongduan|prao|deck|aonoina): lead
//           Kaylee with a finger round the north half of Koh Samet, swim in the floatie, ride the green taxi round the
//           road, poke everything; `flags` puts up the pink flags (and moves the day on), `time` sets the light.
//   book    greybox 3, the island with Kaylee's animal book open (book?book=monitor,hornbill,...): the animals she has
//           snapped with Mommy's phone (`book`, also on `island`; `phone=1` opens the island with the phone out).
//   jetski  greybox 1, the jet ski at Hat Sai Kaew (jetski?round=ride|waves|race): Kaylee steers with her finger on
//           the water, Daddy sits behind her.
//   sandcastle  greybox 4, the sandcastle at Ao Hin Khok (sandcastle?round=dig|towers|tide): dig the sand with her
//           finger, flip bucket towers, dig a channel for the tide to fill the moat, bury Daddy.
//   snorkel greybox 5, snorkeling at Ko Kudi (snorkel?round=float|follow|cuttle): her finger leads Kaylee over the reef,
//           half under the water; the damselfish crowd, the parrotfish to follow, the cuttlefish that changes color.
//   deck    greybox 6, lunch on the resort deck above Ao Prao (a place, not a stop): bread rolls, a coconut to sip,
//           mango sticky rice.
//   hideseek  greybox 6, hide and seek by the driftwood tree at Ao Prao (hideseek?round=1|2|hide): she counts, then
//           leads Kaylee round the beach to find Daddy; then her turn to hide while he searches the wrong places.
// The other stops, the fire show and the trip frame get their sections with their greyboxes. In the
// works: only these links reach it. Loaded at startup: keep three.js (and the island's coastline data) out of this file.
import { defineSections } from '../../../../kit/sections'
import { ANIMAL_IDS } from './book/animals'

/** The jet ski's rounds (the same ids as island/layout.ts ROPE). */
export const JET_ROUNDS = ['ride', 'waves', 'race'] as const
/** The sandcastle's rounds (sandcastle/sandcastle.ts SAND_ROUND_IDS). */
export const SAND_ROUNDS = ['dig', 'towers', 'tide'] as const
/** The snorkel's rounds (snorkel/snorkel.ts SNORKEL_ROUND_IDS). */
export const SNORKEL_ROUNDS = ['float', 'follow', 'cuttle'] as const
/** Hide and seek's rounds (hideseek/hideseek.ts HIDE_ROUND_IDS). */
export const HIDE_ROUNDS = ['1', '2', 'hide'] as const
/** Where she can land on the island (island/layout.ts SPOT_IDS). */
export const SPOTS = ['nadan', 'saikaew', 'hinkhok', 'phai', 'wongduan', 'prao', 'deck', 'aonoina'] as const
/** The stops, each with its pink flag (island/layout.ts STOPS). */
export const FLAGS = ['jetski', 'sandcastle', 'snorkel', 'hideseek'] as const
export const TIMES = ['morning', 'noon', 'afternoon', 'golden', 'night'] as const

const SAMET_SECTIONS = defineSections('thailand', 'samet-trip', {
  note: "In the works (greyboxes 1 to 6 of the plan). Add ?feel=1 to tune how Kaylee walks and swims, the camera, Mommy's phone, the taxi, the jet ski, the sand, the snorkel, lunch and hide and seek; ?fps=1 or ?debug=1 shows the frame rate.",
  params: {
    at: { default: 'nadan', values: SPOTS, doc: 'where she stands on the island: nadan (the pier, where the speedboat lands), saikaew (the jet ski beach), hinkhok (the sandcastle beach), phai, wongduan (the snorkel boat), prao (the sunset beach and the driftwood tree), deck (the resort deck above Ao Prao), aonoina (the quiet north beach)' },
    flags: { default: '', doc: `the pink flags she has earned, a comma list of ${FLAGS.join(', ')} (or all): each stands on its beach, and the day moves on with them (morning, noon, afternoon, golden). With jetski, a jet ski waits on every beach for her to ride` },
    time: { default: '', values: ['', ...TIMES], doc: 'the light, overriding the flags: morning, noon, afternoon, golden or night (the beach bars and lanterns glow, the stars come out)' },
    book: { default: '', doc: `the animals already in her book (snapped with Mommy's phone), a comma list of ${ANIMAL_IDS.join(', ')} (or all)` },
    phone: { default: '', values: ['', '1'], doc: "1: Mommy's phone is out from the start (every tap is a photo)" },
    round: { default: 'ride', values: [...JET_ROUNDS, ...SAND_ROUNDS, ...SNORKEL_ROUNDS, ...HIDE_ROUNDS], doc: 'the round of a stop. Hide and seek: 1 (easy hides: Kaylee covers her eyes by the driftwood tree and counts, then finds Daddy behind the tree, behind the tipped-over pink umbrella with his feet showing, behind the stack of red chairs; tap his hiding place, or walk right up), 2 (trickier: in the roots, under the towel that breathes, in the sea with only his cap floating, up the pandanus tree; stuck a while and he gives himself away) or hide (her turn: Daddy counts at the tree, she leads Kaylee to a glowing hiding place, he searches the wrong places and gives up, Kaylee wins). The snorkel: float (splash in off the boat\'s ladder and lead Kaylee over the coral, the damselfish crowd parting round her; bump a coral head and a little fish pops out, the urchins boing her off), follow (the parrotfish swims ahead and waits: through the gap between the rocks, over the sand with the giant clam, into the garden) or cuttle (the cuttlefish in the garden changes color as she comes close, rainbow, stripes, pink; Mommy\'s camera snaps the fish for her book). The sandcastle: dig (dig holes and moats with her finger, the sand piling up beside them; a ghost crab pops out of a deep hole), towers (the moulds arrive: drag one, tap it and it flips to leave a tower; shells to push into the walls) or tide (the tide creeps in: dig a channel and the sea fills the moat, a hermit crab moves in, the big wave). The jet ski: ride (the calm bay inside the buoy rope: the life jacket first, then carve, spray, splash the swimmers, close a loop of wake for the jumping fish), waves (bigger waves roll in from the open sea: steer into them to jump, a spin on the biggest) or race (out round the big orange buoy and back to the flags against the jet ski man; the winner rings the bell)' },
  },
  sections: [
    {
      id: 'island',
      name: 'The island to roam (greybox): lead Kaylee round Koh Samet',
      params: ['at', 'flags', 'time', 'book', 'phone'],
      group: 'The island (greybox)',
      links: [
        { label: 'Land at Na Dan pier in the morning: walk, swim, the green taxi', params: { at: 'nadan' }, also: [{ label: 'tune the feel', params: { at: 'nadan' }, flags: { feel: '1' } }] },
        { label: 'Sai Kaew at noon, the jet ski done: a jet ski on every beach', params: { at: 'saikaew', flags: 'jetski' } },
        { label: 'Ao Prao in the afternoon, three flags', params: { at: 'prao', flags: 'jetski,sandcastle,snorkel' } },
        { label: 'Ao Hin Khok (the sandcastle spot, the beach ball)', params: { at: 'hinkhok' } },
        { label: 'Ao Wong Duan (the snorkel boat)', params: { at: 'wongduan' } },
        { label: 'Sai Kaew at night (the lanterns and the stars)', params: { at: 'saikaew', flags: 'all', time: 'night' } },
        { label: "Mommy's phone out at Ao Wong Duan: the hornbill in the tamarind, the fish, the cuttlefish", params: { at: 'wongduan', phone: '1' }, also: [{ label: 'tune the phone', params: { at: 'wongduan', phone: '1' }, flags: { feel: '1' } }] },
        { label: "Mommy's phone at Ao Prao: the monitor lizards, the flying fox asleep in the samet tree", params: { at: 'prao', phone: '1' }, also: [{ label: 'at dusk, the flying fox flying', params: { at: 'prao', phone: '1', time: 'golden' } }] },
        { label: 'Hin Khok and the mermaid: the heron, the urchins, the coral, a squirrel; the beach clean', params: { at: 'hinkhok', phone: '1' } },
      ],
    },
    {
      id: 'book',
      name: "Kaylee's animal book (greybox): the animals she snapped with Mommy's phone",
      params: ['at', 'flags', 'book'],
      group: "Mommy's phone and the animal book (greybox)",
      links: [
        { label: 'The empty book (silhouettes to find)', params: { at: 'saikaew' } },
        { label: 'Nearly full, three stickers', params: { at: 'saikaew', flags: 'jetski,sandcastle,snorkel', book: 'monitor,squirrel,macaque,hornbill,heron,tern,crab,parrotfish,damselfish,cuttlefish,urchin,coral' } },
        { label: 'All fourteen: the gold star', params: { at: 'saikaew', flags: 'all', book: 'all' } },
      ],
    },
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
    {
      id: 'sandcastle',
      name: 'The sandcastle at Ao Hin Khok (greybox): dig, towers, the tide, bury Daddy',
      params: ['round', 'flags', 'time'],
      group: 'The sandcastle at Ao Hin Khok (greybox)',
      links: [
        { label: 'Dig: drag through the sand, pile walls, a crab in a deep hole; bury Daddy', params: { round: 'dig' }, also: [{ label: 'tune the feel', params: { round: 'dig' }, flags: { feel: '1' } }] },
        { label: 'Bucket towers: drag a mould, tap it to flip; shells into the walls', params: { round: 'towers' } },
        { label: 'The tide comes in: dig a channel to fill the moat', params: { round: 'tide' } },
      ],
    },
    {
      id: 'snorkel',
      name: 'Snorkeling at Ko Kudi (greybox): lead Kaylee over the reef, half under the water',
      params: ['round', 'flags', 'book'],
      group: 'Snorkeling at Ko Kudi (greybox)',
      links: [
        { label: 'Float: splash in, lead her over the coral, the damselfish part round her', params: { round: 'float' }, also: [{ label: 'tune the feel', params: { round: 'float' }, flags: { feel: '1' } }] },
        { label: 'Follow the parrotfish through the gap to the garden', params: { round: 'follow' } },
        { label: 'The cuttlefish changes color; snap the fish', params: { round: 'cuttle' } },
      ],
    },
    {
      id: 'deck',
      name: 'Lunch on the deck at Ao Prao (greybox): rolls, a coconut, mango sticky rice',
      params: ['flags', 'time', 'book'],
      group: 'Lunch and hide and seek at Ao Prao (greybox)',
      links: [{ label: 'Lunch on the deck: Daddy passes the rolls, sip the coconut, the mango sticky rice', params: {}, also: [{ label: 'tune the feel', params: {}, flags: { feel: '1' } }] }],
    },
    {
      id: 'hideseek',
      name: 'Hide and seek at Ao Prao (greybox): find Daddy, then hide',
      params: ['round', 'flags', 'time', 'book'],
      group: 'Lunch and hide and seek at Ao Prao (greybox)',
      links: [
        { label: 'Easy hides: count by the driftwood tree, find Daddy', params: { round: '1' }, also: [{ label: 'tune the feel', params: { round: '1' }, flags: { feel: '1' } }] },
        { label: 'Trickier hides: the roots, the towel, the sea, the pandanus', params: { round: '2' } },
        { label: 'Her turn to hide: Daddy counts and searches the wrong places', params: { round: 'hide' } },
      ],
    },
  ],
})
export default SAMET_SECTIONS
export type SametSection = (typeof SAMET_SECTIONS)['sections'][number]['id']

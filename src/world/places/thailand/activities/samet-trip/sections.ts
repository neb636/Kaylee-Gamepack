// The Koh Samet trip (plan: planning/around-the-world/thailand/samet-trip.html), as deep-linkable sections:
// #/world/thailand/samet-trip/<section>?... Three so far:
//   island  greybox 2, the island to roam (island?at=nadan|saikaew|hinkhok|phai|wongduan|prao|deck|aonoina): lead
//           Kaylee with a finger round the north half of Koh Samet, swim in the floatie, ride the green taxi round the
//           road, poke everything; `flags` puts up the pink flags (and moves the day on), `time` sets the light.
//   book    greybox 3, the island with Kaylee's animal book open (book?book=monitor,hornbill,...): the animals she has
//           snapped with Mommy's phone (`book`, also on `island`; `phone=1` opens the island with the phone out).
//   jetski  greybox 1, the jet ski at Hat Sai Kaew (jetski?round=ride|waves|race): Kaylee steers with her finger on
//           the water, Daddy sits behind her.
// The other stops, the fire show and the trip frame get their sections with their greyboxes. In the
// works: only these links reach it. Loaded at startup: keep three.js (and the island's coastline data) out of this file.
import { defineSections } from '../../../../kit/sections'
import { ANIMAL_IDS } from './book/animals'

/** The jet ski's rounds (the same ids as island/layout.ts ROPE). */
export const JET_ROUNDS = ['ride', 'waves', 'race'] as const
/** Where she can land on the island (island/layout.ts SPOT_IDS). */
export const SPOTS = ['nadan', 'saikaew', 'hinkhok', 'phai', 'wongduan', 'prao', 'deck', 'aonoina'] as const
/** The stops, each with its pink flag (island/layout.ts STOPS). */
export const FLAGS = ['jetski', 'sandcastle', 'snorkel', 'hideseek'] as const
export const TIMES = ['morning', 'noon', 'afternoon', 'golden', 'night'] as const

const SAMET_SECTIONS = defineSections('thailand', 'samet-trip', {
  note: "In the works (greyboxes 1 to 3 of the plan). Add ?feel=1 to tune how Kaylee walks and swims, the camera, Mommy's phone, the taxi and the jet ski; ?fps=1 or ?debug=1 shows the frame rate.",
  params: {
    at: { default: 'nadan', values: SPOTS, doc: 'where she stands on the island: nadan (the pier, where the speedboat lands), saikaew (the jet ski beach), hinkhok (the sandcastle beach), phai, wongduan (the snorkel boat), prao (the sunset beach and the driftwood tree), deck (the resort deck above Ao Prao), aonoina (the quiet north beach)' },
    flags: { default: '', doc: `the pink flags she has earned, a comma list of ${FLAGS.join(', ')} (or all): each stands on its beach, and the day moves on with them (morning, noon, afternoon, golden). With jetski, a jet ski waits on every beach for her to ride` },
    time: { default: '', values: ['', ...TIMES], doc: 'the light, overriding the flags: morning, noon, afternoon, golden or night (the beach bars and lanterns glow, the stars come out)' },
    book: { default: '', doc: `the animals already in her book (snapped with Mommy's phone), a comma list of ${ANIMAL_IDS.join(', ')} (or all)` },
    phone: { default: '', values: ['', '1'], doc: "1: Mommy's phone is out from the start (every tap is a photo)" },
    round: { default: 'ride', values: JET_ROUNDS, doc: 'the jet ski round: ride (the calm bay inside the buoy rope: the life jacket first, then carve, spray, splash the swimmers, close a loop of wake for the jumping fish), waves (bigger waves roll in from the open sea: steer into them to jump, a spin on the biggest) or race (out round the big orange buoy and back to the flags against the jet ski man; the winner rings the bell)' },
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
  ],
})
export default SAMET_SECTIONS
export type SametSection = (typeof SAMET_SECTIONS)['sections'][number]['id']

// Thailand's home base as deep-linkable spots: the Thailand map (map/, where she lands: tap Bangkok, Krabi or Nan) and Agong's house in Bangkok: #/world/thailand/hub/<section>?at=<thing>.
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections, HUB } from '../../../../kit/sections'

const HUB_SECTIONS = defineSections('thailand', HUB, {
  params: {
    stamp: { default: '', values: ['', 'boat-trip', 'nan-trip', 'mall-trip', 'samet-trip'], doc: "the map: this trip's stamp lands on its pin (the end of a trip: Krabi's for boat-trip, Nan's for nan-trip, Bangkok's for mall-trip, Koh Samet's for samet-trip)" },
    at: {
      default: '',
      doc: 'start already using a thing on that floor: table, ground-couch, altar, desk, fridge, photos (downstairs); mattress, pillows, couch, suitcase, balcony, game-table (upstairs); motorbike, spirit-house, cat (street)',
    },
    drawer: {
      default: '',
      values: ['', 'head', 'face', 'back', 'outfit', 'feet', 'paint'],
      doc: "the wardrobe with this drawer open: head (hats), face (glasses), back (wings), outfit, feet (shoes), paint",
    },
    door: {
      default: '',
      doc: "the wardrobe with these pictures of looks on its left door (up to 4, ';' between them): crown,hearts;bow,fairy,dress-mint",
    },
    vs: { default: 'bb', values: ['bb', 'gan', 'ken'], doc: 'the game table: the cousin across from her (BB first: Kaylee picked her)' },
    game: { default: 'unicorn', values: ['unicorn', 'candy', 'chutes'], doc: 'the game table: which game card is picked' },
    piece: { default: 'pink', values: ['pink', 'lavender', 'mint', 'sunny'], doc: "the Unicorn Dice Game: Kaylee's unicorn (the cousin takes another)" },
    me: { default: '0', doc: "the game table: where Kaylee's piece starts (0 = before space 1)" },
    them: { default: '0', doc: "the game table: where the cousin's piece starts (0 = before space 1)" },
    turn: { default: 'kaylee', values: ['kaylee', 'cousin'], doc: 'the game table: whose turn comes first from this state' },
    rolls: { default: '', doc: 'the game table: the next die results in order (e.g. 4,3,2), then random' },
    deck: { default: '', doc: 'Candy Land: the draw pile exactly, top first (green, blue2: a 2 is a double), then the discards reshuffled' },
    who: {
      default: '',
      doc: 'the family photo with one person alone, turning slowly: kaylee, agong, ji, nick, jum, joy, bird, ja, sri, gan, ken, bb, putto, putter',
    },
  },
  sections: [
    { id: 'map', name: 'The Thailand map: tap a pin to go there', params: ['stamp'], group: 'The Thailand map', links: [{ label: 'The map', bare: true }, { label: 'Home from a trip: the stamp lands on Krabi', params: { stamp: 'boat-trip' } }] },
    { id: 'arrive', name: 'Arrive by tuk-tuk', group: "Agong's house" },
    { id: 'street', name: "In front of Agong's house", params: ['at'], group: "Agong's house" },
    { id: 'downstairs', name: 'Downstairs', params: ['at'], group: "Agong's house" },
    { id: 'upstairs', name: "Kaylee's room upstairs", params: ['at'], group: "Agong's house", links: [{ label: "Kaylee's room upstairs", also: [{ label: 'in a look from her wardrobe', flags: { look: 'crown,hearts,fairy,dress-mint' } }] }] },
    { id: 'wardrobe', name: "Kaylee's wardrobe", params: ['drawer', 'door'], group: "Agong's house", links: [{ label: 'Her wardrobe: doors open (any link takes ?look=crown,hearts,fairy,tutu,sneakers,dress-mint,hair-pink,fur-sky)' }, { label: 'Her wardrobe: the hats drawer out', params: { drawer: 'head' }, also: [{ label: 'face', params: { drawer: 'face' } }, { label: 'back', params: { drawer: 'back' } }, { label: 'outfit', params: { drawer: 'outfit' } }, { label: 'feet', params: { drawer: 'feet' } }] }, { label: 'Her wardrobe: the paint drawer out', params: { drawer: 'paint' } }, { label: 'Her wardrobe: four pictures of looks on the door', params: { drawer: 'head', door: 'crown,hearts,tutu;bow,fairy,dress-mint;cap,stars,cape;overalls,boots,hair-pink,fur-sky' } }] },
    { id: 'family', name: 'Family photo', params: ['who'], group: "Agong's house" },
    { id: 'table', name: 'The game table: pick a game and a cousin', params: ['vs', 'game'], group: 'The game table (in the works: its games open from these links only)', links: [{ label: 'Sitting at the table: pick a game and a cousin (BB ready)' }, { label: 'The picker with Gan picked', params: { vs: 'gan' } }] },
    {
      id: 'unicorn',
      name: "Kaylee's Unicorn Dice Game",
      params: ['vs', 'piece', 'me', 'them', 'turn', 'rolls'],
      group: 'The game table (in the works: its games open from these links only)',
      links: [
        { label: "Kaylee's Unicorn Dice Game with BB, from the start", also: [{ label: 'Gan', params: { vs: 'gan' } }, { label: 'Ken', params: { vs: 'ken' } }] },
        { label: 'She is on 7 and rolls a 4: a rest, Ken rolls, then her turn as usual', params: { vs: 'ken', me: '7', them: '9', rolls: '4,3,2' } },
        { label: 'Midgame with Gan', params: { vs: 'gan', me: '12', them: '14' } },
        { label: 'She is on 22 and rolls a 6: into the castle, she wins', params: { me: '22', them: '20', rolls: '6' } },
        { label: "BB's turn on 23: she rolls a 2 and wins (a kind loss, Again!)", params: { me: '20', them: '23', turn: 'cousin', rolls: '2' } },
      ],
    },
    {
      id: 'candy',
      name: 'Candy Land',
      params: ['vs', 'me', 'them', 'turn', 'deck'],
      group: 'The game table (in the works: its games open from these links only)',
      links: [
        { label: 'Candy Land with BB, from the start', also: [{ label: 'Gan', params: { vs: 'gan' } }, { label: 'Ken', params: { vs: 'ken' } }] },
        { label: 'A single green card: to the next green space', params: { me: '10', them: '8', deck: 'green' } },
        { label: 'A double blue card: to the second blue space', params: { me: '10', them: '8', deck: 'blue2' } },
        { label: 'A double orange near the end with one orange left: to the cupcake house, she wins', params: { me: '31', them: '28', deck: 'orange2' } },
        { label: 'A two-card deck runs out: the third draw reshuffles the discards', params: { me: '4', them: '4', deck: 'pink,yellow' } },
        { label: 'Midgame with Ken', params: { vs: 'ken', me: '14', them: '17' } },
      ],
    },
    {
      id: 'chutes',
      name: 'Chutes and Ladders',
      params: ['vs', 'me', 'them', 'turn', 'rolls'],
      group: 'The game table (in the works: its games open from these links only)',
      links: [
        { label: 'Chutes and Ladders with BB, from the start', also: [{ label: 'Gan', params: { vs: 'gan' } }, { label: 'Ken', params: { vs: 'ken' } }] },
        { label: 'She rolls a 2 from the start: up the ladder from 2 to 14', params: { rolls: '2' } },
        { label: 'She is on 31 and rolls a 2: whee, down the slide from 33 to 22', params: { me: '31', them: '25', rolls: '2' } },
        { label: "Ken's turn on 12: he rolls a 6, up the ladder from 18 to 30", params: { vs: 'ken', me: '10', them: '12', turn: 'cousin', rolls: '6' } },
        { label: 'She is on 33 and rolls a 5: to 36, she wins', params: { me: '33', them: '30', rolls: '5' } },
        { label: 'Midgame with Gan', params: { vs: 'gan', me: '13', them: '17' } },
      ],
    },
  ],
})
export default HUB_SECTIONS
/** The house's own spots (every hub section but the map). */
export type HubSection = Exclude<(typeof HUB_SECTIONS)['sections'][number]['id'], 'map'>

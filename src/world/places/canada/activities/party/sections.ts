// Canada's finale in Ottawa as deep-linkable spots: #/world/canada/party/<section>?stamps=all. Maple says bonjour from
// the toy map, Kaylee drags six lost animals home across Canada (Animal Homes), then the team skates out onto the frozen
// Rideau Canal for Pond Hockey against the Canada geese; three goals and the big win, then the shell's trophy. Loaded at
// startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

/** The animals Animal Homes can ask about (one home each), in a sensible first-run order. */
export const HOME_ANIMALS = ['polar-bear', 'orca', 'bison', 'moose', 'beaver', 'loon', 'grizzly', 'spirit-bear', 'puffin'] as const
export type HomeAnimal = (typeof HOME_ANIMALS)[number]
/** How many questions a game of Animal Homes asks. */
export const HOMES_N = 6
/** Goals to win the hockey game. */
export const GOALS = 3

const PARTY_SECTIONS = defineSections('canada', 'party', {
  title: 'Animal Homes + Pond Hockey',
  note: 'The finale in Ottawa. The team is whoever her stamps brought (team= changes it for a test).',
  params: {
    q: { default: 'polar-bear', values: HOME_ANIMALS, doc: 'the animal Animal Homes asks about first (five more from the pool follow)' },
    home: { default: '0', values: ['0', '1', '2', '3', '4', '5'], doc: 'animals already home before this one (they stand on the map)' },
    score: { default: '0', values: ['0', '1', '2'], doc: 'goals already scored in Pond Hockey (the third one wins): 1 brings the geese defenders, 2 the last goal' },
    team: { default: '', doc: "who skates with Maple and the moose: empty = one friend per stamp she has, all = everyone, none = just the two, or a list of stamps (taffy,snowman,campfire,canoe,bridge,whales,salmon)" },
  },
  sections: [
    { id: 'story', name: 'Bonjour, Ottawa!' },
    {
      id: 'homes',
      name: 'Animal Homes',
      params: ['q', 'home'],
      links: [{ label: 'Animal Homes: the polar bear first', also: [{ label: 'the orca', params: { q: 'orca' } }, { label: 'the loon', params: { q: 'loon' } }, { label: 'the last animal', params: { q: 'beaver', home: '5' } }] }],
    },
    {
      id: 'hockey',
      name: 'Pond Hockey',
      params: ['score', 'team'],
      links: [
        { label: 'Pond Hockey: the first goal, open net', params: { team: 'all' }, also: [{ label: 'only Maple and the moose', params: { team: 'none' } }, { label: 'with a few friends', params: { team: 'taffy,campfire,whales' } }] },
        { label: 'Pond Hockey: the geese skate in the way', params: { score: '1', team: 'all' } },
        { label: 'Pond Hockey: the last goal', params: { score: '2', team: 'all' } },
      ],
    },
    { id: 'win', name: 'The big win', params: ['team'], links: [{ label: 'The big win on the canal', params: { team: 'all' } }] },
  ],
})
export default PARTY_SECTIONS
export type PartySection = (typeof PARTY_SECTIONS)['sections'][number]['id']

/** The stamps that bring a teammate, and who (the activity's sticker animal). The bike's moose is always in goal. */
export const TEAMMATES = { taffy: 'squirrel', snowman: 'owl', campfire: 'raccoon', canoe: 'loon', bridge: 'grizzly', whales: 'otter', salmon: 'spirit' } as const
export type Teammate = (typeof TEAMMATES)[keyof typeof TEAMMATES]

/** Who's on her team: the `team` param, or one friend per stamp. */
export function teamOf(param: string, stamps: string[]): Teammate[] {
  const ids = Object.keys(TEAMMATES) as (keyof typeof TEAMMATES)[]
  const from = param === 'all' ? ids : param === 'none' ? [] : param ? param.split(',') : stamps
  return ids.filter((id) => from.includes(id)).map((id) => TEAMMATES[id])
}

// Canada's finale, the big game on Ottawa's frozen canal, as deep-linkable spots:
// #/world/canada/party/<section>?stamps=all. The whole team skates out (the `game-in` film), then Pond Hockey against
// Gus's geese: three goals win. Then the `game-win` film (the Maple Cup) and the shell's trophy. Loaded at startup by
// the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

/** Goals to win the hockey game. */
export const GOALS = 3

const PARTY_SECTIONS = defineSections('canada', 'party', {
  title: 'The big game: Pond Hockey for the Maple Cup',
  note: 'The finale in Ottawa. The team is whoever her stamps brought (team= changes it for a test).',
  params: {
    score: { default: '0', values: ['0', '1', '2'], doc: 'goals already scored in Pond Hockey (the third one wins): 1 brings the geese defenders, 2 the last goal' },
    team: { default: '', doc: "who skates with Maple: empty = one friend per stamp she has, all = everyone, none = just Maple, or a list of chapters (snowman,bike,campfire,canoe,salmon,whales)" },
  },
  sections: [
    { id: 'story', name: 'The team skates out (the film, then the game)', params: ['team'], links: [{ label: 'The big game from the start', params: { team: 'all' } }] },
    {
      id: 'hockey',
      name: 'Pond Hockey',
      params: ['score', 'team'],
      links: [
        { label: 'Pond Hockey: the first goal, open net', params: { team: 'all' }, also: [{ label: 'only Maple', params: { team: 'none' } }, { label: 'with a few friends', params: { team: 'bike,campfire,whales' } }] },
        { label: 'Pond Hockey: the geese skate in the way', params: { score: '1', team: 'all' } },
        { label: 'Pond Hockey: the last goal', params: { score: '2', team: 'all' } },
      ],
    },
    { id: 'win', name: 'The big win (the Maple Cup film, then the trophy)', params: ['team'], links: [{ label: 'The big win on the canal', params: { team: 'all' } }] },
  ],
})
export default PARTY_SECTIONS
export type PartySection = (typeof PARTY_SECTIONS)['sections'][number]['id']

/** The chapters that bring a teammate onto the ice, and who skates for each in the game (activities/party/actors.ts).
 *  (The story's team is story/chapters.ts TEAM: Tuque the snowman, Monty the moose, Roxy the raccoon, Lulu the loon,
 *  Misty the spirit bear, Ollie the sea otter.) The moose is always in goal. */
export const TEAMMATES = { snowman: 'owl', campfire: 'raccoon', canoe: 'loon', salmon: 'spirit', whales: 'otter' } as const
export type Teammate = (typeof TEAMMATES)[keyof typeof TEAMMATES] | 'squirrel' | 'grizzly'

/** Who's on her team: the `team` param, or one friend per stamp. */
export function teamOf(param: string, stamps: string[]): Teammate[] {
  const ids = Object.keys(TEAMMATES) as (keyof typeof TEAMMATES)[]
  const from = param === 'all' ? ids : param === 'none' ? [] : param ? param.split(',') : stamps
  return ids.filter((id) => from.includes(id)).map((id) => TEAMMATES[id])
}

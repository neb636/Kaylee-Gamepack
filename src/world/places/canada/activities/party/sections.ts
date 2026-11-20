// Canada's finale, the big game on Ottawa's frozen canal, as deep-linkable spots:
// #/world/canada/party/<section>?stamps=all. The whole team skates out (the `game-in` film), then Pond Hockey against
// Gus's geese: three goals win. Then the `game-win` film (the Maple Cup) and the shell's trophy. Loaded at startup by
// the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'
import { CHAPTERS, type ChapterId } from '../story/sections'

/** Goals to win the hockey game. */
export const GOALS = 3

const PARTY_SECTIONS = defineSections('canada', 'party', {
  title: 'The big game: Pond Hockey for the Maple Cup',
  note: 'The finale in Ottawa. The team is whoever her stamps brought (team= changes it for a test).',
  params: {
    score: { default: '0', values: ['0', '1', '2'], doc: 'goals already scored in Pond Hockey (the third one wins): 1 starts with a geese rush (Roxy steals it) and geese in the way, 2 the last goal (a rush, then the goose wall Misty breaks)' },
    team: { default: '', doc: 'who is on the team: empty = one friend per stamp she has, all = everyone, none = just Maple, or a list of chapters (snowman,bike,campfire,canoe,salmon,whales)' },
  },
  sections: [
    { id: 'story', name: 'The team skates out (the film, then the game)', params: ['team'], links: [{ label: 'The big game from the start', params: { team: 'all' } }] },
    {
      id: 'hockey',
      name: 'Pond Hockey',
      params: ['score', 'team'],
      links: [
        { label: 'Pond Hockey: the first goal', params: { team: 'all' }, also: [{ label: 'only Maple', params: { team: 'none' } }, { label: 'without Monty and Roxy', params: { team: 'snowman,canoe,salmon,whales' } }] },
        { label: 'Pond Hockey: the geese rush, then geese in the way', params: { score: '1', team: 'all' } },
        { label: 'Pond Hockey: the last goal (the goose wall)', params: { score: '2', team: 'all' } },
      ],
    },
    { id: 'win', name: 'The big win (the Maple Cup film, then the trophy)', params: ['team'], links: [{ label: 'The big win on the canal', params: { team: 'all' } }] },
  ],
})
export default PARTY_SECTIONS
export type PartySection = (typeof PARTY_SECTIONS)['sections'][number]['id']

/** Who's on her team (story/chapters.ts TEAM says who each chapter brings): the `team` param (all, none, or a list of
 *  chapters), or one friend per stamp she has. */
export function teamFrom(param: string, stamps: string[]): ChapterId[] {
  const from: readonly string[] = param === 'all' ? CHAPTERS : param === 'none' ? [] : param ? param.split(',') : stamps
  return CHAPTERS.filter((id) => from.includes(id))
}

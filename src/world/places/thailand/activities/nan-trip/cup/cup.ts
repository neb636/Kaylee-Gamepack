// The Nan Mountain Cup as a whole (plan: planning/around-the-world/thailand/nan-cup.html, greybox 3), pure data and
// functions, so the board, the race, the podium and the ceremony all agree. Loaded at startup (sections.ts): no
// three.js here.
//
// - Behind a flag: with CUP_OPEN false the city road still ends at Nan town's market and goes back to the map, as
//   before. `?cup=1` on any Nan trip link turns it on to try (the city road ends at the race ground, the Cup is a
//   fourth stop with its stamp on Nan town, the boarding pass gains 🏁). Every Cup section link works either way.
// - The roll: she wins two races and loses one. When she gets to the race ground, the Cup rolls which track she'll
//   lose (`lose`) and the trip saves it; a whole new trip rolls again. The loss is never the last race she runs (Dad,
//   2026-10-27): if she won the first and the roll is the track she hasn't picked, the loss moves to the one she
//   picked second (the roll stops being random once one race is done and won). So the Cup always comes right after a
//   win.
// - The record (`cup`): the races done and her place in each, `forest:1,steps:2`.
import { flag } from '../../../../../engine3d/flags'
import { HOME, RIVAL_IDS, type Result, type RivalId } from './rivals'
import { TRACK_IDS, type TrackId } from './track'

/** Is the Cup on the trip? Off until Dad turns it on (step 5, the full loop). */
export const CUP_OPEN = false

/** Read once when the trip mounts (the address bar drops `cup=1` as she plays). */
export const cupOpen = () => CUP_OPEN || flag('cup') === '1'

export type Place = 1 | 2
/** The races she has run in the Cup, in the order she ran them, and her place in each. */
export type CupRecord = { track: TrackId; place: Place }[]

/** The `cup` param as a record (unknown tracks, repeats and places other than 1 and 2 dropped). */
export function parseCup(s: string): CupRecord {
  const out: CupRecord = []
  for (const part of s.split(',')) {
    const [t, p] = part.split(':')
    if (!(TRACK_IDS as string[]).includes(t) || out.some((r) => r.track === t)) continue
    out.push({ track: t as TrackId, place: p === '2' ? 2 : 1 })
  }
  return out
}
export const formatCup = (r: CupRecord) => r.map((x) => `${x.track}:${x.place}`).join(',')

/** The ceremony link with no `cup`: the whole Cup, the middle race lost. */
export const FULL_CUP = 'forest:1,steps:2,cloud:1'

export const isTrack = (s: string | null | undefined): s is TrackId => !!s && (TRACK_IDS as string[]).includes(s)

/** Rolls the track she'll lose (any of the three). */
export const rollLose = (rand: () => number = Math.random): TrackId => TRACK_IDS[Math.floor(rand() * TRACK_IDS.length) % TRACK_IDS.length]

/** The Cup is won: all three raced. */
export const cupDone = (r: CupRecord) => TRACK_IDS.every((t) => r.some((x) => x.track === t))
/** Has she already lost one? */
export const lostOne = (r: CupRecord) => r.some((x) => x.place === 2)

/** How a race on `track` ends, and which track is the loss from now on (the roll, or the race it moved to). A track
 *  already raced, or any race once the Cup is won, is a race for fun: she wins it. */
export function resultFor(track: TrackId, record: CupRecord, lose: TrackId): { result: Result; lose: TrackId } {
  if (record.some((x) => x.track === track) || lostOne(record)) return { result: 'win', lose }
  if (track === lose) return { result: 'lose', lose }
  // Not the rolled track: but if the rolled one would then be the only race left (the last one), the loss moves here.
  const left = TRACK_IDS.filter((t) => t !== track && !record.some((x) => x.track === t))
  if (left.length === 1 && left[0] === lose) return { result: 'lose', lose: track }
  return { result: 'win', lose }
}

/** The record after a race (a race for fun leaves it as it was). */
export function addRace(record: CupRecord, track: TrackId, place: Place): CupRecord {
  if (record.some((x) => x.track === track)) return record
  return [...record, { track, place }]
}

/** Who stands where on a race's podium: the winner on 1, the home rival or Kaylee on 2, and one other rival on 3.
 *  The last rival claps beside it. */
export function podiumOf(track: TrackId, place: Place): { first: 'kaylee' | RivalId; second: 'kaylee' | RivalId; third: RivalId; clap: RivalId } {
  const home = HOME[track]
  const others = RIVAL_IDS.filter((r) => r !== home)
  return place === 1 ? { first: 'kaylee', second: home, third: others[0], clap: others[1] } : { first: home, second: 'kaylee', third: others[0], clap: others[1] }
}

/** What each rival gives her when they win (it goes on her kart for the rest of the Cup). */
export const GIFTS: Record<RivalId, { icon: string; label: string }> = {
  taeng: { icon: '🎀', label: "Grandma Taeng's lucky pink ribbon" },
  pao: { icon: '🪶', label: "One of Pao's feathers" },
  moon: { icon: '🍯', label: "Moon's honey-pot sticker" },
}
/** The gifts on her kart: one from the winner of each race she lost. */
export const giftsOf = (r: CupRecord): RivalId[] => r.filter((x) => x.place === 2).map((x) => HOME[x.track])

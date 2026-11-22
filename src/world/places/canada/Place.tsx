// Canada (planning/around-the-world/canada.md) is one story, "Maple's Team": Maple the beaver wants to win the Maple
// Cup, the hockey game on Ottawa's frozen canal that Gus's geese win every year, and she can't win alone. Her friends
// live all across Canada. The home base is the 3D map of the country (activities/hub/, map/), her friends standing on
// it where they live. Each is a chapter: a film (story/, on its own film stage), the game, a film, then its stamp and
// sticker, and that friend is on the team. With all six, the big game (activities/party/): its win is the trophy.
// The first visit opens with the way-in film. The 2D chapters load on their own, so the map brings no more than it
// needs. Every game gets CanadaActivityProps (activities/props.ts).
import { lazy, Suspense, useState, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react'
import { useSections } from '../../kit/sections'
import { useStampFlow } from '../../kit/stampFlow'
import { StartOver } from '../../kit/StartOver'
import { setStamps } from '../../stamps'
import type { PlaceProps } from '../../types'
import { MountainBike } from './activities/bike/MountainBike'
import { Hub } from './activities/hub/Hub'
import type { CanadaActivityProps } from './activities/props'
import STORY_SECTIONS, { type FilmId } from './activities/story/sections'
import { MetCard } from './book/MetCard'
import { CHAPTER_FILMS, filmSeen, forgetFilms, isChapter, justSeen, seeFilm, type ChapterId } from './story/chapters'
import { StoryFilm } from './story/StoryFilm'

type Game = LazyExoticComponent<ComponentType<CanadaActivityProps>> | ComponentType<CanadaActivityProps>
const lazyOf = (load: () => Promise<ComponentType<CanadaActivityProps>>): Game => lazy(() => load().then((C) => ({ default: C })))

/** Each game, and the color under it while its code loads. */
const ACTIVITIES: Record<string, { C: Game; bg: string }> = {
  bike: { C: MountainBike, bg: '#CFE8D6' },
  campfire: { C: lazyOf(() => import('./activities/campfire/CampfireNight').then((m) => m.CampfireNight)), bg: '#14102A' },
  canoe: { C: lazyOf(() => import('./activities/canoe/RedCanoe').then((m) => m.RedCanoe)), bg: '#C4E8FA' },
  whales: { C: lazyOf(() => import('./activities/whales/WhaleWatch').then((m) => m.WhaleWatch)), bg: '#CFEAF7' },
  bath: { C: lazyOf(() => import('./activities/bath/BubbleBath').then((m) => m.BubbleBath)), bg: '#CFEDE6' },
  snowman: { C: lazyOf(() => import('./activities/snowman/CarnivalSnowballs').then((m) => m.CarnivalSnowballs)), bg: '#DCE6F6' },
  // The Team Cabin: a toy on the map (no stamp, no end): its way out is back to the map.
  cabin: { C: lazyOf(() => import('./activities/cabin/TeamCabin').then((m) => m.TeamCabin)), bg: '#F6E3CF' },
  party: { C: lazyOf(() => import('./activities/party/Finale').then((m) => m.Finale)), bg: '#DDEBFA' },
}

export default function Place(props: PlaceProps) {
  const { meta, activity, stamps, backToMap, setProgress, onWin } = props
  const stamp = useStampFlow(props, { closeIcon: '🍁 ▶', layer: true })
  if (activity === 'story') return <FilmLink {...props} />
  const entry = activity ? ACTIVITIES[activity] : undefined
  if (!entry) return <Arrival {...props} />
  const all = [...meta.activities, ...(meta.inTheWorks ?? [])]
  const info = all.find((a) => a.id === activity)
  // The big game's payoff is the trophy; a chapter's is its stamp and sticker (and a new friend on the map).
  const onDone = activity === 'party' ? onWin : info ? stamp.finishFor(info) : () => props.openActivity('hub')
  if (window.__kayleeWorld) window.__kayleeWorld.finish = onDone
  const { C, bg } = entry
  const game = (done: () => void, filmed: boolean) => (
    <>
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: bg }} />}>
        <C key={activity} onDone={done} setProgress={setProgress} onBack={backToMap} stamps={stamps} activities={all} filmed={filmed} />
      </Suspense>
      <MetCard />
    </>
  )
  return (
    <>
      {isChapter(activity) ? <Chapter key={activity} id={activity} first={!stamps.includes(activity)} game={game} onDone={onDone} /> : game(onDone, false)}
      {stamp.overlay}
    </>
  )
}

/** The map; on her first visit (no stamps yet, a bare link) the way-in film plays first. Coming back to a story under
 *  way, the start-over pill shows for a few seconds. */
function Arrival(props: PlaceProps) {
  const [bare] = useState(() => props.activity === undefined && !location.hash.includes('/hub'))
  const [film, setFilm] = useState(() => bare && props.stamps.length === 0 && !filmSeen('intro'))
  const [resumed, setResumed] = useState(() => bare && !film && (props.stamps.length > 0 || filmSeen('intro')))
  if (film)
    return (
      <StoryFilm
        id="intro"
        onDone={() => {
          seeFilm('intro')
          setFilm(false)
        }}
      />
    )
  return (
    <>
      <Hub {...props} />
      <MetCard />
      {resumed && (
        <StartOver
          label="Start Maple's story again"
          onRestart={() => {
            // Back to the very start: the stamps come off (so each chapter's films play again and the big game
            // waits for the team), the films are unseen, and the way-in film plays. The trophy stays hers.
            setStamps(props.meta.id, [])
            forgetFilms()
            setResumed(false)
            setFilm(true)
          }}
        />
      )}
    </>
  )
}

/** One chapter: its way-in film (the first time, and only from the map: a section link goes straight to the game),
 *  the game, then its closing film (the first time it's finished) before the stamp. `game(done, filmed)` draws the
 *  game: `filmed` says its way-in film has just played, so the game skips its own hello and starts with her hands. */
function Chapter({ id, first, game, onDone }: { id: ChapterId; first: boolean; game: (done: () => void, filmed: boolean) => ReactNode; onDone: () => void }) {
  const films = CHAPTER_FILMS[id]
  // (A link to one of the game's sections has more after the activity's id.)
  const [linked] = useState(() => location.hash.split('?')[0].split('/').length > 4)
  const [phase, setPhase] = useState<'in' | 'play' | 'out'>(() => (first && !linked && !filmSeen(films.in) ? 'in' : 'play'))
  // (Opened by its way-in film's own link, the film has just played too.)
  const [filmed, setFilmed] = useState(() => justSeen(films.in))
  const [wasFirst] = useState(first)
  if (phase === 'in')
    return (
      <StoryFilm
        id={films.in}
        onDone={() => {
          seeFilm(films.in)
          setFilmed(true)
          setPhase('play')
        }}
      />
    )
  // (The closing film takes the game's place: two 3D worlds would share the one renderer and both keep drawing.)
  if (phase === 'out')
    return (
      <StoryFilm
        id={films.out}
        onDone={() => {
          seeFilm(films.out)
          onDone()
        }}
      />
    )
  return <>{game(() => (wasFirst && !filmSeen(films.out) ? setPhase('out') : onDone()), filmed)}</>
}

/** #/world/canada/story/<film>: plays that film, then goes on to what follows it in the game. */
function FilmLink({ openActivity, backToMap }: PlaceProps) {
  const { start, enter } = useSections(STORY_SECTIONS)
  const [id] = useState<FilmId>(() => {
    const film = start ?? 'intro'
    enter(film)
    return film
  })
  return (
    <StoryFilm
      id={id}
      onDone={() => {
        seeFilm(id)
        const chapter = (Object.entries(CHAPTER_FILMS) as [ChapterId, { in: FilmId; out: FilmId }][]).find(([, f]) => f.in === id)?.[0]
        // A chapter's way-in film goes on into its game, the big game's into the hockey; the others back to the map.
        if (chapter) openActivity(chapter)
        else if (id === 'game-in') openActivity('party')
        // (Straight to the map, not the place's front door: on a fresh device that would play the way-in film next.)
        else if (id === 'intro') backToMap()
        else openActivity('hub')
      }}
    />
  )
}

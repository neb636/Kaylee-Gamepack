// The Poles (plan: planning/around-the-world/poles.md): the top and the bottom of the world in one place, told as one
// story, "Pebble's Long Way Home". A penguin chick wakes up at the North Pole; Pola the polar bear cub, Terry the tern
// and Sparkle's balloon take him home to Papa at the South Pole. The home base is the 3D globe (activities/hub/,
// globe/) with the story's pictures along the way down it. Each picture is a chapter: a film (story/, on its own film
// stage), the game, a film, then its stamp and sticker. The first visit opens with the way-in film. All five stamps
// open the finale (activities/party/): the flight home, Papa's song, the reunion and Terry's Polar Explorer quiz.
// Snow Coats and Emperor Huddle are 2D and loaded on their own, so they bring no three.js.
import { lazy, Suspense, useState, type ComponentType } from 'react'
import { useSections } from '../../kit/sections'
import { useStampFlow } from '../../kit/stampFlow'
import type { PlaceProps } from '../../types'
import { FloeHop } from './activities/floe/FloeHop'
import { Hub } from './activities/hub/Hub'
import { NarwhalRide } from './activities/narwhal/NarwhalRide'
import { Finale } from './activities/party/Finale'
import { PenguinSlide } from './activities/slide/PenguinSlide'
import STORY_SECTIONS, { type FilmId } from './activities/story/sections'
import { CHAPTER_FILMS, filmSeen, seeFilm } from './story/chapters'
import { StoryFilm } from './story/StoryFilm'

/** What every Poles activity gets: call `onDone` at its payoff (its film, the stamp, the sticker, the video, then the globe). */
export interface ActivityProps {
  onDone: () => void
}

const SnowCoats = lazy(() => import('./activities/coats/SnowCoats').then((m) => ({ default: m.SnowCoats })))
const EmperorHuddle = lazy(() => import('./activities/huddle/EmperorHuddle').then((m) => ({ default: m.EmperorHuddle })))

const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = {
  floe: FloeHop,
  slide: PenguinSlide,
  narwhal: NarwhalRide,
  coats: (p) => (
    <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#ECE5EE' }} />}>
      <SnowCoats {...p} />
    </Suspense>
  ),
  huddle: (p) => (
    <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#1B2150' }} />}>
      <EmperorHuddle {...p} />
    </Suspense>
  ),
}

export default function Place(props: PlaceProps) {
  const { meta, activity, stamps, onWin } = props
  const stamp = useStampFlow(props, { closeIcon: '🌍 ▶', videoNext: '🌍', layer: true })
  const all = meta.activities.every((a) => stamps.includes(a.id))

  if (activity === 'story') return <FilmLink {...props} />
  if (activity === 'party') {
    // The finale waits for every stamp (a link with ?stamps=all opens it straight away).
    if (!all) return <Hub {...props} />
    return <Finale onWin={onWin} />
  }
  const Activity = activity ? ACTIVITIES[activity] : undefined
  const info = meta.activities.find((a) => a.id === activity) ?? meta.inTheWorks?.find((a) => a.id === activity)
  if (!Activity || !info) return <Arrival {...props} />
  // An activity still in the works opens from its links and earns its stamp, but its sticker line isn't recorded yet.
  return (
    <>
      <Chapter key={activity} id={info.id} first={!stamps.includes(info.id)} Activity={Activity} onDone={stamp.finishFor(info, { live: meta.activities.includes(info) })} />
      {stamp.overlay}
    </>
  )
}

/** The globe; on her first visit (no stamps yet, a bare link) the way-in film plays first. */
function Arrival(props: PlaceProps) {
  const [film, setFilm] = useState(() => props.activity === undefined && props.stamps.length === 0 && !filmSeen('intro') && !location.hash.includes('/hub'))
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
  return <Hub {...props} />
}

/** One chapter: its way-in film (the first time, and only from the globe: a section link goes straight to the game),
 *  the game, then its closing film (the first time it's finished) before the stamp. */
function Chapter({ id, first, Activity, onDone }: { id: string; first: boolean; Activity: ComponentType<ActivityProps>; onDone: () => void }) {
  const films = CHAPTER_FILMS[id]
  // (A link to one of the game's sections has more after the activity's id.)
  const [linked] = useState(() => location.hash.split('?')[0].split('/').length > 4)
  const [phase, setPhase] = useState<'in' | 'play' | 'out'>(() => (films && first && !linked && !filmSeen(films.in) ? 'in' : 'play'))
  const [wasFirst] = useState(first)
  if (phase === 'in' && films)
    return (
      <StoryFilm
        id={films.in}
        onDone={() => {
          seeFilm(films.in)
          setPhase('play')
        }}
      />
    )
  // (The closing film takes the game's place: two 3D worlds would share the one renderer and both keep drawing.)
  if (phase === 'out' && films)
    return (
      <StoryFilm
        id={films.out}
        onDone={() => {
          seeFilm(films.out)
          onDone()
        }}
      />
    )
  return <Activity onDone={() => (films && wasFirst && !filmSeen(films.out) ? setPhase('out') : onDone())} />
}

/** #/world/poles/story/<film>: plays that film, then goes on to what follows it in the game. */
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
        const chapter = Object.entries(CHAPTER_FILMS).find(([, f]) => f.in === id)?.[0]
        if (chapter) openActivity(chapter)
        else if (id === 'home-in') openActivity('party')
        else backToMap()
      }}
    />
  )
}

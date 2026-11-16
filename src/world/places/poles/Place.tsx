// The Poles (plan: planning/around-the-world/poles.md): the top and the bottom of the world in one place, told as one
// story, "Pebble's Long Way Home". A penguin chick wakes up at the North Pole; Pola the polar bear cub, Terry the tern
// and Sparkle's balloon take him home to Papa at the South Pole. The home base is the 3D globe (activities/hub/,
// globe/) with the story's pictures along the way down it. Each picture is a chapter: a film (story/, on its own film
// stage), the game, a film, then its stamp and sticker. The first visit opens with the way-in film. All five stamps
// open the finale (activities/party/): the flight home, Papa's song, the reunion and Terry's Polar Explorer quiz.
// Snow Coats is 2D and loaded on its own, so it brings no three.js; Emperor Huddle (3D) loads on its own too, the last
// chapter, so its world isn't built into the first ones' download.
import { lazy, Suspense, useState, type ComponentType } from 'react'
import { useSections } from '../../kit/sections'
import { useStampFlow } from '../../kit/stampFlow'
import type { PlaceProps } from '../../types'
import { FloeHop } from './activities/floe/FloeHop'
import { Hub } from './activities/hub/Hub'
import { NarwhalRide } from './activities/narwhal/NarwhalRide'
import { PenguinSlide } from './activities/slide/PenguinSlide'
import STORY_SECTIONS, { type FilmId } from './activities/story/sections'
import { CHAPTER_FILMS, filmSeen, forgetFilms, seeFilm } from './story/chapters'
import { StartOver } from '../../kit/StartOver'
import { setStamps } from '../../stamps'
import { StoryFilm } from './story/StoryFilm'
import { ACT_SECTION, forgetNight, STEPS } from './activities/night/steps'
import { go } from '../../../router'

/** What every Poles activity gets: call `onDone` at its payoff (its film, the stamp, the sticker, the video, then the globe). */
export interface ActivityProps {
  onDone: () => void
}

const SnowCoats = lazy(() => import('./activities/coats/SnowCoats').then((m) => ({ default: m.SnowCoats })))
const Night = lazy(() => import('./activities/night/Night').then((m) => ({ default: m.Night })))
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
  // The ending, The Longest Night (3D, loaded on its own like the huddle): its films and acts run inside it.
  night: (p) => (
    <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#2A2766' }} />}>
      <Night {...p} />
    </Suspense>
  ),
}

export default function Place(props: PlaceProps) {
  const { meta, activity, stamps, onWin, backToMap } = props
  // The ending's stamp is the last: the trophy comes straight after it (then the globe, where the movie ticket waits).
  const stamp = useStampFlow(props, { closeIcon: '🌍 ▶', videoNext: '🌍', layer: true, after: (info) => (info.id === 'night' ? onWin() : backToMap()) })

  if (activity === 'story') return <FilmLink {...props} />
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

/** The globe; on her first visit (no stamps yet, a bare link) the way-in film plays first. Coming back to a story
 *  under way, the start-over pill shows for a few seconds. */
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
      {resumed && (
        <StartOver
          label="Start Pebble's story again"
          onRestart={() => {
            // Back to the very start: the chapters' stamps come off (so each chapter's films play again and the
            // finale waits for them), the films are unseen, and the way-in film plays. The trophy stays hers.
            setStamps(props.meta.id, [])
            forgetFilms()
            forgetNight()
            setResumed(false)
            setFilm(true)
          }}
        />
      )}
    </>
  )
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
        // (The ending's films go on to what follows them in the chapter: the next act, or the next film.)
        const at = STEPS.findIndex((st) => 'film' in st && st.film === id)
        const after = at >= 0 ? STEPS[at + 1] : undefined
        if (chapter) openActivity(chapter)
        else if (after && 'act' in after) go.world('poles', 'night', ACT_SECTION[after.act])
        else if (after && 'film' in after) go.world('poles', 'story', after.film)
        else backToMap()
      }}
    />
  )
}

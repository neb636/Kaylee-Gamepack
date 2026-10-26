// The Nan road trip (plan: planning/around-the-world/thailand/nan-trip.html). Still in the works (meta.ts `inTheWorks`):
// only its links open it. Greyboxes, joined up into the whole trip (step 7):
//   the way there and home (Loop.tsx, the trip kit's legs): Mommy asks where to (invite, 🏔️🚙), packing for the
//   mountains (pack), the goodbye and Aunty Sri's van (goodbye), the x-ray belt (airport), the window seat north to Nan
//   (takeoff, fly, land), then
//   the rental desk (rental/, section rental): the key fob, the bags into the boot, the seatbelt, and off they drive to
//   the Nan map (map/, section map), the trip's hub: tap a place (or drag the little Pajero there) and it drives there
//   on the diorama, then the mountain road (drive/, section drive) to it: the valley road to Baan Huanam Mushroom Farm
//   (mushrooms/), the sky road to Kaylee's rice farm under Stop Time Cafe (rice/) or to Bo Kluea's salt wells (salt/),
//   the city road through Nan town and back. Each stop's end card goes back to the map, where its stamp lands. After
//   two stops the airport opens: the 3 road, and at its viewpoint she draws the 3 (section three), Mommy takes their
//   photo and ✈️🏠 flies them home (section home: the photo she picks goes on Agong's wall, then the stamp, onDone).
// Between the trip kit's legs a boarding pass slides up (punching the leg she finished) and hides the next world being
// built. The trip saves at each leg (useSaved): saying yes to the mountains again offers to keep going and, after a
// whole trip, 🗺️ straight to the Nan map with the Pajero ready.
import { AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sounds, useSaved } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { flag } from '../../engine/flags'
import { BoardingPass, type PassChoice } from '../../trip/legs/BoardingPass'
import { formatPacked, parsePacked } from '../../trip/packing'
import { Drive } from './drive/Drive'
import type { RoadId } from './drive/roads'
import { NanLoop, type NanLoopHandle } from './Loop'
import { PLACES, STOPS, type PlaceId, type Stop } from './map/layout'
import { NanMap } from './map/NanMap'
import { BASKET_SEED, ROUNDS as FARM_ROUNDS, type Round } from './mushrooms/layout'
import { Mushrooms } from './mushrooms/Mushrooms'
import { parsePhotos, PHOTO_OF, type PhotoId } from './photo'
import { ROUNDS as RENTAL_ROUNDS, type Round as RentalRound } from './rental/layout'
import { Rental } from './rental/Rental'
import { ROUNDS as RICE_ROUNDS, type Round as RiceRound } from './rice/layout'
import { Rice } from './rice/Rice'
import type { Round as SaltRound } from './salt/layout'
import { Salt } from './salt/Salt'
import NAN_SECTIONS, { type NanSection } from './sections'
import { isLoop, legOf, PASS, RESUME, RESUME_AT, type LoopSection } from './trip'

type At =
  | { section: LoopSection }
  | { section: 'rental'; round: RentalRound }
  | { section: 'map' }
  | { section: 'drive'; road: RoadId; to: string }
  | { section: 'three' }
  | { section: 'mushrooms'; round: Round; basket: string }
  | { section: 'rice'; round: RiceRound }
  | { section: 'salt'; round: SaltRound }

/** Where the trip picks up next time (the start of a leg), what was in her suitcase and the stops done. */
interface Progress {
  at: NanSection | null
  packed: string
  stops: string
  /** Whole trips done (after the first, 🗺️ straight to the map and a shorter flight). */
  trips?: number
}

/** The `stops` param: the stops done so far, in order (anything else dropped). */
const parseStops = (s: string) => [...new Set(s.split(',').filter((x): x is Stop => (STOPS as readonly string[]).includes(x)))]
const DEFAULT_PACKED = NAN_SECTIONS.params.packed.default

/** Where a place on the map leads: the road there, and where that road's end goes. */
function driveTo(place: PlaceId): At {
  // (The airport is home, down the 3 road: it ends at the viewpoint. Nan town is a drive through and back.)
  return { section: 'drive', road: PLACES[place].road, to: place === 'airport' ? '' : place === 'town' ? 'map' : place }
}

/** The legs punched on the boarding pass before `next`'s: the way there up to it, and the stops done. */
function doneBefore(next: NanSection, stops: Stop[], punch: string | null) {
  const way = isLoop(next) && next !== 'home' ? ['pack', 'fly'].slice(0, next === 'invite' || next === 'pack' ? 0 : next === 'goodbye' ? 1 : 2) : ['pack', 'fly', 'rental']
  if (next === 'rental') way.pop()
  return [...way, ...stops].filter((id) => id !== punch && id !== legOf(next))
}

interface Props {
  /** ✋ Not yet on Mommy's card. */
  onExit?: () => void
  /** Another trip on Mommy's card (🚤, 🛝🍕): that one instead. */
  onTrip?: (id: string) => void
  /** Home, the photo on the wall: the stamp. */
  onDone?: () => void
}

export function NanTrip({ onExit, onTrip, onDone }: Props = {}) {
  const { start, param, enter } = useSections(NAN_SECTIONS)
  const first: NanSection = start ?? 'invite'
  const [saved, setSaved] = useSaved<Progress>('thailand-nan-trip', { at: null, packed: DEFAULT_PACKED, stops: '' })
  // She has done the whole trip before (or the link says so).
  const [replay] = useState(() => param('replay') === '1' || (saved.trips ?? 0) > 0)
  // What's in the suitcase comes from the link (its default when it has none), so a link opens the same trip on any
  // iPad; a new packing starts empty. (Keeping going from Mommy's card reads what she saved: `choose`.)
  const [packed, setPacked] = useState<string[]>(() => parsePacked(flag('packed') ?? (first === 'invite' || first === 'pack' ? '' : DEFAULT_PACKED)))
  // (Read once: the address changes as she plays.)
  const [stops, setStops] = useState<Stop[]>(() => parseStops(param('stops')))
  // The photos from the trip: a link's, or one for each stop done and the 3 once it's drawn.
  const [linkPhotos] = useState(() => parsePhotos(param('photos')))
  const [drew3, setDrew3] = useState(false)
  const photos: PhotoId[] = linkPhotos.length ? linkPhotos : [...stops.map((s) => PHOTO_OF[s]), ...(drew3 ? (['three'] as const) : [])]
  const homePhotos: PhotoId[] = photos.length ? photos : ['deck', 'three']
  const [at, setAt] = useState<At>(() => {
    const round = param('round')
    if (isLoop(first)) return { section: first }
    if (first === 'mushrooms') {
      // (The round param is shared with the other stops: one of their rounds starts the farm from the top.)
      const r = ((FARM_ROUNDS as readonly string[]).includes(round) ? round : '1') as Round
      return { section: 'mushrooms', round: r, basket: param('basket') || BASKET_SEED[r] }
    }
    if (first === 'salt') return { section: 'salt', round: (['1', '2', '3'].includes(round) ? round : '1') as SaltRound }
    if (first === 'rice') return { section: 'rice', round: ((RICE_ROUNDS as readonly string[]).includes(round) ? round : 'plant') as RiceRound }
    if (first === 'drive') return { section: 'drive', road: param('road') as RoadId, to: param('to') }
    if (first === 'map') return { section: 'map' }
    if (first === 'three') return { section: 'three' }
    return { section: 'rental', round: ((RENTAL_ROUNDS as readonly string[]).includes(round) ? round : 'key') as RentalRound }
  })
  useEffect(() => {
    const p = formatPacked(packed)
    // (What's in her suitcase rides along in every link: home reads it.)
    const s = { stops: stops.join(','), packed: p }
    if (at.section === 'invite') enter('invite', replay ? { replay: '1' } : {})
    else if (at.section === 'home') enter('home', { packed: p, photos: homePhotos.join(',') })
    else if (isLoop(at.section)) enter(at.section, { packed: p, ...(at.section === 'goodbye' || at.section === 'takeoff' || at.section === 'fly' ? { replay: replay ? '1' : '' } : {}) })
    else if (at.section === 'drive') enter('drive', { road: at.road, ...(at.to ? { to: at.to } : {}), ...s })
    else if (at.section === 'map' || at.section === 'three') enter(at.section, s)
    else if (at.section === 'mushrooms') enter('mushrooms', { round: at.round, basket: at.basket, ...s })
    else if ('round' in at) enter(at.section, { round: at.round, ...s })
  }, [at, stops, packed])

  // ---- The trip around the stops: the boarding pass between legs, resume and replays ----
  const loop = useRef<NanLoopHandle>(null)
  const [pass, setPass] = useState<{ punch: string | null; done: string[]; choices?: PassChoice[] } | null>(null)
  const moving = useRef(false)
  const state = useRef({ at, packed, stops })
  state.current = { at, packed, stops }
  /** Remember where the trip picks up next time. */
  const save = (s: NanSection) => {
    const st = state.current
    const resume = RESUME.includes(s) ? s : RESUME_AT[s]
    if (resume) setSaved((p) => ({ ...p, at: resume, packed: formatPacked(st.packed) || p.packed, stops: st.stops.join(',') }))
  }
  /** A leg is over: the boarding pass slides up (punching it), the next leg starts behind it, and it goes. */
  const go = (next: At) => {
    if (moving.current) return
    moving.current = true
    const was = legOf(state.current.at.section)
    const leg = legOf(next.section)
    const punch = was && was !== leg ? was : null
    setPass({ punch, done: doneBefore(next.section, state.current.stops, punch) })
    save(next.section)
    setTimeout(() => setAt(next), 900)
    setTimeout(() => {
      setPass(null)
      moving.current = false
    }, 2300)
  }
  /** The legs of the trip kit end in one of these. */
  const onLeg = (next: string) => go(next === 'rental' ? { section: 'rental', round: 'key' } : { section: next as LoopSection })

  /** 🏔️🚙 on Mommy's card: straight to packing; or, with a trip half done or after her first whole trip, where to start
   *  (🧳 a new trip, the next leg's icon to keep going, 🗺️ straight to the Nan map). */
  const yes = () => {
    if (moving.current) return
    const half = saved.at && saved.at !== 'pack' ? saved.at : null
    if (!half && !replay) return loop.current?.startPack()
    const choices: PassChoice[] = [{ label: 'A new trip', icon: '🧳', on: () => choose('again') }]
    if (half && half !== 'map') choices.push({ label: 'Keep going', icon: PASS.find((p) => p.id === legOf(half))?.icon ?? '🧳', on: () => choose('resume') })
    if (replay || half === 'map') choices.push({ label: 'Straight to the Nan map', icon: '🗺️', on: () => choose('map') })
    setPass({ punch: null, done: half ? doneBefore(half, parseStops(saved.stops), null) : [], choices })
  }
  const choose = (how: 'again' | 'resume' | 'map') => {
    sounds.pop()
    setPass(null)
    if (how === 'again') {
      setPacked([])
      setStops([])
      return loop.current?.startPack()
    }
    // Keep going from the leg she stopped at (with the stops she'd done), or straight to the map with what she packed
    // last time (the stops cleared on a replay, kept when the trip was saved there).
    const keep = how === 'resume' || saved.at === 'map'
    const ids = parsePacked(saved.packed || DEFAULT_PACKED)
    const st = keep ? parseStops(saved.stops) : []
    setPacked(ids)
    setStops(st)
    state.current = { ...state.current, packed: ids, stops: st }
    const to = how === 'map' ? 'map' : saved.at!
    setTimeout(() => go(to === 'rental' ? { section: 'rental', round: 'key' } : isLoop(to) ? { section: to } : { section: 'map' }), 50)
  }

  /** Back to the map from a stop: its stamp lands there (the trip saves there). */
  const done = (stop: Stop) => () => {
    const next = stops.includes(stop) ? stops : [...stops, stop]
    setStops(next)
    setSaved((p) => ({ ...p, at: 'map', packed: formatPacked(state.current.packed) || p.packed, stops: next.join(',') }))
    setAt({ section: 'map' })
  }
  const finished = () => {
    setSaved((p) => ({ at: null, packed: formatPacked(state.current.packed) || p.packed, stops: '', trips: (p.trips ?? 0) + 1 }))
    onDone?.()
  }

  const passEl = <AnimatePresence>{pass && <BoardingPass key="pass" legs={PASS} done={pass.done} punch={pass.punch} choices={pass.choices} badge="✈️ 🏔️" route="BKK → NNT · 1A 🪟" />}</AnimatePresence>
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#D5DCEA', overflow: 'clip' }}>
      {screen()}
      {passEl}
    </div>
  )

  /** The screen for where she is (called, not mounted as a component: each render keeps the same worlds). */
  function screen() {
    if (isLoop(at.section))
      return (
        <NanLoop
          ref={loop}
          section={at.section}
          packed={packed}
          photos={homePhotos}
          replay={replay}
          covered={!!pass}
          onYes={yes}
          onTrip={(id) => onTrip?.(id)}
          onNotYet={() => onExit?.()}
          onSection={(s) => setAt({ section: s })}
          onLeg={onLeg}
          onPacked={setPacked}
          onDone={finished}
        />
      )
    if (at.section === 'rental') return <Rental key="rental" round={at.round} onRound={(round) => setAt({ section: 'rental', round })} onDone={() => setAt({ section: 'map' })} />
    if (at.section === 'map') return <NanMap key={`map:${stops.join(',')}`} stops={stops} onGo={(place) => setAt(driveTo(place))} />
    if (at.section === 'mushrooms')
      return (
        <Mushrooms
          key="mushrooms"
          round={at.round}
          basket={at.basket}
          onRound={(round, basket) => setAt({ section: 'mushrooms', round, basket })}
          onBasket={(basket) => setAt((a) => (a.section === 'mushrooms' ? { ...a, basket } : a))}
          onMap={done('mushrooms')}
        />
      )
    if (at.section === 'salt') return <Salt key="salt" round={at.round} onRound={(round) => setAt({ section: 'salt', round })} onMap={done('salt')} />
    if (at.section === 'rice') return <Rice key="rice" round={at.round} onRound={(round) => setAt({ section: 'rice', round })} onMap={done('rice')} />
    // The 3 from above is the 3 road's world, parked at the viewpoint (the same Drive, so it doesn't rebuild when the
    // road gets there).
    const three = at.section === 'three'
    return (
      <Drive
        key="drive"
        road={three ? 'three' : at.section === 'drive' ? at.road : 'valley'}
        view={three}
        to={three || at.section !== 'drive' ? '' : at.to}
        onRoad={(road) => setAt({ section: 'drive', road, to: '' })}
        onStop={(road, stop) => {
          const s = (stop ?? (road === 'sky' ? 'rice' : 'mushrooms')) as Stop
          setAt(s === 'salt' ? { section: 'salt', round: '1' } : s === 'rice' ? { section: 'rice', round: 'plant' } : { section: 'mushrooms', round: '1', basket: '' })
        }}
        onMap={() => setAt({ section: 'map' })}
        onView={() => setAt({ section: 'three' })}
        onDrawn={() => setDrew3(true)}
        onHome={() => go({ section: 'home' })}
      />
    )
  }
}

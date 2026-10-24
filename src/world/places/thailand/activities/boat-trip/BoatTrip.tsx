// Captain Kaylee's boat trip (plan: planning/around-the-world/thailand/boat-trip.md). It runs the trip's legs in order,
// each its own 3D world in the shared view:
//
//   invite, pack, goodbye   Agong's own house (activities/hub/house.ts) with the trip's plugin (trip/legs/house-plugin.ts):
//                           Mommy asks (Ask.tsx) by the elephant map, packing (with the suitcase card and ✅ here),
//                           the goodbye at the shutter and Aunty Sri's van
//   airport                 the van pulls away and they're at the airport: the x-ray belt (trip/legs/airport.ts)
//   takeoff, fly, land      the window seat (trip/legs/plane.ts), then Krabi's arrivals arch and the songthaew
//   pier ... sunset         Phang Nga Bay by longtail boat (bay/bay.ts and its parts): the ribbons, open water, the
//                           village, the cave and the hong, the Nail Island photo, the sunset ride back; at the pier her
//                           album opens and a big 🏠 takes them home
//   feed ... splash         Baan Chang Cafe in Krabi (chang/chang.ts, plan: thailand/baan-chang.md), greybox: the
//                           elephants' yard, where she holds bananas and sugarcane out to the trunks; then their
//                           favorites, Lamyai and Khanom's sneaky sips, and the rainbow splash (reached only by their
//                           links until the fork at Krabi is built)
//   race, podium            through the bay's rainbow gate (bay/race-gate.ts), behind a checkered flag: the boat race
//                           in its own lagoon (race/race.ts, its screen race/RaceLayer.tsx), three laps against the
//                           village kids and the macaque; she always wins, lifts the trophy on the podium (it goes in
//                           her Trophy Room and rides in the bow), and 🚤 takes her back out of the gate
//   home                    Agong's house again (the plugin's `home` leg): the flight home, Aunty Sri's van at the door,
//                           the photo she picks (PhotoFan.tsx) goes on Agong's wall (saved on the iPad, trip/wall-photos.ts),
//                           the cousins look up from their phones, and the stamp (onDone)
//
// Everyone speaks in their own recorded voice (lines.ts; trip/legs/Guide.tsx shows the words with who said them, and
// Sparkle in the corner). Between legs the boarding pass slides up and hides the next world being built. From the
// moment the suitcase clicks shut Kaylee wears what she packed, in every leg and in the bay. What she packs (`packed`) rides along the whole
// trip (the URL param, then what she saved); in the bay her ribbons, the stops she visited, her photos and the stickers
// she found ride along in the URL too. The trip saves after each leg (useSaved), and saying yes to Mommy again offers to
// keep going from there; after her first whole trip it offers 🧳 the whole trip again or 🚤 straight to the boat with what
// she packed last time, and the flight is shorter (`replay=1` in a link plays it that way). A `home` link without
// photos from the bay builds the bay behind the boarding pass first and takes a fresh Nail Island photo.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { sounds, useSaved, type Line } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { useLandscape } from '../../../../kit/useLandscape'
import { awardTrophy } from '../../../../../sdk/trophies'
import { L } from '../../lines'
import { Anchors } from '../../engine/Anchors'
import { flag } from '../../engine/flags'
import { View3D, type RenderMode, type World3D } from '../../engine/View3D'
import { ANCHORS as HOUSE_ANCHORS, House } from '../hub/house'
import { AIRPORT_ANCHORS, Airport } from '../../trip/legs/airport'
import { Ask, justSaidYes, saidYes } from '../../trip/legs/Ask'
import { BoardingPass, type PassChoice } from '../../trip/legs/BoardingPass'
import { TripGuide, type TripGuideHandle } from '../../trip/legs/Guide'
import { TRIP_HOUSE_ANCHORS, TripHouse, type HouseLeg, type Phase } from '../../trip/legs/house-plugin'
import { PackCard } from '../../trip/legs/PackCard'
import { PLANE_ANCHORS, PlaneRide, type FlySection } from '../../trip/legs/plane'
import type { LegEvents } from '../../trip/legs/stage'
import { DEFAULT_PACKED, formatPacked, parsePacked } from '../../trip/packing'
import { addWallPhoto, newestByTrip, shrinkPhoto, today, useWallPhotos } from '../../trip/wall-photos'
import { Album, PhotoDrop, StickerFlight, type AlbumPhoto } from './bay/Album'
import { ARROW_ICONS, Bay, BAY_ANCHORS, type BayStart } from './bay/bay'
import { CRITTERS, type CritterId } from './bay/critters'
import type { Phase as BayPhase, PhotoKind, Stop } from './bay/part'
import { PoseButtons } from './bay/PoseButtons'
import { Chang, CHANG_ANCHORS, type ChangSection } from './chang/chang'
import { ChangDebug } from './chang/ChangDebug'
import { Debug } from './Debug'
import { Flat } from './Flat'
import { PhotoFan } from './PhotoFan'
import { Race, RACE_ANCHORS, type RaceHud, type RaceSection } from './race/race'
import { RACE_TROPHY, RaceFlag, RaceLayer } from './race/RaceLayer'
import { askForTilt, needsAsking, steerFor, Tilt, type SteerMode } from './race/tilt'
import { GasPedal } from './race/GasPedal'
import { TiltSetup } from './race/TiltSetup'
import BOAT_SECTIONS, { type BoatSection } from './sections'
import { BOAT_TRIP, PASS, PUNCH, WORLD_OF, type TripWorld } from './trip'

/** Where the trip picks up next time (the start of a leg), and what was in her suitcase. */
interface Progress {
  at: BoatSection | null
  packed: string
  /** Whole trips done, Mommy's question to the photo on Agong's wall (after the first, replays are shorter). */
  trips?: number
}
const RESUME: BoatSection[] = ['goodbye', 'airport', 'takeoff', 'pier']
const RESUME_AT: Partial<Record<BoatSection, BoatSection>> = { fly: 'takeoff', land: 'takeoff', bay: 'pier', village: 'pier', cave: 'pier', hong: 'pier', race: 'pier', podium: 'pier', nail: 'pier', sunset: 'pier' }
const DEFAULT_RIBBONS = BOAT_SECTIONS.params.ribbons.default
/** A comma list from the URL, kept to the values it may have. */
const list = <T extends string>(s: string | null, ok: readonly T[]) => (s ?? '').split(',').filter((x): x is T => (ok as readonly string[]).includes(x))
const STOPS: Stop[] = ['village', 'cave', 'race']
const KINDS: PhotoKind[] = ['village', 'hong', 'nail']
const GLOWS = Object.keys(ARROW_ICONS)

/** The trip's flight (the plane leg flies its route). */
const FLIGHT = BOAT_TRIP.legs.find((l) => l.kind === 'fly') as { from: [number, number]; to: [number, number] }

/** The boarding pass's leg for a section (the bay's sections are all the boat). */
const legOf = (s: BoatSection) => PUNCH[s] ?? (WORLD_OF[s] === 'bay' ? 'pier' : null)
/** The legs already punched before `next` (leaving out the one being punched now). */
function doneBefore(next: BoatSection, punch: string | null) {
  const upto = PASS.findIndex((p) => p.id === legOf(next))
  return PASS.slice(0, Math.max(0, upto)).map((p) => p.id).filter((id) => id !== punch)
}

const ANCHORS_OF: Record<TripWorld, typeof BAY_ANCHORS> = {
  // (No name pills on the trip: the whole family crowds round at the goodbye and coming home, and the guide's bubble
  // says who's talking.)
  house: [...HOUSE_ANCHORS.map((a) => ({ ...a, name: undefined, thai: undefined })), ...TRIP_HOUSE_ANCHORS],
  airport: AIRPORT_ANCHORS,
  plane: PLANE_ANCHORS,
  bay: BAY_ANCHORS,
  race: RACE_ANCHORS,
  chang: CHANG_ANCHORS,
}

export function BoatTrip({ onExit, onDone }: { onExit: () => void; onDone: () => void }) {
  const { start, enter } = useSections(BOAT_SECTIONS)
  const [stored, setSaved] = useSaved<Progress>('thailand-boat-trip', { at: null, packed: DEFAULT_PACKED })
  // A trip saved before a leg was cut (Aunty Sri's car ride) starts over.
  const saved = stored.at && !(stored.at in WORLD_OF) ? { ...stored, at: null } : stored
  const first: BoatSection = start ?? 'invite'
  // She has been on the whole trip before (or the link says so): replays go straight to the fun.
  const [replay] = useState(() => flag('replay') === '1' || (saved.trips ?? 0) > 0)
  const [wallPhotos, setWallPhotos] = useWallPhotos()
  // A `packed` link sets what's in the suitcase; otherwise a new packing starts empty and later legs use what she
  // packed last time.
  const [packed, setPacked] = useState<string[]>(() => {
    const url = flag('packed')
    return parsePacked(url ?? (first === 'invite' || first === 'pack' ? '' : saved.packed))
  })
  const [section, setSection] = useState<BoatSection>(first)
  // A `home` link: the bay builds first (behind the boarding pass) to take her photos, then home.
  const prep = useRef(first === 'home')
  const [mount, setMount] = useState<{ world: TripWorld; section: BoatSection; key: number }>(() => (prep.current ? { world: 'bay', section: 'nail', key: 0 } : { world: WORLD_OF[first], section: first, key: 0 }))
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [pass, setPass] = useState<{ punch: string | null; done: string[]; choices?: PassChoice[]; flag?: boolean } | null>(() => (prep.current ? { punch: null, done: PASS.map((p) => p.id).filter((id) => id !== 'home') } : null))
  /** Back at the pier at sunset: the way home is open. */
  const [atPier, setAtPier] = useState(false)
  const [landed, setLanded] = useState(false)
  const [phase, setPhase] = useState<Phase | null>(null)
  // Her photos fan out once Agong has asked for his (the fan would cover his words).
  const [fanReady, setFanReady] = useState(false)
  useEffect(() => {
    if (phase !== 'pick') return setFanReady(false)
    const t = setTimeout(() => setFanReady(true), 2000)
    return () => clearTimeout(t)
  }, [phase])
  const [flash, setFlash] = useState(0)
  // The bay: her ribbons, the stops she's been to, the album's photos and stickers.
  const [ribbons, setRibbons] = useState<string[]>(() => list(flag('ribbons'), ['pink', 'butter', 'mint', 'sky', 'lavender', 'hotpink']).slice(0, 3))
  const tied = useRef(flag('ribbons') !== null)
  // (A podium link: she has won the race.)
  const [stops, setStops] = useState<Stop[]>(() => [...new Set([...list(flag('stops'), STOPS), ...(first === 'podium' ? (['race'] as Stop[]) : [])])])
  const [photos, setPhotos] = useState<AlbumPhoto[]>([])
  const [found, setFound] = useState<CritterId[]>(() => list(flag('found'), CRITTERS))
  // Baan Chang: how many foods the elephants have had (a link's bellies are that round).
  const [fed, setFed] = useState(() => Math.max(0, Math.floor(Number(flag('fed') ?? 0)) || 0))
  const [albumOpen, setAlbumOpen] = useState(false)
  const [bump, setBump] = useState(0)
  const [flights, setFlights] = useState<{ key: number; id: CritterId; x: number; y: number }[]>([])
  const [drops, setDrops] = useState<{ key: number; src: string }[]>([])
  const guideRef = useRef<TripGuideHandle>(null)
  // The boat race: what its screen shows, the minimap's dots, and whether the bay is being built for the way back out
  // of its gate.
  const [raceHud, setRaceHud] = useState<RaceHud | null>(null)
  const mapEls = useRef(new Map<string, SVGElement>())
  const fromRace = useRef(false)
  /** Races won this visit (a rematch skips the kids' "race you!"). */
  const raced = useRef(0)
  // A race link's lap (read once: the address bar drops it as soon as the trip starts).
  const [lapLink] = useState(() => Number(flag('lap') ?? 1))
  const arrowEls = useRef(new Map<string, HTMLElement>())
  // A link into the bay with photos: they're staged and taken when the bay is first built (a `home` link's and a
  // `sunset` link's too, with at least the Nail Island's, so there's always one to give Agong).
  const linkPhotos = useRef(((): PhotoKind[] => {
    const asked = list(flag('photos'), KINDS)
    if (asked.length || (!prep.current && start !== 'sunset')) return WORLD_OF[start ?? 'invite'] === 'bay' || prep.current ? asked : []
    return ['nail']
  })())
  const prepWant = useRef(linkPhotos.current.length)
  const worldRef = useRef<World3D | null>(null)
  const tripRef = useRef<TripHouse | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const state = useRef({ section, packed, mount, busy: false, saved, ribbons, stops, photos, found, fed })
  state.current = { ...state.current, section, packed, mount, saved, ribbons, stops, photos, found, fed }
  // Read once: the address bar follows her and drops ?debug=1.
  const [debug] = useState(() => flag('debug') !== null)
  // Driving the longtail on a phone (race/tilt.ts), in the bay and in the boat race alike: held sideways, tilt to
  // steer, with a gas pedal. The first time she's at the wheel, the phone turned sideways (or ▶ to play upright) and,
  // on iOS, a tap to allow the tilt; a no there, or a phone that sends no tilt, drives with the finger as on the iPad.
  // A link's `steer=tilt` / `steer=finger` tries either anywhere (on a computer, ← → steer and the space bar is the
  // gas).
  const [steerLink] = useState(() => flag('steer'))
  const [steer, setSteer] = useState<SteerMode>(() => steerFor(steerLink))
  const [tiltAllowed, setTiltAllowed] = useState(() => !needsAsking())
  const [upright, setUpright] = useState(false)
  const landscape = useLandscape()
  const tiltRef = useRef<Tilt | null>(null)
  const tilting = steer === 'tilt' && tiltAllowed
  const steerRef = useRef(tilting)
  steerRef.current = tilting
  // The bay's phase (the gas pedal shows while she's driving, not boarding, on the beach or docked).
  const [bayPhase, setBayPhase] = useState<BayPhase>('drive')
  const boating = mount.world === 'race' || mount.world === 'bay'
  const atWheel =
    mode === 'webgl' && !pass && ((mount.world === 'race' && !!raceHud && raceHud.phase !== 'podium') || (mount.world === 'bay' && bayPhase === 'drive'))
  const tiltSetup: 'turn' | 'ask' | null = steer !== 'tilt' || !atWheel ? null : !landscape && !upright ? 'turn' : !tiltAllowed ? 'ask' : null
  useEffect(() => {
    if (!tilting || !boating) return
    const t = (tiltRef.current ??= new Tilt())
    t.start()
    const check = setTimeout(() => {
      if (!t.live && steerLink !== 'tilt') setSteer('finger')
    }, 1500)
    return () => {
      clearTimeout(check)
      t.stop()
    }
  }, [tilting, boating, mount.key])
  useEffect(() => {
    const w = worldRef.current
    if (w instanceof Race || w instanceof Bay) w.setSteer(tilting ? 'tilt' : 'finger', tiltRef.current)
  }, [tilting, mount.key])
  useEffect(() => {
    const w = worldRef.current
    if (w instanceof Race || w instanceof Bay) w.setWaiting(!!tiltSetup)
  }, [tiltSetup, mount.key])

  const params = (ids: string[]) => {
    const st = state.current
    return {
      packed: formatPacked(ids) || DEFAULT_PACKED,
      ribbons: st.ribbons.length ? st.ribbons.join(',') : DEFAULT_RIBBONS,
      stops: st.stops.join(','),
      photos: [...new Set(st.photos.map((p) => p.kind).filter((k) => k !== 'selfie' && k !== 'race'))].join(','),
      found: st.found.join(','),
      fed: WORLD_OF[st.section] === 'chang' ? String(st.fed) : undefined,
      replay: replay ? '1' : '',
    }
  }
  useEffect(() => enter(first, first === 'invite' ? (replay ? { replay: '1' } : {}) : params(packed)), [])
  // The address bar keeps up with what she's done in the bay.
  const ready = useRef(false)
  useEffect(() => {
    if (!ready.current) {
      ready.current = true
      return
    }
    const world = WORLD_OF[state.current.section]
    if (world === 'bay' || world === 'chang') enter(state.current.section, params(state.current.packed))
  }, [ribbons, stops, photos, found, fed])

  // Someone says something, out loud (Sparkle in the corner shows the words for Dad). Not while the bay is only
  // building behind the boarding pass for a `home` link.
  const say = (l: Line) => !prep.current && guideRef.current?.speak(l)

  const moveTo = (s: BoatSection) => {
    if (prep.current) return
    setSection(s)
    enter(s, s === 'invite' ? {} : params(state.current.packed))
  }

  /** A leg is over: the boarding pass slides up (punching that leg), the next world is built behind it, and it goes.
   *  In and out of the boat race, a checkered flag instead. */
  const finish = (next: BoatSection, punchLeg?: string | null, flagCover = false) => {
    const st = state.current
    if (st.busy) return
    st.busy = true
    const from = st.section
    const punch = punchLeg !== undefined ? punchLeg : legOf(from)
    setPass({ punch, done: doneBefore(next, punch), flag: flagCover })
    if (WORLD_OF[next] !== 'race') setRaceHud(null)
    // (Kept until the next leg: React may build a world twice in development.)
    if (next !== 'bay') fromRace.current = false
    const at = RESUME.includes(next) ? next : (RESUME_AT[next] ?? null)
    if (at) setSaved((p) => ({ ...p, at, packed: formatPacked(st.packed) }))
    const old = worldRef.current
    setTimeout(() => {
      const world = WORLD_OF[next]
      if (world === st.mount.world && world === 'house') tripRef.current?.goTo(next as HouseLeg)
      else setMount((m) => ({ world, section: next, key: m.key + 1 }))
      setLanded(false)
      prep.current = false
      moveTo(next)
      // Away once the new world has drawn its first frame (or after a while, whatever happens).
      const t0 = performance.now()
      const wait = setInterval(() => {
        const w = worldRef.current
        const ready = w && (w !== old || world === 'house') && w.stats.fps > 0
        if ((ready && performance.now() - t0 > 700) || performance.now() - t0 > 2600) {
          clearInterval(wait)
          setPass(null)
          state.current.busy = false
        }
      }, 100)
    }, 900)
  }

  /** She said yes to Mommy: straight to packing; or, with a trip half done or after her first whole trip, where to
   *  start (🧳 a new trip, the next leg's icon to keep going, 🚤 straight to the boat). */
  const yes = () => {
    if (state.current.busy) return
    const at = state.current.saved.at
    const half = at && at !== 'pack' ? at : null
    if (!half && !replay) {
      tripRef.current?.startPack()
      return
    }
    const choices: PassChoice[] = [{ label: 'A new trip', icon: '🧳', on: () => choose('again') }]
    if (half && half !== 'pier') choices.push({ label: 'Keep going', icon: PASS.find((p) => p.id === legOf(half))?.icon ?? '🧳', on: () => choose('resume') })
    if (replay || half === 'pier') choices.push({ label: 'Straight to the boat', icon: '🚤', on: () => choose('boat') })
    setPass({ punch: null, done: half ? doneBefore(half, null) : [], choices })
    if (choices.length > 1 && choices.at(-1)!.icon === '🚤') setTimeout(() => say(L.home.again), 600)
  }
  // Mommy asks in her room (the trip's first section); a yes back in the house goes straight on to packing.
  const asking = mode === 'webgl' && section === 'invite' && phase === 'invite' && !pass
  useEffect(() => {
    if (phase !== 'invite' || !justSaidYes()) return
    saidYes.at = 0
    const t = setTimeout(yes, 300)
    return () => clearTimeout(t)
  }, [phase])

  const choose = (how: 'again' | 'resume' | 'boat') => {
    sounds.pop()
    if (how === 'again') {
      setPass(null)
      setPacked([])
      tripRef.current?.startPack()
      return
    }
    // Keep going from the leg she stopped at, or straight to the pier with what she packed last time.
    const at = how === 'boat' ? 'pier' : state.current.saved.at!
    setPacked(parsePacked(state.current.saved.packed))
    state.current.packed = parsePacked(state.current.saved.packed)
    setPass(null)
    setTimeout(() => finish(at), 50)
  }

  const t0 = useRef(performance.now())
  /** Back at the pier at sunset: the boarding pass's last punch, then her album opens by itself. */
  const docked = () => {
    sounds.sparkle()
    setPass({ punch: 'pier', done: PASS.map((p) => p.id).filter((id) => id !== 'pier') })
    setTimeout(() => {
      setPass(null)
      setAlbumOpen(true)
      setAtPier(true)
    }, 2400)
  }

  // At the pier, nothing done for ~8 s: Sparkle points her home (the ✈️🏠 is the only cue there, no finger on the boat).
  // Twice at most; a finger held down (driving back out for more sunset) counts as playing.
  useEffect(() => {
    if (!atPier || mount.world !== 'bay') return
    let last = performance.now()
    let down = false
    let said = 0
    const press = () => ((down = true), (last = performance.now()))
    const lift = () => ((down = false), (last = performance.now()))
    window.addEventListener('pointerdown', press)
    window.addEventListener('pointerup', lift)
    window.addEventListener('pointercancel', lift)
    const id = setInterval(() => {
      if (down) last = performance.now()
      if (said >= 2 || performance.now() - last < 8000) return
      last = performance.now() + 12000
      said++
      say(L.home.fly)
    }, 1000)
    return () => {
      window.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', lift)
      window.removeEventListener('pointercancel', lift)
      clearInterval(id)
    }
  }, [atPier, mount.world])

  /** The big 🏠 at the pier: the boarding pass, then the flight home and Aunty Sri's van at Agong's door. */
  const goHome = () => {
    if (!atPier) return
    sounds.pop()
    setAtPier(false)
    setAlbumOpen(false)
    finish('home', null)
  }

  // Home: the photo she picked goes on Agong's wall (saved on the iPad), the trip counts as done, then the stamp.
  const chosen = useRef<string | null>(null)
  const finished = useRef(false)
  useEffect(() => {
    if (section !== 'home') return
    if (phase === 'gather' && chosen.current && !finished.current) {
      finished.current = true
      const src = chosen.current
      void shrinkPhoto(src).then((small) => setWallPhotos((list) => addWallPhoto(list, { trip: 'boat-trip', src: small, at: today() })))
      setSaved((p) => ({ at: null, packed: formatPacked(state.current.packed) || p.packed, trips: (p.trips ?? 0) + 1 }))
    }
    if (phase === 'home') {
      const t = setTimeout(onDone, 1800)
      return () => clearTimeout(t)
    }
  }, [phase, section])
  // Without WebGL the picture book has its own pages (nothing to build behind a boarding pass).
  useEffect(() => {
    if (mode !== 'flat' || !prep.current) return
    prep.current = false
    setPass(null)
  }, [mode])
  // A `home` link: once the bay has taken the photos it was asked for, on home.
  useEffect(() => {
    if (prep.current && prepWant.current && photos.length >= prepWant.current) finish('home', null)
  }, [photos])

  const leg: LegEvents & { flash(): void } = {
    say,
    section: (s) => moveTo(s as BoatSection),
    done: (next) => finish(next as BoatSection),
    flash: () => setFlash((n) => n + 1),
  }

  const make = (renderer: WebGLRenderer): World3D => {
    const { world, section: s } = state.current.mount
    const items = state.current.packed
    let w: World3D & { setHintElement?(el: HTMLElement | null): void }
    if (world === 'house') {
      const trip = new TripHouse(s as HouseLeg, items, {
        say,
        phase: setPhase,
        section: (x) => moveTo(x),
        done: (next) => finish(next as BoatSection),
        packed: (ids) => {
          state.current.packed = ids
          setPacked(ids)
          enter(state.current.section, params(ids))
        },
        flash: () => setFlash((n) => n + 1),
      }, BOAT_TRIP, replay)
      tripRef.current = trip
      trip.setHintElement(() => hintRef.current)
      // Coming home: last trip's photo is still on the wall, until Agong hangs the new one.
      trip.setWall(newestByTrip(wallPhotos).get('boat-trip')?.src ?? null)
      w = new House(renderer, { section: s === 'goodbye' || s === 'home' ? 'street' : 'upstairs' }, { onSpot: () => {}, onArrived: () => {} }, trip)
    } else if (world === 'airport') w = new Airport(renderer, leg, items)
    else if (world === 'plane') w = new PlaneRide(renderer, leg, s as FlySection, items, FLIGHT, replay ? (BOAT_TRIP.caps.replayFly ?? BOAT_TRIP.caps.fly) : BOAT_TRIP.caps.fly)
    else if (world === 'chang') w = new Chang(renderer, { ...leg, fed: setFed }, s as ChangSection, items, state.current.fed)
    else if (world === 'race') {
      const st = state.current
      // A link's `lap` counts for the first race only (a rematch starts at lap 1).
      const lap = raced.current === 0 && start === 'race' ? lapLink : 1
      const race = new Race(renderer, { section: s as RaceSection, packed: items, ribbons: st.ribbons.length ? st.ribbons : DEFAULT_RIBBONS.split(','), lap, again: raced.current > 0 }, {
        onSection: (x) => moveTo(x),
        say,
        onHud: setRaceHud,
        onWin: () => {
          raced.current++
          setStops((x) => (x.includes('race') ? x : [...x, 'race']))
          // Her race trophy goes in the Trophy Room (the same as a game's: KAYLEE on it, ×2 after a rematch).
          awardTrophy({ gameId: 'world-thailand-boat-race', gameTitle: 'Thailand', trophyTitle: RACE_TROPHY, emoji: '🚤' })
        },
        onPhoto: (src) => {
          setPhotos((ps) => [...ps, { n: (ps[ps.length - 1]?.n ?? 0) + 1, kind: 'race' as const, src }].slice(-12))
          setDrops((d) => [...d, { key: performance.now(), src }])
        },
        onFlash: () => setFlash((n) => n + 1),
      })
      race.setMapElements(mapEls.current)
      race.setSteer(steerRef.current ? 'tilt' : 'finger', (tiltRef.current ??= new Tilt()))
      w = race
    } else {
      const st = state.current
      // (Kept until they're taken: a bay built twice, as React does in development, takes them in the second one.)
      const staged = linkPhotos.current
      const start: BayStart = {
        section: s,
        packed: items,
        ribbons: s === 'pier' && !tied.current ? null : st.ribbons.length ? st.ribbons : DEFAULT_RIBBONS.split(','),
        stops: st.stops,
        photos: staged,
        album: st.photos.map((p) => p.kind),
        found: st.found,
        from: fromRace.current ? 'race' : undefined,
      }
      const bay = new Bay(renderer, start, {
        onSection: (x) => moveTo(x),
        say,
        onFound: (id, x, y) => {
          setFound((f) => (f.includes(id) ? f : [...f, id]))
          setFlights((f) => [...f, { key: performance.now() + Math.random(), id, x, y }])
        },
        onPhoto: (kind, src) => {
          linkPhotos.current = linkPhotos.current.filter((k) => k !== kind)
          setPhotos((ps) => {
            const n = (ps[ps.length - 1]?.n ?? 0) + 1
            let next = [...ps, { n, kind, src }]
            // At most 12: the oldest selfie goes first, then the oldest photo.
            while (next.length > 12) {
              const i = next.findIndex((p) => p.kind === 'selfie')
              next = next.filter((_, k) => k !== (i >= 0 && i < next.length - 1 ? i : 0))
            }
            return next
          })
          // A deep link's staged photos go straight in (a `home` link's quietly); new ones print out big first.
          if (prep.current) return
          if (staged.includes(kind) && performance.now() - t0.current < 4000) setBump((b) => b + 1)
          else setDrops((d) => [...d, { key: performance.now(), src }])
        },
        onStops: (x) => setStops(x),
        onRibbons: (x) => {
          tied.current = true
          setRibbons(x)
        },
        onLanded: setLanded,
        onFlash: () => setFlash((n) => n + 1),
        onDocked: docked,
        onRace: () => finish('race', null, true),
        onPhase: setBayPhase,
      })
      bay.setArrowElements(arrowEls.current)
      bay.setSteer(steerRef.current ? 'tilt' : 'finger', (tiltRef.current ??= new Tilt()))
      setBayPhase(bay.phase)
      w = bay
    }
    w.setHintElement?.(hintRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#A8DCFF', overflow: 'clip' }}>
      {mode === 'flat' ? (
        <Flat
          section={section}
          packed={packed}
          onPacked={(ids) => {
            state.current.packed = ids
            setPacked(ids)
            enter(state.current.section, params(ids))
          }}
          onSection={(s) => moveTo(s)}
          onDone={() => {
            // The picture book's whole trip counts too (the next time, the 🚤 replay).
            setSaved((p) => ({ at: null, packed: formatPacked(state.current.packed) || p.packed, trips: (p.trips ?? 0) + 1 }))
            onDone?.()
          }}
        />
      ) : (
        <View3D
          key={mount.key}
          name={`The boat trip (${mount.world})`}
          qaKey="__thaiBoatQA"
          worldRef={worldRef}
          onMode={setMode}
          make={make}
          anchors={(input, els) => (
            <>
              <Anchors list={ANCHORS_OF[mount.world]} els={els} {...input} />
              {/* The bay: arrows at the screen's edge toward glows that are off screen. */}
              {mount.world === 'bay' &&
                GLOWS.map((g) => (
                  <div
                    key={g}
                    role="button"
                    aria-label={`Go to: ${g}`}
                    ref={(el) => {
                      if (el) arrowEls.current.set(g, el)
                      else arrowEls.current.delete(g)
                    }}
                    // Tap the badge: the boat sets off there.
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      sounds.pop()
                      worldRef.current?.tap(0, 0, `glow:${g}`)
                    }}
                    style={{ position: 'absolute', left: 0, top: 0, display: 'none', zIndex: 19000, cursor: 'pointer' }}
                  >
                    {/* The pointer (bay.ts turns it toward the glow), then the glow's little badge. */}
                    <div style={{ position: 'absolute', left: -34, top: -34, width: 68, height: 68 }}>
                      <div style={{ position: 'absolute', left: 22, top: -18, width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderBottom: '18px solid #fff' }} />
                    </div>
                    <div style={{ position: 'absolute', left: -34, top: -34, width: 68, height: 68, display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'rgba(255,200,61,.9)', border: '4px solid #fff', boxShadow: '0 0 16px 4px rgba(255,200,61,.6)', fontSize: 30 }}>{ARROW_ICONS[g]}</div>
                  </div>
                ))}
              {/* After a while with nothing touched: a finger pressing where to touch. */}
              <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
                <motion.div
                  animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                  style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}
                >
                  👆
                </motion.div>
              </div>
            </>
          )}
        />
      )}
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setMount((m) => ({ ...m, section: state.current.section, key: m.key + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(168,220,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🚤 Tap to wake the trip
        </button>
      )}
      {mount.world === 'bay' && mode === 'webgl' && (
        <>
          <PoseButtons show={landed && !pass && !albumOpen} onPose={(p) => (worldRef.current as Bay | null)?.pose(p)} />
          {tilting && bayPhase === 'drive' && !pass && !albumOpen && <GasPedal nudgeAfter={8} onGas={(down) => (worldRef.current as Bay | null)?.gas(down)} />}
          <Album
            photos={photos}
            found={found}
            open={albumOpen}
            bump={bump}
            onOpen={() => setAlbumOpen(true)}
            onClose={() => setAlbumOpen(false)}
            onFact={(l) => guideRef.current?.speak(l)}
          />
          {flights.map((f) => (
            <StickerFlight
              key={f.key}
              id={f.id}
              x={f.x}
              y={f.y}
              onDone={() => {
                setFlights((all) => all.filter((x) => x.key !== f.key))
                setBump((b) => b + 1)
              }}
            />
          ))}
        </>
      )}
      {(mount.world === 'bay' || mount.world === 'race') &&
        mode === 'webgl' &&
        drops.map((d) => (
          <PhotoDrop
            key={d.key}
            src={d.src}
            onDone={() => {
              setDrops((all) => all.filter((x) => x.key !== d.key))
              setBump((b) => b + 1)
            }}
          />
        ))}
      {mount.world === 'race' && mode === 'webgl' && raceHud && !pass && (
        <RaceLayer
          hud={raceHud}
          mapEls={mapEls.current}
          onGas={tilting ? (down) => (worldRef.current as Race | null)?.gas(down) : undefined}
          onAgain={() => {
            sounds.pop()
            finish('race', null, true)
          }}
          onBay={() => {
            sounds.pop()
            fromRace.current = true
            finish('bay', null, true)
          }}
        />
      )}
      {/* At the pier at sunset: home (also inside the album that opens there). */}
      <AnimatePresence>
        {mount.world === 'bay' && atPier && !pass && mode === 'webgl' && (
          <motion.button
            key="home"
            aria-label="Fly home"
            initial={{ scale: 0, y: 40 }}
            animate={{ scale: [1, 1.08, 1], y: 0 }}
            exit={{ scale: 0, transition: { duration: 0.2 } }}
            transition={{ scale: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' }, y: { type: 'spring' } }}
            whileTap={{ scale: 0.9 }}
            onClick={goHome}
            style={{ position: 'absolute', left: '50%', bottom: 'calc(var(--safe-bottom) + 18px)', translate: albumOpen ? '64px 0' : '-50% 0', minWidth: 'clamp(120px, 22vw, 170px)', height: 'clamp(88px, 13vmin, 110px)', borderRadius: 999, border: '5px solid #fff', background: 'var(--butter)', fontSize: 'clamp(40px, 7vmin, 56px)', boxShadow: '0 0 0 6px rgba(255,79,154,.45), var(--shadow)', zIndex: albumOpen ? 61 : 33, padding: '0 20px' }}
          >
            ✈️🏠
          </motion.button>
        )}
      </AnimatePresence>
      {/* On the plane: skip ahead (the cabin to the landing, the landing to Krabi) if the ride gets long. */}
      {mount.world === 'plane' && !pass && mode === 'webgl' && (
        <motion.button
          aria-label="Skip ahead"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            sounds.whoosh()
            ;(worldRef.current as PlaneRide | null)?.skip()
          }}
          style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 18px)', bottom: 'calc(var(--safe-bottom) + 18px)', width: 'clamp(88px, 12vmin, 104px)', height: 'clamp(88px, 12vmin, 104px)', borderRadius: '50%', border: '5px solid #fff', background: 'var(--lavender)', fontSize: 'clamp(36px, 6vmin, 48px)', boxShadow: 'var(--shadow)', zIndex: 33, padding: 0 }}
        >
          ⏩
        </motion.button>
      )}
      <PhotoFan
        photos={photos}
        open={mount.world === 'house' && section === 'home' && phase === 'pick' && fanReady && !pass}
        onPick={(p) => {
          chosen.current = p.src
          tripRef.current?.choose(p.src)
        }}
      />
      {mode === 'webgl' && <TripGuide ref={guideRef} hidden={!!pass || asking} raised={(mount.world === 'bay' && landed) || (mount.world === 'race' && raceHud?.phase === 'podium')} idle={tilting ? undefined : mount.world === 'bay' ? L.bay.hint.drive : mount.world === 'race' ? L.race.start : undefined} />}
      <TiltSetup
        stage={tiltSetup}
        onSkip={() => {
          sounds.pop()
          setUpright(true)
        }}
        onAsk={() => {
          // (Asked straight from the tap: iOS won't ask otherwise.)
          void askForTilt().then((ok) => {
            sounds.pop()
            if (ok) setTiltAllowed(true)
            else setSteer('finger')
          })
        }}
      />
      <Ask open={asking} onYes={yes} onNotYet={onExit} />
      <PackCard open={!pass && mount.world === 'house' && (phase === 'pack' || phase === 'sitting')} packed={packed} sitting={phase === 'sitting'} onClose={() => tripRef.current?.closeTap()} />
      <AnimatePresence>
        {flash > 0 && (
          <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 40 }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pass &&
          (pass.flag ? (
            <RaceFlag key="flag" />
          ) : (
            <BoardingPass
              legs={PASS}
              done={pass.done}
              punch={pass.punch}
              choices={pass.choices}
            />
          ))}
      </AnimatePresence>
      {debug && mount.world === 'bay' && <Debug bayRef={worldRef as never} />}
      {debug && mount.world === 'chang' && <ChangDebug changRef={worldRef as never} />}
    </div>
  )
}


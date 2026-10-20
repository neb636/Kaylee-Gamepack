// Captain Kaylee's boat trip (plan: planning/around-the-world/thailand/boat-trip.md). It runs the trip's legs in order,
// each its own 3D world in the shared view:
//
//   invite, pack, goodbye   Agong's own house (activities/hub/house.ts) with the trip's plugin (trip/legs/house-plugin.ts):
//                           Mommy asks (Ask.tsx) by the elephant map, packing (with the suitcase card and ✅ here),
//                           the goodbye at the shutter and Aunty Sri's van
//   airport                 the van pulls away and they're at the airport: the x-ray belt (trip/legs/airport.ts)
//   takeoff, fly, land      the window seat (trip/legs/plane.ts), then Krabi's arrivals arch and the songthaew
//   pier ... sunset         Phang Nga Bay by longtail boat (bay/bay.ts and its parts): the ribbons, open water, the
//                           village, the cave and the hong, the Nail Island photo, the sunset ride back
//
// Everyone speaks in their own recorded voice (lines.ts; trip/legs/Guide.tsx shows the words with who said them, and
// Sparkle in the corner). Between legs the boarding pass slides up and hides the next world being built. From the
// moment the suitcase clicks shut Kaylee wears what she packed, in every leg and in the bay. What she packs (`packed`) rides along the whole
// trip (the URL param, then what she saved); in the bay her ribbons, the stops she visited, her photos and the stickers
// she found ride along in the URL too. The trip saves after each leg (useSaved), and saying yes to Mommy again offers to
// keep going from there.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { sounds, useSaved, type Line } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { L } from '../../lines'
import { Anchors } from '../../engine/Anchors'
import { flag } from '../../engine/flags'
import { View3D, type RenderMode, type World3D } from '../../engine/View3D'
import { ANCHORS as HOUSE_ANCHORS, House } from '../hub/house'
import { AIRPORT_ANCHORS, Airport } from '../../trip/legs/airport'
import { Ask, justSaidYes, saidYes } from '../../trip/legs/Ask'
import { BoardingPass } from '../../trip/legs/BoardingPass'
import { TripGuide, type TripGuideHandle } from '../../trip/legs/Guide'
import { TRIP_HOUSE_ANCHORS, TripHouse, type HouseLeg, type Phase } from '../../trip/legs/house-plugin'
import { PackCard } from '../../trip/legs/PackCard'
import { PLANE_ANCHORS, PlaneRide, type FlySection } from '../../trip/legs/plane'
import type { LegEvents } from '../../trip/legs/stage'
import { DEFAULT_PACKED, formatPacked, parsePacked } from '../../trip/packing'
import { Album, PhotoDrop, StickerFlight, type AlbumPhoto } from './bay/Album'
import { ARROW_ICONS, Bay, BAY_ANCHORS, type BayStart } from './bay/bay'
import { CRITTERS, type CritterId } from './bay/critters'
import type { PhotoKind, Stop } from './bay/part'
import { PoseButtons } from './bay/PoseButtons'
import { Debug } from './Debug'
import { Flat } from './Flat'
import BOAT_SECTIONS, { type BoatSection } from './sections'
import { BOAT_TRIP, PASS, PUNCH, WORLD_OF, type TripWorld } from './trip'

/** Where the trip picks up next time (the start of a leg), and what was in her suitcase. */
interface Progress {
  at: BoatSection | null
  packed: string
}
const RESUME: BoatSection[] = ['goodbye', 'airport', 'takeoff', 'pier']
const RESUME_AT: Partial<Record<BoatSection, BoatSection>> = { fly: 'takeoff', land: 'takeoff', bay: 'pier', village: 'pier', cave: 'pier', hong: 'pier', nail: 'pier', sunset: 'pier' }
const DEFAULT_RIBBONS = BOAT_SECTIONS.params.ribbons.default
/** A comma list from the URL, kept to the values it may have. */
const list = <T extends string>(s: string | null, ok: readonly T[]) => (s ?? '').split(',').filter((x): x is T => (ok as readonly string[]).includes(x))
const STOPS: Stop[] = ['village', 'cave']
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
  house: [...HOUSE_ANCHORS, ...TRIP_HOUSE_ANCHORS],
  airport: AIRPORT_ANCHORS,
  plane: PLANE_ANCHORS,
  bay: BAY_ANCHORS,
}

export function BoatTrip({ onExit }: { onExit: () => void }) {
  const { start, enter } = useSections(BOAT_SECTIONS)
  const [stored, setSaved] = useSaved<Progress>('thailand-boat-trip', { at: null, packed: DEFAULT_PACKED })
  // A trip saved before a leg was cut (Aunty Sri's car ride) starts over.
  const saved = stored.at && !(stored.at in WORLD_OF) ? { ...stored, at: null } : stored
  const first: BoatSection = start ?? 'invite'
  // A `packed` link sets what's in the suitcase; otherwise a new packing starts empty and later legs use what she
  // packed last time.
  const [packed, setPacked] = useState<string[]>(() => {
    const url = flag('packed')
    return parsePacked(url ?? (first === 'invite' || first === 'pack' ? '' : saved.packed))
  })
  const [section, setSection] = useState<BoatSection>(first)
  const [mount, setMount] = useState<{ world: TripWorld; section: BoatSection; key: number }>({ world: WORLD_OF[first], section: first, key: 0 })
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [pass, setPass] = useState<{ punch: string | null; done: string[]; choice?: boolean } | null>(null)
  const [landed, setLanded] = useState(false)
  const [phase, setPhase] = useState<Phase | null>(null)
  const [flash, setFlash] = useState(0)
  // The bay: her ribbons, the stops she's been to, the album's photos and stickers.
  const [ribbons, setRibbons] = useState<string[]>(() => list(flag('ribbons'), ['pink', 'butter', 'mint', 'sky', 'lavender', 'hotpink']).slice(0, 3))
  const tied = useRef(flag('ribbons') !== null)
  const [stops, setStops] = useState<Stop[]>(() => list(flag('stops'), STOPS))
  const [photos, setPhotos] = useState<AlbumPhoto[]>([])
  const [found, setFound] = useState<CritterId[]>(() => list(flag('found'), CRITTERS))
  const [albumOpen, setAlbumOpen] = useState(false)
  const [bump, setBump] = useState(0)
  const [flights, setFlights] = useState<{ key: number; id: CritterId; x: number; y: number }[]>([])
  const [drops, setDrops] = useState<{ key: number; src: string }[]>([])
  const guideRef = useRef<TripGuideHandle>(null)
  const arrowEls = useRef(new Map<string, HTMLElement>())
  // A link into the bay with photos: they're staged and taken when the bay is first built.
  const linkPhotos = useRef(WORLD_OF[start ?? 'invite'] === 'bay' ? list(flag('photos'), KINDS) : [])
  const worldRef = useRef<World3D | null>(null)
  const tripRef = useRef<TripHouse | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const state = useRef({ section, packed, mount, busy: false, saved, ribbons, stops, photos, found })
  state.current = { ...state.current, section, packed, mount, saved, ribbons, stops, photos, found }
  // Read once: the address bar follows her and drops ?debug=1.
  const [debug] = useState(() => flag('debug') !== null)

  const params = (ids: string[]) => {
    const st = state.current
    return {
      packed: formatPacked(ids) || DEFAULT_PACKED,
      ribbons: st.ribbons.length ? st.ribbons.join(',') : DEFAULT_RIBBONS,
      stops: st.stops.join(','),
      photos: [...new Set(st.photos.map((p) => p.kind).filter((k) => k !== 'selfie'))].join(','),
      found: st.found.join(','),
    }
  }
  useEffect(() => enter(first, first === 'invite' ? {} : params(packed)), [])
  // The address bar keeps up with what she's done in the bay.
  const ready = useRef(false)
  useEffect(() => {
    if (!ready.current) {
      ready.current = true
      return
    }
    if (WORLD_OF[state.current.section] === 'bay') enter(state.current.section, params(state.current.packed))
  }, [ribbons, stops, photos, found])

  // Someone says something, out loud (Sparkle in the corner shows the words for Dad).
  const say = (l: Line) => guideRef.current?.speak(l)

  const moveTo = (s: BoatSection) => {
    setSection(s)
    enter(s, s === 'invite' ? {} : params(state.current.packed))
  }

  /** A leg is over: the boarding pass slides up (punching that leg), the next world is built behind it, and it goes. */
  const finish = (next: BoatSection) => {
    const st = state.current
    if (st.busy) return
    st.busy = true
    const from = st.section
    const punch = legOf(from)
    setPass({ punch, done: doneBefore(next, punch) })
    const at = RESUME.includes(next) ? next : (RESUME_AT[next] ?? null)
    if (at) setSaved({ at, packed: formatPacked(st.packed) })
    const old = worldRef.current
    setTimeout(() => {
      const world = WORLD_OF[next]
      if (world === st.mount.world && world === 'house') tripRef.current?.goTo(next as HouseLeg)
      else setMount((m) => ({ world, section: next, key: m.key + 1 }))
      setLanded(false)
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

  /** She said yes to Mommy: straight to packing, or (with a trip half done) a new trip or keep going. */
  const yes = () => {
    const at = state.current.saved.at
    if (!at || at === 'pack' || state.current.busy) {
      tripRef.current?.startPack()
      return
    }
    setPass({ punch: null, done: doneBefore(at, null), choice: true })
  }
  // Mommy asks in her room (the trip's first section); a yes back in the house goes straight on to packing.
  const asking = mode === 'webgl' && section === 'invite' && phase === 'invite' && !pass
  useEffect(() => {
    if (phase !== 'invite' || !justSaidYes()) return
    saidYes.at = 0
    const t = setTimeout(yes, 300)
    return () => clearTimeout(t)
  }, [phase])

  const choose = (again: boolean) => {
    sounds.pop()
    if (again) {
      setPass(null)
      setPacked([])
      tripRef.current?.startPack()
      return
    }
    const at = state.current.saved.at!
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
    }, 2400)
  }

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
      }, BOAT_TRIP.pack.fits)
      tripRef.current = trip
      trip.setHintElement(() => hintRef.current)
      w = new House(renderer, { section: s === 'goodbye' ? 'street' : 'upstairs' }, { onSpot: () => {}, onArrived: () => {} }, trip)
    } else if (world === 'airport') w = new Airport(renderer, leg, items)
    else if (world === 'plane') w = new PlaneRide(renderer, leg, s as FlySection, items, FLIGHT, BOAT_TRIP.caps.fly)
    else {
      const st = state.current
      const staged = linkPhotos.current
      linkPhotos.current = []
      const start: BayStart = {
        section: s,
        packed: items,
        ribbons: s === 'pier' && !tied.current ? null : st.ribbons.length ? st.ribbons : DEFAULT_RIBBONS.split(','),
        stops: st.stops,
        photos: staged,
        album: st.photos.map((p) => p.kind),
        found: st.found,
      }
      const bay = new Bay(renderer, start, {
        onSection: (x) => moveTo(x),
        say,
        onFound: (id, x, y) => {
          setFound((f) => (f.includes(id) ? f : [...f, id]))
          setFlights((f) => [...f, { key: performance.now() + Math.random(), id, x, y }])
        },
        onPhoto: (kind, src) => {
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
          // A deep link's staged photos go straight in; new ones print out big first.
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
      })
      bay.setArrowElements(arrowEls.current)
      w = bay
    }
    w.setHintElement?.(hintRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#A8DCFF', overflow: 'clip' }}>
      {mode === 'flat' ? (
        <Flat section={section} onSection={(s) => moveTo(s)} />
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
          {drops.map((d) => (
            <PhotoDrop
              key={d.key}
              src={d.src}
              onDone={() => {
                setDrops((all) => all.filter((x) => x.key !== d.key))
                setBump((b) => b + 1)
              }}
            />
          ))}
        </>
      )}
      {mode === 'webgl' && <TripGuide ref={guideRef} hidden={!!pass || asking} raised={mount.world === 'bay' && landed} idle={mount.world === 'bay' ? L.bay.hint.drive : undefined} />}
      <Ask open={asking} onYes={yes} onNotYet={onExit} />
      <PackCard open={!pass && mount.world === 'house' && (phase === 'pack' || phase === 'sitting')} packed={packed} sitting={phase === 'sitting'} onClose={() => tripRef.current?.closeTap()} />
      <AnimatePresence>
        {flash > 0 && (
          <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 40 }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pass && (
          <BoardingPass
            legs={PASS}
            done={pass.done}
            punch={pass.punch}
            choice={pass.choice ? { again: () => choose(true), resume: () => choose(false), resumeIcon: PASS.find((p) => p.id === legOf(saved.at ?? 'pack'))?.icon ?? '🚤' } : undefined}
          />
        )}
      </AnimatePresence>
      {debug && mount.world === 'bay' && <Debug bayRef={worldRef as never} />}
    </div>
  )
}


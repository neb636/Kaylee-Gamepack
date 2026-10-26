// The Nan road trip's legs around the stops (plan: thailand/nan-trip.html, build plan step 7), the trip kit's, in three
// 3D worlds in one shared view:
//
//   invite, pack, goodbye, home   Agong's own house (activities/hub/house.ts) with the trip kit's plugin
//                                 (trip/legs/house-plugin.ts, told by NAN_TRIP what the trip is): Mommy asks where to
//                                 (Ask.tsx: 🚤, 🛝🍕 or 🏔️🚙); packing for the mountains (her raincoat, her rain boots,
//                                 Mommy tucks in the umbrella); the goodbye at the shutter and Aunty Sri's van; coming
//                                 home, the flight, Agong asks for his photo, she picks one (PhotoFan) and it goes on
//                                 his wall, in the Nan trip's own frame
//   airport                       the x-ray belt (trip/legs/airport.ts)
//   takeoff, fly, land            the window seat north to Nan (trip/legs/plane.ts, `landing: 'nan'`): a green valley
//                                 in the mountains comes up under the plane, then the rental desk
//
// Sparkle sits in the corner (trip/legs/Guide.tsx). The trip around it
// (the boarding pass between legs, resume and replays, the stops) is NanTrip.tsx.
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { sounds, type Line } from '../../../../../sdk'
import { Anchors } from '../../engine/Anchors'
import { View3D, type RenderMode, type World3D } from '../../engine/View3D'
import { ANCHORS as HOUSE_ANCHORS, House } from '../hub/house'
import { PhotoFan } from '../boat-trip/PhotoFan'
import { AIRPORT_ANCHORS, Airport } from '../../trip/legs/airport'
import { Ask, justSaidYes, saidYes, tripChoices } from '../../trip/legs/Ask'
import { TripGuide, type TripGuideHandle } from '../../trip/legs/Guide'
import { TRIP_HOUSE_ANCHORS, TripHouse, type HouseLeg, type Phase } from '../../trip/legs/house-plugin'
import { PackCard } from '../../trip/legs/PackCard'
import { PLANE_ANCHORS, PlaneRide, type FlySection } from '../../trip/legs/plane'
import { addWallPhoto, newestByTrip, shrinkPhoto, today, useWallPhotos } from '../../trip/wall-photos'
import { drawPhoto, type PhotoId } from './photo'
import { FLIGHT, NAN_TRIP, WORLD_OF, type LoopSection, type LoopWorld } from './trip'

const ANCHORS_OF: Record<LoopWorld, typeof AIRPORT_ANCHORS> = {
  // (No name pills on the trip: the family crowds round at the goodbye and coming home.)
  house: [...HOUSE_ANCHORS.map((a) => ({ ...a, name: undefined, thai: undefined })), ...TRIP_HOUSE_ANCHORS],
  airport: AIRPORT_ANCHORS,
  plane: PLANE_ANCHORS,
}

export interface NanLoopHandle {
  /** She said yes to the mountains (or 🧳 a new trip): the suitcase hops out and opens. */
  startPack(): void
}

interface Props {
  section: LoopSection
  packed: string[]
  /** The photos she can pick for Agong's wall coming home. */
  photos: PhotoId[]
  /** She has done the whole trip before: the goodbye is quicker, the flight shorter. */
  replay: boolean
  /** The boarding pass is over the screen (between legs): the cards and the guide wait. */
  covered: boolean
  /** Mommy's card: the mountains (🏔️🚙), another trip (its id), not yet (✋). */
  onYes(): void
  onTrip(id: string): void
  onNotYet(): void
  /** The world moved on by itself (packing began, the plane's parts): the address bar follows. */
  onSection(s: LoopSection): void
  /** A leg is over: on to this section (the boarding pass covers the change). */
  onLeg(next: string): void
  onPacked(ids: string[]): void
  /** Home: the photo is on the wall and everyone has cheered (the stamp next). */
  onDone(): void
}

export const NanLoop = forwardRef<NanLoopHandle, Props>(function NanLoop({ section, packed, photos, replay, covered, onYes, onTrip, onNotYet, onSection, onLeg, onPacked, onDone }, ref) {
  const world = WORLD_OF[section]
  const [mount, setMount] = useState(() => ({ world, section, key: 0 }))
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [phase, setPhase] = useState<Phase | null>(null)
  const [flash, setFlash] = useState(0)
  const [wallPhotos, setWallPhotos] = useWallPhotos()
  const worldRef = useRef<World3D | null>(null)
  const tripRef = useRef<TripHouse | null>(null)
  const guideRef = useRef<TripGuideHandle>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const cb = useRef({ onSection, onLeg, onPacked })
  cb.current = { onSection, onLeg, onPacked }
  // What a rebuilt world starts from (read in make(), which React may run twice in development).
  const now = useRef({ packed, wallPhotos })
  now.current = { packed, wallPhotos }
  /** The last section a world moved on to by itself (no rebuild for that one). */
  const told = useRef<string | null>(null)

  useImperativeHandle(ref, () => ({ startPack: () => tripRef.current?.startPack() }))

  // A new section: one the world moved on to by itself just follows; in the same house, the plugin sets it up; another
  // world mounts behind the boarding pass.
  useEffect(() => {
    if (mount.section === section) return
    if (told.current === section) setMount((m) => ({ ...m, section }))
    else if (world === mount.world && world === 'house') {
      tripRef.current?.goTo(section as HouseLeg)
      setMount((m) => ({ ...m, section }))
    } else setMount((m) => ({ world, section, key: m.key + 1 }))
    told.current = null
  }, [section])

  // Someone says something, out loud (Sparkle in the corner shows the words for Dad).
  const say = (l: Line) => guideRef.current?.speak(l)
  const moved = (s: string) => {
    told.current = s
    cb.current.onSection(s as LoopSection)
  }
  const leg = { say, section: moved, done: (next: string) => cb.current.onLeg(next), flash: () => setFlash((n) => n + 1) }

  const mountRef = useRef(mount)
  mountRef.current = mount
  const make = (renderer: WebGLRenderer): World3D => {
    const st = now.current
    const { world, section: s } = mountRef.current
    let w: World3D & { setHintElement?(el: HTMLElement | null): void }
    if (world === 'airport') w = new Airport(renderer, leg, st.packed)
    else if (world === 'plane') w = new PlaneRide(renderer, leg, s as FlySection, st.packed, FLIGHT, replay ? (NAN_TRIP.caps.replayFly ?? NAN_TRIP.caps.fly) : NAN_TRIP.caps.fly, 'pier', 'nan')
    else {
      const trip = new TripHouse(s as HouseLeg, st.packed, { ...leg, phase: setPhase, packed: (ids) => cb.current.onPacked(ids) }, NAN_TRIP, replay)
      tripRef.current = trip
      trip.setHintElement(() => hintRef.current)
      // Coming home: last time's photo is still on the wall until Agong hangs the new one (the other trips' beside it).
      const walls = newestByTrip(st.wallPhotos)
      trip.setWall(walls.get(NAN_TRIP.id)?.src ?? null)
      trip.setOtherWalls(new Map([...walls].map(([t, p]) => [t, p.src])))
      return new House(renderer, { section: s === 'goodbye' || s === 'home' ? 'street' : 'upstairs' }, { onSpot: () => {}, onArrived: () => {} }, trip)
    }
    w.setHintElement?.(hintRef.current)
    return w
  }

  // Mommy asks in her room. A yes in the house (Mommy's card there, 🏔️🚙) goes straight on to packing.
  const fromHouse = useRef(justSaidYes('nan-trip'))
  useEffect(() => {
    if (phase !== 'invite' || !fromHouse.current) return
    fromHouse.current = false
    saidYes.at = 0
    const t = setTimeout(onYes, 300)
    return () => clearTimeout(t)
  }, [phase])
  const asking = mode === 'webgl' && section === 'invite' && phase === 'invite' && !covered && !fromHouse.current

  // Home: her photos fan out once Agong has asked for his (the fan would cover his words).
  const fan = useMemo(() => photos.map((id, n) => ({ n, kind: id, src: drawPhoto(id) })), [photos.join(',')])
  const [fanReady, setFanReady] = useState(false)
  useEffect(() => {
    if (phase !== 'pick') return setFanReady(false)
    const t = setTimeout(() => setFanReady(true), 2000)
    return () => clearTimeout(t)
  }, [phase])
  // The photo she picked goes on Agong's wall (saved on the iPad), then the stamp.
  const chosen = useRef<string | null>(null)
  const saved = useRef(false)
  useEffect(() => {
    if (section !== 'home' || mode !== 'webgl') return
    if (phase === 'gather' && chosen.current && !saved.current) {
      saved.current = true
      void shrinkPhoto(chosen.current).then((small) => setWallPhotos((list) => addWallPhoto(list, { trip: NAN_TRIP.id, src: small, at: today() })))
    }
    if (phase === 'home') {
      const t = setTimeout(onDone, 1800)
      return () => clearTimeout(t)
    }
  }, [phase, section])

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#A8DCFF', overflow: 'clip' }}>
      <View3D
        key={mount.key}
        name={`The Nan road trip (${mount.world})`}
        qaKey="__thaiNanQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={ANCHORS_OF[mount.world]} els={els} {...input} />
            {/* After a while with nothing touched: a finger pressing where to touch. */}
            <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
              <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
                👆
              </motion.div>
            </div>
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setMount((m) => ({ ...m, section, key: m.key + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(168,220,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🚙 Tap to wake the trip
        </button>
      )}
      {/* On the plane: skip ahead (the cabin to the landing, the landing to Nan) if the ride gets long. */}
      {mount.world === 'plane' && !covered && mode === 'webgl' && (
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
      {mode === 'webgl' && (
        <PhotoFan
          photos={fan}
          open={mount.world === 'house' && section === 'home' && phase === 'pick' && fanReady && !covered}
          onPick={(p) => {
            chosen.current = p.src
            tripRef.current?.choose(p.src)
          }}
        />
      )}
      {mode === 'webgl' && <TripGuide ref={guideRef} hidden={covered || asking} />}
      <Ask open={asking} trips={tripChoices(NAN_TRIP.id)} onYes={(t) => (t && t !== NAN_TRIP.id ? onTrip(t) : onYes())} onNotYet={onNotYet} />
      {mode === 'webgl' && <PackCard open={!covered && mount.world === 'house' && (phase === 'pack' || phase === 'sitting')} packed={packed} sitting={phase === 'sitting'} onClose={() => tripRef.current?.closeTap()} />}
      <AnimatePresence>
        {flash > 0 && <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 40 }} />}
      </AnimatePresence>
    </div>
  )
})

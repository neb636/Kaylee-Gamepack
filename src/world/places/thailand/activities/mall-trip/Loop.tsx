// The mall day's trip loop on screen (plan: thailand/mall-trip.md, build plan step 7): the legs around HarborLand, in
// two 3D worlds in one shared view.
//
//   invite, goodbye, home   Agong's own house (activities/hub/house.ts) with the trip kit's plugin
//                           (trip/legs/house-plugin.ts, told by MALL_TRIP what the mall day is): Mommy asks where to
//                           (Ask.tsx with 🚤 / 🛝🍕); the goodbye at the shutter and Mommy's silver Veloz; coming home,
//                           the pizza box for Agong, the cousins' phones down, the photo of the day on his wall
//   arrive                  ICONSIAM (arrive.ts): the glimpse, the lift (its floor number big, here), the counter
//
// Sparkle sits in the corner (trip/legs/Guide.tsx); the greybox's words aren't recorded yet, so they show in its
// bubble without a sound (words.ts). Without WebGL it's a picture book (LoopFlat.tsx). The trip around it (the day pass
// between legs, resume and replays) is MallTrip.tsx.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import type { Line } from '../../../../../sdk'
import { LOOKS } from '../../characters/looks'
import { Anchors } from '../../engine/Anchors'
import { View3D, type RenderMode, type World3D } from '../../engine/View3D'
import { ANCHORS as HOUSE_ANCHORS, House } from '../hub/house'
import { Ask, justSaidYes, TRIP_CHOICES } from '../../trip/legs/Ask'
import { TripGuide, type TripGuideHandle } from '../../trip/legs/Guide'
import { TRIP_HOUSE_ANCHORS, TripHouse, type HouseLeg, type Phase } from '../../trip/legs/house-plugin'
import { addWallPhoto, newestByTrip, today, useWallPhotos } from '../../trip/wall-photos'
import { Arrive, ARRIVE_ANCHORS } from './arrive'
import { buildPizzaBox } from './box'
import { wearHair } from './games/barber/mane'
import { LoopFlat } from './LoopFlat'
import { drawPhoto, PHOTO_IDS, type PhotoId } from './photo'
import type { PizzaId } from './pizza/layout'
import { MALL_TRIP } from './trip'

export type LoopSection = 'invite' | 'goodbye' | 'arrive' | 'home'
type LoopWorld = 'house' | 'arrive'
const WORLD_OF: Record<LoopSection, LoopWorld> = { invite: 'house', goodbye: 'house', arrive: 'arrive', home: 'house' }

const ANCHORS_OF: Record<LoopWorld, typeof ARRIVE_ANCHORS> = {
  // (No name pills on the trip: the whole family crowds round at the goodbye and coming home.)
  house: [...HOUSE_ANCHORS.map((a) => ({ ...a, name: undefined, thai: undefined })), ...TRIP_HOUSE_ANCHORS],
  arrive: ARRIVE_ANCHORS,
}

interface Props {
  section: LoopSection
  socks: string
  hair: string
  pizza: PizzaId
  photos: string
  /** She has done the whole day before: the goodbye is quicker. */
  replay: boolean
  /** The day pass is over the screen (between legs): the cards and the guide wait. */
  covered: boolean
  /** Mommy's card: the mall (🛝🍕), the boat trip (🚤), not yet (✋). */
  onMall(): void
  onBoat(): void
  onNotYet(): void
  /** A leg is over: on to this section (the day pass covers the change). */
  onLeg(next: string): void
  onSocks(id: string): void
  /** Home: the photo is on the wall and everyone has cheered (the stamp next). */
  onDone(): void
}

export function MallLoop({ section, socks, hair, pizza, photos, replay, covered, onMall, onBoat, onNotYet, onLeg, onSocks, onDone }: Props) {
  const world = WORLD_OF[section]
  const [mount, setMount] = useState(() => ({ world, section, key: 0 }))
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [phase, setPhase] = useState<Phase | null>(null)
  const [floor, setFloor] = useState(0)
  const [flash, setFlash] = useState(0)
  const [wallPhotos, setWallPhotos] = useWallPhotos()
  const worldRef = useRef<World3D | null>(null)
  const tripRef = useRef<TripHouse | null>(null)
  const guideRef = useRef<TripGuideHandle>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const cb = useRef({ onLeg, onSocks })
  cb.current = { onLeg, onSocks }
  // What a rebuilt world starts from (read in make(), which React may run twice in development).
  const now = useRef({ socks, hair, pizza, photos, wallPhotos })
  now.current = { socks, hair, pizza, photos, wallPhotos }
  const photoId = ((photos.split(',').find((p) => (PHOTO_IDS as string[]).includes(p)) ?? 'dragon') as PhotoId)

  // A new section: in the same house, the plugin sets it up; another world mounts behind the day pass.
  useEffect(() => {
    if (mount.section === section) return
    if (world === mount.world && world === 'house') {
      tripRef.current?.goTo(section as HouseLeg)
      setMount((m) => ({ ...m, section }))
    } else setMount((m) => ({ world, section, key: m.key + 1 }))
    setFloor(0)
  }, [section])

  // Someone says something: out loud if it's recorded, else just its bubble.
  const say = (l: Line) => guideRef.current?.speak(l)

  const mountRef = useRef(mount)
  mountRef.current = mount
  const make = (renderer: WebGLRenderer): World3D => {
    const st = now.current
    const mount = mountRef.current
    if (mount.world === 'arrive') {
      const w = new Arrive(renderer, {
        say,
        section: () => {},
        done: (next) => cb.current.onLeg(next),
        floor: setFloor,
        socks: (id) => cb.current.onSocks(id),
        flash: () => setFlash((n) => n + 1),
      })
      w.setHintElement(hintRef.current)
      return w
    }
    const leg = mount.section as HouseLeg
    const trip = new TripHouse(leg, [], { say, phase: setPhase, section: () => {}, done: (next) => cb.current.onLeg(next), packed: () => {}, flash: () => setFlash((n) => n + 1) }, MALL_TRIP, replay)
    tripRef.current = trip
    trip.setHintElement(() => hintRef.current)
    const walls = newestByTrip(st.wallPhotos)
    // Coming home: last time's photo of the day is still on the wall until the new one goes up (the boat trip's
    // beside it), the box she filled at the table, and Daddy's hairdo from the barber.
    trip.setWall(walls.get(MALL_TRIP.id)?.src ?? null)
    trip.setOtherWalls(new Map([...walls].map(([t, p]) => [t, p.src])))
    trip.setPhoto(drawPhoto(photoId))
    const house = new House(renderer, { section: leg === 'invite' ? 'upstairs' : 'street' }, { onSpot: () => {}, onArrived: () => {} }, trip)
    const box = buildPizzaBox(house.kit.bag, st.pizza)
    trip.setGift(box.root, box.lid)
    const nick = house.family.get('nick')
    if (leg === 'home' && nick && st.hair) {
      wearHair(nick.rig, LOOKS.nick, st.hair, house.kit.bag)
      trip.daddyHair = true
    }
    return house
  }

  // Home: once the photo is on the wall it's saved there (the house shows it from now on); then the stamp.
  const saved = useRef(false)
  useEffect(() => {
    if (section !== 'home' || mode !== 'webgl') return
    if (phase === 'gather' && !saved.current) {
      saved.current = true
      setWallPhotos((list) => addWallPhoto(list, { trip: MALL_TRIP.id, src: drawPhoto(photoId), at: today() }))
    }
    if (phase === 'home') {
      const t = setTimeout(onDone, 1800)
      return () => clearTimeout(t)
    }
  }, [phase, section])

  // She already picked the mall on Mommy's card in the house: don't ask "where shall we go?" a second time.
  const fromHouse = useRef(justSaidYes('mall-trip'))
  useEffect(() => {
    if (section !== 'invite') fromHouse.current = false
  }, [section])
  const asking = mode === 'webgl' && section === 'invite' && phase === 'invite' && !covered && !fromHouse.current

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#A8DCFF', overflow: 'clip' }}>
      {mode === 'flat' ? (
        <LoopFlat
          section={section}
          socks={socks}
          covered={covered || fromHouse.current}
          onMall={onMall}
          onBoat={onBoat}
          onNotYet={onNotYet}
          onLeg={onLeg}
          onSocks={onSocks}
          onDone={() => {
            setWallPhotos((list) => addWallPhoto(list, { trip: MALL_TRIP.id, src: drawPhoto(photoId), at: today() }))
            onDone()
          }}
        />
      ) : (
        <View3D
          key={mount.key}
          name={`The mall day (${mount.world})`}
          qaKey="__thaiMallQA"
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
      )}
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setMount((m) => ({ ...m, key: m.key + 1 }))
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(168,220,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🚗 Tap to wake the trip
        </button>
      )}
      {/* The lift's floor, big. */}
      <AnimatePresence>
        {floor > 0 && mode === 'webgl' && mount.world === 'arrive' && (
          <motion.div
            key={floor}
            aria-label={`Floor ${floor}`}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [1.35, 1], opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            style={{ position: 'absolute', left: '50%', top: 'calc(var(--top-clear, 104px) + 4px)', translate: '-50% 0', minWidth: 'clamp(84px, 16vmin, 140px)', height: 'clamp(84px, 16vmin, 140px)', borderRadius: 28, background: PAL_INK, color: floor === 6 ? '#FFC83D' : '#FFFFFF', border: '5px solid #fff', boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center', fontSize: 'clamp(56px, 12vmin, 104px)', fontWeight: 700, zIndex: 32, pointerEvents: 'none' }}
          >
            {floor}
          </motion.div>
        )}
      </AnimatePresence>
      {mode === 'webgl' && <TripGuide ref={guideRef} hidden={covered || asking} />}
      <Ask open={asking} trips={TRIP_CHOICES} onYes={(t) => (t === 'boat-trip' ? onBoat() : onMall())} onNotYet={onNotYet} />
      <AnimatePresence>
        {flash > 0 && <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 40 }} />}
      </AnimatePresence>
    </div>
  )
}

const PAL_INK = '#2B2330'

// Thailand's home base: Agong's house. Kaylee arrives by tuk-tuk, then walks around the street, downstairs and her
// room upstairs (deep-linkable spots, sections.ts). The 3D house is HouseView.
// Sparkle (Guide) says the few things there are to say; the family say hello themselves.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { say, sounds, useSaved, type Line } from '../../../../../sdk'
import { updateStickyParam, useSections } from '../../../../kit/sections'
import type { PlaceProps } from '../../../../types'
import { flag } from '../../engine/flags'
import { L } from '../../lines'
import { Ask, saidYes, TRIP_CHOICES, type Asker } from '../../trip/legs/Ask'
import { WallPlugin, WALL_LINES, WALL_SLOTS, wallAnchorId } from '../../trip/wall'
import { newestByTrip, useWallPhotos } from '../../trip/wall-photos'
import { Debug } from './Debug'
import { Guide, type GuideHandle } from './Guide'
import { BARE, formatLook, LOOK_KEY, type Style } from '../../characters/style'
import { bothPlugins, type House, type HousePlugin, type Spot, type Start } from './house'
import { HouseView, type RenderMode } from './HouseView'
import HUB_SECTIONS from './sections'
import type { DrawerId } from './wardrobe/furniture'
import { cleanDoor, DOOR_KEY, parseDoor, type DoorPhoto } from './wardrobe/door'
import { WARDROBE_ANCHORS, WardrobePlugin } from './wardrobe/plugin'

// Per visit to the app: the tuk-tuk brings her the first time; after that she's back where she left off.
let arrivedThisVisit = false
let lastSpot: Spot = 'street'
// Mommy asks about the trip on her own the first time Kaylee comes upstairs each visit (after that, tap Mommy). On the
// street, tap Daddy and he asks right away: no need to go upstairs.
let askedThisVisit = false

export function Hub({ meta, stamps, openActivity }: PlaceProps) {
  const { start, param, enter } = useSections(HUB_SECTIONS)
  const [initial] = useState<Start>(() => ({ section: start ?? (arrivedThisVisit ? lastSpot : 'arrive'), at: param('at') || undefined, who: param('who') || undefined }))
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const [arriving, setArriving] = useState(initial.section === 'arrive')
  const [asking, setAsking] = useState(false)
  const [asker, setAsker] = useState<Asker>('ji')
  const askTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(askTimer.current), [])
  const photo = initial.section === 'family'
  const [spot, setSpot] = useState<Spot>(initial.section === 'arrive' || initial.section === 'family' ? 'street' : initial.section === 'wardrobe' ? 'upstairs' : initial.section)
  // Her wardrobe (wardrobe/): her look is saved on the iPad as she changes it, and a link's ?look= follows along.
  const [, saveLook] = useSaved<Style>(LOOK_KEY, BARE)
  const [dressing, setDressing] = useState(initial.section === 'wardrobe')
  // The pictures on its door (the mirror takes them): saved on the iPad; a link's ?door= puts its own there.
  const [savedDoor, saveDoor] = useSaved<DoorPhoto[]>(DOOR_KEY, [])
  const [startDoor] = useState(() => (param('door') ? parseDoor(param('door')) : cleanDoor(savedDoor)))
  // The pictures and the drawer as the address bar shows them (so a copied link reproduces the door).
  const doorNow = useRef<{ photos: DoorPhoto[]; drawer: DrawerId | null }>({ photos: startDoor, drawer: null })
  const wardrobeState = () => ({ ...(doorNow.current.drawer ? { drawer: doorNow.current.drawer } : {}), ...(doorNow.current.photos.length ? { door: doorNow.current.photos.map((p) => p.look).join(';') } : {}) })
  const wardrobe = useRef<WardrobePlugin | null>(null)
  const [startDrawer] = useState(() => (initial.section === 'wardrobe' ? ((param('drawer') || null) as DrawerId | null) : null))
  // The mirror button's sparkle across the screen as she pops over to her wardrobe.
  const [flash, setFlash] = useState(0)
  const houseRef = useRef<House | null>(null)
  const guide = useRef<GuideHandle>(null)
  // Read once, when the house opens.
  const [debug] = useState(() => flag('debug') !== null)
  // Her trip photos on the wall downstairs (saved on the iPad): tap one and it comes close.
  const [wallPhotos] = useWallPhotos()
  const onWall = useMemo(() => newestByTrip(wallPhotos), [wallPhotos])
  const wallAnchors = useMemo(() => [...onWall.keys()].filter((t) => t in WALL_SLOTS).map((t) => ({ id: wallAnchorId(t), label: 'Our trip photo', kind: 'thing' as const })), [onWall])
  const [looking, setLooking] = useState<string | null>(null)
  const look = (trip: string) => {
    setLooking(trip)
    const line = WALL_LINES[trip]
    if (line) void say(line)
  }
  // Mommy offers each trip that's in the game: with more than one, a picture button for each (🚤, 🛝🍕).
  const trips = TRIP_CHOICES.filter((t) => meta.activities.some((a) => a.id === t.id))

  useEffect(() => {
    doorNow.current.drawer = startDrawer
    enter(initial.section, initial.at ? { at: initial.at } : initial.who ? { who: initial.who } : initial.section === 'wardrobe' ? wardrobeState() : {})
    if (initial.section !== 'arrive') arrivedThisVisit = true
    if (initial.section !== 'arrive' && initial.section !== 'family') lastSpot = initial.section === 'wardrobe' ? 'upstairs' : initial.section
    if (initial.section === 'upstairs' && !askedThisVisit) ask(4000)
  }, [])

  const arrived = () => {
    arrivedThisVisit = true
    setArriving(false)
    guide.current?.speak(L.house.arrive)
    guide.current?.speak(L.house.door, true)
  }

  const onSpot = (s: Spot, at?: string) => {
    lastSpot = s
    setSpot(s)
    enter(s, at ? { at } : {})
    guide.current?.arrivedAt(s)
    if (s === 'upstairs' && !askedThisVisit && !photo) ask(4000)
  }
  /** The wardrobe opened or closed, or she pulled out another drawer. */
  const onWardrobe = (open: boolean, drawer: DrawerId | null) => {
    setDressing(open)
    if (open) {
      // Mommy waits to ask about a trip until she's done dressing up.
      clearTimeout(askTimer.current)
      setAsking(false)
      doorNow.current.drawer = drawer
      enter('wardrobe', wardrobeState())
    } else {
      enter('upstairs')
      // Mommy sees her new look from across the room, once the doors are shut.
      setTimeout(() => houseRef.current?.notice('ji'), 900)
    }
  }
  /** The mirror button: from anywhere in the house, straight to her wardrobe with its doors open. */
  const toWardrobe = () => {
    sounds.sparkle()
    setFlash((n) => n + 1)
    setAsking(false)
    lastSpot = 'upstairs'
    setSpot('upstairs')
    wardrobe.current?.openHere()
  }
  const onLook = (style: Style) => {
    saveLook(style)
    updateStickyParam('look', formatLook(style))
  }
  const wardrobeEvents = useRef({ onWardrobe, onLook })
  wardrobeEvents.current = { onWardrobe, onLook }
  const sayRef = useRef((line: Line) => guide.current?.speak(line))
  const makePlugin = (): HousePlugin => {
    const w = new WardrobePlugin(
      {
        onState: (open, drawer) => wardrobeEvents.current.onWardrobe(open, drawer),
        onLook: (style) => wardrobeEvents.current.onLook(style),
        say: (line) => sayRef.current(line),
        onPhotos: (list) => {
          saveDoor(list)
          doorNow.current.photos = list
          if (wardrobe.current?.isOpen) enter('wardrobe', wardrobeState())
        },
      },
      { open: initial.section === 'wardrobe', drawer: startDrawer, door: startDoor },
    )
    wardrobe.current = w
    return onWall.size ? bothPlugins(w, new WallPlugin(onWall, look, initial.section === 'downstairs' && initial.at === 'photos')) : w
  }
  // Tap Mommy and she asks after her hello; tap Daddy and he asks instead of saying hello.
  const onGreet = (id: string, noticed = false) => {
    if (photo || arriving) return false
    if (id === 'ji') ask(1200)
    if (id !== 'nick') return false
    // (Daddy first says what he thinks of her look, then asks.)
    ask(noticed ? 2800 : 250, 'nick')
    return true
  }
  /** Mommy asks if she's ready to go on a trip (her room is upstairs, by the suitcase); Daddy asks on the street. */
  const ask = (after: number, who: Asker = 'ji') => {
    askedThisVisit = true
    clearTimeout(askTimer.current)
    setAsker(who)
    askTimer.current = setTimeout(() => setAsking(true), after)
  }
  const yes = (trip = 'boat-trip') => {
    saidYes.at = performance.now()
    saidYes.trip = trip
    setAsking(false)
    openActivity(trip)
  }
  // (Only the activities in the game count: a stamp from one still in the works doesn't open the party.)
  const allStamps = meta.activities.every((a) => stamps.includes(a.id))

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#A8DCFF', overflow: 'clip' }}>
      <HouseView key={engine} start={initial} houseRef={houseRef} onMode={setMode} plugin={makePlugin} extraAnchors={[...WARDROBE_ANCHORS, ...wallAnchors]} events={{ onSpot, onArrived: arrived, onPoke: (id) => guide.current?.poked(id), onGreet }} />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(168,220,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🏠 Tap to wake the house
        </button>
      )}
      {arriving && (
        <motion.button
          aria-label="Skip"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            sounds.pop()
            houseRef.current?.skipArrival()
          }}
          style={{ position: 'absolute', left: '50%', bottom: 'calc(var(--safe-bottom) + 18px)', translate: '-50% 0', minHeight: 64, padding: '0 28px', borderRadius: 999, border: '4px solid #fff', background: 'var(--lavender)', color: 'var(--ink)', fontSize: 22, fontWeight: 700, boxShadow: 'var(--shadow)', zIndex: 20 }}
        >
          Skip ⏩
        </motion.button>
      )}
      {allStamps && (
        <motion.button
          aria-label="Party"
          whileTap={{ scale: 0.88 }}
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          onClick={() => {
            sounds.pop()
            openActivity('party')
          }}
          style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 14px)', bottom: 'calc(var(--safe-bottom) + 14px)', width: 88, height: 88, borderRadius: '50%', border: '4px solid #fff', background: 'var(--butter)', fontSize: 44, boxShadow: 'var(--shadow)', zIndex: 20, opacity: meta.activities.length ? 1 : 0.85 }}
        >
          🎉
        </motion.button>
      )}
      {/* A trip photo from the wall, close up. Tap anywhere to put it back. */}
      <AnimatePresence>
        {looking && onWall.get(looking) && (
          <motion.button
            key="wall-photo"
            aria-label="Put the photo back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              sounds.pop()
              setLooking(null)
            }}
            style={{ position: 'absolute', inset: 0, zIndex: 45, border: 'none', background: 'rgba(43,35,48,.35)', display: 'grid', placeItems: 'center', padding: 'var(--top-clear) 16px calc(var(--safe-bottom) + 16px)' }}
          >
            <motion.span
              initial={{ scale: 0.25, x: '-30vw', rotate: -8 }}
              animate={{ scale: 1, x: 0, rotate: -2 }}
              exit={{ scale: 0.25, x: '-30vw', rotate: -8 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              style={{ display: 'block', width: 'min(640px, 88vw, calc((100vh - 220px) * 4 / 3))', padding: 'clamp(12px, 2.4vmin, 22px)', background: 'var(--hotpink)', borderRadius: 18, boxShadow: 'var(--shadow)' }}
            >
              <img src={onWall.get(looking)!.src} alt="Our boat trip" style={{ display: 'block', width: '100%', borderRadius: 6, border: '6px solid var(--cream)' }} />
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
      {/* Done dressing up: the doors close (tapping the doors or the room does too). */}
      <AnimatePresence>
        {dressing && mode !== 'lost' && (
          <motion.button
            key="wardrobe-done"
            aria-label="Done dressing up"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              sounds.pop()
              wardrobe.current?.close()
            }}
            style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 14px)', bottom: 'calc(var(--safe-bottom) + 14px)', width: 88, height: 88, borderRadius: '50%', border: '4px solid #fff', background: 'var(--mint)', color: 'var(--ink)', fontSize: 44, fontWeight: 700, boxShadow: 'var(--shadow)', zIndex: 21 }}
          >
            ✓
          </motion.button>
        )}
      </AnimatePresence>
      {/* The mirror button, in the house's top bar on every floor and the street: tap it and she's at her wardrobe. */}
      <AnimatePresence>
        {!photo && !arriving && !dressing && !asking && mode !== 'lost' && (
          <motion.button
            key="mirror"
            aria-label="Dress up"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', delay: 0.2 }}
            whileTap={{ scale: 0.85 }}
            onClick={toWardrobe}
            // A big target (--target: 96px on iPad, 72px in iPhone landscape) round a circle the size of the top bar's
            // buttons, lined up with them.
            style={{ position: 'absolute', top: 'calc(var(--safe-top) + 12px - (var(--target) - var(--btn)) / 2)', right: 'calc(var(--safe-right, 0px) + 16px - (var(--target) - var(--btn)) / 2)', width: 'var(--target)', height: 'var(--target)', padding: 0, border: 'none', background: 'none', display: 'grid', placeItems: 'center', zIndex: 50 }}
          >
            <motion.span
              animate={{ rotate: [-6, 6, -6] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
              style={{ width: 'var(--btn)', height: 'var(--btn)', borderRadius: '50%', border: '4px solid #fff', background: 'var(--pink)', fontSize: 'calc(var(--btn) * .5)', boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}
            >
              🪞
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {flash > 0 && (
          <motion.div
            key={`flash-${flash}`}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => setFlash(0)}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40, background: 'radial-gradient(circle at 50% 50%, #fff 0%, #FFE3EF 45%, rgba(233,222,255,.7) 100%)' }}
          />
        )}
      </AnimatePresence>
      {!photo && <Guide ref={guide} spot={spot} quiet={arriving || mode === 'lost' || asking || dressing} />}
      <Ask open={asking && !arriving && mode !== 'lost'} who={asker} trips={trips.length > 1 ? trips : undefined} onYes={(t) => yes(t)} onNotYet={() => setAsking(false)} />
      {debug && <Debug houseRef={houseRef} />}
    </div>
  )
}

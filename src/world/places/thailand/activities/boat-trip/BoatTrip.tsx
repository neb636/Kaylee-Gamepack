// Captain Kaylee's boat trip (plan: planning/around-the-world/thailand/boat-trip.md). Greybox: placeholder shapes, and
// text bubbles instead of voices. It runs the trip's legs in order, each its own 3D world in the shared view:
//
//   invite, pack, goodbye   Agong's own house (activities/hub/house.ts) with the trip's plugin (trip/legs/house-plugin.ts):
//                           Mommy asks (Ask.tsx), packing (with the suitcase card and ✅ here), Aunty Sri's van
//   airport                 the van pulls away and they're at the airport: the x-ray belt (trip/legs/airport.ts)
//   takeoff, fly, land      the window seat (trip/legs/plane.ts)
//   pier, bay, cave, nail   the boat toy in Phang Nga Bay (bay/bay.ts, greybox 1)
//
// Between legs the boarding pass slides up and hides the next world being built. What she packs (`packed`) rides along
// the whole trip (the URL param, then what she saved). The trip saves after each leg (useSaved), and saying yes to Mommy
// again offers to keep going from there.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { sounds, useSaved } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../engine/Anchors'
import { flag } from '../../engine/flags'
import { View3D, type RenderMode, type World3D } from '../../engine/View3D'
import { ANCHORS as HOUSE_ANCHORS, House } from '../hub/house'
import { AIRPORT_ANCHORS, Airport } from '../../trip/legs/airport'
import { Ask, justSaidYes, saidYes } from '../../trip/legs/Ask'
import { BoardingPass } from '../../trip/legs/BoardingPass'
import { Bubble } from '../../trip/legs/Bubble'
import { TRIP_HOUSE_ANCHORS, TripHouse, type HouseLeg, type Phase } from '../../trip/legs/house-plugin'
import { PackCard } from '../../trip/legs/PackCard'
import { PLANE_ANCHORS, PlaneRide, type FlySection } from '../../trip/legs/plane'
import type { LegEvents } from '../../trip/legs/stage'
import { DEFAULT_PACKED, formatPacked, parsePacked } from '../../trip/packing'
import type { Said } from '../../trip/talk'
import { Bay, BAY_ANCHORS } from './bay/bay'
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
const RESUME_AT: Partial<Record<BoatSection, BoatSection>> = { fly: 'takeoff', land: 'takeoff', bay: 'pier', cave: 'pier', nail: 'pier' }

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
  const [pass, setPass] = useState<{ punch: string | null; done: string[]; footer?: string; choice?: boolean } | null>(null)
  const [said, setSaid] = useState<(Said & { n: number }) | null>(null)
  const [landed, setLanded] = useState(false)
  const [phase, setPhase] = useState<Phase | null>(null)
  const [flash, setFlash] = useState(0)
  const worldRef = useRef<World3D | null>(null)
  const tripRef = useRef<TripHouse | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const state = useRef({ section, packed, mount, busy: false, saved })
  state.current = { ...state.current, section, packed, mount, saved }
  // Read once: the address bar follows her and drops ?debug=1.
  const [debug] = useState(() => flag('debug') !== null)

  const params = (ids: string[]) => ({ packed: formatPacked(ids) || DEFAULT_PACKED })
  useEffect(() => enter(first, first === 'invite' ? {} : params(packed)), [])

  // A bubble for a few seconds (longer lines stay a little longer).
  const hide = useRef<ReturnType<typeof setTimeout>>(undefined)
  const say = (s: Said) => {
    clearTimeout(hide.current)
    setSaid((cur) => ({ ...s, n: (cur?.n ?? 0) + 1 }))
    hide.current = setTimeout(() => setSaid(null), 2200 + s.text.length * 45)
  }
  useEffect(() => () => clearTimeout(hide.current), [])

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
    setSaid(null)
    setPass({ punch, done: doneBefore(next, punch), footer: next === 'pier' ? 'Krabi' : undefined })
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
    else w = new Bay(renderer, s as 'pier', { onSection: (x) => moveTo(x), onLanded: setLanded, onFlash: () => setFlash((n) => n + 1) })
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
      <AnimatePresence>
        {landed && mode === 'webgl' && mount.world === 'bay' && (
          <motion.button
            key="camera"
            aria-label="Take a photo"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              sounds.pop()
              ;(worldRef.current as Bay | null)?.snap()
            }}
            style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 18px)', bottom: 'calc(var(--safe-bottom) + 18px)', width: 104, height: 104, borderRadius: '50%', border: '5px solid #fff', background: 'var(--hotpink)', fontSize: 52, boxShadow: 'var(--shadow)', zIndex: 30 }}
          >
            📸
          </motion.button>
        )}
      </AnimatePresence>
      <Bubble said={pass ? null : said} />
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
            footer={pass.footer}
            choice={pass.choice ? { again: () => choose(true), resume: () => choose(false), resumeIcon: PASS.find((p) => p.id === legOf(saved.at ?? 'pack'))?.icon ?? '🚤' } : undefined}
          />
        )}
      </AnimatePresence>
      {debug && mount.world === 'bay' && <Debug bayRef={worldRef as never} />}
    </div>
  )
}


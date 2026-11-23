// The mountain road's screen: the 3D road (mountain.ts) with its tap targets, the circle where her finger went down (sled
// style: she pushes left or right of it; mountain.ts places it every frame, engine3d/SteerWheel), the 3 road's
// big numbers as she counts the bends, the 👆 when she hasn't steered for a while, Sparkle in the other corner
// (trip/legs/Guide.tsx: she and the family talk out loud in their own voices), and at the end of the road its stop
// (when she picked one on the Nan map, it opens by itself) or the end card: the stop, 🔁 this road again, 🗺️ back to
// the map. The 3 road ends at the viewpoint (section `three`), where the bends pop one, two, three; on the trip, Mom takes the
// family's photo with the 3 behind them and the end card offers ✈️🏠 home (from the airport; from the lookout, 🔁 and 🗺️
// back to the map). Every drive (and every 🔁) rolls its own
// weather and traffic (roads.ts rollDrive); a link's `weather` holds for the drive it opens.
import { EndCard as HudEnd, HudButton } from '../../../../../kit/Hud'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { Anchors } from '../../../../../engine3d/Anchors'
import { SteerHint, SteerWheel } from '../../../../../engine3d/SteerWheel'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { driveAnchors, NanDrive, type DriveHud } from './mountain'
import { L } from '../../../lines'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import { drawPhoto } from '../photo'
import { Snapshot } from '../Snapshot'
import { nanRoad, ROAD_IDS, rollDrive, WEATHERS, type RoadId, type Weather } from './roads'
import { useTimers } from '../../../../../../sdk'

const hashParam = (k: string) => new URLSearchParams(location.hash.split('?')[1] ?? '').get(k) ?? ''
/** The weather a link states (`?weather=rain`), read when the drive first opens. */
function linkWeather(): Weather | '' {
  const w = hashParam('weather')
  return (WEATHERS as readonly string[]).includes(w) ? (w as Weather) : ''
}

interface Props {
  road: RoadId
  /** Start parked at the 3 road's viewpoint, the 3 below (section `three`). */
  view?: boolean
  /** Where she's driving to (picked on the Nan map: a stop's id, or `map` to go back to it): it opens by itself at the
   *  end of the road. Empty: the end card. */
  to?: string
  /** The end card picked a road. */
  onRoad: (road: RoadId) => void
  /** The stop at the end of this road (the valley road's mushroom farm, the sky road's Stop Time Cafe or, by its `stop`
   *  id, the salt wells). */
  onStop?: (road: RoadId, stop?: string) => void
  /** Back to the Nan map. */
  onMap?: () => void
  /** The 3 road reached its viewpoint (section `three`). */
  onView?: () => void
  /** On the trip: the bends have popped and Mom took the photo (it's one to pick for Agong's wall). */
  onPhoto?: () => void
  /** ✈️🏠 on the end card at the viewpoint (from the airport: the trip's way home; not from the lookout). */
  onHome?: () => void
}

export function Drive({ road, view = false, to = '', onRoad, onStop, onMap, onView, onPhoto, onHome }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [run, setRun] = useState(0)
  const [hud, setHud] = useState<DriveHud>({ phase: 'drive', count: { k: 0, n: 0 } })
  const worldRef = useRef<NanDrive | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const stickRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<TripGuideHandle>(null)
  // This drive's weather and traffic: rolled for every road and every 🔁 (the link's weather for the first one).
  const [stated] = useState(linkWeather)
  const [firstRoad] = useState(road)
  // (The stops done so far ride along in the address bar: the sky road's second trip up starts above the cloud.)
  const roll = useMemo(() => rollDrive(road, road === firstRoad && run === 0 && key === 0 ? stated : '', Math.random, { to, stops: hashParam('stops').split(',') }), [road, run, key])
  const toRef = useRef(to)
  toRef.current = to
  const viewCb = useRef(onView)
  viewCb.current = onView
  // Driving to a stop picked on the map: at the end of the road, it opens.
  const going = road !== 'three' && !!to && !!(to === 'map' ? onMap : onStop)
  useEffect(() => {
    if (!going || hud.phase !== 'end') return
    if (to === 'map') onMap?.()
    else onStop?.(road, to)
  }, [going, hud.phase])

  // The 3 from above on the trip (from the airport or the lookout): Mom's photo of them with the 3 behind.
  const photo = view && hud.phase === 'end' && !!(onHome || onPhoto)
  const threePhoto = useMemo(() => (photo ? drawPhoto('three') : ''), [photo])
  useEffect(() => {
    if (!photo) return
    guideRef.current?.speak(L.nan.trip.three)
    onPhoto?.()
  }, [photo])

  const make = (renderer: WebGLRenderer) => {
    const w = new NanDrive(renderer, road, { onHud: setHud, onView: () => viewCb.current?.(), say: (l) => guideRef.current?.speak(l) }, view ? 'view' : 'road', roll, toRef.current, roll.from)
    w.setHintElement(hintRef.current)
    w.setStickElement(stickRef.current)
    return w
  }
  const pick = (r: RoadId) => {
    setHud({ phase: 'drive', count: { k: 0, n: 0 } })
    // (Again from the 3's viewpoint drives the 3 road again from the top: the parent leaves section `three` first.)
    if (r === road && view) onRoad(r)
    if (r === road) setRun((n) => n + 1)
    else onRoad(r)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#D5DCEA', overflow: 'clip' }}>
      <View3D
        key={`${road}:${run}:${key}`}
        name="The mountain road"
        qaKey="__thaiNanQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={driveAnchors(road, roll.traffic, to)} els={els} {...input} />
            <SteerWheel ref={stickRef} />
            {/* Not steering for a while: a finger sliding side to side, the way the wheel steers. */}
            <SteerHint ref={hintRef} />
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setKey((k) => k + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(110,104,128,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: '#fff', zIndex: 70 }}
        >
          🚙 Tap to wake the road
        </button>
      )}
      {mode === 'webgl' && <TripGuide ref={guideRef} hidden={hud.phase === 'end'} />}
      <CountPop count={hud.count} />
      <AnimatePresence>{photo && mode === 'webgl' && <Snapshot key="three" src={threePhoto} />}</AnimatePresence>
      <AnimatePresence>{hud.phase === 'end' && !going && <EndCard road={road} onRoad={pick} onStop={onStop} onMap={onMap} onHome={view ? onHome : undefined} />}</AnimatePresence>
    </div>
  )
}

/** The 3 road's count: a giant 1, 2, 3 as she rounds each bend (and again from the viewpoint, as each bend pops). */
function CountPop({ count }: { count: DriveHud['count'] }) {
  const timers = useTimers()
  const [shown, setShown] = useState<{ k: number; n: number } | null>(null)
  useEffect(() => {
    if (!count.n || !count.k) return
    setShown(count)
    const t = timers.later(() => setShown(null), 1300)
    return () => clearTimeout(t)
  }, [count.n])
  return (
    <div aria-live="polite" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 40, paddingTop: 'var(--top-clear)' }}>
      <AnimatePresence mode="popLayout">
        {shown && (
          <motion.div
            key={shown.n}
            initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
            animate={{ scale: [0.2, 1.25, 1], opacity: 1, rotate: 0 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ fontSize: 'clamp(120px, 28vmin, 240px)', fontWeight: 700, lineHeight: 1, color: 'var(--hotpink)', WebkitTextStroke: '6px #fff', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(43,35,48,.3)' }}
          >
            {shown.k}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type Stop = { icon: string; label: string; id?: string }
/** The stops built so far at the end of a road (the sky road comes down between two: the café and the salt wells). */
const STOP_AT: Partial<Record<RoadId, Stop | Stop[]>> = {
  valley: { icon: '🍄', label: 'The mushroom farm' },
  // (Only with the Cup on.)
  city: { icon: '🏁', label: 'The Nan Mountain Cup', id: 'cup' },
  sky: [{ icon: '🌾', label: 'Stop Time Cafe' }, { icon: '🧂', label: 'Bo Kluea salt wells', id: 'salt' }],
}

/** The end of the road: drive it again, or back to the map (without one, take another road), in big pictures, no
 *  reading. At the end of a road with a stop (the valley road's mushroom farm, the sky road's Stop Time Cafe and Bo
 *  Kluea's salt wells), its big pictures come first. */
function EndCard({ road, onRoad, onStop, onMap, onHome }: { road: RoadId; onRoad: (r: RoadId) => void; onStop?: (road: RoadId, stop?: string) => void; onMap?: () => void; onHome?: () => void }) {
  const stops = onStop ? [STOP_AT[road] ?? []].flat() : []
  // One way on, and only it is big and breathes: a stop, else the plane home, else the map.
  const mapIsOn = !stops.length && !onHome
  return (
    <HudEnd key="end">
      <HudButton role="again" icon="again" label="Drive it again" onClick={() => onRoad(road)} />
      {(onMap ? [] : ROAD_IDS.filter((r) => r !== road)).map((r) => (
        <HudButton key={r} role="open" label={nanRoad(r).name} onClick={() => onRoad(r)}>
          {nanRoad(r).icon}
        </HudButton>
      ))}
      {onMap && <HudButton role={mapIsOn ? 'go' : 'open'} icon="map" size={mapIsOn ? 'lg' : 'md'} pulse={mapIsOn} label="The Nan map" onClick={onMap} />}
      {stops.map((stop) => (
        <HudButton key={stop.icon} role="go" size="lg" pulse label={stop.label} onClick={() => onStop?.(road, stop.id)}>
          {stop.icon}
        </HudButton>
      ))}
      {/* On the trip, from the 3: the plane home. */}
      {onHome && <HudButton role="go" icon="home" size="lg" pulse label="Fly home" onClick={onHome} />}
    </HudEnd>
  )
}

// The mountain road's screen: the 3D road (mountain.ts) with its tap targets, the steering wheel in the corner (the whole
// wheel is the horn, and it turns as the Pajero turns; it pulses when a car is coming round a blind bend), the 3 road's
// big numbers as she counts the bends, the 👆 when she hasn't steered for a while, and at the end of the road its stop
// (when she picked one on the Nan map, it opens by itself) or the end card: the stop, 🔁 this road again, 🗺️ back to
// the map. The 3 road ends at the viewpoint (section `three`), where she draws the 3; on the trip, Mommy takes the
// family's photo with the 3 behind them and the end card offers ✈️🏠 home. Without WebGL: the flat picture version
// (Flat.tsx).
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { say } from '../../../../../../sdk'
import { Anchors } from '../../../engine/Anchors'
import { View3D, type RenderMode } from '../../../engine/View3D'
import { driveAnchors, NanDrive, type DriveHud } from './mountain'
import { DriveFlat } from './Flat'
import { L } from '../../../lines'
import { drawPhoto } from '../photo'
import { Snapshot } from '../Snapshot'
import { nanRoad, ROAD_IDS, type RoadId } from './roads'

interface Props {
  road: RoadId
  /** Start parked at the 3 road's viewpoint, the 3 below waiting to be drawn (section `three`). */
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
  /** The 3 road reached its viewpoint: drawing the 3 begins (section `three`). */
  onView?: () => void
  /** On the trip: the 3 is drawn and Mommy took the photo (it's one to pick for Agong's wall), and ✈️🏠 goes home. */
  onDrawn?: () => void
  onHome?: () => void
}

export function Drive({ road, view = false, to = '', onRoad, onStop, onMap, onView, onDrawn, onHome }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [run, setRun] = useState(0)
  const [hud, setHud] = useState<DriveHud>({ phase: 'drive', count: { k: 0, n: 0 } })
  const worldRef = useRef<NanDrive | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLButtonElement>(null)
  const viewCb = useRef(onView)
  viewCb.current = onView
  // Driving to a stop picked on the map: at the end of the road, it opens.
  const going = road !== 'three' && !!to && !!(to === 'map' ? onMap : onStop)
  useEffect(() => {
    if (!going || hud.phase !== 'end') return
    if (to === 'map') onMap?.()
    else onStop?.(road, to)
  }, [going, hud.phase])

  // The 3 drawn on the trip: Mommy's photo of them with the 3 behind.
  const photo = view && hud.phase === 'end' && !!onHome
  const threePhoto = useMemo(() => (photo ? drawPhoto('three') : ''), [photo])
  useEffect(() => {
    if (!photo) return
    void say(L.nan.trip.three)
    onDrawn?.()
  }, [photo])

  const make = (renderer: WebGLRenderer) => {
    const w = new NanDrive(renderer, road, { onHud: setHud, onView: () => viewCb.current?.() }, view ? 'view' : 'road')
    w.setHintElement(hintRef.current)
    w.setWheelElement(wheelRef.current)
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
      {mode === 'flat' ? (
        <DriveFlat key={`${road}:${run}`} road={road} onRoad={pick} onStop={onStop} onMap={onMap} onHome={road === 'three' ? onHome : undefined} />
      ) : (
        <View3D
          key={`${road}:${run}:${key}`}
          name="The mountain road"
          qaKey="__thaiNanQA"
          worldRef={worldRef}
          onMode={setMode}
          make={make}
          anchors={(input, els) => (
            <>
              <Anchors list={driveAnchors(road)} els={els} {...input} />
              {/* Not steering for a while: a finger on the road ahead. */}
              <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
                <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
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
            setKey((k) => k + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(110,104,128,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: '#fff', zIndex: 70 }}
        >
          🚙 Tap to wake the road
        </button>
      )}
      {mode === 'webgl' && <Wheel ref={wheelRef} hidden={hud.phase === 'view' || hud.phase === 'end'} onHorn={() => worldRef.current?.honk()} />}
      <CountPop count={hud.count} />
      <AnimatePresence>{photo && mode === 'webgl' && <Snapshot key="three" src={threePhoto} />}</AnimatePresence>
      <AnimatePresence>{hud.phase === 'end' && !going && <EndCard road={road} onRoad={pick} onStop={onStop} onMap={onMap} onHome={road === 'three' ? onHome : undefined} />}</AnimatePresence>
    </div>
  )
}

/** The steering wheel in the corner: the whole wheel is the horn (beep beep!). mountain.ts turns it (--turn) and makes it
 *  pulse (data-pulse) when a car is coming round a blind bend. */
export const Wheel = forwardRef<HTMLButtonElement, { hidden?: boolean; onHorn: () => void }>(function Wheel({ hidden, onHorn }, ref) {
  return (
    <>
      <button
        ref={ref}
        aria-label="Horn"
        className="nan-wheel"
        onPointerDown={(e) => {
          // At once, on the finger going down (no waiting for it to lift).
          e.stopPropagation()
          e.preventDefault()
          onHorn()
        }}
        style={{
          position: 'absolute',
          right: 'calc(var(--safe-right, 0px) + 16px)',
          bottom: 'calc(var(--safe-bottom, 0px) + 16px)',
          width: 'clamp(112px, 19vmin, 160px)',
          height: 'clamp(112px, 19vmin, 160px)',
          padding: 0,
          border: 'none',
          borderRadius: '50%',
          background: 'transparent',
          zIndex: 34,
          touchAction: 'none',
          display: hidden ? 'none' : 'block',
          transform: 'rotate(var(--turn, 0deg))',
          transition: 'transform 80ms linear',
        }}
      >
        <svg viewBox="-50 -50 100 100" width="100%" height="100%" style={{ display: 'block', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.3))' }}>
          <circle r={44} fill="none" stroke="#3E3849" strokeWidth={11} />
          <circle r={44} fill="none" stroke="#5A5266" strokeWidth={3} strokeDasharray="6 9" />
          {[90, 210, 330].map((a) => (
            <rect key={a} x={-5} y={0} width={10} height={40} rx={4} fill="#3E3849" transform={`rotate(${a})`} />
          ))}
          <circle className="nan-boss" r={21} fill="#FF4F9A" stroke="#FFFFFF" strokeWidth={4} />
          <text y={9} textAnchor="middle" fontSize={24}>
            📯
          </text>
        </svg>
      </button>
      <style>{`
        .nan-wheel[data-pulse="1"] .nan-boss { animation: nan-boss 0.6s ease-in-out infinite; transform-origin: center; }
        .nan-wheel[data-pulse="1"] { box-shadow: 0 0 0 8px rgba(255, 200, 61, .65), 0 0 28px 10px rgba(255, 79, 154, .45); }
        @keyframes nan-boss { 50% { transform: scale(1.18); fill: #FFC83D; } }
      `}</style>
    </>
  )
})

/** The 3 road's count: a giant 1, 2, 3 as she rounds each bend (and again as the crayon draws the 3). */
function CountPop({ count }: { count: DriveHud['count'] }) {
  const [shown, setShown] = useState<{ k: number; n: number } | null>(null)
  useEffect(() => {
    if (!count.n || !count.k) return
    setShown(count)
    const t = setTimeout(() => setShown(null), 1300)
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
  sky: [{ icon: '🌾', label: 'Stop Time Cafe' }, { icon: '🧂', label: 'Bo Kluea salt wells', id: 'salt' }],
}

/** The end of the road: drive it again, or back to the map (without one, take another road), in big pictures, no
 *  reading. At the end of a road with a stop (the valley road's mushroom farm, the sky road's Stop Time Cafe and Bo
 *  Kluea's salt wells), its big pictures come first. */
export function EndCard({ road, onRoad, onStop, onMap, onHome }: { road: RoadId; onRoad: (r: RoadId) => void; onStop?: (road: RoadId, stop?: string) => void; onMap?: () => void; onHome?: () => void }) {
  const size = 'clamp(92px, 15vmin, 128px)'
  const stops = onStop ? [STOP_AT[road] ?? []].flat() : []
  return (
    <motion.div
      key="end"
      initial={{ y: 160 }}
      animate={{ y: 0 }}
      exit={{ y: 160 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom, 0px) + 18px)', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 'clamp(12px, 2.6vw, 26px)', padding: '0 16px', zIndex: 50 }}
    >
      {stops.map((stop) => (
        <motion.button key={stop.icon} aria-label={stop.label} whileTap={{ scale: 0.88 }} animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 1.1 }} onClick={() => onStop?.(road, stop.id)} style={{ width: size, height: size, borderRadius: '50%', border: '6px solid #fff', background: 'var(--hotpink)', fontSize: 'clamp(42px, 7vmin, 60px)', boxShadow: 'var(--shadow)', padding: 0 }}>
          {stop.icon}
        </motion.button>
      ))}
      {[road, ...(onMap ? [] : ROAD_IDS.filter((r) => r !== road))].map((r) => (
        <motion.button
          key={r}
          aria-label={r === road ? 'Drive it again' : nanRoad(r).name}
          whileTap={{ scale: 0.88 }}
          animate={r === road ? { scale: 1 } : { scale: [1, 1.07, 1] }}
          transition={r === road ? undefined : { repeat: Infinity, duration: 1.4, delay: ROAD_IDS.indexOf(r) * 0.2 }}
          onClick={() => onRoad(r)}
          style={{ width: size, height: size, borderRadius: '50%', border: '6px solid #fff', background: r === road ? 'var(--lavender)' : 'var(--pink)', fontSize: 'clamp(42px, 7vmin, 60px)', boxShadow: 'var(--shadow)', padding: 0 }}
        >
          {r === road ? '🔁' : nanRoad(r).icon}
        </motion.button>
      ))}
      {onMap && (
        <motion.button aria-label="The Nan map" whileTap={{ scale: 0.88 }} animate={{ scale: [1, 1.07, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} onClick={onMap} style={{ width: size, height: size, borderRadius: '50%', border: '6px solid #fff', background: 'var(--pink)', fontSize: 'clamp(42px, 7vmin, 60px)', boxShadow: 'var(--shadow)', padding: 0 }}>
          🗺️
        </motion.button>
      )}
      {/* On the trip, from the 3: the plane home (the bigger pulse: it's the way on). */}
      {onHome && (
        <motion.button aria-label="Fly home" whileTap={{ scale: 0.88 }} animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 1.1 }} onClick={onHome} style={{ minWidth: 'clamp(120px, 22vw, 170px)', height: size, borderRadius: 999, border: '6px solid #fff', background: 'var(--butter)', fontSize: 'clamp(40px, 7vmin, 56px)', boxShadow: '0 0 0 6px rgba(255,79,154,.45), var(--shadow)', padding: '0 20px' }}>
          ✈️🏠
        </motion.button>
      )}
    </motion.div>
  )
}

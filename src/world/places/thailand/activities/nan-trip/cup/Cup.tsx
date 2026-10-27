// The Nan Mountain Cup's race screen (section `race`; greybox 1): the 3D race (race.ts) with its tap targets and the
// hint finger, the races' HUD over it (trip/race/RaceHud.tsx: her place and everyone's faces, coins, the minimap, the
// countdown, the banners), and on a phone the tilt steering and the gas pedal, as in the boat race. When the race is
// over (everyone over the line, the fireworks going), it hands over to the podium on the race ground (Ground.tsx).
import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { bigCelebration, sounds, useLandscape } from '../../../../../../sdk'
import { Anchors } from '../../../../../engine3d/Anchors'
import { flag } from '../../../../../engine3d/flags'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { TripGuide } from '../../../trip/legs/Guide'
import { GasPedal } from '../../../trip/race/GasPedal'
import { Banner, CoinsAndMap, Countdown, Standings, type Face } from '../../../trip/race/RaceHud'
import { askForTilt, needsAsking, steerFor, Tilt, type SteerMode } from '../../../trip/race/tilt'
import { TiltingPhone, TiltSetup } from '../../../trip/race/TiltSetup'
import { KART_ANCHORS, KartRace, type KartHud } from './race'
import { RIVALS, type RacerId, type Result, type RivalId } from './rivals'
import { Track, type TrackId } from './track'

const FACES: Record<RacerId, Face> = {
  kaylee: { icon: '🦄', color: 'var(--hotpink)', label: 'Kaylee' },
  taeng: { icon: RIVALS.taeng.icon, color: RIVALS.taeng.color, label: RIVALS.taeng.label },
  pao: { icon: RIVALS.pao.icon, color: RIVALS.pao.color, label: RIVALS.pao.label },
  moon: { icon: RIVALS.moon.icon, color: RIVALS.moon.color, label: RIVALS.moon.label },
}
const DOTS: RacerId[] = ['taeng', 'pao', 'moon', 'kaylee']

interface Props {
  track: TrackId
  result: Result
  packed: string[]
  /** The gifts on her kart (from the races she lost). */
  gifts?: readonly RivalId[]
  /** She has raced already this visit (a shorter start). */
  again?: boolean
  /** The race is over: her place (1 or 2), off to the podium. */
  onFinish: (place: number) => void
}

export function Cup({ track, result, packed, gifts = [], again: before = false, onFinish }: Props) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [hud, setHud] = useState<KartHud | null>(null)
  const [done, setDone] = useState(false)
  const worldRef = useRef<KartRace | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const mapEls = useRef(new Map<string, SVGElement>())
  const raced = useRef(before ? 1 : 0)
  const finish = useRef(onFinish)
  finish.current = onFinish
  const map = useMemo(() => new Track(track).map, [track])

  // On a phone, tilt to steer with a gas pedal (trip/race/tilt.ts), as in the boat race: the phone turned sideways (or
  // ▶ to play upright) and, on iOS, a tap to allow the tilt; a no there, or a phone that sends no tilt, drives with the
  // finger as on the iPad. `steer=tilt` / `steer=finger` in the link tries either anywhere.
  const [steerLink] = useState(() => flag('steer'))
  const [steer, setSteer] = useState<SteerMode>(() => steerFor(steerLink))
  const [tiltAllowed, setTiltAllowed] = useState(() => !needsAsking())
  const [upright, setUpright] = useState(false)
  const landscape = useLandscape()
  const tiltRef = useRef<Tilt | null>(null)
  const tilting = steer === 'tilt' && tiltAllowed
  const steerRef = useRef(tilting)
  steerRef.current = tilting
  const atWheel = mode === 'webgl' && !!hud && hud.phase !== 'finish' && !done
  const tiltSetup: 'turn' | 'ask' | null = steer !== 'tilt' || !atWheel ? null : !landscape && !upright ? 'turn' : !tiltAllowed ? 'ask' : null
  useEffect(() => {
    if (!tilting) return
    const t = (tiltRef.current ??= new Tilt())
    t.start()
    const check = setTimeout(() => {
      if (!t.live && steerLink !== 'tilt') setSteer('finger')
    }, 1500)
    return () => {
      clearTimeout(check)
      t.stop()
    }
  }, [tilting, key])
  useEffect(() => worldRef.current?.setSteer(tilting ? 'tilt' : 'finger', tiltRef.current), [tilting, key])
  useEffect(() => worldRef.current?.setWaiting(!!tiltSetup), [tiltSetup, key])

  // Confetti on the screen too, as she crosses the line.
  useEffect(() => {
    if (hud?.phase === 'finish') bigCelebration()
  }, [hud?.phase === 'finish'])

  const make = (renderer: WebGLRenderer) => {
    const w = new KartRace(renderer, { track, result, packed, again: raced.current > 0, gifts }, {
      onHud: setHud,
      onDone: (place) => {
        setDone(true)
        // (A moment of the fireworks, then the podium.)
        setTimeout(() => finish.current(place), 700)
      },
    })
    w.setHintElement(hintRef.current)
    w.setMapElements(mapEls.current)
    w.setSteer(steerRef.current ? 'tilt' : 'finger', (tiltRef.current ??= new Tilt()))
    return w
  }

  const racing = !!hud && !done && (hud.phase === 'race' || hud.phase === 'count' || hud.phase === 'finish')
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#BFE3F2', overflow: 'clip' }}>
      <View3D
        key={key}
        name="The Nan Mountain Cup"
        qaKey="__thaiNanQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={KART_ANCHORS} els={els} {...input} />
            {/* After a while with nothing touched: a finger on the road ahead. */}
            <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
              <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.0, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
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
            setKey((k) => k + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(191,227,242,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🏁 Tap to wake the race
        </button>
      )}
      {mode === 'webgl' && hud && (
        <>
          {racing && <Standings hud={hud} faces={FACES} me="kaylee" />}
          {racing && <CoinsAndMap hud={hud} map={map} dots={DOTS} faces={FACES} me="kaylee" mapEls={mapEls.current} road="#C9B5F7" />}
          {tilting && atWheel && <GasPedal onGas={(down) => worldRef.current?.gas(down)} eager={hud.phase !== 'race'} />}
          {tilting && (hud.phase === 'intro' || hud.phase === 'count') && (
            <div aria-hidden style={{ position: 'absolute', left: '50%', bottom: 'calc(var(--safe-bottom) + 14px)', translate: '-50% 0', zIndex: 32, pointerEvents: 'none', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.25))' }}>
              <TiltingPhone size="clamp(84px, 15vmin, 120px)" />
            </div>
          )}
          <Countdown count={hud.count} />
          <Banner banner={hud.banner} texts={{ final: '🏁 Nearly there!' }} />
        </>
      )}
      {mode === 'webgl' && <TripGuide hidden={done} />}
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
    </div>
  )
}

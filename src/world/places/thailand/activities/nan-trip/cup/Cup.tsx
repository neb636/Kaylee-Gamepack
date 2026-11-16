// The Nan Mountain Cup's race screen (section `race`; greybox 1): the 3D race (race.ts) with its tap targets, the
// finger wheel's pink circle (engine3d/SteerWheel, as on the Nan drive) and the hint finger, the races' HUD over it (trip/race/RaceHud.tsx: her place and everyone's faces, coins, the minimap, the
// countdown, the banners). When the race is over (everyone over the line, the fireworks going), it hands over to the podium on the race ground (Ground.tsx).
import { useEffect, useMemo, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { bigCelebration, useTimers } from '../../../../../../sdk'
import { Anchors } from '../../../../../engine3d/Anchors'
import { SteerHint, SteerWheel } from '../../../../../engine3d/SteerWheel'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import { Banner, CoinsAndMap, Countdown, Standings, type Face } from '../../../trip/race/RaceHud'
import { KART_ANCHORS, KartRace, type KartHud } from './race'
import { RIVALS, type RacerId, type Result, type RivalId } from './rivals'
import { Track, type TrackId } from './track'

const FACES: Record<RacerId, Face> = {
  kaylee: { icon: '🦄', color: 'var(--hotpink)', label: 'You' },
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
  const timers = useTimers()
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const [hud, setHud] = useState<KartHud | null>(null)
  const [done, setDone] = useState(false)
  const worldRef = useRef<KartRace | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<TripGuideHandle>(null)
  const mapEls = useRef(new Map<string, SVGElement>())
  const raced = useRef(before ? 1 : 0)
  const finish = useRef(onFinish)
  finish.current = onFinish
  const map = useMemo(() => new Track(track).map, [track])

  // Confetti on the screen too, as she crosses the line.
  useEffect(() => {
    if (hud?.phase === 'finish') bigCelebration()
  }, [hud?.phase === 'finish'])

  const make = (renderer: WebGLRenderer) => {
    const w = new KartRace(renderer, { track, result, packed, again: raced.current > 0, gifts }, {
      onHud: setHud,
      say: (l) => guideRef.current?.speak(l),
      onDone: (place) => {
        setDone(true)
        // (A moment of the fireworks, then the podium.)
        timers.later(() => finish.current(place), 700)
      },
    })
    w.setHintElement(hintRef.current)
    w.setWheelElement(wheelRef.current)
    w.setMapElements(mapEls.current)
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
            {/* While she steers: the pink circle where her finger went down (the Nan drive's finger wheel). */}
            <SteerWheel ref={wheelRef} />
            {/* After a while with nothing touched: a finger sliding side to side, the way the wheel steers. */}
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(191,227,242,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🏁 Tap to wake the race
        </button>
      )}
      {mode === 'webgl' && hud && (
        <>
          {racing && <Standings hud={hud} faces={FACES} me="kaylee" />}
          {racing && <CoinsAndMap hud={hud} map={map} dots={DOTS} faces={FACES} me="kaylee" mapEls={mapEls.current} road="#C9B5F7" />}
          <Countdown count={hud.count} />
          <Banner banner={hud.banner} texts={{ final: '🏁 Nearly there!' }} />
        </>
      )}
      {mode === 'webgl' && <TripGuide ref={guideRef} hidden={done} />}
    </div>
  )
}

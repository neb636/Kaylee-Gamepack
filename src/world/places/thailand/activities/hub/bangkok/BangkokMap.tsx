// The Bangkok map's screen (notes: planning/around-the-world/thailand/bangkok-map.md): what opens when she taps
// Bangkok on the Thailand map. The 3D diorama (map3d.ts) with its tap targets, the 👆 after a while with nothing
// touched, the loading cover it fades in from (trip/MapCover.tsx) and Sparkle in the corner: her hello once a visit,
// something true the first time each thing is poked, and where to go when she's stuck (lines.ts L.bangkok).
//
// A pin tapped (the camera has dived in): the house opens where she left it (the tuk-tuk ride the first time);
// ICONSIAM opens the mall day, straight at the mall (a day half done, or after her first whole day: the day pass asks
// where to start, as it does in the house). Back up to the Thailand map is the top-left button. The mall day's stamp
// floats beside ICONSIAM's pin once she has it: it lands the first time she sees this map with it (or `stamp=mall-trip`).
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { speakingVoice, spendHint, useSaved, useTimers, type Line } from '../../../../../../sdk'
import { onDevice } from '../../../../../../sdk/device'
import { worldLink } from '../../../../../../router'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { useSections } from '../../../../../kit/sections'
import type { PlaceProps } from '../../../../../types'
import { L } from '../../../lines'
import { MapCover } from '../../../trip/MapCover'
import { saidYes } from '../../../trip/legs/Ask'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import { tripSession } from '../../../trip/session'
import { SKY_TOP } from '../../../trip/sky'
import HUB_SECTIONS from '../sections'
import type { PlaceId } from './layout'
import { BANGKOK_CAM, BangkokMap as MapWorld, MAP_ANCHORS } from './map3d'

// Once a visit to the app: Sparkle's hello, and each thing's fact.
let welcomed = false
const told = new Set<string>()

export function BangkokMap({ meta, stamps, openActivity }: PlaceProps) {
  const timers = useTimers()
  const { param, enter } = useSections(HUB_SECTIONS)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  // The mall day's stamp: she has it; and it lands now (the link says so, or she hasn't seen it on this map yet).
  const mall = stamps.includes('mall-trip')
  const [seen, setSeen] = useSaved('thailand-bangkok-map', { mall: false })
  const [fresh] = useState(() => mall && (param('stamp') === 'mall-trip' || !seen.mall))
  // Where the mall day stands (MallTrip.tsx saves it): a day half done or a whole day done before asks where to start.
  const [day] = useSaved<{ at: string | null; trips?: number }>('thailand-mall-trip', { at: null })
  // The loading screen stays over the board while the camera already starts moving, then fades into it (trip/sky.ts).
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    enter('bangkok', {})
    // (If the board never draws, say the camera lab froze it, the cover still goes.)
    const safety = timers.later(() => setRevealed(true), 6000)
    return () => clearTimeout(safety)
  }, [])
  // Once she can see the board: Sparkle's hello (not over the stamp landing), and the stamp counts as seen.
  useEffect(() => {
    if (!revealed) return
    if (mall && !seen.mall) setSeen({ mall: true })
    if (welcomed || fresh) return
    const hello = timers.later(() => {
      welcomed = true
      guide.current?.speak(L.bangkok.hello)
    }, 500)
    return () => clearTimeout(hello)
  }, [revealed])

  const worldRef = useRef<MapWorld | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const guide = useRef<TripGuideHandle>(null)

  const go = (place: PlaceId) => {
    if (place === 'house') return void (location.hash = worldLink(meta.id, 'hub', tripSession.house))
    // The mall day: straight to ICONSIAM. A day half done, or a whole one done before: the day pass asks where to start.
    if ((day.trips ?? 0) > 0 || (day.at && day.at !== 'goodbye')) {
      saidYes.at = performance.now()
      saidYes.trip = 'mall-trip'
      return openActivity('mall-trip')
    }
    location.hash = worldLink(meta.id, 'mall-trip', 'arrive')
  }
  const poked = (id: string) => {
    const fact: Line | undefined = L.bangkok.pokes[id] ?? (id === 'tuktuk' ? L.map.pokes.tuktuk : undefined)
    // (Wat Arun says its name every time she taps it; the rest tell their fact the first time.)
    if (!fact || (told.has(id) && id !== 'arun') || speakingVoice()) return
    told.add(id)
    guide.current?.speak(fact)
  }
  const stuck = () => {
    if (speakingVoice()) return
    if (spendHint(L.bangkok.hint)) guide.current?.speak(L.bangkok.hint)
  }
  const ev = useRef({ go, poked, stuck })
  ev.current = { go, poked, stuck }

  const make = (renderer: WebGLRenderer) => {
    const w = new MapWorld(
      renderer,
      { say: (l) => guide.current?.speak(l), section: () => {}, done: () => {}, go: (p) => ev.current.go(p), poked: (id) => ev.current.poked(id), stuck: () => ev.current.stuck(), revealed: () => setRevealed(true) },
      { mall, fresh },
    )
    w.setHintElement(hintRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: SKY_TOP, overflow: 'clip' }}>
      <View3D
        key={key}
        name="The Bangkok map"
        qaKey="__thaiBangkokQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={MAP_ANCHORS} els={els} {...input} />
            {/* After a while with nothing touched: a finger on where to go. */}
            <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
              <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.0, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
                👆
              </motion.div>
            </div>
          </>
        )}
      />
      <MapCover show={!revealed && mode !== 'lost'} fade={BANGKOK_CAM.fade} />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setKey((k) => k + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(228,221,244,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🗺️ {onDevice('Tap to wake the map', 'Click to wake the map')}
        </button>
      )}
      <TripGuide ref={guide} />
    </div>
  )
}

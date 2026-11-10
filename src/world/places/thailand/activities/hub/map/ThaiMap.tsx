// The Thailand map (plan: planning/around-the-world/thailand/thailand-map.md): where Kaylee lands in Thailand. A toy
// map in 3D (world.ts): Thailand stands up out of the sea, with a little model of each place she can go and a bobbing
// pin over it. Tap one and it opens. Bangkok is Agong's house (the mall day starts in there). Krabi is the boat trip
// and the elephants, Nan the road trip, Koh Samet the island: the first of them each session packs and rides the window
// seat (trip/session.ts); after that she goes straight there (Krabi airport, the Nan map, the island where she left
// it or the speedboat). A trip ends back here (`stamp=<trip>`): the stamp lands on its pin. Each pin wears its trip's
// stamp.
//
// Everything on the map does something when she pokes it (the elephants, the rain cloud over Nan, the gibbon, the
// buffalo, the hornbill, the tuk-tuk, the dolphins, the longtail boat, the coconut palm, Sparkle's balloon). Sparkle
// says something true the first time she meets each (lines.ts L.map), welcomes her once a session and glows the pins
// after ~8 s with nothing touched.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sounds } from '../../../../../../sdk'
import { worldLink } from '../../../../../../router'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type AnchorInput, type RenderMode } from '../../../../../engine3d/View3D'
import { sfx } from '../../../../../kit/sfx'
import { useSections } from '../../../../../kit/sections'
import type { PlaceProps } from '../../../../../types'
import { L } from '../../../lines'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import { tripSession } from '../../../trip/session'
import { readSametSave } from '../../samet-trip/trip'
import HUB_SECTIONS from '../sections'
import { PINS, type Pin, type PinId, type ToyId } from './geo'
import { MAP_ANCHORS, ThaiMapWorld, type MapEvents } from './world'

// Once a session: Sparkle's welcome, and each thing's fact.
let welcomed = false
const told = new Set<string>()

export function ThaiMap({ meta, stamps, openActivity }: PlaceProps) {
  const { param, enter } = useSections(HUB_SECTIONS)
  // Read once: the stamp that lands (the end of a trip).
  const [arriving] = useState(() => param('stamp') || null)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [engine, setEngine] = useState(0)
  const worldRef = useRef<ThaiMapWorld | null>(null)
  const guide = useRef<TripGuideHandle>(null)
  const [hint, setHint] = useState(false)
  const [picked, setPicked] = useState<PinId | null>(null)
  const pickedRef = useRef<PinId | null>(null)
  const lastTouch = useRef(performance.now() + 3000)
  // The stamp that lands: hidden on its pin until it drops in.
  const [landed, setLanded] = useState(!arriving)

  const live = (pin: Pin) => pin.id === 'bangkok' || meta.activities.some((a) => a.id === pin.activity)
  const stamped = (pin: Pin) => stamps.includes(pin.activity) && (landed || pin.activity !== arriving)
  const allStamps = meta.activities.length > 0 && meta.activities.every((a) => stamps.includes(a.id))
  const pins = PINS.filter(live)
  const done = pins.filter(stamped).map((p) => p.id)
  const doneKey = done.join(',')

  useEffect(() => {
    enter('map', {})
    if (!welcomed && !arriving) {
      welcomed = true
      setTimeout(() => guide.current?.speak(L.map.hello), 600)
    }
    const land = arriving
      ? setTimeout(() => {
          setLanded(true)
          sfx.thump()
          setTimeout(() => sounds.sparkle(), 250)
        }, 900)
      : undefined
    // After ~8 s with nothing touched the pins glow. No voice: it's a toy map, and she just heard the welcome.
    const idle = setInterval(() => {
      if (performance.now() - lastTouch.current < 8000) return
      setHint(true)
    }, 1000)
    return () => {
      clearTimeout(land)
      clearInterval(idle)
    }
  }, [])

  // The 3D pins show what the page knows: which places are stamped, and when Sparkle is hinting.
  useEffect(() => worldRef.current?.setPins(pins.map((p) => p.id), done, hint), [doneKey, hint, engine])

  /** That place opens: Bangkok the house; Krabi, Nan or Koh Samet the trip (packing first, the first time this session). */
  const go = (id: PinId) => {
    if (id === 'bangkok') return void (location.hash = worldLink(meta.id, 'hub', tripSession.house))
    const trip = PINS.find((p) => p.id === id)!.activity
    if (!tripSession.kitDone) {
      tripSession.kitDone = true
      location.hash = worldLink(meta.id, trip, 'pack')
    } else if (id === 'samet') location.hash = worldLink(meta.id, trip, readSametSave()?.at ? 'island' : 'speedboat')
    else location.hash = id === 'krabi' ? worldLink(meta.id, trip, 'land', { quick: '1' }) : worldLink(meta.id, trip, 'map')
  }

  const events = useRef<MapEvents>(null!)
  events.current = {
    touched: () => {
      lastTouch.current = performance.now()
      setHint(false)
    },
    pin: (id) => {
      if (pickedRef.current) return
      pickedRef.current = id
      setPicked(id)
      sounds.pop()
      setTimeout(() => sounds.sparkle(), 120)
      // The camera swoops down to the place, then it opens.
      setTimeout(() => go(id), 900)
    },
    poked: (id: ToyId) => {
      const fact = L.map.pokes[id]
      if (fact && !told.has(id)) {
        told.add(id)
        guide.current?.speak(fact)
      }
    },
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#CFE9FF', overflow: 'clip' }}>
      <View3D
        key={engine}
        name="The Thailand map"
        qaKey="__thaiMapQA"
        worldRef={worldRef}
        onMode={setMode}
        make={(renderer) => {
          const world = new ThaiMapWorld(renderer, { pin: (id) => events.current.pin(id), poked: (id) => events.current.poked(id), touched: () => events.current.touched() })
          world.setPins(pins.map((p) => p.id), done, false)
          return world
        }}
        anchors={(input, els) => (
          <>
            <Anchors list={MAP_ANCHORS} els={els} {...input} />
            <PinTargets input={input} els={els} pins={pins} picked={picked}>
              {(pin) => {
                const act = meta.activities.find((a) => a.id === pin.activity) ?? meta.inTheWorks?.find((a) => a.id === pin.activity)
                const fresh = pin.activity === arriving && landed
                return (
                  <AnimatePresence>
                    {stamped(pin) && act && (
                      <motion.img
                        key="stamp"
                        src={act.sticker.img}
                        alt=""
                        initial={fresh ? { scale: 3.2, rotate: -40, opacity: 0 } : false}
                        animate={{ scale: 1, rotate: -12, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                        style={{ position: 'absolute', left: '50%', top: '0%', translate: '-50% -50%', width: 'clamp(46px, 7.5vmin, 68px)', height: 'clamp(46px, 7.5vmin, 68px)', objectFit: 'contain', background: '#fff', borderRadius: '50%', border: '4px solid var(--hotpink)', padding: 3, boxShadow: 'var(--shadow)', pointerEvents: 'none' }}
                      />
                    )}
                  </AnimatePresence>
                )
              }}
            </PinTargets>
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setEngine((n) => n + 1)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(227,243,255,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)' }}
        >
          🗺️ Tap to wake the map
        </button>
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
          style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 14px)', bottom: 'calc(var(--safe-bottom) + 14px)', width: 88, height: 88, borderRadius: '50%', border: '4px solid #fff', background: 'var(--butter)', fontSize: 44, boxShadow: 'var(--shadow)', zIndex: 20 }}
        >
          🎉
        </motion.button>
      )}
      <TripGuide ref={guide} />
    </div>
  )
}

/** The pins' tap targets: see-through buttons the world keeps over each place's model and its pin (the stamp she
 *  earned there rides on top). */
function PinTargets({ input, els, pins, picked, children }: { input: AnchorInput; els: Map<string, HTMLElement>; pins: Pin[]; picked: PinId | null; children: (pin: Pin) => React.ReactNode }) {
  return (
    <>
      {pins.map((pin) => (
        <button
          key={pin.id}
          ref={(el) => {
            if (el) els.set(`pin:${pin.id}`, el)
            else els.delete(`pin:${pin.id}`)
          }}
          aria-label={pin.label}
          data-anchor={`pin:${pin.id}`}
          data-picked={picked === pin.id || undefined}
          onPointerDown={(e) => {
            e.preventDefault()
            input.onDown(e, `pin:${pin.id}`)
          }}
          onClick={(e) => e.detail === 0 && input.onKey(`pin:${pin.id}`)}
          style={{ position: 'absolute', left: 0, top: 0, display: 'none', padding: 0, border: 'none', borderRadius: '50%', background: 'transparent', touchAction: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
        >
          {children(pin)}
        </button>
      ))}
    </>
  )
}

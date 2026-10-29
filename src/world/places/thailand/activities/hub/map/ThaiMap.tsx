// The Thailand map (plan: planning/around-the-world/thailand/thailand-map.html): where Kaylee lands in Thailand. A clay
// diorama of the whole country on a paper map (world.ts, board.ts; Dad, 2026-10-29: "replace the flat Thailand map with
// something like this") with a pin floating over each place on its pole: tap one (or the place's toy) and it opens, like
// Australia's map. Bangkok is Agong's house (the mall day starts in there). Krabi is the boat trip and the elephants,
// Nan the road trip: the first of them each session packs and rides the window seat (trip/session.ts); after that she
// goes straight there (Krabi airport, or the Nan map). A trip ends back here (`stamp=<trip>`): the stamp lands on its
// pin. Each pin wears its trip's stamp.
//
// Things to poke (tap them): the elephant, the rain cloud over Nan, the gibbon, the buffalo, the hornbill, the tuk-tuk,
// the dolphins, the longtail boat, the coconut palm, and the hot-air balloons. Each acts it out in 3D (world.ts) with its
// sound here; Sparkle says something true the first time she meets each (lines.ts L.map; the balloons just whoosh),
// welcomes her once a session and hints after ~8 s with nothing touched.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { sounds } from '../../../../../../sdk'
import { worldLink } from '../../../../../../router'
import { Anchors } from '../../../../../engine3d/Anchors'
import { View3D, type RenderMode } from '../../../../../engine3d/View3D'
import { noise, sfx, tone } from '../../../../../kit/sfx'
import { useSections } from '../../../../../kit/sections'
import type { PlaceProps } from '../../../../../types'
import { L } from '../../../lines'
import { TripGuide, type TripGuideHandle } from '../../../trip/legs/Guide'
import { tripSession } from '../../../trip/session'
import HUB_SECTIONS from '../sections'
import { PINS, type Pin, type PinId, type PokeId } from './geo'
import { THAI_MAP_ANCHORS, ThaiMapWorld } from './world'

// Once a session: Sparkle's welcome, and each thing's fact.
let welcomed = false
const told = new Set<PokeId>()

const POKE_SOUND: Record<PokeId, () => void> = {
  elephant: () => (tone(220, 520, 0.35, 0.08, 'sawtooth'), tone(260, 600, 0.3, 0.05, 'square', 0.05)),
  clouds: () => [0, 0.1, 0.2, 0.32, 0.45, 0.6].forEach((d) => noise(0.05, 0.03, 'highpass', 3500 + Math.random() * 2000, 3000, d, 1)),
  gibbon: () => [0, 0.22, 0.44].forEach((d, i) => tone(500 + i * 120, 900 + i * 150, 0.18, 0.06, 'sine', d)),
  buffalo: () => tone(140, 110, 0.6, 0.08, 'sawtooth'),
  hornbill: () => [0, 0.15].forEach((d) => tone(900, 600, 0.1, 0.06, 'square', d)),
  tuktuk: () => [0, 0.09, 0.18, 0.27].forEach((d) => tone(180, 160, 0.06, 0.06, 'square', d)),
  dolphins: () => (tone(1400, 2200, 0.12, 0.05, 'sine'), sfx.splash()),
  boat: () => (tone(300, 300, 0.25, 0.05, 'square'), noise(0.4, 0.04, 'bandpass', 600, 300)),
  palm: () => (sfx.boing(), setTimeout(() => sfx.thump(), 450)),
}

export function ThaiMap({ meta, stamps, openActivity }: PlaceProps) {
  const { param, enter } = useSections(HUB_SECTIONS)
  // Read once: the stamp that lands (the end of a trip).
  const [arriving] = useState(() => param('stamp') || null)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const worldRef = useRef<ThaiMapWorld | null>(null)

  const guide = useRef<TripGuideHandle>(null)
  const [hint, setHint] = useState(false)
  const [picked, setPicked] = useState<PinId | null>(null)
  const lastTouch = useRef(performance.now() + 3000)
  // The stamp that lands: hidden on its pin until it drops in.
  const [landed, setLanded] = useState(!arriving)

  const live = (pin: Pin) => pin.id === 'bangkok' || meta.activities.some((a) => a.id === pin.activity)
  const stamped = (pin: Pin) => stamps.includes(pin.activity) && (landed || pin.activity !== arriving)
  const allStamps = meta.activities.length > 0 && meta.activities.every((a) => stamps.includes(a.id))

  useEffect(() => {
    enter('map', {})
    if (!welcomed && !arriving) {
      welcomed = true
      setTimeout(() => guide.current?.speak(L.map.hello), 900)
    }
    const land = arriving
      ? setTimeout(() => {
          setLanded(true)
          sfx.thump()
          setTimeout(() => sounds.sparkle(), 250)
        }, 1200)
      : undefined
    // A hint after ~8 s with nothing touched (at most three): Sparkle says it and the pins glow.
    let hints = 0
    const idle = setInterval(() => {
      if (hints >= 3 || performance.now() - lastTouch.current < 8000) return
      hints++
      lastTouch.current = performance.now() + 4000
      guide.current?.speak(L.map.hint)
      setHint(true)
    }, 1000)
    return () => {
      clearTimeout(land)
      clearInterval(idle)
    }
  }, [])

  const touched = () => {
    lastTouch.current = performance.now()
    setHint(false)
  }

  /** That place opens: Bangkok the house; Krabi or Nan the trip (packing first, the first time this session). */
  const tapPin = (id: PinId) => {
    touched()
    if (picked) return
    if (!PINS.some((p) => p.id === id && live(p))) return
    setPicked(id)
    worldRef.current?.bouncePlace(id)
    sounds.pop()
    setTimeout(() => sounds.sparkle(), 120)
    setTimeout(() => {
      if (id === 'bangkok') return void (location.hash = worldLink(meta.id, 'hub', tripSession.house))
      const trip = PINS.find((p) => p.id === id)!.activity
      if (!tripSession.kitDone) {
        tripSession.kitDone = true
        location.hash = worldLink(meta.id, trip, 'pack')
      } else location.hash = id === 'krabi' ? worldLink(meta.id, trip, 'land', { quick: '1' }) : worldLink(meta.id, trip, 'map')
    }, 550)
  }

  const poke = (id: PokeId) => {
    touched()
    POKE_SOUND[id]()
    if (!told.has(id)) {
      told.add(id)
      guide.current?.speak(L.map.pokes[id])
    }
  }

  // The world calls back through refs (it's built once).
  const handlers = useRef({ tapPin, poke })
  handlers.current = { tapPin, poke }
  const make = (renderer: WebGLRenderer) =>
    new ThaiMapWorld(renderer, {
      say: (l) => guide.current?.speak(l),
      section: () => {},
      done: () => {},
      poke: (id) => handlers.current.poke(id),
      pin: (id) => handlers.current.tapPin(id),
      balloon: () => {
        touched()
        sounds.whoosh()
        noise(0.35, 0.05, 'bandpass', 900, 400)
      },
    })

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E9E1F6', overflow: 'clip' }}>
      <View3D
        key={key}
        name="The Thailand map"
        qaKey="__thaiMapQA"
        worldRef={worldRef}
        onMode={setMode}
        make={make}
        anchors={(input, els) => (
          <>
            <Anchors list={THAI_MAP_ANCHORS} els={els} {...input} />
            {/* The pins: round heads on poles over the places (the world moves them). Tap one and that place opens.
                The ones without a stamp yet bob (and glow when Sparkle hints). */}
            {PINS.filter(live).map((pin, i) => {
              const done = stamped(pin)
              const act = meta.activities.find((a) => a.id === pin.activity)
              const fresh = pin.activity === arriving && landed
              return (
                <div
                  key={pin.id}
                  ref={(el) => {
                    if (el) els.set(`pin:${pin.id}`, el)
                    else els.delete(`pin:${pin.id}`)
                  }}
                  style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none' }}
                >
                  <motion.button
                    aria-label={pin.label}
                    onClick={() => tapPin(pin.id)}
                    initial={{ scale: 0 }}
                    animate={{ scale: picked === pin.id ? 1.25 : 1, y: done || picked ? '0%' : ['0%', '-12%', '0%'] }}
                    transition={{ scale: { delay: 0.3 + i * 0.08, type: 'spring', stiffness: 400, damping: 18 }, y: { repeat: Infinity, duration: 1.4, delay: i * 0.2 } }}
                    whileTap={{ scale: 0.88 }}
                    className={hint || picked === pin.id ? 'world-glow' : undefined}
                    style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `5px solid ${done ? 'var(--hotpink)' : '#fff'}`, background: pin.color, boxShadow: 'var(--shadow)', fontSize: 'clamp(30px, 5.5vmin, 52px)', padding: 0, display: 'grid', placeItems: 'center', pointerEvents: 'auto', touchAction: 'manipulation' }}
                  >
                    <span aria-hidden>{pin.icon}</span>
                    <AnimatePresence>
                      {done && act && (
                        <motion.img
                          key="stamp"
                          src={act.sticker.img}
                          alt=""
                          initial={fresh ? { scale: 3.2, rotate: -40, opacity: 0 } : false}
                          animate={{ scale: 1, rotate: -12, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                          style={{ position: 'absolute', right: '-22%', top: '-22%', width: '58%', height: '58%', objectFit: 'contain', background: '#fff', borderRadius: '50%', border: '3px solid var(--hotpink)', padding: 2 }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              )
            })}
          </>
        )}
      />
      {mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setKey((k) => k + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(233,225,246,.88)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
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
      {mode === 'webgl' && <TripGuide ref={guide} />}
    </div>
  )
}

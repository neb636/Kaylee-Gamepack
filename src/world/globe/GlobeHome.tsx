// The home screen's map view: the globe in the sky, Sparkle's balloon beside it, and the flight. She spins the globe,
// taps a country's pin, and it happens right there: the globe turns the country to the front, the balloon flies down
// to it, and the screen opens from that spot (a tap skips it). The flight is the old "Up, up and away!" trip, without
// leaving the globe for another screen.
import { AnimatePresence, motion, useAnimationControls } from 'motion/react'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { go } from '../../router'
import { say, smooth, sounds, useGameLoop, useSaved, useTimers, type PuppetHandle } from '../../sdk'
import { HalloweenArt } from '../../shell/seasonal/Halloween'
import { Cloud, Star } from '../../shell/Sky'
import { Flag } from '../kit/Flag'
import { WORLD_LINES } from '../lines'
import { places, useListed, type PlaceEntry } from '../registry'
import { usePassport } from '../stamps'
import { Globe, type GlobeHandle, type GlobePin } from './Globe'
import { Medallion } from './Medallion'
import { BALLOON_RATIO, SparkleBalloon } from './SparkleBalloon'
import type { Continent } from './sphere'

/** The flight, in seconds: the globe turns, the balloon arrives, the screen opens from the pin, the country shows. */
const TURN = 0.9
const FLY = 1.3
const OPEN = FLY + 0.15
const LAND = OPEN + 0.55

const SKY_CLOUDS = [
  { top: '7%', width: 'clamp(110px, 17vw, 220px)', seconds: 120, delay: -30, opacity: 0.75 },
  { top: '58%', width: 'clamp(90px, 13vw, 170px)', seconds: 150, delay: -110, opacity: 0.6 },
  { top: '33%', width: 'clamp(70px, 10vw, 130px)', seconds: 180, delay: -70, opacity: 0.5 },
]
const SKY_STARS = [
  { left: '5%', top: '44%', size: 22, delay: 0.2 },
  { left: '12%', top: '80%', size: 16, delay: 1.3, color: '#fff' },
  { left: '31%', top: '6%', size: 18, delay: 0.9, color: '#fff' },
  { left: '57%', top: '4%', size: 14, delay: 1.8 },
  { left: '90%', top: '30%', size: 20, delay: 0.5, color: '#fff' },
  { left: '94%', top: '74%', size: 16, delay: 2.2 },
  { left: '72%', top: '92%', size: 14, delay: 1.1, color: '#fff' },
]

export function GlobeHome({ toggle, dock, halloween }: { toggle: ReactNode; dock: ReactNode; halloween: boolean }) {
  const passport = usePassport()
  const listed = useListed()
  const timers = useTimers()
  const screen = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const globe = useRef<GlobeHandle>(null)
  const balloon = useRef<HTMLDivElement>(null)
  const sparkle = useRef<PuppetHandle>(null)
  // The globe comes back the way she left it: facing the last country she flew to.
  const [facing, setFacing] = useSaved('world:globe-lon', 15)
  const [startLon] = useState(facing)
  const [label, setLabel] = useState<{ text: string; x: number; y: number } | null>(null)
  const [plop, setPlop] = useState<{ x: number; y: number; n: number } | null>(null)
  const hop = useAnimationControls()
  /** The country she is flying to, and (once the balloon is there) where on the screen it opens from. */
  const [flight, setFlight] = useState<{ entry: PlaceEntry; from?: { x: number; y: number } } | null>(null)
  const fly = useRef<{ id: string; t: number; opened: boolean; landed: boolean } | null>(null)
  const hide = useRef(0)
  const firstTime = passport.visited.length === 0

  const pins = useMemo<GlobePin[]>(
    () => listed.map(({ meta }) => ({ id: meta.id, label: meta.name, lon: meta.globe.lon, lat: meta.globe.lat, node: <Medallion meta={meta} stamps={(passport.stamps[meta.id] ?? []).length} sparkly={firstTime} /> })),
    [listed, passport, firstTime],
  )

  const land = () => {
    const f = fly.current
    if (!f || f.landed) return
    f.landed = true
    go.world(f.id)
  }

  const takeOff = (id: string) => {
    const entry = places.find((p) => p.meta.id === id)
    if (!entry || fly.current) return
    sounds.sparkle()
    sounds.whoosh()
    void say(WORLD_LINES.takeoff)
    void entry.load() // start downloading the country while she flies
    void sparkle.current?.play('cheer')
    setLabel(null)
    globe.current?.turnTo(id, TURN)
    const lon = globe.current?.view().lon ?? facing
    setFacing(Math.round(Math.abs(entry.meta.globe.lat) > 85 ? lon : entry.meta.globe.lon))
    fly.current = { id, t: 0, opened: false, landed: false }
    setFlight({ entry })
  }

  // The balloon: bobbing in its corner of the sky, or flying down onto a pin.
  useGameLoop((dt) => {
    const g = globe.current
    const el = balloon.current
    if (!g || !el) return
    const { cx, cy, R, pin } = g.layout()
    // Up in the corner, clear of the pins that come up over the globe's edge.
    const h = Math.min(240, Math.max(104, R * 0.68))
    const w = h * BALLOON_RATIO
    let x = Math.max(w / 2 + 4, cx - R * 1.23)
    let y = Math.max(h / 2 + 2, cy - R * 1.08)
    let size = 1
    const f = fly.current
    const to = f && g.spot(f.id)
    if (f && to) {
      f.t += dt
      const k = smooth(f.t / FLY)
      size = 1 - 0.4 * k
      // Its basket comes to rest on top of the pin; on the way it rises a little first, like a hop.
      x += (to.x - x) * k
      y += (to.y - (pin / 2) * to.scale - h * size * 0.44 - y) * k - Math.sin(Math.PI * k) * R * 0.1
      if (f.t >= OPEN && !f.opened) {
        f.opened = true
        const box = stage.current?.getBoundingClientRect()
        const whole = screen.current?.getBoundingClientRect()
        setFlight((now) => now && { ...now, from: { x: to.x + (box?.left ?? 0) - (whole?.left ?? 0), y: to.y + (box?.top ?? 0) - (whole?.top ?? 0) } })
      }
      if (f.t >= LAND) land()
    }
    el.style.width = `${w.toFixed(1)}px`
    el.style.height = `${h.toFixed(1)}px`
    el.style.transform = `translate3d(${(x - w / 2).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px, 0) scale(${size.toFixed(3)})`
    el.style.opacity = '1'
  })

  const name = (continent: Continent, x: number, y: number) => {
    const text = WORLD_LINES.continents[continent]
    sounds.pop()
    void say(text)
    setLabel({ text, x, y })
    timers.cancel(hide.current)
    hide.current = timers.later(() => setLabel(null), 2600)
  }

  const width = stage.current?.clientWidth ?? 0

  return (
    <div ref={screen} className={`screen decorated world-map${halloween ? ' halloween' : ''}`} style={{ overflow: 'hidden' }}>
      <div className="globe-sky" aria-hidden>
        {SKY_STARS.map((s, i) => (
          <Star key={i} size={s.size} color={s.color} delay={s.delay} style={{ left: s.left, top: s.top }} />
        ))}
        {SKY_CLOUDS.map((c, i) => (
          <div key={i} className="sky-drift" style={{ top: c.top, opacity: c.opacity, animationDuration: `${c.seconds}s`, animationDelay: `${c.delay}s` }}>
            <Cloud width={c.width} />
          </div>
        ))}
      </div>
      {toggle}

      <div ref={stage} className="globe-stage">
        <Globe
          ref={globe}
          pins={pins}
          startLon={startLon}
          held={!!flight}
          onPin={takeOff}
          onLand={name}
          onSea={(x, y) => {
            sounds.place()
            setLabel(null)
            setPlop((p) => ({ x, y, n: (p?.n ?? 0) + 1 }))
          }}
        />

        {/* A plop where she tapped the sea. */}
        {plop && <span key={plop.n} className="globe-plop" style={{ left: plop.x, top: plop.y }} />}

        {/* Sparkle's balloon: tap it and she cheers. */}
        <div ref={balloon} className="globe-balloon" style={{ opacity: 0 }}>
          <motion.div className="globe-balloon-hop" animate={hop}>
            <div className="sky-bob" style={{ position: 'absolute', inset: 0 }}>
              <SparkleBalloon ref={sparkle} />
            </div>
          </motion.div>
          <button
            className="globe-balloon-hit"
            aria-label="Sparkle"
            onClick={() => {
              if (flight) return
              sounds.whoosh()
              void hop.start({ y: [0, -34, 0], rotate: [0, -5, 4, 0], transition: { duration: 0.8, ease: 'easeOut' } })
              void sparkle.current?.play('cheer')
              void say(WORLD_LINES.hello)
            }}
          />
        </div>

        {halloween && (
          <div className="halloween-map-friends globe-guests" aria-hidden="true">
            <span>
              <HalloweenArt kind="pumpkin" />
            </span>
            <span>
              <HalloweenArt kind="ghost" />
            </span>
          </div>
        )}

        <AnimatePresence>
          {label && (
            <motion.div
              key={label.text}
              className="globe-label"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{ left: width ? Math.min(width - 110, Math.max(110, label.x)) : label.x, top: label.y }}
            >
              {label.text.split('!')[0]}!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The same floating dock as the game list. */}
      <div className="shelf-dock">{dock}</div>

      {flight && (
        // The flight: a tap anywhere skips it.
        <button className="globe-flight" aria-label="Skip" onClick={land}>
          {flight.from && (
            <motion.span
              className="globe-flight-open"
              initial={{ clipPath: `circle(0px at ${flight.from.x}px ${flight.from.y}px)` }}
              animate={{ clipPath: `circle(150vmax at ${flight.from.x}px ${flight.from.y}px)` }}
              transition={{ duration: LAND - OPEN + 0.25, ease: 'easeIn' }}
            />
          )}
          <motion.span className="globe-flight-name" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.45, delay: 0.15 }}>
            <Flag id={flight.entry.meta.flag} width="1.7em" style={{ borderWidth: 3, flexShrink: 0 }} />
            {flight.entry.meta.name}!
          </motion.span>
        </button>
      )}
    </div>
  )
}

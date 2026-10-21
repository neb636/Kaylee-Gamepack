// The mall day at ICONSIAM (plan: planning/around-the-world/thailand/mall-trip.md). Greybox 1: only HarborLand's
// playground (harborland/harborland.ts), the toy with no goal, in shapes and without voices, so Dad can feel climbing
// up and sliding down on the iPad first. Its sections (play, mountain, dragon) follow the floor she's on. Each big ride
// puts a sticker on her sock band in the corner. The trip around it (Mommy's question, the Veloz, the lift and the
// socks, the pizza, home) comes in later gates.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../engine/Anchors'
import { View3D, type RenderMode } from '../../engine/View3D'
import { Flat } from './Flat'
import { HARBOR_ANCHORS, HarborLand, SOCK_COLORS, type HarborSection } from './harborland/harborland'
import { RIDE_ICONS, RIDES, type RideId } from './harborland/layout'
import MALL_SECTIONS from './sections'

const list = (s: string) => s.split(',').filter((x): x is RideId => (RIDES as readonly string[]).includes(x))

export function MallTrip() {
  const { start, param, enter } = useSections(MALL_SECTIONS)
  const first: HarborSection = start ?? 'play'
  const [socks] = useState(() => param('socks'))
  const [rides, setRides] = useState<RideId[]>(() => list(param('rides')))
  const [section, setSection] = useState<HarborSection>(first)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const worldRef = useRef<HarborLand | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const state = useRef({ section, rides })
  state.current = { section, rides }

  const params = () => ({ socks, rides: state.current.rides.join(',') })
  useEffect(() => enter(first, params()), [])
  const ready = useRef(false)
  useEffect(() => {
    if (!ready.current) {
      ready.current = true
      return
    }
    enter(section, params())
  }, [section, rides])

  const make = (renderer: WebGLRenderer) => {
    const w = new HarborLand(renderer, {
      say: () => {},
      done: () => {},
      section: (s) => setSection(s as HarborSection),
      ride: (id) => setRides((r) => (r.includes(id) ? r : [...r, id])),
    }, { section: state.current.section, socks, rides: state.current.rides })
    w.setHintElement(hintRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F1E8FF', overflow: 'clip' }}>
      {mode === 'flat' ? (
        <Flat section={section} rides={rides} onSection={setSection} onRide={(id) => setRides((r) => (r.includes(id) ? r : [...r, id]))} />
      ) : (
        <View3D
          key={key}
          name="HarborLand"
          qaKey="__thaiMallQA"
          worldRef={worldRef}
          onMode={setMode}
          make={make}
          anchors={(input, els) => (
            <>
              <Anchors list={HARBOR_ANCHORS} els={els} {...input} />
              {/* After a while with nothing touched: a finger pressing the next ride. */}
              <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
                <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
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
          style={{ position: 'absolute', inset: 0, background: 'rgba(241,232,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🛝 Tap to wake the playground
        </button>
      )}
      <SockBand rides={rides} color={SOCK_COLORS[socks] ?? SOCK_COLORS.pink} />
    </div>
  )
}

/** Her sock band in the corner: a sticker for each big ride, popping in the first time. */
export function SockBand({ rides, color }: { rides: RideId[]; color: string }) {
  return (
    <div
      aria-label={`Stickers: ${rides.length} of ${RIDES.length}`}
      style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 12px)', top: 'calc(var(--safe-top) + 14px)', display: 'flex', gap: 'clamp(3px, 0.6vw, 6px)', padding: 'clamp(5px, 0.9vw, 8px) clamp(8px, 1.4vw, 12px)', borderRadius: 999, background: color, border: '4px solid #fff', boxShadow: 'var(--shadow)', zIndex: 30, pointerEvents: 'none' }}
    >
      {RIDES.map((id) => (
        <div key={id} style={{ width: 'clamp(30px, 4.6vmin, 44px)', height: 'clamp(30px, 4.6vmin, 44px)', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.55)', border: '2px dashed rgba(255,255,255,.9)', fontSize: 'clamp(18px, 3vmin, 28px)' }}>
          <AnimatePresence>
            {rides.includes(id) && (
              <motion.span key={id} initial={{ scale: 0, rotate: -40 }} animate={{ scale: [0, 1.5, 1], rotate: 0 }} transition={{ duration: 0.5 }}>
                {RIDE_ICONS[id]}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

// Venice's scenery: the generated sprites laid out in code, in canal units (y = 0 is the waterline, negative is up).
// One camera for everything: straight-on side view. Nearly everything answers a tap (play-design: "everything reacts"):
// houses wiggle and someone pops up in a window, bell towers bong, laundry flaps, pigeons fly off and come back, the
// winged lion roars. None of it is an answer to anything.
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { sfx } from '../../../../kit/sfx'
import { INK } from '../../puppets/ink'
import { BRIDGES, clouds, critters, houses, posts, props, skyline, windowFriends } from './art'
import { BOLLARDS, BRIDGE_CROWN, CLOUD_LIST, FEEL, LANE, LION_X, MAIN_BRIDGES, PIGEONS, QUAY_Y, SIDE_CANALS, SKYLINE, type Facade, type House as HouseData } from './canal'
import { vsfx } from './sfx'

/** Where a window friend pops up on each facade: x center and sill y (shares of the facade's width and height). */
const WINDOW: Record<Facade, [number, number]> = {
  butter: [0.27, 0.56],
  coral: [0.22, 0.56],
  lavender: [0.25, 0.6],
  maskshop: [0.24, 0.34],
  mint: [0.27, 0.56],
  peach: [0.26, 0.56],
  pink: [0.25, 0.4],
  sky: [0.23, 0.31],
}

/** A canal house facade. Tap: it wiggles and a friend pops up in a window (a cat, a nonna, a baby pigeon). */
export function House({ house, index }: { house: HouseData; index: number }) {
  const [taps, setTaps] = useState(0)
  const [peek, setPeek] = useState(false)
  const friend = windowFriends[(index + taps) % windowFriends.length]
  const [wx, wy] = WINDOW[house.facade]
  const fw = house.w * 0.24
  return (
    <motion.button
      aria-label={house.pink ? 'pink house' : house.facade === 'maskshop' ? 'mask shop' : 'house'}
      animate={taps ? { rotate: [0, -1.2, 0.9, -0.4, 0], y: [0, -8, 0] } : {}}
      transition={{ duration: 0.45 }}
      onClick={() => {
        setTaps((n) => n + 1)
        setPeek(true)
        sfx.pop()
        setTimeout(() => setPeek(false), 2200)
      }}
      style={{ position: 'absolute', left: house.x, top: -house.h, width: house.w, height: house.h, padding: 0, border: 'none', background: 'none', transformOrigin: '50% 100%', cursor: 'pointer' }}
    >
      <img src={houses[house.facade]} alt="" draggable={false} style={{ display: 'block', width: '100%', height: '100%' }} />
      <AnimatePresence>
        {peek && (
          <motion.img
            key={taps}
            src={friend.img}
            alt=""
            draggable={false}
            initial={{ y: fw / friend.aspect, opacity: 0 }}
            animate={{ y: 0, opacity: 1, rotate: [0, -6, 6, 0] }}
            exit={{ y: fw / friend.aspect, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.45 }}
            style={{ position: 'absolute', left: house.w * wx - fw / 2, top: house.h * wy - fw / friend.aspect, width: fw, height: fw / friend.aspect, pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/** Side canals between houses: a strip of water going back between the houses, a little bridge across it, and in one
 *  of them a washing line that flaps when tapped. */
export function SideCanals() {
  const [flap, setFlap] = useState(0)
  return (
    <>
      {SIDE_CANALS.map((c, i) => {
        const bridge = i % 2 ? BRIDGES.mid : BRIDGES.low
        const bw = c.w + 40
        const bh = bw / bridge.aspect
        const lw = c.w + 60
        return (
          <div key={c.x} style={{ position: 'absolute', left: c.x, top: 0, width: c.w }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: -60, height: 64, background: '#5FB4DD', borderTop: `4px solid ${INK}`, pointerEvents: 'none' }} />
            <img src={bridge.img} alt="" draggable={false} style={{ position: 'absolute', left: -20, top: 4 - bh, width: bw, height: bh, pointerEvents: 'none' }} />
            {i === 1 && (
              <motion.button
                aria-label="laundry"
                animate={flap ? { skewX: [0, 8, -6, 4, 0], y: [0, -6, 0] } : {}}
                transition={{ duration: 0.7 }}
                onClick={() => {
                  setFlap((n) => n + 1)
                  sfx.fwip()
                }}
                style={{ position: 'absolute', left: -30, top: -330, width: lw, height: lw / props.laundry.aspect, padding: 0, border: 'none', background: 'none' }}
              >
                <img key={flap} src={props.laundry.img} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
              </motion.button>
            )}
          </div>
        )
      })}
    </>
  )
}

/** The bridges over the main canal, drawn in front of the boat (it passes under them). Each is placed by its crown. */
export function MainBridges() {
  return (
    <>
      {MAIN_BRIDGES.map((b) => {
        const h = b.w / BRIDGES.high.aspect
        const top = BRIDGE_CROWN + BRIDGES.high.opening * h - h
        return <img key={b.x} src={BRIDGES.high.img} alt="" draggable={false} style={{ position: 'absolute', left: b.x - b.w / 2, top, width: b.w, height: h, pointerEvents: 'none' }} />
      })}
    </>
  )
}

/** A striped mooring post (a Venetian "palina") standing in one lane. Its wobble is set by the game loop. */
export function Post({ x, lane, postRef }: { x: number; lane: 'near' | 'front'; postRef: (el: HTMLDivElement | null) => void }) {
  const base = LANE[lane] + 26
  const h = FEEL.postHeight + 26
  return (
    <div ref={postRef} style={{ position: 'absolute', left: x - (h * posts.aspect) / 2, top: base - h, width: h * posts.aspect, height: h, transformOrigin: '50% 100%', pointerEvents: 'none' }}>
      <img src={posts[lane]} alt="" draggable={false} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}

/** The far skyline: paler and a little hazy, so it sits back. Bell towers bong when tapped. */
export function Skyline() {
  const [bong, setBong] = useState<number | null>(null)
  return (
    <>
      {SKYLINE.map((s, i) => {
        const k = skyline[s.kind]
        const style = { position: 'absolute', left: s.x, top: -180 - s.h, width: s.h * k.aspect, height: s.h, filter: 'saturate(0.75) brightness(1.06)', opacity: 0.85 } as const
        if (s.kind !== 'belltower') return <img key={i} src={k.img} alt="" draggable={false} style={{ ...style, pointerEvents: 'none' }} />
        return (
          <motion.img
            key={i}
            src={k.img}
            alt=""
            role="button"
            aria-label="bell tower"
            draggable={false}
            animate={bong === i ? { rotate: [0, 2, -2, 1, 0] } : {}}
            transition={{ duration: 1.2 }}
            onClick={() => {
              vsfx.bong()
              setBong(i)
              setTimeout(() => setBong(null), 1300)
            }}
            style={{ ...style, transformOrigin: '50% 100%', cursor: 'pointer' }}
          />
        )
      })}
    </>
  )
}

export function Clouds({ top }: { top: number }) {
  return (
    <>
      {CLOUD_LIST.map((c, i) => {
        const k = clouds[c.kind as 1 | 2]
        return <img key={i} src={k.img} alt="" draggable={false} style={{ position: 'absolute', left: c.x, top: top + c.y, width: c.w, height: c.w / k.aspect, pointerEvents: 'none' }} />
      })}
    </>
  )
}

/** A pigeon on the walkway: tap and it flies off, then comes back (in rain boots at high water). */
function Pigeon({ x, boots }: { x: number; boots: boolean }) {
  const [flying, setFlying] = useState(false)
  const k = flying ? critters.pigeonFly : boots ? critters.pigeonBoots : critters.pigeon
  const h = 64
  return (
    <motion.button
      aria-label="pigeon"
      animate={flying ? { x: [0, 60, 160], y: [0, -160, -420], opacity: [1, 1, 0] } : { x: 0, y: 0, opacity: 1 }}
      transition={flying ? { duration: 1.1, ease: 'easeIn' } : { type: 'spring', duration: 0.6 }}
      onClick={() => {
        if (flying) return
        setFlying(true)
        sfx.fwip()
        sfx.chirp()
        setTimeout(() => setFlying(false), 3200)
      }}
      style={{ position: 'absolute', left: x, top: QUAY_Y + 6 - h, width: h * k.aspect, height: h, padding: 0, border: 'none', background: 'none' }}
    >
      <img src={k.img} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
    </motion.button>
  )
}

function Lion() {
  const [roar, setRoar] = useState(0)
  const h = 200
  return (
    <motion.button
      aria-label="winged lion"
      animate={roar ? { scale: [1, 1.12, 0.96, 1], rotate: [0, -3, 2, 0] } : {}}
      transition={{ duration: 0.6 }}
      onClick={() => {
        setRoar((n) => n + 1)
        vsfx.roar()
      }}
      style={{ position: 'absolute', left: LION_X, top: QUAY_Y + 30 - h, width: h * critters.lion.aspect, height: h, padding: 0, border: 'none', background: 'none', transformOrigin: '50% 100%' }}
    >
      <img key={roar} src={critters.lion.img} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
    </motion.button>
  )
}

/** The stone edge of the walkway nearest to us (pale Istrian stone with a brown outline), its bollards, pigeons and the
 *  winged lion; it moves faster than the canal because it's closer. At high water, wooden walkways (passerelle) go up. */
export function Foreground({ width, high }: { width: number; high: boolean }) {
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: QUAY_Y, width, height: 400, background: '#F1E2CC', borderTop: `5px solid ${INK}`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 0, top: QUAY_Y + 10, width, height: 10, background: '#E2CBAA', pointerEvents: 'none' }} />
      {BOLLARDS.map((x) => (
        <div key={x} style={{ position: 'absolute', left: x, top: QUAY_Y - 32, width: 36, height: 44, borderRadius: '18px 18px 6px 6px', background: '#E48A62', border: `5px solid ${INK}`, pointerEvents: 'none' }} />
      ))}
      {high && <img src={props.passerella.img} alt="" draggable={false} style={{ position: 'absolute', left: 760, top: QUAY_Y - 40, width: 520, height: 520 / props.passerella.aspect, pointerEvents: 'none' }} />}
      <Lion />
      {PIGEONS.map((x) => (
        <Pigeon key={x} x={x} boots={high} />
      ))}
    </>
  )
}

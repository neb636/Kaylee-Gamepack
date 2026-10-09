// Venice's scenery: the generated sprites laid out in code, in canal units (y = 0 is the waterline, negative is up).
// One camera for everything: straight-on side view. Things answer a tap so the canal is already pokeable.
import { motion } from 'motion/react'
import { useState } from 'react'
import { sounds } from '../../../../../sdk'
import { INK } from '../../puppets/ink'
import { BRIDGES, clouds, houses, posts, skyline } from './art'
import { BIG_BRIDGE, BOLLARDS, CLOUD_LIST, FEEL, LANE, SIDE_CANALS, SKYLINE, type House as HouseData } from './canal'

/** A canal house facade. Tap: it wiggles. */
export function House({ house }: { house: HouseData }) {
  const [taps, setTaps] = useState(0)
  return (
    <motion.button
      aria-label={house.pink ? 'pink house' : 'house'}
      key={taps}
      initial={false}
      animate={taps ? { rotate: [0, -1.4, 1, -0.5, 0], y: [0, -10, 0] } : {}}
      transition={{ duration: 0.45 }}
      onClick={() => {
        setTaps((n) => n + 1)
        sounds.pop()
      }}
      style={{ position: 'absolute', left: house.x, top: -house.h, width: house.w, height: house.h, padding: 0, border: 'none', background: 'none', transformOrigin: '50% 100%', cursor: 'pointer' }}
    >
      <img src={houses[house.facade]} alt="" draggable={false} style={{ display: 'block', width: '100%', height: '100%' }} />
    </motion.button>
  )
}

/** Side canals between houses: a strip of water going back between the houses, and a little bridge across it. */
export function SideCanals() {
  return (
    <>
      {SIDE_CANALS.map((c, i) => {
        const bridge = i % 2 ? BRIDGES.mid : BRIDGES.low
        const bw = c.w + 40
        const bh = bw / bridge.aspect
        return (
          <div key={c.x} style={{ position: 'absolute', left: c.x, top: 0, width: c.w, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: -60, height: 64, background: '#5FB4DD', borderTop: `4px solid ${INK}` }} />
            <img src={bridge.img} alt="" draggable={false} style={{ position: 'absolute', left: -20, top: 4 - bh, width: bw, height: bh }} />
          </div>
        )
      })}
    </>
  )
}

/** The big bridge over the main canal: the boat passes under it (it's drawn in front of the boat). Its feet go down
 *  behind the stone edge in the foreground. */
export function BigBridge() {
  const h = BIG_BRIDGE.w / BRIDGES.high.aspect
  return <img src={BRIDGES.high.img} alt="" draggable={false} style={{ position: 'absolute', left: BIG_BRIDGE.x - BIG_BRIDGE.w / 2, top: 330 - h, width: BIG_BRIDGE.w, height: h, pointerEvents: 'none' }} />
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

/** The far skyline: paler and a little hazy, so it sits back. */
export function Skyline() {
  return (
    <>
      {SKYLINE.map((s, i) => {
        const k = skyline[s.kind]
        return <img key={i} src={k.img} alt="" draggable={false} style={{ position: 'absolute', left: s.x, top: -180 - s.h, width: s.h * k.aspect, height: s.h, filter: 'saturate(0.75) brightness(1.06)', opacity: 0.85 }} />
      })}
    </>
  )
}

export function Clouds({ top }: { top: number }) {
  return (
    <>
      {CLOUD_LIST.map((c, i) => {
        const k = clouds[c.kind as 1 | 2]
        return <img key={i} src={k.img} alt="" draggable={false} style={{ position: 'absolute', left: c.x, top: top + c.y, width: c.w, height: c.w / k.aspect }} />
      })}
    </>
  )
}

/** The stone edge of the walkway nearest to us (pale Istrian stone with a brown outline) and its bollards; it moves
 *  faster than the canal because it's closer. */
export function Foreground({ width }: { width: number }) {
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 290, width, height: 400, background: '#F1E2CC', borderTop: `5px solid ${INK}` }} />
      <div style={{ position: 'absolute', left: 0, top: 300, width, height: 10, background: '#E2CBAA' }} />
      {BOLLARDS.map((x) => (
        <div key={x} style={{ position: 'absolute', left: x, top: 258, width: 36, height: 44, borderRadius: '18px 18px 6px 6px', background: '#E48A62', border: `5px solid ${INK}` }} />
      ))}
    </>
  )
}

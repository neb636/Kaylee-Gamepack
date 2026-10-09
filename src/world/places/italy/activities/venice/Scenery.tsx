// Greybox scenery for Venice: plain shapes standing in for the art (gate 2 replaces them with sprites and puppets).
// Everything is in canal units; y = 0 is the waterline. Each piece answers a tap so the canal is already pokeable.
import { motion } from 'motion/react'
import { useState } from 'react'
import { sounds } from '../../../../../sdk'
import { INK } from '../../puppets/ink'
import { BOLLARDS, CLOUD_LIST, FEEL, LANE, ROOFTOPS, type House as HouseData } from './canal'

const OUT = 4

/** A canal house: a box with a cornice, two rows of windows and a door with a step into the water. Tap: it wiggles
 *  and a window lights up. The pink house lights one more window per friend delivered. */
export function House({ house, lit, doorOpen }: { house: HouseData; lit: number; doorOpen: boolean }) {
  const [taps, setTaps] = useState(0)
  const cols = Math.max(2, Math.floor(house.w / 110))
  const rows = house.h > 400 ? 3 : 2
  const windows = Array.from({ length: cols * rows }, (_, i) => i)
  // Tapping lights windows in a scattered order; the pink house also counts deliveries.
  const order = (i: number) => (i * 7 + house.w) % windows.length
  const litCount = Math.min(windows.length, (taps % (windows.length + 1)) + lit)
  return (
    <motion.button
      aria-label={house.pink ? 'pink house' : 'house'}
      key={taps}
      initial={false}
      animate={taps ? { rotate: [0, -1.6, 1.2, -0.6, 0], y: [0, -10, 0] } : {}}
      transition={{ duration: 0.45 }}
      onClick={() => {
        setTaps((n) => n + 1)
        sounds.pop()
      }}
      style={{
        position: 'absolute',
        left: house.x,
        top: -house.h,
        width: house.w,
        height: house.h,
        padding: 0,
        border: `${OUT}px solid ${INK}`,
        borderBottom: 'none',
        background: house.color,
        transformOrigin: '50% 100%',
        cursor: 'pointer',
      }}
    >
      {/* Cornice */}
      <div style={{ position: 'absolute', left: -14, right: -14, top: -OUT - 4, height: 30, background: house.roof, border: `${OUT}px solid ${INK}`, borderRadius: 6 }} />
      {/* Windows */}
      <div style={{ position: 'absolute', left: 26, right: 26, top: 52, bottom: 140, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 18, justifyItems: 'center', alignItems: 'center' }}>
        {windows.map((i) => (
          <div key={i} style={{ width: 46, height: '86%', maxHeight: 70, borderRadius: '23px 23px 4px 4px', border: `${OUT}px solid ${INK}`, background: order(i) < litCount ? '#FFE27A' : '#7FB0D6' }} />
        ))}
      </div>
      {/* Door and its step */}
      <div style={{ position: 'absolute', left: house.door - 38, bottom: 0, width: 76, height: 116, borderRadius: '38px 38px 0 0', border: `${OUT}px solid ${INK}`, borderBottom: 'none', background: doorOpen ? '#3B2418' : '#9A5B34' }} />
      <div style={{ position: 'absolute', left: house.door - 62, bottom: -14, width: 124, height: 18, background: '#E9DCC8', border: `${OUT}px solid ${INK}`, borderRadius: 4 }} />
    </motion.button>
  )
}

/** A striped mooring post (a Venetian "palina") standing in one lane. Its wobble is set by the game loop. */
export function Post({ x, lane, postRef }: { x: number; lane: 'near' | 'front'; postRef: (el: HTMLDivElement | null) => void }) {
  const base = LANE[lane] + 26
  return (
    <div
      ref={postRef}
      style={{
        position: 'absolute',
        left: x - 15,
        top: base - FEEL.postHeight - 26,
        width: 30,
        height: FEEL.postHeight + 26,
        borderRadius: '15px 15px 4px 4px',
        border: `${OUT}px solid ${INK}`,
        background: lane === 'near' ? 'repeating-linear-gradient(-30deg, #fff 0 22px, #5D8FD8 22px 44px)' : 'repeating-linear-gradient(-30deg, #fff 0 22px, #E2617A 22px 44px)',
        transformOrigin: '50% 100%',
        pointerEvents: 'none',
      }}
    />
  )
}

/** Far rooftops and bell towers: flat, pale, no outlines, so they sit back. */
export function Rooftops() {
  return (
    <>
      {ROOFTOPS.map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: r.x,
            top: -r.h,
            width: r.w,
            height: r.h,
            background: i % 2 ? '#E9C9C4' : '#DDBFD3',
            clipPath: r.tower ? 'polygon(50% 0, 100% 9%, 100% 100%, 0 100%, 0 9%)' : r.dome ? 'polygon(0 18%, 15% 8%, 35% 2%, 50% 0, 65% 2%, 85% 8%, 100% 18%, 100% 100%, 0 100%)' : 'polygon(0 6%, 100% 0, 100% 100%, 0 100%)',
          }}
        />
      ))}
    </>
  )
}

export function Clouds({ top }: { top: number }) {
  return (
    <>
      {CLOUD_LIST.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: c.x, top: top + c.y, width: c.w, height: c.w * 0.38, borderRadius: 999, background: 'rgba(255,255,255,.92)' }} />
      ))}
    </>
  )
}

/** The stone edge of the walkway nearest to us, with bollards (moves faster than the canal: it's closer). */
export function Foreground({ width }: { width: number }) {
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 290, width, height: 400, background: '#CDB89A', borderTop: `${OUT}px solid ${INK}` }} />
      {BOLLARDS.map((x) => (
        <div key={x} style={{ position: 'absolute', left: x, top: 262, width: 34, height: 40, borderRadius: '17px 17px 4px 4px', background: '#8C7B6A', border: `${OUT}px solid ${INK}` }} />
      ))}
    </>
  )
}

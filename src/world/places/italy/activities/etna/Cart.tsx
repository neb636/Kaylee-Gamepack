// Nino's cart: a little painted Sicilian cart (a "carretto siciliano": bright yellow with painted panels and big red
// wheels), drawn in code in the same flat style as the art (brown 5-unit outline at scale 1), side view, hitch on the
// right. It changes while she plays: fruit she picks lands in it, snow piles up in it at the top of the mountain, and
// at the end it carries Nino's piano. Sparkle rides in it.
import { motion } from 'motion/react'
import type { RefObject } from 'react'
import { INK } from '../../puppets/ink'
import { etnaArt } from './art'

/** The cart in mountain units: box width, wheel radius; the box floor sits this high above the ground. */
export const CART = { w: 236, wheel: 54, floor: 70, height: 150 } as const
const BODY = '#FFD86B'
const BODY_SHADE = '#F4C24E'
const RED = '#E8574F'
const PANEL = ['#FF8FB8', '#8FE3C8', '#A8DCFF', '#D9CCFF']

export type Fruit = 'lemon' | 'orange'

/** Where each snowball sits in the box (center x, y above the rim). */
const SNOWBALLS = [
  [-62, -30],
  [4, -34],
  [68, -30],
  [-30, -84],
  [36, -84],
] as const

/** The cart, drawn with its center bottom (between the wheels, on the ground) at (0, 0). */
export function CartArt({ wheelRef, fruit, snow, piano }: { wheelRef: RefObject<SVGGElement | null>; fruit: Fruit[]; snow: number; piano?: boolean }) {
  const { w, wheel, floor } = CART
  const x0 = -w / 2
  return (
    <svg viewBox={`${x0 - 10} -200 ${w + 160} 214`} style={{ position: 'absolute', left: x0 - 10, top: -200, width: w + 160, height: 214, overflow: 'visible', pointerEvents: 'none' }}>
      {/* Shafts reaching forward to Nino's harness (they hide behind him). */}
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <path d={`M${w / 2 - 20} ${-floor - 26} L${w / 2 + 132} ${-floor - 54} L${w / 2 + 132} ${-floor - 42} L${w / 2 - 20} ${-floor - 12}Z`} fill="#B9814F" />
      </g>
      {/* What's inside sits behind the front panel: fruit, the snow mound, the piano. */}
      {piano && (
        <g transform={`translate(${-60} ${-floor - 40})`} stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <rect x="-6" y="-96" width="132" height="100" rx="12" fill="#E8574F" />
          <rect x="6" y="-86" width="108" height="24" rx="6" fill="#FFF7F0" />
          <rect x="6" y="-62" width="108" height="40" fill="#FFF7F0" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={6 + i * 18} y1="-62" x2={6 + i * 18} y2="-22" strokeWidth="3" />
          ))}
          {[0, 1, 3, 4].map((i) => (
            <rect key={i} x={18 + i * 18} y="-62" width="10" height="22" fill={INK} strokeWidth="2" />
          ))}
        </g>
      )}
      {/* Snow: up to five big snowballs piled in the box (three, then two on top). */}
      {SNOWBALLS.slice(0, Math.round(Math.min(5, snow))).map(([bx, by], i) => (
        <g key={i}>
          <circle cx={bx} cy={-floor - 70 + by} r={36} fill="#EEF5FF" stroke={INK} strokeWidth="5" />
          <path d={`M${bx - 20} ${-floor - 70 + by + 14} Q${bx} ${-floor - 70 + by + 26} ${bx + 22} ${-floor - 70 + by + 12}`} fill="none" stroke="#C9D7F2" strokeWidth="6" strokeLinecap="round" />
        </g>
      ))}
      {fruit.slice(-6).map((f, i) => (
        <image key={i} href={f === 'lemon' ? etnaArt.lemon : etnaArt.orange} x={x0 + 24 + i * 32} y={-floor - 98 - (i % 2) * 12} width="46" height="46" />
      ))}
      {/* The box: yellow, with a red rim and painted panels (flowers, no pictures with writing). */}
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <path d={`M${x0} ${-floor - 70} L${-x0} ${-floor - 70} L${-x0 - 10} ${-floor} L${x0 + 10} ${-floor}Z`} fill={BODY} />
        <path d={`M${x0 + 10} ${-floor - 16} L${-x0 - 10} ${-floor - 16} L${-x0 - 10} ${-floor} L${x0 + 10} ${-floor}Z`} fill={BODY_SHADE} />
        <rect x={x0 - 6} y={-floor - 82} width={w + 12} height={16} rx={8} fill={RED} />
        {PANEL.map((c, i) => {
          const pw = (w - 40) / 4
          const px = x0 + 20 + i * pw
          return (
            <g key={i}>
              <rect x={px + 4} y={-floor - 58} width={pw - 8} height={36} rx={8} fill={c} strokeWidth="4" />
              <circle cx={px + pw / 2} cy={-floor - 40} r={7} fill="#FFF7F0" strokeWidth="3" />
              <circle cx={px + pw / 2} cy={-floor - 40} r={2.5} fill={RED} stroke="none" />
            </g>
          )
        })}
        {/* Axle bracket. */}
        <path d={`M-24 ${-floor} L24 ${-floor} L10 ${-wheel} L-10 ${-wheel}Z`} fill={RED} />
      </g>
      {/* The big wheel (one shows from the side), turning as the cart rolls. */}
      <g ref={wheelRef} transform={`translate(0 ${-wheel})`}>
        <circle r={wheel} fill={RED} stroke={INK} strokeWidth="5" />
        <circle r={wheel - 12} fill="#FFE27A" stroke={INK} strokeWidth="4" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i / 8) * Math.PI * 2
          return <line key={i} x1={Math.cos(a) * 12} y1={Math.sin(a) * 12} x2={Math.cos(a) * (wheel - 12)} y2={Math.sin(a) * (wheel - 12)} stroke={RED} strokeWidth="7" strokeLinecap="round" />
        })}
        <circle r={14} fill={RED} stroke={INK} strokeWidth="4" />
      </g>
    </svg>
  )
}

/** A scoop of snow flying from a drift (or the cart) along an arc. */
export function Flyer({ from, to, img, onDone, size = 40 }: { from: [number, number]; to: [number, number]; img?: string; onDone: () => void; size?: number }) {
  const mid: [number, number] = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 160]
  return (
    <motion.div
      initial={{ x: from[0], y: from[1], scale: 0.6 }}
      animate={{ x: [from[0], mid[0], to[0]], y: [from[1], mid[1], to[1]], scale: [0.6, 1.1, 0.9] }}
      transition={{ duration: 0.65, ease: 'easeInOut' }}
      onAnimationComplete={onDone}
      style={{ position: 'absolute', left: -size / 2, top: -size / 2, width: size, height: size, pointerEvents: 'none', zIndex: 9 }}
    >
      {img ? <img src={img} alt="" style={{ width: '100%', height: '100%' }} /> : <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#EEF5FF', border: `5px solid ${INK}` }} />}
    </motion.div>
  )
}

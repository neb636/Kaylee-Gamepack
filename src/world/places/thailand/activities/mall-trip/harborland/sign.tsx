// The lit MEGA HarborLand sign on the Big Frame's front, as in Dad's photo of the entrance: white channel letters
// glowing ice blue, "MEGA" small on top, "HARBORLAND" big, its A spouting like a whale, its L a little ship and a
// whale's tail flicking up after the D, and under it "LITTLE THAILAND" glowing warm, its I a little dancer and the A
// of LAND a chedi. The words are HTML (crisp, and never in a picture), laid over the sign's mount in the 3D world
// (build.ts) every frame by placeSign: 1em is one meter there. Its letters flicker on when it first shows, and a tap
// runs a wave of light along them (chaseSign).
import type { Camera } from 'three'
import { Vector3 } from 'three'
import { SIGN } from './layout'

const COOL = { face: '#FFFFFF', glow: '0 0 0.025em #fff, 0 0 0.07em #B8F0FF, 0 0 0.16em #45BEFF, 0 0 0.34em rgba(40,140,255,.9)', svg: 'drop-shadow(0 0 0.02em #fff) drop-shadow(0 0 0.07em #8EE0FF) drop-shadow(0 0 0.2em #2F9BFF)' }
const WARM = { face: '#FFF9E6', glow: '0 0 0.025em #fff, 0 0 0.08em #FFEDB0, 0 0 0.18em #FFC64D, 0 0 0.36em rgba(255,160,40,.85)', svg: 'drop-shadow(0 0 0.02em #fff) drop-shadow(0 0 0.08em #FFE08A) drop-shadow(0 0 0.2em #FFAE33)' }

const CSS = `
.hls-ch { display: inline-block; animation: hls-on 1s calc(var(--i) * 0.065s) both; }
.hls.chase .hls-ch { animation: hls-chase 0.62s calc(var(--i) * 0.05s) both; }
@keyframes hls-on { 0% { opacity: 0.06 } 22% { opacity: 1 } 30% { opacity: 0.25 } 40% { opacity: 1 } 100% { opacity: 1 } }
@keyframes hls-chase { 0% { transform: none; filter: brightness(1) } 35% { transform: translateY(-0.14em) scale(1.14); filter: brightness(1.6) } 100% { transform: none; filter: brightness(1) } }
`

/** A letter drawn as a picture (an SVG the height of a capital), glowing like the rest. */
function Glyph({ w, h = 120, children, style }: { w: number; h?: number; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ height: `${(0.7 * h) / 120}em`, width: `${(0.7 * w) / 120}em`, overflow: 'visible', ...style }}>
      {children}
    </svg>
  )
}

/** The A of HARBOR, with a whale's spout in it instead of a bar. */
const SpoutA = (
  <Glyph w={104}>
    <path d="M14 112 L52 12 L90 112" fill="none" stroke="currentColor" strokeWidth={23} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 104 C52 90 52 82 52 72 M52 76 C44 68 36 68 32 74 M52 76 C60 68 68 68 72 74" fill="none" stroke="currentColor" strokeWidth={8} strokeLinecap="round" />
    <circle cx={30} cy={80} r={5} fill="currentColor" />
    <circle cx={74} cy={80} r={5} fill="currentColor" />
  </Glyph>
)

/** The L of LAND: a little ship, its funnel the upright and its hull the foot. */
const ShipL = (
  <Glyph w={118}>
    <rect x={12} y={22} width={28} height={80} rx={8} fill="currentColor" />
    <rect x={8} y={36} width={36} height={9} rx={4} fill="currentColor" />
    <circle cx={36} cy={9} r={7} fill="currentColor" opacity={0.85} />
    <circle cx={50} cy={4} r={5} fill="currentColor" opacity={0.7} />
    <path d="M4 84 L114 84 Q108 118 78 118 L28 118 Q8 116 4 84 Z" fill="currentColor" />
    <circle cx={62} cy={99} r={6} fill="#1C4E7A" opacity={0.55} />
    <circle cx={84} cy={99} r={6} fill="#1C4E7A" opacity={0.55} />
  </Glyph>
)

/** A whale's tail, flicking up out of the end of the word. */
const Tail = (
  <Glyph w={128} h={150} style={{ marginLeft: '0.03em', marginBottom: '0.02em' }}>
    <path d="M2 146 C28 144 50 126 58 80" fill="none" stroke="currentColor" strokeWidth={18} strokeLinecap="round" />
    <path d="M58 86 C44 72 18 64 2 40 C24 26 48 34 58 56 C66 30 92 14 126 14 C116 46 84 72 58 86 Z" fill="currentColor" />
  </Glyph>
)

/** The I of LITTLE: a little Thai dancer in a pointed crown. */
const DancerI = (
  <Glyph w={72}>
    <path d="M36 0 L28 22 L44 22 Z" fill="currentColor" />
    <circle cx={36} cy={33} r={12} fill="currentColor" />
    <rect x={26} y={50} width={20} height={68} rx={9} fill="currentColor" />
    <path d="M27 60 C18 60 10 52 8 44 M45 60 C54 60 62 52 64 44" fill="none" stroke="currentColor" strokeWidth={7} strokeLinecap="round" />
  </Glyph>
)

/** The A of LAND: a chedi (a temple's pointed tower). */
const ChediA = (
  <Glyph w={100}>
    <path d="M50 0 L46 34 L54 34 Z" fill="currentColor" />
    <rect x={42} y={30} width={16} height={8} rx={3} fill="currentColor" />
    <rect x={40} y={40} width={20} height={7} rx={3} fill="currentColor" />
    <path d="M24 82 C24 60 36 48 50 48 C64 48 76 60 76 82 Z" fill="currentColor" />
    <rect x={18} y={84} width={64} height={11} rx={4} fill="currentColor" />
    <rect x={10} y={98} width={80} height={11} rx={4} fill="currentColor" />
    <rect x={2} y={111} width={96} height={9} rx={4} fill="currentColor" />
  </Glyph>
)

type Ch = string | React.ReactElement
const line = (chars: Ch[], from: number, tone: typeof COOL) =>
  chars.map((c, i) => (
    <span key={i} className="hls-ch" style={{ '--i': from + i, color: tone.face, textShadow: tone.glow, filter: typeof c === 'string' ? undefined : tone.svg, margin: c === ' ' ? '0 0.12em' : undefined } as React.CSSProperties}>
      {c === ' ' ? ' ' : c}
    </span>
  ))

/** The sign's letters (aria-hidden: the tap target over it names it). Placed every frame by placeSign. */
export function HarborSign({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  const at = (top: number, size: number, spacing: number, children: React.ReactNode) => (
    <div style={{ position: 'absolute', left: 0, top: `${top}em`, transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap' }}>
      <div style={{ fontSize: `${size}em`, lineHeight: 1, letterSpacing: `${spacing}em` }}>{children}</div>
    </div>
  )
  return (
    <div ref={ref} aria-hidden className="hls" style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, display: 'none', pointerEvents: 'none', fontFamily: "'Fredoka', system-ui, sans-serif", fontWeight: 700, zIndex: 1 }}>
      <style>{CSS}</style>
      {at(-0.56, 0.36, 0.14, line(['M', 'E', 'G', 'A'], 0, COOL))}
      {at(0, 0.76, 0.015, line(['H', SpoutA, 'R', 'B', 'O', 'R', ShipL, 'A', 'N', 'D', Tail], 4, COOL))}
      {at(0.6, 0.33, 0.06, line(['L', DancerI, 'T', 'T', 'L', 'E', ' ', 'T', 'H', 'A', 'I', 'L', ChediA, 'N', 'D'], 15, WARM))}
    </div>
  )
}

const a = new Vector3()
const b = new Vector3()
/** Lays the sign's letters over its mount: where it is on screen, and how big (1em = 1 m there). `dim` fades it (she's
 *  climbing behind it). */
export function placeSign(el: HTMLElement | null, cam: Camera, w: number, h: number, show = true, dim = 1) {
  if (!el) return
  a.set(...SIGN.at).project(cam)
  b.set(SIGN.at[0] + SIGN.w / 2, SIGN.at[1], SIGN.at[2]).project(cam)
  const on = show && a.z < 1 && Math.abs(a.x) < 1.8 && Math.abs(a.y) < 1.6
  if (el.style.display !== (on ? '' : 'none')) el.style.display = on ? '' : 'none'
  if (!on) return
  const perM = (Math.abs(b.x - a.x) * w) / 2 / (SIGN.w / 2)
  el.style.transform = `translate3d(${(((a.x + 1) / 2) * w).toFixed(1)}px, ${(((1 - a.y) / 2) * h).toFixed(1)}px, 0)`
  el.style.fontSize = `${perM.toFixed(2)}px`
  const o = String(Math.round(dim * 100) / 100)
  if (el.style.opacity !== o) el.style.opacity = o
}

/** A wave of light along the letters (a tap on the sign). */
export function chaseSign(el: HTMLElement | null) {
  if (!el) return
  el.classList.remove('chase')
  void el.offsetWidth
  el.classList.add('chase')
}

// Miu's felucca, drawn by hand: a pink wooden hull, one tall mast, a big cream sail and a rope from bow to mast top to
// stern where the lotus flowers she catches are strung, one by one. The sail and the hull are separate pictures so Miu
// can sit between them (in front of the sail, inside the boat).
import { type Ref } from 'react'
import { INK } from '../../../../kit/ink'
import { HOOKS, PER_LEG } from './river'
import { Lotus } from '../../Lotus'

const ink = (w = 5) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const })
const box = { position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', display: 'block' } as const

/** Behind Miu: the mast and the sail (the loop billows the sail through `sailRef`). */
export function Sail({ sailRef }: { sailRef: Ref<SVGGElement> }) {
  return (
    <svg viewBox="0 0 340 360" style={box}>
      <g ref={sailRef} style={{ transformOrigin: '206px 250px', transformBox: 'view-box' }}>
        <path d="M204 30 C132 74 70 160 38 250 C92 262 150 262 208 250Z" fill="#FFF7F0" {...ink()} />
        <path d="M204 30 C190 110 196 190 208 250 C186 255 164 258 142 259 C150 180 170 96 204 30Z" fill="#EFDCCD" />
        {/* two pink stripes, following the sail's belly */}
        <path d="M160 76 C174 80 188 82 199 82" stroke="#FF8FB8" strokeWidth="12" fill="none" />
        <path d="M94 152 C130 164 170 168 198 166" stroke="#FFC4DA" strokeWidth="12" fill="none" />
        <path d="M204 30 C132 74 70 160 38 250 C92 262 150 262 208 250Z" fill="none" {...ink()} />
      </g>
      {/* the mast, and the boom the sail hangs from */}
      <path d="M200 276 L203 26 L211 26 L214 276Z" fill="#C99266" {...ink()} />
      <path d="M28 254 C90 264 160 262 226 248" fill="none" stroke={INK} strokeWidth="13" strokeLinecap="round" />
      <path d="M28 254 C90 264 160 262 226 248" fill="none" stroke="#E5B78F" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

/** In front of Miu: the hull. */
export function Hull() {
  return (
    <svg viewBox="0 0 340 360" style={box}>
      <defs>
        <clipPath id="felucca-hull">
          <path d="M14 256 C70 282 240 286 330 236 C318 300 262 326 170 326 C84 326 30 304 14 256Z" />
        </clipPath>
      </defs>
      <path d="M14 256 C70 282 240 286 330 236 C318 300 262 326 170 326 C84 326 30 304 14 256Z" fill="#FF8FB8" {...ink()} />
      <g clipPath="url(#felucca-hull)">
        <path d="M0 300 C80 322 250 322 340 270 L340 340 L0 340Z" fill="#E7699C" />
        <path d="M10 270 C70 296 240 300 334 252" stroke="#FFF7F0" strokeWidth="13" fill="none" />
        <path d="M20 262 C70 284 236 288 326 242" stroke="#FFC4DA" strokeWidth="6" fill="none" />
      </g>
      <path d="M14 256 C70 282 240 286 330 236 C318 300 262 326 170 326 C84 326 30 304 14 256Z" fill="none" {...ink()} />
      {/* a golden eye on the bow, like the old Nile boats */}
      <ellipse cx="286" cy="276" rx="12" ry="8" fill="#FFE189" {...ink(3.6)} />
      <circle cx="287" cy="276" r="4" fill={INK} />
    </svg>
  )
}

/** On top: the garland. `flowers` of its twelve hooks hold a lotus (bow strand first); the rest are little knots. */
export function Garland({ flowers }: { flowers: number }) {
  const strand = (to: string) => (
    <>
      <path d={`M206 36 ${to}`} fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
      <path d={`M206 36 ${to}`} fill="none" stroke="#FFE189" strokeWidth="2.6" strokeLinecap="round" />
    </>
  )
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg viewBox="0 0 340 360" style={box}>
        {strand('Q246 176 324 240')}
        {strand('Q112 196 24 252')}
        {HOOKS.map(([x, y], i) => i >= flowers && <circle key={i} cx={x} cy={y + 3} r={i < PER_LEG || flowers >= PER_LEG ? 5 : 3.5} fill="#FFE189" stroke={INK} strokeWidth="3" />)}
      </svg>
      {HOOKS.slice(0, flowers).map(([x, y], i) => (
        <div key={i} className="nile-hooked" style={{ position: 'absolute', left: `${(x / 340) * 100}%`, top: `${((y + 4) / 360) * 100}%`, width: '17%', translate: '-50% -62%', rotate: `${((i * 37) % 30) - 15}deg` }}>
          <Lotus pad={false} style={{ width: '100%' }} />
        </div>
      ))}
    </div>
  )
}

// The highland meadow behind Luna's Fluffy Day, drawn by hand in the flat look of the game shelf
// (src/world/shelf/STYLE.md), like Tika's Mountain Terraces: no dark outlines, form from a base, a shade and a light
// tone, light from the top left, far things paler and more lavender. Snow peaks, hazy hills, two green hills with
// farm terraces and a little adobe house, and the meadow the alpacas stand on.
//
// It is drawn around a ground line so the same picture serves the wide and the tall stage, and it runs well past the
// stage's edges, so any screen shape is filled without stretching.
import { memo, useId } from 'react'

export const SKY = '#8FD0FF'
export const MEADOW = '#7FD487'

/** The snow peaks: how far each summit is from the middle of the picture, and how high it stands over the ground. */
const PEAKS: [number, number][] = [[-1010, 300], [-760, 250], [-520, 330], [-290, 240], [-60, 300], [160, 230], [390, 350], [640, 260], [900, 310], [1140, 250]]
/** The summit that glints on a tap: one for the wide stage, one for the tall one (clear of the alpacas). */
export const GLINT_PEAK = { wide: 2, tall: 6 }
/** Where a summit is on a stage. */
export const peakAt = (i: number, w: number, ground: number, rise: number) => ({ x: w / 2 + PEAKS[i][0], y: ground - PEAKS[i][1] * rise })

const FLOWERS: [number, number, string][] = [[-690, 60, '#FFC4DA'], [-560, 150, '#FFFFFF'], [-420, 44, '#FFF6CC'], [-250, 250, '#FFFFFF'], [-90, 300, '#FFC4DA'], [130, 280, '#FFF6CC'], [300, 52, '#FFFFFF'], [470, 210, '#FF8FB8'], [610, 70, '#FFF6CC'], [700, 300, '#FFFFFF'], [-930, 190, '#FFFFFF'], [920, 150, '#FFC4DA']]
const TUFTS: [number, number][] = [[-640, 110], [-480, 250], [-330, 80], [-170, 180], [40, 60], [210, 190], [380, 300], [540, 110], [680, 230], [-720, 300], [-880, 70], [860, 290], [1000, 90]]
const tuft = (x: number, y: number) => `M${x} ${y}l-9 -20M${x} ${y}l2 -26M${x} ${y}l12 -18`

/** A round clump of bush, lit from the top left. */
function Clump({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#3E9E78" />
      <ellipse cx={x - r * 0.3} cy={y - r * 0.5} rx={r * 0.42} ry={r * 0.2} fill="#5CBD78" transform={`rotate(-24 ${x - r * 0.3} ${y - r * 0.5})`} />
    </g>
  )
}

/** The picture itself, around x = 0 (the middle) and y = 0 (the ground line). `rise` makes the mountains taller. */
const Art = memo(function Art({ id, rise, deep }: { id: string; rise: number; deep: number }) {
  const valley = (i: number) => [(PEAKS[i][0] + PEAKS[i + 1][0]) / 2, -Math.min(PEAKS[i][1], PEAKS[i + 1][1]) * rise * 0.52] as const
  let range = `M${PEAKS[0][0] - 200} 40`
  let shade = ''
  let snow = ''
  PEAKS.forEach(([x, h], i) => {
    const y = -h * rise
    range += `L${x} ${y}`
    const [vx, vy] = i < PEAKS.length - 1 ? valley(i) : [x + 200, 40]
    const [ux, uy] = i > 0 ? valley(i - 1) : [x - 200, 40]
    if (i < PEAKS.length - 1) range += `L${vx.toFixed(0)} ${vy.toFixed(0)}`
    // The right face of each peak is in shade; the snow cap comes a third of the way down in three soft points.
    shade += `M${x} ${y}L${vx.toFixed(0)} ${vy.toFixed(0)}L${(vx - 20).toFixed(0)} 40H${(x + 14).toFixed(0)}Z`
    const k = 0.34
    const lx = x + (ux - x) * k
    const ly = y + (uy - y) * k
    const rx = x + (vx - x) * k
    const ry = y + (vy - y) * k
    const m = (t: number, d: number) => `${(lx + (rx - lx) * t).toFixed(0)} ${(ly + (ry - ly) * t + d).toFixed(0)}`
    snow += `M${x} ${y}L${lx.toFixed(0)} ${ly.toFixed(0)}L${m(0.2, -16)}L${m(0.38, 6)}L${m(0.56, -14)}L${m(0.76, 6)}L${rx.toFixed(0)} ${ry.toFixed(0)}Z`
  })
  range += `L${PEAKS[PEAKS.length - 1][0] + 200} 40Z`
  return (
    <g>
      <rect x="-2600" y="-2600" width="5200" height="2650" fill={`url(#${id}-sky)`} />
      <circle cx="-430" cy={-470 * rise} r="250" fill={`url(#${id}-sun)`} />
      <circle cx="-430" cy={-470 * rise} r="46" fill="#FFFBE8" />

      {/* Far snow peaks. */}
      <path d={range} fill="#D3D6F3" />
      <path d={shade} fill="#BFC2EA" />
      <path d={snow} fill="#fff" />

      {/* Hazy hills in front of them. */}
      <path d="M-2600 -118Q-1200 -150 -1040 -128Q-860 -196 -640 -124Q-470 -176 -300 -120Q-120 -170 70 -116Q250 -182 440 -122Q600 -168 790 -118Q960 -178 1160 -124Q1400 -150 2600 -118V40H-2600Z" fill="#B7DFD0" />

      {/* Two green hills with farm terraces, bushes and a little adobe house. */}
      <path d="M-2600 -70Q-1300 -90 -1150 -84Q-960 -150 -760 -150Q-520 -150 -330 -60Q-200 -20 -40 -30V40H-2600Z" fill="#73CF86" />
      <path d="M-1010 -124Q-760 -164 -500 -116M-1080 -96Q-760 -138 -410 -84M-1140 -66Q-760 -108 -330 -52" fill="none" stroke="#9BE28F" strokeWidth="9" strokeLinecap="round" />
      <path d="M-80 -24Q120 -60 300 -110Q470 -156 640 -146Q860 -132 1040 -70Q1300 -84 2600 -66V40H-80Z" fill="#62C47F" />
      <path d="M330 -100Q610 -150 880 -108M240 -72Q610 -122 960 -78M150 -44Q610 -92 1040 -48" fill="none" stroke="#8BDB8D" strokeWidth="9" strokeLinecap="round" />
      <g transform="translate(552 -150)">
        <path d="M-40 0H40V-38H-40Z" fill="#FDEECC" />
        <path d="M12 0H40V-38H12Z" fill="#E9D3A6" />
        <path d="M-52 -36L-4 -74L52 -36Z" fill="#E9785A" />
        <path d="M-4 -74L52 -36H16Z" fill="#C65A45" />
        <path d="M-12 0V-22Q-12 -28 -4 -28Q4 -28 4 -22V0Z" fill="#8A5B3D" />
        <rect x="18" y="-28" width="12" height="12" rx="2" fill="#8CCFFF" />
      </g>
      {[[-930, -112, 30], [-880, -92, 22], [-600, -124, 26], [-250, -44, 30], [-200, -30, 20], [420, -122, 26], [470, -134, 18], [740, -122, 30], [790, -104, 20], [1010, -62, 26], [-1240, -66, 28], [1260, -60, 30]].map(([x, y, r], i) => (
        <Clump key={i} x={x} y={y} r={r} />
      ))}

      {/* The meadow: a light lip where it meets the hills, then two soft bands of grass. */}
      <path d={`M-2600 -4Q-1300 -22 -900 -6T-200 -8T500 -4T1200 -10T2600 -4V${deep}H-2600Z`} fill="#C9F2B6" />
      <path d={`M-2600 6Q-1300 -12 -900 4T-200 2T500 6T1200 0T2600 6V${deep}H-2600Z`} fill="#9BE28F" />
      <path d={`M-2600 160Q-1500 132 -800 156T300 148T1300 160T2600 150V${deep}H-2600Z`} fill="#8ADB8B" />
      <path d={`M-2600 318Q-1400 296 -700 312T500 306T1500 316T2600 306V${deep}H-2600Z`} fill={MEADOW} />
      <path d={TUFTS.map(([x, y]) => tuft(x, y)).join('')} fill="none" stroke="#62C47F" strokeWidth="5" strokeLinecap="round" />
      {FLOWERS.map(([x, y, c], i) => (
        <g key={i}>
          {[0, 1, 2, 3, 4].map((p) => (
            <circle key={p} cx={x + Math.cos(((p * 72 - 90) * Math.PI) / 180) * 7} cy={y + Math.sin(((p * 72 - 90) * Math.PI) / 180) * 7} r="6" fill={c} />
          ))}
          <circle cx={x} cy={y} r="4.5" fill="#FFC83D" />
        </g>
      ))}
    </g>
  )
})

const Defs = ({ id, rise }: { id: string; rise: number }) => (
  <defs>
    <linearGradient id={`${id}-sky`} gradientUnits="userSpaceOnUse" x1="0" y1={-760 * rise} x2="0" y2="0">
      <stop offset="0" stopColor={SKY} />
      <stop offset="0.55" stopColor="#C2E5FF" />
      <stop offset="0.92" stopColor="#FFEEDD" />
    </linearGradient>
    <radialGradient id={`${id}-sun`} cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
      <stop offset="1" stopColor="#FFF6CC" stopOpacity="0" />
    </radialGradient>
  </defs>
)

/** The meadow on a stage of `w` x `h` whose ground line is at `ground` (it spills over the stage's edges). */
export function Meadow({ w, h, ground, rise = 1 }: { w: number; h: number; ground: number; rise?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg aria-hidden viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'visible', pointerEvents: 'none' }}>
      <Defs id={id} rise={rise} />
      <g transform={`translate(${w / 2} ${ground})`}>
        <Art id={id} rise={rise} deep={2600} />
      </g>
    </svg>
  )
}

/** The meadow as a backdrop that fills its box from the bottom up (the story beats and Luna's balloon page). */
export function MeadowScene() {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg aria-hidden viewBox="0 0 1500 1000" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: SKY }}>
      <Defs id={id} rise={1} />
      <g transform="translate(750 610)">
        <Art id={id} rise={1} deep={2600} />
      </g>
    </svg>
  )
}

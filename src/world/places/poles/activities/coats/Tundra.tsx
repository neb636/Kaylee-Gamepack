// Snow Coats' tundra, drawn by hand (no generated pictures): the sky, a far range of mountains, rolling hills with a
// little lake between them, and the wide ground the animals stand on, in late summer (gold and rust), winter (snow)
// and summer (green), plus the night the dusk fades in. Scenery has soft flat tones and no outlines, with the light
// from the top-left (src/world/shelf/STYLE.md); what she rubs (the animals) keeps its ink line. Every season draws the
// same hills, bushes and stones in the same places, so the snow settles on them and melts off them instead of one
// picture fading into another. Everything is in stage units inside SnowCoats' own <svg>: the hills stand on the
// ground line and run on past both edges of any screen.
import type { ReactNode } from 'react'

export type Season = 'late' | 'winter' | 'summer'
export type Land = Season | 'night'

export const SNOW = '#F7FAFE'
const SNOW_SHADE = '#E2E7F7'
const SHADOW = '#4B3A8C'

/** The sky from the top of the screen (`top`) down to the ground line (`low`). */
export const SKY: Record<Land, { top: string; mid: string; low: string }> = {
  late: { top: '#AEB0EA', mid: '#D9C8EE', low: '#FCE4DC' },
  winter: { top: '#8DC5F3', mid: '#C2E2FB', low: '#EAF6FF' },
  summer: { top: '#79C1F6', mid: '#B7E0FB', low: '#E6F6FF' },
  night: { top: '#252E5E', mid: '#4A4A86', low: '#7A6AA6' },
}

interface Tones {
  peak: [base: string, shade: string, cap: string, capShade: string]
  /** The rolling hills: a lit tone and a shaded one each, taken in turn. */
  hills: [string, string][]
  lake: [water: string, glint: string]
  near: [string, string]
  cloud: [string, string]
}
const HILLS: Record<Land, Tones> = {
  late: {
    peak: ['#C3BAE6', '#ADA2DA', '#F7F4FF', '#DDD6F5'],
    hills: [['#E9906C', '#D3755B'], ['#F3C06E', '#E1A556'], ['#BCC078', '#A2AA63']],
    lake: ['#CDCBF2', '#EDEBFF'],
    near: ['#EBBB72', '#E2AC62'],
    cloud: ['#FFF7F5', '#EBDDF2'],
  },
  winter: {
    peak: ['#DAE4F7', '#C3D1EF', '#FFFFFF', '#E6ECFA'],
    hills: [['#F4F7FD', '#DCE4F6'], ['#FAFCFF', '#E2E9F8'], ['#F0F4FC', '#D9E2F5']],
    lake: ['#D3E6FA', '#F2F9FF'],
    near: ['#FBFCFF', '#EDF1FB'],
    cloud: ['#FFFFFF', '#E0E8F8'],
  },
  summer: {
    peak: ['#B4C1EE', '#9DADE2', '#FFFFFF', '#E4DDF6'],
    hills: [['#8FD6A0', '#6FC088'], ['#AEE093', '#8FCD79'], ['#80D0A9', '#63B990']],
    lake: ['#8CCFFF', '#D4EEFF'],
    near: ['#A2DE8E', '#92D382'],
    cloud: ['#FFFFFF', '#E4DDF6'],
  },
  night: {
    peak: ['#56589A', '#474A86', '#B4BAE8', '#989FD6'],
    hills: [['#8589C8', '#6D71B4'], ['#9094D0', '#777BBC'], ['#7E82C2', '#676BAE']],
    lake: ['#5E64A8', '#8A90CC'],
    near: ['#A3A7DC', '#9094CE'],
    cloud: ['#8E90C8', '#7476B4'],
  },
}

// ---------------------------------------------------------------- the far hills (0,0 = the middle of the ground line)

const n = (v: number) => +v.toFixed(1)

/** The mountains: a triangle with a shaded right face and a snow cap with a jagged hem. */
const PEAKS: [x: number, h: number, w: number][] = [
  [-2260, 250, 320], [-1900, 320, 360], [-1540, 230, 300], [-1180, 340, 380], [-800, 250, 320], [-430, 330, 360], [-60, 240, 300],
  [300, 350, 390], [680, 255, 320], [1040, 325, 360], [1410, 240, 310], [1780, 335, 370], [2150, 250, 320],
]
function Peak({ x, h, w, c }: { x: number; h: number; w: number; c: Tones['peak'] }) {
  const k = 0.36
  // The cap's hem, as (across, down) in shares of the cap: it zigzags inside the triangle.
  const hem: [number, number][] = [[-1, 1], [-0.52, 0.74], [-0.2, 1.02], [0.14, 0.72], [0.5, 0.98], [1, 1]]
  const at = ([a, d]: [number, number]) => `${n(x + w * k * a * Math.min(1, d))} ${n(-h + h * k * d)}`
  return (
    <g>
      <path d={`M${x - w} 2 L${x} ${-h} L${x + w} 2Z`} fill={c[0]} />
      <path d={`M${x} ${-h} L${x + w} 2 L${n(x + w * 0.22)} 2Z`} fill={c[1]} />
      <path d={`M${x} ${-h} L${hem.map(at).join(' L')}Z`} fill={c[2]} />
      <path d={`M${x} ${-h} L${at(hem[5])} L${at(hem[4])} L${at(hem[3])} L${n(x + w * k * 0.08)} ${n(-h + h * k * 0.5)}Z`} fill={c[3]} />
    </g>
  )
}

/** The rolling hills: soft mounds, lit on the left and shaded down the right. */
const MOUNDS: [x: number, h: number, w: number][] = [
  [-2300, 120, 520], [-1820, 165, 600], [-1330, 115, 500], [-900, 150, 560], [-470, 105, 470], [-70, 160, 580],
  [390, 118, 500], [830, 158, 580], [1290, 112, 480], [1730, 160, 600], [2220, 125, 520],
]
function Mound({ x, h, w, c }: { x: number; h: number; w: number; c: [string, string] }) {
  return (
    <g>
      <path d={`M${x - w} 2 C${n(x - w * 0.5)} ${n(-h * 0.2)} ${n(x - w * 0.18)} ${-h} ${x} ${-h} C${n(x + w * 0.18)} ${-h} ${n(x + w * 0.5)} ${n(-h * 0.2)} ${x + w} 2Z`} fill={c[0]} />
      <path d={`M${x} ${-h} C${n(x + w * 0.18)} ${-h} ${n(x + w * 0.5)} ${n(-h * 0.2)} ${x + w} 2 L${n(x + w * 0.5)} 2 C${n(x + w * 0.3)} ${n(-h * 0.25)} ${n(x + w * 0.14)} ${n(-h * 0.82)} ${x} ${-h}Z`} fill={c[1]} />
    </g>
  )
}

/** A smooth line through points (x, up), closed down to `floor`: the low rises next to the ground, the ground's bands. */
function ridge(pts: [number, number][], floor: number) {
  let d = `M${pts[0][0]} ${floor} L${pts[0][0]} ${-pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const mx = (x0 + x1) / 2
    d += ` C${n(mx)} ${-y0} ${n(mx)} ${-y1} ${x1} ${-y1}`
  }
  return `${d} L${pts.at(-1)![0]} ${floor}Z`
}
const wave = (from: number, to: number, step: number, lo: number, hi: number, shift = 0): [number, number][] => {
  const out: [number, number][] = []
  for (let x = from, i = 0; x <= to; x += step, i++) out.push([x, i % 2 ? lo + ((i * 37 + shift) % 11) : hi - ((i * 53 + shift) % 13)])
  return out
}
const NEAR_BACK = ridge(wave(-2600, 2600, 400, 34, 78), 4)
const NEAR_FRONT = ridge(wave(-2500, 2700, 340, 8, 40, 5), 4)

function Cloud({ c }: { c: [string, string] }) {
  return (
    <g>
      <path d="M-96 0 C-112 -4 -112 -34 -84 -36 C-82 -62 -40 -70 -24 -48 C-8 -82 52 -78 56 -40 C88 -46 108 -8 84 0Z" fill={c[1]} />
      <path d="M-96 -8 C-110 -12 -108 -36 -84 -38 C-82 -62 -40 -70 -24 -50 C-8 -82 50 -78 54 -42 C84 -48 100 -18 84 -8Z" fill={c[0]} />
    </g>
  )
}
/** Where the clouds float, in shares of the stage's width and of the sky's height. */
const CLOUDS: [fx: number, fy: number, s: number][] = [
  [0.14, 0.3, 1.1],
  [0.5, 0.17, 0.8],
  [0.3, 0.56, 0.62],
]

/** The sky and the far hills of one season, standing on the ground line `g0`. `k` is how big the hills are drawn (a
 *  little smaller on the tall stage). The clouds are `data-k="cloud"`: SnowCoats drifts them. */
export function Backdrop({ id, land, w, g0, k, big, clouds = true }: { id: string; land: Land; w: number; g0: number; k: number; big: number; clouds?: boolean }) {
  const sky = SKY[land]
  const c = HILLS[land]
  const gid = `${id}-sky-${land}`
  return (
    <g>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1={g0 - 820} x2="0" y2={g0}>
          <stop offset="0" stopColor={sky.top} />
          <stop offset="0.6" stopColor={sky.mid} />
          <stop offset="1" stopColor={sky.low} />
        </linearGradient>
      </defs>
      <rect x={-big} y={-big} width={big * 2} height={big + g0 + 2} fill={`url(#${gid})`} />
      {clouds &&
        CLOUDS.map(([fx, fy, s], i) => (
          <g key={i} data-k="cloud" data-x={n(w * fx)} data-y={n(g0 * fy)} data-i={i} transform={`translate(${n(w * fx)} ${n(g0 * fy)})`}>
            <g transform={`scale(${s})`}>
              <Cloud c={c.cloud} />
            </g>
          </g>
        ))}
      <g transform={`translate(${w / 2} ${g0}) scale(${k})`}>
        {PEAKS.map(([x, h, pw], i) => (
          <Peak key={i} x={x} h={h} w={pw} c={c.peak} />
        ))}
        {/* a pale haze at the mountains' feet, so they sit far behind the hills */}
        <rect x={-big} y={-96} width={big * 2} height={100} fill={sky.low} opacity={land === 'night' ? 0.18 : 0.42} />
        {MOUNDS.map(([x, h, mw], i) => (
          <Mound key={i} x={x} h={h} w={mw} c={c.hills[i % c.hills.length]} />
        ))}
        {/* the lake between the hills (frozen in winter) */}
        <ellipse cx={-250} cy={-30} rx={330} ry={15} fill={c.lake[0]} />
        <path d="M-430 -33 H-300 M-250 -26 H-120 M-90 -34 H-30" stroke={c.lake[1]} strokeWidth={4} strokeLinecap="round" fill="none" />
        <ellipse cx={1180} cy={-38} rx={240} ry={11} fill={c.lake[0]} />
        <path d="M1080 -40 H1170 M1210 -35 H1290" stroke={c.lake[1]} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <path d={NEAR_BACK} fill={c.near[0]} />
        <path d={NEAR_FRONT} fill={c.near[1]} />
      </g>
    </g>
  )
}

/** A few stars for the dusk. */
export function Stars({ w, g0 }: { w: number; g0: number }) {
  const r = rng(7)
  return (
    <g fill="#FFFFFF">
      {Array.from({ length: 46 }, (_, i) => (
        <circle key={i} cx={n(w / 2 + (r() - 0.5) * 3400)} cy={n(g0 * 0.62 * r() - 60)} r={n(2 + r() * 3)} opacity={n(0.5 + r() * 0.5)} />
      ))}
    </g>
  )
}

// ---------------------------------------------------------------- the ground (0,0 = the middle of the ground line, y down)

export type GroundLook = 'late' | 'summer' | 'snow'

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Kind = 'bush' | 'tuft' | 'stone' | 'patch'
interface Thing {
  x: number
  y: number
  s: number
  kind: Kind
  /** Which of its looks (a bush's color, a tuft's lean). */
  v: number
}
/** The same bushes, tufts, stones and mossy patches every season, scattered once: smaller and closer together far
 *  away, bigger up close. */
const THINGS: Thing[] = (() => {
  const r = rng(20261124)
  const out: Thing[] = []
  for (let y = 34; y < 1100; y += 64 + y * 0.09) {
    const step = 165 + y * 0.16
    for (let x = -1900 + r() * step; x < 1900; x += step) {
      const pick = r()
      const jx = (r() - 0.5) * step * 0.6
      const jy = (r() - 0.5) * 34
      const v = Math.floor(r() * 3)
      if (r() < 0.16) continue
      out.push({ x: Math.round(x + jx), y: Math.round(y + jy), s: +(0.66 + y / 600).toFixed(2), kind: pick < 0.36 ? 'bush' : pick < 0.72 ? 'tuft' : pick < 0.88 ? 'stone' : 'patch', v })
    }
  }
  return out.sort((a, b) => a.y - b.y)
})()

/** The ground's bands, far to near: each one a soft wavy edge. */
const BANDS = [0, 90, 250, 470, 760].map((y, i) => (i === 0 ? '' : ridge(wave(-2600, 2600, 520, -y - 16, -y + 16, i * 3), 3000)))
const GROUND: Record<GroundLook, string[]> = {
  late: ['#E8B86E', '#E2AD62', '#DBA259', '#D39852', '#CB8E4C'],
  summer: ['#A9E292', '#9CDA88', '#8FD27F', '#83C977', '#78C06F'],
  snow: [SNOW, SNOW, SNOW, SNOW, SNOW],
}
/** Long soft shapes lying across the ground: the tundra's patchwork of heath and moss, and the snow's own shadows. */
const DRIFTS: [x: number, y: number, w: number][] = [
  [-1500, 70, 300], [-820, 110, 360], [-140, 64, 280], [520, 100, 340], [1240, 76, 300],
  [-1180, 250, 420], [-380, 300, 460], [460, 240, 400], [1180, 310, 460],
  [-900, 520, 560], [60, 470, 520], [980, 560, 600], [-300, 800, 700], [900, 860, 720],
]

const HEATH: Record<'late' | 'summer', string[]> = { late: ['#E08A5C', '#C2BC68', '#D9736B', '#F1C66E'], summer: ['#7CCB78', '#BDE993', '#8ED9AC', '#C6EC9B'] }

const BUSH: Record<'late' | 'summer', [base: string, shade: string, light: string, dot: string][]> = {
  late: [
    ['#E9785A', '#C65A45', '#F6A283', '#C2334F'],
    ['#B9BE66', '#9DA552', '#D8DB8E', '#FFE189'],
    ['#DC5A63', '#B9404F', '#F58E8E', '#FFE189'],
  ],
  summer: [
    ['#73CF86', '#48A96C', '#AEE8B7', '#FF8FB8'],
    ['#5CC6A6', '#3E9E78', '#8FE3C8', '#FFFFFF'],
    ['#8AD27A', '#5FB15F', '#BDEBA9', '#FFE189'],
  ],
}
const BLADES: Record<'late' | 'summer', [string, string]> = { late: ['#B79F52', '#D6C173'], summer: ['#4FB574', '#7FD78F'] }
const STONE = ['#BCB6D6', '#9790BA', '#DEDAF0']

const shadow = (rx: number) => <ellipse cx={4} cy={1} rx={rx} ry={rx * 0.16} fill={SHADOW} opacity={0.12} />
const TUFT = ['M-3 0 C-6 -14 -14 -24 -22 -30 C-12 -22 -4 -12 3 0Z', 'M-2 0 C-2 -18 -4 -32 -1 -44 C2 -32 4 -18 4 0Z', 'M0 0 C4 -14 12 -26 22 -32 C12 -22 8 -10 5 0Z', 'M-6 0 C-10 -8 -18 -14 -28 -16 C-18 -10 -10 -6 -1 0Z', 'M2 0 C8 -8 18 -14 30 -14 C18 -9 12 -5 7 0Z']

function ThingEl({ t, look }: { t: Thing; look: GroundLook }): ReactNode {
  const snow = look === 'snow'
  const live = look === 'snow' ? 'late' : look
  switch (t.kind) {
    case 'bush': {
      if (snow)
        return (
          <>
            {shadow(42)}
            {/* its twigs poke out of the snow that covers it */}
            <path d="M-12 -30 L-18 -50 M-15 -40 L-24 -44 M14 -32 L20 -52 M17 -42 L26 -46" stroke="#B9987F" strokeWidth={3} strokeLinecap="round" fill="none" />
            <path d="M-44 0 C-44 -22 -26 -38 -2 -38 C24 -38 44 -22 44 0Z" fill="#FFFFFF" />
            <path d="M-2 -38 C24 -38 44 -22 44 0 L16 0 C22 -14 14 -30 -2 -38Z" fill={SNOW_SHADE} />
          </>
        )
      const [base, shade, light, dot] = BUSH[live][t.v]
      return (
        <>
          {shadow(42)}
          <path d="M-42 0 C-50 -14 -38 -30 -24 -28 C-24 -46 4 -52 12 -36 C28 -44 46 -26 38 -12 C46 -8 44 0 38 0Z" fill={base} />
          <path d="M12 -36 C28 -44 46 -26 38 -12 C46 -8 44 0 38 0 L14 0 C26 -8 26 -24 12 -36Z" fill={shade} />
          <path d="M-36 -14 C-38 -22 -30 -26 -24 -22 C-22 -36 -6 -42 4 -36 C-8 -36 -16 -28 -18 -18 C-26 -20 -32 -18 -36 -14Z" fill={light} />
          {[[-22, -10], [0, -22], [20, -12], [-4, -4]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={4.2} fill={dot} />
          ))}
        </>
      )
    }
    case 'tuft': {
      if (snow)
        return (
          <>
            <path d="M-22 0 C-20 -13 -9 -18 0 -18 C11 -18 22 -11 24 0Z" fill="#FFFFFF" />
            <path d="M0 -18 C11 -18 22 -11 24 0 L10 0 C13 -7 9 -14 0 -18Z" fill={SNOW_SHADE} />
          </>
        )
      const [a, b] = BLADES[live]
      const cotton = look === 'summer' && t.v === 0
      return (
        <g transform={t.v === 2 ? 'scale(-1 1)' : undefined}>
          {TUFT.map((d, i) => (
            <path key={i} d={d} fill={i % 2 ? b : a} />
          ))}
          {/* cotton grass: white puffs on the tall blades */}
          {cotton && (
            <>
              <circle cx={-1} cy={-46} r={7} fill="#FFFFFF" />
              <circle cx={23} cy={-34} r={6} fill="#FFFFFF" />
              <circle cx={-23} cy={-32} r={5.5} fill="#FFFFFF" />
            </>
          )}
        </g>
      )
    }
    case 'stone':
      return (
        <>
          {shadow(34)}
          <path d="M-30 0 C-36 -12 -28 -26 -12 -28 C4 -32 24 -26 30 -12 C34 -4 30 0 26 0Z" fill={STONE[0]} />
          <path d="M6 -29 C18 -28 28 -20 30 -12 C34 -4 30 0 26 0 L8 0 C16 -8 16 -20 6 -29Z" fill={STONE[1]} />
          {snow ? (
            <path d="M-31 -10 C-30 -22 -22 -27 -12 -28 C4 -32 22 -27 29 -14 C22 -18 16 -12 8 -16 C0 -20 -6 -10 -14 -14 C-20 -17 -26 -10 -31 -10Z" fill="#FFFFFF" />
          ) : (
            <path d="M-24 -14 C-22 -22 -14 -25 -6 -25 C-12 -22 -17 -18 -19 -12Z" fill={STONE[2]} />
          )}
        </>
      )
    case 'patch':
      if (snow) return <path d="M-74 0 C-44 -15 38 -16 74 0 C40 -7 -40 -6 -74 0Z" fill={SNOW_SHADE} />
      return (
        <>
          <ellipse rx={70} ry={13} fill={look === 'late' ? '#D9895C' : '#74C683'} opacity={0.5} />
          {[[-36, -2], [-8, 4], [22, -3], [44, 3]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3.6} fill={look === 'late' ? '#F6C877' : i % 2 ? '#FFE189' : '#FFFFFF'} />
          ))}
        </>
      )
  }
}

/** The ground of one season from the ground line down, as wide and as deep as any screen (`big`). Draw it inside a
 *  group that puts 0,0 in the middle of the ground line. `k`: how big its things are drawn. */
export function Ground({ look, big, k }: { look: GroundLook; big: number; k: number }) {
  const tones = GROUND[look]
  return (
    <g>
      {/* (the snow starts a touch higher than the tundra under it, so no green shows along the ground line) */}
      <rect x={-big} y={look === 'snow' ? -3 : 0} width={big * 2} height={big} fill={tones[0]} />
      {look !== 'snow' && BANDS.map((d, i) => d && <path key={i} d={d} fill={tones[i]} />)}
      {DRIFTS.map(([x, y, w], i) =>
        look === 'snow' ? (
          <path key={i} d={`M${x - w} ${y} C${n(x - w * 0.5)} ${y - 20} ${n(x + w * 0.4)} ${y - 22} ${x + w} ${y} C${n(x + w * 0.4)} ${y - 8} ${n(x - w * 0.5)} ${y - 6} ${x - w} ${y}Z`} fill={SNOW_SHADE} opacity={0.75} />
        ) : (
          <ellipse key={i} cx={x} cy={y} rx={w} ry={n(14 + y * 0.05)} fill={HEATH[look][i % 4]} opacity={0.55} />
        ),
      )}
      {THINGS.map((t, i) => (
        <g key={i} transform={`translate(${n(t.x * k)} ${n(t.y * k)}) scale(${n(t.s * k)})`}>
          <ThingEl t={t} look={look} />
        </g>
      ))}
    </g>
  )
}

/** The summer sun: a soft glow, rays that turn (`data-k="sun-rays"`), and a sleepy happy face. */
export function Sun({ id }: { id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-sunglow`}>
          <stop offset="0.3" stopColor="#FFF6C9" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFF6C9" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r={230} fill={`url(#${id}-sunglow)`} />
      <g data-k="sun-rays" fill="#FFD35C">
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-8} y={i % 2 ? -138 : -150} width={16} height={i % 2 ? 30 : 42} rx={8} transform={`rotate(${i * 30})`} />
        ))}
      </g>
      <circle r={90} fill="#FFDD6B" />
      <circle cx={-6} cy={-6} r={80} fill="#FFE98F" />
      <path d="M-44 -8 Q-30 -24 -16 -8 M16 -8 Q30 -24 44 -8" fill="none" stroke="#C98A1B" strokeWidth={6} strokeLinecap="round" />
      <path d="M-18 20 Q0 38 18 20" fill="none" stroke="#C98A1B" strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={-50} cy={18} rx={15} ry={9} fill="#FF9DB8" opacity={0.6} />
      <ellipse cx={50} cy={18} rx={15} ry={9} fill="#FF9DB8" opacity={0.6} />
    </>
  )
}

/** The snowy owl's rock (scenery: flat tones, no outline), with a little snow left on it. */
export function Rock() {
  return (
    <g>
      <ellipse cx={6} cy={30} rx={128} ry={14} fill={SHADOW} opacity={0.12} />
      <path d="M-116 32 C-126 4 -100 -22 -44 -22 L52 -24 C104 -20 124 6 116 32Z" fill="#BCB6D6" />
      <path d="M52 -24 C104 -20 124 6 116 32 L60 32 C84 14 82 -10 52 -24Z" fill="#9790BA" />
      <path d="M-100 0 C-92 -14 -70 -18 -44 -18 C-64 -12 -80 -6 -88 6Z" fill="#DEDAF0" />
      <path d="M-70 -21 C-50 -30 30 -32 62 -23 C40 -18 20 -22 0 -17 C-22 -12 -44 -20 -70 -21Z" fill="#FFFFFF" />
    </g>
  )
}

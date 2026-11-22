// The pictures inside the world map's pins: one hand-drawn friend per country, in the map picture's own look (flat
// shapes, no outlines, dot eyes, pink cheeks) on a pastel disc that fills the pin. They replace the system emoji,
// which looked different on every device and didn't match the map (2026-11-22). A place with no picture here falls
// back to its emoji.
//
// Every friend sits inside the circle with room around it (`Fit`): a face floats in the middle, a friend with a neck
// or a body shrinks toward the bottom edge it grows from, and only the sky and the ground run to the rim.
import type { ReactNode } from 'react'

const INK = '#2B2330'
const BLUSH = '#FF8FB8'

const Eye = ({ x, y, r = 3.6 }: { x: number; y: number; r?: number }) => (
  <>
    <circle cx={x} cy={y} r={r} fill={INK} />
    <circle cx={x + r * 0.32} cy={y - r * 0.36} r={r * 0.34} fill="#fff" />
  </>
)
const Cheeks = ({ x, y, gap, r = 4.6 }: { x: number; y: number; gap: number; r?: number }) => (
  <>
    <ellipse cx={x - gap} cy={y} rx={r} ry={r * 0.72} fill={BLUSH} opacity="0.75" />
    <ellipse cx={x + gap} cy={y} rx={r} ry={r * 0.72} fill={BLUSH} opacity="0.75" />
  </>
)
const Smile = ({ x, y, w = 4 }: { x: number; y: number; w?: number }) => <path d={`M${x - w} ${y}q${w} ${w * 1.1} ${w * 2} 0`} fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />

/** Shrinks a friend toward (x, y) so the pin's disc shows all round it. */
const Fit = ({ s = 0.84, x = 50, y = 50, children }: { s?: number; x?: number; y?: number; children: ReactNode }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>{children}</g>
)

function Moose() {
  // A moose, not a cow: wide flat antlers with stubby points, a long face and a big soft nose.
  const antler = (
    <g fill="none" stroke="#EFCB8E" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 38 31 31" strokeWidth="7" />
      <path d="M33 27Q25 30 16 26" strokeWidth="14" />
      <path d="M12 26 7 22M17 22 14 15M24 22 23 13M32 22 33 15" strokeWidth="6" />
    </g>
  )
  const ear = (
    <>
      <ellipse cx="27" cy="46" rx="9" ry="5.5" fill="#8A5A3C" transform="rotate(-22 27 46)" />
      <ellipse cx="27.5" cy="46.5" rx="5" ry="2.8" fill="#F5B7A8" transform="rotate(-22 27 46)" />
    </>
  )
  return (
    <>
      <rect width="100" height="100" fill="#CFF3E4" />
      <Fit s={0.9} y={53}>
        {antler}
        <g transform="translate(100 0) scale(-1 1)">{antler}</g>
        {ear}
        <g transform="translate(100 0) scale(-1 1)">{ear}</g>
        <ellipse cx="50" cy="50" rx="21" ry="19" fill="#A9744E" />
        <ellipse cx="50" cy="70" rx="18" ry="14.5" fill="#D6A983" />
        <path d="M44 33q6-7 12 0q-6 4-12 0z" fill="#8A5A3C" />
        <Eye x={40.5} y={49} r={3.8} />
        <Eye x={59.5} y={49} r={3.8} />
        <Cheeks x={50} y={56.5} gap={17} r={3.8} />
        <ellipse cx="44" cy="66" rx="2.3" ry="3" fill="#8A5A3C" />
        <ellipse cx="56" cy="66" rx="2.3" ry="3" fill="#8A5A3C" />
        <Smile x={50} y={74.5} w={3.8} />
      </Fit>
    </>
  )
}

function Pizza() {
  // One slice, whole inside the circle: a puffy crust, melted cheese that drips, pepperoni, basil and a face.
  return (
    <>
      <rect width="100" height="100" fill="#FFD9E6" />
      <Fit s={0.97} y={52}>
        <g transform="rotate(-7 50 50)">
          <path d="M21 32Q50 22 79 32L54.5 86Q50 93 45.5 86Z" fill="#FFD460" />
          <path d="M23 36Q50 27 77 36L74.5 41.5Q50 32 25.5 41.5Z" fill="#F9BC42" />
          <path d="M21 30Q50 15 79 30" fill="none" stroke="#E9A857" strokeWidth="13" strokeLinecap="round" />
          <path d="M27 25.5Q48 16 68 23" fill="none" stroke="#F8D09A" strokeWidth="3" strokeLinecap="round" />
          <circle cx="36.5" cy="46" r="6.2" fill="#F0625A" />
          <circle cx="63.5" cy="46" r="6.2" fill="#F0625A" />
          <circle cx="50" cy="74.5" r="4.8" fill="#F0625A" />
          <g fill="#D9483F">
            <circle cx="34.5" cy="44.5" r="1.3" />
            <circle cx="38.5" cy="47.5" r="1.3" />
            <circle cx="62" cy="47.5" r="1.3" />
            <circle cx="65.5" cy="44.5" r="1.3" />
            <circle cx="50" cy="74.5" r="1.2" />
          </g>
          <ellipse cx="50" cy="42" rx="4.6" ry="2.5" fill="#5DBE8A" transform="rotate(-24 50 42)" />
          <ellipse cx="58.5" cy="66" rx="3.6" ry="2" fill="#5DBE8A" transform="rotate(32 58.5 66)" />
          <Eye x={44} y={56} r={3.3} />
          <Eye x={56} y={56} r={3.3} />
          <Cheeks x={50} y={61} gap={10.5} r={3} />
          <Smile x={50} y={60.5} w={3.2} />
        </g>
      </Fit>
    </>
  )
}

function Camel() {
  return (
    <>
      <rect width="100" height="100" fill="#CFE0FF" />
      <circle cx="74" cy="25" r="8" fill="#FFC83D" />
      <path d="M60 78 75 54 90 78Z" fill="#F2C55C" />
      <path d="M75 54 90 78H79.5Z" fill="#E0AC45" />
      <path d="M0 80Q28 64 56 76T100 72V100H0Z" fill="#FBEA9A" />
      <Fit s={0.86} x={40} y={100}>
        <path d="M38 100 42 60" stroke="#E2AC6C" strokeWidth="22" strokeLinecap="round" />
        <circle cx="27" cy="34" r="6.5" fill="#E2AC6C" />
        <circle cx="63" cy="34" r="6.5" fill="#E2AC6C" />
        <circle cx="27" cy="34.5" r="3.2" fill="#F5B7A8" />
        <circle cx="63" cy="34.5" r="3.2" fill="#F5B7A8" />
        <ellipse cx="45" cy="46" rx="21" ry="18" fill="#E2AC6C" />
        <g fill="#B97F45">
          <circle cx="45" cy="27" r="7" />
          <circle cx="38" cy="30" r="5" />
          <circle cx="52" cy="30" r="5" />
        </g>
        <ellipse cx="46" cy="58" rx="16" ry="11" fill="#F6D6A8" />
        <Eye x={36} y={45} />
        <Eye x={55} y={45} />
        <path d="M31.5 40.5 29 38M59.5 40.5 62 38" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
        <Cheeks x={45.5} y={52} gap={17} r={3.8} />
        <ellipse cx="42" cy="55" rx="1.6" ry="2.2" fill="#B97F45" />
        <ellipse cx="50" cy="55" rx="1.6" ry="2.2" fill="#B97F45" />
        <Smile x={46} y={61} />
      </Fit>
    </>
  )
}

function Panda() {
  // The classic cute panda face: a wide head, plain black ears tucked behind it, slanted eye patches with one
  // white glint each (no eye rings: they made it stare), a small nose joined to a "w" smile, cheeks under the eyes.
  const BLACK = '#33292F'
  return (
    <>
      <rect width="100" height="100" fill="#DDD2FF" />
      <Fit s={0.9} y={53}>
        <circle cx="23.5" cy="33" r="12.5" fill={BLACK} />
        <circle cx="76.5" cy="33" r="12.5" fill={BLACK} />
        <path d="M50 27C73 27 86 41 86 57C86 73 71 83 50 83C29 83 14 73 14 57C14 41 27 27 50 27Z" fill="#FFFDF8" />
        <ellipse cx="32.5" cy="56" rx="7.8" ry="9.8" fill={BLACK} transform="rotate(22 32.5 56)" />
        <ellipse cx="67.5" cy="56" rx="7.8" ry="9.8" fill={BLACK} transform="rotate(-22 67.5 56)" />
        <ellipse cx="34.8" cy="53.6" rx="2.1" ry="3.1" fill="#fff" transform="rotate(22 34.8 53.6)" />
        <ellipse cx="65.2" cy="53.6" rx="2.1" ry="3.1" fill="#fff" transform="rotate(-22 65.2 53.6)" />
        <Cheeks x={50} y={69} gap={23.5} r={5.2} />
        <path d="M46.6 60.4h6.8q1.5 0 .6 1.3l-2.8 3.2q-1.2 1.2-2.4 0l-2.8-3.2q-.9-1.3.6-1.3z" fill={BLACK} />
        <path d="M50 64.5v3M43.5 67.5q3.25 4 6.5 0q3.25 4 6.5 0" fill="none" stroke={BLACK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </Fit>
    </>
  )
}

function Elephant() {
  return (
    <>
      <rect width="100" height="100" fill="#FFE9A8" />
      <Fit s={0.78} y={46}>
        <circle cx="21" cy="47" r="22" fill="#94A8DA" />
        <circle cx="79" cy="47" r="22" fill="#94A8DA" />
        <ellipse cx="20" cy="48" rx="12" ry="14" fill="#F7B5CC" />
        <ellipse cx="80" cy="48" rx="12" ry="14" fill="#F7B5CC" />
        <circle cx="50" cy="45" r="27" fill="#B4C4EC" />
        <path d="M50 56V78Q50 91 64 88" fill="none" stroke="#B4C4EC" strokeWidth="15" strokeLinecap="round" />
        <path d="M44.5 70h11M44.5 78h11" stroke="#94A8DA" strokeWidth="2.2" strokeLinecap="round" />
        <Eye x={38} y={47} />
        <Eye x={62} y={47} />
        <Cheeks x={50} y={56} gap={19} r={4.4} />
      </Fit>
    </>
  )
}

function Llama() {
  return (
    <>
      <rect width="100" height="100" fill="#CFEBFF" />
      <Fit s={0.86} y={100}>
        <ellipse cx="34" cy="22" rx="6.5" ry="14" fill="#FFF3DD" transform="rotate(-14 34 22)" />
        <ellipse cx="66" cy="22" rx="6.5" ry="14" fill="#FFF3DD" transform="rotate(14 66 22)" />
        <ellipse cx="34.3" cy="23" rx="3" ry="9" fill="#F7B5CC" transform="rotate(-14 34 22)" />
        <ellipse cx="65.7" cy="23" rx="3" ry="9" fill="#F7B5CC" transform="rotate(14 66 22)" />
        <path d="M50 100V62" stroke="#FFF3DD" strokeWidth="30" strokeLinecap="round" />
        <path d="M33 82h34v8H33z" fill="#FF4F9A" />
        <path d="M33 90h34v5H33z" fill="#FFC83D" />
        <path d="M33 95h34v5H33z" fill="#5FCFB0" />
        <ellipse cx="50" cy="50" rx="22" ry="23" fill="#FFF3DD" />
        <g fill="#fff">
          <circle cx="41" cy="29" r="8.5" />
          <circle cx="50" cy="25" r="9" />
          <circle cx="59" cy="29" r="8.5" />
        </g>
        <ellipse cx="50" cy="61" rx="12" ry="9" fill="#FFDDB8" />
        <Eye x={39.5} y={48} />
        <Eye x={60.5} y={48} />
        <Cheeks x={50} y={56} gap={17} r={4} />
        <path d="M47 57.5h6l-3 3.4z" fill="#C98A6B" stroke="#C98A6B" strokeWidth="1.4" strokeLinejoin="round" />
        <Smile x={50} y={63.5} w={3.4} />
      </Fit>
    </>
  )
}

function Kangaroo() {
  return (
    <>
      <rect width="100" height="100" fill="#FFD9C7" />
      <Fit s={0.84} y={100}>
        <ellipse cx="31" cy="26" rx="10" ry="22" fill="#B9713F" transform="rotate(-18 31 26)" />
        <ellipse cx="69" cy="26" rx="10" ry="22" fill="#B9713F" transform="rotate(18 69 26)" />
        <ellipse cx="31.5" cy="28" rx="5" ry="15" fill="#F5B7A8" transform="rotate(-18 31 26)" />
        <ellipse cx="68.5" cy="28" rx="5" ry="15" fill="#F5B7A8" transform="rotate(18 69 26)" />
        <path d="M50 100V74" stroke="#B9713F" strokeWidth="30" strokeLinecap="round" />
        <ellipse cx="50" cy="55" rx="25" ry="23" fill="#C98652" />
        <ellipse cx="50" cy="68" rx="15" ry="13" fill="#F8E2C6" />
        <Eye x={38} y={51} />
        <Eye x={62} y={51} />
        <Cheeks x={50} y={60} gap={19} r={4.2} />
        <ellipse cx="50" cy="62" rx="5.4" ry="3.8" fill="#5A3A2A" />
        <Smile x={50} y={70} />
      </Fit>
    </>
  )
}

function Penguin() {
  return (
    <>
      <rect width="100" height="100" fill="#D6F0FF" />
      <path d="M0 82Q25 70 50 80T100 76V100H0Z" fill="#fff" />
      <Fit s={0.84} y={100}>
        <ellipse cx="21" cy="68" rx="7" ry="15" fill="#3F4A7A" transform="rotate(24 21 68)" />
        <ellipse cx="79" cy="68" rx="7" ry="15" fill="#3F4A7A" transform="rotate(-24 79 68)" />
        <path d="M50 20C68 20 78 36 78 58V100H22V58C22 36 32 20 50 20Z" fill="#4A5690" />
        <path d="M50 37C56 28 72 32 71 48C70 58 70 70 70 100H30C30 70 30 58 29 48C28 32 44 28 50 37Z" fill="#FFFDF8" />
        <Eye x={40} y={48} />
        <Eye x={60} y={48} />
        <Cheeks x={50} y={57} gap={15} r={4.2} />
        <path d="M44 54Q50 51 56 54Q53 62 50 62Q47 62 44 54Z" fill="#FFA53D" stroke="#FFA53D" strokeWidth="2" strokeLinejoin="round" />
      </Fit>
    </>
  )
}

const PICTURES: Record<string, () => ReactNode> = {
  canada: Moose,
  italy: Pizza,
  egypt: Camel,
  china: Panda,
  thailand: Elephant,
  peru: Llama,
  australia: Kangaroo,
  poles: Penguin,
}

export const hasPinArt = (id: string) => id in PICTURES

/** A country's pin picture: fills its (round) parent. */
export function PinArt({ id }: { id: string }) {
  const Picture = PICTURES[id]
  if (!Picture) return null
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        display: 'block',
      }}
    >
      <Picture />
    </svg>
  )
}

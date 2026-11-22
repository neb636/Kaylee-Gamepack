// The pictures inside the world map's pins: one hand-drawn friend per country, in the map picture's own look (flat
// shapes, no outlines, dot eyes, pink cheeks) on a pastel disc that fills the pin. They replace the system emoji,
// which looked different on every device and didn't match the map (2026-11-22). A place with no picture here falls
// back to its emoji.
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
const Smile = ({ x, y, w = 4 }: { x: number; y: number; w?: number }) => (
  <path d={`M${x - w} ${y}q${w} ${w * 1.1} ${w * 2} 0`} fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
)

function Moose() {
  const antler = (
    <g fill="none" stroke="#EBBE7C" strokeLinecap="round" strokeLinejoin="round">
      <path d="M37 37 20 25" strokeWidth="9" />
      <path d="M20 25 8 26M22 26 14 11M30 31 29 13" strokeWidth="8" />
    </g>
  )
  return (
    <>
      <rect width="100" height="100" fill="#CFF3E4" />
      {antler}
      <g transform="translate(100 0) scale(-1 1)">{antler}</g>
      <ellipse cx="27" cy="45" rx="9" ry="6" fill="#8A5A3C" transform="rotate(-24 27 45)" />
      <ellipse cx="73" cy="45" rx="9" ry="6" fill="#8A5A3C" transform="rotate(24 73 45)" />
      <ellipse cx="27.5" cy="45.5" rx="5" ry="3" fill="#F5B7A8" transform="rotate(-24 27 45)" />
      <ellipse cx="72.5" cy="45.5" rx="5" ry="3" fill="#F5B7A8" transform="rotate(24 73 45)" />
      <ellipse cx="50" cy="52" rx="21" ry="22" fill="#A26F4B" />
      <ellipse cx="50" cy="74" rx="20" ry="16" fill="#D3A57C" />
      <Eye x={40} y={52} />
      <Eye x={60} y={52} />
      <Cheeks x={50} y={60} gap={17} r={4} />
      <ellipse cx="43" cy="71" rx="3" ry="3.8" fill="#8A5A3C" />
      <ellipse cx="57" cy="71" rx="3" ry="3.8" fill="#8A5A3C" />
      <Smile x={50} y={80} />
    </>
  )
}

function Pizza() {
  return (
    <>
      <rect width="100" height="100" fill="#FFD9E6" />
      <g transform="rotate(-8 50 50)">
        <path d="M17 31Q50 14 83 31L55 88Q50 95 45 88Z" fill="#FFD25A" />
        <path d="M24 34Q50 22 76 34L73 40Q50 30 27 40Z" fill="#F8B93E" />
        <path d="M17 30Q50 12 83 30" fill="none" stroke="#E79F4D" strokeWidth="12" strokeLinecap="round" />
        <path d="M22 26Q50 13 78 26" fill="none" stroke="#F3BC76" strokeWidth="3" strokeLinecap="round" />
        <circle cx="36" cy="45" r="6" fill="#F0625A" />
        <circle cx="64" cy="45" r="6" fill="#F0625A" />
        <circle cx="50" cy="78" r="5" fill="#F0625A" />
        <circle cx="34.5" cy="43.5" r="1.6" fill="#F98F86" />
        <circle cx="62.5" cy="43.5" r="1.6" fill="#F98F86" />
        <circle cx="48.8" cy="76.8" r="1.4" fill="#F98F86" />
        <ellipse cx="50" cy="41" rx="5" ry="2.8" fill="#5DBE8A" transform="rotate(-20 50 41)" />
        <Eye x={43.5} y={56} r={3.3} />
        <Eye x={56.5} y={56} r={3.3} />
        <Cheeks x={50} y={62} gap={12} r={3.4} />
        <Smile x={50} y={61.5} w={3.4} />
      </g>
    </>
  )
}

function Camel() {
  return (
    <>
      <rect width="100" height="100" fill="#CFE0FF" />
      <circle cx="80" cy="22" r="10" fill="#FFC83D" />
      <path d="M62 78 79 50 96 78Z" fill="#F2C55C" />
      <path d="M79 50 96 78H84Z" fill="#E0AC45" />
      <path d="M0 80Q28 64 56 76T100 72V100H0Z" fill="#FBEA9A" />
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
    </>
  )
}

function Panda() {
  return (
    <>
      <rect width="100" height="100" fill="#E4DBFF" />
      <circle cx="25" cy="28" r="13" fill="#3A3340" />
      <circle cx="75" cy="28" r="13" fill="#3A3340" />
      <circle cx="25" cy="29" r="6" fill="#6B6072" />
      <circle cx="75" cy="29" r="6" fill="#6B6072" />
      <ellipse cx="50" cy="55" rx="33" ry="30" fill="#FFFDF8" />
      <ellipse cx="36" cy="52" rx="9" ry="11" fill="#3A3340" transform="rotate(22 36 52)" />
      <ellipse cx="64" cy="52" rx="9" ry="11" fill="#3A3340" transform="rotate(-22 64 52)" />
      <circle cx="37.5" cy="51" r="3.6" fill="#fff" />
      <circle cx="62.5" cy="51" r="3.6" fill="#fff" />
      <circle cx="38" cy="51.5" r="2" fill={INK} />
      <circle cx="62" cy="51.5" r="2" fill={INK} />
      <Cheeks x={50} y={67} gap={21} r={5} />
      <ellipse cx="50" cy="63" rx="4.6" ry="3.2" fill="#3A3340" />
      <path d="M44 69q3 4 6 0q3 4 6 0" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

function Elephant() {
  return (
    <>
      <rect width="100" height="100" fill="#FFE9A8" />
      <g transform="translate(50 52) scale(0.9) translate(-50 -50)">
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
      </g>
    </>
  )
}

function Llama() {
  return (
    <>
      <rect width="100" height="100" fill="#CFEBFF" />
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
    </>
  )
}

function Kangaroo() {
  return (
    <>
      <rect width="100" height="100" fill="#FFD9C7" />
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
    </>
  )
}

function Penguin() {
  return (
    <>
      <rect width="100" height="100" fill="#D6F0FF" />
      <path d="M0 82Q25 70 50 80T100 76V100H0Z" fill="#fff" />
      <ellipse cx="21" cy="68" rx="7" ry="15" fill="#3F4A7A" transform="rotate(24 21 68)" />
      <ellipse cx="79" cy="68" rx="7" ry="15" fill="#3F4A7A" transform="rotate(-24 79 68)" />
      <path d="M50 20C68 20 78 36 78 58V100H22V58C22 36 32 20 50 20Z" fill="#4A5690" />
      <path d="M50 37C56 28 72 32 71 48C70 58 70 70 70 100H30C30 70 30 58 29 48C28 32 44 28 50 37Z" fill="#FFFDF8" />
      <Eye x={40} y={48} />
      <Eye x={60} y={48} />
      <Cheeks x={50} y={57} gap={15} r={4.2} />
      <path d="M44 54Q50 51 56 54Q53 62 50 62Q47 62 44 54Z" fill="#FFA53D" stroke="#FFA53D" strokeWidth="2" strokeLinejoin="round" />
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
    <svg viewBox="0 0 100 100" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: '50%', display: 'block' }}>
      <Picture />
    </svg>
  )
}

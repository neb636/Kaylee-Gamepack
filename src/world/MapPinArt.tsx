import type { ReactNode } from 'react'

const INK = '#5D3E46'
const EYE = (
  <>
    <circle cx="26" cy="33" r="2.4" fill={INK} />
    <circle cx="27" cy="32.3" r=".8" fill="#fff" />
    <circle cx="38" cy="33" r="2.4" fill={INK} />
    <circle cx="39" cy="32.3" r=".8" fill="#fff" />
  </>
)

const PICTURES: Record<string, ReactNode> = {
  canada: (
    <g stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 24 18 19 13 20 14 14 9 13 15 8 20 12 23 6 27 11 29 19M41 24l5-5 5 1-1-6 5-1-6-5-5 4-3-6-4 5-2 8" fill="none" stroke="#A87649" strokeWidth="4" />
      <path d="M23 23 18 18M21 20l2-6M41 23l5-5M43 20l-2-6" fill="none" stroke="#F0C586" strokeWidth="1.5" />
      <path d="M19 30Q19 22 26 22L32 25 38 22Q45 24 45 31L47 39Q45 48 38 51L32 54 26 51Q18 47 17 39Z" fill="#B97D50" />
      <path d="M18 32Q12 27 13 34L18 39M46 32Q52 27 51 34L46 39" fill="#D89A66" />
      <path d="M23 39Q24 35 28 36L32 39 36 36Q40 35 41 39L40 45Q36 50 32 49 26 50 23 45Z" fill="#F7E4CB" />
      {EYE}
      <ellipse cx="32" cy="41" rx="2.3" ry="1.7" fill={INK} stroke="none" />
      <path d="M30 45q2 2 4 0" fill="none" />
      <circle cx="22" cy="42" r="2.1" fill="#F49BAD" stroke="none" />
      <circle cx="42" cy="42" r="2.1" fill="#F49BAD" stroke="none" />
      <path d="M28 27q2-2 4 0m4 0q2-2 4 0" fill="none" stroke="#E9B57D" />
    </g>
  ),
  italy: (
    <g stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 20Q31 10 50 19L35 53Q32 59 29 53Z" fill="#F7C94F" />
      <path d="M13 20Q31 10 50 19" fill="none" stroke="#C7793E" strokeWidth="7" />
      <path d="M16 18Q31 12 47 18" fill="none" stroke="#F6D99B" strokeWidth="1.6" />
      <circle cx="23" cy="27" r="3.2" fill="#E65456" />
      <circle cx="39" cy="25" r="3.2" fill="#E65456" />
      <circle cx="32" cy="43" r="3.2" fill="#E65456" />
      <path d="M30 24q-4-5 0-7 3 3 0 7m2 0q2-5 6-4-1 4-6 5" fill="#65B878" stroke="#347A56" strokeWidth="1.3" />
      <circle cx="27" cy="33" r="1.9" fill={INK} stroke="none" />
      <circle cx="37" cy="33" r="1.9" fill={INK} stroke="none" />
      <circle cx="27.5" cy="32.5" r=".6" fill="#fff" stroke="none" />
      <circle cx="37.5" cy="32.5" r=".6" fill="#fff" stroke="none" />
      <path d="M29 38q3 4 6 0" fill="none" />
      <circle cx="23" cy="37" r="1.7" fill="#F28D9C" stroke="none" />
      <circle cx="41" cy="37" r="1.7" fill="#F28D9C" stroke="none" />
    </g>
  ),
  egypt: (
    <g stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 45q2-10 14-10 5-10 16-7 7 2 6 10l5 5q-3 5-10 5H25q-8 0-9-3Z" fill="#D9A35C" />
      <path d="M28 36q-4-9 1-16 4-5 10-2l-2 6q-4 2-2 9" fill="#E7B970" />
      <path d="M38 22q2-5 7-4l5 3-4 3q-4-2-8 1" fill="#E7B970" />
      <path d="M24 33q2-13-3-16-2-3 0-6 3 4 7 6 3 6 1 16" fill="#C78649" />
      <path d="M24 14q-3-4 0-7 4 3 4 8" fill="#F2CA80" />
      <path d="M31 12q-1-5 3-7 3 5 1 10" fill="#F2CA80" />
      <path d="M36 20q-3 3-5 6" fill="none" stroke="#F6D699" strokeWidth="1.5" />
      <circle cx="45" cy="22" r="1.7" fill={INK} stroke="none" />
      <circle cx="45.5" cy="21.5" r=".6" fill="#fff" stroke="none" />
      <path d="M49 26q3 2 5 0" fill="none" />
      <path d="M22 46v7m7-7v7m14-7v7m7-7v7" fill="none" stroke="#A96E3F" strokeWidth="2.8" />
      <path d="M16 43q-5 0-5-4" fill="none" stroke="#A96E3F" />
      <circle cx="51" cy="31" r="1.8" fill="#F28D9C" stroke="none" />
    </g>
  ),
  china: (
    <g stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="8" fill="#31333A" />
      <circle cx="44" cy="20" r="8" fill="#31333A" />
      <path d="M13 33Q13 24 22 23L32 25 42 23Q51 25 51 34L49 43Q45 52 32 53 19 52 15 43Z" fill="#FFF9EE" />
      <ellipse cx="24" cy="34" rx="5" ry="7" fill="#34343B" transform="rotate(22 24 34)" />
      <ellipse cx="40" cy="34" rx="5" ry="7" fill="#34343B" transform="rotate(-22 40 34)" />
      <circle cx="25" cy="33" r="1.7" fill="#fff" stroke="none" />
      <circle cx="39" cy="33" r="1.7" fill="#fff" stroke="none" />
      <circle cx="25" cy="33" r=".9" fill={INK} stroke="none" />
      <circle cx="39" cy="33" r=".9" fill={INK} stroke="none" />
      <ellipse cx="32" cy="40" rx="2.7" ry="2" fill={INK} stroke="none" />
      <path d="M29 44q3 3 6 0" fill="none" />
      <circle cx="20" cy="42" r="2" fill="#F49BAD" stroke="none" />
      <circle cx="44" cy="42" r="2" fill="#F49BAD" stroke="none" />
      <path d="M17 48q-5-2-6-7m42 7q5-2 6-7" fill="none" stroke="#31333A" strokeWidth="3" />
      <path d="m17 17 3-4 3 3m17 1 4-4 3 4" fill="none" stroke="#77717E" strokeWidth="1" />
      <path d="M48 26q5 1 6 6" fill="none" stroke="#71A767" strokeWidth="2" />
      <path d="m52 29 4-3m-4 3-1-4" fill="none" stroke="#71A767" strokeWidth="1.4" />
    </g>
  ),
  thailand: (
    <g stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 31Q12 23 12 34L15 44Q18 49 24 44M43 31Q52 23 52 34L49 44Q46 49 40 44" fill="#94A8E0" />
      <path d="M15 34Q13 29 16 30M49 34Q51 29 48 30" fill="none" stroke="#F7B6C8" strokeWidth="3.5" />
      <path d="M18 30Q18 21 26 21L32 24 38 21Q46 22 46 31L45 40Q43 48 37 49L36 55Q36 59 41 57" fill="#ABC0EF" />
      <path d="M36 40q0 7-6 10-5 2-4 7 1 4 6 3" fill="none" stroke="#8499D3" strokeWidth="7" />
      <path d="M35 48q2 3 5 1" fill="none" stroke="#8499D3" strokeWidth="1.2" />
      <circle cx="26" cy="32" r="2.1" fill={INK} stroke="none" />
      <circle cx="38" cy="32" r="2.1" fill={INK} stroke="none" />
      <circle cx="26.5" cy="31.4" r=".7" fill="#fff" stroke="none" />
      <circle cx="38.5" cy="31.4" r=".7" fill="#fff" stroke="none" />
      <circle cx="21" cy="38" r="2" fill="#F49BAD" stroke="none" />
      <circle cx="43" cy="38" r="2" fill="#F49BAD" stroke="none" />
      <path d="M29 39q3 3 6 0" fill="none" />
      <path d="M32 21q1-7 5-10 4 3 2 9" fill="#F5CF63" />
      <path d="M35 15q2 3 5 3" fill="none" stroke="#F8E9A9" strokeWidth="1.5" />
    </g>
  ),
  peru: (
    <g stroke={INK} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 27Q20 18 22 9Q29 11 31 23M41 27Q44 17 42 9Q35 11 33 23" fill="#FFF3DC" />
      <path d="M25 15q3 1 4 5m11-5q-3 1-4 5" fill="none" stroke="#E6A7A6" strokeWidth="1.5" />
      <path d="M17 31Q18 22 27 22L32 24 37 22Q47 23 47 32L45 42Q42 51 32 52 21 51 19 42Z" fill="#FFF6E7" />
      <path d="M18 29q14 5 28 0l-1 7q-13 4-26 0Z" fill="#E85E85" />
      <path d="M19 31q13 4 26 0m-25 3q12 3 24 0" fill="none" stroke="#F6D35F" strokeWidth="1.5" />
      <path d="m25 31 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2" fill="none" stroke="#51BFA5" strokeWidth="1.4" />
      <circle cx="26" cy="40" r="2" fill={INK} stroke="none" />
      <circle cx="38" cy="40" r="2" fill={INK} stroke="none" />
      <circle cx="26.5" cy="39.4" r=".7" fill="#fff" stroke="none" />
      <circle cx="38.5" cy="39.4" r=".7" fill="#fff" stroke="none" />
      <path d="M29 45q3 3 6 0" fill="none" />
      <circle cx="21" cy="44" r="2" fill="#F49BAD" stroke="none" />
      <circle cx="43" cy="44" r="2" fill="#F49BAD" stroke="none" />
      <path d="M27 24q5-6 10 0" fill="none" stroke="#fff" strokeWidth="2" />
    </g>
  ),
  australia: (
    <g stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 29Q19 24 17 17 16 9 22 8 28 11 30 24M40 29Q45 24 47 17 48 9 42 8 36 11 34 24" fill="#B96E45" />
      <path d="M20 14q5 3 7 9m17-9q-5 3-7 9" fill="none" stroke="#F0B28A" strokeWidth="1.8" />
      <path d="M19 32Q19 23 28 22L32 24 36 22Q45 24 45 33L43 41Q40 48 32 49 23 48 21 41Z" fill="#CA8253" />
      <path d="M26 40q6-4 12 0l-1 9q-5 4-10 0Z" fill="#F1D6AE" />
      <circle cx="27" cy="32" r="2.2" fill={INK} stroke="none" />
      <circle cx="37" cy="32" r="2.2" fill={INK} stroke="none" />
      <circle cx="27.5" cy="31.4" r=".7" fill="#fff" stroke="none" />
      <circle cx="37.5" cy="31.4" r=".7" fill="#fff" stroke="none" />
      <path d="M29 38q3 3 6 0" fill="none" />
      <circle cx="23" cy="38" r="1.8" fill="#F49BAD" stroke="none" />
      <circle cx="41" cy="38" r="1.8" fill="#F49BAD" stroke="none" />
      <path d="M29 47q3-4 6 0" fill="none" stroke="#9D573D" strokeWidth="1.2" />
      <ellipse cx="32" cy="48" rx="5.5" ry="4" fill="#F0D9B8" />
      <circle cx="30" cy="47" r="1" fill={INK} stroke="none" />
      <circle cx="34" cy="47" r="1" fill={INK} stroke="none" />
      <path d="m30.5 50 1.5 1 1.5-1" fill="none" stroke="#B96E45" strokeWidth="1.2" />
    </g>
  ),
  poles: (
    <g stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 44q-8-6-10-1 1 7 11 9M42 44q8-6 10-1-1 7-11 9" fill="#53628D" />
      <path d="M20 27Q24 18 32 18t12 9l3 15q-3 11-15 12-12-1-15-12Z" fill="#46547F" />
      <path d="M21 34q11-5 22 0l1 18q-6 5-12 5-7 0-12-5Z" fill="#FFF9F0" />
      <circle cx="27" cy="34" r="2" fill={INK} stroke="none" />
      <circle cx="37" cy="34" r="2" fill={INK} stroke="none" />
      <circle cx="27.5" cy="33.4" r=".7" fill="#fff" stroke="none" />
      <circle cx="37.5" cy="33.4" r=".7" fill="#fff" stroke="none" />
      <path d="m28 39 4 4 4-4q-1 7-4 7t-4-7Z" fill="#F5A63D" />
      <path d="M19 46q13 5 26 0l-1 6q-12 5-24 0Z" fill="#E96D93" />
      <path d="m22 47 3 4m4-4 3 4m4-4 3 4m4-4-2 3" fill="none" stroke="#F7D271" strokeWidth="1.4" />
      <path d="M22 28q3-6 8-7" fill="none" stroke="#8795BE" strokeWidth="1.2" />
      <circle cx="23" cy="40" r="1.7" fill="#F49BAD" stroke="none" />
      <circle cx="41" cy="40" r="1.7" fill="#F49BAD" stroke="none" />
    </g>
  ),
}

const BACKPLATES: Record<string, string> = {
  canada: '#E5F5E9',
  italy: '#FFF1D2',
  egypt: '#FFF1D5',
  china: '#F4E8F4',
  thailand: '#E5F0FF',
  peru: '#FBE7E9',
  australia: '#FFEBD9',
  poles: '#E6F5FB',
}

/** Original, hand-drawn vector mascots for the world-map pins. */
export function MapPinArt({ id, fallback }: { id: string; fallback: string }) {
  const picture = PICTURES[id]
  if (!picture) return <span aria-hidden="true">{fallback}</span>
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: '50%', display: 'block' }}
    >
      <circle cx="32" cy="32" r="32" fill={BACKPLATES[id] || '#F2EFFF'} />
      <path d="M9 53q7-3 13 0m20 0q6-3 13 0" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".8" />
      {picture}
    </svg>
  )
}

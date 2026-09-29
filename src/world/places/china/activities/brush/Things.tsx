// The things a painted character turns into (person, mountains, sun, tree, bird, moon) and the red chop seal.
// All drawn in SVG in the same warm-brown outline as the China art, so they sit in the painted scene.
import { motion } from 'motion/react'
import { INK } from '../../puppets/ink'

export const ZH_FONT = '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif'
const SW = 3.5

/** A smiling sun (aspect 1:1) with slowly turning rays. */
export function Sun() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 24, ease: 'linear' }} style={{ originX: 0.5, originY: 0.5 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x="46" y="2" width="8" height="16" rx="4" fill="#FFB347" stroke={INK} strokeWidth="2.5" transform={`rotate(${i * 36} 50 50)`} />
        ))}
      </motion.g>
      <circle cx="50" cy="50" r="28" fill="#FFD84D" stroke={INK} strokeWidth={SW} />
      <circle cx="41" cy="47" r="2.8" fill="#4A2616" />
      <circle cx="59" cy="47" r="2.8" fill="#4A2616" />
      <circle cx="35" cy="56" r="4.5" fill="#FF9EA8" opacity="0.8" />
      <circle cx="65" cy="56" r="4.5" fill="#FF9EA8" opacity="0.8" />
      <path d="M43 58 Q50 65 57 58" fill="none" stroke="#4A2616" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

/** A sleepy crescent moon (aspect 1:1). */
export function Moon() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <path d="M64 8 A44 44 0 1 0 92 66 A36 36 0 0 1 64 8 Z" fill="#FFF1A8" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M32 50 Q37 55 42 50" fill="none" stroke="#4A2616" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="30" cy="62" r="4.5" fill="#FF9EA8" opacity="0.8" />
      <path d="M40 72 Q46 76 52 72" fill="none" stroke="#4A2616" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

/** The red chop seal with her Chinese name (aspect 1:1). */
export function Seal({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', ...style }} aria-hidden>
      <rect x="4" y="4" width="92" height="92" rx="12" fill="#D8343A" />
      <rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="#FFD9CF" strokeWidth="2.5" opacity="0.85" />
      <text x="50" y="66" textAnchor="middle" fontSize="40" fontWeight="700" fill="#FFF3EC" fontFamily={ZH_FONT} letterSpacing="2">
        凯莉
      </text>
    </svg>
  )
}

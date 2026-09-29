// Small pieces for The Great Race: sprite lookup (with an emoji fallback), splashes, rain, a droopy flower, and a
// zodiac wheel that fills in one animal at a time.
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { art } from '../../art'
import { INK } from '../../puppets/ink'

const loose = art as unknown as Record<string, string | undefined>

/** A little flat picture of an emoji, used when a generated picture is missing. */
const emojiPic = (emoji: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="80" font-size="80" text-anchor="middle">${emoji}</text></svg>`)}`

/** The generated picture with this art key, or an emoji stand-in. */
export const pic = (key: string, emoji: string) => loose[key] ?? emojiPic(emoji)

export interface Zodiac {
  id: string
  emoji: string
  key: string
  name: string
  hanzi: string
}
/** The twelve zodiac animals in order (the first five raced in the story; the rest are emoji pictures). */
export const ZODIAC: Zodiac[] = [
  { id: 'mouse', emoji: '🐭', key: 'mouse', name: 'Rat', hanzi: '鼠' },
  { id: 'ox', emoji: '🐂', key: 'ox', name: 'Ox', hanzi: '牛' },
  { id: 'tiger', emoji: '🐯', key: 'tiger', name: 'Tiger', hanzi: '虎' },
  { id: 'rabbit', emoji: '🐰', key: 'rabbit', name: 'Rabbit', hanzi: '兔' },
  { id: 'dragon', emoji: '🐲', key: 'dragon', name: 'Dragon', hanzi: '龙' },
  { id: 'snake', emoji: '🐍', key: 'snake', name: 'Snake', hanzi: '蛇' },
  { id: 'horse', emoji: '🐴', key: 'horse', name: 'Horse', hanzi: '马' },
  { id: 'goat', emoji: '🐐', key: 'goat', name: 'Goat', hanzi: '羊' },
  { id: 'monkey', emoji: '🐵', key: 'monkey', name: 'Monkey', hanzi: '猴' },
  { id: 'rooster', emoji: '🐓', key: 'rooster', name: 'Rooster', hanzi: '鸡' },
  { id: 'dog', emoji: '🐶', key: 'dog', name: 'Dog', hanzi: '狗' },
  { id: 'pig', emoji: '🐷', key: 'pig', name: 'Pig', hanzi: '猪' },
]

/** A burst of drops and a ripple where something hits the water. Positions are fractions of the stage. */
export function Splash({ x, y, u, kind = 'splash' }: { x: number; y: number; u: number; kind?: 'splash' | 'puff' }) {
  const drops = kind === 'splash' ? 9 : 6
  const color = kind === 'splash' ? '#fff' : '#F5E6D3'
  return (
    <div style={{ position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 0, height: 0, pointerEvents: 'none', zIndex: 60 }}>
      {kind === 'splash' && (
        <motion.div initial={{ scale: 0.2, opacity: 0.9 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }} style={{ position: 'absolute', left: -u * 0.12, top: -u * 0.03, width: u * 0.24, height: u * 0.07, borderRadius: '50%', border: '4px solid rgba(255,255,255,.9)' }} />
      )}
      {Array.from({ length: drops }, (_, i) => {
        const a = (i / drops) * Math.PI - Math.PI
        const dx = Math.cos(a) * u * 0.11 * (0.7 + (i % 3) * 0.25)
        const up = u * (0.07 + (i % 4) * 0.03)
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: dx, y: [0, -up, u * 0.03], opacity: [1, 1, 0], scale: [1, 1, 0.6] }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            style={{ position: 'absolute', left: -u * 0.014, top: -u * 0.014, width: u * 0.028, height: u * 0.028, borderRadius: '50%', background: color, border: `2px solid ${kind === 'splash' ? '#8CC9F5' : '#D9BFA0'}` }}
          />
        )
      })}
    </div>
  )
}

/** Rain falling from a cloud down to a flower: a stream of drops. */
export function Rain({ x, y0, y1, u }: { x: number; y0: number; y1: number; u: number }) {
  return (
    <div style={{ position: 'absolute', left: `${x * 100}%`, top: `${y0 * 100}%`, width: 0, height: 0, pointerEvents: 'none', zIndex: 40 }}>
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, (y1 - y0) * 1000], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.85, repeat: 2, delay: (i % 6) * 0.12, ease: 'easeIn' }}
          style={{ position: 'absolute', left: ((i * 37) % 100) * u * 0.0014 - u * 0.07, width: u * 0.02, height: u * 0.045, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#7EC8F7', border: '2px solid #4FA6E0' }}
        />
      ))}
    </div>
  )
}

/** A flower that droops when it is thirsty and springs up when it drinks. */
export function Flower({ wilted, size }: { wilted: boolean; size: number }) {
  return (
    <motion.svg viewBox="0 0 100 130" width={size} height={size * 1.3} style={{ overflow: 'visible', display: 'block' }} animate={{ filter: wilted ? 'saturate(0.35) brightness(0.95)' : 'saturate(1) brightness(1)' }}>
      <path d="M50 128 C48 100 50 80 50 60" stroke={INK} strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M50 128 C48 100 50 80 50 60" stroke="#7CCBA2" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M50 108 C34 108 26 96 24 88 C38 88 48 96 50 108Z" fill="#7CCBA2" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <motion.g animate={{ rotate: wilted ? 78 : 0 }} transition={{ type: 'spring', stiffness: 120, damping: 7 }} style={{ transformOrigin: '50px 62px', transformBox: 'view-box' }}>
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={50 + Math.cos(((a - 90) * Math.PI) / 180) * 20} cy={38 + Math.sin(((a - 90) * Math.PI) / 180) * 20} r="16" fill="#FF8FB8" stroke={INK} strokeWidth="3.5" />
        ))}
        <circle cx="50" cy="38" r="13" fill="#FFC83D" stroke={INK} strokeWidth="3.5" />
        <circle cx="46" cy="36" r="2.4" fill="#4A2616" />
        <circle cx="55" cy="36" r="2.4" fill="#4A2616" />
        <path d="M46 42 Q50.5 46 55 42" stroke="#4A2616" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </motion.g>
    </motion.svg>
  )
}

/** The zodiac wheel: twelve round slots that fill in with each animal (`count` of them so far). */
export function Wheel({ size, count, glow, center }: { size: number; count: number; glow: string[]; center?: ReactNode }) {
  const slot = size * 0.2
  const rad = size * 0.385
  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: '50%', background: '#FFF7F0', border: `${Math.max(4, size * 0.016)}px solid ${INK}`, boxShadow: 'var(--shadow)', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: '7%', borderRadius: '50%', background: 'repeating-conic-gradient(#FFE3EE 0 15deg, #FFF3D6 15deg 30deg)', border: `${Math.max(3, size * 0.008)}px solid #E8504F`, opacity: 0.85 }} />
      {ZODIAC.map((z, i) => {
        const a = ((i * 30 - 90) * Math.PI) / 180
        const on = i < count
        const lit = glow.includes(z.id)
        return (
          <div key={z.id} style={{ position: 'absolute', left: size / 2 + Math.cos(a) * rad - slot / 2, top: size / 2 + Math.sin(a) * rad - slot / 2, width: slot, height: slot }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: on ? `${Math.max(3, size * 0.008)}px solid ${INK}` : `3px dashed rgba(110,59,36,.35)`, background: on ? '#fff' : 'rgba(255,255,255,.4)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              {on && (
                <motion.img
                  src={pic(z.key, z.emoji)}
                  alt={z.name}
                  draggable={false}
                  initial={{ scale: 0.1, rotate: -25 }}
                  animate={lit ? { scale: [1, 1.22, 1], rotate: 0 } : { scale: 1, rotate: 0 }}
                  transition={lit ? { repeat: Infinity, duration: 0.9 } : { type: 'spring', stiffness: 420, damping: 14 }}
                  style={{ width: '82%', height: '82%', objectFit: 'contain' }}
                />
              )}
            </div>
            {lit && <motion.div animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.18, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} style={{ position: 'absolute', inset: -6, borderRadius: '50%', boxShadow: '0 0 0 5px #FFC83D, 0 0 22px 8px #FFE9A0', pointerEvents: 'none' }} />}
          </div>
        )
      })}
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: size * 0.36, height: size * 0.36, marginLeft: -size * 0.18, marginTop: -size * 0.18, borderRadius: '50%', background: '#fff', border: `${Math.max(3, size * 0.01)}px solid ${INK}`, display: 'grid', placeItems: 'center' }}>{center}</div>
    </div>
  )
}

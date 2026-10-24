// The pastel sky the app opens on (splash and home header): drifting two-tone clouds, twinkling stars, little
// hot-air balloons, a rainbow, a wavy edge, the "Hi Kaylee!" title and the glossy pill buttons.
// Everything in the sky reacts to a tap with a sound.
import { motion, useAnimationControls } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { KID_NAME, sounds } from './sdk-internal'
import { unlockSounds } from '../sdk/sounds'
import './sky.css'

const SHADE = '#e8ddff'

/** A flat two-tone cloud: white on top of a lavender shade. */
export function Cloud({ width, style }: { width: string; style?: CSSProperties }) {
  const puffs = (
    <>
      <ellipse cx="110" cy="84" rx="100" ry="22" />
      <circle cx="58" cy="70" r="32" />
      <circle cx="108" cy="52" r="44" />
      <circle cx="160" cy="68" r="34" />
    </>
  )
  return (
    <svg viewBox="0 0 220 110" style={{ width, height: 'auto', display: 'block', overflow: 'visible', ...style }} aria-hidden>
      <g fill={SHADE}>{puffs}</g>
      <g fill="#fff" transform="translate(0 -9)">
        {puffs}
      </g>
    </svg>
  )
}

/** Tap it: it squishes and pops. */
function TapCloud({ width }: { width: string }) {
  return (
    <motion.div
      whileTap={{ scale: 0.82, y: 6 }}
      onClick={() => {
        unlockSounds()
        sounds.pop()
      }}
      style={{ cursor: 'pointer' }}
    >
      <Cloud width={width} />
    </motion.div>
  )
}

const STAR = 'M0,-50 C6,-8 8,-6 50,0 C8,6 6,8 0,50 C-6,8 -8,6 -50,0 C-8,-6 -6,-8 0,-50Z'

export function Star({ size, color = '#ffd75e', delay = 0, style }: { size: number; color?: string; delay?: number; style?: CSSProperties }) {
  return (
    <span aria-hidden style={{ position: 'absolute', width: size, height: size, ...style }}>
      <svg viewBox="-50 -50 100 100" className="sky-twinkle" style={{ width: '100%', height: '100%', animationDelay: `${delay}s`, overflow: 'visible' }}>
        <path d={STAR} fill={color} stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

/** A little striped hot-air balloon, like Sparkle's. Tap it and it bounces up. */
export function Balloon({ width, style, delay = 0 }: { width: string; style?: CSSProperties; delay?: number }) {
  const controls = useAnimationControls()
  return (
    <motion.div
      animate={controls}
      onClick={() => {
        unlockSounds()
        sounds.whoosh()
        void controls.start({ y: [0, -46, 0], transition: { duration: 0.9, ease: 'easeOut' } })
      }}
      style={{ position: 'absolute', width, cursor: 'pointer', ...style }}
    >
      <div className="sky-bob" style={{ animationDelay: `${delay}s` }}>
        <svg viewBox="0 0 100 142" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }} aria-hidden>
          <defs>
            <clipPath id="sky-balloon">
              <path d="M50 4 C82 4 96 28 96 50 C96 74 72 88 62 100 L38 100 C28 88 4 74 4 50 C4 28 18 4 50 4Z" />
            </clipPath>
          </defs>
          <path d="M39 100 L42 118 M61 100 L58 118" stroke="#c98a2e" strokeWidth="3" strokeLinecap="round" />
          <g clipPath="url(#sky-balloon)">
            <rect width="100" height="100" fill="#ff8fb8" />
            <path d="M50 0 C66 18 68 70 60 100 L40 100 C32 70 34 18 50 0Z" fill="#c8b6ff" />
            <path d="M0 0 H22 C12 30 14 70 28 100 H0Z M100 0 H78 C88 30 86 70 72 100 H100Z" fill="#c8b6ff" />
            <path d="M0 62 Q50 82 100 62 V72 Q50 92 0 72Z" fill="#fff3b0" />
          </g>
          <path
            d="M50 4 C82 4 96 28 96 50 C96 74 72 88 62 100 L38 100 C28 88 4 74 4 50 C4 28 18 4 50 4Z"
            fill="none"
            stroke="#ff4f9a"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <rect x="37" y="116" width="26" height="20" rx="5" fill="#ffd75e" stroke="#e0a92a" strokeWidth="4" />
          <path d="M44 124 h12" stroke="#e0a92a" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    </motion.div>
  )
}

const BOWS = ['#ff9ec4', '#ffc2a8', '#fbe48a', '#9fe6cd', '#a8dcff', '#c4b0ff']

/** A soft rainbow arc, 2:1, its feet on the bottom edge. */
export function Rainbow({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 400 204" style={{ display: 'block', overflow: 'visible', ...style }} aria-hidden>
      {BOWS.map((c, i) => {
        const r = 186 - i * 20
        return <path key={c} d={`M${200 - r} 204 A${r} ${r} 0 0 1 ${200 + r} 204`} fill="none" stroke={c} strokeWidth="21" />
      })}
    </svg>
  )
}

/** A wavy top edge for a panel: sits on top of it, the same color. */
export function Wave({ color, style }: { color: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 1000 60" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, width: '100%', display: 'block', ...style }} aria-hidden>
      <path d="M0 34 C120 4 230 4 350 26 S590 58 720 30 S900 0 1000 22 V60 H0Z" fill={color} />
    </svg>
  )
}

type CloudSpec = { top: string; width: string; dur: number; delay: number; opacity?: number }

const FULL_CLOUDS: CloudSpec[] = [
  { top: '6%', width: 'clamp(120px, 21vw, 250px)', dur: 70, delay: -12 },
  { top: '20%', width: 'clamp(80px, 13vw, 160px)', dur: 96, delay: -64, opacity: 0.85 },
  { top: '38%', width: 'clamp(130px, 24vw, 290px)', dur: 82, delay: -40 },
  { top: '56%', width: 'clamp(90px, 15vw, 180px)', dur: 110, delay: -90, opacity: 0.9 },
]
const BAND_CLOUDS: CloudSpec[] = [
  { top: '8%', width: 'clamp(90px, 15vw, 190px)', dur: 80, delay: -20, opacity: 0.9 },
  { top: '42%', width: 'clamp(110px, 19vw, 230px)', dur: 100, delay: -70 },
]

const FULL_STARS = [
  { left: '7%', top: '12%', size: 28, delay: 0 },
  { left: '88%', top: '8%', size: 36, delay: 0.8, color: '#fff' },
  { left: '74%', top: '30%', size: 20, delay: 1.4 },
  { left: '16%', top: '46%', size: 22, delay: 0.4, color: '#fff' },
  { left: '93%', top: '48%', size: 18, delay: 1.9 },
  { left: '38%', top: '5%', size: 16, delay: 1.1, color: '#fff' },
  { left: '58%', top: '14%', size: 22, delay: 2.2 },
]
const BAND_STARS = [
  { left: '4%', top: '14%', size: 22, delay: 0.3 },
  { left: '52%', top: '10%', size: 18, delay: 1.2, color: '#fff' },
  { left: '64%', top: '62%', size: 16, delay: 2 },
]

/** The sky, filling its (positioned) parent. Put content above it with `position: relative`. */
export function Sky({ variant = 'full', children }: { variant?: 'full' | 'band'; children?: ReactNode }) {
  const clouds = variant === 'full' ? FULL_CLOUDS : BAND_CLOUDS
  const stars = variant === 'full' ? FULL_STARS : BAND_STARS
  return (
    <div className="sky">
      {stars.map((s, i) => (
        <Star key={i} size={s.size} color={s.color} delay={s.delay} style={{ left: s.left, top: s.top }} />
      ))}
      {clouds.map((c, i) => (
        <div key={i} className="sky-drift" style={{ top: c.top, opacity: c.opacity, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}>
          <TapCloud width={c.width} />
        </div>
      ))}
      {children}
    </div>
  )
}

/** A soft white lift under the big pink titles. */
export const TITLE_SHADOW = '0 0.05em 0 rgba(255, 255, 255, 0.8)'

/** "Hi Kaylee!" in big letters that drop in one by one, then bob like a wave. */
export function HiKaylee({ fontSize, style }: { fontSize: string; style?: CSSProperties }) {
  const words = ['Hi', `${KID_NAME}!`]
  let n = 0
  return (
    <h1
      aria-label={`Hi ${KID_NAME}!`}
      style={{ fontSize, fontWeight: 700, lineHeight: 1.05, color: 'var(--hotpink)', textShadow: TITLE_SHADOW, display: 'flex', flexWrap: 'wrap', columnGap: '0.28em', ...style }}
    >
      {words.map((w) => (
        <span key={w} aria-hidden style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
          {[...w].map((ch, i) => {
            const k = n++
            return (
              <motion.span
                key={i}
                initial={{ y: '-0.8em', opacity: 0, scale: 0.4 }}
                animate={{ y: ['0em', '-0.07em', '0em'], opacity: 1, scale: 1 }}
                transition={{
                  opacity: { delay: 0.15 + k * 0.06 },
                  scale: { type: 'spring', bounce: 0.6, delay: 0.15 + k * 0.06 },
                  y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut', delay: 0.9 + k * 0.12 },
                }}
                style={{ display: 'inline-block' }}
              >
                {ch}
              </motion.span>
            )
          })}
        </span>
      ))}
    </h1>
  )
}

const PILLS = {
  pink: { bg: 'var(--hotpink)', fg: '#fff', arrow: 'var(--hotpink)' },
  gold: { bg: 'var(--butter)', fg: 'var(--ink)', arrow: 'var(--ink)' },
}

/** The face of a chunky, flat pill button (put it inside a button). `arrow` adds a white ▶ circle at the end. */
export function Pill({ children, fontSize, color = 'pink', arrow = true, style }: { children: ReactNode; fontSize: string; color?: keyof typeof PILLS; arrow?: boolean; style?: CSSProperties }) {
  const p = PILLS[color]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45em',
        padding: arrow ? '0.42em 0.42em 0.42em 1.05em' : '0.42em 1.05em',
        borderRadius: 999,
        background: p.bg,
        color: p.fg,
        fontSize,
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        boxShadow: 'var(--shadow)',
        ...style,
      }}
    >
      <span>{children}</span>
      {arrow && (
        <span aria-hidden style={{ width: '1.25em', height: '1.25em', borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center' }}>
          <svg viewBox="0 0 20 20" style={{ width: '0.55em', height: '0.55em', marginLeft: '0.08em' }}>
            <path d="M4 2.5 L17 10 L4 17.5Z" fill={p.arrow} stroke={p.arrow} strokeWidth="3" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </span>
  )
}

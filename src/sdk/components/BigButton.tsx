import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { sounds } from '../sounds'

const COLORS = {
  pink: ['var(--hotpink)', '#fff'],
  lavender: ['var(--lavender-dark)', '#fff'],
  mint: ['var(--mint)', 'var(--ink)'],
  butter: ['var(--butter)', 'var(--ink)'],
  white: ['#fff', 'var(--ink)'],
  ink: ['var(--ink)', '#fff'],
} as const

export interface BigButtonProps {
  children: ReactNode
  onClick?: () => void
  color?: keyof typeof COLORS
  size?: 'md' | 'lg' | 'xl'
  style?: CSSProperties
  disabled?: boolean
  ariaLabel?: string
}

/** Chunky pill button that squishes when tapped. */
export function BigButton({ children, onClick, color = 'pink', size = 'lg', style, disabled, ariaLabel }: BigButtonProps) {
  const [bg, fg] = COLORS[color]
  const pad = { md: '14px 28px', lg: '20px 40px', xl: '26px 56px' }[size]
  const font = { md: 24, lg: 32, xl: 42 }[size]
  return (
    <motion.button
      aria-label={ariaLabel}
      disabled={disabled}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.03 }}
      onClick={() => {
        sounds.pop()
        onClick?.()
      }}
      style={{
        background: bg,
        color: fg,
        padding: pad,
        fontSize: font,
        fontWeight: 700,
        borderRadius: 999,
        minHeight: 88,
        minWidth: 88,
        boxShadow: 'var(--shadow)',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        ...style,
      }}
    >
      {children}
    </motion.button>
  )
}

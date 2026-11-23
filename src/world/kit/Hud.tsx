// The game's own controls: one round button family and the places they live, so the same job looks the same and sits
// in the same corner in every game (docs/hud.md).
//
//   top left      the shell's leave button (PlaceFrame; an activity takes it over with kit/topLeft.ts)
//   beside it     the progress pill (setProgress)
//   top right     tools she opens and closes (dress-up, the album, the games shelf)
//   bottom left   Sparkle and her bubble (kit/Guide.tsx)
//   bottom centre the end card: a small "again" and a big way on, only when a round is over (<EndCard>)
//   bottom right  the way on, done or skip
//
// The colour says the job (`role`), the picture is drawn in the game's style (`icon`, never a system emoji: they look
// different on every device and pasted on beside the drawn map button).
import { motion, type HTMLMotionProps } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { HUD_ICONS, sounds, type HudIcon } from '../../sdk'

export { HUD_ICONS, type HudIcon }

/** The job a button does, which picks its colour: leave (white), go (pink, the way on), done (mint), again
 *  (lavender), open (butter: a map, an album, the party), skip (quiet and smaller). */
export type HudRole = 'leave' | 'go' | 'done' | 'again' | 'open' | 'skip'
/** Where it sits (absolute, clear of the safe areas). */
export type HudSlot = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'

export interface HudButtonProps extends Omit<HTMLMotionProps<'button'>, 'children' | 'onClick' | 'role'> {
  role?: HudRole
  icon?: HudIcon
  /** What it does, for screen readers and the robots (`aria-label`). */
  label: string
  onClick?: () => void
  slot?: HudSlot
  /** lg: the one way on of an end card. sm: the top bar's size. */
  size?: 'sm' | 'md' | 'lg'
  /** Breathes, to say "this is the way on". One per screen. */
  pulse?: boolean
  /** false: the caller plays its own sound. */
  pop?: boolean
  style?: CSSProperties
  /** A picture of a place instead of an icon (a stop on a map), or a badge on top of the icon. */
  children?: ReactNode
}

/** A round control from the one family. */
export function HudButton({ role = 'go', icon, label, onClick, slot, size = 'md', pulse, pop = true, style, children, className, ...rest }: HudButtonProps) {
  return (
    <motion.button
      aria-label={label}
      className={`hud-btn hud-${role}${size === 'md' ? '' : ` hud-${size}`}${slot ? ` hud-at hud-${slot}` : ''}${className ? ` ${className}` : ''}`}
      initial={{ scale: 0 }}
      animate={pulse ? { scale: [1, 1.1, 1] } : { scale: 1 }}
      // The exit has its own transition: a pulse's `repeat: Infinity` would otherwise shrink it forever, and the button
      // (and the AnimatePresence it sits in) would never leave.
      exit={{ scale: 0, transition: { duration: 0.2 } }}
      transition={pulse ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' } : { type: 'spring', stiffness: 420, damping: 22 }}
      whileTap={{ scale: 0.86, y: 3 }}
      onClick={() => {
        if (pop) sounds.pop()
        onClick?.()
      }}
      style={style}
      {...rest}
    >
      {icon && HUD_ICONS[icon]}
      {children}
    </motion.button>
  )
}

/** The end of a round: a small "again" and the big way on, side by side at the bottom. */
export function EndCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <motion.div className="hud-end" initial={{ y: 160 }} animate={{ y: 0 }} exit={{ y: 160 }} transition={{ type: 'spring', stiffness: 240, damping: 18 }} style={style}>
      {children}
    </motion.div>
  )
}

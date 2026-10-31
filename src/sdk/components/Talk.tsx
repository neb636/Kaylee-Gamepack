// One look for everything that talks or labels, so every country's dialogue feels like the same app (styles in
// talk.css): a speech bubble whose tail points at whoever is talking, with their name on a tab in their color; a round
// portrait for a dialogue card; a name tag over a character; a big choice card to pick with; and CAPTION for the
// one-line "what was just said" pills. Ink outline, flat fills and a hard drop, like the art.
import { motion, type HTMLMotionProps } from 'motion/react'
import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import './talk.css'

/** Who's talking: shown on the bubble's tab or as a portrait. */
export interface Speaker {
  name: string
  /** An emoji for their face (their animal). */
  icon?: string
  /** Their color (a CSS color). */
  color?: string
}

export type TailSide = 'left' | 'right' | 'down' | 'down-right' | 'down-center' | 'none'

export type TalkBubbleProps = HTMLMotionProps<'div'> & {
  /** Their name tab on the top edge. */
  who?: Speaker | null
  /** Where the tail points (at the one talking). */
  tail?: TailSide
  size?: 'sm' | 'md' | 'lg'
  children?: ReactNode
}

/** A speech bubble (a motion.div: pass `initial`/`animate` as usual). */
export const TalkBubble = forwardRef<HTMLDivElement, TalkBubbleProps>(function TalkBubble({ who, tail = 'none', size = 'md', className, children, ...rest }, ref) {
  return (
    <motion.div ref={ref} {...rest} className={`talk-bubble${className ? ` ${className}` : ''}`} data-tail={tail} data-size={size} data-who={who ? '' : undefined}>
      {who && <WhoTab who={who} />}
      {children}
    </motion.div>
  )
})

/** The speaker's name tab (inside a `.talk-bubble`). */
export function WhoTab({ who }: { who: Speaker }) {
  return (
    <span className="talk-who" style={{ '--who': who.color } as CSSProperties}>
      {who.icon && <span className="talk-emoji" aria-hidden>{who.icon}</span>}
      {who.name}
    </span>
  )
}

/** A round portrait: their animal on their color. */
export function Avatar({ who, size = 64, wiggle = false }: { who: Speaker; size?: number; wiggle?: boolean }) {
  return (
    <motion.span
      className="talk-avatar"
      title={who.name}
      animate={wiggle ? { rotate: [0, -10, 8, 0] } : undefined}
      transition={wiggle ? { repeat: Infinity, duration: 1.8, repeatDelay: 1.2 } : undefined}
      style={{ '--who': who.color, width: size, height: size, fontSize: size * 0.54 } as CSSProperties}
    >
      {who.icon ?? '🦄'}
    </motion.span>
  )
}

/** A dialogue card: their portrait, and the bubble pointing at it with their name on top. */
export function Dialogue({ who, children, size = 'md', avatar = 64 }: { who: Speaker; children: ReactNode; size?: 'md' | 'lg'; avatar?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, maxWidth: 'min(660px, 100%)' }}>
      <Avatar who={who} size={avatar} wiggle />
      <TalkBubble key={String(children)} who={who} tail="left" size={size} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ transformOrigin: 'bottom left', minWidth: 0 }}>
        {children}
      </TalkBubble>
    </div>
  )
}

/** A name over a character (in their color when there is one). */
export function NameTag({ name, thai, color, style }: { name: string; thai?: string; color?: string; style?: CSSProperties }) {
  return (
    <span className="talk-tag" style={{ '--who': color, ...style } as CSSProperties}>
      {name}
      {thai && <small>{thai}</small>}
    </span>
  )
}

export type ChoiceCardProps = Omit<HTMLMotionProps<'button'>, 'color'> & {
  /** The picture that says it (emoji). */
  icon: ReactNode
  label: ReactNode
  /** The card's color (a CSS color). */
  color?: string
  /** Bigger icons for a two-card question; smaller when there are several. */
  big?: boolean
}

/** A big chunky card to pick with: the picture on a light plate, the word under it, pressed in like a real button. */
export function ChoiceCard({ icon, label, color, big = true, style, ...rest }: ChoiceCardProps) {
  return (
    <motion.button
      {...rest}
      className="talk-choice"
      style={{
        '--c': color,
        minWidth: big ? 'min(200px, 40vw)' : 'min(170px, 27vw)',
        minHeight: 'max(88px, min(160px, 22vh))',
        ...style,
      } as CSSProperties}
    >
      <span className="talk-choice-icon" aria-hidden style={{ fontSize: big ? 'clamp(40px, min(8vw, 8vh), 64px)' : 'clamp(34px, min(6.5vw, 7vh), 54px)' }}>
        {icon}
      </span>
      <span className="talk-choice-label" style={{ fontSize: 'clamp(20px, min(3vw, 3.4vh), 28px)' }}>
        {label}
      </span>
    </motion.button>
  )
}

/** The "what was just said" pill at the bottom of a scene (spread it into a style; `className="talk-bubble"` not needed). */
export const CAPTION = {
  background: '#fff',
  color: 'var(--ink)',
  border: 'var(--talk-edge, 3px) solid var(--talk-line, var(--ink))',
  borderRadius: 999,
  padding: '7px 20px 8px',
  fontFamily: 'inherit',
  fontSize: 'clamp(16px, 2.4vmin, 22px)',
  fontWeight: 600,
  lineHeight: 1.2,
  boxShadow: 'var(--talk-drop, 0 5px 0 rgba(43,35,48,.18))',
  textAlign: 'center' as const,
  maxWidth: '100%',
}

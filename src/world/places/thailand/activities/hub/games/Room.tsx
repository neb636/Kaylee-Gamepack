// The frame every house mini game sits in: a flat room (not 3D) over the house, the family member she's playing with
// on one side (left in landscape, on top in portrait) with a speech bubble, the game beside them, and a big ✕ to go
// back to the house. Their bubble shows each line for Dad; `talk` only speaks lines that already have a clip (lines.ts).
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { lineText, say, sounds, useLandscape, type Line } from '../../../../../../sdk'

/** Show a line in the bubble; a `Line` with a clip (VOICED) is also spoken. A plain `{ text }` is only shown. */
export function useBubble() {
  const [text, setText] = useState('')
  const hide = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(hide.current), [])
  const talk = useCallback((line: Line | { show: string }) => {
    clearTimeout(hide.current)
    if (typeof line === 'object' && 'show' in line) {
      setText(line.show)
      hide.current = setTimeout(() => setText(''), 3200)
      return
    }
    setText(lineText(line))
    void say(line).then(() => (hide.current = setTimeout(() => setText(''), 1800)))
  }, [])
  return { text, talk }
}

interface Props {
  name: string
  /** The puppet (sized to fill its box). */
  host: ReactNode
  bubble: string
  /** Wall and floor colors. */
  wall: string
  floor: string
  onClose(): void
  children: ReactNode
}

export function Room({ name, host, bubble, wall, floor, onClose, children }: Props) {
  const landscape = useLandscape()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      style={{ position: 'absolute', inset: 0, zIndex: 40, background: `linear-gradient(${wall} 0 62%, ${floor} 62% 100%)`, display: 'flex', flexDirection: landscape ? 'row' : 'column', padding: 'var(--top-clear) calc(var(--safe-right, 0px) + 16px) calc(var(--safe-bottom) + 14px) calc(var(--safe-left, 0px) + 16px)', gap: 12, overflow: 'hidden', touchAction: 'none' }}
    >
      <div style={{ flex: landscape ? '0 0 32%' : '0 0 31%', minHeight: 0, minWidth: 0, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{ width: '100%', height: '100%' }}>{host}</div>
        <AnimatePresence>
          {bubble && (
            <motion.div
              key={bubble}
              aria-label={`${name} says`}
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ position: 'absolute', top: landscape ? '2%' : 0, ...(landscape ? { left: '4%', right: '4%' } : { right: 0, maxWidth: '48%' }), background: 'rgba(255,255,255,.96)', borderRadius: 22, padding: '10px 16px', boxShadow: 'var(--shadow)', fontWeight: 700, fontSize: 'clamp(17px, min(2.6vw, 3vh), 26px)', lineHeight: 1.15, textAlign: 'center', zIndex: 2 }}
            >
              <small style={{ display: 'block', fontSize: '0.6em', opacity: 0.55 }}>{name}</small>
              {bubble}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ flex: 1, minHeight: 0, minWidth: 0, position: 'relative' }}>{children}</div>
      <motion.button
        aria-label="Back to the house"
        whileTap={{ scale: 0.88 }}
        onClick={() => {
          sounds.pop()
          onClose()
        }}
        style={{ position: 'absolute', top: 'calc(var(--safe-top) + 12px)', right: 'calc(var(--safe-right, 0px) + 14px)', width: 'var(--target)', height: 'var(--target)', borderRadius: '50%', border: '4px solid #fff', background: 'var(--lavender)', color: 'var(--ink)', fontSize: 40, fontWeight: 700, boxShadow: 'var(--shadow)', zIndex: 5, display: 'grid', placeItems: 'center' }}
      >
        ✕
      </motion.button>
    </motion.div>
  )
}

/** A chunky round button with an emoji (UI chip, not an object in the scene). */
export function RoundButton({ label, icon, onClick, color = 'var(--butter)', size = 'var(--target)', active = false, pulse = false }: { label: string; icon: ReactNode; onClick(): void; color?: string; size?: string; active?: boolean; pulse?: boolean }) {
  return (
    <motion.button
      aria-label={label}
      whileTap={{ scale: 0.85 }}
      animate={pulse ? { scale: [1, 1.1, 1] } : { scale: 1 }}
      transition={pulse ? { repeat: Infinity, duration: 1.2 } : undefined}
      onClick={onClick}
      style={{ width: size, height: size, flexShrink: 0, borderRadius: '50%', border: active ? '5px solid var(--hotpink)' : '4px solid #fff', background: color, boxShadow: 'var(--shadow)', fontSize: `calc(${size} * 0.45)`, display: 'grid', placeItems: 'center', padding: 0, color: 'var(--ink)' }}
    >
      {icon}
    </motion.button>
  )
}

// What someone on the trip says, as a speech bubble with who's talking (greybox: text only, so Dad can read along;
// the voices come with the full loop and these move to lines.ts).
import { AnimatePresence, motion } from 'motion/react'
import type { Said, Who } from '../talk'

const WHO: Record<Who, { name: string; icon: string; color: string }> = {
  sparkle: { name: 'Sparkle', icon: '🦄', color: '#FFB3D6' },
  ji: { name: 'Mommy', icon: '🦄', color: '#FF8FB8' },
  nick: { name: 'Daddy', icon: '🦄', color: '#7FD1B9' },
  agong: { name: 'Agong', icon: '🐼', color: '#B9A6F5' },
  jum: { name: 'Jum', icon: '🐘', color: '#FFB3CF' },
  gan: { name: 'Gan', icon: '🦊', color: '#7CC4F2' },
  ken: { name: 'Ken', icon: '🦊', color: '#8FE3C8' },
  bb: { name: 'BB', icon: '🐃', color: '#FFB3D6' },
  sri: { name: 'Aunty Sri', icon: '🐦', color: '#FFC83D' },
  officer: { name: 'Officer', icon: '🐘', color: '#A8B4E8' },
}

export function Bubble({ said }: { said: (Said & { n: number }) | null }) {
  return (
    <div aria-live="polite" style={{ position: 'absolute', left: 'calc(var(--safe-left, 0px) + 12px)', right: 130, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', zIndex: 45, pointerEvents: 'none' }}>
      <AnimatePresence>
        {said && (
          <motion.div
            key={said.n}
            initial={{ opacity: 0, y: 14, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 560, background: 'rgba(255,255,255,0.96)', borderRadius: 'var(--radius)', padding: '8px 16px 8px 8px', boxShadow: 'var(--shadow)', transformOrigin: 'bottom left' }}
          >
            <span style={{ flexShrink: 0, display: 'grid', placeItems: 'center', minWidth: 54, height: 54, borderRadius: 27, background: WHO[said.who].color, fontSize: 28, border: '3px solid #fff' }} title={WHO[said.who].name}>
              {WHO[said.who].icon}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <small style={{ fontWeight: 700, opacity: 0.6, fontSize: 14 }}>{WHO[said.who].name}</small>
              <span style={{ fontWeight: 600, fontSize: 'clamp(17px, min(3vw, 3.4vh), 26px)' }}>{said.text}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

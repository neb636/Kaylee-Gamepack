import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { sounds } from '../../sdk'

/** Round back button + optional extras, floating over the top-left like the game shell's 🏠 bar. */
export function TopBar({ icon, label, onBack, children }: { icon: string; label: string; onBack: () => void; children?: ReactNode }) {
  return (
    <div style={{ position: 'absolute', top: 'calc(var(--safe-top) + 12px)', left: 16, right: 16, display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)', pointerEvents: 'none', zIndex: 50 }}>
      <motion.button
        aria-label={label}
        whileTap={{ scale: 0.85 }}
        onClick={() => {
          sounds.pop()
          onBack()
        }}
        style={{ pointerEvents: 'auto', flex: '0 0 var(--btn)', width: 'var(--btn)', height: 'var(--btn)', borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow)', fontSize: 'calc(var(--btn) * 0.5)', display: 'grid', placeItems: 'center' }}
      >
        {icon}
      </motion.button>
      {children}
    </div>
  )
}

/** A pill that sits in the top bar (stamp counts, titles). */
export function BarPill({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 999, padding: '6px clamp(10px, 2vw, 20px)', boxShadow: 'var(--shadow)', fontSize: 'clamp(20px, min(3.4vw, 5vh), 32px)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', ...style }}>
      {children}
    </div>
  )
}

/**
 * Keeps a picture's aspect ratio while filling as much of the free space as it can,
 * so % positions on it (map pins, hotspots) always line up with the art.
 */
export function FitBox({ ratio, children, style }: { ratio: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ flex: 1, alignSelf: 'stretch', minWidth: 0, minHeight: 0, containerType: 'size', display: 'grid', placeItems: 'center', ...style }}>
      <div style={{ position: 'relative', width: `min(100cqw, calc(100cqh * ${ratio}))`, aspectRatio: String(ratio) }}>{children}</div>
    </div>
  )
}

// The gas pedal, for driving the longtail by tilting the phone (tilt.ts): the boat race and the whole bay on an iPhone.
// A big green button bottom left (beside Sparkle, under her left thumb). Held down = full speed; it stays held if her
// thumb slides off it, until it lifts. A finger bounces on it when she hasn't pressed it for a while. On a computer,
// the space bar is the pedal.
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

/** The gas pedal (tilting to steer): held down, full speed. A finger bounces on it when it hasn't been pressed for
 *  `nudgeAfter` seconds (`eager`: before GO in the race, at once). */
export function GasPedal({ onGas, eager = false, nudgeAfter = 4 }: { onGas: (down: boolean) => void; eager?: boolean; nudgeAfter?: number }) {
  const [down, setDown] = useState(false)
  const held = useRef(false)
  const set = (d: boolean) => {
    if (held.current === d) return
    held.current = d
    setDown(d)
    onGas(d)
  }
  // Let go when it goes away (and if the app loses focus mid-press).
  useEffect(() => {
    const up = () => set(false)
    // A computer: the space bar.
    const key = (e: KeyboardEvent) => {
      if (e.key !== ' ') return
      e.preventDefault()
      if (!e.repeat) set(e.type === 'keydown')
    }
    addEventListener('blur', up)
    addEventListener('keydown', key)
    addEventListener('keyup', key)
    return () => {
      removeEventListener('blur', up)
      removeEventListener('keydown', key)
      removeEventListener('keyup', key)
      if (held.current) {
        held.current = false
        onGas(false)
      }
    }
  }, [])
  // Not pressed for a while (at once before GO): a finger bounces on it.
  const [nudge, setNudge] = useState(false)
  useEffect(() => {
    setNudge(false)
    if (down) return
    const t = setTimeout(() => setNudge(true), eager ? 600 : nudgeAfter * 1000)
    return () => clearTimeout(t)
  }, [down, eager, nudgeAfter])
  return (
    <div style={{ position: 'absolute', left: 'calc(var(--safe-left, 0px) + min(120px, 16vh, 24vw) + 18px)', bottom: 'calc(var(--safe-bottom) + 18px)', zIndex: 34 }}>
      <motion.button
        aria-label="Gas"
        aria-pressed={down}
        animate={{ scale: down ? 0.92 : 1, y: down ? 6 : 0 }}
        transition={{ type: 'spring', stiffness: 600, damping: 22 }}
        onPointerDown={(e) => {
          e.stopPropagation()
          e.preventDefault()
          // Held even if her thumb slides off it, until it lifts.
          e.currentTarget.setPointerCapture?.(e.pointerId)
          set(true)
        }}
        onPointerUp={() => set(false)}
        onPointerCancel={() => set(false)}
        onLostPointerCapture={() => set(false)}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          width: 'clamp(104px, 17vmin, 140px)',
          height: 'clamp(124px, 21vmin, 168px)',
          borderRadius: 30,
          border: '6px solid #fff',
          background: down ? 'linear-gradient(180deg, #7DF09A, #3CC968)' : 'linear-gradient(180deg, #A8F2BC, #5BE37A)',
          boxShadow: down ? '0 0 0 6px rgba(91,227,122,.55), 0 0 30px 10px rgba(91,227,122,.5)' : '0 8px 0 rgba(43,35,48,.22), var(--shadow)',
          display: 'grid',
          placeItems: 'center',
          padding: 0,
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
      >
        {/* Three arrows pointing on ahead (they run up the pedal while it's down). */}
        <svg viewBox="0 0 60 90" style={{ width: '58%', height: 'auto', overflow: 'visible' }} aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.path
              key={i}
              d={`M 8 ${66 - i * 24} L 30 ${46 - i * 24} L 52 ${66 - i * 24}`}
              fill="none"
              stroke="#fff"
              strokeWidth={11}
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={down ? { opacity: [0.35, 1, 0.35] } : { opacity: 0.55 + i * 0.2 }}
              transition={down ? { repeat: Infinity, duration: 0.5, delay: (2 - i) * 0.12 } : { duration: 0.2 }}
              style={{ filter: 'drop-shadow(0 2px 0 rgba(43,35,48,.35))' }}
            />
          ))}
        </svg>
      </motion.button>
      {nudge && (
        <motion.div aria-hidden animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 0.9 }} style={{ position: 'absolute', right: -30, bottom: -18, fontSize: 'clamp(44px, 8vmin, 56px)', pointerEvents: 'none' }}>
          👆
        </motion.div>
      )}
    </div>
  )
}

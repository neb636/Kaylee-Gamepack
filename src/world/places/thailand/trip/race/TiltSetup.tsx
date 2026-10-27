// Before the boat race on a phone (tilt.ts): pictures, no reading needed (a short line under each is for Dad).
// - "turn": the phone held upright: a phone turning onto its side, over and over. (A small ▶ after a moment plays
//   it upright anyway, for a phone whose rotation is locked.) The race waits.
// - "ask": iOS needs a tap before the game can feel the tilt: a big button with a phone rocking like a steering wheel.
//   Tapping it asks (the iPhone's own "allow motion" box comes up the first time).
// Also the little rocking phone shown during the countdown (RaceLayer.tsx), and the phone picture they share.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

/** A phone in the app's flat style (ink outline, pastel screen, a little pink longtail on it), lying on its side. */
export function PhoneIcon({ size }: { size: string }) {
  return (
    <svg viewBox="0 0 200 120" style={{ width: size, height: 'auto', display: 'block', overflow: 'visible' }} aria-hidden>
      <rect x="6" y="6" width="188" height="108" rx="22" fill="#FFFFFF" stroke="var(--ink)" strokeWidth="5" />
      <rect x="24" y="18" width="152" height="84" rx="10" fill="#A8DCFF" stroke="var(--ink)" strokeWidth="4" />
      <path d="M24 74 Q62 64 100 74 T176 74 V92 Q176 102 166 102 H34 Q24 102 24 92 Z" fill="#78D4C1" />
      <path d="M72 66 H128 L118 80 H82 Z" fill="var(--hotpink)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M112 66 V50" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="186" cy="60" r="3.5" fill="var(--ink)" opacity="0.35" />
    </svg>
  )
}

// (It fades out under the top bar and lets taps through but for its own buttons, so the way out stays clear.)
const fade = 'linear-gradient(to bottom, transparent calc(var(--bar-clear) - 28px), #000 calc(var(--bar-clear) + 24px))'
const veil = { position: 'absolute', inset: 0, zIndex: 58, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(14px, 3vmin, 26px)', background: 'rgba(255, 244, 250, 0.9)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', maskImage: fade, WebkitMaskImage: fade, pointerEvents: 'none' } as const
const forDad = { background: 'rgba(255,255,255,.95)', borderRadius: 999, padding: '6px 18px', boxShadow: 'var(--shadow)', color: 'var(--ink)', fontWeight: 600, fontSize: 'clamp(16px, 2.6vmin, 22px)' } as const

export function TiltSetup({ stage, onAsk, onSkip }: { stage: 'turn' | 'ask' | null; onAsk: () => void; onSkip: () => void }) {
  return <AnimatePresence>{stage && (stage === 'turn' ? <TurnIt key="turn" onSkip={onSkip} /> : <AskIt key="ask" onAsk={onAsk} />)}</AnimatePresence>
}

function TurnIt({ onSkip }: { onSkip: () => void }) {
  const [skip, setSkip] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSkip(true), 3000)
    return () => clearTimeout(t)
  }, [])
  return (
    <motion.div aria-label="Turn the phone sideways" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={veil}>
      <div style={{ position: 'relative', width: 'min(52vw, 260px)', aspectRatio: '1', display: 'grid', placeItems: 'center' }}>
        {/* The turning arrow round it. */}
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
          <path d="M 80 22 A 42 42 0 0 0 14 38" fill="none" stroke="var(--hotpink)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 6 32 L 13 45 L 24 35" fill="none" stroke="var(--hotpink)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <motion.div
          initial={{ rotate: 90 }}
          animate={{ rotate: [90, 90, 0, 0] }}
          transition={{ duration: 2.4, times: [0, 0.25, 0.6, 1], repeat: Infinity, ease: 'easeInOut' }}
        >
          <PhoneIcon size="min(36vw, 180px)" />
        </motion.div>
      </div>
      <div style={forDad}>Turn the phone sideways</div>
      <AnimatePresence>
        {skip && (
          <motion.button
            aria-label="Play upright"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.88 }}
            onClick={onSkip}
            style={{ pointerEvents: 'auto', position: 'absolute', right: 'calc(var(--safe-right, 0px) + 18px)', bottom: 'calc(var(--safe-bottom) + 18px)', width: 72, height: 72, borderRadius: '50%', border: '4px solid #fff', background: 'var(--lavender)', color: 'var(--ink)', fontSize: 30, boxShadow: 'var(--shadow)', padding: 0 }}
          >
            ▶
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function AskIt({ onAsk }: { onAsk: () => void }) {
  return (
    <motion.div aria-label="Tilt to steer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={veil}>
      <div style={{ position: 'relative' }}>
        <motion.button
          aria-label="Steer by tilting"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 1.3 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAsk}
          style={{ pointerEvents: 'auto', width: 'clamp(170px, 42vmin, 260px)', height: 'clamp(170px, 42vmin, 260px)', borderRadius: '50%', border: '7px solid #fff', background: 'var(--pink)', boxShadow: '0 0 0 8px rgba(255,79,154,.35), var(--shadow)', display: 'grid', placeItems: 'center', padding: 0 }}
        >
          <TiltingPhone size="clamp(110px, 27vmin, 170px)" />
        </motion.button>
        <motion.div aria-hidden animate={{ y: [0, -14, 0] }} transition={{ repeat: Infinity, duration: 0.9 }} style={{ position: 'absolute', right: -18, bottom: -26, fontSize: 'clamp(44px, 9vmin, 64px)', pointerEvents: 'none' }}>
          👆
        </motion.div>
      </div>
      <div style={forDad}>Tap, then tilt the phone to steer</div>
    </motion.div>
  )
}

/** The phone rocking side to side like a steering wheel. */
export function TiltingPhone({ size }: { size: string }) {
  return (
    <motion.div animate={{ rotate: [-16, 16, -16] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
      <PhoneIcon size={size} />
    </motion.div>
  )
}

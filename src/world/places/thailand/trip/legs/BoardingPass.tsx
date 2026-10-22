// Between the legs of a trip a boarding pass slides up, a hole is punched for the leg she just finished (ka-chunk),
// and it slides away: 1.5 s, and it hides the next scene being built. When she says yes to Mommy with a trip half done,
// or after her first whole trip, it asks where to start with big icons (no words needed): 🧳 the whole trip again, the
// next leg's icon to keep going, 🚤 straight to the boat.
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { KID_NAME } from '../../../../../sdk'
import { sfx } from '../../sfx'

export interface PassLeg {
  id: string
  icon: string
  label: string
}

interface Props {
  legs: PassLeg[]
  /** Legs already punched, and the one being punched now. */
  done: string[]
  punch: string | null
  /** Where to start: big icons (the first is 🧳, a new trip). */
  choices?: PassChoice[]
  /** Another trip's ticket (the mall day's day pass): its name, its icons and its route. */
  title?: string
  badge?: string
  route?: string
}

export interface PassChoice {
  label: string
  icon: string
  on: () => void
}

export function BoardingPass({ legs, done, punch, choices, title = 'BOARDING PASS', badge = '✈️ 🐘', route = 'BKK → KBV · 1A 🪟' }: Props) {
  useEffect(() => {
    if (!punch) return
    const t = setTimeout(() => sfx.stamp(), 420)
    return () => clearTimeout(t)
  }, [punch])
  return (
    <motion.div
      key="pass"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(255, 214, 232, 0.94)', display: 'grid', placeItems: 'center', padding: '16px' }}
    >
      <motion.div
        role="img"
        aria-label={title === 'BOARDING PASS' ? 'Boarding pass' : title.toLowerCase().replace(/^./, (c) => c.toUpperCase())}
        initial={{ y: '60vh', rotate: -4 }}
        animate={{ y: 0, rotate: -2 }}
        exit={{ y: '-60vh', rotate: 2 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{ width: 'min(620px, 92vw)', background: '#FFFFFF', borderRadius: 26, boxShadow: 'var(--shadow)', border: '4px solid var(--ink)', overflow: 'hidden' }}
      >
        <div style={{ background: 'var(--hotpink)', color: '#fff', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 'clamp(16px, 2.6vw, 22px)' }}>
          <span>{title}</span>
          <span>{badge}</span>
        </div>
        <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, color: 'var(--ink)' }}>
          <span style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 700, letterSpacing: 1 }}>{KID_NAME.toUpperCase()}</span>
          <span style={{ fontSize: 'clamp(16px, 3vw, 24px)', fontWeight: 600 }}>{route}</span>
        </div>
        <div style={{ borderTop: '3px dashed var(--lavender-dark)', margin: '10px 0 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '14px 10px 16px', gap: 6 }}>
          {legs.map((l) => {
            const punched = done.includes(l.id)
            const now = punch === l.id
            return (
              <div key={l.id} aria-label={`${l.label}${punched || now ? ' (done)' : ''}`} style={{ position: 'relative', width: 'clamp(46px, 11vw, 78px)', height: 'clamp(46px, 11vw, 78px)', borderRadius: '50%', background: 'var(--cream)', border: '3px solid var(--lavender)', display: 'grid', placeItems: 'center', fontSize: 'clamp(22px, 5vw, 38px)' }}>
                <span style={{ opacity: punched ? 0.55 : 1 }}>{l.icon}</span>
                {(punched || now) && (
                  <motion.span
                    initial={now ? { scale: 0 } : false}
                    animate={{ scale: 1 }}
                    transition={{ delay: now ? 0.4 : 0, type: 'spring', stiffness: 500, damping: 14 }}
                    style={{ position: 'absolute', right: '-4%', top: '-4%', width: '36%', height: '36%', borderRadius: '50%', background: 'rgba(255, 214, 232, 1)', border: '3px solid var(--ink)', boxShadow: 'inset 0 3px 0 rgba(43,35,48,.25)' }}
                  />
                )}
              </div>
            )
          })}
        </div>
        {choices && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(12px, 3vw, 22px)', padding: '4px 16px 20px' }}>
            {choices.map((b, i) => (
              <motion.button
                key={b.label}
                aria-label={b.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25 + i * 0.12, type: 'spring', stiffness: 400, damping: 14 }}
                whileTap={{ scale: 0.9 }}
                onClick={b.on}
                style={{ width: 'clamp(88px, 18vw, 110px)', height: 'clamp(88px, 18vw, 110px)', borderRadius: '50%', border: '5px solid #fff', background: i === 0 ? 'var(--lavender)' : b.icon === '🚤' ? 'var(--mint)' : 'var(--butter)', fontSize: 'clamp(44px, 9vw, 54px)', boxShadow: 'var(--shadow)' }}
              >
                {b.icon}
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}


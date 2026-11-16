// A small "start over" pill for the story places that remember where she left off (Koh Samet's Lost Fireflies, the
// Poles' Pebble's Long Way Home). It shows only when a visit picks a story back up, sits quietly at the top center
// (Sparkle has the bottom-left corner) for ten seconds (a thin bar runs down so you can see it's going), then fades
// away. Starting over takes a press-and-hold (a ring fills round the arrow), so a stray tap in the middle of play never
// wipes her progress; a quick tap only wiggles it. No voice: it's for the grown-up, and a line every visit would be the talk she skips.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { onDevice, sounds } from '../../sdk'

/** How long the pill stays up when a story is picked back up. */
export const START_OVER_SHOW_MS = 10_000
/** How long a press must last to start over. */
export const START_OVER_HOLD_MS = 1_000

const HINT = onDevice('Hold to start over', 'Click and hold to start over')

export function StartOver({ onRestart, label = 'Start the story again' }: { onRestart: () => void; label?: string }) {
  const [shown, setShown] = useState(true)
  const [holding, setHolding] = useState(false)
  const [wiggle, setWiggle] = useState(0)
  const timeUp = useRef(false)
  const holdTimer = useRef<number>(0)
  const done = useRef(false)
  const held = useRef(false)

  // Up for ten seconds; if a finger is on it when the time runs out, it waits for the finger to lift.
  useEffect(() => {
    const t = window.setTimeout(() => {
      timeUp.current = true
      if (!held.current) setShown(false)
    }, START_OVER_SHOW_MS)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(holdTimer.current)
    }
  }, [])

  const restart = () => {
    if (done.current) return
    done.current = true
    sounds.whoosh()
    setShown(false)
    onRestart()
  }
  const press = () => {
    // (A second finger on it while one is already holding changes nothing: one hold, one timer.)
    if (done.current || held.current) return
    sounds.pickup()
    held.current = true
    setHolding(true)
    holdTimer.current = window.setTimeout(restart, START_OVER_HOLD_MS)
  }
  const release = (tooSoon: boolean) => {
    if (!held.current || done.current) return
    held.current = false
    window.clearTimeout(holdTimer.current)
    setHolding(false)
    if (tooSoon) setWiggle((w) => w + 1)
    if (timeUp.current) setShown(false)
  }

  const R = 21
  // (A narrow phone's top bar fills its width: the pill sits just under it.)
  const css = `@media (max-width: 620px) { .start-over { top: calc(var(--safe-top, 0px) + var(--btn) + 22px) !important; } }`
  const C = 2 * Math.PI * R
  return (
    <>
      <style>{css}</style>
      <AnimatePresence>
        {shown && (
          <motion.button
            key="start-over"
            data-testid="start-over"
            className="start-over"
            aria-label={label}
            title={HINT}
            initial={{ opacity: 0, y: -16 }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: wiggle ? [0, -6, 6, -3, 0] : 0,
              scale: holding ? 0.94 : 1,
            }}
            exit={{ opacity: 0, y: -16, transition: { duration: 0.4 } }}
            transition={{ delay: wiggle || holding ? 0 : 0.8, duration: 0.35 }}
            onPointerDown={(e) => {
              e.stopPropagation()
              e.currentTarget.setPointerCapture?.(e.pointerId)
              press()
            }}
            onPointerUp={(e) => {
              e.stopPropagation()
              release(true)
            }}
            onPointerCancel={() => release(false)}
            onLostPointerCapture={() => release(false)}
            // A keyboard's Enter or Space (no pointer) starts over at once.
            onClick={(e) => {
              e.stopPropagation()
              if (e.detail === 0) restart()
            }}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              position: 'absolute',
              // Top center, level with the top bar's buttons (below them on a narrow phone: the CSS below).
              top: 'calc(var(--safe-top, 0px) + 12px + (var(--btn) - 64px) / 2)',
              left: 0,
              right: 0,
              width: 'max-content',
              marginInline: 'auto',
              zIndex: 55,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              minHeight: 64,
              padding: '6px 18px 6px 6px',
              border: 'none',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.86)',
              boxShadow: 'var(--shadow)',
              color: '#6B5A7A',
              font: 'inherit',
              fontWeight: 700,
              fontSize: 'clamp(15px, 2.2vmin, 19px)',
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                position: 'relative',
                width: 52,
                height: 52,
                flex: '0 0 52px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                background: '#FFE3F0',
              }}
            >
              <svg
                viewBox="0 0 52 52"
                width={52}
                height={52}
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: 'rotate(-90deg)',
                }}
              >
                <circle
                  cx={26}
                  cy={26}
                  r={R}
                  fill="none"
                  stroke="var(--hotpink)"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={holding ? 0 : C}
                  style={{
                    transition: holding ? `stroke-dashoffset ${START_OVER_HOLD_MS}ms linear` : 'stroke-dashoffset 200ms ease-out',
                  }}
                />
              </svg>
              {/* A circular arrow: round and back to the start. */}
              <svg
                viewBox="0 0 24 24"
                width={26}
                height={26}
                aria-hidden
                fill="none"
                stroke="var(--hotpink)"
                strokeWidth={2.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" />
                <path d="M4 3.5v4.4h4.4" />
              </svg>
            </span>
            <span style={{ whiteSpace: 'nowrap' }}>{HINT}</span>
            {/* The ten seconds running out. */}
            <motion.span
              aria-hidden
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{
                duration: START_OVER_SHOW_MS / 1000 - 0.8,
                delay: 0.8,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 3,
                background: 'var(--pink)',
                opacity: 0.6,
                transformOrigin: 'left',
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

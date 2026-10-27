// HarborLand's map: the hall is a long walk, and the games at its far end (Little Land, the Golden Mountain, Muay Thai,
// the Sky Pod) are off the screen until she walks past the racing slide, so Kaylee and Dad missed them. A big 🗺️
// button in the corner opens a card with every mini game as a big picture, in the order they stand along the hall:
// the ones she's played wear a gold star, the rest wiggle, and a 🦄 shows where she is. Tap one and she goes there and
// in (hall.ts `travel`). When she's stuck and every new game is off the screen, the button bounces with a finger
// (`nudge`) and Sparkle says to tap it. Sparkle asks "Where shall we play?" as it opens (lines.ts `L.mall.hall.map`).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { sounds, useLandscape } from '../../../../../../sdk'
import { L } from '../../../lines'
import { mallVoice } from '../voice'
import { GAMES, type DoorId, type GameDoor } from './layout'

/** Times the map has opened by itself (coming back out of a mini game) this time in the mall. */
let autoOpens = 0

interface Props {
  open: boolean
  /** The ways in she's been through (their stops wear a star). */
  done: GameDoor[]
  /** The stop nearest her now (the 🦄). */
  here: GameDoor | null
  /** The way in she's just come back out of: its star pops on as the map opens. */
  fresh: DoorId | null
  /** She's stuck with every new game off the screen: the button bounces with a finger. */
  nudge: boolean
  /** Hidden while Mommy's card is up or she's going in somewhere. */
  hidden: boolean
  onOpen(open: boolean): void
  onPick(door: GameDoor): void
}

export function HallMap({ open, done, here, fresh, nudge, hidden, onOpen, onPick }: Props) {
  const landscape = useLandscape()
  // The button's badge cycles through the games she hasn't played yet (so it isn't the top bar's 🗺️, and says "more!").
  const left = GAMES.filter((g) => !done.includes(g.id))
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1600)
    return () => clearInterval(t)
  }, [])
  const badge = left.length ? left[tick % left.length] : null
  // Sparkle asks where to when it opens; opening by itself after a mini game, only the first time this trip (then the
  // star popping on says it).
  useEffect(() => {
    if (!open || (fresh && autoOpens++ > 0)) return
    mallVoice.say(L.mall.hall.map)
  }, [open])
  // The new star's twinkle.
  useEffect(() => {
    if (!open || !fresh || !(done as string[]).includes(fresh)) return
    const t = setTimeout(() => sounds.sparkle(), 700)
    return () => clearTimeout(t)
  }, [open])
  const tile = landscape ? 'clamp(88px, min(15vw, 24vh), 150px)' : 'clamp(88px, min(25vw, 15vh), 170px)'
  return (
    <>
      <AnimatePresence>
        {!hidden && !open && (
          <motion.button
            key="map-button"
            aria-label="HarborLand map"
            initial={{ scale: 0 }}
            animate={nudge ? { scale: [1, 1.18, 1], rotate: [0, -8, 8, 0] } : { scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={nudge ? { repeat: Infinity, duration: 0.9 } : { type: 'spring' }}
            whileTap={{ scale: 0.86 }}
            onClick={() => {
              sounds.pop()
              onOpen(true)
            }}
            style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 14px)', bottom: 'calc(var(--safe-bottom, 0px) + 14px)', width: 'clamp(88px, 13vmin, 112px)', height: 'clamp(88px, 13vmin, 112px)', borderRadius: '50%', border: '5px solid #fff', background: 'var(--butter)', boxShadow: nudge ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : 'var(--shadow)', fontSize: 'clamp(44px, 7vmin, 58px)', padding: 0, zIndex: 45 }}
          >
            🗺️
            {badge && (
              <span aria-hidden style={{ position: 'absolute', right: -8, top: -8, width: 'clamp(40px, 6vmin, 50px)', height: 'clamp(40px, 6vmin, 50px)', borderRadius: '50%', background: badge.color, border: '3px solid #fff', boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                <AnimatePresence mode="popLayout">
                  <motion.span key={badge.id} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ fontSize: 'clamp(22px, 3.4vmin, 28px)', lineHeight: 1 }}>
                    {badge.icon}
                  </motion.span>
                </AnimatePresence>
              </span>
            )}
            {nudge && (
              <motion.span aria-hidden animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} style={{ position: 'absolute', left: '-38%', top: '-55%', fontSize: 'clamp(44px, 6.5vmin, 64px)', pointerEvents: 'none', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
                👇
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              sounds.pop()
              onOpen(false)
            }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(46,39,72,.55)', display: 'grid', placeItems: 'center', padding: 'calc(var(--top-clear, 104px) - 20px) 16px calc(var(--safe-bottom, 0px) + 12px)', zIndex: 55 }}
          >
            <motion.div
              role="dialog"
              aria-label="HarborLand map"
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', overflow: 'auto', background: '#FFF7F0', border: '6px solid #fff', borderRadius: 36, boxShadow: 'var(--shadow)', padding: 'clamp(12px, 2.4vmin, 24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(8px, 1.6vmin, 16px)' }}
            >
              <div style={{ fontWeight: 700, fontSize: 'clamp(20px, 3.4vmin, 30px)', color: 'var(--lavender-dark)' }}>🗺️ HarborLand</div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${landscape ? 5 : 3}, ${tile})`, gap: 'clamp(8px, 1.8vmin, 18px)' }}>
                {GAMES.map((g, i) => {
                  const played = done.includes(g.id)
                  return (
                    <motion.button
                      key={g.id}
                      aria-label={g.name}
                      initial={{ scale: 0 }}
                      animate={played ? { scale: 1 } : { scale: 1, rotate: [0, -5, 5, 0] }}
                      transition={played ? { type: 'spring', delay: i * 0.03 } : { scale: { type: 'spring', delay: i * 0.03 }, rotate: { repeat: Infinity, duration: 1.4, repeatDelay: 1.2, delay: (i % 4) * 0.35 } }}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => {
                        sounds.sparkle()
                        onPick(g.id)
                      }}
                      style={{ position: 'relative', width: tile, height: tile, borderRadius: 28, border: played ? '5px solid var(--gold)' : '5px solid #fff', background: g.color, boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: 4, color: 'var(--ink)' }}
                    >
                      <span aria-hidden style={{ fontSize: `calc(${tile} * 0.42)`, lineHeight: 1 }}>
                        {g.icon}
                      </span>
                      <span style={{ fontSize: 'clamp(11px, calc(' + tile + ' * 0.12), 17px)', fontWeight: 700, lineHeight: 1.05, textAlign: 'center' }}>{g.name}</span>
                      {played && (
                        <motion.span
                          aria-hidden
                          initial={fresh === g.id ? { scale: 0, rotate: -90 } : false}
                          animate={fresh === g.id ? { scale: [0, 1.7, 1], rotate: 0 } : undefined}
                          transition={{ delay: 0.5, duration: 0.6 }}
                          style={{ position: 'absolute', right: -10, top: -12, fontSize: 'clamp(26px, calc(' + tile + ' * 0.26), 40px)' }}
                        >
                          ⭐
                        </motion.span>
                      )}
                      {here === g.id && (
                        <motion.span aria-hidden animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1 }} style={{ position: 'absolute', left: -10, top: -14, fontSize: 'clamp(26px, calc(' + tile + ' * 0.26), 40px)' }}>
                          🦄
                        </motion.span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

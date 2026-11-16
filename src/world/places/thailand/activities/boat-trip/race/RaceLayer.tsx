// What the boat race shows over the 3D lagoon (race.ts sends its state as RaceHud), all pictures and big numbers so
// nothing needs reading (the races' shared pieces are trip/race/RaceHud.tsx):
// - The countdown: three lights and a giant 3, 2, 1, GO!
// - Her place (a medal with 1st / 2nd / 3rd) and everyone's faces in order, the lap (🏁 2/3) and her coins, and a
//   minimap of the course with the three boats on it (race.ts moves the dots).
// - Banners sweeping across: lap 2, the last lap, 1st!
// - The podium: the trophy with the trophy title on it (the SDK's own, as in her Trophy Room), then 🔁 race again or 🚤 back to the
//   bay.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { bigCelebration, Trophy, useTimers } from '../../../../../../sdk'
import { Banner, CoinsAndMap, Countdown, Standings, type Face } from '../../../trip/race/RaceHud'
import type { RaceHud, RacerId } from './race'
import { LAPS, MAP } from './track'

export { RaceFlag } from '../../../trip/race/RaceHud'

export const RACE_TROPHY = 'Boat Race Champion'

const FACES: Record<RacerId, Face> = {
  kaylee: { icon: '🦄', color: 'var(--hotpink)', label: 'You' },
  kids: { icon: '🐃', color: '#7FB2E8', label: 'The village kids' },
  monkey: { icon: '🐒', color: '#F2C24C', label: 'The macaque' },
}

interface Props {
  hud: RaceHud
  onAgain: () => void
  onBay: () => void
  /** The minimap's dots, by racer id (race.ts moves them). */
  mapEls: Map<string, SVGElement>
}

export function RaceLayer({ hud, onAgain, onBay, mapEls }: Props) {
  const racing = hud.phase === 'race' || hud.phase === 'count' || hud.phase === 'finish'
  // Confetti on the screen too, as she wins.
  const celebrated = useRef(false)
  useEffect(() => {
    if (hud.phase !== 'finish' || celebrated.current) return
    celebrated.current = true
    bigCelebration()
  }, [hud.phase])
  return (
    <>
      {racing && <Standings hud={hud} faces={FACES} me="kaylee" />}
      {racing && <CoinsAndMap hud={hud} laps={LAPS} map={MAP} dots={['monkey', 'kids', 'kaylee']} faces={FACES} me="kaylee" mapEls={mapEls} />}
      <Countdown count={hud.count} />
      <Banner banner={hud.banner} />
      {hud.phase === 'podium' && <Podium trophy={hud.trophy} onAgain={onAgain} onBay={onBay} />}
    </>
  )
}

function Podium({ trophy, onAgain, onBay }: { trophy: boolean; onAgain: () => void; onBay: () => void }) {
  // The trophy card comes up big for a moment, then tucks into the corner so the podium shows.
  // The buttons come up almost at once (something to touch while the trophy floats down).
  const timers = useTimers()
  const [big, setBig] = useState(true)
  const [buttons, setButtons] = useState(false)
  useEffect(() => {
    const b = timers.later(() => setButtons(true), 900)
    return () => clearTimeout(b)
  }, [])
  useEffect(() => {
    if (!trophy) return
    const a = timers.later(() => setBig(false), 2800)
    return () => clearTimeout(a)
  }, [trophy])
  return (
    <>
      <AnimatePresence>
        {trophy && (
          <motion.div
            key="trophy"
            layout
            aria-label={`Trophy: ${RACE_TROPHY}`}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: big ? 0 : -6 }}
            transition={{ type: 'spring', bounce: 0.45 }}
            style={{ position: 'absolute', zIndex: 40, pointerEvents: 'none', ...(big ? { left: '50%', top: 'var(--bar-clear)', translate: '-50% 0' } : { left: 'calc(var(--safe-left, 0px) + 12px)', top: 'var(--top-clear)' }) }}
          >
            <Trophy title={RACE_TROPHY} size={big ? Math.round(Math.min(220, window.innerHeight * 0.24, window.innerWidth * 0.36)) : 110} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {buttons && (
          <motion.div key="buttons" initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 18px)', display: 'flex', justifyContent: 'center', gap: 'clamp(14px, 3vw, 28px)', zIndex: 38 }}>
            <motion.button aria-label="Race again" whileTap={{ scale: 0.88 }} onClick={onAgain} style={{ width: 'clamp(92px, 14vmin, 116px)', height: 'clamp(92px, 14vmin, 116px)', borderRadius: '50%', border: '5px solid #fff', background: 'var(--lavender)', fontSize: 'clamp(40px, 7vmin, 54px)', boxShadow: 'var(--shadow)', padding: 0 }}>
              🔁
            </motion.button>
            <motion.button
              aria-label="Back to the bay"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              whileTap={{ scale: 0.88 }}
              onClick={onBay}
              style={{ minWidth: 'clamp(140px, 24vmin, 200px)', height: 'clamp(92px, 14vmin, 116px)', borderRadius: 999, border: '5px solid #fff', background: 'var(--mint)', fontSize: 'clamp(40px, 7vmin, 54px)', boxShadow: '0 0 0 6px rgba(255,79,154,.45), var(--shadow)', padding: '0 22px' }}
            >
              🚤▶
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

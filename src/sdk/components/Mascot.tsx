import { motion } from 'motion/react'
import { useState } from 'react'
import { SparklePuppet } from '../puppet/Sparkle'

export type MascotPose = 'wave' | 'cheer' | 'think'

/** One bob, 1.8 s. Its phase comes from the page's clock, so two Sparkles in the same spot (a loading screen and the
 *  cover that replaces it) bob in step and the swap can't be seen. */
const BOB_MS = 1800

/** Backwards-compatible square layout, with the same living Sparkle used in every country.
 * Keep character artwork in SparklePuppet so menus, old games and new games cannot drift apart.
 * `appear={false}` skips the pop-in (she is already on screen). */
export function Mascot({ pose = 'wave', size = 220, bounce = true, appear = true }: { pose?: MascotPose; size?: number; bounce?: boolean; appear?: boolean }) {
  const [delay] = useState(() => `-${Math.round(performance.now() % BOB_MS)}ms`)
  return (
    <motion.div
      initial={appear ? { scale: 0.6, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', bounce: 0.5 }}
      style={{ width: size, height: size, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: bounce ? `mascot-bob ${BOB_MS}ms ease-in-out ${delay} infinite` : undefined }}>
        <SparklePuppet height="100%" mood={pose} />
      </div>
    </motion.div>
  )
}

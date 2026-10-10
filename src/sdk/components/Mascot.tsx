import { motion } from 'motion/react'
import { SparklePuppet } from '../puppet/Sparkle'

export type MascotPose = 'wave' | 'cheer' | 'think'

/** Backwards-compatible square layout, with the same living Sparkle used in every country.
 * Keep character artwork in SparklePuppet so menus, old games and new games cannot drift apart. */
export function Mascot({ pose = 'wave', size = 220, bounce = true }: { pose?: MascotPose; size?: number; bounce?: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={bounce ? { scale: 1, opacity: 1, y: [0, -12, 0] } : { scale: 1, opacity: 1 }}
      transition={bounce ? { y: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }, default: { type: 'spring', bounce: 0.5 } } : { type: 'spring', bounce: 0.5 }}
      style={{ width: size, height: size, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <SparklePuppet height="100%" mood={pose} />
    </motion.div>
  )
}

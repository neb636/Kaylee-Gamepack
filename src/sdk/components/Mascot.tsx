import { motion } from 'motion/react'
import wave from '../../assets/mascot/wave.webp'
import cheer from '../../assets/mascot/cheer.webp'
import think from '../../assets/mascot/think.webp'

const POSES = { wave, cheer, think }
export type MascotPose = keyof typeof POSES

/** Sparkle the unicorn, the app's friendly guide. */
export function Mascot({ pose = 'wave', size = 220, bounce = true }: { pose?: MascotPose; size?: number; bounce?: boolean }) {
  return (
    <motion.img
      key={pose}
      src={POSES[pose]}
      alt="Sparkle the unicorn"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={bounce ? { scale: 1, opacity: 1, y: [0, -12, 0] } : { scale: 1, opacity: 1 }}
      transition={bounce ? { y: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }, default: { type: 'spring', bounce: 0.5 } } : { type: 'spring', bounce: 0.5 }}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}

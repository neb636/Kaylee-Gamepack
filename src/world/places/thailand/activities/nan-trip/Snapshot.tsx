// Mommy's photo on the trip (the rice farm's deck, the 3's viewpoint): a white flash, then the print drops in.
import { motion } from 'motion/react'

/** Mommy's photo: a white flash, then the print drops in, tilted, in the top corner (clear of the 🏠 and the deck). */
export function Snapshot({ src }: { src: string }) {
  return (
    <>
      <motion.div key="flash" initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 40 }} />
      <motion.div
        initial={{ y: -260, rotate: -14, opacity: 0 }}
        animate={{ y: 0, rotate: 5, opacity: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 170, damping: 14, delay: 0.2 }}
        aria-label="Mommy's photo"
        style={{ position: 'absolute', right: 'clamp(12px, 3vw, 36px)', top: 'calc(var(--top-clear, 72px) + 8px)', width: 'clamp(150px, 26vmin, 260px)', padding: '8px 8px 26px', background: '#fff', borderRadius: 6, boxShadow: '0 10px 24px rgba(43,35,48,.28)', zIndex: 41, pointerEvents: 'none' }}
      >
        <img src={src} alt="" style={{ display: 'block', width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 2 }} />
      </motion.div>
    </>
  )
}

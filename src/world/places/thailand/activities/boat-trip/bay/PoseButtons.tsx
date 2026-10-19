// The four pose buttons on the Nail Island beach (UI chips at the bottom edge): wave, cheer, heart, silly. Kaylee
// strikes the one she taps, Mommy and Daddy copy her, and the photo is taken (nail.ts).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { PoseKind } from './part'
import { PHOTO_POSES } from './poses'

export function PoseButtons({ show, onPose }: { show: boolean; onPose: (p: PoseKind) => void }) {
  // On a narrow phone the row doesn't fit between Sparkle and the album: it sits above them instead.
  const [narrow, setNarrow] = useState(() => window.innerWidth < 600)
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 600)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="poses"
          initial={{ y: 140 }}
          animate={{ y: 0 }}
          exit={{ y: 160 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: narrow ? 'calc(var(--safe-bottom) + min(150px, 20vh, 30vw) + 12px)' : 'calc(var(--safe-bottom) + 14px)', display: 'flex', justifyContent: 'center', gap: 'clamp(8px, 2vw, 18px)', zIndex: 31, pointerEvents: 'none' }}
        >
          {PHOTO_POSES.map((p, i) => (
            <motion.button
              key={p.id}
              aria-label={`${p.label} pose`}
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.2 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => onPose(p.id)}
              style={{ pointerEvents: 'auto', width: 'clamp(64px, 12vmin, 104px)', height: 'clamp(64px, 12vmin, 104px)', borderRadius: '50%', border: '5px solid #fff', background: ['var(--pink)', 'var(--butter)', 'var(--lavender)', 'var(--mint)'][i], fontSize: 'clamp(32px, 6vmin, 54px)', boxShadow: 'var(--shadow)', padding: 0 }}
            >
              {p.icon}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

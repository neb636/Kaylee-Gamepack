// The trip: the globe spins and Sparkle's balloon floats across. Tap to skip.
import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { say, sounds } from '../sdk'
import balloon from './assets/balloon.webp'
import globe from './assets/globe.webp'
import { WORLD_LINES } from './lines'
import type { PlaceEntry } from './registry'

export function Travel({ entry, onDone }: { entry: PlaceEntry; onDone: () => void }) {
  const done = useRef(false)
  const finish = () => {
    if (done.current) return
    done.current = true
    onDone()
  }
  useEffect(() => {
    sounds.whoosh()
    void say(WORLD_LINES.takeoff)
    void entry.load() // start downloading the country while we fly
    const t = setTimeout(finish, 2800)
    return () => clearTimeout(t)
  }, [entry])

  return (
    <motion.button
      aria-label="Skip"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={finish}
      style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'linear-gradient(#FFD6E7, #D9CCFF)', overflow: 'hidden', display: 'grid', placeItems: 'center' }}
    >
      <motion.img
        src={globe}
        alt=""
        animate={{ rotate: 360 * 2 }}
        transition={{ duration: 2.8, ease: 'easeInOut' }}
        style={{ width: 'min(60vw, 55vh)', aspectRatio: '1', objectFit: 'contain' }}
      />
      <motion.img
        src={balloon}
        alt=""
        initial={{ x: '-60vw', y: '20vh', scale: 0.7 }}
        animate={{ x: ['-60vw', '0vw', '60vw'], y: ['20vh', '-28vh', '10vh'], scale: [0.7, 1, 0.8] }}
        transition={{ duration: 2.8, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: 'min(30vw, 28vh)', objectFit: 'contain' }}
      />
      <div style={{ position: 'absolute', bottom: 'calc(var(--safe-bottom) + 8vh)', fontSize: 'clamp(28px, 6vw, 56px)', fontWeight: 700, color: 'var(--hotpink)', textShadow: '0 4px 0 #fff' }}>
        {entry.meta.emoji} {entry.meta.name}!
      </div>
    </motion.button>
  )
}

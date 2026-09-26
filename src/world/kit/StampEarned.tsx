import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { BigButton, burst, say, sounds } from '../../sdk'
import type { ActivityInfo } from '../types'

/** Stamp slam + animal sticker + one spoken fun fact, then back to the country map. */
export function StampEarned({ activity, onClose }: { activity: ActivityInfo; onClose: () => void }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    sounds.sparkle()
    const t1 = setTimeout(() => {
      sounds.pop()
      burst(0.5, 0.45)
    }, 450)
    const t2 = setTimeout(() => setReady(true), 900)
    void say(activity.sticker.fact)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [activity])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(217, 204, 255, 0.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'min(20px, 3vh)', padding: 'var(--top-clear) 20px 20px' }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 'min(24px, 4vw)' }}>
        <motion.div
          initial={{ scale: 3, rotate: -40, opacity: 0 }}
          animate={{ scale: 1, rotate: -12, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.35, delay: 0.25 }}
          style={{ width: 'min(200px, 30vh, 38vw)', aspectRatio: '1', borderRadius: '50%', border: '10px dashed var(--hotpink)', background: 'var(--cream)', display: 'grid', placeItems: 'center', fontSize: 'min(96px, 14vh, 18vw)', boxShadow: 'var(--shadow)' }}
        >
          {activity.icon}
        </motion.div>
        <motion.img
          src={activity.sticker.img}
          alt={activity.sticker.name}
          initial={{ scale: 0, rotate: 30 }}
          animate={{ scale: 1, rotate: 0, y: [0, -10, 0] }}
          transition={{ scale: { delay: 0.6, type: 'spring' }, rotate: { delay: 0.6 }, y: { repeat: Infinity, duration: 1.6 } }}
          style={{ height: 'min(240px, 34vh, 40vw)', objectFit: 'contain', filter: 'drop-shadow(0 0 0 #fff) drop-shadow(0 6px 0 rgba(0,0,0,.12))' }}
        />
      </div>
      <p style={{ fontSize: 'clamp(22px, min(4vw, 5vh), 36px)', fontWeight: 600, textAlign: 'center', maxWidth: 720, background: '#fff', borderRadius: 'var(--radius)', padding: '12px 24px', boxShadow: 'var(--shadow)' }}>
        {activity.sticker.fact}
      </p>
      {ready && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <BigButton onClick={onClose} ariaLabel="Back to the map">
            🗺️ ▶
          </BigButton>
        </motion.div>
      )}
    </motion.div>
  )
}

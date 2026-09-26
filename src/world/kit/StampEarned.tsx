import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BigButton, Buddy, burst, lineText, say, SparklePuppet, sounds, type PuppetHandle } from '../../sdk'
import type { ActivityInfo } from '../types'

/** Stamp slam + animal sticker + one spoken fun fact, then back to the country map. */
export function StampEarned({ activity, onClose }: { activity: ActivityInfo; onClose: () => void }) {
  const [ready, setReady] = useState(false)
  const buddy = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const roomy = window.innerHeight > 560 && window.innerWidth > 600
  useEffect(() => {
    sounds.sparkle()
    const t1 = setTimeout(() => {
      sounds.pop()
      burst(0.5, 0.45)
    }, 450)
    const t2 = setTimeout(() => setReady(true), 900)
    const t3 = setTimeout(() => {
      void buddy.current?.play('cheer')
      void sparkle.current?.play('cheer')
    }, 850)
    void say(activity.sticker.fact)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [activity])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(217, 204, 255, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'min(20px, 3vh)', padding: 'var(--top-clear) 20px 20px' }}
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
        <motion.div
          initial={{ scale: 0, rotate: 30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ scale: { delay: 0.6, type: 'spring' }, rotate: { delay: 0.6 } }}
          style={{ display: 'flex', alignItems: 'flex-end', filter: 'drop-shadow(0 6px 0 rgba(0,0,0,.12))' }}
        >
          <Buddy ref={buddy} img={activity.sticker.img} alt={activity.sticker.name} height="min(240px, 34vh, 40vw)" />
        </motion.div>
        {roomy && (
          <motion.div initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3, type: 'spring' }}>
            <SparklePuppet ref={sparkle} height="min(220px, 26vh, 26vw)" lookToward={-0.6} />
          </motion.div>
        )}
      </div>
      <p style={{ fontSize: 'clamp(22px, min(4vw, 5vh), 36px)', fontWeight: 600, textAlign: 'center', maxWidth: 720, background: '#fff', borderRadius: 'var(--radius)', padding: '12px 24px', boxShadow: 'var(--shadow)' }}>
        {lineText(activity.sticker.fact)}
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

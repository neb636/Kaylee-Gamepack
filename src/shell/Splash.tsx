import { motion } from 'motion/react'
import { useEffect, useRef, type CSSProperties } from 'react'
import { pick, SparklePuppet, sounds, useLandscape, type PuppetHandle, type SparkleAction } from '../sdk'
import { unlockSpeech } from '../sdk/speech'
import { unlockSounds } from '../sdk/sounds'
import { Balloon, Cloud, HiKaylee, Pill, Rainbow, Sky, Wave } from './Sky'

import { useHalloween } from './season'
import { HalloweenGuest } from './Halloween'
const TRICKS: SparkleAction[] = ['hop', 'dance', 'wiggle', 'cheer']

/** First screen: Sparkle on a cloud under a rainbow. Its big button is the tap iPad needs before we can play sounds and talk. */
export function Splash({ onStart }: { onStart: () => void }) {
  const halloween = useHalloween()
  const CREAM = halloween ? '#fff3e3' : '#fff7f0'
  const landscape = useLandscape()
  const sparkle = useRef<PuppetHandle>(null)
  useEffect(() => {
    const t = setTimeout(() => void sparkle.current?.play('wave'), 700)
    return () => clearTimeout(t)
  }, [])

  // Sparkle's height; the rainbow and her cloud are sized from it.
  const h = landscape ? 'min(44vh, 380px, 34vw)' : 'min(39vh, 440px, 60vw)'
  return (
    <div className={`screen${halloween ? ' halloween' : ''}`} style={{ padding: 0, overflow: 'hidden', background: CREAM }}>
      <Sky>
        {halloween ? <>
          <HalloweenGuest kind="pumpkin" style={{ left: '3%', top: landscape ? '15%' : '22%' }} />
          <HalloweenGuest kind="ghost" style={{ right: '3%', top: landscape ? '14%' : '30%' }} />
        </> : <>
        <Balloon width="clamp(46px, 7vw, 86px)" style={{ left: '5%', top: landscape ? '12%' : '22%' }} />
        <Balloon width="clamp(36px, 5.5vw, 64px)" delay={1.2} style={{ right: '7%', top: landscape ? '40%' : '34%' }} />
        </>}
      </Sky>

      <div
        style={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingTop: 'calc(var(--safe-top) + 12px)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ '--h': h, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: landscape ? 'calc(var(--h) * -0.02)' : 'calc(var(--h) * 0.06)' } as CSSProperties}>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{ position: 'absolute', bottom: 'calc(var(--h) * 0.1)', left: '50%', width: 'calc(var(--h) * 1.9)', translate: '-50% 0', transformOrigin: '50% 100%' }}
          >
            <Rainbow style={{ width: '100%', height: 'auto' }} />
            <Cloud width="calc(var(--h) * 0.62)" style={{ position: 'absolute', left: '-14%', bottom: '-8%' }} />
            <Cloud width="calc(var(--h) * 0.56)" style={{ position: 'absolute', right: '-12%', bottom: '-6%' }} />
          </motion.div>
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
            onClick={() => {
              unlockSounds()
              sounds.sparkle()
              void sparkle.current?.play(pick(TRICKS))
            }}
            style={{ position: 'relative', pointerEvents: 'auto', cursor: 'pointer' }}
          >
            <SparklePuppet ref={sparkle} height="var(--h)" />
          </motion.div>
          <Cloud width="calc(var(--h) * 1.05)" style={{ position: 'relative', marginTop: 'calc(var(--h) * -0.12)' }} />
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          background: CREAM,
          display: 'flex',
          flexDirection: landscape ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: landscape ? 'clamp(24px, 5vw, 64px)' : 'clamp(16px, 3vh, 32px)',
          padding: landscape ? '4px 24px calc(var(--safe-bottom) + 14px)' : '8px 24px calc(var(--safe-bottom) + clamp(24px, 5vh, 56px))',
        }}
      >
        <Wave color="#ffc4dd" style={{ top: 0, height: 'clamp(30px, 6vh, 56px)', translate: '0 -100%', transform: 'scaleX(-1) translateY(-8px)' }} />
        <Wave color={CREAM} style={{ top: 1, height: 'clamp(30px, 6vh, 56px)', translate: '0 -100%' }} />
        <HiKaylee fontSize={landscape ? 'clamp(40px, 12vh, 108px)' : 'clamp(56px, 13vw, 124px)'} style={{ justifyContent: 'center' }} />
        <motion.button
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.92, y: 5 }}
          onClick={() => {
            unlockSounds()
            unlockSpeech()
            sounds.pop()
            onStart()
          }}
          style={{ minHeight: 88, paddingBottom: 10 }}
        >
          {/* The face breathes, not the button: tests and QA tap it and need it to hold still. */}
          <motion.span animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', delay: 1.4 }} style={{ display: 'inline-block' }}>
            <Pill fontSize={landscape ? 'clamp(26px, 6.5vh, 46px)' : 'clamp(32px, 6vw, 52px)'}>
              Let's play!
            </Pill>
          </motion.span>
        </motion.button>
      </div>
    </div>
  )
}

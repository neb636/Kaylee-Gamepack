import { motion } from 'motion/react'
import { BigButton, Mascot, say } from '../sdk'
import { unlockSpeech } from '../sdk/speech'
import { unlockSounds } from '../sdk/sounds'

/** First screen. Its big button is the tap iPad needs before we can play sounds and talk. */
export function Splash({ onStart }: { onStart: () => void }) {
  return (
    <div className="screen" style={{ background: 'var(--lavender)', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <Mascot pose="wave" size={Math.min(360, window.innerHeight * 0.36)} />
      <motion.h1
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.6, delay: 0.2 }}
        style={{ fontSize: 'clamp(64px, 12vw, 120px)', fontWeight: 700, color: 'var(--hotpink)', textShadow: '0 5px 0 #fff' }}
      >
        Hi Kaylee!
      </motion.h1>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <BigButton
          size="xl"
          onClick={() => {
            unlockSounds()
            unlockSpeech()
            void say("Hi Kaylee! Let's play!")
            onStart()
          }}
        >
          Let's play! ▶
        </BigButton>
      </motion.div>
    </div>
  )
}

// Beach Postcard: free coloring (no wrong colors!), then send it home with "G'day, mate!".
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Buddy, burst, KID_NAME, say, sounds, useAlive, wait } from '../../../../sdk'
import { ColoringPage } from '../../../kit/ColoringPage'
import { Stage } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'

const ENOUGH = 5 // fills before the send button shows up

export function Postcard({ onDone, setProgress }: ActivityProps) {
  const [phase, setPhase] = useState<'story' | 'color' | 'send'>('story')
  const [fills, setFills] = useState(0)
  const [flying, setFlying] = useState(false)
  const alive = useAlive()
  useEffect(() => setProgress(phase === 'send' ? 1 : 0, 2), [phase, setProgress])

  useEffect(() => {
    if (fills === ENOUGH) void say(L.postcard.send)
  }, [fills])

  const send = async () => {
    setPhase('send')
    sounds.sparkle()
    await say(L.postcard.gday)
    if (!alive()) return
    // Off it flies, home to Kaylee's house, with a sparkly trail.
    setFlying(true)
    sounds.whoosh()
    burst(0.5, 0.5)
    setTimeout(() => sounds.sparkle(), 450)
    setTimeout(() => burst(0.85, 0.15), 700)
    await wait(1500)
    if (alive()) onDone()
  }

  if (phase === 'story') return <StoryBeat lines={[L.postcard.story]} img={art.pip} bg={art.bgBeach} onDone={() => setPhase('color')} />

  return (
    <Stage bg={art.bgBeach} prompt={phase === 'color' ? L.postcard.how : undefined}>
      <AnimatePresence mode="wait">
        {phase === 'color' ? (
          <motion.div key="color" exit={{ rotateY: 90 }} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
              <ColoringPage
                src={art.colorPip}
                onFill={setFills}
                action={
                  fills >= ENOUGH && (
                    <motion.button
                      aria-label="Send"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ scale: { repeat: Infinity, duration: 1.2 } }}
                      onClick={() => void send()}
                      className="world-glow"
                      style={{ minHeight: 'calc(var(--target) * 0.8)', padding: '0 22px', borderRadius: 999, background: 'var(--hotpink)', color: '#fff', fontWeight: 700, fontSize: 'calc(var(--target) * 0.34)', boxShadow: 'var(--shadow)', whiteSpace: 'nowrap' }}
                    >
                      📮 Send!
                    </motion.button>
                  )
                }
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -90 }}
            animate={flying ? { rotateY: 0, x: ['0vw', '6vw', '70vw'], y: ['0vh', '-6vh', '-80vh'], rotate: [0, -8, 28], scale: [1, 0.85, 0.25], opacity: [1, 1, 0] } : { rotateY: 0 }}
            transition={flying ? { duration: 1.3, ease: 'easeIn', times: [0, 0.3, 1] } : undefined}
            style={{ width: 'min(92%, 700px, calc((100vh - 200px) * 1.5))', aspectRatio: '1.5', background: 'var(--cream)', borderRadius: 24, boxShadow: 'var(--shadow)', border: '6px solid #fff', display: 'flex', padding: 'min(24px, 3vw)', gap: 16, position: 'relative' }}
          >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, fontSize: 'clamp(26px, 5vw, 52px)', fontWeight: 700, color: 'var(--hotpink)', lineHeight: 1.1 }}>
              <span>G'day, mate!</span>
              <span style={{ fontSize: '60%', color: 'var(--ink)' }}>Love, {KID_NAME} 💖</span>
            </div>
            <div style={{ width: 2, background: 'var(--lavender-dark)' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <motion.div initial={{ scale: 2.5, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 8, opacity: 1 }} transition={{ delay: 0.4, type: 'spring' }} style={{ width: '46%', aspectRatio: '0.85', background: '#fff', border: '4px dashed var(--hotpink)', display: 'grid', placeItems: 'center', fontSize: 'clamp(30px, 6vw, 64px)' }}>
                🦘
              </motion.div>
              <div style={{ height: '48%', display: 'flex', alignItems: 'flex-end' }}>
                <Buddy img={art.pip} voice="pip" height="min(150px, 18vh, 20vw)" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  )
}

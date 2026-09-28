// The walk through Shanghai's old town: a wide street that pans left to right. Tap the zig-zag bridge (they zig-zag
// along), then the dumpling house door, and Chef Fu bursts out.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { say, SparklePuppet, sounds, useAlive, useElementSize, wait, type PuppetHandle } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { art } from '../../art'
import { L } from '../../lines'
import { ChefFu } from '../../puppets/ChefFu'
import { DouDou } from '../../puppets/DouDou'
import { WordCard } from '../../WordCard'
import { useWord } from './shared'

const D = L.dumplings
const RATIO = 1.5 // the old-town picture is 1536x1024
// Tap spots, in fractions of the picture.
const BRIDGE = { x: 0.16, y: 0.38, w: 0.3, h: 0.17 }
const DOOR = { x: 0.84, y: 0.28, w: 0.14, h: 0.32 }

export function OldTown({ onDone }: { onDone: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const { width: W, height: H } = useElementSize(box)
  const [stage, setStage] = useState<'bridge' | 'walk' | 'door' | 'chef'>('bridge')
  const sparkle = useRef<PuppetHandle>(null)
  const dou = useRef<PuppetHandle>(null)
  const chef = useRef<PuppetHandle>(null)
  const [word, showWord] = useWord()
  const alive = useAlive()

  // The picture fills the height (or the width on very wide screens) and pans so the spot of interest is centered.
  const pw = Math.max(W, H * RATIO)
  const ph = pw / RATIO
  const focus = stage === 'bridge' ? BRIDGE.x + BRIDGE.w / 2 : DOOR.x + DOOR.w / 2
  const pan = Math.min(0, Math.max(W - pw, W / 2 - focus * pw))

  useEffect(() => {
    const t = setTimeout(() => {
      void sparkle.current?.play('wave')
      void dou.current?.play('wave')
    }, 400)
    return () => clearTimeout(t)
  }, [])

  const tapBridge = async () => {
    if (stage !== 'bridge') return
    sounds.pop()
    setStage('walk')
    void dou.current?.play('run')
    void sparkle.current?.play('hop')
    await say(D.zigzag)
    await wait(300)
    if (alive()) setStage('door')
  }
  const tapDoor = async () => {
    if (stage !== 'door') return
    sounds.whoosh()
    setStage('chef')
    await wait(350)
    void chef.current?.play('aiyo')
    showWord('aiyo')
    await say(D.aiyo)
    await wait(300)
    if (alive()) onDone()
  }

  const spot = (s: typeof BRIDGE) => ({ left: pan + s.x * pw, top: H - ph + s.y * ph, width: s.w * pw, height: s.h * ph })
  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#B9A6F5' }}>
      <motion.div animate={{ x: pan }} transition={{ duration: 1.6, ease: 'easeInOut' }} style={{ position: 'absolute', left: 0, bottom: 0, width: pw, height: ph, background: `url(${art.bgOldtown}) center / 100% 100%` }} />
      {W > 0 && (
        <>
          <motion.button aria-label="zig-zag bridge" onClick={tapBridge} className={stage === 'bridge' ? 'world-glow' : undefined} animate={{ left: spot(BRIDGE).left }} transition={{ duration: 1.6, ease: 'easeInOut' }} style={{ position: 'absolute', ...spot(BRIDGE), background: 'rgba(255,255,255,0.01)', border: 'none', borderRadius: 40 }} />
          <motion.button aria-label="dumpling house door" onClick={tapDoor} className={stage === 'door' ? 'world-glow' : undefined} animate={{ left: spot(DOOR).left }} transition={{ duration: 1.6, ease: 'easeInOut' }} style={{ position: 'absolute', ...spot(DOOR), background: 'rgba(255,255,255,0.01)', border: 'none', borderRadius: 30 }} />
        </>
      )}
      {/* Chef Fu bursts out of the door. */}
      <AnimatePresence>
        {stage === 'chef' && W > 0 && (
          <motion.div key="chef" initial={{ scale: 0.2, y: 60, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', left: spot(DOOR).left + spot(DOOR).width / 2, bottom: '8%', translate: '-60% 0', height: 'min(46vh, 42vw)', zIndex: 5 }}>
            <ChefFu ref={chef} height="100%" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sparkle and Dou Dou on the walkway; they zig-zag along when she taps the bridge. */}
      <motion.div
        animate={stage === 'walk' ? { x: ['0vw', '8vw', '16vw', '24vw', '30vw'], y: ['0vh', '-3vh', '0vh', '-3vh', '0vh'] } : stage === 'bridge' ? { x: '0vw' } : { x: '30vw', y: '0vh' }}
        transition={{ duration: stage === 'walk' ? 1.8 : 0.4 }}
        style={{ position: 'absolute', left: '4%', bottom: '4%', display: 'flex', alignItems: 'flex-end', gap: 'min(2vw, 16px)', zIndex: 4, pointerEvents: 'none' }}
      >
        <SparklePuppet ref={sparkle} height="min(30vh, 28vw)" lookToward={0.6} />
        <DouDou ref={dou} height="min(24vh, 22vw)" />
      </motion.div>
      {stage !== 'chef' && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 12px', zIndex: 20 }}>
          <PromptBubble text={stage === 'bridge' ? D.bridge : stage === 'door' ? D.door : D.zigzag} speak={stage !== 'walk'} />
        </div>
      )}
      <WordCard word={word} />
    </div>
  )
}

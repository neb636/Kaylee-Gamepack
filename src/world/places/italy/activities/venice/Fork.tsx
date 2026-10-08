// A fork in the canal, seen straight on from the front of the gondola (the prow at the bottom): a house in the middle,
// a canal going away on each side, and a sign on a post at each one. "Turn left!" Her own hands sit in the bottom
// corners, so left and right are the hands she holds up. The wrong way is a dead end with a friendly duck; Gino laughs,
// backs up, and the right sign and hand glow.
import { animate, AnimatePresence, motion, useMotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Buddy, pick, say, sounds, useAlive, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'
import { PromptRow, useCover } from '../scene'
import { fx } from '../synth'

const V = L.venice
type Side = 'left' | 'right'

export function Fork({ want, onDone }: { want: Side; onDone: () => void }) {
  const { box, W, H, bw, bh, ox, oy, landscape } = useCover(1)
  const alive = useAlive()
  const gino = useRef<PuppetHandle>(null)
  const [prompt, setPrompt] = useState<{ text: Line; speak: boolean } | null>(null)
  const [hint, setHint] = useState(false)
  const [duck, setDuck] = useState<Side | null>(null)
  const [locked, setLocked] = useState(false)
  const zoom = useMotionValue(1)
  const zx = useMotionValue(0)

  useEffect(() => {
    void (async () => {
      await say(V.fork)
      if (!alive()) return
      setPrompt({ text: want === 'left' ? V.left : V.right, speak: true })
    })()
  }, [])

  const choose = async (side: Side) => {
    if (locked) return
    setLocked(true)
    setPrompt(null)
    sounds.pop()
    const dir = side === 'left' ? 1 : -1
    if (side === want) {
      sounds.correct()
      void gino.current?.play('cheer')
      void say(pick(V.goodTurn))
      void animate(zx, dir * W * 0.35, { duration: 1.2, ease: 'easeIn' })
      await animate(zoom, 2.2, { duration: 1.2, ease: 'easeIn' })
      if (!alive()) return
      onDone()
      return
    }
    // The wrong way: drift toward it and find a duck.
    sounds.oops()
    void animate(zx, dir * W * 0.22, { duration: 0.9, ease: 'easeInOut' })
    await animate(zoom, 1.45, { duration: 0.9, ease: 'easeInOut' })
    if (!alive()) return
    setDuck(side)
    fx.quack()
    await wait(500)
    if (!alive()) return
    void gino.current?.play('jump')
    await say(V.deadEnd)
    if (!alive()) return
    await say(V.backUp)
    if (!alive()) return
    setDuck(null)
    void animate(zx, 0, { duration: 0.9, ease: 'easeInOut' })
    await animate(zoom, 1, { duration: 0.9, ease: 'easeInOut' })
    if (!alive()) return
    setHint(true)
    setLocked(false)
    await say(V.tryOther)
    if (!alive()) return
    void say(want === 'left' ? V.leftHand : V.rightHand)
  }

  const sign = Math.max(110, Math.min(170, Math.min(W, H) * 0.2))
  const hand = Math.max(96, Math.min(150, Math.min(W, H) * 0.17))
  const signY = oy + bh * 0.66
  const gh = Math.min(H * 0.2, W * 0.2, 180)

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#6EC3E6' }}>
      {W > 0 && (
        <motion.div style={{ position: 'absolute', inset: 0, scale: zoom, x: zx, transformOrigin: '50% 62%' }}>
          <div style={{ position: 'absolute', left: ox, top: oy, width: bw, height: bh, background: `url(${landscape ? art.bgVeniceFork : art.bgVeniceForkTall}) center / 100% 100%` }} />
          {(['left', 'right'] as Side[]).map((side) => (
            <AnimatePresence key={side}>
              {duck === side && (
                <motion.img src={art.duck} alt="" initial={{ y: 40, opacity: 0, scale: 0.6 }} animate={{ y: [0, -6, 0], opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ y: { repeat: Infinity, duration: 0.8 } }} style={{ position: 'absolute', left: (side === 'left' ? 0.22 : 0.78) * W - sign * 0.45, top: signY - sign * 0.15, width: sign * 0.9, zIndex: 3 }} />
              )}
            </AnimatePresence>
          ))}
        </motion.div>
      )}
      {/* The signs on their posts. */}
      {W > 0 &&
        (['left', 'right'] as Side[]).map((side) => {
          const glow = hint && side === want
          return (
            <motion.button
              key={side}
              aria-label={side === 'left' ? 'Turn left' : 'Turn right'}
              className={glow ? 'world-glow' : undefined}
              onClick={() => void choose(side)}
              whileTap={{ scale: 0.9 }}
              animate={glow ? { rotate: [-3, 3, -3] } : { rotate: 0 }}
              transition={glow ? { repeat: Infinity, duration: 1.2 } : { duration: 0.2 }}
              style={{ position: 'absolute', left: (side === 'left' ? 0.2 : 0.8) * W - sign / 2, top: signY - sign * 1.35, width: sign, height: sign * 1.5, background: 'none', border: 'none', padding: 0, zIndex: 10, borderRadius: 24, transformOrigin: '50% 100%' }}
            >
              <svg viewBox="0 0 100 150" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
                <rect x="44" y="50" width="12" height="100" rx="4" fill="#C98B5B" stroke={INK} strokeWidth="5" />
                <path d={side === 'left' ? 'M6 34 L34 6 L34 20 L94 20 L94 48 L34 48 L34 62 Z' : 'M94 34 L66 6 L66 20 L6 20 L6 48 L66 48 L66 62 Z'} fill={side === 'left' ? '#FF8FB8' : '#6EC3E6'} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
              </svg>
            </motion.button>
          )
        })}
      {/* The front of the gondola. */}
      <motion.div aria-hidden animate={{ rotate: [-1, 1, -1], y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', left: '50%', bottom: -10, translate: '-50% 0', width: 'min(30vw, 26vh)', zIndex: 5, transformOrigin: '50% 100%' }}>
        <svg viewBox="0 0 120 160" width="100%" style={{ display: 'block' }}>
          <path d="M20 160 Q34 70 60 40 Q86 70 100 160 Z" fill="#3B2A3A" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M60 46 L60 160" stroke="#FFC83D" strokeWidth="4" />
          <path d="M48 20 L72 20 L72 46 L48 46 Z M48 28 L40 28 M48 36 L40 36 M48 44 L40 44" fill="#C9C3D6" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M48 20 Q60 4 72 20" fill="#C9C3D6" stroke={INK} strokeWidth="5" />
        </svg>
        {/* Gino perched on the very front of the gondola. */}
        <div style={{ position: 'absolute', left: '50%', bottom: '86%', translate: '-50% 0', pointerEvents: 'none' }}>
          <Buddy ref={gino} img={art.gino} voice="gino" height={`${gh}px`} />
        </div>
      </motion.div>
      {/* Her hands: left in the left corner, right in the right corner. */}
      {(['left', 'right'] as Side[]).map((side) => (
        <motion.button
          key={side}
          aria-label={side === 'left' ? 'Left hand' : 'Right hand'}
          onClick={() => void choose(side)}
          animate={hint && side === want ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ repeat: hint && side === want ? Infinity : 0, duration: 0.9 }}
          style={{ position: 'absolute', bottom: 'calc(var(--safe-bottom) + 10px)', [side === 'left' ? 'left' : 'right']: 50, width: hand, height: hand, borderRadius: '50%', background: hint && side === want ? '#FFE27A' : 'rgba(255,247,240,.85)', border: `5px solid ${INK}`, fontSize: hand * 0.6, padding: 0, zIndex: 12, boxShadow: 'var(--shadow)' }}
        >
          <span style={{ display: 'inline-block', transform: side === 'left' ? 'scaleX(-1)' : undefined }}>✋</span>
        </motion.button>
      ))}
      <PromptRow prompt={prompt} H={H} landscape={landscape} />
    </div>
  )
}

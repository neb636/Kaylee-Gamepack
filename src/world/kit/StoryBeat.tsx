import { motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Buddy, lineText, lineVoice, say, SparklePuppet, stopSpeaking, useAlive, wait, type Line, type PuppetHandle } from '../../sdk'

/**
 * A tiny bit of story: a friend says 1-2 short lines, then the play starts.
 * Tapping anywhere skips straight to the play (she never has to sit through talking).
 * Sparkle is a live puppet whose mouth moves on her lines. Pass `friend` (a puppet, e.g. `<Pip />`) so the friend's
 * mouth moves on theirs; a flat `img` becomes a Buddy that bounces along with the friend's voice.
 */
export function StoryBeat({ lines, img, friend, onDone, bg }: { lines: Line[]; img?: string; friend?: ReactNode; onDone: () => void; bg?: string }) {
  const [index, setIndex] = useState(0)
  const alive = useAlive()
  const done = useRef(false)
  const sparkle = useRef<PuppetHandle>(null)
  const friendVoice = lines.map(lineVoice).find((v) => v !== 'sparkle')
  const finish = () => {
    if (done.current) return
    done.current = true
    onDone()
  }

  useEffect(() => {
    const t = setTimeout(() => void sparkle.current?.play('wave'), 350)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    void (async () => {
      for (let i = 0; i < lines.length; i++) {
        if (!alive() || done.current) return
        setIndex(i)
        await say(lines[i], { interrupt: i > 0 })
        await wait(250)
      }
      if (alive()) finish()
    })()
  }, [])

  return (
    <motion.button
      aria-label="Skip"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => {
        stopSpeaking()
        finish()
      }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'min(20px, 3vh)',
        padding: 'var(--top-clear) 20px calc(var(--safe-bottom) + 20px)',
        background: bg ? `linear-gradient(rgba(255,247,240,0.35), rgba(255,247,240,0.35)), url(${bg}) center / cover` : 'rgba(217, 204, 255, 0.85)',
      }}
    >
      <motion.div
        key={index}
        initial={{ scale: 0.7, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 'min(18px, 3vh) 28px', boxShadow: 'var(--shadow)', fontSize: 'clamp(22px, min(4vw, 5vh), 40px)', fontWeight: 600, maxWidth: 'min(760px, 100%)', textAlign: 'center', lineHeight: 1.2 }}
      >
        {lineText(lines[index])}
      </motion.div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'min(16px, 2vw)', maxWidth: '100%' }}>
        <SparklePuppet ref={sparkle} height={img || friend ? 'min(290px, 30vh, 40vw)' : 'min(380px, 34vh, 62vw)'} lookToward={img || friend ? 0.6 : 0} />
        {(friend || img) && (
          <motion.div initial={{ x: 120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }} style={{ maxWidth: '44vw', height: friend ? 'min(290px, 34vh, 42vw)' : undefined, display: 'flex', alignItems: 'flex-end' }}>
            {friend ?? <Buddy img={img!} voice={friendVoice} height="min(290px, 34vh, 42vw)" />}
          </motion.div>
        )}
      </div>
      <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ background: 'var(--hotpink)', color: '#fff', borderRadius: 999, padding: '10px 30px', fontSize: 30, fontWeight: 700, boxShadow: 'var(--shadow)' }}>
        ▶
      </motion.div>
    </motion.button>
  )
}

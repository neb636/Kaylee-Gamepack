import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { awardTrophy, bigCelebration, BigButton, KID_NAME, Mascot, say, sounds, Trophy, type GameMeta } from './sdk-internal'

/** The same big, happy ending for every game: confetti + a trophy with her name on it. */
export function WinCeremony({ meta, onPlayAgain, onHome, onTrophies }: { meta: GameMeta; onPlayAgain: () => void; onHome: () => void; onTrophies: () => void }) {
  const awarded = useRef(false)
  useEffect(() => {
    if (awarded.current) return
    awarded.current = true
    awardTrophy({ gameId: meta.id, gameTitle: meta.title, trophyTitle: meta.trophyTitle, emoji: meta.emoji })
    sounds.fanfare()
    bigCelebration()
    void say(`${KID_NAME}, you did it! You won the ${meta.trophyTitle} trophy!`)
  }, [meta])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="screen"
      style={{ background: 'rgba(217, 204, 255, 0.97)', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 100 }}
    >
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.6 }}
        style={{ fontSize: 'clamp(48px, 9vw, 88px)', fontWeight: 700, color: 'var(--hotpink)', textAlign: 'center', textShadow: '0 5px 0 #fff' }}
      >
        You did it, {KID_NAME}!
      </motion.h1>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <Mascot pose="cheer" size={Math.min(220, window.innerWidth * 0.25)} />
        <motion.div initial={{ scale: 0, rotate: -30, y: 200 }} animate={{ scale: 1, rotate: 0, y: 0 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}>
          <Trophy title={meta.trophyTitle} size={Math.min(300, window.innerHeight * 0.3)} />
        </motion.div>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
        <BigButton color="white" onClick={onPlayAgain} ariaLabel="Play again">
          🔁 Again
        </BigButton>
        <BigButton color="butter" onClick={onTrophies} ariaLabel="My trophies">
          🏆 Trophies
        </BigButton>
        <BigButton color="pink" onClick={onHome} ariaLabel="Home">
          🏠 Home
        </BigButton>
      </div>
    </motion.div>
  )
}

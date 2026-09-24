import { motion } from 'motion/react'
import { go } from '../router'
import { BigButton, KID_NAME, Mascot, say, sounds, Trophy, useSayOnMount, useTrophies } from './sdk-internal'

export function TrophyRoom() {
  const trophies = useTrophies()
  useSayOnMount(
    trophies.length === 0
      ? `Play a game to win your very first trophy, ${KID_NAME}!`
      : `Wow, ${KID_NAME}! Look at all your trophies!`,
  )
  return (
    <div className="screen" style={{ background: 'linear-gradient(var(--lavender), var(--cream))', gap: 24 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <BigButton color="white" size="md" onClick={go.home} ariaLabel="Home">
          🏠
        </BigButton>
        <h1 style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 700, color: 'var(--hotpink)' }}>{KID_NAME}'s Trophies</h1>
      </header>

      {trophies.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Mascot pose="think" size={240} />
          <p style={{ fontSize: 36, fontWeight: 600, textAlign: 'center' }}>Play a game to win a trophy!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'center', paddingTop: 24 }}>
          {trophies.map((t, i) => (
            <motion.button
              key={t.gameId}
              aria-label={t.trophyTitle}
              initial={{ scale: 0, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.5, delay: i * 0.08 }}
              whileTap={{ scale: 0.92, rotate: -4 }}
              onClick={() => {
                sounds.sparkle()
                void say(`${KID_NAME}, ${t.trophyTitle}! From ${t.gameTitle}.`)
              }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              <Trophy title={t.trophyTitle} size={200} count={t.count} shine={false} />
              <div style={{ background: '#fff', borderRadius: 999, padding: '6px 16px', fontWeight: 600, fontSize: 18, boxShadow: 'var(--shadow)' }}>
                {t.gameTitle} · {new Date(t.lastEarnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

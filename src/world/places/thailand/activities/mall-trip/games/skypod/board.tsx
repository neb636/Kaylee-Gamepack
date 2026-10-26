// The Sky Pod's scoreboard numbers (HTML, never in a picture): SkyPod.tsx lays it over the 3D board's dark screen.
import { motion } from 'motion/react'
import { BLUE, PINK } from './layout'

/** What the board shows: her score in big pink numbers and a star for each round done; in the race, hers and
 *  Daddy's side by side (pink and blue). Sizes are in em: the wall sets the font size to the board's height. */
export function ScoreBoard({ score, daddy, stars, race }: { score: number; daddy: number; stars: number; race: boolean }) {
  const glow = (c: string) => `0 0 0.12em ${c}, 0 0 0.3em ${c}`
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: '0.18em' }}>
      <div aria-label={`Stars: ${stars}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.02em', fontSize: '0.24em', lineHeight: 1 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ opacity: i < stars ? 1 : 0.22, filter: i < stars ? 'none' : 'grayscale(1)' }}>
            ⭐
          </span>
        ))}
      </div>
      {race ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.16em', fontSize: '0.78em' }}>
          <motion.span key={`k${score}`} initial={{ scale: 1.5 }} animate={{ scale: 1 }} style={{ color: '#FFD3E6', textShadow: glow(PINK) }}>
            {score}
          </motion.span>
          <span style={{ color: '#8C82B8', fontSize: '0.6em' }}>•</span>
          <motion.span key={`d${daddy}`} initial={{ scale: 1.5 }} animate={{ scale: 1 }} style={{ color: '#D6EEFF', textShadow: glow(BLUE) }}>
            {daddy}
          </motion.span>
        </div>
      ) : (
        <motion.span key={score} initial={{ scale: 1.45 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 16 }} style={{ color: '#FFD3E6', textShadow: glow(PINK), minWidth: '1.2em', textAlign: 'center' }}>
          {score}
        </motion.span>
      )}
    </div>
  )
}

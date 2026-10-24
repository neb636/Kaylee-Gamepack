import { motion } from 'motion/react'
import { useRef, type CSSProperties } from 'react'
import posthog, { isPostHogEnabled } from '../posthog'
import { gameLogger } from '../posthog-logger'
import { go } from '../router'
import { Mascot, pick, say, SparklePuppet, sounds, useTrophies, type GameMeta, type PuppetHandle, type SparkleAction } from './sdk-internal'
import { games } from './registry'
import { subjectStyle } from './subjects'
import { bubbleText, Cloud, HiKaylee, Pill, Sky, Star, Wave } from './Sky'
import worldCover from '../world/assets/cover-world.webp'
import { WORLD_LINES } from '../world/lines'
import { totalStamps, usePassport } from '../world/stamps'

const CREAM = '#fff7f0'
const TRICKS: SparkleAction[] = ['hop', 'dance', 'wiggle', 'cheer']

/** A big rounded card with a white rim and a soft "3D" edge. */
const card = (background: string, edge: string): CSSProperties => ({
  position: 'relative',
  background,
  borderRadius: 40,
  border: '6px solid #fff',
  boxShadow: `0 10px 0 ${edge}, 0 22px 34px rgba(110, 80, 170, 0.14)`,
  width: '100%',
})

const coverStyle = (width: string, tilt: number): CSSProperties => ({
  width,
  aspectRatio: '1',
  borderRadius: 28,
  objectFit: 'cover',
  background: '#fff',
  border: '5px solid #fff',
  boxShadow: '0 8px 18px rgba(110, 80, 170, 0.2)',
  rotate: `${tilt}deg`,
  flexShrink: 0,
})

/** The big door into Around the World. */
function WorldTile() {
  const stamps = totalStamps(usePassport())
  return (
    <motion.button
      aria-label="Around the World"
      whileTap={{ scale: 0.96 }}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onClick={() => {
        if (isPostHogEnabled) posthog.capture('world_opened', { stamp_count: stamps })
        sounds.sparkle()
        void say(WORLD_LINES.title)
        go.world()
      }}
      style={{
        ...card('linear-gradient(135deg, #ffd1e6 0%, #e9ddff 55%, #cfe4ff 100%)', 'rgba(185, 166, 245, 0.55)'),
        overflow: 'hidden',
        padding: 'clamp(14px, 2.4vw, 22px)',
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(14px, 3.4vw, 32px)',
        textAlign: 'left',
      }}
    >
      <Cloud width="clamp(90px, 16vw, 180px)" style={{ position: 'absolute', right: '-3%', bottom: '-6%', opacity: 0.9 }} />
      <Cloud width="clamp(60px, 10vw, 120px)" style={{ position: 'absolute', right: '22%', top: '-7%', opacity: 0.7 }} />
      <Star size={26} style={{ right: '6%', top: '12%' }} />
      <Star size={18} delay={1.3} color="#fff" style={{ right: '30%', bottom: '14%' }} />
      <img src={worldCover} alt="" style={coverStyle('min(34vw, 300px, 46vh)', -3)} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.8vw, 16px)', flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'clamp(30px, 5.5vw, 58px)', fontWeight: 700, lineHeight: 1.05, color: 'var(--hotpink)', textShadow: bubbleText() }}>Around the World</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(6px, 1.2vw, 12px)' }}>
          {['🦘', '🐪', '🐼', '🐘'].map((a) => (
            <span
              key={a}
              style={{ width: 'clamp(44px, 7vw, 64px)', aspectRatio: '1', borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', fontSize: 'clamp(24px, 4vw, 36px)', boxShadow: '0 4px 0 rgba(185, 166, 245, 0.5)' }}
            >
              {a}
            </span>
          ))}
        </div>
        <Pill fontSize="clamp(24px, 3.6vw, 34px)" style={{ alignSelf: 'flex-start', marginTop: 4 }} shine>
          {stamps > 0 ? `📕 ${stamps}` : 'Fly!'}
        </Pill>
      </div>
    </motion.button>
  )
}

function GameCard({ meta, hero, won }: { meta: GameMeta; hero?: boolean; won: boolean }) {
  const s = subjectStyle(meta.subject)
  return (
    <motion.button
      aria-label={meta.title}
      whileTap={{ scale: 0.95 }}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      onClick={() => {
        if (isPostHogEnabled) {
          posthog.capture('game_session_started', {
            game_id: meta.id,
            previously_completed: won,
          })
        }
        gameLogger.sessionStarted(meta.id, won)
        sounds.pop()
        void say(meta.title)
        go.game(meta.id)
      }}
      style={{
        ...card(`linear-gradient(135deg, ${s.color} 0%, #fff7f0 130%)`, 'rgba(224, 190, 120, 0.45)'),
        padding: hero ? 'clamp(14px, 2.4vw, 22px)' : 14,
        display: 'flex',
        flexDirection: hero ? 'row' : 'column',
        alignItems: 'center',
        gap: hero ? 'clamp(14px, 3.4vw, 32px)' : 10,
        textAlign: hero ? 'left' : 'center',
      }}
    >
      <img src={meta.cover} alt="" style={coverStyle(hero ? 'min(34vw, 300px, 46vh)' : '100%', hero ? 2 : 0)} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div style={{ fontSize: hero ? 'clamp(30px, 5vw, 52px)' : 26, fontWeight: 700, lineHeight: 1.05 }}>{meta.title}</div>
        {hero && (
          <Pill fontSize="clamp(24px, 3.6vw, 34px)" style={{ alignSelf: 'flex-start' }}>
            Play
          </Pill>
        )}
      </div>
      {!won && (
        <motion.div
          animate={{ rotate: [-8, 8, -8], scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          style={{ position: 'absolute', top: -16, right: -8, background: 'linear-gradient(180deg, #ff8cc2, #ff4f9a)', color: '#fff', fontWeight: 700, fontSize: 22, borderRadius: 999, padding: '6px 16px', border: '3px solid #fff', boxShadow: '0 4px 0 #d32f78' }}
        >
          NEW!
        </motion.div>
      )}
      {won && <div style={{ position: 'absolute', top: -14, right: -6, fontSize: 40 }}>🏆</div>}
    </motion.button>
  )
}

export function Home() {
  const trophies = useTrophies()
  const sparkle = useRef<PuppetHandle>(null)
  const [newest, ...rest] = games
  const won = (id: string) => trophies.some((t) => t.gameId === id)
  return (
    <div className="screen" style={{ padding: 0, background: CREAM }}>
      <header style={{ position: 'relative', flexShrink: 0, padding: 'calc(var(--safe-top) + 14px) 24px clamp(44px, 7vw, 64px)' }}>
        <Sky variant="band" />
        <Wave color="#ffd3e6" style={{ bottom: 6, height: 'clamp(26px, 4vw, 44px)', transform: 'scaleX(-1)' }} />
        <Wave color={CREAM} style={{ bottom: -1, height: 'clamp(26px, 4vw, 44px)' }} />
        <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 20px)', pointerEvents: 'none' }}>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            onClick={() => {
              sounds.sparkle()
              void sparkle.current?.play(pick(TRICKS))
            }}
            style={{ pointerEvents: 'auto', cursor: 'pointer', flexShrink: 0 }}
          >
            <SparklePuppet ref={sparkle} height="clamp(80px, min(17vw, 26vh), 180px)" />
          </motion.div>
          <HiKaylee fontSize="clamp(32px, min(8.4vw, 15vh), 92px)" style={{ flex: 1, minWidth: 0 }} />
          <motion.button
            aria-label="My trophies"
            whileTap={{ scale: 0.9, y: 4 }}
            onClick={() => {
              sounds.pop()
              go.trophies()
            }}
            style={{ pointerEvents: 'auto', minHeight: 88, flexShrink: 0, paddingBottom: 8 }}
          >
            <Pill color="gold" arrow={false} fontSize="clamp(24px, min(4.6vw, 8vh), 42px)" style={{ border: '4px solid #fff' }}>
              🏆 {trophies.length}
            </Pill>
          </motion.button>
        </div>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: 36, width: '100%', maxWidth: 1000, margin: '0 auto', padding: '8px 24px calc(var(--safe-bottom) + 40px)' }}>
        <WorldTile />

        {newest && <GameCard meta={newest.meta} hero won={won(newest.meta.id)} />}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
          {rest.map((g) => (
            <GameCard key={g.meta.id} meta={g.meta} won={won(g.meta.id)} />
          ))}
          <div
            style={{
              borderRadius: 40,
              border: '4px dashed var(--lavender-dark)',
              background: 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              gap: 8,
              color: 'var(--ink-soft)',
              fontSize: 24,
              fontWeight: 600,
              textAlign: 'center',
              minHeight: 220,
            }}
          >
            <Mascot pose="think" size={110} bounce={false} />
            More games coming soon!
          </div>
        </div>
      </main>
    </div>
  )
}

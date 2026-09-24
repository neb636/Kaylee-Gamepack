import { motion } from 'motion/react'
import { useState } from 'react'
import { go } from '../router'
import { Mascot, say, sounds, useTrophies, type GameMeta } from './sdk-internal'
import { AdultDialog } from './AdultDialog'
import { games } from './registry'
import { setDebugMode, useSettings } from './settings'
import { subjectStyle } from './subjects'

function GameCard({ meta, hero, won }: { meta: GameMeta; hero?: boolean; won: boolean }) {
  const s = subjectStyle(meta.subject)
  return (
    <motion.button
      aria-label={meta.title}
      whileTap={{ scale: 0.95 }}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onClick={() => {
        sounds.pop()
        void say(meta.title)
        go.game(meta.id)
      }}
      style={{
        position: 'relative',
        background: s.color,
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        padding: hero ? 20 : 14,
        display: 'flex',
        flexDirection: hero ? 'row' : 'column',
        alignItems: 'center',
        gap: hero ? 24 : 10,
        textAlign: hero ? 'left' : 'center',
        width: '100%',
      }}
    >
      <img src={meta.cover} alt="" style={{ width: hero ? 'min(42vw, 380px)' : '100%', aspectRatio: '1', borderRadius: 24, objectFit: 'cover', background: '#fff' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ fontSize: hero ? 'clamp(32px, 5vw, 52px)' : 26, fontWeight: 700, lineHeight: 1.05 }}>{meta.title}</div>
        {hero && (
          <div
            style={{
              alignSelf: 'flex-start',
              background: 'var(--hotpink)',
              color: '#fff',
              borderRadius: 999,
              padding: '14px 32px',
              fontSize: 32,
              fontWeight: 700,
              boxShadow: 'var(--shadow)',
            }}
          >
            Play ▶
          </div>
        )}
      </div>
      <div style={{ position: 'absolute', top: -12, left: -8, fontSize: 40, filter: 'drop-shadow(0 3px 0 rgba(0,0,0,.1))' }}>{s.emoji}</div>
      {!won && (
        <motion.div
          animate={{ rotate: [-8, 8, -8], scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          style={{ position: 'absolute', top: -14, right: -8, background: 'var(--hotpink)', color: '#fff', fontWeight: 700, fontSize: 22, borderRadius: 999, padding: '6px 14px', boxShadow: 'var(--shadow)' }}
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
  const settings = useSettings()
  const [adultsOpen, setAdultsOpen] = useState(false)
  const [newest, ...rest] = games
  const won = (id: string) => trophies.some((t) => t.gameId === id)
  return (
    <div className="screen decorated" style={{ gap: 28 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Mascot pose="wave" size={120} />
        <h1 style={{ fontSize: 'clamp(48px, 9vw, 84px)', fontWeight: 700, color: 'var(--hotpink)', flex: 1 }}>Hi Kaylee!</h1>
        <motion.button
          aria-label="My trophies"
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            sounds.pop()
            go.trophies()
          }}
          style={{ background: 'var(--butter)', borderRadius: 999, padding: '12px 24px', fontSize: 40, fontWeight: 700, boxShadow: 'var(--shadow)', minHeight: 88, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          🏆 {trophies.length}
        </motion.button>
      </header>

      {newest && <GameCard meta={newest.meta} hero won={won(newest.meta.id)} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
        {rest.map((g) => (
          <GameCard key={g.meta.id} meta={g.meta} won={won(g.meta.id)} />
        ))}
        <div
          style={{
            borderRadius: 'var(--radius)',
            border: '4px dashed var(--lavender-dark)',
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
      <button type="button" onClick={() => setAdultsOpen(true)} style={{ alignSelf: 'center', minHeight: 64, padding: '10px 24px', borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow)', fontSize: 24, fontWeight: 600 }}>For Adults</button>
      {adultsOpen && (
        <AdultDialog title="Adult Settings" onClose={() => setAdultsOpen(false)}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 18, minHeight: 88, padding: 18, borderRadius: 20, background: '#fff', fontSize: 28, fontWeight: 600 }}>
            <span style={{ flex: 1 }}>Debug Mode</span>
            <input type="checkbox" checked={settings.debugMode} onChange={(event) => setDebugMode(event.target.checked)} style={{ width: 44, height: 44, accentColor: 'var(--hotpink)' }} />
          </label>
          <p style={{ fontSize: 20, color: 'var(--ink-soft)' }}>When on, a Debug button in each game lets you jump to a lesson.</p>
        </AdultDialog>
      )}
    </div>
  )
}

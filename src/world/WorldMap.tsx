// The world map: tap continents to hear their names, tap a country pin to fly there.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { go } from '../router'
import { Mascot, say, sounds } from '../sdk'
import balloon from './assets/balloon.webp'
import crayons from './assets/crayon-box.webp'
import mapArt from './assets/bg-world-map.webp'
import passportArt from './assets/passport.webp'
import { BarPill, FitBox, TopBar } from './kit/Chrome'
import { WORLD_LINES } from './lines'
import { places, type PlaceEntry } from './registry'
import { totalStamps, usePassport } from './stamps'
import { Travel } from './Travel'

// Hotspots in % of the map picture (x, y = centre; w, h = size).
const CONTINENTS: { key: keyof typeof WORLD_LINES.continents; x: number; y: number; w: number; h: number }[] = [
  { key: 'northAmerica', x: 17, y: 26, w: 26, h: 30 },
  { key: 'southAmerica', x: 25, y: 64, w: 15, h: 30 },
  { key: 'europe', x: 50, y: 24, w: 16, h: 16 },
  { key: 'africa', x: 49, y: 56, w: 18, h: 32 },
  { key: 'asia', x: 76, y: 27, w: 34, h: 30 },
  { key: 'australia', x: 85, y: 71, w: 16, h: 18 },
  { key: 'antarctica', x: 50, y: 95, w: 80, h: 10 },
]

const COMING_SOON: { id: keyof typeof WORLD_LINES.soon; emoji: string; x: number; y: number }[] = [
  { id: 'egypt', emoji: '🐪', x: 53, y: 42 },
  { id: 'china', emoji: '🐼', x: 77, y: 36 },
  { id: 'thailand', emoji: '🐘', x: 74, y: 49 },
]
const HOME = { x: 19, y: 33 }

function Pin({ x, y, children, label, onTap, glow, dim }: { x: number; y: number; children: ReactNode; label: string; onTap: () => void; glow?: boolean; dim?: boolean }) {
  return (
    <motion.button
      aria-label={label}
      whileTap={{ scale: 0.85 }}
      animate={glow ? { y: [0, -8, 0] } : {}}
      transition={{ repeat: Infinity, duration: 1.4 }}
      onClick={(e) => {
        e.stopPropagation()
        onTap()
      }}
      className={glow ? 'world-glow' : undefined}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        translate: '-50% -50%',
        width: 'clamp(56px, 11cqw, var(--target))',
        aspectRatio: '1',
        borderRadius: '50%',
        background: dim ? 'rgba(255,255,255,0.75)' : '#fff',
        border: `5px solid ${glow ? 'var(--gold)' : '#fff'}`,
        boxShadow: 'var(--shadow)',
        display: 'grid',
        placeItems: 'center',
        fontSize: 'clamp(28px, 5.5cqw, 48px)',
        zIndex: 3,
      }}
    >
      {children}
    </motion.button>
  )
}

export function WorldMap() {
  const passport = usePassport()
  const [label, setLabel] = useState<{ text: string; x: number; y: number } | null>(null)
  const [travelTo, setTravelTo] = useState<PlaceEntry | null>(null)
  const firstTime = passport.visited.length === 0

  useEffect(() => {
    void say(firstTime ? WORLD_LINES.firstHello : WORLD_LINES.hello, { interrupt: false })
    // Only on arrival.
  }, [firstTime])

  const show = (text: string, x: number, y: number) => {
    sounds.pop()
    setLabel({ text, x, y })
    void say(text)
  }

  return (
    <div className="screen decorated" style={{ padding: 'var(--top-clear) 16px calc(var(--safe-bottom) + 12px)', overflow: 'hidden' }}>
      <TopBar icon="🏠" label="Home" onBack={go.home}>
        <BarPill>🌍 Around the World</BarPill>
      </TopBar>

      <div className="world-split" style={{ flex: 1, minHeight: 0, gap: 'min(16px, 2vh)', alignItems: 'center' }}>
        <FitBox ratio={1.5}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--shadow)', border: '5px solid #fff', background: `url(${mapArt}) center / cover` }} onClick={() => setLabel(null)}>
            {CONTINENTS.map((c) => (
              <button
                key={c.key}
                aria-label={c.key}
                onClick={(e) => {
                  e.stopPropagation()
                  show(WORLD_LINES.continents[c.key], c.x, c.y)
                }}
                style={{ position: 'absolute', left: `${c.x - c.w / 2}%`, top: `${c.y - c.h / 2}%`, width: `${c.w}%`, height: `${c.h}%`, borderRadius: '50%' }}
              />
            ))}
          </div>

          {/* Home + Sparkle's balloon */}
          <Pin x={HOME.x} y={HOME.y} label="home" onTap={() => show(WORLD_LINES.home, HOME.x, HOME.y)}>
            🏡
          </Pin>
          <motion.img
            src={balloon}
            alt=""
            animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 3 }}
            style={{ position: 'absolute', left: `${HOME.x + 5}%`, top: `${HOME.y - 26}%`, width: '9%', zIndex: 2 }}
          />

          {places.map(({ meta }) => (
            <Pin
              key={meta.id}
              x={meta.mapPos.x}
              y={meta.mapPos.y}
              label={meta.name}
              glow
              onTap={() => {
                sounds.sparkle()
                setTravelTo(places.find((p) => p.meta.id === meta.id) ?? null)
              }}
            >
              {meta.emoji}
            </Pin>
          ))}
          {COMING_SOON.filter((c) => !places.some((p) => p.meta.id === c.id)).map((c) => (
            <Pin key={c.id} x={c.x} y={c.y} label={`${c.id} coming soon`} dim onTap={() => show(WORLD_LINES.soon[c.id], c.x, c.y)}>
              <span style={{ opacity: 0.55 }}>{c.emoji}</span>
              <span style={{ position: 'absolute', right: '-14%', bottom: '-14%', fontSize: '55%' }}>☁️</span>
            </Pin>
          ))}

          <AnimatePresence>
            {label && (
              <motion.div
                key={label.text}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{
                  position: 'absolute',
                  left: `${Math.min(80, Math.max(20, label.x))}%`,
                  top: `${label.y > 50 ? label.y - 14 : label.y + 12}%`,
                  translate: '-50% -50%',
                  background: '#fff',
                  borderRadius: 999,
                  padding: '8px 20px',
                  fontSize: 'clamp(16px, 3cqw, 30px)',
                  fontWeight: 700,
                  color: 'var(--hotpink)',
                  boxShadow: 'var(--shadow)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 4,
                }}
              >
                {label.text.split('!')[0]}!
              </motion.div>
            )}
          </AnimatePresence>
        </FitBox>

        <div className="world-side" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'min(20px, 3vw)', flexShrink: 0 }}>
          <div className="world-side-mascot">
            <Mascot pose="wave" size={Math.min(170, window.innerHeight * 0.2)} />
          </div>
          <SideButton img={passportArt} label="My passport" color="var(--pink)" badge={totalStamps(passport)} onClick={() => go.world('passport')} />
          <SideButton img={crayons} label="Coloring book" color="var(--butter)" onClick={() => go.world('coloring')} />
        </div>
      </div>

      {travelTo && <Travel entry={travelTo} onDone={() => go.world(travelTo.meta.id)} />}
    </div>
  )
}

function SideButton({ img, label, color, onClick, badge }: { img: string; label: string; color: string; onClick: () => void; badge?: number }) {
  return (
    <motion.button
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        sounds.pop()
        onClick()
      }}
      style={{ position: 'relative', width: 'clamp(88px, min(18vw, 17vh), 150px)', aspectRatio: '1', borderRadius: 32, background: color, boxShadow: 'var(--shadow)', border: '5px solid #fff', display: 'grid', placeItems: 'center', padding: 8 }}
    >
      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      {badge !== undefined && badge > 0 && (
        <span style={{ position: 'absolute', top: -10, right: -10, background: 'var(--hotpink)', color: '#fff', borderRadius: 999, minWidth: 44, height: 44, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 24, boxShadow: 'var(--shadow)', padding: '0 8px' }}>{badge}</span>
      )}
    </motion.button>
  )
}

// Kaylee's passport: one page per country with its flag, friend, stamps, stickers and tap-to-hear facts.
import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { go } from '../router'
import { Mascot, say, sounds, useSayOnMount } from '../sdk'
import { BarPill, TopBar } from './kit/Chrome'
import { Flag } from './kit/Flag'
import { WORLD_LINES } from './lines'
import { places } from './registry'
import { usePassport } from './stamps'
import type { PlaceMeta } from './types'

const card = { background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: 'clamp(12px, 2.5vw, 24px)' } as const

function Tap({ onTap, children, label, style }: { onTap: () => void; children: ReactNode; label: string; style?: CSSProperties }) {
  return (
    <motion.button
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        sounds.pop()
        onTap()
      }}
      style={style}
    >
      {children}
    </motion.button>
  )
}

function PlacePage({ meta, stamps }: { meta: PlaceMeta; stamps: string[] }) {
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16, border: '6px solid var(--pink)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 3vw, 24px)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Tap label={meta.name} onTap={() => void say(meta.passportLine)}>
          <Flag id={meta.flag} width="clamp(150px, 30vw, 260px)" />
        </Tap>
        <Tap label={meta.friend.name} onTap={() => void say(meta.passportLine)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={meta.friend.img} alt="" style={{ height: 'clamp(90px, 16vw, 150px)' }} />
          <span style={{ fontSize: 'clamp(30px, 6vw, 54px)', fontWeight: 700, color: 'var(--hotpink)' }}>{meta.name}</span>
        </Tap>
      </div>

      {/* Stamps: each is also the sticker she earned. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(88px, 16vw, 130px), 1fr))', gap: 12 }}>
        {meta.activities.map((a, i) => {
          const have = stamps.includes(a.id)
          return (
            <Tap
              key={a.id}
              label={have ? a.sticker.name : 'empty stamp'}
              onTap={() => void say(have ? a.sticker.fact : WORLD_LINES.passportMore)}
              style={{ aspectRatio: '1', borderRadius: '50%', border: have ? '6px dashed var(--hotpink)' : '6px dashed var(--lavender-dark)', background: have ? 'var(--cream)' : 'rgba(217,204,255,0.25)', display: 'grid', placeItems: 'center', rotate: `${(i % 2 ? 1 : -1) * 8}deg`, position: 'relative' }}
            >
              {have ? <img src={a.sticker.img} alt="" style={{ width: '78%', height: '78%', objectFit: 'contain' }} /> : <span style={{ fontSize: 'clamp(30px, 6vw, 48px)', opacity: 0.35 }}>{a.icon}</span>}
            </Tap>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {meta.facts.map((f) => (
          <Tap
            key={f.label}
            label={f.label}
            onTap={() => void say(f.say)}
            style={{ minHeight: 88, minWidth: 88, borderRadius: 28, background: 'var(--lavender)', boxShadow: 'var(--shadow)', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 'clamp(18px, 2.6vw, 26px)', fontWeight: 600 }}
          >
            <span style={{ fontSize: 'clamp(30px, 5vw, 44px)' }}>{f.icon}</span>
            {f.label}
          </Tap>
        ))}
      </div>
    </div>
  )
}

export function Passport() {
  const passport = usePassport()
  useSayOnMount(WORLD_LINES.passport)
  return (
    <div className="screen decorated" style={{ paddingTop: 'var(--top-clear)', gap: 20 }}>
      <TopBar icon="🌍" label="World map" onBack={() => go.world()}>
        <BarPill>📕 My Passport</BarPill>
      </TopBar>
      <div style={{ width: '100%', maxWidth: 980, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {places.map(({ meta }) => (
          <PlacePage key={meta.id} meta={meta} stamps={passport.stamps[meta.id] ?? []} />
        ))}
        <Tap label="More places coming" onTap={() => void say(WORLD_LINES.passportMore)} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, border: '6px dashed var(--lavender-dark)', background: 'rgba(255,255,255,0.7)' }}>
          <Mascot pose="think" size={110} bounce={false} />
          <span style={{ fontSize: 'clamp(40px, 7vw, 60px)' }}>🐪 🐼 🐘</span>
        </Tap>
      </div>
    </div>
  )
}

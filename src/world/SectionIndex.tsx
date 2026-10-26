// #/world/sections: every country, activity and section as a link, for testing on the iPad (the home-screen app has
// no address bar). Tests read the links from this page too (tests/sections.spec.ts). The 🎥 chip opens every link in
// the camera lab instead (?cam=1, for the 3D scenes).
import { useState } from 'react'
import { go, worldLink } from '../router'
import { TopBar } from './kit/Chrome'
import { HUB } from './kit/sections'
import { places, sectionsFor } from './registry'

const chip = { display: 'inline-block', padding: '10px 16px', borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow)', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' } as const

export function SectionIndex() {
  const [cam, setCam] = useState(false)
  const lab: Record<string, string> = cam ? { cam: '1' } : {}
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', background: 'var(--cream)', padding: 'calc(var(--safe-top) + 100px) 16px 40px' }}>
      <TopBar icon="🌍" label="World map" onBack={() => go.world()} />
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <a href="#/world/characters" style={chip}>
            🧸 3D characters
          </a>
          <a href="#/world/puppets" style={chip}>
            🎭 2D puppets
          </a>
          <button onClick={() => setCam((c) => !c)} aria-pressed={cam} style={{ ...chip, border: 'none', font: 'inherit', cursor: 'pointer', ...(cam ? { background: 'var(--ink)', color: '#fff' } : {}) }}>
            🎥 Camera lab {cam ? 'on' : 'off'}
          </button>
        </div>
        {places.map(({ meta }) => (
          <section key={meta.id}>
            <h2 style={{ margin: '0 0 10px' }}>
              {meta.emoji} {meta.name}
            </h2>
            {[...(sectionsFor(meta.id, HUB) ? [{ id: HUB, name: 'Home base', icon: '🏠' }] : []), ...meta.activities, ...(meta.inTheWorks ?? []).map((a) => ({ ...a, name: `🚧 ${a.name}` })), { id: 'party', name: 'Finale', icon: '🎉' }].map((a) => {
              const def = sectionsFor(meta.id, a.id)
              const stamps: Record<string, string> = a.id === 'party' ? { stamps: 'all' } : {}
              return (
                <div key={a.id} style={{ background: 'rgba(255,255,255,.6)', borderRadius: 20, padding: 12, marginBottom: 10 }}>
                  <a data-activity={`${meta.id}/${a.id}`} href={worldLink(meta.id, a.id, undefined, { ...stamps, ...lab })} style={{ ...chip, background: 'var(--pink)', color: '#fff' }}>
                    {a.icon} {a.name}
                  </a>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {def?.sections.map((s, i) => (
                      <a key={s.id} data-section={`${meta.id}/${a.id}/${s.id}`} href={worldLink(meta.id, a.id, s.id, { ...stamps, ...lab })} style={chip} title={s.params?.map((p) => `${p}: ${def.params[p].doc ?? ''}`).join('\n')}>
                        {i + 1}. {s.name} <small style={{ opacity: 0.6 }}>/{s.id}</small>
                      </a>
                    )) ?? <small style={{ opacity: 0.6 }}>no sections yet</small>}
                  </div>
                </div>
              )
            })}
          </section>
        ))}
      </div>
    </div>
  )
}

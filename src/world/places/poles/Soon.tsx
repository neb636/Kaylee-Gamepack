// An activity (or the finale) that isn't built yet: its link opens a "coming soon" card, so the section index, the tests
// and Dad's links all land somewhere. Each greybox replaces its card with the real thing.
import { useEffect } from 'react'
import { BigButton, sounds } from '../../../sdk'
import { useSections, type ActivitySections } from '../../kit/sections'

export function Soon({ def, icon, name, onBack }: { def: ActivitySections; icon: string; name: string; onBack: () => void }) {
  const { start, enter } = useSections(def)
  useEffect(() => {
    enter(start ?? def.sections[0].id)
    sounds.sparkle()
  }, [enter])
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#D3EEFF, #F6EEFF)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'min(24px, 4vh)', padding: 'var(--top-clear) 20px calc(var(--safe-bottom) + 28px)' }}>
      <div style={{ fontSize: 'clamp(64px, min(16vw, 16vh), 140px)' }}>{icon}</div>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '14px 28px', boxShadow: 'var(--shadow)', fontSize: 'clamp(22px, min(4vw, 5vh), 38px)', fontWeight: 600, textAlign: 'center', maxWidth: 640 }}>
        🚧 {name} is coming soon!
      </div>
      <BigButton onClick={onBack} ariaLabel="Back to the globe">
        🌍 ▶
      </BigButton>
    </div>
  )
}

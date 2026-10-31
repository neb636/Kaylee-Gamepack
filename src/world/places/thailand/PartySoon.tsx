// Thailand's finale will be the whole family's party at Agong's house (a later gate). Until then: a "soon" card.
import { useEffect } from 'react'
import { BigButton, sounds } from '../../../sdk'
import { useSections } from '../../kit/sections'
import PARTY_SECTIONS from './activities/Party.sections'

export function PartySoon({ backToMap }: { backToMap: () => void }) {
  const { enter } = useSections(PARTY_SECTIONS)
  useEffect(() => {
    enter('soon')
    sounds.sparkle()
  }, [enter])
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#A8DCFF, #FFE4D4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'min(24px, 4vh)', padding: 'var(--top-clear) 20px calc(var(--safe-bottom) + 28px)' }}>
      <div style={{ fontSize: 'clamp(64px, min(16vw, 16vh), 140px)' }}>🎉🏠🎉</div>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '14px 28px', border: '3px solid var(--ink)', boxShadow: 'var(--talk-drop)', fontSize: 'clamp(22px, min(4vw, 5vh), 38px)', fontWeight: 600, textAlign: 'center', maxWidth: 640 }}>
        The family party at Agong's house is coming soon!
      </div>
      <BigButton onClick={backToMap} ariaLabel="Back to Agong's house">
        🏠 ▶
      </BigButton>
    </div>
  )
}

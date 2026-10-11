// What fills this activity's window in Luna's explorer journal once she has its stamp (found automatically by Place.tsx).
import { art } from './art'

export default function JournalTile() {
  return (
      // Rosa leaping under the rainbow she made.
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <svg viewBox="-60 -60 120 66" style={{ position: 'absolute', inset: '4% 0 auto', width: '100%' }}>
          {['#FF6B6B', '#FFB347', '#FFE27A', '#8FE3C8', '#7FB2FF'].map((c, k) => (
            <path key={c} d={`M${-54 + k * 7} 0A${54 - k * 7} ${54 - k * 7} 0 0 1 ${54 - k * 7} 0`} fill="none" stroke={c} strokeWidth="7.5" />
          ))}
        </svg>
        <img src={art.rosa} alt="" style={{ position: 'absolute', left: '12%', bottom: '8%', width: '76%', objectFit: 'contain', rotate: '-12deg' }} />
      </div>
  )
}

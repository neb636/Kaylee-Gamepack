// What fills this activity's window in Luna's explorer journal once she has its stamp (found automatically by Place.tsx).
import { useSaved } from '../../../../../sdk'
import { HatShape } from '../../puppets/Alpaca'
import { HATS_KEY } from './FluffyDay'

export default function JournalTile() {
  const [hats] = useSaved<Record<string, string | null> | null>(HATS_KEY, null)
  return (
      // The three pompom hats she picked for Luna, Paco and Abuela.
      <svg viewBox="-190 -80 380 170" style={{ width: '100%', height: '100%' }}>
        {(['luna', 'paco', 'abuela'] as const).map((w, k) => (
          <g key={w} transform={`translate(${(k - 1) * 120} 0)`}>
            <HatShape color={hats?.[w] ?? ['pink', 'brown', 'hotpink'][k]} />
          </g>
        ))}
      </svg>
  )
}

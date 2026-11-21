// The Team Cabin: a STAND-IN until the cabin's builder makes it (planning/around-the-world/canada-round-2.md,
// "4. The Team Cabin"). It keeps the map's hut going somewhere.
import { BigButton } from '../../../../../sdk'
import type { CanadaActivityProps } from '../props'

export function TeamCabin({ onBack }: CanadaActivityProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F6E3CF', display: 'grid', placeItems: 'center' }}>
      <BigButton onClick={onBack}>🧣</BigButton>
    </div>
  )
}

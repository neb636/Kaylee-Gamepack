// Misty's Bubble Bath: a STAND-IN until the bath's builder makes the game (planning/around-the-world/
// canada-round-2.md, "1. Misty's Bubble Bath"). It keeps the chapter's flow (film, game, film, stamp) running.
import { BigButton } from '../../../../../sdk'
import type { CanadaActivityProps } from '../props'

export function BubbleBath({ onDone }: CanadaActivityProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#CFEDE6', display: 'grid', placeItems: 'center' }}>
      <BigButton onClick={onDone}>🛁</BigButton>
    </div>
  )
}

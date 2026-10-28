// The finale in Ottawa (Animal Homes on the map, then Pond Hockey on the frozen canal): a "coming soon" card until it's
// built.
import { Soon } from '../../../../kit/Soon'
import type { CanadaActivityProps } from '../props'
import PARTY from './sections'

export function Finale({ onBack }: CanadaActivityProps) {
  return <Soon def={PARTY} icon="🏒" name="Animal Homes + Pond Hockey" onBack={onBack} back={{ icon: '🚂', label: 'Back to the train' }} />
}

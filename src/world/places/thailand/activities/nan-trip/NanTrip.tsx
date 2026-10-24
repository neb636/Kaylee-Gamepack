// The Nan road trip (plan: planning/around-the-world/thailand/nan-trip.md). Still in the works (meta.ts `inTheWorks`):
// only its links open it. So far, the greybox of its headline toy, the mountain road (drive/, section drive): Kaylee
// steers Mommy's silver Pajero along one of the four roads, and the end card takes her down another. The trip around it
// (the plane, the rental desk, the Nan map, the four stops and home) comes in the next steps of the plan.
import { useEffect, useState } from 'react'
import { useSections } from '../../../../kit/sections'
import { Drive } from './drive/Drive'
import type { RoadId } from './drive/roads'
import NAN_SECTIONS from './sections'

export function NanTrip() {
  const { param, enter } = useSections(NAN_SECTIONS)
  // (Read once: the address changes as she plays.)
  const [road, setRoad] = useState(() => param('road') as RoadId)
  useEffect(() => {
    enter('drive', { road })
  }, [road])
  return <Drive road={road} onRoad={setRoad} />
}

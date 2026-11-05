// The Koh Samet trip (plan: planning/around-the-world/thailand/samet-trip.html). In the works: greybox 2 is the island
// to roam (island/), the hub a bare link opens; greybox 1 is the jet ski at Hat Sai Kaew (jetski/), opened from its
// stop on the island (and back to the island, its flag up, after a race she wins). The animal book, the other stops
// and the trip frame (packing, the speedboat, home) come one greybox at a time.
import { useEffect, useState } from 'react'
import { useSections } from '../../../../kit/sections'
import { IslandScreen } from './island/IslandScreen'
import type { RoundId, SpotId, StopId } from './island/layout'
import type { TimeOfDay } from './island/scenery'
import { JetSkiScreen } from './jetski/JetSkiScreen'
import SAMET_SECTIONS, { FLAGS } from './sections'

const readFlags = (s: string): StopId[] => (s === 'all' ? [...FLAGS] : (s.split(',').filter((f) => (FLAGS as readonly string[]).includes(f)) as StopId[]))

export function SametTrip() {
  const { start, param, enter } = useSections(SAMET_SECTIONS)
  const [sec, setSec] = useState(() => ({ id: start ?? 'island', n: 0, at: param('at') as SpotId, flags: readFlags(param('flags')), round: param('round') as RoundId }))
  const time = (param('time') || null) as TimeOfDay | null
  const flagParam = (f: StopId[]) => (f.length === FLAGS.length ? 'all' : f.join(',') || undefined)
  // The island says where it is when it opens (the jet ski says its round itself).
  useEffect(() => {
    if (sec.id === 'island') enter('island', { at: sec.at, flags: flagParam(sec.flags), time: time ?? undefined })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec.n])
  if (sec.id === 'jetski')
    return (
      <JetSkiScreen
        key={sec.n}
        round={sec.round}
        onRound={(round) => enter('jetski', { round })}
        onIsland={() => {
          const flags = sec.flags.includes('jetski') ? sec.flags : [...sec.flags, 'jetski' as StopId]
          setSec((s) => ({ ...s, id: 'island', n: s.n + 1, at: 'saikaew', flags }))
          enter('island', { at: 'saikaew', flags: flagParam(flags) })
        }}
      />
    )
  return (
    <IslandScreen
      key={sec.n}
      start={{ at: sec.at, flags: sec.flags, time }}
      onAt={(at) => enter('island', { at, flags: flagParam(sec.flags), time: time ?? undefined })}
      onOpen={(stop) => {
        if (stop !== 'jetski') return
        setSec((s) => ({ ...s, id: 'jetski', n: s.n + 1, round: 'ride' }))
        enter('jetski', { round: 'ride' })
      }}
    />
  )
}

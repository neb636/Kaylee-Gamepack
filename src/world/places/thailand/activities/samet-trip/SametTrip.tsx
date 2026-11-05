// The Koh Samet trip (plan: planning/around-the-world/thailand/samet-trip.html). In the works: greybox 2 is the island
// to roam (island/), the hub a bare link opens; greybox 1 is the jet ski at Hat Sai Kaew (jetski/), opened from its
// stop on the island (and back to the island, its flag up, after a race she wins); greybox 3 is Mommy's phone and the
// animal book (book/, on the island; the `book` section opens it); greybox 4 is the sandcastle at Ao Hin Khok
// (sandcastle/, opened from its stop, and back to the island with its flag up once the moat has filled). The other
// stops and the trip frame (packing, the speedboat, home) come one greybox at a time.
import { useEffect, useRef, useState } from 'react'
import { useSections } from '../../../../kit/sections'
import { IslandScreen } from './island/IslandScreen'
import type { RoundId, SpotId, StopId } from './island/layout'
import type { TimeOfDay } from './island/scenery'
import { bookParam, readBook, type AnimalId } from './book/animals'
import type { BookPhoto } from './book/Book'
import { JetSkiScreen } from './jetski/JetSkiScreen'
import { SandcastleScreen } from './sandcastle/SandcastleScreen'
import type { SandRound } from './sandcastle/sandcastle'
import SAMET_SECTIONS, { FLAGS, SAND_ROUNDS } from './sections'

const readFlags = (s: string): StopId[] => (s === 'all' ? [...FLAGS] : (s.split(',').filter((f) => (FLAGS as readonly string[]).includes(f)) as StopId[]))

export function SametTrip() {
  const { start, param, enter } = useSections(SAMET_SECTIONS)
  const [sec, setSec] = useState(() => ({ id: start ?? 'island', n: 0, at: param('at') as SpotId, flags: readFlags(param('flags')), round: param('round') as RoundId | SandRound }))
  const time = (param('time') || null) as TimeOfDay | null
  const flagParam = (f: StopId[]) => (f.length === FLAGS.length ? 'all' : f.join(',') || undefined)
  // Where she is and what's in her book (the address bar follows both).
  const here = useRef({ at: sec.at, book: readBook(param('book')), phone: param('phone') === '1', photos: {} as Partial<Record<AnimalId, BookPhoto>> })
  const island = (open: boolean, at = here.current.at, book: AnimalId[] = here.current.book) => {
    here.current = { ...here.current, at, book }
    if (open) enter('book', { at, flags: flagParam(sec.flags), book: bookParam(book) })
    else enter('island', { at, flags: flagParam(sec.flags), time: time ?? undefined, book: bookParam(book), phone: here.current.phone ? '1' : undefined })
  }
  // The island (or the book) says where it is when it opens (the jet ski says its round itself).
  useEffect(() => {
    if (sec.id === 'island' || sec.id === 'book') island(sec.id === 'book', sec.at)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec.n])
  if (sec.id === 'sandcastle') {
    const sand = ((SAND_ROUNDS as readonly string[]).includes(sec.round) ? sec.round : 'dig') as SandRound
    return (
      <SandcastleScreen
        key={sec.n}
        round={sand}
        time={time ?? undefined}
        onRound={(round) => enter('sandcastle', { round, flags: flagParam(sec.flags), time: time ?? undefined })}
        onIsland={() => {
          const flags = sec.flags.includes('sandcastle') ? sec.flags : [...sec.flags, 'sandcastle' as StopId]
          here.current.at = 'hinkhok'
          setSec((s) => ({ ...s, id: 'island', n: s.n + 1, at: 'hinkhok', flags }))
        }}
      />
    )
  }
  if (sec.id === 'jetski')
    return (
      <JetSkiScreen
        key={sec.n}
        round={sec.round as RoundId}
        onRound={(round) => enter('jetski', { round })}
        onIsland={() => {
          const flags = sec.flags.includes('jetski') ? sec.flags : [...sec.flags, 'jetski' as StopId]
          here.current.at = 'saikaew'
          setSec((s) => ({ ...s, id: 'island', n: s.n + 1, at: 'saikaew', flags }))
        }}
      />
    )
  return (
    <IslandScreen
      key={sec.n}
      start={{ at: here.current.at, flags: sec.flags, time, book: here.current.book, phone: here.current.phone }}
      photos={here.current.photos}
      onPhotos={(p) => (here.current.photos = p)}
      onPhone={(on) => {
        here.current.phone = on
        island(false)
      }}
      bookOpen={sec.id === 'book'}
      onAt={(at) => island(false, at)}
      onBook={(book, open) => island(open, here.current.at, book)}
      onOpen={(stop) => {
        if (stop === 'sandcastle') {
          setSec((s) => ({ ...s, id: 'sandcastle', n: s.n + 1, round: 'dig' }))
          return enter('sandcastle', { round: 'dig', flags: flagParam(sec.flags) })
        }
        if (stop !== 'jetski') return
        setSec((s) => ({ ...s, id: 'jetski', n: s.n + 1, round: 'ride' }))
        enter('jetski', { round: 'ride' })
      }}
    />
  )
}

// The Koh Samet trip (plan: planning/around-the-world/thailand/samet-trip.md). In the works: greybox 2 is the island
// to roam (island/), the hub a bare link opens; greybox 1 is the jet ski at Hat Sai Kaew (jetski/), opened from its
// stop on the island (and back to the island, its flag up, after a race she wins); greybox 3 is Mommy's phone and the
// animal book (book/, on the island; the `book` section opens it); greybox 4 is the sandcastle at Ao Hin Khok
// (sandcastle/, opened from its stop, and back to the island with its flag up once the moat has filled); greybox 5 is
// snorkeling at Ko Kudi (snorkel/, opened from the snorkel boat at Ao Wong Duan, and back there with its flag up and the
// fish she snapped in her book once the cuttlefish has turned pink); greybox 6 is lunch on the deck at Ao Prao and hide
// and seek by the driftwood tree (hideseek/: lunch opens from the deck's table, hide and seek from the tree, back to
// the island with its flag up once she has won her turn to hide). Greybox 7 is the trip frame: packing in Kaylee's room
// (pack, the first trip of a session from the Thailand map's 🏝️ pin), the speedboat from Ban Phe to Na Dan pier
// (speedboat/), the island saved on the iPad as she plays (where she was, the flags, her book, what she packed: a link's
// params win over it), and home: with all four flags up the speedboat at Na Dan takes them home, Mommy's photo goes on
// Agong's wall and the stamp lands on the 🏝️ pin. Step 9 is the finale (finale/): with all four flags up the
// driftwood tree opens the sunset at Ao Prao (Mommy's photo of the three of them), then the fire show on Sai Kaew at
// night, and its 🏠 takes them home (the sunset photo on Agong's wall, the stamp). Finding her way (#357, card B): on
// the island the top-left button is the map button (like the rest of Thailand) and the puppy has his own button in the
// top-right; inside a stop the top-left goes back to the beach. The next visit lands her on the beach she left.
import { useEffect, useRef, useState } from 'react'
import { useSaved } from '../../../../../sdk'
import { flag } from '../../../../engine3d/flags'
import { useSections } from '../../../../kit/sections'
import { useTopLeft } from '../../../../kit/topLeft'
import { formatPacked, parsePacked } from '../../trip/packing'
import { addWallPhoto, shrinkPhoto, today, useWallPhotos } from '../../trip/wall-photos'
import { PackScreen } from './PackScreen'
import { SpeedboatScreen } from './speedboat/SpeedboatScreen'
import { NEW_TRIP, SAMET_PACKED, SAMET_SAVE_KEY, type SametProgress } from './trip'
import { IslandScreen } from './island/IslandScreen'
import type { RoundId, SpotId, StopId } from './island/layout'
import type { TimeOfDay } from './island/scenery'
import { bookParam, readBook, type AnimalId } from './book/animals'
import type { BookPhoto } from './book/Book'
import { JetSkiScreen } from './jetski/JetSkiScreen'
import { SandcastleScreen } from './sandcastle/SandcastleScreen'
import { SnorkelScreen } from './snorkel/SnorkelScreen'
import { HideSeekScreen } from './hideseek/HideSeekScreen'
import { LunchScreen } from './hideseek/LunchScreen'
import type { HideRound } from './hideseek/hideseek'
import type { SnorkelRound } from './snorkel/snorkel'
import type { SandRound } from './sandcastle/sandcastle'
import { SunsetScreen } from './finale/SunsetScreen'
import { FireShowScreen } from './finale/FireShowScreen'
import type { FireRound } from './finale/fireshow'
import SAMET_SECTIONS, { FIRE_ROUNDS, FLAGS, HIDE_ROUNDS, SAND_ROUNDS, SNORKEL_ROUNDS, SPOTS } from './sections'

const readFlags = (s: string): StopId[] => (s === 'all' ? [...FLAGS] : (s.split(',').filter((f) => (FLAGS as readonly string[]).includes(f)) as StopId[]))

interface Props {
  /** Home: Mommy's photo is on Agong's wall: the stamp. */
  onDone?: () => void
  /** Home on the speedboat before the island is done (the home picture at Na Dan pier): back to the Thailand map. */
  onExit?: () => void
}

/** Which beach each stop's world is on (its top-left button goes back there). */
const STOP_BEACH: Record<string, SpotId> = { jetski: 'saikaew', sandcastle: 'hinkhok', snorkel: 'wongduan', deck: 'deck', hideseek: 'prao', sunset: 'prao', fireshow: 'saikaew', book: 'saikaew' }

export function SametTrip({ onDone, onExit }: Props = {}) {
  const { start, param, enter } = useSections(SAMET_SECTIONS)
  // What the iPad saved: where she was, the flags, her book and her suitcase. A link's own params win.
  const [saved, setSaved] = useSaved<SametProgress>(SAMET_SAVE_KEY, NEW_TRIP)
  const [first] = useState(() => ({
    at: flag('at') ?? saved.at ?? param('at'),
    flags: flag('flags') ?? saved.flags,
    book: flag('book') ?? saved.book,
    // (A new packing starts with an empty suitcase.)
    packed: parsePacked(flag('packed') ?? (start === 'pack' ? '' : saved.packed || SAMET_PACKED)),
  }))
  const [sec, setSec] = useState(() => ({ id: start ?? 'island', n: 0, at: (SPOTS as readonly string[]).includes(first.at) ? (first.at as SpotId) : 'nadan', flags: readFlags(first.flags), round: param('round') as RoundId | SandRound | SnorkelRound | HideRound | FireRound }))
  const time = (param('time') || null) as TimeOfDay | null
  const reefRound = useRef<SnorkelRound>('float')
  /** Mommy's photo of the three of them at sunset (for Agong's wall). */
  const sunsetPhoto = useRef<string | null>(null)
  const flagParam = (f: StopId[]) => (f.length === FLAGS.length ? 'all' : f.join(',') || undefined)
  const [packed, setPacked] = useState<string[]>(first.packed)
  const packedRef = useRef(packed)
  packedRef.current = packed
  // Where she is and what's in her book (the address bar follows both).
  const here = useRef({ at: sec.at, book: readBook(first.book), phone: param('phone') === '1', photos: {} as Partial<Record<AnimalId, BookPhoto>> })
  /** Remember the trip on the iPad (the next visit lands her back here). */
  const save = (flags: StopId[] = sec.flags) => setSaved((p) => ({ ...p, at: here.current.at, flags: flags.join(','), book: here.current.book.join(','), packed: formatPacked(packedRef.current) || p.packed }))
  const island = (open: boolean, at = here.current.at, book: AnimalId[] = here.current.book) => {
    here.current = { ...here.current, at, book }
    save()
    const p = formatPacked(packedRef.current)
    if (open) enter('book', { at, flags: flagParam(sec.flags), book: bookParam(book) })
    else enter('island', { at, flags: flagParam(sec.flags), time: time ?? undefined, book: bookParam(book), phone: here.current.phone ? '1' : undefined, packed: p })
  }
  // The island (or the book) says where it is when it opens (the jet ski says its round itself).
  useEffect(() => {
    if (sec.id === 'island' || sec.id === 'book') island(sec.id === 'book', sec.at)
    else if (sec.id === 'pack') enter('pack', { packed: formatPacked(packedRef.current) })
    else if (sec.id === 'speedboat') enter('speedboat', { packed: formatPacked(packedRef.current), time: time ?? undefined })
    else if (sec.id === 'sunset') enter('sunset', { flags: flagParam(sec.flags) })
    // A link straight to lunch on the deck lands here too, not only a walk up the steps from the island.
    else if (sec.id === 'deck') enter('deck', { flags: flagParam(sec.flags), time: time ?? undefined, book: bookParam(here.current.book) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec.n])

  // Home: Mommy's photo of the island goes on Agong's wall by itself, the trip starts afresh next time (her book stays),
  // then the stamp.
  const [, setWallPhotos] = useWallPhotos()
  const ended = useRef(false)
  const home = (photo: string) => {
    if (ended.current) return
    ended.current = true
    void shrinkPhoto(photo).then((small) => setWallPhotos((list) => addWallPhoto(list, { trip: 'samet-trip', src: small, at: today() })))
    setSaved((p) => ({ ...NEW_TRIP, book: here.current.book.join(','), packed: formatPacked(packedRef.current) || p.packed, trips: (p.trips ?? 0) + 1 }))
    onDone?.()
  }

  // Inside a stop (the jet ski, the sandcastle, the snorkel, lunch, hide and seek, the finale), the top-left button goes
  // back to its beach (no flag), never off Koh Samet. The island, packing and the speedboat keep the shell's map
  // button (the puppy has his own button on the island: IslandScreen).
  const inStop = sec.id !== 'pack' && sec.id !== 'speedboat' && sec.id !== 'island' && sec.id !== 'book'
  useTopLeft(
    inStop
      ? {
          icon: <span style={{ fontSize: 'calc(var(--btn) * 0.5)', lineHeight: 1 }}>🏝️</span>,
          label: 'Back to the beach',
          onBack: () => {
            const at = STOP_BEACH[sec.id] ?? 'saikaew'
            here.current.at = at
            setSec((s) => ({ ...s, id: 'island', n: s.n + 1, at }))
          },
        }
      : null,
  )

  if (sec.id === 'pack')
    return (
      <PackScreen
        packed={packed}
        onPacked={(ids) => {
          setPacked(ids)
          enter('pack', { packed: formatPacked(ids) })
        }}
        onLeg={() => setSec((s) => ({ ...s, id: 'speedboat', n: s.n + 1 }))}
      />
    )
  if (sec.id === 'speedboat')
    return (
      <SpeedboatScreen
        key={sec.n}
        time={time ?? undefined}
        packed={packed}
        onIsland={() => {
          here.current.at = 'nadan'
          setSec((s) => ({ ...s, id: 'island', n: s.n + 1, at: 'nadan' }))
        }}
      />
    )
  if (sec.id === 'sunset')
    return (
      <SunsetScreen
        key={sec.n}
        flags={sec.flags}
        onPhoto={(src) => (sunsetPhoto.current = src)}
        onFireShow={() => {
          setSec((s) => ({ ...s, id: 'fireshow', n: s.n + 1, round: 'twirl' }))
          enter('fireshow', { round: 'twirl', flags: flagParam(sec.flags) })
        }}
      />
    )
  if (sec.id === 'fireshow') {
    const fr = ((FIRE_ROUNDS as readonly string[]).includes(sec.round) ? sec.round : 'twirl') as FireRound
    return (
      <FireShowScreen
        key={sec.n}
        round={fr}
        flags={sec.flags}
        onRound={(round) => enter('fireshow', { round, flags: flagParam(sec.flags) })}
        onHome={(photo) => home(sunsetPhoto.current ?? photo)}
      />
    )
  }
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
  if (sec.id === 'deck')
    return (
      <LunchScreen
        key={sec.n}
        time={time ?? undefined}
        onIsland={() => {
          here.current.at = 'deck'
          setSec((s) => ({ ...s, id: 'island', n: s.n + 1, at: 'deck' }))
        }}
        onHideSeek={() => {
          setSec((s) => ({ ...s, id: 'hideseek', n: s.n + 1, round: '1' }))
          enter('hideseek', { round: '1', flags: flagParam(sec.flags), time: time ?? undefined, book: bookParam(here.current.book) })
        }}
      />
    )
  if (sec.id === 'hideseek') {
    const hs = ((HIDE_ROUNDS as readonly string[]).includes(sec.round) ? sec.round : '1') as HideRound
    return (
      <HideSeekScreen
        key={sec.n}
        round={hs}
        time={time ?? undefined}
        onRound={(round) => enter('hideseek', { round, flags: flagParam(sec.flags), time: time ?? undefined, book: bookParam(here.current.book) })}
        onIsland={() => {
          const flags = sec.flags.includes('hideseek') ? sec.flags : [...sec.flags, 'hideseek' as StopId]
          here.current.at = 'prao'
          setSec((s) => ({ ...s, id: 'island', n: s.n + 1, at: 'prao', flags }))
        }}
      />
    )
  }
  if (sec.id === 'snorkel') {
    const reef = ((SNORKEL_ROUNDS as readonly string[]).includes(sec.round) ? sec.round : 'float') as SnorkelRound
    return (
      <SnorkelScreen
        key={sec.n}
        round={reef}
        onRound={(round) => {
          reefRound.current = round
          enter('snorkel', { round, flags: flagParam(sec.flags), book: bookParam(here.current.book) })
        }}
        onSnap={(animals) => {
          here.current.book = [...here.current.book, ...animals.filter((a) => !here.current.book.includes(a))]
          save()
          enter('snorkel', { round: reefRound.current, flags: flagParam(sec.flags), book: bookParam(here.current.book) })
        }}
        onIsland={(snapped) => {
          const flags = sec.flags.includes('snorkel') ? sec.flags : [...sec.flags, 'snorkel' as StopId]
          here.current.at = 'wongduan'
          here.current.book = [...here.current.book, ...snapped.filter((a) => !here.current.book.includes(a))]
          setSec((s) => ({ ...s, id: 'island', n: s.n + 1, at: 'wongduan', flags }))
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
      start={{ at: here.current.at, flags: sec.flags, time, book: here.current.book, phone: here.current.phone, packed }}
      onHome={home}
      onLeave={() => {
        // Off home on the speedboat: the trip stays saved, so next time she's back on the beach she left (Na Dan pier).
        here.current.at = 'nadan'
        save()
        onExit?.()
      }}
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
        if (stop === 'sunset') {
          setSec((s) => ({ ...s, id: 'sunset', n: s.n + 1 }))
          return enter('sunset', { flags: flagParam(sec.flags) })
        }
        if (stop === 'lunch') {
          setSec((s) => ({ ...s, id: 'deck', n: s.n + 1 }))
          return enter('deck', { flags: flagParam(sec.flags), time: time ?? undefined, book: bookParam(here.current.book) })
        }
        if (stop === 'hideseek') {
          setSec((s) => ({ ...s, id: 'hideseek', n: s.n + 1, round: '1' }))
          return enter('hideseek', { round: '1', flags: flagParam(sec.flags), time: time ?? undefined, book: bookParam(here.current.book) })
        }
        if (stop === 'sandcastle') {
          setSec((s) => ({ ...s, id: 'sandcastle', n: s.n + 1, round: 'dig' }))
          return enter('sandcastle', { round: 'dig', flags: flagParam(sec.flags) })
        }
        if (stop === 'snorkel') {
          setSec((s) => ({ ...s, id: 'snorkel', n: s.n + 1, round: 'float' }))
          return enter('snorkel', { round: 'float', flags: flagParam(sec.flags), book: bookParam(here.current.book) })
        }
        if (stop !== 'jetski') return
        setSec((s) => ({ ...s, id: 'jetski', n: s.n + 1, round: 'ride' }))
        enter('jetski', { round: 'ride' })
      }}
    />
  )
}

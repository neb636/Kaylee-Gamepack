// The Koh Samet trip (notes: planning/around-the-world/thailand/samet-story.md). One story runs through it, "The Lost
// Fireflies": the gecko fire dancers' four fireflies were blown all over the island, and each stop finds one.
//
// How it runs: packing in Kaylee's room (the first trip of a session from the Thailand map's 🏝️ pin), the speedboat
// from Ban Phe to Na Dan pier (speedboat/, a cutscene), then the island (island/): a new trip opens with the way-in
// film at the pier and the pictures of the four beaches (tap one and the green taxi takes her there). Each stop
// (jetski/, sandcastle/, snorkel/, hideseek/) opens from its pink ring with its own way-in film (`round=story`), plays
// its rounds, and ends with its firefly found (`round=found`); back on the island that firefly flies in to join the
// others round her horn and the pictures come up again. A stop already done opens at its first play round. With all
// four, the driftwood tree at Ao Prao opens the finale (finale/): the sunset (Mom's photo of the three of them), then
// the fire show on Sai Kaew at night, which the fireflies light; its 🏠 takes them home (the photo on Agong's wall,
// the stamp). Lunch on the deck above Ao Prao (hideseek/lunch.ts) is a place to visit, not a stop.
//
// The trip is saved on the iPad as she plays (where she was, the fireflies, what she packed: a link's params win over
// it), so the next visit lands her on the beach she left. Inside a stop the top-left button goes back to its beach;
// on the island it is the shell's map button, and the top-right button brings up the pictures.
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
import SAMET_SECTIONS, { FIRE_ROUNDS, FLAGS, HIDE_ROUNDS, JET_ROUNDS, SAND_ROUNDS, SNORKEL_ROUNDS, SPOTS } from './sections'

const readFlags = (s: string): StopId[] => (s === 'all' ? [...FLAGS] : (s.split(',').filter((f) => (FLAGS as readonly string[]).includes(f)) as StopId[]))

interface Props {
  /** Home: Mom's photo is on Agong's wall: the stamp. */
  onDone?: () => void
  /** Home on the speedboat before the island is done (the home picture at Na Dan pier): back to the Thailand map. */
  onExit?: () => void
}

/** Which beach each stop's world is on (its top-left button goes back there). */
const STOP_BEACH: Record<string, SpotId> = { jetski: 'saikaew', sandcastle: 'hinkhok', snorkel: 'wongduan', deck: 'deck', hideseek: 'prao', sunset: 'prao', fireshow: 'saikaew' }
/** A stop's first play round (where it opens once its firefly is found: no film again). */
const FIRST_ROUND: Record<StopId, string> = { jetski: 'ride', sandcastle: 'dig', snorkel: 'float', hideseek: '1' }
/** A round from a link, if this stop has it. */
const roundOf = <R extends string>(list: readonly string[], r: string, or: R) => (list.includes(r) ? r : or) as R

interface Sec {
  id: string
  n: number
  at: SpotId
  flags: StopId[]
  round: string
  /** The island opens with a film (the way in, or all four found), a firefly flying in, or the pictures up. */
  story: 'intro' | 'all' | null
  found: StopId | null
  board: boolean
}

export function SametTrip({ onDone, onExit }: Props = {}) {
  const { start, param, enter } = useSections(SAMET_SECTIONS)
  // What the iPad saved: where she was, the fireflies and her suitcase. A link's own params win.
  const [saved, setSaved] = useSaved<SametProgress>(SAMET_SAVE_KEY, NEW_TRIP)
  const [first] = useState(() => ({
    at: flag('at') ?? saved.at ?? param('at'),
    flags: flag('flags') ?? saved.flags,
    // (A new packing starts with an empty suitcase.)
    packed: parsePacked(flag('packed') ?? (start === 'pack' ? '' : saved.packed || SAMET_PACKED)),
  }))
  const [sec, setSec] = useState<Sec>(() => {
    const flags = readFlags(first.flags)
    const found = param('found') as StopId
    const story = param('story')
    // A plain link to the island (the Thailand map's pin coming back to a trip half done, the shelf's card): she is
    // never dropped there with nothing to go on. No fireflies yet: the story from the start. Some: the pictures.
    const plain = (start ?? 'island') === 'island' && ['at', 'story', 'found', 'board', 'time'].every((k) => flag(k) == null)
    return {
      id: start ?? 'island',
      n: 0,
      at: plain && !flags.length ? 'nadan' : (SPOTS as readonly string[]).includes(first.at) ? (first.at as SpotId) : 'nadan',
      flags,
      round: param('round'),
      story: story === 'intro' || story === 'all' ? story : plain && !flags.length ? 'intro' : null,
      found: (FLAGS as readonly string[]).includes(found) && flags.includes(found) ? found : null,
      board: param('board') === '1' || (plain && flags.length > 0),
    }
  })
  const time = (param('time') || null) as TimeOfDay | null
  /** Mom's photo of the three of them at sunset (for Agong's wall). */
  const sunsetPhoto = useRef<string | null>(null)
  const flagParam = (f: StopId[]) => (f.length === FLAGS.length ? 'all' : f.join(',') || undefined)
  const [packed, setPacked] = useState<string[]>(first.packed)
  const packedRef = useRef(packed)
  packedRef.current = packed
  // Where she is (the address bar follows).
  const here = useRef({ at: sec.at })
  /** Remember the trip on the iPad (the next visit lands her back here). */
  const save = (flags: StopId[] = sec.flags) => setSaved((p) => ({ ...p, at: here.current.at, flags: flags.join(','), packed: formatPacked(packedRef.current) || p.packed }))
  /** The island's address: where she is and her fireflies (and, while they last, the film, the firefly flying in or
   *  the pictures it opened with). */
  const island = (at = here.current.at, extra: { story?: string; found?: string; board?: string } = {}) => {
    here.current = { at }
    save()
    enter('island', { at, flags: flagParam(sec.flags), time: time ?? undefined, packed: formatPacked(packedRef.current), ...extra })
  }
  // A section says where it is when it opens (the stops say their round themselves).
  useEffect(() => {
    if (sec.id === 'island') island(sec.at, { story: sec.story ?? undefined, found: sec.found ?? undefined, board: sec.board ? '1' : undefined })
    else if (sec.id === 'pack') enter('pack', { packed: formatPacked(packedRef.current) })
    else if (sec.id === 'speedboat') enter('speedboat', { packed: formatPacked(packedRef.current), time: time ?? undefined })
    else if (sec.id === 'sunset') enter('sunset', { flags: flagParam(sec.flags) })
    // A link straight to lunch on the deck lands here too, not only a walk up the steps from the island.
    else if (sec.id === 'deck') enter('deck', { flags: flagParam(sec.flags), time: time ?? undefined })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec.n])

  // Home: Mom's photo of the island goes on Agong's wall by itself, the trip starts afresh next time, then the stamp.
  const [, setWallPhotos] = useWallPhotos()
  const ended = useRef(false)
  const home = (photo: string) => {
    if (ended.current) return
    ended.current = true
    void shrinkPhoto(photo).then((small) => setWallPhotos((list) => addWallPhoto(list, { trip: 'samet-trip', src: small, at: today() })))
    setSaved((p) => ({ ...NEW_TRIP, packed: formatPacked(packedRef.current) || p.packed, trips: (p.trips ?? 0) + 1 }))
    onDone?.()
  }

  /** Onto the island (no film, no firefly flying in, the pictures down unless asked). */
  const toIsland = (at: SpotId, more: Partial<Sec> = {}) => {
    here.current.at = at
    setSec((s) => ({ ...s, id: 'island', n: s.n + 1, at, story: null, found: null, board: false, ...more }))
  }
  /** A stop is done: back to its beach with its firefly (the first time: it flies in and the pictures come up; the
   *  fourth: off to the sunset). */
  const stopDone = (stop: StopId) => {
    const isNew = !sec.flags.includes(stop)
    const flags = isNew ? [...sec.flags, stop] : sec.flags
    toIsland(STOP_BEACH[stop], { flags, found: isNew ? stop : null, story: isNew && flags.length === FLAGS.length ? 'all' : null })
  }
  /** Into a stop: its way-in film the first time, straight to its first round once its firefly is found. */
  const openStop = (stop: StopId) => {
    const round = sec.flags.includes(stop) ? FIRST_ROUND[stop] : 'story'
    setSec((s) => ({ ...s, id: stop, n: s.n + 1, round }))
    enter(stop, { round, flags: flagParam(sec.flags), ...(stop === 'jetski' || stop === 'snorkel' ? {} : { time: time ?? undefined }) })
  }

  // Inside a stop (the jet ski, the sandcastle, the snorkel, lunch, hide and seek, the finale), the top-left button goes
  // back to its beach (no firefly), never off Koh Samet. The island, packing and the speedboat keep the shell's map
  // button.
  const inStop = sec.id !== 'pack' && sec.id !== 'speedboat' && sec.id !== 'island'
  useTopLeft(
    inStop
      ? {
          icon: <span style={{ fontSize: 'calc(var(--btn) * 0.5)', lineHeight: 1 }}>🏝️</span>,
          label: 'Back to the beach',
          onBack: () => toIsland(STOP_BEACH[sec.id] ?? 'saikaew'),
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
        // Landing at Na Dan pier: a new trip (no fireflies yet) opens with the way-in film.
        onIsland={() => toIsland('nadan', { story: sec.flags.length ? null : 'intro', board: sec.flags.length > 0 })}
      />
    )
  if (sec.id === 'sunset')
    return (
      <SunsetScreen
        key={sec.n}
        flags={sec.flags}
        onPhoto={(src) => (sunsetPhoto.current = src)}
        onFireShow={() => {
          setSec((s) => ({ ...s, id: 'fireshow', n: s.n + 1, round: 'story' }))
          enter('fireshow', { round: 'story', flags: flagParam(sec.flags) })
        }}
      />
    )
  if (sec.id === 'fireshow')
    return (
      <FireShowScreen
        key={sec.n}
        round={roundOf<FireRound>(FIRE_ROUNDS, sec.round, 'story' as FireRound)}
        flags={sec.flags}
        onRound={(round) => enter('fireshow', { round, flags: flagParam(sec.flags) })}
        onHome={(photo) => home(sunsetPhoto.current ?? photo)}
      />
    )
  if (sec.id === 'sandcastle')
    return (
      <SandcastleScreen
        key={sec.n}
        round={roundOf<SandRound>(SAND_ROUNDS, sec.round, 'story' as SandRound)}
        flags={sec.flags}
        time={time ?? undefined}
        onRound={(round) => enter('sandcastle', { round, flags: flagParam(sec.flags), time: time ?? undefined })}
        onIsland={() => stopDone('sandcastle')}
      />
    )
  if (sec.id === 'deck')
    return (
      <LunchScreen
        key={sec.n}
        time={time ?? undefined}
        onIsland={() => toIsland('deck')}
        onHideSeek={() => {
          // Down the steps: straight to the driftwood tree's game (its way in if Peekaboo is still hiding).
          if (sec.flags.length === FLAGS.length) return toIsland('prao')
          openStop('hideseek')
        }}
      />
    )
  if (sec.id === 'hideseek')
    return (
      <HideSeekScreen
        key={sec.n}
        round={roundOf<HideRound>(HIDE_ROUNDS, sec.round, 'story' as HideRound)}
        flags={sec.flags}
        time={time ?? undefined}
        onRound={(round) => enter('hideseek', { round, flags: flagParam(sec.flags), time: time ?? undefined })}
        onIsland={() => stopDone('hideseek')}
      />
    )
  if (sec.id === 'snorkel')
    return (
      <SnorkelScreen
        key={sec.n}
        round={roundOf<SnorkelRound>(SNORKEL_ROUNDS, sec.round, 'story' as SnorkelRound)}
        flags={sec.flags}
        onRound={(round) => enter('snorkel', { round, flags: flagParam(sec.flags) })}
        onIsland={() => stopDone('snorkel')}
      />
    )
  if (sec.id === 'jetski')
    return (
      <JetSkiScreen
        key={sec.n}
        round={roundOf<RoundId>(JET_ROUNDS, sec.round, 'story' as RoundId)}
        flags={sec.flags}
        onRound={(round) => enter('jetski', { round, flags: flagParam(sec.flags) })}
        onIsland={() => stopDone('jetski')}
      />
    )
  return (
    <IslandScreen
      key={sec.n}
      start={{ at: here.current.at, flags: sec.flags, time, packed, story: sec.story, found: sec.found, board: sec.board }}
      onHome={home}
      onLeave={() => {
        // Off home on the speedboat: the trip stays saved, so next time she's back on the beach she left (Na Dan pier).
        here.current.at = 'nadan'
        save()
        onExit?.()
      }}
      onAt={(at) => island(at)}
      onOpen={(stop) => {
        if (stop === 'sunset') {
          setSec((s) => ({ ...s, id: 'sunset', n: s.n + 1 }))
          return enter('sunset', { flags: flagParam(sec.flags) })
        }
        if (stop === 'lunch') {
          setSec((s) => ({ ...s, id: 'deck', n: s.n + 1 }))
          return enter('deck', { flags: flagParam(sec.flags), time: time ?? undefined })
        }
        openStop(stop)
      }}
    />
  )
}

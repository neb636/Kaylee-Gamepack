// The mall day at ICONSIAM (plan: planning/around-the-world/thailand/mall-trip.md). So far, in shapes and without
// voices: HarborLand's hall (hall/, sections hall and hungry), where she walks between the ways in; the mini games
// behind them: the Vet Clinic (games/vet/, section vet), the Barber Salon (games/barber/, section barber: Daddy keeps
// the hairdo she gives him, `hair`, in the hall and at the pizza table), Cafe & Cake (games/cafe/, section cafe), the
// Racing Slide (games/race/, section race), Little Land (games/blocks/, section blocks), the Golden Mountain
// (games/mountain/, section mountain), Muay Thai (games/boxing/, section boxing), the Sky Pod (games/skypod/,
// section skypod) and the Big Frame (harborland/, section frame: `at` follows the level she's
// on); and the pizza toy at The Pizza Company (pizza/, sections menu and
// share). Each mini game is a sticker on her sock band in the corner (`games`), and a big ↩️ takes her back out to the
// hall. After four stickers (or five minutes) Daddy's tummy rumbles and Mommy asks about pizza. The trip around it
// (Loop.tsx): Mommy asks where to (invite), the goodbye and Mommy's silver Veloz (goodbye), ICONSIAM, the lift and
// the counter where she picks her socks (arrive), and home once Agong's box is shut at the table (home: the box for
// Agong, the photo on his wall, then the stamp, onDone). A day pass covers the change between legs. The trip saves
// after each leg; saying yes to the mall again offers to keep going, and after a whole day 🛝 or 🍕 straight there.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sounds, useSaved } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { TripGuide, type TripGuideHandle } from '../../trip/legs/Guide'
import { BoardingPass, type PassChoice } from '../../trip/legs/BoardingPass'
import { justSaidYes, saidYes } from '../../trip/legs/Ask'
import { MallLoop, type LoopSection } from './Loop'
import { DAY_PASS, legOf, RESUME } from './trip'
import { Barber } from './games/barber/Barber'
import { Blocks } from './games/blocks/Blocks'
import { Boxing } from './games/boxing/Boxing'
import type { Round as BoxingRound } from './games/boxing/layout'
import type { CardId, Round as BlocksRound } from './games/blocks/layout'
import { Cafe } from './games/cafe/Cafe'
import type { Round } from './games/cafe/layout'
import { Mountain } from './games/mountain/Mountain'
import type { Round as MountainRound } from './games/mountain/layout'
import { Race } from './games/race/Race'
import type { Round as SkyRound } from './games/skypod/layout'
import { SkyPod } from './games/skypod/SkyPod'
import { Vet } from './games/vet/Vet'
import { HallScreen } from './hall/HallScreen'
import type { DoorId, GameDoor } from './hall/layout'
import { FrameScreen } from './harborland/FrameScreen'
import type { At } from './harborland/layout'
import type { PizzaId } from './pizza/layout'
import { Pizza } from './pizza/Pizza'
import MALL_SECTIONS, { type MallSection, type PatientId } from './sections'
import { SOCK_COLORS } from './socks'
import { mallVoice } from './voice'

/** What she can play so far: the mini games (any big ride in the Big Frame is `frame`). */
const GAMES = ['vet', 'cafe', 'race', 'barber', 'blocks', 'mountain', 'boxing', 'skypod', 'frame'] as const
type GameId = (typeof GAMES)[number]
/** The first climbing toy's big rides (PR #120's links): they count for the Big Frame. */
const OLD_RIDES = ['pool', 'donut', 'zip', 'roller', 'dragon']
const list = (s: string) => s.split(',').map((x) => (OLD_RIDES.includes(x) ? 'frame' : x)).filter((x): x is GameId => (GAMES as readonly string[]).includes(x))
/** Her sock band: a slot for each mini game she can play (the rest add theirs when they're built). */
const BAND: { id: GameDoor; icon: string }[] = [
  { id: 'vet', icon: '🩺' },
  { id: 'cafe', icon: '🥤' },
  { id: 'barber', icon: '💈' },
  { id: 'race', icon: '🏁' },
  { id: 'frame', icon: '🛝' },
  { id: 'blocks', icon: '🧱' },
  { id: 'mountain', icon: '⛰️' },
  { id: 'boxing', icon: '🥊' },
  { id: 'skypod', icon: '💡' },
]
const bandOf = (games: GameId[]): GameDoor[] => BAND.map((b) => b.id).filter((id) => games.includes(id))
/** The way in each section is behind (where she comes back out). */
const DOOR_OF: Partial<Record<MallSection, DoorId>> = { vet: 'vet', cafe: 'cafe', race: 'race', barber: 'barber', frame: 'frame', blocks: 'blocks', mountain: 'mountain', boxing: 'boxing', skypod: 'skypod' }
/** Daddy gets hungry after four stickers, or this long in HarborLand. */
const HUNGRY_MS = 5 * 60_000
/** The trip's legs around HarborLand (Loop.tsx). */
const LOOP: MallSection[] = ['invite', 'goodbye', 'arrive', 'home']

/** Where the day picks up next time (the start of a leg), and what she had then. */
interface Progress {
  at: MallSection | null
  socks: string
  games: string
  hair: string
  /** Whole days done, Mommy's question to the photo on Agong's wall (after the first: 🛝 or 🍕 straight there). */
  trips?: number
}

interface Props {
  /** ✋ Not yet on Mommy's card. */
  onExit?: () => void
  /** 🚤 on Mommy's card: the boat trip instead. */
  onBoat?: () => void
  /** Home, the photo on the wall: the stamp. */
  onDone?: () => void
}

export function MallTrip({ onExit, onBoat, onDone }: Props = {}) {
  const { start, param, enter } = useSections(MALL_SECTIONS)
  // Old links into the first climbing toy (PR #120's play and dragon) land in the Big Frame.
  const [legacy] = useState(() => (start ? null : (/\/mall-trip\/(play|dragon)(?:[?/]|$)/.exec(location.hash)?.[1] ?? null)))
  const first: MallSection = start ?? (legacy ? 'frame' : 'invite')
  const [saved, setSaved] = useSaved<Progress>('thailand-mall-trip', { at: null, socks: 'pink', games: '', hair: '' })
  // She has done the whole day before (or the link says so).
  const [replay] = useState(() => param('replay') === '1' || (saved.trips ?? 0) > 0)
  const [socks, setSocks] = useState(() => param('socks'))
  const [photos] = useState(() => param('photos'))
  const [patient, setPatient] = useState<PatientId>(() => param('patient') as PatientId)
  // The round of the mini game on screen (the cafe's, the racing slide's): one `round` in the address.
  const [round, setRound] = useState<Round>(() => Number(param('round')) as Round)
  // Little Land keeps its own round (so the cafe's round 3 doesn't carry over), and round 2's picture card.
  const [blocksRound, setBlocksRound] = useState<BlocksRound>(() => (first === 'blocks' ? Number(param('round')) : 1) as BlocksRound)
  const [card, setCard] = useState<CardId>(() => param('card') as CardId)
  // Muay Thai keeps its own round too.
  const [boxingRound, setBoxingRound] = useState<BoxingRound>(() => (first === 'boxing' ? Number(param('round')) : 1) as BoxingRound)
  // The Golden Mountain keeps its own round too.
  const [mountainRound, setMountainRound] = useState<MountainRound>(() => (first === 'mountain' ? Number(param('round')) : 1) as MountainRound)
  // The Sky Pod keeps its own round too.
  const [skyRound, setSkyRound] = useState<SkyRound>(() => (first === 'skypod' ? Number(param('round')) : 1) as SkyRound)
  // (`rides` is the old name of `games`, from PR #120's links. A link past the puppy, or past a mini game's first round,
  // has that game's sticker already.)
  const [games, setGames] = useState<GameId[]>(() => [...new Set([...list(param('games')), ...list(param('rides')), ...(first === 'vet' && patient !== 'puppy' ? ['vet' as const] : []), ...(first === 'cafe' && round > 1 ? ['cafe' as const] : []), ...(first === 'race' && round > 1 ? ['race' as const] : []), ...(first === 'barber' && round > 1 ? ['barber' as const] : []), ...(first === 'blocks' && blocksRound > 1 ? ['blocks' as const] : []), ...(first === 'mountain' && mountainRound > 1 ? ['mountain' as const] : []), ...(first === 'boxing' && boxingRound > 1 ? ['boxing' as const] : []), ...(first === 'skypod' && skyRound > 1 ? ['skypod' as const] : [])])])
  const [section, setSection] = useState<MallSection>(first)
  const [from, setFrom] = useState<DoorId | 'in'>(() => param('from') as DoorId | 'in')
  const [pizza, setPizza] = useState(() => param('pizza') as PizzaId)
  const [at, setAt] = useState<At>(() => (legacy === 'dragon' ? 'top' : (param('at') as At)))
  const [shared, setShared] = useState(() => Number(param('shared')))
  // Daddy's hairdo from the barber: he keeps it for the rest of the trip.
  const [hair, setHair] = useState(() => param('hair'))
  // Daddy's tummy: how many times she's gone into a mini game, and when "More play" said not yet.
  const since = useRef(performance.now())
  const [visits, setVisits] = useState(0)
  const [notYet, setNotYet] = useState(-1)
  const pizzaTime = section === 'menu' || section === 'share'
  const inHall = section === 'hall' || section === 'hungry'
  const onLoop = LOOP.includes(section)
  const band = bandOf(games)
  const hungry = (band.length >= 4 || performance.now() - since.current > HUNGRY_MS) && visits > notYet
  // Everyone's lines play through Sparkle's corner guide (the words show with who said them).
  const guide = useRef<TripGuideHandle>(null)
  useEffect(() => {
    const plain = mallVoice.say
    mallVoice.say = (l) => (guide.current ? guide.current.speak(l) : plain(l))
    return () => {
      mallVoice.say = plain
    }
  }, [])
  const sticker = (id: GameId) => setGames((g) => (g.includes(id) ? g : [...g, id]))

  const params = () => ({
    ...(section === 'invite' || section === 'goodbye' || section === 'arrive' ? { replay: replay ? '1' : '' } : {}),
    ...(section === 'home' ? { photos, pizza } : {}),
    socks,
    games: games.join(','),
    ...(section === 'hall' ? { from } : {}),
    ...(section === 'vet' ? { patient } : {}),
    ...(section === 'cafe' || section === 'race' || section === 'barber' ? { round: String(round) } : {}),
    ...(section === 'blocks' ? { round: String(blocksRound), ...(blocksRound === 2 ? { card } : {}) } : {}),
    ...(section === 'boxing' ? { round: String(boxingRound) } : {}),
    ...(section === 'mountain' ? { round: String(mountainRound) } : {}),
    ...(section === 'skypod' ? { round: String(skyRound) } : {}),
    ...(section === 'frame' ? { at } : {}),
    ...(section === 'share' ? { pizza, shared: String(shared) } : {}),
    ...(section === 'hall' || section === 'barber' || section === 'mountain' || section === 'frame' || pizzaTime ? { hair } : {}),
  })
  useEffect(() => {
    enter(first, params())
    // A link into a leg is where the day picks up next time.
    if (RESUME.includes(first)) setSaved((p) => ({ ...p, at: first }))
  }, [])
  const ready = useRef(false)
  useEffect(() => {
    if (!ready.current) {
      ready.current = true
      return
    }
    enter(section, params())
  }, [section, games, patient, round, blocksRound, mountainRound, boxingRound, skyRound, card, pizza, shared, from, hair, at, socks])

  // ---- The trip around HarborLand: the day pass between legs, resume and replays ----
  const [pass, setPass] = useState<{ punch: string | null; done: string[]; choices?: PassChoice[] } | null>(null)
  const moving = useRef(false)
  const state = useRef({ section, socks, games, hair })
  state.current = { section, socks, games, hair }
  /** The legs punched before `next`'s (leaving out the one being punched now). */
  const doneBefore = (next: MallSection, punch: string | null) => {
    const upto = DAY_PASS.findIndex((p) => p.id === legOf(next))
    return DAY_PASS.slice(0, Math.max(0, upto)).map((p) => p.id as string).filter((id) => id !== punch)
  }
  /** A leg is over: the day pass slides up (punching it), the next leg starts behind it, and it goes. */
  const go = (next: MallSection) => {
    if (moving.current) return
    moving.current = true
    const was = legOf(state.current.section)
    const punch = was && was !== legOf(next) ? was : null
    setPass({ punch, done: doneBefore(next, punch) })
    const st = state.current
    if (RESUME.includes(next)) setSaved((p) => ({ ...p, at: next, socks: st.socks, games: st.games.join(','), hair: st.hair }))
    setTimeout(() => {
      if (next === 'hall') setFrom('in')
      setSection(next)
    }, 900)
    setTimeout(() => {
      setPass(null)
      moving.current = false
    }, 2300)
  }
  /** 🛝🍕 on Mommy's card: straight to the goodbye; or, with a day half done or after her first whole day, where to
   *  start (🚗 the whole day, the next leg's icon to keep going, 🛝 straight to HarborLand, 🍕 straight to the table). */
  const yes = () => {
    if (moving.current) return
    const half = saved.at && saved.at !== 'goodbye' ? saved.at : null
    if (!half && !replay) return go('goodbye')
    const choices: PassChoice[] = [{ label: 'The whole day', icon: '🚗', on: () => choose('goodbye', false) }]
    if (half && !(replay && (half === 'hall' || half === 'menu'))) choices.push({ label: 'Keep going', icon: DAY_PASS.find((p) => p.id === legOf(half))?.icon ?? '▶️', on: () => choose(half, true) })
    if (replay) choices.push({ label: 'Straight to HarborLand', icon: '🛝', on: () => choose('hall', half === 'hall') }, { label: 'Straight to the pizza', icon: '🍕', on: () => choose('menu', half === 'menu') })
    setPass({ punch: null, done: half ? doneBefore(half, null) : [], choices })
  }
  const choose = (next: MallSection, resume: boolean) => {
    sounds.pop()
    setPass(null)
    // Her socks from last time; and, keeping going, her stickers and Daddy's hairdo too.
    if (next !== 'goodbye') setSocks(saved.socks || 'pink')
    if (resume) {
      setGames(list(saved.games))
      setHair(saved.hair)
    }
    setTimeout(() => go(next), 50)
  }
  // A yes in the house (Mommy's card there, 🛝🍕): no asking again.
  useEffect(() => {
    if (section !== 'invite' || !justSaidYes('mall-trip')) return
    saidYes.at = 0
    const t = setTimeout(yes, 600)
    return () => clearTimeout(t)
  }, [])
  // The box is shut at the pizza table: home to Agong.
  const allShared = () => setTimeout(() => state.current.section === 'share' && go('home'), 2200)
  const finishedDay = () => {
    setSaved((p) => ({ at: null, socks: state.current.socks, games: '', hair: '', trips: (p.trips ?? 0) + 1 }))
    onDone?.()
  }

  /** In through a way in. */
  const goIn = (door: GameDoor) => {
    setVisits((v) => v + 1)
    // (The barber starts with Daddy in the chair, whatever round another mini game was on.)
    if (door === 'barber') setRound(1)
    if (door === 'frame') setAt('in')
    setSection(door)
  }
  /** Back out to the hall, by the door she went in. */
  const goOut = () => {
    setFrom(DOOR_OF[section] ?? 'in')
    setSection('hall')
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F1E8FF', overflow: 'clip' }}>
      {onLoop ? (
        <MallLoop
          section={section as LoopSection}
          socks={socks}
          hair={hair}
          pizza={pizza}
          photos={photos}
          replay={replay}
          covered={!!pass}
          onMall={yes}
          onBoat={() => onBoat?.()}
          onNotYet={() => onExit?.()}
          onLeg={(next) => go(next as MallSection)}
          onSocks={setSocks}
          onDone={finishedDay}
        />
      ) : inHall ? (
        <HallScreen
          key={`hall-${visits}`}
          socks={socks}
          hair={hair}
          done={band}
          from={from}
          hungry={hungry || section === 'hungry'}
          asking={section === 'hungry'}
          onEnter={goIn}
          onHungry={() => setSection('hungry')}
          onPizza={() => setSection('menu')}
          onMorePlay={() => {
            setNotYet(visits)
            setFrom('in')
            setSection('hall')
          }}
        />
      ) : section === 'vet' ? (
        <Vet patient={patient} onPatient={setPatient} onHealed={(id) => id === 'puppy' && sticker('vet')} onPlay={goOut} />
      ) : section === 'barber' ? (
        <Barber round={round} hair={hair} onRound={setRound} onHair={setHair} onRevealed={(n) => n === 1 && sticker('barber')} onPlay={goOut} />
      ) : section === 'cafe' ? (
        <Cafe round={round} onRound={setRound} onDrink={() => sticker('cafe')} onPlay={goOut} />
      ) : section === 'race' ? (
        <Race round={round} onRound={(n) => setRound(Math.min(3, n) as Round)} onWon={() => sticker('race')} onPlay={goOut} />
      ) : section === 'blocks' ? (
        <Blocks round={blocksRound} card={card} socks={socks} onRound={setBlocksRound} onCard={setCard} onKnocked={() => sticker('blocks')} onPlay={goOut} />
      ) : section === 'boxing' ? (
        <Boxing round={boxingRound} socks={socks} onRound={setBoxingRound} onWarmedUp={() => sticker('boxing')} onPlay={goOut} />
      ) : section === 'mountain' ? (
        <Mountain round={mountainRound} socks={socks} hair={hair} onRound={setMountainRound} onTop={() => sticker('mountain')} onPlay={goOut} />
      ) : section === 'skypod' ? (
        <SkyPod round={skyRound} socks={socks} onRound={setSkyRound} onSticker={() => sticker('skypod')} onPlay={goOut} />
      ) : pizzaTime ? (
        <Pizza section={section} pizza={pizza} shared={shared} hair={hair} onPizza={setPizza} onServed={() => setSection('share')} onShared={setShared} onAllDone={allShared} />
      ) : section === 'frame' ? (
        <FrameScreen at={at} socks={socks} hair={hair} rode={games.includes('frame')} onAt={setAt} onRide={() => sticker('frame')} />
      ) : null}
      {!inHall && !pizzaTime && !onLoop && (
        <motion.button
          aria-label="Back to the hall"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.86 }}
          onClick={() => {
            sounds.whoosh()
            goOut()
          }}
          style={{ position: 'absolute', left: 'calc(var(--safe-left, 0px) + 12px)', top: 'calc(var(--top-clear, 104px) + 10px)', width: 'clamp(72px, 11vmin, 92px)', height: 'clamp(72px, 11vmin, 92px)', borderRadius: '50%', border: '5px solid #fff', background: 'var(--lavender)', boxShadow: 'var(--shadow)', fontSize: 'clamp(34px, 5.5vmin, 46px)', padding: 0, zIndex: 40 }}
        >
          ↩️
        </motion.button>
      )}
      {!onLoop && <TripGuide ref={guide} />}
      {!pizzaTime && !onLoop && <SockBand done={band} color={SOCK_COLORS[socks] ?? SOCK_COLORS.pink} />}
      <AnimatePresence>{pass && <BoardingPass key="pass" legs={DAY_PASS} done={pass.done} punch={pass.punch} choices={pass.choices} title="DAY PASS" badge="🚗 🛝" route="ICONSIAM · 6F" />}</AnimatePresence>
    </div>
  )
}

/** Her sock band in the corner: a sticker for each mini game she's played, popping in the first time. */
export function SockBand({ done, color }: { done: GameDoor[]; color: string }) {
  return (
    <div
      aria-label={`Stickers: ${done.length} of ${BAND.length}`}
      style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 12px)', top: 'calc(var(--safe-top) + 14px)', display: 'flex', gap: 'clamp(4px, 0.8vw, 8px)', padding: 'clamp(5px, 0.9vw, 8px) clamp(8px, 1.4vw, 12px)', borderRadius: 999, background: color, border: '4px solid #fff', boxShadow: 'var(--shadow)', zIndex: 30, pointerEvents: 'none' }}
    >
      {BAND.map(({ id, icon }) => (
        <div key={id} style={{ width: 'clamp(34px, 5.2vmin, 48px)', height: 'clamp(34px, 5.2vmin, 48px)', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.55)', border: '2px dashed rgba(255,255,255,.9)', fontSize: 'clamp(20px, 3.3vmin, 30px)' }}>
          <AnimatePresence>
            {done.includes(id) && (
              <motion.span key={id} initial={{ scale: 0, rotate: -40 }} animate={{ scale: [0, 1.5, 1], rotate: 0 }} transition={{ duration: 0.5 }}>
                {icon}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

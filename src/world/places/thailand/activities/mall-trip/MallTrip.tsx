// The mall day at ICONSIAM (plan: planning/around-the-world/thailand/mall-trip.md). So far, in shapes and without
// voices: HarborLand's hall (hall/, sections hall and hungry), where she walks between the ways in; the mini games
// behind them: the Vet Clinic (games/vet/, section vet), the Barber Salon (games/barber/, section barber: Daddy keeps
// the hairdo she gives him, `hair`, in the hall and at the pizza table), Cafe & Cake (games/cafe/, section cafe), the
// Racing Slide (games/race/, section race) and the Big Frame (harborland/, section frame: `at` follows the level she's
// on); and the pizza toy at The Pizza Company (pizza/, sections menu and
// share). Each mini game is a sticker on her sock band in the corner (`games`), and a big ↩️ takes her back out to the
// hall. After four stickers (or five minutes) Daddy's tummy rumbles and Mommy asks about pizza. The trip around it
// (Mommy's question, the Veloz, the lift and the socks, home) comes in a later gate.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sounds } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Barber } from './games/barber/Barber'
import { Cafe } from './games/cafe/Cafe'
import type { Round } from './games/cafe/layout'
import { Race } from './games/race/Race'
import { Vet } from './games/vet/Vet'
import { HallScreen } from './hall/HallScreen'
import type { DoorId, GameDoor } from './hall/layout'
import { FrameScreen } from './harborland/FrameScreen'
import type { At } from './harborland/layout'
import type { PizzaId } from './pizza/layout'
import { Pizza } from './pizza/Pizza'
import MALL_SECTIONS, { type MallSection, type PatientId } from './sections'
import { SOCK_COLORS } from './socks'

/** What she can play so far: the mini games (any big ride in the Big Frame is `frame`). */
const GAMES = ['vet', 'cafe', 'race', 'barber', 'frame'] as const
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
]
const bandOf = (games: GameId[]): GameDoor[] => BAND.map((b) => b.id).filter((id) => games.includes(id))
/** The way in each section is behind (where she comes back out). */
const DOOR_OF: Partial<Record<MallSection, DoorId>> = { vet: 'vet', cafe: 'cafe', race: 'race', barber: 'barber', frame: 'frame' }
/** Daddy gets hungry after four stickers, or this long in HarborLand. */
const HUNGRY_MS = 5 * 60_000

export function MallTrip() {
  const { start, param, enter } = useSections(MALL_SECTIONS)
  // Old links into the first climbing toy (PR #120's play and dragon) land in the Big Frame.
  const [legacy] = useState(() => (start ? null : (/\/mall-trip\/(play|dragon)(?:[?/]|$)/.exec(location.hash)?.[1] ?? null)))
  const first: MallSection = start ?? (legacy ? 'frame' : 'hall')
  const [socks] = useState(() => param('socks'))
  const [patient, setPatient] = useState<PatientId>(() => param('patient') as PatientId)
  // The round of the mini game on screen (the cafe's, the racing slide's): one `round` in the address.
  const [round, setRound] = useState<Round>(() => Number(param('round')) as Round)
  // (`rides` is the old name of `games`, from PR #120's links. A link past the puppy, or past a mini game's first round,
  // has that game's sticker already.)
  const [games, setGames] = useState<GameId[]>(() => [...new Set([...list(param('games')), ...list(param('rides')), ...(first === 'vet' && patient !== 'puppy' ? ['vet' as const] : []), ...(first === 'cafe' && round > 1 ? ['cafe' as const] : []), ...(first === 'race' && round > 1 ? ['race' as const] : []), ...(first === 'barber' && round > 1 ? ['barber' as const] : [])])])
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
  const band = bandOf(games)
  const hungry = (band.length >= 4 || performance.now() - since.current > HUNGRY_MS) && visits > notYet
  const sticker = (id: GameId) => setGames((g) => (g.includes(id) ? g : [...g, id]))

  const params = () => ({
    socks,
    games: games.join(','),
    ...(section === 'hall' ? { from } : {}),
    ...(section === 'vet' ? { patient } : {}),
    ...(section === 'cafe' || section === 'race' || section === 'barber' ? { round: String(round) } : {}),
    ...(section === 'frame' ? { at } : {}),
    ...(section === 'share' ? { pizza, shared: String(shared) } : {}),
    ...(section === 'hall' || section === 'barber' || section === 'frame' || pizzaTime ? { hair } : {}),
  })
  useEffect(() => enter(first, params()), [])
  const ready = useRef(false)
  useEffect(() => {
    if (!ready.current) {
      ready.current = true
      return
    }
    enter(section, params())
  }, [section, games, patient, round, pizza, shared, from, hair, at])

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
      {inHall ? (
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
      ) : pizzaTime ? (
        <Pizza section={section} pizza={pizza} shared={shared} hair={hair} onPizza={setPizza} onServed={() => setSection('share')} onShared={setShared} />
      ) : section === 'frame' ? (
        <FrameScreen at={at} socks={socks} hair={hair} rode={games.includes('frame')} onAt={setAt} onRide={() => sticker('frame')} />
      ) : null}
      {!inHall && !pizzaTime && (
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
      {!pizzaTime && <SockBand done={band} color={SOCK_COLORS[socks] ?? SOCK_COLORS.pink} />}
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

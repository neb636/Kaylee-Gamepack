// The mall day at ICONSIAM (plan: planning/around-the-world/thailand/mall-trip.md). So far, in shapes and without
// voices: HarborLand's hall (hall/, sections hall and hungry), where she walks between the ways in; the mini games
// behind them: the Vet Clinic (games/vet/, section vet), Cafe & Cake (games/cafe/, section cafe), the Racing Slide
// (games/race/, section race) and the first climbing toy standing in for the Big Frame (harborland/, sections play,
// mountain, dragon: they follow the floor she's on); and the pizza toy at The Pizza Company (pizza/, sections menu and
// share). Each mini game is a sticker on her sock band in the corner (`games`), and a big ↩️ takes her back out to the
// hall. After four stickers (or five minutes) Daddy's tummy rumbles and Mommy asks about pizza. The trip around it
// (Mommy's question, the Veloz, the lift and the socks, home) comes in a later gate.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sounds } from '../../../../../sdk'
import { useSections } from '../../../../kit/sections'
import { Blocks } from './games/blocks/Blocks'
import type { CardId, Round as BlocksRound } from './games/blocks/layout'
import { Cafe } from './games/cafe/Cafe'
import type { Round } from './games/cafe/layout'
import { Race } from './games/race/Race'
import { Vet } from './games/vet/Vet'
import { HallScreen } from './hall/HallScreen'
import type { DoorId, GameDoor } from './hall/layout'
import type { HarborSection } from './harborland/harborland'
import { RIDES, type RideId } from './harborland/layout'
import { Playground } from './harborland/Playground'
import type { PizzaId } from './pizza/layout'
import { Pizza } from './pizza/Pizza'
import MALL_SECTIONS, { type MallSection, type PatientId } from './sections'
import { SOCK_COLORS } from './socks'

/** What she can play so far: the mini games and the climbing toy's big rides (they count for the Big Frame). */
const GAMES = ['vet', 'cafe', 'race', 'blocks', ...RIDES] as const
type GameId = (typeof GAMES)[number]
const list = (s: string) => s.split(',').filter((x): x is GameId => (GAMES as readonly string[]).includes(x))
const isRide = (g: GameId): g is RideId => (RIDES as readonly string[]).includes(g)
/** Her sock band: a slot for each mini game she can play (the barber and the rest add theirs when they're built). */
const BAND: { id: GameDoor; icon: string }[] = [
  { id: 'vet', icon: '🩺' },
  { id: 'cafe', icon: '🥤' },
  { id: 'race', icon: '🏁' },
  { id: 'frame', icon: '🛝' },
  { id: 'blocks', icon: '🧱' },
]
const bandOf = (games: GameId[]): GameDoor[] => BAND.map((b) => b.id).filter((id) => (id === 'frame' ? games.some(isRide) : games.includes(id)))
/** The way in each section is behind (where she comes back out). */
const DOOR_OF: Partial<Record<MallSection, DoorId>> = { vet: 'vet', cafe: 'cafe', race: 'race', play: 'frame', mountain: 'frame', dragon: 'frame', blocks: 'blocks' }
/** Daddy gets hungry after four stickers, or this long in HarborLand. */
const HUNGRY_MS = 5 * 60_000

export function MallTrip() {
  const { start, param, enter } = useSections(MALL_SECTIONS)
  const first: MallSection = start ?? 'hall'
  const [socks] = useState(() => param('socks'))
  const [patient, setPatient] = useState<PatientId>(() => param('patient') as PatientId)
  // The round of the mini game on screen (the cafe's, the racing slide's): one `round` in the address.
  const [round, setRound] = useState<Round>(() => Number(param('round')) as Round)
  // Little Land keeps its own round (so the cafe's round 3 doesn't carry over), and round 2's picture card.
  const [blocksRound, setBlocksRound] = useState<BlocksRound>(() => (first === 'blocks' ? Number(param('round')) : 1) as BlocksRound)
  const [card, setCard] = useState<CardId>(() => param('card') as CardId)
  // (`rides` is the old name of `games`, from PR #120's links. A link past the puppy, or past a mini game's first round,
  // has that game's sticker already.)
  const [games, setGames] = useState<GameId[]>(() => [...new Set([...list(param('games')), ...list(param('rides')), ...(first === 'vet' && patient !== 'puppy' ? ['vet' as const] : []), ...(first === 'cafe' && round > 1 ? ['cafe' as const] : []), ...(first === 'race' && round > 1 ? ['race' as const] : []), ...(first === 'blocks' && blocksRound > 1 ? ['blocks' as const] : [])])])
  const [section, setSection] = useState<MallSection>(first)
  const [from, setFrom] = useState<DoorId | 'in'>(() => param('from') as DoorId | 'in')
  const [pizza, setPizza] = useState(() => param('pizza') as PizzaId)
  const [shared, setShared] = useState(() => Number(param('shared')))
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
    ...(section === 'cafe' || section === 'race' ? { round: String(round) } : {}),
    ...(section === 'blocks' ? { round: String(blocksRound), ...(blocksRound === 2 ? { card } : {}) } : {}),
    ...(section === 'share' ? { pizza, shared: String(shared) } : {}),
  })
  useEffect(() => enter(first, params()), [])
  const ready = useRef(false)
  useEffect(() => {
    if (!ready.current) {
      ready.current = true
      return
    }
    enter(section, params())
  }, [section, games, patient, round, blocksRound, card, pizza, shared, from])

  /** In through a way in. */
  const goIn = (door: GameDoor) => {
    setVisits((v) => v + 1)
    setSection(door === 'frame' ? 'play' : door)
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
      ) : section === 'cafe' ? (
        <Cafe round={round} onRound={setRound} onDrink={() => sticker('cafe')} onPlay={goOut} />
      ) : section === 'race' ? (
        <Race round={round} onRound={(n) => setRound(Math.min(3, n) as Round)} onWon={() => sticker('race')} onPlay={goOut} />
      ) : section === 'blocks' ? (
        <Blocks round={blocksRound} card={card} socks={socks} onRound={setBlocksRound} onCard={setCard} onKnocked={() => sticker('blocks')} onPlay={goOut} />
      ) : pizzaTime ? (
        <Pizza section={section} pizza={pizza} shared={shared} onPizza={setPizza} onServed={() => setSection('share')} onShared={setShared} />
      ) : (
        <Playground section={section as HarborSection} socks={socks} rides={games.filter(isRide)} onSection={setSection} onRide={sticker} />
      )}
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

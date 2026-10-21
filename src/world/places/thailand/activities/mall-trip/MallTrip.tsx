// The mall day at ICONSIAM (plan: planning/around-the-world/thailand/mall-trip.md). So far, in shapes and without
// voices: HarborLand's playground (harborland/harborland.ts, sections play, mountain, dragon: they follow the floor
// she's on) and the first mini game, the Vet Clinic (games/vet/, section vet). Each big ride and each mini game puts a
// sticker on her sock band in the corner (`games`). The hall between the mini games and the trip around it (Mommy's
// question, the Veloz, the lift and the socks, the pizza, home) come in later gates.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { WebGLRenderer } from 'three'
import { useSections } from '../../../../kit/sections'
import { Anchors } from '../../engine/Anchors'
import { View3D, type RenderMode } from '../../engine/View3D'
import { Flat } from './Flat'
import { Cafe } from './games/cafe/Cafe'
import type { Round } from './games/cafe/layout'
import { Vet } from './games/vet/Vet'
import { HARBOR_ANCHORS, HarborLand, SOCK_COLORS, type HarborSection } from './harborland/harborland'
import { RIDE_ICONS, RIDES, type RideId } from './harborland/layout'
import MALL_SECTIONS, { type MallSection, type PatientId } from './sections'

/** Every sticker on the sock band: the mini games so far, then the playground's big rides. */
const GAMES = ['vet', 'cafe', ...RIDES] as const
type GameId = (typeof GAMES)[number]
const GAME_ICONS: Record<GameId, string> = { vet: '🩺', cafe: '🥤', ...RIDE_ICONS }
const list = (s: string) => s.split(',').filter((x): x is GameId => (GAMES as readonly string[]).includes(x))
const isRide = (g: GameId): g is RideId => g !== 'vet' && g !== 'cafe'

export function MallTrip() {
  const { start, param, enter } = useSections(MALL_SECTIONS)
  const first: MallSection = start ?? 'play'
  const [socks] = useState(() => param('socks'))
  const [patient, setPatient] = useState<PatientId>(() => param('patient') as PatientId)
  const [round, setRound] = useState<Round>(() => Number(param('round')) as Round)
  // (`rides` is the old name of `games`, from PR #120's links. A link past the puppy has the vet sticker already.)
  const [games, setGames] = useState<GameId[]>(() => [...new Set([...list(param('games')), ...list(param('rides')), ...(first === 'vet' && patient !== 'puppy' ? ['vet' as const] : []), ...(first === 'cafe' && round > 1 ? ['cafe' as const] : [])])])
  const [section, setSection] = useState<MallSection>(first)
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [key, setKey] = useState(0)
  const worldRef = useRef<HarborLand | null>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const rides = games.filter(isRide)
  const state = useRef({ section, rides })
  state.current = { section, rides }
  const sticker = (id: GameId) => setGames((g) => (g.includes(id) ? g : [...g, id]))

  const params = () => ({ socks, games: games.join(','), ...(section === 'vet' ? { patient } : {}), ...(section === 'cafe' ? { round: String(round) } : {}) })
  useEffect(() => enter(first, params()), [])
  const ready = useRef(false)
  useEffect(() => {
    if (!ready.current) {
      ready.current = true
      return
    }
    enter(section, params())
  }, [section, games, patient, round])

  const make = (renderer: WebGLRenderer) => {
    const w = new HarborLand(renderer, {
      say: () => {},
      done: () => {},
      section: (s) => setSection(s as HarborSection),
      ride: sticker,
    }, { section: state.current.section as HarborSection, socks, rides: state.current.rides })
    w.setHintElement(hintRef.current)
    return w
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F1E8FF', overflow: 'clip' }}>
      {section === 'vet' ? (
        <Vet patient={patient} onPatient={setPatient} onHealed={(id) => id === 'puppy' && sticker('vet')} onPlay={() => setSection('play')} />
      ) : section === 'cafe' ? (
        <Cafe round={round} onRound={setRound} onDrink={() => sticker('cafe')} onPlay={() => setSection('play')} />
      ) : mode === 'flat' ? (
        <Flat section={section} rides={rides} onSection={setSection} onRide={sticker} />
      ) : (
        <View3D
          key={key}
          name="HarborLand"
          qaKey="__thaiMallQA"
          worldRef={worldRef}
          onMode={setMode}
          make={make}
          anchors={(input, els) => (
            <>
              <Anchors list={HARBOR_ANCHORS} els={els} {...input} />
              {/* After a while with nothing touched: a finger pressing the next ride. */}
              <div ref={hintRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'none', zIndex: 20000 }}>
                <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} style={{ fontSize: 'clamp(48px, 7vw, 72px)', translate: '-30% -10%', filter: 'drop-shadow(0 4px 6px rgba(43,35,48,.35))' }}>
                  👆
                </motion.div>
              </div>
            </>
          )}
        />
      )}
      {section !== 'vet' && section !== 'cafe' && mode === 'lost' && (
        <button
          onClick={() => {
            setMode('webgl')
            setKey((k) => k + 1)
          }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(241,232,255,.85)', border: 'none', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: 'var(--ink)', zIndex: 70 }}
        >
          🛝 Tap to wake the playground
        </button>
      )}
      <SockBand games={games} color={SOCK_COLORS[socks] ?? SOCK_COLORS.pink} />
    </div>
  )
}

/** Her sock band in the corner: a sticker for each mini game and big ride, popping in the first time. */
export function SockBand({ games, color }: { games: GameId[]; color: string }) {
  return (
    <div
      aria-label={`Stickers: ${games.length} of ${GAMES.length}`}
      style={{ position: 'absolute', right: 'calc(var(--safe-right, 0px) + 12px)', top: 'calc(var(--safe-top) + 14px)', display: 'flex', gap: 'clamp(3px, 0.6vw, 6px)', padding: 'clamp(5px, 0.9vw, 8px) clamp(8px, 1.4vw, 12px)', borderRadius: 999, background: color, border: '4px solid #fff', boxShadow: 'var(--shadow)', zIndex: 30, pointerEvents: 'none' }}
    >
      {GAMES.map((id) => (
        <div key={id} style={{ width: 'clamp(30px, 4.6vmin, 44px)', height: 'clamp(30px, 4.6vmin, 44px)', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.55)', border: '2px dashed rgba(255,255,255,.9)', fontSize: 'clamp(18px, 3vmin, 28px)' }}>
          <AnimatePresence>
            {games.includes(id) && (
              <motion.span key={id} initial={{ scale: 0, rotate: -40 }} animate={{ scale: [0, 1.5, 1], rotate: 0 }} transition={{ duration: 0.5 }}>
                {GAME_ICONS[id]}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

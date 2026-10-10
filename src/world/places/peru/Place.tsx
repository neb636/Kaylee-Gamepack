// Peru: "Luna's Animal Explorer Journal" (plan: planning/around-the-world/peru.md). Built one activity per PR: Luna's
// Fluffy Day and Coco's Canyon Glide so far. The other places on Luna's map say "coming soon" until they're built, and the balloon finale
// (route `party`) waits until all five exist.
import { motion } from 'motion/react'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { BigButton, say, SparklePuppet, sounds, useSaved, type PuppetHandle } from '../../../sdk'
import { FitBox } from '../../kit/Chrome'
import { StampEarned } from '../../kit/StampEarned'
import { StoryBeat } from '../../kit/StoryBeat'
import type { PlaceProps } from '../../types'
import { CanyonGlide } from './activities/canyon/CanyonGlide'
import { FluffyDay, HATS_KEY } from './activities/fluffy/FluffyDay'
import { art } from './art'
import { L } from './lines'
import { PeruMap, MAP_RATIO } from './PeruMap'
import { Alpaca, HatShape, INK } from './puppets/Alpaca'
import './peru.css'

export interface ActivityProps {
  onDone: () => void
  setProgress: (done: number, total: number) => void
}

const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = { alpaca: FluffyDay, condor: CanyonGlide }

/** The five places on Luna's map (in % of the map), on their real spots, nudged apart so the pins don't overlap. */
export const SPOTS = [
  { id: 'penguins', name: "Pepa's Penguin Cliff", icon: '🐧', x: 38.75, y: 75 },
  { id: 'machu-picchu', name: "Tika's Mountain Terraces", icon: '⛰️', x: 51.5, y: 60 },
  { id: 'alpaca', name: "Luna's Fluffy Day", icon: '✂️', x: 71.7, y: 73 },
  { id: 'condor', name: "Coco's Canyon Glide", icon: '🦅', x: 57.5, y: 88 },
  { id: 'river', name: "Rosa's Rainy River", icon: '🐬', x: 61.25, y: 27.5 },
]

export default function Place(props: PlaceProps) {
  const { meta, activity, earnStamp, setProgress, backToMap } = props
  const [justEarned, setJustEarned] = useState<string | null>(null)

  if (activity === 'party') return <BalloonSoon backToMap={backToMap} />

  const Activity = activity ? ACTIVITIES[activity] : undefined
  const info = meta.activities.find((a) => a.id === activity)
  if (Activity && info) {
    const finish = () => {
      earnStamp(info.id)
      setJustEarned(info.id)
    }
    if (window.__kayleeWorld) window.__kayleeWorld.finish = finish
    return (
      <>
        <Activity key={activity} setProgress={setProgress} onDone={finish} />
        {justEarned === info.id && <StampEarned activity={info} onClose={backToMap} />}
      </>
    )
  }
  return <Hub {...props} />
}

// Luna says hello once per visit to the app.
let introSeen = false

function Hub({ meta, stamps, openActivity }: PlaceProps) {
  const [intro, setIntro] = useState(stamps.length === 0 && !introSeen)
  const [wiggle, setWiggle] = useState<string | null>(null)
  const luna = useRef<PuppetHandle>(null)
  const tickles = useRef(0)
  const playable = new Set(meta.activities.map((a) => a.id))
  const lunaDone = stamps.includes('alpaca')
  const [hats] = useSaved<Record<string, string | null> | null>(HATS_KEY, null)

  useEffect(() => {
    if (intro) return
    void (async () => {
      if (stamps.length) await say(L.hubNext)
      void say(L.hub, { interrupt: false })
    })()
  }, [intro])

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#A8DCFF', padding: 'var(--top-clear) 12px calc(var(--safe-bottom) + 12px)', display: 'flex', overflow: 'hidden' }}>
      <div className="world-split" style={{ flex: 1, minHeight: 0, gap: 'min(14px, 2vh)', alignItems: 'center', position: 'relative' }}>
        <FitBox ratio={MAP_RATIO}>
          <PeruMap />
          {SPOTS.map((spot, i) => {
            const open = playable.has(spot.id)
            const done = stamps.includes(spot.id)
            return (
              <motion.button
                key={spot.id}
                aria-label={open ? spot.name : `${spot.name} coming soon`}
                className={open && !done ? 'world-glow' : undefined}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1, rotate: wiggle === spot.id ? [0, -14, 12, -8, 6, 0] : 0, y: open && !done ? [0, -6, 0] : 0 }}
                transition={{ scale: { delay: 0.2 + i * 0.06, type: 'spring', duration: 0.5 }, rotate: { duration: 0.6 }, y: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' } }}
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  sounds.pop()
                  if (open) openActivity(spot.id)
                  else {
                    setWiggle(spot.id)
                    setTimeout(() => setWiggle(null), 650)
                    void say(L.soon)
                  }
                }}
                style={{
                  position: 'absolute',
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  translate: '-50% -50%',
                  width: open ? 'clamp(76px, 11cqw, 120px)' : 'clamp(66px, 8.5cqw, 92px)',
                  height: open ? 'clamp(76px, 11cqw, 120px)' : 'clamp(66px, 8.5cqw, 92px)',
                  borderRadius: '50%',
                  padding: 0,
                  background: done ? '#FFE27A' : '#FFF7F0',
                  border: `5px solid ${INK}`,
                  boxShadow: '0 6px 0 rgba(43,35,48,.2)',
                  display: 'grid',
                  placeItems: 'center',
                  opacity: open ? 1 : 0.85,
                  zIndex: 3,
                }}
              >
                {spot.id === 'alpaca' || spot.id === 'condor' ? (
                  <img src={spot.id === 'alpaca' ? art.luna : art.coco} alt="" style={{ height: '80%', maxWidth: '80%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: 'clamp(26px, 5.5cqw, 42px)', opacity: open ? 1 : 0.6 }}>{spot.icon}</span>
                )}
                {!open && <span style={{ position: 'absolute', right: '-14%', bottom: '-8%', fontSize: 'clamp(18px, 3.5cqw, 28px)' }}>☁️</span>}
                {done && <span style={{ position: 'absolute', right: '-12%', top: '-8%', fontSize: 'clamp(18px, 3.5cqw, 28px)' }}>✅</span>}
              </motion.button>
            )
          })}
        </FitBox>

        <div className="party-panel peru-panel" style={{ position: 'relative', flexShrink: 0, borderRadius: 28, border: `5px solid ${INK}`, boxShadow: 'var(--shadow)', background: '#FFF7F0', overflow: 'hidden', containerType: 'size' }}>
          <motion.button
            aria-label="Luna"
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              sounds.pop()
              void luna.current?.play('giggle')
              void say(L.tickle[tickles.current++ % L.tickle.length])
            }}
            className="peru-panel-luna"
            style={{ padding: 0, background: 'none', border: 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          >
            <Alpaca ref={luna} kind="luna" height="min(100%, 30cqw)" hat={lunaDone ? (hats?.luna ?? 'pink') : null} label="Luna" />
          </motion.button>
          <Journal stamps={stamps} hats={hats} playable={playable} open={(id) => playable.has(id) && openActivity(id)} />
          <motion.button
            aria-label="Party"
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              sounds.pop()
              openActivity('party')
            }}
            className="peru-panel-balloon"
            style={{ padding: 0, borderRadius: 22, border: `4px solid ${INK}`, background: '#D9CCFF', display: 'grid', placeItems: 'center', opacity: 0.85 }}
          >
            <Balloon />
          </motion.button>
        </div>
      </div>
      {intro && (
        <StoryBeat
          lines={L.intro}
          friend={<Alpaca kind="luna" height="100%" />}
          bg={art.bgAndes}
          onDone={() => {
            introSeen = true
            setIntro(false)
          }}
        />
      )}
    </div>
  )
}

/** Luna's explorer journal: five picture windows, one per corner of Peru, filled as she earns each stamp. */
function Journal({ stamps, hats, playable, open }: { stamps: string[]; hats: Record<string, string | null> | null; playable: Set<string>; open: (id: string) => void }) {
  return (
    <div aria-label="Explorer journal" className="peru-journal" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 'min(8px, 2cqmin)', background: '#FF8FB8', border: `4px solid ${INK}`, borderRadius: 20, padding: 'min(8px, 2cqmin)' }}>
      {SPOTS.map((spot, i) => {
        const done = stamps.includes(spot.id)
        return (
          <motion.button
            key={spot.id}
            aria-label={`journal window ${i + 1}${done ? ' (filled)' : ''}`}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sounds.pop()
              if (done && spot.id === 'alpaca') void say(L.alpacaWindow)
              else if (done && spot.id === 'condor') void say(L.condorWindow)
              else if (playable.has(spot.id)) open(spot.id)
              else void say(L.soon)
            }}
            style={{ minWidth: 0, minHeight: 0, borderRadius: 14, border: `3px ${done ? 'solid' : 'dashed'} ${INK}`, background: done ? '#FFE27A' : '#FFF7F0', display: 'grid', placeItems: 'center', padding: 2, overflow: 'hidden' }}
          >
            {done && spot.id === 'alpaca' ? (
              // The three pompom hats she picked for Luna, Paco and Abuela.
              <svg viewBox="-190 -80 380 170" style={{ width: '100%', height: '100%' }}>
                {(['luna', 'paco', 'abuela'] as const).map((w, k) => (
                  <g key={w} transform={`translate(${(k - 1) * 120} 0)`}>
                    <HatShape color={hats?.[w] ?? ['pink', 'brown', 'hotpink'][k]} />
                  </g>
                ))}
              </svg>
            ) : done && spot.id === 'condor' ? (
              // Coco and Pluma, wingtip to wingtip.
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: '2%' }}>
                <img src={art.coco} alt="" style={{ width: '58%', maxHeight: '90%', objectFit: 'contain' }} />
                <img src={art.pluma} alt="" style={{ width: '32%', maxHeight: '70%', objectFit: 'contain' }} />
              </div>
            ) : <span style={{ fontSize: 'min(30px, 7cqmin)', opacity: 0.35 }}>{spot.icon}</span>}
          </motion.button>
        )
      })}
    </div>
  )
}

/** Sparkle's hot-air balloon, ribbons in Peru's red and white. Puffs a little flame when tapped. */
function Balloon() {
  return (
    <motion.svg viewBox="0 0 120 150" animate={{ y: [0, -5, 0], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 3 }} style={{ height: '86%', maxWidth: '90%' }}>
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <path d="M60 6C24 6 10 34 14 58C18 82 42 96 50 104H70C78 96 102 82 106 58C110 34 96 6 60 6Z" fill="#FF8FB8" />
        <path d="M60 6C44 18 38 60 50 104M60 6C76 18 82 60 70 104" fill="none" />
        <path d="M60 6C48 18 46 60 54 104H66C74 60 72 18 60 6Z" fill="#B9A6F5" />
        <path d="M52 104L46 120M68 104L74 120" fill="none" strokeWidth="3" />
        <rect x="42" y="118" width="36" height="24" rx="6" fill="#E8A35A" />
      </g>
      <path d="M20 66Q40 80 60 72Q80 80 100 66" fill="none" stroke="#D91023" strokeWidth="5" />
      <path d="M24 76Q42 88 60 82Q78 88 96 76" fill="none" stroke="#fff" strokeWidth="4" />
    </motion.svg>
  )
}

/** Route `party` before the finale exists: Luna's balloon trip is coming once all five places are built. */
function BalloonSoon({ backToMap }: { backToMap: () => void }) {
  const sparkle = useRef<PuppetHandle>(null)
  const luna = useRef<PuppetHandle>(null)
  useEffect(() => {
    void say(L.balloonSoon)
    const t = setTimeout(() => {
      void sparkle.current?.play('wave')
      void luna.current?.play('hop')
    }, 400)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{ position: 'absolute', inset: 0, background: `url(${art.bgAndes}) center / cover`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 'min(20px, 3vh)', padding: 'var(--top-clear) 20px calc(var(--safe-bottom) + 28px)' }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '12px 26px', boxShadow: 'var(--shadow)', fontSize: 'clamp(22px, min(4vw, 5vh), 38px)', fontWeight: 600, textAlign: 'center' }}>🎈 {L.balloonSoon}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'min(20px, 3vw)' }}>
        <SparklePuppet ref={sparkle} height="min(300px, 34vh, 40vw)" lookToward={0.5} />
        <Alpaca ref={luna} kind="luna" height="min(300px, 34vh, 40vw)" onTap={() => void luna.current?.play('giggle')} label="Luna" />
      </div>
      <BigButton onClick={backToMap} ariaLabel="Return to Peru">
        🦙 ▶
      </BigButton>
    </div>
  )
}

import { useSections } from '../../kit/sections'
import BALLOON_SECTIONS from './activities/BalloonSoon.sections'
// Peru: "Luna's Animal Explorer Journal" (plan: planning/around-the-world/peru.md (retired; in git history)). All four
// places on Luna's map are built: Pepa's Penguin Cliff, Tika's Mountain Terraces, Luna's Fluffy Day and Swim with Rosa.
// The balloon finale (route `party`) isn't built yet: it shows `BalloonSoon`.
import { motion } from 'motion/react'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { firstTime, HudGlyph, say, SparklePuppet, sounds, useSaved, type PuppetHandle, useTimers } from '../../../sdk'
import { BalloonPicture } from '../../globe/SparkleBalloon'
import { FitBox } from '../../kit/Chrome'
import { HudButton } from '../../kit/Hud'
import { useStampFlow, type ActivityProps } from '../../kit/stampFlow'
import { StoryBeat } from '../../kit/StoryBeat'
import type { PlaceProps } from '../../types'
import { FluffyDay, HATS_KEY } from './activities/fluffy/FluffyDay'
import { MeadowScene } from './activities/fluffy/Meadow'
import { PenguinCliff } from './activities/penguins/PenguinCliff'
import { SwimRiver } from './activities/river/SwimRiver'
import { Terraces } from './activities/terraces/Terraces'
import { art } from './art'
import { L } from './lines'
import { PeruMap, MAP_RATIO } from './PeruMap'
import { Alpaca, HatShape } from './puppets/Alpaca'
import { VIEW as ALPACA_VIEW } from './puppets/fleece'
import { Tika } from './puppets/Tika'
import './peru.css'

export type { ActivityProps } from '../../kit/stampFlow'

const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = { alpaca: FluffyDay, penguins: PenguinCliff, 'machu-picchu': Terraces, river: SwimRiver }

/** The journal's four windows, in reading order: the coast, the mountains (twice), the rainforest. */
const JOURNAL = ['penguins', 'machu-picchu', 'alpaca', 'river']

export default function Place(props: PlaceProps) {
  const { meta, activity, setProgress, backToMap } = props
  const stamp = useStampFlow(props)

  if (activity === 'party') return <BalloonSoon backToMap={backToMap} />

  const Activity = activity ? ACTIVITIES[activity] : undefined
  const info = meta.activities.find((a) => a.id === activity)
  if (Activity && info)
    return (
      <>
        <Activity key={activity} setProgress={setProgress} onDone={stamp.finishFor(info)} />
        {stamp.overlay}
      </>
    )
  return <Hub {...props} />
}

/** Each pin's round picture: its friend, or the old city on its mountain. */
const PIN_IMG: Record<string, string> = { alpaca: art.luna, penguins: art.stickerPepa, 'machu-picchu': art.mpPin, river: art.stickerRosa }

// Luna says hello once per visit to the app.
let introSeen = false

function Hub({ meta, stamps, openActivity }: PlaceProps) {
  const [intro, setIntro] = useState(stamps.length === 0 && !introSeen)
  const luna = useRef<PuppetHandle>(null)
  const tickles = useRef(0)
  const lunaDone = stamps.includes('alpaca')
  const [hats] = useSaved<Record<string, string | null> | null>(HATS_KEY, null)

  useEffect(() => {
    // Only when something is new (her first look, a new stamp, the party): coming back with nothing new is quiet.
    if (intro || !firstTime(`peru:hub:${stamps.length}`)) return
    // Her first look: how to play. Back with a new stamp: just the cheer.
    void say(stamps.length ? L.hubNext : L.hub)
  }, [intro])

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#A8DCFF', padding: 'var(--top-clear) 12px calc(var(--safe-bottom) + 12px)', display: 'flex', overflow: 'hidden' }}>
      <div className="world-split" style={{ flex: 1, minHeight: 0, gap: 'min(14px, 2vh)', alignItems: 'center', position: 'relative' }}>
        <FitBox ratio={MAP_RATIO}>
          <PeruMap />
          {/* The four places, each a round picture in a white ring; the ring turns gold and wears a tick once its stamp is hers. */}
          {meta.activities.map((spot, i) => {
            const done = stamps.includes(spot.id)
            return (
              <motion.button
                key={spot.id}
                aria-label={spot.name}
                className={done ? undefined : 'world-glow'}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1, y: done ? 0 : [0, -6, 0] }}
                transition={{ scale: { delay: 0.2 + i * 0.06, type: 'spring', duration: 0.5 }, y: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' } }}
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  sounds.pop()
                  openActivity(spot.id)
                }}
                style={{
                  position: 'absolute',
                  left: `${spot.pos.x}%`,
                  top: `${spot.pos.y}%`,
                  translate: '-50% -50%',
                  width: 'clamp(66px, 11cqw, 120px)',
                  aspectRatio: '1',
                  borderRadius: '50%',
                  padding: 0,
                  background: '#fff',
                  border: `5px solid ${done ? 'var(--gold)' : '#fff'}`,
                  boxShadow: '0 6px 0 rgba(75, 58, 140, 0.22)',
                  zIndex: 3,
                }}
              >
                <img src={PIN_IMG[spot.id]} alt="" draggable={false} style={{ display: 'block', width: '100%', height: '100%', borderRadius: '50%' }} />
                {done && (
                  <span style={{ position: 'absolute', right: '-10%', top: '-10%', width: '40%', aspectRatio: '1', borderRadius: '50%', background: '#5cc6a6', border: '3px solid #fff', color: '#fff', display: 'grid', placeItems: 'center' }}>
                    <HudGlyph icon="check" size="74%" />
                  </span>
                )}
              </motion.button>
            )
          })}
        </FitBox>

        {/* Luna in her meadow, her journal and the balloon: one cream card, like the map's. */}
        <div className="party-panel peru-panel" style={{ position: 'relative', flexShrink: 0, borderRadius: 28, border: '5px solid #fff', boxShadow: 'var(--shadow)', background: '#FFF7F0', overflow: 'hidden', containerType: 'size' }}>
          <motion.button
            aria-label="Luna"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              sounds.pop()
              void luna.current?.play('giggle')
              void say(L.tickle[tickles.current++ % L.tickle.length])
            }}
            className="peru-panel-luna"
            style={{ padding: 0, background: 'none', border: 'none', borderRadius: 20, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', containerType: 'size' }}
          >
            <LunaMeadow />
            {/* As big as her window allows, with room over her head for the hat. */}
            <div style={{ position: 'relative', marginBottom: '3cqh' }}>
              <Alpaca ref={luna} kind="luna" height={`min(80cqh, ${(84 * ALPACA_VIEW.h) / ALPACA_VIEW.w}cqw)`} hat={lunaDone ? (hats?.luna ?? 'pink') : null} label="Luna" />
            </div>
          </motion.button>
          <Journal stamps={stamps} hats={hats} playable={(id) => meta.activities.some((a) => a.id === id)} open={openActivity} />
          <motion.button
            aria-label="Party"
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              sounds.pop()
              openActivity('party')
            }}
            className="peru-panel-balloon"
            style={{ padding: 0, borderRadius: 22, border: 'none', background: '#DDD2FF', boxShadow: '0 5px 0 #B9A6F5', display: 'flex', alignItems: 'center', justifyContent: 'center', containerType: 'size' }}
          >
            <motion.div animate={{ y: [0, -4, 0], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} style={{ height: 'min(86cqh, 124cqw)', aspectRatio: '200 / 310' }}>
              <BalloonPicture style={{ width: '100%', height: '100%' }} />
            </motion.div>
          </motion.button>
        </div>
      </div>
      {intro && (
        <StoryBeat
          lines={L.intro}
          friend={<Alpaca kind="luna" height="100%" />}
          scene={<MeadowScene />}
          onDone={() => {
            introSeen = true
            setIntro(false)
          }}
        />
      )}
    </div>
  )
}

/** The little view behind Luna on the hub: sky, two far snowy peaks and the hill she stands on (the stickers' backdrop). */
function LunaMeadow() {
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMax slice" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="peru-luna-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfeaff" />
          <stop offset="1" stopColor="#ffe2ee" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#peru-luna-sky)" />
      <path d="M-10 170L34 96L58 130L92 78L132 142L152 116L210 170Z" fill="#d3d6f3" />
      <path d="M92 78L132 142L118 170H92ZM34 96L58 130L48 170H34Z" fill="#bfc2ea" />
      <path d="M92 78L78 100L86 96L92 104L99 96L106 100ZM34 96L24 113L31 110L35 116L41 110L44 110Z" fill="#fff" />
      <path d="M-10 168Q50 148 104 156T210 160V210H-10Z" fill="#9be28f" />
      <path d="M-10 186Q70 172 120 180T210 178V210H-10Z" fill="#73cf86" />
    </svg>
  )
}

/** Luna's explorer journal: four picture windows, one per corner of Peru, filled as she earns each stamp. */
function Journal({ stamps, hats, playable, open }: { stamps: string[]; hats: Record<string, string | null> | null; playable: (id: string) => boolean; open: (id: string) => void }) {
  return (
    <div aria-label="Explorer journal" className="peru-journal" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 'min(8px, 2cqmin)', background: '#FF8FB8', boxShadow: '0 5px 0 #E7699C', borderRadius: 20, padding: 'min(9px, 2.2cqmin)' }}>
      {JOURNAL.map((id, i) => {
        const done = stamps.includes(id)
        return (
          <motion.button
            key={id}
            aria-label={`journal window ${i + 1}${done ? ' (filled)' : ''}`}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sounds.pop()
              if (done && id === 'alpaca') void say(L.alpacaWindow)
              else if (done && id === 'penguins') void say(L.penguinWindow)
              else if (done && id === 'machu-picchu') void say(L.terracesWindow)
              else if (done && id === 'river') void say(L.riverWindow)
              else if (playable(id)) open(id)
              else void say(L.soon)
            }}
            style={{ position: 'relative', minWidth: 0, minHeight: 0, borderRadius: 14, border: done ? '3px solid #fff' : '3px dashed #FFC4DA', background: done ? '#FFF6CC' : '#FFF7F0', padding: 0, overflow: 'hidden' }}
          >
            {done && id === 'alpaca' ? (
              // The three pompom hats she picked for Luna, Paco and Abuela.
              <svg viewBox="-190 -80 380 170" style={{ position: 'absolute', inset: '4%', width: '92%', height: '92%' }}>
                {(['luna', 'paco', 'abuela'] as const).map((w, k) => (
                  <g key={w} transform={`translate(${(k - 1) * 120} 0)`}>
                    <HatShape color={hats?.[w] ?? ['pink', 'brown', 'hotpink'][k]} />
                  </g>
                ))}
              </svg>
            ) : done && id === 'machu-picchu' ? (
              // Tika's photobomb at Machu Picchu.
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#CFEAFF 0 55%, #8FD99A 55%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <Tika height="94%" pose="grin" />
              </div>
            ) : (
              // Her friend's sticker: bright once the stamp is hers (Pepa and her chick, Rosa at her rainbow), a pale hint of who waits there before.
              <img src={PIN_IMG[id]} alt="" draggable={false} style={{ position: 'absolute', inset: done ? '5%' : '15%', width: done ? '90%' : '70%', height: done ? '90%' : '70%', objectFit: 'contain', opacity: done ? 1 : 0.32 }} />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/** Route `party` before the finale exists: Luna's balloon trip is coming once all five places are built. */
function BalloonSoon({ backToMap }: { backToMap: () => void }) {
  const timers = useTimers()
  const { enter } = useSections(BALLOON_SECTIONS)
  useEffect(() => enter('soon'), [enter])
  const sparkle = useRef<PuppetHandle>(null)
  const luna = useRef<PuppetHandle>(null)
  useEffect(() => {
    void say(L.balloonSoon)
    const t = timers.later(() => {
      void sparkle.current?.play('wave')
      void luna.current?.play('hop')
    }, 400)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 'min(20px, 3vh)', padding: 'var(--top-clear) 20px calc(var(--safe-bottom) + var(--target) + 32px)' }}>
      <MeadowScene />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 'var(--radius)', padding: '12px 26px', boxShadow: 'var(--shadow)', fontSize: 'clamp(22px, min(4vw, 5vh), 38px)', fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.4em' }}>
        <BalloonPicture style={{ height: '1.5em', flex: 'none' }} />
        {L.balloonSoon}
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 'min(20px, 3vw)' }}>
        <SparklePuppet ref={sparkle} height="min(300px, 34vh, 40vw)" lookToward={0.5} />
        <Alpaca ref={luna} kind="luna" height="min(300px, 34vh, 40vw)" onTap={() => void luna.current?.play('giggle')} label="Luna" />
      </div>
      <HudButton role="go" icon="map" label="Return to Peru" slot="bottom-right" pulse delay={1} onClick={backToMap} />
    </div>
  )
}

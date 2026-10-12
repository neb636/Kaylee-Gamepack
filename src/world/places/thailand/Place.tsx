import { useSections } from '../../kit/sections'
import PARTY_SECTIONS from './activities/Party.sections'
// Thailand (plan: planning/around-the-world/thailand.md). Kaylee's family lives here, so each place will be one the
// family loves, and later every family member becomes an animal friend. Built one activity per PR: Baan Chang Cafe
// (Krabi) first. Until the family characters exist, Sparkle is the only friend on the map, and the family album beside
// it waits with empty windows. The finale (route `party`) waits until there are more places.
import { motion } from 'motion/react'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { BigButton, say, SparklePuppet, sounds, type PuppetHandle } from '../../../sdk'
import { FitBox } from '../../kit/Chrome'
import { StampEarned } from '../../kit/StampEarned'
import { StoryBeat } from '../../kit/StoryBeat'
import type { PlaceProps } from '../../types'
import { BaanChang } from './activities/baan-chang/BaanChang'
import { L } from './lines'
import { INK, MAP_RATIO, ThailandMap } from './ThailandMap'

export interface ActivityProps {
  onDone: () => void
  setProgress: (done: number, total: number) => void
}

const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = { 'baan-chang': BaanChang }

/** Empty windows in the family album, one per family friend still to come. */
const ALBUM = 4

export default function Place(props: PlaceProps) {
  const { meta, activity, earnStamp, setProgress, backToMap } = props
  const [justEarned, setJustEarned] = useState<string | null>(null)

  if (activity === 'party') return <PartySoon backToMap={backToMap} />

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
        {justEarned === info.id && (
          <StampEarned
            activity={info}
            onClose={() => {
              setJustEarned(null)
              backToMap()
            }}
          />
        )}
      </>
    )
  }
  return <Hub {...props} />
}

// Sparkle says hello once per visit to the app.
let introSeen = false

function Hub({ meta, stamps, openActivity }: PlaceProps) {
  const [intro, setIntro] = useState(stamps.length === 0 && !introSeen)
  const sparkle = useRef<PuppetHandle>(null)
  const tickles = useRef(0)

  useEffect(() => {
    if (intro) return
    void (async () => {
      if (stamps.length) await say(L.hubNext)
      void say(L.hub, { interrupt: false })
    })()
  }, [intro])

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#BFE6FA', padding: 'var(--top-clear) 12px calc(var(--safe-bottom) + 12px)', display: 'flex', overflow: 'hidden' }}>
      <div className="world-split" style={{ flex: 1, minHeight: 0, gap: 'min(14px, 2vh)', alignItems: 'center', position: 'relative' }}>
        <FitBox ratio={MAP_RATIO}>
          <ThailandMap />
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
                  width: 'clamp(84px, 16cqw, 124px)',
                  height: 'clamp(84px, 16cqw, 124px)',
                  borderRadius: '50%',
                  padding: 0,
                  background: done ? '#FFE27A' : '#FFF7F0',
                  border: done ? '5px dashed var(--hotpink)' : '5px solid var(--gold)',
                  boxShadow: '0 6px 0 rgba(43,35,48,.2)',
                  display: 'grid',
                  placeItems: 'center',
                  zIndex: 3,
                }}
              >
                <span style={{ fontSize: 'clamp(34px, 7cqw, 54px)' }}>{spot.icon}</span>
                {done && <span style={{ position: 'absolute', right: '-12%', top: '-8%', fontSize: 'clamp(18px, 3.5cqw, 28px)' }}>✅</span>}
              </motion.button>
            )
          })}
        </FitBox>

        <div className="party-panel world-side" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 'min(12px, 2vmin)', flexShrink: 0, borderRadius: 28, border: `5px solid ${INK}`, boxShadow: 'var(--shadow)', background: '#FFF7F0', padding: 'min(12px, 2vmin)', overflow: 'hidden' }}>
          <motion.button
            aria-label="Sparkle"
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              sounds.pop()
              void sparkle.current?.play('wiggle')
              void say(L.tickle[tickles.current++ % L.tickle.length])
            }}
            style={{ padding: 0, background: 'none', border: 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flex: '1 1 0', minHeight: 0, minWidth: 0, height: '100%' }}
          >
            <SparklePuppet ref={sparkle} height="min(100%, 220px)" />
          </motion.button>
          {/* The family album: Kaylee's family will move in here as animal friends. */}
          <div aria-label="Family album" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, background: '#FF8FB8', border: `4px solid ${INK}`, borderRadius: 20, padding: 8, flex: '1 1 0', alignSelf: 'stretch', minHeight: 0, minWidth: 0 }}>
            {Array.from({ length: ALBUM }, (_, i) => (
              <motion.button
                key={i}
                aria-label={`family window ${i + 1}`}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  sounds.pop()
                  void say(L.soon)
                }}
                style={{ minWidth: 0, minHeight: 0, borderRadius: 14, border: `3px dashed ${INK}`, background: '#FFF7F0', display: 'grid', placeItems: 'center', padding: 2, fontSize: 'min(28px, 5vmin)', opacity: 0.6 }}
              >
                💗
              </motion.button>
            ))}
          </div>
          <motion.button
            aria-label="Party"
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              sounds.pop()
              openActivity('party')
            }}
            style={{ padding: 0, borderRadius: 22, border: `4px solid ${INK}`, background: '#D9CCFF', display: 'grid', placeItems: 'center', opacity: 0.85, flex: '0 0 auto', width: 'min(110px, 22vmin)', height: 'min(110px, 22vmin)', fontSize: 'min(54px, 10vmin)' }}
          >
            🎈
          </motion.button>
        </div>
      </div>
      {intro && (
        <StoryBeat
          lines={L.intro}
          onDone={() => {
            introSeen = true
            setIntro(false)
          }}
        />
      )}
    </div>
  )
}

/** Route `party` before the finale exists. */
function PartySoon({ backToMap }: { backToMap: () => void }) {
  const { enter } = useSections(PARTY_SECTIONS)
  useEffect(() => enter('soon'), [enter])
  const sparkle = useRef<PuppetHandle>(null)
  useEffect(() => {
    void say(L.partySoon)
    const t = setTimeout(() => void sparkle.current?.play('wave'), 400)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#BFE6FA, #FFE3F0)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 'min(20px, 3vh)', padding: 'var(--top-clear) 20px calc(var(--safe-bottom) + 28px)' }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '12px 26px', boxShadow: 'var(--shadow)', fontSize: 'clamp(22px, min(4vw, 5vh), 38px)', fontWeight: 600, textAlign: 'center' }}>🎈 {L.partySoon}</div>
      <button aria-label="Sparkle" onClick={() => void sparkle.current?.play('hop')} style={{ padding: 0, background: 'none', border: 'none' }}>
        <SparklePuppet ref={sparkle} height="min(300px, 34vh, 40vw)" />
      </button>
      <BigButton onClick={backToMap} ariaLabel="Return to Thailand">
        🐘 ▶
      </BigButton>
    </div>
  )
}

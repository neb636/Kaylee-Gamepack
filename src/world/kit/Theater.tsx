// Sparkle's Theater: real-world videos on a little stage with pink velvet curtains.
// The world map's Theater shows every country; a country's Theater spot shows only its own videos.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BigButton, say, SparklePuppet, sounds, useSayOnMount, type PuppetHandle } from '../../sdk'
import { WORLD_LINES } from '../lines'
import type { PlaceMeta, PlaceVideo } from '../types'
import { BarPill, TopBar } from './Chrome'
import { Flag } from './Flag'
import { YouTubePlayer } from './YouTubePlayer'

const CURTAIN = 'var(--curtain)'
const BULBS = 14

/** The room: dark plum walls, swaying curtains down the sides, a scalloped valance and twinkling marquee bulbs. */
function Stage({ bar, children }: { bar?: ReactNode; children: ReactNode }) {
  return (
    <div className="screen" style={{ padding: 0, overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 30%, #6b3f8f 0%, #3d2352 70%)' }}>
      {[-1, 1].map((side) => (
        <motion.div
          key={side}
          className="curtain"
          animate={{ skewY: [0, side * 1.2, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: 0, bottom: 0, [side < 0 ? 'left' : 'right']: 0, width: CURTAIN, transformOrigin: 'top', zIndex: 2, boxShadow: `${side * -6}px 0 16px rgba(0,0,0,0.3)`, borderBottomRightRadius: side < 0 ? 40 : 0, borderBottomLeftRadius: side > 0 ? 40 : 0 }}
        />
      ))}
      <div className="valance" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 'calc(var(--safe-top) + 46px)', zIndex: 3, filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.3))' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 34, height: 6, background: 'var(--gold)' }} />
      </div>
      <div aria-hidden style={{ position: 'absolute', left: CURTAIN, right: CURTAIN, top: 'calc(var(--safe-top) + 50px)', display: 'flex', justifyContent: 'space-around', zIndex: 3, pointerEvents: 'none' }}>
        {Array.from({ length: BULBS }, (_, i) => (
          <span key={i} className="marquee-bulb" style={{ width: 12, height: 12, borderRadius: '50%' }} />
        ))}
      </div>
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', zIndex: 1 }}>{children}</div>
      {bar}
    </div>
  )
}

/** Two curtain halves that swoosh open when a video starts. */
function CurtainsOpen() {
  return (
    <>
      {[-1, 1].map((side) => (
        <motion.div
          key={side}
          className="curtain"
          initial={{ x: 0 }}
          animate={{ x: `${side * 100}%` }}
          transition={{ duration: 0.9, ease: [0.6, 0, 0.3, 1], delay: 0.15 }}
          style={{ position: 'absolute', top: 0, bottom: 0, [side < 0 ? 'left' : 'right']: 0, width: '50%', zIndex: 4, pointerEvents: 'none' }}
        />
      ))}
    </>
  )
}

export function Theater({ places, onExit, exitIcon, exitLabel, title }: { places: PlaceMeta[]; onExit: () => void; exitIcon: string; exitLabel: string; title: ReactNode }) {
  const [playing, setPlaying] = useState<PlaceVideo | null>(null)
  const pick = (v: PlaceVideo) => {
    sounds.whoosh()
    void say(v.say)
    setPlaying(v)
  }
  return (
    <Stage
      bar={
        <TopBar icon={playing ? '🎟️' : exitIcon} label={playing ? 'All videos' : exitLabel} onBack={playing ? () => setPlaying(null) : onExit}>
          <BarPill>{title}</BarPill>
        </TopBar>
      }
    >
      {playing ? (
        <Screening key={playing.id} video={playing} onDone={() => setPlaying(null)}>
          <BarPill style={{ fontSize: 'clamp(20px, min(3vw, 4vh), 30px)', maxWidth: '100%', whiteSpace: 'normal', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.5em' }}>{playing.icon}</span>
            {playing.title}
          </BarPill>
        </Screening>
      ) : (
        <Shelf places={places} onPick={pick} />
      )}
      <AnimatePresence>{playing && <CurtainsOpen key={playing.id} />}</AnimatePresence>
    </Stage>
  )
}

function Shelf({ places, onPick }: { places: PlaceMeta[]; onPick: (v: PlaceVideo) => void }) {
  useSayOnMount(WORLD_LINES.theaterPick)
  const many = places.length > 1
  let i = 0 // running index across countries, for the staggered entrance
  return (
    // Only the tickets scroll, so the back button always stays put.
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column', padding: `var(--bar-clear) calc(${CURTAIN} + max(12px, 2vw)) calc(var(--safe-bottom) + 24px)` }}>
      <div style={{ width: '100%', maxWidth: 1100, margin: 'auto', display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 4vh, 36px)' }}>
        {places.map((meta) => (
          <section key={meta.id} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {many && (
              <BarPill style={{ alignSelf: 'flex-start', fontSize: 'clamp(18px, min(3vw, 4.5vh), 28px)' }}>
                <Flag id={meta.flag} width="1.8em" style={{ borderRadius: 4 }} />
                {meta.name}
              </BarPill>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 78vw, 50vh), 1fr))', gap: 'clamp(14px, 2.6vw, 28px)' }}>
              {(meta.videos ?? []).map((v) => (
                <Ticket key={v.id} video={v} delay={i++ * 0.06} onPick={() => onPick(v)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function Ticket({ video, delay, onPick }: { video: PlaceVideo; delay: number; onPick: () => void }) {
  const [thumbOk, setThumbOk] = useState(true)
  return (
    <motion.button
      aria-label={`Watch ${video.title}`}
      initial={{ y: 30, opacity: 0, rotate: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ rotate: -1.5, scale: 1.02 }}
      whileTap={{ scale: 0.94 }}
      onClick={onPick}
      style={{ position: 'relative', background: 'var(--cream)', borderRadius: 28, padding: 10, boxShadow: '0 8px 0 rgba(0,0,0,0.25)', border: '5px solid var(--gold)', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 18, overflow: 'hidden', background: 'var(--lavender)', display: 'grid', placeItems: 'center' }}>
        {thumbOk ? (
          <img src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" onError={() => setThumbOk(false)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 72, opacity: 0.4 }}>{video.icon}</span>
        )}
        <span style={{ position: 'relative', width: 'clamp(64px, 22%, 88px)', aspectRatio: '1', borderRadius: '50%', background: 'var(--hotpink)', border: '5px solid #fff', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 'clamp(28px, 9vmin, 40px)', paddingLeft: '0.12em', boxShadow: 'var(--shadow)' }}>▶</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 2px' }}>
        <span style={{ fontSize: 'clamp(30px, 5vmin, 44px)', lineHeight: 1 }}>{video.icon}</span>
        <span style={{ fontSize: 'clamp(18px, 2.6vmin, 24px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.15 }}>{video.title}</span>
      </div>
      {/* Ticket-stub notches */}
      {[-1, 1].map((side) => (
        <span key={side} aria-hidden style={{ position: 'absolute', bottom: 34, [side < 0 ? 'left' : 'right']: -14, width: 22, height: 22, borderRadius: '50%', background: '#4d2c66', border: '5px solid var(--gold)' }} />
      ))}
    </motion.button>
  )
}

/** The video on stage, with Sparkle watching beside it (below it in portrait) and `children` (title, Skip...) next to her. */
function Screening({ video, onDone, children }: { video: PlaceVideo; onDone: () => void; children: ReactNode }) {
  const sparkle = useRef<PuppetHandle>(null)
  const roomy = window.innerHeight > 560 && window.innerWidth > 600
  useEffect(() => {
    const t = setTimeout(() => void sparkle.current?.play('wave'), 400)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="world-split" style={{ flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center', gap: 'min(16px, 2vh)', padding: `var(--bar-clear) calc(${CURTAIN} + 12px) calc(var(--safe-bottom) + 16px)` }}>
      <div className="video-fit">
        <YouTubePlayer video={video} onDone={onDone} />
      </div>
      <div className="world-side screening-side" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'min(20px, 3vw)', flexShrink: 0, maxWidth: '100%', textAlign: 'center' }}>
        {roomy && <SparklePuppet ref={sparkle} height="min(260px, 24vh, 34vw)" />}
        {children}
      </div>
    </div>
  )
}

/** After an activity's stamp: "Want to see real koalas?" with the video and a big Skip button. */
export function VideoBreak({ video, onDone }: { video: PlaceVideo; onDone: () => void }) {
  useEffect(() => void say(video.say), [video])
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex' }}>
      <Stage>
        <Screening video={video} onDone={onDone}>
          <BigButton color="white" onClick={onDone} ariaLabel="Skip the video">
            ⏭ 🗺️
          </BigButton>
        </Screening>
        <CurtainsOpen />
      </Stage>
    </motion.div>
  )
}

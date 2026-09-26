// Sparkle's Theater: real-world videos in a calm, dark room so the pictures are the star.
// The world map's Theater shows every country; a country's Theater button (in its top bar) shows only its own videos.
import { motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { say, SparklePuppet, sounds, useSayOnMount, type PuppetHandle } from '../../sdk'
import { WORLD_LINES } from '../lines'
import type { PlaceMeta, PlaceVideo } from '../types'
import { BarPill, TopBar } from './Chrome'
import { Flag } from './Flag'
import { FullButton, YouTubePlayer } from './YouTubePlayer'

declare global {
  interface Window {
    /** Dev/QA hook: switch the open video to full screen. */
    __kayleeTheaterFull?: () => void
  }
}

/** The room: one solid color (see .theater-room). `full` lifts the content over everything, top bar included. */
function Stage({ bar, full, children }: { bar?: ReactNode; full?: boolean; children: ReactNode }) {
  return (
    <div className="screen theater-room" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', zIndex: full ? 60 : 1 }}>{children}</div>
      {!full && bar}
    </div>
  )
}

/**
 * Full screen for the video. Uses the browser's real full screen where there is one (desktop, iPad, Android);
 * on iPhone (no full screen for pages) the video just covers the whole screen.
 */
function useFullMode(): [boolean, (on: boolean) => void] {
  const [full, setFull] = useState(false)
  const viaApi = useRef(false)
  useEffect(() => {
    const onChange = () => {
      if (!fullscreenElement() && viaApi.current) {
        viaApi.current = false
        setFull(false) // she left with Esc or the browser's own ✕
      }
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
      if (viaApi.current) exitFullscreen()
    }
  }, [])
  useEffect(() => {
    window.__kayleeTheaterFull = () => set(true) // QA screenshots of full screen without a playing video
    return () => {
      delete window.__kayleeTheaterFull
    }
  })
  const set = (on: boolean) => {
    setFull(on)
    if (on && !fullscreenElement()) {
      const root = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }
      const request = root.requestFullscreen?.bind(root) ?? root.webkitRequestFullscreen?.bind(root)
      if (!request) return
      viaApi.current = true
      try {
        // Browsers only allow real full screen from a tap or swipe. Turning the device isn't one, so then the video
        // just covers the page (same look), and this quietly fails.
        Promise.resolve(request())
          .then(() => (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape'))
          .catch(() => {
            if (!fullscreenElement()) viaApi.current = false
          })
      } catch {
        viaApi.current = false
      }
    } else if (!on && viaApi.current) {
      viaApi.current = false
      exitFullscreen()
    }
  }
  return [full, set]
}
const fullscreenElement = () => document.fullscreenElement ?? (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement
function exitFullscreen() {
  if (!fullscreenElement()) return
  const d = document as Document & { webkitExitFullscreen?: () => void }
  void (d.exitFullscreen ? d.exitFullscreen().catch(() => {}) : d.webkitExitFullscreen?.())
}

export function Theater({ places, onExit, exitIcon, exitLabel, title }: { places: PlaceMeta[]; onExit: () => void; exitIcon: string; exitLabel: string; title: ReactNode }) {
  const [playing, setPlaying] = useState<PlaceVideo | null>(null)
  const [full, setFull] = useFullMode()
  const pick = (v: PlaceVideo) => {
    sounds.whoosh()
    void say(v.say)
    setPlaying(v)
  }
  const close = () => {
    setFull(false)
    setPlaying(null)
  }
  return (
    <Stage
      full={full}
      bar={
        <TopBar icon={playing ? '🎟️' : exitIcon} label={playing ? 'All videos' : exitLabel} onBack={playing ? close : onExit}>
          {!playing && <BarPill>{title}</BarPill>}
        </TopBar>
      }
    >
      {playing ? (
        <Screening key={playing.id} video={playing} onDone={close} full={full} onFull={setFull}>
          <BarPill style={{ fontSize: 'clamp(20px, min(3vw, 4vh), 30px)', maxWidth: '100%', whiteSpace: 'normal', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.5em' }}>{playing.icon}</span>
            {playing.title}
          </BarPill>
        </Screening>
      ) : (
        <Shelf places={places} onPick={pick} />
      )}
    </Stage>
  )
}

function Shelf({ places, onPick }: { places: PlaceMeta[]; onPick: (v: PlaceVideo) => void }) {
  useSayOnMount(WORLD_LINES.theaterPick)
  const many = places.length > 1
  let i = 0 // running index across countries, for the staggered entrance
  return (
    // Only the tickets scroll, so the back button always stays put.
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column', padding: 'var(--bar-clear) var(--theater-side) calc(var(--safe-bottom) + 24px)' }}>
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
        <span key={side} aria-hidden style={{ position: 'absolute', bottom: 34, [side < 0 ? 'left' : 'right']: -14, width: 22, height: 22, borderRadius: '50%', background: 'var(--theater-bg)', border: '5px solid var(--gold)' }} />
      ))}
    </motion.button>
  )
}

/**
 * The video with Sparkle watching under it and `children` (title, Skip...) and the full-screen button beside her. The video runs edge to
 * edge in portrait; on short landscape phones it takes the full height and the extras tuck under the back button.
 */
function Screening({ video, onDone, full, onFull, children }: { video: PlaceVideo; onDone: () => void; full: boolean; onFull: (full: boolean) => void; children: ReactNode }) {
  const sparkle = useRef<PuppetHandle>(null)
  const roomy = window.innerHeight > 560
  useEffect(() => {
    const t = setTimeout(() => void sparkle.current?.play('wave'), 400)
    return () => clearTimeout(t)
  }, [])
  return (
    <motion.div className={`screening${full ? ' full' : ''}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
      <div className="video-fit">
        <YouTubePlayer video={video} onDone={onDone} full={full} onFull={onFull} />
      </div>
      <div className="screening-side">
        {roomy && <SparklePuppet ref={sparkle} height="min(240px, 22vh, 34vw)" />}
        {children}
        {/* Beside the video, not on it: nothing covers the picture while it plays. */}
        <FullButton full={full} onFull={onFull} />
      </div>
    </motion.div>
  )
}

/** After an activity's stamp: "Want to see real koalas?" with the video and a big Skip button. */
export function VideoBreak({ video, onDone }: { video: PlaceVideo; onDone: () => void }) {
  const [full, setFull] = useFullMode()
  useEffect(() => void say(video.say), [video])
  const done = () => {
    setFull(false)
    onDone()
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex' }}>
      <Stage full={full}>
        <Screening video={video} onDone={done} full={full} onFull={setFull}>
          <motion.button
            aria-label="Skip the video"
            className="skip-btn"
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sounds.pop()
              done()
            }}
          >
            <span>⏭</span>
            <span>🗺️</span>
          </motion.button>
        </Screening>
      </Stage>
    </motion.div>
  )
}

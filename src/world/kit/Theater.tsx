// Sparkle's Theater: real-world videos on a little stage with pink velvet curtains.
// The world map's Theater shows every country; a country's Theater button (in its top bar) shows only its own videos.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { say, SparklePuppet, sounds, useSayOnMount, type PuppetHandle } from '../../sdk'
import { WORLD_LINES } from '../lines'
import type { PlaceMeta, PlaceVideo } from '../types'
import { BarPill, TopBar } from './Chrome'
import { Flag } from './Flag'
import { YouTubePlayer } from './YouTubePlayer'

declare global {
  interface Window {
    /** Dev/QA hook: switch the open video to full screen. */
    __kayleeTheaterFull?: () => void
  }
}

const CURTAIN = 'var(--curtain)'
const BULBS = 16

/**
 * The room: a plum back wall with sweeping spotlights, a wooden stage floor, velvet curtains tied back at the sides
 * and a swagged valance with twinkling marquee bulbs. `raised` lifts the content in front of the curtains (the video
 * goes edge to edge); `full` lifts it over everything, top bar included.
 */
function Stage({ bar, raised, full, children }: { bar?: ReactNode; raised?: boolean; full?: boolean; children: ReactNode }) {
  return (
    <div className="screen theater-room" style={{ padding: 0, overflow: 'hidden' }}>
      {[-1, 1].map((side) => (
        <motion.div
          key={`beam${side}`}
          aria-hidden
          className="theater-beam"
          animate={{ rotate: [side * 14, side * 4, side * 14] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: side > 0 ? 1.5 : 0 }}
          style={{ left: side < 0 ? '12%' : '88%' }}
        />
      ))}
      <div aria-hidden className="theater-floor" />
      {[-1, 1].map((side) => (
        <motion.div
          key={side}
          aria-hidden
          animate={{ skewY: [0, side * 1, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: 0, bottom: 0, [side < 0 ? 'left' : 'right']: 0, width: CURTAIN, scaleX: -side, transformOrigin: 'top', zIndex: 2, filter: 'drop-shadow(6px 0 10px rgba(0,0,0,0.35))' }}
        >
          <Drape tied />
        </motion.div>
      ))}
      <Valance />
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', zIndex: full ? 60 : raised ? 4 : 1 }}>{children}</div>
      {!full && bar}
    </div>
  )
}

/**
 * One velvet curtain (drawn for the left side; mirror it for the right). Its pleats gather at a gold rope when
 * `tied`, or hang straight. It stretches to any size, so the rope and tassel are HTML on top.
 */
function Drape({ tied, folds = 5 }: { tied?: boolean; folds?: number }) {
  const id = useId().replace(/:/g, '')
  // x of each pleat line at the top, at the tie-back and at the hem (viewBox is 100 x 1000).
  const top = (k: number) => (100 * k) / folds
  const tie = (k: number) => ((tied ? 34 : 100) * k) / folds
  const hem = (k: number) => ((tied ? 62 : 100) * k) / folds
  const edge = (k: number) => `Q${top(k)},330 ${tie(k)},600 Q${tie(k)},820 ${hem(k)},1000`
  const outline = `M0,0 L100,0 ${edge(folds)} L0,1000Z`
  return (
    <>
      <svg viewBox="0 0 100 1000" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`${id}p`} x1="0" x2="1">
            <stop offset="0" stopColor="#a80f4a" />
            <stop offset="0.3" stopColor="#f0468e" />
            <stop offset="0.55" stopColor="#ff9cc8" />
            <stop offset="0.78" stopColor="#e2327f" />
            <stop offset="1" stopColor="#9c0c44" />
          </linearGradient>
          <linearGradient id={`${id}s`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3a0020" stopOpacity="0.45" />
            <stop offset="0.18" stopColor="#3a0020" stopOpacity="0" />
            <stop offset="0.85" stopColor="#3a0020" stopOpacity="0" />
            <stop offset="1" stopColor="#3a0020" stopOpacity="0.35" />
          </linearGradient>
          <clipPath id={`${id}c`}>
            <path d={outline} />
          </clipPath>
        </defs>
        {Array.from({ length: folds }, (_, k) => (
          <path key={k} d={`M${top(k)},0 ${edge(k)} L${hem(k + 1)},1000 ${reverse(top(k + 1), tie(k + 1))} Z`} fill={`url(#${id}p)`} />
        ))}
        <rect width="100" height="1000" fill={`url(#${id}s)`} clipPath={`url(#${id}c)`} />
        {/* Gold hem down the inside edge. */}
        <path d={`M100,0 ${edge(folds)}`} fill="none" stroke="var(--gold)" strokeWidth={5} vectorEffect="non-scaling-stroke" />
      </svg>
      {tied && (
        <div style={{ position: 'absolute', top: '60%', left: -6, width: 'calc(34% + 12px)', height: 'clamp(9px, 1.6vh, 16px)', translate: '0 -50%', borderRadius: 999, background: 'repeating-linear-gradient(-60deg, #ffe08a 0 5px, #e0a82e 5px 9px)', boxShadow: '0 3px 4px rgba(0,0,0,0.3)' }}>
          {/* Tassel */}
          <span style={{ position: 'absolute', right: -6, top: '50%', width: 'clamp(12px, 2vh, 20px)', aspectRatio: '1', borderRadius: '50%', background: '#ffd35c', boxShadow: 'inset -2px -2px 0 #d69a1f' }} />
          <span style={{ position: 'absolute', right: -9, top: 'calc(50% + clamp(10px, 1.8vh, 18px))', width: 'clamp(18px, 2.8vh, 28px)', height: 'clamp(22px, 4vh, 40px)', clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0 100%)', background: 'repeating-linear-gradient(90deg, #ffd35c 0 3px, #e0a82e 3px 5px)' }} />
        </div>
      )}
    </>
  )
}
/** The same pleat line as `edge`, walked from the hem back up to the top. */
const reverse = (top: number, tie: number) => `Q${tie},820 ${tie},600 Q${top},330 ${top},0`

/** Swagged pelmet across the top: pleated band with marquee bulbs, a gold rail, then draped swags with tassels. */
function Valance() {
  const id = useId().replace(/:/g, '')
  return (
    <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3, pointerEvents: 'none', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.35))' }}>
      <div className="valance-band" style={{ height: 'calc(var(--safe-top) + 24px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: `0 calc(${CURTAIN} + 8px) 5px` }}>
        {Array.from({ length: BULBS }, (_, i) => (
          <span key={i} className="marquee-bulb" style={{ width: 12, height: 12, borderRadius: '50%' }} />
        ))}
      </div>
      <div style={{ height: 6, background: 'linear-gradient(#ffe08a, #e0a82e)' }} />
      <svg width="100%" height="34" style={{ display: 'block', marginTop: -1 }}>
        <defs>
          <linearGradient id={`${id}g`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#c01e63" />
            <stop offset="0.6" stopColor="#ff5fa2" />
            <stop offset="1" stopColor="#d42a73" />
          </linearGradient>
          <pattern id={`${id}p`} width="96" height="34" patternUnits="userSpaceOnUse" x="50%">
            <path d="M0,0 Q48,52 96,0Z" fill={`url(#${id}g)`} />
            <path d="M16,1 Q48,30 80,1" fill="none" stroke="rgba(110,0,45,0.28)" strokeWidth={3} />
            <path d="M0,0 Q48,52 96,0" fill="none" stroke="#ffc83d" strokeWidth={4} />
            {[0, 96].map((x) => (
              <g key={x}>
                <circle cx={x} cy={5} r={5} fill="#ffd35c" />
                <path d={`M${x - 3},9 L${x + 3},9 L${x + 6},26 L${x - 6},26Z`} fill="#e9b53a" />
              </g>
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="34" fill={`url(#${id}p)`} />
      </svg>
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
          initial={{ x: 0 }}
          animate={{ x: `${side * 110}%` }}
          transition={{ duration: 0.9, ease: [0.6, 0, 0.3, 1], delay: 0.15 }}
          style={{ position: 'absolute', top: 0, bottom: 0, [side < 0 ? 'left' : 'right']: 0, width: '50%', zIndex: 4, pointerEvents: 'none' }}
        >
          <div style={{ position: 'absolute', inset: 0, scale: `${-side} 1` }}>
            <Drape folds={7} />
          </div>
        </motion.div>
      ))}
    </>
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
        // Called right inside her tap or swipe: browsers only allow full screen from one.
        Promise.resolve(request())
          .then(() => (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape'))
          .catch(() => {})
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
      raised={!!playing}
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
        <span key={side} aria-hidden style={{ position: 'absolute', bottom: 34, [side < 0 ? 'left' : 'right']: -14, width: 22, height: 22, borderRadius: '50%', background: '#4b2a66', border: '5px solid var(--gold)' }} />
      ))}
    </motion.button>
  )
}

/**
 * The video on stage with Sparkle watching under it and `children` (title, Skip...) beside her. The video runs edge to
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
    <div className={`screening${full ? ' full' : ''}`}>
      <div className="video-fit">
        <YouTubePlayer video={video} onDone={onDone} full={full} onFull={onFull} />
      </div>
      <div className="screening-side">
        {roomy && <SparklePuppet ref={sparkle} height="min(240px, 22vh, 42vw)" />}
        {children}
      </div>
    </div>
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
      <Stage raised full={full}>
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
        <CurtainsOpen />
      </Stage>
    </motion.div>
  )
}

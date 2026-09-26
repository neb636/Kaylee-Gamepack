import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { BigButton, Mascot, say, sounds, stopSpeaking } from '../../sdk'
import { WORLD_LINES } from '../lines'
import type { PlaceVideo } from '../types'
import { FitBox } from './Chrome'

// The bits of the YouTube IFrame API we use (loaded from YouTube at runtime, no npm package).
interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  destroy: () => void
}
interface YTEvent {
  target: YTPlayer
  data: number
}
interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string
      host?: string
      width?: string
      height?: string
      playerVars?: Record<string, string | number>
      events?: { onReady?: (e: YTEvent) => void; onStateChange?: (e: YTEvent) => void; onError?: (e: YTEvent) => void }
    },
  ) => YTPlayer
}
declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}
const ENDED = 0
const PLAYING = 1
const PAUSED = 2

let api: Promise<YTNamespace> | undefined
function loadApi(): Promise<YTNamespace> {
  api ??= new Promise((resolve, reject) => {
    if (window.YT?.Player) return resolve(window.YT)
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      if (window.YT) resolve(window.YT)
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.onerror = () => {
      api = undefined // try again next time (she may be back online)
      reject(new Error('YouTube did not load'))
    }
    document.head.appendChild(script)
  })
  return api
}

/** `tap-video`: the browser blocked our play call (iOS can), so her next tap goes to the video itself. */
type State = 'poster' | 'loading' | 'tap-video' | 'playing' | 'paused' | 'ended' | 'error'

/**
 * A kid-safe YouTube screen. The player loads hidden under a big ▶ poster, so one tap starts it (a tap is the only
 * way a phone lets a video play with sound). YouTube's own controls are off and its title bar, share and logo are
 * cropped out of view; our layer on top turns taps into pause, swipes up/down into full screen, and covers
 * YouTube's "more videos" panels with our own pause and end screens.
 */
export function YouTubePlayer({ video, onDone, full, onFull }: { video: PlaceVideo; onDone: () => void; full: boolean; onFull: (full: boolean) => void }) {
  const [state, setState] = useState<State>('poster')
  const [thumbOk, setThumbOk] = useState(true)
  const wrap = useRef<HTMLDivElement>(null)
  const player = useRef<YTPlayer | null>(null)
  const ready = useRef(false)
  const wantPlay = useRef(false)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    let gone = false
    const fail = () => {
      if (gone || !wantPlay.current) return // offline before she tapped: say so when she does
      setState('error')
      void say(WORLD_LINES.videoOffline)
    }
    loadApi()
      .then((YT) => {
        if (gone || !wrap.current) return
        // The API replaces the element it gets, so give it one React doesn't own.
        const host = document.createElement('div')
        wrap.current.replaceChildren(host)
        player.current = new YT.Player(host, {
          videoId: video.youtubeId,
          host: 'https://www.youtube-nocookie.com',
          width: '100%',
          height: '100%',
          playerVars: { playsinline: 1, controls: 0, disablekb: 1, fs: 0, rel: 0, modestbranding: 1, iv_load_policy: 3, cc_load_policy: 0, start: video.start ?? 0 },
          events: {
            onReady: (e) => {
              ready.current = true
              if (wantPlay.current) e.target.playVideo() // she tapped before it was ready
            },
            onStateChange: (e) => {
              if (e.data === PLAYING) {
                stopSpeaking()
                setState('playing')
              } else if (e.data === PAUSED) setState('paused')
              else if (e.data === ENDED) {
                sounds.sparkle()
                void say(WORLD_LINES.videoEnd)
                setState('ended')
              }
            },
            onError: () => {
              wantPlay.current = true
              fail()
            },
          },
        })
      })
      .catch(fail)
    return () => {
      gone = true
      player.current?.destroy()
      player.current = null
    }
  }, [video.youtubeId, video.start])

  const start = () => {
    sounds.pop()
    stopSpeaking()
    wantPlay.current = true
    if (!player.current && !api) {
      // YouTube never loaded (offline).
      setState('error')
      void say(WORLD_LINES.videoOffline)
      return
    }
    setState('loading')
    // Called inside the tap, so the browser counts it as hers and plays with sound.
    if (ready.current) player.current?.playVideo()
    // If it still isn't playing, the browser wanted a tap on the video itself: uncover it and let her tap it.
    setTimeout(() => {
      if (stateRef.current === 'loading') setState('tap-video')
    }, 2500)
  }
  const resume = () => {
    sounds.pop()
    player.current?.playVideo()
  }
  const pause = () => player.current?.pauseVideo()
  const replay = () => {
    sounds.pop()
    player.current?.seekTo(video.start ?? 0, true)
    player.current?.playVideo()
  }

  // Tap = pause, swipe up = full screen, swipe down = back to the theater.
  const down = useRef<{ x: number; y: number } | null>(null)
  const onPointerDown = (e: PointerEvent) => {
    down.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: PointerEvent) => {
    if (!down.current) return
    const dx = e.clientX - down.current.x
    const dy = e.clientY - down.current.y
    down.current = null
    if (Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx)) {
      if ((dy < 0) !== full) {
        sounds.whoosh()
        onFull(!full)
      }
    } else if (Math.hypot(dx, dy) < 16) pause()
  }

  return (
    <FitBox ratio={16 / 9}>
      <div className={`yt-frame${full ? ' full' : ''}`}>
        <div ref={wrap} className="yt-host" />

        {state === 'playing' && (
          <div aria-label="Pause the video" role="button" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (down.current = null)} style={{ position: 'absolute', inset: 0, touchAction: 'none', cursor: 'pointer' }}>
            <Progress player={player} />
            <FullButton full={full} onFull={onFull} />
          </div>
        )}
        {state === 'loading' && <div aria-hidden style={{ position: 'absolute', inset: 0 }} />}
        {state === 'tap-video' && (
          <motion.span
            aria-hidden
            animate={{ scale: [1, 1.15, 1], opacity: [0.9, 0.5, 0.9] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%', width: 'clamp(110px, 36cqmin, 200px)', aspectRatio: '1', borderRadius: '50%', border: '8px solid var(--gold)', pointerEvents: 'none' }}
          />
        )}

        {(state === 'poster' || state === 'loading') && (
          <button aria-label="Play the video" onClick={start} disabled={state === 'loading'} style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'var(--lavender)' }}>
            {thumbOk ? (
              <img src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="" onError={() => setThumbOk(false)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ position: 'absolute', fontSize: '40cqmin', opacity: 0.35 }}>{video.icon}</span>
            )}
            <span style={{ position: 'absolute', left: 'clamp(10px, 3cqmin, 24px)', top: 'clamp(10px, 3cqmin, 24px)', width: 'clamp(56px, 18cqmin, 110px)', aspectRatio: '1', borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', fontSize: 'clamp(30px, 10cqmin, 60px)', boxShadow: 'var(--shadow)' }}>{video.icon}</span>
            {state === 'loading' ? <Spinner /> : <BigPlay />}
          </button>
        )}

        <AnimatePresence>
          {state === 'paused' && (
            <Cover key="paused" onClick={resume} label="Keep watching">
              <BigPlay />
              {full && <FullButton full onFull={onFull} />}
            </Cover>
          )}
          {state === 'ended' && (
            <Cover key="ended">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ fontSize: 'clamp(44px, 20cqmin, 120px)' }}>
                🎉
              </motion.div>
              <div style={{ display: 'flex', gap: 'clamp(12px, 4cqw, 32px)' }}>
                <BigButton color="lavender" onClick={replay} ariaLabel="Watch again">
                  ↻
                </BigButton>
                <BigButton color="pink" onClick={onDone} ariaLabel="All done">
                  ✓
                </BigButton>
              </div>
            </Cover>
          )}
          {state === 'error' && (
            <Cover key="error">
              <Mascot pose="think" size={Math.min(160, window.innerHeight * 0.18)} />
              <BigButton color="pink" onClick={onDone} ariaLabel="All done">
                ✓
              </BigButton>
            </Cover>
          )}
        </AnimatePresence>
      </div>
    </FitBox>
  )
}

/** A thin pink bar along the bottom, since YouTube's own controls are hidden. */
function Progress({ player }: { player: { current: YTPlayer | null } }) {
  const [p, setP] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      const d = player.current?.getDuration() ?? 0
      if (d > 0) setP(Math.min(1, (player.current?.getCurrentTime() ?? 0) / d))
    }, 500)
    return () => clearInterval(id)
  }, [player])
  return (
    <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 'clamp(6px, 1.6cqmin, 10px)', background: 'rgba(255,255,255,0.3)' }}>
      <div style={{ height: '100%', width: `${p * 100}%`, background: 'var(--hotpink)', transition: 'width 0.5s linear' }} />
    </div>
  )
}

/** Corner button that does what the swipe does (grow to full screen / shrink back). */
function FullButton({ full, onFull }: { full: boolean; onFull: (full: boolean) => void }) {
  return (
    <motion.button
      aria-label={full ? 'Small screen' : 'Full screen'}
      whileTap={{ scale: 0.85 }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        sounds.whoosh()
        onFull(!full)
      }}
      style={{ position: 'absolute', right: 'clamp(8px, 2.5cqmin, 20px)', bottom: 'clamp(14px, 4cqmin, 28px)', width: 'clamp(52px, 13cqmin, 76px)', aspectRatio: '1', borderRadius: '50%', background: 'rgba(255,255,255,0.85)', boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center' }}
    >
      <svg viewBox="0 0 24 24" width="55%" height="55%" fill="none" stroke="var(--ink)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        {full ? <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" /> : <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />}
      </svg>
    </motion.button>
  )
}

function BigPlay() {
  return (
    <motion.span
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ repeat: Infinity, duration: 1.4 }}
      className="world-glow"
      style={{ position: 'relative', width: 'clamp(96px, 30cqmin, 170px)', aspectRatio: '1', borderRadius: '50%', background: 'var(--hotpink)', border: '6px solid #fff', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 'clamp(44px, 14cqmin, 80px)', paddingLeft: '0.12em' }}
    >
      ▶
    </motion.span>
  )
}

function Spinner() {
  return (
    <motion.span
      aria-hidden
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      style={{ position: 'relative', width: 'clamp(80px, 24cqmin, 130px)', aspectRatio: '1', borderRadius: '50%', border: '12px solid rgba(255,255,255,0.6)', borderTopColor: 'var(--hotpink)' }}
    />
  )
}

/** Covers the video (and YouTube's suggestions under it) with our own friendly screen. */
function Cover({ children, onClick, label }: { children: ReactNode; onClick?: () => void; label?: string }) {
  return (
    <motion.div
      role={onClick ? 'button' : undefined}
      aria-label={label}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(217, 204, 255, 0.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px, 4cqmin, 24px)', cursor: onClick ? 'pointer' : undefined }}
    >
      {children}
    </motion.div>
  )
}

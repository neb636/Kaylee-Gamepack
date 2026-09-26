import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BigButton, Mascot, say, sounds, stopSpeaking } from '../../sdk'
import { WORLD_LINES } from '../lines'
import type { PlaceVideo } from '../types'
import { FitBox } from './Chrome'

// The bits of the YouTube IFrame API we use (loaded from YouTube at runtime, no npm package).
interface YTPlayer {
  playVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
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

type State = 'poster' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'

/**
 * A kid-safe YouTube screen: a big ▶ poster first, then the video inline. Our own overlays cover YouTube's
 * "more videos" panels when it pauses or ends, and a strip over the title keeps taps from leaving the app.
 */
export function YouTubePlayer({ video, onDone }: { video: PlaceVideo; onDone: () => void }) {
  const [state, setState] = useState<State>('poster')
  const [thumbOk, setThumbOk] = useState(true)
  const wrap = useRef<HTMLDivElement>(null)
  const player = useRef<YTPlayer | null>(null)

  useEffect(() => {
    void loadApi().catch(() => {}) // warm up so the tap starts faster
    return () => {
      player.current?.destroy()
      player.current = null
    }
  }, [])

  const start = async () => {
    sounds.pop()
    stopSpeaking()
    setState('loading')
    try {
      const YT = await loadApi()
      if (!wrap.current) return
      // The API replaces the element it gets, so give it one React doesn't own.
      const host = document.createElement('div')
      wrap.current.replaceChildren(host)
      player.current = new YT.Player(host, {
        videoId: video.youtubeId,
        host: 'https://www.youtube-nocookie.com',
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, iv_load_policy: 3, fs: 1, start: video.start ?? 0 },
        events: {
          onReady: (e) => e.target.playVideo(),
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
          onError: () => fail(),
        },
      })
    } catch {
      fail()
    }
  }
  const fail = () => {
    setState('error')
    void say(WORLD_LINES.videoOffline)
  }
  const resume = () => {
    sounds.pop()
    player.current?.playVideo()
  }
  const replay = () => {
    sounds.pop()
    player.current?.seekTo(video.start ?? 0, true)
    player.current?.playVideo()
  }

  const started = state !== 'poster'
  return (
    <FitBox ratio={16 / 9}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'clamp(16px, 3cqmin, 28px)', overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 0 0 6px var(--gold), var(--shadow)', background: '#1d1224', containerType: 'size' }}>
        <div ref={wrap} className="yt-host" style={{ position: 'absolute', inset: 0 }} />

        {/* Taps on the title/channel bar would open YouTube; swallow them. */}
        {(state === 'playing' || state === 'loading') && <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '14%' }} />}

        {!started && (
          <button aria-label="Play the video" onClick={() => void start()} style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'var(--lavender)' }}>
            {thumbOk ? (
              <img src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="" onError={() => setThumbOk(false)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ position: 'absolute', fontSize: '40cqmin', opacity: 0.35 }}>{video.icon}</span>
            )}
            <span style={{ position: 'absolute', left: 'clamp(10px, 3cqmin, 24px)', top: 'clamp(10px, 3cqmin, 24px)', width: 'clamp(56px, 18cqmin, 110px)', aspectRatio: '1', borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', fontSize: 'clamp(30px, 10cqmin, 60px)', boxShadow: 'var(--shadow)' }}>{video.icon}</span>
            <BigPlay />
          </button>
        )}

        <AnimatePresence>
          {state === 'paused' && (
            <Cover key="paused" onClick={resume} label="Keep watching">
              <BigPlay />
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

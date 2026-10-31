import { useEffect, useRef, useState } from 'react'
import type { Route } from '../router'
import { useSaved } from '../sdk/hooks'
import { HalloweenScore } from './halloween-music'
import { useHalloween } from './season'

export function HalloweenMusic({ started, route }: { started: boolean; route: Route }) {
  const halloween = useHalloween(true)
  const [muted, setMuted] = useSaved('halloween:music-muted', false)
  const score = useRef<HalloweenScore | null>(null)
  const [videoOpen, setVideoOpen] = useState(false)
  useEffect(() => {
    const changed = (event: Event) => setVideoOpen((event as CustomEvent<boolean>).detail)
    window.addEventListener('kaylee:video-open', changed)
    return () => window.removeEventListener('kaylee:video-open', changed)
  }, [])
  // Movies and the trips with their own race score keep their own soundtrack.
  const ownAudio = route.name === 'playground' || (route.name === 'world' && (
    route.place === 'theater' || route.activity === 'theater' ||
    route.place === 'characters' || route.place === 'puppets' ||
    route.activity === 'boat-trip' || route.activity === 'nan-trip'
  ))
  const enabled = halloween && !muted && !ownAudio && !videoOpen
  useEffect(() => {
    const music = score.current ??= new HalloweenScore()
    const refresh = (gesture = false) => {
      if (enabled && !document.hidden) music.start(gesture)
      else music.stop()
    }
    const tap = () => refresh(true)
    const visibility = () => refresh()
    const hide = () => music.stop()
    refresh()
    window.addEventListener('pointerdown', tap)
    window.addEventListener('keydown', tap)
    window.addEventListener('pagehide', hide)
    window.addEventListener('pageshow', visibility)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      music.stop()
      window.removeEventListener('pointerdown', tap)
      window.removeEventListener('keydown', tap)
      window.removeEventListener('pagehide', hide)
      window.removeEventListener('pageshow', visibility)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [enabled])
  useEffect(() => () => { score.current?.dispose(); score.current = null }, [])

  const home = route.name === 'home' || (route.name === 'world' && !route.place)
  if (!halloween || (started && !home)) return null
  return <button
    className="halloween-music"
    aria-label={muted ? 'Turn Halloween music on' : 'Turn Halloween music off'}
    aria-pressed={!muted}
    onClick={() => {
      // Unlock inside this tap too: a device may have loaded with music muted.
      if (muted) score.current?.start(true)
      setMuted(!muted)
    }}
    style={{ position: 'fixed', top: 'calc(var(--safe-top) + 12px)', left: 16, zIndex: 60,
      borderRadius: '50%', background: '#fff3e3', color: '#613a78',
      boxShadow: 'var(--shadow)', border: '3px solid white', fontSize: 28 }}
  >{muted ? '🔇' : '🎵'}</button>
}

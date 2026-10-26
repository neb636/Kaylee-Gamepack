// ?cam=1 on any section of a 3D country: the camera lab, for finding the best camera for a scene. The real game keeps
// running in its own element (World.tsx's `host`), which the lab sizes like an iPad (or the whole window) next to a panel that nudges the game's camera or locks your own,
// freezes the moment, draws guides (the box the game frames, the top bar, the tap targets), and copies a link or a note
// an agent can bake into that world's shot(). Everything you set is in the address bar. Not something Kaylee plays:
// World.tsx loads it lazily, only when the link asks for it.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { camLab } from '../../engine/camLab'
import { IconButton } from '../ui'
import { Guides } from './Guides'
import { frameById, freshCamera, STATE_KEYS, fromParams, toOverride, untouched, writeHash, type CamView, type Frame } from './link'
import { CamPanel } from './Panel'
import '../lab.css'

const deg = Math.PI / 180
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const r1 = (n: number) => Math.round(n * 10) / 10

/** world.css sizes follow the window's media queries; a framed iPad or iPhone gets its own. */
function deviceVars(f: Frame): Record<string, string> {
  if (!f.w || !f.h) return {}
  const short = f.h <= 560
  const narrow = f.w <= 520
  const btn = short ? 60 : 76
  return {
    '--btn': `${btn}px`,
    '--top-clear': `calc(var(--safe-top) + ${short ? 12 : 104}px)`,
    '--bar-clear': `calc(var(--safe-top) + ${btn + 24}px)`,
    '--prompt-font': short ? '19px' : narrow ? '20px' : `${clamp(f.w * 0.034, 22, 34).toFixed(1)}px`,
    '--say-size': short ? '48px' : narrow ? '52px' : '64px',
    '--target': short ? '72px' : narrow ? '84px' : '96px',
    '--theater-side': `${clamp(f.w * 0.04, 16, 56).toFixed(0)}px`,
  }
}

export default function CameraLab({ place, params, host }: { place: string; params: Record<string, string>; host: HTMLDivElement }) {
  const [view, setView] = useState(() => fromParams(params))
  const [ab, setAb] = useState(false)
  const [orbit, setOrbit] = useState(false)
  const [panel, setPanel] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [room, setRoom] = useState({ w: 0, h: 0 })
  const stage = useRef<HTMLDivElement>(null)
  const viewRef = useRef(view)
  viewRef.current = view
  const frozen = useSyncExternalStore(camLab.subscribe, () => camLab.frozen)

  const set = useCallback((patch: Partial<CamView>) => setView((v) => ({ ...v, ...patch })), [])

  // The rig and the address bar follow the view (the first time, the camera jumps there).
  const first = useRef(true)
  useEffect(() => {
    camLab.setOverride(ab ? null : toOverride(view), first.current)
    first.current = false
    writeHash(view)
  }, [view, ab])
  // A link opened while the lab is up (typed, pasted, or the scene picker): start over from its camera.
  // (The route's params only change on a hashchange: the lab's own writes use replaceState.)
  const seen = useRef(params)
  useEffect(() => {
    if (params === seen.current) return
    seen.current = params
    setView(fromParams(params))
  }, [params])
  // Leaving the lab: the game's own camera, nothing frozen.
  useEffect(
    () => () => {
      camLab.setOverride(null)
      camLab.setFrozen(false)
    },
    [],
  )

  const toastTimer = useRef(0)
  const showToast = useCallback((text: string) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1800)
  }, [])

  // The game moving on by itself (the next section or round, as she plays) is a new scene too: back to the game's own
  // camera, so a change made for one scene never carries into the next. A link opened by hand keeps its camera: when
  // it restarts the activity (useSections starts a fresh section log), the section it lands on is adopted as it is.
  useEffect(() => {
    const key = (log: typeof window.__kayleeSectionLog) => {
      const s = log?.[log.length - 1]
      return s ? JSON.stringify([s.place, s.activity, s.id, ...STATE_KEYS.map((k) => s.params[k] ?? null)]) : null
    }
    let log = window.__kayleeSectionLog
    let scene = key(log)
    let linked = false
    const onHash = () => void (linked = true)
    const id = setInterval(() => {
      const now = window.__kayleeSectionLog
      if (now !== log) {
        log = now
        if (linked) scene = null
        linked = false
      }
      const k = key(now)
      if (!k || k === scene) return
      const moved = scene !== null
      scene = k
      if (moved && !untouched(viewRef.current)) {
        setView(freshCamera(viewRef.current))
        showToast('New scene: the game’s camera')
      }
    }, 250)
    window.addEventListener('hashchange', onHash)
    return () => {
      clearInterval(id)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  // How much room the frame has (measured before the first paint, so the game never lays out at zero size).
  useLayoutEffect(() => {
    const el = stage.current
    if (!el) return
    const measure = () => setRoom({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const frame = frameById(view.frame)
  const pad = 20
  const scale = frame.w && frame.h && room.w ? Math.min((room.w - 2 * pad) / frame.w, (room.h - 2 * pad) / frame.h, 1) : 1
  const screen = frame.w && frame.h ? { w: frame.w, h: frame.h } : room

  // The game's element becomes the frame: sized and scaled in the stage (which starts at the world's top left corner),
  // its own containing block and stacking layer. Closing the lab gives it back as it was.
  const original = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (!room.w || !room.h) return
    original.current ??= host.style.cssText
    const vars = deviceVars(frame)
    const dev = !!(frame.w && frame.h)
    const w = dev ? frame.w! : room.w
    const h = dev ? frame.h! : room.h
    host.style.cssText = original.current
    Object.assign(host.style, {
      inset: 'auto',
      left: `${dev ? Math.round((room.w - w * scale) / 2) : 0}px`,
      top: `${dev ? Math.round((room.h - h * scale) / 2) : 0}px`,
      width: `${w}px`,
      height: `${h}px`,
      transform: dev ? `scale(${scale})` : '',
      transformOrigin: '0 0',
      overflow: 'hidden',
      contain: 'layout paint',
      zIndex: '1',
      borderRadius: dev ? '18px' : '',
      boxShadow: dev ? '0 0 0 1px rgba(20, 20, 30, 0.1), 0 14px 44px rgba(20, 20, 30, 0.2)' : '',
    })
    for (const [k, v] of Object.entries(vars)) host.style.setProperty(k, v)
  }, [host, frame, room.w, room.h, scale])
  useEffect(
    () => () => {
      if (original.current !== null) host.style.cssText = original.current
    },
    [host],
  )

  // Scroll or pinch over the game zooms (always); with "orbit by hand" on, a drag turns the camera and shift-drag pans.
  useEffect(() => {
    const els = [stage.current, host].filter((x): x is HTMLDivElement => !!x)
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      const v = viewRef.current
      const k = Math.exp(e.deltaY * (e.ctrlKey ? 0.01 : 0.0015))
      setView({ ...v, zoom: Math.round(clamp(v.zoom * k, 0.3, 3) * 100) / 100 })
    }
    for (const el of els) el.addEventListener('wheel', wheel, { passive: false })
    return () => els.forEach((el) => el.removeEventListener('wheel', wheel))
  }, [host])

  const drag = useRef<{ x: number; y: number; pan: boolean; v: CamView; pointer: number } | null>(null)
  const onOrbitDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, pan: e.shiftKey || e.altKey || e.button === 2, v: viewRef.current, pointer: e.pointerId }
  }
  const onOrbitMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d || d.pointer !== e.pointerId) return
    const dx = (e.clientX - d.x) / scale
    const dy = (e.clientY - d.y) / scale
    if (d.pan) {
      // Meters per screen pixel at the look-at point: the scene follows the finger.
      const fr = camLab.world?.rig.framed()
      const h = camLab.world?.host.offsetHeight || screen.h || 1
      const mpp = fr ? (2 * fr.dist * Math.tan((fr.fov * deg) / 2)) / h : 0.01
      set({ px: Math.round((d.v.px - dx * mpp) * 100) / 100, py: Math.round((d.v.py + dy * mpp) * 100) / 100 })
    } else {
      const lock = d.v.mode === 'lock'
      set({ yaw: r1(d.v.yaw - dx * 0.25), pitch: r1(clamp(d.v.pitch + dy * 0.2, lock ? -10 : -60, lock ? 89 : 60)) })
    }
  }
  const onOrbitUp = (e: PointerEvent) => {
    if (drag.current?.pointer === e.pointerId) drag.current = null
  }

  return (
    <div className={`cam-lab${panel ? '' : ' no-panel'}`}>
      <main className="cm-stage" ref={stage}>
        {createPortal(
          <>
            <Guides guides={view.guides} />
            {orbit && <div className="cm-orbit" onPointerDown={onOrbitDown} onPointerMove={onOrbitMove} onPointerUp={onOrbitUp} onPointerCancel={onOrbitUp} onContextMenu={(e) => e.preventDefault()} />}
            {ab && <div className="cm-badge">Game’s camera</div>}
            {frozen && <div className="cm-badge right">Frozen</div>}
          </>,
          host,
        )}
        {!panel && (
          <div className="cam-panel cl-card cm-open">
            <IconButton icon="panelR" label="Show the camera lab" onClick={() => setPanel(true)} />
          </div>
        )}
        {toast && <div className="cl-toast cm-toast">{toast}</div>}
      </main>
      {panel && <CamPanel place={place} view={view} set={set} ab={ab} setAb={setAb} orbit={orbit} setOrbit={setOrbit} frozen={frozen} onHide={() => setPanel(false)} toast={showToast} screen={screen} />}
    </div>
  )
}

// #/world/characters/<id>?<state>: the character lab, for Dad and for whoever builds the next character. Every 3D
// character in Thailand (Kaylee, the family, the trips' extras, the bay's critters) on a turntable in a plain studio:
// pick one or line several up, pose them, play their actions in slow motion and film them, play any line they say in
// their own voice, dress Kaylee, change the light, the backdrop and the lens, and export a PNG. Everything you set is
// in the address bar, so a link opens the same view. Not something Kaylee plays: World.tsx loads it lazily, so only
// this route downloads three.js.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { stopSpeaking } from '../../../../sdk'
import type { Wearable } from '../characters/looks'
import type { Pose } from '../characters/types'
import { View3D, type RenderMode } from '../engine/View3D'
import { CAST, castById } from './catalog'
import { BACKDROPS, LeftPanel, LineBar, RightPanel, Toolbar, TopRight, type LabApi } from './Panels'
import { Studio, type Hideable, type ShotKind, type StudioView, type Tool } from './studio'
import { IconButton } from './ui'
import './lab.css'

const DEFAULTS: StudioView = {
  ids: ['kaylee'],
  selected: 'kaylee',
  pose: 'stand',
  wear: [],
  phone: true,
  wind: 0,
  spin: false,
  spinSecs: 8,
  steps: false,
  slow: false,
  tool: 'select',
  shot: 'body',
  zoom: 1,
  yaw: 0,
  pitch: 8,
  fov: 30,
  bg: BACKDROPS[0].color,
  hide: [],
}

const num = (v: string | undefined, d: number) => (v !== undefined && v !== '' && !isNaN(+v) ? +v : d)
const list = (v: string | undefined) => (v ? v.split(',').filter(Boolean) : [])

/** The view a link describes (anything missing: the defaults). */
function fromLink(id: string | undefined, p: Record<string, string>): StudioView {
  const selected = castById(id)?.id ?? DEFAULTS.selected
  const lineup = list(p.lineup).filter((x) => castById(x))
  const ids = lineup.length ? (lineup.includes(selected) ? lineup : [selected, ...lineup]) : [selected]
  return {
    ids,
    selected,
    pose: (p.pose as Pose) ?? DEFAULTS.pose,
    wear: list(p.wear) as Wearable[],
    phone: p.phone !== '0',
    wind: num(p.wind, DEFAULTS.wind),
    spin: p.spin === '1',
    spinSecs: num(p.secs, DEFAULTS.spinSecs),
    steps: p.steps === '1',
    slow: p.slow === '1',
    tool: (['select', 'pan', 'look'].includes(p.tool) ? p.tool : DEFAULTS.tool) as Tool,
    shot: (['body', 'face', 'lineup'].includes(p.shot) ? p.shot : ids.length > 1 ? 'lineup' : 'body') as ShotKind,
    zoom: num(p.zoom, DEFAULTS.zoom),
    yaw: num(p.yaw, DEFAULTS.yaw),
    pitch: num(p.pitch, DEFAULTS.pitch),
    fov: num(p.fov, DEFAULTS.fov),
    bg: BACKDROPS.find((b) => b.id === p.bg)?.color ?? DEFAULTS.bg,
    hide: list(p.hide) as Hideable[],
  }
}

/** The link for a view: only what differs from the defaults. */
function toLink(v: StudioView) {
  const p: Record<string, string> = {}
  if (v.ids.length > 1) p.lineup = v.ids.join(',')
  if (v.pose !== DEFAULTS.pose) p.pose = v.pose
  if (v.wear.length) p.wear = v.wear.join(',')
  if (!v.phone) p.phone = '0'
  if (v.wind) p.wind = String(v.wind)
  if (v.spin) p.spin = '1'
  if (v.spinSecs !== DEFAULTS.spinSecs) p.secs = String(v.spinSecs)
  if (v.steps) p.steps = '1'
  if (v.slow) p.slow = '1'
  if (v.tool !== DEFAULTS.tool) p.tool = v.tool
  if (v.shot !== (v.ids.length > 1 ? 'lineup' : 'body')) p.shot = v.shot
  if (v.zoom !== DEFAULTS.zoom) p.zoom = String(v.zoom)
  if (v.yaw !== DEFAULTS.yaw) p.yaw = String(v.yaw)
  if (v.pitch !== DEFAULTS.pitch) p.pitch = String(v.pitch)
  if (v.fov !== DEFAULTS.fov) p.fov = String(v.fov)
  if (v.bg !== DEFAULTS.bg) p.bg = BACKDROPS.find((b) => b.color === v.bg)?.id ?? 'studio'
  if (v.hide.length) p.hide = v.hide.join(',')
  const q = Object.entries(p)
    .map(([k, val]) => `${k}=${encodeURIComponent(val).replace(/%2C/g, ',')}`)
    .join('&')
  return `#/world/characters/${encodeURIComponent(v.selected)}${q ? `?${q}` : ''}`
}

const wide = () => typeof window === 'undefined' || window.matchMedia('(min-width: 901px)').matches

export default function CharacterLab({ id, params = {} }: { id?: string; params?: Record<string, string> }) {
  const [view, setView] = useState(() => fromLink(id, params))
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [film, setFilm] = useState<string[]>([])
  const [loop, setLoopState] = useState(false)
  const [left, setLeft] = useState(wide)
  const [right, setRight] = useState(wide)
  const [toast, setToast] = useState<string | null>(null)
  const studio = useRef<Studio | null>(null)
  const viewRef = useRef(view)
  viewRef.current = view
  const written = useRef('')
  const searchRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const set = useCallback((patch: Partial<StudioView>) => setView((v) => ({ ...v, ...patch })), [])

  // The address bar follows the view (replaceState: no hashchange, so the route doesn't remount).
  useEffect(() => {
    studio.current?.apply(view)
    const hash = toLink(view)
    if (location.hash !== hash) history.replaceState(history.state, '', hash)
    written.current = location.hash
  }, [view])
  // A link opened while the lab is up (typed, or from another tab): start over from it.
  useEffect(() => {
    if (written.current && location.hash !== written.current) setView(fromLink(id, params))
  }, [id, JSON.stringify(params)])
  useEffect(() => () => stopSpeaking(), [])

  const toastTimer = useRef(0)
  const showToast = useCallback((text: string) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1800)
  }, [])

  const select = useCallback(
    (to: string) =>
      setView((v) => {
        if (v.ids.includes(to)) return { ...v, selected: to }
        // Not on stage: they take the selected one's place (a lineup stays a lineup).
        const ids = v.ids.length > 1 ? v.ids.map((x) => (x === v.selected ? to : x)) : [to]
        return { ...v, ids, selected: to, zoom: 1 }
      }),
    [],
  )
  const toggleLineup = useCallback(
    (to: string) =>
      setView((v) => {
        if (v.ids.includes(to)) {
          if (v.ids.length < 2) return v
          const ids = v.ids.filter((x) => x !== to)
          return { ...v, ids, selected: v.selected === to ? ids[0] : v.selected, shot: ids.length < 2 && v.shot === 'lineup' ? 'body' : v.shot }
        }
        return { ...v, ids: [...v.ids, to], shot: v.ids.length === 1 && v.shot === 'body' ? 'lineup' : v.shot, zoom: 1 }
      }),
    [],
  )
  const step = useCallback(
    (dir: 1 | -1) => {
      const i = CAST.findIndex((c) => c.id === viewRef.current.selected)
      select(CAST[(i + dir + CAST.length) % CAST.length].id)
    },
    [select],
  )
  const setLoop = (on: boolean) => {
    setLoopState(on)
    if (studio.current) studio.current.loop = on
  }

  const entry = castById(view.selected) ?? CAST[0]
  const lab: LabApi = useMemo(() => ({ view, set, select, toggleLineup, step, entry, studio, toast: showToast }), [view, set, select, toggleLineup, step, entry, showToast])

  // Keys: ⌘K searches, ← → step through the cast.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setLeft(true)
        searchRef.current?.focus()
        searchRef.current?.select()
      } else if (!typing && e.key === 'ArrowLeft') step(-1)
      else if (!typing && e.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  // Two fingers pinch to zoom, a mouse wheel or trackpad zooms too.
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const pts = new Map<number, { x: number; y: number }>()
    let start = 0
    const gap = () => {
      const [a, b] = [...pts.values()]
      return Math.hypot(a.x - b.x, a.y - b.y)
    }
    const down = (e: PointerEvent) => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pts.size === 2) start = gap()
    }
    const move = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pts.size === 2 && start > 0) studio.current?.pinchZoom(gap() / start)
    }
    const up = (e: PointerEvent) => {
      if (!pts.delete(e.pointerId)) return
      if (pts.size < 2 && start > 0) {
        start = 0
        studio.current?.pinchZoom(null)
      }
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      studio.current?.wheel(e.deltaY)
    }
    el.addEventListener('pointerdown', down, true)
    window.addEventListener('pointermove', move, true)
    window.addEventListener('pointerup', up, true)
    window.addEventListener('pointercancel', up, true)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', down, true)
      window.removeEventListener('pointermove', move, true)
      window.removeEventListener('pointerup', up, true)
      window.removeEventListener('pointercancel', up, true)
      el.removeEventListener('wheel', wheel)
    }
  }, [])

  const make = useCallback(
    (renderer: ConstructorParameters<typeof Studio>[0]) => {
      const s = new Studio(renderer)
      s.apply(viewRef.current)
      s.onOrbit = (o) => setView((v) => ({ ...v, ...o }))
      s.onFilm = setFilm
      s.onPick = select
      return s
    },
    [select],
  )

  const onExport = () => {
    const url = studio.current?.snapshot()
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `${view.ids.length > 1 ? view.ids.join('-') : view.selected}-${view.pose}.png`
    a.click()
    showToast('PNG saved')
  }
  const onShare = () => {
    const link = location.href
    if (navigator.clipboard)
      navigator.clipboard.writeText(link).then(
        () => showToast('Link copied'),
        () => showToast('Copy the link from the address bar'),
      )
    else showToast('Copy the link from the address bar')
  }

  const hint = view.tool === 'pan' ? 'Drag to pan · pinch or scroll to zoom' : view.tool === 'look' ? 'Move the pointer: they look at it' : 'Tap someone to say hi · drag to orbit · pinch or scroll to zoom'

  return (
    <div className={`cast-lab${left ? '' : ' no-left'}${right ? '' : ' no-right'}`}>
      <LeftPanel lab={lab} onClose={() => setLeft(false)} onPicked={() => !wide() && setLeft(false)} searchRef={searchRef} />
      <main className="cl-stage">
        <div className="cl-canvas" ref={canvasRef} style={{ background: view.bg }}>
          {mode === 'webgl' ? (
            <View3D make={make} name="The character lab" qaKey="__thaiCastQA" onMode={setMode} worldRef={studio} anchors={() => null} />
          ) : (
            <div className="cl-empty">The 3D view stopped (the iPad took the GPU back). Reload the page to wake it.</div>
          )}
        </div>
        {!left && (
          <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 6 }} className="cl-card">
            <IconButton icon="panel" label="Show the cast" onClick={() => setLeft(true)} />
          </div>
        )}
        <Toolbar lab={lab} onExport={onExport} />
        <TopRight lab={lab} onShare={onShare} panelHidden={!right} openPanel={() => setRight(true)} />
        {toast && <div className="cl-toast">{toast}</div>}
        <div className="cl-hint">{hint}</div>
        <LineBar lab={lab} />
      </main>
      <RightPanel lab={lab} film={film} loop={loop} setLoop={setLoop} onClose={() => setRight(false)} />
    </div>
  )
}

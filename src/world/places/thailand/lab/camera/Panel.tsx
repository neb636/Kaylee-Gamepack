// The camera lab's side panel: which scene, which screen, the camera itself (nudge the game's camera or lock your own),
// freeze and orbit, the guides, what the camera is doing now, and the hand-off (a link, a note for an agent, a PNG).
import { useEffect, useState } from 'react'
import type { Vector3 } from 'three'
import { worldLink } from '../../../../../router'
import { HUB } from '../../../../kit/sections'
import { findPlace, sectionsFor } from '../../../../registry'
import { camLab } from '../../engine/camLab'
import { TUNE } from '../../engine/tune'
import { IconButton, Section, Segmented, Select, Slider, Toggle, Field } from '../ui'
import { camParams, FRAMES, STATE_KEYS, frameById, freshCamera, GUIDES, untouched, withoutCam, type CamView } from './link'

export interface PanelProps {
  place: string
  view: CamView
  set: (patch: Partial<CamView>) => void
  /** Showing the game's own camera for a moment (A/B). */
  ab: boolean
  setAb: (on: boolean) => void
  orbit: boolean
  setOrbit: (on: boolean) => void
  frozen: boolean
  onHide: () => void
  toast: (text: string) => void
  /** The real screen size the game is laid out at now. */
  screen: { w: number; h: number }
}

const f = (n: number, d = 2) => String(+n.toFixed(d))
const v3 = (v: Vector3) => `(${f(v.x)}, ${f(v.y)}, ${f(v.z)})`
const signed = (n: number, d = 1) => `${n > 0 ? '+' : ''}${f(n, d)}`

export function CamPanel({ place, view, set, ab, setAb, orbit, setOrbit, frozen, onHide, toast, screen }: PanelProps) {
  // The readout follows the game a few times a second.
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 250)
    return () => clearInterval(id)
  }, [])

  const world = camLab.world
  const shot = world?.rig.shot ?? null
  const framed = world?.rig.framed() ?? null
  const gameLens = world?.rig.fov ?? TUNE.fov
  const here = window.__kayleeSection
  const meta = findPlace(place)?.meta
  const activities = meta
    ? [...(sectionsFor(place, HUB) ? [{ id: HUB, name: 'Home base', icon: '🏠' }] : []), ...meta.activities, ...(meta.inTheWorks ?? [])].filter((a) => sectionsFor(place, a.id))
    : []
  const activity = here?.activity ?? activities[0]?.id
  const sections = activity ? (sectionsFor(place, activity)?.sections ?? []) : []
  const state = (() => {
    const qa = world?.qa() ?? {}
    return STATE_KEYS.filter((k) => ['string', 'number', 'boolean'].includes(typeof qa[k])).map((k) => `${k} ${qa[k]}`)
  })()
  const frame = frameById(view.frame)
  const tall = screen.w < screen.h
  const reach = Math.max(1, Math.ceil(Math.max(shot?.half.x ?? 1, shot?.half.y ?? 1, shot?.half.z ?? 1) * 2))

  // Another scene starts from the game's own camera, so what you change is only ever this scene's. (The lab reads the
  // new link's camera.)
  const open = (act: string, sec: string | undefined) => {
    location.hash = worldLink(place, act, sec, camParams(freshCamera(view)))
  }

  const setMode = (mode: CamView['mode']) => {
    if (mode === view.mode) return
    // Keep the camera where it is: nudges become the angles they add up to, and back.
    const g = shot ?? { yaw: 0, pitch: 0 }
    if (mode === 'lock') set({ mode, yaw: g.yaw + view.yaw, pitch: g.pitch + view.pitch })
    else set({ mode, yaw: view.yaw - g.yaw, pitch: view.pitch - g.pitch })
  }

  const reset = () => set(freshCamera(view))

  const copy = (text: string, done: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast(done), () => toast('Copy it from the address bar'))
    else toast('Copy it from the address bar')
  }

  const forAgent = () => {
    if (!shot || !framed) return ''
    const link = `${location.origin}${location.pathname}${location.hash}`
    const plain = withoutCam(location.hash)
    const z = view.zoom
    const lines = [
      `Camera for ${plain} on ${frame.id === 'fill' ? 'a' : 'the'} ${frame.id === 'fill' ? `${screen.w}×${screen.h} window` : frame.label} (${tall ? 'tall' : 'wide'} screen)${state.length ? `, ${state.join(', ')}` : ''}`,
      `Game's shot: center ${v3(shot.center)} · half ${v3(shot.half)} · yaw ${f(shot.yaw, 1)} · pitch ${f(shot.pitch, 1)} · lens ${f(gameLens, 1)}${shot.minDist !== undefined ? ` · minDist ${f(shot.minDist)}` : ''}${shot.follow ? ' · follow' : ''}`,
      untouched(view)
        ? 'Change: none (the game’s own camera)'
        : `Change (${view.mode}): ${[
            view.mode === 'lock' ? `yaw ${f(view.yaw, 1)}` : view.yaw && `yaw ${signed(view.yaw)}`,
            view.mode === 'lock' ? `pitch ${f(view.pitch, 1)}` : view.pitch && `pitch ${signed(view.pitch)}`,
            z !== 1 && `zoom ×${f(z)}`,
            view.fov && `lens ${f(view.fov, 1)}`,
            view.px && `pan right ${f(view.px)} m`,
            view.py && `pan up ${f(view.py)} m`,
          ]
            .filter(Boolean)
            .join(' · ')}`,
      `As code: { center: new Vector3(${f(framed.center.x)}, ${f(framed.center.y)}, ${f(framed.center.z)}), half: new Vector3(${f(shot.half.x * z)}, ${f(shot.half.y * z)}, ${f(shot.half.z * z)}), yaw: ${f(framed.yaw, 1)}, pitch: ${f(framed.pitch, 1)}${shot.minDist !== undefined ? `, minDist: ${f(shot.minDist * z)}` : ''}${shot.maxDist !== undefined ? `, maxDist: ${f(shot.maxDist * z)}` : ''}${shot.follow ? ', follow: true' : ''} }${view.fov ? ` and this.rig.fov = ${f(view.fov, 1)}` : ''}`,
      `(Zoom is baked in by scaling half and minDist: the same framing.) Lab link: ${link}`,
    ]
    return lines.join('\n')
  }

  const png = () => {
    const url = world?.snapshot()
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `${[here?.activity, here?.id, frame.id === 'fill' ? `${screen.w}x${screen.h}` : frame.id].filter(Boolean).join('-')}.png`
    a.click()
    toast('PNG saved')
  }

  return (
    <aside className="cl-card cl-panel cam-panel cm-panel">
      <div className="cl-head">
        <div className="cl-logo">🎥</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="cl-title">Camera lab</div>
          <div className="cl-sub">Find the best camera for this scene</div>
        </div>
        <IconButton icon="panelR" label="Hide the panel" small onClick={onHide} />
        <IconButton icon="x" label="Close the camera lab" small onClick={() => (location.hash = withoutCam(location.hash))} />
      </div>
      <div className="cl-panel-scroll">
        <Section title="Scene">
          <Field label={<span className="cl-sub">Game</span>}>
            <Select
              value={activity ?? ''}
              options={activities.map((a) => ({ id: a.id, label: `${a.icon ?? ''} ${a.name}` }))}
              label={<span className="cm-ellipsis">{activities.find((a) => a.id === activity)?.name ?? 'Pick a game'}</span>}
              align="right"
              onChange={(id) => open(id, undefined)}
            />
          </Field>
          <Field label={<span className="cl-sub">Section</span>}>
            <Select
              value={here?.id ?? ''}
              options={sections.map((s, i) => ({ id: s.id, label: `${i + 1}. ${s.name}` }))}
              label={<span className="cm-ellipsis">{sections.find((s) => s.id === here?.id)?.name ?? 'From the start'}</span>}
              align="right"
              onChange={(id) => activity && open(activity, id)}
            />
          </Field>
          {state.length > 0 && <div className="cl-sub cm-mono">{state.join(' · ')}</div>}
        </Section>

        <Section title="Screen" aside={<span className="cl-sub">{`${screen.w} × ${screen.h} · ${tall ? 'tall' : 'wide'}`}</span>}>
          <div className="cm-frames">
            {FRAMES.map((fr) => (
              <button key={fr.id} className="cl-chip" aria-pressed={view.frame === fr.id} title={fr.label} onClick={() => set({ frame: fr.id })}>
                {fr.short}
              </button>
            ))}
          </div>
        </Section>

        <Section
          title="Camera"
          aside={
            <span style={{ display: 'flex', gap: 2 }}>
              <button className="cl-chip cm-ab" aria-pressed={ab} title="Hold to see the game's own camera" onPointerDown={() => setAb(true)} onPointerUp={() => setAb(false)} onPointerLeave={() => setAb(false)}>
                A/B
              </button>
              <IconButton icon="rotate" label="Back to the game's camera" small onClick={reset} />
            </span>
          }
        >
          <Segmented
            value={view.mode}
            options={[
              { id: 'nudge', label: 'Nudge the game’s' },
              { id: 'lock', label: 'Lock my own' },
            ]}
            onChange={setMode}
          />
          <div className="cl-sub" style={{ margin: '6px 2px 4px' }}>
            {view.mode === 'nudge' ? 'Added to every shot the game picks, so each round still frames its own box.' : 'One angle for every shot; the game still picks what to look at.'}
          </div>
          {view.mode === 'nudge' ? (
            <>
              <Slider label="Yaw ±" value={view.yaw} min={-180} max={180} step={1} digits={0} onChange={(yaw) => set({ yaw })} />
              <Slider label="Pitch ±" value={view.pitch} min={-60} max={60} step={1} digits={0} onChange={(pitch) => set({ pitch })} />
            </>
          ) : (
            <>
              <Slider label="Yaw" value={view.yaw} min={-180} max={180} step={1} digits={0} onChange={(yaw) => set({ yaw })} />
              <Slider label="Pitch" value={view.pitch} min={-10} max={89} step={1} digits={0} onChange={(pitch) => set({ pitch })} />
            </>
          )}
          <Slider label="Zoom ×" value={view.zoom} min={0.3} max={3} step={0.01} onChange={(zoom) => set({ zoom })} />
          <Slider label="Lens °" value={view.fov || gameLens} min={15} max={80} step={1} digits={0} onChange={(fov) => set({ fov: fov === gameLens ? 0 : fov })} />
          <Slider label="Pan →" value={view.px} min={-reach} max={reach} step={reach / 200} onChange={(px) => set({ px })} />
          <Slider label="Pan ↑" value={view.py} min={-reach} max={reach} step={reach / 200} onChange={(py) => set({ py })} />
        </Section>

        <Section title="Hands">
          <Field label="Freeze the moment">
            <Toggle on={frozen} onChange={(on) => camLab.setFrozen(on)} label="Freeze the moment" />
          </Field>
          <Field label="Orbit by hand">
            <Toggle on={orbit} onChange={setOrbit} label="Orbit by hand" />
          </Field>
          <div className="cl-sub" style={{ marginTop: 4 }}>
            {orbit ? 'Drag to turn · shift-drag to pan · scroll or pinch to zoom. Turn it off to play again.' : 'Taps play the game. Scroll or pinch over it to zoom.'}
          </div>
        </Section>

        <Section title="Guides">
          <div className="cl-chips">
            {GUIDES.map((g) => (
              <button key={g.id} className="cl-chip" aria-pressed={view.guides.includes(g.id)} onClick={() => set({ guides: view.guides.includes(g.id) ? view.guides.filter((x) => x !== g.id) : [...view.guides, g.id] })}>
                {g.label}
              </button>
            ))}
          </div>
          <div className="cl-sub" style={{ marginTop: 6 }}>
            Box: what the game asks the camera to fit. Targets: tap areas in px, red under 64 or under the top bar.
          </div>
        </Section>

        <Section title="Now">
          {shot && framed ? (
            <div className="cl-kv cm-mono">
              <span>game</span>
              <span>{`yaw ${f(shot.yaw, 1)} · pitch ${f(shot.pitch, 1)} · lens ${f(gameLens, 0)}`}</span>
              <span>center</span>
              <span>{v3(shot.center)}</span>
              <span>half</span>
              <span>{v3(shot.half)}</span>
              <span>framed</span>
              <span>{`yaw ${f(framed.yaw, 1)} · pitch ${f(framed.pitch, 1)} · lens ${f(framed.fov, 0)}`}</span>
              <span>distance</span>
              <span>{`${f(framed.dist)} m`}</span>
            </div>
          ) : (
            <div className="cl-sub">No 3D scene on screen.</div>
          )}
        </Section>
      </div>
      <div className="cm-actions">
        <button className="cl-btn" onClick={() => copy(`${location.origin}${location.pathname}${location.hash}`, 'Link copied')}>
          Copy link
        </button>
        <button className="cl-btn" disabled={!shot} onClick={() => copy(forAgent(), 'Copied for an agent')}>
          Copy for agent
        </button>
        <IconButton icon="download" label="Save a PNG" onClick={png} disabled={!world} />
      </div>
    </aside>
  )
}

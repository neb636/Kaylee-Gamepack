// The character lab's panels around the 3D studio: the cast and scene lists (left), the toolbar over the canvas, the
// design and animation controls (right) and the line bar (bottom). CharacterLab.tsx owns the state; these only draw it
// and call back.
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { go } from '../../../../router'
import { lineText, stopSpeaking, type Line } from '../../../../sdk'
import { WEARABLES, type Look } from '../characters/looks'
import type { Pose } from '../characters/types'
import { TUNE } from '../engine/tune'
import { CAST, GROUPS, linesFor, variantsFor, voiceLabel, type CastEntry, type Variant } from './catalog'
import { POSES, type Action, type Hideable, type Studio, type StudioView } from './studio'
import { Field, Icon, IconButton, Section, Segmented, Select, Slider, Toggle, type IconName } from './ui'

export interface LabApi {
  view: StudioView
  set: (patch: Partial<StudioView>) => void
  select: (id: string) => void
  toggleLineup: (id: string) => void
  step: (dir: 1 | -1) => void
  entry: CastEntry
  studio: RefObject<Studio | null>
  toast: (text: string) => void
}

export const BACKDROPS = [
  { id: 'studio', color: '#F2F2F3', label: 'Studio' },
  { id: 'cream', color: '#FFF7F0', label: 'Cream' },
  { id: 'pink', color: '#FFE3EE', label: 'Pink' },
  { id: 'lavender', color: '#ECE6FF', label: 'Lavender' },
  { id: 'sky', color: '#DDF0FF', label: 'Sky' },
  { id: 'night', color: '#2D2A4A', label: 'Night' },
] as const

const POSE_LABEL: Record<Pose, string> = { stand: 'Stand', sit: 'Sit', lie: 'Lie', wai: 'Wai', peek: 'Peek', lookup: 'Look up', bounce: 'Bounce' }
const ALL_POSES: Pose[] = ['stand', 'sit', 'lie', 'wai', 'peek', 'lookup', 'bounce']
const ACTIONS: { id: Action; label: string }[] = [
  { id: 'hop', label: 'Hop' },
  { id: 'wave', label: 'Wave' },
  { id: 'wiggle', label: 'Wiggle' },
  { id: 'cheer', label: 'Cheer' },
  { id: 'heart', label: 'Heart' },
  { id: 'silly', label: 'Silly' },
]

/** The little round swatch for someone in a list: their fur, with a light patch. */
export function Dot({ e, size = 22 }: { e: CastEntry; size?: number }) {
  return <span className="cl-dot" style={{ width: size, height: size, background: e.color }} />
}

// ---------------------------------------------------------------- left: cast and scene

export function LeftPanel({ lab, onClose, onPicked, searchRef }: { lab: LabApi; onClose: () => void; onPicked: () => void; searchRef: RefObject<HTMLInputElement | null> }) {
  const [tab, setTab] = useState<'cast' | 'scene'>('cast')
  const [q, setQ] = useState('')
  const [popover, setPopover] = useState<{ id: string; top: number; left: number } | null>(null)
  const query = q.trim().toLowerCase()
  const shown = CAST.filter((c) => !query || `${c.name} ${c.who} ${c.id} ${c.look?.species ?? ''}`.toLowerCase().includes(query))
  const current = useRef<HTMLButtonElement>(null)
  useEffect(() => current.current?.scrollIntoView({ block: 'nearest' }), [lab.view.selected])

  return (
    <aside className="cl-card cl-panel left" aria-label="Cast">
      <div className="cl-head">
        <button className="cl-logo" aria-label="Back to the world map" title="Back to the world map" onClick={() => go.world()}>
          🦄
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="cl-title">Thailand Characters</div>
          <div className="cl-sub">3D cast · {CAST.length} characters</div>
        </div>
        <IconButton icon="panel" label="Hide panel" small onClick={onClose} />
      </div>
      <div style={{ padding: '0 12px 10px' }}>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { id: 'cast', label: 'Cast' },
            { id: 'scene', label: 'Scene' },
          ]}
        />
      </div>
      <div className="cl-panel-scroll" style={{ padding: '0 6px 8px', borderTop: '1px solid var(--line)' }}>
        {tab === 'cast' ? (
          <>
            {GROUPS.map((g) => {
              const list = shown.filter((c) => c.group === g.id)
              if (!list.length) return null
              return (
                <div key={g.id}>
                  <div className="cl-label">{g.name}</div>
                  {list.map((c) => {
                    const sel = c.id === lab.view.selected
                    const inLineup = lab.view.ids.includes(c.id)
                    const variants = variantsFor(c)
                    return (
                      <div key={c.id} className="cl-row" aria-current={sel} style={{ padding: 0 }}>
                        <button
                          ref={sel ? current : undefined}
                          className="cl-row"
                          style={{ flex: 1, minWidth: 0 }}
                          onClick={() => {
                            lab.select(c.id)
                            onPicked()
                          }}
                          data-cast={c.id}
                        >
                          <Dot e={c} />
                          <span className="cl-row-text">
                            <div className="cl-row-name">{c.name}</div>
                            <div className="cl-row-who">{c.who}</div>
                          </span>
                        </button>
                        <span className={`cl-row-actions${inLineup && lab.view.ids.length > 1 ? ' on' : ''}`} style={{ paddingRight: 6 }}>
                          <IconButton icon={inLineup ? 'eye' : 'eyeOff'} label={inLineup ? 'Remove from the lineup' : 'Add to the lineup'} small pressed={inLineup && lab.view.ids.length > 1} onClick={() => lab.toggleLineup(c.id)} />
                          {variants.length > 0 && (
                            <button
                              className="cl-icon sm"
                              aria-label="Variations"
                              title="Variations"
                              onClick={(e) => {
                                const r = (e.currentTarget.closest('.cl-row') as HTMLElement).getBoundingClientRect()
                                setPopover(popover?.id === c.id ? null : { id: c.id, top: r.top - 8, left: r.right + 10 })
                                if (!sel) lab.select(c.id)
                              }}
                            >
                              <Icon name="sparkles" size={15} />
                            </button>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
            {!shown.length && <div className="cl-empty">Nobody called “{q}”</div>}
          </>
        ) : (
          <SceneList lab={lab} />
        )}
      </div>
      <label className="cl-search">
        <Icon name="search" size={15} />
        <input
          ref={searchRef}
          value={q}
          placeholder="Search..."
          aria-label="Search the cast"
          onChange={(e) => {
            setQ(e.target.value)
            setTab('cast')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && shown[0]) lab.select(shown[0].id)
            if (e.key === 'Escape') {
              setQ('')
              e.currentTarget.blur()
            }
          }}
        />
        <span className="cl-kbd">⌘ K</span>
      </label>
      {popover && <Variations lab={lab} id={popover.id} at={popover} onClose={() => setPopover(null)} />}
    </aside>
  )
}

function SceneList({ lab }: { lab: LabApi }) {
  const { view, set } = lab
  const rows: { id: Hideable; icon: IconName; name: string; who: string }[] = [
    { id: 'sun', icon: 'sun', name: 'Key light', who: `Sun · ${TUNE.sun.toFixed(2)}` },
    { id: 'ambient', icon: 'bulb', name: 'Ambient light', who: `Fill · ${TUNE.ambient.toFixed(2)}` },
    { id: 'outline', icon: 'pen', name: 'Ink outlines', who: `Width ×${TUNE.outline.toFixed(2)}` },
    { id: 'shadow', icon: 'shadow', name: 'Blob shadows', who: 'Under the feet' },
    { id: 'floor', icon: 'floor', name: 'Floor', who: 'Studio disc' },
  ]
  const flip = (id: Hideable) => set({ hide: view.hide.includes(id) ? view.hide.filter((h) => h !== id) : [...view.hide, id] })
  return (
    <>
      <div className="cl-label">Scene</div>
      <div className="cl-row">
        <span className="cl-row-icon">
          <Icon name="camera" size={15} />
        </span>
        <span className="cl-row-text">
          <div className="cl-row-name">Camera</div>
          <div className="cl-row-who">
            {view.yaw}° · {view.pitch}° up · {view.fov}° lens
          </div>
        </span>
        <span className="cl-row-actions on">
          <IconButton icon="rotate" label="Reset the camera" small onClick={() => lab.set({ yaw: 0, pitch: 8, zoom: 1 })} />
        </span>
      </div>
      {rows.map((r) => {
        const on = !view.hide.includes(r.id)
        return (
          <div key={r.id} className="cl-row">
            <span className="cl-row-icon">
              <Icon name={r.icon} size={15} />
            </span>
            <span className="cl-row-text">
              <div className="cl-row-name" style={{ opacity: on ? 1 : 0.45 }}>
                {r.name}
              </div>
              <div className="cl-row-who">{r.who}</div>
            </span>
            <span className="cl-row-actions on">
              <IconButton icon={on ? 'eye' : 'eyeOff'} label={on ? `Hide ${r.name}` : `Show ${r.name}`} small onClick={() => flip(r.id)} />
            </span>
          </div>
        )
      })}
      <div className="cl-label">Characters on stage</div>
      {view.ids.map((id) => {
        const e = CAST.find((c) => c.id === id)!
        return (
          <div key={id} className="cl-row" aria-current={id === view.selected}>
            <span className="cl-row-icon">
              <Icon name="box" size={15} />
            </span>
            <button className="cl-row-text" style={{ textAlign: 'left' }} onClick={() => lab.select(id)}>
              <div className="cl-row-name">{e.name}</div>
              <div className="cl-row-who">{e.src}</div>
            </button>
            {view.ids.length > 1 && (
              <span className="cl-row-actions on">
                <IconButton icon="x" label={`Remove ${e.name}`} small onClick={() => lab.toggleLineup(id)} />
              </span>
            )}
          </div>
        )
      })}
    </>
  )
}

/** The ✦ popover: portraits of a character's variations (Kaylee's outfits, the kids of a group). */
function Variations({ lab, id, at, onClose }: { lab: LabApi; id: string; at: { top: number; left: number }; onClose: () => void }) {
  const entry = CAST.find((c) => c.id === id)!
  const variants = useMemo(() => variantsFor(entry), [entry])
  const [thumbs, setThumbs] = useState<string[] | null>(null)
  useEffect(() => {
    // Built after the popover shows, so the click feels instant.
    const t = setTimeout(() => {
      try {
        setThumbs(lab.studio.current?.thumbs(entry, variants) ?? null)
      } catch {
        setThumbs(null)
      }
    }, 30)
    return () => clearTimeout(t)
  }, [entry, variants, lab.studio])
  const isOn = (v: Variant) => (v.entry ? v.entry === lab.view.selected : sameSet(v.wear ?? [], lab.view.wear))
  const index = variants.findIndex(isOn)
  const left = Math.min(at.left, window.innerWidth - 206)
  const top = Math.max(8, Math.min(at.top, window.innerHeight - 380))
  return (
    <div className="cl-card cl-popover" style={{ position: 'fixed', left: Math.max(8, left), top }} role="dialog" aria-label="Variations">
      <div className="cl-section-head" style={{ marginBottom: 10 }}>
        <span>{entry.kind === 'kaylee' ? 'Outfits' : 'Variations'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="cl-sub">
            {index + 1 || '–'} of {variants.length}
          </span>
          <IconButton icon="x" label="Close" small onClick={onClose} />
        </span>
      </div>
      <div className="cl-tiles">
        {variants.map((v, i) => (
          <button key={v.label} className="cl-tile" aria-pressed={isOn(v)} onClick={() => (v.entry ? lab.select(v.entry) : lab.set({ wear: v.wear ?? [] }))} aria-label={v.label}>
            {thumbs?.[i] ? <img src={thumbs[i]} alt="" /> : <span className="cl-empty" style={{ padding: 0 }} />}
            <small>{v.label}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x) => b.includes(x))

// ---------------------------------------------------------------- the toolbar over the canvas

const ZOOMS = [0.5, 0.75, 1, 1.5, 2, 3]

export function Toolbar({ lab, onExport }: { lab: LabApi; onExport: () => void }) {
  const { view, set } = lab
  const cycleShot = () => {
    const order: StudioView['shot'][] = view.ids.length > 1 ? ['body', 'face', 'lineup'] : ['body', 'face']
    set({ shot: order[(order.indexOf(view.shot) + 1) % order.length], zoom: 1 })
  }
  const zoomLabel = `${Math.round(view.zoom * 100)}%`
  return (
    <div className="cl-card cl-toolbar" role="toolbar" aria-label="Studio tools">
      <IconButton icon="pointer" label="Select" tip="Tap to react · drag to orbit" pressed={view.tool === 'select'} onClick={() => set({ tool: 'select' })} />
      <IconButton icon="hand" label="Pan" tip="Drag to pan" pressed={view.tool === 'pan'} onClick={() => set({ tool: 'pan' })} />
      <IconButton icon="face" label="Look at me" tip="Eyes follow the pointer" pressed={view.tool === 'look'} onClick={() => set({ tool: view.tool === 'look' ? 'select' : 'look' })} />
      <IconButton icon="crop" label="Frame" tip={`Frame: ${view.shot === 'body' ? 'full body' : view.shot}`} onClick={cycleShot} />
      <IconButton icon={view.spin ? 'pause' : 'play'} label={view.spin ? 'Stop the turntable' : 'Turntable'} tip="Turntable" pressed={view.spin} onClick={() => set({ spin: !view.spin })} />
      <Select
        value={view.zoom}
        label={zoomLabel}
        onChange={(z) => set({ zoom: z })}
        options={[{ id: 1, label: 'Fit' }, ...ZOOMS.map((z) => ({ id: z, label: `${Math.round(z * 100)}%` }))].filter((o, i, all) => all.findIndex((x) => x.id === o.id) === i)}
      />
      <span className="cl-divider" />
      <IconButton icon="left" label="Previous character" tip="Previous  ←" onClick={() => lab.step(-1)} />
      <IconButton icon="right" label="Next character" tip="Next  →" onClick={() => lab.step(1)} />
      <span className="cl-divider" />
      <button className="cl-btn" onClick={onExport}>
        Export
      </button>
    </div>
  )
}

/** Who's in the lineup (their colors), and Share. */
export function TopRight({ lab, onShare, panelHidden, openPanel }: { lab: LabApi; onShare: () => void; panelHidden: boolean; openPanel: () => void }) {
  const people = lab.view.ids.map((id) => CAST.find((c) => c.id === id)!).slice(0, 5)
  return (
    <div className="cl-topright">
      <div className="cl-stack" aria-label="On stage">
        {people.map((e) => (
          <span key={e.id} style={{ background: e.color, color: e.look && lum(e.color) < 0.45 ? '#fff' : '#2e2233' }} title={e.name}>
            {e.name[0]}
          </span>
        ))}
      </div>
      <button className="cl-btn" onClick={onShare}>
        Share
      </button>
      {panelHidden && <IconButton icon="panelR" label="Show the controls" onClick={openPanel} />}
    </div>
  )
}

function lum(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
}

// ---------------------------------------------------------------- right: design and animation

export function RightPanel({ lab, film, loop, setLoop, onClose }: { lab: LabApi; film: string[]; loop: boolean; setLoop: (on: boolean) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'design' | 'animation'>('animation')
  return (
    <aside className="cl-card cl-panel right" aria-label="Controls">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 12px 10px' }}>
        <div style={{ flex: 1 }}>
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { id: 'design', label: 'Design' },
              { id: 'animation', label: 'Animation' },
            ]}
          />
        </div>
        <IconButton icon="panelR" label="Hide panel" small onClick={onClose} />
      </div>
      <div className="cl-panel-scroll" style={{ borderTop: '1px solid var(--line)' }}>
        {tab === 'animation' ? <AnimationTab lab={lab} film={film} loop={loop} setLoop={setLoop} /> : <DesignTab lab={lab} />}
      </div>
    </aside>
  )
}

function AnimationTab({ lab, film, loop, setLoop }: { lab: LabApi; film: string[]; loop: boolean; setLoop: (on: boolean) => void }) {
  const { view, set, entry } = lab
  const can = POSES[entry.kind]
  const [last, setLast] = useState<Action>('hop')
  const play = (a: Action) => {
    setLast(a)
    lab.studio.current?.act(a)
  }
  const phoneOwner = !!entry.look?.extras?.includes('phone')
  const maned = !!entry.look?.mane
  return (
    <>
      <Section title="Slow motion" aside={<Toggle on={view.slow} onChange={(slow) => set({ slow })} label="Slow motion" />} />
      <Section title="Pose" aside={!can.length ? <span className="cl-sub">Critters don't pose</span> : undefined}>
        {can.length > 0 && (
          <div className="cl-chips">
            {ALL_POSES.filter((p) => entry.kind === 'kaylee' || can.includes(p)).map((p) => (
              <button key={p} className="cl-chip" aria-pressed={view.pose === p || (!can.includes(view.pose) && p === 'stand')} disabled={!can.includes(p)} onClick={() => set({ pose: p })}>
                {POSE_LABEL[p]}
              </button>
            ))}
          </div>
        )}
      </Section>
      <Section title="Actions" aside={<span className="cl-sub">{view.ids.length > 1 ? 'Everyone on stage' : ''}</span>}>
        <div className="cl-chips">
          {ACTIONS.map((a) => (
            <button key={a.id} className="cl-chip" data-action={a.id} onClick={() => play(a.id)} disabled={entry.kind === 'critter' && ['cheer', 'heart', 'silly'].includes(a.id)}>
              {a.label}
            </button>
          ))}
        </div>
      </Section>
      <Section
        title="Loop"
        aside={
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconButton icon="play" label={`Play ${last} again`} small fill onClick={() => play(last)} />
            <Toggle
              on={loop}
              onChange={(on) => {
                setLoop(on)
                if (on) play(last)
              }}
              label="Repeat the last action"
            />
          </span>
        }
      >
        <div className="cl-film" aria-label="Filmstrip of the last action">
          {film.length ? film.map((f, i) => <img key={i} src={f} alt="" />) : <span className="cl-film-empty">Play an action to film it</span>}
        </div>
      </Section>
      <Section title="Turntable" aside={<Toggle on={view.spin} onChange={(spin) => set({ spin })} label="Turntable" />}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Segmented
              value={view.steps ? 'steps' : 'smooth'}
              onChange={(v) => set({ steps: v === 'steps', spin: true })}
              options={[
                { id: 'smooth', label: 'Smooth' },
                { id: 'steps', label: 'Quarters' },
              ]}
            />
          </div>
          <button className="cl-chip" title="Seconds per turn" onClick={() => set({ spinSecs: view.spinSecs === 4 ? 8 : view.spinSecs === 8 ? 16 : 4, spin: true })}>
            <Icon name="clock" size={14} />
            {view.spinSecs}s
          </button>
        </div>
      </Section>
      {(maned || phoneOwner) && (
        <Section title="Extras">
          {maned && <Slider label="Wind" value={view.wind} min={0} max={1} step={0.05} onChange={(wind) => set({ wind })} />}
          {phoneOwner && (
            <Field label="Holding the phone">
              <Toggle on={view.phone} onChange={(phone) => set({ phone })} label="Holding the phone" />
            </Field>
          )}
        </Section>
      )}
    </>
  )
}

function DesignTab({ lab }: { lab: LabApi }) {
  const { view, set, entry } = lab
  const [, bump] = useState(0)
  const look = entry.look
  const tune = (k: 'ambient' | 'sun' | 'outline', v: number) => {
    TUNE[k] = v
    lab.studio.current?.retune()
    bump((n) => n + 1)
  }
  const copy = (text: string, what: string) => {
    void navigator.clipboard?.writeText(text).then(
      () => lab.toast(`${what} copied`),
      () => lab.toast(text),
    )
  }
  return (
    <>
      <Section title={entry.name} aside={<span className="cl-sub">{entry.who}</span>}>
        <div className="cl-kv">
          {look ? (
            <>
              <span>Species</span>
              <span style={{ textTransform: 'capitalize' }}>{look.species}</span>
              <span>Height</span>
              <span>{look.height.toFixed(2)} m</span>
              {look.chub && (
                <>
                  <span>Chub</span>
                  <span>{look.chub}</span>
                </>
              )}
              {look.outfit && (
                <>
                  <span>Outfit</span>
                  <span style={{ textTransform: 'capitalize' }}>{look.outfit.kind}</span>
                </>
              )}
              {!!look.extras?.length && (
                <>
                  <span>Extras</span>
                  <span>{look.extras.join(', ')}</span>
                </>
              )}
            </>
          ) : (
            <>
              <span>Built by</span>
              <span>its own builder</span>
            </>
          )}
          <span>Voice</span>
          <span>{entry.voice ? `${entry.voice} (${voiceLabel(entry.voice) ?? '?'})` : 'none'}</span>
          <span>File</span>
          <button style={{ textAlign: 'left', display: 'flex', gap: 4, alignItems: 'center', overflow: 'hidden' }} onClick={() => copy(`src/world/places/thailand/${entry.src}`, 'Path')} title="Copy the path">
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.src}</span>
            <Icon name="copy" size={13} />
          </button>
        </div>
        {look && <Colors look={look} copy={copy} />}
      </Section>
      {entry.kind === 'kaylee' && (
        <Section title="Wearables" aside={view.wear.length ? <button className="cl-sub" onClick={() => set({ wear: [] })}>Clear</button> : undefined}>
          <div className="cl-chips">
            {WEARABLES.map((w) => (
              <button key={w} className="cl-chip" aria-pressed={view.wear.includes(w)} onClick={() => set({ wear: view.wear.includes(w) ? view.wear.filter((x) => x !== w) : [...view.wear, w] })}>
                {w}
              </button>
            ))}
          </div>
        </Section>
      )}
      <Section title="Light" aside={<button className="cl-sub" onClick={() => copy(JSON.stringify({ ambient: TUNE.ambient, sun: TUNE.sun, outline: TUNE.outline }), 'Values')}>Copy values</button>}>
        <Slider label="Ambient" value={TUNE.ambient} min={0} max={1} step={0.01} onChange={(v) => tune('ambient', v)} />
        <Slider label="Sun" value={TUNE.sun} min={0} max={1} step={0.01} onChange={(v) => tune('sun', v)} />
        <Slider label="Outline" value={TUNE.outline} min={0} max={3} step={0.05} onChange={(v) => tune('outline', v)} />
      </Section>
      <Section title="Backdrop">
        <div className="cl-swatches">
          {BACKDROPS.map((b) => (
            <button key={b.id} className="cl-swatch" aria-pressed={view.bg === b.color} style={{ background: b.color }} onClick={() => set({ bg: b.color })} aria-label={b.label}>
              <small style={b.id === 'night' ? { color: 'rgba(255,255,255,.8)' } : undefined}>{b.label}</small>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Lens">
        <Field label={<LensLabel icon="crop" text="Shot" />}>
          <Segmented
            value={view.shot}
            onChange={(shot) => set({ shot, zoom: 1 })}
            options={[
              { id: 'body', label: 'Body' },
              { id: 'face', label: 'Face' },
              { id: 'lineup', label: 'Lineup', disabled: view.ids.length < 2 },
            ]}
          />
        </Field>
        <Field label={<LensLabel icon="rotate" text="Angle" />}>
          <Segmented
            value={[0, 35, 90, 180].includes(view.yaw) ? view.yaw : -1}
            onChange={(yaw) => set({ yaw, pitch: 8 })}
            options={[
              { id: 0, label: 'Front' },
              { id: 35, label: '¾' },
              { id: 90, label: 'Side' },
              { id: 180, label: 'Back' },
            ]}
          />
        </Field>
        <Field label={<LensLabel icon="lens" text="Lens" />}>
          <Segmented
            value={view.fov}
            onChange={(fov) => set({ fov })}
            options={[
              { id: 50, label: 'Wide' },
              { id: 30, label: 'Normal' },
              { id: 15, label: 'Tele' },
            ]}
          />
        </Field>
      </Section>
    </>
  )
}

function LensLabel({ icon, text }: { icon: IconName; text: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)' }}>
      <Icon name={icon} size={14} />
      {text}
    </span>
  )
}

function Colors({ look, copy }: { look: Look; copy: (text: string, what: string) => void }) {
  const list: [string, string][] = [
    ['Fur', look.fur],
    ['Light', look.light],
    ['Dark', look.dark],
    ...(look.ear ? [['Ear', look.ear] as [string, string]] : []),
    ...(look.mane ?? []).map((c, i): [string, string] => [`Mane ${i + 1}`, c]),
    ...(look.hairdo ? [['Hair', look.hairdo.color] as [string, string]] : []),
    ...(look.outfit ? [[`Outfit`, look.outfit.color] as [string, string]] : []),
    ...(look.outfit?.shorts ? [['Shorts', look.outfit.shorts] as [string, string]] : []),
  ]
  return (
    <div className="cl-colors" style={{ marginTop: 12 }}>
      {list.map(([name, c]) => (
        <button key={name} className="cl-color" style={{ background: c }} title={`${name} ${c}`} aria-label={`${name} ${c}`} onClick={() => copy(c, `${name} ${c}`)} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------- bottom: say a line

export function LineBar({ lab }: { lab: LabApi }) {
  const { entry } = lab
  const lines = useMemo(() => linesFor(entry.voice), [entry.voice])
  const [text, setText] = useState('')
  useEffect(() => setText(''), [entry.id])
  const q = text.trim().toLowerCase()
  const matching = q ? lines.filter((l) => lineText(l).toLowerCase().includes(q)) : lines
  const chosen: Line | undefined = lines.find((l) => lineText(l) === text) ?? matching[0]
  const voice = voiceLabel(entry.voice)
  const mute = !lines.length
  const play = () => chosen && lab.studio.current?.speak(lineText(chosen))
  const placeholder = entry.kind === 'kaylee' ? "Kaylee doesn't talk (she giggles)" : !entry.voice ? `${entry.name} has no voice` : mute ? `No lines for ${entry.name} yet` : `Pick a line for ${entry.name} to say...`
  return (
    <div className="cl-card cl-linebar">
      <div className="cl-linebar-text">
        <input
          value={text}
          disabled={mute}
          placeholder={placeholder}
          aria-label="Line to say"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') play()
          }}
        />
      </div>
      <div className="cl-linebar-row">
        <IconButton icon="x" label="Stop talking" onClick={() => stopSpeaking()} disabled={mute} />
        <Select
          value={chosen ? lineText(chosen) : ''}
          up
          icon={<Icon name="volume" size={15} />}
          label={`Lines (${mute ? 0 : matching.length})`}
          onChange={(t) => setText(t)}
          options={matching.map((l) => ({ id: lineText(l), label: <span style={{ whiteSpace: 'normal', minWidth: 220 }}>{lineText(l)}</span> }))}
        />
        <span style={{ flex: 1 }} />
        {voice && <span className="cl-sub" style={{ whiteSpace: 'nowrap' }}>{voice}</span>}
        <button className="cl-send" aria-label="Say it" title="Say it" disabled={!chosen} onClick={play}>
          <Icon name="up" size={17} />
        </button>
      </div>
    </div>
  )
}

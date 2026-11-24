// ?feel=1 on any section link: the feel lab, for tuning how a game feels by hand (how fast the wheel steers, how much
// a flick is smoothed). The game stays full size and playable underneath (on the iPad, the iPhone or a trackpad: the
// real finger is the whole point), with a panel over its right side: the scene picker (any game and section of this
// country, like the camera lab's), then only the knobs this scene uses (kit/knobs.ts: its activity's groups in this
// section, and shared ones like Roblox controls only while the scene claims them), the main few first and the rest
// folded under "More", a live graph of what the world watches (her push against what the car does), and the hand-off:
// a link that reproduces the feel, and a note listing the changed numbers for an agent to bake in. What changed stays
// in the address bar (feel.<group>.<knob>=n) and comes along to another scene. Not something Kaylee plays: World.tsx
// loads it lazily, only when the link asks for it.
import { shareLab } from '../share'
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { worldLink } from '../../../router'
import { feelLab, isFeelParam, type KnobGroup, type KnobSpec } from '../../kit/knobs'
import { sectionsFor } from '../../registry'
import { ScenePicker, sceneHere } from '../ScenePicker'
import { TUNED } from './tuned.gen'
import { IconButton, Section } from '../ui'
import '../lab.css'

const COLORS = ['#ff5fa2', '#7a5cff', '#20a39e', '#f2a541', '#8a8a93', '#3b82f6']
const SPAN = 6
const fmt = (n: number, step = 0.01) => String(+n.toFixed(Math.max(0, Math.min(4, Math.ceil(-Math.log10(step))))))
const changedIn = (g: KnobGroup) => Object.entries(g.specs).filter(([k, s]) => g.values[k] !== s.value).length

/** A hash's query with its feel params swapped for `feel` (commas stay readable, as in router.worldLink). */
function withFeel(hash: string, feel: Record<string, string>) {
  const [path, query = ''] = hash.split('?')
  const rest = [...new URLSearchParams(query)].filter(([k]) => !isFeelParam(k))
  const q = [...rest, ...Object.entries(feel)].map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v).replace(/%2C/g, ',')}`).join('&')
  return q ? `${path}?${q}` : path
}

// (The registry changes rarely; a counter is enough for React to notice.)
let version = 0
feelLab.subscribe(() => void version++)

/** `place`: the country on screen, or none on the home screen (its globe's knobs are a shared group it claims). */
export default function FeelLab({ place }: { place?: string }) {
  useSyncExternalStore(feelLab.subscribe, () => version)
  // The section on screen changes as she plays (replaceState, no event): look a few times a second.
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 250)
    return () => clearInterval(id)
  }, [])
  const { activity, section } = place ? sceneHere(place) : ({} as ReturnType<typeof sceneHere>)
  const groups = feelLab.groupsFor(place, activity, section)
  const watchers = feelLab.watchers()
  const [open, setOpen] = useState(true)
  const [notes, setNotes] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef(0)
  const say = (t: string) => {
    setToast(t)
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1800)
  }

  // A link the lab didn't write (opened by a link over a game that's already running, pasted, or another feel link):
  // its numbers first, before the address bar is written from the knobs below. (Layout effects run before effects; the
  // route re-renders on a hashchange before any listener of ours would hear it.)
  const written = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (location.hash !== written.current) feelLab.applyLink()
  })
  // The address bar follows the knobs (replaceState: no hashchange, so the game doesn't restart). Not once the address
  // has moved on to a link without the feel lab (the lab bar's other tabs): the next tick would put ?feel=1 back on it.
  useEffect(() => {
    if (/[?&]feel=/.test(location.hash)) {
      const hash = withFeel(location.hash, { feel: '1', ...feelLab.params() })
      if (location.hash !== hash) history.replaceState(history.state, '', hash)
    }
    written.current = location.hash
  })

  // Another scene keeps what you changed (the bike's steering comes along from the green trail to the berms).
  const go = (act: string, sec: string | undefined) => {
    if (place) location.hash = worldLink(place, act, sec, { feel: '1', ...feelLab.params() })
  }
  // The pickers mark where the tuning is (from the source: a game's knobs register only once its code loads).
  const tuned = (act: string, sec?: string) => {
    const t = TUNED[`${place}/${act}`]
    return !!t && (!sec || t === '*' || t.includes(sec))
  }
  // (Only sections: nearly every game has some.)
  const mark = (act: string, sec?: string) => (sec && tuned(act, sec) ? '🎛️ ' : '')
  const elsewhere = activity && groups.length === 0 ? (sectionsFor(place ?? '', activity)?.sections ?? []).filter((s) => tuned(activity, s.id)) : []

  const copy = (text: string, label: string) => {
    void shareLab(text, label).then(say, (error) => say(String(error)))
  }
  const link = () => `${location.origin}${location.pathname}${location.hash}`
  const forAgent = () => {
    const touch = matchMedia('(pointer: coarse)').matches
    const lines = [`Feel for ${withFeel(location.hash, {})} on a ${innerWidth}×${innerHeight} screen (${touch ? 'touch' : 'mouse or trackpad'}):`]
    // Everything you changed, here or in a scene you tuned before this one.
    const touched = feelLab.groups().filter((g) => changedIn(g) > 0)
    for (const g of touched) {
      const all = Object.entries(g.specs)
      lines.push(`${g.title}: ${g.file}, knobs('${g.id}')`)
      for (const [k, s] of all.filter(([k, s]) => g.values[k] !== s.value)) lines.push(`  ${k}: ${fmt(s.value, s.step)} → ${fmt(g.values[k], s.step)}  (${s.label}${s.unit ? `, ${s.unit}` : ''})`)
      const same = all.filter(([k, s]) => g.values[k] === s.value)
      if (same.length) lines.push(`  unchanged: ${same.map(([k, s]) => `${k} ${fmt(s.value, s.step)}`).join(', ')}`)
    }
    if (!touched.length) lines.push('(nothing changed)')
    lines.push(`Bake the changed numbers into those knobs' \`value\`s. Lab link: ${link()}`)
    return lines.join('\n')
  }

  if (!open)
    return (
      <div className="cam-panel feel-tab">
        <button className="cl-card" aria-label="Show the feel lab" onClick={() => setOpen(true)}>
          🎛️
        </button>
      </div>
    )

  return (
    <aside className="cam-panel cl-card cl-panel feel-panel" onPointerDown={(e) => e.stopPropagation()}>
      <div className="cl-head">
        <div className="cl-logo">🎛️</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="cl-title">Feel lab</div>
          <div className="cl-sub">Play with one hand, tune with the other</div>
        </div>
        <IconButton icon="panelR" label="Hide the panel" small onClick={() => setOpen(false)} />
        <IconButton icon="x" label="Close the feel lab" small onClick={() => (location.hash = withFeel(location.hash, {}))} />
      </div>
      <div className="cl-panel-scroll">
        {place && <ScenePicker place={place} open={go} mark={mark} openPlace={(pl, act, sec) => (location.hash = worldLink(pl, act, sec, { feel: '1', ...feelLab.params() }))} />}
        {watchers.length > 0 && groups.length > 0 && (
          <Section title="Live">
            {watchers.map(([id, read]) => (
              <Graph key={id} read={read} />
            ))}
          </Section>
        )}
        {groups.length === 0 && (
          <Section title="Nothing to tune here">
            {elsewhere.length > 0 ? (
              <>
                <div className="cl-sub">This part has no feel numbers. The tuning is in:</div>
                <div className="cl-chips feel-elsewhere">
                  {elsewhere.map((s) => (
                    <button key={s.id} className="cl-chip" onClick={() => go(activity!, s.id)}>
                      {s.name.split(':')[0]}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="cl-sub">This game has no feel numbers yet. Pick another one above (🎛️ marks the sections that do).</div>
            )}
          </Section>
        )}
        {groups.map((g, i) => (
          <Group key={g.id} g={g} notes={notes} first={i === 0} />
        ))}
      </div>
      <div className="cm-actions feel-actions">
        <button className="cl-chip" aria-pressed={notes} onClick={() => setNotes((n) => !n)}>
          Notes
        </button>
        <button
          className="cl-btn"
          onClick={() => {
            feelLab.reset()
            say('Back to the game’s numbers')
          }}
        >
          Reset
        </button>
        <button className="cl-btn" onClick={() => copy(link(), 'Link')}>
          Copy link
        </button>
        <button className="cl-btn" onClick={() => copy(forAgent(), 'Feel lab changes')}>
          Copy for agent
        </button>
      </div>
      {toast && <div className="cl-toast feel-toast">{toast}</div>}
    </aside>
  )
}

/** One group: folded but for the first, its main knobs, then the rest under "More". */
function Group({ g, notes, first }: { g: KnobGroup; notes: boolean; first: boolean }) {
  const [open, setOpen] = useState(first)
  const [more, setMore] = useState(false)
  const changed = changedIn(g)
  const all = Object.entries(g.specs)
  const main = all.filter(([, s]) => s.main)
  const rest = all.filter(([, s]) => !s.main)
  const restChanged = rest.filter(([k, s]) => g.values[k] !== s.value).length
  return (
    <div className="cl-section feel-group">
      <div className="cl-section-head feel-group-head">
        <button className="feel-fold" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span className="feel-caret">{open ? '▾' : '▸'}</span>
          <span>{g.title}</span>
          {changed > 0 && <span className="feel-badge">{changed} changed</span>}
        </button>
        {changed > 0 && (
          <IconButton
            icon="rotate"
            label={`${g.title}: back to the game's numbers`}
            small
            onClick={() => {
              for (const [k, s] of all) feelLab.set(g.id, k, s.value)
            }}
          />
        )}
      </div>
      {open && (
        <>
          {main.map(([k, s]) => (
            <Knob key={k} g={g} k={k} s={s} notes={notes} />
          ))}
          {rest.length > 0 && (
            <button className="feel-more" aria-expanded={more} onClick={() => setMore((m) => !m)}>
              {more ? '▾' : '▸'} {main.length ? 'More' : 'Knobs'} ({rest.length}){restChanged > 0 ? ` · ${restChanged} changed` : ''}
            </button>
          )}
          {more && rest.map(([k, s]) => <Knob key={k} g={g} k={k} s={s} notes={notes} />)}
        </>
      )}
    </div>
  )
}

function Knob({ g, k, s, notes }: { g: KnobGroup; k: string; s: KnobSpec; notes: boolean }) {
  const v = g.values[k]
  const moved = v !== s.value
  const step = s.step ?? 0.01
  return (
    <div className="feel-knob">
      <div className="feel-knob-head">
        <span className="feel-label">{s.label}</span>
        <output className={moved ? 'moved' : ''}>
          {fmt(v, step)}
          {s.unit ? ` ${s.unit}` : ''}
        </output>
        {moved && (
          <button className="feel-undo" title={`Back to ${fmt(s.value, step)}`} onClick={() => feelLab.set(g.id, k, s.value)}>
            ↺ {fmt(s.value, step)}
          </button>
        )}
      </div>
      <div className="feel-row">
        <button className="feel-step" aria-label={`${s.label} down`} onClick={() => feelLab.set(g.id, k, Math.max(s.min, +(v - step).toFixed(6)))}>
          −
        </button>
        <input type="range" aria-label={s.label} min={s.min} max={s.max} step={step} value={v} onChange={(e) => feelLab.set(g.id, k, +e.target.value)} />
        <button className="feel-step" aria-label={`${s.label} up`} onClick={() => feelLab.set(g.id, k, Math.min(s.max, +(v + step).toFixed(6)))}>
          +
        </button>
      </div>
      {notes && s.note && <div className="cl-sub feel-note">{s.note}</div>}
    </div>
  )
}

/** The last few seconds of what a world watches, one line each, between -range and +range (0 in the middle). */
function Graph({ read }: { read: () => Record<string, [number, number]> }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [names, setNames] = useState<string[]>([])
  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const g = el.getContext('2d')!
    const hist: { t: number; v: Record<string, [number, number]> }[] = []
    let raf = 0
    let seen = ''
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const t = now / 1000
      let v: Record<string, [number, number]>
      try {
        v = read()
      } catch {
        return
      }
      hist.push({ t, v })
      while (hist.length && t - hist[0].t > SPAN) hist.shift()
      const keys = Object.keys(v)
      if (keys.join('|') !== seen) {
        seen = keys.join('|')
        setNames(keys)
      }
      const dpr = devicePixelRatio || 1
      const w = el.clientWidth
      const h = el.clientHeight
      if (el.width !== Math.round(w * dpr)) el.width = Math.round(w * dpr)
      if (el.height !== Math.round(h * dpr)) el.height = Math.round(h * dpr)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, w, h)
      g.strokeStyle = '#dcdce0'
      g.lineWidth = 1
      g.beginPath()
      g.moveTo(0, h / 2)
      g.lineTo(w, h / 2)
      for (let s = 1; s < SPAN; s++) {
        const x = w - (s / SPAN) * w
        g.moveTo(x, h / 2 - 3)
        g.lineTo(x, h / 2 + 3)
      }
      g.stroke()
      keys.forEach((k, i) => {
        g.strokeStyle = COLORS[i % COLORS.length]
        g.lineWidth = i < 2 ? 2 : 1.5
        g.beginPath()
        let first = true
        for (const p of hist) {
          const s = p.v[k]
          if (!s) continue
          const x = w - ((t - p.t) / SPAN) * w
          const y = h / 2 - (Math.max(-1, Math.min(1, s[0] / s[1])) * (h / 2 - 3))
          if (first) g.moveTo(x, y)
          else g.lineTo(x, y)
          first = false
        }
        g.stroke()
      })
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [read])
  return (
    <div className="feel-graph">
      <canvas ref={canvas} />
      <div className="feel-legend">
        {names.map((n, i) => (
          <span key={n}>
            <i style={{ background: COLORS[i % COLORS.length] }} />
            {n}
          </span>
        ))}
      </div>
      <div className="cl-sub feel-note">The last {SPAN} s, newest on the right.</div>
    </div>
  )
}

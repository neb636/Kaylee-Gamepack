// ?feel=1 on any section link: the feel lab, for tuning how a game feels by hand (how fast the wheel steers, how much
// a flick is smoothed). The game stays full size and playable underneath (on the iPad, the iPhone or a trackpad: the
// real finger is the whole point), with a panel of sliders over its right side for every knob the scene declares
// (kit/knobs.ts), a live graph of what the world watches (her push against what the car does), and the hand-off: a
// link that reproduces the feel, and a note listing the changed numbers for an agent to bake in. What changed stays in
// the address bar (feel.<group>.<knob>=n). Not something Kaylee plays: World.tsx loads it lazily, only when the link
// asks for it.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { feelLab, isFeelParam, type KnobGroup } from '../../../../kit/knobs'
import { IconButton, Section } from '../ui'
import '../lab.css'

const COLORS = ['#ff5fa2', '#7a5cff', '#20a39e', '#f2a541', '#8a8a93', '#3b82f6']
const SPAN = 6
const fmt = (n: number, step = 0.01) => String(+n.toFixed(Math.max(0, Math.min(4, Math.ceil(-Math.log10(step))))))

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

export default function FeelLab() {
  useSyncExternalStore(feelLab.subscribe, () => version)
  const groups = feelLab.groups()
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

  // The address bar follows the knobs (replaceState: no hashchange, so the game doesn't restart).
  useEffect(() => {
    const hash = withFeel(location.hash, { feel: '1', ...feelLab.params() })
    if (location.hash !== hash) history.replaceState(history.state, '', hash)
  })
  // A link opened by hand while the lab is up: its numbers.
  useEffect(() => {
    const onHash = () => feelLab.applyLink()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const copy = (text: string, done: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => say(done), () => say('Copy it from the address bar'))
    else say('Copy it from the address bar')
  }
  const link = () => `${location.origin}${location.pathname}${location.hash}`
  const forAgent = () => {
    const touch = matchMedia('(pointer: coarse)').matches
    const lines = [`Feel for ${withFeel(location.hash, {})} on a ${innerWidth}×${innerHeight} screen (${touch ? 'touch' : 'mouse or trackpad'}):`]
    for (const g of groups) {
      const all = Object.entries(g.specs)
      const changed = all.filter(([k, s]) => g.values[k] !== s.value)
      lines.push(`${g.title}: ${g.file}, knobs('${g.id}')`)
      for (const [k, s] of changed) lines.push(`  ${k}: ${fmt(s.value, s.step)} → ${fmt(g.values[k], s.step)}  (${s.label}${s.unit ? `, ${s.unit}` : ''})`)
      if (!changed.length) lines.push('  (nothing changed)')
      const same = all.filter(([k, s]) => g.values[k] === s.value)
      if (changed.length && same.length) lines.push(`  unchanged: ${same.map(([k, s]) => `${k} ${fmt(s.value, s.step)}`).join(', ')}`)
    }
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
        {watchers.length > 0 && (
          <Section title="Live">
            {watchers.map(([id, read]) => (
              <Graph key={id} read={read} />
            ))}
          </Section>
        )}
        {groups.length === 0 && (
          <Section title="No knobs here">
            <div className="cl-sub">This scene has no knobs yet. Declare them with knobs() from src/world/kit/knobs.ts where the game uses the numbers.</div>
          </Section>
        )}
        {groups.map((g) => (
          <Group key={g.id} g={g} notes={notes} />
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
        <button className="cl-btn" onClick={() => copy(link(), 'Link copied')}>
          Link
        </button>
        <button className="cl-btn" onClick={() => copy(forAgent(), 'Copied for an agent')}>
          For agent
        </button>
      </div>
      {toast && <div className="cl-toast feel-toast">{toast}</div>}
    </aside>
  )
}

function Group({ g, notes }: { g: KnobGroup; notes: boolean }) {
  const changed = Object.entries(g.specs).some(([k, s]) => g.values[k] !== s.value)
  return (
    <Section
      title={g.title}
      aside={
        changed ? (
          <IconButton
            icon="rotate"
            label={`${g.title}: back to the game's numbers`}
            small
            onClick={() => {
              for (const [k, s] of Object.entries(g.specs)) feelLab.set(g.id, k, s.value)
            }}
          />
        ) : undefined
      }
    >
      {Object.entries(g.specs).map(([k, s]) => {
        const v = g.values[k]
        const moved = v !== s.value
        const step = s.step ?? 0.01
        return (
          <div key={k} className="feel-knob">
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
      })}
    </Section>
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

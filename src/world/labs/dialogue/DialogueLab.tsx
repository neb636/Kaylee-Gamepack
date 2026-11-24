// The dialogue lab (#/world/dialogue/<place>/<group>): read a mini-game's whole script and hear it in the real voices.
// A country and a mini-game from two dropdowns, the cast of that game with each speaker's OpenAI voice, and every line
// in play order (lines.ts order) with when it plays. Tap a line to hear it; Play all reads the scene through, like the
// table read (scripts/table-read.mjs) but for any game, any time, on the iPad. For you, not for Kaylee.
import { useEffect, useMemo, useRef, useState } from 'react'
import { DEVICE } from '../../../sdk/device'
import { hasClip, lineMs, say, stopSpeaking, unlockSpeech } from '../../../sdk/speech'
import { useTimers } from '../../../sdk/timers'
import { go } from '../../../router'
import { Icon, IconButton, Segmented, Select } from '../ui'
import { humanize, linesOf, loadScript, scriptPlaces, type Script, type ScriptLine, type Speaker } from './script'
import '../lab.css'

const COLORS = ['#ff5fa2', '#7b61ff', '#18a0fb', '#14ae5c', '#f24822', '#ffa629', '#9747ff', '#0fa958', '#e2558f', '#5b8def']
const colorOf = (ids: string[], id: string) => COLORS[Math.max(0, ids.indexOf(id)) % COLORS.length]
const seconds = (ms: number) => (ms ? `${(ms / 1000).toFixed(1)}s` : '')

export default function DialogueLab({ place = 'thailand', group }: { place?: string; group?: string }) {
  const places = useMemo(scriptPlaces, [])
  const [script, setScript] = useState<Script | null>(null)
  const [error, setError] = useState('')
  const [playing, setPlaying] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [openSpeaker, setOpenSpeaker] = useState<string | null>(null)
  const run = useRef(0)
  const timers = useTimers()
  const rows = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    let live = true
    setScript(null)
    setError('')
    loadScript(place).then(
      (s) => live && setScript(s),
      (e) => live && setError(String(e)),
    )
    return () => {
      live = false
    }
  }, [place])

  // Stop talking when the game changes or the lab closes.
  useEffect(() => stop, [place, group]) // eslint-disable-line react-hooks/exhaustive-deps

  const current = script && (script.groups.find((g) => g.id === group) ?? script.groups[0])
  const lines = useMemo(() => (script && current ? linesOf(script, current.id) : []), [script, current])
  const cast = useMemo(() => [...new Set(lines.map((l) => l.speaker))], [lines])
  const total = lines.reduce((sum, l) => sum + lineMs(l.line), 0)
  const missing = lines.filter((l) => !hasClip(l.line)).length

  function stop() {
    run.current++
    stopSpeaking()
    setPlaying(null)
    setRunning(false)
  }

  async function playOne(i: number) {
    unlockSpeech()
    const mine = ++run.current
    setRunning(false)
    setPlaying(i)
    await say(lines[i].line)
    if (run.current === mine) setPlaying(null)
  }

  async function playAll(from = 0) {
    unlockSpeech()
    const mine = ++run.current
    setRunning(true)
    for (let i = from; i < lines.length; i++) {
      if (run.current !== mine) return
      if (!hasClip(lines[i].line)) continue
      setPlaying(i)
      rows.current[i]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      await say(lines[i].line)
      if (run.current !== mine) return
      // A breath between lines; a longer one where the scene moves to its next part.
      const nextPart = lines[i + 1] && partOf(lines[i + 1], current!.id) !== partOf(lines[i], current!.id)
      await timers.wait(nextPart ? 700 : 300)
    }
    if (run.current === mine) {
      setPlaying(null)
      setRunning(false)
    }
  }

  const pickPlace = (id: string) => go.world('dialogue', id)
  const pickGroup = (id: string) => go.world('dialogue', place, id)
  const setDevice = (d: string) => {
    const [page, query = ''] = location.hash.split('?')
    const q = new URLSearchParams(query)
    q.set('device', d)
    location.hash = `${page}?${q}`
    location.reload()
  }

  let lastPart = ''
  return (
    <div className="dialogue-lab">
      <header className="dl-bar cl-card">
        <IconButton icon="back" label="Back to the world map" onClick={() => go.world()} />
        <strong className="dl-title">Dialogue lab</strong>
        <Select
          value={place}
          options={places.map((p) => ({ id: p.id, label: p.name }))}
          label={<span className="cm-ellipsis">{places.find((p) => p.id === place)?.name ?? humanize(place)}</span>}
          onChange={pickPlace}
        />
        <Select
          value={current?.id ?? ''}
          options={(script?.groups ?? []).map((g) => ({
            id: g.id,
            label: (
              <span className={`dl-opt${g.id.includes('.') ? ' sub' : ''}`}>
                <span>{g.label}</span>
                <span className="cl-sub">{g.count}</span>
              </span>
            ),
          }))}
          label={<span className="cm-ellipsis">{current?.label ?? 'Pick a mini-game'}</span>}
          onChange={pickGroup}
        />
        <span className="dl-spacer" />
        <Segmented
          value={DEVICE}
          options={[
            { id: 'touch', label: 'iPad words' },
            { id: 'mouse', label: 'Mac words' },
          ]}
          onChange={(d) => d !== DEVICE && setDevice(d)}
        />
        <button className="dl-play" onClick={() => (running ? stop() : void playAll())} disabled={!lines.length}>
          <Icon name={running ? 'pause' : 'play'} size={15} fill />
          {running ? 'Stop' : 'Play all'}
        </button>
      </header>

      <main className="dl-page">
        {error && <div className="cl-card dl-note">{error}</div>}
        {!script && !error && <div className="dl-note cl-sub">Loading the script…</div>}
        {script && current && (
          <>
            <section className="cl-card dl-cast">
              <div className="dl-cast-head">
                <span>Cast</span>
                <span className="cl-sub">
                  {lines.length} lines{total ? ` · ${Math.round(total / 1000)}s spoken` : ''}
                  {missing ? ` · ${missing} not recorded yet` : ''}
                </span>
              </div>
              <div className="dl-chips">
                {cast.map((id) => (
                  <SpeakerChip key={id} id={id} speaker={script.speakers[id]} color={colorOf(cast, id)} open={openSpeaker === id} onToggle={() => setOpenSpeaker((o) => (o === id ? null : id))} />
                ))}
              </div>
              {openSpeaker && script.speakers[openSpeaker] && cast.includes(openSpeaker) && <p className="dl-about">{script.speakers[openSpeaker].about}</p>}
              {current.note && <p className="dl-game">{current.note}</p>}
            </section>

            <section className="cl-card dl-script">
              {lines.map((l, i) => {
                const part = partOf(l, current.id)
                const head = part !== lastPart ? part : null
                lastPart = part
                const s = script.speakers[l.speaker]
                const recorded = hasClip(l.line)
                const ms = lineMs(l.line)
                return (
                  <div key={l.path.join('.')} ref={(el) => void (rows.current[i] = el)}>
                    {head && <h3 className="dl-part">{head}</h3>}
                    <button className={`dl-line${playing === i ? ' on' : ''}${recorded ? '' : ' mute'}`} onClick={() => (playing === i ? stop() : void playOne(i))} disabled={!recorded}>
                      <span className="dl-who" style={{ color: colorOf(cast, l.speaker) }}>
                        {s?.name ?? humanize(l.speaker)}
                        <span className="dl-voice">{s?.voice ?? '?'}</span>
                      </span>
                      <span className="dl-text">
                        {l.text}
                        {l.note && <span className="dl-when">{l.note}</span>}
                      </span>
                      <span className="dl-meta">
                        {recorded ? (
                          <>
                            <Icon name={playing === i ? 'volume' : 'play'} size={13} fill={playing !== i} />
                            <span className={ms > 3000 ? 'dl-long' : ''}>{seconds(ms)}</span>
                          </>
                        ) : (
                          <span className="dl-flag">not recorded</span>
                        )}
                      </span>
                    </button>
                  </div>
                )
              })}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

/** The part of the scene a line belongs to: its path inside the group, minus list positions and its own key
 *  (`mall.barber` + ['mall','barber','chair','sit'] → "Chair"). */
function partOf(l: ScriptLine, group: string): string {
  const inner = l.path.slice(group.split('.').length, -1).filter((p) => !/^\d+$/.test(p))
  return inner.map(humanize).join(' › ')
}

function SpeakerChip({ id, speaker, color, open, onToggle }: { id: string; speaker?: Speaker; color: string; open: boolean; onToggle: () => void }) {
  return (
    <button className="dl-chip" aria-pressed={open} onClick={onToggle} title="How they're told to sound">
      <span className="dl-dot" style={{ background: color }} />
      <span className="dl-chip-name">{speaker?.name ?? humanize(id)}</span>
      <span className="dl-voice">
        OpenAI: {speaker?.voice ?? 'no voice'}
        {speaker?.pitch ? ` · ${speaker.pitch > 0 ? '+' : ''}${speaker.pitch} st` : ''}
      </span>
    </button>
  )
}

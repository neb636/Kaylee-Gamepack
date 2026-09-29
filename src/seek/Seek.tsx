import { useEffect, useRef, useState } from 'react'
import { go } from '../router'
import { burst, SayButton, say, sounds, stopSpeaking, useElementSize, useSaved } from '../sdk'
import { scenes, type SeekScene } from './scenes'
import { SceneArt, Unicorn } from './SceneArt'
import './seek.css'

const instruction = 'Find the unicorn!'
export function SeekTile() {
  return <button className="seek-door" aria-label="Unicorn Hide & Seek" onClick={() => { sounds.sparkle(); void say(instruction); go.seek() }}>
    <span className="seek-door-picture" aria-hidden="true"><svg viewBox="-65 -65 130 130"><circle r="62" fill="#fff0be" /><Unicorn /></svg></span>
    <span><strong>Unicorn Hide & Seek</strong><span className="seek-door-sub">Five little worlds. So many hiding spots!</span><span className="seek-door-icons" aria-hidden="true">⛺ 🏖️ 🎡 ⛄ 🌷</span></span>
    <span className="seek-door-play" aria-hidden="true">▶</span>
  </button>
}

export function Seek({ id }: { id?: string }) {
  const [saved, setSaved] = useSaved<Record<string, number[]>>('unicorn-seek-v1', {})
  const scene = scenes.find(s => s.id === id)
  useEffect(() => () => stopSpeaking(), [])
  if (scene) return <Hunt key={scene.id} scene={scene} found={saved[scene.id] ?? []} onFind={n => setSaved(s => ({ ...s, [scene.id]: [...new Set([...(s[scene.id] ?? []), n])] }))} onReplay={() => setSaved(s => ({ ...s, [scene.id]: [] }))} />
  return <div className="screen decorated seek-shelf">
    <header><button aria-label="Home" onClick={() => go.home()}>🏠</button><div><p className="seek-eyebrow">A little looking adventure</p><h1>Unicorn Hide & Seek</h1></div><SayButton text="Pick a picture, Kaylee!" size={56} /></header>
    <p>Can you find five unicorns in each picture?</p>
    <div className="seek-cards">{scenes.map((s, i) => <button key={s.id} aria-label={s.title} onClick={() => { sounds.pop(); go.seek(s.id) }}>
      <div className="seek-preview"><SceneArt scene={s} /><span aria-hidden="true">{s.emoji}</span>{saved[s.id]?.length === 5 && <b className="seek-badge" aria-label="Completed">★</b>}</div>
      <div className="seek-card-label"><span><small>WORLD {i + 1}</small><strong>{s.title}</strong></span><b aria-hidden="true">▶</b></div>
    </button>)}</div>
    <p className="seek-shelf-note">No clock. No rush. Look, zoom, and explore. <span>📱 Turn your phone sideways to play.</span></p>
  </div>
}

function Hunt({ scene, found, onFind, onReplay }: { scene: SeekScene; found: number[]; onFind: (n: number) => void; onReplay: () => void }) {
  const viewport = useRef<HTMLDivElement>(null)
  const size = useElementSize(viewport)
  const [zoom, setZoom] = useState(1)
  const [hint, setHint] = useState<number | null>(null)
  const [miss, setMiss] = useState(false)
  const done = found.length === scene.targets.length
  // Keep the artwork legible on short phone screens; the viewport can scroll both ways.
  const base = Math.max(600, Math.min(size.width, size.height / .6))
  const width = base * zoom
  const hitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const tapLock = useRef(new Set(found))
  useEffect(() => { void say(instruction); return () => { clearTimeout(hitTimer.current); clearTimeout(hintTimer.current) } }, [])
  useEffect(() => { tapLock.current = new Set(found) }, [found])
  function find(n: number) {
    if (tapLock.current.has(n)) return
    tapLock.current.add(n)
    setHint(null)
    sounds.correct()
    onFind(n)
    if (tapLock.current.size === scene.targets.length) { burst(); sounds.fanfare(); void say('Great job, Kaylee!') }
  }
  function showHint() {
    const n = scene.targets.findIndex((_, i) => !found.includes(i))
    if (n < 0) return
    const [x, y] = scene.targets[n]
    setHint(n)
    const el = viewport.current
    if (el) el.scrollTo({ left: x / 1200 * width - el.clientWidth / 2, top: y / 1200 * width - el.clientHeight / 2, behavior: 'smooth' })
    void say(instruction)
    clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => setHint(null), 4000)
  }
  const next = scenes[(scenes.indexOf(scene) + 1) % scenes.length]
  return <main className="seek-hunt">
    <header className="seek-toolbar">
      <button aria-label="Back to scenes" onClick={() => go.seek()}>‹</button>
      <h1>{scene.emoji} {scene.title}</h1>
      <div className="seek-count" aria-label={`${found.length} of 5 unicorns found`}>{Array.from({ length: 5 }, (_, i) => <span key={i} className={i < found.length ? 'filled' : ''}>★</span>)} <b>{found.length}/5</b></div>
      <SayButton text={instruction} size={44} />
    </header>
    <div className="seek-instructions"><span>{done ? 'All five found! Great looking, Kaylee!' : miss ? 'Keep looking — you can do it!' : 'Find five unicorns. Zoom in for a closer look!'}</span><div>
      <button aria-label="Zoom out" disabled={zoom === 1} onClick={() => setZoom(z => Math.max(1, z - .5))}>−</button><span>{zoom}×</span><button aria-label="Zoom in" disabled={zoom === 3} onClick={() => setZoom(z => Math.min(3, z + .5))}>+</button>
      <button className="seek-hint-button" aria-label="Hint" disabled={done} onClick={showHint}>💡</button>
    </div></div>
    <div className="seek-viewport" ref={viewport}>
      <div className="seek-board" style={{ width, height: width * .6, marginTop: Math.max(0, (size.height - width * .6) / 2) }}>
        <div className="seek-background" onClick={() => { if (!done) { setMiss(true); clearTimeout(hitTimer.current); hitTimer.current = setTimeout(() => setMiss(false), 1500) } }}><SceneArt scene={scene} /></div>
        {scene.targets.map(([x, y], n) => <button key={n} aria-label={`Unicorn ${n + 1}${found.includes(n) ? ' found' : ''}`} disabled={found.includes(n)} className={`seek-unicorn ${found.includes(n) ? 'is-found' : ''} ${hint === n ? 'is-hint' : ''}`} style={{ left: `${x / 12}%`, top: `${y / 7.2}%` }} onClick={() => find(n)}>
          <svg viewBox="-48 -50 96 100" aria-hidden="true"><Unicorn color={scene.colors[n % 3]} /></svg>{found.includes(n) && <span aria-hidden="true">✓</span>}
        </button>)}
      </div>
    </div>
    <footer className="seek-footer">{done ? <><span>🌟 You found every unicorn!</span><button aria-label="Play again" onClick={() => { onReplay(); tapLock.current.clear(); setHint(null); setZoom(1); void say(instruction) }}>↻ Play again</button><button aria-label="Next scene" onClick={() => go.seek(next.id)}>Next world ▶</button></> : <><span aria-hidden="true">🦄 Look for a little horn!</span><span>Zoom +, then slide the picture with your finger.</span></>}</footer>
    <aside className="seek-rotate"><span aria-hidden="true">📱 ↻</span><h2>Turn your phone sideways</h2><p>There’s a whole world to explore!</p><button onClick={() => go.seek()}>‹ Back to scenes</button></aside>
  </main>
}

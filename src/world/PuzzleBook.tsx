// Free-play picture puzzles, alongside the coloring book. No passport stamps required.
import { useEffect, useRef, useState } from 'react'
import { go } from '../router'
import { BigButton, JigsawPuzzle, SayButton, SparklePuppet, say, sounds, useSayOnMount, type PuppetHandle } from '../sdk'
import { BarPill, TopBar } from './kit/Chrome'
import { Flag } from './kit/Flag'
import { WORLD_LINES as L } from './lines'
import { places } from './registry'

const pictures = places.flatMap(({ meta }) => (meta.puzzles ?? []).map(p => ({ ...p, place: meta })))
const counts = [{ rows: 2, cols: 2 }, { rows: 2, cols: 3 }, { rows: 3, cols: 3 }, { rows: 3, cols: 4 }]

export function PuzzleBook({ page }: { page?: string }) {
  const picture = pictures.find(p => p.id === page)
  return picture ? <Puzzle key={picture.id} picture={picture} /> : <Shelf country={page} />
}

function Shelf({ country }: { country?: string }) {
  useSayOnMount(L.puzzlePick)
  const groups = places.filter(({ meta }) => meta.puzzles?.length && (!country || meta.id === country))
  const shown = groups.length ? groups : places.filter(({ meta }) => meta.puzzles?.length)
  return <div className="screen decorated" style={{ padding: 0, overflow: 'hidden' }}>
    <TopBar icon={groups.length && country ? '🗺️' : '🌍'} label={groups.length && country ? 'Back to the country' : 'World map'} onBack={() => go.world(groups.length && country ? country : '')}>
      <BarPill>🧩 Puzzles</BarPill><SayButton text={L.puzzlePick} />
    </TopBar>
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--bar-clear) max(16px, 3vw) 24px' }}>
      <div style={{ maxWidth: 1100, margin: 'auto', display: 'grid', gap: 24 }}>
        {shown.map(({ meta }) => <section key={meta.id}>
          <BarPill style={{ width: 'fit-content', marginBottom: 14 }}><Flag id={meta.flag} width="1.8em" />{meta.name}</BarPill>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 80vw), 1fr))', gap: 16 }}>
            {meta.puzzles?.map(p => <button key={p.id} aria-label={p.name} onClick={() => { sounds.pop(); go.world('puzzles', p.id) }} style={{ background: '#fff', padding: 8, border: '5px solid var(--mint)', borderRadius: 24, boxShadow: 'var(--shadow)' }}>
              <img src={p.img} alt={p.name} style={{ width: '100%', aspectRatio: '1.5', objectFit: 'cover', borderRadius: 16, display: 'block' }} />
              <span style={{ display: 'block', padding: 8, fontSize: 22 }}>{p.name}</span>
            </button>)}
          </div>
        </section>)}
      </div>
    </div>
  </div>
}

function Puzzle({ picture }: { picture: typeof pictures[number] }) {
  const [size, setSize] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const [placed, setPlaced] = useState(0)
  const [round, setRound] = useState(0)
  const puppet = useRef<PuppetHandle>(null)
  const mounted = useRef(true)
  const generation = useRef(0)
  const currentGeneration = generation.current
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  // Jigsaw completion has a delayed callback; guard it when leaving this screen.
  useSayOnMount(L.puzzlePieces)
  const instruction = size === null ? L.puzzlePieces : done ? L.puzzleDone : L.puzzleHow
  return <div className="screen decorated" style={{ padding: 'var(--bar-clear) 16px calc(var(--safe-bottom) + 12px)', overflow: 'hidden' }}>
    <TopBar icon="🧩" label="Back to puzzles" onBack={() => { mounted.current = false; go.world('puzzles', picture.place.id) }}>
      <BarPill>{size === null ? '🧩' : `${placed}/${counts[size].rows * counts[size].cols}`}<SayButton text={instruction} /></BarPill>
    </TopBar>
    {size === null ? <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'min(24px, 3vh)' }}>
      <img src={picture.img} alt={picture.name} style={{ width: 'min(760px, 90vw, 70vh)', maxHeight: '48%', objectFit: 'contain', borderRadius: 24, boxShadow: 'var(--shadow)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><SparklePuppet height="min(150px, 15vh)" /><span style={{ fontSize: 'clamp(20px, 3vw, 30px)' }}>How many pieces?</span></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {counts.map((c, i) => <button key={i} aria-label={`${c.rows * c.cols} pieces`} onClick={() => { setSize(i); sounds.pop(); const version = generation.current; void say(L.puzzleCounts[i]).then(() => { if (mounted.current && generation.current === version) void say(L.puzzleHow) }) }} style={{ width: 'clamp(88px, 14vw, 132px)', minHeight: 100, background: 'var(--mint)', border: '4px solid #fff', borderRadius: 22, boxShadow: 'var(--shadow)', fontSize: 28 }}>
          <span aria-hidden style={{ display: 'grid', gridTemplateColumns: `repeat(${c.cols}, 1fr)`, gap: 3, width: 48, margin: '0 auto 6px' }}>{Array.from({ length: c.rows * c.cols }, (_, n) => <span key={n} style={{ height: 10, background: 'var(--lavender-dark)', borderRadius: 2 }} />)}</span>{c.rows * c.cols}
        </button>)}
      </div>
    </div> : <>
      <div style={{ flex: 1, minHeight: 0 }}><JigsawPuzzle key={`${size}-${round}`} img={picture.img} {...counts[size]} onSnap={n => { setPlaced(n); void puppet.current?.play('nod') }} onMiss={() => { void say(L.puzzleMiss); void puppet.current?.play('think') }} onDone={() => { if (!mounted.current || generation.current !== currentGeneration) return; setDone(true); void say(L.puzzleDone); void puppet.current?.play('cheer') }} /></div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexShrink: 0, minHeight: 96 }}>
        <SparklePuppet ref={puppet} height="96px" />
        {done ? <BigButton onClick={() => { setDone(false); setPlaced(0); setRound(n => n + 1); void say(L.puzzleHow) }}>↻ Play again</BigButton> : <SayButton text={L.puzzleHint} />}
        <BigButton onClick={() => { generation.current++; setSize(null); setDone(false); setPlaced(0); setRound(n => n + 1); void say(L.puzzlePieces) }}>🧩 Pieces</BigButton>
      </div>
    </>}
  </div>
}

// #/world/puppets: every puppet with buttons for its actions and lines, for building and QA-ing characters.
// Each country lists its puppets in places/<id>/puppets/index.ts. QA can drive them: window.__puppets[id].play('hop').
// #/world/puppets/mascot shows only Sparkle's three resting <Mascot> poses (menus use them; tests/sparkle.spec.ts and
// scripts/qa-sparkle.mjs --export-reference read them).
import { useEffect, useRef, useState } from 'react'
import { lineText, Mascot, say, sounds, type Line, type MascotPose, type PuppetHandle } from '../sdk'
import type { PuppetEntry } from './types'

const modules = import.meta.glob<{ PUPPETS: PuppetEntry[] }>(['./places/*/puppets/index.ts', './kit/puppets.ts'], { eager: true })
const ALL = Object.values(modules).flatMap((m) => m.PUPPETS)

declare global {
  interface Window {
    __puppets?: Record<string, PuppetHandle | null>
  }
}

export function PuppetLab({ only }: { only?: string }) {
  const [bg, setBg] = useState(0)
  const list = only ? ALL.filter((p) => p.id === only) : ALL
  const poses = !only || only === 'mascot'
  const backgrounds = ['#FFF7F0', '#FFE9A8', '#A8DCFF', '#2d2a4a']
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', background: backgrounds[bg], padding: 'calc(var(--safe-top) + 100px) 16px 40px' }}>
      <button onClick={() => setBg((bg + 1) % backgrounds.length)} style={{ position: 'fixed', right: 16, top: 16, zIndex: 5, padding: '10px 18px', borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow)', fontWeight: 700 }}>
        🎨 background
      </button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
        {poses && <MascotPoses />}
        {list.map((p) => (
          <Card key={p.id} entry={p} big={!!only} />
        ))}
      </div>
    </div>
  )
}

function Card({ entry, big }: { entry: PuppetEntry; big: boolean }) {
  const ref = useRef<PuppetHandle>(null)
  const [line, setLine] = useState(0)
  const height = big ? (entry.id.startsWith('sparkle') ? 'min(60vh, 640px, 84vw)' : 'min(60vh, 640px)') : '300px'
  useEffect(() => {
    ;(window.__puppets ??= {})[entry.id] = ref.current
    return () => {
      if (window.__puppets) delete window.__puppets[entry.id]
    }
  })
  const talk = (l: Line) => void say(l)
  return (
    <div data-puppet={entry.id} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 28, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: big ? 'min(92vw, 900px)' : 360 }}>
      <b style={{ fontSize: 24 }}>{entry.name}</b>
      <div style={{ height, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>{entry.render(ref, height)}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {entry.actions.map((a) => (
          <button key={a} aria-label={`${entry.id} ${a}`} onClick={() => (sounds.pop(), void ref.current?.play(a))} style={{ padding: '10px 16px', borderRadius: 999, background: 'var(--pink)', color: '#fff', fontWeight: 700 }}>
            {a}
          </button>
        ))}
        {entry.lines?.length ? (
          <button
            aria-label={`${entry.id} talk`}
            onClick={() => {
              talk(entry.lines![line % entry.lines!.length])
              setLine(line + 1)
            }}
            style={{ padding: '10px 16px', borderRadius: 999, background: 'var(--lavender-dark)', color: '#fff', fontWeight: 700 }}
            title={lineText(entry.lines[line % entry.lines.length])}
          >
            🗣️ talk
          </button>
        ) : null}
      </div>
    </div>
  )
}

const POSES: MascotPose[] = ['wave', 'cheer', 'think']

/** The menus' square Sparkle in each of her resting poses, in this order. */
function MascotPoses() {
  return (
    <div data-puppet="mascot" style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 28, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <b style={{ fontSize: 24 }}>Mascot poses</b>
      <div style={{ display: 'flex', gap: 12 }}>
        {POSES.map((pose) => (
          <Mascot key={pose} pose={pose} size={200} bounce={false} appear={false} />
        ))}
      </div>
    </div>
  )
}

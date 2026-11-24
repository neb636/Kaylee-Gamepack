// The labs' shared top bar: one strip across every lab (characters, camera, feel, dialogue) with a tab for each, so the
// four feel like one place instead of four links. Each tab keeps your place: camera and feel open on the scene you're
// on (the game keeps running: World.tsx keeps its element), dialogue opens that game's script, characters the last one
// you looked at. #/world/lab opens the lab you used last. For you, not for Kaylee.
import { useEffect } from 'react'
import { go, worldLink } from '../../router'
import { isFeelParam } from '../kit/knobs'
import { firstScene, sceneHere } from './ScenePicker'
import './lab.css'

export type LabTab = 'characters' | 'camera' | 'feel' | 'dialogue'

const TABS: { id: LabTab; icon: string; label: string; tip: string }[] = [
  {
    id: 'characters',
    icon: '🦄',
    label: 'Characters',
    tip: 'Every 3D character on a turntable',
  },
  {
    id: 'camera',
    icon: '🎥',
    label: 'Camera',
    tip: 'Find the best camera for a scene',
  },
  {
    id: 'feel',
    icon: '🎛️',
    label: 'Feel',
    tip: 'Tune how a game feels while you play it',
  },
  {
    id: 'dialogue',
    icon: '💬',
    label: 'Dialogue',
    tip: "Read a game's script and hear it",
  },
]

/** The countries built in 3D: the camera lab only has a camera to move there. */
const THREE_D = ['thailand', 'canada', 'poles']

interface Scene {
  place: string
  activity: string
  section?: string
}
interface Memory {
  tab?: LabTab
  scene?: Scene
  character?: string
  dialogue?: { place: string; group?: string }
}

// Where you were in each lab, kept in this browser (the labs work without it).
const KEY = 'kaylee.labs'
function recall(): Memory {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Memory
  } catch {
    return {}
  }
}
function remember(patch: Memory) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...recall(), ...patch }))
  } catch {
    /* private mode: nothing to keep */
  }
}

/** The lab params (?cam=1, cam.*, ?feel=1, feel.*) and the game's own state stay apart: switching labs keeps the
 *  game's state and drops the other lab's. */
const gameState = (params: Record<string, string>) =>
  Object.fromEntries(Object.entries(params).filter(([k]) => k !== 'cam' && !k.startsWith('cam.') && !isFeelParam(k)))

/** The scene on screen right now (its live section, not just the link's), if a game is open. A bare country link
 *  (#/world/canada) is its Home base. */
function sceneNow(place?: string, activity?: string): Scene | undefined {
  if (!place) return undefined
  const here = sceneHere(place)
  const a = here.activity ?? activity
  return a ? { place, activity: a, section: here.section } : undefined
}

/** The game's state as the address bar has it now: a game writes its sections' state there as she plays
 *  (replaceState), so the route's params can be the link it was opened from. */
const liveParams = () => Object.fromEntries(new URLSearchParams(location.hash.split('?')[1] ?? ''))

/** A guess at a game's block in lines.ts: `mall-trip` / `barber` → `mall.barber` (the dialogue lab falls back to `mall`,
 *  then to the country's first game). */
const groupFor = (s: Scene) => {
  const base = s.activity.replace(/-trip$/, '')
  return s.section ? `${base}.${s.section}` : base
}

export function labLink(tab: LabTab, here: { place?: string; activity?: string }, active?: LabTab): string {
  const mem = recall()
  const onGame = active === 'camera' || active === 'feel'
  const scene = onGame ? sceneNow(here.place, here.activity) : undefined
  const state = onGame ? gameState(liveParams()) : {}
  const sceneLink = (s: Scene, params: Record<string, string>) => worldLink(s.place, s.activity, s.section, params)
  switch (tab) {
    case 'characters':
      return `#/world/characters${mem.character ? `/${encodeURIComponent(mem.character)}` : ''}`
    case 'camera': {
      if (scene && THREE_D.includes(scene.place)) return sceneLink(scene, { ...state, cam: '1' })
      const last = mem.scene && THREE_D.includes(mem.scene.place) ? mem.scene : undefined
      const s =
        last ??
        (() => {
          const f = firstScene('thailand')
          return f ? { place: 'thailand', ...f } : undefined
        })()
      return s ? sceneLink(s, { cam: '1' }) : '#/world?feel=1'
    }
    case 'feel': {
      if (scene) return sceneLink(scene, { ...state, feel: '1' })
      return mem.scene ? sceneLink(mem.scene, { feel: '1' }) : '#/world?feel=1'
    }
    case 'dialogue': {
      if (scene) return `#/world/dialogue/${encodeURIComponent(scene.place)}/${encodeURIComponent(groupFor(scene))}`
      const d = mem.dialogue ?? (mem.scene ? { place: mem.scene.place, group: groupFor(mem.scene) } : undefined)
      return d ? `#/world/dialogue/${encodeURIComponent(d.place)}${d.group ? `/${encodeURIComponent(d.group)}` : ''}` : '#/world/dialogue'
    }
  }
}

export function LabBar({ active, place, activity, section }: { active: LabTab; place?: string; activity?: string; section?: string }) {
  // Keep where you are, so the other tabs (and #/world/lab next time) come back to it.
  useEffect(() => {
    if (active === 'characters') remember({ tab: active, ...(activity ? { character: activity } : {}) })
    else if (active === 'dialogue')
      remember({
        tab: active,
        ...(activity ? { dialogue: { place: activity, group: section } } : {}),
      })
    else {
      const s = sceneNow(place, activity)
      remember({ tab: active, ...(s ? { scene: s } : {}) })
    }
  }, [active, place, activity, section])

  const here = { place, activity }
  return (
    <header className="lab-bar">
      <button className="lab-home" aria-label="Back to the world map" title="Back to the world map" onClick={() => go.world()}>
        <span aria-hidden="true">🌍</span>
      </button>
      <strong className="lab-name">Lab</strong>
      <nav className="lab-tabs" role="tablist" aria-label="Labs">
        {TABS.map((t) => (
          <a
            key={t.id}
            role="tab"
            aria-selected={t.id === active}
            className="lab-tab"
            title={t.tip}
            href={labLink(t.id, here, active)}
            onClick={(e) => {
              // Re-reads the live section at the moment of the tap (the href was built at the last render).
              e.preventDefault()
              if (t.id !== active) location.hash = labLink(t.id, here, active)
            }}
          >
            <span aria-hidden="true">{t.icon}</span>
            <span className="lab-tab-label">{t.label}</span>
          </a>
        ))}
      </nav>
    </header>
  )
}

/** #/world/lab: the lab you used last (the character lab the first time). */
export function LabStart() {
  useEffect(() => {
    const tab = recall().tab ?? 'characters'
    location.replace(labLink(tab, {}))
  }, [])
  return null
}

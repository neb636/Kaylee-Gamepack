// Around the World: the shell section with the world map, the passport, the coloring book, the theater and every country
// (and the labs: 2D puppets, 3D characters, the camera lab, the feel lab, the dialogue lab, under one lab bar).
import { lazy, Suspense, useMemo, useState } from 'react'
import { go } from '../router'
import { PuzzleBook } from './PuzzleBook'
import { ColoringBook } from './ColoringBook'
import { Theater } from './kit/Theater'
import { Passport } from './Passport'
import { PlaceFrame } from './PlaceFrame'
import { PuppetLab } from './PuppetLab'
import { DockGlyph, worldBack } from './HomeIcons'
import { SectionIndex } from './SectionIndex'
import { isFeelParam } from './kit/knobs'
import type { LabTab } from './labs/LabBar'
import { places } from './registry'
import { WorldMap } from './WorldMap'
import './world.css'

// The 3D character lab (#/world/characters/<id>): loaded on demand, so only it downloads three.js.
const CharacterLab = lazy(() => import('./places/thailand/lab/CharacterLab'))
// The camera lab (?cam=1 on any section of a 3D country): the game in an iPad-sized frame with camera controls beside it.
const CameraLab = lazy(() => import('./labs/camera/CameraLab'))
// The feel lab (?feel=1 on any section): sliders over the playing game for every knob it declares (kit/knobs.ts).
const FeelLab = lazy(() => import('./labs/feel/FeelLab'))
const FeelStart = lazy(() => import('./labs/feel/FeelStart'))
// The dialogue lab (#/world/dialogue/<place>/<group>): read a mini-game's script and hear every line in its voice.
const DialogueLab = lazy(() => import('./labs/dialogue/DialogueLab'))
// The bar over every lab with a tab for each (labs/LabBar.tsx), and #/world/lab (the lab you used last).
const LabBar = lazy(() => import('./labs/LabBar').then((m) => ({ default: m.LabBar })))
const LabStart = lazy(() => import('./labs/LabBar').then((m) => ({ default: m.LabStart })))

/** The labs' own params (?cam=1, cam.*, ?feel=1, feel.*): never part of the game's state. */
const isLab = (k: string) => k === 'cam' || k.startsWith('cam.') || isFeelParam(k)

export function World({ place, activity, section, params = {} }: { place?: string; activity?: string; section?: string; params?: Record<string, string> }) {
  // The screen always lives in the same element, so opening or closing the camera lab around it never restarts the game.
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const gameParams = useMemo(() => Object.fromEntries(Object.entries(params).filter(([k]) => !isLab(k))), [params])
  let lab = false
  let feel = false
  let screen
  // Which lab is open (its tab lit in the shared lab bar), if any.
  let tab: LabTab | undefined
  if (place === 'lab')
    screen = (
      <Suspense fallback={null}>
        <LabStart />
      </Suspense>
    )
  else if (place === 'passport') screen = <Passport />
  else if (place === 'puppets') screen = <PuppetLab only={activity} />
  else if (place === 'characters') {
    tab = 'characters'
    screen = (
      <Suspense fallback={null}>
        <CharacterLab id={activity} params={params} />
      </Suspense>
    )
  } else if (place === 'dialogue') {
    tab = 'dialogue'
    screen = (
      <Suspense fallback={null}>
        <DialogueLab place={activity} group={section} />
      </Suspense>
    )
  } else if (place === 'sections') screen = <SectionIndex />
  else if (place === 'puzzles') screen = <PuzzleBook page={activity} />
  else if (place === 'coloring') screen = <ColoringBook page={activity} />
  else if (place === 'theater') screen = <Theater places={places.map((p) => p.meta).filter((m) => m.videos?.length)} onExit={() => go.world()} exitIcon={worldBack.icon} exitTile={worldBack.tile} exitLabel="World map" title={<><DockGlyph kind="theater" /> Theater</>} />
  else if (place) {
    screen = <PlaceFrame id={place} activity={activity} section={section} params={gameParams} />
    lab = params.cam !== undefined
    feel = params.feel !== undefined
    tab = lab ? 'camera' : feel ? 'feel' : undefined
  } else if (params.feel !== undefined && params.view === undefined) {
    tab = 'feel'
    screen = (
      <Suspense fallback={null}>
        <FeelStart />
      </Suspense>
    )
  } else {
    // The home screen. Its globe has feel knobs too (#/world?view=map&feel=1).
    screen = <WorldMap view={params.view} />
    feel = params.feel !== undefined
    tab = feel ? 'feel' : undefined
  }
  // In a lab the shared bar sits on top and the world (the game, or the lab's own page) fills the rest. The game's element
  // (`host`) stays the same element either way, so switching between the camera and feel labs never restarts it.
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        ['--lab-bar-h' as string]: 'calc(env(safe-area-inset-top, 0px) + 52px)',
      }}
    >
      {tab && (
        <Suspense fallback={null}>
          <LabBar active={tab} place={place} activity={activity} section={section} />
        </Suspense>
      )}
      <div
        className="world"
        style={{
          position: 'absolute',
          inset: 0,
          ...(tab ? { top: 'var(--lab-bar-h)', ['--safe-top' as string]: '0px' } : {}),
        }}
      >
        <div ref={setHost} style={{ position: 'absolute', inset: 0 }}>
          {screen}
        </div>
        {lab && host && (
          <Suspense fallback={null}>
            <CameraLab place={place!} params={params} host={host} />
          </Suspense>
        )}
        {feel && (
          <Suspense fallback={null}>
            <FeelLab place={place} />
          </Suspense>
        )}
      </div>
    </div>
  )
}

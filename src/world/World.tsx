// Around the World: the shell section with the world map, the passport, the coloring book, the theater and every country
// (and the labs: 2D puppets, 3D characters, the camera lab).
import { lazy, Suspense, useMemo, useState } from 'react'
import { go } from '../router'
import { PuzzleBook } from './PuzzleBook'
import { ColoringBook } from './ColoringBook'
import { Theater } from './kit/Theater'
import { Passport } from './Passport'
import { PlaceFrame } from './PlaceFrame'
import { PuppetLab } from './PuppetLab'
import { SectionIndex } from './SectionIndex'
import { places } from './registry'
import { WorldMap } from './WorldMap'
import './world.css'

// The 3D character lab (#/world/characters/<id>): loaded on demand, so only it downloads three.js.
const CharacterLab = lazy(() => import('./places/thailand/lab/CharacterLab'))
// The camera lab (?cam=1 on any section of a 3D country): the game in an iPad-sized frame with camera controls beside it.
const CameraLab = lazy(() => import('./places/thailand/lab/camera/CameraLab'))

/** The camera lab's own params (?cam=1, cam.*): never part of the game's state. */
const isCam = (k: string) => k === 'cam' || k.startsWith('cam.')

export function World({ place, activity, section, params = {} }: { place?: string; activity?: string; section?: string; params?: Record<string, string> }) {
  // The screen always lives in the same element, so opening or closing the camera lab around it never restarts the game.
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const gameParams = useMemo(() => Object.fromEntries(Object.entries(params).filter(([k]) => !isCam(k))), [params])
  let lab = false
  let screen
  if (place === 'passport') screen = <Passport />
  else if (place === 'puppets') screen = <PuppetLab only={activity} />
  else if (place === 'characters')
    screen = (
      <Suspense fallback={null}>
        <CharacterLab id={activity} params={params} />
      </Suspense>
    )
  else if (place === 'sections') screen = <SectionIndex />
  else if (place === 'puzzles') screen = <PuzzleBook page={activity} />
  else if (place === 'coloring') screen = <ColoringBook page={activity} />
  else if (place === 'theater') screen = <Theater places={places.map((p) => p.meta).filter((m) => m.videos?.length)} onExit={() => go.world()} exitIcon="🌍" exitLabel="World map" title="🎬 Theater" />
  else if (place) {
    screen = <PlaceFrame id={place} activity={activity} section={section} params={gameParams} />
    lab = params.cam !== undefined
  } else screen = <WorldMap />
  return (
    <div className="world" style={{ position: 'absolute', inset: 0 }}>
      <div ref={setHost} style={{ position: 'absolute', inset: 0 }}>
        {screen}
      </div>
      {lab && host && (
        <Suspense fallback={null}>
          <CameraLab place={place!} params={params} host={host} />
        </Suspense>
      )}
    </div>
  )
}
